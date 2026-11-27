/**
 * CubeRootExplorer.tsx
 * Grade 7 Mathematics – Lesson 2: WHOLE NUMBER
 * Simulation 3: Cube and Cube Root Explorer (2D + 3D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 25-32)
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowLeft, Box, Sparkles, Check, RotateCcw, HelpCircle, Layers, ArrowRight } from 'lucide-react';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुनै सङ्ख्यालाई सोही सङ्ख्याले 3 पटक लगातार गुणन गर्दा आउने गुणनफललाई के भनिन्छ?',
    en: 'What is the product called when a number is multiplied by itself three times?',
    options: [
      { key: 'A', label: 'Square number' },
      { key: 'B', label: 'Cube number' },
      { key: 'C', label: 'Negative number' },
      { key: 'D', label: 'Fraction' },
    ],
    answer: 'B',
  },
  {
    np: '512 को घनमूल (∛512) को मान कति हुन्छ? (512 = 2³ × 2³ × 2³)',
    en: 'What is the cube root of 512 (∛512)? (512 = 2³ × 2³ × 2³)',
    options: [
      { key: 'A', label: '6' },
      { key: 'B', label: '7' },
      { key: 'C', label: '8 (2 × 2 × 2 = 8)' },
      { key: 'D', label: '16' },
    ],
    answer: 'C',
  },
  {
    np: 'एउटा घनाकार पानी ट्यांकीको आयतन 4096 cu m छ भने त्यसको लम्बाइ कति हुन्छ?',
    en: 'If the volume of a cubical water tank is 4096 cu. m, what is its side length?',
    options: [
      { key: 'A', label: '14 m' },
      { key: 'B', label: '16 m (∛4096 = 16)' },
      { key: 'C', label: '18 m' },
      { key: 'D', label: '24 m' },
    ],
    answer: 'B',
  },
  {
    np: '1323 = 3³ × 7² लाई पूर्ण घन बनाउन कुन सानो सङ्ख्याले गुणन गर्नुपर्छ?',
    en: 'By what least number should 1323 = 3³ × 7² be multiplied to make it a perfect cube?',
    options: [
      { key: 'A', label: '3' },
      { key: 'B', label: '7' },
      { key: 'C', label: '21' },
      { key: 'D', label: '49' },
    ],
    answer: 'B',
  },
];

export const CubeRootExplorer: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L2-03',
    titleEn: 'Cube and Cube Root Explorer',
    titleNp: 'घन र घनमूल खोजी संसार',
    chapter: 2,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'build3d' | 'root_concept' | 'prime3' | 'tank3d' | 'perfect_cube'>('build3d');

  // ── Tab 1: 3D Cube Builder State ─────────────────────────────
  const cubeMountRef = useRef<HTMLDivElement>(null);
  const [cubeSide, setCubeSide] = useState<number>(3); // 3x3x3 = 27
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab !== 'build3d') return;
    const container = cubeMountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(cubeSide * 2.8, cubeSide * 2.2, cubeSide * 3.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x475569, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(15, 20, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Group for small unit cubes
    const group = new THREE.Group();
    const unitSize = 0.9;
    const spacing = 1.0;
    const offset = ((cubeSide - 1) * spacing) / 2;

    const boxGeo = new THREE.BoxGeometry(unitSize, unitSize, unitSize);

    for (let x = 0; x < cubeSide; x++) {
      for (let y = 0; y < cubeSide; y++) {
        for (let z = 0; z < cubeSide; z++) {
          const mat = new THREE.MeshStandardMaterial({
            color: (x + y + z) % 2 === 0 ? 0x0284c7 : 0x0ea5e9,
            roughness: 0.3,
            wireframe: showWireframe,
          });
          const cube = new THREE.Mesh(boxGeo, mat);
          cube.position.set(x * spacing - offset, y * spacing - offset, z * spacing - offset);
          cube.castShadow = true;
          cube.receiveShadow = true;
          group.add(cube);
        }
      }
    }
    scene.add(group);

    // Orbit controls
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
      const r = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
      camera.position.x = r * Math.sin(angle);
      camera.position.z = r * Math.cos(angle);
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
      group.rotation.y += 0.003;
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
  }, [activeTab, cubeSide, showWireframe]);

  // ── Tab 4: 3D Water Tank State ───────────────────────────────
  const tankMountRef = useRef<HTMLDivElement>(null);
  const [tankSide, setTankSide] = useState<number>(16); // 16^3 = 4096 cu. m

  useEffect(() => {
    if (activeTab !== 'tank3d') return;
    const container = tankMountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f9ff);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 18, 30);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 1.2);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(10, 20, 10);
    dir.castShadow = true;
    scene.add(dir);

    // Ground platform
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.8, 32), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    platform.position.y = -0.4;
    scene.add(platform);

    // Cubical tank
    const s = Math.min(10, tankSide * 0.45);
    const tankGeo = new THREE.BoxGeometry(s, s, s);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.8, roughness: 0.2 });
    const tankMesh = new THREE.Mesh(tankGeo, tankMat);
    tankMesh.position.y = s / 2;
    scene.add(tankMesh);

    // Water level inside
    const waterGeo = new THREE.BoxGeometry(s * 0.96, s * 0.75, s * 0.96);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = (s * 0.75) / 2;
    scene.add(waterMesh);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      tankMesh.rotation.y += 0.005;
      waterMesh.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [activeTab, tankSide]);

  // Prime factorisation data for cube root
  const CUBE_PF_DATA: Record<number, { factors: number[]; triplets: number[][]; root: number }> = {
    8: { factors: [2, 2, 2], triplets: [[2, 2, 2]], root: 2 },
    27: { factors: [3, 3, 3], triplets: [[3, 3, 3]], root: 3 },
    343: { factors: [7, 7, 7], triplets: [[7, 7, 7]], root: 7 },
    512: { factors: [2, 2, 2, 2, 2, 2, 2, 2, 2], triplets: [[2, 2, 2], [2, 2, 2], [2, 2, 2]], root: 8 },
    1000: { factors: [2, 2, 2, 5, 5, 5], triplets: [[2, 2, 2], [5, 5, 5]], root: 10 },
    1728: { factors: [2, 2, 2, 2, 2, 2, 3, 3, 3], triplets: [[2, 2, 2], [2, 2, 2], [3, 3, 3]], root: 12 },
  };
  const [selectedCubePf, setSelectedCubePf] = useState<number>(512);

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
          background: '#0284C7',
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
            <div style={{ fontSize: 11, fontWeight: 700, color: '#BAE6FD' }}>
              {L('कक्षा 7 • गणित • अध्याय 2: पूर्ण सङ्ख्या', 'Class 7 • Math • Chapter 2: Whole Number')}
            </div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
              {isNe ? 'घन र घनमूल खोजी संसार (2D + 3D)' : 'Cube & Cube Root Explorer (2D + 3D)'}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          
        </div>
      </header>

      {/* Main Body */}
      <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          {[
            { id: 'build3d', np: '1. 3D एकाइ घन निर्माण (Unit Cubes)', en: '1. 3D Unit Cube Builder' },
            { id: 'root_concept', np: '2. घनमूलको अवधारणा (∛)', en: '2. Cube Root Concept (∛)' },
            { id: 'prime3', np: '3. अभाज्य गुणनखण्डबाट घनमूल (त्रिक)', en: '3. Cube Root by Prime Factorisation' },
            { id: 'tank3d', np: '4. 3D घनाकार पानी ट्यांकी (आयतन = L³)', en: '4. 3D Water Tank Volume' },
            { id: 'perfect_cube', np: '5. पूर्ण घन जाँच र प्रश्नोत्तर', en: '5. Perfect Cube Test & Quiz' },
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
                background: activeTab === tab.id ? '#0284C7' : '#F8FAFC',
                color: activeTab === tab.id ? '#FFFFFF' : '#334155',
                transition: 'all 0.15s ease',
              }}
            >
              {isNe ? tab.np : tab.en}
            </button>
          ))}
        </div>

        {/* ── ACTIVITY 1: 3D CUBE BUILDER ─────────────────── */}
        {activeTab === 'build3d' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: 6 }}>
                  {L('पाठ्यपुस्तक पृष्ठ 25-26', 'Textbook Pages 25-26')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('एकाइ घनहरू मिलाएर घनाकार ठोस बनाउने (लम्बाइ × चौडाइ × उचाइ)', 'Assemble Unit Cubes: Length × Breadth × Height = Side³')}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      kit.tap();
                      setCubeSide(s);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: cubeSide === s ? '2px solid #0284C7' : '1px solid #CBD5E1',
                      background: cubeSide === s ? '#E0F2FE' : '#FFFFFF',
                      color: cubeSide === s ? '#0284C7' : '#334155',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {isNe ? toNp(s) : s}³ = {isNe ? toNp(s * s * s) : s * s * s}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Canvas View */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative' }}>
              <div ref={cubeMountRef} style={{ width: '100%', height: 360, cursor: 'grab' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.92)', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#334155' }}>
                🎮 {L('माउस वा औँलाले दृश्य घुमाउन सकिन्छ', 'Drag to rotate 3D view')}
              </div>
              <button
                onClick={() => setShowWireframe(!showWireframe)}
                style={{ position: 'absolute', top: 12, right: 12, padding: '6px 12px', borderRadius: 8, background: '#FFFFFF', border: '1px solid #CBD5E1', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
              >
                {showWireframe ? L('ठोस देखाउनुहोस्', 'Show Solid') : L('जालीदार देखाउनुहोस्', 'Show Wireframe')}
              </button>
            </div>

            {/* Formula Display */}
            <div style={{ marginTop: 16, padding: 18, background: '#F0F9FF', border: '2px solid #BAE6FD', borderRadius: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0284C7', marginBottom: 4 }}>
                {isNe ? toNp(cubeSide) : cubeSide} × {isNe ? toNp(cubeSide) : cubeSide} × {isNe ? toNp(cubeSide) : cubeSide} = {isNe ? toNp(cubeSide ** 3) : cubeSide ** 3}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0369A1' }}>
                {L(`एउटा भुजाको लम्बाइ = ${toNp(cubeSide)} একाइ ⟹ आयतन (Volume) = ${toNp(cubeSide ** 3)} घन एकाइ (घन सङ्ख्या)`, `Side length = ${cubeSide} units ⟹ Volume = ${cubeSide ** 3} cubic units (Cube Number)`)}
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY 2: CUBE ROOT CONCEPT ───────────────── */}
        {activeTab === 'root_concept' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('घनमूलको अवधारणा (तीन बराबर गुणनखण्डमध्ये एक)', 'Cube Root: One of Three Equal Factors (∛)')}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B' }}>
              {L(
                'कुनै पूर्ण घन सङ्ख्यालाई तीन बराबर गुणनखण्डहरूको गुणनफलका रूपमा लेख्दा तीमध्ये एक गुणनखण्डलाई सो सङ्ख्याको घनमूल भनिन्छ।',
                'When a perfect cube is expressed as the product of three equal factors, one of the factors is its cube root.'
              )}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {[
                { n: 8, rt: 2, mult: '2 × 2 × 2' },
                { n: 27, rt: 3, mult: '3 × 3 × 3' },
                { n: 64, rt: 4, mult: '4 × 4 × 4' },
                { n: 125, rt: 5, mult: '5 × 5 × 5' },
                { n: 216, rt: 6, mult: '6 × 6 × 6' },
                { n: 512, rt: 8, mult: '8 × 8 × 8' },
              ].map((item) => (
                <div key={item.n} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0284C7', marginBottom: 4 }}>
                    ∛{isNe ? toNp(item.n) : item.n} = {isNe ? toNp(item.rt) : item.rt}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    {L('कारण:', 'Reason:')} {isNe ? item.mult : `${item.rt} × ${item.rt} × ${item.rt}`} = {isNe ? toNp(item.n) : item.n}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACTIVITY 3: CUBE ROOT BY PRIME FACTORISATION ── */}
        {activeTab === 'prime3' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
                  {L('पाठ्यपुस्तक पृष्ठ 27-28', 'Textbook Pages 27-28')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('अभाज्य गुणनखण्ड गरी 3-3 pcsको त्रिक (Triplets) बनाएर घनमूल निकाल्ने', 'Cube Root by Prime Factorisation & Triplet Grouping')}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[8, 27, 343, 512, 1000, 1728].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      kit.tap();
                      setSelectedCubePf(num);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: selectedCubePf === num ? '2px solid #0284C7' : '1px solid #CBD5E1',
                      background: selectedCubePf === num ? '#E0F2FE' : '#FFFFFF',
                      color: selectedCubePf === num ? '#0284C7' : '#334155',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    ∛{isNe ? toNp(num) : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Triplet Breakdown */}
            {CUBE_PF_DATA[selectedCubePf] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B', marginBottom: 6 }}>
                    1. {L('अभाज्य गुणनखण्डहरू:', 'Prime Factors:')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', fontFamily: 'monospace' }}>
                    {isNe ? toNp(selectedCubePf) : selectedCubePf} = {CUBE_PF_DATA[selectedCubePf].factors.map((f) => (isNe ? toNp(f) : f)).join(' × ')}
                  </div>
                </div>

                <div style={{ background: '#F0F9FF', border: '2px solid #BAE6FD', padding: 18, borderRadius: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0284C7', marginBottom: 8 }}>
                    2. {L('तीन-तीन बराबर गुणनखण्डहरूको त्रिक (Triplets) बनाउँदा:', 'Grouping into triplets of three identical factors:')}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 900 }}>∛{isNe ? toNp(selectedCubePf) : selectedCubePf} = ∛[</span>
                    {CUBE_PF_DATA[selectedCubePf].triplets.map((t, idx) => (
                      <span key={idx} style={{ background: '#BAE6FD', color: '#0369A1', padding: '4px 10px', borderRadius: 8, fontWeight: 900, fontSize: 15 }}>
                        ({t.map((f) => (isNe ? toNp(f) : f)).join(' × ')})
                      </span>
                    ))}
                    <span style={{ fontSize: 16, fontWeight: 900 }}>]</span>
                  </div>
                </div>

                <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 18, borderRadius: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 6 }}>
                    3. {L('प्रत्येक त्रिकबाट एक-एक गुणनखण्ड लिएर गुणन गर्दा:', 'Taking one factor from each triplet and multiplying:')}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#14532D' }}>
                    ∛{isNe ? toNp(selectedCubePf) : selectedCubePf} = {CUBE_PF_DATA[selectedCubePf].triplets.map((t) => (isNe ? toNp(t[0]) : t[0])).join(' × ')} = <strong>{isNe ? toNp(CUBE_PF_DATA[selectedCubePf].root) : CUBE_PF_DATA[selectedCubePf].root}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVITY 4: 3D WATER TANK CHALLENGE ─────────── */}
        {activeTab === 'tank3d' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#BAE6FD', color: '#0369A1', padding: '3px 8px', borderRadius: 6 }}>
                  {L('पाठ्यपुस्तक व्यवहारिक समस्या (पृष्ठ 29)', 'Textbook Real-Life Application (Page 29)')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('घनाकार पानी ट्यांकीको आयतन र लम्बाइ सम्बन्ध (आयतन = L³ ⟹ L = ∛आयतन)', 'Cubical Water Tank Volume and Side Length (V = L³ ⟹ L = ∛V)')}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { side: 10, vol: 1000 },
                  { side: 16, vol: 4096 },
                  { side: 20, vol: 8000 },
                ].map((item) => (
                  <button
                    key={item.side}
                    onClick={() => {
                      kit.tap();
                      setTankSide(item.side);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: tankSide === item.side ? '2px solid #0284C7' : '1px solid #CBD5E1',
                      background: tankSide === item.side ? '#E0F2FE' : '#FFFFFF',
                      color: tankSide === item.side ? '#0284C7' : '#334155',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    V = {isNe ? toNp(item.vol) : item.vol} m³
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Tank View */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative' }}>
              <div ref={tankMountRef} style={{ width: '100%', height: 340 }} />
            </div>

            {/* Calculations */}
            <div style={{ marginTop: 16, padding: 18, background: '#F0F9FF', border: '2px solid #BAE6FD', borderRadius: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0369A1', marginBottom: 6 }}>
                {L('समस्या: एउटा घनाकार पानी ट्यांकीको आयतन', 'Problem: A cubical water tank has volume')} {isNe ? toNp(tankSide ** 3) : tankSide ** 3} m³ {L('भए लम्बाइ कति हुन्छ?', 'Find its side length.')}
              </div>
              <div style={{ fontSize: 14, color: '#0F172A', lineHeight: 1.6 }}>
                <div>• {L('सूत्र:', 'Formula:')} V = L³ ⟹ {isNe ? toNp(tankSide ** 3) : tankSide ** 3} = L³</div>
                <div>• L = ∛{isNe ? toNp(tankSide ** 3) : tankSide ** 3} = <strong>{isNe ? toNp(tankSide) : tankSide} {L('m', 'meters')}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY 5: PERFECT CUBE TEST & QUIZ ────────── */}
        {activeTab === 'perfect_cube' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('घन र घनमूल मूल्याङ्कन प्रश्नोत्तर', 'Cube and Cube Root Assessment Quiz')}
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
export default CubeRootExplorer;
