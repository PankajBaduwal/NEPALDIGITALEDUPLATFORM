# Class 1 Mathematics Chapter 3: Geometrical Shapes (ज्यामितीय आकारहरू) - Comprehensive Simulation Plan

## 1. Executive Summary & Curriculum Alignment
- **Jurisdiction:** Nepal Curriculum Development Centre (CDC / पाठ्यक्रम विकास केन्द्र)
- **Grade:** Class 1 (कक्षा १)
- **Subject:** Mathematics (मेरो गणित, २०७६)
- **Chapter:** Chapter 3 – ज्यामितीय आकारहरू (Geometrical Shapes)
- **Target Age Group:** 5 to 7 years
- **Module:** Centralized Simulation Library (`Explore Simulations`)
- **Navigation Breadcrumb:** `Teacher Dashboard → Explore Simulations → All Classes → Class 1 → Mathematics → Chapter 3: Geometrical Shapes (ज्यामितीय आकारहरू) → Select Simulation → Launch`

---

## 2. Pedagogical Objectives
1. **Core 2D Geometrical Shapes:**
   - **वृत्त (Circle):** Perfectly round, continuous curve, zero corners or straight edges.
   - **त्रिभुज (Triangle):** 3 straight sides, 3 corners.
   - **चतुर्भुज (Quadrilateral):** 4 straight sides, 4 corners (includes squares and rectangles as standard four-sided examples).
2. **Age-Appropriate Scope:**
   - Strictly visual, tactile, and activity-based.
   - Zero formulas, perimeter, area, coordinates, or formal proofs.
   - Precise distinction between 3D solids and 2D shape faces (e.g., a ball has a circular outline or circular cross-section; dining plate surface is circular; house roof gable is triangular).
3. **Textbook Rule-Based Colouring:**
   - **Triangle (त्रिभुज): Red (रातो)**
   - **Quadrilateral / Rectangle (चतुर्भुज): Blue (निलो)**
   - **Circle (वृत्त): Green (हरियो)**
4. **Bilingual Accessibility:**
   - Universal dual-language support in Nepali (नेपाली) and English with voice synthesis and child-friendly typography.

---

## 3. Five-Simulation Breakdown

| Code | Simulation Name (Nepali / English) | Type & Engine | Core Textbook Learning Activity |
|---|---|---|---|
| `SIM-MATH-G1-CH3-01` | **आकारहरू चिनौँ**<br>Shape Explorer 3D | 3D WebGL / Three.js | Interactive 3D playground with circle, triangle, and quadrilateral models and real-world items (plate, clock, drum, sign, roof, book, window). Multi-angle 3D rotation, 5 guided levels, and 12-question audio assessment. |
| `SIM-MATH-G1-CH3-02` | **वस्तु र आकार मिलाऔँ**<br>Match the Shape | Interactive Categorization Board | 3 shape drop zones (Circle, Triangle, Quadrilateral). Match everyday items (plate, clock, drum, sign, roof, flag, book, door, window, gift box) into correct categories. |
| `SIM-MATH-G1-CH3-03` | **आकारहरूमा रङ भरौँ**<br>Colour the Shapes | 2D Vector SVG Interactive Canvas | Textbook rule colouring: Triangle = Red, Quadrilateral = Blue, Circle = Green. Isolated shape gallery and composite drawings (cottage & sun, school bus, friendly robot). |
| `SIM-MATH-G1-CH3-04` | **आकार खोजौँ**<br>Shape Detective | Interactive Environmental Exploration | Scavenger hunt in 3 realistic scenes: Classroom (blackboard, book, clock), School Playground (ball, swing, cone, sandbox), and Nepalese Village (cottage roof, carved window, drum, well). |
| `SIM-MATH-G1-CH3-05` | **आकारहरूबाट चित्र बनाऔँ**<br>Build with Shapes | 2D/3D Construction Canvas | Tangram & shape synthesizer: combine circles, triangles, squares, and rectangles to construct houses, robots, buses, and flowers. Free creative drawing and blueprint mode. |

---

## 4. Integration & Security
- Fully integrated into existing `SimulationPlayer.tsx` via `componentKey` routing.
- Real-time student progress saving through authenticated `/api/v1/simulation-activity/simulations/:code/progress` updating MongoDB.
- Dynamic counts reflected in Centralized Simulation Library hierarchy without hardcoding.

