# Class 1 Mathematics – Chapter 9: Numbers 11–20 (११ देखि २० सम्मका सङ्ख्याहरू)
## 3D Graphics Architecture & Rendering Pipeline

---

## 1. Scene Pipeline & Technology Stack

The 3D environment for Simulation 01 (`NumberGardenEnvironment.ts`) is architected with Three.js (r128+) and optimized for browser rendering:

```
[ Canvas Container (HTMLDivElement) ]
         │
         ▼
[ Three.js WebGLRenderer (antialias: true, alpha: true) ]
         │
         ├── ToneMapping: ACESFilmicToneMapping
         ├── ShadowMap: enabled (PCFSoftShadowMap)
         ├── ColorSpace: SRGBColorSpace
         │
         ├── [ PerspectiveCamera (FOV 45, Near 0.1, Far 1000) ]
         │       └── Smooth Lerp Transitions across presets (OVERVIEW / TABLE / TREE / CLOSEUP)
         │
         ├── [ AmbientLight (intensity: 0.65, soft sky tint) ]
         ├── [ DirectionalLight (Sun: intensity: 0.85, castShadow: true) ]
         ├── [ HemisphereLight (ground bounce: 0.4) ]
         │
         └── [ Three.js Scene Graph ]
                 ├── Terrain (Meadow plane + stone walkway)
                 ├── Foliage (Apple trees, shrubs, flower garden beds)
                 ├── Props (Wooden study table, village fencing)
                 ├── Dynamic Group (Spawned Countable Objects: 11–20 entities)
                 └── Particle System (Floating golden pollen & celebration confetti)
```

---

## 2. Interactive Raycasting & Anti-Double-Counting Mechanism

Grade 1 students learning numbers 11 to 20 frequently struggle with double-counting or skipping objects. The 3D engine enforces strict pedagogical guards:

1. **Normalized Device Coordinates (NDC) Pointer Tracking:**
   $$\vec{P}_{ndc} = \left( \frac{2x}{W} - 1, \; 1 - \frac{2y}{H} \right)$$
2. **Raycasting Target Traversal:**
   $$\vec{R}(t) = \vec{O} + t \vec{D}$$
   Intersects countable meshes, traversing upwards to find the root `UserData` identifier.
3. **State Locking:**
   - When an object is clicked, its index is committed to an immutable `Set<number>`.
   - The object triggers a scale animation ($1.0 \to 1.35 \to 1.15$), switches material to a glowing highlight hue, and spawns a 3D numbered badge above itself.
   - Subsequent clicks on the same item do not increment the counter; a gentle notification audio plays without penalization.
4. **Camera Preset Automation:**
   Smooth spherical camera interpolation between views:
   - **Overview:** $(0, 8, 14)$ looking at origin $(0, 1, 0)$
   - **Table Focus:** $(0, 4, 6)$ looking at table center $(0, 1.2, 0)$
   - **Tree Canopy:** $(-3, 4.5, 5)$ looking at apple tree branches $(-4, 3, 0)$

---

## 3. Performance & Memory Management

- **Shared Geometry Buffers:** Reusable geometries for spheres, stems, petals, and cubes minimize draw calls.
- **Garbage Collection Hooks:** Full cleanup implementation in `destroy()`:
  - Traverses all child meshes.
  - Calls `geometry.dispose()` on every geometry.
  - Calls `material.dispose()` on standard materials and textures.
  - Detaches resize event listeners and aborts active `requestAnimationFrame` loops.
- **Frame Rate Target:** Stable 60 FPS on standard integrated Intel Iris / UHD graphics.

