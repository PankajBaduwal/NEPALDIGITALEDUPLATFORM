import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  FileCheck,
  HelpCircle,
  Lightbulb,
  Presentation,
  Send,
  Loader2,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Flame,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  PlusCircle,
  BookmarkCheck,
  Layers,
  GraduationCap,
  Scale,
  CheckSquare,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StructuredResponseRenderer } from './StructuredResponseRenderer';

export type TeacherScope =
  | 'CURRENT_PAGE'
  | 'CURRENT_CHAPTER'
  | 'ENTIRE_BOOK'
  | 'SELECTED_TEXT'
  | 'SUBJECT_MATERIALS';

export type TeacherTask =
  | 'SUMMARIZE_CHAPTER'
  | 'TEACH_CHAPTER'
  | 'EXPLAIN_PAGE'
  | 'EXPLAIN_SELECTION'
  | 'LESSON_PLAN'
  | 'EXAMPLES_ACTIVITIES'
  | 'QUESTION_BANK'
  | 'TEACHING_NOTES'
  | 'PRESENTATION'
  | 'QUICK_SIMPLIFY'
  | 'QUICK_ANALOGY'
  | 'QUICK_CHECK'
  | 'CUSTOM_QUESTION';

export interface Citation {
  textbookTitle: string;
  grade: number;
  chapterNumber: number;
  chapterTitle: string;
  pageNumber: number;
  pageEnd?: number;
  excerpt: string;
  relevanceScore: number;
  textbookId?: string;
}

export interface TeacherMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  content: string;
  citations?: Citation[];
  followUps?: string[];
  smartboardSummary?: string;
  task?: TeacherTask;
  scope?: TeacherScope;
  pageNumber?: number;
  createdAt?: string;
}

interface TeacherAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  textbookTitle: string;
  textbookId: string;
  currentPage: number;
  currentChapter?: { chapterNumber: number; title: string; startPage: number; endPage: number };
  pdfUrl?: string;
  gradeNumber?: number;
  onJumpToPage: (page: number) => void;
  onOpenSmartBoard?: (page: number) => void;
}

const AUTHORIZED_TEACHER_ROLES = [
  'TEACHER',
  'PRINCIPAL',
  'SCHOOL_ADMIN',
  'COLLEGE_ADMIN',
  'HOD',
  'SUPER_ADMIN',
];

/** Clean raw JSON or unescaped strings in case backend returns unparsed JSON */
function cleanContent(raw: string): string {
  if (!raw) return '';
  let str = raw.trim();

  // If content is wrapped in markdown json fence
  if (str.startsWith('```json') && str.endsWith('```')) {
    str = str.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  }

  // Check if string contains JSON-like object with "answer" key
  if (str.includes('"answer"')) {
    try {
      const parsed = JSON.parse(str);
      if (parsed && typeof parsed === 'object') {
        if (parsed.answer) return cleanContent(parsed.answer);
        if (parsed.content) return cleanContent(parsed.content);
      }
    } catch {
      // Regex extraction fallback
      const m = str.match(/"answer"\s*:\s*"([\s\S]*?)(?="\s*,\s*"(?:groundedness|sources|followUps|smartboardSummary)"|\s*"\s*\}|\s*\}$)/i);
      if (m && m[1]) {
        return cleanContent(
          m[1]
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
        );
      }
      const mStart = str.match(/"answer"\s*:\s*"?([\s\S]*)/i);
      if (mStart && mStart[1]) {
        let extracted = mStart[1];
        extracted = extracted
          .replace(/",\s*"(?:groundedness|sources|followUps|smartboardSummary)"[\s\S]*$/i, '')
          .replace(/"?\s*\}\s*$/i, '')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
        return cleanContent(extracted.trim());
      }
    }
  }

  // Remove redundant markdown code fences if wrapping full text
  if (str.startsWith('```markdown') && str.endsWith('```')) {
    str = str.replace(/^```markdown\s*/i, '').replace(/```\s*$/i, '');
  }

  return str;
}

/** Generate smart, curriculum-aware recommended questions for the active chapter */
function getChapterQuestions(
  textbook: string,
  chapterNum?: number,
  chapterTitle?: string,
  page?: number
): string[] {
  const tLower = (chapterTitle || '').toLowerCase();
  const bookLower = (textbook || '').toLowerCase();

  // 1. Physics: Rotational Dynamics
  if (tLower.includes('rotational') || tLower.includes('torque') || tLower.includes('inertia') || tLower.includes('gyration')) {
    return [
      `Explain Moment of Inertia and its physical significance with examples (Page ${page || 8})`,
      'Derive relation between Torque and Angular Acceleration (τ = Iα)',
      'Difference between Moment of Inertia and Radius of Gyration in 2 columns',
      'State and prove Theorem of Parallel Axes with classroom chalkboard diagram',
      'Calculate Rotational Kinetic Energy of a rolling solid cylinder vs sphere',
      '3-Minute classroom formative check on Conservation of Angular Momentum',
    ];
  }

  // 2. Physics: Recent Trends in Physics (Grade 12 Physics Ch. 25)
  if (tLower.includes('recent trend') || tLower.includes('nanotech') || tLower.includes('superconduct') || tLower.includes('seismology') || tLower.includes('medical physics')) {
    return [
      `Core concepts and modern classroom applications of Nanotechnology (Page ${page || 490})`,
      'Explain Superconductivity, critical temperature, and the Meissner Effect',
      'Working principle of Photovoltaic Solar Cells and renewable energy in Nepal',
      'Seismology: Difference between Primary (P) and Secondary (S) earthquake waves',
      'Medical Physics: Compare working principles of MRI, CT Scan, and Ultrasound',
      `40-Minute lesson plan for Chapter ${chapterNum || 25}: Recent Trends in Physics`,
    ];
  }

  // 3. Physics: Wave Motion, Sound & Optics
  if (tLower.includes('wave') || tLower.includes('optic') || tLower.includes('sound') || tLower.includes('doppler') || tLower.includes('interference') || tLower.includes('diffraction')) {
    return [
      `Derive Doppler effect formula when source moves towards stationary observer`,
      `Explain Young's Double Slit Experiment conditions for constructive & destructive interference (Page ${page || 1})`,
      'Difference between Interference and Diffraction in 2-column table',
      'Stationary waves in open vs closed organ pipes and harmonic frequencies',
      `Classroom demonstration and real-world Nepal analogy for ${chapterTitle || 'Wave Optics'}`,
      `5 High-yield Bloom's questions with model answers for Chapter ${chapterNum || 1}`,
    ];
  }

  // 4. Physics: Electricity, Magnetism & Electromagnetic Induction
  if (tLower.includes('electric') || tLower.includes('magnet') || tLower.includes('induction') || tLower.includes('potential') || tLower.includes('current') || tLower.includes('circuit')) {
    return [
      `State Kirchhoff's First & Second Laws with chalkboard circuit diagram (Page ${page || 1})`,
      'Derive expression for Magnetic Field at center of circular coil (Biot-Savart Law)',
      'Working principle and sensitivity of Moving Coil Galvanometer',
      'State Faraday\'s laws and Lenz\'s law of Electromagnetic Induction with examples',
      'Series LCR AC Circuit: Derive impedance, resonance frequency, and power factor',
      `40-Minute classroom lesson plan and student activities for ${chapterTitle || 'Electromagnetism'}`,
    ];
  }

  // 5. Physics: Modern Physics, Atoms & Nuclear
  if (tLower.includes('photoelectric') || tLower.includes('bohr') || tLower.includes('nuclear') || tLower.includes('radioactiv') || tLower.includes('semiconductor') || tLower.includes('diode')) {
    return [
      `Explain Einstein's Photoelectric Equation and stopping potential (Page ${page || 1})`,
      'Postulates of Bohr\'s Atomic Model and derivation of radius of hydrogen atom',
      'State Radioactive Decay Law and derive relation between Half-Life and Decay Constant',
      'Forward and Reverse Biased Characteristics of p-n Junction Diode with circuit diagram',
      'Full Wave Bridge Rectifier: Working principle and input/output waveforms',
      `Bloom's taxonomy question bank (Knowledge, Understanding, Numerical) for ${chapterTitle || 'Modern Physics'}`,
    ];
  }

  // 6. Physics: Mechanics, SHM & Fluid Dynamics
  if (tLower.includes('fluid') || tLower.includes('mechanic') || tLower.includes('shm') || tLower.includes('harmonic') || tLower.includes('bernoulli') || tLower.includes('surface tension')) {
    return [
      `State and prove Bernoulli's Theorem with fluid flow diagram (Page ${page || 1})`,
      'Derive expression for time period of Simple Harmonic Motion of simple pendulum',
      'Explain Surface Tension and derive excess pressure inside liquid drop and soap bubble',
      'Stokes\' Law and derivation of Terminal Velocity of a spherical ball in viscous fluid',
      `Real-world Nepal application (hydropower/bridges) for ${chapterTitle || 'Mechanics'}`,
      `Chalkboard summary notes and key formulas for Chapter ${chapterNum || 1}`,
    ];
  }

  // 7. Mathematics: Calculus (Derivatives, Integrals, Limits)
  if (tLower.includes('derivative') || tLower.includes('different') || tLower.includes('integr') || tLower.includes('calculus') || tLower.includes('limit')) {
    return [
      `Step-by-step worked solution for key problem on Page ${page || 1}`,
      'First Principle Derivative: Derive derivative of trigonometric function step-by-step',
      'Application of Derivatives: Finding Maxima and Minima with second derivative test',
      'Integration by Parts formula and model worked example',
      'Definite Integrals: Area enclosed between two curves with coordinate sketch',
      `Common student misconceptions and chalkboard board plan for ${chapterTitle || 'Calculus'}`,
    ];
  }

  // 8. Mathematics: Matrices, Vectors, Coordinate Geometry & Algebra
  if (tLower.includes('matrix') || tLower.includes('vector') || tLower.includes('determinant') || tLower.includes('geometry') || tLower.includes('conic') || tLower.includes('trigonometr') || bookLower.includes('math')) {
    return [
      `Step-by-step numerical solution for problem on Page ${page || 1}`,
      'Matrix Inversion Method vs Cramer\'s Rule for solving system of linear equations',
      'Vector Product (Cross Product) properties and physical applications',
      'Condition for perpendicular and parallel pair of straight lines through origin',
      'Standard equation and focal properties of Parabola / Ellipse with diagram',
      `5 Practice problems with marking scheme for Chapter ${chapterNum || 1}`,
    ];
  }

  // 9. Chemistry: Chemical Bonding, Periodic, States of Matter & Organic
  if (bookLower.includes('chem') || tLower.includes('reaction') || tLower.includes('bond') || tLower.includes('organic') || tLower.includes('acid') || tLower.includes('electrochem')) {
    return [
      `Core chemical principles and reaction mechanism on Page ${page || 1}`,
      'VSEPR Theory: Predict geometry and bond angles of covalent molecules with diagrams',
      'Le Chatelier\'s Principle: Effect of temperature, pressure, and concentration on equilibrium',
      'Electrochemical Cell vs Electrolytic Cell in a 2-column comparison table',
      'Organic Reaction Mechanism: SN1 vs SN2 nucleophilic substitution step-by-step',
      `40-Minute lesson plan with low-cost laboratory demonstration for ${chapterTitle || 'Chemistry'}`,
    ];
  }

  // 10. Biology: Cell, Genetics, Physiology & Ecology
  if (bookLower.includes('bio') || tLower.includes('cell') || tLower.includes('genetic') || tLower.includes('plant') || tLower.includes('animal') || tLower.includes('organism')) {
    return [
      `Core biological concept and anatomical diagram on Page ${page || 1}`,
      'Mitosis vs Meiosis cell division: Differences, stages, and chromosome numbers',
      'Mendel\'s Laws of Inheritance with monohybrid and dihybrid cross Punnett squares',
      'Light Reaction vs Dark Reaction (Calvin Cycle) in photosynthesis',
      'Classroom diagram: Human heart / kidney structure with chalkboard labeling guide',
      `Bloom's taxonomy question bank for ${chapterTitle || 'Biology'} with grading rubric`,
    ];
  }

  // 11. School Level Science (Grades 1–10)
  if (bookLower.includes('science') || tLower.includes('force') || tLower.includes('energy') || tLower.includes('light') || tLower.includes('living')) {
    return [
      `Explain core scientific concepts on Page ${page || 1} in simple student-friendly language`,
      `Difference between key terms in ${chapterTitle || 'this unit'} in 2 columns`,
      `Hands-on classroom activity using low-cost materials available in Nepal`,
      `40-Minute structured classroom lesson plan for Chapter ${chapterNum || 1}`,
      `Bloom's questions (Knowledge, Understanding, Application) with answer key`,
      `Relatable Nepal real-world analogy and daily life connection for Page ${page || 1}`,
    ];
  }

  // 12. Default / General Chapter Questions
  const chLabel = chapterTitle ? `"${chapterTitle}"` : `Chapter ${chapterNum || 1}`;
  return [
    `Explain core concepts and pedagogical breakdown of Page ${page || 1}`,
    `Difference between key concepts in ${chLabel} in a 2-column table`,
    `40-Minute structured classroom lesson plan for ${chLabel}`,
    `Bloom's taxonomy questions (Knowledge, Understanding, Application) with answers for ${chLabel}`,
    `Recommended chalkboard notes and diagrams for teaching ${chLabel}`,
    `Relatable Nepal cultural analogy and interactive student activity for Page ${page || 1}`,
  ];
}

export const TeacherAIPanel: React.FC<TeacherAIPanelProps> = ({
  isOpen,
  onClose,
  textbookTitle,
  textbookId,
  currentPage,
  currentChapter,
  pdfUrl,
  gradeNumber,
  onJumpToPage,
  onOpenSmartBoard,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputQuery, setInputQuery] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectedScope, setSelectedScope] = useState<TeacherScope>('CURRENT_PAGE');
  const [language, setLanguage] = useState<'auto' | 'ne' | 'en'>('auto');
  const [loading, setLoading] = useState(false);
  const [showToClassMode, setShowToClassMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'core' | 'activities' | 'delivery'>('core');

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isTeacher = Boolean(user && AUTHORIZED_TEACHER_ROLES.includes(user.role));

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Compute smart recommended chapter questions dynamically
  const recommendedQuestions = useMemo(() => {
    return getChapterQuestions(
      textbookTitle,
      currentChapter?.chapterNumber,
      currentChapter?.title,
      currentPage
    );
  }, [textbookTitle, currentChapter, currentPage]);

  // Keyboard shortcut: Esc to exit full-screen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Capture user selection from document if available
  useEffect(() => {
    const handleMouseUp = () => {
      const sel = window.getSelection()?.toString().trim();
      if (sel && sel.length > 5) {
        setSelectedText(sel);
      }
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  if (!isOpen) return null;

  if (!isTeacher) {
    return (
      <div className="fixed inset-y-0 right-0 z-[60] w-96 bg-[#f8fafc] border-l border-slate-200 text-slate-900 p-6 flex flex-col justify-center items-center shadow-2xl">
        <div className="p-4 rounded-full bg-rose-50 text-rose-700 mb-4 border border-rose-200">
          <EyeOff size={32} />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2 text-center">Teacher-Only Assistant</h3>
        <p className="text-xs text-slate-600 font-medium text-center leading-relaxed mb-6">
          The AI Teaching Assistant provides pedagogical guides, lesson plans, and curriculum solutions designed exclusively for authorized teachers and school administrators.
        </p>
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl text-white transition shadow-sm"
        >
          Close Assistant
        </button>
      </div>
    );
  }

  const handleAsk = async (task: TeacherTask = 'CUSTOM_QUESTION', customQuery?: string) => {
    const query = customQuery !== undefined ? customQuery : inputQuery.trim();
    if (!query && task === 'CUSTOM_QUESTION') return;

    setLoading(true);
    setInputQuery('');

    // Collapse actions bar when user generates an answer to maximize reading area
    if (task !== 'CUSTOM_QUESTION') {
      setActionsExpanded(false);
    }

    const taskLabels: Record<string, string> = {
      EXPLAIN_PAGE: `Explain Page ${currentPage}`,
      SUMMARIZE_CHAPTER: currentChapter ? `Summarize Ch. ${currentChapter.chapterNumber}` : 'Summarize Chapter',
      LESSON_PLAN: `Lesson Plan (Page ${currentPage})`,
      EXAMPLES_ACTIVITIES: `Examples & Activities`,
      QUESTION_BANK: `Bloom's Questions`,
      TEACHING_NOTES: `Chalkboard Notes`,
      PRESENTATION: `Slide Outline`,
      TEACH_CHAPTER: `Teach Chapter ${currentChapter?.chapterNumber || ''}`,
      QUICK_SIMPLIFY: `Simplify Concept`,
      QUICK_ANALOGY: `Nepal Real-World Analogy`,
      QUICK_CHECK: `3-Question Check`,
    };

    const userMsg: TeacherMessage = {
      id: `u-${Date.now()}`,
      sender: 'USER',
      content: query || taskLabels[task] || task.replace(/_/g, ' '),
      task,
      scope: selectedScope,
      pageNumber: currentPage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const payload = {
        conversationId: conversationId || undefined,
        query: query || undefined,
        textbookId,
        pageNumber: currentPage,
        chapterNumber: currentChapter?.chapterNumber,
        chapterTitle: currentChapter?.title,
        selectedText: selectedScope === 'SELECTED_TEXT' ? selectedText : undefined,
        scope: selectedScope,
        task,
        language,
        grade: gradeNumber,
      };

      const res = await api.post<{ data: any }>('/teacher-assistant/ask', payload);
      const data = (res as any).data || res;

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const cleanAnswer = cleanContent(data.answer || 'Response generated.');

      // Ensure follow-ups are present
      let followUps = Array.isArray(data.followUps) && data.followUps.length > 0 ? data.followUps : [];
      if (followUps.length === 0) {
        followUps = recommendedQuestions.slice(0, 3);
      }

      const assistantMsg: TeacherMessage = {
        id: data.messageId || `a-${Date.now()}`,
        sender: 'ASSISTANT',
        content: cleanAnswer,
        citations: data.citations || [],
        followUps,
        smartboardSummary: cleanContent(data.smartboardSummary || ''),
        task,
        scope: selectedScope,
        pageNumber: currentPage,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: TeacherMessage = {
        id: `err-${Date.now()}`,
        sender: 'ASSISTANT',
        content: `⚠️ **Unable to complete request:** ${err.message || 'Please check your connection and try again.'}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  /** 1. Copy Entire Response */
  const handleCopy = async (text: string, id: string) => {
    const cleaned = cleanContent(text);
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const textBlob = new Blob([cleaned], { type: 'text/plain' });
        const htmlBlob = new Blob([`<div style="font-family: sans-serif; line-height: 1.6; color: #0f172a;">${cleaned.replace(/\n/g, '<br/>')}</div>`], { type: 'text/html' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': textBlob,
            'text/html': htmlBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(cleaned);
      }
      setCopiedId(id);
      showToast('✓ Response copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      navigator.clipboard.writeText(cleaned);
      setCopiedId(id);
      showToast('✓ Response copied!');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  /** 2. Copy Selected Text */
  const handleCopySelectedText = () => {
    const sel = window.getSelection()?.toString().trim();
    if (!sel) {
      showToast('Highlight text in the response to copy');
      return;
    }
    navigator.clipboard.writeText(sel);
    showToast('✓ Selected text copied!');
  };

  /** 3. Add to Smart Board Workspace (Staged for Review without Opening) */
  const handleAddToSmartBoard = async (msg: TeacherMessage) => {
    try {
      const cleaned = cleanContent(msg.content);
      const title = `${textbookTitle} · Page ${currentPage} Lesson Note`;

      const existingStaged: any[] = JSON.parse(localStorage.getItem('nepal_smartboard_staged_notes') || '[]');
      existingStaged.push({
        id: `staged-${Date.now()}`,
        title,
        content: cleaned,
        textbookId,
        pageNumber: currentPage,
        chapterNumber: currentChapter?.chapterNumber,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('nepal_smartboard_staged_notes', JSON.stringify(existingStaged));

      await api.post('/teacher-assistant/export-smartboard', {
        title,
        content: cleaned,
        pageNumber: currentPage,
        textbookId,
        chapterNumber: currentChapter?.chapterNumber,
      });

      showToast('✓ Added to Smart Board workspace! Staged in board drawer.');
    } catch {
      showToast('✓ Note saved in Smart Board workspace!');
    }
  };

  /** 4. Launch Directly to Smart Board (Immediate Classroom Presentation) */
  const handleLaunchToSmartBoard = (msg: TeacherMessage) => {
    const cleaned = cleanContent(msg.smartboardSummary || msg.content);
    const title = `${textbookTitle} · Page ${currentPage} Presentation`;

    try {
      localStorage.setItem(
        'nepal_smartboard_active_presentation',
        JSON.stringify({
          title,
          content: cleaned,
          pageNumber: currentPage,
          textbookId,
        })
      );
    } catch {}

    if (onOpenSmartBoard) {
      onOpenSmartBoard(currentPage);
      showToast('🚀 Launching presentation on Smart Board…');
      return;
    }

    const token = localStorage.getItem('nepal_edu_token') || '';
    const qs = new URLSearchParams({
      pdf: pdfUrl || `/api/v1/curriculum/textbooks/${textbookId}/pdf`,
      page: String(currentPage),
      title: `${textbookTitle} · Page ${currentPage}`,
      textbookId: textbookId || '',
      presentNote: '1',
      token,
    });
    window.open(`/smartboard/index.html?${qs.toString()}`, '_blank');
    showToast('🚀 Smart Board opened in classroom presentation mode!');
  };

  /** 5. Regenerate Response */
  const handleRegenerate = (msg: TeacherMessage) => {
    if (msg.task) {
      handleAsk(msg.task);
    } else {
      handleAsk('CUSTOM_QUESTION', msg.content);
    }
  };

  return (
    <div
      className={`fixed transition-all duration-300 font-sans text-slate-900 bg-[#f8fafc] ${
        isFullScreen
          ? 'inset-0 z-[100] w-full h-full flex flex-col'
          : 'inset-y-0 right-0 z-[60] w-[490px] md:w-[540px] lg:w-[600px] border-l border-slate-200 flex flex-col shadow-2xl'
      }`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2">
          <BookmarkCheck size={15} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header (Clean, Professional, Elevated) */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-2xs flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-2xs flex-shrink-0">
            <GraduationCap size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
                AI Teaching Assistant
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex-shrink-0">
                शिक्षक एआई
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-700 font-medium">
              <span className="truncate max-w-[170px] font-bold text-slate-900">
                {textbookTitle}
              </span>
              <span>•</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Page {currentPage}
              </span>
              {currentChapter && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[140px] text-slate-700">
                    Ch. {currentChapter.chapterNumber}: {currentChapter.title}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Privacy Status Toggle (Teacher Private vs Show to Class) */}
          <button
            type="button"
            onClick={() => setShowToClassMode(!showToClassMode)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
              showToClassMode
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title={showToClassMode ? 'Classroom Display Mode Active' : 'Private Teacher Mode'}
          >
            {showToClassMode ? <Eye size={14} className="text-amber-700" /> : <EyeOff size={14} className="text-slate-500" />}
            <span className="hidden sm:inline text-[11px] font-bold">{showToClassMode ? 'Class View' : 'Private'}</span>
          </button>

          {/* Full-Screen / Split View Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition flex items-center gap-1.5 border border-slate-200 shadow-2xs"
            title={isFullScreen ? 'Restore Split View (Esc)' : 'Expand to Full Screen'}
          >
            {isFullScreen ? (
              <>
                <Minimize2 size={14} className="text-emerald-700" />
                <span className="text-[11px]">Restore View</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} className="text-emerald-700" />
                <span className="hidden sm:inline text-[11px]">Full Screen</span>
              </>
            )}
          </button>

          {/* Close Assistant */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition"
            title="Close Assistant"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 2. Scope & Language Bar */}
      <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-2 text-xs flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[11px] uppercase font-bold text-slate-600 tracking-wider flex items-center gap-1 mr-1">
            <Compass size={13} className="text-emerald-700" /> Scope:
          </span>

          <button
            type="button"
            onClick={() => setSelectedScope('CURRENT_PAGE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
              selectedScope === 'CURRENT_PAGE'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
            }`}
          >
            Page {currentPage}
          </button>

          {currentChapter && (
            <button
              type="button"
              onClick={() => setSelectedScope('CURRENT_CHAPTER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
                selectedScope === 'CURRENT_CHAPTER'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
              title={currentChapter.title}
            >
              Ch. {currentChapter.chapterNumber}
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedScope('ENTIRE_BOOK')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
              selectedScope === 'ENTIRE_BOOK'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
            }`}
          >
            Whole Book
          </button>

          {selectedText && (
            <button
              type="button"
              onClick={() => setSelectedScope('SELECTED_TEXT')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 border ${
                selectedScope === 'SELECTED_TEXT'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              <span>Selected Text</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedText('');
                  if (selectedScope === 'SELECTED_TEXT') setSelectedScope('CURRENT_PAGE');
                }}
                className="hover:text-rose-900 text-sm font-bold ml-1"
                title="Clear selection"
              >
                ×
              </span>
            </button>
          )}
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 flex-shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => setLanguage('auto')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              language === 'auto' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ne')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              language === 'ne' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            नेपाली
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              language === 'en' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* 3. Pedagogical Actions Bar (Compact & Expandable) */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0 shadow-2xs">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setActiveCategory('core');
                setActionsExpanded(true);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                activeCategory === 'core' && actionsExpanded
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <BookOpen size={13} className={activeCategory === 'core' && actionsExpanded ? 'text-white' : 'text-emerald-700'} />
              <span>Core Teaching</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategory('activities');
                setActionsExpanded(true);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                activeCategory === 'activities' && actionsExpanded
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <HelpCircle size={13} className={activeCategory === 'activities' && actionsExpanded ? 'text-white' : 'text-emerald-700'} />
              <span>Activities & Tests</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategory('delivery');
                setActionsExpanded(true);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                activeCategory === 'delivery' && actionsExpanded
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Presentation size={13} className={activeCategory === 'delivery' && actionsExpanded ? 'text-white' : 'text-emerald-700'} />
              <span>Board & Delivery</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActionsExpanded(!actionsExpanded)}
            className="p-1 rounded-lg hover:bg-slate-100 border border-slate-200 text-slate-600 transition"
            title={actionsExpanded ? 'Collapse pedagogical buttons' : 'Expand pedagogical buttons'}
          >
            {actionsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Action Buttons Grid */}
        {actionsExpanded && (
          <div className="px-4 pb-3 pt-1 border-t border-slate-100 bg-slate-50/70">
            {activeCategory === 'core' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAsk('EXPLAIN_PAGE')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col gap-0.5 shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    <FileText size={14} className="text-emerald-700" />
                    <span>Explain Page</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium leading-tight">
                    Core concepts, teaching notes
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('TEACH_CHAPTER')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col gap-0.5 shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    <Layers size={14} className="text-emerald-700" />
                    <span>Teach Chapter</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium leading-tight">
                    Learning goals & sequence
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('SUMMARIZE_CHAPTER')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col gap-0.5 shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    <BookOpen size={14} className="text-emerald-700" />
                    <span>Summarize Chapter</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium leading-tight">
                    Definitions, rules, recap
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('QUICK_SIMPLIFY')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col gap-0.5 shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    <Sparkles size={14} className="text-emerald-700" />
                    <span>Simplify Concept</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium leading-tight">
                    Easy student-friendly terms
                  </span>
                </button>
              </div>
            )}

            {activeCategory === 'activities' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAsk('LESSON_PLAN')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col gap-0.5 shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    <FileCheck size={14} className="text-emerald-700" />
                    <span>45-Min Lesson Plan</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium leading-tight">
                    Hook, timing, activities
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('EXAMPLES_ACTIVITIES')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col gap-0.5 shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    <Lightbulb size={14} className="text-emerald-700" />
                    <span>Classroom Examples</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium leading-tight">
                    Hands-on low cost tasks
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('QUESTION_BANK')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col gap-0.5 shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    <HelpCircle size={14} className="text-emerald-700" />
                    <span>Bloom's Questions</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium leading-tight">
                    Knowledge, comprehension, MCQs
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('QUICK_CHECK')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col gap-0.5 shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    <CheckSquare size={14} className="text-emerald-700" />
                    <span>3-Question Check</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium leading-tight">
                    Quick formative assessment
                  </span>
                </button>
              </div>
            )}

            {activeCategory === 'delivery' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAsk('TEACHING_NOTES')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col gap-0.5 shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    <FileText size={14} className="text-emerald-700" />
                    <span>Chalkboard Notes</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium leading-tight">
                    Board layout & summary
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('PRESENTATION')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col gap-0.5 shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    <Presentation size={14} className="text-emerald-700" />
                    <span>Slide Outline</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium leading-tight">
                    5-slide teaching deck
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('QUICK_ANALOGY')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col gap-0.5 shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    <Flame size={14} className="text-emerald-700" />
                    <span>Nepal Analogy</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium leading-tight">
                    Cultural & daily life links
                  </span>
                </button>

                {selectedText && (
                  <button
                    type="button"
                    onClick={() => handleAsk('EXPLAIN_SELECTION')}
                    className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 hover:bg-amber-100 text-left transition flex flex-col gap-0.5 shadow-2xs group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <BookmarkCheck size={14} />
                      <span>Explain Selection</span>
                    </div>
                    <span className="text-[10px] text-amber-800 leading-tight">
                      Unpack highlighted passage
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Messages / Response Body */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-[#f8fafc] pb-14 ${
          isFullScreen ? 'max-w-4xl mx-auto w-full' : 'w-full'
        }`}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-2 text-center">
            {/* Header / Intro Card */}
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-2xs mb-2.5">
              <GraduationCap size={28} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1 tracking-tight">
              Classroom Teaching Assistant
            </h3>
            <p className="text-xs max-w-md leading-relaxed text-slate-600 mb-4">
              Ask any pedagogical question, compare concepts in 2 columns, generate Bloom's questions, or step-by-step calculations aligned with Nepal CDC curriculum.
            </p>

            {/* Quick 4 Starter Tiles (Clean 2x2 grid in split view, 4x1 grid in fullscreen) */}
            <div className="w-full max-w-xl grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleAsk('EXPLAIN_PAGE')}
                className="p-3 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-400 text-left transition shadow-2xs flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:scale-105 transition-transform">
                    <FileText size={15} />
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">Explain Page {currentPage}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Core concepts & notes</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAsk('LESSON_PLAN')}
                className="p-3 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-400 text-left transition shadow-2xs flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 group-hover:scale-105 transition-transform">
                    <FileCheck size={15} />
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">45-Min Lesson Plan</div>
                  <div className="text-[10px] text-slate-500 font-medium">Objectives & activities</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAsk('CUSTOM_QUESTION', `Generate a 2-column comparison table of the key differences in concepts on Page ${currentPage}`)}
                className="p-3 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-400 text-left transition shadow-2xs flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 group-hover:scale-105 transition-transform">
                    <Scale size={15} />
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">2-Column Comparison</div>
                  <div className="text-[10px] text-slate-500 font-medium">Differences & tabular view</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAsk('QUESTION_BANK')}
                className="p-3 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-400 text-left transition shadow-2xs flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 group-hover:scale-105 transition-transform">
                    <HelpCircle size={15} />
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">Bloom's Quiz</div>
                  <div className="text-[10px] text-slate-500 font-medium">Knowledge & questions</div>
                </div>
              </button>
            </div>

            {/* Smart Chapter-Aware Recommended Questions Section */}
            <div className="w-full max-w-xl text-left bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Lightbulb size={15} className="text-amber-500" />
                  <span>
                    Curriculum Questions for {currentChapter ? `Ch. ${currentChapter.chapterNumber}: ${currentChapter.title}` : `Page ${currentPage}`}:
                  </span>
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Click to Ask
                </span>
              </div>

              <div className="space-y-1.5">
                {recommendedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAsk('CUSTOM_QUESTION', q)}
                    className="w-full text-left p-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-400 text-xs text-slate-900 font-semibold transition flex items-center justify-between group shadow-2xs"
                  >
                    <span className="leading-snug pr-2 text-slate-900 group-hover:text-emerald-900">
                      ▪ {q}
                    </span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-emerald-700 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'USER' ? 'items-end' : 'items-start'
              }`}
            >
              {msg.sender === 'USER' ? (
                <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-slate-900 text-white px-4 py-2.5 text-xs font-medium shadow-xs">
                  <div className="whitespace-pre-wrap">{cleanContent(msg.content)}</div>
                </div>
              ) : (
                <div className="w-full rounded-2xl bg-white border border-slate-200 p-4 md:p-5 shadow-xs transition-all text-slate-900">
                  {/* Assistant Message Header & Action Toolbar */}
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                      <Sparkles size={14} className="text-emerald-700" />
                      <span>{msg.task ? msg.task.replace(/_/g, ' ') : 'AI Teaching Response'}</span>
                    </span>

                    {/* Toolbar Actions */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition flex items-center gap-1 text-[11px] font-semibold border border-slate-200"
                        title="Copy complete response to clipboard"
                      >
                        {copiedId === msg.id ? <Check size={12} className="text-emerald-700" /> : <Copy size={12} />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopySelectedText}
                        className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition flex items-center gap-1 text-[11px] font-medium border border-slate-200"
                        title="Copy highlighted text"
                      >
                        <span>Copy Selected</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddToSmartBoard(msg)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition flex items-center gap-1 text-[11px] font-bold border border-emerald-300"
                        title="Add response to Smart Board workspace for review"
                      >
                        <PlusCircle size={12} />
                        <span>Add to Board</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLaunchToSmartBoard(msg)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 text-[11px] font-bold shadow-2xs"
                        title="Present this response immediately on the classroom Smart Board"
                      >
                        <Presentation size={12} />
                        <span>Launch Board</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRegenerate(msg)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                        title="Regenerate response"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Render Structured Response with Tables, Columns, and KaTeX */}
                  <StructuredResponseRenderer content={msg.content} showToClass={showToClassMode} />

                  {/* Smart Board Presentation Highlight Card if present */}
                  {msg.smartboardSummary && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-900 text-xs flex items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                          🖥️ Chalkboard Summary
                        </span>
                        <p className="text-[12px] leading-snug text-slate-800 font-medium">
                          {cleanContent(msg.smartboardSummary)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLaunchToSmartBoard(msg)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex-shrink-0 flex items-center gap-1 shadow-2xs transition"
                      >
                        <ExternalLink size={12} /> Launch
                      </button>
                    </div>
                  )}

                  {/* Clickable Citations with Exact PDF Navigation */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                        Textbook Sources (Click to jump):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onJumpToPage(c.pageNumber)}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center gap-1.5 transition shadow-2xs group"
                            title={c.excerpt}
                          >
                            <FileText size={12} className="text-emerald-700 group-hover:scale-110 transition-transform" />
                            <span>
                              Page {c.pageNumber}
                              {c.pageEnd && c.pageEnd !== c.pageNumber ? `–${c.pageEnd}` : ''}
                            </span>
                            {c.chapterTitle && (
                              <span className="text-slate-500 text-[10px] max-w-[110px] truncate font-normal">
                                · {c.chapterTitle}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chapter-Aware Follow-up Prompts */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1 mb-2">
                        <Lightbulb size={13} className="text-amber-500" />
                        <span>Recommended Next Questions for {currentChapter ? `Ch. ${currentChapter.chapterNumber}` : 'this Topic'}:</span>
                      </span>
                      <div className="space-y-1.5">
                        {msg.followUps.map((f, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAsk('CUSTOM_QUESTION', f)}
                            className="w-full text-left p-2 px-3 rounded-xl bg-slate-50/80 hover:bg-emerald-50/70 text-xs text-slate-900 font-medium transition flex items-center justify-between group border border-slate-200 hover:border-emerald-300"
                          >
                            <span className="truncate pr-2">▪ {f}</span>
                            <ArrowRight size={12} className="text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 ml-2 flex-shrink-0 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs shadow-2xs">
            <Loader2 className="animate-spin text-emerald-700" size={17} />
            <span className="font-semibold text-slate-800">
              Consulting CDC textbook & generating pedagogical guidance…
            </span>
          </div>
        )}
      </div>

      {/* 5. Input Area */}
      <div className="bg-white p-3 md:p-3.5 border-t border-slate-200 shadow-sm flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk('CUSTOM_QUESTION');
          }}
          className={`${isFullScreen ? 'max-w-4xl mx-auto' : 'w-full'}`}
        >
          <div className="flex items-end gap-2.5">
            <div className="flex-1 bg-slate-50/90 border border-slate-200 focus-within:border-emerald-600 focus-within:bg-white rounded-xl p-2 transition shadow-inner">
              <textarea
                ref={textareaRef}
                rows={2}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputQuery.trim() && !loading) {
                      handleAsk('CUSTOM_QUESTION');
                    }
                  }
                }}
                placeholder={`Ask about Page ${currentPage}, compare concepts, or request lesson plans…`}
                disabled={loading}
                className="w-full bg-transparent resize-none text-xs md:text-sm text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none leading-relaxed"
              />
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-600 font-medium">
                <span>
                  Scope: <strong className="text-slate-900 bg-slate-200/70 px-1 py-0.2 rounded">{selectedScope.replace('_', ' ')}</strong> · Lang: <strong className="text-slate-900 bg-slate-200/70 px-1 py-0.2 rounded">{language.toUpperCase()}</strong>
                </span>
                <span className="text-slate-500">Enter ↵ to send · Shift+Enter new line</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold transition shadow-xs flex items-center justify-center flex-shrink-0"
              title="Send question"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
