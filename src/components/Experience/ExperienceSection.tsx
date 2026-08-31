'use client';

import { ExperienceData } from '@/types/portfolio';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import TimelineEntry from './TimelineEntry';

interface ExperienceSectionProps {
  experience: ExperienceData[];
  heading: string;
}

export default function ExperienceSection({ experience, heading }: ExperienceSectionProps) {
  // Sort descending by startDate (most recent first) before rendering
  const sorted = [...experience].sort((a, b) => b.startDate.localeCompare(a.startDate));

  const { containerRef, getItemStyle } = useScrollAnimation<HTMLDivElement>(
    sorted.length,
    { direction: 'left', once: true, staggerMs: 100, threshold: 0.1 }
  );

  return (
    <div className="py-16">
      <h2 className="text-3xl font-bold mb-8">{heading}</h2>

      {sorted.length === 0 ? (
        <p>No experience entries available.</p>
      ) : (
        <div ref={containerRef} className="relative pl-8">
          {/* Vertical timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-white/20" />

          {sorted.map((entry, index) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              animationStyle={getItemStyle(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
