# Class 1 Mathematics Chapter 4: Simulation Registry Specification

## 1. Chapter Metadata in Centralized Library
- **Grade Level:** 1
- **Subject Code:** `MATH`
- **Subject Name:** `Mathematics` (गणित)
- **Chapter Number:** 4
- **Chapter Title (English):** `Numbers up to 9`
- **Chapter Title (Nepali):** `९ सम्मका सङ्ख्याहरू`
- **Total Registered Simulations:** 5

---

## 2. Detailed Registry Entries

### Simulation 01: Many and Few Adventure
- **Code:** `SIM-MATH-G1-CH4-01`
- **Component Key:** `class1-math-ch4-many-few`
- **Title (English):** Many and Few Adventure
- **Title (Nepali):** धेरै र थोरै चिनौँ
- **Simulation Type:** `THREE_JS`
- **Difficulty:** `BEGINNER`
- **Runtime URL:** `/simulations/class1-math/ch4/many-few`
- **Tags:** `["class1", "mathematics", "many-few", "numbers", "comparison", "threejs", "3d"]`
- **Description:** Interactive 3D marketplace comparison of two baskets with apples, mangoes, and flowers to distinguish 'धेरै' (Many) and 'थोरै' (Few).

### Simulation 02: Number Garden 1–9
- **Code:** `SIM-MATH-G1-CH4-02`
- **Component Key:** `class1-math-ch4-garden`
- **Title (English):** Number Garden 1–9
- **Title (Nepali):** १ देखि ९ सम्म गनौँ
- **Simulation Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Runtime URL:** `/simulations/class1-math/ch4/garden`
- **Tags:** `["class1", "mathematics", "counting", "garden", "nature", "numbers-1-9"]`
- **Description:** Guided garden exploration counting 1 to 9 living items (mushrooms, butterflies, rabbits, apples, balloons, mangoes, fish, birds, flowers) with audio pronunciation.

### Simulation 03: Number Matching World
- **Code:** `SIM-MATH-G1-CH4-03`
- **Component Key:** `class1-math-ch4-matching`
- **Title (English):** Number Matching World
- **Title (Nepali):** वस्तु र सङ्ख्या मिलाऔँ
- **Simulation Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Runtime URL:** `/simulations/class1-math/ch4/matching`
- **Tags:** `["class1", "mathematics", "matching", "numerals", "nepali-numerals", "number-names"]`
- **Description:** Match sets of real-world objects to numerals in both Nepali (१–९) and English (1–9) and written number names across 4 progressive rounds.

### Simulation 04: Number Tracing and Writing Studio
- **Code:** `SIM-MATH-G1-CH4-04`
- **Component Key:** `class1-math-ch4-tracing`
- **Title (English):** Number Tracing and Writing Studio
- **Title (Nepali):** सङ्ख्या लेख्न सिकौँ
- **Simulation Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Runtime URL:** `/simulations/class1-math/ch4/tracing`
- **Tags:** `["class1", "mathematics", "tracing", "handwriting", "nepali-digits", "writing"]`
- **Description:** Digital wooden chalkboard slate with guided stroke paths, animated stroke demonstration, and touch/pointer handwriting canvas for numerals 1–9 and १–९.

### Simulation 05: Number Sequence Adventure
- **Code:** `SIM-MATH-G1-CH4-05`
- **Component Key:** `class1-math-ch4-sequence`
- **Title (English):** Number Sequence Adventure
- **Title (Nepali):** सङ्ख्या क्रम मिलाऔँ
- **Simulation Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Runtime URL:** `/simulations/class1-math/ch4/sequence`
- **Tags:** `["class1", "mathematics", "sequence", "order", "river-crossing", "missing-numbers"]`
- **Description:** Stepping stone river crossing adventure, card ordering in ascending sequence, missing number puzzles, and before/after number relationships.

---

## 3. Database Schema Verification (MongoDB)
All documents are stored in the `simulations` collection with:
```json
{
  "_id": "ObjectId(...)",
  "code": "SIM-MATH-G1-CH4-01",
  "componentKey": "class1-math-ch4-many-few",
  "gradeLevels": [1],
  "subjectCode": "MATH",
  "chapterNumber": 4,
  "isActive": true
}
```
Progress records are stored in `simulation_activities` indexed by `simulationCode`, `studentId`, and `schoolId`.

