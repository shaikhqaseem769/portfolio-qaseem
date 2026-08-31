# Design Document: Qaseem Portfolio Website

## Overview

The Qaseem Portfolio Website is a statically-generated single-page application (SPA) built with **Next.js 14 (App Router)** and **TypeScript (strict mode)**. It presents a Cyber-Brutalism + Modern Minimalism visual language: pure black background (`#000000`), red (`#FF0000`) primary accent, white/grey text, 0 px border-radius everywhere, and two Google Fonts (Hanken Grotesk + JetBrains Mono).

All personalised content lives in a single source-of-truth file — `src/data/portfolio.json` — so the owner can update the portfolio by editing JSON without touching any component code. TypeScript interfaces exported from `src/types/portfolio.ts` enforce the schema at build time.

The site is deployed to **Vercel** with no additional configuration. A build-time validation step (run via a Node.js script invoked from `package.json`'s `prebuild` hook) checks the JSON file against required fields and terminates the build with a non-zero exit code if any required field is missing.

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Styling | **Tailwind CSS v3** | Design system tokens map naturally to Tailwind's config; utility classes keep styles co-located with components; no CSS Modules overhead for a single-page site |
| Animation | **Intersection Observer API** + CSS transitions | Lightweight, no library dependency, native browser support, integrates cleanly with `prefers-reduced-motion` |
| Terminal animation | **Custom React hook** (`useTypingAnimation`) | Fine-grained control over loop/pause/resume based on visibility; no heavy animation library needed |
| Type validation | **TypeScript import + Zod schema at build time** | TypeScript catches shape errors at compile time; Zod provides runtime validation in `prebuild` with clear error messages |
| Icons | **Lucide React** | Tree-shakeable, TypeScript-first, consistent style |
| Font loading | **`next/font/google`** | Automatic self-hosting, layout-shift prevention, no external network request at runtime |

---

## Architecture

### High-Level Data Flow

```
src/data/portfolio.json
        │
        ▼
  prebuild script (Zod validation)
        │  fails → build aborts with error
        ▼
  app/page.tsx  (server component, reads JSON at build time)
        │
        ▼
  Section components  (Client components only where interactivity needed)
        │
        ▼
  Static HTML + CSS + JS bundle → Vercel CDN
```

The root page (`app/page.tsx`) is a **React Server Component**. It imports `portfolio.json` directly (TypeScript module import) and passes typed props down to each section. Only components that require browser APIs (Intersection Observer, typing animation, hamburger toggle) are marked `"use client"`.

### Component Tree

```
app/
└── layout.tsx              (font loading, global metadata, body bg)
    └── page.tsx            (server component — assembles all sections)
        ├── <Nav>           (client — scroll spy, hamburger toggle)
        ├── <HeroSection>   (server wrapper)
        │   └── <TerminalWidget>  (client — typing animation)
        ├── <SkillsSection> (client — scroll animation)
        ├── <ProjectsSection> (client — scroll animation)
        │   └── <ProjectCard> (× n)
        ├── <ExperienceSection> (client — scroll animation, timeline)
        │   └── <TimelineEntry> (× n)
        ├── <ContactSection> (server — static links)
        └── <Footer>        (server — static)
```

### Server vs Client Split

| Component | Type | Reason |
|---|---|---|
| `app/layout.tsx` | Server | Font setup, global meta — no browser APIs |
| `app/page.tsx` | Server | Pure data assembly, no interactivity |
| `Nav` | Client | Scroll spy (Intersection Observer), hamburger state |
| `HeroSection` | Server | Static HTML; child handles animation |
| `TerminalWidget` | Client | `useTypingAnimation` hook needs `requestAnimationFrame` |
| `SkillsSection` | Client | `useScrollAnimation` hook needs Intersection Observer |
| `ProjectsSection` | Client | `useScrollAnimation` stagger |
| `ProjectCard` | Server (inside ProjectsSection client boundary) | Static card markup |
| `ExperienceSection` | Client | Per-entry slide animation |
| `TimelineEntry` | Server (inside ExperienceSection boundary) | Static markup |
| `ContactSection` | Server | Static links only |
| `Footer` | Server | Static |

---

## Project Structure

```
portfolio-qaseem/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout: fonts, metadata, body styles
│   │   ├── page.tsx                 # Single page — renders all sections
│   │   ├── globals.css              # Tailwind directives + CSS custom props
│   │   ├── robots.txt               # Static robots.txt (or generated via route)
│   │   └── sitemap.ts               # Next.js sitemap generation (app router)
│   ├── components/
│   │   ├── Nav/
│   │   │   ├── Nav.tsx
│   │   │   └── MobileMenu.tsx
│   │   ├── Hero/
│   │   │   ├── HeroSection.tsx
│   │   │   └── TerminalWidget.tsx
│   │   ├── Skills/
│   │   │   └── SkillsSection.tsx
│   │   ├── Projects/
│   │   │   ├── ProjectsSection.tsx
│   │   │   └── ProjectCard.tsx
│   │   ├── Experience/
│   │   │   ├── ExperienceSection.tsx
│   │   │   └── TimelineEntry.tsx
│   │   ├── Contact/
│   │   │   └── ContactSection.tsx
│   │   └── Footer/
│   │       └── Footer.tsx
│   ├── hooks/
│   │   ├── useScrollAnimation.ts    # Intersection Observer + stagger
│   │   ├── useTypingAnimation.ts    # Typing loop with pause/resume
│   │   └── useScrollSpy.ts          # Active section detection for Nav
│   ├── data/
│   │   └── portfolio.json           # Single source of truth
│   ├── types/
│   │   └── portfolio.ts             # Exported TypeScript interfaces
│   └── lib/
│       └── validatePortfolio.ts     # Zod schema + validation helper
├── scripts/
│   └── prebuild-validate.ts         # CLI script: validates portfolio.json, exits 1 on error
├── public/
│   └── og-image.jpg                 # Default OG image (≥ 1200×630 px)
├── tailwind.config.ts               # Design system tokens
├── tsconfig.json                    # strict: true
├── next.config.ts
└── package.json                     # "prebuild": "tsx scripts/prebuild-validate.ts"
```

---

## Components and Interfaces

### Nav

**File:** `src/components/Nav/Nav.tsx` (`"use client"`)

**Props:**
```typescript
interface NavProps {
  ownerName: string;
  cvUrl: string;
  sections: Array<{ id: string; label: string }>;
}
```

**Behaviour:**
- `position: fixed; top: 0; z-index: 50` via Tailwind
- Owner name rendered in `font-mono text-red-500` (JetBrains Mono, `#FF0000`)
- Section anchors: smooth-scroll with `scrollIntoView({ behavior: 'smooth', block: 'start' })` plus manual offset = nav height (64px)
- Resume button: `<a href={cvUrl} target="_blank" rel="noopener noreferrer">` with Lucide `Terminal` icon
- `useScrollSpy` hook drives active link state (red text + bottom border)
- Mobile (`< 768px`): links hidden, hamburger (`Menu`/`X` Lucide icons) shown; click toggles full-screen overlay via `MobileMenu`
- Overlay closes on link click before scroll begins

**MobileMenu** (`MobileMenu.tsx`): Renders a full-screen `fixed inset-0 bg-black z-40` overlay with the same nav links plus close affordance.

---

### HeroSection

**File:** `src/components/Hero/HeroSection.tsx` (Server Component)

**Props:**
```typescript
interface HeroSectionProps {
  data: HeroData;      // from PortfolioData['hero']
  cvUrl: string;
}
```

**Layout:**
- `min-h-screen` two-column grid (`lg:grid-cols-2`) with single-column fallback
- Left column: pre-heading label → headline → bio → tech-stack chips → CTA buttons
- Right column (`lg:block hidden` + visible on smaller as stacked below): `<TerminalWidget>`

**Headline rendering:** The `accentWord` from JSON is wrapped in a `<span class="text-red-500">` span; all other headline words are white.

**Tech-stack chips:** `border border-white text-white uppercase font-mono text-xs` — no background, 0px radius.

**CTA buttons:**
- "VIEW PROJECTS →": `bg-red-500 text-white` + `clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))` at `lg` breakpoint
- "DOWNLOAD CV": `border border-white text-white bg-transparent` + same clip-path at `lg`

---

### TerminalWidget

**File:** `src/components/Hero/TerminalWidget.tsx` (`"use client"`)

**Props:**
```typescript
interface TerminalWidgetProps {
  code: string;   // Full code string to type out, from Data_File terminal.code
}
```

**Behaviour:**
- Uses `useTypingAnimation(code, { pauseMs: 1000 })` hook
- Renders a mock terminal window: dark header bar with three dot buttons (decorative), scrollable code body
- Displayed text is the substring `code.slice(0, cursor)` rendered in `font-mono text-sm text-green-400` (or white) with a blinking `<span class="animate-blink text-red-500">█</span>` appended
- `useIntersectionObserver` ref on the container pauses/resumes the animation when off/on screen
- Loops: after reaching `code.length`, waits `pauseMs` then resets cursor to 0

---

### SkillsSection

**File:** `src/components/Skills/SkillsSection.tsx` (`"use client"`)

**Props:**
```typescript
interface SkillsSectionProps {
  skills: string[];
  heading: string;
}
```

**Layout:**
- Section heading in Hanken Grotesk with same `text-3xl font-bold` sizing as other sections
- Chip grid: `flex flex-wrap gap-3`; at `< 768px` each chip is `w-full` (single column)
- Each chip: `border border-white text-white uppercase font-mono text-xs px-4 py-2 rounded-none transition-colors hover:border-red-500 hover:text-red-500`
- Stagger scroll animation via `useScrollAnimation` on the container

---

### ProjectsSection & ProjectCard

**File:** `src/components/Projects/ProjectsSection.tsx` (`"use client"`)

**Props:**
```typescript
interface ProjectsSectionProps {
  projects: ProjectData[];
  heading: string;
}
```

**Grid:** `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`

**ProjectCard props:**
```typescript
interface ProjectCardProps {
  project: ProjectData;
}
```

**Card layout:**
- `border border-white/20 bg-black p-6 flex flex-col gap-4 transition-all duration-200 ease-in-out hover:border-red-500`
- Optional thumbnail: `<Image>` from `next/image` with `alt={project.title}`
- Title: Hanken Grotesk bold
- Description: capped at 160 chars (enforced in Data_File, also clamped in render)
- Tech chips: same ghost style as skills chips
- Link buttons rendered only when URLs present; both use `target="_blank" rel="noopener noreferrer"`

---

### ExperienceSection & TimelineEntry

**File:** `src/components/Experience/ExperienceSection.tsx` (`"use client"`)

**Props:**
```typescript
interface ExperienceSectionProps {
  experience: ExperienceData[];
  heading: string;
}
```

**Timeline structure:**
- Outer container: `relative pl-8` (leaves space for the vertical line)
- Vertical line: `absolute left-3 top-0 bottom-0 w-px bg-white/20`
- Each entry: `relative` with `::before` pseudo-element OR a `<span>` absolutely positioned at `left: -1.25rem` rendering the diamond marker (`rotate-45 w-3 h-3 bg-red-500`)
- Entries are sorted in reverse chronological order in the component (or already sorted in JSON — sort by `startDate` descending at render time)
- Empty state: `<p>No experience entries available.</p>` when array is empty
- Each entry animates via `useScrollAnimation({ threshold: 0.1, once: true })` with slide-in-from-left

**TimelineEntry props:**
```typescript
interface TimelineEntryProps {
  entry: ExperienceData;
  animationStyle: React.CSSProperties;  // injected by parent for stagger
}
```

Date formatting helper: `formatDate(dateStr: string): string` uses `Intl.DateTimeFormat` with `{ month: 'short', year: 'numeric' }` or returns "Present".

---

### ContactSection

**File:** `src/components/Contact/ContactSection.tsx` (Server Component)

**Props:**
```typescript
interface ContactSectionProps {
  email: string;
  socialLinks: SocialLink[];
  heading: string;
}
```

- Email: `<a href={`mailto:${email}`} className="hover:text-red-500 transition-colors">`
- Social links: icon derived from `platform` name via a `PLATFORM_ICONS` lookup map (Lucide icons: `Github`, `Linkedin`, `Twitter`, `Globe` as fallback)
- Each link: `target="_blank" rel="noopener noreferrer"` + `hover:text-red-500 transition-colors` on the wrapper
- Empty `socialLinks` array → only email rendered, no icon section

---

### Footer

**File:** `src/components/Footer/Footer.tsx` (Server Component)

Simple centred copyright line with owner name sourced from props. No interactivity needed.

---

## Data Models

### `src/types/portfolio.ts`

```typescript
export interface SeoData {
  title: string;
  description: string;         // max 160 chars (enforced by Zod)
  ogImage: string;             // URL, min 1200×630 recommended
  siteUrl: string;             // https://... base URL
}

export interface HeroData {
  headline: string[];           // words array, accentWord applied to matching word
  accentWord: string;           // word in headline to colour red
  bio: string;                  // max 300 chars
  techStack: string[];          // displayed as ghost chips
  terminalCode: string;         // code string typed out in TerminalWidget
}

export interface SocialLink {
  platform: string;             // e.g. "GitHub", "LinkedIn", "Twitter"
  url: string;                  // must start with https://
}

export interface ProjectData {
  id: string;                   // unique slug
  title: string;
  description: string;          // max 160 chars
  techStack: string[];          // displayed as ghost chips on card
  thumbnailUrl?: string;        // optional image URL
  demoUrl?: string;             // optional live demo link
  githubUrl?: string;           // optional GitHub link
}

export interface ExperienceData {
  id: string;                   // unique slug
  company: string;
  role: string;
  startDate: string;            // ISO format: "YYYY-MM" or "YYYY-MM-DD"
  endDate: string | "Present";  // ISO format or literal "Present"
  bullets: string[];            // responsibility/achievement bullets
}

export interface ContactData {
  heading: string;              // section heading, e.g. "Get In Touch"
}

export interface PortfolioData {
  name: string;                 // owner full name
  title: string;                // professional title (used in meta/footer)
  hero: HeroData;
  skills: string[];             // flat list of skill names
  projects: ProjectData[];
  experience: ExperienceData[];
  socialLinks: SocialLink[];
  email: string;                // contact email
  cvUrl: string;                // https://... URL to CV PDF
  contact: ContactData;
  seo: SeoData;
}
```

### `src/data/portfolio.json` (Example Shape)

```json
{
  "name": "Mohammad Qaseem",
  "title": "Senior Software Engineer",
  "hero": {
    "headline": ["Building", "Digital", "Experiences", "That", "Matter"],
    "accentWord": "Digital",
    "bio": "Senior Software Engineer specialising in scalable backend systems, cloud infrastructure, and developer tooling. I turn complex problems into clean, maintainable solutions.",
    "techStack": ["TypeScript", "React", "Node.js", "AWS", "Kubernetes"],
    "terminalCode": "const engineer = {\n  name: 'Mohammad Qaseem',\n  role: 'Senior Software Engineer',\n  stack: ['TypeScript', 'React', 'Node.js', 'AWS'],\n  passion: 'Building things that scale'\n};"
  },
  "skills": ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Python", "AWS", "GCP", "Docker", "Kubernetes", "PostgreSQL", "Redis", "GraphQL", "REST APIs", "CI/CD", "Terraform"],
  "projects": [
    {
      "id": "project-alpha",
      "title": "Project Alpha",
      "description": "A scalable microservices platform handling 10k+ requests/sec with sub-10ms p99 latency.",
      "techStack": ["Node.js", "Kubernetes", "Kafka", "PostgreSQL"],
      "thumbnailUrl": "/images/project-alpha.jpg",
      "githubUrl": "https://github.com/Qaseem/project-alpha",
      "demoUrl": "https://alpha.example.com"
    }
  ],
  "experience": [
    {
      "id": "exp-acme",
      "company": "Acme Corp",
      "role": "Senior Software Engineer",
      "startDate": "2022-03",
      "endDate": "Present",
      "bullets": [
        "Led migration of monolith to microservices, reducing deploy times by 60%",
        "Mentored 3 junior engineers through structured code review process"
      ]
    }
  ],
  "socialLinks": [
    { "platform": "GitHub", "url": "https://github.com/Qaseem" },
    { "platform": "LinkedIn", "url": "https://linkedin.com/in/Qaseem" }
  ],
  "email": "hello@Qaseem.dev",
  "cvUrl": "https://drive.google.com/file/d/example/view",
  "contact": {
    "heading": "Get In Touch"
  },
  "seo": {
    "title": "Mohammad Qaseem — Senior Software Engineer",
    "description": "Portfolio of Mohammad Qaseem, a Senior Software Engineer specialising in scalable backend systems and cloud infrastructure.",
    "ogImage": "https://Qaseem.dev/og-image.jpg",
    "siteUrl": "https://Qaseem.dev"
  }
}
```

### Zod Validation Schema (`src/lib/validatePortfolio.ts`)

```typescript
import { z } from 'zod';

const SeoSchema = z.object({
  title: z.string().min(1),
  description: z.string().max(160),
  ogImage: z.string().url(),
  siteUrl: z.string().url(),
});

const HeroSchema = z.object({
  headline: z.array(z.string()).min(1),
  accentWord: z.string().min(1),
  bio: z.string().max(300),
  techStack: z.array(z.string()).min(1),
  terminalCode: z.string().min(1),
});

const SocialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
});

const ProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().max(160),
  techStack: z.array(z.string()),
  thumbnailUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
});

const ExperienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}/),
  endDate: z.union([z.string().regex(/^\d{4}-\d{2}/), z.literal('Present')]),
  bullets: z.array(z.string()),
});

export const PortfolioSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  hero: HeroSchema,
  skills: z.array(z.string()).min(1),
  projects: z.array(ProjectSchema),
  experience: z.array(ExperienceSchema),
  socialLinks: z.array(SocialLinkSchema),
  email: z.string().email(),
  cvUrl: z.string().url().startsWith('http'),
  contact: z.object({ heading: z.string().min(1) }),
  seo: SeoSchema,
});

export type PortfolioData = z.infer<typeof PortfolioSchema>;
```

---

## Animation Architecture

### `useScrollAnimation` Hook

```typescript
// src/hooks/useScrollAnimation.ts
interface UseScrollAnimationOptions {
  threshold?: number;    // default: 0.1
  staggerMs?: number;    // default: 100ms per item
  once?: boolean;        // default: true — play once only
}

function useScrollAnimation<T extends HTMLElement>(
  count: number,
  options?: UseScrollAnimationOptions
): {
  containerRef: React.RefObject<T>;
  getItemStyle: (index: number) => React.CSSProperties;
  isVisible: boolean;
}
```

**Implementation strategy:**
1. Create a single `IntersectionObserver` on the container element (not individual items)
2. When container enters viewport (`isIntersecting === true`): set `isVisible = true`, unobserve if `once: true`
3. `getItemStyle(index)` returns:
   - Before visible: `{ opacity: 0, transform: 'translateY(20px)', transition: 'none' }`
   - After visible: `{ opacity: 1, transform: 'translateY(0)', transition: `opacity 400ms ease, transform 400ms ease ${index * staggerMs}ms` }`
4. `prefers-reduced-motion` check via `window.matchMedia('(prefers-reduced-motion: reduce)')` — if true, all items immediately return `{ opacity: 1, transform: 'none' }`

**Slide-in-from-left variant** (ExperienceSection): Same hook with `transform: 'translateX(-20px)'` as initial state.

### `useTypingAnimation` Hook

```typescript
// src/hooks/useTypingAnimation.ts
interface UseTypingAnimationOptions {
  pauseMs?: number;      // pause at end before restart, default 1000
  speedMs?: number;      // ms per character, default 50
}

function useTypingAnimation(
  text: string,
  options?: UseTypingAnimationOptions
): {
  displayText: string;
  isTyping: boolean;
  pause: () => void;
  resume: () => void;
}
```

**Implementation:**
- Uses `useRef` for cursor position and `requestAnimationFrame`-based interval (via `setInterval` with `speedMs`)
- `pause()` / `resume()` called by parent via Intersection Observer ref on the TerminalWidget container
- State machine: `TYPING → PAUSED_AT_END → RESETTING → TYPING`

### `useScrollSpy` Hook

```typescript
// src/hooks/useScrollSpy.ts
function useScrollSpy(sectionIds: string[], navHeight?: number): string | null
// Returns the ID of the currently active section
```

**Implementation:**
- One `IntersectionObserver` observing all section elements with `rootMargin: '-50% 0px -50% 0px'` (fires when section crosses the middle of the viewport)
- Returns the `id` of the last intersecting section entry

### Reduced-Motion Handling

All hooks check `prefers-reduced-motion` once on mount:

```typescript
const prefersReducedMotion = 
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

If `true`:
- `useScrollAnimation`: returns final visible styles immediately for all items, no transition
- `useTypingAnimation`: returns the full `text` immediately with no animation
- CSS `animate-blink` on the cursor is suppressed via `motion-reduce:animate-none` Tailwind class

---

## SEO & Metadata Strategy

### `app/layout.tsx` — Static Metadata

```typescript
// Base metadata set from portfolio.json imported at build time
export const metadata: Metadata = {
  title: portfolioData.seo.title,
  description: portfolioData.seo.description,
  openGraph: {
    title: portfolioData.seo.title,
    description: portfolioData.seo.description,
    url: portfolioData.seo.siteUrl,
    images: [{ url: portfolioData.seo.ogImage }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: portfolioData.seo.title,
    description: portfolioData.seo.description,
    images: [portfolioData.seo.ogImage],
  },
};
```

Since this is a single-page site, `layout.tsx` exports static `Metadata` rather than using `generateMetadata`. The JSON is imported at build time so no runtime fetch is needed.

### `app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${portfolioData.seo.siteUrl}/sitemap.xml`,
  };
}
```

### `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';
import portfolioData from '@/data/portfolio.json';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: portfolioData.seo.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
```

Next.js App Router automatically serves `robots.ts` at `/robots.txt` and `sitemap.ts` at `/sitemap.xml` during `next build` / `next start`.

---

## Styling Approach

### Tailwind CSS Configuration (`tailwind.config.ts`)

The design system tokens are encoded directly as Tailwind theme extensions:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#FF0000',
        muted: '#999999',
      },
      fontFamily: {
        sans: ['var(--font-hanken-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      maxWidth: {
        content: '1200px',
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
};
```

**Spacing discipline:** All spacing values in components use `p-{n}` / `m-{n}` / `gap-{n}` where `n` maps to multiples of 8px (Tailwind's default 4px grid means using even-numbered scale steps: `p-2=8px`, `p-4=16px`, `p-6=24px`, `p-8=32px`).

**Zero border-radius enforcement:** `rounded-none` applied globally; clip-path for chamfered CTA buttons applied only at `lg:` breakpoint via inline style or a custom Tailwind plugin class.

**Global CSS (`app/globals.css`):**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-black text-white;
  }
  * {
    @apply rounded-none;
  }
}

@layer utilities {
  .clip-chamfer-lg {
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
  }
}
```

---

## Build Validation Strategy

### Prebuild Script (`scripts/prebuild-validate.ts`)

```typescript
#!/usr/bin/env tsx
import { PortfolioSchema } from '../src/lib/validatePortfolio';
import portfolioRaw from '../src/data/portfolio.json';

const result = PortfolioSchema.safeParse(portfolioRaw);

if (!result.success) {
  const issues = result.error.issues;
  issues.forEach(issue => {
    const field = issue.path.join('.');
    console.error(`❌ portfolio.json validation error at "${field}": ${issue.message}`);
  });
  process.exit(1);
}

console.log('✅ portfolio.json validation passed.');
process.exit(0);
```

**`package.json` integration:**
```json
{
  "scripts": {
    "prebuild": "tsx scripts/prebuild-validate.ts",
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint"
  }
}
```

`prebuild` runs automatically before `build` in npm/yarn/pnpm. On Vercel, the build command is `npm run build` which triggers `prebuild` first. A missing required field produces a named error message and exits 1, aborting the Vercel build.

---

## Error Handling

| Scenario | Handling |
|---|---|
| Missing required JSON field | Prebuild script: logs `"Missing field: <name>"` and exits with code 1 |
| Invalid URL in `cvUrl` | Zod schema rejects at prebuild; build aborts |
| Missing optional `thumbnailUrl` | `ProjectCard` conditionally renders `<Image>` only when prop is truthy |
| Missing `demoUrl` / `githubUrl` | Link buttons not rendered; no error |
| Empty `experience` array | `ExperienceSection` renders placeholder message |
| Empty `socialLinks` array | `ContactSection` renders only email link |
| `prefers-reduced-motion` | All animations skipped; elements render in final state |
| Intersection Observer not supported | Feature-detect: `typeof IntersectionObserver !== 'undefined'`; fall back to always-visible final state |
| Next.js Image failing to load | `onError` callback sets fallback state hiding the image element |


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property Reflection:** Before writing properties, redundancy was eliminated:
- Requirements 8.2 and 8.3 both test the same stagger delay calculation (projects vs. skills chips) — merged into Property 8.
- Requirements 9.1 and 9.2 both test `SeoData → Metadata` field mapping — merged into Property 9.
- Requirements 2.3, 4.1, 5.1, 6.1, 7.2 all test "rendered element count equals array length" — kept separate because they test different components but noted as instances of the same structural pattern.

---

### Property 1: Validation rejects missing required fields

*For any* complete valid `PortfolioData` object, if any single required top-level field (`name`, `title`, `hero`, `skills`, `projects`, `experience`, `socialLinks`, `email`, `cvUrl`, `contact`, `seo`) is removed or set to `undefined`, then `PortfolioSchema.safeParse()` SHALL return `{ success: false }` with an error whose `issues` array contains at least one entry whose `path` includes the name of that missing field.

**Validates: Requirements 1.5**

---

### Property 2: Validation accepts only valid cvUrl schemes

*For any* string value assigned to the `cvUrl` field, `PortfolioSchema.safeParse()` SHALL return `{ success: true }` if and only if the string is a valid URL beginning with `http://` or `https://`; any non-URL string or URL beginning with a different scheme (e.g., `ftp://`, `file://`) SHALL cause `safeParse` to return `{ success: false }`.

**Validates: Requirements 1.4**

---

### Property 3: Nav renders exactly one anchor link per section

*For any* non-empty array of section objects `[{ id, label }]`, the rendered `Nav` component SHALL contain exactly `array.length` anchor elements whose `href` attributes are the section `id` values from the array — no more, no fewer.

**Validates: Requirements 2.3**

---

### Property 4: Nav Resume button reflects any valid cvUrl

*For any* valid `cvUrl` string, the rendered `Nav` component SHALL contain exactly one anchor element with `href === cvUrl` and `target === '_blank'` for the Resume button.

**Validates: Requirements 2.5**

---

### Property 5: Active section drives exactly one active nav link

*For any* `sectionId` that is a member of the `sections` array, when `useScrollSpy` returns that `sectionId`, the rendered `Nav` SHALL apply the active visual style (red text / active indicator class) to exactly one anchor link — the one whose `id` matches `sectionId` — and no other anchor links SHALL have the active style.

**Validates: Requirements 2.7**

---

### Property 6: Accent word in headline receives red styling; all other words do not

*For any* headline words array and any `accentWord` value that appears in that array, the rendered `HeroSection` SHALL contain exactly one element with the red accent colour class whose text content equals `accentWord`, and all other headline word elements SHALL use the white text class.

**Validates: Requirements 3.3**

---

### Property 7: Bio rendering never exceeds 300 characters

*For any* string value passed as the `bio` prop, the text content rendered by `HeroSection` for the bio paragraph SHALL have a length of at most 300 characters. For any `bio` string whose length is ≤ 300 characters, the rendered text SHALL equal the full input string.

**Validates: Requirements 3.4**

---

### Property 8: Download CV link reflects any cvUrl with new-tab target

*For any* valid `cvUrl` string, the rendered `HeroSection` SHALL contain an anchor element for "DOWNLOAD CV" with `href === cvUrl` and `target === '_blank'`.

**Validates: Requirements 3.7**

---

### Property 9: Typing animation progresses character-by-character and loops

*For any* non-empty `code` string passed to `useTypingAnimation`, the sequence of `displayText` values produced over time SHALL satisfy: starting at `""`, each successive value appends exactly one character, the final value equals `code`, after the configured pause the cursor resets to `0`, and the cycle repeats identically.

**Validates: Requirements 3.9**

---

### Property 10: Typing animation pause freezes cursor; resume continues from same position

*For any* cursor position `p` in `[0, text.length)`, calling `pause()` on the `useTypingAnimation` hook SHALL freeze `displayText` at `text.slice(0, p)`; subsequently calling `resume()` SHALL continue typing from position `p`, not from `0` or any other position.

**Validates: Requirements 3.11**

---

### Property 11: Skills section renders exactly one chip per skill

*For any* non-empty array of skill strings, the rendered `SkillsSection` SHALL contain exactly `array.length` chip elements, each containing the corresponding skill string as its text content.

**Validates: Requirements 4.1**

---

### Property 12: Every skill chip carries required hover styling classes

*For any* array of skill strings, every rendered chip element in `SkillsSection` SHALL have the CSS classes for `hover:border-red-500` and `hover:text-red-500` (or equivalent Tailwind accent classes), `border-white`, `uppercase`, `font-mono`, and `rounded-none`.

**Validates: Requirements 4.2, 4.4**

---

### Property 13: Projects section renders exactly one card per project

*For any* non-empty array of `ProjectData` objects, the rendered `ProjectsSection` SHALL contain exactly `array.length` project card elements.

**Validates: Requirements 5.1**

---

### Property 14: Project card links render conditionally and open in new tab

*For any* `ProjectData` object: if `demoUrl` is present, the rendered `ProjectCard` SHALL include an anchor with `href === demoUrl`, `target === '_blank'`, and `rel === 'noopener noreferrer'`; if `demoUrl` is absent, no such anchor SHALL be rendered. The same constraint applies independently for `githubUrl`.

**Validates: Requirements 5.2, 5.6**

---

### Property 15: Project card thumbnail alt text equals project title

*For any* `ProjectData` object where `thumbnailUrl` is provided, the rendered `ProjectCard` SHALL include an `<img>` (or `<Image>`) element whose `alt` attribute equals exactly `project.title`.

**Validates: Requirements 5.3**

---

### Property 16: Experience section renders exactly one entry per experience record

*For any* non-empty array of `ExperienceData` objects, the rendered `ExperienceSection` SHALL contain exactly `array.length` timeline entry elements.

**Validates: Requirements 6.1**

---

### Property 17: Date formatter produces correct MMM YYYY output for any valid date string

*For any* string matching the pattern `YYYY-MM` (where `YYYY` is a four-digit year and `MM` is `01`–`12`), the `formatDate()` utility function SHALL return a string matching the pattern `/^[A-Z][a-z]{2} \d{4}$/` (e.g., `"Mar 2022"`). For the literal string `"Present"`, `formatDate()` SHALL return `"Present"` unchanged.

**Validates: Requirements 6.2**

---

### Property 18: Experience entries are sorted in reverse chronological order

*For any* array of `ExperienceData` objects with valid `startDate` fields, the array produced by the sort function used in `ExperienceSection` SHALL be ordered such that for every pair of adjacent entries `(a, b)`, `a.startDate >= b.startDate` (lexicographic comparison on `YYYY-MM` strings is equivalent to chronological comparison).

**Validates: Requirements 6.3**

---

### Property 19: Contact email link uses mailto scheme

*For any* valid email string, the rendered `ContactSection` SHALL contain exactly one anchor element with `href === 'mailto:' + email`.

**Validates: Requirements 7.1**

---

### Property 20: Contact section renders exactly one social link per entry

*For any* array of `SocialLink` objects, the rendered `ContactSection` SHALL contain exactly `array.length` social link anchor elements. For the empty array, no social icon area SHALL be rendered.

**Validates: Requirements 7.2, 7.6**

---

### Property 21: All social links open in new tab with noopener noreferrer

*For any* array of `SocialLink` objects, every rendered social link anchor in `ContactSection` SHALL have `target === '_blank'` and `rel === 'noopener noreferrer'`.

**Validates: Requirements 7.3**

---

### Property 22: Contact section heading reflects any heading string

*For any* non-empty heading string, the rendered `ContactSection` SHALL contain a heading element whose text content equals the heading string.

**Validates: Requirements 7.4**

---

### Property 23: Stagger delay is proportional to item index

*For any* item index `i ≥ 0` and any stagger interval `s` in `[80, 150]` milliseconds, the `getItemStyle(i)` function returned by `useScrollAnimation({ staggerMs: s })` SHALL, when `isVisible` is `true`, produce a `transition` or `transitionDelay` value equivalent to `i * s` milliseconds. For `i === 0`, the delay SHALL be `0ms`.

**Validates: Requirements 8.2, 8.3**

---

### Property 24: Scroll animation triggers only once regardless of repeated intersection events

*For any* component using `useScrollAnimation({ once: true })`, after the first intersection event that sets `isVisible = true`, any subsequent intersection events (simulated by calling the observer callback again) SHALL NOT change the `isVisible` state — it remains `true` and the hook does not re-trigger the animation.

**Validates: Requirements 8.4**

---

### Property 25: prefers-reduced-motion renders all items in final visible state immediately

*For any* component using `useScrollAnimation` when `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`, the `getItemStyle(i)` function SHALL return `{ opacity: 1, transform: 'none' }` (or equivalent final-state styles with no transition) for every item index `i`, regardless of whether an intersection has occurred.

**Validates: Requirements 8.5**

---

### Property 26: Animated items have opacity:0 and offset transform before intersection

*For any* item index `i`, before the Intersection Observer fires (i.e., when `isVisible === false`), `getItemStyle(i)` SHALL return styles with `opacity: 0` and a non-zero `transform` offset (e.g., `translateY(20px)` for fade-up or `translateX(-20px)` for slide-left).

**Validates: Requirements 8.6**

---

### Property 27: Metadata object reflects all seo fields including OG tags

*For any* `SeoData` object `{ title, description, ogImage, siteUrl }`, the metadata object generated from it SHALL satisfy: `metadata.title === title`, `metadata.description === description`, `metadata.openGraph.title === title`, `metadata.openGraph.description === description`, `metadata.openGraph.images[0].url === ogImage`, `metadata.openGraph.url === siteUrl`, and `metadata.twitter.card === 'summary_large_image'`.

**Validates: Requirements 9.1, 9.2, 9.3**

---

### Property 28: Sitemap returns exactly one entry with siteUrl

*For any* valid `siteUrl` string in the portfolio data, the `sitemap()` function SHALL return an array of exactly one entry whose `url` property equals `siteUrl`.

**Validates: Requirements 9.5**

---

## Testing Strategy

### Dual Testing Approach

The testing strategy combines **property-based tests** for universal correctness guarantees with **unit/example-based tests** for specific behavior and **smoke tests** for build-time and structural validation.

### Property-Based Testing Library

Use **[fast-check](https://fast-check.dev/)** — the leading TypeScript-native property-based testing library. It integrates directly with Vitest (the chosen test runner for Next.js projects).

```bash
npm install --save-dev fast-check vitest @testing-library/react @testing-library/jest-dom
```

**Configuration:** Each property test runs a minimum of **100 iterations** (`numRuns: 100` in `fc.assert`).

**Tag format for each property test:**
```typescript
// Feature: portfolio-qaseem, Property {N}: {property text}
```

### Test File Structure

```
src/
├── __tests__/
│   ├── validation.property.test.ts     # Properties 1, 2 — Zod schema
│   ├── nav.property.test.tsx           # Properties 3, 4, 5
│   ├── hero.property.test.tsx          # Properties 6, 7, 8, 9, 10
│   ├── skills.property.test.tsx        # Properties 11, 12
│   ├── projects.property.test.tsx      # Properties 13, 14, 15
│   ├── experience.property.test.tsx    # Properties 16, 17, 18
│   ├── contact.property.test.tsx       # Properties 19, 20, 21, 22
│   ├── scrollAnimation.property.test.ts # Properties 23, 24, 25, 26
│   ├── metadata.property.test.ts       # Properties 27, 28
│   └── unit/
│       ├── nav.unit.test.tsx           # Hamburger toggle, click-to-close
│       ├── hero.unit.test.tsx          # CTA scroll, layout breakpoints
│       ├── skills.unit.test.tsx        # Heading consistency
│       ├── projects.unit.test.tsx      # Hover border class, grid columns
│       ├── experience.unit.test.tsx    # Timeline markers, empty state, animation once
│       ├── contact.unit.test.tsx       # Hover color, empty socialLinks
│       └── seo.unit.test.tsx           # twitter:card value, robots.txt output
```

### Example Property Test (fast-check)

```typescript
// Feature: portfolio-qaseem, Property 17: Date formatter produces correct MMM YYYY
import fc from 'fast-check';
import { formatDate } from '@/lib/formatDate';

describe('Property 17: Date formatter', () => {
  it('produces MMM YYYY for any valid YYYY-MM string', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1900, max: 2100 }).map(y => String(y)),
        fc.integer({ min: 1, max: 12 }).map(m => String(m).padStart(2, '0')),
        (year, month) => {
          const result = formatDate(`${year}-${month}`);
          expect(result).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns "Present" for the literal string "Present"', () => {
    expect(formatDate('Present')).toBe('Present');
  });
});
```

### Unit Test Focus Areas

Unit tests should cover specific examples, edge cases, and integration points NOT covered by property tests:

| Test | Type | Covers |
|---|---|---|
| Hamburger toggle opens/closes overlay | Unit | Requirement 2.6, 2.8 |
| "VIEW PROJECTS →" click triggers scroll | Unit | Requirement 3.6 |
| Terminal visible in right column at lg breakpoint | Unit | Requirement 3.8 |
| Empty experience array shows placeholder | Unit | Requirement 6.6 |
| Timeline vertical line and diamond markers present | Unit | Requirement 6.4 |
| Social icon hover applies red colour class | Unit | Requirement 7.5 |
| `twitter:card` equals `'summary_large_image'` | Unit | Requirement 9.3 |
| `robots()` returns correct rules object | Unit | Requirement 9.4 |
| Section headings share identical heading CSS class | Unit | Requirements 4.5, 5.5 |

### Smoke / Build-Time Tests

| Check | How |
|---|---|
| `portfolio.json` exists and is valid JSON | `prebuild-validate.ts` (Zod) |
| TypeScript compiles with no errors | `next build` / `tsc --noEmit` |
| ESLint passes with zero errors | `next lint` |
| `no 'any' types` for Data_File fields | ESLint `@typescript-eslint/no-explicit-any` rule |

### Running Tests

```bash
# Property and unit tests (single run, no watch mode)
npx vitest run

# Type checking
npx tsc --noEmit

# Linting
npx next lint
```
