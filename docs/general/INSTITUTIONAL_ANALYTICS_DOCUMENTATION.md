# Institutional Analytics Documentation

## 1. Overview
The Institutional Analytics Engine in the Nepal Education Platform aggregates real-time academic, attendance, curriculum, faculty workload, and assessment metrics across all sections and grades (Classes 1–12) within an institution. All calculations use MongoDB aggregation pipelines against persisted records with zero mock calculations.

---

## 2. Calculated Metrics & Methodologies

### A. Academic Performance & GPA
- **Average GPA**: $\text{GPA} = \frac{1}{N}\sum_{i=1}^{N} \text{GPA}_i$, computed on Nepal CDC 4.0 grading scale:
  - $90\% - 100\%$: $A+$ (GPA 4.0, Outstanding)
  - $80\% - <90\%$: $A$ (GPA 3.6, Excellent)
  - $70\% - <80\%$: $B+$ (GPA 3.2, Very Good)
  - $60\% - <70\%$: $B$ (GPA 2.8, Good)
  - $50\% - <60\%$: $C+$ (GPA 2.4, Satisfactory)
  - $40\% - <50\%$: $C$ (GPA 2.0, Acceptable)
  - $35\% - <40\%$: $D$ (GPA 1.6, Basic)
  - Below $35\%$: $NG$ (Non-Graded)
- **Pass Percentage**: Ratio of students scoring $\ge 35\%$ across all compulsory subjects.

### B. Institutional Attendance
- **Attendance Rate**:
  $$\text{Attendance Rate} = \frac{\text{Present Records}}{\text{Total Session Records}} \times 100\%$$
- **Daily Trends**: Moving 7-session trend aggregated by date from `AttendanceSession`.

### C. Faculty Workload Analysis
- **Assigned Periods per Week**: Total active slots allocated to the teacher in the published timetable.
- **Workload Classification**:
  - `LIGHT`: $< 12$ periods/week.
  - `NORMAL`: $12 - 24$ periods/week (Optimal institutional range).
  - `HEAVY`: $> 24$ periods/week (Alert triggered for Principal & School Admin).

### D. At-Risk Student Identification
- **Evidence-Based Trigger Criteria**:
  1. Cumulative GPA $< 2.0$.
  2. One or more terminal exam subjects marked $NG$ (score $< 35$).
  3. Student attendance rate $< 75\%$.
- **Classification**:
  - `HIGH`: $> 2$ failing subjects or GPA $< 1.6$.
  - `MODERATE`: $1 - 2$ failing subjects or GPA $< 2.0$.
- **Action Workflow**: Principal logs formal intervention notes and recommends remedial coaching.

### E. Assessment Studio & Quiz Studio Metrics
- **Active Assignments**: Assignments with status `ACTIVE`.
- **Pending Submissions**: Submissions awaiting teacher grading (`SUBMITTED`, `RESUBMITTED`, `LATE`).
- **Copy Detection Flags**: Submissions flagged with token Jaccard similarity $> 30\%$.
- **Proctored Quizzes**: Quizzes configured with `fullscreenEnforced` or `tabSwitchDetection`.
- **Security Event Audit**: Logs `FULLSCREEN_EXIT`, `TAB_SWITCH`, `WINDOW_BLUR`, and `CLIPBOARD_ATTEMPT`.

