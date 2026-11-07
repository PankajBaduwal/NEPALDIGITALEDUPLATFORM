import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  X,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Check,
  Loader2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkStudentImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [csvText, setCsvText] = useState('');
  const [validating, setValidating] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [validationPreview, setValidationPreview] = useState<{
    totalRows: number;
    validRowsCount: number;
    invalidRowsCount: number;
    errors: Array<{ row: number; field?: string; value?: any; message: string }>;
    previewData: any[];
    validRows: any[];
  } | null>(null);

  const [importResult, setImportResult] = useState<{
    jobCode: string;
    successCount: number;
    failedCount: number;
    students: any[];
  } | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvContent =
      'admissionNumber,rollNumber,fullName,fullNameNepali,className,sectionName,gender,guardianName,guardianPhone,guardianRelation\n' +
      'ADM-2081-001,1,Aarav Sharma,आरव शर्मा,Class 10,A,MALE,Kishor Sharma,9841000001,Father\n' +
      'ADM-2081-002,2,Bipana Chaudhary,बिपना चौधरी,Class 10,A,FEMALE,Sundar Chaudhary,9841000002,Father\n' +
      'ADM-2081-003,3,Chiranjibi Pokharel,चिरन्जीवी पोखरेल,Class 10,B,MALE,Ganesh Pokharel,9841000003,Father\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'students_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvText = (text: string) => {
    const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = parts[idx] || '';
      });
      rows.push(rowObj);
    }
    return rows;
  };

  const handleValidate = async () => {
    if (!csvText.trim()) {
      setError('Please paste CSV student records.');
      return;
    }
    setError(null);
    setValidating(true);
    try {
      const rows = parseCsvText(csvText);
      if (rows.length === 0) {
        throw new Error('No valid student rows found in CSV text.');
      }
      const preview = await api.post<any>('/school-admin/students/import/validate', { students: rows });
      setValidationPreview(preview);
    } catch (err: any) {
      setError(err.message || 'Validation failed. Check Class and Section existence in school.');
      setValidationPreview(null);
    } finally {
      setValidating(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!validationPreview || validationPreview.validRows.length === 0) return;
    setExecuting(true);
    setError(null);
    try {
      const result = await api.post<any>('/school-admin/students/import/execute', {
        students: validationPreview.validRows,
      });
      setImportResult(result);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error executing student enrollment batch.');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(14, 62, 59, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #dcebe6',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4faf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                Bulk Student Import & Enrollment Engine
              </h3>
              <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                Batch create student login credentials and enroll into class sections
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f736f' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#991b1b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {importResult ? (
            /* SUCCESS STATE */
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0e3e3b', marginBottom: '4px' }}>
                Students Successfully Enrolled!
              </h3>
              <p style={{ fontSize: '13px', color: '#5f736f', marginBottom: '20px' }}>
                Enrolled <strong>{importResult.successCount}</strong> students under job reference <code>{importResult.jobCode}</code>.
              </p>

              <div style={{ background: '#f4faf8', border: '1px solid #dcebe6', borderRadius: '10px', padding: '16px', textAlign: 'left', maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Enrolled Students (one-time passwords — save them now)
                </div>
                {importResult.students.map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #ebf5f1' }}>
                    <span style={{ fontWeight: '600' }}>{s.fullName} ({s.className} - {s.sectionName})</span>
                    <span style={{ fontFamily: 'monospace', color: '#16a34a' }}>Roll: {s.rollNumber} • {s.username} / {(s as any).tempPassword}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const rows: string[][] = [['Name', 'Username', 'One-time password'], ...(importResult.students as any[]).map((s) => [s.fullName, s.username, s.tempPassword])];
                  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
                  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'new_account_credentials.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{ marginBottom: '16px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #cfdcd8', background: '#ffffff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Download credentials (CSV)
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#0e3e3b' }}>
                  Paste CSV Student Enrollment Data:
                </label>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#16a34a',
                    background: '#effaf6',
                    border: '1px solid #bbf7d0',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} /> Download Sample CSV Template
                </button>
              </div>

              <textarea
                rows={7}
                placeholder="admissionNumber,rollNumber,fullName,fullNameNepali,className,sectionName,gender,guardianName,guardianPhone,guardianRelation&#10;ADM-2081-001,1,Aarav Sharma,आरव शर्मा,Class 10,A,MALE,Kishor Sharma,9841000001,Father"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cfdcd8', fontSize: '12px', fontFamily: 'monospace', marginBottom: '16px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={validating || !csvText.trim()}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    background: '#16a34a',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '13px',
                    border: 'none',
                    cursor: validating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {validating ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                  Validate Students & Section Placements
                </button>
              </div>

              {/* Preview */}
              {validationPreview && (
                <div style={{ background: '#f4faf8', border: '1px solid #dcebe6', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px' }}>
                    <div>Total Students: <strong>{validationPreview.totalRows}</strong></div>
                    <div style={{ color: '#16a34a' }}>Valid to Enroll: <strong>{validationPreview.validRowsCount}</strong></div>
                    {validationPreview.invalidRowsCount > 0 && (
                      <div style={{ color: '#dc2626' }}>Invalid Rows: <strong>{validationPreview.invalidRowsCount}</strong></div>
                    )}
                  </div>

                  {validationPreview.errors.length > 0 && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px', marginBottom: '12px', maxHeight: '100px', overflowY: 'auto', fontSize: '12px', color: '#991b1b' }}>
                      {validationPreview.errors.map((e, idx) => (
                        <div key={idx}>Row {e.row}: {e.message} {e.value ? `(${e.value})` : ''}</div>
                      ))}
                    </div>
                  )}

                  {validationPreview.previewData.length > 0 && (
                    <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', fontSize: '11px', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ color: '#5f736f', borderBottom: '1px solid #cfdcd8' }}>
                            <th style={{ padding: '4px' }}>Adm No.</th>
                            <th style={{ padding: '4px' }}>Roll</th>
                            <th style={{ padding: '4px' }}>Student Name</th>
                            <th style={{ padding: '4px' }}>Class - Sec</th>
                            <th style={{ padding: '4px' }}>Guardian</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationPreview.previewData.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #ebf5f1' }}>
                              <td style={{ padding: '4px', fontFamily: 'monospace' }}>{row.admissionNumber}</td>
                              <td style={{ padding: '4px' }}>{row.rollNumber}</td>
                              <td style={{ padding: '4px', fontWeight: '600' }}>{row.fullName}</td>
                              <td style={{ padding: '4px' }}>{row.className} - {row.sectionName}</td>
                              <td style={{ padding: '4px' }}>{row.guardianName} ({row.guardianPhone})</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4faf8' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
            {importResult ? 'Close' : 'Cancel'}
          </button>

          {!importResult && validationPreview && validationPreview.validRowsCount > 0 && (
            <button
              onClick={handleExecuteImport}
              disabled={executing}
              style={{
                padding: '8px 22px',
                background: '#16a34a',
                color: '#fff',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: executing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {executing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Execute Enrollment ({validationPreview.validRowsCount} Students)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

