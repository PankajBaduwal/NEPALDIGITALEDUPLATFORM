/**
 * Chapter 14 · Ordinal numbers
 * Sim 1: Race Day — Pure 2D Edition
 * 100% 2D SVG / CSS Animations – No Three.js/WebGL dependencies.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface Runner {
  id: string;
  nameEn: string;
  nameNp: string;
  emoji: string;
  lane: number;
}

const RUNNERS: Runner[] = [
  { id: 'cheetah', nameEn: 'Leopard', nameNp: 'चितुवा', emoji: '🐆', lane: 1 },
  { id: 'horse', nameEn: 'Horse', nameNp: 'घोडा', emoji: '🐎', lane: 2 },
  { id: 'rabbit', nameEn: 'Rabbit', nameNp: 'खरायो', emoji: '🐇', lane: 3 },
  { id: 'dog', nameEn: 'Dog', nameNp: 'कुकुर', emoji: '🐕', lane: 4 },
  { id: 'tortoise', nameEn: 'Tortoise', nameNp: 'कछुवा', emoji: '🐢', lane: 5 },
];

const ORDINAL_NAMES_NP = ['', 'पहिलो (1st)', 'दोस्रो (2nd)', 'तेस्रो (3rd)', 'चौथो (4th)', 'पाँचौँ (5th)'];
const ORDINAL_NAMES_EN = ['', '1st (First)', '2nd (Second)', '3rd (Third)', '4th (Fourth)', '5th (Fifth)'];

export const RaceDay: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH14-01',
    chapter: 14,
    titleNp: 'दौड प्रतियोगिता (क्रमसूचक सङ्ख्या)',
    titleEn: 'Race Day (Ordinal Numbers)',
  });

  const [order, setOrder] = useState<Runner[]>(RUNNERS);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const startRace = () => {
    kit.tap();
    // Shuffle the runners for a new race result
    const shuffled = [...RUNNERS].sort(() => Math.random() - 0.5);
    setOrder(shuffled);
    setSelectedRank(null);
    kit.good('दौड सम्पन्न भयो! को कुन स्थानमा आयो हेरौँ!', 'Race finished! See who came in which position!');
  };

  const handleSelectRunner = (rank: number) => {
    kit.tap();
    setSelectedRank(rank);
    const runner = order[rank - 1];
    const ordName = isNe ? ORDINAL_NAMES_NP[rank] : ORDINAL_NAMES_EN[rank];
    kit.say(
      `${runner.nameNp} ${ordName} स्थानमा आयो!`,
      `${runner.nameEn} finished in ${ordName} place!`
    );
  };

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: 'दौडमा सबैभन्दा अगाडि आउने धावक कुन स्थानमा हुन्छ?',
        en: 'The runner right in front is in which place?',
        options: [
          { key: '1st', label: isNe ? 'पहिलो (1st)' : '1st' },
          { key: '2nd', label: isNe ? 'दोस्रो (2nd)' : '2nd' },
          { key: '3rd', label: isNe ? 'तेस्रो (3rd)' : '3rd' },
        ],
        answer: '1st',
      },
      {
        np: 'पहिलो धावकपछिको धावक कुन स्थानमा हुन्छ?',
        en: 'The runner right after 1st is in which place?',
        options: [
          { key: '2nd', label: isNe ? 'दोस्रो (2nd)' : '2nd' },
          { key: '3rd', label: isNe ? 'तेस्रो (3rd)' : '3rd' },
          { key: '4th', label: isNe ? 'चौथो (4th)' : '4th' },
        ],
        answer: '2nd',
      },
      {
        np: 'दोस्रो र चौथोको बीचमा कुन स्थान हुन्छ?',
        en: 'Which rank comes between 2nd and 4th?',
        options: [
          { key: '3rd', label: isNe ? 'तेस्रो (3rd)' : '3rd' },
          { key: '5th', label: isNe ? 'पाँचौँ (5th)' : '5th' },
          { key: '1st', label: isNe ? 'पहिलो (1st)' : '1st' },
        ],
        answer: '3rd',
      },
    ],
    [isNe]
  );

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      hud={
        selectedRank ? (
          <div
            style={{
              background: '#FFFFFF',
              border: '2px solid #187C68',
              borderRadius: 16,
              padding: '8px 16px',
              boxShadow: '0 4px 12px rgba(24,124,104,0.15)',
              fontWeight: 900,
              fontSize: 18,
              color: '#187C68',
            }}
          >
            🏆 {order[selectedRank - 1]?.nameNp || order[selectedRank - 1]?.nameEn}:{' '}
            <span style={{ color: '#047857' }}>
              {isNe ? ORDINAL_NAMES_NP[selectedRank] : ORDINAL_NAMES_EN[selectedRank]}
            </span>
          </div>
        ) : undefined
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={startRace}
              style={{
                background: '#187C68',
                color: '#FFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(24,124,104,0.25)',
              }}
            >
              🏁 {L('नयाँ दौड सुरु गरौँ (Start New Race)', 'Start New Race')}
            </button>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 800 }}>
              💡 {L('कुनै पनि धावकलाई छोएर उसको स्थान हेर्नुहोस्!', 'Tap any runner to inspect their ordinal position!')}
            </span>
          </div>
        )
      }
    >
      {/* ── 2D Race Track Stage ───────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 440,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          background: 'linear-gradient(180deg, #DCFCE7 0%, #F5F7F5 60%)',
        }}
      >
        <div
          style={{
            width: 'min(760px, 94vw)',
            background: '#FFFFFF',
            borderRadius: 24,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Finish Line Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px dashed #CBD5E1',
              paddingBottom: 8,
              fontSize: 13,
              fontWeight: 900,
              color: '#64748B',
            }}
          >
            <span>🏁 {L('अन्तिम रेखा (Finish Line)', 'Finish Line')}</span>
            <span>🏁 {L('सुरु रेखा (Start)', 'Start Line')}</span>
          </div>

          {/* 5 Race Lanes */}
          {order.map((runner, rankIdx) => {
            const rank = rankIdx + 1;
            const isSelected = selectedRank === rank;

            return (
              <div
                key={runner.id}
                onClick={() => handleSelectRunner(rank)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: isSelected ? '#E6F3E9' : '#F8FAFC',
                  border: isSelected ? '2px solid #187C68' : '1px solid #E2E8F0',
                  borderRadius: 16,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                {/* Ordinal Badge */}
                <div
                  style={{
                    width: 100,
                    fontWeight: 900,
                    fontSize: 15,
                    color: rank === 1 ? '#D97706' : rank === 2 ? '#64748B' : '#78350F',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎖️'}</span>
                  <span>{isNe ? ORDINAL_NAMES_NP[rank].split(' ')[0] : ORDINAL_NAMES_EN[rank].split(' ')[0]}</span>
                </div>

                {/* Track Line & Runner Avatar */}
                <div style={{ flex: 1, position: 'relative', height: 44, display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', inset: '50% 0 auto 0', height: 2, background: '#CBD5E1' }} />
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(5 - rank) * 18 + 10}%`,
                      fontSize: 34,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                      transition: 'left 0.5s ease',
                    }}
                  >
                    {runner.emoji}
                  </div>
                </div>

                {/* Name */}
                <div style={{ fontWeight: 800, fontSize: 14, color: '#334155', minWidth: 80, textAlign: 'right' }}>
                  {isNe ? runner.nameNp : runner.nameEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SimFrame2D>
  );
};
