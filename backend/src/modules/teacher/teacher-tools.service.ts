import {
  Section, StudentEnrollment, SubjectAllocation, StudentMark, AttendanceRecord, User, AcademicYear, TeachingDiaryEntry, TeachingPlan, StudentRemark,
} from '../../models';
import { TextbookChapter } from '../../models/CurriculumHierarchy';
import { assertTeacherTeachesSection } from '../../common/utils/teacher-scope.util';
import { TextbookAccessService, sectionMedium } from '../curriculum/textbook-access.service';
import { SmsService } from '../../common/services/sms.service';

const fail = (status: number, message: string, code: string) => ({ status, message, code });
const DAY = 86_400_000;
const isId = (v: any) => /^[a-f0-9]{24}$/i.test(String(v || ''));
const parseDate = (v: any): Date => {
  const d = new Date(v);
  if (isNaN(d.getTime())) throw fail(400, 'Choose a valid date.', 'INVALID_DATE');
  d.setHours(12, 0, 0, 0); // midday keeps the calendar day stable across time zones
  return d;
};

// ── Teaching diary & lesson planner ───────────────────────────────────────────────────────
export const TeachingDiaryService = {
  async list(userId: string, institutionId: string, q: any) {
    if (!isId(q.sectionId) || !isId(q.centralSubjectId)) throw fail(400, 'Choose a class and subject.', 'INVALID_INPUT');
    await assertTeacherTeachesSection(userId, institutionId, q.sectionId, q.centralSubjectId);
    const filter: any = { teacherId: userId, sectionId: q.sectionId, centralSubjectId: q.centralSubjectId };
    if (q.from || q.to) {
      filter.date = {};
      if (q.from) filter.date.$gte = parseDate(q.from);
      if (q.to) filter.date.$lte = parseDate(q.to);
    }
    return TeachingDiaryEntry.find(filter).sort({ date: -1, createdAt: -1 }).limit(400);
  },

  /** Textbook chapters when the system has them; otherwise the teacher's own outline for this class and subject. */
  async chapters(sectionId: string, subjectId: string, teacherId?: string) {
    const section: any = await Section.findById(sectionId);
    const resolved: any = await TextbookAccessService.digitalTextbookFor(subjectId, section ? sectionMedium(section) : null);
    const book = resolved?.textbook;
    const fromBook: any[] = book ? await TextbookChapter.find({ textbookId: book._id || book.id }).sort({ chapterNumber: 1 }).lean() : [];
    const textbook = book ? { id: String(book._id || book.id), title: book.title } : null;
    if (fromBook.length) return { textbook, source: 'TEXTBOOK' as const, chapters: fromBook.map((c: any) => ({ number: c.chapterNumber, title: c.title, unit: c.unitTitle })) };
    const plan: any = teacherId ? await TeachingPlan.findOne({ teacherId, sectionId, centralSubjectId: subjectId }).lean() : null;
    return { textbook, source: plan?.chapters?.length ? ('TEACHER_OUTLINE' as const) : ('NONE' as const), chapters: ((plan?.chapters || []) as any[]).map((c) => ({ number: c.number, title: c.title })) };
  },

  /** Save the teacher's own chapter list (one title per line becomes chapters 1..N). */
  async savePlan(userId: string, institutionId: string, body: any) {
    if (!isId(body.sectionId) || !isId(body.centralSubjectId)) throw fail(400, 'Choose a class and subject.', 'INVALID_INPUT');
    await assertTeacherTeachesSection(userId, institutionId, body.sectionId, body.centralSubjectId);
    const titles = (Array.isArray(body.titles) ? body.titles : []).map((t: any) => String(t).trim().slice(0, 200)).filter(Boolean).slice(0, 60);
    if (!titles.length) throw fail(400, 'Add at least one chapter title.', 'INVALID_INPUT');
    const chapters = titles.map((title: string, i: number) => ({ number: i + 1, title }));
    await TeachingPlan.updateOne({ teacherId: userId, sectionId: body.sectionId, centralSubjectId: body.centralSubjectId }, { $set: { institutionId, chapters } }, { upsert: true });
    return { chapters };
  },

  async create(userId: string, institutionId: string, body: any) {
    if (!isId(body.sectionId) || !isId(body.centralSubjectId)) throw fail(400, 'Choose a class and subject.', 'INVALID_INPUT');
    await assertTeacherTeachesSection(userId, institutionId, body.sectionId, body.centralSubjectId);
    const topic = String(body.topic || '').trim();
    if (!topic) throw fail(400, 'Write the topic you teach or plan to teach.', 'INVALID_INPUT');
    const date = parseDate(body.date || new Date());
    if (date.getTime() - Date.now() > 400 * DAY) throw fail(400, 'That date is too far ahead.', 'INVALID_DATE');
    const status = ['PLANNED', 'TAUGHT', 'SKIPPED'].includes(body.status) ? body.status : date.getTime() <= Date.now() ? 'TAUGHT' : 'PLANNED';
    const chapterNumber = Number.isInteger(Number(body.chapterNumber)) && Number(body.chapterNumber) > 0 ? Number(body.chapterNumber) : undefined;
    let chapterTitle = String(body.chapterTitle || '').slice(0, 300);
    if (chapterNumber && !chapterTitle) {
      const { chapters } = await this.chapters(body.sectionId, body.centralSubjectId, userId);
      chapterTitle = chapters.find((c) => c.number === chapterNumber)?.title || '';
    }
    return TeachingDiaryEntry.create({
      institutionId, teacherId: userId, sectionId: body.sectionId, centralSubjectId: body.centralSubjectId, date,
      periodNumber: Number.isInteger(Number(body.periodNumber)) ? Number(body.periodNumber) : undefined,
      chapterNumber, chapterTitle, topic: topic.slice(0, 300),
      objective: String(body.objective || '').slice(0, 1500), activities: String(body.activities || '').slice(0, 2000), homework: String(body.homework || '').slice(0, 1000), status,
    });
  },

  async update(userId: string, id: string, body: any) {
    const e: any = isId(id) ? await TeachingDiaryEntry.findOne({ _id: id, teacherId: userId }) : null;
    if (!e) throw fail(404, 'Diary entry not found.', 'NOT_FOUND');
    if (body.topic !== undefined) {
      const t = String(body.topic).trim();
      if (!t) throw fail(400, 'The topic cannot be empty.', 'INVALID_INPUT');
      e.topic = t.slice(0, 300);
    }
    if (body.date) e.date = parseDate(body.date);
    for (const k of ['objective', 'activities', 'homework', 'chapterTitle'] as const) if (body[k] !== undefined) e[k] = String(body[k]).slice(0, 2000);
    if (body.chapterNumber !== undefined) e.chapterNumber = Number(body.chapterNumber) > 0 ? Number(body.chapterNumber) : undefined;
    if (body.periodNumber !== undefined) e.periodNumber = Number(body.periodNumber) > 0 ? Number(body.periodNumber) : undefined;
    if (['PLANNED', 'TAUGHT', 'SKIPPED'].includes(body.status)) e.status = body.status;
    await e.save();
    return e;
  },

  async remove(userId: string, id: string) {
    const r = isId(id) ? await TeachingDiaryEntry.deleteOne({ _id: id, teacherId: userId }) : { deletedCount: 0 };
    if (!r.deletedCount) throw fail(404, 'Diary entry not found.', 'NOT_FOUND');
    return { id };
  },

  /** Chapters covered so far against how much of the academic year has passed. */
  async progress(userId: string, institutionId: string, sectionId: string, subjectId: string) {
    if (!isId(sectionId) || !isId(subjectId)) throw fail(400, 'Choose a class and subject.', 'INVALID_INPUT');
    await assertTeacherTeachesSection(userId, institutionId, sectionId, subjectId);
    const [{ textbook, chapters, source }, entries, section]: [any, any[], any] = await Promise.all([
      this.chapters(sectionId, subjectId, userId),
      TeachingDiaryEntry.find({ teacherId: userId, sectionId, centralSubjectId: subjectId }).lean() as any,
      Section.findById(sectionId).lean(),
    ]);
    const taught = new Set(entries.filter((e) => e.status === 'TAUGHT' && e.chapterNumber).map((e) => e.chapterNumber));
    const planned = new Set(entries.filter((e) => e.status === 'PLANNED' && e.chapterNumber).map((e) => e.chapterNumber));
    const percent = chapters.length ? Math.round((taught.size / chapters.length) * 100) : null;
    const year: any = section?.academicYearId ? await AcademicYear.findById(section.academicYearId).lean() : null;
    let yearElapsed: number | null = null;
    if (year?.startDate && year?.endDate) {
      const s = new Date(year.startDate).getTime(), e = new Date(year.endDate).getTime();
      if (e > s) yearElapsed = Math.max(0, Math.min(100, Math.round(((Date.now() - s) / (e - s)) * 100)));
    }
    let pace: 'AHEAD' | 'ON_TRACK' | 'BEHIND' | 'UNKNOWN' = 'UNKNOWN';
    if (percent !== null && yearElapsed !== null) pace = percent - yearElapsed >= 10 ? 'AHEAD' : percent - yearElapsed <= -15 ? 'BEHIND' : 'ON_TRACK';
    const last = entries.filter((e) => e.status === 'TAUGHT').sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
    return {
      textbook, chapterSource: source, totalChapters: chapters.length, chaptersTaught: taught.size, percent, yearElapsedPercent: yearElapsed, pace,
      lastTaughtAt: last?.date || null,
      chapters: chapters.map((c: any) => ({ ...c, status: taught.has(c.number) ? 'TAUGHT' : planned.has(c.number) ? 'PLANNED' : 'NOT_STARTED' })),
    };
  },
};

// ── Student dossier ───────────────────────────────────────────────────────────────────────
export const StudentDossierService = {
  async dossier(userId: string, institutionId: string, studentId: string, sectionIdHint?: string) {
    if (!isId(studentId)) throw fail(400, 'Choose a student.', 'INVALID_INPUT');
    const enrFilter: any = { studentId, status: 'ENROLLED' };
    if (sectionIdHint && isId(sectionIdHint)) enrFilter.sectionId = sectionIdHint;
    const enrollment: any = await StudentEnrollment.findOne(enrFilter).populate({ path: 'sectionId', populate: { path: 'classId' } }).sort({ createdAt: -1 });
    const section: any = enrollment?.sectionId;
    if (!enrollment || !section || String(section.classId?.institutionId) !== String(institutionId)) throw fail(404, 'Student not found in your school.', 'NOT_FOUND');

    const isClassTeacher = String(section.classTeacherId || '') === String(userId);
    const mine: any[] = await SubjectAllocation.find({ sectionId: section._id, teacherId: userId, status: { $ne: 'INACTIVE' } }).lean();
    if (!isClassTeacher && !mine.length) throw fail(403, 'You do not teach this student.', 'NOT_ALLOCATED');
    const mySubjects = new Set(mine.map((a) => String(a.centralSubjectId)));

    const student: any = await User.findById(studentId, 'fullName fullNameNepali username status').lean();

    // attendance (class level, every period recorded for the student)
    const recs: any[] = await AttendanceRecord.find({ sectionId: section._id, 'records.studentId': studentId }, 'date records').lean();
    const counts: any = { PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0, EXCUSED: 0 };
    const monthAgo = Date.now() - 30 * DAY;
    const last30: any = { attended: 0, total: 0 };
    const absentDays = new Set<string>();
    for (const r of recs) {
      const mineRow = (r.records || []).find((x: any) => String(x.studentId) === String(studentId));
      if (!mineRow) continue;
      counts[mineRow.status] = (counts[mineRow.status] || 0) + 1;
      const attended = mineRow.status === 'PRESENT' || mineRow.status === 'LATE';
      if (+new Date(r.date) >= monthAgo) { last30.total++; if (attended) last30.attended++; }
      if (mineRow.status === 'ABSENT') absentDays.add(new Date(r.date).toISOString().slice(0, 10));
    }
    const total = Object.values(counts).reduce((a: number, b: any) => a + b, 0) as number;
    const attendance = {
      rate: total ? Math.round(((counts.PRESENT + counts.LATE) / total) * 100) : null,
      last30Rate: last30.total ? Math.round((last30.attended / last30.total) * 100) : null,
      present: counts.PRESENT, absent: counts.ABSENT, late: counts.LATE, onLeave: counts.LEAVE + counts.EXCUSED, recordedPeriods: total,
      recentAbsences: [...absentDays].sort().reverse().slice(0, 6),
    };

    // marks: a subject teacher sees their own subject(s); the class teacher sees all subjects
    const marks: any[] = await StudentMark.find({ studentId, sectionId: section._id }).populate({ path: 'assessmentId', select: 'name examType totalMarks centralSubjectId createdAt', populate: { path: 'centralSubjectId', select: 'name code' } }).lean();
    const visible = marks.filter((m) => m.assessmentId && (isClassTeacher || mySubjects.has(String(m.assessmentId.centralSubjectId?._id || m.assessmentId.centralSubjectId))));
    const rows = visible.map((m) => ({
      exam: m.assessmentId.name, examType: m.assessmentId.examType, subject: m.assessmentId.centralSubjectId?.name || 'Subject',
      obtained: m.isAbsent ? null : m.marksObtained, total: m.assessmentId.totalMarks, percent: m.isAbsent ? null : Math.round(m.percentage || 0),
      grade: m.isAbsent ? 'AB' : m.grade, gpa: m.gpa, absent: !!m.isAbsent, date: m.assessmentId.createdAt,
    })).sort((a, b) => +new Date(b.date) - +new Date(a.date));
    const byExam = new Map<string, { n: number; pct: number; gpa: number; date: any }>();
    for (const r of rows.filter((x) => !x.absent)) {
      const cur = byExam.get(r.exam) || { n: 0, pct: 0, gpa: 0, date: r.date };
      cur.n++; cur.pct += r.percent || 0; cur.gpa += r.gpa || 0;
      if (+new Date(r.date) < +new Date(cur.date)) cur.date = r.date;
      byExam.set(r.exam, cur);
    }
    const trend = [...byExam.entries()].map(([exam, v]) => ({ exam, percent: Math.round(v.pct / v.n), gpa: Math.round((v.gpa / v.n) * 100) / 100, subjects: v.n, date: v.date })).sort((a, b) => +new Date(a.date) - +new Date(b.date));

    const remarkDocs: any[] = await StudentRemark.find({ studentId, sectionId: section._id }).sort({ createdAt: -1 }).limit(6).populate('teacherId', 'fullName').populate('centralSubjectId', 'name').lean();

    const phone = enrollment.guardianPhone as string | undefined;
    return {
      student: { id: String(studentId), name: student?.fullName, nameNepali: student?.fullNameNepali, username: student?.username },
      placement: { className: section.classId?.name || `Class ${section.classId?.gradeNumber}`, grade: section.classId?.gradeNumber, section: section.name, rollNumber: enrollment.rollNumber, admissionNumber: enrollment.admissionNumber, sectionId: String(section._id) },
      viewer: { isClassTeacher, subjects: isClassTeacher ? 'all' : mine.length },
      attendance, marks: rows.slice(0, 40), trend,
      guardian: {
        name: enrollment.guardianName || null, relation: enrollment.guardianRelation || null,
        // the class teacher gets the real number; subject teachers get a masked one and are pointed to the class teacher
        phone: isClassTeacher ? phone || null : null, phoneMasked: SmsService.mask(phone), phoneVisible: isClassTeacher,
      },
      remarks: remarkDocs.map((r) => ({ id: String(r._id), kind: r.kind, title: r.title, text: r.text, by: r.teacherId?.fullName, subject: r.centralSubjectId?.name || null, at: r.createdAt })),
    };
  },
};
