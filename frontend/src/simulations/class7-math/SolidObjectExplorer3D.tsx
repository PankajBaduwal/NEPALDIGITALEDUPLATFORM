/**
 * SolidObjectExplorer3D.tsx
 * Grade 7 Mathematics – Lesson 16: SOLID OBJECTS
 * Simulation 1: 3D Solid Object Explorer
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 245-250)
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Box, Layers, Eye, RotateCw, Check, Sparkles, Orbit } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'Tetrahedron (Tetrahedron) मा कतिpcs समबाहु त्रिकोणीय पृष्ठहरू (Faces) हुन्छन्?',
    en: 'How many equilateral triangular faces does a tetrahedron have?',
    options: [
      { key: 'A', label: '4 faces' },
      { key: 'B', label: '6 pcs' },
      { key: 'C', label: '8 pcs' },
      { key: 'D', label: '12 pcs' },
    ],
    answer: 'A',
  },
  {
    np: 'अष्टफलक (Octahedron) मा कतिpcs किनाराहरू (Edges) हुन्छन्?',
    en: 'How many edges does an octahedron have?',
    options: [
      { key: 'A', label: '12 pcs (Twelve edges)' },
      { key: 'B', label: '6 pcs' },
      { key: 'C', label: '8 pcs' },
      { key: 'D', label: '4 pcs' },
    ],
    answer: 'A',
  },
  {
    np: 'ठोस वस्तुको दुईpcs पृष्ठहरू जहाँ आपसमा जोडिन्छन्, त्यस रेखालाई के भनिन्छ?',
    en: 'The line segment where two faces of a solid meet is called:',
    options: [
      { key: 'A', label: 'Edge' },
      { key: 'B', label: 'Vertex' },
      { key: 'C', label: 'Diameter' },
      { key: 'D', label: 'Base' },
    ],
    answer: 'A',
  },
  {
    np: 'सलाईको बाकस वा इँटा कुन प्रकारको ठोस वस्तुको वास्तविक उदाहरण हो?',
    en: 'A matchbox or brick is a real-life example of which solid object?',
    options: [
      { key: 'A', label: 'Cuboid / cube' },
      { key: 'B', label: 'Cone' },
      { key: 'C', label: 'Cylinder' },
      { key: 'D', label: 'Tetrahedron' },
    ],
    answer: 'A',
  },
];

type SolidType = 'tetrahedron' | 'octahedron' | 'cube' | 'cone' | 'cylinder';

interface SolidMeta {
  id: SolidType;
  nameNp: string;
  nameEn: string;
  faces: number;
  edges: number;
  vertices: number;
  faceShapeNp: string;
  faceShapeEn: string;
  descNp: string;
}

const SOLIDS_DATA: Record<SolidType, SolidMeta> = {
  tetrahedron: {
    id: 'tetrahedron',
    nameNp: 'Tetrahedron (Tetrahedron)',
    nameEn: 'Tetrahedron',
    faces: 4,
    edges: 6,
    vertices: 4,
    faceShapeNp: 'समबाहु त्रिभुज (4 pcs)',
    faceShapeEn: 'Equilateral Triangles (4)',
    descNp: 'A regular solid with 4 equilateral triangular faces, 6 edges and 4 vertices.',
  },
  octahedron: {
    id: 'octahedron',
    nameNp: 'अष्टफलक (Octahedron)',
    nameEn: 'Octahedron',
    faces: 8,
    edges: 12,
    vertices: 6,
    faceShapeNp: 'समबाहु त्रिभुज (8 pcs)',
    faceShapeEn: 'Equilateral Triangles (8)',
    descNp: 'A regular solid with 8 equilateral triangular faces, 12 edges and 6 vertices.',
  },
  cube: {
    id: 'cube',
    nameNp: 'घन (Cube)',
    nameEn: 'Cube',
    faces: 6,
    edges: 12,
    vertices: 8,
    faceShapeNp: 'वर्ग (6 pcs)',
    faceShapeEn: 'Squares (6)',
    descNp: 'A solid with 6 square faces, 12 edges and 8 vertices.',
  },
  cone: {
    id: 'cone',
    nameNp: 'Cone (Cone)',
    nameEn: 'Cone',
    faces: 2, // 1 circular base + 1 curved
    edges: 1, // circular edge
    vertices: 1,
    faceShapeNp: '1 वृत्ताकार Base + 1 वक्र सतह',
    faceShapeEn: '1 Circular Base + 1 Curved Surface',
    descNp: 'A solid with 1 circular base, 1 curved surface and 1 vertex.',
  },
  cylinder: {
    id: 'cylinder',
    nameNp: 'Cylinder (Cylinder)',
    nameEn: 'Cylinder',
    faces: 3, // 2 circular bases + 1 curved
    edges: 2, // 2 circular edges
    vertices: 0,
    faceShapeNp: '2 समानान्तर वृत्ताकार Base + 1 वक्र सतह',
    faceShapeEn: '2 Parallel Circular Bases + 1 Curved Surface',
    descNp: 'A solid with 2 parallel circular bases, 1 curved surface and 0 vertices.',
  },
};

export const SolidObjectExplorer3D: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L16-01',
    chapter: 16,
    titleNp: '3D ठोस वस्तु अन्वेषक (3D Solid Explorer)',
    titleEn: '3D Solid Object Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeSolid, setActiveSolid] = useState<SolidType>('tetrahedron');
  const [isSkeletonMode, setIsSkeletonMode] = useState<boolean>(false);
  const [highlightTarget, setHighlightTarget] = useState<'none' | 'faces' | 'edges' | 'vertices'>('none');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const solidRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 360;
    const height = canvas.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);
    solidRef.current = group;

    // Create Mesh for activeSolid
    let geom: THREE.BufferGeometry;
    if (activeSolid === 'tetrahedron') {
      geom = new THREE.TetrahedronGeometry(1.6);
    } else if (activeSolid === 'octahedron') {
      geom = new THREE.OctahedronGeometry(1.6);
    } else if (activeSolid === 'cube') {
      geom = new THREE.BoxGeometry(2, 2, 2);
    } else if (activeSolid === 'cone') {
      geom = new THREE.ConeGeometry(1.3, 2.4, 32);
    } else {
      geom = new THREE.CylinderGeometry(1.1, 1.1, 2.2, 32);
    }

    const faceMat = new THREE.MeshStandardMaterial({
      color: highlightTarget === 'faces' ? 0x3b82f6 : 0x6366f1,
      roughness: 0.3,
      metalness: 0.1,
      transparent: isSkeletonMode,
      opacity: isSkeletonMode ? 0.08 : 0.85,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geom, faceMat);
    group.add(mesh);

    // Edges
    const edgesGeom = new THREE.EdgesGeometry(geom);
    const edgesMat = new THREE.LineBasicMaterial({
      color: highlightTarget === 'edges' ? 0xef4444 : 0x1e293b,
      linewidth: highlightTarget === 'edges' ? 3 : 2,
    });
    const edgeLines = new THREE.LineSegments(edgesGeom, edgesMat);
    group.add(edgeLines);

    // Vertex points as spheres
    const posAttr = geom.getAttribute('position');
    const vertexPoints: THREE.Vector3[] = [];
    const vMap = new Set<string>();

    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const key = `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`;
      if (!vMap.has(key)) {
        vMap.add(key);
        vertexPoints.push(v);
      }
    }

    const sphereGeom = new THREE.SphereGeometry(highlightTarget === 'vertices' ? 0.12 : 0.07, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: highlightTarget === 'vertices' ? 0x10b981 : 0xd97706,
    });

    vertexPoints.forEach((pt) => {
      const s = new THREE.Mesh(sphereGeom, sphereMat);
      s.position.copy(pt);
      group.add(s);
    });

    // Gentle Auto-rotation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      group.rotation.y += 0.008;
      group.rotation.x += 0.004;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      geom.dispose();
      faceMat.dispose();
      edgesGeom.dispose();
      edgesMat.dispose();
      sphereGeom.dispose();
      sphereMat.dispose();
    };
  }, [activeSolid, isSkeletonMode, highlightTarget]);

  const currentMeta = SOLIDS_DATA[activeSolid];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! ठोस वस्तुहरू (Solid Objects) का पृष्ठ (Faces), किनारा (Edges) र शीर्षबिन्दु (Vertices) 3D मा प्रत्यक्ष हेरौँ र नापौँ!',
        'Hello! Explore 3D solid objects: count faces, edges, and vertices interactively with real 3D geometry!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Solid Picker Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {(Object.keys(SOLIDS_DATA) as SolidType[]).map((st) => {
            const item = SOLIDS_DATA[st];
            return (
              <button
                key={st}
                onClick={() => {
                  setActiveSolid(st);
                  setHighlightTarget('none');
                }}
                className={`p-3 rounded-xl font-bold text-xs text-center transition-all shadow-sm ${
                  activeSolid === st
                    ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                    : 'bg-white text-slate-700 hover:bg-indigo-100'
                }`}
              >
                <div>{isNe ? item.nameNp.split(' ')[0] : item.nameEn}</div>
                <div className="text-[10px] opacity-80 mt-0.5">({item.faces} face)</div>
              </button>
            );
          })}
        </div>

        {/* 3D Workspace and Inspection Controls */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* 3D Canvas Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col items-center shadow-2xl relative overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-72 rounded-2xl cursor-grab" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/80 text-white backdrop-blur-md">
                  3D View
                </span>
                {isSkeletonMode && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/80 text-white backdrop-blur-md">
                    Skeleton mode
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                <Orbit className="w-3.5 h-3.5 text-indigo-400" />
                {L('3D वस्तु स्वचालित घुमिरहेको छ', '3D model auto-rotating')}
              </div>
            </div>

            {/* Inspection Metrics and Highlights */}
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
                <h3 className="text-base font-bold text-indigo-950" style={{ fontFamily: FONT_NP }}>
                  {isNe ? currentMeta.nameNp : currentMeta.nameEn}
                </h3>
                <p className="text-xs text-indigo-800 mt-1">{currentMeta.descNp}</p>
              </div>

              {/* Component Highlighting Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setHighlightTarget(highlightTarget === 'faces' ? 'none' : 'faces')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    highlightTarget === 'faces'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-semibold">{L('पृष्ठहरू (Faces)', 'Faces')}</div>
                  <div className="text-xl font-black mt-0.5">{toNp(currentMeta.faces)}</div>
                </button>

                <button
                  onClick={() => setHighlightTarget(highlightTarget === 'edges' ? 'none' : 'edges')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    highlightTarget === 'edges'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-semibold">{L('किनाराहरू (Edges)', 'Edges')}</div>
                  <div className="text-xl font-black mt-0.5">{toNp(currentMeta.edges)}</div>
                </button>

                <button
                  onClick={() => setHighlightTarget(highlightTarget === 'vertices' ? 'none' : 'vertices')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    highlightTarget === 'vertices'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-semibold">{L('शीर्षहरू (Vertices)', 'Vertices')}</div>
                  <div className="text-xl font-black mt-0.5">{toNp(currentMeta.vertices)}</div>
                </button>
              </div>

              {/* Skeleton Mode Toggle */}
              <button
                onClick={() => setIsSkeletonMode(!isSkeletonMode)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs border border-slate-300 flex items-center justify-center gap-2 shadow-sm"
              >
                <Layers className="w-4 h-4 text-indigo-600" />
                {isSkeletonMode
                  ? L('ठोस पृष्ठहरू देखाउनुहोस् (Solid Faces)', 'Show Solid Faces')
                  : L('कंकाल मोड (Skeleton Model) मा हेर्नुहोस्', 'View Skeleton Model (Edges & Vertices only)')}
              </button>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                <span className="font-bold">{L('पृष्ठको समतलीय आकार:', 'Shape of Faces:')}</span>{' '}
                {isNe ? currentMeta.faceShapeNp : currentMeta.faceShapeEn}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default SolidObjectExplorer3D;
