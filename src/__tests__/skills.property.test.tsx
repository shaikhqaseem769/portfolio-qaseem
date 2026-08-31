// Feature: sanjay-portfolio-website, Property 11: Skills section renders exactly one chip per skill
// Feature: sanjay-portfolio-website, Property 12: Every skill chip carries required hover styling classes

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import SkillsSection from '@/components/Skills/SkillsSection';

// Mock browser APIs that jsdom doesn't support
beforeAll(() => {
  // Mock matchMedia (used by useScrollAnimation for prefers-reduced-motion)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver (used by useScrollAnimation for scroll detection)
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  });
});

describe('SkillsSection property tests', () => {
  /**
   * **Validates: Requirements 4.1, 4.2**
   *
   * Property 11: Skills section renders exactly one chip per skill.
   * For any non-empty array of skills, the number of rendered chips
   * equals the array length and each chip displays the corresponding skill text.
   */
  it('Property 11: Skills section renders exactly one chip per skill', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
        (skills) => {
          const { container, unmount } = render(
            <SkillsSection skills={skills} heading="Skills" />
          );

          // Chips are <span> elements inside the flex container
          const chips = container.querySelectorAll('span');

          // One chip per skill
          expect(chips.length).toBe(skills.length);

          // Each chip text matches the corresponding skill string
          chips.forEach((chip, index) => {
            expect(chip.textContent).toBe(skills[index]);
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 4.2, 4.4**
   *
   * Property 12: Every skill chip carries required hover styling classes.
   * For any skills array, every chip element must have the required classes:
   * hover:border-red-500, hover:text-red-500, border-white, uppercase,
   * font-mono, rounded-none.
   */
  it('Property 12: Every skill chip carries required hover styling classes', () => {
    const requiredClasses = [
      'hover:border-red-500',
      'hover:text-red-500',
      'border-white',
      'uppercase',
      'font-mono',
      'rounded-none',
    ];

    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
        (skills) => {
          const { container, unmount } = render(
            <SkillsSection skills={skills} heading="Skills" />
          );

          const chips = container.querySelectorAll('span');

          chips.forEach((chip) => {
            requiredClasses.forEach((cls) => {
              expect(chip.classList.contains(cls)).toBe(true);
            });
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
