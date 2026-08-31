'use client';

import { useRef, useState, useEffect, useCallback, CSSProperties } from 'react';

export interface UseScrollAnimationOptions {
  threshold?: number;
  staggerMs?: number;
  once?: boolean;
  direction?: 'up' | 'left';
}

export interface UseScrollAnimationReturn<T extends HTMLElement> {
  containerRef: React.RefObject<T>;
  getItemStyle: (index: number) => CSSProperties;
  isVisible: boolean;
}

export function useScrollAnimation<T extends HTMLElement>(
  count: number,
  options?: UseScrollAnimationOptions
): UseScrollAnimationReturn<T> {
  const {
    threshold = 0.1,
    staggerMs = 100,
    once = true,
    direction = 'up',
  } = options ?? {};

  const containerRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check prefers-reduced-motion once on mount (SSR-safe)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReducedMotion(true);
      setIsVisible(true);
    }
  }, []);

  // Set up IntersectionObserver on the container ref
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once, reducedMotion]);

  const getItemStyle = useCallback(
    (index: number): CSSProperties => {
      // Reduced motion: always fully visible, no transitions
      if (reducedMotion) {
        return { opacity: 1, transform: 'none' };
      }

      if (!isVisible) {
        return {
          opacity: 0,
          transform: direction === 'up' ? 'translateY(20px)' : 'translateX(-20px)',
          transition: 'none',
        };
      }

      return {
        opacity: 1,
        transform: direction === 'up' ? 'translateY(0)' : 'translateX(0)',
        transition: `opacity 400ms ease, transform 400ms ease ${index * staggerMs}ms`,
      };
    },
    [isVisible, reducedMotion, direction, staggerMs]
  );

  // Suppress unused variable warning for count — it documents how many items
  // the caller intends to animate (used externally to map indices 0…count-1).
  void count;

  return { containerRef, getItemStyle, isVisible };
}
