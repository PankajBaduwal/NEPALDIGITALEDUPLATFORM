# Mathematics activities, Classes 1–4

One auto-graded practice activity for every lesson: **111 activities, about 1,100 questions** (Class 1: 22 lessons, Class 2: 17, Class 3: 22, Class 4: 15, Class 5: 15, Class 6: 20).

They live in the existing Activity system, so students find them under Activities, teachers can assign them to a class or section, and attempts are scored and stored like any other activity. Codes look like `ACT-C4-MTH-L5`; subject code `MTH`.

Question types used (all graded automatically): multiple choice, true/false, numerical answer, fill in the blanks, ordering (arrange numbers), matching, and sorting (drag into groups). Numbers are random each time the seed runs, and the right answer is worked out from the numbers shown.

| Class | Lessons covered |
|---|---|
| 1 | direction and distance, long/short, shapes, numbers 1–10 and zero, addition and subtraction to 20 and to 100, odd/even, number names, ordinals, Devanagari numerals, time, coins and notes, length, pictograph |
| 2 | capacity, calendar and clock, numbers to 1000, comparison, odd/even, weight, addition, subtraction, length, area, multiplication, fraction, shapes and solids, pictograph, currency, division |
| 3 | time, five-digit numbers, comparison, patterns, ordering, local numerals, fraction, length, lines, angles, shapes, the four operations, time 2, money, capacity, weight, pictograph, area |
| 4 | angles, plane figures, solids, number sense (lakh system, rounding), operations, fraction/decimal/percent, 24-hour time, currency, distance, capacity, weight, perimeter and area, bill and budget, bar diagram, algebra |
| 5 | lines and angles, solid objects, crore numbers, simplification (BODMAS), fraction, decimal, percentage, time, distance, capacity, weight, perimeter-area-volume, bill and budget, presentation of data, algebraic expressions |
| 6 | set, whole numbers (factors, HCF, LCM), integers, fraction, decimal, percentage, profit and loss, unitary method, distance, area and volume, indices, algebraic expression, equation-inequality-graph, lines and angles, plane shapes, circle, solid objects, co-ordinate geometry, symmetry and tessellation, statistics |

## For developers

- Question builders: `backend/src/scripts/mathActivityKit.ts` (`G.addN`, `G.fracMcq`, `G.units`, ...) and, for Classes 5 and 6, `mathActivityKit56.ts` (`H.bodmas`, `H.hcf`, `H.setOps`, ...). Lesson table: `backend/src/scripts/seedMathActivities.ts`.
- Register or refresh: `npm run seed:math-activities` (in `backend`). It replaces the questions of each activity by code; it does not touch the older `ACT-C1-...` activities.
- Add or change a lesson: edit its line in the `C1`–`C6` tables, listing the generators to cycle through; ten questions are built without repeating a prompt.
- Content is based on the lesson titles and the usual curriculum, not on the book's own exercises.
