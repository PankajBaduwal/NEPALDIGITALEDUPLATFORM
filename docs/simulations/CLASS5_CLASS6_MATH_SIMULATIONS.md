# Class 5 and Class 6 Mathematics — simulations by lesson

Books: *Mathematics, Grade 5* (CDC Nepal, 15 lessons) and *Mathematics, Grade 6* (20 lessons in six units). Every simulation is 3D (Three.js) and has three modes: **Learn** (change the numbers and watch the scene), **Play** (make a target the lab gives you) and **Challenge** (eight questions, stars, progress saved). Everything is in Nepali and English.

## Class 5

| Lesson | Topic | Simulation | What the child does |
|---|---|---|---|
| 1 | Lines and angles | **Angle Lab** | turns a ray on a 3D protractor from 0° to 360°; names acute, right, obtuse, straight and reflex angles; complement and supplement |
| 2 | Solid objects | **Solid Lab** | cube, cuboid, prism, pyramids, cylinder, cone, sphere; counts faces, edges and vertices; pulls the faces apart |
| 3 | Number sense | **Crore Towers** | nine columns of cubes; numbers up to 99,99,99,999 with crore commas and words |
| 4 | Simplification | **Simplification Lab** | solves an expression one operation at a time in BODMAS order |
| 5 | Fraction | **Fraction Bars** | adds and subtracts fractions with different bottoms using a common denominator |
| 5 | Fraction | **Mixed Fractions** | whole bars plus a part bar; mixed ↔ improper fractions |
| 6 | Decimal | **Decimal Blocks** | cubes, rods and small cubes for 1, 0.1 and 0.01; adds and subtracts decimals |
| 7 | Percentage | **Percent Grid** | colours a percent of 100 squares; percent of an amount |
| 8 | Time | **Time Lab** | start time plus a length of time; 12-hour and 24-hour clocks with sun and moon |
| 8 | Time | **Units of Time** | hours ↔ minutes ↔ seconds |
| 9 | Distance | **Distance** | road and rulers: km, m, cm, mm |
| 10 | Capacity | **Capacity** | fills a tank: litre and millilitre |
| 11 | Weight | **Weight** | a scale for kg and g, with quintal and tonne |
| 12 | Perimeter, area, volume | **Perimeter and Area Lab** | red edge is the perimeter, tiles are the area; rectangle and square |
| 12 | Perimeter, area, volume | **Volume Blocks** | builds a cuboid from unit cubes: l × b × h |
| 13 | Bill and budget | **Bill Shop** | quantities, discount and 13% VAT make a bill |
| 13 | Bill and budget | **Budget Towers** | income, spending and saving or deficit |
| 14 | Presentation of data | **Tally Table** | tally marks and frequencies |
| 14 | Presentation of data | **Bar Graph Lab** | bars with a scale of 1, 2, 5 or 10 |
| 15 | Algebraic expressions | **Algebra Blocks** | a·x + b with x blocks; changes x and reads the value |
| 15 | Algebraic expressions | **Like Terms** | combines the x blocks and the number cubes |

## Class 6

| Lesson | Topic | Simulation | What the child does |
|---|---|---|---|
| 1 | Set | **Venn Diagram Lab** | two circles with numbers 1–12; union, intersection, A − B, B − A, complement |
| 2 | Whole number | **Big Number Towers** | ten columns up to the arab |
| 2 | Whole number | **Factor Lab** | rectangles of cubes show every factor pair; prime or composite |
| 2 | Whole number | **HCF and LCM Lab** | two rows of multiples meet at the LCM; HCF × LCM = a × b |
| 3 | Integers | **Integer Number Line** | adds and subtracts positive and negative numbers on a line |
| 4 | Fraction | **Fraction Add and Subtract** | common denominators with larger bottoms |
| 4 | Fraction | **Fraction Multiply and Divide** | area model for ×; groups of a fraction for ÷ |
| 5 | Decimal | **Decimal Point Mover** | × and ÷ by 10, 100, 1000 |
| 5 | Decimal | **Decimal Multiplication Grid** | small squares of 0.01 give the product |
| 6 | Percentage | **Percentage Lab** | percent of an amount, fraction and decimal, increase |
| 7 | Profit and loss | **Profit and Loss** | cost and selling price towers; profit or loss and its percent |
| 8 | Unitary method | **Unitary Method** | price of one, then price of many |
| 9 | Distance | **Distance: km to mm** | km, hm, dam, m, cm, mm |
| 10 | Perimeter, area, volume | **Area Lab** | triangle, parallelogram, trapezium |
| 10 | Perimeter, area, volume | **Volume and Capacity** | cuboid blocks; 1000 cm³ = 1 litre |
| 11 | Indices | **Power Blocks** | a, a², a³ … as blocks; index laws |
| 12 | Algebraic expression | **Area Model (x+a)(x+b)** | four coloured parts of a rectangle |
| 12 | Algebraic expression | **Algebra Blocks** | value of a·x + b |
| 12 | Algebraic expression | **Adding Expressions** | like terms |
| 13 | Equation, inequality, graph | **Equation Balance** | x + a = c and ax = c: do the same to both pans |
| 13 | Equation, inequality, graph | **Inequality Number Line** | open and closed dots; test numbers |
| 13 | Equation, inequality, graph | **Line Graph Lab** | plots y = mx + c |
| 14 | Lines and angles | **Parallel Lines and Angles** | corresponding, alternate, co-interior, vertically opposite, linear pair |
| 15 | Plane shapes | **Triangle Lab** | angle sum 180°; kinds of triangle |
| 15 | Plane shapes | **Quadrilateral Lab** | square, rectangle, parallelogram, rhombus, trapezium, kite |
| 16 | Circle | **Circle Lab** | radius, diameter, chord, arc, sector; circumference ≈ 3 diameters |
| 17 | Solid objects | **Solids and Nets** | faces, edges, vertices; pull a cube apart into its net |
| 18 | Co-ordinate geometry | **Coordinate Plane** | plots points; quadrants; reflection in an axis |
| 19 | Symmetry and tessellation | **Symmetry Lab** | lines of symmetry of regular shapes |
| 19 | Symmetry and tessellation | **Tessellation Lab** | which shapes tile a floor without gaps |
| 20 | Statistics | **Statistics Lab** | mean, median, mode and range of seven values |

## For developers

- Code: `frontend/src/simulations/class5-math/` and `class6-math/`. Registries: `class5-math/registry.tsx` (`CLASS5_MATH`, `findClass5Sim`) and `class6-math/registry.tsx` (`CLASS6_MATH`, `findClass6Sim`). Lookup chain: Class 1 → 2 → 3 → 4 → 5 → 6.
- Most labs use one engine, `class5-math/Lab.tsx` (`makeLab`). A lab is a config: the number controls, a `draw` function that builds the 3D scene, a headline, an optional Play goal and eight Challenge questions. Drawing helpers are in `vis.tsx`; question helpers in `h5.tsx`.
- Unit labs (distance, capacity, weight, time units) use `makeUnitSim` from `class3-math/UnitLab`.
- Register or refresh in the database: `npm run seed:class56-math` (in `backend`). It reads the titles from the two registry files and updates by `code`.
- Test one lab by itself while signed in: `/embed/simulation/<componentKey>` (for example `class6-math-l16-circle`).
- The Class 6 book's Unit One (Set) and the Class 5 and 6 books' lesson lists were taken from their contents pages; the simulations follow the lesson titles and the usual curriculum, not each page of the book.
