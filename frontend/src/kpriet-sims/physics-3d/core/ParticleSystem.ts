/**
 * KPRIET Engineering Physics Virtual Laboratory (U25RPH01)
 * High-Performance Instanced Particle System for Physical Phenomena
 */

import * as THREE from 'three';

export interface ParticleStreamOptions {
  count: number;
  color: number;
  size: number;
  speed: number;
  opacity?: number;
  blending?: THREE.Blending;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private sphereGeometry: THREE.SphereGeometry;
  private sharedMaterials: Map<string, THREE.Material> = new Map();
  private streams: Map<
    string,
    {
      instancedMesh: THREE.InstancedMesh;
      count: number;
      speed: number;
      positions: Float32Array;
      velocities: Float32Array;
      bounds: { min: THREE.Vector3; max: THREE.Vector3 };
      dummy: THREE.Object3D;
    }
  > = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.sphereGeometry = new THREE.SphereGeometry(1, 8, 8);
  }

  public createStream(
    id: string,
    options: ParticleStreamOptions,
    bounds: { min: THREE.Vector3; max: THREE.Vector3 }
  ) {
    if (this.streams.has(id)) {
      this.removeStream(id);
    }

    const matKey = `${options.color}_${options.opacity ?? 1}_${options.blending ?? THREE.NormalBlending}`;
    let material = this.sharedMaterials.get(matKey);
    if (!material) {
      material = new THREE.MeshBasicMaterial({
        color: options.color,
        transparent: (options.opacity ?? 1) < 1,
        opacity: options.opacity ?? 1,
        blending: options.blending ?? THREE.NormalBlending,
      });
      this.sharedMaterials.set(matKey, material);
    }

    const instancedMesh = new THREE.InstancedMesh(this.sphereGeometry, material, options.count);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const positions = new Float32Array(options.count * 3);
    const velocities = new Float32Array(options.count * 3);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < options.count; i++) {
      const idx = i * 3;
      positions[idx] = THREE.MathUtils.lerp(bounds.min.x, bounds.max.x, Math.random());
      positions[idx + 1] = THREE.MathUtils.lerp(bounds.min.y, bounds.max.y, Math.random());
      positions[idx + 2] = THREE.MathUtils.lerp(bounds.min.z, bounds.max.z, Math.random());

      velocities[idx] = (Math.random() - 0.5) * 0.2;
      velocities[idx + 1] = options.speed * (0.8 + Math.random() * 0.4);
      velocities[idx + 2] = (Math.random() - 0.5) * 0.2;

      dummy.position.set(positions[idx] ?? 0, positions[idx + 1] ?? 0, positions[idx + 2] ?? 0);
      dummy.scale.setScalar(options.size);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(instancedMesh);

    this.streams.set(id, {
      instancedMesh,
      count: options.count,
      speed: options.speed,
      positions,
      velocities,
      bounds,
      dummy,
    });
  }

  public update(delta: number) {
    this.streams.forEach((stream) => {
      const { instancedMesh, count, positions, velocities, bounds, dummy } = stream;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        positions[idx] = (positions[idx] ?? 0) + (velocities[idx] ?? 0) * delta;
        positions[idx + 1] = (positions[idx + 1] ?? 0) + (velocities[idx + 1] ?? 0) * delta;
        positions[idx + 2] = (positions[idx + 2] ?? 0) + (velocities[idx + 2] ?? 0) * delta;

        // Wrap around bounds
        if ((positions[idx + 1] ?? 0) > bounds.max.y) {
          positions[idx + 1] = bounds.min.y;
          positions[idx] = THREE.MathUtils.lerp(bounds.min.x, bounds.max.x, Math.random());
          positions[idx + 2] = THREE.MathUtils.lerp(bounds.min.z, bounds.max.z, Math.random());
        }

        dummy.position.set(positions[idx] ?? 0, positions[idx + 1] ?? 0, positions[idx + 2] ?? 0);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
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

  public dispose() {
    this.streams.forEach((stream) => {
      this.scene.remove(stream.instancedMesh);
      stream.instancedMesh.dispose();
    });
    this.streams.clear();
    this.sphereGeometry.dispose();
    this.sharedMaterials.forEach((mat) => mat.dispose());
    this.sharedMaterials.clear();
  }
}
