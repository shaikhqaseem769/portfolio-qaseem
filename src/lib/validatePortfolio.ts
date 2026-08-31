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
  description: z.string().max(500),
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
