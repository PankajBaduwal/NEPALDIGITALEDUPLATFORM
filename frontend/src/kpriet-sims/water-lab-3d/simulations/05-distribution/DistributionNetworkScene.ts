/**
 * Module 5: Water Distribution Network & Sewer Hydraulics
 * U25CE403 — Water Supply and Wastewater Engineering
 * Elevated Storage Reservoir (ESR), Looped Water Distribution Network & Gravity Sewer Slope Profile
 */

import * as THREE from 'three';
import { BaseWaterSimulation, type IBaseWaterSimulationOptions } from '../../core/BaseWaterSimulation';
import type { IDistributionState } from '../../core/types';
import { EnvironmentalCalculator } from '../../core/EnvironmentalCalculator';

export class DistributionNetworkScene extends BaseWaterSimulation {
  private networkGroup: THREE.Group;
  private sewerGroup: THREE.Group;

  constructor(options: IBaseWaterSimulationOptions) {
    super(options);
    this.networkGroup = new THREE.Group();
    this.sewerGroup = new THREE.Group();
    this.waterLabGroup.add(this.networkGroup);
    this.waterLabGroup.add(this.sewerGroup);

    this.defaultCameraPos.set(0, 10, 18);
    this.defaultTarget.set(0, 2.0, 0);
    this.resetCamera();
  }

  public rebuildDistributionNetwork(state: IDistributionState): void {
    while (this.networkGroup.children.length > 0) {
      const child = this.networkGroup.children[0];
      if (child) {
        this.networkGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }
    while (this.sewerGroup.children.length > 0) {
      const child = this.sewerGroup.children[0];
      if (child) {
        this.sewerGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }

    const calc = EnvironmentalCalculator.calculateDistributionHydraulics(state);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 }); // Clean water blue
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const sewerMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 }); // Concrete sewer

    // ─────────────────────────────────────────────────────────────
    // 1. Elevated Storage Reservoir (ESR) (X: -8, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const esrGroup = new THREE.Group();
    esrGroup.position.set(-8, 0, 0);

    // Staging Columns (4 reinforced concrete columns)
    const colGeo = new THREE.CylinderGeometry(0.2, 0.2, 5.0, 16);
    const colPositions: [number, number, number][] = [
      [-1.2, 2.5, -1.2],
      [1.2, 2.5, -1.2],
      [-1.2, 2.5, 1.2],
      [1.2, 2.5, 1.2],
    ];
    colPositions.forEach(([x, y, z]) => {
      const col = new THREE.Mesh(colGeo, concreteMat);
      col.position.set(x, y, z);
      esrGroup.add(col);
    });

    // Elevated Water Tank (Cylindrical container)
    const tankGeo = new THREE.CylinderGeometry(2.2, 2.2, 2.4, 24);
    const tank = new THREE.Mesh(tankGeo, concreteMat);
    tank.position.y = 6.2;
    tank.castShadow = true;
    esrGroup.add(tank);

    // Downcomer distribution main pipe
    const downGeo = new THREE.CylinderGeometry(0.18, 0.18, 5.2, 16);
    const downPipe = new THREE.Mesh(downGeo, pipeMat);
    downPipe.position.set(0, 2.6, 0);
    esrGroup.add(downPipe);

    this.networkGroup.add(esrGroup);

    this.registerInteractive(tank, {
      id: 'esr-tank',
      name: `Elevated Service Reservoir (ESR, Head = ${state.reservoirHeadM} m)`,
      category: 'Water Storage',
      description: `Balancing reservoir equalizing peak hourly consumer demand variations and maintaining minimum residual pressure head (${calc.residualPressureHeadM} m) across the municipal distribution network.`,
      specReference: 'CPHEEO Water Supply Manual Clause 10.3',
      dimensions: 'Staging Height: 15 - 20 m, Capacity: 1/3 to 1/2 of daily demand',
      formula: 'Static Head H = Elev_tank - Elev_ground',
    });

    // ─────────────────────────────────────────────────────────────
    // 2. Looped Water Distribution Mains & Consumer Nodes
    // ─────────────────────────────────────────────────────────────
    const loopGroup = new THREE.Group();
    const pipeRadius = (state.pipeDiameterMm / 1000.0) * 0.4;

    // Node 1 (Inlet) to Node 2 (Branch north)
    const p1Geo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, 6.0, 16);
    const p1 = new THREE.Mesh(p1Geo, pipeMat);
    p1.rotation.z = Math.PI / 2;
    p1.position.set(-5.0, 0.3, 0);
    loopGroup.add(p1);

    // Looped Ring Network (Square 6m × 6m)
    // North pipe
    const pN = new THREE.Mesh(p1Geo, pipeMat);
    pN.position.set(1.0, 0.3, -3.0);
    pN.rotation.z = Math.PI / 2;
    loopGroup.add(pN);

    // South pipe
    const pS = new THREE.Mesh(p1Geo, pipeMat);
    pS.position.set(1.0, 0.3, 3.0);
    pS.rotation.z = Math.PI / 2;
    loopGroup.add(pS);

    // East pipe
    const pE = new THREE.Mesh(p1Geo, pipeMat);
    pE.position.set(4.0, 0.3, 0);
    pE.rotation.x = Math.PI / 2;
    loopGroup.add(pE);

    // West pipe
    const pW = new THREE.Mesh(p1Geo, pipeMat);
    pW.position.set(-2.0, 0.3, 0);
    pW.rotation.x = Math.PI / 2;
    loopGroup.add(pW);

    // Consumer Node with Pressure Gauge at end node (X: 4, Z: 0)
    const gaugeStandGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 12);
    const gaugeStand = new THREE.Mesh(gaugeStandGeo, metalMat);
    gaugeStand.position.set(4.0, 0.9, 0);
    loopGroup.add(gaugeStand);

    const dialGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 24);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.rotation.x = Math.PI / 2;
    dial.position.set(4.0, 1.5, 0.1);
    loopGroup.add(dial);

    this.networkGroup.add(loopGroup);

    this.registerInteractive(dial, {
      id: 'consumer-node',
      name: `Consumer Delivery Node (Residual Pressure: ${calc.residualPressureHeadM} m)`,
      category: 'Distribution Node',
      description: `Delivery point demand Q = ${state.nodeDemandLps} L/s. Flow velocity v = ${calc.flowVelocityMS} m/s. Frictional head loss hf = ${calc.frictionalHeadLossM} m calculated per Hazen-Williams equation (C = ${state.pipeRoughnessC}).`,
      specReference: 'CPHEEO Manual Clause 10.4 (Min Residual Head: 12 m for 2-storey)',
      dimensions: `Diameter: ${state.pipeDiameterMm} mm, Length: ${state.pipeLengthM} m`,
      formula: 'hf = 10.67 · (L · Q^1.852) / (C^1.852 · D^4.87)',
    });

    // ─────────────────────────────────────────────────────────────
    // 3. Underground Gravity Sewer & Inspection Manhole (Z: 6)
    // ─────────────────────────────────────────────────────────────
    const sewerSubGroup = new THREE.Group();
    sewerSubGroup.position.set(0, 0, 7.5);

    // Manhole 1 (Drop inlet)
    const manholeGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.2, 24);
    const mh1 = new THREE.Mesh(manholeGeo, concreteMat);
    mh1.position.set(-6.0, -0.6, 0);
    sewerSubGroup.add(mh1);

    // Manhole 2 (Inspection outlet)
    const mh2 = new THREE.Mesh(manholeGeo, concreteMat);
    mh2.position.set(6.0, -1.2, 0); // lower elevation to show gradient
    sewerSubGroup.add(mh2);

    // Sloped Sewer Pipe running between manholes
    const sewerGeo = new THREE.CylinderGeometry(
      (state.sewerDiameterMm / 1000.0) * 0.5,
      (state.sewerDiameterMm / 1000.0) * 0.5,
      12.0,
      24
    );
    const sewerPipe = new THREE.Mesh(sewerGeo, sewerMat);
    sewerPipe.rotation.z = Math.PI / 2 + 0.05; // sloped
    sewerPipe.position.set(0, -0.9, 0);
    sewerSubGroup.add(sewerPipe);

    this.sewerGroup.add(sewerSubGroup);

    this.registerInteractive(sewerPipe, {
      id: 'gravity-sewer',
      name: `Gravity Sewer (${state.sewerDiameterMm} mm Dia, Slope: 1 in ${state.sewerSlopeRatio})`,
      category: 'Sewerage Hydraulics',
      description: `Manning partial-flow velocity v = ${calc.sewerActualVelocityMS} m/s. Full-bore flow capacity = ${calc.sewerFullCapacityLps} L/s. Status: ${calc.isSelfCleansing ? 'SELF-CLEANSING SATISFIED (v ≥ 0.6 m/s)' : 'SLUGGISH FLOW (Risk of silt deposition)'}.`,
      specReference: 'CPHEEO Sewerage Manual Clause 3.4',
      dimensions: `Diameter: ${state.sewerDiameterMm} mm, Manning n: ${state.manningN}, d/D: ${state.sewerDepthRatio}`,
      formula: 'Manning Velocity: v = (1/n) · R^(2/3) · S^(1/2) ≥ 0.6 m/s',
    });
  }

  public rebuildNetwork(_state?: any): void {
    // Re-renders or updates distribution network
  }

  public update(delta: number, elapsed: number): void {
    // Gentle pulse or gauge pointer shimmer
  }
}
