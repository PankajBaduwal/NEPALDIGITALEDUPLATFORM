import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, Download } from 'lucide-react';
import { api } from '../../services/api';
import { useDialogs } from '../common/Dialogs';

interface Status { enabled: boolean; recoveryCodesLeft: number; enabledAt: string | null }
interface Setup { secret: string; otpauthUrl: string; qrDataUrl: string }

const card: React.CSSProperties = { background: '#fff', border: '1px solid #dcebe6', borderRadius: 12, padding: 24, maxWidth: 640 };
const input: React.CSSProperties = { padding: '10px 12px', border: '1px solid #cfdcd8', borderRadius: 8, fontSize: 18, letterSpacing: 3, width: 200, textAlign: 'center' };
const btn = (bg: string): React.CSSProperties => ({ background: bg, color: '#fff', padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' });

/** Turn authenticator-app (two-factor) sign-in on or off for the signed-in administrator. */
export const SecurityPanel: React.FC = () => {
  const { toast } = useDialogs();
  const [status, setStatus] = useState<Status | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setStatus(await api.get<Status>('/auth/2fa/status'));
    } catch (e: any) {
      toast(e.message || 'Could not load security settings', 'error');
    }
  };
  useEffect(() => { load(); }, []);

  const start = async () => {
    setBusy(true);
    try {
      setSetup(await api.post<Setup>('/auth/2fa/setup'));
      setCode('');
    } catch (e: any) {
      toast(e.message || 'Could not start setup', 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      const r = await api.post<{ recoveryCodes: string[] }>('/auth/2fa/enable', { code });
      setCodes(r.recoveryCodes);
      setSetup(null);
      setCode('');
      toast('Two-factor sign-in is now on.', 'success');
      load();
    } catch (e: any) {
      toast(e.message || 'That code is not correct', 'error');
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    try {
      await api.post('/auth/2fa/disable', { code });
      setCode('');
      setCodes(null);
      toast('Two-factor sign-in is off.', 'success');
      load();
    } catch (e: any) {
      toast(e.message || 'That code is not correct', 'error');
    } finally {
      setBusy(false);
    }
  };

  const saveCodes = () => {
    const blob = new Blob([`Nepal Education Platform recovery codes\nEach code works once.\n\n${(codes || []).join('\n')}\n`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!status) return <div style={card}>Loading…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          {status.enabled ? <ShieldCheck size={22} color="#16a34a" /> : <ShieldOff size={22} color="#6d5bd0" />}
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Two-factor sign-in is {status.enabled ? 'ON' : 'OFF'}</h3>
        </div>
        <p style={{ fontSize: 13, color: '#4b605b', marginBottom: 16 }}>
          With two-factor sign-in, a password alone is not enough. You also enter a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, Authy). This protects the platform if a password leaks.
        </p>

        {!status.enabled && !setup && (
          <button type="button" style={btn('#117a6b')} disabled={busy} onClick={start}>Turn on two-factor sign-in</button>
        )}

        {!status.enabled && setup && (
          <div>
            <ol style={{ fontSize: 13, color: '#2f4f4c', paddingLeft: 18, lineHeight: 1.7, marginBottom: 14 }}>
              <li>Open your authenticator app and add an account by scanning this QR code.</li>
              <li>Type the 6-digit code the app shows, then press Confirm.</li>
            </ol>
            <img src={setup.qrDataUrl} alt="QR code for your authenticator app" width={220} height={220} style={{ border: '1px solid #dcebe6', borderRadius: 8 }} />
            <div style={{ fontSize: 12, color: '#5f736f', margin: '8px 0 14px' }}>
              Can't scan? Enter this key manually: <code style={{ background: '#ebf5f1', padding: '2px 6px', borderRadius: 4, userSelect: 'all' }}>{setup.secret}</code>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" aria-label="6-digit code" style={input} />
              <button type="button" style={{ ...btn('#16a34a'), opacity: busy || !code.trim() ? 0.6 : 1 }} disabled={busy || !code.trim()} onClick={confirm}>Confirm</button>
              <button type="button" onClick={() => setSetup(null)} style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #cfdcd8', background: '#fff', fontSize: 13, fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        )}

        {status.enabled && (
          <div>
            <div style={{ fontSize: 13, color: '#4b605b', marginBottom: 14 }}>
              Recovery codes left: <b>{status.recoveryCodesLeft}</b>. To turn it off, enter a current code from your app.
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" aria-label="6-digit code" style={input} />
              <button type="button" style={{ ...btn('#dc2626'), opacity: busy || !code.trim() ? 0.6 : 1 }} disabled={busy || !code.trim()} onClick={turnOff}>Turn off</button>
            </div>
          </div>
        )}
      </div>

      {codes && (
        <div style={{ ...card, borderColor: '#ddd6fe', background: '#f5f3ff' }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Save your recovery codes now</div>
          <p style={{ fontSize: 13, color: '#3b2f8f', marginBottom: 12 }}>If you lose your phone, each of these codes lets you sign in once. They will not be shown again.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, fontFamily: 'monospace', fontSize: 14, marginBottom: 14 }}>
            {codes.map((c) => <span key={c} style={{ background: '#fff', border: '1px solid #ddd6fe', borderRadius: 6, padding: '6px 10px', userSelect: 'all' }}>{c}</span>)}
          </div>
          <button type="button" style={{ ...btn('#117a6b'), display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={saveCodes}><Download size={14} /> Download codes</button>
        </div>
      )}
    </div>
  );
};
