# Class 1 Mathematics Chapter 7: 3D Graphics & Engine Architecture

## 1. Engine & Rendering Specification
- **Engine:** Three.js (r128+) in React 18 with HTML5 Canvas / SVG.
- **Rendering Context:** WebGL 2.0 with automatic WebGL 1.0 fallback.
- **Target Performance:** Stable 60 FPS on school tablets, low-spec netbooks, and interactive classroom displays.
- **Shadows & Lighting:** Directional sunlight with soft PCF shadow maps (`1024x1024`), balanced hemisphere ambient fill.

---

## 2. 3D Scene Graph Hierarchy (`AdditionEnvironment.ts`)

```
Scene (0xdbeafe - Sunny Morning Sky with Exponential Fog)
│
├── AmbientLight (0xffffff, intensity 0.85)
├── DirectionalLight (0xffedd5, intensity 1.2, position [6, 14, 8])
│   └── PCFSoftShadowMap (1024x1024)
├── HemisphereLight (Sky: 0xbfdbfe, Ground: 0x166534, intensity 0.45)
│
├── GroundMesh (PlaneGeometry: 36x36, Green Grass)
│
├── LeftStationGroup (Position [-3.2, 0, 0] - Group A)
│   ├── PedestalMesh (CylinderGeometry, Cedar Wood)
│   ├── BasketAMesh (CylinderGeometry, Warm Amber)
│   └── GroupAObjectMeshes[] (0 to 10 clickable 3D items with userData.group='A')
│
├── RightStationGroup (Position [3.2, 0, 0] - Group B)
│   ├── PedestalMesh (CylinderGeometry, Cedar Wood)
│   ├── BasketBMesh (CylinderGeometry, Teal Sky)
│   └── GroupBObjectMeshes[] (0 to 10 clickable 3D items with userData.group='B')
│
├── CenterStationGroup (Position [0, 0, 1.0] - Combined Group)
│   ├── CenterTableMesh (BoxGeometry, Dark Wood)
│   ├── CombinedBasketMesh (CylinderGeometry, Emerald Green)
│   └── CombinedObjectMeshes[] (0 to 10 merged 3D items with userData.group='COMBINED')
│
└── PlaygroundSceneryGroup
    ├── BackgroundPicketFence (Repeated slats along z = -5.5)
    ├── ShadedTreeGroup (Position [-6.5, 0, -3.5])
    └── VillageCottageGroup (Position [7.0, 0, -4.0])
```

---

## 3. Dynamic Camera Focusing System
`AdditionEnvironment` provides a camera director that smoothly transitions viewport coordinates based on user interaction:

| Focus Preset | Camera Position $(X, Y, Z)$ | LookAt Target $(X, Y, Z)$ | Purpose |
|---|---|---|---|
| `PANORAMA` | $(0, 4.6, 9.5)$ | $(0, 1.4, 0)$ | Full playground view showing Basket A, Basket B, and Center Table simultaneously. |
| `GROUP_A` | $(-2.8, 3.2, 4.2)$ | $(-3.2, 1.0, 0)$ | Zoom onto Group A's basket for close counting of initial items. |
| `GROUP_B` | $(2.8, 3.2, 4.2)$ | $(3.2, 1.0, 0)$ | Zoom onto Group B's basket for close counting of added items. |
| `COMBINED` | $(0, 3.4, 4.8)$ | $(0, 0.9, 1.0)$ | Low-angle view centered on the large basket during and after migration. |

---

## 4. Object Migration Animation System
- **Trajectory Interpolation:** Objects smoothly migrate along a parabolic arc ($Y = Y_0 + \sin(\pi t) \times 0.8$) from their respective side stations to the center table.
- **Timing & Easing:** 900ms duration using cubic ease-in-out curve.
- **Re-layout on Arrival:** Objects neatly organize into an concentric radial pattern inside the large central basket.
- **Raycasting Precision:** Raycasts detect clicked objects and trigger feedback pulses without double-counting.
- **Resource Cleanup:** Automatic disposal of meshes, materials, and geometries on unmount.

