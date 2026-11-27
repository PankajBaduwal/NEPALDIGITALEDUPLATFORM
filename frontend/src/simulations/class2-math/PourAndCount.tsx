/**
 * Lesson 1 · Capacity (धारिता)
 * Pour and Count — fill a big jar with a small pitcher and count the pours; compare containers.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

export const PourAndCount: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L1-01',
    chapter: 1,
    titleNp: 'खन्याऔँ र गनौँ (धारिता)',
    titleEn: 'Pour and Count (Capacity)',
  });

  const [capacity, setCapacity] = useState(5); // Big jar holds `capacity` cups
  const [pours, setPours] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [view, setView] = useState<'FILL' | 'COMPARE'>('FILL');
  const [compareA, setCompareA] = useState({ nameNp: 'भाँडो क (अग्लो र पातलो)', nameEn: 'Vessel A (Tall & Narrow)', vol: 4 });
  const [compareB, setCompareB] = useState({ nameNp: 'भाँडो ख (होचो र चौडा)', nameEn: 'Vessel B (Short & Wide)', vol: 6 });
  const [compareMeasured, setCompareMeasured] = useState(false);
  const [li, setLi] = useState(0);

  const fillFraction = Math.min(1, pours / capacity);

  // Pour small pitcher into big jar
  const handlePour = () => {
    if (isPouring || pours >= capacity) return;
    setIsPouring(true);
    kit.tap();
    const nextPours = pours + 1;
    kit.say(`${nextPours} कप खन्याइयो`, `Poured cup number ${nextPours}`);

    setTimeout(() => {
      setPours(nextPours);
      setIsPouring(false);
      if (nextPours === capacity) {
        kit.good(`भाँडो भरियो! जम्मा ${capacity} कप।`, `The jar is full! Exactly ${capacity} cups.`);
        kit.star();
      }
    }, 450);
  };

  const handleResetFill = () => {
    setPours(0);
    setIsPouring(false);
  };

  const handleNextLearn = () => {
    const nextCaps = [3, 4, 5, 6, 8];
    const nextCap = nextCaps[(li + 1) % nextCaps.length];
    setLi((v) => v + 1);
    setCapacity(nextCap);
    setPours(0);
    kit.say(`अब ${nextCap} कप अट्ने ठूलो भाँडो भरौँ।`, `Now let's fill a jar that holds ${nextCap} cups.`);
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      setView('FILL');
      setCapacity(4);
      setPours(0);
      kit.say('सानो कपले खन्याएर ठूलो भाँडो भरौँ र गनौँ।', 'Pour with the small cup to fill the big jar and count the pours.');
    } else if (kit.mode === 'PLAY') {
      setCapacity(rnd(3, 7));
      setPours(0);
      kit.say('खन्याउने बटन थिचेर भाँडो भर्नुहोस्।', 'Press Pour to fill the container.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz Questions for Challenge Mode
  const data = useMemo(() => [
    { cap: 4, item: 'जग (Jug)', qNp: 'यो जग भर्न ४ कप पानी लाग्छ भने जगको धारिता कति कप हो?', qEn: 'If it takes 4 cups to fill this jug, what is its capacity in cups?', ans: 4 },
    { cap: 6, item: 'बाल्टिन (Small Bucket)', qNp: 'यो भाँडो भर्न ६ कप पानी खन्याइयो। यसको धारिता कति हो?', qEn: '6 cups of water were poured to fill this vessel. What is its capacity?', ans: 6 },
    { cap: 3, item: 'बोतल (Bottle)', qNp: '३ कप पानीले बोतल पूरा भरिन्छ। बोतलको धारिता कति कप?', qEn: '3 cups fill the bottle completely. How many cups is its capacity?', ans: 3 },
    { cap: 5, item: 'भाँडो (Pot)', qNp: '५ कप खन्याउँदा आधा भरियो भने पूरा भर्न कति कप लाग्ला?', qEn: 'If 5 cups fill half the pot, how many cups fill the whole pot?', ans: 10 },
  ], []);

  const questions: QuizQuestion[] = data.map((d, i) => ({
    np: d.qNp,
    en: d.qEn,
    answer: String(d.ans),
    options: numChoices(d.ans, i * 7 + 2, [1, -1, 2, -2]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })),
  }));

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #187C68',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        fontWeight: 900,
        fontSize: 18,
        color: '#26332E',
      }}
    >
      {view === 'FILL' ? (
        <span>
          {kit.t('खन्याइएको', 'Poured')}: <span style={{ color: '#0284C7', fontSize: 22 }}>{fmt(kit.lang, pours)}</span> / {fmt(kit.lang, capacity)} {kit.t('कप', 'cups')}
        </span>
      ) : (
        <span>{kit.t('धारिता तुलना', 'Capacity Comparison')}</span>
      )}
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setView('FILL')}
          style={{
            padding: '8px 16px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            background: view === 'FILL' ? '#187C68' : '#E2E8F0',
            color: view === 'FILL' ? '#FFFFFF' : '#334155',
          }}
        >
          🫗 {kit.t('खन्याउने अभ्यास', 'Fill & Count')}
        </button>
        <button
          type="button"
          onClick={() => {
            setView('COMPARE');
            setCompareMeasured(false);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            background: view === 'COMPARE' ? '#187C68' : '#E2E8F0',
            color: view === 'COMPARE' ? '#FFFFFF' : '#334155',
          }}
        >
          ⚖️ {kit.t('भाँडो तुलना', 'Compare Vessels')}
        </button>
      </div>

      {view === 'FILL' ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <CBtn color="#0284C7" disabled={isPouring || pours >= capacity} onClick={handlePour}>
            💧 {kit.t('१ कप खन्याऔँ', 'Pour 1 Cup')}
          </CBtn>
          <CBtn color="#64748B" onClick={handleResetFill}>
            ↺ {kit.t('खाली गरौँ', 'Empty Jar')}
          </CBtn>
          {kit.mode === 'LEARN' && (
            <CBtn color="#187C68" onClick={handleNextLearn}>
              {kit.t('अर्को भाँडो', 'Next Jar')} ➜
            </CBtn>
          )}
          {kit.mode === 'PLAY' && (
            <CBtn color="#F59E0B" onClick={() => { setCapacity(rnd(3, 8)); setPours(0); }}>
              🎲 {kit.t('नयाँ धारिता', 'Random Size')}
            </CBtn>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <CBtn
            color="#059669"
            disabled={compareMeasured}
            onClick={() => {
              setCompareMeasured(true);
              kit.tap();
              kit.say(
                `भाँडो ख मा धेरै पानी अटाउँछ (${compareB.vol} कप > ${compareA.vol} कप)`,
                `Vessel B holds more (${compareB.vol} cups > ${compareA.vol} cups)`
              );
            }}
          >
            📏 {kit.t('नापेर हेरौँ', 'Measure Both in Cups')}
          </CBtn>
          <CBtn
            color="#64748B"
            onClick={() => {
              setCompareA({ nameNp: 'भाँडो क', nameEn: 'Vessel A', vol: rnd(3, 5) });
              setCompareB({ nameNp: 'भाँडो ख', nameEn: 'Vessel B', vol: rnd(6, 8) });
              setCompareMeasured(false);
            }}
          >
            🎲 {kit.t('नयाँ भाँडाहरू', 'New Pair')}
          </CBtn>
        </div>
      )}
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
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        {view === 'FILL' ? (
          /* FILL MODE 2D STAGE */
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: 60,
              width: '100%',
              maxWidth: 750,
              background: '#FFFFFF',
              borderRadius: 24,
              padding: '30px 40px',
              border: '2px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            }}
          >
            {/* Small Pouring Cup */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0369A1' }}>
                {kit.t('१ कप (एकाइ)', '1 Unit Cup')}
              </div>
              <div
                style={{
                  transition: 'transform 0.3s ease',
                  transform: isPouring ? 'rotate(-35deg) translateY(-20px)' : 'none',
                }}
              >
                <svg width="100" height="110" viewBox="0 0 100 110">
                  {/* Cup Body */}
                  <path
                    d="M20 20 L80 20 L72 95 Q70 102 60 102 L40 102 Q30 102 28 95 Z"
                    fill="#BAE6FD"
                    stroke="#0284C7"
                    strokeWidth="4"
                  />
                  {/* Handle */}
                  <path
                    d="M80 35 C100 40 100 80 75 85"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Water in Cup */}
                  <path
                    d="M23 35 L77 35 L71 94 Q70 99 60 99 L40 99 Q30 99 29 94 Z"
                    fill="#38BDF8"
                    opacity={isPouring ? 0.3 : 0.85}
                  />
                </svg>
              </div>
              <button
                type="button"
                onClick={handlePour}
                disabled={isPouring || pours >= capacity}
                style={{
                  padding: '6px 14px',
                  borderRadius: 10,
                  background: pours >= capacity ? '#94A3B8' : '#0284C7',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  border: 'none',
                  cursor: pours >= capacity ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                }}
              >
                {kit.t('खन्याउनुहोस्', 'Pour')}
              </button>
            </div>

            {/* Pouring stream effect */}
            {isPouring && (
              <svg width="40" height="160" viewBox="0 0 40 160" style={{ alignSelf: 'center' }}>
                <path
                  d="M10 0 Q25 80 20 160"
                  stroke="#38BDF8"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="12 6"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {/* Big Jar / Container */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#166534' }}>
                {kit.t(`ठूलो भाँडो (धारिता: ${fmt(kit.lang, capacity)} कप)`, `Big Jar (Capacity: ${capacity} cups)`)}
              </div>
              <div style={{ position: 'relative', width: 170, height: 240 }}>
                <svg width="170" height="240" viewBox="0 0 170 240">
                  {/* Jar Rim */}
                  <ellipse cx="85" cy="20" rx="60" ry="12" fill="#E0F2FE" stroke="#0284C7" strokeWidth="4" />
                  {/* Jar Body */}
                  <path
                    d="M25 20 L25 210 Q25 230 45 230 L125 230 Q145 230 145 210 L145 20 Z"
                    fill="#F0F9FF"
                    stroke="#0284C7"
                    strokeWidth="4"
                  />
                  {/* Water Fill */}
                  {pours > 0 && (
                    <g>
                      <rect
                        x="27"
                        y={228 - fillFraction * 196}
                        width="116"
                        height={fillFraction * 196}
                        fill="#38BDF8"
                        opacity="0.75"
                        rx="4"
                      />
                      <ellipse
                        cx="85"
                        cy={228 - fillFraction * 196}
                        rx="58"
                        ry="9"
                        fill="#0284C7"
                        opacity="0.8"
                      />
                    </g>
                  )}
                  {/* Measurement graduation ticks */}
                  {Array.from({ length: capacity }).map((_, i) => {
                    const y = 228 - ((i + 1) / capacity) * 196;
                    return (
                      <g key={i}>
                        <line x1="25" y1={y} x2="45" y2={y} stroke="#0369A1" strokeWidth="2.5" />
                        <text x="52" y={y + 4} fill="#0369A1" fontSize="12" fontWeight="800">
                          {fmt(kit.lang, i + 1)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: pours === capacity ? '#16A34A' : '#64748B' }}>
                {pours === capacity ? kit.t('🎉 भाँडो पूरै भरियो!', '🎉 Jar is full!') : kit.t('पानी थप्दै जानुहोस्', 'Keep adding water')}
              </div>
            </div>
          </div>
        ) : (
          /* COMPARE MODE 2D STAGE */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
              width: '100%',
              maxWidth: 750,
              background: '#FFFFFF',
              borderRadius: 24,
              padding: '24px 30px',
              border: '2px solid #E2E8F0',
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 900, color: '#1E293B', textAlign: 'center' }}>
              {kit.t('कुन भाँडोमा बढी पानी अटाउँछ? नापेर हेरौँ!', 'Which vessel holds more water? Measure in cups!')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', alignItems: 'flex-end' }}>
              {/* Vessel A */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0369A1' }}>
                  {kit.t(compareA.nameNp, compareA.nameEn)}
                </div>
                <svg width="100" height="220" viewBox="0 0 100 220">
                  <rect x="25" y="20" width="50" height="185" rx="8" fill="#E0F2FE" stroke="#0284C7" strokeWidth="4" />
                  <rect x="27" y="30" width="46" height="173" rx="6" fill="#38BDF8" opacity="0.8" />
                </svg>
                {compareMeasured ? (
                  <div style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 12px', borderRadius: 8, fontWeight: 900 }}>
                    {fmt(kit.lang, compareA.vol)} {kit.t('कप', 'cups')}
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>? {kit.t('कप', 'cups')}</span>
                )}
              </div>

              <div style={{ fontSize: 24, fontWeight: 900, color: '#94A3B8', marginBottom: 60 }}>
                {compareMeasured ? (compareA.vol > compareB.vol ? '>' : compareA.vol < compareB.vol ? '<' : '=') : 'VS'}
              </div>

              {/* Vessel B */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#D97706' }}>
                  {kit.t(compareB.nameNp, compareB.nameEn)}
                </div>
                <svg width="180" height="220" viewBox="0 0 180 220">
                  <rect x="20" y="80" width="140" height="125" rx="10" fill="#FEF3C7" stroke="#D97706" strokeWidth="4" />
                  <rect x="22" y="90" width="136" height="113" rx="8" fill="#FBBF24" opacity="0.8" />
                </svg>
                {compareMeasured ? (
                  <div style={{ background: '#FEF3C7', color: '#B45309', padding: '4px 12px', borderRadius: 8, fontWeight: 900 }}>
                    {fmt(kit.lang, compareB.vol)} {kit.t('कप', 'cups')}
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>? {kit.t('कप', 'cups')}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
