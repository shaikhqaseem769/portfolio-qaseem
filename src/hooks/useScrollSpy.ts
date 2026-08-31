'use client';

import { useState, useEffect } from 'react';

export function useScrollSpy(
  sectionIds: string[],
  navHeight?: number
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (sectionIds.length === 0) return;

    // navHeight can be used to offset rootMargin if provided, otherwise default
    // to the symmetric 50% rule which works well for most viewports.
    const topMargin = navHeight != null ? `-${navHeight}px` : '-50%';
    const rootMargin = `${topMargin} 0px -50% 0px`;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin }
    );

    const elements: Element[] = [];
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [sectionIds, navHeight]);

  return activeId;
}
