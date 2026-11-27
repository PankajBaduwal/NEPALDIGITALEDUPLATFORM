/**
 * Lesson 17 · Money
 * Bill & Change Shop — 2D Nepali store to select goods, create bills, pay with banknotes, and calculate change.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

interface Good {
  id: number;
  np: string;
  en: string;
  emoji: string;
  price: number;
}

const GOODS: Good[] = [
  { id: 0, np: 'चामल (5 केजी)', en: 'Rice (5 kg)', emoji: '🍚', price: 625 },
  { id: 1, np: 'तेल (1 लि.)', en: 'Oil (1 L)', emoji: '🛢️', price: 235 },
  { id: 2, np: 'चियापत्ती', en: 'Tea', emoji: '🍵', price: 120 },
  { id: 3, np: 'कापी', en: 'Exercise Book', emoji: '📒', price: 45 },
  { id: 4, np: 'चप्पल', en: 'Slippers', emoji: '🩴', price: 340 },
  { id: 5, np: 'दूध', en: 'Milk', emoji: '🥛', price: 85 },
  { id: 6, np: 'फुटबल', en: 'Football', emoji: '⚽', price: 450 },
  { id: 7, np: 'किताब', en: 'Book', emoji: '📗', price: 160 },
];

const NOTES = [
  { val: 10, color: '#C084FC', border: '#7E22CE', label: 'Rs. 10' },
  { val: 20, color: '#FB923C', border: '#C2410C', label: 'Rs. 20' },
  { val: 50, color: '#60A5FA', border: '#1D4ED8', label: 'Rs. 50' },
  { val: 100, color: '#4ADE80', border: '#15803D', label: 'Rs. 100' },
  { val: 500, color: '#FBBF24', border: '#B45309', label: 'Rs. 500' },
  { val: 1000, color: '#93C5FD', border: '#1E3A8A', label: 'Rs. 1000' },
];

export const MoneyShop: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L17-01',
    chapter: 17,
    titleNp: 'बिल र फिर्ता पसल (मुद्रा)',
    titleEn: 'Bill & Change Shop (Money)',
  });

  const [cart, setCart] = useState<number[]>([3, 5]); // default: copy + milk
  const [payAmount, setPayAmount] = useState<number>(200);

  const totalBill = cart.reduce((sum, idx) => sum + GOODS[idx].price, 0);
  const change = payAmount >= totalBill ? payAmount - totalBill : null;

  const toggleGood = (id: number) => {
    kit.tap();
    if (cart.includes(id)) {
      setCart(cart.filter((x) => x !== id));
    } else {
      if (cart.length >= 3) {
        setCart([...cart.slice(1), id]);
      } else {
        setCart([...cart, id]);
      }
    }
    const good = GOODS[id];
    kit.say(`${good.np} Rs. ${good.price}`, `${good.en}: Rs ${good.price}`);
  };

  const handlePay = (val: number) => {
    setPayAmount(val);
    kit.tap();
    if (val < totalBill) {
      kit.oops(
        `रकम कम भयो! Rs. ${totalBill - val} थप चाहिन्छ।`,
        `Not enough! You need Rs ${totalBill - val} more.`
      );
    } else {
      const chg = val - totalBill;
      kit.say(
        `भुक्तानी: Rs. ${val}। बिल: Rs. ${totalBill}। फिर्ता: Rs. ${chg}।`,
        `Paid: Rs ${val}. Bill: Rs ${totalBill}. Change returned: Rs ${chg}.`
      );
      kit.star();
    }
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const g1 = GOODS[i % GOODS.length];
      const g2 = GOODS[(i + 3) % GOODS.length];
      const sum = g1.price + g2.price;
      const noteVal = NOTES.find((n) => n.val >= sum)?.val || 1000;
      const chg = noteVal - sum;

      if (i % 2 === 0) {
        return {
          np: `${g1.np} (Rs. ${g1.price}) र ${g2.np} (Rs. ${g2.price}) को जम्मा बिल कति?`,
          en: `What is the total bill for ${g1.en} (Rs ${g1.price}) and ${g2.en} (Rs ${g2.price})?`,
          answer: String(sum),
          options: near(sum, i + 2, [10, -10, 20, 50, -50]).map((x) => ({
            key: String(x),
            label: `Rs. ${fmt(kit.lang, x)}`,
          })),
        };
      } else {
        return {
          np: `Rs. ${sum} को बिलमा Rs. ${noteVal} को नोट दिँदा कति फिर्ता आउँछ?`,
          en: `For a bill of Rs ${sum}, paying with a Rs ${noteVal} note returns how much change?`,
          answer: String(chg),
          options: near(chg, i + 5, [10, -10, 5, -5, 20]).map((x) => ({
            key: String(x),
            label: `Rs. ${fmt(kit.lang, x)}`,
          })),
        };
      }
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={
        change !== null
          ? kit.t(`बिल Rs. ${totalBill}। नोट Rs. ${payAmount} दिँदा फिर्ता Rs. ${change}`, `Bill Rs ${totalBill}. Paying Rs ${payAmount} gives Rs ${change} change.`)
          : kit.t('पसलबाट सामान छान्नुहोस् र बिल तथा फिर्ता हिसाब गर्नुहोस्!', 'Pick items from the shop, make the bill, and calculate the change!')
      }
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setCart([])}
            style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🗑️ {kit.t('झोला खाली गर', 'Clear Cart')}
          </button>
          <button
            onClick={() => {
              const r1 = rnd(0, 7);
              let r2 = rnd(0, 7);
              while (r2 === r1) r2 = rnd(0, 7);
              setCart([r1, r2]);
              kit.tap();
            }}
            style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🎲 {kit.t('अन्य सामान', 'Random Items')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 760, gap: 16 }}>
        {/* Goods Shelf */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            width: '100%',
          }}
        >
          {GOODS.map((g) => {
            const isSelected = cart.includes(g.id);
            return (
              <div
                key={g.id}
                onClick={() => toggleGood(g.id)}
                style={{
                  background: isSelected ? '#E6F3E9' : '#FFFFFF',
                  border: isSelected ? '2px solid #187C68' : '1px solid #E2E8F0',
                  borderRadius: 14,
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(24,124,104,0.15)' : 'none',
                }}
              >
                <div style={{ fontSize: 32 }}>{g.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', textAlign: 'center' }}>
                  {kit.t(g.np, g.en)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#187C68' }}>
                  Rs. {fmt(kit.lang, g.price)}
                </div>
                <div style={{ fontSize: 10, color: isSelected ? '#187C68' : '#94A3B8', fontWeight: 700 }}>
                  {isSelected ? `✓ ${kit.t('छानियो', 'Selected')}` : kit.t('छान्नुहोस्', 'Select')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bill Receipt & Payment Panel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            width: '100%',
          }}
        >
          {/* Bill Receipt */}
          <div
            style={{
              background: '#FFFFFF',
              border: '2px solid #E2E8F0',
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 900, color: '#334155', borderBottom: '2px dashed #E2E8F0', paddingBottom: 6 }}>
              🧾 {kit.t('पसलको बिल (Bill)', 'Shop Receipt')}
            </div>
            {cart.length === 0 ? (
              <div style={{ fontSize: 13, color: '#94A3B8', padding: '16px 0', textAlign: 'center' }}>
                {kit.t('सामान छान्नुहोस्', 'Please select items')}
              </div>
            ) : (
              cart.map((id) => (
                <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#475569' }}>
                  <span>{kit.t(GOODS[id].np, GOODS[id].en)}</span>
                  <span>Rs. {fmt(kit.lang, GOODS[id].price)}</span>
                </div>
              ))
            )}
            <div style={{ borderTop: '2px solid #334155', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900, color: '#1E293B' }}>
              <span>{kit.t('जम्मा बिल (Total):', 'Total Bill:')}</span>
              <span style={{ color: '#187C68' }}>Rs. {fmt(kit.lang, totalBill)}</span>
            </div>
          </div>

          {/* Payment & Change Box */}
          <div
            style={{
              background: '#FFFFFF',
              border: '2px solid #E2E8F0',
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: '#334155' }}>
              💵 {kit.t('नेपाली नोट रोज्नुहोस् (Pay with note):', 'Pay with Banknote:')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {NOTES.map((n) => (
                <button
                  key={n.val}
                  onClick={() => handlePay(n.val)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 8,
                    border: payAmount === n.val ? `2px solid ${n.border}` : '1px solid #CBD5E1',
                    background: payAmount === n.val ? n.color : '#F8FAFC',
                    color: payAmount === n.val ? '#FFFFFF' : '#334155',
                    fontWeight: 900,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: payAmount === n.val ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  {n.label}
                </button>
              ))}
            </div>

            <div style={{ borderTop: '2px dashed #E2E8F0', paddingTop: 10, marginTop: 4 }}>
              {payAmount < totalBill ? (
                <div style={{ fontSize: 13, fontWeight: 800, color: '#DC2626' }}>
                  ⚠️ {kit.t(`Rs. ${totalBill - payAmount} अपुग भयो! ठूलो नोट रोज्नुहोस्।`, `Rs ${totalBill - payAmount} short! Choose a larger note.`)}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#334155' }}>
                    {kit.t('फिर्ता रकम (Change):', 'Change Returned:')}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: '#16A34A' }}>
                    Rs. {fmt(kit.lang, payAmount - totalBill)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default MoneyShop;
