/**
 * High-Performance Multi-Stream Particle System for Electrochemical Transport
 * Uses THREE.InstancedMesh for smooth 60fps rendering of ions, electrons, and gas molecules.
 */

import * as THREE from 'three';

export interface ParticlePathConfig {
  id: string;
  type: 'lithium_ion' | 'proton' | 'electron' | 'hydrogen' | 'oxygen' | 'water' | 'sulfate';
  count: number;
  curve: THREE.Curve<THREE.Vector3>;
  speed: number;
  size: number;
  color: number;
  reverse?: boolean;
  spread?: number; // Radial offset jitter from centerline
}

interface ActiveStream {
  config: ParticlePathConfig;
  instancedMesh: THREE.InstancedMesh;
  progress: Float32Array; // 0 to 1 for each particle
  offsets: Float32Array;  // static random radial offsets (x, y)
  visible: boolean;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private streams: Map<string, ActiveStream> = new Map();
  private sphereGeometry: THREE.SphereGeometry;
  private sharedMaterials: Map<string, THREE.MeshStandardMaterial> = new Map();
  private dummy = new THREE.Object3D();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    // Shared sphere geometry with optimized polygon count
    this.sphereGeometry = new THREE.SphereGeometry(1, 12, 12);
  }

  private getMaterial(color: number, emissiveIntensity: number = 0.6): THREE.MeshStandardMaterial {
    const key = `${color}_${emissiveIntensity}`;
    if (!this.sharedMaterials.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: emissiveIntensity,
        roughness: 0.2,
        metalness: 0.5,
      });
      this.sharedMaterials.set(key, mat);
    }
    return this.sharedMaterials.get(key)!;
  }

  public addStream(config: ParticlePathConfig) {
    if (this.streams.has(config.id)) {
      this.removeStream(config.id);
    }

    const mat = this.getMaterial(config.color, config.type === 'electron' ? 0.9 : 0.5);
    const instancedMesh = new THREE.InstancedMesh(this.sphereGeometry, mat, config.count);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    instancedMesh.castShadow = false;
    instancedMesh.receiveShadow = false;

    const progress = new Float32Array(config.count);
    const offsets = new Float32Array(config.count * 2);

    for (let i = 0; i < config.count; i++) {
      // Distribute evenly along curve initially
      progress[i] = i / config.count;
      const angle = Math.random() * Math.PI * 2;
      const r = (Math.random() * (config.spread || 0.05));
      offsets[i * 2] = Math.cos(angle) * r;
      offsets[i * 2 + 1] = Math.sin(angle) * r;
    }

    this.scene.add(instancedMesh);
    this.streams.set(config.id, {
      config,
      instancedMesh,
      progress,
      offsets,
      visible: true,
    });
  }

  public removeStream(id: string) {
    const stream = this.streams.get(id);
    if (stream) {
      this.scene.remove(stream.instancedMesh);
      stream.instancedMesh.dispose();
      this.streams.delete(id);
    }
  }

  public setStreamDirection(id: string, reverse: boolean) {
    const stream = this.streams.get(id);
    if (stream) {
      stream.config.reverse = reverse;
    }
  }

  public setStreamVisible(id: string, visible: boolean) {
    const stream = this.streams.get(id);
    if (stream) {
      stream.visible = visible;
      stream.instancedMesh.visible = visible;
    }
  }

  public setAllVisible(visible: boolean) {
    this.streams.forEach((stream) => {
      stream.visible = visible;
      stream.instancedMesh.visible = visible;
    });
  }

  public update(deltaTime: number, globalSpeedMultiplier: number = 1.0) {
    if (deltaTime <= 0) return;

    this.streams.forEach((stream) => {
      if (!stream.visible) return;

      const cfg = stream.config;
      const mesh = stream.instancedMesh;
      const count = cfg.count;
      const step = (cfg.speed * globalSpeedMultiplier * deltaTime);
      const isReverse = Boolean(cfg.reverse);

      for (let i = 0; i < count; i++) {
        let p = stream.progress[i] ?? 0;
        if (isReverse) {
          p -= step;
          if (p < 0) p += 1.0;
        } else {
          p += step;
          if (p > 1.0) p -= 1.0;
        }
        stream.progress[i] = p;

        // Get 3D point and tangent on path
        const point = cfg.curve.getPointAt(Math.max(0, Math.min(1, p)));
        const tangent = cfg.curve.getTangentAt(Math.max(0, Math.min(1, p))).normalize();

        // Compute local perpendicular basis for radial jitter
        const up = new THREE.Vector3(0, 1, 0);
        if (Math.abs(tangent.dot(up)) > 0.9) up.set(1, 0, 0);
        const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
        const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

        const ox = stream.offsets[i * 2] ?? 0;
        const oy = stream.offsets[i * 2 + 1] ?? 0;

        point.addScaledVector(normal, ox);
        point.addScaledVector(binormal, oy);

        this.dummy.position.copy(point);
        const s = cfg.size;
        this.dummy.scale.set(s, s, s);

        // Orient along tangent
        this.dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        this.dummy.updateMatrix();

        mesh.setMatrixAt(i, this.dummy.matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
    });
  }

  public clear() {
    this.streams.forEach((stream) => {
      this.scene.remove(stream.instancedMesh);
      stream.instancedMesh.dispose();
    });
    this.streams.clear();
  }

  public dispose() {
    this.clear();
    this.sphereGeometry.dispose();
    this.sharedMaterials.forEach((mat) => mat.dispose());
    this.sharedMaterials.clear();
  }
}
