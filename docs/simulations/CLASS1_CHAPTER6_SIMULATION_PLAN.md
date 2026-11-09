# Class 1 Mathematics Chapter 6: Ten (दश) - Comprehensive Simulation Plan

## 1. Executive Summary & Curriculum Alignment
- **Jurisdiction:** Nepal Curriculum Development Centre (CDC / पाठ्यक्रम विकास केन्द्र, सानोठिमी, भक्तपुर)
- **Grade:** Class 1 (कक्षा १)
- **Subject:** Mathematics (मेरो गणित, २०७६)
- **Chapter:** Chapter 6 – दश (Ten)
- **Target Age Group:** 5 to 7 years
- **Module:** Centralized Simulation Library (`Explore Simulations`)
- **Navigation Breadcrumb:** `Teacher Dashboard → Explore Simulations → All Classes → Class 1 → Mathematics → Chapter 6: Ten (दश) → Select Simulation → Launch`

---

## 2. Pedagogical Objectives & Boundaries
1. **Core Mathematical Concepts:**
   - **Quantity of Ten:** Concrete understanding of a collection of exactly 10 distinct objects.
   - **Counting 1 to 10:** Sequential, non-double-counting counting from 1 through 10.
   - **Numeral & Word Recognition:** Recognizing the numeral `10` (International) and `१०` (Devanagari), and word names `Ten` and `दश`.
   - **Partitions / Combinations of Ten:** Physical and visual partitioning of 10 into two groups ($1+9=10, 2+8=10, 3+7=10, 4+6=10, 5+5=10$ and their commutative reversals).
   - **Matching & Discrimination:** Identifying sets of exactly 10 among distractor sets of 7, 8, 9, or zero.
   - **Handwriting & Stroke Mechanics:** Guided motor-tracing of numerals `10` and `१०` on a digital chalkboard slate.
2. **Pedagogical Constraints:**
   - Strictly NO numbers greater than 10.
   - Strictly NO formal place-value abstraction (tens and units columns) or base-10 carry algorithms.
   - Strictly NO formal algebraic equations, negative numbers, or complex division.
   - Grounded in everyday Nepalese village contexts: orchards, apples, marigold flowers, clay pots, pencils, and picnic baskets.
3. **Bilingual Accessibility:**
   - Web Speech API integration supporting Nepali (`ne-NP`) and English (`en-US`).
   - Web Audio API harmonic sound effects synthesized in real time (no external audio latency).
   - Dual-language visual prompts, bilingual labels, and dual numeral notation (`10` / `१०`).

---

## 3. Five-Simulation Breakdown

| Code | Simulation Name (Nepali / English) | Type & Engine | Core Textbook Learning Activity |
|---|---|---|---|
| `SIM-MATH-G1-CH6-01` | **१० वटा वस्तुको यात्रा**<br>Ten Object Adventure | 3D WebGL / Three.js | 3D village orchard with apple tree, flower garden bed, collection table, and wicker basket. 5 guided levels: Level 1 (Count 1 to 10 on the tree with anti-double counting), Level 2 (Find the group of 10), Level 3 (Collect 10 items into basket), Level 4 (Free orchard exploration), Level 5 (15-question comprehensive quiz). |
| `SIM-MATH-G1-CH6-02` | **सङ्ख्या १० को खोजी**<br>Number Ten Discovery | Interactive Visual Pillars Canvas | Explore the 4 Pillars of Ten: Numeral 10, Numeral १०, Word "Ten", and Word "दश". Card picker among distractors (6, 7, 8, 9, 10), matching sets of 10 items, and dual-language vocal repetition. |
| `SIM-MATH-G1-CH6-03` | **१० बनाउने खेल**<br>Make Ten Challenge | Interactive Dual-Basket Partitioning | Physical partitioning of 10 items between Basket A and Basket B. Interactive drag/move items, preset combinations ($1+9, 2+8, 3+7, 4+6, 5+5$), and missing-item make-ten puzzles ($7 + ? = 10$). |
| `SIM-MATH-G1-CH6-04` | **गन्ती गरौँ र १० मिलाऔँ**<br>Count and Match Ten | Multi-Scene Village Counting Canvas | 5 diverse scenes (Village Garden, Lotus Pond, Classroom, Local Market, Apple Orchard). Tap to count items, discriminate sets of 10 from non-10, and drag/click to match with numeral card १० / 10. |
| `SIM-MATH-G1-CH6-05` | **सङ्ख्या १० लेख्ने अभ्यास**<br>Number Ten Writing Studio | Digital Slate Canvas with SVG Tracing | Digital wooden-frame chalkboard slate. Guided stroke-by-stroke tracing for English `10` (stroke 1 down, stroke 0 circle) and Devanagari `१०` (१ spiral down, ० circle). Animated stroke demonstration, chalk color palette, and tolerance-based stroke evaluation. |

---

## 4. Platform Architecture & Data Flow
- **Centralized Registry:** Registered dynamically in MongoDB under Grade 1, Mathematics, Chapter 6 (`simulationCount: 5`).
- **Dynamic Routing:** Routed seamlessly inside `SimulationPlayer.tsx` matching each simulation's `componentKey`.
- **Progress Tracking:** All simulations make authenticated `POST /api/v1/simulation-activity/simulations/:code/progress` calls on completion or assessment.
- **Regression Safety:** Verified backwards compatibility with Chapters 1, 2, 3, 4, and 5.

