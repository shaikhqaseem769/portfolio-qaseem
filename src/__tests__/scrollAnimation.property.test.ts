// Feature: sanjay-portfolio-website, Property 23: Stagger delay is proportional to item index
// Feature: sanjay-portfolio-website, Property 24: Scroll animation triggers only once
// Feature: sanjay-portfolio-website, Property 25: prefers-reduced-motion renders final state immediately
// Feature: sanjay-portfolio-website, Property 26: Items have opacity:0 and offset transform before intersection

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

// ---------------------------------------------------------------------------
// IntersectionObserver mock
// ---------------------------------------------------------------------------

type IOCallback = (entries: IntersectionObserverEntry[]) => void;

let capturedCallback: IOCallback | null = null;
let capturedObservedElement: Element | null = null;

const mockObserve = vi.fn((el: Element) => {
  capturedObservedElement = el;
});
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

function createMockObserver(cb: IOCallback) {
  capturedCallback = cb;
  return {
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  };
}

/** Simulate IntersectionObserver firing with isIntersecting value */
function fireIntersection(isIntersecting: boolean) {
  if (!capturedCallback || !capturedObservedElement) return;
  capturedCallback([
    {
      isIntersecting,
      target: capturedObservedElement,
    } as unknown as IntersectionObserverEntry,
  ]);
}

// ---------------------------------------------------------------------------
// Helpers to set up / tear down global mocks per test
// ---------------------------------------------------------------------------

function setupMocks({ prefersReducedMotion = false } = {}) {
  // Reset capture state
  capturedCallback = null;
  capturedObservedElement = null;
  mockObserve.mockClear();
  mockUnobserve.mockClear();
  mockDisconnect.mockClear();

  // Mock IntersectionObserver
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn((cb: IOCallback) => createMockObserver(cb))
  );

  // Mock matchMedia
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? prefersReducedMotion : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

function teardownMocks() {
  vi.unstubAllGlobals();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useScrollAnimation property tests', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    teardownMocks();
  });

  // -------------------------------------------------------------------------
  // Property 23: Stagger delay is proportional to item index
  // -------------------------------------------------------------------------
  it('Property 23: Stagger delay is proportional to item index', () => {
    /**
     * Validates: Requirements 8.2, 8.3
     *
     * For any item index i ≥ 0 and any staggerMs in [80, 150],
     * getItemStyle(i).transition must encode i * staggerMs ms as the delay.
     */
    fc.assert(
      fc.property(
        fc.nat({ max: 20 }),             // index i ≥ 0
        fc.integer({ min: 80, max: 150 }), // staggerMs in valid range
        (i, staggerMs) => {
          setupMocks();

          const { result } = renderHook(() =>
            useScrollAnimation(i + 1, { staggerMs })
          );

          // Attach a fake DOM element so the observer can be set up
          const fakeEl = document.createElement('div');
          // Directly assign containerRef.current (ref is a mutable object)
          Object.defineProperty(result.current.containerRef, 'current', {
            value: fakeEl,
            writable: true,
            configurable: true,
          });

          // Re-render so the effect can pick up the ref
          act(() => {
            // Force the effect to re-run by firing intersection
          });

          // Simulate an intersection so isVisible becomes true
          act(() => {
            fireIntersection(true);
          });

          const style = result.current.getItemStyle(i);

          // When visible, transition must include the stagger delay i * staggerMs
          const expectedDelay = i * staggerMs;
          expect(style.transition).toContain(`${expectedDelay}ms`);
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 24: Scroll animation triggers only once
  // -------------------------------------------------------------------------
  it('Property 24: Scroll animation triggers only once regardless of repeated intersection events', () => {
    /**
     * Validates: Requirements 8.4
     *
     * After the first intersection sets isVisible = true,
     * further intersection calls must not flip isVisible back to false.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }), // number of extra intersection calls
        (extraCalls) => {
          setupMocks();

          const { result } = renderHook(() =>
            useScrollAnimation(3, { once: true })
          );

          const fakeEl = document.createElement('div');
          Object.defineProperty(result.current.containerRef, 'current', {
            value: fakeEl,
            writable: true,
            configurable: true,
          });

          // Fire first intersection — makes it visible
          act(() => {
            fireIntersection(true);
          });

          expect(result.current.isVisible).toBe(true);

          // Fire multiple additional intersection events (including leaving and re-entering)
          for (let k = 0; k < extraCalls; k++) {
            act(() => {
              fireIntersection(k % 2 === 0 ? false : true);
            });
          }

          // isVisible must still be true — once set, it does not flip back
          expect(result.current.isVisible).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 25: prefers-reduced-motion renders all items in final visible state
  // -------------------------------------------------------------------------
  it('Property 25: prefers-reduced-motion renders all items in final visible state immediately', () => {
    /**
     * Validates: Requirements 8.5, 8.6
     *
     * When matchMedia('(prefers-reduced-motion: reduce)').matches is true,
     * every getItemStyle(i) must return { opacity: 1, transform: 'none' }
     * regardless of intersection state.
     */
    fc.assert(
      fc.property(
        fc.nat({ max: 20 }), // any item index
        (i) => {
          // Re-setup with reduced motion enabled
          teardownMocks();
          setupMocks({ prefersReducedMotion: true });

          const { result } = renderHook(() =>
            useScrollAnimation(i + 1)
          );

          const style = result.current.getItemStyle(i);

          expect(style.opacity).toBe(1);
          expect(style.transform).toBe('none');
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 26: Items have opacity:0 and offset transform before intersection
  // -------------------------------------------------------------------------
  it('Property 26: Animated items have opacity:0 and offset transform before intersection', () => {
    /**
     * Validates: Requirements 8.2, 8.3
     *
     * Before intersection fires (isVisible === false), getItemStyle(i) must return
     * opacity: 0 and a non-zero transform offset.
     * - direction 'up'   → 'translateY(20px)'
     * - direction 'left' → 'translateX(-20px)'
     */
    fc.assert(
      fc.property(
        fc.nat({ max: 20 }),                           // any item index
        fc.constantFrom('up' as const, 'left' as const), // direction
        (i, direction) => {
          setupMocks();

          const { result } = renderHook(() =>
            useScrollAnimation(i + 1, { direction })
          );

          // Do NOT fire any intersection — isVisible stays false
          const style = result.current.getItemStyle(i);

          expect(style.opacity).toBe(0);

          const expectedTransform =
            direction === 'up' ? 'translateY(20px)' : 'translateX(-20px)';
          expect(style.transform).toBe(expectedTransform);
        }
      ),
      { numRuns: 100 }
    );
  });
});
