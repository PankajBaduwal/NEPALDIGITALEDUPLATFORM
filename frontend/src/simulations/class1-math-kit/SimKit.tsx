import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Star, RotateCcw, Trophy } from 'lucide-react';
import { AudioController } from '../audio/AudioController';
import { api } from '../../services/api';
import { FONT_NP, toNp } from './nepali';

/**
 * The shared "play frame" for the Class 1 Mathematics simulations:
 * header, speaking mascot, Learn / Play / Challenge tabs, stars, friendly feedback and a quiz panel.
 * Every simulation only supplies its own 3D scene and its own controls.
 */
export type Mode = 'LEARN' | 'PLAY' | 'CHALLENGE';
export interface KitConfig { code: string; chapter: number; titleNp: string; titleEn: string }

const PRAISE: [string, string][] = [['शाबास!', 'Well done!'], ['धेरै राम्रो!', 'Great job!'], ['वाह! सही!', 'Wow! Correct!'], ['अति उत्तम!', 'Excellent!'], ['तिमी जान्ने रहेछौ!', 'You know it!']];
const TRY: [string, string][] = [['फेरि प्रयास गरौँ!', "Let's try again!"], ['ध्यान दिएर हेरौँ!', 'Look carefully!'], ['अलि फेरि सोचौँ!', 'Think once more!']];

export function useSimKit(cfg: KitConfig) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [lang, setLangState] = useState<'ne' | 'en'>('en');
  const [muted, setMutedState] = useState(false);
  const [mode, setMode] = useState<Mode>('LEARN');
  const [stars, setStars] = useState(0);
  const [bubble, setBubble] = useState<{ np: string; en: string }>({ np: '', en: '' });
  const [toast, setToast] = useState<{ ok: boolean; np: string; en: string } | null>(null);
  const langRef = useRef(lang);
  const toastTimer = useRef<number | undefined>(undefined);
  langRef.current = lang;

  const t = useCallback((np: string, en: string) => (langRef.current === 'ne' ? np : en), []);
  const say = useCallback((np: string, en: string, speak = true) => {
    setBubble({ np, en });
    if (speak) AudioController.speak(langRef.current === 'ne' ? np : en, langRef.current);
  }, []);
  const flash = useCallback((ok: boolean, np: string, en: string) => {
    setToast({ ok, np, en });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1500);
  }, []);
  const good = useCallback((np?: string, en?: string) => {
    AudioController.playSuccess();
    const p = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    flash(true, np || p[0], en || p[1]);
    AudioController.speak(langRef.current === 'ne' ? np || p[0] : en || p[1], langRef.current);
  }, [flash]);
  const oops = useCallback((np?: string, en?: string) => {
    AudioController.playBoop();
    const p = TRY[Math.floor(Math.random() * TRY.length)];
    flash(false, np || p[0], en || p[1]);
  }, [flash]);
  const tap = useCallback(() => AudioController.playPop(), []);
  const star = useCallback(() => setStars((s) => s + 1), []);
  const setLang = useCallback((_l: 'ne' | 'en') => { langRef.current = 'en'; setLangState('en'); }, []); // English only
  const setMuted = useCallback((m: boolean) => { AudioController.setMuted(m); setMutedState(m); }, []);
  const finish = useCallback((score: number, total: number) => {
    AudioController.playCelebration();
    api.post(`/simulation-activity/simulations/${cfg.code}/progress`, {
      gradeLevel: 1, subjectCode: 'MATH', chapterNumber: cfg.chapter, simulationTitle: cfg.titleEn,
      assessmentScore: score, totalQuestions: total, percentage: Math.round((score / Math.max(1, total)) * 100), isCompleted: true,
    }).catch(() => undefined);
  }, [cfg.code, cfg.chapter, cfg.titleEn]);

  useEffect(() => () => { window.clearTimeout(toastTimer.current); AudioController.stopSpeech(); }, []);

  return { cfg, stageRef, lang, setLang, muted, setMuted, mode, setMode, stars, star, bubble, toast, t, say, flash, good, oops, tap, finish };
}
export type SimKit = ReturnType<typeof useSimKit>;

const css = `
@keyframes simPop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes simShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
@keyframes simBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.sim-btn{border:none;cursor:pointer;font-family:${FONT_NP};font-weight:800;border-radius:16px;transition:transform .12s, box-shadow .12s;touch-action:manipulation}
.sim-btn:active{transform:scale(.95)}
.sim-btn:disabled{opacity:.5;cursor:not-allowed}
`;

export const bigBtn = (bg: string, fg = '#fff'): React.CSSProperties => ({ background: bg, color: fg, padding: '12px 20px', fontSize: 18, minHeight: 56, boxShadow: '0 4px 0 rgba(0,0,0,.18)' });

interface FrameProps {
  kit: SimKit;
  onBack: () => void;
  /** controls shown under the 3D stage */
  panel?: React.ReactNode;
  /** big text over the stage (an equation, a number…) */
  hud?: React.ReactNode;
  /** which tabs to show */
  modes?: Mode[];
  /** extra header content */
  extra?: React.ReactNode;
}
const MODE_LABEL: Record<Mode, [string, string, string]> = { LEARN: ['सिकौँ', 'Learn', '📖'], PLAY: ['खेलौँ', 'Play', '🎈'], CHALLENGE: ['चुनौती', 'Challenge', '🏆'] };

export const SimFrame: React.FC<FrameProps> = ({ kit, onBack, panel, hud, modes = ['LEARN', 'PLAY', 'CHALLENGE'], extra }) => {
  const { lang, bubble, toast } = kit;
  const L = (np: string, en: string) => (lang === 'ne' ? np : en);
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '88vh', display: 'flex', flexDirection: 'column', background: '#F5F7F8', fontFamily: FONT_NP, color: '#263746' }}>
      <style>{css}</style>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', background: '#142D4E', color: '#fff', borderBottom: '3px solid #167C80', flexWrap: 'wrap' }}>
        <button className="sim-btn" onClick={onBack} style={{ background: 'rgba(255,255,255,.14)', color: '#fff', border: '1px solid rgba(255,255,255,.2)', padding: '7px 13px', borderRadius: 10, fontSize: 13.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={15} /> {L('फर्कनुहोस्', 'Back')}</button>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 11, color: '#9FCBCD', fontWeight: 700 }}>{L('कक्षा 1 • गणित • अध्याय', 'Class 1 • Maths • Chapter')} {lang === 'ne' ? toNp(kit.cfg.chapter) : kit.cfg.chapter}</div>
          <div style={{ fontSize: 17.5, fontWeight: 800, lineHeight: 1.25 }}>{lang === 'ne' ? kit.cfg.titleNp : kit.cfg.titleEn}</div>
        </div>
        {extra}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(217,164,65,.2)', border: '1px solid rgba(217,164,65,.45)', color: '#F3E2B5', padding: '6px 12px', borderRadius: 999, fontWeight: 800, fontSize: 13.5 }}><Star size={15} fill="#D9A441" color="#D9A441" /> {lang === 'ne' ? toNp(kit.stars) : kit.stars}</div>
        
        <button className="sim-btn" aria-label="sound" onClick={() => kit.setMuted(!kit.muted)} style={{ background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.18)', color: '#fff', padding: '7px 10px', borderRadius: 10 }}>{kit.muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
      </header>

      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {modes.map((m) => {
            const [np, en] = MODE_LABEL[m];
            const on = kit.mode === m;
            return (
              <button key={m} className="sim-btn" onClick={() => kit.setMode(m)} style={{ padding: '7px 15px', fontSize: 13.5, borderRadius: 9, border: on ? '1px solid #142D4E' : '1px solid #CBD5E1', background: on ? '#142D4E' : '#F8FAFC', color: on ? '#fff' : '#334155' }}>{L(np, en)}</button>
            );
          })}
        </div>
        {(bubble.np || bubble.en) && (
          <button type="button" onClick={() => kit.say(bubble.np, bubble.en)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E8F1F1', border: '1px solid #CFE3E4', borderRadius: 10, padding: '6px 12px', fontSize: 13, fontWeight: 700, color: '#142D4E', cursor: 'pointer' }}>
            <Volume2 size={15} color="#167C80" />
            <span>{L(bubble.np, bubble.en)}</span>
          </button>
        )}
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: 340, margin: '14px 20px 0', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 4px 16px -6px rgba(15,23,42,.06)', overflow: 'hidden' }}>
        <div ref={kit.stageRef} style={{ position: 'absolute', inset: 0 }} />
        {hud && <div style={{ position: 'absolute', top: 12, right: 14, textAlign: 'right', pointerEvents: 'none' }}>{hud}</div>}
        {toast && (
          <div style={{ position: 'absolute', left: '50%', top: 18, transform: 'translateX(-50%)', background: toast.ok ? '#167C80' : '#D97706', color: '#fff', padding: '10px 24px', borderRadius: 999, fontSize: 16, fontWeight: 800, boxShadow: '0 8px 24px rgba(15,23,42,.2)', animation: toast.ok ? 'simPop .25s' : 'simShake .35s', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            {L(toast.np, toast.en)}
          </div>
        )}
      </div>

      {panel && (
        <div style={{ margin: '12px 20px 16px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '14px 18px', boxShadow: '0 2px 6px rgba(15,23,42,.04)' }}>
          {panel}
        </div>
      )}
    </div>
  );
};

/* ───────── challenge quiz ───────── */
export interface QuizOption { key: string; label: React.ReactNode }
export interface QuizQuestion { np: string; en: string; options: QuizOption[]; answer: string }
interface QuizProps { kit: SimKit; questions: QuizQuestion[]; resetKey?: number | string; onAsk?: (q: QuizQuestion, index: number) => void }

export const QuizPanel: React.FC<QuizProps> = ({ kit, questions, resetKey, onAsk }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const askRef = useRef(onAsk);
  askRef.current = onAsk;
  const lock = useRef(false);
  const q = questions[idx];

  useEffect(() => { setIdx(0); setScore(0); setTries(0); setPicked(null); setReveal(null); setDone(false); lock.current = false; }, [resetKey]);
  useEffect(() => {
    if (done || !q) return;
    askRef.current?.(q, idx);
    kit.say(q.np, q.en);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done, resetKey]);

  const next = (gained: boolean) => {
    const ns = score + (gained ? 1 : 0);
    window.setTimeout(() => {
      lock.current = false;
      setPicked(null); setReveal(null); setTries(0);
      if (idx + 1 >= questions.length) { setScore(ns); setDone(true); kit.finish(ns, questions.length); } else { setScore(ns); setIdx(idx + 1); }
    }, 1000);
  };
  const choose = (key: string) => {
    if (lock.current || !q) return;
    setPicked(key);
    if (key === q.answer) {
      lock.current = true; kit.good(); kit.star(); next(true);
    } else if (tries >= 1) {
      lock.current = true; kit.oops(); setReveal(q.answer); next(false);
    } else {
      setTries(1); kit.oops();
      window.setTimeout(() => setPicked(null), 600);
    }
  };

  const L = (np: string, en: string) => kit.t(np, en);
  if (done) {
    const stars = Math.round((score / Math.max(1, questions.length)) * 3);
    return (
      <div style={{ textAlign: 'center', padding: 8, animation: 'simPop .4s' }}>
        <Trophy size={40} color="#f59e0b" />
        <div style={{ fontSize: 22, fontWeight: 900, margin: '4px 0' }}>{L('सबै सकियो!', 'All done!')} {'⭐'.repeat(Math.max(1, stars))}</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{L(`${toNp(questions.length)} मध्ये ${toNp(score)} सही`, `${score} of ${questions.length} correct`)}</div>
        <button className="sim-btn" style={bigBtn('#0ea5e9')} onClick={() => { setIdx(0); setScore(0); setDone(false); }}><RotateCcw size={16} style={{ verticalAlign: -2 }} /> {L('फेरि खेलौँ', 'Play again')}</button>
      </div>
    );
  }
  if (!q) return null;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#64748b' }}>{L('प्रश्न', 'Question')} {kit.lang === 'ne' ? toNp(idx + 1) : idx + 1}/{kit.lang === 'ne' ? toNp(questions.length) : questions.length}</div>
        <div style={{ fontSize: 20, fontWeight: 900, flex: 1, minWidth: 200 }}>{L(q.np, q.en)}</div>
        <button className="sim-btn" style={{ background: '#e0f2fe', color: '#075985', padding: '6px 12px', fontSize: 14 }} onClick={() => kit.say(q.np, q.en)}>🔊</button>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {q.options.map((o) => {
          const isPicked = picked === o.key;
          const isAns = reveal === o.key;
          const ok = isAns || (isPicked && o.key === q.answer);
          const bad = isPicked && o.key !== q.answer;
          const bg = ok ? '#167C80' : bad ? '#DC2626' : '#FFFFFF';
          const fg = ok || bad ? '#FFFFFF' : '#142D4E';
          const border = ok ? '1.5px solid #167C80' : bad ? '1.5px solid #DC2626' : '1.5px solid #CBD5E1';
          return (
            <button key={o.key} className="sim-btn" onClick={() => choose(o.key)} style={{ padding: '10px 20px', minHeight: 48, minWidth: 88, borderRadius: 10, background: bg, color: fg, border, fontSize: 18, fontWeight: 800, animation: bad ? 'simShake .35s' : undefined, boxShadow: '0 1px 3px rgba(15,23,42,.06)' }}>{o.label}</button>
          );
        })}
      </div>
    </div>
  );
};

/** small helper for rows of control buttons under the stage */
export const Controls: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);
export const CBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { color?: string }> = ({ color = '#0ea5e9', children, style, ...rest }) => (
  <button className="sim-btn" {...rest} style={{ ...bigBtn(color), ...style }}>{children}</button>
);
