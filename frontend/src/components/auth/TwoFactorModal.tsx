import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { UserSession } from '../../context/AuthContext';

/** Second sign-in step for accounts that turned on authenticator-app (two-factor) sign-in. */
export const TwoFactorModal: React.FC<{ challengeToken: string; verify: (token: string, code: string) => Promise<UserSession>; onSuccess: (user: UserSession) => void; onCancel: () => void }> = ({ challengeToken, verify, onSuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError('');
    try {
      onSuccess(await verify(challengeToken, code.trim()));
    } catch (err: any) {
      setError(err.message || 'That code did not work.');
      setBusy(false);
      if (err.code === 'CHALLENGE_EXPIRED') setTimeout(onCancel, 1800);
    }
  };

  return (
    <div role="presentation" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 3200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-label="Two-factor sign-in" style={{ background: '#fff', borderRadius: 16, padding: 24, width: 'min(400px, 100%)', boxShadow: '0 25px 60px rgba(15,23,42,0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <ShieldCheck size={22} color="#059669" />
          <div style={{ fontWeight: 800, fontSize: 17, color: '#0f172a' }}>Two-factor sign-in</div>
        </div>
        <p style={{ fontSize: 13, color: '#475569', margin: '0 0 14px' }}>Enter the 6-digit code from your authenticator app, or one of your recovery codes.</p>
        <input
          ref={ref}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label="Authenticator or recovery code"
          placeholder="123456"
          style={{ width: '100%', padding: '12px 14px', fontSize: 20, letterSpacing: 4, textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: 10 }}
        />
        {error && <div role="alert" style={{ color: '#b91c1c', fontSize: 13, marginTop: 10 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" onClick={onCancel} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, fontSize: 13 }}>Cancel</button>
          <button type="submit" disabled={busy || !code.trim()} style={{ padding: '9px 18px', borderRadius: 8, background: '#059669', color: '#fff', fontWeight: 700, fontSize: 13, opacity: busy || !code.trim() ? 0.6 : 1 }}>
            {busy ? 'Checking…' : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  );
};
