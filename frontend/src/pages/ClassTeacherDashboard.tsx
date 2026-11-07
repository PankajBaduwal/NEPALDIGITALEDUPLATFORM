import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  CalendarCheck,
  Trophy,
  FileSpreadsheet,
  BookOpen,
  CalendarClock,
  Megaphone,
  Printer,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { KprietDashboardLayout, CLASS_TEACHER_NAV } from '@/layouts/KprietDashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { ClassTeacherSectionPanel } from '@/components/academic/ClassTeacherSectionPanel';

export const ClassTeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'classOverview';

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sectionData, setSectionData] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('First Terminal Examination 2083');

  useEffect(() => {
    loadClassTeacherData();
  }, []);

  const loadClassTeacherData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const overviewRes = await api.get('/teacher/overview');
      const ctSec = overviewRes?.classTeacherSection;

      if (ctSec) {
        const secId = ctSec.id || ctSec._id;
        const secDetails = await api.get(`/class-teacher/section/${secId}/overview`);

        setSectionData({
          ...ctSec,
          ...(secDetails || {}),
        });

        const students = Array.isArray(secDetails?.students) ? secDetails.students : [];
        setRoster(students);
      } else {
        setSectionData(null);
        setRoster([]);
      }
    } catch (err) {
      console.error('Failed to load class teacher data:', err);
      setLoadError('Unable to load your class assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const filteredRoster = roster.filter(
    (s) =>
      !searchQuery ||
      (s.studentId?.fullName || s.fullName)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <KprietDashboardLayout activeTab={currentTab} onTabChange={handleTabChange} overrideNavGroups={CLASS_TEACHER_NAV}>
        <LoadingState title="Loading Class Supervisory Console..." />
      </KprietDashboardLayout>
    );
  }

  if (!sectionData) {
    return (
      <KprietDashboardLayout activeTab={currentTab} onTabChange={handleTabChange} overrideNavGroups={CLASS_TEACHER_NAV}>
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-lg font-bold text-slate-800">
              {loadError ? 'Could not load Class Teacher dashboard' : 'No class is assigned to you'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {loadError || 'Ask your institution administrator to assign you as the Class Teacher for a section.'}
            </p>
            {loadError && (
              <Button variant="secondary" size="sm" className="mt-4" onClick={loadClassTeacherData}>
                Try again
              </Button>
            )}
          </CardContent>
        </Card>
      </KprietDashboardLayout>
    );
  }

  const secId = sectionData.id || sectionData._id;
  const secName = `Class ${sectionData.classId?.gradeNumber || sectionData.gradeNumber || '—'} – ${sectionData.name || '—'}`;
  const studentCount = sectionData.studentsCount ?? roster.length;

  return (
    <KprietDashboardLayout activeTab={currentTab} onTabChange={handleTabChange} overrideNavGroups={CLASS_TEACHER_NAV}>
      {/* ─── 1. CLASS SUPERVISORY HEADER ─── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              <GraduationCap className="size-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                  Class Teacher Supervisory Console
                </span>
                <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-bold">
                  Academic Year {sectionData.academicYearId?.name || '—'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {secName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Class Teacher: <strong className="text-slate-800">{user?.fullName}</strong> · Total Enrolled:{' '}
                <strong className="text-slate-800">{studentCount} Students</strong> · Medium:{' '}
                <strong className="text-slate-800">{sectionData?.medium || 'ENGLISH / NEPALI'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={loadClassTeacherData}>
              <RefreshCw className="size-3.5 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 2. TAB: CLASS OVERVIEW ─── */}
      {currentTab === 'classOverview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Enrolled Students"
              value={studentCount}
              hint="Active in roster"
              icon={<Users className="size-5" />}
              status="healthy"
              onClick={() => handleTabChange('roster')}
            />
            <StatCard
              label="Today's Attendance"
              value={sectionData.averageAttendance || '—'}
              hint={sectionData.recentAttendance?.length ? 'Based on recorded attendance' : 'No attendance recorded'}
              icon={<CalendarCheck className="size-5" />}
              status="healthy"
              onClick={() => handleTabChange('classAttendance')}
            />
            <StatCard
              label="Term 1 Pass Rate"
              value="—"
              hint="No published result summary"
              icon={<Trophy className="size-5" />}
              status="healthy"
              onClick={() => handleTabChange('allSubjectMarks')}
            />
            <StatCard
              label="Report Cards Status"
              value="—"
              hint="Report card status unavailable"
              icon={<FileSpreadsheet className="size-5" />}
              status="info"
              onClick={() => handleTabChange('reportCards')}
            />
          </div>

          {/* Quick Deep Access Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Supervisory Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => handleTabChange('roster')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Users className="size-5 text-emerald-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Student Roll Call & Roster</div>
                      <div className="text-[10px] text-slate-500">Roll numbers, parent contacts, emergency info</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </button>

                <button
                  onClick={() => handleTabChange('allSubjectMarks')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="size-5 text-emerald-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Consolidated All-Subject Marks</div>
                      <div className="text-[10px] text-slate-500">View marks entered by all subject teachers</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </button>

                <button
                  onClick={() => handleTabChange('reportCards')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="size-5 text-emerald-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Terminal Report Cards & Publishing</div>
                      <div className="text-[10px] text-slate-500">Verify grades, print individual or bulk cards</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Class Attendance & Risk Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-900">Monthly Attendance Compliance</div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">Section average attendance is 96.1%</div>
                  </div>
                  <Badge variant="success" size="sm">Optimal</Badge>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-900">Students Requiring Academic Attention</div>
                    <div className="text-[10px] text-amber-700 mt-0.5">2 students below 80% attendance threshold</div>
                  </div>
                  <Badge variant="warning" size="sm">2 Flags</Badge>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-blue-900">CDC Textbooks Coverage</div>
                    <div className="text-[10px] text-blue-700 mt-0.5">6 of 6 subjects equipped with interactive labs</div>
                  </div>
                  <Badge variant="info" size="sm">100% Ready</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ─── 3. TAB: FULL STUDENT ROSTER ─── */}
      {currentTab === 'roster' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <div>
                <CardTitle>Class Student Roster ({secName})</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Official student register, roll numbers, and contact details</p>
              </div>
              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search roster..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white w-48"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Roll No.</th>
                  <th className="px-4 py-3">Admission No.</th>
                  <th className="px-4 py-3">Student Full Name</th>
                  <th className="px-4 py-3">Guardian Name</th>
                  <th className="px-4 py-3">Guardian Phone</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoster.map((stu: any, idx: number) => {
                  const student = stu.studentId || stu;
                  const roll = stu?.rollNumber ?? '—';
                  const name = student?.fullName || student?.name || '—';
                  const adm = stu?.admissionNumber || '—';
                  const guardian = stu?.guardianName || '—';
                  const phone = stu?.guardianPhone || '—';

                  return (
                    <tr key={stu.id || stu._id || student.id || student._id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">{roll}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-600">{adm}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{name}</td>
                      <td className="px-4 py-3 text-slate-600">{guardian}</td>
                      <td className="px-4 py-3 text-slate-500">{phone}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-500">—</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleTabChange('reportCards')}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          Report Card →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ─── 4. TABS: ALL-SUBJECT MARKS, REPORT CARDS & CONSOLIDATED RESULTS ─── */}
      {(currentTab === 'allSubjectMarks' || currentTab === 'reportCards' || currentTab === 'classAttendance') && (
        <ClassTeacherSectionPanel
          sectionId={secId}
          sectionName={secName}
          className={`Class ${sectionData?.gradeNumber || 10}`}
        />
      )}

      {/* ─── 5. TAB: ANNOUNCEMENTS ─── */}
      {currentTab === 'announcements' && (
        <Card>
          <CardHeader>
            <CardTitle>Class Announcements ({secName})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Parent-Teacher Conference Notice</h4>
                <Badge variant="brand" size="sm">Class Notice</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Parent-teacher meeting to discuss 1st Terminal examination results and student attendance will be held this Sunday at 11:00 AM.
              </p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                <span>Class Teacher: {user?.fullName}</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </KprietDashboardLayout>
  );
};
