/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 09: Centre of Gravity of Three-Dimensional Bodies
 * Unit III: Properties of Surfaces and Solids
 *
 * Demonstrates:
 * - Spatial mass-weighted centroid integration: R_cg = Σ(mi ri) / Σmi
 * - Distinction between geometric centroid and density-weighted center of gravity
 * - Ground support footprint polygon & vertical gravity plumb line
 * - Static stability criteria against overturning and tipping
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';

export class CenterOfGravityScene extends BaseMechanicsSimulation {
  private assemblyGroup = new THREE.Group();
  private baseFootprintGroup = new THREE.Group();
  private cgMarkerGroup = new THREE.Group();
  private plumbLineMesh!: THREE.Line;
  private cgSphere!: THREE.Mesh;

  // Mechanical components data
  private baseWidth = 2.0; // meters
  private baseHeight = 0.4;
  private columnHeight = 2.2;
  private armLength = 2.4;
  private payloadPos = 2.0; // position along arm
  private payloadMassKg = 150;
  private counterMassKg = 200;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(12, 12);
    ground.position.y = 0;
    this.scene.add(ground);

    this.scene.add(this.assemblyGroup);
    this.scene.add(this.baseFootprintGroup);
    this.scene.add(this.cgMarkerGroup);

    // CG Marker Sphere (Dual Gold/Red Target)
    const sphereGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.2 });
    this.cgSphere = new THREE.Mesh(sphereGeo, sphereMat);
    this.cgMarkerGroup.add(this.cgSphere);

    // Vertical Plumb line down to ground
    const lineMat = new THREE.LineDashedMaterial({ color: 0xef4444, dashSize: 0.08, gapSize: 0.05 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -2, 0)]);
    this.plumbLineMesh = new THREE.Line(lineGeo, lineMat);
    this.cgMarkerGroup.add(this.plumbLineMesh);

    this.parameters['baseWidth'] = 2.0;
    this.parameters['payloadPosition'] = 2.0;
    this.parameters['payloadMass'] = 150;
    this.parameters['counterweightMass'] = 200;

    this.recalculateAndRender();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-3d-mass-integration',
        index: 0,
        title: 'Stage 1: Spatial Mass Distribution & Component Volumes',
        shortDescription: 'Calculate individual component masses from volume and material density: m_i = ρ_i · V_i.',
        detailedExplanation:
          'For a three-dimensional body composed of multiple homogeneous parts, the mass of each part equals its density multiplied by volume: m = ρ · V. ' +
          'A crane or cantilever machine comprises a heavy base pedestal, a vertical mast, an outstretched horizontal boom, and balancing counterweights. ' +
          'Each part has a known local center of mass located at its geometric centroid.',
        principles: [
          'Mass as Volume Integral of Density: m = ∫ ρ dV',
          'Additivity of Total Mass: M_total = Σ m_i',
        ],
        equations: [
          'm_i = \\rho_i \\cdot V_i',
          'M_{total} = \\sum m_i',
        ],
        keyTerminology: [
          { term: 'Center of Mass', definition: 'The unique point where the weighted relative position of the distributed mass sums to zero.' },
          { term: 'Center of Gravity', definition: 'The point through which the resultant gravitational force acts.' },
        ],
        highlightComponentIds: ['base-pedestal', 'mast', 'boom'],
        recommendedCamera: { position: [4.5, 3.5, 6.0], target: [0, 1.2, 0] },
      },
      {
        id: 'stage-composite-cg-coords',
        index: 1,
        title: 'Stage 2: Composite Center of Gravity Coordinates (X̄, Ȳ, Z̄)',
        shortDescription: 'Determine spatial coordinates: X̄ = Σ(mi xi) / M, Ȳ = Σ(mi yi) / M, Z̄ = Σ(mi zi) / M.',
        detailedExplanation:
          'The center of gravity is computed by taking moments of mass about the coordinate planes and dividing by total mass. ' +
          'X̄ = Σ(m_i · x_i) / Σm_i. ' +
          'Moving a heavy payload along the horizontal boom shifts the composite center of gravity forward toward the tipping edge.',
        principles: [
          'Principle of Moments: M_total · R_cg = Σ (m_i · r_i)',
          'Shifting mass Δm by distance d moves the system CG by ΔR = (Δm · d) / M_total',
        ],
        equations: [
          '\\bar{X} = \\frac{\\sum m_i x_i}{\\sum m_i}, \\quad \\bar{Y} = \\frac{\\sum m_i y_i}{\\sum m_i}, \\quad \\bar{Z} = \\frac{\\sum m_i z_i}{\\sum m_i}',
        ],
        keyTerminology: [
          { term: 'First Moment of Mass', definition: 'The product of a component mass and its coordinate distance.' },
        ],
        highlightComponentIds: ['cg-target', 'boom'],
        recommendedCamera: { position: [4.5, 3.5, 6.0], target: [0, 1.2, 0] },
      },
      {
        id: 'stage-support-footprint',
        index: 2,
        title: 'Stage 3: Base Support Polygon & Gravity Plumb Line',
        shortDescription: 'The vertical projection (plumb line) of the CG must intersect the ground within the base support polygon.',
        detailedExplanation:
          'The base of support is the convex polygon defined by all ground contact points. ' +
          'Gravity exerts a resultant vertical downward force through the CG. ' +
          'The line of action of this force projects straight down to the ground as a vertical plumb line. ' +
          'Normal reactions can only push upward from inside the support footprint.',
        principles: [
          'Convex Support Polygon encompasses all ground contact points',
          'Normal contact reactions cannot exist outside the physical base footprint',
        ],
        equations: [
          '\\mathbf{R}_{normal} \\in \\text{Support Polygon}',
        ],
        keyTerminology: [
          { term: 'Support Polygon / Footprint', definition: 'The ground boundary perimeter enclosing all foundation contact points.' },
          { term: 'Plumb Line', definition: 'The true vertical line of action of gravity passing downward through the CG.' },
        ],
        highlightComponentIds: ['base-pedestal', 'cg-target'],
        recommendedCamera: { position: [4.5, 3.5, 6.0], target: [0, 1.2, 0] },
      },
      {
        id: 'stage-tipping-stability',
        index: 3,
        title: 'Stage 4: Tipping Stability Criterion & Overturning Moment',
        shortDescription: 'If the CG projects beyond the base edge (X̄ > B/2), the gravitational moment overturns the machine.',
        detailedExplanation:
          'Static stability is governed by the location of the CG relative to the tipping edge: ' +
          '1. Stable Equilibrium: X̄ < B/2 (Gravity produces a restoring moment about the edge). ' +
          '2. Impending Tipping: X̄ = B/2 (Reaction concentrates entirely at the tipping knife-edge). ' +
          '3. Overturning / Toppling: X̄ > B/2 (Gravity produces an overturning moment; machine tips over unless counterweighted).',
        principles: [
          'Restoring Moment: M_restoring = M_total · g · (B/2 - X̄) > 0 for stability',
          'Overturning occurs as soon as the line of action passes outside the footprint',
        ],
        equations: [
          '\\text{Stable: } |\\bar{X}| < \\frac{B}{2}, \\quad \\text{Toppling: } |\\bar{X}| > \\frac{B}{2}',
        ],
        keyTerminology: [
          { term: 'Tipping / Overturning Edge', definition: 'The outermost fulcrum about which an unstable body pivots during toppling.' },
          { term: 'Stability Margin', definition: 'The distance between the vertical CG plumb line and the nearest tipping edge.' },
        ],
        highlightComponentIds: ['cg-target', 'payload', 'counterweight'],
        recommendedCamera: { position: [4.5, 3.5, 6.0], target: [0, 1.2, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('base-pedestal', {
      id: 'base-pedestal',
      name: 'Base Support Pedestal',
      category: 'body',
      material: 'Cast Iron Base Footing',
      scientificRole: 'Establishes ground support polygon width B to resist overturning.',
      specifications: 'Width: 2.0 m · Mass: 400 kg',
      anchorPosition: [0, 0.2, 0],
    });

    this.components.set('cg-target', {
      id: 'cg-target',
      name: 'Composite Center of Gravity (CG)',
      category: 'centroid',
      material: 'System Center of Mass Marker (Red)',
      scientificRole: 'Point of application of total gravitational weight force.',
      specifications: 'Coordinates: (X̄, Ȳ, 0)',
      anchorPosition: [0.4, 1.6, 0],
    });

    this.components.set('payload', {
      id: 'payload',
      name: 'Projecting Boom Payload',
      category: 'load',
      material: 'Suspended Live Load',
      scientificRole: 'Shifts system CG outward toward the overturning edge.',
      specifications: 'Mass: 150 kg · Radius: 2.0 m',
      anchorPosition: [2.0, 2.2, 0],
    });

    this.components.set('counterweight', {
      id: 'counterweight',
      name: 'Rear Stabilizing Counterweight',
      category: 'counterweight',
      material: 'Lead Counter-Ballast Block',
      scientificRole: 'Pulls system CG backward away from the tipping edge to ensure stability.',
      specifications: 'Mass: 200 kg · Offset: -1.2 m',
      anchorPosition: [-1.2, 2.4, 0],
    });
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.payloadPos = 1.0;
    } else if (stageIndex === 1) {
      this.payloadPos = 1.8;
    } else if (stageIndex === 2) {
      this.payloadPos = 2.0;
    } else if (stageIndex === 3) {
      this.payloadPos = 2.4;
    }
    this.parameters['payloadPosition'] = this.payloadPos;
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    if (key === 'baseWidth') this.baseWidth = Number(value);
    if (key === 'payloadPosition') this.payloadPos = Number(value);
    if (key === 'payloadMass') this.payloadMassKg = Number(value);
    if (key === 'counterweightMass') this.counterMassKg = Number(value);
    this.recalculateAndRender();
  }

  private recalculateAndRender(): void {
    this.assemblyGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.assemblyGroup.clear();
    this.baseFootprintGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.baseFootprintGroup.clear();

    const bw = this.baseWidth;
    const bh = this.baseHeight;
    const mw = 0.3;
    const mh = this.columnHeight;

    // 1. Base Pedestal
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 1.2), MechanicalBuilder.materials.darkSteel);
    baseMesh.position.set(0, bh / 2, 0);
    this.assemblyGroup.add(baseMesh);

    // Footprint boundary line on ground
    const footprintPts = [
      new THREE.Vector3(-bw / 2, 0.01, -0.6),
      new THREE.Vector3(bw / 2, 0.01, -0.6),
      new THREE.Vector3(bw / 2, 0.01, 0.6),
      new THREE.Vector3(-bw / 2, 0.01, 0.6),
      new THREE.Vector3(-bw / 2, 0.01, -0.6),
    ];
    const fpLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(footprintPts),
      new THREE.LineBasicMaterial({ color: 0x059669, linewidth: 2 })
    );
    this.baseFootprintGroup.add(fpLine);

    // 2. Vertical Mast
    const mastMesh = new THREE.Mesh(new THREE.BoxGeometry(mw, mh, mw), MechanicalBuilder.materials.steel);
    mastMesh.position.set(0, bh + mh / 2, 0);
    this.assemblyGroup.add(mastMesh);

    // 3. Horizontal Boom
    const boomL = this.armLength + 1.2;
    const boomMesh = new THREE.Mesh(new THREE.BoxGeometry(boomL, 0.2, 0.2), MechanicalBuilder.materials.steel);
    boomMesh.position.set((this.armLength - 1.2) / 2, bh + mh, 0);
    this.assemblyGroup.add(boomMesh);

    // 4. Counterweight Block at rear
    const cwMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), MechanicalBuilder.materials.concrete);
    cwMesh.position.set(-1.0, bh + mh + 0.1, 0);
    this.assemblyGroup.add(cwMesh);

    // 5. Payload Weight at front
    const plMesh = MechanicalBuilder.createHangingLoad(this.payloadMassKg, 0.25, 0.4);
    plMesh.position.set(this.payloadPos, bh + mh, 0);
    this.assemblyGroup.add(plMesh);

    // 6. Mass moment calculations
    const mBase = 350; // kg at (0, bh/2, 0)
    const mMast = 180; // kg at (0, bh + mh/2, 0)
    const mBoom = 150; // kg at ((armLength - 1.2)/2, bh + mh, 0)
    const mCw = this.counterMassKg; // kg at (-1.0, bh + mh, 0)
    const mPl = this.payloadMassKg; // kg at (payloadPos, bh + mh - 0.2, 0)

    const totalM = mBase + mMast + mBoom + mCw + mPl;

    const sumMx =
      mBase * 0 +
      mMast * 0 +
      mBoom * ((this.armLength - 1.2) / 2) +
      mCw * -1.0 +
      mPl * this.payloadPos;

    const sumMy =
      mBase * (bh / 2) +
      mMast * (bh + mh / 2) +
      mBoom * (bh + mh) +
      mCw * (bh + mh + 0.1) +
      mPl * (bh + mh - 0.2);

    const xCg = sumMx / totalM;
    const yCg = sumMy / totalM;

    // Update CG marker position
    this.cgSphere.position.set(xCg, yCg, 0);

    // Update vertical plumb line down to ground
    const plumbPts = [new THREE.Vector3(xCg, yCg, 0), new THREE.Vector3(xCg, 0.02, 0)];
    this.plumbLineMesh.geometry.dispose();
    this.plumbLineMesh.geometry = new THREE.BufferGeometry().setFromPoints(plumbPts);
    this.plumbLineMesh.computeLineDistances();

    // Stability evaluation
    const halfWidth = bw / 2;
    const isStable = Math.abs(xCg) < halfWidth;
    const margin = halfWidth - Math.abs(xCg);

    const mat = this.cgSphere.material as THREE.MeshStandardMaterial;
    mat.color.setHex(isStable ? 0x10b981 : 0xef4444);

    this.metrics['Total Mass M'] = `${totalM.toFixed(0)} kg`;
    this.metrics['Center of Gravity X̄'] = `${xCg.toFixed(3)} m`;
    this.metrics['Center of Gravity Ȳ'] = `${yCg.toFixed(3)} m`;
    this.metrics['Half Base B/2'] = `${halfWidth.toFixed(2)} m`;
    this.metrics['Stability Margin'] = `${margin.toFixed(3)} m`;
    this.metrics['Static State'] = isStable ? 'STABLE (Restoring Moment)' : 'OVERTURNING / TOPPLING';

    this.notifyState();
  }

  protected updatePhysics(_deltaTime: number): void {}
  protected updateVisuals(_deltaTime: number): void {}
}

export function mountCenterOfGravitySimulation(container: HTMLElement, options?: SimulationOptions) {
  return new CenterOfGravityScene(container, options);
}
