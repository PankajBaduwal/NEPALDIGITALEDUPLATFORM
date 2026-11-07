import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  FileText,
  Plus,
  Sparkles,
  Paperclip,
  CheckCircle2,
  Calendar,
  Clock,
  Download,
  Award,
  X,
  ExternalLink,
  Sliders,
  Check,
  AlertCircle,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import { AssignmentStudioModal } from './AssignmentStudioModal';

interface TeacherAssignmentManagerProps {
  allocations: any[];
  defaultSectionId?: string;
  defaultSubjectId?: string;
}

export const TeacherAssignmentManager: React.FC<TeacherAssignmentManagerProps> = ({
  allocations,
  defaultSectionId,
  defaultSubjectId,
}) => {
  const safeAllocations = Array.isArray(allocations) ? allocations : [];

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>(defaultSectionId || '');
  const [selectedSubject, setSelectedSubject] = useState<string>(defaultSubjectId || '');

  // Studio Modals
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioAssignmentId, setStudioAssignmentId] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [submissionsAssignment, setSubmissionsAssignment] = useState<any>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [evaluationMode, setEvaluationMode] = useState<'AUTO' | 'RUBRICS' | 'MANUAL'>('AUTO');
  const [autoCheckingLoading, setAutoCheckingLoading] = useState(false);
  const [autoCheckResult, setAutoCheckResult] = useState<any>(null);
  const [rubricScores, setRubricScores] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medium, setMedium] = useState<'ENGLISH' | 'NEPALI' | 'BOTH'>('BOTH');
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [topic, setTopic] = useState('');
  const [maxScore, setMaxScore] = useState<number>(20);
  const [dueDate, setDueDate] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [formAllocIndex, setFormAllocIndex] = useState(0);

  // AI Modal State
  const [aiObjective, setAiObjective] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [aiType, setAiType] = useState<'problem_set' | 'case_study' | 'essay' | 'numerical' | 'lab_report'>('problem_set');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDraft, setAiDraft] = useState<any>(null);

  useEffect(() => {
    loadAssignments();
  }, [selectedSection, selectedSubject]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      let url = '/assignments/teacher';
      const params = new URLSearchParams();
      if (selectedSection) params.append('sectionId', selectedSection);
      if (selectedSubject) params.append('centralSubjectId', selectedSubject);
      if (params.toString()) url += `?${params.toString()}`;

      const assignmentsData = await api.get<any>(url);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (e) {
      console.error('Failed to load assignments', e);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmissions = async (assignment: any) => {
    setSubmissionsAssignment(assignment);
    setSubmissionsLoading(true);
    try {
      const submissions = await api.get<any>(`/assignments/${assignment.id || assignment._id}/submissions`);
      setSubmissionsList(Array.isArray(submissions) ? submissions : []);
    } catch (err: any) {
      alert(err.message || 'Could not load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleDownloadFile = async (url: string, filename: string) => {
    try {
      await api.downloadBlob(url, filename);
    } catch (error: any) {
      alert(error.message || 'Download failed');
    }
  };

  const handleSaveAssignment = async (status: 'DRAFT' | 'ACTIVE' = 'ACTIVE') => {
    if (!title.trim() || !dueDate) {
      alert('Please provide a title and submission deadline.');
      return;
    }
    const alloc = safeAllocations[formAllocIndex] || safeAllocations[0];
    if (!alloc) {
      alert('Please select an allocated class & subject.');
      return;
    }

    const formData = new FormData();
    formData.append('classId', alloc.classId?.id || alloc.classId?._id || alloc.classId);
    formData.append('sectionId', alloc.sectionId?.id || alloc.sectionId?._id || alloc.sectionId);
    formData.append('centralSubjectId', alloc.centralSubjectId?.id || alloc.centralSubjectId?._id || alloc.centralSubjectId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('instructions', instructions);
    formData.append('medium', medium);
    formData.append('chapterNumber', String(chapterNumber));
    formData.append('topic', topic);
    formData.append('maxScore', String(maxScore));
    formData.append('dueDate', dueDate);
    formData.append('status', status);

    if (attachedFile) {
      formData.append('file', attachedFile);
    }

    try {
      await api.post('/assignments', formData);
      alert(status === 'ACTIVE' ? 'Assignment published successfully to students!' : 'Assignment saved as draft.');
      setIsCreateModalOpen(false);
      resetForm();
      loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Assignment could not be saved.');
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
      const res = await api.post<any>('/assignments/generate-ai', {
        centralSubjectId: alloc.centralSubjectId?.id || alloc.centralSubjectId?._id || alloc.centralSubjectId,
        chapterNumber,
        learningObjective: aiObjective,
        difficulty: aiDifficulty,
        assignmentType: aiType,
        medium,
      });

      setAiDraft(res);
    } catch (err: any) {
      alert(err.message || 'AI assignment generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAdoptAiDraft = () => {
    if (!aiDraft) return;
    setTitle(aiDraft.title);
    setDescription(aiDraft.description);
    setInstructions(aiDraft.instructions);
    setMaxScore(aiDraft.maxScore || 20);
    setIsAiModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const openGradingModal = (sub: any) => {
    setGradingSubmission(sub);
    setGradeMarks(sub.marksObtained ?? 0);
    setGradeFeedback(sub.feedback || '');
    setEvaluationMode('AUTO');
    setAutoCheckResult(null);

    const maxScore = submissionsAssignment?.maxScore || 20;
    const existingRubric = submissionsAssignment?.rubric && submissionsAssignment.rubric.length > 0
      ? submissionsAssignment.rubric
      : [
          { criteria: 'Core Knowledge & Understanding', maxScore: Math.round(maxScore * 0.4) || 8 },
          { criteria: 'Problem Solving & Accuracy', maxScore: Math.round(maxScore * 0.35) || 7 },
          { criteria: 'Methodology & Step Presentation', maxScore: Math.round(maxScore * 0.25) || 5 },
        ];

    if (Array.isArray(sub.rubricScores) && sub.rubricScores.length > 0) {
      setRubricScores(sub.rubricScores);
    } else {
      setRubricScores(
        existingRubric.map((r: any) => ({
          criteria: r.criteria || r.name || 'Criterion',
          maxScore: r.maxScore || r.points || 5,
          score: sub.marksObtained !== undefined
            ? Math.min(r.maxScore || 5, Math.round((sub.marksObtained / maxScore) * (r.maxScore || 5)))
            : Math.round((r.maxScore || 5) * 0.8),
        }))
      );
    }
  };

  const handleRunAutoCheck = async () => {
    if (!gradingSubmission) return;
    setAutoCheckingLoading(true);
    try {
      const res: any = await api.post(`/assignments/submissions/${gradingSubmission.id || gradingSubmission._id}/auto-check`);
      const data = res?.data || res;
      setAutoCheckResult(data);
      if (data.suggestedScore !== undefined) {
        setGradeMarks(data.suggestedScore);
      }
      if (data.aiFeedback) {
        setGradeFeedback(data.aiFeedback);
      }
      if (Array.isArray(data.rubricScores) && data.rubricScores.length > 0) {
        setRubricScores(data.rubricScores);
      }
    } catch (err: any) {
      alert(err.message || 'Auto-evaluation check failed');
    } finally {
      setAutoCheckingLoading(false);
    }
  };

  const handleGradeSubmit = async () => {
    if (!gradingSubmission) return;
    try {
      await api.patch(`/assignments/submissions/${gradingSubmission.id || gradingSubmission._id}/grade`, {
        marksObtained: gradeMarks,
        feedback: gradeFeedback,
        rubricScores: rubricScores,
      });
      alert('Evaluation saved and feedback returned to student successfully!');
      setGradingSubmission(null);
      handleOpenSubmissions(submissionsAssignment);
      loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to save evaluation');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setInstructions('');
    setChapterNumber(1);
    setTopic('');
    setMaxScore(20);
    setDueDate('');
    setAttachedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" size={22} />
            Assignment & Homework Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, ground with AI, collect digital submissions, and evaluate student work.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700"
          >
            <option value="">All Allocated Classes</option>
            {safeAllocations.map((a, i) => (
              <option key={i} value={a.sectionId?.id || a.sectionId?._id || a.sectionId}>
                Class {a.classId?.gradeNumber} - {a.sectionId?.name} ({a.centralSubjectId?.name})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setStudioAssignmentId(null);
              setIsStudioOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Sparkles size={15} /> 📋 Open Assignment Studio
          </button>
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">Loading assignments…</div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <FileText className="mx-auto text-slate-300 mb-3" size={40} />
          <h3 className="text-sm font-bold text-slate-700">No Assignments Created Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Create your first academic assignment or generate grounded homework directly from CDC curriculum chapters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((a) => (
            <div
              key={a.id || a._id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      a.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {a.status}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar size={12} /> Due: {new Date(a.dueDate).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{a.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description}</p>

                <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-slate-600">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100">
                    Grade {a.classId?.gradeNumber} ({a.sectionId?.name})
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                    {a.centralSubjectId?.name}
                  </span>
                  {a.chapterNumber && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                      Ch. {a.chapterNumber}
                    </span>
                  )}
                  {a.isAiGenerated && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 flex items-center gap-1">
                      <Sparkles size={10} /> AI Grounded
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Submissions: <strong>{a.totalSubmissions || 0}</strong>
                  </span>
                  <span>
                    Graded: <strong>{a.gradedCount || 0}</strong>
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleOpenSubmissions(a)}
                  className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Award size={13} /> Submissions & Grade
                </button>
                <button
                  onClick={() => {
                    setStudioAssignmentId(a.id || a._id);
                    setIsStudioOpen(true);
                  }}
                  className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  title="Open 8-step Assignment Studio"
                >
                  <FileText size={13} /> Studio
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE ASSIGNMENT MODAL ──────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                Create Academic Assignment
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 4: Thermodynamics Problem Set"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Objectives</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of learning outcomes and tasks…"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Instructions</label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Step-by-step submission guidelines…"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CDC Chapter</label>
                  <input
                    type="number"
                    min={1}
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={maxScore}
                    onChange={(e) => setMaxScore(parseInt(e.target.value, 10) || 20)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Submission Deadline</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Attach Reference Document */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attach Reference PDF / Worksheet (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg"
                  onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs p-2 border border-dashed border-slate-300 rounded-lg bg-slate-50"
                />
                {attachedFile && (
                  <p className="text-[11px] text-blue-600 mt-1 font-medium">
                    Attached: {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
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
                onClick={() => handleSaveAssignment('DRAFT')}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSaveAssignment('ACTIVE')}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
              >
                Publish Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI ASSIGNMENT GENERATOR MODAL ───────────────────────── */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-blue-200 flex flex-col my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-300" size={20} />
                <h3 className="font-bold text-base">Nepal Curriculum AI Assignment Generator</h3>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Allocated Class & Subject
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CDC Chapter Number</label>
                  <input
                    type="number"
                    min={1}
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Type</label>
                  <select
                    value={aiType}
                    onChange={(e) => setAiType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="problem_set">Structured Problem Set</option>
                    <option value="case_study">Case Study & Critical Inquiry</option>
                    <option value="essay">Analytical Essay / Explanation</option>
                    <option value="numerical">Numerical & Practical Derivations</option>
                    <option value="lab_report">Scientific Inquiry / Lab Report</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Learning Objective / Specific Competency (Optional)
                </label>
                <input
                  type="text"
                  value={aiObjective}
                  onChange={(e) => setAiObjective(e.target.value)}
                  placeholder="e.g. Master application of Ohm's Law in series & parallel circuits"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={aiLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <span>Drafting Assignment with CDC Grounding…</span>
                ) : (
                  <>
                    <Sparkles size={16} /> Draft Assignment with AI
                  </>
                )}
              </button>

              {aiDraft && (
                <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
                  <div className="text-xs text-blue-900 font-bold">
                    Draft: {aiDraft.title}
                  </div>
                  <p className="text-xs text-slate-600">{aiDraft.description}</p>
                  <div className="text-[11px] font-mono bg-white p-2.5 rounded border border-blue-100 whitespace-pre-wrap">
                    {aiDraft.instructions}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-blue-200">
                    <button
                      type="button"
                      onClick={handleAdoptAiDraft}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition"
                    >
                      Authorize & Edit Assignment Draft →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMISSIONS & GRADING CONSOLE MODAL ───────────────────── */}
      {submissionsAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800">
                  Submissions: {submissionsAssignment.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Maximum Score: {submissionsAssignment.maxScore} marks • Total Submissions: {submissionsList.length}
                </p>
              </div>
              <button
                onClick={() => setSubmissionsAssignment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {submissionsLoading ? (
                <div className="text-center py-12 text-sm text-slate-400">Loading student submissions…</div>
              ) : submissionsList.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-500">
                  No submissions received yet for this assignment.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="p-3">Student</th>
                        <th className="p-3">Roll</th>
                        <th className="p-3">Submitted At</th>
                        <th className="p-3">Work Attached</th>
                        <th className="p-3">Score</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {submissionsList.map((sub: any) => (
                        <tr key={sub.id || sub._id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-800">{sub.studentName}</td>
                          <td className="p-3 text-slate-500">{sub.rollNumber}</td>
                          <td className="p-3 text-slate-500">
                            {new Date(sub.submittedAt).toLocaleString()}
                          </td>
                          <td className="p-3">
                            {sub.fileUrl ? (
                              <button
                                type="button"
                                onClick={() => handleDownloadFile(sub.fileUrl, sub.originalFilename || 'Document.pdf')}
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                              >
                                <Download size={12} /> {sub.originalFilename || 'Document.pdf'}
                              </button>
                            ) : sub.content ? (
                              <span className="text-slate-600 font-mono line-clamp-1 truncate max-w-xs">
                                {sub.content}
                              </span>
                            ) : (
                              <span className="text-slate-400">No content</span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold">
                            {sub.marksObtained !== undefined && sub.marksObtained !== null ? (
                              <span className="text-emerald-700">
                                {sub.marksObtained} / {submissionsAssignment.maxScore}
                              </span>
                            ) : (
                              <span className="text-amber-600 font-normal">Pending Grade</span>
                            )}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => openGradingModal(sub)}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition"
                            >
                              {sub.status === 'GRADED' ? 'Edit Evaluation' : 'Grade Submission'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 3-MODE EVALUATION MODAL (AUTO, RUBRICS, MANUAL) ─────────────────────────── */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <Award size={18} className="text-blue-600" />
                  Evaluate Submission: {gradingSubmission.studentName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assignment: <span className="font-semibold text-slate-700">{submissionsAssignment?.title}</span> • Max Score: <span className="font-mono font-bold text-blue-600">{submissionsAssignment?.maxScore || 20}</span>
                </p>
              </div>
              <button onClick={() => setGradingSubmission(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-1">
              {/* Submission preview */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-500" /> Student Submitted Work:
                  </p>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {gradingSubmission.createdAt ? new Date(gradingSubmission.createdAt).toLocaleString() : 'Submitted'}
                  </span>
                </div>
                {gradingSubmission.content && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap font-mono text-xs max-h-36 overflow-y-auto shadow-inner">
                    {gradingSubmission.content}
                  </div>
                )}
                {gradingSubmission.fileUrl && (
                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(gradingSubmission.fileUrl, gradingSubmission.originalFilename || 'Submitted work')}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold transition text-xs"
                    >
                      <Download size={13} /> Open Attached Work Document ({gradingSubmission.originalFilename || 'Attachment'})
                    </button>
                  </div>
                )}
              </div>

              {/* 3 Evaluation Options / Mode Tabs */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => setEvaluationMode('AUTO')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    evaluationMode === 'AUTO'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles size={14} /> Auto-Checking (AI)
                </button>
                <button
                  type="button"
                  onClick={() => setEvaluationMode('RUBRICS')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    evaluationMode === 'RUBRICS'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Sliders size={14} /> By Rubrics
                </button>
                <button
                  type="button"
                  onClick={() => setEvaluationMode('MANUAL')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    evaluationMode === 'MANUAL'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText size={14} /> Manual Checking
                </button>
              </div>

              {/* MODE 1: AUTO-CHECKING (AI) */}
              {evaluationMode === 'AUTO' && (
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                        <Cpu size={14} className="text-purple-600" />
                        Automated AI Solution Assessment
                      </h4>
                      <p className="text-[11px] text-purple-700 mt-0.5">
                        Evaluates student's answers, steps, and document submissions against expected curriculum solutions and rubrics.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={autoCheckingLoading}
                      onClick={handleRunAutoCheck}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition"
                    >
                      <Sparkles size={13} />
                      {autoCheckingLoading ? 'Analyzing Work...' : '✨ Run AI Auto-Check'}
                    </button>
                  </div>

                  {autoCheckResult ? (
                    <div className="space-y-3 pt-2 border-t border-purple-200">
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-200">
                        <div>
                          <span className="text-[11px] text-slate-500 font-bold block">AI SUGGESTED SCORE:</span>
                          <span className="text-lg font-black font-mono text-purple-700">
                            {autoCheckResult.suggestedScore} / {submissionsAssignment?.maxScore || 20}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                          Confidence: {autoCheckResult.confidence || '94% High'}
                        </span>
                      </div>

                      {autoCheckResult.aiReasoning && (
                        <div className="bg-white p-3 rounded-lg border border-purple-200 text-xs text-slate-700">
                          <strong className="text-purple-900 block mb-1">AI Evaluation Analysis:</strong>
                          <p className="whitespace-pre-wrap">{autoCheckResult.aiReasoning}</p>
                        </div>
                      )}

                      {autoCheckResult.aiFeedback && (
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                          <strong className="text-emerald-900 block mb-1">Generated Student Guidance:</strong>
                          <p className="whitespace-pre-wrap">{autoCheckResult.aiFeedback}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-5 text-xs text-purple-600">
                      Click <strong>"Run AI Auto-Check"</strong> to automatically inspect answers, compute rubric marks, and generate personalized feedback.
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: BY RUBRICS */}
              {evaluationMode === 'RUBRICS' && (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                        <Sliders size={14} className="text-blue-600" />
                        Rubric-Based Criteria Evaluation
                      </h4>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        Grade by assigning marks across specific curriculum learning dimensions.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                      Total: {gradeMarks} / {submissionsAssignment?.maxScore || 20}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    {rubricScores.map((rubric, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-blue-200 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex-1 min-w-[200px]">
                          <span className="font-bold text-xs text-slate-800 block">{rubric.criteria}</span>
                          <span className="text-[10px] text-slate-500">Max Points: {rubric.maxScore}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {[1, 0.8, 0.6, 0.4].map((ratio) => {
                            const val = Math.round(rubric.maxScore * ratio * 10) / 10;
                            const isSelected = rubric.score === val;
                            return (
                              <button
                                key={ratio}
                                type="button"
                                onClick={() => {
                                  const updated = [...rubricScores];
                                  updated[idx] = { ...updated[idx], score: val };
                                  setRubricScores(updated);
                                  const total = updated.reduce((sum, r) => sum + (parseFloat(r.score) || 0), 0);
                                  setGradeMarks(Math.round(total * 10) / 10);
                                }}
                                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition ${
                                  isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {val} ({Math.round(ratio * 100)}%)
                              </button>
                            );
                          })}
                          <input
                            type="number"
                            min={0}
                            max={rubric.maxScore}
                            step={0.5}
                            value={rubric.score ?? 0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const updated = [...rubricScores];
                              updated[idx] = { ...updated[idx], score: Math.min(rubric.maxScore, val) };
                              setRubricScores(updated);
                              const total = updated.reduce((sum, r) => sum + (parseFloat(r.score) || 0), 0);
                              setGradeMarks(Math.round(total * 10) / 10);
                            }}
                            className="w-14 p-1 text-xs border border-slate-300 rounded font-mono font-bold text-center"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODE 3: MANUAL CHECKING */}
              {evaluationMode === 'MANUAL' && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                  <div>
                    <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                      <FileText size={14} className="text-emerald-600" />
                      Direct Manual Evaluation
                    </h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Assign custom scores and written teacher feedback directly.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Direct Score Awarded (Max: {submissionsAssignment?.maxScore || 20})
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={submissionsAssignment?.maxScore || 100}
                      step={0.5}
                      value={gradeMarks}
                      onChange={(e) => setGradeMarks(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Final Common Feedback & Score Summary */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Final Marks to Return to Student:
                  </label>
                  <span className="font-mono text-sm font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                    {gradeMarks} / {submissionsAssignment?.maxScore || 20}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teacher Feedback, Guidance & Review Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    placeholder="Provide actionable praise, corrections, or improvement guidelines for this student…"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGradeSubmit}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Check size={14} /> Save & Return Grade to Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8-Step Assignment Studio Modal */}
      {isStudioOpen && (
        <AssignmentStudioModal
          isOpen={isStudioOpen}
          onClose={() => {
            setIsStudioOpen(false);
            setStudioAssignmentId(null);
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
          existingAssignmentId={studioAssignmentId}
          onSaved={loadAssignments}
        />
      )}
    </div>
  );
};
