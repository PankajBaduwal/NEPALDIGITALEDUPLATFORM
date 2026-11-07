# Nepal Digital Education Ecosystem — Sample Data Guide & Data Dictionary

**Seeder Script**: `backend/src/seed-comprehensive.ts`  
**Execution Command**: `npm --prefix backend run seed:comprehensive` (or `npx tsx src/seed-comprehensive.ts`)  
**Scope**: Classes 1–12, 3 Institutions, 8 Student Personas, Academic Records, CDC Textbooks, Timetables  

---

## 1. Institutional Tenants Overview

| Institution Name | Nepali Name | EMIS Code | Type | Province / District | Package Tier | Configured Learning Mode |
| :--- | :--- | :---: | :---: | :--- | :---: | :--- |
| **Kathmandu Model Secondary School (KMSS)** | काठमाडौँ मोडल माध्यमिक विद्यालय | `270010001` | Community | Bagmati Province / Kathmandu | Secondary (Classes 9–12) | **Blended Learning Mode**: Full online student dashboard, CDC textbooks, assignments, exams, and AI assistant enabled. |
| **Sunrise Secondary School** | सनराइज माध्यमिक विद्यालय | `280020002` | Institutional (Private) | Gandaki Province / Kaski | Secondary (Classes 9–12) | **Full Digital Mode**: 1-to-1 student devices, full digital textbook reading, simulation labs, and online homework submission. |
| **Himalayan Public School** | हिमालयन पब्लिक स्कुल | `390030003` | Community | Karnali Province / Jumla | Foundation (Classes 1–5) | **Smart Board Only Mode**: Classroom smart board instruction only; personal student dashboard and online submission disabled. |

---

## 2. The 8 Distinct Student Learning Personas

All 8 personas are enrolled in **Class 10, Section Sagarmatha** at Kathmandu Model Secondary School to demonstrate granular access control and device availability profiling:

| Persona # | Username | Full Name (Nepali) | Device Profile | Home Internet | Effective Features & Configuration |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **1** | `student_aarav` / `student_fulldigital` | Aarav Shrestha (आरभ श्रेष्ठ) | Personal Laptop | Broadband | **Full Digital Access**: Complete student portal, digital textbooks, online assignment submissions, AI assistant, and simulations. |
| **2** | `student_smartphone` | Bipana Karki (बिपना कार्की) | Personal Smartphone | Mobile Data | **Smartphone Access**: Mobile-optimized student portal, digital textbook reader, practice quizzes, and announcement stream. |
| **3** | `student_shareddevice` | Chirag Adhikari (चिराग अधिकारी) | Shared Family / School Device | School Only | **Shared Device Learning**: Access restricted to school hours / computer lab periods; downloadable offline study materials. |
| **4** | `student_nodevice` | Dawa Tamang (दावा तामाङ) | No Personal Device | None | **No Device / Offline Mode**: Classroom Smart Board learning; offline textbook reading; physical paper assignment submissions. |
| **5** | `student_smartboardonly` | Elina Gurung (एलिना गुरुङ) | No Personal Device | None | **Smart Board Only Learning**: `STUDENT_DASHBOARD` feature overridden to `false`. Login receives offline policy notice. |
| **6** | `student_noai` | Firoj Khan (फिरोज खान) | Personal Tablet | Broadband | **AI Disabled Mode**: Textbooks and assignments enabled; `AI_ASSISTANT` feature overridden to `false` by school policy. |
| **7** | `student_noonline_sub` | Gita Sharma (गीता शर्मा) | School Computer | Broadband | **Restricted Online Submissions**: `ASSIGNMENTS_ONLINE_SUBMISSION` overridden to `false`. Work submitted physically in class. |
| **8** | `student_override` | Hari Thapa (हरि थापा) | Personal Laptop | Broadband | **Custom Feature Override**: `SIMULATIONS` overridden to `false` for specialized curriculum track testing. |

---

## 3. Academic Structure & Allocations

### Classes & Sections
- **Academic Year**: `2081/2082` (Current BS Academic Year)
- **Classes**: Classes 1 through 12 seeded across all 3 institutions.
- **Sections for Class 10 (KMSS)**:
  - `Section Sagarmatha` (Bilingual Medium, Capacity: 45, Class Teacher: Ramesh Adhikari)
  - `Section Annapurna` (English Medium, Capacity: 40)

### Faculty & Subject Allocations
| Teacher | Username | Assigned Subject | Section | Designated Class Teacher? |
| :--- | :--- | :--- | :--- | :---: |
| **Ramesh Adhikari** | `teacher_ramesh` | Compulsory Mathematics (Class 10) | Section Sagarmatha | **Yes** (Section Sagarmatha) |
| **Sita Kumari Thapa** | `teacher_sita` | Science and Technology (Class 10) | Section Sagarmatha | No |
| **Hari Krishna Bhattarai** | `teacher_hari` | Compulsory English (Class 10) | Section Sagarmatha | No |

### Conflict-Free Timetable
The seeder generates an 18-slot weekly schedule (Sunday to Friday) for Section Sagarmatha:
- **Period 1 (10:00 – 10:45)**: Compulsory Mathematics | Teacher: Ramesh Adhikari | Room: Room 101
- **Period 2 (10:45 – 11:30)**: Science & Technology | Teacher: Sita Kumari Thapa | Room: Science Lab 1
- **Period 3 (11:30 – 12:15)**: Compulsory English | Teacher: Hari Krishna Bhattarai | Room: Room 101

---

## 4. Academic Records & Evaluation

### Examination: First Terminal Examination 2081 (`TERM-1-2081`)
- **Grading Scheme**: Nepal Secondary Letter Grading Framework (CDC 2078)
- **Assessments**:
  - Class 10 Science: Theory Full Marks 75, Practical Full Marks 25 (Total: 100)
  - Class 10 Mathematics: Theory Full Marks 75, Practical Full Marks 25 (Total: 100)
- **Seeded Student Marks (Aarav Shrestha)**:
  - Science: Theory 68 + Practical 24 = **92/100 (92%)** $\rightarrow$ **Grade A+ (GPA 4.0)** | Evaluated by Teacher Sita | Status: `PUBLISHED`
  - Mathematics: Theory 65 + Practical 23 = **88/100 (88%)** $\rightarrow$ **Grade A (GPA 3.6)** | Evaluated by Teacher Ramesh | Status: `PUBLISHED`

### Daily Attendance Record
- **Session**: Science Period 2, Section Sagarmatha
- **Recorded By**: Teacher Sita
- **Student Attendance**: 7 Students `PRESENT`, 1 Student `ABSENT` (Chirag Adhikari, Medical Leave).

