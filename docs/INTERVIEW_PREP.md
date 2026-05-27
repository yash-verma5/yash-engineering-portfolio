# Interview Prep: Yash Engineering Portfolio

Use this document to explain the portfolio project in a software engineering interview. The goal is to sound practical: focus on architecture, performance, tradeoffs, and maintainability.

## 1. Project Elevator Pitch

This is a high-end personal engineering portfolio built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Lenis, and HTML5 Canvas. The main feature is a cinematic scrollytelling hero where vertical scroll scrubs through an image sequence rendered on canvas. The site positions me as a backend and integration engineer, with content focused on Java, Spring Boot, Apache NiFi, Apache Solr, OMS workflows, production support, and enterprise debugging.

A strong short answer:

> I built a Next.js portfolio that combines a performance-sensitive canvas image-sequence hero with real engineering case-study content. The interesting part is that the hero is not a video; it maps scroll progress to individual canvas frames, supports a hidden Konami alternate sequence, and uses progressive preloading so the page can reveal quickly while frames continue loading in the background.

## 2. Technical Architecture Explanation

The app is a single-page App Router site.

- `app/layout.tsx` defines metadata and wraps the app with `KonamiProvider` and `LenisProvider`.
- `app/page.tsx` composes the page: navbar, cursor, easter egg controller, sticky canvas hero, marquee, profile sections, projects, writing, education, and contact.
- `lib/content.ts` centralizes all editable profile/project content.
- `lib/sequence.ts` centralizes frame sequence configuration.
- `ScrollyCanvas` handles canvas drawing, frame loading, scroll mapping, and Konami sequence switching.
- `Projects` handles the horizontal pinned case-study section on desktop and mobile grid fallback.
- `KonamiProvider` handles global alternate theme state and a 30-second timer.

A strong answer:

> I separated the project into three layers: content/config, interaction systems, and presentational sections. Content lives in `lib/content.ts`, sequence settings live in `lib/sequence.ts`, and interactive systems like canvas, Lenis, and Konami mode are isolated in client components. This keeps the portfolio easy to edit while still allowing complex animation behavior.

## 3. Interesting Engineering Challenges

### Scroll-Linked Canvas Scrubbing

Challenge: The canvas has to stay pinned while page scroll maps to frames.

Implementation:

- Outer hero container is `h-[500vh]`.
- Inner viewport is `sticky top-0 h-screen`.
- `useScroll({ target: containerRef, offset: ["start start", "end end"] })` gives progress for only the hero section.
- Progress maps to frame index.
- Canvas redraws only through a rAF queue.

Why this matters:

> The bug-prone part of scrollytelling is accidentally reading window-level progress or breaking sticky with ancestor overflow. I targeted the scroll container directly and kept sticky in normal document flow.

### Image Loading Strategy

Challenge: Loading a full sequence before rendering creates slow first paint.

Implementation:

- Load frame 0 first.
- Reveal page once frame 0 is available.
- Load an initial buffer.
- Continue background batches with controlled concurrency.
- Fall back to the nearest loaded frame if the exact requested frame is not ready.

Strong answer:

> I treated the sequence like a streaming asset rather than a blocking dependency. The first frame is the critical rendering path; the rest can load progressively.

### Konami Alternate Mode

Challenge: The easter egg should affect the whole experience, not just show a popup.

Implementation:

- `KonamiProvider` stores global `active` state and countdown.
- Root `.konami-active` class changes the CSS theme.
- `ScrollyCanvas` switches from default to Konami frame config.
- `Overlay` swaps copy.
- `EasterEggController` handles keyboard activation.
- `Navbar` handles mobile five-tap activation.

Strong answer:

> I used context because the state crosses component boundaries: canvas frames, overlay content, global CSS, and activation UI all need the same source of truth.

## 4. Performance Optimizations

### Canvas Optimizations

- Frames are stored in refs, not React state.
- Scroll changes use `useMotionValueEvent` rather than setting state every tick.
- Drawing is coalesced with `requestAnimationFrame`.
- Canvas redraw happens only when the frame index changes or a newly loaded frame needs to replace a fallback.
- Device pixel ratio is clamped on mobile.

Interview phrasing:

> The canvas hot path avoids React re-renders. Scroll progress updates a motion value, the subscriber computes a frame index, and drawing happens in one rAF callback.

### Pointer and Hover Optimizations

- Custom cursor is disabled on coarse/touch devices.
- Cursor uses motion values for mouse coordinates.
- Project-card tilt caches bounds on mouse enter and updates via rAF instead of reading layout on every mousemove.
- Overlay blur/filter animation was simplified to transform and opacity.

Interview phrasing:

> I tried to keep the animation hot paths on transform/opacity and motion values. Anything that caused layout reads or paint-heavy filters was either throttled or removed.

### Smooth Scrolling

- Lenis is initialized once in `LenisProvider`.
- It respects reduced motion and coarse pointer settings.
- The site avoids multiple smooth-scroll engines.

Interview phrasing:

> I added Lenis for scroll feel, but avoided adding GSAP because the current sticky and scroll mapping were already manageable with Framer Motion. Fewer scroll systems means fewer sync issues.

## 5. Accessibility Considerations

What exists:

- Real text overlays sit above the canvas, so the hero message is not trapped in pixels.
- Canvas has an `aria-label`.
- Links use semantic `<a>` elements.
- Buttons have `type="button"` where needed.
- Sound is opt-in in contact.
- Reduced motion is respected in the hero overlay and marquee.
- Mobile avoids cursor-only interactions.

What can improve:

- Add a visible skip link to bypass the long scrollytelling hero.
- Add `prefers-reduced-motion` CSS rules for grain/glitch animations.
- Improve form labels and error states.
- Add focus styles for all interactive elements.
- Ensure contrast remains strong in Konami mode.

Strong answer:

> Because the hero is canvas-based, I made sure meaningful copy is regular HTML in the overlay. The canvas is decorative/visual, while the actual content remains accessible text.

## 6. State Management Decisions

Local state:

- Contact form state stays in `Contact`.
- Navbar active section stays in `Navbar`.
- Loader reveal state stays in `ScrollyCanvas`.

Refs:

- Frame caches, loaded counts, rAF IDs, latest frame indexes.
- Pointer coordinates and bounds for tilt.
- Cursor visibility flag to reduce state churn.

Context:

- Konami mode because it affects multiple independent parts of the app.

Strong answer:

> I used React state only where UI needs to re-render. For animation internals, I used refs and motion values to avoid rerendering at 60fps.

## 7. Animation Implementation Details

### Hero

- `useScroll` targets only the hero track.
- `useMotionValueEvent` subscribes to progress.
- Frame index is computed with `Math.floor(progress * totalFrames)` and clamped.
- Canvas draws using object-fit-cover math.

### Overlay

- Each copy block has a progress range.
- `useTransform` maps progress to opacity and movement.
- Reduced motion disables x/y movement.

### Projects

- Desktop section is tall and sticky.
- Vertical progress maps to horizontal `x` movement.
- `useSpring` smooths the track.
- Cards use 3D transform with `rotateX`, `rotateY`, and `translateZ`.

### Cursor

- Cursor position is a motion value.
- Springs create lead/trail movement.
- DOM class detection changes modes.

### Konami

- `AnimatePresence` handles pulse/countdown transitions.
- CSS class `.konami-active` drives global theme changes.
- Canvas switches active sequence config.

## 8. Tradeoffs Made

### Canvas over Video

Better frame control, but more asset management.

### Framer Motion over GSAP

Simpler React integration, but GSAP could be stronger for complex pinned timelines.

### Tailwind over CSS Modules

Faster iteration, but class-heavy JSX.

### Context over Zustand

Small built-in solution, but not ideal for large global state.

### Desktop/Mobile Split for Projects

Better UX per device, but two layouts to maintain.

### Demo Contact Form

No backend complexity, but not a real submission path.

## 9. Bugs Encountered and Fixes

### Sticky Canvas Scrolling Away

Cause:
The canvas scroll progress/sticky structure can break if progress targets the window or ancestor overflow blocks sticky.

Fix:
Use a `relative h-[500vh]` outer track, direct sticky child, and target-based `useScroll`.

### Full Sequence Blocking Initial Load

Cause:
The app waited for all default frames before reveal.

Fix:
Progressive loader: frame 0 first, reveal, initial buffer, background batches.

### Konami Sequence Loading Too Early

Cause:
Large alternate sequence competed with default first-load assets.

Fix:
Delay Konami loading; only tiny idle warmup or full load on activation.

### React Hooks in Loops

Cause:
Earlier cursor code called hooks inside `.map()`.

Fix:
Declare each cursor spring hook at top level in `CustomCursor`.

### Touch Devices Lacking Konami Activation

Cause:
Original activation was keyboard-only.

Fix:
Added five-tap brand trigger in `Navbar`.

### Mousemove Layout Pressure

Cause:
Card tilt read `getBoundingClientRect()` on every mouse move.

Fix:
Cache bounds on mouse enter and throttle tilt updates with rAF.

## 10. Possible Future Improvements

Performance:

- Convert all PNG frames to WebP/AVIF with cache headers.
- Add CDN-backed sequence delivery.
- Pause marquee when offscreen.
- Add `ResizeObserver` for project track measurement.
- Use `createImageBitmap` where supported.

Accessibility:

- Add skip link.
- Add reduced-motion CSS for global grain/glitch.
- Improve keyboard focus states.
- Add real form success/error semantics.

Architecture:

- Extract `useImageSequence` hook from `ScrollyCanvas`.
- Extract `ProjectCard` into its own file.
- Move overlay block copy into content config.
- Add tests for sequence URL generation.

Product:

- Add downloadable resume.
- Add real GreenMart links.
- Add real contact form backend.
- Add analytics for section engagement.

## Sample Interview Questions and Strong Answers

### Q: Why did you use canvas instead of a video tag?

A: I wanted deterministic frame control tied to scroll progress. With canvas, progress maps directly to a frame index and I can draw exactly that frame. Video scrubbing can work, but seeking can be inconsistent across codecs and browsers, especially if you need a premium scroll-linked feel.

### Q: How did you avoid React re-rendering on every scroll frame?

A: I used Framer Motion motion values. `useScroll` gives a motion value, `useMotionValueEvent` subscribes to it, and the canvas draw happens through `requestAnimationFrame`. Frame caches and frame indexes are refs, so the hot path does not set React state.

### Q: How does Konami mode work architecturally?

A: `KonamiProvider` owns a global boolean and countdown. Activators call `activate()`. The provider adds a root class for CSS theme changes. `ScrollyCanvas` reads the same context to switch sequence configs, and `Overlay` reads it to switch copy.

### Q: What was the main performance issue?

A: The image sequence was the biggest issue. Loading every frame before showing the page delayed first paint. I changed it to load frame 0 first, show the hero, then load the buffer and remaining frames progressively.

### Q: Why not use GSAP ScrollTrigger?

A: I considered it, especially for pinned/horizontal sections. For the current scope, CSS sticky plus Framer Motion `useScroll` is simpler and avoids synchronizing multiple scroll systems with Lenis. I would add GSAP if timelines became more complex or required precise pin lifecycle control.

### Q: How did you handle mobile?

A: Mobile gets simpler interactions: no custom cursor, project cards become a vertical grid, canvas DPR is clamped, and overlay motion is reduced. Konami mode is available through five taps on the navbar brand because keyboard input is not realistic on mobile.

### Q: What would you improve next?

A: I would finish asset optimization by serving WebP/AVIF sequences with long-lived cache headers, extract the sequence loader into a reusable hook, add reduced-motion CSS for global effects, and add a real contact endpoint with validation and spam protection.

### Q: What does this project show about backend engineering?

A: The content focuses on production systems: NiFi flows, Solr migration, OMS workflows, integrations, and debugging. The site itself also reflects engineering discipline: configuration-driven content, progressive loading, controlled animation loops, and careful performance tradeoffs.
