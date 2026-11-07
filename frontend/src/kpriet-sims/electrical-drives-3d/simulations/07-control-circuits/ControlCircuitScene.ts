/**
 * 3D Industrial Motor Control Circuits & MCC Panel Scene Controller
 * Course Code: U25EE305 / ME3393 / EE8353
 */

import * as THREE from 'three';
import { BaseDrivesSimulation } from '../BaseDrivesSimulation';
import type { ControlCircuitState } from '../../core/types';

export class ControlCircuitScene extends BaseDrivesSimulation {
  private contactorPlunger: THREE.Mesh | null = null;
  private lampGreen: THREE.Mesh | null = null;
  private lampRed: THREE.Mesh | null = null;
  private lampAmber: THREE.Mesh | null = null;
  private wireTracks: THREE.Mesh[] = [];
  private currentState: ControlCircuitState = 'idle-stopped';

  public initScene(): void {
    const mccPanel = new THREE.Group();

    // 1. Backplane / Steel Mounting Plate
    const plateGeo = new THREE.BoxGeometry(3.6, 4.2, 0.1);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.3 }); // Galvanized steel backplate
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, 2.1, 0);
    mccPanel.add(plate);

    // DIN Rails (Horizontal top and bottom)
    const dinRailMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    [1.0, 2.2, 3.2].forEach((yPos) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 0.04), dinRailMat);
      rail.position.set(0, yPos, 0.07);
      mccPanel.add(rail);
    });

    // Wire Duct Channels (Grey slotted PVC cable ducts)
    const ductMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 });
    [-1.6, 1.6].forEach((xPos) => {
      const vDuct = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.8, 0.15), ductMat);
      vDuct.position.set(xPos, 2.1, 0.12);
      mccPanel.add(vDuct);
    });
    [0.4, 3.8].forEach((yPos) => {
      const hDuct = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.18, 0.15), ductMat);
      hDuct.position.set(0, yPos, 0.12);
      mccPanel.add(hDuct);
    });

    // 2. Main Miniature Circuit Breaker (MCB) on Top Rail
    const mcbGroup = new THREE.Group();
    mcbGroup.position.set(-0.9, 3.2, 0.15);
    const mcbBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.75, 0.35), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    mcbGroup.add(mcbBody);
    const mcbToggle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.12), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    mcbToggle.position.set(0, 0.05, 0.22);
    mcbGroup.add(mcbToggle);
    mccPanel.add(mcbGroup);

    // 3. Main AC Contactor (Middle Rail)
    const contactorGroup = new THREE.Group();
    contactorGroup.position.set(0, 2.2, 0.18);

    const cBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.5), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
    contactorGroup.add(cBody);

    // Armature Moving Plunger (Indicates energization)
    const plungerGeo = new THREE.BoxGeometry(0.35, 0.35, 0.12);
    const plungerMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 }); // Green active
    this.contactorPlunger = new THREE.Mesh(plungerGeo, plungerMat);
    this.contactorPlunger.position.set(0, 0, 0.28);
    contactorGroup.add(this.contactorPlunger);
    mccPanel.add(contactorGroup);

    // 4. Bimetallic Thermal Overload Relay (Directly plug-in mounted below contactor)
    const olrGroup = new THREE.Group();
    olrGroup.position.set(0, 1.35, 0.18);
    const olrBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 0.45), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 }));
    olrGroup.add(olrBody);

    // Blue Reset Pushbutton on OLR
    const resetBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0x2563eb }));
    resetBtn.rotation.x = Math.PI / 2;
    resetBtn.position.set(0.2, 0.15, 0.26);
    olrGroup.add(resetBtn);

    // Ampere dial setting knob
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    dial.rotation.x = Math.PI / 2;
    dial.position.set(-0.2, 0.15, 0.25);
    olrGroup.add(dial);
    mccPanel.add(olrGroup);

    // 5. Operator Pushbuttons & Pilot Lamps (Right Side of Panel)
    const opGroup = new THREE.Group();
    opGroup.position.set(1.0, 2.2, 0.15);

    // Green Start Pushbutton (Flush NO)
    const startBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24), new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.2 }));
    startBtn.rotation.x = Math.PI / 2;
    startBtn.position.set(0, 0.5, 0.1);
    opGroup.add(startBtn);

    // Red Stop Pushbutton (Extended NC)
    const stopBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 24), new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2 }));
    stopBtn.rotation.x = Math.PI / 2;
    stopBtn.position.set(0, 0.0, 0.1);
    opGroup.add(stopBtn);

    // Pilot Lamps (22mm LED Indicators)
    // Green (Run)
    const lampGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
    this.lampGreen = new THREE.Mesh(lampGeo, new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x000000, emissiveIntensity: 0 }));
    this.lampGreen.rotation.x = Math.PI / 2;
    this.lampGreen.position.set(0, -0.5, 0.1);
    opGroup.add(this.lampGreen);

    // Red (Stop)
    this.lampRed = new THREE.Mesh(lampGeo, new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.8 }));
    this.lampRed.rotation.x = Math.PI / 2;
    this.lampRed.position.set(0, -0.8, 0.1);
    opGroup.add(this.lampRed);

    // Amber (Overload Trip)
    this.lampAmber = new THREE.Mesh(lampGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x000000, emissiveIntensity: 0 }));
    this.lampAmber.rotation.x = Math.PI / 2;
    this.lampAmber.position.set(0, -1.1, 0.1);
    opGroup.add(this.lampAmber);

    mccPanel.add(opGroup);

    this.scene.add(mccPanel);
    this.resetCamera({ x: 0, y: 2.2, z: 4.8 }, { x: 0, y: 2.1, z: 0 });
  }

  public updateAnimation(delta: number, elapsed: number): void {
    // Pulse lamps slightly when energized for authentic control room look
    if (this.lampGreen && (this.lampGreen.material as THREE.MeshStandardMaterial).emissiveIntensity > 0) {
      (this.lampGreen.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.7 + 0.3 * Math.sin(elapsed * 4);
    }
  }

  public updateParameters(params: Record<string, any>): void {
    if (params.circuitState !== undefined) {
      this.currentState = params.circuitState as ControlCircuitState;
      this.updateStateVisuals();
    }
  }

  private updateStateVisuals(): void {
    const isRunning = this.currentState === 'running';
    const isTripped = this.currentState === 'tripped-overload';
    const isStopped = this.currentState === 'idle-stopped' || this.currentState === 'emergency-stopped';

    if (this.contactorPlunger) {
      this.contactorPlunger.position.z = isRunning ? 0.24 : 0.28; // Pulled in when running
    }

    if (this.lampGreen) {
      (this.lampGreen.material as THREE.MeshStandardMaterial).emissiveIntensity = isRunning ? 0.9 : 0.0;
    }
    if (this.lampRed) {
      (this.lampRed.material as THREE.MeshStandardMaterial).emissiveIntensity = isStopped ? 0.9 : 0.0;
    }
    if (this.lampAmber) {
      (this.lampAmber.material as THREE.MeshStandardMaterial).emissiveIntensity = isTripped ? 1.0 : 0.0;
    }
  }
}
