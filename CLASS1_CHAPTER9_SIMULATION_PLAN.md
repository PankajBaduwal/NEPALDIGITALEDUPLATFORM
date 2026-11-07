# Class 1 Mathematics – Chapter 9: Numbers 11–20 (११ देखि २० सम्मका सङ्ख्याहरू)
## Comprehensive Simulation Development Plan

**Project:** Nepal Digital Education Platform  
**Target Class:** Grade 1  
**Subject:** Mathematics (गणित)  
**Curriculum Guide:** मेरो गणित, कक्षा १ (२०७६), पाठ्यक्रम विकास केन्द्र (CDC)  
**Chapter:** 9 – Numbers 11 to 20 (११ देखि २० सम्मका सङ्ख्याहरू)  
**Location:** Centralized Simulation Library (`Teacher Dashboard → Explore Simulations → Class 1 → Mathematics → Chapter 9`)

---

## 1. Executive Summary & Pedagogical Foundations

Chapter 9 marks a foundational milestone in Grade 1 mathematics by transitioning children beyond single-digit quantities (0–10) into multi-digit numbers and early place value understanding (11–20). 

### Primary Conceptual Milestones:
1. **Quantity Extension (11 to 20):** Counting physical and visual objects accurately without skipping or double-counting.
2. **Concept of a Group of Ten ($10 + N$):** Comprehending that numbers from 11 to 19 consist of **one ten** plus additional **ones** (e.g., $10 + 4 = 14$), and that 20 consists of **two tens** ($10 + 10 = 20$).
3. **Place Value Introduction (दहाइ र एकाइ):** Organizing quantities into Tens (दहाइ) and Ones (एकाइ) columns using ten-rods and unit cubes.
4. **Number Line Relationships:** Navigating stepping stones from 0 to 20 to intuitively grasp the number before, the number after, the number between, and sequence gaps.
5. **Numeral & Verbal Literacy:** Recognizing dual numerals ($11 \leftrightarrow ११$), pronunciation, and word names (एघार देखि बीस).

---

## 2. Five Centralized Chapter 9 Simulations

| No. | Simulation Title | Nepali Title | Code | Component Key | Type | Core Concept |
|---|---|---|---|---|---|---|
| **01** | Number Garden 11–20 | ११ देखि २० सम्मको सङ्ख्या बगैँचा | `SIM-MATH-G1-CH9-01` | `class1-math-ch9-garden` | Three.js 3D WebGL | Object counting 11–20, anti-double-counting locks, garden scene |
| **02** | Make a Group of Ten | दशको समूह बनाऔँ | `SIM-MATH-G1-CH9-02` | `class1-math-ch9-group-ten` | Interactive Canvas | Ten-unit bundling, $10 + N$ breakdown, Devanagari equations |
| **03** | Tens and Ones Explorer | दहाइ र एकाइ पत्ता लगाऔँ | `SIM-MATH-G1-CH9-03` | `class1-math-ch9-tens-ones` | Interactive Canvas | Place value chart, ten-rods (दहाइ) and unit cubes (एकाइ) |
| **04** | Number Line Adventure | सङ्ख्यारेखाको साहसिक यात्रा | `SIM-MATH-G1-CH9-04` | `class1-math-ch9-number-line` | Interactive Canvas | 0–20 stepping stones, before, after, between, and sequence gaps |
| **05** | Number Ordering Challenge World | सङ्ख्या मिलाउने चुनौती संसार | `SIM-MATH-G1-CH9-05` | `class1-math-ch9-challenge-world` | Interactive Canvas | Word names (एघार–बीस), smallest/largest, ascending/descending train |

---

## 3. Platform Integration Strategy

- **Zero Duplication:** No separate apps or isolated teacher dashboards were created; integrated directly into the centralized `SimulationPlayer.tsx` and MongoDB `simulations` collection.
- **Dynamic Hierarchy Count:** Chapter 9 reports exactly `simulationCount: 5` dynamically fetched via `/api/v1/simulation-activity/hierarchy`.
- **Bilingual Interface:** Instant real-time toggle between Nepali (`np`) and English (`en`) with Nepali Web Speech synthesis.
- **Progress Synchronization:** Every simulation pushes activity sessions, completion status, metrics, and star awards to `/api/v1/simulation-activity/simulations/:code/progress`.

