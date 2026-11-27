/**
 * Chapter 18 · Devanagari numerals up to 100 (१०० सम्मका देवनागरी अङ्क)
 * Sim 1: Nepali Number Cards (नेपाली अङ्क कार्ड) — Pure 2D Edition
 * 100% 2D Interactive Memory Cards – No Three.js/WebGL dependencies.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface Card {
  id: number;
  val: number;
  type: 'devanagari' | 'arabic';
  isFlipped: boolean;
  isMatched: boolean;
}

const SAMPLE_NUMBERS = [5, 12, 25, 37, 50, 78];

export const NepaliNumberCards: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH18-01',
    chapter: 18,
    titleNp: 'नेपाली अङ्क कार्ड (देवनागरी अङ्क)',
    titleEn: 'Nepali Number Cards (Devanagari Numerals)',
  });

  const [cards, setCards] = useState<Card[]>(() => generateDeck(SAMPLE_NUMBERS));
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  function generateDeck(nums: number[]): Card[] {
    const deck: Card[] = [];
    let id = 1;
    nums.forEach((num) => {
      deck.push({ id: id++, val: num, type: 'devanagari', isFlipped: false, isMatched: false });
      deck.push({ id: id++, val: num, type: 'arabic', isFlipped: false, isMatched: false });
    });
    return deck.sort(() => Math.random() - 0.5);
  }

  const handleCardClick = (card: Card) => {
    if (card.isFlipped || card.isMatched || selectedCards.length >= 2) return;

    kit.tap();
    const updated = cards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c));
    setCards(updated);

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (first.val === second.val && first.type !== second.type) {
        // Matched!
        setTimeout(() => {
          kit.good(
            `सबास! ${toNp(first.val)} र ${first.val} को जोडी मिल्यो!`,
            `Match! ${toNp(first.val)} pairs with ${first.val}!`
          );
          setCards((prev) =>
            prev.map((c) => (c.val === first.val ? { ...c, isMatched: true } : c))
          );
          setSelectedCards([]);
        }, 600);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          kit.oops('मिलेन, फेरि प्रयास गरौँ!', 'Try again!');
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedCards([]);
        }, 1200);
      }
    }
  };

  const restartGame = () => {
    kit.tap();
    setCards(generateDeck(SAMPLE_NUMBERS));
    setSelectedCards([]);
  };

  const allMatched = cards.every((c) => c.isMatched);

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: 'अङ्क ३७ लाई अङ्ग्रेजीमा कुन अङ्क लेखिन्छ?',
        en: 'Which English numeral represents ३७?',
        options: [
          { key: '37', label: '37' },
          { key: '73', label: '73' },
          { key: '27', label: '27' },
        ],
        answer: '37',
      },
      {
        np: '५० (पचास) लाई देवनागरीमा कुन अङ्क लेखिन्छ?',
        en: 'Which Devanagari numeral is 50?',
        options: [
          { key: '50', label: '५०' },
          { key: '05', label: '०५' },
          { key: '15', label: '१५' },
        ],
        answer: '50',
      },
    ],
    []
  );

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      hud={
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #187C68',
            borderRadius: 16,
            padding: '8px 18px',
            boxShadow: '0 4px 12px rgba(24,124,104,0.15)',
            fontWeight: 900,
            fontSize: 18,
            color: '#187C68',
          }}
        >
          🃏 {L('कार्ड जोडा खेल (Memory Match)', 'Number Card Match')}
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={restartGame}
              style={{
                background: '#187C68',
                color: '#FFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              🔄 {L('नयाँ खेल (Restart Match)', 'Restart Match')}
            </button>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 800 }}>
              💡 {L('कार्ड पल्टाएर देवनागरी र अङ्ग्रेजी अङ्कको जोडी मिलाउनुहोस्!', 'Flip cards to match Nepali and English numerals!')}
            </span>
          </div>
        )
      }
    >
      {/* ── 2D Memory Grid Stage ───────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 460,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'linear-gradient(180deg, #E0F2FE 0%, #F5F7F5 60%)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            maxWidth: 'min(640px, 92vw)',
          }}
        >
          {cards.map((card) => {
            const showFace = card.isFlipped || card.isMatched;
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                style={{
                  width: 'min(130px, 20vw)',
                  height: 'min(130px, 20vw)',
                  borderRadius: 20,
                  background: showFace
                    ? card.isMatched
                      ? '#E6F3E9'
                      : '#FFFFFF'
                    : '#187C68',
                  border: showFace
                    ? card.isMatched
                      ? '3px solid #10B981'
                      : '2px solid #CBD5E1'
                    : '3px solid #0F5A4B',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: showFace ? 32 : 36,
                  fontWeight: 900,
                  color: showFace ? '#187C68' : '#FFFFFF',
                  cursor: card.isMatched ? 'default' : 'pointer',
                  transform: showFace ? 'rotateY(0deg)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {showFace ? (card.type === 'devanagari' ? toNp(card.val) : card.val) : '🎴'}
              </div>
            );
          })}
        </div>

        {allMatched && (
          <div
            style={{
              marginTop: 20,
              fontSize: 22,
              fontWeight: 900,
              color: '#10B981',
              animation: 'simPop 0.3s ease',
            }}
          >
            🎉 {L('बधाई छ! सबै कार्डहरूको जोडी मिल्यो!', 'Congratulations! All cards matched!')}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
