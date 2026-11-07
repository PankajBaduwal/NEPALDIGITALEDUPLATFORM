# Class 1 Mathematics Chapter 5: Asset & Component Directory

## 1. Directory Structure

```
frontend/src/simulations/class1-math-ch5/
├── ZeroPlaygroundEnvironment.ts  # Three.js 3D WebGL scene with tree, pond, bench, house, and Raycaster
├── ZeroDiscoveryPlayground.tsx   # Simulation 01: 3D playground with 5 guided levels & 12-question quiz
├── EmptyBasketAdventure.tsx      # Simulation 02: Market stall empty containers, in/out move & card matching
├── WhereDidEverythingGo.tsx      # Simulation 03: Object departures (birds, ducks, apples, balloons)
├── CountTheVillage.tsx           # Simulation 04: Scavenger hunt comparing zero vs occupied village spots
└── ZeroChallenge.tsx             # Simulation 05: 5-level progressive challenge mini-game
```

---

## 2. 3D & Procedural Geometry Assets (ZeroPlaygroundEnvironment.ts)

| Item Name | Geometry Primitive | Material / Texture | Description |
|---|---|---|---|
| **Grassy Terrain** | `PlaneGeometry(28, 28)` | Green Lush Grass `MeshStandardMaterial({ color: 0x4ade80, roughness: 0.9 })` | Ground plane of playground. |
| **Footpath** | `RingGeometry(2.5, 3.8, 32)` | Himalayan Terracotta Clay `MeshStandardMaterial({ color: 0xd97706 })` | Winding path through the playground. |
| **Village Tree** | Trunk: `CylinderGeometry(0.35, 0.5, 3.2)`<br>Foliage: `DodecahedronGeometry` clusters | Trunk: Warm Bark `0x78350f`<br>Canopy: Forest Green `0x16a34a` | Large shaded tree with horizontal perching branch. |
| **Pond & Rim** | Water: `CircleGeometry(1.6, 32)`<br>Rim: `TorusGeometry(1.65, 0.14)` | Water: Clear Aqua `0x0284c7, metalness: 0.3`<br>Stone: Slate Grey `0x64748b` | Small village pond where ducks swim. |
| **Park Bench** | Planks: `BoxGeometry(2.4, 0.1, 0.6)`<br>Legs: `CylinderGeometry(0.04, 0.55)` | Cedar Wood `0xb45309`<br>Legs: Dark Iron `0x334155` | Wooden bench for village children to sit on. |
| **Basket Table** | Top: `CylinderGeometry(1.2, 0.15)`<br>Basket: `CylinderGeometry(0.7, 0.5, 0.35)` | Cedar Pedestal `0xa16207`<br>Wicker Bowl: `0x92400e` | Center display table for apple basket. |
| **Village Cottage** | Walls: `BoxGeometry(3.6, 2.4, 3.2)`<br>Roof: `ConeGeometry(2.8, 1.4, 4)` | Walls: Stucco Cream `0xfef3c7`<br>Roof: Red Clay Tile `0xb91c1c` | Traditional Nepalese village house facade. |
| **Countable 3D Apples** | Body: `SphereGeometry(0.14, 16, 16)`<br>Stem: `CylinderGeometry(0.015, 0.08)` | Ruby Red `0xdc2626, roughness: 0.3`<br>Dark Bark `0x451a03` | Apples sitting inside or removed from basket. |
| **Countable 3D Birds** | Body: `SphereGeometry(0.1)`<br>Beak: `ConeGeometry(0.025, 0.06)` | Bluebird `0x0284c7`<br>Orange Beak `0xf59e0b` | Bluebirds perched on the tree branch. |
| **Countable 3D Ducks** | Body: Scaled `SphereGeometry(0.13)`<br>Beak: `BoxGeometry(0.06, 0.025, 0.05)` | Golden Yellow `0xfacc15`<br>Orange Beak `0xea580c` | Yellow ducklings swimming in the pond with wave bobbing. |
| **Countable 3D Children** | Torso: `CylinderGeometry(0.14, 0.45)`<br>Head: `SphereGeometry(0.12)` | Vibrant Shirts (`0xef4444, 0x3b82f6, 0x10b981`) | Friendly village children sitting on the bench. |

---

## 3. Audio & Acoustic Synthesis (Web Audio API)

All audio effects are generated dynamically via the Web Audio API without requiring external audio downloads:
- **Removal Tone:** Pitch-scaled sine/triangle wave ($400 + (\text{count} \times 60)\text{ Hz}$) giving feedback as quantity decreases.
- **Zero Discovery Fanfare:** Harmonic major chord (C5 $523.25\text{ Hz} \to$ E5 $659.25\text{ Hz} \to$ A5 $880\text{ Hz}$) triggered when count reaches zero.
- **Correct Selection Tone:** Crisp triangle arpeggio ($659.25\text{ Hz} \to 880\text{ Hz}$) on identifying an empty container.
- **Gentle Retry Buzzer:** Soft low sawtooth wave ($280\text{ Hz}, 0.3\text{ s}$) encouraging the student to observe more closely.

---

## 4. Web Speech API Narration

Authentic dual-language voice output:
- **Nepali (`ne-NP`):** "टोकरी खाली भयो! शून्य (०) स्याउ बाँकी छन्!", "कुन टोकरीमा शून्य स्याउ छन्?", "सबै चरा उडेर गए!"
- **English (`en-US`):** "The basket is empty! Zero (0) apples remain!", "Which basket is empty?", "All birds flew away!"

