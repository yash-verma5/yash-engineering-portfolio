# Development History

This document reconstructs the current development history from the Git log, file structure, current uncommitted changes, and project configuration.

## Repository Snapshot

- Project name: `yash-engineering-portfolio`
- Framework: Next.js 14 App Router
- Language: TypeScript
- Styling: Tailwind CSS plus global CSS theme effects
- Animation: Framer Motion
- Scroll smoothing: Lenis
- Core visual mechanic: sticky HTML5 canvas image-sequence scrollytelling
- Current branch: `main`
- Current remote: `origin/main`
- Current state: committed baseline plus substantial uncommitted content/Konami-mode changes

## Committed Timeline

### 1. `204b537 chore: scaffold Next portfolio foundation`

Major scaffold commit.

Implemented:
- Next.js app foundation with App Router.
- TypeScript configuration.
- Tailwind configuration.
- ESLint configuration.
- PostCSS setup.
- Global CSS baseline and dark visual system.
- Package metadata renamed to `yash-engineering-portfolio`.

Related files:
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `.eslintrc.json`
- `.gitignore`
- `app/layout.tsx`
- `app/globals.css`

Architecture decisions:
- Use Next.js 14 with App Router instead of Pages Router.
- Keep global styles in `app/globals.css`.
- Use Tailwind utility classes for component-level styling.
- Keep the project static-generation friendly.

Libraries introduced:
- `next`
- `react`
- `react-dom`
- `framer-motion`
- `lenis`
- `tailwindcss`
- `typescript`
- `eslint-config-next`

### 2. `7024252 chore: add canvas frame sequence assets`

Added the default hero frame sequence.

Implemented:
- Added PNG frames under `public/sequence/`.
- Frames are served directly from the public directory for canvas rendering.
- Root `/sequence/` was later ignored as a duplicate asset source, while `public/sequence/` remains the runtime path.

Related files:
- `public/sequence/frame_000_delay-0.066s.png` through `frame_119_delay-0.066s.png`
- `.gitignore`

Architecture decisions:
- Store browser-served image frames in `public/` so canvas can load them by URL.
- Use file naming patterns instead of importing every image.

### 3. `a8eebf0 feat: build sticky canvas scrollytelling intro`

Added the cinematic canvas scrollytelling hero.

Implemented:
- Sticky 500vh canvas scroll track.
- HTML5 canvas image-sequence renderer.
- Framer Motion `useScroll` progress tracking.
- Scroll progress to frame-index mapping.
- Cover-fit drawing logic for desktop and mobile viewports.
- Parallax overlay text blocks over the canvas.

Related files:
- `components/ScrollyCanvas.tsx`
- `components/Overlay.tsx`
- `lib/sequence.ts`

Important bugs fixed later:
- Canvas initially risked using incorrect scroll progress scope.
- Sticky behavior was hardened by targeting the scroll container directly with `useScroll({ target })`.
- Root overflow rules were adjusted so CSS sticky would not be broken by ancestors.
- Temporary debug bar was removed after verification.

Architecture decisions:
- Use canvas instead of `<video>` for scroll-linked frame accuracy.
- Use a tall outer track and direct sticky child for predictable sticky behavior.
- Draw only canvas pixels on scroll, not moving/remounting the canvas element.

### 4. `4ea2b89 feat: add kinetic navigation and interaction layer`

Added the interactive portfolio shell.

Implemented:
- Floating glass navigation.
- Custom cursor with spring trail.
- Lenis smooth scrolling.
- Kinetic marquee.
- Konami-code controller baseline.
- Easter egg popup and temporary theme class in early version.

Related files:
- `components/Navbar.tsx`
- `components/CustomCursor.tsx`
- `components/KineticMarquee.tsx`
- `components/LenisProvider.tsx`
- `components/EasterEggController.tsx`

Important bugs fixed later:
- `CustomCursor.tsx` originally called `useSpring` inside `.map()`, violating React Hooks rules. It was refactored to static top-level hook calls.
- Missing hook dependencies were cleaned up.
- Touch/coarse-pointer devices disable the custom cursor.

Architecture decisions:
- Use Framer Motion springs for cursor and marquee movement.
- Use Lenis at root for smooth wheel scrolling.
- Keep Easter egg behavior isolated in its own client component.

### 5. `b8e7250 feat: assemble portfolio sections and case studies`

Added the first full portfolio assembly.

Implemented:
- Main page layout.
- Projects section.
- Contact section.
- Initial horizontally pinned project showcase.
- Project-card hover tilt and custom cursor integration.

Related files:
- `app/page.tsx`
- `components/Projects.tsx`
- `components/Contact.tsx`

Architecture decisions:
- Put main sections in component files.
- Keep project cards interactive but mobile-friendly.
- Use a vertical mobile fallback where horizontal pinning is too heavy.

## Current Uncommitted Milestones

The current worktree includes significant improvements not yet committed.

### Real Portfolio Content Replacement

Implemented:
- Real profile information for Yash Verma.
- Engineering-focused positioning around Java, Spring Boot, Apache NiFi, Apache Solr, OMS, integrations, and production debugging.
- About, Skills, Experience, Writing, Education, and Contact sections.
- Data-driven projects/case studies.
- Real contact and social links.

Related files:
- `lib/content.ts`
- `components/ProfileSections.tsx`
- `components/Overlay.tsx`
- `components/Navbar.tsx`
- `components/Projects.tsx`
- `components/Contact.tsx`
- `app/page.tsx`
- `app/layout.tsx`

Architecture decisions:
- Editable portfolio content moved into `lib/content.ts`.
- UI components now map over structured data instead of hardcoded placeholder arrays.
- Enterprise details are generalized to avoid exposing client-sensitive specifics.

### Konami Alternate Sequence Mode

Implemented:
- Global Konami state provider.
- Root-level `konami-active` class and `data-theme="konami"` mode.
- Alternate canvas sequence support.
- Konami frames loaded from `public/sequence-konami/`.
- Refined Konami HUD and activation pulse.
- Alternate overlay copy.
- Theming changes: dark/cyan/ember palette, scanlines, ambient glow, shimmer.

Related files:
- `components/KonamiProvider.tsx`
- `components/EasterEggController.tsx`
- `components/ScrollyCanvas.tsx`
- `components/Overlay.tsx`
- `lib/sequence.ts`
- `app/globals.css`
- `app/layout.tsx`
- `public/sequence-konami/`

Architecture decisions:
- Use one reusable canvas renderer for both default and Konami sequences.
- Cache loaded frame arrays in refs.
- Preload default immediately and Konami during idle time.
- Keep Konami state centralized instead of scattering `useState` across components.

### Documentation Generation

This documentation set was added under `docs/` to preserve project knowledge and onboarding context.

Related files:
- `docs/DEVELOPMENT_HISTORY.md`
- `docs/KNOWLEDGE_BASE.md`
- `docs/LEARNING_NOTES.md`
- `docs/FUTURE_WORK.md`

## Feature Evolution Summary

### Scrollytelling Hero

Started as a single default canvas sequence. It evolved into a reusable scroll-scrub system with:
- Configurable sequence definitions.
- Active-sequence switching.
- Preloaded frame caches.
- Sticky 500vh scroll track.
- Overlay copy driven by mode.

### Portfolio Content

Started with generic creative-developer placeholder copy. It evolved into:
- Backend/integration engineering positioning.
- HotWax Systems experience content.
- Enterprise case studies.
- Public project cards.
- Documentation/writing section.
- Education and certification section.

### Interaction Layer

Started with animated navigation, cursor, marquee, and Easter egg popup. It evolved into:
- Shared Konami global mode.
- Theme-level visual override.
- Alternate sequence switching.
- Custom cursor hook fixes.
- Mobile-safe cursor disabling.

## Important Build Fixes

- Fixed invalid React Hooks usage in `CustomCursor.tsx` by replacing dynamic `useSpring` calls inside `.map()` with top-level static hook calls.
- Escaped JSX apostrophes in contact copy.
- Fixed Framer Motion `useTransform` typing in `Overlay.tsx` by keeping transform values numeric before formatting CSS strings.
- Fixed ref typing in `Projects.tsx` by matching `HTMLDivElement` ref targets.
- Fixed `ScrollyCanvas.tsx` idle callback typings for browser/Node TypeScript compatibility.
- Removed sticky-breaking root overflow behavior from global CSS.

## Current Verification State

Recent build command:

```bash
npm run build
```

Result:
- Next.js production build passes.
- TypeScript passes.
- ESLint passes.

## Current Git Status Notes

As of documentation generation, application changes from the content replacement and Konami-mode work are uncommitted.

Current notable untracked files:
- `components/KonamiProvider.tsx`
- `components/ProfileSections.tsx`
- `lib/content.ts`
- `public/sequence-konami/`
- `docs/`

