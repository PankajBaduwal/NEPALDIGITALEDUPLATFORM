# School Administrator Comprehensive User Guide

## Nepal Digital Education Ecosystem (नेपाल डिजिटल शिक्षा प्रणाली)
**Target Users:** School Principals, Headmasters, Vice-Principals, School Administrators, College Admins  
**Access Route:** `/school-admin/*`

---

## 1. System Overview & Administrative Autonomy
Once an institution has been provisioned, the School Administrator possesses complete autonomy over the daily operations of that institution. The Super Admin manages platform health and approvals, but **the School Admin independently controls all internal academic and administrative operations:**
- Faculty & Staff Management
- Student Enrollment & Admissions
- Class, Section & Subject Curriculum Allocations
- Timetable Scheduling & Teacher Workload
- Terminal Examinations & Marks Verification
- School-Wide Announcements & Parent Communication
- Feature Access & Device Usage Policies

---

## 2. Navigating the School Admin Dashboard

### 2.1 Central Overview Dashboard
- **Key Metrics Cards:** Total active students, verified faculty, total sections, smart board devices, and overall attendance rate.
- **Academic Alerts:** Unassigned periods, examination deadlines, and pending teacher marks submissions.

### 2.2 Classes & Academic Structure
- **View Classes:** Classes 1 through 12 (or College Semesters).
- **Create New Section:** Add sections (e.g. `Section A`, `Section B`, `Section C`) with custom student capacities (default: 45) and medium (*English*, *Nepali*, or *Bilingual*).
- **Assign Primary Class Teacher:** Designate a class teacher responsible for daily morning attendance and student welfare.

### 2.3 Teachers & Faculty Management
- **Add Single Teacher:** Create individual faculty accounts with full name, Devanagari name, email, phone, qualification, and specialization.
- **Bulk Faculty Import (CSV):** Onboard entire teaching staffs at once via CSV upload with pre-flight duplicate checking and automated password encryption.
- **Toggle Faculty Status:** Activate or suspend teacher accounts without deleting historical grading records.

### 2.4 Student Registry & Admissions
- **Enroll Individual Student:** Register student with official admission number, roll number, class, section, and guardian contact details.
- **Bulk Student Enrollment (CSV):** Enroll hundreds of students across all sections in one batch.
- **Student Roster Search:** Search by student name, roll number, or admission code.

### 2.5 Academic Curriculum & Faculty Allocation
- **Subject Allocation Matrix:** Assign qualified faculty teachers to each CDC subject for every class section.
- **Bulk Allocation Modal:** Quickly assign multiple teachers across subjects and sections in a single interface.
- **Periods Per Week:** Set credit hours and weekly teaching loads (e.g. 4 or 5 periods per week).

### 2.6 Timetable Scheduling & Conflict Prevention
- **Weekly Schedule Layout:** Sunday to Friday, 6 periods per day, with standard 45-minute periods and lunch break.
- **Real-Time Conflict Prevention:** The scheduling engine automatically prevents:
  - Teacher double-booking (same teacher in two classrooms simultaneously).
  - Section period overlap.
  - Exceeding maximum teacher workload (default: 30 periods/week).
- **Smart Board Allocation:** Marks whether a period takes place in a smart board multimedia room.

### 2.7 Academic Examinations, Marks & Grading
- **Schedule Exam:** Create Terminal Exams (First Term, Mid-Term, Final Exam) aligned with CDC 8-point letter grading scale.
- **Enter & Audit Marks:** Review marks entered by subject teachers.
- **Publish Results:** One-click publishing generates verified digital report cards with GPA, grade points, and percentage.

### 2.8 School Announcements & Notices
- Post broadcast announcements with priority levels (`NORMAL`, `URGENT`, `EMERGENCY`).
- Target announcements to specific groups: *All Students*, *All Teachers*, or *Entire Institution*.

### 2.9 Feature Configuration & Access Control
- Control digital feature availability per class and section:
  - Enable or disable Smart Board tools.
  - Enable or disable 3D Science and Math Simulations.
  - Toggle AI Learning Assistant for students.
  - Allow or restrict online homework submissions.

