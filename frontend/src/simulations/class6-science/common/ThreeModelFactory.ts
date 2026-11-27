/**
 * ThreeModelFactory.ts
 * Reusable procedural 3D model generators for Grade 6 Science Simulations
 */
import * as THREE from 'three';

export class ThreeModelFactory {
  /**
   * Laboratory Glass Beaker with graduation markings and liquid fill
   */
  public static createBeaker(radius = 1.2, height = 2.6, liquidColor = 0x0284c7, liquidFraction = 0.5): THREE.Group {
    const group = new THREE.Group();

    // Outer glass wall
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.5,
    });
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 32, 1, true), glassMat);
    glass.position.y = height / 2;
    group.add(glass);

    // Glass base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.06, 32), glassMat);
    base.position.y = 0.03;
    group.add(base);

    // Beaker rim
    const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.04, 8, 32), glassMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = height;
    group.add(rim);

    // Liquid fill inside
    if (liquidFraction > 0.02) {
      const lHeight = height * liquidFraction;
      const liquidMat = new THREE.MeshStandardMaterial({
        color: liquidColor,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
      });
      const liquid = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.96, radius * 0.96, lHeight, 32),
        liquidMat
      );
      liquid.position.y = lHeight / 2 + 0.04;
      group.add(liquid);
    }

    return group;
  }

  /**
   * Conical Erlenmeyer Flask
   */
  public static createConicalFlask(liquidColor = 0x38bdf8, liquidFraction = 0.4): THREE.Group {
    const group = new THREE.Group();
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.08,
      transmission: 0.9,
    });

    // Conical body
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.6, 2.2, 32, 1, true), glassMat);
    cone.position.y = 1.1;
    group.add(cone);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.0, 32, 1, true), glassMat);
    neck.position.y = 2.7;
    group.add(neck);

    // Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.06, 32), glassMat);
    base.position.y = 0.03;
    group.add(base);

    if (liquidFraction > 0.05) {
      const lH = 1.8 * liquidFraction;
      const rTop = 1.6 - (1.1 * (lH / 2.2));
      const liquid = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, 1.55, lH, 32),
        new THREE.MeshStandardMaterial({ color: liquidColor, transparent: true, opacity: 0.82 })
      );
      liquid.position.y = lH / 2 + 0.04;
      group.add(liquid);
    }

    return group;
  }

  /**
   * Round-Bottom Boiling Flask
   */
  public static createRoundBottomFlask(radius = 1.2, neckHeight = 1.6, liquidColor = 0x0284c7): THREE.Group {
    const group = new THREE.Group();
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      transmission: 0.9,
      roughness: 0.08,
    });

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), glassMat);
    sphere.position.y = radius;
    group.add(sphere);

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.28, radius * 0.28, neckHeight, 24, 1, true),
      glassMat
    );
    neck.position.y = radius * 2 + neckHeight / 2 - 0.2;
    group.add(neck);

    // Liquid sphere pool
    const liquidMat = new THREE.MeshStandardMaterial({ color: liquidColor, transparent: true, opacity: 0.8 });
    const liquid = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.95, 24, 16), liquidMat);
    liquid.position.y = radius;
    liquid.scale.set(1, 0.65, 1);
    group.add(liquid);

    return group;
  }

  /**
   * Test Tube with Rim
   */
  public static createTestTube(radius = 0.25, height = 2.4, liquidColor = 0x10b981): THREE.Group {
    const group = new THREE.Group();
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      transmission: 0.9,
      roughness: 0.05,
    });

    const tube = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height - radius, 24, 1, true), glassMat);
    tube.position.y = (height - radius) / 2 + radius;
    group.add(tube);

    const bottom = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), glassMat);
    bottom.position.y = radius;
    group.add(bottom);

    // Liquid fill
    const lMat = new THREE.MeshStandardMaterial({ color: liquidColor, transparent: true, opacity: 0.85 });
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.92, radius * 0.92, (height * 0.6), 24), lMat);
    liquid.position.y = (height * 0.6) / 2 + radius * 0.5;
    group.add(liquid);

    return group;
  }

  /**
   * Laboratory Bunsen Burner with dual flame
   */
  public static createBunsenBurner(): { group: THREE.Group; flameMesh: THREE.Mesh; flameLight: THREE.PointLight } {
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 });

    // Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.2, 24), metalMat);
    group.add(base);

    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.6, 20), metalMat);
    barrel.position.y = 0.9;
    group.add(barrel);

    // Dual-cone flame
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const flameMesh = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.9, 16), flameMat);
    flameMesh.position.y = 2.05;
    flameMesh.visible = false;
    group.add(flameMesh);

    const flameLight = new THREE.PointLight(0xf59e0b, 0, 5);
    flameLight.position.y = 2.2;
    group.add(flameLight);

    return { group, flameMesh, flameLight };
  }

  /**
   * Bar Magnet with marked North (Red) & South (Blue) poles
   */
  public static createBarMagnet(length = 3.6, width = 0.8, height = 0.5): THREE.Group {
    const group = new THREE.Group();

    // North half (Red)
    const nMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4, roughness: 0.3 });
    const north = new THREE.Mesh(new THREE.BoxGeometry(length / 2, height, width), nMat);
    north.position.x = length / 4;
    group.add(north);

    // South half (Blue)
    const sMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4, roughness: 0.3 });
    const south = new THREE.Mesh(new THREE.BoxGeometry(length / 2, height, width), sMat);
    south.position.x = -length / 4;
    group.add(south);

    return group;
  }

  /**
   * Electrical Dry Cell (Battery)
   */
  public static createBattery(): THREE.Group {
    const group = new THREE.Group();
    // Body cylinder
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.8, 24), bodyMat);
    body.position.y = 0.9;
    group.add(body);

    // Positive terminal (+)
    const capMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.2, 16), capMat);
    cap.position.y = 1.9;
    group.add(cap);

    return group;
  }

  /**
   * Light Bulb with socket and glowing filament
   */
  public static createLightBulb(): { group: THREE.Group; bulbLight: THREE.PointLight; glowMesh: THREE.Mesh } {
    const group = new THREE.Group();

    // Metal screw base
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16), baseMat);
    base.position.y = 0.3;
    group.add(base);

    // Glass bulb
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      transmission: 0.9,
      roughness: 0.1,
    });
    const glass = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 20), glassMat);
    glass.position.y = 1.15;
    group.add(glass);

    // Filament glow sphere
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), glowMat);
    glowMesh.position.y = 1.15;
    glowMesh.visible = false;
    group.add(glowMesh);

    const bulbLight = new THREE.PointLight(0xfacc15, 0, 6);
    bulbLight.position.y = 1.15;
    group.add(bulbLight);

    return { group, bulbLight, glowMesh };
  }

  /**
   * Pine Tree for Natural Habitats
   */
  public static createPineTree(scale = 1.0): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.25 * scale, 1.8 * scale, 12), trunkMat);
    trunk.position.y = 0.9 * scale;
    group.add(trunk);

    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
    const tiers = [
      { r: 1.2 * scale, h: 1.5 * scale, y: 1.6 * scale },
      { r: 0.95 * scale, h: 1.3 * scale, y: 2.4 * scale },
      { r: 0.65 * scale, h: 1.1 * scale, y: 3.1 * scale },
    ];
    tiers.forEach((t) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(t.r, t.h, 10), leavesMat);
      cone.position.y = t.y;
      group.add(cone);
    });

    return group;
  }

  /**
   * Natural Boulder / Stone
   */
  public static createStone(scale = 1.0): THREE.Mesh {
    const geo = new THREE.DodecahedronGeometry(scale, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, flatShading: true });
    const stone = new THREE.Mesh(geo, mat);
    stone.position.y = scale * 0.7;
    return stone;
  }
}
