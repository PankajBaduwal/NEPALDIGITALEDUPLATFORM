/**
 * ShapeEnvironment.ts
 * Procedural 3D Scene Engine for Class 1 Mathematics Chapter 3 (Geometrical Shapes / ज्यामितीय आकारहरू)
 * Renders genuine Three.js 3D geometric models: Circle (वृत्त), Triangle (त्रिभुज), Quadrilateral (चतुर्भुज)
 * and their matching real-world counterparts (plate, clock, drum, sign, roof, book, door, window).
 */

import * as THREE from 'three';

export interface InteractiveShapeObject {
  id: string;
  nameEn: string;
  nameNp: string;
  category: 'circle' | 'triangle' | 'quadrilateral';
  categoryNp: 'वृत्त' | 'त्रिभुज' | 'चतुर्भुज';
  mesh: THREE.Object3D;
  descriptionEn: string;
  descriptionNp: string;
  faceHintEn: string;
  faceHintNp: string;
  basePosition: THREE.Vector3;
  sizeCategory?: 'small' | 'medium' | 'large';
}

export class ShapeEnvironment {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  public interactiveObjects: InteractiveShapeObject[] = [];
  public selectedObject: InteractiveShapeObject | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Highlight effect
  private highlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.5,
    roughness: 0.2,
  });

  // Rotation controls
  public isUserRotating = false;
  private targetRotationY = 0;
  private currentRotationY = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene setup with soft playground atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0fdf4); // Soft pastel green
    this.scene.fog = new THREE.FogExp2(0xf0fdf4, 0.025);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 4, 9);
    this.camera.lookAt(0, 1.2, 0);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    this.initLights();
    this.initEnvironment();
    this.initGeometricAndRealWorldModels();
    this.setupWindowResize();
    this.animate();
  }

  private initLights(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    // Directional Sun Light
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.3);
    sunLight.position.set(8, 16, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    this.scene.add(sunLight);

    // Hemisphere sky bounce
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0xbbf7d0, 0.6);
    this.scene.add(hemiLight);
  }

  private initEnvironment(): void {
    // Ground podium / schoolyard grass
    const groundGeo = new THREE.CylinderGeometry(14, 14.5, 0.4, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Circular checkered display stage
    const stageGeo = new THREE.CylinderGeometry(5.2, 5.5, 0.25, 48);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = 0.05;
    stage.receiveShadow = true;
    this.scene.add(stage);

    // Stage border ring
    const ringGeo = new THREE.TorusGeometry(5.3, 0.08, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.18;
    this.scene.add(ring);
  }

  private initGeometricAndRealWorldModels(): void {
    // ══════════════════════════════════════════════════════════════════
    // 1. CIRCLE OBJECTS (वृत्त आकारका वस्तुहरू)
    // ══════════════════════════════════════════════════════════════════

    // A. Pure Geometric Circle Disc
    const circleDiscGroup = new THREE.Group();
    const discGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.1, 48);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Vibrant Green (Textbook circle color)
      roughness: 0.3,
      metalness: 0.1,
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.rotation.x = Math.PI / 2;
    discMesh.castShadow = true;
    circleDiscGroup.add(discMesh);

    // Golden rim for disc
    const discRimGeo = new THREE.TorusGeometry(1.3, 0.05, 16, 48);
    const discRimMat = new THREE.MeshStandardMaterial({ color: 0x059669 });
    const discRim = new THREE.Mesh(discRimGeo, discRimMat);
    circleDiscGroup.add(discRim);

    circleDiscGroup.position.set(-3.2, 1.4, -0.5);
    this.scene.add(circleDiscGroup);
    this.registerInteractiveObject({
      id: 'circle_disc',
      nameEn: 'Circle Disc',
      nameNp: 'वृत्त आकार',
      category: 'circle',
      categoryNp: 'वृत्त',
      mesh: circleDiscGroup,
      descriptionEn: 'This is a circle (वृत्त). It is completely round with no corners.',
      descriptionNp: 'यो वृत्त (Circle) हो। यसको आकार गोलो हुन्छ र कुनै कुना हुँदैन।',
      faceHintEn: 'Notice the perfectly round circular shape.',
      faceHintNp: 'यो पूरै गोलो घेरा भएको वृत्त हो।',
      basePosition: circleDiscGroup.position.clone(),
      sizeCategory: 'large',
    });

    // B. Real-World Wall Clock (गोलो घडी)
    const clockGroup = new THREE.Group();
    const clockBodyGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.12, 36);
    const clockBodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
    const clockBody = new THREE.Mesh(clockBodyGeo, clockBodyMat);
    clockBody.rotation.x = Math.PI / 2;
    clockBody.castShadow = true;
    clockGroup.add(clockBody);

    // Clock Face (white circle)
    const clockFaceGeo = new THREE.CircleGeometry(0.8, 36);
    const clockFaceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const clockFace = new THREE.Mesh(clockFaceGeo, clockFaceMat);
    clockFace.position.z = 0.07;
    clockGroup.add(clockFace);

    // Clock hands
    const handHGeo = new THREE.BoxGeometry(0.04, 0.45, 0.02);
    const handMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const handH = new THREE.Mesh(handHGeo, handMat);
    handH.position.set(0, 0.2, 0.08);
    clockGroup.add(handH);

    const handMGeo = new THREE.BoxGeometry(0.03, 0.6, 0.02);
    const handM = new THREE.Mesh(handMGeo, handMat);
    handM.rotation.z = -Math.PI / 3;
    handM.position.set(0.2, 0.1, 0.08);
    clockGroup.add(handM);

    clockGroup.position.set(-2.8, 1.2, 1.8);
    this.scene.add(clockGroup);
    this.registerInteractiveObject({
      id: 'clock',
      nameEn: 'Wall Clock',
      nameNp: 'भित्ते घडी',
      category: 'circle',
      categoryNp: 'वृत्त',
      mesh: clockGroup,
      descriptionEn: 'The face of this wall clock has a circular shape (वृत्त).',
      descriptionNp: 'यो भित्ते घडीको मुख गोलो वृत्त आकारको हुन्छ।',
      faceHintEn: 'Look at the round clock face!',
      faceHintNp: 'घडीको गोलो मुखलाई हेर्नुहोस्, यो वृत्त हो!',
      basePosition: clockGroup.position.clone(),
      sizeCategory: 'medium',
    });

    // C. Real-World Plate (थाली)
    const plateGroup = new THREE.Group();
    const plateGeo = new THREE.CylinderGeometry(0.85, 0.65, 0.08, 36);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.15,
      metalness: 0.4,
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.rotation.x = Math.PI / 3.5;
    plateMesh.castShadow = true;
    plateGroup.add(plateMesh);

    plateGroup.position.set(-1.4, 0.9, 2.5);
    this.scene.add(plateGroup);
    this.registerInteractiveObject({
      id: 'plate',
      nameEn: 'Dining Plate',
      nameNp: 'थाली',
      category: 'circle',
      categoryNp: 'वृत्त',
      mesh: plateGroup,
      descriptionEn: 'A dining plate has a round, circular surface (वृत्त).',
      descriptionNp: 'खाना खाने थालीको आकार गोलो वृत्त जस्तो हुन्छ।',
      faceHintEn: 'The rim and eating surface are circular.',
      faceHintNp: 'थालीको किनारा र सतह वृत्त आकारको छ।',
      basePosition: plateGroup.position.clone(),
      sizeCategory: 'medium',
    });

    // ══════════════════════════════════════════════════════════════════
    // 2. TRIANGLE OBJECTS (त्रिभुज आकारका वस्तुहरू)
    // ══════════════════════════════════════════════════════════════════

    // A. Pure Geometric Triangle Prism
    const triGroup = new THREE.Group();
    const triGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.12, 3);
    const triMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red (Textbook triangle color)
      roughness: 0.3,
      metalness: 0.1,
    });
    const triMesh = new THREE.Mesh(triGeo, triMat);
    triMesh.rotation.x = Math.PI / 2;
    triMesh.rotation.z = Math.PI / 6;
    triMesh.castShadow = true;
    triGroup.add(triMesh);

    triGroup.position.set(0, 1.5, -0.6);
    this.scene.add(triGroup);
    this.registerInteractiveObject({
      id: 'triangle_prism',
      nameEn: 'Triangle',
      nameNp: 'त्रिभुज आकार',
      category: 'triangle',
      categoryNp: 'त्रिभुज',
      mesh: triGroup,
      descriptionEn: 'This is a triangle (त्रिभुज). It has 3 straight sides and 3 corners.',
      descriptionNp: 'यो त्रिभुज (Triangle) हो। यसका ३ वटा सीधा सिधा किनारा र ३ वटा कुना हुन्छन्।',
      faceHintEn: 'Count the 3 sides: 1, 2, 3!',
      faceHintNp: 'तीनवटा सीधा किनारा गन्नुहोस्: १, २, ३!',
      basePosition: triGroup.position.clone(),
      sizeCategory: 'large',
    });

    // B. Real-World Traffic Warning Sign (ट्राफिक सङ्केत)
    const signGroup = new THREE.Group();
    const signPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 16);
    const signPoleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 });
    const signPole = new THREE.Mesh(signPoleGeo, signPoleMat);
    signPole.position.y = 0.9;
    signPole.castShadow = true;
    signGroup.add(signPole);

    const signBoardGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.06, 3);
    const signBoardMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }); // Yellow caution
    const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
    signBoard.rotation.x = Math.PI / 2;
    signBoard.rotation.z = Math.PI / 6;
    signBoard.position.y = 1.7;
    signBoard.castShadow = true;
    signGroup.add(signBoard);

    // Inner black triangle symbol
    const signInnerGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.07, 3);
    const signInnerMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const signInner = new THREE.Mesh(signInnerGeo, signInnerMat);
    signInner.rotation.x = Math.PI / 2;
    signInner.rotation.z = Math.PI / 6;
    signInner.position.set(0, 1.7, 0.01);
    signGroup.add(signInner);

    signGroup.position.set(0, 0.1, 1.8);
    this.scene.add(signGroup);
    this.registerInteractiveObject({
      id: 'traffic_sign',
      nameEn: 'Traffic Sign',
      nameNp: 'ट्राफिक सङ्केत',
      category: 'triangle',
      categoryNp: 'त्रिभुज',
      mesh: signGroup,
      descriptionEn: 'Road safety signs often have a 3-sided triangular shape (त्रिभुज).',
      descriptionNp: 'बाटोको ट्राफिक सङ्केत बोर्ड ३ वटा कुना भएको त्रिभुज आकारको छ।',
      faceHintEn: 'Look at the triangular warning sign!',
      faceHintNp: 'यो ट्राफिक बोर्डको आकार त्रिभुज हो!',
      basePosition: signGroup.position.clone(),
      sizeCategory: 'medium',
    });

    // C. Traditional Cottage Roof (घरको छाना)
    const roofGroup = new THREE.Group();
    // Triangular gable roof
    const roofGeo = new THREE.ConeGeometry(0.8, 0.7, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.castShadow = true;
    roofGroup.add(roofMesh);

    roofGroup.position.set(1.4, 0.8, 2.5);
    this.scene.add(roofGroup);
    this.registerInteractiveObject({
      id: 'cottage_roof',
      nameEn: 'Triangular Roof',
      nameNp: 'घरको छाना',
      category: 'triangle',
      categoryNp: 'त्रिभुज',
      mesh: roofGroup,
      descriptionEn: 'The side profile of this village cottage roof is a triangle (त्रिभुज).',
      descriptionNp: 'घरको छानाको छेउको भाग त्रिभुज आकारको हुन्छ।',
      faceHintEn: 'Slanted sides meet at the top point.',
      faceHintNp: 'दुई छड्के छाना मिलेर त्रिभुज बनेको छ।',
      basePosition: roofGroup.position.clone(),
      sizeCategory: 'small',
    });

    // ══════════════════════════════════════════════════════════════════
    // 3. QUADRILATERAL OBJECTS (चतुर्भुज आकारका वस्तुहरू)
    // ══════════════════════════════════════════════════════════════════

    // A. Pure Geometric Quadrilateral / Rectangle Slab
    const quadGroup = new THREE.Group();
    const quadGeo = new THREE.BoxGeometry(2.1, 1.5, 0.12);
    const quadMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Blue (Textbook rectangle/quadrilateral color)
      roughness: 0.3,
      metalness: 0.1,
    });
    const quadMesh = new THREE.Mesh(quadGeo, quadMat);
    quadMesh.castShadow = true;
    quadGroup.add(quadMesh);

    quadGroup.position.set(3.2, 1.4, -0.5);
    this.scene.add(quadGroup);
    this.registerInteractiveObject({
      id: 'quad_slab',
      nameEn: 'Quadrilateral',
      nameNp: 'चतुर्भुज आकार',
      category: 'quadrilateral',
      categoryNp: 'चतुर्भुज',
      mesh: quadGroup,
      descriptionEn: 'This is a quadrilateral (चतुर्भुज). It has 4 straight sides and 4 corners.',
      descriptionNp: 'यो चतुर्भुज (Quadrilateral) हो। यसका ४ वटा सीधा सिधा किनारा र ४ वटा कुना हुन्छन्।',
      faceHintEn: 'Count the 4 sides: 1, 2, 3, 4!',
      faceHintNp: 'चारवटा सीधा सिधा किनारा गन्नुहोस्: १, २, ३, ४!',
      basePosition: quadGroup.position.clone(),
      sizeCategory: 'large',
    });

    // B. Real-World Math Textbook (गणित किताब)
    const bookGroup = new THREE.Group();
    const bookCoverGeo = new THREE.BoxGeometry(1.1, 1.4, 0.18);
    const bookCoverMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 });
    const bookCover = new THREE.Mesh(bookCoverGeo, bookCoverMat);
    bookCover.rotation.x = -Math.PI / 4;
    bookCover.castShadow = true;
    bookGroup.add(bookCover);

    // Book pages white edge
    const pagesGeo = new THREE.BoxGeometry(1.05, 1.35, 0.14);
    const pagesMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const pages = new THREE.Mesh(pagesGeo, pagesMat);
    pages.position.set(0.02, 0, 0);
    bookCover.add(pages);

    bookGroup.position.set(2.8, 1.1, 1.8);
    this.scene.add(bookGroup);
    this.registerInteractiveObject({
      id: 'book',
      nameEn: 'Math Textbook',
      nameNp: 'गणित किताब',
      category: 'quadrilateral',
      categoryNp: 'चतुर्भुज',
      mesh: bookGroup,
      descriptionEn: 'The cover of this mathematics book is a 4-sided quadrilateral (चतुर्भुज).',
      descriptionNp: 'गणित किताबको बाहिरी कभर ४ वटा किनारा भएको चतुर्भुज आकारको छ।',
      faceHintEn: 'The book cover has 4 straight edges.',
      faceHintNp: 'किताबको कभरमा चारवटा सिधा किनारा छन्।',
      basePosition: bookGroup.position.clone(),
      sizeCategory: 'medium',
    });

    // C. Real-World Window Frame (झ्याल)
    const windowGroup = new THREE.Group();
    const winFrameGeo = new THREE.BoxGeometry(1.1, 1.1, 0.1);
    const winFrameMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const winFrame = new THREE.Mesh(winFrameGeo, winFrameMat);
    winFrame.castShadow = true;
    windowGroup.add(winFrame);

    // 4 glass panes
    const paneGeo = new THREE.PlaneGeometry(0.42, 0.42);
    const paneMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.75,
    });
    [
      [-0.24, 0.24],
      [0.24, 0.24],
      [-0.24, -0.24],
      [0.24, -0.24],
    ].forEach(([px, py]) => {
      const pane = new THREE.Mesh(paneGeo, paneMat);
      pane.position.set(px, py, 0.06);
      windowGroup.add(pane);
    });

    windowGroup.position.set(0, 2.8, -1.8);
    this.scene.add(windowGroup);
    this.registerInteractiveObject({
      id: 'window',
      nameEn: 'Square Window',
      nameNp: 'झ्याल',
      category: 'quadrilateral',
      categoryNp: 'चतुर्भुज',
      mesh: windowGroup,
      descriptionEn: 'This square window frame is a 4-sided quadrilateral (चतुर्भुज).',
      descriptionNp: 'यो कोठाको झ्याल ४ वटा समान किनारा भएको चतुर्भुज (वर्गाकार) हो।',
      faceHintEn: 'Four equal sides make this quadrilateral.',
      faceHintNp: 'चारवटा बराबर किनाराले बनेको चतुर्भुज हो।',
      basePosition: windowGroup.position.clone(),
      sizeCategory: 'small',
    });
  }

  private registerInteractiveObject(obj: InteractiveShapeObject): void {
    // Tag object on mesh and all its children for raycast detection
    obj.mesh.userData = { interactiveId: obj.id, shapeObject: obj };
    obj.mesh.traverse((child) => {
      child.userData = { interactiveId: obj.id, shapeObject: obj };
    });
    this.interactiveObjects.push(obj);
  }

  // Handle Raycasting pointer interaction
  public raycast(clientX: number, clientY: number): InteractiveShapeObject | null {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (const hit of intersects) {
      let current: THREE.Object3D | null = hit.object;
      while (current) {
        if (current.userData && current.userData.shapeObject) {
          return current.userData.shapeObject as InteractiveShapeObject;
        }
        current = current.parent;
      }
    }
    return null;
  }

  // Select and focus an object
  public selectObject(shapeObj: InteractiveShapeObject | null): void {
    this.selectedObject = shapeObj;
  }

  // Rotate selected 3D object manually
  public rotateSelected(deltaX: number): void {
    if (this.selectedObject) {
      this.selectedObject.mesh.rotation.y += deltaX * 0.02;
    }
  }

  private setupWindowResize(): void {
    window.addEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);

    // Subtle gentle float / idle rotation on the main 3 pure geometric shapes
    const time = Date.now() * 0.0015;
    this.interactiveObjects.forEach((obj) => {
      if (obj.id.includes('disc') || obj.id.includes('prism') || obj.id.includes('slab')) {
        obj.mesh.position.y = obj.basePosition.y + Math.sin(time + obj.basePosition.x) * 0.08;
      }
    });

    // If an object is actively selected, spin it gently if user is not dragging
    if (this.selectedObject && !this.isUserRotating) {
      this.selectedObject.mesh.rotation.y += 0.01;
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}

