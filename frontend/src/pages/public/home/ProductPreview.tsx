import React, { useRef, useState } from 'react';
import { MonitorPlay, LayoutDashboard, GraduationCap, ShieldCheck, Settings2, ArrowRight, LayoutGrid, Users, BookOpen, CalendarDays, BarChart3, ClipboardList, FileQuestion, Sparkles, Library, Upload, PenLine, Search, Bell, Menu, Building2, ChevronRight, Shapes } from 'lucide-react';
import { Reveal, useHome } from './hooks';
import { BrandMark } from './visuals';

type Key = 'board' | 'teacher' | 'student' | 'principal' | 'academic';
type NavItem = [string, React.ElementType];
interface Cfg {
  key: Key; label: string; icon: React.ElementType; url: string; user: string; nav: NavItem[];
  donut: { pct: number; title: string; sub: string; legend: [string, string, string] };
  chart: { title: string };
  section: { title: string; count: number };
  rooms: Array<{ title: string; meta: string; solid?: boolean }>;
  list: { title: string; sub: string; items: Array<[string, string]> };
  float: { pct: number; title: string; caption: string };
}
const CFG: Cfg[] = [
  { key: 'board', label: 'Smart Board', icon: MonitorPlay, url: 'smartboard', user: 'Sita', nav: [['Whiteboard', PenLine], ['Textbook', BookOpen], ['Simulations', Shapes], ['AI help', Sparkles], ['Export PDF', Upload], ['Timetable', CalendarDays]],
    donut: { pct: 71, title: 'Chapter covered', sub: 'Force and Motion · Class 10', legend: ['Taught', 'In progress', 'Not started'] }, chart: { title: 'Lessons this week' },
    section: { title: "Today's lessons", count: 5 }, rooms: [{ title: 'Force and Motion', meta: 'Class 10 · Science · Period 4' }, { title: 'Quadratic equations', meta: 'Class 9 · Mathematics' }, { title: 'Live lesson on the board', meta: 'Textbook + whiteboard split view', solid: true }],
    list: { title: 'Class roll', sub: 'Section A · 18 students', items: [['Aarav Sharma', 'Roll 1'], ['Binita Karki', 'Roll 2'], ['Rohan Thapa', 'Roll 3'], ['Sunita Rai', 'Roll 4'], ['Pooja Verma', 'Roll 5']] }, float: { pct: 62, title: 'Syllabus', caption: 'Chapters taught' } },
  { key: 'teacher', label: 'Teacher Dashboard', icon: LayoutDashboard, url: 'teacher', user: 'Sita', nav: [['Dashboard', LayoutGrid], ['My classes', Users], ['Timetable', CalendarDays], ['Smart Board', MonitorPlay], ['Assignments', ClipboardList], ['Quizzes', FileQuestion]],
    donut: { pct: 94, title: "Today's attendance", sub: '94% of 135 students present', legend: ['Present', 'Late', 'Absent'] }, chart: { title: 'Class attendance' },
    section: { title: 'My classes', count: 6 }, rooms: [{ title: 'Science · Class 10 A', meta: '32 students · 3 periods a week' }, { title: 'Mathematics · Class 9 B', meta: '30 students · 4 periods a week' }, { title: 'Assignment to grade', meta: '12 submissions waiting', solid: true }],
    list: { title: 'Follow up', sub: 'Students below 75% attendance', items: [['Bikram Thapa', 'Class 10 A'], ['Anita Gurung', 'Class 9 B'], ['Dipesh Rana', 'Class 10 A'], ['Kamala Bista', 'Class 9 B'], ['Suman Oli', 'Class 10 A']] }, float: { pct: 80, title: 'Marks', caption: 'Entered this term' } },
  { key: 'student', label: 'Student Dashboard', icon: GraduationCap, url: 'student', user: 'Aarav', nav: [['Dashboard', LayoutGrid], ['Subjects', BookOpen], ['Textbooks', Library], ['Assignments', ClipboardList], ['Quizzes', FileQuestion], ['Results', BarChart3]],
    donut: { pct: 62, title: 'Assignments done', sub: '62% of this month’s work', legend: ['Done', 'In progress', 'Overdue'] }, chart: { title: 'Study time' },
    section: { title: 'My subjects', count: 8 }, rooms: [{ title: 'Science & Technology', meta: 'Chapter 5 · page 42' }, { title: 'Compulsory Nepali', meta: 'Chapter 3 · quiz open' }, { title: 'Ask the AI about a topic', meta: 'Answers point to the textbook', solid: true }],
    list: { title: 'Upcoming', sub: 'Due this week', items: [['Science worksheet', 'Friday'], ['Maths exercise 4.2', 'Monday'], ['Nepali essay', 'Tuesday'], ['Chapter 5 quiz', 'Wednesday'], ['English reading', 'Thursday']] }, float: { pct: 96, title: 'Attendance', caption: 'This month' } },
  { key: 'principal', label: 'Principal Dashboard', icon: ShieldCheck, url: 'principal', user: 'Principal', nav: [['Dashboard', LayoutGrid], ['Students', GraduationCap], ['Teachers', Users], ['Classes', Building2], ['Timetable', CalendarDays], ['Results', BarChart3]],
    donut: { pct: 71, title: 'Syllabus coverage', sub: '71% of planned chapters taught', legend: ['Taught', 'In progress', 'Not started'] }, chart: { title: 'School attendance' },
    section: { title: 'Classes', count: 28 }, rooms: [{ title: 'Grade 10 · Section A', meta: 'Class teacher assigned' }, { title: 'Grade 8 · Section B', meta: 'Timetable published' }, { title: 'Marks awaiting approval', meta: '3 terminal papers', solid: true }],
    list: { title: 'Teachers', sub: 'You have 30 active teachers', items: [['Sita Gurung', 'Science'], ['Hari Adhikari', 'Mathematics'], ['Mina Tamang', 'English'], ['Gita Pokharel', 'Nepali'], ['Deepak Shah', 'Social Studies']] }, float: { pct: 96, title: 'Attendance', caption: 'School-wide' } },
  { key: 'academic', label: 'Academic Management', icon: Settings2, url: 'school-admin', user: 'Admin', nav: [['Dashboard', LayoutGrid], ['Enrollment', Users], ['Classes', Building2], ['Subjects', BookOpen], ['Timetable', CalendarDays], ['Bulk import', Upload]],
    donut: { pct: 100, title: 'Setup complete', sub: 'Classes 1–12 configured', legend: ['Done', 'In progress', 'Pending'] }, chart: { title: 'Enrollment by class' },
    section: { title: 'Sections', count: 28 }, rooms: [{ title: 'Class 10 · Section A', meta: '18 students · timetable set' }, { title: 'Class 11 · Science', meta: 'Subjects allocated' }, { title: 'CSV import ready', meta: 'Validated before saving', solid: true }],
    list: { title: 'Recent enrollments', sub: 'Added this week', items: [['Roshan Magar', 'Class 6 A'], ['Nisha Shrestha', 'Class 8 B'], ['Prakash Joshi', 'Class 3 A'], ['Laxmi Bhandari', 'Class 5 B'], ['Sagar Neupane', 'Class 9 A']] }, float: { pct: 100, title: 'Timetable', caption: 'Published' } },
];
const AV = ['#1fb589', '#0f4c4a', '#e5a93a', '#6c8f8a', '#2fcf9c'];

const Donut: React.FC<{ pct: number }> = ({ pct }) => {
  const r = 54, c = 2 * Math.PI * r;
  const done = (pct / 100) * c * 0.8, mid = c * 0.12, rest = c - done - mid;
  const seg = (len: number, off: number, col: string) => <circle cx="70" cy="70" r={r} fill="none" stroke={col} strokeWidth="14" strokeDasharray={`${Math.max(len, 0)} ${c}`} strokeDashoffset={-off} transform="rotate(-90 70 70)" strokeLinecap="butt" />;
  return (
    <svg viewBox="0 0 140 140" width="130" height="130" aria-hidden="true">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#eaf5f1" strokeWidth="14" />
      {seg(done, 0, '#1fb589')}{seg(mid, done, '#f1b434')}{seg(rest, done + mid, '#e5533d')}
      <text x="70" y="78" textAnchor="middle" fontSize="26" fontWeight="800" fill="#0e3e3b">{pct}%</text>
    </svg>
  );
};
const Ring: React.FC<{ pct: number; size?: number }> = ({ pct, size = 92 }) => {
  const r = 38, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e3f3ed" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#1fb589" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 50 50)" />
      <text x="50" y="56" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0e3e3b">{pct}%</text>
    </svg>
  );
};
const Lines: React.FC = () => (
  <svg viewBox="0 0 480 140" width="100%" height="140" preserveAspectRatio="none" aria-hidden="true">
    {[30, 70, 110].map((y) => <line key={y} x1="0" x2="480" y1={y} y2={y} stroke="#eef5f2" />)}
    <path d="M0 30 C70 52 120 74 190 66 C260 58 300 20 360 30 C420 40 450 52 480 74" fill="none" stroke="#4b5f5b" strokeWidth="1.6" />
    <path d="M0 52 C60 76 110 98 170 84 C240 68 280 22 350 22 C410 22 450 48 480 62" fill="none" stroke="#1fb589" strokeWidth="1.8" />
    <path d="M0 62 C60 86 120 106 180 100 C250 94 300 76 360 76 C420 76 450 92 480 102" fill="none" stroke="#9b6fd6" strokeWidth="1.6" />
    <line x1="300" x2="300" y1="22" y2="120" stroke="#1fb589" strokeDasharray="3 4" opacity=".6" />
    <rect x="276" y="4" width="48" height="18" rx="5" fill="#1fb589" /><text x="300" y="17" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">+27%</text>
    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => <text key={d} x={14 + i * 75} y="136" fontSize="10" fill="#8aa09b">{d}</text>)}
  </svg>
);

const Dashboard: React.FC<{ c: Cfg }> = ({ c }) => (
  <div className="dsh-frame">
    <div className="dsh">
      <aside className="dsh-side" aria-hidden="true">
        <div className="dsh-logo"><BrandMark size={32} /><div><small>Nepal</small><b>Digital Education</b></div></div>
        <nav>{c.nav.map(([label, Icon], i) => <span key={label} className={`dsh-nav ${i === 0 ? 'on' : ''}`}><Icon size={17} /> {label}</span>)}</nav>
      </aside>
      <div className="dsh-main">
        <div className="dsh-top"><Menu size={18} className="dsh-menu" /><span>Hello, <b>{c.user}!</b></span><span className="dsh-icons"><Search size={18} /><Sparkles size={18} /><span className="dsh-bell"><Bell size={18} /></span></span></div>
        <div className="dsh-cols">
          <div className="dsh-left">
            <div className="dsh-row2">
              <div className="dsh-card">
                <div className="dsh-donut"><Donut pct={c.donut.pct} /><div><h4>{c.donut.title}</h4><p>{c.donut.sub}</p>
                  <ul>{c.donut.legend.map((l, i) => <li key={l}><i style={{ background: ['#1fb589', '#f1b434', '#e5533d'][i] }} />{l}</li>)}</ul></div></div>
              </div>
              <div className="dsh-card"><div className="dsh-cardhead"><h4>{c.chart.title}</h4><ChevronRight size={14} /></div><Lines /></div>
            </div>
            <div className="dsh-sechead"><h4>{c.section.title} <span className="dsh-count">{c.section.count}</span></h4><span>View All <ChevronRight size={13} /></span></div>
            <div className="dsh-row3">
              {c.rooms.map((r) => (
                <div key={r.title} className={`dsh-card dsh-room ${r.solid ? 'solid' : ''}`}>
                  <span className="dsh-room-ic"><Users size={16} /></span><h5>{r.title}</h5><p>{r.meta}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="dsh-right">
            <div className="dsh-cardhead"><div><h4>{c.list.title}</h4><p>{c.list.sub}</p></div><span className="dsh-plus">+</span></div>
            {c.list.items.map(([n, s], i) => (
              <div key={n} className="dsh-person"><span className="dsh-av" style={{ background: AV[i % AV.length] }}>{n.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span><div><b>{n}</b><small>{s}</small></div><span className={`dsh-mail ${i === 1 ? 'on' : ''}`}>✉</span></div>
            ))}
            <div className="dsh-more">View More</div>
          </div>
        </div>
      </div>
    </div>
    <div className="dsh-float" aria-hidden="true"><div className="dsh-float-top"><span>‹</span><Sparkles size={14} /></div><div style={{ display: 'grid', placeItems: 'center' }}><Ring pct={c.float.pct} /></div><h6>{c.float.title}</h6><small>{c.float.caption}</small></div>
  </div>
);

export const ProductPreview: React.FC = () => {
  const h = useHome();
  const [tab, setTab] = useState<Key>('principal');
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const cur = CFG.find((c) => c.key === tab)!;
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = e.key === 'ArrowRight' ? (i + 1) % CFG.length : e.key === 'ArrowLeft' ? (i + CFG.length - 1) % CFG.length : -1;
    if (n >= 0) { e.preventDefault(); setTab(CFG[n].key); refs.current[n]?.focus(); }
  };
  return (
    <section id="platform-preview" className="nh-sec" aria-labelledby="pv-title">
      <div className="nh-wrap">
        <Reveal className="nh-head center"><span className="nh-eyebrow">Interactive preview</span><h2 id="pv-title" className="nh-h2">One Connected Ecosystem. Every Academic Operation.</h2><p className="nh-lead">Explore how school leadership, teachers and students work together through one integrated platform.</p></Reveal>
        <Reveal>
          <div className="nh-tabs" role="tablist" aria-label="Platform preview">
            {CFG.map((t, i) => <button key={t.key} ref={(el) => { refs.current[i] = el; }} role="tab" id={`pv-tab-${t.key}`} aria-selected={tab === t.key} aria-controls="pv-panel" tabIndex={tab === t.key ? 0 : -1} className="nh-tab" onClick={() => setTab(t.key)} onKeyDown={(e) => onKey(e, i)}><t.icon size={16} /> {t.label}</button>)}
          </div>
          <div key={tab} className="nh-pv-wrap" role="tabpanel" id="pv-panel" aria-labelledby={`pv-tab-${tab}`}><Dashboard c={cur} /></div>
          <p className="nh-note">Illustrative preview of the interface with sample names and figures. Open the live demo to use the real dashboards.</p>
          <div style={{ textAlign: 'center', marginTop: 16 }}><button type="button" className="nh-btn nh-btn-primary" onClick={h.openDemo}>Try it in the interactive demo <ArrowRight size={16} /></button></div>
        </Reveal>
      </div>
    </section>
  );
};
export default ProductPreview;
