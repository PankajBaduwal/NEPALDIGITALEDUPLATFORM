/**
 * Module 3 — Iron-Carbon (Fe-Fe3C) Metastable Equilibrium Phase Diagram
 * 3D/2D Interactive Coordinate Space, Invariant Reactions & Lever Rule Tie-Lines
 */

import * as THREE from 'three';
import { BaseMetallurgySimulation } from '../BaseMetallurgySimulation';
import { MetallurgyCalculator } from '../../core/MetallurgyCalculator';

export class IronCarbonDiagramScene extends BaseMetallurgySimulation {
  private carbonPercent: number = 0.45; // default AISI 1045
  private temperatureC: number = 850;

  private diagramGroup: THREE.Group = new THREE.Group();
  private cursorMarker: THREE.Mesh | null = null;
  private tieLineMesh: THREE.Line | null = null;
  private invariantMarkers: THREE.Group = new THREE.Group();

  protected initScene(): void {
    this.camera.position.set(0, 0, 7.5);
    this.controls.target.set(0, 0, 0);
    this.controls.enableRotate = false; // 2D diagram workspace view by default (can be enabled if desired)
    this.controls.update();

    this.scene.add(this.diagramGroup);
    this.diagramGroup.add(this.invariantMarkers);

    this.drawPhaseDiagram();
    this.createCursorMarker();
    this.updateCursorPosition();
  }

  // Coordinate mapping:
  // C: 0% -> x = -3.2, 6.67% -> x = 3.2 (width 6.4)
  // T: 400°C -> y = -2.2, 1600°C -> y = 2.2 (height 4.4)
  private mapCoords(c: number, t: number): { x: number; y: number } {
    const x = -3.2 + (c / 6.67) * 6.4;
    const y = -2.2 + ((t - 400) / 1200) * 4.4;
    return { x, y };
  }

  private drawPhaseDiagram(): void {
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const dashedMat = new THREE.LineDashedMaterial({ color: 0xf59e0b, dashSize: 0.1, gapSize: 0.05 });
    const axisMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 });

    // 1. Outer Box & Axes
    const borderPoints = [
      this.mapCoords(0, 400),
      this.mapCoords(6.67, 400),
      this.mapCoords(6.67, 1600),
      this.mapCoords(0, 1600),
      this.mapCoords(0, 400),
    ];
    const borderGeo = new THREE.BufferGeometry().setFromPoints(
      borderPoints.map((p) => new THREE.Vector3(p.x, p.y, 0))
    );
    this.diagramGroup.add(new THREE.Line(borderGeo, axisMat));

    // 2. Eutectoid Line (A1 = 727°C, from 0.022% to 6.67%)
    const a1Points = [this.mapCoords(0.022, 727), this.mapCoords(6.67, 727)];
    const a1Geo = new THREE.BufferGeometry().setFromPoints(
      a1Points.map((p) => new THREE.Vector3(p.x, p.y, 0.01))
    );
    this.diagramGroup.add(new THREE.Line(a1Geo, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 })));

    // 3. Eutectic Line (1147°C, from 2.11% to 6.67%)
    const eutPoints = [this.mapCoords(2.11, 1147), this.mapCoords(6.67, 1147)];
    const eutGeo = new THREE.BufferGeometry().setFromPoints(
      eutPoints.map((p) => new THREE.Vector3(p.x, p.y, 0.01))
    );
    this.diagramGroup.add(new THREE.Line(eutGeo, new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 })));

    // 4. Liquidus Line: (0, 1538) -> (4.3, 1147) -> (6.67, 1400)
    const liqPoints = [
      this.mapCoords(0, 1538),
      this.mapCoords(0.53, 1495),
      this.mapCoords(4.3, 1147),
      this.mapCoords(6.67, 1400),
    ];
    const liqGeo = new THREE.BufferGeometry().setFromPoints(
      liqPoints.map((p) => new THREE.Vector3(p.x, p.y, 0.01))
    );
    this.diagramGroup.add(new THREE.Line(liqGeo, lineMat));

    // 5. Solidus Line: (0, 1538) -> (0.09, 1495) -> (2.11, 1147)
    const solPoints = [
      this.mapCoords(0, 1538),
      this.mapCoords(0.09, 1495),
      this.mapCoords(0.16, 1495),
      this.mapCoords(2.11, 1147),
    ];
    const solGeo = new THREE.BufferGeometry().setFromPoints(
      solPoints.map((p) => new THREE.Vector3(p.x, p.y, 0.01))
    );
    this.diagramGroup.add(new THREE.Line(solGeo, lineMat));

    // 6. A3 line: (0, 912) -> (0.76, 727)
    const a3Points = [this.mapCoords(0, 912), this.mapCoords(0.76, 727)];
    const a3Geo = new THREE.BufferGeometry().setFromPoints(
      a3Points.map((p) => new THREE.Vector3(p.x, p.y, 0.01))
    );
    this.diagramGroup.add(new THREE.Line(a3Geo, lineMat));

    // 7. Acm line: (0.76, 727) -> (2.11, 1147)
    const acmPoints = [this.mapCoords(0.76, 727), this.mapCoords(2.11, 1147)];
    const acmGeo = new THREE.BufferGeometry().setFromPoints(
      acmPoints.map((p) => new THREE.Vector3(p.x, p.y, 0.01))
    );
    this.diagramGroup.add(new THREE.Line(acmGeo, lineMat));

    // 8. Invariant Invariant Reaction Markers (Pearlite & Ledeburite)
    const eutectoidPt = this.mapCoords(0.76, 727);
    const eutectoidMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    eutectoidMarker.position.set(eutectoidPt.x, eutectoidPt.y, 0.05);
    this.invariantMarkers.add(eutectoidMarker);

    const eutecticPt = this.mapCoords(4.3, 1147);
    const eutecticMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    eutecticMarker.position.set(eutecticPt.x, eutecticPt.y, 0.05);
    this.invariantMarkers.add(eutecticMarker);
  }

  private createCursorMarker(): void {
    const geo = new THREE.SphereGeometry(0.1, 24, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Glowing emerald cursor
      emissive: 0x059669,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    this.cursorMarker = new THREE.Mesh(geo, mat);
    this.scene.add(this.cursorMarker);
  }

  private updateCursorPosition(): void {
    const pt = this.mapCoords(this.carbonPercent, this.temperatureC);
    if (this.cursorMarker) {
      this.cursorMarker.position.set(pt.x, pt.y, 0.1);
    }

    // Update Lever Rule Tie-Line in two-phase region
    if (this.tieLineMesh) {
      this.scene.remove(this.tieLineMesh);
      this.tieLineMesh.geometry.dispose();
      this.tieLineMesh = null;
    }

    const info = MetallurgyCalculator.evaluateIronCarbonPoint(this.carbonPercent, this.temperatureC);
    if (info.leverRuleApplicable) {
      let cLeft = 0.022;
      let cRight = 6.67;

      if (this.temperatureC <= 727) {
        cLeft = 0.022;
        cRight = 6.67;
      } else if (this.temperatureC > 727 && this.temperatureC < 912 && this.carbonPercent < 0.76) {
        cLeft = 0.022;
        cRight = 0.76 * ((912 - this.temperatureC) / (912 - 727));
      } else if (this.temperatureC > 727 && this.temperatureC < 1147 && this.carbonPercent > 0.76 && this.carbonPercent <= 2.11) {
        cLeft = 0.76 + ((2.11 - 0.76) * (this.temperatureC - 727)) / (1147 - 727);
        cRight = 6.67;
      }

      const pLeft = this.mapCoords(cLeft, this.temperatureC);
      const pRight = this.mapCoords(cRight, this.temperatureC);

      const tieGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pLeft.x, pLeft.y, 0.08),
        new THREE.Vector3(pRight.x, pRight.y, 0.08),
      ]);
      const tieMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 });
      this.tieLineMesh = new THREE.Line(tieGeo, tieMat);
      this.scene.add(this.tieLineMesh);
    }
  }

  public updateAnimation(_delta: number, _elapsed: number): void {}

  public updateParameters(params: {
    carbonPercent?: number;
    temperatureC?: number;
  }): void {
    if (params.carbonPercent !== undefined) {
      this.carbonPercent = params.carbonPercent;
    }
    if (params.temperatureC !== undefined) {
      this.temperatureC = params.temperatureC;
    }
    this.updateCursorPosition();
  }
}
