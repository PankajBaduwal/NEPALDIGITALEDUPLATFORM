/**
 * PolyhedraEulerRelationLab.tsx
 * Grade 7 Mathematics – Lesson 16: SOLID OBJECTS (ठोस वस्तुहरू)
 * Simulation 2: Regular Polyhedra and Euler's Relation Lab (नियमित बहुफलक र ओइलरको सम्बन्ध)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 247-251)
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Calculator, Check, CheckCircle2, RotateCcw, Shuffle, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'नियमित बहुफलकहरूमा शीर्ष (V), किनारा (E) र पृष्ठ (F) बीचको ओइलरको सम्बन्ध (Euler\'s Relation) कुन हो?',
    en: 'What is Euler\'s relation connecting vertices (V), edges (E), and faces (F) of regular polyhedra?',
    options: [
      { key: 'A', label: 'V − E + F = २' },
      { key: 'B', label: 'V + E + F = २' },
      { key: 'C', label: 'V + E − F = २' },
      { key: 'D', label: 'V − E − F = २' },
    ],
    answer: 'A',
  },
  {
    np: 'द्वादशफलक (Dodecahedron) मा कतिवटा पृष्ठहरू (Faces) हुन्छन्?',
    en: 'How many faces does a regular dodecahedron have?',
    options: [
      { key: 'A', label: '१२ वटा (Twelve pentagonal faces)' },
      { key: 'B', label: '२० वटा' },
      { key: 'C', label: '३० वटा' },
      { key: 'D', label: '८ वटा' },
    ],
    answer: 'A',
  },
  {
    np: 'विंशतिफलक (Icosahedron) मा २० पृष्ठ र ३० किनारा छन् भने शीर्षबिन्दु (V) कति हुन्छन्? (V = २ + E − F)',
    en: 'An icosahedron has 20 faces and 30 edges. Using Euler\'s relation, how many vertices (V) does it have?',
    options: [
      { key: 'A', label: '१२ वटा (२ + ३० − २० = १२)' },
      { key: 'B', label: '२० वटा' },
      { key: 'C', label: '१० वटा' },
      { key: 'D', label: '१४ वटा' },
    ],
    answer: 'A',
  },
  {
    np: 'अष्टफलक (Octahedron) मा ओइलरको सम्बन्ध परीक्षण गर्दा: V − E + F = ?',
    en: 'Testing Euler\'s relation for an octahedron (V = 6, E = 12, F = 8): V − E + F = ?',
    options: [
      { key: 'A', label: '२ (६ − १२ + ८ = २)' },
      { key: 'B', label: '०' },
      { key: 'C', label: '४' },
      { key: 'D', label: '६' },
    ],
    answer: 'A',
  },
];

type PolyType = 'cube' | 'tetrahedron' | 'octahedron' | 'dodecahedron' | 'icosahedron';

interface PolyRecord {
  id: PolyType;
  nameNp: string;
  nameEn: string;
  v: number;
  e: number;
  f: number;
}

const POLYHEDRA_LIST: PolyRecord[] = [
  { id: 'cube', nameNp: 'घन (Cube)', nameEn: 'Cube', v: 8, e: 12, f: 6 },
  { id: 'tetrahedron', nameNp: 'चतुष्फलक (Tetrahedron)', nameEn: 'Tetrahedron', v: 4, e: 6, f: 4 },
  { id: 'octahedron', nameNp: 'अष्टफलक (Octahedron)', nameEn: 'Octahedron', v: 6, e: 12, f: 8 },
  { id: 'dodecahedron', nameNp: 'द्वादशफलक (Dodecahedron)', nameEn: 'Dodecahedron', v: 20, e: 30, f: 12 },
  { id: 'icosahedron', nameNp: 'विंशतिफलक (Icosahedron)', nameEn: 'Icosahedron', v: 12, e: 30, f: 20 },
];

export const PolyhedraEulerRelationLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L16-02',
    chapter: 16,
    titleNp: 'नियमित बहुफलक र ओइलरको सम्बन्ध (Euler\'s Relation Lab)',
    titleEn: 'Regular Polyhedra and Euler\'s Relation Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activePoly, setActivePoly] = useState<PolyType>('tetrahedron');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Missing Value Calculator state
  const [calcV, setCalcV] = useState<string>('4');
  const [calcE, setCalcE] = useState<string>('6');
  const [resultF, setResultF] = useState<number | null>(4);

  const handleComputeF = () => {
    const vNum = parseInt(calcV, 10);
    const eNum = parseInt(calcE, 10);
    if (!isNaN(vNum) && !isNaN(eNum)) {
      // V - E + F = 2  =>  F = 2 - V + E
      setResultF(2 - vNum + eNum);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
    if (activePoly === 'cube') geom = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    else if (activePoly === 'tetrahedron') geom = new THREE.TetrahedronGeometry(1.6);
    else if (activePoly === 'octahedron') geom = new THREE.OctahedronGeometry(1.6);
    else if (activePoly === 'dodecahedron') geom = new THREE.DodecahedronGeometry(1.5);
    else geom = new THREE.IcosahedronGeometry(1.6);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.75,
    });
    const mesh = new THREE.Mesh(geom, mat);
    group.add(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geom),
      new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
    );
    group.add(edges);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      group.rotation.y += 0.009;
      group.rotation.x += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      geom.dispose();
      mat.dispose();
    };
  }, [activePoly]);

  const currentPoly = POLYHEDRA_LIST.find((p) => p.id === activePoly) || POLYHEDRA_LIST[1];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! पाँच नियमित बहुफलकहरूमा शीर्ष (V), किनारा (E) र पृष्ठ (F) बीचको सम्बन्ध सधैं V − E + F = २ हुन्छ। जाचौँ!',
        'Hello! In all regular polyhedra, the famous Euler\'s formula always holds: V − E + F = 2. Let us verify!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Polyhedra Picker */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {POLYHEDRA_LIST.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePoly(p.id)}
              className={`p-3 rounded-xl font-bold text-xs text-center transition-all ${
                activePoly === p.id
                  ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              <div>{isNe ? p.nameNp.split(' ')[0] : p.nameEn}</div>
              <div className="text-[10px] opacity-80 mt-0.5">V={p.v}, E={p.e}, F={p.f}</div>
            </button>
          ))}
        </div>

        {/* 3D Visual & Live Euler's Verification */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* 3D Model Display */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col items-center shadow-2xl">
              <canvas ref={canvasRef} className="w-full h-64 rounded-2xl cursor-grab" />
              <div className="text-xs text-slate-400 mt-2">
                {isNe ? currentPoly.nameNp : currentPoly.nameEn} (३D मोडेल)
              </div>
            </div>

            {/* Euler formula step-by-step box */}
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
                <h3 className="text-base font-bold text-indigo-950" style={{ fontFamily: FONT_NP }}>
                  {L('ओइलरको सम्बन्ध (Euler\'s Relation): V − E + F = २', 'Euler\'s Relation: V − E + F = 2')}
                </h3>
                <p className="text-xs text-indigo-800 mt-1">
                  {L(
                    'कुनै पनि नियमित बहुफलकमा शीर्ष संख्या (V) बाट किनारा संख्या (E) घटाएर पृष्ठ संख्या (F) जोड्दा सधैं २ आउँछ।',
                    'Subtracting edges (E) from vertices (V) and adding faces (F) always equals 2.'
                  )}
                </p>
              </div>

              {/* Live arithmetic verification for activePoly */}
              <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl space-y-2">
                <div className="text-sm font-bold text-emerald-950">
                  {isNe ? currentPoly.nameNp : currentPoly.nameEn} मा परीक्षण:
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <div>शीर्षबिन्दु (V) = <b>{currentPoly.v}</b></div>
                  <div>किनारा (E) = <b>{currentPoly.e}</b></div>
                  <div>पृष्ठ (F) = <b>{currentPoly.f}</b></div>
                </div>
                <div className="text-xl font-black text-emerald-900 pt-2 border-t border-emerald-200">
                  {currentPoly.v} − {currentPoly.e} + {currentPoly.f} ={' '}
                  <span className="text-blue-700">{currentPoly.v - currentPoly.e + currentPoly.f}</span>
                </div>
                <div className="text-xs text-emerald-700 font-bold">
                  ✓ {L('सम्बन्ध पूर्ण रूपमा प्रमाणित भयो (V − E + F = २)', 'Relation verified successfully (V − E + F = 2)')}
                </div>
              </div>
            </div>
          </div>

          {/* Complete CDC Textbook Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
              <thead className="bg-slate-200 text-slate-800 font-bold">
                <tr>
                  <th className="p-2.5 text-left border-r border-slate-300">{L('ठोस वस्तु (Solid Object)', 'Solid Object')}</th>
                  <th className="p-2.5 border-r border-slate-300">{L('शीर्ष (V)', 'Vertices (V)')}</th>
                  <th className="p-2.5 border-r border-slate-300">{L('किनारा (E)', 'Edges (E)')}</th>
                  <th className="p-2.5 border-r border-slate-300">{L('पृष्ठ (F)', 'Faces (F)')}</th>
                  <th className="p-2.5">{L('ओइलर सूत्र (V − E + F)', 'V − E + F')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {POLYHEDRA_LIST.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setActivePoly(p.id)}
                    className={`cursor-pointer hover:bg-indigo-50/50 ${
                      p.id === activePoly ? 'bg-indigo-50 font-bold' : ''
                    }`}
                  >
                    <td className="p-2.5 text-left border-r border-slate-200">
                      {isNe ? p.nameNp : p.nameEn}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-bold text-blue-700">{toNp(p.v)}</td>
                    <td className="p-2.5 border-r border-slate-200 font-bold text-rose-700">{toNp(p.e)}</td>
                    <td className="p-2.5 border-r border-slate-200 font-bold text-amber-700">{toNp(p.f)}</td>
                    <td className="p-2.5 font-black text-emerald-700">
                      {p.v} − {p.e} + {p.f} = <b>२</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Missing Component Solver */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase">
              {L('अज्ञात पृष्ठ संख्या पत्ता लगाउने क्यालकुलेटर (Find Missing Faces F):', 'Find Missing Component:')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {L('शीर्ष (V):', 'Vertices (V):')}
                </label>
                <input
                  type="number"
                  value={calcV}
                  onChange={(e) => setCalcV(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {L('किनारा (E):', 'Edges (E):')}
                </label>
                <input
                  type="number"
                  value={calcE}
                  onChange={(e) => setCalcE(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-sm"
                />
              </div>
              <div>
                <button
                  onClick={handleComputeF}
                  className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  {L('पृष्ठ (F) निकाल्नुहोस्', 'Compute Faces F')}
                </button>
              </div>
            </div>

            {resultF !== null && (
              <div className="text-xs text-emerald-800 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                सूत्र: F = २ − V + E = २ − {calcV} + {calcE} = <span className="text-base font-black">{resultF}</span> पृष्ठ
              </div>
            )}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default PolyhedraEulerRelationLab;
