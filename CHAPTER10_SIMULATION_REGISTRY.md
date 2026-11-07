# Class 1 Mathematics – Chapter 10: Addition up to 20 (योगफल २० सम्म आउने जोड)
## Simulation Registry and Metadata Specification

---

## 1. MongoDB Database Records (`simulations` collection)

### Simulation 1
- **Code:** `SIM-MATH-G1-CH10-01`
- **Title:** Addition Playground
- **Nepali Title:** जोड खेलमैदान
- **Component Key:** `class1-math-ch10-playground`
- **Runtime URL:** `/simulations/class1-math/ch10/playground`
- **Type:** `THREE_JS`
- **Difficulty:** `BEGINNER`
- **Estimated Duration:** 15 minutes
- **Grade:** `[1]`
- **Subject:** `MATH` (Mathematics)
- **Chapter Number:** 10
- **Chapter Name:** `Addition up to 20`
- **Chapter Name Nepali:** `योगफल २० सम्म आउने जोड`
- **Published:** `true`
- **Tags:** `['Class 1', 'Mathematics', 'Chapter 10', 'Addition up to 20', 'Playground', 'Grouping', '3D WebGL']`

### Simulation 2
- **Code:** `SIM-MATH-G1-CH10-02`
- **Title:** Make Ten Adventure
- **Nepali Title:** दश बनाएर जोडौँ
- **Component Key:** `class1-math-ch10-make-ten`
- **Runtime URL:** `/simulations/class1-math/ch10/make-ten`
- **Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Estimated Duration:** 15 minutes
- **Grade:** `[1]`
- **Subject:** `MATH` (Mathematics)
- **Chapter Number:** 10
- **Chapter Name:** `Addition up to 20`
- **Chapter Name Nepali:** `योगफल २० सम्म आउने जोड`
- **Published:** `true`
- **Tags:** `['Class 1', 'Mathematics', 'Chapter 10', 'Make Ten', 'Split Addend', 'Ten Frame', 'Addition Strategy']`

### Simulation 3
- **Code:** `SIM-MATH-G1-CH10-03`
- **Title:** Addition Equation Studio
- **Nepali Title:** जोड वाक्य निर्माण प्रयोगशाला
- **Component Key:** `class1-math-ch10-equation-studio`
- **Runtime URL:** `/simulations/class1-math/ch10/equation-studio`
- **Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Estimated Duration:** 15 minutes
- **Grade:** `[1]`
- **Subject:** `MATH` (Mathematics)
- **Chapter Number:** 10
- **Chapter Name:** `Addition up to 20`
- **Chapter Name Nepali:** `योगफल २० सम्म आउने जोड`
- **Published:** `true`
- **Tags:** `['Class 1', 'Mathematics', 'Chapter 10', 'Equation Studio', 'Three-Number Addition', 'Missing Addend']`

### Simulation 4
- **Code:** `SIM-MATH-G1-CH10-04`
- **Title:** Addition Block Builder
- **Nepali Title:** जोड ब्लक निर्माण खेल
- **Component Key:** `class1-math-ch10-block-builder`
- **Runtime URL:** `/simulations/class1-math/ch10/block-builder`
- **Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Estimated Duration:** 15 minutes
- **Grade:** `[1]`
- **Subject:** `MATH` (Mathematics)
- **Chapter Number:** 10
- **Chapter Name:** `Addition up to 20`
- **Chapter Name Nepali:** `योगफल २० सम्म आउने जोड`
- **Published:** `true`
- **Tags:** `['Class 1', 'Mathematics', 'Chapter 10', 'Block Builder', 'Ten Frame Houses', 'Color Addition']`

### Simulation 5
- **Code:** `SIM-MATH-G1-CH10-05`
- **Title:** Addition Challenge World
- **Nepali Title:** जोड चुनौती संसार
- **Component Key:** `class1-math-ch10-challenge-world`
- **Runtime URL:** `/simulations/class1-math/ch10/challenge-world`
- **Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Estimated Duration:** 15 minutes
- **Grade:** `[1]`
- **Subject:** `MATH` (Mathematics)
- **Chapter Number:** 10
- **Chapter Name:** `Addition up to 20`
- **Chapter Name Nepali:** `योगफल २० सम्म आउने जोड`
- **Published:** `true`
- **Tags:** `['Class 1', 'Mathematics', 'Chapter 10', 'Challenge World', 'Story Addition', 'Vertical Addition', 'Quiz']`

---

## 2. Platform Endpoints

- **Hierarchy Endpoint:**
  `GET /api/v1/simulation-activity/hierarchy`
  Returns Class 1 $\to$ MATH $\to$ Chapter 10 with `simulationCount: 5`.
- **Simulation Listing Endpoint:**
  `GET /api/v1/simulation-activity/simulations?gradeLevel=1&subjectCode=MATH&chapterNumber=10`
  Returns all 5 simulation documents.
- **Progress Endpoint:**
  `POST /api/v1/simulation-activity/simulations/:code/progress`
  `GET /api/v1/simulation-activity/simulations/:code/progress`

