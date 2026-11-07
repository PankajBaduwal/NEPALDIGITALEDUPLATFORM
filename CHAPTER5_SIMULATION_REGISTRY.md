# Class 1 Mathematics Chapter 5: Simulation Registry Specification

## 1. Chapter Metadata in Centralized Library
- **Grade Level:** 1
- **Subject Code:** `MATH`
- **Subject Name:** `Mathematics` (गणित)
- **Chapter Number:** 5
- **Chapter Title (English):** `Zero`
- **Chapter Title (Nepali):** `शून्य`
- **Total Registered Simulations:** 5

---

## 2. Detailed Registry Records

### Simulation 01: The Zero Discovery Playground
- **Code:** `SIM-MATH-G1-CH5-01`
- **Component Key:** `class1-math-ch5-playground`
- **Title (English):** The Zero Discovery Playground
- **Title (Nepali):** शून्य चिनौँ
- **Simulation Type:** `THREE_JS`
- **Difficulty:** `BEGINNER`
- **Runtime URL:** `/simulations/class1-math/ch5/playground`
- **Tags:** `["Class 1", "Mathematics", "Chapter 5", "Zero", "Shunya", "3D WebGL"]`
- **Description:** Explore a 3D village playground to discover situations where no objects remain, understanding zero (०) as an empty group.

### Simulation 02: Empty Basket Adventure
- **Code:** `SIM-MATH-G1-CH5-02`
- **Component Key:** `class1-math-ch5-empty-basket`
- **Title (English):** Empty Basket Adventure
- **Title (Nepali):** खाली टोकरी चिनौँ
- **Simulation Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Runtime URL:** `/simulations/class1-math/ch5/empty-basket`
- **Tags:** `["Class 1", "Mathematics", "Chapter 5", "Empty Basket", "Zero", "Containers"]`
- **Description:** Explore village market containers, trays, pots, and boxes to count objects and identify empty collections with zero (०).

### Simulation 03: Where Did Everything Go?
- **Code:** `SIM-MATH-G1-CH5-03`
- **Component Key:** `class1-math-ch5-where-did-it-go`
- **Title (English):** Where Did Everything Go?
- **Title (Nepali):** वस्तुहरू कहाँ गए?
- **Simulation Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Runtime URL:** `/simulations/class1-math/ch5/where-did-it-go`
- **Tags:** `["Class 1", "Mathematics", "Chapter 5", "Object Departure", "Zero"]`
- **Description:** Watch birds fly away from branches, ducks swim away, and fruits taken until nothing remains, seeing the count drop to zero (०).

### Simulation 04: Count the Village
- **Code:** `SIM-MATH-G1-CH5-04`
- **Component Key:** `class1-math-ch5-count-village`
- **Title (English):** Count the Village
- **Title (Nepali):** गाउँमा गनौँ
- **Simulation Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Runtime URL:** `/simulations/class1-math/ch5/count-village`
- **Tags:** `["Class 1", "Mathematics", "Chapter 5", "Village", "Counting", "Zero"]`
- **Description:** Explore various locations in a Nepalese village to count people, animals, and objects, identifying places with zero objects.

### Simulation 05: Zero Challenge
- **Code:** `SIM-MATH-G1-CH5-05`
- **Component Key:** `class1-math-ch5-zero-challenge`
- **Title (English):** Zero Challenge
- **Title (Nepali):** शून्यको खेल
- **Simulation Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Runtime URL:** `/simulations/class1-math/ch5/zero-challenge`
- **Tags:** `["Class 1", "Mathematics", "Chapter 5", "Zero Challenge", "Mastery"]`
- **Description:** Master zero through interactive challenges comparing empty vs occupied groups, counting scenes, and removing objects.

---

## 3. Database Schema Verification (MongoDB)
All 5 documents are persisted in `simulations` with:
- `gradeLevels: [1]`
- `subjectCode: "MATH"`
- `chapterNumber: 5`
- `isPublished: true`
- `isActive: true`
- Unique `code` and `componentKey`.
Progress records are stored in `simulation_activities` collection and indexed by student, institution, and simulation code.

