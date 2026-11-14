# Class 3 Mathematics — simulations by lesson

Book: *My Mathematics, Grade 3* (CDC Nepal, 22 lessons). Every simulation is 3D (Three.js) and has three modes: **Learn** (guided, the bear speaks Nepali or English), **Play** (free exploring or a short game) and **Challenge** (eight questions, stars, progress saved).

| Lesson | Topic | Simulation | What the child does |
|---|---|---|---|
| 1 | Time 1 | **Minute Clock** | reads any time on a big clock: o'clock, half past, quarter past, quarter to and every minute |
| 2 | Five-digit numbers | **Five-Digit Towers** | five columns of cubes (ten-thousands to ones); builds, reads and writes numbers to 99,999; place value |
| 3 | Comparison of numbers | **Digit Duel** | two numbers on cards; compares place by place from the left; chooses >, < or = |
| 4 | Number patterns | **Pattern Train** | wagons follow a rule (add or subtract); finds the missing number |
| 5 | Ascending / descending order | **Order the Rockets** | taps rockets from small to big or big to small |
| 6 | Local numerals up to 20 | **Numeral Street** | signboards 1–20 in Hindu-Arabic, Devanagari and Roman numerals |
| 7 | Fraction | **Chocolate Fractions** | cuts a chocolate bar into equal pieces; reads numerator and denominator |
| 8 | Length 1 | **Metre and Centimetre** | builds lengths from metres and centimetres; 1 m = 100 cm |
| 9 | Lines | **Line Lab** | horizontal, vertical, slanting, curved, parallel and intersecting lines in 3D scenes |
| 10 | Angles | **Angle Lab** | opens two arms; compares with a right angle: smaller, right or larger |
| 11 | Geometrical shapes | **Face Explorer** | opens up a cube, cuboid, cylinder, cone or pyramid to show its flat faces |
| 12 | Addition | **Addition Column Towers** | adds five-digit numbers column by column with carrying |
| 13 | Subtraction | **Subtraction Column Towers** | subtracts column by column with borrowing |
| 14 | Multiplication | **Multiplication Trays** | equal trays of tens and ones: 2-digit × 1-digit |
| 14 | Multiplication | **Times-Table Wall** | a 10 × 10 wall of cubes: any table fact as rows and columns |
| 15 | Division | **Sharing Plates** | shares sweets one by one among plates; quotient and remainder |
| 16 | Time 2 | **Hours, Minutes and Seconds** | clock with three hands: 1 h = 60 min, 1 min = 60 s |
| 17 | Money | **Bill & Change Shop** | adds prices into a bill, pays with a note, subtracts to find the change |
| 18 | Capacity | **Litre and Millilitre** | fills a tank with litre bottles and millilitre cups; 1 L = 1000 mL |
| 19 | Length 2 | **Road Trip** | a car on a kilometre road; 1 km = 1000 m (and m ↔ cm) |
| 20 | Weight | **Kilogram and Gram** | 1 kg bags and 100 g weights on a scale; 1 kg = 1000 g |
| 21 | Pictograph | **Picture Graph** | one picture = 2, 5 or 10; half pictures; most, fewest, total |
| 22 | Area | **Tile the Rectangle** | covers a rectangle with square tiles; area = length × width |

## For developers

- Code: `frontend/src/simulations/class3-math/` (registry in `registry.tsx`), on the shared kit in `class1-math-kit/`.
- Shared helpers (`h3.ts`): `Pillars` (place-value columns), number words, answer choices. The five unit lessons (8, 16, 18, 19, 20) share one engine, `UnitLab.tsx`, configured in `UnitSims.tsx`. Lessons 12 and 13 share `ColumnArith.tsx`.
- Register in the database: `npm run seed:class3-math` (in `backend`). Test one without the database: open `/embed/simulation/<componentKey>` while signed in.
- Lookup chain: `findClass1Sim` → `findClass2Sim` → `findClass3Sim`.
