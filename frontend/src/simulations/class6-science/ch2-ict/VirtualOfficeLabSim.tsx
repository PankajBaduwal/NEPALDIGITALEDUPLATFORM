/**
 * VirtualOfficeLabSim.tsx
 * Simulation 4: Interactive Virtual Office Laboratory
 * Grade 6 Science • Unit 2: Information & Communication Technology
 *
 * Hands-on educational office suite:
 * 1. Word Processor: Text formatting (Bold, Italic), heading hierarchy, bullet points, inserting tables.
 * 2. Presentation Maker: Slide creation, transitions, titles and bullet points.
 * 3. Spreadsheet Studio: Grid table with interactive rows & columns, real-time formula computation (=SUM, =AVERAGE).
 */
import React, { useState } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  FileText,
  Presentation,
  Table as TableIcon,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  List,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Calculator,
} from 'lucide-react';

type OfficeMode = 'word' | 'presentation' | 'spreadsheet';

export const VirtualOfficeLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<OfficeMode>('word');

  // 1. Word Processing State
  const [docText, setDocText] = useState<string>(
    'Grade 6 Science Project: Nepal Digital Education Platform.\nWe study ecosystems, electricity, matter, and technology.'
  );
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [alignment, setAlignment] = useState<'left' | 'center'>('left');

  // 2. Presentation State
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const slides = [
    {
      titleEn: 'Science & Technology Grade 6',
      titleNe: 'विज्ञान तथा प्रविधि कक्षा 6',
      bullet1En: 'Unit 1: The Scientific Method & Experiments',
      bullet1Ne: 'पाठ 1: वैज्ञानिक पद्धति र नाप',
      bullet2En: 'Unit 2: Computer Hardware & Office Suites',
      bullet2Ne: 'पाठ 2: कम्प्युटर हार्डवेयर र सफ्टवेयर',
    },
    {
      titleEn: 'Photosynthesis & Life Process',
      titleNe: 'प्रकाश संश्लेषण र जीवन प्रक्रिया',
      bullet1En: 'Plants convert sunlight + CO2 + H2O into glucose',
      bullet1Ne: 'बिरुवाले घाम, पानी र कार्बनडाइअक्साइडबाट खाना बनाउँछन्',
      bullet2En: 'Oxygen is released for all living beings to breathe',
      bullet2Ne: 'सम्पूर्ण प्राणीहरूका लागि अक्सिजन ग्यास उत्सर्जन गर्दछन्',
    },
  ];

  // 3. Spreadsheet State
  const [sheetData, setSheetData] = useState<number[]>([85, 92, 78, 90]);
  const sum = sheetData.reduce((acc, v) => acc + v, 0);
  const avg = (sum / sheetData.length).toFixed(1);

  const handleUpdateCell = (idx: number, val: number) => {
    const next = [...sheetData];
    next[idx] = val;
    setSheetData(next);
    ScienceAudio.playClick();
    setStars(3);
    setIsCompleted(true);
    setStage('understand');
  };

  const handleReset = () => {
    setActiveTab('word');
    setDocText('Grade 6 Science Project: Nepal Digital Education Platform.');
    setIsBold(false);
    setIsItalic(false);
    setAlignment('left');
    setActiveSlide(0);
    setSheetData([85, 92, 78, 90]);
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    ScienceAudio.playWhoosh();
  };

  return (
    <SimulationLayout
      title="Virtual Office Laboratory (Word, Slides & Sheets)"
      titleNepali="भर्चुअल कार्यालय प्रयोगशाला (वर्ड, प्रिजेन्टेसन र स्प्रेडसिट)"
      chapterNumber={2}
      chapterTitle="Information & Communication Technology"
      chapterTitleNepali="सूचना तथा सञ्चार प्रविधि"
      currentStage={stage}
      onStageChange={setStage}
      lang={lang}
      onLanguageChange={setLang}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
      stars={stars}
      isCompleted={isCompleted}
      currentPromptEn="Switch between Word Processor, Slide Presentation, and Spreadsheet to perform real digital office tasks!"
      currentPromptNe="वर्ड प्रोसेसर (अक्षर सजावट), स्लाइड प्रिजेन्टेसन र स्प्रेडसिट (हिसाब) बीच परिवर्तन गरी कार्यहरू सिक्नुहोस्!"
      explanationEn="Office suites empower modern communication: Word processors format text & tables, presentation software communicates ideas visually, and spreadsheets calculate numerical data with formulas like SUM and AVERAGE."
      explanationNe="कार्यालय सफ्टवेयरले दैनिक काम सहज बनाउँछ: वर्डले दस्ताबेज सजाउँछ, प्रिजेन्टेसनले विचार प्रस्तुत गर्छ, र स्प्रेडसिटले SUM र AVERAGE सूत्रमार्फत हिसाब निकाल्छ।"
    >
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 390px',
          gap: '16px',
          padding: '16px',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Main Interactive Office App Viewport */}
        <div
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            background: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top Office Tab Bar */}
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              gap: '10px',
            }}
          >
            <button
              onClick={() => {
                setActiveTab('word');
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'word' ? '#0284c7' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'word' ? '#ffffff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <FileText style={{ width: '15px', height: '15px' }} />
              <span>Word Processor</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('presentation');
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'presentation' ? '#d97706' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'presentation' ? '#ffffff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Presentation style={{ width: '15px', height: '15px' }} />
              <span>Slide Presentation</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('spreadsheet');
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'spreadsheet' ? '#059669' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'spreadsheet' ? '#ffffff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <TableIcon style={{ width: '15px', height: '15px' }} />
              <span>Spreadsheet Studio</span>
            </button>
          </div>

          {/* Tab 1: Word Processor */}
          {activeTab === 'word' && (
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Word Toolbar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <button
                  onClick={() => setIsBold(!isBold)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isBold ? '#0284c7' : 'transparent',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <Bold style={{ width: '15px', height: '15px' }} />
                </button>

                <button
                  onClick={() => setIsItalic(!isItalic)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isItalic ? '#0284c7' : 'transparent',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <Italic style={{ width: '15px', height: '15px' }} />
                </button>

                <button
                  onClick={() => setAlignment('left')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: alignment === 'left' ? '#0284c7' : 'transparent',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <AlignLeft style={{ width: '15px', height: '15px' }} />
                </button>

                <button
                  onClick={() => setAlignment('center')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: alignment === 'center' ? '#0284c7' : 'transparent',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <AlignCenter style={{ width: '15px', height: '15px' }} />
                </button>
              </div>

              {/* Editable Page */}
              <div
                style={{
                  flex: 1,
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                  fontWeight: isBold ? 800 : 400,
                  fontStyle: isItalic ? 'italic' : 'normal',
                  textAlign: alignment,
                }}
              >
                <textarea
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontSize: '15px',
                    lineHeight: '1.7',
                    fontWeight: isBold ? 800 : 400,
                    fontStyle: isItalic ? 'italic' : 'normal',
                    textAlign: alignment,
                  }}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Presentation */}
          {activeTab === 'presentation' && (
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '90%',
                  aspectRatio: '16 / 9',
                  background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
                  borderRadius: '16px',
                  border: '2px solid rgba(56, 189, 248, 0.4)',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                }}
              >
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fef08a', margin: '0 0 16px 0' }}>
                  {lang === 'ne' ? slides[activeSlide].titleNe : slides[activeSlide].titleEn}
                </h2>
                <div style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.8' }}>
                  <div>• {lang === 'ne' ? slides[activeSlide].bullet1Ne : slides[activeSlide].bullet1En}</div>
                  <div>• {lang === 'ne' ? slides[activeSlide].bullet2Ne : slides[activeSlide].bullet2En}</div>
                </div>
              </div>

              {/* Slide Nav */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setActiveSlide(0);
                    ScienceAudio.playPop();
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeSlide === 0 ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Slide 1
                </button>
                <button
                  onClick={() => {
                    setActiveSlide(1);
                    ScienceAudio.playPop();
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeSlide === 1 ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Slide 2
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Spreadsheet Studio */}
          {activeTab === 'spreadsheet' && (
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                }}
              >
                fx: =SUM(B2:B5) = {sum} | =AVERAGE(B2:B5) = {avg}
              </div>

              {/* Data Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ffffff', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Row</th>
                    <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>A (Subject)</th>
                    <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>B (Science Marks)</th>
                  </tr>
                </thead>
                <tbody>
                  {['Physics Lab', 'Biology Practical', 'Chemistry Test', 'Computer Project'].map((sub, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                        {i + 2}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sub}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        <input
                          type="number"
                          value={sheetData[i]}
                          onChange={(e) => handleUpdateCell(i, Number(e.target.value))}
                          style={{
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: '#ffffff',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            width: '80px',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: 'rgba(5, 150, 105, 0.15)', fontWeight: 800 }}>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>∑</td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0', color: '#6ee7b7' }}>Total (SUM)</td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0', color: '#fef08a' }}>{sum}</td>
                  </tr>
                  <tr style={{ background: 'rgba(2, 132, 199, 0.15)', fontWeight: 800 }}>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>μ</td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0', color: '#38bdf8' }}>Average (AVERAGE)</td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0', color: '#fef08a' }}>{avg}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Office Science Sidebar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '18px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            <Sparkles style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                {lang === 'ne' ? 'कार्यालय सफ्टवेयर सीप' : 'Office Productivity Skills'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {lang === 'ne' ? 'वर्ड, प्रिजेन्टेसन र स्प्रेडसिट' : 'Word, Slides & Spreadsheets'}
              </div>
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
              1. Word Processor:
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
              {lang === 'ne'
                ? 'पत्र, प्रतिवेदन, निबन्ध र पाठ्यपुस्तकका अध्यायहरू टाइप गर्न, अक्षर ठूलो-सानो बनाउन र तालिका राख्न प्रयोग गरिन्छ।'
                : 'Used to write reports, letters, essays, format font styles (Bold, Italic), and arrange information in neat tables.'}
            </p>
          </div>

          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24', marginBottom: '4px' }}>
              2. Presentation:
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
              {lang === 'ne'
                ? 'स्लाइडहरूमा मुख्य बुँदा, तस्बिर र आकर्षक एनिमेसन राखेर दर्शकहरूलाई विचार वा परियोजना बुझाउन प्रयोग गरिन्छ।'
                : 'Presents concepts visually using slides, bullet points, charts, and slide transition effects for engaging talks.'}
            </p>
          </div>

          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#6ee7b7', marginBottom: '4px' }}>
              3. Spreadsheet:
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
              {lang === 'ne'
                ? 'रो (Rows) र कलम (Columns) भएको ग्रिडमा अङ्कहरू राखेर =SUM, =AVERAGE सूत्रमार्फत तुरुन्तै जोड र औसत निकालिन्छ।'
                : 'Grid of cells organized in rows and columns. Automatically computes math using formulas like =SUM and =AVERAGE.'}
            </p>
          </div>

          <button
            onClick={handleReset}
            style={{
              padding: '10px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid #e2e8f0',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              marginTop: 'auto',
            }}
          >
            <RotateCcw style={{ width: '14px', height: '14px' }} />
            <span>{lang === 'ne' ? 'पुन: सुरु गर्नुहोस्' : 'Reset Workspace'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
