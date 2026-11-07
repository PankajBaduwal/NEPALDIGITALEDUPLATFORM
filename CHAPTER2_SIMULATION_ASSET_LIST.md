# Class 1 Mathematics Chapter 2: Lines (रेखाहरू) - Simulation Asset List

## 1. 3D Procedural Assets (`LineEnvironment.ts` / Three.js)
All 3D assets are procedurally constructed using Three.js geometries, shaders, and materials to ensure instantaneous loading without large external `.gltf` asset bottlenecks:

1. **Straight Village Road:**
   - Geometry: `THREE.PlaneGeometry(16, 2.5)`
   - Material: `MeshStandardMaterial` (`#d97706`, dirt earth), with white dashed centerline (`THREE.DashedLineMaterial`).
2. **Curved Village Road:**
   - Geometry: `THREE.TubeGeometry` with `CatmullRomCurve3` having 5 control points.
   - Material: Gravel earthy texture with glowing selection pulse shader.
3. **Straight Railway Track:**
   - Rails: Dual parallel `THREE.BoxGeometry(14, 0.08, 0.08)` metallic steel.
   - Sleepers: 22 wooden ties (`#78350f`) spaced at regular 0.65m intervals.
4. **Curved Garden Border:**
   - Geometry: Arc spline with 14 decorative river cobblestones (`DodecahedronGeometry`).
5. **Straight Wooden Stick:**
   - Geometry: `THREE.CylinderGeometry(0.06, 0.06, 3.2)` polished pine finish (`#b45309`).
6. **Dynamic Interactive Rope:**
   - Geometry: Dynamically regenerated `THREE.TubeGeometry(curve, 32, 0.05, 8)` driven by a sagging catenary parameter that flattens into a straight line as tension increases.
7. **Winding River:**
   - Geometry: S-curved ribbon tube with animated water blue shader (`#38bdf8`) with wave ripples.
8. **Straight Wooden Bridge:**
   - Geometry: Heavy timber planks over the river with safety railings.
9. **Straight Picket Fence:**
   - Geometry: 12 vertical wooden pickets connected by 2 horizontal straight rails.
10. **Nepalese Village Scenery:**
    - Low-poly Himalayan hillside cottages with red brick walls, slate roofs, terraced hills, pine and deciduous trees, and flowering shrubs.

---

## 2. 2D Interactive Vector Graphic Assets (`LineColoringSimulation.tsx`)
Constructed with SVG vector paths and responsive viewboxes:
- **Horizontal & Vertical Straight Guides:** High-contrast paths with rounded caps and clickable hit areas.
- **Wave & Arc Curved Guides:** Quadratic & cubic bezier paths with SVG glow filters (`feGaussianBlur`).
- **Ice Cream Cone Illustration:** Straight triangular cone body + curved ice cream scoops + curved cherry.
- **Sailboat Illustration:** Straight mast pole, diagonal straight sail, straight boat hull + double curved water waves.
- **Village House Illustration:** Triangular straight roof, rectangular straight walls and door + double curved chimney smoke curls.

---

## 3. Audio & Sound Assets
- **Web Audio API Synth Engine:**
  - High chime: `523.25 Hz` (C5), `659.25 Hz` (E5), `783.99 Hz` (G5), `1046.5 Hz` (C6).
  - Error buzz: Low square wave `220 Hz` descending to `160 Hz`.
  - Brush sweep: Filtered pink noise burst for crayon and eraser interactions.
  - Dot snap: Pentatonic scale tone sequence.
- **Bilingual Speech Synthesis (`SpeechSynthesisUtterance`):**
  - Languages: `ne-NP` (नेपाली) and `en-US` (English).
  - Speech rate: Child-appropriate paced tempo (`0.9x`).

