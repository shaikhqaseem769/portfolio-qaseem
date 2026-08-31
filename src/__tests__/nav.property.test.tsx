// Feature: portfolio-qaseem, Property 3: Nav renders exactly one anchor per section
// Feature: portfolio-qaseem, Property 4: Nav Resume button reflects any valid cvUrl
// Feature: portfolio-qaseem, Property 5: Active section drives exactly one active nav link

import { describe, it, expect, vi, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import Nav from '@/components/Nav/Nav';

// Mock useScrollSpy so we control the active section without a real IntersectionObserver
vi.mock('@/hooks/useScrollSpy', () => ({
  useScrollSpy: vi.fn(() => null),
}));

// Import the mock so individual tests can override the return value
import { useScrollSpy } from '@/hooks/useScrollSpy';

// jsdom doesn't support IntersectionObserver — provide a no-op stub
beforeAll(() => {
  if (typeof window.IntersectionObserver === 'undefined') {
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      value: class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    });
  }

  // Stub scrollTo so Nav's handleNavClick doesn't throw
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
  });

  // Stub document.getElementById so handleNavClick doesn't throw
  vi.spyOn(document, 'getElementById').mockReturnValue(null);
});

describe('Nav property tests', () => {
  it('Property 3: Nav renders exactly one anchor per section', () => {
    /**
     * Validates: Requirements 2.3
     *
     * For any non-empty array of section objects, the rendered Nav SHALL
     * contain exactly array.length section anchor elements whose href values
     * correspond to each section id.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            label: fc.string({ minLength: 1 }),
          }),
          { minLength: 1 }
        ),
        (sections) => {
          // Ensure section ids are unique to avoid ambiguous hrefs in the DOM
          const seen = new Set<string>();
          const uniqueSections = sections.filter((s) => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
          });
          if (uniqueSections.length === 0) return;

          vi.mocked(useScrollSpy).mockReturnValue(null);

          const { unmount } = render(
            <Nav
              ownerName="Test Owner"
              cvUrl="https://example.com/cv.pdf"
              sections={uniqueSections}
            />
          );

          // Collect anchors whose href ends with #<sectionId>
          const allAnchors = screen.getAllByRole('link');
          const sectionAnchors = allAnchors.filter((a) => {
            const href = a.getAttribute('href') ?? '';
            return uniqueSections.some((s) => href === `#${s.id}`);
          });

          // Exactly one anchor per section
          expect(sectionAnchors).toHaveLength(uniqueSections.length);

          // Each section id is represented exactly once
          for (const section of uniqueSections) {
            const matching = sectionAnchors.filter(
              (a) => a.getAttribute('href') === `#${section.id}`
            );
            expect(matching).toHaveLength(1);
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: Nav Resume button reflects any valid cvUrl', () => {
    /**
     * Validates: Requirements 2.5
     *
     * For any valid cvUrl, the rendered Nav SHALL contain exactly one anchor
     * with href === cvUrl and target === '_blank'.
     */
    fc.assert(
      fc.property(fc.webUrl(), (cvUrl) => {
        vi.mocked(useScrollSpy).mockReturnValue(null);

        const sections = [{ id: 'about', label: 'About' }];

        const { unmount } = render(
          <Nav ownerName="Test Owner" cvUrl={cvUrl} sections={sections} />
        );

        const allAnchors = screen.getAllByRole('link');
        const resumeAnchors = allAnchors.filter(
          (a) =>
            a.getAttribute('href') === cvUrl &&
            a.getAttribute('target') === '_blank'
        );

        // Exactly one Resume anchor with the correct href and target
        expect(resumeAnchors).toHaveLength(1);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('Property 5: Active section drives exactly one active nav link', () => {
    /**
     * Validates: Requirements 2.7
     *
     * For any sectionId that is a member of the sections array, when
     * useScrollSpy returns that sectionId, exactly one anchor SHALL have the
     * active visual style (text-red-500) and no other section anchors shall.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            label: fc.string({ minLength: 1 }),
          }),
          { minLength: 1 }
        ),
        (sections) => {
          // Ensure section ids are unique
          const seen = new Set<string>();
          const uniqueSections = sections.filter((s) => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
          });
          if (uniqueSections.length === 0) return;

          for (const activeSection of uniqueSections) {
            vi.mocked(useScrollSpy).mockReturnValue(activeSection.id);

            const { unmount } = render(
              <Nav
                ownerName="Test Owner"
                cvUrl="https://example.com/cv.pdf"
                sections={uniqueSections}
              />
            );

            try {
              // Collect only section anchors (not the Resume button)
              const allAnchors = screen.getAllByRole('link');
              const sectionAnchors = allAnchors.filter((a) => {
                const href = a.getAttribute('href') ?? '';
                return uniqueSections.some((s) => href === `#${s.id}`);
              });

              // Only anchors with text-red-500 in className are "active"
              const activeAnchors = sectionAnchors.filter((a) =>
                (a.getAttribute('class') ?? '').includes('text-red-500')
              );

              // Exactly one active anchor
              expect(activeAnchors).toHaveLength(1);

              // That anchor must correspond to the active section
              expect(activeAnchors[0].getAttribute('href')).toBe(
                `#${activeSection.id}`
              );
            } finally {
              unmount();
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
