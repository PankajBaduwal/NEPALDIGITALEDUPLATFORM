import mongoose, { Schema, Document } from 'mongoose';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CENTRALIZED FEATURE REGISTRY
 * ─────────────────────────────────────────────────────────────────────────────
 * All feature identifiers across Nepal Digital Education Platform.
 * Avoids hardcoding feature strings haphazardly across backend files.
 */
export enum FeatureKey {
  // Student Dashboard
  STUDENT_DASHBOARD = 'STUDENT_DASHBOARD',

  // Assignments & Homework
  ASSIGNMENTS = 'ASSIGNMENTS',
  ASSIGNMENTS_CREATION = 'ASSIGNMENTS_CREATION',
  ASSIGNMENTS_VISIBILITY = 'ASSIGNMENTS_VISIBILITY',
  ASSIGNMENTS_ONLINE_SUBMISSION = 'ASSIGNMENTS_ONLINE_SUBMISSION',
  ASSIGNMENTS_FILE_UPLOAD = 'ASSIGNMENTS_FILE_UPLOAD',
  ASSIGNMENTS_TEXT_SUBMISSION = 'ASSIGNMENTS_TEXT_SUBMISSION',
  ASSIGNMENTS_DEADLINES = 'ASSIGNMENTS_DEADLINES',
  ASSIGNMENTS_LATE_SUBMISSION = 'ASSIGNMENTS_LATE_SUBMISSION',
  ASSIGNMENTS_FEEDBACK = 'ASSIGNMENTS_FEEDBACK',

  // Quizzes & Practice Tests
  QUIZZES = 'QUIZZES',
  QUIZZES_TEACHER_CREATE = 'QUIZZES_TEACHER_CREATE',
  QUIZZES_ONLINE_ACCESS = 'QUIZZES_ONLINE_ACCESS',
  QUIZZES_TIMED = 'QUIZZES_TIMED',
  QUIZZES_PRACTICE = 'QUIZZES_PRACTICE',
  QUIZZES_GRADED = 'QUIZZES_GRADED',
  QUIZZES_RESULT_VISIBILITY = 'QUIZZES_RESULT_VISIBILITY',
  QUIZZES_ATTEMPT_LIMITS = 'QUIZZES_ATTEMPT_LIMITS',

  // Teacher-published learning resources
  NOTES = 'NOTES',
  MATERIALS = 'MATERIALS',
  PRESENTATIONS = 'PRESENTATIONS',
  VIDEOS = 'VIDEOS',

  // Smart Board & Interactive Whiteboard
  SMARTBOARD = 'SMARTBOARD',
  SMARTBOARD_WHITEBOARD = 'SMARTBOARD_WHITEBOARD',
  SMARTBOARD_AI = 'SMARTBOARD_AI',

  // Interactive Science & Math Simulations
  SIMULATIONS = 'SIMULATIONS',
  SIMULATIONS_STUDENT_ACCESS = 'SIMULATIONS_STUDENT_ACCESS',
  SIMULATIONS_TEACHER_ONLY = 'SIMULATIONS_TEACHER_ONLY',
  SIMULATIONS_SMARTBOARD = 'SIMULATIONS_SMARTBOARD',

  // AI Educational Assistant & RAG
  AI_ASSISTANT = 'AI_ASSISTANT',
  AI_STUDENT_ACCESS = 'AI_STUDENT_ACCESS',
  AI_TEACHER_ACCESS = 'AI_TEACHER_ACCESS',
  AI_SMARTBOARD_ACCESS = 'AI_SMARTBOARD_ACCESS',
  AI_NEPALI_LANGUAGE = 'AI_NEPALI_LANGUAGE',
  AI_ENGLISH_LANGUAGE = 'AI_ENGLISH_LANGUAGE',

  // Official CDC Digital Textbooks
  DIGITAL_TEXTBOOKS = 'DIGITAL_TEXTBOOKS',
  TEXTBOOKS_STUDENT_ACCESS = 'TEXTBOOKS_STUDENT_ACCESS',
  TEXTBOOKS_TEACHER_ACCESS = 'TEXTBOOKS_TEACHER_ACCESS',
}

export type FeatureCategory = 
  | 'STUDENT_DASHBOARD'
  | 'ASSIGNMENTS'
  | 'QUIZZES'
  | 'LEARNING_RESOURCES'
  | 'SMARTBOARD'
  | 'SIMULATIONS'
  | 'AI_ASSISTANT'
  | 'DIGITAL_TEXTBOOKS';

export interface IFeatureDefinition {
  key: FeatureKey;
  name: string;
  category: FeatureCategory;
  description: string;
  defaultEnabled: boolean;
  requiresStudentDashboard?: boolean;
  platformPackageRequired?: 'FOUNDATION' | 'MIDDLE' | 'SECONDARY' | 'K12';
}

export const FEATURE_DEFINITIONS: Record<FeatureKey, IFeatureDefinition> = {
  [FeatureKey.STUDENT_DASHBOARD]: {
    key: FeatureKey.STUDENT_DASHBOARD,
    name: 'Student Dashboard Access',
    category: 'STUDENT_DASHBOARD',
    description: 'Allows students in the class/section to log in and access their personal learning workspace.',
    defaultEnabled: true,
  },
  [FeatureKey.ASSIGNMENTS]: {
    key: FeatureKey.ASSIGNMENTS,
    name: 'Assignments Module',
    category: 'ASSIGNMENTS',
    description: 'Enables classroom homework and assignments.',
    defaultEnabled: true,
  },
  [FeatureKey.ASSIGNMENTS_CREATION]: {
    key: FeatureKey.ASSIGNMENTS_CREATION,
    name: 'Teacher Assignment Creation',
    category: 'ASSIGNMENTS',
    description: 'Allows teachers to create assignments for assigned classes.',
    defaultEnabled: true,
  },
  [FeatureKey.ASSIGNMENTS_VISIBILITY]: {
    key: FeatureKey.ASSIGNMENTS_VISIBILITY,
    name: 'Student Assignment Visibility',
    category: 'ASSIGNMENTS',
    description: 'Allows students to see pending and completed homework on their dashboard.',
    defaultEnabled: true,
    requiresStudentDashboard: true,
  },
  [FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION]: {
    key: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
    name: 'Online Assignment Submission',
    category: 'ASSIGNMENTS',
    description: 'Allows students to submit assignments digitally via dashboard. When disabled, offline submission applies.',
    defaultEnabled: false,
    requiresStudentDashboard: true,
  },
  [FeatureKey.ASSIGNMENTS_FILE_UPLOAD]: {
    key: FeatureKey.ASSIGNMENTS_FILE_UPLOAD,
    name: 'Assignment File Uploads',
    category: 'ASSIGNMENTS',
    description: 'Permits students to upload PDF, image, or doc attachments for assignments.',
    defaultEnabled: false,
    requiresStudentDashboard: true,
  },
  [FeatureKey.ASSIGNMENTS_TEXT_SUBMISSION]: {
    key: FeatureKey.ASSIGNMENTS_TEXT_SUBMISSION,
    name: 'Text-Based Answer Submission',
    category: 'ASSIGNMENTS',
    description: 'Permits students to type written answers directly in the portal.',
    defaultEnabled: true,
    requiresStudentDashboard: true,
  },
  [FeatureKey.ASSIGNMENTS_DEADLINES]: {
    key: FeatureKey.ASSIGNMENTS_DEADLINES,
    name: 'Enforce Assignment Deadlines',
    category: 'ASSIGNMENTS',
    description: 'Enforces due dates and flags late submissions.',
    defaultEnabled: true,
  },
  [FeatureKey.ASSIGNMENTS_LATE_SUBMISSION]: {
    key: FeatureKey.ASSIGNMENTS_LATE_SUBMISSION,
    name: 'Allow Late Submissions',
    category: 'ASSIGNMENTS',
    description: 'Permits students to submit homework after the specified deadline.',
    defaultEnabled: true,
  },
  [FeatureKey.ASSIGNMENTS_FEEDBACK]: {
    key: FeatureKey.ASSIGNMENTS_FEEDBACK,
    name: 'Teacher Feedback & Grading Visibility',
    category: 'ASSIGNMENTS',
    description: 'Allows students to view teacher marks and corrections for submissions.',
    defaultEnabled: true,
    requiresStudentDashboard: true,
  },
  [FeatureKey.QUIZZES]: {
    key: FeatureKey.QUIZZES,
    name: 'Interactive Quizzes Module',
    category: 'QUIZZES',
    description: 'Enables classroom and online quizzes.',
    defaultEnabled: true,
  },
  [FeatureKey.QUIZZES_TEACHER_CREATE]: {
    key: FeatureKey.QUIZZES_TEACHER_CREATE,
    name: 'Teacher Quiz Creation',
    category: 'QUIZZES',
    description: 'Allows faculty to create multiple choice and short answer quizzes.',
    defaultEnabled: true,
  },
  [FeatureKey.QUIZZES_ONLINE_ACCESS]: {
    key: FeatureKey.QUIZZES_ONLINE_ACCESS,
    name: 'Online Student Quiz Access',
    category: 'QUIZZES',
    description: 'Enables students to take quizzes through their online portal.',
    defaultEnabled: false,
    requiresStudentDashboard: true,
  },
  [FeatureKey.QUIZZES_TIMED]: {
    key: FeatureKey.QUIZZES_TIMED,
    name: 'Timed Quizzes',
    category: 'QUIZZES',
    description: 'Enforces countdown timers during quiz attempts.',
    defaultEnabled: true,
  },
  [FeatureKey.QUIZZES_PRACTICE]: {
    key: FeatureKey.QUIZZES_PRACTICE,
    name: 'Practice Quizzes',
    category: 'QUIZZES',
    description: 'Allows formative practice quiz attempts with instant answers.',
    defaultEnabled: true,
  },
  [FeatureKey.QUIZZES_GRADED]: {
    key: FeatureKey.QUIZZES_GRADED,
    name: 'Graded Assessment Quizzes',
    category: 'QUIZZES',
    description: 'Contributes quiz marks to terminal assessment records.',
    defaultEnabled: true,
  },
  [FeatureKey.QUIZZES_RESULT_VISIBILITY]: {
    key: FeatureKey.QUIZZES_RESULT_VISIBILITY,
    name: 'Quiz Result Visibility',
    category: 'QUIZZES',
    description: 'Allows students to review answer keys and scores after submission.',
    defaultEnabled: true,
    requiresStudentDashboard: true,
  },
  [FeatureKey.QUIZZES_ATTEMPT_LIMITS]: {
    key: FeatureKey.QUIZZES_ATTEMPT_LIMITS,
    name: 'Enforce Attempt Limits',
    category: 'QUIZZES',
    description: 'Restricts quiz attempts to administrator/teacher specified count.',
    defaultEnabled: true,
  },
  [FeatureKey.NOTES]: {
    key: FeatureKey.NOTES,
    name: 'Shared Notes',
    category: 'LEARNING_RESOURCES',
    description: 'Allows teachers to publish class notes to their assigned students.',
    defaultEnabled: true,
  },
  [FeatureKey.MATERIALS]: {
    key: FeatureKey.MATERIALS,
    name: 'Learning Materials',
    category: 'LEARNING_RESOURCES',
    description: 'Allows teachers to publish worksheets and supplementary materials.',
    defaultEnabled: true,
  },
  [FeatureKey.PRESENTATIONS]: {
    key: FeatureKey.PRESENTATIONS,
    name: 'Presentations',
    category: 'LEARNING_RESOURCES',
    description: 'Allows teachers to publish presentations to their assigned students.',
    defaultEnabled: true,
  },
  [FeatureKey.VIDEOS]: {
    key: FeatureKey.VIDEOS,
    name: 'Videos',
    category: 'LEARNING_RESOURCES',
    description: 'Allows teachers to publish videos to their assigned students.',
    defaultEnabled: true,
  },
  [FeatureKey.SMARTBOARD]: {
    key: FeatureKey.SMARTBOARD,
    name: 'Smart Board Digital Classroom Hub',
    category: 'SMARTBOARD',
    description: 'Enables PiyushDhara EduVerse IFP Smart Board canvas and teaching tools.',
    defaultEnabled: true,
  },
  [FeatureKey.SMARTBOARD_WHITEBOARD]: {
    key: FeatureKey.SMARTBOARD_WHITEBOARD,
    name: 'Smart Board Interactive Whiteboard',
    category: 'SMARTBOARD',
    description: 'Enables canvas drawing, vector brushes, and geometric math tools on the board.',
    defaultEnabled: true,
  },
  [FeatureKey.SMARTBOARD_AI]: {
    key: FeatureKey.SMARTBOARD_AI,
    name: 'Smart Board AI Assistant',
    category: 'SMARTBOARD',
    description: 'Enables AI lesson co-pilot directly on the classroom smart board.',
    defaultEnabled: true,
  },
  [FeatureKey.SIMULATIONS]: {
    key: FeatureKey.SIMULATIONS,
    name: 'Educational Simulations',
    category: 'SIMULATIONS',
    description: 'Enables interactive HTML5 / PhET science and math simulation laboratory.',
    defaultEnabled: true,
  },
  [FeatureKey.SIMULATIONS_STUDENT_ACCESS]: {
    key: FeatureKey.SIMULATIONS_STUDENT_ACCESS,
    name: 'Student Self-Paced Simulation Access',
    category: 'SIMULATIONS',
    description: 'Permits students to launch science/math simulations directly from student dashboard.',
    defaultEnabled: true,
    requiresStudentDashboard: true,
  },
  [FeatureKey.SIMULATIONS_TEACHER_ONLY]: {
    key: FeatureKey.SIMULATIONS_TEACHER_ONLY,
    name: 'Teacher-Led Simulations Only',
    category: 'SIMULATIONS',
    description: 'Restricts simulations exclusively to teacher classroom demonstrations.',
    defaultEnabled: false,
  },
  [FeatureKey.SIMULATIONS_SMARTBOARD]: {
    key: FeatureKey.SIMULATIONS_SMARTBOARD,
    name: 'Smart Board Simulation Launcher',
    category: 'SIMULATIONS',
    description: 'Allows launching simulations embedded on the classroom Smart Board.',
    defaultEnabled: true,
  },
  [FeatureKey.AI_ASSISTANT]: {
    key: FeatureKey.AI_ASSISTANT,
    name: 'Nepal CDC RAG AI Assistant',
    category: 'AI_ASSISTANT',
    description: 'Central AI tutoring and lesson assistance grounded in official textbooks.',
    defaultEnabled: true,
  },
  [FeatureKey.AI_STUDENT_ACCESS]: {
    key: FeatureKey.AI_STUDENT_ACCESS,
    name: 'Student AI Assistant Access',
    category: 'AI_ASSISTANT',
    description: 'Permits students to chat with the curriculum AI assistant from their dashboard.',
    defaultEnabled: false,
    requiresStudentDashboard: true,
  },
  [FeatureKey.AI_TEACHER_ACCESS]: {
    key: FeatureKey.AI_TEACHER_ACCESS,
    name: 'Teacher AI Co-Pilot',
    category: 'AI_ASSISTANT',
    description: 'Allows teachers to generate lesson plans, quizzes, and explanations with AI.',
    defaultEnabled: true,
  },
  [FeatureKey.AI_SMARTBOARD_ACCESS]: {
    key: FeatureKey.AI_SMARTBOARD_ACCESS,
    name: 'Smart Board AI Integration',
    category: 'AI_ASSISTANT',
    description: 'Enables AI query panel inside the classroom Smart Board.',
    defaultEnabled: true,
  },
  [FeatureKey.AI_NEPALI_LANGUAGE]: {
    key: FeatureKey.AI_NEPALI_LANGUAGE,
    name: 'Nepali Language AI Support',
    category: 'AI_ASSISTANT',
    description: 'Supports queries and responses in Devanagari script.',
    defaultEnabled: true,
  },
  [FeatureKey.AI_ENGLISH_LANGUAGE]: {
    key: FeatureKey.AI_ENGLISH_LANGUAGE,
    name: 'English Language AI Support',
    category: 'AI_ASSISTANT',
    description: 'Supports queries and responses in English medium.',
    defaultEnabled: true,
  },
  [FeatureKey.DIGITAL_TEXTBOOKS]: {
    key: FeatureKey.DIGITAL_TEXTBOOKS,
    name: 'Official Nepal CDC Digital Textbooks',
    category: 'DIGITAL_TEXTBOOKS',
    description: 'Access to the 141 official bilingual textbook repository.',
    defaultEnabled: true,
  },
  [FeatureKey.TEXTBOOKS_STUDENT_ACCESS]: {
    key: FeatureKey.TEXTBOOKS_STUDENT_ACCESS,
    name: 'Student Textbook Reading Access',
    category: 'DIGITAL_TEXTBOOKS',
    description: 'Permits students to read official CDC textbooks from their personal portal.',
    defaultEnabled: true,
    requiresStudentDashboard: true,
  },
  [FeatureKey.TEXTBOOKS_TEACHER_ACCESS]: {
    key: FeatureKey.TEXTBOOKS_TEACHER_ACCESS,
    name: 'Teacher Textbook Access',
    category: 'DIGITAL_TEXTBOOKS',
    description: 'Allows faculty to view, stream, and present textbooks in class.',
    defaultEnabled: true,
  },
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STUDENT DEVICE AVAILABILITY PROFILES
 * ─────────────────────────────────────────────────────────────────────────────
 */
export type DeviceAccessType = 
  | 'PERSONAL_SMARTPHONE'
  | 'SHARED_DEVICE'
  | 'SCHOOL_COMPUTER'
  | 'NO_INDIVIDUAL_DEVICE'
  | 'UNKNOWN';

export interface IStudentDeviceProfile extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId?: mongoose.Types.ObjectId | string;
  classId?: mongoose.Types.ObjectId | string;
  sectionId?: mongoose.Types.ObjectId | string;
  studentId?: mongoose.Types.ObjectId | string;
  deviceType: DeviceAccessType;
  internetAvailability: 'BROADBAND' | 'MOBILE_DATA' | 'SCHOOL_ONLY' | 'NONE';
  sharedDeviceCount?: number;
  notes?: string;
  updatedBy: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentDeviceProfileSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentEnrollment', index: true },
    deviceType: {
      type: String,
      enum: ['PERSONAL_SMARTPHONE', 'SHARED_DEVICE', 'SCHOOL_COMPUTER', 'NO_INDIVIDUAL_DEVICE', 'UNKNOWN'],
      default: 'UNKNOWN',
      required: true,
    },
    internetAvailability: {
      type: String,
      enum: ['BROADBAND', 'MOBILE_DATA', 'SCHOOL_ONLY', 'NONE'],
      default: 'SCHOOL_ONLY',
    },
    sharedDeviceCount: { type: Number, default: 0 },
    notes: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

StudentDeviceProfileSchema.index({ institutionId: 1, classId: 1, sectionId: 1, studentId: 1 });

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * INSTITUTION FEATURE SETTINGS (Root Defaults)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface IInstitutionFeatureSettings extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId?: mongoose.Types.ObjectId | string;
  featureKey: FeatureKey;
  enabled: boolean;
  configOptions?: Record<string, any>;
  updatedBy: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionFeatureSettingsSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', index: true },
    featureKey: { type: String, enum: Object.values(FeatureKey), required: true },
    enabled: { type: Boolean, required: true },
    configOptions: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

InstitutionFeatureSettingsSchema.index({ institutionId: 1, featureKey: 1 }, { unique: true });

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CLASS FEATURE SETTINGS (Class Overrides)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface IClassFeatureSettings extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId?: mongoose.Types.ObjectId | string;
  classId: mongoose.Types.ObjectId | string;
  gradeNumber: number;
  featureKey: FeatureKey;
  enabled: boolean;
  configOptions?: Record<string, any>;
  updatedBy: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassFeatureSettingsSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    gradeNumber: { type: Number, required: true, min: 1, max: 12 },
    featureKey: { type: String, enum: Object.values(FeatureKey), required: true },
    enabled: { type: Boolean, required: true },
    configOptions: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ClassFeatureSettingsSchema.index({ institutionId: 1, classId: 1, featureKey: 1 }, { unique: true });

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SECTION FEATURE SETTINGS (Section Overrides)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface ISectionFeatureSettings extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId?: mongoose.Types.ObjectId | string;
  classId: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  featureKey: FeatureKey;
  enabled: boolean;
  configOptions?: Record<string, any>;
  updatedBy: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const SectionFeatureSettingsSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    featureKey: { type: String, enum: Object.values(FeatureKey), required: true },
    enabled: { type: Boolean, required: true },
    configOptions: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

SectionFeatureSettingsSchema.index({ institutionId: 1, sectionId: 1, featureKey: 1 }, { unique: true });

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STUDENT FEATURE OVERRIDES (Individual Student Exceptions)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface IStudentFeatureOverride extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  studentId: mongoose.Types.ObjectId | string;
  sectionId?: mongoose.Types.ObjectId | string;
  classId?: mongoose.Types.ObjectId | string;
  featureKey: FeatureKey;
  enabled: boolean;
  reason?: string;
  updatedBy: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentFeatureOverrideSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentEnrollment', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    featureKey: { type: String, enum: Object.values(FeatureKey), required: true },
    enabled: { type: Boolean, required: true },
    reason: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

StudentFeatureOverrideSchema.index({ institutionId: 1, studentId: 1, featureKey: 1 }, { unique: true });

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FEATURE CONFIGURATION HISTORY (Audit Trail)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface IFeatureConfigurationHistory extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  scope: 'INSTITUTION' | 'CLASS' | 'SECTION' | 'STUDENT';
  targetId?: mongoose.Types.ObjectId | string;
  targetName?: string;
  featureKey: FeatureKey;
  previousSetting: boolean | null;
  newSetting: boolean;
  reason?: string;
  affectedScopeDescription: string;
  changedBy: mongoose.Types.ObjectId | string;
  createdAt: Date;
}

const FeatureConfigurationHistorySchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    scope: { type: String, enum: ['INSTITUTION', 'CLASS', 'SECTION', 'STUDENT'], required: true },
    targetId: { type: Schema.Types.ObjectId, index: true },
    targetName: { type: String },
    featureKey: { type: String, enum: Object.values(FeatureKey), required: true },
    previousSetting: { type: Boolean, default: null },
    newSetting: { type: Boolean, required: true },
    reason: { type: String },
    affectedScopeDescription: { type: String, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

FeatureConfigurationHistorySchema.index({ institutionId: 1, createdAt: -1 });

export const InstitutionFeatureSettings = mongoose.model<IInstitutionFeatureSettings>(
  'InstitutionFeatureSettings',
  InstitutionFeatureSettingsSchema,
  'institutionFeatureSettings'
);

export const ClassFeatureSettings = mongoose.model<IClassFeatureSettings>(
  'ClassFeatureSettings',
  ClassFeatureSettingsSchema,
  'classFeatureSettings'
);

export const SectionFeatureSettings = mongoose.model<ISectionFeatureSettings>(
  'SectionFeatureSettings',
  SectionFeatureSettingsSchema,
  'sectionFeatureSettings'
);

export const StudentFeatureOverride = mongoose.model<IStudentFeatureOverride>(
  'StudentFeatureOverride',
  StudentFeatureOverrideSchema,
  'studentFeatureOverrides'
);

export const StudentDeviceProfile = mongoose.model<IStudentDeviceProfile>(
  'StudentDeviceProfile',
  StudentDeviceProfileSchema,
  'studentDeviceProfiles'
);

export const FeatureConfigurationHistory = mongoose.model<IFeatureConfigurationHistory>(
  'FeatureConfigurationHistory',
  FeatureConfigurationHistorySchema,
  'featureConfigurationHistory'
);
