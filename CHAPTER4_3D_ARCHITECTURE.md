# Class 1 Mathematics Chapter 4: 3D Graphics & Engine Architecture

## 1. Engine & Rendering Overview
- **Core Technology:** Three.js (r128+) with React 18 & HTML5 Canvas / SVG.
- **Rendering Context:** WebGL 2.0 with automatic WebGL 1.0 fallback.
- **Target Framerate:** 60 FPS on low-power devices, mobile touchscreens, and school computer labs.
- **Color Space:** sRGB Encoding with linear workflow for realistic lighting and warm colors.

---

## 2. Scene Graph & Hierarchy (ManyFewEnvironment.ts)

```
Scene (0xecfdf5 - Light Mint Sky)
│
├── AmbientLight (0xffffff, intensity 0.7)
├── DirectionalLight (0xfffbeb, intensity 0.9, position [4, 8, 5])
│   └── CastShadow: Soft Shadow Map (1024x1024)
│
├── MarketTable (BoxGeometry: 6.0 x 0.4 x 3.5, MeshStandardMaterial)
│   └── Floor Shadow Plane (ShadowMaterial, opacity 0.25)
│
├── LeftGroup (Position [-1.4, 0.45, 0])
│   ├── BasketMesh (Wicker Cylinder with open top)
│   └── ItemGroup (Procedural fruit/flower meshes stacked in hemispherical bowl)
│
└── RightGroup (Position [1.4, 0.45, 0])
    ├── BasketMesh (Wicker Cylinder with open top)
    └── ItemGroup (Procedural fruit/flower meshes stacked in hemispherical bowl)
```

---

## 3. Performance Optimization Strategies

1. **Procedural Geometry Generation:**
   - Primitives (`SphereGeometry`, `CylinderGeometry`, `BoxGeometry`) are reused across items, minimizing memory allocations.
2. **Deterministic Layout Math:**
   - Fruit stacking inside baskets uses polar coordinates with random angular jitter:
     $$r_i = R \cdot \sqrt{\frac{i + 0.5}{N}}, \quad \theta_i = i \cdot 2.399963\dots \text{ (Golden Angle)}$$
   - Ensures visually pleasing non-overlapping fruit piles within the cylindrical basket volume.
3. **Raycasting & Interaction:**
   - Discrete hitboxes on Basket A and Basket B for effortless tapping on touchscreens and smartboards.
   - Cursor style dynamically updates to pointer on hover.
4. **Lifecycle & Memory Management:**
   - On unmount, `renderer.dispose()`, `cancelAnimationFrame()`, geometry buffer disposal, and material disposal are executed cleanly to avoid memory leaks.

---

## 4. 2D/3D Hybrid Techniques in Other Simulations

- **Number Garden (Sim 02):**
  - CSS 3D transforms (`perspective: 1000px`, `transform: translateZ(...) rotateX(...)`) give depth and physical responsiveness to flowers, butterflies, and fruits.
- **Number Tracing Slate (Sim 04):**
  - High-DPI canvas scaling (`window.devicePixelRatio`) prevents blurry chalk strokes.
  - SVG vector paths overlay with `<canvas>` pointer captures for smooth 120Hz stylus and finger tracing.
- **Number Sequence River (Sim 05):**
  - Animated CSS water current ripple and 2.5D stone depth gradients.

