import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Sparkles,
  ShieldCheck,
  BookOpen,
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  X,
  Layers,
  Award,
  Hash,
  Sliders,
} from 'lucide-react';

interface CurriculumUnit {
  unitNumber: number;
  title: string;
  description?: string;
}

interface AIAssignmentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectCode: string;
  subjectName: string;
  centralSubjectId: string;
  classId?: string;
  gradeNumber?: number | string;
  onGenerated: (assignmentData: any) => void;
}

export const AIAssignmentGeneratorModal: React.FC<AIAssignmentGeneratorModalProps> = ({
  isOpen,
  onClose,
  subjectCode,
  subjectName,
  centralSubjectId,
  classId,
  gradeNumber = '10',
  onGenerated,
}) => {
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [assignmentType, setAssignmentType] = useState<string>('Theoretical & Analytical Problem Set');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'MIXED'>('MEDIUM');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [customQuestionCount, setCustomQuestionCount] = useState<string>('');

  const [selectedBlooms, setSelectedBlooms] = useState<string[]>(['Apply', 'Analyze']);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['LONG_ANSWER', 'NUMERICAL']);
  const [customFocus, setCustomFocus] = useState<string>('');
  const [groundingNotes, setGroundingNotes] = useState<string>('');
  const [attachedNoteName, setAttachedNoteName] = useState<string>('');

  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && centralSubjectId) {
      loadCurriculumUnits();
    }
  }, [isOpen, centralSubjectId]);

  const loadCurriculumUnits = async () => {
    setLoadingUnits(true);
    setErrorMsg(null);
    try {
      let mappedUnits: CurriculumUnit[] = [];
      try {
        const chapRes: any = await api.get<any>(`/curriculum/subjects/${centralSubjectId}/chapters`);
        const chaptersList = chapRes?.data || (Array.isArray(chapRes) ? chapRes : []);
        if (Array.isArray(chaptersList) && chaptersList.length > 0) {
          mappedUnits = chaptersList.map((c: any) => ({
            unitNumber: Number(c.unitNumber || c.chapterNumber),
            title: c.title || c.name || `Unit ${c.chapterNumber}`,
            description: c.titleNepali || c.description || c.summary || 'Approved Nepal CDC Unit',
          }));
        }
      } catch (err) {
        console.warn('Subject chapters endpoint fallback:', err);
      }

      if (mappedUnits.length === 0) {
        const res = await api.get<any>(`/curriculum/textbooks?subjectId=${centralSubjectId}`);
        const textbooks = res?.textbooks || (Array.isArray(res) ? res : []);
        if (textbooks.length > 0 && textbooks[0].chapters && textbooks[0].chapters.length > 0) {
          mappedUnits = textbooks[0].chapters.map((c: any) => ({
            unitNumber: c.chapterNumber,
            title: c.name || `Chapter ${c.chapterNumber}`,
            description: c.summary || c.nameNepali || 'Curriculum approved topic & competencies',
          }));
        }
      }

      if (mappedUnits.length > 0) {
        setUnits(mappedUnits);
        setSelectedUnits(mappedUnits.map(u => u.unitNumber));
      } else {
        const fallbackUnits: CurriculumUnit[] = [
          { unitNumber: 1, title: 'Unit 1: Core Fundamentals & Principles', description: 'Curriculum theory and conceptual applications' },
          { unitNumber: 2, title: 'Unit 2: Applied Analysis & Exercises', description: 'Practical problems and competency assessments' },
          { unitNumber: 3, title: 'Unit 3: Advanced Problems & Evaluation', description: 'Synthesis, case questions, and advanced inquiries' }
        ];
        setUnits(fallbackUnits);
        setSelectedUnits([1, 2]);
      }
    } catch (error: any) {
      setUnits([]);
      setSelectedUnits([]);
      setErrorMsg(error.message || 'Failed to load curriculum chapters.');
    } finally {
      setLoadingUnits(false);
    }
  };

  const toggleUnit = (unitNumber: number) => {
    if (selectedUnits.includes(unitNumber)) {
      if (selectedUnits.length === 1) return; // Keep at least one unit selected
      setSelectedUnits(selectedUnits.filter(u => u !== unitNumber));
    } else {
      setSelectedUnits([...selectedUnits, unitNumber]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUnits.length === units.length) {
      setSelectedUnits([units[0]?.unitNumber || 1]);
    } else {
      setSelectedUnits(units.map(u => u.unitNumber));
    }
  };

  const toggleBloom = (level: string) => {
    if (selectedBlooms.includes(level)) {
      if (selectedBlooms.length === 1) return;
      setSelectedBlooms(selectedBlooms.filter(b => b !== level));
    } else {
      setSelectedBlooms([...selectedBlooms, level]);
    }
  };

  const toggleFormat = (fmt: string) => {
    if (selectedFormats.includes(fmt)) {
      if (selectedFormats.length === 1) return;
      setSelectedFormats(selectedFormats.filter(f => f !== fmt));
    } else {
      setSelectedFormats([...selectedFormats, fmt]);
    }
  };

  const handleNoteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedNoteName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text && typeof text === 'string') {
          const excerpt = text.slice(0, 10000);
          setGroundingNotes(prev => (prev ? `${prev}\n\n[Material: ${file.name}]:\n${excerpt}` : `[Material: ${file.name}]:\n${excerpt}`));
        } else {
          setGroundingNotes(prev => (prev ? `${prev}\n\n[Attached File]: ${file.name}` : `[Attached File]: ${file.name}`));
        }
      };
      reader.onerror = () => {
        setGroundingNotes(prev => (prev ? `${prev}\n\n[Attached File]: ${file.name}` : `[Attached File]: ${file.name}`));
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (selectedUnits.length === 0) {
      setErrorMsg('Please select at least one curriculum unit or chapter.');
      return;
    }

    setGenerating(true);
    setErrorMsg(null);

    try {
      const selectedUnitObjs = units.filter(u => selectedUnits.includes(u.unitNumber));
      const count = customQuestionCount ? parseInt(customQuestionCount, 10) || questionCount : questionCount;

      const payload = {
        centralSubjectId,
        classId,
        selectedUnits: selectedUnitObjs,
        difficulty,
        assignmentType,
        bloomsTaxonomy: selectedBlooms,
        questionCount: count,
        customFocus,
        groundingNotes,
      };

      const res = await api.post<any>('/assignments/generate-ai', payload);
      const generated = res?.data || res;

      if (!generated || !generated.title) {
        throw new Error('AI generator did not return valid structured assignment data.');
      }

      onGenerated({
        title: generated.title,
        chapterNumber: generated.chapterNumber || selectedUnits[0],
        unitTitle: generated.unitTitle || selectedUnitObjs[0]?.title || '',
        description: generated.description,
        detailedInstructions: generated.detailedInstructions,
        questions: generated.questions || [],
        maxScore: generated.maxScore || 20,
        rubric: generated.rubric || [],
        curriculumUnits: selectedUnitObjs,
        aiGenerationMetadata: {
          isAiGenerated: true,
          model: 'Gemini 2.5 Flash Curriculum Grounded',
          timestamp: new Date(),
          selectedUnits: selectedUnitObjs,
          hierarchyUsed: generated.hierarchyUsed || [
            '1. Teacher-Approved Source Notes',
            '2. CDC Subject Knowledge Base',
            '3. Approved Syllabus Units & Textbooks',
          ],
          teacherApproved: false,
        },
      });

      onClose();
    } catch (err: any) {
      console.error('AI Generation Failed:', err);
      setErrorMsg(err.message || 'Failed to generate curriculum grounded assignment.');
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(14, 62, 59, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #cfdcd8',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Dark Slate Top Header matching Screenshot 2 */}
        <div
          style={{
            background: '#effaf6',
            color: '#0b3f3d',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #2f4f4c',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#2f4f4c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} color="#38bdf8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', letterSpacing: '-0.01em' }}>
                  AI Curriculum Assessment Generator
                </h3>
                <span
                  style={{
                    background: '#0369a1',
                    color: '#e0f2fe',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '800',
                    letterSpacing: '0.05em',
                  }}
                >
                  ANTI-HALLUCINATION
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#8da19d', marginTop: '2px' }}>
                {subjectCode || 'CDC-SUB'} — {subjectName} (Grade / Class {gradeNumber})
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8da19d',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Institutional Anti-Hallucination Policy Card */}
          <div
            style={{
              background: '#effaf6',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#166534', marginBottom: '2px' }}>
                Institutional Anti-Hallucination Policy
              </div>
              <div style={{ fontSize: '12px', color: '#15803d', lineHeight: '1.5' }}>
                Questions are generated strictly using the hierarchy:{' '}
                <strong>1. Teacher-Approved Source Notes</strong> →{' '}
                <strong>2. Subject Knowledge Base</strong> →{' '}
                <strong>3. Approved Syllabus Units</strong>. Out-of-syllabus concepts are strictly rejected.
              </div>
            </div>
          </div>

          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* Section 1: Target Curriculum Units & Chapters */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#0e3e3b' }}>
                <BookOpen size={16} color="#117a6b" />
                <span>Target Curriculum Units & Chapters (Required)</span>
              </div>
              <button
                type="button"
                onClick={handleSelectAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#117a6b',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {selectedUnits.length === units.length ? 'Deselect All' : 'Select All Units'}
              </button>
            </div>

            {loadingUnits ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#5f736f', fontSize: '13px' }}>
                Loading verified CDC curriculum units...
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '12px',
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
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span
                          style={{
                            background: isSelected ? '#117a6b' : '#ebf5f1',
                            color: isSelected ? '#ffffff' : '#4b605b',
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          Unit {unit.unitNumber}
                        </span>
                        {isSelected && <Check size={16} color="#117a6b" strokeWidth={3} />}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#134744', marginBottom: '4px' }}>
                        {unit.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#5f736f', lineHeight: '1.4' }}>
                        {unit.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Parameters Grid (Difficulty, Count, Scope) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '14px' }}>
            {/* Target Difficulty */}
            <div style={{ background: '#f4faf8', padding: '14px', borderRadius: '10px', border: '1px solid #dcebe6' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4b605b', marginBottom: '6px' }}>
                Target Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cfdcd8',
                  fontSize: '13px',
                  background: '#ffffff',
                  fontWeight: '600',
                  color: '#134744',
                }}
              >
                <option value="EASY">Easy (Bloom L1–L2 Foundational)</option>
                <option value="MEDIUM">Medium (Bloom L3–L4 Standard Application)</option>
                <option value="HARD">Hard (Bloom L5–L6 Advanced Synthesis)</option>
                <option value="MIXED">Mixed (Balanced Distribution)</option>
              </select>
            </div>

            {/* Number of Questions / Problems */}
            <div style={{ background: '#f4faf8', padding: '14px', borderRadius: '10px', border: '1px solid #dcebe6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#4b605b' }}>
                  Number of Problems
                </label>
                <span style={{ background: '#117a6b', color: '#ffffff', fontSize: '11px', fontWeight: '800', padding: '1px 7px', borderRadius: '12px' }}>
                  {customQuestionCount || questionCount}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[3, 5, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setQuestionCount(num);
                      setCustomQuestionCount('');
                    }}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      borderRadius: '6px',
                      border: questionCount === num && !customQuestionCount ? '2px solid #117a6b' : '1px solid #cfdcd8',
                      background: questionCount === num && !customQuestionCount ? '#117a6b' : '#ffffff',
                      color: questionCount === num && !customQuestionCount ? '#ffffff' : '#2f4f4c',
                      fontWeight: '800',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {num}
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom"
                  value={customQuestionCount}
                  onChange={(e) => setCustomQuestionCount(e.target.value)}
                  style={{
                    width: '60px',
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: customQuestionCount ? '2px solid #117a6b' : '1px solid #cfdcd8',
                    fontSize: '12px',
                    textAlign: 'center',
                    fontWeight: '700',
                  }}
                />
              </div>
            </div>

            {/* Subject Scope Snapshot */}
            <div style={{ background: '#f4faf8', padding: '14px', borderRadius: '10px', border: '1px solid #dcebe6' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#4b605b', marginBottom: '4px' }}>
                Subject & Scope
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b' }}>
                {selectedUnits.length} Unit(s) Selected
              </div>
              <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '4px', lineHeight: '1.4' }}>
                Calibrated for Nepal curriculum framework standards.
              </div>
            </div>
          </div>

          {/* Section 3: Assignment Synthesis Type & Formats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                Assignment Type
              </label>
              <select
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cfdcd8',
                  fontSize: '13px',
                  background: '#ffffff',
                  fontWeight: '600',
                }}
              >
                <option value="Theoretical & Analytical Problem Set">Theoretical & Analytical Problem Set</option>
                <option value="Numerical & Engineering Calculation">Numerical & Engineering Calculation</option>
                <option value="Lab / Practical Report">Lab / Practical Report</option>
                <option value="Real-World Case Study">Real-World Case Study</option>
                <option value="Software & Algorithm Implementation">Software & Algorithm Implementation</option>
                <option value="Comprehensive Technical Essay">Comprehensive Technical Essay</option>
                <option value="Mixed Assignment">Mixed Comprehensive Assignment</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                Target Bloom's Taxonomy Levels
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map((lvl) => {
                  const active = selectedBlooms.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => toggleBloom(lvl)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: active ? '1px solid #117a6b' : '1px solid #dcebe6',
                        background: active ? '#e6f7f0' : '#ffffff',
                        color: active ? '#117a6b' : '#5f736f',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      {active ? '✓ ' : ''}{lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Attached Source Notes & Grounding Excerpts */}
          <div
            style={{
              border: '1px dashed #cfdcd8',
              borderRadius: '10px',
              padding: '14px 18px',
              background: '#f4faf8',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#134744', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} color="#2563eb" />
                  Attached Teacher Source Notes (Priority 1)
                </div>
                <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '2px' }}>
                  Attach lecture PDFs or class summaries to ground questions strictly in your notes.
                </div>
              </div>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                <UploadCloud size={14} /> Attach Note
                <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleNoteUpload} style={{ display: 'none' }} />
              </label>
            </div>
            {attachedNoteName && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#117a6b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} /> {attachedNoteName} attached for primary grounding.
              </div>
            )}
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b605b', marginBottom: '4px' }}>
                Grounding Material Content & Extracted Notes
              </label>
              <textarea
                rows={3}
                placeholder="Or paste custom teacher notes, textbook excerpts, or problem statements here..."
                value={groundingNotes}
                onChange={(e) => setGroundingNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cfdcd8',
                  fontSize: '12px',
                  background: '#ffffff',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Section 5: Custom Focus & Key Topics */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
              Special Focus & Syllabus Context (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Focus on Newton's laws derivations, frictional force vectors, and practical problem solving..."
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cfdcd8',
                fontSize: '13px',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        {/* Modal Bottom Bar matching Screenshot 2 */}
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
          <button
            type="button"
            onClick={onClose}
            disabled={generating}
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
            onClick={handleGenerate}
            disabled={generating || selectedUnits.length === 0}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: generating ? '#8da19d' : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '13px',
              cursor: generating ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Sparkles size={16} />
            {generating
              ? 'Synthesizing Curriculum Grounded Assignment...'
              : `Generate ${customQuestionCount || questionCount} Questions with AI`}
          </button>
        </div>
      </div>
    </div>
  );
};
