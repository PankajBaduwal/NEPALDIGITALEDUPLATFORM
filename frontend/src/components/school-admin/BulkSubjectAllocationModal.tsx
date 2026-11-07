import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  X,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkSubjectAllocationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Map of centralSubjectId -> teacherId
  const [allocationsMap, setAllocationsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [classRes, teacherRes] = await Promise.all([
        api.get<any[]>('/school-admin/classes'),
        api.get<any[]>('/school-admin/teachers'),
      ]);
      const clsList = Array.isArray(classRes) ? classRes : [];
      setClasses(clsList);
      setTeachers(Array.isArray(teacherRes) ? teacherRes : []);

      if (clsList.length > 0) {
        setSelectedClassId(clsList[0].id || clsList[0]._id);
      }
    } catch (err) {
      console.error('Failed to load classes and teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedClassId) return;
    const cls = classes.find((c) => (c.id || c._id) === selectedClassId);
    if (cls && cls.sections) {
      setSections(cls.sections);
      if (cls.sections.length > 0) {
        setSelectedSectionId(cls.sections[0].id || cls.sections[0]._id);
      }
    }
    // Load subjects for this class
    loadClassSubjects(cls?.gradeNumber || 10);
  }, [selectedClassId, classes]);

  const loadClassSubjects = async (gradeNumber: number) => {
    try {
      const data = await api.get<any[]>(`/curriculum/subjects?gradeNumber=${gradeNumber}`);
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load curriculum subjects for grade:', gradeNumber);
    }
  };

  const handleTeacherChange = (subjectId: string, teacherId: string) => {
    setAllocationsMap((prev) => ({
      ...prev,
      [subjectId]: teacherId,
    }));
  };

  const handleSaveAllocations = async () => {
    if (!selectedSectionId) {
      setError('Please select a class and section.');
      return;
    }
    const allocationsToSave = Object.entries(allocationsMap)
      .filter(([_, tId]) => tId)
      .map(([sId, tId]) => ({
        sectionId: selectedSectionId,
        centralSubjectId: sId,
        teacherId: tId,
      }));

    if (allocationsToSave.length === 0) {
      setError('Assign at least one subject to a teacher before saving.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.post<any>('/school-admin/allocations/bulk', {
        allocations: allocationsToSave,
      });
      setSuccessMsg(`Successfully allocated ${res.allocatedCount} subjects to faculty members!`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to bulk allocate subjects.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

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
          maxWidth: '820px',
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
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                Bulk Subject & Faculty Allocation Matrix
              </h3>
              <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                Map curriculum subjects to teachers across class sections in one operation
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

          {successMsg && (
            <div style={{ background: '#effaf6', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', color: '#166534', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Selectors Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                Select Class:
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px', background: '#fff' }}
              >
                {classes.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name} ({c.stream || 'GENERAL'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                Select Section:
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px', background: '#fff' }}
              >
                {sections.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    Section {s.name} ({s.medium || 'ENGLISH'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Allocation Matrix Table */}
          <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #dcebe6', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#5f736f', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Subject Code</th>
                  <th style={{ padding: '10px 14px' }}>Subject Name</th>
                  <th style={{ padding: '10px 14px' }}>Credit Hours</th>
                  <th style={{ padding: '10px 14px' }}>Assigned Faculty Teacher</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#5f736f' }}>
                      No subjects configured for this grade level.
                    </td>
                  </tr>
                ) : (
                  subjects.map((subj) => {
                    const sId = subj.id || subj._id;
                    const assignedTeacherId = allocationsMap[sId] || '';
                    return (
                      <tr key={sId} style={{ borderBottom: '1px solid #ebf5f1' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: '700', color: '#2563eb' }}>
                          {subj.code}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: '600' }}>{subj.name}</div>
                          {subj.nameNepali && <div style={{ fontSize: '11px', color: '#5f736f' }}>{subj.nameNepali}</div>}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '12px' }}>
                          {subj.creditHours || 4} hrs/week
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <select
                            value={assignedTeacherId}
                            onChange={(e) => handleTeacherChange(sId, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: `1.5px solid ${assignedTeacherId ? '#2563eb' : '#cfdcd8'}`,
                              background: assignedTeacherId ? '#eff6ff' : '#fff',
                              fontSize: '12px',
                              fontWeight: assignedTeacherId ? '600' : 'normal',
                            }}
                          >
                            <option value="">-- Choose Teacher --</option>
                            {teachers.map((t) => (
                              <option key={t.id || t._id} value={t.id || t._id}>
                                {t.fullName} ({t.metadata?.specialization || t.role})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4faf8' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
            Close
          </button>

          <button
            onClick={handleSaveAllocations}
            disabled={saving || subjects.length === 0}
            style={{
              padding: '8px 22px',
              background: '#2563eb',
              color: '#fff',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '700',
              fontSize: '13px',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save & Publish Allocations
          </button>
        </div>
      </div>
    </div>
  );
};

