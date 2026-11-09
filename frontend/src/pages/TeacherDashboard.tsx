import { useHiddenNavs, HiddenNavStyle } from '../hooks/useHiddenNavs';
import { SchoolLogoBadge } from '../components/common/SchoolLogoBadge';
import React, { useState, useEffect, useRef } from 'react';
import { AIAssistantPanel } from '../components/ai/AIAssistantPanel';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
  Layers,
  LogOut,
  Presentation,
  Users,
  Award,
  Sparkles,
  ClipboardList,
  ChevronRight,
  ChevronDown,
  Plus,
  FileSpreadsheet,
  Check,
  X,
  FileText,
  AlertCircle,
  Download,
  BookOpenCheck,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Folder,
  Bell,
  Sun,
  Moon,
  User,
  Mail,
  Phone,
  MapPin,
  Settings,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Search,
  Compass,
  Video,
  Share2,
  Eye,
  ShieldCheck,
  Lock,
  Activity,
  BarChart2,
  Megaphone,
  Target,
  RefreshCw,
  Send,
  CheckCircle2,
  Bookmark,
  Menu,
  ArrowRight,
  LayoutGrid,
  Monitor,
  Briefcase,
  Printer,
  FolderPlus,
  UploadCloud,
  CheckSquare,
  History,
  CheckCheck,
  School,
  EyeOff,
  Key,
  Shield,
  NotebookPen,
} from 'lucide-react';
import { PdfReaderModal, TextbookData } from '../components/PdfReaderModal';
import { SimulationViewerModal } from '../components/SimulationViewerModal';
import { InteractiveActivityPlayer } from '../components/InteractiveActivityPlayer';
import { DemoBanner } from '../components/common/DemoBanner';
import { TeacherQuizManager } from '../components/academic/TeacherQuizManager';
import { TeacherAssignmentManager } from '../components/academic/TeacherAssignmentManager';
import { TeacherMaterialManager } from '../components/academic/TeacherMaterialManager';
import { MyTeachingSchedule } from '../components/academic/MyTeachingSchedule';
import { ClassTeacherSectionPanel } from '../components/academic/ClassTeacherSectionPanel';
import { ExploreSimulationsPanel } from '../components/academic/ExploreSimulationsPanel';
import { TeacherInsightsPanel, InsightScope } from '../components/academic/TeacherInsightsPanel';
import { useDialogs } from '../components/common/Dialogs';
import { launchDesktopSmartBoard, DESKTOP_SETUP_HINT } from '../components/simulations/desktopSmartBoard';
import { TeachingDiaryPanel } from '../components/teacher/TeachingDiaryPanel';
import { StudentDossierModal } from '../components/teacher/StudentDossierModal';

const normalizeTeacherMaterial = (material: any) => ({
  ...material,
  type: material.category === 'LECTURE_NOTE'
    ? 'NOTE'
    : material.category === 'PRESENTATION' || material.category === 'VIDEO'
      ? material.category
      : 'MATERIAL',
  subjectCode: material.centralSubjectId?.code || '',
  subjectName: material.centralSubjectId?.name || '',
  className: [
    material.classId?.gradeNumber ? `Class ${material.classId.gradeNumber}` : material.classId?.name,
    material.sectionId?.name ? `Section ${material.sectionId.name}` : '',
  ].filter(Boolean).join(' · '),
  author: material.uploadedBy?.fullName || '',
  date: material.createdAt ? new Date(material.createdAt).toLocaleDateString() : '',
  format: material.originalFilename || '',
  downloads: material.downloadCount || 0,
});

export const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation state matching screenshots 1, 2, 3
  const [activeNav, setActiveNav] = useState<
    | 'OVERVIEW'
    | 'MY_SUBJECTS'
    | 'LEARNING_RESOURCES'
    | 'TEACHING_DIARY'
    | 'ATTENDANCE'
    | 'RESULTS'
    | 'TODAY_SCHEDULE'
    | 'WEEKLY_TIMETABLE'
    | 'WORKLOAD'
    | 'NOTES'
    | 'MATERIALS'
    | 'VIDEOS'
    | 'PRESENTATIONS'
    | 'QUIZZES'
    | 'ASSIGNMENTS'
    | 'INSIGHTS'
    | 'MONITORING'
    | 'PROGRESS'
    | 'KNOWLEDGE_BASE'
    | 'AI_ASSISTANT'
    | 'MATH_WORKSPACE'
    | 'SIMULATIONS'
    | 'ANNOUNCEMENTS'
    | 'NOTIFICATIONS'
    | 'CLASS_TEACHER'
    | 'PROFILE'
  >('OVERVIEW');
  // Menu items for features the school switched off for every class this teacher teaches are hidden
  const hiddenNavs = useHiddenNavs({ ASSIGNMENTS: 'ASSIGNMENTS', QUIZZES: 'QUIZZES', LEARNING_RESOURCES: ['MATERIALS', 'NOTES'], AI_ASSISTANT: 'AI', SIMULATIONS: 'SIMULATIONS' });
  useEffect(() => { if (hiddenNavs.includes(activeNav as string)) setActiveNav('OVERVIEW'); }, [hiddenNavs.join(','), activeNav]);

  // Sidebar collapsible groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Academic: true,
    Timetable: false,
    Teaching: false,
    Insights: false,
    'Smart Board': false,
    Communication: true,
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Core Data State
  const [overview, setOverview] = useState<any>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Subject Workspace State (Screenshot 3)
  const [selectedAllocIndex, setSelectedAllocIndex] = useState<number>(0);
  const { toast } = useDialogs();
  const [dossier, setDossier] = useState<{ studentId: string; sectionId?: string } | null>(null);
  const idOfAny = (v: any) => String(v?.id || v?._id || v || '') || undefined;
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<
    | 'OVERVIEW'
    | 'TEXTBOOK'
    | 'MONITORING'
    | 'CURRICULUM'
    | 'NOTES'
    | 'MATERIALS'
    | 'VIDEOS'
    | 'PRESENTATIONS'
    | 'QUIZZES'
    | 'ASSIGNMENTS'
    | 'ATTENDANCE'
    | 'RESOURCES'
    | 'RESULTS'
    | 'ANNOUNCEMENTS'
    | 'PROGRESS'
    | 'AI'
  >('OVERVIEW');

  // Unified Learning Resources & Upload Files State
  const [isUploadFilesModalOpen, setIsUploadFilesModalOpen] = useState(false);
  const [uploadFileType, setUploadFileType] = useState<'NOTE' | 'MATERIAL' | 'PRESENTATION' | 'VIDEO'>('NOTE');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadChapter, setUploadChapter] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [resourceUploading, setResourceUploading] = useState(false);
  const [resourcesFilter, setResourcesFilter] = useState<'ALL' | 'NOTE' | 'MATERIAL' | 'PRESENTATION' | 'VIDEO'>('ALL');
  const [explorerSearch, setExplorerSearch] = useState<string>('');
  const [explorerSubjectFilter, setExplorerSubjectFilter] = useState<string>('ALL');

  // Academic Attendance Engine State
  const [attendanceSessionMode, setAttendanceSessionMode] = useState<'MARK' | 'HISTORY'>('MARK');
  const [attendancePeriod, setAttendancePeriod] = useState<number>(1);
  const [attendanceTimeSlot, setAttendanceTimeSlot] = useState<string>('09:00 - 09:45 AM');
  const [attendanceTopic, setAttendanceTopic] = useState<string>('');
  const [attendanceSearch, setAttendanceSearch] = useState<string>('');
  const [attendanceSuccessToast, setAttendanceSuccessToast] = useState<string | null>(null);

  // Marks Entry Engine State (First Terminal, Second Terminal, Final, Assignment)
  const [marksExamType, setMarksExamType] = useState<'FIRST_TERM' | 'SECOND_TERM' | 'FINAL_EXAM' | 'UNIT_TEST' | 'ASSIGNMENT'>('FIRST_TERM');
  const [marksTheoryMax, setMarksTheoryMax] = useState<number>(75);
  const [marksPracticalMax, setMarksPracticalMax] = useState<number>(25);
  const [marksBulkScore, setMarksBulkScore] = useState<string>('');
  const [marksSuccessToast, setMarksSuccessToast] = useState<string | null>(null);
  const [assignedAssessments, setAssignedAssessments] = useState<any[]>([]);
  const [selectedAdminAssessmentId, setSelectedAdminAssessmentId] = useState<string>('');
  const [isSubmittingMarks, setIsSubmittingMarks] = useState<boolean>(false);

  // Active Subject Index for 6 Subjects
  const [activeCourseIndex, setActiveCourseIndex] = useState<number>(0);

  const SUBJECT_COURSES = allocations.map((allocation, allocIndex) => {
    const section = allocation.sectionId && typeof allocation.sectionId === 'object' ? allocation.sectionId : {};
    const cls = section.classId && typeof section.classId === 'object'
      ? section.classId
      : allocation.classId && typeof allocation.classId === 'object'
        ? allocation.classId
        : {};
    const subject = allocation.centralSubjectId && typeof allocation.centralSubjectId === 'object'
      ? allocation.centralSubjectId
      : {};
    const gradeNumber = cls.gradeNumber;
    const className = cls.name || (gradeNumber ? `Class ${gradeNumber}` : 'Class');
    const sectionName = section.name ? (/^section/i.test(section.name) ? section.name : `Section ${section.name}`) : 'Section';
    const academicYear = section.academicYearId && typeof section.academicYearId === 'object'
      ? section.academicYearId.name
      : '';
    return {
      code: subject.code || '—',
      name: subject.name || 'Subject',
      nameNp: subject.nameNepali || '',
      department: cls.stream || '',
      classSem: `${className} · ${sectionName}`,
      gradeNumber,
      grade: gradeNumber,
      sectionName,
      semester: academicYear || '',
      room: '',
      credits: subject.creditHours ? `${subject.creditHours} credits` : '',
      periods: '',
      next: '',
      studentCount: (() => {
        const secKey = String(section._id || section.id || allocation.sectionId || '');
        const match = (overview?.allocations || []).find((a: any) => String(a.sectionId?._id || a.sectionId?.id || a.sectionId) === secKey);
        return typeof match?.studentCount === 'number' ? match.studentCount : null;
      })(),
      allocIndex,
      curriculumUnits: 0,
      avgGpa: null,
      attendanceRate: null,
      flaggedCount: null,
    };
  });

  const [courseStudents, setCourseStudents] = useState<any[]>([]);

  // Unified Learning Resources List
  const [learningResources, setLearningResources] = useState<any[]>([]);

  // Attendance History Records
  const [attendanceHistoryList, setAttendanceHistoryList] = useState<any[]>([]);

  // Helper for CDC Letter Grade
  const calculateCdcGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', gpa: 4.0, desc: 'Outstanding', color: '#117a6b', bg: '#e6f7f0', border: '#bfeede' };
    if (percentage >= 80) return { grade: 'A', gpa: 3.6, desc: 'Excellent', color: '#1fb589', bg: '#e6f7f0', border: '#bfeede' };
    if (percentage >= 70) return { grade: 'B+', gpa: 3.2, desc: 'Very Good', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' };
    if (percentage >= 60) return { grade: 'B', gpa: 2.8, desc: 'Good', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
    if (percentage >= 50) return { grade: 'C+', gpa: 2.4, desc: 'Satisfactory', color: '#6d5bd0', bg: '#f5f3ff', border: '#ddd6fe' };
    if (percentage >= 40) return { grade: 'C', gpa: 2.0, desc: 'Acceptable', color: '#6d5bd0', bg: '#f5f3ff', border: '#ede9fe' };
    if (percentage >= 35) return { grade: 'D', gpa: 1.6, desc: 'Basic', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
    return { grade: 'NG', gpa: 0.0, desc: 'Non-Graded', color: '#991b1b', bg: '#fef2f2', border: '#f87171' };
  };

  // Helper to handle Upload File
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert('Please enter a resource title.');
      return;
    }
    if (!uploadFile) {
      alert('Select a file to upload.');
      return;
    }

    const allocation = allocations[selectedAllocIndex] || allocations[activeCourseIndex] || allocations[0];
    const getId = (value: any) => value && typeof value === 'object' ? value.id || value._id : value;
    const section = selectedWorkspace?.section || allocation?.sectionId;
    const subject = selectedWorkspace?.subject || allocation?.centralSubjectId;
    const sectionId = getId(section);
    const classId = getId(section?.classId) || getId(allocation?.classId);
    const centralSubjectId = getId(subject);
    if (!classId || !sectionId || !centralSubjectId) {
      alert('Open an assigned subject workspace before uploading a learning resource.');
      return;
    }

    setResourceUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('classId', String(classId));
      formData.append('sectionId', String(sectionId));
      formData.append('centralSubjectId', String(centralSubjectId));
      const category = uploadFileType === 'NOTE'
        ? 'LECTURE_NOTE'
        : uploadFileType === 'MATERIAL'
          ? 'REFERENCE_MATERIAL'
          : uploadFileType;
      formData.append('category', category);
      formData.append('title', uploadTitle.trim());
      formData.append('description', uploadDesc.trim());
      if (uploadChapter.trim()) formData.append('topic', uploadChapter.trim());
      await api.postFormData('/academic-materials/upload', formData);

      setIsUploadFilesModalOpen(false);
      setUploadTitle('');
      setUploadChapter('');
      setUploadDesc('');
      setUploadFile(null);
      try {
        const materials = await api.get<any[]>('/academic-materials/teacher');
        setLearningResources((Array.isArray(materials) ? materials : []).map(normalizeTeacherMaterial));
      } catch (refreshError) {
        console.error('Resource was uploaded, but the list could not be refreshed:', refreshError);
        alert('Resource uploaded, but the resource list could not be refreshed. Reload the page to see it.');
        return;
      }
      alert('Learning resource uploaded successfully.');
    } catch (error) {
      console.error('Unable to upload learning resource:', error);
      alert(error instanceof Error ? error.message : 'Unable to upload learning resource.');
    } finally {
      setResourceUploading(false);
    }
  };

  const handleRecordAttendanceSession = () => {
    void handleSaveAttendance();
  };

  const handleBulkAttendance = (status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setCourseStudents((prev) => prev.map((st) => ({ ...st, status })));
    setAttendanceSheet(Object.fromEntries(courseStudents.map((student) => [student.id, status])));
  };

  const handleStudentAttendanceStatus = (id: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setCourseStudents((prev) => prev.map((st) => (st.id === id ? { ...st, status } : st)));
    setAttendanceSheet((prev) => ({ ...prev, [id]: status }));
  };

  const handleUpdateStudentMarks = (id: string, field: 'theoryMarks' | 'practicalMarks' | 'remarks', val: any) => {
    setCourseStudents((prev) =>
      prev.map((st) => {
        if (st.id === id) {
          return { ...st, [field]: val };
        }
        return st;
      })
    );
    if (field !== 'remarks') {
      const student = courseStudents.find((item) => item.id === id);
      const theory = field === 'theoryMarks' ? Number(val) || 0 : Number(student?.theoryMarks) || 0;
      const practical = field === 'practicalMarks' ? Number(val) || 0 : Number(student?.practicalMarks) || 0;
      setMarksSheet((prev) => ({ ...prev, [id]: theory + practical }));
    }
  };

  const handleBulkMarksFill = (score: number) => {
    const theory = Math.min(marksTheoryMax, Math.round(score * (marksTheoryMax / (marksTheoryMax + marksPracticalMax))));
    const practical = Math.min(marksPracticalMax, score - theory);
    setCourseStudents((prev) =>
      prev.map((st) => ({ ...st, theoryMarks: theory, practicalMarks: practical }))
    );
    setMarksSheet(Object.fromEntries(courseStudents.map((student) => [student.id, score])));
  };

  // Theme & Profile & Smart Board States
  // The portal uses a single light theme (the old dark theme was removed)
  const isDarkMode = false;

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Smart Board Launcher State
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [launcherAllocIndex, setLauncherAllocIndex] = useState(0);
  const [launcherTextbooks, setLauncherTextbooks] = useState<any[]>([]);
  const [launcherTextbookMessage, setLauncherTextbookMessage] = useState<string | null>(null);
  const [launcherSelectedTbId, setLauncherSelectedTbId] = useState('');
  const [launcherChapters, setLauncherChapters] = useState<any[]>([]);
  const [launcherSelectedChapter, setLauncherSelectedChapter] = useState<number>(1);
  const [launcherLessonTitle, setLauncherLessonTitle] = useState('');
  const [launcherMode, setLauncherMode] = useState<'WHITEBOARD' | 'TEXTBOOK' | 'SIMULATION' | 'ACTIVITY'>('TEXTBOOK');
  const [launcherSimulations, setLauncherSimulations] = useState<any[]>([]);
  const [launcherSelectedSim, setLauncherSelectedSim] = useState('');
  const [launcherActivities, setLauncherActivities] = useState<any[]>([]);
  const [classroomSessions, setClassroomSessions] = useState<any[]>([]);
  const [savedAnnotations, setSavedAnnotations] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [launcherLoading, setLauncherLoading] = useState(false);
  const [timetableSchedule, setTimetableSchedule] = useState<any>(null);
  const [smartBoardSuggestion, setSmartBoardSuggestion] = useState<any>(null);

  // PDF Reader Modal
  const [activeReaderTextbook, setActiveReaderTextbook] = useState<TextbookData | null>(null);

  // Class Teacher Analytics & Syllabus State
  const [ctAnalytics, setCtAnalytics] = useState<any>(null);
  const [classTeacherData, setClassTeacherData] = useState<any>(null);
  const [publishingResults, setPublishingResults] = useState(false);
  const [syllabusList, setSyllabusList] = useState<any[]>([]);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [newSyllabusProgress, setNewSyllabusProgress] = useState({
    chapterNumber: 1,
    chapterTitle: '',
    status: 'IN_PROGRESS' as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
    coveredTopics: '',
    completedObjectives: '',
    teachingHoursSpent: 4,
    teachingNotes: '',
  });

  // Attendance Form State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>>({});
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // Marks Entry State
  const [assessmentName, setAssessmentName] = useState('First Terminal Examination 2083');
  const [marksSheet, setMarksSheet] = useState<Record<string, number>>({});
  const [marksSaved, setMarksSaved] = useState(false);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMode, setAiMode] = useState<'TEACHER_LESSON_PLAN' | 'TEACHER_WORKSHEET' | 'MCQ_GENERATOR' | 'STUDENT_TUTOR'>('TEACHER_LESSON_PLAN');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Simulation & Interactive Activity State
  const [teacherSimulations, setTeacherSimulations] = useState<any[]>([]);
  const [teacherActivities, setTeacherActivities] = useState<any[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [selectedSimPreview, setSelectedSimPreview] = useState<any>(null);
  const [selectedActivityPlayer, setSelectedActivityPlayer] = useState<any>(null);
  const [simFilterGrade, setSimFilterGrade] = useState<string>('');
  const [simActiveSubTab, setSimActiveSubTab] = useState<'SIMS' | 'ACTIVITIES' | 'ASSIGNMENTS'>('SIMS');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activityToAssign, setActivityToAssign] = useState<any>(null);
  const [assignAllocIndex, setAssignAllocIndex] = useState(0);
  const [assignDueDate, setAssignDueDate] = useState('');
  const [selectedAnalytics, setSelectedAnalytics] = useState<any>(null);

  // Quick Action Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteChapter, setNewNoteChapter] = useState('');
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState<'ALL' | 'STUDENTS'>('STUDENTS');
  const [announcementType, setAnnouncementType] = useState<'SUBJECT_SPECIFIC' | 'CLASS_OVERALL'>('SUBJECT_SPECIFIC');
  const [announcementAllocIndex, setAnnouncementAllocIndex] = useState<number>(0);
  const [announcementPriority, setAnnouncementPriority] = useState<'NORMAL' | 'URGENT' | 'HIGH'>('NORMAL');
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [announcementFilter, setAnnouncementFilter] = useState<'ALL' | 'MY_SUBJECTS' | 'CLASS_OVERALL' | 'INSTITUTIONAL'>('ALL');
  const [announcementSearch, setAnnouncementSearch] = useState<string>('');
  const [realtimeNotifications, setRealtimeNotifications] = useState<any[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(3);
  const [notificationFilter, setNotificationFilter] = useState<'ALL' | 'UNREAD' | 'URGENT'>('ALL');

  // Profile & Change Password State
  const [profileActiveTab, setProfileActiveTab] = useState<'DETAILS' | 'SECURITY'>('DETAILS');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeMsg, setPasswordChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Phone editing
  const [editPhone, setEditPhone] = useState(user?.phone || user?.phoneNumber || '');
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneSaveMsg, setPhoneSaveMsg] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMsg(null);

    if (!currentPasswordInput) {
      setPasswordChangeMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (!newPasswordInput || newPasswordInput.length < 6) {
      setPasswordChangeMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordChangeLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput,
      });
      setPasswordChangeMsg({ type: 'success', text: 'Password changed successfully! Keep it secure.' });
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err: any) {
      setPasswordChangeMsg({ type: 'error', text: err.message || 'Failed to update password. Please check your current password.' });
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneSaving(true);
    setPhoneSaveMsg(null);
    try {
      await api.patch('/auth/profile', { phone: editPhone });
      setPhoneSaveMsg('Contact phone number updated successfully!');
      setTimeout(() => setPhoneSaveMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setPhoneSaving(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // ACADEMIC MONITORING, STUDENT PROGRESS & KNOWLEDGE BASE STATES
  // ══════════════════════════════════════════════════════════════════
  const [kbSearchQuery, setKbSearchQuery] = useState<string>('');
  const [kbCategory, setKbCategory] = useState<string>('ALL');
  const [selectedKbArticle, setSelectedKbArticle] = useState<any>(null);
  const [isChapterProgressModalOpen, setIsChapterProgressModalOpen] = useState(false);
  const [selectedChapterToEdit, setSelectedChapterToEdit] = useState<any>(null);
  const [updatedProgressVal, setUpdatedProgressVal] = useState(100);


  const [cdcChaptersData, setCdcChaptersData] = useState<Record<string, any[]>>({ DEFAULT: [] });
  const [syllabusInfo, setSyllabusInfo] = useState<{ textbookTitle: string | null; loading: boolean; error: string | null }>({
    textbookTitle: null,
    loading: false,
    error: null,
  });

  // Load real textbook chapters + saved progress for the open course workspace
  useEffect(() => {
    const secId = selectedWorkspace?.section?.id || selectedWorkspace?.section?._id;
    const subId = selectedWorkspace?.subject?.id || selectedWorkspace?.subject?._id;
    if (!secId || !subId) return;
    let cancelled = false;
    setSyllabusInfo({ textbookTitle: null, loading: true, error: null });
    api
      .get<any>(`/teacher/syllabus/${secId}/${subId}`)
      .then((res) => {
        if (cancelled) return;
        setCdcChaptersData({ DEFAULT: res?.chapters || [] });
        setSyllabusInfo({ textbookTitle: res?.textbookTitle || null, loading: false, error: null });
      })
      .catch((err: any) => {
        if (cancelled) return;
        setCdcChaptersData({ DEFAULT: [] });
        setSyllabusInfo({ textbookTitle: null, loading: false, error: err.message || 'Could not load syllabus' });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedWorkspace?.section?.id, selectedWorkspace?.section?._id, selectedWorkspace?.subject?.id, selectedWorkspace?.subject?._id]);



  const knowledgeBaseArticlesList = [
    {
      id: 'ncf-2076',
      title: 'National Curriculum Framework (NCF) 2076 BS',
      titleNp: 'राष्ट्रिय पाठ्यक्रम प्रारूप २०७६',
      category: 'CDC',
      categoryLabel: 'National Curriculum (CDC)',
      summary: 'Comprehensive curriculum framework by CDC Nepal. Defines basic (Grades 1–8) and secondary (Grades 9–12) competency standards, credit hours, and integrated themes.',
      readTime: '8 min read',
      tags: ['Curriculum', 'Credit Hours', 'CDC Nepal', 'Grades 1-12'],
      fullContent: `
### Nepal National Curriculum Framework (NCF) 2076 BS Overview
- **Structure**: Basic Level (Grades 1–3 Integrated, Grades 4–5 Thematic, Grades 6–8 Subject-based) & Secondary Level (Grades 9–10 General/Technical, Grades 11–12 Single-Track Streamed).
- **Credit Hour Standard**: 1 Credit Hour = 32 teaching clock hours. Minimum 1,024 annual learning hours across 180 direct instruction days.
- **Compulsory Subjects for Secondary (Grade 9–10)**: Compulsory Nepali (5 credits), Compulsory English (5 credits), Compulsory Mathematics (5 credits), Science & Technology (5 credits), Social Studies & Human Values (4 credits), plus 2 Optional Subjects (4 credits each).
- **Core Pedagogical Principles**: Constructivist learner-centered teaching, multi-grade multi-level (MGML) facilitation, formative continuous assessment, and ICT-assisted interactive classrooms.
      `,
    },
    {
      id: 'cas-evaluation',
      title: 'Continuous Assessment System (CAS) Implementation Manual',
      titleNp: 'निरन्तर विद्यार्थी मूल्याङ्कन (CAS) कार्यान्वयन निर्देशिका',
      category: 'CAS',
      categoryLabel: 'Evaluation & CAS',
      summary: 'Official Ministry of Education 50% Internal / 50% External evaluation scheme. Breakdown of attendance, classroom participation, portfolio, project work, and terminal exams.',
      readTime: '6 min read',
      tags: ['CAS Rubrics', 'Internal Assessment', '50-50 Evaluation', 'SEE Standards'],
      fullContent: `
### Continuous Assessment System (CAS) 50-50 Evaluation Model
1. **Attendance & Discipline (4 Marks)**: 90%+ attendance = 4 marks, 80-89% = 3 marks, 75-79% = 2 marks, <75% = 0 marks (Disqualified from regular exam without remedial makeup).
2. **Classroom Learning Participation (4 Marks)**: Active discussion, inquiry questioning, peer cooperation, and daily notebook presentation.
3. **Practical & Project Work (16 Marks)**: Science experiments, mathematical models, community social survey, and IT lab tasks with certified observation rubrics.
4. **Terminal / Formative Periodic Tests (26 Marks)**: First Terminal Exam (10 marks weighted), Second Terminal Exam (10 marks weighted), Unit tests & class quizzes (6 marks weighted).
Total Internal CAS = 50 Marks • External Board Examination = 50 Marks (Total = 100 Marks).
      `,
    },
    {
      id: 'see-neb-spec-grid',
      title: 'SEE (Class 10) & NEB (Class 11–12) Question Specification Grids',
      titleNp: 'प्रश्न विशिष्टीकरण तालिका (Specification Grid)',
      category: 'GRIDS',
      categoryLabel: 'SEE & NEB Grids',
      summary: 'Standardized CDC cognitive domain weighting for question papers: Knowledge (20%), Understanding (30%), Application (30%), and Higher Ability (20%).',
      readTime: '10 min read',
      tags: ['Exam Grid', 'Model Questions', 'Cognitive Domains', 'SEE / NEB'],
      fullContent: `
### CDC Question Specification Grid Standard
- **Knowledge Level (20%)**: Recall of definitions, formulas, historical dates, scientific terms, and theorem enunciations.
- **Understanding Level (30%)**: Conceptual explanation, distinction between phenomena, reasoning why, translation, and summary synthesis.
- **Application Level (30%)**: Solving real-world numericals, applying formulas to new scenarios, drawing circuit/cell diagrams, grammatical conversions.
- **Higher Ability / Creative Synthesis (20%)**: Proofs, critical evaluations, creative essay writing, hypothesis testing, and multi-step derivations.
      `,
    },
    {
      id: 'blooms-taxonomy-pedagogy',
      title: "Lesson Planning & Bloom's Taxonomy Action Verbs for Teachers",
      titleNp: 'पाठयोजना र ब्लुमको वर्गीकरण पद्धति',
      category: 'PEDAGOGY',
      categoryLabel: 'Teaching Pedagogy',
      summary: 'Actionable lesson design templates aligning specific behavioral objectives with measurable formative assessments in Nepali and English medium instruction.',
      readTime: '7 min read',
      tags: ['Lesson Plan', 'Bloom Taxonomy', 'Learning Objectives', 'Active Learning'],
      fullContent: `
### Bloom's Taxonomy Pedagogical Framework for Lesson Plans
1. **Remembering (सम्झने)**: Define, identify, list, name, state.
2. **Understanding (बुझ्ने)**: Explain, classify, describe, summarize, illustrate.
3. **Applying (प्रयोग गर्ने)**: Calculate, demonstrate, solve, operate, construct.
4. **Analyzing (विश्लेषण गर्ने)**: Differentiate, investigate, compare, inspect, examine.
5. **Evaluating (मूल्याङ्कन गर्ने)**: Assess, critique, defend, justify, measure.
6. **Creating (सृजना गर्ने)**: Formulate, design, hypothesize, develop, compose.
      `,
    },
    {
      id: 'inclusive-education-remedial',
      title: 'Early Intervention & Remedial Instruction for At-Risk Learners',
      titleNp: 'शैक्षिक निगरानी तथा उपचारात्मक शिक्षण निर्देशिका',
      category: 'PEDAGOGY',
      categoryLabel: 'Teaching Pedagogy',
      summary: 'Standard operating procedure for early warning detection, guardian conference protocols, and remedial support sessions for students scoring below 40% or attendance < 75%.',
      readTime: '5 min read',
      tags: ['Early Warning', 'Remedial Classes', 'Guardian Outreach', 'At-Risk Support'],
      fullContent: `
### Protocol for Academic Intervention
1. **Trigger Thresholds**: Attendance drops below 75% OR student scores < 40 marks on two consecutive formative quizzes/unit tests.
2. **Step 1 - Teacher Log**: Record observation in Academic Monitoring console identifying specific struggle domain (e.g. algebra fundamentals, reading fluency).
3. **Step 2 - Guardian Communication**: Send official SMS/portal notification to guardian requesting learning support alignment at home.
4. **Step 3 - Remedial Sessions**: Schedule 2 weekly 30-minute peer-assisted or teacher-guided remedial sessions before regular assembly.
5. **Step 4 - Evaluation**: Re-test after 3 weeks to confirm mastery improvement before terminal examination.
      `,
    },
    {
      id: 'letter-grading-2078',
      title: 'National Letter Grading Directive 2078 (लेटर ग्रेडिङ निर्देशिका)',
      titleNp: 'अक्षर पद्धति सम्बन्धी निर्देशिका २०७८',
      category: 'CAS',
      categoryLabel: 'Evaluation & CAS',
      summary: 'Official Ministry grading guidelines: 35% minimum threshold for each subject theoretical & practical component to receive Non-Graded (NG) exemption.',
      readTime: '5 min read',
      tags: ['Letter Grading', 'GPA Scale', 'NG Criterion', 'Grade 10 & 12'],
      fullContent: `
### Nepal Letter Grading Directives 2078 Rules
- **A+ (Outstanding)**: 90% and above (GPA 4.0)
- **A (Excellent)**: 80% to below 90% (GPA 3.6)
- **B+ (Very Good)**: 70% to below 80% (GPA 3.2)
- **B (Good)**: 60% to below 70% (GPA 2.8)
- **C+ (Satisfactory)**: 50% to below 60% (GPA 2.4)
- **C (Acceptable)**: 40% to below 50% (GPA 2.0)
- **D (Basic)**: 35% to below 40% (GPA 1.6)
- **NG (Non-Graded)**: Below 35% (Must appear in grade improvement exam)
*Note: Theoretical and practical components must each separately achieve at least 35% (Grade D).*
      `,
    },
  ];

  const handlePublishAnnouncement = async () => {
    if (!announcementTitle.trim() || !newAnnouncementText.trim()) {
      alert('Please enter both announcement title and content.');
      return;
    }
    const isClassTeacher = Boolean(overview?.counts?.isClassTeacher && overview?.classTeacherSection);
    const isClassOverall = isClassTeacher && announcementType === 'CLASS_OVERALL';
    const chosenAlloc = effectiveAllocations[announcementAllocIndex] || effectiveAllocations[0];

    try {
      const payload: any = {
        title: announcementTitle,
        content: newAnnouncementText,
        targetAudience: announcementTarget,
        priority: announcementPriority,
        announcementType: isClassOverall ? 'CLASS_OVERALL' : 'SUBJECT_SPECIFIC',
        authorRole: isClassTeacher ? 'CLASS_TEACHER' : 'TEACHER',
        authorName: user?.fullName || 'Faculty',
      };

      if (isClassOverall && overview?.classTeacherSection) {
        payload.sectionId = overview.classTeacherSection.id || overview.classTeacherSection._id;
        payload.className = `Class ${overview.classTeacherSection.classId?.gradeNumber ?? overview.classTeacherSection.gradeNumber ?? ''} - Section ${overview.classTeacherSection.name || ''}`;
        payload.subjectName = 'Overall Class Notice';
      } else if (chosenAlloc) {
        payload.sectionId = chosenAlloc.sectionId?._id || chosenAlloc.sectionId?.id || chosenAlloc.sectionId;
        payload.subjectId = chosenAlloc.centralSubjectId?._id || chosenAlloc.centralSubjectId?.id || chosenAlloc.centralSubjectId;
        payload.subjectName = chosenAlloc.centralSubjectId?.name || chosenAlloc.subjectName || 'Subject Course';
        const secGrade = chosenAlloc.sectionId?.classId?.gradeNumber || chosenAlloc.sectionId?.classId?.name || '';
        const secName = chosenAlloc.sectionId?.name || 'Section';
        payload.className = secGrade ? `Class ${secGrade} • Section ${secName}` : secName;
      }

      await api.post('/school-admin/announcements', payload);
      alert(
        isClassOverall
          ? `📢 Overall class announcement broadcast to all students of Section ${overview?.classTeacherSection?.name || 'A'}!`
          : `📢 Subject announcement published for ${payload.subjectName}!`
      );
      setIsAnnouncementModalOpen(false);
      setAnnouncementTitle('');
      setNewAnnouncementText('');
      fetchAnnouncementsAndNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement');
    }
  };

  const handleMarkNotificationRead = async (notifId: string) => {
    try {
      await api.patch(`/notifications/${notifId}/read`);
      setRealtimeNotifications((prev) =>
        prev.map((n) => (n._id === notifId || n.id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setRealtimeNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationCount(0);
    } catch (e) {
      // ignore
    }
  };

  const applySavedMarks = async (assessmentId: string) => {
    // Clear whatever was on the sheet so values from another assessment are never saved by mistake
    setCourseStudents((prev) => prev.map((st) => ({ ...st, theoryMarks: '', practicalMarks: '', remarks: '' })));
    if (!assessmentId) return;
    try {
      const mData: any = await api.get(`/teacher/marks/${assessmentId}`);
      const marksArr: any[] = Array.isArray(mData) ? mData : mData?.marks || [];
      if (marksArr.length === 0) return;
      const markMap = new Map(marksArr.map((m: any) => [String(m.studentId?._id || m.studentId), m]));
      setCourseStudents((prev) =>
        prev.map((st) => {
          const sm: any = markMap.get(String(st.id));
          if (!sm) return st;
          return {
            ...st,
            theoryMarks: sm.marksTheory ?? sm.theoryMarks ?? (sm.marksObtained !== undefined ? sm.marksObtained : ''),
            practicalMarks: sm.marksPractical ?? sm.practicalMarks ?? '',
            remarks: sm.remarks || '',
          };
        })
      );
    } catch (err) {
      console.warn('Could not load saved marks for this assessment:', err);
    }
  };

  const fetchAnnouncementsAndNotifications = async () => {
    try {
      const [annRes, notifRes] = await Promise.all([
        api.get('/school-admin/announcements').catch(() => null),
        api.get('/notifications').catch(() => null),
      ]);
      // api.get() already unwraps `data`, so the payloads are the arrays/objects themselves
      if (annRes) {
        setAnnouncementsList(Array.isArray(annRes) ? annRes : []);
      }
      if (notifRes) {
        const items = Array.isArray(notifRes) ? notifRes : notifRes.items || [];
        setRealtimeNotifications(items);
        setUnreadNotificationCount(typeof notifRes.unreadCount === 'number' ? notifRes.unreadCount : items.filter((x: any) => !x.isRead).length);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleSaveNote = async () => {
    if (!newNoteTitle.trim()) {
      alert('Please enter a note title.');
      return;
    }
    try {
      await api.post('/smartboard/share-notes', {
        title: newNoteTitle,
        drawingData: {
          content: newNoteContent,
          chapter: newNoteChapter,
          createdAt: new Date().toISOString(),
        },
        isSharedWithStudents: true,
        sectionId: selectedWorkspace?.section?.id || selectedWorkspace?.section?._id,
        subjectId: selectedWorkspace?.subject?.id || selectedWorkspace?.subject?._id,
      });
      alert('Note saved and published to student dashboards!');
      setIsAddNoteModalOpen(false);
      setNewNoteTitle('');
      setNewNoteContent('');
      setNewNoteChapter('');
    } catch (err: any) {
      alert(err.message || 'Failed to save note');
    }
  };
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  useEffect(() => {
    loadTeacherData();
    fetchAnnouncementsAndNotifications();
    const annInterval = setInterval(fetchAnnouncementsAndNotifications, 30000);
    return () => clearInterval(annInterval);
  }, []);

  useEffect(() => {
    if (activeNav === 'SIMULATIONS') {
      loadSimulationsActivitiesAndAssignments();
    }
  }, [activeNav, simFilterGrade]);

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setIsFullScreen(false);
    }
  };

  const loadTeacherData = async () => {
    setLoading(true);
    setLearningResources([]);
    try {
      const [overviewData, classesData] = await Promise.all([
        api.get('/teacher/overview'),
        api.get('/teacher/classes'),
      ]);
      setOverview(overviewData);
      const rawAllocations = Array.isArray(classesData) ? classesData : classesData?.allocations || [];
      setAllocations(rawAllocations);
      try {
        const materials = await api.get<any[]>('/academic-materials/teacher');
        setLearningResources((Array.isArray(materials) ? materials : []).map(normalizeTeacherMaterial));
      } catch (materialError) {
        console.error('Unable to load teacher learning resources:', materialError);
        setLearningResources([]);
      }

      // If class teacher, load class teacher section overview and deep analytics
      if (overviewData?.classTeacherSection) {
        const secId = overviewData.classTeacherSection.id || overviewData.classTeacherSection._id;
        try {
          const [ctData, ctAnalyticsRes] = await Promise.all([
            api.get(`/class-teacher/section/${secId}/consolidated-results`).catch(() => null),
            api.get(`/analytics/class-teacher/${secId}`).catch(() => null),
          ]);
          if (ctData) setClassTeacherData(ctData);
          if (ctAnalyticsRes) setCtAnalytics(ctAnalyticsRes);
        } catch (e) {
          console.error('Error loading class teacher section data', e);
        }
      }

      // Load Smart Board classroom sessions and annotations
      try {
        const [sessRes, annRes, actSess] = await Promise.all([
          api.get('/smartboard/sessions/history'),
          api.get('/smartboard/annotations'),
          api.get('/smartboard/sessions/active'),
        ]);
        setClassroomSessions(Array.isArray(sessRes) ? sessRes : []);
        setSavedAnnotations(Array.isArray(annRes) ? annRes : []);
        setActiveSession(actSess || null);
      } catch (e) {
        console.error('Unable to load Smart Board session history:', e);
      }

      // Load Timetable Schedule & Smart Board Timetable Suggestion
      try {
        const [ttRes, suggRes] = await Promise.all([
          api.get('/timetable/teacher'),
          api.get('/timetable/smartboard/suggestion'),
        ]);
        setTimetableSchedule(ttRes || null);
        setSmartBoardSuggestion(suggRes?.hasScheduledClass ? suggRes : null);
      } catch (e) {
        console.error('Unable to load teacher timetable:', e);
      }
    } catch (err: any) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSimulationsActivitiesAndAssignments = async () => {
    try {
      let simUrl = '/simulation-activity/simulations?isPublished=true';
      if (simFilterGrade) simUrl += `&grade=${simFilterGrade}`;
      let actUrl = '/simulation-activity/activities?isPublished=true';
      if (simFilterGrade) actUrl += `&grade=${simFilterGrade}`;

      const [simulations, activities, assignments] = await Promise.all([
        api.get<any[]>(simUrl),
        api.get<any[]>(actUrl),
        api.get<any[]>('/simulation-activity/assignments/teacher'),
      ]);

      setTeacherSimulations(Array.isArray(simulations) ? simulations : []);
      setTeacherActivities(Array.isArray(activities) ? activities : []);
      setTeacherAssignments(Array.isArray(assignments) ? assignments : []);
    } catch (e) {
      console.error('Failed to load teacher simulation data', e);
    }
  };

  const openWorkspace = async (alloc: any, switchTab = true) => {
    if (!alloc) return;
    const sectionId = alloc.sectionId?._id || alloc.sectionId?.id || alloc.sectionId;
    const centralSubjectId = alloc.centralSubjectId?._id || alloc.centralSubjectId?.id || alloc.centralSubjectId;

    setWorkspaceLoading(true);
    try {
      const data = await api.get(`/teacher/workspace/${sectionId}/${centralSubjectId}`);
      setSelectedWorkspace(data);
      setCourseStudents((data.students || []).map((enrollment: any) => {
        const student = enrollment.studentId && typeof enrollment.studentId === 'object'
          ? enrollment.studentId
          : {};
        const studentId = student.id || student._id || enrollment.studentId;
        return {
          id: String(studentId),
          rollNumber: enrollment.rollNumber,
          fullName: student.fullName || 'Student',
          username: student.username || '',
          status: 'PRESENT',
          theoryMarks: '',
          practicalMarks: '',
          remarks: '',
        };
      }));

      const idx = allocations.findIndex(
        (a) => (a.id || a._id) === (alloc.id || alloc._id)
      );
      if (idx !== -1) setSelectedAllocIndex(idx);

      // Pre-fill default attendance
      const initialAtt: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
      (data.students || []).forEach((s: any) => {
        const sid = s.studentId?._id || s.studentId?.id || s.studentId;
        initialAtt[sid] = 'PRESENT';
      });
      setAttendanceSheet(initialAtt);

      setMarksSheet({});

      // Fetch admin-configured assessments for this section & subject
      try {
        const asmRes: any = await api.get(`/assessment/items?sectionId=${sectionId}&centralSubjectId=${centralSubjectId}`);
        const asmList = Array.isArray(asmRes) ? asmRes : asmRes?.data || [];
        setAssignedAssessments(asmList);
        if (asmList.length > 0) {
          const firstAsm = asmList[0];
          const firstId = firstAsm.id || firstAsm._id;
          setSelectedAdminAssessmentId(firstId);
          setMarksTheoryMax(firstAsm.fullMarksTheory ?? 75);
          setMarksPracticalMax(firstAsm.fullMarksPractical ?? 25);
          setMarksExamType(firstAsm.examType || 'FIRST_TERM');
          if (firstId) {
            await applySavedMarks(firstId);
          }
        } else {
          setSelectedAdminAssessmentId('');
        }
      } catch (asmErr) {
        console.warn('Unable to load assessments for this section:', asmErr);
        setAssignedAssessments([]);
      }

      try {
        const history = await api.get<any[]>(`/teacher/attendance/${sectionId}`);
        setAttendanceHistoryList((Array.isArray(history) ? history : []).map((record: any) => {
          const records = record.records || [];
          const present = records.filter((item: any) => item.status === 'PRESENT').length;
          const absent = records.filter((item: any) => item.status === 'ABSENT').length;
          const late = records.filter((item: any) => item.status === 'LATE').length;
          const excused = records.filter((item: any) => item.status === 'EXCUSED' || item.status === 'LEAVE').length;
          const total = records.length;
          return {
            id: record.id || record._id,
            date: record.date ? new Date(record.date).toLocaleDateString() : '—',
            period: record.periodNumber || '—',
            topic: record.topic || '',
            present,
            absent,
            late,
            excused,
            total,
            rate: total ? `${Math.round((present / total) * 100)}%` : '—',
            status: 'RECORDED',
          };
        }));
      } catch (historyError) {
        console.error('Unable to load attendance history for this section:', historyError);
        setAttendanceHistoryList([]);
      }

      // Fetch syllabus progress for this section & subject
      try {
        const sylRes = await api.get(
          `/analytics/subject-teacher?sectionId=${sectionId}&centralSubjectId=${centralSubjectId}`
        );
        setSyllabusList(sylRes?.chapters || []);
      } catch (e) {
        setSyllabusList([]);
      }

      if (switchTab) {
        setActiveNav('MY_SUBJECTS');
      }
    } catch (err: any) {
      console.error('Error loading subject workspace', err);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const handleOpenTextbook = async (alloc: any) => {
    if (!alloc) return;
    const subId = alloc.centralSubjectId?._id || alloc.centralSubjectId?.id || alloc.centralSubjectId;
    const sec = alloc.sectionId;
    const secId = sec?._id || sec?.id || sec;
    try {
      if (secId && subId) {
        const ws = await api.get<any>(`/teacher/workspace/${secId}/${subId}`);
        const tb = ws?.digitalTextbook?.textbook || ws?.textbooks?.[0];
        if (tb) {
          setActiveReaderTextbook({ ...tb, id: tb.id || tb._id });
          return;
        }
      }
    } catch {}

    try {
      const fallback = await api.get<any>(`/curriculum/textbooks?subjectId=${subId}`);
      const raw = fallback?.data?.textbooks || fallback?.textbooks || (Array.isArray(fallback?.data) ? fallback.data : fallback);
      const book = Array.isArray(raw) ? raw[0] : raw;
      if (book) {
        setActiveReaderTextbook({ ...book, id: book.id || book._id });
        return;
      }
    } catch {}

    // Fallback by grade
    const grade = alloc.centralSubjectId?.gradeNumber || alloc.sectionId?.classId?.gradeNumber || 10;
    try {
      const gradeBooks = await api.get<any>(`/curriculum/textbooks?grade=${grade}`);
      const raw = gradeBooks?.data?.textbooks || gradeBooks?.textbooks || (Array.isArray(gradeBooks?.data) ? gradeBooks.data : gradeBooks);
      if (Array.isArray(raw) && raw.length > 0) {
        setActiveReaderTextbook({ ...raw[0], id: raw[0].id || raw[0]._id });
        return;
      }
    } catch {}

    alert('Official CDC Textbook PDF is being indexed for this subject.');
  };

  const handleOpenLauncher = async (defaultAlloc?: any) => {
    setIsLauncherOpen(true);
    let targetIndex = 0;
    if (defaultAlloc && allocations.length > 0) {
      const idx = allocations.findIndex((a) => (a.id || a._id) === (defaultAlloc.id || defaultAlloc._id));
      if (idx !== -1) targetIndex = idx;
    }
    setLauncherAllocIndex(targetIndex);
    if (allocations[targetIndex]) {
      await loadLauncherResourcesForAlloc(allocations[targetIndex]);
    }
  };

  const loadLauncherResourcesForAlloc = async (alloc: any) => {
    if (!alloc) return;
    setLauncherLoading(true);
    try {
      const grade = alloc.centralSubjectId?.gradeNumber || alloc.sectionId?.classId?.gradeNumber;
      const sectionId = alloc.sectionId?._id || alloc.sectionId?.id || alloc.sectionId;
      const subjectId = alloc.centralSubjectId?._id || alloc.centralSubjectId?.id || alloc.centralSubjectId;
      const [ws, simRes, actRes] = await Promise.all([
        api.get(`/teacher/workspace/${sectionId}/${subjectId}`),
        api.get(`/smartboard/simulations${grade ? `?grade=${grade}` : ''}`),
        api.get(`/smartboard/activities${grade ? `?grade=${grade}` : ''}`),
      ]);

      const tbs = [ws?.digitalTextbook?.textbook, ...(ws?.digitalTextbook?.supplementary || [])].filter(Boolean);
      setLauncherTextbooks(tbs);
      setLauncherTextbookMessage(ws?.digitalTextbook?.reason || null);
      setLauncherSelectedTbId(tbs.length > 0 ? (tbs[0].id || tbs[0]._id) : '');
      setLauncherChapters([]);
      setLauncherSimulations(Array.isArray(simRes) ? simRes : []);
      setLauncherActivities(Array.isArray(actRes) ? actRes : []);

      if (tbs.length > 0) {
        const detailed = await api.get(`/curriculum/textbooks/${tbs[0].id || tbs[0]._id}`);
        const chs = detailed?.detailedChapters || detailed?.chapters || [];
        setLauncherChapters(chs);
        if (chs.length > 0) {
          setLauncherSelectedChapter(chs[0].chapterNumber || 1);
          setLauncherLessonTitle(chs[0].title || chs[0].name || '');
        }
      }
      if (Array.isArray(simRes) && simRes.length > 0) {
        setLauncherSelectedSim(simRes[0].entryUrl || 'chem-simulation.html');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLauncherLoading(false);
    }
  };

  /**
   * One-click Smart Board for a given class, section and subject. It creates the same server session as the
   * launcher dialog, so the board opens with the teacher's class, section, subject, medium and the right textbook
   * (and the school's allocation rules are enforced), instead of a bare link to a PDF.
   */
  const quickLaunchSmartBoard = async (target: { sectionId: any; subjectId: any; textbookId?: string; title?: string }) => {
    const idOf = (v: any) => String(v?.id || v?._id || v || '');
    const alloc = allocations.find((a) => idOf(a.sectionId) === idOf(target.sectionId) && idOf(a.centralSubjectId) === idOf(target.subjectId));
    const classId = idOf(alloc?.sectionId?.classId);
    if (!alloc || !classId) {
      toast('Open the Smart Board from one of your allocated classes.', 'error');
      return;
    }
    const board = window.open('about:blank', '_blank');
    if (!board) {
      toast('The Smart Board could not open. Please allow pop-ups for this site and try again.', 'error');
      return;
    }
    const title = target.title || 'Interactive Classroom Session';
    const create = (textbookId?: string) =>
      api.post<{ launcherUrl?: string }>('/smartboard/sessions', {
        classId,
        sectionId: idOf(target.sectionId),
        subjectId: idOf(target.subjectId),
        textbookId,
        lessonTitle: title,
        initialResourceType: 'TEXTBOOK',
        initialResourceName: title,
      });
    try {
      let session: { launcherUrl?: string };
      try {
        session = await create(target.textbookId);
      } catch (err: any) {
        // the chosen book is not the right-medium book for this section: let the server pick the correct one
        if (!target.textbookId) throw err;
        session = await create(undefined);
      }
      if (!session.launcherUrl) throw new Error('The Smart Board session was created without a launch URL.');
      const url = new URL(session.launcherUrl, window.location.origin);
      url.searchParams.set('mode', 'TEXTBOOK');
      url.searchParams.set('title', title);
      board.location.href = url.toString();
    } catch (err: any) {
      board.close();
      toast(err?.message || 'Unable to launch the Smart Board. Please try again.', 'error');
    }
  };

  const handleExecuteLaunch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const alloc = allocations[launcherAllocIndex];
    if (!alloc) {
      alert('No teaching allocation is available for this Smart Board session.');
      return;
    }

    if (launcherMode === 'SIMULATION' && !launcherSelectedSim) {
      alert('Select a simulation before launching the Smart Board.');
      return;
    }

    setLauncherLoading(true);
    const smartBoardWindow = window.open('about:blank', '_blank');
    if (!smartBoardWindow) {
      setLauncherLoading(false);
      alert('The Smart Board could not open. Please allow pop-ups and try again.');
      return;
    }

    try {
      let initialResourceName = 'Whiteboard';
      let initialResourceUrl = '';
      if (launcherMode === 'TEXTBOOK') {
        const textbook = launcherTextbooks.find((item) => (item.id || item._id) === launcherSelectedTbId);
        initialResourceName = textbook?.title || 'CDC Textbook PDF';
        initialResourceUrl = `/api/v1/curriculum/textbooks/${launcherSelectedTbId}/pdf`;
      } else if (launcherMode === 'SIMULATION') {
        initialResourceName = 'Simulation';
        initialResourceUrl = launcherSelectedSim.startsWith('/')
          ? launcherSelectedSim
          : `/simulations/${launcherSelectedSim}`;
      }

      const session = await api.post<{ launcherUrl?: string }>('/smartboard/sessions', {
        classId: alloc.sectionId?.classId?.id || alloc.sectionId?.classId?._id || alloc.sectionId?.classId,
        sectionId: alloc.sectionId?.id || alloc.sectionId?._id || alloc.sectionId,
        subjectId: alloc.centralSubjectId?.id || alloc.centralSubjectId?._id || alloc.centralSubjectId,
        textbookId: launcherMode === 'TEXTBOOK' ? launcherSelectedTbId || undefined : undefined,
        chapterNumber: launcherMode === 'TEXTBOOK' ? launcherSelectedChapter || 1 : undefined,
        lessonTitle: launcherLessonTitle || 'Interactive Classroom Session',
        initialResourceType: launcherMode,
        initialResourceName,
        initialResourceUrl,
      });

      if (!session.launcherUrl) {
        throw new Error('The Smart Board session was created without a launch URL.');
      }

      const launchUrl = new URL(session.launcherUrl, window.location.origin);
      launchUrl.searchParams.set('mode', launcherMode);
      launchUrl.searchParams.set('title', launcherLessonTitle || 'Interactive Classroom Session');
      if (launcherMode === 'SIMULATION') launchUrl.searchParams.set('sim', initialResourceUrl);

      smartBoardWindow.location.href = launchUrl.toString();
      setIsLauncherOpen(false);
      loadTeacherData();
    } catch (error) {
      smartBoardWindow.close();
      console.error('Unable to launch Smart Board session:', error);
      alert(error instanceof Error ? error.message : 'Unable to launch Smart Board. Please try again.');
    } finally {
      setLauncherLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedWorkspace) return;
    try {
      const sectionId = selectedWorkspace.section.id || selectedWorkspace.section._id;
      const records = Object.entries(attendanceSheet).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      if (records.length === 0) {
        alert('No enrolled students are available to record attendance for.');
        return;
      }

      await api.post('/teacher/attendance', {
        sectionId,
        date: attendanceDate,
        centralSubjectId: selectedWorkspace.subject?.id || selectedWorkspace.subject?._id,
        periodNumber: attendancePeriod,
        topic: attendanceTopic,
        records,
      });

      try {
        const history = await api.get<any[]>(`/teacher/attendance/${sectionId}`);
        setAttendanceHistoryList((Array.isArray(history) ? history : []).map((record: any) => {
          const attendanceRecords = record.records || [];
          const present = attendanceRecords.filter((item: any) => item.status === 'PRESENT').length;
          const absent = attendanceRecords.filter((item: any) => item.status === 'ABSENT').length;
          const late = attendanceRecords.filter((item: any) => item.status === 'LATE').length;
          const excused = attendanceRecords.filter((item: any) => item.status === 'EXCUSED' || item.status === 'LEAVE').length;
          const total = attendanceRecords.length;
          return {
            id: record.id || record._id,
            date: record.date ? new Date(record.date).toLocaleDateString() : '—',
            period: record.periodNumber || '—',
            topic: record.topic || '',
            present,
            absent,
            late,
            excused,
            total,
            rate: total ? `${Math.round((present / total) * 100)}%` : '—',
            status: 'RECORDED',
          };
        }));
      } catch (historyError) {
        console.error('Attendance was saved, but history could not be refreshed:', historyError);
      }
      setAttendanceSaved(true);
      setTimeout(() => setAttendanceSaved(false), 3000);
      setAttendanceSuccessToast('Attendance saved successfully.');
      setTimeout(() => setAttendanceSuccessToast(null), 5000);
      alert('Attendance recorded successfully in MongoDB!');
    } catch (err: any) {
      console.error('Failed to save attendance:', err);
      alert(err.message || 'Failed to save attendance');
    }
  };

  const handleSaveMarks = async (saveAsDraft = false) => {
    if (!selectedWorkspace) return;
    setIsSubmittingMarks(true);
    try {
      const sectionId = selectedWorkspace.section.id || selectedWorkspace.section._id;
      const centralSubjectId = selectedWorkspace.subject.id || selectedWorkspace.subject._id;
      const academicYear = selectedWorkspace.section.academicYearId;
      const academicYearId = typeof academicYear === 'object'
        ? academicYear.id || academicYear._id
        : academicYear;

      let targetAssessmentId = selectedAdminAssessmentId;
      if (!targetAssessmentId) {
        const created: any = await api.post('/assessment/items', {
          academicYearId,
          sectionId,
          centralSubjectId,
          name: `${marksExamType.replace('_', ' ')} Evaluation`,
          examType: marksExamType,
          fullMarksTheory: marksTheoryMax,
          passMarksTheory: Math.round(marksTheoryMax * 0.35),
          fullMarksPractical: marksPracticalMax,
          passMarksPractical: Math.round(marksPracticalMax * 0.4),
          totalMarks: marksTheoryMax + marksPracticalMax,
          passMarks: Math.round((marksTheoryMax + marksPracticalMax) * 0.35),
        });
        targetAssessmentId = created.id || created._id;
        setSelectedAdminAssessmentId(targetAssessmentId);
      }

      const isBlank = (v: any) => v === '' || v === null || v === undefined;
      const entered = courseStudents.filter((st) => !isBlank(st.theoryMarks) || !isBlank(st.practicalMarks));
      const missing = courseStudents.length - entered.length;
      if (entered.length === 0) {
        alert('Enter marks for at least one student first.');
        setIsSubmittingMarks(false);
        return;
      }
      if (!saveAsDraft && missing > 0 && !window.confirm(`${missing} student(s) have no marks entered and will be left out of this submission. Submit anyway?`)) {
        setIsSubmittingMarks(false);
        return;
      }
      const overMax = entered.find((st) => Number(st.theoryMarks) > marksTheoryMax || Number(st.practicalMarks) > marksPracticalMax || Number(st.theoryMarks) < 0 || Number(st.practicalMarks) < 0);
      if (overMax) {
        alert(`Marks for ${overMax.name || overMax.fullName || 'a student'} are outside the allowed range (Theory 0-${marksTheoryMax}, Practical 0-${marksPracticalMax}).`);
        setIsSubmittingMarks(false);
        return;
      }

      const marksPayload = entered.map((st) => ({
        studentId: st.id,
        marksTheory: Number(st.theoryMarks) || 0,
        marksPractical: Number(st.practicalMarks) || 0,
        marksObtained: (Number(st.theoryMarks) || 0) + (Number(st.practicalMarks) || 0),
        remarks: st.remarks || '',
      }));

      await api.post(`/assessment/items/${targetAssessmentId}/marks`, {
        saveAsDraft,
        marks: marksPayload,
      });

      setMarksSaved(true);
      setTimeout(() => setMarksSaved(false), 3000);
      setMarksSuccessToast(saveAsDraft ? 'Marks draft saved.' : 'Official marks submitted to Administration & Principal!');
      setTimeout(() => setMarksSuccessToast(null), 5000);
      alert(saveAsDraft ? 'Draft saved successfully.' : 'Official marks submitted for Principal & Admin review!');
    } catch (err: any) {
      console.error('Failed to save assessment marks:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to submit marks');
    } finally {
      setIsSubmittingMarks(false);
    }
  };

  const handleVoiceMarkEntry = () => {
    setIsVoiceModalOpen(true);
    setIsListening(true);
    setVoiceTranscript('Listening... e.g. "Roll 1, 85 marks", "Roll 2, 92 marks"');

    // Simulate voice recognition or use SpeechRecognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setVoiceTranscript(`Recognized: "${transcript}"`);
          setIsListening(false);
          // Parse roll and marks
          const match = transcript.match(/roll\s*(\d+).*?(\d+)/i);
          if (match && selectedWorkspace?.students) {
            const roll = parseInt(match[1]);
            const mark = parseInt(match[2]);
            const targetStudent = selectedWorkspace.students.find((s: any) => s.rollNumber === roll);
            if (targetStudent) {
              const sid = targetStudent.studentId?._id || targetStudent.studentId?.id || targetStudent.studentId;
              setMarksSheet((prev) => ({ ...prev, [sid]: mark }));
              setVoiceTranscript(`Set Roll #${roll} (${targetStudent.studentId?.fullName}) to ${mark} marks.`);
            }
          }
        };
        recognition.onerror = () => {
          setIsListening(false);
          setVoiceTranscript('Voice recognition ready. Click a student below to dictate.');
        };
        recognition.start();
      } catch (e) {
        setIsListening(false);
      }
    } else {
      setTimeout(() => {
        setIsListening(false);
        setVoiceTranscript('Voice recognition interface ready. Click dictate or select student.');
      }, 1500);
    }
  };

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const activeSubId = selectedWorkspace?.subject?.id || allocations[0]?.centralSubjectId?._id;
      if (!activeSubId) {
        alert('Select an allocated subject before asking the AI assistant.');
        return;
      }
      const response = await api.post('/ai/chat', {
        subjectCode: activeSubId,
        query: aiPrompt,
        mode: aiMode,
      });
      setAiResponse(response);
    } catch (err: any) {
      alert(err.message || 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  };

  const describeSection = (a: any) => {
    const sec = a?.sectionId && typeof a.sectionId === 'object' ? a.sectionId : null;
    const cls = sec?.classId && typeof sec.classId === 'object' ? sec.classId : null;
    const secName = sec?.name ? (/^section/i.test(sec.name) ? sec.name : `Section ${sec.name}`) : '';
    const clsName = cls?.name || (cls?.gradeNumber ? `Class ${cls.gradeNumber}` : '');
    const subj = a?.centralSubjectId && typeof a.centralSubjectId === 'object' ? a.centralSubjectId.name : '';
    return [subj, [clsName, secName].filter(Boolean).join(' – ')].filter(Boolean).join(' · ') || '—';
  };

  // Class / subject scopes for the student-insight views
  const insightScopes: InsightScope[] = (() => {
    const out: InsightScope[] = [];
    const ctSec = overview?.classTeacherSection;
    if (overview?.counts?.isClassTeacher && ctSec) {
      const id = String(ctSec._id || ctSec.id);
      out.push({ key: `ALL:${id}`, sectionId: id, label: `All subjects · Class ${ctSec.classId?.gradeNumber ?? ctSec.gradeNumber ?? ''} ${ctSec.name || ''}`.trim() });
    }
    (Array.isArray(allocations) ? allocations : []).forEach((a: any, i: number) => {
      const sec = a.sectionId && typeof a.sectionId === 'object' ? a.sectionId : null;
      const sub = a.centralSubjectId && typeof a.centralSubjectId === 'object' ? a.centralSubjectId : null;
      const secId = String(sec?._id || sec?.id || a.sectionId || '');
      const subId = String(sub?._id || sub?.id || a.centralSubjectId || '');
      if (!secId || !subId) return;
      const course: any = SUBJECT_COURSES[i];
      out.push({ key: `${secId}:${subId}`, sectionId: secId, subjectId: subId, label: course ? `${course.name} (${course.classSem})` : sub?.name || 'Subject' });
    });
    return out;
  })();

  const workspaceScopes: InsightScope[] = (() => {
    const secId = selectedWorkspace?.section?.id || selectedWorkspace?.section?._id;
    const subId = selectedWorkspace?.subject?.id || selectedWorkspace?.subject?._id;
    if (!secId || !subId) return [];
    return [{ key: `${secId}:${subId}`, sectionId: String(secId), subjectId: String(subId), label: selectedWorkspace?.subject?.name || 'Subject' }];
  })();

  // Open a learning resource (the uploaded file) instead of showing a placeholder message
  const openResource = async (res: any) => {
    const id = res?.id || res?._id;
    if (!id) {
      alert('This resource has no downloadable file.');
      return;
    }
    try {
      await api.downloadBlob(`/academic-materials/${id}/file`, res.originalFilename || res.title || 'resource');
    } catch (err: any) {
      alert(err.message || 'Could not open the file');
    }
  };

  const effectiveAllocations = Array.isArray(allocations) ? allocations : [];
  const institutionName = user?.institutionName || overview?.institution?.name || 'Institution not available';
  const staffId = user?.username ? `FAC-${user.username.toUpperCase()}` : 'Not available';
  const facultyEmail = user?.email || 'Not provided';

  // Distinct classes count
  const uniqueClassesCount = new Set(
    allocations.map((a) => a.sectionId?.classId?.gradeNumber || a.classId?.gradeNumber || a.sectionId?.classId?.name)
  ).size || allocations.length;

  // ── Helper computations for Faculty Academic Portal Overview ──
  const toMin = (t?: string) => {
    if (!t) return NaN;
    const parts = t.split(':').map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const getPeriodStatus = (startTime?: string, endTime?: string) => {
    const s = toMin(startTime);
    const e = toMin(endTime);
    if (isNaN(s) || isNaN(e)) return 'Upcoming';
    if (currentMinutes >= e) return 'Completed';
    if (currentMinutes >= s && currentMinutes < e) return 'Ongoing';
    return 'Upcoming';
  };

  const computeNextClassInfo = (schedule: any) => {
    if (!schedule) return null;
    const currentDayIndex = now.getDay();
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayDisplayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const todayList = schedule.todayClasses || [];
    const weekly = schedule.weeklyEntries || [];

    // 1. Ongoing class right now
    const ongoing = todayList.find((c: any) => {
      const s = toMin(c.startTime);
      const e = toMin(c.endTime);
      return !isNaN(s) && !isNaN(e) && currentMinutes >= s && currentMinutes < e;
    });

    if (ongoing) {
      const endMin = toMin(ongoing.endTime);
      const rem = endMin - currentMinutes;
      return {
        status: 'ONGOING',
        countdownText: `Ongoing (ends in ${rem} min)`,
        classData: ongoing,
        day: dayDisplayNames[currentDayIndex],
      };
    }

    // 2. Upcoming class today
    const upcomingToday = todayList.find((c: any) => {
      const s = toMin(c.startTime);
      return !isNaN(s) && s > currentMinutes;
    });

    if (upcomingToday) {
      const startMin = toMin(upcomingToday.startTime);
      const diff = startMin - currentMinutes;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return {
        status: 'UPCOMING_TODAY',
        countdownText: h > 0 ? `Starts in ${h} h ${m} min` : `Starts in ${m} min`,
        classData: upcomingToday,
        day: dayDisplayNames[currentDayIndex],
      };
    }

    // 3. Next class in the upcoming days of the week
    if (weekly.length > 0) {
      type Candidate = { entry: any; totalMinutesFromNow: number; dayName: string };
      const candidates: Candidate[] = [];

      weekly.forEach((entry: any) => {
        const entryDayName = (entry.dayOfWeek || '').toUpperCase();
        const targetDayIndex = dayNames.indexOf(entryDayName);
        if (targetDayIndex === -1) return;
        const startMin = toMin(entry.startTime);
        if (isNaN(startMin)) return;

        let dayDiff = (targetDayIndex - currentDayIndex + 7) % 7;
        if (dayDiff === 0) {
          dayDiff = 7;
        }
        const totalMin = dayDiff * 24 * 60 + (startMin - currentMinutes);
        candidates.push({
          entry,
          totalMinutesFromNow: totalMin,
          dayName: dayDisplayNames[targetDayIndex],
        });
      });

      candidates.sort((a, b) => a.totalMinutesFromNow - b.totalMinutesFromNow);

      if (candidates.length > 0 && candidates[0].totalMinutesFromNow > 0) {
        const nextOne = candidates[0];
        const h = Math.floor(nextOne.totalMinutesFromNow / 60);
        const m = nextOne.totalMinutesFromNow % 60;
        return {
          status: 'UPCOMING_WEEK',
          countdownText: `Starts in ${h} h ${m} min`,
          classData: nextOne.entry,
          day: nextOne.dayName,
        };
      }
    }

    return null;
  };

  const nextClassInfo = computeNextClassInfo(timetableSchedule);
  const todayFormattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
  const todayClassesList = timetableSchedule?.todayClasses || [];
  const scheduledClasses =
    timetableSchedule?.classes && timetableSchedule.classes.length > 0
      ? timetableSchedule.classes
      : allocations;
  const totalWeeklyPeriods = timetableSchedule?.totalWeeklyPeriods || 30;

  const findAllocForClass = (cls: any) => {
    return (
      allocations.find((a: any) => {
        const sId = String(a.sectionId?._id || a.sectionId?.id || a.sectionId);
        const subId = String(a.centralSubjectId?._id || a.centralSubjectId?.id || a.centralSubjectId);
        const matchSec = !cls.sectionId || sId === String(cls.sectionId);
        const matchSub = !cls.subjectId || subId === String(cls.subjectId);
        return matchSec && matchSub;
      }) || allocations[0]
    );
  };

  const handleQuickAction = (
    alloc: any,
    tab: 'OVERVIEW' | 'ATTENDANCE' | 'NOTES' | 'QUIZZES' | 'ASSIGNMENTS' | 'SMARTBOARD'
  ) => {
    if (tab === 'SMARTBOARD') {
      handleOpenLauncher(alloc);
      return;
    }
    openWorkspace(alloc, true);
    setWorkspaceTab(tab);
  };

  const quickActionBtnStyle: React.CSSProperties = {
    padding: '7px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const distinctStudentsCount = overview?.counts?.totalStudents ?? 0;
  const pendingSubmissionsCount = overview?.counts?.pendingSubmissions ?? 0;
  const overallAttendancePercent: number | null = overview?.counts?.overallAttendance ?? null;
  const upcomingAssignments = overview?.upcomingAssignments || [];
  const upcomingQuizzes = overview?.upcomingQuizzes || [];
  const recentActivities = overview?.recentActivities || [];

  return (
    <div
      className={isDarkMode ? 'teacher-dark dark-theme' : 'teacher-light light-theme'}
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: isDarkMode ? '#0b0f19' : '#f4faf8',
        color: isDarkMode ? '#f4faf8' : '#0e3e3b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      <style>{`
        .teacher-dark {
          background-color: #0b0f19 !important;
          color: #f4faf8 !important;
        }
        .teacher-dark aside {
          background-color: #111827 !important;
          border-color: #1f2937 !important;
        }
        .teacher-dark aside h3, .teacher-dark aside span, .teacher-dark aside button {
          color: #dcebe6;
        }
        .teacher-dark aside div[style*="border-bottom"],
        .teacher-dark aside div[style*="borderBottom"] {
          border-color: #1f2937 !important;
        }
        .teacher-dark header {
          background-color: #111827 !important;
          border-color: #1f2937 !important;
        }
        .teacher-dark header h2, .teacher-dark header span, .teacher-dark header div {
          color: #ebf5f1;
        }
        .teacher-dark main {
          background-color: #0b0f19 !important;
        }
        .teacher-dark div[style*="background: #ffffff"],
        .teacher-dark div[style*="background:#ffffff"],
        .teacher-dark div[style*="background: rgb(255, 255, 255)"],
        .teacher-dark div[style*="background-color: #ffffff"],
        .teacher-dark div[style*="background-color: rgb(255, 255, 255)"] {
          background: #151e2e !important;
          border-color: #243044 !important;
          color: #f4faf8;
        }
        .teacher-dark div[style*="background: #f4faf8"],
        .teacher-dark div[style*="background:#f4faf8"],
        .teacher-dark div[style*="background: rgb(248, 250, 252)"] {
          background: #0e3e3b !important;
          border-color: #134744 !important;
        }
        .teacher-dark button[style*="background: #ffffff"],
        .teacher-dark button[style*="background:#ffffff"],
        .teacher-dark a[style*="background: #ffffff"] {
          background: #134744 !important;
          border-color: #2f4f4c !important;
          color: #ebf5f1 !important;
        }
        .teacher-dark input,
        .teacher-dark select,
        .teacher-dark textarea {
          background-color: #134744 !important;
          color: #f4faf8 !important;
          border-color: #2f4f4c !important;
        }
        .teacher-dark [style*="color: #0e3e3b"],
        .teacher-dark [style*="color:#0e3e3b"],
        .teacher-dark [style*="color: rgb(15, 23, 42)"],
        .teacher-dark [style*="color: #134744"],
        .teacher-dark [style*="color: #2f4f4c"] {
          color: #f4faf8 !important;
        }
        .teacher-dark [style*="color: #5f736f"],
        .teacher-dark [style*="color:#5f736f"] {
          color: #8da19d !important;
        }
        .teacher-dark [style*="border: 1px solid #dcebe6"],
        .teacher-dark [style*="border:1px solid #dcebe6"],
        .teacher-dark [style*="border-bottom: 1px solid #dcebe6"],
        .teacher-dark [style*="border-top: 1px solid #dcebe6"],
        .teacher-dark [style*="border-right: 1px solid #dcebe6"],
        .teacher-dark [style*="border-left: 1px solid #dcebe6"] {
          border-color: #243044 !important;
        }
        .teacher-dark td, .teacher-dark th {
          border-color: #243044 !important;
          color: #dcebe6 !important;
        }
      `}</style>
      <HiddenNavStyle hidden={hiddenNavs} />
      {/* ══════════════════════════════════════════════════════════════════
          1. LEFT SIDEBAR NAVIGATION (Matching Screenshot 1 & 2)
         ══════════════════════════════════════════════════════════════════ */}
      <aside
        style={{
          width: isSidebarCollapsed ? '72px' : '260px',
          background: isDarkMode ? '#111827' : '#ffffff',
          borderRight: isDarkMode ? '1px solid #1f2937' : '1px solid #dcebe6',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          transition: 'width 0.2s ease, background-color 0.2s ease',
        }}
      >
        {/* Brand / Institution Monogram Header */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #dcebe6', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SchoolLogoBadge size={40} radius={10} fallback={
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#117a6b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            P
          </div>
          } />
          {!isSidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {institutionName}
              </h3>
              <p style={{ fontSize: '11px', color: '#5f736f', margin: 0, fontWeight: '600' }}>Faculty Portal</p>
            </div>
          )}
        </div>

        {/* Collapsible Navigation Groups */}
        <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* GROUP 1: Academic */}
          <div>
            {!isSidebarCollapsed && (
              <div
                onClick={() => toggleGroup('Academic')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#8da19d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                }}
              >
                <span>Academic</span>
                {openGroups.Academic ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            )}
            {(openGroups.Academic || isSidebarCollapsed) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                {/* Overview */}
                <button
                  onClick={() => {
                    setActiveNav('OVERVIEW');
                    setSelectedWorkspace(null);
                  }}
                  title="Overview"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeNav === 'OVERVIEW' && !selectedWorkspace ? '#e6f7f0' : 'transparent',
                    color: activeNav === 'OVERVIEW' && !selectedWorkspace ? '#117a6b' : '#4b605b',
                    borderLeft: activeNav === 'OVERVIEW' && !selectedWorkspace ? '3px solid #117a6b' : '3px solid transparent',
                    textAlign: 'left',
                  }}
                >
                  <LayoutGrid size={17} color={activeNav === 'OVERVIEW' && !selectedWorkspace ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>Overview</span>}
                </button>

                {/* My Subjects */}
                <button
                  onClick={() => {
                    setActiveNav('MY_SUBJECTS');
                    if (allocations.length > 0 && !selectedWorkspace) {
                      openWorkspace(allocations[0], false);
                    }
                  }}
                  title="My Subjects"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeNav === 'MY_SUBJECTS' || selectedWorkspace ? '#e6f7f0' : 'transparent',
                    color: activeNav === 'MY_SUBJECTS' || selectedWorkspace ? '#117a6b' : '#4b605b',
                    borderLeft: activeNav === 'MY_SUBJECTS' || selectedWorkspace ? '3px solid #117a6b' : '3px solid transparent',
                    textAlign: 'left',
                  }}
                >
                  <BookOpen size={17} color={activeNav === 'MY_SUBJECTS' || selectedWorkspace ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span>My Subjects</span>
                      <span style={{ fontSize: '11px', background: '#dcebe6', color: '#2f4f4c', padding: '1px 6px', borderRadius: '10px' }}>
                        {allocations.length}
                      </span>
                    </div>
                  )}
                </button>

                {/* Class Teacher Dedicated Link - ONLY shown if assigned as Class Teacher by SuperAdmin/Principal */}
                {Boolean(overview?.counts?.isClassTeacher && overview?.classTeacherSection) && (
                  <button
                    onClick={() => {
                      setActiveNav('CLASS_TEACHER');
                      setSelectedWorkspace(null);
                    }}
                    title={`Class Teacher: ${overview.classTeacherSection.name}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      background: activeNav === 'CLASS_TEACHER' ? '#e6f7f0' : 'transparent',
                      color: activeNav === 'CLASS_TEACHER' ? '#117a6b' : '#4b605b',
                      borderLeft: activeNav === 'CLASS_TEACHER' ? '3px solid #117a6b' : '3px solid transparent',
                      textAlign: 'left',
                    }}
                  >
                    <ShieldCheck size={17} color={activeNav === 'CLASS_TEACHER' ? '#117a6b' : '#5f736f'} />
                    {!isSidebarCollapsed && (
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Class Teacher</span>
                          <span style={{ fontSize: '10px', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                            {overview.classTeacherSection.name}
                          </span>
                        </div>
                        <span style={{ fontSize: '10px', color: '#5f736f', fontWeight: '500' }}>Roster, Results & Report Cards</span>
                      </div>
                    )}
                  </button>
                )}



                </div>
            )}
          </div>

          {/* GROUP 2: Timetable */}
          <div>
            {!isSidebarCollapsed && (
              <div
                onClick={() => toggleGroup('Timetable')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#8da19d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                }}
              >
                <span>Timetable</span>
                {openGroups.Timetable ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            )}
            {(openGroups.Timetable || isSidebarCollapsed) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                <button
                  onClick={() => {
                    setActiveNav('TODAY_SCHEDULE');
                    setSelectedWorkspace(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: activeNav === 'TODAY_SCHEDULE' ? '1.5px solid #1fb589' : '1.5px solid transparent',
                    cursor: 'pointer',
                    background: activeNav === 'TODAY_SCHEDULE' ? '#effaf6' : 'transparent',
                    color: activeNav === 'TODAY_SCHEDULE' ? '#117a6b' : '#4b605b',
                    textAlign: 'left',
                  }}
                >
                  <Clock size={17} color={activeNav === 'TODAY_SCHEDULE' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>Today's Schedule</span>}
                </button>

                <button
                  onClick={() => {
                    setActiveNav('WEEKLY_TIMETABLE');
                    setSelectedWorkspace(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: activeNav === 'WEEKLY_TIMETABLE' ? '1.5px solid #1fb589' : '1.5px solid transparent',
                    cursor: 'pointer',
                    background: activeNav === 'WEEKLY_TIMETABLE' ? '#effaf6' : 'transparent',
                    color: activeNav === 'WEEKLY_TIMETABLE' ? '#117a6b' : '#4b605b',
                    textAlign: 'left',
                  }}
                >
                  <Calendar size={17} color={activeNav === 'WEEKLY_TIMETABLE' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>Weekly Timetable</span>}
                </button>

                <button
                  onClick={() => {
                    setActiveNav('WORKLOAD');
                    setSelectedWorkspace(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: activeNav === 'WORKLOAD' ? '1.5px solid #1fb589' : '1.5px solid transparent',
                    cursor: 'pointer',
                    background: activeNav === 'WORKLOAD' ? '#effaf6' : 'transparent',
                    color: activeNav === 'WORKLOAD' ? '#117a6b' : '#4b605b',
                    textAlign: 'left',
                  }}
                >
                  <Layers size={17} color={activeNav === 'WORKLOAD' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>My Workload</span>}
                </button>
              </div>
            )}
          </div>

          {/* GROUP 3: Teaching */}
          <div>
            {!isSidebarCollapsed && (
              <div
                onClick={() => toggleGroup('Teaching')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#8da19d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                }}
              >
                <span>Teaching</span>
                {openGroups.Teaching ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            )}
            {(openGroups.Teaching || isSidebarCollapsed) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                {/* Unified Learning Resources Button in Sidebar */}
                <button data-nav-feature="LEARNING_RESOURCES"
                  onClick={() => {
                    setActiveNav('LEARNING_RESOURCES');
                    setSelectedWorkspace(null);
                  }}
                  title="Learning Resources"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: activeNav === 'LEARNING_RESOURCES' ? '1.5px solid #1fb589' : '1.5px solid transparent',
                    cursor: 'pointer',
                    background: activeNav === 'LEARNING_RESOURCES' ? '#effaf6' : 'transparent',
                    color: activeNav === 'LEARNING_RESOURCES' ? '#117a6b' : '#4b605b',
                    textAlign: 'left',
                  }}
                >
                  <FolderPlus size={17} color={activeNav === 'LEARNING_RESOURCES' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span>Learning Resources</span>
                      <span style={{ fontSize: '10px', background: activeNav === 'LEARNING_RESOURCES' ? '#bbf7d0' : '#dcebe6', color: activeNav === 'LEARNING_RESOURCES' ? '#0f4c4a' : '#2f4f4c', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                        {learningResources.length}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveNav('TEACHING_DIARY');
                    setSelectedWorkspace(null);
                  }}
                  title="Teaching Diary"
                  aria-current={activeNav === 'TEACHING_DIARY' ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: activeNav === 'TEACHING_DIARY' ? '1.5px solid #1fb589' : '1.5px solid transparent',
                    cursor: 'pointer',
                    background: activeNav === 'TEACHING_DIARY' ? '#effaf6' : 'transparent',
                    color: activeNav === 'TEACHING_DIARY' ? '#117a6b' : '#4b605b',
                    textAlign: 'left',
                  }}
                >
                  <NotebookPen size={17} color={activeNav === 'TEACHING_DIARY' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>Teaching Diary</span>}
                </button>


                <button data-nav-feature="ASSIGNMENTS"
                  onClick={() => {
                    setActiveNav('ASSIGNMENTS');
                    if (allocations.length > 0) openWorkspace(allocations[0], false);
                    setWorkspaceTab('ASSIGNMENTS');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: activeNav === 'ASSIGNMENTS' ? '1.5px solid #1fb589' : '1.5px solid transparent',
                    cursor: 'pointer',
                    background: activeNav === 'ASSIGNMENTS' ? '#effaf6' : 'transparent',
                    color: activeNav === 'ASSIGNMENTS' ? '#117a6b' : '#4b605b',
                    textAlign: 'left',
                  }}
                >
                  <ClipboardList size={17} color={activeNav === 'ASSIGNMENTS' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>Assignments</span>}
                </button>

                <button data-nav-feature="QUIZZES"
                  onClick={() => {
                    setActiveNav('QUIZZES');
                    if (allocations.length > 0) openWorkspace(allocations[0], false);
                    setWorkspaceTab('QUIZZES');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: activeNav === 'QUIZZES' ? '1.5px solid #1fb589' : '1.5px solid transparent',
                    cursor: 'pointer',
                    background: activeNav === 'QUIZZES' ? '#effaf6' : 'transparent',
                    color: activeNav === 'QUIZZES' ? '#117a6b' : '#4b605b',
                    textAlign: 'left',
                  }}
                >
                  <HelpCircle size={17} color={activeNav === 'QUIZZES' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>Quizzes</span>}
                </button>
              </div>
            )}
          </div>

          {/* GROUP 4: Insights */}
          <div>
            {!isSidebarCollapsed && (
              <div
                onClick={() => {
                  toggleGroup('Insights');
                  setActiveNav('INSIGHTS');
                  setSelectedWorkspace(null);
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#8da19d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                }}
              >
                <span>Insights</span>
                {openGroups.Insights ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            )}
            {(openGroups.Insights || isSidebarCollapsed) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                <button
                  onClick={() => {
                    setActiveNav('INSIGHTS');
                    setSelectedWorkspace(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeNav === 'INSIGHTS' ? '#e6f7f0' : 'transparent',
                    color: activeNav === 'INSIGHTS' ? '#117a6b' : '#4b605b',
                    borderLeft: activeNav === 'INSIGHTS' ? '3px solid #117a6b' : '3px solid transparent',
                    textAlign: 'left',
                  }}
                >
                  <Activity size={17} color={activeNav === 'INSIGHTS' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>Insights</span>}
                </button>

                <button
                  onClick={() => {
                    setActiveNav('MONITORING');
                    setSelectedWorkspace(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeNav === 'MONITORING' ? '#e6f7f0' : 'transparent',
                    color: activeNav === 'MONITORING' ? '#117a6b' : '#4b605b',
                    borderLeft: activeNav === 'MONITORING' ? '3px solid #117a6b' : '3px solid transparent',
                    textAlign: 'left',
                  }}
                >
                  <TrendingUp size={17} color={activeNav === 'MONITORING' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>Academic Monitoring</span>}
                </button>

                <button
                  onClick={() => {
                    setActiveNav('PROGRESS');
                    setSelectedWorkspace(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeNav === 'PROGRESS' ? '#e6f7f0' : 'transparent',
                    color: activeNav === 'PROGRESS' ? '#117a6b' : '#4b605b',
                    borderLeft: activeNav === 'PROGRESS' ? '3px solid #117a6b' : '3px solid transparent',
                    textAlign: 'left',
                  }}
                >
                  <BarChart2 size={17} color={activeNav === 'PROGRESS' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>Student Progress</span>}
                </button>

                <button
                  onClick={() => {
                    setActiveNav('KNOWLEDGE_BASE');
                    setSelectedWorkspace(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeNav === 'KNOWLEDGE_BASE' ? '#e6f7f0' : 'transparent',
                    color: activeNav === 'KNOWLEDGE_BASE' ? '#117a6b' : '#4b605b',
                    borderLeft: activeNav === 'KNOWLEDGE_BASE' ? '3px solid #117a6b' : '3px solid transparent',
                    textAlign: 'left',
                  }}
                >
                  <Sparkles size={17} color={activeNav === 'KNOWLEDGE_BASE' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>Knowledge Base</span>}
                </button>

                <button data-nav-feature="AI_ASSISTANT"
                  onClick={() => {
                    setActiveNav('AI_ASSISTANT');
                    setSelectedWorkspace(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeNav === 'AI_ASSISTANT' ? '#e6f7f0' : 'transparent',
                    color: activeNav === 'AI_ASSISTANT' ? '#117a6b' : '#4b605b',
                    borderLeft: activeNav === 'AI_ASSISTANT' ? '3px solid #117a6b' : '3px solid transparent',
                    textAlign: 'left',
                  }}
                >
                  <Sparkles size={17} color={activeNav === 'AI_ASSISTANT' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>AI Teaching Assistant</span>}
                </button>
              </div>
            )}
          </div>

          {/* GROUP 5: Smart Board */}
          <div>
            {!isSidebarCollapsed && (
              <div
                onClick={() => toggleGroup('Smart Board')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#8da19d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                }}
              >
                <span>Smart Board</span>
                {openGroups['Smart Board'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            )}
            {(openGroups['Smart Board'] || isSidebarCollapsed) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenLauncher()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#4b605b',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <Compass size={17} color="#5f736f" />
                  {!isSidebarCollapsed && <span>Launch Smart Board</span>}
                </button>

                <button
                  type="button"
                  onClick={() => launchDesktopSmartBoard(() => toast(DESKTOP_SETUP_HINT, 'error'))}
                  title="Open the Smart Board desktop app on this computer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#4b605b',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <Monitor size={17} color="#5f736f" />
                  {!isSidebarCollapsed && <span>Smart Board on Desktop</span>}
                </button>

                <button data-nav-feature="SIMULATIONS"
                  onClick={() => {
                    setActiveNav('SIMULATIONS');
                    setSelectedWorkspace(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeNav === 'SIMULATIONS' ? '#e6f7f0' : 'transparent',
                    color: activeNav === 'SIMULATIONS' ? '#117a6b' : '#4b605b',
                    borderLeft: activeNav === 'SIMULATIONS' ? '3px solid #117a6b' : '3px solid transparent',
                    textAlign: 'left',
                  }}
                >
                  <Compass size={17} color={activeNav === 'SIMULATIONS' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>Explore Simulations</span>}
                </button>

                <button
                  onClick={() => handleOpenLauncher()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'transparent',
                    color: '#117a6b',
                    textAlign: 'left',
                  }}
                >
                  <Presentation size={17} color="#117a6b" />
                  {!isSidebarCollapsed && <span>Launch Smart Board</span>}
                </button>
              </div>
            )}
          </div>

          {/* GROUP 6: Communication */}
          <div>
            {!isSidebarCollapsed && (
              <div
                onClick={() => toggleGroup('Communication')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#8da19d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                }}
              >
                <span>Communication</span>
                {openGroups.Communication ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            )}
            {(openGroups.Communication || isSidebarCollapsed) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                <button
                  onClick={() => {
                    setActiveNav('ANNOUNCEMENTS');
                    setSelectedWorkspace(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeNav === 'ANNOUNCEMENTS' ? '#e6f7f0' : 'transparent',
                    color: activeNav === 'ANNOUNCEMENTS' ? '#117a6b' : '#4b605b',
                    borderLeft: activeNav === 'ANNOUNCEMENTS' ? '3px solid #117a6b' : '3px solid transparent',
                    textAlign: 'left',
                  }}
                >
                  <Megaphone size={17} color={activeNav === 'ANNOUNCEMENTS' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span>Announcements</span>
                      {announcementsList.length > 0 && (
                        <span style={{ fontSize: '11px', background: '#e6f7f0', color: '#117a6b', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                          {announcementsList.length}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveNav('NOTIFICATIONS');
                    setSelectedWorkspace(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeNav === 'NOTIFICATIONS' ? '#e6f7f0' : 'transparent',
                    color: activeNav === 'NOTIFICATIONS' ? '#117a6b' : '#4b605b',
                    borderLeft: activeNav === 'NOTIFICATIONS' ? '3px solid #117a6b' : '3px solid transparent',
                    textAlign: 'left',
                  }}
                >
                  <Bell size={17} color={activeNav === 'NOTIFICATIONS' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span>Notifications</span>
                      {unreadNotificationCount > 0 && (
                        <span style={{ fontSize: '11px', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                          {unreadNotificationCount}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedWorkspace(null);
                    setActiveNav('PROFILE');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeNav === 'PROFILE' ? (isDarkMode ? '#0b3f3d' : '#e6f7f0') : 'transparent',
                    color: activeNav === 'PROFILE' ? (isDarkMode ? '#2fcf9c' : '#117a6b') : (isDarkMode ? '#8da19d' : '#4b605b'),
                    borderLeft: activeNav === 'PROFILE' ? '3px solid #117a6b' : '3px solid transparent',
                    textAlign: 'left',
                  }}
                >
                  <User size={17} color={activeNav === 'PROFILE' ? '#117a6b' : '#5f736f'} />
                  {!isSidebarCollapsed && <span>Faculty Profile</span>}
                </button>



              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Collapse Toggle Button */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #dcebe6', background: '#ffffff' }}>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#5f736f',
              background: 'transparent',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <span>{isSidebarCollapsed ? '>>' : '<< Collapse'}</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════
          2. TOP HEADER (Matching Screenshots 1, 2)
         ══════════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <DemoBanner />
        <header
          style={{
            height: '64px',
            background: '#ffffff',
            borderBottom: '1px solid #dcebe6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Left: Breadcrumbs & Context */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ display: 'none', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ fontWeight: '600', color: '#5f736f' }}>Academic</span>
              <span style={{ color: '#cfdcd8' }}>/</span>
              <span style={{ fontWeight: '800', color: '#0e3e3b' }}>
                {activeNav === 'OVERVIEW'
                  ? 'Overview'
                  : activeNav === 'TEACHING_DIARY'
                    ? 'Teaching Diary'
                  : activeNav === 'MY_SUBJECTS'
                    ? 'My Subjects'
                    : activeNav === 'ATTENDANCE'
                      ? 'Attendance'
                      : activeNav === 'RESULTS'
                        ? 'Results'
                        : activeNav === 'TODAY_SCHEDULE'
                          ? "Today's Schedule"
                          : activeNav === 'WEEKLY_TIMETABLE'
                            ? 'Weekly Timetable'
                            : activeNav === 'WORKLOAD'
                              ? 'My Workload'
                              : activeNav === 'NOTES'
                                ? 'Notes'
                                : activeNav === 'MATERIALS'
                                  ? 'Materials'
                                  : activeNav === 'VIDEOS'
                                    ? 'Videos'
                                    : activeNav === 'PRESENTATIONS'
                                      ? 'Presentations'
                                      : activeNav === 'QUIZZES'
                                        ? 'Quizzes'
                                        : activeNav === 'ASSIGNMENTS'
                                          ? 'Assignments'
                                          : activeNav === 'INSIGHTS'
                                            ? 'Academic Insights'
                                            : activeNav === 'MONITORING'
                                            ? 'Academic Monitoring'
                                            : activeNav === 'PROGRESS'
                                              ? 'Student Progress'
                                              : activeNav === 'AI_ASSISTANT'
                                                ? 'AI Teaching Assistant'
                                                : activeNav === 'KNOWLEDGE_BASE'
                                                ? 'Knowledge Base'
                                                : activeNav === 'SIMULATIONS'
                                                  ? 'Simulations'
                                                  : activeNav === 'ANNOUNCEMENTS'
                                                    ? 'Announcements'
                                                    : activeNav === 'PROFILE' ? 'Faculty Profile & Security' : 'Notifications'}
              </span>
              {selectedWorkspace && (
                <>
                  <span style={{ color: '#cfdcd8' }}>/</span>
                  <span style={{ color: '#117a6b', fontWeight: '700' }}>
                    {selectedWorkspace.subject?.name} ({selectedWorkspace.section?.name})
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: Smart Board, Controls, Notifications, Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Smart Board Shortcut button matching screenshot */}
            <button
              onClick={() => handleOpenLauncher()}
              title="Launch Smart Board Interactive Teaching Canvas"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                background: isDarkMode ? '#134744' : '#ffffff',
                border: isDarkMode ? '1.5px solid #117a6b' : '1px solid #cfdcd8',
                borderRadius: '8px',
                color: isDarkMode ? '#2fcf9c' : '#0e3e3b',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
            >
              <Presentation size={15} color="#117a6b" />
              <span>Smart Board</span>
            </button>

            {/* Open the Smart Board desktop app (set up the first time by running smartboard/Launch.vbs) */}
            <button
              onClick={() => launchDesktopSmartBoard(() => toast(DESKTOP_SETUP_HINT, 'error'))}
              title="Open the Smart Board desktop app on this computer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 12px',
                background: isDarkMode ? '#134744' : '#ffffff',
                border: isDarkMode ? '1.5px solid #117a6b' : '1px solid #cfdcd8',
                borderRadius: '8px',
                color: isDarkMode ? '#2fcf9c' : '#0e3e3b',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            >
              <Monitor size={15} color="#117a6b" />
              <span>Desktop</span>
            </button>

            {/* Full Screen toggle */}
            <button
              onClick={toggleFullScreen}
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                background: isDarkMode ? '#134744' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDarkMode ? '#8da19d' : '#5f736f',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>



            {/* Notification Bell */}
            <button
              onClick={() => setActiveNav('NOTIFICATIONS')}
              title="Notifications"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                background: isDarkMode ? '#134744' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDarkMode ? '#8da19d' : '#5f736f',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
            >
              <Bell size={16} />
              {unreadNotificationCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 3px',
                    borderRadius: '8px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Faculty Profile Pill (Clickable -> Opens Faculty Academic Profile) */}
            <div
              onClick={() => {
                setSelectedWorkspace(null);
                setActiveNav('PROFILE');
              }}
              title="Click to view Faculty Profile & Details"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 10px',
                borderLeft: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                cursor: 'pointer',
                borderRadius: '8px',
                background: activeNav === 'PROFILE' ? (isDarkMode ? '#0b3f3d' : '#e6f7f0') : 'transparent',
                border: activeNav === 'PROFILE' ? (isDarkMode ? '1px solid #117a6b' : '1px solid #bfeede') : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (activeNav !== 'PROFILE') e.currentTarget.style.background = isDarkMode ? '#134744' : '#ebf5f1';
              }}
              onMouseLeave={(e) => {
                if (activeNav !== 'PROFILE') e.currentTarget.style.background = 'transparent';
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: isDarkMode ? '#0b3f3d' : '#dcfce7',
                  color: isDarkMode ? '#2fcf9c' : '#15803d',
                  border: isDarkMode ? '1px solid #117a6b' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '12px',
                }}
              >
                {user?.fullName ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'TC'}
              </div>
              <div>
                <div title={user?.fullNameNepali || undefined} style={{ fontSize: '13px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', lineHeight: '1.2' }}>
                  {user?.fullName || 'Teacher'}
                </div>
                <div style={{ fontSize: '11px', color: isDarkMode ? '#2fcf9c' : '#117a6b', fontWeight: 600 }}>
                  Profile & Security
                </div>
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
                border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                background: isDarkMode ? '#134744' : '#ffffff',
                color: isDarkMode ? '#cfdcd8' : '#2f4f4c',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Sign Out"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════════════
            3. MAIN CONTENT AREA
           ══════════════════════════════════════════════════════════════════ */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
                    {/* ══════════════════════════════════════════════════════════════════
              SECTION 1: FACULTY ACADEMIC PORTAL HEADER (Matching Screenshot 1)
             ══════════════════════════════════════════════════════════════════ */}
          {(activeNav === 'OVERVIEW' || activeNav === 'MY_SUBJECTS') && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #dcebe6',
                padding: '24px 28px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  {/* Pills row matching Screenshot 1 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 12px', background: '#ebf5f1', color: '#4b605b', borderRadius: '9999px', border: '1px solid #dcebe6' }}>
                      Faculty Academic Portal
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 12px', background: '#e6f7f0', color: '#117a6b', borderRadius: '9999px', border: '1px solid #bfeede' }}>
                      Active Faculty
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 12px', background: '#f4faf8', color: '#4b605b', border: '1px solid #dcebe6', borderRadius: '9999px', fontFamily: 'monospace' }}>
                      Staff ID: {staffId}
                    </span>
                  </div>

                  {/* Faculty Name matching Screenshot 1 */}
                  <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0e3e3b', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                    {user?.fullName || 'Teacher'}
                    {user?.fullNameNepali && <span lang="ne" style={{ fontSize: '17px', fontWeight: '700', color: '#5f736f', marginLeft: '10px' }}>({user?.fullNameNepali})</span>}
                  </h1>

                  {/* Subtitle details */}
                  <p style={{ fontSize: '13px', color: '#5f736f', margin: 0 }}>
                    Official Email: <span style={{ color: '#2f4f4c' }}>{facultyEmail}</span>
                  </p>
                </div>

                {/* Sign Out Button matching Screenshot 1 */}
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    background: '#ffffff',
                    border: '1px solid #cfdcd8',
                    borderRadius: '8px',
                    color: '#0e3e3b',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  <LogOut size={14} color="#5f736f" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Class Teacher Supervision banner if assigned */}
              {activeNav === 'OVERVIEW' && Boolean(overview?.counts?.isClassTeacher && overview?.classTeacherSection) && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px 18px',
                    background: 'linear-gradient(135deg, #effaf6 0%, #e6f7f0 100%)',
                    border: '1px solid #86efac',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <GraduationCap size={20} color="#15803d" />
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#166534' }}>
                        Class Teacher: Class {overview.classTeacherSection.classId?.gradeNumber ?? overview.classTeacherSection.gradeNumber ?? ''} – Section {overview.classTeacherSection.name || ''}
                      </span>
                      <span style={{ fontSize: '12px', color: '#15803d', marginLeft: '10px' }}>
                        {overview.classTeacherSection.studentCount ?? 0} Students Enrolled • {overview.classTeacherSection.todayAttendancePercent != null ? `${overview.classTeacherSection.todayAttendancePercent}% Today's Attendance` : "Today's roll call not taken yet"}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setActiveNav('MONITORING')}
                      style={{
                        padding: '5px 12px',
                        background: '#16a34a',
                        color: '#ffffff',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      Console →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 1: OVERVIEW (Exact match to Screenshots 1 & 2)
             ══════════════════════════════════════════════════════════════════ */}
          {activeNav === 'OVERVIEW' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* ROW 2: Next class (Left) & Today's schedule (Right) — SIDE BY SIDE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '20px' }}>
                {/* Left Card: Next class */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    padding: '22px 24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '12px', color: '#5f736f' }}>Next class</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0e3e3b' }}>
                        {nextClassInfo?.countdownText || 'No upcoming class scheduled'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                      {nextClassInfo?.classData?.subjectName || nextClassInfo?.classData?.subject || 'No upcoming class'}
                    </h3>

                    <div style={{ fontSize: '13px', color: '#4b605b', marginBottom: '4px' }}>
                      {nextClassInfo?.classData
                        ? `${nextClassInfo.classData.className || ''} — ${nextClassInfo.classData.sectionName || ''}${nextClassInfo.classData.roomNumber ? ` · Room ${nextClassInfo.classData.roomNumber}` : ''}`
                        : 'No scheduled class details available'}
                    </div>

                    <div style={{ fontSize: '13px', color: '#5f736f', marginBottom: '14px' }}>
                      {nextClassInfo ? `${nextClassInfo.day || ''} · ${nextClassInfo.classData?.startTime || ''}${nextClassInfo.classData?.endTime ? ` – ${nextClassInfo.classData.endTime}` : ''}` : ''}
                    </div>

                    <div style={{ fontSize: '12px', color: '#5f736f', marginBottom: '18px' }}>
                      No class currently scheduled.
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        if (nextClassInfo?.classData) handleOpenLauncher(nextClassInfo.classData);
                      }}
                      disabled={!nextClassInfo?.classData}
                      style={{
                        padding: '6px 14px',
                        background: '#ffffff',
                        color: '#0e3e3b',
                        border: '1px solid #cfdcd8',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      }}
                    >
                      View class
                    </button>
                  </div>
                </div>

                {/* Right Card: Today's schedule */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    padding: '22px 24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} color="#0e3e3b" />
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                          Today's schedule
                        </h3>
                      </div>
                      <span style={{ fontSize: '13px', color: '#5f736f' }}>
                        {todayFormattedDate}
                      </span>
                    </div>

                    {/* Schedule Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {todayClassesList.length > 0 ? (
                        todayClassesList.map((period: any, idx: number) => {
                          const periodStatus = getPeriodStatus(period.startTime, period.endTime);
                          return (
                            <div
                              key={period.id || idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 0',
                                borderBottom: idx < todayClassesList.length - 1 ? '1px solid #ebf5f1' : 'none',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div style={{ width: '48px', fontSize: '12px', color: '#5f736f', lineHeight: '1.4' }}>
                                  <div>{period.startTime}</div>
                                  <div>{period.endTime}</div>
                                </div>
                                <div>
                                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0e3e3b', margin: '0 0 2px 0' }}>
                                    {period.subjectName || period.subject}
                                  </h4>
                                  <div style={{ fontSize: '12px', color: '#5f736f' }}>
                                    {period.className} — {period.sectionName}{period.roomNumber ? ` · ${period.roomNumber}` : ''} · {user?.fullName || 'Teacher'}
                                  </div>
                                </div>
                              </div>
                              <span style={{ fontSize: '12px', color: '#5f736f' }}>
                                {periodStatus}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ padding: '16px 0', color: '#5f736f', fontSize: '13px' }}>
                          No classes are scheduled for today.
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <button
                      onClick={() => setActiveNav('WEEKLY_TIMETABLE')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#117a6b',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>Weekly timetable</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ══════════════════════════════════════════════════════════════
                  ROW 4: ACADEMIC STATISTICS (4 Cards, Screenshot 2)
                 ══════════════════════════════════════════════════════════════ */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {/* Card 1: Assigned Courses */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '20px 24px',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#4b605b' }}>Assigned Courses</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={16} color="#117a6b" />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0e3e3b', margin: '10px 0 2px 0' }}>
                      {allocations.length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5f736f' }}>
                      Across {overview?.counts?.assignedSections ?? new Set(allocations.map((a: any) => String(a.sectionId?._id || a.sectionId))).size} distinct section(s)
                    </div>
                  </div>
                </div>

                {/* Card 2: Enrolled Students */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '20px 24px',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#4b605b' }}>Enrolled Students</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} color="#2563eb" />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0e3e3b', margin: '10px 0 2px 0' }}>
                      {distinctStudentsCount}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5f736f' }}>
                      Active students in your classes
                    </div>
                  </div>
                </div>

                {/* Card 3: Pending Submissions */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '20px 24px',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#4b605b' }}>Pending Submissions</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Briefcase size={16} color="#6d5bd0" />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0e3e3b', margin: '10px 0 2px 0' }}>
                      {pendingSubmissionsCount || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5f736f' }}>
                      Student work awaiting grading
                    </div>
                  </div>
                </div>

                {/* Card 4: Overall Attendance */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '20px 24px',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#4b605b' }}>Overall Attendance</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={16} color="#117a6b" />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0e3e3b', margin: '10px 0 2px 0' }}>
                      {overallAttendancePercent != null ? `${overallAttendancePercent}%` : '—'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5f736f' }}>
                      {overallAttendancePercent != null ? 'Across all recorded roll calls' : 'No attendance taken yet'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ══════════════════════════════════════════════════════════════
                  ROW 5: MY ASSIGNED TEACHING COURSES (Screenshot 2)
                 ══════════════════════════════════════════════════════════════ */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #dcebe6',
                  padding: '24px 28px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                      My Assigned Teaching Courses
                    </h3>
                    <p style={{ fontSize: '13px', color: '#5f736f', margin: 0 }}>
                      Authorized courses with dedicated workspaces, interactive simulations, and digital teaching tools.
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      background: '#f4faf8',
                      color: '#2f4f4c',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      border: '1px solid #dcebe6',
                    }}
                  >
                    {SUBJECT_COURSES.length} Assigned Course{SUBJECT_COURSES.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* 3 Subjects in One Row Grid (2 Rows = 6 Cards) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {SUBJECT_COURSES.map((course, idx) => {
                    const alloc = allocations[course.allocIndex];
                    return (
                      <div
                        key={course.code + idx}
                        style={{
                          background: isDarkMode ? '#134744' : '#ffffff',
                          borderRadius: '14px',
                          border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                          padding: '18px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div>
                          {/* Top row: Code & Class */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: isDarkMode ? '#2fcf9c' : '#0f4c4a', background: isDarkMode ? '#0b3f3d' : '#e6f7f0', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                              {course.code}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#cfdcd8' : '#4b605b' }}>
                              {course.classSem}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 style={{ fontSize: '15px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: '0 0 8px 0', minHeight: '38px', lineHeight: '1.3' }}>
                            {course.name}
                          </h4>

                          {/* Timetable details are displayed only when provided by the API. */}
                          <div style={{ fontSize: '12px', color: isDarkMode ? '#8da19d' : '#5f736f', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {course.room && <span>{course.room}</span>}
                            {course.periods && <span>{course.periods}</span>}
                            {course.next && <span>{course.next}</span>}
                          </div>

                          {typeof course.studentCount === 'number' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#38bdf8' : '#0284c7', marginBottom: '14px' }}>
                              <Users size={14} />
                              <span>{course.studentCount} students</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons: Open Workspace + Attendance, Notes, Quiz, Assignment, Smart Board */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1' }}>
                          <button
                            onClick={() => {
                              setActiveCourseIndex(idx);
                              openWorkspace(alloc, true);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: '#0f5f55',
                              color: '#ffffff',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <BookOpen size={13} color="#ffffff" />
                            <span>Open Workspace</span>
                          </button>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                            <button
                              onClick={() => {
                                setActiveCourseIndex(idx);
                                openWorkspace(alloc, true);
                                setWorkspaceTab('ATTENDANCE');
                              }}
                              style={{ padding: '6px 2px', background: isDarkMode ? '#0b3f3d' : '#e6f7f0', color: isDarkMode ? '#2fcf9c' : '#0f4c4a', border: isDarkMode ? '1px solid #117a6b' : '1px solid #bfeede', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', textAlign: 'center' }}
                            >
                              Attendance
                            </button>
                            <button
                              onClick={() => {
                                setActiveCourseIndex(idx);
                                openWorkspace(alloc, true);
                                setWorkspaceTab('RESOURCES');
                              }}
                              style={{ padding: '6px 2px', background: isDarkMode ? '#134744' : '#f4faf8', color: isDarkMode ? '#dcebe6' : '#0e3e3b', border: isDarkMode ? '1px solid #4b605b' : '1px solid #dcebe6', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', textAlign: 'center' }}
                            >
                              Notes
                            </button>
                            <button
                              onClick={() => {
                                setActiveCourseIndex(idx);
                                openWorkspace(alloc, true);
                                setWorkspaceTab('QUIZZES');
                              }}
                              style={{ padding: '6px 2px', background: isDarkMode ? '#134744' : '#eff6ff', color: isDarkMode ? '#60a5fa' : '#1d4ed8', border: isDarkMode ? '1px solid #2563eb' : '1px solid #bfdbfe', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', textAlign: 'center' }}
                            >
                              Quiz
                            </button>
                            <button
                              onClick={() => {
                                setActiveCourseIndex(idx);
                                openWorkspace(alloc, true);
                                setWorkspaceTab('ASSIGNMENTS');
                              }}
                              style={{ padding: '6px 2px', background: isDarkMode ? '#134744' : '#f5f3ff', color: isDarkMode ? '#a78bfa' : '#4c3fa8', border: isDarkMode ? '1px solid #6d5bd0' : '1px solid #ede9fe', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', textAlign: 'center' }}
                            >
                              Assignment
                            </button>
                            <button
                              onClick={() => {
                                setActiveCourseIndex(idx);
                                handleOpenLauncher(alloc);
                              }}
                              style={{ padding: '6px 2px', background: isDarkMode ? '#134744' : '#f5f3ff', color: isDarkMode ? '#c084fc' : '#6d28d9', border: isDarkMode ? '1px solid #7c3aed' : '1px solid #ddd6fe', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', textAlign: 'center' }}
                            >
                              Smart Board
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {SUBJECT_COURSES.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', border: '1px dashed #cfdcd8', borderRadius: '12px', color: '#5f736f' }}>
                      No teaching allocations are available for this account.
                    </div>
                  )}
                </div>
              </div>

              {/* ══════════════════════════════════════════════════════════════
                  ROW 6: BOTTOM 3-COLUMN ROW (Assignments, Quizzes, Recent Activity)
                 ══════════════════════════════════════════════════════════════ */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {/* Column 1: Upcoming Assignments */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    padding: '20px 22px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={16} color="#6d5bd0" />
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Upcoming Assignments
                      </h3>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>
                      {upcomingAssignments.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {upcomingAssignments.length === 0 && (
                      <div style={{ fontSize: '12px', color: '#5f736f' }}>No upcoming assignments.</div>
                    )}
                    {upcomingAssignments.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          background: '#f4faf8',
                          border: '1px solid #dcebe6',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0e3e3b', marginBottom: '2px' }}>
                          {item.title}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5f736f' }}>
                          <span>{describeSection(item)}</span>
                          <span>Due {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Upcoming Quizzes */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    padding: '20px 22px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#2563eb" />
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Upcoming Quizzes
                      </h3>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>
                      {upcomingQuizzes.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {upcomingQuizzes.length === 0 && (
                      <div style={{ fontSize: '12px', color: '#5f736f' }}>No upcoming quizzes.</div>
                    )}
                    {upcomingQuizzes.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          background: '#f4faf8',
                          border: '1px solid #dcebe6',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0e3e3b', marginBottom: '2px' }}>
                          {item.title}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5f736f' }}>
                          <span>{describeSection(item)}</span>
                          <span>{item.durationMinutes ? `${item.durationMinutes} mins` : ''}{item.durationMinutes && item.totalMarks ? ' · ' : ''}{item.totalMarks ? `${item.totalMarks} Marks` : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Recent Activity */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    padding: '20px 22px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={16} color="#117a6b" />
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Recent Activity
                      </h3>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>
                      {recentActivities.length > 0 ? `${recentActivities.length} Events` : '0 Events'}
                    </span>
                  </div>

                  {recentActivities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {recentActivities.slice(0, 3).map((act: any, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            background: '#f4faf8',
                            border: '1px solid #dcebe6',
                          }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0e3e3b', marginBottom: '2px' }}>
                            {act.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#5f736f' }}>
                            {act.subjectName} · {act.className}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        border: '1px dashed #cfdcd8',
                        borderRadius: '10px',
                        padding: '24px 16px',
                        textAlign: 'center',
                        color: '#5f736f',
                        fontSize: '12px',
                        background: '#f4faf8',
                      }}
                    >
                      No recent department logs.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


                            {/* =========================================================================
              VIEW 2: MY SUBJECTS (Faculty Subject Workspace & Academic Engine)
              ========================================================================= */}
              {activeNav === 'MY_SUBJECTS' && (() => {
                const currentCourse = SUBJECT_COURSES[activeCourseIndex] || SUBJECT_COURSES[0];
                if (!currentCourse) {
                  return (
                    <div style={{ padding: '32px', textAlign: 'center', background: '#ffffff', border: '1px solid #dcebe6', borderRadius: '16px' }}>
                      <h3 style={{ margin: 0, color: '#0e3e3b' }}>No assigned subjects</h3>
                      <p style={{ margin: '8px 0 0', color: '#5f736f' }}>Your institution has not assigned a subject workspace yet.</p>
                    </div>
                  );
                }
                const matchingAlloc = allocations[currentCourse.allocIndex] || allocations[0];

                const countPresent = courseStudents.filter((s) => s.status === 'PRESENT').length;
                const countAbsent = courseStudents.filter((s) => s.status === 'ABSENT').length;
                const countLate = courseStudents.filter((s) => s.status === 'LATE').length;
                const countExcused = courseStudents.filter((s) => s.status === 'EXCUSED').length;

                const filteredAttendanceStudents = courseStudents.filter((s) => {
                  if (!attendanceSearch.trim()) return true;
                  const q = attendanceSearch.toLowerCase();
                  return s.fullName.toLowerCase().includes(q) || String(s.rollNumber).includes(q) || s.username.toLowerCase().includes(q);
                });

                const filteredResources = learningResources.filter((r) => {
                  if (resourcesFilter === 'ALL') return true;
                  return r.type === resourcesFilter;
                });

                // Marks Calculation Stats
                const totalPossible = marksTheoryMax + marksPracticalMax;
                const classScores = courseStudents.map((s) => (s.theoryMarks || 0) + (s.practicalMarks || 0));
                const avgScore = classScores.length ? Math.round(classScores.reduce((a, b) => a + b, 0) / classScores.length) : 0;
                const passCount = classScores.filter((sc) => sc >= 35).length;
                const passRate = classScores.length ? Math.round((passCount / classScores.length) * 100) : 100;
                const highestScore = classScores.length ? Math.max(...classScores) : 0;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {/* =========================================================================
                        MY CLASSES (3 Subjects Per Row Grid - 6 Subjects Total)
                        ========================================================================= */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #dcebe6',
                        padding: '24px 28px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                            My Classes
                          </h3>
                          <p style={{ fontSize: '13px', color: '#5f736f', margin: 0 }}>
                            From the published timetable — every subject and section you are scheduled to teach.
                          </p>
                        </div>
                        <span style={{ fontSize: '13px', color: '#4b605b', fontWeight: '700', background: '#f4faf8', padding: '4px 12px', borderRadius: '8px', border: '1px solid #dcebe6' }}>
                          {SUBJECT_COURSES.length} assigned subject{SUBJECT_COURSES.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      {/* 3 Subjects in One Row Grid (2 Rows = 6 Cards) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {SUBJECT_COURSES.map((subItem, idx) => {
                          const isCurrentActive = activeCourseIndex === idx;
                          const matchingAlloc = allocations[subItem.allocIndex];

                          return (
                            <div
                              key={subItem.code + idx}
                              style={{
                                border: isCurrentActive ? '2px solid #0f5f55' : (isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6'),
                                borderRadius: '14px',
                                background: isDarkMode ? '#134744' : '#ffffff',
                                padding: '18px 20px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: isCurrentActive ? '0 4px 12px rgba(15,81,50,0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div>
                                {/* Top row: Code & Class */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '800', color: isDarkMode ? '#2fcf9c' : '#0f4c4a', fontFamily: 'monospace', background: isDarkMode ? '#0b3f3d' : '#e6f7f0', padding: '3px 8px', borderRadius: '4px' }}>
                                    {subItem.code}
                                  </span>
                                  <span style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#cfdcd8' : '#4b605b' }}>
                                    {subItem.classSem}
                                  </span>
                                </div>

                                {/* Title */}
                                <h4 style={{ fontSize: '15px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: '0 0 8px 0', minHeight: '38px', lineHeight: '1.3' }}>
                                  {subItem.name}
                                </h4>

                                {/* Allocation details are shown only when provided by the timetable. */}
                                <div style={{ fontSize: '12px', color: isDarkMode ? '#8da19d' : '#5f736f', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                  {subItem.room && <span>{subItem.room}</span>}
                                  {subItem.periods && <span>{subItem.periods}</span>}
                                  {subItem.next && <span>{subItem.next}</span>}
                                </div>

                                {typeof subItem.studentCount === 'number' && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#38bdf8' : '#0284c7', marginBottom: '14px' }}>
                                    <Users size={14} />
                                    <span>{subItem.studentCount} students</span>
                                  </div>
                                )}
                              </div>

                              {/* 6 Quick Action buttons: Open Workspace + 5 actions */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => {
                                      setActiveCourseIndex(idx);
                                      setWorkspaceTab('OVERVIEW');
                                      if (matchingAlloc) openWorkspace(matchingAlloc, false);
                                    }}
                                    style={{
                                      flex: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      padding: '8px 12px',
                                      background: '#0f5f55',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    <BookOpen size={13} color="#ffffff" />
                                    <span>Open Workspace</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenTextbook(matchingAlloc);
                                    }}
                                    title="Open Official CDC Textbook PDF"
                                    style={{
                                      padding: '8px 12px',
                                      background: '#e6f7f0',
                                      color: '#117a6b',
                                      border: '1px solid #bfeede',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    <BookOpen size={13} />
                                    <span>Book PDF</span>
                                  </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                                  <button
                                    onClick={() => {
                                      setActiveCourseIndex(idx);
                                      setWorkspaceTab('ATTENDANCE');
                                      if (matchingAlloc) openWorkspace(matchingAlloc, false);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '6px 2px',
                                      background: isDarkMode ? '#0b3f3d' : '#e6f7f0',
                                      color: isDarkMode ? '#2fcf9c' : '#0f4c4a',
                                      border: isDarkMode ? '1px solid #117a6b' : '1px solid #bfeede',
                                      borderRadius: '6px',
                                      fontSize: '10px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    <span>Attendance</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveCourseIndex(idx);
                                      setWorkspaceTab('RESOURCES');
                                      if (matchingAlloc) openWorkspace(matchingAlloc, false);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '6px 2px',
                                      background: isDarkMode ? '#134744' : '#f4faf8',
                                      color: isDarkMode ? '#dcebe6' : '#0e3e3b',
                                      border: isDarkMode ? '1px solid #4b605b' : '1px solid #dcebe6',
                                      borderRadius: '6px',
                                      fontSize: '10px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    <span>Notes</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveCourseIndex(idx);
                                      setWorkspaceTab('QUIZZES');
                                      if (matchingAlloc) openWorkspace(matchingAlloc, false);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '6px 2px',
                                      background: isDarkMode ? '#134744' : '#eff6ff',
                                      color: isDarkMode ? '#60a5fa' : '#1d4ed8',
                                      border: isDarkMode ? '1px solid #2563eb' : '1px solid #bfdbfe',
                                      borderRadius: '6px',
                                      fontSize: '10px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    <span>Quiz</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveCourseIndex(idx);
                                      setWorkspaceTab('ASSIGNMENTS');
                                      if (matchingAlloc) openWorkspace(matchingAlloc, false);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '6px 2px',
                                      background: isDarkMode ? '#134744' : '#f5f3ff',
                                      color: isDarkMode ? '#a78bfa' : '#4c3fa8',
                                      border: isDarkMode ? '1px solid #6d5bd0' : '1px solid #ede9fe',
                                      borderRadius: '6px',
                                      fontSize: '10px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    <span>Assignment</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveCourseIndex(idx);
                                      if (matchingAlloc) handleOpenLauncher(matchingAlloc);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '6px 2px',
                                      background: isDarkMode ? '#134744' : '#f5f3ff',
                                      color: isDarkMode ? '#c084fc' : '#6d28d9',
                                      border: isDarkMode ? '1px solid #7c3aed' : '1px solid #ddd6fe',
                                      borderRadius: '6px',
                                      fontSize: '10px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    <span>Smart Board</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {SUBJECT_COURSES.length === 0 && (
                          <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', border: '1px dashed #cfdcd8', borderRadius: '12px', color: '#5f736f' }}>
                            No teaching allocations are available for this account.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Subject Information Banner */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #dcebe6',
                        padding: '22px 26px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '6px', fontFamily: 'monospace' }}>
                              {currentCourse.code}
                            </span>
                            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0e3e3b', margin: 0 }}>
                              {currentCourse.name}
                            </h2>
                            <span style={{ fontSize: '14px', color: '#5f736f', fontWeight: '600' }}>
                              ({currentCourse.nameNp})
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '12px' }}>
                            <span style={{ background: '#ebf5f1', color: '#2f4f4c', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                              {currentCourse.classSem}
                            </span>
                            <span style={{ background: '#ebf5f1', color: '#4b605b', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                              {currentCourse.credits}
                            </span>
                            <span style={{ background: '#e6f7f0', color: '#117a6b', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                              {courseStudents.length} Enrolled Students
                            </span>
                            <span style={{ background: '#f4faf8', color: '#5f736f', padding: '4px 10px', borderRadius: '6px' }}>
                              {currentCourse.room}
                            </span>
                          </div>
                        </div>

                        {/* Top Right Shortcuts */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => setWorkspaceTab('MONITORING')}
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
                            <Target size={15} />
                            <span>Academic Monitoring</span>
                          </button>

                          <button
                            onClick={() => {
                              const tb = selectedWorkspace?.digitalTextbook?.textbook || selectedWorkspace?.textbooks?.[0];
                              if (tb) {
                                setActiveReaderTextbook({ ...tb, id: tb.id || tb._id });
                              } else {
                                handleOpenTextbook(matchingAlloc);
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              background: '#0f5f55',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(4,120,87,0.25)',
                            }}
                          >
                            <BookOpen size={15} />
                            <span>CDC Textbook & PDF</span>
                          </button>

                          <button
                            onClick={() => handleOpenLauncher(matchingAlloc)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              background: '#0f5f55',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(15,81,50,0.2)',
                            }}
                          >
                            <Monitor size={15} />
                            <span>Launch Smart Board</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Clean 2-Row Workspace Toolbar (Exact Ordered Items, Zero Duplicates, Fully Visible) */}
                    <div
                      style={{
                        background: isDarkMode ? '#134744' : '#ffffff',
                        borderRadius: '16px',
                        border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Row 1 (8 Items: Overview, Book / CDC PDF, Attendance Engine, Marks Entry, Learning Resources, Upload Files, Curriculum & Units, Assignments) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' }}>
                        {[
                          { key: 'OVERVIEW', label: 'Overview', icon: BookOpen, type: 'TAB' },
                          { key: 'TEXTBOOK', label: 'Book / CDC PDF', count: 'Official', icon: BookOpen, type: 'TAB' },
                          { key: 'ATTENDANCE', label: 'Attendance Engine', icon: Calendar, type: 'TAB' },
                          { key: 'RESULTS', label: 'Marks Entry', icon: Award, type: 'TAB' },
                          { key: 'RESOURCES', label: 'Learning Resources', icon: Folder, type: 'TAB' },
                          { key: 'UPLOAD', label: 'Upload Files', icon: FolderPlus, type: 'ACTION', action: () => setIsUploadFilesModalOpen(true) },
                          { key: 'CURRICULUM', label: 'Curriculum & Units', count: (cdcChaptersData.DEFAULT || []).length || undefined, icon: BookOpenCheck, type: 'TAB' },
                          { key: 'ASSIGNMENTS', label: 'Assignments', count: (selectedWorkspace?.assignments || []).length || undefined, icon: ClipboardList, type: 'TAB' },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isTab = item.type === 'TAB';
                          const active = isTab && workspaceTab === item.key;

                          return (
                            <button
                              key={item.key}
                              onClick={() => {
                                if (isTab) {
                                  setWorkspaceTab(item.key as any);
                                } else if (item.action) {
                                  item.action();
                                }
                              }}
                              title={item.label}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 10px',
                                borderRadius: '9px',
                                fontSize: '12px',
                                fontWeight: active ? '800' : '700',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                minWidth: 0,
                                background: active
                                  ? '#0f5f55'
                                  : (isDarkMode ? '#0e3e3b' : '#f4faf8'),
                                color: active
                                  ? '#ffffff'
                                  : (isDarkMode ? '#dcebe6' : '#2f4f4c'),
                                border: active
                                  ? '1px solid #0f5f55'
                                  : (isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6'),
                                transition: 'all 0.15s ease',
                                boxShadow: active ? '0 2px 4px rgba(15,81,50,0.15)' : 'none',
                              }}
                            >
                              <Icon size={14} color={active ? '#ffffff' : (isDarkMode ? '#8da19d' : '#5f736f')} style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.label}
                              </span>
                              {item.count !== undefined && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    padding: '1px 6px',
                                    borderRadius: '9999px',
                                    fontWeight: '800',
                                    background: active ? 'rgba(255,255,255,0.25)' : (isDarkMode ? '#134744' : '#dcebe6'),
                                    color: active ? '#ffffff' : (isDarkMode ? '#38bdf8' : '#0f5f55'),
                                    flexShrink: 0,
                                  }}
                                >
                                  {item.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Row 2 (6 Items: Quizzes 3, Academic Monitoring 1 Flagged, Announcements, Student Progress 9, AI Lesson Copilot, Secure Vault) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                        {[
                          { key: 'QUIZZES', label: 'Quizzes', icon: HelpCircle, type: 'TAB' },
                          { key: 'MONITORING', label: 'Academic Monitoring', icon: Target, type: 'TAB' },
                          { key: 'ANNOUNCEMENTS', label: 'Announcements', icon: Megaphone, type: 'TAB' },
                          { key: 'PROGRESS', label: 'Student Progress', count: courseStudents.length || undefined, icon: BarChart2, type: 'TAB' },
                          { key: 'AI', label: 'AI Lesson Copilot', icon: Sparkles, type: 'TAB' },
                          { key: 'VAULT', label: 'Secure Vault', icon: Lock, type: 'ACTION', action: () => setIsVaultModalOpen(true) },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isTab = item.type === 'TAB';
                          const active = isTab && workspaceTab === item.key;

                          return (
                            <button
                              key={item.key}
                              onClick={() => {
                                if (isTab) {
                                  setWorkspaceTab(item.key as any);
                                } else if (item.action) {
                                  item.action();
                                }
                              }}
                              title={item.label}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 10px',
                                borderRadius: '9px',
                                fontSize: '12px',
                                fontWeight: active ? '800' : '700',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                minWidth: 0,
                                background: active
                                  ? '#0f5f55'
                                  : (isDarkMode ? '#0e3e3b' : '#f4faf8'),
                                color: active
                                  ? '#ffffff'
                                  : (isDarkMode ? '#dcebe6' : '#2f4f4c'),
                                border: active
                                  ? '1px solid #0f5f55'
                                  : (isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6'),
                                transition: 'all 0.15s ease',
                                boxShadow: active ? '0 2px 4px rgba(15,81,50,0.15)' : 'none',
                              }}
                            >
                              <Icon size={14} color={active ? '#ffffff' : (isDarkMode ? '#8da19d' : '#5f736f')} style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.label}
                              </span>
                              {item.count !== undefined && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    padding: '1px 6px',
                                    borderRadius: '9999px',
                                    fontWeight: '800',
                                    background: active ? 'rgba(255,255,255,0.25)' : (isDarkMode ? '#134744' : '#dcebe6'),
                                    color: active ? '#ffffff' : (isDarkMode ? '#38bdf8' : (item.key === 'MONITORING' ? '#dc2626' : '#0f5f55')),
                                    flexShrink: 0,
                                  }}
                                >
                                  {item.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Workspace Tab Content */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #dcebe6',
                        padding: '28px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        minHeight: '400px',
                      }}
                    >
                      {/* TAB 1: OVERVIEW */}
                      {workspaceTab === 'OVERVIEW' && (
                        <div>
                          {/* CDC Official Textbook Quick Access Banner */}
                          {(() => {
                            const currentTb = selectedWorkspace?.digitalTextbook?.textbook || selectedWorkspace?.textbooks?.[0];
                            return (
                              <div
                                style={{
                                  background: isDarkMode ? '#134744' : '#effaf6',
                                  border: '1.5px solid #117a6b',
                                  borderRadius: '14px',
                                  padding: '16px 20px',
                                  marginBottom: '20px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div
                                    style={{
                                      width: '44px',
                                      height: '44px',
                                      borderRadius: '10px',
                                      background: '#117a6b',
                                      color: '#ffffff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '22px',
                                      flexShrink: 0,
                                    }}
                                  >
                                    📖
                                  </div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '10px', fontWeight: '800', background: '#117a6b', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>
                                        CDC TEXTBOOK
                                      </span>
                                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#117a6b' }}>
                                        {currentTb?.medium || 'ENGLISH / NEPALI'} MEDIUM
                                      </span>
                                    </div>
                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: '2px 0 0 0' }}>
                                      {currentTb?.title || `${currentCourse.name} — Class ${currentCourse.grade || 10}`}
                                    </h4>
                                    <p style={{ fontSize: '11px', color: '#5f736f', margin: 0 }}>
                                      {currentTb?.titleNepali ? `${currentTb.titleNepali} • ` : ''}
                                      {currentTb?.pageCount ? `${currentTb.pageCount} Pages • ` : ''}
                                      Nepal CDC Approved Curriculum
                                    </p>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <button
                                    onClick={() => {
                                      if (currentTb) {
                                        setActiveReaderTextbook({ ...currentTb, id: currentTb.id || currentTb._id });
                                      } else {
                                        handleOpenTextbook(matchingAlloc);
                                      }
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '8px 14px',
                                      background: '#117a6b',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <BookOpen size={14} />
                                    <span>Read Book PDF</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => quickLaunchSmartBoard({ sectionId: selectedWorkspace?.section, subjectId: selectedWorkspace?.subject, textbookId: currentTb ? currentTb.id || currentTb._id : undefined, title: currentTb?.title })}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '8px 12px',
                                      background: isDarkMode ? '#134744' : '#ffffff',
                                      color: '#2563eb',
                                      border: '1px solid #bfdbfe',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Presentation size={14} />
                                    <span>Smart Board</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })()}

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ padding: '18px', background: '#f4faf8', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                              <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Academic Average GPA</span>
                              <div style={{ fontSize: '26px', fontWeight: '900', color: '#117a6b', margin: '6px 0' }}>{currentCourse.avgGpa}</div>
                              <span style={{ fontSize: '12px', color: '#16a34a' }}>+0.18 vs previous assessment</span>
                            </div>

                            <div style={{ padding: '18px', background: '#f4faf8', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                              <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Overall Attendance</span>
                              <div style={{ fontSize: '26px', fontWeight: '900', color: '#2563eb', margin: '6px 0' }}>{currentCourse.attendanceRate}</div>
                              <span style={{ fontSize: '12px', color: '#5f736f' }}>Consistent across 42 sessions</span>
                            </div>

                            <div style={{ padding: '18px', background: '#f4faf8', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                              <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Curriculum Completion</span>
                              <div style={{ fontSize: '26px', fontWeight: '900', color: '#0e3e3b', margin: '6px 0' }}>68%</div>
                              <span style={{ fontSize: '12px', color: '#117a6b' }}>3 of 5 Units Completed</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                              Curriculum Units & Teaching Pacing
                            </h3>
                            <button
                              onClick={() => setWorkspaceTab('CURRICULUM')}
                              style={{ background: 'transparent', border: 'none', color: '#117a6b', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                            >
                              View All 5 Units →
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                              { unit: 1, title: 'शब्द भण्डार र वर्णविन्यास', status: 'COMPLETED', progress: 100, hours: 8 },
                              { unit: 2, title: 'कविता खण्ड: शहीदहरूको सम्झना', status: 'COMPLETED', progress: 100, hours: 10 },
                              { unit: 3, title: 'व्याकरण खण्ड: कारक र विभक्ति', status: 'IN_PROGRESS', progress: 60, hours: 12 },
                              { unit: 4, title: 'कथा खण्ड: प्रत्युत्पन्नमतित्व', status: 'NOT_STARTED', progress: 0, hours: 8 },
                              { unit: 5, title: 'रचना खण्ड: पत्र तथा निबन्ध लेखन', status: 'NOT_STARTED', progress: 0, hours: 10 },
                            ].map((u) => (
                              <div
                                key={u.unit}
                                style={{
                                  padding: '14px 18px',
                                  borderRadius: '10px',
                                  border: '1px solid #dcebe6',
                                  background: '#ffffff',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#5f736f' }}>Unit {u.unit}</span>
                                    <strong style={{ fontSize: '14px', color: '#0e3e3b' }}>{u.title}</strong>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '2px' }}>
                                    {u.hours} Teaching Hours Allocated • CDC Standard Curriculum
                                  </div>
                                </div>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    background: u.status === 'COMPLETED' ? '#e6f7f0' : u.status === 'IN_PROGRESS' ? '#eff6ff' : '#f4faf8',
                                    color: u.status === 'COMPLETED' ? '#117a6b' : u.status === 'IN_PROGRESS' ? '#2563eb' : '#5f736f',
                                  }}
                                >
                                  {u.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TAB: CDC TEXTBOOK & DIGITAL PDF READER */}
                      {workspaceTab === 'TEXTBOOK' && (() => {
                        const currentTb = selectedWorkspace?.digitalTextbook?.textbook || selectedWorkspace?.textbooks?.[0];
                        const chapters = currentTb?.detailedChapters || currentTb?.chapters || [];
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div
                              style={{
                                background: isDarkMode ? '#134744' : '#effaf6',
                                border: '2px solid #117a6b',
                                borderRadius: '16px',
                                padding: '24px 28px',
                                boxShadow: '0 4px 14px rgba(17,122,107,0.08)',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                                  <div
                                    style={{
                                      width: '64px',
                                      height: '64px',
                                      borderRadius: '14px',
                                      background: '#117a6b',
                                      color: '#ffffff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '32px',
                                      boxShadow: '0 4px 12px rgba(17,122,107,0.3)',
                                      flexShrink: 0,
                                    }}
                                  >
                                    📖
                                  </div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '800', background: '#117a6b', color: '#ffffff', padding: '3px 9px', borderRadius: '4px' }}>
                                        OFFICIAL CDC TEXTBOOK
                                      </span>
                                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#117a6b', background: '#dcfce7', padding: '3px 9px', borderRadius: '4px' }}>
                                        {currentTb?.medium || 'ENGLISH / NEPALI'} MEDIUM
                                      </span>
                                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#5f736f' }}>
                                        Grade {currentTb?.gradeNumber || currentCourse.grade || 10} • Academic Year 2083
                                      </span>
                                    </div>
                                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: '0 0 4px 0' }}>
                                      {currentTb?.title || `${currentCourse.name} — Class ${currentCourse.grade || 10}`}
                                    </h2>
                                    {currentTb?.titleNepali && (
                                      <p style={{ fontSize: '13px', color: '#5f736f', margin: '0 0 4px 0' }}>
                                        {currentTb.titleNepali}
                                      </p>
                                    )}
                                    <div style={{ fontSize: '12px', color: '#5f736f', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                                      <span>📄 {currentTb?.pageCount ? `${currentTb.pageCount} Pages` : 'CDC Standard'}</span>
                                      <span>📑 {chapters.length} Chapters</span>
                                      <span>🇳🇵 Curriculum Development Centre (CDC), Sanothimi</span>
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  <button
                                    onClick={() => {
                                      if (currentTb) {
                                        setActiveReaderTextbook({ ...currentTb, id: currentTb.id || currentTb._id });
                                      } else {
                                        handleOpenTextbook(matchingAlloc);
                                      }
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '11px 20px',
                                      background: '#117a6b',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '10px',
                                      fontSize: '13px',
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                      boxShadow: '0 3px 8px rgba(17,122,107,0.3)',
                                    }}
                                  >
                                    <BookOpen size={16} />
                                    <span>Read Full Textbook PDF</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => quickLaunchSmartBoard({ sectionId: selectedWorkspace?.section, subjectId: selectedWorkspace?.subject, textbookId: currentTb ? currentTb.id || currentTb._id : undefined, title: currentTb?.title })}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '11px 18px',
                                      background: isDarkMode ? '#134744' : '#ffffff',
                                      color: '#2563eb',
                                      border: '1.5px solid #bfdbfe',
                                      borderRadius: '10px',
                                      fontSize: '13px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Presentation size={16} />
                                    <span>Launch in Smart Board</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Table of Contents / Chapters */}
                            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #dcebe6', padding: '22px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                                    Table of Contents & Curriculum Chapters
                                  </h3>
                                  <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                                    Official CDC national syllabus units with page-direct reading access
                                  </p>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '700', background: '#e6f7f0', color: '#117a6b', padding: '4px 10px', borderRadius: '6px' }}>
                                  {chapters.length} Chapters Indexed
                                </span>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {chapters.length > 0 ? (
                                  chapters.map((ch: any, cidx: number) => (
                                    <div
                                      key={cidx}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        background: isDarkMode ? '#134744' : '#f4faf8',
                                        border: '1px solid #dcebe6',
                                        borderRadius: '10px',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div
                                          style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: '#e6f7f0',
                                            color: '#117a6b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '800',
                                            fontSize: '13px',
                                          }}
                                        >
                                          {ch.chapterNumber || cidx + 1}
                                        </div>
                                        <div>
                                          <div style={{ fontSize: '14px', fontWeight: '700', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                                            {ch.title || ch.name || `Unit ${cidx + 1}`}
                                          </div>
                                          {ch.titleNepali && (
                                            <div style={{ fontSize: '12px', color: '#5f736f' }}>
                                              {ch.titleNepali}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {(ch.startPage || ch.endPage) && (
                                          <span style={{ fontSize: '12px', color: '#5f736f', fontWeight: '600' }}>
                                            Page {ch.startPage || 1} – {ch.endPage || 'End'}
                                          </span>
                                        )}
                                        <button
                                          onClick={() => {
                                            if (currentTb) {
                                              setActiveReaderTextbook({ ...currentTb, id: currentTb.id || currentTb._id });
                                            } else {
                                              handleOpenTextbook(matchingAlloc);
                                            }
                                          }}
                                          style={{
                                            padding: '6px 12px',
                                            background: '#117a6b',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <BookOpen size={12} />
                                          <span>Read Chapter</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div style={{ padding: '24px', textAlign: 'center', color: '#5f736f', fontSize: '13px' }}>
                                    Full textbook PDF is available. Click 'Read Full Textbook PDF' above to browse all chapters.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {workspaceTab === 'ATTENDANCE' && (
                        <div>
                          {/* Success Toast */}
                          {attendanceSuccessToast && (
                            <div
                              style={{
                                padding: '14px 20px',
                                background: '#e6f7f0',
                                border: '1px solid #86efac',
                                borderRadius: '10px',
                                color: '#0f4c4a',
                                fontSize: '13px',
                                fontWeight: '700',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <CheckCircle size={18} color="#117a6b" />
                              <span>{attendanceSuccessToast}</span>
                            </div>
                          )}

                          {/* Header & Sub-tab Switcher */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={20} color="#117a6b" />
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                                  Academic Attendance Engine
                                </h3>
                              </div>
                              <p style={{ fontSize: '12px', color: '#5f736f', margin: '4px 0 0 0' }}>
                                {currentCourse.name} ({currentCourse.code}) • {currentCourse.classSem}
                              </p>
                            </div>

                            {/* Subtabs: Mark Attendance vs Session History */}
                            <div style={{ display: 'flex', background: '#ebf5f1', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                              <button
                                onClick={() => setAttendanceSessionMode('MARK')}
                                style={{
                                  padding: '7px 16px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: attendanceSessionMode === 'MARK' ? '#ffffff' : 'transparent',
                                  color: attendanceSessionMode === 'MARK' ? '#0e3e3b' : '#5f736f',
                                  boxShadow: attendanceSessionMode === 'MARK' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                }}
                              >
                                Mark Attendance
                              </button>
                              <button
                                onClick={() => setAttendanceSessionMode('HISTORY')}
                                style={{
                                  padding: '7px 16px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: attendanceSessionMode === 'HISTORY' ? '#ffffff' : 'transparent',
                                  color: attendanceSessionMode === 'HISTORY' ? '#0e3e3b' : '#5f736f',
                                  boxShadow: attendanceSessionMode === 'HISTORY' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                }}
                              >
                                Session History ({attendanceHistoryList.length})
                              </button>
                            </div>
                          </div>

                          {attendanceSessionMode === 'MARK' ? (
                            <div>
                              {/* Session Details Form Box */}
                              <div
                                style={{
                                  background: '#f4faf8',
                                  borderRadius: '12px',
                                  border: '1px solid #dcebe6',
                                  padding: '18px 22px',
                                  marginBottom: '20px',
                                }}
                              >
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                  <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                                      Department / Stream
                                    </label>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#134744' }}>
                                      {currentCourse.department}
                                    </div>
                                  </div>

                                  <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                                      Semester / Class
                                    </label>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#134744' }}>
                                      {currentCourse.classSem}
                                    </div>
                                  </div>

                                  <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                                      Subject Code
                                    </label>
                                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#117a6b', fontFamily: 'monospace' }}>
                                      {currentCourse.code} - {currentCourse.name}
                                    </div>
                                  </div>

                                  <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                                      Session Date
                                    </label>
                                    <input
                                      type="date"
                                      value={attendanceDate}
                                      onChange={(e) => setAttendanceDate(e.target.value)}
                                      style={{ padding: '6px 10px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px', width: '100%', background: '#ffffff' }}
                                    />
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 2fr', gap: '16px', alignItems: 'flex-end' }}>
                                  <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                                      Period (1 - 8)
                                    </label>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                                        <button
                                          key={p}
                                          onClick={() => setAttendancePeriod(p)}
                                          style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            background: attendancePeriod === p ? '#0f5f55' : '#ffffff',
                                            color: attendancePeriod === p ? '#ffffff' : '#4b605b',
                                            border: attendancePeriod === p ? '1px solid #0f5f55' : '1px solid #cfdcd8',
                                          }}
                                        >
                                          {p}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                                      Time Slot
                                    </label>
                                    <select
                                      value={attendanceTimeSlot}
                                      onChange={(e) => setAttendanceTimeSlot(e.target.value)}
                                      style={{ padding: '6px 10px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px', width: '100%', background: '#ffffff' }}
                                    >
                                      <option value="09:00 - 09:45 AM">09:00 - 09:45 AM</option>
                                      <option value="09:45 - 10:30 AM">09:45 - 10:30 AM</option>
                                      <option value="10:45 - 11:30 AM">10:45 - 11:30 AM</option>
                                      <option value="11:30 - 12:15 PM">11:30 - 12:15 PM</option>
                                      <option value="01:00 - 01:45 PM">01:00 - 01:45 PM</option>
                                      <option value="01:45 - 02:30 PM">01:45 - 02:30 PM</option>
                                      <option value="02:30 - 03:15 PM">02:30 - 03:15 PM</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                                      Section
                                    </label>
                                    <input
                                      type="text"
                                      readOnly
                                      value={currentCourse.sectionName}
                                      style={{ padding: '6px 10px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px', width: '100%', background: '#ffffff', color: '#2f4f4c', fontWeight: '700' }}
                                    />
                                  </div>

                                  <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                                      Topic Covered
                                    </label>
                                    <input
                                      type="text"
                                      value={attendanceTopic}
                                      onChange={(e) => setAttendanceTopic(e.target.value)}
                                      placeholder="e.g. Unit 3: Byakaran - Karak ra Bibhakti"
                                      style={{ padding: '6px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px', width: '100%', background: '#ffffff' }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Live Counters & Bulk Actions Bar */}
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '16px',
                                  padding: '12px 18px',
                                  background: '#ffffff',
                                  borderRadius: '10px',
                                  border: '1px solid #dcebe6',
                                  flexWrap: 'wrap',
                                  gap: '12px',
                                }}
                              >
                                {/* Stat Badges */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: '800', background: '#e6f7f0', color: '#117a6b', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bfeede' }}>
                                    Present: {countPresent}
                                  </span>
                                  <span style={{ fontSize: '12px', fontWeight: '800', background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                                    Absent: {countAbsent}
                                  </span>
                                  <span style={{ fontSize: '12px', fontWeight: '800', background: '#f5f3ff', color: '#6d5bd0', padding: '4px 10px', borderRadius: '6px', border: '1px solid #ddd6fe' }}>
                                    Late: {countLate}
                                  </span>
                                  <span style={{ fontSize: '12px', fontWeight: '800', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                                    Excused: {countExcused}
                                  </span>
                                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>
                                    Total: {courseStudents.length}
                                  </span>
                                </div>

                                {/* Bulk Mark Buttons */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Bulk:</span>
                                  <button
                                    onClick={() => handleBulkAttendance('PRESENT')}
                                    style={{ padding: '5px 12px', background: '#e6f7f0', color: '#117a6b', border: '1px solid #bfeede', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                                  >
                                    All Present
                                  </button>
                                  <button
                                    onClick={() => handleBulkAttendance('ABSENT')}
                                    style={{ padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                                  >
                                    All Absent
                                  </button>
                                  <button
                                    onClick={() => handleBulkAttendance('LATE')}
                                    style={{ padding: '5px 12px', background: '#f5f3ff', color: '#6d5bd0', border: '1px solid #ddd6fe', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                                  >
                                    All Late
                                  </button>
                                  <button
                                    onClick={() => handleBulkAttendance('EXCUSED')}
                                    style={{ padding: '5px 12px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                                  >
                                    All Excused
                                  </button>
                                </div>
                              </div>

                              {/* Search Bar */}
                              <div style={{ marginBottom: '14px', position: 'relative' }}>
                                <Search size={15} color="#8da19d" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                                <input
                                  type="text"
                                  placeholder="Search enrolled students by name or roll number..."
                                  value={attendanceSearch}
                                  onChange={(e) => setAttendanceSearch(e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '12px', background: '#ffffff' }}
                                />
                              </div>

                              {/* Enrolled Students List */}
                              <div style={{ border: '1px solid #dcebe6', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                                <div style={{ padding: '10px 16px', background: '#f4faf8', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', color: '#4b605b' }}>
                                  <span>Enrolled Students ({filteredAttendanceStudents.length} of {courseStudents.length})</span>
                                  <span>Attendance Status</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  {filteredAttendanceStudents.map((st) => (
                                    <div
                                      key={st.id}
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #ebf5f1',
                                        background: st.status === 'ABSENT' ? '#fef2f2' : '#ffffff',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#2563eb', fontFamily: 'monospace', width: '28px' }}>
                                          #{st.rollNumber}
                                        </span>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#dcebe6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#2f4f4c' }}>
                                          {st.fullName.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div>
                                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#0e3e3b' }}>
                                            <button type="button" onClick={() => setDossier({ studentId: st.id, sectionId: idOfAny(selectedWorkspace?.section) })} title="Open student dossier" style={{ cursor: 'pointer', textDecoration: 'underline dotted', textUnderlineOffset: '3px', textAlign: 'left', fontWeight: 'inherit', color: 'inherit', fontSize: 'inherit' }}>{st.fullName}</button>
                                            {st.flagged && (
                                              <span style={{ marginLeft: '8px', fontSize: '10px', background: '#ede9fe', color: '#4c3fa8', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                                                Flagged
                                              </span>
                                            )}
                                          </div>
                                          <div style={{ fontSize: '11px', color: '#5f736f' }}>
                                            {st.username} • Attendance Rate: {st.attendanceRate}%
                                          </div>
                                        </div>
                                      </div>

                                      {/* Status Select Buttons */}
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        {[
                                          { key: 'PRESENT', label: 'Present', short: 'P', color: '#117a6b', bg: '#e6f7f0', border: '#bfeede' },
                                          { key: 'ABSENT', label: 'Absent', short: 'A', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                                          { key: 'LATE', label: 'Late', short: 'L', color: '#6d5bd0', bg: '#f5f3ff', border: '#ddd6fe' },
                                          { key: 'EXCUSED', label: 'Excused', short: 'E', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                                        ].map((opt) => {
                                          const isActive = st.status === opt.key;
                                          return (
                                            <button
                                              key={opt.key}
                                              onClick={() => handleStudentAttendanceStatus(st.id, opt.key as any)}
                                              style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                background: isActive ? opt.bg : '#ffffff',
                                                color: isActive ? opt.color : '#5f736f',
                                                border: isActive ? `1.5px solid ${opt.border}` : '1px solid #cfdcd8',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                              }}
                                            >
                                              <span style={{ fontWeight: '900' }}>{opt.short}</span>
                                              <span>{opt.label}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Footer Action Bar */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ fontSize: '12px', color: '#5f736f' }}>
                                  Submitting will lock this session record unless edited later by subject faculty.
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button
                                    onClick={() => handleBulkAttendance('PRESENT')}
                                    style={{ padding: '9px 18px', background: '#ebf5f1', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#2f4f4c' }}
                                  >
                                    Reset All
                                  </button>
                                  <button
                                    onClick={handleRecordAttendanceSession}
                                    style={{
                                      padding: '9px 22px',
                                      background: '#0f5f55',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '8px',
                                      fontSize: '13px',
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      boxShadow: '0 2px 4px rgba(15,81,50,0.2)',
                                    }}
                                  >
                                    <Check size={16} /> Confirm & Record Attendance
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Attendance History View */
                            <div>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6' }}>
                                  <tr>
                                    <th style={{ padding: '12px 16px', fontWeight: '800' }}>Date & Period</th>
                                    <th style={{ padding: '12px 16px', fontWeight: '800' }}>Topic Covered</th>
                                    <th style={{ padding: '12px 16px', fontWeight: '800' }}>Attendance Rate</th>
                                    <th style={{ padding: '12px 16px', fontWeight: '800' }}>Status</th>
                                    <th style={{ padding: '12px 16px', fontWeight: '800', textAlign: 'right' }}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {attendanceHistoryList.map((att) => (
                                    <tr key={att.id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                                      <td style={{ padding: '12px 16px' }}>
                                        <strong style={{ display: 'block', color: '#0e3e3b' }}>{att.date}</strong>
                                        <span style={{ fontSize: '11px', color: '#5f736f' }}>Period {att.period} • {att.timeSlot}</span>
                                      </td>
                                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#2f4f4c' }}>
                                        {att.topic}
                                      </td>
                                      <td style={{ padding: '12px 16px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#117a6b', background: '#e6f7f0', padding: '3px 8px', borderRadius: '4px' }}>
                                          {att.rate}
                                        </span>
                                        <span style={{ fontSize: '11px', color: '#5f736f', marginLeft: '6px' }}>
                                          ({att.present}/{att.total} Present)
                                        </span>
                                      </td>
                                      <td style={{ padding: '12px 16px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: '800', background: '#ebf5f1', color: '#4b605b', padding: '2px 8px', borderRadius: '4px' }}>
                                          {att.status}
                                        </span>
                                      </td>
                                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                        <button
                                          onClick={() => alert(`Session ${att.date} details: ${att.present} Present, ${att.absent} Absent. Topic: ${att.topic}`)}
                                          style={{ padding: '4px 10px', background: '#ffffff', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                          View Details
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 3: RESULTS & MARKS ENTRY */}
                      {workspaceTab === 'RESULTS' && (
                        <div>
                          {/* Success Toast */}
                          {marksSuccessToast && (
                            <div
                              style={{
                                padding: '14px 20px',
                                background: '#e6f7f0',
                                border: '1px solid #86efac',
                                borderRadius: '10px',
                                color: '#0f4c4a',
                                fontSize: '13px',
                                fontWeight: '700',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <CheckCircle size={18} color="#117a6b" />
                              <span>{marksSuccessToast}</span>
                            </div>
                          )}

                          {/* Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Award size={20} color="#117a6b" />
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                                  Academic Marks Entry & Evaluation
                                </h3>
                              </div>
                              <p style={{ fontSize: '12px', color: '#5f736f', margin: '4px 0 0 0' }}>
                                Official Nepal CDC 8-Point Grading Standard • Classes 1–12 Framework
                              </p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <button
                                onClick={() => handleSaveMarks(true)}
                                disabled={isSubmittingMarks}
                                style={{
                                  padding: '8px 16px',
                                  background: '#f4faf8',
                                  color: '#2f4f4c',
                                  border: '1.5px solid #cfdcd8',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: isSubmittingMarks ? 'not-allowed' : 'pointer',
                                }}
                              >
                                Save Draft
                              </button>
                              <button
                                onClick={() => handleSaveMarks(false)}
                                disabled={isSubmittingMarks}
                                style={{
                                  padding: '8px 18px',
                                  background: '#117a6b',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  cursor: isSubmittingMarks ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 4px rgba(17,122,107,0.25)',
                                }}
                              >
                                <Check size={15} /> {isSubmittingMarks ? 'Submitting...' : 'Submit Final Marks'}
                              </button>
                            </div>
                          </div>

                          {/* Examination Configuration Bar */}
                          <div
                            style={{
                              background: '#f4faf8',
                              borderRadius: '12px',
                              border: '1px solid #dcebe6',
                              padding: '18px 22px',
                              marginBottom: '20px',
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'flex-end' }}>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', display: 'block', textTransform: 'uppercase' }}>
                                    {assignedAssessments.length > 0 ? 'Admin-Assigned Assessment Type' : 'Examination / Assessment Type'}
                                  </label>
                                  {assignedAssessments.length > 0 && (
                                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', fontWeight: '700' }}>
                                      {assignedAssessments.length} Available
                                    </span>
                                  )}
                                </div>
                                {assignedAssessments.length > 0 ? (
                                  <select
                                    value={selectedAdminAssessmentId}
                                    onChange={(e) => {
                                      const asmId = e.target.value;
                                      setSelectedAdminAssessmentId(asmId);
                                      applySavedMarks(asmId);
                                      const found = assignedAssessments.find((a) => (a.id || a._id) === asmId);
                                      if (found) {
                                        setMarksTheoryMax(found.fullMarksTheory ?? 75);
                                        setMarksPracticalMax(found.fullMarksPractical ?? 25);
                                        setMarksExamType(found.examType || 'FIRST_TERM');
                                      }
                                    }}
                                    style={{ padding: '8px 12px', border: '1.5px solid #2563eb', borderRadius: '8px', fontSize: '13px', width: '100%', background: '#ffffff', fontWeight: '700', color: '#0e3e3b' }}
                                  >
                                    {assignedAssessments.map((asm) => (
                                      <option key={asm.id || asm._id} value={asm.id || asm._id}>
                                        {asm.name} [{asm.examType}] · Theory: {asm.fullMarksTheory ?? 75}, Prac: {asm.fullMarksPractical ?? 25} (Total {asm.totalMarks ?? 100})
                                      </option>
                                    ))}
                                    <option value="">+ Custom / Ad-hoc Assessment</option>
                                  </select>
                                ) : (
                                  <select
                                    value={marksExamType}
                                    onChange={(e) => setMarksExamType(e.target.value as any)}
                                    style={{ padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px', width: '100%', background: '#ffffff', fontWeight: '700' }}
                                  >
                                    <option value="FIRST_TERM">First Terminal Examination (पहिलो त्रैमासिक परीक्षा)</option>
                                    <option value="SECOND_TERM">Second Terminal Examination (दोस्रो त्रैमासिक परीक्षा)</option>
                                    <option value="FINAL_EXAM">Final / Annual Examination (वार्षिक परीक्षा)</option>
                                    <option value="UNIT_TEST">Continuous Assessment (CAS / Unit Test)</option>
                                    <option value="ASSIGNMENT">Assignment & Homework Portfolio Marks</option>
                                  </select>
                                )}
                              </div>

                              <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                                  Theory Max Marks
                                </label>
                                <input
                                  type="number"
                                  value={marksTheoryMax}
                                  onChange={(e) => setMarksTheoryMax(Number(e.target.value) || 0)}
                                  style={{ padding: '7px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px', width: '100%', background: '#ffffff', fontWeight: '700' }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                                  Practical Max Marks
                                </label>
                                <input
                                  type="number"
                                  value={marksPracticalMax}
                                  onChange={(e) => setMarksPracticalMax(Number(e.target.value) || 0)}
                                  style={{ padding: '7px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px', width: '100%', background: '#ffffff', fontWeight: '700' }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                                  Total Maximum Marks
                                </label>
                                <div style={{ padding: '7px 12px', background: '#e6f7f0', border: '1px solid #bfeede', borderRadius: '8px', fontSize: '13px', fontWeight: '800', color: '#117a6b', textAlign: 'center' }}>
                                  {totalPossible} Marks
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bulk Marks Quick-Fill Controls */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px 18px',
                              background: '#ffffff',
                              borderRadius: '10px',
                              border: '1px solid #dcebe6',
                              marginBottom: '16px',
                              flexWrap: 'wrap',
                              gap: '12px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '700', color: '#4b605b' }}>Bulk Fill Score:</span>
                              <input
                                type="number"
                                placeholder="e.g. 75"
                                value={marksBulkScore}
                                onChange={(e) => setMarksBulkScore(e.target.value)}
                                style={{ width: '80px', padding: '5px 10px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px' }}
                              />
                              <button
                                onClick={() => {
                                  const val = Number(marksBulkScore);
                                  if (!isNaN(val) && val >= 0) handleBulkMarksFill(val);
                                }}
                                style={{ padding: '5px 12px', background: '#117a6b', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Apply to All
                              </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Quick Presets:</span>
                              <button
                                onClick={() => handleBulkMarksFill(85)}
                                style={{ padding: '5px 10px', background: '#effaf6', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                All A+ (85)
                              </button>
                              <button
                                onClick={() => handleBulkMarksFill(75)}
                                style={{ padding: '5px 10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                All A (75)
                              </button>
                              <button
                                onClick={() => handleBulkMarksFill(60)}
                                style={{ padding: '5px 10px', background: '#f5f3ff', color: '#6d5bd0', border: '1px solid #ddd6fe', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                All Pass (60)
                              </button>
                              <button
                                onClick={() => handleBulkMarksFill(0)}
                                style={{ padding: '5px 10px', background: '#f4faf8', color: '#5f736f', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Clear All
                              </button>
                            </div>
                          </div>

                          {/* Student Marks Entry Table */}
                          <div style={{ border: '1px solid #dcebe6', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                              <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6' }}>
                                <tr>
                                  <th style={{ padding: '10px 14px', fontWeight: '800', width: '60px' }}>Roll</th>
                                  <th style={{ padding: '10px 14px', fontWeight: '800' }}>Student Name</th>
                                  <th style={{ padding: '10px 14px', fontWeight: '800', width: '120px' }}>Theory ({marksTheoryMax})</th>
                                  <th style={{ padding: '10px 14px', fontWeight: '800', width: '120px' }}>Practical ({marksPracticalMax})</th>
                                  <th style={{ padding: '10px 14px', fontWeight: '800', width: '100px' }}>Total ({totalPossible})</th>
                                  <th style={{ padding: '10px 14px', fontWeight: '800', width: '110px' }}>CDC Grade</th>
                                  <th style={{ padding: '10px 14px', fontWeight: '800' }}>Teacher Remarks</th>
                                </tr>
                              </thead>
                              <tbody>
                                {courseStudents.map((st) => {
                                  const total = (st.theoryMarks || 0) + (st.practicalMarks || 0);
                                  const pct = totalPossible > 0 ? Math.round((total / totalPossible) * 100) : 0;
                                  const gradeInfo = calculateCdcGrade(pct);

                                  return (
                                    <tr key={st.id} style={{ borderBottom: '1px solid #ebf5f1', background: st.flagged ? '#f5f3ff' : '#ffffff' }}>
                                      <td style={{ padding: '10px 14px', fontWeight: '800', color: '#2563eb', fontFamily: 'monospace' }}>
                                        #{st.rollNumber}
                                      </td>
                                      <td style={{ padding: '10px 14px' }}>
                                        <button type="button" onClick={() => setDossier({ studentId: st.id, sectionId: idOfAny(selectedWorkspace?.section) })} title="Open student dossier" style={{ display: 'block', color: '#0e3e3b', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline dotted', textUnderlineOffset: '3px', textAlign: 'left' }}>{st.fullName}</button>
                                        <span style={{ fontSize: '11px', color: '#5f736f' }}>{st.username}</span>
                                      </td>
                                      <td style={{ padding: '10px 14px' }}>
                                        <input
                                          type="number"
                                          min={0}
                                          max={marksTheoryMax}
                                          value={st.theoryMarks}
                                          onChange={(e) => handleUpdateStudentMarks(st.id, 'theoryMarks', Number(e.target.value) || 0)}
                                          style={{ width: '90px', padding: '6px 10px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}
                                        />
                                      </td>
                                      <td style={{ padding: '10px 14px' }}>
                                        <input
                                          type="number"
                                          min={0}
                                          max={marksPracticalMax}
                                          value={st.practicalMarks}
                                          onChange={(e) => handleUpdateStudentMarks(st.id, 'practicalMarks', Number(e.target.value) || 0)}
                                          style={{ width: '90px', padding: '6px 10px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}
                                        />
                                      </td>
                                      <td style={{ padding: '10px 14px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#0e3e3b' }}>{total}</span>
                                        <span style={{ fontSize: '11px', color: '#5f736f', marginLeft: '4px' }}>({pct}%)</span>
                                      </td>
                                      <td style={{ padding: '10px 14px' }}>
                                        <span
                                          style={{
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            background: gradeInfo.bg,
                                            color: gradeInfo.color,
                                            border: `1px solid ${gradeInfo.border}`,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <strong>{gradeInfo.grade}</strong>
                                          <span style={{ fontSize: '10px', opacity: 0.8 }}>({gradeInfo.desc})</span>
                                        </span>
                                      </td>
                                      <td style={{ padding: '10px 14px' }}>
                                        <input
                                          type="text"
                                          value={st.remarks || ''}
                                          onChange={(e) => handleUpdateStudentMarks(st.id, 'remarks', e.target.value)}
                                          placeholder="Enter evaluation remarks..."
                                          style={{ width: '100%', padding: '6px 10px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px' }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Marks Summary Stats Banner */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, 1fr)',
                              gap: '14px',
                              padding: '16px',
                              background: '#f4faf8',
                              borderRadius: '12px',
                              border: '1px solid #dcebe6',
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700' }}>Evaluated Students</span>
                              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b' }}>{courseStudents.length} / {courseStudents.length}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700' }}>Class Average Score</span>
                              <div style={{ fontSize: '18px', fontWeight: '800', color: '#117a6b' }}>{avgScore} / {totalPossible}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700' }}>Highest Marks</span>
                              <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb' }}>{highestScore} / {totalPossible}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700' }}>Pass Percentage</span>
                              <div style={{ fontSize: '18px', fontWeight: '800', color: passRate >= 80 ? '#117a6b' : '#6d5bd0' }}>{passRate}%</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 4: RESOURCES (Unified Notes, Materials, Presentations, Videos) */}
                      {workspaceTab === 'RESOURCES' && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Folder size={20} color="#7c3aed" />
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                                  Learning Resources & Materials Repository
                                </h3>
                              </div>
                              <p style={{ fontSize: '12px', color: '#5f736f', margin: '4px 0 0 0' }}>
                                Consolidated repository for Notes, Study Materials, Slide Decks, and Video Lectures.
                              </p>
                            </div>

                            <button
                              onClick={() => setIsUploadFilesModalOpen(true)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 18px',
                                background: '#7c3aed',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(124,58,237,0.2)',
                              }}
                            >
                              <Plus size={16} /> Upload Files
                            </button>
                          </div>

                          {/* Sub-filter chips */}
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            {[
                              { key: 'ALL', label: `All (${learningResources.length})` },
                              { key: 'NOTE', label: `Notes (${learningResources.filter((r) => r.type === 'NOTE').length})` },
                              { key: 'MATERIAL', label: `Study Materials (${learningResources.filter((r) => r.type === 'MATERIAL').length})` },
                              { key: 'PRESENTATION', label: `Presentations (${learningResources.filter((r) => r.type === 'PRESENTATION').length})` },
                              { key: 'VIDEO', label: `Videos (${learningResources.filter((r) => r.type === 'VIDEO').length})` },
                            ].map((filter) => {
                              const isActive = resourcesFilter === filter.key;
                              return (
                                <button
                                  key={filter.key}
                                  onClick={() => setResourcesFilter(filter.key as any)}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    background: isActive ? '#7c3aed' : '#ffffff',
                                    color: isActive ? '#ffffff' : '#5f736f',
                                    border: isActive ? '1px solid #7c3aed' : '1px solid #cfdcd8',
                                  }}
                                >
                                  {filter.label}
                                </button>
                              );
                            })}
                          </div>

                          {/* Resource Cards Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            {filteredResources.map((res) => {
                              const typeColor =
                                res.type === 'NOTE' ? '#2563eb' : res.type === 'MATERIAL' ? '#117a6b' : res.type === 'PRESENTATION' ? '#6d5bd0' : '#dc2626';
                              const typeBg =
                                res.type === 'NOTE' ? '#eff6ff' : res.type === 'MATERIAL' ? '#e6f7f0' : res.type === 'PRESENTATION' ? '#f5f3ff' : '#fef2f2';

                              return (
                                <div
                                  key={res.id}
                                  style={{
                                    padding: '18px 20px',
                                    background: '#ffffff',
                                    borderRadius: '12px',
                                    border: '1px solid #dcebe6',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                  }}
                                >
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                      <span
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: '800',
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          background: typeBg,
                                          color: typeColor,
                                          textTransform: 'uppercase',
                                        }}
                                      >
                                        {res.type}
                                      </span>
                                      <span style={{ fontSize: '11px', color: '#5f736f' }}>{res.date}</span>
                                    </div>

                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 6px 0', lineHeight: '1.4' }}>
                                      {res.title}
                                    </h4>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#117a6b', marginBottom: '8px' }}>
                                      {res.chapter}
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#5f736f', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                                      {res.description}
                                    </p>
                                  </div>

                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #ebf5f1' }}>
                                    <span style={{ fontSize: '11px', color: '#5f736f' }}>
                                      {res.format} • {res.downloads} Downloads
                                    </span>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <button
                                        onClick={() => openResource(res)}
                                        style={{ padding: '5px 10px', background: '#ebf5f1', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#2f4f4c' }}
                                      >
                                        View / Download
                                      </button>
                                      <button
                                        onClick={() => handleOpenLauncher(matchingAlloc)}
                                        style={{ padding: '5px 10px', background: '#e6f7f0', border: '1px solid #bfeede', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#117a6b' }}
                                      >
                                        Smart Board
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* TAB 5: ACADEMIC MONITORING */}
                      {workspaceTab === 'MONITORING' && (
                        <TeacherInsightsPanel key="ws-mon" view="MONITORING" fixedScope scopes={workspaceScopes} />
                      )}

                      {/* TAB 6: CURRICULUM */}
                      {workspaceTab === 'CURRICULUM' && (
                        <div style={{ background: isDarkMode ? '#134744' : '#ffffff', borderRadius: '14px', border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6', padding: '22px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <h3 style={{ fontSize: '16px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: '0 0 4px 0' }}>
                                CDC Curriculum Units & Lesson Progression
                              </h3>
                              <p style={{ margin: 0, fontSize: '12px', color: '#5f736f' }}>
                                Official competencies, credit hours, and progress milestones for this subject.
                              </p>
                            </div>
                            <button
                              disabled={(cdcChaptersData.DEFAULT || []).length === 0}
                              onClick={() => {
                                const list = cdcChaptersData.DEFAULT || [];
                                const target = list.find((c: any) => c.status !== 'COMPLETED') || list[0];
                                if (!target) return;
                                setSelectedChapterToEdit(target);
                                setUpdatedProgressVal(target.progress ?? 0);
                                setIsChapterProgressModalOpen(true);
                              }}
                              style={{
                                padding: '7px 16px',
                                background: '#117a6b',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              + Update Chapter Progress
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {syllabusInfo.loading && <div style={{ fontSize: '13px', color: '#5f736f' }}>Loading chapters…</div>}
                            {!syllabusInfo.loading && syllabusInfo.error && <div style={{ fontSize: '13px', color: '#b91c1c' }}>{syllabusInfo.error}</div>}
                            {!syllabusInfo.loading && !syllabusInfo.error && (cdcChaptersData.DEFAULT || []).length === 0 && (
                              <div style={{ fontSize: '13px', color: '#5f736f' }}>
                                No textbook chapters have been set up for this subject and class yet, so there is nothing to track. Ask the administrator to extract the textbook chapters.
                              </div>
                            )}
                            {syllabusInfo.textbookTitle && (
                              <div style={{ fontSize: '12px', color: '#5f736f' }}>Textbook: {syllabusInfo.textbookTitle}</div>
                            )}
                            {(cdcChaptersData.DEFAULT || []).map((ch: any) => (
                              <div
                                key={ch.ch}
                                style={{
                                  padding: '16px 18px',
                                  borderRadius: '10px',
                                  border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                                  background: ch.status === 'COMPLETED' ? (isDarkMode ? '#0b3f3d20' : '#effaf6') : ch.status === 'IN_PROGRESS' ? (isDarkMode ? '#1e3a8a20' : '#eff6ff') : (isDarkMode ? '#134744' : '#ffffff'),
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: '12px',
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <strong style={{ fontSize: '14px', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>{ch.title}</strong>
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontWeight: '800',
                                        background: ch.status === 'COMPLETED' ? '#dcfce7' : ch.status === 'IN_PROGRESS' ? '#dbeafe' : '#ebf5f1',
                                        color: ch.status === 'COMPLETED' ? '#166534' : ch.status === 'IN_PROGRESS' ? '#1e40af' : '#4b605b',
                                      }}
                                    >
                                      {ch.status}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '4px' }}>
                                    Learning Objectives: {ch.obj}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '15px', fontWeight: '900', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>{ch.progress}%</div>
                                    <span style={{ fontSize: '11px', color: '#5f736f' }}>{ch.hours} Hours Taught</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedChapterToEdit(ch);
                                      setUpdatedProgressVal(ch.progress);
                                      setIsChapterProgressModalOpen(true);
                                    }}
                                    style={{
                                      padding: '5px 12px',
                                      background: isDarkMode ? '#2f4f4c' : '#ebf5f1',
                                      color: isDarkMode ? '#cfdcd8' : '#2f4f4c',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Edit
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TAB 7: ASSIGNMENTS */}
                      {workspaceTab === 'ASSIGNMENTS' && (
                        <div style={{ marginTop: '6px' }}>
                          <TeacherAssignmentManager
                            allocations={effectiveAllocations}
                            defaultSectionId={matchingAlloc?.sectionId?._id || matchingAlloc?.sectionId?.id || matchingAlloc?.sectionId}
                            defaultSubjectId={matchingAlloc?.centralSubjectId?._id || matchingAlloc?.centralSubjectId?.id || matchingAlloc?.centralSubjectId}
                          />
                        </div>
                      )}

                      {/* TAB 8: QUIZZES */}
                      {workspaceTab === 'QUIZZES' && (
                        <div style={{ marginTop: '6px' }}>
                          <TeacherQuizManager
                            allocations={effectiveAllocations}
                            defaultSectionId={matchingAlloc?.sectionId?._id || matchingAlloc?.sectionId?.id || matchingAlloc?.sectionId}
                            defaultSubjectId={matchingAlloc?.centralSubjectId?._id || matchingAlloc?.centralSubjectId?.id || matchingAlloc?.centralSubjectId}
                          />
                        </div>
                      )}

                      {/* TAB 9: ANNOUNCEMENTS FOR THIS WORKSPACE */}
                      {workspaceTab === 'ANNOUNCEMENTS' && (() => {
                        const currentSectionId = selectedWorkspace?.section?.id || selectedWorkspace?.section?._id;
                        const currentSubjectId = selectedWorkspace?.subject?.id || selectedWorkspace?.subject?._id;
                        const currentSubjectName = selectedWorkspace?.subject?.name || '';

                        const workspaceAnnouncements = announcementsList.filter((a) => {
                          const matchesSubject =
                            (a.subjectId && (a.subjectId === currentSubjectId || a.subjectId?._id === currentSubjectId)) ||
                            (a.subjectName && currentSubjectName && a.subjectName.toLowerCase().includes(currentSubjectName.toLowerCase()));
                          const matchesSection =
                            (a.sectionId && (a.sectionId === currentSectionId || a.sectionId?._id === currentSectionId));
                          const isOverallClassForThisSection = a.announcementType === 'CLASS_OVERALL' && matchesSection;
                          const isInst = a.announcementType === 'INSTITUTIONAL' || !a.announcementType;

                          return matchesSubject || isOverallClassForThisSection || isInst;
                        });

                        return (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <div>
                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: '0 0 4px 0' }}>
                                  Course Notices & Academic Bulletins
                                </h3>
                                <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                                  Targeted updates for students enrolled in {selectedWorkspace?.subject?.name} ({selectedWorkspace?.section?.name})
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setAnnouncementType('SUBJECT_SPECIFIC');
                                  // Pre-select this workspace's allocation
                                  const matchingIdx = effectiveAllocations.findIndex((a) => {
                                    const sId = a.sectionId?._id || a.sectionId?.id || a.sectionId;
                                    const subId = a.centralSubjectId?._id || a.centralSubjectId?.id || a.centralSubjectId;
                                    return sId === currentSectionId && subId === currentSubjectId;
                                  });
                                  if (matchingIdx !== -1) setAnnouncementAllocIndex(matchingIdx);
                                  setAnnouncementTitle(`[${currentSubjectName}] `);
                                  setNewAnnouncementText('');
                                  setIsAnnouncementModalOpen(true);
                                }}
                                style={{
                                  padding: '8px 16px',
                                  background: '#6d5bd0',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <Megaphone size={14} />
                                <span>+ Post Announcement for this Subject</span>
                              </button>
                            </div>

                            {workspaceAnnouncements.length === 0 ? (
                              <div style={{ padding: '36px', background: isDarkMode ? '#0e3e3b' : '#f4faf8', borderRadius: '12px', border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6', textAlign: 'center', color: '#5f736f' }}>
                                <Megaphone size={32} color="#8da19d" style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                                <div style={{ fontWeight: '700', fontSize: '14px', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                                  No Announcements for this Course Yet
                                </div>
                                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                  Click the button above to post homework reminders, test schedules, or revision notes.
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {workspaceAnnouncements.map((ann, idx) => {
                                  const isOverall = ann.announcementType === 'CLASS_OVERALL';
                                  const isSubject = ann.announcementType === 'SUBJECT_SPECIFIC';

                                  return (
                                    <div
                                      key={ann._id || ann.id || idx}
                                      style={{
                                        padding: '16px 20px',
                                        background: isDarkMode ? '#0e3e3b' : '#f4faf8',
                                        borderRadius: '10px',
                                        border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                                        borderLeft: isOverall ? '4px solid #117a6b' : isSubject ? '4px solid #6d5bd0' : '4px solid #7c3aed',
                                      }}
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <span style={{ fontSize: '10.5px', fontWeight: '800', background: isOverall ? '#e6f7f0' : isSubject ? '#f5f3ff' : '#f5f3ff', color: isOverall ? '#117a6b' : isSubject ? '#6d5bd0' : '#7c3aed', padding: '2px 8px', borderRadius: '5px' }}>
                                            {isOverall ? 'CLASS OVERALL' : isSubject ? 'SUBJECT NOTICE' : 'SCHOOL-WIDE'}
                                          </span>
                                          <strong style={{ fontSize: '13.5px', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                                            {ann.title}
                                          </strong>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#5f736f' }}>
                                          {ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString() : 'Recent'}
                                        </span>
                                      </div>
                                      <p style={{ fontSize: '12.5px', color: isDarkMode ? '#cfdcd8' : '#4b605b', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                                        {ann.content}
                                      </p>
                                      <div style={{ fontSize: '11px', color: '#8da19d' }}>
                                        Author: {ann.publishedBy?.fullName || ann.authorName || 'Teacher'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* TAB 10: PROGRESS */}
                      {workspaceTab === 'PROGRESS' && (
                        <TeacherInsightsPanel key="ws-prog" view="PROGRESS" fixedScope scopes={workspaceScopes} />
                      )}

                      {/* TAB 11: AI COPILOT */}
                      {workspaceTab === 'AI' && <AIAssistantPanel role="TEACHER" title="AI Teaching Assistant" />}
                    </div>
                  </div>
                );
              })()}

              {(activeNav === 'TODAY_SCHEDULE' || activeNav === 'WEEKLY_TIMETABLE' || activeNav === 'WORKLOAD') && (
  <MyTeachingSchedule
    view={activeNav === 'WEEKLY_TIMETABLE' ? 'week' : activeNav === 'WORKLOAD' ? 'workload' : 'today'}
    onOpenSubject={(secId, subId) => {
      const matchingAlloc = allocations.find(
        (a) =>
          (a.sectionId?._id === secId || a.sectionId?.id === secId || a.sectionId === secId) &&
          (a.centralSubjectId?._id === subId || a.centralSubjectId?.id === subId || a.centralSubjectId === subId)
      );
      if (matchingAlloc) {
        openWorkspace(matchingAlloc, true);
        setWorkspaceTab('TEXTBOOK');
        setActiveNav('MY_SUBJECTS');
      } else {
        openWorkspace({ sectionId: secId, centralSubjectId: subId }, true);
        setWorkspaceTab('TEXTBOOK');
        setActiveNav('MY_SUBJECTS');
      }
    }}
    onLaunchSmartBoard={(entry) => quickLaunchSmartBoard({ sectionId: entry.sectionId, subjectId: entry.subjectId, textbookId: entry.textbookId, title: entry.subjectName })}
  />
)}

              {/* =========================================================================
              VIEW 4: LEARNING RESOURCES (All Resources Explorer across all classes)
              ========================================================================= */}
              {activeNav === 'TEACHING_DIARY' && <TeachingDiaryPanel allocations={allocations} />}

              {activeNav === 'LEARNING_RESOURCES' && (() => {
                const filteredAllResources = learningResources.filter((r) => {
                  // Subject Filter
                  if (explorerSubjectFilter !== 'ALL' && r.subjectCode !== explorerSubjectFilter) {
                    return false;
                  }
                  // Type Filter
                  if (resourcesFilter !== 'ALL' && r.type !== resourcesFilter) {
                    return false;
                  }
                  // Search
                  if (explorerSearch.trim()) {
                    const q = explorerSearch.toLowerCase();
                    return (
                      r.title.toLowerCase().includes(q) ||
                      r.chapter.toLowerCase().includes(q) ||
                      r.description.toLowerCase().includes(q) ||
                      (r.subjectName && r.subjectName.toLowerCase().includes(q))
                    );
                  }
                  return true;
                });

                const countNotes = learningResources.filter((r) => r.type === 'NOTE').length;
                const countMaterials = learningResources.filter((r) => r.type === 'MATERIAL').length;
                const countPresentations = learningResources.filter((r) => r.type === 'PRESENTATION').length;
                const countVideos = learningResources.filter((r) => r.type === 'VIDEO').length;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#5f736f', fontWeight: '600', marginBottom: '6px' }}>
                          <FolderPlus size={14} color="#7c3aed" />
                          <span>Teaching Repository</span>
                        </div>
                        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#0e3e3b', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
                          Learning Resources Explorer
                        </h1>
                        <p style={{ fontSize: '13px', color: '#5f736f', margin: 0 }}>
                          Explore, filter, and manage all teaching notes, curriculum guides, presentations, and video lectures across your classes.
                        </p>
                      </div>

                      <button
                        onClick={() => setIsUploadFilesModalOpen(true)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 20px',
                          background: '#0f5f55',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(15,81,50,0.2)',
                        }}
                      >
                        <Plus size={16} /> Upload Learning Resource
                      </button>
                    </div>

                    {/* Top Metrics Cards Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
                      <div
                        onClick={() => setResourcesFilter('ALL')}
                        style={{
                          padding: '16px',
                          background: resourcesFilter === 'ALL' ? '#effaf6' : '#ffffff',
                          borderRadius: '12px',
                          border: resourcesFilter === 'ALL' ? '2px solid #117a6b' : '1px solid #dcebe6',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>All Files</span>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#0e3e3b', margin: '4px 0' }}>{learningResources.length}</div>
                        <span style={{ fontSize: '11px', color: '#117a6b', fontWeight: '600' }}>Across 6 Subjects</span>
                      </div>

                      <div
                        onClick={() => setResourcesFilter('NOTE')}
                        style={{
                          padding: '16px',
                          background: resourcesFilter === 'NOTE' ? '#eff6ff' : '#ffffff',
                          borderRadius: '12px',
                          border: resourcesFilter === 'NOTE' ? '2px solid #2563eb' : '1px solid #dcebe6',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Lecture Notes</span>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#2563eb', margin: '4px 0' }}>{countNotes}</div>
                        <span style={{ fontSize: '11px', color: '#5f736f' }}>PDFs & Handouts</span>
                      </div>

                      <div
                        onClick={() => setResourcesFilter('MATERIAL')}
                        style={{
                          padding: '16px',
                          background: resourcesFilter === 'MATERIAL' ? '#e6f7f0' : '#ffffff',
                          borderRadius: '12px',
                          border: resourcesFilter === 'MATERIAL' ? '2px solid #117a6b' : '1px solid #dcebe6',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Study Materials</span>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#117a6b', margin: '4px 0' }}>{countMaterials}</div>
                        <span style={{ fontSize: '11px', color: '#5f736f' }}>CDC Guides & Manuals</span>
                      </div>

                      <div
                        onClick={() => setResourcesFilter('PRESENTATION')}
                        style={{
                          padding: '16px',
                          background: resourcesFilter === 'PRESENTATION' ? '#f5f3ff' : '#ffffff',
                          borderRadius: '12px',
                          border: resourcesFilter === 'PRESENTATION' ? '2px solid #6d5bd0' : '1px solid #dcebe6',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Presentations</span>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#6d5bd0', margin: '4px 0' }}>{countPresentations}</div>
                        <span style={{ fontSize: '11px', color: '#5f736f' }}>Slide Decks</span>
                      </div>

                      <div
                        onClick={() => setResourcesFilter('VIDEO')}
                        style={{
                          padding: '16px',
                          background: resourcesFilter === 'VIDEO' ? '#fef2f2' : '#ffffff',
                          borderRadius: '12px',
                          border: resourcesFilter === 'VIDEO' ? '2px solid #dc2626' : '1px solid #dcebe6',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Video Lectures</span>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#dc2626', margin: '4px 0' }}>{countVideos}</div>
                        <span style={{ fontSize: '11px', color: '#5f736f' }}>Recorded Sessions</span>
                      </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        border: '1px solid #dcebe6',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '14px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      {/* Subject Filter Dropdown */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#4b605b' }}>Filter Subject:</span>
                        <select
                          value={explorerSubjectFilter}
                          onChange={(e) => setExplorerSubjectFilter(e.target.value)}
                          style={{
                            padding: '7px 12px',
                            border: '1px solid #cfdcd8',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            background: '#f4faf8',
                            color: '#134744',
                          }}
                        >
                          <option value="ALL">All Subjects ({SUBJECT_COURSES.length})</option>
                          {SUBJECT_COURSES.map((subject) => (
                            <option key={`${subject.code}-${subject.allocIndex}`} value={subject.code}>
                              {subject.code} - {subject.name} ({subject.classSem})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Live Search Input */}
                      <div style={{ position: 'relative', width: '360px', maxWidth: '100%' }}>
                        <Search size={15} color="#8da19d" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                        <input
                          type="text"
                          placeholder="Search by title, unit, chapter, or keyword..."
                          value={explorerSearch}
                          onChange={(e) => setExplorerSearch(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 36px',
                            border: '1px solid #cfdcd8',
                            borderRadius: '8px',
                            fontSize: '12px',
                            background: '#ffffff',
                          }}
                        />
                      </div>
                    </div>

                    {/* Resources Grid */}
                    {filteredAllResources.length === 0 ? (
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '16px',
                          border: '1px dashed #cfdcd8',
                          padding: '60px 24px',
                          textAlign: 'center',
                          color: '#5f736f',
                        }}
                      >
                        <FolderPlus size={36} color="#8da19d" style={{ margin: '0 auto 12px auto' }} />
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 6px 0' }}>
                          No learning resources found
                        </h4>
                        <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
                          No files match the active filters or search query.
                        </p>
                        <button
                          onClick={() => {
                            setResourcesFilter('ALL');
                            setExplorerSubjectFilter('ALL');
                            setExplorerSearch('');
                          }}
                          style={{ padding: '8px 16px', background: '#ebf5f1', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Clear All Filters
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        {filteredAllResources.map((res) => {
                          const typeColor =
                            res.type === 'NOTE' ? '#2563eb' : res.type === 'MATERIAL' ? '#117a6b' : res.type === 'PRESENTATION' ? '#6d5bd0' : '#dc2626';
                          const typeBg =
                            res.type === 'NOTE' ? '#eff6ff' : res.type === 'MATERIAL' ? '#e6f7f0' : res.type === 'PRESENTATION' ? '#f5f3ff' : '#fef2f2';

                          return (
                            <div
                              key={res.id}
                              style={{
                                padding: '20px 22px',
                                background: '#ffffff',
                                borderRadius: '14px',
                                border: '1px solid #dcebe6',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                              }}
                            >
                              <div>
                                {/* Badges Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: '800',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        background: typeBg,
                                        color: typeColor,
                                        textTransform: 'uppercase',
                                      }}
                                    >
                                      {res.type}
                                    </span>
                                    {res.subjectCode && (
                                      <span style={{ fontSize: '11px', fontWeight: '800', background: '#ebf5f1', color: '#134744', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                                        {res.subjectCode} • {res.className || 'General'}
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '11px', color: '#5f736f' }}>{res.date}</span>
                                </div>

                                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 6px 0', lineHeight: '1.4' }}>
                                  {res.title}
                                </h4>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#117a6b', marginBottom: '8px' }}>
                                  {res.chapter}
                                </div>
                                <p style={{ fontSize: '12px', color: '#5f736f', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                                  {res.description}
                                </p>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #ebf5f1' }}>
                                <span style={{ fontSize: '11px', color: '#5f736f', fontWeight: '600' }}>
                                  {res.format} • {res.downloads} Downloads
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => openResource(res)}
                                    style={{
                                      padding: '6px 12px',
                                      background: '#f4faf8',
                                      border: '1px solid #cfdcd8',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      color: '#2f4f4c',
                                    }}
                                  >
                                    View / Download
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (allocations.length > 0) handleOpenLauncher(allocations[0]);
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      background: '#e6f7f0',
                                      border: '1px solid #bfeede',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      color: '#117a6b',
                                    }}
                                  >
                                    Smart Board
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ══════════════════════════════════════════════════════════════════
              VIEW 5: SIMULATIONS & ACTIVITIES
             ══════════════════════════════════════════════════════════════════ */}
              {activeNav === 'SIMULATIONS' && (
                <ExploreSimulationsPanel
                  userRole="TEACHER"
                  classroomContext={(() => {
                    const allocation = allocations[launcherAllocIndex] || allocations[0];
                    const classId = allocation?.sectionId?.classId?.id
                      || allocation?.sectionId?.classId?._id
                      || allocation?.sectionId?.classId;
                    const sectionId = allocation?.sectionId?.id || allocation?.sectionId?._id || allocation?.sectionId;
                    const subjectId = allocation?.centralSubjectId?.id
                      || allocation?.centralSubjectId?._id
                      || allocation?.centralSubjectId;
                    return classId && sectionId && subjectId
                      ? { classId: String(classId), sectionId: String(sectionId), subjectId: String(subjectId) }
                      : undefined;
                  })()}
                />
              )}

              {/* ══════════════════════════════════════════════════════════════════
              VIEW 7: CLASS TEACHER SECTION CONSOLE (Part C)
             ══════════════════════════════════════════════════════════════════ */}
              {activeNav === 'CLASS_TEACHER' && (
               overview?.classTeacherSection ? (
                 <ClassTeacherSectionPanel
                   sectionId={overview.classTeacherSection.id || overview.classTeacherSection._id}
                   sectionName={overview.classTeacherSection.name || ''}
                   className={overview.classTeacherSection.className || ''}
                 />
               ) : (
                 <div style={{ padding: '32px', textAlign: 'center', color: '#5f736f' }}>
                   No class-teacher section is assigned to this account.
                 </div>
               )
             )}

              {/* ══════════════════════════════════════════════════════════════════
              VIEW: ASSIGNMENTS & HOMEWORK ENGINE
             ══════════════════════════════════════════════════════════════════ */}
              {activeNav === 'ASSIGNMENTS' && (
                <div style={{ background: isDarkMode ? '#134744' : '#ffffff', borderRadius: '16px', border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <TeacherAssignmentManager
                    allocations={effectiveAllocations}
                    defaultSectionId={selectedWorkspace?.section?.id || selectedWorkspace?.section?._id}
                    defaultSubjectId={selectedWorkspace?.subject?.id || selectedWorkspace?.subject?._id}
                  />
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════════
              VIEW: QUIZZES & EXAMINATION ENGINE
             ══════════════════════════════════════════════════════════════════ */}
              {activeNav === 'QUIZZES' && (
                <div style={{ background: isDarkMode ? '#134744' : '#ffffff', borderRadius: '16px', border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <TeacherQuizManager
                    allocations={effectiveAllocations}
                    defaultSectionId={selectedWorkspace?.section?.id || selectedWorkspace?.section?._id}
                    defaultSubjectId={selectedWorkspace?.subject?.id || selectedWorkspace?.subject?._id}
                  />
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════════
              VIEW 6A: REAL-TIME ANNOUNCEMENTS BOARD (Subject & Class Overall)
             ══════════════════════════════════════════════════════════════════ */}
              {activeNav === 'ANNOUNCEMENTS' && (() => {
                const isClassTeacher = Boolean(overview?.counts?.isClassTeacher && overview?.classTeacherSection);

                // Filter announcements
                const filteredAnnouncements = announcementsList.filter((a) => {
                  // Text search
                  const q = announcementSearch.toLowerCase();
                  const matchesSearch =
                    !q ||
                    a.title?.toLowerCase().includes(q) ||
                    a.content?.toLowerCase().includes(q) ||
                    a.subjectName?.toLowerCase().includes(q) ||
                    a.className?.toLowerCase().includes(q) ||
                    a.authorName?.toLowerCase().includes(q);

                  if (!matchesSearch) return false;

                  // Tab filter
                  if (announcementFilter === 'MY_SUBJECTS') {
                    return a.announcementType === 'SUBJECT_SPECIFIC';
                  }
                  if (announcementFilter === 'CLASS_OVERALL') {
                    return a.announcementType === 'CLASS_OVERALL';
                  }
                  if (announcementFilter === 'INSTITUTIONAL') {
                    return a.announcementType === 'INSTITUTIONAL' || !a.announcementType;
                  }
                  return true;
                });

                const countSubjects = announcementsList.filter((a) => a.announcementType === 'SUBJECT_SPECIFIC').length;
                const countClass = announcementsList.filter((a) => a.announcementType === 'CLASS_OVERALL').length;
                const countInst = announcementsList.filter((a) => a.announcementType === 'INSTITUTIONAL' || !a.announcementType).length;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Header Banner */}
                    <div
                      style={{
                        background: isDarkMode ? 'linear-gradient(135deg, #0f5f55 0%, #134744 100%)' : 'linear-gradient(135deg, #117a6b 0%, #117a6b 100%)',
                        borderRadius: '16px',
                        padding: '24px 28px',
                        color: '#ffffff',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                            {isClassTeacher ? `CLASS TEACHER & SUBJECT BULLETINS` : 'SUBJECT FACULTY BULLETINS'}
                          </span>
                          <span style={{ fontSize: '12px', opacity: 0.9 }}>Real-Time Student Broadcast</span>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0' }}>
                          📢 Course & School Announcements Board
                        </h2>
                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.85, maxWidth: '640px' }}>
                          {isClassTeacher
                            ? 'Broadcast general announcements for your entire supervised class (Section A) or publish specific notices for your taught subjects.'
                            : 'Publish subject-specific coursework guidelines, test dates, and assignments for your enrolled teaching courses.'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setAnnouncementTitle('');
                          setNewAnnouncementText('');
                          setIsAnnouncementModalOpen(true);
                        }}
                        style={{
                          padding: '11px 20px',
                          background: '#ffffff',
                          color: '#0f5f55',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Megaphone size={16} />
                        <span>+ Post Announcement</span>
                      </button>
                    </div>

                    {/* Filter Tabs & Search Controls */}
                    <div
                      style={{
                        background: isDarkMode ? '#134744' : '#ffffff',
                        borderRadius: '14px',
                        border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '14px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      {/* Filter Pills */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                          { id: 'ALL', label: 'All Notices', count: announcementsList.length },
                          { id: 'MY_SUBJECTS', label: 'My Subjects', count: countSubjects },
                          { id: 'CLASS_OVERALL', label: 'Entire Class Notices', count: countClass },
                          { id: 'INSTITUTIONAL', label: 'School-Wide', count: countInst },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setAnnouncementFilter(tab.id as any)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '700',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: announcementFilter === tab.id ? (isDarkMode ? '#117a6b' : '#0f5f55') : (isDarkMode ? '#2f4f4c' : '#ebf5f1'),
                              color: announcementFilter === tab.id ? '#ffffff' : (isDarkMode ? '#cfdcd8' : '#4b605b'),
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{tab.label}</span>
                            <span style={{ fontSize: '10px', background: announcementFilter === tab.id ? 'rgba(255,255,255,0.25)' : (isDarkMode ? '#134744' : '#dcebe6'), padding: '1px 6px', borderRadius: '10px' }}>
                              {tab.count}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Search Input */}
                      <div style={{ position: 'relative', minWidth: '260px' }}>
                        <Search size={15} color="#8da19d" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                        <input
                          type="text"
                          placeholder="Search announcements, subjects..."
                          value={announcementSearch}
                          onChange={(e) => setAnnouncementSearch(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 34px',
                            borderRadius: '8px',
                            border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8',
                            background: isDarkMode ? '#0e3e3b' : '#ffffff',
                            color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                            fontSize: '12.5px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    {/* Announcement Cards Feed */}
                    {filteredAnnouncements.length === 0 ? (
                      <div
                        style={{
                          background: isDarkMode ? '#134744' : '#ffffff',
                          borderRadius: '16px',
                          border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                          padding: '48px 24px',
                          textAlign: 'center',
                          color: '#5f736f',
                        }}
                      >
                        <Megaphone size={40} color="#8da19d" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: '0 0 6px 0' }}>
                          No Announcements Found
                        </h4>
                        <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
                          No bulletins match the selected filter criteria. Post a new subject or class announcement above.
                        </p>
                        <button
                          onClick={() => setIsAnnouncementModalOpen(true)}
                          style={{
                            padding: '8px 18px',
                            background: '#0f5f55',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          + Post New Announcement
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {filteredAnnouncements.map((ann, idx) => {
                          const isOverall = ann.announcementType === 'CLASS_OVERALL';
                          const isSubject = ann.announcementType === 'SUBJECT_SPECIFIC';
                          const isUrgent = ann.priority === 'URGENT';
                          const isHigh = ann.priority === 'HIGH';

                          return (
                            <div
                              key={ann._id || ann.id || idx}
                              style={{
                                background: isDarkMode ? '#134744' : '#ffffff',
                                borderRadius: '14px',
                                border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                                padding: '20px 24px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                                borderLeft: isOverall
                                  ? '4px solid #117a6b'
                                  : isSubject
                                  ? '4px solid #6d5bd0'
                                  : '4px solid #7c3aed',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {/* Top Meta Row */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {/* Scope Badge */}
                                  {isOverall ? (
                                    <span style={{ fontSize: '11px', fontWeight: '800', background: isDarkMode ? '#0b3f3d' : '#e6f7f0', color: '#117a6b', padding: '3px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <GraduationCap size={13} />
                                      <span>CLASS OVERALL • {ann.className || 'Section A'}</span>
                                    </span>
                                  ) : isSubject ? (
                                    <span style={{ fontSize: '11px', fontWeight: '800', background: isDarkMode ? '#451a03' : '#f5f3ff', color: '#6d5bd0', padding: '3px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <BookOpen size={13} />
                                      <span>SUBJECT • {ann.subjectName || 'Course'} {ann.className ? `(${ann.className})` : ''}</span>
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '11px', fontWeight: '800', background: isDarkMode ? '#2e1065' : '#f5f3ff', color: '#7c3aed', padding: '3px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <School size={13} />
                                      <span>INSTITUTIONAL NOTICE</span>
                                    </span>
                                  )}

                                  {/* Priority Tag */}
                                  {isUrgent && (
                                    <span style={{ fontSize: '10.5px', fontWeight: '800', background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '6px' }}>
                                      🚨 URGENT
                                    </span>
                                  )}
                                  {isHigh && (
                                    <span style={{ fontSize: '10.5px', fontWeight: '800', background: '#ede9fe', color: '#6d5bd0', padding: '2px 8px', borderRadius: '6px' }}>
                                      ⚡ HIGH PRIORITY
                                    </span>
                                  )}
                                </div>

                                <span style={{ fontSize: '12px', color: '#5f736f', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={13} />
                                  {ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                                </span>
                              </div>

                              {/* Title */}
                              <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: '0 0 8px 0' }}>
                                {ann.title}
                              </h3>

                              {/* Content */}
                              <p style={{ fontSize: '13.5px', color: isDarkMode ? '#cfdcd8' : '#2f4f4c', lineHeight: '1.6', margin: '0 0 14px 0', whiteSpace: 'pre-line' }}>
                                {ann.content}
                              </p>

                              {/* Footer Info */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1', fontSize: '12px', color: '#5f736f' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: isDarkMode ? '#2f4f4c' : '#dcebe6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: '#0e3e3b' }}>
                                    {(ann.publishedBy?.fullName || ann.authorName || 'T')[0]}
                                  </div>
                                  <span>
                                    Published by <strong style={{ color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>{ann.publishedBy?.fullName || ann.authorName || 'Faculty Member'}</strong>
                                    {ann.authorRole ? ` (${ann.authorRole.replace('_', ' ')})` : ''}
                                  </span>
                                </div>

                                <span style={{ fontSize: '11px', color: '#117a6b', fontWeight: '700' }}>
                                  ✓ Broadcast Live to Students
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ══════════════════════════════════════════════════════════════════
              VIEW 6B: REAL-TIME NOTIFICATION CENTER
             ══════════════════════════════════════════════════════════════════ */}
              {activeNav === 'NOTIFICATIONS' && (() => {
                const unreadItems = realtimeNotifications.filter((n) => !n.isRead);
                const filtered = realtimeNotifications.filter((n) => {
                  if (notificationFilter === 'UNREAD') return !n.isRead;
                  if (notificationFilter === 'URGENT') return n.priority === 'URGENT';
                  return true;
                });

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Header Banner */}
                    <div
                      style={{
                        background: isDarkMode ? 'linear-gradient(135deg, #0f5f55 0%, #134744 100%)' : 'linear-gradient(135deg, #0e7490 0%, #2563eb 100%)',
                        borderRadius: '16px',
                        padding: '24px 28px',
                        color: '#ffffff',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                            LIVE SYSTEM NOTIFICATION ENGINE
                          </span>
                          <span style={{ fontSize: '12px', opacity: 0.9 }}>Auto-Polling Sync Active</span>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0' }}>
                          🔔 Notification & Alert Center
                        </h2>
                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.85, maxWidth: '640px' }}>
                          Real-time institutional alerts, exam schedule updates, student submission notices, and broadcast messages.
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {unreadItems.length > 0 && (
                          <button
                            onClick={handleMarkAllNotificationsRead}
                            style={{
                              padding: '10px 18px',
                              background: '#ffffff',
                              color: '#0f4c4a',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '12.5px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            <CheckCheck size={16} />
                            <span>Mark All as Read ({unreadItems.length})</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter Bar */}
                    <div
                      style={{
                        background: isDarkMode ? '#134744' : '#ffffff',
                        borderRadius: '14px',
                        border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                        padding: '14px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                          { id: 'ALL', label: 'All Alerts', count: realtimeNotifications.length },
                          { id: 'UNREAD', label: 'Unread Only', count: unreadItems.length },
                          { id: 'URGENT', label: 'Urgent', count: realtimeNotifications.filter((n) => n.priority === 'URGENT').length },
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setNotificationFilter(f.id as any)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '700',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: notificationFilter === f.id ? '#2563eb' : (isDarkMode ? '#2f4f4c' : '#ebf5f1'),
                              color: notificationFilter === f.id ? '#ffffff' : (isDarkMode ? '#cfdcd8' : '#4b605b'),
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{f.label}</span>
                            <span style={{ fontSize: '10px', background: notificationFilter === f.id ? 'rgba(255,255,255,0.25)' : (isDarkMode ? '#134744' : '#dcebe6'), padding: '1px 6px', borderRadius: '10px' }}>
                              {f.count}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div style={{ fontSize: '12px', color: '#5f736f' }}>
                        Auto-syncs every 4 seconds • Socket real-time ready
                      </div>
                    </div>

                    {/* Notifications Feed */}
                    {filtered.length === 0 ? (
                      <div
                        style={{
                          background: isDarkMode ? '#134744' : '#ffffff',
                          borderRadius: '16px',
                          border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                          padding: '48px 24px',
                          textAlign: 'center',
                          color: '#5f736f',
                        }}
                      >
                        <Bell size={40} color="#8da19d" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: '0 0 6px 0' }}>
                          No Notifications Found
                        </h4>
                        <p style={{ fontSize: '13px', margin: 0 }}>
                          You are completely up to date. New announcements or student submissions will appear here live.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {filtered.map((item, idx) => {
                          const isUnread = !item.isRead;
                          const notifId = item._id || item.id || idx;

                          return (
                            <div
                              key={notifId}
                              style={{
                                background: isDarkMode ? '#134744' : '#ffffff',
                                borderRadius: '12px',
                                border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                                padding: '16px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '16px',
                                borderLeft: isUnread ? '4px solid #2563eb' : (isDarkMode ? '4px solid #2f4f4c' : '4px solid #dcebe6'),
                                boxShadow: isUnread ? '0 2px 8px rgba(37,99,235,0.06)' : 'none',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                <div
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: isUnread ? '#eff6ff' : (isDarkMode ? '#0e3e3b' : '#f4faf8'),
                                    color: isUnread ? '#2563eb' : '#5f736f',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '2px',
                                  }}
                                >
                                  <Bell size={18} />
                                </div>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <strong style={{ fontSize: '14px', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                                      {item.title}
                                    </strong>
                                    {isUnread && (
                                      <span style={{ fontSize: '9.5px', fontWeight: '800', background: '#2563eb', color: '#ffffff', padding: '1px 6px', borderRadius: '10px' }}>
                                        NEW
                                      </span>
                                    )}
                                    {item.priority === 'URGENT' && (
                                      <span style={{ fontSize: '9.5px', fontWeight: '800', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '10px' }}>
                                        URGENT
                                      </span>
                                    )}
                                  </div>
                                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: isDarkMode ? '#cfdcd8' : '#4b605b', lineHeight: '1.5' }}>
                                    {item.message}
                                  </p>
                                  <div style={{ fontSize: '11px', color: '#8da19d' }}>
                                    {item.createdAt ? new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently'}
                                  </div>
                                </div>
                              </div>

                              <div>
                                {isUnread && (
                                  <button
                                    onClick={() => handleMarkNotificationRead(item._id || item.id)}
                                    style={{
                                      padding: '6px 14px',
                                      borderRadius: '8px',
                                      background: isDarkMode ? '#2f4f4c' : '#ebf5f1',
                                      border: 'none',
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                      color: isDarkMode ? '#f4faf8' : '#2f4f4c',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    Mark as Read
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {(activeNav === 'INSIGHTS' || activeNav === 'MONITORING' || activeNav === 'PROGRESS') && (
                <TeacherInsightsPanel key={activeNav} view={activeNav} scopes={insightScopes} />
              )}

              {/* ══════════════════════════════════════════════════════════════════
              VIEW 10: CURRICULUM & PEDAGOGICAL KNOWLEDGE BASE
             ══════════════════════════════════════════════════════════════════ */}
              {activeNav === 'AI_ASSISTANT' && <AIAssistantPanel role="TEACHER" />}

              {activeNav === 'KNOWLEDGE_BASE' && (() => {
                const filteredArticles = knowledgeBaseArticlesList.filter((art) => {
                  const matchCategory = kbCategory === 'ALL' || art.category === kbCategory;
                  const matchQuery = !kbSearchQuery ||
                    art.title.toLowerCase().includes(kbSearchQuery.toLowerCase()) ||
                    art.summary.toLowerCase().includes(kbSearchQuery.toLowerCase()) ||
                    art.tags.some(t => t.toLowerCase().includes(kbSearchQuery.toLowerCase()));
                  return matchCategory && matchQuery;
                });

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Header */}
                    <div
                      style={{
                        background: isDarkMode ? 'linear-gradient(135deg, #134744 0%, #0f5f55 100%)' : 'linear-gradient(135deg, #117a6b 0%, #117a6b 100%)',
                        borderRadius: '16px',
                        padding: '24px 28px',
                        color: '#ffffff',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                          NEPAL CDC CURRICULUM & PEDAGOGY REPOSITORY
                        </span>
                        <span style={{ fontSize: '12px', opacity: 0.9 }}>Classes 1–12 Framework</span>
                      </div>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0' }}>
                        Curriculum, Assessment & Pedagogical Knowledge Base
                      </h2>
                      <p style={{ margin: 0, fontSize: '13px', opacity: 0.85, maxWidth: '680px' }}>
                        Official Ministry directives, Continuous Assessment System (CAS) rubrics, examination specification grids, and Bloom's taxonomy lesson planning guides.
                      </p>
                    </div>

                    {/* Search & Category Filter Pills */}
                    <div
                      style={{
                        background: isDarkMode ? '#134744' : '#ffffff',
                        borderRadius: '14px',
                        padding: '16px 20px',
                        border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                          { key: 'ALL', label: 'All Resources' },
                          { key: 'CDC', label: 'National Curriculum (CDC)' },
                          { key: 'CAS', label: 'Evaluation & CAS' },
                          { key: 'GRIDS', label: 'SEE & NEB Grids' },
                          { key: 'PEDAGOGY', label: 'Teaching Pedagogy' },
                        ].map((cat) => (
                          <button
                            key={cat.key}
                            onClick={() => setKbCategory(cat.key)}
                            style={{
                              padding: '7px 14px',
                              borderRadius: '8px',
                              border: kbCategory === cat.key ? '1px solid #117a6b' : (isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6'),
                              background: kbCategory === cat.key ? (isDarkMode ? '#0b3f3d' : '#e6f7f0') : 'transparent',
                              color: kbCategory === cat.key ? '#117a6b' : (isDarkMode ? '#cfdcd8' : '#4b605b'),
                              fontSize: '12.5px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8da19d' }} />
                        <input
                          type="text"
                          placeholder="Search guidelines & rubrics..."
                          value={kbSearchQuery}
                          onChange={(e) => setKbSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 36px',
                            borderRadius: '8px',
                            border: isDarkMode ? '1px solid #4b605b' : '1.5px solid #cfdcd8',
                            background: isDarkMode ? '#0e3e3b' : '#ffffff',
                            color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                            fontSize: '12.5px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    {/* Articles Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                      {filteredArticles.map((art) => (
                        <div
                          key={art.id}
                          style={{
                            background: isDarkMode ? '#134744' : '#ffffff',
                            borderRadius: '14px',
                            border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                            padding: '22px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '14px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', background: isDarkMode ? '#0b3f3d' : '#e6f7f0', color: '#117a6b', padding: '3px 8px', borderRadius: '4px' }}>
                                {art.categoryLabel}
                              </span>
                              <span style={{ fontSize: '11.5px', color: '#5f736f' }}>{art.readTime}</span>
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: '0 0 6px 0' }}>
                              {art.title}
                            </h3>
                            <div style={{ fontSize: '13px', color: isDarkMode ? '#8da19d' : '#117a6b', fontWeight: '700', marginBottom: '8px' }}>
                              {art.titleNp}
                            </div>
                            <p style={{ fontSize: '12.5px', color: isDarkMode ? '#cfdcd8' : '#4b605b', lineHeight: 1.5, margin: 0 }}>
                              {art.summary}
                            </p>
                          </div>

                          <div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                              {art.tags.map((t, idx) => (
                                <span key={idx} style={{ fontSize: '10.5px', background: isDarkMode ? '#2f4f4c' : '#ebf5f1', color: isDarkMode ? '#cfdcd8' : '#5f736f', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                                  #{t}
                                </span>
                              ))}
                            </div>

                            <button
                              onClick={() => setSelectedKbArticle(art)}
                              style={{
                                width: '100%',
                                padding: '9px',
                                background: isDarkMode ? '#0b3f3d' : '#e6f7f0',
                                color: '#117a6b',
                                border: '1px solid #bfeede',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              <BookOpen size={14} />
                              <span>Read Official Guideline →</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
                          {/* ══════════════════════════════════════════════════════════════════
                  VIEW: FACULTY PROFILE & CREDENTIALS (FULL-PAGE VIEW MATCHING PRINCIPAL DASHBOARD)
                 ══════════════════════════════════════════════════════════════════ */}
              {activeNav === 'PROFILE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1000px', margin: '0 auto' }}>
                  {/* Executive Hero Banner (Matching Principal Profile Image 1) */}
                  <div
                    style={{
                      borderRadius: '20px',
                      padding: '24px 28px',
                      background: 'linear-gradient(135deg, #0f5f55 0%, #0f5f55 50%, #0f5f55 100%)',
                      color: '#ffffff',
                      boxShadow: '0 8px 24px rgba(6, 95, 70, 0.22)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '18px', position: 'relative', zIndex: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: '#ffffff',
                            color: '#0b3f3d',
                            fontSize: '24px',
                            fontWeight: '900',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            flexShrink: 0,
                          }}
                        >
                          {user?.fullName ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'TC'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                              {user?.fullName || 'Faculty Teacher'}
                              {user?.fullNameNepali && <span lang="ne" style={{ fontSize: '16px', fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginLeft: '10px' }}>({user?.fullNameNepali})</span>}
                            </h2>
                            <span
                              style={{
                                padding: '3px 12px',
                                borderRadius: '20px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: '#dcfce7',
                                fontSize: '11px',
                                fontWeight: '800',
                                border: '1px solid rgba(255, 255, 255, 0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></span>
                              Active Faculty
                            </span>
                            {user?.isClassTeacher && (
                              <span
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: '20px',
                                  background: '#ede9fe',
                                  color: '#3b2f8f',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                }}
                              >
                                Class Teacher
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '13px', color: '#e6fffa', margin: '4px 0 0 0' }}>
                            Faculty Member & Subject Specialist • EMIS {user?.institutionCode || '570010001'}
                          </p>
                          <p style={{ fontSize: '12px', color: '#bfeede', margin: '2px 0 0 0' }}>
                            {institutionName}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          navigate('/login');
                        }}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.12)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-tab pills (Institutional Details / Security & Change Password) */}
                  <div style={{ display: 'flex', gap: '8px', borderBottom: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6', paddingBottom: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setProfileActiveTab('DETAILS')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        border: profileActiveTab === 'DETAILS' ? 'none' : (isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8'),
                        background: profileActiveTab === 'DETAILS' ? '#117a6b' : (isDarkMode ? '#134744' : '#ffffff'),
                        color: profileActiveTab === 'DETAILS' ? '#ffffff' : (isDarkMode ? '#8da19d' : '#4b605b'),
                        boxShadow: profileActiveTab === 'DETAILS' ? '0 2px 8px rgba(17, 122, 107, 0.25)' : 'none',
                      }}
                    >
                      <School size={15} />
                      <span>Institutional Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProfileActiveTab('SECURITY')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        border: profileActiveTab === 'SECURITY' ? 'none' : (isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8'),
                        background: profileActiveTab === 'SECURITY' ? '#117a6b' : (isDarkMode ? '#134744' : '#ffffff'),
                        color: profileActiveTab === 'SECURITY' ? '#ffffff' : (isDarkMode ? '#8da19d' : '#4b605b'),
                        boxShadow: profileActiveTab === 'SECURITY' ? '0 2px 8px rgba(17, 122, 107, 0.25)' : 'none',
                      }}
                    >
                      <ShieldCheck size={15} />
                      <span>Security & Change Password</span>
                    </button>
                  </div>

                  {/* DETAILS SUB-TAB */}
                  {profileActiveTab === 'DETAILS' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {/* Top Metric Cards */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '14px',
                        }}
                      >
                        <div
                          style={{
                            padding: '16px 20px',
                            background: isDarkMode ? '#134744' : '#ffffff',
                            borderRadius: '14px',
                            border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          }}
                        >
                          <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Courses Taught</div>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: isDarkMode ? '#2fcf9c' : '#117a6b', marginTop: '4px' }}>
                            {allocations.length || SUBJECT_COURSES.length} Subjects
                          </div>
                          <div style={{ fontSize: '11.5px', color: isDarkMode ? '#8da19d' : '#5f736f', marginTop: '2px' }}>
                            Across {uniqueClassesCount} Grade Levels
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '16px 20px',
                            background: isDarkMode ? '#134744' : '#ffffff',
                            borderRadius: '14px',
                            border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          }}
                        >
                          <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Weekly Load</div>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: isDarkMode ? '#38bdf8' : '#0284c7', marginTop: '4px' }}>
                            {totalWeeklyPeriods} Periods
                          </div>
                          <div style={{ fontSize: '11.5px', color: isDarkMode ? '#8da19d' : '#5f736f', marginTop: '2px' }}>
                            Published Timetable Slots
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '16px 20px',
                            background: isDarkMode ? '#134744' : '#ffffff',
                            borderRadius: '14px',
                            border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          }}
                        >
                          <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Student Reach</div>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: isDarkMode ? '#6d5bd0' : '#6d5bd0', marginTop: '4px' }}>
                            {distinctStudentsCount} Students
                          </div>
                          <div style={{ fontSize: '11.5px', color: isDarkMode ? '#8da19d' : '#5f736f', marginTop: '2px' }}>
                            Active Enrolled Learners
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '16px 20px',
                            background: isDarkMode ? '#134744' : '#ffffff',
                            borderRadius: '14px',
                            border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          }}
                        >
                          <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Curriculum Standard</div>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: isDarkMode ? '#a78bfa' : '#6366f1', marginTop: '4px' }}>
                            Nepal CDC 2078
                          </div>
                          <div style={{ fontSize: '11.5px', color: isDarkMode ? '#8da19d' : '#5f736f', marginTop: '2px' }}>
                            Continuous & Terminal Assessment
                          </div>
                        </div>
                      </div>

                      {/* Two Primary Info Cards (Matching Principal Image 1) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
                        {/* Left Card: Faculty Professional Profile */}
                        <div
                          style={{
                            background: isDarkMode ? '#134744' : '#ffffff',
                            borderRadius: '16px',
                            border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <h3
                            style={{
                              fontSize: '14px',
                              fontWeight: '800',
                              color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                              margin: '0 0 6px 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <School size={17} color="#117a6b" />
                            <span>Executive & Faculty Profile</span>
                          </h3>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Official Title:</span>
                            <span style={{ fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                              Faculty Teacher & Subject Specialist
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Username:</span>
                            <span style={{ fontWeight: '800', fontFamily: 'monospace', color: isDarkMode ? '#2fcf9c' : '#117a6b' }}>
                              {user?.username || 'dhambojhi_teacher'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Staff ID:</span>
                            <span style={{ fontWeight: '800', fontFamily: 'monospace', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                              {staffId}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Staff Designation:</span>
                            <span style={{ fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                              {user?.designation || user?.role || 'TEACHER'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Official Email:</span>
                            <span style={{ fontWeight: '700', color: isDarkMode ? '#f4faf8' : '#0e3e3b', wordBreak: 'break-all' }}>
                              {facultyEmail}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Contact Phone:</span>
                            <span style={{ fontWeight: '700', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                              {user?.phoneNumber || user?.phone || 'Not provided'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Curriculum Authority:</span>
                            <span style={{ fontWeight: '800', color: isDarkMode ? '#2fcf9c' : '#117a6b' }}>
                              Nepal CDC & National Examination Board
                            </span>
                          </div>
                        </div>

                        {/* Right Card: Academic Structure */}
                        <div
                          style={{
                            background: isDarkMode ? '#134744' : '#ffffff',
                            borderRadius: '16px',
                            border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <h3
                            style={{
                              fontSize: '14px',
                              fontWeight: '800',
                              color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                              margin: '0 0 6px 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <Layers size={17} color="#117a6b" />
                            <span>Academic Structure & Assignment</span>
                          </h3>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Institution:</span>
                            <span style={{ fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                              {institutionName}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>EMIS Code:</span>
                            <span style={{ fontWeight: '800', fontFamily: 'monospace', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                              {user?.institutionCode || '570010001'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Active Subjects:</span>
                            <span style={{ fontWeight: '800', color: isDarkMode ? '#2fcf9c' : '#117a6b' }}>
                              {allocations.length || SUBJECT_COURSES.length} Subject Allocations
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Weekly Teaching Load:</span>
                            <span style={{ fontWeight: '800', color: isDarkMode ? '#38bdf8' : '#0284c7' }}>
                              {totalWeeklyPeriods} Periods / Week
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: isDarkMode ? '1px solid #2f4f4c' : '1px solid #ebf5f1', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Classes & Sections:</span>
                            <span style={{ fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                              {uniqueClassesCount} Grade Sections
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', fontSize: '12.5px' }}>
                            <span style={{ color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Role Permissions:</span>
                            <span style={{ fontWeight: '800', color: isDarkMode ? '#2fcf9c' : '#117a6b' }}>
                              Subject Evaluations, Quizzes, Attendance
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card 3: Assigned Teaching Groups & Published Timetable */}
                      <div
                        style={{
                          background: isDarkMode ? '#134744' : '#ffffff',
                          borderRadius: '16px',
                          border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                          padding: '24px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <h3
                              style={{
                                fontSize: '14px',
                                fontWeight: '800',
                                color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <BookOpen size={17} color="#117a6b" />
                              <span>Assigned Teaching Groups (Published Timetable)</span>
                            </h3>
                            <p style={{ fontSize: '12px', color: isDarkMode ? '#8da19d' : '#5f736f', margin: '3px 0 0 0' }}>
                              Courses officially allocated to your profile with direct Smart Board and Classroom access.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenLauncher()}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              background: '#117a6b',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 6px rgba(17,122,107,0.2)',
                            }}
                          >
                            <Presentation size={14} />
                            <span>Launch Smart Board Canvas</span>
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                          {(allocations.length > 0 ? allocations : SUBJECT_COURSES).map((sub, idx) => {
                            const subName = sub.centralSubjectId?.name || sub.name;
                            const subCode = sub.centralSubjectId?.code || sub.code || `SUB${idx + 1}`;
                            const classSection = sub.sectionId?.name
                              ? `Class ${sub.sectionId?.classId?.gradeNumber || ''} · ${sub.sectionId?.name}`
                              : sub.classSem || 'Class Section';
                            const periodsText = sub.periods || '5 Periods / Wk';

                            return (
                              <div
                                key={idx}
                                style={{
                                  padding: '14px 16px',
                                  background: isDarkMode ? '#0e3e3b' : '#f4faf8',
                                  border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                                  borderRadius: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div
                                    style={{
                                      padding: '6px 10px',
                                      borderRadius: '8px',
                                      background: isDarkMode ? '#0b3f3d' : '#e6f7f0',
                                      color: isDarkMode ? '#2fcf9c' : '#117a6b',
                                      fontWeight: '800',
                                      fontSize: '11px',
                                      fontFamily: 'monospace',
                                    }}
                                  >
                                    {subCode}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '13.5px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                                      {subName}
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: isDarkMode ? '#8da19d' : '#5f736f', marginTop: '2px' }}>
                                      {classSection}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '700', color: isDarkMode ? '#38bdf8' : '#0284c7' }}>
                                    {periodsText}
                                  </span>
                                  {sub.centralSubjectId && (
                                    <button
                                      type="button"
                                      onClick={() => openWorkspace(sub, true)}
                                      style={{
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        background: isDarkMode ? '#134744' : '#ffffff',
                                        border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        color: isDarkMode ? '#f4faf8' : '#2f4f4c',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Enter Class
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECURITY & CHANGE PASSWORD SUB-TAB */}
                  {profileActiveTab === 'SECURITY' && (
                    <div style={{ maxWidth: '560px' }}>
                      <div
                        style={{
                          background: isDarkMode ? '#134744' : '#ffffff',
                          borderRadius: '16px',
                          border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                          padding: '28px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        }}
                      >
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: '0 0 6px 0' }}>
                          Change Faculty Password
                        </h3>
                        <p style={{ fontSize: '12.5px', color: isDarkMode ? '#8da19d' : '#5f736f', margin: '0 0 20px 0' }}>
                          Ensure your faculty teaching portal account is secured with a strong personal password.
                        </p>

                        {passwordChangeMsg && (
                          <div
                            style={{
                              padding: '12px 14px',
                              borderRadius: '10px',
                              fontSize: '12.5px',
                              fontWeight: '700',
                              marginBottom: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: passwordChangeMsg.type === 'success' ? (isDarkMode ? '#0b3f3d' : '#e6f7f0') : (isDarkMode ? '#7f1d1d' : '#fef2f2'),
                              color: passwordChangeMsg.type === 'success' ? (isDarkMode ? '#2fcf9c' : '#117a6b') : (isDarkMode ? '#f87171' : '#dc2626'),
                              border: passwordChangeMsg.type === 'success' ? '1px solid #bfeede' : '1px solid #fecaca',
                            }}
                          >
                            {passwordChangeMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                            <span>{passwordChangeMsg.text}</span>
                          </div>
                        )}

                        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: isDarkMode ? '#cfdcd8' : '#2f4f4c' }}>
                              Current Password *
                            </label>
                            <div style={{ position: 'relative' }}>
                              <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPasswordInput}
                                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                                placeholder="Enter your current password"
                                required
                                style={{
                                  width: '100%',
                                  padding: '10px 40px 10px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8',
                                  background: isDarkMode ? '#0e3e3b' : '#ffffff',
                                  color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                                  fontSize: '13px',
                                  outline: 'none',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                style={{
                                  position: 'absolute',
                                  right: '10px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#5f736f',
                                }}
                              >
                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: isDarkMode ? '#cfdcd8' : '#2f4f4c' }}>
                              New Password *
                            </label>
                            <div style={{ position: 'relative' }}>
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPasswordInput}
                                onChange={(e) => setNewPasswordInput(e.target.value)}
                                placeholder="Minimum 6 characters"
                                required
                                style={{
                                  width: '100%',
                                  padding: '10px 40px 10px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8',
                                  background: isDarkMode ? '#0e3e3b' : '#ffffff',
                                  color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                                  fontSize: '13px',
                                  outline: 'none',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{
                                  position: 'absolute',
                                  right: '10px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#5f736f',
                                }}
                              >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: isDarkMode ? '#cfdcd8' : '#2f4f4c' }}>
                              Confirm New Password *
                            </label>
                            <div style={{ position: 'relative' }}>
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPasswordInput}
                                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                                placeholder="Re-type new password"
                                required
                                style={{
                                  width: '100%',
                                  padding: '10px 40px 10px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8',
                                  background: isDarkMode ? '#0e3e3b' : '#ffffff',
                                  color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                                  fontSize: '13px',
                                  outline: 'none',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                  position: 'absolute',
                                  right: '10px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#5f736f',
                                }}
                              >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button
                              type="submit"
                              disabled={passwordChangeLoading}
                              style={{
                                padding: '10px 22px',
                                borderRadius: '8px',
                                background: '#117a6b',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '13px',
                                fontWeight: '800',
                                cursor: passwordChangeLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(17, 122, 107, 0.25)',
                              }}
                            >
                              {passwordChangeLoading && <RefreshCw size={14} className="animate-spin" />}
                              <span>{passwordChangeLoading ? 'Updating Password...' : 'Save New Password'}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MODALS & OVERLAYS
         ══════════════════════════════════════════════════════════════════ */}

            {/* 1. Unified Upload Learning Resource / Upload Files Modal */}
      {isUploadFilesModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', width: '560px', maxWidth: '92%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderPlus size={18} color="#7c3aed" />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>Upload Learning Resource</h3>
              </div>
              <button
                onClick={() => setIsUploadFilesModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#5f736f' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#5f736f', marginBottom: '18px' }}>
              Upload and publish curriculum-aligned notes, study documents, slide presentations, or video lectures for enrolled students.
            </p>

            {/* Resource Type Selector Pills */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#4b605b', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Resource Category
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { key: 'NOTE', label: 'Lecture Note', icon: FileText, color: '#2563eb' },
                  { key: 'MATERIAL', label: 'Study Doc', icon: Folder, color: '#117a6b' },
                  { key: 'PRESENTATION', label: 'Slides', icon: Presentation, color: '#6d5bd0' },
                  { key: 'VIDEO', label: 'Video Lecture', icon: Video, color: '#dc2626' },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSel = uploadFileType === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setUploadFileType(t.key as any)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: isSel ? `2px solid ${t.color}` : '1px solid #cfdcd8',
                        background: isSel ? '#f4faf8' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Icon size={16} color={t.color} />
                      <span style={{ fontSize: '11px', fontWeight: isSel ? '800' : '600', color: isSel ? '#0e3e3b' : '#5f736f' }}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleCreateResource} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: नेपाली व्याकरण - कारक र विभक्ति विस्तृत नियम"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                    Unit / Chapter
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 3: नेपाली व्याकरण"
                    value={uploadChapter}
                    onChange={(e) => setUploadChapter(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                    Target Class & Section
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${SUBJECT_COURSES[activeCourseIndex]?.name} (${SUBJECT_COURSES[activeCourseIndex]?.classSem})`}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '12px', background: '#f4faf8', color: '#4b605b', fontWeight: '700' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Description & Student Learning Objective
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize key learning takeaways and instructions for students..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Resource File *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <input type="checkbox" id="shareCheck" defaultChecked />
                <label htmlFor="shareCheck" style={{ fontSize: '12px', color: '#2f4f4c', fontWeight: '600' }}>
                  Instantly publish to Enrolled Students Dashboard & Parent Portal
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadFilesModalOpen(false)}
                  style={{ padding: '9px 16px', background: '#ebf5f1', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#4b605b' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resourceUploading}
                  style={{
                    padding: '9px 20px',
                    background: resourceUploading ? '#8da19d' : '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: resourceUploading ? 'wait' : 'pointer',
                    boxShadow: '0 2px 4px rgba(124,58,237,0.2)',
                  }}
                >
                  {resourceUploading ? 'Uploading...' : 'Upload & Share File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Role-Aware Announcement Modal */}
      {isAnnouncementModalOpen && (() => {
        const isClassTeacher = Boolean(overview?.counts?.isClassTeacher && overview?.classTeacherSection);

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,62,59,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div style={{ background: isDarkMode ? '#134744' : '#ffffff', borderRadius: '20px', padding: '28px', width: '580px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: isClassTeacher && announcementType === 'CLASS_OVERALL' ? '#e6f7f0' : '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Megaphone size={20} color={isClassTeacher && announcementType === 'CLASS_OVERALL' ? '#117a6b' : '#6d5bd0'} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: 0 }}>
                      Publish Academic Announcement
                    </h3>
                    <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                      {isClassTeacher
                        ? 'Publish as Class Teacher (Section Overall) or as Subject Faculty'
                        : 'Publish course notices for your assigned teaching subjects'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#5f736f', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Scope Selector Tabs */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#dcebe6' : '#2f4f4c', display: 'block', marginBottom: '8px' }}>
                  Announcement Scope & Authority *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: isDarkMode ? '#0e3e3b' : '#ebf5f1', padding: '5px', borderRadius: '12px' }}>
                  
                  {/* Option A: Particular Subject Announcement */}
                  <button
                    type="button"
                    onClick={() => setAnnouncementType('SUBJECT_SPECIFIC')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '9px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      background: announcementType === 'SUBJECT_SPECIFIC' ? (isDarkMode ? '#134744' : '#ffffff') : 'transparent',
                      color: announcementType === 'SUBJECT_SPECIFIC' ? '#6d5bd0' : '#5f736f',
                      boxShadow: announcementType === 'SUBJECT_SPECIFIC' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={14} />
                      <span>Particular Subject</span>
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: '500', opacity: 0.8 }}>Coursework, homework & test notices</span>
                  </button>

                  {/* Option B: Overall Class Announcement (Class Teacher Exclusive) */}
                  <button
                    type="button"
                    disabled={!isClassTeacher}
                    onClick={() => isClassTeacher && setAnnouncementType('CLASS_OVERALL')}
                    title={!isClassTeacher ? 'Requires appointed Class Teacher designation by Principal/Admin' : 'Broadcast to entire Section'}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '9px',
                      border: 'none',
                      cursor: isClassTeacher ? 'pointer' : 'not-allowed',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      opacity: !isClassTeacher ? 0.5 : 1,
                      background: announcementType === 'CLASS_OVERALL' && isClassTeacher ? (isDarkMode ? '#0b3f3d' : '#ffffff') : 'transparent',
                      color: announcementType === 'CLASS_OVERALL' && isClassTeacher ? '#117a6b' : '#5f736f',
                      boxShadow: announcementType === 'CLASS_OVERALL' && isClassTeacher ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GraduationCap size={15} />
                      <span>Entire Class (Section Lead)</span>
                      {!isClassTeacher && (
                        <span style={{ fontSize: '9px', background: '#fee2e2', color: '#dc2626', padding: '1px 5px', borderRadius: '6px' }}>Locked</span>
                      )}
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: '500', opacity: 0.8 }}>
                      {isClassTeacher ? `Class ${overview?.classTeacherSection?.gradeNumber || 10} • Section ${overview?.classTeacherSection?.name || 'A'}` : 'Class Teacher only'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Dynamic Scope Details Card */}
              {announcementType === 'CLASS_OVERALL' && isClassTeacher ? (
                <div style={{ padding: '12px 16px', background: isDarkMode ? '#0b3f3d22' : '#e6f7f0', border: '1px solid #bfeede', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} color="#117a6b" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '12px', color: '#0f4c4a' }}>
                    <strong>Supervisory Authority:</strong> This notice will be posted on the official bulletin for all <strong>{overview?.classTeacherSection?.studentCount ?? 0} students</strong> of <strong>Class {overview?.classTeacherSection?.gradeNumber || 10} – Section {overview?.classTeacherSection?.name || 'A'}</strong>.
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#dcebe6' : '#2f4f4c', display: 'block', marginBottom: '6px' }}>
                    Select Teaching Subject & Section *
                  </label>
                  <select
                    value={announcementAllocIndex}
                    onChange={(e) => setAnnouncementAllocIndex(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8',
                      background: isDarkMode ? '#0e3e3b' : '#ffffff',
                      color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                      fontSize: '13px',
                      fontWeight: '600',
                      outline: 'none',
                    }}
                  >
                    {effectiveAllocations.map((alloc, idx) => {
                      const subName = alloc.centralSubjectId?.name || alloc.subjectName || 'Subject';
                      const secName = alloc.sectionId?.name || 'Section';
                      const grNum = alloc.sectionId?.classId?.gradeNumber || alloc.sectionId?.classId?.name || '';
                      return (
                        <option key={idx} value={idx}>
                          {subName} — {grNum ? `Class ${grNum} • ` : ''}{secName} ({alloc.periodsPerWeek || 5} periods/wk)
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Title & Priority Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#dcebe6' : '#2f4f4c', display: 'block', marginBottom: '6px' }}>
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    placeholder={
                      announcementType === 'CLASS_OVERALL'
                        ? 'e.g. Morning Assembly Guidelines & Dress Code for Tomorrow'
                        : 'e.g. Chapter 4 Numerical Derivation Exercise Due Thursday'
                    }
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8',
                      background: isDarkMode ? '#0e3e3b' : '#ffffff',
                      color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#dcebe6' : '#2f4f4c', display: 'block', marginBottom: '6px' }}>
                    Priority
                  </label>
                  <select
                    value={announcementPriority}
                    onChange={(e) => setAnnouncementPriority(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8',
                      background: isDarkMode ? '#0e3e3b' : '#ffffff',
                      color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                      fontSize: '13px',
                      fontWeight: '600',
                      outline: 'none',
                    }}
                  >
                    <option value="NORMAL">Standard Notice</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">🚨 Urgent Notice</option>
                  </select>
                </div>
              </div>

              {/* Message Content */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#dcebe6' : '#2f4f4c', display: 'block', marginBottom: '6px' }}>
                  Detailed Announcement Message *
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter the full announcement details, syllabus references, or guidelines for students..."
                  value={newAnnouncementText}
                  onChange={(e) => setNewAnnouncementText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8',
                    background: isDarkMode ? '#0e3e3b' : '#ffffff',
                    color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', color: '#5f736f' }}>
                  Broadcasts in real-time to student web dashboards & bells
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAnnouncementModalOpen(false)}
                    style={{
                      padding: '9px 18px',
                      background: isDarkMode ? '#2f4f4c' : '#ebf5f1',
                      color: isDarkMode ? '#f4faf8' : '#4b605b',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishAnnouncement}
                    style={{
                      padding: '9px 22px',
                      background: announcementType === 'CLASS_OVERALL' ? '#117a6b' : '#6d5bd0',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Megaphone size={15} />
                    <span>Publish Announcement</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 3. Secure Vault Modal */}
      {isVaultModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', width: '520px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} color="#117a6b" />
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Examination Secure Vault</h3>
              </div>
              <button onClick={() => setIsVaultModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <p style={{ fontSize: '12px', color: '#5f736f', marginBottom: '16px' }}>
              Encrypted institutional exam question bank and answer keys with role-based moderation.
            </p>

            <div style={{ padding: '16px', background: '#f4faf8', borderRadius: '10px', border: '1px solid #dcebe6', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong>First Terminal Exam 2083 (Draft Paper)</strong>
                <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: '#ede9fe', color: '#4c3fa8' }}>UNDER MODERATION</span>
              </div>
              <div style={{ fontSize: '11px', color: '#5f736f' }}>
                Locked by School Examination Committee • 75 Marks Theory + 25 Marks Practical
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsVaultModalOpen(false)} style={{ padding: '8px 16px', background: '#117a6b', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Close Vault</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Smart Board Launcher Modal */}
      {dossier && <StudentDossierModal studentId={dossier.studentId} sectionId={dossier.sectionId} onClose={() => setDossier(null)} />}

      {isLauncherOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: isDarkMode ? '#134744' : '#ffffff', color: isDarkMode ? '#f4faf8' : '#0e3e3b', borderRadius: '16px', padding: '28px', width: '560px', maxWidth: '90%', border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Presentation size={20} color="#117a6b" />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>Launch Smart Board Canvas</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f' }}>Interactive CDC Digital Teaching & Presentation System</p>
                </div>
              </div>
              <button onClick={() => setIsLauncherOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: isDarkMode ? '#8da19d' : '#5f736f' }}>✕</button>
            </div>

            <form onSubmit={handleExecuteLaunch}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px', color: isDarkMode ? '#cfdcd8' : '#2f4f4c' }}>Teaching Course</label>
                  <select
                    value={launcherAllocIndex}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      setLauncherAllocIndex(idx);
                      if (allocations[idx]) {
                        loadLauncherResourcesForAlloc(allocations[idx]);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8',
                      borderRadius: '8px',
                      fontSize: '13px',
                      background: isDarkMode ? '#0e3e3b' : '#ffffff',
                      color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                    }}
                  >
                    {allocations.length === 0 && <option value="">No teaching allocations available</option>}
                    {allocations.map((a: any, idx: number) => (
                      <option key={idx} value={idx}>
                        {a.centralSubjectId?.name} — {a.sectionId?.name} (Class {a.sectionId?.classId?.gradeNumber || '—'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px', color: isDarkMode ? '#cfdcd8' : '#2f4f4c' }}>Session Teaching Mode</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {(['TEXTBOOK', 'WHITEBOARD', 'SIMULATION'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setLauncherMode(m)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          border: launcherMode === m ? '2px solid #117a6b' : (isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8'),
                          background: launcherMode === m ? (isDarkMode ? '#0b3f3d' : '#e6f7f0') : (isDarkMode ? '#0e3e3b' : '#ffffff'),
                          color: launcherMode === m ? (isDarkMode ? '#2fcf9c' : '#117a6b') : (isDarkMode ? '#8da19d' : '#4b605b'),
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {m === 'TEXTBOOK' && '📚 Textbook PDF'}
                        {m === 'WHITEBOARD' && '✏️ Whiteboard'}
                        {m === 'SIMULATION' && '🎮 Simulation'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px', color: isDarkMode ? '#cfdcd8' : '#2f4f4c' }}>Lesson Title</label>
                  <input
                    type="text"
                    value={launcherLessonTitle}
                    onChange={(e) => setLauncherLessonTitle(e.target.value)}
                    placeholder="e.g. Unit 3: Karak ra Bibhakti - Abhyas"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8',
                      borderRadius: '8px',
                      fontSize: '13px',
                      background: isDarkMode ? '#0e3e3b' : '#ffffff',
                      color: isDarkMode ? '#f4faf8' : '#0e3e3b',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsLauncherOpen(false)}
                    style={{
                      padding: '8px 16px',
                      background: isDarkMode ? '#2f4f4c' : '#ebf5f1',
                      color: isDarkMode ? '#f4faf8' : '#4b605b',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => launchDesktopSmartBoard(() => toast(DESKTOP_SETUP_HINT, 'error'))}
                    title="Open the Smart Board desktop app (a plain board, no class session)"
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #cfdcd8',
                      background: 'transparent',
                      color: isDarkMode ? '#cfdcd8' : '#2f4f4c',
                    }}
                  >
                    🖥 Desktop app
                  </button>
                  <button
                    type="submit"
                    disabled={launcherLoading || allocations.length === 0}
                    style={{
                      padding: '8px 18px',
                      background: '#117a6b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {launcherLoading ? 'Launching...' : '🚀 Launch Smart Board'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          ACADEMIC FACULTY PROFILE MODAL (View Profile Details)
         ══════════════════════════════════════════════════════════════════ */}
      {false && ( /* Modal replaced by full-page profile view */
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 120,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsProfileModalOpen(false);
          }}
        >
          <div
            style={{
              background: isDarkMode ? '#111827' : '#ffffff',
              color: isDarkMode ? '#f4faf8' : '#0e3e3b',
              borderRadius: '20px',
              border: isDarkMode ? '1px solid #374151' : '1px solid #dcebe6',
              width: '740px',
              maxWidth: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative',
            }}
          >
            {/* Header Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0f5f55 0%, #117a6b 50%, #117a6b 100%)',
                padding: '28px 24px 20px',
                borderTopLeftRadius: '19px',
                borderTopRightRadius: '19px',
                position: 'relative',
                color: '#ffffff',
              }}
            >
              <button
                onClick={() => setIsProfileModalOpen(false)}
                title="Close Profile"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'background 0.2s',
                }}
              >
                ✕
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    color: '#0f5f55',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    fontWeight: '900',
                    border: '3px solid #2fcf9c',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  }}
                >
                  BP
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.3px', color: '#ffffff' }}>
                      {user?.fullName || 'Teacher'}
                      {user?.fullNameNepali && <span lang="ne" style={{ fontSize: '16px', fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginLeft: '10px' }}>({user?.fullNameNepali})</span>}
                    </h2>
                    <span
                      style={{
                        padding: '3px 10px',
                        background: '#dcfce7',
                        color: '#15803d',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
                      Active Faculty
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', opacity: 0.9 }}>
                    {user?.designation || user?.role || 'Teacher'}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', opacity: 0.85, flexWrap: 'wrap' }}>
                    <span>Staff ID: <strong>{staffId}</strong></span>
                    <span>•</span>
                    <span>Institution: <strong>{institutionName}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Quick Summary Badges */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    padding: '12px',
                    background: isDarkMode ? '#134744' : '#f4faf8',
                    borderRadius: '12px',
                    border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Courses</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: isDarkMode ? '#2fcf9c' : '#117a6b', marginTop: '2px' }}>6 Subjects</div>
                </div>
                <div
                  style={{
                    padding: '12px',
                    background: isDarkMode ? '#134744' : '#f4faf8',
                    borderRadius: '12px',
                    border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Weekly Load</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: isDarkMode ? '#38bdf8' : '#0284c7', marginTop: '2px' }}>30 Periods</div>
                </div>
                <div
                  style={{
                    padding: '12px',
                    background: isDarkMode ? '#134744' : '#f4faf8',
                    borderRadius: '12px',
                    border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Curriculum</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: isDarkMode ? '#6d5bd0' : '#6d5bd0', marginTop: '2px' }}>Nepal CDC</div>
                </div>
                <div
                  style={{
                    padding: '12px',
                    background: isDarkMode ? '#134744' : '#f4faf8',
                    borderRadius: '12px',
                    border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Theme Mode</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: isDarkMode ? '#a78bfa' : '#6366f1', marginTop: '6px' }}>
                    ☀️ Light Mode
                  </div>
                </div>
              </div>

              {/* Personal & Institutional Details */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: isDarkMode ? '#2fcf9c' : '#117a6b', marginBottom: '12px' }}>
                  Institutional & Contact Information
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '12px',
                    background: isDarkMode ? '#134744' : '#f4faf8',
                    padding: '16px',
                    borderRadius: '14px',
                    border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Official Email</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: isDarkMode ? '#f4faf8' : '#0e3e3b', marginTop: '2px', wordBreak: 'break-all' }}>
                      {user?.email || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Official Phone / Mobile</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: isDarkMode ? '#f4faf8' : '#0e3e3b', marginTop: '2px' }}>
                      {user?.phoneNumber || user?.phone || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Institution & Province</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: isDarkMode ? '#f4faf8' : '#0e3e3b', marginTop: '2px' }}>
                      {overview?.institution?.address || institutionName}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', fontWeight: '600' }}>Faculty Designation</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: isDarkMode ? '#f4faf8' : '#0e3e3b', marginTop: '2px' }}>
                      {user?.designation || user?.role || 'Teacher'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Teaching Assignments */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: isDarkMode ? '#2fcf9c' : '#117a6b', marginBottom: '12px' }}>
                  Assigned Teaching Groups (Published Timetable)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  {SUBJECT_COURSES.map((sub, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        background: isDarkMode ? '#134744' : '#ffffff',
                        border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', background: isDarkMode ? '#0b3f3d' : '#e6f7f0', color: isDarkMode ? '#2fcf9c' : '#117a6b', padding: '2px 6px', borderRadius: '4px' }}>
                            {sub.code}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: isDarkMode ? '#f4faf8' : '#0e3e3b' }}>
                            {sub.name}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: isDarkMode ? '#8da19d' : '#5f736f', marginTop: '3px' }}>
                          {sub.classSem}{sub.room ? ` • ${sub.room}` : ''}
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: isDarkMode ? '#38bdf8' : '#0284c7' }}>
                        {sub.periods}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      handleOpenLauncher();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #1fb589',
                      background: isDarkMode ? '#0b3f3d' : '#effaf6',
                      color: isDarkMode ? '#2fcf9c' : '#117a6b',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <Presentation size={15} />
                    <span>Launch Smart Board</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    style={{
                      padding: '8px 16px',
                      background: isDarkMode ? '#2f4f4c' : '#ebf5f1',
                      color: isDarkMode ? '#f4faf8' : '#4b605b',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to sign out?')) {
                        logout();
                        navigate('/');
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PDF Reader Modal */}
      {activeReaderTextbook && (
        <PdfReaderModal
          isOpen={!!activeReaderTextbook}
          onClose={() => setActiveReaderTextbook(null)}
          textbook={activeReaderTextbook}
        />
      )}

      {/* 6. Simulation Viewer Modal */}
      {selectedSimPreview && (
        <SimulationViewerModal
          onClose={() => setSelectedSimPreview(null)}
          simulation={selectedSimPreview}
        />
      )}

      {/* 8. Knowledge Base Guideline Reader Modal */}
      {selectedKbArticle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div style={{ background: isDarkMode ? '#134744' : '#ffffff', borderRadius: '16px', padding: '28px', width: '700px', maxWidth: '94%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', background: isDarkMode ? '#0b3f3d' : '#e6f7f0', color: '#117a6b', padding: '3px 8px', borderRadius: '4px' }}>
                  {selectedKbArticle.categoryLabel}
                </span>
                <h3 style={{ fontSize: '19px', fontWeight: '900', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: '8px 0 2px 0' }}>
                  {selectedKbArticle.title}
                </h3>
                <div style={{ fontSize: '13px', color: '#117a6b', fontWeight: '700' }}>
                  {selectedKbArticle.titleNp}
                </div>
              </div>
              <button
                onClick={() => setSelectedKbArticle(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#5f736f' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: isDarkMode ? '#0e3e3b' : '#f4faf8', borderRadius: '10px', padding: '16px 20px', border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6', marginBottom: '20px', fontSize: '13px', lineHeight: 1.6, color: isDarkMode ? '#cfdcd8' : '#2f4f4c', whiteSpace: 'pre-line' }}>
              {selectedKbArticle.fullContent}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {selectedKbArticle.tags.map((t: string, idx: number) => (
                  <span key={idx} style={{ fontSize: '11px', background: isDarkMode ? '#2f4f4c' : '#ebf5f1', color: isDarkMode ? '#cfdcd8' : '#5f736f', padding: '3px 8px', borderRadius: '8px', fontWeight: '600' }}>
                    #{t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setSelectedKbArticle(null)}
                style={{ padding: '8px 20px', background: '#117a6b', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. CDC Chapter Progress Update Modal */}
      {isChapterProgressModalOpen && selectedChapterToEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div style={{ background: isDarkMode ? '#134744' : '#ffffff', borderRadius: '16px', padding: '26px', width: '500px', maxWidth: '94%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: isDarkMode ? '1px solid #2f4f4c' : '1px solid #dcebe6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: isDarkMode ? '#f4faf8' : '#0e3e3b', margin: 0 }}>
                Update Chapter Progress
              </h3>
              <button
                onClick={() => setIsChapterProgressModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#5f736f' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <strong style={{ fontSize: '14px', color: '#117a6b' }}>{selectedChapterToEdit.title}</strong>
              <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '2px' }}>{selectedChapterToEdit.obj}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#cfdcd8' : '#4b605b', display: 'block', marginBottom: '4px' }}>
                  Completion Percentage: {updatedProgressVal}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={updatedProgressVal}
                  onChange={(e) => setUpdatedProgressVal(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#cfdcd8' : '#4b605b', display: 'block', marginBottom: '4px' }}>
                  Status Badge
                </label>
                <select
                  defaultValue={updatedProgressVal === 100 ? 'COMPLETED' : updatedProgressVal > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDarkMode ? '1px solid #4b605b' : '1px solid #cfdcd8', background: isDarkMode ? '#0e3e3b' : '#ffffff', color: isDarkMode ? '#f4faf8' : '#0e3e3b', fontSize: '13px' }}
                >
                  <option value="COMPLETED">COMPLETED (100%)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="NOT_STARTED">NOT_STARTED (0%)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={async () => {
                  try {
                    await api.post('/teacher/syllabus', {
                      sectionId: selectedWorkspace?.section?.id || selectedWorkspace?.section?._id,
                      centralSubjectId: selectedWorkspace?.subject?.id || selectedWorkspace?.subject?._id,
                      chapterNumber: selectedChapterToEdit.ch,
                      chapterTitle: selectedChapterToEdit.title,
                      completionPercentage: updatedProgressVal,
                      teachingHoursSpent: selectedChapterToEdit.hours || 0,
                    });
                    setCdcChaptersData((prev: any) => ({
                      ...prev,
                      DEFAULT: (prev.DEFAULT || []).map((c: any) =>
                        c.ch === selectedChapterToEdit.ch
                          ? {
                              ...c,
                              progress: updatedProgressVal,
                              status: updatedProgressVal === 100 ? 'COMPLETED' : updatedProgressVal > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
                            }
                          : c
                      ),
                    }));
                    setIsChapterProgressModalOpen(false);
                  } catch (err: any) {
                    alert(err.message || 'Could not save chapter progress');
                  }
                }}
                style={{ padding: '8px 18px', background: '#117a6b', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
              >
                Save Progress
              </button>
              <button
                onClick={() => setIsChapterProgressModalOpen(false)}
                style={{ padding: '8px 16px', background: isDarkMode ? '#2f4f4c' : '#ebf5f1', color: isDarkMode ? '#cfdcd8' : '#4b605b', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
