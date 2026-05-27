# Yash Engineering Portfolio

A cinematic engineering portfolio for backend, integrations, search, and production systems work.

## Overview

This repository contains a modern personal portfolio built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and an HTML5 canvas image-sequence hero. It presents Yash Verma's engineering experience across Java backends, Apache NiFi integrations, Apache Solr search systems, OMS workflows, and production debugging.

The site is designed for recruiters, engineering teams, and collaborators who want a clear view of technical background, case studies, writing, and contact details. It combines a premium scrollytelling interface with structured, editable content so the portfolio can evolve without rewriting component code.

## Key Highlights

- Scroll-scrubbed canvas hero powered by configurable image sequences.
- Alternate Konami mode with a second canvas sequence and global theme override.
- Data-driven profile, skills, experience, projects, writing, and education sections.
- Motion-led About section, kinetic skills marquee, horizontal desktop work showcase, and mobile fallbacks.
- Responsive navigation with desktop glass pill nav and a compact mobile panel.
- Contact form backed by a Next.js Route Handler and Resend email delivery.

## Tech Stack

- **Framework:** Next.js 14 App Router
- **Language:** TypeScript
- **UI:** React 18
- **Styling:** Tailwind CSS, global CSS theme layers
- **Animation:** Framer Motion
- **Smooth scroll:** Lenis
- **Rendering:** HTML5 Canvas image-sequence playback
- **Email delivery:** Resend HTTP API via Next.js Route Handler
- **Tooling:** ESLint, PostCSS, npm

## Getting Started

### Prerequisites

- Node.js 18.17 or newer
- npm
- Optional: Resend account/API key for contact form delivery

### Clone and Install

```bash
git clone https://github.com/yash-verma5/yash-engineering-portfolio.git
cd yash-engineering-portfolio
npm install
```

### Environment Variables

The app can run without email configuration, but the contact form will return a setup error until `RESEND_API_KEY` is provided.

Create a local environment file:

```bash
touch .env.local
```

Add the contact configuration:

```env
RESEND_API_KEY=your_resend_api_key
CONTACT_FROM_EMAIL=Portfolio Contact <onboarding@resend.dev>
CONTACT_TO_EMAIL=yashv521@gmail.com
```

Notes:

- `RESEND_API_KEY` is required for real email delivery.
- `CONTACT_TO_EMAIL` defaults to the profile email if omitted.
- For production, use a verified Resend sender/domain for `CONTACT_FROM_EMAIL`.
- Do not expose the Resend key with a `NEXT_PUBLIC_` prefix.

### Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Build and Start

```bash
npm run build
npm run start
```

If port `3000` is already in use:

```bash
npm run start -- -p 3001
```

## Available Scripts

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run build
```

Creates an optimized production build and runs type/lint checks as part of the Next.js build pipeline.

```bash
npm run start
```

Starts the production server after a successful build.

```bash
npm run lint
```

Runs the configured Next.js ESLint command.

## Project Structure

```text
app/
  api/contact/route.ts     Contact form email delivery endpoint
  globals.css              Global theme, overlays, Konami styling, Tailwind layers
  layout.tsx               Root layout and providers
  page.tsx                 Main portfolio page composition

components/
  ScrollyCanvas.tsx        Sticky canvas image-sequence hero
  Overlay.tsx              Scroll-linked hero text overlays
  Navbar.tsx               Desktop and mobile navigation
  KineticMarquee.tsx       Draggable infinite skills marquee
  ProfileSections.tsx      About, Skills, Experience, Writing, Education
  Projects.tsx             Desktop horizontal showcase and mobile project grid
  Contact.tsx              Contact UI and form state
  KonamiProvider.tsx       Global Konami mode state
  EasterEggController.tsx  Keyboard Easter egg activation
  CustomCursor.tsx         Desktop custom cursor
  LenisProvider.tsx        Smooth scroll provider

lib/
  content.ts               Editable profile, nav, skills, work, writing, education data
  sequence.ts              Image sequence configuration and frame URL builders

public/
  sequence/                Default hero frame sequence
  sequence-konami/         Alternate Konami frame sequence

docs/
  *.md                     Architecture, walkthrough, learning, and future-work notes
```

## Usage

Most portfolio content is edited from `lib/content.ts`.

Common edits:

- Update profile details in `profile`.
- Add or remove nav links in `navItems`.
- Edit About storytelling beats in `about.beats`.
- Update skills in `skillGroups`.
- Add experience bullets in `experience`.
- Add case studies in `projects`.
- Update writing and education entries in `writing` and `education`.

Image sequence behavior is configured in `lib/sequence.ts`:

```ts
export const sequenceConfigs = {
  default: {
    totalFrames: 89,
    buildSrc: (index) => `/sequence/frame_${String(index).padStart(3, "0")}_delay-0.066s.png`
  },
  konami: {
    totalFrames: 192,
    buildSrc: (index) => `/sequence-konami/${String(index + 1).padStart(5, "0")}.png`
  }
};
```

To change frame count or naming, update the relevant sequence config rather than editing the canvas component.

## Configuration

### Contact Form

The contact form posts to:

```text
POST /api/contact
```

The route validates `name`, `email`, and `message`, then sends through Resend.

Required for delivery:

```env
RESEND_API_KEY=your_resend_api_key
```

Optional:

```env
CONTACT_FROM_EMAIL=Portfolio Contact <verified-sender@example.com>
CONTACT_TO_EMAIL=yashv521@gmail.com
```

### Image Sequences

Frame assets are served from `public/`:

- Default sequence: `/sequence/...`
- Konami sequence: `/sequence-konami/...`

The active frame count and filename builders live in `lib/sequence.ts`.

## Roadmap / Status

Current status:

- Portfolio UI, scrollytelling hero, project sections, mobile navigation, Konami mode, and contact API are implemented.
- Documentation exists under `docs/` for architecture, code walkthrough, learning notes, and future work.

Potential next improvements:

- Add spam protection and rate limiting for `/api/contact`.
- Add verified production sender/domain for Resend.
- Replace GreenMart placeholder links when the repo/demo are available.
- Add a downloadable resume.
- Add lower-resolution/mobile-specific image sequences.
- Continue optimizing frame formats and caching strategy.

## Contributing

This is a personal portfolio repository, but small improvements are welcome if they preserve the project's direction.

Suggested workflow:

```bash
git checkout -b feature/your-change
npm run build
```

Keep changes focused, avoid unrelated refactors, and update documentation when behavior or setup changes.

## License

No license file is currently included in this repository.

## Author

**Yash Verma**  
Enterprise Software Engineer / Backend Developer  
Indore, Madhya Pradesh, India

- GitHub: [yash-verma5](https://github.com/yash-verma5)
- LinkedIn: [linkedin.com/in/yashverma5](https://linkedin.com/in/yashverma5)
- Documentation: [Dynamic Docs](https://yash-verma5.github.io/Dynamic-Docs/)
- Blog: [Hashnode](https://yashv521.hashnode.dev/)
- Email: [yashv521@gmail.com](mailto:yashv521@gmail.com)
