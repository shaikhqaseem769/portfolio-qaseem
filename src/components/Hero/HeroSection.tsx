import { HeroData } from '@/types/portfolio';
import TerminalWidget from './TerminalWidget';

interface HeroSectionProps {
  data: HeroData;
  cvUrl: string;
}

export default function HeroSection({ data, cvUrl }: HeroSectionProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-16">
      {/* Left column: text content */}
      <div>
        {/* Pre-heading: flicker on hover */}
        <p className="font-mono uppercase text-xs text-white/60 mb-4 tracking-widest hover:text-red-500/80 hover:tracking-[0.25em] transition-all duration-300 cursor-default select-none">
          SENIOR SOFTWARE ENGINEER
        </p>

        {/* Headline: each word lifts and glows on hover */}
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          {data.headline.map((word, i) => (
            <span
              key={i}
              className="inline-block cursor-default group"
            >
              {word === data.accentWord ? (
                <span className="text-red-500 inline-block transition-all duration-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(255,0,0,0.9)] group-hover:-translate-y-1">
                  {word}
                </span>
              ) : (
                <span className="text-white inline-block transition-all duration-200 group-hover:text-red-400 group-hover:scale-105 group-hover:-translate-y-0.5">
                  {word}
                </span>
              )}
              {i < data.headline.length - 1 ? '\u00A0' : ''}
            </span>
          ))}
        </h1>

        {/* Bio: subtle left-border reveal on hover */}
        <p className="text-white/80 max-w-xl mb-6 pl-0 border-l-0 border-red-500 hover:pl-4 hover:border-l-2 hover:text-white transition-all duration-300 cursor-default">
          {data.bio.slice(0, 300)}
        </p>

        {/* Tech stack chips: scan + glow on hover */}
        <div className="flex flex-wrap gap-2 mb-8">
          {data.techStack.map((tech) => (
            <span
              key={tech}
              className="
                relative overflow-hidden
                border border-white text-white uppercase font-mono text-xs px-3 py-1 rounded-none
                cursor-default select-none
                transition-all duration-200
                hover:border-red-500 hover:text-red-500
                hover:shadow-[0_0_10px_rgba(255,0,0,0.3),inset_0_0_10px_rgba(255,0,0,0.05)]
                hover:-translate-y-0.5 hover:scale-105
                after:content-[''] after:absolute after:inset-0
                after:bg-gradient-to-r after:from-transparent after:via-red-500/20 after:to-transparent
                after:-translate-x-full after:hover:translate-x-full after:transition-transform after:duration-500
              "
            >
              {tech}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4">
          {/* View Projects: fills with brighter red + shakes arrow on hover */}
          <a
            href="#projects"
            className="
              group relative overflow-hidden
              bg-red-500 text-white px-6 py-3 font-mono text-xs uppercase rounded-none
              clip-chamfer-lg inline-block
              transition-all duration-200
              hover:bg-red-400 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]
              hover:-translate-y-0.5
            "
          >
            <span className="relative z-10 flex items-center gap-2">
              VIEW PROJECTS
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </span>
            {/* Sweep shine */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </a>

          {/* Download CV: border brightens, bg tints red, corners pulse */}
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group relative overflow-hidden
              border border-white bg-transparent text-white px-6 py-3 font-mono text-xs uppercase rounded-none
              clip-chamfer-lg inline-block
              transition-all duration-200
              hover:border-red-500 hover:text-red-500 hover:bg-red-500/5
              hover:shadow-[0_0_16px_rgba(255,0,0,0.25)]
              hover:-translate-y-0.5
            "
          >
            <span className="relative z-10">DOWNLOAD CV</span>
            {/* Sweep shine */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </a>
        </div>

        {/* TerminalWidget below text on small screens */}
        <div className="mt-10 lg:hidden">
          <TerminalWidget code={data.terminalCode} />
        </div>
      </div>

      {/* Right column: TerminalWidget at lg+ only */}
      <div className="hidden lg:block">
        <TerminalWidget code={data.terminalCode} />
      </div>
    </div>
  );
}
