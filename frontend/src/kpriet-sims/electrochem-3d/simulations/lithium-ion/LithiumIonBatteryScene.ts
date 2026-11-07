/**
 * 3D Lithium-Ion Battery (LFP / Graphite) Simulation
 * Detailed 3D CAD-like model with cutaway, exploded stack, microscopic intercalation,
 * external circuit with rotating motor load / charger, and live particle streams.
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type {
  StageDefinition,
  ComponentInspectionData,
  SimulationMode,
  SimulationOptions,
} from '../../types';
import { LithiumIonModel } from './LithiumIonModel';

export class LithiumIonBatteryScene extends BaseSimulation {
  private model = new LithiumIonModel();

  // Root Groups
  private batteryGroup = new THREE.Group();
  private casingSolidGroup = new THREE.Group();
  private casingCutawayGroup = new THREE.Group();
  private electrodeStackGroup = new THREE.Group();
  private explodedStackGroup = new THREE.Group();
  private circuitGroup = new THREE.Group();
  private microscopicGroup = new THREE.Group();
  private topLid = new THREE.Group();

  // Moving Layer Refs for Exploded View
  private explodedLayers: { mesh: THREE.Object3D; basePos: THREE.Vector3; explodePos: THREE.Vector3 }[] = [];

  // Motor / Circuit Refs
  private motorRotorMesh: THREE.Object3D | null = null;
  private switchContactMesh: THREE.Object3D | null = null;
  private chargerLedMesh: THREE.Mesh | null = null;

  // Particle Path Curves
  private liIonCurveDischarge!: THREE.CatmullRomCurve3;
  private electronCurveDischarge!: THREE.CatmullRomCurve3;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected buildStages() {
    this.stages = [
      {
        id: 'li-stage-1',
        index: 0,
        title: 'Stage 1: Prismatic Anatomy & Multi-Layer Architecture',
        shortDescription: 'Heavy-duty industrial aluminum prismatic casing with laser-welded hermetic seal.',
        detailedExplanation:
          'Commercial lithium-ion cells employ rugged aluminum alloy casings to withstand internal pressure and mechanical vibration. Inside lies a multi-layer electrode roll composed of copper and aluminum current collector foils coated with active materials, insulated by a sub-micron microporous polyolefin separator.',
        chemicalReactions: [
          'Nominal Cell Voltage: 3.20 V (LFP Operating Range: 2.50 V – 3.65 V)',
          'Specific Energy: ~140–160 Wh/kg (Exceptional cycle life > 3500 cycles)',
        ],
        keyTerminology: [
          { term: 'Current Collector', definition: 'High-purity metallic foil (Cu for anode, Al for cathode) conducting electrons.' },
          { term: 'Hermetic Lid', definition: 'Laser-welded top cover isolating non-aqueous electrolyte from moisture.' },
        ],
        highlightComponentIds: ['li-casing', 'li-terminals', 'li-vent'],
        recommendedCamera: { position: [4.5, 3.2, 5.5], target: [0, 0, 0] },
      },
      {
        id: 'li-stage-2',
        index: 1,
        title: 'Stage 2: Internal Stack & Active Electrode Chemistry',
        shortDescription: 'Graphite anode (C₆) and Lithium Iron Phosphate (LiFePO₄) olivine cathode.',
        detailedExplanation:
          'Inspection reveals the distinct functional layers. The negative electrode uses crystalline synthetic graphite coated on copper foil. The positive electrode utilizes lithium iron phosphate (LiFePO₄) on aluminum foil. A microporous separator prevents electrical short-circuits while allowing solvated Li⁺ ions to diffuse through its liquid electrolyte-filled pores.',
        chemicalReactions: [
          'Cathode: LiFePO₄ (Triphylite / Olivine structure, Pnma space group)',
          'Anode: Li_x C₆ (Graphite staging structure, intercalated lithium)',
          'Electrolyte: 1.0 M LiPF₆ dissolved in EC : DMC organic carbonates',
        ],
        keyTerminology: [
          { term: 'Intercalation', definition: 'Reversible insertion of Li⁺ ions into a host lattice without destroying crystal structure.' },
          { term: 'Separator', definition: 'Porous polyethylene/polypropylene film permeable to ions but impermeable to electrons.' },
        ],
        highlightComponentIds: ['li-cathode-lfp', 'li-anode-graphite', 'li-separator'],
        recommendedCamera: { position: [2.8, 2.0, 3.8], target: [0, 0, 0] },
      },
      {
        id: 'li-stage-3',
        index: 2,
        title: 'Stage 3: Galvanic Discharge (Supplying Electrical Load)',
        shortDescription: 'Spontaneous lithium deintercalation, internal Li⁺ transport, and external electron flow.',
        detailedExplanation:
          'When the circuit is closed across an electrical load, spontaneous oxidation occurs at the negative electrode. Li⁺ ions deintercalate from the graphite lattice and migrate across the porous separator through the electrolyte. Concurrently, electrons travel through the external copper circuit to power the load (spinning motor). At the positive electrode, Li⁺ ions and incoming electrons re-intercalate into the vacant olivine iron phosphate lattice.',
        chemicalReactions: [
          'Negative Electrode (Anode): Li_x C₆ → C₆ + x Li⁺ + x e⁻',
          'Positive Electrode (Cathode): Li_{1-x}FePO₄ + x Li⁺ + x e⁻ → LiFePO₄',
          'Overall Discharge: Li_x C₆ + Li_{1-x}FePO₄ → C₆ + LiFePO₄ + Electrical Work',
        ],
        keyTerminology: [
          { term: 'Deintercalation', definition: 'Release of lithium ions from the graphite anode into the electrolyte solution.' },
          { term: 'External Circuit', definition: 'The only path for electrons; electrons cannot cross the separator in a healthy cell.' },
        ],
        highlightComponentIds: ['li-load-motor', 'li-circuit-wiring', 'li-anode-graphite'],
        recommendedCamera: { position: [3.8, 3.5, 4.5], target: [0, 0.5, 0] },
      },
      {
        id: 'li-stage-4',
        index: 3,
        title: 'Stage 4: Electrolytic Charging (Energy Storage Restoration)',
        shortDescription: 'Reversal of ion and electron pathways driven by an external DC charger.',
        detailedExplanation:
          'An external DC power supply applies a charging potential higher than the cell open-circuit voltage (typically 3.60–3.65 V). Oxidation is now forced at the LiFePO₄ cathode, releasing Li⁺ ions into the electrolyte and extracting electrons. Li⁺ ions migrate back across the separator and intercalate into the graphite host, while electrons are delivered via the external charger.',
        chemicalReactions: [
          'Positive Electrode (Oxidation): LiFePO₄ → Li_{1-x}FePO₄ + x Li⁺ + x e⁻',
          'Negative Electrode (Reduction): C₆ + x Li⁺ + x e⁻ → Li_x C₆',
          'Net Energy: Electrical energy from charger stored as chemical potential.',
        ],
        keyTerminology: [
          { term: 'Electrolytic Mode', definition: 'Non-spontaneous reaction driven by an external electrical potential difference.' },
          { term: 'State of Charge (SOC)', definition: 'Ratio of stored usable capacity relative to maximum rated capacity (0–100%).' },
        ],
        highlightComponentIds: ['li-charger', 'li-cathode-lfp', 'li-anode-graphite'],
        recommendedCamera: { position: [3.2, 2.8, 4.2], target: [0, 0.4, 0] },
      },
      {
        id: 'li-stage-5',
        index: 4,
        title: 'Stage 5: Safety Architecture & Burst Vent Mechanism',
        shortDescription: 'Thermal runaway prevention, CID (current interrupt device) and pressure relief vent.',
        detailedExplanation:
          'Li-ion cells incorporate multi-stage safety hardware. If extreme overcharging or high temperatures cause electrolyte vaporization, internal pressure builds up. The precision-scored burst disk ruptures safely before the casing can rupture violently, venting pressurized gases through designated exhaust channels.',
        chemicalReactions: [
          'Burst Vent Rupture Pressure: 1.0 – 1.4 MPa (10–14 bar)',
          'LiFePO₄ Thermal Stability: Exothermic decomposition onset > 270 °C (far safer than NMC/LCO).',
        ],
        keyTerminology: [
          { term: 'Pressure Relief Vent', definition: 'Calibrated thin aluminum diaphragm engineered to rupture cleanly at critical overpressure.' },
          { term: 'Thermal Runaway', definition: 'Self-accelerating exothermic reaction prevented by stable phosphate P–O covalent bonds.' },
        ],
        highlightComponentIds: ['li-vent', 'li-casing'],
        recommendedCamera: { position: [1.5, 2.5, 2.2], target: [0, 1.2, 0] },
      },
    ];
  }

  protected buildScene() {
    this.batteryGroup = this.batteryGroup || new THREE.Group();
    this.casingSolidGroup = this.casingSolidGroup || new THREE.Group();
    this.casingCutawayGroup = this.casingCutawayGroup || new THREE.Group();
    this.electrodeStackGroup = this.electrodeStackGroup || new THREE.Group();
    this.explodedStackGroup = this.explodedStackGroup || new THREE.Group();
    this.circuitGroup = this.circuitGroup || new THREE.Group();
    this.microscopicGroup = this.microscopicGroup || new THREE.Group();

    this.scene.add(this.batteryGroup);

    // Grid Floor
    const grid = new THREE.GridHelper(16, 32, 0x334155, 0x1e293b);
    grid.position.y = -1.5;
    this.scene.add(grid);

    // 1. Build Casing (Solid & Cutaway variants)
    this.buildCasing();

    // 2. Build Internal Stack & Exploded Layers
    this.buildElectrodeStack();

    // 3. Build Microscopic Lattice Model
    this.buildMicroscopicModel();

    // 4. Build External Circuit & Motor Load
    this.buildExternalCircuit();

    // 5. Build Particle Paths
    this.buildParticleStreams();

    // Apply default inspection mode
    this.applyInspectionMode(this.inspectionMode);
  }

  private buildCasing() {
    // Industrial Prismatic Dimensions: Width 3.0, Height 2.4, Depth 1.2
    const casingMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Brushed metallic aluminum
      metalness: 0.85,
      roughness: 0.35,
    });
    this.allocatedMaterials.push(casingMat);

    // Casing Main Solid Body
    const casingGeo = new THREE.BoxGeometry(3.0, 2.4, 1.2);
    this.allocatedGeometries.push(casingGeo);
    const casingSolidMesh = new THREE.Mesh(casingGeo, casingMat);
    casingSolidMesh.castShadow = true;
    casingSolidMesh.receiveShadow = true;
    this.casingSolidGroup.add(casingSolidMesh);

    // Casing Cutaway Geometry (L-shaped cutout showing internals)
    // Left side & bottom preserved, front face & right upper corner open
    const cutawayMat = casingMat.clone();
    cutawayMat.side = THREE.DoubleSide;
    this.allocatedMaterials.push(cutawayMat);

    // Build cutaway using assembled plates: Back plate, Left plate, Bottom plate, Top half lid
    const backPlate = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.4, 0.05), cutawayMat);
    backPlate.position.set(0, 0, -0.575);
    const leftPlate = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.4, 1.2), cutawayMat);
    leftPlate.position.set(-1.475, 0, 0);
    const bottomPlate = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.05, 1.2), cutawayMat);
    bottomPlate.position.set(0, -1.175, 0);
    const topLidFrame = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 1.2), cutawayMat);
    topLidFrame.position.set(0, 1.2, 0);

    this.casingCutawayGroup.add(backPlate, leftPlate, bottomPlate, topLidFrame);

    // Top Lid Features (shared by both views)
    this.topLid = this.topLid || new THREE.Group();
    this.topLid.clear();
    const topLid = this.topLid;
    topLid.position.y = 1.24;

    // Laser weld seam bead along perimeter
    const seamMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.5 });
    const seamGeo = new THREE.TorusGeometry(1.4, 0.02, 8, 32);
    seamGeo.scale(1.0, 0.4, 1.0);
    const seamMesh = new THREE.Mesh(seamGeo, seamMat);
    seamMesh.rotation.x = Math.PI / 2;
    topLid.add(seamMesh);

    // Positive Terminal (+, Brass post with Red Insulator Bushing)
    const posBushingMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 }); // Red collar
    const posPostMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 }); // Brass
    const posBushing = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.08, 24), posBushingMat);
    posBushing.position.set(-0.9, 0.04, 0);
    const posPost = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.35, 24), posPostMat);
    posPost.position.set(-0.9, 0.22, 0);
    topLid.add(posBushing, posPost);

    // Negative Terminal (-, Nickel post with Black Insulator Bushing)
    const negBushingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }); // Black collar
    const negPostMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 }); // Nickel
    const negBushing = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.08, 24), negBushingMat);
    negBushing.position.set(0.9, 0.04, 0);
    const negPost = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.35, 24), negPostMat);
    negPost.position.set(0.9, 0.22, 0);
    topLid.add(negBushing, negPost);

    // Safety Burst Vent (Center scored circular diaphragm)
    const ventMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const ventMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 24), ventMat);
    ventMesh.position.set(0, 0.02, 0);
    // Laser cross-hatch burst score
    const scoreMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.02), new THREE.MeshBasicMaterial({ color: 0x1e293b }));
    scoreMesh.position.set(0, 0.03, 0);
    topLid.add(ventMesh, scoreMesh);

    this.batteryGroup.add(this.casingSolidGroup);
    this.batteryGroup.add(this.casingCutawayGroup);
    this.batteryGroup.add(topLid);
  }

  private buildElectrodeStack() {
    this.batteryGroup.add(this.electrodeStackGroup);
    this.batteryGroup.add(this.explodedStackGroup);

    // Layer Materials
    // 1. Aluminum Current Collector: high-shine silver
    const alCollectorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    // 2. LFP Cathode: dark olive-charcoal coating
    const lfpCathodeMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.7, metalness: 0.1 });
    // 3. Microporous Separator: Pale ivory/translucent matte
    const separatorMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8, metalness: 0.0 });
    // 4. Graphite Anode: dark matte grey
    const graphiteAnodeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9, metalness: 0.05 });
    // 5. Copper Current Collector: reddish copper
    const cuCollectorMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.2 });

    // Layer geometries: W 2.5, H 2.0, D 0.04
    const layerW = 2.5;
    const layerH = 2.0;
    const layerD = 0.03;

    // Assembled Stack: tightly packed repeating layers
    const assembledLayersGroup = new THREE.Group();
    const layerSpacing = 0.05;
    const layerCount = 14;

    for (let i = 0; i < layerCount; i++) {
      const z = -0.35 + i * layerSpacing;
      let mat = separatorMat;
      if (i % 4 === 0) mat = cuCollectorMat;
      else if (i % 4 === 1) mat = graphiteAnodeMat;
      else if (i % 4 === 2) mat = separatorMat;
      else if (i % 4 === 3) mat = lfpCathodeMat;

      const layerMesh = new THREE.Mesh(new THREE.BoxGeometry(layerW, layerH, layerD), mat);
      layerMesh.position.set(0, 0, z);
      assembledLayersGroup.add(layerMesh);
    }
    this.electrodeStackGroup.add(assembledLayersGroup);

    // Exploded View Layers: 5 representative layers separated along X/Z axis
    const layers = [
      { id: 'al-collector', name: 'Al Current Collector Foil', mat: alCollectorMat, explodeX: -1.8, color: '#e2e8f0' },
      { id: 'lfp-cathode', name: 'LiFePO₄ Cathode Active Coating', mat: lfpCathodeMat, explodeX: -0.9, color: '#3f3f46' },
      { id: 'separator', name: 'Microporous Polyolefin Separator', mat: separatorMat, explodeX: 0.0, color: '#fef08a' },
      { id: 'graphite-anode', name: 'Graphite Anode Active Coating', mat: graphiteAnodeMat, explodeX: 0.9, color: '#18181b' },
      { id: 'cu-collector', name: 'Cu Current Collector Foil', mat: cuCollectorMat, explodeX: 1.8, color: '#b45309' },
    ];

    layers.forEach((l) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.04), l.mat);
      mesh.position.set(0, 0, 0);
      mesh.castShadow = true;
      this.explodedStackGroup.add(mesh);

      this.explodedLayers.push({
        mesh,
        basePos: new THREE.Vector3(0, 0, 0),
        explodePos: new THREE.Vector3(l.explodeX, 0, 0.3),
      });
    });
  }

  private buildMicroscopicModel() {
    this.microscopicGroup.position.set(0, 0, 1.5);
    this.microscopicGroup.visible = false;
    this.scene.add(this.microscopicGroup);

    // Background HUD plate for microscopic lattice view
    const backPlacard = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 2.6, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    backPlacard.position.z = -0.4;
    this.microscopicGroup.add(backPlacard);

    // Left Lattice: Graphite Hexagonal Planes (represented by layered rings)
    const graphiteLattice = new THREE.Group();
    graphiteLattice.position.set(-1.2, 0, 0);

    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.3 });
    const ringGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 6);

    for (let layer = -2; layer <= 2; layer++) {
      for (let rx = -2; rx <= 2; rx++) {
        const ring = new THREE.Mesh(ringGeo, carbonMat);
        ring.position.set(rx * 0.32, layer * 0.45, 0);
        graphiteLattice.add(ring);
      }
    }
    this.microscopicGroup.add(graphiteLattice);

    // Right Lattice: LiFePO4 Olivine Channels (octahedral clusters)
    const lfpLattice = new THREE.Group();
    lfpLattice.position.set(1.2, 0, 0);
    const feMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }); // Fe-O octahedra
    const po4Mat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 }); // PO4 tetrahedra
    const octGeo = new THREE.OctahedronGeometry(0.14);

    for (let ly = -2; ly <= 2; ly++) {
      for (let lx = -2; lx <= 2; lx++) {
        const oct = new THREE.Mesh(octGeo, (lx + ly) % 2 === 0 ? feMat : po4Mat);
        oct.position.set(lx * 0.32, ly * 0.45, 0);
        lfpLattice.add(oct);
      }
    }
    this.microscopicGroup.add(lfpLattice);
  }

  private buildExternalCircuit() {
    this.scene.add(this.circuitGroup);

    // Overhead Circuit Board Base
    const circuitBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const circuitBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 1.4), circuitBaseMat);
    circuitBase.position.set(0, 2.4, 0);
    this.circuitGroup.add(circuitBase);

    // Heavy Wire 1: Negative Terminal (-0.9, 1.45, 0) -> Up to Circuit Base
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }); // Black negative cable
    const wire1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.95, 12), wireMat);
    wire1.position.set(0.9, 1.9, 0);
    this.circuitGroup.add(wire1);

    // Heavy Wire 2: Positive Terminal (+0.9, 1.45, 0) -> Up to Circuit Base
    const wire2Mat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }); // Red positive cable
    const wire2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.95, 12), wire2Mat);
    wire2.position.set(-0.9, 1.9, 0);
    this.circuitGroup.add(wire2);

    // Electrical Load: DC Motor with fan blades
    const motorGroup = new THREE.Group();
    motorGroup.position.set(-0.6, 2.7, 0);

    const motorHousingMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const motorHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.45, 24), motorHousingMat);
    motorHousing.rotation.x = Math.PI / 2;
    motorGroup.add(motorHousing);

    // Motor Shaft & Fan Rotor
    this.motorRotorMesh = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 12), motorHousingMat);
    shaft.rotation.x = Math.PI / 2;
    this.motorRotorMesh.add(shaft);

    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.25 });
    const bladeGeo = new THREE.BoxGeometry(0.6, 0.08, 0.02);
    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.z = (b * Math.PI * 2) / 3;
      blade.position.z = 0.28;
      this.motorRotorMesh.add(blade);
    }
    motorGroup.add(this.motorRotorMesh);
    this.circuitGroup.add(motorGroup);

    // Charger Station: DC Power Supply Box with glowing LED
    const chargerBoxMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const chargerBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.6), chargerBoxMat);
    chargerBox.position.set(0.8, 2.7, 0);
    this.circuitGroup.add(chargerBox);

    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 0.2,
      roughness: 0.2,
    });
    this.chargerLedMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), ledMat);
    this.chargerLedMesh.position.set(0.8, 2.85, 0.32);
    this.circuitGroup.add(this.chargerLedMesh);

    // SPDT Switch Contact Lever
    const switchBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.3), circuitBaseMat);
    switchBase.position.set(0, 2.5, 0);
    this.switchContactMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.35, 12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
    );
    this.switchContactMesh.position.set(0, 2.65, 0);
    this.circuitGroup.add(switchBase, this.switchContactMesh);
  }

  private buildParticleStreams() {
    // 1. Li+ Ion Stream (between Graphite Anode and LFP Cathode through Separator)
    // Runs across internal stack X = 0.8 to X = -0.8
    this.liIonCurveDischarge = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.6, 0.2, 0.0),
      new THREE.Vector3(0.3, 0.1, 0.0),
      new THREE.Vector3(0.0, 0.0, 0.0), // Through separator
      new THREE.Vector3(-0.3, -0.1, 0.0),
      new THREE.Vector3(-0.6, -0.2, 0.0),
    ]);

    this.particleSystem.addStream({
      id: 'li-ion-stream',
      type: 'lithium_ion',
      count: 28,
      curve: this.liIonCurveDischarge,
      speed: 0.25,
      size: 0.045,
      color: 0x06b6d4, // Cyan Li+
      spread: 0.18,
    });

    // 2. Electron Stream (Negative Post -> Motor Load -> Positive Post)
    this.electronCurveDischarge = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.9, 1.45, 0.0),  // Negative terminal
      new THREE.Vector3(0.9, 2.4, 0.0),   // Wire to circuit
      new THREE.Vector3(0.4, 2.55, 0.0),  // Switch
      new THREE.Vector3(-0.6, 2.7, 0.0),  // Load motor
      new THREE.Vector3(-0.9, 2.4, 0.0),  // Return wire
      new THREE.Vector3(-0.9, 1.45, 0.0), // Positive terminal
    ]);

    this.particleSystem.addStream({
      id: 'electron-stream',
      type: 'electron',
      count: 36,
      curve: this.electronCurveDischarge,
      speed: 0.45,
      size: 0.035,
      color: 0xf59e0b, // Amber Gold e-
      spread: 0.02,
    });
  }

  protected registerAllComponents() {
    const list: ComponentInspectionData[] = [
      {
        id: 'li-casing',
        name: 'Prismatic Aluminum Casing',
        category: 'structural',
        material: 'AA3003 Aluminum Alloy (3003-H14)',
        scientificRole: 'Houses the stacked electrode core, provides structural containment, and maintains hermetic seal against moisture and ambient oxygen.',
        specifications: '3.0 mm extruded wall thickness, 1.2 MPa burst rating',
        anchorPosition: [-1.4, 0.5, 0.6],
        meshRef: this.casingSolidGroup,
      },
      {
        id: 'li-terminals',
        name: 'Positive & Negative Terminals',
        category: 'electrical',
        material: 'Positive: Forged Brass / Al; Negative: Nickel-Plated Copper',
        scientificRole: 'Hermetically sealed insulated terminal studs providing heavy current path between internal collector tabs and external load/charger.',
        specifications: 'M8 threaded posts, dual O-ring EPDM insulation',
        anchorPosition: [-0.9, 1.5, 0],
      },
      {
        id: 'li-vent',
        name: 'Safety Burst Vent Diaphragm',
        category: 'structural',
        material: 'Precision-coined Aluminum 1060 Foil',
        scientificRole: 'Engineered weak point that ruptures safely at critical threshold (1.0–1.4 MPa) to prevent catastrophic cell rupture in thermal runaway.',
        specifications: 'Laser-scored cross pattern, 0.08 mm thickness',
        anchorPosition: [0, 1.3, 0],
      },
      {
        id: 'li-cathode-lfp',
        name: 'LiFePO₄ Cathode Active Layer',
        category: 'electrode',
        chemicalFormula: 'LiFePO₄ (Triphylite Olivine)',
        material: 'Carbon-coated Lithium Iron Phosphate on Aluminum Foil',
        scientificRole: 'Hosts Li⁺ ions in 1D [010] diffusion channels with exceptionally stable Fe-O covalent bonding preventing oxygen release at high temperature.',
        specifications: 'Theoretical capacity: 170 mAh/g, operating potential: 3.45 V vs Li/Li⁺',
        anchorPosition: [-0.6, 0.2, 0.2],
      },
      {
        id: 'li-anode-graphite',
        name: 'Graphite Anode Active Layer',
        category: 'electrode',
        chemicalFormula: 'Li_x C₆ (Lithium-Intercalated Carbon)',
        material: 'MCMB Synthetic Graphite on High-Conductivity Copper Foil',
        scientificRole: 'Intercalates Li⁺ ions between graphene planar sheets during charging; releases them spontaneously during discharge.',
        specifications: 'Theoretical capacity: 372 mAh/g, staging stages 1–4',
        anchorPosition: [0.6, -0.2, 0.2],
      },
      {
        id: 'li-separator',
        name: 'Microporous Polyolefin Separator',
        category: 'separator',
        material: 'Trilayer Polypropylene / Polyethylene / Polypropylene (PP/PE/PP)',
        scientificRole: 'Physical barrier preventing electron short-circuit between anode and cathode while allowing solvated Li⁺ ion migration through 40% open pores.',
        specifications: 'Thickness: 16–20 µm, pore size: 0.03–0.1 µm, shutdown temp: 135 °C',
        anchorPosition: [0, 0, 0.2],
      },
      {
        id: 'li-load-motor',
        name: 'Electrical Motor Load',
        category: 'electrical',
        material: 'Brushless DC Motor & Aerodynamic Impeller',
        scientificRole: 'Converts chemical potential difference between electrodes into useful mechanical work as electrons pass through the external circuit.',
        specifications: 'Operating voltage: 3.0–3.6 V, continuous current draw: 5.0 A',
        anchorPosition: [-0.6, 2.9, 0],
      },
      {
        id: 'li-circuit-wiring',
        name: 'External Circuit & Switch',
        category: 'electrical',
        material: 'Oxygen-Free High-Conductivity Copper (OFHC)',
        scientificRole: 'Directs external electron flow; SPDT switch alternates between galvanic discharge to load and electrolytic charging from DC supply.',
        specifications: 'Low-impedance 8 AWG silicone cabling',
        anchorPosition: [0, 2.6, 0],
      },
    ];

    list.forEach((item) => {
      this.components.set(item.id, item);
      this.annotationSystem.registerComponent(item);
    });
  }

  protected updateModel(deltaTime: number) {
    const isCharging = this.mode === 'charge';
    const isConnected = this.mode === 'discharge' || this.mode === 'charge';

    // Update electrochemical mathematical model
    this.model.update(deltaTime, isCharging, isConnected);

    // Animate Motor Rotor if discharging
    if (this.mode === 'discharge' && this.motorRotorMesh) {
      this.motorRotorMesh.rotation.z += deltaTime * 12.0 * this.speed;
    }

    // Update Charger LED
    if (this.chargerLedMesh) {
      const mat = this.chargerLedMesh.material as THREE.MeshStandardMaterial;
      if (this.mode === 'charge') {
        mat.emissiveIntensity = 1.0 + Math.sin(this.currentTime * 6) * 0.4;
      } else {
        mat.emissiveIntensity = 0.1;
      }
    }

    // Switch contact angle
    if (this.switchContactMesh) {
      const targetAngle = isCharging ? 0.35 : -0.35;
      this.switchContactMesh.rotation.z = targetAngle;
    }

    // Animate Exploded View interpolation
    const isExploded = this.inspectionMode === 'exploded';
    this.explodedLayers.forEach((l) => {
      const target = isExploded ? l.explodePos : l.basePos;
      l.mesh.position.lerp(target, 0.08);
    });
  }

  protected onStageChanged(stage: StageDefinition) {
    if (stage.index === 0) {
      this.setInspectionMode('assembled');
    } else if (stage.index === 1) {
      this.setInspectionMode('cutaway');
    } else if (stage.index === 2) {
      this.setMode('discharge');
      this.setInspectionMode('cutaway');
    } else if (stage.index === 3) {
      this.setMode('charge');
      this.setInspectionMode('cutaway');
    } else if (stage.index === 4) {
      this.setInspectionMode('assembled');
    }
  }

  protected onModeChanged(mode: SimulationMode) {
    if (mode === 'charge') {
      this.particleSystem.setStreamDirection('li-ion-stream', true); // reverse: cathode -> anode
      this.particleSystem.setStreamDirection('electron-stream', true);
    } else {
      this.particleSystem.setStreamDirection('li-ion-stream', false); // discharge: anode -> cathode
      this.particleSystem.setStreamDirection('electron-stream', false);
    }
  }

  protected onInspectionModeChanged(mode: 'assembled' | 'cutaway' | 'exploded' | 'microscopic') {
    this.applyInspectionMode(mode);
  }

  private applyInspectionMode(mode: 'assembled' | 'cutaway' | 'exploded' | 'microscopic') {
    const isMicro = mode === 'microscopic';
    this.topLid.visible = !isMicro;
    this.circuitGroup.visible = !isMicro;

    if (mode === 'assembled') {
      this.casingSolidGroup.visible = true;
      this.casingCutawayGroup.visible = false;
      this.electrodeStackGroup.visible = false;
      this.explodedStackGroup.visible = false;
      this.microscopicGroup.visible = false;
    } else if (mode === 'cutaway') {
      this.casingSolidGroup.visible = false;
      this.casingCutawayGroup.visible = true;
      this.electrodeStackGroup.visible = true;
      this.explodedStackGroup.visible = false;
      this.microscopicGroup.visible = false;
    } else if (mode === 'exploded') {
      this.casingSolidGroup.visible = false;
      this.casingCutawayGroup.visible = true;
      this.electrodeStackGroup.visible = false;
      this.explodedStackGroup.visible = true;
      this.microscopicGroup.visible = false;
    } else if (mode === 'microscopic') {
      this.casingSolidGroup.visible = false;
      this.casingCutawayGroup.visible = false;
      this.electrodeStackGroup.visible = false;
      this.explodedStackGroup.visible = false;
      this.microscopicGroup.visible = true;
    }
  }

  public getModelMetrics(): Record<string, number | string> {
    const isCharging = this.mode === 'charge';
    const isConnected = this.mode === 'discharge' || this.mode === 'charge';
    const v = this.model.getTerminalVoltage(isCharging, isConnected);
    const i = isConnected ? (isCharging ? this.model.chargeCurrentA : this.model.loadCurrentA) : 0;
    const soc = Math.round(this.model.stateOfCharge * 100);
    const power = (v * i).toFixed(2);

    return {
      'Cell Chemistry': 'LiFePO₄ / Synthetic Graphite',
      'Terminal Voltage': `${v.toFixed(3)} V`,
      'Current Flow': `${i.toFixed(2)} A`,
      'Electrical Power': `${power} W`,
      'State of Charge (SOC)': `${soc} %`,
      'Operating Mode': isCharging ? 'Electrolytic Charging' : 'Galvanic Discharging',
      'Internal Resistance': `${(this.model.internalResistanceOhm * 1000).toFixed(1)} mΩ`,
      'Temperature': `${this.model.temperatureC.toFixed(1)} °C`,
    };
  }

  public setParameter(key: string, value: number | string | boolean) {
    if (key === 'soc' && typeof value === 'number') {
      this.model.stateOfCharge = Math.max(0, Math.min(1, value / 100));
    } else if (key === 'loadCurrent' && typeof value === 'number') {
      this.model.loadCurrentA = Math.max(0.5, Math.min(20, value));
    } else if (key === 'chargeCurrent' && typeof value === 'number') {
      this.model.chargeCurrentA = Math.max(0.5, Math.min(20, value));
    }
    this.notifyState();
  }

  public getParameter(key: string): number | string | boolean | undefined {
    if (key === 'soc') return Math.round(this.model.stateOfCharge * 100);
    if (key === 'loadCurrent') return this.model.loadCurrentA;
    if (key === 'chargeCurrent') return this.model.chargeCurrentA;
    return undefined;
  }
}
