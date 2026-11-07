import React, { useState } from 'react';
import { FlaskConical, Info } from 'lucide-react';
import type { ReagentItem } from '../../services/virtual-lab.service';

interface ReagentRackProps {
  reagents: ReagentItem[];
  onSelectReagent?: (reagent: ReagentItem) => void;
  selectedReagentId?: string;
}

export const ReagentRack: React.FC<ReagentRackProps> = ({
  reagents,
  onSelectReagent,
  selectedReagentId,
}) => {
  const [activeReagent, setActiveReagent] = useState<ReagentItem | null>(null);

  const getGhsColor = (hazard?: string) => {
    if (hazard === 'DANGER') return 'text-red-400 bg-red-950/40 border-red-500/30';
    if (hazard === 'WARNING') return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-800 dark:bg-[#0B1522] dark:text-slate-100 shadow-xs transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <FlaskConical className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Reagent Rack</h3>
            <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400">Standardized Stock & Indicator Solutions</p>
          </div>
        </div>
        <span className="rounded-full bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20 px-2 py-0.5 text-[0.6875rem] font-semibold">
          {reagents.length} Reagents
        </span>
      </div>

      {/* Chemical Bottles Shelf */}
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
        {reagents.map((reagent) => {
          const isSelected = selectedReagentId === reagent.id;
          return (
            <div
              key={reagent.id}
              onClick={() => onSelectReagent?.(reagent)}
              className={`group relative flex items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-500 bg-teal-50 text-slate-900 shadow-xs dark:border-teal-500/60 dark:bg-teal-500/10 dark:text-slate-100'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 text-slate-800 dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/50 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 shadow-xs"
                  style={{
                    backgroundColor: reagent.colorHex ? `${reagent.colorHex}22` : undefined,
                  }}
                >
                  <FlaskConical
                    className="h-4 w-4"
                    style={{ color: reagent.colorHex || '#0D9488' }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-white">
                      {reagent.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[0.6875rem] text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-medium text-teal-700 dark:text-teal-300/90">{reagent.formula}</span>
                    {reagent.concentrationMolar !== undefined && (
                      <span className="rounded bg-teal-50 border border-teal-200 text-teal-800 dark:bg-teal-950/60 dark:border-teal-500/30 dark:text-teal-300 px-1 py-0.2 text-[0.6875rem] font-mono">
                        {reagent.concentrationMolar} M
                      </span>
                    )}
                    {reagent.state && (
                      <span className="text-[0.6875rem] text-slate-500 dark:text-slate-500 uppercase">{reagent.state}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {reagent.hazardSignalWord && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase border ${getGhsColor(
                      reagent.hazardSignalWord
                    )}`}
                  >
                    {reagent.hazardSignalWord}
                  </span>
                )}
                <button
                  type="button"
                  title="Hazard Profile"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveReagent(reagent);
                  }}
                  className="rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety & Hazard Inspector */}
      {activeReagent && (
        <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs text-slate-300 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <div>
              <span className="font-bold text-white text-xs">{activeReagent.name}</span>
              <span className="ml-2 font-mono text-[0.6875rem] text-teal-300">({activeReagent.formula})</span>
            </div>
            <button
              onClick={() => setActiveReagent(null)}
              className="text-slate-500 hover:text-slate-300 text-[0.6875rem]"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 text-[0.6875rem]">
            {activeReagent.molecularWeight && (
              <div>
                <span className="text-slate-400">Molecular Mass:</span>{' '}
                <span className="font-mono text-slate-200">{activeReagent.molecularWeight} g/mol</span>
              </div>
            )}
            {activeReagent.ghsPictograms.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-slate-400">GHS Pictograms:</span>
                <div className="flex gap-1">
                  {activeReagent.ghsPictograms.map((p, i) => (
                    <span key={i} className="rounded bg-red-950 border border-red-500/40 px-1 text-[0.6875rem] font-bold text-red-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {activeReagent.hazardStatements && activeReagent.hazardStatements.length > 0 && (
              <div>
                <span className="text-slate-400">Hazard Notes:</span>
                <p className="text-red-300/90 text-[0.6875rem] mt-0.5">{activeReagent.hazardStatements.join('; ')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
