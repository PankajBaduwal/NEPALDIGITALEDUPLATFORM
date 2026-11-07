# Class 1 Mathematics – Chapter 9: Numbers 11–20 (११ देखि २० सम्मका सङ्ख्याहरू)
## Simulation Registry and Metadata Specification

---

## 1. Registered Simulation Documents in MongoDB (`simulations` collection)

### Simulation 1
- **Code:** `SIM-MATH-G1-CH9-01`
- **Title:** Number Garden 11–20
- **Nepali Title:** ११ देखि २० सम्मको सङ्ख्या बगैँचा
- **Component Key:** `class1-math-ch9-garden`
- **Runtime URL:** `/simulations/class1-math/ch9/garden`
- **Type:** `THREE_JS`
- **Difficulty:** `BEGINNER`
- **Estimated Duration:** 15 minutes
- **Grade:** `[1]`
- **Subject:** `MATH` (Mathematics)
- **Chapter:** 9 (Numbers 11 to 20 / ११ देखि २० सम्मका सङ्ख्याहरू)
- **Published:** `true`
- **Tags:** `['Class 1', 'Mathematics', 'Chapter 9', 'Numbers 11-20', 'Counting', 'Garden', '3D WebGL']`

### Simulation 2
- **Code:** `SIM-MATH-G1-CH9-02`
- **Title:** Make a Group of Ten
- **Nepali Title:** दशको समूह बनाऔँ
- **Component Key:** `class1-math-ch9-group-ten`
- **Runtime URL:** `/simulations/class1-math/ch9/group-ten`
- **Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Estimated Duration:** 15 minutes
- **Grade:** `[1]`
- **Subject:** `MATH` (Mathematics)
- **Chapter:** 9 (Numbers 11 to 20 / ११ देखि २० सम्मका सङ्ख्याहरू)
- **Published:** `true`
- **Tags:** `['Class 1', 'Mathematics', 'Chapter 9', 'Group of Ten', 'Tens and Ones', '10 Plus N']`

### Simulation 3
- **Code:** `SIM-MATH-G1-CH9-03`
- **Title:** Tens and Ones Explorer
- **Nepali Title:** दहाइ र एकाइ पत्ता लगाऔँ
- **Component Key:** `class1-math-ch9-tens-ones`
- **Runtime URL:** `/simulations/class1-math/ch9/tens-ones`
- **Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Estimated Duration:** 15 minutes
- **Grade:** `[1]`
- **Subject:** `MATH` (Mathematics)
- **Chapter:** 9 (Numbers 11 to 20 / ११ देखि २० सम्मका सङ्ख्याहरू)
- **Published:** `true`
- **Tags:** `['Class 1', 'Mathematics', 'Chapter 9', 'Place Value', 'Tens', 'Ones', 'Dahai Ekai']`

### Simulation 4
- **Code:** `SIM-MATH-G1-CH9-04`
- **Title:** Number Line Adventure
- **Nepali Title:** सङ्ख्यारेखाको साहसिक यात्रा
- **Component Key:** `class1-math-ch9-number-line`
- **Runtime URL:** `/simulations/class1-math/ch9/number-line`
- **Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Estimated Duration:** 15 minutes
- **Grade:** `[1]`
- **Subject:** `MATH` (Mathematics)
- **Chapter:** 9 (Numbers 11 to 20 / ११ देखि २० सम्मका सङ्ख्याहरू)
- **Published:** `true`
- **Tags:** `['Class 1', 'Mathematics', 'Chapter 9', 'Number Line', 'Before After', 'Sequence']`

### Simulation 5
- **Code:** `SIM-MATH-G1-CH9-05`
- **Title:** Number Ordering and Challenge World
- **Nepali Title:** सङ्ख्या मिलाउने चुनौती संसार
- **Component Key:** `class1-math-ch9-challenge-world`
- **Runtime URL:** `/simulations/class1-math/ch9/challenge-world`
- **Type:** `HTML5_CANVAS`
- **Difficulty:** `BEGINNER`
- **Estimated Duration:** 15 minutes
- **Grade:** `[1]`
- **Subject:** `MATH` (Mathematics)
- **Chapter:** 9 (Numbers 11 to 20 / ११ देखि २० सम्मका सङ्ख्याहरू)
- **Published:** `true`
- **Tags:** `['Class 1', 'Mathematics', 'Chapter 9', 'Number Names', 'Ordering', 'Ascending', 'Challenge']`

---

## 2. API Endpoints

- **Hierarchy Discovery:**
  `GET /api/v1/simulation-activity/hierarchy`
  Returns Grade 1 $\to$ MATH $\to$ Chapter 9 with `simulationCount: 5`.
- **Filtered List:**
  `GET /api/v1/simulation-activity/simulations?gradeLevel=1&subjectCode=MATH&chapterNumber=9`
  Returns the array of 5 published simulation records.
- **Progress Tracking:**
  `POST /api/v1/simulation-activity/simulations/:code/progress`
  `GET /api/v1/simulation-activity/simulations/:code/progress`

