# Class 1 Mathematics Chapter 5: 3D Graphics & Engine Architecture

## 1. Engine & Rendering Specification
- **Engine:** Three.js (r128+) in React 18 with HTML5 Canvas / SVG.
- **Rendering Context:** WebGL 2.0 with fallback to WebGL 1.0.
- **Target Performance:** Solid 60 FPS on low-power tablets, school laptops, and smartboards (55" to 105").
- **Lighting Model:** Three-point balanced lighting (Hemisphere Light + Directional Sun Light with PCFSoftShadowMap + Ambient Fill).

---

## 2. 3D Scene Graph Hierarchy (`ZeroPlaygroundEnvironment.ts`)

```
Scene (0xdbeafe - Soft Sky Blue with Exponential Fog)
│
├── AmbientLight (0xffffff, intensity 0.85)
├── DirectionalLight (0xffedd5, intensity 1.1, position [6, 12, 8])
│   └── PCFSoftShadowMap (1024x1024)
├── HemisphereLight (Sky: 0x93c5fd, Ground: 0x15803d, intensity 0.4)
│
├── GroundMesh (PlaneGeometry: 28x28, MeshStandardMaterial, Green)
├── PathMesh (RingGeometry: Terracotta Dirt Path)
│
├── TreeGroup (Position [-3.6, 0, -1.5])
│   ├── TrunkMesh (CylinderGeometry)
│   ├── MainBranchMesh (CylinderGeometry, angled horizontally)
│   ├── FoliageMeshes (3 DodecahedronGeometry clusters)
│   └── BirdGroup[] (Dynamic perching bluebirds 0 to 4)
│
├── PondMesh (CircleGeometry: Water with metalness 0.3, Torus stone rim)
│   └── DuckGroup[] (Dynamic bobbing yellow ducklings 0 to 4)
│
├── BenchGroup (Position [0, 0, -2.6])
│   ├── SeatPlank & Backrest (BoxGeometry, cedar wood)
│   ├── Legs (Dark metal cylinders)
│   └── PeopleGroup[] (Dynamic friendly child models 0 to 3)
│
├── BasketTableGroup (Position [0, 0, 1.5])
│   ├── TablePedestal (CylinderGeometry, wood)
│   ├── BasketContainer (Open top wicker bowl)
│   └── AppleGroup[] (Dynamic ruby red apples 0 to 5)
│
└── VillageHouseGroup (Position [5.5, 0, -4.5])
    ├── StuccoWalls (BoxGeometry)
    ├── RedClayTileRoof (ConeGeometry)
    └── WoodenDoor (PlaneGeometry)
```

---

## 3. Dynamic Camera Focusing System
To support seamless transitions across the 5 learning levels, `ZeroPlaygroundEnvironment` provides an automated camera focus director:

| Focus Preset | Camera Position $(X, Y, Z)$ | LookAt Target $(X, Y, Z)$ | Purpose |
|---|---|---|---|
| `DEFAULT` | $(0, 4.5, 9.5)$ | $(0, 1.2, 0)$ | Full playground panoramic view for overall orientation. |
| `BASKET` | $(0, 2.5, 4.2)$ | $(0, 0.9, 1.5)$ | Close-up on the central fruit basket to observe apple removal. |
| `TREE` | $(-1.8, 3.2, 2.4)$ | $(-2.5, 2.6, -0.5)$ | Zoom into tree branch for bird departure observation. |
| `POND` | $(3.4, 2.8, 3.6)$ | $(3.4, 0.1, 0.5)$ | Overlooking the pond to inspect swimming ducks. |
| `BENCH` | $(0, 2.2, 0.5)$ | $(0, 0.7, -2.6)$ | Centered view of the park bench for seated child counts. |

---

## 4. Interaction & Memory Management
1. **Raycasting Hit Detection:**
   - Detects clicks on apples, birds, ducks, and bench characters with parent group name traversal.
   - Triggers appropriate departure or count actions.
2. **Animation Loop:**
   - Smooth sinusoidal floating motion for pond ducks:
     $$y(t) = y_0 + 0.02 \cdot \sin(3t + 1.5 \cdot i)$$
3. **Disposal & Garbage Collection:**
   - `destroy()` method cancels the active animation frame, detaches DOM event listeners (`pointerdown`, `resize`), and calls `renderer.dispose()` to prevent memory leaks on navigation.

