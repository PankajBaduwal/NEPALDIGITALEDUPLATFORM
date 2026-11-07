import { useHiddenNavs, HiddenNavStyle } from '../hooks/useHiddenNavs';
import { launchOnSmartBoard, isKprietSimulation } from '../components/simulations/smartBoardLaunch';
import { NotificationCenter } from '../components/notifications/NotificationCenter';
import { SchoolLogoBadge } from '../components/common/SchoolLogoBadge';
import { StudentSnapshot } from '../components/student/StudentSnapshot';
import { AIAssistantPanel } from '../components/ai/AIAssistantPanel';
import React, { useState, useEffect } from 'react';
import { useLiveRefresh } from '../services/realtime';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  GraduationCap,
  BookOpen,
  Atom,
  Clock,
  LogOut,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  XCircle,
  FileText,
  Award,
  Layers,
  Presentation,
  Download,
  HelpCircle,
  Folder,
  Calendar,
  ChevronRight,
  ChevronDown,
  Bell,
  Sun,
  Maximize2,
  UserCheck,
  CheckCircle,
  BarChart3,
  ExternalLink,
  BookMarked,
  Search,
  Filter,
  AlertTriangle,
  User,
  Key,
  Eye,
  EyeOff,
  Shield,
  CheckCheck
} from 'lucide-react';
import { ClassTimetable } from '../components/academic/ClassTimetable';
import { StudentQuizPortal } from '../components/academic/StudentQuizPortal';
import { StudentAssignmentPortal } from '../components/academic/StudentAssignmentPortal';
import { StudentMaterialPortal } from '../components/academic/StudentMaterialPortal';
import { PdfReaderModal, TextbookData } from '../components/PdfReaderModal';
import { SimulationViewerModal } from '../components/SimulationViewerModal';
import { InteractiveActivityPlayer } from '../components/InteractiveActivityPlayer';
import { DemoBanner } from '../components/common/DemoBanner';
import { ExploreSimulationsPanel } from '../components/academic/ExploreSimulationsPanel';

type TabType =
  | 'OVERVIEW'
  | 'SUBJECTS'
  | 'ATTENDANCE'
  | 'RESULTS'
  | 'TIMETABLE'
  | 'ASSIGNMENTS'
  | 'QUIZZES'
  | 'MATERIALS'
  | 'NOTES'
  | 'ACTIVITIES'
  | 'AI'
  | 'ANNOUNCEMENTS'
  | 'PROFILE';

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation & State
  const [activeNav, setActiveNav] = useState<TabType>('OVERVIEW');
  // Menu items for features the school switched off for this student's class are hidden
  const hiddenNavs = useHiddenNavs({ ASSIGNMENTS: 'ASSIGNMENTS', QUIZZES: 'QUIZZES', MATERIALS: 'MATERIALS', NOTES: 'NOTES', ACTIVITIES: 'SIMULATIONS', AI: 'AI', GROUP_COURSEWORK: ['ASSIGNMENTS', 'QUIZZES', 'MATERIALS', 'NOTES'], CARD_COURSEWORK: ['ASSIGNMENTS', 'QUIZZES'] });
  useEffect(() => { if (hiddenNavs.includes(activeNav)) setActiveNav('OVERVIEW'); }, [hiddenNavs.join(','), activeNav]);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [academicMenuOpen, setAcademicMenuOpen] = useState(true);
  const [courseworkMenuOpen, setCourseworkMenuOpen] = useState(true);
  const [insightsMenuOpen, setInsightsMenuOpen] = useState(true);
  const [commMenuOpen, setCommMenuOpen] = useState(true);

  // Core Data
  const [overview, setOverview] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadIssues, setLoadIssues] = useState<string[]>([]);
  const [viewNote, setViewNote] = useState<any>(null);
  const [prefs, setPrefs] = useState<{ textSize: 'NORMAL' | 'LARGE'; defaultTab: string }>({ textSize: 'NORMAL', defaultTab: 'OVERVIEW' });
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Personal preferences live on the server so they follow the student to any device
  useEffect(() => {
    api.get<any>('/auth/preferences').then((p) => {
      setPrefs({ textSize: p.textSize, defaultTab: p.defaultTab });
      if (p.defaultTab && p.defaultTab !== 'OVERVIEW') setActiveNav(p.defaultTab as any);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.fontSize;
    root.style.fontSize = prefs.textSize === 'LARGE' ? '112%' : '';
    return () => {
      root.style.fontSize = previous;
    };
  }, [prefs.textSize]);

  const savePrefs = async (next: { textSize: 'NORMAL' | 'LARGE'; defaultTab: string }) => {
    setPrefs(next);
    try {
      await api.put('/auth/preferences', next);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Could not save your preferences');
    }
  };
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);

  // Modals & Reader
  const [activeReaderTextbook, setActiveReaderTextbook] = useState<TextbookData | null>(null);

  // Phase 7: Simulations & Interactive Activities
  const [studentSimulations, setStudentSimulations] = useState<any[]>([]);
  const [assignedActivities, setAssignedActivities] = useState<any[]>([]);
  const [practiceActivities, setPracticeActivities] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [studentSubTab, setStudentSubTab] = useState<'SIMS' | 'ASSIGNED' | 'PRACTICE' | 'EXPLORE'>('SIMS');
  const [activeSim, setActiveSim] = useState<any>(null);
  const [activeActivity, setActiveActivity] = useState<any>(null);

  // AI Tutor State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Announcement Category Filter
  const [announcementCategory, setAnnouncementCategory] = useState<'ALL' | 'CLASS_TEACHER' | 'SUBJECT' | 'SCHOOL'>('ALL');

  // Profile & Security State
  const [profileActiveTab, setProfileActiveTab] = useState<'DETAILS' | 'SECURITY' | 'PREFERENCES'>('DETAILS');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeMsg, setPasswordChangeMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMsg(null);
    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      setPasswordChangeMsg({ text: 'Please fill in all password fields.', type: 'error' });
      return;
    }
    if (newPasswordInput.length < 6) {
      setPasswordChangeMsg({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeMsg({ text: 'New password and confirmation do not match.', type: 'error' });
      return;
    }
    setPasswordChangeLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput,
      });
      setPasswordChangeMsg({ text: 'Password successfully changed! Your account is now secured.', type: 'success' });
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err: any) {
      setPasswordChangeMsg({ text: err.message || 'Failed to change password. Please verify your current password.', type: 'error' });
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  useEffect(() => {
    if (activeNav === 'ACTIVITIES') {
      loadSimulationsAndActivities();
    }
  }, [activeNav, overview]);

  const loadStudentData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const calls: Array<[string, Promise<any>]> = [
        ['overview', api.get<any>('/student/overview')],
        ['subjects', api.get<any>('/student/subjects')],
        ['attendance', api.get<any>('/student/attendance')],
        ['results', api.get<any>('/student/results')],
        ['notes', api.get<any>('/student/notes')],
        ['announcements', api.get<any>('/student/announcements')],
      ];
      // One failing section must not blank the whole dashboard
      const settled = await Promise.allSettled(calls.map(([, p]) => p));
      const issues: string[] = [];
      const val = (i: number) => {
        const r = settled[i];
        if (r.status === 'fulfilled') return r.value;
        issues.push(`${calls[i][0]}: ${(r.reason as any)?.message || 'failed to load'}`);
        return null;
      };
      const overviewData = val(0);
      const subjectsData = val(1);
      const attendanceData = val(2);
      const resultsData = val(3);
      const notesData = val(4);
      const annData = val(5);
      setLoadIssues(issues);

      if (overviewData) setOverview(overviewData);
      setSubjects(subjectsData || []);
      if (subjectsData && subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0]);
      }
      if (attendanceData) setAttendance(attendanceData);
      if (resultsData) setResults(resultsData);
      setNotes(notesData || []);
      setAnnouncements(annData?.data || annData || []);
    } catch (err: any) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSimulationsAndActivities = async () => {
    try {
      const grade = overview?.academicInfo?.gradeNumber || overview?.studentProfile?.classId?.gradeNumber;
      const classId = overview?.academicInfo?.classId || overview?.studentProfile?.classId?.id;
      const sectionId = overview?.academicInfo?.sectionId || overview?.studentProfile?.sectionId?.id;

      let asgnUrl = '/simulation-activity/assignments/student';
      if (classId && sectionId) {
        asgnUrl += `?classId=${classId}&sectionId=${sectionId}`;
      }

      const gradeQuery = grade ? `&grade=${grade}` : '';
      const [simulations, activities, assignments, progress] = await Promise.all([
        api.get<any>(`/simulation-activity/simulations?isPublished=true${gradeQuery}`),
        api.get<any>(`/simulation-activity/activities?isPublished=true${gradeQuery}`),
        classId && sectionId ? api.get<any>(asgnUrl) : Promise.resolve([]),
        api.get<any>('/simulation-activity/progress/my')
      ]);

      setStudentSimulations(Array.isArray(simulations) ? simulations : []);
      setPracticeActivities(Array.isArray(activities) ? activities : []);
      setAssignedActivities(Array.isArray(assignments) ? assignments : []);
      setStudentProgress(Array.isArray(progress) ? progress : []);
    } catch (e) {
      console.error('Failed to load student simulations/activities', e);
    }
  };

  // Live updates: results, attendance, timetable changes and new notifications refresh the dashboard quietly
  useLiveRefresh(
    ['results:published', 'attendance:marked', 'timetable:updated', 'examination:created', 'notification:new'],
    () => loadStudentData(true),
    { sectionId: overview?.academicInfo?.sectionId }
  );


  // Works out what a shared Smart Board note actually contains
  const describeNote = (n: any) => {
    const d = n?.drawingData;
    const images: string[] = [];
    let text = '';
    let chapter = '';
    const addImage = (v: any) => {
      if (typeof v === 'string' && (v.startsWith('data:image') || /^https?:|^\//.test(v))) images.push(v);
    };
    if (typeof d === 'string') {
      if (d.startsWith('data:image') || /^https?:|^\//.test(d)) addImage(d);
      else text = d;
    } else if (d && typeof d === 'object') {
      text = typeof d.content === 'string' ? d.content : typeof d.text === 'string' ? d.text : '';
      chapter = typeof d.chapter === 'string' ? d.chapter : '';
      ['notesDataUrl', 'image', 'imageData', 'dataUrl', 'snapshot'].forEach((k) => addImage(d[k]));
      ['pages', 'images', 'snapshots'].forEach((k) => Array.isArray(d[k]) && d[k].forEach(addImage));
    }
    return { images, text, chapter };
  };

  const handleDownloadMyReportCard = async () => {
    const examId = results?.results?.[0]?.examinationId || results?.examinationId || 'latest';
    if (!user?.id) {
      alert('Student session could not be resolved.');
      return;
    }
    try {
      await api.downloadBlob(
        `/analytics/export/report-card/${user.id}/${examId}`,
        `Report_Card_${(user.fullName || 'Student').replace(/\s+/g, '_')}.pdf`
      );
    } catch (err: any) {
      alert(err.message || 'Failed to download CDC official report card');
    }
  };

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    try {
      const subId = selectedSubject?.subject?._id || subjects[0]?.subject?._id;
      if (!subId) {
        alert('No enrolled subject is available for this tutor question.');
        return;
      }
      const data = await api.post('/ai/query', {
        subjectId: subId,
        question: aiQuestion,
      });
      setAiAnswer(data);
    } catch (err: any) {
      alert(err.message || 'Tutor request failed');
    } finally {
      setAiLoading(false);
    }
  };

  const studentName = user?.fullName || overview?.student?.fullName || 'Student';
  const studentNepali = user?.fullNameNepali || overview?.student?.fullNameNepali || '';
  const rollNumber = overview?.academicInfo?.rollNumber ?? '—';
  const admissionNumber = overview?.academicInfo?.admissionNumber || '—';
  const className = overview?.academicInfo?.className || '—';
  const sectionName = overview?.academicInfo?.sectionName || '—';
  const institutionName = overview?.institution?.name || user?.institutionName || 'Institution not available';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f4faf8', color: '#0e3e3b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <DemoBanner />

      {/* ── TOP NAVIGATION BAR (Matching Reference) ────────────────────── */}
      <header
        style={{
          height: '60px',
          background: '#ffffff',
          borderBottom: '1px solid #dcebe6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left: Brand & Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SchoolLogoBadge size={36} radius={8} fallback={
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #117a6b 0%, #1fb589 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '16px',
                boxShadow: '0 2px 5px rgba(17, 122, 107, 0.25)',
              }}
            >
              🇳🇵
            </div>
            } />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', lineHeight: 1.2 }}>
                {institutionName}
              </div>
              <div style={{ fontSize: '11px', color: '#117a6b', fontWeight: '700' }}>
                Student Digital Learning Portal
              </div>
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: '#dcebe6' }} />

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#5f736f' }}>
            <span>Student Hub</span>
            <ChevronRight size={14} />
            <span style={{ fontWeight: '700', color: '#0e3e3b' }}>
              {activeNav === 'OVERVIEW' && 'Academic Overview'}
              {activeNav === 'SUBJECTS' && 'My Subjects & CDC Textbooks'}
              {activeNav === 'ATTENDANCE' && 'Subject-wise & Overall Attendance'}
              {activeNav === 'RESULTS' && 'Terminal Marks & CDC Report Card'}
              {activeNav === 'TIMETABLE' && 'Class Timetable'}
              {activeNav === 'ASSIGNMENTS' && 'Homework & Assignments'}
              {activeNav === 'QUIZZES' && 'Interactive Quizzes & Tests'}
              {activeNav === 'MATERIALS' && 'Teacher-Shared Study Materials'}
              {activeNav === 'NOTES' && 'Smart Board Digital Whiteboard Notes'}
              {activeNav === 'ACTIVITIES' && 'Virtual Lab Simulations & Activities'}
              {activeNav === 'AI' && 'Bilingual AI Curriculum Tutor'}
              {activeNav === 'ANNOUNCEMENTS' && 'School Announcements & Bulletins'}
              {activeNav === 'PROFILE' && 'Student Profile & Account Security'}
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a
            href="/smartboard/index.html"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: '#effaf6',
              color: '#117a6b',
              border: '1px solid #bbf7d0',
              fontSize: '12px',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            <Presentation size={14} />
            <span>Open Smart Board</span>
          </a>

          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            title="Toggle Fullscreen"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: '1px solid #dcebe6',
              background: '#ffffff',
              color: '#5f736f',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Maximize2 size={15} />
          </button>

          <HiddenNavStyle hidden={hiddenNavs} />
          <NotificationCenter
            extraItems={announcements.map((a: any, i: number) => ({
              id: `ann-${a._id || a.id || i}`,
              title: a.title || 'School announcement',
              message: a.content || a.message || '',
              type: 'ANNOUNCEMENT' as const,
              createdAt: a.createdAt || a.publishedAt || new Date().toISOString(),
            }))}
            onItemClick={(item) => { if (item.id.startsWith('ann-')) setActiveNav('ANNOUNCEMENTS'); }}
          />

          <div style={{ height: '24px', width: '1px', background: '#dcebe6' }} />

          {/* User profile pill */}
          <div
            onClick={() => setActiveNav('PROFILE')}
            title="View Student Profile & Security"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 10px',
              background: activeNav === 'PROFILE' ? '#e6f7f0' : '#f4faf8',
              border: activeNav === 'PROFILE' ? '1px solid #117a6b' : '1px solid #dcebe6',
              borderRadius: '24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#117a6b',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {studentName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b' }}>
                {studentName}
              </div>
              <div style={{ fontSize: '11px', color: '#5f736f', fontWeight: '600' }}>
                Roll #{rollNumber} • {className}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE (SIDEBAR + CONTENT) ─────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 60px)' }}>
        {/* Collapsible Left Sidebar */}
        <aside
          style={{
            width: collapsedSidebar ? '72px' : '250px',
            background: '#ffffff',
            borderRight: '1px solid #dcebe6',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'width 0.2s ease',
            flexShrink: 0,
          }}
        >
          <div style={{ padding: '16px 10px', overflowY: 'auto' }}>
            {/* GROUP 1: Academic */}
            <div style={{ marginBottom: '16px' }}>
              {!collapsedSidebar && (
                <div
                  onClick={() => setAcademicMenuOpen(!academicMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#8da19d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                  }}
                >
                  <span>Academic</span>
                  {academicMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              )}

              {(academicMenuOpen || collapsedSidebar) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  <button
                    onClick={() => setActiveNav('OVERVIEW')}
                    title="Overview"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: activeNav === 'OVERVIEW' ? '#e6f7f0' : 'transparent',
                      color: activeNav === 'OVERVIEW' ? '#117a6b' : '#4b605b',
                      borderLeft: activeNav === 'OVERVIEW' ? '3px solid #117a6b' : '3px solid transparent',
                    }}
                  >
                    <Layers size={17} color={activeNav === 'OVERVIEW' ? '#117a6b' : '#5f736f'} />
                    {!collapsedSidebar && <span>Overview</span>}
                  </button>

                  <button
                    onClick={() => setActiveNav('SUBJECTS')}
                    title="My Subjects"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: activeNav === 'SUBJECTS' ? '#e6f7f0' : 'transparent',
                      color: activeNav === 'SUBJECTS' ? '#117a6b' : '#4b605b',
                      borderLeft: activeNav === 'SUBJECTS' ? '3px solid #117a6b' : '3px solid transparent',
                    }}
                  >
                    <BookOpen size={17} color={activeNav === 'SUBJECTS' ? '#117a6b' : '#5f736f'} />
                    {!collapsedSidebar && <span>My Subjects</span>}
                  </button>

                  <button
                    onClick={() => setActiveNav('ATTENDANCE')}
                    title="Attendance"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: activeNav === 'ATTENDANCE' ? '#e6f7f0' : 'transparent',
                      color: activeNav === 'ATTENDANCE' ? '#117a6b' : '#4b605b',
                      borderLeft: activeNav === 'ATTENDANCE' ? '3px solid #117a6b' : '3px solid transparent',
                    }}
                  >
                    <ClipboardList size={17} color={activeNav === 'ATTENDANCE' ? '#117a6b' : '#5f736f'} />
                    {!collapsedSidebar && <span>Attendance</span>}
                  </button>

                  <button
                    onClick={() => setActiveNav('RESULTS')}
                    title="Results & Marks"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: activeNav === 'RESULTS' ? '#e6f7f0' : 'transparent',
                      color: activeNav === 'RESULTS' ? '#117a6b' : '#4b605b',
                      borderLeft: activeNav === 'RESULTS' ? '3px solid #117a6b' : '3px solid transparent',
                    }}
                  >
                    <Award size={17} color={activeNav === 'RESULTS' ? '#117a6b' : '#5f736f'} />
                    {!collapsedSidebar && <span>Results & Marks</span>}
                  </button>
                </div>
              )}
            </div>

            {/* GROUP 2: Coursework & Submissions */}
            <div data-nav-feature="GROUP_COURSEWORK" style={{ marginBottom: '16px' }}>
              {!collapsedSidebar && (
                <div
                  onClick={() => setCourseworkMenuOpen(!courseworkMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#8da19d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                  }}
                >
                  <span>Coursework</span>
                  {courseworkMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              )}

              {(courseworkMenuOpen || collapsedSidebar) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  <button data-nav-feature="ASSIGNMENTS"
                    onClick={() => setActiveNav('ASSIGNMENTS')}
                    title="Assignments"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: activeNav === 'ASSIGNMENTS' ? '#e6f7f0' : 'transparent',
                      color: activeNav === 'ASSIGNMENTS' ? '#117a6b' : '#4b605b',
                      borderLeft: activeNav === 'ASSIGNMENTS' ? '3px solid #117a6b' : '3px solid transparent',
                    }}
                  >
                    <FileText size={17} color={activeNav === 'ASSIGNMENTS' ? '#117a6b' : '#5f736f'} />
                    {!collapsedSidebar && <span>Assignments</span>}
                  </button>

                  <button data-nav-feature="QUIZZES"
                    onClick={() => setActiveNav('QUIZZES')}
                    title="Quizzes & Tests"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: activeNav === 'QUIZZES' ? '#e6f7f0' : 'transparent',
                      color: activeNav === 'QUIZZES' ? '#117a6b' : '#4b605b',
                      borderLeft: activeNav === 'QUIZZES' ? '3px solid #117a6b' : '3px solid transparent',
                    }}
                  >
                    <HelpCircle size={17} color={activeNav === 'QUIZZES' ? '#117a6b' : '#5f736f'} />
                    {!collapsedSidebar && <span>Quizzes & Tests</span>}
                  </button>

                  <button data-nav-feature="MATERIALS"
                    onClick={() => setActiveNav('MATERIALS')}
                    title="Study Materials"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: activeNav === 'MATERIALS' ? '#e6f7f0' : 'transparent',
                      color: activeNav === 'MATERIALS' ? '#117a6b' : '#4b605b',
                      borderLeft: activeNav === 'MATERIALS' ? '3px solid #117a6b' : '3px solid transparent',
                    }}
                  >
                    <Folder size={17} color={activeNav === 'MATERIALS' ? '#117a6b' : '#5f736f'} />
                    {!collapsedSidebar && <span>Study Materials</span>}
                  </button>

                  <button data-nav-feature="NOTES"
                    onClick={() => setActiveNav('NOTES')}
                    title="Smart Board Notes"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: activeNav === 'NOTES' ? '#e6f7f0' : 'transparent',
                      color: activeNav === 'NOTES' ? '#117a6b' : '#4b605b',
                      borderLeft: activeNav === 'NOTES' ? '3px solid #117a6b' : '3px solid transparent',
                    }}
                  >
                    <Presentation size={17} color={activeNav === 'NOTES' ? '#117a6b' : '#5f736f'} />
                    {!collapsedSidebar && <span>Smart Board Notes</span>}
                  </button>
                </div>
              )}
            </div>

            {/* GROUP 3: Timetable */}
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => setActiveNav('TIMETABLE')}
                title="Class Timetable"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: activeNav === 'TIMETABLE' ? '#e6f7f0' : 'transparent',
                  color: activeNav === 'TIMETABLE' ? '#117a6b' : '#4b605b',
                  borderLeft: activeNav === 'TIMETABLE' ? '3px solid #117a6b' : '3px solid transparent',
                }}
              >
                <Clock size={17} color={activeNav === 'TIMETABLE' ? '#117a6b' : '#5f736f'} />
                {!collapsedSidebar && <span>Class Timetable</span>}
              </button>
            </div>

            {/* GROUP 4: Insights & Practice */}
            <div style={{ marginBottom: '16px' }}>
              {!collapsedSidebar && (
                <div
                  onClick={() => setInsightsMenuOpen(!insightsMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#8da19d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                  }}
                >
                  <span>Practice & AI</span>
                  {insightsMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              )}

              {(insightsMenuOpen || collapsedSidebar) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  <button data-nav-feature="ACTIVITIES"
                    onClick={() => setActiveNav('ACTIVITIES')}
                    title="Simulations & Labs"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: activeNav === 'ACTIVITIES' ? '#e6f7f0' : 'transparent',
                      color: activeNav === 'ACTIVITIES' ? '#117a6b' : '#4b605b',
                      borderLeft: activeNav === 'ACTIVITIES' ? '3px solid #117a6b' : '3px solid transparent',
                    }}
                  >
                    <Atom size={17} color={activeNav === 'ACTIVITIES' ? '#117a6b' : '#5f736f'} />
                    {!collapsedSidebar && <span>Virtual Labs & Sims</span>}
                  </button>

                  <button data-nav-feature="AI"
                    onClick={() => setActiveNav('AI')}
                    title="AI Tutor"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: activeNav === 'AI' ? '#e6f7f0' : 'transparent',
                      color: activeNav === 'AI' ? '#117a6b' : '#4b605b',
                      borderLeft: activeNav === 'AI' ? '3px solid #117a6b' : '3px solid transparent',
                    }}
                  >
                    <Sparkles size={17} color={activeNav === 'AI' ? '#117a6b' : '#5f736f'} />
                    {!collapsedSidebar && <span>AI Learning Assistant</span>}
                  </button>
                </div>
              )}
            </div>

            {/* GROUP 5: Communication */}
            <div>
              {!collapsedSidebar && (
                <div
                  onClick={() => setCommMenuOpen(!commMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#8da19d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                  }}
                >
                  <span>Communication</span>
                  {commMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              )}

              {(commMenuOpen || collapsedSidebar) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  <button
                    onClick={() => setActiveNav('ANNOUNCEMENTS')}
                    title="Announcements"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: activeNav === 'ANNOUNCEMENTS' ? '#e6f7f0' : 'transparent',
                      color: activeNav === 'ANNOUNCEMENTS' ? '#117a6b' : '#4b605b',
                      borderLeft: activeNav === 'ANNOUNCEMENTS' ? '3px solid #117a6b' : '3px solid transparent',
                    }}
                  >
                    <Bell size={17} color={activeNav === 'ANNOUNCEMENTS' ? '#117a6b' : '#5f736f'} />
                    {!collapsedSidebar && (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span>Announcements</span>
                        {announcements.length > 0 && (
                          <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                            {announcements.length}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* GROUP 6: Account & Security */}
            <div style={{ marginTop: '16px' }}>
              {!collapsedSidebar && (
                <div
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#8da19d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <span>Account & Security</span>
                </div>
              )}
              <button
                onClick={() => setActiveNav('PROFILE')}
                title="Profile & Security"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  background: activeNav === 'PROFILE' ? '#e6f7f0' : 'transparent',
                  color: activeNav === 'PROFILE' ? '#117a6b' : '#4b605b',
                  borderLeft: activeNav === 'PROFILE' ? '3px solid #117a6b' : '3px solid transparent',
                }}
              >
                <User size={17} color={activeNav === 'PROFILE' ? '#117a6b' : '#5f736f'} />
                {!collapsedSidebar && <span>Profile & Security</span>}
              </button>
            </div>
          </div>

          {/* Bottom collapse button */}
          <div style={{ padding: '12px', borderTop: '1px solid #dcebe6' }}>
            <button
              onClick={() => setCollapsedSidebar(!collapsedSidebar)}
              style={{
                width: '100%',
                padding: '8px',
                background: 'transparent',
                border: '1px solid #dcebe6',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#5f736f',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {collapsedSidebar ? '>>' : '<< Collapse'}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ────────────────────────────────────────── */}
        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          {loadIssues.length > 0 && (
            <div style={{ marginBottom: '16px', background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#3b2f8f', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span>Some information could not be loaded — {loadIssues.join(' • ')}</span>
              <button onClick={() => loadStudentData()} style={{ fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#3b2f8f' }}>Retry</button>
            </div>
          )}
          {/* 1. STUDENT PROFILE CARD (Matching Reference Teacher Card) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #dcebe6',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                {/* Badges row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      background: '#ebf5f1',
                      color: '#4b605b',
                      padding: '4px 10px',
                      borderRadius: '16px',
                    }}
                  >
                    Student Academic Portal
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '4px 10px',
                      borderRadius: '16px',
                    }}
                  >
                    Active Student
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      background: '#f4faf8',
                      color: '#5f736f',
                      border: '1px solid #dcebe6',
                      padding: '3px 10px',
                      borderRadius: '16px',
                      fontFamily: 'monospace',
                    }}
                  >
                    Roll #{rollNumber} • {sectionName}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      background: '#eff6ff',
                      color: '#2563eb',
                      padding: '4px 10px',
                      borderRadius: '16px',
                    }}
                  >
                    Admission: {admissionNumber}
                  </span>
                </div>

                {/* Name */}
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0e3e3b', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>{studentName}</span>
                  {studentNepali && (
                    <span style={{ fontSize: '18px', fontWeight: '600', color: '#5f736f' }}>
                      ({studentNepali})
                    </span>
                  )}
                </h1>

                {/* Metadata subtitle */}
                <p style={{ fontSize: '13px', color: '#5f736f', margin: 0 }}>
                  Official Email: <strong style={{ color: '#2f4f4c' }}>{user?.email || `${studentName.toLowerCase().replace(/\s+/g, '.')}@dhambojhi.edu.np`}</strong> • {className} ({sectionName}) • {institutionName}
                </p>
              </div>

              {/* Right: Sign out button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#ffffff',
                  border: '1px solid #dcebe6',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#4b605b',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 1: OVERVIEW (Matching Screenshot 1 & 2)
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'OVERVIEW' && (
            <div>
              {/* Today's Schedule Card */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #dcebe6',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                      My Classes & Today's Schedule
                    </h2>
                    <p style={{ fontSize: '13px', color: '#5f736f', margin: 0 }}>
                      From the published weekly timetable — scheduled class periods, teachers, and rooms for today.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveNav('TIMETABLE')}
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#117a6b',
                      background: '#e6f7f0',
                      border: '1px solid #bfeede',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    View Full Weekly Timetable →
                  </button>
                </div>

                {(overview?.todayTimetable || []).length === 0 ? (
                  <div
                    style={{
                      background: '#f4faf8',
                      border: '1px dashed #cfdcd8',
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      color: '#5f736f',
                      fontSize: '13px',
                    }}
                  >
                    No scheduled periods found for today. Check the full weekly timetable for upcoming classes.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                    {(overview?.todayTimetable || []).map((slot: any) => (
                      <div
                        key={slot.id || slot._id}
                        style={{
                          padding: '16px',
                          background: '#f4faf8',
                          borderRadius: '12px',
                          border: '1px solid #dcebe6',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              color: '#117a6b',
                              background: '#e6f7f0',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            Period {slot.periodNumber}
                          </span>
                          <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700' }}>
                            {slot.startTime} – {slot.endTime}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                          {slot.centralSubjectId?.name}
                        </h4>
                        <div style={{ fontSize: '12px', color: '#5f736f', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Teacher: {slot.teacherId?.fullName || 'Subject Faculty'}</span>
                          <span style={{ fontWeight: '700', color: '#2f4f4c' }}>{slot.roomNumber || '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4 Stat Cards Row (Matching Screenshot 1) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
                {/* Stat 1: Assigned Courses */}
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#5f736f', fontWeight: '600', margin: 0 }}>Enrolled Subjects</p>
                    <h3 style={{ fontSize: '30px', fontWeight: '900', color: '#0e3e3b', margin: '8px 0 4px 0' }}>
                      {subjects.length}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>National CDC Classes 1–12</p>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} color="#117a6b" />
                  </div>
                </div>

                {/* Stat 2: Overall Attendance */}
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#5f736f', fontWeight: '600', margin: 0 }}>Overall Attendance</p>
                    <h3 style={{ fontSize: '30px', fontWeight: '900', color: '#117a6b', margin: '8px 0 4px 0' }}>
                      {attendance?.attendanceRate || overview?.stats?.attendanceRate || '—'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5f736f' }}>
                      <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#117a6b' }} />
                      <span>{attendance?.presentDays ?? 0} of {attendance?.totalDays ?? 0} days present</span>
                    </div>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={20} color="#117a6b" />
                  </div>
                </div>

                {/* Stat 3: Academic GPA */}
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#5f736f', fontWeight: '600', margin: 0 }}>Current Terminal GPA</p>
                    <h3 style={{ fontSize: '30px', fontWeight: '900', color: '#2563eb', margin: '8px 0 4px 0' }}>
                      {results?.overallGpa ?? overview?.stats?.gpa ?? '—'}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', margin: 0 }}>
                      {results?.overallGpa != null ? 'Based on published results' : 'No published results yet'}
                    </p>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={20} color="#2563eb" />
                  </div>
                </div>

                {/* Stat 4: Pending Submissions & Work */}
                <div data-nav-feature="CARD_COURSEWORK" style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#5f736f', fontWeight: '600', margin: 0 }}>Pending Coursework</p>
                    <h3 style={{ fontSize: '30px', fontWeight: '900', color: '#6d5bd0', margin: '8px 0 4px 0' }}>
                      {overview?.stats?.pendingAssignments ?? 0}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>Active homework & quizzes</p>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color="#6d5bd0" />
                  </div>
                </div>
              </div>

              <StudentSnapshot attendance={attendance} results={results} />

              {/* Enrolled Courses Grid Header (Matching Screenshot 2) */}
              <div style={{ background: '#ffffff', border: '1px solid #dcebe6', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                      My Enrolled Teaching Subjects
                    </h2>
                    <p style={{ fontSize: '13px', color: '#5f736f', margin: 0 }}>
                      Authorized CDC curriculum courses with interactive textbooks, shared notes, and laboratory simulations.
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '800',
                      padding: '4px 12px',
                      background: '#ebf5f1',
                      color: '#4b605b',
                      borderRadius: '8px',
                    }}
                  >
                    {subjects.length} Enrolled Subjects
                  </span>
                </div>

                {/* 3-Column Course Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {subjects.map((item: any, idx: number) => {
                    const sub = item.subject;
                    const teacher = item.teacher;
                    const subAttendance = (attendance?.subjectBreakdown || []).find((row: any) => String(row.subjectId) === String(sub?._id || sub?.id))?.percentage ?? null;
                    const primaryBook = item.textbooks?.[0];

                    return (
                      <div
                        key={item.allocationId || idx}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #dcebe6',
                          borderRadius: '14px',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div>
                          {/* Subject Code & Section Badges */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: '800',
                                padding: '3px 8px',
                                background: '#ebf5f1',
                                color: '#2f4f4c',
                                borderRadius: '6px',
                                fontFamily: 'monospace',
                              }}
                            >
                              {sub?.code || ''}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: '700',
                                color: '#5f736f',
                                background: '#f4faf8',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              {className} • {sectionName}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 2px 0' }}>
                            {sub?.name}
                          </h3>
                          <div style={{ fontSize: '13px', color: '#5f736f', fontWeight: '600', marginBottom: '16px' }}>
                            {sub?.nameNepali || ''}
                          </div>

                          {/* Teacher name */}
                          <div style={{ fontSize: '12px', color: '#4b605b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UserCheck size={14} color="#117a6b" />
                            <span>Teacher: <strong>{teacher?.fullName || 'Not assigned yet'}</strong></span>
                          </div>

                          {/* Quick Metrics */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              background: '#f4faf8',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              marginBottom: '16px',
                              fontSize: '12px',
                              textAlign: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: '800', color: '#0e3e3b' }}>{sub?.creditHours ?? '—'}</div>
                              <div style={{ fontSize: '10px', color: '#5f736f' }}>Credits</div>
                            </div>
                            <div>
                              <div style={{ fontWeight: '800', color: '#0e3e3b' }}>{item.textbooks?.length ?? 0}</div>
                              <div style={{ fontSize: '10px', color: '#5f736f' }}>Textbooks</div>
                            </div>
                            <div>
                              <div style={{ fontWeight: '800', color: '#0e3e3b' }}>{item.simulations?.length || 0}</div>
                              <div style={{ fontSize: '10px', color: '#5f736f' }}>Simulations</div>
                            </div>
                          </div>

                          {/* Attendance Progress Bar */}
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>
                              <span style={{ color: '#5f736f' }}>Subject Attendance</span>
                              <span style={{ color: '#117a6b' }}>                              {subAttendance === null ? 'No data' : `${subAttendance}%`}</span>
                            </div>
                            <div style={{ height: '6px', width: '100%', background: '#dcebe6', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${subAttendance}%`,
                                  background: subAttendance >= 80 ? '#1fb589' : '#6d5bd0',
                                  borderRadius: '4px',
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          {primaryBook ? (
                            <button
                              onClick={() => setActiveReaderTextbook(primaryBook)}
                              style={{
                                flex: 1,
                                padding: '9px 12px',
                                background: '#117a6b',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              <BookOpen size={14} /> Read CDC Book
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedSubject(item);
                                setActiveNav('SUBJECTS');
                              }}
                              style={{
                                flex: 1,
                                padding: '9px 12px',
                                background: '#117a6b',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              Open Workspace →
                            </button>
                          )}

                          <button data-nav-feature="MATERIALS"
                            onClick={() => {
                              setSelectedSubject(item);
                              setActiveNav('MATERIALS');
                            }}
                            title="Shared Materials"
                            style={{
                              padding: '9px 12px',
                              background: '#ebf5f1',
                              color: '#2f4f4c',
                              border: '1px solid #cfdcd8',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            <Folder size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 2: SUBJECTS & TEXTBOOKS (Matching Screenshot 3)
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'SUBJECTS' && (
            <div>
              {/* Subject pill selectors (Matching Screenshot 3 top bar) */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #dcebe6',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#5f736f', marginRight: '6px' }}>
                  My Courses:
                </span>
                {subjects.map((item: any, idx: number) => {
                  const isSelected = (selectedSubject?.allocationId || selectedSubject?.subject?._id) === (item.allocationId || item.subject?._id);
                  return (
                    <button
                      key={item.allocationId || idx}
                      onClick={() => setSelectedSubject(item)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: isSelected ? 'none' : '1px solid #dcebe6',
                        background: isSelected ? '#134744' : '#f4faf8',
                        color: isSelected ? '#ffffff' : '#4b605b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span>{item.subject?.code}</span>
                      <span>{item.subject?.name}</span>
                    </button>
                  );
                })}
              </div>

              {selectedSubject && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Selected Subject Header Banner */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dcebe6',
                      borderRadius: '16px',
                      padding: '24px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '3px 8px',
                              background: '#e6f7f0',
                              color: '#117a6b',
                              borderRadius: '6px',
                              fontFamily: 'monospace',
                            }}
                          >
                            {selectedSubject.subject?.code}
                          </span>
                          <span style={{ fontSize: '12px', color: '#5f736f' }}>
                            {className} ({sectionName}) • Credit Hours: {selectedSubject.subject?.creditHours ?? '—'}
                          </span>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                          {selectedSubject.subject?.name}
                        </h2>
                        <div style={{ fontSize: '14px', color: '#5f736f', fontWeight: '600' }}>
                          {selectedSubject.subject?.nameNepali}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button data-nav-feature="MATERIALS"
                          onClick={() => setActiveNav('MATERIALS')}
                          style={{
                            padding: '8px 14px',
                            background: '#f4faf8',
                            border: '1px solid #dcebe6',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#2f4f4c',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Folder size={14} /> Shared Materials
                        </button>
                        <button data-nav-feature="ASSIGNMENTS"
                          onClick={() => setActiveNav('ASSIGNMENTS')}
                          style={{
                            padding: '8px 14px',
                            background: '#f4faf8',
                            border: '1px solid #dcebe6',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#2f4f4c',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <FileText size={14} /> Assignments
                        </button>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #ebf5f1', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '13px', color: '#4b605b' }}>
                        Assigned Subject Teacher: <strong>{selectedSubject.teacher?.fullName || 'Subject Faculty'}</strong> ({selectedSubject.teacher?.email || 'school.faculty@nepaledu.gov.np'})
                      </div>
                      <div style={{ fontSize: '12px', color: '#117a6b', fontWeight: '700' }}>
                        CDC Approved Curriculum Framework
                      </div>
                    </div>
                  </div>

                  {/* Digital Textbooks Section */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dcebe6',
                      borderRadius: '16px',
                      padding: '24px',
                    }}
                  >
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', marginBottom: '16px' }}>
                      CDC Curriculum Digital Textbooks
                    </h3>

                    {(selectedSubject.textbooks || []).length === 0 ? (
                      <p style={{ fontSize: '13px', color: '#5f736f' }}>
                        {selectedSubject.digitalTextbook?.reason || 'No digital textbook is currently configured for this subject.'}
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                        {(selectedSubject.textbooks || []).map((tb: any) => (
                          <div
                            key={tb.id || tb._id}
                            style={{
                              border: '1px solid #dcebe6',
                              borderRadius: '12px',
                              padding: '16px',
                              background: '#f4faf8',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px' }}>
                                  {tb.medium} Edition
                                </span>
                                <span style={{ fontSize: '11px', color: '#5f736f' }}>CDC Approved</span>
                              </div>
                              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                                {tb.title}
                              </h4>
                              {tb.titleNepali && (
                                <div style={{ fontSize: '12px', color: '#5f736f', marginBottom: '12px' }}>
                                  {tb.titleNepali}
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => setActiveReaderTextbook(tb)}
                              style={{
                                width: '100%',
                                padding: '9px',
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              <BookOpen size={15} /> 📖 Read Digital Textbook (PDF)
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Simulations for this subject */}
                    {selectedSubject.simulations?.length > 0 && (
                      <div style={{ marginTop: '24px', borderTop: '1px solid #ebf5f1', paddingTop: '20px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', marginBottom: '14px' }}>
                          Aligned Interactive Virtual Labs
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                          {selectedSubject.simulations.map((sim: any) => (
                            <div
                              key={sim.id || sim._id}
                              style={{
                                padding: '14px',
                                background: '#effaf6',
                                border: '1px solid #bbf7d0',
                                borderRadius: '10px',
                              }}
                            >
                              <div style={{ fontSize: '11px', fontWeight: '800', color: '#117a6b', marginBottom: '4px' }}>
                                {sim.simulationType} • {sim.domain || 'Science'}
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', marginBottom: '4px' }}>
                                {sim.title}
                              </div>
                              <button
                                onClick={() => setActiveSim(sim)}
                                style={{
                                  marginTop: '8px',
                                  padding: '6px 12px',
                                  background: '#117a6b',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                }}
                              >
                                Launch Virtual Lab →
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 3: ATTENDANCE (Overall + Subject-wise Breakdown)
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'ATTENDANCE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #dcebe6' }}>
                  <div style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Total School Days</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#0e3e3b', marginTop: '6px' }}>
                    {attendance?.totalDays ?? 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '4px' }}>Official Academic Register</div>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #dcebe6' }}>
                  <div style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Present Sessions</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#117a6b', marginTop: '6px' }}>
                    {attendance?.presentDays ?? 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#117a6b', fontWeight: '700', marginTop: '4px' }}>Regular & Verified</div>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #dcebe6' }}>
                  <div style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Absent Sessions</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', marginTop: '6px' }}>
                    {attendance?.absentDays ?? 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '4px' }}>Days absent (incl. leave)</div>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #dcebe6' }}>
                  <div style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Overall Attendance %</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#117a6b', marginTop: '6px' }}>
                    {attendance?.attendanceRate ?? '—'}
                  </div>
                  <div style={{ fontSize: '11px', color: attendance?.percentage != null && attendance.percentage < 75 ? '#dc2626' : '#117a6b', fontWeight: '700', marginTop: '4px' }}>
                    {attendance?.percentage == null ? 'No attendance recorded yet' : attendance.percentage >= 75 ? 'Meets the 75% exam requirement' : 'Below the 75% exam requirement'}
                  </div>
                </div>
              </div>

              {/* Subject-Wise Attendance Breakdown Table */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #dcebe6',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                      Subject-Wise Attendance Breakdown
                    </h3>
                    <p style={{ fontSize: '13px', color: '#5f736f', margin: 0 }}>
                      Individual session attendance percentage for every enrolled subject and assigned teacher.
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#117a6b', background: '#e6f7f0', padding: '4px 10px', borderRadius: '8px' }}>
                    CDC Requirement: 75% Min.
                  </span>
                </div>

                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #dcebe6' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', fontWeight: '800', color: '#4b605b' }}>Subject Code</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', color: '#4b605b' }}>Subject Name</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', color: '#4b605b' }}>Teacher Faculty</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', color: '#4b605b', textAlign: 'center' }}>Total Sessions</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', color: '#4b605b', textAlign: 'center' }}>Attended</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', color: '#4b605b' }}>Attendance Rate</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', color: '#4b605b', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(attendance?.subjectBreakdown || []).map((row: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid #ebf5f1' }}>
                          <td style={{ padding: '12px 16px', fontWeight: '800', fontFamily: 'monospace', color: '#2f4f4c' }}>
                            {row.subjectCode}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0e3e3b' }}>
                            {row.subjectName}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#5f736f' }}>
                            {row.teacherName}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700' }}>
                            {row.totalSessions}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '800', color: '#117a6b' }}>
                            {row.attendedSessions}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '6px', background: '#dcebe6', borderRadius: '4px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${row.percentage}%`,
                                    background: row.percentage >= 80 ? '#1fb589' : '#6d5bd0',
                                  }}
                                />
                              </div>
                              <span style={{ fontWeight: '800', color: '#0e3e3b', width: '38px' }}>
                                {row.attendanceRate}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '800',
                                background: row.percentage >= 80 ? '#e6f7f0' : '#f5f3ff',
                                color: row.percentage >= 80 ? '#117a6b' : '#6d5bd0',
                              }}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Date-wise Daily Roll Call History */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #dcebe6',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', marginBottom: '14px' }}>
                  Daily Attendance Log
                </h3>
                <div style={{ maxHeight: '360px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #dcebe6' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: '10px 16px', fontWeight: '800' }}>Date</th>
                        <th style={{ padding: '10px 16px', fontWeight: '800' }}>Status</th>
                        <th style={{ padding: '10px 16px', fontWeight: '800' }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(attendance?.history || []).map((row: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid #ebf5f1' }}>
                          <td style={{ padding: '10px 16px', fontWeight: '600' }}>
                            {new Date(row.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '800',
                                background: row.status === 'PRESENT' ? '#effaf6' : '#fef2f2',
                                color: row.status === 'PRESENT' ? '#16a34a' : '#dc2626',
                              }}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px', color: '#5f736f' }}>
                            {row.remarks || 'Regular Daily Roll Call'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 4: RESULTS & MARKS (Terminal Exam + Continuous Assessment)
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'RESULTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #dcebe6',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                      Official Published Examination Marksheet
                    </h3>
                    <p style={{ fontSize: '13px', color: '#5f736f', margin: 0 }}>
                      Curriculum Development Centre (CDC) letter grading standard with verified teacher entry.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={handleDownloadMyReportCard}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 16px',
                        background: '#117a6b',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(17, 122, 107, 0.2)',
                      }}
                    >
                      <Download size={15} /> Download Official CDC Report Card (PDF)
                    </button>
                    <div
                      style={{
                        padding: '9px 16px',
                        background: '#eff6ff',
                        borderRadius: '8px',
                        color: '#2563eb',
                        fontWeight: '900',
                        fontSize: '14px',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      Overall GPA: {results?.overallGpa ?? '—'}
                    </div>
                  </div>
                </div>

                <div style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid #dcebe6' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', fontWeight: '800' }}>Examination</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800' }}>Subject</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', textAlign: 'center' }}>Credit Hours</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', textAlign: 'center' }}>Total Marks</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', textAlign: 'center' }}>Marks Obtained</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', textAlign: 'center' }}>Letter Grade</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', textAlign: 'center' }}>Grade Point (GPA)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(results?.results || []).map((r: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid #ebf5f1' }}>
                          <td style={{ padding: '12px 16px', fontWeight: '700', color: '#117a6b' }}>
                            {r.examName}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0e3e3b' }}>
                            {r.subjectName}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: '#5f736f' }}>
                            {r.creditHours ?? '—'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {r.totalMarks}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '900', color: '#0e3e3b' }}>
                            {r.marksObtained ?? 'Pending'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '800',
                                background: '#eff6ff',
                                color: '#2563eb',
                              }}
                            >
                              {r.grade || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '800', color: '#117a6b' }}>
                            {r.gpa ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 5: ASSIGNMENTS (StudentAssignmentPortal)
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'ASSIGNMENTS' && (
            <div>
              <StudentAssignmentPortal overview={overview} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 6: QUIZZES (StudentQuizPortal)
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'QUIZZES' && (
            <div>
              <StudentQuizPortal overview={overview} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 7: STUDY MATERIALS (StudentMaterialPortal)
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'MATERIALS' && (
            <div>
              <StudentMaterialPortal overview={overview} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 8: SMART BOARD NOTES
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'NOTES' && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #dcebe6',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                    Classroom Smart Board Digital Whiteboard Notes
                  </h3>
                  <p style={{ fontSize: '13px', color: '#5f736f', margin: 0 }}>
                    Whiteboard drawings, mathematical proofs, diagrams, and annotated textbook pages shared by your subject teachers.
                  </p>
                </div>
                <a
                  href="/smartboard/index.html"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#117a6b',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textDecoration: 'none',
                  }}
                >
                  <Presentation size={14} /> Open Live Whiteboard
                </a>
              </div>

              {notes.length === 0 ? (
                <div
                  style={{
                    padding: '32px',
                    textAlign: 'center',
                    background: '#f4faf8',
                    borderRadius: '12px',
                    border: '1px dashed #cfdcd8',
                    color: '#5f736f',
                    fontSize: '13px',
                  }}
                >
                  No Smart Board notes shared yet. Teacher notes will appear here automatically when published from class sessions.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {notes.map((n: any) => (
                    <div
                      key={n.id || n._id}
                      style={{
                        padding: '18px',
                        border: '1px solid #dcebe6',
                        borderRadius: '12px',
                        background: '#f4faf8',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#117a6b', background: '#e6f7f0', padding: '2px 8px', borderRadius: '4px' }}>
                            Shared by {n.teacherId?.fullName || 'Faculty'}
                          </span>
                          <span style={{ fontSize: '11px', color: '#5f736f' }}>
                            {new Date(n.sessionDate).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 6px 0' }}>
                          {n.title}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#5f736f', margin: '0 0 14px 0' }}>
                          {(() => {
                            const info = describeNote(n);
                            if (info.text) return info.text.length > 110 ? `${info.text.slice(0, 110)}…` : info.text;
                            if (info.images.length) return `${info.images.length} board snapshot${info.images.length === 1 ? '' : 's'}`;
                            return 'No preview available for this note.';
                          })()}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setViewNote(n)}
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            padding: '8px',
                            background: '#117a6b',
                            color: '#ffffff',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Open note →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 9: CLASS TIMETABLE (Weekly Grid)
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'TIMETABLE' && (
            <div>
              {overview?.academicInfo?.sectionId ? (
                <ClassTimetable
                  sectionId={overview.academicInfo.sectionId}
                  onOpenTextbook={(tb) => setActiveReaderTextbook(tb)}
                />
              ) : (
                <p style={{ color: '#5f736f', fontSize: '13px' }}>Enrolled section timetable record not found.</p>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 10: SIMULATIONS & ACTIVITIES
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'ACTIVITIES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #dcebe6' }}>
                  <div style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Grade {overview?.academicInfo?.gradeNumber || 10} Virtual Labs</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#0284c7', marginTop: '6px' }}>
                    {studentSimulations.length} Simulations
                  </div>
                  <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '4px' }}>Aligned with Nepal CDC Curriculum</div>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #dcebe6' }}>
                  <div style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Teacher Assigned Tasks</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#117a6b', marginTop: '6px' }}>
                    {assignedActivities.length} Assignments
                  </div>
                  <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '4px' }}>From your subject teachers</div>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #dcebe6' }}>
                  <div style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Completed Exercises</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#16a34a', marginTop: '6px' }}>
                    {studentProgress.filter((p) => p.isCompleted).length} Mastered
                  </div>
                  <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '4px' }}>Across all subjects</div>
                </div>
              </div>

              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: '8px', background: '#dcebe6', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
                <button
                  onClick={() => setStudentSubTab('SIMS')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    background: studentSubTab === 'SIMS' ? '#ffffff' : 'transparent',
                    color: studentSubTab === 'SIMS' ? '#134744' : '#5f736f',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  🎮 Virtual Labs & Sims ({studentSimulations.length})
                </button>
                <button
                  onClick={() => setStudentSubTab('ASSIGNED')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    background: studentSubTab === 'ASSIGNED' ? '#ffffff' : 'transparent',
                    color: studentSubTab === 'ASSIGNED' ? '#134744' : '#5f736f',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  📋 Teacher Homework ({assignedActivities.length})
                </button>
                <button
                  onClick={() => setStudentSubTab('PRACTICE')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    background: studentSubTab === 'PRACTICE' ? '#ffffff' : 'transparent',
                    color: studentSubTab === 'PRACTICE' ? '#134744' : '#5f736f',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  🏆 Practice Activities ({practiceActivities.length})
                </button>
                <button
                  onClick={() => setStudentSubTab('EXPLORE')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    background: studentSubTab === 'EXPLORE' ? '#ffffff' : 'transparent',
                    color: studentSubTab === 'EXPLORE' ? '#0369a1' : '#5f736f',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  🌐 Explore All CDC Labs (Classes 1–12)
                </button>
              </div>

              {/* TAB 0: EXPLORE ALL CDC LABS */}
              {studentSubTab === 'EXPLORE' && (
                <ExploreSimulationsPanel
                  userRole="STUDENT"
                  defaultGrade={overview?.academicInfo?.gradeNumber || 10}
                />
              )}

              {/* TAB 1: VIRTUAL LAB SIMULATIONS */}
              {studentSubTab === 'SIMS' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {studentSimulations.map((sim) => (
                    <div
                      key={sim.id || sim._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #dcebe6',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px' }}>
                            {sim.simulationType}
                          </span>
                          <span style={{ fontSize: '11px', background: '#ebf5f1', color: '#4b605b', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                            Subject: {sim.subjectCode || 'General'}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                          {sim.title}
                        </h4>
                        {sim.titleNepali && (
                          <div style={{ fontSize: '13px', color: '#6d5bd0', fontWeight: '600', marginBottom: '8px' }}>
                            {sim.titleNepali}
                          </div>
                        )}

                        <p style={{ fontSize: '12px', color: '#5f736f', lineHeight: '1.5', marginBottom: '14px' }}>
                          {sim.description}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveSim(sim)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                          color: '#ffffff',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        🚀 Launch Simulation (प्रयोगशाला खोल्नुहोस्)
                      </button>
                      {isKprietSimulation(sim) && (
                        <button
                          onClick={() => launchOnSmartBoard(String(sim.componentKey).slice('kpriet:'.length), sim.title)}
                          style={{ width: '100%', marginTop: '8px', padding: '9px', background: '#0f4c4a', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
                        >
                          🖥 Launch on Smart Board
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: ASSIGNED HOMEWORK */}
              {studentSubTab === 'ASSIGNED' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {assignedActivities.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #dcebe6', textAlign: 'center', color: '#5f736f', fontSize: '13px', gridColumn: '1 / -1' }}>
                      🎉 No pending homework assignments! You're completely up to date.
                    </div>
                  ) : (
                    assignedActivities.map((asgn) => {
                      const act = asgn.activityId;
                      const prog = studentProgress.find(
                        (p) => p.activityId?.id === act?.id || p.activityId?._id === act?._id || p.activityId === act?.id
                      );
                      return (
                        <div
                          key={asgn.id || asgn._id}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #dcebe6',
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', background: '#ede9fe', color: '#3b2f8f', padding: '3px 8px', borderRadius: '6px' }}>
                                {act?.type?.replace('_', ' ')}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: prog?.isCompleted ? '#16a34a' : '#6d5bd0' }}>
                                {prog?.isCompleted ? `✅ Completed (${prog.highestPercentage}%)` : '⏱ Pending'}
                              </span>
                            </div>

                            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                              {act?.title}
                            </h4>
                            {act?.titleNepali && (
                              <div style={{ fontSize: '13px', color: '#6d5bd0', fontWeight: '600', marginBottom: '8px' }}>
                                {act.titleNepali}
                              </div>
                            )}

                            <div style={{ fontSize: '12px', color: '#5f736f', marginBottom: '14px' }}>
                              <div>Teacher: {asgn.teacherId?.fullName || 'Subject Teacher'}</div>
                              <div>Due Date: {asgn.dueDate ? new Date(asgn.dueDate).toLocaleDateString() : 'No deadline'}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => setActiveActivity({ ...act, assignmentId: asgn.id || asgn._id })}
                            style={{
                              width: '100%',
                              padding: '10px',
                              background: prog?.isCompleted ? '#117a6b' : '#117a6b',
                              color: '#ffffff',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '700',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            {prog?.isCompleted ? '🔄 Retry for Higher Score' : '✍️ Start Homework Activity'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 3: SELF-STUDY PRACTICE */}
              {studentSubTab === 'PRACTICE' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {practiceActivities.map((act) => (
                    <div
                      key={act.id || act._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #dcebe6',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', background: '#ede9fe', color: '#3b2f8f', padding: '3px 8px', borderRadius: '6px' }}>
                            {act.type.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '11px', background: '#ebf5f1', color: '#4b605b', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                            {act.totalMarks} Marks
                          </span>
                        </div>

                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                          {act.title}
                        </h4>
                        {act.titleNepali && (
                          <div style={{ fontSize: '13px', color: '#6d5bd0', fontWeight: '600', marginBottom: '8px' }}>
                            {act.titleNepali}
                          </div>
                        )}

                        <p style={{ fontSize: '12px', color: '#5f736f', lineHeight: '1.5', marginBottom: '14px' }}>
                          {act.description}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveActivity(act)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#0284c7',
                          color: '#ffffff',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        🧪 Practice Exercise (अभ्यास गर्नुहोस्)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 11: AI CURRICULUM TUTOR
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'AI' && <AIAssistantPanel role="STUDENT" />}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 12: ANNOUNCEMENTS & BULLETINS (ENHANCED)
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'ANNOUNCEMENTS' && (() => {
            const filteredAnnouncements = announcements.filter((ann: any) => {
              if (announcementCategory === 'ALL') return true;
              if (announcementCategory === 'CLASS_TEACHER') {
                return ann.authorRole === 'CLASS_TEACHER' || ann.announcementType === 'CLASS_OVERALL';
              }
              if (announcementCategory === 'SUBJECT') {
                return ann.authorRole === 'TEACHER' || ann.announcementType === 'SUBJECT_SPECIFIC' || !!ann.subjectId;
              }
              if (announcementCategory === 'SCHOOL') {
                return ann.targetAudience === 'ALL' && ann.authorRole !== 'CLASS_TEACHER' && !ann.subjectId;
              }
              return true;
            });

            return (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #dcebe6',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                      School & Class Announcements
                    </h3>
                    <p style={{ fontSize: '13px', color: '#5f736f', margin: 0 }}>
                      Live notices published by your Class Teacher, Subject Teachers, and School Principal.
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '800',
                      background: '#e6f7f0',
                      color: '#117a6b',
                      padding: '4px 12px',
                      borderRadius: '20px',
                    }}
                  >
                    {filteredAnnouncements.length} Available Notices
                  </span>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'ALL', label: `All Notices (${announcements.length})` },
                    { id: 'CLASS_TEACHER', label: '🛡️ Class Teacher Bulletins' },
                    { id: 'SUBJECT', label: '📚 Course Notices' },
                    { id: 'SCHOOL', label: '🏛️ Institutional Notices' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAnnouncementCategory(tab.id as any)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: announcementCategory === tab.id ? '#117a6b' : '#ebf5f1',
                        color: announcementCategory === tab.id ? '#ffffff' : '#5f736f',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {filteredAnnouncements.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#5f736f', fontSize: '13px', background: '#f4faf8', borderRadius: '12px', border: '1px dashed #cfdcd8' }}>
                    No announcements found in this category.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {filteredAnnouncements.map((ann: any, idx: number) => {
                      const isCt = ann.authorRole === 'CLASS_TEACHER' || ann.announcementType === 'CLASS_OVERALL';
                      const isSubject = !!ann.subjectName && !isCt;

                      return (
                        <div
                          key={ann.id || ann._id || idx}
                          style={{
                            padding: '18px 20px',
                            background: '#ffffff',
                            border: '1px solid #dcebe6',
                            borderRadius: '12px',
                            borderLeft: isCt ? '5px solid #117a6b' : isSubject ? '5px solid #2563eb' : '5px solid #6d5bd0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              {isCt && (
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                                  🛡️ CLASS TEACHER OFFICIAL BULLETIN
                                </span>
                              )}
                              {isSubject && (
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', background: '#dbeafe', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                                  📚 {ann.subjectName || 'COURSE NOTICE'}
                                </span>
                              )}
                              {!isCt && !isSubject && (
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#4c3fa8', background: '#ede9fe', padding: '2px 8px', borderRadius: '4px', border: '1px solid #ddd6fe' }}>
                                  🏛️ {ann.targetAudience || 'INSTITUTIONAL NOTICE'}
                                </span>
                              )}
                              {ann.authorName && (
                                <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '600' }}>
                                  by {ann.authorName}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '11px', color: '#8da19d', fontWeight: '600' }}>
                              {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '15.5px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 6px 0' }}>
                            {ann.title}
                          </h4>
                          <p style={{ fontSize: '13px', color: '#4b605b', lineHeight: '1.6', margin: 0 }}>
                            {ann.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 13: STUDENT PROFILE & ACCOUNT SECURITY
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'PROFILE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Profile Hero Header Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0f5f55 0%, #0f5f55 50%, #117a6b 100%)',
                  borderRadius: '16px',
                  padding: '28px 32px',
                  color: '#ffffff',
                  boxShadow: '0 4px 20px rgba(6, 78, 59, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        color: '#0f4c4a',
                        fontSize: '24px',
                        fontWeight: '900',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        border: '3px solid rgba(255,255,255,0.4)',
                        flexShrink: 0,
                      }}
                    >
                      {studentName
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase() || 'ST'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                          {studentName}
                        </h2>
                        <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                          Active Enrolled Student
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', opacity: 0.9, lineHeight: 1.4 }}>
                        Roll #{rollNumber} • {className} – {sectionName} • EMIS: {user?.institutionCode || '—'}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                        {institutionName}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#ffffff',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Sub-Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #dcebe6', paddingBottom: '2px' }}>
                <button
                  onClick={() => setProfileActiveTab('DETAILS')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: profileActiveTab === 'DETAILS' ? '#ffffff' : 'transparent',
                    color: profileActiveTab === 'DETAILS' ? '#117a6b' : '#5f736f',
                    borderBottom: profileActiveTab === 'DETAILS' ? '3px solid #117a6b' : '3px solid transparent',
                  }}
                >
                  <GraduationCap size={16} /> Academic Enrollment Details
                </button>

                <button
                  onClick={() => setProfileActiveTab('SECURITY')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: profileActiveTab === 'SECURITY' ? '#ffffff' : 'transparent',
                    color: profileActiveTab === 'SECURITY' ? '#117a6b' : '#5f736f',
                    borderBottom: profileActiveTab === 'SECURITY' ? '3px solid #117a6b' : '3px solid transparent',
                  }}
                >
                  <Key size={16} /> Security & Change Password
                </button>

                <button
                  onClick={() => setProfileActiveTab('PREFERENCES')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: profileActiveTab === 'PREFERENCES' ? '#ffffff' : 'transparent',
                    color: profileActiveTab === 'PREFERENCES' ? '#117a6b' : '#5f736f',
                    borderBottom: profileActiveTab === 'PREFERENCES' ? '3px solid #117a6b' : '3px solid transparent',
                  }}
                >
                  <Shield size={16} /> System Preferences & Tools
                </button>
              </div>

              {/* Sub-Tab 1: DETAILS */}
              {profileActiveTab === 'DETAILS' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GraduationCap size={18} color="#117a6b" /> Academic Enrollment
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Student Identifier:</span>
                        <span style={{ fontWeight: '700', color: '#0e3e3b', fontFamily: 'monospace' }}>{user?.username || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Enrolled Class:</span>
                        <span style={{ fontWeight: '700', color: '#0e3e3b' }}>{className}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Section & Roll No:</span>
                        <span style={{ fontWeight: '700', color: '#117a6b' }}>{sectionName} (Roll #{rollNumber})</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Designated Class Teacher:</span>
                        <span style={{ fontWeight: '800', color: '#0e3e3b' }}>{overview?.academicInfo?.classTeacherName || 'Not assigned'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Medium of Instruction:</span>
                        <span style={{ fontWeight: '700', color: '#0e3e3b' }}>{({ NEPALI: 'Nepali', ENGLISH: 'English', BILINGUAL: 'Bilingual (Nepali & English)' } as Record<string, string>)[overview?.academicInfo?.medium] || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#5f736f' }}>Curriculum Standard:</span>
                        <span style={{ fontWeight: '700', color: '#117a6b' }}>Curriculum Development Centre (CDC Nepal)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={18} color="#117a6b" /> Institution & Contact Info
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Institution Name:</span>
                        <span style={{ fontWeight: '700', color: '#0e3e3b' }}>{institutionName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Institution EMIS Code:</span>
                        <span style={{ fontWeight: '700', color: '#0e3e3b', fontFamily: 'monospace' }}>{user?.institutionCode || '570010001'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Guardian Name:</span>
                        <span style={{ fontWeight: '700', color: '#0e3e3b' }}>{overview?.academicInfo?.guardianName || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Emergency Phone:</span>
                        <span style={{ fontWeight: '700', color: '#0e3e3b', fontFamily: 'monospace' }}>{overview?.academicInfo?.guardianPhone || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#5f736f' }}>Account Security Status:</span>
                        <span style={{ fontWeight: '700', color: '#117a6b' }}>Active & Password Protected</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: SECURITY & CHANGE PASSWORD */}
              {profileActiveTab === 'SECURITY' && (
                <div style={{ maxWidth: '640px', background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Key size={22} color="#117a6b" />
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                      Change Account Password
                    </h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#5f736f', margin: '0 0 20px 0' }}>
                    Keep your student portal secure. Choose a strong password with at least 6 characters.
                  </p>

                  {passwordChangeMsg && (
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '700',
                        marginBottom: '20px',
                        background: passwordChangeMsg.type === 'success' ? '#e6f7f0' : '#fef2f2',
                        color: passwordChangeMsg.type === 'success' ? '#0f4c4a' : '#991b1b',
                        border: passwordChangeMsg.type === 'success' ? '1px solid #bfeede' : '1px solid #fecaca',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {passwordChangeMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                      <span>{passwordChangeMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Current Password */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                        Current Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Enter current password"
                          value={currentPasswordInput}
                          onChange={(e) => setCurrentPasswordInput(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 14px',
                            borderRadius: '8px',
                            border: '1.5px solid #cfdcd8',
                            fontSize: '13px',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#8da19d',
                          }}
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                        New Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Enter at least 6 characters"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 14px',
                            borderRadius: '8px',
                            border: '1.5px solid #cfdcd8',
                            fontSize: '13px',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#8da19d',
                          }}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Password strength indicator */}
                      {newPasswordInput && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                            <div style={{ flex: 1, borderRadius: '2px', background: newPasswordInput.length >= 6 ? '#22c55e' : '#ef4444' }} />
                            <div style={{ flex: 1, borderRadius: '2px', background: newPasswordInput.length >= 8 ? '#22c55e' : '#dcebe6' }} />
                            <div style={{ flex: 1, borderRadius: '2px', background: /[0-9]/.test(newPasswordInput) && newPasswordInput.length >= 8 ? '#22c55e' : '#dcebe6' }} />
                          </div>
                          <span style={{ fontSize: '11px', color: newPasswordInput.length < 6 ? '#ef4444' : '#15803d', fontWeight: '700' }}>
                            {newPasswordInput.length < 6 ? 'Too short (min 6 chars)' : newPasswordInput.length < 8 ? 'Acceptable' : 'Strong Password'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#2f4f4c', marginBottom: '6px' }}>
                        Confirm New Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Re-enter new password"
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 14px',
                            borderRadius: '8px',
                            border: `1.5px solid ${confirmPasswordInput && confirmPasswordInput !== newPasswordInput ? '#ef4444' : '#cfdcd8'}`,
                            fontSize: '13px',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#8da19d',
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {confirmPasswordInput && confirmPasswordInput !== newPasswordInput && (
                        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700', marginTop: '4px', display: 'block' }}>
                          Passwords do not match
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={passwordChangeLoading || !newPasswordInput || newPasswordInput !== confirmPasswordInput}
                      style={{
                        padding: '11px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#117a6b',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: passwordChangeLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '10px',
                        opacity: passwordChangeLoading || !newPasswordInput || newPasswordInput !== confirmPasswordInput ? 0.6 : 1,
                      }}
                    >
                      <CheckCheck size={16} />
                      {passwordChangeLoading ? 'Updating Password...' : 'Save New Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-Tab 3: PREFERENCES */}
              {profileActiveTab === 'PREFERENCES' && (
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', marginBottom: '12px' }}>My preferences</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '22px', alignItems: 'center' }}>
                    <label style={{ fontSize: '13px', color: '#2f4f4c', fontWeight: 700 }}>
                      Text size{' '}
                      <select value={prefs.textSize} onChange={(e) => savePrefs({ ...prefs, textSize: e.target.value as any })} style={{ marginLeft: '6px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cfdcd8' }}>
                        <option value="NORMAL">Normal</option>
                        <option value="LARGE">Large</option>
                      </select>
                    </label>
                    <label style={{ fontSize: '13px', color: '#2f4f4c', fontWeight: 700 }}>
                      Open on{' '}
                      <select value={prefs.defaultTab} onChange={(e) => savePrefs({ ...prefs, defaultTab: e.target.value })} style={{ marginLeft: '6px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cfdcd8' }}>
                        <option value="OVERVIEW">Overview</option>
                        <option value="TIMETABLE">Class timetable</option>
                        <option value="ACTIVITIES">Activities</option>
                      </select>
                    </label>
                    {prefsSaved && <span style={{ fontSize: '12px', color: '#117a6b', fontWeight: 700 }}>Saved</span>}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={18} color="#117a6b" /> Learning Environment Tools
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '16px', background: '#f4faf8', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 6px 0' }}>
                        Interactive Smart Board
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '0 0 12px 0' }}>
                        Launch classroom whiteboard sessions to view teacher live notes and annotations.
                      </p>
                      <a
                        href="/smartboard/index.html"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#117a6b',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '700',
                          textDecoration: 'none',
                        }}
                      >
                        <Presentation size={14} /> Open Smart Board
                      </a>
                    </div>

                    <div style={{ padding: '16px', background: '#f4faf8', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 6px 0' }}>
                        Virtual Lab Simulations
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '0 0 12px 0' }}>
                        Explore interactive CDC Science, Math, and Physics simulations.
                      </p>
                      <button data-nav-feature="ACTIVITIES"
                        onClick={() => setActiveNav('ACTIVITIES')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#2563eb',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Atom size={14} /> View Virtual Labs
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {viewNote && (() => {
            const info = describeNote(viewNote);
            return (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,62,59,0.6)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '760px', maxHeight: '88vh', overflowY: 'auto', padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0e3e3b' }}>{viewNote.title}</h3>
                      <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '2px' }}>
                        Shared by {viewNote.teacherId?.fullName || 'Faculty'}{viewNote.sessionDate ? ` · ${new Date(viewNote.sessionDate).toLocaleDateString()}` : ''}
                        {info.chapter ? ` · ${info.chapter}` : ''}
                      </div>
                    </div>
                    <button onClick={() => setViewNote(null)} style={{ border: 'none', background: 'none', fontWeight: 700, color: '#5f736f', cursor: 'pointer' }}>Close</button>
                  </div>
                  {info.text && <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', color: '#0e3e3b', lineHeight: 1.6, marginBottom: '14px' }}>{info.text}</div>}
                  {info.images.map((src, i) => (
                    <img key={i} src={src} alt={`Board snapshot ${i + 1}`} style={{ width: '100%', borderRadius: '10px', border: '1px solid #dcebe6', marginBottom: '12px' }} />
                  ))}
                  {!info.text && info.images.length === 0 && (
                    <div style={{ color: '#5f736f', fontSize: '13px' }}>This note has no content that can be shown here.</div>
                  )}
                </div>
              </div>
            );
          })()}
        </main>
      </div>

      {/* ── PDF READER MODAL (CDC TEXTBOOKS) ────────────────────────── */}
      <PdfReaderModal
        isOpen={!!activeReaderTextbook}
        onClose={() => setActiveReaderTextbook(null)}
        textbook={activeReaderTextbook}
      />

      {/* ── SIMULATION VIEWER MODAL (PHET / VIRTUAL LABS) ───────────── */}
      <SimulationViewerModal
        simulation={activeSim}
        onClose={() => setActiveSim(null)}
      />

      {/* ── INTERACTIVE ACTIVITY PLAYER MODAL ───────────────────────── */}
      {activeActivity && (
        <InteractiveActivityPlayer
          activity={activeActivity}
          classId={overview?.academicInfo?.classId || overview?.studentProfile?.classId?.id}
          sectionId={overview?.academicInfo?.sectionId || overview?.studentProfile?.sectionId?.id}
          assignmentId={activeActivity.assignmentId}
          onClose={() => setActiveActivity(null)}
          onCompleted={() => {
            loadSimulationsAndActivities();
          }}
        />
      )}
    </div>
  );
};
