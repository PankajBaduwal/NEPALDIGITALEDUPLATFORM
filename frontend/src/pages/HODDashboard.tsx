import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  Users,
  GraduationCap,
  Inbox,
  BookOpen,
  Calendar,
  UserCheck,
  BarChart3,
  Megaphone,
  ShieldCheck,
  RefreshCw,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Eye,
  FileSpreadsheet,
  Award,
  Layers,
  Filter,
  ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { KprietDashboardLayout, HOD_NAV } from '@/layouts/KprietDashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/States';

export const HODDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [loading, setLoading] = useState(true);
  const [departmentInfo, setDepartmentInfo] = useState<any>({
    name: 'Secondary & Higher Secondary Education',
    code: 'SEC-HSE',
    headName: user?.fullName || 'HOD User',
    officialEmail: user?.email || 'hod.secondary@dhambojhi.edu.np',
  });

  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [allocationsList, setAllocationsList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('ALL');

  useEffect(() => {
    loadDepartmentData();
  }, []);

  const loadDepartmentData = async () => {
    setLoading(true);
    try {
      const [teachersRes, classesRes, allocationsRes, subjectsRes, studentsRes] = await Promise.all([
        api.get('/school-admin/teachers').catch(() => ({ data: [] })),
        api.get('/school-admin/classes').catch(() => ({ data: [] })),
        api.get('/school-admin/allocations').catch(() => ({ data: [] })),
        api.get('/school-admin/subjects').catch(() => ({ data: [] })),
        api.get('/school-admin/students').catch(() => ({ data: [] })),
      ]);

      // api.get already returns the unwrapped payload; accept either an array or an object holding the array
      const pick = (r: any, key: string): any[] => (Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : r?.[key] || r?.data?.[key] || []);
      const teachers = pick(teachersRes, 'teachers');
      const classes = pick(classesRes, 'classes');
      const allocations = pick(allocationsRes, 'allocations');
      const subjects = pick(subjectsRes, 'subjects');
      const students = pick(studentsRes, 'students');

      setFacultyList(teachers);
      setClassesList(classes);
      setAllocationsList(allocations);
      setSubjectsList(subjects);
      setStudentsList(students);

      // Demo announcements and audit logs
      setAnnouncements([
        {
          id: '1',
          title: 'Department Faculty Meeting for Model Questions',
          content: 'All faculty members are requested to submit the 1st Term Model Question papers by Friday.',
          author: user?.fullName || 'HOD',
          date: new Date().toISOString(),
          category: 'Academic',
        },
        {
          id: '2',
          title: 'CDC Textbook Verification for Grade 11 & 12',
          content: 'New CDC curriculum alignment for Science & Management stream is now effective.',
          author: 'Curriculum Coordinator',
          date: new Date(Date.now() - 86400000).toISOString(),
          category: 'Curriculum',
        },
      ]);

      setAuditLogs([
        {
          id: 'a1',
          action: 'Subject Allocation Updated',
          details: 'Allocated Compulsory Mathematics to Teacher IT for Class 10 Sec A',
          timestamp: new Date().toISOString(),
          user: user?.fullName || 'HOD',
        },
        {
          id: 'a2',
          action: 'Attendance Threshold Verified',
          details: 'Verified Grade 9 & 10 attendance records for the month of Baisakh',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          user: user?.fullName || 'HOD',
        },
      ]);
    } catch (err) {
      console.error('Failed to load HOD department data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const filteredFaculty = useMemo(() => {
    if (!searchQuery) return facultyList;
    const q = searchQuery.toLowerCase();
    return facultyList.filter(
      (f) =>
        f.fullName?.toLowerCase().includes(q) ||
        f.username?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q)
    );
  }, [facultyList, searchQuery]);

  const filteredStudents = useMemo(() => {
    return studentsList.filter((s) => {
      const matchSearch =
        !searchQuery ||
        s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass =
        classFilter === 'ALL' ||
        s.sectionId?.classId?.gradeNumber?.toString() === classFilter ||
        s.classNumber?.toString() === classFilter;
      return matchSearch && matchClass;
    });
  }, [studentsList, searchQuery, classFilter]);

  if (loading) {
    return (
      <KprietDashboardLayout activeTab={currentTab} onTabChange={handleTabChange} overrideNavGroups={HOD_NAV}>
        <LoadingState title="Loading Department Workspace..." />
      </KprietDashboardLayout>
    );
  }

  return (
    <KprietDashboardLayout activeTab={currentTab} onTabChange={handleTabChange} overrideNavGroups={HOD_NAV}>
      {/* ─── 1. DEPARTMENT PROFILE HEADER (KPRIET CLONE) ─── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              <Building2 className="size-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-bold">
                  Department Leadership Portal
                </span>
                <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                  Active Department
                </span>
                <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs font-bold font-mono">
                  Code: {departmentInfo.code}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {departmentInfo.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Head of Department: <strong className="text-slate-800">{user?.fullName || departmentInfo.headName}</strong> · Official Email:{' '}
                <strong className="text-slate-800">{user?.email || departmentInfo.officialEmail}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={loadDepartmentData}>
              <RefreshCw className="size-3.5 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 2. TAB: OVERVIEW ─── */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Department Faculty"
              value={facultyList.length}
              hint="Active teaching staff"
              icon={<UserCheck className="size-5" />}
              status="healthy"
              onClick={() => handleTabChange('faculty')}
            />
            <StatCard
              label="Enrolled Students"
              value={studentsList.length}
              hint="Across secondary classes"
              icon={<GraduationCap className="size-5" />}
              status="healthy"
              onClick={() => handleTabChange('students')}
            />
            <StatCard
              label="CDC Subject Offerings"
              value={subjectsList.length}
              hint="Compulsory & optional"
              icon={<BookOpen className="size-5" />}
              status="info"
              onClick={() => handleTabChange('subjects')}
            />
            <StatCard
              label="Active Allocations"
              value={allocationsList.length}
              hint="Timetable assignments"
              icon={<ClipboardCheck className="size-5" />}
              status="healthy"
              onClick={() => handleTabChange('teacherAssignments')}
            />
          </div>

          {/* Department Faculty Overview & Workload */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Department Faculty & Workload Summary</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Faculty members assigned to department subjects</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleTabChange('faculty')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Faculty Name</th>
                      <th className="px-4 py-3">Username / Staff ID</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {facultyList.slice(0, 6).map((fac) => (
                      <tr key={fac.id || fac._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{fac.fullName}</td>
                        <td className="px-4 py-3 text-slate-600 font-mono">{fac.username}</td>
                        <td className="px-4 py-3 text-slate-500">{fac.email || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                            {fac.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleTabChange('teacherAssignments')}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                          >
                            Assignments →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Quick Actions & Recent Department Notices */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Department Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button
                    onClick={() => handleTabChange('teacherAssignments')}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">Manage Subject Allocations</div>
                      <div className="text-[10px] text-slate-500">Assign teachers to class sections</div>
                    </div>
                    <ArrowRight className="size-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleTabChange('timetable')}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">Department Timetable Matrix</div>
                      <div className="text-[10px] text-slate-500">Weekly periods & conflict detection</div>
                    </div>
                    <ArrowRight className="size-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleTabChange('analytics')}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">Academic Monitoring & Risk</div>
                      <div className="text-[10px] text-slate-500">Pass percentage & attendance flags</div>
                    </div>
                    <ArrowRight className="size-4 text-slate-400" />
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Department Announcements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{a.title}</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {a.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{a.content}</p>
                      <span className="text-[10px] text-slate-400 mt-2 block">By {a.author}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. TAB: FACULTY MANAGEMENT ─── */}
      {currentTab === 'faculty' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <div>
                <CardTitle>Faculty Management & Monitoring</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete directory of department teachers, contact profiles, and workload indicators
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search faculty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Faculty Member</th>
                  <th className="px-4 py-3">Staff ID / Username</th>
                  <th className="px-4 py-3">Official Email</th>
                  <th className="px-4 py-3">Assigned Subjects</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Workload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaculty.map((fac) => {
                  const assignedCount = allocationsList.filter(
                    (a) => a.teacherId?._id === fac._id || a.teacherId?.id === fac.id || a.teacherId === fac.id
                  ).length;

                  return (
                    <tr key={fac.id || fac._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{fac.fullName}</div>
                        <div className="text-[10px] text-slate-400">{fac.phone || 'Phone not set'}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{fac.username}</td>
                      <td className="px-4 py-3 text-slate-500">{fac.email || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800">{assignedCount} Sections</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                          {fac.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-1 font-bold">
                          {assignedCount * 5} Periods / Wk
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ─── 4. TAB: STUDENTS ROSTER ─── */}
      {currentTab === 'students' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <div>
                <CardTitle>Department Student Roster</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Enrolled students across secondary grades & sections</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ALL">All Grades</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white w-48"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Admission No.</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Class & Section</th>
                  <th className="px-4 py-3">Roll No.</th>
                  <th className="px-4 py-3">Guardian</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3 text-right">Academic Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.slice(0, 15).map((stu, idx) => (
                  <tr key={stu.id || stu._id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{stu.admissionNumber || `ADM-${idx + 101}`}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{stu.fullName || stu.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      Class {stu.sectionId?.classId?.gradeNumber ?? '—'} – {stu.sectionId?.name || '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">{stu.rollNumber || idx + 1}</td>
                    <td className="px-4 py-3 text-slate-500">{stu.guardianName || 'Guardian'}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-emerald-700">92%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                        GOOD STANDING
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ─── 5. TAB: SUBJECT ALLOCATIONS ─── */}
      {currentTab === 'teacherAssignments' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Subject Allocation Matrix</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Class Section offerings, assigned teachers, and medium of instruction
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Class & Section</th>
                  <th className="px-4 py-3">Subject Code & Title</th>
                  <th className="px-4 py-3">Assigned Faculty</th>
                  <th className="px-4 py-3">Medium</th>
                  <th className="px-4 py-3">Credit Hours</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocationsList.map((alloc, idx) => (
                  <tr key={alloc.id || alloc._id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      Class {alloc.sectionId?.classId?.gradeNumber ?? '—'} – {alloc.sectionId?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{alloc.centralSubjectId?.name || 'Subject'}</div>
                      <div className="text-[10px] font-mono text-slate-400">{alloc.centralSubjectId?.code || 'CDC-SUB'}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-800">
                      {alloc.teacherId?.fullName || alloc.teacherId?.name || 'Assigned Teacher'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                        {alloc.medium || alloc.sectionId?.medium || 'ENGLISH'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{alloc.periodsPerWeek ?? '—'} periods/wk</td>
                    <td className="px-4 py-3 text-right">
                      <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ─── 6. TAB: DEPARTMENT TIMETABLE ─── */}
      {currentTab === 'timetable' && (
        <Card>
          <CardHeader>
            <CardTitle>Department Master Timetable Matrix</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive schedule across Monday–Friday / Sunday–Friday for all department subjects
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <div key={day} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                    <h3 className="font-bold text-slate-800 text-sm">{day}</h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      6 Periods
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Period 1 (10:00 - 10:45)</span>
                        <p className="text-[11px] text-slate-500">Compulsory Math · Class 10 A</p>
                      </div>
                      <Badge variant="brand" size="sm">Teacher IT</Badge>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Period 2 (10:45 - 11:30)</span>
                        <p className="text-[11px] text-slate-500">Science & Tech · Class 9 B</p>
                      </div>
                      <Badge variant="brand" size="sm">Faculty</Badge>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Period 3 (11:45 - 12:30)</span>
                        <p className="text-[11px] text-slate-500">English · Class 10 B</p>
                      </div>
                      <Badge variant="brand" size="sm">Faculty</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── 7. TAB: ANALYTICS & MONITORING ─── */}
      {currentTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Average Attendance" value="94.2%" hint="Across all department classes" status="healthy" />
            <StatCard label="Term Exam Pass Rate" value="91.8%" hint="Target threshold: >= 85%" status="healthy" />
            <StatCard label="Students Requiring Attention" value="6" hint="Attendance < 75% or risk score > 50" status="attention" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subject Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Enrolled</th>
                    <th className="px-4 py-3">Avg Mark</th>
                    <th className="px-4 py-3">Pass % (40%+)</th>
                    <th className="px-4 py-3 text-right">Periods / week</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjectsList.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No subjects are allocated yet.</td></tr>
                  )}
                  {subjectsList.slice(0, 12).map((sub, idx) => (
                    <tr key={sub.id || sub._id || idx} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-bold text-slate-900">{sub.name}</td>
                      <td className="px-4 py-3 text-slate-600">{sub.gradeNumber ? `Grade ${sub.gradeNumber}` : '—'}</td>
                      <td className="px-4 py-3 font-bold">{sub.enrolled ?? '—'}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">{sub.avgPercent != null ? `${sub.avgPercent}%` : 'No marks yet'}</td>
                      <td className="px-4 py-3 font-bold">{sub.passPercent != null ? `${sub.passPercent}%` : '—'}</td>
                      <td className="px-4 py-3 text-right font-bold">{sub.periodsPerWeek ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── 8. TAB: ANNOUNCEMENTS & AUDIT ─── */}
      {(currentTab === 'announcements' || currentTab === 'audit') && (
        <Card>
          <CardHeader>
            <CardTitle>{currentTab === 'announcements' ? 'Department Announcements' : 'Department Audit Trail'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentTab === 'announcements'
              ? announcements.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{a.title}</h4>
                      <Badge variant="brand" size="sm">{a.category}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{a.content}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Posted by: {a.author}</span>
                      <span>{new Date(a.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              : auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{log.action}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{log.details}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Initiated by {log.user}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
          </CardContent>
        </Card>
      )}
    </KprietDashboardLayout>
  );
};
