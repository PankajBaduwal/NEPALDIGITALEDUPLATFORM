import { useEffect, useRef } from 'react';
import { X, Globe, Building2, Clock, Lightbulb, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import type { ISimulationEngineeringContext } from './types';
import { cn } from '@/utils/cn';

interface EngineeringContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context: ISimulationEngineeringContext;
  simulationTitle: string;
  theme?: 'dark' | 'light';
}

export function EngineeringContextPanel({
  isOpen,
  onClose,
  context,
  simulationTitle,
  theme = 'dark',
}: EngineeringContextPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Real-World and Engineering Context for ${simulationTitle}`}
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={cn(
          'relative flex h-full max-h-[96vh] w-full max-w-xl flex-col rounded-3xl border shadow-2xl transition-all overflow-hidden',
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        )}
      >
        {/* PANEL HEADER */}
        <div
          className={cn(
            'flex items-start justify-between border-b px-6 py-5',
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'
          )}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-[#047857]/20 text-[#10B981]">
                <Globe className="size-4" />
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#10B981]">
                Real-World & Engineering Context
              </span>
            </div>
            <h3 className="mt-1 text-[18px] font-bold tracking-tight">
              {simulationTitle}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close engineering context panel"
            className={cn(
              'rounded-xl p-2 transition-colors cursor-pointer',
              isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* PANEL CONTENT (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Summary / Concept Overview */}
          {context.summary && (
            <p className={cn('text-[14px] leading-relaxed', isDark ? 'text-slate-300' : 'text-slate-600')}>
              {context.summary}
            </p>
          )}

          {/* 1. What is happening? */}
          {context.whatIsHappening && (
            <div className={cn('rounded-2xl border p-4.5', isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/70')}>
              <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#10B981] uppercase tracking-wider">
                <BookOpen className="size-4" /> 1. What is happening?
              </h4>
              <p className={cn('mt-2 text-[14px] leading-relaxed', isDark ? 'text-slate-200' : 'text-slate-700')}>
                {context.whatIsHappening}
              </p>
            </div>
          )}

          {/* 2. Where is it used? */}
          {context.whereUsed && context.whereUsed.length > 0 && (
            <div>
              <h4 className={cn('flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider', isDark ? 'text-slate-200' : 'text-slate-800')}>
                <Building2 className="size-4 text-[#10B981]" /> 2. Where is it used?
              </h4>
              <ul className="mt-2.5 space-y-2">
                {context.whereUsed.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[13px]">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#10B981]" />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. When is it used? */}
          {context.whenUsed && context.whenUsed.length > 0 && (
            <div>
              <h4 className={cn('flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider', isDark ? 'text-slate-200' : 'text-slate-800')}>
                <Clock className="size-4 text-[#10B981]" /> 3. When is it used?
              </h4>
              <ul className="mt-2.5 space-y-2">
                {context.whenUsed.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[13px]">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#10B981]" />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. Why is it used? */}
          {context.whyUsed && context.whyUsed.length > 0 && (
            <div>
              <h4 className={cn('flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider', isDark ? 'text-slate-200' : 'text-slate-800')}>
                <Lightbulb className="size-4 text-[#10B981]" /> 4. Why is it used?
              </h4>
              <ul className="mt-2.5 space-y-2">
                {context.whyUsed.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[13px]">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#10B981]" />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 5. Engineering Applications */}
          {context.engineeringApplications && context.engineeringApplications.length > 0 && (
            <div>
              <h4 className={cn('text-[13px] font-bold uppercase tracking-wider', isDark ? 'text-slate-200' : 'text-slate-800')}>
                5. Engineering Applications
              </h4>
              <div className="mt-3 space-y-2.5">
                {context.engineeringApplications.map((app, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'rounded-xl border p-3.5 transition-colors',
                      isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
                    )}
                  >
                    <span className="inline-block rounded-md bg-[#047857]/20 px-2 py-0.5 text-[11px] font-bold text-[#10B981]">
                      {app.field}
                    </span>
                    <p className={cn('mt-1.5 text-[13px] leading-relaxed', isDark ? 'text-slate-300' : 'text-slate-700')}>
                      {app.example}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Key Takeaway */}
          {context.keyTakeaway && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4.5">
              <h4 className="flex items-center gap-2 text-[13px] font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="size-4" /> Key Takeaway
              </h4>
              <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-emerald-100">
                {context.keyTakeaway}
              </p>
            </div>
          )}

          {/* 7. Assumptions & Limitations */}
          {context.assumptionsOrLimitations && context.assumptionsOrLimitations.length > 0 && (
            <div className={cn('rounded-2xl border p-4', isDark ? 'border-amber-500/20 bg-amber-950/10' : 'border-amber-200 bg-amber-50/60')}>
              <h4 className="flex items-center gap-2 text-[12px] font-bold text-amber-500 uppercase tracking-wider">
                <AlertTriangle className="size-4" /> Assumptions & Idealizations
              </h4>
              <ul className="mt-2 space-y-1.5 text-[12px] text-amber-200/90">
                {context.assumptionsOrLimitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-amber-400" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className={cn('border-t px-6 py-3.5 flex justify-between items-center text-[12px]', isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500')}>
          <span>PAGTRON Infotech Engineering Curriculum Integration</span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-[#10B981] hover:underline cursor-pointer"
          >
            Back to Simulation
          </button>
        </div>
      </div>
    </div>
  );
}
