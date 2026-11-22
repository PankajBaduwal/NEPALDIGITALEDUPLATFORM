/**
 * Lesson 17 · Division (भाग)
 * Sharing Party — share sweets equally among friends: 12 ÷ 3 = 4.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const FRIENDS_META = [
  { nameNp: 'भालु', nameEn: 'Bear', emoji: '🐻', color: '#B45309' },
  { nameNp: 'खरायो', nameEn: 'Rabbit', emoji: '🐰', color: '#EC4899' },
  { nameNp: 'बिरालो', nameEn: 'Cat', emoji: '🐱', color: '#F97316' },
  { nameNp: 'कुकुर', nameEn: 'Dog', emoji: '🐶', color: '#0284C7' },
  { nameNp: 'मुसो', nameEn: 'Mouse', emoji: '🐭', color: '#64748B' },
];

const LEARN_PRESETS: [number, number][] = [
  [3, 4], // 12 / 3 = 4
  [2, 5], // 10 / 2 = 5
  [4, 3], // 12 / 4 = 3
  [5, 3], // 15 / 5 = 3
  [3, 6], // 18 / 3 = 6
];

export const SharingParty: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L17-01',
    chapter: 17,
    titleNp: 'बराबर बाँडौँ (भाग)',
    titleEn: 'Sharing Party (Division)',
  });

  const [friendsCount, setFriendsCount] = useState(3);
  const [eachTarget, setEachTarget] = useState(4);
  const [distributedCount, setDistributedCount] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [li, setLi] = useState(0);

  const totalSweets = friendsCount * eachTarget;
  const isComplete = distributedCount === totalSweets;

  const startSharing = () => {
    if (isSharing || isComplete) return;
    setIsSharing(true);
    kit.tap();
    kit.say('एक–एक गरेर सबै साथीहरूलाई बराबर बाँडौँ।', 'Share equally, one by one to each friend.');

    let n = distributedCount;
    const interval = setInterval(() => {
      n += 1;
      setDistributedCount(n);
      kit.tap();
      if (n >= totalSweets) {
        clearInterval(interval);
        setIsSharing(false);
        kit.good(
          `सबास! ${toNp(totalSweets)} ÷ ${toNp(friendsCount)} = ${toNp(eachTarget)}! सबैले बराबर ${toNp(eachTarget)}–${toNp(eachTarget)} वटा पाए!`,
          `Great job! ${totalSweets} ÷ ${friendsCount} = ${eachTarget}. Each friend gets ${eachTarget} sweets!`
        );
        kit.star();
      }
    }, 160);
  };

  const handleReset = (k: number, q: number) => {
    setFriendsCount(k);
    setEachTarget(q);
    setDistributedCount(0);
    setIsSharing(false);
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      const [k, q] = LEARN_PRESETS[li % LEARN_PRESETS.length];
      handleReset(k, q);
      kit.say(
        `जम्मा ${toNp(k * q)} वटा मिठाईलाई ${toNp(k)} जना साथीमा बराबर बाँडौँ।`,
        `Let us share ${k * q} sweets equally among ${k} friends.`
      );
    } else if (kit.mode === 'PLAY') {
      const k = rnd(2, 4);
      const q = rnd(2, 5);
      handleReset(k, q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Quiz Questions for Challenge Mode
  const data = useMemo(() => Array.from({ length: 6 }, () => {
    const k = rnd(2, 4);
    const q = rnd(2, 5);
    return { k, q, total: k * q };
  }), []);

  const questions: QuizQuestion[] = data.map((d, i) => ({
    np: `${toNp(d.total)} वटा मिठाई ${toNp(d.k)} जनालाई बराबर बाँड्दा प्रत्येकले कति पाउँछन्? (${toNp(d.total)} ÷ ${toNp(d.k)})`,
    en: `If ${d.total} sweets are shared equally among ${d.k} friends, how many does each get? (${d.total} ÷ ${d.k})`,
    answer: String(d.q),
    options: numChoices(d.q, i * 11 + 3, [1, -1, 2, -2]).map((v) => ({
      key: String(v),
      label: toNp(v),
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
      <span style={{ color: '#0284C7' }}>{toNp(totalSweets)}</span> ÷{' '}
      <span style={{ color: '#D97706' }}>{toNp(friendsCount)}</span> ={' '}
      <span style={{ color: '#16A34A' }}>{isComplete ? toNp(eachTarget) : '?'}</span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <CBtn color="#059669" disabled={isSharing || isComplete} onClick={startSharing}>
          🍬 {kit.t('बराबर बाँडौँ (भाग गरौँ)', 'Share Sweets Equally')}
        </CBtn>
        <CBtn color="#64748B" onClick={() => handleReset(friendsCount, eachTarget)}>
          ↺ {kit.t('फेरि सुरु', 'Reset')}
        </CBtn>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को उदाहरण', 'Next Problem')} ➜
          </CBtn>
        )}

        {kit.mode === 'PLAY' && (
          <CBtn
            color="#D97706"
            onClick={() => {
              const k = rnd(2, 4);
              const q = rnd(2, 5);
              handleReset(k, q);
            }}
          >
            🎲 {kit.t('नयाँ संख्या', 'Random')}
          </CBtn>
        )}
      </div>
    </Controls>
  );

  // Remaining sweets on central platter
  const remainingSweets = totalSweets - distributedCount;

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
        {/* Central Platter of Remaining Sweets */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 20,
            padding: '12px 28px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
            {kit.t('बाँड्न बाँकी मिठाई:', 'Sweets on Platter:')}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              maxWidth: 320,
              justifyContent: 'center',
              minHeight: 36,
            }}
          >
            {Array.from({ length: remainingSweets }).map((_, i) => (
              <span key={i} style={{ fontSize: 24 }}>
                🍬
              </span>
            ))}
            {remainingSweets === 0 && (
              <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 900 }}>
                {kit.t('✅ सबै मिठाई बराबर बाँडियो!', '✅ All sweets distributed!')}
              </span>
            )}
          </div>
        </div>

        {/* Animal Friends and Their Plates */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: 24,
            width: '100%',
            maxWidth: 880,
            flexWrap: 'wrap',
          }}
        >
          {Array.from({ length: friendsCount }).map((_, fIdx) => {
            const friend = FRIENDS_META[fIdx % FRIENDS_META.length];
            // Compute sweets on this plate based on round-robin
            const sweetsOnThisPlate =
              Math.floor(distributedCount / friendsCount) +
              (distributedCount % friendsCount > fIdx ? 1 : 0);

            return (
              <div
                key={fIdx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  background: '#FFFFFF',
                  borderRadius: 20,
                  padding: '16px 20px',
                  border: `2px solid ${friend.color}`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  minWidth: 140,
                }}
              >
                {/* Animal Friend Avatar */}
                <span style={{ fontSize: 44 }}>{friend.emoji}</span>
                <div style={{ fontSize: 14, fontWeight: 900, color: friend.color }}>
                  {kit.t(friend.nameNp, friend.nameEn)}
                </div>

                {/* Friend's Plate */}
                <div
                  style={{
                    width: 110,
                    height: 60,
                    background: '#F8FAFC',
                    borderRadius: '50%',
                    border: '3px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    padding: 4,
                    gap: 2,
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
                  }}
                >
                  {Array.from({ length: sweetsOnThisPlate }).map((_, sIdx) => (
                    <span key={sIdx} style={{ fontSize: 18 }}>
                      🍬
                    </span>
                  ))}
                </div>

                {/* Count Badge */}
                <div
                  style={{
                    background: '#F1F5F9',
                    borderRadius: 8,
                    padding: '2px 10px',
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#1E293B',
                  }}
                >
                  {toNp(sweetsOnThisPlate)} {kit.t('मिठाई', 'sweets')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SimFrame2D>
  );
};
