'use client';

import { ProjectData } from '@/types/portfolio';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import ProjectCard from './ProjectCard';

interface ProjectsSectionProps {
  projects: ProjectData[];
  heading: string;
}

export default function ProjectsSection({ projects, heading }: ProjectsSectionProps) {
  const { containerRef, getItemStyle } = useScrollAnimation<HTMLDivElement>(
    projects.length,
    { staggerMs: 100, once: true }
  );

  return (
    <div className="py-16">
      <h2 className="text-3xl font-bold mb-8">{heading}</h2>
      <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div key={project.id} style={getItemStyle(index)}>
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}
