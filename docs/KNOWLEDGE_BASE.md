# Knowledge Base

This document explains the architecture and major systems in the portfolio.

## High-Level Architecture

The project is a Next.js 14 App Router portfolio with a cinematic scroll-linked canvas intro. It combines:

- Static React components rendered by Next.js.
- Client-side animation and scroll tracking with Framer Motion.
- Smooth scrolling with Lenis.
- Tailwind CSS for layout and component styling.
- Global CSS for base theme, visual effects, and Konami-mode overrides.
- Public image sequences rendered into an HTML5 canvas.
- Central content data in `lib/content.ts`.
- Central sequence configuration in `lib/sequence.ts`.

The primary route is `/`, implemented by `app/page.tsx`.

## Folder-by-Folder Explanation

### `app/`

Next.js App Router files.

- `app/layout.tsx`
  - Root HTML/body layout.
  - Imports global CSS.
  - Provides metadata.
  - Wraps children in `KonamiProvider` and `LenisProvider`.

- `app/page.tsx`
  - Home page composition.
  - Mounts navigation, cursor, Easter egg controller, visual overlays, scrollytelling hero, marquee, content sections, projects, writing, education, and contact.

- `app/globals.css`
  - Tailwind directives.
  - Root dark theme.
  - Scrollbar styling.
  - Grain and vignette overlays.
  - Konami-mode CSS variables and visual effects.
  - Glitch animation utilities.

### `components/`

All React UI and behavior components.

- `ScrollyCanvas.tsx`
  - Core scroll-scrub hero canvas renderer.
  - Handles image preloading and drawing.
  - Switches between default and Konami sequences based on global state.

- `Overlay.tsx`
  - Text overlay over the sticky canvas.
  - Uses Framer Motion transforms tied to scroll progress.
  - Switches copy between normal engineering mode and Konami mode.

- `KonamiProvider.tsx`
  - Global state provider for Konami mode.
  - Owns `active`, `countdown`, `activate`, and `deactivate`.
  - Adds/removes root theme class and data attribute.

- `EasterEggController.tsx`
  - Listens for the Konami key sequence.
  - Calls `activate()` from `KonamiProvider`.
  - Shows a temporary HUD while mode is active.

- `Navbar.tsx`
  - Floating navigation.
  - Reads section targets from `lib/content.ts`.
  - Tracks active section by viewport position.

- `CustomCursor.tsx`
  - Desktop-only custom cursor with spring trail.
  - Detects links, buttons, inputs, and `.project-card` elements.

- `KineticMarquee.tsx`
  - Scroll velocity-reactive marquee.
  - Uses Framer Motion velocity and animation frame APIs.

- `LenisProvider.tsx`
  - Initializes Lenis smooth scrolling.
  - Runs Lenis on `requestAnimationFrame`.

- `Projects.tsx`
  - Horizontal pinned project showcase on desktop.
  - Vertical card grid on mobile.
  - Uses data from `lib/content.ts`.
  - Implements 3D cursor tilt per card.

- `Contact.tsx`
  - Contact details, links, and local demo form state.
  - Uses profile data from `lib/content.ts`.

- `ProfileSections.tsx`
  - About, Skills, Experience, Writing, and Education sections.
  - Uses centralized structured content.

### `lib/`

Shared data and configuration.

- `lib/content.ts`
  - Profile information.
  - Navigation labels and section IDs.
  - About copy.
  - Skills groups.
  - Experience achievements.
  - Project/case-study cards.
  - Writing resources.
  - Education/certification data.

- `lib/sequence.ts`
  - Defines sequence configuration.
  - Contains default and Konami frame counts and filename builders.
  - Exposes helper to generate frame URLs.

### `public/`

Static assets served directly by Next.js.

- `public/sequence/`
  - Default portfolio hero image sequence.
  - File pattern: `/sequence/frame_000_delay-0.066s.png`

- `public/sequence-konami/`
  - Alternate Konami hero image sequence.
  - File pattern: `/sequence-konami/00001.png`

### `docs/`

Project knowledge and maintenance documentation.

## Major Component Purposes

## `ScrollyCanvas.tsx`

Purpose:
- Owns the canvas element and scroll-scrub rendering logic.
- Keeps the canvas pinned while the page scrolls through a 500vh track.
- Draws either the default or Konami image sequence.

Entry point:
- Mounted from `app/page.tsx` as `<ScrollyCanvas />`.

Execution flow:
1. Reads Konami state via `useKonamiMode()`.
2. Chooses `activeKey`: `default` or `konami`.
3. Uses `useScroll({ target: containerRef, offset: ["start start", "end end"] })`.
4. Preloads the default sequence immediately.
5. Lazy-preloads the Konami sequence during idle time.
6. On scroll progress changes, maps progress to active frame index.
7. Uses `requestAnimationFrame` to draw the selected frame into the canvas.

Important functions:
- `drawCover()`: object-fit cover logic for canvas drawing.
- `preloadSequence()`: loads and caches frames.
- `renderFrame()`: draws a cached frame.
- `sizeCanvas()`: keeps internal canvas dimensions aligned to sticky viewport dimensions.

Dependencies:
- `framer-motion`
- `@/components/KonamiProvider`
- `@/lib/sequence`

## `Overlay.tsx`

Purpose:
- Adds premium text layers above the canvas.
- Animates copy blocks with scroll progress.
- Switches copy when Konami mode is active.

Execution flow:
1. Reads `progress` from parent `ScrollyCanvas`.
2. Reads Konami state from `useKonamiMode()`.
3. Builds normal or alternate block copy.
4. Each `CopyBlock` maps scroll progress to opacity, y, x, blur, skew, and scale.

Important concepts:
- `MotionValue`
- `useTransform`
- `useVelocity`
- `useSpring`

## `KonamiProvider.tsx`

Purpose:
- Centralizes Konami mode state.
- Prevents scattered timers and duplicate mode logic.

Execution flow:
1. `activate()` sets `active=true`, resets countdown, and adds `konami-active` to `<html>`.
2. Interval decrements countdown every second.
3. At zero, `deactivate()` clears mode and root attributes.
4. Cleanup runs on provider unmount.

Important state:
- `active`
- `countdown`
- `intervalRef`

## `EasterEggController.tsx`

Purpose:
- Detects the Konami key sequence.
- Triggers global Konami mode.
- Shows the activation HUD.

Execution flow:
1. `keydown` listener appends normalized keys.
2. Key buffer is compared against `KONAMI_CODE`.
3. On match, calls `activate()` and plays optional tone.
4. HUD appears while `active` is true.

## `Projects.tsx`

Purpose:
- Presents real professional and personal work.
- Desktop: horizontally pinned scroll section.
- Mobile: simple vertical grid fallback.

Execution flow:
1. Reads project data from `lib/content.ts`.
2. Desktop section creates a tall scroll area.
3. Sticky child pins the viewport.
4. Framer Motion maps vertical progress to horizontal track movement.
5. Each card has spring-driven 3D tilt on pointer movement.

Important functions:
- `ProjectCard()`
- `handleMouseMove()`
- `resetTilt()`
- `measure()` for travel distance

## Data Flow

### Content Data

`lib/content.ts` is the source of truth for editable portfolio content.

Flow:

```text
lib/content.ts
  -> Navbar
  -> Overlay
  -> ProfileSections
  -> Projects
  -> Contact
```

This keeps copy and links editable without changing layout logic.

### Sequence Data

`lib/sequence.ts` is the source of truth for frame patterns.

Flow:

```text
lib/sequence.ts
  -> ScrollyCanvas
      -> preloadSequence()
      -> cached frame refs
      -> renderFrame()
```

### Konami State

`KonamiProvider` is the source of truth for alternate mode state.

Flow:

```text
EasterEggController
  -> useKonamiMode().activate()
  -> KonamiProvider active=true
  -> html.konami-active
  -> ScrollyCanvas uses konami sequence
  -> Overlay uses alternate copy
  -> CSS applies alternate theme
```

## State Management

The project uses lightweight local React state and one shared context.

Shared state:
- `KonamiProvider`
  - Used by `EasterEggController`, `ScrollyCanvas`, and `Overlay`.

Local state examples:
- `ScrollyCanvas`: loaded keys and load progress.
- `Contact`: form demo state and sound toggle.
- `Navbar`: active section and scrolled state.
- `Projects`: measured horizontal travel distance.
- `CustomCursor`: cursor type, visibility, touch detection.

No Redux/Zustand/etc. is used.

## Routing

There is currently one route:

- `/`: implemented by `app/page.tsx`

Navigation uses in-page section IDs:
- `intro`
- `about`
- `skills`
- `experience`
- `work`
- `writing`
- `education`
- `contact`

`Navbar.tsx` scrolls to each section via `element.scrollIntoView()`.

## Styling System

Styling is split between Tailwind utilities and global CSS.

Tailwind handles:
- Layout
- Spacing
- Typography
- Borders
- Background translucency
- Responsive behavior
- Hover states

Global CSS handles:
- Base document background
- Scrollbar theme
- Grain overlay
- Vignette overlay
- Konami root theme
- Scanlines
- Shimmer/glitch keyframes

Important global classes:
- `.grain-overlay`
- `.vignette-overlay`
- `.konami-active`
- `.konami-scanlines`
- `.konami-rgb-text`
- `.animate-glitch-active`

## Build and Deployment

Scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Build command:

```bash
next build
```

The app is statically prerendered for `/` and `/_not-found`.

Deployment options:
- Vercel is the natural fit for Next.js.
- Any Node host can run `npm run build` then `npm run start`.

If port `3000` is busy:

```bash
npm run start -- -p 3001
```

## Third-Party Integrations

Runtime libraries:
- Next.js: routing, build, server/start.
- React: UI and state.
- Framer Motion: animation, scroll progress, springs, motion values.
- Lenis: smooth scrolling.

External URLs in content:
- GitHub profile
- LinkedIn profile
- Documentation website
- Hashnode blog
- HouseSquare demo/repo
- Featured article

No backend API or database is currently integrated.

