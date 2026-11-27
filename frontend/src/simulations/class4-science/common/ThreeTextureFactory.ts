/**
 * ThreeTextureFactory.ts
 * Generates high-quality procedural textures using HTML5 Canvas.
 * 100% offline, zero external network dependencies, instant rendering.
 */
import * as THREE from 'three';

export class ThreeTextureFactory {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Procedural Earth texture with continents, oceans, and Nepal highlight
   */
  static createEarthTexture(): THREE.CanvasTexture {
    const key = 'earth_map';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Deep Ocean Base with realistic color gradients
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#0c2340'); // Arctic
    oceanGrad.addColorStop(0.2, '#0f3854');
    oceanGrad.addColorStop(0.5, '#0a4261'); // Equator
    oceanGrad.addColorStop(0.8, '#0f3854');
    oceanGrad.addColorStop(1, '#0c2340'); // Antarctic
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Subtle ocean currents & bathymetry waves
    ctx.fillStyle = 'rgba(20, 80, 120, 0.15)';
    for (let y = 50; y < 980; y += 40) {
      ctx.beginPath();
      ctx.arc(1024, y, 900, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Continents drawing (Geographically proportioned stylized masses)
    ctx.fillStyle = '#2d6a4f'; // Lush green continent base
    ctx.strokeStyle = '#52b788';
    ctx.lineWidth = 4;

    // Helper for continent shapes
    const drawLand = (path: [number, number][], color = '#2d6a4f') => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // Eurasia (Europe + Asia)
    drawLand([
      [900, 250], [1050, 200], [1300, 180], [1500, 220], [1750, 280],
      [1700, 420], [1600, 500], [1450, 550], [1350, 520], [1280, 420],
      [1200, 460], [1100, 480], [1020, 420], [920, 380], [860, 320]
    ], '#386641');

    // Indian Subcontinent (With Nepal highlighted at the Himalayas)
    drawLand([
      [1300, 400], [1360, 430], [1340, 540], [1280, 520], [1260, 440]
    ], '#40916c');

    // Nepal Special Highlight (Golden Himalayas)
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.ellipse(1325, 415, 24, 10, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4a373';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Africa
    drawLand([
      [950, 400], [1120, 410], [1180, 500], [1140, 680], [1060, 780],
      [980, 680], [900, 520], [920, 430]
    ], '#606c38');

    // North America
    drawLand([
      [250, 180], [450, 160], [600, 220], [550, 380], [480, 460],
      [420, 500], [380, 450], [280, 380], [200, 280]
    ], '#2d6a4f');

    // South America
    drawLand([
      [440, 520], [520, 540], [580, 620], [520, 800], [450, 850],
      [420, 720], [410, 580]
    ], '#1b4332');

    // Australia
    drawLand([
      [1550, 620], [1700, 640], [1720, 760], [1620, 800], [1520, 740]
    ], '#b08968');

    // Antarctica
    drawLand([
      [100, 920], [500, 900], [1000, 880], [1500, 900], [1950, 920],
      [2048, 1024], [0, 1024]
    ], '#e0f2fe');

    // Subtle cloud wisps
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    for (let i = 0; i < 40; i++) {
      const cx = (i * 123) % 2048;
      const cy = 200 + ((i * 77) % 600);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 80 + (i % 50), 18 + (i % 12), 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Wood Grain texture
   */
  static createWoodTexture(color = '#b45309'): THREE.CanvasTexture {
    const key = `wood_${color}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < 512; y += 4) {
      const offset = Math.sin(y * 0.05) * 8;
      ctx.fillRect(0, y + offset, 512, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Leaf Vein texture
   */
  static createLeafTexture(): THREE.CanvasTexture {
    const key = 'leaf_veins';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Green leaf background
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 0, 512, 512);

    // Central main vein
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();

    // Side branching veins
    ctx.lineWidth = 4;
    for (let y = 40; y < 480; y += 30) {
      // Left branch
      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(160, y - 20, 60, y - 50);
      ctx.stroke();
      // Right branch
      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(350, y - 20, 450, y - 50);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Water Surface Caustics
   */
  static createWaterTexture(): THREE.CanvasTexture {
    const key = 'water_surface';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.6, '#0284c7');
    grad.addColorStop(1, '#0369a1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 40; i++) {
      const x = (i * 67) % 512;
      const y = (i * 131) % 512;
      ctx.beginPath();
      ctx.ellipse(x, y, 40, 20, (i * 0.3), 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Circuit Board texture for ICT & Electronics
   */
  static createCircuitBoardTexture(): THREE.CanvasTexture {
    const key = 'circuit_board';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark emerald PCB substrate
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, 512, 512);

    // Copper traces
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;

    for (let i = 0; i < 15; i++) {
      const y = 30 + i * 32;
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(150, y);
      ctx.lineTo(200, y + 20);
      ctx.lineTo(380, y + 20);
      ctx.lineTo(420, y - 10);
      ctx.lineTo(490, y - 10);
      ctx.stroke();

      // Solder pads (gold contacts)
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(20, y, 5, 0, Math.PI * 2);
      ctx.arc(490, y - 10, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Solar / Sun Texture with corona
   */
  static createSunTexture(): THREE.CanvasTexture {
    const key = 'sun_corona';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#fef08a');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(0.8, '#d97706');
    grad.addColorStop(1, 'rgba(180, 83, 9, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural High-Detail Stratified Soil Cross-Section Texture
   */
  static createSoilTexture(): THREE.CanvasTexture {
    const key = 'soil_cross_section_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Base Soil Gradient (Humus rich top down to subsoil and rocky gravel)
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0, '#2d1810'); // Dark organic humus top
    grad.addColorStop(0.2, '#3d2314');
    grad.addColorStop(0.5, '#4a2c11'); // Fertile brown loam
    grad.addColorStop(0.8, '#5c3d1e');
    grad.addColorStop(1, '#3e2714'); // Subsoil with minerals
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. High-density organic soil particles and loam granules
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const size = Math.random() * 2.5 + 0.5;
      const darkness = Math.random();
      ctx.fillStyle = darkness > 0.6 ? 'rgba(20, 10, 5, 0.45)' : 'rgba(110, 75, 45, 0.35)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Subterranean Pebbles and Mineral Inclusions
    for (let p = 0; p < 80; p++) {
      const px = Math.random() * 1024;
      const py = 150 + Math.random() * 850; // More pebbles deeper down
      const pr = 4 + Math.random() * 9;
      ctx.fillStyle = (p % 3 === 0) ? '#64748b' : (p % 3 === 1) ? '#78716c' : '#475569';
      ctx.beginPath();
      ctx.ellipse(px, py, pr, pr * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 4. Moisture Glisten Specks
    for (let m = 0; m < 500; m++) {
      const mx = Math.random() * 1024;
      const my = Math.random() * 1024;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(mx, my, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Realistic Bean Seed Texture (Kidney bean with hilum & testa gloss)
   */
  static createSeedTexture(): THREE.CanvasTexture {
    const key = 'bean_seed_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // 1. Rich Red-Mahogany Seed Coat
    const grad = ctx.createRadialGradient(220, 200, 30, 256, 256, 260);
    grad.addColorStop(0, '#dc2626'); // Highlight sheen
    grad.addColorStop(0.3, '#991b1b');
    grad.addColorStop(0.7, '#7f1d1d');
    grad.addColorStop(1, '#450a0a'); // Deep shadow perimeter
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // 2. Fine organic testa wrinkles & mottling
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = (i % 2 === 0) ? 'rgba(254, 202, 202, 0.08)' : 'rgba(69, 10, 10, 0.15)';
      ctx.fillRect(x, y, Math.random() * 6 + 1, Math.random() * 2 + 1);
    }

    // 3. Central White Hilum (Seed Scar / Eye of the bean)
    ctx.save();
    ctx.translate(256, 256);
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 60, 24, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Micropyle pore in the hilum
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(38, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural High-Detail Botanical Leaf Texture with Reticulate Venation
   */
  static createDetailedLeafTexture(): THREE.CanvasTexture {
    const key = 'leaf_reticulate_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Vibrant Chloroplast Green Base
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
    bgGrad.addColorStop(0, '#4ade80');
    bgGrad.addColorStop(0.4, '#22c55e');
    bgGrad.addColorStop(0.8, '#16a34a');
    bgGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Primary Midrib Vein
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(512, 1024);
    ctx.quadraticCurveTo(512, 500, 512, 20);
    ctx.stroke();

    // 3. Secondary Lateral Veins
    ctx.lineWidth = 7;
    for (let y = 100; y < 950; y += 50) {
      // Left lateral vein
      ctx.beginPath();
      ctx.moveTo(512, y);
      ctx.quadraticCurveTo(340, y - 35, 120, y - 90);
      ctx.stroke();

      // Right lateral vein
      ctx.beginPath();
      ctx.moveTo(512, y);
      ctx.quadraticCurveTo(680, y - 35, 900, y - 90);
      ctx.stroke();
    }

    // 4. Tertiary Reticulate Mesh Veins (Fine capillary network)
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(187, 247, 208, 0.4)';
    for (let i = 0; i < 400; i++) {
      const vx = Math.random() * 1024;
      const vy = Math.random() * 1024;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx + (Math.random() - 0.5) * 40, vy + (Math.random() - 0.5) * 40);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Root Tissue Texture with Root Cap
   */
  static createRootTexture(): THREE.CanvasTexture {
    const key = 'root_tissue_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#fef9c3'); // Ivory stem junction
    grad.addColorStop(0.3, '#fef08a');
    grad.addColorStop(0.7, '#fef9c3');
    grad.addColorStop(0.95, '#fde047'); // Root cap (calyptra)
    grad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    // Fine vertical fibrous striations
    ctx.fillStyle = 'rgba(161, 98, 7, 0.12)';
    for (let x = 0; x < 256; x += 4) {
      ctx.fillRect(x, 0, 1.5, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Monarch Butterfly Wing Texture (Danaus plexippus)
   */
  static createMonarchWingTexture(): THREE.CanvasTexture {
    const key = 'monarch_wing_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Rich fiery orange wing cell base
    const grad = ctx.createRadialGradient(400, 400, 80, 512, 512, 500);
    grad.addColorStop(0, '#fdba74'); // Golden orange central highlights
    grad.addColorStop(0.3, '#f97316');
    grad.addColorStop(0.7, '#ea580c');
    grad.addColorStop(1, '#9a3412');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Bold Black Venation Lines (Main structural veins)
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.quadraticCurveTo(450, 200, 950, 150);
    ctx.moveTo(100, 100);
    ctx.quadraticCurveTo(450, 400, 920, 450);
    ctx.moveTo(100, 100);
    ctx.quadraticCurveTo(450, 600, 850, 750);
    ctx.moveTo(100, 100);
    ctx.quadraticCurveTo(350, 750, 650, 920);
    ctx.stroke();

    // Secondary connecting branch veins
    ctx.lineWidth = 10;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(300 + i * 60, 200 + i * 40);
      ctx.quadraticCurveTo(450 + i * 40, 350 + i * 30, 600 + i * 40, 500 + i * 40);
      ctx.stroke();
    }

    // 3. Broad Black Border along outer margins
    ctx.lineWidth = 60;
    ctx.strokeRect(30, 30, 964, 964);

    // 4. White Pearl Margin Dots (Signature Monarch pattern)
    ctx.fillStyle = '#ffffff';
    for (let d = 0; d < 32; d++) {
      const angle = (d / 32) * Math.PI * 2;
      const x = 512 + Math.cos(angle) * 460;
      const y = 512 + Math.sin(angle) * 460;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();

      // Inner staggered row of smaller dots
      const inX = 512 + Math.cos(angle) * 435;
      const inY = 512 + Math.sin(angle) * 435;
      ctx.beginPath();
      ctx.arc(inX, inY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Striped Monarch Caterpillar Texture
   */
  static createCaterpillarTexture(): THREE.CanvasTexture {
    const key = 'caterpillar_stripes_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Alternating Yellow, Black, and White transverse bands
    const bandWidth = 16;
    const colors = ['#facc15', '#09090b', '#ffffff', '#09090b'];
    for (let x = 0; x < 512; x += bandWidth) {
      const cIdx = Math.floor(x / bandWidth) % colors.length;
      ctx.fillStyle = colors[cIdx];
      ctx.fillRect(x, 0, bandWidth, 256);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Iridescent Feather Texture for Nepal's National Bird (Danfe / Himalayan Monal)
   */
  static createDanfeFeatherTexture(): THREE.CanvasTexture {
    const key = 'danfe_feather_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base iridescent gradient: metallic cobalt to emerald to copper
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#0284c7');    // Royal Cyan/Blue
    grad.addColorStop(0.35, '#0d9488'); // Deep Teal
    grad.addColorStop(0.65, '#059669'); // Emerald Green
    grad.addColorStop(0.85, '#d97706'); // Copper Gold
    grad.addColorStop(1, '#9333ea');    // Iridescent Purple
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Overlapping feather barbules & scalloped crescent vanes
    for (let y = 10; y < 512; y += 24) {
      for (let x = 0; x < 512; x += 36) {
        const offset = (y % 48 === 0) ? 18 : 0;
        ctx.beginPath();
        ctx.arc(x + offset, y, 22, 0, Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Moist Speckled Frog Skin Texture
   */
  static createFrogSkinTexture(): THREE.CanvasTexture {
    const key = 'frog_skin_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Forest green moss base
    const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 300);
    grad.addColorStop(0, '#22c55e');
    grad.addColorStop(0.7, '#15803d');
    grad.addColorStop(1, '#14532d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Natural dark spots and yellow/gold dermal papillae
    for (let i = 0; i < 90; i++) {
      const rx = (Math.sin(i * 12.3) * 0.5 + 0.5) * 512;
      const ry = (Math.cos(i * 7.9) * 0.5 + 0.5) * 512;
      const rad = 6 + (i % 8) * 2;

      ctx.beginPath();
      ctx.ellipse(rx, ry, rad, rad * 0.7, i, 0, Math.PI * 2);
      ctx.fillStyle = '#0f291e';
      ctx.fill();

      // Golden highlight edge
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Coiled Snail Shell Texture
   */
  static createSnailShellTexture(): THREE.CanvasTexture {
    const key = 'snail_shell_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Warm amber-cream spiral gradient
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, 512, 512);

    // Concentric spiral whorl bands
    ctx.translate(256, 256);
    for (let r = 10; r < 360; r += 14) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = (Math.floor(r / 14) % 2 === 0) ? '#92400e' : '#d97706';
      ctx.lineWidth = 7;
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural Scaled Trout Texture
   */
  static createFishScaleTexture(): THREE.CanvasTexture {
    const key = 'fish_scale_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Shimmering silver-cyan to salmon-pink lateral gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#0369a1');    // Dark dorsal spine
    grad.addColorStop(0.35, '#0284c7');
    grad.addColorStop(0.5, '#f472b6');  // Pink lateral stripe
    grad.addColorStop(0.75, '#e0f2fe'); // Silver belly
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Fine scale arcs
    for (let y = 0; y < 256; y += 12) {
      for (let x = 0; x < 512; x += 16) {
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Black river-trout spots
    for (let i = 0; i < 50; i++) {
      const sx = ((i * 37) % 512);
      const sy = 30 + ((i * 17) % 120);
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Procedural High-Definition Computer OS Desktop Wallpaper & UI
   */
  static createComputerScreenTexture(): THREE.CanvasTexture {
    const key = 'computer_desktop_screen_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // Himalayan Sunset Wallpaper
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 540);
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(0.4, '#1e3a8a');
    skyGrad.addColorStop(0.7, '#0284c7');
    skyGrad.addColorStop(1, '#fb923c');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 540);

    // Distant Snow Peak Silhouette
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(300, 540);
    ctx.lineTo(512, 260); // Everest Summit
    ctx.lineTo(720, 540);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(150, 540);
    ctx.lineTo(340, 320);
    ctx.lineTo(520, 540);
    ctx.closePath();
    ctx.fill();

    // Educational OS App Icons on Desktop
    const drawIcon = (x: number, y: number, color: string, label: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, 44, 44, 8);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + 22, y + 60);
    };

    drawIcon(50, 40, '#0ea5e9', 'Files');
    drawIcon(50, 120, '#10b981', 'Science');
    drawIcon(50, 200, '#f59e0b', 'Paint');
    drawIcon(50, 280, '#8b5cf6', 'Writer');

    // Windows / Taskbar at Bottom (h = 60px)
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 540, 1024, 60);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 540, 1024, 60);

    // Start Button
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(14, 548, 80, 44, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('नेपाल OS', 54, 575);

    // System Tray Clock
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('10:45 AM • 2081 BS', 1000, 575);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }
}


