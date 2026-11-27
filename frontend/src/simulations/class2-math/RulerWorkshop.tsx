/**
 * Lesson 9 · Length (लम्बाइ)
 * Ruler Workshop — read centimetres on a 2D ruler; start from 0 or any mark; compare lengths.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const THINGS = [
  { np: 'पेन्सिल', en: 'Pencil', emoji: '✏️', cm: 12, color: '#FACC15' },
  { np: 'इरेजर (रबर)', en: 'Eraser', emoji: '🧽', cm: 4, color: '#F472B6' },
  { np: 'साँचो (चाबी)', en: 'Key', emoji: '🔑', cm: 6, color: '#94A3B8' },
  { np: 'क्रेयोन', en: 'Crayon', emoji: '🖍️', cm: 8, color: '#EF4444' },
  { np: 'चम्चा', en: 'Spoon', emoji: '🥄', cm: 14, color: '#CBD5E1' },
  { np: 'काँइयो', en: 'Comb', emoji: '🪮', cm: 10, color: '#38BDF8' },
];

export const RulerWorkshop: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L9-01',
    chapter: 9,
    titleNp: 'रुलर कार्यशाला (लम्बाइ)',
    titleEn: 'Ruler Workshop (Length in cm)',
  });

  const [itemIndex, setItemIndex] = useState(0);
  const [shift, setShift] = useState(0); // starting cm position
  const [compareIndex, setCompareIndex] = useState<number | null>(null);
  const [showMeasurement, setShowMeasurement] = useState(true);
  const [li, setLi] = useState(0);

  const activeItem = THINGS[itemIndex];
  const endCm = shift + activeItem.cm;

  const handleNextLearn = () => {
    const nextIdx = (li + 1) % THINGS.length;
    setLi(nextIdx);
    setItemIndex(nextIdx);
    setShift(0);
    setCompareIndex(null);
    const item = THINGS[nextIdx];
    kit.say(
      `${item.np}को लम्बाइ नापौँ — ० देखि ${toNp(item.cm)} सम्म, अर्थात् ${toNp(item.cm)} से.मी.।`,
      `Measure the ${item.en}: from 0 to ${item.cm}, exactly ${item.cm} cm.`
    );
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      setItemIndex(0);
      setShift(0);
      setCompareIndex(null);
      kit.say(
        'वस्तुलाई रुलरको ० अङ्कमा राखेर अन्तिम छेउ कुन अङ्कमा पुगेको छ हेरौँ।',
        'Line up the item at 0 and see where the other end points.'
      );
    } else if (kit.mode === 'PLAY') {
      setItemIndex(rnd(0, THINGS.length - 1));
      setShift(rnd(0, 4));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz Questions for Challenge Mode
  const questions: QuizQuestion[] = THINGS.map((it, i) => ({
    np: `रुलरमा ० देखि ${toNp(it.cm)} से.मी. सम्म फैलिएको ${it.np}को लम्बाइ कति हो?`,
    en: `What is the length of a ${it.en} that stretches from 0 to ${it.cm} cm on the ruler?`,
    answer: String(it.cm),
    options: numChoices(it.cm, i * 13 + 3, [1, -1, 2, -2]).map((v) => ({
      key: String(v),
      label: `${fmt(kit.lang, v)} ${kit.t('से.मी.', 'cm')}`,
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
        fontSize: 16,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      {kit.t('लम्बाइ', 'Length')}:{' '}
      <span style={{ color: '#0284C7', fontSize: 20 }}>
        {toNp(activeItem.cm)} {kit.t('से.मी.', 'cm')}
      </span>
      {shift > 0 && (
        <span style={{ fontSize: 13, color: '#64748B', marginLeft: 8 }}>
          ({toNp(endCm)} − {toNp(shift)} = {toNp(activeItem.cm)})
        </span>
      )}
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <CBtn color="#0284C7" disabled={shift <= 0} onClick={() => setShift((s) => Math.max(0, s - 1))}>
          ⬅ {kit.t('बायाँ सार्ने', 'Slide Left')}
        </CBtn>
        <CBtn color="#0284C7" disabled={endCm >= 20} onClick={() => setShift((s) => Math.min(20 - activeItem.cm, s + 1))}>
          {kit.t('दायाँ सार्ने', 'Slide Right')} ➜
        </CBtn>

        <CBtn
          color="#8B5CF6"
          onClick={() => {
            if (compareIndex === null) {
              setCompareIndex((itemIndex + 1) % THINGS.length);
            } else {
              setCompareIndex(null);
            }
          }}
        >
          ⚖️ {compareIndex === null ? kit.t('अर्को वस्तुसँग तुलना', 'Compare with 2nd Item') : kit.t('तुलना बन्द', 'Hide Comparison')}
        </CBtn>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={handleNextLearn}>
            {kit.t('अर्को वस्तु', 'Next Item')} ➜
          </CBtn>
        )}

        {kit.mode === 'PLAY' && (
          <CBtn
            color="#D97706"
            onClick={() => {
              const ni = rnd(0, THINGS.length - 1);
              setItemIndex(ni);
              setShift(rnd(0, Math.max(0, 20 - THINGS[ni].cm)));
              setCompareIndex(null);
            }}
          >
            🎲 {kit.t('नयाँ वस्तु', 'Random Item')}
          </CBtn>
        )}
      </div>
    </Controls>
  );

  // Ruler coordinate conversion (pixels per cm, e.g. 36px per cm for 0-20 = 720px)
  const pxPerCm = 36;
  const startX = 40;

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
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 880,
            background: '#FFFFFF',
            borderRadius: 24,
            padding: '40px 30px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowX: 'auto',
          }}
        >
          {/* Centimetre Ruler and Objects Stage */}
          <svg width="800" height="240" viewBox="0 0 800 240">
            {/* The 2D Wooden Ruler Body */}
            <rect
              x={startX}
              y="130"
              width={20 * pxPerCm}
              height="80"
              rx="6"
              fill="#FDE68A"
              stroke="#D97706"
              strokeWidth="3"
            />

            {/* Ruler Graduations (0 to 20 cm) */}
            {Array.from({ length: 21 }).map((_, cm) => {
              const x = startX + cm * pxPerCm;
              return (
                <g key={cm}>
                  {/* Major cm tick line */}
                  <line x1={x} y1="130" x2={x} y2="160" stroke="#1E293B" strokeWidth="2.5" />
                  {/* 0.5 cm tick line */}
                  {cm < 20 && (
                    <line x1={x + pxPerCm / 2} y1="130" x2={x + pxPerCm / 2} y2="148" stroke="#64748B" strokeWidth="1.5" />
                  )}
                  {/* 1mm small tick marks */}
                  {cm < 20 &&
                    Array.from({ length: 4 }).map((_, mm) => (
                      <g key={mm}>
                        <line
                          x1={x + (mm + 1) * (pxPerCm / 10)}
                          y1="130"
                          x2={x + (mm + 1) * (pxPerCm / 10)}
                          y2="140"
                          stroke="#94A3B8"
                          strokeWidth="1"
                        />
                        <line
                          x1={x + (mm + 6) * (pxPerCm / 10)}
                          y1="130"
                          x2={x + (mm + 6) * (pxPerCm / 10)}
                          y2="140"
                          stroke="#94A3B8"
                          strokeWidth="1"
                        />
                      </g>
                    ))}
                  {/* Number Label */}
                  <text
                    x={x}
                    y="185"
                    textAnchor="middle"
                    fill="#1E293B"
                    fontSize="16"
                    fontWeight="900"
                  >
                    {kit.lang === 'ne' ? toNp(cm) : cm}
                  </text>
                </g>
              );
            })}
            <text x={startX + 20 * pxPerCm - 24} y="202" fill="#B45309" fontSize="13" fontWeight="900">
              cm
            </text>

            {/* Main Object Being Measured */}
            <g
              transform={`translate(${startX + shift * pxPerCm}, 75)`}
              style={{ transition: 'transform 0.3s ease' }}
            >
              {/* Item Body Bar */}
              <rect
                x="0"
                y="0"
                width={activeItem.cm * pxPerCm}
                height="36"
                rx="8"
                fill={activeItem.color}
                stroke="#1E293B"
                strokeWidth="2.5"
              />
              {/* Emoji inside or above item */}
              <text x={activeItem.cm * pxPerCm / 2} y="25" textAnchor="middle" fontSize="20">
                {activeItem.emoji}
              </text>
              {/* Name badge */}
              <text
                x={activeItem.cm * pxPerCm / 2}
                y="-10"
                textAnchor="middle"
                fill="#1E293B"
                fontSize="13"
                fontWeight="900"
              >
                {kit.t(activeItem.np, activeItem.en)} ({toNp(activeItem.cm)} {kit.t('से.मी.', 'cm')})
              </text>

              {/* Start & End Marker lines pointing down to ruler */}
              <line x1="0" y1="0" x2="0" y2="55" stroke="#16A34A" strokeWidth="2.5" strokeDasharray="3 3" />
              <line
                x1={activeItem.cm * pxPerCm}
                y1="0"
                x2={activeItem.cm * pxPerCm}
                y2="55"
                stroke="#DC2626"
                strokeWidth="2.5"
                strokeDasharray="3 3"
              />
            </g>

            {/* Secondary Comparison Item if enabled */}
            {compareIndex !== null && (
              <g transform={`translate(${startX}, 18)`}>
                {(() => {
                  const comp = THINGS[compareIndex];
                  return (
                    <>
                      <rect
                        x="0"
                        y="0"
                        width={comp.cm * pxPerCm}
                        height="30"
                        rx="6"
                        fill={comp.color}
                        stroke="#1E293B"
                        strokeWidth="2"
                        opacity="0.85"
                      />
                      <text x={comp.cm * pxPerCm / 2} y="20" textAnchor="middle" fontSize="16">
                        {comp.emoji}
                      </text>
                      <text
                        x={comp.cm * pxPerCm + 8}
                        y="20"
                        fill="#64748B"
                        fontSize="12"
                        fontWeight="800"
                      >
                        {kit.t(comp.np, comp.en)} ({toNp(comp.cm)} {kit.t('से.मी.', 'cm')})
                      </text>
                    </>
                  );
                })()}
              </g>
            )}
          </svg>
        </div>
      </div>
    </SimFrame2D>
  );
};
