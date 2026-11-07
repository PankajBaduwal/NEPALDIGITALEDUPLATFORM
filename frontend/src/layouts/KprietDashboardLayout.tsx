import React, { useState, useEffect, useRef, type ComponentType } from 'react';
import { NavLink, Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calculator,
  CreditCard,
  BarChart3,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  ClipboardList,
  FileSpreadsheet,
  ShieldHalf,
  FileText,
  FlaskConical,
  FolderOpen,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Layers,
  LogOut,
  Maximize2,
  Megaphone,
  Menu,
  MessageSquareText,
  Minimize2,
  MonitorPlay,
  Presentation,
  ScrollText,
  Settings,
  ShieldCheck,
  Table2,
  Target,
  TrendingUp,
  TriangleAlert,
  Trophy,
  UserRound,
  Users,
  Video,
  X,
  type LucideProps,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { cn } from '@/utils/cn';

type Icon = ComponentType<LucideProps>;

export interface NavEntry {
  label: string;
  tab?: string;
  to?: string;
  icon: Icon;
  badge?: string | number;
  isExternal?: boolean;
  roles?: string[];
}

export interface NavGroup {
  title: string;
  items: NavEntry[];
}

// ─── 1. TEACHER (FACULTY) NAVIGATION ───
export const TEACHER_NAV: NavGroup[] = [
  {
    title: 'Academic',
    items: [
      { label: 'Overview', tab: 'overview', icon: LayoutDashboard },
      { label: 'My Subjects', tab: 'mySubjects', icon: BookOpen },
      { label: 'Attendance', tab: 'attendance', icon: CalendarCheck },
      { label: 'Results', tab: 'results', icon: Trophy },
    ],
  },
  {
    title: 'Timetable',
    items: [
      { label: "Today's Schedule", tab: 'todaySchedule', icon: CalendarClock },
      { label: 'Weekly Timetable', tab: 'weeklyTimetable', icon: CalendarRange },
      { label: 'My Workload', tab: 'workload', icon: Gauge },
    ],
  },
  {
    title: 'Teaching Studio',
    items: [
      { label: 'Notes', tab: 'notes', icon: FileText },
      { label: 'Materials & CDC Textbooks', tab: 'materials', icon: FolderOpen },
      { label: 'Videos', tab: 'videos', icon: Video },
      { label: 'Presentations', tab: 'presentations', icon: Presentation },
      { label: 'Quiz Studio', tab: 'quizzes', icon: ClipboardList },
      { label: 'Assignment Studio', tab: 'assignments', icon: ScrollText },
    ],
  },
  {
    title: 'Insights & Mentoring',
    items: [
      { label: 'Academic Monitoring', tab: 'academicMonitoring', icon: Target },
      { label: 'Student Progress', tab: 'studentProgress', icon: Users },
      { label: 'Class Teacher Console', tab: 'classTeacher', icon: GraduationCap },
    ],
  },
  {
    title: 'Interactive Tools',
    items: [
      { label: 'Smart Board', to: '/smartboard/index.html', icon: MonitorPlay, isExternal: true },
      { label: 'Simulation Lab', tab: 'simulations', icon: FlaskConical },
      { label: 'Mathematics Workspace', tab: 'mathWorkspace', icon: Calculator },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Announcements', tab: 'announcements', icon: Megaphone },
    ],
  },
];

// ─── 2. HOD NAVIGATION ───
export const HOD_NAV: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Department Overview', tab: 'overview', icon: Building2 },
    ],
  },
  {
    title: 'Faculty & Students',
    items: [
      { label: 'Faculty Management', tab: 'faculty', icon: UserRound },
      { label: 'Students Roster', tab: 'students', icon: GraduationCap },
      { label: 'Enrollments', tab: 'enrollments', icon: Users },
    ],
  },
  {
    title: 'Academic Planning',
    items: [
      { label: 'Subjects & CDC Framework', tab: 'subjects', icon: BookOpen },
      { label: 'Subject Allocations', tab: 'teacherAssignments', icon: ClipboardCheck },
      { label: 'Department Timetable', tab: 'timetable', icon: Table2 },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Academic Monitoring', tab: 'monitoring', icon: Target },
      { label: 'Department Analytics', tab: 'analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Announcements', tab: 'announcements', icon: Megaphone },
      { label: 'Audit Logs', tab: 'audit', icon: ShieldCheck },
      { label: 'Smart Board', to: '/smartboard/index.html', icon: MonitorPlay, isExternal: true },
    ],
  },
];

// ─── 3. CLASS TEACHER NAVIGATION ───
export const CLASS_TEACHER_NAV: NavGroup[] = [
  {
    title: 'Class Supervisory',
    items: [
      { label: 'Class Overview', tab: 'classOverview', icon: LayoutDashboard },
      { label: 'Full Student Roster', tab: 'roster', icon: Users },
      { label: 'Consolidated Attendance', tab: 'classAttendance', icon: CalendarCheck },
      { label: 'All-Subject Marks', tab: 'allSubjectMarks', icon: Trophy },
      { label: 'Terminal Report Cards', tab: 'reportCards', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Teaching Workflow',
    items: [
      { label: 'My Subjects', tab: 'mySubjects', icon: BookOpen },
      { label: 'My Schedule', tab: 'todaySchedule', icon: CalendarClock },
      { label: 'Class Announcements', tab: 'announcements', icon: Megaphone },
      { label: 'Smart Board', to: '/smartboard/index.html', icon: MonitorPlay, isExternal: true },
    ],
  },
];

// ─── 4. PRINCIPAL NAVIGATION ───
export const PRINCIPAL_NAV: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Principal Dashboard', tab: 'overview', icon: Gauge },
    ],
  },
  {
    title: 'Institutional Oversight',
    items: [
      { label: 'Classes & Sections', tab: 'sections', icon: Layers },
      { label: 'Teachers & Workload', tab: 'teachers', icon: Users },
      { label: 'Consolidated Attendance', tab: 'attendance', icon: CalendarCheck },
      { label: 'Terminal Examinations', tab: 'examinations', icon: ClipboardCheck },
      { label: 'Result Approvals', tab: 'approvals', icon: Trophy },
    ],
  },
  {
    title: 'Insights & Timetables',
    items: [
      { label: 'Academic Risk Monitoring', tab: 'monitoring', icon: Target },
      { label: 'Institutional Timetables', tab: 'timetables', icon: Table2 },
      { label: 'Performance Analytics', tab: 'analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Institutional Notices', tab: 'announcements', icon: Megaphone },
      { label: 'Smart Board', to: '/smartboard/index.html', icon: MonitorPlay, isExternal: true },
    ],
  },
];

// ─── 5. SCHOOL ADMIN NAVIGATION ───
export const ADMIN_NAV: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'School Admin Console', tab: 'overview', icon: Gauge },
    ],
  },
  {
    title: 'Academic Structure',
    items: [
      { label: 'Academic Years', tab: 'academicYears', icon: CalendarRange },
      { label: 'Classes & Sections', tab: 'classes', icon: Layers },
      { label: 'Subject Offerings', tab: 'subjects', icon: BookOpen },
      { label: 'Subject Allocation', tab: 'allocations', icon: ClipboardCheck },
      { label: 'Class Teacher Assignment', tab: 'classTeachers', icon: UserRound },
    ],
  },
  {
    title: 'People Management',
    items: [
      { label: 'Teachers Directory', tab: 'teachers', icon: UserRound },
      { label: 'Students Roster', tab: 'students', icon: GraduationCap },
      { label: 'Bulk Import (Excel)', tab: 'bulkImport', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Timetable Engine',
    items: [
      { label: 'Timetable Center', tab: 'timetables', icon: Table2 },
      { label: 'Room & Period Rules', tab: 'timingSettings', icon: CalendarClock },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Institution Settings', tab: 'settings', icon: Settings },
      { label: 'Feature Access', tab: 'features', icon: ShieldHalf },
      { label: 'Audit Trail', tab: 'audit', icon: ShieldCheck },
    ],
  },
];

// ─── 6. SUPER ADMIN (PLATFORM) NAVIGATION ───
export const PLATFORM_NAV: NavGroup[] = [
  {
    title: 'Platform Control',
    items: [
      { label: 'Platform Dashboard', tab: 'overview', icon: Gauge },
      { label: 'Registered Institutions', tab: 'institutions', icon: Building2 },
      { label: 'School Approvals', tab: 'approvals', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Curriculum & Resources',
    items: [
      { label: 'Nepal CDC Curriculum', tab: 'curriculum', icon: BookOpen },
      { label: 'Central Textbook Library', tab: 'textbooks', icon: FolderOpen },
      { label: 'Simulations & Virtual Labs', tab: 'simulations', icon: FlaskConical },
    ],
  },
  {
    title: 'Subscriptions & Health',
    items: [
      { label: 'Subscription Packages', tab: 'subscriptions', icon: CreditCard },
      { label: 'System Analytics', tab: 'analytics', icon: BarChart3 },
      { label: 'Platform Audit', tab: 'audit', icon: ShieldCheck },
    ],
  },
];

// ─── 7. STUDENT NAVIGATION ───
export const STUDENT_NAV: NavGroup[] = [
  {
    title: 'Academic',
    items: [
      { label: 'Dashboard Overview', tab: 'overview', icon: LayoutDashboard },
      { label: 'My Subjects', tab: 'subjects', icon: BookOpen },
      { label: 'My Timetable', tab: 'timetable', icon: CalendarClock },
      { label: 'Attendance Record', tab: 'attendance', icon: CalendarCheck },
      { label: 'Terminal Results', tab: 'results', icon: Trophy },
      { label: 'Homework & Assignments', tab: 'assignments', icon: ScrollText },
      { label: 'Online Quizzes', tab: 'quizzes', icon: ClipboardList },
    ],
  },
  {
    title: 'Learning Hub',
    items: [
      { label: 'Study Notes', tab: 'notes', icon: FileText },
      { label: 'CDC Textbooks', tab: 'materials', icon: FolderOpen },
      { label: 'Video Lessons', tab: 'videos', icon: Video },
      { label: 'Presentations', tab: 'presentations', icon: Presentation },
    ],
  },
  {
    title: 'Growth & Insights',
    items: [
      { label: 'Academic Progress', tab: 'progress', icon: TrendingUp },
      { label: 'Academic AI Assistant', tab: 'aiDoubt', icon: MessageSquareText },
    ],
  },
  {
    title: 'Interactive Labs',
    items: [
      { label: 'Launch Smart Board', to: '/smartboard/index.html', icon: MonitorPlay, isExternal: true },
      { label: 'Simulation Player', tab: 'simulations', icon: FlaskConical },
      { label: 'Mathematics Workspace', tab: 'mathWorkspace', icon: Calculator },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'School Notices', tab: 'notices', icon: Megaphone },
    ],
  },
];

function roleLabel(role?: string) {
  switch (role) {
    case 'STUDENT': return 'Student';
    case 'TEACHER': return 'Faculty / Teacher';
    case 'HOD': return 'Head of Department';
    case 'CLASS_TEACHER': return 'Class Teacher';
    case 'PRINCIPAL': return 'Principal';
    case 'SCHOOL_ADMIN': return 'School Administrator';
    case 'COLLEGE_ADMIN': return 'College Administrator';
    case 'SUPER_ADMIN': return 'Platform Super Admin';
    default: return role || '';
  }
}

function initials(name?: string) {
  if (!name) return 'NP';
  const parts = name.replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'NP';
}

interface KprietDashboardLayoutProps {
  children?: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  overrideNavGroups?: NavGroup[];
}

export function KprietDashboardLayout({
  children,
  activeTab: controlledActiveTab,
  onTabChange,
  overrideNavGroups,
}: KprietDashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('np.sidebar') === 'collapsed';
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const currentTab = controlledActiveTab || searchParams.get('tab') || 'overview';

  useEffect(() => {
    localStorage.setItem('np.sidebar', sidebarCollapsed ? 'collapsed' : 'expanded');
  }, [sidebarCollapsed]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [profileOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Determine Nav according to user role
  let roleNav: NavGroup[] = [];
  if (overrideNavGroups) {
    roleNav = overrideNavGroups;
  } else if (user?.role === 'STUDENT') {
    roleNav = STUDENT_NAV;
  } else if (user?.role === 'TEACHER') {
    roleNav = TEACHER_NAV;
  } else if (user?.role === 'HOD') {
    roleNav = HOD_NAV;
  } else if (user?.role === 'PRINCIPAL') {
    roleNav = PRINCIPAL_NAV;
  } else if (user?.role === 'SCHOOL_ADMIN' || user?.role === 'COLLEGE_ADMIN') {
    roleNav = ADMIN_NAV;
  } else if (user?.role === 'SUPER_ADMIN') {
    roleNav = PLATFORM_NAV;
  } else {
    roleNav = TEACHER_NAV;
  }

  const handleTabClick = (item: NavEntry) => {
    if (item.tab) {
      if (onTabChange) {
        onTabChange(item.tab);
      } else {
        setSearchParams({ tab: item.tab });
      }
    } else if (item.to) {
      navigate(item.to);
    }
  };

  const isItemActive = (item: NavEntry) => {
    if (item.tab) {
      return currentTab.toLowerCase() === item.tab.toLowerCase();
    }
    if (item.to) {
      return location.pathname === item.to;
    }
    return false;
  };

  const activeEntry = roleNav
    .flatMap((g) => g.items.map((i) => ({ group: g.title, item: i })))
    .find((x) => isItemActive(x.item));

  const institutionName = (user as any)?.institution?.name || 'Dhambojhi Higher Secondary School';

  const renderItem = (item: NavEntry, compact: boolean) => {
    const active = isItemActive(item);
    const IconC = item.icon;

    const baseClass = cn(
      'group relative flex items-center gap-2.5 rounded-lg text-xs font-semibold transition-all duration-150 min-h-[38px] w-full text-left cursor-pointer',
      compact ? 'justify-center px-0' : 'px-3',
      active
        ? 'bg-emerald-50 text-emerald-800 shadow-[inset_0_0_0_1px_#a7f3d0]'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    );

    const content = (
      <>
        {active && (
          <span aria-hidden="true" className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-[#047857]" />
        )}
        <IconC
          className={cn(
            'size-4 shrink-0 transition-transform duration-150',
            active ? 'text-[#047857]' : 'text-slate-400 group-hover:scale-105 group-hover:text-slate-700'
          )}
          aria-hidden="true"
        />
        {!compact && <span className="truncate flex-1">{item.label}</span>}
        {!compact && item.isExternal && <span className="text-[10px] text-slate-400">↗</span>}
        {!compact && item.badge != null && (
          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
            {item.badge}
          </span>
        )}
      </>
    );

    if (item.isExternal) {
      return (
        <a
          href={item.to || '/smartboard'}
          target="_blank"
          rel="noopener noreferrer"
          title={compact ? item.label : undefined}
          className={baseClass}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        type="button"
        onClick={() => handleTabClick(item)}
        title={compact ? item.label : undefined}
        className={baseClass}
      >
        {content}
      </button>
    );
  };

  const renderNav = (compact: boolean) => (
    <div className="space-y-4 px-2">
      {roleNav.map((group) => {
        const closed = !compact && collapsedGroups[group.title];
        return (
          <div key={group.title}>
            {!compact ? (
              <button
                type="button"
                onClick={() => setCollapsedGroups((g) => ({ ...g, [group.title]: !g[group.title] }))}
                className="mb-1 flex min-h-7 w-full items-center justify-between rounded-md px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700"
              >
                <span>{group.title}</span>
                <ChevronDown className={cn('size-3.5 transition-transform', closed && '-rotate-90')} />
              </button>
            ) : (
              <div className="mx-auto my-2 h-px w-6 bg-slate-200" />
            )}
            {!closed && (
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.label}>{renderItem(item, compact)}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* ─── 1. TOP NAVIGATION BAR (KPRIET CLONE) ─── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="flex h-14 w-full items-center justify-between gap-3 px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            {/* Platform Brand */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-[#047857] flex items-center justify-center text-white font-black text-sm shadow-xs">
                NP
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-slate-900 tracking-tight text-sm">Nepal Digital Education</span>
                <span className="block text-[10px] text-slate-500 font-medium -mt-0.5">{institutionName}</span>
              </div>
            </Link>

            <span className="hidden h-5 w-px bg-slate-200 sm:block" />

            {/* Breadcrumb Context */}
            {activeEntry && (
              <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">{activeEntry.group}</span>
                <span className="text-slate-300">/</span>
                <span className="font-bold text-slate-800">{activeEntry.item.label}</span>
              </nav>
            )}
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href="/smartboard/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <MonitorPlay className="size-3.5 text-emerald-700" />
              <span>Smart Board</span>
            </a>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>

            <NotificationCenter />

            <span className="h-5 w-px bg-slate-200" />

            {/* User Profile Button */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="size-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {initials(user?.fullName)}
                </div>
                <div className="hidden xl:block text-xs">
                  <div className="font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                    {user?.fullName || 'Faculty User'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {roleLabel(user?.role)}
                  </div>
                </div>
                <ChevronDown className="size-3.5 text-slate-400 hidden xl:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.username}</p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold">
                      {roleLabel(user?.role)}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="size-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── 2. MAIN WORKSPACE CONTAINER WITH SIDEBAR ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={cn(
            'hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 shrink-0 z-30 select-none',
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}
        >
          <div className="flex-1 overflow-y-auto py-4">
            {renderNav(sidebarCollapsed)}
          </div>

          {/* Sidebar Collapse Toggle */}
          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronsRight className="size-4" />
              ) : (
                <>
                  <ChevronsLeft className="size-4" />
                  <span>Collapse Sidebar</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* MOBILE DRAWER OVERLAY */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative flex flex-col w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 py-4 overflow-y-auto">
              <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100 mb-3">
                <span className="font-bold text-slate-900 text-sm">Navigation Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderNav(false)}
              </div>
            </aside>
          </div>
        )}

        {/* ─── 3. PAGE CONTENT OUTLET ─── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

