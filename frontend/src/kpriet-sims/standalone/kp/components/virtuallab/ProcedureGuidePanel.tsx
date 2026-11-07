import React, { useState } from 'react';
import {
  ListOrdered,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Lightbulb,
  Volume2,
  VolumeX,
  ChevronRight,
} from 'lucide-react';
import type { ProcedureStep } from '../../services/virtual-lab.service';

interface ProcedureGuidePanelProps {
  steps: ProcedureStep[];
  currentStepIndex: number;
  onSelectStep?: (index: number) => void;
  onClose?: () => void;
}

export const ProcedureGuidePanel: React.FC<ProcedureGuidePanelProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
  onClose,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [speakingStep, setSpeakingStep] = useState<number | null>(null);
  const safeSteps = steps || [];

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const handleSpeak = (step: ProcedureStep, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (speakingStep === step.stepNumber) {
      setSpeakingStep(null);
      return;
    }
    const text = `Step ${step.stepNumber}: ${step.phase || ''}. ${step.instruction}. Hint: ${step.hint || ''}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingStep(null);
    utterance.onerror = () => setSpeakingStep(null);
    setSpeakingStep(step.stepNumber);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-800 dark:bg-[#0B1522] dark:text-slate-100 shadow-xs transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <ListOrdered className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Easy Step Guide
            </h3>
            <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400">
              NCERT Step-by-Step Instructions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20 px-2 py-0.5 text-[0.6875rem] font-semibold font-mono">
            Step {Math.min(safeSteps.length, currentStepIndex + 1)} of {safeSteps.length}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Collapse Step Guide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Simplified Steps List */}
      <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto pr-1">
        {safeSteps.map((step, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isDone = !!completedSteps[step.stepNumber];
          const isSpeaking = speakingStep === step.stepNumber;

          return (
            <div
              key={step.stepNumber}
              onClick={() => onSelectStep?.(idx)}
              className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                isCurrent
                  ? 'border-cyan-500 bg-cyan-50/90 text-slate-900 shadow-sm dark:border-cyan-500/60 dark:bg-cyan-950/30 dark:text-slate-100 ring-1 ring-cyan-500/30'
                  : isDone
                  ? 'border-slate-200 bg-slate-50/60 opacity-85 text-slate-600 dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-400'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Complete Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStep(step.stepNumber);
                  }}
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors cursor-pointer ${
                    isDone
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isCurrent
                      ? 'border-cyan-500 text-cyan-600 dark:border-cyan-400 dark:text-cyan-400'
                      : 'border-slate-300 dark:border-slate-600 text-transparent'
                  }`}
                  title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                >
                  {isDone ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[0.6875rem] font-bold uppercase tracking-wider ${
                          isCurrent
                            ? 'text-cyan-700 dark:text-cyan-300'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Step {step.stepNumber} · {step.phase || `Step ${step.stepNumber}`}
                      </span>
                      {isCurrent && (
                        <span className="rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 px-1.5 py-0.2 text-[0.6875rem] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {/* Audio Read Aloud Button */}
                    <button
                      type="button"
                      onClick={(e) => handleSpeak(step, e)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isSpeaking
                          ? 'text-cyan-500 bg-cyan-100 dark:bg-cyan-950/60 animate-pulse'
                          : 'text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300'
                      }`}
                      title="Read Step Aloud"
                    >
                      {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Easy Plain English Instruction */}
                  <p
                    className={`mt-1.5 text-xs leading-relaxed ${
                      isCurrent
                        ? 'font-medium text-slate-900 dark:text-slate-100'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    👉 {step.instruction}
                  </p>

                  {/* Pedagogical Hint in simple terms */}
                  {step.hint && (
                    <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50/70 dark:border-cyan-500/20 dark:bg-cyan-950/20 p-2 text-[0.6875rem] text-cyan-900 dark:text-cyan-200">
                      <Lightbulb className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Tip:</strong> {step.hint}
                      </div>
                    </div>
                  )}

                  {/* Safety Check alert */}
                  {step.safetyCheck && (
                    <div className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-950/20 p-2 text-[0.6875rem] text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Safety:</strong> {step.safetyCheck}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
