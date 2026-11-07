import React, { useState } from 'react';
import { X, Maximize2, Minimize2, ExternalLink, Sparkles, BookOpen, Layers } from 'lucide-react';

interface SimulationViewerModalProps {
  simulation: {
    id: string;
    title: string;
    titleNepali?: string;
    description: string;
    learningObjectives: string[];
    gradeLevels: number[];
    subjectCode?: string;
    runtimeUrl: string;
    simulationType: string;
    currentVersion?: string;
  } | null;
  onClose: () => void;
  onLaunchSmartBoard?: (sim: any) => void;
}

export const SimulationViewerModal: React.FC<SimulationViewerModalProps> = ({
  simulation,
  onClose,
  onLaunchSmartBoard,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!simulation) return null;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleLaunchSmartBoard = () => {
    onLaunchSmartBoard?.(simulation);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-white border border-slate-300 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[90vh]'
        }`}
      >
        {/* Header */}
        <div className="bg-slate-100/90 border-b border-slate-300 px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-sky-500/20 text-sky-700 border border-sky-500/30 text-xs font-bold rounded-lg uppercase tracking-wider">
              {simulation.simulationType.replace('_', ' ')}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                {simulation.title}
                {simulation.titleNepali && (
                  <span className="text-sm font-normal text-amber-700 hidden sm:inline">
                    ({simulation.titleNepali})
                  </span>
                )}
              </h2>
              <div className="text-xs text-slate-500 flex items-center gap-3">
                <span>Classes: {simulation.gradeLevels.join(', ')}</span>
                <span>•</span>
                <span>Subject: {simulation.subjectCode || 'General'}</span>
                {simulation.currentVersion && (
                  <>
                    <span>•</span>
                    <span>v{simulation.currentVersion}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                showDetails
                  ? 'bg-sky-600 text-white border-sky-500'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Objectives
            </button>
            {onLaunchSmartBoard && (
              <button
                onClick={handleLaunchSmartBoard}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg border border-emerald-400 shadow-md flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                🖥 Launch Smart Board
              </button>
            )}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Stage */}
        <div className="flex-1 relative flex bg-slate-50 overflow-hidden">
          {/* Simulation Iframe */}
          <iframe
            src={simulation.runtimeUrl}
            title={simulation.title}
            className="w-full h-full border-none"
            allow="fullscreen; accelerometer; gyroscope"
          />

          {/* Collapsible Learning Objectives Overlay */}
          {showDetails && (
            <div className="absolute top-4 right-4 w-80 max-h-[85%] bg-white/90 backdrop-blur-md border border-slate-300 rounded-xl p-4 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Learning Goals
                </span>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-slate-500 hover:text-slate-900 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {simulation.description}
              </p>

              {simulation.learningObjectives && simulation.learningObjectives.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Key Competencies:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {simulation.learningObjectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold mt-0.5">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
