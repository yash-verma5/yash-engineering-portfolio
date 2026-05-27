# Development History

This document reconstructs the current development history from the Git log, file structure, feature branches, current working changes, and project configuration.

## Repository Snapshot

- Project name: `yash-engineering-portfolio`
- Framework: Next.js 14 App Router
- Language: TypeScript
- Styling: Tailwind CSS plus global CSS theme effects
- Animation: Framer Motion
- Scroll smoothing: Lenis
- Core visual mechanic: sticky HTML5 canvas image-sequence scrollytelling
- Current primary branch: `main`
- Current feature stack includes: `feature/storytelling-profile-sections`, `feature/kinetic-skills-marquee`, `feature/premium-work-contact-sections`, `feature/mobile-navbar-refinement`, and `feature/project-knowledge-docs`
- Current working changes after the feature stack: Work section layout fix and real contact API route

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

## Recent Feature Branch Milestones

The recent work was split into sequential feature branches so each PR can be reviewed and merged manually.

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

### Storytelling Profile Sections

Implemented:
- Replaced the static About section with a scroll-led storytelling section.
- Added narrative beats for identity, systems work, debugging style, and core stack.
- Added desktop-only layered Z-space cards, signal rail, progressive text reveal, and subtle pointer lighting.
- Kept mobile simpler with stacked readable cards.
- Added richer staged motion for Skills, Experience, Writing, and Education.

Related files:
- `components/ProfileSections.tsx`
- `lib/content.ts`

Architecture decisions:
- Keep content in `lib/content.ts` and render the interaction around data.
- Use Framer Motion motion values for scroll progress rather than React state.
- Keep mobile fallback less complex for performance and readability.

### Kinetic Skills Marquee Refinement

Implemented:
- Slowed the infinite skills rail for readability.
- Reworked the marquee into a continuous motion-value/rAF model.
- Added smooth hover pause/resume.
- Added pointer dragging with direction-aware momentum.
- Preserved seamless infinite wrapping with `wrap(-50, 0, value)`.

Related file:
- `components/KineticMarquee.tsx`

Architecture decisions:
- Use refs for hot interaction state so pointer and animation-frame updates avoid React re-renders.
- Let drag release velocity determine the new autoplay direction.

### Work and Contact Section Polish

Implemented:
- Improved Work card hover treatment and horizontal progress cue.
- Added more immersive case-study card framing.
- Refined Contact with ambient motion, staged reveal, stronger card treatment, and better link motion.

Related files:
- `components/Projects.tsx`
- `components/Contact.tsx`

### Mobile Navbar Refinement

Implemented:
- Removed the intrusive bottom floating island as the default mobile state.
- Added a quieter top-right mobile hamburger trigger integrated into the navbar.
- Added a premium glass mobile panel with section labels, active-section state, progress cue, and shortcuts.
- Stabilized navbar scroll transitions with rAF-throttled scroll tracking and hysteresis.
- Replaced layout-changing scroll state with transform/opacity-based animation.

Related file:
- `components/Navbar.tsx`

### Work Layout Fix and Contact Email Delivery

Implemented after visual review:
- Fixed Work section overlap by placing the horizontal card rail below the heading instead of under it.
- Reduced desktop Work card height and title scale so the section fits the viewport more cleanly.
- Added `app/api/contact/route.ts` for real email sending through Resend's HTTP API.
- Updated Contact form to POST to `/api/contact`.
- Replaced the old fake "Message staged" state with "Message sent" and a `Back to form` button.
- Added an error state with direct email fallback when email sending is not configured or provider delivery fails.

Related files:
- `components/Projects.tsx`
- `components/Contact.tsx`
- `app/api/contact/route.ts`

Configuration:
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

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
- Mobile brand tap Konami trigger.
- Quiet mobile navbar trigger plus richer mobile nav panel.
- Smooth navbar scroll state transitions using hysteresis and transform/opacity animation.

### Contact Delivery

Started as a local simulated contact form. It evolved into:
- A real Next.js Route Handler at `/api/contact`.
- Server-side payload validation.
- Resend API integration through environment variables.
- HTML escaping before rendering submitted content into an email body.
- UI success, error, direct email fallback, and back-to-form recovery.

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

The recent feature stack has been pushed to GitHub as separate branches for manual PR review. The latest local working changes are the Work layout correction and `/api/contact` delivery route.
