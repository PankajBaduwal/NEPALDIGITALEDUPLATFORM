import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Layers, RotateCcw, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

type NetType = 'cube' | 'cuboid' | 'tetrahedron' | 'cone' | 'cylinder';

interface NetMeta {
  id: NetType;
  nameNp: string;
  nameEn: string;
  facesNp: string;
  facesEn: string;
  descNp: string;
  descEn: string;
}

const NETS_INFO: Record<NetType, NetMeta> = {
  cube: {
    id: 'cube',
    nameNp: 'घनको जालो (Cube Net)',
    nameEn: 'Cube Net',
    facesNp: '६ वटा बराबर वर्गहरू (६ पृष्ठ, १२ किनारा, ८ शीर्षबिन्दु)',
    facesEn: '6 Equal Squares (6 faces, 12 edges, 8 vertices)',
    descNp: '६ वटा वर्गाकार पृष्ठहरू जोडिएर घन बन्दछ। यसका ११ वटा फरक-फरक मान्य जालोहरू (valid nets) हुन सक्छन्।',
    descEn: '6 square faces fold together at 90° angles to form a closed cube.'
  },
  cuboid: {
    id: 'cuboid',
    nameNp: 'घनाभको जालो (Cuboid Net)',
    nameEn: 'Cuboid Net',
    facesNp: '६ वटा आयताकार पृष्ठहरू (सम्मुख पृष्ठहरू बराबर)',
    facesEn: '6 Rectangular Faces (opposite faces congruent)',
    descNp: '६ वटा आयतहरू मिलेर घनाभ बन्दछ। सम्मुख पृष्ठहरू एकअर्कासँग समानान्तर र बराबर हुन्छन्।',
    descEn: '6 rectangular faces with opposite faces congruent fold into a cuboid.'
  },
  tetrahedron: {
    id: 'tetrahedron',
    nameNp: 'चतुष्फलकको जालो (Tetrahedron Net)',
    nameEn: 'Tetrahedron Net',
    facesNp: '४ वटा समबाहु त्रिभुजहरू (४ पृष्ठ, ६ किनारा, ४ शीर्षबिन्दु)',
    facesEn: '4 Equilateral Triangles (4 faces, 6 edges, 4 vertices)',
    descNp: '४ वटा त्रिकोणीय पृष्ठहरू मिलेर बन्द त्रिकोणीय पिरामिड (चतुष्फलक) बन्दछ।',
    descEn: '4 equilateral triangular faces fold up into a regular tetrahedron.'
  },
  cone: {
    id: 'cone',
    nameNp: 'शङ्कुको जालो (Cone Net)',
    nameEn: 'Cone Net',
    facesNp: '१ वृत्ताकार आधार + १ वृत्तखण्ड (Sector)',
    facesEn: '1 Circular Base + 1 Circular Sector',
    descNp: 'एउटा वृत्तखण्ड बेरिएर छड्के सतह र एउटा वृत्तले आधार बनाई शङ्कु बन्दछ।',
    descEn: 'One circular sector rolls up to form the conical lateral surface over one circular base.'
  },
  cylinder: {
    id: 'cylinder',
    nameNp: 'बेलनको जालो (Cylinder Net)',
    nameEn: 'Cylinder Net',
    facesNp: '२ वृत्ताकार आधारहरू + १ आयताकार छड्के सतह',
    facesEn: '2 Circular Bases + 1 Rectangular Lateral Surface',
    descNp: 'एउटा आयतलाई बेरेर वक्र सतह बनाइन्छ र माथि तथा तल दुईवटा वृत्तहरू जोडिन्छन्।',
    descEn: 'One rectangle rolls up into the curved lateral cylinder surface capped by two circular bases.'
  }
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'घन (Cube) को जालोमा कतिवटा वर्गाकार पृष्ठहरू हुनुपर्छ?',
    en: 'How many square faces must the net of a cube have?',
    options: [
      { key: 'A', label: '६ वटा (Six squares)' },
      { key: 'B', label: '४ वटा' },
      { key: 'C', label: '८ वटा' },
      { key: 'D', label: '१२ वटा' },
    ],
    answer: 'A',
  },
  {
    np: 'बेलन (Cylinder) को छड्के सतह (Curved surface) लाई फिँजाउँदा कुन आकार बन्दछ?',
    en: 'When the curved surface of a cylinder is unrolled flat, what shape does it form?',
    options: [
      { key: 'A', label: 'आयत (Rectangle)' },
      { key: 'B', label: 'वृत्त (Circle)' },
      { key: 'C', label: 'त्रिभुज (Triangle)' },
      { key: 'D', label: 'शङ्कु (Cone)' },
    ],
    answer: 'A',
  },
  {
    np: 'शङ्कु (Cone) को जालोमा कुन-कुन दुईवटा भागहरू हुन्छन्?',
    en: 'Which two 2D components comprise the net of a cone?',
    options: [
      { key: 'A', label: 'एउटा वृत्त र एउटा वृत्तखण्ड (Circle and Sector)' },
      { key: 'B', label: 'दुईवटा वृत्त' },
      { key: 'C', label: 'एउटा आयत र दुईवटा वृत्त' },
      { key: 'D', label: 'तीनवटा त्रिभुज' },
    ],
    answer: 'A',
  }
];

export const SolidNetBuilderFoldingLab3D: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U16-02',
    chapter: 16,
    titleNp: '३D ठोस वस्तु जालो र पट्याउने प्रयोगशाला',
    titleEn: '3D Solid Net Builder and Folding Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeNet, setActiveNet] = useState<NetType>('cube');
  // Fold progress: 0% = flat 2D net, 100% = fully closed 3D solid
  const [foldProgress, setFoldProgress] = useState<number>(50);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const curMeta = NETS_INFO[activeNet];

  // 3D Scene Folding Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2, 3, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);

    // Build foldable cube faces
    const foldFactor = foldProgress / 100; // 0 to 1
    const foldAngle = foldFactor * (Math.PI / 2); // 0 to 90 deg

    if (activeNet === 'cube' || activeNet === 'cuboid') {
      const faceSize = activeNet === 'cube' ? 1.0 : 1.2;
      const planeGeom = new THREE.PlaneGeometry(faceSize, faceSize);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
      });

      // Bottom Base face
      const baseMesh = new THREE.Mesh(planeGeom, mat);
      baseMesh.rotation.x = -Math.PI / 2;
      group.add(baseMesh);

      // Front Face
      const frontGroup = new THREE.Group();
      frontGroup.position.set(0, 0, faceSize / 2);
      const frontMesh = new THREE.Mesh(planeGeom, mat);
      frontMesh.position.set(0, faceSize / 2, 0);
      frontGroup.rotation.x = -(Math.PI / 2 - foldAngle);
      frontGroup.add(frontMesh);
      group.add(frontGroup);

      // Back Face + Top Face attached to it
      const backGroup = new THREE.Group();
      backGroup.position.set(0, 0, -faceSize / 2);
      const backMesh = new THREE.Mesh(planeGeom, mat);
      backMesh.position.set(0, faceSize / 2, 0);
      backGroup.rotation.x = (Math.PI / 2 - foldAngle);
      backGroup.add(backMesh);

      // Top attached face
      const topGroup = new THREE.Group();
      topGroup.position.set(0, faceSize, 0);
      const topMesh = new THREE.Mesh(planeGeom, mat);
      topMesh.position.set(0, faceSize / 2, 0);
      topGroup.rotation.x = -(Math.PI / 2 - foldAngle);
      topGroup.add(topMesh);
      backGroup.add(topGroup);
      group.add(backGroup);

      // Left Face
      const leftGroup = new THREE.Group();
      leftGroup.position.set(-faceSize / 2, 0, 0);
      const leftMesh = new THREE.Mesh(planeGeom, mat);
      leftMesh.position.set(0, faceSize / 2, 0);
      leftMesh.rotation.y = Math.PI / 2;
      leftGroup.rotation.z = -(Math.PI / 2 - foldAngle);
      leftGroup.add(leftMesh);
      group.add(leftGroup);

      // Right Face
      const rightGroup = new THREE.Group();
      rightGroup.position.set(faceSize / 2, 0, 0);
      const rightMesh = new THREE.Mesh(planeGeom, mat);
      rightMesh.position.set(0, faceSize / 2, 0);
      rightMesh.rotation.y = -Math.PI / 2;
      rightGroup.rotation.z = (Math.PI / 2 - foldAngle);
      rightGroup.add(rightMesh);
      group.add(rightGroup);
    } else {
      // General solid model folding preview
      const geom =
        activeNet === 'tetrahedron'
          ? new THREE.TetrahedronGeometry(1.4)
          : activeNet === 'cone'
          ? new THREE.ConeGeometry(1.2, 2.0, 16)
          : new THREE.CylinderGeometry(1.0, 1.0, 2.0, 16);

      const mat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
      });
      const mesh = new THREE.Mesh(geom, mat);
      group.add(mesh);
    }

    let animationFrameId: number;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      group.rotation.y += (e.clientX - prevMouseX) * 0.01;
      group.rotation.x += (e.clientY - prevMouseY) * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => { isDragging = false; };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const animate = () => {
      if (!isDragging) {
        group.rotation.y += 0.004;
      }
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [activeNet, foldProgress]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! २D जालोलाई पट्याएर ३D ठोस वस्तु बनाउने र खोल्ने रोचक प्रक्रिया सिक्नुहोस्!',
        'Hello! Learn how 2D nets fold into 3D solid objects and unfold back into plane nets!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Solid Net Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(NETS_INFO) as NetType[]).map((netKey) => (
            <button
              key={netKey}
              onClick={() => {
                setActiveNet(netKey);
                setFoldProgress(50);
              }}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                activeNet === netKey
                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs">{isNe ? NETS_INFO[netKey].nameNp.split(' ')[0] : NETS_INFO[netKey].nameEn}</div>
            </button>
          ))}
        </div>

        {/* Folding Slider */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[240px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {L('पट्याउने / खोल्ने नियन्त्रण (Fold / Unfold Progress):', 'Fold / Unfold Progress:')}
              </span>
              <span className="font-mono text-sm font-bold text-amber-300">
                {foldProgress}% {foldProgress === 100 ? L('(पूरा पट्याइएको ३D ठोस)', '(Full 3D Solid)') : foldProgress === 0 ? L('(फिँजाइएको २D जालो)', '(Flat 2D Net)') : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={foldProgress}
              onChange={(e) => setFoldProgress(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0% (२D जालो / Flat Net)</span>
              <span>५०% (पट्याउँदै / Folding)</span>
              <span>100% (३D ठोस / Closed Solid)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setFoldProgress(0); kit.good(); }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300"
            >
              {L('खोल्नुहोस् (0%)', 'Unfold (0%)')}
            </button>
            <button
              onClick={() => { setFoldProgress(100); kit.good(); }}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
            >
              {L('पट्याउनुहोस् (100%)', 'Fold (100%)')}
            </button>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center relative">
          <canvas ref={canvasRef} className="w-full max-w-2xl h-72 cursor-grab active:cursor-grabbing rounded-xl" />
          <div className="absolute top-6 left-6 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700 pointer-events-none">
            🖱️ {L('माउसले ३D जालोलाई चारैतिर घुमाउनुहोस्', 'Drag to rotate 3D folding solid')}
          </div>
        </div>

        {/* Net Information Card */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-2">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            {isNe ? curMeta.nameNp : curMeta.nameEn} – {L('जालोको विवरण', 'Net Composition')}
          </div>
          <div className="text-sm font-semibold text-slate-200">
            {isNe ? curMeta.facesNp : curMeta.facesEn}
          </div>
          <p className="text-xs text-slate-400">
            {isNe ? curMeta.descNp : curMeta.descEn}
          </p>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default SolidNetBuilderFoldingLab3D;
