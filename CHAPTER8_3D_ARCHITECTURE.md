# Class 1 Mathematics Chapter 8: 3D Graphics & Engine Architecture

## 1. Engine & Rendering Specification
- **Engine:** Three.js (r128+) in React 18 with HTML5 Canvas / SVG.
- **Rendering Context:** WebGL 2.0 with automatic WebGL 1.0 fallback.
- **Target Performance:** Stable 60 FPS on school tablets, low-spec netbooks, and interactive classroom displays.
- **Shadows & Lighting:** Directional sunlight with soft PCF shadow maps (`1024x1024`), balanced hemisphere ambient fill.

---

## 2. 3D Scene Graph Hierarchy (`SubtractionEnvironment.ts`)

```
Scene (0xdbeafe - Clear Morning Sky with Exponential Fog)
│
├── AmbientLight (0xffffff, intensity 0.85)
├── DirectionalLight (0xffedd5, intensity 1.2, position [6, 14, 8])
│   └── PCFSoftShadowMap (1024x1024)
├── HemisphereLight (Sky: 0xbfdbfe, Ground: 0x166534, intensity 0.45)
│
├── GroundMesh (PlaneGeometry: 36x36, Green Grass)
├── StoneRingDecorations (CylinderGeometry: Yellowish Main Ring & Rose Removal Ring)
│
├── MainStationGroup (Position [-1.8, 0, 0] - Starting Collection)
│   ├── TableMesh (BoxGeometry, Cedar Wood)
│   ├── MainBasketMesh (CylinderGeometry, Warm Amber Wicker)
│   └── ActiveMeshes[] (0 to 10 clickable items with userData.isRemoved = false)
│
├── RemovalStationGroup (Position [2.6, 0, 0.5] - Removal Collection)
│   ├── PedestalMesh (CylinderGeometry, Dark Wood)
│   ├── RemovalBasketMesh (CylinderGeometry, Crimson Rose Wicker)
│   └── RemovedMeshes[] (Items transferred to removal basket with userData.isRemoved = true)
│
└── BackgroundDecorations
    ├── BoundaryFence (Repeated wooden pickets and rails)
    └── ShadedVillageTree (Position [-6.2, 0, -3.2])
```

---

## 3. Dynamic Camera Focusing System
`SubtractionEnvironment` provides a camera director that smoothly transitions between viewport coordinates:

| Focus Preset | Camera Position $(X, Y, Z)$ | LookAt Target $(X, Y, Z)$ | Purpose |
|---|---|---|---|
| `PLAYGROUND` | $(0, 4.4, 9.2)$ | $(0, 1.2, 0)$ | Full panoramic view showing both the holding table and the removal basket. |
| `MAIN_BASKET` | $(-1.8, 3.2, 3.8)$ | $(-1.8, 1.0, 0)$ | Zoom onto the holding basket for close inspection of remaining items. |
| `REMOVAL_BASKET` | $(2.6, 2.8, 3.4)$ | $(2.6, 0.9, 0.5)$ | Close-up on the removal basket to count items that have been taken away. |

---

## 4. Object Removal Animation & State Management
- **Raycasting:** Detects individual object selections with `userData.interactive = true` and `userData.isRemoved = false`.
- **Arc Interpolation:** Selected items animate across stations along an inverted parabola with simultaneous rotation.
- **Immediate State Consistency:** Object counts, removal counts, and live equation formulas ($N - M = R$) synchronize instantaneously.
- **Resource Disposal:** All geometries, materials, and textures are explicitly disposed of on component unmount to prevent WebGL memory leaks.

