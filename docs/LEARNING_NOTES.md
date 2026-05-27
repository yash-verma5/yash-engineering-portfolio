# Learning Notes

These notes are written for a developer who did not build this codebase.

## 1. Sticky Canvas Scrollytelling

Related files:
- `components/ScrollyCanvas.tsx`
- `components/Overlay.tsx`
- `lib/sequence.ts`
- `public/sequence/`
- `public/sequence-konami/`

Entry point:
- `app/page.tsx` mounts `<ScrollyCanvas />`.

### What Problem It Solves

The portfolio needs a cinematic hero where scrolling scrubs through image frames. A normal video is not precise enough for frame-accurate scroll control, and CSS background images would be inefficient for rapid frame updates.

### Why This Approach Was Chosen

The app uses an HTML5 canvas because:
- Canvas can redraw a frame quickly without remounting DOM nodes.
- Scroll progress can map directly to an image index.
- It avoids video playback controls, buffering behavior, and timeline mismatch.

The sticky layout is:

```text
outer div: relative h-[500vh]
  sticky div: sticky top-0 h-screen w-full overflow-hidden
    canvas: w-full h-full
```

This keeps the visual pinned while the user scrolls through a long track.

### Execution Flow

1. `useScroll({ target: containerRef })` calculates progress across the 500vh container.
2. Progress is clamped between `0` and `1`.
3. Frame index is calculated with `Math.floor(progress * totalFrames)`.
4. The selected image is drawn with `ctx.drawImage()`.
5. `drawCover()` crops the source image so it behaves like `object-fit: cover`.

### Important Concepts

- `useRef`: stores canvas, sticky container, cached image arrays, RAF handle.
- `useCallback`: stabilizes functions used in effects.
- `useMotionValueEvent`: subscribes to scroll progress changes.
- `requestAnimationFrame`: schedules actual canvas drawing.
- Canvas internal dimensions must match viewport size, not just CSS size.

### Alternatives

- `<video>` with scroll-controlled currentTime:
  - Easier, but browser video seeking can stutter and is less deterministic.
- CSS background-image swapping:
  - Simple, but expensive and flickery for many frames.
- WebGL/Three.js texture animation:
  - More powerful, but unnecessary complexity for this portfolio.

### Common Mistakes to Avoid

- Do not call bare `useScroll()` for this hero. It must target the 500vh container.
- Do not put sticky elements inside an ancestor with `overflow: hidden`, `auto`, or `clip` unless that ancestor is the sticky viewport itself.
- Do not resize only CSS width/height; update `canvas.width` and `canvas.height` too.
- Do not load frames on demand during scroll. It causes white flashes.
- Do not transform the canvas element for frame updates. Redraw the pixels only.

### Debugging Tips

- Temporarily show scroll progress and frame index in a fixed debug pill.
- Check whether the sticky parent is a direct child of the 500vh scroll track.
- If sticky fails, inspect ancestors for overflow rules.
- If frames flash white, verify preload completion and URLs in Network tab.
- If frames look stretched, inspect `drawCover()` and canvas dimensions.

## 2. Dual Sequence and Konami Mode

Related files:
- `components/KonamiProvider.tsx`
- `components/EasterEggController.tsx`
- `components/ScrollyCanvas.tsx`
- `components/Overlay.tsx`
- `lib/sequence.ts`
- `app/globals.css`

### What Problem It Solves

The site needs a hidden alternate mode triggered by the Konami code. This mode should change the visual theme and the canvas sequence without replacing the hero architecture.

### Why This Approach Was Chosen

A global React context was introduced so mode state is shared cleanly. Without it, `EasterEggController`, `ScrollyCanvas`, `Overlay`, and CSS theme logic would need ad hoc state or custom events.

### Execution Flow

1. User enters the Konami code.
2. `EasterEggController` detects the key sequence.
3. It calls `activate()` from `useKonamiMode()`.
4. `KonamiProvider` sets `active=true`, starts a 30-second countdown, and adds `konami-active` to `<html>`.
5. `ScrollyCanvas` switches active sequence key from `default` to `konami`.
6. `Overlay` switches copy blocks.
7. CSS applies the alternate theme.
8. Timer expires or user clicks restore.
9. `deactivate()` removes the root theme and returns to the default sequence.

### Important Concepts

- React Context for global UI state.
- Timer cleanup with refs.
- Root class theme toggling.
- Canvas sequence cache stored in refs.
- Lazy preload via idle callback fallback.

### Alternatives

- URL query state like `?mode=konami`:
  - Good for shareable state, but not necessary for an Easter egg.
- Zustand or Redux:
  - Overkill for a single boolean/timer state.
- Custom DOM events:
  - Works, but less explicit and harder to type/test.

### Common Mistakes to Avoid

- Do not create separate canvas components for each mode. It risks duplicated scroll logic.
- Do not start multiple countdown intervals on repeated activation.
- Do not forget to remove root classes on cleanup.
- Do not reload the default sequence when leaving Konami mode if it is already cached.
- Do not make the visual mode too loud; it should stay premium.

### Debugging Tips

- In DevTools, verify `<html>` gets `class="konami-active"` and `data-theme="konami"`.
- Check Network tab for `/sequence-konami/00001.png` through the configured range.
- If the sequence does not switch, inspect `activeKey` in `ScrollyCanvas`.
- If the timer keeps running, inspect `intervalRef` cleanup in `KonamiProvider`.

## 3. Data-Driven Portfolio Content

Related files:
- `lib/content.ts`
- `components/ProfileSections.tsx`
- `components/Projects.tsx`
- `components/Contact.tsx`
- `components/Navbar.tsx`
- `components/Overlay.tsx`

### What Problem It Solves

Portfolio content should be easy to edit without hunting through layout components. This matters because profile copy, links, project cards, and experience bullets change more often than the UI structure.

### Why This Approach Was Chosen

A single TypeScript data file keeps content centralized while preserving type inference in consuming components.

### Execution Flow

1. `lib/content.ts` exports structured objects and arrays.
2. Components import the needed content.
3. Components map arrays into sections/cards/nav items.
4. Updating copy or links usually only requires editing `lib/content.ts`.

### Alternatives

- CMS:
  - Better for non-developer editing, but adds hosting/API complexity.
- JSON files:
  - Good, but TypeScript exports are easier to reference and compose.
- Hardcoded JSX:
  - Fast initially, but hard to maintain.

### Common Mistakes to Avoid

- Do not put confidential enterprise details in public copy.
- Do not let content arrays drift from component expectations.
- Keep placeholder links explicitly marked so they are easy to find.

### Debugging Tips

- Search for `placeholder: true` to find incomplete links.
- Search for old template words like `Creative Developer` if content feels generic.
- TypeScript will catch many missing property issues if content shapes are preserved.

## 4. Horizontal Pinned Projects

Related files:
- `components/Projects.tsx`
- `lib/content.ts`

### What Problem It Solves

Project cards need to feel premium and break vertical-scroll monotony on desktop, while still remaining readable on mobile.

### Why This Approach Was Chosen

The desktop version maps vertical scroll progress to horizontal track movement. Mobile uses a standard grid because horizontal pinning plus canvas plus smooth scrolling can be heavy on small devices.

### Execution Flow

1. `Projects` creates a tall desktop scroll section.
2. Sticky child pins the viewport.
3. Track width is measured.
4. Scroll progress maps to negative x translation.
5. Cards tilt based on mouse position.

### Important Concepts

- Framer Motion `useScroll`
- `useTransform`
- `useSpring`
- DOM measurement with refs
- Responsive rendering with Tailwind classes

### Alternatives

- GSAP ScrollTrigger:
  - Excellent for pinned scroll, but adds another dependency.
- Native horizontal scroll:
  - Accessible and simpler, but less cinematic.
- Static grid:
  - Mobile fallback already uses this.

### Common Mistakes to Avoid

- Do not use desktop horizontal pinning on mobile without testing performance.
- Recalculate travel distance on resize.
- Keep cards data-driven.

### Debugging Tips

- Inspect `track.scrollWidth` versus `window.innerWidth`.
- Temporarily disable Lenis if scroll syncing feels odd.
- Confirm `.project-card` exists if the cursor does not switch to `VIEW`.

## 5. Custom Cursor

Related files:
- `components/CustomCursor.tsx`
- `components/Projects.tsx`

### What Problem It Solves

The custom cursor adds a premium interactive layer and gives project cards a distinct `VIEW` affordance.

### Why This Approach Was Chosen

Framer Motion springs create smooth lag and trailing motion with little code.

### Important Concepts

- Hooks must be top-level.
- Motion values can be shared by multiple springs.
- Cursor should be disabled on touch devices.

### Common Mistakes to Avoid

- Never call `useSpring` inside `.map()` or a conditional.
- Avoid custom cursors on touch/coarse pointer devices.
- Keep pointer-events disabled on cursor wrappers.

## 6. Lenis Smooth Scroll

Related files:
- `components/LenisProvider.tsx`
- `app/layout.tsx`

### What Problem It Solves

Lenis makes scroll feel smoother and more premium, especially through pinned sections and the canvas hero.

### Why This Approach Was Chosen

Lenis is lightweight and simple to integrate with a root client provider.

### Common Mistakes to Avoid

- Do not combine Lenis with CSS `scroll-behavior: smooth` for the same interactions.
- Avoid scroll containers that fight with the document scroll.
- If debugging scroll behavior, temporarily disable Lenis.

## 7. Contact Form

Related files:
- `components/Contact.tsx`
- `lib/content.ts`

### What Problem It Solves

The contact section provides real contact information and a polished form-like interaction.

### Current Limitation

The form is local-only. It does not send email or submit to an API.

### Alternatives

- `mailto:` link only.
- Formspree/Resend/EmailJS integration.
- Next.js route handler with email provider.

### Common Mistakes to Avoid

- Do not imply the form sends email unless it actually does.
- Keep direct email visible.
- Validate real sending once a backend is added.

