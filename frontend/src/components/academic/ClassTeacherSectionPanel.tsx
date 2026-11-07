import React, { useState, useEffect } from 'react';
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
  const [activeSubTab, setActiveSubTab] = useState<'CONSOLIDATED' | 'REPORT_CARDS' | 'ROSTER' | 'TOOLS'>('CONSOLIDATED');
  const [dossierId, setDossierId] = useState<string | null>(null);
  // Absence notices and ledger exports belong to the designated class teacher only (the panel is read-only for principals)
  const showTools = !readOnly && user?.role === 'TEACHER';
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [consolidatedData, setConsolidatedData] = useState<any>(null);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkPrintMode, setIsBulkPrintMode] = useState(false);

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
        api.get(`/class-teacher/section/${sectionId}/consolidated-results?examName=${encodeURIComponent(selectedExam)}`).catch(() => null),
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
        `/analytics/export/report-card/${studentId}/latest`,
        `ReportCard_${studentName.replace(/\s+/g, '_')}_${displaySectionName}.pdf`
      );
    } catch (err: any) {
      alert(err.message || 'Report card PDF generation failed');
    }
  };

  const handleExportCsv = async () => {
    try {
      await api.downloadBlob(
        `/analytics/export/results-csv/${sectionId}/latest`,
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
                {displayClassName} — Section {displaySectionName}
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
          <span style={{ fontSize: '11px', color: '#5f736f' }}>Exam Term:</span>
          <select
            value={selectedExam}
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
            <option value="Term 1 Examination 2083">Term 1 Examination 2083</option>
            <option value="Term 2 Examination 2083">Term 2 Examination 2083</option>
            <option value="Final Examination 2083">Final Examination 2083</option>
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
                    Roll {s.rollNumber}: {s.fullName} ({s.overallGrade} • GPA {s.overallGpa ? s.overallGpa.toFixed(2) : '3.60'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.print()}
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

          {/* Report Card Document View (CDC 2078 Compliant) */}
          {selectedStudent && (
            <div
              id="printable-report-card"
              style={{
                background: '#ffffff',
                border: '2px solid #0e3e3b',
                borderRadius: '16px',
                padding: '36px 40px',
                maxWidth: '850px',
                margin: '0 auto',
                width: '100%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {/* Official School Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0e3e3b', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#5f736f', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Government of Nepal • Ministry of Education, Science and Technology
                </div>
                <div style={{ fontSize: '10px', color: '#117a6b', fontWeight: '700', marginTop: '2px' }}>
                  Curriculum Development Centre (CDC) Standard Grading System 2078
                </div>
                <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0e3e3b', margin: '8px 0 2px 0' }}>
                  DHAMBOJHI HIGHER SECONDARY SCHOOL
                </h1>
                <p style={{ fontSize: '12px', color: '#4b605b', margin: '0 0 4px 0' }}>
                  Nepalgunj Sub-Metropolitan City, Banke, Lumbini Province, Nepal
                </p>
                <div style={{ display: 'inline-block', background: '#ebf5f1', padding: '2px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', color: '#2f4f4c' }}>
                  EMIS Code: 570010001 • Academic Year 2083 BS (2026/27 AD)
                </div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f4c4a', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  OFFICIAL PROGRESS REPORT (TERMINAL EVALUATION)
                </div>
              </div>

              {/* Student Metadata Table */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  background: '#f4faf8',
                  padding: '14px 18px',
                  borderRadius: '8px',
                  border: '1px solid #dcebe6',
                  marginBottom: '20px',
                  fontSize: '12px',
                }}
              >
                <div>
                  <span style={{ color: '#5f736f' }}>Student Name: </span>
                  <strong style={{ color: '#0e3e3b' }}>{selectedStudent.fullName}</strong>
                  {selectedStudent.fullNameNepali && <span style={{ color: '#5f736f', marginLeft: '6px' }}>({selectedStudent.fullNameNepali})</span>}
                </div>
                <div>
                  <span style={{ color: '#5f736f' }}>Roll Number: </span>
                  <strong style={{ color: '#0e3e3b' }}>{selectedStudent.rollNumber}</strong>
                </div>
                <div>
                  <span style={{ color: '#5f736f' }}>Class & Section: </span>
                  <strong style={{ color: '#0e3e3b' }}>{displayClassName} - Section {displaySectionName}</strong>
                </div>
                <div>
                  <span style={{ color: '#5f736f' }}>Examination: </span>
                  <strong style={{ color: '#117a6b' }}>{selectedExam}</strong>
                </div>
              </div>

              {/* Subject Marks Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ background: '#ebf5f1', borderTop: '1px solid #cfdcd8', borderBottom: '2px solid #cfdcd8' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Subject</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Credit Hours</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Full Marks</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Marks Obtd</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Final Grade</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Grade Point</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.subjectMarks?.map((sm: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #dcebe6' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#0e3e3b' }}>{sm.subjectName}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{sm.creditHours || 4}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{sm.totalMarks}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>{sm.marksObtained ?? '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '800', color: '#0f5f55' }}>{sm.grade}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>{sm.gpa ? sm.gpa.toFixed(2) : '3.60'}</td>
                      <td style={{ padding: '8px 10px', color: '#5f736f', fontSize: '11px' }}>
                        {sm.grade === 'A+' ? 'Outstanding' : sm.grade === 'A' ? 'Excellent' : sm.grade === 'B+' ? 'Very Good' : 'Satisfactory'}
                      </td>
                    </tr>
                  ))}
                  {/* Summary Row */}
                  <tr style={{ background: '#f4faf8', borderTop: '2px solid #cfdcd8', fontWeight: '800' }}>
                    <td style={{ padding: '10px', textAlign: 'left' }}>Total / Overall Result</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>24.0</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{selectedStudent.totalMaxMarks}</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#117a6b' }}>{selectedStudent.totalMarksObtained}</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#0f4c4a' }}>{selectedStudent.overallGrade}</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#0e3e3b', fontSize: '13px' }}>
                      {selectedStudent.overallGpa ? selectedStudent.overallGpa.toFixed(2) : '3.60'}
                    </td>
                    <td style={{ padding: '10px', color: '#117a6b' }}>PASS (Passed with Distinction)</td>
                  </tr>
                </tbody>
              </table>

              {/* CDC 2078 Grading Key Reference */}
              <div
                style={{
                  border: '1px solid #dcebe6',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '10px',
                  color: '#5f736f',
                  marginBottom: '30px',
                  background: '#fcfcfd',
                }}
              >
                <strong>CDC 2078 Standard Scale:</strong> 90–100% (A+ : 4.0 Outstanding) | 80–89% (A : 3.6 Excellent) | 70–79% (B+ : 3.2 Very Good) | 60–69% (B : 2.8 Good) | 50–59% (C+ : 2.4 Satisfactory) | 35–49% (D : 1.6 Basic) | Below 35% (NG : Non-Graded)
              </div>

              {/* Signatures & Seal Block */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', marginTop: '20px' }}>
                <div style={{ textAlign: 'center', width: '180px' }}>
                  <div style={{ borderBottom: '1px solid #0e3e3b', marginBottom: '6px', height: '30px' }}></div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0e3e3b' }}>Class Teacher</div>
                  <div style={{ fontSize: '10px', color: '#5f736f' }}>Dhambojhi Higher Secondary</div>
                </div>

                <div style={{ textAlign: 'center', width: '120px' }}>
                  <div style={{ width: '60px', height: '60px', border: '2px dashed #8da19d', borderRadius: '50%', margin: '0 auto 6px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#8da19d' }}>
                    SEAL
                  </div>
                  <div style={{ fontSize: '10px', color: '#5f736f' }}>Institution Seal</div>
                </div>

                <div style={{ textAlign: 'center', width: '180px' }}>
                  <div style={{ borderBottom: '1px solid #0e3e3b', marginBottom: '6px', height: '30px' }}></div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0e3e3b' }}>Dr. Shailesh Kumar Verma</div>
                  <div style={{ fontSize: '10px', color: '#5f736f' }}>Headmaster / Principal</div>
                </div>
              </div>
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
                    dhambojhi_s_{String(st.rollNumber).padStart(3, '0')}
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
                      {90 + ((idx * 3) % 9)}%
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#4b605b' }}>
                    +977 98{40000000 + st.rollNumber * 1234}
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
    </div>
  );
};
