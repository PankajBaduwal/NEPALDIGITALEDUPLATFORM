/**
 * ConeCylinderDiscoveryLab.tsx
 * Grade 7 Mathematics – Lesson 16: SOLID OBJECTS
 * Simulation 3: Cone and Cylinder Discovery Lab
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 252-254)
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Layers, Check, CheckCircle2, RotateCw, Sparkles, Scissors } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'Cone मा कतिpcs Circular base and कतिpcs Vertex हुन्छन्?',
    en: 'In a cone, how many circular bases and vertices are there?',
    options: [
      { key: 'A', label: '1 circular base and 1 vertex' },
      { key: 'B', label: '2 circular base and 0 vertex' },
      { key: 'C', label: '1 circular base and 0 vertex' },
      { key: 'D', label: '2 circular base and 1 vertex' },
    ],
    answer: 'A',
  },
  {
    np: 'Cylinder का दुईpcs circular baseहरूको सम्बन्ध कस्तो हुन्छ?',
    en: 'What is the geometric relationship between the two circular bases of a cylinder?',
    options: [
      { key: 'A', label: 'Parallel and equal' },
      { key: 'B', label: 'Crossing each other' },
      { key: 'C', label: 'Of different sizes' },
      { key: 'D', label: 'At an angle of 90°' },
    ],
    answer: 'A',
  },
  {
    np: 'कागजको आयताकार पानालाई घुमाएर (Roll) दुई छेउ जोड्दा कुन ठोस वस्तुको वक्र सतह बन्छ?',
    en: 'Rolling a rectangular sheet of paper and joining opposite edges forms the curved surface of what solid?',
    options: [
      { key: 'A', label: 'Cylinder' },
      { key: 'B', label: 'Cone' },
      { key: 'C', label: 'Cube' },
      { key: 'D', label: 'Sphere' },
    ],
    answer: 'A',
  },
  {
    np: 'खानेपानीको पाइप, ड्रम and ग्यास सिलिन्डर कुन ठोस आकारका उदाहरण हुन्?',
    en: 'Water pipes, drums, and gas cylinders are real-life examples of which solid?',
    options: [
      { key: 'A', label: 'Cylinder' },
      { key: 'B', label: 'Cone' },
      { key: 'C', label: 'Tetrahedron' },
      { key: 'D', label: 'Octahedron' },
    ],
    answer: 'A',
  },
];

type SolidTab = 'explore_3d' | 'paper_construction' | 'comparison' | 'real_life';

export const ConeCylinderDiscoveryLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L16-03',
    chapter: 16,
    titleNp: 'शङ्कु and बेलना खोजी प्रयोगशाला (Cone & Cylinder Lab)',
    titleEn: 'Cone and Cylinder Discovery Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [tab, setTab] = useState<SolidTab>('explore_3d');
  const [activeModel, setActiveModel] = useState<'cone' | 'cylinder'>('cone');
  const [paperStep, setPaperStep] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || tab !== 'explore_3d') return;

    const width = canvas.clientWidth || 320;
    const height = canvas.clientHeight || 260;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(3, 5, 4);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const group = new THREE.Group();
    scene.add(group);

    let geom: THREE.BufferGeometry;
    if (activeModel === 'cone') {
      geom = new THREE.ConeGeometry(1.3, 2.4, 32);
    } else {
      geom = new THREE.CylinderGeometry(1.1, 1.1, 2.2, 32);
    }

    const mat = new THREE.MeshStandardMaterial({
      color: activeModel === 'cone' ? 0xf59e0b : 0x10b981,
      roughness: 0.3,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geom, mat);
    group.add(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geom),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.5 })
    );
    group.add(edges);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      group.rotation.y += 0.009;
      group.rotation.x += 0.004;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      geom.dispose();
      mat.dispose();
      edges.geometry.dispose();
    };
  }, [activeModel, tab]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! Cone and Cylinder का वक्र सतह and circular baseहरू 3D तथा कागज निर्माणबाट अध्ययन गरौँ!',
        'Hello! Explore curved surfaces and circular bases of cones and cylinders through 3D models and paper construction!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'explore_3d', np: '1. 3D ठोस अन्वेषक (3D Explorer)', en: '1. 3D Model Explorer' },
            { id: 'paper_construction', np: '2. कागजबाट बनाउने विधि (Paper Construction)', en: '2. Paper Construction' },
            { id: 'comparison', np: '3. शङ्कु and बेलना तुलना (Comparison)', en: '3. Cone vs Cylinder' },
            { id: 'real_life', np: '4. दैनिक जीवनका उदाहरण (Real-Life Objects)', en: '4. Real-Life Objects' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as SolidTab)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {isNe ? t.np : t.en}
            </button>
          ))}
        </div>

        {/* Tab 1: 3D Model Explorer */}
        {tab === 'explore_3d' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActiveModel('cone')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                  activeModel === 'cone'
                    ? 'bg-amber-600 text-white shadow-amber-200 ring-2 ring-amber-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {L('Cone', 'Cone (3D)')}
              </button>
              <button
                onClick={() => setActiveModel('cylinder')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                  activeModel === 'cylinder'
                    ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {L('Cylinder', 'Cylinder (3D)')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col items-center shadow-2xl">
                <canvas ref={canvasRef} className="w-full h-64 rounded-2xl cursor-grab" />
                <div className="text-xs text-slate-400 mt-2">
                  {activeModel === 'cone' ? L('शङ्कु 3D मोडेल', '3D Cone Model') : L('बेलना 3D मोडेल', '3D Cylinder Model')}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                  <div className="text-base font-bold text-slate-900" style={{ fontFamily: FONT_NP }}>
                    {activeModel === 'cone' ? L('Cone का गुणहरू:', 'Cone Characteristics:') : L('Cylinder का गुणहरू:', 'Cylinder Characteristics:')}
                  </div>
                  <ul className="text-xs md:text-sm text-slate-700 space-y-2">
                    {activeModel === 'cone' ? (
                      <>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>1. Vertex = 1 pcs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>2. Circular base = 1 pcs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>3. Curved surface = 1 pcs</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>1. Vertex = 0 pcs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>2. समानान्तर circular base = 2 pcs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>3. Curved surface = 1 pcs</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Paper Construction */}
        {tab === 'paper_construction' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
              <h3 className="text-base font-bold text-indigo-950" style={{ fontFamily: FONT_NP }}>
                {L('पाठ्यपुस्तकको कागज निर्माण गतिविधि (CDC Paper Construction Activities):', 'Paper Folding Construction:')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cone Paper Construction */}
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                <div className="text-xs font-black text-amber-900 uppercase">
                  {L('विधि 1: कागजबाट शङ्कु बनाउने', 'Method 1: Making a Cone')}
                </div>
                <div className="h-32 flex items-center justify-center">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="45" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
                    {/* 1/4 sector cut out */}
                    <path d="M 60 60 L 60 15 A 45 45 0 0 1 105 60 Z" fill="#ffffff" stroke="#d97706" strokeWidth="2" />
                    <line x1="60" y1="60" x2="60" y2="15" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2" />
                    <line x1="60" y1="60" x2="105" y2="60" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2" />
                  </svg>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {L(
                    'वृत्ताकार कागजको 1/4 भाग काटी बाँकी 3/4 भागको किनारा जोड्दा शङ्कुको वक्र सतह बन्छ।',
                    'Cut 1/4 of a circle, roll the remaining 3/4 sector and join straight edges to form a cone.'
                  )}
                </p>
              </div>

              {/* Cylinder Paper Construction */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="text-xs font-black text-emerald-900 uppercase">
                  {L('विधि 2: कागजबाट बेलना बनाउने', 'Method 2: Making a Cylinder')}
                </div>
                <div className="h-32 flex items-center justify-center">
                  <svg width="140" height="100" viewBox="0 0 140 100">
                    <rect x="20" y="20" width="100" height="60" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
                    <line x1="20" y1="20" x2="20" y2="80" stroke="#ef4444" strokeWidth="3" />
                    <line x1="120" y1="20" x2="120" y2="80" stroke="#ef4444" strokeWidth="3" />
                  </svg>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {L(
                    'आयताकार कागजलाई घुमाएर (Roll) आमने-सामनेका किनारा जोड्दा बेलनाको वक्र सतह बन्छ।',
                    'Roll a rectangular paper sheet and join opposite edges to create the curved surface of a cylinder.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Comparison */}
        {tab === 'comparison' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
              <h3 className="text-base font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
                {L('शङ्कु and बेलना बीचको तुलना तालिका (Comparison):', 'Cone vs Cylinder Comparison:')}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                <thead className="bg-slate-200 text-slate-800 font-bold">
                  <tr>
                    <th className="p-3 border-r border-slate-300">{L('गुण / विशेषता', 'Property')}</th>
                    <th className="p-3 border-r border-slate-300">{L('Cone', 'Cone')}</th>
                    <th className="p-3">{L('Cylinder', 'Cylinder')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-indigo-50/50">
                    <td className="p-3 font-bold border-r border-slate-200">{L('circular base संख्या', 'Circular Bases')}</td>
                    <td className="p-3 font-bold text-amber-700 border-r border-slate-200">1 pcs</td>
                    <td className="p-3 font-bold text-emerald-700">2 pcs (parallel and equal)</td>
                  </tr>
                  <tr className="hover:bg-indigo-50/50">
                    <td className="p-3 font-bold border-r border-slate-200">{L('वक्र सतह संख्या', 'Curved Surface')}</td>
                    <td className="p-3 font-bold text-amber-700 border-r border-slate-200">1 pcs</td>
                    <td className="p-3 font-bold text-emerald-700">1 pcs</td>
                  </tr>
                  <tr className="hover:bg-indigo-50/50">
                    <td className="p-3 font-bold border-r border-slate-200">{L('vertex संख्या (Vertices)', 'Vertices')}</td>
                    <td className="p-3 font-bold text-amber-700 border-r border-slate-200">1 pcs</td>
                    <td className="p-3 font-bold text-emerald-700">0 pcs (no corners)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Real-Life Objects */}
        {tab === 'real_life' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <h3 className="text-base font-bold text-amber-950" style={{ fontFamily: FONT_NP }}>
                {L('पाठ्यपुस्तकका दैनिक जीवनका शङ्कु and बेलना आकारहरू:', 'Real-Life Cones & Cylinders:')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl space-y-2">
                <div className="font-bold text-sm text-amber-900">{L('शङ्कु आकार (Cone Examples):', 'Cone Examples:')}</div>
                <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                  <li>Ice-cream cone</li>
                  <li>Traffic cone</li>
                  <li>Birthday party cap</li>
                  <li>Conical fishing basket</li>
                </ul>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-2xl space-y-2">
                <div className="font-bold text-sm text-emerald-900">{L('बेलना आकार (Cylinder Examples):', 'Cylinder Examples:')}</div>
                <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                  <li>Water pipe</li>
                  <li>Drum</li>
                  <li>Water tank</li>
                  <li>Gas cylinder</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ConeCylinderDiscoveryLab;
