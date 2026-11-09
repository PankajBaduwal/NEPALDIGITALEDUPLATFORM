# Nepal Digital Education Ecosystem — Demo Accounts & Access Guide

All demo accounts share the standard password: **`Nepal@1234`**  
*(Super Admin account also supports `NepalSuperAdmin@2081`)*  

---

## 1. Quick 1-Click Demo Switcher

The public website and login portal include a sticky **1-Click Demo Bar** at the top of the screen (`http://localhost:3000`). Clicking on any role badge automatically logs you in and redirects to the designated dashboard without requiring manual credential entry.

---

## 2. Master Credentials Table

| Role | Username | Password | Full Name | Institution Scope | Primary Landing URL | Key Capabilities to Explore |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `Nepal@1234` | Central System Administrator | Nationwide (All 7 Provinces) | `/super-admin` | Nationwide analytics, 7-province map, 141 CDC textbooks library, mass Excel onboarding, subscription package pricing, review school registration requests. |
| **School Admin** | `admin_kmss` | `Nepal@1234` | Bishnu Prasad Sharma | Kathmandu Model Secondary School (`270010001`) | `/school-admin` | Manage school profile, classes 1–12, sections (Sagarmatha), teacher onboarding, student admissions, school-wide feature access policies. |
| **Principal** | `principal_kmss` | `Nepal@1234` | Dr. Narayan Karki | Kathmandu Model Secondary School | `/school-admin` | Executive academic analytics, institutional attendance trends, syllabus coverage %, teacher workload inspection. |
| **Subject Teacher** | `teacher_sita` | `Nepal@1234` | Sita Kumari Thapa | Kathmandu Model Secondary School | `/teacher` | Daily schedule, Science 10 subject workspace, take period attendance, grade online submissions, launch Smart Board with Class 10 Science textbook. |
| **Class Teacher** | `teacher_ramesh` | `Nepal@1234` | Ramesh Adhikari | Kathmandu Model Secondary School | `/class-teacher` | Section Sagarmatha supervisor console, full section attendance overview, cross-subject marksheet review, 1-click **Authorize & Publish Terminal Results**. |
| **Student (Full Digital)** | `student_aarav` | `Nepal@1234` | Aarav Shrestha | Kathmandu Model Secondary School | `/student` | Personal learning hub, CDC digital textbook reader with bookmarks, online assignment submission, published 4.0 GPA report card, bilingual AI tutor. |

---

## 3. Alternative School Demo Accounts

To test multi-tenant segregation across different institution types and learning modes:

### Sunrise Secondary School (Full Digital Private Academy — Pokhara)
- **School Admin**: `admin_sunrise` | `Nepal@1234`
- **EMIS Code**: `280020002` (Gandaki Province / Kaski)
- **Mode**: 1-to-1 Device Learning Mode.

### Himalayan Public School (Smart Board Only Community School — Jumla)
- **School Admin**: `admin_himalayan` | `Nepal@1234`
- **EMIS Code**: `390030003` (Karnali Province / Jumla)
- **Mode**: Smart Board Only Mode (Classes 1–5 Foundation tier).

---

## 4. Testing Specific Learning Personas

Log in with standard student credentials (`Nepal@1234`) to inspect individual feature overrides:
- **`student_noai`**: Experience the student portal with the AI Learning Assistant disabled by school policy.
- **`student_noonline_sub`**: Experience online assignment submission restriction (prompts for physical submission in class).
- **`student_smartboardonly`**: Demonstrates account notification when personal student dashboard is disabled under Smart Board Only school policy.

