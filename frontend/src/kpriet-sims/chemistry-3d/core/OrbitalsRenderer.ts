/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * OrbitalsRenderer System
 *
 * Mathematically generates 3D surfaces for:
 * - Atomic orbitals: s, px, py, pz, d(z²), d(x²-y²), d(xy), d(yz), d(xz)
 * - Hybrid orbitals: sp (linear 180°), sp² (trigonal planar 120°), sp³ (tetrahedral 109.5°)
 * - Molecular bonding/antibonding orbitals: σ, σ*, π, π*
 *
 * Uses clear phase convention:
 * - Positive phase (+ψ): Cyan / Sky Blue (#06b6d4)
 * - Negative phase (-ψ): Amber / Orange (#f59e0b)
 */

import * as THREE from 'three';

export interface OrbitalMeshOptions {
  scale?: number;
  opacity?: number;
  wireframe?: boolean;
  positiveColor?: number;
  negativeColor?: number;
}

export class OrbitalsRenderer {
  private static POSITIVE_PHASE_COLOR = 0x06b6d4; // Cyan/Teal
  private static NEGATIVE_PHASE_COLOR = 0xf59e0b; // Amber/Orange

  /**
   * Generates an asymmetric teardrop-shaped orbital lobe with spherical harmonics profile
   */
  public static createTeardropLobe(
    length = 1.2,
    radius = 0.5,
    isPositive = true,
    options: OrbitalMeshOptions = {}
  ): THREE.Mesh {
    const color = isPositive
      ? (options.positiveColor || this.POSITIVE_PHASE_COLOR)
      : (options.negativeColor || this.NEGATIVE_PHASE_COLOR);

    // Lathe profile: r(z) = radius * sin(π * z / length) * sqrt(z / length)
    const points: THREE.Vector2[] = [];
    const segments = 24;
    for (let i = 0; i <= segments; i++) {
      const u = i / segments; // 0 to 1
      const z = u * length;
      const r = radius * Math.sin(Math.PI * u) * Math.sqrt(u + 0.05);
      points.push(new THREE.Vector2(Math.max(0.001, r), z));
    }

    const geo = new THREE.LatheGeometry(points, 28);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.15,
      transparent: true,
      opacity: options.opacity || 0.78,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  }

  /**
   * Spherical s orbital (all single phase)
   */
  public static createSOrbital(radius = 1.1, options: OrbitalMeshOptions = {}): THREE.Group {
    const group = new THREE.Group();
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: options.positiveColor || this.POSITIVE_PHASE_COLOR,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: options.opacity || 0.75,
      side: THREE.DoubleSide,
    });
    group.add(new THREE.Mesh(geo, mat));
    return group;
  }

  /**
   * Dumbbell p orbital (px, py, or pz) with + and - phase lobes
   */
  public static createPOrbital(axis: 'x' | 'y' | 'z' = 'z', length = 1.3, options: OrbitalMeshOptions = {}): THREE.Group {
    const group = new THREE.Group();

    // Positive lobe (+ψ)
    const posLobe = this.createTeardropLobe(length, 0.55, true, options);
    // Negative lobe (-ψ)
    const negLobe = this.createTeardropLobe(length, 0.55, false, options);
    negLobe.rotation.x = Math.PI; // point in opposite direction

    const pGroup = new THREE.Group();
    pGroup.add(posLobe);
    pGroup.add(negLobe);

    if (axis === 'x') {
      pGroup.rotation.z = -Math.PI / 2;
    } else if (axis === 'y') {
      pGroup.rotation.x = Math.PI / 2;
    }

    group.add(pGroup);
    return group;
  }

  /**
   * d-Orbitals: dz², dx²-y², dxy, dyz, dxz
   */
  public static createDOrbital(type: 'z2' | 'x2-y2' | 'xy' | 'yz' | 'xz' = 'z2', options: OrbitalMeshOptions = {}): THREE.Group {
    const group = new THREE.Group();

    if (type === 'z2') {
      // Two main lobes along z-axis (+ψ)
      const topLobe = this.createTeardropLobe(1.35, 0.52, true, options);
      const bottomLobe = this.createTeardropLobe(1.35, 0.52, true, options);
      bottomLobe.rotation.x = Math.PI;
      group.add(topLobe, bottomLobe);

      // Torus ring in xy-plane (-ψ)
      const ringGeo = new THREE.TorusGeometry(0.72, 0.22, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: options.negativeColor || this.NEGATIVE_PHASE_COLOR,
        roughness: 0.35,
        transparent: true,
        opacity: options.opacity || 0.78,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      group.add(ringMesh);
    } else {
      // 4-leaf cloverleaf
      const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      const phases = [true, false, true, false]; // alternating phases

      angles.forEach((ang, idx) => {
        const lobe = this.createTeardropLobe(1.2, 0.48, phases[idx], options);
        lobe.rotation.z = -Math.PI / 2; // point along x
        const pivot = new THREE.Group();
        pivot.add(lobe);
        pivot.rotation.z = ang;

        if (type === 'xy') {
          pivot.rotation.z += Math.PI / 4;
        } else if (type === 'yz') {
          pivot.rotation.y = Math.PI / 2;
          pivot.rotation.x = ang + Math.PI / 4;
        } else if (type === 'xz') {
          pivot.rotation.x = Math.PI / 2;
          pivot.rotation.z = ang + Math.PI / 4;
        }

        group.add(pivot);
      });
    }

    return group;
  }

  /**
   * Hybrid Orbitals (sp, sp², sp³)
   */
  public static createHybridOrbitals(type: 'sp' | 'sp2' | 'sp3', options: OrbitalMeshOptions = {}): THREE.Group {
    const group = new THREE.Group();

    // Asymmetric hybrid lobe: large positive lobe, small negative back-lobe
    const createHybridLobe = () => {
      const lobeGroup = new THREE.Group();
      const majorLobe = this.createTeardropLobe(1.45, 0.62, true, options);
      const minorLobe = this.createTeardropLobe(0.38, 0.24, false, options);
      minorLobe.rotation.x = Math.PI;
      lobeGroup.add(majorLobe, minorLobe);
      return lobeGroup;
    };

    if (type === 'sp') {
      // 2 linear lobes at 180°
      const lobe1 = createHybridLobe();
      const lobe2 = createHybridLobe();
      lobe2.rotation.y = Math.PI;
      group.add(lobe1, lobe2);
    } else if (type === 'sp2') {
      // 3 trigonal planar lobes at 120°
      for (let i = 0; i < 3; i++) {
        const lobe = createHybridLobe();
        lobe.rotation.z = -Math.PI / 2;
        const pivot = new THREE.Group();
        pivot.add(lobe);
        pivot.rotation.z = (i * 2 * Math.PI) / 3;
        group.add(pivot);
      }
    } else if (type === 'sp3') {
      // 4 tetrahedral lobes at 109.47°
      const dirs = [
        new THREE.Vector3(1, 1, 1).normalize(),
        new THREE.Vector3(-1, -1, 1).normalize(),
        new THREE.Vector3(-1, 1, -1).normalize(),
        new THREE.Vector3(1, -1, -1).normalize(),
      ];

      dirs.forEach((dir) => {
        const lobe = createHybridLobe();
        const rotAxis = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
        const rotAngle = Math.acos(new THREE.Vector3(0, 1, 0).dot(dir));
        if (rotAxis.lengthSq() > 0.001) {
          lobe.setRotationFromAxisAngle(rotAxis, rotAngle);
        }
        group.add(lobe);
      });
    }

    return group;
  }

  /**
   * Molecular Bonding and Antibonding Orbitals (σ, σ*, π, π*)
   */
  public static createMolecularOrbital(type: 'sigma' | 'sigma_star' | 'pi' | 'pi_star', options: OrbitalMeshOptions = {}): THREE.Group {
    const group = new THREE.Group();

    if (type === 'sigma') {
      // Cylindrically symmetric constructive overlap ellipsoid
      const geo = new THREE.SphereGeometry(1.0, 32, 32);
      geo.scale(1.8, 0.85, 0.85); // elongated along x-axis
      const mat = new THREE.MeshStandardMaterial({
        color: options.positiveColor || this.POSITIVE_PHASE_COLOR,
        roughness: 0.35,
        transparent: true,
        opacity: options.opacity || 0.78,
      });
      group.add(new THREE.Mesh(geo, mat));
    } else if (type === 'sigma_star') {
      // Two outward-pointing lobes with opposite phases and nodal plane at center
      const leftLobe = this.createTeardropLobe(1.1, 0.65, true, options);
      leftLobe.rotation.z = Math.PI / 2;
      leftLobe.position.x = -0.35;

      const rightLobe = this.createTeardropLobe(1.1, 0.65, false, options);
      rightLobe.rotation.z = -Math.PI / 2;
      rightLobe.position.x = 0.35;

      group.add(leftLobe, rightLobe);
    } else if (type === 'pi') {
      // Two lobes above and below internuclear axis (+ψ on top, -ψ on bottom)
      const topCloud = new THREE.SphereGeometry(0.7, 24, 24);
      topCloud.scale(1.4, 0.55, 0.7);
      const topMat = new THREE.MeshStandardMaterial({
        color: options.positiveColor || this.POSITIVE_PHASE_COLOR,
        transparent: true,
        opacity: options.opacity || 0.75,
      });
      const topMesh = new THREE.Mesh(topCloud, topMat);
      topMesh.position.y = 0.65;

      const bottomCloud = new THREE.SphereGeometry(0.7, 24, 24);
      bottomCloud.scale(1.4, 0.55, 0.7);
      const bottomMat = new THREE.MeshStandardMaterial({
        color: options.negativeColor || this.NEGATIVE_PHASE_COLOR,
        transparent: true,
        opacity: options.opacity || 0.75,
      });
      const bottomMesh = new THREE.Mesh(bottomCloud, bottomMat);
      bottomMesh.position.y = -0.65;

      group.add(topMesh, bottomMesh);
    } else if (type === 'pi_star') {
      // Four lobes with two nodal planes
      const lobeGeo = new THREE.SphereGeometry(0.48, 20, 20);
      const posMat = new THREE.MeshStandardMaterial({ color: options.positiveColor || this.POSITIVE_PHASE_COLOR, transparent: true, opacity: 0.75 });
      const negMat = new THREE.MeshStandardMaterial({ color: options.negativeColor || this.NEGATIVE_PHASE_COLOR, transparent: true, opacity: 0.75 });

      const topL = new THREE.Mesh(lobeGeo, posMat);
      topL.position.set(-0.65, 0.65, 0);
      const topR = new THREE.Mesh(lobeGeo, negMat);
      topR.position.set(0.65, 0.65, 0);

      const botL = new THREE.Mesh(lobeGeo, negMat);
      botL.position.set(-0.65, -0.65, 0);
      const botR = new THREE.Mesh(lobeGeo, posMat);
      botR.position.set(0.65, -0.65, 0);

      group.add(topL, topR, botL, botR);
    }

    return group;
  }
}
