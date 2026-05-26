# Future Work

This document lists missing features, technical debt, performance opportunities, accessibility improvements, SEO tasks, and cleanup ideas.

## Missing Features

### Real Contact Form Delivery

Current state:
- `components/Contact.tsx` contains a local demo form state.
- It does not send email or persist messages.

Potential implementations:
- Next.js Route Handler + Resend.
- Formspree endpoint.
- EmailJS client-side integration.
- Simple `mailto:` only, if no backend is desired.

Related files:
- `components/Contact.tsx`
- future `app/api/contact/route.ts`

### GreenMart Links

Current placeholders:
- `#greenmart-repo-placeholder`
- `#greenmart-live-placeholder`

Related file:
- `lib/content.ts`

Action:
- Replace with real GitHub and live demo URLs when available.

### Resume Download

Potential feature:
- Add a downloadable PDF resume CTA.
- Place under hero, contact, or navbar.

Related files:
- `public/`
- `lib/content.ts`
- `components/Overlay.tsx`
- `components/Contact.tsx`

### Project Detail Pages

Current state:
- Case studies are cards only.

Potential feature:
- Add `/work/[slug]` pages for deeper project writeups.
- Keep sensitive enterprise details generalized.

Related files:
- `app/work/[slug]/page.tsx`
- `lib/content.ts`

## Technical Debt

### Large Image Assets in Git

Current state:
- Default and Konami frame sequences are stored in Git under `public/`.

Risks:
- Repository size grows quickly.
- Clones and pushes become slow.

Options:
- Compress frames further.
- Convert suitable sequences to WebP/AVIF.
- Use Git LFS.
- Host sequences on CDN/object storage.
- Keep lower-res mobile frame set.

Related folders:
- `public/sequence/`
- `public/sequence-konami/`

### Canvas Preload Memory Use

Current state:
- Default and Konami images are cached as `HTMLImageElement[]`.

Risks:
- 89 + 192 large frames can use a lot of memory.
- Lower-memory devices may struggle.

Improvements:
- Use lower-resolution mobile sequence.
- Lazy-load Konami only after desktop detection.
- Evict Konami frames after mode ends if memory pressure matters.
- Use `createImageBitmap` where supported and benchmark.

Related files:
- `components/ScrollyCanvas.tsx`
- `lib/sequence.ts`

### Konami Provider Timer Reentrancy

Current state:
- Repeated activation clears the old timer and restarts mode.

Future hardening:
- Add tests or small utility for timer behavior.
- Add state-machine style mode transitions if more Easter eggs are added.

Related file:
- `components/KonamiProvider.tsx`

### Content File Growth

Current state:
- `lib/content.ts` stores all content categories.

Future cleanup:
- Split into `profile.ts`, `projects.ts`, `experience.ts`, etc. if it grows.
- Keep a barrel export in `lib/content.ts`.

## Performance Improvements

### Mobile Canvas Strategy

Current state:
- Canvas sequence is active on all viewport sizes.

Potential improvements:
- Use fewer frames on mobile.
- Use lower-res mobile assets.
- Respect `prefers-reduced-motion` with a static frame.
- Defer Konami sequence preload on touch devices.

Related files:
- `components/ScrollyCanvas.tsx`
- `lib/sequence.ts`

### Horizontal Projects Scroll

Current state:
- Desktop uses pinned horizontal track.
- Mobile falls back to vertical grid.

Potential improvements:
- Add ResizeObserver for track measurement.
- Recalculate after fonts/assets settle.
- Audit with browser performance panel.

Related file:
- `components/Projects.tsx`

### Framer Motion Use

Current state:
- Several components use transforms and springs.

Potential improvements:
- Audit re-renders in React DevTools Profiler.
- Keep scroll subscriptions isolated.
- Memoize static arrays where useful.

Related files:
- `components/Overlay.tsx`
- `components/Projects.tsx`
- `components/KineticMarquee.tsx`
- `components/CustomCursor.tsx`

### Image Encoding

Current state:
- PNG sequences are heavy.

Potential improvements:
- Convert default and Konami frames to WebP if alpha is not required.
- Use AVIF if decode performance is acceptable.
- Benchmark decode time, not just file size.

## Accessibility Improvements

### Reduced Motion

Current state:
- Earlier implementation had reduced-motion checks; current dual-sequence implementation should be revisited.

Recommended:
- If `prefers-reduced-motion: reduce`, show a static hero frame and disable scroll-scrub animations.
- Reduce marquee motion.
- Disable tilt effects.

Related files:
- `components/ScrollyCanvas.tsx`
- `components/Overlay.tsx`
- `components/KineticMarquee.tsx`
- `components/Projects.tsx`

### Keyboard Navigation

Recommended:
- Verify all nav buttons and links are reachable.
- Add visible focus styles for custom-styled links/buttons.
- Confirm Konami HUD restore button is focus-visible.

Related files:
- `app/globals.css`
- `components/Navbar.tsx`
- `components/EasterEggController.tsx`
- `components/Contact.tsx`

### Canvas Accessibility

Current state:
- Canvas has `aria-label`.

Potential improvements:
- Add a hidden text summary near the hero for screen readers.
- Ensure hero CTAs are accessible outside visual overlay if needed.

Related files:
- `components/ScrollyCanvas.tsx`
- `components/Overlay.tsx`

### Custom Cursor

Current state:
- Disabled on touch/coarse pointer devices.

Potential improvements:
- Also disable when `prefers-reduced-motion` is active.
- Ensure it never hides the system cursor for keyboard-only users.

Related file:
- `components/CustomCursor.tsx`

## SEO Improvements

### Metadata

Current state:
- Basic title and description exist in `app/layout.tsx`.

Recommended:
- Add Open Graph metadata.
- Add Twitter card metadata.
- Add canonical URL after deployment URL is final.
- Add author metadata.

Related file:
- `app/layout.tsx`

### Structured Data

Potential additions:
- Person schema.
- WebSite schema.
- CreativeWork or Article links for documentation/blog.

Related files:
- `app/layout.tsx`
- possible `components/JsonLd.tsx`

### Sitemap and Robots

Recommended:
- Add `app/sitemap.ts`.
- Add `app/robots.ts`.

### Content SEO

Recommended:
- Ensure headings follow a sane hierarchy.
- Add descriptive link text.
- Include deployment-ready social preview image.

## Code Cleanup Opportunities

### Extract Section Shell

Current state:
- `ProfileSections.tsx` has local `SectionShell`.

Potential:
- Move reusable section shell to its own component if more sections are added.

### Contact Form Components

Current state:
- `Contact.tsx` is large.

Potential:
- Extract `ContactLinkGrid`, `ContactForm`, and `SoundToggle`.

### Sequence Loader Utility

Current state:
- Sequence preload logic lives inside `ScrollyCanvas.tsx`.

Potential:
- Extract a `useImageSequenceCache` hook.
- Add unit tests for frame URL generation and frame index mapping.

### Konami Visual Tokens

Current state:
- Konami CSS is appended in `app/globals.css`.

Potential:
- Organize global CSS into thematic sections.
- Move long data-URI grain into a named CSS variable or separate asset.

## Deployment Checklist

Before production deployment:

- Replace GreenMart placeholder links.
- Decide whether to commit all frame assets or move them to CDN/LFS.
- Add Open Graph metadata.
- Test in Chrome, Safari, Firefox.
- Test on mobile Safari and Android Chrome.
- Run Lighthouse for accessibility/performance/SEO.
- Confirm contact method works.
- Confirm Konami mode starts and restores cleanly.
- Confirm `npm run build` passes.

