# Class 1 Mathematics – Chapter 10: Addition up to 20 (योगफल २० सम्म आउने जोड)
## 3D Graphics Architecture & Rendering Pipeline

---

## 1. Scene Pipeline & Camera System

The 3D WebGL engine for Simulation 01 (`AdditionPlaygroundEnvironment.ts`) is designed for maximum smoothness and low latency across all devices:

```
[ Canvas Container (HTMLDivElement) ]
         │
         ▼
[ Three.js WebGLRenderer (antialias: true, alpha: true) ]
         ├── ToneMapping: ACESFilmicToneMapping (exposure: 1.1)
         ├── ShadowMap: PCFSoftShadowMap (1024x1024 shadow maps)
         │
         ├── [ PerspectiveCamera (FOV 45, Near 0.1, Far 100) ]
         │       └── Eye: (0, 9, 13) looking at (0, 0.5, 0)
         │
         ├── [ Lighting Rig ]
         │       ├── AmbientLight (0xfff5ea, intensity 0.70)
         │       ├── Sun DirectionalLight (0xfffaed, intensity 0.95, castShadow: true)
         │       └── Fill PointLight (0x38bdf8, intensity 0.40 at (-6, 4, 3))
         │
         └── [ Three.js Scene Graph ]
                 ├── Playground Ground & Perimeter Trees
                 ├── Central Amber Mat (Y: 0.04)
                 ├── Floating 3D Plus Symbol (0, 1.8, 0.2)
                 ├── Basket A Group (Positioned at X: -3.8)
                 ├── Basket B Group (Positioned at X: +3.8)
                 └── Interpolated Combined Target Group (X: -1.2 to +1.2)
```

---

## 2. Dynamic Group Combining Physics & Lerp Trajectory

When the student triggers "Combine Groups" (दुवै समूह मिसाउनुहोस्), items do not snap instantly. Instead, a smooth sinusoidal parabolic trajectory moves objects into the central amber mat:

$$\vec{P}(t) = \left( (1 - t) \cdot X_{orig} + t \cdot X_{target}, \; Y_{base} + \sin(\pi t) \cdot H_{arc}, \; (1 - t) \cdot Z_{orig} + t \cdot Z_{target} \right)$$

- $t \in [0, 1]$ increments at $0.025$ per frame (~40 frames / ~0.67 seconds).
- $H_{arc} = 0.8\text{m}$ gives objects a realistic leap into the common gathering rug.
- Individual target positions $(X_{target}, Z_{target})$ are arranged in a clean grid ($4 \times 5$) inside the circle so that the child can easily count them without overlap.

---

## 3. Raycasting & Memory Disposal

- **NDC Pointer Intersect:** Raycasting on `pointerdown` identifies the tapped fruit or block, initiates a bounce feedback animation ($Y += 0.35\text{m}$ for $180\text{ms}$), and plays an audio tally.
- **Resource Disposal:** The `destroy()` method cleanly terminates `requestAnimationFrame`, unbinds DOM listeners, disposes geometries, and cleans GPU texture caches.

