import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Trophy, CheckCircle, RefreshCw, Layers, Award } from 'lucide-react';

interface SolidChallengeItem {
  id: string;
  nameNp: string;
  nameEn: string;
  type: 'triangular_prism' | 'square_pyramid' | 'tetrahedron' | 'cube' | 'cylinder' | 'cone';
  faces: number;
  edges: number;
  vertices: number;
  realLifeNp: string;
  realLifeEn: string;
  netDescriptionNp: string;
  netDescriptionEn: string;
}

const SOLID_ITEMS: SolidChallengeItem[] = [
  {
    id: 'c1',
    nameNp: 'त्रिभुजाकार प्रिज्म (Triangular Prism)',
    nameEn: 'Triangular Prism',
    type: 'triangular_prism',
    faces: 5,
    edges: 9,
    vertices: 6,
    realLifeNp: 'टोब्लेरोन चकलेटको बाकस वा क्याम्पिङ टेन्ट (Camping Tent / Toblerone box)',
    realLifeEn: 'Camping tent or triangular packaging box',
    netDescriptionNp: '२ वटा त्रिभुज र ३ वटा आयत',
    netDescriptionEn: '2 Triangles and 3 Rectangles'
  },
  {
    id: 'c2',
    nameNp: 'वर्गाकार पिरामिड (Square Pyramid)',
    nameEn: 'Square Pyramid',
    type: 'square_pyramid',
    faces: 5,
    edges: 8,
    vertices: 5,
    realLifeNp: 'इजिप्टको पिरामिड वा मन्दिरको गजुर आकारको छाना (Egyptian Pyramid / Temple Roof)',
    realLifeEn: 'Egyptian Pyramid or pointed temple roof',
    netDescriptionNp: '१ वर्ग र ४ वटा त्रिभुज',
    netDescriptionEn: '1 Square and 4 Triangles'
  },
  {
    id: 'c3',
    nameNp: 'घन (Cube)',
    nameEn: 'Cube',
    type: 'cube',
    faces: 6,
    edges: 12,
    vertices: 8,
    realLifeNp: 'लुडोको गोटी वा रुबिक्स क्युब (Ludo Dice / Rubik\'s Cube)',
    realLifeEn: 'Playing dice or Rubik\'s Cube',
    netDescriptionNp: '६ वटा बराबर वर्गहरू',
    netDescriptionEn: '6 Identical Squares'
  },
  {
    id: 'c4',
    nameNp: 'बेलन (Cylinder)',
    nameEn: 'Cylinder',
    type: 'cylinder',
    faces: 3,
    edges: 2,
    vertices: 0,
    realLifeNp: 'पानीको पाइप वा चिसो पेय पदार्थको टिनको क्यान (Soda Can / Water Pipe)',
    realLifeEn: 'Soda tin can or circular pipe',
    netDescriptionNp: '२ वटा वृत्त र १ वटा आयत',
    netDescriptionEn: '2 Circles and 1 Rectangle'
  },
  {
    id: 'c5',
    nameNp: 'शङ्कु (Cone)',
    nameEn: 'Cone',
    type: 'cone',
    faces: 2,
    edges: 1,
    vertices: 1,
    realLifeNp: 'आइसक्रिम कोन वा जन्मदिनको टोपी (Ice Cream Cone / Birthday Hat)',
    realLifeEn: 'Ice cream cone or birthday party hat',
    netDescriptionNp: '१ वृत्त र १ वृत्तखण्ड',
    netDescriptionEn: '1 Circle and 1 Circular Sector'
  }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'लुडोको गोटी (Dice) कुन ठोस वस्तुको वास्तविक उदाहरण हो?',
    en: 'A playing dice is a real-life example of which 3D solid?',
    options: [
      { key: 'A', label: 'घन (Cube)' },
      { key: 'B', label: 'घनाभ (Cuboid)' },
      { key: 'C', label: 'बेलन (Cylinder)' },
      { key: 'D', label: 'प्रिज्म (Prism)' },
    ],
    answer: 'A',
  },
  {
    np: '२ वटा त्रिभुज र ३ वटा आयत मिलेर बन्ने जालोबाट कुन ठोस वस्तु बन्दछ?',
    en: 'Which solid is formed by a net of 2 triangles and 3 rectangles?',
    options: [
      { key: 'A', label: 'त्रिभुजाकार प्रिज्म (Triangular Prism)' },
      { key: 'B', label: 'चतुष्फलक' },
      { key: 'C', label: 'पिरामिड' },
      { key: 'D', label: 'घनाभ' },
    ],
    answer: 'A',
  },
  {
    np: 'युलरको सूत्र (Euler\'s Formula) अनुसार F + V - E को मान सधैं कति हुन्छ?',
    en: 'According to Euler\'s Formula, what is the value of F + V - E for simple polyhedra?',
    options: [
      { key: 'A', label: '२ (Always 2)' },
      { key: 'B', label: '०' },
      { key: 'C', label: '४' },
      { key: 'D', label: '६' },
    ],
    answer: 'A',
  }
];

export const SolidGeometryChallengeWorld3D: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U16-03',
    chapter: 16,
    titleNp: '३D ठोस ज्यामिति चुनौती संसार',
    titleEn: '3D Solid Geometry Challenge World',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'inspect' | 'count_challenge' | 'reallife'>('inspect');

  // Counting inputs
  const [userF, setUserF] = useState<string>('');
  const [userE, setUserE] = useState<string>('');
  const [userV, setUserV] = useState<string>('');
  const [countVerdict, setCountVerdict] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const curSolid = SOLID_ITEMS[currentIndex];

  // 3D Rendering of currently active solid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.5, 3, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 0.5);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const group = new THREE.Group();
    scene.add(group);

    let geom: THREE.BufferGeometry;
    if (curSolid.type === 'triangular_prism') {
      geom = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 3);
    } else if (curSolid.type === 'square_pyramid') {
      geom = new THREE.ConeGeometry(1.5, 2.2, 4);
    } else if (curSolid.type === 'cube') {
      geom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    } else if (curSolid.type === 'cone') {
      geom = new THREE.ConeGeometry(1.2, 2.2, 24);
    } else {
      geom = new THREE.CylinderGeometry(1.0, 1.0, 2.2, 24);
    }

    const mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const mesh = new THREE.Mesh(geom, mat);
    group.add(mesh);

    const edgesGeom = new THREE.EdgesGeometry(geom);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const edgesLine = new THREE.LineSegments(edgesGeom, edgesMat);
    group.add(edgesLine);

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
      geom.dispose();
      mat.dispose();
      edgesGeom.dispose();
      edgesMat.dispose();
      renderer.dispose();
    };
  }, [currentIndex]);

  const handleVerifyCount = () => {
    const f = parseInt(userF);
    const e = parseInt(userE);
    const v = parseInt(userV);

    if (f === curSolid.faces && e === curSolid.edges && v === curSolid.vertices) {
      setCountVerdict('correct');
      kit.good();
    } else {
      setCountVerdict('incorrect');
      kit.oops();
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! ३D ठोस वस्तुहरूको पहिचान, पृष्ठ र किनारा गणना, तथा दैनिक जीवनका उदाहरणहरूको चुनौती जित्नुहोस्!',
        'Hello! Test your skills on 3D solid identification, face/edge/vertex counting, and real-life object matching!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Solid Navigation Pill Bar */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          {SOLID_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentIndex(idx);
                setUserF('');
                setUserE('');
                setUserV('');
                setCountVerdict(null);
              }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                currentIndex === idx
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isNe ? item.nameNp.split(' ')[0] : item.nameEn}
            </button>
          ))}
        </div>

        {/* Activity Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('inspect')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold ${
              activeTab === 'inspect' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {L('१. ३D निरीक्षण (3D Inspection)', '1. 3D Inspection')}
          </button>
          <button
            onClick={() => setActiveTab('count_challenge')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold ${
              activeTab === 'count_challenge' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {L('२. F, E, V गणना चुनौती', '2. Count F, E, V')}
          </button>
          <button
            onClick={() => setActiveTab('reallife')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold ${
              activeTab === 'reallife' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {L('३. दैनिक जीवनका उदाहरण (Real Life)', '3. Real-Life Examples')}
          </button>
        </div>

        {/* 3D Model Display */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center relative">
          <canvas ref={canvasRef} className="w-full max-w-2xl h-72 cursor-grab active:cursor-grabbing rounded-xl" />
          <div className="absolute top-6 left-6 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700 pointer-events-none">
            🖱️ {L('माउस वा टचले ३D मोडेल घुमाउनुहोस्', 'Drag to rotate 3D model')}
          </div>
        </div>

        {/* Tab 1: Inspect Properties */}
        {activeTab === 'inspect' && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
              <div className="text-xs text-slate-400">{L('पृष्ठ (Faces)', 'Faces (F)')}</div>
              <div className="font-mono font-bold text-2xl text-amber-300 mt-1">{curSolid.faces}</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
              <div className="text-xs text-slate-400">{L('किनारा (Edges)', 'Edges (E)')}</div>
              <div className="font-mono font-bold text-2xl text-sky-300 mt-1">{curSolid.edges}</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
              <div className="text-xs text-slate-400">{L('शीर्षबिन्दु (Vertices)', 'Vertices (V)')}</div>
              <div className="font-mono font-bold text-2xl text-purple-300 mt-1">{curSolid.vertices}</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
              <div className="text-xs text-slate-400">{L('जालोको संरचना', 'Net Faces')}</div>
              <div className="text-xs font-semibold text-emerald-300 mt-2">
                {isNe ? curSolid.netDescriptionNp : curSolid.netDescriptionEn}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Count Challenge */}
        {activeTab === 'count_challenge' && (
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {isNe ? curSolid.nameNp : curSolid.nameEn} – {L('पृष्ठ, किनारा र शीर्षबिन्दु गणना गर्नुहोस्', 'Enter Faces, Edges, and Vertices')}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-semibold">{L('पृष्ठ (F) =', 'Faces (F) =')}</span>
                <input
                  type="number"
                  value={userF}
                  onChange={(e) => setUserF(e.target.value)}
                  placeholder="?"
                  className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm text-center"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-semibold">{L('किनारा (E) =', 'Edges (E) =')}</span>
                <input
                  type="number"
                  value={userE}
                  onChange={(e) => setUserE(e.target.value)}
                  placeholder="?"
                  className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm text-center"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-semibold">{L('शीर्षबिन्दु (V) =', 'Vertices (V) =')}</span>
                <input
                  type="number"
                  value={userV}
                  onChange={(e) => setUserV(e.target.value)}
                  placeholder="?"
                  className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm text-center"
                />
              </div>

              <button
                onClick={handleVerifyCount}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all"
              >
                {L('जाँच गर्नुहोस्', 'Verify')}
              </button>
            </div>

            {countVerdict && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold ${
                  countVerdict === 'correct'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {countVerdict === 'correct'
                  ? L(`🎉 बधाई छ! सही उत्तर: F = ${curSolid.faces}, E = ${curSolid.edges}, V = ${curSolid.vertices}`, `🎉 Correct! F = ${curSolid.faces}, E = ${curSolid.edges}, V = ${curSolid.vertices}`)
                  : L(`❌ मिलेन! पुनः प्रयास गर्नुहोस्। (युलर सूत्र: F + V - E = २ हुनुपर्छ)`, '❌ Incorrect. Please count again!')}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Real Life Examples */}
        {activeTab === 'reallife' && (
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {L('दैनिक जीवनमा पाइने वास्तविक उदाहरणहरू', 'Real-Life Physical World Examples')}
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-slate-100 font-semibold">
              📦 {isNe ? curSolid.realLifeNp : curSolid.realLifeEn}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default SolidGeometryChallengeWorld3D;
