import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Plus, History, Trash2, BookOpen, Loader2, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { api } from '../../services/api';
import { RichText } from './RichText';
import { PdfReaderModal } from '../PdfReaderModal';

interface Citation {
  textbookTitle: string;
  grade: number;
  chapterTitle?: string;
  pageNumber: number;
  pageEnd?: number;
  excerpt: string;
  textbookId?: string;
  subjectName?: string;
}
interface Msg {
  id?: string;
  sender: 'USER' | 'ASSISTANT';
  content: string;
  citations?: Citation[];
  suggestedQuestions?: string[];
  groundedness?: string;
  error?: boolean;
}
interface Scope {
  label: string;
  role: string;
  grades: number[];
  mediums: string[];
  subjects: Array<{ key: string; name: string; grades: number[] }>;
  indexedChunks: number;
  aiConfigured: boolean;
}

const TASKS = [
  { v: 'ASK', l: 'Ask a question' },
  { v: 'EXPLAIN', l: 'Explain a concept' },
  { v: 'SUMMARIZE_CHAPTER', l: 'Summarise a chapter' },
  { v: 'TEACHING_NOTES', l: 'Teaching notes' },
  { v: 'EXAMPLES', l: 'Worked examples' },
  { v: 'PRACTICE_QUESTIONS', l: 'Practice questions' },
  { v: 'LESSON_OUTLINE', l: 'Lesson outline' },
  { v: 'REVISION', l: 'Revision sheet' },
  { v: 'ACTIVITIES', l: 'Classroom activities' },
  { v: 'DIAGRAM_OR_FORMULA', l: 'Explain diagram / formula' },
];

const STUDENT_SUGGESTIONS = ['Explain this chapter in simple words', 'Give me important questions from this unit', 'Solve an example step by step', 'Explain the main formula with an example'];
const TEACHER_SUGGESTIONS = ['Summarise the chapter for my class', 'Give 5 MCQs with answers', 'Suggest a classroom activity for this topic', 'List common student mistakes in this topic'];

const badge: Record<string, { text: string; bg: string; fg: string }> = {
  TEXTBOOK: { text: 'From your textbook', bg: '#dcfce7', fg: '#166534' },
  PARTIAL: { text: 'Partly from textbook', bg: '#f5f3ff', fg: '#3b2f8f' },
  GENERAL: { text: 'General explanation — not found in textbook', bg: '#e0e7ff', fg: '#3730a3' },
  NOT_FOUND: { text: 'Not found in textbook', bg: '#fee2e2', fg: '#991b1b' },
};

export const AIAssistantPanel: React.FC<{ role: 'STUDENT' | 'TEACHER'; title?: string }> = ({ role, title }) => {
  const [scope, setScope] = useState<Scope | null>(null);
  const [scopeError, setScopeError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'auto' | 'en' | 'ne'>('auto');
  const [subjectKey, setSubjectKey] = useState('');
  const [grade, setGrade] = useState<number | ''>('');
  const [task, setTask] = useState('ASK');
  const [allClasses, setAllClasses] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [reader, setReader] = useState<{ book: any; page: number } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      setHistory((await api.get<any[]>('/ai/conversations')) || []);
    } catch {
      /* history is optional */
    }
  }, []);

  useEffect(() => {
    api
      .get<Scope>('/ai/scope')
      .then(setScope)
      .catch((e) => setScopeError(e.message || 'AI assistant is not available for your account.'));
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput('');
    setMessages((m) => [...m, { sender: 'USER', content: q }]);
    setLoading(true);
    try {
      const res: any = await api.post('/ai/chat', {
        query: q,
        conversationId: conversationId || undefined,
        language,
        subjectKey: subjectKey || undefined,
        grade: role === 'TEACHER' && grade ? grade : undefined,
        allClasses: role === 'TEACHER' ? allClasses : undefined,
        task: role === 'TEACHER' ? task : undefined,
        mode: role === 'TEACHER' ? 'TEACHER_LESSON_PLAN' : 'STUDENT_TUTOR',
      });
      setConversationId(res.conversationId);
      setMessages((m) => [...m, { id: res.assistantMessageId, sender: 'ASSISTANT', content: res.content, citations: res.citations, suggestedQuestions: res.suggestedQuestions, groundedness: res.groundedness }]);
      loadHistory();
    } catch (e: any) {
      setMessages((m) => [...m, { sender: 'ASSISTANT', content: e.message || 'Something went wrong. Please try again.', error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (id: string) => {
    try {
      const r: any = await api.get(`/ai/conversations/${id}`);
      setConversationId(id);
      setMessages((r.messages || []).map((m: any) => ({ id: m.id, sender: m.sender, content: m.content, citations: m.citations, suggestedQuestions: m.suggestedQuestions })));
      setShowHistory(false);
    } catch {
      /* ignore */
    }
  };

  const newChat = () => {
    setConversationId(null);
    setMessages([]);
    setShowHistory(false);
  };

  const clearChat = async () => {
    if (conversationId) {
      try {
        await api.delete(`/ai/conversations/${conversationId}`);
      } catch {
        /* ignore */
      }
    }
    newChat();
    loadHistory();
  };

  const rate = (id: string | undefined, rating: 'POSITIVE' | 'NEGATIVE') => {
    if (id) api.post('/ai/feedback', { messageId: id, rating }).catch(() => {});
  };

  const openSource = (c: Citation) => {
    if (!c.textbookId) return;
    setReader({ book: { id: c.textbookId, title: c.textbookTitle, gradeNumber: c.grade || undefined, medium: 'BOTH' }, page: c.pageNumber });
  };

  const subjects = scope?.subjects || [];
  const visibleSubjects = role === 'TEACHER' && grade ? subjects.filter((s) => s.grades.includes(Number(grade))) : subjects;
  const suggestions = role === 'TEACHER' ? TEACHER_SUGGESTIONS : STUDENT_SUGGESTIONS;

  const sel: React.CSSProperties = { padding: '7px 10px', border: '1px solid #cfdcd8', borderRadius: 8, fontSize: 12.5, background: '#fff', fontWeight: 600, color: '#2f4f4c' };

  if (scopeError) {
    return (
      <div style={{ background: '#fff', border: '1px solid #dcebe6', borderRadius: 16, padding: 24, display: 'flex', gap: 10, alignItems: 'center', color: '#991b1b' }}>
        <AlertTriangle size={18} /> {scopeError}
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #dcebe6', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', minHeight: 560, maxWidth: 980 }}>
      {/* header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #eef2f7', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#117a6b' }}>
            <Sparkles size={20} />
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0e3e3b' }}>{title || (role === 'TEACHER' ? 'AI Teaching Assistant' : 'AI Learning Assistant')}</h3>
          </div>
          <div style={{ fontSize: 12, color: '#5f736f', marginTop: 3 }}>
            {scope ? (
              <>
                Searching: <strong style={{ color: '#0e3e3b' }}>{scope.label}</strong> textbooks
                {scope.indexedChunks === 0 && <span style={{ color: '#4c3fa8' }}> — your textbooks are still being indexed; answers may be general until then.</span>}
              </>
            ) : (
              'Loading your class…'
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowHistory((v) => !v)} style={{ ...sel, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <History size={14} /> History
          </button>
          <button onClick={newChat} style={{ ...sel, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <Plus size={14} /> New
          </button>
          <button onClick={clearChat} disabled={!messages.length} style={{ ...sel, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* controls */}
      <div style={{ padding: '10px 20px', display: 'flex', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid #ebf5f1', background: '#f4faf8' }}>
        {role === 'TEACHER' && scope && (
          <select value={grade} onChange={(e) => { setGrade(e.target.value ? Number(e.target.value) : ''); setSubjectKey(''); }} style={sel} aria-label="Class">
            <option value="">All my classes</option>
            {scope.grades.map((g) => <option key={g} value={g}>Class {g}</option>)}
          </select>
        )}
        <select value={subjectKey} onChange={(e) => setSubjectKey(e.target.value)} style={sel} aria-label="Subject">
          <option value="">{role === 'TEACHER' ? 'All my subjects' : 'All my subjects'}</option>
          {visibleSubjects.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
        </select>
        {role === 'TEACHER' && (
          <select value={task} onChange={(e) => setTask(e.target.value)} style={sel} aria-label="Task">
            {TASKS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        )}
        <select value={language} onChange={(e) => setLanguage(e.target.value as any)} style={sel} aria-label="Answer language">
          <option value="auto">Answer language: Auto</option>
          <option value="en">English</option>
          <option value="ne">नेपाली</option>
        </select>
        {role === 'TEACHER' && (
          <label style={{ ...sel, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={allClasses} onChange={(e) => setAllClasses(e.target.checked)} /> Search other classes
          </label>
        )}
      </div>

      {showHistory && (
        <div style={{ padding: '10px 20px', borderBottom: '1px solid #ebf5f1', maxHeight: 180, overflowY: 'auto', background: '#fff' }}>
          {history.length === 0 ? (
            <div style={{ fontSize: 12, color: '#8da19d' }}>No earlier conversations.</div>
          ) : (
            history.map((h) => (
              <button key={h._id || h.id} onClick={() => openConversation(h._id || h.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', border: 'none', background: (h._id || h.id) === conversationId ? '#e6f7f0' : 'transparent', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#2f4f4c' }}>
                {h.title || 'Conversation'} <span style={{ color: '#8da19d', fontSize: 11 }}>· {new Date(h.updatedAt).toLocaleDateString()}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* conversation */}
      <div style={{ flex: 1, padding: 20, overflowY: 'auto', maxHeight: 520, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#5f736f', maxWidth: 460 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Sparkles size={24} color="#117a6b" />
            </div>
            <div style={{ fontWeight: 800, color: '#0e3e3b', fontSize: 15 }}>{role === 'TEACHER' ? 'Plan and teach from the textbook' : 'Ask anything from your textbook'}</div>
            <div style={{ fontSize: 13, margin: '6px 0 14px' }}>Answers come from your official CDC textbooks, with page references. Ask in English or नेपाली.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {suggestions.map((s) => (
                <button key={s} onClick={() => ask(s)} style={{ padding: '7px 12px', border: '1px solid #daf5ec', background: '#effaf6', color: '#0f5f55', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'USER' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: m.sender === 'USER' ? '78%' : '92%', background: m.sender === 'USER' ? '#117a6b' : m.error ? '#fef2f2' : '#f4faf8', color: m.sender === 'USER' ? '#fff' : '#134744', border: m.sender === 'USER' ? 'none' : `1px solid ${m.error ? '#fecaca' : '#dcebe6'}`, borderRadius: 14, padding: '12px 16px', fontSize: 14, lineHeight: 1.65 }}>
              {m.sender === 'USER' ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
              ) : (
                <>
                  {m.groundedness && badge[m.groundedness] && (
                    <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: badge[m.groundedness].bg, color: badge[m.groundedness].fg, marginBottom: 8 }}>{badge[m.groundedness].text}</span>
                  )}
                  <RichText text={m.content} />
                  {m.citations && m.citations.length > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #cfdcd8' }}>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: '#4b605b', marginBottom: 6 }}>Textbook sources</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {m.citations.map((c, k) => (
                          <button key={k} onClick={() => openSource(c)} disabled={!c.textbookId} title={c.excerpt} style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', padding: '7px 10px', background: '#fff', border: '1px solid #dcebe6', borderRadius: 8, fontSize: 12, cursor: c.textbookId ? 'pointer' : 'default', color: '#134744' }}>
                            <span style={{ fontWeight: 800, color: '#117a6b' }}>[{k + 1}]</span>
                            <BookOpen size={14} color="#2563eb" />
                            <span style={{ flex: 1 }}>{c.textbookTitle}{c.chapterTitle ? ` · ${c.chapterTitle}` : ''}</span>
                            <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>p. {c.pageNumber}{c.pageEnd && c.pageEnd !== c.pageNumber ? `–${c.pageEnd}` : ''}</span>
                            {c.textbookId && <span style={{ color: '#2563eb', fontWeight: 700 }}>Open page</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {m.suggestedQuestions.map((s, k) => (
                        <button key={k} onClick={() => ask(s)} style={{ padding: '5px 10px', border: '1px solid #daf5ec', background: '#effaf6', color: '#0f5f55', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{s}</button>
                      ))}
                    </div>
                  )}
                  {!m.error && m.id && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button aria-label="Helpful" onClick={() => rate(m.id, 'POSITIVE')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8da19d' }}><ThumbsUp size={14} /></button>
                      <button aria-label="Not helpful" onClick={() => rate(m.id, 'NEGATIVE')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8da19d' }}><ThumbsDown size={14} /></button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5f736f', fontSize: 13 }}>
            <Loader2 size={16} className="ui-spin" style={{ animation: 'ui-spin 1s linear infinite' }} /> Reading your textbook…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* composer */}
      <form onSubmit={(e) => { e.preventDefault(); ask(input); }} style={{ padding: '12px 20px 18px', borderTop: '1px solid #eef2f7', display: 'flex', gap: 10 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input); } }}
          rows={2}
          maxLength={2000}
          placeholder={role === 'TEACHER' ? 'Ask about a topic, or request notes, questions, activities…' : 'Type your question — English or नेपाली…'}
          style={{ flex: 1, padding: '10px 14px', border: '1px solid #cfdcd8', borderRadius: 12, fontSize: 14, fontFamily: 'inherit', resize: 'none' }}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ padding: '0 20px', background: '#117a6b', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: loading || !input.trim() ? 0.55 : 1 }}>
          <Send size={16} /> Send
        </button>
      </form>

      <PdfReaderModal isOpen={!!reader} onClose={() => setReader(null)} textbook={reader?.book || null} initialPage={reader?.page} />
      <style>{`@keyframes ui-spin{to{transform:rotate(360deg)}} .ai-rich p{margin:0 0 8px} .ai-rich h2,.ai-rich h3,.ai-rich h4{margin:12px 0 6px;font-weight:800;color:#0e3e3b} .ai-rich ul,.ai-rich ol{margin:4px 0 10px;padding-left:22px} .ai-rich code{background:#eef2f7;padding:1px 5px;border-radius:4px;font-size:.92em} .ai-rich table{border-collapse:collapse;margin:8px 0;font-size:13px} .ai-rich th,.ai-rich td{border:1px solid #dcebe6;padding:5px 9px} .ai-rich th{background:#ebf5f1}`}</style>
    </div>
  );
};
