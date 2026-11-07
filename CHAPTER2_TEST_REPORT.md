# Class 1 Mathematics Chapter 2: Lines (रेखाहरू) - Comprehensive Test Report

## 1. Test Environment
- **Test Date:** 2026-11-07
- **Backend Host:** `http://localhost:5000` (Node.js / Express / TypeScript / Mongoose)
- **Frontend Host:** `http://localhost:3000` (Vite / React 19 / Three.js)
- **Database:** MongoDB `mongodb://127.0.0.1:27017/nepal_edu_platform`
- **Authenticated Test Identity:** `teacher_sita` (Role: `TEACHER`)

---

## 2. API & Hierarchy Verification Results

| Test Case | Method & Endpoint | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **Auth Verification** | `POST /api/v1/auth/login` | Valid JWT token returned | Token successfully acquired | **PASSED** |
| **Hierarchy Query** | `GET /api/v1/simulation-activity/hierarchy` | Chapter 2 listed under Class 1 Math with 5 simulations | Chapter 2: "Lines" ("रेखाहरू") count = 5 | **PASSED** |
| **Filtered Simulation Query** | `GET /api/v1/simulation-activity/simulations?gradeLevel=1&subjectCode=MATH&chapterNumber=2` | Returns exactly 5 registered simulation objects | 5 simulation objects returned matching codes `SIM-MATH-G1-CH2-01` to `05` | **PASSED** |
| **Progress Tracking: SIM-01** | `POST /api/v1/simulation-activity/simulations/SIM-MATH-G1-CH2-01/progress` | HTTP 200, upserts `SimulationProgress` | HTTP 200, `success: true` | **PASSED** |
| **Progress Tracking: SIM-02** | `POST /api/v1/simulation-activity/simulations/SIM-MATH-G1-CH2-02/progress` | HTTP 200, upserts `SimulationProgress` | HTTP 200, `success: true` | **PASSED** |
| **Progress Tracking: SIM-03** | `POST /api/v1/simulation-activity/simulations/SIM-MATH-G1-CH2-03/progress` | HTTP 200, upserts `SimulationProgress` | HTTP 200, `success: true` | **PASSED** |
| **Progress Tracking: SIM-04** | `POST /api/v1/simulation-activity/simulations/SIM-MATH-G1-CH2-04/progress` | HTTP 200, upserts `SimulationProgress` | HTTP 200, `success: true` | **PASSED** |
| **Progress Tracking: SIM-05** | `POST /api/v1/simulation-activity/simulations/SIM-MATH-G1-CH2-05/progress` | HTTP 200, upserts `SimulationProgress` | HTTP 200, `success: true` | **PASSED** |

---

## 3. Frontend & Build Verification Results

| Component | Target File | Verification Metric | Status |
|---|---|---|---|
| **Sim 01 Explorer** | `StraightCurvedLineExplorer.tsx` | Clean WebGL canvas mount, raycaster pointer events, audio narration | **PASSED** |
| **Sim 02 Colouring** | `LineColoringSimulation.tsx` | Blue (Straight) & Red (Curved) color rules, SVG glow, undo/clear | **PASSED** |
| **Sim 03 Dots** | `ConnectTheDotsSimulation.tsx` | Pointer drag, dot snapping, pentatonic chime, zigzag/curved shapes | **PASSED** |
| **Sim 04 Objects** | `DrawWithObjectsSimulation.tsx` | Ruler/book edge constrained drawing vs. freehand wobbly stroke | **PASSED** |
| **Sim 05 Playground**| `LineDrawingPlayground.tsx` | Trace mode templates, chalkboard canvas, sun/ladder stamps | **PASSED** |
| **Simulation Router**| `SimulationPlayer.tsx` | Correct routing on all 5 `componentKey` identifiers | **PASSED** |
| **Production Build** | `npm run build` (Vite) | Exit code 0, 0 TypeScript errors, bundle generated | **PASSED** |

---

## 4. Conclusion
All components, routes, database documents, and interaction states for **Class 1 Mathematics Chapter 2: Lines (रेखाहरू)** are fully operational, tested end-to-end, and integrated into the centralized Simulation Library.

