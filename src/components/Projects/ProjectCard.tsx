'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProjectData } from '@/types/portfolio';

interface ProjectCardProps {
  project: ProjectData;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [imgHidden, setImgHidden] = useState(false);

  return (
    <div className="border border-white/20 bg-black p-6 flex flex-col gap-4 transition-all duration-200 ease-in-out hover:border-red-500 rounded-none">
      {project.thumbnailUrl && !imgHidden && (
        <div className="relative w-full h-48">
          <Image
            src={project.thumbnailUrl}
            alt={project.title}
            fill
            className="object-cover"
            onError={() => setImgHidden(true)}
          />
        </div>
      )}

      <h3 className="font-bold text-lg font-sans">{project.title}</h3>

      <p className="text-white/70 text-sm">{project.description.slice(0, 160)}</p>

      <div className="flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="border border-white text-white uppercase font-mono text-xs px-4 py-2 rounded-none"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex gap-3 mt-auto">
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-red-500 font-mono text-xs uppercase transition-colors"
          >
            Live Demo
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-red-500 font-mono text-xs uppercase transition-colors"
          >
            GitHub
          </a>
        )}
      </div>
    </div>
  );
}
