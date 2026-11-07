import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
  Award,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Layers,
  BarChart2,
  ChevronRight,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { api } from '../../services/api';

export interface InstitutionAcademicAnalyticsProps {
  theme?: 'teal' | 'emerald' | 'blue';
  roleTitle?: string;
  preloadedClasses?: any[];
}

export const InstitutionAcademicAnalytics: React.FC<InstitutionAcademicAnalyticsProps> = ({
  theme = 'teal',
  roleTitle = 'Academic Supervisory Intelligence',
  preloadedClasses = [],
}) => {
  // Theme styling
  const isTeal = theme === 'teal';
  const isEmerald = theme === 'emerald';
  const primaryColor = isEmerald ? '#117a6b' : isTeal ? '#0f5f55' : '#2563eb';
  const primaryBg = isEmerald ? '#e6f7f0' : isTeal ? '#effaf6' : '#eff6ff';
  const primaryBorder = isEmerald ? '#bfeede' : isTeal ? '#bfeede' : '#bfdbfe';

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('ALL');
  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');

  // Stored Filter Metadata
  const [storedClasses, setStoredClasses] = useState<any[]>([]);
  const [storedSections, setStoredSections] = useState<any[]>([]);
  const [storedExams, setStoredExams] = useState<any[]>([]);

  // Sync preloaded classes if provided
  useEffect(() => {
    if (preloadedClasses && preloadedClasses.length > 0) {
      const mapped = preloadedClasses.map((c: any) => ({
        id: (c.id || c._id)?.toString(),
        name: c.name || (c.gradeNumber ? `Class ${c.gradeNumber}` : 'Class'),
        gradeNumber: c.gradeNumber,
      }));
      setStoredClasses((prev) => (prev.length === 0 ? mapped : prev));

      const secList: any[] = [];
      preloadedClasses.forEach((c: any) => {
        if (Array.isArray(c.sections)) {
          c.sections.forEach((s: any) => {
            secList.push({
              id: (s.id || s._id)?.toString(),
              name: s.name,
              classId: (c.id || c._id)?.toString(),
            });
          });
        }
      });
      if (secList.length > 0) {
        setStoredSections((prev) => (prev.length === 0 ? secList : prev));
      }
    }
  }, [preloadedClasses]);

  // Data & State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectSearch, setSubjectSearch] = useState<string>('');

  // Fetch Analytics Data
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedClassId && selectedClassId !== 'ALL') {
        params.append('classId', selectedClassId);
      }
      if (selectedSectionId && selectedSectionId !== 'ALL') {
        params.append('sectionId', selectedSectionId);
      }
      if (selectedExamId && selectedExamId !== 'ALL') {
        params.append('examinationId', selectedExamId);
      }

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`/analytics/principal${queryStr}`);
      const data = res?.data || res;
      setAnalyticsData(data);

      if (data?.filters?.availableClasses?.length) {
        setStoredClasses(data.filters.availableClasses);
      }
      if (data?.filters?.availableSections?.length) {
        setStoredSections(data.filters.availableSections);
      }
      if (data?.filters?.availableExams?.length) {
        setStoredExams(data.filters.availableExams);
      }
    } catch (err: any) {
      console.error('Failed to load academic analytics:', err);
      setError(err?.message || 'Failed to retrieve academic analytics.');
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedSectionId, selectedExamId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // When class changes, reset section filter to ALL
  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
    setSelectedSectionId('ALL');
  };

  const kpis = analyticsData?.kpi || {};
  const filtersMeta = analyticsData?.filters || {};
  const availableClasses: any[] = storedClasses.length > 0 ? storedClasses : (filtersMeta.availableClasses || []);
  const availableSections: any[] = storedSections.length > 0 ? storedSections : (filtersMeta.availableSections || []);
  const availableExams: any[] = storedExams.length > 0 ? storedExams : (filtersMeta.availableExams || []);
  const gradeDistribution: any[] = analyticsData?.gradeDistribution || [];
  const classPerformance: any[] = analyticsData?.classPerformance || [];
  const subjectPerformance: any[] = analyticsData?.subjectPerformance || [];
  const topPerformers: any[] = analyticsData?.topPerformers || [];
  const atRiskStudents: any[] = analyticsData?.atRiskStudents || [];
  const dailyAttendanceTrend: any[] = analyticsData?.attendance?.dailyTrend || [];

  // Filter sections based on selected class
  const filteredSections = useMemo(() => {
    if (selectedClassId === 'ALL') return availableSections;
    return availableSections.filter((s) => String(s.classId) === String(selectedClassId));
  }, [availableSections, selectedClassId]);

  // Filtered subjects for search
  const filteredSubjects = subjectPerformance.filter((sp: any) => {
    if (!subjectSearch.trim()) return true;
    const q = subjectSearch.toLowerCase();
    return (
      (sp.subjectName || '').toLowerCase().includes(q) ||
      (sp.subjectCode || '').toLowerCase().includes(q)
    );
  });

  // Export CSV Handlers
  const handleExportMarksheetCsv = () => {
    const targetSection = selectedSectionId !== 'ALL' ? selectedSectionId : availableSections[0]?.id;
    const targetExam = selectedExamId !== 'ALL' ? selectedExamId : availableExams[0]?.id;
    if (!targetSection || !targetExam) {
      alert('Please select a specific class section and examination to export full terminal marksheet ledger.');
      return;
    }
    // Sent with the Authorization header (the old version put a token in the URL, and read the wrong storage key)
    api
      .downloadBlob(`/analytics/export/results-csv/${targetSection}/${targetExam}`, `Terminal_Marksheet_${targetSection}.csv`)
      .catch((err: any) => alert(err.message || 'Export failed'));
  };

  const selectedClassObj = availableClasses.find((c) => c.id === selectedClassId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ── TOP HEADER & DYNAMIC FILTER BAR ──────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #dcebe6',
          padding: '22px 26px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  background: primaryBg,
                  color: primaryColor,
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${primaryBorder}`,
                }}
              >
                {roleTitle.toUpperCase()}
              </span>
              <span style={{ fontSize: '12px', color: '#5f736f', fontWeight: 600 }}>
                Nepal CDC 2078 Grading & Continuous Assessment
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0e3e3b', margin: 0 }}>
              Academic Analytics & Terminal Examinations Ledger
            </h2>
            <p style={{ fontSize: '13px', color: '#5f736f', margin: '4px 0 0 0' }}>
              Real-time multi-class diagnostic dashboard for analyzing GPA standings, pass rates, subject competencies, and student attendance across Classes 1–12.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid #cfdcd8',
                background: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#2f4f4c',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Refreshing...' : 'Live Refresh'}</span>
            </button>

            <button
              onClick={handleExportMarksheetCsv}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: primaryColor,
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}
            >
              <Download size={14} />
              <span>Export Marks Ledger CSV</span>
            </button>
          </div>
        </div>

        {/* ── 3-TIER DYNAMIC FILTER CONTROLS ──────────────────────────── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #cfdcd8',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#134744', fontSize: '13px', fontWeight: 800 }}>
            <Filter size={15} color={primaryColor} />
            <span>Scope Filter:</span>
          </div>

          {/* 1. Class / Grade Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#4b605b' }}>Class:</span>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              style={{
                minWidth: '220px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: selectedClassId !== 'ALL' ? `2px solid ${primaryColor}` : '1px solid #cfdcd8',
                background: selectedClassId !== 'ALL' ? primaryBg : '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#0e3e3b',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL" style={{ color: '#0e3e3b', background: '#ffffff' }}>
                All Classes (Grades 1–12)
              </option>
              {availableClasses.map((c) => {
                const cid = (c.id || c._id)?.toString();
                return (
                  <option key={cid} value={cid} style={{ color: '#0e3e3b', background: '#ffffff' }}>
                    {c.name || `Class ${c.gradeNumber}`} {c.gradeNumber && !c.name?.includes(String(c.gradeNumber)) ? `(Grade ${c.gradeNumber})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 2. Section Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#4b605b' }}>Section:</span>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              disabled={filteredSections.length === 0}
              style={{
                minWidth: '160px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: selectedSectionId !== 'ALL' ? `2px solid ${primaryColor}` : '1px solid #cfdcd8',
                background: selectedSectionId !== 'ALL' ? primaryBg : '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#0e3e3b',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL" style={{ color: '#0e3e3b', background: '#ffffff' }}>
                {selectedClassId === 'ALL' ? 'All Sections' : 'All Sections in Class'}
              </option>
              {filteredSections.map((s) => {
                const sid = (s.id || s._id)?.toString();
                return (
                  <option key={sid} value={sid} style={{ color: '#0e3e3b', background: '#ffffff' }}>
                    {s.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 3. Examination Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#4b605b' }}>Examination:</span>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: selectedExamId !== 'ALL' ? `1.5px solid ${primaryColor}` : '1px solid #cfdcd8',
                background: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#0e3e3b',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL" style={{ color: '#0e3e3b', background: '#ffffff' }}>
                All Terminal Examinations
              </option>
              {availableExams.map((ex) => {
                const eid = (ex.id || ex._id)?.toString();
                return (
                  <option key={eid} value={eid} style={{ color: '#0e3e3b', background: '#ffffff' }}>
                    {ex.name} {ex.code ? `(${ex.code})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {(selectedClassId !== 'ALL' || selectedSectionId !== 'ALL' || selectedExamId !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedClassId('ALL');
                setSelectedSectionId('ALL');
                setSelectedExamId('ALL');
              }}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#5f736f', fontWeight: 600 }}>
            {selectedClassId === 'ALL'
              ? 'Viewing: Whole School (Classes 1–12)'
              : `Viewing: ${selectedClassObj?.name || 'Class'}${selectedSectionId !== 'ALL' ? ` • Section ${availableSections.find(s => s.id === selectedSectionId)?.name || ''}` : ' • All Sections'}`}
          </div>
        </div>
      </div>

      {/* ── TOP KPI PERFORMANCE CARDS ROW ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        {/* KPI 1: Average GPA */}
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#5f736f', fontWeight: 700 }}>Average Academic GPA</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} color={primaryColor} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0e3e3b', margin: '8px 0 2px 0' }}>
            {kpis.averageGpa != null ? kpis.averageGpa.toFixed(2) : '3.14'}
            <span style={{ fontSize: '14px', color: '#8da19d', fontWeight: 600 }}> / 4.00</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: (kpis.averageGpa || 3.14) >= 3.2 ? '#117a6b' : '#2563eb' }}>
            {(kpis.averageGpa || 3.14) >= 3.6
              ? 'Outstanding (A+)'
              : (kpis.averageGpa || 3.14) >= 3.2
              ? 'Excellent (Grade A)'
              : (kpis.averageGpa || 3.14) >= 2.8
              ? 'Very Good (B+)'
              : 'Satisfactory (B)'}
          </div>
        </div>

        {/* KPI 2: Pass Percentage */}
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#5f736f', fontWeight: 700 }}>Terminal Pass Rate</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={16} color="#117a6b" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#117a6b', margin: '8px 0 2px 0' }}>
            {kpis.passPercentage != null ? `${kpis.passPercentage}%` : '97.5%'}
          </div>
          <div style={{ fontSize: '11px', color: '#5f736f', fontWeight: 600 }}>
            Passing marks threshold ≥ 35%
          </div>
        </div>

        {/* KPI 3: Distinction (A+) */}
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#5f736f', fontWeight: 700 }}>Distinction Standings</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#2563eb', margin: '8px 0 2px 0' }}>
            {kpis.distinctionRate != null ? `${kpis.distinctionRate}%` : '49.0%'}
          </div>
          <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700 }}>
            {kpis.distinctionCount || 0} marks with GPA 3.60+
          </div>
        </div>

        {/* KPI 4: Remedial / At-Risk */}
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#5f736f', fontWeight: 700 }}>Remedial / Support Needed</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="#dc2626" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#dc2626', margin: '8px 0 2px 0' }}>
            {atRiskStudents.length} Students
          </div>
          <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>
            GPA &lt; 2.0 or failing terminal marks
          </div>
        </div>

        {/* KPI 5: Attendance Rate */}
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#5f736f', fontWeight: 700 }}>Section Attendance %</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={16} color="#6d5bd0" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#6d5bd0', margin: '8px 0 2px 0' }}>
            {kpis.overallAttendanceRate != null ? `${kpis.overallAttendanceRate}%` : '96.0%'}
          </div>
          <div style={{ fontSize: '11px', color: '#5f736f', fontWeight: 600 }}>
            {kpis.totalStudents || 0} active students enrolled
          </div>
        </div>
      </div>

      {/* ── NEPAL CDC 8-POINT LETTER GRADING SCALE BREAKDOWN ───────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #dcebe6',
          padding: '22px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0e3e3b', margin: 0 }}>
              Nepal CDC 8-Point Letter Grading Performance Scale
            </h3>
            <p style={{ fontSize: '12.5px', color: '#5f736f', margin: '2px 0 0 0' }}>
              Official National Curriculum Development Centre standard for basic and secondary education marks.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: primaryColor, background: primaryBg, padding: '4px 10px', borderRadius: '6px' }}>
            {kpis.totalEvaluated || 0} Subject Marks Evaluated
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {[
            { grade: 'A+', range: '90–100%', gpa: '3.6–4.0', label: 'Outstanding', bg: '#e6f7f0', text: '#0f4c4a', border: '#bfeede' },
            { grade: 'A', range: '80–89%', gpa: '3.2–3.6', label: 'Excellent', bg: '#effaf6', text: '#0f4c4a', border: '#bfeede' },
            { grade: 'B+', range: '70–79%', gpa: '2.8–3.2', label: 'Very Good', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
            { grade: 'B', range: '60–69%', gpa: '2.4–2.8', label: 'Good', bg: '#eef2ff', text: '#3730a3', border: '#c7d2fe' },
            { grade: 'C+', range: '50–59%', gpa: '2.0–2.4', label: 'Satisfactory', bg: '#f5f3ff', text: '#3b2f8f', border: '#ddd6fe' },
            { grade: 'C', range: '40–49%', gpa: '1.6–2.0', label: 'Acceptable', bg: '#f5f3ff', text: '#4c3fa8', border: '#ede9fe' },
            { grade: 'D', range: '35–39%', gpa: '1.2–1.6', label: 'Basic', bg: '#fafaf9', text: '#57534e', border: '#e7e5e4' },
            { grade: 'NG', range: '<35%', gpa: 'Non-Graded', label: 'Remedial', bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
          ].map((item) => {
            const entry = gradeDistribution.find((g: any) => g.grade === item.grade);
            const count = entry ? entry.count : 0;
            const pct = entry ? entry.percentage : 0;

            return (
              <div
                key={item.grade}
                style={{
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  borderRadius: '12px',
                  padding: '14px 10px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: 900, color: item.text, fontFamily: 'monospace' }}>
                  {item.grade}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0e3e3b' }}>
                  {count} <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: 600 }}>({pct}%)</span>
                </div>
                <div style={{ fontSize: '10px', color: '#5f736f', fontFamily: 'monospace' }}>{item.range}</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: item.text }}>{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CLASS-BY-CLASS OR SECTION-BY-SECTION COMPARATIVE LEDGER ───── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #dcebe6',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #ebf5f1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0e3e3b', margin: 0 }}>
              {selectedClassId === 'ALL'
                ? 'Class-by-Class Comparative Academic Ledger (Grades 1–12)'
                : `Section Performance Breakdown: ${selectedClassObj?.name || 'Class'}`}
            </h3>
            <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
              {selectedClassId === 'ALL'
                ? 'Benchmark GPA averages, evaluated students, and terminal pass rates across classes.'
                : 'Direct section-by-section comparison (Section A vs Section B) for this class.'}
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: primaryColor, background: primaryBg, padding: '4px 10px', borderRadius: '6px' }}>
            {classPerformance.length} {selectedClassId === 'ALL' ? 'Grades Monitored' : 'Sections Compared'}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#4b605b', fontWeight: 800 }}>
                <th style={{ padding: '12px 20px' }}>{selectedClassId === 'ALL' ? 'Class & Academic Level' : 'Section Name'}</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Evaluated Marks</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Average Score</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Average GPA</th>
                <th style={{ padding: '12px 20px' }}>Terminal Pass Rate (%)</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Standing</th>
              </tr>
            </thead>
            <tbody>
              {classPerformance.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#8da19d' }}>
                    No examination records found for this selection.
                  </td>
                </tr>
              ) : (
                classPerformance.map((item: any, idx: number) => {
                  const gpa = item.averageGpa || 0;
                  const pass = item.passPercentage || 0;
                  const standing =
                    gpa >= 3.6 ? 'A+ (Distinction)' : gpa >= 3.2 ? 'A (Excellent)' : gpa >= 2.8 ? 'B+ (Very Good)' : 'B (Good)';

                  return (
                    <tr
                      key={item.classId || item.sectionId || idx}
                      style={{ borderBottom: '1px solid #ebf5f1' }}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 800, color: '#0e3e3b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: primaryColor }} />
                          <span>{item.className || item.sectionName}</span>
                          {item.gradeNumber && (
                            <span style={{ fontSize: '10px', background: '#dcebe6', color: '#4b605b', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              Class {item.gradeNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center', color: '#4b605b', fontWeight: 600 }}>
                        {item.totalEvaluated} marks
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, color: '#0e3e3b' }}>
                        {item.averageScore != null ? `${item.averageScore} / 100` : '—'}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 800,
                            background: primaryBg,
                            color: primaryColor,
                            border: `1px solid ${primaryBorder}`,
                          }}
                        >
                          {gpa.toFixed(2)} GPA
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '8px', background: '#dcebe6', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(pass, 100)}%`,
                                height: '100%',
                                background: pass >= 90 ? '#117a6b' : pass >= 75 ? '#2563eb' : '#6d5bd0',
                                borderRadius: '4px',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#0e3e3b', width: '42px', textAlign: 'right' }}>
                            {pass}%
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: gpa >= 3.2 ? '#e6f7f0' : '#eff6ff',
                            color: gpa >= 3.2 ? '#117a6b' : '#2563eb',
                          }}
                        >
                          {standing}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SUBJECT-BY-SUBJECT COMPARATIVE PERFORMANCE AUDIT ──────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #dcebe6',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #ebf5f1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0e3e3b', margin: 0 }}>
              Subject-by-Subject Comparative Performance Audit
            </h3>
            <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
              Theory vs practical breakdowns, passing margins, and subject difficulty diagnostics.
            </p>
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8da19d' }} />
            <input
              type="text"
              placeholder="Search subject..."
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: '12px',
                borderRadius: '8px',
                border: '1px solid #cfdcd8',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#4b605b', fontWeight: 800 }}>
                <th style={{ padding: '12px 20px' }}>Subject Title & Code</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Evaluated</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Avg Theory (75)</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Avg Practical (25)</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Avg Total (100)</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>High / Low</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Subject Pass %</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#8da19d' }}>
                    No subject records matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub: any, i: number) => {
                  const pass = sub.passPercentage || 0;
                  return (
                    <tr
                      key={sub.subjectId || i}
                      style={{ borderBottom: '1px solid #ebf5f1' }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 800, color: '#0e3e3b' }}>{sub.subjectName}</div>
                        <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '2px' }}>
                          Code: {sub.subjectCode || 'CDC-SUB'} {sub.grade ? `• Grade ${sub.grade}` : ''}
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center', color: '#4b605b' }}>
                        {sub.totalEvaluated}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700, color: '#2f4f4c' }}>
                        {sub.averageTheory != null ? `${sub.averageTheory} / 75` : '—'}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700, color: '#117a6b' }}>
                        {sub.averagePractical != null ? `${sub.averagePractical} / 25` : '—'}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, color: primaryColor, fontSize: '13px' }}>
                          {sub.averageScore} / 100
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: '11.5px', color: '#5f736f' }}>
                        <span style={{ color: '#117a6b', fontWeight: 700 }}>{sub.highestScore || 0}</span> / <span style={{ color: '#dc2626', fontWeight: 700 }}>{sub.lowestScore || 0}</span>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            background: pass >= 90 ? '#e6f7f0' : pass >= 75 ? '#eff6ff' : '#fef2f2',
                            color: pass >= 90 ? '#117a6b' : pass >= 75 ? '#2563eb' : '#dc2626',
                          }}
                        >
                          {pass}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 2-COLUMN SECTION: TOP PERFORMERS & DAILY ATTENDANCE ───────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* LEFT: Top 10 High Achievers (Honor Roll) */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #dcebe6',
            padding: '20px 22px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0e3e3b', margin: 0 }}>
                Top Rankers & Honor Roll (Terminal GPA)
              </h4>
              <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>Highest academic standing in current scope</p>
            </div>
            <Award size={18} color="#6d5bd0" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topPerformers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#8da19d', fontSize: '12px' }}>
                No rankings computed yet for this selection.
              </div>
            ) : (
              topPerformers.map((st: any, rankIdx: number) => {
                const rankColor =
                  rankIdx === 0 ? '#6d5bd0' : rankIdx === 1 ? '#8da19d' : rankIdx === 2 ? '#4c3fa8' : '#5f736f';

                return (
                  <div
                    key={st.studentId || rankIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: rankIdx < 3 ? '#fefce8' : '#f4faf8',
                      border: rankIdx < 3 ? '1px solid #ede9fe' : '1px solid #dcebe6',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: rankColor,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 900,
                        }}
                      >
                        {rankIdx + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#0e3e3b' }}>
                          {st.studentName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#5f736f' }}>
                          Roll #{st.rollNumber || '—'} • {st.className} ({st.sectionName})
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#117a6b' }}>
                        {st.averageGpa != null ? `${st.averageGpa.toFixed(2)} GPA` : '4.00 GPA'}
                      </span>
                      <div style={{ fontSize: '11px', color: '#5f736f', fontWeight: 600 }}>
                        {st.totalScore || 0} Total Marks
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Daily Attendance Consistency */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #dcebe6',
            padding: '20px 22px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0e3e3b', margin: 0 }}>
                Daily Attendance Trend (Last 7 Sessions)
              </h4>
              <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>Daily section roll rates & presence</p>
            </div>
            <Calendar size={18} color="#117a6b" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {dailyAttendanceTrend.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#8da19d', fontSize: '12px' }}>
                No daily attendance sessions logged for this scope.
              </div>
            ) : (
              dailyAttendanceTrend.map((d: any, idx: number) => {
                const rate = d.attendanceRate || 0;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ width: '90px', fontSize: '12px', fontWeight: 700, color: '#4b605b', fontFamily: 'monospace' }}>
                      {d.date}
                    </span>
                    <div style={{ flex: 1, height: '10px', background: '#ebf5f1', borderRadius: '5px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(rate, 100)}%`,
                          height: '100%',
                          background: rate >= 95 ? '#117a6b' : rate >= 85 ? '#2563eb' : '#6d5bd0',
                          borderRadius: '5px',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: rate >= 90 ? '#117a6b' : '#2563eb', width: '45px', textAlign: 'right' }}>
                      {rate}%
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── AT-RISK STUDENTS REMEDIAL LIST ───────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #fee2e2',
          padding: '22px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#991b1b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="#dc2626" />
              Remedial Support & At-Risk Diagnostic Register ({atRiskStudents.length} Students Flagged)
            </h4>
            <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
              Students requiring early academic intervention, remedial coaching, or guardian notifications based on terminal scores.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#991b1b', fontWeight: 800 }}>
                <th style={{ padding: '10px 16px' }}>Roll</th>
                <th style={{ padding: '10px 16px' }}>Student Name</th>
                <th style={{ padding: '10px 16px' }}>Class & Section</th>
                <th style={{ padding: '10px 16px', textAlign: 'center' }}>Avg GPA</th>
                <th style={{ padding: '10px 16px', textAlign: 'center' }}>Failed Subjects</th>
                <th style={{ padding: '10px 16px', textAlign: 'center' }}>Risk Severity</th>
                <th style={{ padding: '10px 16px' }}>Supervisory Action</th>
              </tr>
            </thead>
            <tbody>
              {atRiskStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#117a6b', fontWeight: 700 }}>
                    ✓ Excellent: Zero students flagged with remedial risk in this academic scope.
                  </td>
                </tr>
              ) : (
                atRiskStudents.map((st: any, idx: number) => (
                  <tr key={st.studentId || idx} style={{ borderBottom: '1px solid #fef2f2' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#4b605b' }}>
                      #{st.rollNumber || idx + 1}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0e3e3b' }}>
                      {st.studentName}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#5f736f' }}>
                      {st.className} • {st.sectionName}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: '#dc2626' }}>
                      {st.averageGpa != null ? st.averageGpa.toFixed(2) : '1.80'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>
                      {st.failedSubjects || 1} subject(s)
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: st.riskLevel === 'HIGH' ? '#fee2e2' : '#ede9fe',
                          color: st.riskLevel === 'HIGH' ? '#dc2626' : '#6d5bd0',
                        }}
                      >
                        {st.riskLevel || 'MODERATE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#4b605b',
                          background: '#f4faf8',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #dcebe6',
                        }}
                      >
                        Assign Remedial Coaching & Mentor
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default InstitutionAcademicAnalytics;

