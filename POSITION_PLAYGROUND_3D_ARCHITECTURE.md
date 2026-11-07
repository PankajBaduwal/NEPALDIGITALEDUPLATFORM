# Position Playground 3D Architecture
**Simulation 01:** My 3D Position Playground – Inside, Outside, Above and Below  
**Technology:** Three.js, WebGL, Web Audio API, Web Speech API  

---

## 1. 3D Scene Graph Hierarchy

```
Three.js Scene
├── Lighting
│   ├── AmbientLight (0xfff6e6, intensity 0.75)
│   ├── DirectionalLight [Sun] (0xfffaed, intensity 1.1, shadow caster)
│   └── DirectionalLight [Sky Fill] (0x9bd8ff, intensity 0.45)
├── Background & Environment
│   ├── Fog (0xbfe3ff, 35 to 75 units)
│   ├── Mountain Group (4 Himalayan peaks with snow caps)
│   ├── Rolling Green Hills (Deformed ellipsoids)
│   └── Circular Lawn Ground (Cylinder geometry with soft shadow receiving)
├── Village Architecture (House Group)
│   ├── Stone Plinth Foundation
│   ├── Veranda (पिँढी) with wooden pillars
│   ├── Exterior White Mud Plaster Walls
│   ├── Carved Wooden Windows (आँखीझ्याल)
│   ├── Hinged Door Group (Animated rotation around Y axis)
│   └── Terracotta / Slate Pitched Roof with wooden rafters
├── Props & Interactive Drop Targets
│   ├── Wooden Table & Stool (Above / Below reference)
│   ├── Traditional Bamboo Basket (डोको / टोकरी - Inside / Outside reference)
│   ├── Brass Water Pitcher (गाग्री - PBR metallic material)
│   ├── School Bag (झोला)
│   ├── Colourful Play Ball (Spherical mesh with stripe)
│   ├── Pine Trees & Blooming Rhododendron (गुराँस)
│   └── Flower Beds (Marigold clusters)
└── Animated Characters & Animals Group
    ├── Nepali Child Character (Dhaka Topi, uniform, breathing animation)
    ├── Tabby Cat (Curved tail wag, head swivel)
    ├── Golden Bhote Dog (Floppy ears, tail wag, panting)
    ├── Turquoise Bird (Flapping wing cycles, perching)
    └── White Rabbit (Upright ears, hopping cycle)
```

---

## 2. Lighting, Shadows & Material Pipeline

- **Shadow Mapping:** `THREE.PCFSoftShadowMap` with a 2048x2048 shadow depth map and tight frustum bounds (20 units) to provide crisp, soft shadows under animals and architectural pillars.
- **Tone Mapping:** `THREE.ACESFilmicToneMapping` with exposure 1.05 for natural daylight ambiance resembling a Himalayan morning.
- **Material Efficiency:** Lambertian materials (`MeshLambertMaterial`) for diffuse architectural surfaces and foliage to sustain 60 FPS on low-power tablets and Smart Boards; Standard PBR materials (`MeshStandardMaterial`) reserved for metallic highlights on the brass water pot (गाग्री) and play balls.
- **Garbage Collection & Disposal:** Scene unmount listeners dispose geometries, textures, and render targets, preventing memory leaks during classroom switching.

---

## 3. Camera Rig & Viewport Boundaries

- **Projection:** Perspective camera with a 45° field of view.
- **Default Position:** Isometric three-quarter view at `(12, 11, 16)`, looking at `(0, 1.2, 0)`.
- **User Controls:** Restricted orbit and single-click "Reset View" button ensuring Class 1 children cannot get lost in empty space or flip the camera upside down.

