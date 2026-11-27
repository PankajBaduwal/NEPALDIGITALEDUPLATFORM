/**
 * Lesson 7 · Addition — three-digit numbers
 * Add Town — join two numbers made of blocks; bundle 10 ones into a ten, 10 tens into a hundred.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, toNp } from '../class1-math-kit/nepali';
import { Base10Blocks2D } from './Base10Blocks2D';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const LEARN_PAIRS = [
  [234, 125],
  [346, 178],
  [457, 265],
  [568, 247],
  [129, 386],
];

export const AddTown: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L7-01',
    chapter: 7,
    titleNp: 'जोड सहर (तीन अङ्क)',
    titleEn: 'Add Town (three-digit addition)',
  });

  const [a, setA] = useState(234);
  const [b, setB] = useState(125);
  const [joined, setJoined] = useState(false);
  const [h, setH] = useState(0);
  const [t, setT] = useState(0);
  const [o, setO] = useState(0);
  const [li, setLi] = useState(0);

  const setup = (x: number, y: number) => {
    setA(x);
    setB(y);
    setJoined(false);
    setH(Math.floor(x / 100) + Math.floor(y / 100));
    setT(Math.floor((x % 100) / 10) + Math.floor((y % 100) / 10));
    setO((x % 10) + (y % 10));
  };

  const handleJoin = () => {
    setJoined(true);
    kit.tap();
    kit.say('दुवै सङ्ख्याका ब्लकहरू जोडौँ।', 'Join the blocks of both numbers.');
  };

  const canBundleOnes = joined && o >= 10;
  const canBundleTens = joined && t >= 10;
  const isFinished = joined && o < 10 && t < 10;

  const bundleOnes = () => {
    if (!canBundleOnes) return;
    kit.tap();
    setO((prev) => prev - 10);
    setT((prev) => prev + 1);
    kit.say('10 एकाइ मिलेर 1 नयाँ दशक बन्यो!', '10 ones bundled into 1 ten!');
  };

  const bundleTens = () => {
    if (!canBundleTens) return;
    kit.tap();
    setT((prev) => prev - 10);
    setH((prev) => prev + 1);
    kit.say('10 दशक मिलेर 1 नयाँ सय बन्यो!', '10 tens bundled into 1 hundred!');
  };

  useEffect(() => {
    if (isFinished && joined && kit.mode !== 'CHALLENGE') {
      kit.good(`${toNp(a)} + ${toNp(b)} = ${toNp(a + b)}`, `${a} + ${b} = ${a + b}`);
      kit.star();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished, joined]);

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      const pair = LEARN_PAIRS[li % LEARN_PAIRS.length];
      setup(pair[0], pair[1]);
      kit.say(
        `${toNp(pair[0])} र ${toNp(pair[1])} जोडौँ।`,
        `Let us add ${pair[0]} and ${pair[1]}.`
      );
    } else if (kit.mode === 'PLAY') {
      setup(rnd(120, 500), rnd(120, 450));
      kit.say('जोडौँ थिचेर ब्लक मिलाऔँ।', 'Press Join to put the blocks together.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Quiz questions for Challenge Mode
  const data = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    let x = 0, y = 0;
    for (;;) {
      x = rnd(120, 550);
      y = rnd(110, 380);
      if (x + y <= 999) break;
    }
    return { x, y, sum: x + y };
  }), []);

  const questions: (QuizQuestion & { x: number; y: number })[] = data.map((d, i) => ({
    np: `${toNp(d.x)} + ${toNp(d.y)} = ?`,
    en: `${d.x} + ${d.y} = ?`,
    x: d.x,
    y: d.y,
    answer: String(d.sum),
    options: numChoices(d.sum, i * 17 + 3, [10, -10, 100, 1, -1]).map((v) => ({
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
        fontSize: 22,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      <span style={{ color: '#0284C7' }}>{toNp(a)}</span> +{' '}
      <span style={{ color: '#E11D48' }}>{toNp(b)}</span> ={' '}
      <span style={{ color: isFinished ? '#16A34A' : '#94A3B8' }}>
        {isFinished ? toNp(a + b) : '?'}
      </span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => setup(q.x, q.y)} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <CBtn color="#8B5CF6" disabled={joined} onClick={handleJoin}>
          ① {kit.t('ब्लक जोडौँ', 'Join Blocks')}
        </CBtn>
        <CBtn color="#F97316" disabled={!canBundleOnes} onClick={bundleOnes}>
          ② {kit.t('10 एकाइ बाँधौँ ➔ 1 दशक', 'Bundle 10 Ones')}
        </CBtn>
        <CBtn color="#059669" disabled={!canBundleTens} onClick={bundleTens}>
          ③ {kit.t('10 दशक बाँधौँ ➔ 1 सय', 'Bundle 10 Tens')}
        </CBtn>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को जोड', 'Next Problem')} ➜
          </CBtn>
        )}

        {kit.mode === 'PLAY' && (
          <CBtn color="#D97706" onClick={() => setup(rnd(120, 500), rnd(120, 450))}>
            🎲 {kit.t('नयाँ प्रश्न', 'Random')}
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
          gap: 20,
        }}
      >
        {!joined ? (
          /* Separate Number Blocks Before Join */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 20,
              width: '100%',
              maxWidth: 880,
            }}
          >
            <Base10Blocks2D
              hundreds={Math.floor(a / 100)}
              tens={Math.floor((a % 100) / 10)}
              ones={a % 10}
              lang={kit.lang}
              title={kit.t(`पहिलो सङ्ख्या: ${toNp(a)}`, `First Number: ${a}`)}
              color="#0284C7"
              compact
            />
            <Base10Blocks2D
              hundreds={Math.floor(b / 100)}
              tens={Math.floor((b % 100) / 10)}
              ones={b % 10}
              lang={kit.lang}
              title={kit.t(`दोस्रो सङ्ख्या: ${toNp(b)}`, `Second Number: ${b}`)}
              color="#E11D48"
              compact
            />
          </div>
        ) : (
          /* Joined Combined Block Board with Bundling Status */
          <div style={{ width: '100%', maxWidth: 840 }}>
            <Base10Blocks2D
              hundreds={h}
              tens={t}
              ones={o}
              lang={kit.lang}
              title={
                isFinished
                  ? kit.t(`जोडफल: ${toNp(a + b)} ✅`, `Total Sum: ${a + b} ✅`)
                  : kit.t('जोडिएका ब्लकहरू (बाँध्ने चरण)', 'Joined Blocks (Regrouping)')
              }
              color={isFinished ? '#16A34A' : '#8B5CF6'}
            />
            {/* Helpful Regrouping Tip Banner */}
            {!isFinished && (
              <div
                style={{
                  marginTop: 12,
                  background: '#FEF3C7',
                  border: '1.5px solid #FDE68A',
                  borderRadius: 12,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#92400E',
                  textAlign: 'center',
                }}
              >
                {canBundleOnes
                  ? kit.t('⚠️ एकाइ कोठामा 10 वा सोभन्दा बढी ब्लक छन्। "10 एकाइ बाँधौँ" थिच्नुहोस्!', '⚠️ 10 or more ones! Click Bundle 10 Ones!')
                  : canBundleTens
                  ? kit.t('⚠️ दशक कोठामा 10 वा सोभन्दा बढी ब्लक छन्। "10 दशक बाँधौँ" थिच्नुहोस्!', '⚠️ 10 or more tens! Click Bundle 10 Tens!')
                  : null}
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
