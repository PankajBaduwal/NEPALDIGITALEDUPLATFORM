# Class 1 Mathematics Chapter 4: Numbers up to 9 (९ सम्मका सङ्ख्याहरू) - Comprehensive Simulation Plan

## 1. Executive Summary & Curriculum Alignment
- **Jurisdiction:** Nepal Curriculum Development Centre (CDC / पाठ्यक्रम विकास केन्द्र, सानोठिमी, भक्तपुर)
- **Grade:** Class 1 (कक्षा १)
- **Subject:** Mathematics (मेरो गणित, २०७६)
- **Chapter:** Chapter 4 – ९ सम्मका सङ्ख्याहरू (Numbers up to 9)
- **Target Age Group:** 5 to 7 years
- **Module:** Centralized Simulation Library (`Explore Simulations`)
- **Navigation Breadcrumb:** `Teacher Dashboard → Explore Simulations → All Classes → Class 1 → Mathematics → Chapter 4: Numbers up to 9 (९ सम्मका सङ्ख्याहरू) → Select Simulation → Launch`

---

## 2. Pedagogical Scope & Textbook Boundaries
1. **Scope of Numbers:**
   - Strictly numbers **1 through 9** (१ देखि ९ सम्म).
   - Zero (०), addition (+), subtraction (-), and numbers $\ge 10$ are excluded in adherence to CDC Grade 1 Chapter 4 guidelines.
2. **Key Mathematical Competencies:**
   - **Many and Few (धेरै र थोरै):** Comparing two groups of concrete objects, identifying which basket/group has more or fewer objects through 1-to-1 visual correspondence.
   - **One-to-One Counting:** Sequential counting of discrete real-world objects (1 mushroom, 2 butterflies, 3 rabbits, 4 apples, 5 balloons, 6 mangoes, 7 fish, 8 birds, 9 flowers) with single-touch confirmation preventing accidental skips or double-counts.
   - **Number Recognition:** Dual notation fluency across English numerals (`1–9`), Devanagari numerals (`१–९`), English number names (`One` to `Nine`), and Nepali number names (`एक` to `नौ`).
   - **Number Tracing & Writing:** Guided stroke paths with animated demonstration, starting dots, direction arrows, and touch/pointer slate tracing with forgiving tolerance for early child motor skills.
   - **Number Sequence & Ordering:** Ascending order (1–9 / १–९), missing number chains, before and after relationships, and stepping stone river adventure.
3. **Bilingual Presentation:**
   - Complete bilingual voice synthesis (Nepali & English) using Web Speech API with fallback narration.
   - Harmonic audio chimes synthesized dynamically via the Web Audio API without requiring external sound files.

---

## 3. Five-Simulation Architecture

| Code | Simulation Name (Nepali / English) | Type & Engine | Core Textbook Learning Activity |
|---|---|---|---|
| `SIM-MATH-G1-CH4-01` | **धेरै र थोरै चिनौँ**<br>Many and Few Adventure | 3D WebGL / Three.js | Interactive 3D marketplace stall with Basket A and Basket B. Procedurally generated 3D fruits/flowers, side-by-side comparison, 5 progressive stages, and 15-question audio assessment. |
| `SIM-MATH-G1-CH4-02` | **१ देखि ९ सम्म गनौँ**<br>Number Garden 1–9 | 2D/3D Interactive Nature Scene | Guided counting of living garden items (1 to 9). Tapping objects increments counter, plays sound chime, and displays dual numerals and bilingual names with celebratory completion. |
| `SIM-MATH-G1-CH4-03` | **वस्तु र सङ्ख्या मिलाऔँ**<br>Number Matching World | Dual-Column Interactive Matrix | Connecting groups of real-world objects (1–9) to English numerals (1–9), Devanagari numerals (१–९), English names, and Nepali names across 4 progressive rounds. |
| `SIM-MATH-G1-CH4-04` | **सङ्ख्या लेख्न सिकौँ**<br>Number Tracing and Writing Studio | SVG Vector & HTML5 Canvas Slate | Wooden chalkboard slate with guided stroke paths, animated stroke demonstration, starting dots, chalk color selector, and touch/mouse trace scoring for both Devanagari (१–९) and English (1–9). |
| `SIM-MATH-G1-CH4-05` | **सङ्ख्या क्रम मिलाऔँ**<br>Number Sequence Adventure | Interactive Adventure Mini-Games | 4 activity modes: River Stepping Stone Crossing (1 to 9), Card Ordering (Ascending train), Missing Numbers in Chain, and Before & After number recognition. |

---

## 4. Integration & Security
- Fully integrated into existing `SimulationPlayer.tsx` via `componentKey` routing.
- Real-time student progress saving through authenticated `/api/v1/simulation-activity/simulations/:code/progress` updating MongoDB.
- Dynamic counts reflected in Centralized Simulation Library hierarchy without hardcoding.

