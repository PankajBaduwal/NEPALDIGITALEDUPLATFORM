# Centralized Simulation Library Architecture
**Nepal Digital Education Platform**  
**Module:** Centralized Simulation Library & Virtual Laboratories  
**Grade Coverage:** Classes 1–12 (Primary, Basic, Secondary, Higher Secondary)  
**Curriculum Alignment:** Nepal Curriculum Development Centre (CDC)  

---

## 1. Architectural Overview & Design Philosophy

The **Centralized Simulation Library** is an institutional-grade, multi-tenant learning subsystem embedded within the Nepal Digital Education Platform. Unlike isolated single-purpose applications or siloed dashboard widgets, this system establishes a unified, hierarchically structured repository where interactive 3D simulations, WebGL environments, physics laboratories, chemistry interactives, and mathematical visualizers across all grades (1 to 12) are registered, indexed, launched, and tracked.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TEACHER DASHBOARD                               │
│              (Preserves Session, Auth Tokens & Tenant Context)         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ "Explore Simulations"
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│               CENTRALIZED SIMULATION LIBRARY HOMEPAGE                  │
│   • Primary Level (1–5)       • Secondary Level (9–10)                 │
│   • Basic Level (6–8)         • Higher Secondary Level (11–12)         │
│   Dynamic simulation counts aggregated directly from database records   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Select Class (e.g., Class 1)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         CLASS SELECTION VIEW                           │
│   • Available CDC Subjects (Mathematics, Science, English, Nepali)      │
│   • Real-time subject simulation counts & curriculum metadata          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Select Subject (e.g., Mathematics)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SUBJECT CHAPTERS VIEW                           │
│   • Official textbook chapters (e.g., Ch 1: आकारप्रकार र स्थान)       │
│   • Real registered simulation counts per chapter                      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Expand Chapter / Click Simulations
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      CHAPTER SIMULATIONS LIST                          │
│   • Simulation Cards with 3D Badges, Difficulty, Duration, Objectives  │
│   • Preview Modal & Smart Board Direct Launch Trigger                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ "Launch Simulation"
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  DEDICATED SIMULATION PLAYER                           │
│   • High-Performance Three.js WebGL Canvas Stage                       │
│   • Bilingual Audio & Speech Synthesis (नेपाली / English)              │
│   • Child-Friendly HUD & Levels Progression (1 to 5)                   │
│   • Free Sandbox Exploration & 12-Question Final Assessment            │
│   • Real-Time Progress Persistence to Backend MongoDB API              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mandatory Navigation Hierarchy

The platform strictly implements the required 6-stage navigation hierarchy:

1. **Teacher Dashboard Entry Point:**  
   Every teacher account features a prominent **"Explore Simulations"** option in the primary navigation sidebar. Clicking this activates the library view while preserving the active session, JWT authentication, and institutional multi-tenant context. No secondary login or cross-app redirection is permitted.
2. **All Classes Homepage:**  
   Groups classes into the four official national educational tiers:
   - **Primary Level:** Classes 1–5
   - **Basic Level:** Classes 6–8
   - **Secondary Level:** Classes 9–10
   - **Higher Secondary Level:** Classes 11–12
   Each class card renders real database simulation counts, subject counts, and an **"Explore Class"** trigger.
3. **Class Selection View:**  
   Displays all verified CDC curriculum subjects for that class with real counts of registered simulations.
4. **Subject Selection View:**  
   Displays official textbook chapters with simulation badges (e.g. Chapter 1: Shapes and Position shows 6 active simulations).
5. **Chapter Simulation Listing:**  
   Renders simulation cards detailing learning objectives, duration, difficulty, bilingual titles, and action triggers ("Preview", "Launch Simulation", and "Smart Board").
6. **Simulation Launch Stage:**  
   Loads the simulation inside `<SimulationPlayer />` occupying the full workspace, with a sticky "Return to Library" button that preserves the teacher's exact navigation trail.

---

## 3. Technology Stack & Rendering Pipeline

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Declarative UI, state management, and strict typings |
| **3D Engine** | Three.js (`^0.187.0`) | Procedural WebGL rendering, custom geometries, PBR materials, shadows, lighting, raycasting |
| **Audio Engine** | Web Speech API + Web Audio API | Bilingual text-to-speech in Nepali and English, procedural sound effects (chimes, boops, fanfare) |
| **Backend API** | Node.js + Express + TypeScript | RESTful endpoints for hierarchy aggregation and progress persistence |
| **Database** | MongoDB + Mongoose | Schemas for simulations, versions, assets, and progress records |
| **Smart Board Bridge** | Socket.IO + HTML5 Fullscreen | Live synchronization of simulation sessions to interactive classroom displays |

---

## 4. Multi-Tenant Security & Permission Matrix

- **Teachers:** Authorized to explore all classes (1 to 12) for lesson planning, classroom demonstration, Smart Board launching, and curriculum discovery.
- **Students:** Access governed by institutional feature access flags (`SIMULATIONS_STUDENT_ACCESS`), enrollment placement, and teacher assignments.
- **Data Isolation:** Progress tracking records are strictly scoped by `userId` and `institutionId`, preventing cross-student and cross-institution data exposure.

