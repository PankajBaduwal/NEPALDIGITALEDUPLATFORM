/**
 * ClassroomSetFormation3D.tsx
 * Grade 7 Mathematics – Lesson 1: SET
 * Simulation 6: My Classroom – Real-World Set Formation (3D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Page 15 Project Work)
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowLeft, Volume2, VolumeX, Maximize2, Minimize2, Check, RotateCcw, Box, Sparkles, BookOpen, Layers } from 'lucide-react';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface ClassroomItem3D {
  id: string;
  nameEn: string;
  nameNp: string;
  category: 'stationery' | 'math' | 'wood' | 'book';
  color: number;
  pos: [number, number, number];
  size: [number, number, number];
  geo: 'box' | 'cylinder';
  isWood?: boolean;
  isMath?: boolean;
  isStationery?: boolean;
  isBook?: boolean;
}

const CLASSROOM_ITEMS: ClassroomItem3D[] = [
  { id: 'item_pencil', nameEn: 'Pencil', nameNp: 'सिसाकलम', category: 'stationery', color: 0xf59e0b, pos: [-1.2, 0.95, -0.2], size: [0.08, 0.45, 0.08], geo: 'cylinder', isStationery: true, isWood: true },
  { id: 'item_ruler', nameEn: 'Wooden Ruler', nameNp: 'काठको स्केल', category: 'math', color: 0xd97706, pos: [-0.7, 0.93, -0.1], size: [0.7, 0.03, 0.12], geo: 'box', isStationery: true, isMath: true, isWood: true },
  { id: 'item_notebook', nameEn: 'Notebook', nameNp: 'अभ्यास कापी', category: 'book', color: 0x3b82f6, pos: [-0.1, 0.93, -0.2], size: [0.45, 0.05, 0.6], geo: 'box', isStationery: true, isBook: true },
  { id: 'item_textbook', nameEn: 'Math Textbook', nameNp: 'गणित पाठ्यपुस्तक', category: 'book', color: 0x10b981, pos: [0.45, 0.94, -0.2], size: [0.5, 0.06, 0.65], geo: 'box', isBook: true },
  { id: 'item_compass', nameEn: 'Geometry Compass', nameNp: 'कम्पास', category: 'math', color: 0x64748b, pos: [0.95, 0.94, -0.1], size: [0.12, 0.35, 0.12], geo: 'cylinder', isStationery: true, isMath: true },
  { id: 'item_protractor', nameEn: 'Protractor', nameNp: 'प्रोट्याक्टर', category: 'math', color: 0x06b6d4, pos: [-1.1, 0.93, 0.25], size: [0.35, 0.03, 0.2], geo: 'cylinder', isStationery: true, isMath: true },
  { id: 'item_setsquare', nameEn: 'Set Square', nameNp: 'सेट स्क्वायर', category: 'math', color: 0x8b5cf6, pos: [-0.5, 0.93, 0.25], size: [0.3, 0.03, 0.3], geo: 'box', isStationery: true, isMath: true },
  { id: 'item_duster', nameEn: 'Wooden Duster', nameNp: 'काठको डस्टर', category: 'wood', color: 0xb45309, pos: [0.2, 0.95, 0.25], size: [0.35, 0.1, 0.16], geo: 'box', isStationery: true, isWood: true },
  { id: 'item_chalkbox', nameEn: 'Chalk Box', nameNp: 'चक बाकस', category: 'stationery', color: 0xe2e8f0, pos: [0.75, 0.97, 0.25], size: [0.25, 0.18, 0.25], geo: 'box', isStationery: true },
  { id: 'item_schoolbag', nameEn: 'School Bag', nameNp: 'स्कूल झोला', category: 'book', color: 0xec4899, pos: [1.8, 0.5, 0.3], size: [0.45, 0.7, 0.35], geo: 'box', isBook: true },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कक्षाकोठाका 10 वस्तुहरूबाट बनेका समूहहरू गणितीय हिसाबले कस्ता समूह हुन्?',
    en: 'The sets created from 10 classroom objects are what kind of sets?',
    options: [
      { key: 'A', label: 'Finite sets' },
      { key: 'B', label: 'Infinite sets' },
      { key: 'C', label: 'Empty set' },
      { key: 'D', label: 'None of the above' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि गणितीय औजारको समूह M र काठका वस्तुको समूह W दुवैमा 4-4 सदस्य भए तिनीहरूको सम्बन्ध के हुन्छ?',
    en: 'If set M (Math tools) and set W (Wooden items) both have 4 elements, what is their relation?',
    options: [
      { key: 'A', label: 'M ~ W' },
      { key: 'B', label: 'M = W' },
      { key: 'C', label: 'M ⊆ ∅' },
      { key: 'D', label: 'No relation' },
    ],
    answer: 'A',
  },
];

export const ClassroomSetFormation3D: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({ onBackToLibrary, onBack }) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L1-06',
    titleEn: 'My Classroom – Real-World Set Formation',
    titleNp: 'मेरो कक्षाकोठा – वास्तविक वस्तुबाट समूह निर्माण',
    chapter: 1,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const mountRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<'collect' | 'categorize' | 'relations' | 'project'>('collect');

  // Collected inventory of items (from clicking 3D objects or picking)
  const [collectedIds, setCollectedIds] = useState<string[]>(['item_pencil', 'item_ruler', 'item_notebook', 'item_textbook']);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'stationery' | 'math' | 'wood' | 'book'>('all');
  const [inspectedItem, setInspectedItem] = useState<ClassroomItem3D | null>(null);

  // 3D Scene setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0fdf4);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 4.8);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 0.9);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Classroom Floor
    const floorGeo = new THREE.PlaneGeometry(12, 10);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Chalkboard Wall at Back
    const wallGeo = new THREE.PlaneGeometry(12, 5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 2.5, -4);
    scene.add(wall);

    // Big Green Chalkboard
    const boardGeo = new THREE.BoxGeometry(5.5, 2.2, 0.08);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 2.6, -3.95);
    scene.add(board);

    // Wooden Teacher Table
    const tableTopGeo = new THREE.BoxGeometry(3.6, 0.12, 1.6);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });
    const tableTop = new THREE.Mesh(tableTopGeo, woodMat);
    tableTop.position.set(0, 0.86, 0);
    tableTop.receiveShadow = true;
    tableTop.castShadow = true;
    scene.add(tableTop);

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.86);
    const legPositions = [
      [-1.65, 0.43, -0.65],
      [1.65, 0.43, -0.65],
      [-1.65, 0.43, 0.65],
      [1.65, 0.43, 0.65],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(lx, ly, lz);
      scene.add(leg);
    });

    // 10 Classroom 3D Objects on Table
    const objectMeshes: { mesh: THREE.Mesh; item: ClassroomItem3D }[] = [];

    CLASSROOM_ITEMS.forEach((it) => {
      let geo: THREE.BufferGeometry;
      if (it.geo === 'cylinder') {
        geo = new THREE.CylinderGeometry(it.size[0] / 2, it.size[0] / 2, it.size[1], 16);
      } else {
        geo = new THREE.BoxGeometry(it.size[0], it.size[1], it.size[2]);
      }
      const mat = new THREE.MeshStandardMaterial({ color: it.color, roughness: 0.4 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(it.pos[0], it.pos[1], it.pos[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      objectMeshes.push({ mesh, item: it });
    });

    // Raycasting for object selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(objectMeshes.map((o) => o.mesh));

      if (intersects.length > 0) {
        const hit = objectMeshes.find((o) => o.mesh === intersects[0].object);
        if (hit) {
          kit.tap();
          setInspectedItem(hit.item);
          setCollectedIds((prev) => (prev.includes(hit.item.id) ? prev : [...prev, hit.item.id]));
        }
      }
    };

    renderer.domElement.addEventListener('click', onPointerDown);

    // Orbit drag variables
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
      angle += dx * 0.006;
      camera.position.x = 4.8 * Math.sin(angle);
      camera.position.z = 4.8 * Math.cos(angle);
      camera.lookAt(0, 0.8, 0);
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      // Gentle object floating for selected/inspected item
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('click', onPointerDown);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  const toggleCollected = (id: string) => {
    kit.tap();
    setCollectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Precomputed sets from 10 items
  const stationerySet = CLASSROOM_ITEMS.filter((i) => i.isStationery && collectedIds.includes(i.id));
  const mathSet = CLASSROOM_ITEMS.filter((i) => i.isMath && collectedIds.includes(i.id));
  const woodSet = CLASSROOM_ITEMS.filter((i) => i.isWood && collectedIds.includes(i.id));
  const bookSet = CLASSROOM_ITEMS.filter((i) => i.isBook && collectedIds.includes(i.id));

  return (
    <div
      style={{
        width: '100%',
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F5F7F5',
        fontFamily: FONT_NP,
        color: '#26332E',
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
          background: '#187C68',
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
            <div style={{ fontSize: 11, fontWeight: 700, color: '#A7F3D0' }}>
              {L('कक्षा 7 • गणित • अध्याय 1: समूह (3D कक्षाकोठा)', 'Class 7 • Math • Chapter 1: SET (3D Classroom)')}
            </div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
              {isNe ? 'मेरो कक्षाकोठा – वास्तविक वस्तुबाट समूह निर्माण' : 'My Classroom – Real-World Set Formation'}
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
            { id: 'collect', np: '1. कक्षाकोठाबाट 10 वस्तु सङ्कलन', en: '1. Collect 10 Objects' },
            { id: 'categorize', np: '2. साझा विशेषताका आधारमा समूह निर्माण', en: '2. Form Sets by Properties' },
            { id: 'relations', np: '3. समूहहरूको सम्बन्ध (समतुल्य / उपसमूह)', en: '3. Set Relationships' },
            { id: 'project', np: '4. पाठ्यपुस्तक परियोजना कार्य (प्रस्तुतीकरण)', en: '4. Textbook Project Presentation' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                kit.tap();
                setActiveStep(tab.id as any);
              }}
              style={{
                flex: '1 1 auto',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeStep === tab.id ? '#187C68' : '#F8FAFC',
                color: activeStep === tab.id ? '#FFFFFF' : '#334155',
              }}
            >
              {isNe ? tab.np : tab.en}
            </button>
          ))}
        </div>

        {/* 3D Interactive Classroom View */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1E293B' }}>
              🎮 {L('3D कक्षाकोठा: वस्तुमा क्लिक गरी सङ्कलन गर्नुहोस् (माउसले घुमाउन मिल्छ)', '3D Classroom: Click items to inspect/collect (Drag to rotate camera)')}
            </span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: 6 }}>
              {L(`सङ्कलित वस्तु: ${toNp(collectedIds.length)} / 10`, `Collected: ${collectedIds.length} / 10`)}
            </span>
          </div>

          <div
            ref={mountRef}
            style={{ width: '100%', height: 380, position: 'relative', cursor: 'grab' }}
          />

          {/* Inspected Object Toast */}
          {inspectedItem && (
            <div style={{ padding: '10px 16px', background: '#FEF3C7', borderTop: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#92400E' }}>
                ✨ {L('छानिएको वस्तु:', 'Selected Item:')} <strong>{isNe ? inspectedItem.nameNp : inspectedItem.nameEn}</strong>
              </span>
              <button
                onClick={() => setInspectedItem(null)}
                style={{ border: 'none', background: 'transparent', fontWeight: 900, cursor: 'pointer', color: '#92400E' }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* ── STEP 1: COLLECT 10 ITEMS ────────────────────── */}
        {activeStep === 'collect' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                {L('कक्षाकोठाका 10 वस्तुहरूको सूची (U)', 'Master List of 10 Classroom Items (U)')}
              </h3>
              <button
                onClick={() => {
                  kit.tap();
                  setCollectedIds(CLASSROOM_ITEMS.map((x) => x.id));
                  kit.good(L('सबै 10 वस्तुहरू सङ्कलन गरिए!', 'All 10 items collected!'));
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#187C68',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {L('सबै 10 वस्तु छान्नुहोस्', 'Select All 10 Items')}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {CLASSROOM_ITEMS.map((item, idx) => {
                const isCollected = collectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleCollected(item.id)}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: isCollected ? '2px solid #16A34A' : '1px solid #E2E8F0',
                      background: isCollected ? '#F0FDF4' : '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8' }}>#{idx + 1} </span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{isNe ? item.nameNp : item.nameEn}</span>
                    </div>
                    <span>{isCollected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2: CATEGORIZE INTO SETS ────────────────── */}
        {activeStep === 'categorize' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 16 }}>
              {L('सङ्कलित वस्तुहरूबाट साझा विशेषताका आधारमा समूह विभाजन', 'Categorize Collected Items into Sets by Properties')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {/* Set S: Stationery */}
              <div style={{ background: '#EFF6FF', border: '2px solid #3B82F6', borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#1D4ED8', marginBottom: 6 }}>
                  S = {L('स्टेशनरी सामग्रीहरू', 'Stationery Items')}
                </div>
                <div style={{ fontSize: 13, color: '#1E40AF', minHeight: 48, marginBottom: 8 }}>
                  S = {'{ '}
                  {stationerySet.map((i) => (isNe ? i.nameNp : i.nameEn)).join(', ') || L('∅', '∅')}
                  {' }'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, background: '#DBEAFE', color: '#1E40AF', display: 'inline-block', padding: '2px 8px', borderRadius: 6 }}>
                  n(S) = {isNe ? toNp(stationerySet.length) : stationerySet.length}
                </div>
              </div>

              {/* Set M: Math Instruments */}
              <div style={{ background: '#ECFDF5', border: '2px solid #10B981', borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#047857', marginBottom: 6 }}>
                  M = {L('गणितीय औजारहरू', 'Mathematical Instruments')}
                </div>
                <div style={{ fontSize: 13, color: '#065F46', minHeight: 48, marginBottom: 8 }}>
                  M = {'{ '}
                  {mathSet.map((i) => (isNe ? i.nameNp : i.nameEn)).join(', ') || L('∅', '∅')}
                  {' }'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, background: '#D1FAE5', color: '#065F46', display: 'inline-block', padding: '2px 8px', borderRadius: 6 }}>
                  n(M) = {isNe ? toNp(mathSet.length) : mathSet.length}
                </div>
              </div>

              {/* Set W: Wooden Items */}
              <div style={{ background: '#FFFBEB', border: '2px solid #F59E0B', borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#B45309', marginBottom: 6 }}>
                  W = {L('काठबाट बनेका वस्तुहरू', 'Wooden Objects')}
                </div>
                <div style={{ fontSize: 13, color: '#92400E', minHeight: 48, marginBottom: 8 }}>
                  W = {'{ '}
                  {woodSet.map((i) => (isNe ? i.nameNp : i.nameEn)).join(', ') || L('∅', '∅')}
                  {' }'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, background: '#FEF3C7', color: '#92400E', display: 'inline-block', padding: '2px 8px', borderRadius: 6 }}>
                  n(W) = {isNe ? toNp(woodSet.length) : woodSet.length}
                </div>
              </div>

              {/* Set B: Books & Bags */}
              <div style={{ background: '#FDF2F8', border: '2px solid #EC4899', borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#BE185D', marginBottom: 6 }}>
                  B = {L('पढ्ने/लेख्ने पुस्तक र झोला', 'Books and Bags')}
                </div>
                <div style={{ fontSize: 13, color: '#9D174D', minHeight: 48, marginBottom: 8 }}>
                  B = {'{ '}
                  {bookSet.map((i) => (isNe ? i.nameNp : i.nameEn)).join(', ') || L('∅', '∅')}
                  {' }'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, background: '#FCE7F3', color: '#9D174D', display: 'inline-block', padding: '2px 8px', borderRadius: 6 }}>
                  n(B) = {isNe ? toNp(bookSet.length) : bookSet.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: SET RELATIONSHIPS ───────────────────── */}
        {activeStep === 'relations' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 16 }}>
              {L('कक्षाकोठाका समूहहरूको सम्बन्ध पहिचान', 'Analyze Relationships Among Classroom Sets')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {/* Equivalent Sets Discovery */}
              <div style={{ background: '#F0FDF4', border: '2px solid #16A34A', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#166534', marginBottom: 6 }}>
                  {L('समतुल्य समूह सम्बन्ध (A ~ B)', 'Equivalent Sets Relation (A ~ B)')}
                </div>
                <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: '0 0 10px' }}>
                  {L(
                    `यदि n(M) = ${toNp(mathSet.length)} र n(W) = ${toNp(woodSet.length)} बराबर छन् भने M ~ W समतुल्य समूह हुन्छन्।`,
                    `If n(M) and another set have equal counts, they are equivalent sets.`
                  )}
                </p>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#166534' }}>
                  {mathSet.length === woodSet.length
                    ? `✓ M ~ W [n(M) = n(W) = ${isNe ? toNp(mathSet.length) : mathSet.length}]`
                    : `M ≁ W [n(M) = ${isNe ? toNp(mathSet.length) : mathSet.length} ≠ n(W) = ${isNe ? toNp(woodSet.length) : woodSet.length}]`}
                </div>
              </div>

              {/* Subset Discovery */}
              <div style={{ background: '#EFF6FF', border: '2px solid #3B82F6', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#1D4ED8', marginBottom: 6 }}>
                  {L('उपसमूह सम्बन्ध (Subset Relation: ⊂ U)', 'Subset Relation (⊂ U)')}
                </div>
                <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: '0 0 10px' }}>
                  {L(
                    'कक्षाकोठामा बनेका S, M, W, B सबै समूहहरू कक्षाकोठाको सर्वव्यापक समूह U का उचित उपसमूहहरू हुन्।',
                    'All smaller sets S, M, W, B are proper subsets of Universal Set U.'
                  )}
                </p>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1D4ED8' }}>
                  ✓ S ⊂ U, &nbsp; M ⊂ U, &nbsp; W ⊂ U, &nbsp; B ⊂ U
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: PROJECT PRESENTATION ────────────────── */}
        {activeStep === 'project' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: 4 }}>
                📋 {L('पाठ्यपुस्तक परियोजना कार्य (Project Work - Page 15)', 'Textbook Project Work (Page 15)')}
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#14532D', lineHeight: 1.4 }}>
                "{L('आफ्नो कक्षाकोठामा भएका 10 pcs वस्तुहरूको सूची तयार गर्नुहोस् र साझा विशेषताका आधारमा समूहहरू बनाई कक्षामा प्रस्तुत गर्नुहोस्।', 'Prepare a list of 10 items in your classroom, form different sets based on common properties, and present in class.')}"
              </h3>
            </div>

            {/* Presentation Card */}
            <div style={{ background: '#F8FAFC', border: '2px solid #CBD5E1', borderRadius: 16, padding: 20 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 900, color: '#0F172A' }}>
                🎓 {L('विद्यार्थी प्रस्तुतीकरण प्रतिवेदन (Student Presentation Report)', 'Student Presentation Report')}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <div>
                  <strong>{L('सर्वव्यापक समूह U:', 'Universal Set U:')}</strong> {'{ '}
                  {CLASSROOM_ITEMS.slice(0, 10).map((x) => (isNe ? x.nameNp : x.nameEn)).join(', ')}
                  {' }'} (n = {isNe ? '10' : '10'})
                </div>
                <div>
                  <strong>{L('1. स्टेशनरी समूह S:', '1. Stationery Set S:')}</strong> n(S) = {isNe ? toNp(stationerySet.length) : stationerySet.length}
                </div>
                <div>
                  <strong>{L('2. गणितीय औजार समूह M:', '2. Math Tools Set M:')}</strong> n(M) = {isNe ? toNp(mathSet.length) : mathSet.length}
                </div>
                <div>
                  <strong>{L('3. काठका वस्तुहरूको समूह W:', '3. Wooden Set W:')}</strong> n(W) = {isNe ? toNp(woodSet.length) : woodSet.length}
                </div>
                <div>
                  <strong>{L('4. निष्कर्ष:', '4. Conclusion:')}</strong> {L('सबै समूहहरू सीमित छन् र U का उपसमूह हुन्।', 'All groups are finite sets and proper subsets of U.')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ClassroomSetFormation3D;
