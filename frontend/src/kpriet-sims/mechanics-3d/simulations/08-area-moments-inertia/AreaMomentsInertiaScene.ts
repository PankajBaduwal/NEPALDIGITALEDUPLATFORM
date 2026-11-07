/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 08: Area Moment of Inertia and Radius of Gyration
 * Unit III: Properties of Surfaces and Solids
 *
 * Demonstrates:
 * - Second moment of area (I = ∫ y² dA) as a measure of beam bending resistance
 * - Parallel-Axis Theorem (Steiner's Theorem): I_axis = I_centroid + A · d²
 * - Polar moment of inertia J = Ix + Iy for torsional resistance
 * - Radius of gyration k = √(I / A) and structural column slenderness
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';

type SectionType = 'rectangle' | 'circle' | 'hollow-circle' | 'i-beam';

export class AreaMomentsInertiaScene extends BaseMechanicsSimulation {
  private sectionGroup = new THREE.Group();
  private axesGroup = new THREE.Group();
  private offsetAxisGroup = new THREE.Group();

  private sectionType: SectionType = 'rectangle';
  private widthB = 1.2; // meters
  private heightH = 2.0; // meters
  private radiusR = 1.0;
  private innerRadius = 0.6;
  private offsetD = 1.2; // meters offset from centroid
  private showParallelAxis = true;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(10, 10);
    ground.position.y = -2.0;
    this.scene.add(ground);

    this.scene.add(this.sectionGroup);
    this.scene.add(this.axesGroup);
    this.scene.add(this.offsetAxisGroup);

    this.parameters['sectionType'] = 'rectangle';
    this.parameters['width'] = 1.2;
    this.parameters['height'] = 2.0;
    this.parameters['offsetDistance'] = 1.2;
    this.parameters['showParallel'] = true;

    this.recalculateAndRender();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-second-moment-concept',
        index: 0,
        title: 'Stage 1: Second Moment of Area (I = ∫ y² dA)',
        shortDescription: 'Area Moment of Inertia reflects how cross-sectional area is distributed relative to the neutral bending axis.',
        detailedExplanation:
          'The second moment of area (I) is a fundamental geometric property that governs a beam\'s resistance to bending deflection and flexural stress. ' +
          'Because the distance y from the axis is squared (y² dA), material placed farthest from the neutral axis contributes exponentially more to bending stiffness. ' +
          'This explains why structural I-beams concentrate maximum material into top and bottom flanges far from the centroid.',
        principles: [
          'Quadratic Distance Weighting: I = ∫ y² dA',
          'Flexural Rigidity: Bending deflection is inversely proportional to EI',
          'Neutral Axis passes through the area centroid',
        ],
        equations: [
          'I_x = \\int y^2 \\, dA, \\quad I_y = \\int x^2 \\, dA',
          'I_{rectangle} = \\frac{b \\cdot h^3}{12}',
        ],
        keyTerminology: [
          { term: 'Second Moment of Area', definition: 'The integral of y² dA over a cross-section, measuring resistance to bending.' },
          { term: 'Neutral Axis', definition: 'The centroidal axis experiencing zero longitudinal strain under pure bending.' },
        ],
        highlightComponentIds: ['cross-section', 'centroidal-axis'],
        recommendedCamera: { position: [0, 0, 5.2], target: [0, 0, 0] },
      },
      {
        id: 'stage-parallel-axis-theorem',
        index: 1,
        title: 'Stage 2: Parallel-Axis Theorem (Steiner\'s Theorem)',
        shortDescription: 'I_axis = I_centroid + A · d² relates inertia about any arbitrary parallel axis to the centroidal axis.',
        detailedExplanation:
          'Steiner\'s Theorem states that the second moment of area about any axis parallel to a centroidal axis equals the centroidal moment ' +
          'plus the product of the cross-sectional area and the square of the perpendicular distance d between the two axes: I = Ic + A · d². ' +
          'Because A · d² is always non-negative, the centroidal axis ALWAYS has the MINIMUM second moment of area among all parallel axes.',
        principles: [
          'Inertia Transfer Formulation: I_parallel = I_c + A · d²',
          'Minimum Inertia Property: Centroidal axis has absolute minimum inertia',
        ],
        equations: [
          'I_{parallel} = I_{centroid} + A \\cdot d^2',
        ],
        keyTerminology: [
          { term: 'Parallel-Axis Theorem', definition: 'Equation transferring area moments of inertia between parallel axes.' },
          { term: 'Offset Distance (d)', definition: 'The perpendicular separation between the centroidal axis and the parallel axis.' },
        ],
        highlightComponentIds: ['cross-section', 'centroidal-axis', 'parallel-axis'],
        recommendedCamera: { position: [0, 0, 5.2], target: [0, 0, 0] },
      },
      {
        id: 'stage-polar-moment',
        index: 2,
        title: 'Stage 3: Polar Moment of Inertia (J = Ix + Iy)',
        shortDescription: 'Measures resistance to torsional twisting about a perpendicular longitudinal axis: J = ∫ r² dA = Ix + Iy.',
        detailedExplanation:
          'The polar moment of inertia J evaluates the resistance of shafts and circular cross-sections to torsional deformation. ' +
          'By the perpendicular axis theorem for flat laminas, J = Ix + Iy. ' +
          'For a solid circular shaft of radius R: J = π R⁴ / 2. ' +
          'A hollow tube removes central material with low r² contribution, drastically reducing weight while preserving high torsional rigidity.',
        principles: [
          'Perpendicular Axis Theorem: J = Ix + Iy',
          'Torsional Shearing Stress: τ = T · r / J',
        ],
        equations: [
          'J = \\int r^2 \\, dA = I_x + I_y',
          'J_{circle} = \\frac{\\pi R^4}{2}',
        ],
        keyTerminology: [
          { term: 'Polar Moment of Inertia (J)', definition: 'Resistance of a cross section to twisting under applied torque.' },
        ],
        highlightComponentIds: ['cross-section'],
        recommendedCamera: { position: [0, 0, 5.2], target: [0, 0, 0] },
      },
      {
        id: 'stage-radius-of-gyration',
        index: 3,
        title: 'Stage 4: Radius of Gyration (k = √(I / A))',
        shortDescription: 'The radial distance from the axis at which the entire area could be concentrated into a thin line strip without altering I.',
        detailedExplanation:
          'The radius of gyration k is defined as k = √(I / A), so that I = A · k². ' +
          'In structural column mechanics, slenderness ratio λ = L_eff / k governs Euler elastic buckling. ' +
          'A cross-section with higher radius of gyration distributes its area farther from the center, resisting column buckling far more effectively.',
        principles: [
          'Definition: k = √(I / A)',
          'Column Slenderness: λ = L / k governs compressive buckling resistance',
        ],
        equations: [
          'k = \\sqrt{\\frac{I}{A}} \\implies I = A \\cdot k^2',
          '\\lambda = \\frac{L_{eff}}{k}',
        ],
        keyTerminology: [
          { term: 'Radius of Gyration (k)', definition: 'Equivalent distance from the reference axis at which the area may be concentrated.' },
          { term: 'Slenderness Ratio (λ)', definition: 'Ratio of effective column length to its minimum radius of gyration.' },
        ],
        highlightComponentIds: ['cross-section'],
        recommendedCamera: { position: [0, 0, 5.2], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('cross-section', {
      id: 'cross-section',
      name: 'Structural Cross-Section Plane',
      category: 'section',
      material: 'Homogeneous Structural Steel Profile',
      scientificRole: 'Area geometry determining flexural rigidity EI and bending capacity.',
      specifications: 'Shape: Rectangle (1.2 m x 2.0 m) · Area: 2.4 m²',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('centroidal-axis', {
      id: 'centroidal-axis',
      name: 'Centroidal Neutral Axis Xc',
      category: 'axis',
      material: 'Mathematical Neutral Axis (Cyan)',
      scientificRole: 'Axis passing through centroid with minimum second moment of area Ic.',
      specifications: 'Location: y = 0 · Ic = 0.800 m⁴',
      anchorPosition: [1.2, 0, 0],
    });

    this.components.set('parallel-axis', {
      id: 'parallel-axis',
      name: 'Offset Parallel Axis X\'',
      category: 'axis',
      material: 'Parallel Reference Line (Amber)',
      scientificRole: 'Demonstrates Steiner\'s theorem: I_parallel = Ic + A · d².',
      specifications: 'Offset: d = 1.2 m · I = 4.256 m⁴',
      anchorPosition: [1.2, 1.2, 0],
    });
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.sectionType = 'rectangle';
      this.showParallelAxis = false;
    } else if (stageIndex === 1) {
      this.sectionType = 'rectangle';
      this.showParallelAxis = true;
    } else if (stageIndex === 2) {
      this.sectionType = 'circle';
      this.showParallelAxis = false;
    } else if (stageIndex === 3) {
      this.sectionType = 'i-beam';
      this.showParallelAxis = false;
    }
    this.parameters['sectionType'] = this.sectionType;
    this.parameters['showParallel'] = this.showParallelAxis;
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    if (key === 'sectionType') this.sectionType = value as SectionType;
    if (key === 'width') this.widthB = Number(value);
    if (key === 'height') this.heightH = Number(value);
    if (key === 'offsetDistance') this.offsetD = Number(value);
    if (key === 'showParallel') this.showParallelAxis = Boolean(value);
    this.recalculateAndRender();
  }

  private recalculateAndRender(): void {
    this.sectionGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.sectionGroup.clear();
    this.axesGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.axesGroup.clear();
    this.offsetAxisGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.offsetAxisGroup.clear();

    let area = 0;
    let icX = 0;
    let icY = 0;

    const depth = 0.2;

    if (this.sectionType === 'rectangle') {
      const b = this.widthB;
      const h = this.heightH;
      area = b * h;
      icX = (b * Math.pow(h, 3)) / 12;
      icY = (h * Math.pow(b, 3)) / 12;

      const geo = new THREE.BoxGeometry(b, h, depth);
      const mesh = new THREE.Mesh(geo, MechanicalBuilder.materials.steel);
      this.sectionGroup.add(mesh);
    } else if (this.sectionType === 'circle') {
      const r = this.radiusR;
      area = Math.PI * r * r;
      icX = (Math.PI * Math.pow(r, 4)) / 4;
      icY = icX;

      const geo = new THREE.CylinderGeometry(r, r, depth, 32);
      geo.rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(geo, MechanicalBuilder.materials.steel);
      this.sectionGroup.add(mesh);
    } else if (this.sectionType === 'hollow-circle') {
      const ro = this.radiusR;
      const ri = this.innerRadius;
      area = Math.PI * (ro * ro - ri * ri);
      icX = (Math.PI * (Math.pow(ro, 4) - Math.pow(ri, 4))) / 4;
      icY = icX;

      const shape = new THREE.Shape();
      shape.absarc(0, 0, ro, 0, Math.PI * 2, false);
      const hole = new THREE.Path();
      hole.absarc(0, 0, ri, 0, Math.PI * 2, true);
      shape.holes.push(hole);

      const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
      geo.translate(0, 0, -depth / 2);
      const mesh = new THREE.Mesh(geo, MechanicalBuilder.materials.steel);
      this.sectionGroup.add(mesh);
    } else {
      // I-Beam
      const bf = 1.6;
      const tf = 0.3;
      const hw = 2.0;
      const tw = 0.25;
      const totalH = hw + 2 * tf;

      area = 2 * (bf * tf) + tw * hw;
      // IcX = (bf * totalH^3 - (bf - tw) * hw^3) / 12
      icX = (bf * Math.pow(totalH, 3) - (bf - tw) * Math.pow(hw, 3)) / 12;
      icY = (2 * tf * Math.pow(bf, 3) + hw * Math.pow(tw, 3)) / 12;

      const iMesh = MechanicalBuilder.createBeam(depth, totalH, bf, 'i-beam');
      iMesh.rotateY(Math.PI / 2);
      this.sectionGroup.add(iMesh);
    }

    const jPolar = icX + icY;
    const kGyrationX = Math.sqrt(icX / area);
    const kGyrationY = Math.sqrt(icY / area);

    // Centroidal Axis Xc (Cyan line)
    const axisMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 2 });
    const axisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.0, 0, 0.12), new THREE.Vector3(3.0, 0, 0.12)]);
    this.axesGroup.add(new THREE.Line(axisGeo, axisMat));

    // Parallel Axis (Amber dashed line)
    if (this.showParallelAxis) {
      const d = this.offsetD;
      const iParallel = icX + area * (d * d);

      const pMat = new THREE.LineDashedMaterial({ color: 0xd97706, dashSize: 0.1, gapSize: 0.06 });
      const pGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.0, d, 0.12), new THREE.Vector3(3.0, d, 0.12)]);
      const pLine = new THREE.Line(pGeo, pMat);
      pLine.computeLineDistances();
      this.offsetAxisGroup.add(pLine);

      this.metrics['Centroidal Ic'] = `${icX.toFixed(4)} m⁴`;
      this.metrics['Parallel Shift A·d²'] = `${(area * d * d).toFixed(4)} m⁴`;
      this.metrics['Total I_parallel'] = `${iParallel.toFixed(4)} m⁴`;
      this.metrics['Offset Distance d'] = `${d.toFixed(2)} m`;
    } else {
      this.metrics['Area A'] = `${area.toFixed(3)} m²`;
      this.metrics['Moment of Inertia Ixx'] = `${icX.toFixed(4)} m⁴`;
      this.metrics['Moment of Inertia Iyy'] = `${icY.toFixed(4)} m⁴`;
      this.metrics['Polar Moment J'] = `${jPolar.toFixed(4)} m⁴`;
      this.metrics['Radius of Gyration kx'] = `${kGyrationX.toFixed(3)} m`;
      this.metrics['Radius of Gyration ky'] = `${kGyrationY.toFixed(3)} m`;
    }

    this.notifyState();
  }

  protected updatePhysics(_deltaTime: number): void {}
  protected updateVisuals(_deltaTime: number): void {}
}

export function mountAreaMomentsInertiaSimulation(container: HTMLElement, options?: SimulationOptions) {
  return new AreaMomentsInertiaScene(container, options);
}
