import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface Question {
  id: string;
  questionNumber: number;
  type: string;
  prompt: string;
  promptNepali?: string;
  points: number;
  explanation: string;
  hint?: string;
  data: Record<string, any>;
}

interface Activity {
  id: string;
  title: string;
  titleNepali?: string;
  description: string;
  type: string;
  gradeLevels: number[];
  subjectCode?: string;
  totalMarks: number;
  passingScore: number;
  timeLimitMinutes: number;
  questions?: Question[];
}

interface AttemptResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  answers: {
    questionId: string;
    studentAnswer: any;
    isCorrect: boolean;
    scoreEarned: number;
    feedback?: string;
  }[];
}

interface InteractiveActivityPlayerProps {
  activity: Activity;
  classId?: string;
  sectionId?: string;
  assignmentId?: string;
  onClose: () => void;
  onCompleted?: (result: AttemptResult) => void;
}

export const InteractiveActivityPlayer: React.FC<InteractiveActivityPlayerProps> = ({
  activity,
  classId,
  sectionId,
  assignmentId,
  onClose,
  onCompleted,
}) => {
  const [questions, setQuestions] = useState<Question[]>(activity.questions || []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(!activity.questions || activity.questions.length === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Matching state helper
  const [matchingSelections, setMatchingSelections] = useState<Record<string, string>>({});
  // Drag & drop state helper
  const [dragAssignments, setDragAssignments] = useState<Record<string, string>>({});
  // Fill blanks state helper
  const [blankValues, setBlankValues] = useState<Record<string, string>>({});
  // Ordering state helper
  const [orderingList, setOrderingList] = useState<any[]>([]);

  // Fetch full activity if questions aren't preloaded
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('nepal_edu_token');
        const res = await fetch(`/api/v1/simulation-activity/activities/${activity.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.success && data.data.questions) {
          setQuestions(data.data.questions);
        }
      } catch (e) {
        console.error('Failed to load activity questions', e);
      } finally {
        setLoading(false);
      }
    };

    if (!activity.questions || activity.questions.length === 0) {
      fetchQuestions();
    }
  }, [activity.id, activity.questions]);

  // Timer
  useEffect(() => {
    if (result) return;
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const currentQ = questions[currentIdx];

  // Initialize ordering state when entering an ORDERING question
  useEffect(() => {
    if (currentQ && currentQ.type === 'ORDERING' && currentQ.data?.items) {
      if (orderingList.length === 0) {
        // Shuffle initially
        const shuffled = [...currentQ.data.items].sort(() => Math.random() - 0.5);
        setOrderingList(shuffled);
      }
    }
  }, [currentQ, orderingList.length]);

  const handleSelectOption = (optId: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optId,
    }));
  };

  const handleNumericalInput = (val: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [currentQ.id]: val,
    }));
  };

  const handleMatchSelect = (leftVal: string, rightVal: string) => {
    const nextMatches = { ...matchingSelections, [leftVal]: rightVal };
    setMatchingSelections(nextMatches);
    const pairsArray = Object.entries(nextMatches).map(([l, r]) => ({ left: l, right: r }));
    setStudentAnswers((prev) => ({ ...prev, [currentQ.id]: pairsArray }));
  };

  const handleDropItem = (itemId: string, categoryId: string) => {
    const next = { ...dragAssignments, [itemId]: categoryId };
    setDragAssignments(next);
    const dropArray = Object.entries(next).map(([it, cat]) => ({ itemId: it, droppedCategory: cat }));
    setStudentAnswers((prev) => ({ ...prev, [currentQ.id]: dropArray }));
  };

  const handleBlankChange = (blankId: string, val: string) => {
    const next = { ...blankValues, [blankId]: val };
    setBlankValues(next);
    setStudentAnswers((prev) => ({ ...prev, [currentQ.id]: next }));
  };

  const moveOrderingItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= orderingList.length) return;
    const next = [...orderingList];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setOrderingList(next);
    const ids = next.map((it) => it.id);
    setStudentAnswers((prev) => ({ ...prev, [currentQ.id]: ids }));
  };

  const handleSubmitAttempt = async () => {
    if (!classId || !sectionId) {
      alert('Your class and section could not be resolved. Please contact your school administrator.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('nepal_edu_token');
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        studentAnswer: studentAnswers[q.id] || null,
      }));

      const res = await fetch(`/api/v1/simulation-activity/activities/${activity.id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          classId,
          sectionId,
          assignmentId,
          answers: answersPayload,
          timeSpentSeconds: timeSpent,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
        if (onCompleted) {
          onCompleted(data.data);
        }
      } else {
        alert(data.error || 'Failed to submit attempt');
      }
    } catch (e: any) {
      alert('Error submitting answers: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetActivity = () => {
    setResult(null);
    setCurrentIdx(0);
    setStudentAnswers({});
    setMatchingSelections({});
    setDragAssignments({});
    setBlankValues({});
    setOrderingList([]);
    setTimeSpent(0);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/30 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-300 p-8 rounded-2xl flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-semibold text-slate-600">Loading Interactive Activity...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-slate-100/90 border-b border-slate-300 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-700 border border-amber-500/30 text-xs font-bold rounded-lg uppercase tracking-wider">
              {activity.type.replace('_', ' ')}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {activity.title}
                {activity.titleNepali && (
                  <span className="text-xs font-normal text-amber-700 hidden sm:inline">
                    ({activity.titleNepali})
                  </span>
                )}
              </h2>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Pass: {activity.passingScore} pts</span>
                <span>•</span>
                <span>Total Marks: {activity.totalMarks}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50/90 border border-slate-200 rounded-lg text-xs font-mono text-sky-700">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatSeconds(timeSpent)}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        {!result && questions.length > 0 && (
          <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {questions.map((q, idx) => {
                const isAnswered = studentAnswers[q.id] !== undefined;
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-300'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Question {currentIdx + 1} of {questions.length}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {result ? (
            /* Results Screen */
            <div className="max-w-2xl mx-auto py-6 space-y-6">
              <div
                className={`p-6 rounded-2xl border text-center relative overflow-hidden ${
                  result.passed
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : 'bg-rose-950/40 border-rose-500/40'
                }`}
              >
                <div className="inline-flex p-3 rounded-2xl bg-slate-100/70 mb-3">
                  <Award
                    className={`w-12 h-12 ${result.passed ? 'text-emerald-600' : 'text-rose-600'}`}
                  />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {result.passed ? '🎉 Congratulations! You Passed!' : '📖 Practice Makes Perfect!'}
                </h3>
                <div className="text-3xl font-extrabold mt-3 font-mono">
                  <span className={result.passed ? 'text-emerald-600' : 'text-rose-600'}>
                    {result.totalScore} / {result.maxScore}
                  </span>{' '}
                  <span className="text-lg font-normal text-slate-500">({result.percentage}%)</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Completed in {formatSeconds(result.timeSpentSeconds)}. All your answers have been
                  evaluated and stored in your academic progress ledger.
                </p>
              </div>

              {/* Question Breakdown */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Detailed Answer Review:
                </h4>
                {questions.map((q, idx) => {
                  const ev = result.answers.find((a) => a.questionId === q.id);
                  const isCorrect = ev?.isCorrect || false;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border ${
                        isCorrect
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          )}
                          <span className="font-bold text-slate-900 text-sm">
                            Q{idx + 1}: {q.prompt}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {ev?.scoreEarned || 0} / {q.points} pts
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-600 pl-7 space-y-1">
                        <div>
                          <strong>Your Answer:</strong>{' '}
                          <span className="font-mono">{JSON.stringify(ev?.studentAnswer)}</span>
                        </div>
                        <div className="text-slate-500 italic">
                          <strong>Feedback:</strong> {ev?.feedback}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={resetActivity}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl border border-slate-300 flex items-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : currentQ ? (
            /* Question Render State */
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Question Header */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="uppercase tracking-wider font-semibold text-sky-700">
                    Question {currentIdx + 1} • {currentQ.points} Points
                  </span>
                  {currentQ.hint && (
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-1 text-amber-700 hover:text-amber-900 font-semibold"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-relaxed">{currentQ.prompt}</h3>
                {currentQ.promptNepali && (
                  <p className="text-sm text-amber-700 mt-1">{currentQ.promptNepali}</p>
                )}

                {showHint && currentQ.hint && (
                  <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2 animate-in fade-in duration-150">
                    <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>{currentQ.hint}</span>
                  </div>
                )}
              </div>

              {/* Dynamic Interactive Input Component by Type */}
              <div className="space-y-3">
                {/* 1. MCQ & TRUE/FALSE */}
                {(currentQ.type === 'MCQ' || currentQ.type === 'TRUE_FALSE') && (
                  <div className="space-y-3">
                    {currentQ.data?.options?.map((opt: any) => {
                      const isSelected = studentAnswers[currentQ.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt.id)}
                          className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'bg-sky-50 border-sky-500 text-slate-900 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-sky-400 bg-sky-500 text-white'
                                  : 'border-slate-600 group-hover:border-slate-500'
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className="text-sm font-medium">{opt.text}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. MATCHING PAIRS */}
                {currentQ.type === 'MATCHING' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-500">
                      Select a matching pair for each item on the left:
                    </div>
                    {currentQ.data?.pairs?.map((pair: any) => (
                      <div
                        key={pair.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                      >
                        <span className="text-sm font-semibold text-slate-900">{pair.left}</span>
                        <select
                          value={matchingSelections[pair.left] || ''}
                          onChange={(e) => handleMatchSelect(pair.left, e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-sky-500 max-w-xs"
                        >
                          <option value="">-- Choose Match --</option>
                          {currentQ.data?.pairs?.map((p: any) => (
                            <option key={p.id} value={p.right}>
                              {p.right}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. DRAG & DROP CLASSIFICATION */}
                {currentQ.type === 'DRAG_DROP' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-500">
                      Assign each item below to its correct category:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentQ.data?.categories?.map((cat: any) => (
                        <div
                          key={cat.id}
                          className="bg-white border border-slate-200 rounded-xl p-4 min-h-[140px]"
                        >
                          <div className="text-xs font-bold text-sky-700 pb-2 border-b border-slate-200">
                            {cat.title}
                          </div>
                          <div className="mt-3 space-y-2">
                            {currentQ.data?.items
                              ?.filter((it: any) => dragAssignments[it.id] === cat.id)
                              .map((it: any) => (
                                <div
                                  key={it.id}
                                  className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 flex items-center justify-between"
                                >
                                  <span>{it.text}</span>
                                  <button
                                    onClick={() => handleDropItem(it.id, '')}
                                    className="text-slate-500 hover:text-rose-600"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-white/90 border border-slate-200 rounded-xl">
                      <div className="text-xs text-slate-500 mb-2 font-semibold">Available Items:</div>
                      <div className="flex flex-wrap gap-2">
                        {currentQ.data?.items
                          ?.filter((it: any) => !dragAssignments[it.id])
                          .map((it: any) => (
                            <div
                              key={it.id}
                              className="p-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2"
                            >
                              <span>{it.text}</span>
                              <div className="flex gap-1">
                                {currentQ.data?.categories?.map((c: any) => (
                                  <button
                                    key={c.id}
                                    onClick={() => handleDropItem(it.id, c.id)}
                                    className="px-2 py-0.5 bg-sky-600 hover:bg-sky-500 text-[10px] font-bold text-white rounded"
                                  >
                                    + {c.title.split(' ')[0]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. FILL IN THE BLANKS */}
                {currentQ.type === 'FILL_BLANKS' && (
                  <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4">
                    <div className="text-sm text-slate-700 leading-loose">
                      {currentQ.data?.template}
                    </div>
                    <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQ.data?.blanks?.map((b: any, bIdx: number) => (
                        <div key={b.id} className="flex items-center gap-2">
                          <span className="text-xs font-mono text-sky-700 font-bold">
                            [{b.id}]:
                          </span>
                          <input
                            type="text"
                            placeholder="Type answer here..."
                            value={blankValues[b.id] || ''}
                            onChange={(e) => handleBlankChange(b.id, e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. NUMERICAL QUESTION */}
                {currentQ.type === 'NUMERICAL' && (
                  <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3">
                    <label className="text-xs font-semibold text-slate-600">
                      Enter calculated numerical value:
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="any"
                        placeholder="0.0"
                        value={studentAnswers[currentQ.id] || ''}
                        onChange={(e) => handleNumericalInput(e.target.value)}
                        className="w-48 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-base font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                      />
                      {currentQ.data?.unit && (
                        <span className="text-sm font-bold text-slate-500 font-mono">
                          {currentQ.data.unit}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. ORDERING / SEQUENCE */}
                {currentQ.type === 'ORDERING' && (
                  <div className="space-y-3">
                    <div className="text-xs text-slate-500">
                      Use the up/down buttons to arrange these steps in correct sequence:
                    </div>
                    {orderingList.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-sky-700 font-mono text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-900">{item.text}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            disabled={idx === 0}
                            onClick={() => moveOrderingItem(idx, idx - 1)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-600 text-xs px-2"
                          >
                            ▲ Up
                          </button>
                          <button
                            disabled={idx === orderingList.length - 1}
                            onClick={() => moveOrderingItem(idx, idx + 1)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-600 text-xs px-2"
                          >
                            ▼ Down
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        {!result && (
          <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => prev - 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-600/30 transition-all"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={isSubmitting}
                onClick={handleSubmitAttempt}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                {isSubmitting ? 'Evaluating Answers...' : '🚀 Submit Activity'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
