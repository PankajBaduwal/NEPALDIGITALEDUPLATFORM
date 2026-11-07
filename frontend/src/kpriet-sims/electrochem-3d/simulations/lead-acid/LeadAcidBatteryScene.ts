/**
 * 3D Lead-Acid Battery Simulation (Automotive 6-Cell 12V Assembly)
 * Industrial polypropylene case, 6 internal partitioned cells, Pb/PbO2 plate groups,
 * cast intercell connectors, sulfuric acid electrolyte, hydrometer, and double-sulfate reactions.
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type {
  StageDefinition,
  ComponentInspectionData,
  SimulationMode,
  SimulationOptions,
} from '../../types';
import { LeadAcidModel } from './LeadAcidModel';

export class LeadAcidBatteryScene extends BaseSimulation {
  private model = new LeadAcidModel();

  // Root Groups
  private batteryGroup = new THREE.Group();
  private solidCasingGroup = new THREE.Group();
  private cutawayCasingGroup = new THREE.Group();
  private cellsGroup = new THREE.Group();
  private explodedPlateGroup = new THREE.Group();
  private circuitGroup = new THREE.Group();

  // Active plate meshes for dynamic color transition (Pb/PbO2 <-> PbSO4)
  private posPlateMeshes: THREE.Mesh[] = [];
  private negPlateMeshes: THREE.Mesh[] = [];

  // Moving elements
  private lampGlowMesh: THREE.Mesh | null = null;
  private hydrometerFloatMesh: THREE.Mesh | null = null;
  private explodedPlates: { mesh: THREE.Object3D; basePos: THREE.Vector3; explodePos: THREE.Vector3 }[] = [];

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected buildStages() {
    this.stages = [
      {
        id: 'pb-stage-1',
        index: 0,
        title: 'Stage 1: Six-Cell Series Architecture (12 V Nominal)',
        shortDescription: 'Industrial polypropylene container divided into six isolated electrochemical cells.',
        detailedExplanation:
          'Commercial automotive starter batteries utilize an impact-resistant polypropylene container divided by impermeable partitions into six discrete cell compartments. Each cell provides a nominal electrochemical potential of ~2.10 V. When connected in series via through-partition lead busbars, the stack generates the standard 12.6 V nominal automotive operating voltage.',
        chemicalReactions: [
          'Series Cell Architecture: 6 Cells × ~2.10 V = 12.60 V (Nominal 12 V)',
          'Automotive Cranking Capacity: ~60 Ah (Cold Cranking Amps: 540–680 CCA)',
        ],
        keyTerminology: [
          { term: 'Partition Walls', definition: 'Rigid polypropylene bulkheads preventing liquid and electrical cross-talk between adjacent cells.' },
          { term: 'Nominal Voltage', definition: 'Standard circuit rating; actual terminal voltage varies dynamically between 11.8 V and 14.4 V.' },
        ],
        highlightComponentIds: ['pb-casing', 'pb-intercell-connectors', 'pb-terminals'],
        recommendedCamera: { position: [5.2, 4.0, 6.2], target: [0, 0, 0] },
      },
      {
        id: 'pb-stage-2',
        index: 1,
        title: 'Stage 2: Plate Construction, Grids & Active Materials',
        shortDescription: 'Lead dioxide (PbO₂) positive plates and spongy lead (Pb) negative plates.',
        detailedExplanation:
          'Each cell contains alternating positive and negative plate groups intermeshed together. Both groups are supported by mechanically rigid cast lead-calcium/antimony grids. The positive grid is pasted with dark brown lead dioxide (PbO₂), while the negative grid is pasted with high-surface-area spongy lead (Pb). Ribbed microporous envelope separators prevent direct physical contact while allowing acid diffusion.',
        chemicalReactions: [
          'Positive Plate Active Material: Lead Dioxide (PbO₂, chocolate brown)',
          'Negative Plate Active Material: Spongy Lead (Pb, slate grey)',
          'Grid Alloy: Pb–Ca–Sn (Maintenance-free lead calcium alloy reduces gassing)',
        ],
        keyTerminology: [
          { term: 'Plate Grid', definition: 'Cast metal lattice supporting active paste and conducting current to the terminal lug.' },
          { term: 'Envelope Separator', definition: 'Microporous polyethylene pouch encasing positive plates to capture shedding.' },
        ],
        highlightComponentIds: ['pb-positive-plates', 'pb-negative-plates', 'pb-separators'],
        recommendedCamera: { position: [2.5, 2.8, 4.2], target: [-0.6, 0.2, 0] },
      },
      {
        id: 'pb-stage-3',
        index: 2,
        title: 'Stage 3: Galvanic Discharge (Double Sulfate Formation)',
        shortDescription: 'Sulfuric acid consumption, lead sulfate crystallization, and voltage drop.',
        detailedExplanation:
          'Under electrical load, both electrodes consume sulfuric acid from the electrolyte and convert into lead sulfate (PbSO₄). Spongy lead is oxidized at the negative plate releasing electrons to the external circuit. At the positive plate, lead dioxide is reduced consuming protons and electrons. As discharge proceeds, active materials convert to whitish PbSO₄ crystals, water is generated, and the electrolyte specific gravity plummets.',
        chemicalReactions: [
          'Negative Electrode: Pb(s) + SO₄²⁻(aq) → PbSO₄(s) + 2e⁻  (E° = -0.356 V)',
          'Positive Electrode: PbO₂(s) + SO₄²⁻(aq) + 4H⁺(aq) + 2e⁻ → PbSO₄(s) + 2H₂O(l)  (E° = +1.685 V)',
          'Overall Reaction: Pb + PbO₂ + 2H₂SO₄ → 2PbSO₄ + 2H₂O  (E°_cell ≈ 2.041 V)',
        ],
        keyTerminology: [
          { term: 'Double Sulfate Theory', definition: 'Both positive and negative plates convert simultaneously into the same compound: PbSO₄.' },
          { term: 'Electrolyte Dilution', definition: 'Sulfuric acid is consumed into water, causing electrolyte density to fall continuously.' },
        ],
        highlightComponentIds: ['pb-load-lamp', 'pb-electrolyte', 'pb-positive-plates'],
        recommendedCamera: { position: [3.8, 3.4, 5.0], target: [0, 0.5, 0] },
      },
      {
        id: 'pb-stage-4',
        index: 3,
        title: 'Stage 4: Alternator Charging (Active Species Regeneration)',
        shortDescription: 'Reversal of electrode processes under charging voltage (14.2–14.4 V).',
        detailedExplanation:
          'When an external vehicle alternator or battery charger applies ~14.4 V, the direction of current flow is reversed. Lead sulfate on the positive plate is oxidized back into chocolate brown PbO₂, while lead sulfate on the negative plate is reduced to spongy Pb. Sulfuric acid is regenerated into the liquid solution, restoring electrolyte density and open-circuit cell voltage.',
        chemicalReactions: [
          'Positive Plate (Oxidation): PbSO₄ + 2H₂O → PbO₂ + SO₄²⁻ + 4H⁺ + 2e⁻',
          'Negative Plate (Reduction): PbSO₄ + 2e⁻ → Pb + SO₄²⁻',
          'Regeneration: 2PbSO₄ + 2H₂O + Electrical Energy → Pb + PbO₂ + 2H₂SO₄',
        ],
        keyTerminology: [
          { term: 'Alternator Charging', definition: 'Constant-voltage, current-limited automotive charging profile (~14.4 V at 25 °C).' },
          { term: 'Sulfation', definition: 'Growth of large non-conductive PbSO₄ crystals occurring if batteries remain discharged.' },
        ],
        highlightComponentIds: ['pb-charger', 'pb-electrolyte', 'pb-negative-plates'],
        recommendedCamera: { position: [3.4, 3.0, 4.8], target: [0, 0.4, 0] },
      },
      {
        id: 'pb-stage-5',
        index: 4,
        title: 'Stage 5: Hydrometer Analysis & Electrolyte Density',
        shortDescription: 'Direct correlation between sulfuric acid specific gravity and state of charge.',
        detailedExplanation:
          'Because sulfuric acid is a direct reactant rather than a mere catalyst, its concentration directly reflects the exact chemical state of charge. A built-in optical hydrometer or glass syringe hydrometer measures specific gravity: 1.280 g/cm³ corresponds to 100% full charge (float buoyant/green), while 1.120 g/cm³ indicates complete exhaustion (float sunken/red).',
        chemicalReactions: [
          'Fully Charged: 1.280 g/cm³ H₂SO₄ (~37% wt conc) → 2.12 V/cell',
          'Discharged: 1.120 g/cm³ H₂SO₄ (~16% wt conc) → 1.96 V/cell',
        ],
        keyTerminology: [
          { term: 'Specific Gravity', definition: 'Ratio of electrolyte density to the density of pure water at 25 °C.' },
          { term: 'Magic Eye Hydrometer', definition: 'Optical float indicator built into commercial automotive battery top covers.' },
        ],
        highlightComponentIds: ['pb-hydrometer', 'pb-electrolyte'],
        recommendedCamera: { position: [1.8, 2.6, 2.5], target: [-1.2, 1.2, 0] },
      },
    ];
  }

  protected buildScene() {
    this.batteryGroup = this.batteryGroup || new THREE.Group();
    this.solidCasingGroup = this.solidCasingGroup || new THREE.Group();
    this.cutawayCasingGroup = this.cutawayCasingGroup || new THREE.Group();
    this.cellsGroup = this.cellsGroup || new THREE.Group();
    this.explodedPlateGroup = this.explodedPlateGroup || new THREE.Group();
    this.circuitGroup = this.circuitGroup || new THREE.Group();

    this.scene.add(this.batteryGroup);

    // Floor Grid
    const grid = new THREE.GridHelper(18, 36, 0x334155, 0x1e293b);
    grid.position.y = -1.6;
    this.scene.add(grid);

    // 1. Build Casing & Cover
    this.buildCasing();

    // 2. Build 6 Internal Cells & Plate Groups
    this.buildSixCells();

    // 3. Build Exploded Single-Cell Plate Group
    this.buildExplodedPlateGroup();

    // 4. Build External Circuit & Automotive Load
    this.buildExternalCircuit();

    // 5. Build Particle Streams
    this.buildParticleStreams();

    // Apply default inspection mode
    this.applyInspectionMode(this.inspectionMode);
  }

  private buildCasing() {
    // Battery Box Dimensions: Width 4.2 (6 cells across X), Height 2.2, Depth 1.6
    const casingMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Matte automotive polypropylene dark slate
      roughness: 0.55,
      metalness: 0.1,
    });
    this.allocatedMaterials.push(casingMat);

    // Solid Casing Box
    const solidBox = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 1.6), casingMat);
    solidBox.castShadow = true;
    solidBox.receiveShadow = true;
    this.solidCasingGroup.add(solidBox);

    // Molded Handle across top
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const handle = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 0.25), handleMat);
    handle.position.set(0, 1.35, 0);
    this.solidCasingGroup.add(handle);

    // Cutaway Casing: Back, Bottom, Left, Right preserved; Front face open
    const cutawayMat = casingMat.clone();
    cutawayMat.side = THREE.DoubleSide;
    this.allocatedMaterials.push(cutawayMat);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 0.08), cutawayMat);
    backWall.position.set(0, 0, -0.76);
    const bottomWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 1.6), cutawayMat);
    bottomWall.position.set(0, -1.06, 0);
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 1.6), cutawayMat);
    leftWall.position.set(-2.06, 0, 0);
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 1.6), cutawayMat);
    rightWall.position.set(2.06, 0, 0);

    // 5 Internal Partitions dividing into 6 cell compartments
    const partitionGeo = new THREE.BoxGeometry(0.06, 2.1, 1.5);
    const partitionMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
    for (let p = 1; p <= 5; p++) {
      const px = -2.1 + p * (4.2 / 6);
      const partMesh = new THREE.Mesh(partitionGeo, partitionMat);
      partMesh.position.set(px, 0, 0);
      this.cutawayCasingGroup.add(partMesh);
    }

    this.cutawayCasingGroup.add(backWall, bottomWall, leftWall, rightWall);

    // Top Cover Assembly with 6 Vent Caps & Terminals (Shared)
    const topCoverGroup = new THREE.Group();
    topCoverGroup.position.y = 1.14;

    const coverLid = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.12, 1.7), casingMat);
    topCoverGroup.add(coverLid);

    // 6 Vent Plugs (Flame-arrestor caps)
    const plugMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const plugGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.12, 18);
    for (let c = 0; c < 6; c++) {
      const cx = -1.75 + c * 0.7;
      const plug = new THREE.Mesh(plugGeo, plugMat);
      plug.position.set(cx, 0.1, 0);
      topCoverGroup.add(plug);
    }

    // Built-in Optical Hydrometer ("Magic Eye") in Cell #1
    const hydroRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.16, 18),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    hydroRing.position.set(-1.75, 0.12, 0.45);
    this.hydrometerFloatMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.6 })
    );
    this.hydrometerFloatMesh.position.set(-1.75, 0.16, 0.45);
    topCoverGroup.add(hydroRing, this.hydrometerFloatMesh);

    // Positive Terminal (+): Left side, red collar, tapered lead cone
    const leadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.35 });
    const redCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.28, 0.1, 24),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 })
    );
    redCollar.position.set(-1.6, 0.08, -0.45);
    const posPost = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.38, 24), leadMat);
    posPost.position.set(-1.6, 0.28, -0.45);
    topCoverGroup.add(redCollar, posPost);

    // Negative Terminal (-): Right side, black collar, tapered lead cone
    const blackCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.28, 0.1, 24),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    blackCollar.position.set(1.6, 0.08, -0.45);
    const negPost = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.38, 24), leadMat);
    negPost.position.set(1.6, 0.28, -0.45);
    topCoverGroup.add(blackCollar, negPost);

    this.batteryGroup.add(this.solidCasingGroup);
    this.batteryGroup.add(this.cutawayCasingGroup);
    this.batteryGroup.add(topCoverGroup);
  }

  private buildSixCells() {
    this.batteryGroup.add(this.cellsGroup);

    // Materials
    // Positive Plate: PbO2 (chocolate brown paste)
    const pbo2Mat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8, metalness: 0.15 });
    // Negative Plate: Spongy Pb (slate metallic grey)
    const pbMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.65, metalness: 0.6 });
    // Envelope Separator: Ribbed pale yellow-grey
    const sepMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.85, metalness: 0.0 });
    // Dilute H2SO4 Electrolyte (semi-translucent liquid bath)
    const acidMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
    });
    // Cast lead intercell bridge
    const busbarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.3 });

    // Cell spacing across X: 6 cells centered between -1.75 and +1.75
    const cellWidth = 0.58;
    const cellHeight = 1.6;
    const cellDepth = 1.35;

    for (let c = 0; c < 6; c++) {
      const cx = -1.75 + c * 0.7;
      const cellSubGroup = new THREE.Group();
      cellSubGroup.position.set(cx, -0.1, 0);

      // Liquid Electrolyte volume in this cell
      const acidPool = new THREE.Mesh(new THREE.BoxGeometry(cellWidth - 0.04, cellHeight - 0.2, cellDepth - 0.05), acidMat);
      acidPool.position.set(0, -0.05, 0);
      cellSubGroup.add(acidPool);

      // Plate group: 5 positive plates, 6 negative plates, interleaved
      const plateCount = 7;
      for (let p = 0; p < plateCount; p++) {
        const pz = -0.45 + p * 0.15;
        const isPos = p % 2 === 0;

        const plate = new THREE.Mesh(
          new THREE.BoxGeometry(cellWidth - 0.1, cellHeight - 0.35, 0.035),
          isPos ? pbo2Mat : pbMat
        );
        plate.position.set(0, -0.05, pz);
        cellSubGroup.add(plate);

        if (isPos) {
          this.posPlateMeshes.push(plate);
          // Envelope separator around positive plate
          const sep = new THREE.Mesh(
            new THREE.BoxGeometry(cellWidth - 0.08, cellHeight - 0.3, 0.045),
            sepMat
          );
          sep.position.set(0, -0.05, pz);
          cellSubGroup.add(sep);
        } else {
          this.negPlateMeshes.push(plate);
        }
      }

      // Plate Lug Straps (Top lead busbars connecting lugs of like polarity)
      const posStrap = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.9), busbarMat);
      posStrap.position.set(-0.16, 0.72, 0);
      const negStrap = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.9), busbarMat);
      negStrap.position.set(0.16, 0.72, 0);
      cellSubGroup.add(posStrap, negStrap);

      // Intercell Connector: bridges cell C strap to cell C+1 strap through partition wall
      if (c < 5) {
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.14), busbarMat);
        bridge.position.set(cx + 0.35, 0.62, 0);
        this.cellsGroup.add(bridge);
      }

      this.cellsGroup.add(cellSubGroup);
    }
  }

  private buildExplodedPlateGroup() {
    this.batteryGroup.add(this.explodedPlateGroup);
    this.explodedPlateGroup.position.set(0, 0, 1.8);
    this.explodedPlateGroup.visible = false;

    const leadGridMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const pbo2PasteMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const sepMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8 });
    const pbPasteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6, metalness: 0.5 });

    // Exploded layers: [Pb Negative Plate] - [Separator Pocket] - [PbO2 Positive Plate]
    const layers = [
      { id: 'exp-neg', name: 'Negative Spongy Lead Plate (Pb)', mat: pbPasteMat, exX: -1.2 },
      { id: 'exp-sep', name: 'Ribbed Polyethylene Envelope Separator', mat: sepMat, exX: 0.0 },
      { id: 'exp-pos', name: 'Positive Lead Dioxide Plate (PbO₂)', mat: pbo2PasteMat, exX: 1.2 },
    ];

    layers.forEach((l) => {
      const plateGroup = new THREE.Group();
      // Outer active paste
      const paste = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.4, 0.04), l.mat);
      // Grid top lug
      const lug = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.25, 0.04), leadGridMat);
      lug.position.set(0.25, 0.8, 0);
      plateGroup.add(paste, lug);

      this.explodedPlateGroup.add(plateGroup);
      this.explodedPlates.push({
        mesh: plateGroup,
        basePos: new THREE.Vector3(0, 0, 0),
        explodePos: new THREE.Vector3(l.exX, 0, 0),
      });
    });
  }

  private buildExternalCircuit() {
    this.scene.add(this.circuitGroup);

    // Circuit Base Table
    const circuitBase = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.12, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    circuitBase.position.set(0, 2.35, 0);
    this.circuitGroup.add(circuitBase);

    // Positive Cable: Red wire from + terminal (-1.6, 1.42, -0.45) up to base
    const posWire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 1.0, 12),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 })
    );
    posWire.position.set(-1.6, 1.85, -0.45);
    this.circuitGroup.add(posWire);

    // Negative Cable: Black wire from - terminal (1.6, 1.42, -0.45) up to base
    const negWire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 1.0, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    negWire.position.set(1.6, 1.85, -0.45);
    this.circuitGroup.add(negWire);

    // Automotive Load: Dual Filament Headlamp Assembly
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-0.8, 2.7, 0);

    const lampHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.25, 0.4, 24),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 })
    );
    lampHousing.rotation.x = Math.PI / 2;
    lampGroup.add(lampHousing);

    // Glowing Bulb Filament
    this.lampGlowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfbbf24,
        emissiveIntensity: 1.2,
        roughness: 0.2,
      })
    );
    this.lampGlowMesh.position.set(0, 0, 0.15);
    lampGroup.add(this.lampGlowMesh);
    this.circuitGroup.add(lampGroup);

    // Alternator / Charger Console
    const chargerStation = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.6, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    );
    chargerStation.position.set(0.9, 2.7, 0);
    this.circuitGroup.add(chargerStation);
  }

  private buildParticleStreams() {
    // 1. Sulfate Ion Transport Stream across internal cell #2
    const sulfateCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.05, 0.5, 0.2),
      new THREE.Vector3(-1.05, 0.0, 0.0),
      new THREE.Vector3(-1.05, -0.5, -0.2),
    ]);

    this.particleSystem.addStream({
      id: 'sulfate-stream',
      type: 'sulfate',
      count: 24,
      curve: sulfateCurve,
      speed: 0.2,
      size: 0.045,
      color: 0xa855f7, // Violet SO4(2-)
      spread: 0.15,
    });

    // 2. Electron Stream: Negative Terminal -> Circuit -> Load -> Positive Terminal
    const electronCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.6, 1.42, -0.45), // Negative terminal
      new THREE.Vector3(1.6, 2.35, -0.45),
      new THREE.Vector3(0.5, 2.5, 0),
      new THREE.Vector3(-0.8, 2.7, 0),     // Lamp load
      new THREE.Vector3(-1.6, 2.35, -0.45),
      new THREE.Vector3(-1.6, 1.42, -0.45),// Positive terminal
    ]);

    this.particleSystem.addStream({
      id: 'lead-electron-stream',
      type: 'electron',
      count: 42,
      curve: electronCurve,
      speed: 0.5,
      size: 0.035,
      color: 0xf59e0b, // Amber Gold e-
      spread: 0.02,
    });
  }

  protected registerAllComponents() {
    const list: ComponentInspectionData[] = [
      {
        id: 'pb-casing',
        name: 'Reinforced Polypropylene Container',
        category: 'structural',
        material: 'Impact-Modified Polypropylene Copolymer (PP)',
        scientificRole: 'Houses six isolated cells, resists 37% H₂SO₄ chemical attack and withstands high automotive under-hood engine temperatures.',
        specifications: 'Flame-retardant UL94-HB rating, 6 integrated partition walls',
        anchorPosition: [-1.9, 0.3, 0.8],
        meshRef: this.solidCasingGroup,
      },
      {
        id: 'pb-terminals',
        name: 'SAE Tapered Lead Terminals',
        category: 'electrical',
        material: 'Cast Lead-Antimony (SAE J537)',
        scientificRole: 'Conical terminal posts providing heavy low-resistance connection for engine starter draw (up to 500+ Amperes).',
        specifications: 'Standard SAE: Positive 19.5 mm taper, Negative 17.9 mm taper',
        anchorPosition: [-1.6, 1.45, -0.45],
      },
      {
        id: 'pb-intercell-connectors',
        name: 'Through-Partition Lead Connectors',
        category: 'electrical',
        material: 'High-Purity Cast Lead Weld',
        scientificRole: 'Connects the negative busbar of cell N to the positive busbar of cell N+1 through the partition wall to establish 12V series sum.',
        specifications: 'Resistance-welded through-wall slug, < 0.2 mΩ resistance',
        anchorPosition: [-0.35, 0.65, 0],
      },
      {
        id: 'pb-positive-plates',
        name: 'Positive Plates (PbO₂ Active Material)',
        category: 'electrode',
        chemicalFormula: 'PbO₂ (Lead Dioxide)',
        material: 'Pb–Ca–Sn Cast Alloy Grid with Porous Lead Dioxide Paste',
        scientificRole: 'Undergoes electrochemical reduction during discharge: PbO₂ + SO₄²⁻ + 4H⁺ + 2e⁻ → PbSO₄ + 2H₂O (+1.685 V vs SHE).',
        specifications: 'Chocolate brown active material, porosity ~50–55%',
        anchorPosition: [-1.05, 0.1, 0.1],
      },
      {
        id: 'pb-negative-plates',
        name: 'Negative Plates (Spongy Pb Active Material)',
        category: 'electrode',
        chemicalFormula: 'Pb (Spongy Lead)',
        material: 'Cast Lead Grid with High-Surface-Area Spongy Lead Paste',
        scientificRole: 'Undergoes electrochemical oxidation during discharge: Pb + SO₄²⁻ → PbSO₄ + 2e⁻ (-0.356 V vs SHE).',
        specifications: 'Dull slate metallic grey, specific surface area ~0.5 m²/g',
        anchorPosition: [-1.05, -0.3, -0.1],
      },
      {
        id: 'pb-separators',
        name: 'Microporous Envelope Separators',
        category: 'separator',
        material: 'Ultra-High Molecular Weight Polyethylene (UHMWPE) with Silica',
        scientificRole: 'Wraps positive plates to capture shedding active particles while vertical ribs facilitate sulfuric acid circulation.',
        specifications: 'Backweb 0.2 mm, total thickness with ribs 0.9 mm',
        anchorPosition: [-1.05, 0.4, 0.2],
      },
      {
        id: 'pb-electrolyte',
        name: 'Sulfuric Acid Electrolyte (H₂SO₄)',
        category: 'electrolyte',
        chemicalFormula: 'H₂SO₄(aq)',
        material: 'Dilute Sulfuric Acid Solution (37% wt at full charge)',
        scientificRole: 'Serves as active chemical reactant (double sulfate theory) supplying SO₄²⁻ and H⁺ ions for the conversion reactions.',
        specifications: 'Specific Gravity: 1.280 g/cm³ (100% SOC) to 1.120 g/cm³ (0% SOC)',
        anchorPosition: [-1.05, -0.6, 0.3],
      },
      {
        id: 'pb-hydrometer',
        name: 'Optical State-of-Charge Hydrometer',
        category: 'structural',
        material: 'Optical Prismatic Glass Float Sensor',
        scientificRole: 'Directly indicates chemical charge state by buoyancy: green ball floats at SG > 1.220; sinks out of view when discharged.',
        specifications: 'Calibrated float sphere density: 1.220 g/cm³',
        anchorPosition: [-1.75, 1.35, 0.45],
      },
      {
        id: 'pb-load-lamp',
        name: 'Automotive Headlamp Load',
        category: 'electrical',
        material: 'Tungsten-Halogen Dual Filament Automotive Bulb',
        scientificRole: 'Consumes electrical power delivered by the spontaneous double-sulfate galvanic reactions across the 6 series cells.',
        specifications: 'Rated: 12V 55W/60W (H4 automotive specification)',
        anchorPosition: [-0.8, 2.9, 0],
      },
      {
        id: 'pb-charger',
        name: 'Automotive Alternator / Smart Charger',
        category: 'electrical',
        material: 'Solid-State Regulated DC Power Supply',
        scientificRole: 'Applies 14.4 V to reverse the double-sulfate reaction, dissolving PbSO₄ crystals back into Pb, PbO₂, and H₂SO₄.',
        specifications: 'Multi-stage CC/CV profile: 14.4V absorption, 13.6V float',
        anchorPosition: [0.9, 2.9, 0],
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

    this.model.update(deltaTime, isCharging, isConnected);

    // Dynamic Lamp Filament Glow
    if (this.lampGlowMesh) {
      const mat = this.lampGlowMesh.material as THREE.MeshStandardMaterial;
      if (this.mode === 'discharge') {
        const v = this.model.getTerminalVoltage(false, true);
        const norm = Math.max(0, (v - 10.5) / (12.6 - 10.5));
        mat.emissiveIntensity = 0.5 + norm * 1.5;
      } else {
        mat.emissiveIntensity = 0.05;
      }
    }

    // Dynamic Hydrometer Float Color (Green when charged, Red/dark when discharged)
    if (this.hydrometerFloatMesh) {
      const mat = this.hydrometerFloatMesh.material as THREE.MeshStandardMaterial;
      const soc = this.model.stateOfCharge;
      if (soc > 0.65) {
        mat.color.setHex(0x22c55e); // Green
        mat.emissive.setHex(0x22c55e);
      } else if (soc > 0.35) {
        mat.color.setHex(0xf59e0b); // Amber
        mat.emissive.setHex(0xf59e0b);
      } else {
        mat.color.setHex(0xef4444); // Red
        mat.emissive.setHex(0xef4444);
      }
    }

    // Dynamic Plate Surface Transition (Conversion to PbSO4 whitish crystals)
    const soc = this.model.stateOfCharge;
    // Positive plates: 0x451a03 (chocolate) -> 0x94a3b8 (whitish sulfate)
    const posTargetColor = new THREE.Color(0x451a03).lerp(new THREE.Color(0xcbd5e1), (1 - soc) * 0.7);
    this.posPlateMeshes.forEach((mesh) => {
      (mesh.material as THREE.MeshStandardMaterial).color.copy(posTargetColor);
    });
    // Negative plates: 0x64748b (slate) -> 0x94a3b8 (whitish sulfate)
    const negTargetColor = new THREE.Color(0x64748b).lerp(new THREE.Color(0xe2e8f0), (1 - soc) * 0.6);
    this.negPlateMeshes.forEach((mesh) => {
      (mesh.material as THREE.MeshStandardMaterial).color.copy(negTargetColor);
    });

    // Animate Exploded View
    const isExploded = this.inspectionMode === 'exploded';
    this.explodedPlates.forEach((p) => {
      const target = isExploded ? p.explodePos : p.basePos;
      p.mesh.position.lerp(target, 0.08);
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
      this.particleSystem.setStreamDirection('sulfate-stream', true);
      this.particleSystem.setStreamDirection('lead-electron-stream', true);
    } else {
      this.particleSystem.setStreamDirection('sulfate-stream', false);
      this.particleSystem.setStreamDirection('lead-electron-stream', false);
    }
  }

  protected onInspectionModeChanged(mode: 'assembled' | 'cutaway' | 'exploded' | 'microscopic') {
    this.applyInspectionMode(mode);
  }

  private applyInspectionMode(mode: 'assembled' | 'cutaway' | 'exploded' | 'microscopic') {
    if (mode === 'assembled') {
      this.solidCasingGroup.visible = true;
      this.cutawayCasingGroup.visible = false;
      this.cellsGroup.visible = false;
      this.explodedPlateGroup.visible = false;
    } else if (mode === 'cutaway') {
      this.solidCasingGroup.visible = false;
      this.cutawayCasingGroup.visible = true;
      this.cellsGroup.visible = true;
      this.explodedPlateGroup.visible = false;
    } else if (mode === 'exploded') {
      this.solidCasingGroup.visible = false;
      this.cutawayCasingGroup.visible = true;
      this.cellsGroup.visible = false;
      this.explodedPlateGroup.visible = true;
    }
  }

  public getModelMetrics(): Record<string, number | string> {
    const isCharging = this.mode === 'charge';
    const isConnected = this.mode === 'discharge' || this.mode === 'charge';
    const v = this.model.getTerminalVoltage(isCharging, isConnected);
    const sg = this.model.getElectrolyteSpecificGravity(this.model.stateOfCharge);
    const soc = Math.round(this.model.stateOfCharge * 100);
    const i = isConnected ? (isCharging ? this.model.chargeCurrentA : this.model.loadCurrentA) : 0;
    const power = (v * i).toFixed(1);
    const active = this.model.getActiveMaterialComposition();

    return {
      'Battery Bank': '6 Cells in Series (12 V Nominal)',
      'Terminal Voltage': `${v.toFixed(2)} V`,
      'Per-Cell Voltage': `${(v / 6).toFixed(3)} V`,
      'Electrolyte Specific Gravity': `${sg.toFixed(3)} g/cm³`,
      'State of Charge (SOC)': `${soc} %`,
      'Operating Mode': isCharging ? 'Alternator Charging' : 'Galvanic Discharging',
      'Current Draw': `${i.toFixed(1)} A`,
      'Power Delivery': `${power} W`,
      'Active Material (Pb)': `${active.pbPct} %`,
      'Active Material (PbO₂)': `${active.pbo2Pct} %`,
      'Discharged Sulfate (PbSO₄)': `${active.pbso4Pct} %`,
    };
  }

  public setParameter(key: string, value: number | string | boolean) {
    if (key === 'soc' && typeof value === 'number') {
      this.model.stateOfCharge = Math.max(0, Math.min(1, value / 100));
    } else if (key === 'loadCurrent' && typeof value === 'number') {
      this.model.loadCurrentA = Math.max(1, Math.min(60, value));
    } else if (key === 'chargeCurrent' && typeof value === 'number') {
      this.model.chargeCurrentA = Math.max(1, Math.min(40, value));
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
