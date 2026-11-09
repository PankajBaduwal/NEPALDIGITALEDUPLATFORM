# Class 1 Mathematics – Chapter 10: Addition up to 20 (योगफल २० सम्म आउने जोड)
## Simulation Assets, Procedural Geometries & Audio Profiles

---

## 1. 3D Procedural Assets (`AdditionPlaygroundEnvironment.ts`)

| Asset | Three.js Geometry Primitive | Material & Shading | Role in Simulation |
|---|---|---|---|
| **Apples (स्याउ)** | `SphereGeometry(0.24)` + `CylinderGeometry` stem | Red/Orange `MeshStandardMaterial({ roughness: 0.25 })` | Countable objects in Basket A and B |
| **Bananas (केरा)** | `TubeGeometry(CubicBezierCurve3, 12, 0.09, 8)` | Yellow/Lime `MeshStandardMaterial({ roughness: 0.35 })` | Curved tropical fruits for Basket A and B |
| **Flowers (फूल)** | Center sphere + 5 elliptical petal spheres | Purple/Pink phong with amber center | Nature counters |
| **Balloons (बेलुन)** | Stretched sphere (`scale: 1, 1.25, 1`) | Magenta/Cyan `MeshStandardMaterial({ roughness: 0.2 })` | Buoyant festive counters |
| **Toy Blocks (ब्लक)** | `BoxGeometry(0.38, 0.38, 0.38)` | Blue/Green vibrant cubes with beveled appearance | Solid stacking manipulatives |
| **Basket A & B** | Cylinder base + Torus rim | Royal blue & emerald woven wood finishes | Left & right holding zones |
| **Central Mat** | Cylinder plate (`radius: 2.8, height: 0.08`) | Golden amber `0xf59e0b` | Destination where combined items leap |
| **3D Plus Symbol (+)** | Crossed orthogonal box geometries | Pure white reflective material | Floats between baskets |
| **Foliage & Trees** | Cylindrical trunks + Dodecahedron foliage | Forest greens and warm bark tones | Peripheral playground scenery |

---

## 2. Interactive SVG & UI Manipulatives

- **Dual Ten-Frame Houses:** 2x5 grid matrices with colour-coded cells (red addend, blue addend, remaining cells).
- **Interactive Number Tiles:** Movable numeral tiles ($0$ to $20$) with click-to-place action.
- **Vertical Column Grid:** High-contrast blackboard layout with addend rows, operator column, and answer line.
- **Village Station Cards:** Fruit Shop, Bird Garden, Toy House, Workshop, and Master Station banners.

---

## 3. Web Audio Synthesizer Profiles

- **Click / Tap:** $480\text{--}520\text{ Hz}$ sine wave with $0.1\text{s}$ decay.
- **Combine Leap Swoosh:** Rising pentatonic chime $[260, 330, 392, 523, 659]\text{ Hz}$ with $0.05\text{s}$ staggered offsets.
- **Split Pop:** Double-frequency triangle chime $[440, 580]\text{ Hz}$.
- **Success Chime:** Major triad $[523.25\text{ Hz (C5)}, 659.25\text{ Hz (E5)}, 783.99\text{ Hz (G5)}]$.
- **Victory Fanfare:** Four-note major chord $[C5, E5, G5, C6]$ celebrating quiz completion.
- **Gentle Boop:** $220\text{ Hz}$ sawtooth wave ($0.2\text{s}$) for incorrect selections.

