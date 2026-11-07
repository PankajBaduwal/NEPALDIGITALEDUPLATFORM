# Class 1 Mathematics Chapter 6: 3D Graphics & Engine Architecture

## 1. Engine & Rendering Specification
- **Engine:** Three.js (r128+) in React 18 with HTML5 Canvas / SVG.
- **Rendering Context:** WebGL 2.0 with automatic WebGL 1.0 fallback.
- **Target Performance:** Stable 60 FPS on school tablets, low-spec netbooks, and interactive classroom displays.
- **Shadows & Lighting:** Directional sunlight with soft PCF shadow maps (`1024x1024`), balanced hemisphere ambient fill.

---

## 2. 3D Scene Graph Hierarchy (`TenObjectsEnvironment.ts`)

```
Scene (0xe0f2fe - Sunny Morning Sky with Exponential Fog)
│
├── AmbientLight (0xffffff, intensity 0.8)
├── DirectionalLight (0xfef3c7, intensity 1.15, position [8, 14, 10])
│   └── PCFSoftShadowMap (1024x1024)
├── HemisphereLight (Sky: 0x93c5fd, Ground: 0x166534, intensity 0.45)
│
├── GroundMesh (PlaneGeometry: 32x32, Green Lush Grass)
├── PebblePathMesh (RingGeometry: Terracotta Path)
│
├── AppleTreeGroup (Position [-3.2, 0, -1.8])
│   ├── TrunkMesh (CylinderGeometry, Warm Bark)
│   ├── Branches (Angled cylinders)
│   ├── FoliageMeshes (4 DodecahedronGeometry clusters)
│   └── AppleGroup[] (10 distinct clickable 3D apples with userData ID 1-10)
│
├── FlowerbedGroup (Position [3.4, 0, -1.0])
│   ├── GardenBedBorder (TorusGeometry stone border)
│   ├── SoilMesh (BoxGeometry, dark loam)
│   └── MarigoldGroup[] (10 distinct 3D marigold flowers with ID 1-10)
│
├── PicnicTableGroup (Position [0, 0, 1.8])
│   ├── TableTop (BoxGeometry, cedar wood)
│   ├── TableLegs (4 metal cylinders)
│   └── OrangeGroup[] (10 distinct 3D oranges arranged in 5x2 grid)
│
├── BasketGroup (Position [0, 0, 0])
│   ├── WickerBasketMesh (CylinderGeometry open bowl)
│   ├── BasketRim (TorusGeometry)
│   └── CollectedApplesGroup[] (Animated deposited apples)
│
└── VillageFenceGroup (Background boundary)
    └── FencePickets (Repeated wooden slats)
```

---

## 3. Dynamic Camera Focusing System
`TenObjectsEnvironment` provides a camera director that smoothly transitions the viewport based on active learning objectives:

| Focus Preset | Camera Position $(X, Y, Z)$ | LookAt Target $(X, Y, Z)$ | Purpose |
|---|---|---|---|
| `ORCHARD` | $(0, 5.0, 10.5)$ | $(0, 1.2, 0)$ | Comprehensive wide view showing all 10-object groups in the environment. |
| `TREE` | $(-2.0, 3.2, 2.8)$ | $(-3.2, 2.5, -1.8)$ | Focused zoom on the apple tree for sequential counting (1 to 10). |
| `GARDEN` | $(2.4, 2.8, 2.5)$ | $(3.4, 0.4, -1.0)$ | Low-angle inspection of the flower bed containing 10 marigolds. |
| `TABLE` | $(0, 2.8, 4.2)$ | $(0, 0.9, 1.8)$ | Top-down angled view of the 10 oranges on the picnic table. |
| `BASKET` | $(0, 2.2, 2.5)$ | $(0, 0.5, 0)$ | Close-up on the collection basket during harvesting activities. |

---

## 4. Interaction, Raycasting & State Management
- **Raycaster Precision:** Raycasts against mesh `userData.interactive = true` and `userData.objectId`.
- **Anti-Double-Counting Guard:** A clicked object enters a counted state with a persistent glowing halo; subsequent clicks on the same object are ignored until reset.
- **Dynamic Glow Shaders:** Counted items receive an emissive golden pulse material effect.
- **Resource Cleanup:** Full disposal of geometries, materials, and textures on component unmount to prevent WebGL memory leaks.

