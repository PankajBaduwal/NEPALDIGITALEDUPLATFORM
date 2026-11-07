# Class 1 Mathematics Chapter 5: Zero (शून्य) - Comprehensive Simulation Plan

## 1. Executive Summary & Curriculum Alignment
- **Jurisdiction:** Nepal Curriculum Development Centre (CDC / पाठ्यक्रम विकास केन्द्र, सानोठिमी, भक्तपुर)
- **Grade:** Class 1 (कक्षा १)
- **Subject:** Mathematics (मेरो गणित, २०७६)
- **Chapter:** Chapter 5 – शून्य (Zero)
- **Target Age Group:** 5 to 7 years
- **Module:** Centralized Simulation Library (`Explore Simulations`)
- **Navigation Breadcrumb:** `Teacher Dashboard → Explore Simulations → All Classes → Class 1 → Mathematics → Chapter 5: Zero (शून्य) → Select Simulation → Launch`

---

## 2. Pedagogical Objectives & Boundaries
1. **Core Mathematical Premise:**
   - **शून्य (०) means that there are no objects in a group or collection** ("कुनै समूहमा कुनै वस्तु छैन भने त्यसको सङ्ख्या शून्य (०) हुन्छ").
   - Concrete-Pictorial-Abstract progression: children count living/tangible objects, observe or cause them to depart one by one ($N \to \dots \to 1 \to 0$), and discover that an empty collection equals zero (० / 0).
2. **Pedagogical Constraints:**
   - Strictly NO negative numbers, integers, place values, or formal algebraic notation.
   - Strictly avoid turning this chapter into formal addition and subtraction equations.
   - Use familiar real-world contexts: village playground, baskets of apples, tree branches with birds, pond with ducks, park bench, and animal enclosure.
3. **Bilingual Accessibility:**
   - Complete bilingual voice synthesis (Nepali `ne-NP` and English `en-US`) with Web Speech API.
   - Harmonic audio chimes generated dynamically using the Web Audio API without external asset dependencies.
   - Dual numeral notation: `०` (Devanagari) and `0` (International English) alongside names (`शून्य` / `Zero`).

---

## 3. Five-Simulation Breakdown

| Code | Simulation Name (Nepali / English) | Type & Engine | Core Textbook Learning Activity |
|---|---|---|---|
| `SIM-MATH-G1-CH5-01` | **शून्य चिनौँ**<br>The Zero Discovery Playground | 3D WebGL / Three.js | 3D Himalayan village playground (tree, birds, pond, ducks, bench, people, basket table). 5 guided levels: Level 1 (What is zero? 3 apples removed $\to 0$), Level 2 (Empty vs occupied containers), Level 3 (Removing birds/ducks to reach zero), Level 4 (Spot zero in environment), Level 5 (12-question evaluation quiz), plus Free Exploration. |
| `SIM-MATH-G1-CH5-02` | **खाली टोकरी चिनौँ**<br>Empty Basket Adventure | Interactive Market Stall Canvas | Village market containers (baskets, pots, trays, boxes). Identify empty container, move items in and out, count items vs zero, and match empty containers with numeral ०. |
| `SIM-MATH-G1-CH5-03` | **वस्तुहरू कहाँ गए?**<br>Where Did Everything Go? | Dynamic Departure Scenes | Observational and interactive object departures: birds flying away from tree, ducks swimming away from pond, apples eaten from basket, balloons floating away. Decreasing count updates live until zero remainder. |
| `SIM-MATH-G1-CH5-04` | **गाउँमा गनौँ**<br>Count the Village | Scavenger Hunt & Comparative Matrix | Explore village locations (Pipal tree with birds vs dry tree, pond with ducks vs empty well, bench with people vs empty bench, occupied goat pen vs empty pen). Child counts both zero and non-zero groups. |
| `SIM-MATH-G1-CH5-05` | **शून्यको खेल**<br>Zero Challenge | Progressive Mastery Mini-Games | 5 progressive challenge levels: Level 1 (Identify empty container), Level 2 (Compare empty vs occupied), Level 3 (Count scenes with zero), Level 4 (Remainder after removal), Level 5 (Mixed zero mastery with star rewards). |

---

## 4. Platform Integration & Security
- Registered dynamically in MongoDB under Grade 1, Mathematics, Chapter 5.
- Directly routed in `SimulationPlayer.tsx` matching each simulation's `componentKey`.
- Real-time student progress saving through authenticated `/api/v1/simulation-activity/simulations/:code/progress`.
- Full regression safety verified across Chapters 1 to 4.

