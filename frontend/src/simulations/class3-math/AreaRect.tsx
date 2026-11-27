/**
 * Lesson 22 · Area (क्षेत्रफल)
 * Tile the Rectangle — 2D grid covering of rectangles with 1 cm² square tiles (Area = L × B).
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

export const AreaRect: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L22-01',
    chapter: 22,
    titleNp: 'आयत टाइल (क्षेत्रफल)',
    titleEn: 'Tile the Rectangle (Area)',
  });

  const [length, setLength] = useState(5);
  const [breadth, setBreadth] = useState(3);
  const [filledRows, setFilledRows] = useState(3); // rows filled with tiles

  const totalArea = length * breadth;
  const currentTiles = length * filledRows;

  const applyDims = (l: number, b: number) => {
    setLength(l);
    setBreadth(b);
    setFilledRows(b);
    kit.tap();
    kit.say(
      `लम्बाइ ${l} सेमी र चौडाइ ${b} सेमी। क्षेत्रफल = ${l * b} वर्ग सेमी।`,
      `Length ${l} cm and width ${b} cm. Area = ${l * b} sq cm.`
    );
  };

  const addRow = () => {
    if (filledRows >= breadth) {
      setFilledRows(1);
    } else {
      setFilledRows(filledRows + 1);
    }
    kit.tap();
    const rowsNow = filledRows >= breadth ? 1 : filledRows + 1;
    kit.say(`${rowsNow} पङ्क्ति × ${length} = ${rowsNow * length} वर्ग`, `${rowsNow} rows × ${length} = ${rowsNow * length} squares`);
    if (rowsNow === breadth) kit.star();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const ql = rnd(3, 9);
      const qb = rnd(2, 6);
      const qArea = ql * qb;
      return {
        np: `लम्बाइ ${ql} सेमी र चौडाइ ${qb} सेमी भएको आयतको क्षेत्रफल कति हुन्छ?`,
        en: `What is the area of a rectangle with length ${ql} cm and width ${qb} cm?`,
        answer: String(qArea),
        options: near(qArea, i + 2, [ql, -ql, qb, -qb, 2 * (ql + qb)]).map((x) => ({
          key: String(x),
          label: `${fmt(kit.lang, x)} ${kit.t('वर्ग सेमी', 'cm²')}`,
        })),
      };
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `क्षेत्रफल = लम्बाइ × चौडाइ = ${length} × ${breadth} = ${totalArea} वर्ग सेन्टिमिटर (cm²)`,
        `Area = Length × Width = ${length} × ${breadth} = ${totalArea} square centimetres (cm²)`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => length > 2 && applyDims(length - 1, breadth)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('लम्बाइ', 'Length')} −
          </button>
          <button
            onClick={() => length < 9 && applyDims(length + 1, breadth)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('लम्बाइ', 'Length')} +
          </button>
          <button
            onClick={() => breadth > 2 && applyDims(length, breadth - 1)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('चौडाइ', 'Width')} −
          </button>
          <button
            onClick={() => breadth < 6 && applyDims(length, breadth + 1)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('चौडाइ', 'Width')} +
          </button>
          <button
            onClick={addRow}
            style={{
              padding: '9px 18px',
              borderRadius: 12,
              border: 'none',
              background: '#187C68',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {filledRows >= breadth ? `🔄 ${kit.t('फेरि टाइल भरौँ', 'Restart Tiles')}` : `＋ ${kit.t('पङ्क्ति थपौँ', 'Add Row')}`}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 650, gap: 16 }}>
        {/* Area Formula Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 900, color: '#187C68' }}>
            {fmt(kit.lang, length)} × {fmt(kit.lang, breadth)} = {fmt(kit.lang, totalArea)} {kit.t('वर्ग सेमी', 'cm²')}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginTop: 4 }}>
            {kit.t('भरिएको टाइल:', 'Filled tiles:')} {fmt(kit.lang, currentTiles)} / {fmt(kit.lang, totalArea)} {kit.t('वटा (१ सेमी × १ सेमी)', 'units (1cm × 1cm)')}
          </div>
        </div>

        {/* 2D Tiled Rectangle Grid */}
        <div
          style={{
            position: 'relative',
            background: '#FFFFFF',
            borderRadius: 18,
            border: '3px solid #1E293B',
            padding: '30px 40px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Top Length Label */}
          <div
            style={{
              position: 'absolute',
              top: 6,
              fontSize: 13,
              fontWeight: 800,
              color: '#0284C7',
              background: '#E0F2FE',
              padding: '2px 10px',
              borderRadius: 6,
            }}
          >
            ↔ {kit.t('लम्बाइ (Length)', 'Length')}: {fmt(kit.lang, length)} {kit.t('सेमी', 'cm')}
          </div>

          {/* Left Breadth Label */}
          <div
            style={{
              position: 'absolute',
              left: 6,
              top: '50%',
              transform: 'translateY(-50%) rotate(-90deg)',
              fontSize: 13,
              fontWeight: 800,
              color: '#16A34A',
              background: '#DCFCE7',
              padding: '2px 10px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
            }}
          >
            ↕ {kit.t('चौडाइ (Width)', 'Width')}: {fmt(kit.lang, breadth)} {kit.t('सेमी', 'cm')}
          </div>

          {/* Grid Rows */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${length}, 44px)`,
              gap: 2,
              background: '#CBD5E1',
              padding: 2,
              borderRadius: 8,
            }}
          >
            {Array.from({ length: breadth }).map((_, rIdx) =>
              Array.from({ length: length }).map((__, cIdx) => {
                const isFilled = rIdx < filledRows;
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 4,
                      background: isFilled
                        ? ((rIdx + cIdx) % 2 === 0 ? '#FB7185' : '#FDA4AF')
                        : '#FFFFFF',
                      border: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      color: isFilled ? '#881337' : '#CBD5E1',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isFilled ? '1' : ''}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default AreaRect;
