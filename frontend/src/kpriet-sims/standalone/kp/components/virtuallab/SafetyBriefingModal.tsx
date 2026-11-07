import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Flame, Droplets } from 'lucide-react';
import type { VirtualLabExperimentData } from '../../services/virtual-lab.service';

interface SafetyBriefingModalProps {
  isOpen: boolean;
  experiment: VirtualLabExperimentData;
  onAcknowledge: () => Promise<void>;
  isLoading?: boolean;
}

export const SafetyBriefingModal: React.FC<SafetyBriefingModalProps> = ({
  isOpen,
  experiment,
  onAcknowledge,
  isLoading = false,
}) => {
  const [ppeChecked, setPpeChecked] = useState<Record<string, boolean>>({});
  const [hazardsRead, setHazardsRead] = useState(false);

  if (!isOpen) return null;

  const safety = experiment?.safetyBriefing ?? { requiredPpe: [], criticalHazards: [] };
  const requiredPpe = safety?.requiredPpe ?? [];
  const allPpeChecked =
    requiredPpe.length === 0 ||
    requiredPpe.every((ppe) => ppeChecked[ppe]);

  const canProceed = allPpeChecked && hazardsRead;

  const togglePpe = (ppe: string) => {
    setPpeChecked((prev) => ({ ...prev, [ppe]: !prev[ppe] }));
  };

  const equipAllPpe = () => {
    const next: Record<string, boolean> = {};
    requiredPpe.forEach((p) => {
      next[p] = true;
    });
    setPpeChecked(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-hidden">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-white dark:bg-[#0B1522] text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden transition-colors">
        {/* Pinned Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-5 shrink-0 bg-slate-50 dark:bg-[#08121E]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Mandatory Laboratory Protocol
              </span>
              <span className="rounded bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 px-2 py-0.5 text-[0.6875rem] font-bold">
                GHS Compliance
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Pre-Lab Safety Briefing</h2>
          </div>
        </div>

        {/* Scrollable Middle Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Experiment Context */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 sm:p-3.5">
            <p className="text-[0.6875rem] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Experiment</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200 mt-0.5">
              [{experiment?.experimentId}] {experiment?.title}
            </p>
            <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 mt-1">
              Reference: {experiment?.officialSourceReference?.authority || 'NCERT'} · {experiment?.officialSourceReference?.unitOrChapter || experiment?.classLevel || 'Practical Lab'}
            </p>
          </div>

          {/* Step 1: PPE Verification */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span>1. Required Personal Protective Equipment (PPE)</span>
                <span className="text-amber-600 dark:text-amber-400 text-[0.6875rem] font-normal">(Select to wear each item)</span>
              </h3>
              {requiredPpe.length > 0 && !allPpeChecked && (
                <button
                  type="button"
                  onClick={equipAllPpe}
                  className="text-[0.6875rem] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  ✓ Equip All PPE
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {safety.requiredPpe.map((ppe) => {
                const checked = !!ppeChecked[ppe];
                return (
                  <button
                    key={ppe}
                    type="button"
                    onClick={() => togglePpe(ppe)}
                    className={`flex items-center gap-2.5 rounded-lg border p-2.5 sm:p-3 text-left text-xs font-medium transition-all cursor-pointer ${
                      checked
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-200 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        checked
                          ? 'border-emerald-500 bg-emerald-500 text-white dark:text-black'
                          : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
                      }`}
                    >
                      {checked && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    <span>{ppe}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Critical Hazards */}
          <div>
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              2. Critical Chemical Hazards & GHS Warnings
            </h3>
            <div className="space-y-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-950/20 p-3 sm:p-3.5">
              {safety.criticalHazards.map((hazard, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-red-900 dark:text-red-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                  <span>{hazard}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spill & Waste Disposal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
              <div className="flex items-center gap-1.5 font-semibold text-cyan-800 dark:text-cyan-300 mb-1">
                <Droplets className="h-3.5 w-3.5" />
                <span>Spill Management</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[0.6875rem]">{safety.spillManagement}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
              <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300 mb-1">
                <Flame className="h-3.5 w-3.5" />
                <span>Waste Disposal Protocol</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[0.6875rem]">{safety.wasteDisposal}</p>
            </div>
          </div>
        </div>

        {/* Pinned Footer with Action Button */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#08121E] p-4 sm:p-5 shrink-0 space-y-3">
          {/* Declaration Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hazardsRead}
              onChange={(e) => setHazardsRead(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-[0.6875rem] sm:text-xs text-slate-700 dark:text-slate-300 leading-tight">
              I have donned all required PPE, thoroughly reviewed the chemical hazard profiles and spill procedures, and commit to following NCERT laboratory safety precautions.
            </span>
          </label>

          {/* Action Button */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={!canProceed || isLoading}
              onClick={() => onAcknowledge()}
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all w-full sm:w-auto ${
                canProceed && !isLoading
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 text-white dark:text-slate-950 shadow-md hover:brightness-110 cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-900 dark:border-slate-100 border-t-transparent" />
                  Initializing Bench...
                </span>
              ) : (
                <span>I Understand & Enter Virtual Laboratory →</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
