import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  FileText,
  HelpCircle,
  Inbox,
  Scale,
  Shield,
  Bot,
  BarChart3,
  Rocket,
  Sparkles,
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  Sliders,
  Check,
  Award,
  ChevronRight,
  ChevronLeft,
  FileCheck,
  AlertTriangle,
  Download,
  BookOpen,
} from 'lucide-react';
import { AIAssignmentGeneratorModal } from './AIAssignmentGeneratorModal';

interface AssignmentStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: any; // Contains subject, section, class
  existingAssignmentId?: string | null;
  onSaved?: () => void;
}

export const AssignmentStudioModal: React.FC<AssignmentStudioModalProps> = ({
  isOpen,
  onClose,
  allocation,
  existingAssignmentId,
  onSaved,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Subject & Academic context
  const subjectCode = allocation?.subject?.code || '';
  const subjectName = allocation?.subject?.name || '';
  const centralSubjectId = allocation?.subject?.id || allocation?.subject?._id || '';
  const sectionId = allocation?.section?.id || allocation?.section?._id || '';
  const classId = allocation?.class?.id || allocation?.class?._id || '';
  const gradeNumber = allocation?.class?.gradeNumber;

  // ── Step 1: Basic Information & Scope ──────────────────────────
  const [title, setTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [unitTitle, setUnitTitle] = useState('');
  const [description, setDescription] = useState('');
  const [detailedInstructions, setDetailedInstructions] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [lateSubmissionPolicy, setLateSubmissionPolicy] = useState<'ALLOW_WITH_PENALTY' | 'ALLOW_WITHOUT_PENALTY' | 'STRICTLY_REJECT'>('ALLOW_WITH_PENALTY');
  const [latePenaltyPercent, setLatePenaltyPercent] = useState<number>(10);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: number; url: string }>>([]);
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);

  // ── Step 2: Questions ──────────────────────────────────────────
  const [questions, setQuestions] = useState<any[]>([]);

  // ── Step 3: Submissions & Management ───────────────────────────
  const [submissionSettings, setSubmissionSettings] = useState({
    allowedPdf: true,
    allowedDocx: true,
    allowedImages: true,
    allowedText: true,
    maxFileSizeMB: 25,
    maxFiles: 5,
    allowResubmission: true,
    allowEditBeforeDeadline: true,
  });
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsFilter, setSubmissionsFilter] = useState<'ALL' | 'SUBMITTED' | 'LATE' | 'GRADED'>('ALL');

  // ── Step 4: Evaluation Rules ───────────────────────────────────
  const [evaluationRules, setEvaluationRules] = useState({
    partialMarking: true,
    stepWiseMarking: true,
    acceptedVariations: 'Standard engineering abbreviations and algebraic equivalent forms accepted.',
    unitsAndTolerances: 'Standard SI Units mandatory. Numerical tolerance: ±0.5% permitted.',
    negativeMarking: false,
    reEvaluationPolicy: 'One formal re-check permitted within 48 hours of grade release.',
  });

  // ── Step 5: Copy Detection ─────────────────────────────────────
  const [copyDetectionSettings, setCopyDetectionSettings] = useState({
    enabled: true,
    similarityThreshold: 25,
    checkStudentToStudent: true,
    flagHighSimilarity: true,
  });

  // ── Step 7: Marks & Rubric ─────────────────────────────────────
  const [rubric, setRubric] = useState<any[]>([
    {
      criterion: 'Conceptual & Theoretical Rigor',
      maxMarks: 8,
      levels: [
        { label: 'Exemplary', points: 8, description: 'Flawless demonstration of curriculum principles with no conceptual gaps.' },
        { label: 'Proficient', points: 6, description: 'Solid understanding with minor imprecisions in terminology.' },
        { label: 'Developing', points: 4, description: 'Basic familiarity; key theoretical aspects missing or vague.' },
        { label: 'Needs Improvement', points: 0, description: 'Incorrect or unsubstantiated concepts.' },
      ],
    },
    {
      criterion: 'Analytical Solution & Methodology',
      maxMarks: 8,
      levels: [
        { label: 'Exemplary', points: 8, description: 'Every derivation, formula, and step is clearly documented and mathematically valid.' },
        { label: 'Proficient', points: 6, description: 'Logical workflow with minor calculation or formatting slips.' },
        { label: 'Developing', points: 4, description: 'Steps omitted; conclusion reached without adequate justification.' },
        { label: 'Needs Improvement', points: 0, description: 'No coherent methodology shown.' },
      ],
    },
    {
      criterion: 'Presentation, Diagrams & SI Units',
      maxMarks: 4,
      levels: [
        { label: 'Exemplary', points: 4, description: 'Neat formatting, labeled diagrams, explicit SI units, and crisp conclusion.' },
        { label: 'Proficient', points: 3, description: 'Well-structured with legible handwriting or formatting.' },
        { label: 'Developing', points: 2, description: 'Untidy presentation or missing unit labels.' },
        { label: 'Needs Improvement', points: 0, description: 'Unreadable or severely disorganized submission.' },
      ],
    },
  ]);

  // AI Metadata
  const [aiMetadata, setAiMetadata] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setPendingAttachment(null);
      if (existingAssignmentId) {
        loadExistingAssignment(existingAssignmentId);
      } else {
        // Reset defaults
        setTitle('');
        setDescription('');
        setDetailedInstructions('');
        setDueDate('');
        setAttachedFiles([]);
        setPendingAttachment(null);
        setQuestions([]);
        setCurrentStep(1);
      }
    }
  }, [isOpen, existingAssignmentId]);

  const loadExistingAssignment = async (id: string) => {
    setQuestions([]);
    setAttachedFiles([]);
    try {
      const res = await api.get<any>(`/assignments/${id}`);
      const a = res?.data || res;
      if (a) {
        setTitle(a.title || '');
        setChapterNumber(a.chapterNumber || 1);
        setUnitTitle(a.unitTitle || '');
        setDescription(a.description || '');
        setDetailedInstructions(a.detailedInstructions || a.instructions || '');
        if (a.dueDate) {
          const d = new Date(a.dueDate);
          setDueDate(d.toISOString().slice(0, 16));
        }
        if (a.lateSubmissionPolicy) setLateSubmissionPolicy(a.lateSubmissionPolicy);
        if (a.latePenaltyPercent) setLatePenaltyPercent(a.latePenaltyPercent);
        if (a.attachedDocuments) setAttachedFiles(a.attachedDocuments);
        if (a.questions && a.questions.length > 0) setQuestions(a.questions);
        if (a.submissionSettings) setSubmissionSettings(prev => ({ ...prev, ...a.submissionSettings }));
        if (a.evaluationRules) setEvaluationRules(prev => ({ ...prev, ...a.evaluationRules }));
        if (a.copyDetectionSettings) setCopyDetectionSettings(prev => ({ ...prev, ...a.copyDetectionSettings }));
        if (a.rubric && a.rubric.length > 0) setRubric(a.rubric);
        loadSubmissions(id);
      }
    } catch (e) {
      console.error('Failed to load assignment', e);
    }
  };

  const loadSubmissions = async (assignmentId: string) => {
    setLoadingSubmissions(true);
    try {
      const res = await api.get<any>(`/assignments/${assignmentId}/submissions`);
      setSubmissionsList(res?.data || (Array.isArray(res) ? res : []));
    } catch (error) {
      console.error('Failed to load assignment submissions:', error);
      setSubmissionsList([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingAttachment(file);
    }
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    if (idx === attachedFiles.length) {
      setPendingAttachment(null);
      return;
    }
    setAttachedFiles(attachedFiles.filter((_, i) => i !== idx));
  };

  const handleAiGenerated = (gen: any) => {
    if (gen.title) setTitle(gen.title);
    if (gen.chapterNumber) setChapterNumber(gen.chapterNumber);
    if (gen.unitTitle) setUnitTitle(gen.unitTitle);
    if (gen.description) setDescription(gen.description);
    if (gen.detailedInstructions) setDetailedInstructions(gen.detailedInstructions);
    if (gen.questions && gen.questions.length > 0) setQuestions(gen.questions);
    if (gen.rubric && gen.rubric.length > 0) setRubric(gen.rubric);
    if (gen.aiGenerationMetadata) setAiMetadata(gen.aiGenerationMetadata);

    // Smoothly transition teacher directly to Step 2 (Questions)
    setCurrentStep(2);
  };

  // Questions Authoring
  const addQuestion = () => {
    const newQ = {
      id: `q_${Date.now()}`,
      questionStatement: 'New problem statement...',
      questionType: 'LONG_ANSWER',
      marks: 5,
      difficulty: 'MEDIUM',
      unit: chapterNumber,
      expectedAnswer: 'Expected solution and key points...',
      evaluationCriteria: 'Accuracy (50%), Steps (50%)',
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (idx: number, field: string, val: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: val };
    setQuestions(updated);
  };

  const deleteQuestion = (idx: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const duplicateQuestion = (idx: number) => {
    const q = { ...questions[idx], id: `q_${Date.now()}` };
    const updated = [...questions];
    updated.splice(idx + 1, 0, q);
    setQuestions(updated);
  };

  // Calculations
  const totalQuestionMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  const totalRubricMarks = rubric.reduce((sum, r) => sum + (Number(r.maxMarks) || 0), 0);

  const handleSaveOrPublish = async (status: 'DRAFT' | 'ACTIVE') => {
    if (!title.trim()) {
      setErrorMsg('Please specify an Assignment Title.');
      setCurrentStep(1);
      return;
    }
    if (!dueDate) {
      setErrorMsg('Please set a submission deadline.');
      setCurrentStep(1);
      return;
    }
    if (questions.length === 0) {
      setErrorMsg('Please author at least one question in Step 2.');
      setCurrentStep(2);
      return;
    }
    if (totalQuestionMarks <= 0) {
      setErrorMsg('Questions must have a positive total marks value.');
      setCurrentStep(2);
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload = {
      classId,
      sectionId,
      centralSubjectId,
      title,
      description,
      chapterNumber,
      unitTitle,
      detailedInstructions,
      instructions: detailedInstructions,
      dueDate: new Date(dueDate),
      lateSubmissionPolicy,
      latePenaltyPercent,
      attachments: attachedFiles.map((file) => file.url).filter(Boolean),
      attachedDocuments: attachedFiles,
      questions,
      maxScore: totalQuestionMarks,
      submissionSettings,
      evaluationRules,
      copyDetectionSettings,
      rubric,
      aiGenerationMetadata: aiMetadata,
      isAiGenerated: Boolean(aiMetadata),
      status,
    };

    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(
          key,
          value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : JSON.stringify(value)
        );
      });
      if (pendingAttachment) {
        formData.append('file', pendingAttachment);
      }

      if (existingAssignmentId) {
        await api.put(`/assignments/${existingAssignmentId}`, formData);
      } else {
        await api.post('/assignments', formData);
      }

      alert(
        status === 'ACTIVE'
          ? '🎉 Assignment Published Successfully! All students in this section can now view and submit deliverables.'
          : '💾 Assignment Draft Saved Successfully!'
      );

      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error('Failed to save assignment:', err);
      setErrorMsg(err.message || 'Failed to save assignment.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const stepsList = [
    { num: 1, label: '1. Basic Info', icon: FileText },
    { num: 2, label: '2. Questions', icon: HelpCircle },
    { num: 3, label: '3. Submissions', icon: Inbox },
    { num: 4, label: '4. Evaluation Rules', icon: Scale },
    { num: 5, label: '5. Copy Detection', icon: Shield },
    { num: 6, label: '6. Auto Checking', icon: Bot },
    { num: 7, label: '7. Marks & Rubric', icon: BarChart3 },
    { num: 8, label: '8. Review & Publish', icon: Rocket },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        background: 'rgba(14, 62, 59, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1240px',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          border: '1px solid #dcebe6',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header matching Screenshot 1 */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #dcebe6',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>📋</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0e3e3b' }}>
                  Assignment Studio
                </h2>
                <span
                  style={{
                    background: '#e6f7f0',
                    color: '#0f4c4a',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '800',
                    border: '1px solid #bfeede',
                    fontFamily: 'monospace',
                  }}
                >
                  {subjectCode}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#4b605b' }}>
                  ({subjectName})
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#5f736f' }}>
                Subject-aware assignment management with copy detection, OCR handwriting analysis & rubric-guided evaluation.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: '#f5f3ff',
                color: '#4c3fa8',
                border: '1px solid #ddd6fe',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={14} color="#6d5bd0" /> AI Assistant
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid #cfdcd8',
                color: '#5f736f',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 8-Step Navigation Bar matching Screenshot 1 */}
        <div
          style={{
            background: '#f4faf8',
            borderBottom: '1px solid #dcebe6',
            padding: '6px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {stepsList.map((st) => {
            const Icon = st.icon;
            const isActive = currentStep === st.num;
            const isCompleted = currentStep > st.num;

            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #0f4c4a' : '1px solid transparent',
                  background: isActive ? '#0f4c4a' : isCompleted ? '#dcebe6' : 'transparent',
                  color: isActive ? '#ffffff' : isCompleted ? '#134744' : '#5f736f',
                  fontSize: '12px',
                  fontWeight: isActive || isCompleted ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={13} color={isActive ? '#ffffff' : isCompleted ? '#0e3e3b' : '#5f736f'} />
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* ════════════ STEP 1: BASIC INFO & SCOPE ════════════ */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0e3e3b' }}>
                    1. Basic Information & Scope
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5f736f' }}>
                    Define assignment title, academic chapter, deliverables, and submission deadline.
                  </p>
                </div>
                <span style={{ background: '#e6f7f0', color: '#117a6b', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '12px', border: '1px solid #bfeede' }}>
                  Step 1 of 8
                </span>
              </div>

              {/* Title & Unit */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                    Assignment Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Assignment 03 – Partial Derivatives and Applications"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cfdcd8',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                    Chapter / Unit
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      value={chapterNumber}
                      onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
                      style={{
                        width: '70px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cfdcd8',
                        fontSize: '13px',
                        textAlign: 'center',
                        fontWeight: '700',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Unit Title (optional)"
                      value={unitTitle}
                      onChange={(e) => setUnitTitle(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cfdcd8',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Description & Objectives */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                  Description & Objectives
                </label>
                <input
                  type="text"
                  placeholder="e.g. In this assignment, students demonstrate understanding of multivariable calculus..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cfdcd8',
                    fontSize: '13px',
                  }}
                />
              </div>

              {/* Detailed Instructions & Deliverables */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                  Detailed Instructions & Deliverables
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail step-by-step problem statements, formatting instructions, or upload criteria..."
                  value={detailedInstructions}
                  onChange={(e) => setDetailedInstructions(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cfdcd8',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                />
              </div>

              {/* Due Date & Late Policy */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                    Submission Due Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cfdcd8',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                    Late Submission Policy
                  </label>
                  <select
                    value={lateSubmissionPolicy}
                    onChange={(e) => setLateSubmissionPolicy(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cfdcd8',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: '#ffffff',
                    }}
                  >
                    <option value="ALLOW_WITH_PENALTY">Allow With Penalty Deduction ({latePenaltyPercent}%)</option>
                    <option value="ALLOW_WITHOUT_PENALTY">Allow Without Penalty</option>
                    <option value="STRICTLY_REJECT">Strictly Reject After Deadline</option>
                  </select>
                </div>
              </div>

              {/* Attached Problem Sheets & Documents */}
              <div style={{ border: '1px dashed #cfdcd8', borderRadius: '10px', padding: '16px', background: '#f4faf8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#134744' }}>
                      Attached Problem Sheets & Documents
                    </span>
                    <span style={{ fontSize: '11px', color: '#5f736f', marginLeft: '8px' }}>
                      {attachedFiles.length + (pendingAttachment ? 1 : 0)} attached
                    </span>
                  </div>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: '#ffffff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <Paperclip size={14} /> Upload Sheet / Document
                    <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                {attachedFiles.length + (pendingAttachment ? 1 : 0) > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[...attachedFiles, ...(pendingAttachment ? [{ name: pendingAttachment.name, size: pendingAttachment.size, url: '' }] : [])].map((f, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#ffffff',
                          border: '1px solid #dcebe6',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      >
                        <FileText size={14} color="#117a6b" />
                        <span style={{ fontWeight: '600', color: '#0e3e3b' }}>{f.name}</span>
                        <span style={{ color: '#8da19d', fontSize: '11px' }}>({Math.round(f.size / 1024)} KB)</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0 2px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#8da19d', textAlign: 'center', padding: '10px 0' }}>
                    No problem sheets attached yet. Click above to attach PDFs, problem sets, or reference guidelines.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════ STEP 2: QUESTIONS ════════════ */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0e3e3b' }}>
                    2. Assignment Questions & Problems
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5f736f' }}>
                    Author problems manually or import curriculum-grounded problems from the AI Assistant.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: '#ebf5f1', color: '#2f4f4c', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px' }}>
                    {questions.length} Questions • {totalQuestionMarks} Total Marks
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: '#f5f3ff',
                      color: '#4c3fa8',
                      border: '1px solid #ddd6fe',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                  >
                    <Sparkles size={13} color="#6d5bd0" /> Load AI Problems
                  </button>
                  <button
                    type="button"
                    onClick={addQuestion}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: '#117a6b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> Add Problem
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    style={{
                      border: '1px solid #dcebe6',
                      borderRadius: '10px',
                      padding: '16px',
                      background: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#117a6b', color: '#ffffff', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                          Q{idx + 1}
                        </span>
                        <select
                          value={q.questionType}
                          onChange={(e) => updateQuestion(idx, 'questionType', e.target.value)}
                          style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cfdcd8',
                            background: '#f4faf8',
                          }}
                        >
                          <option value="LONG_ANSWER">Long-Answer Problem</option>
                          <option value="SHORT_ANSWER">Short-Answer</option>
                          <option value="NUMERICAL">Numerical / Calculation</option>
                          <option value="CASE_STUDY">Applied Case Study</option>
                          <option value="MCQ">Multiple Choice (Objective)</option>
                          <option value="PROGRAMMING">Algorithm / Code</option>
                        </select>
                        <select
                          value={q.difficulty || 'MEDIUM'}
                          onChange={(e) => updateQuestion(idx, 'difficulty', e.target.value)}
                          style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cfdcd8',
                            background: '#ffffff',
                          }}
                        >
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#4b605b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Marks:
                          <input
                            type="number"
                            value={q.marks || 5}
                            onChange={(e) => updateQuestion(idx, 'marks', parseInt(e.target.value, 10) || 1)}
                            style={{ width: '55px', padding: '4px 6px', textAlign: 'center', borderRadius: '4px', border: '1px solid #cfdcd8', fontWeight: '800' }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => duplicateQuestion(idx)}
                          title="Duplicate Question"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f736f' }}
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteQuestion(idx)}
                          title="Delete Question"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Question Statement */}
                    <textarea
                      rows={2}
                      placeholder="Enter the full question statement..."
                      value={q.questionStatement}
                      onChange={(e) => updateQuestion(idx, 'questionStatement', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cfdcd8',
                        fontSize: '13px',
                        marginBottom: '8px',
                      }}
                    />

                    {/* Expected Answer & Evaluation Guidance */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Expected answer, key equations, or numerical result..."
                        value={q.expectedAnswer || ''}
                        onChange={(e) => updateQuestion(idx, 'expectedAnswer', e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #dcebe6',
                          fontSize: '12px',
                          background: '#f4faf8',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Evaluation criteria (e.g. Steps 50%, Final 50%)..."
                        value={q.evaluationCriteria || ''}
                        onChange={(e) => updateQuestion(idx, 'evaluationCriteria', e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #dcebe6',
                          fontSize: '12px',
                          background: '#f4faf8',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════ STEP 3: SUBMISSIONS ════════════ */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0e3e3b' }}>
                  3. Student Submissions & Formats
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5f736f' }}>
                  Configure student upload restrictions and inspect real-time student submissions.
                </p>
              </div>

              {/* Format Controls */}
              <div style={{ background: '#f4faf8', padding: '16px', borderRadius: '10px', border: '1px solid #dcebe6', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#2f4f4c', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={submissionSettings.allowedPdf}
                    onChange={(e) => setSubmissionSettings({ ...submissionSettings, allowedPdf: e.target.checked })}
                  />
                  PDF Documents
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#2f4f4c', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={submissionSettings.allowedDocx}
                    onChange={(e) => setSubmissionSettings({ ...submissionSettings, allowedDocx: e.target.checked })}
                  />
                  DOC / DOCX
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#2f4f4c', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={submissionSettings.allowedImages}
                    onChange={(e) => setSubmissionSettings({ ...submissionSettings, allowedImages: e.target.checked })}
                  />
                  Images / Hand scans
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#2f4f4c', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={submissionSettings.allowedText}
                    onChange={(e) => setSubmissionSettings({ ...submissionSettings, allowedText: e.target.checked })}
                  />
                  Direct Online Typed Text
                </label>
              </div>

              {/* Submissions Table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b' }}>
                    Student Submission Registry ({submissionsList.length})
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['ALL', 'SUBMITTED', 'LATE', 'GRADED'] as const).map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSubmissionsFilter(tab)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: submissionsFilter === tab ? '1px solid #117a6b' : '1px solid #cfdcd8',
                          background: submissionsFilter === tab ? '#e6f7f0' : '#ffffff',
                          color: submissionsFilter === tab ? '#117a6b' : '#5f736f',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #dcebe6', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#5f736f', fontWeight: '700' }}>
                        <th style={{ padding: '10px 14px' }}>Student</th>
                        <th style={{ padding: '10px 14px' }}>Roll / ID</th>
                        <th style={{ padding: '10px 14px' }}>Status</th>
                        <th style={{ padding: '10px 14px' }}>Submitted Date</th>
                        <th style={{ padding: '10px 14px' }}>Deliverables</th>
                        <th style={{ padding: '10px 14px' }}>Evaluation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissionsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#8da19d' }}>
                            No submissions recorded yet. Once published, student deliveries will be tracked here in real-time.
                          </td>
                        </tr>
                      ) : (
                        submissionsList.map((sub) => (
                          <tr key={sub.id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                            <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0e3e3b' }}>
                              {sub.studentName}
                            </td>
                            <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>
                              {sub.rollNumber}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  background: sub.status === 'GRADED' ? '#e6f7f0' : sub.isLate ? '#ede9fe' : '#eff6ff',
                                  color: sub.status === 'GRADED' ? '#117a6b' : sub.isLate ? '#6d5bd0' : '#2563eb',
                                }}
                              >
                                {sub.status}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', color: '#5f736f' }}>
                              {new Date(sub.submittedAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {sub.fileUrl ? (
                                <button
                                  type="button"
                                  onClick={() => api.downloadBlob(sub.fileUrl, sub.originalFilename || 'Download File').catch((error) => alert(error.message || 'Download failed'))}
                                  style={{ color: '#2563eb', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                  {sub.originalFilename || 'Download File'}
                                </button>
                              ) : (
                                <span style={{ color: '#8da19d' }}>Typed Text</span>
                              )}
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: '800', color: sub.marksObtained !== undefined ? '#117a6b' : '#8da19d' }}>
                              {sub.marksObtained !== undefined ? `${sub.marksObtained} Marks` : 'Pending'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ STEP 4: EVALUATION RULES ════════════ */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0e3e3b' }}>
                  4. Evaluation Rules & Marking Criteria
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5f736f' }}>
                  Configure partial credit, step-wise marks, numerical tolerances, and accepted answer variations.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#f4faf8', padding: '16px', borderRadius: '10px', border: '1px solid #dcebe6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0e3e3b' }}>
                    Grading Methodologies
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2f4f4c', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={evaluationRules.partialMarking}
                      onChange={(e) => setEvaluationRules({ ...evaluationRules, partialMarking: e.target.checked })}
                    />
                    <strong>Partial Marking:</strong> Award partial credit for demonstrated understanding.
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2f4f4c', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={evaluationRules.stepWiseMarking}
                      onChange={(e) => setEvaluationRules({ ...evaluationRules, stepWiseMarking: e.target.checked })}
                    />
                    <strong>Step-Wise Marking:</strong> Allocate points to formula, substitution, and final result.
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2f4f4c', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={evaluationRules.negativeMarking}
                      onChange={(e) => setEvaluationRules({ ...evaluationRules, negativeMarking: e.target.checked })}
                    />
                    <strong>Negative Marking:</strong> Deduct marks for incorrect answers.
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                      Accepted Answer Variations
                    </label>
                    <textarea
                      rows={2}
                      value={evaluationRules.acceptedVariations}
                      onChange={(e) => setEvaluationRules({ ...evaluationRules, acceptedVariations: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                      Units & Numerical Tolerances
                    </label>
                    <textarea
                      rows={2}
                      value={evaluationRules.unitsAndTolerances}
                      onChange={(e) => setEvaluationRules({ ...evaluationRules, unitsAndTolerances: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ STEP 5: COPY DETECTION ════════════ */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0e3e3b' }}>
                  5. Copy & Plagiarism Detection
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5f736f' }}>
                  Detect inter-student copying, text similarity, and matching source sections.
                </p>
              </div>

              <div style={{ background: '#f4faf8', padding: '16px', borderRadius: '10px', border: '1px solid #dcebe6', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0e3e3b' }}>
                      Student-to-Student Similarity Checking
                    </div>
                    <div style={{ fontSize: '11px', color: '#5f736f' }}>
                      Automatically compares all student submissions against each other within this section.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={copyDetectionSettings.enabled}
                    onChange={(e) => setCopyDetectionSettings({ ...copyDetectionSettings, enabled: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#2f4f4c' }}>
                    <span>Similarity Alert Threshold</span>
                    <span style={{ color: '#117a6b' }}>{copyDetectionSettings.similarityThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={copyDetectionSettings.similarityThreshold}
                    onChange={(e) => setCopyDetectionSettings({ ...copyDetectionSettings, similarityThreshold: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: '#117a6b', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8da19d' }}>
                    <span>10% (Strict)</span>
                    <span>25% (Standard)</span>
                    <span>50% (Lenient)</span>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #dcebe6', borderRadius: '10px', padding: '16px', background: '#ffffff' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0e3e3b', marginBottom: '6px' }}>
                  Academic Integrity Notice
                </div>
                <div style={{ fontSize: '12px', color: '#5f736f', lineHeight: '1.5' }}>
                  Similarity percentage serves as an advisory indicator for teacher inspection. The platform never automatically penalizes students; matching passage evidence is surfaced for human teacher adjudication.
                </div>
              </div>
            </div>
          )}

          {/* ════════════ STEP 6: AUTOMATED REVIEW AVAILABILITY ════════════ */}
          {currentStep === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0e3e3b' }}>
                  6. Automated Review
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5f736f' }}>
                  Automated scoring and handwriting recognition are not available yet.
                </p>
              </div>

              <div style={{ border: '1px solid #ddd6fe', borderRadius: '10px', padding: '16px', background: '#f5f3ff', color: '#3b2f8f', fontSize: '13px', lineHeight: '1.5' }}>
                Review uploaded files and answers manually before recording marks. Student submissions and original files remain available in the submission workspace.
              </div>
            </div>
          )}

          {/* ════════════ STEP 7: MARKS & RUBRIC ════════════ */}
          {currentStep === 7 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0e3e3b' }}>
                    7. Marks Distribution & Evaluation Rubric
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5f736f' }}>
                    Define multidimensional evaluation criteria and performance level descriptors.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      background: totalRubricMarks === totalQuestionMarks ? '#e6f7f0' : '#fef2f2',
                      color: totalRubricMarks === totalQuestionMarks ? '#117a6b' : '#b91c1c',
                      fontSize: '12px',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    Rubric Total: {totalRubricMarks} / {totalQuestionMarks} Marks
                  </span>
                </div>
              </div>

              {/* Rubric Criteria Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {rubric.map((crit, cIdx) => (
                  <div
                    key={cIdx}
                    style={{
                      border: '1px solid #dcebe6',
                      borderRadius: '10px',
                      padding: '16px',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <input
                        type="text"
                        value={crit.criterion}
                        onChange={(e) => {
                          const updated = [...rubric];
                          updated[cIdx].criterion = e.target.value;
                          setRubric(updated);
                        }}
                        style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', border: 'none', borderBottom: '1px dashed #cfdcd8', padding: '2px 0', width: '60%' }}
                      />
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#4b605b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Max Points:
                        <input
                          type="number"
                          value={crit.maxMarks}
                          onChange={(e) => {
                            const updated = [...rubric];
                            updated[cIdx].maxMarks = parseInt(e.target.value, 10) || 0;
                            setRubric(updated);
                          }}
                          style={{ width: '50px', padding: '3px 6px', textAlign: 'center', fontWeight: '800', borderRadius: '4px', border: '1px solid #cfdcd8' }}
                        />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {crit.levels.map((lvl: any, lIdx: number) => (
                        <div key={lIdx} style={{ background: '#f4faf8', padding: '10px', borderRadius: '6px', border: '1px solid #dcebe6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#2f4f4c', marginBottom: '4px' }}>
                            <span>{lvl.label}</span>
                            <span style={{ color: '#117a6b' }}>{lvl.points} pts</span>
                          </div>
                          <textarea
                            rows={2}
                            value={lvl.description}
                            onChange={(e) => {
                              const updated = [...rubric];
                              updated[cIdx].levels[lIdx].description = e.target.value;
                              setRubric(updated);
                            }}
                            style={{ width: '100%', fontSize: '11px', border: '1px solid #cfdcd8', borderRadius: '4px', padding: '4px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════ STEP 8: REVIEW & PUBLISH ════════════ */}
          {currentStep === 8 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0e3e3b' }}>
                  8. Review & Publish Assignment
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5f736f' }}>
                  Verify configuration before publishing to enrolled students.
                </p>
              </div>

              {/* Summary Dashboard Card */}
              <div style={{ background: '#f4faf8', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', textTransform: 'uppercase' }}>
                    Assignment Specifications
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', marginTop: '4px' }}>
                    {title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4b605b', marginTop: '4px' }}>
                    Chapter / Unit {chapterNumber}: {unitTitle || 'Curriculum Chapter'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#117a6b', fontWeight: '700', marginTop: '6px' }}>
                    Due: {new Date(dueDate).toLocaleString()} ({lateSubmissionPolicy})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', textTransform: 'uppercase' }}>
                    Assessment Metrics
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0e3e3b', marginTop: '4px' }}>
                    {questions.length} Questions • {totalQuestionMarks} Total Marks
                  </div>
                  <div style={{ fontSize: '12px', color: '#4b605b', marginTop: '4px' }}>
                    Rubric Criteria: {rubric.length} dimensions ({totalRubricMarks} marks)
                  </div>
                  <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '6px' }}>
                    Copy Detection: {copyDetectionSettings.enabled ? `Active (${copyDetectionSettings.similarityThreshold}% alert)` : 'Disabled'} • Grading: Manual review
                  </div>
                </div>
              </div>

              {/* Questions Preview */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b', marginBottom: '8px' }}>
                  Questions Preview ({questions.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {questions.map((q, idx) => (
                    <div key={idx} style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid #dcebe6', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', color: '#117a6b' }}>Q{idx + 1}.</span>
                        <span style={{ color: '#134744' }}>{q.questionStatement}</span>
                      </div>
                      <span style={{ fontWeight: '800', color: '#4b605b', whiteSpace: 'nowrap' }}>
                        {q.marks} pts ({q.questionType})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Action Bar matching Screenshot 1 */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #dcebe6',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cfdcd8',
                  background: '#ffffff',
                  color: '#2f4f4c',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={16} /> Previous Step
              </button>
            )}

            {currentStep < 8 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(8, prev + 1))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #117a6b',
                  background: '#e6f7f0',
                  color: '#117a6b',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Next Step <ChevronRight size={16} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #cfdcd8',
                background: '#ffffff',
                color: '#4b605b',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSaveOrPublish('DRAFT')}
              disabled={saving}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #cfdcd8',
                background: '#f4faf8',
                color: '#134744',
                fontWeight: '700',
                fontSize: '13px',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSaveOrPublish('ACTIVE')}
              disabled={saving}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                background: saving ? '#8da19d' : '#117a6b',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '13px',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px -1px rgba(17, 122, 107, 0.25)',
              }}
            >
              <Rocket size={15} />
              {saving ? 'Publishing Assignment...' : 'Publish Assignment 🚀'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Assignment Generator Modal */}
      <AIAssignmentGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        subjectCode={subjectCode}
        subjectName={subjectName}
        centralSubjectId={centralSubjectId}
        classId={classId}
        gradeNumber={gradeNumber}
        onGenerated={handleAiGenerated}
      />
    </div>
  );
};
