/**
 * PiyushDhara Eduverse — 3D Geotechnical Engineering Laboratory
 * Module 1: Interactive 3D Soil Layers, Borehole Stratigraphy & Effective Stress
 */

import * as THREE from 'three';
import { BaseGeotechnicalSimulation } from '../../core/BaseGeotechnicalSimulation';
import type { IBaseGeotechnicalSimulationOptions } from '../../core/BaseGeotechnicalSimulation';
import type { IStratigraphyParams, ISoilLayer } from '../../core/types';

export class SoilStratigraphyScene extends BaseGeotechnicalSimulation {
  private layerMeshes: Map<string, THREE.Mesh> = new Map();
  private waterTableMesh: THREE.Mesh;
  private depthProbeGroup: THREE.Group;
  private currentParams: IStratigraphyParams;
  private groundCutawayGroup: THREE.Group;

  constructor(options: IBaseGeotechnicalSimulationOptions, initialParams: IStratigraphyParams) {
    super(options);
    this.currentParams = initialParams;

    this.defaultCameraPos.set(5.5, 4.0, 6.0);
    this.defaultTarget.set(0, 1.2, 0);
    this.resetCamera();

    this.groundCutawayGroup = new THREE.Group();
    this.labGroup.add(this.groundCutawayGroup);

    // 1. Build Stratigraphy Layers
    this.buildStratigraphyLayers();

    // 2. Build Water Table
    this.waterTableMesh = this.buildWaterTable();

    // 3. Build Depth Probe
    this.depthProbeGroup = this.buildDepthProbe();

    // 4. Build Depth Scale Post
    this.buildDepthScalePost();
  }

  private buildStratigraphyLayers(): void {
    // Clear existing
    this.layerMeshes.forEach((m) => {
      this.groundCutawayGroup.remove(m);
      m.geometry.dispose();
    });
    this.layerMeshes.clear();

    const blockWidth = 3.6;
    const blockDepth = 3.6;
    const totalDepth = 8.0; // total 8 meters scaled

    // Vertical scaling: 1m depth = 0.45 3D units
    const depthScale = 0.45;
    const groundLevelY = totalDepth * depthScale; // ground surface at top

    this.currentParams.layers.forEach((layer) => {
      if (!layer.visible) return;

      const layerHeight3D = layer.thickness * depthScale;
      const top3D = groundLevelY - layer.depthTop * depthScale;
      const centerY = top3D - layerHeight3D / 2;

      // Color mapping
      let colorHex = 0xc2b280; // default sand
      if (layer.soilType === 'topsoil') colorHex = 0x3f2e18;
      else if (layer.soilType === 'clay') colorHex = 0x6e4726;
      else if (layer.soilType === 'silt') colorHex = 0x8a7b68;
      else if (layer.soilType === 'sand') colorHex = 0xd4b16a;
      else if (layer.soilType === 'gravel') colorHex = 0x5a5f66;

      const geo = new THREE.BoxGeometry(blockWidth, layerHeight3D, blockDepth);
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.9,
        metalness: 0.1,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, centerY, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      this.groundCutawayGroup.add(mesh);
      this.layerMeshes.set(layer.id, mesh);

      this.registerInteractive(mesh, {
        id: layer.id,
        name: `${layer.name} (${layer.depthTop}m - ${layer.depthBottom}m)`,
        functionDesc: `Soil Type: ${layer.soilType.toUpperCase()} | Bulk Density: ${layer.bulkDensity} kN/m³ | Void Ratio e: ${layer.voidRatio} | Permeability: ${layer.permeabilityK} m/s`,
        specification: `Thickness: ${layer.thickness}m, Dry Density: ${layer.dryDensity} kN/m³, Friction Angle φ: ${layer.frictionAngle}°, Cohesion c: ${layer.cohesion} kPa`,
        safetyCaution: layer.depthTop > 3 ? 'Deep excavation requires trench shoring per IS 3764' : undefined,
      });
    });
  }

  private buildWaterTable(): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(3.64, 3.64);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.85,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      ior: 1.333,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;

    const totalDepth = 8.0;
    const depthScale = 0.45;
    const groundLevelY = totalDepth * depthScale;
    mesh.position.set(0, groundLevelY - this.currentParams.waterTableDepth * depthScale, 0);

    this.groundCutawayGroup.add(mesh);

    this.registerInteractive(mesh, {
      id: 'water-table',
      name: 'Phreatic Groundwater Level (Piezometric Surface)',
      functionDesc: `Pore-water pressure u = 0 kPa at water table, increasing hydrostatically below at γw = 9.81 kN/m³ per meter depth.`,
      specification: `Depth: ${this.currentParams.waterTableDepth}m below Ground Level. Saturated soil below has buoyant effective unit weight γ' = γsat - γw.`,
    });

    return mesh;
  }

  private buildDepthProbe(): THREE.Group {
    const group = new THREE.Group();

    // Vertical metal track
    const trackGeo = new THREE.CylinderGeometry(0.02, 0.02, 4.0, 16);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(1.9, 1.8, 0);
    group.add(track);

    // Sliding Sensor Head
    const sensorGeo = new THREE.BoxGeometry(0.18, 0.12, 0.18);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.6 });
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(1.9, 2.0, 0);
    group.add(sensor);

    // Laser indicator beam pointing into soil
    const beamGeo = new THREE.CylinderGeometry(0.005, 0.005, 1.8, 8);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.set(0.95, 2.0, 0);
    group.add(beam);

    this.labGroup.add(group);

    this.registerInteractive(sensor, {
      id: 'borehole-probe',
      name: 'Downhole Piezocone / Stress Inspection Probe',
      functionDesc: 'Measures downhole vertical total stress σ, pore-water pressure u, and computes effective stress σ′ = σ - u.',
      specification: 'Graduated depth resolution: 0.05m | Conforms to ASTM D5778 / IS 4968 piezocone penetration testing.',
    });

    return group;
  }

  private buildDepthScalePost(): void {
    const postGeo = new THREE.BoxGeometry(0.1, 3.8, 0.1);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(-1.9, 1.8, 1.9);
    this.labGroup.add(post);

    // Depth markers along post
    for (let d = 0; d <= 8; d += 1) {
      const ringGeo = new THREE.BoxGeometry(0.12, 0.015, 0.12);
      const ringMat = new THREE.MeshBasicMaterial({ color: d % 2 === 0 ? 0xf59e0b : 0xffffff });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      const y = 8.0 * 0.45 - d * 0.45;
      ring.position.set(-1.9, y, 1.9);
      this.labGroup.add(ring);
    }
  }

  public updateParameters(newParams: IStratigraphyParams): void {
    this.currentParams = newParams;
    this.buildStratigraphyLayers();

    // Update Water Table position
    const totalDepth = 8.0;
    const depthScale = 0.45;
    const groundLevelY = totalDepth * depthScale;
    this.waterTableMesh.position.y = groundLevelY - this.currentParams.waterTableDepth * depthScale;

    // Update probe position
    const probeY = groundLevelY - this.currentParams.selectedDepth * depthScale;
    this.depthProbeGroup.children[1]!.position.y = probeY;
    this.depthProbeGroup.children[2]!.position.y = probeY;
  }

  public update(delta: number): void {
    // Subtle groundwater shimmer
    if (this.waterTableMesh && this.waterTableMesh.material instanceof THREE.MeshPhysicalMaterial) {
      this.waterTableMesh.material.opacity = 0.85 + Math.sin(Date.now() * 0.002) * 0.05;
    }
  }
}
