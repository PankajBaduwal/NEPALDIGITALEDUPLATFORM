import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePersistentState } from '../../hooks/usePersistentState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Award,
  Users,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Calendar,
  BookOpen,
  Filter,
  Eye,
  Check,
  Send,
} from 'lucide-react';
import { ClassTeacherTools } from './ClassTeacherTools';
import { StudentDossierModal } from '../teacher/StudentDossierModal';
import { ReportCardSheet, useReportCardStyles } from './ReportCardSheet';

interface ClassTeacherSectionPanelProps {
  sectionId: string;
  sectionName?: string;
  className?: string;
  readOnly?: boolean;
}

export const ClassTeacherSectionPanel: React.FC<ClassTeacherSectionPanelProps> = ({
  sectionId,
  sectionName = '',
  className = '',
  readOnly = false,
}) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = usePersistentState<'CONSOLIDATED' | 'REPORT_CARDS' | 'ROSTER' | 'TOOLS'>(`classteacher.${sectionId}.subtab`, 'CONSOLIDATED');
  const [dossierId, setDossierId] = useState<string | null>(null);
  // Absence notices and ledger exports belong to the designated class teacher only (the panel is read-only for principals)
  const showTools = !readOnly && user?.role === 'TEACHER';
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [consolidatedData, setConsolidatedData] = useState<any>(null);
  const [selectedExam, setSelectedExam] = usePersistentState<string>(`classteacher.${sectionId}.exam`, '');
  const [selectedStudentId, setSelectedStudentId] = usePersistentState<string>(`classteacher.${sectionId}.student`, '');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkPrintMode, setIsBulkPrintMode] = useState(false);
  // report cards queued for printing (rendered in a print-only layer, one A4 page each)
  const [printList, setPrintList] = useState<any[] | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  useReportCardStyles();

  useEffect(() => {
    if (sectionId) {
      loadSectionData();
    }
  }, [sectionId, selectedExam]);

  const loadSectionData = async () => {
    setLoading(true);
    try {
      const [ovRes, resRes] = await Promise.all([
        api.get(`/class-teacher/section/${sectionId}/overview`).catch(() => null),
        api.get(`/class-teacher/section/${sectionId}/consolidated-results${selectedExam ? `?examinationId=${encodeURIComponent(selectedExam)}` : ''}`).catch(() => null),
      ]);
      if (ovRes) setOverviewData(ovRes);
      if (resRes) {
        setConsolidatedData(resRes);
        if (resRes.consolidatedStudents?.length > 0 && !selectedStudentId) {
          setSelectedStudentId(resRes.consolidatedStudents[0].studentId);
        }
      }
    } catch (e) {
      console.error('Failed to load class teacher section data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishResults = async () => {
    if (!consolidatedData?.assessments?.length) {
      alert('No assessments available to publish.');
      return;
    }
    const isTeacher = user?.role === 'TEACHER';
    const confirmPub = window.confirm(isTeacher
      ? `Submit the selected section results for Principal review for ${sectionName}?`
      : `Approve and publish the reviewed results for ${sectionName}? Students will be able to view them.`
    );
    if (!confirmPub) return;

    setIsPublishing(true);
    try {
      if (isTeacher) {
        // Only SUBMITTED assessments can be marked REVIEWED; drafts still need the subject teacher
        const reviewable = consolidatedData.assessments.filter((a: any) => a.workflowStatus === 'SUBMITTED');
        const stillDraft = consolidatedData.assessments.filter((a: any) => a.workflowStatus === 'DRAFT').length;
        if (reviewable.length === 0) {
          alert(
            stillDraft > 0
              ? `Nothing to review yet: ${stillDraft} assessment(s) are still drafts waiting for the subject teacher to submit.`
              : 'Nothing to review: all assessments are already reviewed or beyond review.'
          );
          return;
        }
        for (const assessment of reviewable) {
          await api.patch(`/assessment/items/${assessment._id || assessment.id}/workflow`, {
            targetStatus: 'REVIEWED',
            reason: `Section results reviewed by class teacher for ${displaySectionName}`,
          });
        }
        if (stillDraft > 0) {
          alert(`${reviewable.length} assessment(s) sent for review. ${stillDraft} are still drafts and were not included.`);
        }
      } else {
        const toPublish = consolidatedData.assessments.filter((assessment: any) => assessment.workflowStatus !== 'PUBLISHED');
        for (const assessment of toPublish) {
          if (assessment.workflowStatus === 'REVIEWED') {
            await api.patch(`/assessment/items/${assessment._id || assessment.id}/workflow`, {
              targetStatus: 'APPROVED',
              reason: `Section results approved by ${user?.role}`,
            });
          } else if (assessment.workflowStatus !== 'APPROVED') {
            throw new Error(`Assessment "${assessment.name}" must be submitted and reviewed before approval.`);
          }
        }
        if (toPublish.length > 0) {
          await api.post(`/class-teacher/section/${sectionId}/publish-results`, {
            assessmentIds: toPublish.map((assessment: any) => assessment._id || assessment.id),
          });
        }
      }
      setPublishSuccess(true);
      await loadSectionData();
      setTimeout(() => setPublishSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to publish section results');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadReportCard = async (studentId: string, studentName: string) => {
    try {
      await api.downloadBlob(
        `/analytics/export/report-card/${studentId}/${activeExamId || 'latest'}`,
        `ReportCard_${studentName.replace(/\s+/g, '_')}_${displaySectionName}.pdf`
      );
    } catch (err: any) {
      alert(err.message || 'Report card PDF generation failed');
    }
  };

  const handleExportCsv = async () => {
    try {
      await api.downloadBlob(
        `/analytics/export/results-csv/${sectionId}/${activeExamId || 'latest'}`,
        `Consolidated_Marks_${displaySectionName.replace(/\s+/g, '_')}.csv`
      );
    } catch (err: any) {
      alert(err.message || 'CSV export failed');
    }
  };

  const studentsList = consolidatedData?.consolidatedStudents || [];
  const assessmentsList = consolidatedData?.assessments || [];
  const displaySectionName = overviewData?.section?.name || sectionName;
  const displayClassName = overviewData?.section?.classId?.name || className;
  const filteredStudents = studentsList.filter((s: any) =>
    (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(s.rollNumber || '').includes(searchTerm)
  );

  const selectedStudent = studentsList.find((s: any) => s.studentId === selectedStudentId) || studentsList[0];
  const activeExamId: string = selectedExam || consolidatedData?.examination?.id || '';
  const examOptions: any[] = consolidatedData?.examinations || [];
  const activeExam = consolidatedData?.examination;
  const sectionTitle = /^section/i.test(String(displaySectionName)) ? String(displaySectionName) : `Section ${displaySectionName}`;

  const startPrint = (list: any[]) => {
    if (!list.length) return;
    setPrintList(list);
  };
  // print once the print layer is on the page; clear it afterwards
  useEffect(() => {
    if (!printList) return;
    const done = () => setPrintList(null);
    window.addEventListener('afterprint', done, { once: true });
    const id = window.setTimeout(() => window.print(), 400);
    return () => { window.clearTimeout(id); window.removeEventListener('afterprint', done); };
  }, [printList]);
  // fit the on-screen A4 preview to the available width
  useEffect(() => {
    const el = previewRef.current;
    if (!el || activeSubTab !== 'REPORT_CARDS') return;
    const fit = () => setPreviewZoom(Math.max(0.3, Math.min(1, (el.clientWidth - 4) / 794)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeSubTab, selectedStudent]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── HEADER BANNER ────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f5f55 0%, #117a6b 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 4px 15px rgba(6, 78, 59, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <ShieldCheck size={32} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>
                {displayClassName} — {sectionTitle}
              </h2>
              <span
                style={{
                  background: '#1fb589',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Official Class Teacher Console
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#bfeede' }}>
              Supervisory academic records, CDC 2078 terminal marks, attendance verification & official report card generation.
            </p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#bfeede', fontWeight: '600' }}>Enrolled Students</div>
            <div style={{ fontSize: '18px', fontWeight: '800' }}>{overviewData?.studentsCount ?? studentsList.length}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#bfeede', fontWeight: '600' }}>CDC Subjects</div>
            <div style={{ fontSize: '18px', fontWeight: '800' }}>{overviewData?.subjectsCount ?? assessmentsList.length}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#bfeede', fontWeight: '600' }}>Avg Attendance</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#2fcf9c' }}>{overviewData?.averageAttendance ?? 'No attendance data'}</div>
          </div>
        </div>
      </div>

      {/* ── ACADEMIC INTEGRITY NOTICE ────────────────────────────── */}
      <div
        style={{
          background: '#f4faf8',
          border: '1px solid #dcebe6',
          borderLeft: '4px solid #117a6b',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#2f4f4c',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} color="#117a6b" />
          <span>
            <strong>Academic Integrity Rule:</strong> Class Teachers supervise section-wide performance and report cards.
            Subject marks are authored directly by assigned subject teachers and cannot be overwritten here.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#5f736f' }}>Examination:</span>
          <select
            value={activeExamId}
            onChange={(e) => setSelectedExam(e.target.value)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #cfdcd8',
              fontSize: '12px',
              fontWeight: '700',
              background: '#ffffff',
              color: '#0e3e3b',
            }}
          >
            {examOptions.length === 0 && <option value="">No examinations yet</option>}
            {examOptions.map((e: any) => (
              <option key={e.id} value={e.id}>{e.name}{e.isPublished ? '' : ' (not published)'}</option>
            ))}
          </select>
        </div>
      </div>

      {publishSuccess && (
        <div
          style={{
            background: '#e6f7f0',
            border: '1px solid #7fe3c2',
            color: '#0f4c4a',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          <CheckCircle2 size={18} color="#117a6b" />
          Terminal exam results for {sectionName} have been verified and published to student dashboards!
        </div>
      )}

      {/* ── TABS NAVIGATION ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #dcebe6', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveSubTab('CONSOLIDATED')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeSubTab === 'CONSOLIDATED' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'CONSOLIDATED' ? '#117a6b' : '#5f736f',
            borderBottom: activeSubTab === 'CONSOLIDATED' ? '3px solid #117a6b' : '3px solid transparent',
            marginBottom: '-2px',
          }}
        >
          <Award size={16} />
          Consolidated Marksheet (CDC 2078)
        </button>

        <button
          onClick={() => setActiveSubTab('REPORT_CARDS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeSubTab === 'REPORT_CARDS' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'REPORT_CARDS' ? '#117a6b' : '#5f736f',
            borderBottom: activeSubTab === 'REPORT_CARDS' ? '3px solid #117a6b' : '3px solid transparent',
            marginBottom: '-2px',
          }}
        >
          <Printer size={16} />
          Official Report Cards (Print & PDF)
        </button>

        <button
          onClick={() => setActiveSubTab('ROSTER')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeSubTab === 'ROSTER' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'ROSTER' ? '#117a6b' : '#5f736f',
            borderBottom: activeSubTab === 'ROSTER' ? '3px solid #117a6b' : '3px solid transparent',
            marginBottom: '-2px',
          }}
        >
          <Users size={16} />
          Section Roster & Attendance
        </button>
        {showTools && (
          <button
            onClick={() => setActiveSubTab('TOOLS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              background: activeSubTab === 'TOOLS' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'TOOLS' ? '#117a6b' : '#5f736f',
              borderBottom: activeSubTab === 'TOOLS' ? '3px solid #117a6b' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            <Send size={16} />
            Notices & Export
          </button>
        )}
      </div>

      {showTools && activeSubTab === 'TOOLS' && <ClassTeacherTools sectionId={sectionId} />}
      {dossierId && <StudentDossierModal studentId={dossierId} sectionId={sectionId} onClose={() => setDossierId(null)} />}

      {/* ── TAB 1: CONSOLIDATED MARKSHEET ────────────────────────── */}
      {activeSubTab === 'CONSOLIDATED' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="#8da19d" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search by student name or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 34px',
                  borderRadius: '8px',
                  border: '1px solid #cfdcd8',
                  fontSize: '12px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={handleExportCsv}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: '#ebf5f1',
                  color: '#2f4f4c',
                  border: '1px solid #cfdcd8',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                <Download size={14} /> Export CSV
              </button>

              {!readOnly && (
                <button
                  onClick={handlePublishResults}
                  disabled={isPublishing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: consolidatedData?.isPublished ? '#117a6b' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: isPublishing ? 'not-allowed' : 'pointer',
                  }}
                >
                  <CheckCircle2 size={14} />
                  {isPublishing
                    ? (user?.role === 'TEACHER' ? 'Submitting...' : 'Publishing...')
                    : consolidatedData?.isPublished
                      ? 'Results Published ✓'
                      : user?.role === 'TEACHER'
                        ? 'Submit Results for Approval'
                        : 'Approve & Publish Results'}
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f4faf8', borderBottom: '2px solid #dcebe6', color: '#4b605b' }}>
                  <th style={{ padding: '10px 12px', fontWeight: '700', width: '50px' }}>Roll</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700' }}>Student Name</th>
                  {assessmentsList.map((asm: any) => (
                    <th key={asm._id || asm.id} style={{ padding: '10px 8px', fontWeight: '700', textAlign: 'center' }}>
                      <div>{asm.centralSubjectId?.name || 'Subject'}</div>
                      <div style={{ fontSize: '10px', color: '#8da19d' }}>Max {asm.totalMarks || 100}</div>
                    </th>
                  ))}
                  <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>Total Marks</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>%</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>CDC Grade</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>GPA</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>Report</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st: any, idx: number) => (
                  <tr
                    key={st.studentId || idx}
                    style={{
                      borderBottom: '1px solid #ebf5f1',
                      background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0e3e3b' }}>{st.rollNumber}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: '700', color: '#0e3e3b' }}>{st.fullName}</div>
                      {st.fullNameNepali && <div style={{ fontSize: '11px', color: '#5f736f' }}>{st.fullNameNepali}</div>}
                    </td>
                    {st.subjectMarks?.map((sm: any, sIdx: number) => (
                      <td key={sIdx} style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {sm.marksObtained !== null ? (
                          <div>
                            <span style={{ fontWeight: '700', color: '#0e3e3b' }}>{sm.marksObtained}</span>
                            <span
                              style={{
                                marginLeft: '4px',
                                fontSize: '10px',
                                fontWeight: '800',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: sm.grade === 'A+' || sm.grade === 'A' ? '#e6f7f0' : '#ede9fe',
                                color: sm.grade === 'A+' || sm.grade === 'A' ? '#0f5f55' : '#4c3fa8',
                              }}
                            >
                              {sm.grade}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#cfdcd8' }}>—</span>
                        )}
                      </td>
                    ))}
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#0e3e3b' }}>
                      {st.totalMarksObtained} <span style={{ fontSize: '10px', color: '#8da19d' }}>/ {st.totalMaxMarks}</span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', color: '#117a6b' }}>
                      {st.percentage}%
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          background: st.overallGrade === 'A+' || st.overallGrade === 'A' ? '#e6f7f0' : '#ede9fe',
                          color: st.overallGrade === 'A+' || st.overallGrade === 'A' ? '#0f4c4a' : '#3b2f8f',
                        }}
                      >
                        {st.overallGrade}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#0e3e3b' }}>
                      {st.overallGpa ? st.overallGpa.toFixed(2) : '3.60'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setSelectedStudentId(st.studentId);
                          setActiveSubTab('REPORT_CARDS');
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cfdcd8',
                          background: '#ffffff',
                          color: '#2563eb',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: OFFICIAL CDC REPORT CARDS ─────────────────────── */}
      {activeSubTab === 'REPORT_CARDS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Bar */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '14px 20px',
              border: '1px solid #dcebe6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#4b605b' }}>Select Student:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cfdcd8',
                  fontSize: '13px',
                  fontWeight: '600',
                  minWidth: '240px',
                }}
              >
                {studentsList.map((s: any) => (
                  <option key={s.studentId} value={s.studentId}>
                    Roll {s.rollNumber}: {s.fullName} ({s.complete ? `${s.overallGrade} • GPA ${Number(s.overallGpa).toFixed(2)}` : 'marks pending'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => startPrint(selectedStudent ? [selectedStudent] : [])}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#f4faf8',
                  color: '#0e3e3b',
                  border: '1px solid #cfdcd8',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                <Printer size={15} /> Print Report Card
              </button>

              <button
                onClick={() => startPrint(studentsList)}
                title="Print every student's report card, one A4 page each"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#f4faf8',
                  color: '#0e3e3b',
                  border: '1px solid #cfdcd8',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                <Printer size={15} /> Print All ({studentsList.length})
              </button>

              <button
                onClick={() => handleDownloadReportCard(selectedStudent?.studentId, selectedStudent?.fullName || 'Student')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#117a6b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                <Download size={15} /> Download PDF (Official Seal)
              </button>
            </div>
          </div>

          {/* Report card preview (A4). The same sheet is what gets printed. */}
          {activeExam && !activeExam.isPublished && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: '10px', padding: '9px 14px', fontSize: '12px', fontWeight: 600 }}>
              Results for “{activeExam.name}” are not published yet — report cards are marked PROVISIONAL.
            </div>
          )}
          {selectedStudent && activeExam ? (
            <div ref={previewRef} style={{ width: '100%', overflowX: 'hidden' }}>
              <div style={{ zoom: previewZoom, width: 794, margin: '0 auto', boxShadow: '0 6px 28px rgba(15,23,42,0.18)', borderRadius: 2 } as React.CSSProperties}>
                <ReportCardSheet data={consolidatedData} student={selectedStudent} />
              </div>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px dashed #cfdcd8', borderRadius: 12, padding: 32, textAlign: 'center', color: '#5f736f', fontSize: 13 }}>
              No marks have been entered for this examination yet, so there is no report card to show.
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: SECTION ROSTER & ATTENDANCE ───────────────────── */}
      {activeSubTab === 'ROSTER' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
              Section Roster & Attendance Directory
            </h3>
            <button
              onClick={async () => {
                try {
                  await api.downloadBlob(
                    `/analytics/export/attendance-csv/${sectionId}`,
                    `Attendance_Summary_${displaySectionName}.csv`
                  );
                } catch (e: any) {
                  alert(e.message || 'Failed to export attendance CSV');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#ebf5f1',
                color: '#2f4f4c',
                border: '1px solid #cfdcd8',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              <Download size={14} /> Export Attendance CSV
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f4faf8', borderBottom: '2px solid #dcebe6', color: '#4b605b' }}>
                <th style={{ padding: '10px 12px', fontWeight: '700', width: '50px' }}>Roll</th>
                <th style={{ padding: '10px 12px', fontWeight: '700' }}>Student Name</th>
                <th style={{ padding: '10px 12px', fontWeight: '700' }}>Student ID / Username</th>
                <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>Attendance Rate</th>
                <th style={{ padding: '10px 12px', fontWeight: '700' }}>Parent / Contact</th>
                <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st: any, idx: number) => (
                <tr key={st.studentId || idx} style={{ borderBottom: '1px solid #ebf5f1' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '700' }}>{st.rollNumber}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button type="button" onClick={() => setDossierId(st.studentId)} title="Open student dossier" style={{ fontWeight: '700', color: '#0e3e3b', cursor: 'pointer', textDecoration: 'underline dotted', textUnderlineOffset: '3px', textAlign: 'left' }}>{st.fullName}</button>
                    {st.fullNameNepali && <div style={{ fontSize: '11px', color: '#5f736f' }}>{st.fullNameNepali}</div>}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#5f736f', fontFamily: 'monospace' }}>
                    {st.username || '—'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: '700',
                        fontSize: '11px',
                        background: '#e6f7f0',
                        color: '#0f4c4a',
                      }}
                    >
                      {st.attendance ? `${st.attendance.percentage}%` : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#4b605b' }}>
                    {st.guardianName || '—'}{st.guardianPhone ? <div style={{ fontSize: '11px', color: '#5f736f' }}>{st.guardianPhone}</div> : null}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#117a6b', background: '#e6f7f0', padding: '2px 8px', borderRadius: '10px' }}>
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {printList && createPortal(
        <div id="rc-print-root">
          {printList.map((s: any) => (
            <ReportCardSheet key={String(s.studentId)} data={consolidatedData} student={s} />
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};
