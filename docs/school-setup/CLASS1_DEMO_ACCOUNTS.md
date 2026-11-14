# Class 1 — Demo Accounts & Sample Data

**School:** Dhambojhi Secondary School (EMIS `570010001`) · **Class:** Grade 1 · **Sections:** A (English medium) and B (Nepali medium)
**Password for every account below:** `DemoPass123!`  (`Nepal@1234` also works in demo mode)

> **One-click entry:** on the login page choose the role (Class Teacher / Subject Teacher / Student); the **Class 1 demo accounts** list under the demo button signs in as any account below with one click.
> Seed and re-check the data any time (safe to repeat, it only adds what is missing): `npm run seed:class1` and `npm run verify:class1` in `backend`.

## Class teachers
| Section | Name | Username | Role |
|---|---|---|---|
| Section A | Anjali Kumari Chaudhary | `dhambojhi_t_06` | Class teacher (section supervisor) |
| Section B | Sita Kumari Gurung | `dhambojhi_t_02` | Class teacher (section supervisor) |

## Subject teachers

### Section A
| Subject | Teacher | Username |
|---|---|---|
| Compulsory Nepali | Bishnu Prasad Thapa | `dhambojhi_t_01` |
| Compulsory English | Saraswati Shrestha | `dhambojhi_t_04` |
| Mathematics | Binod Kumar Yadav | `dhambojhi_t_07` |
| Our Surrounding | Kalpana Gautam | `dhambojhi_t_10` |

### Section B
| Subject | Teacher | Username |
|---|---|---|
| Compulsory Nepali | Sita Kumari Gurung | `dhambojhi_t_02` |
| Compulsory English | Hari Prasad Kandel | `dhambojhi_t_05` |
| Mathematics | Gita Pokharel | `dhambojhi_t_08` |
| Our Surrounding | Narayan Prasad Joshi | `dhambojhi_t_11` |

## Students (18)

### Section A
| Roll | Name | Username |
|---|---|---|
| 1 | Aarav Sharma | `dhambojhi_s_g01` |
| 2 | Pooja Verma | `dhambojhi_s_002` |
| 3 | Sujata Magar | `dhambojhi_s_003` |
| 4 | Manisha Adhikari | `dhambojhi_s_004` |
| 5 | Sunita Karki | `dhambojhi_s_005` |
| 6 | Ananya Chaudhary | `dhambojhi_s_006` |
| 7 | Pratima Yadav | `dhambojhi_s_007` |
| 8 | Riya Gurung | `dhambojhi_s_008` |
| 9 | Anisha Rana | `dhambojhi_s_009` |

### Section B
| Roll | Name | Username |
|---|---|---|
| 1 | Santosh Sharma | `dhambojhi_s_010` |
| 2 | Bikash Tharu | `dhambojhi_s_011` |
| 3 | Ayush Shah | `dhambojhi_s_012` |
| 4 | Saroj Thapa | `dhambojhi_s_013` |
| 5 | Dipendra Shrestha | `dhambojhi_s_014` |
| 6 | Kiran KC | `dhambojhi_s_015` |
| 7 | Sagar Bhandari | `dhambojhi_s_016` |
| 8 | Nabin Oli | `dhambojhi_s_017` |
| 9 | Prashant Kumal | `dhambojhi_s_018` |

## What is seeded (all linked to the Class 1 teachers and students above)

| Area | Sample data |
|---|---|
| **Attendance** | Daily attendance for every school day (Sun–Fri) up to today for both sections, plus period-wise attendance by each subject teacher for the last 6 school days; roll 7 in each section is often absent (triggers low-attendance warnings and absence notices). |
| **Marks entry** | *First Terminal* (published), *Unit Test 1* (published, 25 marks) and *Monthly Test — Mangsir* (50 marks) with the full workflow: some subjects in **draft** (teacher still entering), some **submitted** (waiting for the class teacher) and some **reviewed**. Grades and GPA follow the Nepal CDC scale. |
| **Assignments** | 2 per subject per section (one past-due and graded with feedback, one upcoming) with student submissions (on time, late and missing). |
| **Shared notes** | 2 PDF files per subject per section (lecture note + worksheet), in Nepali or English to match the subject and section medium. |
| **Smart Board notes** | One shared board note per subject per section; plus completed Smart Board lesson logs. |
| **Quizzes & activities** | A 5-question quiz per subject per section with student attempts; 4 interactive activities (counting, alphabet, swar varna, body & senses) assigned to both sections with progress. |
| **Teaching** | Teaching plan (chapters), teaching diary for the last 6 school days and syllabus progress per subject and section. |
| **Remarks** | Positive remarks, extra-practice remarks and class-teacher interventions for students who need support. |
| **Communication** | Class and subject announcements, student and teacher notifications, absence notices to guardians, and school calendar events. |

Notes: the demo teachers also teach other classes; Class 1 data is what this seed adds. Five Class 1 students that shared a name with another student were renamed so every name is unique.
