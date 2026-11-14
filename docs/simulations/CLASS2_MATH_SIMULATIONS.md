# Class 2 Mathematics — simulations by lesson

Book: *My Mathematics, Grade 2* (CDC Nepal, 17 lessons). The older ported Class 2 maths pages (Number Village 1–99, Tens and Ones Workshop, Place Value, Rupee and Paise Market, Shape Explorer, Length Detective, Add/Subtract on a Number Line) follow a different, older syllabus (numbers to 99, no area, fractions, multiplication or division) and are flat 2D pages, so the set below is built fresh for this book.

Every simulation is 3D (Three.js) and has three modes: **Learn** (guided, the bear speaks Nepali or English), **Play** (free exploring) and **Challenge** (questions, stars, progress saved).

| Lesson | Topic | Simulation | What the child does |
|---|---|---|---|
| 1 | Capacity | **Pour and Count** | pours a small pitcher into a big jar and counts; pours two glasses into equal cups to compare |
| 2 | Time | **Clock Workshop** | o'clock, half past, quarter past, quarter to on a big clock; sets the clock |
| 2 | Time | **Calendar Town** | twelve month houses in a ring: days, order, the year |
| 3 | Numbers up to 1000 | **Thousand Town** | builds numbers to 999 with hundred flats, ten towers, one cubes |
| 3 | Numbers up to 1000 | **Hopping Frog** | hops by 1, 10 or 100 on stepping stones |
| 4 | Comparison | **Number Seesaw** | the bigger number pulls the seesaw down; chooses >, <, = |
| 4 | Comparison | **Order the Balloons** | ascending and descending order |
| 5 | Odd and even | **Odd-Even Machine** | looks at the last digit and sends crates to the Even or Odd bin |
| 6 | Weight | **Weigh It** | heavier goes down; balances an object with 1, 2, 5 kg weights |
| 7 | Addition | **Add Town** | joins 3-digit numbers; ten ones → ten, ten tens → hundred |
| 8 | Subtraction | **Take Away Town** | takes blocks away; breaks a hundred or a ten when needed |
| 9 | Length | **Ruler Workshop** | reads cm on a big ruler; starts from 0; compares lengths |
| 10 | Area | **Tile the Floor** | covers shapes with square tiles; draws shapes; compares areas |
| 11 | Multiplication 1 | **Equal Groups Garden** | baskets of apples: 3 + 3 + 3 = 3 × 3 |
| 11 | Multiplication 1 | **Tables Frog** | hops by 2, 3, 4, 5, 10: k hops of s = k × s |
| 12 | Fraction | **Fraction Pizza** | cuts and shades a pizza; reads ½, ⅓, ¼, ¾ |
| 13 | Geometric shapes | **Solid Shapes Workshop** | cube, cuboid, sphere, cylinder, cone, pyramid: faces, edges, corners; roll or slide |
| 13 | Geometric shapes | **Flat Shapes Builder** | sticks and balls: counts sides and corners |
| 14 | Pictograph and table | **Tally and Pictograph** | votes build tally marks, a table and a pictograph |
| 15 | Currency | **Rupee Market** | pays with notes and coins to Rs 1000; adds prices; finds change |
| 16 | Multiplication 2 | **Array Builder** | rows and columns of cubes; a × b = b × a |
| 17 | Division | **Sharing Party** | shares sweets equally among friends: 12 ÷ 3 = 4 |

## For developers

- Code: `frontend/src/simulations/class2-math/` (registry in `registry.tsx`), on the shared kit in `class1-math-kit/`.
- Hundreds/tens/ones blocks: `class2-math/helpers.ts` (`Blocks3`). The frog engine is shared by Hopping Frog and Tables Frog (`SkipHop.tsx`).
- Register in the database: `npm run seed:class2-math` (in `backend`). Test one without the database: open `/embed/simulation/<componentKey>` while signed in.
