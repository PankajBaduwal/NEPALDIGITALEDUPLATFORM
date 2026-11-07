/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 07: Centroid of Composite Areas
 * Unit III: Properties of Surfaces and Solids
 *
 * Demonstrates:
 * - Geometric decomposition into standard analytical sub-shapes
 * - Area-weighted first moment summation: x̄ = Σ(Ai xi) / ΣAi, ȳ = Σ(Ai yi) / ΣAi
 * - Negative area formulation for voids and circular cutouts
 * - Lines of symmetry and centroidal axes
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';

type ShapePreset = 't-section' | 'i-section' | 'l-angle' | 'plate-with-hole';

export class CompositeCentroidsScene extends BaseMechanicsSimulation {
  private meshGroup = new THREE.Group();
  private centroidMarkersGroup = new THREE.Group();
  private compositeCentroidMesh!: THREE.Mesh;

  private currentPreset: ShapePreset = 't-section';
  private hasHole = false;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(10, 10);
    ground.position.y = -1.5;
    this.scene.add(ground);

    this.scene.add(this.meshGroup);
    this.scene.add(this.centroidMarkersGroup);

    // Composite centroid target marker (Red/Gold dual ring sphere)
    const markerGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const markerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.2 });
    this.compositeCentroidMesh = new THREE.Mesh(markerGeo, markerMat);
    this.scene.add(this.compositeCentroidMesh);

    this.parameters['preset'] = 't-section';
    this.parameters['flangeWidth'] = 2.4;
    this.parameters['flangeThick'] = 0.4;
    this.parameters['webHeight'] = 2.0;
    this.parameters['webThick'] = 0.4;
    this.parameters['includeHole'] = false;

    this.recalculateAndRender();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-geometric-decomposition',
        index: 0,
        title: 'Stage 1: Geometric Decomposition into Analytical Primitives',
        shortDescription: 'Divide an irregular or built-up structural section into rectangles and standard geometrical shapes.',
        detailedExplanation:
          'Complex structural sections (T-beams, I-girders, channels) are analyzed by decomposing them into simple analytical shapes ' +
          '(rectangles, triangles, circles) whose areas A_i and centroid locations (x_i, y_i) are established standard textbook values. ' +
          'A horizontal reference axis (X-axis) and vertical reference axis (Y-axis) are selected at an outer baseline.',
        principles: [
          'Additivity of Area and First Moments',
          'Standard Primitive Formulae (Rectangle: A = bh, x̄ = b/2, ȳ = h/2)',
        ],
        equations: [
          'A_{total} = \\sum A_i',
        ],
        keyTerminology: [
          { term: 'Composite Area', definition: 'A planar figure constructed from two or more simpler geometric parts.' },
          { term: 'Reference Datum', definition: 'The coordinate origin from which all component centroids are measured.' },
        ],
        highlightComponentIds: ['composite-section', 'flange', 'web'],
        recommendedCamera: { position: [0, 1.2, 5.0], target: [0, 1.0, 0] },
      },
      {
        id: 'stage-first-moment-tabular',
        index: 1,
        title: 'Stage 2: First Moments of Area (Qx = ΣAi yi, Qy = ΣAi xi)',
        shortDescription: 'Multiply each component area by its centroid coordinate to obtain first moments of area.',
        detailedExplanation:
          'The first moment of area with respect to the X-axis is Qx = Σ(A_i · y_i), representing the area-weighted vertical distance. ' +
          'Similarly, the first moment about the Y-axis is Qy = Σ(A_i · x_i). ' +
          'Dividing by total area yields the composite centroid coordinates: x̄ = Qy / A and ȳ = Qx / A.',
        principles: [
          'First Moment of Area: Q_x = Σ(A_i · y_i)',
          'Vertical Centroid: ȳ = Q_x / A_total',
          'Horizontal Centroid: x̄ = Q_y / A_total',
        ],
        equations: [
          '\\bar{x} = \\frac{\\sum A_i x_i}{\\sum A_i}, \\quad \\bar{y} = \\frac{\\sum A_i y_i}{\\sum A_i}',
        ],
        keyTerminology: [
          { term: 'First Moment of Area', definition: 'The product of an area and the distance from a reference axis to its centroid.' },
          { term: 'Centroid', definition: 'The geometric center of a plane area where first moments vanish identically.' },
        ],
        highlightComponentIds: ['composite-section'],
        recommendedCamera: { position: [0, 1.2, 5.0], target: [0, 1.0, 0] },
      },
      {
        id: 'stage-negative-area-voids',
        index: 2,
        title: 'Stage 3: Cutouts and Voids as Negative Areas (A_void < 0)',
        shortDescription: 'Holes and material cutouts are incorporated by subtracting their area and first moments from the solid figure.',
        detailedExplanation:
          'When an area contains a hole or void, the cutout is treated as a component with negative area (A_hole < 0). ' +
          'Its first moments (A_hole · x_hole and A_hole · y_hole) are likewise subtracted from the total: ' +
          'ȳ = (A_solid · y_solid - A_hole · y_hole) / (A_solid - A_hole). ' +
          'This rigorously shifts the centroid away from the void toward the remaining solid material.',
        principles: [
          'Subtraction Principle for Voids: A_net = A_gross - A_hole',
          'First Moment subtraction: Q_net = Q_gross - Q_hole',
        ],
        equations: [
          '\\bar{y} = \\frac{A_1 y_1 - A_{hole} y_{hole}}{A_1 - A_{hole}}',
        ],
        keyTerminology: [
          { term: 'Void / Cutout', definition: 'An empty region treated mathematically as negative mass/area.' },
        ],
        highlightComponentIds: ['composite-section', 'void-hole'],
        recommendedCamera: { position: [0, 1.2, 5.0], target: [0, 1.0, 0] },
      },
      {
        id: 'stage-axis-symmetry',
        index: 3,
        title: 'Stage 4: Lines of Symmetry & Neutral Axis Location',
        shortDescription: 'An axis of symmetry is always a centroidal axis, immediately establishing one centroid coordinate without calculation.',
        detailedExplanation:
          'If a plane area possesses a line of symmetry, its centroid MUST lie upon that line. ' +
          'For symmetric T-sections and I-sections, the vertical Y-axis is an axis of symmetry, so x̄ is known by inspection. ' +
          'If an area has two orthogonal lines of symmetry (e.g. an I-section or rectangle), the centroid lies at their unique intersection point.',
        principles: [
          'Symmetry Theorem: Centroid lies on all lines of symmetry',
          'Two axes of symmetry immediately pinpoint the centroid',
        ],
        equations: [
          '\\text{If Y-axis is symmetry axis } \\implies \\bar{x} = 0',
        ],
        keyTerminology: [
          { term: 'Axis of Symmetry', definition: 'A line dividing a figure into two mirror-image halves.' },
        ],
        highlightComponentIds: ['composite-section'],
        recommendedCamera: { position: [0, 1.2, 5.0], target: [0, 1.0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('composite-section', {
      id: 'composite-section',
      name: 'Composite Section Cross-Section',
      category: 'cross-section',
      material: 'Structural Steel Built-Up Profile',
      scientificRole: 'Composite planar area whose centroid defines the neutral bending axis.',
      specifications: 'Shape: Symmetric T-Section · Extrusion: 0.15 m',
      anchorPosition: [0, 1.5, 0],
    });

    this.components.set('flange', {
      id: 'flange',
      name: 'Top Flange Component (A1)',
      category: 'sub-shape',
      material: 'Horizontal Structural Plate',
      specifications: 'Dimensions: 2.4 m x 0.4 m · Centroid: (0, 2.2 m)',
      scientificRole: 'Resists compressive/tensile bending stresses farthest from neutral axis.',
      anchorPosition: [0, 2.2, 0],
    });

    this.components.set('web', {
      id: 'web',
      name: 'Vertical Web Component (A2)',
      category: 'sub-shape',
      material: 'Vertical Structural Web',
      specifications: 'Dimensions: 0.4 m x 2.0 m · Centroid: (0, 1.0 m)',
      scientificRole: 'Connects flanges and carries transverse shear force.',
      anchorPosition: [0, 1.0, 0],
    });
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.currentPreset = 't-section';
      this.hasHole = false;
    } else if (stageIndex === 1) {
      this.currentPreset = 't-section';
      this.hasHole = false;
    } else if (stageIndex === 2) {
      this.currentPreset = 'plate-with-hole';
      this.hasHole = true;
    } else if (stageIndex === 3) {
      this.currentPreset = 'i-section';
      this.hasHole = false;
    }
    this.parameters['preset'] = this.currentPreset;
    this.parameters['includeHole'] = this.hasHole;
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    if (key === 'preset') this.currentPreset = value as ShapePreset;
    if (key === 'includeHole') this.hasHole = Boolean(value);
    this.recalculateAndRender();
  }

  private recalculateAndRender(): void {
    this.meshGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.meshGroup.clear();
    this.centroidMarkersGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.centroidMarkersGroup.clear();

    let totalArea = 0;
    let sumAy = 0;
    let sumAx = 0;

    const extrudeSettings = { depth: 0.15, bevelEnabled: false };

    if (this.currentPreset === 't-section') {
      const bf = Number(this.parameters['flangeWidth'] || 2.4);
      const tf = Number(this.parameters['flangeThick'] || 0.4);
      const hw = Number(this.parameters['webHeight'] || 2.0);
      const tw = Number(this.parameters['webThick'] || 0.4);

      // Web: [ -tw/2 to tw/2 ] from y=0 to y=hw
      const webShape = new THREE.Shape();
      webShape.moveTo(-tw / 2, 0);
      webShape.lineTo(tw / 2, 0);
      webShape.lineTo(tw / 2, hw);
      webShape.lineTo(-tw / 2, hw);
      webShape.closePath();

      const webMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(webShape, extrudeSettings), MechanicalBuilder.materials.steel);
      this.meshGroup.add(webMesh);

      // Flange: [ -bf/2 to bf/2 ] from y=hw to y=hw+tf
      const flangeShape = new THREE.Shape();
      flangeShape.moveTo(-bf / 2, hw);
      flangeShape.lineTo(bf / 2, hw);
      flangeShape.lineTo(bf / 2, hw + tf);
      flangeShape.lineTo(-bf / 2, hw + tf);
      flangeShape.closePath();

      const flangeMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(flangeShape, extrudeSettings), MechanicalBuilder.materials.darkSteel);
      this.meshGroup.add(flangeMesh);

      // Calculations:
      const aWeb = tw * hw;
      const yWeb = hw / 2;
      const aFlange = bf * tf;
      const yFlange = hw + tf / 2;

      totalArea = aWeb + aFlange;
      sumAy = aWeb * yWeb + aFlange * yFlange;
      sumAx = 0; // symmetric about X=0

      // Component markers
      this.addCentroidMarker(0, yWeb, 0x0284c7, 'Web C2');
      this.addCentroidMarker(0, yFlange, 0xd97706, 'Flange C1');
    } else if (this.currentPreset === 'plate-with-hole') {
      // Plate: 3.0 wide x 2.0 high with circular hole of radius 0.5 at (0, 1.0)
      const w = 3.0;
      const h = 2.0;
      const rHole = 0.45;
      const holeY = 1.0;

      const plateShape = new THREE.Shape();
      plateShape.moveTo(-w / 2, 0);
      plateShape.lineTo(w / 2, 0);
      plateShape.lineTo(w / 2, h);
      plateShape.lineTo(-w / 2, h);
      plateShape.closePath();

      const holePath = new THREE.Path();
      holePath.absarc(0, holeY, rHole, 0, Math.PI * 2, true);
      plateShape.holes.push(holePath);

      const plateMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(plateShape, extrudeSettings), MechanicalBuilder.materials.steel);
      this.meshGroup.add(plateMesh);

      const aPlate = w * h;
      const yPlate = h / 2;
      const aHole = Math.PI * rHole * rHole;
      const yHole = holeY;

      totalArea = aPlate - aHole;
      sumAy = aPlate * yPlate - aHole * yHole;
      sumAx = 0;

      this.addCentroidMarker(0, yPlate, 0x0284c7, 'Gross Plate');
      this.addCentroidMarker(0, yHole, 0xef4444, 'Void Center');
    } else {
      // I-Section: Symmetric about both axes
      const bf = 2.4;
      const tf = 0.35;
      const hw = 2.0;
      const tw = 0.35;

      const iShape = new THREE.Shape();
      // Draw symmetrical I-shape
      iShape.moveTo(-bf / 2, 0);
      iShape.lineTo(bf / 2, 0);
      iShape.lineTo(bf / 2, tf);
      iShape.lineTo(tw / 2, tf);
      iShape.lineTo(tw / 2, tf + hw);
      iShape.lineTo(bf / 2, tf + hw);
      iShape.lineTo(bf / 2, 2 * tf + hw);
      iShape.lineTo(-bf / 2, 2 * tf + hw);
      iShape.lineTo(-bf / 2, tf + hw);
      iShape.lineTo(-tw / 2, tf + hw);
      iShape.lineTo(-tw / 2, tf);
      iShape.lineTo(-bf / 2, tf);
      iShape.closePath();

      const iMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(iShape, extrudeSettings), MechanicalBuilder.materials.steel);
      this.meshGroup.add(iMesh);

      totalArea = 2 * (bf * tf) + (tw * hw);
      sumAy = totalArea * (tf + hw / 2);
      sumAx = 0;
    }

    const yCentroid = sumAy / totalArea;
    const xCentroid = sumAx / totalArea;

    // Position composite centroid marker
    this.compositeCentroidMesh.position.set(xCentroid, yCentroid, 0.2);

    this.metrics['Total Area A'] = `${totalArea.toFixed(3)} m²`;
    this.metrics['Centroid x̄'] = `${xCentroid.toFixed(3)} m (Symmetric)`;
    this.metrics['Centroid ȳ'] = `${yCentroid.toFixed(3)} m from base`;
    this.metrics['First Moment Qx'] = `${sumAy.toFixed(3)} m³`;

    this.notifyState();
  }

  private addCentroidMarker(x: number, y: number, color: number, _label: string): void {
    const geo = new THREE.SphereGeometry(0.06, 16, 16);
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 0.18);
    this.centroidMarkersGroup.add(mesh);
  }

  protected updatePhysics(_deltaTime: number): void {}
  protected updateVisuals(_deltaTime: number): void {}
}

export function mountCompositeCentroidsSimulation(container: HTMLElement, options?: SimulationOptions) {
  return new CompositeCentroidsScene(container, options);
}
