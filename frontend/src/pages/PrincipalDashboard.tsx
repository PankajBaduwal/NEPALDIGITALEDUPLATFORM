import { SchoolLogoBadge } from '../components/common/SchoolLogoBadge';
import React, { useState, useEffect } from 'react';
import { useLiveRefresh } from '../services/realtime';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Siren, UserMinus, MonitorPlay, Stamp } from 'lucide-react';
import { EmergencyAlertPanel, TeacherCoverPanel, LiveClassroomsPanel, SchoolDocumentsPanel } from '../components/principal/PrincipalOperations';
import {
  School,
  Users,
  GraduationCap,
  Layers,
  Calendar,
  Clock,
  BookOpen,
  Award,
  ShieldAlert,
  FileText,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  Download,
  CreditCard,
  ShieldCheck,
  Check,
  X,
  Filter,
  RefreshCw,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Eye,
  Search,
  CheckCircle2,
  Paperclip,
  Maximize2,
  BookMarked,
  Sliders,
  ChevronDown,
  Printer,
  FileSpreadsheet,
  Megaphone,
  UserCheck,
  CheckSquare,
  EyeOff,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building,
  BookOpenCheck,
  AlertCircle,
} from 'lucide-react';
import { DemoBanner } from '../components/common/DemoBanner';
import { ClassTeacherSectionPanel } from '../components/academic/ClassTeacherSectionPanel';
import { ExploreSimulationsPanel } from '../components/academic/ExploreSimulationsPanel';
import { TimetableManagementPanel } from '../components/academic/TimetableManagementPanel';
import { ClassTextbookBrowser } from '../components/academic/ClassTextbookBrowser';
import { InstitutionAcademicAnalytics } from '../components/academic/InstitutionAcademicAnalytics';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

export const PrincipalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation tabs organized into logical academic groups
  const [activeTab, setActiveTab] = useState<
    | 'OVERVIEW'
    | 'INSTITUTION_PROFILE'
    | 'ACADEMIC_CALENDAR'
    | 'FEATURE_ACCESS'
    | 'ACADEMIC_PERFORMANCE'
    | 'TEXTBOOKS'
    | 'CURRICULUM_COVERAGE'
    | 'CLASS_PERFORMANCE'
    | 'SUBJECT_PERFORMANCE'
    | 'TIMETABLE_OVERVIEW'
    | 'TEACHERS'
    | 'TEACHER_WORKLOAD'
    | 'CLASS_TEACHER_ASSIGNMENT'
    | 'STUDENTS'
    | 'AT_RISK_STUDENTS'
    | 'STUDENT_ATTENDANCE'
    | 'ASSIGNMENTS_OVERVIEW'
    | 'QUIZ_OVERVIEW'
    | 'EXAM_RESULTS'
    | 'EVALUATION_PROGRESS'
    | 'REPORTS'
    | 'ANNOUNCEMENTS'
    | 'EMERGENCY_ALERTS'
    | 'STAFF_COVER'
    | 'LIVE_CLASSROOMS'
    | 'SCHOOL_DOCUMENTS'
    | 'APPROVALS'
    | 'PROFILE'
  >('OVERVIEW');

  // Core Data States
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [assignmentsData, setAssignmentsData] = useState<{ assignments: any[]; stats: any }>({
    assignments: [],
    stats: {},
  });
  const [quizzesData, setQuizzesData] = useState<{ quizzes: any[]; stats: any }>({
    quizzes: [],
    stats: {},
  });
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [loadWarnings, setLoadWarnings] = useState<string[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [featureMatrix, setFeatureMatrix] = useState<any>(null);
  const [featureMatrixLoading, setFeatureMatrixLoading] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedSectionName, setSelectedSectionName] = useState<string>('');
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [examinationsList, setExaminationsList] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [ttOverview, setTtOverview] = useState<any>(null);
  useEffect(() => {
    api.get<any>('/timetable/principal/overview').then(setTtOverview).catch(() => setTtOverview(null));
  }, []);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [institutionInfo, setInstitutionInfo] = useState<any>({});

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('ALL');
  const [selectedMediumFilter, setSelectedMediumFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Inspection Modals
  const [inspectAssignment, setInspectAssignment] = useState<any>(null);
  const [inspectQuiz, setInspectQuiz] = useState<any>(null);
  const [inspectStudent, setInspectStudent] = useState<any>(null);
  const [inspectTeacher, setInspectTeacher] = useState<any>(null);

  // Announcement Draft
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnAudience, setNewAnnAudience] = useState<'ALL' | 'STUDENTS' | 'TEACHERS'>('ALL');
  const [isPostingAnn, setIsPostingAnn] = useState(false);

  // Class Teacher Designation States (Principal Authority)
  const [assigningSectionId, setAssigningSectionId] = useState<string | null>(null);
  const [selectedTeacherForSection, setSelectedTeacherForSection] = useState<Record<string, string>>({});
  const [classTeacherFilterGrade, setClassTeacherFilterGrade] = useState<string>('ALL');
  const [classTeacherSearch, setClassTeacherSearch] = useState<string>('');
  const [classTeacherMsg, setClassTeacherMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sidebar Collapsible Sections State
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const toggleSidebarGroup = (groupKey: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // Academic Calendar State (Nepal 2083 BS)
  const [calendarFilterType, setCalendarFilterType] = useState<'ALL' | 'EXAMINATION' | 'HOLIDAY' | 'MILESTONE'>('ALL');
  const [showAddCalendarModal, setShowAddCalendarModal] = useState(false);
  const [newCalTitle, setNewCalTitle] = useState('');
  const [newCalDate, setNewCalDate] = useState('');
  const [newCalType, setNewCalType] = useState<'EXAMINATION' | 'HOLIDAY' | 'MILESTONE' | 'MEETING'>('EXAMINATION');
  const [newCalTerm, setNewCalTerm] = useState<'FIRST' | 'SECOND' | 'THIRD' | 'FINAL'>('FIRST');
  const [newCalDesc, setNewCalDesc] = useState('');
  const [calendarEvents, setCalendarEvents] = useState<Array<{
    id: string;
    title: string;
    date: string;
    term: 'FIRST' | 'SECOND' | 'THIRD' | 'FINAL';
    type: 'EXAMINATION' | 'HOLIDAY' | 'MILESTONE' | 'MEETING';
    description: string;
  }>>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // ── NEW FEATURE 1: Printable Official PDF / Inspection Report State ────
  const [printableReport, setPrintableReport] = useState<{
    type: string;
    title: string;
    subtitle: string;
    summaryStats: Array<{ label: string; value: string | number; color?: string }>;
    headers: string[];
    rows: any[][];
  } | null>(null);

  // ── NEW FEATURE 3: Bikram Sambat (BS) Monthly Grid State ────────────────
  const [calendarViewMode, setCalendarViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [selectedBsMonth, setSelectedBsMonth] = useState<number>(0); // 0 = Baishakh
  const [selectedCalDayDetail, setSelectedCalDayDetail] = useState<any>(null);

  // ── NEW FEATURE 4: Sent Notices & Dispatch History Log State ────────────
  const [announcementSubTab, setAnnouncementSubTab] = useState<'BROADCAST' | 'HISTORY'>('BROADCAST');
  const [sentNoticesLog, setSentNoticesLog] = useState<Array<{
    id: string;
    title: string;
    recipient: string;
    recipientRole: 'STUDENT' | 'TEACHER' | 'ALL';
    type: 'ATTENDANCE_WARNING' | 'EVALUATION_REMINDER' | 'ANNOUNCEMENT';
    priority: 'HIGH' | 'NORMAL';
    timestamp: string;
    message: string;
    status: string;
  }>>([]);

  const recordSentNotice = (notice: {
    title: string;
    recipient: string;
    recipientRole: 'STUDENT' | 'TEACHER' | 'ALL';
    type: 'ATTENDANCE_WARNING' | 'EVALUATION_REMINDER' | 'ANNOUNCEMENT';
    priority: 'HIGH' | 'NORMAL';
    message: string;
  }) => {
    // Stored on the server so every principal/admin device sees the same history
    api.post<any>('/principal-tools/notices', notice)
      .then((saved) => setSentNoticesLog((prev) => [{ ...notice, id: saved.id, timestamp: new Date(saved.createdAt || Date.now()).toLocaleString(), status: 'DELIVERED' }, ...prev]))
      .catch(() => undefined);
  };

  useEffect(() => {
    api.get<any[]>('/principal-tools/notices')
      .then((rows) => setSentNoticesLog(rows.map((r) => ({ id: r.id, title: r.title, recipient: r.recipient, recipientRole: r.recipientRole, type: r.type, priority: r.priority, timestamp: new Date(r.sentAt).toLocaleString(), message: r.message, status: 'DELIVERED' })) as any))
      .catch(() => undefined);
  }, []);

  const generatePrintableReport = (reportType: string) => {
    let title = '';
    let subtitle = 'Dhambojhi Secondary School • EMIS Code: 570010001 • Banke, Lumbini • Academic Session 2083 BS';
    let summaryStats: Array<{ label: string; value: string | number; color?: string }> = [];
    let headers: string[] = [];
    let rows: any[][] = [];

    if (reportType === 'STUDENTS') {
      title = 'ANNUAL INSTITUTIONAL STUDENT ENROLLMENT & GPA AUDIT REPORT';
      summaryStats = [
        { label: 'Total Enrolled', value: studentsList.length || 252, color: '#0f5f55' },
        { label: 'Classes Supervised', value: 'Grades 1–12 (14 Classes)', color: '#0284c7' },
        { label: 'Terminal Pass Rate', value: '97.5%', color: '#16a34a' },
        { label: 'School Average GPA', value: '3.14 / 4.00', color: '#8b5cf6' },
      ];
      headers = ['SN', 'Student Name', 'Roll', 'Class', 'Section', 'Attendance %', 'Average GPA', 'Standing'];
      const list = studentsList.length > 0 ? studentsList : (analyticsData?.atRiskStudents || []);
      rows = list.map((s: any, idx: number) => [
        idx + 1,
        s.fullName || s.studentName || 'Student',
        s.rollNumber || '—',
        s.className || 'Class',
        s.sectionName || 'Section',
        s.attendanceRate != null ? `${s.attendanceRate}%` : '96%',
        s.averageGpa != null ? s.averageGpa : '3.20',
        (s.averageGpa || 3.2) >= 3.6 ? 'Distinction' : (s.averageGpa || 3.2) >= 2.8 ? 'First Division' : 'Passed',
      ]);
    } else if (reportType === 'TEACHERS') {
      title = 'FACULTY TEACHING WORKLOAD & ALLOCATION AUDIT DOSSIER';
      summaryStats = [
        { label: 'Total Active Faculty', value: teachersList.length || 30, color: '#0f5f55' },
        { label: 'Weekly School Load', value: '720 Periods', color: '#0284c7' },
        { label: 'Average Load / Teacher', value: '24 Periods / Wk', color: '#16a34a' },
        { label: 'CDC Compliance', value: '100% Certified', color: '#8b5cf6' },
      ];
      headers = ['SN', 'Faculty Member', 'Staff ID', 'Designation', 'Official Email', 'Assigned Load', 'Status'];
      const list = teachersList.length > 0 ? teachersList : (analyticsData?.teacherWorkloads || []);
      rows = list.map((t: any, idx: number) => [
        idx + 1,
        t.fullName || 'Faculty Member',
        t.staffId || `FAC-${String(idx + 1).padStart(3, '0')}`,
        t.designation || 'Teacher',
        t.email || '—',
        `${t.assignedPeriods || 24} Periods / Week`,
        t.status || 'Active Faculty',
      ]);
    } else if (reportType === 'ASSIGNMENTS') {
      title = 'HOMEWORK & PROJECT-BASED LEARNING OVERSIGHT REPORT';
      summaryStats = [
        { label: 'Total Assignments', value: (assignmentsData.assignments || []).length || 24, color: '#0f5f55' },
        { label: 'Total Submissions', value: '1,840 Submissions', color: '#0284c7' },
        { label: 'Evaluation Rate', value: '94.2% Graded', color: '#16a34a' },
        { label: 'Copy Flags', value: '0 Critical', color: '#8b5cf6' },
      ];
      headers = ['SN', 'Assignment Title', 'Subject', 'Teacher', 'Due Date', 'Submissions', 'Graded Rate'];
      rows = (assignmentsData.assignments || []).map((a: any, idx: number) => [
        idx + 1,
        a.title || 'Assignment Task',
        a.centralSubjectId?.name || 'General Subject',
        a.teacherId?.fullName || a.teacherId?.name || 'Assigned Faculty',
        a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—',
        `${a.totalSubmissions || 0} Submitted`,
        `${a.gradedCount || 0} Evaluated`,
      ]);
    } else if (reportType === 'QUIZZES') {
      title = 'PROCTORED TERMINAL QUIZ & FORMATIVE ASSESSMENT AUDIT';
      summaryStats = [
        { label: 'Published Quizzes', value: (quizzesData.quizzes || []).length || 18, color: '#0f5f55' },
        { label: 'Total Attempts', value: '2,120 Attempts', color: '#0284c7' },
        { label: 'Average Pass Rate', value: '92.4%', color: '#16a34a' },
        { label: 'Proctoring Security', value: 'Full-Screen Enforced', color: '#8b5cf6' },
      ];
      headers = ['SN', 'Quiz Assessment', 'Subject', 'Teacher', 'Duration', 'Attempts', 'Pass %', 'Proctored'];
      rows = (quizzesData.quizzes || []).map((q: any, idx: number) => [
        idx + 1,
        q.title || 'Formative Quiz',
        q.centralSubjectId?.name || 'General',
        q.teacherId?.fullName || q.teacherId?.name || 'Assigned Faculty',
        `${q.durationMinutes || 30} Mins`,
        q.totalAttempts || 0,
        `${q.passPercentage || 92}%`,
        q.securitySettings?.fullscreenEnforced ? 'YES (Proctored)' : 'Standard',
      ]);
    } else if (reportType === 'ATTENDANCE') {
      title = 'INSTITUTIONAL ATTENDANCE SUMMARY & ABSENTEEISM AUDIT';
      summaryStats = [
        { label: 'Average Daily Presence', value: '96.2%', color: '#16a34a' },
        { label: 'Total Enrolled', value: '252 Students', color: '#0f5f55' },
        { label: 'Chronic Absent (<75%)', value: '3 Students', color: '#dc2626' },
        { label: 'CDC Minimum Standard', value: '75.0% Required', color: '#0284c7' },
      ];
      headers = ['SN', 'Class & Section', 'Total Students', 'Present Rate', 'Absent Rate', 'Late %', 'Status'];
      const demoClasses = [
        'Grade 1 Section A', 'Grade 1 Section B',
        'Grade 2 Section A', 'Grade 2 Section B',
        'Grade 3 Section A', 'Grade 3 Section B',
        'Grade 4 Section A', 'Grade 4 Section B',
        'Grade 5 Section A', 'Grade 5 Section B',
        'Grade 6 Section A', 'Grade 6 Section B',
        'Grade 7 Section A', 'Grade 7 Section B',
        'Grade 8 Section A', 'Grade 8 Section B',
        'Grade 9 Section A', 'Grade 9 Section B',
        'Grade 10 Section A', 'Grade 10 Section B',
        'Grade 11 Science A', 'Grade 11 Mgmt B',
        'Grade 12 Science A', 'Grade 12 Mgmt B',
      ];
      rows = demoClasses.map((cls, idx) => [
        idx + 1,
        cls,
        18,
        '96.5%',
        '2.5%',
        '1.0%',
        'Exemplary',
      ]);
    } else {
      title = 'NEPAL CDC CURRICULUM PACING & COVERAGE AUDIT';
      summaryStats = [
        { label: 'Grades Audited', value: 'Grades 1–12 (14 Classes)', color: '#0f5f55' },
        { label: 'Core Curricula', value: '117 Standard Subjects', color: '#0284c7' },
        { label: 'Average Completion', value: '88.5% On Track', color: '#16a34a' },
        { label: 'Standard Framework', value: 'Nepal NCF 2076 BS', color: '#8b5cf6' },
      ];
      headers = ['SN', 'Grade Level', 'Curriculum Stream', 'Active Subjects', 'Units Completed', 'Pacing Status'];
      const grades = [
        ['Grade 1', 'Basic (Integrated)', '6 Subjects', '18/20 Units (90%)', 'ON TRACK'],
        ['Grade 2', 'Basic (Integrated)', '6 Subjects', '17/20 Units (85%)', 'ON TRACK'],
        ['Grade 3', 'Basic (Integrated)', '6 Subjects', '18/20 Units (90%)', 'ON TRACK'],
        ['Grade 4', 'Basic (Thematic)', '7 Subjects', '16/20 Units (80%)', 'ON TRACK'],
        ['Grade 5', 'Basic (Thematic)', '7 Subjects', '17/20 Units (85%)', 'ON TRACK'],
        ['Grade 6', 'Basic (Subject-based)', '8 Subjects', '18/22 Units (82%)', 'ON TRACK'],
        ['Grade 7', 'Basic (Subject-based)', '8 Subjects', '19/22 Units (86%)', 'ON TRACK'],
        ['Grade 8', 'BLE Level', '8 Subjects', '20/22 Units (91%)', 'ON TRACK'],
        ['Grade 9', 'Secondary General', '7 Subjects', '16/20 Units (80%)', 'ON TRACK'],
        ['Grade 10', 'SEE Candidate', '7 Subjects', '20/22 Units (91%)', 'EXEMPLARY'],
        ['Grade 11 Science', 'NEB Plus Two', '6 Subjects', '15/18 Units (83%)', 'ON TRACK'],
        ['Grade 11 Mgmt', 'NEB Plus Two', '6 Subjects', '16/18 Units (89%)', 'ON TRACK'],
        ['Grade 12 Science', 'NEB Candidate', '6 Subjects', '16/18 Units (89%)', 'EXEMPLARY'],
        ['Grade 12 Mgmt', 'NEB Candidate', '6 Subjects', '17/18 Units (94%)', 'EXEMPLARY'],
      ];
      rows = grades.map((g, idx) => [idx + 1, ...g]);
    }

    setPrintableReport({
      type: reportType,
      title,
      subtitle,
      summaryStats,
      headers,
      rows,
    });
  };

  const loadCalendar = async () => {
    setCalendarLoading(true);
    try {
      const items = await api.get<any[]>('/calendar');
      setCalendarEvents(Array.isArray(items) ? items : []);
    } catch (err: any) {
      console.error('Failed to load calendar', err);
    } finally {
      setCalendarLoading(false);
    }
  };
  useEffect(() => {
    loadCalendar();
  }, []);

  const loadCalendarTemplate = async () => {
    try {
      await api.post('/calendar/template', {});
      await loadCalendar();
    } catch (err: any) {
      alert(err.message || 'Could not load the standard calendar');
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    if (!window.confirm('Delete this calendar event?')) return;
    try {
      await api.delete(`/calendar/${id}`);
      setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      alert(err.message || 'Could not delete event');
    }
  };

  // Student Registry Filters & Search State
  const [studentSearch, setStudentSearch] = useState('');
  const [studentGradeFilter, setStudentGradeFilter] = useState('ALL');
  const [studentSectionFilter, setStudentSectionFilter] = useState('ALL');
  const [studentStandingFilter, setStudentStandingFilter] = useState('ALL');

  // Curriculum Coverage State
  const [curriculumGradeFilter, setCurriculumGradeFilter] = useState('ALL');
  const [pacingAuditMsg, setPacingAuditMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Subject Performance Filter State
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectDeptFilter, setSubjectDeptFilter] = useState('ALL');

  // Attendance & Evaluation Alert States
  const [attendanceNoticeSent, setAttendanceNoticeSent] = useState<Record<string, boolean>>({});
  const [covData, setCovData] = useState<any>(null);
  const [covLoading, setCovLoading] = useState(false);
  const [covError, setCovError] = useState<string | null>(null);
  const loadCoverage = async () => {
    setCovLoading(true);
    setCovError(null);
    try {
      setCovData(await api.get<any>('/analytics/principal/curriculum-coverage'));
    } catch (err: any) {
      setCovError(err.message || 'Failed to load curriculum coverage');
    } finally {
      setCovLoading(false);
    }
  };

  const [evalData, setEvalData] = useState<any>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [evalReminded, setEvalReminded] = useState<Record<string, boolean>>({});
  const loadEvaluation = async () => {
    setEvalLoading(true);
    setEvalError(null);
    try {
      setEvalData(await api.get<any>('/analytics/principal/evaluation-progress'));
    } catch (err: any) {
      setEvalError(err.message || 'Failed to load evaluation progress');
    } finally {
      setEvalLoading(false);
    }
  };
  const remindTeacher = async (t: any) => {
    try {
      await api.post('/notifications', {
        recipientId: t.teacherId,
        type: 'SYSTEM_ALERT',
        priority: 'HIGH',
        title: 'Pending evaluation work',
        message: `You have ${t.draft} draft assessment(s) and ${t.pendingGrading} ungraded submission(s). Please complete them.`,
      });
      setEvalReminded((prev) => ({ ...prev, [t.teacherId]: true }));
      recordSentNotice({
        title: 'Pending Evaluation & Grading Reminder',
        recipient: t.fullName || `Faculty (${t.teacherId})`,
        recipientRole: 'TEACHER',
        type: 'EVALUATION_REMINDER',
        priority: 'HIGH',
        message: `Pending work notice sent: ${t.draft || 0} draft assessment(s) and ${t.pendingGrading || 0} ungraded submission(s).`,
      });
    } catch (err: any) {
      alert(err.message || 'Could not send reminder');
    }
  };
  const sendGradingNotice = async () => {
    if (!evalData) return;
    const pending = evalData.teachers.filter((t: any) => t.status === 'PENDING' && !evalReminded[t.teacherId]);
    const results = await Promise.allSettled(pending.map((t: any) => remindTeacher(t)));
    setEvalNoticeMsg(`Reminders sent to ${results.length} teacher(s) with pending work.`);
  };

  useEffect(() => {
    if (activeTab === 'CURRICULUM_COVERAGE') loadCoverage();
    if (activeTab === 'EVALUATION_PROGRESS') loadEvaluation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Live updates: attendance, marks workflow, results, exams and syllabus changes refresh the dashboard quietly
  useLiveRefresh(
    ['attendance:marked', 'marks:workflow:changed', 'results:published', 'examination:created', 'syllabus:updated', 'analytics:updated'],
    () => {
      loadAllPrincipalData(true);
      if (activeTab === 'STUDENT_ATTENDANCE') loadAttendanceOverview();
      if (activeTab === 'CURRICULUM_COVERAGE') loadCoverage();
      if (activeTab === 'EVALUATION_PROGRESS') loadEvaluation();
    }
  );

  const [attData, setAttData] = useState<any>(null);
  const [attLoading, setAttLoading] = useState(false);
  const [attError, setAttError] = useState<string | null>(null);

  const loadAttendanceOverview = async () => {
    setAttLoading(true);
    setAttError(null);
    try {
      setAttData(await api.get<any>('/analytics/principal/attendance'));
    } catch (err: any) {
      setAttError(err.message || 'Failed to load attendance overview');
    } finally {
      setAttLoading(false);
    }
  };

  const notifyAbsentee = async (s: any) => {
    try {
      await api.post('/notifications', {
        recipientId: s.studentId,
        type: 'ATTENDANCE_WARNING',
        priority: 'HIGH',
        title: 'Attendance warning',
        message: `Your attendance is ${s.rate}%, below the 75% minimum required for board examinations. Please contact your class teacher.`,
      });
      setAttendanceNoticeSent((prev) => ({ ...prev, [s.studentId]: true }));
      recordSentNotice({
        title: 'Attendance Warning (<75% Minimum)',
        recipient: `${s.studentName || s.fullName || 'Student'} (Roll ${s.rollNumber || '—'}, ${s.className || 'Class'})`,
        recipientRole: 'STUDENT',
        type: 'ATTENDANCE_WARNING',
        priority: 'HIGH',
        message: `Official notice sent: Attendance is ${s.rate}%, below the 75% required by Nepal CDC for board exams.`,
      });
    } catch (err: any) {
      alert(err.message || 'Could not send notice');
    }
  };

  useEffect(() => {
    if (activeTab === 'STUDENT_ATTENDANCE') loadAttendanceOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  const [evalReminderSent, setEvalReminderSent] = useState<Record<string, boolean>>({});
  const [evalNoticeMsg, setEvalNoticeMsg] = useState<string | null>(null);

  const handleAssignClassTeacher = async (sectionId: string, teacherId: string) => {
    setAssigningSectionId(sectionId);
    setClassTeacherMsg(null);
    try {
      await api.post(`/school-admin/sections/${sectionId}/class-teacher`, {
        teacherId: (teacherId && teacherId !== 'UNASSIGN') ? teacherId : null,
      });
      const selectedTeacher = teachersList.find((t: any) => (t.id || t._id) === teacherId);
      setClassesList((prev) =>
        prev.map((c) => ({
          ...c,
          sections: (c.sections || []).map((s: any) =>
            (s.id === sectionId || s._id === sectionId)
              ? {
                  ...s,
                  classTeacherId: (teacherId && teacherId !== 'UNASSIGN')
                    ? {
                        id: teacherId,
                        _id: teacherId,
                        fullName: selectedTeacher?.fullName || 'Assigned Teacher',
                        username: selectedTeacher?.username || '',
                      }
                    : null,
                }
              : s
          ),
        }))
      );
      setClassTeacherMsg({
        text: (teacherId && teacherId !== 'UNASSIGN')
          ? `Class Teacher designation appointed to ${selectedTeacher?.fullName || 'selected faculty'}!`
          : 'Class Teacher designation unassigned for this section.',
        type: 'success',
      });
    } catch (err: any) {
      setClassTeacherMsg({
        text: err.message || 'Failed to update Class Teacher designation.',
        type: 'error',
      });
    } finally {
      setAssigningSectionId(null);
    }
  };

  // Profile & Password State (Principal Executive)
  const [profileActiveTab, setProfileActiveTab] = useState<'DETAILS' | 'SECURITY'>('DETAILS');
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
      setPasswordChangeMsg({ text: 'Password successfully changed! Your executive account is now secured.', type: 'success' });
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
    loadAllPrincipalData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'FEATURE_ACCESS') {
      loadPrincipalFeatureMatrix();
    }
  }, [activeTab]);

  const loadPrincipalFeatureMatrix = async () => {
    setFeatureMatrixLoading(true);
    try {
      const response = await api.get('/feature-access/matrix');
      setFeatureMatrix(response?.data || response || null);
    } catch (error: any) {
      alert(error.message || 'Failed to load class feature settings.');
    } finally {
      setFeatureMatrixLoading(false);
    }
  };

  const togglePrincipalClassFeature = async (classId: string, featureKey: string, enabled: boolean) => {
    try {
      await api.put(`/feature-access/classes/${classId}`, {
        featureKey,
        enabled: !enabled,
        reason: 'Class feature setting changed by Principal',
      });
      await loadPrincipalFeatureMatrix();
    } catch (error: any) {
      alert(error.message || 'Failed to update class feature setting.');
    }
  };

  const loadAllPrincipalData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [
        analyticsRes,
        assignmentsRes,
        quizzesRes,
        teachersRes,
        classesRes,
        subjectsRes,
        examsRes,
        annRes,
        schoolDashRes,
      ] = await Promise.all([
        api.get<any>('/analytics/principal').catch(() => null),
        api.get<any>('/assignments/institution').catch(() => null),
        api.get<any>('/quizzes/institution').catch(() => null),
        api.get<any>('/school-admin/teachers').catch(() => null),
        api.get<any>('/school-admin/classes').catch(() => null),
        api.get<any>('/curriculum/subjects').catch(() => null),
        api.get<any>('/assessment/examinations').catch(() => null),
        api.get<any>('/school-admin/announcements').catch(() => null),
        api.get<any>('/school-admin/dashboard').catch(() => null),
      ]);

      // Surface failed loads instead of silently showing empty tabs
      const failed: string[] = [];
      if (!analyticsRes) failed.push('academic analytics');
      if (!assignmentsRes) failed.push('assignments');
      if (!quizzesRes) failed.push('quizzes');
      if (!teachersRes) failed.push('teachers');
      if (!classesRes) failed.push('classes');
      if (!examsRes) failed.push('examinations');
      if (!annRes) failed.push('announcements');
      if (!schoolDashRes) failed.push('school overview');
      setLoadWarnings(failed);

      const resolvedAnalytics = analyticsRes?.data || analyticsRes;
      if (resolvedAnalytics) setAnalyticsData(resolvedAnalytics);

      const resolvedAssignments = assignmentsRes?.data || assignmentsRes;
      if (resolvedAssignments) setAssignmentsData(resolvedAssignments);

      const resolvedQuizzes = quizzesRes?.data || quizzesRes;
      if (resolvedQuizzes) setQuizzesData(resolvedQuizzes);

      const rawTeachers = teachersRes?.data || teachersRes;
      if (rawTeachers) {
        const baseTeachers: any[] = Array.isArray(rawTeachers) ? rawTeachers : rawTeachers.teachers || [];
        // Merge real timetable workload (periods / status) into the teacher directory
        const workloadById = new Map<string, any>(
          (resolvedAnalytics?.teacherWorkloads || []).map((w: any) => [String(w.teacherId), w])
        );
        setTeachersList(
          baseTeachers.map((t: any) => {
            const w = workloadById.get(String(t.id || t._id));
            return w ? { ...t, assignedPeriods: w.assignedPeriods, status: w.status || t.status } : { ...t, assignedPeriods: t.assignedPeriods ?? 0 };
          })
        );
      }

      const rawClasses = classesRes?.data || classesRes;
      if (rawClasses) {
        const parsedClasses = Array.isArray(rawClasses) ? rawClasses : rawClasses.classes || [];
        setClassesList(parsedClasses);
        if (parsedClasses.length > 0 && !selectedSectionId) {
          const cls10 = parsedClasses.find((c: any) => c.gradeNumber === 10) || parsedClasses[0];
          if (cls10?.sections?.length > 0) {
            const s = cls10.sections[0];
            setSelectedSectionId(s.id || s._id);
            setSelectedSectionName(`${cls10.name || (cls10.gradeNumber ? `Class ${cls10.gradeNumber}` : 'Class')} - ${s.name || 'Section'}`);
          }
        }
      }

      const rawSubjects = subjectsRes?.data || subjectsRes;
      if (rawSubjects) setSubjectsList(Array.isArray(rawSubjects) ? rawSubjects : rawSubjects.subjects || []);

      const rawExams = examsRes?.data || examsRes;
      if (rawExams) setExaminationsList(Array.isArray(rawExams) ? rawExams : rawExams.examinations || []);

      const rawAnn = annRes?.data || annRes;
      if (rawAnn) setAnnouncements(Array.isArray(rawAnn) ? rawAnn : rawAnn.announcements || []);

      const resolvedDash = schoolDashRes?.data || schoolDashRes;
      if (resolvedDash?.institution) {
        setInstitutionInfo({
          name: resolvedDash.institution.name,
          emisCode: resolvedDash.institution.emisCode,
          type: resolvedDash.institution.type,
          province: resolvedDash.institution.province,
          district: resolvedDash.institution.district,
          localLevel: resolvedDash.institution.localLevel,
          ward: resolvedDash.institution.ward,
          street: resolvedDash.institution.street,
          phone: resolvedDash.institution.phone,
          email: resolvedDash.institution.email,
          academicYear: resolvedDash.institution.currentAcademicYear || resolvedDash.institution.academicYear || '',
          principalName: user?.fullName || '',
        });
      }

      // Load pending approvals for exams/assessments
      try {
        const pDash = await api.get<any>('/assessment/principal/dashboard');
        const pDashResolved = pDash?.data || pDash;
        if (pDashResolved?.activeExams) {
          setPendingApprovals(pDashResolved.activeExams);
        }
      } catch (error) {
        console.error('Failed to load Principal assessment approvals:', error);
      }

      // Load student list
      try {
        const sRes = await api.get<any>('/school-admin/students');
        const rawStudents = sRes?.data || sRes;
        if (rawStudents) {
          const list = Array.isArray(rawStudents) ? rawStudents : rawStudents.students || [];
          const parsedClasses = Array.isArray(rawClasses) ? rawClasses : rawClasses?.classes || [];
          const secMap: Record<string, { className: string; gradeNumber: number; sectionName: string }> = {};
          parsedClasses.forEach((c: any) => {
            (c.sections || []).forEach((s: any) => {
              const sId = (s.id || s._id)?.toString();
              if (sId) {
                secMap[sId] = {
                  className: c.name || (c.gradeNumber ? `Class ${c.gradeNumber}` : 'Class'),
                  gradeNumber: c.gradeNumber,
                  sectionName: s.name || 'A',
                };
              }
            });
          });

          const enriched = list.map((st: any) => {
            const secInfo = secMap[st.sectionId?.toString()] || {};
            return {
              ...st,
              id: st.id || st._id || st.studentId,
              fullName: st.student?.fullName || st.fullName || 'Student',
              fullNameNepali: st.student?.fullNameNepali || '',
              email: st.student?.email || st.email || '',
              username: st.student?.username || '',
              className: secInfo.className || st.className || 'Class',
              gradeNumber: secInfo.gradeNumber || st.gradeNumber,
              sectionName: st.section?.name || secInfo.sectionName || 'Section A',
              rollNumber: st.rollNumber ?? '—',
              admissionNumber: st.admissionNumber ?? '—',
              guardianName: st.guardianName || '—',
              guardianPhone: st.guardianPhone || '—',
              attendanceRate: st.attendanceRate ?? null,
              averageGpa: st.averageGpa ?? null,
            };
          });
          setStudentsList(enriched);
        }
      } catch (error) {
        console.error('Failed to load Principal student list:', error);
      }
    } catch (err) {
      console.error('Failed to load Principal dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) {
      alert('Please enter an announcement title and content.');
      return;
    }
    setIsPostingAnn(true);
    try {
      await api.post('/school-admin/announcements', {
        title: newAnnTitle,
        content: newAnnContent,
        targetAudience: newAnnAudience,
      });
      recordSentNotice({
        title: newAnnTitle,
        recipient: newAnnAudience === 'ALL' ? 'Whole School (Students & Faculty)' : newAnnAudience === 'TEACHERS' ? 'All Teaching Faculty' : 'All Enrolled Students',
        recipientRole: newAnnAudience as any,
        type: 'ANNOUNCEMENT',
        priority: 'NORMAL',
        message: newAnnContent,
      });
      alert('Official institutional announcement published & logged to Dispatch History.');
      setNewAnnTitle('');
      setNewAnnContent('');
      const annRes = await api.get<any>('/school-admin/announcements');
      setAnnouncements(Array.isArray(annRes) ? annRes : (annRes?.items || annRes?.data || []));
    } catch (err: any) {
      alert(err.message || 'Failed to publish announcement');
    } finally {
      setIsPostingAnn(false);
    }
  };

  const handleApproveExamResults = async (examId: string) => {
    if (!confirm('Are you sure you want to approve and publish these examination results nationwide?')) return;
    try {
      await api.patch(`/assessment/examinations/${examId}/publish`, {});
      alert('Examination results approved and published to student report cards.');
      loadAllPrincipalData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve examination results');
    }
  };

  // CSV Report Generator
  const downloadCSVReport = (reportType: string) => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (reportType === 'STUDENTS') {
      headers = ['Student ID', 'Full Name', 'Roll No', 'Class', 'Section', 'Attendance %', 'Average GPA'];
      rows = (studentsList.length > 0 ? studentsList : (analyticsData?.atRiskStudents || [])).map((s: any) => [
        s._id || s.id || s.studentId,
        s.fullName || s.studentName,
        s.rollNumber || '—',
        s.className || '—',
        s.sectionName || '—',
        s.attendanceRate == null ? '—' : `${s.attendanceRate}%`,
        s.averageGpa ?? '—',
      ]);
    } else if (reportType === 'ASSIGNMENTS') {
      headers = ['Assignment Title', 'Subject', 'Teacher', 'Due Date', 'Submissions', 'Graded', 'Flagged Copy'];
      rows = (assignmentsData.assignments || []).map((a: any) => [
        a.title,
        a.centralSubjectId?.name || 'General',
        a.teacherId?.fullName || a.teacherId?.name || 'Teacher',
        new Date(a.dueDate).toLocaleDateString(),
        a.totalSubmissions || 0,
        a.gradedCount || 0,
        a.flaggedCount || 0,
      ]);
    } else if (reportType === 'QUIZZES') {
      headers = ['Quiz Assessment', 'Subject', 'Teacher', 'Duration (Mins)', 'Attempts', 'Pass %', 'Proctored'];
      rows = (quizzesData.quizzes || []).map((q: any) => [
        q.title,
        q.centralSubjectId?.name || 'General',
        q.teacherId?.fullName || q.teacherId?.name || 'Teacher',
        q.durationMinutes,
        q.totalAttempts || 0,
        `${q.passPercentage || 0}%`,
        q.securitySettings?.fullscreenEnforced ? 'YES' : 'NO',
      ]);
    } else {
      headers = ['Staff ID', 'Teacher Name', 'Email', 'Assigned Periods', 'Status', 'Evaluation Progress'];
      rows = (teachersList.length > 0 ? teachersList : (analyticsData?.teacherWorkloads || [])).map((t: any) => [
        t.staffId || '—',
        t.fullName,
        t.email,
        t.assignedPeriods ?? '—',
        t.status || 'NORMAL',
        '—',
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NepalEdu_${reportType}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpis = analyticsData?.kpi || {
    totalStudents: studentsList.length,
    totalFaculty: teachersList.length,
    totalClasses: classesList.length,
    totalSections: classesList.reduce((total, cls) => total + (cls.sections?.length || 0), 0),
    overallAttendanceRate: null,
    examCompletionRate: null,
    syllabusCompletionPercentage: null,
    activeAssignments: assignmentsData.stats?.totalAssignments ?? assignmentsData.assignments.length,
    activeQuizzes: quizzesData.stats?.totalQuizzes ?? quizzesData.quizzes.length,
    pendingSubmissions: assignmentsData.stats?.pendingEvaluations ?? null,
  };

  const displayGradeDistribution =
    analyticsData?.gradeDistribution && analyticsData.gradeDistribution.length > 0
      ? analyticsData.gradeDistribution
      : [];

  const displayAttendanceDailyTrend =
    analyticsData?.attendance?.dailyTrend && analyticsData.attendance.dailyTrend.length > 0
      ? analyticsData.attendance.dailyTrend.map((d: any) => ({
          ...d,
          date: d.date ? (d.date.length > 5 ? d.date.slice(-5) : d.date) : d._id || 'Day',
        }))
      : [];

  const displayClassPerformance =
    analyticsData?.classPerformance && analyticsData.classPerformance.length > 0
      ? analyticsData.classPerformance
      : [];

  return (
    <div
      className="min-h-screen bg-[#f4faf8] text-slate-900 flex flex-col font-sans"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f4faf8', color: '#0e3e3b' }}
    >
      <DemoBanner />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #dcebe6',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #117a6b 0%, #117a6b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 800,
            }}
          >
            🇳🇵
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontWeight: 800, color: '#134744', fontSize: '16px', margin: 0 }}>
                {institutionInfo.name || 'Institution'}
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#e6f7f0',
                  color: '#0f5f55',
                  border: '1px solid #bfeede',
                }}
              >
                EMIS: {institutionInfo.emisCode || '—'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#5f736f', display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0 0' }}>
              <span style={{ fontWeight: 700, color: '#0f5f55' }}>Principal Academic Supervision</span> •
              <span>{institutionInfo.academicYear || 'Academic year unavailable'}</span> •
              <span style={{ color: '#117a6b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> Active & Licensed
              </span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="/smartboard/index.html"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #bfeede',
              background: '#effaf6',
              color: '#0f4c4a',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <BookMarked size={14} color="#117a6b" />
            <span>Launch Smart Board</span>
          </a>

          <button
            onClick={() => loadAllPrincipalData()}
            title="Refresh Data"
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid #dcebe6',
              background: '#ffffff',
              color: '#4b605b',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <div style={{ width: '1px', height: '24px', background: '#dcebe6' }} />

          {/* User Profile */}
          <div
            onClick={() => setActiveTab('PROFILE')}
            title="Principal Profile & Security Settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              background: activeTab === 'PROFILE' ? '#effaf6' : 'transparent',
              border: activeTab === 'PROFILE' ? '1px solid #bfeede' : '1px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#117a6b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PR'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#134744', lineHeight: 1.2 }}>
                {user?.fullName || 'Principal'}
              </div>
              <div style={{ fontSize: '10px', color: '#117a6b', fontWeight: 600 }}>Profile & Security →</div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #dcebe6',
              background: '#ffffff',
              color: '#2f4f4c',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ──────────────────────────────────────────────── */}
      <div
        className="flex-1 flex overflow-hidden"
        style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 'calc(100vh - 65px)' }}
      >
        {/* SIDEBAR NAVIGATION */}
        <aside
          className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between overflow-y-auto shrink-0 select-none"
          style={{
            width: '260px',
            background: '#ffffff',
            borderRight: '1px solid #dcebe6',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          <div className="p-3 space-y-4">
            {/* Helper for ultra-clean sidebar items */}
            {(() => {
              const renderItem = (
                itemKey: string,
                label: string,
                IconComponent: React.ElementType,
                badge?: number | string,
                badgeColor?: string
              ) => {
                const isActive = activeTab === itemKey;
                return (
                  <button
                    key={itemKey}
                    onClick={() => setActiveTab(itemKey as any)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: isActive ? 800 : 600,
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                      background: isActive ? '#effaf6' : 'transparent',
                      color: isActive ? '#0f5f55' : '#4b605b',
                      border: isActive ? '1px solid #bfeede' : '1px solid transparent',
                      borderLeft: isActive ? '4px solid #117a6b' : '4px solid transparent',
                      textAlign: 'left',
                      boxShadow: isActive ? '0 1px 3px rgba(17, 122, 107, 0.08)' : 'none',
                    }}
                    className={!isActive ? 'hover:bg-slate-50 hover:text-slate-900' : ''}
                  >
                    <IconComponent size={16} color={isActive ? '#117a6b' : '#8da19d'} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {label}
                    </span>
                    {badge !== undefined && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          padding: '2px 7px',
                          borderRadius: '9999px',
                          fontSize: '10px',
                          fontWeight: 800,
                          background: badgeColor || '#117a6b',
                          color: '#ffffff',
                          flexShrink: 0,
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              };

              return (
                <>
                  {/* Group 1: OVERVIEW & LEADERSHIP */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSidebarGroup('overview')}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition rounded-lg hover:bg-slate-50"
                    >
                      <span>Overview & Leadership</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${collapsedGroups['overview'] ? '-rotate-90' : ''}`}
                      />
                    </button>
                    {!collapsedGroups['overview'] && (
                      <div className="space-y-0.5 mt-1">
                        {renderItem('OVERVIEW', 'Executive Overview', School)}
                        {renderItem('INSTITUTION_PROFILE', 'Institution Profile', Layers)}
                        {renderItem('ACADEMIC_CALENDAR', 'Academic Calendar', Calendar)}
                        {renderItem('PROFILE', 'Profile & Security', UserCheck)}
                      </div>
                    )}
                  </div>

                  {/* Group 2: ACADEMIC SUPERVISION */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSidebarGroup('academic')}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition rounded-lg hover:bg-slate-50"
                    >
                      <span>Academic Supervision</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${collapsedGroups['academic'] ? '-rotate-90' : ''}`}
                      />
                    </button>
                    {!collapsedGroups['academic'] && (
                      <div className="space-y-0.5 mt-1">
                        {renderItem('ACADEMIC_PERFORMANCE', 'Academic Performance', TrendingUp)}
                        {renderItem('TEXTBOOKS', 'Classes 1–12 Textbooks & PDFs', BookOpenCheck)}
                        {renderItem('CURRICULUM_COVERAGE', 'Curriculum Pacing (1–12)', BookOpen)}
                        {renderItem('CLASS_PERFORMANCE', 'Class & Section Results', Layers)}
                        {renderItem('SUBJECT_PERFORMANCE', 'Subject Performance', Award)}
                        {renderItem('TIMETABLE_OVERVIEW', 'Institutional Timetable', Clock)}
                        {renderItem('FEATURE_ACCESS', 'Class Learning Access', Sliders)}
                      </div>
                    )}
                  </div>

                  {/* Group 3: FACULTY & WORKLOAD */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSidebarGroup('faculty')}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition rounded-lg hover:bg-slate-50"
                    >
                      <span>Faculty & Workload</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${collapsedGroups['faculty'] ? '-rotate-90' : ''}`}
                      />
                    </button>
                    {!collapsedGroups['faculty'] && (
                      <div className="space-y-0.5 mt-1">
                        {renderItem('TEACHERS', 'Faculty Directory & Evaluation', Users)}
                        {renderItem('TEACHER_WORKLOAD', 'Teaching Periods & Workload', BarChart2)}
                        {renderItem('CLASS_TEACHER_ASSIGNMENT', 'Class Teacher Designation', UserCheck)}
                      </div>
                    )}
                  </div>

                  {/* Group 4: STUDENT MONITORING */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSidebarGroup('student')}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition rounded-lg hover:bg-slate-50"
                    >
                      <span>Student Monitoring</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${collapsedGroups['student'] ? '-rotate-90' : ''}`}
                      />
                    </button>
                    {!collapsedGroups['student'] && (
                      <div className="space-y-0.5 mt-1">
                        {renderItem('STUDENTS', 'Enrolled Student Registry', GraduationCap)}
                        {renderItem(
                          'AT_RISK_STUDENTS',
                          'At-Risk & Remedial Alerts',
                          AlertTriangle,
                          analyticsData?.atRiskStudents?.length ?? 0,
                          '#ef4444'
                        )}
                        {renderItem('STUDENT_ATTENDANCE', 'Attendance Logs & Trends', CheckSquare)}
                      </div>
                    )}
                  </div>

                  {/* Group 5: ASSESSMENTS & STUDIOS */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSidebarGroup('assessments')}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition rounded-lg hover:bg-slate-50"
                    >
                      <span>Assessments & Studios</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${collapsedGroups['assessments'] ? '-rotate-90' : ''}`}
                      />
                    </button>
                    {!collapsedGroups['assessments'] && (
                      <div className="space-y-0.5 mt-1">
                        {renderItem('ASSIGNMENTS_OVERVIEW', 'Assignment Studio Oversight', FileText)}
                        {renderItem('QUIZ_OVERVIEW', 'Quiz & Exam Assessment', Award)}
                        {renderItem('EXAM_RESULTS', 'Terminal Marks & Results', ShieldCheck)}
                        {renderItem('EVALUATION_PROGRESS', 'Faculty Evaluation Tracker', Clock)}
                      </div>
                    )}
                  </div>

                  {/* Group 6: GOVERNANCE & REPORTS */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSidebarGroup('governance')}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition rounded-lg hover:bg-slate-50"
                    >
                      <span>Governance & Reports</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${collapsedGroups['governance'] ? '-rotate-90' : ''}`}
                      />
                    </button>
                    {!collapsedGroups['governance'] && (
                      <div className="space-y-0.5 mt-1">
                        {renderItem(
                          'APPROVALS',
                          'Academic Approvals',
                          ShieldAlert,
                          pendingApprovals.length,
                          '#6d5bd0'
                        )}
                        {renderItem('REPORTS', 'Institutional Reports', Download)}
                        {renderItem('ANNOUNCEMENTS', 'School Announcements', Megaphone)}
                        {renderItem('EMERGENCY_ALERTS', 'Emergency Alerts', Siren)}
                        {renderItem('STAFF_COVER', 'Absence & Cover', UserMinus)}
                        {renderItem('LIVE_CLASSROOMS', 'Live Classrooms', MonitorPlay)}
                        {renderItem('SCHOOL_DOCUMENTS', 'Reports, Stamp & Certificates', Stamp)}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 text-center">
            Nepal CDC Ecosystem v2.4 • Supervisory Authority
          </div>
        </aside>

        {/* WORKSPACE CONTENT AREA */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6"
          style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f4faf8' }}
        >
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {loadWarnings.length > 0 && (
            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl p-3 flex items-center justify-between">
              <span>Some data could not be loaded ({loadWarnings.join(', ')}). Figures shown may be incomplete.</span>
              <button onClick={() => loadAllPrincipalData()} className="font-bold underline">Retry</button>
            </div>
          )}

          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Institutional Overview Profile Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 text-2xl font-bold shrink-0">
                    🏫
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-slate-800">{institutionInfo.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {institutionInfo.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {[institutionInfo.localLevel, institutionInfo.district].filter(Boolean).join(', ') || '—'} • {institutionInfo.province || '—'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400">EMIS Code:</span> <strong>{institutionInfo.emisCode}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Principal:</span> <strong>{institutionInfo.principalName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Academic Framework:</span> <strong>Classes 1–12 CDC National</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('REPORTS')}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Download size={14} /> Download Reports
                  </button>
                  <button
                    onClick={() => setActiveTab('APPROVALS')}
                    className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <ShieldAlert size={14} /> Academic Approvals
                  </button>
                </div>
              </div>

              {/* Responsive Metric Statistics Grid (8 Metrics) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                    <span>Enrolled Students</span>
                    <GraduationCap size={16} className="text-blue-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-800 font-mono">{kpis.totalStudents}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Institution-wide count</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                    <span>Active Faculty</span>
                    <Users size={16} className="text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-800 font-mono">{kpis.totalFaculty}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Institution faculty total</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                    <span>Classes & Sections</span>
                    <Layers size={16} className="text-purple-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-800 font-mono">
                    {kpis.totalClasses} <span className="text-sm font-normal text-slate-400">({kpis.totalSections} Sec)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Institution-wide sections</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                    <span>Overall Attendance</span>
                    <CheckSquare size={16} className="text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700 font-mono">
                    {kpis.overallAttendanceRate == null ? '—' : `${kpis.overallAttendanceRate}%`}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Based on recorded attendance</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                    <span>Exam Completion Rate</span>
                    <Award size={16} className="text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-800 font-mono">
                    {kpis.examCompletionRate == null ? '—' : `${kpis.examCompletionRate}%`}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">First Terminal Evaluations</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                    <span>Curriculum Covered</span>
                    <BookOpen size={16} className="text-indigo-500" />
                  </div>
                  <div className="text-2xl font-black text-indigo-700 font-mono">
                    {kpis.syllabusCompletionPercentage == null ? '—' : `${kpis.syllabusCompletionPercentage}%`}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">On Pace with CDC Calendar</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                    <span>Active Assignments</span>
                    <FileText size={16} className="text-rose-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-800 font-mono">
                    {assignmentsData.stats?.totalAssignments ?? kpis.activeAssignments}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {assignmentsData.stats?.pendingEvaluations ?? '—'} Awaiting Evaluation
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                    <span>Active Quizzes & Tests</span>
                    <Award size={16} className="text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-800 font-mono">
                    {quizzesData.stats?.totalQuizzes ?? kpis.activeQuizzes}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {quizzesData.stats?.totalAttempts ?? '—'} Student Attempts
                  </div>
                </div>
              </div>

              {/* Quick Action: CDC Classes 1–12 Digital Textbooks Banner */}
              <div
                onClick={() => setActiveTab('TEXTBOOKS')}
                className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 cursor-pointer transition transform hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #0f5f55 0%, #117a6b 50%, #0f5f55 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(6, 95, 70, 0.22)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <BookOpenCheck size={28} color="#bfeede" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.35)',
                          letterSpacing: '0.5px',
                        }}
                      >
                        OFFICIAL NEPAL CDC REPOSITORY
                      </span>
                      <span style={{ fontSize: '12px', color: '#bfeede', fontFamily: 'monospace', fontWeight: 700 }}>
                        129 Textbooks Loaded
                      </span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: '6px 0 2px 0' }}>
                      Classes 1–12 Digital Textbooks & PDF Reader
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#e6fffa', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                      Explore official textbooks from <code style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 6px', borderRadius: '4px', color: '#ffffff', fontFamily: 'monospace' }}>Nepal data/class1</code> to <code style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 6px', borderRadius: '4px', color: '#ffffff', fontFamily: 'monospace' }}>class12</code> with dual-medium English & Nepali sorting and Smart Board canvas.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('TEXTBOOKS');
                  }}
                  style={{
                    background: '#ffffff',
                    color: '#0f4c4a',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <span>Browse Textbooks</span>
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Academic Alerts Section */}
              {analyticsData?.academicAlerts && analyticsData.academicAlerts.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle size={15} className="text-amber-600" /> Institutional Academic Alerts ({analyticsData.academicAlerts.length})
                    </h3>
                    <span className="text-[11px] text-amber-700">Action Required</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analyticsData.academicAlerts.map((alert: any) => (
                      <div
                        key={alert.id}
                        className="bg-white p-3 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs shadow-xs"
                      >
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            alert.type === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                        />
                        <div>
                          <p className="font-bold text-slate-800">{alert.title}</p>
                          <p className="text-slate-600 mt-0.5">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Charts Row: Performance Distribution & Daily Attendance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Letter Grade Distribution Chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">Nepal Letter Grade Distribution</h3>
                      <p className="text-xs text-slate-500">CDC 8-Point Scale Performance Nationwide</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Standard Scale
                    </span>
                  </div>
                  <div className="h-64" style={{ height: '260px', width: '100%', minHeight: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                      <BarChart data={displayGradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebf5f1" />
                        <XAxis dataKey="grade" stroke="#5f736f" fontSize={11} />
                        <YAxis stroke="#5f736f" fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6d4fd6" radius={[4, 4, 0, 0]} name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Daily Attendance Trend Chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">Daily Attendance Rate Trend</h3>
                      <p className="text-xs text-slate-500">Last 7 Sessions Across All Sections</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Avg: {kpis.overallAttendanceRate == null ? '—' : `${kpis.overallAttendanceRate}%`}
                    </span>
                  </div>
                  <div className="h-64" style={{ height: '260px', width: '100%', minHeight: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                      <AreaChart data={displayAttendanceDailyTrend}>
                        <defs>
                          <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6d4fd6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6d4fd6" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebf5f1" />
                        <XAxis dataKey="date" stroke="#5f736f" fontSize={11} />
                        <YAxis domain={[60, 100]} stroke="#5f736f" fontSize={11} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="attendanceRate"
                          stroke="#6d4fd6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#attendanceGrad)"
                          name="Attendance %"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Class-wise Academic Summary Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800">Grade & Class Academic Summary</h3>
                  <button
                    onClick={() => setActiveTab('CLASS_PERFORMANCE')}
                    className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1"
                  >
                    View Detailed Breakdown <ChevronRight size={14} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Grade / Class</th>
                        <th className="p-3">Grade Level</th>
                        <th className="p-3 text-right">Average GPA</th>
                        <th className="p-3 text-right">Average Score</th>
                        <th className="p-3 text-right">Pass Percentage</th>
                        <th className="p-3 text-right">Evaluated Records</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayClassPerformance.slice(0, 6).map((cp: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-800">{cp.className}</td>
                          <td className="p-3 text-slate-500 font-mono">Grade {cp.gradeNumber}</td>
                          <td className="p-3 text-right font-mono font-bold text-teal-700">{cp.averageGpa ?? '—'}</td>
                          <td className="p-3 text-right font-mono">
                            {cp.averageScore == null ? '—' : `${cp.averageScore}%`}
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                cp.passPercentage != null && cp.passPercentage >= 80
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {cp.passPercentage == null ? '—' : `${cp.passPercentage}%`}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-slate-600">{cp.totalEvaluated ?? '—'}</td>
                        </tr>
                      ))}
                      {displayClassPerformance.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-500">
                            No class performance records are available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: ASSIGNMENT STUDIO OVERSIGHT */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'ASSIGNMENTS_OVERVIEW' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-teal-700" size={22} />
                    Institutional Assignment Studio Oversight
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monitor teacher-created assignments, 8-step rubric configurations, student submissions, and copy detection flags.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadCSVReport('ASSIGNMENTS')}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
                  >
                    <Download size={14} /> Export Assignments
                  </button>
                </div>
              </div>

              {/* Assignment Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400">Total Assignments</div>
                  <div className="text-2xl font-black text-slate-800 font-mono mt-1">
                    {assignmentsData.stats?.totalAssignments || assignmentsData.assignments?.length || 0}
                  </div>
                  <div className="text-[11px] text-teal-700 mt-1 font-semibold">
                    {assignmentsData.stats?.activeCount || 0} Active / Published
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400">Total Submissions</div>
                  <div className="text-2xl font-black text-slate-800 font-mono mt-1">
                    {assignmentsData.stats?.totalSubmissions || 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Across All Classes</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400">Pending Evaluations</div>
                  <div className="text-2xl font-black text-amber-600 font-mono mt-1">
                    {assignmentsData.stats?.pendingEvaluations || 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Awaiting Teacher Grading</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400">Copy Detection Flags</div>
                  <div className="text-2xl font-black text-rose-600 font-mono mt-1">
                    {assignmentsData.stats?.flaggedSimilarity || 0}
                  </div>
                  <div className="text-[11px] text-rose-600 mt-1 font-medium">&gt;30% Cross-Student Similarity</div>
                </div>
              </div>

              {/* Assignments Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input
                      type="text"
                      placeholder="Search by assignment title, teacher, or subject..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                      className="text-xs p-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">Active</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Assignment Details</th>
                        <th className="p-3">Subject & Grade</th>
                        <th className="p-3">Assigned Faculty</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3 text-center">Submissions</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(assignmentsData.assignments || [])
                        .filter((a: any) => {
                          const matchesSearch =
                            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (a.teacherId?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (a.centralSubjectId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesStatus =
                            selectedStatusFilter === 'ALL' || a.status === selectedStatusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map((a: any) => (
                          <tr key={a.id || a._id} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{a.title}</div>
                              <div className="text-[11px] text-slate-400 line-clamp-1">
                                {a.unitTitle || (a.curriculumUnits?.[0]?.title ? `Unit: ${a.curriculumUnits[0].title}` : a.description)}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-medium text-slate-700">
                                {a.centralSubjectId?.name || 'General'}
                              </span>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {a.classId?.name || '—'} • {a.sectionId?.name || '—'}
                              </div>
                            </td>
                            <td className="p-3 font-medium text-slate-700">
                              {a.teacherId?.fullName || a.teacherId?.name || 'Faculty Member'}
                            </td>
                            <td className="p-3 text-slate-600 font-mono">
                              {new Date(a.dueDate).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-center">
                              <span className="font-mono font-bold text-teal-800">
                                {a.totalSubmissions || 0}
                              </span>
                              {a.pendingCount > 0 && (
                                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                                  {a.pendingCount} pending
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  a.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {a.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setInspectAssignment(a)}
                                className="px-2.5 py-1 rounded-lg border border-slate-300 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition inline-flex items-center gap-1"
                              >
                                <Eye size={12} /> Inspect
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: QUIZ & ASSESSMENT OVERVIEW */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'QUIZ_OVERVIEW' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Award className="text-teal-700" size={22} />
                    Institutional Quiz & Assessment Studio Oversight
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supervise curriculum-grounded quizzes, exam proctoring configurations, student attempts, and passing rates.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadCSVReport('QUIZZES')}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
                  >
                    <Download size={14} /> Export Quizzes
                  </button>
                </div>
              </div>

              {/* Quiz KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400">Total Quizzes</div>
                  <div className="text-2xl font-black text-slate-800 font-mono mt-1">
                    {quizzesData.stats?.totalQuizzes || quizzesData.quizzes?.length || 0}
                  </div>
                  <div className="text-[11px] text-teal-700 mt-1 font-semibold">
                    {quizzesData.stats?.publishedCount || 0} Published & Live
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400">Total Student Attempts</div>
                  <div className="text-2xl font-black text-slate-800 font-mono mt-1">
                    {quizzesData.stats?.totalAttempts || 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Across All Classes</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400">Overall Pass Percentage</div>
                  <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                    {quizzesData.stats?.overallPassPercentage || 85}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Threshold: 50% Marks</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400">Proctored Quizzes</div>
                  <div className="text-2xl font-black text-purple-700 font-mono mt-1">
                    {quizzesData.stats?.proctoredCount || 0}
                  </div>
                  <div className="text-[11px] text-purple-600 mt-1 font-medium">Fullscreen & Anti-Tab Switch</div>
                </div>
              </div>

              {/* Quizzes Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input
                      type="text"
                      placeholder="Search quizzes by title, subject, or faculty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Quiz Assessment</th>
                        <th className="p-3">Subject & Target Mode</th>
                        <th className="p-3">Faculty</th>
                        <th className="p-3 text-center">Duration</th>
                        <th className="p-3 text-center">Attempts</th>
                        <th className="p-3 text-center">Pass %</th>
                        <th className="p-3 text-center">Proctoring</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(quizzesData.quizzes || [])
                        .filter((q: any) =>
                          q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (q.teacherId?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (q.centralSubjectId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((q: any) => (
                          <tr key={q.id || q._id} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{q.title}</div>
                              <div className="text-[11px] text-slate-400 line-clamp-1">
                                {q.questions?.length || 0} Questions • {q.totalMarks} Marks
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium text-slate-700">
                                {q.centralSubjectId?.name || 'General'}
                              </div>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                                {q.targetMode || 'CHAPTER_WISE'}
                              </span>
                            </td>
                            <td className="p-3 font-medium text-slate-700">
                              {q.teacherId?.fullName || q.teacherId?.name || 'Faculty Member'}
                            </td>
                            <td className="p-3 text-center font-mono text-slate-600">
                              {q.durationMinutes} mins
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-teal-800">
                              {q.totalAttempts || 0}
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800">
                                {q.passPercentage || 0}%
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {q.securitySettings?.fullscreenEnforced ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                  Shielded
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Standard</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setInspectQuiz(q)}
                                className="px-2.5 py-1 rounded-lg border border-slate-300 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition inline-flex items-center gap-1"
                              >
                                <Eye size={12} /> Inspect
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: AT-RISK STUDENTS & REMEDIAL ALERTS */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'AT_RISK_STUDENTS' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="text-rose-600" size={22} />
                    At-Risk Student Monitoring & Remedial Interventions
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evidence-based detection for students with GPA &lt; 2.0, failing terminal marks, or low attendance.
                  </p>
                </div>
                <button
                  onClick={() => downloadCSVReport('STUDENTS')}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={14} /> Export At-Risk Registry
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800">Flagged Students Requiring Academic Follow-Up</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {analyticsData?.atRiskStudents?.length || 0} Students Flagged
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Class & Section</th>
                        <th className="p-3 text-right">Average GPA</th>
                        <th className="p-3 text-center">Failing Subjects</th>
                        <th className="p-3 text-center">Risk Level</th>
                        <th className="p-3">Recommended Remediation</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(analyticsData?.atRiskStudents || []).map((s: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{s.studentName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{s.email || '—'}</div>
                          </td>
                          <td className="p-3 font-medium text-slate-700">
                            {s.className || '—'} • {s.sectionName || '—'}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-rose-600">
                            {s.averageGpa ?? '—'}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold font-mono">
                              {s.failedSubjects ?? '—'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.riskLevel === 'HIGH'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {s.riskLevel || '—'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 italic">
                            Remedial coaching & individual tutoring in weak subjects
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                alert(`Opening intervention log for ${s.studentName}. Notes recorded.`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[11px] font-bold text-teal-800 hover:bg-teal-100"
                            >
                              Log Intervention
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!analyticsData?.atRiskStudents || analyticsData.atRiskStudents.length === 0) && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            {Array.isArray(analyticsData?.atRiskStudents)
                              ? 'No students currently meet the configured at-risk criteria.'
                              : 'At-risk assessment data is unavailable.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 5: TEACHERS & WORKLOAD */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {(activeTab === 'TEACHERS' || activeTab === 'TEACHER_WORKLOAD') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Users className="text-teal-700" size={22} />
                    Faculty Directory & Teaching Workload Analysis
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monitor teacher periods, subject allocations, and evaluation completion rates across all grades.
                  </p>
                </div>
                <button
                  onClick={() => downloadCSVReport('TEACHERS')}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={14} /> Export Faculty Workload
                </button>
              </div>

              {/* Workload Distribution Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800">Assigned Weekly Teaching Periods</h3>
                  <span className="text-xs text-slate-500">Benchmark: 18–24 Periods/Week</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Faculty Name</th>
                        <th className="p-3">Staff ID & Contact</th>
                        <th className="p-3 text-center">Weekly Periods</th>
                        <th className="p-3 text-center">Workload Status</th>
                        <th className="p-3 text-center">Evaluation Pace</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(teachersList.length > 0 ? teachersList : (analyticsData?.teacherWorkloads || [])).map(
                        (t: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold text-slate-800">
                              {t.fullName || t.name}
                            </td>
                            <td className="p-3 text-slate-500 font-mono">
                              {t.staffId ? `${t.staffId} • ` : ''}{t.email}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-slate-700">
                              {t.assignedPeriods != null ? `${t.assignedPeriods} periods` : '—'}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  t.status === 'HEAVY' || (t.assignedPeriods && t.assignedPeriods > 24)
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-emerald-50 text-emerald-800'
                                }`}
                              >
                                {t.status || 'NORMAL'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="text-emerald-700 font-medium">On Track</span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setInspectTeacher(t)}
                                className="px-2.5 py-1 rounded-lg border border-slate-300 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 6: ACADEMIC APPROVALS */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'APPROVALS' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="text-teal-700" size={22} />
                  Institutional Academic Approvals
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Approve and publish terminal examination marksheets, timetable releases, and institutional certifications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Examination Approvals */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Award size={16} className="text-teal-600" />
                      Pending Terminal Exam Result Approvals
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {pendingApprovals.length} Pending
                    </span>
                  </div>

                  {pendingApprovals.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div
                        style={{
                          background: '#effaf6',
                          border: '1px solid #bbf7d0',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#16a34a',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                            All Submitted Examination Marksheets Are Sealed & Published
                          </div>
                          <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>
                            No terminal results are currently queued for Principal authorization. Active examination preparations and teacher marks entry are being tracked in real time.
                          </div>
                        </div>
                      </div>

                      {/* Live Examination Pipeline Radar */}
                      <div style={{ background: '#f4faf8', border: '1px solid #dcebe6', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#134744' }}>
                            Terminal Examination Progress Pipeline (Session 2083 BS)
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#117a6b' }}>
                            3 Annual Milestones
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {[
                            {
                              name: 'First Terminal Examination 2083',
                              status: 'PUBLISHED',
                              statusLabel: 'Published & Sealed',
                              statusBg: '#e6f7f0',
                              statusColor: '#0f5f55',
                              progress: 100,
                              desc: '28 of 28 sections marks completed. Student report cards accessible.',
                              actionTab: 'EXAM_RESULTS',
                              actionLabel: 'Inspect Standings',
                            },
                            {
                              name: 'Second Terminal Examination 2083',
                              status: 'EVALUATION',
                              statusLabel: 'Marks Entry In Progress',
                              statusBg: '#f5f3ff',
                              statusColor: '#4c3fa8',
                              progress: 68,
                              desc: 'Faculty currently recording theory & practical scores across 14 grades.',
                              actionTab: 'EVALUATION_PROGRESS',
                              actionLabel: 'Track Evaluation',
                            },
                            {
                              name: 'Annual Board & SEE Examination 2083',
                              status: 'PREPARATION',
                              statusLabel: 'Curriculum Pacing',
                              statusBg: '#ebf5f1',
                              statusColor: '#4b605b',
                              progress: 88,
                              desc: 'Curriculum coverage tracking across Grades 1–12.',
                              actionTab: 'CURRICULUM_COVERAGE',
                              actionLabel: 'Check Readiness',
                            },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #dcebe6',
                                borderRadius: '10px',
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0e3e3b' }}>{item.name}</span>
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      padding: '2px 8px',
                                      borderRadius: '9999px',
                                      background: item.statusBg,
                                      color: item.statusColor,
                                    }}
                                  >
                                    {item.statusLabel}
                                  </span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '2px' }}>{item.desc}</div>
                                <div style={{ width: '100%', height: '4px', background: '#ebf5f1', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
                                  <div style={{ width: `${item.progress}%`, height: '100%', background: '#117a6b', borderRadius: '4px' }} />
                                </div>
                              </div>
                              <button
                                onClick={() => setActiveTab(item.actionTab as any)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  background: '#effaf6',
                                  color: '#0f5f55',
                                  border: '1px solid #bfeede',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {item.actionLabel} →
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingApprovals.map((ex: any) => (
                        <div
                          key={ex._id || ex.id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4"
                        >
                          <div>
                            <h4 className="font-bold text-xs text-slate-800">{ex.name}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {ex.assessmentSummary
                                ? `${ex.assessmentSummary.ready} of ${ex.assessmentSummary.total} assessments approved or published.`
                                : 'Awaiting final Principal seal.'}
                              {ex.assessmentSummary && !ex.readyToPublish ? ' Remaining ones must be approved first.' : ''}
                            </p>
                          </div>
                          <button
                            onClick={() => handleApproveExamResults(ex._id || ex.id)}
                            disabled={ex.readyToPublish === false}
                            className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shrink-0 shadow-xs"
                          >
                            Approve & Publish Seal
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timetable Approval Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Clock size={16} className="text-purple-600" />
                      Timetable Publication Status
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ttOverview && ttOverview.publishedSections === ttOverview.totalSections && ttOverview.totalSections > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {ttOverview ? (ttOverview.publishedSections === ttOverview.totalSections && ttOverview.totalSections > 0 ? 'All published' : 'Incomplete') : '—'}
                    </span>
                  </div>

                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center justify-between">
                    <div>
                      <strong>Published sections:</strong>{' '}
                      {ttOverview ? `${ttOverview.publishedSections} of ${ttOverview.totalSections}` : 'not available'}
                      <div className="text-[10px] text-teal-700">Teachers and students see only published versions.</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('TIMETABLE_OVERVIEW')}
                      className="px-3 py-1 rounded-lg bg-white border border-teal-300 text-teal-800 text-xs font-bold"
                    >
                      Inspect Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 7: INSTITUTIONAL REPORTS */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'REPORTS' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Download className="text-teal-700" size={22} />
                  Institutional Academic Reports & Exports
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate verified statistical reports for the Ministry of Education, CDC, and school management committee.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    type: 'STUDENTS',
                    title: 'Student Enrollment & GPA Registry',
                    desc: 'Full roster of enrolled students with attendance rates, terminal marks, and class rankings.',
                    icon: GraduationCap,
                  },
                  {
                    type: 'TEACHERS',
                    title: 'Faculty Workload & Allocation Report',
                    desc: 'Teaching periods assigned per week, subjects taught, and evaluation completion status.',
                    icon: Users,
                  },
                  {
                    type: 'ASSIGNMENTS',
                    title: 'Assignment Studio Performance Log',
                    desc: 'Complete overview of assignments created, submission numbers, and copy detection flags.',
                    icon: FileText,
                  },
                  {
                    type: 'QUIZZES',
                    title: 'Quiz & Proctored Examination Log',
                    desc: 'Assessment attempts, average scores, pass percentages, and security event logs.',
                    icon: Award,
                  },
                  {
                    type: 'ATTENDANCE',
                    title: 'Institutional Attendance Summary',
                    desc: 'Monthly presence trends, section attendance breakdowns, and absenteeism statistics.',
                    icon: CheckSquare,
                  },
                  {
                    type: 'CURRICULUM',
                    title: 'CDC Curriculum Coverage Audit',
                    desc: 'Detailed unit-by-unit syllabus completion across English and Nepali mediums.',
                    icon: BookOpen,
                  },
                ].map((rep, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-300 transition"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mb-3">
                        <rep.icon size={20} />
                      </div>
                      <h3 className="font-bold text-sm text-slate-800">{rep.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{rep.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                      <button
                        onClick={() => generatePrintableReport(rep.type)}
                        style={{
                          flex: 1,
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #117a6b 0%, #0f5f55 100%)',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          border: 'none',
                          boxShadow: '0 2px 4px rgba(17, 122, 107, 0.2)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Printer size={13} /> Print Official PDF
                      </button>
                      <button
                        onClick={() => downloadCSVReport(rep.type)}
                        style={{
                          flex: 1,
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: '#f4faf8',
                          color: '#2f4f4c',
                          border: '1px solid #cfdcd8',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <FileSpreadsheet size={13} /> CSV Sheet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 8: ANNOUNCEMENTS */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'EMERGENCY_ALERTS' && <EmergencyAlertPanel />}
          {activeTab === 'STAFF_COVER' && <TeacherCoverPanel />}
          {activeTab === 'LIVE_CLASSROOMS' && <LiveClassroomsPanel />}
          {activeTab === 'SCHOOL_DOCUMENTS' && <SchoolDocumentsPanel />}

          {activeTab === 'ANNOUNCEMENTS' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Megaphone className="text-teal-700" size={22} />
                  Institutional Announcements & Circulars
                </h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setAnnouncementSubTab('BROADCAST')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '9px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: announcementSubTab === 'BROADCAST' ? '1px solid #117a6b' : '1px solid #cfdcd8',
                      background: announcementSubTab === 'BROADCAST' ? '#117a6b' : '#ffffff',
                      color: announcementSubTab === 'BROADCAST' ? '#ffffff' : '#4b605b',
                      boxShadow: announcementSubTab === 'BROADCAST' ? '0 2px 4px rgba(17, 122, 107, 0.2)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    📢 Broadcast New Circular
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementSubTab('HISTORY')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '9px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: announcementSubTab === 'HISTORY' ? '1px solid #117a6b' : '1px solid #cfdcd8',
                      background: announcementSubTab === 'HISTORY' ? '#117a6b' : '#ffffff',
                      color: announcementSubTab === 'HISTORY' ? '#ffffff' : '#4b605b',
                      boxShadow: announcementSubTab === 'HISTORY' ? '0 2px 4px rgba(17, 122, 107, 0.2)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>📋 Sent Notices & Dispatch History</span>
                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '9999px', background: announcementSubTab === 'HISTORY' ? 'rgba(255,255,255,0.25)' : '#dcebe6', color: announcementSubTab === 'HISTORY' ? '#ffffff' : '#117a6b', fontWeight: 800 }}>
                      {sentNoticesLog.length}
                    </span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Broadcast official circulars to teachers, students, and academic departments.
                </p>
              </div>

              {announcementSubTab === 'BROADCAST' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form to Post Announcement */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-800">Publish New Circular</h3>
                  <form onSubmit={handlePostAnnouncement} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Circular Title *</label>
                      <input
                        type="text"
                        value={newAnnTitle}
                        onChange={(e) => setNewAnnTitle(e.target.value)}
                        placeholder="e.g. Schedule for Second Terminal Examination"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                      <select
                        value={newAnnAudience}
                        onChange={(e) => setNewAnnAudience(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="ALL">Entire Institution (Teachers & Students)</option>
                        <option value="TEACHERS">Teaching Faculty Only</option>
                        <option value="STUDENTS">Students Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Circular Message *</label>
                      <textarea
                        rows={4}
                        value={newAnnContent}
                        onChange={(e) => setNewAnnContent(e.target.value)}
                        placeholder="Write official circular instructions here..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPostingAnn}
                      className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold shadow-xs transition"
                    >
                      {isPostingAnn ? 'Publishing...' : 'Broadcast Circular'}
                    </button>
                  </form>
                </div>

                {/* Published Announcements List */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-800">Published Institutional Circulars</h3>
                  {announcements.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs">
                      No official circulars published yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {announcements.map((a: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-800">{a.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(a.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 whitespace-pre-wrap">{a.content}</p>
                          <div className="text-[10px] text-teal-700 font-semibold pt-1">
                            Audience: {a.targetAudience || 'ALL'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              ) : (
                /* Sent Notices History Log Table */
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #ebf5f1', paddingBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0e3e3b', margin: 0 }}>
                        Official Dispatched Notices & Early Warning Logs
                      </h3>
                      <p style={{ fontSize: '11px', color: '#5f736f', margin: '2px 0 0' }}>
                        Saved on the server: attendance warnings, faculty evaluation alerts, campus-wide broadcasts and emergency alerts.
                      </p>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#4b605b', fontWeight: 700, textAlign: 'left' }}>
                          <th style={{ padding: '10px 12px' }}>Dispatched Date & Time</th>
                          <th style={{ padding: '10px 12px' }}>Notice Type</th>
                          <th style={{ padding: '10px 12px' }}>Target Recipient</th>
                          <th style={{ padding: '10px 12px' }}>Priority</th>
                          <th style={{ padding: '10px 12px' }}>Message Details</th>
                          <th style={{ padding: '10px 12px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sentNoticesLog.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#8da19d' }}>
                              No notices have been recorded yet.
                            </td>
                          </tr>
                        ) : (
                          sentNoticesLog.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                              <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#5f736f', fontWeight: 600 }}>
                                {item.timestamp}
                              </td>
                              <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    background: item.type === 'ATTENDANCE_WARNING'
                                      ? '#fee2e2'
                                      : item.type === 'EVALUATION_REMINDER'
                                      ? '#ede9fe'
                                      : '#e0f2fe',
                                    color: item.type === 'ATTENDANCE_WARNING'
                                      ? '#b91c1c'
                                      : item.type === 'EVALUATION_REMINDER'
                                      ? '#4c3fa8'
                                      : '#0369a1',
                                  }}
                                >
                                  {item.type}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0e3e3b' }}>
                                {item.recipient}
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    color: item.priority === 'HIGH' ? '#dc2626' : '#2563eb',
                                  }}
                                >
                                  {item.priority}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', color: '#2f4f4c', maxWidth: '350px' }}>
                                <div style={{ fontWeight: 700, color: '#0e3e3b' }}>{item.title}</div>
                                <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '2px', lineHeight: '1.4' }}>
                                  {item.message}
                                </div>
                              </td>
                              <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    color: '#16a34a',
                                    background: '#effaf6',
                                    border: '1px solid #bbf7d0',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                  }}
                                >
                                  <Check size={11} /> {item.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ACADEMIC TAB: CLASS & SECTION RESULTS / EXAM MARKS ──── */}
          {(activeTab === 'CLASS_PERFORMANCE' || activeTab === 'EXAM_RESULTS') && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Select Class & Section:</span>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => {
                      const secId = e.target.value;
                      setSelectedSectionId(secId);
                      for (const c of classesList) {
                        const found = c.sections?.find((s: any) => (s.id || s._id) === secId);
                        if (found) {
                          setSelectedSectionName(`${c.name || 'Class ' + c.gradeNumber} - Section ${found.name || 'A'}`);
                          break;
                        }
                      }
                    }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                  >
                    {classesList.map((c: any) =>
                      c.sections?.map((s: any) => (
                        <option key={s.id || s._id} value={s.id || s._id}>
                          {c.name || `Class ${c.gradeNumber}`} — Section {s.name || 'A'}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Supervisory Terminal Marksheet & CDC 2078 Report Cards
                </div>
              </div>

              {selectedSectionId ? (
                <ClassTeacherSectionPanel
                  sectionId={selectedSectionId}
                  sectionName={selectedSectionName}
                  className={selectedSectionName.split(' - ')[0] || ''}
                  readOnly={false}
                />
              ) : (
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  Select a section above to supervise examination marks and report cards.
                </div>
              )}
            </div>
          )}

          {/* ── ACADEMIC TAB: TIMETABLE OVERVIEW ───────────────────────── */}
          {activeTab === 'TIMETABLE_OVERVIEW' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <TimetableManagementPanel />
            </div>
          )}

          {/* ── FACULTY TAB: CLASS TEACHER DESIGNATION ────────────────────── */}
          {activeTab === 'CLASS_TEACHER_ASSIGNMENT' && (() => {
            const allFlatSections: Array<{ classId: string; className: string; gradeNumber: number; section: any }> = [];
            classesList.forEach((cls: any) => {
              (cls.sections || []).forEach((sec: any) => {
                allFlatSections.push({
                  classId: cls.id || cls._id,
                  className: cls.name || `Class ${cls.gradeNumber}`,
                  gradeNumber: cls.gradeNumber,
                  section: sec,
                });
              });
            });

            const totalSectionsCount = allFlatSections.length;
            const assignedCount = allFlatSections.filter((item) => {
              const ct = item.section.classTeacherId;
              return ct && ct !== 'UNASSIGN' && ct !== '[object Object]';
            }).length;
            const unassignedCount = totalSectionsCount - assignedCount;

            const filteredSections = allFlatSections.filter((item) => {
              if (classTeacherFilterGrade !== 'ALL' && String(item.gradeNumber) !== classTeacherFilterGrade) {
                return false;
              }
              if (classTeacherSearch.trim()) {
                const q = classTeacherSearch.toLowerCase();
                const secName = (item.section.name || '').toLowerCase();
                const clsName = item.className.toLowerCase();
                const teacherName = (
                  typeof item.section.classTeacherId === 'object'
                    ? item.section.classTeacherId?.fullName || item.section.classTeacherId?.username || ''
                    : ''
                ).toLowerCase();
                return secName.includes(q) || clsName.includes(q) || teacherName.includes(q);
              }
              return true;
            });

            return (
              <div className="space-y-6">
                {/* Header Banner */}
                <div
                  className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #117a6b 0%, #0f5f55 50%, #0f5f55 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
                        <UserCheck size={14} /> Institutional Class Teacher Appointing Authority
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-white">
                        Class Teacher Designation & Section Supervision
                      </h2>
                      <p className="text-emerald-100/80 text-xs max-w-2xl mt-1 leading-relaxed">
                        As Principal, designate or reassign faculty members as official <strong>Class Teachers</strong> for each grade section.
                        Only appointed class teachers receive exclusive supervisory privileges: daily attendance roll calls, consolidated marksheets,
                        CDC report cards, and section-wide broadcast bulletins.
                      </p>
                    </div>

                    <button
                      onClick={() => loadAllPrincipalData()}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition shadow-xs self-start md:self-center"
                    >
                      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                      Sync Allocations
                    </button>
                  </div>
                </div>

                {/* Status Alert Banner */}
                {classTeacherMsg && (
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold ${
                      classTeacherMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {classTeacherMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      <span>{classTeacherMsg.text}</span>
                    </div>
                    <button
                      onClick={() => setClassTeacherMsg(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                      <span>Total Sections</span>
                      <Layers size={16} className="text-teal-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-800">{totalSectionsCount}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Across Classes 1 to 12</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                      <span>Appointed Class Teachers</span>
                      <ShieldCheck size={16} className="text-emerald-600" />
                    </div>
                    <div className="text-2xl font-black text-emerald-700">{assignedCount}</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                      {totalSectionsCount > 0 ? Math.round((assignedCount / totalSectionsCount) * 100) : 0}% Assigned
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                      <span>Pending Designation</span>
                      <AlertCircle size={16} className="text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-amber-600">{unassignedCount}</div>
                    <div className="text-[11px] text-amber-600 font-semibold mt-1">Sections need class teacher</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                      <span>Available Faculty</span>
                      <Users size={16} className="text-indigo-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-800">{teachersList.length}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Active verified teachers</div>
                  </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Search size={16} className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search section, class, or teacher name..."
                      value={classTeacherSearch}
                      onChange={(e) => setClassTeacherSearch(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-teal-500 w-full md:w-72"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Grade:</span>
                    {['ALL', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setClassTeacherFilterGrade(g)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                          classTeacherFilterGrade === g
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {g === 'ALL' ? 'All Grades' : `Class ${g}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table of Sections and Class Teacher Appointments */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="py-3 px-4">Class & Level</th>
                          <th className="py-3 px-4">Section Name</th>
                          <th className="py-3 px-4">Capacity / Medium</th>
                          <th className="py-3 px-4">Current Appointed Class Teacher</th>
                          <th className="py-3 px-4 text-right">Appoint / Reassign Faculty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredSections.map(({ className, gradeNumber, section }) => {
                          const secId = section.id || section._id;
                          const currentTeacher = section.classTeacherId;
                          const hasTeacher = currentTeacher && currentTeacher !== 'UNASSIGN' && currentTeacher !== '[object Object]';
                          const teacherName = typeof currentTeacher === 'object'
                            ? currentTeacher.fullName || currentTeacher.name || 'Assigned Teacher'
                            : teachersList.find((t: any) => (t.id || t._id) === currentTeacher)?.fullName || 'Assigned Teacher';
                          const teacherUsername = typeof currentTeacher === 'object'
                            ? currentTeacher.username || ''
                            : teachersList.find((t: any) => (t.id || t._id) === currentTeacher)?.username || '';
                          const currentTeacherId = typeof currentTeacher === 'object'
                            ? currentTeacher.id || currentTeacher._id
                            : currentTeacher;

                          const selectedVal = selectedTeacherForSection[secId] !== undefined
                            ? selectedTeacherForSection[secId]
                            : (hasTeacher ? currentTeacherId : '');

                          const isSaving = assigningSectionId === secId;

                          return (
                            <tr key={secId} className="hover:bg-slate-50/60 transition">
                              <td className="py-3.5 px-4 font-bold text-slate-800">
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-xs border border-teal-200">
                                    {gradeNumber}
                                  </span>
                                  <div>
                                    <div>{className}</div>
                                    <div className="text-[10.5px] font-normal text-slate-400">
                                      {gradeNumber <= 5 ? 'Primary Wing' : gradeNumber <= 8 ? 'Basic / Lower Sec' : gradeNumber <= 10 ? 'Secondary (SEE)' : 'Higher Secondary (+2)'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-bold text-slate-700">
                                <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                                  {section.name}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-slate-500">
                                <div className="font-semibold text-slate-700">
                                  {section.capacity || 45} Max Students
                                </div>
                                <div className="text-[10.5px] text-slate-400 uppercase">
                                  {section.medium || 'BILINGUAL'} MEDIUM
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                {hasTeacher ? (
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                      {teacherName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'CT'}
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                        <span>{teacherName}</span>
                                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                          Appointed CT
                                        </span>
                                      </div>
                                      <div className="text-[11px] text-slate-400 font-mono">
                                        {teacherUsername ? `@${teacherUsername}` : 'Faculty Member'}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                                    <AlertCircle size={13} className="text-amber-600" />
                                    <span>No Class Teacher Appointed</span>
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <select
                                    value={selectedVal}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setSelectedTeacherForSection((prev) => ({
                                        ...prev,
                                        [secId]: val,
                                      }));
                                    }}
                                    className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-500 bg-white max-w-[210px]"
                                  >
                                    <option value="">-- Choose Faculty to Appoint --</option>
                                    <option value="UNASSIGN" className="text-rose-600 font-bold">
                                      ✕ Unassign / Vacant Class Teacher
                                    </option>
                                    {teachersList.map((t: any) => {
                                      const tid = t.id || t._id;
                                      return (
                                        <option key={tid} value={tid}>
                                          {t.fullName} ({t.username || t.staffId})
                                        </option>
                                      );
                                    })}
                                  </select>

                                  <button
                                    onClick={() => handleAssignClassTeacher(secId, selectedVal)}
                                    disabled={isSaving || !selectedVal || selectedVal === currentTeacherId}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed bg-teal-700 hover:bg-teal-800 text-white"
                                  >
                                    {isSaving ? (
                                      <>
                                        <RefreshCw size={12} className="animate-spin" />
                                        <span>Saving...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check size={13} />
                                        <span>Save Designation</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredSections.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No matching sections found for the selected filter.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {activeTab === 'FEATURE_ACCESS' && (
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Class Learning Access</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure learning resources, homework assignments, and practice tests available to students in each class.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadPrincipalFeatureMatrix}
                  disabled={featureMatrixLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  <RefreshCw size={14} className={featureMatrixLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {/* Resource Access Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                  { key: 'NOTES', label: 'Notes', icon: FileText, color: 'text-teal-700 bg-teal-50 border-teal-200' },
                  { key: 'MATERIALS', label: 'Materials', icon: BookOpen, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                  { key: 'PRESENTATIONS', label: 'Presentations', icon: BookMarked, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
                  { key: 'VIDEOS', label: 'Videos', icon: Maximize2, color: 'text-purple-700 bg-purple-50 border-purple-200' },
                  { key: 'ASSIGNMENTS', label: 'Assignments', icon: FileSpreadsheet, color: 'text-rose-700 bg-rose-50 border-rose-200' },
                  { key: 'QUIZZES', label: 'Quizzes', icon: Award, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                ].map((item) => {
                  const enabledCount = (featureMatrix?.classes || []).filter(
                    (row: any) => row.features?.[item.key]?.enabled
                  ).length;
                  const total = (featureMatrix?.classes || []).length || classesList.length;
                  return (
                    <div key={item.key} className={`p-3 rounded-xl border ${item.color} shadow-xs space-y-1`}>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{item.label}</span>
                        <item.icon size={13} />
                      </div>
                      <div className="text-sm font-black font-mono">
                        {enabledCount} / {total}
                      </div>
                      <div className="text-[10px] font-semibold opacity-80">Classes Active</div>
                    </div>
                  );
                })}
              </div>

              {featureMatrixLoading ? (
                <p className="py-8 text-center text-sm text-slate-500">Loading class feature settings…</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[840px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                        <th className="py-3 px-4">Class</th>
                        {[
                          ['NOTES', 'Notes'],
                          ['MATERIALS', 'Materials'],
                          ['PRESENTATIONS', 'Presentations'],
                          ['VIDEOS', 'Videos'],
                          ['ASSIGNMENTS', 'Assignments'],
                          ['QUIZZES', 'Quizzes'],
                        ].map(([key, label]) => (
                          <th key={key} className="px-3 py-3 text-center">{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(featureMatrix?.classes || [])
                        .filter((row: any) => classesList.some((cls: any) => (cls.id || cls._id) === row.classId))
                        .map((row: any) => (
                          <tr key={row.classId} className="hover:bg-slate-50/60 transition">
                            <th className="py-3 px-4 font-bold text-slate-800">
                              {row.className || `Class ${row.gradeNumber}`}
                            </th>
                            {[
                              ['NOTES', 'Notes'],
                              ['MATERIALS', 'Materials'],
                              ['PRESENTATIONS', 'Presentations'],
                              ['VIDEOS', 'Videos'],
                              ['ASSIGNMENTS', 'Assignments'],
                              ['QUIZZES', 'Quizzes'],
                            ].map(([featureKey]) => {
                              const feature = row.features?.[featureKey];
                              const isDisabled = !feature || !feature.isEditable || featureMatrixLoading;
                              return (
                                <td key={featureKey} className="px-3 py-3 text-center">
                                  <button
                                    type="button"
                                    disabled={isDisabled}
                                    title={feature?.source === 'SUBSCRIPTION_BLOCKED' ? 'Unavailable in the current subscription' : undefined}
                                    onClick={() => togglePrincipalClassFeature(row.classId, featureKey, feature.enabled)}
                                    className={`rounded-lg px-3.5 py-1.5 font-bold text-xs transition disabled:cursor-not-allowed disabled:opacity-50 shadow-xs inline-flex items-center gap-1.5 ${
                                      feature?.enabled
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                                    }`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${feature?.enabled ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                                    <span>{feature?.enabled ? 'On' : 'Off'}</span>
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {!(featureMatrix?.classes || []).some((row: any) => classesList.some((cls: any) => (cls.id || cls._id) === row.classId)) && (
                    <p className="py-8 text-center text-sm text-slate-500">No configured classes are available.</p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── PRINCIPAL PROFILE & SECURITY ─────────────────────────── */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-6 max-w-4xl">
              {/* Executive Hero Banner */}
              <div
                className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #117a6b 0%, #0f5f55 50%, #0f5f55 100%)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                  <div className="flex items-center gap-4">
                    <SchoolLogoBadge size={64} radius={16} fallback={null} />
                    <div className="w-16 h-16 rounded-2xl bg-white text-teal-800 font-black text-2xl flex items-center justify-center shadow-md border-2 border-teal-200">
                      {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PR'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-black text-white">{user?.fullName || 'Dr. Shailesh Kumar Verma'}</h2>
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 text-xs font-bold border border-teal-400/30">
                          Institutional Head
                        </span>
                      </div>
                      <p className="text-xs text-teal-100/80 mt-1">
                        Principal & Chief Academic Officer • EMIS {user?.institutionCode || '—'}
                      </p>
                      <p className="text-[11px] text-teal-200/70 mt-0.5">
                        {institutionInfo.name || (user as any)?.institutionName || 'Your institution'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition self-start sm:self-center"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Sub-tab pills */}
              <div className="flex gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setProfileActiveTab('DETAILS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    profileActiveTab === 'DETAILS'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <School size={14} /> Institutional Details
                </button>
                <button
                  onClick={() => setProfileActiveTab('SECURITY')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    profileActiveTab === 'SECURITY'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <ShieldCheck size={14} /> Security & Change Password
                </button>
              </div>

              {/* DETAILS TAB */}
              {profileActiveTab === 'DETAILS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                    <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                      <School size={16} className="text-teal-700" /> Executive Profile
                    </h3>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Official Title:</span>
                      <span className="font-bold text-slate-800">Principal & Campus Chief</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Username:</span>
                      <span className="font-bold font-mono text-teal-800">{user?.username || 'dhambojhi_principal'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Staff Designation:</span>
                      <span className="font-bold text-slate-800">Class 1 Gazetted Administrator</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Curriculum Authority:</span>
                      <span className="font-bold text-emerald-700">Nepal CDC & National Examination Board</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                    <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                      <Layers size={16} className="text-teal-700" /> Academic Structure
                    </h3>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Institution:</span>
                      <span className="font-bold text-slate-800">{institutionInfo.name || (user as any)?.institutionName || 'Your institution'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">EMIS Code:</span>
                      <span className="font-bold font-mono text-slate-800">{user?.institutionCode || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Active Teachers:</span>
                      <span className="font-bold text-teal-800">{teachersList.length} Faculty Members</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Classes & Sections:</span>
                      <span className="font-bold text-slate-800">{classesList.length} Grades (1–12)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY & CHANGE PASSWORD TAB */}
              {profileActiveTab === 'SECURITY' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-lg space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Change Executive Password</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Protect administrative controls with a secure, updated password.
                    </p>
                  </div>

                  {passwordChangeMsg && (
                    <div
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                        passwordChangeMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {passwordChangeMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      <span>{passwordChangeMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Enter current password"
                          value={currentPasswordInput}
                          onChange={(e) => setCurrentPasswordInput(e.target.value)}
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-9 text-xs focus:outline-none focus:border-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Min 6 characters"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-9 text-xs focus:outline-none focus:border-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {newPasswordInput && (
                        <div className="mt-2">
                          <div className="flex gap-1 h-1">
                            <div className={`flex-1 rounded-full ${newPasswordInput.length >= 6 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <div className={`flex-1 rounded-full ${newPasswordInput.length >= 8 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                            <div className={`flex-1 rounded-full ${/[0-9]/.test(newPasswordInput) && newPasswordInput.length >= 8 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                          </div>
                          <span className={`text-[10.5px] font-bold mt-1 block ${newPasswordInput.length < 6 ? 'text-rose-500' : 'text-emerald-600'}`}>
                            {newPasswordInput.length < 6 ? 'Too short (min 6 characters)' : newPasswordInput.length < 8 ? 'Acceptable strength' : 'Strong password'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Re-enter new password"
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          required
                          className={`w-full border rounded-lg px-3 py-2 pr-9 text-xs focus:outline-none ${
                            confirmPasswordInput && confirmPasswordInput !== newPasswordInput
                              ? 'border-rose-400 focus:border-rose-500'
                              : 'border-slate-200 focus:border-teal-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {confirmPasswordInput && confirmPasswordInput !== newPasswordInput && (
                        <span className="text-[10.5px] text-rose-500 font-bold mt-1 block">
                          Passwords do not match
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={passwordChangeLoading || !newPasswordInput || newPasswordInput !== confirmPasswordInput}
                      className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2"
                    >
                      {passwordChangeLoading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          <span>Save New Password</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: INSTITUTION PROFILE */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'INSTITUTION_PROFILE' && (
            <div className="space-y-6">
              {/* Institution Hero Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl text-white flex items-center justify-center text-3xl font-bold shadow-md shrink-0 border-2 border-teal-200"
                      style={{
                        background: 'linear-gradient(135deg, #117a6b 0%, #0f5f55 100%)',
                        color: '#ffffff',
                      }}
                    >
                      🏫
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-black text-slate-800">
                          {institutionInfo.name || (user as any)?.institutionName || 'Your institution'}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Government Model Secondary School
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300 font-mono">
                          EMIS: {institutionInfo.emisCode || '—'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{institutionInfo.localLevel || '—'}</span> •
                        <span>District: {institutionInfo.district || '—'}</span> •
                        <span>Province: {institutionInfo.province || 'Lumbini Province'}</span>
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400">Affiliation:</span> <strong>National Examination Board (NEB) & CDC Nepal</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Medium:</span> <strong>Dual (English & Nepali Medium Instruction)</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('PROFILE')}
                      className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <UserCheck size={14} /> Principal Profile
                    </button>
                    <button
                      onClick={() => downloadCSVReport('STUDENTS')}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Download size={14} /> Institutional Registry
                    </button>
                  </div>
                </div>
              </div>

              {/* Institution Key Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-400 font-medium">Configured Classes</div>
                  <div className="text-xl font-black text-slate-800 mt-1">{classesList.length} Classes</div>
                  <div className="text-[11px] text-teal-700 font-bold mt-0.5">
                    {classesList.length > 0
                      ? `Grades ${Math.min(...classesList.map((c: any) => Number(c.gradeNumber) || 99))} – ${Math.max(...classesList.map((c: any) => Number(c.gradeNumber) || 0))}`
                      : 'No classes configured'}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-400 font-medium">Active Sections</div>
                  <div className="text-xl font-black text-slate-800 mt-1">
                    {classesList.reduce((n: number, c: any) => n + (c.sections?.length || 0), 0)} Sections
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-0.5">Across all classes</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-400 font-medium">Enrolled Students</div>
                  <div className="text-xl font-black text-slate-800 mt-1 font-mono">{kpis.totalStudents ?? 0}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Currently enrolled</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-400 font-medium">Certified Faculty</div>
                  <div className="text-xl font-black text-slate-800 mt-1 font-mono">{teachersList.length} Members</div>
                  <div className="text-[11px] text-teal-700 font-bold mt-0.5">100% Licensed Teachers</div>
                </div>
              </div>

              {/* Academic Streams & Infrastructure Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Academic Streams Offered */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <BookOpen size={16} className="text-teal-700" />
                    Authorized Academic Programs & Streams
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Primary Level (Grades 1 – 5)</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Integrated Curriculum
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Foundational literacy, numeracy, social science, and creative arts following Nepal CDC 2078 guidelines.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Lower Secondary & SEE (Grades 6 – 10)</span>
                        <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[10px]">
                          SEE Board Track
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Compulsory English, Nepali, Math, Science & Tech, Social Studies & Human Values. Dual English/Nepali sections.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Higher Secondary +2 Science Stream (Grades 11 & 12)</span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                          NEB Affiliated
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Physics, Chemistry, Biology, Mathematics, and Computer Science with hands-on CDC laboratory practicals.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Higher Secondary +2 Management Stream (Grades 11 & 12)</span>
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                          NEB Affiliated
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Accountancy, Economics, Business Studies, Business Mathematics, and Hotel Management tracks.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Campus Infrastructure & Digital Facilities */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Building size={16} className="text-teal-700" />
                    Campus Facilities & Technology Infrastructure
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                        🔬
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">CDC Science Laboratories</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Dedicated, fully equipped physics, chemistry, and biology labs for secondary and +2 science practicals.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold">
                        💻
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">CEHRD ICT Computer Center</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          50 high-speed networked desktop workstations connected to dedicated optical fiber internet for digital literacy.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                        📚
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">Central Digital & Print Library</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Over 8,000 academic titles, reference manuals, plus instant digital access to all Nepal CDC textbooks and past SEE papers.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
                        🛡️
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">Administrative Governance & Security</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          CCTV monitored campus, automated digital attendance logging, and emergency solar backup system.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Administration Contacts */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Phone size={16} className="text-teal-700" />
                  Official Institutional Governance & Contact Directory
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-slate-400 block text-[11px]">Principal / Head of Institution</span>
                    <strong className="text-slate-800 text-sm">{user?.fullName || 'Dr. Shailesh Kumar Verma'}</strong>
                    <div className="text-teal-700 font-mono text-[11px] mt-1">dhambojhi_principal@dhambojhi.edu.np.test</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-slate-400 block text-[11px]">School Administration Desk</span>
                    <strong className="text-slate-800 text-sm">{institutionInfo.name || 'Institution'}</strong>
                    <div className="text-slate-600 text-[11px] mt-1">Tel: {institutionInfo.phone || '—'}{institutionInfo.email ? ` • ${institutionInfo.email}` : ''}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-slate-400 block text-[11px]">Campus Location</span>
                    <strong className="text-slate-800 text-sm">{[institutionInfo.street, institutionInfo.ward ? `Ward ${institutionInfo.ward}` : ''].filter(Boolean).join(', ') || '—'}</strong>
                    <div className="text-slate-600 text-[11px] mt-1">{[institutionInfo.localLevel, institutionInfo.district, institutionInfo.province].filter(Boolean).join(', ') || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: ACADEMIC CALENDAR (2083 BS) */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'ACADEMIC_CALENDAR' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-teal-700" size={22} />
                    Academic Session Calendar 2083 BS (2026/2027)
                  </h2>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setCalendarViewMode('GRID')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: calendarViewMode === 'GRID' ? '1px solid #117a6b' : '1px solid #cfdcd8',
                        background: calendarViewMode === 'GRID' ? '#117a6b' : '#ffffff',
                        color: calendarViewMode === 'GRID' ? '#ffffff' : '#4b605b',
                        boxShadow: calendarViewMode === 'GRID' ? '0 2px 4px rgba(17, 122, 107, 0.2)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      📅 Monthly Bikram Sambat (BS) Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarViewMode('LIST')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: calendarViewMode === 'LIST' ? '1px solid #117a6b' : '1px solid #cfdcd8',
                        background: calendarViewMode === 'LIST' ? '#117a6b' : '#ffffff',
                        color: calendarViewMode === 'LIST' ? '#ffffff' : '#4b605b',
                        boxShadow: calendarViewMode === 'LIST' ? '0 2px 4px rgba(17, 122, 107, 0.2)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      📋 Chronological Event List
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official academic terms, examination schedules, national festival breaks, and administrative milestones.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCalendarModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
                >
                  <Plus size={15} /> Add Academic Event
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 flex-wrap items-center">
                {[
                  { key: 'ALL', label: 'All Calendar Events' },
                  { key: 'EXAMINATION', label: 'Terminal Examinations' },
                  { key: 'HOLIDAY', label: 'Festival Vacations' },
                  { key: 'MILESTONE', label: 'Institutional Milestones' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setCalendarFilterType(f.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      calendarFilterType === f.key
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* 4 Terms Summary Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border-l-4 border-l-emerald-500 border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase">First Term</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">Baishakh – Ashadh</div>
                  <div className="text-[11px] text-slate-500">First Terminal Exam</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border-l-4 border-l-teal-500 border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-teal-800 uppercase">Second Term</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">Shrawan – Kartik</div>
                  <div className="text-[11px] text-slate-500">Dashain Break & Term 2</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border-l-4 border-l-blue-500 border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-blue-800 uppercase">Third Term</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">Mangsir – Magh</div>
                  <div className="text-[11px] text-slate-500">SEE Pre-Board & Winter</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border-l-4 border-l-purple-500 border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-purple-800 uppercase">Final Term</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">Falgun – Chaitra</div>
                  <div className="text-[11px] text-slate-500">Board Exams & Results</div>
                </div>
              </div>

              
              {/* ── BIKRAM SAMBAT (BS) MONTHLY CALENDAR GRID ── */}
              {calendarViewMode === 'GRID' && (() => {
                const nepaliMonths = [
                  { nameNp: 'वैशाख', nameEn: 'Baishakh', days: 31, gregorian: 'Apr – May 2026', term: 'First Term' },
                  { nameNp: 'जेठ', nameEn: 'Jestha', days: 31, gregorian: 'May – Jun 2026', term: 'First Term' },
                  { nameNp: 'असार', nameEn: 'Ashadh', days: 32, gregorian: 'Jun – Jul 2026', term: 'First Term Exam' },
                  { nameNp: 'साउन', nameEn: 'Shrawan', days: 31, gregorian: 'Jul – Aug 2026', term: 'Second Term' },
                  { nameNp: 'भदौ', nameEn: 'Bhadra', days: 31, gregorian: 'Aug – Sep 2026', term: 'Second Term' },
                  { nameNp: 'असोज', nameEn: 'Ashwin', days: 30, gregorian: 'Sep – Oct 2026', term: 'Dashain Festival' },
                  { nameNp: 'कात्तिक', nameEn: 'Kartik', days: 30, gregorian: 'Oct – Nov 2026', term: 'Tihar & Term 2 Exam' },
                  { nameNp: 'मङ्सिर', nameEn: 'Mangsir', days: 29, gregorian: 'Nov – Dec 2026', term: 'Third Term' },
                  { nameNp: 'पुस', nameEn: 'Poush', days: 29, gregorian: 'Dec – Jan 2027', term: 'Winter Vacation' },
                  { nameNp: 'माघ', nameEn: 'Magh', days: 30, gregorian: 'Jan – Feb 2027', term: 'Maghi & Saraswati Puja' },
                  { nameNp: 'फागुन', nameEn: 'Falgun', days: 30, gregorian: 'Feb – Mar 2027', term: 'Pre-Board Exams & Holi' },
                  { nameNp: 'चैत', nameEn: 'Chaitra', days: 30, gregorian: 'Mar – Apr 2027', term: 'Annual Board & SEE' },
                ];

                const currentM = nepaliMonths[selectedBsMonth];

                // Nepal National Public Holidays & Standard Events mapping (BS Month Index -> Day -> Event)
                const monthHolidays: Record<number, Record<number, { title: string; type: 'HOLIDAY' | 'EXAMINATION' | 'MILESTONE' }>> = {
                  0: {
                    1: { title: 'नयाँ वर्ष २०८३ (New Year)', type: 'HOLIDAY' },
                    11: { title: 'लोकतान्त्रिक दिवस (Democracy Day)', type: 'HOLIDAY' },
                    15: { title: 'नयाँ शैक्षिक सत्र प्रारम्भ (Session Begins)', type: 'MILESTONE' },
                  },
                  1: {
                    11: { title: 'बुद्ध जयन्ती / उभौली (Buddha Jayanti)', type: 'HOLIDAY' },
                    15: { title: 'गणतन्त्र दिवस (Republic Day)', type: 'HOLIDAY' },
                  },
                  2: {
                    15: { title: 'राष्ट्रिय धान दिवस (National Paddy Day)', type: 'MILESTONE' },
                    24: { title: 'प्रथम त्रैमासिक परीक्षा (Term 1 Exam Begins)', type: 'EXAMINATION' },
                    31: { title: 'प्रथम त्रैमासिक परीक्षा सम्पन्न (Term 1 Exam Ends)', type: 'EXAMINATION' },
                  },
                  3: {
                    1: { title: 'साउने सङ्क्रान्ति (Shrawan Sankranti)', type: 'HOLIDAY' },
                    28: { title: 'जनै पूर्णिमा / रक्षा बन्धन', type: 'HOLIDAY' },
                  },
                  4: {
                    8: { title: 'श्रीकृष्ण जन्माष्टमी (Janmashtami)', type: 'HOLIDAY' },
                    20: { title: 'निजामती सेवा दिवस', type: 'MILESTONE' },
                  },
                  5: {
                    3: { title: 'राष्ट्रिय संविधान दिवस (Constitution Day)', type: 'HOLIDAY' },
                    20: { title: 'घटस्थापना (Ghatasthapana)', type: 'HOLIDAY' },
                    24: { title: 'विजया दशमी (Bada Dashain)', type: 'HOLIDAY' },
                  },
                  6: {
                    12: { title: 'लक्ष्मी पूजा (Tihar / Deepawali)', type: 'HOLIDAY' },
                    14: { title: 'भाइटीका (Bhai Tika)', type: 'HOLIDAY' },
                    18: { title: 'छठ पर्व (Chhath Puja)', type: 'HOLIDAY' },
                    26: { title: 'दोस्रो त्रैमासिक परीक्षा (Term 2 Exam)', type: 'EXAMINATION' },
                  },
                  7: {
                    25: { title: 'अन्तर्राष्ट्रिय मानव अधिकार दिवस', type: 'MILESTONE' },
                  },
                  8: {
                    15: { title: 'तमु ल्होसार (Tamu Lhosar)', type: 'HOLIDAY' },
                    18: { title: 'हिउँदे बिदा प्रारम्भ (Winter Vacation)', type: 'HOLIDAY' },
                    28: { title: 'हिउँदे बिदा सम्पन्न', type: 'MILESTONE' },
                  },
                  9: {
                    1: { title: 'माघे सङ्क्रान्ति / माघी (Maghi)', type: 'HOLIDAY' },
                    16: { title: 'सहिद दिवस (Martyrs Day)', type: 'HOLIDAY' },
                    24: { title: 'सरस्वती पूजा / श्रीपञ्चमी', type: 'MILESTONE' },
                  },
                  10: {
                    7: { title: 'प्रजातन्त्र दिवस (Democracy Day)', type: 'HOLIDAY' },
                    18: { title: 'महाशिवरात्रि (Maha Shivaratri)', type: 'HOLIDAY' },
                    22: { title: 'फागु पूर्णिमा (Holi Festival)', type: 'HOLIDAY' },
                  },
                  11: {
                    10: { title: 'वार्षिक परीक्षा प्रारम्भ (Annual Board Exams)', type: 'EXAMINATION' },
                    20: { title: 'SEE राष्ट्रिय परीक्षा (SEE Board)', type: 'EXAMINATION' },
                    30: { title: 'वार्षिक नतिजा प्रकाशन (Result Publishing)', type: 'MILESTONE' },
                  },
                };

                const currentMonthEvents = monthHolidays[selectedBsMonth] || {};

                // Map custom calendarEvents to days if matching month
                calendarEvents.forEach((ev) => {
                  const dayNum = parseInt(ev.date?.split('-')[2] || ev.date || '0');
                  if (dayNum > 0 && dayNum <= currentM.days && !currentMonthEvents[dayNum]) {
                    currentMonthEvents[dayNum] = {
                      title: ev.title,
                      type: ev.type as any,
                    };
                  }
                });

                const startDayOffset = (selectedBsMonth * 3 + 2) % 7;
                const totalCells = Math.ceil((currentM.days + startDayOffset) / 7) * 7;

                const toDevanagari = (num: number) => {
                  const devDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
                  return String(num).split('').map(d => devDigits[parseInt(d)] || d).join('');
                };

                return (
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    {/* 12 Nepali Months Selector Pills */}
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px' }}>
                      {nepaliMonths.map((m, idx) => {
                        const isSelected = selectedBsMonth === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => { setSelectedBsMonth(idx); setSelectedCalDayDetail(null); }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: isSelected ? 800 : 600,
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              border: isSelected ? '1px solid #117a6b' : '1px solid #dcebe6',
                              background: isSelected ? '#117a6b' : '#f4faf8',
                              color: isSelected ? '#ffffff' : '#4b605b',
                              transition: 'all 0.15s ease',
                              boxShadow: isSelected ? '0 2px 4px rgba(17, 122, 107, 0.2)' : 'none',
                            }}
                          >
                            <span>{m.nameNp}</span>
                            <span style={{ fontSize: '10px', opacity: 0.8, marginLeft: '4px' }}>({m.nameEn})</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Month Banner */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #042f2e 0%, #0f5f55 100%)', borderRadius: '12px', padding: '14px 18px', color: '#ffffff' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>२०८३ {currentM.nameNp} ({currentM.nameEn} 2083 BS)</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: 'rgba(255,255,255,0.2)' }}>
                            {currentM.days} Days
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                          {currentM.gregorian} • Academic Milestone: <strong>{currentM.term}</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => { setSelectedBsMonth(prev => (prev > 0 ? prev - 1 : 11)); setSelectedCalDayDetail(null); }}
                          style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          ← अघिल्लो महिना
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSelectedBsMonth(prev => (prev < 11 ? prev + 1 : 0)); setSelectedCalDayDetail(null); }}
                          style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          पछिल्लो महिना →
                        </button>
                      </div>
                    </div>

                    {/* 7-Day Calendar Grid */}
                    <div>
                      {/* Day Headers */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '6px' }}>
                        {[
                          { np: 'आइत', en: 'Sun' },
                          { np: 'सोम', en: 'Mon' },
                          { np: 'मङ्गल', en: 'Tue' },
                          { np: 'बुध', en: 'Wed' },
                          { np: 'बिही', en: 'Thu' },
                          { np: 'शुक्र', en: 'Fri' },
                          { np: 'शनि (बिदा)', en: 'Sat', isHoliday: true },
                        ].map((d, dIdx) => (
                          <div
                            key={dIdx}
                            style={{
                              padding: '8px 4px',
                              background: d.isHoliday ? '#fef2f2' : '#f4faf8',
                              border: d.isHoliday ? '1px solid #fecaca' : '1px solid #dcebe6',
                              borderRadius: '8px',
                              color: d.isHoliday ? '#dc2626' : '#134744',
                              fontWeight: 800,
                              fontSize: '11px',
                            }}
                          >
                            <div>{d.np}</div>
                            <div style={{ fontSize: '9px', fontWeight: 600, opacity: 0.7 }}>{d.en}</div>
                          </div>
                        ))}
                      </div>

                      {/* Day Grid Cells */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                        {Array.from({ length: totalCells }).map((_, cIdx) => {
                          const dayNum = cIdx - startDayOffset + 1;
                          const isValidDay = dayNum >= 1 && dayNum <= currentM.days;
                          const isSaturday = cIdx % 7 === 6;
                          const ev = isValidDay ? currentMonthEvents[dayNum] : null;
                          const isSelectedDay = selectedCalDayDetail?.day === dayNum;

                          if (!isValidDay) {
                            return (
                              <div
                                key={cIdx}
                                style={{
                                  minHeight: '75px',
                                  background: '#fafafa',
                                  border: '1px dashed #dcebe6',
                                  borderRadius: '8px',
                                  opacity: 0.4,
                                }}
                              />
                            );
                          }

                          return (
                            <div
                              key={cIdx}
                              onClick={() => {
                                if (ev) {
                                  setSelectedCalDayDetail({ day: dayNum, ...ev, month: currentM });
                                } else {
                                  setSelectedCalDayDetail(null);
                                }
                              }}
                              style={{
                                minHeight: '75px',
                                padding: '6px 8px',
                                borderRadius: '8px',
                                border: isSelectedDay
                                  ? '2px solid #117a6b'
                                  : ev?.type === 'HOLIDAY' || isSaturday
                                  ? '1px solid #fecaca'
                                  : ev?.type === 'EXAMINATION'
                                  ? '1px solid #ede9fe'
                                  : '1px solid #dcebe6',
                                background: isSelectedDay
                                  ? '#effaf6'
                                  : isSaturday
                                  ? '#fff5f5'
                                  : ev?.type === 'HOLIDAY'
                                  ? '#fff1f2'
                                  : ev?.type === 'EXAMINATION'
                                  ? '#f5f3ff'
                                  : '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: 800,
                                    color: isSaturday || ev?.type === 'HOLIDAY' ? '#dc2626' : '#134744',
                                  }}
                                >
                                  {toDevanagari(dayNum)}
                                </span>
                                <span style={{ fontSize: '9px', color: '#8da19d', fontWeight: 600 }}>
                                  {dayNum}
                                </span>
                              </div>

                              {isSaturday && !ev && (
                                <div style={{ fontSize: '9px', fontWeight: 700, color: '#dc2626', background: 'rgba(239, 68, 68, 0.1)', padding: '1px 4px', borderRadius: '4px', textAlign: 'center' }}>
                                  साप्ताहिक बिदा
                                </div>
                              )}

                              {ev && (
                                <div
                                  style={{
                                    fontSize: '9px',
                                    fontWeight: 800,
                                    lineHeight: '1.2',
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    marginTop: '2px',
                                    background: ev.type === 'HOLIDAY'
                                      ? '#fee2e2'
                                      : ev.type === 'EXAMINATION'
                                      ? '#ede9fe'
                                      : '#dcfce7',
                                    color: ev.type === 'HOLIDAY'
                                      ? '#b91c1c'
                                      : ev.type === 'EXAMINATION'
                                      ? '#4c3fa8'
                                      : '#15803d',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={ev.title}
                                >
                                  {ev.title}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected Day Event Drawer */}
                    {selectedCalDayDetail && (
                      <div style={{ background: '#f4faf8', border: '1px solid #cfdcd8', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#117a6b', textTransform: 'uppercase' }}>
                            {selectedCalDayDetail.month.nameNp} {toDevanagari(selectedCalDayDetail.day)} गते • Academic Milestone
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0e3e3b', marginTop: '2px' }}>
                            {selectedCalDayDetail.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#5f736f' }}>
                            Status: <strong style={{ color: selectedCalDayDetail.type === 'HOLIDAY' ? '#dc2626' : '#117a6b' }}>{selectedCalDayDetail.type}</strong> • Recognized on School & CDC Calendar
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCalDayDetail(null)}
                          style={{ padding: '6px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cfdcd8', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          बन्द गर्नुहोस् (Close)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Events Listing */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="divide-y divide-slate-100">
                  {!calendarLoading && calendarEvents.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-500 space-y-3">
                      <div>No events have been added to your academic calendar yet.</div>
                      <button onClick={loadCalendarTemplate} className="px-3 py-1.5 rounded-lg border border-teal-300 bg-teal-50 text-teal-800 font-bold">
                        Start from the standard Nepal academic calendar
                      </button>
                    </div>
                  )}
                  {calendarEvents
                    .filter((ev) => calendarFilterType === 'ALL' || ev.type === calendarFilterType)
                    .map((ev) => (
                      <div key={ev.id} className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                ev.type === 'EXAMINATION'
                                  ? 'bg-rose-100 text-rose-800'
                                  : ev.type === 'HOLIDAY'
                                  ? 'bg-amber-100 text-amber-800'
                                  : ev.type === 'MILESTONE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {ev.type}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {ev.date}
                            </span>
                            <span className="text-[11px] text-teal-700 font-bold">Term {ev.term}</span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-800">{ev.title}</h4>
                          <p className="text-xs text-slate-500">{ev.description}</p>
                        </div>
                        <button
                          onClick={() => deleteCalendarEvent(ev.id)}
                          className="px-2.5 py-1 rounded-lg border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 self-start sm:self-center shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Add Calendar Event Modal */}
              {showAddCalendarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                        <Calendar size={16} className="text-teal-700" /> Add Academic Calendar Event
                      </h3>
                      <button onClick={() => setShowAddCalendarModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newCalTitle.trim() || !newCalDate.trim()) {
                          alert('Please enter event title and date.');
                          return;
                        }
                        try {
                          const created: any = await api.post('/calendar', {
                            title: newCalTitle,
                            date: newCalDate,
                            term: newCalTerm,
                            type: newCalType,
                            description: newCalDesc || 'Official academic schedule item.',
                          });
                          setCalendarEvents((prev) => [created, ...prev]);
                          setShowAddCalendarModal(false);
                          setNewCalTitle('');
                          setNewCalDate('');
                          setNewCalDesc('');
                        } catch (err: any) {
                          alert(err.message || 'Could not save the event');
                        }
                      }}
                      className="space-y-3 text-xs"
                    >
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Second Terminal Model Test"
                          value={newCalTitle}
                          onChange={(e) => setNewCalTitle(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Date (BS/AD) *</label>
                          <input
                            type="text"
                            required
                            placeholder="2083-05-15 (Aug 31)"
                            value={newCalDate}
                            onChange={(e) => setNewCalDate(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Event Category</label>
                          <select
                            value={newCalType}
                            onChange={(e) => setNewCalType(e.target.value as any)}
                            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                          >
                            <option value="EXAMINATION">Terminal Examination</option>
                            <option value="HOLIDAY">Festival / Vacation</option>
                            <option value="MILESTONE">Academic Milestone</option>
                            <option value="MEETING">Administrative Meeting</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Academic Term</label>
                        <select
                          value={newCalTerm}
                          onChange={(e) => setNewCalTerm(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="FIRST">First Term (Baishakh – Ashadh)</option>
                          <option value="SECOND">Second Term (Shrawan – Kartik)</option>
                          <option value="THIRD">Third Term (Mangsir – Magh)</option>
                          <option value="FINAL">Final Term (Falgun – Chaitra)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                        <textarea
                          rows={3}
                          placeholder="Event guidelines, target classes, or instructions..."
                          value={newCalDesc}
                          onChange={(e) => setNewCalDesc(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddCalendarModal(false)}
                          className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-xs"
                        >
                          Save Event
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: ACADEMIC PERFORMANCE (GPA & CDC DISTRIBUTION) */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'ACADEMIC_PERFORMANCE' && (
            <InstitutionAcademicAnalytics
              theme="teal"
              roleTitle="Principal Executive Supervisory Intelligence"
            />
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: CLASSES 1–12 TEXTBOOKS & PDF READER */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'TEXTBOOKS' && (
            <ClassTextbookBrowser
              theme="emerald"
              title="Official Nepal CDC Classes 1–12 Digital Textbooks & PDF Library"
              subtitle="Browse official textbooks by Class (Class 1 to 12) from Nepal data/ folders with real-time English and Nepali medium sorting and integrated PDF reader."
            />
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: CURRICULUM PACING (1–12 CDC SYLLABUS) */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'CURRICULUM_COVERAGE' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="text-teal-700" size={22} />
                  Nepal CDC Curriculum Pacing & Chapter Progression
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chapter progress recorded by subject teachers, grouped by class, subject and teacher.
                </p>
              </div>

              {covLoading && <div className="text-sm text-slate-500">Loading curriculum coverage…</div>}
              {covError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex items-center justify-between">
                  <span>{covError}</span>
                  <button onClick={loadCoverage} className="font-bold underline">Retry</button>
                </div>
              )}

              {covData && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-400 font-medium">Overall Syllabus Covered</div>
                      <div className="text-2xl font-black text-teal-800 font-mono mt-1">
                        {covData.summary.overallPercentage != null ? `${covData.summary.overallPercentage}%` : '—'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{covData.summary.trackedCourses} tracked courses</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-400 font-medium">Courses At 50% or More</div>
                      <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{covData.summary.coursesOnTrack}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-400 font-medium">Courses Below 50%</div>
                      <div className="text-2xl font-black text-amber-600 font-mono mt-1">{covData.summary.coursesBehind}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-400 font-medium">Not Updated in 21 Days</div>
                      <div className="text-2xl font-black text-rose-600 font-mono mt-1">{covData.summary.coursesNotUpdated21d}</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="p-3">Class</th>
                            <th className="p-3">Subject</th>
                            <th className="p-3">Teacher</th>
                            <th className="p-3 text-center">Chapters (done / total)</th>
                            <th className="p-3">Progress</th>
                            <th className="p-3">Last Updated</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {covData.items.length === 0 && (
                            <tr><td className="p-4 text-slate-500" colSpan={6}>No teacher has recorded chapter progress yet.</td></tr>
                          )}
                          {covData.items.map((r: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="p-3 font-bold text-slate-800">Class {r.gradeNumber || '—'}</td>
                              <td className="p-3 text-slate-800">
                                {r.subjectName}
                                {r.subjectCode && <div className="text-[10px] font-mono text-teal-700 font-bold">{r.subjectCode}</div>}
                              </td>
                              <td className="p-3 text-slate-700">{r.teacherName}</td>
                              <td className="p-3 text-center font-mono">{r.completedChapters} / {r.totalChapters}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                      className={`${r.percentage >= 50 ? 'bg-emerald-600' : 'bg-amber-500'} h-full rounded-full`}
                                      style={{ width: `${r.percentage}%` }}
                                    />
                                  </div>
                                  <span className="font-mono font-bold text-[11px] text-slate-800 shrink-0">{r.percentage}%</span>
                                </div>
                              </td>
                              <td className="p-3 text-slate-500">{r.lastUpdated ? new Date(r.lastUpdated).toLocaleDateString() : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: SUBJECT PERFORMANCE */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'SUBJECT_PERFORMANCE' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Award className="text-teal-700" size={22} />
                    Subject-by-Subject Academic Audit & Examination Metrics
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Compare average student scores, passing rates, and active assignments across academic departments.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search subject or code..."
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Department Filter Pills */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'ALL', label: 'All Departments' },
                  { key: 'LANGUAGES', label: 'Languages (Nepali & English)' },
                  { key: 'STEM', label: 'STEM (Math & Science)' },
                  { key: 'SOCIAL', label: 'Social Sciences & Humanities' },
                  { key: 'COMMERCE', label: 'Commerce & Management' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setSubjectDeptFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      subjectDeptFilter === f.key
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Subject Audit Matrix Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Subject & Code</th>
                        <th className="p-3">Grades Offered</th>
                        <th className="p-3">Primary Faculty</th>
                        <th className="p-3 text-center">Avg Score</th>
                        <th className="p-3 text-center">Pass Rate</th>
                        <th className="p-3 text-center">Formative Tasks</th>
                        <th className="p-3 text-center">CDC Rating</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {((analyticsData?.subjectPerformance && analyticsData.subjectPerformance.length > 0)
                        ? analyticsData.subjectPerformance.map((sp: any) => ({
                            code: sp.subjectCode || 'CDC',
                            name: sp.subjectName || 'Subject',
                            dept: (sp.grade >= 11)
                              ? 'COMMERCE'
                              : (sp.subjectName?.toLowerCase().includes('math') || sp.subjectName?.toLowerCase().includes('sci'))
                              ? 'STEM'
                              : (sp.subjectName?.toLowerCase().includes('eng') || sp.subjectName?.toLowerCase().includes('nep'))
                              ? 'LANGUAGES'
                              : 'SOCIAL',
                            grades: sp.grade ? `Grade ${sp.grade}` : 'Grades 1–12',
                            teacher: sp.teacherNames || '—',
                            avg: sp.averageScore ?? '—',
                            pass: sp.passPercentage ?? '—',
                            tasks: sp.totalEvaluated ?? '—',
                            rating: sp.averageScore >= 80 ? 'A+' : sp.averageScore >= 70 ? 'A' : sp.averageScore >= 60 ? 'B+' : 'B',
                          }))
                        : [] as any[]
                      )
                        .filter((s: any) => {
                          const matchesDept = subjectDeptFilter === 'ALL' || s.dept === subjectDeptFilter;
                          const matchesQuery = !subjectSearch.trim() ||
                            s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
                            s.code.toLowerCase().includes(subjectSearch.toLowerCase());
                          return matchesDept && matchesQuery;
                        })
                        .map((s: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="p-3">
                              <span className="font-bold text-slate-800">{s.name}</span>
                              <div className="text-[10px] font-mono text-teal-700 font-bold">{s.code} • {s.dept}</div>
                            </td>
                            <td className="p-3 font-medium text-slate-700">{s.grades}</td>
                            <td className="p-3 text-slate-700">{s.teacher}</td>
                            <td className="p-3 text-center font-mono font-bold text-slate-800">
                              {s.avg}%
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {s.pass}%
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono text-slate-600">
                              {s.tasks} items
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                                Grade {s.rating}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setActiveTab('ASSIGNMENTS_OVERVIEW')}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700"
                              >
                                View Studio →
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: ENROLLED STUDENT REGISTRY */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'STUDENTS' && (() => {
            // Build student records dynamically from database or realistic fallback across grades 1-12
            const baseStudents: any[] = studentsList;

            const filteredStudents = baseStudents.filter((st: any) => {
              if (studentGradeFilter !== 'ALL') {
                if (st.gradeNumber && String(st.gradeNumber) === studentGradeFilter) {
                  // matches direct gradeNumber
                } else {
                  const clsStr = (st.className || '').toLowerCase();
                  if (!clsStr.includes(`class ${studentGradeFilter}`) && !clsStr.includes(`grade ${studentGradeFilter}`)) {
                    return false;
                  }
                }
              }
              if (studentSectionFilter !== 'ALL') {
                const secStr = (st.sectionName || '').toLowerCase();
                if (!secStr.includes(studentSectionFilter.toLowerCase())) {
                  return false;
                }
              }
              if (studentStandingFilter === 'DISTINCTION') {
                if (st.averageGpa == null || st.averageGpa < 3.6) return false;
              } else if (studentStandingFilter === 'AT_RISK') {
                if (!((st.averageGpa != null && st.averageGpa < 2.0) || (st.attendanceRate != null && st.attendanceRate < 75))) return false;
              }
              if (studentSearch.trim()) {
                const q = studentSearch.toLowerCase();
                const name = (st.fullName || st.studentName || '').toLowerCase();
                const email = (st.email || '').toLowerCase();
                const roll = String(st.rollNumber || '');
                return name.includes(q) || email.includes(q) || roll.includes(q);
              }
              return true;
            });

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="text-teal-700" size={22} />
                      Enrolled Student Academic Registry
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Supervise student profiles, class standings, attendance percentages, and guardian records.
                    </p>
                  </div>
                  <button
                    onClick={() => downloadCSVReport('STUDENTS')}
                    className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Download size={14} /> Download Student Registry
                  </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search students by name, roll no, or email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <select
                    value={studentGradeFilter}
                    onChange={(e) => setStudentGradeFilter(e.target.value)}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ALL">All Grades (1–12)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={String(g)}>Class {g}</option>
                    ))}
                  </select>

                  <select
                    value={studentSectionFilter}
                    onChange={(e) => setStudentSectionFilter(e.target.value)}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ALL">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>

                  <select
                    value={studentStandingFilter}
                    onChange={(e) => setStudentStandingFilter(e.target.value)}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ALL">All Standings</option>
                    <option value="DISTINCTION">Distinction (GPA 3.6+)</option>
                    <option value="AT_RISK">At-Risk / Remedial</option>
                  </select>
                </div>

                {/* Student Registry Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">
                      Showing {filteredStudents.length} Students
                    </span>
                    <span className="text-xs text-slate-400">Official EMIS Registry</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-center">Roll</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Class & Section</th>
                          <th className="p-3 text-center">Attendance</th>
                          <th className="p-3 text-center">Average GPA</th>
                          <th className="p-3">Guardian & Contact</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((st: any, idx: number) => (
                          <tr key={st.id || st._id || idx} className="hover:bg-slate-50/60">
                            <td className="p-3 text-center font-mono font-bold text-slate-700">
                              {st.rollNumber || String(idx + 1).padStart(2, '0')}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{st.fullName || st.studentName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{st.email || '—'}</div>
                            </td>
                            <td className="p-3 font-medium text-slate-700">
                              {st.className || 'Class 10'} • {st.sectionName || 'Section A'}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                                  (st.attendanceRate ?? 0) >= 90
                                    ? 'bg-emerald-50 text-emerald-800'
                                    : (st.attendanceRate ?? 0) >= 75
                                    ? 'bg-blue-50 text-blue-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {st.attendanceRate != null ? `${st.attendanceRate}%` : '—'}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-teal-800 text-sm">
                              {st.averageGpa != null ? Number(st.averageGpa).toFixed(2) : '—'}
                            </td>
                            <td className="p-3 text-slate-600">
                              <div>{st.guardianName || 'Guardian'}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{st.guardianPhone || '9848011223'}</div>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setInspectStudent(st)}
                                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] border border-teal-200"
                              >
                                Inspect Dossier →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: STUDENT ATTENDANCE LOGS & TRENDS */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'STUDENT_ATTENDANCE' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CheckSquare className="text-teal-700" size={22} />
                    Institutional Attendance Logs & Presence Trends
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time section roll call compliance, daily presence rate trends, and below-75% exam eligibility alerts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('ANNOUNCEMENTS'); setAnnouncementSubTab('HISTORY'); }}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-300 text-teal-800 text-xs font-bold hover:bg-teal-100 flex items-center gap-1.5 shadow-xs"
                  >
                    <Clock size={14} /> Sent Notices Log
                  </button>
                  <button
                    onClick={() => downloadCSVReport('STUDENTS')}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
                  >
                    <Download size={14} /> Export Attendance Sheet
                  </button>
                </div>
              </div>

              {attLoading && <div className="text-sm text-slate-500">Loading attendance…</div>}
              {attError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex items-center justify-between">
                  <span>{attError}</span>
                  <button onClick={loadAttendanceOverview} className="font-bold underline">Retry</button>
                </div>
              )}

              {attData && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-400 font-medium">Attendance Rate (last 30 days)</div>
                      <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                        {attData.summary.overallRate30d != null ? `${attData.summary.overallRate30d}%` : '—'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Across {attData.summary.sectionsTotal} sections</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-400 font-medium">Present Today</div>
                      <div className="text-2xl font-black text-slate-800 font-mono mt-1">{attData.summary.presentToday} Students</div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                        {attData.summary.rateToday != null ? `${attData.summary.rateToday}% Attendance` : 'No roll call yet'}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-400 font-medium">Absent Today</div>
                      <div className="text-2xl font-black text-rose-600 font-mono mt-1">{attData.summary.absentToday} Students</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Excused & Unexcused</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-400 font-medium">Section Roll Call Compliance</div>
                      <div className="text-2xl font-black text-teal-800 font-mono mt-1">
                        {attData.summary.sectionsDone} / {attData.summary.sectionsTotal} Done
                      </div>
                      <div className="text-[11px] text-teal-700 font-bold mt-0.5">
                        {attData.summary.sectionsTotal > 0 ? Math.round((attData.summary.sectionsDone / attData.summary.sectionsTotal) * 100) : 0}% Roll Call Completed
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-800">Section Roll Call Status (Today)</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="p-3">Class & Section</th>
                            <th className="p-3">Designated Class Teacher</th>
                            <th className="p-3 text-center">Enrolled</th>
                            <th className="p-3 text-center">Present</th>
                            <th className="p-3 text-center">Absent</th>
                            <th className="p-3">Attendance Rate Today</th>
                            <th className="p-3 text-center">Roll Call Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {attData.sections.length === 0 && (
                            <tr><td className="p-4 text-slate-500" colSpan={7}>No sections with enrolled students.</td></tr>
                          )}
                          {attData.sections.map((r: any) => (
                            <tr key={r.sectionId} className="hover:bg-slate-50/60">
                              <td className="p-3 font-bold text-slate-800">{r.label}</td>
                              <td className="p-3 text-slate-700">{r.classTeacher || 'Not assigned'}</td>
                              <td className="p-3 text-center font-mono font-medium">{r.enrolled}</td>
                              <td className="p-3 text-center font-mono font-bold text-emerald-700">{r.rollCallDone ? r.present : '—'}</td>
                              <td className="p-3 text-center font-mono font-bold text-rose-600">{r.rollCallDone ? r.absent : '—'}</td>
                              <td className="p-3">
                                {r.rate != null ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${r.rate}%` }} />
                                    </div>
                                    <span className="font-mono font-bold text-[11px] text-slate-800 shrink-0">{r.rate}%</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">Not taken</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${r.rollCallDone ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                                  {r.rollCallDone ? 'Completed' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-rose-700 flex items-center gap-1.5">
                          <AlertTriangle size={16} /> Chronic Absenteeism Watchlist (Below 75%, last 60 days)
                        </h3>
                        <p className="text-xs text-slate-500">Students at risk of disqualification from board examinations (minimum 5 recorded days).</p>
                      </div>
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        {attData.totalChronic} Student{attData.totalChronic === 1 ? '' : 's'} At-Risk
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="p-3">Student Name</th>
                            <th className="p-3">Class & Section</th>
                            <th className="p-3 text-center">Attendance %</th>
                            <th className="p-3 text-center">Consecutive Absences</th>
                            <th className="p-3">Guardian Phone</th>
                            <th className="p-3 text-right">Intervention Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {attData.chronicAbsentees.length === 0 && (
                            <tr><td className="p-4 text-slate-500" colSpan={6}>No students are below the 75% threshold.</td></tr>
                          )}
                          {attData.chronicAbsentees.map((s: any) => (
                            <tr key={s.studentId} className="hover:bg-slate-50/60">
                              <td className="p-3 font-bold text-slate-800">{s.name}</td>
                              <td className="p-3 font-medium text-slate-700">{s.sectionLabel}</td>
                              <td className="p-3 text-center font-mono font-bold text-rose-600 text-sm">{s.rate}%</td>
                              <td className="p-3 text-center font-mono text-slate-700">{s.consecutiveAbsences} days</td>
                              <td className="p-3 font-mono text-slate-600">{s.guardianPhone || '—'}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => notifyAbsentee(s)}
                                  disabled={attendanceNoticeSent[s.studentId]}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                                    attendanceNoticeSent[s.studentId]
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                                  }`}
                                >
                                  {attendanceNoticeSent[s.studentId] ? 'Notice Sent ✓' : 'Send Notice to Student'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: FACULTY EVALUATION TRACKER */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'EVALUATION_PROGRESS' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="text-teal-700" size={22} />
                    Faculty Evaluation Progress & Marksheet Audit
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Marksheet entry and assignment grading progress for each teacher.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('ANNOUNCEMENTS'); setAnnouncementSubTab('HISTORY'); }}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-300 text-teal-800 text-xs font-bold hover:bg-teal-100 flex items-center gap-1.5 shadow-xs"
                  >
                    <Clock size={14} /> Sent Notices Log
                  </button>
                  <button
                    onClick={sendGradingNotice}
                    disabled={!evalData || evalData.summary.teachersPending === 0}
                    className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Megaphone size={15} /> Remind All Pending Teachers
                  </button>
                </div>
              </div>

              {evalNoticeMsg && (
                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-900 flex items-center justify-between">
                  <span>{evalNoticeMsg}</span>
                  <button onClick={() => setEvalNoticeMsg(null)} className="text-teal-600 hover:text-teal-800">
                    <X size={15} />
                  </button>
                </div>
              )}

              {evalLoading && <div className="text-sm text-slate-500">Loading evaluation progress…</div>}
              {evalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex items-center justify-between">
                  <span>{evalError}</span>
                  <button onClick={loadEvaluation} className="font-bold underline">Retry</button>
                </div>
              )}

              {evalData && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-400 font-medium">Marksheets Submitted</div>
                      <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                        {evalData.summary.marksheetEntryRate != null ? `${evalData.summary.marksheetEntryRate}%` : '—'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {evalData.summary.submittedAssessments} of {evalData.summary.totalAssessments} assessments
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-400 font-medium">Pending Assignment Grading</div>
                      <div className="text-2xl font-black text-amber-600 font-mono mt-1">{evalData.summary.pendingAssignmentGrading} Submissions</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Awaiting teacher marks</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs text-slate-400 font-medium">Teachers With Pending Work</div>
                      <div className="text-2xl font-black text-rose-600 font-mono mt-1">{evalData.summary.teachersPending}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">of {evalData.summary.teachersTotal} active teachers</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="p-3">Teacher</th>
                            <th className="p-3 text-center">Assessments</th>
                            <th className="p-3 text-center">Submitted</th>
                            <th className="p-3 text-center">Still Draft</th>
                            <th className="p-3 text-center">Ungraded Submissions</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {evalData.teachers.length === 0 && (
                            <tr><td className="p-4 text-slate-500" colSpan={7}>No active teachers found.</td></tr>
                          )}
                          {evalData.teachers.map((t: any) => (
                            <tr key={t.teacherId} className="hover:bg-slate-50/60">
                              <td className="p-3 font-bold text-slate-800">{t.fullName}</td>
                              <td className="p-3 text-center font-mono">{t.assessments}</td>
                              <td className="p-3 text-center font-mono text-emerald-700 font-bold">{t.submitted}</td>
                              <td className="p-3 text-center font-mono text-amber-700 font-bold">{t.draft}</td>
                              <td className="p-3 text-center font-mono">{t.pendingGrading}</td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${t.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                                  {t.status === 'PENDING' ? 'Pending' : 'Up to date'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {t.status === 'PENDING' && (
                                  <button
                                    onClick={() => remindTeacher(t)}
                                    disabled={evalReminded[t.teacherId]}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100 disabled:opacity-60"
                                  >
                                    {evalReminded[t.teacherId] ? 'Reminder Sent ✓' : 'Send Reminder'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── INSPECTION MODALS ────────────────────────────────────────── */}
      {/* 1. Assignment Inspector Modal */}
      {inspectAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-6 py-4 bg-white text-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                  Assignment Studio Inspector
                </span>
                <h3 className="font-bold text-base mt-1">{inspectAssignment.title}</h3>
              </div>
              <button onClick={() => setInspectAssignment(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400">Subject:</span>{' '}
                  <strong>{inspectAssignment.centralSubjectId?.name || 'General'}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Teacher:</span>{' '}
                  <strong>{inspectAssignment.teacherId?.fullName || inspectAssignment.teacherId?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Due Date:</span>{' '}
                  <strong>{new Date(inspectAssignment.dueDate).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Total Marks:</span>{' '}
                  <strong>{inspectAssignment.maxScore || 100}</strong>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Description & Instructions:</h4>
                <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200 font-mono">
                  {inspectAssignment.detailedInstructions || inspectAssignment.description || 'Standard coursework'}
                </p>
              </div>

              {inspectAssignment.questions?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">
                    Structured Questions ({inspectAssignment.questions.length}):
                  </h4>
                  <div className="space-y-2">
                    {inspectAssignment.questions.map((q: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="font-bold">Q{i + 1}:</span> {q.questionText} ({q.marks || 1} mark)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inspectAssignment.rubric?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Evaluation Rubric:</h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="p-2">Criterion</th>
                          <th className="p-2 text-right">Max Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inspectAssignment.rubric.map((r: any, i: number) => (
                          <tr key={i}>
                            <td className="p-2 font-medium">{r.criterionName}</td>
                            <td className="p-2 text-right font-mono font-bold">{r.maxScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setInspectAssignment(null)}
                className="px-4 py-2 text-xs font-bold bg-emerald-700 text-white rounded-lg"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quiz Inspector Modal */}
      {inspectQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-6 py-4 bg-white text-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  Quiz Studio Inspector
                </span>
                <h3 className="font-bold text-base mt-1">{inspectQuiz.title}</h3>
              </div>
              <button onClick={() => setInspectQuiz(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400">Subject:</span>{' '}
                  <strong>{inspectQuiz.centralSubjectId?.name || 'General'}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Duration:</span>{' '}
                  <strong>{inspectQuiz.durationMinutes} Minutes</strong>
                </div>
                <div>
                  <span className="text-slate-400">Total Marks:</span>{' '}
                  <strong>{inspectQuiz.totalMarks} Marks</strong>
                </div>
                <div>
                  <span className="text-slate-400">Passing Threshold:</span>{' '}
                  <strong>{inspectQuiz.passingMarks} Marks</strong>
                </div>
              </div>

              {/* Proctoring Settings Inspection */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1.5">
                <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Proctoring & Security Configuration:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-purple-800">
                  <div>
                    Fullscreen Enforced:{' '}
                    <strong>{inspectQuiz.securitySettings?.fullscreenEnforced ? 'Enabled' : 'Disabled'}</strong>
                  </div>
                  <div>
                    Tab-Switch Detection:{' '}
                    <strong>{inspectQuiz.securitySettings?.tabSwitchDetection ? 'Enabled' : 'Disabled'}</strong>
                  </div>
                  <div>
                    Prevent Clipboard:{' '}
                    <strong>{inspectQuiz.securitySettings?.preventClipboard ? 'Active' : 'Off'}</strong>
                  </div>
                  <div>
                    Max Warnings Allowed:{' '}
                    <strong>{inspectQuiz.securitySettings?.maxWarnings || 3}</strong>
                  </div>
                </div>
              </div>

              {inspectQuiz.questions?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">
                    Questions Overview ({inspectQuiz.questions.length}):
                  </h4>
                  <div className="space-y-2">
                    {inspectQuiz.questions.map((q: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">Question {i + 1}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200">
                            {q.questionType} • {q.marks || 1} mark(s)
                          </span>
                        </div>
                        <p className="text-slate-700">{q.questionText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setInspectQuiz(null)}
                className="px-4 py-2 text-xs font-bold bg-emerald-700 text-white rounded-lg"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Student Profile & Dossier Inspector Modal */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-teal-900 font-bold flex items-center justify-center text-sm shadow">
                  {(inspectStudent.fullName || inspectStudent.studentName || 'ST').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/30 text-teal-200 font-bold">
                    Official Student Academic Dossier
                  </span>
                  <h3 className="font-bold text-base mt-0.5">{inspectStudent.fullName || inspectStudent.studentName}</h3>
                </div>
              </div>
              <button onClick={() => setInspectStudent(null)} className="text-teal-200 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Roll Number:</span>
                  <strong className="font-mono text-sm text-slate-800">{inspectStudent.rollNumber || '01'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Class & Section:</span>
                  <strong className="text-slate-800">{inspectStudent.className || 'Class 10'} • {inspectStudent.sectionName || 'Section A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Attendance Rate:</span>
                  <strong className="text-emerald-700 font-mono text-sm">{inspectStudent.attendanceRate != null ? `${inspectStudent.attendanceRate}%` : '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cumulative GPA:</span>
                  <strong className="text-teal-800 font-mono text-sm">{inspectStudent.averageGpa != null ? Number(inspectStudent.averageGpa).toFixed(2) : '—'}</strong>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">Guardian & Family Information</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Guardian Name: <strong>{inspectStudent.guardianName || '—'}</strong></div>
                  <div>Primary Contact: <strong className="font-mono">{inspectStudent.guardianPhone || '—'}</strong></div>
                  <div>Student Email: <strong className="font-mono text-teal-800">{inspectStudent.email || '—'}</strong></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">Terminal Examination Performance Overview</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="p-2">Subject</th>
                        <th className="p-2 text-center">Theory (75)</th>
                        <th className="p-2 text-center">Practical (25)</th>
                        <th className="p-2 text-center">Total (100)</th>
                        <th className="p-2 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 font-medium">Compulsory English</td>
                        <td className="p-2 text-center font-mono">62</td>
                        <td className="p-2 text-center font-mono">23</td>
                        <td className="p-2 text-center font-mono font-bold">85</td>
                        <td className="p-2 text-center font-bold text-emerald-700">A</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Compulsory Nepali</td>
                        <td className="p-2 text-center font-mono">58</td>
                        <td className="p-2 text-center font-mono">22</td>
                        <td className="p-2 text-center font-mono font-bold">80</td>
                        <td className="p-2 text-center font-bold text-emerald-700">A</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Compulsory Mathematics</td>
                        <td className="p-2 text-center font-mono">68</td>
                        <td className="p-2 text-center font-mono">24</td>
                        <td className="p-2 text-center font-mono font-bold">92</td>
                        <td className="p-2 text-center font-bold text-emerald-700">A+</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Science & Technology</td>
                        <td className="p-2 text-center font-mono">60</td>
                        <td className="p-2 text-center font-mono">24</td>
                        <td className="p-2 text-center font-mono font-bold">84</td>
                        <td className="p-2 text-center font-bold text-emerald-700">A</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Social Studies & Human Values</td>
                        <td className="p-2 text-center font-mono">64</td>
                        <td className="p-2 text-center font-mono">24</td>
                        <td className="p-2 text-center font-mono font-bold">88</td>
                        <td className="p-2 text-center font-bold text-emerald-700">A</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Dhambojhi Higher Secondary School • Supervisory Seal</span>
              <button
                onClick={() => setInspectStudent(null)}
                className="px-4 py-2 text-xs font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-600"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Teacher Dossier Inspector Modal */}
      {inspectTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-teal-900 font-bold flex items-center justify-center text-sm shadow">
                  {(inspectTeacher.fullName || inspectTeacher.name || 'TC').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/30 text-teal-200 font-bold">
                    Faculty Executive Profile
                  </span>
                  <h3 className="font-bold text-base mt-0.5">{inspectTeacher.fullName || inspectTeacher.name}</h3>
                </div>
              </div>
              <button onClick={() => setInspectTeacher(null)} className="text-teal-200 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Staff ID:</span>
                  <strong className="font-mono text-slate-800">{inspectTeacher.staffId || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Official Email:</span>
                  <strong className="font-mono text-teal-800">{inspectTeacher.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Weekly Teaching Load:</span>
                  <strong className="text-slate-800 font-mono text-sm">{inspectTeacher.assignedPeriods ?? '—'} Periods</strong>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">Assigned Courses & Classes</h4>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 text-xs leading-relaxed">
                  {inspectTeacher.fullName?.includes('Bishnu') ? (
                    <div>
                      • Compulsory Nepali (Class 1-A & Class 12-B)<br/>
                      • Compulsory English (Class 3-B)<br/>
                      • Social Studies & Human Values (Class 6-A)<br/>
                      • Science & Technology (Class 8-B)<br/>
                      • Physics (Class 11-A Science)<br/>
                      • <strong>Designated Class Teacher:</strong> Class 10 – Section A
                    </div>
                  ) : (
                    <div>
                      • Compulsory English (Class 2-B)<br/>
                      • Social Studies & Values (Class 5-A)<br/>
                      • Science & Technology (Class 7-B)<br/>
                      • Compulsory Mathematics (Class 10-A)<br/>
                      • Compulsory Nepali (Class 11-B Management)<br/>
                      • <strong>Regular Faculty Member</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setInspectTeacher(null)}
                className="px-4 py-2 text-xs font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-600"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── OFFICIAL PRINTABLE REPORT DOSSIER MODAL & PRINT CONTAINER ── */}
      {printableReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            className="printable-official-dossier bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto"
            style={{ width: '900px', maxWidth: '95vw', background: '#ffffff', borderRadius: '16px' }}
          >
            {/* Modal Top Actions Header (hidden on print) */}
            <div
              className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#0e3e3b', color: '#ffffff' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>🇳🇵</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800 }}>
                    Official Nepal Government Format Inspection Dossier
                  </div>
                  <div style={{ fontSize: '11px', color: '#8da19d' }}>
                    Print-ready layout formatted for MoEST, CDC & Examination Committee
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#117a6b',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(17, 122, 107, 0.3)',
                  }}
                >
                  <Printer size={15} /> Print / Save as PDF (Ctrl+P)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintableReport(null)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Pristine Document Area */}
            <div style={{ padding: '28px 36px', overflowY: 'auto', background: '#ffffff', color: '#0e3e3b' }}>
              {/* Official Emblems & Letterhead */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f5f55', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '28px' }}>🇳🇵</div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f5f55', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Government of Nepal • Ministry of Education, Science and Technology
                    </div>
                    <div style={{ fontSize: '11px', color: '#4b605b', fontWeight: 600 }}>
                      Curriculum Development Centre (CDC) & National Examination Board (NEB)
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0b3f3d', margin: '4px 0' }}>
                  धम्बोज्झी माध्यमिक विद्यालय • DHAMBOJHI SECONDARY SCHOOL
                </div>
                <div style={{ fontSize: '12px', color: '#2f4f4c', fontWeight: 600 }}>
                  EMIS Code: <strong>570010001</strong> • Nepalgunj, Banke, Lumbini Province • Estd: 2028 BS
                </div>
                <div style={{ display: 'inline-block', marginTop: '10px', padding: '4px 16px', borderRadius: '4px', background: '#effaf6', border: '1px solid #bfeede', color: '#0f5f55', fontSize: '12px', fontWeight: 800 }}>
                  {printableReport.title}
                </div>
                <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '4px' }}>
                  {printableReport.subtitle} • Date of Audit: {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Summary Metrics Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {printableReport.summaryStats.map((stat, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#f4faf8',
                      border: '1px solid #dcebe6',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#5f736f', textTransform: 'uppercase' }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: stat.color || '#0e3e3b', marginTop: '2px' }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Table */}
              <div style={{ border: '1px solid #cfdcd8', borderRadius: '8px', overflow: 'hidden', marginBottom: '28px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#ebf5f1', borderBottom: '1px solid #cfdcd8', color: '#0e3e3b', fontWeight: 800, textAlign: 'left' }}>
                      {printableReport.headers.map((h, hIdx) => (
                        <th key={hIdx} style={{ padding: '8px 10px', borderRight: '1px solid #cfdcd8' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {printableReport.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        style={{
                          borderBottom: '1px solid #dcebe6',
                          background: rIdx % 2 === 0 ? '#ffffff' : '#fcfcfc',
                        }}
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            style={{
                              padding: '7px 10px',
                              borderRight: '1px solid #dcebe6',
                              color: '#134744',
                              fontWeight: cIdx === 1 ? 700 : 500,
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Three Official Signature Blocks & School Seal */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #cfdcd8', textAlign: 'center' }}>
                <div>
                  <div style={{ height: '40px', borderBottom: '1px dashed #8da19d', marginBottom: '6px' }} />
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0e3e3b' }}>Prepared By</div>
                  <div style={{ fontSize: '10px', color: '#5f736f' }}>Academic Coordinator / Exam Committee</div>
                </div>

                <div style={{ position: 'relative' }}>
                  {/* Digital Circular Red Stamp */}
                  <div
                    style={{
                      width: '65px',
                      height: '65px',
                      borderRadius: '50%',
                      border: '2px solid #dc2626',
                      color: '#dc2626',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      fontWeight: 900,
                      margin: '0 auto',
                      transform: 'rotate(-12deg)',
                      opacity: 0.85,
                      marginBottom: '6px',
                    }}
                  >
                    <span>धम्बोज्झी मा.वि.</span>
                    <span style={{ fontSize: '7px' }}>SEAL · 2083</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0e3e3b' }}>Institutional Seal</div>
                  <div style={{ fontSize: '10px', color: '#5f736f' }}>Dhambojhi Secondary School</div>
                </div>

                <div>
                  <div style={{ height: '40px', borderBottom: '1px dashed #8da19d', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'cursive', fontSize: '15px', color: '#0f5f55', fontWeight: 800 }}>
                      Dr. S. K. Verma
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0e3e3b' }}>Approved & Certified By</div>
                  <div style={{ fontSize: '10px', color: '#5f736f' }}>Dr. Shailesh Kumar Verma (Principal)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
