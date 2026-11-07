# Class 1 Mathematics Chapter 8: Asset & Component Directory

## 1. Directory Structure

```
frontend/src/simulations/class1-math-ch8/
├── SubtractionEnvironment.ts         # Three.js 3D WebGL scene with playground, baskets, removal animations, raycaster
├── SubtractionPlayground.tsx         # Simulation 01: 3D playground with 4 levels, 15-question quiz & free explore
├── EmptyTheBasketAdventure.tsx       # Simulation 02: 6 container activities (baskets, toy boxes, nests, flower pots)
├── SubtractionEquationStudio.tsx     # Simulation 03: Horizontal, vertical, and missing-number equation builder
├── DifferenceExplorer.tsx            # Simulation 04: One-to-one pair matching and numerical difference comparator
└── SubtractionChallengeWorld.tsx     # Simulation 05: 5 village stations (fruit shop, bird garden, toy house, flower garden, challenge)
```

---

## 2. 3D & Procedural Geometry Assets (`SubtractionEnvironment.ts`)

| Item Name | Geometry Primitive | Material / Color | Description |
|---|---|---|---|
| **Lush Playground Plane** | `PlaneGeometry(36, 36)` | Green Grass `MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 })` | Ground plane of playground. |
| **Main Station Table** | `BoxGeometry(2.4, 0.7, 1.8)` | Cedar Wood `0xb45309, roughness: 0.8` | Table holding initial set of objects. |
| **Main Wicker Basket** | `CylinderGeometry(1.0, 0.75, 0.42, 24)` | Warm Amber `0xd97706` | Large holding basket containing items. |
| **Removal Station Pedestal** | `CylinderGeometry(0.7, 0.85, 0.6, 20)` | Dark Wood `0x78350f` | Support for removal container. |
| **Removal Basket** | `CylinderGeometry(0.75, 0.55, 0.38, 20)` | Crimson Rose `0xe11d48` | Container receiving removed objects. |
| **Countable 3D Apples** | Body: `SphereGeometry(0.16)`<br>Stem: `CylinderGeometry(0.015, 0.08)` | Ruby Red `0xdc2626`<br>Dark Bark `0x451a03` | Realistic apples with stem. |
| **Countable 3D Bananas** | Body: Curved `CylinderGeometry(0.04, 0.05, 0.36)` | Ripe Yellow `0xfacc15`<br>Tip: `0x451a03` | Ripe curved bananas. |
| **Countable 3D Flowers** | Petals: `DodecahedronGeometry(0.15)`<br>Center: `SphereGeometry(0.07)` | Rose Pink `0xf43f5e`<br>Center: Gold `0xfacc15` | Blooming flowers. |
| **Countable 3D Balls** | Body: `SphereGeometry(0.16)`<br>Stripe: `TorusGeometry(0.162, 0.02)` | Cobalt Blue `0x3b82f6`<br>Stripe: Gold `0xfef08a` | Striped toy balls. |
| **Countable 3D Birds** | Body: `SphereGeometry(0.12)`<br>Beak: `ConeGeometry(0.035, 0.08)` | Bluebird `0x0284c7`<br>Beak: Orange `0xf59e0b` | Bluebirds that fly/move on removal. |

---

## 3. Audio & Acoustic Synthesis (Web Audio API)

All audio effects are generated dynamically via the Web Audio API without requiring external audio downloads:
- **Removal Pitch-Down Tone:** Decreasing frequency ramp ($450 - (\text{step} \times 35)\text{ Hz}$) giving feedback as quantity decreases.
- **Pair Matching Chime:** Ascending harmonic chime ($320\text{ Hz} \to 640\text{ Hz}$) when one-to-one pair is connected.
- **Success Tone:** Three-note chord (C5 $523.25\text{ Hz} \to$ E5 $659.25\text{ Hz} \to$ G5 $783.99\text{ Hz}$) on verified answer.
- **Fanfare:** Grand 4-note celebration chord (C5 $\to$ E5 $\to$ G5 $\to$ C6 $1046.5\text{ Hz}$) on completion.
- **Gentle Encouragement Buzzer:** Soft low tone ($220\text{ Hz}, 0.2\text{ s}$) for incorrect answers.

---

## 4. Web Speech API Narration

Authentic dual-language voice output:
- **Nepali (`ne-NP`):** "६ ओटा स्याउ छन्। २ ओटा स्याउ हटाउनुहोस्। कति ओटा स्याउ बाँकी रहन्छन्?", "८ बाट ३ घटाउँदा ५ बाँकी रहन्छ।", "शून्य घटाउँदा सङ्ख्यामा परिवर्तन हुँदैन!", "केटीहरूभन्दा केटाहरू कति जना बढी छन्?"
- **English (`en-US`):** "There are 6 apples. Take away 2 apples. How many remain?", "Taking away 3 from 8 leaves 5.", "Subtracting zero leaves the count unchanged!", "How many more boys are there than girls?"

