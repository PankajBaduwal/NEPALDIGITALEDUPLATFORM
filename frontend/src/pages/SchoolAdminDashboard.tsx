import { SchoolLogoBadge } from '../components/common/SchoolLogoBadge';
import { ExamOperationsPanel } from '../components/school-admin/ExamOperationsPanel';
import { AcademicCurriculumPanel } from '../components/academic/AcademicCurriculumPanel';
import { TimetableManagementPanel } from '../components/academic/TimetableManagementPanel';
import { BulkTeacherImportModal } from '../components/school-admin/BulkTeacherImportModal';
import { BulkStudentImportModal } from '../components/school-admin/BulkStudentImportModal';
import { BulkSubjectAllocationModal } from '../components/school-admin/BulkSubjectAllocationModal';
import { PdfReaderModal } from '../components/PdfReaderModal';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  School,
  Users,
  GraduationCap,
  Layers,
  Calendar,
  Clock,
  BookOpen,
  Presentation,
  LogOut,
  Plus,
  CheckCircle,
  Megaphone,
  Bell,
  Award,
  ShieldAlert,
  FileText,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  Download,
  BookOpenCheck,
  CreditCard,
  ShieldCheck,
  DollarSign,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Smartphone,
  History,
  Check,
  X,
  Filter,
  RefreshCw,
  Lock,
  Unlock,
  HelpCircle,
  CheckSquare,
  Square,
  Info,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Activity,
  ArrowUpRight,
  Flame,
  MapPin,
  Building,
  Eye,
  EyeOff,
  Key,
  User,
  UserCheck,
  Search
} from 'lucide-react';
import { DemoBanner } from '../components/common/DemoBanner';
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
  Cell
} from 'recharts';

export const SchoolAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    | 'OVERVIEW'
    | 'CLASSES'
    | 'TEACHERS'
    | 'STUDENTS'
    | 'ALLOCATION'
    | 'TIMETABLE'
    | 'ASSIGNMENTS_ADMIN'
    | 'QUIZ_ADMIN'
    | 'EXAMINATIONS'
    | 'RESOURCES'
    | 'ANALYTICS'
    | 'SUBSCRIPTION'
    | 'FEATURE_ACCESS'
    | 'ANNOUNCEMENTS'
    | 'INSTITUTION_SETUP'
    | 'PROFILE'
  >('OVERVIEW');
  const [schoolAnnouncements, setSchoolAnnouncements] = useState<any[]>([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annAudience, setAnnAudience] = useState<'ALL' | 'STUDENTS' | 'TEACHERS'>('ALL');
  const [isAnnPosting, setIsAnnPosting] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [setupProfile, setSetupProfile] = useState<any>(null);
  const [setupForm, setSetupForm] = useState<Record<string, any>>({});
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupSaving, setSetupSaving] = useState(false);
  const [setupSaved, setSetupSaved] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const applySetupProfile = (inst: any) => {
    setSetupProfile(inst);
    setSetupForm({
      name: inst.name || '',
      nameNepali: inst.nameNepali || '',
      shortName: inst.shortName || '',
      email: inst.email || '',
      phone: inst.phone || '',
      website: inst.website || '',
      street: inst.street || '',
      postalCode: inst.postalCode || '',
      ward: inst.ward ?? '',
    });
  };

  const loadInstitutionSetup = async () => {
    setSetupLoading(true);
    setSetupError(null);
    try {
      const res: any = await api.get('/school-admin/profile');
      applySetupProfile(res?.institution || res);
    } catch (err: any) {
      setSetupError(err.message || 'Could not load institution profile');
    } finally {
      setSetupLoading(false);
    }
  };

  const saveInstitutionSetup = async () => {
    setSetupSaving(true);
    setSetupError(null);
    setSetupSaved(false);
    try {
      const res: any = await api.put('/school-admin/profile', setupForm);
      applySetupProfile(res?.institution || res);
      setSetupSaved(true);
      setTimeout(() => setSetupSaved(false), 4000);
    } catch (err: any) {
      setSetupError(err.message || 'Could not save institution profile');
    } finally {
      setSetupSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'INSTITUTION_SETUP') loadInstitutionSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  const [syllabusRows, setSyllabusRows] = useState<any[]>([]);
  const [showAllPeriods, setShowAllPeriods] = useState(false);
  const [todayPeriods, setTodayPeriods] = useState<any[]>([]);
  const studentUsage: number = dashboardData?.counts?.students ?? dashboardData?.totalStudents ?? 0;
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [examinations, setExaminations] = useState<any[]>([]);
  const [isBulkTeacherModalOpen, setIsBulkTeacherModalOpen] = useState(false);
  const [isBulkStudentModalOpen, setIsBulkStudentModalOpen] = useState(false);
  const [isBulkAllocModalOpen, setIsBulkAllocModalOpen] = useState(false);

  // Assessment & Learning Resources State
  const [assignmentsData, setAssignmentsData] = useState<{ assignments: any[]; stats: any }>({
    assignments: [],
    stats: {},
  });
  const [quizzesData, setQuizzesData] = useState<{ quizzes: any[]; stats: any }>({
    quizzes: [],
    stats: {},
  });
  const [inspectAssignment, setInspectAssignment] = useState<any>(null);
  const [inspectQuiz, setInspectQuiz] = useState<any>(null);
  const [textbooksList, setTextbooksList] = useState<any[]>([]);
  const [selectedReaderTextbook, setSelectedReaderTextbook] = useState<any>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [resourceGradeFilter, setResourceGradeFilter] = useState('ALL');
  const [resourceMediumFilter, setResourceMediumFilter] = useState('ALL');

  // School-Wise & Class-Wise Feature Configuration State (Section 2)
  const [featureSubTab, setFeatureSubTab] = useState<
    'OVERVIEW' | 'MATRIX' | 'STUDENT_DASHBOARD' | 'ASSIGNMENTS' | 'QUIZZES' | 'SUBMISSION' |
    'SMARTBOARD' | 'SIMULATIONS' | 'AI_ASSISTANT' | 'TEXTBOOKS' | 'CLASS_SETTINGS' |
    'SECTION_SETTINGS' | 'DEVICE_ACCESS' | 'HISTORY'
  >('MATRIX');
  const [featureMatrix, setFeatureMatrix] = useState<any>(null);
  const [institutionFeatures, setInstitutionFeatures] = useState<any[]>([]);
  const [featureHistory, setFeatureHistory] = useState<any[]>([]);
  const [deviceProfiles, setDeviceProfiles] = useState<any[]>([]);
  const [selectedClassForFeatures, setSelectedClassForFeatures] = useState<string>('');
  const [selectedSectionForFeatures, setSelectedSectionForFeatures] = useState<string>('');
  const [classFeatureList, setClassFeatureList] = useState<any[]>([]);
  const [sectionFeatureList, setSectionFeatureList] = useState<any[]>([]);
  const [featureFilterCategory, setFeatureFilterCategory] = useState<string>('ALL');
  const [featureSearchQuery, setFeatureSearchQuery] = useState<string>('');
  const [featureLoading, setFeatureLoading] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFeatureKey, setBulkFeatureKey] = useState<string>('STUDENT_DASHBOARD');
  const [bulkFeatureEnabled, setBulkFeatureEnabled] = useState<boolean>(true);
  const [bulkSelectedClassIds, setBulkSelectedClassIds] = useState<string[]>([]);

  // Phase 12: Subscription & Billing State
  const [entitlements, setEntitlements] = useState<any>(null);
  const [schoolInvoices, setSchoolInvoices] = useState<any[]>([]);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState<any>(null);
  const [selectedGateway, setSelectedGateway] = useState<'KHALTI' | 'ESEWA' | 'BANK_TRANSFER'>('KHALTI');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [examDashboard, setExamDashboard] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  
  // Phase 11: Real-time Analytics State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const gradeDistribution = Array.isArray(analyticsData?.gradeDistribution)
    ? analyticsData.gradeDistribution
    : [];
  const [exportSectionId, setExportSectionId] = useState('');
  const [exportExamId, setExportExamId] = useState('');
  const [newExam, setNewExam] = useState({
    name: '',
    code: '',
    examType: 'TERMINAL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    weightagePercentage: 100,
  });
  const [loading, setLoading] = useState(true);

  // Phase 10: Timetable State
  const [timetablePeriods, setTimetablePeriods] = useState<any[]>([]);
  const [timetableOverview, setTimetableOverview] = useState<any>(null);
  const [selectedTimetableSection, setSelectedTimetableSection] = useState<string>('');
  const [sectionScheduleEntries, setSectionScheduleEntries] = useState<any[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // New Teacher Modal
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    fullName: '',
    fullNameNepali: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  });

  // Student State & Realtime Sync
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New Student Modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    fullNameNepali: '',
    username: '',
    sectionId: '',
    academicYearId: '',
    rollNumber: 1,
    admissionNumber: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelation: 'Father',
    password: '',
  });

  // Teacher Search State
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');

  // Class & Section Creation Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    gradeNumber: 1,
    name: '',
    board: 'Nepal CDC',
    stream: 'GENERAL',
  });

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [newSection, setNewSection] = useState({
    classId: '',
    name: 'A',
    medium: 'BILINGUAL',
    capacity: 45,
    roomNumber: '',
  });

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/school-admin/classes', {
        gradeNumber: Number(newClass.gradeNumber),
        name: newClass.name || `Class ${newClass.gradeNumber}`,
        board: newClass.board || 'Nepal CDC',
        stream: newClass.stream || 'GENERAL',
      });
      alert('Class configured successfully!');
      setIsClassModalOpen(false);
      setNewClass({ gradeNumber: 1, name: '', board: 'Nepal CDC', stream: 'GENERAL' });
      loadSchoolData();
    } catch (err: any) {
      alert(err.message || 'Error configuring class');
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const academicYearId = dashboardData?.institution?.currentAcademicYearId || classes[0]?.sections?.[0]?.academicYearId;
      if (!newSection.classId) {
        alert('Please select a target class.');
        return;
      }
      await api.post('/school-admin/sections', {
        ...newSection,
        academicYearId,
      });
      alert('Section created successfully!');
      setIsSectionModalOpen(false);
      setNewSection({ classId: '', name: 'A', medium: 'BILINGUAL', capacity: 45, roomNumber: '' });
      loadSchoolData();
    } catch (err: any) {
      alert(err.message || 'Error creating section');
    }
  };

  const handleToggleTeacherStatus = async (teacherId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/school-admin/teachers/${teacherId}/status`, { status: nextStatus });
      setTeachers((prev) =>
        prev.map((t) => ((t.id || t._id) === teacherId ? { ...t, status: nextStatus } : t))
      );
    } catch (err: any) {
      alert(err.message || 'Error updating teacher status');
    }
  };

  useEffect(() => {
    loadSchoolData();
    loadSchoolAnnouncements();
  }, []);

  const loadSchoolAnnouncements = async () => {
    try {
      const res = await api.get<any>('/school-admin/announcements');
      setSchoolAnnouncements(res.data || res || []);
    } catch (e) {
      console.error('Failed to load announcements', e);
    }
  };

  const handlePostSchoolAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      alert('Please enter both announcement title and message content.');
      return;
    }
    setIsAnnPosting(true);
    try {
      await api.post('/school-admin/announcements', {
        title: annTitle,
        content: annContent,
        targetAudience: annAudience,
      });
      alert('Announcement broadcast successfully to all students and staff!');
      setAnnTitle('');
      setAnnContent('');
      loadSchoolAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement');
    } finally {
      setIsAnnPosting(false);
    }
  };

  const loadSchoolData = async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [
        dash,
        teachersList,
        classesList,
        subjectsRes,
        studentsRes,
        pAnalytics,
        examsRes,
        asgnRes,
        quizRes,
        tbRes,
      ] = await Promise.all([
        api.get('/school/dashboard').catch(() => api.get('/school-admin/dashboard')).catch(() => api.get('/school-admin/overview')),
        api.get('/school/teachers').catch(() => api.get('/school-admin/teachers')),
        api.get('/school/classes').catch(() => api.get('/school-admin/classes')).catch(() => api.get('/school-admin/structure')),
        api.get('/curriculum/subjects').catch(() => ({ data: [] })),
        api.get('/school-admin/students').catch(() => api.get('/school/students')).catch(() => ({ data: [] })),
        api.get('/analytics/principal').catch(() => null),
        api.get('/assessment/examinations').catch(() => null),
        api.get('/assignments/institution').catch(() => null),
        api.get('/quizzes/institution').catch(() => null),
        api.get('/curriculum/textbooks?limit=300').catch(() => null),
      ]);
      const resolvedDash = dash?.dashboard || dash?.data?.dashboard || dash?.data || dash;
      setDashboardData(resolvedDash);
      const rawTeachers = teachersList?.data?.teachers || teachersList?.teachers || teachersList?.data || teachersList;
      setTeachers(Array.isArray(rawTeachers) ? rawTeachers : []);
      const rawClasses = classesList?.data?.classes || classesList?.classes || classesList?.data || classesList;
      setClasses(Array.isArray(rawClasses) ? rawClasses : []);
      const rawSubjects = Array.isArray(subjectsRes) ? subjectsRes : subjectsRes?.data || [];
      setSubjects(Array.isArray(rawSubjects) ? rawSubjects : []);
      const rawStudents = studentsRes?.data?.students || studentsRes?.students || studentsRes?.data || studentsRes;
      setStudents(Array.isArray(rawStudents) ? rawStudents : []);
      if (pAnalytics) {
        setAnalyticsData(pAnalytics?.data || pAnalytics);
      }
      // Overview panels: real syllabus coverage and today's published timetable
      api.get<any>('/analytics/principal/curriculum-coverage').then((r) => setSyllabusRows(r?.items || [])).catch(() => setSyllabusRows([]));
      api.get<any>('/timetable/today').then((r) => setTodayPeriods(Array.isArray(r) ? r : [])).catch(() => setTodayPeriods([]));
      if (examsRes) {
        const rawExams = Array.isArray(examsRes) ? examsRes : examsRes?.data || [];
        setExaminations(Array.isArray(rawExams) ? rawExams : []);
      }
      if (asgnRes) setAssignmentsData(asgnRes?.data || asgnRes);
      if (quizRes) setQuizzesData(quizRes?.data || quizRes);
      if (tbRes) {
        const rawTextbooks = tbRes?.data || tbRes;
        setTextbooksList(Array.isArray(rawTextbooks) ? rawTextbooks : rawTextbooks?.textbooks || []);
      }
      setLastSyncTime(new Date());
    } catch (err: any) {
      console.error('Failed to load school dashboard:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created: any = await api.post('/school-admin/teachers', newTeacher);
      alert(`Teacher account registered.\n\nUsername: ${created?.teacher?.username || newTeacher.username}\nOne-time password: ${created?.tempPassword || '(the one you entered)'}\n\nSave it now — it will not be shown again.`);
      setIsTeacherModalOpen(false);
      setNewTeacher({
        fullName: '',
        fullNameNepali: '',
        username: '',
        email: '',
        phone: '',
        password: '',
      });
      loadSchoolData();
    } catch (err: any) {
      alert(err.message || 'Error adding teacher');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const academicYearId = dashboardData?.institution?.currentAcademicYearId || classes[0]?.sections?.[0]?.academicYearId;
      if (!newStudent.sectionId) {
        alert('Please select a target class section.');
        return;
      }
      const created: any = await api.post('/school-admin/students', {
        ...newStudent,
        academicYearId: newStudent.academicYearId || academicYearId,
      });
      alert(`Student enrolled.\n\nUsername: ${newStudent.username}\nOne-time password: ${created?.tempPassword || '(the one you entered)'}\n\nSave it now — it will not be shown again.`);
      setIsStudentModalOpen(false);
      setNewStudent({
        fullName: '',
        fullNameNepali: '',
        username: '',
        sectionId: '',
        academicYearId: '',
        rollNumber: 1,
        admissionNumber: '',
        guardianName: '',
        guardianPhone: '',
        guardianRelation: 'Father',
        password: '',
      });
      loadSchoolData();
    } catch (err: any) {
      alert(err.message || 'Error enrolling student');
    }
  };

  const loadExamData = async () => {
    try {
      const [examsRes, pDash, logsRes] = await Promise.all([
        api.get('/assessment/examinations'),
        api.get('/assessment/principal/dashboard'),
        api.get('/assessment/audit-trail?limit=25'),
      ]);
      setExaminations(Array.isArray(examsRes) ? examsRes : examsRes?.data || []);
      setExamDashboard(pDash?.data || pDash || null);
      setAuditLogs(Array.isArray(logsRes) ? logsRes : logsRes?.data || []);
    } catch (e) {
      console.error('Failed to load examination data', e);
    }
  };

  const loadAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const data = await api.get('/analytics/principal');
      setAnalyticsData(data);
    } catch (e) {
      console.error('Failed to load analytics data', e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadSchoolSubscription = async () => {
    try {
      const [entRes, invRes] = await Promise.all([
        api.get('/subscriptions/my-entitlements'),
        api.get('/subscriptions/invoices'),
      ]);
      // Normalise the backend entitlement shape for the Subscription screen
      if (entRes) {
        const plan: any = entRes.currentPlan || {};
        const sub: any = entRes.activeSubscription || {};
        const grades: number[] = Array.isArray(entRes.allowedGrades) ? entRes.allowedGrades : [];
        setEntitlements({
          ...entRes,
          package: plan.name
            ? {
                name: plan.name,
                priceNpr: plan.pricing?.annualPriceNpr ?? sub.amountPaid ?? 0,
                billingCycle: sub.billingCycle || 'ANNUAL',
              }
            : null,
          endDate: entRes.expiresAt || sub.endDate,
          isGracePeriod: entRes.inGracePeriod,
          gracePeriodEndsAt: sub.gracePeriodEndsAt || sub.gracePeriodEnd,
          quotas: { maxStudents: entRes.maxStudents, maxTeachers: entRes.maxTeachers },
          grades: grades.length
            ? { allowedGrades: grades, minGrade: Math.min(...grades), maxGrade: Math.max(...grades) }
            : null,
        });
      } else {
        setEntitlements(null);
      }
      setSchoolInvoices(Array.isArray(invRes) ? invRes : []);
    } catch (e) {
      console.error('Failed to load school subscription data', e);
    }
  };

  const handleInitiatePayment = async () => {
    if (!selectedInvoiceToPay) return;
    setPaymentLoading(true);
    try {
      const res = await api.post('/subscriptions/payments/initiate', {
        invoiceId: selectedInvoiceToPay._id || selectedInvoiceToPay.id,
        gateway: selectedGateway,
        returnUrl: window.location.origin + '/school-admin',
      });
      if (res.initResult?.paymentUrl) {
        window.open(res.initResult.paymentUrl, '_blank');
        alert(`Payment initiated with ${selectedGateway}. Reference: ${res.payment?.paymentReference}`);
      } else {
        alert(`Payment initiated! Reference: ${res.payment?.paymentReference}. Please deposit to the specified bank account.`);
      }
      setIsPayModalOpen(false);
      loadSchoolSubscription();
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleAssignClassTeacher = async (sectionId: string, teacherId: string) => {
    try {
      await api.post(`/school-admin/sections/${sectionId}/class-teacher`, {
        teacherId: (teacherId && teacherId !== 'UNASSIGN') ? teacherId : null,
      });
      const selectedTeacher = teachers.find((t: any) => (t.id || t._id) === teacherId);
      setClasses((prev) =>
        prev.map((c) => ({
          ...c,
          sections: (c.sections || []).map((s: any) =>
            (s.id === sectionId || s._id === sectionId)
              ? { ...s, classTeacherId: (teacherId && teacherId !== 'UNASSIGN') ? selectedTeacher : null }
              : s
          ),
        }))
      );
      alert('Class teacher designation successfully updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to update class teacher designation');
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // Learning Access & Feature Configuration Handlers (Section 2)
  // ══════════════════════════════════════════════════════════════════
  const loadFeatureAccessData = async () => {
    setFeatureLoading(true);
    try {
      const [matRes, instRes, histRes, devRes] = await Promise.all([
        api.get('/feature-access/matrix'),
        api.get('/feature-access/institution'),
        api.get('/feature-access/history?limit=30'),
        api.get('/feature-access/device-profiles'),
      ]);
      setFeatureMatrix(matRes?.data || matRes || null);
      setInstitutionFeatures(Array.isArray(instRes?.data) ? instRes.data : Array.isArray(instRes) ? instRes : []);
      setFeatureHistory(Array.isArray(histRes?.data) ? histRes.data : Array.isArray(histRes) ? histRes : []);
      setDeviceProfiles(Array.isArray(devRes?.data) ? devRes.data : Array.isArray(devRes) ? devRes : []);
    } catch (e) {
      console.error('Failed to load feature access data', e);
    } finally {
      setFeatureLoading(false);
    }
  };

  const handleToggleInstitutionFeature = async (featureKey: string, currentVal: boolean) => {
    try {
      await api.put('/feature-access/institution', {
        featureKey,
        enabled: !currentVal,
        reason: 'Institution default toggled by School Admin',
      });
      loadFeatureAccessData();
    } catch (err: any) {
      alert(err.message || 'Failed to update institution default');
    }
  };

  const handleToggleClassFeature = async (classId: string, featureKey: string, currentVal: boolean) => {
    try {
      await api.put(`/feature-access/classes/${classId}`, {
        featureKey,
        enabled: !currentVal,
        reason: 'Class override toggled in matrix by School Admin',
      });
      loadFeatureAccessData();
      if (selectedClassForFeatures === classId) {
        loadClassSettings(classId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update class feature setting');
    }
  };

  const loadClassSettings = async (classId: string) => {
    setSelectedClassForFeatures(classId);
    try {
      const res = await api.get(`/feature-access/classes/${classId}`);
      setClassFeatureList(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('Failed to load class settings', e);
    }
  };

  const loadSectionSettings = async (sectionId: string) => {
    setSelectedSectionForFeatures(sectionId);
    try {
      const res = await api.get(`/feature-access/sections/${sectionId}`);
      setSectionFeatureList(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('Failed to load section settings', e);
    }
  };

  const handleToggleSectionFeature = async (sectionId: string, featureKey: string, currentVal: boolean) => {
    try {
      await api.put(`/feature-access/sections/${sectionId}`, {
        featureKey,
        enabled: !currentVal,
        reason: 'Section override updated by School Admin',
      });
      loadSectionSettings(sectionId);
      loadFeatureAccessData();
    } catch (err: any) {
      alert(err.message || 'Failed to update section setting');
    }
  };

  const handleResetOverrides = async (scope: 'CLASS' | 'SECTION', targetId: string) => {
    if (!confirm(`Are you sure you want to reset ${scope} overrides back to inherited defaults?`)) return;
    try {
      await api.post('/feature-access/reset', { scope, targetId });
      alert(`Overrides reset to inherited hierarchy!`);
      loadFeatureAccessData();
      if (scope === 'CLASS') loadClassSettings(targetId);
      if (scope === 'SECTION') loadSectionSettings(targetId);
    } catch (err: any) {
      alert(err.message || 'Failed to reset overrides');
    }
  };

  const handleSaveDeviceProfile = async (classId: string, deviceType: string, internetAvailability: string) => {
    try {
      await api.put('/feature-access/device-profiles', {
        classId,
        deviceType,
        internetAvailability,
      });
      alert('Student device profile updated successfully!');
      loadFeatureAccessData();
    } catch (err: any) {
      alert(err.message || 'Failed to save device profile');
    }
  };

  const handleExecuteBulkUpdate = async () => {
    if (!bulkSelectedClassIds.length) {
      alert('Please select at least one class for bulk update.');
      return;
    }
    try {
      await api.post('/feature-access/classes/bulk', {
        classIds: bulkSelectedClassIds,
        featureKey: bulkFeatureKey,
        enabled: bulkFeatureEnabled,
        reason: `Bulk feature toggle applied to ${bulkSelectedClassIds.length} classes`,
      });
      alert(`Successfully updated ${bulkSelectedClassIds.length} classes!`);
      setIsBulkModalOpen(false);
      loadFeatureAccessData();
    } catch (err: any) {
      alert(err.message || 'Bulk update failed');
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const academicYearId = dashboardData?.institution?.currentAcademicYearId || classes[0]?.sections?.[0]?.academicYearId;
      if (!academicYearId) {
        throw new Error('Configure an active academic year before creating an examination.');
      }
      await api.post('/assessment/examinations', {
        ...newExam,
        academicYearId,
      });
      alert('Examination created successfully!');
      setIsExamModalOpen(false);
      loadExamData();
    } catch (err: any) {
      alert(err.message || 'Failed to create exam');
    }
  };

  // Profile & Password State (School Admin)
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
      setPasswordChangeMsg({ text: 'Password successfully changed! Your admin account is now secured.', type: 'success' });
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err: any) {
      setPasswordChangeMsg({ text: err.message || 'Failed to change password. Please verify your current password.', type: 'error' });
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handlePublishExam = async (examId: string) => {
    if (!confirm('Are you sure you want to publish results for this examination? All students in applicable grades will immediately receive their verified report cards.')) return;
    try {
      await api.patch(`/assessment/examinations/${examId}/publish`, {});
      alert('Examination results published to students successfully!');
      loadExamData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish examination');
    }
  };

  const loadTimetableData = async (secId?: string) => {
    try {
      const [periodsRes, overviewRes] = await Promise.all([
        api.get('/timetable/periods'),
        api.get('/timetable/principal/overview'),
      ]);
      setTimetablePeriods(Array.isArray(periodsRes) ? periodsRes : []);
      setTimetableOverview(overviewRes || null);

      const targetSec =
        secId ||
        selectedTimetableSection ||
        classes[0]?.sections?.[0]?.id ||
        classes[0]?.sections?.[0]?._id;

      if (targetSec) {
        setSelectedTimetableSection(targetSec);
        const schedRes = await api.get(`/timetable/student/${targetSec}`);
        setSectionScheduleEntries(schedRes?.weeklyEntries || []);
      }
    } catch (e) {
      console.error('Failed to load timetable data', e);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4faf8', color: '#0e3e3b' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: '#ffffff', borderRight: '1px solid #dcebe6', color: '#0e3e3b', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #dcebe6', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SchoolLogoBadge size={40} radius={8} fallback={
          <div style={{ width: '36px', height: '36px', background: '#117a6b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <School size={20} color="#ffffff" />
          </div>
          } />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b' }}>
              {user?.role === 'COLLEGE_ADMIN' ? 'College Admin' : user?.role === 'PRINCIPAL' ? 'Principal' : 'School Admin'}
            </h3>
            <p style={{ fontSize: '11px', color: '#117a6b', fontWeight: '600', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={dashboardData?.institution?.name || user?.institutionName || 'Institution not available'}>
              {dashboardData?.institution?.name || user?.institutionName || 'Institution not available'}
            </p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'OVERVIEW' ? '#117a6b' : '#5f736f',
              background: activeTab === 'OVERVIEW' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'OVERVIEW' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <School size={18} color={activeTab === 'OVERVIEW' ? '#117a6b' : '#5f736f'} /> Institution Dashboard
          </button>

          <button
            onClick={() => setActiveTab('CLASSES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'CLASSES' ? '#117a6b' : '#5f736f',
              background: activeTab === 'CLASSES' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'CLASSES' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <Layers size={18} color={activeTab === 'CLASSES' ? '#117a6b' : '#5f736f'} /> Classes & Sections
          </button>

          <button
            onClick={() => setActiveTab('TEACHERS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'TEACHERS' ? '#117a6b' : '#5f736f',
              background: activeTab === 'TEACHERS' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'TEACHERS' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <Users size={18} color={activeTab === 'TEACHERS' ? '#117a6b' : '#5f736f'} /> Teachers & Faculty
          </button>

          <button
            onClick={() => setActiveTab('STUDENTS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'STUDENTS' ? '#117a6b' : '#5f736f',
              background: activeTab === 'STUDENTS' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'STUDENTS' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <GraduationCap size={18} color={activeTab === 'STUDENTS' ? '#117a6b' : '#5f736f'} /> Student Registry
          </button>

          <button
            onClick={() => setActiveTab('ALLOCATION')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'ALLOCATION' ? '#117a6b' : '#5f736f',
              background: activeTab === 'ALLOCATION' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'ALLOCATION' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <BookOpen size={18} color={activeTab === 'ALLOCATION' ? '#117a6b' : '#5f736f'} /> Academic Curriculum & Subjects
          </button>

          <button
            onClick={() => {
              setActiveTab('TIMETABLE');
              loadTimetableData();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'TIMETABLE' ? '#117a6b' : '#5f736f',
              background: activeTab === 'TIMETABLE' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'TIMETABLE' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <Clock size={18} color={activeTab === 'TIMETABLE' ? '#117a6b' : '#5f736f'} /> Timetable Management
          </button>

          <button
            onClick={() => setActiveTab('ASSIGNMENTS_ADMIN')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'ASSIGNMENTS_ADMIN' ? '#117a6b' : '#5f736f',
              background: activeTab === 'ASSIGNMENTS_ADMIN' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'ASSIGNMENTS_ADMIN' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <FileText size={18} color={activeTab === 'ASSIGNMENTS_ADMIN' ? '#117a6b' : '#5f736f'} />
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>Assignment Studio</span>
              {assignmentsData.stats?.pendingEvaluations > 0 && (
                <span style={{ fontSize: '10px', background: '#ede9fe', color: '#3b2f8f', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                  {assignmentsData.stats.pendingEvaluations}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('QUIZ_ADMIN')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'QUIZ_ADMIN' ? '#117a6b' : '#5f736f',
              background: activeTab === 'QUIZ_ADMIN' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'QUIZ_ADMIN' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <Award size={18} color={activeTab === 'QUIZ_ADMIN' ? '#117a6b' : '#5f736f'} />
            <span>Quiz Assessment</span>
          </button>

          <button
            onClick={() => setActiveTab('RESOURCES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'RESOURCES' ? '#117a6b' : '#5f736f',
              background: activeTab === 'RESOURCES' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'RESOURCES' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <BookOpenCheck size={18} color={activeTab === 'RESOURCES' ? '#117a6b' : '#5f736f'} />
            <span>Textbooks & PDF Reader</span>
          </button>

          <button
            onClick={() => setActiveTab('INSTITUTION_SETUP')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'INSTITUTION_SETUP' ? '#117a6b' : '#5f736f',
              background: activeTab === 'INSTITUTION_SETUP' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'INSTITUTION_SETUP' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <Building size={18} color={activeTab === 'INSTITUTION_SETUP' ? '#117a6b' : '#5f736f'} />
            <span>Institution Setup & Medium</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('EXAMINATIONS');
              loadExamData();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'EXAMINATIONS' ? '#117a6b' : '#5f736f',
              background: activeTab === 'EXAMINATIONS' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'EXAMINATIONS' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <Award size={18} color={activeTab === 'EXAMINATIONS' ? '#117a6b' : '#5f736f'} /> Examinations & Marks
          </button>

          <button
            onClick={() => {
              setActiveTab('ANALYTICS');
              loadAnalyticsData();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'ANALYTICS' ? '#117a6b' : '#5f736f',
              background: activeTab === 'ANALYTICS' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'ANALYTICS' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <TrendingUp size={18} color={activeTab === 'ANALYTICS' ? '#117a6b' : '#5f736f'} /> Academic Analytics
          </button>

          <button
            onClick={() => {
              setActiveTab('SUBSCRIPTION');
              loadSchoolSubscription();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'SUBSCRIPTION' ? '#117a6b' : '#5f736f',
              background: activeTab === 'SUBSCRIPTION' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'SUBSCRIPTION' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <CreditCard size={18} color={activeTab === 'SUBSCRIPTION' ? '#117a6b' : '#5f736f'} /> Subscription & Licensing
          </button>

          <button
            onClick={() => {
              setActiveTab('ANNOUNCEMENTS');
              loadSchoolAnnouncements();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'ANNOUNCEMENTS' ? '#117a6b' : '#5f736f',
              background: activeTab === 'ANNOUNCEMENTS' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'ANNOUNCEMENTS' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <Megaphone size={18} color={activeTab === 'ANNOUNCEMENTS' ? '#117a6b' : '#5f736f'} />
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>Announcements</span>
              {schoolAnnouncements.length > 0 && (
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                  {schoolAnnouncements.length}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('FEATURE_ACCESS');
              loadFeatureAccessData();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'FEATURE_ACCESS' ? '#117a6b' : '#5f736f',
              background: activeTab === 'FEATURE_ACCESS' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'FEATURE_ACCESS' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <Sliders size={18} color={activeTab === 'FEATURE_ACCESS' ? '#117a6b' : '#5f736f'} /> Feature Access Control
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: activeTab === 'PROFILE' ? '#117a6b' : '#5f736f',
              background: activeTab === 'PROFILE' ? '#e6f7f0' : 'transparent',
              borderLeft: activeTab === 'PROFILE' ? '3px solid #117a6b' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <User size={18} color={activeTab === 'PROFILE' ? '#117a6b' : '#5f736f'} /> Profile & Security
          </button>
        </nav>

        {/* Smart Board Launcher Button */}
        <div style={{ padding: '16px', borderTop: '1px solid #dcebe6', background: '#f4faf8' }}>
          <a
            href="/smartboard/index.html"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              background: 'linear-gradient(135deg, #117a6b, #1fb589)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              textDecoration: 'none',
              marginBottom: '16px',
              boxShadow: '0 2px 6px rgba(17, 122, 107, 0.2)',
            }}
          >
            <Presentation size={16} /> Open Smart Board
          </a>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              onClick={() => setActiveTab('PROFILE')}
              title="Admin Profile & Security Settings"
              style={{ cursor: 'pointer' }}
            >
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#0e3e3b', margin: 0 }}>{user?.fullName || 'School Admin'}</p>
              <p style={{ fontSize: '11px', color: '#117a6b', fontWeight: 600, margin: '2px 0 0' }}>Profile & Security →</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              title="Sign Out"
              style={{ color: '#ef4444', padding: '6px', background: 'transparent', cursor: 'pointer', border: 'none' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <DemoBanner />
        <header style={{ height: '64px', background: '#ffffff', borderBottom: '1px solid #dcebe6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>
            {activeTab === 'OVERVIEW' && 'Institution Academic & Operational Overview'}
            {activeTab === 'CLASSES' && 'Classes 1–12 & Section Configuration'}
            {activeTab === 'TEACHERS' && 'Teacher Roster & Workload'}
            {activeTab === 'STUDENTS' && 'Individual Student Admissions'}
            {activeTab === 'ALLOCATION' && 'Academic Curriculum & Subjects'}
            {activeTab === 'TIMETABLE' && 'Timetable Management'}
            {activeTab === 'ASSIGNMENTS_ADMIN' && 'Assignment Studio Oversight & Submissions'}
            {activeTab === 'QUIZ_ADMIN' && 'Quiz & Assessment Studio Oversight'}
            {activeTab === 'RESOURCES' && 'Digital Textbooks, PDF Library & Learning Resources'}
            {activeTab === 'INSTITUTION_SETUP' && 'Institution Information, Medium & Academic Calendar'}
            {activeTab === 'EXAMINATIONS' && 'Academic Examinations, Marks Workflow & Audit'}
            {activeTab === 'ANALYTICS' && 'Academic Analytics, Syllabus Tracking & CDC Grading'}
            {activeTab === 'SUBSCRIPTION' && 'Institutional Subscription, Included Classes & Billing'}
            {activeTab === 'FEATURE_ACCESS' && 'Learning Access & School-Wise / Class-Wise Feature Configuration'}
            {activeTab === 'ANNOUNCEMENTS' && 'Institutional Bulletins, Notices & School Announcements'}
            {activeTab === 'PROFILE' && 'Administrator Profile & Account Security'}
          </h2>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {activeTab === 'OVERVIEW' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#5f736f', background: '#f4faf8', padding: '6px 12px', borderRadius: '8px', border: '1px solid #dcebe6' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1fb589', boxShadow: '0 0 6px rgba(31, 181, 137, 0.6)' }} />
                  <span>Real-time Sync • {lastSyncTime.toLocaleTimeString()}</span>
                </div>

                <button
                  onClick={() => loadSchoolData(true)}
                  disabled={isRefreshing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: '#ffffff',
                    border: '1px solid #cfdcd8',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#2f4f4c',
                    cursor: 'pointer',
                  }}
                  title="Force refresh realtime institution data"
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>

                <button
                  onClick={() => setIsBulkStudentModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} /> Bulk Students
                </button>

                <button
                  onClick={() => setIsBulkTeacherModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#e6f7f0',
                    color: '#117a6b',
                    border: '1px solid #bfeede',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} /> Bulk Teachers
                </button>

                <a
                  href="/smartboard/index.html"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #117a6b, #1fb589)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(17, 122, 107, 0.25)',
                  }}
                >
                  <Presentation size={15} /> Smart Board
                </a>
              </>
            )}
            {activeTab === 'EXAMINATIONS' && (
              <button
                onClick={() => setIsExamModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#117a6b',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '6px'
                }}
              >
                <Plus size={16} /> Schedule Examination
              </button>
            )}
            {activeTab === 'TEACHERS' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsBulkTeacherModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    fontSize: '13px',
                    fontWeight: '700',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} /> Bulk Faculty Import (CSV)
                </button>
                <button
                  onClick={() => setIsTeacherModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: '#117a6b',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} /> Add Teacher
                </button>
              </div>
            )}
            {activeTab === 'STUDENTS' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsBulkStudentModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    fontSize: '13px',
                    fontWeight: '700',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} /> Bulk Student Enrollment (CSV)
                </button>
                <button
                  onClick={() => setIsStudentModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: '#117a6b',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} /> Enroll Student
                </button>
              </div>
            )}
            {activeTab === 'ALLOCATION' && (
              <button
                onClick={() => setIsBulkAllocModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <BookOpen size={15} /> Bulk Faculty Allocation Matrix
              </button>
            )}
          </div>
        </header>

        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {activeTab === 'OVERVIEW' && (() => {
            const institutionName = dashboardData?.institution?.name || user?.institutionName || 'Institution not available';
            const isPrincipal = user?.role === 'PRINCIPAL';
            const institutionNameNepali = dashboardData?.institution?.nameNepali || '';
            const emisCode = dashboardData?.institution?.emisCode || user?.institutionCode || '—';
            const currentYear = dashboardData?.institution?.currentAcademicYear || '—';
            const province = dashboardData?.institution?.province || '—';
            const district = dashboardData?.institution?.district || '—';
            const totalStudents = dashboardData?.counts?.students ?? students.length;
            const totalTeachers = dashboardData?.counts?.teachers ?? teachers.length;
            const totalClasses = dashboardData?.counts?.classes ?? classes.length;
            const totalSections = dashboardData?.counts?.sections ?? classes.reduce((acc, c) => acc + (c.sections?.length || 0), 0);
            const attendanceRate = analyticsData?.attendance?.overallRate ?? analyticsData?.kpi?.overallAttendanceRate ?? null;
            const classPerformance = analyticsData?.classPerformance || [];
            const avgGpa = classPerformance.length
              ? classPerformance.reduce((sum: number, entry: any) => sum + (Number(entry.averageGpa) || 0), 0) / classPerformance.length
              : null;
            const attendanceChartData = (analyticsData?.attendance?.dailyTrend || analyticsData?.dailyAttendanceTrend || [])
              .map((entry: any) => ({
                day: entry.date ? new Date(entry.date).toLocaleDateString() : '—',
                attendanceRate: entry.attendanceRate,
              }));
            const classPerformanceData = classPerformance.map((entry: any, index: number) => ({
              grade: entry.className || `Class ${entry.gradeNumber ?? ''}`,
              gpa: entry.averageGpa,
              passRate: entry.passPercentage,
              fill: ['#6d4fd6', '#8a6bd9', '#a08be6', '#c4559f', '#f08a3c', '#f1b434'][index % 6],
            }));
            const grades = gradeDistribution;
            const totalGrades = grades.reduce((sum: number, entry: any) => sum + (Number(entry.count) || 0), 0);
            const letterGradeData = grades.map((entry: any, index: number) => ({
              grade: entry.grade,
              count: entry.count,
              percentage: totalGrades ? `${((entry.count / totalGrades) * 100).toFixed(1)}%` : '0%',
              color: ['#6d4fd6', '#8a6bd9', '#c4559f', '#f08a3c', '#f1b434', '#e5533d'][index % 6],
            }));
            const syllabusProgressData: any[] = syllabusRows.slice(0, 8).map((r: any) => ({
              subject: `Class ${r.gradeNumber || '—'} ${r.subjectName}`,
              teacher: r.teacherName,
              progress: r.percentage,
              color: r.percentage >= 50 ? '#6d4fd6' : '#f1b434',
            }));
            const livePeriods: any[] = todayPeriods;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 1. Institutional Hero & Broadcast Banner */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #0f5f55 0%, #0f5f55 50%, #117a6b 100%)',
                    borderRadius: '16px',
                    padding: '28px 32px',
                    color: '#ffffff',
                    boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative background glow */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '-40px',
                      top: '-40px',
                      width: '260px',
                      height: '260px',
                      background: 'radial-gradient(circle, rgba(31, 181, 137, 0.25) 0%, transparent 70%)',
                      borderRadius: '50%',
                      pointerEvents: 'none',
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '14px',
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(8px)',
                          border: '1.5px solid rgba(255, 255, 255, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          flexShrink: 0,
                        }}
                      >
                        🏫
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.3px', margin: 0, color: '#ffffff' }}>
                            {institutionName}
                          </h1>
                          <span style={{ fontSize: '14px', color: '#bfeede', fontWeight: '600' }}>
                            ({institutionNameNepali})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap', fontSize: '13px', color: '#daf5ec' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '6px' }}>
                            <Building size={14} /> EMIS: <strong>{emisCode}</strong>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '6px' }}>
                            <Calendar size={14} /> Academic Year: <strong>{currentYear}</strong>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '6px' }}>
                            <MapPin size={14} /> {province}, {district}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#1fb589', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                            <CheckCircle2 size={13} /> MoEST Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setActiveTab('CLASSES')}
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          color: '#ffffff',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backdropFilter: 'blur(6px)',
                        }}
                      >
                        <Layers size={14} /> Structure
                      </button>
                      <button
                        onClick={() => setActiveTab('TIMETABLE')}
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          color: '#ffffff',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backdropFilter: 'blur(6px)',
                        }}
                      >
                        <Clock size={14} /> Timetable
                      </button>
                      <a
                        href="/smartboard/index.html"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: '#ffffff',
                          color: '#0f4c4a',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '800',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        }}
                      >
                        <Presentation size={15} /> Launch Board
                      </a>
                    </div>
                  </div>

                  {/* Glassmorphic Live Indicator Strip */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '12px',
                      marginTop: '20px',
                      background: 'rgba(0, 0, 0, 0.15)',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2fcf9c' }} />
                      <span>Classes configured: <strong>{totalClasses} ({totalSections} sections)</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa' }} />
                      <span>Courses with syllabus tracking: <strong>{syllabusRows.length}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa' }} />
                      <span>School Schedule: <strong>{dashboardData?.institution?.schoolTimings?.startTime ? `${dashboardData.institution.schoolTimings.startTime} – ${dashboardData.institution.schoolTimings.endTime}` : 'Not configured'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa' }} />
                      <span>Licensing: <strong>{entitlements?.status ? `${entitlements?.package?.name || 'Plan'} · ${entitlements.status}` : 'See Subscription tab'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* 2. 6 Real-time 3D-Styled Metric Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
                  {/* Card 1: Students */}
                  <div
                    onClick={() => setActiveTab('STUDENTS')}
                    style={{
                      background: '#ffffff',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#5f736f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Enrolled Students
                      </span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GraduationCap size={18} color="#117a6b" />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#0e3e3b', letterSpacing: '-0.5px' }}>
                      {totalStudents}
                    </div>
                    <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> {attendanceRate === null ? 'No attendance data' : `${attendanceRate}% Daily Attendance`}
                    </div>
                  </div>

                  {/* Card 2: Faculty */}
                  <div
                    onClick={() => setActiveTab('TEACHERS')}
                    style={{
                      background: '#ffffff',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#5f736f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Active Faculty
                      </span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={18} color="#2563eb" />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#0e3e3b', letterSpacing: '-0.5px' }}>
                      {totalTeachers}
                    </div>
                    <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '4px', fontWeight: '700' }}>
                      Classes 1–12 Assigned
                    </div>
                  </div>

                  {/* Card 3: Classes & Sections */}
                  <div
                    onClick={() => setActiveTab('CLASSES')}
                    style={{
                      background: '#ffffff',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#5f736f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Classes & Sections
                      </span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Layers size={18} color="#7c3aed" />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#0e3e3b', letterSpacing: '-0.5px' }}>
                      {totalClasses} <span style={{ fontSize: '16px', fontWeight: '600', color: '#5f736f' }}>({totalSections} Sec)</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#7c3aed', marginTop: '4px', fontWeight: '700' }}>
                      CDC Curriculum Matrix
                    </div>
                  </div>

                  {/* Card 4: Academic Score & GPA */}
                  <div
                    onClick={() => setActiveTab('EXAMINATIONS')}
                    style={{
                      background: '#ffffff',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#5f736f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Academic GPA
                      </span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={18} color="#6d5bd0" />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#0e3e3b', letterSpacing: '-0.5px' }}>
                      {avgGpa === null ? 'GPA —' : `GPA ${avgGpa.toFixed(2)}`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: '700' }}>
                      {analyticsData?.kpi?.terminalPassRate != null ? `${analyticsData.kpi.terminalPassRate}% Terminal Pass Rate` : 'No results yet'}
                    </div>
                  </div>

                  {/* Card 5: Master Timetable */}
                  <div
                    onClick={() => setActiveTab('TIMETABLE')}
                    style={{
                      background: '#ffffff',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#5f736f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Timetable Grid
                      </span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={18} color="#0891b2" />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#0e3e3b', letterSpacing: '-0.5px' }}>
                      {livePeriods.length} <span style={{ fontSize: '15px', fontWeight: '600', color: '#5f736f' }}>Periods</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#0891b2', marginTop: '4px', fontWeight: '700' }}>
                      {livePeriods.length === 0 ? 'No published timetable for today' : `${livePeriods.filter((p: any) => p.status === 'COMPLETED').length} completed • ${livePeriods.filter((p: any) => p.status === 'IN_PROGRESS').length} running now`}
                    </div>
                  </div>

                  {/* Card 6: Smart Board & Labs */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#5f736f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Subject Allocations
                      </span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#effaf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Presentation size={18} color="#16a34a" />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#0e3e3b', letterSpacing: '-0.5px' }}>
                      {dashboardData?.counts?.subjectAllocations ?? 0} <span style={{ fontSize: '15px', fontWeight: '600', color: '#5f736f' }}>Allocations</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: '700' }}>
                      Teacher–subject assignments
                    </div>
                  </div>
                </div>

                {/* 3. Interactive 3D Charts Row 1: Attendance Area & Terminal GPA Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                  {/* Attendance Performance Dynamics (3D AreaChart) */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                          Weekly Student Attendance Dynamics
                        </h3>
                        <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0' }}>
                          Primary (1–5), Lower Secondary (6–8), and Secondary (9–12) daily attendance curves
                        </p>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#117a6b', background: '#e6f7f0', padding: '3px 8px', borderRadius: '6px' }}>
                        {attendanceRate === null ? 'No attendance data' : `Average ${attendanceRate}%`}
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '260px' }}>
                      {attendanceChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebf5f1" />
                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5f736f' }} axisLine={{ stroke: '#dcebe6' }} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#5f736f' }} axisLine={false} tickLine={false} unit="%" />
                            <Tooltip formatter={(value: any) => [`${value}%`, 'Attendance']} />
                            <Line type="monotone" dataKey="attendanceRate" name="Attendance" stroke="#6d4fd6" strokeWidth={2.5} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : <div style={{ padding: '90px 12px', textAlign: 'center', color: '#5f736f' }}>No attendance records yet.</div>}
                    </div>
                  </div>

                  {/* Terminal Exam Class GPA Benchmark (3D BarChart) */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                          Class-Wise Terminal Exam Performance
                        </h3>
                        <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0' }}>
                          Average terminal GPA across Grades 1 to 12
                        </p>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>
                        {avgGpa === null ? 'No published marks' : `Average GPA: ${avgGpa.toFixed(2)}`}
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '260px' }}>
                      {classPerformanceData.length === 0 && <div style={{ padding: '100px 12px', textAlign: 'center', color: '#5f736f' }}>No published class results yet.</div>}
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={classPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            {classPerformanceData.map((c: { fill: string }, idx: number) => (
                              <linearGradient key={idx} id={`classBarGrad${idx}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={c.fill} stopOpacity={1} />
                                <stop offset="100%" stopColor={c.fill} stopOpacity={0.65} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebf5f1" />
                          <XAxis dataKey="grade" tick={{ fontSize: 10, fill: '#5f736f' }} axisLine={{ stroke: '#dcebe6' }} tickLine={false} interval={1} />
                          <YAxis domain={[2.0, 4.0]} tick={{ fontSize: 11, fill: '#5f736f' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #dcebe6', color: '#0e3e3b', fontSize: '12px', boxShadow: '0 10px 24px -8px rgba(14, 62, 59, 0.18)' }}
                            formatter={(val: any, _name: any, item: any) => [`GPA: ${val} (Pass: ${item.payload.passRate}%)`, 'Class Result']}
                          />
                          <Bar dataKey="gpa" radius={[5, 5, 0, 0]}>
                            {classPerformanceData.map((_: unknown, idx: number) => (
                              <Cell key={`bar-${idx}`} fill={`url(#classBarGrad${idx})`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 4. Interactive 3D Charts Row 2: Letter Grade Donut & CDC Syllabus Tracker */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
                  {/* Nepal CDC Letter Grade Distribution (Donut Chart) */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Letter Grade Distribution (MoEST Framework)
                      </h3>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0' }}>
                        Published examination grade distribution
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ width: '160px', height: '170px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={letterGradeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={46}
                              outerRadius={70}
                              paddingAngle={3}
                              dataKey="count"
                            >
                              {letterGradeData.map((entry: { color: string }, index: number) => (
                                <Cell key={`slice-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #dcebe6', color: '#0e3e3b', fontSize: '12px', boxShadow: '0 10px 24px -8px rgba(14, 62, 59, 0.18)' }}
                              formatter={(val: any, _name: any, item: any) => [`${val} Students (${item.payload.percentage})`, item.payload.grade]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            pointerEvents: 'none',
                          }}
                        >
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#0e3e3b' }}>
                            {totalGrades > 0 ? totalGrades : '—'}
                          </div>
                          <div style={{ fontSize: '10px', color: '#5f736f', fontWeight: '700' }}>Published results</div>
                        </div>
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {letterGradeData.map((g: { grade: string; color: string; count: number; percentage: string }, idx: number) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: g.color }} />
                              <span style={{ fontWeight: '600', color: '#2f4f4c' }}>{g.grade}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <span style={{ fontWeight: '800', color: '#0e3e3b' }}>{g.count}</span>
                              <span style={{ color: '#5f736f', minWidth: '40px', textAlign: 'right' }}>{g.percentage}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CDC Syllabus Completion Progress */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                          Nepal CDC Curriculum Syllabus Coverage
                        </h3>
                        <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0' }}>
                          Chapter progress recorded by subject teachers
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {syllabusProgressData.length === 0 && <div style={{ color: '#5f736f', fontSize: '13px' }}>No subject-level syllabus progress has been recorded.</div>}
                      {syllabusProgressData.map((s, idx) => (
                        <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
                            <div>
                              <strong style={{ color: '#0e3e3b' }}>{s.subject}</strong>
                              <span style={{ color: '#5f736f', marginLeft: '6px', fontSize: '11px' }}>({s.teacher})</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <strong style={{ color: s.color, minWidth: '35px', textAlign: 'right' }}>{s.progress}%</strong>
                            </div>
                          </div>
                          <div style={{ width: '100%', height: '7px', background: '#ebf5f1', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${s.progress}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, ${s.color}, ${s.color}dd)`,
                                borderRadius: '4px',
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Live Daily Schedule & Period Management */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Today's Running Master Period Schedule
                      </h3>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0' }}>
                        Live classroom periods, assigned teachers, subject syllabus, and room locations
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setActiveTab('TIMETABLE')}
                        style={{
                          padding: '6px 14px',
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        Edit Master Timetable →
                      </button>
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6' }}>
                      <tr>
                        <th style={{ padding: '12px 20px', fontWeight: '700', color: '#4b605b' }}>Period</th>
                        <th style={{ padding: '12px 16px', fontWeight: '700', color: '#4b605b' }}>Time Slot</th>
                        <th style={{ padding: '12px 16px', fontWeight: '700', color: '#4b605b' }}>Subject & Course</th>
                        <th style={{ padding: '12px 16px', fontWeight: '700', color: '#4b605b' }}>Grade & Section</th>
                        <th style={{ padding: '12px 16px', fontWeight: '700', color: '#4b605b' }}>Assigned Faculty</th>
                        <th style={{ padding: '12px 16px', fontWeight: '700', color: '#4b605b' }}>Classroom</th>
                        <th style={{ padding: '12px 20px', fontWeight: '700', color: '#4b605b' }}>Period Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...livePeriods].sort((a: any, b: any) => (a.status === 'IN_PROGRESS' ? -1 : 0) - (b.status === 'IN_PROGRESS' ? -1 : 0)).slice(0, showAllPeriods ? livePeriods.length : 12).map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #ebf5f1', background: p.status === 'IN_PROGRESS' ? '#effaf6' : p.period === 'BREAK' ? '#f5f3ff' : '#ffffff' }}>
                          <td style={{ padding: '12px 20px', fontWeight: '800', color: p.status === 'IN_PROGRESS' ? '#117a6b' : '#0e3e3b' }}>
                            {p.period === 'BREAK' ? '☕' : `Period ${p.period}`}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#5f736f', fontWeight: '600' }}>
                            {p.time}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0e3e3b' }}>
                            {p.subject}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb', fontWeight: '700', fontSize: '11px' }}>
                              {p.grade}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#2f4f4c', fontWeight: '600' }}>
                            {p.teacher}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#5f736f' }}>
                            {p.room}
                          </td>
                          <td style={{ padding: '12px 20px' }}>
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '800',
                                background:
                                  p.status === 'IN_PROGRESS'
                                    ? '#dcfce7'
                                    : p.status === 'COMPLETED'
                                    ? '#ebf5f1'
                                    : '#ede9fe',
                                color:
                                  p.status === 'IN_PROGRESS'
                                    ? '#15803d'
                                    : p.status === 'COMPLETED'
                                    ? '#4b605b'
                                    : '#4c3fa8',
                              }}
                            >
                              {p.status === 'IN_PROGRESS' && '● LIVE NOW'}
                              {p.status === 'COMPLETED' && '✓ COMPLETED'}
                              {p.status === 'UPCOMING' && 'SCHEDULED'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {livePeriods.length === 0 && (
                        <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#5f736f' }}>No live schedule entries are available.</td></tr>
                      )}
                    </tbody>
                  </table>
                  {livePeriods.length > 12 && (
                    <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #dcebe6' }}>
                      <button
                        onClick={() => setShowAllPeriods((v) => !v)}
                        style={{ padding: '7px 16px', borderRadius: '8px', border: '1px solid #cfdcd8', background: '#ffffff', fontSize: '12px', fontWeight: 700, color: '#0f5f55', cursor: 'pointer' }}
                      >
                        {showAllPeriods ? 'Show fewer periods' : `Show all ${livePeriods.length} periods`}
                      </button>
                    </div>
                  )}
                </div>

                {/* 6. Administrative Launchpad & Routine Shortcuts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  <div
                    onClick={() => setActiveTab('CLASSES')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dcebe6',
                      borderRadius: '14px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Layers size={20} color="#2563eb" />
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 4px', color: '#0e3e3b' }}>
                      Classes & Sections
                    </h4>
                    <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                      Configure Grades 1–12, sections, academic capacity, and class teachers.
                    </p>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Manage Classes <ChevronRight size={14} />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('TEACHERS')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dcebe6',
                      borderRadius: '14px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Users size={20} color="#117a6b" />
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 4px', color: '#0e3e3b' }}>
                      Teacher Roster & Import
                    </h4>
                    <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                      Manage faculty profiles, credentials, subject workloads, and bulk CSV uploads.
                    </p>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#117a6b', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Manage Teachers <ChevronRight size={14} />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('ALLOCATION')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dcebe6',
                      borderRadius: '14px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <BookOpen size={20} color="#7c3aed" />
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 4px', color: '#0e3e3b' }}>
                      Subject Allocations
                    </h4>
                    <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                      Assign curriculum subjects, theory/practical credits, and teacher rosters.
                    </p>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#7c3aed', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Allocation Matrix <ChevronRight size={14} />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('EXAMINATIONS')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dcebe6',
                      borderRadius: '14px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Award size={20} color="#6d5bd0" />
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 4px', color: '#0e3e3b' }}>
                      Exams & Grade Workflow
                    </h4>
                    <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                      Review teacher marks submissions, audit changes, approve and publish results.
                    </p>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#6d5bd0', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Examination Hub <ChevronRight size={14} />
                    </div>
                  </div>
                </div>

                {/* 7. Institutional Governance Profile */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  }}
                >
                  <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', color: '#0e3e3b' }}>
                    Institutional Governance & MoEST Compliance Registry
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', fontSize: '13px' }}>
                    <div style={{ padding: '12px 16px', background: '#f4faf8', borderRadius: '10px' }}>
                      <span style={{ color: '#5f736f', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>EMIS Code</span>
                      <strong style={{ fontSize: '15px', color: '#0e3e3b' }}>{emisCode}</strong>
                    </div>
                    <div style={{ padding: '12px 16px', background: '#f4faf8', borderRadius: '10px' }}>
                      <span style={{ color: '#5f736f', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Academic Year</span>
                      <strong style={{ fontSize: '15px', color: '#0e3e3b' }}>{currentYear}</strong>
                    </div>
                    <div style={{ padding: '12px 16px', background: '#f4faf8', borderRadius: '10px' }}>
                      <span style={{ color: '#5f736f', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Geographic Municipality</span>
                      <strong style={{ fontSize: '15px', color: '#0e3e3b' }}>{district}, {province}</strong>
                    </div>
                    <div style={{ padding: '12px 16px', background: '#f4faf8', borderRadius: '10px' }}>
                      <span style={{ color: '#5f736f', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Smart Board Status</span>
                      <strong style={{ fontSize: '15px', color: '#16a34a' }}>Active & Licensed</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'CLASSES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Header Action Bar */}
              <div style={{ background: '#ffffff', padding: '18px 24px', borderRadius: '16px', border: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                    Classes 1–12 & Section Configuration
                  </h3>
                  <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                    Configure grades, add class sections, and appoint designated class teachers
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => setIsClassModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#e6f7f0',
                      color: '#117a6b',
                      border: '1px solid #bfeede',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> Configure New Class
                  </button>

                  <button
                    onClick={() => setIsSectionModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: '#117a6b',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> Add Section to Class
                  </button>
                </div>
              </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Grade</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Class Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Board</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Sections</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls: any) => (
                    <tr key={cls.id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#117a6b' }}>Class {cls.gradeNumber}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>{cls.name}</td>
                      <td style={{ padding: '12px 16px', color: '#5f736f' }}>{cls.board}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {(cls.sections || []).length === 0 ? (
                          <span style={{ color: '#8da19d', fontSize: '12px' }}>No sections configured</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(cls.sections || []).map((sec: any) => {
                              const assignedT = sec.classTeacherId;
                              const tName = assignedT?.fullName || assignedT?.username || null;
                              return (
                                <div
                                  key={sec.id || sec._id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 12px',
                                    background: '#f4faf8',
                                    borderRadius: '8px',
                                    border: '1px solid #dcebe6',
                                    gap: '12px',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: '800', color: '#0e3e3b', fontSize: '13px' }}>
                                      Section {sec.name}
                                    </span>
                                    {tName ? (
                                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>🛡️ Class Teacher:</span>
                                        <strong>{tName}</strong>
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '11px', background: '#fef2f2', color: '#991b1b', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                                        No Class Teacher Assigned
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <select
                                      value={assignedT?.id || assignedT?._id || assignedT || ''}
                                      onChange={(e) => handleAssignClassTeacher(sec.id || sec._id, e.target.value)}
                                      style={{
                                        fontSize: '11px',
                                        padding: '5px 8px',
                                        borderRadius: '6px',
                                        border: '1px solid #cfdcd8',
                                        background: '#ffffff',
                                        color: '#2f4f4c',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <option value="">-- Assign Class Teacher --</option>
                                      {teachers.map((t: any) => (
                                        <option key={t.id || t._id} value={t.id || t._id}>
                                          {t.fullName} ({t.username})
                                        </option>
                                      ))}
                                      {tName && <option value="UNASSIGN">❌ Unassign Class Teacher</option>}
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}

          {activeTab === 'TEACHERS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Header Action Bar */}
              <div style={{ background: '#ffffff', padding: '18px 24px', borderRadius: '16px', border: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                    Teacher Roster & Faculty Management
                  </h3>
                  <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                    Active certified teachers: {teachers.length} faculty members with digital login identities
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8da19d' }} />
                    <input
                      type="text"
                      placeholder="Search faculty name or username..."
                      value={teacherSearchQuery}
                      onChange={(e) => setTeacherSearchQuery(e.target.value)}
                      style={{
                        padding: '8px 12px 8px 32px',
                        border: '1px solid #cfdcd8',
                        borderRadius: '8px',
                        fontSize: '12px',
                        width: '240px',
                      }}
                    />
                  </div>

                  <button
                    onClick={() => setIsBulkTeacherModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} /> Bulk CSV Import
                  </button>

                  <button
                    onClick={() => setIsTeacherModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: '#117a6b',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> Register Teacher Account
                  </button>
                </div>
              </div>

              {/* Teachers Table */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', fontWeight: '700' }}>Faculty Member</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700' }}>Username</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700' }}>Contact</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700' }}>Account Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers
                      .filter((t: any) =>
                        !teacherSearchQuery.trim() ||
                        (t.fullName || '').toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
                        (t.username || '').toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
                        (t.email || '').toLowerCase().includes(teacherSearchQuery.toLowerCase())
                      )
                      .map((t: any) => (
                        <tr key={t.id || t._id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: '700', color: '#0e3e3b' }}>{t.fullName}</div>
                            {t.fullNameNepali && <div style={{ fontSize: '11px', color: '#5f736f' }}>{t.fullNameNepali}</div>}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#117a6b', fontWeight: '600', fontFamily: 'monospace' }}>
                            {t.username}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#5f736f', fontSize: '12px' }}>
                            <div>{t.email || 'No email registered'}</div>
                            {t.phone && <div style={{ fontSize: '11px', color: '#8da19d' }}>{t.phone}</div>}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button
                              onClick={() => handleToggleTeacherStatus(t.id || t._id, t.status)}
                              title="Click to toggle teacher account status"
                              style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer',
                                background: t.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                                color: t.status === 'ACTIVE' ? '#166534' : '#991b1b',
                              }}
                            >
                              {t.status === 'ACTIVE' ? 'Active ●' : 'Suspended ○'}
                            </button>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => setActiveTab('ALLOCATION')}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cfdcd8',
                                background: '#f4faf8',
                                color: '#2f4f4c',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Assign Subjects →
                            </button>
                          </td>
                        </tr>
                      ))}
                    {teachers.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#8da19d' }}>
                          No teachers registered yet. Click "+ Register Teacher Account" or "Bulk CSV Import".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'STUDENTS' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                    Student Admissions & Digital Registry
                  </h3>
                  <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0' }}>
                    Active enrolled students across Classes 1–12 with digital identities and attendance tracking
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8da19d' }} />
                    <input
                      type="text"
                      placeholder="Search by student name or roll..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      style={{
                        padding: '8px 12px 8px 32px',
                        border: '1px solid #cfdcd8',
                        borderRadius: '8px',
                        fontSize: '12px',
                        width: '260px',
                      }}
                    />
                  </div>

                  <button
                    onClick={() => setIsBulkStudentModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} /> Bulk CSV Import
                  </button>

                  <button
                    onClick={() => setIsStudentModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: '#117a6b',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={15} /> Enroll Student
                  </button>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6' }}>
                  <tr>
                    <th style={{ padding: '12px 20px', fontWeight: '700', color: '#4b605b' }}>Roll</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: '#4b605b' }}>Student Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: '#4b605b' }}>Grade & Section</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: '#4b605b' }}>Digital Username</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: '#4b605b' }}>Guardian & Phone</th>
                    <th style={{ padding: '12px 20px', fontWeight: '700', color: '#4b605b' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.filter((s: any) =>
                    !studentSearchQuery ||
                    (s.fullName || s.name || '').toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                    (s.username || '').toLowerCase().includes(studentSearchQuery.toLowerCase())
                  ).map((st: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #ebf5f1' }}>
                      <td style={{ padding: '12px 20px', fontWeight: '800', color: '#117a6b' }}>
                        #{st.rollNumber || st.roll || idx + 1}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '700', color: '#0e3e3b' }}>{st.fullName || st.name}</div>
                        {(st.fullNameNepali || st.nepali) && (
                          <div style={{ fontSize: '11px', color: '#5f736f' }}>{st.fullNameNepali || st.nepali}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb', fontWeight: '700', fontSize: '11px' }}>
                          {st.className || st.sectionName || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#117a6b', fontWeight: '600', fontFamily: 'monospace' }}>
                        {st.username || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#5f736f', fontSize: '12px' }}>
                        {st.guardianName ? `${st.guardianName} (${st.guardianPhone || 'N/A'})` : st.guardian || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: '#effaf6', color: '#16a34a' }}>
                          {st.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#5f736f' }}>No enrolled students found.</td></tr>
                  )}
                </tbody>
              </table>

              <div style={{ padding: '14px 20px', background: '#f4faf8', borderTop: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#5f736f' }}>
                <span>Showing enrolled student records • Aligned to CDC Digital Identity format</span>
                <span style={{ fontWeight: '700', color: '#0e3e3b' }}>Total Enrolled: {dashboardData?.counts?.students ?? students.length} students</span>
              </div>
            </div>
          )}

          {activeTab === 'ALLOCATION' && <AcademicCurriculumPanel />}

          {activeTab === 'TIMETABLE' && <TimetableManagementPanel />}

          {/* ── TAB: ASSIGNMENT STUDIO OVERSIGHT ────────────────── */}
          {activeTab === 'ASSIGNMENTS_ADMIN' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                    Institutional Assignment Studio Oversight
                  </h3>
                  <p style={{ fontSize: '13px', color: '#5f736f', margin: '4px 0 0 0' }}>
                    Monitor faculty-created assignments, student submission counts, pending evaluations, and similarity reports.
                  </p>
                </div>
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <p style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700', margin: 0 }}>Total Assignments</p>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0e3e3b', margin: '4px 0 0 0' }}>
                    {assignmentsData.stats?.totalAssignments || assignmentsData.assignments?.length || 0}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#117a6b', margin: '4px 0 0 0', fontWeight: '600' }}>
                    {assignmentsData.stats?.activeCount || 0} Active Nationwide
                  </p>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <p style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700', margin: 0 }}>Total Submissions</p>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0e3e3b', margin: '4px 0 0 0' }}>
                    {assignmentsData.stats?.totalSubmissions || 0}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#5f736f', margin: '4px 0 0 0' }}>Across All Sections</p>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <p style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700', margin: 0 }}>Pending Evaluations</p>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#6d5bd0', margin: '4px 0 0 0' }}>
                    {assignmentsData.stats?.pendingEvaluations || 0}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#5f736f', margin: '4px 0 0 0' }}>Awaiting Faculty Review</p>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <p style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700', margin: 0 }}>Copy Detection Flags</p>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626', margin: '4px 0 0 0' }}>
                    {assignmentsData.stats?.flaggedSimilarity || 0}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#dc2626', margin: '4px 0 0 0', fontWeight: '600' }}>&gt;30% Cross-Student Match</p>
                </div>
              </div>

              {/* Assignments Table */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0e3e3b' }}>All Institutional Assignments</span>
                  <span style={{ fontSize: '12px', color: '#5f736f' }}>
                    {assignmentsData.assignments?.length || 0} Records
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#5f736f', fontSize: '12px' }}>
                        <th style={{ padding: '12px 16px' }}>Assignment Title</th>
                        <th style={{ padding: '12px 16px' }}>Subject & Grade</th>
                        <th style={{ padding: '12px 16px' }}>Assigned Faculty</th>
                        <th style={{ padding: '12px 16px' }}>Due Date</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Submissions</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(assignmentsData.assignments || []).map((a: any) => (
                        <tr key={a.id || a._id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: '700', color: '#0e3e3b' }}>{a.title}</div>
                            <div style={{ fontSize: '11px', color: '#5f736f' }}>
                              {a.unitTitle || (a.curriculumUnits?.[0]?.title ? `Unit: ${a.curriculumUnits[0].title}` : a.description)}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: '600', color: '#0e3e3b' }}>{a.centralSubjectId?.name || 'General'}</div>
                            <div style={{ fontSize: '11px', color: '#5f736f' }}>
                              {a.classId?.name || 'Class 10'} • {a.sectionId?.name || 'Sec A'}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#2f4f4c' }}>
                            {a.teacherId?.fullName || a.teacherId?.name || 'Faculty Member'}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#5f736f', fontFamily: 'monospace' }}>
                            {new Date(a.dueDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{ fontWeight: '800', color: '#117a6b', fontFamily: 'monospace' }}>
                              {a.totalSubmissions || 0}
                            </span>
                            {a.pendingCount > 0 && (
                              <span style={{ marginLeft: '6px', fontSize: '10px', background: '#ede9fe', color: '#3b2f8f', padding: '1px 6px', borderRadius: '10px' }}>
                                {a.pendingCount} pending
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '700',
                              background: a.status === 'ACTIVE' ? '#e6f7f0' : '#ebf5f1',
                              color: a.status === 'ACTIVE' ? '#117a6b' : '#5f736f',
                            }}>
                              {a.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => setInspectAssignment(a)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cfdcd8',
                                background: '#ffffff',
                                color: '#0e3e3b',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!assignmentsData.assignments || assignmentsData.assignments.length === 0) && (
                        <tr>
                          <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#8da19d' }}>
                            No assignments currently published in this institution.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: QUIZ & ASSESSMENT OVERVIEW ────────────────── */}
          {activeTab === 'QUIZ_ADMIN' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                    Institutional Quiz & Assessment Oversight
                  </h3>
                  <p style={{ fontSize: '13px', color: '#5f736f', margin: '4px 0 0 0' }}>
                    Supervise curriculum-grounded quizzes, exam proctoring configurations, student attempts, and passing rates.
                  </p>
                </div>
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <p style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700', margin: 0 }}>Total Quizzes</p>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0e3e3b', margin: '4px 0 0 0' }}>
                    {quizzesData.stats?.totalQuizzes || quizzesData.quizzes?.length || 0}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#117a6b', margin: '4px 0 0 0', fontWeight: '600' }}>
                    {quizzesData.stats?.publishedCount || 0} Published & Live
                  </p>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <p style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700', margin: 0 }}>Total Attempts</p>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0e3e3b', margin: '4px 0 0 0' }}>
                    {quizzesData.stats?.totalAttempts || 0}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#5f736f', margin: '4px 0 0 0' }}>Across All Classes</p>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <p style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700', margin: 0 }}>Pass Percentage</p>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#117a6b', margin: '4px 0 0 0' }}>
                    {quizzesData.stats?.overallPassPercentage ?? 0}%
                  </h3>
                  <p style={{ fontSize: '11px', color: '#5f736f', margin: '4px 0 0 0' }}>Passing Threshold: 50% Marks</p>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <p style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700', margin: 0 }}>Proctored Quizzes</p>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#7c3aed', margin: '4px 0 0 0' }}>
                    {quizzesData.stats?.proctoredCount || 0}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#7c3aed', margin: '4px 0 0 0', fontWeight: '600' }}>
                    Fullscreen & Anti-Tab Switch
                  </p>
                </div>
              </div>

              {/* Quizzes Table */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0e3e3b' }}>All Institutional Quizzes</span>
                  <span style={{ fontSize: '12px', color: '#5f736f' }}>{quizzesData.quizzes?.length || 0} Assessments</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#5f736f', fontSize: '12px' }}>
                        <th style={{ padding: '12px 16px' }}>Quiz Assessment</th>
                        <th style={{ padding: '12px 16px' }}>Subject & Mode</th>
                        <th style={{ padding: '12px 16px' }}>Faculty</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Duration</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Attempts</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Pass %</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Proctoring</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(quizzesData.quizzes || []).map((q: any) => (
                        <tr key={q.id || q._id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: '700', color: '#0e3e3b' }}>{q.title}</div>
                            <div style={{ fontSize: '11px', color: '#5f736f' }}>
                              {q.questions?.length || 0} Questions • {q.totalMarks} Marks
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: '600', color: '#0e3e3b' }}>{q.centralSubjectId?.name || 'General'}</div>
                            <span style={{ fontSize: '10px', background: '#ebf5f1', padding: '1px 5px', borderRadius: '4px', color: '#5f736f', fontFamily: 'monospace' }}>
                              {q.targetMode || 'CHAPTER_WISE'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#2f4f4c' }}>
                            {q.teacherId?.fullName || q.teacherId?.name || 'Faculty Member'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'monospace' }}>
                            {q.durationMinutes} mins
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '800', color: '#117a6b', fontFamily: 'monospace' }}>
                            {q.totalAttempts || 0}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: '#e6f7f0', color: '#117a6b' }}>
                              {q.passPercentage || 0}%
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {q.securitySettings?.fullscreenEnforced ? (
                              <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                                Shielded
                              </span>
                            ) : (
                              <span style={{ color: '#8da19d', fontSize: '11px' }}>Standard</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => setInspectQuiz(q)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cfdcd8',
                                background: '#ffffff',
                                color: '#0e3e3b',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!quizzesData.quizzes || quizzesData.quizzes.length === 0) && (
                        <tr>
                          <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#8da19d' }}>
                            No quizzes currently published in this institution.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: LEARNING RESOURCES & PDF LIBRARY ────────── */}
          {activeTab === 'RESOURCES' && (
            <ClassTextbookBrowser
              theme="emerald"
              title="Official Nepal CDC Digital Textbooks & PDF Library (Classes 1–12)"
              subtitle="Access digitized national curriculum textbooks from Nepal data/ folders across Classes 1 to 12 with integrated PDF reader, Smart Board canvas, and English/Nepali medium sorting."
            />
          )}

          {/* ── TAB: INSTITUTION SETUP & MEDIUM CONFIG ────────── */}
          {activeTab === 'INSTITUTION_SETUP' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>Institution Information</h3>
                <p style={{ fontSize: '13px', color: '#5f736f', margin: '4px 0 0 0' }}>
                  Contact and descriptive details for your institution. Identity fields (EMIS code, type, location) are managed by the platform administrator.
                </p>
              </div>

              {setupError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                  {setupError}
                </div>
              )}
              {setupSaved && (
                <div style={{ background: '#e6f7f0', border: '1px solid #bfeede', color: '#0f4c4a', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                  Institution information saved.
                </div>
              )}

              {setupLoading || !setupProfile ? (
                <div style={{ fontSize: '13px', color: '#5f736f' }}>{setupLoading ? 'Loading institution profile…' : 'Profile not available.'}</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div style={{ background: '#ffffff', padding: '22px', borderRadius: '12px', border: '1px solid #dcebe6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>Editable details</h4>
                    {([
                      ['name', 'Institution name'],
                      ['nameNepali', 'Name in Nepali'],
                      ['shortName', 'Short name'],
                      ['email', 'Email'],
                      ['phone', 'Phone'],
                      ['website', 'Website'],
                      ['street', 'Street / address'],
                      ['postalCode', 'Postal code'],
                      ['ward', 'Ward number'],
                    ] as Array<[string, string]>).map(([key, label]) => (
                      <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#5f736f' }}>
                        {label}
                        <input
                          value={setupForm[key] ?? ''}
                          onChange={(e) => setSetupForm((prev: any) => ({ ...prev, [key]: e.target.value }))}
                          style={{ padding: '8px 10px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px', color: '#0e3e3b' }}
                        />
                      </label>
                    ))}
                    <button
                      onClick={saveInstitutionSetup}
                      disabled={setupSaving}
                      style={{ alignSelf: 'flex-start', padding: '9px 18px', background: '#117a6b', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', opacity: setupSaving ? 0.6 : 1 }}
                    >
                      {setupSaving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>

                  <div style={{ background: '#ffffff', padding: '22px', borderRadius: '12px', border: '1px solid #dcebe6', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>Official record (read-only)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12px' }}>
                      {([
                        ['EMIS code', setupProfile.emisCode],
                        ['Institution type', setupProfile.type],
                        ['Province', setupProfile.province],
                        ['District', setupProfile.district],
                        ['Local level', setupProfile.localLevel],
                        ['Status', setupProfile.status],
                      ] as Array<[string, any]>).map(([label, value]) => (
                        <div key={label}>
                          <span style={{ color: '#5f736f' }}>{label}:</span>
                          <div style={{ fontWeight: '700', marginTop: '2px' }}>{value || '—'}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '10px 14px', background: '#f4faf8', border: '1px solid #dcebe6', borderRadius: '8px', fontSize: '11px', color: '#4b605b' }}>
                      The teaching medium (Nepali / English) is set per section when you create classes and sections.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'EXAMINATIONS' && (
            <div>
              <ExamOperationsPanel classes={classes} examinations={examinations} onChanged={loadExamData} />
              {/* Exam KPI Dashboard */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <p style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Active Examinations</p>
                  <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '4px', color: '#0e3e3b' }}>
                    {examDashboard?.activeExams?.length ?? examinations.length}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#117a6b', marginTop: '4px' }}>Nepal CDC Terminals & Tests</p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <p style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Teacher Submission Rate</p>
                  <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '4px', color: '#2563eb' }}>
                    {examDashboard?.assessmentProgress?.submissionRate ?? 0}%
                  </h3>
                  <p style={{ fontSize: '11px', color: '#5f736f', marginTop: '4px' }}>
                    {Math.max(0, (examDashboard?.assessmentProgress?.total ?? 0) - (examDashboard?.assessmentProgress?.draft ?? 0))} Submitted / {examDashboard?.assessmentProgress?.total ?? 0} Subjects
                  </p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <p style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Approved & Published</p>
                  <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '4px', color: '#16a34a' }}>
                    {examDashboard?.assessmentProgress?.published ?? 0}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>Student Marksheets Live</p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <p style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Marks Audit Trail</p>
                  <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '4px', color: '#6d5bd0' }}>
                    {auditLogs.length} Events
                  </h3>
                  <p style={{ fontSize: '11px', color: '#5f736f', marginTop: '4px' }}>Logged Change History</p>
                </div>
              </div>

              {/* Examinations List Table */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', overflow: 'hidden', marginBottom: '32px' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>
                    Scheduled & Completed Examinations
                  </h4>
                  <span style={{ fontSize: '12px', color: '#5f736f' }}>
                    Total Exams: {examinations.length}
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', fontWeight: '700' }}>Exam Name & Code</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700' }}>Type</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700' }}>Duration</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examinations.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#5f736f' }}>
                          No examinations configured yet. Click "Schedule Examination" above to create one.
                        </td>
                      </tr>
                    ) : (
                      examinations.map((ex: any) => (
                        <tr key={ex.id || ex._id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: '700', color: '#0e3e3b' }}>{ex.name}</div>
                            <div style={{ fontSize: '11px', color: '#5f736f' }}>Code: {ex.code}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: '#ebf5f1', color: '#2f4f4c' }}>
                              {ex.examType}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4b605b' }}>
                            {new Date(ex.startDate).toLocaleDateString()} — {new Date(ex.endDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '700',
                              background: ex.isPublished ? '#effaf6' : ex.status === 'ONGOING' ? '#eff6ff' : '#f5f3ff',
                              color: ex.isPublished ? '#16a34a' : ex.status === 'ONGOING' ? '#2563eb' : '#6d5bd0',
                            }}>
                              {ex.isPublished ? 'PUBLISHED' : ex.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {!ex.isPublished ? (
                              <button
                                onClick={() => handlePublishExam(ex.id || ex._id)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#117a6b',
                                  color: '#ffffff',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                }}
                              >
                                Publish to Students
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>
                                ✓ Results Live
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Marks Audit Logs */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} color="#6d5bd0" />
                    <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>
                      Marks Modification Audit Trail (Immutable Log)
                    </h4>
                  </div>
                  <span style={{ fontSize: '11px', color: '#5f736f' }}>
                    Recent 25 modifications
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6' }}>
                    <tr>
                      <th style={{ padding: '10px 16px', fontWeight: '700' }}>Timestamp</th>
                      <th style={{ padding: '10px 16px', fontWeight: '700' }}>Action</th>
                      <th style={{ padding: '10px 16px', fontWeight: '700' }}>Changed By</th>
                      <th style={{ padding: '10px 16px', fontWeight: '700' }}>Student</th>
                      <th style={{ padding: '10px 16px', fontWeight: '700' }}>Reason / Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#5f736f' }}>
                          No marks alterations recorded yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log: any) => (
                        <tr key={log.id || log._id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                          <td style={{ padding: '10px 16px', color: '#5f736f' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '700',
                              fontSize: '10px',
                              background: log.action === 'CREATE' ? '#effaf6' : log.action === 'PUBLISH' ? '#eff6ff' : '#ede9fe',
                              color: log.action === 'CREATE' ? '#16a34a' : log.action === 'PUBLISH' ? '#2563eb' : '#4c3fa8',
                            }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px', fontWeight: '600' }}>
                            {log.changedBy?.fullName || 'User'} ({log.userRole})
                          </td>
                          <td style={{ padding: '10px 16px', color: '#2f4f4c' }}>
                            {log.studentId?.fullName || 'Section Batch'}
                          </td>
                          <td style={{ padding: '10px 16px', color: '#4b605b' }}>
                            {log.reason || 'Marks updated'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 8: ACADEMIC ANALYTICS, SYLLABUS & CDC RESULTS (PHASE 11)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'ANALYTICS' && (
            <InstitutionAcademicAnalytics
              theme="emerald"
              roleTitle="School Administration Academic Intelligence"
              preloadedClasses={classes}
            />
          )}

          {/* Phase 12: Subscription & Licensing Tab */}
          {activeTab === 'SUBSCRIPTION' && (
            <div>
              {/* Alert Banners */}
              {entitlements?.status === 'EXPIRED' && (
                <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <AlertTriangle size={24} color="#dc2626" />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#991b1b', margin: 0 }}>
                      Institutional Subscription Expired
                    </h4>
                    <p style={{ fontSize: '12px', color: '#b91c1c', margin: '4px 0 0 0' }}>
                      Your school package expired on {entitlements?.endDate ? new Date(entitlements.endDate).toLocaleDateString() : 'recently'}. 
                      Access is currently restricted to read-only. <strong>Data Protection Guarantee:</strong> All student profiles, enrollment, attendance, and exam marks are 100% preserved and will never be deleted. Please pay the outstanding invoice to restore full operational access.
                    </p>
                  </div>
                </div>
              )}

              {entitlements?.isGracePeriod && (
                <div style={{ padding: '16px 20px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Bell size={24} color="#6d5bd0" />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#3b2f8f', margin: 0 }}>
                      15-Day Renewal Grace Period Active
                    </h4>
                    <p style={{ fontSize: '12px', color: '#4c3fa8', margin: '4px 0 0 0' }}>
                      Your academic subscription term has ended, but Nepal Edu Ecosystem extends uninterrupted access until{' '}
                      <strong>{entitlements?.gracePeriodEndsAt ? new Date(entitlements.gracePeriodEndsAt).toLocaleDateString() : 'soon'}</strong>. 
                      Please settle your annual renewal invoice below to maintain continuous service without interruption.
                    </p>
                  </div>
                </div>
              )}

              {/* Status Header Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Active Package</span>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '800',
                      background: entitlements?.status === 'ACTIVE' ? '#e6f7f0' : '#fef2f2',
                      color: entitlements?.status === 'ACTIVE' ? '#117a6b' : '#dc2626'
                    }}>
                      {entitlements?.status || 'ACTIVE'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                    {entitlements?.package?.name || 'No active plan'}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#117a6b', fontWeight: '700', marginTop: '4px' }}>
                    NPR {Number(entitlements?.package?.priceNpr || 0).toLocaleString()} / {entitlements?.package?.billingCycle || 'ANNUAL'}
                  </p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Valid Till / Term</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '8px 0 0 0' }}>
                    {entitlements?.endDate ? new Date(entitlements.endDate).toLocaleDateString() : 'N/A'}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#5f736f', marginTop: '4px' }}>
                    {entitlements?.daysRemaining !== undefined ? `${entitlements.daysRemaining} days remaining` : 'Annual Contract'}
                  </p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Student Enrollment Quota</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '8px 0 0 0' }}>
                    {studentUsage} / {entitlements?.quotas?.maxStudents ?? '—'}
                  </h3>
                  <div style={{ width: '100%', height: '6px', background: '#ebf5f1', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${entitlements?.quotas?.maxStudents ? Math.min(100, Math.round((studentUsage / entitlements.quotas.maxStudents) * 100)) : 0}%`,
                      height: '100%',
                      background: '#117a6b'
                    }} />
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Faculty Seats Quota</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '8px 0 0 0' }}>
                    {teachers.length || 0} / {entitlements?.quotas?.maxTeachers ?? '—'}
                  </h3>
                  <div style={{ width: '100%', height: '6px', background: '#ebf5f1', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${entitlements?.quotas?.maxTeachers ? Math.min(100, Math.round((teachers.length / entitlements.quotas.maxTeachers) * 100)) : 0}%`,
                      height: '100%',
                      background: '#2563eb'
                    }} />
                  </div>
                </div>
              </div>

              {/* Included Classes & Grade Range */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                      Licensed Nepal Curriculum Grades
                    </h4>
                    <p style={{ fontSize: '12px', color: '#5f736f', margin: '3px 0 0 0' }}>
                      Classes licensed under your school's {entitlements?.package?.name || 'current'} subscription plan
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', background: '#effaf6', color: '#166534', padding: '4px 10px', borderRadius: '6px' }}>
                    {entitlements?.grades ? `Classes ${entitlements.grades.minGrade} to ${entitlements.grades.maxGrade} Authorized` : 'No class licence information'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => {
                    const isAllowed = (entitlements?.grades?.allowedGrades || []).includes(g);
                    return (
                      <div
                        key={g}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '8px',
                          border: isAllowed ? '2px solid #117a6b' : '1px dashed #cfdcd8',
                          background: isAllowed ? '#e6f7f0' : '#f4faf8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: isAllowed ? 1 : 0.45
                        }}
                      >
                        {isAllowed ? <CheckCircle size={16} color="#117a6b" /> : <ShieldAlert size={16} color="#8da19d" />}
                        <span style={{ fontSize: '13px', fontWeight: '700', color: isAllowed ? '#0f4c4a' : '#5f736f' }}>
                          Class {g}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Features & Modules Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={18} color="#2563eb" />
                    </div>
                    <h5 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>Digital Textbooks & CDC</h5>
                  </div>
                  <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                    Official Nepal Curriculum CDC textbooks in English & Nepali medium with high-performance PDF.js reader.
                  </p>
                  <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: '700', color: '#117a6b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Full Access Included
                  </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#e6f7f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Presentation size={18} color="#117a6b" />
                    </div>
                    <h5 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>Interactive Smart Board & Sims</h5>
                  </div>
                  <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                    Interactive Flat Panel whiteboard hub with PhET/HTML5 science & math simulations embedded.
                  </p>
                  <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: '700', color: '#117a6b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Full Access Included
                  </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#f5f3ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={18} color="#7c3aed" />
                    </div>
                    <h5 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>Analytics, Exams & AI</h5>
                  </div>
                  <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                    Real-time Principal and Teacher dashboards, CDC 8-point marksheet generator, and Nepal RAG AI assistant.
                  </p>
                  <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: '700', color: '#117a6b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Full Access Included
                  </div>
                </div>
              </div>

              {/* Invoices & Billing Ledger */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #ebf5f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                      Institutional Invoices & Payment Ledger
                    </h4>
                    <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                      Official billing statements with online settlement via Khalti, eSewa or Direct Bank Deposit
                    </p>
                  </div>
                  <button
                    onClick={loadSchoolSubscription}
                    style={{ padding: '6px 14px', background: '#f4faf8', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Refresh Invoices
                  </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#4b605b' }}>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Invoice #</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Billing Period</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Amount (NPR)</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Due Date</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Status</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schoolInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#5f736f' }}>
                          No institutional invoices generated yet.
                        </td>
                      </tr>
                    ) : (
                      schoolInvoices.map((inv: any) => (
                        <tr key={inv._id || inv.id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                          <td style={{ padding: '14px 20px', fontWeight: '700', color: '#0e3e3b' }}>
                            {inv.invoiceNumber}
                          </td>
                          <td style={{ padding: '14px 20px', color: '#4b605b' }}>
                            {new Date(inv.periodStart || inv.createdAt).toLocaleDateString()} – {new Date(inv.periodEnd || inv.dueDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '14px 20px', fontWeight: '800', color: '#0e3e3b' }}>
                            NPR {Number(inv.amountNpr || inv.totalAmountNpr || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 20px', color: '#5f736f' }}>
                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '800',
                              background: inv.status === 'PAID' ? '#e6f7f0' : inv.status === 'OVERDUE' ? '#fef2f2' : '#f5f3ff',
                              color: inv.status === 'PAID' ? '#117a6b' : inv.status === 'OVERDUE' ? '#dc2626' : '#6d5bd0'
                            }}>
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            {inv.status === 'PAID' ? (
                              <span style={{ fontSize: '12px', color: '#117a6b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={14} /> Settled
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedInvoiceToPay(inv);
                                  setIsPayModalOpen(true);
                                }}
                                style={{
                                  padding: '6px 14px',
                                  background: '#117a6b',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                Pay Invoice
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Data Preservation Guarantee Banner */}
              <div style={{ background: '#f4faf8', borderRadius: '12px', border: '1px solid #dcebe6', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ShieldCheck size={32} color="#117a6b" />
                <div>
                  <h5 style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                    Nepal Digital Education Preservation Policy
                  </h5>
                  <p style={{ fontSize: '12px', color: '#4b605b', margin: '4px 0 0 0' }}>
                    Student records, grade transcripts, attendance logs, and academic historical archives are protected under sovereign educational guidelines. Records are permanently preserved even during payment lapses, grace periods, or expired subscription statuses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 10: LEARNING ACCESS & FEATURE CONFIGURATION (SECTION 2)
             ══════════════════════════════════════════════════════════════ */}
          {/* ══════════════════════════════════════════════════════════════════
              VIEW: ANNOUNCEMENTS MANAGEMENT
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'ANNOUNCEMENTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Post New Announcement Card */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Megaphone size={20} color="#117a6b" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Broadcast Institutional Announcement</h3>
                </div>
                <p style={{ fontSize: '13px', color: '#5f736f', marginBottom: '20px' }}>
                  Publish school-wide announcements, examination circulars, or holiday notices. Published items appear instantly in student and teacher dashboards.
                </p>

                <form onSubmit={handlePostSchoolAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Announcement Title</label>
                      <input
                        type="text"
                        placeholder="e.g. First Terminal Examination Schedule & Practical Assessment Guidelines"
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Target Audience</label>
                      <select
                        value={annAudience}
                        onChange={(e) => setAnnAudience(e.target.value as any)}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                      >
                        <option value="ALL">Entire Institution (Everyone)</option>
                        <option value="STUDENTS">Students Only</option>
                        <option value="TEACHERS">Teachers & Faculty Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Announcement Body & Instructions</label>
                    <textarea
                      rows={4}
                      placeholder="Write the full notice text here. Include dates, timings, or special guidelines for students and faculty..."
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={isAnnPosting}
                      style={{
                        padding: '10px 24px',
                        background: '#117a6b',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(17, 122, 107, 0.2)',
                      }}
                    >
                      <Megaphone size={15} /> {isAnnPosting ? 'Broadcasting...' : 'Publish Announcement Now'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Published Announcements List */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Active Institutional Bulletins</h3>
                  <span style={{ fontSize: '12px', fontWeight: '800', background: '#e6f7f0', color: '#117a6b', padding: '4px 10px', borderRadius: '8px' }}>
                    {schoolAnnouncements.length} Published Notices
                  </span>
                </div>

                {schoolAnnouncements.length === 0 ? (
                  <p style={{ color: '#5f736f', fontSize: '13px' }}>No announcements published yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {schoolAnnouncements.map((ann: any, i: number) => (
                      <div
                        key={ann.id || ann._id || i}
                        style={{
                          padding: '18px 20px',
                          background: '#f4faf8',
                          border: '1px solid #dcebe6',
                          borderRadius: '12px',
                          borderLeft: '4px solid #117a6b',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#117a6b', background: '#e6f7f0', padding: '2px 8px', borderRadius: '4px' }}>
                            {ann.targetAudience || 'ALL'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#5f736f' }}>
                            {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 6px 0' }}>
                          {ann.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#4b605b', lineHeight: '1.6', margin: 0 }}>
                          {ann.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'FEATURE_ACCESS' && (
            <div>
              {/* Header & Sub-navigation */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '16px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sliders size={20} color="#117a6b" /> Learning Access & Feature Configuration
                    </h3>
                    <p style={{ fontSize: '12px', color: '#5f736f', margin: '3px 0 0 0' }}>
                      Complete control over student dashboard, online submissions, quizzes, simulations, smart boards & AI co-pilots across Classes 1–12.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setIsBulkModalOpen(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: '#117a6b',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <CheckSquare size={14} /> Bulk Class Config
                    </button>
                    <button
                      onClick={loadFeatureAccessData}
                      disabled={featureLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: '#f4faf8',
                        color: '#0e3e3b',
                        border: '1px solid #cfdcd8',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <RefreshCw size={14} className={featureLoading ? 'animate-spin' : ''} /> Refresh
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #ebf5f1', paddingTop: '12px' }}>
                  {[
                    { id: 'MATRIX', label: 'Classes 1–12 Matrix' },
                    { id: 'OVERVIEW', label: 'Feature Overview' },
                    { id: 'STUDENT_DASHBOARD', label: 'Student Dashboard' },
                    { id: 'ASSIGNMENTS', label: 'Assignments' },
                    { id: 'SUBMISSION', label: 'Online Submissions' },
                    { id: 'QUIZZES', label: 'Quizzes' },
                    { id: 'SMARTBOARD', label: 'Smart Board' },
                    { id: 'SIMULATIONS', label: 'Simulations' },
                    { id: 'AI_ASSISTANT', label: 'AI Assistant' },
                    { id: 'TEXTBOOKS', label: 'Digital Textbooks' },
                    { id: 'SECTION_SETTINGS', label: 'Section Overrides' },
                    { id: 'DEVICE_ACCESS', label: 'Student Device Profiles' },
                    { id: 'HISTORY', label: 'Configuration History' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setFeatureSubTab(tab.id as any);
                        if (tab.id === 'SECTION_SETTINGS' && classes.length && !selectedClassForFeatures) {
                          loadClassSettings(classes[0].id || classes[0]._id);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: featureSubTab === tab.id ? '1px solid #117a6b' : '1px solid #dcebe6',
                        background: featureSubTab === tab.id ? '#e6f7f0' : '#ffffff',
                        color: featureSubTab === tab.id ? '#117a6b' : '#5f736f',
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 1: CLASSES 1-12 VISUAL CONFIGURATION MATRIX
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'MATRIX' && (
                <div>
                  {/* Matrix Controls & Search */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b' }}>
                        Visual Feature Access Matrix (Classes 1–12)
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#5f736f' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#117a6b' }}></span> ON
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span> OFF
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span> Inherited
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6d5bd0' }}></span> Tier Ceiling
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Search class or stream..."
                        value={featureSearchQuery}
                        onChange={(e) => setFeatureSearchQuery(e.target.value)}
                        style={{ padding: '6px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px', width: '200px' }}
                      />
                    </div>
                  </div>

                  {/* Matrix Table */}
                  <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#4b605b' }}>
                          <th style={{ padding: '12px 16px', fontWeight: '800' }}>Class</th>
                          <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center' }}>Student Portal</th>
                          <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center' }}>Assignments</th>
                          <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center' }}>Online Submission</th>
                          <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center' }}>Quizzes</th>
                          <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center' }}>Online Quizzes</th>
                          <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center' }}>CDC Books</th>
                          <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center' }}>Simulations</th>
                          <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center' }}>AI Co-Pilot</th>
                          <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center' }}>Smart Board</th>
                          <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center' }}>Device Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!featureMatrix?.classes ? (
                          <tr>
                            <td colSpan={11} style={{ padding: '32px', textAlign: 'center', color: '#5f736f' }}>
                              Loading class feature matrix...
                            </td>
                          </tr>
                        ) : (
                          featureMatrix.classes
                            .filter((c: any) =>
                              !featureSearchQuery ||
                              c.className.toLowerCase().includes(featureSearchQuery.toLowerCase()) ||
                              c.stream.toLowerCase().includes(featureSearchQuery.toLowerCase())
                            )
                            .map((row: any) => {
                              const f = row.features || {};
                              return (
                                <tr key={row.classId} style={{ borderBottom: '1px solid #ebf5f1', background: row.isGradeSubscribed ? '#ffffff' : '#f5f3ff' }}>
                                  {/* Class Name */}
                                  <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0e3e3b' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span>{row.className}</span>
                                      {row.stream !== 'GENERAL' && (
                                        <span style={{ fontSize: '10px', padding: '1px 5px', background: '#eff6ff', color: '#2563eb', borderRadius: '3px' }}>
                                          {row.stream}
                                        </span>
                                      )}
                                      {!row.isGradeSubscribed && (
                                        <span style={{ fontSize: '10px', padding: '1px 5px', background: '#ede9fe', color: '#4c3fa8', borderRadius: '3px' }}>
                                          Unlicensed
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '2px' }}>
                                      {row.sectionCount} {row.sectionCount === 1 ? 'Section' : 'Sections'}
                                    </div>
                                  </td>

                                  {/* Feature Columns with Interactive Toggles */}
                                  {[
                                    { key: 'STUDENT_DASHBOARD', name: 'Dashboard' },
                                    { key: 'ASSIGNMENTS', name: 'Assignments' },
                                    { key: 'ASSIGNMENTS_ONLINE_SUBMISSION', name: 'Online Submit' },
                                    { key: 'QUIZZES', name: 'Quizzes' },
                                    { key: 'QUIZZES_ONLINE_ACCESS', name: 'Online Quiz' },
                                    { key: 'NOTES', name: 'Notes' },
                                    { key: 'MATERIALS', name: 'Materials' },
                                    { key: 'PRESENTATIONS', name: 'Presentations' },
                                    { key: 'VIDEOS', name: 'Videos' },
                                    { key: 'DIGITAL_TEXTBOOKS', name: 'Textbooks' },
                                    { key: 'SIMULATIONS', name: 'Simulations' },
                                    { key: 'AI_ASSISTANT', name: 'AI' },
                                    { key: 'SMARTBOARD', name: 'Smart Board' },
                                  ].map((col) => {
                                    const feat = f[col.key] || { enabled: false, source: 'PLATFORM_DEFAULT', isEditable: true };
                                    const isSubBlocked = feat.source === 'SUBSCRIPTION_BLOCKED';
                                    const isExplicit = feat.source === 'EXPLICIT_CLASS';

                                    return (
                                      <td key={col.key} style={{ padding: '8px 10px', textAlign: 'center' }}>
                                        {isSubBlocked ? (
                                          <span
                                            title="Feature or grade blocked by school's active subscription package"
                                            style={{
                                              padding: '4px 8px',
                                              borderRadius: '4px',
                                              fontSize: '10px',
                                              fontWeight: '800',
                                              background: '#ede9fe',
                                              color: '#4c3fa8',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '3px'
                                            }}
                                          >
                                            <Lock size={10} /> Locked
                                          </span>
                                        ) : (
                                          <button
                                            onClick={() => handleToggleClassFeature(row.classId, col.key, feat.enabled)}
                                            title={`Click to toggle ${col.name} for ${row.className} (${feat.source})`}
                                            style={{
                                              padding: '4px 9px',
                                              borderRadius: '4px',
                                              fontSize: '11px',
                                              fontWeight: '800',
                                              border: 'none',
                                              cursor: 'pointer',
                                              background: feat.enabled
                                                ? (isExplicit ? '#117a6b' : '#e6f7f0')
                                                : (isExplicit ? '#ef4444' : '#ebf5f1'),
                                              color: feat.enabled
                                                ? (isExplicit ? '#ffffff' : '#117a6b')
                                                : (isExplicit ? '#ffffff' : '#5f736f'),
                                              transition: 'all 0.15s ease'
                                            }}
                                          >
                                            {feat.enabled ? 'ON' : 'OFF'}
                                            {isExplicit && ' *'}
                                          </button>
                                        )}
                                      </td>
                                    );
                                  })}

                                  {/* Device Profile */}
                                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                    <span style={{
                                      fontSize: '10px',
                                      fontWeight: '700',
                                      padding: '3px 6px',
                                      borderRadius: '4px',
                                      background: row.deviceType === 'PERSONAL_SMARTPHONE' ? '#e6f7f0' : '#f4faf8',
                                      color: row.deviceType === 'PERSONAL_SMARTPHONE' ? '#117a6b' : '#5f736f'
                                    }}>
                                      {row.deviceType.replace('_', ' ')}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <p style={{ fontSize: '11px', color: '#5f736f', marginTop: '10px' }}>
                    * Asterisk indicates an explicit class-level override. Cells without an asterisk inherit the setting from institution-wide defaults. Locked cells indicate features restricted by the school's commercial subscription tier.
                  </p>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 2: OVERVIEW & INSTITUTION ROOT DEFAULTS
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'OVERVIEW' && (
                <div>
                  {/* Summary KPI Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Classes with Student Portal</span>
                      <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0e3e3b', margin: '6px 0 0 0' }}>
                        {featureMatrix?.classes?.filter((c: any) => c.features?.STUDENT_DASHBOARD?.enabled).length || 0} / 12
                      </h3>
                      <p style={{ fontSize: '11px', color: '#117a6b', margin: '4px 0 0 0' }}>Digital learning authorized</p>
                    </div>

                    <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Online Submissions Active</span>
                      <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0e3e3b', margin: '6px 0 0 0' }}>
                        {featureMatrix?.classes?.filter((c: any) => c.features?.ASSIGNMENTS_ONLINE_SUBMISSION?.enabled).length || 0} Classes
                      </h3>
                      <p style={{ fontSize: '11px', color: '#2563eb', margin: '4px 0 0 0' }}>Digital homework collection</p>
                    </div>

                    <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Student AI Assistant</span>
                      <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0e3e3b', margin: '6px 0 0 0' }}>
                        {featureMatrix?.classes?.filter((c: any) => c.features?.AI_ASSISTANT?.enabled).length || 0} Classes
                      </h3>
                      <p style={{ fontSize: '11px', color: '#7c3aed', margin: '4px 0 0 0' }}>Nepal CDC RAG Grounded</p>
                    </div>

                    <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Smart Board Classroom Hub</span>
                      <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0e3e3b', margin: '6px 0 0 0' }}>
                        12 / 12 Classes
                      </h3>
                      <p style={{ fontSize: '11px', color: '#117a6b', margin: '4px 0 0 0' }}>All faculty interactive boards</p>
                    </div>
                  </div>

                  {/* Institution Defaults Cards */}
                  <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                          School-Wide Default Feature Policies
                        </h4>
                        <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                          These root policies are automatically inherited by all classes and sections unless explicitly overridden.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      {institutionFeatures.map((feat: any) => (
                        <div
                          key={feat.featureKey}
                          style={{
                            background: '#f4faf8',
                            border: '1px solid #dcebe6',
                            borderRadius: '10px',
                            padding: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ paddingRight: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h5 style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                                {feat.name}
                              </h5>
                              <span style={{ fontSize: '10px', padding: '1px 6px', background: '#dcebe6', borderRadius: '4px', color: '#4b605b', fontWeight: '700' }}>
                                {feat.category}
                              </span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#5f736f', margin: '4px 0 0 0' }}>
                              {feat.description}
                            </p>
                          </div>

                          <button
                            onClick={() => handleToggleInstitutionFeature(feat.featureKey, feat.enabled)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '800',
                              border: 'none',
                              cursor: 'pointer',
                              background: feat.enabled ? '#117a6b' : '#dcebe6',
                              color: feat.enabled ? '#ffffff' : '#5f736f'
                            }}
                          >
                            {feat.enabled ? 'ENABLED' : 'DISABLED'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 3: STUDENT DASHBOARD ACCESS (SECTION 4)
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'STUDENT_DASHBOARD' && (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#e6f7f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GraduationCap size={22} color="#117a6b" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Student Dashboard Access & Login Rights (Section 4)
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                        Configure whether students in specific classes are permitted to log in to their personal student portal.
                      </p>
                    </div>
                  </div>

                  {/* Account Protection Policy Note */}
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <ShieldCheck size={24} color="#2563eb" />
                    <p style={{ fontSize: '12px', color: '#1e40af', margin: 0 }}>
                      <strong>Strict Preservation Guarantee:</strong> Disabling student dashboard access restricts student online login only. It does <em>never</em> delete student accounts, admission numbers, attendance logs, or academic marks. Teachers and Principals retain full access to manage records.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {(featureMatrix?.classes || []).map((cls: any) => {
                      const isEnabled = cls.features?.STUDENT_DASHBOARD?.enabled;
                      return (
                        <div
                          key={cls.classId}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            border: isEnabled ? '2px solid #117a6b' : '1px solid #cfdcd8',
                            background: isEnabled ? '#effaf6' : '#f4faf8',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <h5 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>{cls.className}</h5>
                            <span style={{ fontSize: '11px', color: isEnabled ? '#117a6b' : '#5f736f' }}>
                              {isEnabled ? 'Portal Accessible' : 'Portal Disabled'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleClassFeature(cls.classId, 'STUDENT_DASHBOARD', isEnabled)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '800',
                              border: 'none',
                              cursor: 'pointer',
                              background: isEnabled ? '#117a6b' : '#cfdcd8',
                              color: isEnabled ? '#ffffff' : '#4b605b'
                            }}
                          >
                            {isEnabled ? 'ENABLE' : 'DISABLE'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 4: ASSIGNMENTS & HOMEWORK (SECTION 5)
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'ASSIGNMENTS' && (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={22} color="#2563eb" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Assignment Creation & Visibility Rules (Section 5)
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                        Specify whether teachers can create homework and whether students see pending tasks.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {[
                      { key: 'ASSIGNMENTS', name: 'Master Assignments Module', desc: 'Global toggle allowing homework creation across the institution.' },
                      { key: 'ASSIGNMENTS_CREATION', name: 'Teacher Assignment Authoring', desc: 'Allows faculty to formulate and post homework sets.' },
                      { key: 'ASSIGNMENTS_VISIBILITY', name: 'Student Task Visibility', desc: 'Permits students to view homework items on their dashboard.' },
                      { key: 'ASSIGNMENTS_DEADLINES', name: 'Strict Deadline Enforcement', desc: 'Locks submission or tags items as late after deadline.' },
                      { key: 'ASSIGNMENTS_LATE_SUBMISSION', name: 'Allow Late Submissions', desc: 'Permits students to hand in homework past the scheduled date.' },
                      { key: 'ASSIGNMENTS_FEEDBACK', name: 'Teacher Feedback & Score Visibility', desc: 'Enables students to view corrected marks and remarks.' },
                    ].map((item) => {
                      const instObj = institutionFeatures.find((f: any) => f.featureKey === item.key);
                      const enabled = instObj ? instObj.enabled : true;

                      return (
                        <div key={item.key} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #dcebe6', background: '#f4faf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ paddingRight: '12px' }}>
                            <h5 style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>{item.name}</h5>
                            <p style={{ fontSize: '12px', color: '#5f736f', margin: '3px 0 0 0' }}>{item.desc}</p>
                          </div>
                          <button
                            onClick={() => handleToggleInstitutionFeature(item.key, enabled)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '800',
                              border: 'none',
                              cursor: 'pointer',
                              background: enabled ? '#117a6b' : '#dcebe6',
                              color: enabled ? '#ffffff' : '#5f736f'
                            }}
                          >
                            {enabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 5: ONLINE SUBMISSION SETTINGS (SECTION 5)
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'SUBMISSION' && (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#fdf2f8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={22} color="#db2777" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Online Submission & File Upload Controls (Section 5)
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                        Choose whether students submit work digitally via file upload/text or bring physical notebooks to class.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                      { key: 'ASSIGNMENTS_ONLINE_SUBMISSION', name: 'Online Digital Submission', desc: 'When OFF, students must hand in work physically to teachers.' },
                      { key: 'ASSIGNMENTS_FILE_UPLOAD', name: 'File & Attachment Uploads', desc: 'Allows PDF, DOC, and camera photo uploads.' },
                      { key: 'ASSIGNMENTS_TEXT_SUBMISSION', name: 'Typed Text Submission', desc: 'Allows typing responses in the online student editor.' },
                    ].map((item) => {
                      const instObj = institutionFeatures.find((f: any) => f.featureKey === item.key);
                      const enabled = instObj ? instObj.enabled : false;

                      return (
                        <div key={item.key} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #dcebe6', background: '#f4faf8' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h5 style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>{item.name}</h5>
                            <button
                              onClick={() => handleToggleInstitutionFeature(item.key, enabled)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '800',
                                border: 'none',
                                cursor: 'pointer',
                                background: enabled ? '#117a6b' : '#dcebe6',
                                color: enabled ? '#ffffff' : '#5f736f'
                              }}
                            >
                              {enabled ? 'ON' : 'OFF'}
                            </button>
                          </div>
                          <p style={{ fontSize: '11px', color: '#5f736f', margin: 0 }}>{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 6: QUIZ CONFIGURATION (SECTION 6)
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'QUIZZES' && (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#e6f7f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={22} color="#117a6b" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Classroom & Online Quiz Controls (Section 6)
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                        Configure formative quizzes, timed testing, attempt limits, and instant result visibility.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {[
                      { key: 'QUIZZES', name: 'Quizzes Module', desc: 'Master toggle for formative and graded quizzes.' },
                      { key: 'QUIZZES_TEACHER_CREATE', name: 'Faculty Quiz Creation', desc: 'Allows teachers to write multiple-choice questions.' },
                      { key: 'QUIZZES_ONLINE_ACCESS', name: 'Online Student Quiz Taking', desc: 'Permits students to take tests on their own devices.' },
                      { key: 'QUIZZES_TIMED', name: 'Countdown Timed Quizzes', desc: 'Enforces strictly timed testing windows.' },
                      { key: 'QUIZZES_PRACTICE', name: 'Self-Paced Practice Mode', desc: 'Instant feedback without contributing to final GPA.' },
                      { key: 'QUIZZES_RESULT_VISIBILITY', name: 'Immediate Result Visibility', desc: 'Shows correct answers and explanations after submission.' },
                    ].map((item) => {
                      const instObj = institutionFeatures.find((f: any) => f.featureKey === item.key);
                      const enabled = instObj ? instObj.enabled : true;

                      return (
                        <div key={item.key} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #dcebe6', background: '#f4faf8' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h5 style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>{item.name}</h5>
                            <button
                              onClick={() => handleToggleInstitutionFeature(item.key, enabled)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '800',
                                border: 'none',
                                cursor: 'pointer',
                                background: enabled ? '#117a6b' : '#dcebe6',
                                color: enabled ? '#ffffff' : '#5f736f'
                              }}
                            >
                              {enabled ? 'ON' : 'OFF'}
                            </button>
                          </div>
                          <p style={{ fontSize: '11px', color: '#5f736f', margin: 0 }}>{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 7: SMART BOARD ACCESS (SECTION 8)
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'SMARTBOARD' && (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#e6f7f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Presentation size={22} color="#117a6b" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Smart Board Classroom Hub Access (Section 8)
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                        Teachers can utilize interactive whiteboard and canvas tools regardless of student portal status.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {(featureMatrix?.classes || []).map((cls: any) => {
                      const isEnabled = cls.features?.SMARTBOARD?.enabled;
                      return (
                        <div
                          key={cls.classId}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            border: isEnabled ? '2px solid #117a6b' : '1px solid #cfdcd8',
                            background: isEnabled ? '#effaf6' : '#f4faf8',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <h5 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>{cls.className}</h5>
                            <span style={{ fontSize: '11px', color: isEnabled ? '#117a6b' : '#5f736f' }}>
                              {isEnabled ? 'Board Active' : 'Board Disabled'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleClassFeature(cls.classId, 'SMARTBOARD', isEnabled)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '800',
                              border: 'none',
                              cursor: 'pointer',
                              background: isEnabled ? '#117a6b' : '#cfdcd8',
                              color: isEnabled ? '#ffffff' : '#4b605b'
                            }}
                          >
                            {isEnabled ? 'ENABLE' : 'DISABLE'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 8: SIMULATION ACCESS (SECTION 9)
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'SIMULATIONS' && (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f5f3ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={22} color="#7c3aed" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Science & Math Simulation Access (Section 9)
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                        Differentiate between student self-paced simulation access versus teacher classroom demonstration only.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {[
                      { key: 'SIMULATIONS', name: 'Simulations Laboratory', desc: 'Master switch for physics, chemistry, biology and math HTML5 labs.' },
                      { key: 'SIMULATIONS_STUDENT_ACCESS', name: 'Student Dashboard Access', desc: 'Allows students to launch simulations directly from home.' },
                      { key: 'SIMULATIONS_TEACHER_ONLY', name: 'Teacher Classroom Demonstration Only', desc: 'Restricts simulation execution exclusively to teacher workspaces.' },
                    ].map((item) => {
                      const instObj = institutionFeatures.find((f: any) => f.featureKey === item.key);
                      const enabled = instObj ? instObj.enabled : true;

                      return (
                        <div key={item.key} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #dcebe6', background: '#f4faf8' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h5 style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>{item.name}</h5>
                            <button
                              onClick={() => handleToggleInstitutionFeature(item.key, enabled)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '800',
                                border: 'none',
                                cursor: 'pointer',
                                background: enabled ? '#117a6b' : '#dcebe6',
                                color: enabled ? '#ffffff' : '#5f736f'
                              }}
                            >
                              {enabled ? 'ON' : 'OFF'}
                            </button>
                          </div>
                          <p style={{ fontSize: '11px', color: '#5f736f', margin: 0 }}>{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 9: AI ASSISTANT ACCESS (SECTION 10)
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'AI_ASSISTANT' && (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bell size={22} color="#2563eb" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Nepal CDC RAG AI Assistant Access (Section 10)
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                        Restrict student AI chat while maintaining teacher lesson authoring AI assistance.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {[
                      { key: 'AI_STUDENT_ACCESS', name: 'Student AI Tutoring', desc: 'Allows students to chat with the curriculum assistant from portal.' },
                      { key: 'AI_TEACHER_ACCESS', name: 'Teacher AI Co-Pilot', desc: 'Enables AI lesson planning, quiz generation, and answer key generation.' },
                      { key: 'AI_SMARTBOARD_ACCESS', name: 'Smart Board AI Assistant', desc: 'Permits teachers to summon AI co-pilot on the digital whiteboard.' },
                      { key: 'AI_NEPALI_LANGUAGE', name: 'Nepali Language AI Support', desc: 'Supports queries and textbook explanations in Devanagari script.' },
                      { key: 'AI_ENGLISH_LANGUAGE', name: 'English Language AI Support', desc: 'Supports queries and textbook explanations in English medium.' },
                    ].map((item) => {
                      const instObj = institutionFeatures.find((f: any) => f.featureKey === item.key);
                      const enabled = instObj ? instObj.enabled : true;

                      return (
                        <div key={item.key} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #dcebe6', background: '#f4faf8' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h5 style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>{item.name}</h5>
                            <button
                              onClick={() => handleToggleInstitutionFeature(item.key, enabled)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '800',
                                border: 'none',
                                cursor: 'pointer',
                                background: enabled ? '#117a6b' : '#dcebe6',
                                color: enabled ? '#ffffff' : '#5f736f'
                              }}
                            >
                              {enabled ? 'ON' : 'OFF'}
                            </button>
                          </div>
                          <p style={{ fontSize: '11px', color: '#5f736f', margin: 0 }}>{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 10: DIGITAL TEXTBOOK ACCESS
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'TEXTBOOKS' && (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#e6f7f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpenCheck size={22} color="#117a6b" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Official Nepal CDC Digital Textbook Access
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                        141 official textbooks streamed via high-performance byte-range PDF reader.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {[
                      { key: 'DIGITAL_TEXTBOOKS', name: 'Master Textbook Library', desc: 'Central access to all 141 CDC digital books in English & Nepali.' },
                      { key: 'TEXTBOOKS_STUDENT_ACCESS', name: 'Student Reader Access', desc: 'Allows enrolled students to read books from their dashboard.' },
                      { key: 'TEXTBOOKS_TEACHER_ACCESS', name: 'Teacher Classroom Projection', desc: 'Allows faculty to project textbooks onto Smart Boards.' },
                    ].map((item) => {
                      const instObj = institutionFeatures.find((f: any) => f.featureKey === item.key);
                      const enabled = instObj ? instObj.enabled : true;

                      return (
                        <div key={item.key} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #dcebe6', background: '#f4faf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ paddingRight: '12px' }}>
                            <h5 style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>{item.name}</h5>
                            <p style={{ fontSize: '12px', color: '#5f736f', margin: '3px 0 0 0' }}>{item.desc}</p>
                          </div>
                          <button
                            onClick={() => handleToggleInstitutionFeature(item.key, enabled)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '800',
                              border: 'none',
                              cursor: 'pointer',
                              background: enabled ? '#117a6b' : '#dcebe6',
                              color: enabled ? '#ffffff' : '#5f736f'
                            }}
                          >
                            {enabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 11: SECTION-WISE SETTINGS (SECTION 11)
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'SECTION_SETTINGS' && (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Section-Wise Feature Overrides (Section 11)
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                        Hierarchy: Institution Default → Class Override → Section Override. Override settings for Section A, Section B, etc.
                      </p>
                    </div>

                    {selectedSectionForFeatures && (
                      <button
                        onClick={() => handleResetOverrides('SECTION', selectedSectionForFeatures)}
                        style={{
                          padding: '6px 12px',
                          background: '#fff1f2',
                          color: '#e11d48',
                          border: '1px solid #fecdd3',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Reset Section to Inherited Defaults
                      </button>
                    )}
                  </div>

                  {/* Class and Section Dropdowns */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Select Class</label>
                      <select
                        value={selectedClassForFeatures}
                        onChange={(e) => {
                          loadClassSettings(e.target.value);
                          setSelectedSectionForFeatures('');
                        }}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                      >
                        <option value="">-- Choose Class --</option>
                        {classes.map((cls) => (
                          <option key={cls.id || cls._id} value={cls.id || cls._id}>
                            {cls.name || `Class ${cls.gradeNumber}`} ({cls.stream || 'GENERAL'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Select Section</label>
                      <select
                        value={selectedSectionForFeatures}
                        onChange={(e) => loadSectionSettings(e.target.value)}
                        disabled={!selectedClassForFeatures}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                      >
                        <option value="">-- Choose Section --</option>
                        {classes
                          .find((c) => (c.id || c._id) === selectedClassForFeatures)
                          ?.sections?.map((sec: any) => (
                            <option key={sec.id || sec._id} value={sec.id || sec._id}>
                              Section {sec.name} ({sec.medium || 'NEPALI'})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Section Features List */}
                  {selectedSectionForFeatures ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {sectionFeatureList.map((item) => (
                        <div
                          key={item.featureKey}
                          style={{
                            padding: '14px',
                            borderRadius: '8px',
                            border: item.isOverridden ? '2px solid #117a6b' : '1px solid #dcebe6',
                            background: item.isOverridden ? '#effaf6' : '#f4faf8',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <h5 style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>{item.name}</h5>
                              <span style={{
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                fontWeight: '700',
                                background: item.isOverridden ? '#e6f7f0' : '#eff6ff',
                                color: item.isOverridden ? '#117a6b' : '#2563eb'
                              }}>
                                {item.isOverridden ? 'SECTION OVERRIDE' : `INHERITED (${item.inheritedFrom})`}
                              </span>
                            </div>
                            <p style={{ fontSize: '11px', color: '#5f736f', margin: '3px 0 0 0' }}>{item.description}</p>
                          </div>

                          <button
                            onClick={() => handleToggleSectionFeature(selectedSectionForFeatures, item.featureKey, item.enabled)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '800',
                              border: 'none',
                              cursor: 'pointer',
                              background: item.enabled ? '#117a6b' : '#dcebe6',
                              color: item.enabled ? '#ffffff' : '#5f736f'
                            }}
                          >
                            {item.enabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#5f736f', background: '#f4faf8', borderRadius: '8px' }}>
                      Please select a Class and Section above to manage section-specific feature overrides.
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 12: STUDENT DEVICE ACCESS CONFIGURATION (SECTION 7)
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'DEVICE_ACCESS' && (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Smartphone size={22} color="#2563eb" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Student Device Availability Profiles (Section 7)
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                        Configure device availability: Personal Smartphones, Shared Devices, School Computers, or No Individual Devices.
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#f4faf8', border: '1px solid #dcebe6', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', color: '#4b605b', margin: 0 }}>
                      <strong>Planning Principle:</strong> Students without individual smartphones can fully participate in digital education through teacher-led Smart Board lessons and shared school computer sessions.
                    </p>
                  </div>

                  {/* Device Configuration Cards by Class */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {classes.map((cls) => {
                      const profile = deviceProfiles.find((dp: any) => dp.classId?._id === (cls.id || cls._id) || dp.classId === (cls.id || cls._id));
                      const currentDevice = profile?.deviceType || 'UNKNOWN';

                      return (
                        <div key={cls.id || cls._id} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #dcebe6', background: '#ffffff' }}>
                          <h5 style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 10px 0' }}>
                            {cls.name || `Class ${cls.gradeNumber}`}
                          </h5>

                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#5f736f', marginBottom: '4px' }}>
                            Primary Device Category
                          </label>
                          <select
                            value={currentDevice}
                            onChange={(e) => handleSaveDeviceProfile(cls.id || cls._id, e.target.value, profile?.internetAvailability || 'SCHOOL_ONLY')}
                            style={{ width: '100%', padding: '7px 10px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px', marginBottom: '10px' }}
                          >
                            <option value="PERSONAL_SMARTPHONE">Personal Smartphones</option>
                            <option value="SHARED_DEVICE">Shared Household Devices</option>
                            <option value="SCHOOL_COMPUTER">School Computer Lab Only</option>
                            <option value="NO_INDIVIDUAL_DEVICE">No Individual Devices (Smart Board Only)</option>
                            <option value="UNKNOWN">Device Availability Unknown</option>
                          </select>

                          <div style={{ fontSize: '11px', color: '#5f736f' }}>
                            Internet: {profile?.internetAvailability || 'School Campus WiFi'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  SUB-VIEW 13: CONFIGURATION CHANGE AUDIT LOG (SECTION 18)
                 ───────────────────────────────────────────────────────── */}
              {featureSubTab === 'HISTORY' && (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <History size={18} color="#117a6b" /> Feature Configuration Audit Trail (Section 18)
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                        Immutable record of all administrator policy updates, scope overrides, and timestamps.
                      </p>
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#4b605b' }}>
                        <th style={{ padding: '10px 14px', fontWeight: '700' }}>Timestamp</th>
                        <th style={{ padding: '10px 14px', fontWeight: '700' }}>Scope</th>
                        <th style={{ padding: '10px 14px', fontWeight: '700' }}>Affected Target</th>
                        <th style={{ padding: '10px 14px', fontWeight: '700' }}>Feature</th>
                        <th style={{ padding: '10px 14px', fontWeight: '700' }}>Setting Change</th>
                        <th style={{ padding: '10px 14px', fontWeight: '700' }}>Admin</th>
                        <th style={{ padding: '10px 14px', fontWeight: '700' }}>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {featureHistory.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#5f736f' }}>
                            No feature configuration changes logged yet.
                          </td>
                        </tr>
                      ) : (
                        featureHistory.map((h: any) => (
                          <tr key={h.id || h._id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                            <td style={{ padding: '10px 14px', color: '#5f736f' }}>
                              {new Date(h.createdAt).toLocaleString()}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ fontSize: '10px', padding: '2px 6px', background: '#dcebe6', borderRadius: '4px', fontWeight: '700' }}>
                                {h.scope}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0e3e3b' }}>
                              {h.affectedScopeDescription}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#2563eb', fontWeight: '700' }}>
                              {h.featureKey}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '800',
                                background: h.newSetting ? '#e6f7f0' : '#fef2f2',
                                color: h.newSetting ? '#117a6b' : '#dc2626'
                              }}>
                                {h.previousSetting === null ? 'INIT' : h.previousSetting ? 'ON' : 'OFF'} → {h.newSetting ? 'ON' : 'OFF'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', color: '#2f4f4c' }}>
                              {h.changedBy?.fullName || 'School Admin'}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#5f736f' }}>
                              {h.reason || 'Manual update'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── SCHOOL ADMIN PROFILE & SECURITY ────────────────────────── */}
          {activeTab === 'PROFILE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px' }}>
              {/* Executive Header Card */}
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
                        width: '68px',
                        height: '68px',
                        borderRadius: '16px',
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
                      {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                          {user?.fullName || 'Dhambojhi School Administrator'}
                        </h2>
                        <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                          Chief Operational Administrator
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', opacity: 0.9, lineHeight: 1.4 }}>
                        Institutional Administrator • EMIS: {dashboardData?.institution?.emisCode || user?.institutionCode || '570010001'}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                        {dashboardData?.institution?.name || 'Dhambojhi Higher Secondary School'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    style={{
                      padding: '8px 16px',
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

              {/* Sub-tab navigation */}
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
                  <School size={16} /> Operational Profile
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
              </div>

              {/* DETAILS TAB */}
              {profileActiveTab === 'DETAILS' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <School size={18} color="#117a6b" /> Institution Overview
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Institution Name:</span>
                        <span style={{ fontWeight: '700', color: '#0e3e3b' }}>{dashboardData?.institution?.name || 'Dhambojhi Higher Secondary School'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>EMIS Identifier:</span>
                        <span style={{ fontWeight: '700', color: '#0e3e3b', fontFamily: 'monospace' }}>{dashboardData?.institution?.emisCode || user?.institutionCode || '570010001'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Admin Username:</span>
                        <span style={{ fontWeight: '700', color: '#117a6b', fontFamily: 'monospace' }}>{user?.username || 'dhambojhi_admin'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Registered Faculty:</span>
                        <span style={{ fontWeight: '700', color: '#0e3e3b' }}>{teachers.length} Active Teachers</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#5f736f' }}>Classes & Sections:</span>
                        <span style={{ fontWeight: '700', color: '#117a6b' }}>{classes.length} Classes (1–12)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#117a6b" /> Administrative Controls
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Role Authority:</span>
                        <span style={{ fontWeight: '700', color: '#0e3e3b' }}>School Operations & Academic Setup</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Class Teacher Designation:</span>
                        <span style={{ fontWeight: '700', color: '#117a6b' }}>Fully Authorized</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ebf5f1', paddingBottom: '8px' }}>
                        <span style={{ color: '#5f736f' }}>Multi-Tenant Security:</span>
                        <span style={{ fontWeight: '700', color: '#117a6b' }}>Isolated Database Sandbox</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#5f736f' }}>CDC Standard Compliance:</span>
                        <span style={{ fontWeight: '700', color: '#117a6b' }}>Verified Nepal 2078 Evaluation</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {profileActiveTab === 'SECURITY' && (
                <div style={{ maxWidth: '580px', background: '#ffffff', borderRadius: '16px', border: '1px solid #dcebe6', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Key size={22} color="#117a6b" />
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                      Change Administrator Password
                    </h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#5f736f', margin: '0 0 20px 0' }}>
                    Maintain strict security for your institution's administrative controls.
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

                      {newPasswordInput && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                            <div style={{ flex: 1, borderRadius: '2px', background: newPasswordInput.length >= 6 ? '#22c55e' : '#ef4444' }} />
                            <div style={{ flex: 1, borderRadius: '2px', background: newPasswordInput.length >= 8 ? '#22c55e' : '#dcebe6' }} />
                            <div style={{ flex: 1, borderRadius: '2px', background: /[0-9]/.test(newPasswordInput) && newPasswordInput.length >= 8 ? '#22c55e' : '#dcebe6' }} />
                          </div>
                          <span style={{ fontSize: '11px', color: newPasswordInput.length < 6 ? '#ef4444' : '#15803d', fontWeight: '700' }}>
                            {newPasswordInput.length < 6 ? 'Too short (min 6 chars)' : newPasswordInput.length < 8 ? 'Acceptable strength' : 'Strong Password'}
                          </span>
                        </div>
                      )}
                    </div>

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
                      <Check size={16} />
                      {passwordChangeLoading ? 'Updating Password...' : 'Save New Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Teacher */}
      {isTeacherModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '16px', maxWidth: '480px', width: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Register New Teacher</h3>
            <form onSubmit={handleAddTeacher}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Full Name (English)</label>
                <input
                  type="text"
                  required
                  value={newTeacher.fullName}
                  onChange={(e) => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Username</label>
                <input
                  type="text"
                  required
                  value={newTeacher.username}
                  onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Password</label>
                <input
                  type="password"
                  required
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ebf5f1', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#117a6b', color: '#ffffff', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                >
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll Student (Individual) */}
      {isStudentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '16px', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#117a6b' }}>
                <GraduationCap size={22} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>Enroll New Student</h3>
              </div>
              <button onClick={() => setIsStudentModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8da19d' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                  Full Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={newStudent.fullName}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoUsername = name.trim().toLowerCase().replace(/\s+/g, '.') + (newStudent.rollNumber ? `.${newStudent.rollNumber}` : '');
                    setNewStudent({ ...newStudent, fullName: name, username: newStudent.username ? newStudent.username : autoUsername });
                  }}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                  Full Name (Nepali)
                </label>
                <input
                  type="text"
                  placeholder="e.g. आरव शर्मा"
                  value={newStudent.fullNameNepali || ''}
                  onChange={(e) => setNewStudent({ ...newStudent, fullNameNepali: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Target Class & Section *
                  </label>
                  <select
                    required
                    value={newStudent.sectionId}
                    onChange={(e) => setNewStudent({ ...newStudent, sectionId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', background: '#ffffff' }}
                  >
                    <option value="">-- Select Class Section --</option>
                    {classes.map((cls: any) =>
                      (cls.sections || []).map((sec: any) => (
                        <option key={sec.id || sec._id} value={sec.id || sec._id}>
                          Class {cls.gradeNumber} {cls.name ? `(${cls.name})` : ''} — Section {sec.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Roll No *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newStudent.rollNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNumber: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Admission Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ADM-2083-001"
                    value={newStudent.admissionNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, admissionNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Digital Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. aarav.sharma"
                    value={newStudent.username}
                    onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kishor Sharma"
                    value={newStudent.guardianName}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Guardian Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9848011223"
                    value={newStudent.guardianPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianPhone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                  Initial Password
                </label>
                <input
                  type="password"
                  value={newStudent.password}
                  placeholder="Leave blank to generate one"
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
                <span style={{ fontSize: '11px', color: '#5f736f', marginTop: '2px', display: 'block' }}>Blank = a random one-time password is generated and shown after saving</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ebf5f1', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: '#117a6b', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Configure New Class */}
      {isClassModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '16px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#117a6b' }}>
                <Layers size={22} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>Configure Academic Class</h3>
              </div>
              <button onClick={() => setIsClassModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8da19d' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                  Grade Number (1–12) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={12}
                  value={newClass.gradeNumber}
                  onChange={(e) => {
                    const g = Number(e.target.value);
                    setNewClass({
                      ...newClass,
                      gradeNumber: g,
                      name: `Class ${g}`,
                    });
                  }}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                  Class Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 or Grade 11 - Science"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                  Curriculum Board
                </label>
                <select
                  value={newClass.board}
                  onChange={(e) => setNewClass({ ...newClass, board: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', background: '#ffffff' }}
                >
                  <option value="Nepal CDC">Nepal CDC (National Curriculum)</option>
                  <option value="National Examination Board (NEB)">National Examination Board (NEB +2)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                  Academic Stream
                </label>
                <select
                  value={newClass.stream}
                  onChange={(e) => setNewClass({ ...newClass, stream: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', background: '#ffffff' }}
                >
                  <option value="GENERAL">General Stream (Grades 1–10)</option>
                  <option value="SCIENCE">+2 Science Stream</option>
                  <option value="MANAGEMENT">+2 Management Stream</option>
                  <option value="HUMANITIES">+2 Humanities Stream</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ebf5f1', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: '#117a6b', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Section to Class */}
      {isSectionModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '16px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#117a6b' }}>
                <Plus size={22} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>Add Section to Class</h3>
              </div>
              <button onClick={() => setIsSectionModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8da19d' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSection} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                  Target Class *
                </label>
                <select
                  required
                  value={newSection.classId}
                  onChange={(e) => setNewSection({ ...newSection, classId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', background: '#ffffff' }}
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id || cls._id} value={cls.id || cls._id}>
                      Class {cls.gradeNumber} — {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Section Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A, B, or Green"
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Classroom / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 101"
                    value={newSection.roomNumber || ''}
                    onChange={(e) => setNewSection({ ...newSection, roomNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Medium of Instruction
                  </label>
                  <select
                    value={newSection.medium}
                    onChange={(e) => setNewSection({ ...newSection, medium: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', background: '#ffffff' }}
                  >
                    <option value="BILINGUAL">Bilingual</option>
                    <option value="ENGLISH">English Medium (EMI)</option>
                    <option value="NEPALI">Nepali Medium (NMI)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Capacity
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={newSection.capacity}
                    onChange={(e) => setNewSection({ ...newSection, capacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ebf5f1', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: '#117a6b', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Examination (Phase 9) */}
      {isExamModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '16px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#117a6b', marginBottom: '8px' }}>
              <Award size={20} />
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Schedule Academic Examination</h3>
            </div>
            <p style={{ fontSize: '12px', color: '#5f736f', marginBottom: '20px' }}>
              Configure unit tests, terminal, or final board examinations across Classes 1–12.
            </p>

            <form onSubmit={handleCreateExam}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Examination Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. First Terminal Examination"
                  value={newExam.name}
                  onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Exam Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EXAM-TERM-1"
                    value={newExam.code}
                    onChange={(e) => setNewExam({ ...newExam, code: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Exam Type</label>
                  <select
                    value={newExam.examType}
                    onChange={(e) => setNewExam({ ...newExam, examType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="TERMINAL">Terminal Examination</option>
                    <option value="UNIT_TEST">Unit Test</option>
                    <option value="MONTHLY_TEST">Monthly Test</option>
                    <option value="FINAL">Final Board Examination</option>
                    <option value="PRACTICAL">Practical Examination</option>
                    <option value="INTERNAL_ASSESSMENT">Internal Assessment</option>
                    <option value="CUSTOM">Custom Examination</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Start Date</label>
                  <input
                    type="date"
                    required
                    value={newExam.startDate}
                    onChange={(e) => setNewExam({ ...newExam, startDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>End Date</label>
                  <input
                    type="date"
                    required
                    value={newExam.endDate}
                    onChange={(e) => setNewExam({ ...newExam, endDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ebf5f1', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', background: '#117a6b', color: '#ffffff', borderRadius: '6px', fontWeight: '700', fontSize: '13px' }}
                >
                  Schedule Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Period Slot Modal */}

      {/* Assign Substitute Teacher Modal */}

      {/* Pay Invoice Modal (Phase 12: Payment Gateways) */}
      {isPayModalOpen && selectedInvoiceToPay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(14, 62, 59, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>Pay School Invoice</h3>
                <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>Invoice: {selectedInvoiceToPay.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#8da19d', cursor: 'pointer', fontSize: '20px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#f4faf8', padding: '16px', borderRadius: '8px', border: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#5f736f' }}>Total Payable Amount</span>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0e3e3b', margin: '2px 0 0 0' }}>
                    NPR {Number(selectedInvoiceToPay.amountNpr || selectedInvoiceToPay.totalAmountNpr || 0).toLocaleString()}
                  </h3>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', background: '#e6f7f0', color: '#117a6b', padding: '4px 8px', borderRadius: '4px' }}>
                  Institutional License
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                  Select Nepal Payment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('KHALTI')}
                    style={{
                      padding: '14px 10px',
                      borderRadius: '8px',
                      border: selectedGateway === 'KHALTI' ? '2px solid #5c2d91' : '1px solid #cfdcd8',
                      background: selectedGateway === 'KHALTI' ? '#f5f0fb' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#5c2d91' }}>Khalti</div>
                    <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '2px' }}>Digital Wallet</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('ESEWA')}
                    style={{
                      padding: '14px 10px',
                      borderRadius: '8px',
                      border: selectedGateway === 'ESEWA' ? '2px solid #60bb46' : '1px solid #cfdcd8',
                      background: selectedGateway === 'ESEWA' ? '#f2f9f0' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#60bb46' }}>eSewa</div>
                    <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '2px' }}>Mobile Wallet</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('BANK_TRANSFER')}
                    style={{
                      padding: '14px 10px',
                      borderRadius: '8px',
                      border: selectedGateway === 'BANK_TRANSFER' ? '2px solid #2563eb' : '1px solid #cfdcd8',
                      background: selectedGateway === 'BANK_TRANSFER' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb' }}>Bank Deposit</div>
                    <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '2px' }}>Direct Transfer</div>
                  </button>
                </div>
              </div>

              {selectedGateway === 'BANK_TRANSFER' && (
                <div style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px', color: '#1e40af' }}>
                  <strong>Account Details:</strong><br />
                  Bank: Rastriya Banijya Bank / Nabil Bank Ltd.<br />
                  A/C Name: Nepal Digital Education Platform Ltd.<br />
                  A/C Number: 0100029384729101<br />
                  Branch: Kathmandu Main Branch
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  style={{ padding: '10px 18px', background: '#ebf5f1', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  disabled={paymentLoading}
                  style={{
                    padding: '10px 22px',
                    background: '#117a6b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    opacity: paymentLoading ? 0.6 : 1
                  }}
                >
                  {paymentLoading ? 'Processing Gateway...' : `Proceed to Pay with ${selectedGateway}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Class Feature Configuration Modal */}
      {isBulkModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(14, 62, 59, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>Bulk Feature Configuration</h3>
                <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>Apply setting simultaneously to multiple classes</p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#8da19d', cursor: 'pointer', fontSize: '20px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Target Feature</label>
                <select
                  value={bulkFeatureKey}
                  onChange={(e) => setBulkFeatureKey(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                >
                  <option value="STUDENT_DASHBOARD">Student Dashboard Access</option>
                  <option value="ASSIGNMENTS">Assignments Module</option>
                  <option value="ASSIGNMENTS_ONLINE_SUBMISSION">Online Assignment Submission</option>
                  <option value="QUIZZES">Interactive Quizzes Module</option>
                  <option value="QUIZZES_ONLINE_ACCESS">Online Student Quizzes</option>
                  <option value="DIGITAL_TEXTBOOKS">Official CDC Digital Textbooks</option>
                  <option value="SIMULATIONS">Science & Math Simulations</option>
                  <option value="SIMULATIONS_STUDENT_ACCESS">Student Self-Paced Simulations</option>
                  <option value="AI_ASSISTANT">Nepal CDC AI Learning Assistant</option>
                  <option value="AI_STUDENT_ACCESS">Student AI Assistant Access</option>
                  <option value="SMARTBOARD">Smart Board Digital Classroom Hub</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Action</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setBulkFeatureEnabled(true)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '800',
                      border: bulkFeatureEnabled ? '2px solid #117a6b' : '1px solid #cfdcd8',
                      background: bulkFeatureEnabled ? '#e6f7f0' : '#ffffff',
                      color: bulkFeatureEnabled ? '#117a6b' : '#5f736f',
                      cursor: 'pointer'
                    }}
                  >
                    ENABLE for Selected
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkFeatureEnabled(false)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '800',
                      border: !bulkFeatureEnabled ? '2px solid #ef4444' : '1px solid #cfdcd8',
                      background: !bulkFeatureEnabled ? '#fef2f2' : '#ffffff',
                      color: !bulkFeatureEnabled ? '#ef4444' : '#5f736f',
                      cursor: 'pointer'
                    }}
                  >
                    DISABLE for Selected
                  </button>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Select Target Classes</label>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                    <button
                      type="button"
                      onClick={() => setBulkSelectedClassIds(classes.map((c: any) => c.id || c._id))}
                      style={{ background: 'none', border: 'none', color: '#117a6b', cursor: 'pointer', fontWeight: '700' }}
                    >
                      Select All (1–12)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkSelectedClassIds([])}
                      style={{ background: 'none', border: 'none', color: '#5f736f', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #dcebe6', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {classes.map((cls) => {
                      const cid = cls.id || cls._id;
                      const isChecked = bulkSelectedClassIds.includes(cid);
                      return (
                        <label
                          key={cid}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            background: isChecked ? '#effaf6' : 'transparent'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkSelectedClassIds([...bulkSelectedClassIds, cid]);
                              } else {
                                setBulkSelectedClassIds(bulkSelectedClassIds.filter((id) => id !== cid));
                              }
                            }}
                          />
                          {cls.name || `Class ${cls.gradeNumber}`}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ebf5f1', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkUpdate}
                  style={{ padding: '8px 20px', background: '#117a6b', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Apply Bulk Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Management & Provisioning Modals */}
      <BulkTeacherImportModal
        isOpen={isBulkTeacherModalOpen}
        onClose={() => setIsBulkTeacherModalOpen(false)}
        onSuccess={loadSchoolData}
      />

      <BulkStudentImportModal
        isOpen={isBulkStudentModalOpen}
        onClose={() => setIsBulkStudentModalOpen(false)}
        onSuccess={loadSchoolData}
      />

      <BulkSubjectAllocationModal
        isOpen={isBulkAllocModalOpen}
        onClose={() => setIsBulkAllocModalOpen(false)}
        onSuccess={loadSchoolData}
      />

      {/* PDF Reader Modal */}
      {isPdfModalOpen && selectedReaderTextbook && (
        <PdfReaderModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          textbook={selectedReaderTextbook}
        />
      )}

      {/* Assignment Inspector Modal */}
      {inspectAssignment && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(14, 62, 59, 0.8)',
          backdropFilter: 'blur(4px)',
          padding: '16px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 24px', background: '#effaf6', color: '#0b3f3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', background: 'rgba(31, 181, 137, 0.2)', color: '#2fcf9c', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                  Assignment Studio Inspector
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '4px 0 0 0' }}>{inspectAssignment.title}</h3>
              </div>
              <button onClick={() => setInspectAssignment(null)} style={{ background: 'transparent', border: 'none', color: '#8da19d', cursor: 'pointer', fontSize: '20px' }}>
                ✕
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f4faf8', padding: '12px', borderRadius: '8px' }}>
                <div><span style={{ color: '#5f736f' }}>Subject:</span> <strong>{inspectAssignment.centralSubjectId?.name || 'General'}</strong></div>
                <div><span style={{ color: '#5f736f' }}>Teacher:</span> <strong>{inspectAssignment.teacherId?.fullName || inspectAssignment.teacherId?.name}</strong></div>
                <div><span style={{ color: '#5f736f' }}>Due Date:</span> <strong>{new Date(inspectAssignment.dueDate).toLocaleString()}</strong></div>
                <div><span style={{ color: '#5f736f' }}>Total Marks:</span> <strong>{inspectAssignment.maxScore || 100}</strong></div>
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 6px 0' }}>Description & Scope:</h4>
                <p style={{ margin: 0, color: '#2f4f4c', background: '#f4faf8', padding: '12px', borderRadius: '8px', border: '1px solid #dcebe6', whiteSpace: 'pre-wrap' }}>
                  {inspectAssignment.detailedInstructions || inspectAssignment.description || 'Standard assignment coursework'}
                </p>
              </div>
              {inspectAssignment.questions?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 6px 0' }}>
                    Authoring Questions ({inspectAssignment.questions.length}):
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {inspectAssignment.questions.map((q: any, i: number) => (
                      <div key={i} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #dcebe6', background: '#f4faf8' }}>
                        <strong>Q{i + 1}:</strong> {q.questionText} ({q.marks || 1} mark)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 20px', background: '#f4faf8', borderTop: '1px solid #dcebe6', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setInspectAssignment(null)}
                style={{ padding: '8px 16px', background: '#117a6b', color: '#ffffff', borderRadius: '6px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Inspector Modal */}
      {inspectQuiz && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(14, 62, 59, 0.8)',
          backdropFilter: 'blur(4px)',
          padding: '16px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 24px', background: '#effaf6', color: '#0b3f3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', background: 'rgba(109,91,208, 0.2)', color: '#a78bfa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                  Quiz Studio Inspector
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '4px 0 0 0' }}>{inspectQuiz.title}</h3>
              </div>
              <button onClick={() => setInspectQuiz(null)} style={{ background: 'transparent', border: 'none', color: '#8da19d', cursor: 'pointer', fontSize: '20px' }}>
                ✕
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f4faf8', padding: '12px', borderRadius: '8px' }}>
                <div><span style={{ color: '#5f736f' }}>Subject:</span> <strong>{inspectQuiz.centralSubjectId?.name || 'General'}</strong></div>
                <div><span style={{ color: '#5f736f' }}>Duration:</span> <strong>{inspectQuiz.durationMinutes} Minutes</strong></div>
                <div><span style={{ color: '#5f736f' }}>Total Marks:</span> <strong>{inspectQuiz.totalMarks} Marks</strong></div>
                <div><span style={{ color: '#5f736f' }}>Passing Threshold:</span> <strong>{inspectQuiz.passingMarks} Marks</strong></div>
              </div>
              {inspectQuiz.questions?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 6px 0' }}>
                    Authoring Questions ({inspectQuiz.questions.length}):
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {inspectQuiz.questions.map((q: any, i: number) => (
                      <div key={i} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #dcebe6', background: '#f4faf8' }}>
                        <strong>Q{i + 1}:</strong> {q.questionText} ({q.marks || 1} mark)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 20px', background: '#f4faf8', borderTop: '1px solid #dcebe6', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setInspectQuiz(null)}
                style={{ padding: '8px 16px', background: '#117a6b', color: '#ffffff', borderRadius: '6px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
