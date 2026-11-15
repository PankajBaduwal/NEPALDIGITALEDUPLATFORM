import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

  // If content is wrapped in raw JSON string { "answer": "..." }
  if (str.startsWith('{') && str.includes('"answer"')) {
    try {
      const parsed = JSON.parse(str);
      if (parsed.answer) return parsed.answer;
    } catch {
      // Regex extraction fallback
      const m = str.match(/"answer"\s*:\s*"([\s\S]*?)(?="\s*,\s*"(?:groundedness|sources|followUps|smartboardSummary)"|\s*"\s*\}|\s*\}$)/i);
      if (m && m[1]) {
        return m[1]
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      }
      // Strip outer JSON boilerplate
      str = str
        .replace(/^\s*\{\s*"answer"\s*:\s*"?/i, '')
        .replace(/"?\s*,\s*"(?:groundedness|sources|followUps|smartboardSummary)"[\s\S]*$/i, '')
        .replace(/"?\s*\}\s*$/i, '')
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"');
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState<'normal' | 'wide'>('normal');
  const [actionsExpanded, setActionsExpanded] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'core' | 'activities' | 'delivery'>('core');

  const scrollRef = useRef<HTMLDivElement>(null);
  const isTeacher = Boolean(user && AUTHORIZED_TEACHER_ROLES.includes(user.role));

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
      <div className="fixed inset-y-0 right-0 z-[60] w-96 bg-slate-950/95 backdrop-blur-xl border-l border-rose-900/40 text-slate-200 p-6 flex flex-col justify-center items-center shadow-2xl">
        <div className="p-4 rounded-full bg-rose-500/20 text-rose-400 mb-4">
          <EyeOff size={32} />
        </div>
        <h3 className="text-base font-bold text-white mb-2 text-center">Teacher-Only Assistant</h3>
        <p className="text-xs text-slate-400 text-center leading-relaxed mb-6">
          The AI Teaching Assistant provides pedagogical guides, lesson plans, and curriculum solutions designed exclusively for teachers and school administrators.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 transition"
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(cleanContent(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePresentOnSmartBoard = (summaryText?: string) => {
    if (onOpenSmartBoard) {
      onOpenSmartBoard(currentPage);
      return;
    }
    const token = localStorage.getItem('nepal_edu_token') || '';
    const qs = new URLSearchParams({
      pdf: pdfUrl || `/api/v1/curriculum/textbooks/${textbookId}/pdf`,
      page: String(currentPage),
      title: `${textbookTitle} · Page ${currentPage}`,
      textbookId: textbookId || '',
      token,
    });
    window.open(`/smartboard/index.html?${qs.toString()}`, '_blank');
  };

  const renderFormatted = (rawContent: string) => {
    const content = cleanContent(rawContent);

    // KaTeX Math Display $$...$$
    let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_match, expr) => {
      try {
        return `<div class="katex-display my-3 overflow-x-auto py-2 px-3 rounded-xl bg-slate-950/70 border border-teal-500/30 text-center font-mono">${katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })}</div>`;
      } catch {
        return `<pre class="text-xs bg-slate-950 p-2 rounded">${expr}</pre>`;
      }
    });

    // KaTeX Math Inline $...$
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (_match, expr) => {
      try {
        return `<span class="katex-inline px-1 py-0.5 rounded bg-slate-950/60 font-mono text-teal-300">${katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false })}</span>`;
      } catch {
        return `<code>${expr}</code>`;
      }
    });

    // Markdown Headers
    processed = processed
      .replace(/^### (.*$)/gim, '<h3 class="text-xs font-bold text-teal-300 uppercase tracking-wider mt-4 mb-1.5 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-sm font-bold text-white mt-5 mb-2 pb-1.5 border-b border-teal-500/20 flex items-center gap-2"><span class="text-teal-400">§</span>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-base font-extrabold text-teal-200 mt-5 mb-2 pb-2 border-b border-slate-700/80">$1</h1>');

    // Horizontal Rule
    processed = processed.replace(/^---$/gim, '<hr class="my-4 border-slate-800/80" />');

    // Bold text
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white bg-teal-500/10 px-1 rounded">$1</strong>');

    // Italic text
    processed = processed.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');

    // Bullet points
    processed = processed.replace(/^[-*] (.*$)/gim, '<li class="ml-4 list-disc text-slate-200 my-1 pl-1 leading-relaxed">$1</li>');

    // Numbered lists
    processed = processed.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-slate-200 my-1 pl-1 leading-relaxed font-normal">$1</li>');

    // Paragraph breaks
    processed = processed.replace(/\n\n/g, '<div class="my-2.5"></div>');

    return (
      <div
        className="text-[12px] leading-relaxed text-slate-200 space-y-1 font-sans selection:bg-teal-500/30 selection:text-white"
        dangerouslySetInnerHTML={{ __html: processed }}
      />
    );
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 z-[60] bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl transition-all duration-300 ${
        panelWidth === 'wide' ? 'w-[720px]' : 'w-[460px]'
      }`}
    >
      {/* 1. Elevated Header */}
      <div className="p-3 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950 border-b border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 flex-shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-white tracking-wide truncate">Teacher AI Assistant</h2>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 flex-shrink-0">
                शिक्षक एआई
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
              <span className="truncate max-w-[160px] text-slate-300 font-medium">{textbookTitle}</span>
              <span>•</span>
              <span className="text-teal-400 font-semibold">Page {currentPage}</span>
              {currentChapter && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[100px] text-slate-400">Ch. {currentChapter.chapterNumber}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Show to Class Presentation Mode */}
          <button
            type="button"
            onClick={() => setShowToClassMode(!showToClassMode)}
            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              showToClassMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={showToClassMode ? 'Exit Presentation Mode' : 'Show to Class Mode (Large Cards)'}
          >
            {showToClassMode ? <Eye size={13} /> : <EyeOff size={13} />}
            <span className="text-[10px] font-semibold">{showToClassMode ? 'Class View' : 'Private'}</span>
          </button>

          {/* Width Expand Toggle */}
          <button
            type="button"
            onClick={() => setPanelWidth(panelWidth === 'wide' ? 'normal' : 'wide')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
            title={panelWidth === 'wide' ? 'Standard Width' : 'Expand Sidebar'}
          >
            {panelWidth === 'wide' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {/* Close Panel */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
            title="Close Assistant"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* 2. Scope & Language Segmented Bar */}
      <div className="px-3 py-1.5 bg-slate-900/50 border-b border-slate-800/70 flex items-center justify-between gap-1 text-[11px]">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1 mr-1">
            <Compass size={11} className="text-teal-400" /> Scope:
          </span>

          <button
            type="button"
            onClick={() => setSelectedScope('CURRENT_PAGE')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition whitespace-nowrap ${
              selectedScope === 'CURRENT_PAGE'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Page {currentPage}
          </button>

          {currentChapter && (
            <button
              type="button"
              onClick={() => setSelectedScope('CURRENT_CHAPTER')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition whitespace-nowrap ${
                selectedScope === 'CURRENT_CHAPTER'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
              title={currentChapter.title}
            >
              Ch. {currentChapter.chapterNumber}
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedScope('ENTIRE_BOOK')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition whitespace-nowrap ${
              selectedScope === 'ENTIRE_BOOK'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Whole Book
          </button>

          {selectedText && (
            <button
              type="button"
              onClick={() => setSelectedScope('SELECTED_TEXT')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                selectedScope === 'SELECTED_TEXT'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-600/40'
              }`}
            >
              <span>Selected Text</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedText('');
                  if (selectedScope === 'SELECTED_TEXT') setSelectedScope('CURRENT_PAGE');
                }}
                className="hover:text-rose-200 ml-0.5 text-xs font-bold"
                title="Clear selection"
              >
                ×
              </span>
            </button>
          )}
        </div>

        {/* Language Segmented Pill */}
        <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setLanguage('auto')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition ${
              language === 'auto' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ne')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition ${
              language === 'ne' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            नेपाली
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition ${
              language === 'en' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Selected Text Callout Bar */}
      {selectedText && selectedScope === 'SELECTED_TEXT' && (
        <div className="px-3 py-1 bg-amber-950/30 border-b border-amber-800/30 text-[10px] text-amber-200/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[9px]">Selection:</span>
            <span className="truncate italic text-amber-100">{selectedText}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedText('');
              setSelectedScope('CURRENT_PAGE');
            }}
            className="text-amber-400 hover:text-white text-xs font-bold px-1"
          >
            Clear
          </button>
        </div>
      )}

      {/* 3. Compact & Well-Organized Pedagogical Actions Deck */}
      <div className="bg-slate-900/40 border-b border-slate-800">
        <div className="px-3 py-1.5 flex items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveCategory('core');
                setActionsExpanded(true);
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition flex items-center gap-1 ${
                activeCategory === 'core' && actionsExpanded
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText size={11} className="text-teal-400" />
              <span>Core Teaching</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategory('activities');
                setActionsExpanded(true);
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition flex items-center gap-1 ${
                activeCategory === 'activities' && actionsExpanded
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb size={11} className="text-emerald-400" />
              <span>Activities & Tests</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategory('delivery');
                setActionsExpanded(true);
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition flex items-center gap-1 ${
                activeCategory === 'delivery' && actionsExpanded
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Presentation size={11} className="text-purple-400" />
              <span>Board & Delivery</span>
            </button>
          </div>

          {/* Toggle Expand/Collapse */}
          <button
            type="button"
            onClick={() => setActionsExpanded(!actionsExpanded)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition flex items-center gap-0.5 text-[10px]"
            title={actionsExpanded ? 'Minimize Actions' : 'Expand Actions'}
          >
            <span className="text-[9px] uppercase font-bold text-slate-500">
              {actionsExpanded ? 'Collapse' : 'Actions'}
            </span>
            {actionsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Action Buttons Row (Collapsible) */}
        {actionsExpanded && (
          <div className="px-3 pb-2.5 pt-0.5 grid grid-cols-4 gap-1.5 transition-all">
            {activeCategory === 'core' && (
              <>
                <button
                  type="button"
                  onClick={() => handleAsk('EXPLAIN_PAGE')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 hover:bg-teal-950/30 text-slate-200 flex flex-col items-center gap-1 text-center transition disabled:opacity-50 group"
                >
                  <FileText size={15} className="text-teal-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold leading-tight">Explain Page</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('SUMMARIZE_CHAPTER')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-950/30 text-slate-200 flex flex-col items-center gap-1 text-center transition disabled:opacity-50 group"
                >
                  <BookOpen size={15} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold leading-tight">Summarize Chapter</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('LESSON_PLAN')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-950/30 text-slate-200 flex flex-col items-center gap-1 text-center transition disabled:opacity-50 group"
                >
                  <FileCheck size={15} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold leading-tight">45m Lesson Plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('TEACH_CHAPTER')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 hover:bg-blue-950/30 text-slate-200 flex flex-col items-center gap-1 text-center transition disabled:opacity-50 group"
                >
                  <Compass size={15} className="text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold leading-tight">Teach Chapter</span>
                </button>
              </>
            )}

            {activeCategory === 'activities' && (
              <>
                <button
                  type="button"
                  onClick={() => handleAsk('EXAMPLES_ACTIVITIES')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 hover:bg-amber-950/30 text-slate-200 flex flex-col items-center gap-1 text-center transition disabled:opacity-50 group"
                >
                  <Lightbulb size={15} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold leading-tight">Worked Examples</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('QUESTION_BANK')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 hover:bg-sky-950/30 text-slate-200 flex flex-col items-center gap-1 text-center transition disabled:opacity-50 group"
                >
                  <HelpCircle size={15} className="text-sky-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold leading-tight">Bloom's Questions</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('QUICK_ANALOGY')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 hover:bg-teal-950/30 text-slate-200 flex flex-col items-center gap-1 text-center transition disabled:opacity-50 group"
                >
                  <Sparkles size={15} className="text-teal-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold leading-tight">Nepal Analogy</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('QUICK_CHECK')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-950/30 text-slate-200 flex flex-col items-center gap-1 text-center transition disabled:opacity-50 group"
                >
                  <HelpCircle size={15} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold leading-tight">3-Question Check</span>
                </button>
              </>
            )}

            {activeCategory === 'delivery' && (
              <>
                <button
                  type="button"
                  onClick={() => handleAsk('TEACHING_NOTES')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-950/30 text-slate-200 flex flex-col items-center gap-1 text-center transition disabled:opacity-50 group"
                >
                  <FileText size={15} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold leading-tight">Board Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('PRESENTATION')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:bg-purple-950/30 text-slate-200 flex flex-col items-center gap-1 text-center transition disabled:opacity-50 group"
                >
                  <Presentation size={15} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold leading-tight">Slide Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresentOnSmartBoard()}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 hover:bg-teal-950/30 text-slate-200 flex flex-col items-center gap-1 text-center transition group"
                >
                  <ExternalLink size={15} className="text-teal-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold leading-tight">Launch Board</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAsk('QUICK_SIMPLIFY')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-950/30 text-slate-200 flex flex-col items-center gap-1 text-center transition disabled:opacity-50 group"
                >
                  <Flame size={15} className="text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold leading-tight">Simplify</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 4. Messages Stream Viewport */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-3 shadow-lg shadow-teal-500/10">
              <Sparkles size={22} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Teacher AI Classroom Co-Pilot</h3>
            <p className="text-[11px] text-slate-400 max-w-[280px] leading-relaxed mb-5">
              Grounded in the official CDC curriculum. Select an action above or ask any question for Page {currentPage}.
            </p>

            <div className="text-[11px] space-y-1.5 w-full max-w-[300px]">
              <div
                onClick={() => handleAsk('EXPLAIN_PAGE')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 text-left cursor-pointer transition flex items-center justify-between text-slate-300 hover:text-white group"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-teal-400" />
                  <span className="font-medium">Explain Page {currentPage}</span>
                </div>
                <ArrowRight size={12} className="text-slate-500 group-hover:text-teal-400 transition" />
              </div>

              <div
                onClick={() => handleAsk('SUMMARIZE_CHAPTER')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-left cursor-pointer transition flex items-center justify-between text-slate-300 hover:text-white group"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-cyan-400" />
                  <span className="font-medium">
                    {currentChapter ? `Summarize Chapter ${currentChapter.chapterNumber}` : 'Summarize Current Chapter'}
                  </span>
                </div>
                <ArrowRight size={12} className="text-slate-500 group-hover:text-cyan-400 transition" />
              </div>

              <div
                onClick={() => handleAsk('LESSON_PLAN')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 text-left cursor-pointer transition flex items-center justify-between text-slate-300 hover:text-white group"
              >
                <div className="flex items-center gap-2">
                  <FileCheck size={14} className="text-emerald-400" />
                  <span className="font-medium">45-min Structured Lesson Plan</span>
                </div>
                <ArrowRight size={12} className="text-slate-500 group-hover:text-emerald-400 transition" />
              </div>

              <div
                onClick={() => handleAsk('QUESTION_BANK')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 text-left cursor-pointer transition flex items-center justify-between text-slate-300 hover:text-white group"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle size={14} className="text-sky-400" />
                  <span className="font-medium">Bloom's Taxonomy Questions</span>
                </div>
                <ArrowRight size={12} className="text-slate-500 group-hover:text-sky-400 transition" />
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
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-teal-600 to-teal-500 text-white px-3.5 py-2 text-xs shadow-md">
                  <div className="font-medium whitespace-pre-wrap">{cleanContent(msg.content)}</div>
                </div>
              ) : (
                <div
                  className={`w-full rounded-2xl rounded-tl-sm border text-slate-100 p-4 shadow-xl transition-all ${
                    showToClassMode
                      ? 'bg-slate-900 border-amber-500/40 text-sm'
                      : 'bg-slate-900/80 border-slate-800/80'
                  }`}
                >
                  {/* Assistant Message Header Actions */}
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5 font-bold text-teal-300">
                      <Sparkles size={13} className="text-teal-400" />
                      {msg.task ? msg.task.replace(/_/g, ' ') : 'Teaching Assistant'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[10px]"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePresentOnSmartBoard(msg.smartboardSummary)}
                        className="px-2 py-1 rounded-md bg-teal-950/80 border border-teal-600/40 hover:bg-teal-900/60 text-teal-300 transition flex items-center gap-1 text-[10px]"
                        title="Present on Smart Board"
                      >
                        <Presentation size={12} />
                        <span>Smart Board</span>
                      </button>
                    </div>
                  </div>

                  {/* Render Parsed Markdown Body */}
                  {renderFormatted(msg.content)}

                  {/* Smart Board Presentation Highlight Card if present */}
                  {msg.smartboardSummary && (
                    <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/30 text-teal-200 text-xs flex items-center justify-between gap-3 shadow-md">
                      <div>
                        <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider block mb-0.5">
                          🖥️ Smart Board Highlight
                        </span>
                        <p className="text-[11px] leading-snug text-teal-100">{cleanContent(msg.smartboardSummary)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePresentOnSmartBoard(msg.smartboardSummary)}
                        className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold flex-shrink-0 flex items-center gap-1 shadow transition"
                      >
                        <ExternalLink size={12} /> Project
                      </button>
                    </div>
                  )}

                  {/* Clickable Citations with Exact PDF Navigation */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-2.5 border-t border-slate-800">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Textbook Sources (Click to jump):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onJumpToPage(c.pageNumber)}
                            className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-teal-950/80 border border-slate-800 hover:border-teal-500/50 text-[10px] text-teal-300 font-medium flex items-center gap-1.5 transition group"
                            title={c.excerpt}
                          >
                            <FileText size={11} className="text-teal-400 group-hover:scale-110 transition-transform" />
                            <span>
                              Page {c.pageNumber}
                              {c.pageEnd && c.pageEnd !== c.pageNumber ? `–${c.pageEnd}` : ''}
                            </span>
                            {c.chapterTitle && (
                              <span className="text-slate-400 text-[9px] max-w-[90px] truncate">
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
                    <div className="mt-3.5 pt-2.5 border-t border-slate-800/60">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Suggested Next Steps:
                      </span>
                      <div className="space-y-1">
                        {msg.followUps.map((f, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAsk('CUSTOM_QUESTION', f)}
                            className="w-full text-left p-1.5 px-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white transition flex items-center justify-between group border border-slate-800/40"
                          >
                            <span className="truncate">▪ {f}</span>
                            <ArrowRight size={11} className="text-slate-500 group-hover:text-teal-400 ml-1.5 flex-shrink-0 transition" />
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
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs shadow-lg">
            <Loader2 className="animate-spin text-teal-400" size={16} />
            <span className="text-slate-300">Consulting official CDC textbook & generating pedagogical guidance…</span>
          </div>
        )}
      </div>

      {/* 5. Safe Chat Input Box */}
      <div className="p-3 bg-slate-950 border-t border-slate-800/80 shadow-2xl relative z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk('CUSTOM_QUESTION');
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask about Page ${currentPage} or teaching instructions…`}
            disabled={loading}
            className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 focus:border-teal-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:opacity-40 text-white font-medium transition shadow-md shadow-teal-600/30 flex-shrink-0"
            title="Send query"
          >
            <Send size={15} />
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 px-0.5">
          <span>Teacher-Only AI Assistant · Nepal CDC Curriculum</span>
          <span>Supports LaTeX Math $...$</span>
        </div>
      </div>
    </div>
  );
};
