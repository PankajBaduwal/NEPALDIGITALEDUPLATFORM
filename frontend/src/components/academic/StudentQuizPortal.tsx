import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  ShieldAlert,
  Maximize,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface StudentQuizPortalProps {
  overview: any;
}

export const StudentQuizPortal: React.FC<StudentQuizPortalProps> = ({ overview }) => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [activeQuizLoading, setActiveQuizLoading] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // Multi-format answers state
  // key: questionId, value: { selectedOption?: string, selectedOptions?: string[], textAnswer?: string, numericalAnswer?: number }
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<any>(null);

  // Proctoring state
  const [warningsCount, setWarningsCount] = useState<number>(0);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [showSecurityWarning, setShowSecurityWarning] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLockdownGateOpen, setIsLockdownGateOpen] = useState(false);
  const [isLockdownActive, setIsLockdownActive] = useState(false);

  const getIsFullscreenRequired = (q: any) => {
    if (!q || !q.securitySettings) return true;
    return q.securitySettings.enforceFullscreen !== undefined
      ? Boolean(q.securitySettings.enforceFullscreen)
      : q.securitySettings.fullscreenEnforced !== undefined
      ? Boolean(q.securitySettings.fullscreenEnforced)
      : true;
  };

  const getIsTabDetectionActive = (q: any) => {
    if (!q || !q.securitySettings) return true;
    return q.securitySettings.detectTabSwitch !== undefined
      ? Boolean(q.securitySettings.detectTabSwitch)
      : q.securitySettings.tabSwitchDetection !== undefined
      ? Boolean(q.securitySettings.tabSwitchDetection)
      : true;
  };

  const getIsAutoSubmitViolation = (q: any) => {
    if (!q || !q.securitySettings) return true;
    return q.securitySettings.autoSubmitOnViolations !== undefined
      ? Boolean(q.securitySettings.autoSubmitOnViolations)
      : q.securitySettings.autoSubmitOnViolation !== undefined
      ? Boolean(q.securitySettings.autoSubmitOnViolation)
      : true;
  };

  const getIsPreventClipboard = (q: any) => {
    if (!q || !q.securitySettings) return true;
    return q.securitySettings.blockCopyPaste !== undefined
      ? Boolean(q.securitySettings.blockCopyPaste)
      : q.securitySettings.preventClipboard !== undefined
      ? Boolean(q.securitySettings.preventClipboard)
      : true;
  };

  const getMaxWarnings = (q: any) => {
    return q?.securitySettings?.maxWarnings || 3;
  };

  useEffect(() => {
    loadStudentQuizzes();
  }, [overview]);

  const loadStudentQuizzes = async () => {
    const classId =
      overview?.studentProfile?.classId?.id ||
      overview?.studentProfile?.classId?._id ||
      overview?.academicInfo?.classId ||
      overview?.subjects?.[0]?.classId ||
      overview?.class?._id ||
      overview?.student?.classId;
    const sectionId =
      overview?.studentProfile?.sectionId?.id ||
      overview?.studentProfile?.sectionId?._id ||
      overview?.academicInfo?.sectionId ||
      overview?.subjects?.[0]?.sectionId ||
      overview?.section?._id ||
      overview?.student?.sectionId;

    if (!classId || !sectionId) {
      setQuizzes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const quizzesData = await api.get<any>(`/quizzes/student?classId=${classId}&sectionId=${sectionId}`);
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
    } catch (e) {
      console.error('Failed to load student quizzes', e);
      setLoadError((e as any)?.message || 'Request failed');
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  // Start / Open quiz
  const handleStartQuiz = async (quizId: string) => {
    setActiveQuizLoading(true);
    try {
      const q = await api.get<any>(`/quizzes/${quizId}`);
      setActiveQuiz(q);
      setCurrentQIndex(0);
      setUserAnswers({});
      setWarningsCount(0);
      setSecurityEvents([]);
      setShowSecurityWarning(null);
      // The server owns the clock: it started when the quiz was first opened and survives page reloads
      setTimeLeftSeconds(typeof q.remainingSeconds === 'number' ? q.remainingSeconds : (q.durationMinutes || 15) * 60);
      setAttemptResult(q.myAttempt || null);

      if (q.myAttempt) {
        setIsLockdownGateOpen(false);
        setIsLockdownActive(false);
      } else {
        if (getIsFullscreenRequired(q)) {
          setIsLockdownGateOpen(true);
          setIsLockdownActive(false);
        } else {
          setIsLockdownGateOpen(false);
          setIsLockdownActive(true);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to open assessment');
    } finally {
      setActiveQuizLoading(false);
    }
  };

  const handleEnterLockdown = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch (fsErr) {
      console.warn('Fullscreen request dismissed or unsupported', fsErr);
    }
    setIsLockdownGateOpen(false);
    setIsLockdownActive(true);
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      const currentlyFs = Boolean(document.fullscreenElement);
      setIsFullscreen(currentlyFs);
      if (activeQuiz && !attemptResult && isLockdownActive && getIsFullscreenRequired(activeQuiz) && !currentlyFs) {
        logSecurityViolation('FULLSCREEN_EXIT', 'Exited mandatory full-screen lockdown mode');
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [activeQuiz, attemptResult, isLockdownActive]);

  // Tab switch & visibility change detector
  useEffect(() => {
    if (!activeQuiz || attemptResult || !isLockdownActive) return;
    if (!getIsTabDetectionActive(activeQuiz)) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityViolation('TAB_SWITCH', 'Switched browser tab or minimized examination window');
      }
    };

    const handleWindowBlur = () => {
      if (!document.hidden) {
        logSecurityViolation('WINDOW_BLUR', 'Moved window focus away from examination');
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      if (getIsPreventClipboard(activeQuiz)) {
        e.preventDefault();
        logSecurityViolation('CLIPBOARD_ATTEMPT', 'Copy/paste clipboard action blocked');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [activeQuiz, attemptResult, isLockdownActive, warningsCount]);

  const logSecurityViolation = (eventType: string, details: string) => {
    if (attemptResult) return;
    const newCount = warningsCount + 1;
    setWarningsCount(newCount);
    const event = { eventType, timestamp: new Date(), details };
    setSecurityEvents((prev) => [...prev, event]);

    const maxW = getMaxWarnings(activeQuiz);
    setShowSecurityWarning(
      `⚠️ Examination Security Warning (${newCount}/${maxW}): ${details}.`
    );

    if (newCount >= maxW && getIsAutoSubmitViolation(activeQuiz)) {
      alert(`Proctoring violation limit (${maxW}) reached! Your examination answers are being submitted automatically now.`);
      handleSubmitQuiz();
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!activeQuiz || attemptResult || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, attemptResult, timeLeftSeconds]);

  const handleAutoSubmit = () => {
    alert('Time limit reached! Submitting your answers automatically.');
    handleSubmitQuiz();
  };

  // Option selection handlers for multi-format questions
  const handleSingleSelect = (questionId: string, optionId: string) => {
    if (attemptResult) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], selectedOption: optionId },
    }));
  };

  const handleMultiSelectToggle = (questionId: string, optionId: string) => {
    if (attemptResult) return;
    const current = userAnswers[questionId]?.selectedOptions || [];
    const updated = current.includes(optionId)
      ? current.filter((id: string) => id !== optionId)
      : [...current, optionId];
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], selectedOptions: updated },
    }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    if (attemptResult) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], textAnswer: text },
    }));
  };

  const handleNumericalChange = (questionId: string, val: number | string) => {
    if (attemptResult) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], numericalAnswer: val === '' ? undefined : Number(val) },
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    try {
      const formattedAnswers = (activeQuiz.questions || []).map((q: any) => {
        const qId = q.id || q._id;
        const ans = userAnswers[qId] || {};
        return {
          questionId: qId,
          selectedOption: ans.selectedOption || '',
          selectedOptions: ans.selectedOptions || [],
          textAnswer: ans.textAnswer || '',
          numericalAnswer: ans.numericalAnswer,
        };
      });

      const payload = {
        answers: formattedAnswers,
        timeSpentSeconds: activeQuiz.durationMinutes * 60 - timeLeftSeconds,
        securityEvents,
        warningsCount,
      };

      const result = await api.post<any>(`/quizzes/${activeQuiz.id || activeQuiz._id}/attempt`, payload);

      setAttemptResult(result);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      loadStudentQuizzes();
    } catch (err: any) {
      alert(err.message || 'Failed to submit examination');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {loadError && (/disabled by your school/i.test(loadError) ? (
        <div className="bg-violet-50 border border-violet-200 text-violet-900 text-sm rounded-xl p-4">
          <b>Quizzes are switched off for your class.</b> Your school (principal or school admin) controls which modules each class can use. Ask them to turn this on if you need it.
        </div>
      ) : (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3">
          Could not load this section: {loadError}
        </div>
      ))}
      {/* Quiz List Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="text-amber-600" size={22} />
            Curriculum Quizzes & Academic Assessments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test chapter understanding, solve timed numerical & objective questions, and review CDC explanations.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">Loading your assessments…</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <HelpCircle className="mx-auto text-slate-300 mb-3" size={40} />
          <h3 className="text-sm font-bold text-slate-700">No Published Assessments</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Your subject teachers have not published any quizzes or tests for your class section yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((q) => (
            <div
              key={q.id || q._id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between hover:border-amber-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {q.subjectName}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {q.durationMinutes} mins
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{q.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {q.description || `Assessment covering ${q.questionCount || q.questions?.length || 0} questions.`}
                </p>

                {/* Units badge */}
                {q.curriculumUnits && q.curriculumUnits.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {q.curriculumUnits.map((u: string) => (
                      <span key={u} className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {u}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Teacher: <strong className="text-slate-700">{q.teacherName}</strong></span>
                  {getIsFullscreenRequired(q) && (
                    <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                      <ShieldAlert size={11} /> Secure Lockdown
                    </span>
                  )}
                </div>

                {q.attempted && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Completed
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      Score: {q.myScore} / {q.totalMarks}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleStartQuiz(q.id || q._id)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                    q.attempted
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {q.attempted ? (
                    <>
                      <RotateCcw size={13} /> Review Questions & Solutions
                    </>
                  ) : (
                    <>
                      <Play size={13} /> Attempt Examination Now
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SECURE EXAMINATION LOCKDOWN GATE ─────────────────────────────────── */}
      {isLockdownGateOpen && activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Secure Examination Lockdown</h3>
                <p className="text-xs text-slate-500">{activeQuiz.title} • {activeQuiz.durationMinutes || 15} Minutes</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
              <p className="font-bold text-slate-700">Examination Security & Proctoring Regulations:</p>
              <div className="flex items-start gap-2 text-slate-600">
                <span className="font-bold text-amber-600">•</span>
                <span><strong>Full-Screen Lockdown:</strong> The test runs in uninterrupted full-screen mode.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <span className="font-bold text-amber-600">•</span>
                <span><strong>Anti-Tab Switching:</strong> Switching tabs or opening applications triggers automatic proctoring warnings.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <span className="font-bold text-amber-600">•</span>
                <span><strong>Violation Threshold:</strong> Reaching <strong>{getMaxWarnings(activeQuiz)} warnings</strong> will instantly auto-submit your exam.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <span className="font-bold text-amber-600">•</span>
                <span><strong>Clipboard Lock:</strong> Copy, cut, and paste actions are strictly blocked.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLockdownGateOpen(false);
                  setActiveQuiz(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEnterLockdown}
                className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-sm flex items-center gap-2 transition"
              >
                <Maximize size={14} /> Enter Full-Screen & Start Examination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADVANCED PROCTORED ACTIVE QUIZ MODAL ─────────────────────────────────────── */}
      {activeQuiz && !isLockdownGateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-md p-2 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white text-slate-900 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                    {activeQuiz.targetMode ? activeQuiz.targetMode.toUpperCase() : 'CDC QUIZ'}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base">{activeQuiz.title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeQuiz.questions?.length} Questions • Total: {activeQuiz.totalMarks} marks • Passing: {activeQuiz.passingMarks}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {!attemptResult && (
                  <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    <Clock size={14} /> {formatTime(timeLeftSeconds)}
                  </div>
                )}
                {getIsFullscreenRequired(activeQuiz) && !attemptResult && (
                  <button
                    onClick={() => {
                      if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen().catch(() => {});
                      }
                    }}
                    title="Toggle Fullscreen Lockdown Mode"
                    className="p-1 rounded text-slate-300 hover:text-white"
                  >
                    <Maximize size={18} />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (
                      !attemptResult &&
                      !confirm('Exit exam? Progress will not be saved if you leave before submitting.')
                    ) {
                      return;
                    }
                    if (document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {});
                    }
                    setIsLockdownActive(false);
                    setIsLockdownGateOpen(false);
                    setActiveQuiz(null);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* FULLSCREEN LOCKDOWN BREACH BLOCKER OVERLAY */}
            {!attemptResult && isLockdownActive && getIsFullscreenRequired(activeQuiz) && !isFullscreen && (
              <div className="absolute inset-0 z-50 bg-slate-900/30 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-slate-900">
                <ShieldAlert size={56} className="text-amber-400 mb-3 animate-pulse" />
                <h3 className="text-xl font-black mb-1 text-white">
                  Examination Screen Locked
                </h3>
                <p className="text-slate-300 text-xs max-w-md mb-4 leading-relaxed">
                  You have navigated away, switched tabs, or exited mandatory full-screen mode.
                  In accordance with Nepal examination security regulations, you must return to full-screen mode to resume your test.
                </p>
                <div className="bg-amber-950/70 border border-amber-500/40 rounded-xl px-4 py-2 mb-5 text-amber-300 text-xs font-mono font-bold">
                  Proctoring Warnings Recorded: {warningsCount} / {getMaxWarnings(activeQuiz)}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (!document.fullscreenElement) {
                        await document.documentElement.requestFullscreen();
                      }
                      setIsFullscreen(true);
                    } catch (e) {
                      console.error('Failed to request fullscreen:', e);
                    }
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
                >
                  Return to Full-Screen Mode & Resume
                </button>
              </div>
            )}

            {/* Security Warning Toast Banner */}
            {showSecurityWarning && !attemptResult && (
              <div className="bg-rose-600 text-white px-4 py-2 text-xs flex items-center justify-between animate-pulse">
                <span className="flex items-center gap-2 font-bold">
                  <ShieldAlert size={16} /> {showSecurityWarning}
                </span>
                <button
                  onClick={() => setShowSecurityWarning(null)}
                  className="text-rose-200 hover:text-white font-bold ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Score Banner if completed */}
            {attemptResult && (
              <div
                className={`p-4 border-b flex items-center justify-between text-xs ${
                  attemptResult.passed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award size={20} className={attemptResult.passed ? 'text-emerald-600' : 'text-amber-600'} />
                  <div>
                    <span className="font-bold text-sm">
                      Your Score: {attemptResult.score} / {attemptResult.totalMarks} ({attemptResult.percentage}%)
                    </span>
                    <span className="ml-2 font-semibold">
                      • Status: {attemptResult.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                    </span>
                  </div>
                </div>
                {attemptResult.warningsCount > 0 && (
                  <span className="text-[11px] text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <AlertTriangle size={12} /> {attemptResult.warningsCount} Proctoring Warnings
                  </span>
                )}
              </div>
            )}

            {/* Main Assessment Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Question Navigation Bubbles */}
              <div className="flex flex-wrap gap-1.5 pb-3 border-b border-slate-100">
                {activeQuiz.questions?.map((_: any, idx: number) => {
                  const qId = activeQuiz.questions[idx]?.id || activeQuiz.questions[idx]?._id;
                  const ans = userAnswers[qId];
                  const hasAns =
                    ans?.selectedOption ||
                    (ans?.selectedOptions && ans.selectedOptions.length > 0) ||
                    ans?.textAnswer ||
                    ans?.numericalAnswer !== undefined;

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                        currentQIndex === idx
                          ? 'bg-amber-600 text-white shadow'
                          : hasAns
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Current Question */}
              {activeQuiz.questions && activeQuiz.questions[currentQIndex] && (() => {
                const q = activeQuiz.questions[currentQIndex];
                const qId = q.id || q._id;
                const qType = q.questionType || 'MCQ';
                const currentAns = userAnswers[qId] || {};

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">Question {currentQIndex + 1} of {activeQuiz.questions.length}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600 uppercase">
                          {qType.replace('_', ' ')}
                        </span>
                        {q.bloomLevel && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                            Bloom: {q.bloomLevel}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-slate-700">{q.marks || 1} mark(s)</span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                      {q.questionText}
                    </h4>

                    {/* Assertion & Reason Special Layout */}
                    {qType === 'ASSERTION_REASON' && (
                      <div className="space-y-2 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-xs">
                        <p><strong>Assertion (A):</strong> {q.assertionText || 'Statement A'}</p>
                        <p><strong>Reason (R):</strong> {q.reasonText || 'Statement R'}</p>
                      </div>
                    )}

                    {/* Format 1: MCQ (Single Choice) */}
                    {(qType === 'MCQ' || qType === 'ASSERTION_REASON') && (
                      <div className="space-y-2 pt-1">
                        {q.options?.map((opt: any) => {
                          const isSelected = currentAns.selectedOption === opt.id;
                          const isCorrect = Array.isArray(q.correctAnswers)
                            ? q.correctAnswers.includes(opt.id)
                            : q.correctAnswers === opt.id;

                          let style = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700';
                          if (attemptResult) {
                            if (isCorrect) {
                              style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                            } else if (isSelected && !isCorrect) {
                              style = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                            }
                          } else if (isSelected) {
                            style = 'bg-amber-50 border-amber-500 text-amber-900 font-semibold shadow-sm';
                          }

                          return (
                            <div
                              key={opt.id}
                              onClick={() => handleSingleSelect(qId, opt.id)}
                              className={`p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition flex items-center gap-3 ${style}`}
                            >
                              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {opt.id.replace('opt_', '').toUpperCase()}
                              </span>
                              <span>{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Format 2: MULTIPLE_CORRECT (Multi Choice) */}
                    {qType === 'MULTIPLE_CORRECT' && (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] text-slate-500 italic">Select all matching answers that apply:</p>
                        {q.options?.map((opt: any) => {
                          const isChecked = (currentAns.selectedOptions || []).includes(opt.id);
                          const isCorrect = (q.correctAnswers || []).includes(opt.id);

                          let style = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700';
                          if (attemptResult) {
                            if (isCorrect) {
                              style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                            } else if (isChecked && !isCorrect) {
                              style = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                            }
                          } else if (isChecked) {
                            style = 'bg-blue-50 border-blue-500 text-blue-900 font-semibold shadow-sm';
                          }

                          return (
                            <div
                              key={opt.id}
                              onClick={() => handleMultiSelectToggle(qId, opt.id)}
                              className={`p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition flex items-center gap-3 ${style}`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-blue-600 pointer-events-none"
                              />
                              <span>{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Format 3: TRUE_FALSE */}
                    {qType === 'TRUE_FALSE' && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {['True', 'False'].map((tfVal) => {
                          const isSelected = currentAns.selectedOption === tfVal;
                          const isCorrect = String(q.correctAnswers) === tfVal;

                          let style = 'bg-slate-50 border-slate-200 text-slate-700';
                          if (attemptResult) {
                            if (isCorrect) style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                            else if (isSelected) style = 'bg-rose-50 border-rose-300 text-rose-900';
                          } else if (isSelected) {
                            style = 'bg-amber-500 text-white font-bold border-amber-600 shadow';
                          }

                          return (
                            <button
                              key={tfVal}
                              type="button"
                              onClick={() => handleSingleSelect(qId, tfVal)}
                              className={`p-4 rounded-xl border text-sm font-bold transition flex items-center justify-center ${style}`}
                            >
                              {tfVal}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Format 4: NUMERICAL */}
                    {qType === 'NUMERICAL' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            step="any"
                            disabled={Boolean(attemptResult)}
                            value={currentAns.numericalAnswer ?? ''}
                            onChange={(e) => handleNumericalChange(qId, e.target.value)}
                            placeholder="Enter numerical answer"
                            className="w-48 text-sm p-3 rounded-xl border border-slate-300 font-mono focus:border-amber-500 focus:outline-none"
                          />
                          {q.unitLabel && (
                            <span className="font-mono text-sm text-slate-600 font-bold">{q.unitLabel}</span>
                          )}
                        </div>
                        {attemptResult && (
                          <div className="text-xs bg-slate-100 p-2.5 rounded-lg text-slate-700">
                            <strong>Accepted Answer:</strong> {q.numericalAnswer} {q.unitLabel} (±{q.tolerance || 0} tolerance)
                          </div>
                        )}
                      </div>
                    )}

                    {/* Format 5: FILL_BLANK & DESCRIPTIVE */}
                    {(qType === 'FILL_BLANK' || qType === 'DESCRIPTIVE' || qType === 'SHORT_CONCEPTUAL') && (
                      <div className="space-y-2 pt-2">
                        <textarea
                          rows={qType === 'DESCRIPTIVE' ? 4 : 2}
                          disabled={Boolean(attemptResult)}
                          value={currentAns.textAnswer || ''}
                          onChange={(e) => handleTextChange(qId, e.target.value)}
                          placeholder="Type your solution / response here…"
                          className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 font-mono focus:border-amber-500 focus:outline-none"
                        />
                        {attemptResult && q.correctAnswers && (
                          <div className="text-xs bg-slate-100 p-2.5 rounded-lg text-slate-700">
                            <strong>Reference Answer:</strong> {Array.isArray(q.correctAnswers) ? q.correctAnswers.join(', ') : q.correctAnswers}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Solution & Explanation */}
                    {attemptResult && q.explanation && (
                      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 mt-4">
                        <strong>💡 Curriculum Rationale & Notes:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer Navigation */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                disabled={currentQIndex <= 0}
                onClick={() => setCurrentQIndex(currentQIndex - 1)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <div className="flex items-center gap-2">
                {currentQIndex < (activeQuiz.questions?.length || 0) - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex(currentQIndex + 1)}
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    Next Question <ChevronRight size={16} />
                  </button>
                ) : !attemptResult ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    {isSubmitting ? 'Submitting & Grading…' : 'Submit Examination'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (document.fullscreenElement) {
                        document.exitFullscreen().catch(() => {});
                      }
                      setActiveQuiz(null);
                    }}
                    className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold"
                  >
                    Done Reviewing
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
