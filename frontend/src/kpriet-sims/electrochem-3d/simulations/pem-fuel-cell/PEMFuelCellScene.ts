/**
 * 3D PEM Hydrogen Fuel Cell Simulation
 * Complete industrial stack assembly: End clamping plates, tie rods, bipolar flow plates,
 * Gas Diffusion Layers, Nafion PFSA membrane, platinum catalyst, water outlet,
 * variable electrical load, and multi-reactant particle streams.
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type {
  StageDefinition,
  ComponentInspectionData,
  SimulationMode,
  SimulationOptions,
} from '../../types';
import { PEMFuelCellModel } from './PEMFuelCellModel';

export class PEMFuelCellScene extends BaseSimulation {
  private model = new PEMFuelCellModel();

  // Root Groups
  private stackGroup = new THREE.Group();
  private assembledStackGroup = new THREE.Group();
  private cutawayStackGroup = new THREE.Group();
  private explodedStackGroup = new THREE.Group();
  private circuitGroup = new THREE.Group();

  // Moving elements
  private explodedLayers: { mesh: THREE.Object3D; basePos: THREE.Vector3; explodePos: THREE.Vector3 }[] = [];
  private loadFanMesh: THREE.Object3D | null = null;
  private waterExhaustDroplet: THREE.Mesh | null = null;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected buildStages() {
    this.stages = [
      {
        id: 'pem-stage-1',
        index: 0,
        title: 'Stage 1: Stack Architecture, Clamping & Bipolar Plates',
        shortDescription: 'Precision CNC-machined graphite flow plates clamped by high-tensile tie rods.',
        detailedExplanation:
          'A Proton Exchange Membrane (PEM) fuel cell assembly consists of rigid gold-plated or anodized aluminum end plates compressed under calibrated spring washers by four high-tensile steel tie rods. The internal graphite bipolar plates feature precision micro-machined flow channels that distribute fuel and oxidant gases uniformly across the active area while conducting electrical current through the stack.',
        chemicalReactions: [
          'Stack Compression Pressure: 1.5–2.0 MPa (Ensures minimal contact resistance without crushing GDL)',
          'Operating Temperature: 60 °C – 80 °C (Optimal Nafion hydration and catalyst activity)',
        ],
        keyTerminology: [
          { term: 'Bipolar Plate', definition: 'Conductive graphite/metallic plate with flow fields on both sides conducting electrons and separating gases.' },
          { term: 'Tie Rods', definition: 'Clamping bolts maintaining uniform compressive stress across gas diffusion layers and elastomeric gaskets.' },
        ],
        highlightComponentIds: ['pem-end-plates', 'pem-tie-rods', 'pem-bipolar-anode'],
        recommendedCamera: { position: [4.8, 3.5, 5.8], target: [0, 0, 0] },
      },
      {
        id: 'pem-stage-2',
        index: 1,
        title: 'Stage 2: Membrane-Electrode Assembly (MEA) Micro-Structure',
        shortDescription: 'Nafion PFSA solid polymer membrane sandwiched between Pt/C catalyst layers.',
        detailedExplanation:
          'At the core of the fuel cell lies the Membrane-Electrode Assembly (MEA). It comprises a solid perfluorosulfonic acid (PFSA / Nafion) membrane (~25–50 µm thick) coated with nano-dispersed platinum catalyst (Pt/C) on both faces. Porous teflonized carbon paper Gas Diffusion Layers (GDL) back the catalyst to provide reactant gas access, electron transport, and liquid water removal.',
        chemicalReactions: [
          'Membrane Material: Nafion™ 212 / 117 (PTFE hydrophobic backbone with hydrophilic -SO₃⁻H⁺ side chains)',
          'Platinum Catalyst Loading: 0.1–0.4 mg Pt/cm² (Nanoparticles dispersed on Vulcan XC-72 carbon)',
        ],
        keyTerminology: [
          { term: 'Gas Diffusion Layer (GDL)', definition: 'Porous carbon paper (~200 µm) facilitating gas diffusion and electronic conductivity.' },
          { term: 'Proton Exchange Membrane', definition: 'Solid polymer electrolyte conducting protons via sulfonic acid channels while completely blocking electrons.' },
        ],
        highlightComponentIds: ['pem-membrane', 'pem-catalyst-anode', 'pem-gdl-anode'],
        recommendedCamera: { position: [2.2, 2.0, 3.2], target: [0, 0, 0] },
      },
      {
        id: 'pem-stage-3',
        index: 2,
        title: 'Stage 3: Hydrogen Oxidation Reaction (HOR) at Anode',
        shortDescription: 'Dissociation of H₂ molecules into protons and electrons at platinum catalyst sites.',
        detailedExplanation:
          'Pure hydrogen gas enters the anode serpentine channels and diffuses through the porous anode GDL. Upon reaching the platinum catalyst layer, H₂ molecules adsorb onto Pt active sites and undergo spontaneous electrochemical oxidation. Each H₂ molecule is stripped into two protons (H⁺) and two electrons (e⁻).',
        chemicalReactions: [
          'Anode Half-Reaction: H₂(g) → 2H⁺ + 2e⁻  (E° = 0.000 V vs SHE)',
          'Tafel Mechanism: H₂ + 2Pt → 2Pt-H (Adsorption) followed by Volmer discharge: Pt-H → Pt + H⁺ + e⁻',
        ],
        keyTerminology: [
          { term: 'HOR Kinetics', definition: 'Exceptionally rapid reaction on platinum; activation overpotential is typically under 15 mV.' },
          { term: 'Three-Phase Boundary', definition: 'Microscopic intersection of gas pore, electron-conducting carbon, and proton-conducting ionomer.' },
        ],
        highlightComponentIds: ['pem-inlet-h2', 'pem-catalyst-anode', 'pem-bipolar-anode'],
        recommendedCamera: { position: [2.8, 2.4, 3.8], target: [-0.4, 0, 0] },
      },
      {
        id: 'pem-stage-4',
        index: 3,
        title: 'Stage 4: Selective Proton Transport Across Solid Nafion PEM',
        shortDescription: 'Grotthuss hopping and vehicular transport of H⁺ through hydrated sulfonic acid channels.',
        detailedExplanation:
          'Because the solid polymer membrane is an electrical insulator, electrons cannot cross it. Driven by electrochemical potential gradient, hydrated protons (H⁺ / H₃O⁺) migrate through the microscopic hydrophilic nano-channels of the Nafion membrane via the Grotthuss proton-hopping mechanism. The membrane must remain fully humidified to maintain high ionic conductivity.',
        chemicalReactions: [
          'Proton Conductivity: σ ≈ 0.1 S/cm at 100% relative humidity (80 °C)',
          'Zero Electronic Leakage: Electron conductivity σ_e < 10⁻¹⁰ S/cm (Safe insulation)',
        ],
        keyTerminology: [
          { term: 'Grotthuss Mechanism', definition: 'Protons hop along hydrogen-bonded networks of water molecules inside sulfonic acid pores.' },
          { term: 'Electro-Osmotic Drag', definition: 'Water molecules dragged along with migrating protons from anode to cathode.' },
        ],
        highlightComponentIds: ['pem-membrane'],
        recommendedCamera: { position: [1.8, 1.6, 2.4], target: [0, 0, 0] },
      },
      {
        id: 'pem-stage-5',
        index: 4,
        title: 'Stage 5: Oxygen Reduction Reaction (ORR) & Water Management',
        shortDescription: 'Cathode reduction of O₂ with protons and electrons to form pure water and heat.',
        detailedExplanation:
          'Humidified air or pure oxygen flows through the cathode channels and diffuses through the cathode GDL. At the cathode catalyst layer, oxygen molecules combine with incoming protons from the membrane and electrons arriving from the external circuit. Liquid water droplets and exothermic heat are produced and swept out through the drainage exhaust.',
        chemicalReactions: [
          'Cathode Half-Reaction: ½O₂(g) + 2H⁺ + 2e⁻ → H₂O(l)  (E° = +1.229 V vs SHE)',
          'Overall Fuel Cell Reaction: H₂(g) + ½O₂(g) → H₂O(l) + Heat + Electricity (ΔH = -285.8 kJ/mol)',
        ],
        keyTerminology: [
          { term: 'ORR Overpotential', definition: 'Sluggish multi-step 4-electron transfer kinetics responsible for the primary activation voltage drop.' },
          { term: 'Water Flooding', definition: 'Accumulation of excessive liquid water blocking gas diffusion pores if drainage is insufficient.' },
        ],
        highlightComponentIds: ['pem-catalyst-cathode', 'pem-outlet-water', 'pem-inlet-air'],
        recommendedCamera: { position: [2.8, 2.4, 3.8], target: [0.4, 0, 0] },
      },
      {
        id: 'pem-stage-6',
        index: 5,
        title: 'Stage 6: Polarization Curve, Power Generation & Load Regulation',
        shortDescription: 'Continuous DC electricity generation under variable electrical load.',
        detailedExplanation:
          'The fuel cell delivers continuous electrical power as long as hydrogen and air are supplied. Cell terminal voltage follows the classic polarization curve: initial activation drop at low current, linear ohmic resistive slope in the middle range, and sharp concentration drop near the mass-transport limit. Adjusting the external load changes current, voltage, and power output dynamically.',
        chemicalReactions: [
          'Reversible Thermodynamic Potential: E_rev = 1.229 V',
          'Operating Voltage Range: 0.60 V – 0.85 V per cell under typical load',
          'Stack Efficiency: 50% – 60% Electrical Efficiency (Higher Heating Value basis)',
        ],
        keyTerminology: [
          { term: 'Polarization Curve', definition: 'Characteristic V vs I relationship governed by activation, ohmic, and mass-transport losses.' },
          { term: 'Peak Power Point', definition: 'Operating condition where V × I product achieves maximum electrical wattage.' },
        ],
        highlightComponentIds: ['pem-load-box', 'pem-terminals', 'pem-circuit-wiring'],
        recommendedCamera: { position: [4.2, 3.6, 5.2], target: [0, 0.4, 0] },
      },
    ];
  }

  protected buildScene() {
    this.stackGroup = this.stackGroup || new THREE.Group();
    this.assembledStackGroup = this.assembledStackGroup || new THREE.Group();
    this.cutawayStackGroup = this.cutawayStackGroup || new THREE.Group();
    this.explodedStackGroup = this.explodedStackGroup || new THREE.Group();
    this.circuitGroup = this.circuitGroup || new THREE.Group();

    this.scene.add(this.stackGroup);

    // Floor Grid
    const grid = new THREE.GridHelper(16, 32, 0x334155, 0x1e293b);
    grid.position.y = -1.6;
    this.scene.add(grid);

    // 1. Build Fuel Cell Stack
    this.buildStackComponents();

    // 2. Build Exploded Stack Assembly
    this.buildExplodedStack();

    // 3. Build External Circuit & Variable Load
    this.buildExternalCircuit();

    // 4. Build Multi-Reactant Particle Streams
    this.buildParticleStreams();

    // Apply default inspection mode
    this.applyInspectionMode(this.inspectionMode);
  }

  private buildStackComponents() {
    this.stackGroup.add(this.assembledStackGroup);
    this.stackGroup.add(this.cutawayStackGroup);

    // Stack Dimensions: Width 2.4, Height 2.4, Depth 1.8 along Z
    const endPlateMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Anodized gold-silver aluminum
      metalness: 0.85,
      roughness: 0.25,
    });
    const graphiteMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Dark machined graphite
      roughness: 0.65,
      metalness: 0.2,
    });
    const tieRodMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // High-tensile stainless steel
      metalness: 0.9,
      roughness: 0.2,
    });
    const goldCollectorMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Gold-plated copper terminal
      metalness: 0.95,
      roughness: 0.15,
    });

    // ── Assembled Stack Representation ──────────────────────────────────
    // Left Anode End Plate (Z = -0.9)
    const leftEndPlate = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 0.25), endPlateMat);
    leftEndPlate.position.set(0, 0, -0.9);
    leftEndPlate.castShadow = true;
    this.assembledStackGroup.add(leftEndPlate);

    // Right Cathode End Plate (Z = +0.9)
    const rightEndPlate = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 0.25), endPlateMat);
    rightEndPlate.position.set(0, 0, 0.9);
    rightEndPlate.castShadow = true;
    this.assembledStackGroup.add(rightEndPlate);

    // Gold Current Collectors (Thin sheets inside end plates)
    const leftCollector = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.1, 0.04), goldCollectorMat);
    leftCollector.position.set(0, 0, -0.76);
    const rightCollector = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.1, 0.04), goldCollectorMat);
    rightCollector.position.set(0, 0, 0.76);
    this.assembledStackGroup.add(leftCollector, rightCollector);

    // 4 Clamping Tie Rods with Hex Nuts at corners
    const rodRadius = 0.05;
    const rodLength = 2.3;
    const corners = [
      [-1.0, 1.0],
      [1.0, 1.0],
      [-1.0, -1.0],
      [1.0, -1.0],
    ];

    corners.forEach(([cx, cy]) => {
      if (cx === undefined || cy === undefined) return;
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(rodRadius, rodRadius, rodLength, 16), tieRodMat);
      rod.rotation.x = Math.PI / 2;
      rod.position.set(cx, cy, 0);

      // Hex nuts at both ends
      const nutGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 6);
      const nutFront = new THREE.Mesh(nutGeo, tieRodMat);
      nutFront.rotation.x = Math.PI / 2;
      nutFront.position.set(cx, cy, 1.05);
      const nutBack = new THREE.Mesh(nutGeo, tieRodMat);
      nutBack.rotation.x = Math.PI / 2;
      nutBack.position.set(cx, cy, -1.05);

      this.assembledStackGroup.add(rod, nutFront, nutBack);
      this.cutawayStackGroup.add(rod.clone(), nutFront.clone(), nutBack.clone());
    });

    // Middle repeating stack body (Graphite bipolar plates + MEAs)
    const stackBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 1.48), graphiteMat);
    stackBody.position.set(0, 0, 0);
    this.assembledStackGroup.add(stackBody);

    // Gas Manifolds / Swagelok Nozzles on End Plates
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 });

    // H2 Fuel Inlet (Top-Left of Anode End Plate)
    const h2Inlet = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.35, 16), nozzleMat);
    h2Inlet.rotation.x = Math.PI / 2;
    h2Inlet.position.set(-0.6, 0.6, -1.1);
    this.assembledStackGroup.add(h2Inlet);

    // Air / O2 Inlet (Top-Right of Cathode End Plate)
    const airInlet = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.35, 16), nozzleMat);
    airInlet.rotation.x = Math.PI / 2;
    airInlet.position.set(0.6, 0.6, 1.1);
    this.assembledStackGroup.add(airInlet);

    // Water Exhaust Drain Outlet (Bottom-Right of Cathode End Plate)
    const waterOutlet = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.35, 16), nozzleMat);
    waterOutlet.rotation.x = Math.PI / 2;
    waterOutlet.position.set(0.6, -0.6, 1.1);
    this.assembledStackGroup.add(waterOutlet);

    // Water exhaust condensation droplet
    this.waterExhaustDroplet = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.85, roughness: 0.1 })
    );
    this.waterExhaustDroplet.position.set(0.6, -0.75, 1.25);
    this.assembledStackGroup.add(this.waterExhaustDroplet);

    // ── Cutaway Stack Variant ───────────────────────────────────────────
    // Shows the upper-front quadrant sliced away to reveal MEA sandwich inside
    const cutawayLeft = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.25), endPlateMat);
    cutawayLeft.position.set(0, -0.6, -0.9);
    const cutawayRight = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.25), endPlateMat);
    cutawayRight.position.set(0, -0.6, 0.9);
    const cutawayBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 1.48), graphiteMat);
    cutawayBody.position.set(0, -0.6, 0);

    // Exposed MEA layer plate in upper cutaway section
    const nafionMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const exposedMembrane = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.1, 0.05), nafionMat);
    exposedMembrane.position.set(0, 0.55, 0);

    // Exposed Anode Serpentine Channels (carved ribbed texture)
    const channelMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 });
    const channelsGroup = new THREE.Group();
    for (let ch = -4; ch <= 4; ch++) {
      const channelRib = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.04), channelMat);
      channelRib.position.set(0, 0.55 + ch * 0.1, -0.2);
      channelsGroup.add(channelRib);
    }

    this.cutawayStackGroup.add(cutawayLeft, cutawayRight, cutawayBody, exposedMembrane, channelsGroup);
  }

  private buildExplodedStack() {
    this.stackGroup.add(this.explodedStackGroup);
    this.explodedStackGroup.position.set(0, 0, 0);
    this.explodedStackGroup.visible = false;

    // Materials for Exploded Layers
    const endPlateMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });
    const goldCollectorMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
    const bipolarAnodeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.65, metalness: 0.2 });
    const gdlMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9, metalness: 0.05 });
    const ptCatalystMat = new THREE.MeshStandardMaterial({ color: 0x52525b, metalness: 0.7, roughness: 0.3 });
    const nafionMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const bipolarCathodeMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.65, metalness: 0.2 });

    // Exploded layers along Z axis
    const layers = [
      { id: 'exp-anode-endplate', name: 'Anode Clamping End Plate', mat: endPlateMat, w: 2.2, h: 2.2, d: 0.15, z: -2.8 },
      { id: 'exp-anode-collector', name: 'Gold-Plated Anode Current Collector', mat: goldCollectorMat, w: 1.9, h: 1.9, d: 0.04, z: -2.1 },
      { id: 'exp-bipolar-anode', name: 'Anode Graphite Bipolar Plate (Serpentine H₂ Channels)', mat: bipolarAnodeMat, w: 1.9, h: 1.9, d: 0.08, z: -1.4 },
      { id: 'exp-gdl-anode', name: 'Anode Gas Diffusion Layer (Carbon Paper)', mat: gdlMat, w: 1.6, h: 1.6, d: 0.03, z: -0.8 },
      { id: 'exp-cat-anode', name: 'Anode Catalyst Layer (Pt/C Nanoparticles)', mat: ptCatalystMat, w: 1.5, h: 1.5, d: 0.02, z: -0.3 },
      { id: 'exp-membrane', name: 'Nafion™ PFSA Proton Exchange Membrane', mat: nafionMat, w: 1.7, h: 1.7, d: 0.04, z: 0.0 },
      { id: 'exp-cat-cathode', name: 'Cathode Catalyst Layer (Pt/C Nanoparticles)', mat: ptCatalystMat, w: 1.5, h: 1.5, d: 0.02, z: 0.3 },
      { id: 'exp-gdl-cathode', name: 'Cathode Gas Diffusion Layer (Carbon Paper)', mat: gdlMat, w: 1.6, h: 1.6, d: 0.03, z: 0.8 },
      { id: 'exp-bipolar-cathode', name: 'Cathode Graphite Bipolar Plate (Air Channels)', mat: bipolarCathodeMat, w: 1.9, h: 1.9, d: 0.08, z: 1.4 },
      { id: 'exp-cathode-collector', name: 'Gold-Plated Cathode Current Collector', mat: goldCollectorMat, w: 1.9, h: 1.9, d: 0.04, z: 2.1 },
      { id: 'exp-cathode-endplate', name: 'Cathode Clamping End Plate', mat: endPlateMat, w: 2.2, h: 2.2, d: 0.15, z: 2.8 },
    ];

    layers.forEach((l) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(l.w, l.h, l.d), l.mat);
      mesh.position.set(0, 0, 0);
      mesh.castShadow = true;
      this.explodedStackGroup.add(mesh);

      this.explodedLayers.push({
        mesh,
        basePos: new THREE.Vector3(0, 0, 0),
        explodePos: new THREE.Vector3(0, 0, l.z),
      });
    });
  }

  private buildExternalCircuit() {
    this.scene.add(this.circuitGroup);

    // Overhead Circuit Deck
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.8), deckMat);
    deck.position.set(0, 2.3, 0);
    this.circuitGroup.add(deck);

    // Electrical Wiring
    // Anode Collector (Z = -0.76) -> Up to deck
    const wireAnode = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 1.1, 12),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }) // Negative wire
    );
    wireAnode.position.set(0, 1.75, -0.76);
    this.circuitGroup.add(wireAnode);

    // Cathode Collector (Z = +0.76) -> Up to deck
    const wireCathode = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 1.1, 12),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 }) // Positive wire
    );
    wireCathode.position.set(0, 1.75, 0.76);
    this.circuitGroup.add(wireCathode);

    // Electrical Load Box (Variable Resistor & Cooling Fan)
    const loadBoxGroup = new THREE.Group();
    loadBoxGroup.position.set(0, 2.7, 0);

    const loadHousing = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.65, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })
    );
    loadBoxGroup.add(loadHousing);

    // Rotating Fan Rotor on Load
    this.loadFanMesh = new THREE.Group();
    const fanCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    fanCenter.rotation.x = Math.PI / 2;
    this.loadFanMesh.add(fanCenter);

    for (let b = 0; b < 4; b++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.08, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 })
      );
      blade.rotation.z = (b * Math.PI) / 2;
      blade.position.z = 0.06;
      this.loadFanMesh.add(blade);
    }
    this.loadFanMesh.position.set(-0.25, 0, 0.48);
    loadBoxGroup.add(this.loadFanMesh);

    this.circuitGroup.add(loadBoxGroup);
  }

  private buildParticleStreams() {
    // 1. Hydrogen Gas (H2) Molecules: Anode Inlet -> Serpentine Channels -> Anode GDL
    const h2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.6, 0.6, -1.3),
      new THREE.Vector3(-0.6, 0.6, -0.9),
      new THREE.Vector3(0.0, 0.4, -0.6),
      new THREE.Vector3(0.0, 0.0, -0.2), // Anode catalyst
    ]);
    this.particleSystem.addStream({
      id: 'h2-stream',
      type: 'hydrogen',
      count: 24,
      curve: h2Curve,
      speed: 0.35,
      size: 0.045,
      color: 0xa5f3fc, // Light Cyan H2
      spread: 0.08,
    });

    // 2. Proton (H+) Stream: Nafion Membrane Z = -0.15 to Z = +0.15 (Strictly NO electrons!)
    const protonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.1, -0.12),
      new THREE.Vector3(0.0, 0.0, 0.0),   // Across Nafion PEM
      new THREE.Vector3(0.0, -0.1, 0.12), // Reaches cathode catalyst
    ]);
    this.particleSystem.addStream({
      id: 'proton-stream',
      type: 'proton',
      count: 32,
      curve: protonCurve,
      speed: 0.3,
      size: 0.04,
      color: 0x38bdf8, // Sky Blue H+
      spread: 0.22,
    });

    // 3. Electron Stream: Anode Collector -> Up Wire -> Load Box -> Down Wire -> Cathode Collector
    const electronCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.2, -0.76), // Anode terminal
      new THREE.Vector3(0, 2.3, -0.76),
      new THREE.Vector3(0, 2.7, 0),     // Load Box
      new THREE.Vector3(0, 2.3, 0.76),
      new THREE.Vector3(0, 1.2, 0.76),  // Cathode terminal
    ]);
    this.particleSystem.addStream({
      id: 'pem-electron-stream',
      type: 'electron',
      count: 38,
      curve: electronCurve,
      speed: 0.55,
      size: 0.035,
      color: 0xf59e0b, // Amber Gold e-
      spread: 0.02,
    });

    // 4. Oxygen (O2) Molecules: Cathode Air Inlet -> Cathode Channels -> Cathode Catalyst
    const o2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.6, 0.6, 1.3),
      new THREE.Vector3(0.6, 0.6, 0.9),
      new THREE.Vector3(0.2, 0.2, 0.5),
      new THREE.Vector3(0.0, 0.0, 0.15), // Cathode catalyst
    ]);
    this.particleSystem.addStream({
      id: 'o2-stream',
      type: 'oxygen',
      count: 22,
      curve: o2Curve,
      speed: 0.35,
      size: 0.045,
      color: 0xef4444, // Crimson Red O2
      spread: 0.08,
    });

    // 5. Water (H2O) Product Droplets: Cathode Catalyst -> Drain Outlet
    const waterCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, -0.1, 0.15),
      new THREE.Vector3(0.3, -0.4, 0.6),
      new THREE.Vector3(0.6, -0.6, 1.1),  // Water drain port
      new THREE.Vector3(0.6, -0.9, 1.2),  // Trickle down
    ]);
    this.particleSystem.addStream({
      id: 'water-stream',
      type: 'water',
      count: 20,
      curve: waterCurve,
      speed: 0.28,
      size: 0.05,
      color: 0x60a5fa, // Blue-White H2O
      spread: 0.04,
    });
  }

  protected registerAllComponents() {
    const list: ComponentInspectionData[] = [
      {
        id: 'pem-end-plates',
        name: 'Clamping End Plates',
        category: 'structural',
        material: 'Gold-Plated Aluminum 6061-T6',
        scientificRole: 'Provide uniform compressive force across the active area to minimize contact resistance between GDL and bipolar plates.',
        specifications: '30 mm thickness, 4 corner tie-rod bolt holes, 2.0 MPa design pressure',
        anchorPosition: [0, 0.9, -0.9],
        meshRef: this.assembledStackGroup,
      },
      {
        id: 'pem-tie-rods',
        name: 'High-Tensile Clamping Tie Rods',
        category: 'structural',
        material: 'Grade 316 Stainless Steel with Belleville Disc Washers',
        scientificRole: 'Maintains constant compressive force under thermal expansion and membrane swelling during variable hydration cycles.',
        specifications: 'M10 metric studs, 12.5 N·m calibrated torque',
        anchorPosition: [1.0, 1.0, 0],
      },
      {
        id: 'pem-bipolar-anode',
        name: 'Anode Graphite Bipolar Plate',
        category: 'manifold',
        material: 'Non-Porous Resin-Impregnated High-Density Graphite',
        scientificRole: 'Features micro-machined serpentine channels delivering pure H₂ gas uniformly, separates cells, and conducts electrons away from anode.',
        specifications: 'Flow channel: 1.0 mm width × 1.0 mm depth, rib width: 1.0 mm',
        anchorPosition: [-0.4, 0.4, -0.4],
      },
      {
        id: 'pem-gdl-anode',
        name: 'Anode Gas Diffusion Layer (GDL)',
        category: 'electrode',
        material: 'Toray Carbon Fiber Paper with 5 wt% PTFE Hydrophobic Treatment',
        scientificRole: 'Spreads reactant gas across catalyst layer, provides electrical contact to bipolar plate, and manages water vapor removal.',
        specifications: 'Thickness: 190 µm, porosity: 78%, electrical conductivity > 100 S/cm',
        anchorPosition: [-0.2, 0.1, -0.2],
      },
      {
        id: 'pem-catalyst-anode',
        name: 'Anode Platinum Catalyst Layer',
        category: 'electrode',
        chemicalFormula: 'Pt/C (Platinum on Vulcan Carbon)',
        material: 'Nano-Platinum Particles (2–3 nm) supported on Carbon Black',
        scientificRole: 'Catalyzes rapid Hydrogen Oxidation Reaction: H₂ → 2H⁺ + 2e⁻ (E° = 0.000 V vs SHE).',
        specifications: 'Pt loading: 0.10 mg Pt/cm², ionomer to carbon ratio: 0.8',
        anchorPosition: [-0.1, -0.1, -0.1],
      },
      {
        id: 'pem-membrane',
        name: 'Nafion™ PFSA Proton Exchange Membrane',
        category: 'separator',
        chemicalFormula: '-(CF₂-CF₂)ₙ-(CF₂-CF(O-CF₂-CF(CF₃)-O-(CF₂)₂-SO₃⁻H⁺))ₘ-',
        material: 'Perfluorosulfonic Acid (PFSA) Polymer Film (Nafion 212)',
        scientificRole: 'Selectively conducts hydrated protons (H⁺) via Grotthuss hopping across sulfonic acid nano-channels while strictly blocking electrons and reactant gases.',
        specifications: 'Dry thickness: 50.8 µm, proton conductivity: ~0.10 S/cm at 100% RH',
        anchorPosition: [0, 0, 0],
      },
      {
        id: 'pem-catalyst-cathode',
        name: 'Cathode Platinum Catalyst Layer',
        category: 'electrode',
        chemicalFormula: 'Pt/C (Platinum on Carbon)',
        material: 'High-Dispersity Platinum on Carbon Black',
        scientificRole: 'Catalyzes sluggish 4-electron Oxygen Reduction Reaction: ½O₂ + 2H⁺ + 2e⁻ → H₂O + Heat (E° = +1.229 V vs SHE).',
        specifications: 'Pt loading: 0.35 mg Pt/cm², active electrochemical surface area > 60 m²/g',
        anchorPosition: [0.1, 0.1, 0.1],
      },
      {
        id: 'pem-inlet-h2',
        name: 'Hydrogen Fuel Inlet Manifold',
        category: 'manifold',
        material: 'Swagelok 1/4" 316 Stainless Steel Fitting',
        scientificRole: 'Supplies high-purity dry or humidified hydrogen gas (Grade 5.0, 99.999% purity) at regulated delivery pressure (1.2–1.5 bar).',
        specifications: 'Operating flow: 50–200 mL/min, stoichiometric ratio λ_H2 = 1.2',
        anchorPosition: [-0.6, 0.7, -1.1],
      },
      {
        id: 'pem-inlet-air',
        name: 'Air / Oxygen Inlet Manifold',
        category: 'manifold',
        material: 'Stainless Steel Compression Nozzle',
        scientificRole: 'Delivers filtered ambient air or pure oxygen to the cathode flow channels for the reduction reaction.',
        specifications: 'Operating flow: 100–500 mL/min, stoichiometric ratio λ_air = 2.0',
        anchorPosition: [0.6, 0.7, 1.1],
      },
      {
        id: 'pem-outlet-water',
        name: 'Water Product & Exhaust Drain',
        category: 'manifold',
        material: 'PTFE Drainage Tube & Liquid Separator',
        scientificRole: 'Evacuates byproduct liquid water and depleted air exhaust to prevent electrode flooding and mass transport starvation.',
        specifications: 'Gravity drainage port with automatic condensation trap',
        anchorPosition: [0.6, -0.7, 1.1],
      },
      {
        id: 'pem-load-box',
        name: 'Variable Electrical Load & Fan',
        category: 'electrical',
        material: 'Solid-State Electronic Rheostat & DC Impeller',
        scientificRole: 'Dissipates electrical power generated by the fuel cell; fan rotor speed dynamically mirrors current output.',
        specifications: 'Adjustable resistance: 0.1–10.0 Ω, max continuous power: 30 W',
        anchorPosition: [0, 2.9, 0],
      },
    ];

    list.forEach((item) => {
      this.components.set(item.id, item);
      this.annotationSystem.registerComponent(item);
    });
  }

  protected updateModel(deltaTime: number) {
    const op = this.model.getOperatingPoint();

    // Animate Fan Rotor on Load with speed proportional to power output
    if (this.loadFanMesh) {
      const speed = Math.max(0, op.powerW * 1.5 * this.speed);
      this.loadFanMesh.rotation.z += deltaTime * speed;
    }

    // Animate Water Droplet Pulsing at exhaust drain
    if (this.waterExhaustDroplet) {
      const scale = 0.8 + Math.sin(this.currentTime * 4) * 0.2;
      this.waterExhaustDroplet.scale.set(scale, scale, scale);
    }

    // Animate Exploded Stack interpolation
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
      this.setInspectionMode('exploded');
    } else if (stage.index === 2) {
      this.setInspectionMode('cutaway');
    } else if (stage.index === 3) {
      this.setInspectionMode('cutaway');
    } else if (stage.index === 4) {
      this.setInspectionMode('cutaway');
    } else if (stage.index === 5) {
      this.setInspectionMode('assembled');
    }
  }

  protected onModeChanged(_mode: SimulationMode) {
    // Mode transitions
  }

  protected onInspectionModeChanged(mode: 'assembled' | 'cutaway' | 'exploded' | 'microscopic') {
    this.applyInspectionMode(mode);
  }

  private applyInspectionMode(mode: 'assembled' | 'cutaway' | 'exploded' | 'microscopic') {
    if (mode === 'assembled') {
      this.assembledStackGroup.visible = true;
      this.cutawayStackGroup.visible = false;
      this.explodedStackGroup.visible = false;
    } else if (mode === 'cutaway') {
      this.assembledStackGroup.visible = false;
      this.cutawayStackGroup.visible = true;
      this.explodedStackGroup.visible = false;
    } else if (mode === 'exploded') {
      this.assembledStackGroup.visible = false;
      this.cutawayStackGroup.visible = false;
      this.explodedStackGroup.visible = true;
    }
  }

  public getModelMetrics(): Record<string, number | string> {
    const op = this.model.getOperatingPoint();
    const waterRate = this.model.getWaterProductionRateMlHr(op.currentA);
    const h2Consumption = this.model.getHydrogenConsumptionMlMin(op.currentA);
    const currentDensity = (op.currentA / this.model.cellAreaCm2).toFixed(3);

    return {
      'Cell Voltage (V_term)': `${op.voltageV.toFixed(3)} V`,
      'Current Output': `${op.currentA.toFixed(2)} A`,
      'Electrical Power': `${op.powerW.toFixed(2)} W`,
      'Current Density': `${currentDensity} A/cm²`,
      'Load Resistance': `${this.model.loadResistanceOhm.toFixed(2)} Ω`,
      'H₂ Fuel Consumption': `${h2Consumption.toFixed(1)} mL/min`,
      'Water Production Rate': `${waterRate.toFixed(2)} mL/hr`,
      'Operating Temperature': `${this.model.temperatureC.toFixed(1)} °C`,
    };
  }

  public setParameter(key: string, value: number | string | boolean) {
    if (key === 'loadResistance' && typeof value === 'number') {
      this.model.loadResistanceOhm = Math.max(0.1, Math.min(20, value));
    } else if (key === 'h2Flow' && typeof value === 'number') {
      this.model.h2FlowMlMin = Math.max(10, Math.min(300, value));
    } else if (key === 'airFlow' && typeof value === 'number') {
      this.model.airFlowMlMin = Math.max(50, Math.min(800, value));
    } else if (key === 'temperature' && typeof value === 'number') {
      this.model.temperatureC = Math.max(20, Math.min(95, value));
    }
    this.notifyState();
  }

  public getParameter(key: string): number | string | boolean | undefined {
    if (key === 'loadResistance') return this.model.loadResistanceOhm;
    if (key === 'h2Flow') return this.model.h2FlowMlMin;
    if (key === 'airFlow') return this.model.airFlowMlMin;
    if (key === 'temperature') return this.model.temperatureC;
    return undefined;
  }
}
