import React from 'react';

/** Small shared building blocks for the academic screens, matching the dashboards' light theme. */

export const colors = {
  text: '#0e3e3b',
  muted: '#5f736f',
  border: '#dcebe6',
  soft: '#f4faf8',
  brand: '#117a6b',
  brandSoft: '#e6f7f0',
  danger: '#b91c1c',
  dangerSoft: '#fef2f2',
  warn: '#4c3fa8',
  warnSoft: '#f5f3ff',
  info: '#2563eb',
  infoSoft: '#eff6ff',
};

export const Card: React.FC<{ title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, actions, children, style }) => (
  <div style={{ background: '#ffffff', border: `1px solid ${colors.border}`, borderRadius: 12, padding: 20, marginBottom: 20, ...style }}>
    {(title || actions) && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {title && <h3 style={{ fontSize: 15, fontWeight: 800, color: colors.text, margin: 0 }}>{title}</h3>}
        {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
      </div>
    )}
    {children}
  </div>
);

type Tone = 'brand' | 'neutral' | 'danger' | 'warn' | 'info';
const tones: Record<Tone, [string, string]> = {
  brand: [colors.brand, colors.brandSoft],
  neutral: [colors.muted, colors.soft],
  danger: [colors.danger, colors.dangerSoft],
  warn: [colors.warn, colors.warnSoft],
  info: [colors.info, colors.infoSoft],
};

export const Badge: React.FC<{ tone?: Tone; children: React.ReactNode; title?: string }> = ({ tone = 'neutral', children, title }) => (
  <span title={title} style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: tones[tone][0], background: tones[tone][1], padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
    {children}
  </span>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger'; small?: boolean }> = ({ variant = 'secondary', small, style, ...rest }) => {
  const palette =
    variant === 'primary'
      ? { background: colors.brand, color: '#fff', border: `1px solid ${colors.brand}` }
      : variant === 'danger'
        ? { background: '#fff', color: colors.danger, border: '1px solid #fecaca' }
        : { background: '#fff', color: colors.text, border: '1px solid #cfdcd8' };
  return (
    <button
      {...rest}
      style={{
        ...palette,
        padding: small ? '4px 10px' : '8px 14px',
        fontSize: small ? 12 : 13,
        fontWeight: 700,
        borderRadius: 6,
        cursor: rest.disabled ? 'not-allowed' : 'pointer',
        opacity: rest.disabled ? 0.55 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        ...style,
      }}
    />
  );
};

export const Field: React.FC<{ label: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ label, children, style }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700, color: colors.muted, ...style }}>
    {label}
    {children}
  </label>
);

export const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid #cfdcd8',
  borderRadius: 6,
  fontSize: 13,
  color: colors.text,
  background: '#fff',
  minWidth: 0,
};

export const Notice: React.FC<{ tone?: Tone; children: React.ReactNode }> = ({ tone = 'info', children }) => (
  <div style={{ border: `1px solid ${tones[tone][1] === colors.soft ? colors.border : tones[tone][0] + '33'}`, background: tones[tone][1], color: tones[tone][0], borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
    {children}
  </div>
);

export const Table: React.FC<{ head: React.ReactNode[]; children: React.ReactNode }> = ({ head, children }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={i} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${colors.border}`, color: colors.muted, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export const td: React.CSSProperties = { padding: '9px 10px', borderBottom: `1px solid #ebf5f1`, verticalAlign: 'top', color: colors.text };

export const mediumLabel = (m?: string | null) => (m === 'ENGLISH' ? 'English' : m === 'NEPALI' ? 'Nepali' : m === 'BOTH' ? 'Both media' : 'Not set');
export const dayLabel = (d: string) => d.charAt(0) + d.slice(1).toLowerCase();
export const classLabel = (c: { gradeNumber?: number; stream?: string; name?: string } | null | undefined) =>
  c ? `Class ${c.gradeNumber}${c.stream && c.stream !== 'GENERAL' ? ` ${c.stream.charAt(0)}${c.stream.slice(1).toLowerCase()}` : ''}` : '';
