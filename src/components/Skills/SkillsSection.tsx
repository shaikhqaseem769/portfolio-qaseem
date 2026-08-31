'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface SkillsSectionProps {
  skills: string[];
  heading: string;
}

export default function SkillsSection({ skills, heading }: SkillsSectionProps) {
  const { containerRef, getItemStyle } = useScrollAnimation<HTMLDivElement>(
    skills.length,
    { staggerMs: 100, once: true }
  );

  return (
    <div className="py-16">
      <h2 className="text-3xl font-bold mb-8 font-sans">{heading}</h2>
      <div ref={containerRef} className="flex flex-wrap gap-3">
        {skills.map((skill, index) => (
          <span
            key={skill}
            style={getItemStyle(index)}
            className="border border-white text-white uppercase font-mono text-xs px-4 py-2 rounded-none transition-colors hover:border-red-500 hover:text-red-500 w-full md:w-auto"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
