import type { ReactNode } from 'react';
import { AlertCircle, Inbox, RotateCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center', className)}>
      <span className="mb-3 flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-xs" aria-hidden="true">
        {icon ?? <Inbox className="size-6" />}
      </span>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  showBack?: boolean;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Unable to load this information right now.',
  onRetry,
  showBack,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-6 py-8 text-center', className)}>
      <AlertCircle className="mb-2 size-5 text-rose-600" aria-hidden="true" />
      <h3 className="text-sm font-bold text-rose-900">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-rose-700">{description}</p>
      {(onRetry || showBack) && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              <RotateCw className="size-3.5 mr-1" /> Retry
            </Button>
          )}
          {showBack && (
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              Go back
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function LoadingState({ title = 'Loading data...', className }: { title?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <span className="inline-block size-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      <p className="mt-2 text-xs font-medium text-slate-500">{title}</p>
    </div>
  );
}

