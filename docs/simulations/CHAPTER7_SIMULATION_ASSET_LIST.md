# Class 1 Mathematics Chapter 7: Asset & Component Directory

## 1. Directory Structure

```
frontend/src/simulations/class1-math-ch7/
├── AdditionEnvironment.ts       # Three.js 3D WebGL scene with playground, baskets, animated combiner, raycaster
├── AdditionPlayground.tsx       # Simulation 01: 3D playground with 5 guided levels & 15-question quiz
├── MakeTheTotal.tsx             # Simulation 02: 7 pictorial addition scenes (baskets, trees, ponds, boxes)
├── NumberBondHouses.tsx         # Simulation 03: Interactive 2-room number houses for totals 5, 6, 7, 8, 9, 10
├── CountOnAdventure.tsx         # Simulation 04: Stepping-stone path 0 to 10 with animated character
└── AdditionEquationStudio.tsx   # Simulation 05: Chalkboard equation builder with +, =, and number cards
```

---

## 2. 3D & Procedural Geometry Assets (`AdditionEnvironment.ts`)

| Item Name | Geometry Primitive | Material / Color | Description |
|---|---|---|---|
| **Lush Playground Plane** | `PlaneGeometry(36, 36)` | Green Grass `MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 })` | Terrain of village playground. |
| **Pedestals & Tables** | `CylinderGeometry(0.9, 1.1, 0.9)` & `BoxGeometry(2.4, 0.7, 1.6)` | Cedar Wood `0xb45309`<br>Dark Wood `0x78350f` | Support pedestals for Basket A, Basket B, and Center Table. |
| **Group A Wicker Basket** | `CylinderGeometry(0.75, 0.55, 0.4)` | Warm Amber `0xd97706` | Basket holding Group A countable objects. |
| **Group B Wicker Basket** | `CylinderGeometry(0.75, 0.55, 0.4)` | Teal Sky `0x0284c7` | Basket holding Group B countable objects. |
| **Combined Large Basket** | `CylinderGeometry(1.15, 0.85, 0.45)` | Emerald Green `0x16a34a` | Large central basket receiving merged items. |
| **Countable Apples** | Body: `SphereGeometry(0.16)`<br>Stem: `CylinderGeometry(0.015, 0.08)` | Ruby Red `0xdc2626`<br>Dark Bark `0x451a03` | Realistic 3D apples with stems. |
| **Countable Mangoes** | Body: Scaled `SphereGeometry(0.18)`<br>Leaf: `ConeGeometry(0.04, 0.12)` | Golden Yellow `0xf59e0b`<br>Leaf: `0x15803d` | Nepalese Alphonso mangoes with green leaves. |
| **Countable Flowers** | Petals: `DodecahedronGeometry(0.16)`<br>Center: `SphereGeometry(0.07)` | Rose Pink `0xf43f5e`<br>Center: Gold `0xfacc15` | Blooming flowers for garden addition. |
| **Countable Toy Balls** | Body: `SphereGeometry(0.16)`<br>Stripe: `TorusGeometry(0.162, 0.02)` | Cobalt Blue `0x3b82f6`<br>Stripe: Gold `0xfef08a` | Playful sports balls with equatorial stripe. |
| **Village Background** | Pickets: `BoxGeometry(0.12, 1.1, 0.06)`<br>Cottage: `BoxGeometry` & `ConeGeometry` | Stucco `0xfef3c7`, Roof `0xb91c1c` | Background fence, shade tree, and cottage. |

---

## 3. Audio & Acoustic Synthesis (Web Audio API)

All audio effects are generated dynamically via the Web Audio API without requiring external audio downloads:
- **Object Tap & Counting Tone:** Pitch-ramped frequency ($320 + (\text{step} \times 50)\text{ Hz}$) giving ascending feedback.
- **Group Combining Swoosh:** Rising sine sweep ($260\text{ Hz} \to 640\text{ Hz}$) playing during the animated migration of objects.
- **Success Chime:** Three-note chord progression (C5 $523.25\text{ Hz} \to$ E5 $659.25\text{ Hz} \to$ G5 $783.99\text{ Hz}$) on correct answer.
- **Fanfare:** Grand 4-note celebration chord (C5 $\to$ E5 $\to$ G5 $\to$ C6 $1046.5\text{ Hz}$) on completion.
- **Gentle Encouragement Buzzer:** Soft low sawtooth wave ($220\text{ Hz}, 0.2\text{ s}$) encouraging student to recount.

---

## 4. Web Speech API Narration

Authentic dual-language voice output:
- **Nepali (`ne-NP`):** "दुई समूहलाई एकै ठाउँमा राख्दा जम्मा सङ्ख्या पत्ता लाग्छ।", "२ र ३ मिलाउँदा जम्मा ५ हुन्छ!", "हामीले ४ गनिसक्यौँ। अब २ वटा थप गनौँ: पाँच, छ।", "सङ्ख्या वाक्य बनाउनुहोस्!"
- **English (`en-US`):** "When we put two groups together, we find the total.", "Combining 2 and 3 makes 5 altogether!", "We already counted 4. Now count on 2 more: five, six.", "Build the addition equation!"

