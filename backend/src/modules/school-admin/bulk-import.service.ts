import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { generateTempPassword } from '../../common/utils/password.util';
import { SchoolAdminService } from './school-admin.service';
import {
  User,
  Class,
  Section,
  AcademicYear,
  StudentEnrollment,
  SubjectAllocation,
  SectionSubject,
  CentralSubject,
  BulkImportJob,
} from '../../models';

export class BulkImportService {
  /**
   * Teacher Import CSV Template
   */
  static getTeacherCsvTemplate(): string {
    return (
      'fullName,fullNameNepali,email,phone,gender,qualification,specialization\n' +
      'Ram Bahadur Thapa,राम बहादुर थापा,ram.thapa@school.edu.np,9841234567,MALE,M.Sc. Mathematics,Secondary Mathematics\n' +
      'Sita Devi Sharma,सीता देवी शर्मा,sita.sharma@school.edu.np,9851234568,FEMALE,M.Ed. English,English Literature\n' +
      'Hari Prasad Dahal,हरि प्रसाद दाहाल,hari.dahal@school.edu.np,9861234569,MALE,M.Sc. Physics,General Science\n'
    );
  }

  /**
   * Student Import CSV Template
   */
  static getStudentCsvTemplate(): string {
    return (
      'admissionNumber,rollNumber,fullName,fullNameNepali,className,sectionName,gender,guardianName,guardianPhone,guardianRelation\n' +
      'ADM-2081-001,1,Aarav Sharma,आरव शर्मा,Class 10,A,MALE,Kishor Sharma,9841000001,Father\n' +
      'ADM-2081-002,2,Bipana Chaudhary,बिपना चौधरी,Class 10,A,FEMALE,Sundar Chaudhary,9841000002,Father\n' +
      'ADM-2081-003,3,Chiranjibi Pokharel,चिरन्जीवी पोखरेल,Class 10,B,MALE,Ganesh Pokharel,9841000003,Father\n'
    );
  }

  /**
   * Validate raw teacher rows before batch creation
   */
  static async validateTeachers(
    institutionId: string,
    rows: Array<{
      fullName?: string;
      fullNameNepali?: string;
      email?: string;
      phone?: string;
      gender?: string;
      qualification?: string;
      specialization?: string;
    }>
  ) {
    const errors: Array<{ row: number; field?: string; value?: any; message: string }> = [];
    const validRows: any[] = [];
    const emailsInFile = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      const cleanName = (row.fullName || '').trim();
      const cleanEmail = (row.email || '').trim().toLowerCase();
      const cleanPhone = (row.phone || '').trim();

      if (!cleanName) {
        errors.push({ row: rowNum, field: 'fullName', message: 'Full name is required' });
        continue;
      }
      if (!cleanEmail) {
        errors.push({ row: rowNum, field: 'email', message: 'Email address is required' });
        continue;
      }
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        errors.push({ row: rowNum, field: 'email', value: cleanEmail, message: 'Invalid email address format' });
        continue;
      }
      if (emailsInFile.has(cleanEmail)) {
        errors.push({ row: rowNum, field: 'email', value: cleanEmail, message: 'Duplicate email in uploaded file' });
        continue;
      }
      emailsInFile.add(cleanEmail);

      // Check existing email in DB
      const existingUser = await User.findOne({
        $or: [{ email: cleanEmail }, { username: cleanEmail.split('@')[0] }],
      });
      if (existingUser) {
        errors.push({ row: rowNum, field: 'email', value: cleanEmail, message: `Email '${cleanEmail}' is already registered in platform` });
        continue;
      }

      validRows.push({
        rowNumber: rowNum,
        fullName: cleanName,
        fullNameNepali: (row.fullNameNepali || '').trim(),
        email: cleanEmail,
        phone: cleanPhone,
        gender: (row.gender || 'OTHER').toUpperCase(),
        qualification: (row.qualification || 'Bachelor Degree').trim(),
        specialization: (row.specialization || 'General Subject').trim(),
      });
    }

    return {
      totalRows: rows.length,
      validRowsCount: validRows.length,
      invalidRowsCount: errors.length,
      errors,
      previewData: validRows.slice(0, 15),
      validRows,
    };
  }

  /**
   * Batch create validated teachers
   */
  static async executeTeacherImport(
    institutionId: string,
    validRows: any[],
    performedById: string
  ) {
    await SchoolAdminService.assertWithinQuota(institutionId, 'teachers', validRows.length);
    const jobCode = `IMP-TCH-${Date.now().toString(36).toUpperCase()}`;
    const createdTeachers: any[] = [];
    const executionErrors: any[] = [];

    for (const r of validRows) {
      try {
        const usernameBase = r.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        let username = usernameBase;
        const exists = await User.findOne({ username });
        if (exists) {
          username = `${usernameBase}_${Math.floor(100 + Math.random() * 900)}`;
        }

        const tempPassword = generateTempPassword();
        const teacher = await User.create({
          institutionId: new mongoose.Types.ObjectId(institutionId),
          username,
          passwordHash: await bcrypt.hash(tempPassword, 10),
          role: 'TEACHER',
          fullName: r.fullName,
          fullNameNepali: r.fullNameNepali,
          email: r.email,
          phone: r.phone,
          status: 'ACTIVE',
          metadata: {
            gender: r.gender,
            qualification: r.qualification,
            specialization: r.specialization,
            importedViaBulkJob: jobCode,
            initialPasswordSet: true,
          },
        });
        createdTeachers.push({
          id: teacher._id.toString(),
          fullName: teacher.fullName,
          username: teacher.username,
          email: teacher.email,
          tempPassword,
        });
      } catch (err: any) {
        executionErrors.push({
          row: r.rowNumber,
          field: 'general',
          message: err.message || 'Error inserting teacher account',
        });
      }
    }

    // Save Bulk Import Record
    await BulkImportJob.create({
      jobCode,
      institutionId: new mongoose.Types.ObjectId(institutionId),
      importType: 'TEACHERS',
      fileName: 'teachers_import.csv',
      totalRows: validRows.length,
      validRows: createdTeachers.length,
      invalidRows: executionErrors.length,
      duplicateRows: 0,
      importedCount: createdTeachers.length,
      status: executionErrors.length === 0 ? 'COMPLETED' : 'COMPLETED',
      rowErrors: executionErrors,
      previewData: createdTeachers.slice(0, 10).map(({ tempPassword, ...rest }: any) => rest),
      performedBy: new mongoose.Types.ObjectId(performedById),
    });

    return {
      jobCode,
      successCount: createdTeachers.length,
      failedCount: executionErrors.length,
      teachers: createdTeachers,
      errors: executionErrors,
    };
  }

  /**
   * Validate raw student rows before batch enrollment
   */
  static async validateStudents(
    institutionId: string,
    rows: Array<{
      admissionNumber?: string;
      rollNumber?: string | number;
      fullName?: string;
      fullNameNepali?: string;
      className?: string;
      sectionName?: string;
      gender?: string;
      guardianName?: string;
      guardianPhone?: string;
      guardianRelation?: string;
    }>
  ) {
    const errors: Array<{ row: number; field?: string; value?: any; message: string }> = [];
    const validRows: any[] = [];
    const admissionNumbersInFile = new Set<string>();

    // Load institution's classes and sections
    const classes = await Class.find({ institutionId });
    const classMap = new Map<string, any>();
    classes.forEach((c) => {
      classMap.set(c.name.trim().toLowerCase(), c);
      classMap.set(`class ${c.gradeNumber}`, c);
      classMap.set(`${c.gradeNumber}`, c);
    });

    const currentYear = await AcademicYear.findOne({ institutionId, isCurrent: true }) || await AcademicYear.findOne({ institutionId });
    if (!currentYear) {
      throw { status: 400, message: 'No active academic year found for this institution', code: 'NO_ACADEMIC_YEAR' };
    }

    const sections = await Section.find({ academicYearId: currentYear._id });
    const sectionKeyMap = new Map<string, any>();
    sections.forEach((s) => {
      sectionKeyMap.set(`${s.classId.toString()}_${s.name.trim().toLowerCase()}`, s);
    });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      const cleanAdm = (row.admissionNumber || '').trim();
      const cleanName = (row.fullName || '').trim();
      const cleanClass = (row.className || '').trim().toLowerCase();
      const cleanSection = (row.sectionName || '').trim().toLowerCase();
      const rollNum = Number(row.rollNumber);

      if (!cleanAdm) {
        errors.push({ row: rowNum, field: 'admissionNumber', message: 'Admission number is required' });
        continue;
      }
      if (admissionNumbersInFile.has(cleanAdm)) {
        errors.push({ row: rowNum, field: 'admissionNumber', value: cleanAdm, message: 'Duplicate admission number in file' });
        continue;
      }
      admissionNumbersInFile.add(cleanAdm);

      if (!cleanName) {
        errors.push({ row: rowNum, field: 'fullName', message: 'Student full name is required' });
        continue;
      }
      if (!rollNum || rollNum <= 0) {
        errors.push({ row: rowNum, field: 'rollNumber', value: row.rollNumber, message: 'Roll number must be a positive number' });
        continue;
      }

      // Check class
      const cls = classMap.get(cleanClass);
      if (!cls) {
        errors.push({ row: rowNum, field: 'className', value: row.className, message: `Class '${row.className}' does not exist in this institution` });
        continue;
      }

      // Check section
      const secKey = `${cls._id.toString()}_${cleanSection}`;
      const sec = sectionKeyMap.get(secKey);
      if (!sec) {
        errors.push({ row: rowNum, field: 'sectionName', value: row.sectionName, message: `Section '${row.sectionName}' not found in ${cls.name}` });
        continue;
      }

      // Check existing admission number in DB
      const existingEnrollment = await StudentEnrollment.findOne({
        admissionNumber: cleanAdm,
        academicYearId: currentYear._id,
      });
      if (existingEnrollment) {
        errors.push({ row: rowNum, field: 'admissionNumber', value: cleanAdm, message: `Admission number '${cleanAdm}' already enrolled in current year` });
        continue;
      }

      validRows.push({
        rowNumber: rowNum,
        admissionNumber: cleanAdm,
        rollNumber: rollNum,
        fullName: cleanName,
        fullNameNepali: (row.fullNameNepali || '').trim(),
        classId: cls._id.toString(),
        className: cls.name,
        sectionId: sec._id.toString(),
        sectionName: sec.name,
        academicYearId: currentYear._id.toString(),
        gender: (row.gender || 'OTHER').toUpperCase(),
        guardianName: (row.guardianName || '').trim(),
        guardianPhone: (row.guardianPhone || '').trim(),
        guardianRelation: (row.guardianRelation || 'Parent').trim(),
      });
    }

    return {
      totalRows: rows.length,
      validRowsCount: validRows.length,
      invalidRowsCount: errors.length,
      errors,
      previewData: validRows.slice(0, 15),
      validRows,
    };
  }

  /**
   * Batch create validated students & enrollments
   */
  static async executeStudentImport(
    institutionId: string,
    validRows: any[],
    performedById: string
  ) {
    await SchoolAdminService.assertWithinQuota(institutionId, 'students', validRows.length);
    const jobCode = `IMP-STU-${Date.now().toString(36).toUpperCase()}`;
    const createdStudents: any[] = [];
    const executionErrors: any[] = [];

    for (const r of validRows) {
      try {
        const cleanNamePart = r.fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const username = `stu_${cleanNamePart.slice(0, 8)}_${r.rollNumber}_${Math.floor(100 + Math.random() * 900)}`;

        const tempPassword = generateTempPassword();
        const user = await User.create({
          institutionId: new mongoose.Types.ObjectId(institutionId),
          username,
          passwordHash: await bcrypt.hash(tempPassword, 10),
          role: 'STUDENT',
          fullName: r.fullName,
          fullNameNepali: r.fullNameNepali,
          phone: r.guardianPhone,
          status: 'ACTIVE',
          metadata: {
            admissionNumber: r.admissionNumber,
            gender: r.gender,
            importedViaBulkJob: jobCode,
          },
        });

        const enrollment = await StudentEnrollment.create({
          studentId: user._id,
          sectionId: new mongoose.Types.ObjectId(r.sectionId),
          academicYearId: new mongoose.Types.ObjectId(r.academicYearId),
          rollNumber: r.rollNumber,
          admissionNumber: r.admissionNumber,
          guardianName: r.guardianName,
          guardianPhone: r.guardianPhone,
          guardianRelation: r.guardianRelation,
          status: 'ENROLLED',
        });

        createdStudents.push({
          id: user._id.toString(),
          enrollmentId: enrollment._id.toString(),
          fullName: user.fullName,
          username: user.username,
          admissionNumber: r.admissionNumber,
          tempPassword,
          rollNumber: r.rollNumber,
          className: r.className,
          sectionName: r.sectionName,
        });
      } catch (err: any) {
        executionErrors.push({
          row: r.rowNumber,
          field: 'general',
          message: err.message || 'Error enrolling student record',
        });
      }
    }

    // Save Bulk Import Record
    await BulkImportJob.create({
      jobCode,
      institutionId: new mongoose.Types.ObjectId(institutionId),
      importType: 'STUDENTS',
      fileName: 'students_import.csv',
      totalRows: validRows.length,
      validRows: createdStudents.length,
      invalidRows: executionErrors.length,
      duplicateRows: 0,
      importedCount: createdStudents.length,
      status: executionErrors.length === 0 ? 'COMPLETED' : 'COMPLETED',
      rowErrors: executionErrors,
      previewData: createdStudents.slice(0, 10).map(({ tempPassword, ...rest }: any) => rest),
      performedBy: new mongoose.Types.ObjectId(performedById),
    });

    return {
      jobCode,
      successCount: createdStudents.length,
      failedCount: executionErrors.length,
      students: createdStudents,
      errors: executionErrors,
    };
  }

  /**
   * Bulk Subject & Teacher Allocation
   */
  static async bulkAllocateSubjects(
    institutionId: string,
    allocations: Array<{
      sectionId: string;
      centralSubjectId: string;
      teacherId: string;
      medium?: 'ENGLISH' | 'NEPALI';
      periodsPerWeek?: number;
    }>,
    performedById: string
  ) {
    const results: any[] = [];
    const errors: any[] = [];

    // Verify current academic year
    const currentYear = await AcademicYear.findOne({ institutionId, isCurrent: true }) || await AcademicYear.findOne({ institutionId });
    if (!currentYear) {
      throw { status: 400, message: 'Academic year not configured', code: 'NO_ACADEMIC_YEAR' };
    }

    for (let i = 0; i < allocations.length; i++) {
      const item = allocations[i];
      try {
        const section = await Section.findById(item.sectionId);
        if (!section) {
          errors.push({ index: i, message: `Section '${item.sectionId}' not found` });
          continue;
        }

        const teacher = await User.findOne({
          _id: item.teacherId,
          institutionId,
          role: 'TEACHER',
        });
        if (!teacher) {
          errors.push({ index: i, message: `Teacher '${item.teacherId}' not found or belongs to another institution` });
          continue;
        }

        const centralSubj = await CentralSubject.findById(item.centralSubjectId);
        if (!centralSubj) {
          errors.push({ index: i, message: `Subject '${item.centralSubjectId}' not found` });
          continue;
        }

        // Upsert SubjectAllocation
        const alloc = await SubjectAllocation.findOneAndUpdate(
          {
            sectionId: item.sectionId,
            centralSubjectId: item.centralSubjectId,
          },
          {
            institutionId: new mongoose.Types.ObjectId(institutionId),
            academicYearId: currentYear._id,
            classId: section.classId,
            sectionId: item.sectionId,
            centralSubjectId: item.centralSubjectId,
            teacherId: item.teacherId,
            medium: item.medium || (section.medium === 'NEPALI' ? 'NEPALI' : 'ENGLISH'),
            status: 'ACTIVE',
            assignedBy: new mongoose.Types.ObjectId(performedById),
            assignedAt: new Date(),
          },
          { upsert: true, new: true }
        );

        // Ensure SectionSubject offering is recorded
        await SectionSubject.findOneAndUpdate(
          {
            sectionId: item.sectionId,
            centralSubjectId: item.centralSubjectId,
          },
          {
            institutionId: new mongoose.Types.ObjectId(institutionId),
            academicYearId: currentYear._id,
            classId: section.classId,
            sectionId: item.sectionId,
            centralSubjectId: item.centralSubjectId,
            medium: item.medium || (section.medium === 'NEPALI' ? 'NEPALI' : 'ENGLISH'),
            periodsPerWeek: item.periodsPerWeek || centralSubj.creditHours || 4,
            practicalPeriodsPerWeek: 0,
            isOptional: !centralSubj.isCompulsory,
            isActive: true,
          },
          { upsert: true, new: true }
        );

        results.push(alloc);
      } catch (err: any) {
        errors.push({ index: i, message: err.message || 'Allocation failed' });
      }
    }

    return {
      allocatedCount: results.length,
      failedCount: errors.length,
      allocations: results,
      errors,
    };
  }
}
