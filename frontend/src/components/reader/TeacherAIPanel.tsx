import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Share2,
  BookmarkCheck,
  Layers,
  GraduationCap,
  Calculator,
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
  const [actionsExpanded, setActionsExpanded] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'core' | 'activities' | 'delivery'>('core');

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isTeacher = Boolean(user && AUTHORIZED_TEACHER_ROLES.includes(user.role));

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }, []);

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
      <div className="fixed inset-y-0 right-0 z-[60] w-96 bg-[#F4F6F3] border-l border-[#DCE5DE] text-[#26332E] p-6 flex flex-col justify-center items-center shadow-2xl">
        <div className="p-4 rounded-full bg-rose-50 text-rose-600 mb-4 border border-rose-200">
          <EyeOff size={32} />
        </div>
        <h3 className="text-base font-bold text-[#26332E] mb-2 text-center">Teacher-Only Assistant</h3>
        <p className="text-xs text-[#68766F] text-center leading-relaxed mb-6">
          The AI Teaching Assistant provides pedagogical guides, lesson plans, and curriculum solutions designed exclusively for authorized teachers and school administrators.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#187C68] hover:bg-[#136353] text-xs font-semibold rounded-xl text-white transition shadow-sm"
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

    // Collapse actions deck when user generates an answer to maximize reading area
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

      const assistantMsg: TeacherMessage = {
        id: data.messageId || `a-${Date.now()}`,
        sender: 'ASSISTANT',
        content: cleanAnswer,
        citations: data.citations || [],
        followUps: data.followUps || [],
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
        const htmlBlob = new Blob([`<div style="font-family: sans-serif; line-height: 1.6;">${cleaned.replace(/\n/g, '<br/>')}</div>`], { type: 'text/html' });
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
      showToast('Select text inside the answer to copy specific parts');
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

      // 1. Stage in localStorage queue for Smart Board
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

      // 2. Call backend export endpoint
      await api.post('/teacher-assistant/export-smartboard', {
        title,
        content: cleaned,
        pageNumber: currentPage,
        textbookId,
        chapterNumber: currentChapter?.chapterNumber,
      });

      showToast('✓ Added to Smart Board workspace! Staged in board drawer.');
    } catch (e: any) {
      showToast('✓ Note saved in Smart Board workspace!');
    }
  };

  /** 4. Launch Directly to Smart Board (Immediate Classroom Presentation) */
  const handleLaunchToSmartBoard = (msg: TeacherMessage) => {
    const cleaned = cleanContent(msg.smartboardSummary || msg.content);
    const title = `${textbookTitle} · Page ${currentPage} Presentation`;

    // Store as active presentation payload
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
    } catch (e) {}

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
      className={`fixed transition-all duration-300 font-sans ${
        isFullScreen
          ? 'inset-0 z-[100] w-full h-full bg-[#F4F6F3] flex flex-col'
          : 'inset-y-0 right-0 z-[60] w-[480px] md:w-[520px] lg:w-[580px] bg-[#F4F6F3] border-l border-[#DCE5DE] text-[#26332E] flex flex-col shadow-2xl'
      }`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#187C68] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl border border-white/20 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <BookmarkCheck size={15} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header (Compact, Balanced Light Theme) */}
      <div className="bg-white px-4 py-3 border-b border-[#DCE5DE] flex items-center justify-between shadow-xs flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#E5F2EB] border border-[#187C68]/30 flex items-center justify-center text-[#187C68] shadow-xs flex-shrink-0">
            <GraduationCap size={19} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#26332E] tracking-tight truncate">
                AI Teaching Assistant
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5F2EB] text-[#187C68] border border-[#187C68]/25 flex-shrink-0">
                शिक्षक एआई
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#68766F]">
              <span className="truncate max-w-[170px] font-semibold text-[#26332E]">
                {textbookTitle}
              </span>
              <span>•</span>
              <span className="text-[#187C68] font-bold">Page {currentPage}</span>
              {currentChapter && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[120px] text-[#68766F]">
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
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              showToClassMode
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : 'bg-[#EAF0EB] hover:bg-[#DCE5DE] text-[#26332E]'
            }`}
            title={showToClassMode ? 'Classroom Display Mode Active' : 'Private Teacher Mode'}
          >
            {showToClassMode ? <Eye size={14} className="text-amber-700" /> : <EyeOff size={14} className="text-[#68766F]" />}
            <span className="hidden sm:inline text-[11px]">{showToClassMode ? 'Class View' : 'Private'}</span>
          </button>

          {/* Full-Screen / Split View Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="px-2.5 py-1.5 rounded-xl bg-[#EAF0EB] hover:bg-[#DCE5DE] text-[#26332E] font-semibold text-xs transition flex items-center gap-1.5 border border-[#DCE5DE]"
            title={isFullScreen ? 'Restore Split View (Esc)' : 'Expand to Full Screen'}
          >
            {isFullScreen ? (
              <>
                <Minimize2 size={14} className="text-[#187C68]" />
                <span className="text-[11px] font-bold">Restore View</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} className="text-[#187C68]" />
                <span className="hidden sm:inline text-[11px]">Full Screen</span>
              </>
            )}
          </button>

          {/* Close Assistant */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#EAF0EB] hover:bg-rose-100 text-[#68766F] hover:text-rose-700 transition"
            title="Close Assistant"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* 2. Scope & Language Bar */}
      <div className="px-4 py-2 bg-[#EAF0EB]/60 border-b border-[#DCE5DE] flex items-center justify-between gap-2 text-xs flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[10px] uppercase font-extrabold text-[#68766F] tracking-wider flex items-center gap-1 mr-1">
            <Compass size={12} className="text-[#187C68]" /> Scope:
          </span>

          <button
            type="button"
            onClick={() => setSelectedScope('CURRENT_PAGE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedScope === 'CURRENT_PAGE'
                ? 'bg-[#187C68] text-white shadow-xs'
                : 'bg-white text-[#68766F] hover:text-[#26332E] border border-[#DCE5DE]'
            }`}
          >
            Page {currentPage}
          </button>

          {currentChapter && (
            <button
              type="button"
              onClick={() => setSelectedScope('CURRENT_CHAPTER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedScope === 'CURRENT_CHAPTER'
                  ? 'bg-[#187C68] text-white shadow-xs'
                  : 'bg-white text-[#68766F] hover:text-[#26332E] border border-[#DCE5DE]'
              }`}
              title={currentChapter.title}
            >
              Ch. {currentChapter.chapterNumber}
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedScope('ENTIRE_BOOK')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedScope === 'ENTIRE_BOOK'
                ? 'bg-[#187C68] text-white shadow-xs'
                : 'bg-white text-[#68766F] hover:text-[#26332E] border border-[#DCE5DE]'
            }`}
          >
            Whole Book
          </button>

          {selectedText && (
            <button
              type="button"
              onClick={() => setSelectedScope('SELECTED_TEXT')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedScope === 'SELECTED_TEXT'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-300'
              }`}
            >
              <span>Selected Text</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedText('');
                  if (selectedScope === 'SELECTED_TEXT') setSelectedScope('CURRENT_PAGE');
                }}
                className="hover:text-rose-200 text-sm font-bold"
                title="Clear selection"
              >
                ×
              </span>
            </button>
          )}
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-white border border-[#DCE5DE] rounded-xl p-0.5 flex-shrink-0 shadow-xs">
          <button
            type="button"
            onClick={() => setLanguage('auto')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
              language === 'auto' ? 'bg-[#187C68] text-white' : 'text-[#68766F] hover:text-[#26332E]'
            }`}
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ne')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
              language === 'ne' ? 'bg-[#187C68] text-white' : 'text-[#68766F] hover:text-[#26332E]'
            }`}
          >
            नेपाली
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
              language === 'en' ? 'bg-[#187C68] text-white' : 'text-[#68766F] hover:text-[#26332E]'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* 3. Pedagogical Actions Bar */}
      <div className="bg-white border-b border-[#DCE5DE] flex-shrink-0 shadow-xs">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveCategory('core');
                setActionsExpanded(true);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeCategory === 'core' && actionsExpanded
                  ? 'bg-[#187C68] text-white shadow-xs'
                  : 'bg-[#EAF0EB] text-[#68766F] hover:text-[#26332E]'
              }`}
            >
              <BookOpen size={13} />
              <span>Core Teaching</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategory('activities');
                setActionsExpanded(true);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeCategory === 'activities' && actionsExpanded
                  ? 'bg-[#187C68] text-white shadow-xs'
                  : 'bg-[#EAF0EB] text-[#68766F] hover:text-[#26332E]'
              }`}
            >
              <HelpCircle size={13} />
              <span>Activities & Tests</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategory('delivery');
                setActionsExpanded(true);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeCategory === 'delivery' && actionsExpanded
                  ? 'bg-[#187C68] text-white shadow-xs'
                  : 'bg-[#EAF0EB] text-[#68766F] hover:text-[#26332E]'
              }`}
            >
              <Presentation size={13} />
              <span>Board & Delivery</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActionsExpanded(!actionsExpanded)}
            className="p-1 rounded-lg text-[#68766F] hover:text-[#26332E] hover:bg-[#EAF0EB] transition"
            title={actionsExpanded ? 'Collapse pedagogical buttons' : 'Expand pedagogical buttons'}
          >
            {actionsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Action Buttons Grid */}
        {actionsExpanded && (
          <div className="px-4 pb-3 pt-1 border-t border-[#DCE5DE]/60 bg-[#F4F6F3]/50">
            {activeCategory === 'core' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAsk('EXPLAIN_PAGE')}
                  className="p-2.5 rounded-xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/30 text-left transition flex flex-col gap-1 shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#187C68]">
                    <FileText size={14} />
                    <span>Explain Page</span>
                  </div>
                  <span className="text-[10px] text-[#68766F]">Core concepts, teaching notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('TEACH_CHAPTER')}
                  className="p-2.5 rounded-xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/30 text-left transition flex flex-col gap-1 shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#187C68]">
                    <Layers size={14} />
                    <span>Teach Chapter</span>
                  </div>
                  <span className="text-[10px] text-[#68766F]">Learning goals & sequence</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('SUMMARIZE_CHAPTER')}
                  className="p-2.5 rounded-xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/30 text-left transition flex flex-col gap-1 shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#187C68]">
                    <BookOpen size={14} />
                    <span>Summarize Chapter</span>
                  </div>
                  <span className="text-[10px] text-[#68766F]">Definitions, rules, recap</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('QUICK_SIMPLIFY')}
                  className="p-2.5 rounded-xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/30 text-left transition flex flex-col gap-1 shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#187C68]">
                    <Sparkles size={14} />
                    <span>Simplify Concept</span>
                  </div>
                  <span className="text-[10px] text-[#68766F]">Easy student-friendly terms</span>
                </button>
              </div>
            )}

            {activeCategory === 'activities' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAsk('LESSON_PLAN')}
                  className="p-2.5 rounded-xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/30 text-left transition flex flex-col gap-1 shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#187C68]">
                    <FileCheck size={14} />
                    <span>45-Min Lesson Plan</span>
                  </div>
                  <span className="text-[10px] text-[#68766F]">Hook, timing, activities</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('EXAMPLES_ACTIVITIES')}
                  className="p-2.5 rounded-xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/30 text-left transition flex flex-col gap-1 shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#187C68]">
                    <Lightbulb size={14} />
                    <span>Classroom Examples</span>
                  </div>
                  <span className="text-[10px] text-[#68766F]">Hands-on low cost tasks</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('QUESTION_BANK')}
                  className="p-2.5 rounded-xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/30 text-left transition flex flex-col gap-1 shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#187C68]">
                    <HelpCircle size={14} />
                    <span>Bloom's Questions</span>
                  </div>
                  <span className="text-[10px] text-[#68766F]">Knowledge, comprehension, MCQs</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('QUICK_CHECK')}
                  className="p-2.5 rounded-xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/30 text-left transition flex flex-col gap-1 shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#187C68]">
                    <Check size={14} />
                    <span>3-Question Check</span>
                  </div>
                  <span className="text-[10px] text-[#68766F]">Quick formative assessment</span>
                </button>
              </div>
            )}

            {activeCategory === 'delivery' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAsk('TEACHING_NOTES')}
                  className="p-2.5 rounded-xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/30 text-left transition flex flex-col gap-1 shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#187C68]">
                    <FileText size={14} />
                    <span>Chalkboard Notes</span>
                  </div>
                  <span className="text-[10px] text-[#68766F]">Board layout & summary</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('PRESENTATION')}
                  className="p-2.5 rounded-xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/30 text-left transition flex flex-col gap-1 shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#187C68]">
                    <Presentation size={14} />
                    <span>Slide Outline</span>
                  </div>
                  <span className="text-[10px] text-[#68766F]">5-slide teaching deck</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('QUICK_ANALOGY')}
                  className="p-2.5 rounded-xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/30 text-left transition flex flex-col gap-1 shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#187C68]">
                    <Flame size={14} />
                    <span>Nepal Analogy</span>
                  </div>
                  <span className="text-[10px] text-[#68766F]">Cultural & daily life links</span>
                </button>

                {selectedText && (
                  <button
                    type="button"
                    onClick={() => handleAsk('EXPLAIN_SELECTION')}
                    className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 hover:bg-amber-100 text-left transition flex flex-col gap-1 shadow-xs group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                      <BookmarkCheck size={14} />
                      <span>Explain Selection</span>
                    </div>
                    <span className="text-[10px] text-amber-700">Unpack highlighted passage</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Messages / Response Body (Scrollable, Viewport-Aware) */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-[#F4F6F3] ${
          isFullScreen ? 'max-w-6xl mx-auto w-full' : 'w-full'
        }`}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#68766F]">
            <div className="w-16 h-16 rounded-3xl bg-white border border-[#DCE5DE] text-[#187C68] flex items-center justify-center shadow-sm mb-4">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-base font-extrabold text-[#26332E] mb-1">
              Classroom Teaching Assistant
            </h3>
            <p className="text-xs max-w-md leading-relaxed text-[#68766F] mb-6">
              Ask any pedagogical question, compare concepts in 2 columns, generate Bloom's questions, or step-by-step numerical calculations aligned with Nepal CDC curriculum.
            </p>

            {/* Quick Starter Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md w-full">
              <button
                type="button"
                onClick={() => handleAsk('EXPLAIN_PAGE')}
                className="p-3 rounded-2xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/40 text-left transition shadow-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-[#187C68]" />
                  <span className="text-xs font-bold text-[#26332E]">Explain Page {currentPage}</span>
                </div>
                <ArrowRight size={14} className="text-[#68766F] group-hover:text-[#187C68] transition" />
              </button>

              <button
                type="button"
                onClick={() => handleAsk('LESSON_PLAN')}
                className="p-3 rounded-2xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/40 text-left transition shadow-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck size={16} className="text-[#187C68]" />
                  <span className="text-xs font-bold text-[#26332E]">45-Min Lesson Plan</span>
                </div>
                <ArrowRight size={14} className="text-[#68766F] group-hover:text-[#187C68] transition" />
              </button>

              <button
                type="button"
                onClick={() => handleAsk('CUSTOM_QUESTION', `Difference between key concepts on page ${currentPage}`)}
                className="p-3 rounded-2xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/40 text-left transition shadow-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Calculator size={16} className="text-[#187C68]" />
                  <span className="text-xs font-bold text-[#26332E]">2-Column Comparison</span>
                </div>
                <ArrowRight size={14} className="text-[#68766F] group-hover:text-[#187C68] transition" />
              </button>

              <button
                type="button"
                onClick={() => handleAsk('QUESTION_BANK')}
                className="p-3 rounded-2xl bg-white border border-[#DCE5DE] hover:border-[#187C68] hover:bg-[#E5F2EB]/40 text-left transition shadow-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle size={16} className="text-[#187C68]" />
                  <span className="text-xs font-bold text-[#26332E]">Bloom's Taxonomy Quiz</span>
                </div>
                <ArrowRight size={14} className="text-[#68766F] group-hover:text-[#187C68] transition" />
              </button>
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
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#187C68] text-white px-4 py-2.5 text-xs font-medium shadow-sm">
                  <div className="whitespace-pre-wrap">{cleanContent(msg.content)}</div>
                </div>
              ) : (
                <div className="w-full rounded-2xl bg-white border border-[#DCE5DE] p-4 md:p-5 shadow-xs transition-all">
                  {/* Assistant Message Header & Response Action Toolbar */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE5DE] text-xs">
                    <span className="flex items-center gap-2 font-extrabold text-[#187C68]">
                      <Sparkles size={14} className="text-[#187C68]" />
                      <span>{msg.task ? msg.task.replace(/_/g, ' ') : 'Teaching Assistant Response'}</span>
                    </span>

                    {/* Action Toolbar */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {/* Copy Entire Response */}
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#EAF0EB] hover:bg-[#DCE5DE] text-[#26332E] transition flex items-center gap-1 text-[11px] font-semibold border border-[#DCE5DE]"
                        title="Copy complete response to clipboard"
                      >
                        {copiedId === msg.id ? <Check size={12} className="text-[#187C68]" /> : <Copy size={12} />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy Response'}</span>
                      </button>

                      {/* Copy Selected Text */}
                      <button
                        type="button"
                        onClick={handleCopySelectedText}
                        className="px-2 py-1 rounded-lg bg-[#EAF0EB] hover:bg-[#DCE5DE] text-[#68766F] hover:text-[#26332E] transition flex items-center gap-1 text-[11px] font-medium"
                        title="Copy only highlighted text"
                      >
                        <span>Copy Selected</span>
                      </button>

                      {/* Add to Smart Board Workspace */}
                      <button
                        type="button"
                        onClick={() => handleAddToSmartBoard(msg)}
                        className="px-2.5 py-1 rounded-lg bg-[#E5F2EB] hover:bg-[#d2e8dc] text-[#187C68] transition flex items-center gap-1 text-[11px] font-bold border border-[#187C68]/30"
                        title="Add response to Smart Board workspace for review"
                      >
                        <PlusCircle size={12} />
                        <span>Add to Board</span>
                      </button>

                      {/* Launch to Smart Board Directly */}
                      <button
                        type="button"
                        onClick={() => handleLaunchToSmartBoard(msg)}
                        className="px-2.5 py-1 rounded-lg bg-[#187C68] hover:bg-[#136353] text-white transition flex items-center gap-1 text-[11px] font-bold shadow-xs"
                        title="Present this response immediately on the classroom Smart Board"
                      >
                        <Presentation size={12} />
                        <span>Launch Board</span>
                      </button>

                      {/* Regenerate */}
                      <button
                        type="button"
                        onClick={() => handleRegenerate(msg)}
                        className="p-1 rounded-lg hover:bg-[#EAF0EB] text-[#68766F] hover:text-[#26332E] transition"
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
                    <div className="mt-4 p-3.5 rounded-xl bg-[#E5F2EB]/60 border border-[#187C68]/30 text-[#26332E] text-xs flex items-center justify-between gap-3 shadow-xs">
                      <div>
                        <span className="text-[10px] font-extrabold text-[#187C68] uppercase tracking-wider block mb-0.5">
                          🖥️ Classroom Chalkboard Summary
                        </span>
                        <p className="text-[12px] leading-snug text-[#26332E] font-medium">
                          {cleanContent(msg.smartboardSummary)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLaunchToSmartBoard(msg)}
                        className="px-3 py-1.5 rounded-xl bg-[#187C68] hover:bg-[#136353] text-white text-xs font-bold flex-shrink-0 flex items-center gap-1.5 shadow-xs transition"
                      >
                        <ExternalLink size={13} /> Launch
                      </button>
                    </div>
                  )}

                  {/* Clickable Citations with Exact PDF Navigation */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#DCE5DE]">
                      <span className="text-[10px] font-extrabold text-[#68766F] uppercase tracking-wider block mb-2">
                        Official Textbook Sources (Click to jump):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onJumpToPage(c.pageNumber)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#E5F2EB] border border-[#DCE5DE] hover:border-[#187C68] text-xs text-[#187C68] font-bold flex items-center gap-1.5 transition shadow-xs group"
                            title={c.excerpt}
                          >
                            <FileText size={12} className="text-[#187C68] group-hover:scale-110 transition-transform" />
                            <span>
                              Page {c.pageNumber}
                              {c.pageEnd && c.pageEnd !== c.pageNumber ? `–${c.pageEnd}` : ''}
                            </span>
                            {c.chapterTitle && (
                              <span className="text-[#68766F] text-[10px] max-w-[110px] truncate font-normal">
                                · {c.chapterTitle}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Prompts */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#DCE5DE]">
                      <span className="text-[10px] font-extrabold text-[#68766F] uppercase tracking-wider block mb-2">
                        Recommended Next Pedagogical Steps:
                      </span>
                      <div className="space-y-1.5">
                        {msg.followUps.map((f, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAsk('CUSTOM_QUESTION', f)}
                            className="w-full text-left p-2 px-3 rounded-xl bg-[#EAF0EB]/60 hover:bg-[#E5F2EB] text-xs text-[#26332E] font-medium transition flex items-center justify-between group border border-[#DCE5DE]"
                          >
                            <span className="truncate">▪ {f}</span>
                            <ArrowRight size={12} className="text-[#68766F] group-hover:text-[#187C68] ml-2 flex-shrink-0 transition" />
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
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#DCE5DE] text-[#26332E] text-xs shadow-xs">
            <Loader2 className="animate-spin text-[#187C68]" size={18} />
            <span className="font-semibold text-[#187C68]">
              Consulting official CDC textbook & generating structured pedagogical response…
            </span>
          </div>
        )}
      </div>

      {/* 5. Safe Input Area (Comfortable, Auto-Grow Textarea) */}
      <div className="bg-white p-3 md:p-4 border-t border-[#DCE5DE] shadow-lg flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk('CUSTOM_QUESTION');
          }}
          className={`${isFullScreen ? 'max-w-6xl mx-auto' : 'w-full'}`}
        >
          <div className="flex items-end gap-2.5">
            <div className="flex-1 bg-[#F4F6F3] border border-[#DCE5DE] focus-within:border-[#187C68] focus-within:bg-white rounded-2xl p-2 transition shadow-inner">
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
                className="w-full bg-transparent resize-none text-xs md:text-sm text-[#26332E] placeholder-[#68766F] focus:outline-none leading-relaxed"
              />
              <div className="flex items-center justify-between pt-1 border-t border-[#DCE5DE]/50 text-[10px] text-[#68766F]">
                <span>
                  Scope: <strong className="text-[#187C68]">{selectedScope.replace('_', ' ')}</strong> · Lang: <strong className="text-[#187C68]">{language.toUpperCase()}</strong>
                </span>
                <span>Enter ↵ to send · Shift+Enter new line</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-3 rounded-2xl bg-[#187C68] hover:bg-[#136353] disabled:opacity-40 text-white font-bold transition shadow-sm flex items-center justify-center flex-shrink-0"
              title="Send question"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
