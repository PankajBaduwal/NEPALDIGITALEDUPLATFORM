/**
 * Module 4: Road Construction Sequence & Machinery
 * U25CE402 — Highway Engineering
 * Subgrade, GSB, WMM Base, DBM Binder, and BC Wearing Course with Earthmoving & Paving Equipment
 */

import * as THREE from 'three';
import { BaseHighwaySimulation, type IBaseHighwaySimulationOptions } from '../../core/BaseHighwaySimulation';
import type { IConstructionSequenceState } from '../../core/types';

export class ConstructionSequenceScene extends BaseHighwaySimulation {
  private stagesGroup: THREE.Group;
  private equipmentGroup: THREE.Group;
  private currentStageIndex = 0;
  private equipmentPos = 0;

  constructor(options: IBaseHighwaySimulationOptions) {
    super(options);
    this.stagesGroup = new THREE.Group();
    this.equipmentGroup = new THREE.Group();

    this.highwayGroup.add(this.stagesGroup);
    this.highwayGroup.add(this.equipmentGroup);

    this.defaultCameraPos.set(16, 9, 20);
    this.defaultTarget.set(0, 1.2, 0);
    this.resetCamera();

    this.buildEquipmentModels();
  }

  private buildEquipmentModels(): void {
    // 1. Motor Grader / Paver Model
    const paverGroup = new THREE.Group();
    paverGroup.name = 'paver';

    // Body
    const bodyGeo = new THREE.BoxGeometry(3.2, 1.8, 5.0);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 }); // Construction yellow
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.6;
    body.castShadow = true;
    paverGroup.add(body);

    // Operator cabin
    const cabGeo = new THREE.BoxGeometry(2.2, 1.4, 2.0);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 3.0, -0.6);
    cab.castShadow = true;
    paverGroup.add(cab);

    // Screed / Blade at rear
    const screedGeo = new THREE.BoxGeometry(4.2, 0.4, 1.0);
    const screedMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const screed = new THREE.Mesh(screedGeo, screedMat);
    screed.position.set(0, 0.4, 2.5);
    paverGroup.add(screed);

    // Caterpillar tracks
    const trackGeo = new THREE.BoxGeometry(0.6, 0.8, 4.6);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const leftTrack = new THREE.Mesh(trackGeo, trackMat);
    leftTrack.position.set(-1.8, 0.4, 0);
    const rightTrack = new THREE.Mesh(trackGeo, trackMat);
    rightTrack.position.set(1.8, 0.4, 0);
    paverGroup.add(leftTrack);
    paverGroup.add(rightTrack);

    paverGroup.position.set(0, 0, -4);
    this.equipmentGroup.add(paverGroup);

    this.registerInteractive(paverGroup, {
      id: 'asphalt-paver',
      name: 'Hydrostatic Sensor Paver Finisher',
      category: 'Paving Equipment',
      description: 'Equipped with electronic sensor tamping and vibrating heated screed capable of laying DBM and BC to accurate grade, camber, and level without segregation.',
      specReference: 'MORTH Section 500 (Clause 504.3.4)',
      dimensions: 'Operating width: 7.0 m, Screed heating: Gas / Electric',
    });

    // 2. Heavy Tandem Vibratory Roller behind paver
    const rollerGroup = new THREE.Group();
    rollerGroup.name = 'roller';

    const rollerBodyGeo = new THREE.BoxGeometry(2.4, 1.4, 3.6);
    const rollerBody = new THREE.Mesh(rollerBodyGeo, bodyMat);
    rollerBody.position.y = 1.4;
    rollerGroup.add(rollerBody);

    // Front and Rear Steel Drums
    const drumGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.6, 24);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
    const frontDrum = new THREE.Mesh(drumGeo, drumMat);
    frontDrum.rotation.z = Math.PI / 2;
    frontDrum.position.set(0, 0.7, 1.8);
    rollerGroup.add(frontDrum);

    const rearDrum = new THREE.Mesh(drumGeo, drumMat);
    rearDrum.rotation.z = Math.PI / 2;
    rearDrum.position.set(0, 0.7, -1.8);
    rollerGroup.add(rearDrum);

    rollerGroup.position.set(0, 0, 8);
    this.equipmentGroup.add(rollerGroup);

    this.registerInteractive(rollerGroup, {
      id: 'tandem-roller',
      name: '8-10 Tonne Tandem Vibratory Roller',
      category: 'Compaction Equipment',
      description: 'Used for breakdown rolling and intermediate rolling of bituminous layers at 130°C-150°C to achieve minimum 98% Marshall density and smooth surface profile.',
      specReference: 'MORTH Section 500 (Clause 504.3.5)',
      dimensions: 'Static weight: 9.5 tonnes, Drum width: 2.2 m',
    });
  }

  public setStage(stageIndex: number, state: IConstructionSequenceState): void {
    this.currentStageIndex = stageIndex;
    const roadWidth = 7.0;
    const roadLength = 30.0;

    // Clear current layers
    while (this.stagesGroup.children.length > 0) {
      const child = this.stagesGroup.children[0];
      if (child) {
        this.stagesGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }

    // Cumulative layers up to current stage
    const stageConfigs = [
      { name: '1. Compacted Subgrade', color: 0x78350f, thickness: 0.5, desc: '500 mm compacted earth to 97% MDD' },
      { name: '2. Granular Sub-base (GSB)', color: 0xa1a1aa, thickness: 0.2, desc: '200 mm graded stone aggregate GSB' },
      { name: '3. Wet Mix Macadam (WMM)', color: 0x64748b, thickness: 0.25, desc: '250 mm mechanically interlocked stone base' },
      { name: '4. Dense Bituminous Macadam (DBM)', color: 0x334155, thickness: 0.1, desc: '100 mm binder course with VG-30 bitumen' },
      { name: '5. Bituminous Concrete (BC)', color: 0x18181b, thickness: 0.05, desc: '50 mm wearing course with lane markings' },
    ];

    let currentY = 0;
    for (let i = 0; i <= stageIndex && i < stageConfigs.length; i++) {
      const cfg = stageConfigs[i];
      if (!cfg) continue;
      const layerGeo = new THREE.BoxGeometry(roadWidth + (stageConfigs.length - 1 - i) * 0.4, cfg.thickness, roadLength);
      const layerMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.85,
        metalness: 0.1,
      });
      const layerMesh = new THREE.Mesh(layerGeo, layerMat);
      layerMesh.position.set(0, currentY + cfg.thickness / 2, 0);
      layerMesh.receiveShadow = true;
      this.stagesGroup.add(layerMesh);

      this.registerInteractive(layerMesh, {
        id: `const-layer-${i}`,
        name: cfg.name,
        category: 'Construction Stage',
        description: cfg.desc,
        specReference: 'MORTH Specifications for Road and Bridge Works (5th Revision)',
        dimensions: `Thickness: ${(cfg.thickness * 1000).toFixed(0)} mm, Carriageway: ${roadWidth} m`,
      });

      currentY += cfg.thickness;
    }

    // Equipment position update according to stage
    this.equipmentGroup.visible = stageIndex >= 2;
  }

  public update(delta: number, elapsed: number): void {
    // Gentle vibration animation on roller drums
    const roller = this.equipmentGroup.getObjectByName('roller');
    if (roller) {
      roller.position.y = Math.sin(elapsed * 25) * 0.015;
    }
  }
}
