# Class 1 Mathematics – Chapter 10: Addition up to 20 (योगफल २० सम्म आउने जोड)
## Comprehensive Simulation Development Plan

**Project:** Nepal Digital Education Platform  
**Target Class:** Grade 1  
**Subject:** Mathematics (गणित)  
**Curriculum Guide:** मेरो गणित, कक्षा १ (२०७६), पाठ्यक्रम विकास केन्द्र (CDC)  
**Chapter:** 10 – Addition up to 20 (योगफल २० सम्म आउने जोड)  
**Location:** Centralized Simulation Library (`Teacher Dashboard → Explore Simulations → Class 1 → Mathematics → Chapter 10`)

---

## 1. Executive Summary & Pedagogical Foundations

Chapter 10 builds on single-digit addition (Chapter 7) and multi-digit recognition (Chapter 9) by extending addition to totals up to 20.

### Primary Pedagogical Objectives:
1. **Addition as Physical Combining:** Combining two or more groups of concrete objects (fruits, birds, balloons, blocks) into a single common set and counting the total.
2. **Make-10 Strategy (दश बनाउने विधि):** Decomposing the second addend into two parts to first complete 10, then adding the remainder ($8 + 5 = 8 + 2 + 3 = 10 + 3 = 13$).
3. **Multi-Addend Equations:** Adding three numbers ($4 + 6 + 5 = 10 + 5 = 15$) where finding the make-10 pair simplifies calculation.
4. **Equation Representation Diversity:** Solving equations horizontally ($7 + 8 = 15$) and vertically ($\begin{matrix} 8 \\ + 7 \\ \hline 15 \end{matrix}$), as well as finding missing addends ($12 + [\,] = 17$).
5. **Dual Numeral & Verbal Fluency:** Real-time bilingual toggling between Devanagari numerals ($८ + ५ = १३$) and English numerals ($8 + 5 = 13$) with native speech synthesis.

---

## 2. Five Centralized Chapter 10 Simulations

| No. | Simulation Title | Nepali Title | Code | Component Key | Type | Core Concept |
|:---:|---|---|---|---|---|---|
| **01** | **Addition Playground** | जोड खेलमैदान | `SIM-MATH-G1-CH10-01` | `class1-math-ch10-playground` | Three.js 3D WebGL | Object grouping, Basket A + Basket B leaping into central rug, total counting $\le 20$ |
| **02** | **Make Ten Adventure** | दश बनाएर जोडौँ | `SIM-MATH-G1-CH10-02` | `class1-math-ch10-make-ten` | Interactive Canvas | Make-10 decomposition, split second addend ($8+5 = 8+2+3 = 10+3 = 13$) |
| **03** | **Addition Equation Studio** | जोड वाक्य निर्माण प्रयोगशाला | `SIM-MATH-G1-CH10-03` | `class1-math-ch10-equation-studio` | Interactive Canvas | Picture to equation, horizontal addition, 3-number addition, missing addends |
| **04** | **Addition Block Builder** | जोड ब्लक निर्माण खेल | `SIM-MATH-G1-CH10-04` | `class1-math-ch10-block-builder` | Interactive Canvas | Dual ten-frame houses with red and blue blocks, full frame completion |
| **05** | **Addition Challenge World** | जोड चुनौती संसार | `SIM-MATH-G1-CH10-05` | `class1-math-ch10-challenge-world` | Interactive Canvas | 5 village stations: Fruit Shop, Bird Garden, Toy House, Vertical Workshop, Master Quiz |

---

## 3. Platform Architecture & Integration Guarantees

- **Centralized Explore Simulations:** Fully discoverable under `All Classes → Class 1 → Mathematics → Chapter 10: योगफल २० सम्म आउने जोड`.
- **Dynamic Count:** Chapter 10 displays exactly `simulationCount: 5`.
- **Player Routing:** Seamless dispatch via [`SimulationPlayer.tsx`](file:///c:/Users/Admin/Desktop/NEPALEDUPLATFROM/frontend/src/components/simulations/SimulationPlayer.tsx).
- **Progress Tracking:** Synchronized to `/api/v1/simulation-activity/simulations/:code/progress`.

