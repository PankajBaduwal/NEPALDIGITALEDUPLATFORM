# Class 1 Mathematics Chapter 2: Lines (रेखाहरू) - Comprehensive Simulation Plan

## 1. Executive Summary & Curriculum Alignment
- **Jurisdiction:** Nepal Curriculum Development Centre (CDC / पाठ्यक्रम विकास केन्द्र)
- **Grade:** Class 1 (कक्षा १)
- **Subject:** Mathematics (मेरो गणित, २०७६)
- **Chapter:** Chapter 2 – रेखाहरू (Lines)
- **Target Age Group:** 5 to 7 years
- **Module:** Centralized Simulation Library (`Explore Simulations`)
- **Navigation Breadcrumb:** `Teacher Dashboard → Explore Simulations → All Classes → Class 1 → Mathematics → Chapter 2: Lines (रेखाहरू) → Simulations → Launch`

---

## 2. Pedagogical Principles
1. **Activity-Based Learning:** Grounded directly in textbook exercises—observing straight and curved ropes, colouring lines with textbook rule colours (Blue = Straight, Red = Curved), connecting numbered dots, and utilizing classroom physical objects with straight edges (rulers, textbooks, wooden pencil boxes).
2. **Age-Appropriate Scope:** Zero advanced abstract concepts (no equations, coordinate geometry, angle measures, or line segment formulas). Concepts are strictly concrete:
   - **सीधा रेखा (Straight Line)**: "नमोडिएको, नबाङ्गिएको सिधा बाटो वा धर्को"
   - **बाङ्गो रेखा (Curved Line)**: "मोडिएको, घुमेको वा छाल जस्तो धर्को"
3. **Bilingual Narration:** Clear Nepali voiceover and typography paired with English explanations for universal accessibility in community and institutional schools across Nepal.
4. **Gamified Reinforcement:** Interactive star systems, musical tones, positive auditory reinforcement, instant corrective hints, and progress logging to school analytics.

---

## 3. Five-Simulation Breakdown

| Code | Simulation Name (Nepali / English) | Type & Engine | Core Activity |
|---|---|---|---|
| `SIM-MATH-G1-CH2-01` | **सीधा र बाङ्गो रेखा चिनौँ**<br>Straight and Curved Line Explorer | 3D WebGL / Three.js Village Environment | Interactive 3D village with straight/curved roads, fences, railway, ropes, stick, river, bridge, interactive tug-of-war rope stretching, sandbox exploration, and 12-question voice quiz. |
| `SIM-MATH-G1-CH2-02` | **रेखाहरूमा रङ भरौँ**<br>Colour the Lines | 2D Vector SVG Interactive Canvas | Textbook rule activity: Straight = Blue, Curved = Red. Color isolated lines, ropes, and everyday composite pictures (ice-cream cone, boat & waves, village house & smoke). |
| `SIM-MATH-G1-CH2-03` | **थोप्लाहरू जोडेर रेखा बनाऔँ**<br>Connect the Dots | Dynamic Pointer Grid Canvas | Connect dots in order to form horizontal straight lines, vertical straight lines, collinear 3-dot lines, zigzag mountain lines, smooth curved rainbow arcs, and kite pictures. |
| `SIM-MATH-G1-CH2-04` | **वस्तुको प्रयोग गरी रेखा कोरौँ**<br>Draw with Real Objects | Interactive Desk Simulation | Use wooden ruler, textbook edge, and pencil box edge to draw crisp straight lines. Contrast with freehand drawing to show why straight edges are used. |
| `SIM-MATH-G1-CH2-05` | **आफैँ रेखा कोरौँ**<br>My 3D Line Drawing Playground | 3D Slate / Sandpit Chalkboard | Guided tracing of straight, wavy, and loop templates; freehand drawing with multiple colors and brush sizes; interactive sun & ladder line stamps. |

---

## 4. Integration Architecture
- Centralized database registration under `Simulation` and `SimulationVersion` schemas in MongoDB.
- Direct component rendering in `frontend/src/components/simulations/SimulationPlayer.tsx` matching `componentKey`.
- Backend progress persistence via `/api/v1/simulation-activity/simulations/:code/progress` updating `SimulationProgress` collection.

