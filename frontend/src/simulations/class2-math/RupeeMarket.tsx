/**
 * Lesson 15 · Currency (मुद्रा)
 * Rupee Market — buy things with Nepali notes and coins (up to Rs 1000): pay exact, add prices, find change.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, rnd } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const GOODS = [
  { np: 'कापी', en: 'Copy book', emoji: '📒', price: 35 },
  { np: 'झोला', en: 'Bag', emoji: '🎒', price: 250 },
  { np: 'जुत्ता', en: 'Shoes', emoji: '👟', price: 450 },
  { np: 'दूध', en: 'Milk', emoji: '🥛', price: 60 },
  { np: 'स्याउ (१ के.जी.)', en: 'Apples (1 kg)', emoji: '🍎', price: 180 },
  { np: 'पेन', en: 'Pen', emoji: '🖊️', price: 15 },
  { np: 'बिस्कुट', en: 'Biscuits', emoji: '🍪', price: 45 },
  { np: 'बल', en: 'Ball', emoji: '⚽', price: 120 },
];

const NOTES = [
  { v: 5, color: '#F87171', label: 'रु ५' },
  { v: 10, color: '#C084FC', label: 'रु १०' },
  { v: 20, color: '#FB923C', label: 'रु २०' },
  { v: 50, color: '#60A5FA', label: 'रु ५०' },
  { v: 100, color: '#4ADE80', label: 'रु १००' },
  { v: 500, color: '#FBBF24', label: 'रु ५००' },
];

export const RupeeMarket: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L15-01',
    chapter: 15,
    titleNp: 'रुपैयाँ बजार (मुद्रा)',
    titleEn: 'Rupee Market (Currency)',
  });

  const [cart, setCart] = useState<number[]>([0]); // indices in GOODS
  const [paid, setPaid] = useState<number[]>([]); // values of notes paid

  const totalPrice = cart.reduce((sum, idx) => sum + GOODS[idx].price, 0);
  const totalPaid = paid.reduce((sum, v) => sum + v, 0);
  const changeDue = Math.max(0, totalPaid - totalPrice);
  const isPaidEnough = totalPaid >= totalPrice && totalPrice > 0;

  const toggleCartItem = (idx: number) => {
    kit.tap();
    const next = cart.includes(idx) ? cart.filter((x) => x !== idx) : [...cart, idx];
    setCart(next);
  };

  const addCash = (v: number) => {
    kit.tap();
    const next = [...paid, v];
    setPaid(next);
    const sum = next.reduce((a, b) => a + b, 0);
    kit.say(`रु ${toNp(v)} तिरियो`, `Paid Rs ${v}`);

    if (sum >= totalPrice && totalPrice > 0) {
      const change = sum - totalPrice;
      if (change === 0) {
        kit.good(`बराबर रकम भुक्तानी भयो! धन्यवाद।`, `Exact payment! Thank you.`);
      } else {
        kit.good(`रकम पुग्यो! फिर्ता पाउने रकम: रु ${toNp(change)}`, `Payment complete! Change due: Rs ${change}`);
      }
      kit.star();
    }
  };

  const clearCash = () => {
    kit.tap();
    setPaid([]);
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      setCart([0, 5]); // Copy book Rs 35 + Pen Rs 15 = Rs 50
      setPaid([]);
      kit.say(
        'सामान किन्नुहोस् र नेपाली नोटहरू थिचेर ठीक रकम तिर्नुहोस्।',
        'Select goods and tap Nepali notes to make the payment.'
      );
    } else if (kit.mode === 'PLAY') {
      setCart([rnd(0, GOODS.length - 1)]);
      setPaid([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz Questions for Challenge Mode
  const questions: QuizQuestion[] = [
    {
      np: 'रु १०० को सामान किनेर रु ५०० को नोट दिँदा कति फिर्ता पाउनुहुन्छ?',
      en: 'If you buy an item for Rs 100 and pay with a Rs 500 note, what is your change?',
      answer: '400',
      options: [
        { key: '400', label: 'रु ४००' },
        { key: '300', label: 'रु ३००' },
        { key: '450', label: 'रु ४५०' },
      ],
    },
    {
      np: 'कापीको मूल्य रु ३५ र पेनको मूल्य रु १५ छ। दुवैको जम्मा मूल्य कति?',
      en: 'A copy book costs Rs 35 and a pen costs Rs 15. What is the total?',
      answer: '50',
      options: [
        { key: '50', label: 'रु ५०' },
        { key: '40', label: 'रु ४०' },
        { key: '60', label: 'रु ६०' },
      ],
    },
    {
      np: 'रु ५० बनाउन रु १० का कतिवटा नोट चाहिन्छन्?',
      en: 'How many Rs 10 notes make Rs 50?',
      answer: '5',
      options: [
        { key: '5', label: '५ वटा' },
        { key: '10', label: '१० वटा' },
        { key: '2', label: '२ वटा' },
      ],
    },
    {
      np: 'रु १०० को एउटा नोट बराबर रु २० का कतिवटा नोट हुन्छन्?',
      en: 'How many Rs 20 notes equal one Rs 100 note?',
      answer: '5',
      options: [
        { key: '5', label: '५ वटा' },
        { key: '4', label: '४ वटा' },
        { key: '6', label: '६ वटा' },
      ],
    },
  ];

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
      {kit.t('जम्मा मूल्य', 'Total Price')}:{' '}
      <span style={{ color: '#0284C7', fontSize: 20 }}>
        रु {toNp(totalPrice)}
      </span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#26332E' }}>
          {kit.t('पैसा तिर्नुहोस्:', 'Pay Cash:')}
        </span>
        {NOTES.map((note) => (
          <button
            key={note.v}
            type="button"
            onClick={() => addCash(note.v)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontWeight: 900,
              fontSize: 13,
              border: `2px solid ${note.color}`,
              background: '#FFFFFF',
              color: '#1E293B',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
            }}
          >
            💵 {note.label}
          </button>
        ))}

        <CBtn color="#EF4444" disabled={paid.length === 0} onClick={clearCash}>
          ↺ {kit.t('रकम फिर्ता', 'Clear Cash')}
        </CBtn>
        <CBtn
          color="#D97706"
          onClick={() => {
            setCart([rnd(0, GOODS.length - 1)]);
            setPaid([]);
          }}
        >
          🎲 {kit.t('नयाँ सामान', 'New Item')}
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
          padding: 20,
          gap: 16,
        }}
      >
        {/* Market Goods Shelf */}
        <div style={{ width: '100%', maxWidth: 880 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#64748B', marginBottom: 8 }}>
            🛒 {kit.t('पसलको सामान (छोएर झोलामा हाल्नुहोस्):', 'Store Shelf (Tap to add to cart):')}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: 10,
            }}
          >
            {GOODS.map((g, idx) => {
              const inCart = cart.includes(idx);
              return (
                <div
                  key={g.en}
                  onClick={() => toggleCartItem(idx)}
                  style={{
                    background: inCart ? '#F0FDF4' : '#FFFFFF',
                    border: `2px solid ${inCart ? '#16A34A' : '#E2E8F0'}`,
                    borderRadius: 14,
                    padding: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transform: inCart ? 'scale(1.04)' : 'none',
                    boxShadow: inCart ? '0 4px 12px rgba(22, 163, 74, 0.15)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 28 }}>{g.emoji}</span>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#1E293B', marginTop: 4 }}>
                    {kit.t(g.np, g.en)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: '#059669',
                      background: '#DCFCE7',
                      borderRadius: 6,
                      padding: '2px 6px',
                      marginTop: 2,
                    }}
                  >
                    रु {toNp(g.price)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cash Register & Change Calculation Box */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 20,
            padding: '16px 24px',
            width: '100%',
            maxWidth: 880,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
              {kit.t('तिरेको रकम:', 'Cash Paid:')}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#0284C7' }}>
              रु {toNp(totalPaid)}
            </div>
            {/* Visual list of paid notes */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
              {paid.map((val, k) => (
                <span
                  key={k}
                  style={{
                    background: '#E0F2FE',
                    color: '#0369A1',
                    borderRadius: 4,
                    padding: '1px 6px',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  रु {toNp(val)}
                </span>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
              {kit.t('फिर्ता रकम (Change):', 'Change Due:')}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: isPaidEnough ? '#16A34A' : '#EF4444',
              }}
            >
              {isPaidEnough ? `रु ${toNp(changeDue)}` : kit.t('रकम पुगेन', 'Insufficient')}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>
              {toNp(totalPaid)} − {toNp(totalPrice)} = {toNp(changeDue)}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
