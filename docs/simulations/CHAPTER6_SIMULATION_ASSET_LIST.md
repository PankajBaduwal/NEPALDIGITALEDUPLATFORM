# Class 1 Mathematics Chapter 6: Asset & Component Directory

## 1. Directory Structure

```
frontend/src/simulations/class1-math-ch6/
├── TenObjectsEnvironment.ts      # Three.js 3D WebGL scene with orchard, apple tree, garden, table, basket, raycaster
├── TenObjectAdventure.tsx        # Simulation 01: 3D orchard with 5 guided levels & 15-question quiz
├── NumberTenDiscovery.tsx        # Simulation 02: 4 Pillars of 10, distractor card picker, object matching
├── MakeTenChallenge.tsx          # Simulation 03: Dual-basket partitioning (1+9...5+5) and missing-item puzzles
├── CountAndMatchTen.tsx          # Simulation 04: Multi-scene village counting (garden, pond, classroom, market, orchard)
└── NumberTenWritingStudio.tsx    # Simulation 05: Chalkboard slate with guided SVG stroke tracing for 10 and १०
```

---

## 2. 3D & Procedural Geometry Assets (`TenObjectsEnvironment.ts`)

| Item Name | Geometry Primitive | Material / Color | Description |
|---|---|---|---|
| **Grassy Terrain** | `PlaneGeometry(32, 32)` | Green Lush Grass `MeshStandardMaterial({ color: 0x4ade80, roughness: 0.9 })` | Ground plane of orchard. |
| **Pebblestone Path** | `RingGeometry(3.0, 4.4, 32)` | Terracotta Path `MeshStandardMaterial({ color: 0xd97706 })` | Winding path through orchard trees. |
| **Central Apple Tree** | Trunk: `CylinderGeometry(0.4, 0.6, 3.8)`<br>Foliage: `DodecahedronGeometry` clusters | Trunk: Warm Bark `0x78350f`<br>Canopy: Forest Green `0x16a34a` | Large apple tree holding 10 countable 3D apples. |
| **10 Countable Apples** | Body: `SphereGeometry(0.16, 16, 16)`<br>Stem: `CylinderGeometry(0.015, 0.08)` | Ruby Red `0xdc2626`<br>Stem: Dark Brown `0x451a03` | Apples positioned across foliage with clickable raycaster IDs. |
| **Flower Garden Bed** | Soil: `BoxGeometry(3.6, 0.15, 1.4)`<br>Border: `TorusGeometry` stones | Dark Loam `0x451a03`<br>Border: Stone Grey `0x64748b` | Flowerbed containing 10 blooming marigold flowers. |
| **10 Countable Marigolds** | Stem: `CylinderGeometry(0.02, 0.35)`<br>Petals: `DodecahedronGeometry(0.12)` | Stem: Green `0x15803d`<br>Flower: Orange-Gold `0xf59e0b` | Vibrantly colored marigolds standing in garden bed. |
| **Picnic Table** | Top: `BoxGeometry(2.8, 0.12, 1.4)`<br>Legs: `CylinderGeometry(0.06, 0.75)` | Cedar Wood `0xb45309`<br>Legs: Cast Iron `0x334155` | Wooden table holding fruit collection. |
| **10 Countable Oranges** | Scaled `SphereGeometry(0.14)` | Citrus Orange `0xf97316` | Oranges arranged in a $5 \times 2$ grid on table. |
| **Wicker Collection Basket** | Bowl: `CylinderGeometry(0.8, 0.55, 0.45, 16)`<br>Rim: `TorusGeometry(0.8, 0.05)` | Wicker Weave `0x92400e` | Central collection basket receiving harvested apples. |
| **Selection Ring / Aura** | `RingGeometry(0.18, 0.24, 24)` | Emissive Gold `0xfef08a` | Visual halo appearing around counted items. |

---

## 3. Audio & Acoustic Synthesis (Web Audio API)

All audio effects are generated dynamically via the Web Audio API without requiring external audio downloads:
- **Sequential Counting Note:** Progressive frequency ramp ($320 + (\text{count} \times 45)\text{ Hz}$) reinforcing numerical climb from 1 to 10.
- **Ten Fanfare:** Full celebratory chord progression (C5 $523.25\text{ Hz} \to$ E5 $659.25\text{ Hz} \to$ G5 $783.99\text{ Hz} \to$ C6 $1046.5\text{ Hz}$) when 10 is reached.
- **Pair Combination Chime:** Dual harmonic chime ($440\text{ Hz} + 660\text{ Hz}$) when matching groups sum to 10.
- **Chalkboard Trace Tone:** Continuous gentle white-noise filtered hum while tracing strokes on the slate.
- **Gentle Encouragement Buzzer:** Soft low tone ($260\text{ Hz}, 0.25\text{ s}$) for incorrect selections.

---

## 4. Web Speech API Narration

Authentic dual-language voice output:
- **Nepali (`ne-NP`):** "स्याउ गन्ती गरौँ: एक, दुई, तीन... दश!", "कुन समूहमा ठ्याक्कै १० वटा वस्तु छन्?", "५ र ५ मिलेर १० बन्छ!", "सङ्ख्या १० राम्रोसँग लेख्नुभयो!"
- **English (`en-US`):** "Let's count apples: one, two, three... ten!", "Which group has exactly 10 items?", "5 and 5 make 10!", "Great job writing number 10!"

