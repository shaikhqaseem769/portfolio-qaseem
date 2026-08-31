// Feature: sanjay-portfolio-website, Property 1: Validation rejects missing required fields
// Feature: sanjay-portfolio-website, Property 2: Validation accepts only valid cvUrl schemes

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { PortfolioSchema } from '@/lib/validatePortfolio';

/** A complete valid PortfolioData object that passes PortfolioSchema.safeParse */
const validPortfolio = {
  name: 'Sanjay Kumar',
  title: 'Senior Software Engineer',
  hero: {
    headline: ['Building', 'Digital', 'Experiences'],
    accentWord: 'Digital',
    bio: 'A senior engineer who builds things.',
    techStack: ['TypeScript', 'React'],
    terminalCode: 'const x = 1;',
  },
  skills: ['TypeScript', 'React'],
  projects: [],
  experience: [],
  socialLinks: [],
  email: 'hello@sanjay.dev',
  cvUrl: 'https://example.com/cv.pdf',
  contact: { heading: 'Get In Touch' },
  seo: {
    title: 'Sanjay Kumar',
    description: 'Portfolio site.',
    ogImage: 'https://example.com/og.jpg',
    siteUrl: 'https://example.com',
  },
};

// Sanity check: ensure the base object is valid before running properties
const baseCheck = PortfolioSchema.safeParse(validPortfolio);
if (!baseCheck.success) {
  throw new Error(
    `Base validPortfolio fixture is invalid: ${JSON.stringify(baseCheck.error.issues)}`
  );
}

const requiredKeys = [
  'name',
  'title',
  'hero',
  'skills',
  'projects',
  'experience',
  'socialLinks',
  'email',
  'cvUrl',
  'contact',
  'seo',
] as const;

describe('PortfolioSchema property tests', () => {
  it('Property 1: Validation rejects missing required fields', () => {
    fc.assert(
      fc.property(fc.constantFrom(...requiredKeys), (key) => {
        // Build a copy of the valid object with the chosen key removed
        const incomplete = { ...validPortfolio } as Record<string, unknown>;
        delete incomplete[key];

        const result = PortfolioSchema.safeParse(incomplete);

        // Must fail validation
        expect(result.success).toBe(false);

        if (!result.success) {
          // At least one issue must reference the deleted key in its path
          const pathsFlat = result.error.issues.map((issue) =>
            issue.path.map(String)
          );
          const keyMentioned = pathsFlat.some((path) => path.includes(key));
          expect(keyMentioned).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2: Validation accepts only valid cvUrl schemes', () => {
    // Part A: valid URLs produced by fc.webUrl() must be accepted
    fc.assert(
      fc.property(fc.webUrl(), (url) => {
        const obj = { ...validPortfolio, cvUrl: url };
        const result = PortfolioSchema.safeParse(obj);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );

    // Part B: non-URL strings must be rejected
    fc.assert(
      fc.property(
        fc.string().filter((s) => {
          // Keep only strings that Zod's URL check would reject
          try {
            new URL(s);
            return false; // valid URL — exclude from this test
          } catch {
            return true; // not a valid URL — include
          }
        }),
        (nonUrl) => {
          const obj = { ...validPortfolio, cvUrl: nonUrl };
          const result = PortfolioSchema.safeParse(obj);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
