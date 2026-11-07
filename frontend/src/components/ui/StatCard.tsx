import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

export type StatusLevel = 'healthy' | 'monitor' | 'attention' | 'critical' | 'info' | 'neutral';

const statusStyles: Record<StatusLevel, { dot: string; text: string; bg: string; label: string }> = {
  healthy: { dot: 'bg-emerald-500', text: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200', label: 'Healthy' },
  monitor: { dot: 'bg-blue-500', text: 'text-blue-800', bg: 'bg-blue-50 border-blue-200', label: 'Monitor' },
  attention: { dot: 'bg-amber-500', text: 'text-amber-800', bg: 'bg-amber-50 border-amber-200', label: 'Attention' },
  critical: { dot: 'bg-rose-500', text: 'text-rose-800', bg: 'bg-rose-50 border-rose-200', label: 'Critical' },
  info: { dot: 'bg-blue-500', text: 'text-blue-800', bg: 'bg-blue-50 border-blue-200', label: 'Info' },
  neutral: { dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', label: '—' },
};

export function StatusBadge({ status, label, className }: { status: StatusLevel; label?: ReactNode; className?: string }) {
  const s = statusStyles[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold', s.bg, s.text, className)}>
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', s.dot)} />
      {label ?? s.label}
    </span>
  );
}

export function statusFromPercent(value: number | null | undefined, threshold = 75): StatusLevel {
  if (value == null || Number.isNaN(value)) return 'neutral';
  if (value >= threshold + 10) return 'healthy';
  if (value >= threshold) return 'monitor';
  if (value >= threshold - 15) return 'attention';
  return 'critical';
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  delta?: number | null;
  deltaSuffix?: string;
  status?: StatusLevel;
  onClick?: () => void;
  className?: string;
}

export function StatCard({ label, value, hint, icon, delta, deltaSuffix = '%', status, onClick, className }: StatCardProps) {
  const Comp = onClick ? 'button' : 'div';
  const trend = delta == null ? null : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all',
        onClick && 'cursor-pointer hover:border-slate-300 hover:shadow-md text-left',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="my-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {status && <StatusBadge status={status} />}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        {hint && <span className="truncate">{hint}</span>}
        {delta != null && (
          <span
            className={cn(
              'ml-auto inline-flex items-center gap-0.5 font-semibold',
              trend === 'up' && 'text-emerald-600',
              trend === 'down' && 'text-rose-600',
              trend === 'flat' && 'text-slate-500'
            )}
          >
            {trend === 'up' && <TrendingUp className="size-3" />}
            {trend === 'down' && <TrendingDown className="size-3" />}
            {trend === 'flat' && <Minus className="size-3" />}
            {Math.abs(delta)}
            {deltaSuffix}
          </span>
        )}
      </div>
    </Comp>
  );
}

