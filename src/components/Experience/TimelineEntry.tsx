import { ExperienceData } from '@/types/portfolio';
import { formatDate } from '@/lib/formatDate';

interface TimelineEntryProps {
  entry: ExperienceData;
  animationStyle: React.CSSProperties;
}

export default function TimelineEntry({ entry, animationStyle }: TimelineEntryProps) {
  return (
    <div className="relative mb-8" style={animationStyle}>
      {/* Diamond marker */}
      <span className="absolute rotate-45 w-3 h-3 bg-red-500 inline-block" style={{ left: '-1.25rem', top: '0.25rem' }} />

      <h3 className="font-bold">{entry.company}</h3>
      <p className="text-white/70 font-mono text-sm">{entry.role}</p>
      <p className="text-white/50 font-mono text-xs mb-3">
        {formatDate(entry.startDate)} — {formatDate(entry.endDate)}
      </p>

      <ul className="list-disc list-inside space-y-1">
        {entry.bullets.map((bullet, i) => (
          <li key={i} className="text-white/80 text-sm">
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}
