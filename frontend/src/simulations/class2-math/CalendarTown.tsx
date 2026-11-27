/**
 * Lesson 2 · Time (समय) — week, months and the year
 * Calendar Town — twelve month houses: how many days, which month comes next, which season.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { shuffle, rnd, toNp } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }

const MONTHS = [
  { en: 'January', np: 'जनवरी', days: 31, color: '#0284C7', seasonNp: 'जाडो', seasonEn: 'Winter' },
  { en: 'February', np: 'फेब्रुअरी', days: 28, color: '#3B82F6', seasonNp: 'जाडो', seasonEn: 'Winter' },
  { en: 'March', np: 'मार्च', days: 31, color: '#10B981', seasonNp: 'वसन्त', seasonEn: 'Spring' },
  { en: 'April', np: 'अप्रिल', days: 30, color: '#059669', seasonNp: 'वसन्त', seasonEn: 'Spring' },
  { en: 'May', np: 'मे', days: 31, color: '#EAB308', seasonNp: 'गर्मी', seasonEn: 'Summer' },
  { en: 'June', np: 'जुन', days: 30, color: '#F97316', seasonNp: 'गर्मी', seasonEn: 'Summer' },
  { en: 'July', np: 'जुलाई', days: 31, color: '#EF4444', seasonNp: 'वर्षा', seasonEn: 'Monsoon' },
  { en: 'August', np: 'अगस्ट', days: 31, color: '#DC2626', seasonNp: 'वर्षा', seasonEn: 'Monsoon' },
  { en: 'September', np: 'सेप्टेम्बर', days: 30, color: '#EC4899', seasonNp: 'शरद', seasonEn: 'Autumn' },
  { en: 'October', np: 'अक्टोबर', days: 31, color: '#8B5CF6', seasonNp: 'शरद', seasonEn: 'Autumn' },
  { en: 'November', np: 'नोभेम्बर', days: 30, color: '#6366F1', seasonNp: 'हेमन्त', seasonEn: 'Pre-winter' },
  { en: 'December', np: 'डिसेम्बर', days: 31, color: '#4F46E5', seasonNp: 'हेमन्त', seasonEn: 'Pre-winter' },
];

export const CalendarTown: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L2-02',
    chapter: 2,
    titleNp: 'पात्रो सहर (महिना)',
    titleEn: 'Calendar Town (Months of the Year)',
  });

  const [selectedMonth, setSelectedMonth] = useState(0);
  const [isTouring, setIsTouring] = useState(false);

  const chooseMonth = (idx: number, speak = true) => {
    setSelectedMonth(idx);
    const m = MONTHS[idx];
    if (speak) {
      kit.say(
        `${m.np} — वर्षको ${toNp(idx + 1)} औँ महिना, ${toNp(m.days)} दिन`,
        `${m.en} is month number ${idx + 1} and has ${m.days} days`
      );
    }
  };

  const handleStartTour = () => {
    if (isTouring) return;
    setIsTouring(true);
    let i = 0;
    const step = () => {
      chooseMonth(i);
      i += 1;
      if (i < 12) {
        setTimeout(step, 1400);
      } else {
        setTimeout(() => {
          setIsTouring(false);
          kit.good('वर्षमा १२ महिना पूरा घुमियो!', 'Completed the 12-month year tour!');
          kit.star();
        }, 1200);
      }
    };
    step();
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      chooseMonth(0);
      kit.say('वर्षमा १२ महिना हुन्छन्। कुनै पनि महिना छोएर जानकारी हेरौँ।', 'There are 12 months in a year. Tap any month card to explore.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz Questions for Challenge Mode
  const data = useMemo(() => {
    const qs: { np: string; en: string; ans: string; opts: string[]; label: (v: string) => string }[] = [];
    const nm = (v: string) => v;
    qs.push({ np: 'वर्षमा कतिवटा महिना हुन्छन्?', en: 'How many months are there in a year?', ans: '12', opts: ['10', '12', '7'], label: nm });

    const a = rnd(0, 10);
    qs.push({
      np: `${MONTHS[a].np} पछि कुन महिना आउँछ?`,
      en: `Which month comes after ${MONTHS[a].en}?`,
      ans: MONTHS[a + 1].en,
      opts: shuffle([MONTHS[a + 1].en, MONTHS[(a + 3) % 12].en, MONTHS[(a + 5) % 12].en], a + 2),
      label: nm,
    });

    const b = rnd(1, 11);
    qs.push({
      np: `${MONTHS[b].np}भन्दा ठीक अगाडि कुन महिना आउँछ?`,
      en: `Which month comes just before ${MONTHS[b].en}?`,
      ans: MONTHS[b - 1].en,
      opts: shuffle([MONTHS[b - 1].en, MONTHS[(b + 2) % 12].en, MONTHS[(b + 4) % 12].en], b + 7),
      label: nm,
    });

    const c = rnd(0, 11);
    qs.push({
      np: `वर्षको ${c + 1} औँ महिना कुन हो?`,
      en: `Which is month number ${c + 1} of the year?`,
      ans: MONTHS[c].en,
      opts: shuffle([MONTHS[c].en, MONTHS[(c + 3) % 12].en, MONTHS[(c + 7) % 12].en], c + 4),
      label: nm,
    });

    qs.push({
      np: 'कुन महिनामा सबैभन्दा कम दिन (२८ वा २९ दिन) हुन्छन्?',
      en: 'Which month has the fewest days (28 or 29 days)?',
      ans: 'February',
      opts: ['February', 'April', 'August'],
      label: nm,
    });

    return qs;
  }, []);

  const questions: QuizQuestion[] = data.map((d) => ({
    np: d.np,
    en: d.en,
    answer: d.ans,
    options: d.opts.map((o) => {
      const match = MONTHS.find((m) => m.en === o);
      return {
        key: o,
        label: match ? (kit.lang === 'ne' ? match.np : match.en) : (kit.lang === 'ne' ? toNp(o) : o),
      };
    }),
  }));

  const sel = MONTHS[selectedMonth];

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: `2px solid ${sel.color}`,
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      <span style={{ color: sel.color, fontSize: 20 }}>
        {kit.lang === 'ne' ? sel.np : sel.en}
      </span>
      <span style={{ marginLeft: 8, fontSize: 14, color: '#64748B' }}>
        ({kit.lang === 'ne' ? `${toNp(sel.days)} दिन` : `${sel.days} days`})
      </span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <CBtn color="#187C68" disabled={isTouring} onClick={handleStartTour}>
          🚀 {kit.t('वर्ष भ्रमण (सबै महिना)', 'Tour the Year (All Months)')}
        </CBtn>
        <CBtn
          color="#0284C7"
          onClick={() => chooseMonth((selectedMonth + 1) % 12)}
        >
          {kit.t('अर्को महिना', 'Next Month')} ➜
        </CBtn>
        <CBtn
          color="#64748B"
          onClick={() => chooseMonth((selectedMonth + 11) % 12)}
        >
          ⬅ {kit.t('अघिल्लो महिना', 'Prev Month')}
        </CBtn>
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
          padding: '16px 20px',
          gap: 16,
        }}
      >
        {/* Active Month Spotlight Banner */}
        <div
          style={{
            background: '#FFFFFF',
            border: `3px solid ${sel.color}`,
            borderRadius: 18,
            padding: '12px 28px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            maxWidth: 600,
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: sel.color,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              {kit.lang === 'ne' ? toNp(selectedMonth + 1) : selectedMonth + 1}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#1E293B' }}>
                {kit.lang === 'ne' ? sel.np : sel.en}
              </div>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 700 }}>
                {kit.t(`ऋतु: ${sel.seasonNp}`, `Season: ${sel.seasonEn}`)}
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#F1F5F9',
              borderRadius: 12,
              padding: '6px 14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, color: sel.color }}>
              {kit.lang === 'ne' ? toNp(sel.days) : sel.days}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800 }}>
              {kit.t('दिनहरू', 'Days')}
            </div>
          </div>
        </div>

        {/* 12 Month Grid / Town Houses */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 12,
            width: '100%',
            maxWidth: 880,
          }}
        >
          {MONTHS.map((mo, idx) => {
            const isSelected = idx === selectedMonth;
            return (
              <button
                key={mo.en}
                type="button"
                onClick={() => chooseMonth(idx)}
                style={{
                  background: isSelected ? mo.color : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#1E293B',
                  border: `2px solid ${mo.color}`,
                  borderRadius: 14,
                  padding: '10px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.05)' : 'none',
                  boxShadow: isSelected ? '0 6px 16px rgba(0,0,0,0.12)' : '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.18s ease',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, opacity: isSelected ? 0.9 : 0.6 }}>
                  #{kit.lang === 'ne' ? toNp(idx + 1) : idx + 1}
                </div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>
                  {kit.lang === 'ne' ? mo.np : mo.en}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    borderRadius: 6,
                    padding: '2px 8px',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#64748B',
                    marginTop: 2,
                  }}
                >
                  {kit.lang === 'ne' ? `${toNp(mo.days)} दिन` : `${mo.days}d`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </SimFrame2D>
  );
};
