import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  BookOpen,
  HelpCircle,
  Sparkles,
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  Sliders,
  Settings,
  ChevronRight,
  ChevronLeft,
  Paperclip,
  Eye,
  Shuffle,
  Award,
} from 'lucide-react';
import { AIQuizGeneratorModal } from './AIQuizGeneratorModal';

interface CurriculumUnit {
  unitNumber: number;
  title: string;
  description?: string;
}

interface QuizStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: any; // subject, class, section
  existingQuizId?: string | null;
  onSaved?: () => void;
}

export const QuizStudioModal: React.FC<QuizStudioModalProps> = ({
  isOpen,
  onClose,
  allocation,
  existingQuizId,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'QUESTIONS'>('SETTINGS');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Subject info
  const subjectCode = allocation?.subject?.code || '';
  const subjectName = allocation?.subject?.name || '';
  const centralSubjectId = allocation?.subject?.id || allocation?.subject?._id || '';
  const sectionId = allocation?.section?.id || allocation?.section?._id || '';
  const classId = allocation?.class?.id || allocation?.class?._id || '';
  const gradeNumber = allocation?.class?.gradeNumber;

  // ── Tab 1: Quiz Settings & Curriculum State ────────────────────
  const [quizTitle, setQuizTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'MIXED'>('MEDIUM');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [passingScorePercent, setPassingScorePercent] = useState<number>(50);

  // Security & Proctoring
  const [securitySettings, setSecuritySettings] = useState({
    enforceFullscreen: true,
    detectTabSwitch: true,
    autoSubmitOnViolations: true,
    blockCopyPaste: true,
    maxWarnings: 3,
    navigationRule: 'FREE' as 'FREE' | 'SEQUENTIAL',
    randomizeQuestions: false,
    randomizeOptions: false,
  });

  // Attempt & Result Settings
  const [attemptPolicy, setAttemptPolicy] = useState({
    maxAttempts: 1,
  });

  const [resultSettings, setResultSettings] = useState({
    showResultImmediately: true,
    showExplanations: true,
    allowReviewAnswers: true,
    showCorrectAfterClose: false,
    hideMarksUntilApproval: false,
  });

  const [negativeMarking, setNegativeMarking] = useState({
    enabled: false,
    penaltyPerWrong: 0.25,
  });

  const [sourceNotes, setSourceNotes] = useState<Array<{ title: string; fileUrl?: string }>>([]);

  // ── Tab 2: Questions Authoring State ───────────────────────────
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadCurriculumUnits();
      if (existingQuizId) {
        loadExistingQuiz(existingQuizId);
      } else {
        setQuizTitle('');
        setInstructions('');
        setActiveTab('SETTINGS');
      }
    }
  }, [isOpen, existingQuizId, centralSubjectId]);

  const loadCurriculumUnits = async () => {
    setErrorMsg(null);
    if (!centralSubjectId) {
      setUnits([]);
      setSelectedUnits([]);
      setErrorMsg('Select an allocated subject before loading curriculum chapters.');
      return;
    }

    try {
      const res = await api.get<any>(`/curriculum/textbooks?subjectId=${centralSubjectId}`);
      const textbooks = res?.textbooks || (Array.isArray(res) ? res : []);
      if (textbooks.length > 0 && textbooks[0].chapters && textbooks[0].chapters.length > 0) {
        const mapped = textbooks[0].chapters.map((c: any) => ({
          unitNumber: c.chapterNumber,
          title: c.name || `Chapter ${c.chapterNumber}`,
          description: c.summary || c.nameNepali || 'Approved CDC Curriculum Topic',
        }));
        setUnits(mapped);
        if (mapped.length > 0) setSelectedUnits([mapped[0].unitNumber]);
      } else {
        setUnits([]);
        setSelectedUnits([]);
        setErrorMsg('No curriculum chapters are available for this subject.');
      }
    } catch (error: any) {
      setUnits([]);
      setSelectedUnits([]);
      setErrorMsg(error.message || 'Failed to load curriculum chapters.');
    }
  };

  const loadExistingQuiz = async (id: string) => {
    try {
      const res = await api.get<any>(`/quizzes/${id}`);
      const q = res?.data || res;
      if (q) {
        setQuizTitle(q.title || '');
        setInstructions(q.instructions || '');
        if (q.difficultyLevel) setDifficulty(q.difficultyLevel);
        if (q.durationMinutes) setDurationMinutes(q.durationMinutes);
        if (q.passingScorePercent) setPassingScorePercent(q.passingScorePercent);
        if (q.curriculumUnits && q.curriculumUnits.length > 0) {
          setSelectedUnits(q.curriculumUnits.map((u: any) => u.unitNumber));
        }
        if (q.securitySettings) setSecuritySettings(prev => ({ ...prev, ...q.securitySettings }));
        if (q.attemptPolicy) setAttemptPolicy(prev => ({ ...prev, ...q.attemptPolicy }));
        if (q.resultSettings) setResultSettings(prev => ({ ...prev, ...q.resultSettings }));
        if (q.negativeMarking) setNegativeMarking(prev => ({ ...prev, ...q.negativeMarking }));
        if (q.questions && q.questions.length > 0) setQuestions(q.questions);
      }
    } catch (e) {
      console.error('Failed to load quiz', e);
    }
  };

  const toggleUnit = (uNum: number) => {
    if (selectedUnits.includes(uNum)) {
      if (selectedUnits.length === 1) return;
      setSelectedUnits(selectedUnits.filter(u => u !== uNum));
    } else {
      setSelectedUnits([...selectedUnits, uNum]);
    }
  };

  // Target Mode calculation
  const targetModeLabel =
    selectedUnits.length === 1
      ? `Chapter-wise quiz (Unit ${selectedUnits[0]})`
      : `Combined assessment (Units ${selectedUnits.join(', ')})`;

  // Question manipulation
  const addQuestion = () => {
    const newQ = {
      id: `q_${Date.now()}`,
      questionText: 'Enter question text...',
      questionType: 'MCQ',
      options: [
        { id: 'opt_1', text: 'Option 1' },
        { id: 'opt_2', text: 'Option 2' },
        { id: 'opt_3', text: 'Option 3' },
        { id: 'opt_4', text: 'Option 4' },
      ],
      correctAnswers: 'opt_1',
      marks: 1,
      explanation: 'Explanation for correct answer...',
      chapterNumber: selectedUnits[0] || 1,
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (idx: number, field: string, val: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: val };
    setQuestions(updated);
  };

  const updateOptionText = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].text = text;
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

  const handleAiQuestionsLoaded = (aiQuestions: any[]) => {
    if (aiQuestions && aiQuestions.length > 0) {
      setQuestions(aiQuestions);
      setActiveTab('QUESTIONS');
    }
  };

  const totalQuizMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  const passingMarks = Math.ceil((totalQuizMarks * passingScorePercent) / 100);

  const handleSaveOrPublish = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!quizTitle.trim()) {
      setErrorMsg('Please specify a Quiz Title in Settings.');
      setActiveTab('SETTINGS');
      return;
    }
    if (questions.length === 0) {
      setErrorMsg('Please author at least one question in Tab 2.');
      setActiveTab('QUESTIONS');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const selectedUnitObjs = units.filter(u => selectedUnits.includes(u.unitNumber));

    const payload = {
      classId,
      sectionId,
      centralSubjectId,
      title: quizTitle,
      instructions,
      description: instructions,
      curriculumUnits: selectedUnitObjs,
      targetMode: selectedUnits.length > 1 ? 'COMBINED' : 'CHAPTER_WISE',
      difficultyLevel: difficulty,
      durationMinutes,
      totalMarks: totalQuizMarks || 10,
      passingMarks,
      passingScorePercent,
      questions,
      securitySettings,
      attemptPolicy,
      resultSettings,
      negativeMarking,
      sourceNotes,
      status,
    };

    try {
      if (existingQuizId) {
        await api.put(`/quizzes/${existingQuizId}`, payload);
      } else {
        const created = await api.post<any>('/quizzes', payload);
        if (status === 'PUBLISHED') {
          const newId = created?.data?.id || created?.data?._id || created?.id || created?._id;
          if (newId) {
            await api.patch(`/quizzes/${newId}/publish`, {});
          }
        }
      }

      alert(
        status === 'PUBLISHED'
          ? '🎉 Quiz Published Successfully! Enrolled students can now launch and take this assessment.'
          : '💾 Assessment Draft Saved Successfully!'
      );

      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error('Failed to save assessment:', err);
      setErrorMsg(err.message || 'Failed to save assessment.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

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
          maxWidth: '1180px',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          border: '1px solid #dcebe6',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header matching Screenshot 3 */}
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
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#e6f7f0',
                color: '#117a6b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0e3e3b' }}>
                  Create New Assessment
                </h2>
                <span
                  style={{
                    background: '#ebf5f1',
                    color: '#4b605b',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {subjectCode} • Grade {gradeNumber}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#5f736f' }}>
                Configure curriculum units, question bank imports, and exam proctoring settings
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
                background: '#117a6b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={14} color="#38bdf8" /> AI Generator
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
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Two Main Tabs matching Screenshot 3 */}
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #dcebe6',
            padding: '0 24px',
            display: 'flex',
            gap: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('SETTINGS')}
            style={{
              padding: '12px 4px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'SETTINGS' ? '2px solid #117a6b' : '2px solid transparent',
              color: activeTab === 'SETTINGS' ? '#117a6b' : '#5f736f',
              fontWeight: activeTab === 'SETTINGS' ? '800' : '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sliders size={15} />
            1. Quiz Settings & Curriculum
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('QUESTIONS')}
            style={{
              padding: '12px 4px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'QUESTIONS' ? '2px solid #117a6b' : '2px solid transparent',
              color: activeTab === 'QUESTIONS' ? '#117a6b' : '#5f736f',
              fontWeight: activeTab === 'QUESTIONS' ? '800' : '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <HelpCircle size={15} />
            2. Questions & Authoring ({questions.length})
          </button>
        </div>

        {/* Scrollable Body */}
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

          {/* ════════════ TAB 1: SETTINGS & CURRICULUM ════════════ */}
          {activeTab === 'SETTINGS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* BASIC INFORMATION Section matching Screenshot 3 */}
              <div style={{ border: '1px solid #dcebe6', borderRadius: '12px', padding: '20px', background: '#ffffff' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0e3e3b', letterSpacing: '0.05em', marginBottom: '14px' }}>
                  BASIC INFORMATION
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                    Quiz Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 1 & 2 Midterm Assessment"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
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
                    Instructions & Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide exam guidelines, permitted resources, or topics covered..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cfdcd8',
                      fontSize: '13px',
                      lineHeight: '1.5',
                    }}
                  />
                </div>
              </div>

              {/* CURRICULUM UNITS / CHAPTERS matching Screenshot 3 */}
              <div style={{ border: '1px solid #dcebe6', borderRadius: '12px', padding: '20px', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0e3e3b', letterSpacing: '0.05em' }}>
                    CURRICULUM UNITS / CHAPTERS
                  </div>
                  <div style={{ fontSize: '12px', color: '#5f736f' }}>
                    Select single unit or combined chapters (e.g. Ch 1 + Ch 2)
                  </div>
                </div>

                {/* Cards Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '14px',
                  }}
                >
                  {units.map((unit) => {
                    const isSelected = selectedUnits.includes(unit.unitNumber);
                    return (
                      <div
                        key={unit.unitNumber}
                        onClick={() => toggleUnit(unit.unitNumber)}
                        style={{
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #117a6b' : '1px solid #dcebe6',
                          background: isSelected ? '#effaf6' : '#ffffff',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: '75px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: isSelected ? '#117a6b' : '#4b605b' }}>
                            Unit {unit.unitNumber}
                          </span>
                          {isSelected && (
                            <div
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#e6f7f0',
                                border: '1.5px solid #117a6b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Check size={12} color="#117a6b" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#134744', marginTop: '6px' }}>
                          {unit.title}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Target Mode Banner matching Screenshot 3 */}
                <div
                  style={{
                    background: '#effaf6',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#166534',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <BookOpen size={15} color="#16a34a" />
                  <span>Target Mode: {targetModeLabel}</span>
                </div>
              </div>

              {/* Assessment Parameters & Security */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Rules & Duration */}
                <div style={{ border: '1px solid #dcebe6', borderRadius: '12px', padding: '18px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0e3e3b', letterSpacing: '0.05em' }}>
                    EXAM DURATION & RULES
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                      Assessment Duration
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[15, 30, 45, 60].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDurationMinutes(d)}
                          style={{
                            flex: 1,
                            padding: '7px 0',
                            borderRadius: '6px',
                            border: durationMinutes === d ? '2px solid #117a6b' : '1px solid #cfdcd8',
                            background: durationMinutes === d ? '#117a6b' : '#ffffff',
                            color: durationMinutes === d ? '#ffffff' : '#2f4f4c',
                            fontWeight: '800',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          {d}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '4px' }}>
                        Target Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '12px' }}
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                        <option value="MIXED">Mixed</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '4px' }}>
                        Passing Score (%)
                      </label>
                      <input
                        type="number"
                        value={passingScorePercent}
                        onChange={(e) => setPassingScorePercent(parseInt(e.target.value, 10) || 50)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '12px', fontWeight: '700' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: '#2f4f4c', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={negativeMarking.enabled}
                        onChange={(e) => setNegativeMarking({ ...negativeMarking, enabled: e.target.checked })}
                      />
                      Negative Marking (-0.25 pts per wrong answer)
                    </label>
                  </div>
                </div>

                {/* Exam Security & Proctoring Controls */}
                <div style={{ border: '1px solid #dcebe6', borderRadius: '12px', padding: '18px', background: '#f4faf8', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0e3e3b', letterSpacing: '0.05em' }}>
                    EXAM PROCTORING & SECURITY
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#2f4f4c', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={securitySettings.enforceFullscreen}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, enforceFullscreen: e.target.checked })}
                    />
                    <strong>Enforce Fullscreen:</strong> Require fullscreen mode during student attempt.
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#2f4f4c', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={securitySettings.detectTabSwitch}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, detectTabSwitch: e.target.checked })}
                    />
                    <strong>Tab-Switch Warning:</strong> Detect window focus loss and log violation warnings.
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#2f4f4c', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={securitySettings.autoSubmitOnViolations}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, autoSubmitOnViolations: e.target.checked })}
                    />
                    <strong>Auto-Submit on Violations:</strong> Auto-submit if warnings exceed {securitySettings.maxWarnings}.
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#2f4f4c', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={securitySettings.blockCopyPaste}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, blockCopyPaste: e.target.checked })}
                    />
                    <strong>Lock Clipboard:</strong> Disable copy, paste, and right-click during exam.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ TAB 2: QUESTIONS & AUTHORING ════════════ */}
          {activeTab === 'QUESTIONS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0e3e3b' }}>
                    Questions Authoring ({questions.length})
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5f736f' }}>
                    Total Marks: {totalQuizMarks} • Passing Marks: {passingMarks} ({passingScorePercent}%)
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(true)}
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
                    <Sparkles size={13} color="#38bdf8" /> AI Question Generator
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
                    <Plus size={14} /> Add Question
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
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
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
                          }}
                        >
                          <option value="MCQ">Multiple Choice (MCQ)</option>
                          <option value="MULTIPLE_CORRECT">Multiple Correct</option>
                          <option value="TRUE_FALSE">True / False</option>
                          <option value="FILL_BLANK">Fill in the Blank</option>
                          <option value="ASSERTION_REASON">Assertion & Reason</option>
                          <option value="NUMERICAL">Numerical Problem</option>
                          <option value="SHORT_CONCEPTUAL">Short Conceptual</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#4b605b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Marks:
                          <input
                            type="number"
                            value={q.marks || 1}
                            onChange={(e) => updateQuestion(idx, 'marks', parseInt(e.target.value, 10) || 1)}
                            style={{ width: '50px', padding: '3px 6px', textAlign: 'center', fontWeight: '800', borderRadius: '4px', border: '1px solid #cfdcd8' }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => duplicateQuestion(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f736f' }}
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteQuestion(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Question Statement..."
                      value={q.questionText}
                      onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '13px', marginBottom: '10px' }}
                    />

                    {/* Format Specific Input */}
                    {q.questionType === 'MCQ' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        {q.options?.map((opt: any, optIdx: number) => (
                          <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="radio"
                              name={`correct_${q.id || idx}`}
                              checked={q.correctAnswers === opt.id}
                              onChange={() => updateQuestion(idx, 'correctAnswers', opt.id)}
                            />
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => updateOptionText(idx, optIdx, e.target.value)}
                              placeholder={`Option ${optIdx + 1}`}
                              style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid #cfdcd8', fontSize: '12px' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {q.questionType === 'NUMERICAL' && (
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                        <input
                          type="number"
                          placeholder="Expected Number..."
                          value={q.numericalAnswer ?? q.correctAnswers}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateQuestion(idx, 'numericalAnswer', val);
                            updateQuestion(idx, 'correctAnswers', val);
                          }}
                          style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid #cfdcd8', fontSize: '12px', fontWeight: '700' }}
                        />
                        <input
                          type="number"
                          placeholder="Tolerance (±)..."
                          value={q.tolerance || 0}
                          onChange={(e) => updateQuestion(idx, 'tolerance', parseFloat(e.target.value) || 0)}
                          style={{ width: '120px', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cfdcd8', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          placeholder="Unit (e.g. m/s, kg)..."
                          value={q.unitLabel || ''}
                          onChange={(e) => updateQuestion(idx, 'unitLabel', e.target.value)}
                          style={{ width: '120px', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cfdcd8', fontSize: '12px' }}
                        />
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder="Answer explanation / solution step..."
                      value={q.explanation || ''}
                      onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #dcebe6', fontSize: '12px', background: '#f4faf8' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Action Bar matching Screenshot 3 */}
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
          <div>
            {activeTab === 'SETTINGS' ? (
              <button
                type="button"
                onClick={() => setActiveTab('QUESTIONS')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0f4c4a',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Proceed to Questions →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('SETTINGS')}
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
                ← Back to Settings
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
              onClick={() => handleSaveOrPublish('PUBLISHED')}
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
              Publish Assessment
            </button>
          </div>
        </div>
      </div>

      {/* AI Quiz Generator Modal */}
      <AIQuizGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        subjectCode={subjectCode}
        subjectName={subjectName}
        centralSubjectId={centralSubjectId}
        classId={classId}
        gradeNumber={gradeNumber}
        onGenerated={handleAiQuestionsLoaded}
      />
    </div>
  );
};
