# Class 1 Mathematics Chapter 8: Subtraction up to 10 (१० सम्मका सङ्ख्याहरूको घटाउ) - Comprehensive Simulation Plan

## 1. Executive Summary & Curriculum Alignment
- **Jurisdiction:** Nepal Curriculum Development Centre (CDC / पाठ्यक्रम विकास केन्द्र, सानोठिमी, भक्तपुर)
- **Grade:** Class 1 (कक्षा १)
- **Subject:** Mathematics (मेरो गणित, २०७६)
- **Chapter:** Chapter 8 – १० सम्मका सङ्ख्याहरूको घटाउ (Subtraction up to 10)
- **Target Age Group:** 5 to 7 years
- **Module:** Centralized Simulation Library (`Explore Simulations`)
- **Navigation Breadcrumb:** `Teacher Dashboard → Explore Simulations → All Classes → Class 1 → Mathematics → Chapter 8: १० सम्मका सङ्ख्याहरूको घटाउ → Select Simulation → Launch`

---

## 2. Pedagogical Objectives & Boundaries
1. **Core Mathematical Concepts:**
   - **Subtraction as Taking Away:** Understanding subtraction by physically or visually removing objects from an initial collection and counting the remaining remainder.
   - **Concrete-Pictorial-Abstract (CPA) Progression:** Tangible objects (apples, bananas, birds, flowers, balls) $\to$ Picture scenes and removal animations $\to$ Horizontal equations ($5 - 2 = 3$) and vertical equations $\to$ Independent practice.
   - **Subtraction of Zero:** Concrete observation that taking away 0 objects leaves the original quantity unchanged ($A - 0 = A$).
   - **Horizontal and Vertical Subtraction:** Fluency with both horizontal formatting ($8 - 3 = 5$) and vertical column formatting ($\begin{array}{r} 7 \\ - 3 \\ \hline 4 \end{array}$).
   - **Comparison and Numerical Difference:** Comparing two sets of items using one-to-one matching to identify "how many more?" and "how many fewer?" ($A - B = \text{Difference}$).
   - **Missing-Number Equations:** Solving equations with missing subtrahend or minuend ($6 - [ ] = 4$, $[ ] - 2 = 5$).
2. **Pedagogical Constraints:**
   - All minuends, subtrahends, and remainders strictly within the range $0 - 10$.
   - Strictly NO negative numbers, borrowing, or multi-digit column mechanics.
3. **Bilingual Accessibility:**
   - Web Speech API voice synthesis in Nepali (`ne-NP`) and English (`en-US`).
   - Dynamic real-time Web Audio API synthesized tones without external media latency.
   - Devanagari numerals (`०` to `१०`) and English numerals (`0` to `10`).

---

## 3. Five-Simulation Breakdown

| Code | Simulation Name (Nepali / English) | Type & Engine | Core Textbook Learning Activity |
|---|---|---|---|
| `SIM-MATH-G1-CH8-01` | **घटाउ खेलमैदान**<br>Subtraction Playground | 3D WebGL / Three.js | 3D playground with apples, bananas, flowers, and balls. Children click/drag objects into the removal basket, track remaining items in real-time, progress through 4 levels (remove 1, remove 2-3, subtract within 10, zero subtraction), and complete a 15-question evaluation quiz plus free exploration. |
| `SIM-MATH-G1-CH8-02` | **टोकरी खाली गर्ने साहसिक खेल**<br>Empty the Basket Adventure | Interactive Container Canvas | Remove objects from authentic containers: Fruit Basket ($8 - 3 = 5$), Toy Box ($7 - 4 = 3$), Bird Nest ($6 - 2 = 4$), and Zero Subtraction in Flower Pot ($5 - 0 = 5$). Before-and-after comparison and dynamic counters. |
| `SIM-MATH-G1-CH8-03` | **घटाउ वाक्य निर्माण प्रयोगशाला**<br>Subtraction Equation Studio | Mathematical Equation Board | Convert visual subtraction into horizontal ($5 - 2 = 3$) and vertical ($\begin{array}{r} 7 \\ - 3 \\ \hline 4 \end{array}$) equations, place minus (`−`) and equals (`=`) signs, and solve missing-number challenges ($6 - [ ] = 4, [ ] - 2 = 5$). |
| `SIM-MATH-G1-CH8-04` | **बढी र कम पत्ता लगाऔँ**<br>More or Less – Difference Explorer | One-to-One Comparison Canvas | Compare two groups (boys vs girls, bicycles vs children, apples vs bananas) using one-to-one pair matching. Unmatched objects highlight the numerical difference to answer "How many more?" and "How many fewer?". |
| `SIM-MATH-G1-CH8-05` | **घटाउ चुनौती संसार**<br>Subtraction Challenge World | 5-Station Village Canvas | Explore 5 interactive village stations (Fruit Shop, Bird Garden, Toy House, Flower Garden, Challenge Station) to solve mixed subtraction problems, measure accuracy, and record chapter mastery. |

---

## 4. Platform Architecture & Data Flow
- **Centralized Registry:** Registered dynamically in MongoDB under Grade 1, Mathematics, Chapter 8 (`simulationCount: 5`).
- **Dynamic Routing:** Routed seamlessly inside `SimulationPlayer.tsx` matching each simulation's `componentKey`.
- **Progress Tracking:** All simulations make authenticated `POST /api/v1/simulation-activity/simulations/:code/progress` calls on completion or assessment.
- **Regression Safety:** Verified backwards compatibility with Chapters 1 through 7.

