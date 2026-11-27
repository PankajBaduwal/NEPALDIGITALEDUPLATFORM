/**
 * Class 4 lessons 8 and 13 · Currency, Bill and budget
 * NoteCounter — 2D Nepali banknote and coin counter.
 * BillShop — 2D grocery store bill generator with quantity × price.
 * BudgetTowers — 2D Income vs Expenses budget balance bars.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, big, Props, numQ } from './h4';

const rs = (lang: 'ne' | 'en', n: number) => `${lang === 'ne' ? 'रु.' : 'Rs.'} ${big(lang, n)}`;

/* ───────────── 1. NoteCounter ───────────── */
const DEN = [1000, 500, 100, 50, 20, 10, 5, 2, 1];
const DCOL = ['#A855F7', '#EC4899', '#F97316', '#10B981', '#0EA5E9', '#F59E0B', '#14B8A6', '#64748B', '#78716C'];

export const NoteCounter: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L8-01',
    chapter: 8,
    titleNp: 'नोट गणक (मुद्रा गणना)',
    titleEn: 'Note Counter (Nepali Currency)',
  });

  const [cnt, setCnt] = useState<number[]>([0, 1, 2, 1, 1, 0, 1, 0, 0]); // initial notes

  const total = useMemo(() => {
    return cnt.reduce((sum, count, i) => sum + count * DEN[i], 0);
  }, [cnt]);

  const add = (idx: number, delta: number) => {
    const next = [...cnt];
    next[idx] = Math.max(0, Math.min(20, next[idx] + delta));
    setCnt(next);
    kit.tap();
    const sub = next[idx] * DEN[idx];
    kit.say(`${next[idx]} × Rs. ${DEN[idx]} = Rs. ${sub}`, `${next[idx]} × Rs ${DEN[idx]} = Rs ${sub}`);
  };

  const clearAll = () => {
    setCnt(new Array(9).fill(0));
    kit.tap();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qDen = DEN[i % DEN.length];
      const qCount = rnd(2, 6);
      const qTot = qDen * qCount;

      return numQ(
        `रु. ${fmt('ne', qDen)} का ${fmt('ne', qCount)} वटा नोटको जम्मा रकम कति हुन्छ?`,
        `What is the total value of ${qCount} notes of Rs ${qDen}?`,
        qTot,
        i,
        [qDen, -qDen, qDen * 2, 100],
        (x) => rs(kit.lang, x),
        1
      );
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `नेपाली मुद्रा: नोट र सिक्काको सङ्ख्या बढाएर वा घटाएर जम्मा रकम हिसाब गरौँ! जम्मा = ${rs(kit.lang, total)}`,
        `Nepali Currency: Adjust note counts to compute total amount! Total = ${rs(kit.lang, total)}`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={clearAll}
            style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🗑️ {kit.t('सबै खाली गर', 'Clear All')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 760, gap: 16 }}>
        {/* Total Banner */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
            {kit.t('जम्मा रकम (Total Money)', 'Total Amount')}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#187C68', marginTop: 4 }}>
            {rs(kit.lang, total)}
          </div>
        </div>

        {/* Currency Denominations Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            width: '100%',
          }}
        >
          {DEN.map((d, i) => {
            const count = cnt[i];
            const isCoin = d < 5;
            const subtotal = count * d;

            return (
              <div
                key={d}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: `2px solid ${DCOL[i]}`,
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                {/* Note / Coin Header */}
                <div
                  style={{
                    background: DCOL[i],
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: isCoin ? 20 : 6,
                    fontWeight: 900,
                    fontSize: 14,
                  }}
                >
                  {isCoin ? `🪙 Rs. ${d}` : `💵 Rs. ${d}`}
                </div>

                {/* Subtotal */}
                <div style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>
                  {fmt(kit.lang, count)} × {d} = <span style={{ color: DCOL[i] }}> Rs. {fmt(kit.lang, subtotal)}</span>
                </div>

                {/* Counter Steppers */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => add(i, -1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      background: '#F8FAFC',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: 16, fontWeight: 900, width: 24, textAlign: 'center' }}>
                    {fmt(kit.lang, count)}
                  </span>
                  <button
                    onClick={() => add(i, 1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      background: '#F8FAFC',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SimFrame2D>
  );
};

/* ───────────── 2. BillShop ───────────── */
const SHOP_ITEMS = [
  { np: 'चामल (1 किलो)', en: 'Rice (1 kg)', price: 120, emoji: '🍚', color: '#F59E0B' },
  { np: 'दाल (1 किलो)', en: 'Lentils (1 kg)', price: 180, emoji: '🍲', color: '#EF4444' },
  { np: 'चिनी (1 किलो)', en: 'Sugar (1 kg)', price: 110, emoji: '🧂', color: '#64748B' },
  { np: 'तेल (1 लिटर)', en: 'Oil (1 L)', price: 250, emoji: '🛢️', color: '#EAB308' },
  { np: 'कापी', en: 'Copy Book', price: 30, emoji: '📒', color: '#0EA5E9' },
  { np: 'पेन्सिल', en: 'Pencil', price: 10, emoji: '✏️', color: '#10B981' },
];

export const BillShop: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L13-01',
    chapter: 13,
    titleNp: 'बिल पसल (खरिद र हिसाब)',
    titleEn: 'Bill Shop (Purchases and Total)',
  });

  const [quantities, setQuantities] = useState<number[]>([2, 0, 1, 0, 3, 0]);

  const totalBill = quantities.reduce((sum, qty, idx) => sum + qty * SHOP_ITEMS[idx].price, 0);

  const bumpQty = (idx: number, delta: number) => {
    const next = [...quantities];
    next[idx] = Math.max(0, Math.min(9, next[idx] + delta));
    setQuantities(next);
    kit.tap();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const it1 = SHOP_ITEMS[i % SHOP_ITEMS.length];
      const it2 = SHOP_ITEMS[(i + 2) % SHOP_ITEMS.length];
      const q1 = rnd(1, 3);
      const q2 = rnd(1, 2);
      const bill = q1 * it1.price + q2 * it2.price;

      return numQ(
        `${it1.np} ${q1} वटा र ${it2.np} ${q2} वटाको जम्मा बिल कति हुन्छ?`,
        `What is the total bill for ${q1} of ${it1.en} and ${q2} of ${it2.en}?`,
        bill,
        i,
        [it1.price, -it2.price, 50, -50],
        (x) => rs(kit.lang, x),
        1
      );
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `सामानको परिमाण (Quantity) × दर (Rate) = रकम। सबै सामानको जम्मा बिल = ${rs(kit.lang, totalBill)}`,
        `Quantity × Unit Rate = Item Total. Grand Total Bill = ${rs(kit.lang, totalBill)}`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={() => setQuantities([0, 0, 0, 0, 0, 0])}
            style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🗑️ {kit.t('झोला खाली गर', 'Clear Cart')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 740, gap: 16 }}>
        {/* Items Shelf */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            width: '100%',
          }}
        >
          {SHOP_ITEMS.map((item, idx) => {
            const qty = quantities[idx];
            return (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ fontSize: 20 }}>{item.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1E293B' }}>{kit.t(item.np, item.en)}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}> Rs. {fmt(kit.lang, item.price)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => bumpQty(idx, -1)}
                    style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 900, cursor: 'pointer' }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: 15, fontWeight: 900, width: 20, textAlign: 'center' }}>
                    {fmt(kit.lang, qty)}
                  </span>
                  <button
                    onClick={() => bumpQty(idx, 1)}
                    style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 900, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bill Receipt Table */}
        <div
          style={{
            width: '100%',
            background: '#FFFFFF',
            borderRadius: 18,
            border: '2px solid #E2E8F0',
            padding: '20px 24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, color: '#334155', borderBottom: '2px dashed #E2E8F0', paddingBottom: 6 }}>
            🧾 {kit.t('पसलको बिल (Bill Receipt)', 'Shop Bill Receipt')}
          </div>
          {SHOP_ITEMS.map((item, idx) => {
            const qty = quantities[idx];
            if (qty === 0) return null;
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#475569' }}>
                <span>{kit.t(item.np, item.en)}</span>
                <span>
                  {fmt(kit.lang, qty)} × Rs. {fmt(kit.lang, item.price)} = Rs. {fmt(kit.lang, qty * item.price)}
                </span>
              </div>
            );
          })}
          <div style={{ borderTop: '2px solid #334155', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900, color: '#187C68' }}>
            <span>{kit.t('जम्मा रकम (Grand Total):', 'Grand Total:')}</span>
            <span>{rs(kit.lang, totalBill)}</span>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

/* ───────────── 3. BudgetTowers ───────────── */
const BCAT = [
  { np: 'खाना', en: 'Food', color: '#EF4444' },
  { np: 'शिक्षा', en: 'School', color: '#0EA5E9' },
  { np: 'यातायात', en: 'Travel', color: '#EAB308' },
  { np: 'घरायसी', en: 'Household', color: '#8B5CF6' },
];

export const BudgetTowers: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L13-02',
    chapter: 13,
    titleNp: 'बजेट टावर (आम्दानी र खर्च)',
    titleEn: 'Budget Towers (Income and Expenses)',
  });

  const [income, setIncome] = useState(30000);
  const [expenses, setExpenses] = useState<number[]>([10000, 6000, 3000, 5000]);

  const totalExpense = expenses.reduce((sum, e) => sum + e, 0);
  const saving = income - totalExpense;

  const bumpExpense = (idx: number, delta: number) => {
    const next = [...expenses];
    next[idx] = Math.max(0, Math.min(20000, next[idx] + delta));
    setExpenses(next);
    kit.tap();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qInc = rnd(3, 6) * 10000;
      const qExp = rnd(15, 25) * 1000;
      const qSave = qInc - qExp;

      return numQ(
        `आम्दानी ${rs('ne', qInc)} र कुल खर्च ${rs('ne', qExp)} हुँदा बचत कति हुन्छ?`,
        `If income is ${rs('en', qInc)} and total spending is ${rs('en', qExp)}, what is the savings?`,
        qSave,
        i,
        [1000, -1000, 5000, -5000],
        (x) => rs(kit.lang, x),
        1
      );
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `बचत = आम्दानी (${rs('ne', income)}) − खर्च (${rs('ne', totalExpense)}) = ${rs('ne', saving)}`,
        `Savings = Income (${rs('en', income)}) − Expenses (${rs('en', totalExpense)}) = ${rs('en', saving)}`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setIncome(Math.max(10000, income - 5000))}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('आम्दानी', 'Income')} −
          </button>
          <button
            onClick={() => setIncome(Math.min(50000, income + 5000))}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('आम्दानी', 'Income')} +
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 740, gap: 16 }}>
        {/* Budget Balance Banner */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-around',
            width: '100%',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>{kit.t('आम्दानी (Income)', 'Income')}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0284C7' }}>{rs(kit.lang, income)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>{kit.t('खर्च (Expenses)', 'Expenses')}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#EF4444' }}>{rs(kit.lang, totalExpense)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>
              {saving >= 0 ? kit.t('बचत (Savings)', 'Savings') : kit.t('घाटा (Deficit)', 'Deficit')}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: saving >= 0 ? '#10B981' : '#DC2626' }}>
              {rs(kit.lang, saving)}
            </div>
          </div>
        </div>

        {/* 2D Bar Graph Towers */}
        <div
          style={{
            width: '100%',
            background: '#FFFFFF',
            borderRadius: 18,
            border: '2px solid #E2E8F0',
            padding: '24px 20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            minHeight: 220,
          }}
        >
          {/* Income Tower */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#0284C7' }}>{rs(kit.lang, income)}</div>
            <div
              style={{
                width: 44,
                height: Math.min(160, (160 * income) / 50000),
                background: '#0284C7',
                borderRadius: '8px 8px 0 0',
                transition: 'height 0.3s ease',
              }}
            />
            <div style={{ fontSize: 12, fontWeight: 900, color: '#334155' }}>{kit.t('आम्दानी', 'Income')}</div>
          </div>

          {/* Expense Towers */}
          {BCAT.map((cat, idx) => {
            const val = expenses[idx];
            return (
              <div key={cat.en} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: cat.color }}>{rs(kit.lang, val)}</div>
                <div
                  style={{
                    width: 36,
                    height: Math.min(160, (160 * val) / 50000),
                    background: cat.color,
                    borderRadius: '8px 8px 0 0',
                    transition: 'height 0.3s ease',
                  }}
                />
                <div style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>{kit.t(cat.np, cat.en)}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <button
                    onClick={() => bumpExpense(idx, -1000)}
                    style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 900, cursor: 'pointer' }}
                  >
                    −
                  </button>
                  <button
                    onClick={() => bumpExpense(idx, 1000)}
                    style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 900, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}

          {/* Saving / Deficit Tower */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: saving >= 0 ? '#10B981' : '#DC2626' }}>
              {rs(kit.lang, saving)}
            </div>
            <div
              style={{
                width: 44,
                height: Math.max(8, Math.min(160, (160 * Math.abs(saving)) / 50000)),
                background: saving >= 0 ? '#10B981' : '#DC2626',
                borderRadius: '8px 8px 0 0',
                transition: 'height 0.3s ease',
              }}
            />
            <div style={{ fontSize: 12, fontWeight: 900, color: '#334155' }}>
              {saving >= 0 ? kit.t('बचत', 'Savings') : kit.t('घाटा', 'Deficit')}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default NoteCounter;
