# Mohammad Qaseem — Portfolio Website

Personal portfolio website for Mohammad Qaseem, Senior Software Engineer. Built with Next.js and styled with Tailwind CSS.

**Live site:** [portfolio-qaseem.vercel.app](https://portfolio-qaseem.vercel.app/)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Fonts:** Hanken Grotesk, JetBrains Mono (Google Fonts)
- **Analytics:** Vercel Analytics
- **Validation:** Zod (runtime schema validation for portfolio data)
- **Testing:** Vitest + Testing Library + fast-check (property-based tests)
- **Deployment:** Vercel

## Features

- Animated hero section with an interactive terminal widget
- Typing animation and scroll-triggered reveal animations
- Custom cursor and animated hex grid background
- Responsive navigation with mobile menu
- Skills, projects, experience timeline, and contact sections
- SEO metadata, Open Graph tags, sitemap, robots.txt, and favicon generation
- Pre-build data validation via a Zod schema to catch portfolio data errors before deployment

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Run pre-build validation, then build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

> The `build` command automatically runs `scripts/prebuild-validate.ts` to validate `src/data/portfolio.json` against the Zod schema before compilation.

## Project Structure

```
src/
├── app/                  # Next.js App Router (layout, page, metadata files)
├── components/           # UI components grouped by section
│   ├── Contact/
│   ├── CustomCursor/
│   ├── Experience/
│   ├── Footer/
│   ├── Hero/
│   ├── HexBackground/
│   ├── Nav/
│   ├── Projects/
│   └── Skills/
├── data/
│   └── portfolio.json    # Single source of truth for all content
├── hooks/                # Custom React hooks (scroll animation, scroll spy, typing)
├── lib/                  # Utility functions and validation logic
└── types/                # TypeScript types for portfolio data
```

## Content

All portfolio content lives in `src/data/portfolio.json`. Updating that file is all that's needed to change the name, bio, skills, projects, experience, and social links shown on the site.

## Testing

```bash
npx vitest --run
```

Tests cover property-based validation of portfolio data, hero and nav rendering, skill rendering, and scroll animation behaviour.
