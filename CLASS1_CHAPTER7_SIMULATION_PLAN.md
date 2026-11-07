# Class 1 Mathematics Chapter 7: Addition up to 10 (योगफल १० सम्म आउने जोड) - Comprehensive Simulation Plan

## 1. Executive Summary & Curriculum Alignment
- **Jurisdiction:** Nepal Curriculum Development Centre (CDC / पाठ्यक्रम विकास केन्द्र, सानोठिमी, भक्तपुर)
- **Grade:** Class 1 (कक्षा १)
- **Subject:** Mathematics (मेरो गणित, २०७६)
- **Chapter:** Chapter 7 – योगफल १० सम्म आउने जोड (Addition up to 10)
- **Target Age Group:** 5 to 7 years
- **Module:** Centralized Simulation Library (`Explore Simulations`)
- **Navigation Breadcrumb:** `Teacher Dashboard → Explore Simulations → All Classes → Class 1 → Mathematics → Chapter 7 – Addition up to 10 → Select Simulation → Launch`

---

## 2. Pedagogical Objectives & Boundaries
1. **Core Mathematical Concepts:**
   - **Addition as Combining Groups:** Understanding addition as putting two physical or visual groups together into one collection.
   - **Counting & Enumeration:** Counting objects in Group A, counting objects in Group B, and finding the combined total.
   - **Mathematical Symbols:** Connecting concrete objects with the plus sign (`+`) and the equals sign (`=`).
   - **Counting-On Strategy:** Developing computational fluency by starting from the first number and counting forward for the second group ($3 + 2 \implies 3, \text{then } 4, 5$).
   - **Number Combinations (Number Bonds):** Partitioning numbers up to 10 into complementary pairs (making 5: $0+5, 1+4, 2+3$; making 10: $1+9, 2+8, 3+7, 4+6, 5+5$).
   - **Addition with Zero:** Concrete realization that adding zero to any number leaves the quantity unchanged ($A + 0 = A, 0 + B = B, 0 + 0 = 0$).
2. **Pedagogical Constraints:**
   - **Upper Bound:** All addends and sums strictly $\le 10$.
   - **No Advanced Formalism:** Strictly NO carrying, vertical column addition, subtraction, or algebraic equations.
   - **CPA Progression:** Concrete objects $\to$ Visual groups $\to$ Counting $\to$ Number sentences $\to$ Independent practice.
3. **Bilingual Accessibility:**
   - Full bilingual speech synthesis with the Web Speech API (`ne-NP` and `en-US`).
   - Dynamic real-time acoustic synthesis via the Web Audio API without external file dependencies.
   - Dual numeral notation (`२ + ३ = ५` and `2 + 3 = 5`).

---

## 3. Five-Simulation Breakdown

| Code | Simulation Name (Nepali / English) | Type & Engine | Core Textbook Learning Activity |
|---|---|---|---|
| `SIM-MATH-G1-CH7-01` | **जोड्ने खेलमैदान**<br>Addition Playground | 3D WebGL / Three.js | 3D village playground with Basket A, Basket B, and Center Combined Basket. 5 levels: Level 1 (Understanding addition with animated basket merge), Level 2 (Combining preset pairs and selecting answer), Level 3 (Building custom sums $\le 10$), Level 4 (Addition with zero), Level 5 (15-question quiz), plus Free Exploration. |
| `SIM-MATH-G1-CH7-02` | **जम्मा सङ्ख्या पत्ता लगाऔँ**<br>Make the Total | Interactive Pictorial Canvas | Visual scenes in village gardens and markets (baskets of apples, perched birds and arriving birds, potted flowers, fish in pond, toy boxes). Count Group A, count Group B, find combined total. |
| `SIM-MATH-G1-CH7-03` | **सङ्ख्याका घरहरू**<br>Number Bond Houses | Interactive 2-Room Houses | Number houses for making 5, 6, 7, 8, 9, and 10. Total on roof, two number rooms below. Interactive object distribution and missing-part challenge mode ($4 + ? = 10$). |
| `SIM-MATH-G1-CH7-04` | **गनेर जोडौँ**<br>Count On Adventure | Stepping-Stone Canvas | Stepping-stone path from 0 to 10 with animated character. Start at the first number and step forward by the second number with spoken number prompts ($3 + 2 \implies$ 4, 5). |
| `SIM-MATH-G1-CH7-05` | **जोडका वाक्य बनाऔँ**<br>Addition Equation Studio | Chalkboard Equation Board | Digital chalkboard connecting physical object groups with mathematical cards `+` and `=`. Complete missing number sentences and build verified addition sentences. |

---

## 4. Platform Architecture & Data Flow
- **Centralized Registry:** Registered dynamically in MongoDB under Grade 1, Mathematics, Chapter 7 (`simulationCount: 5`).
- **Dynamic Routing:** Routed seamlessly inside `SimulationPlayer.tsx` matching each simulation's `componentKey`.
- **Progress Tracking:** All simulations make authenticated `POST /api/v1/simulation-activity/simulations/:code/progress` calls on completion or assessment.
- **Regression Safety:** Verified backwards compatibility with Chapters 1, 2, 3, 4, 5, and 6.

