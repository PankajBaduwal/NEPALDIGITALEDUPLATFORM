import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

/** Always-visible bar while a Super Admin is viewing the platform as a school administrator. */
export const ImpersonationBanner: React.FC = () => {
  const read = () => {
    try { return JSON.parse(localStorage.getItem('nepal_edu_impersonation') || 'null'); } catch { return null; }
  };
  const [info, setInfo] = useState<any>(read);
  const [now, setNow] = useState(Date.now());

  const exit = () => {
    try {
      const b = JSON.parse(localStorage.getItem('nepal_edu_admin_backup') || 'null');
      if (b?.token) localStorage.setItem('nepal_edu_token', b.token);
      if (b?.user) localStorage.setItem('nepal_edu_user', b.user);
    } catch { /* fall through to a plain sign-out below */ }
    localStorage.removeItem('nepal_edu_impersonation');
    localStorage.removeItem('nepal_edu_admin_backup');
    window.location.href = '/super-admin';
  };

  useEffect(() => {
    if (!info) return;
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, [info]);
  useEffect(() => { if (info && now > info.until) exit(); }, [now, info]); // the view token lasts one hour

  if (!info) return null;
  const mins = Math.max(0, Math.ceil((info.until - now) / 60_000));
  return (
    <div role="status" style={{ position: 'sticky', top: 0, zIndex: 3300, background: '#3b2f8f', color: '#fff', padding: '8px 16px', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', fontSize: 13 }}>
      <Eye size={16} />
      <span>
        Viewing <b>{info.school}</b> as <b>{info.as}</b> ({String(info.role).replace('_', ' ').toLowerCase()}). Changes are logged under your name. {mins} min left.
      </span>
      <button type="button" onClick={exit} style={{ background: '#fff', color: '#3b2f8f', padding: '4px 14px', borderRadius: 6, fontWeight: 800, fontSize: 12 }}>
        Exit and return to Super Admin
      </button>
    </div>
  );
};
