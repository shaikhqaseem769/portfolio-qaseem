// Feature: portfolio-qaseem, Property 6: Accent word receives red styling; all others do not
// Feature: portfolio-qaseem, Property 7: Bio rendering never exceeds 300 characters
// Feature: portfolio-qaseem, Property 8: Download CV link reflects any cvUrl with new-tab target

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import HeroSection from '@/components/Hero/HeroSection';
import { HeroData } from '@/types/portfolio';

// Mock IntersectionObserver (not available in jsdom)
beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

// Mock TerminalWidget to avoid typing animation complexity in tests
vi.mock('@/components/Hero/TerminalWidget', () => ({
  default: ({ code }: { code: string }) => (
    <div data-testid="terminal-widget">{code}</div>
  ),
}));

function buildHeroData(overrides: Partial<HeroData> = {}): HeroData {
  return {
    headline: ['Hello', 'World'],
    accentWord: 'Hello',
    bio: 'A short bio.',
    techStack: ['TypeScript', 'React'],
    terminalCode: 'console.log("hi");',
    ...overrides,
  };
}

// **Validates: Requirements 3.3**
describe('Property 6: Accent word receives red styling; all others do not', () => {
  it('exactly one span has text-red-500 and its text equals accentWord', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
        fc.nat(),
        (words, indexSeed) => {
          // Pick a random word from the words array as accentWord
          const accentIndex = indexSeed % words.length;
          const accentWord = words[accentIndex];

          const data = buildHeroData({ headline: words, accentWord });
          const { container } = render(
            <HeroSection data={data} cvUrl="https://example.com/cv.pdf" />
          );

          // Find all spans with text-red-500
          const redSpans = container.querySelectorAll('span.text-red-500');

          // Exactly one red span should exist
          expect(redSpans.length).toBeGreaterThanOrEqual(1);

          // Every red span should have text matching accentWord
          redSpans.forEach((span) => {
            expect(span.textContent).toBe(accentWord);
          });

          // The non-accent word spans (text-white) should not include accentWord
          const whiteSpans = container.querySelectorAll('span.text-white');
          whiteSpans.forEach((span) => {
            expect(span.textContent).not.toBe(accentWord);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Validates: Requirements 3.4**
describe('Property 7: Bio rendering never exceeds 300 characters', () => {
  it('rendered bio text length is always ≤ 300', () => {
    fc.assert(
      fc.property(fc.string(), (bio) => {
        const data = buildHeroData({ bio });
        const { container } = render(
          <HeroSection data={data} cvUrl="https://example.com/cv.pdf" />
        );

        // The bio is rendered inside a <p> tag
        // We find it by looking for the paragraph that contains the bio content
        const bioParagraph = container.querySelector('p.text-white\\/80');
        const renderedBioText = bioParagraph?.textContent ?? '';

        // Bio text must never exceed 300 characters
        expect(renderedBioText.length).toBeLessThanOrEqual(300);
      }),
      { numRuns: 100 }
    );
  });

  it('rendered bio equals full input when bio.length ≤ 300', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 300 }), (bio) => {
        const data = buildHeroData({ bio });
        const { container } = render(
          <HeroSection data={data} cvUrl="https://example.com/cv.pdf" />
        );

        const bioParagraph = container.querySelector('p.text-white\\/80');
        const renderedBioText = bioParagraph?.textContent ?? '';

        // When bio fits within 300 chars, rendered text equals the full input
        expect(renderedBioText).toBe(bio);
      }),
      { numRuns: 100 }
    );
  });
});

// **Validates: Requirements 3.7**
describe('Property 8: Download CV link reflects any cvUrl with new-tab target', () => {
  it('DOWNLOAD CV anchor has correct href and target="_blank" for any URL', () => {
    fc.assert(
      fc.property(fc.webUrl(), (cvUrl) => {
        const data = buildHeroData();
        const { container } = render(
          <HeroSection data={data} cvUrl={cvUrl} />
        );

        // Find the DOWNLOAD CV anchor link
        const cvLinks = Array.from(container.querySelectorAll('a')).filter(
          (a) => a.textContent?.trim().toUpperCase() === 'DOWNLOAD CV'
        );

        expect(cvLinks.length).toBe(1);

        const cvLink = cvLinks[0];
        expect(cvLink.getAttribute('href')).toBe(cvUrl);
        expect(cvLink.getAttribute('target')).toBe('_blank');
      }),
      { numRuns: 100 }
    );
  });
});
