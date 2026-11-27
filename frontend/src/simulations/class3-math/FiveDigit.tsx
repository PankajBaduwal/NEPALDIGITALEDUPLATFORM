/**
 * Lesson 2 · Five-digit numbers
 * Five-Digit Towers — five columns of counters (ten-thousands, thousands, hundreds, tens, ones); build, read and write numbers up to 99,999.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { shuffle, rnd, toNp } from '../class1-math-kit/nepali';
import { PlaceValuePillars2D } from './PlaceValuePillars2D';
import { PLACES, digitsOf, big, fmt, words, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

const EXAMPLES = [23456, 40507, 76000, 9999, 50050];

export const FiveDigit: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L2-01',
    chapter: 2,
    titleNp: 'पाँच अङ्कका टावर',
    titleEn: 'Five-Digit Towers',
  });

  const [digits, setDigits] = useState<number[]>([2, 3, 4, 5, 6]);
  const [li, setLi] = useState(0);

  const value = digits.reduce((a, v) => a * 10 + v, 0);

  const applyDigits = (nd: number[], speak = true) => {
    setDigits(nd);
    const v = nd.reduce((a, x) => a * 10 + x, 0);
    if (speak) {
      kit.say(
        `${toNp(v.toLocaleString('en-US'))} — ${words(v)}`,
        `${v.toLocaleString('en-US')} — ${words(v)}`
      );
    }
  };

  const handleAddDigit = (colIdx: number) => {
    if (digits[colIdx] >= 9) return;
    kit.tap();
    const nd = [...digits];
    nd[colIdx] += 1;
    applyDigits(nd, false);
  };

  const handleDelDigit = (colIdx: number) => {
    if (digits[colIdx] <= 0) return;
    kit.tap();
    const nd = [...digits];
    nd[colIdx] -= 1;
    applyDigits(nd, false);
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      applyDigits(digitsOf(EXAMPLES[li % EXAMPLES.length]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Quiz questions for Challenge Mode
  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    v: rnd(10000, 99999),
    c: rnd(0, 4),
    kind: i % 2,
  })), []);

  const questions: QuizQuestion[] = data.map((q, i) => {
    const ds = digitsOf(q.v);
    const t = q.v.toLocaleString('en-US');
    if (q.kind === 0) {
      const opts = shuffle(Array.from(new Set([ds[q.c], (ds[q.c] + 1) % 10, (ds[q.c] + 4) % 10])), i + 2);
      return {
        np: `${toNp(t)} मा ${PLACES[q.c].np}को स्थानमा कुन अङ्क छ?`,
        en: `In ${t}, which digit is in the ${PLACES[q.c].en.toLowerCase()} place?`,
        answer: String(ds[q.c]),
        options: opts.map((x) => ({ key: String(x), label: fmt(kit.lang, x) })),
      };
    }
    const pv = ds[q.c] * 10 ** (4 - q.c);
    const opts = near(pv, i + 6, [10 ** (4 - q.c), -(10 ** (4 - q.c)), 10 ** (5 - q.c), ds[q.c]]);
    return {
      np: `${toNp(t)} मा ${PLACES[q.c].np}को अङ्कको स्थानीय मान कति हो?`,
      en: `What is the place value of the ${PLACES[q.c].en.toLowerCase()} digit in ${t}?`,
      answer: String(pv),
      options: opts.map((x) => ({ key: String(x), label: big(kit.lang, x) })),
    };
  });

  const expandedForm = digits
    .map((x, i) => x * 10 ** (4 - i))
    .filter((x) => x > 0)
    .map((x) => toNp(x.toLocaleString('en-US')))
    .join(' + ') || '0';

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #8B5CF6',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 900, color: '#8B5CF6' }}>
        {big(kit.lang, value)}
      </div>
      <div style={{ fontSize: 13, color: '#475569', fontWeight: 800 }}>
        {expandedForm}
      </div>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(_q: any, i: number) => applyDigits(digitsOf(data[i].v), false)} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#26332E' }}>
          {kit.t('स्थानमान नियन्त्रण:', 'Place Value Controls:')}
        </span>
        {PLACES.map((p, c) => (
          <div
            key={p.en}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#F1F5F9',
              borderRadius: 10,
              padding: '2px 6px',
            }}
          >
            <CBtn
              color={p.color}
              style={{ minWidth: 32, minHeight: 34, padding: '2px 6px', fontSize: 12 }}
              onClick={() => handleDelDigit(c)}
            >
              −
            </CBtn>
            <span style={{ fontWeight: 900, fontSize: 12, minWidth: 34, textAlign: 'center', color: p.color }}>
              {kit.t(p.np, p.en)}
            </span>
            <CBtn
              color={p.color}
              style={{ minWidth: 32, minHeight: 34, padding: '2px 6px', fontSize: 12 }}
              onClick={() => handleAddDigit(c)}
            >
              +
            </CBtn>
          </div>
        ))}

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को संख्या', 'Next')} ➜
          </CBtn>
        )}

        {kit.mode === 'PLAY' && (
          <CBtn color="#8B5CF6" onClick={() => applyDigits(digitsOf(rnd(10000, 99999)))}>
            🎲 {kit.t('नयाँ संख्या', 'Random')}
          </CBtn>
        )}
      </div>
    </Controls>
  );

  return (
    <SimFrame2D kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} grade={3}>
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 380,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <PlaceValuePillars2D
          digits={digits}
          lang={kit.lang}
          interactive
          onAddDigit={handleAddDigit}
          onDelDigit={handleDelDigit}
        />
      </div>
    </SimFrame2D>
  );
};
