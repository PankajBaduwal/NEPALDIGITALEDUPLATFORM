# Class 1 Mathematics Chapter 3: Geometrical Shapes (ज्यामितीय आकारहरू) - Simulation Asset List

## 1. 3D Procedural Geometries & Models (`ShapeEnvironment.ts` / Three.js)
All 3D assets are procedurally constructed in code using Three.js primitive geometries, custom shaders, and materials. No external `.gltf` asset downloading is required:

### A. Circle (वृत्त) Assets
1. **Geometric Circle Disc:**
   - Geometry: `THREE.CylinderGeometry(1.3, 1.3, 0.1, 48)` with golden toroid rim (`THREE.TorusGeometry(1.3, 0.05, 16, 48)`).
   - Material: `MeshStandardMaterial` (`#10b981` emerald green).
2. **Wall Clock (भित्ते घडी):**
   - Geometry: Dual-layer cylinder with white circular clock face and black hour/minute hands.
3. **Dining Plate (थाली):**
   - Geometry: Beveled disc with eating surface indent (`#f1f5f9` ceramic silver finish).
4. **Traditional Drum (मादल):**
   - Geometry: Barrel body with two circular leather drum heads.

### B. Triangle (त्रिभुज) Assets
1. **Geometric Triangle Prism:**
   - Geometry: 3-sided prism `THREE.CylinderGeometry(1.4, 1.4, 0.12, 3)`.
   - Material: `MeshStandardMaterial` (`#ef4444` crimson red).
2. **Traffic Warning Sign (ट्राफिक सङ्केत):**
   - Geometry: Metallic pole with yellow/red triangular sign board.
3. **Cottage Roof (घरको छाना):**
   - Geometry: Triangular 4-sided pyramid / cone roof representing a village cottage gable.
4. **Pennant Flag (ध्वजा):**
   - Geometry: 3-cornered festive pennant banner.

### C. Quadrilateral (चतुर्भुज) Assets
1. **Geometric Quadrilateral / Rectangle Slab:**
   - Geometry: `THREE.BoxGeometry(2.1, 1.5, 0.12)`.
   - Material: `MeshStandardMaterial` (`#2563eb` royal blue).
2. **Mathematics Textbook (गणित किताब):**
   - Geometry: Rectangular book cover (`BoxGeometry(1.1, 1.4, 0.18)`) with white paper edges.
3. **Square Window Frame (झ्याल):**
   - Geometry: Timber wooden frame with 4 transparent glass panes (`PlaneGeometry(0.42, 0.42)`).
4. **Classroom Door (ढोका):**
   - Geometry: Tall wooden panel door with brass door knob.

---

## 2. 2D Interactive Vector Graphic Assets (`ShapeColoringSimulation.tsx`)
Constructed with clean SVG paths and reactive fills:
- **Scene 1 (Gallery):** Equilateral triangle, right triangle, large/small circles, square, rectangle.
- **Scene 2 (Village House):** Triangular roof, rectangular body, square windows, rectangular door, circular attic window, circular sun.
- **Scene 3 (School Bus):** Rectangular bus body, square windows, circular wheels, triangular hood.
- **Scene 4 (Robot):** Quadrilateral head & chest, circular eyes & belly button, triangular ears & feet.

---

## 3. Auditory Assets & Synthesizer
- **Tone Generators:**
  - Success chime: Multi-chord pentatonic fanfare (`523.25 Hz`, `659.25 Hz`, `783.99 Hz`, `1046.5 Hz`).
  - Paint sweep: Resonant frequency glide (`440 Hz` $\rightarrow$ `660 Hz`).
  - Detection pulse: `520 Hz` $\rightarrow$ `780 Hz` frequency burst.
  - Error buzz: Descending sawtooth wave (`220 Hz` $\rightarrow$ `150 Hz`).
- **Speech Synthesis:**
  - Engine: Web Speech Synthesis API (`SpeechSynthesisUtterance`).
  - Locales: `ne-NP` (Nepali) and `en-US` (English).

