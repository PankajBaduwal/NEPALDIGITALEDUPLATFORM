import React, { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

export const readLogoFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return reject(new Error('Use a PNG, JPG or WebP image.'));
    if (file.size > 2 * 1024 * 1024) return reject(new Error('Logo must be smaller than 2 MB.'));
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Could not read the file.'));
    r.readAsDataURL(file);
  });

interface Props {
  /** Current logo: a saved path (/uploads/...) or a freshly chosen data URL. */
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
}

export const LogoUpload: React.FC<Props> = ({ value, onChange, label = 'Institution logo' }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');
  const pick = async (f?: File | null) => {
    if (!f) return;
    try { setErr(''); onChange(await readLogoFile(f)); } catch (e: any) { setErr(e.message); }
  };
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0e3e3b', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 84, height: 84, borderRadius: 14, border: '1.5px dashed #bfeede', background: '#f8fcfb', display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {value ? <img src={value} alt="Logo preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <ImagePlus size={26} color="#8da19d" />}
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
          <button type="button" onClick={() => ref.current?.click()} style={{ padding: '8px 14px', borderRadius: 8, background: '#0f4c4a', color: '#fff', border: 0, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
            {value ? 'Change logo' : 'Upload logo'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 0, color: '#b91c1c', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
              <Trash2 size={13} /> Remove
            </button>
          )}
          <span style={{ fontSize: 11, color: '#6f817d' }}>PNG, JPG or WebP · up to 2 MB</span>
          {err && <span style={{ fontSize: 11.5, color: '#b91c1c' }}>{err}</span>}
        </div>
      </div>
    </div>
  );
};
