# Architectural Decisions

This document records inferred decisions from the current codebase. These are useful when explaining why the project is structured the way it is.

## Decision: Use Canvas for the Hero Instead of Video

**Why it was made:**
The hero needs frame-accurate scroll scrubbing. `ScrollyCanvas` maps scroll progress directly to an image frame (`components/ScrollyCanvas.tsx:288-291`) and draws that frame onto a `<canvas>` (`components/ScrollyCanvas.tsx:304-308`).

**Advantages:**

- Precise progress-to-frame control.
- Easy to switch frame source for Konami mode.
- Avoids managing video `currentTime` drift and codec seek behavior.
- Only one canvas element is in the DOM.

**Disadvantages:**

- Requires custom preloading and caching.
- Many image files can hurt first load.
- Canvas is not semantic, so text must be rendered separately.

**Alternatives considered:**

- `<video>` scrubbed by scroll.
- Lottie or SVG animation.
- WebGL texture sequence.

**Files involved:**

- `components/ScrollyCanvas.tsx`
- `components/Overlay.tsx`
- `lib/sequence.ts`
- `public/sequence/`
- `public/sequence-konami/`

## Decision: Keep Scroll Track and Sticky Viewport in CSS

**Why it was made:**
The hero uses an outer `h-[500vh]` track and an inner sticky full-screen viewport (`components/ScrollyCanvas.tsx:302-303`). This keeps the browser responsible for layout while JavaScript only draws frames.

**Advantages:**

- Simple mental model.
- Works with normal document flow.
- Avoids a heavy pinning library for the hero.

**Disadvantages:**

- Root/ancestor overflow rules can break sticky.
- Requires careful section height tuning.

**Alternatives considered:**

- GSAP ScrollTrigger pinning.
- Fixed canvas with manual scroll math.
- Full-screen virtual scroll.

**Files involved:**

- `components/ScrollyCanvas.tsx`
- `app/globals.css`

## Decision: Use Framer Motion for UI and Scroll Animation

**Why it was made:**
The project needs polished motion: nav entrance, active pill layout, overlay transforms, project track movement, cursor trails, and marquee motion. Framer Motion handles those declaratively.

**Advantages:**

- Motion values avoid React re-renders on scroll/pointer updates.
- `useScroll` and `useTransform` make scroll timelines readable.
- `AnimatePresence` simplifies mount/unmount transitions.
- Springs make interactions feel premium.

**Disadvantages:**

- Easy to overuse.
- Some Framer-driven properties can still be expensive if they trigger layout or paint.
- Complex pinned interactions may eventually be easier in GSAP.

**Alternatives considered:**

- GSAP for all animation.
- CSS-only transitions.
- Raw `requestAnimationFrame` loops.

**Files involved:**

- `components/Navbar.tsx`
- `components/ScrollyCanvas.tsx`
- `components/Overlay.tsx`
- `components/Projects.tsx`
- `components/CustomCursor.tsx`
- `components/KineticMarquee.tsx`
- `components/EasterEggController.tsx`

## Decision: Add Lenis for Site-Wide Smooth Scroll

**Why it was made:**
The portfolio is scroll-led. Native wheel scrolling can feel abrupt against cinematic canvas and horizontal sections. Lenis adds smoother interpolation while preserving document flow.

**Advantages:**

- Better premium scroll feel.
- Still compatible with CSS sticky sections.
- Centralized in `LenisProvider`.

**Disadvantages:**

- Adds a global rAF loop.
- Anchor navigation can benefit from direct Lenis integration later.
- Must respect reduced motion and touch devices.

**Alternatives considered:**

- Native scroll only.
- GSAP ScrollSmoother.
- CSS `scroll-behavior`.

**Files involved:**

- `components/LenisProvider.tsx`
- `app/layout.tsx`
- `app/globals.css`

## Decision: Keep GSAP Out for Now

**Why it was made:**
The current scroll orchestration is achievable with CSS sticky + Framer Motion. Adding GSAP would increase dependency and coordination complexity without a clear need yet.

**Advantages:**

- Smaller animation stack.
- Fewer scroll systems to sync.
- Less cleanup complexity.

**Disadvantages:**

- Complex pinned timelines may be harder if the site grows.
- Horizontal scroll could eventually benefit from ScrollTrigger.

**Alternatives considered:**

- GSAP ScrollTrigger for hero and projects.
- GSAP only for horizontal projects.

**Files involved:**

- `components/ScrollyCanvas.tsx`
- `components/Projects.tsx`
- `components/LenisProvider.tsx`

## Decision: Centralize Portfolio Content in `lib/content.ts`

**Why it was made:**
The site must feel personal and easy to update. Data-driven arrays let components focus on layout/interaction while content lives in one file.

**Advantages:**

- Easy to update profile, links, skills, projects, and education.
- Cards/sections are generated consistently.
- Reduces duplicate copy.

**Disadvantages:**

- Large TypeScript object can grow unwieldy.
- No schema validation beyond inference.
- Non-developers cannot edit it comfortably.

**Alternatives considered:**

- MDX files.
- JSON data.
- Headless CMS.
- Hardcoded JSX copy.

**Files involved:**

- `lib/content.ts`
- `components/Navbar.tsx`
- `components/Overlay.tsx`
- `components/ProfileSections.tsx`
- `components/Projects.tsx`
- `components/Contact.tsx`

## Decision: Use React Context for Konami Mode

**Why it was made:**
Konami mode affects multiple independent parts: root theme, canvas sequence, overlay copy, activation UI, and navbar tap trigger. Context provides shared state without prop drilling.

**Advantages:**

- Small, built-in state model.
- Any component can call `useKonamiMode()`.
- Central timer and cleanup logic.

**Disadvantages:**

- Context consumers re-render when state changes.
- DOM class mutation lives inside React logic.

**Alternatives considered:**

- Zustand store.
- Redux.
- Custom DOM events.
- URL query flag.

**Files involved:**

- `components/KonamiProvider.tsx`
- `components/EasterEggController.tsx`
- `components/Navbar.tsx`
- `components/ScrollyCanvas.tsx`
- `components/Overlay.tsx`
- `app/globals.css`

## Decision: Use Two Image Sequences for Default and Konami Modes

**Why it was made:**
The easter egg is meant to visually override the hero, not just show a badge. The same canvas engine can draw either sequence by switching `activeKey` (`components/ScrollyCanvas.tsx:79`).

**Advantages:**

- Reuses one rendering engine.
- Keeps Konami mode cinematic.
- Avoids duplicate hero components.

**Disadvantages:**

- More assets to ship/cache.
- Frame-count/config mismatch can cause failed requests.

**Alternatives considered:**

- CSS-only theme change.
- Video overlay.
- Single sequence with color filters.

**Files involved:**

- `components/ScrollyCanvas.tsx`
- `lib/sequence.ts`
- `public/sequence/`
- `public/sequence-konami/`

## Decision: Store Image Sequences in `public/`

**Why it was made:**
Next.js serves `public/` assets directly by path. Sequence frame URLs can be built predictably with `/sequence/...` and `/sequence-konami/...`.

**Advantages:**

- Simple static asset serving.
- No import bundle bloat.
- Works with canvas `new Image()` loading.

**Disadvantages:**

- No automatic `next/image` optimization.
- Cache headers need explicit deployment configuration if long-lived caching is desired.
- Large assets increase deployment size.

**Alternatives considered:**

- CDN-hosted frames.
- Importing assets through bundler.
- Video file.

**Files involved:**

- `lib/sequence.ts`
- `components/ScrollyCanvas.tsx`
- `public/sequence/`
- `public/sequence-konami/`
- `vercel.json` if configured.

## Decision: Progressive Frame Loading

**Why it was made:**
Waiting for every frame before showing the page creates a slow first-load experience. The optimized loader reveals after frame 0 and keeps loading in batches (`components/ScrollyCanvas.tsx:220-238`).

**Advantages:**

- Faster first visual reveal.
- Avoids overwhelming browser/network with all requests at once.
- Nearest-frame fallback prevents white flashes.

**Disadvantages:**

- Fast scrolling before all frames load can reuse nearby frames.
- More complex loader code.

**Alternatives considered:**

- Preload entire sequence before reveal.
- Load on demand only.
- Use video.

**Files involved:**

- `components/ScrollyCanvas.tsx`
- `lib/sequence.ts`

## Decision: Desktop Horizontal Projects, Mobile Vertical Grid

**Why it was made:**
Horizontal pinned scrolling feels premium on desktop, but mobile horizontal pinning can feel heavy and awkward. The component renders a desktop pinned section and a mobile grid fallback. The desktop rail is placed below the Work heading so cards do not overlap the title.

**Advantages:**

- Desktop gets a high-impact showcase.
- Mobile gets predictable reading flow.
- Avoids heavy tilt/cursor behavior on touch devices.

**Disadvantages:**

- Two layouts to maintain.
- Content must work in both card sizes.

**Alternatives considered:**

- Same horizontal layout everywhere.
- Simple grid everywhere.
- Carousel on mobile.

**Files involved:**

- `components/Projects.tsx`
- `lib/content.ts`

## Decision: Quiet Mobile Trigger With Rich Mobile Nav Panel

**Why it was made:**
The first mobile island concept was visually too intrusive in its collapsed state. The current design keeps the resting state as a small top-right trigger inside the navbar, then opens a richer glass navigation panel only after user intent.

**Advantages:**

- Closed state does not compete with hero/content.
- Open state still provides labels, shortcuts, active section state, and progress context.
- Desktop navbar remains unchanged.
- Escape and backdrop close keep the interaction recoverable.

**Disadvantages:**

- The mobile nav has separate markup from desktop nav.
- Focus management should be audited if the panel becomes more modal-like.

**Alternatives considered:**

- Bottom floating island.
- Full-screen mobile menu.
- Plain hamburger dropdown.

**Files involved:**

- `components/Navbar.tsx`
- `lib/content.ts`

## Decision: Use Tailwind for Styling

**Why it was made:**
The design is highly bespoke, dark, and interaction-heavy. Tailwind allows fast iteration in components while keeping a small custom theme.

**Advantages:**

- Rapid styling.
- Responsive utilities inline with markup.
- Fewer custom CSS files.

**Disadvantages:**

- Long class names in JSX.
- Repeated utility combinations can become informal patterns.

**Alternatives considered:**

- CSS Modules.
- Styled Components.
- Vanilla CSS.

**Files involved:**

- `tailwind.config.ts`
- `app/globals.css`
- All JSX components.

## Decision: Disable/Simplify Heavy Interactions on Mobile

**Why it was made:**
Mobile devices have touch input, smaller screens, and less predictable performance. Cursor and tilt interactions do not translate well to touch.

**Advantages:**

- Better battery/performance.
- Cleaner mobile UX.
- Reduced layout pressure.

**Disadvantages:**

- Mobile users see fewer premium effects.
- Need separate interaction paths like five-tap Konami activation.

**Alternatives considered:**

- Keep all effects on all devices.
- Use mobile-specific gesture animations.

**Files involved:**

- `components/CustomCursor.tsx`
- `components/Projects.tsx`
- `components/ScrollyCanvas.tsx`
- `components/Navbar.tsx`

## Decision: Use a Next Route Handler for Contact Email

**Why it was made:**
The contact form should send real messages instead of showing a fake success state. A Next.js Route Handler keeps the email API key server-side while allowing the client form to remain lightweight.

**Advantages:**

- API secrets stay off the client.
- Form can show real success/failure states.
- Direct email fallback remains available.
- Resend can be configured through Vercel environment variables.

**Disadvantages:**

- Requires provider configuration before production delivery works.
- Needs spam/rate-limit hardening if the site receives meaningful traffic.
- Sender/domain verification is required for a professional `from` address.

**Alternatives considered:**

- Formspree/Getform.
- EmailJS client-side delivery.
- `mailto:` only.
- Remove form entirely.

**Files involved:**

- `components/Contact.tsx`
- `app/api/contact/route.ts`
- `lib/content.ts`
