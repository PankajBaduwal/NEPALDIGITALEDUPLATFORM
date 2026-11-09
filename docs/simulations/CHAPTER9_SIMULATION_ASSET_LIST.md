# Class 1 Mathematics – Chapter 9: Numbers 11–20 (११ देखि २० सम्मका सङ्ख्याहरू)
## Simulation Asset and Audio Specifications

---

## 1. 3D WebGL Procedural Geometry Assets (`NumberGardenEnvironment.ts`)

All 3D assets are procedurally generated in Three.js without external heavy asset dependencies, enabling instant 60 FPS loading on low-power classroom laptops and tablets:

| Asset Name | Three.js Geometry Primitive | Material & Shading | Interactivity / Behavior |
|---|---|---|---|
| **Apple (स्याउ)** | `SphereGeometry(0.28, 16, 16)` + `CylinderGeometry` stem | Shiny red `MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25 })` | Raycast clickable; emits highlight ring and pops into counted state |
| **Flower (फूल)** | Center sphere + 5 petal discs | Bright pink/yellow `MeshStandardMaterial({ color: 0xec4899 })` | Gentle rotational idle animation, raycast clickable |
| **Balloon (बेलुन)** | Stretched sphere + knot + line | Vibrant purple `MeshStandardMaterial({ color: 0x8b5cf6 })` | Floats with vertical sinusoidal bobbing, raycast clickable |
| **Butterfly (पुतली)** | Slender body + 2 animated wing planes | Cyan/emerald `MeshStandardMaterial({ color: 0x06b6d4 })` | Wing flapping rotation on Y/Z axis, raycast clickable |
| **Fruit Tree (रूख)** | Cylinder trunk + layered foliage spheres | Wood brown & forest green phong material | Background landmark & host for hanging apples |
| **Display Table (टेबुल)** | Box top + 4 cylinder legs | Nepali wood finish `MeshStandardMaterial({ color: 0x854d0e })` | Staging surface for countable collections |
| **Garden Ground & River** | Subdivided plane with terrain variation | Meadow green `0x15803d` with stone pathway | Supports character movement & spatial depth |

---

## 2. 2D Interactive UI & SVG Components

| Component / Icon | Source | Application |
|---|---|---|
| `Package`, `Boxes` | Lucide React | Visual bundles and loose ones representation in Simulation 02 |
| `Columns`, `Layers`, `Grid` | Lucide React | Place value table and base-ten rod/cube stacks in Simulation 03 |
| `Compass`, `Footprints` | Lucide React | Number line navigation and character position indicators in Simulation 04 |
| `Store`, `TrainTrack`, `Mountain` | Lucide React | Village challenge stations in Simulation 05 |
| `Trophy`, `Award`, `Sparkles` | Lucide React | Evaluation quiz and celebration victory badges |

---

## 3. Audio & Speech Synthesis Architecture

1. **Web Audio API Sound Synthesizer:**
   - **Click chime:** 480–520 Hz sine oscillator with 0.1s exponential dampening.
   - **Bundle swoosh:** Rising arpeggio [330Hz, 440Hz, 550Hz, 660Hz, 880Hz] imitating a bundling ribbon snap.
   - **Hop sound:** Frequency-modulated sine wave (300Hz $\to$ 600Hz in 0.12s) simulating character jumping.
   - **Success chime:** Triad chord [523.25Hz (C5), 659.25Hz (E5), 783.99Hz (G5)].
   - **Victory fanfare:** Quad chord [C5, E5, G5, C6] for completed quizzes and star rewards.
   - **Boop / Try Again:** Low sawtooth tone (220Hz, 0.2s duration) for gentle feedback.

2. **Bilingual Text-to-Speech Engine:**
   - **Nepali Speech Synthesis (`ne-NP`):** Real-time vocalization of Devanagari numerals, place values, and celebratory phrases (e.g. *"स्याबास! तपाईंले सही उत्तर रोज्नुभयो!"*).
   - **English Speech Synthesis (`en-US`):** Clear pronunciation of numbers, equations, and guidelines.

