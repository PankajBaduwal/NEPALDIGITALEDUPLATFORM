import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';

/**
 * Non-blocking toasts and a promise-based confirm dialog, replacing window.alert / window.confirm.
 *   const { toast, confirm } = useDialogs();
 *   toast('Saved', 'success');
 *   if (!(await confirm('Delete this record?', { danger: true, confirmLabel: 'Delete' }))) return;
 */
type ToastKind = 'success' | 'error' | 'info' | 'warning';
interface ToastItem { id: number; message: string; kind: ToastKind }
interface ConfirmState { input?: { value: string }; message: string; title?: string; confirmLabel: string; cancelLabel: string; danger: boolean; resolve: (v: boolean) => void }
interface ConfirmOptions { defaultValue?: string; title?: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean }

interface Ctx {
  toast: (message: string, kind?: ToastKind) => void;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  /** Asks for a line of text. Resolves to the text, or null if cancelled. */
  prompt: (message: string, options?: ConfirmOptions) => Promise<string | null>;
}

const DialogsContext = createContext<Ctx | null>(null);

const ICON: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 size={18} color="#16a34a" />,
  error: <XCircle size={18} color="#dc2626" />,
  warning: <AlertTriangle size={18} color="#6d5bd0" />,
  info: <Info size={18} color="#117a6b" />,
};
const BORDER: Record<ToastKind, string> = { success: '#bbf7d0', error: '#fecaca', warning: '#ddd6fe', info: '#bfeede' };

/** Guess the tone of a message that used to go through alert() */
export const inferKind = (m: string): ToastKind =>
  /fail|error|could not|cannot|unable|invalid|denied|not found|required/i.test(m) ? 'error' : /success|created|saved|updated|approved|completed|deleted|activated|uploaded|assigned|reset/i.test(m) ? 'success' : 'info';

export const DialogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dialog, setDialog] = useState<ConfirmState | null>(null);
  const seq = useRef(0);

  const toast = useCallback((message: string, kind?: ToastKind) => {
    const id = ++seq.current;
    const k = kind || inferKind(message);
    setToasts((t) => [...t.slice(-3), { id, message: String(message), kind: k }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), k === 'error' ? 7000 : 4500);
  }, []);

  const confirm = useCallback(
    (message: string, options: ConfirmOptions = {}) =>
      new Promise<boolean>((resolve) => {
        setDialog({ message, title: options.title, confirmLabel: options.confirmLabel || 'Confirm', cancelLabel: options.cancelLabel || 'Cancel', danger: !!options.danger, resolve });
      }),
    []
  );

  const promptResolver = useRef<((v: string | null) => void) | null>(null);
  const [promptText, setPromptText] = useState('');
  const prompt = useCallback(
    (message: string, options: ConfirmOptions = {}) =>
      new Promise<string | null>((resolve) => {
        promptResolver.current = resolve;
        setPromptText(options.defaultValue || '');
        setDialog({ input: { value: options.defaultValue || '' }, message, title: options.title, confirmLabel: options.confirmLabel || 'OK', cancelLabel: options.cancelLabel || 'Cancel', danger: !!options.danger, resolve: () => {} });
      }),
    []
  );

  const close = (v: boolean) => {
    if (dialog?.input) {
      promptResolver.current?.(v ? promptText : null);
      promptResolver.current = null;
    } else {
      dialog?.resolve(v);
    }
    setDialog(null);
  };

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const value = useMemo(() => ({ toast, confirm, prompt }), [toast, confirm, prompt]);

  return (
    <DialogsContext.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" style={{ position: 'fixed', top: 16, right: 16, zIndex: 3000, display: 'flex', flexDirection: 'column', gap: 10, width: 'min(380px, calc(100vw - 32px))' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#fff', border: `1px solid ${BORDER[t.kind]}`, borderRadius: 12, padding: '12px 14px', boxShadow: '0 10px 30px rgba(14,62,59,0.14)', animation: 'dlg-in 0.2s ease-out' }}>
            <span style={{ marginTop: 1 }}>{ICON[t.kind]}</span>
            <div style={{ flex: 1, fontSize: 13, lineHeight: 1.45, color: '#0e3e3b', wordBreak: 'break-word' }}>{t.message}</div>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((l) => l.filter((x) => x.id !== t.id))} style={{ color: '#5f736f', padding: 2 }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      {dialog && (
        <div role="presentation" onClick={() => close(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(14,62,59,0.5)', zIndex: 3100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'dlg-fade 0.15s ease-out' }}>
          <div role="alertdialog" aria-modal="true" aria-label={dialog.title || 'Please confirm'} onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 22, width: 'min(440px, 100%)', boxShadow: '0 25px 60px rgba(14,62,59,0.3)', animation: 'dlg-in 0.18s ease-out' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0e3e3b', marginBottom: 8 }}>{dialog.title || 'Please confirm'}</div>
            <div style={{ fontSize: 14, color: '#4b605b', lineHeight: 1.5, marginBottom: dialog.input ? 10 : 20 }}>{dialog.message}</div>
            {dialog.input && (
              <input value={promptText} onChange={(e) => setPromptText(e.target.value)} autoFocus aria-label={dialog.message} style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: 8, fontSize: 14, marginBottom: 20 }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => close(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cfdcd8', background: '#fff', fontWeight: 600, fontSize: 13 }}>
                {dialog.cancelLabel}
              </button>
              <button type="button" autoFocus onClick={() => close(true)} style={{ padding: '8px 16px', borderRadius: 8, background: dialog.danger ? '#dc2626' : '#117a6b', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes dlg-in { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes dlg-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { [role="alertdialog"], [role="status"] > div { animation: none !important; } }
      `}</style>
    </DialogsContext.Provider>
  );
};

/** Falls back to the browser dialogs when used outside the provider, so nothing ever breaks. */
export const useDialogs = (): Ctx => {
  const ctx = useContext(DialogsContext);
  return (
    ctx || {
      toast: (m: string) => window.alert(m),
      confirm: async (m: string) => window.confirm(m),
      prompt: async (m: string) => window.prompt(m),
    }
  );
};
