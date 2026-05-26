# My Learnings

This document teaches the main concepts used in the portfolio through examples from this repository.

## Next.js App Router

### Concept

The App Router uses the `app/` directory. Files like `layout.tsx` and `page.tsx` define route shells and route content.

### In This Project

- `app/layout.tsx` is the root shell. It imports global CSS and wraps the app with providers (`app/layout.tsx:20-21`).
- `app/page.tsx` is the `/` homepage and composes the entire portfolio (`app/page.tsx:42-60`).

### Why This Was Chosen

A one-page portfolio benefits from App Router because the structure is simple, metadata is colocated, and static generation works by default.

### Alternatives

- Pages Router (`pages/index.tsx`): older but still valid.
- Separate routes for each section: better for large sites, unnecessary here.

### Tradeoffs

- App Router defaults to Server Components, so browser-only behavior must be isolated in client components.
- One long page is easy to navigate but can become heavy if every interaction runs at once.

### Debugging Tips

- If a component uses `window`, `document`, hooks, or event listeners, it needs `"use client"`.
- If metadata does not update, check `app/layout.tsx` first.

## Client vs Server Components

### Concept

Server Components render without browser APIs. Client Components can use state, effects, event handlers, and browser APIs.

### In This Project

Most interactive files start with `"use client"`, including:

- `ScrollyCanvas` for canvas, images, resize, and scroll subscriptions (`components/ScrollyCanvas.tsx:1`).
- `Navbar` for scroll listeners and tap activation (`components/Navbar.tsx:1`).
- `KonamiProvider` for DOM class mutation (`components/KonamiProvider.tsx:1`).
- `CustomCursor` for mouse events (`components/CustomCursor.tsx:1`).

`app/page.tsx` can remain a Server Component because it only composes imported components.

### Why This Was Chosen

Browser-only animation code is isolated in the components that need it. The page composition stays clean.

### Alternatives

- Make the entire page a Client Component. Easier, but less aligned with App Router defaults.
- Move browser code into custom hooks used only by client components.

### Tradeoffs

- More client components means more JavaScript shipped.
- Keeping data files pure TypeScript avoids unnecessary client logic.

### Debugging Tips

- Error: `window is not defined` usually means browser code ran in a Server Component or during SSR.
- Error: context hook throws means provider is missing above the component tree.

## Component Composition

### Concept

Build the page out of specialized, reusable components instead of one large file.

### In This Project

`app/page.tsx:45-58` composes:

- Global layers: `Navbar`, `CustomCursor`, `EasterEggController`.
- Hero: `ScrollyCanvas` plus `Overlay` inside it.
- Bridge: `KineticMarquee`.
- Content: profile sections, projects, contact.

### Why This Was Chosen

Each component has a clear job. Canvas logic does not leak into contact form code. Content sections do not know about Konami mode.

### Alternatives

- One large page file: faster to start, harder to maintain.
- Route-based sections: better for multi-page sites.

### Tradeoffs

- More files to navigate.
- Shared concepts like animation timing can become scattered if not documented.

### Debugging Tips

- Start from `app/page.tsx` to understand render order.
- Then follow props and imports.

## Centralized Content

### Concept

Put editable text/data in one configuration file rather than hardcoding it throughout components.

### In This Project

`lib/content.ts` exports `profile`, `navItems`, `projects`, `experience`, and more (`lib/content.ts:62-250`). Components map these arrays into UI.

### Why This Was Chosen

The portfolio should be easy to update without digging through animation-heavy JSX.

### Alternatives

- Markdown/MDX content files.
- CMS such as Sanity or Contentful.
- Hardcoded component copy.

### Tradeoffs

- TypeScript data is simple but not editor-friendly for non-developers.
- No validation layer yet.

### Debugging Tips

- Broken nav? Compare `navItems` IDs (`lib/content.ts:85-94`) with rendered section IDs.
- Broken project links? Check `projects[].links`.

## React Context

### Concept

Context shares state across distant components without prop drilling.

### In This Project

`KonamiProvider` stores `active`, `countdown`, `activate`, and `deactivate` (`components/KonamiProvider.tsx:14-19`). `useKonamiMode()` exposes that state (`components/KonamiProvider.tsx:79-87`).

Consumers:

- `ScrollyCanvas` switches sequence based on `active` (`components/ScrollyCanvas.tsx:77-79`).
- `Overlay` swaps copy (`components/Overlay.tsx:465-466`).
- `EasterEggController` activates/deactivates (`components/EasterEggController.tsx:129`).
- `Navbar` activates after five taps (`components/Navbar.tsx:9`, `components/Navbar.tsx:57-60`).

### Why This Was Chosen

Konami mode affects multiple unrelated components. Context is lightweight and built into React.

### Alternatives

- Zustand or Redux.
- URL query state.
- Custom DOM events.

### Tradeoffs

- Context changes re-render consumers.
- DOM side effects inside context need careful cleanup.

### Debugging Tips

- If Konami styles remain stuck, inspect `<html>` for `.konami-active`.
- If activation does nothing, confirm the component is inside `KonamiProvider`.

## Framer Motion

### Concept

Framer Motion provides declarative animations, motion values, spring physics, scroll progress, and presence animations.

### In This Project

Used for:

- Navbar entrance and active pill layout animation (`components/Navbar.tsx:72-75`, `components/Navbar.tsx:110-113`).
- Hero loader fade (`components/ScrollyCanvas.tsx:314-338`).
- Overlay scroll transforms (`components/Overlay.tsx:402-425`).
- Project horizontal scroll and card tilt (`components/Projects.tsx:598-601`, `components/Projects.tsx:755-756`).
- Custom cursor trails (`components/CustomCursor.tsx:277-287`).
- Marquee motion (`components/KineticMarquee.tsx:457-477`).

### Why This Was Chosen

It gives smooth UI animation without manually managing every frame. Motion values can update outside React render, which matters for scroll and mouse movement.

### Alternatives

- GSAP: stronger for complex timeline/pinning orchestration.
- CSS transitions/animations: lighter but less dynamic.
- Raw `requestAnimationFrame`: maximum control, more code.

### Tradeoffs

- Easy to overuse.
- Some animated properties like `filter`, `width`, and `height` can be expensive.

### Debugging Tips

- Prefer transform and opacity.
- Use DevTools Performance panel to look for layout/paint spikes.
- If scroll animation feels wrong, inspect which element `useScroll` targets.

## Motion Values

### Concept

Motion values are mutable animated values that update without causing React re-renders.

### In This Project

`CustomCursor` stores pointer position as `mouseX` and `mouseY` motion values (`components/CustomCursor.tsx:277-278`). `Projects` stores card tilt as `rotateX` and `rotateY` (`components/Projects.tsx:598-599`).

### Why This Was Chosen

Pointer movement can fire many times per second. Updating React state every event would cause jank.

### Alternatives

- React state: simpler, but expensive for continuous motion.
- CSS variables updated directly: fast but less integrated with Framer springs.

### Tradeoffs

- Motion values are less visible in React DevTools.
- You need to reason about refs and subscriptions.

### Debugging Tips

- If motion does not update, confirm the value is passed into `style` on a `motion.*` element.
- Log `.get()` sparingly; do not log every frame.

## `useScroll`

### Concept

`useScroll` creates motion values for scroll progress. It can track the window or a target element.

### In This Project

The hero uses target-based scroll:

```ts
useScroll({ target: containerRef, offset: ["start start", "end end"] })
```

This appears at `components/ScrollyCanvas.tsx:101-104`. Projects uses the same pattern for its horizontal section (`components/Projects.tsx:735-738`).

### Why This Was Chosen

Window-level progress would be wrong because projects and contact exist below the hero. Target progress lets each scroll-driven section own its own timeline.

### Alternatives

- GSAP ScrollTrigger.
- Manual scroll math with `getBoundingClientRect`.
- IntersectionObserver for coarse reveals.

### Tradeoffs

- Sticky and scroll target layout must be correct.
- Ancestor overflow can break sticky behavior.

### Debugging Tips

- Temporarily render `scrollYProgress.get().toFixed(2)`.
- Confirm the target element has enough height (`h-[500vh]`, `h-[420vh]`).
- Remove root `overflow-hidden` if sticky fails.

## `useTransform`

### Concept

`useTransform` maps one motion value range into another value range.

### In This Project

Overlay maps hero progress into opacity and movement (`components/Overlay.tsx:402-404`). Projects maps vertical scroll progress into horizontal `x` travel (`components/Projects.tsx:755`). Marquee maps base motion into a wrapped percentage (`components/KineticMarquee.tsx:477`).

### Why This Was Chosen

It makes scroll storytelling declarative: progress 0.23 to 0.52 becomes a text section appearing and leaving.

### Alternatives

- Manual interpolation in event handlers.
- CSS `scroll-timeline` where supported.

### Tradeoffs

- Many transforms can be hard to mentally trace.
- Bad ranges can overlap or leave dead zones.

### Debugging Tips

- Print or visualize progress before tuning ranges.
- Keep ranges named or documented when they become complex.

## `useSpring`

### Concept

`useSpring` smooths a motion value using spring physics.

### In This Project

- Cursor trails use springs with different stiffness/damping (`components/CustomCursor.tsx:280-287`).
- Project cards spring tilt values (`components/Projects.tsx:600-601`).
- Project horizontal track smooths `rawX` (`components/Projects.tsx:756`).

### Why This Was Chosen

Springs make motion feel physical and premium without hand-authored easing curves.

### Alternatives

- CSS transitions.
- Tweened Framer animations.
- Raw lerp in rAF.

### Tradeoffs

- Too much spring smoothing can feel laggy.
- Too little damping can feel bouncy or cheap.

### Debugging Tips

- Increase damping to reduce overshoot.
- Increase stiffness for faster response.
- Avoid springing values that must match exact scroll progress.

## Lenis

### Concept

Lenis smooths native scroll by controlling scroll interpolation in an animation loop.

### In This Project

`LenisProvider` creates one Lenis instance and calls `lenis.raf(time)` each frame (`components/LenisProvider.tsx:247-252`). It checks reduced-motion and coarse pointer before choosing duration and smooth-wheel behavior (`components/LenisProvider.tsx:231-242`).

### Why This Was Chosen

The portfolio depends on scroll feeling cinematic. Lenis improves wheel scroll feel while keeping normal document flow and CSS sticky behavior.

### Alternatives

- Native scrolling only.
- GSAP ScrollSmoother.
- CSS `scroll-behavior: smooth` for anchor jumps only.

### Tradeoffs

- Another rAF loop exists globally.
- Scroll-linked libraries need to stay in sync with actual scroll position.

### Debugging Tips

- If scroll feels floaty, reduce `duration`.
- If sticky breaks, inspect CSS overflow first, not Lenis first.
- If anchor links feel off, consider using a Lenis context and `lenis.scrollTo()`.

## Canvas Rendering

### Concept

Canvas lets code draw pixels directly. It is useful when many image frames need to update quickly without mounting many DOM nodes.

### In This Project

`ScrollyCanvas` gets a 2D context and uses `drawImage` in `drawCover` (`components/ScrollyCanvas.tsx:34-58`). The canvas element fills the sticky viewport (`components/ScrollyCanvas.tsx:304-308`).

### Why This Was Chosen

A video tag is easy, but scrubbing exact frames with scroll is more controllable with canvas. Canvas also avoids rendering 89+ image elements.

### Alternatives

- `<video>` with `currentTime` scrubbing.
- CSS background image swapping.
- WebGL/Three.js plane texture updates.

### Tradeoffs

- You must implement preloading, sizing, cover behavior, and fallback frames.
- Canvas content is not semantic, so overlay text must carry meaning.

### Debugging Tips

- If canvas is blank, check whether frame 0 loaded and canvas dimensions are nonzero.
- Check Network tab for 404 frame assets.
- Temporarily draw a colored rectangle before drawing images.

## Image Sequence Animation

### Concept

A sequence animation maps progress to frame index. For 89 frames, progress 0 maps to frame 0 and progress 1 maps to frame 88.

### In This Project

Scroll progress is mapped at `components/ScrollyCanvas.tsx:288-291`:

```ts
const frameIndex = Math.min(Math.floor(clampedProgress * config.totalFrames), config.totalFrames - 1);
```

Frames are loaded progressively: frame 0, initial buffer, then background batches (`components/ScrollyCanvas.tsx:220-238`).

### Why This Was Chosen

It delivers frame-accurate scrollytelling and supports a hidden alternate Konami sequence.

### Alternatives

- Video sprite/scrubbing.
- Lottie for vector animation.
- CSS scroll-driven animation.

### Tradeoffs

- Many assets can slow first load.
- Compression format matters a lot.
- Requires careful cache headers in production.

### Debugging Tips

- Verify `totalFrames` and filename pattern in `lib/sequence.ts`.
- Watch Network waterfall for too much concurrency.
- If frames flash blank, check `nearestLoadedFrame` behavior.

## Tailwind Architecture

### Concept

Tailwind uses utility classes in JSX and a config file for design tokens.

### In This Project

Most styling is inline utility classes. Shared tokens are defined in `tailwind.config.ts:313-329`, including `ink`, `night`, `frost`, and `shadow-glow`.

### Why This Was Chosen

The site is highly custom and component-specific. Tailwind makes iteration fast without inventing many CSS class names.

### Alternatives

- CSS Modules.
- Styled Components.
- Vanilla CSS with BEM.

### Tradeoffs

- JSX can become class-heavy.
- Repeated utility combinations can hide design-system patterns.

### Debugging Tips

- If a class does not apply, ensure the file path is in `tailwind.config.ts:310`.
- Dynamic class names may need safelisting.

## State Management

### Concept

Use local state for local UI, refs for mutable values that should not re-render, and context for shared app state.

### In This Project

- Local state: contact form values (`components/Contact.tsx:328-331`).
- Refs for hot paths: canvas frame cache (`components/ScrollyCanvas.tsx:83`), cursor visibility ref (`components/CustomCursor.tsx:275`), project tilt refs (`components/Projects.tsx:602-604`).
- Context: Konami mode (`components/KonamiProvider.tsx:24-76`).

### Why This Was Chosen

Animations need high-frequency updates without React render loops. Business/content state is minimal.

### Alternatives

- Zustand for global state.
- Redux Toolkit.
- URL/search params.

### Tradeoffs

- Refs are fast but not reactive.
- Context is simple but can re-render consumers.

### Debugging Tips

- If UI needs to re-render, use state.
- If data is only needed by an event loop or animation frame, prefer refs.
- If unrelated components need the same state, consider context.
