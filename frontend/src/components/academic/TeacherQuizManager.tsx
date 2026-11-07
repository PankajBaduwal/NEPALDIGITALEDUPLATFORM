import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  HelpCircle,
  Plus,
  Sparkles,
  BarChart2,
  Trash2,
  CheckCircle2,
  Clock,
  BookOpen,
  Send,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';
import { QuizStudioModal } from './QuizStudioModal';

interface TeacherQuizManagerProps {
  allocations: any[];
  defaultSectionId?: string;
  defaultSubjectId?: string;
}

export const TeacherQuizManager: React.FC<TeacherQuizManagerProps> = ({
  allocations,
  defaultSectionId,
  defaultSubjectId,
}) => {
  const safeAllocations = Array.isArray(allocations) ? allocations : [];

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>(defaultSectionId || '');
  const [selectedSubject, setSelectedSubject] = useState<string>(defaultSubjectId || '');

  // Studio Modal State
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioQuizId, setStudioQuizId] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [analyticsQuiz, setAnalyticsQuiz] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Form State
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizMedium, setQuizMedium] = useState<'ENGLISH' | 'NEPALI' | 'BOTH'>('BOTH');
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [topic, setTopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [difficultyLevel, setDifficultyLevel] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [formAllocIndex, setFormAllocIndex] = useState(0);

  // Question authoring
  const [questions, setQuestions] = useState<any[]>([
    {
      questionText: '',
      questionType: 'MCQ',
      options: [
        { id: 'opt_1', text: '' },
        { id: 'opt_2', text: '' },
        { id: 'opt_3', text: '' },
        { id: 'opt_4', text: '' },
      ],
      correctAnswers: 'opt_1',
      marks: 1,
      explanation: '',
    },
  ]);

  // AI Modal State
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [aiType, setAiType] = useState<'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER'>('MCQ');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState<any>(null);

  useEffect(() => {
    loadQuizzes();
  }, [selectedSection, selectedSubject]);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      let url = '/quizzes/teacher';
      const params = new URLSearchParams();
      if (selectedSection) params.append('sectionId', selectedSection);
      if (selectedSubject) params.append('centralSubjectId', selectedSubject);
      if (params.toString()) url += `?${params.toString()}`;

      const quizzesData = await api.get<any>(url);
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
    } catch (e) {
      console.error('Failed to load quizzes', e);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (quizId: string) => {
    if (!confirm('Publish this quiz? Enrolled students will immediately receive access.')) return;
    try {
      await api.patch(`/quizzes/${quizId}/publish`, {});
      alert('Quiz published successfully!');
      loadQuizzes();
    } catch (err: any) {
      alert(err.message || 'Failed to publish quiz');
    }
  };

  // Written answers waiting for the teacher's marks
  const [reviewQuiz, setReviewQuiz] = useState<any>(null);
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMarks, setReviewMarks] = useState<Record<string, string>>({});

  const handleOpenReview = async (quiz: any) => {
    setReviewQuiz(quiz);
    setReviewLoading(true);
    setReviewMarks({});
    try {
      const res = await api.get<any>(`/quizzes/${quiz.id || quiz._id}/review`);
      setReviewItems(res?.items || []);
    } catch (err: any) {
      alert(err.message || 'Could not load answers to review');
      setReviewQuiz(null);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSaveReview = async (item: any) => {
    const key = `${item.attemptId}:${item.questionId}`;
    const marks = Number(reviewMarks[key]);
    if (!Number.isFinite(marks) || marks < 0 || marks > item.maxMarks) {
      alert(`Enter marks between 0 and ${item.maxMarks}.`);
      return;
    }
    try {
      await api.post(`/quizzes/${reviewQuiz.id || reviewQuiz._id}/review`, { attemptId: item.attemptId, questionId: item.questionId, marks });
      setReviewItems((prev) => prev.filter((x) => !(x.attemptId === item.attemptId && x.questionId === item.questionId)));
    } catch (err: any) {
      alert(err.message || 'Could not save marks');
    }
  };

  const handleOpenAnalytics = async (quiz: any) => {
    setAnalyticsQuiz(quiz);
    setAnalyticsLoading(true);
    try {
      const analytics = await api.get<any>(`/quizzes/${quiz.id || quiz._id}/analytics`);
      setAnalyticsData(analytics);
    } catch (err: any) {
      alert(err.message || 'Could not load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Add question to manual creator
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        questionType: 'MCQ',
        options: [
          { id: 'opt_1', text: '' },
          { id: 'opt_2', text: '' },
          { id: 'opt_3', text: '' },
          { id: 'opt_4', text: '' },
        ],
        correctAnswers: 'opt_1',
        marks: 1,
        explanation: '',
      },
    ]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSaveQuiz = async (publishImmediate = false) => {
    if (!quizTitle.trim()) {
      alert('Please enter a quiz title.');
      return;
    }
    const alloc = safeAllocations[formAllocIndex] || safeAllocations[0];
    if (!alloc) {
      alert('Please select a class and subject allocation.');
      return;
    }

    const payload = {
      classId: alloc.classId?.id || alloc.classId?._id || alloc.classId,
      sectionId: alloc.sectionId?.id || alloc.sectionId?._id || alloc.sectionId,
      centralSubjectId: alloc.centralSubjectId?.id || alloc.centralSubjectId?._id || alloc.centralSubjectId,
      title: quizTitle,
      description: quizDescription,
      medium: quizMedium,
      chapterNumber,
      topic,
      durationMinutes,
      difficultyLevel,
      questions,
    };

    try {
      const created = await api.post<any>('/quizzes', payload);
      const createdId = created?.id || created?._id;
      if (publishImmediate && createdId) {
        await api.patch(`/quizzes/${createdId}/publish`, {});
      }
      alert(publishImmediate ? 'Quiz created and published to students successfully!' : 'Quiz saved as draft.');
      setIsCreateModalOpen(false);
      resetForm();
      loadQuizzes();
    } catch (err: any) {
      alert(err.message || 'Quiz could not be saved.');
    }
  };

  const handleGenerateAi = async () => {
    const alloc = safeAllocations[formAllocIndex] || safeAllocations[0];
    if (!alloc) {
      alert('Please select an allocated subject.');
      return;
    }

    setAiLoading(true);
    try {
      const preview = await api.post<any>('/quizzes/generate-ai', {
        classId: alloc.classId?.id || alloc.classId?._id || alloc.classId,
        centralSubjectId: alloc.centralSubjectId?.id || alloc.centralSubjectId?._id || alloc.centralSubjectId,
        chapterNumber,
        topic,
        questionCount: aiCount,
        difficulty: aiDifficulty,
        questionType: aiType,
        medium: quizMedium,
      });

      setAiPreview(preview);
    } catch (err: any) {
      alert(err.message || 'AI question generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAdoptAiQuestions = () => {
    if (!aiPreview || !aiPreview.questions) return;
    setQuestions(aiPreview.questions);
    setQuizTitle(`AI Quiz: ${aiPreview.chapterTitle || 'Chapter Review'}`);
    setQuizDescription(`Generated from ${aiPreview.groundingSource}`);
    setIsAiModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const resetForm = () => {
    setQuizTitle('');
    setQuizDescription('');
    setChapterNumber(1);
    setTopic('');
    setQuestions([
      {
        questionText: '',
        questionType: 'MCQ',
        options: [
          { id: 'opt_1', text: '' },
          { id: 'opt_2', text: '' },
          { id: 'opt_3', text: '' },
          { id: 'opt_4', text: '' },
        ],
        correctAnswers: 'opt_1',
        marks: 1,
        explanation: '',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="text-amber-600" size={22} />
            Quiz & Examination Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, generate with AI, evaluate, and analyze classroom quizzes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by class / subject */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700"
          >
            <option value="">All Allocated Classes</option>
            {safeAllocations.map((a, i) => (
              <option key={i} value={a.sectionId?.id || a.sectionId?._id || a.sectionId}>
                Class {a.classId?.gradeNumber || ''} - {a.sectionId?.name || 'Section'} (
                {a.centralSubjectId?.name || 'Subject'})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setStudioQuizId(null);
              setIsStudioOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <BookOpen size={15} /> 📖 Create New Assessment
          </button>
        </div>
      </div>

      {/* Quizzes Grid / List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">Loading academic quizzes…</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <HelpCircle className="mx-auto text-slate-300 mb-3" size={40} />
          <h3 className="text-sm font-bold text-slate-700">No Quizzes Created Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Click &quot;Create Quiz Manually&quot; or &quot;Generate with AI&quot; to author questions grounded in the Nepal CDC curriculum.
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
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      q.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {q.status}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {q.durationMinutes} mins • {q.totalMarks} marks
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{q.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {q.description || 'No description provided.'}
                </p>

                <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-slate-600">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100">
                    Grade {q.classId?.gradeNumber || '–'} ({q.sectionId?.name || 'Section'})
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                    {q.centralSubjectId?.name || 'Subject'}
                  </span>
                  {q.chapterNumber && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                      Ch. {q.chapterNumber}
                    </span>
                  )}
                  {q.isAiGenerated && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 flex items-center gap-1">
                      <Sparkles size={10} /> AI Grounded
                    </span>
                  )}
                </div>

                {q.status === 'PUBLISHED' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Attempts: <strong>{q.totalAttempts || 0}</strong>
                    </span>
                    <span>
                      Avg Score: <strong>{q.avgScore ? `${q.avgScore}/${q.totalMarks}` : '–'}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {q.status === 'DRAFT' ? (
                  <button
                    onClick={() => handlePublish(q.id || q._id)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Send size={12} /> Publish Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenAnalytics(q)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <BarChart2 size={13} /> View Analytics
                  </button>
                )}
                <button
                  onClick={() => handleOpenReview(q)}
                  className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition"
                  title="Mark written answers that could not be graded automatically"
                >
                  Review answers
                </button>
                <button
                  onClick={() => {
                    setStudioQuizId(q.id || q._id);
                    setIsStudioOpen(true);
                  }}
                  className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  title="Open 2-Tab Quiz Studio & Curriculum Authoring"
                >
                  <BookOpen size={13} /> Studio
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE QUIZ MODAL ────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <HelpCircle className="text-amber-600" size={20} />
                Create Academic Quiz
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Allocation Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Class & Subject Allocation
                </label>
                <select
                  value={formAllocIndex}
                  onChange={(e) => setFormAllocIndex(parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
                >
                  {safeAllocations.map((a, i) => (
                    <option key={i} value={i}>
                      Class {a.classId?.gradeNumber} Section {a.sectionId?.name} •{' '}
                      {a.centralSubjectId?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Medium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quiz Title</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Unit 3: Force and Motion Assessment"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medium</label>
                  <select
                    value={quizMedium}
                    onChange={(e) => setQuizMedium(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="BOTH">Bilingual (English + Nepali)</option>
                    <option value="ENGLISH">English Medium</option>
                    <option value="NEPALI">Nepali Medium</option>
                  </select>
                </div>
              </div>

              {/* Chapter, Topic, Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CDC Chapter Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Unit</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Newton's Laws"
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 15)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-slate-800">
                    Questions ({questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200"
                  >
                    <Plus size={14} /> Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Question {idx + 1}</span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(idx)}
                            className="text-slate-400 hover:text-rose-500"
                            title="Remove question"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => {
                          const n = [...questions];
                          n[idx].questionText = e.target.value;
                          setQuestions(n);
                        }}
                        placeholder="Enter question text…"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt: any, oIdx: number) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${idx}`}
                              checked={q.correctAnswers === opt.id}
                              onChange={() => {
                                const n = [...questions];
                                n[idx].correctAnswers = opt.id;
                                setQuestions(n);
                              }}
                              className="accent-amber-600"
                            />
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const n = [...questions];
                                n[idx].options[oIdx].text = e.target.value;
                                setQuestions(n);
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                              className="w-full text-xs p-1.5 rounded border border-slate-200 bg-white"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Marks:</span>
                        <input
                          type="number"
                          min={0.5}
                          max={10}
                          step={0.5}
                          value={q.marks || 1}
                          onChange={(e) => {
                            const n = [...questions];
                            n[idx].marks = parseFloat(e.target.value) || 1;
                            setQuestions(n);
                          }}
                          className="w-16 p-1 border rounded bg-white text-center"
                        />
                        <span className="text-slate-400">
                          (Select the radio button beside the correct answer)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveQuiz(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSaveQuiz(true)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI QUIZ GENERATOR WIZARD MODAL ───────────────────────── */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-purple-200 flex flex-col my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-300" size={20} />
                <h3 className="font-bold text-base">Nepal Curriculum AI Quiz Generator</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Subject & Class Allocation
                </label>
                <select
                  value={formAllocIndex}
                  onChange={(e) => setFormAllocIndex(parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50"
                >
                  {safeAllocations.map((a, i) => (
                    <option key={i} value={i}>
                      Class {a.classId?.gradeNumber} Section {a.sectionId?.name} •{' '}
                      {a.centralSubjectId?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CDC Textbook Chapter
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="EASY">Foundational / Easy</option>
                    <option value="MEDIUM">Standard / Medium</option>
                    <option value="HARD">Higher-Order / Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={aiCount}
                    onChange={(e) => setAiCount(parseInt(e.target.value, 10) || 5)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Question Format
                  </label>
                  <select
                    value={aiType}
                    onChange={(e) => setAiType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="SHORT_ANSWER">Short Answer Inquiry</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={aiLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <span>Synthesizing Questions from CDC Textbook…</span>
                ) : (
                  <>
                    <Sparkles size={16} /> Generate Questions from Nepal Curriculum
                  </>
                )}
              </button>

              {/* Preview of AI generated questions */}
              {aiPreview && (
                <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between text-xs text-purple-900 font-bold">
                    <span>Generated {aiPreview.questions?.length} Questions</span>
                    <span className="text-[11px] font-normal text-purple-700">
                      Source: {aiPreview.groundingSource}
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {aiPreview.questions?.map((q: any, i: number) => (
                      <div key={i} className="p-2.5 bg-white rounded-lg border border-purple-100 text-xs">
                        <p className="font-semibold text-slate-800">
                          {i + 1}. {q.questionText}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                          ✓ Correct: {q.options?.find((o: any) => o.id === q.correctAnswers)?.text || q.correctAnswers}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-purple-200">
                    <button
                      type="button"
                      onClick={handleAdoptAiQuestions}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-lg transition"
                    >
                      Review & Authorize Questions →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS MODAL ──────────────────────────────────────── */}
      {analyticsQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800">
                  Quiz Analytics: {analyticsQuiz.title}
                </h3>
                <p className="text-xs text-slate-500">Student performance & item analysis</p>
              </div>
              <button
                onClick={() => setAnalyticsQuiz(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {analyticsLoading ? (
                <div className="text-center py-12 text-sm text-slate-400">Loading performance data…</div>
              ) : !analyticsData ? (
                <div className="text-center py-12 text-sm text-slate-400">No submission records.</div>
              ) : (
                <>
                  {/* Summary metric cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <p className="text-[11px] text-slate-500 font-bold uppercase">Total Attempts</p>
                      <p className="text-xl font-bold text-slate-800 mt-1">
                        {analyticsData.summary?.totalAttempts || 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <p className="text-[11px] text-slate-500 font-bold uppercase">Average Score</p>
                      <p className="text-xl font-bold text-indigo-600 mt-1">
                        {analyticsData.summary?.avgScore || 0} / {analyticsQuiz.totalMarks}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <p className="text-[11px] text-slate-500 font-bold uppercase">Pass Rate</p>
                      <p className="text-xl font-bold text-emerald-600 mt-1">
                        {analyticsData.summary?.passPercentage || 0}%
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <p className="text-[11px] text-slate-500 font-bold uppercase">Passing Marks</p>
                      <p className="text-xl font-bold text-slate-700 mt-1">
                        {analyticsQuiz.passingMarks || 4}
                      </p>
                    </div>
                  </div>

                  {/* Question Success Breakdown */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">
                      Question Performance Breakdown
                    </h4>
                    <div className="space-y-2">
                      {analyticsData.questionStats?.map((qs: any) => (
                        <div
                          key={qs.questionIndex}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex-1 mr-4">
                            <span className="font-bold text-slate-700">Q{qs.questionIndex}:</span>{' '}
                            <span className="text-slate-600 line-clamp-1">{qs.questionText}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-500">
                              {qs.correctCount} correct
                            </span>
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                qs.successRate >= 70
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : qs.successRate >= 40
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {qs.successRate}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student Submissions Table */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">
                      Student Attempts
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 font-bold">Student</th>
                            <th className="p-2.5 font-bold">Roll</th>
                            <th className="p-2.5 font-bold">Score</th>
                            <th className="p-2.5 font-bold">Percentage</th>
                            <th className="p-2.5 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {analyticsData.studentAttempts?.map((sa: any) => (
                            <tr key={sa.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-medium text-slate-800">{sa.studentName}</td>
                              <td className="p-2.5 text-slate-500">{sa.rollNumber}</td>
                              <td className="p-2.5 font-mono font-bold text-slate-700">
                                {sa.score} / {sa.totalMarks}
                              </td>
                              <td className="p-2.5 font-mono">{sa.percentage}%</td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    sa.passed
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {sa.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz / Assessment Studio Modal */}
      {isStudioOpen && (
        <QuizStudioModal
          isOpen={isStudioOpen}
          onClose={() => {
            setIsStudioOpen(false);
            setStudioQuizId(null);
          }}
          allocation={(() => {
            const activeAlloc = safeAllocations.find(a =>
              (a.sectionId?.id || a.sectionId?._id || a.sectionId) === selectedSection
            ) || safeAllocations[0];
            return activeAlloc ? {
              subject: {
                id: activeAlloc.centralSubjectId?.id || activeAlloc.centralSubjectId?._id || activeAlloc.centralSubjectId,
                name: activeAlloc.centralSubjectId?.name || '',
                code: activeAlloc.centralSubjectId?.code || '',
              },
              section: {
                id: activeAlloc.sectionId?.id || activeAlloc.sectionId?._id || activeAlloc.sectionId,
                name: activeAlloc.sectionId?.name || '',
              },
              class: {
                id: activeAlloc.classId?.id || activeAlloc.classId?._id || activeAlloc.classId,
                gradeNumber: activeAlloc.classId?.gradeNumber,
                name: activeAlloc.classId?.name || '',
              },
            } : null;
          })()}
          existingQuizId={studioQuizId}
          onSaved={loadQuizzes}
        />
      )}

      {reviewQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800">Review written answers</h3>
                <p className="text-xs text-slate-500">{reviewQuiz.title}</p>
              </div>
              <button onClick={() => setReviewQuiz(null)} className="text-slate-500 text-sm font-bold">Close</button>
            </div>
            {reviewLoading && <p className="text-sm text-slate-500">Loading…</p>}
            {!reviewLoading && reviewItems.length === 0 && (
              <p className="text-sm text-slate-500">No written answers are waiting for review.</p>
            )}
            {reviewItems.map((item) => {
              const key = `${item.attemptId}:${item.questionId}`;
              return (
                <div key={key} className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="text-xs text-slate-500">{item.studentName} · attempt {item.attemptNumber}</div>
                  <div className="text-sm font-semibold text-slate-800">{item.questionText}</div>
                  {item.modelAnswer !== '' && (
                    <div className="text-xs text-slate-500">Expected: <span className="font-mono">{String(item.modelAnswer)}</span></div>
                  )}
                  <div className="text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap">{String(item.studentAnswer)}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={item.maxMarks}
                      step="0.5"
                      value={reviewMarks[key] ?? ''}
                      onChange={(e) => setReviewMarks((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`0 – ${item.maxMarks}`}
                      className="w-28 px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                    />
                    <span className="text-xs text-slate-500">out of {item.maxMarks}</span>
                    <button onClick={() => handleSaveReview(item)} className="ml-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold">
                      Save marks
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
