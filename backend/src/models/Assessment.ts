import mongoose, { Schema, Document } from 'mongoose';

// ══════════════════════════════════════════════════════════════════
// 1. ATTENDANCE RECORD & SESSION
// ══════════════════════════════════════════════════════════════════
export type AttendanceStatusType = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'EXCUSED';

export interface IAttendanceItem {
  studentId: mongoose.Types.ObjectId | string;
  status: AttendanceStatusType;
  remarks?: string;
}

export interface IAttendanceSession extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId?: mongoose.Types.ObjectId | string;
  classId?: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  centralSubjectId?: mongoose.Types.ObjectId | string;
  periodNumber?: number;
  date: Date;
  takenBy: mongoose.Types.ObjectId | string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  status: 'SUBMITTED' | 'LOCKED';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSessionSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', index: true },
    periodNumber: { type: Number, default: 1 },
    date: { type: Date, required: true, index: true },
    takenBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    totalStudents: { type: Number, required: true, default: 0 },
    presentCount: { type: Number, required: true, default: 0 },
    absentCount: { type: Number, required: true, default: 0 },
    lateCount: { type: Number, required: true, default: 0 },
    leaveCount: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['SUBMITTED', 'LOCKED'], default: 'SUBMITTED' },
    remarks: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.sectionId = ret.sectionId?.toString();
        if (ret.classId) ret.classId = ret.classId.toString();
        if (ret.centralSubjectId) ret.centralSubjectId = ret.centralSubjectId.toString();
        ret.takenBy = ret.takenBy?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
// Enforce unique session per section, subject, date, and period
AttendanceSessionSchema.index({ sectionId: 1, centralSubjectId: 1, date: 1, periodNumber: 1 });

export interface IAttendanceRecord extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId?: mongoose.Types.ObjectId | string;
  classId?: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  centralSubjectId?: mongoose.Types.ObjectId | string;
  periodNumber?: number;
  date: Date;
  sessionId?: mongoose.Types.ObjectId | string;
  recordedBy: mongoose.Types.ObjectId | string;
  // Supports both batch-item format and individual student format
  records: IAttendanceItem[];
  studentId?: mongoose.Types.ObjectId | string;
  status?: AttendanceStatusType;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', index: true },
    periodNumber: { type: Number, default: 1 },
    topic: { type: String, default: '' },
    date: { type: Date, required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'AttendanceSession', index: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    records: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'EXCUSED'], default: 'PRESENT' },
        remarks: { type: String },
      },
    ],
    studentId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'EXCUSED'] },
    remarks: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.sectionId = ret.sectionId?.toString();
        ret.recordedBy = ret.recordedBy?.toString();
        if (ret.studentId) ret.studentId = ret.studentId.toString();
        if (ret.centralSubjectId) ret.centralSubjectId = ret.centralSubjectId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
// Indices to prevent duplicate attendance records
AttendanceRecordSchema.index({ sectionId: 1, date: 1, periodNumber: 1 });
AttendanceRecordSchema.index({ sectionId: 1, centralSubjectId: 1, date: 1, periodNumber: 1 });

// ══════════════════════════════════════════════════════════════════
// 2. GRADING SCHEME
// ══════════════════════════════════════════════════════════════════
export interface IGradeInterval {
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'NG';
  minPercentage: number;
  maxPercentage: number;
  gpa: number;
  description: string;
}

export interface IGradingScheme extends Document {
  id: string;
  institutionId?: mongoose.Types.ObjectId | string;
  name: string;
  code: string;
  intervals: IGradeInterval[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GradingSchemeSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    intervals: [
      {
        grade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'NG'], required: true },
        minPercentage: { type: Number, required: true },
        maxPercentage: { type: Number, required: true },
        gpa: { type: Number, required: true },
        description: { type: String, required: true },
      },
    ],
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        if (ret.institutionId) ret.institutionId = ret.institutionId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
GradingSchemeSchema.index({ institutionId: 1, code: 1 }, { unique: true });

// ══════════════════════════════════════════════════════════════════
// 3. EXAMINATION
// ══════════════════════════════════════════════════════════════════
export type ExaminationType =
  | 'UNIT_TEST'
  | 'MONTHLY_TEST'
  | 'TERMINAL'
  | 'FINAL'
  | 'PRACTICAL'
  | 'INTERNAL_ASSESSMENT'
  | 'ASSIGNMENT'
  | 'CUSTOM';

export type ExaminationStatusType = 'SCHEDULED' | 'ONGOING' | 'EVALUATION' | 'PUBLISHED' | 'ARCHIVED';

export interface IExamination extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId: mongoose.Types.ObjectId | string;
  name: string;
  code: string;
  examType: ExaminationType;
  startDate: Date;
  endDate: Date;
  applicableGrades: number[];
  gradingSchemeId?: mongoose.Types.ObjectId | string;
  weightagePercentage: number;
  status: ExaminationStatusType;
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const ExaminationSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    examType: {
      type: String,
      enum: ['UNIT_TEST', 'MONTHLY_TEST', 'TERMINAL', 'FINAL', 'PRACTICAL', 'INTERNAL_ASSESSMENT', 'ASSIGNMENT', 'CUSTOM'],
      default: 'TERMINAL',
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    applicableGrades: { type: [Number], default: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    gradingSchemeId: { type: Schema.Types.ObjectId, ref: 'GradingScheme' },
    weightagePercentage: { type: Number, default: 100 },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ONGOING', 'EVALUATION', 'PUBLISHED', 'ARCHIVED'],
      default: 'SCHEDULED',
      index: true,
    },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.academicYearId = ret.academicYearId?.toString();
        if (ret.gradingSchemeId) ret.gradingSchemeId = ret.gradingSchemeId.toString();
        if (ret.publishedBy) ret.publishedBy = ret.publishedBy.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
ExaminationSchema.index({ institutionId: 1, academicYearId: 1, name: 1 }, { unique: true });

// ══════════════════════════════════════════════════════════════════
// 4. ASSESSMENT (Subject Exam Item)
// ══════════════════════════════════════════════════════════════════
export type MarksWorkflowStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'PUBLISHED';

export interface IExamAssessment extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId: mongoose.Types.ObjectId | string;
  examinationId?: mongoose.Types.ObjectId | string;
  classId?: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  centralSubjectId: mongoose.Types.ObjectId | string;
  assignedTeacherId?: mongoose.Types.ObjectId | string;
  name: string;
  examType: ExaminationType;
  fullMarksTheory: number;
  passMarksTheory: number;
  fullMarksPractical: number;
  passMarksPractical: number;
  totalMarks: number;
  passMarks: number;
  workflowStatus: MarksWorkflowStatus;
  submittedAt?: Date;
  submittedBy?: mongoose.Types.ObjectId | string;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId | string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId | string;
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: mongoose.Types.ObjectId | string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamAssessmentSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    examinationId: { type: Schema.Types.ObjectId, ref: 'Examination', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true, index: true },
    assignedTeacherId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true },
    examType: {
      type: String,
      enum: ['UNIT_TEST', 'MONTHLY_TEST', 'TERMINAL', 'FINAL', 'PRACTICAL', 'INTERNAL_ASSESSMENT', 'ASSIGNMENT', 'CUSTOM'],
      default: 'TERMINAL',
    },
    fullMarksTheory: { type: Number, default: 75 },
    passMarksTheory: { type: Number, default: 27 },
    fullMarksPractical: { type: Number, default: 25 },
    passMarksPractical: { type: Number, default: 10 },
    totalMarks: { type: Number, required: true, default: 100 },
    passMarks: { type: Number, required: true, default: 40 },
    workflowStatus: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'PUBLISHED'],
      default: 'DRAFT',
      index: true,
    },
    submittedAt: { type: Date },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.academicYearId = ret.academicYearId?.toString();
        if (ret.sectionId && ret.sectionId.name) {
          ret.section = ret.sectionId;
          ret.sectionId = ret.sectionId._id ? ret.sectionId._id.toString() : ret.sectionId.id;
        } else if (ret.sectionId) {
          ret.sectionId = ret.sectionId.toString();
        }

        if (ret.centralSubjectId && ret.centralSubjectId.name) {
          ret.subject = ret.centralSubjectId;
          ret.centralSubjectId = ret.centralSubjectId._id ? ret.centralSubjectId._id.toString() : ret.centralSubjectId.id;
        } else if (ret.centralSubjectId) {
          ret.centralSubjectId = ret.centralSubjectId.toString();
        }

        if (ret.examinationId && ret.examinationId.name) {
          ret.examination = ret.examinationId;
          ret.examinationId = ret.examinationId._id ? ret.examinationId._id.toString() : ret.examinationId.id;
        } else if (ret.examinationId) {
          ret.examinationId = ret.examinationId.toString();
        }

        if (ret.classId && ret.classId.name) {
          ret.class = ret.classId;
          ret.classId = ret.classId._id ? ret.classId._id.toString() : ret.classId.id;
        } else if (ret.classId) {
          ret.classId = ret.classId.toString();
        }

        if (ret.assignedTeacherId && (ret.assignedTeacherId.fullName || ret.assignedTeacherId.email)) {
          ret.teacher = ret.assignedTeacherId;
          ret.assignedTeacherId = ret.assignedTeacherId._id ? ret.assignedTeacherId._id.toString() : ret.assignedTeacherId.id;
        } else if (ret.assignedTeacherId) {
          ret.assignedTeacherId = ret.assignedTeacherId.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
// Enforce unique assessment per examination/section/subject
ExamAssessmentSchema.index({ examinationId: 1, sectionId: 1, centralSubjectId: 1 });
ExamAssessmentSchema.index({ sectionId: 1, centralSubjectId: 1, name: 1 });

// ══════════════════════════════════════════════════════════════════
// 5. STUDENT MARK
// ══════════════════════════════════════════════════════════════════
export interface IStudentMark extends Document {
  id: string;
  institutionId?: mongoose.Types.ObjectId | string;
  examinationId?: mongoose.Types.ObjectId | string;
  classId?: mongoose.Types.ObjectId | string;
  sectionId?: mongoose.Types.ObjectId | string;
  centralSubjectId?: mongoose.Types.ObjectId | string;
  assessmentId: mongoose.Types.ObjectId | string;
  studentId: mongoose.Types.ObjectId | string;
  marksTheory?: number;
  marksPractical?: number;
  marksObtained: number; // backward compatibility
  theoryMarks?: number;
  practicalMarks?: number;
  totalMarks?: number;
  percentage?: number;
  grade: string; // "A+", "A", "B+", "B", "C+", "C", "D", "NG"
  gpa: number; // 4.0, 3.6, etc.
  isAbsent: boolean;
  submittedBy: mongoose.Types.ObjectId | string;
  workflowStatus: MarksWorkflowStatus;
  remarks?: string;
  isVerifiedByClassTeacher: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentMarkSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    examinationId: { type: Schema.Types.ObjectId, ref: 'Examination', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'ExamAssessment', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    marksTheory: { type: Number, default: 0 },
    marksPractical: { type: Number, default: 0 },
    marksObtained: { type: Number, required: true, min: 0, default: 0 },
    theoryMarks: { type: Number, default: 0 },
    practicalMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, required: true, default: 'A' },
    gpa: { type: Number, required: true, default: 3.6 },
    isAbsent: { type: Boolean, default: false },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workflowStatus: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'PUBLISHED'],
      default: 'DRAFT',
      index: true,
    },
    remarks: { type: String },
    isVerifiedByClassTeacher: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.assessmentId = ret.assessmentId?.toString();
        if (ret.studentId && typeof ret.studentId === 'object') {
          const sid = ret.studentId._id || ret.studentId.id;
          if (sid) {
            ret.student = { ...ret.studentId, id: sid.toString() };
            ret.studentId = sid.toString();
          } else {
            ret.studentId = ret.studentId.toString();
          }
        } else if (ret.studentId) {
          ret.studentId = ret.studentId.toString();
        }
        ret.submittedBy = ret.submittedBy?.toString();
        if (ret.institutionId) ret.institutionId = ret.institutionId.toString();
        if (ret.examinationId) ret.examinationId = ret.examinationId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
// Enforce unique marks per assessment and student
StudentMarkSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });

// ══════════════════════════════════════════════════════════════════
// 6. MARKS AUDIT LOG (Change & Workflow History)
// ══════════════════════════════════════════════════════════════════
export interface IMarksAuditLog extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  assessmentId: mongoose.Types.ObjectId | string;
  markId?: mongoose.Types.ObjectId | string;
  studentId?: mongoose.Types.ObjectId | string;
  action: 'CREATE' | 'UPDATE' | 'SUBMIT' | 'REVIEW' | 'APPROVE' | 'PUBLISH' | 'ROLLBACK';
  previousValues?: any;
  newValues?: any;
  changedBy: mongoose.Types.ObjectId | string;
  userRole: string;
  reason?: string;
  timestamp: Date;
}

const MarksAuditLogSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'ExamAssessment', required: true, index: true },
    markId: { type: Schema.Types.ObjectId, ref: 'StudentMark', index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'SUBMIT', 'REVIEW', 'APPROVE', 'PUBLISH', 'ROLLBACK'],
      required: true,
      index: true,
    },
    previousValues: { type: Schema.Types.Mixed },
    newValues: { type: Schema.Types.Mixed },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userRole: { type: String, required: true },
    reason: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.assessmentId = ret.assessmentId?.toString();
        if (ret.markId) ret.markId = ret.markId.toString();
        if (ret.studentId) ret.studentId = ret.studentId.toString();
        ret.changedBy = ret.changedBy?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
MarksAuditLogSchema.index({ assessmentId: 1, timestamp: -1 });
MarksAuditLogSchema.index({ studentId: 1, timestamp: -1 });
MarksAuditLogSchema.index({ institutionId: 1, timestamp: -1 });

// ══════════════════════════════════════════════════════════════════
// 7. ASSIGNMENT / HOMEWORK
// ══════════════════════════════════════════════════════════════════
export interface IAssignmentQuestion {
  id: string;
  questionStatement: string;
  questionType: 'LONG_ANSWER' | 'SHORT_ANSWER' | 'NUMERICAL' | 'MCQ' | 'MULTIPLE_CORRECT' | 'FILL_BLANK' | 'CASE_STUDY' | 'PROGRAMMING' | 'PRACTICAL';
  marks: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  unit?: string | number;
  expectedAnswer?: string;
  evaluationCriteria?: string;
  rubricRef?: string;
  options?: Array<{ id: string; text: string }>;
}

export interface IAssignmentRubricCriterion {
  criterion: string;
  maxMarks: number;
  levels: Array<{ label: string; points: number; description: string }>;
}

export interface IAssignment extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  classId?: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  centralSubjectId: mongoose.Types.ObjectId | string;
  teacherId: mongoose.Types.ObjectId | string;
  title: string;
  description: string;
  medium?: 'ENGLISH' | 'NEPALI' | 'BOTH';
  chapterNumber?: number;
  topic?: string;
  unitTitle?: string;
  curriculumUnits?: Array<{ unitNumber: number; title: string; description?: string }>;
  instructions?: string;
  detailedInstructions?: string;
  submissionType?: 'ONLINE_TEXT' | 'FILE_UPLOAD' | 'BOTH';
  dueDate: Date;
  allowLateSubmission?: boolean;
  lateSubmissionPolicy?: 'ALLOW_WITH_PENALTY' | 'ALLOW_WITHOUT_PENALTY' | 'STRICTLY_REJECT';
  latePenaltyPercent?: number;
  maxScore?: number;
  attachments?: string[];
  attachedDocuments?: Array<{ name: string; size: number; url: string; mimeType?: string }>;
  questions?: IAssignmentQuestion[];
  submissionSettings?: {
    allowedFormats?: string[];
    maxFileSizeMB?: number;
    maxFiles?: number;
    allowResubmission?: boolean;
    allowEditBeforeDeadline?: boolean;
  };
  evaluationRules?: {
    partialMarking?: boolean;
    stepWiseMarking?: boolean;
    acceptedVariations?: string;
    unitsAndTolerances?: string;
    negativeMarking?: boolean;
  };
  copyDetectionSettings?: {
    enabled?: boolean;
    similarityThreshold?: number;
    checkStudentToStudent?: boolean;
  };
  autoCheckingSettings?: {
    enabled?: boolean;
    ocrHandwritingEnabled?: boolean;
    autoCheckObjective?: boolean;
    suggestMarksDescriptive?: boolean;
    confidenceThreshold?: number;
  };
  rubric?: IAssignmentRubricCriterion[];
  aiGenerationMetadata?: any;
  isAiGenerated?: boolean;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  publishedAt?: Date;
}

const AssignmentSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    medium: { type: String, enum: ['ENGLISH', 'NEPALI', 'BOTH'], default: 'BOTH' },
    chapterNumber: { type: Number },
    topic: { type: String },
    unitTitle: { type: String },
    curriculumUnits: { type: Schema.Types.Mixed, default: [] },
    instructions: { type: String },
    detailedInstructions: { type: String },
    submissionType: { type: String, enum: ['ONLINE_TEXT', 'FILE_UPLOAD', 'BOTH'], default: 'BOTH' },
    dueDate: { type: Date, required: true },
    allowLateSubmission: { type: Boolean, default: false },
    lateSubmissionPolicy: {
      type: String,
      enum: ['ALLOW_WITH_PENALTY', 'ALLOW_WITHOUT_PENALTY', 'STRICTLY_REJECT'],
      default: 'ALLOW_WITH_PENALTY',
    },
    latePenaltyPercent: { type: Number, default: 10 },
    maxScore: { type: Number, default: 100 },
    attachments: { type: [String], default: [] },
    attachedDocuments: {
      type: [{ name: String, size: Number, url: String, mimeType: String }],
      default: [],
    },
    questions: {
      type: [
        {
          id: String,
          questionStatement: String,
          questionType: { type: String, default: 'LONG_ANSWER' },
          marks: { type: Number, default: 5 },
          difficulty: { type: String, default: 'MEDIUM' },
          unit: Schema.Types.Mixed,
          expectedAnswer: String,
          evaluationCriteria: String,
          rubricRef: String,
          options: [{ id: String, text: String }],
        },
      ],
      default: [],
    },
    submissionSettings: {
      allowedFormats: { type: [String], default: ['PDF', 'DOCX', 'IMAGES', 'TEXT'] },
      maxFileSizeMB: { type: Number, default: 25 },
      maxFiles: { type: Number, default: 5 },
      allowResubmission: { type: Boolean, default: true },
      allowEditBeforeDeadline: { type: Boolean, default: true },
    },
    evaluationRules: {
      partialMarking: { type: Boolean, default: true },
      stepWiseMarking: { type: Boolean, default: true },
      acceptedVariations: { type: String, default: '' },
      unitsAndTolerances: { type: String, default: '' },
      negativeMarking: { type: Boolean, default: false },
    },
    copyDetectionSettings: {
      enabled: { type: Boolean, default: true },
      similarityThreshold: { type: Number, default: 25 },
      checkStudentToStudent: { type: Boolean, default: true },
    },
    autoCheckingSettings: {
      enabled: { type: Boolean, default: true },
      ocrHandwritingEnabled: { type: Boolean, default: true },
      autoCheckObjective: { type: Boolean, default: true },
      suggestMarksDescriptive: { type: Boolean, default: true },
      confidenceThreshold: { type: Number, default: 80 },
    },
    rubric: {
      type: [
        {
          criterion: String,
          maxMarks: Number,
          levels: [{ label: String, points: Number, description: String }],
        },
      ],
      default: [],
    },
    aiGenerationMetadata: { type: Schema.Types.Mixed },
    isAiGenerated: { type: Boolean, default: false },
    status: { type: String, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'ACTIVE', index: true },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        if (ret.classId) ret.classId = ret.classId?.toString();
        ret.sectionId = ret.sectionId?.toString();
        ret.centralSubjectId = ret.centralSubjectId?.toString();
        ret.teacherId = ret.teacherId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ══════════════════════════════════════════════════════════════════
// MODEL EXPORTS
// ══════════════════════════════════════════════════════════════════
export const AttendanceSession =
  mongoose.models.AttendanceSession ||
  mongoose.model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema, 'attendanceSessions');

export const AttendanceRecord =
  mongoose.models.AttendanceRecord ||
  mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema, 'attendanceRecords');

export const GradingScheme =
  mongoose.models.GradingScheme ||
  mongoose.model<IGradingScheme>('GradingScheme', GradingSchemeSchema, 'gradingSchemes');

export const Examination =
  mongoose.models.Examination ||
  mongoose.model<IExamination>('Examination', ExaminationSchema, 'examinations');

export const ExamAssessment =
  mongoose.models.ExamAssessment ||
  mongoose.model<IExamAssessment>('ExamAssessment', ExamAssessmentSchema, 'assessments');

export const Assessment = ExamAssessment;

export const StudentMark =
  mongoose.models.StudentMark ||
  mongoose.model<IStudentMark>('StudentMark', StudentMarkSchema, 'marks');

export const Mark = StudentMark;

export const MarksAuditLog =
  mongoose.models.MarksAuditLog ||
  mongoose.model<IMarksAuditLog>('MarksAuditLog', MarksAuditLogSchema, 'marksAuditLogs');

export const Assignment =
  mongoose.models.Assignment ||
  mongoose.model<IAssignment>('Assignment', AssignmentSchema, 'assignments');

// ══════════════════════════════════════════════════════════════════
// 8. ASSIGNMENT SUBMISSION (Student Work & Teacher Grading)
// ══════════════════════════════════════════════════════════════════
export interface IAssignmentSubmissionFile {
  name: string;
  size: number;
  url: string;
  mimeType?: string;
}

export interface IAssignmentSubmission extends Document {
  id: string;
  assignmentId: mongoose.Types.ObjectId | string;
  studentId: mongoose.Types.ObjectId | string;
  institutionId: mongoose.Types.ObjectId | string;
  content?: string;
  textAnswers?: string;
  fileUrl?: string;
  originalFilename?: string;
  fileSizeBytes?: number;
  submittedFiles?: IAssignmentSubmissionFile[];
  submittedAt: Date;
  isLate?: boolean;
  latePenaltyDeducted?: number;
  ocrExtractedText?: string;
  ocrCorrectedText?: string;
  similarityReport?: {
    scorePercent: number;
    matchedStudentId?: string;
    matchedStudentName?: string;
    matchedPassages?: string[];
    reportStatus: 'CLEAN' | 'FLAGGED' | 'REVIEWED';
  };
  autoCheckingResults?: {
    objectiveScore?: number;
    suggestedScore?: number;
    aiReasoning?: string;
    confidence?: number;
  };
  rubricScores?: Array<{
    criterion: string;
    score: number;
    feedback?: string;
  }>;
  status: 'SUBMITTED' | 'LATE' | 'UNDER_EVALUATION' | 'GRADED' | 'RESUBMITTED';
  marksObtained?: number;
  feedback?: string;
  gradedBy?: mongoose.Types.ObjectId | string;
  gradedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSubmissionSchema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    content: { type: String },
    textAnswers: { type: String },
    fileUrl: { type: String },
    originalFilename: { type: String },
    fileSizeBytes: { type: Number },
    submittedFiles: {
      type: [{ name: String, size: Number, url: String, mimeType: String }],
      default: [],
    },
    submittedAt: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },
    latePenaltyDeducted: { type: Number, default: 0 },
    ocrExtractedText: { type: String },
    ocrCorrectedText: { type: String },
    similarityReport: {
      scorePercent: { type: Number, default: 0 },
      matchedStudentId: { type: Schema.Types.ObjectId, ref: 'User' },
      matchedStudentName: { type: String },
      matchedPassages: { type: [String], default: [] },
      reportStatus: { type: String, enum: ['CLEAN', 'FLAGGED', 'REVIEWED'], default: 'CLEAN' },
    },
    autoCheckingResults: {
      objectiveScore: { type: Number },
      suggestedScore: { type: Number },
      aiReasoning: { type: String },
      confidence: { type: Number },
    },
    rubricScores: {
      type: [{ criterion: String, score: Number, feedback: String }],
      default: [],
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'LATE', 'UNDER_EVALUATION', 'GRADED', 'RESUBMITTED'],
      default: 'SUBMITTED',
      index: true,
    },
    marksObtained: { type: Number },
    feedback: { type: String },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    gradedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.assignmentId = ret.assignmentId?.toString();
        ret.studentId = ret.studentId?.toString();
        ret.institutionId = ret.institutionId?.toString();
        if (ret.gradedBy) ret.gradedBy = ret.gradedBy.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
AssignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const AssignmentSubmission =
  mongoose.models.AssignmentSubmission ||
  mongoose.model<IAssignmentSubmission>('AssignmentSubmission', AssignmentSubmissionSchema, 'assignmentSubmissions');
