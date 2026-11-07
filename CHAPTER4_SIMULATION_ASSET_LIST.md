# Class 1 Mathematics Chapter 4: Asset & Component Directory

## 1. Directory Structure

```
frontend/src/simulations/class1-math-ch4/
├── ManyFewEnvironment.ts        # Three.js 3D Scene setup, marketplace table, baskets, procedural fruits & lighting
├── ManyFewAdventure.tsx          # Simulation 01: Many & Few interactive 3D playground with 15-question quiz
├── NumberGardenSimulation.tsx    # Simulation 02: Nature counting garden (1 to 9 items, touch protection, speech)
├── NumberMatchingSimulation.tsx  # Simulation 03: Dual-column matching matrix (Quantities <-> Dual Numerals <-> Names)
├── NumberTracingSimulation.tsx   # Simulation 04: Digital wooden chalkboard slate with SVG guide paths and canvas
└── NumberSequenceSimulation.tsx  # Simulation 05: Stepping stone river crossing, card ordering, and missing numbers
```

---

## 2. 3D & Procedural Geometry Assets

| Item Name | Geometry Primitive | Material / Texture | Use Case |
|---|---|---|---|
| **Marketplace Table** | `BoxGeometry(6, 0.4, 3.5)` | Warm Cedar Wood `MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 })` | Display surface for fruit baskets in Simulation 01. |
| **Fruit Baskets (A & B)** | `CylinderGeometry(0.85, 0.65, 0.5, 32, 1, true)` | Woven Wicker `MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 })` | Interactive containers holding items to compare. |
| **Apples** | `SphereGeometry(0.14, 16, 16)` + Stem `CylinderGeometry(0.015, 0.015, 0.08)` | Ruby Red `MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 })` | Countable 3D items inside baskets. |
| **Mangoes** | `SphereGeometry(0.15, 16, 16)` scaled non-uniformly | Golden Yellow `MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })` | Countable 3D items inside baskets. |
| **Flowers** | Petal disks `CircleGeometry(0.1, 8)` + Center sphere | Rose Pink / Daffodil Yellow `MeshStandardMaterial({ color: 0xec4899 })` | Countable 3D items inside baskets. |
| **Balls** | `SphereGeometry(0.14, 16, 16)` | Vibrant Cyan `MeshStandardMaterial({ color: 0x0284c7, metalness: 0.1 })` | Countable 3D items inside baskets. |
| **River Stepping Stones** | Radial gradient styled rounded nodes | Mountain River Slate | Stepping targets in Simulation 05 river crossing. |

---

## 3. Audio & Acoustic Synthesis (Web Audio API)

No external `.mp3` or `.wav` dependencies are required. All sound effects are generated algorithmically using zero-latency Web Audio oscillators:
- **Success Chime:** Two-tone harmonic arpeggio (F5 $587.33\text{ Hz} \to$ A5 $880\text{ Hz}$, triangle wave, exponential decay).
- **Correct Step Tone:** Pitch-scaled sine tone ($523.25 + (\text{step} \times 40)\text{ Hz}$) giving auditory feedback of climbing higher in the number sequence.
- **Gentle Wobble / Error:** Low sawtooth buzz ($260\text{ Hz}$ to $280\text{ Hz}$, $0.3\text{ s}$ duration) indicating non-matching items without harshness.
- **Victory Fanfare:** 3-step celebratory arpeggio (C5 $\to$ E5 $\to$ G5 $\to$ C6) on stage/simulation completion.

---

## 4. Speech Synthesis Narration (Web Speech API)

The platform utilizes standard `window.speechSynthesis` with dynamic language switching:
- **Nepali Mode (`ne-NP`):** Speaks authentic Nepali phrasing:
  - "कुन टोकरीमा धेरै स्याउहरू छन्?"
  - "सङ्ख्या १, एक"
  - "अति राम्रो! नदी पार भयो!"
- **English Mode (`en-US`):** Speaks standard English equivalents:
  - "Which basket has more apples?"
  - "Number 1, One"
  - "Hooray! You crossed the river!"

