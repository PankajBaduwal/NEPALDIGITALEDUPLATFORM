import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { BrandMark } from './visuals';
import { Reveal, useHome } from './hooks';

const FAQS: Array<[string, string]> = [
  ['Is the platform aligned with the Nepal CDC curriculum?', 'Subjects, textbooks and course structure are organized around the national curriculum framework from the Curriculum Development Centre (CDC) for Classes 1–12, in English and Nepali medium. The curriculum section above shows exactly what is in the library today; some titles may still be under review. This platform does not claim official government certification.'],
  ['How does the platform support rural and low-bandwidth schools?', 'Textbook PDFs are served with byte-range support so a page can open without downloading the whole book, screens are responsive on phones and tablets, and heavy visuals load on demand. An internet connection is still required: there is no offline mode yet.'],
  ['What is the difference between a Class Teacher and a Subject Teacher?', 'A Subject Teacher teaches assigned subjects: Smart Board lessons, assignments, quizzes and marks for those classes. A Class Teacher also supervises one section across all subjects: daily roll call, consolidated terminal marks, report cards, absence notices and class announcements.'],
  ['Can schools import existing student and teacher records?', 'Yes. School administrators can enroll people one by one or bulk import them from CSV or XLSX templates, with validation before anything is saved. Direct import from other government systems is not part of the platform today.'],
  ['How does textbook-grounded AI work?', 'AI answers are generated from the platform’s textbook library and point back to the source pages where possible, in English and Nepali. AI can still make mistakes, so teachers review AI-generated assignments and quizzes before anything is published to students.'],
  ['Can students submit handwritten assignments?', 'Yes. Students can upload a photo or PDF of handwritten work. Handwriting OCR helps read it, and the teacher reviews and confirms the evaluation.'],
  ['How are examinations and results managed?', 'Teachers enter marks per subject, class teachers consolidate them for the section, and the principal approves and publishes them. Results use the A+ to NG grading scale with grade points, and report cards are generated from approved marks.'],
  ['Can schools configure their own academic timetable?', 'Yes. Administrators set the working days and periods, build each section’s timetable with automatic clash checks for teachers and rooms, and publish it when it is ready.'],
];

export const Faq: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="nh-sec" aria-labelledby="faq-title">
      <div className="nh-wrap">
        <Reveal className="nh-head center"><span className="nh-eyebrow">FAQ</span><h2 id="faq-title" className="nh-h2">Frequently Asked Questions</h2><p className="nh-lead">Straight answers about how the platform works in an institution.</p></Reveal>
        <div className="nh-faq">
          {FAQS.map(([q, a], i) => (
            <Reveal key={q} i={i % 4}>
              <div className={`nh-faq-item ${open === i ? 'open' : ''}`}>
                <h3 style={{ margin: 0 }}><button type="button" className="nh-faq-q" aria-expanded={open === i} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(open === i ? null : i)}>{q}<ChevronDown size={18} /></button></h3>
                <div className="nh-faq-a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}><div><p>{a}</p></div></div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export const FinalCta: React.FC = () => {
  const h = useHome();
  return (
    <section id="register" className="nh-sec" style={{ paddingTop: 20 }} aria-labelledby="cta-title">
      <div className="nh-wrap">
        <Reveal>
          <div className="nh-cta">
            <span className="nh-chip" style={{ background: 'rgba(255,255,255,.12)', color: '#daf5ec', borderColor: 'rgba(255,255,255,.25)' }}><span aria-hidden="true">🇳🇵</span> For schools and colleges</span>
            <h2 id="cta-title" style={{ marginTop: 16 }}>Bring Your Institution into the Digital Education Era.</h2>
            <p>Modernize academic operations, classroom teaching and student learning with one connected digital platform.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28, position: 'relative' }}>
              <button type="button" className="nh-btn nh-btn-primary" onClick={h.register}>Register Your School <ArrowRight size={16} /></button>
              <button type="button" className="nh-btn nh-btn-ghost" onClick={h.openDemo}>Explore Interactive Demo</button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export const HomeFooter: React.FC = () => {
  const h = useHome();
  const L: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => <button type="button" className="fl" onClick={onClick}>{children}</button>;
  return (
    <footer className="nh-footer" id="footer">
      <div className="nh-wrap">
        <div className="nh-foot-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><BrandMark size={38} /><b style={{ color: '#fff', fontSize: 16 }}>Nepal Digital Education Platform</b></div>
            <p style={{ marginTop: 14, fontSize: 14, maxWidth: 320 }}>A connected digital platform for school leadership, teachers and students across Nepal, built around the CDC curriculum for Classes 1–12.</p>
            <p style={{ marginTop: 10, fontSize: 13 }}><span aria-hidden="true">🇳🇵</span> Made for Nepal</p>
          </div>
          <div><h4>Platform</h4><L onClick={() => h.go('platform-preview')}>Platform overview</L><L onClick={() => h.go('features')}>Features</L><L onClick={() => h.go('studios')}>Platform Studios</L><L onClick={h.openDemo}>Interactive Demo</L><L onClick={() => h.go('faq')}>FAQ</L></div>
          <div><h4>Role portals</h4><L onClick={() => h.launchRole('PRINCIPAL')}>Principal</L><L onClick={() => h.launchRole('SCHOOL_ADMIN')}>Admin</L><L onClick={() => h.launchRole('CLASS_TEACHER')}>Class Teacher</L><L onClick={() => h.launchRole('TEACHER')}>Teacher</L><L onClick={() => h.launchRole('STUDENT')}>Student</L><L onClick={() => h.login(true)}>Super Admin</L></div>
          <div><h4>CDC curriculum</h4>{([['primary', 'Primary (1–5)'], ['basic', 'Basic (6–8)'], ['secondary', 'Secondary (9–10)'], ['higher', 'Higher Secondary (11–12)']] as const).map(([k, t]) => <L key={k} onClick={() => { h.chooseLevel(k); h.go('curriculum'); }}>{t}</L>)}</div>
          <div><h4>Institutions</h4><L onClick={h.register}>Register School / College</L><L onClick={h.status}>Registration Status</L><L onClick={() => h.login()}>Login</L></div>
        </div>
        <div className="nh-foot-bottom"><span>© {new Date().getFullYear()} Nepal Digital Education Platform. All rights reserved.</span><span>Curriculum content follows the national syllabus framework; this site does not imply government endorsement.</span></div>
      </div>
    </footer>
  );
};
