export interface GradeResult {
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'NG';
  gpa: number;
  description: string;
  isPassed: boolean;
  failedComponents?: string[];
}

export interface SubjectMarksInput {
  theoryMarks: number;
  practicalMarks: number;
  fullMarksTheory?: number;
  fullMarksPractical?: number;
  passMarksTheory?: number;
  passMarksPractical?: number;
  totalMarks?: number;
  isAbsent?: boolean;
  graceMarks?: number;
}

export interface CustomGradeInterval {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gpa: number;
  description: string;
}

export class NepalGradingUtil {
  /**
   * Calculates official Nepal CDC Grade and GPA from percentage marks (0 - 100),
   * with optional custom grading scheme intervals.
   */
  static calculateGrade(percentage: number, customIntervals?: CustomGradeInterval[]): GradeResult {
    const p = Math.round(percentage * 10) / 10;

    // Use custom intervals if configured
    if (customIntervals && customIntervals.length > 0) {
      for (const interval of customIntervals) {
        if (p >= interval.minPercentage && p <= interval.maxPercentage) {
          const isPassed = interval.grade !== 'NG' && interval.gpa > 0;
          return {
            grade: interval.grade as any,
            gpa: interval.gpa,
            description: interval.description,
            isPassed,
          };
        }
      }
    }

    // Default: CDC 2078 Secondary Letter Grading Framework
    if (p >= 90) {
      return { grade: 'A+', gpa: 4.0, description: 'Outstanding', isPassed: true };
    } else if (p >= 80) {
      return { grade: 'A', gpa: 3.6, description: 'Excellent', isPassed: true };
    } else if (p >= 70) {
      return { grade: 'B+', gpa: 3.2, description: 'Very Good', isPassed: true };
    } else if (p >= 60) {
      return { grade: 'B', gpa: 2.8, description: 'Good', isPassed: true };
    } else if (p >= 50) {
      return { grade: 'C+', gpa: 2.4, description: 'Satisfactory', isPassed: true };
    } else if (p >= 40) {
      return { grade: 'C', gpa: 2.0, description: 'Acceptable', isPassed: true };
    } else if (p >= 35) {
      return { grade: 'D', gpa: 1.6, description: 'Basic', isPassed: true };
    } else {
      return { grade: 'NG', gpa: 0.0, description: 'Non-Graded', isPassed: false };
    }
  }

  /**
   * Evaluates subject marks respecting CDC 2078 component passing requirements:
   * Both theory and practical components must individually satisfy minimum pass marks.
   */
  static evaluateSubjectMarks(input: SubjectMarksInput, customIntervals?: CustomGradeInterval[]): GradeResult {
    const {
      theoryMarks,
      practicalMarks,
      fullMarksTheory = 75,
      fullMarksPractical = 25,
      passMarksTheory = 27,
      passMarksPractical = 10,
      totalMarks = 100,
      isAbsent = false,
      graceMarks = 0,
    } = input;

    if (isAbsent) {
      return { grade: 'NG', gpa: 0.0, description: 'Absent', isPassed: false, failedComponents: ['ABSENT'] };
    }

    // Boundary validations
    if (theoryMarks < 0 || theoryMarks > fullMarksTheory) {
      throw new Error(`Theory marks (${theoryMarks}) cannot be negative or exceed maximum marks (${fullMarksTheory}).`);
    }
    if (practicalMarks < 0 || practicalMarks > fullMarksPractical) {
      throw new Error(`Practical marks (${practicalMarks}) cannot be negative or exceed maximum marks (${fullMarksPractical}).`);
    }

    const effectiveTheory = Math.min(fullMarksTheory, theoryMarks + Math.max(0, graceMarks));
    const failedComponents: string[] = [];

    if (effectiveTheory < passMarksTheory) {
      failedComponents.push('Theory');
    }
    if (practicalMarks < passMarksPractical) {
      failedComponents.push('Practical');
    }

    // CDC 2078: Failure in either component mandates Non-Graded (NG)
    if (failedComponents.length > 0) {
      return {
        grade: 'NG',
        gpa: 0.0,
        description: `Non-Graded (Failed in ${failedComponents.join(', ')} component)`,
        isPassed: false,
        failedComponents,
      };
    }

    const totalObtained = effectiveTheory + practicalMarks;
    const percentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
    return this.calculateGrade(percentage, customIntervals);
  }

  /**
   * Calculates overall weighted GPA across multiple subject scores.
   */
  static calculateOverallGPA(subjectResults: Array<{ gpa: number; creditHours?: number }>): number {
    if (!subjectResults.length) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    subjectResults.forEach((sub) => {
      const credits = sub.creditHours || 4;
      totalPoints += sub.gpa * credits;
      totalCredits += credits;
    });

    return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
  }
}

