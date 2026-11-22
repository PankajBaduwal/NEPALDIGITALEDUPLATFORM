/**
 * SquareRootDiscoveryLab.tsx
 * Grade 7 Mathematics – Lesson 2: WHOLE NUMBER (पूर्ण सङ्ख्या)
 * Simulation 1: Square and Square Root Discovery Lab (2D + 3D)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 16-24)
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowLeft, Box, Sparkles, Check, RotateCcw, HelpCircle, Layers, Grid, Compass, ArrowRight } from 'lucide-react';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface SquarePreset {
  n: number;
  labelNp: string;
  labelEn: string;
}

const SQUARE_PRESETS: SquarePreset[] = [
  { n: 1, labelNp: '१ × १ = १', labelEn: '1 × 1 = 1' },
  { n: 2, labelNp: '२ × २ = ४', labelEn: '2 × 2 = 4' },
  { n: 3, labelNp: '३ × ३ = ९', labelEn: '3 × 3 = 9' },
  { n: 4, labelNp: '४ × ४ = १६', labelEn: '4 × 4 = 16' },
  { n: 5, labelNp: '५ × ५ = २५', labelEn: '5 × 5 = 25' },
  { n: 6, labelNp: '६ × ६ = ३६', labelEn: '6 × 6 = 36' },
  { n: 7, labelNp: '७ × ७ = ४९', labelEn: '7 × 7 = 49' },
  { n: 8, labelNp: '८ × ८ = ६४', labelEn: '8 × 8 = 64' },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुनै सङ्ख्यालाई सोही सङ्ख्याले गुणन गर्दा आउने गुणनफललाई के भनिन्छ?',
    en: 'What is the product called when a number is multiplied by itself?',
    options: [
      { key: 'A', label: 'वर्ग सङ्ख्या (Square Number)' },
      { key: 'B', label: 'घन सङ्ख्या (Cube Number)' },
      { key: 'C', label: 'ऋणात्मक सङ्ख्या' },
      { key: 'D', label: 'अभाज्य सङ्ख्या' },
    ],
    answer: 'A',
  },
  {
    np: '६४ को वर्गमूल (√६४) को मान कति हुन्छ?',
    en: 'What is the square root of 64 (√64)?',
    options: [
      { key: 'A', label: '६' },
      { key: 'B', label: '७' },
      { key: 'C', label: '८ (८ × ८ = ६४)' },
      { key: 'D', label: '१६' },
    ],
    answer: 'C',
  },
  {
    np: 'एउटा वर्गाकार बगैँचाको क्षेत्रफल ६२५ वर्ग मिटर छ भने त्यसको लम्बाइ कति मिटर हुन्छ?',
    en: 'If the area of a square garden is 625 sq. m, what is its side length in meters?',
    options: [
      { key: 'A', label: '१५ मिटर' },
      { key: 'B', label: '२० मिटर' },
      { key: 'C', label: '२५ मिटर (√६२५ = २५)' },
      { key: 'D', label: '३५ मिटर' },
    ],
    answer: 'C',
  },
  {
    np: 'तलका मध्ये कुन सङ्ख्या पूर्ण वर्ग सङ्ख्या (Perfect Square) हो?',
    en: 'Which of the following is a perfect square number?',
    options: [
      { key: 'A', label: '२०' },
      { key: 'B', label: '५०' },
      { key: 'C', label: '८१ (९² = ८१)' },
      { key: 'D', label: '९०' },
    ],
    answer: 'C',
  },
];

export const SquareRootDiscoveryLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L2-01',
    titleEn: 'Square and Square Root Discovery Lab',
    titleNp: 'वर्ग र वर्गमूल खोजी प्रयोगशाला',
    chapter: 2,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'build' | 'explore' | 'root' | 'land3d' | 'quiz'>('build');

  // Activity 1 & 2: Grid Rows and Columns
  const [gridRows, setGridRows] = useState<number>(4);
  const [gridCols, setGridCols] = useState<number>(4);

  // Activity 3: Root Discovery
  const [selectedRootNum, setSelectedRootNum] = useState<number>(64);
  const [userGuessRoot, setUserGuessRoot] = useState<number | null>(null);

  // Activity 4: 3D Land & Garden Explorer
  const landMountRef = useRef<HTMLDivElement>(null);
  const [landSideLength, setLandSideLength] = useState<number>(25); // e.g. 25m -> 625 m²
  const [landType, setLandType] = useState<'garden' | 'playground' | 'hall'>('garden');

  // 3D Scene for Activity 4
  useEffect(() => {
    if (activeTab !== 'land3d') return;
    const container = landMountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(landType === 'garden' ? 0xecfdf5 : landType === 'playground' ? 0xfef3c7 : 0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 35, 45);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Ground Grid Helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x94a3b8, 0xe2e8f0);
    scene.add(gridHelper);

    // Square Platform representing the land
    const s = landSideLength * 0.8;
    const groundGeo = new THREE.BoxGeometry(s, 0.8, s);
    const groundMat = new THREE.MeshStandardMaterial({
      color: landType === 'garden' ? 0x22c55e : landType === 'playground' ? 0xf59e0b : 0x64748b,
      roughness: 0.6,
    });
    const platformMesh = new THREE.Mesh(groundGeo, groundMat);
    platformMesh.position.y = 0.4;
    platformMesh.receiveShadow = true;
    scene.add(platformMesh);

    // Perimeter boundary fence posts
    const postGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const half = s / 2;
    [
      [-half, -half],
      [half, -half],
      [-half, half],
      [half, half],
      [0, -half],
      [0, half],
      [-half, 0],
      [half, 0],
    ].forEach(([px, pz]) => {
      const p = new THREE.Mesh(postGeo, postMat);
      p.position.set(px, 1.15, pz);
      scene.add(p);
    });

    // Orbit controls using mouse drag
    let isDragging = false;
    let prevX = 0;
    let angle = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      angle += dx * 0.008;
      const radius = 45;
      camera.position.x = radius * Math.sin(angle);
      camera.position.z = radius * Math.cos(angle);
      camera.lookAt(0, 0, 0);
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [activeTab, landSideLength, landType]);

  const isCurrentSquare = gridRows === gridCols;
  const currentTotalTiles = gridRows * gridCols;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F8FAFC',
        fontFamily: FONT_NP,
        color: '#0F172A',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 18px',
          background: '#0F766E',
          color: '#FFFFFF',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.18)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> {L('पुस्तकालय', 'Library')}
          </button>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#99F6E4' }}>
              {L('कक्षा ७ • गणित • अध्याय २: पूर्ण सङ्ख्या', 'Class 7 • Math • Chapter 2: Whole Number')}
            </div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
              {isNe ? 'वर्ग र वर्गमूल खोजी प्रयोगशाला (२D + ३D)' : 'Square & Square Root Discovery Lab (2D + 3D)'}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => kit.setLang(isNe ? 'en' : 'ne')}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {isNe ? 'English' : 'नेपाली'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          {[
            { id: 'build', np: '१. वर्ग सङ्ख्या निर्माण (टाइल्स)', en: '1. Build Square Number' },
            { id: 'explore', np: '२. वर्ग सङ्ख्या अन्वेषण ग्रिड', en: '2. Explore Square Grid' },
            { id: 'root', np: '३. वर्गमूलको अवधारणा (√)', en: '3. Discover Square Root (√)' },
            { id: 'land3d', np: '४. ३D वर्गाकार जग्गा र क्षेत्रफल', en: '4. 3D Square Land & Area' },
            { id: 'quiz', np: '५. अभ्यास र चुनौती', en: '5. Practice & Challenge' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                kit.tap();
                setActiveTab(tab.id as any);
              }}
              style={{
                flex: '1 1 auto',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? '#0F766E' : '#F8FAFC',
                color: activeTab === tab.id ? '#FFFFFF' : '#334155',
                transition: 'all 0.15s ease',
              }}
            >
              {isNe ? tab.np : tab.en}
            </button>
          ))}
        </div>

        {/* ── ACTIVITY 1: BUILD A SQUARE NUMBER ──────────── */}
        {activeTab === 'build' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
                  {L('पाठ्यपुस्तक पृष्ठ १६-१८', 'Textbook Pages 16-18')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('टाइल्सहरूबाट वर्ग सङ्ख्या निर्माण गर्नुहोस्', 'Build Square Numbers with Tiles')}
                </h3>
              </div>
              <div style={{ fontSize: 13, color: '#64748B' }}>
                {L('पंक्ति × स्तम्भ = जम्मा टाइल्स (सङ्ख्यालाई सोही सङ्ख्याले गुणन)', 'Rows × Columns = Total tiles (Number multiplied by itself)')}
              </div>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {SQUARE_PRESETS.map((p) => (
                <button
                  key={p.n}
                  onClick={() => {
                    kit.tap();
                    setGridRows(p.n);
                    setGridCols(p.n);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: gridRows === p.n && gridCols === p.n ? '2px solid #0F766E' : '1px solid #CBD5E1',
                    background: gridRows === p.n && gridCols === p.n ? '#F0FDFA' : '#FFFFFF',
                    color: gridRows === p.n && gridCols === p.n ? '#0F766E' : '#334155',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {isNe ? p.labelNp : p.labelEn}
                </button>
              ))}
            </div>

            {/* Interactive Visual Tile Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, background: '#F8FAFC', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${gridRows}, 38px)`,
                  gridTemplateColumns: `repeat(${gridCols}, 38px)`,
                  gap: 4,
                  padding: 12,
                  background: '#FFFFFF',
                  borderRadius: 12,
                  border: isCurrentSquare ? '3px solid #0F766E' : '2px dashed #94A3B8',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                }}
              >
                {Array.from({ length: currentTotalTiles }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 6,
                      background: isCurrentSquare ? '#14B8A6' : '#94A3B8',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {isNe ? toNp(idx + 1) : idx + 1}
                  </div>
                ))}
              </div>

              {/* Formula & Explanation */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#0F766E', marginBottom: 4 }}>
                  {isNe ? toNp(gridRows) : gridRows} × {isNe ? toNp(gridCols) : gridCols} = {isNe ? toNp(currentTotalTiles) : currentTotalTiles}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>
                  {isNe
                    ? `${toNp(gridRows)}² = ${toNp(currentTotalTiles)} (त्यसैले ${toNp(currentTotalTiles)} एउटा वर्ग सङ्ख्या हो)`
                    : `${gridRows}² = ${currentTotalTiles} (Therefore, ${currentTotalTiles} is a perfect square number)`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY 2: EXPLORE SQUARE NUMBERS GRID ─────── */}
        {activeTab === 'explore' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('पंक्ति र स्तम्भ थपघट गरी वर्ग आकार जाँच गर्नुहोस्', 'Add/Remove Rows & Columns to Test Perfect Squares')}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748B' }}>
              {L(
                'जब पंक्ति र स्तम्भको सङ्ख्या बराबर हुन्छ, तब मात्र पूर्ण वर्ग बन्दछ।',
                'Only when rows and columns are equal does the shape form a perfect square.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #E2E8F0', flex: '1 1 200px' }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 8 }}>
                  {L('पंक्तिहरूको सङ्ख्या (Rows):', 'Number of Rows:')} {isNe ? toNp(gridRows) : gridRows}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      kit.tap();
                      setGridRows(Math.max(1, gridRows - 1));
                    }}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      kit.tap();
                      setGridRows(Math.min(10, gridRows + 1));
                    }}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #E2E8F0', flex: '1 1 200px' }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 8 }}>
                  {L('स्तम्भहरूको सङ्ख्या (Columns):', 'Number of Columns:')} {isNe ? toNp(gridCols) : gridCols}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      kit.tap();
                      setGridCols(Math.max(1, gridCols - 1));
                    }}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      kit.tap();
                      setGridCols(Math.min(10, gridCols + 1));
                    }}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  flex: '1 1 260px',
                  padding: 16,
                  borderRadius: 12,
                  background: isCurrentSquare ? '#DCFCE7' : '#FEF3C7',
                  border: isCurrentSquare ? '2px solid #16A34A' : '2px solid #F59E0B',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 900, color: isCurrentSquare ? '#166534' : '#92400E' }}>
                  {isCurrentSquare
                    ? L(`✓ पूर्ण वर्ग आकार (${toNp(gridRows)}² = ${toNp(currentTotalTiles)})`, `✓ Perfect Square (${gridRows}² = ${currentTotalTiles})`)
                    : L(`✗ आयताकार (${toNp(gridRows)} × ${toNp(gridCols)} = ${toNp(currentTotalTiles)} पूर्ण वर्ग होइन)`, `✗ Rectangular (${gridRows} × ${gridCols} = ${currentTotalTiles} is NOT a square)`)}
                </div>
                <div style={{ fontSize: 12, color: isCurrentSquare ? '#15803D' : '#B45309', marginTop: 4 }}>
                  {isCurrentSquare
                    ? L('पंक्ति र स्तम्भ बराबर भएकोले यो पूर्ण वर्ग हो।', 'Equal dimensions make it a perfect square.')
                    : L('पूर्ण वर्ग बनाउन पंक्ति र स्तम्भ बराबर बनाउनुहोस्।', 'Adjust rows or columns to make them equal.')}
                </div>
              </div>
            </div>

            {/* Grid display */}
            <div style={{ overflowX: 'auto', padding: 16, background: '#F8FAFC', borderRadius: 12, display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${gridRows}, 30px)`,
                  gridTemplateColumns: `repeat(${gridCols}, 30px)`,
                  gap: 3,
                }}
              >
                {Array.from({ length: currentTotalTiles }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 4,
                      background: isCurrentSquare ? '#0F766E' : '#F59E0B',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY 3: DISCOVER SQUARE ROOT ───────────── */}
        {activeTab === 'root' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('वर्गमूलको अवधारणा र दुई बराबर गुणनखण्ड (√)', 'Square Root as One of Two Equal Factors (√)')}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B' }}>
              {L(
                'कुनै पूर्ण वर्ग सङ्ख्यालाई दुई बराबर गुणनखण्डहरूको गुणनफलका रूपमा लेख्दा तीमध्ये एक गुणनखण्डलाई सो सङ्ख्याको वर्गमूल भनिन्छ।',
                'When a square number is expressed as the product of two equal factors, one of the factors is called its square root.'
              )}
            </p>

            {/* Numbers selection */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {[16, 25, 36, 49, 64, 81, 100].map((num) => {
                const rt = Math.sqrt(num);
                const isSelected = selectedRootNum === num;
                return (
                  <button
                    key={num}
                    onClick={() => {
                      kit.tap();
                      setSelectedRootNum(num);
                      setUserGuessRoot(null);
                    }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 12,
                      border: isSelected ? '2px solid #0F766E' : '1px solid #CBD5E1',
                      background: isSelected ? '#0F766E' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#334155',
                      fontWeight: 900,
                      fontSize: 15,
                      cursor: 'pointer',
                    }}
                  >
                    √{isNe ? toNp(num) : num}
                  </button>
                );
              })}
            </div>

            {/* Root Visualizer Card */}
            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F766E', marginBottom: 8 }}>
                {L(`कुन सङ्ख्यालाई सोही सङ्ख्याले गुणन गर्दा ${toNp(selectedRootNum)} आउँछ?`, `What number multiplied by itself gives ${selectedRootNum}?`)}
              </div>

              <div style={{ fontSize: 32, fontWeight: 900, color: '#0F766E', margin: '12px 0' }}>
                √{isNe ? toNp(selectedRootNum) : selectedRootNum} = ?
              </div>

              {/* Options to guess */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', margin: '16px 0' }}>
                {[Math.sqrt(selectedRootNum) - 1, Math.sqrt(selectedRootNum), Math.sqrt(selectedRootNum) + 2].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setUserGuessRoot(opt);
                      if (opt === Math.sqrt(selectedRootNum)) {
                        kit.good(L('शाबास! सही वर्गमूल पत्ता लगाउनुभयो।', 'Well done! Correct square root.'));
                      } else {
                        kit.oops(L('फेरि प्रयास गर्नुहोस्।', "Let's try again."));
                      }
                    }}
                    style={{
                      padding: '10px 24px',
                      borderRadius: 12,
                      border: userGuessRoot === opt ? (opt === Math.sqrt(selectedRootNum) ? '2px solid #16A34A' : '2px solid #DC2626') : '1px solid #CBD5E1',
                      background: userGuessRoot === opt ? (opt === Math.sqrt(selectedRootNum) ? '#DCFCE7' : '#FEE2E2') : '#FFFFFF',
                      color: '#0F172A',
                      fontWeight: 900,
                      fontSize: 18,
                      cursor: 'pointer',
                    }}
                  >
                    {isNe ? toNp(opt) : opt}
                  </button>
                ))}
              </div>

              {userGuessRoot === Math.sqrt(selectedRootNum) && (
                <div style={{ marginTop: 12, fontSize: 16, fontWeight: 800, color: '#166534' }}>
                  ✓ {isNe ? toNp(selectedRootNum) : selectedRootNum} = {isNe ? toNp(userGuessRoot) : userGuessRoot} × {isNe ? toNp(userGuessRoot) : userGuessRoot} ⟹ √{isNe ? toNp(selectedRootNum) : selectedRootNum} = {isNe ? toNp(userGuessRoot) : userGuessRoot}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ACTIVITY 4: 3D SQUARE LAND & BUILDING ───────── */}
        {activeTab === 'land3d' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
                  {L('पाठ्यपुस्तक उदाहरण: जग्गा र क्षेत्रफल', 'Textbook Example: Land & Area')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('३D वर्गाकार बगैँचा / खेलमैदान (क्षेत्रफल = लम्बाइ²)', '3D Square Garden / Playground (Area = Side²)')}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { id: 'garden', np: 'बगैँचा', en: 'Garden' },
                  { id: 'playground', np: 'खेलमैदान', en: 'Playground' },
                  { id: 'hall', np: 'सभाहल', en: 'Seminar Hall' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      kit.tap();
                      setLandType(type.id as any);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: landType === type.id ? '2px solid #0F766E' : '1px solid #CBD5E1',
                      background: landType === type.id ? '#F0FDFA' : '#FFFFFF',
                      color: landType === type.id ? '#0F766E' : '#334155',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {isNe ? type.np : type.en}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Canvas View */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative' }}>
              <div ref={landMountRef} style={{ width: '100%', height: 360, cursor: 'grab' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.92)', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#334155' }}>
                🎮 {L('माउस वा औँलाले दृश्य घुमाउन मिल्छ', 'Drag to rotate 3D view')}
              </div>
            </div>

            {/* Slider & Mathematical Derivation */}
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', display: 'block', marginBottom: 8 }}>
                  {L('वर्गाकार जग्गाको एक भुजाको लम्बाइ (Side length):', 'Side length of square land:')} {isNe ? toNp(landSideLength) : landSideLength} {L('मिटर', 'm')}
                </label>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={landSideLength}
                  onChange={(e) => setLandSideLength(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginTop: 4 }}>
                  <span>५ मि. (5m)</span>
                  <span>२५ मि. (२५² = ६२५ वर्ग मि.)</span>
                  <span>३५ मि. (35m)</span>
                </div>
              </div>

              <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 18, borderRadius: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0F766E', textTransform: 'uppercase', marginBottom: 4 }}>
                  📐 {L('गणितीय हिसाब (Mathematical Calculation)', 'Mathematical Calculation')}
                </div>
                <div style={{ fontSize: 14, color: '#1E293B', lineHeight: 1.6 }}>
                  <div><strong>{L('क्षेत्रफल (Area)', 'Area')}</strong> = {L('लम्बाइ', 'side')}² = {isNe ? toNp(landSideLength) : landSideLength}² = <strong>{isNe ? toNp(landSideLength * landSideLength) : landSideLength * landSideLength} m²</strong></div>
                  <div><strong>{L('उल्टो सम्बन्ध (Square root)', 'Inverse relation')}</strong>: √{isNe ? toNp(landSideLength * landSideLength) : landSideLength * landSideLength} = <strong>{isNe ? toNp(landSideLength) : landSideLength} m</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY 5: PRACTICE & QUIZ ─────────────────── */}
        {activeTab === 'quiz' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('वर्ग र वर्गमूल मूल्याङ्कन प्रश्नोत्तर', 'Square and Square Root Assessment Quiz')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {QUIZ_QUESTIONS.map((q, idx) => (
                <div key={idx} style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
                    {isNe ? toNp(idx + 1) : idx + 1}. {isNe ? q.np : q.en}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                    {q.options.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          if (opt.key === q.answer) {
                            kit.good(L('शाबास! सही उत्तर।', 'Well done! Correct answer.'));
                          } else {
                            kit.oops(L('गलत उत्तर, फेरि सोच्नुहोस्।', 'Incorrect, think again.'));
                          }
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          color: '#334155',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <strong>{opt.key}.</strong> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SquareRootDiscoveryLab;
