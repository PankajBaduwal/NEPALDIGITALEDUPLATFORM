import React, { useRef, useState } from 'react';
import { Download, FileSpreadsheet, UploadCloud, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useDialogs } from '../common/Dialogs';

const COLUMNS = ['emisCode', 'name', 'nameNepali', 'type', 'province', 'district', 'localLevel', 'email', 'phone', 'adminUsername', 'adminPassword'];
const SAMPLE = '270010002,Shree Shanti Niketan Secondary School,श्री शान्ति निकेतन माध्यमिक विद्यालय,COMMUNITY,Bagmati Province,Bhaktapur,Madhyapur Thimi,info@shantiniketan.edu.np,01-6612345,admin_shanti,';

/** CSV parser that understands quoted fields, embedded commas and "" escapes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let q = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell.trim()); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell.trim()); cell = '';
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell.trim());
  if (row.some((x) => x !== '')) rows.push(row);
  return rows;
}

const esc = (v: any) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
function download(name: string, content: string) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const card: React.CSSProperties = { background: '#ffffff', padding: 24, borderRadius: 12, border: '1px solid #dcebe6' };
const btn = (bg: string, color = '#fff'): React.CSSProperties => ({ background: bg, color, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, border: bg === '#fff' ? '1px solid #cfdcd8' : 'none', cursor: 'pointer' });

export const BulkInstitutionImport: React.FC<{ onDone?: () => void }> = ({ onDone }) => {
  const { toast } = useDialogs();
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const template = () => download('institution-import-template.csv', COLUMNS.join(',') + '\n' + SAMPLE + '\n');

  const onFile = async (f?: File | null) => {
    if (!f) return;
    if (!/\.csv$/i.test(f.name) && f.type !== 'text/csv') return toast('Please choose a .csv file (use "Download template" to see the format).', 'error');
    if (f.size > 2 * 1024 * 1024) return toast('That file is larger than 2 MB.', 'error');
    setText(await f.text());
    setFileName(f.name);
    setPreview(null);
    setResult(null);
  };

  const validate = async () => {
    const rows = parseCsv(text);
    if (rows.length < 2) return toast('Add a header row and at least one data row, or upload a CSV file.', 'error');
    const headers = rows[0];
    const missing = ['emisCode', 'name', 'province', 'district', 'localLevel'].filter((h) => !headers.includes(h));
    if (missing.length) return toast(`The header row is missing: ${missing.join(', ')}`, 'error');
    const records = rows.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
    setBusy(true);
    try {
      setResult(null);
      setPreview(await api.post('/admin/institutions/import/validate', { institutions: records }));
    } catch (e: any) {
      toast(e.message || 'Validation failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const execute = async () => {
    if (!preview?.validRows?.length) return;
    setBusy(true);
    try {
      const r = await api.post<any>('/admin/institutions/import/execute', { institutions: preview.validRows });
      setResult(r);
      toast(`Import finished: ${r.successCount} created, ${r.failedCount} failed.`, r.failedCount ? 'warning' : 'success');
      onDone?.();
    } catch (e: any) {
      toast(e.message || 'Import failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const errorReport = () =>
    download(
      'import-errors.csv',
      ['row,emisCode,name,problems', ...(preview.invalidRows || []).map((r: any) => [r.rowNumber, esc(r.rowData?.emisCode), esc(r.rowData?.name), esc((r.errors || []).join('; '))].join(','))].join('\n')
    );
  const credentials = () =>
    download('new-admin-credentials.csv', ['emisCode,adminUsername,temporaryPassword', ...(result.created || []).map((c: any) => [c.emisCode, c.adminUsername, c.temporaryPassword || '(password you supplied)'].join(','))].join('\n'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={card}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Mass Institution Provisioning via CSV</h3>
        <p style={{ fontSize: 13, color: '#5f736f', marginBottom: 16 }}>
          Upload a CSV file or paste rows. Required columns: <code>emisCode, name, province, district, localLevel</code>. Leave <code>adminPassword</code> blank to generate a secure temporary password for each school admin.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <button type="button" onClick={template} style={btn('#fff', '#0e3e3b')}>
            <Download size={15} /> Download template
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} style={btn('#fff', '#0e3e3b')}>
            <UploadCloud size={15} /> Upload CSV file
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
          {fileName && (
            <span style={{ alignSelf: 'center', fontSize: 12, color: '#4b605b', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FileSpreadsheet size={14} /> {fileName}
            </span>
          )}
        </div>
        <textarea
          rows={7}
          value={text}
          aria-label="CSV data"
          onChange={(e) => { setText(e.target.value); setPreview(null); setResult(null); }}
          placeholder={COLUMNS.join(',') + '\n' + SAMPLE}
          style={{ width: '100%', padding: 12, border: '1px solid #cfdcd8', borderRadius: 8, fontFamily: 'monospace', fontSize: 12, marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" disabled={busy || !text.trim()} onClick={validate} style={{ ...btn('#117a6b'), opacity: busy || !text.trim() ? 0.6 : 1 }}>
            {busy && !preview ? 'Checking…' : 'Validate records'}
          </button>
          {preview && preview.validCount > 0 && !result && (
            <button type="button" disabled={busy} onClick={execute} style={{ ...btn('#16a34a'), opacity: busy ? 0.6 : 1 }}>
              {busy ? 'Importing…' : `Import ${preview.validCount} valid ${preview.validCount === 1 ? 'row' : 'rows'}`}
            </button>
          )}
        </div>
      </div>

      {preview && (
        <div style={card}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 14 }}>
            {[['Rows read', preview.totalRows, '#0e3e3b'], ['Ready to import', preview.validCount, '#16a34a'], ['Need fixing', preview.invalidCount, preview.invalidCount ? '#dc2626' : '#16a34a']].map(([k, v, c]) => (
              <div key={String(k)}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5f736f', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: String(c) }}>{String(v)}</div>
              </div>
            ))}
            {preview.invalidCount > 0 && (
              <button type="button" onClick={errorReport} style={{ ...btn('#fff', '#0e3e3b'), marginLeft: 'auto', alignSelf: 'center' }}>
                <Download size={15} /> Download error report
              </button>
            )}
          </div>
          {preview.invalidCount > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 12, textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#5f736f', borderBottom: '1px solid #dcebe6' }}>
                    <th style={{ padding: 8 }}>Row</th><th>EMIS</th><th>Institution</th><th>What to fix</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.invalidRows.map((r: any) => (
                    <tr key={r.rowNumber} style={{ borderBottom: '1px solid #ebf5f1', verticalAlign: 'top' }}>
                      <td style={{ padding: 8, fontWeight: 700 }}>{r.rowNumber}</td>
                      <td style={{ fontFamily: 'monospace' }}>{r.rowData?.emisCode || '—'}</td>
                      <td>{r.rowData?.name || '—'}</td>
                      <td>
                        {(r.errors || []).map((er: string, i: number) => (
                          <div key={i} style={{ color: '#b91c1c', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                            <XCircle size={13} style={{ marginTop: 2, flexShrink: 0 }} /> {er}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {preview.invalidCount === 0 && (
            <div style={{ color: '#0f5f55', fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
              <CheckCircle2 size={16} /> Every row passed validation.
            </div>
          )}
        </div>
      )}

      {result && (
        <div style={card}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>
            Import finished: {result.successCount} created{result.failedCount ? `, ${result.failedCount} failed` : ''}
          </div>
          {(result.errors || []).map((e: any, i: number) => (
            <div key={i} style={{ color: '#b91c1c', fontSize: 13 }}>
              {e.emisCode}: {e.message}
            </div>
          ))}
          {result.created?.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: '#5f736f', margin: '10px 0' }}>
                Temporary admin passwords are shown only now. Download them and share them securely; admins should change them at first sign-in.
              </p>
              <button type="button" onClick={credentials} style={btn('#117a6b')}>
                <Download size={15} /> Download admin credentials
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
