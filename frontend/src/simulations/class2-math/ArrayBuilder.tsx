/**
 * Lesson 16 · Multiplication 2 (गुणन २)
 * Array Builder — rows and columns build the multiplication tables; commutative property a × b = b × a.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const ROW_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];

export const ArrayBuilder: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L16-01',
    chapter: 16,
    titleNp: 'पङ्क्ति र स्तम्भ (पहाडा)',
    titleEn: 'Array Builder (Multiplication Tables)',
  });

  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [litCount, setLitCount] = useState(12);
  const [isCounting, setIsCounting] = useState(false);
  const [li, setLi] = useState(0);

  const total = rows * cols;

  const countRowByRow = () => {
    if (isCounting) return;
    setIsCounting(true);
    setLitCount(0);
    let n = 0;
    const interval = setInterval(() => {
      n += 1;
      setLitCount(n);
      if (n % cols === 0) {
        kit.say(`${toNp(n)}`, `${n}`);
      }
      if (n >= total) {
        clearInterval(interval);
        setIsCounting(false);
        kit.good(
          `${toNp(rows)} × ${toNp(cols)} = ${toNp(total)}`,
          `${rows} × ${cols} = ${total}`
        );
        kit.star();
      }
    }, 120);
  };

  const swapRowsCols = () => {
    if (isCounting) return;
    kit.tap();
    const newRows = cols;
    const newCols = rows;
    setRows(newRows);
    setCols(newCols);
    setLitCount(newRows * newCols);
    kit.say(
      `${toNp(newRows)} × ${toNp(newCols)} = ${toNp(total)}। उत्तर उही आउँछ!`,
      `${newRows} × ${newCols} = ${total}. Same answer!`
    );
  };

  const LEARN_PRESETS = [
    [2, 5],
    [3, 4],
    [4, 3],
    [5, 2],
    [6, 3],
  ];

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      const p = LEARN_PRESETS[li % LEARN_PRESETS.length];
      setRows(p[0]);
      setCols(p[1]);
      setLitCount(p[0] * p[1]);
      kit.say(
        `पङ्क्ति र स्तम्भ मिलाउँदा गुणन बन्छ: ${toNp(p[0])} × ${toNp(p[1])} = ${toNp(p[0] * p[1])}।`,
        `Rows and columns make multiplication: ${p[0]} × ${p[1]} = ${p[0] * p[1]}.`
      );
    } else if (kit.mode === 'PLAY') {
      setRows(rnd(2, 6));
      setCols(rnd(2, 6));
      setLitCount(rows * cols);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Quiz Questions for Challenge Mode
  const data = useMemo(() => Array.from({ length: 8 }, () => {
    const r = rnd(2, 8);
    const c = rnd(2, 8);
    return { r, c };
  }), []);

  const questions: (QuizQuestion & { r: number; c: number })[] = data.map((d, i) => ({
    np: `${toNp(d.r)} पङ्क्ति र ${toNp(d.c)} स्तम्भ भएको लहरमा जम्मा कति वटा कोठा हुन्छन्? (${toNp(d.r)} × ${toNp(d.c)})`,
    en: `How many items in total with ${d.r} rows and ${d.c} columns? (${d.r} × ${d.c})`,
    r: d.r,
    c: d.c,
    answer: String(d.r * d.c),
    options: numChoices(d.r * d.c, i * 11 + 3, [d.r, -d.r, d.c, -d.c, 1]).map((v) => ({
      key: String(v),
      label: fmt(kit.lang, v),
    })),
  }));

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #187C68',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        fontSize: 18,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      <span style={{ color: '#0284C7' }}>{toNp(rows)}</span> ×{' '}
      <span style={{ color: '#E11D48' }}>{toNp(cols)}</span> ={' '}
      <span style={{ color: '#16A34A' }}>{toNp(total)}</span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Adjust Rows */}
        <div style={{ display: 'inline-flex', gap: 4, background: '#EFF6FF', padding: '4px 8px', borderRadius: 10, border: '1px solid #BFDBFE' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0284C7', alignSelf: 'center', marginRight: 4 }}>
            {kit.t('पङ्क्ति (Rows):', 'Rows:')}
          </span>
          <CBtn color="#0284C7" disabled={rows >= 8} onClick={() => { setRows((r) => r + 1); setLitCount((rows + 1) * cols); }}>+१</CBtn>
          <CBtn color="#0284C7" disabled={rows <= 1} onClick={() => { setRows((r) => r - 1); setLitCount((rows - 1) * cols); }}>-१</CBtn>
        </div>

        {/* Adjust Columns */}
        <div style={{ display: 'inline-flex', gap: 4, background: '#FFF1F2', padding: '4px 8px', borderRadius: 10, border: '1px solid #FECDD3' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#E11D48', alignSelf: 'center', marginRight: 4 }}>
            {kit.t('स्तम्भ (Cols):', 'Cols:')}
          </span>
          <CBtn color="#E11D48" disabled={cols >= 8} onClick={() => { setCols((c) => c + 1); setLitCount(rows * (cols + 1)); }}>+१</CBtn>
          <CBtn color="#E11D48" disabled={cols <= 1} onClick={() => { setCols((c) => c - 1); setLitCount(rows * (cols - 1)); }}>-१</CBtn>
        </div>

        <CBtn color="#10B981" disabled={isCounting} onClick={countRowByRow}>
          ▶ {kit.t('पालैपालो गनौँ', 'Count Array')}
        </CBtn>

        <CBtn color="#8B5CF6" disabled={isCounting} onClick={swapRowsCols}>
          🔄 {kit.t('उल्ट्याऔँ (साटौँ)', 'Swap (a×b = b×a)')}
        </CBtn>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को उदाहरण', 'Next')} ➜
          </CBtn>
        )}
      </div>
    </Controls>
  );

  return (
    <SimFrame2D kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} grade={2}>
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          gap: 16,
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: '30px 40px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Header Explanation */}
          <div style={{ fontSize: 16, fontWeight: 800, color: '#64748B' }}>
            <span style={{ color: '#0284C7', fontWeight: 900 }}>{toNp(rows)} {kit.t('तेर्सो पङ्क्ति', 'Rows')}</span> ×{' '}
            <span style={{ color: '#E11D48', fontWeight: 900 }}>{toNp(cols)} {kit.t('ठाडो स्तम्भ', 'Columns')}</span> ={' '}
            <span style={{ color: '#16A34A', fontWeight: 900 }}>{toNp(total)} {kit.t('जम्मा कोठा', 'Total Cubes')}</span>
          </div>

          {/* 2D Grid Array */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 52px)`,
              gridTemplateRows: `repeat(${rows}, 52px)`,
              gap: 8,
              background: '#F8FAFC',
              padding: 16,
              borderRadius: 18,
              border: '2px solid #E2E8F0',
            }}
          >
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((_, c) => {
                const cellIndex = r * cols + c + 1;
                const isLit = cellIndex <= litCount;
                const color = ROW_COLORS[r % ROW_COLORS.length];

                return (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 10,
                      background: isLit ? color : '#E2E8F0',
                      border: `2px solid ${isLit ? color : '#CBD5E1'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isLit ? '#FFFFFF' : '#94A3B8',
                      fontWeight: 900,
                      fontSize: 16,
                      boxShadow: isLit ? '0 3px 8px rgba(0,0,0,0.12)' : 'none',
                      transition: 'all 0.18s ease',
                      transform: isLit ? 'scale(1)' : 'scale(0.95)',
                    }}
                  >
                    {toNp(cellIndex)}
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
