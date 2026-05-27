# Code Walkthrough

This document explains how the portfolio works file by file. It is written for an intermediate React/Next.js developer who understands components, hooks, and CSS utilities, but wants to understand the architecture choices in this specific repo.

## Runtime Map

Entry flow:

1. `app/layout.tsx` creates the HTML shell, metadata, and global providers.
2. `app/page.tsx` assembles the portfolio sections in visual order.
3. `ScrollyCanvas` owns the sticky canvas hero and image-sequence scrub.
4. `Overlay` renders scroll-linked hero copy above the canvas.
5. `Projects` owns the desktop horizontal pinned project showcase and mobile grid fallback.
6. `KonamiProvider` exposes global alternate-mode state used by the canvas, overlay, navbar, and easter egg controller.
7. `lib/content.ts` and `lib/sequence.ts` keep editable content/config out of components.

## `app/layout.tsx`

Relevant lines: metadata at `app/layout.tsx:6`, provider wrapping at `app/layout.tsx:20`.

### Responsibilities

- Defines app-wide `metadata` for the App Router.
- Imports global CSS once via `./globals.css`.
- Wraps every page in `KonamiProvider` and `LenisProvider`.
- Sets the root HTML language and dark base background.

### Dependencies

- `next` metadata typing.
- `KonamiProvider` for global easter-egg mode.
- `LenisProvider` for smooth scrolling.
- `app/globals.css` for Tailwind and custom global effects.

### Inputs

- `children`, supplied by Next.js App Router.

### Outputs

- The document shell for all routes.
- A provider tree available to every child component.

### Runtime Flow

`RootLayout` renders `<html>`, `<body>`, then wraps the app in `KonamiProvider` and `LenisProvider` (`app/layout.tsx:20-21`). This means components like `Navbar`, `ScrollyCanvas`, and `EasterEggController` can call `useKonamiMode()` safely.

### Common Modifications

- Change SEO title/description in `metadata`.
- Add analytics scripts or more providers here.
- Be careful adding overflow rules to `<html>` or `<body>` because sticky sections depend on normal page scroll.

### Potential Bugs

- Removing `KonamiProvider` breaks `useKonamiMode()` consumers.
- Removing `LenisProvider` changes scroll feel and can expose differences in scroll-linked animation timing.
- Adding `overflow-hidden` on root elements can break `position: sticky` used by the hero and projects.

### Refactoring Opportunities

- Add route-specific metadata if more pages are added.
- Expose a `Providers` component if provider count grows.

## `app/page.tsx`

Relevant lines: ordered component stack at `app/page.tsx:45-58`.

### Responsibilities

- Defines the homepage route.
- Mounts global visual/interaction layers: navbar, custom cursor, easter egg controller, grain, vignette.
- Orders content sections from hero to contact.

### Dependencies

- All major visual components in `components/`.
- Content sections from `ProfileSections`.

### Inputs

- No props. It reads imported components only.

### Outputs

- The full one-page portfolio.

### Runtime Flow

`Home` returns a single `<main>` with `bg-ink text-white` (`app/page.tsx:44`). The first mounted components are fixed/global layers: `Navbar`, `CustomCursor`, and `EasterEggController` (`app/page.tsx:45-47`). Then it renders overlays and sequential content sections.

### Common Modifications

- Reorder sections here.
- Add a new section by importing and placing it in this stack.
- Keep IDs in each section aligned with `navItems` in `lib/content.ts`.

### Potential Bugs

- Moving `ScrollyCanvas` below other sections changes the intro experience and can confuse scroll progress assumptions.
- Removing `EasterEggController` leaves context available but no keyboard activation UI.

### Refactoring Opportunities

- Replace the hardcoded stack with a section registry if many sections are added.

## `lib/content.ts`

Relevant lines: profile at `lib/content.ts:62`, nav at `lib/content.ts:85`, projects at `lib/content.ts:145`.

### Responsibilities

- Central source of editable portfolio content.
- Keeps identity, links, sections, experience, projects, writing, and education data out of JSX.
- Makes project cards and profile sections data-driven.

### Dependencies

- No imports. Components import this file.

### Inputs

- Static data authored in TypeScript.

### Outputs

- `profile`, `navItems`, `about`, `skillGroups`, `experience`, `projects`, `writing`, and `education`.

### Runtime Flow

Components import only the parts they need. For example, `Navbar` reads `navItems` and `profile` (`components/Navbar.tsx:6`), while `Projects` maps `projects` into cards (`components/Projects.tsx:778`).

### Common Modifications

- Update contact/social links in `profile.links`.
- Add a project by appending to `projects`.
- Change navigation by editing `navItems`, but ensure a matching section `id` exists.

### Potential Bugs

- Placeholder GreenMart links at `lib/content.ts:193-194` intentionally point to anchor placeholders.
- Duplicate project titles can cause key collisions in `Projects`.
- Broken external URLs show up in nav/contact/project links.

### Refactoring Opportunities

- Add TypeScript exported types for project/link shapes.
- Move large arrays into separate content modules if content grows.

## `lib/sequence.ts`

Relevant lines: sequence type at `lib/sequence.ts:255`, config at `lib/sequence.ts:269`, helpers at `lib/sequence.ts:302`.

### Responsibilities

- Defines image sequence configuration for default and Konami modes.
- Encodes frame counts, folder paths, batch sizes, concurrency, and filename patterns.
- Provides helpers that turn a frame index into a public asset URL.

### Dependencies

- No imports. `ScrollyCanvas` consumes it.

### Inputs

- `SequenceConfig` objects for `default` and `konami`.
- A frame index passed to `getSequenceSource`.

### Outputs

- `sequenceConfigs`.
- `resolveSequenceConfig`.
- `getSequenceSource` and `getSequenceSources`.
- `frameSources` compatibility export.

### Runtime Flow

`ScrollyCanvas` chooses the active config based on Konami state (`components/ScrollyCanvas.tsx:79`) and calls `resolveSequenceConfig` (`components/ScrollyCanvas.tsx:96`). `loadFrame` then calls `getSequenceSource(config, index)` (`components/ScrollyCanvas.tsx:180`).

### Common Modifications

- Change `path` when moving frames to `/sequence-webp` or `/sequence-konami-webp`.
- Change `extension` and `buildFilename` together.
- Tune `initialFramesToLoad`, `backgroundBatchSize`, and `concurrency` for load behavior.

### Potential Bugs

- `extension` is informational unless `buildFilename` also uses it.
- `totalFrames` must match actual assets or the canvas will request missing files.
- Wrong zero-padding breaks asset URLs.

### Refactoring Opportunities

- Derive `buildFilename` from path/extension/pattern metadata.
- Add runtime warnings for failed frame loads in development.

## `components/LenisProvider.tsx`

Relevant lines: Lenis init at `components/LenisProvider.tsx:234`, rAF loop at `components/LenisProvider.tsx:247`.

### Responsibilities

- Initializes site-wide smooth scrolling with Lenis.
- Runs Lenis inside a single `requestAnimationFrame` loop.
- Disables browser scroll restoration.
- Cleans up Lenis on unmount.

### Dependencies

- `lenis`.
- React `useEffect` and `useRef`.

### Inputs

- `children` to render inside the provider.

### Outputs

- No context. It affects global scroll behavior through Lenis.

### Runtime Flow

On mount, it checks `prefers-reduced-motion` and coarse pointer (`components/LenisProvider.tsx:231-232`), creates Lenis with tuned options (`components/LenisProvider.tsx:234-243`), and starts a rAF loop calling `lenis.raf(time)` (`components/LenisProvider.tsx:248-252`). Cleanup cancels the rAF and destroys Lenis (`components/LenisProvider.tsx:256-258`).

### Common Modifications

- Tune `duration`, `wheelMultiplier`, and `touchMultiplier`.
- Add integration with GSAP ScrollTrigger if GSAP is introduced later.

### Potential Bugs

- Multiple Lenis instances cause weird scroll behavior.
- Forgetting cleanup leaks an animation loop.
- `scrollIntoView` interactions may feel different under Lenis if not handled consistently.

### Refactoring Opportunities

- Create a Lenis context if components need direct access to `scrollTo`.
- Add `prefers-reduced-motion` listener updates rather than checking only on mount.

## `components/KonamiProvider.tsx`

Relevant lines: context type at `components/KonamiProvider.tsx:14`, activation at `components/KonamiProvider.tsx:44`, hook at `components/KonamiProvider.tsx:79`.

### Responsibilities

- Owns global Konami mode state.
- Adds/removes root classes and `data-theme` for CSS theme overrides.
- Runs the 30-second countdown timer.
- Exposes `useKonamiMode()`.

### Dependencies

- React Context and hooks.
- DOM access through `document.documentElement`.

### Inputs

- `children`.
- User activation from `EasterEggController`, `Navbar`, or any future trigger.

### Outputs

- `active`, `countdown`, `activate`, and `deactivate`.

### Runtime Flow

`activate` clears any existing timer, sets active state, applies `.konami-active`, and starts an interval (`components/KonamiProvider.tsx:44-60`). `deactivate` clears the timer and removes theme attributes (`components/KonamiProvider.tsx:36-42`). Cleanup removes global DOM changes on unmount (`components/KonamiProvider.tsx:63-69`).

### Common Modifications

- Change `DURATION_SECONDS`.
- Add more theme attributes for analytics or UI modes.
- Expose a `remainingPercent` derived value.

### Potential Bugs

- Calling the hook outside the provider throws intentionally (`components/KonamiProvider.tsx:82-83`).
- Direct DOM mutation means this component must remain client-side.
- `NodeJS.Timeout` type can be awkward in browser-only code.

### Refactoring Opportunities

- Persist mode state in URL/query for debugging.
- Move theme DOM mutation into an effect that reacts to `active`.

## `components/EasterEggController.tsx`

Relevant lines: key sequence at `components/EasterEggController.tsx:94`, trigger at `components/EasterEggController.tsx:133`, listener at `components/EasterEggController.tsx:140`.

### Responsibilities

- Detects keyboard Konami code.
- Plays a short activation tone.
- Shows pulse and countdown UI.
- Provides manual restore button.

### Dependencies

- `useKonamiMode`.
- Framer Motion `AnimatePresence` and `motion.div`.
- Web Audio API.

### Inputs

- Keyboard events from `window`.
- Context state from `KonamiProvider`.

### Outputs

- Calls `activate()`/`deactivate()`.
- Renders fixed overlay UI while active.

### Runtime Flow

`handleKeyDown` appends the latest key to `keys`, keeps only the final 10 entries, and compares with `KONAMI_CODE` (`components/EasterEggController.tsx:144-147`). On match it calls `triggerKonamiMode`, which activates context, pulses, and attempts audio (`components/EasterEggController.tsx:133-137`).

### Framer Motion Usage

- `AnimatePresence` mounts/unmounts pulse and countdown smoothly (`components/EasterEggController.tsx:163`, `components/EasterEggController.tsx:175`).
- Countdown card uses spring entrance/exit (`components/EasterEggController.tsx:177-181`).

### Common Modifications

- Change keyboard sequence.
- Change pulse style or countdown position.
- Add touch gesture activation, although the navbar now handles five taps.

### Potential Bugs

- Browser audio policies can block sound; code catches that.
- If the component is removed, keyboard activation disappears but context still exists.

### Refactoring Opportunities

- Move key-sequence detection into a reusable hook.
- Make activation tone optional via user preference.

## `components/Navbar.tsx`

Relevant lines: scroll state effect at `components/Navbar.tsx:15`, five-tap trigger at `components/Navbar.tsx:45`, Framer layout bubble at `components/Navbar.tsx:110`.

### Responsibilities

- Fixed top navigation.
- Highlights active section while scrolling.
- Smooth-scrolls to section IDs.
- Provides mobile-friendly five-tap Konami activation on the brand.
- Links to email availability CTA.

### Dependencies

- `navItems` and `profile` from content.
- `useKonamiMode` for secret activation.
- Framer Motion for header entrance and active nav bubble.

### Inputs

- Scroll position.
- Clicks/taps on nav items and brand button.

### Outputs

- Active nav visual state.
- Calls `activate()` after five quick brand taps.
- Scrolls page to sections.

### Runtime Flow

On mount, `handleScroll` sets `scrolled` and computes `activeSection` by checking each section top against 42% of viewport height (`components/Navbar.tsx:16-27`). The brand button calls `handleBrandTap`, increments a ref counter, resets it after 1.4 seconds, and activates Konami mode at five taps (`components/Navbar.tsx:45-60`).

### Important State

- `activeSection`: which nav pill is active.
- `scrolled`: compact/blurred navbar state.
- `secretTapCountRef`: does not cause re-renders while counting taps.
- `secretTapTimerRef`: clears the tap window.

### Common Modifications

- Edit nav labels in `lib/content.ts`, not here.
- Tune active-section threshold.
- Change tap count/window.

### Potential Bugs

- `getBoundingClientRect()` runs on scroll; okay for few sections, but could be throttled if many sections are added.
- `scrollIntoView` plus Lenis can feel slightly different than Lenis-native scrolling.

### Refactoring Opportunities

- Use IntersectionObserver for active section tracking.
- Expose Lenis `scrollTo` and use that instead of DOM `scrollIntoView`.

## `components/ScrollyCanvas.tsx`

Relevant lines: draw helper at `components/ScrollyCanvas.tsx:34`, frame cache refs at `components/ScrollyCanvas.tsx:83`, scroll progress at `components/ScrollyCanvas.tsx:101`, frame loading at `components/ScrollyCanvas.tsx:169`, scroll subscription at `components/ScrollyCanvas.tsx:288`, sticky markup at `components/ScrollyCanvas.tsx:302`.

### Responsibilities

- Renders the cinematic sticky hero.
- Scrubs image sequence frames on scroll.
- Switches between default and Konami frame sources.
- Progressively preloads frames.
- Sizes canvas to viewport/sticky wrapper.
- Renders `Overlay` above the canvas.

### Dependencies

- Framer Motion `useScroll`, `useMotionValueEvent`, `AnimatePresence`, `useReducedMotion`.
- `useKonamiMode`.
- Sequence config from `lib/sequence.ts`.
- Browser Canvas and Image APIs.

### Inputs

- Scroll progress for the 500vh container.
- Konami active state.
- Window/device size.
- Frame assets in `public/sequence` and `public/sequence-konami`.

### Outputs

- Drawn canvas frames.
- Initial loader until frame 0 is ready.
- Overlay text and Konami scanlines.

### Runtime Flow

The outer `div` has `h-[500vh]` and `ref={containerRef}` (`components/ScrollyCanvas.tsx:302`). The direct child is sticky full-screen (`components/ScrollyCanvas.tsx:303`). `useScroll` watches only that container (`components/ScrollyCanvas.tsx:101-104`).

When frames load, `loadSequence` loads frame 0 first, then the initial buffer, then background batches (`components/ScrollyCanvas.tsx:212-238`). Scroll changes compute `frameIndex` from progress and total frames (`components/ScrollyCanvas.tsx:288-291`). `queueRender` coalesces draws into one `requestAnimationFrame` (`components/ScrollyCanvas.tsx:121-128`).

### Important Hooks

- `useScroll`: gives scroll progress for the hero only.
- `useMotionValueEvent`: subscribes to motion value changes without React re-rendering each scroll tick.
- `useReducedMotion`: reduces overlay motion on user preference.
- `useMemo`: resolves active config only when key/device changes.

### Important State and Refs

- `frameCacheRef`: stores loaded images without re-rendering.
- `loadingRef`: avoids duplicate loads.
- `latestFrameRef` and `drawnFrameRef`: prevent redundant draws.
- `rafRef`: coalesces canvas drawing.
- `revealed`: only state that controls the blocking loader.
- `loadProgress`: updates initial loader progress.

### Framer Motion Usage

- Loader uses `AnimatePresence` for fade-out (`components/ScrollyCanvas.tsx:314-338`).
- `scrollYProgress` is passed into `Overlay` so copy animations share the same hero progress (`components/ScrollyCanvas.tsx:312`).

### Common Modifications

- Change scroll duration by changing `h-[500vh]`.
- Change frame count/path/batches in `lib/sequence.ts`.
- Change mobile behavior through `MOBILE_QUERY` or sequence mobile config.

### Potential Bugs

- Missing frames cause requests to fail and nearest-frame fallback may hold stale visuals.
- If `totalFrames` is wrong, final scroll will not map correctly.
- `drawnFrameRef` records requested index, not necessarily nearest loaded index, so very fast scrolling during early preload can skip a later redraw until more loads complete; `markLoaded` mitigates this by re-rendering active key.
- Canvas dimensions are scaled by DPR; CSS size remains `w-full h-full`.

### Refactoring Opportunities

- Use `createImageBitmap` for potentially faster decode/draw in modern browsers.
- Add dev-only warnings for failed frame URLs.
- Extract the sequence loader into a custom hook.

## `components/Overlay.tsx`

Relevant lines: `CopyBlock` at `components/Overlay.tsx:360`, transforms at `components/Overlay.tsx:402`, mode-specific blocks at `components/Overlay.tsx:466`.

### Responsibilities

- Renders text and CTAs over the hero canvas.
- Maps scroll progress to opacity/position/font weight.
- Swaps overlay copy in Konami mode.
- Supports reduced motion.

### Dependencies

- Framer Motion `motion`, `MotionValue`, and `useTransform`.
- `profile` content.
- `useKonamiMode`.

### Inputs

- `progress`: hero scroll progress motion value from `ScrollyCanvas`.
- `reduceMotion`: boolean from reduced-motion/mobile logic.

### Outputs

- Sticky overlay copy layered above canvas.
- Hero CTAs and alternate-mode labels.

### Runtime Flow

`Overlay` chooses a block array based on Konami state (`components/Overlay.tsx:465-555`). Each block is passed into `CopyBlock`, which derives `opacity`, `y`, `x`, and `fontWeight` from the shared progress motion value (`components/Overlay.tsx:402-409`).

### Common Modifications

- Edit hero copy in `lib/content.ts` for default first block.
- Edit block ranges to change when text appears.
- Add/remove blocks, but keep ranges non-overlapping enough to avoid clutter.

### Potential Bugs

- `clickTimeoutRef` is not cleaned up on unmount; low risk but can be cleaned.
- `fontWeight` animation may not visibly interpolate on all fonts.

### Refactoring Opportunities

- Move overlay block definitions into `lib/content.ts`.
- Create a shared easing/range helper for scroll sections.

## `components/Projects.tsx`

Relevant lines: card tilt values at `components/Projects.tsx:598`, rAF tilt at `components/Projects.tsx:625`, horizontal progress at `components/Projects.tsx:735`, desktop/mobile split at `components/Projects.tsx:760` and `components/Projects.tsx:788`.

### Responsibilities

- Displays featured project/case-study cards.
- Desktop: vertical scroll drives horizontal card track.
- Mobile: plain vertical grid for performance and usability.
- Each desktop card has subtle 3D tilt.
- Adds `.project-card` class for custom cursor detection.

### Dependencies

- `projects` from content.
- Framer Motion `useScroll`, `useTransform`, `useSpring`, `useMotionValue`.
- DOM measurement for track width.

### Inputs

- Project data array.
- Scroll progress of the projects section.
- Pointer coordinates for desktop card tilt.

### Outputs

- Horizontal pinned showcase on `md` and above.
- Vertical grid below `md`.

### Runtime Flow

`Projects` measures track scroll width on mount/resize (`components/Projects.tsx:740-752`) and stores `travelDistance`. `useScroll` maps the section scroll progress to `rawX`, and `useSpring` smooths the horizontal translation (`components/Projects.tsx:755-756`). Desktop section is `h-[420vh]` with a sticky viewport (`components/Projects.tsx:760-761`).

`ProjectCard` caches its bounds on mouse enter (`components/Projects.tsx:620-623`), stores pointer coordinates, and updates tilt inside a rAF (`components/Projects.tsx:625-631`).

### Important State

- `travelDistance`: how far the horizontal track should move.
- `rotateX`/`rotateY`: motion values for card tilt.
- `boundsRef`/`pointerRef`: avoid state updates during mousemove.

### Common Modifications

- Add projects in `lib/content.ts`.
- Tune desktop scroll length by changing `h-[420vh]`.
- Tune tilt intensity at `rotateX.set`/`rotateY.set`.

### Potential Bugs

- Images/content changes after initial measure may require remeasurement.
- Very long project text can overflow fixed-height desktop cards.
- If `.project-card` is removed, cursor will not switch to VIEW mode.

### Refactoring Opportunities

- Use `ResizeObserver` instead of window resize.
- Extract `ProjectCard` into its own file.
- Consider GSAP ScrollTrigger only if horizontal pinning becomes more complex.

## `components/CustomCursor.tsx`

Relevant lines: motion values at `components/CustomCursor.tsx:277`, device detection at `components/CustomCursor.tsx:295`, event listeners at `components/CustomCursor.tsx:316`, cursor render at `components/CustomCursor.tsx:364`.

### Responsibilities

- Provides a custom cursor on desktop pointer devices.
- Uses spring trails for premium motion.
- Switches cursor mode for links/buttons/cards/inputs.
- Disables itself on mobile/touch.

### Dependencies

- Framer Motion `useMotionValue`, `useSpring`, `motion.div`.
- DOM event listeners.

### Inputs

- Mouse coordinates.
- Element under cursor.
- Device type.

### Outputs

- Fixed custom cursor layer.
- Different visual states: default, pointer, card, input.

### Runtime Flow

Device detection runs on mount and resize (`components/CustomCursor.tsx:295-313`). If not mobile, mousemove updates `mouseX`/`mouseY` motion values (`components/CustomCursor.tsx:325-328`) and `mouseover` sets semantic cursor type via `closest()` checks (`components/CustomCursor.tsx:334-347`). Rendering is skipped if mobile or invisible (`components/CustomCursor.tsx:362`).

### Framer Motion Usage

- `useSpring` trails smooth the lead cursor and dots (`components/CustomCursor.tsx:280-287`).
- Width/height/color animate based on `cursorType` (`components/CustomCursor.tsx:390-397`).

### Common Modifications

- Add another cursor mode by extending `CursorType`.
- Add class checks in `handleMouseOver`.
- Tune spring stiffness/damping.

### Potential Bugs

- Animating width/height can be more expensive than scale transforms.
- `mouseover` can fire frequently; current checks are light but still DOM-based.
- Cursor depends on `.interactive` and `.project-card` classes being applied.

### Refactoring Opportunities

- Animate cursor size with transform scale and CSS variables.
- Use pointer events instead of mouse events.

## `components/KineticMarquee.tsx`

Relevant lines: scroll velocity at `components/KineticMarquee.tsx:443`, animation frame at `components/KineticMarquee.tsx:457`, wrap transform at `components/KineticMarquee.tsx:477`.

### Responsibilities

- Displays an infinite horizontal marquee.
- Reacts to scroll velocity.
- Respects reduced motion.

### Dependencies

- Framer Motion `useAnimationFrame`, `useMotionValue`, `useVelocity`, `useSpring`, `useTransform`.
- `wrap` helper from Framer Motion.

### Inputs

- `text` prop.
- Optional `speed` prop.
- Global scroll position.

### Outputs

- Animated marquee between hero and projects.

### Runtime Flow

`scrollY` feeds `useVelocity`, smoothed by `useSpring` (`components/KineticMarquee.tsx:443-450`). On each animation frame, it advances `baseX` unless reduced motion is enabled (`components/KineticMarquee.tsx:457-473`). `wrap(-50, 0, v)` loops the translation (`components/KineticMarquee.tsx:477`).

### Common Modifications

- Change marquee text where mounted in `app/page.tsx:51`.
- Tune `speed` and velocity multiplier.
- Reduce duplicate spans if layout changes.

### Potential Bugs

- Continuous rAF means this is always animating unless reduced motion is enabled.
- Heavy blur background can cost paint on weaker devices.

### Refactoring Opportunities

- Pause marquee when offscreen using IntersectionObserver.
- Use pure CSS marquee for simpler behavior.

## `components/ProfileSections.tsx`

Relevant lines: shell at `components/ProfileSections.tsx:140`, section exports at `components/ProfileSections.tsx:169`, `191`, `220`, `259`, `286`.

### Responsibilities

- Renders About, Skills, Experience, Writing, and Education sections.
- Shares a consistent section layout through `SectionShell`.
- Maps centralized content into cards.

### Dependencies

- `about`, `education`, `experience`, `skillGroups`, and `writing` from content.
- Tailwind utility classes.

### Inputs

- Static data from `lib/content.ts`.

### Outputs

- Five content sections with IDs used by navbar.

### Runtime Flow

`SectionShell` applies shared background, padding, divider line, eyebrow, and title (`components/ProfileSections.tsx:151-165`). Each exported section maps content arrays into cards.

### Common Modifications

- Change section copy in `lib/content.ts`.
- Adjust shared section spacing in `SectionShell`.
- Add another section export using the shell.

### Potential Bugs

- Missing section IDs break nav links.
- Long achievements can make cards uneven.

### Refactoring Opportunities

- Add Framer Motion reveal wrappers if needed, but keep transform/opacity only.
- Extract card components if sections become more complex.

## `components/Contact.tsx`

Relevant lines: contact items at `components/Contact.tsx:319`, form state at `components/Contact.tsx:328`, audio at `components/Contact.tsx:334`, submit at `components/Contact.tsx:360`.

### Responsibilities

- Shows contact details from `profile`.
- Renders a demo contact form.
- Offers optional subtle hover sound.
- Displays submitted confirmation.

### Dependencies

- `profile` from content.
- Framer Motion for submitted confirmation and sound icon bars.
- Web Audio API.

### Inputs

- User form input.
- Sound toggle clicks.

### Outputs

- Contact links.
- Simulated submission state.
- Optional hover tones.

### Runtime Flow

`contactItems` derives links from `profile` (`components/Contact.tsx:319-325`). `handleSubmit` prevents default, simulates a 900ms submit, clears the form, and shows a success message (`components/Contact.tsx:360-368`).

### Important State

- `formData`: controlled input values.
- `isSubmitting`: disables submit UI.
- `submitted`: toggles form vs success message.
- `soundEnabled`: guards Web Audio.

### Common Modifications

- Replace simulated submit with a real API route.
- Add validation or spam protection.
- Remove sound if you want a more conservative portfolio.

### Potential Bugs

- The form does not send email yet; success copy says this explicitly.
- AudioContext may fail or be blocked by browser policy.

### Refactoring Opportunities

- Add `/app/api/contact/route.ts` for real submissions.
- Move `contactItems` to `lib/content.ts`.

## `app/globals.css`

Relevant lines: root/body at `app/globals.css:5`, sticky-safe HTML at `app/globals.css:35`, grain at `app/globals.css:84`, Konami theme at `app/globals.css:193`, scanlines at `app/globals.css:257`.

### Responsibilities

- Imports Tailwind layers.
- Defines global reset/base colors/scrollbar.
- Provides film grain, vignette, glitch, and Konami theme CSS.
- Ensures `scroll-behavior: auto` so Lenis controls scrolling.

### Dependencies

- Tailwind build pipeline.
- Root classes added by `KonamiProvider`.
- Elements mounted in `app/page.tsx` (`grain-overlay`, `vignette-overlay`).

### Inputs

- CSS classes in markup.
- `.konami-active` class on `<html>`.

### Outputs

- Global visual language and special-mode styling.

### Runtime Flow

`KonamiProvider` adds `.konami-active`, activating selectors like `.konami-active body` (`app/globals.css:201`) and `.konami-active .konami-rgb-text` (`app/globals.css:249`). `ScrollyCanvas` conditionally renders `.konami-scanlines` (`components/ScrollyCanvas.tsx:311`), which uses pseudo-elements in CSS.

### Common Modifications

- Tune page palette and special effects here.
- Add reduced-motion media queries for global animations.

### Potential Bugs

- Expensive CSS filters/blur can hurt mobile performance.
- Root overflow changes can break sticky.
- `.cyberpunk-mode` appears older than `.konami-active`; remove if unused.

### Refactoring Opportunities

- Convert theme values to CSS variables used by components.
- Add `@media (prefers-reduced-motion)` to disable grain/glitch animations.

## `tailwind.config.ts`

Relevant lines: content globs at `tailwind.config.ts:310`, extended theme at `tailwind.config.ts:313`.

### Responsibilities

- Tells Tailwind where to scan class names.
- Adds project-specific colors, font stack, and `shadow-glow`.

### Dependencies

- Tailwind CSS.
- App/components file paths.

### Inputs

- Class names in `app/**/*` and `components/**/*`.

### Outputs

- Generated CSS utilities.

### Common Modifications

- Add more colors, animations, spacing tokens.
- Add plugins if forms/typography are needed.

### Potential Bugs

- Dynamic class strings that Tailwind cannot statically detect may be purged.
- Missing paths in `content` means utilities do not build.

### Refactoring Opportunities

- Move repeated colors from raw hex utilities into theme tokens.

## `package.json`

Relevant lines: scripts at `package.json:340`, dependencies at `package.json:346`.

### Responsibilities

- Defines scripts and dependency versions.
- Documents the stack: Next, React, Framer Motion, Lenis, Tailwind, TypeScript.

### Common Modifications

- Add `lint` script compatibility if Next lint changes.
- Add testing scripts.

### Potential Bugs

- Version drift can change animation behavior.
- No test script exists yet.

## `vercel.json`

If present, this file configures deployment headers. In recent work it has been used for long-lived cache headers on frame assets. If it is absent on a branch, Vercel falls back to framework defaults.

### Common Modifications

- Add cache headers for `/sequence/:path*` or `/sequence-webp/:path*`.
- Add redirects or rewrites for canonical domains.

### Potential Bugs

- Overly long cache headers on non-versioned assets can make updated frames hard to invalidate.
