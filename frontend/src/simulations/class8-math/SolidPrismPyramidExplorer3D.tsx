import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Box, Layers, Eye, RotateCw, CheckCircle } from 'lucide-react';

type SolidType = 'triangular_prism' | 'triangular_pyramid' | 'square_pyramid' | 'hexagonal_pyramid';

interface SolidMeta {
  id: SolidType;
  nameNp: string;
  nameEn: string;
  kind: 'prism' | 'pyramid';
  faces: number;
  edges: number;
  vertices: number;
  baseShapeNp: string;
  baseShapeEn: string;
  descNp: string;
  descEn: string;
}

const SOLIDS: Record<SolidType, SolidMeta> = {
  triangular_prism: {
    id: 'triangular_prism',
    nameNp: 'त्रिभुजाकार आधार भएको प्रिज्म (Triangular Prism)',
    nameEn: 'Triangular Prism',
    kind: 'prism',
    faces: 5,
    edges: 9,
    vertices: 6,
    baseShapeNp: '2 pcs समानान्तर त्रिभुज (2 आधार, 3 आयत)',
    baseShapeEn: '2 Parallel Triangles (2 bases, 3 rectangular faces)',
    descNp: '2 pcs समानान्तर र सर्वाङ्गसम त्रिभुज आधारहरू र 3 pcs Rectangular छड्के सतहहरू (जम्मा 5 पृष्ठ, 9 किनारा, 6 शीर्षबिन्दु)।',
    descEn: 'Two parallel congruent triangular bases and three rectangular lateral faces (5 faces, 9 edges, 6 vertices).'
  },
  triangular_pyramid: {
    id: 'triangular_pyramid',
    nameNp: 'त्रिभुजाकार आधार भएको पिरामिड (Triangular Pyramid)',
    nameEn: 'Triangular Pyramid (Tetrahedron)',
    kind: 'pyramid',
    faces: 4,
    edges: 6,
    vertices: 4,
    baseShapeNp: 'त्रिभुज (4 pcs त्रिकोणीय पृष्ठ)',
    baseShapeEn: 'Triangle (4 triangular faces)',
    descNp: 'त्रिभुजाकार आधार र एउटै साझा शीर्षबिन्दुमा जोडिने 3 pcs त्रिकोणीय छड्के पृष्ठहरू (जम्मा 4 पृष्ठ, 6 किनारा, 4 शीर्षबिन्दु)।',
    descEn: 'A triangular base with three triangular lateral faces meeting at a common apex (4 faces, 6 edges, 4 vertices).'
  },
  square_pyramid: {
    id: 'square_pyramid',
    nameNp: 'Square आधार भएको पिरामिड (Square Pyramid)',
    nameEn: 'Square-Based Pyramid',
    kind: 'pyramid',
    faces: 5,
    edges: 8,
    vertices: 5,
    baseShapeNp: 'वर्ग (1 Square आधार, 4 त्रिकोण)',
    baseShapeEn: 'Square (1 square base, 4 triangular faces)',
    descNp: 'Square आधार र एउटै शीर्षबिन्दुमा टुङ्गिने 4 pcs त्रिकोणीय छड्के पृष्ठहरू (जम्मा 5 पृष्ठ, 8 किनारा, 5 शीर्षबिन्दु)।',
    descEn: 'A square base and four triangular lateral faces meeting at the apex (5 faces, 8 edges, 5 vertices).'
  },
  hexagonal_pyramid: {
    id: 'hexagonal_pyramid',
    nameNp: 'षट्भुजाकार आधार भएको पिरामिड (Hexagonal Pyramid)',
    nameEn: 'Hexagonal Pyramid',
    kind: 'pyramid',
    faces: 7,
    edges: 12,
    vertices: 7,
    baseShapeNp: 'षट्भुज (1 षट्भुज आधार, 6 त्रिकोण)',
    baseShapeEn: 'Hexagon (1 hexagonal base, 6 triangular faces)',
    descNp: 'षट्भुजाकार आधार र शीर्षबिन्दुमा जोडिने 6 pcs त्रिकोणीय छड्के पृष्ठहरू (जम्मा 7 पृष्ठ, 12 किनारा, 7 शीर्षबिन्दु)।',
    descEn: 'A hexagonal base and six triangular lateral faces converging at the apex (7 faces, 12 edges, 7 vertices).'
  }
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'त्रिभुजाकार प्रिज्म (Triangular Prism) मा कतिpcs पृष्ठहरू (Faces) हुन्छन्?',
    en: 'How many faces does a triangular prism have?',
    options: [
      { key: 'A', label: '5 (2 triangles + 3 rectangles)' },
      { key: 'B', label: '4 pcs' },
      { key: 'C', label: '6 pcs' },
      { key: 'D', label: '9 pcs' },
    ],
    answer: 'A',
  },
  {
    np: 'Square आधार भएको पिरामिड (Square Pyramid) मा कतिpcs किनाराहरू (Edges) हुन्छन्?',
    en: 'How many edges does a square-based pyramid have?',
    options: [
      { key: 'A', label: '8 (4 base + 4 slanting)' },
      { key: 'B', label: '5 pcs' },
      { key: 'C', label: '6 pcs' },
      { key: 'D', label: '10 pcs' },
    ],
    answer: 'A',
  },
  {
    np: 'पिरामिडका सबै छड्के सतहहरू (Lateral faces) कुन आकारका हुन्छन्?',
    en: 'What shape are all the lateral faces of any pyramid?',
    options: [
      { key: 'A', label: 'Triangular' },
      { key: 'B', label: 'Rectangular' },
      { key: 'C', label: 'Circular' },
      { key: 'D', label: 'Square' },
    ],
    answer: 'A',
  }
];

export const SolidPrismPyramidExplorer3D: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U16-01',
    chapter: 16,
    titleNp: '3D प्रिज्म र पिरामिड अन्वेषक',
    titleEn: '3D Prism and Pyramid Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeSolid, setActiveSolid] = useState<SolidType>('triangular_prism');
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [highlightMode, setHighlightMode] = useState<'all' | 'base' | 'lateral'>('all');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  const curMeta = SOLIDS[activeSolid];

  // Build Three.js 3D Geometry
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Slate-950

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.5, 3, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 0.5);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Create solid mesh based on activeSolid
    let geom: THREE.BufferGeometry;
    if (activeSolid === 'triangular_prism') {
      // CylinderGeometry with 3 segments makes a triangular prism
      geom = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 3);
    } else if (activeSolid === 'triangular_pyramid') {
      // Tetrahedron
      geom = new THREE.TetrahedronGeometry(1.5);
    } else if (activeSolid === 'square_pyramid') {
      // ConeGeometry with 4 segments makes a square-based pyramid
      geom = new THREE.ConeGeometry(1.5, 2.2, 4);
    } else {
      // Hexagonal pyramid
      geom = new THREE.ConeGeometry(1.5, 2.2, 6);
    }

    const mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.3,
      metalness: 0.1,
      wireframe: wireframe,
      transparent: true,
      opacity: 0.85,
    });

    const mesh = new THREE.Mesh(geom, mat);
    group.add(mesh);

    // Edges geometry
    const edgesGeom = new THREE.EdgesGeometry(geom);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const edgesLine = new THREE.LineSegments(edgesGeom, edgesMat);
    group.add(edgesLine);

    // Animation & Interactive drag rotation
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
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      group.rotation.y += deltaX * 0.01;
      group.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => { isDragging = false; };

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      group.rotation.y += deltaX * 0.01;
      group.rotation.x += deltaY * 0.01;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };
    const onTouchEnd = () => { isDragging = false; };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    const animate = () => {
      if (!isDragging) {
        group.rotation.y += 0.005;
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
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      geom.dispose();
      mat.dispose();
      edgesGeom.dispose();
      edgesMat.dispose();
      renderer.dispose();
    };
  }, [activeSolid, wireframe]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! 3D प्रिज्म र पिरामिडका मोडेलहरूलाई हातले घुमाएर पृष्ठ (Faces), किनारा (Edges) र शीर्षबिन्दु (Vertices) अध्ययन गर्नुहोस्!',
        'Hello! Rotate and explore 3D models of prisms and pyramids to inspect their faces, edges, and vertices!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Solid Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(SOLIDS) as SolidType[]).map((solidKey) => (
            <button
              key={solidKey}
              onClick={() => setActiveSolid(solidKey)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                activeSolid === solidKey
                  ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="text-xs text-amber-400 font-semibold">{SOLIDS[solidKey].kind === 'prism' ? 'Prism' : 'Pyramid'}</div>
              <div className="font-bold text-xs text-slate-100 mt-1">{isNe ? SOLIDS[solidKey].nameNp.split(' ')[0] : SOLIDS[solidKey].nameEn}</div>
            </button>
          ))}
        </div>

        {/* 3D Canvas Container */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center relative">
          <canvas ref={canvasRef} className="w-full max-w-2xl h-72 cursor-grab active:cursor-grabbing rounded-xl" />
          <div className="absolute top-6 left-6 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700 pointer-events-none">
            🖱️ {L('माउस वा औंलाले 3D मोडेल घुमाउनुहोस्', 'Drag to rotate 3D solid in real-time')}
          </div>

          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                wireframe ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-300'
              }`}
            >
              {wireframe ? L('ठोस रूप (Solid)', 'Solid') : L('तार रूप (Wireframe)', 'Wireframe')}
            </button>
          </div>
        </div>

        {/* Solid Properties Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
            <div className="text-xs text-slate-400">{L('पृष्ठहरू (Faces)', 'Faces (F)')}</div>
            <div className="font-mono font-bold text-2xl text-amber-300 mt-1">{curMeta.faces}</div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
            <div className="text-xs text-slate-400">{L('किनाराहरू (Edges)', 'Edges (E)')}</div>
            <div className="font-mono font-bold text-2xl text-sky-300 mt-1">{curMeta.edges}</div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
            <div className="text-xs text-slate-400">{L('शीर्षबिन्दु (Vertices)', 'Vertices (V)')}</div>
            <div className="font-mono font-bold text-2xl text-purple-300 mt-1">{curMeta.vertices}</div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
            <div className="text-xs text-slate-400">{L('युलरको सूत्र (Euler Formula)', "Euler's Formula")}</div>
            <div className="font-mono font-bold text-sm text-emerald-300 mt-2">
              F + V - E = {curMeta.faces} + {curMeta.vertices} - {curMeta.edges} = 2 ✅
            </div>
          </div>
        </div>

        {/* Explanatory Details */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-2">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            {isNe ? curMeta.nameNp : curMeta.nameEn} – {L('विशेषताहरू', 'Key Properties')}
          </div>
          <p className="text-xs text-slate-200">
            {isNe ? curMeta.descNp : curMeta.descEn}
          </p>
          <div className="text-xs text-slate-400 pt-1">
            <span className="font-semibold text-slate-300">{L('आधारको आकार:', 'Base Shape:')} </span>
            {isNe ? curMeta.baseShapeNp : curMeta.baseShapeEn}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default SolidPrismPyramidExplorer3D;
