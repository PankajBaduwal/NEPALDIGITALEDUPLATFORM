import React from 'react';
import { Check, ShieldAlert, School, UserCheck, Users, GraduationCap, Layers, LogIn, Play } from 'lucide-react';
import { Reveal, useHome } from './hooks';

type Role = Parameters<ReturnType<typeof useHome>['launchRole']>[0];
const ROLES: Array<{ id: string; role: Role; tag: string; title: string; icon: React.ElementType; desc: string; items: string[]; superAdmin?: boolean }> = [
  { id: 'role-principal', role: 'PRINCIPAL', tag: 'Academic leadership', title: 'Principal', icon: ShieldAlert, desc: 'See the whole institution at a glance and approve academic work.', items: ['Institution-wide oversight', 'Faculty workload', 'Academic performance', 'Attendance monitoring', 'Examination results', 'Academic approvals'] },
  { id: 'role-admin', role: 'SCHOOL_ADMIN', tag: 'Operations', title: 'School Administrator', icon: School, desc: 'Set up and run the school’s academic structure.', items: ['Teacher enrollment', 'Student enrollment', 'Bulk import', 'Class and section configuration', 'Timetable management', 'Feature access configuration'] },
  { id: 'role-class', role: 'CLASS_TEACHER', tag: 'Section supervisor', title: 'Class Teacher', icon: UserCheck, desc: 'Look after one section across all of its subjects.', items: ['Assigned class', 'Student profiles', 'Daily attendance', 'Class performance', 'Terminal marks', 'Report cards', 'Class announcements'] },
  { id: 'role-teacher', role: 'TEACHER', tag: 'Subject faculty', title: 'Subject Teacher', icon: Users, desc: 'Teach and assess the subjects you are assigned.', items: ['Assigned subjects', 'Subject workspace', 'Smart Board', 'Quiz and Assignment Studio', 'Learning resources', 'AI teaching assistant'] },
  { id: 'role-student', role: 'STUDENT', tag: 'Learners', title: 'Student Learning Center', icon: GraduationCap, desc: 'Study, practise and keep track of progress.', items: ['Digital textbooks', 'Notes and materials', 'AI learning assistant', 'Quizzes', 'Assignments', 'Attendance and results'] },
  { id: 'role-super', role: 'SUPER_ADMIN', tag: 'Platform authority', title: 'Super Admin / MoEST', icon: Layers, desc: 'Govern institutions, curriculum and the platform itself.', items: ['Institution approval', 'Institutional management', 'Curriculum management', 'Platform analytics', 'Subscription management', 'Security management'], superAdmin: true },
];

export const Roles: React.FC = () => {
  const h = useHome();
  return (
    <section id="portals" className="nh-sec nh-alt" aria-labelledby="roles-title">
      <div className="nh-wrap">
        <Reveal className="nh-head center"><span className="nh-eyebrow">Role portals</span><h2 id="roles-title" className="nh-h2">One Platform. Dedicated Dashboards for Every Stakeholder.</h2><p className="nh-lead">Everyone gets a workspace that matches their responsibilities, and nothing more.</p></Reveal>
        <div className="nh-grid nh-g3">
          {ROLES.map((r, i) => (
            <Reveal key={r.id} i={i % 3} id={r.id} style={{ scrollMarginTop: 90 }}>
              <article className="nh-card hover nh-role" style={{ height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><div className="nh-role-ic" aria-hidden="true"><r.icon size={22} /></div><div><span className="nh-chip">{r.tag}</span><h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{r.title}</h3></div></div>
                <p style={{ fontSize: 14 }}>{r.desc}</p>
                <ul>{r.items.map((t) => <li key={t}><Check size={14} />{t}</li>)}</ul>
                <div className="nh-role-cta">
                  <button type="button" className="nh-btn nh-btn-primary nh-btn-sm" disabled={h.launching === r.role} onClick={() => h.launchRole(r.role)}><Play size={13} /> {h.launching === r.role ? 'Opening…' : 'Launch Demo'}</button>
                  <button type="button" className="nh-btn nh-btn-ghost nh-btn-sm" onClick={() => h.login(r.superAdmin)}><LogIn size={13} /> {r.superAdmin ? 'MoEST Login' : 'Login'}</button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Roles;
