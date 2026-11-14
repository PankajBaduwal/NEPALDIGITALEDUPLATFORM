# Class 4 Mathematics — simulations by lesson

Book: *Mathematics, Grade 4* (CDC Nepal, 15 lessons). Every simulation is 3D (Three.js) and has three modes: **Learn** (guided, the bear speaks Nepali or English), **Play** (free exploring or a short game) and **Challenge** (eight questions, stars, progress saved).

| Lesson | Topic | Simulation | What the child does |
|---|---|---|---|
| 1 | Lines and angles | **Protractor Lab** | opens an arm on a 3D protractor; reads 0°–180°; names acute, right, obtuse and straight angles; builds a target angle |
| 2 | Plane figures | **Shape Builder** | nine triangles and quadrilaterals as 3D tiles with labelled vertices and sides; reads their properties; names them |
| 3 | Solid objects | **Solid Explorer** | spins a cube, cuboid, pyramid, prism, cylinder, cone and sphere; counts faces, edges and vertices (F + V − E = 2) |
| 4 | Number sense | **Lakh Towers** | seven columns of cubes (ten-lakhs to ones); numbers to 99,99,999 with lakh commas and words |
| 4 | Number sense | **Round-Off Line** | a ball on a number line rolls to the nearest 10, 100 or 1000 |
| 5 | Basic operations | **Addition Towers (7 digits)** | adds column by column with carrying |
| 5 | Basic operations | **Subtraction Towers (7 digits)** | subtracts column by column with borrowing |
| 5 | Basic operations | **Multiplication Grid** | area model: 2-digit × 2-digit as four coloured blocks and their partial products |
| 5 | Basic operations | **Long Division Lab** | divides a 3-digit number by a 1-digit number step by step; quotient and remainder |
| 6 | Fraction, decimal, percentage | **Fraction Pies** | shades pie slices; equivalent fractions side by side; compares fractions |
| 6 | Fraction, decimal, percentage | **Decimal Grid** | a 10 × 10 grid read as a fraction, a decimal and a percent |
| 7 | Time | **24-Hour Clock** | clock with a sun and moon; 12-hour (AM/PM) and 24-hour time; elapsed time |
| 8 | Currency | **Note Counter** | stacks of Nepali notes and coins; makes an amount; fewest notes; rupees and paisa |
| 9 | Distance | **Distance: km, m, cm, mm** | road and rulers; converts between all four units |
| 10 | Capacity | **Capacity: litre and millilitre** | fills a tank; 1 L = 1000 mL |
| 11 | Weight | **Weight: kilogram and gram** | weighs on a scale; 1 kg = 1000 g |
| 12 | Perimeter and area | **Garden Lab** | an ant walks round a garden (perimeter) and tiles cover it (area); changes length and width |
| 13 | Bill and budget | **Bill Shop** | quantity × rate = amount; total bill; pays and finds the change |
| 13 | Bill and budget | **Budget Towers** | towers for income and spending; saving = income − spending; spots a deficit |
| 14 | Bar diagram | **Bar Graph Lab** | 3D bars with 1, 2, 5 or 10 per block; reads, builds and compares |
| 15 | Algebra | **Balance Algebra** | a balance with an unknown x: take the same from both sides, or guess x until it balances |

## For developers

- Code: `frontend/src/simulations/class4-math/` (registry in `registry.tsx`), on the shared kit in `class1-math-kit/` and helpers from `class3-math/h3.ts`.
- `h4.tsx`: lakh-style number formatting (`indian`, `lakhWords`), `mcq` and `numQ` question builders, the `Hud` box and the seven-place list `PL7`.
- Lessons 9, 10 and 11 use the unit engine of Class 3 (`class3-math/UnitLab.tsx`, configured in `UnitSims4.tsx`). The engine gained optional `bs` and `ss` labels on a unit pair so a ruler can show cm and mm.
- Register in the database: `npm run seed:class4-math` (in `backend`). Test one without the database: open `/embed/simulation/<componentKey>` while signed in.
- Lookup chain: `findClass1Sim` → `findClass2Sim` → `findClass3Sim` → `findClass4Sim`.
- The lesson list comes from the book's contents page; the exercises themselves were not read page by page.
