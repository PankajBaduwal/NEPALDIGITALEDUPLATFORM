import * as THREE from 'three';
import { BaseFluidMachinerySimulation } from '../../core/BaseFluidMachinerySimulation';
import type { ParameterControlDefinition, StageDefinition } from '../../core/types';

export class PerformanceLabScene extends BaseFluidMachinerySimulation {
  private bayMarkers: THREE.Mesh[] = [];

  constructor(container: HTMLElement) {
    super(container);
    this.initialCameraPosition.set(4.5, 3.8, 5.5);
    this.initialCameraTarget.set(0, 0.9, 0);
    this.camera.position.copy(this.initialCameraPosition);
    this.controls.target.copy(this.initialCameraTarget);
    this.controls.update();

    this.initStages();
    this.initParameters();
    this.buildPanoramicLaboratory();
  }

  private initStages(): void {
    this.stages = [
      {
        id: 'stage-overview',
        title: '1. Fluid Mechanics & Machinery Lab Plant',
        description:
          'Comprehensive panoramic layout of the KPRIET Mechanical Engineering Fluid Mechanics and Machinery Laboratory.',
        educationalFocus:
          'Experience the connected testing floor housing Bernoulli, pipe friction, flow meters, pumps, and turbine test rigs with centralized water sump circulation.',
        cameraPosition: [4.5, 3.8, 5.5],
        cameraTarget: [0, 0.9, 0],
      },
      {
        id: 'stage-closed-loop',
        title: '2. Closed-Loop Water Circulation & Sump Sizing',
        description:
          'All test rigs circulate water from underground laboratory sump tanks through overhead constant-head reservoirs and discharge back through flumes.',
        educationalFocus:
          'Conservation of mass and closed-loop hydraulic management in laboratory environments.',
        cameraPosition: [2.5, 2.8, 3.5],
        cameraTarget: [0, 0.9, 0],
      },
    ];
  }

  private initParameters(): void {
    this.availableParameters = [
      {
        id: 'labLightingMode',
        label: 'Lighting Mode',
        unit: 'mode',
        min: 0,
        max: 1,
        step: 1,
        defaultValue: 0,
        description: '0: Day Laboratory Lighting, 1: High-Contrast Technical Inspection Mode.',
        category: 'machine',
      },
    ];

    this.state.parameters = { labLightingMode: 0 };
    this.state.selectedParameterValues = { ...this.state.parameters };
  }

  private buildPanoramicLaboratory(): void {
    const labGroup = new THREE.Group();

    // 1. Surrounding Laboratory Walls & Walkways
    const wallGeo = new THREE.BoxGeometry(14, 3.2, 0.2);
    const backWall = new THREE.Mesh(wallGeo, this.floorMaterial);
    backWall.position.set(0, 1.6, -4.5);
    labGroup.add(backWall);

    // 2. Central Sump Trench with Grating
    const trenchGeo = new THREE.BoxGeometry(10, 0.1, 1.2);
    const trench = new THREE.Mesh(trenchGeo, this.castIronMaterial);
    trench.position.set(0, 0.05, 0);
    labGroup.add(trench);

    // 3. Five Representative Test Bays Placed Around Floor
    const bayOffsets: [number, number, string, string][] = [
      [-3.2, -1.8, 'Bay 1: Bernoulli Verification Rig (Exp 1)', 'u25me-bernoulli-theorem'],
      [-1.6, 2.0, 'Bay 2: Pipe Friction & Minor Losses (Exp 5)', 'u25me-pipe-friction'],
      [0.2, -2.0, 'Bay 3: Flow Meters Calibration (Exp 2, 3, 4)', 'u25me-flow-meters'],
      [2.2, 1.8, 'Bay 4: Pumps Performance Test Rig (Exp 6, 7)', 'u25me-centrifugal-reciprocating-pumps'],
      [3.6, -1.8, 'Bay 5: Pelton & Francis Turbines (Exp 8, 9)', 'u25me-hydraulic-turbines'],
    ];

    bayOffsets.forEach(([x, z, label, id]) => {
      const plinthGeo = new THREE.BoxGeometry(1.4, 0.4, 1.0);
      const plinth = new THREE.Mesh(plinthGeo, this.floorMaterial);
      plinth.position.set(x, 0.2, z);

      // Yellow safety perimeter line
      const outlineGeo = new THREE.BoxGeometry(1.44, 0.02, 1.04);
      const outline = new THREE.Mesh(outlineGeo, this.brassMaterial);
      outline.position.set(x, 0.01, z);
      labGroup.add(outline);

      // Marker pillar
      const markerGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 16);
      const marker = new THREE.Mesh(markerGeo, this.steelMaterial);
      marker.position.set(x, 0.75, z);
      labGroup.add(marker);
      this.bayMarkers.push(marker);

      plinth.userData.inspection = {
        id,
        name: label,
        category: 'hydraulic',
        description: `Operational laboratory station for ${label}. Click to inspect test rig properties.`,
        specifications: { Station: label, 'Status': 'Operational', 'Laboratory': 'Fluid Mechanics & Machinery Lab' },
      };
      labGroup.add(plinth);
    });

    this.scene.add(labGroup);

    this.state.metrics = {
      'Active Laboratory': 'Fluid Mechanics & Machinery Lab',
      'Prescribed Experiments': '9 Core Syllabus Practicals',
      'Sump Circulation': 'Closed Loop (25,000 Liters)',
      'Facility Standard': 'Anna University / Autonomous R2025',
      'Course Code': 'U25MEG05 / U25ME304',
      'Safety Compliance': 'ISO / BIS 5120 Standard',
    };
    this.notify();
  }

  protected updatePhysics(delta: number): void {
    // Gentle pulse on bay markers
    this.bayMarkers.forEach((m, i) => {
      m.position.y = 0.75 + Math.sin(this.state.currentTime * 3.0 + i) * 0.02;
    });
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    // Light mode update if requested
  }
}
