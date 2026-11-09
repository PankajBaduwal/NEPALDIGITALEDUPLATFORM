# Simulation Registry Schema & Data Models
**Nepal Digital Education Platform**  
**Specification:** Mongoose Models, TypeScript Interfaces & REST Endpoints  

---

## 1. Simulation Model (`SimulationSchema`)

The primary simulation entity stores comprehensive metadata for indexing, filtering, and launching.

```typescript
export interface ISimulation extends Document {
  id: string;
  code: string;                          // Unique catalog code (e.g., 'SIM-MATH-G1-CH1-01')
  title: string;                         // English title
  titleNepali?: string;                  // Nepali title (Devanagari)
  description: string;                   // English description
  descriptionNepali?: string;            // Nepali description
  learningObjectives: string[];          // English curriculum learning objectives
  learningObjectivesNepali?: string[];   // Nepali curriculum learning objectives
  gradeLevels: number[];                 // Applicable classes (e.g., [1])
  subjectId?: ObjectId | string;         // Reference to CentralSubject
  subjectCode?: string;                  // Standard code: 'MATH', 'SCI', 'ENG', 'NEP', 'COM'
  subjectName?: string;                  // 'Mathematics'
  subjectNameNepali?: string;            // 'गणित'
  chapterNumber?: number;                // 1
  chapterTitle?: string;                 // 'Shapes and Position'
  chapterTitleNepali?: string;           // 'आकारप्रकार र स्थान'
  topicName?: string;                    // Topic title
  topicNameNepali?: string;              // Nepali topic title
  language: 'ne' | 'en' | 'both';        // Language support
  simulationType: '2D_CANVAS' | '3D_WEBGL' | 'HTML5_SIM' | 'REACT_INTERACTIVE';
  runtimeUrl: string;                    // Fallback URL or relative route
  componentKey?: string;                 // In-app component key (e.g., 'class1-math-ch1-playground')
  thumbnailUrl?: string;                 // Banner or preview image URL
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedMinutes?: number;             // Estimated learning duration
  status?: 'AVAILABLE' | 'COMING_SOON' | 'RESTRICTED';
  isPublished: boolean;                  // Publication visibility
  currentVersion: string;                // Semantic version (e.g., '1.0.0')
  tags: string[];                        // Searchable keywords
  config?: Record<string, any>;          // Extensible runtime config
  viewsCount: number;                    // Total views
  smartBoardLaunches: number;            // Smart Board launch counter
  createdBy?: ObjectId | string;         // Author reference
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 2. Simulation Progress Model (`SimulationProgressSchema`)

Records individual student and teacher performance, level completion, and assessment scores.

```typescript
export interface ISimulationProgress extends Document {
  id: string;
  userId: ObjectId | string;             // User reference (Student or Teacher)
  studentId?: ObjectId | string;         // Populated when role is STUDENT
  institutionId?: ObjectId | string;     // Multi-tenant institution reference
  userRole: 'TEACHER' | 'STUDENT' | 'SUPER_ADMIN' | 'SCHOOL_ADMIN';
  gradeLevel: number;                    // Class number (e.g., 1)
  subjectCode: string;                   // 'MATH'
  chapterNumber: number;                 // 1
  simulationCode: string;                // 'SIM-MATH-G1-CH1-01'
  simulationTitle: string;               // Simulation name
  completedLevels: number[];             // Completed levels array (e.g., [1, 2, 3, 4, 5])
  attempts: number;                      // Attempt count
  correctAnswers: number;                // Number of correct assessment responses
  totalQuestions: number;                // Total assessment questions (e.g., 12)
  assessmentScore: number;               // Highest score achieved
  percentage: number;                    // 0 to 100%
  timeSpentSeconds: number;              // Total interaction duration
  conceptsToReview: string[];            // Concepts flagged for additional practice
  conceptsUnderstood: string[];          // Concepts successfully demonstrated
  isCompleted: boolean;                  // Completion flag (true when score >= 60%)
  lastAttemptedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3. Key REST API Endpoints

| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/simulation-activity/hierarchy` | Required | Returns full classes, subjects, and chapter hierarchy with real counts |
| `GET` | `/api/v1/simulation-activity/simulations` | Required | Query simulations with filters (`grade`, `subjectCode`, `chapterNumber`, `search`) |
| `GET` | `/api/v1/simulation-activity/simulations/:id` | Required | Get specific simulation details, assets, and topics |
| `POST` | `/api/v1/simulation-activity/simulations/:code/progress` | Required | Save level completion and assessment score |
| `GET` | `/api/v1/simulation-activity/simulations/:code/progress` | Required | Fetch current user's progress for a specific simulation |
| `GET` | `/api/v1/simulation-activity/simulations/progress/my` | Required | Fetch all simulation progress records for current user |

