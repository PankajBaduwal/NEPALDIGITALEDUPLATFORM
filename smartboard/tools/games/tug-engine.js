'use strict';

// ═══════════════════════════════════════════════════════════
// MATH TUG OF WAR — AUTHORITATIVE GAME ENGINE & QUESTION GENERATOR
// Pure deterministic logic (no DOM). Works in Node (tests) and Browser (Smart Board).
// Supports simultaneous multi-team answering, turn-based, teacher challenge & quick battle.
// ═══════════════════════════════════════════════════════════
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TugEngine = api;
})(typeof self !== 'undefined' ? self : this, function () {

  const NP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  function toNp(val) {
    return String(val).replace(/\d/g, (d) => NP_DIGITS[Number(d)]);
  }

  function createRng(seed) {
    let s = (Number.isFinite(seed) ? seed : Math.floor(Math.random() * 2 ** 32)) >>> 0;
    const next = () => {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
      next,
      int: (min, max) => min + Math.floor(next() * (max - min + 1)),
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      shuffle: (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      },
    };
  }

  // ── Grade-wise Topics (Nepal CDC Classes 1–5) ──
  const TOPICS_BY_GRADE = {
    1: [
      { id: 'mixed', en: 'Mixed Class 1', ne: 'मिश्रित (कक्षा १)' },
      { id: 'counting', en: 'Counting Objects', ne: 'वस्तु गन्ने' },
      { id: 'addition', en: 'Addition (up to 20)', ne: 'जोड (२० सम्म)' },
      { id: 'subtraction', en: 'Subtraction (up to 20)', ne: 'घटाउ (२० सम्म)' },
      { id: 'oddeven', en: 'Odd & Even', ne: 'जोडी र बिजोर' },
      { id: 'comparison', en: 'Greater / Smaller', ne: 'ठूलो र सानो' },
      { id: 'shapes', en: 'Basic Shapes', ne: 'आधारभूत आकारहरू' },
    ],
    2: [
      { id: 'mixed', en: 'Mixed Class 2', ne: 'मिश्रित (कक्षा २)' },
      { id: 'addition', en: '2-Digit Addition', ne: '२-अङ्कको जोड' },
      { id: 'subtraction', en: '2-Digit Subtraction', ne: '२-अङ्कको घटाउ' },
      { id: 'multiplication', en: 'Multiplication Intro', ne: 'गुणन परिचय' },
      { id: 'ordering', en: 'Number Patterns', ne: 'सङ्ख्या क्रम' },
      { id: 'time_measure', en: 'Time & Measure', ne: 'समय र नाप' },
    ],
    3: [
      { id: 'mixed', en: 'Mixed Class 3', ne: 'मिश्रित (कक्षा ३)' },
      { id: 'add_sub', en: '3-Digit Add & Sub', ne: '३-अङ्क जोड र घटाउ' },
      { id: 'mul_div', en: 'Multiply & Divide', ne: 'गुणन र भाग' },
      { id: 'patterns', en: 'Number Patterns', ne: 'सङ्ख्या ढाँचा' },
      { id: 'fractions', en: 'Fractions Intro', ne: 'भिन्न परिचय' },
      { id: 'measurement', en: 'Measurement & Money', ne: 'नाप र मुद्रा' },
    ],
    4: [
      { id: 'mixed', en: 'Mixed Class 4', ne: 'मिश्रित (कक्षा ४)' },
      { id: 'large_ops', en: 'Large Operations', ne: 'ठूला सङ्ख्या हिसाब' },
      { id: 'mul_div', en: 'Multi-digit Mul/Div', ne: 'गुणन र भाग' },
      { id: 'fractions', en: 'Fractions', ne: 'भिन्न हिसाब' },
      { id: 'geometry', en: 'Perimeter & Angles', ne: 'परिधि र कोण' },
      { id: 'time_money', en: 'Time & Money', ne: 'समय र पैसा' },
    ],
    5: [
      { id: 'mixed', en: 'Mixed Class 5', ne: 'मिश्रित (कक्षा ५)' },
      { id: 'large_ops', en: 'Multi-step Ops', ne: 'मिश्रित क्रिया' },
      { id: 'decimals', en: 'Decimals', ne: 'दशमलव' },
      { id: 'factors', en: 'Factors & Multiples', ne: 'गुणनखण्ड र अपवर्त्य' },
      { id: 'geometry', en: 'Area & Angles', ne: 'क्षेत्रफल र कोण' },
      { id: 'percentage', en: 'Percentage Basics', ne: 'प्रतिशत' },
    ],
  };

  function makeMcqOptions(correctVal, candidateWrong, rng) {
    const set = new Set([String(correctVal)]);
    for (const w of candidateWrong) {
      if (set.size >= 4) break;
      if (w !== undefined && w !== null && String(w) !== String(correctVal)) {
        set.add(String(w));
      }
    }
    let guard = 0;
    while (set.size < 4 && guard < 30) {
      guard++;
      const num = Number(correctVal);
      if (Number.isFinite(num)) {
        const delta = rng.pick([-3, -2, -1, 1, 2, 3, 4, 5, -4, 10]);
        const cand = Math.max(0, num + delta);
        if (String(cand) !== String(correctVal)) set.add(String(cand));
      } else {
        break;
      }
    }
    return rng.shuffle(Array.from(set));
  }

  let qSeq = 0;

  function generateQuestion(opts, usedKeys, rngInput) {
    const rng = rngInput || createRng();
    const grade = Math.min(5, Math.max(1, Number(opts.grade) || 1));
    const difficulty = ['easy', 'medium', 'hard'].includes(opts.difficulty) ? opts.difficulty : 'medium';
    const topics = TOPICS_BY_GRADE[grade] || TOPICS_BY_GRADE[1];
    let topic = opts.topic || 'mixed';
    if (topic === 'mixed') {
      const nonMixed = topics.filter((t) => t.id !== 'mixed');
      topic = rng.pick(nonMixed).id;
    }

    for (let attempt = 0; attempt < 25; attempt++) {
      const q = buildQuestionByGradeTopic(grade, topic, difficulty, rng);
      const dedupKey = `${grade}:${topic}:${q.key}`;
      if (!usedKeys || !usedKeys.has(dedupKey) || attempt === 24) {
        if (usedKeys) usedKeys.add(dedupKey);
        qSeq++;
        q.id = `q_${qSeq}_${rng.int(100, 999)}`;
        q.grade = grade;
        q.topic = topic;
        q.difficulty = difficulty;
        return q;
      }
    }
  }

  function buildQuestionByGradeTopic(grade, topic, difficulty, rng) {
    // ── CLASS 1 ──
    if (grade === 1) {
      if (topic === 'counting') {
        const maxN = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 10 : 16;
        const n = rng.int(1, maxN);
        const emoji = rng.pick(['🍎', '⭐', '🌸', '🐟', '🎈']);
        const visual = Array(n).fill(emoji).join(' ');
        return {
          key: `cnt_${n}_${emoji}`,
          type: 'numeric',
          promptEn: `Count the objects:`,
          promptNe: `वस्तुहरू गन्नुहोस्:`,
          visual,
          answer: String(n),
          options: makeMcqOptions(n, [n + 1, Math.max(1, n - 1), n + 2], rng),
        };
      }
      if (topic === 'addition') {
        const cap = difficulty === 'easy' ? 10 : 20;
        const a = rng.int(1, Math.floor(cap / 2));
        const b = rng.int(1, cap - a);
        const ans = a + b;
        return {
          key: `g1_add_${a}_${b}`,
          type: 'numeric',
          promptEn: `${a} + ${b} = ?`,
          promptNe: `${toNp(a)} + ${toNp(b)} = ?`,
          answer: String(ans),
          options: makeMcqOptions(ans, [ans + 1, Math.max(0, ans - 1), ans + 2], rng),
        };
      }
      if (topic === 'subtraction') {
        const cap = difficulty === 'easy' ? 10 : 20;
        const a = rng.int(3, cap);
        const b = rng.int(1, a - 1);
        const ans = a - b;
        return {
          key: `g1_sub_${a}_${b}`,
          type: 'numeric',
          promptEn: `${a} − ${b} = ?`,
          promptNe: `${toNp(a)} − ${toNp(b)} = ?`,
          answer: String(ans),
          options: makeMcqOptions(ans, [ans + 1, Math.max(0, ans - 1), ans + 2], rng),
        };
      }
      if (topic === 'oddeven') {
        const n = rng.int(1, difficulty === 'easy' ? 10 : 20);
        const isEven = n % 2 === 0;
        return {
          key: `g1_oe_${n}`,
          type: 'choice',
          promptEn: `Is ${n} Odd or Even?`,
          promptNe: `${toNp(n)} जोडी (Even) हो कि बिजोर (Odd)?`,
          answer: isEven ? 'Even' : 'Odd',
          options: ['Even', 'Odd'],
          optionsNe: { Even: 'जोडी (Even)', Odd: 'बिजोर (Odd)' },
        };
      }
      if (topic === 'comparison') {
        const a = rng.int(1, 20);
        let b = rng.int(1, 20);
        if (a === b) b = a === 20 ? 18 : a + 2;
        const askGreater = rng.next() > 0.5;
        const ans = askGreater ? Math.max(a, b) : Math.min(a, b);
        return {
          key: `g1_cmp_${a}_${b}_${askGreater}`,
          type: 'numeric',
          promptEn: askGreater ? `Which is GREATER: ${a} or ${b}?` : `Which is SMALLER: ${a} or ${b}?`,
          promptNe: askGreater ? `कुन ठूलो हो: ${toNp(a)} कि ${toNp(b)}?` : `कुन सानो हो: ${toNp(a)} कि ${toNp(b)}?`,
          answer: String(ans),
          options: rng.shuffle([String(a), String(b)]),
        };
      }
      // shapes
      const shapes = [
        { en: 'Triangle (△)', ne: 'त्रिभुज (△)', sides: 3 },
        { en: 'Square (□)', ne: 'वर्ग (□)', sides: 4 },
        { en: 'Rectangle (▭)', ne: 'आयत (▭)', sides: 4 },
        { en: 'Circle (○)', ne: 'वृत्त (○)', sides: 0 },
      ];
      const sh = rng.pick(shapes);
      return {
        key: `g1_sh_${sh.en}`,
        type: 'numeric',
        promptEn: `How many sides does a ${sh.en} have?`,
        promptNe: `${sh.ne} का कति ओटा भुजा हुन्छन्?`,
        answer: String(sh.sides),
        options: makeMcqOptions(sh.sides, [0, 3, 4, 5], rng),
      };
    }

    // ── CLASS 2 ──
    if (grade === 2) {
      if (topic === 'addition') {
        const max = difficulty === 'easy' ? 40 : difficulty === 'medium' ? 75 : 99;
        const a = rng.int(11, max - 10);
        const b = rng.int(10, max - a);
        const ans = a + b;
        return {
          key: `g2_add_${a}_${b}`,
          type: 'numeric',
          promptEn: `${a} + ${b} = ?`,
          promptNe: `${toNp(a)} + ${toNp(b)} = ?`,
          answer: String(ans),
          options: makeMcqOptions(ans, [ans + 10, ans - 1, ans + 2], rng),
        };
      }
      if (topic === 'subtraction') {
        const max = difficulty === 'easy' ? 50 : 99;
        const a = rng.int(25, max);
        const b = rng.int(11, a - 5);
        const ans = a - b;
        return {
          key: `g2_sub_${a}_${b}`,
          type: 'numeric',
          promptEn: `${a} − ${b} = ?`,
          promptNe: `${toNp(a)} − ${toNp(b)} = ?`,
          answer: String(ans),
          options: makeMcqOptions(ans, [ans + 1, ans - 2, ans + 10], rng),
        };
      }
      if (topic === 'multiplication') {
        const tables = difficulty === 'easy' ? [2, 5, 10] : [2, 3, 4, 5, 10];
        const a = rng.pick(tables);
        const b = rng.int(1, 10);
        const ans = a * b;
        return {
          key: `g2_mul_${a}_${b}`,
          type: 'numeric',
          promptEn: `${a} × ${b} = ?`,
          promptNe: `${toNp(a)} × ${toNp(b)} = ?`,
          answer: String(ans),
          options: makeMcqOptions(ans, [ans + a, Math.max(0, ans - a), a + b], rng),
        };
      }
      if (topic === 'ordering') {
        const step = rng.pick([2, 5, 10]);
        const start = rng.int(1, 5) * step;
        const seq = [start, start + step, start + 2 * step, start + 3 * step];
        const ans = start + 4 * step;
        return {
          key: `g2_ord_${start}_${step}`,
          type: 'numeric',
          promptEn: `Next number: ${seq.join(', ')}, __`,
          promptNe: `पछिल्लो सङ्ख्या: ${seq.map(toNp).join(', ')}, __`,
          answer: String(ans),
          options: makeMcqOptions(ans, [ans + step, ans - 1, ans + 2], rng),
        };
      }
      // time_measure
      const hrs = rng.int(1, 6);
      const ans = hrs * 60;
      return {
        key: `g2_tm_${hrs}`,
        type: 'numeric',
        promptEn: `1 hour = 60 min. ${hrs} hours = __ min?`,
        promptNe: `१ घण्टा = ६० मिनेट। ${toNp(hrs)} घण्टा = __ मिनेट?`,
        answer: String(ans),
        options: makeMcqOptions(ans, [ans + 60, ans - 30, hrs * 10], rng),
      };
    }

    // ── CLASS 3 ──
    if (grade === 3) {
      if (topic === 'add_sub') {
        const isAdd = rng.next() > 0.45;
        if (isAdd) {
          const a = rng.int(105, 480);
          const b = rng.int(105, 490);
          const ans = a + b;
          return {
            key: `g3_add_${a}_${b}`,
            type: 'numeric',
            promptEn: `${a} + ${b} = ?`,
            promptNe: `${toNp(a)} + ${toNp(b)} = ?`,
            answer: String(ans),
            options: makeMcqOptions(ans, [ans + 10, ans - 10, ans + 100], rng),
          };
        }
        const a = rng.int(350, 950);
        const b = rng.int(105, a - 40);
        const ans = a - b;
        return {
          key: `g3_sub_${a}_${b}`,
          type: 'numeric',
          promptEn: `${a} − ${b} = ?`,
          promptNe: `${toNp(a)} − ${toNp(b)} = ?`,
          answer: String(ans),
          options: makeMcqOptions(ans, [ans + 10, ans - 10, ans + 1], rng),
        };
      }
      if (topic === 'mul_div') {
        const isMul = rng.next() > 0.4;
        const a = rng.int(2, difficulty === 'easy' ? 6 : 12);
        const b = rng.int(2, 10);
        if (isMul) {
          const ans = a * b;
          return {
            key: `g3_mul_${a}_${b}`,
            type: 'numeric',
            promptEn: `${a} × ${b} = ?`,
            promptNe: `${toNp(a)} × ${toNp(b)} = ?`,
            answer: String(ans),
            options: makeMcqOptions(ans, [ans + a, ans - b, a + b], rng),
          };
        }
        const prod = a * b;
        return {
          key: `g3_div_${prod}_${a}`,
          type: 'numeric',
          promptEn: `${prod} ÷ ${a} = ?`,
          promptNe: `${toNp(prod)} ÷ ${toNp(a)} = ?`,
          answer: String(b),
          options: makeMcqOptions(b, [b + 1, Math.max(1, b - 1), a], rng),
        };
      }
      if (topic === 'patterns') {
        const step = rng.pick([3, 4, 6, 7, 8, 9]);
        const start = rng.int(2, 15);
        const seq = [start, start + step, start + 2 * step, start + 3 * step];
        const ans = start + 4 * step;
        return {
          key: `g3_pat_${start}_${step}`,
          type: 'numeric',
          promptEn: `Pattern: ${seq.join(', ')}, __`,
          promptNe: `ढाँचा: ${seq.map(toNp).join(', ')}, __`,
          answer: String(ans),
          options: makeMcqOptions(ans, [ans + step, ans - 1, ans + 2], rng),
        };
      }
      if (topic === 'fractions') {
        const den = rng.pick([2, 4, 5, 10]);
        const whole = den * rng.int(2, 8);
        const ans = whole / den;
        return {
          key: `g3_fr_${den}_${whole}`,
          type: 'numeric',
          promptEn: `What is 1/${den} of ${whole}?`,
          promptNe: `${toNp(whole)} को १/${toNp(den)} भाग कति हुन्छ?`,
          answer: String(ans),
          options: makeMcqOptions(ans, [ans + 2, Math.max(1, ans - 1), whole], rng),
        };
      }
      // measurement
      const m = rng.int(2, 9);
      const ans = m * 100;
      return {
        key: `g3_meas_${m}`,
        type: 'numeric',
        promptEn: `${m} m = __ cm`,
        promptNe: `${toNp(m)} मिटर = __ से.मि.`,
        answer: String(ans),
        options: makeMcqOptions(ans, [m * 10, m * 1000, ans + 50], rng),
      };
    }

    // ── CLASS 4 ──
    if (grade === 4) {
      if (topic === 'large_ops') {
        const a = rng.int(1200, 4800);
        const b = rng.int(1100, 3900);
        const ans = a + b;
        return {
          key: `g4_add_${a}_${b}`,
          type: 'numeric',
          promptEn: `${a} + ${b} = ?`,
          promptNe: `${toNp(a)} + ${toNp(b)} = ?`,
          answer: String(ans),
          options: makeMcqOptions(ans, [ans + 100, ans - 10, ans + 10], rng),
        };
      }
      if (topic === 'mul_div') {
        const a = rng.int(12, difficulty === 'hard' ? 35 : 24);
        const b = rng.int(3, 9);
        const ans = a * b;
        return {
          key: `g4_mul_${a}_${b}`,
          type: 'numeric',
          promptEn: `${a} × ${b} = ?`,
          promptNe: `${toNp(a)} × ${toNp(b)} = ?`,
          answer: String(ans),
          options: makeMcqOptions(ans, [ans + b, ans - a, ans + 10], rng),
        };
      }
      if (topic === 'fractions') {
        const d = rng.pick([5, 6, 7, 8, 9, 10]);
        const n1 = rng.int(1, d - 2);
        const n2 = rng.int(1, d - n1);
        const sumN = n1 + n2;
        return {
          key: `g4_fr_${n1}_${n2}_${d}`,
          type: 'numeric',
          promptEn: `${n1}/${d} + ${n2}/${d} = ?/${d} (top number)`,
          promptNe: `${toNp(n1)}/${toNp(d)} + ${toNp(n2)}/${toNp(d)} = ?/${toNp(d)} (अंश)`,
          answer: String(sumN),
          options: makeMcqOptions(sumN, [sumN + 1, Math.max(1, sumN - 1), d], rng),
        };
      }
      if (topic === 'geometry') {
        const l = rng.int(4, 15);
        const w = rng.int(3, 12);
        const peri = 2 * (l + w);
        return {
          key: `g4_peri_${l}_${w}`,
          type: 'numeric',
          promptEn: `Perimeter of rectangle (${l} cm × ${w} cm)?`,
          promptNe: `आयत (${toNp(l)} से.मि. × ${toNp(w)} से.मि.) को परिधि कति?`,
          answer: String(peri),
          options: makeMcqOptions(peri, [l * w, l + w, peri + 2], rng),
        };
      }
      // time_money
      const rs = rng.int(10, 45);
      const qty = rng.int(2, 6);
      const ans = rs * qty;
      return {
        key: `g4_mon_${rs}_${qty}`,
        type: 'numeric',
        promptEn: `1 pen costs Rs ${rs}. Cost of ${qty} pens?`,
        promptNe: `१ कलमको रु ${toNp(rs)} पर्छ। ${toNp(qty)} कलमको कति?`,
        answer: String(ans),
        options: makeMcqOptions(ans, [ans + rs, ans - qty, rs + qty], rng),
      };
    }

    // ── CLASS 5 ──
    if (topic === 'large_ops') {
      const a = rng.int(4, 12);
      const b = rng.int(2, 9);
      const c = rng.int(3, 15);
      const ans = a * b + c;
      return {
        key: `g5_ops_${a}_${b}_${c}`,
        type: 'numeric',
        promptEn: `${a} × ${b} + ${c} = ?`,
        promptNe: `${toNp(a)} × ${toNp(b)} + ${toNp(c)} = ?`,
        answer: String(ans),
        options: makeMcqOptions(ans, [a * (b + c), ans + 2, ans - 3], rng),
      };
    }
    if (topic === 'decimals') {
      const a = rng.int(12, 55) / 10;
      const b = rng.int(11, 45) / 10;
      const ans = Number((a + b).toFixed(1));
      return {
        key: `g5_dec_${a}_${b}`,
        type: 'numeric',
        promptEn: `${a.toFixed(1)} + ${b.toFixed(1)} = ?`,
        promptNe: `${toNp(a.toFixed(1))} + ${toNp(b.toFixed(1))} = ?`,
        answer: String(ans),
        options: makeMcqOptions(ans, [Number((ans + 0.5).toFixed(1)), Number((ans + 1).toFixed(1)), Number((Math.max(0.1, ans - 0.5)).toFixed(1))], rng),
      };
    }
    if (topic === 'factors') {
      const pairs = [
        { a: 12, b: 18, hcf: 6 },
        { a: 15, b: 25, hcf: 5 },
        { a: 16, b: 24, hcf: 8 },
        { a: 18, b: 27, hcf: 9 },
        { a: 14, b: 21, hcf: 7 },
        { a: 20, b: 30, hcf: 10 },
      ];
      const p = rng.pick(pairs);
      return {
        key: `g5_hcf_${p.a}_${p.b}`,
        type: 'numeric',
        promptEn: `HCF (GCF) of ${p.a} and ${p.b} = ?`,
        promptNe: `${toNp(p.a)} र ${toNp(p.b)} को म.स. (HCF) कति?`,
        answer: String(p.hcf),
        options: makeMcqOptions(p.hcf, [p.hcf + 1, Math.max(2, p.hcf - 2), p.a], rng),
      };
    }
    if (topic === 'geometry') {
      const b = rng.int(4, 12) * 2;
      const h = rng.int(3, 10);
      const area = (b * h) / 2;
      return {
        key: `g5_area_${b}_${h}`,
        type: 'numeric',
        promptEn: `Area of triangle (base ${b}, height ${h})?`,
        promptNe: `त्रिभुजको क्षेत्रफल (आधार ${toNp(b)}, उचाइ ${toNp(h)})?`,
        answer: String(area),
        options: makeMcqOptions(area, [b * h, area + 4, b + h], rng),
      };
    }
    // percentage
    const pct = rng.pick([10, 20, 25, 50]);
    const base = rng.pick([40, 60, 80, 100, 120, 200]);
    const ans = (pct * base) / 100;
    return {
      key: `g5_pct_${pct}_${base}`,
      type: 'numeric',
      promptEn: `${pct}% of ${base} = ?`,
      promptNe: `${toNp(base)} को ${toNp(pct)}% = ?`,
      answer: String(ans),
      options: makeMcqOptions(ans, [ans + 10, Math.max(1, ans - 5), base - ans], rng),
    };
  }

  // ── Authoritative Match State Manager ──
  function createMatch(config, rngInput) {
    const rng = rngInput || createRng();
    const cfg = Object.assign(
      {
        teamAName: 'Team A',
        teamBName: 'Team B',
        grade: 2,
        topic: 'mixed',
        difficulty: 'medium',
        mode: 'simultaneous', // 'simultaneous' | 'turnbased' | 'teacher' | 'quick'
        answerStyle: 'keypad', // 'keypad' | 'choice'
        questionSync: 'different', // 'different' | 'same'
        pullStrength: 10,
        boundary: 50,
        durationSeconds: 120,
        totalRounds: 3,
        roundNumber: 1,
      },
      config || {}
    );

    if (cfg.mode === 'quick') {
      cfg.durationSeconds = 60;
      cfg.pullStrength = 12.5;
    }

    const usedKeys = new Set();
    const qA = generateQuestion(cfg, usedKeys, rng);
    const qB =
      cfg.questionSync === 'same' || cfg.mode === 'teacher'
        ? Object.assign({}, qA, { id: qA.id + '_b' })
        : generateQuestion(cfg, usedKeys, rng);

    const makeTeam = (id, name, initialQ) => ({
      id,
      name: String(name || (id === 0 ? 'Team A' : 'Team B')).slice(0, 20),
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      attemptedCount: 0,
      streak: 0,
      bestStreak: 0,
      questionNumber: 1,
      currentQuestion: initialQ,
      answeredQuestionIds: new Set(),
      lastFeedback: null,
    });

    return {
      cfg,
      rng,
      usedKeys,
      status: 'playing', // 'playing' | 'paused' | 'finished'
      ropePosition: 0, // -boundary (Team A wins) .. 0 (center) .. +boundary (Team B wins)
      boundary: cfg.boundary,
      pullStrength: cfg.pullStrength,
      turn: 0, // only used when cfg.mode === 'turnbased'
      winner: null, // null | 0 | 1 | 'draw'
      winReason: null, // 'boundary' | 'timer' | 'ended'
      timeLeft: cfg.durationSeconds,
      eventLog: [],
      teams: [makeTeam(0, cfg.teamAName, qA), makeTeam(1, cfg.teamBName, qB)],
    };
  }

  function nextQuestionFor(state, teamId) {
    const team = state.teams[teamId];
    if (!team) return;
    if (state.cfg.questionSync === 'same' || state.cfg.mode === 'teacher') {
      const otherId = teamId === 0 ? 1 : 0;
      const otherQ = state.teams[otherId].currentQuestion;
      // If the other team hasn't answered this shared question yet, keep sync; otherwise generate fresh
      if (otherQ && team.questionNumber < state.teams[otherId].questionNumber) {
        team.questionNumber += 1;
        team.currentQuestion = Object.assign({}, otherQ, { id: `${otherQ.id}_t${teamId}_${team.questionNumber}` });
        return;
      }
    }
    team.questionNumber += 1;
    team.currentQuestion = generateQuestion(state.cfg, state.usedKeys, state.rng);
  }

  /**
   * Authoritative, deterministic answer processor.
   * Safe against duplicate submissions, simultaneous taps, and stale question IDs.
   */
  function submitAnswer(state, teamId, questionId, submittedValue) {
    if (!state || state.status !== 'playing') {
      return { accepted: false, reason: 'match_not_playing' };
    }
    const team = state.teams[teamId];
    if (!team || !team.currentQuestion) {
      return { accepted: false, reason: 'invalid_team' };
    }
    if (state.cfg.mode === 'turnbased' && state.turn !== teamId) {
      return { accepted: false, reason: 'not_your_turn' };
    }
    if (team.currentQuestion.id !== questionId) {
      return { accepted: false, reason: 'stale_question' };
    }
    if (team.answeredQuestionIds.has(questionId)) {
      return { accepted: false, reason: 'duplicate_submission' };
    }

    // Mark as answered immediately to prevent double submission
    team.answeredQuestionIds.add(questionId);
    team.attemptedCount += 1;

    const expected = String(team.currentQuestion.answer).trim().toLowerCase();
    const given = String(submittedValue == null ? '' : submittedValue).trim().toLowerCase();
    const isCorrect = expected === given;

    if (isCorrect) {
      team.score += 1;
      team.correctCount += 1;
      team.streak += 1;
      if (team.streak > team.bestStreak) team.bestStreak = team.streak;

      const delta = teamId === 0 ? -state.pullStrength : state.pullStrength;
      state.ropePosition = Math.max(-state.boundary, Math.min(state.boundary, state.ropePosition + delta));
      team.lastFeedback = { ok: true, combo: team.streak >= 3, answer: team.currentQuestion.answer };

      state.eventLog.push({
        t: state.cfg.durationSeconds - state.timeLeft,
        teamId,
        correct: true,
        ropeAfter: state.ropePosition,
      });

      // Check winning boundary
      if (state.ropePosition <= -state.boundary) {
        state.status = 'finished';
        state.winner = 0;
        state.winReason = 'boundary';
      } else if (state.ropePosition >= state.boundary) {
        state.status = 'finished';
        state.winner = 1;
        state.winReason = 'boundary';
      }
    } else {
      team.wrongCount += 1;
      team.streak = 0;
      team.lastFeedback = { ok: false, combo: false, answer: team.currentQuestion.answer };
      state.eventLog.push({
        t: state.cfg.durationSeconds - state.timeLeft,
        teamId,
        correct: false,
        ropeAfter: state.ropePosition,
      });
    }

    if (state.status === 'playing') {
      if (state.cfg.mode === 'turnbased') {
        state.turn = teamId === 0 ? 1 : 0;
      }
      nextQuestionFor(state, teamId);
    }

    return {
      accepted: true,
      correct: isCorrect,
      teamId,
      score: team.score,
      streak: team.streak,
      ropePosition: state.ropePosition,
      finished: state.status === 'finished',
      winner: state.winner,
      correctAnswer: team.lastFeedback.answer,
    };
  }

  function finishByTimer(state) {
    if (!state || state.status === 'finished') return state;
    state.status = 'finished';
    state.timeLeft = 0;
    state.winReason = 'timer';
    if (state.ropePosition < 0) state.winner = 0;
    else if (state.ropePosition > 0) state.winner = 1;
    else state.winner = 'draw';
    return state;
  }

  function forceEndMatch(state) {
    if (!state || state.status === 'finished') return state;
    state.status = 'finished';
    state.winReason = 'ended';
    if (state.ropePosition < 0) state.winner = 0;
    else if (state.ropePosition > 0) state.winner = 1;
    else state.winner = 'draw';
    return state;
  }

  return {
    toNp,
    createRng,
    TOPICS_BY_GRADE,
    generateQuestion,
    createMatch,
    submitAnswer,
    finishByTimer,
    forceEndMatch,
  };
});
