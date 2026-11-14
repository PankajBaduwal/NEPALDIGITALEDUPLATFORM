# Class 1 Mathematics — simulations by chapter

Book: *My Mathematics, Grade 1* (CDC Nepal, 22 chapters). Every simulation has three modes:
**Learn** (guided, the bear speaks in Nepali or English), **Play** (free exploring) and **Challenge** (questions, stars, progress saved to the child's record).

## Chapters 1–10 (rebuilt in 3D)

All the 2D pages of chapters 1–10 (and the 2D ones of chapters 1 and 2) now have a real Three.js replacement in
`frontend/src/simulations/class1-math-3d/` (`Ch1.tsx` … `Ch10.tsx`, built with `makeSim.tsx` on the shared kit).
They keep the same `componentKey` and code: `class1-math-3d/registry.tsx` is looked up first by `SimulationPlayer`, and the older
2D files stay in their chapter folders until the 3D versions are signed off. Each has Learn / Play / Challenge, Nepali + English,
speech, stars and saved progress.

| Ch | Topic | Simulations | Format |
|---|---|---|---|
| 1 | Shape, size and space | Position Playground, Big and Small World, Tall and Short, Long and Short, Direction and Distance | all 3D (the last two rebuilt) |
| 2 | Lines | Straight and Curved Line Explorer, Colour the Lines, Connect the Dots, Draw with Real Objects, Line Drawing Playground | all 3D (four rebuilt) |
| 3 | Geometric shapes | Shape Explorer, Match, Colour, Detective, Builder | 3D (rebuilt) |
| 4 | Numbers up to 9 | Many and Few, Number Garden, Matching, Tracing, Sequence | 3D (rebuilt) |
| 5 | Zero | Discovery Playground, Empty Basket, Where Did Everything Go, Count the Village, Zero Challenge | 3D (rebuilt) |
| 6 | Ten | Ten Objects, Discovery, Make Ten, Count and Match, Writing Studio | 3D (rebuilt) |
| 7 | Addition up to 10 | Playground, Make the Total, Number Bond Houses, Count On, Equation Studio | 3D (rebuilt) |
| 8 | Subtraction up to 10 | Playground, Empty the Basket, Equation Studio, Difference Explorer, Challenge World | 3D (rebuilt) |
| 9 | Numbers 11–20 | Number Garden, Group of Ten, Tens and Ones, Number Line, Challenge World | 3D (rebuilt) |
| 10 | Addition up to 20 | Playground, Make Ten, Equation Studio, Block Builder, Challenge World | 3D (rebuilt) |

Plus the cross-class **Number Line & Counting Frog** (3D).

## Chapters 11–22 (3D, shared kit)

Code: `frontend/src/simulations/class1-math-ch11-22/`, shared kit: `frontend/src/simulations/class1-math-kit/`.
Register in the database with `npm run seed:class1-math-ch11-22` (in `backend`).

| Ch | Topic | Simulation | What the child does |
|---|---|---|---|
| 11 | Subtraction up to 20 | **Fly-Away Birds** | taps birds on a wall and they fly away: 15 − 6 = 9 |
| 12 | Odd and even | **Pairing Party** | pairs balls with ribbons; one left alone = odd |
| 13 | Number names up to 20 | **Number Name Blocks** | taps 3D letter blocks in order to spell *seventeen* |
| 14 | Ordinal numbers | **Race Day** | watches ten animals race; 1st … 10th; taps an animal for its place |
| 15 | Numbers 21–100 | **Hundred Village** | builds numbers with tens towers and ones; a 100-cube wall lights up |
| 16 | Addition up to 100 | **Add and Bundle** | joins two numbers; ten loose cubes bundle into a new tower |
| 17 | Subtraction, two digits | **Break and Take Away** | takes blocks away; breaks a ten into ten ones when needed |
| 18 | Devanagari numerals to 100 | **Nepali Number Cards** | flips 3D cards (37 → ३७); memory-match game |
| 19 | Time | **Week Balloons** | seven day balloons; order the days; sing the week |
| 19 | Time | **Clock Tower** | reads o'clock and half past; sun and moon move with the hour |
| 20 | Coins and notes | **Coins and Notes Explorer** | flips Nepali coins (Rs 1, 2, 5, 10) and notes (Rs 5–100); makes an amount |
| 20 | Coins and notes | **Toy Shop** | chooses a toy and pays the exact price |
| 21 | Length | **Measure with Cubes** | lines cubes beside a pencil, ribbon or stick; compares lengths |
| 22 | Pictograph | **Fruit Basket Pictograph** | votes build a 3D chart; reads most, least and total |

## For developers

- A new simulation = one file using `useSimKit`, `useStage`, `SimFrame` and `QuizPanel`; add it to `registry.tsx` and to the seed script.
- Chapters 1–10 use `class1-math-3d/makeSim.tsx`: a spec (3D scene builder, Learn steps, Play controls, Challenge questions) becomes a full simulation. Shared scenes are in `scenes.ts` (`Items`, `NumLine`, `EqBoard`, `BasketBalls`), `shapes.tsx` and `trace.ts` (finger tracing).
- Test one without the database: open `/embed/simulation/<componentKey>` while signed in.
- Place-value blocks (tens towers and one cubes) are in `class1-math-kit/place.ts`.
