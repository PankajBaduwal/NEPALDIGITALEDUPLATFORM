/**
 * DecimalMeasurementGeometryLab.tsx
 * Grade 7 Mathematics – Lesson 5: FRACTION AND DECIMAL (भिन्न र दशमलव)
 * Simulation 11: Decimal Measurement and Geometry Lab (2D + Selective 3D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 85-86)
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowLeft, Box, Sparkles, Check, RotateCcw, HelpCircle, Layers, Ruler, DollarSign } from 'lucide-react';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'लम्बाइ ५.२५ फिट र चौडाइ ३.५ फिट भएको टेबलको परिमिति (Perimeter) कति हुन्छ?',
    en: 'What is the perimeter of a table with length 5.25 ft and breadth 3.5 ft?',
    options: [
      { key: 'A', label: '१७.५ फिट [२ × (५.२५ + ३.५)]' },
      { key: 'B', label: '१८.३७५ फिट' },
      { key: 'C', label: '८.७५ फिट' },
      { key: 'D', label: '३५ फिट' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा वर्गाकार टेबलको परिमिति २४.४ फिट छ भने त्यसको एक भुजाको लम्बाइ कति हुन्छ?',
    en: 'If the perimeter of a square table is 24.4 ft, what is the length of one side?',
    options: [
      { key: 'A', label: '६.१ फिट (२४.४ ÷ ४ = ६.१)' },
      { key: 'B', label: '१२.२ फिट' },
      { key: 'C', label: '४.८ फिट' },
      { key: 'D', label: '६.२ फिट' },
    ],
    answer: 'A',
  },
  {
    np: 'आयताकार खेतको क्षेत्रफल २१५.६६ वर्ग मि. र लम्बाइ ६७.३५ मि. भए चौडाइ कति हुन्छ?',
    en: 'If a rectangular field has area 215.66 sq. m and length 67.35 m, what is the breadth?',
    options: [
      { key: 'A', label: '३.२ मिटर (२१५.६६ ÷ ६७.३५ = ३.२)' },
      { key: 'B', label: '२.८ मिटर' },
      { key: 'C', label: '४.५ मिटर' },
      { key: 'D', label: '५.१ मिटर' },
    ],
    answer: 'A',
  },
  {
    np: 'मुद्रा सटहीमा खरिद दर (Buying Rate) भन्दा बिक्री दर (Selling Rate) सधैं के हुन्छ?',
    en: 'In currency exchange, how does the Selling Rate compare to the Buying Rate?',
    options: [
      { key: 'A', label: 'बढी हुन्छ (Higher, बैंकको मुनाफा)' },
      { key: 'B', label: 'कम हुन्छ' },
      { key: 'C', label: 'सधैं बराबर हुन्छ' },
      { key: 'D', label: 'कुनै सम्बन्ध छैन' },
    ],
    answer: 'A',
  },
];

export const DecimalMeasurementGeometryLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L5-04',
    titleEn: 'Decimal Measurement & Geometry Lab',
    titleNp: 'दशमलव नाप र ज्यामिति प्रयोगशाला',
    chapter: 5,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'table_2d' | 'garden_3d' | 'square_table' | 'field_area' | 'currency'>('table_2d');

  // ── Tab 1: Rectangular Table State ───────────────────────────
  const [tableLen, setTableLen] = useState<number>(5.25);
  const [tableBreadth, setTableBreadth] = useState<number>(3.5);
  const tablePerimeter = 2 * (tableLen + tableBreadth);
  const tableArea = tableLen * tableBreadth;

  // ── Tab 2: 3D Garden View ────────────────────────────────────
  const gardenMountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab !== 'garden_3d') return;
    const container = gardenMountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0fdf4);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 20, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x475569, 1.2);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.3);
    dir.position.set(15, 25, 15);
    scene.add(dir);

    // 3D Table / Garden model
    const tableGeo = new THREE.BoxGeometry(16, 0.8, 10);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = 0.4;
    scene.add(tableMesh);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      tableMesh.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [activeTab]);

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
              {L('कक्षा ७ • गणित • अध्याय ५: भिन्न र दशमलव', 'Class 7 • Math • Chapter 5: Fraction & Decimal')}
            </div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
              {isNe ? 'दशमलव नाप र ज्यामिति प्रयोगशाला (२D + ३D)' : 'Decimal Measurement & Geometry Lab (2D + 3D)'}
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

      {/* Main Body */}
      <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          {[
            { id: 'table_2d', np: '१. आयताकार टेबल नाप (५.२५ × ३.५ फिट)', en: '1. Rectangular Table' },
            { id: 'garden_3d', np: '२. ३D आयताकार बगैँचा दृश्य', en: '2. 3D Garden View' },
            { id: 'square_table', np: '३. वर्गाकार टेबल (परिमिति २४.४ फिट)', en: '3. Square Table' },
            { id: 'field_area', np: '४. खेतको क्षेत्रफलबाट चौडाइ (२१५.६६ m²)', en: '4. Field Area to Breadth' },
            { id: 'currency', np: '५. विदेशी मुद्रा सटही परियोजना (Currency)', en: '5. Currency Exchange' },
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

        {/* ── TAB 1: RECTANGULAR TABLE ─────────────────────── */}
        {activeTab === 'table_2d' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण (पृष्ठ ८५)', 'Textbook Example (Page 85)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('टेबलको परिमिति हिसाब: P = २(l + b) = २(५.२५ + ३.५) = १७.५ फिट', 'Table Perimeter: P = 2(l + b) = 2(5.25 + 3.5) = 17.5 ft')}
            </h3>

            {/* Visual Table Frame */}
            <div style={{ background: '#F8FAFC', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div
                style={{
                  width: 320,
                  height: 180,
                  background: '#FEF3C7',
                  border: '4px solid #D97706',
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 800, color: '#92400E' }}>
                  लम्बाइ (Length) = ५.२५ फिट
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#92400E', marginTop: 8 }}>
                  चौडाइ (Breadth) = ३.५० फिट
                </span>
              </div>
            </div>

            <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 18, borderRadius: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#166534' }}>
                • परिमिति (P) = २ × (५.२५ + ३.५०) = २ × ८.७५ = <strong>१७.५ फिट</strong><br />
                • क्षेत्रफल (A) = ५.२५ × ३.५० = <strong>१८.३७५ वर्ग फिट</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: 3D GARDEN VIEW ────────────────────────── */}
        {activeTab === 'garden_3d' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('३D आयताकार बगैँचा नाप मोडेल (२२.६६ मि. × १५.६५ मि.)', '3D Rectangular Garden Model (22.66 m × 15.65 m)')}
            </h3>

            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative' }}>
              <div ref={gardenMountRef} style={{ width: '100%', height: 340 }} />
            </div>

            <div style={{ marginTop: 16, background: '#F0FDFA', border: '2px solid #99F6E4', padding: 18, borderRadius: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0F766E' }}>
                • क्षेत्रफल (Area) = २२.६६ × १५.६५ = <strong>३५४.६२९ वर्ग मिटर</strong><br />
                • परिमिति (Perimeter) = २ × (२२.६६ + १५.६५) = २ × ३८.३१ = <strong>७६.६२ मिटर</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: SQUARE TABLE ──────────────────────────── */}
        {activeTab === 'square_table' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक समस्या (पृष्ठ ८६)', 'Textbook Problem (Page 86)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('वर्गाकार टेबलको परिमिति २४.४ फिट भए एक भुजाको लम्बाइ निकाल्ने', 'Square Table: Perimeter 24.4 ft ⟹ Side Length')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 15, color: '#1E293B', lineHeight: 1.8 }}>
                <div>• वर्गाकार टेबलमा चारवटै भुजा बराबर हुन्छन् (P = ४ × l)</div>
                <div>• २४.४ = ४ × l</div>
                <div>• l = २४.४ ÷ ४</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#0F766E', marginTop: 8 }}>
                  l = <strong>६.१ फिट</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: FIELD AREA TO BREADTH ─────────────────── */}
        {activeTab === 'field_area' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक समस्या: खेतको क्षेत्रफल (पृष्ठ ८६)', 'Textbook Field Problem (Page 86)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('खेतको क्षेत्रफल २१५.६६ m² र लम्बाइ ६७.३५ m भए चौडाइ निकाल्ने', 'Field: Area 215.66 m² and Length 67.35 m ⟹ Breadth')}
            </h3>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 15, color: '#134E4A', lineHeight: 2 }}>
                <div>• चौडाइ (Breadth) = क्षेत्रफल ÷ लम्बाइ (Area ÷ Length)</div>
                <div>• b = २१५.६६ ÷ ६७.३५</div>
                <div>• दशमलव बिन्दु हटाउन १०० ले गुणन गर्दा: २१५६६ ÷ ६७३५</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#0F766E', marginTop: 8 }}>
                  b = <strong>३.२ मिटर</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: CURRENCY EXCHANGE ─────────────────────── */}
        {activeTab === 'currency' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक परियोजना कार्य (पृष्ठ ८६)', 'Textbook Project Work (Page 86)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('विदेशी मुद्रा सटही दर (खरिद दर, बिक्री दर र अन्तर हिसाब)', 'Foreign Currency Exchange Rates: Buying vs Selling Rates')}
            </h3>

            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                    <th style={{ padding: '10px 14px' }}>मुद्रा (Currency)</th>
                    <th style={{ padding: '10px 14px' }}>एकाइ (Unit)</th>
                    <th style={{ padding: '10px 14px' }}>खरिद दर (Buying)</th>
                    <th style={{ padding: '10px 14px' }}>बिक्री दर (Selling)</th>
                    <th style={{ padding: '10px 14px' }}>अन्तर (Difference)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { curr: 'अमेरिकी डलर (USD)', unit: '१', buy: 132.50, sell: 133.10 },
                    { curr: 'युरोपियन युरो (EUR)', unit: '१', buy: 142.20, sell: 142.85 },
                    { curr: 'युके पाउन्ड (GBP)', unit: '१', buy: 167.40, sell: 168.15 },
                    { curr: 'अष्ट्रेलियन डलर (AUD)', unit: '१', buy: 86.30, sell: 86.70 },
                    { curr: 'जापानी येन (JPY)', unit: '१०', buy: 8.90, sell: 8.95 },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 800 }}>{row.curr}</td>
                      <td style={{ padding: '10px 14px' }}>{row.unit}</td>
                      <td style={{ padding: '10px 14px', color: '#166534', fontWeight: 700 }}>रु. {row.buy.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', color: '#DC2626', fontWeight: 700 }}>रु. {row.sell.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 900, color: '#0F766E' }}>
                        रु. {(row.sell - row.buy).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
              💡 {L('बिक्री दर र खरिद दरको अन्तर नै बैंक तथा सटही काउन्टरको सेवा शुल्क तथा मुनाफा हो।', 'The spread between selling and buying rates represents the exchange service margin.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default DecimalMeasurementGeometryLab;
