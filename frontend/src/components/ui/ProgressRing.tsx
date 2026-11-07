import { cn } from '@/utils/cn';

interface ProgressRingProps {
  value: number; // 0..100
  size?: number; // px
  strokeWidth?: number; // px
  label?: string;
  sublabel?: string;
  color?: string; // CSS color string or class
  className?: string;
}

export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 8,
  label,
  sublabel,
  color,
  className,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value || 0)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const defaultColor =
    clamped >= 80 ? '#6d4fd6' : clamped >= 60 ? '#a08be6' : clamped >= 40 ? '#f1b434' : '#e5533d';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#dcebe6"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color || defaultColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-bold text-slate-800">{label ?? `${clamped}%`}</span>
        {sublabel && <span className="text-[10px] text-slate-500 font-medium">{sublabel}</span>}
      </div>
    </div>
  );
}

