/**
 * Question builders for the Class 1–4 Mathematics activities.
 * Every builder returns a ready question for the Activity system (auto-graded types only) with the right answer computed from the numbers shown.
 */
export type QType = 'MCQ' | 'TRUE_FALSE' | 'MATCHING' | 'DRAG_DROP' | 'FILL_BLANKS' | 'NUMERICAL' | 'ORDERING';
export interface Q { type: QType; prompt: string; promptNepali?: string; hint?: string; explanation: string; data: Record<string, any> }
export type Gen = () => Q;

export const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = <T,>(a: T[]): T => a[rnd(0, a.length - 1)];
export const shuffle = <T,>(a: T[]): T[] => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = rnd(0, i); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const NPD = '०१२३४५६७८९';
export const np = (n: number | string) => String(n).replace(/\d/g, (d) => NPD[Number(d)]);
const S = (n: number) => String(n);

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export const words = (n: number): string => (n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '') : n === 100 ? 'one hundred' : ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + words(n % 100) : ''));
export const ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
export const ORD_NP = ['', 'पहिलो', 'दोस्रो', 'तेस्रो', 'चौथो', 'पाँचौँ', 'छैटौँ', 'सातौँ', 'आठौँ', 'नवौँ', 'दसौँ'];
const EMOJI = ['🍎', '⭐', '🐟', '🌸', '🐦', '🎈', '🍌', '🐞'];
const EMOJI_NAME: Record<string, [string, string]> = { '🍎': ['apples', 'स्याउ'], '⭐': ['stars', 'तारा'], '🐟': ['fish', 'माछा'], '🌸': ['flowers', 'फूल'], '🐦': ['birds', 'चरा'], '🎈': ['balloons', 'बेलुन'], '🍌': ['bananas', 'केरा'], '🐞': ['ladybirds', 'लेडीबर्ड'] };

/* ───── basic builders ───── */
const uniq = (a: string[]) => Array.from(new Set(a));
export const mcq = (prompt: string, pn: string | undefined, ans: string, wrong: string[], explanation = '', hint?: string): Q => {
  const ws = uniq(wrong).filter((w) => w !== ans).slice(0, 3); let k = 1; while (ws.length < 2) ws.push(ans + '!'.repeat(k++));
  const all = shuffle([ans, ...ws]);
  return { type: 'MCQ', prompt, promptNepali: pn, hint, explanation, data: { options: all.map((t, i) => ({ id: 'o' + (i + 1), text: t, isCorrect: t === ans })) } };
};
export const tf = (st: string, sn: string | undefined, truth: boolean, explanation = ''): Q => ({
  type: 'TRUE_FALSE', prompt: st, promptNepali: sn, explanation, data: { options: [{ id: 't', text: 'True (सही)', isCorrect: truth }, { id: 'f', text: 'False (गलत)', isCorrect: !truth }] },
});
export const num = (prompt: string, pn: string | undefined, v: number, explanation = '', unit?: string, hint?: string): Q => ({ type: 'NUMERICAL', prompt, promptNepali: pn, hint, explanation, data: { correctValue: v, tolerance: 0, ...(unit ? { unit } : {}) } });
export const fill = (template: string, pn: string | undefined, answers: string[][], explanation = ''): Q => ({
  type: 'FILL_BLANKS', prompt: 'Fill in the blanks', promptNepali: pn, explanation, data: { template, blanks: answers.map((a, i) => ({ id: 'b' + (i + 1), acceptedAnswers: a })) },
});
export const order = (prompt: string, pn: string | undefined, vals: number[], asc: boolean, explanation = ''): Q => {
  const sorted = vals.slice().sort((a, b) => (asc ? a - b : b - a));
  return { type: 'ORDERING', prompt, promptNepali: pn, explanation, data: { items: shuffle(vals).map((v, i) => ({ id: 'i' + (i + 1), text: S(v), correctOrder: sorted.indexOf(v) + 1 })) } };
};
export const match = (prompt: string, pn: string | undefined, pairs: [string, string][], explanation = ''): Q => ({
  type: 'MATCHING', prompt, promptNepali: pn, explanation, data: { pairs: pairs.map(([l, r], i) => ({ id: 'p' + (i + 1), left: l, right: r })) },
});
export const sort = (prompt: string, pn: string | undefined, cats: [string, string][], items: [string, string][], explanation = ''): Q => ({
  type: 'DRAG_DROP', prompt, promptNepali: pn, explanation, data: { categories: cats.map(([id, title]) => ({ id, title })), items: shuffle(items).map(([text, cat], i) => ({ id: 'd' + (i + 1), text, correctCategory: cat })) },
});
const wrongNums = (ans: number, deltas: number[], min = 0) => uniq(deltas.map((d) => ans + d).filter((v) => v >= min && v !== ans).map(S));
const nmcq = (prompt: string, pn: string | undefined, ans: number, deltas: number[], explanation = '', min = 0): Q => mcq(prompt, pn, S(ans), wrongNums(ans, [...deltas, 1, -1, 2, 10], min), explanation);

/* ───── generators ───── */
export const G = {
  count: (max: number): Gen => () => { const n = rnd(1, max), e = pick(EMOJI), nm = EMOJI_NAME[e]; return nmcq(`Count the ${nm[0]}: ${e.repeat(n)}  How many are there?`, `${nm[1]} गन: ${e.repeat(n)}  कति वटा छन्?`, n, [1, -1, 2], `There are ${n}.`, 1); },
  countNum: (max: number): Gen => () => { const n = rnd(1, max), e = pick(EMOJI), nm = EMOJI_NAME[e]; return num(`How many ${nm[0]}? ${e.repeat(n)}`, `कति वटा ${nm[1]} छन्? ${e.repeat(n)}`, n, `Count one by one: ${n}.`); },
  cmpMore: (max: number, lo = 1): Gen => () => { const a = rnd(lo, max), b = rnd(lo, max); if (a === b) return G.cmpMore(max, lo)(); return mcq(`Which number is greater: ${a} or ${b}?`, `कुन सङ्ख्या ठूलो छ: ${np(a)} कि ${np(b)}?`, S(Math.max(a, b)), [S(Math.min(a, b))], `${Math.max(a, b)} is greater.`); },
  cmpLess: (max: number, lo = 1): Gen => () => { const a = rnd(lo, max), b = rnd(lo, max); if (a === b) return G.cmpLess(max, lo)(); return mcq(`Which number is smaller: ${a} or ${b}?`, `कुन सङ्ख्या सानो छ: ${np(a)} कि ${np(b)}?`, S(Math.min(a, b)), [S(Math.max(a, b))], `${Math.min(a, b)} is smaller.`); },
  cmpSign: (max: number, lo = 1): Gen => () => { const a = rnd(lo, max), b = rnd(lo, max); const sg = a > b ? '>' : a < b ? '<' : '='; return mcq(`Put the right sign: ${a} __ ${b}`, `सही चिन्ह राख: ${np(a)} __ ${np(b)}`, sg, ['>', '<', '='], `${a} ${sg} ${b}`); },
  tfCmp: (max: number, lo = 1): Gen => () => { const a = rnd(lo, max), b = rnd(lo, max); const claim = pick(['>', '<']); const truth = claim === '>' ? a > b : a < b; return tf(`${a} ${claim} ${b}`, `${np(a)} ${claim} ${np(b)}`, truth, `${a} and ${b}: ${a > b ? '>' : a < b ? '<' : '='}.`); },
  order: (max: number, n = 4, asc = true, lo = 1): Gen => () => { const s = new Set<number>(); while (s.size < n) s.add(rnd(lo, max)); const v = Array.from(s); return order(`Arrange from ${asc ? 'smallest to biggest' : 'biggest to smallest'}`, `${asc ? 'सानोदेखि ठूलो' : 'ठूलोदेखि सानो'} क्रममा मिलाऊ`, v, asc, `Correct order: ${v.slice().sort((a, b) => (asc ? a - b : b - a)).join(', ')}`); },
  seq: (step: number, max: number, start = 0): Gen => () => { const a = start + rnd(0, Math.floor((max - start) / step) - 5) * step; const hole = rnd(1, 3); const t = [0, 1, 2, 3, 4].map((i) => (i === hole ? '[b1]' : S(a + i * step))).join(', '); return fill(t, undefined, [[S(a + hole * step)]], `The numbers go up by ${step}.`); },
  seqDown: (step: number, max: number): Gen => () => { const a = rnd(5, Math.floor(max / step)) * step; const hole = rnd(1, 3); const t = [0, 1, 2, 3, 4].map((i) => (i === hole ? '[b1]' : S(a - i * step))).join(', '); return fill(t, undefined, [[S(a - hole * step)]], `The numbers go down by ${step}.`); },
  addN: (max: number, lo = 1): Gen => () => { const a = rnd(lo, max - lo), b = rnd(lo, max - a); return num(`${a} + ${b} = ?`, `${np(a)} + ${np(b)} = ?`, a + b, `${a} + ${b} = ${a + b}`); },
  addM: (max: number, lo = 1): Gen => () => { const a = rnd(lo, max - lo), b = rnd(lo, max - a); return nmcq(`${a} + ${b} = ?`, `${np(a)} + ${np(b)} = ?`, a + b, [1, -1, 10, -10], `${a} + ${b} = ${a + b}`); },
  subN: (max: number, lo = 1): Gen => () => { const a = rnd(lo + 1, max), b = rnd(lo, a - 0); return num(`${a} − ${b} = ?`, `${np(a)} − ${np(b)} = ?`, a - b, `${a} − ${b} = ${a - b}`); },
  subM: (max: number, lo = 1): Gen => () => { const a = rnd(lo + 1, max), b = rnd(lo, a); return nmcq(`${a} − ${b} = ?`, `${np(a)} − ${np(b)} = ?`, a - b, [1, -1, 10, -10], `${a} − ${b} = ${a - b}`); },
  addMissing: (max: number): Gen => () => { const a = rnd(1, max - 1), b = rnd(1, max - a); return num(`${a} + __ = ${a + b}`, `${np(a)} + __ = ${np(a + b)}`, b, `${a + b} − ${a} = ${b}`); },
  subMissing: (max: number): Gen => () => { const a = rnd(2, max), b = rnd(1, a - 1); return num(`${a} − __ = ${a - b}`, `${np(a)} − __ = ${np(a - b)}`, b, `${a} − ${a - b} = ${b}`); },
  addWord: (max: number): Gen => () => { const a = rnd(1, max - 1), b = rnd(1, max - a); const n = pick([['Sita', 'सीता', 'mangoes', 'आँप'], ['Ram', 'राम', 'pencils', 'पेन्सिल'], ['Maya', 'माया', 'flowers', 'फूल']]); return num(`${n[0]} has ${a} ${n[2]}. She gets ${b} more. How many ${n[2]} now?`, `${n[1]}सँग ${np(a)} वटा ${n[3]} छन्। उसले ${np(b)} वटा थप पाई। अब कति वटा भए?`, a + b, `${a} + ${b} = ${a + b}`); },
  subWord: (max: number): Gen => () => { const a = rnd(3, max), b = rnd(1, a - 1); const n = pick([['Hari', 'हरि', 'marbles', 'गोली'], ['Gita', 'गीता', 'sweets', 'मिठाई'], ['Binod', 'विनोद', 'books', 'किताब']]); return num(`${n[0]} had ${a} ${n[2]} and gave away ${b}. How many are left?`, `${n[1]}सँग ${np(a)} वटा ${n[3]} थिए, ${np(b)} वटा दियो। कति बाँकी रहे?`, a - b, `${a} − ${b} = ${a - b}`); },
  add2: (carry: boolean, max = 99): Gen => () => { let a = 0, b = 0; do { a = rnd(10, max - 10); b = rnd(10, max - a); } while (carry ? (a % 10) + (b % 10) < 10 : (a % 10) + (b % 10) >= 10); return num(`${a} + ${b} = ?`, `${np(a)} + ${np(b)} = ?`, a + b, `${a} + ${b} = ${a + b}`); },
  sub2: (borrow: boolean): Gen => () => { let a = 0, b = 0; do { a = rnd(20, 99); b = rnd(10, a - 1); } while (borrow ? (a % 10) >= (b % 10) : (a % 10) < (b % 10)); return num(`${a} − ${b} = ?`, `${np(a)} − ${np(b)} = ?`, a - b, `${a} − ${b} = ${a - b}`); },
  addBig: (digits: number, carry = true): Gen => () => { const lo = Math.pow(10, digits - 1), hi = Math.pow(10, digits) - 1; const a = rnd(lo, Math.floor(hi * 0.6)), b = rnd(lo, hi - a > lo ? hi - a : lo); return num(`${a.toLocaleString('en-US')} + ${b.toLocaleString('en-US')} = ?`, `${np(a)} + ${np(b)} = ?`, a + b, `${a} + ${b} = ${a + b}`); },
  subBig: (digits: number): Gen => () => { const lo = Math.pow(10, digits - 1), hi = Math.pow(10, digits) - 1; const a = rnd(lo * 2 > hi ? lo : lo * 2, hi), b = rnd(lo, a - 1); return num(`${a.toLocaleString('en-US')} − ${b.toLocaleString('en-US')} = ?`, `${np(a)} − ${np(b)} = ?`, a - b, `${a} − ${b} = ${a - b}`); },
  tensOnes: (max: number, min = 11): Gen => () => { const n = rnd(min, max); return fill(`${n} = [b1] tens and [b2] ones`, `${np(n)} = [b1] दशक र [b2] एकाइ`, [[S(Math.floor(n / 10))], [S(n % 10)]], `${n} = ${Math.floor(n / 10)} tens + ${n % 10} ones`); },
  oddEvenMcq: (max: number): Gen => () => { const n = rnd(1, max); return mcq(`Is ${n} odd or even?`, `${np(n)} जोर हो कि बिजोर?`, n % 2 ? 'Odd (बिजोर)' : 'Even (जोर)', [n % 2 ? 'Even (जोर)' : 'Odd (बिजोर)'], n % 2 ? `${n} cannot be shared into two equal groups.` : `${n} can be paired with nothing left.`); },
  oddEvenSort: (max: number): Gen => () => { const s = new Set<number>(); while (s.size < 6) s.add(rnd(1, max)); const v = Array.from(s); if (!v.some((x) => x % 2) || !v.some((x) => x % 2 === 0)) return G.oddEvenSort(max)(); return sort('Put each number in the right group', 'सङ्ख्यालाई सही समूहमा राख', [['even', 'Even (जोर)'], ['odd', 'Odd (बिजोर)']], v.map((x) => [S(x), x % 2 ? 'odd' : 'even'] as [string, string]), 'Even numbers end in 0, 2, 4, 6, 8.'); },
  numWord: (max = 20): Gen => () => { const s = new Set<number>(); while (s.size < 4) s.add(rnd(1, max)); return match('Match each number with its name', 'सङ्ख्यालाई नामसँग जोड', Array.from(s).map((n) => [S(n), words(n)] as [string, string]), 'Read the number name carefully.'); },
  numWordMcq: (max = 20): Gen => () => { const n = rnd(1, max); return mcq(`Which number is "${words(n)}"?`, undefined, S(n), [S(n + 1), S(Math.max(1, n - 1)), S(n + 10 <= max ? n + 10 : n + 2)], `${words(n)} = ${n}`); },
  ordMcq: (): Gen => () => { const n = rnd(1, 10); return mcq(`What is the ordinal for ${n}?`, `${np(n)} को क्रमसूचक के हो?`, ORD[n], [ORD[Math.min(10, n + 1)], ORD[Math.max(1, n - 1)], ORD[Math.min(10, n + 2)]], `${n} = ${ORD[n]}`); },
  ordMatch: (): Gen => () => { const s = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 4); return match('Match the number with its ordinal', 'सङ्ख्यालाई क्रमसूचकसँग जोड', s.map((n) => [S(n), ORD[n]] as [string, string]), ''); },
  devMatch: (max = 20): Gen => () => { const s = new Set<number>(); while (s.size < 4) s.add(rnd(1, max)); return match('Match 1, 2, 3 with Devanagari numerals', 'अङ्कलाई देवनागरी अङ्कसँग जोड', Array.from(s).map((n) => [S(n), np(n)] as [string, string]), ''); },
  devMcq: (max = 100): Gen => () => { const n = rnd(1, max); return mcq(`Which is ${n} in Devanagari numerals?`, undefined, np(n), [np(n + 1), np(Math.max(1, n - 1)), np(n + 10)], `${n} = ${np(n)}`); },
  devToArabic: (max = 100): Gen => () => { const n = rnd(1, max); return mcq(`${np(n)} is the same as which number?`, `${np(n)} कुन सङ्ख्या हो?`, S(n), [S(n + 1), S(Math.max(1, n - 1)), S(n + 10)], `${np(n)} = ${n}`); },
  placeVal: (digits: number): Gen => () => { const lo = Math.pow(10, digits - 1); const n = rnd(lo, lo * 10 - 1); const pos = rnd(0, digits - 1); const str = S(n); const d = Number(str[pos]) || 1; const ds = str.split(''); ds[pos] = S(d); const nn = Number(ds.join('')); const val = d * Math.pow(10, digits - 1 - pos); return mcq(`In ${nn.toLocaleString('en-US')}, what is the place value of the digit ${d} (the one in the ${['ten-thousands', 'thousands', 'hundreds', 'tens', 'ones'][5 - digits + pos]} place)?`, undefined, val.toLocaleString('en-US'), [(val * 10).toLocaleString('en-US'), (val / 10 >= 1 ? val / 10 : val * 100).toLocaleString('en-US'), S(d)], `${d} × ${Math.pow(10, digits - 1 - pos)} = ${val}`); },
  expand: (digits: number): Gen => () => { const lo = Math.pow(10, digits - 1); const n = rnd(lo, lo * 10 - 1); const s = S(n).split('').map(Number); const parts = s.map((d, i) => d * Math.pow(10, digits - 1 - i)); const t = parts.map((_, i) => `[b${i + 1}]`).join(' + '); return fill(`${n} = ${t}`, undefined, parts.map((p) => [S(p)]), 'Write each digit with its place value.'); },
  mulN: (maxA: number, maxB: number, minA = 2): Gen => () => { const a = rnd(minA, maxA), b = rnd(2, maxB); return num(`${a} × ${b} = ?`, `${np(a)} × ${np(b)} = ?`, a * b, `${a} × ${b} = ${a * b}`); },
  mulM: (maxA: number, maxB: number): Gen => () => { const a = rnd(2, maxA), b = rnd(2, maxB); return nmcq(`${a} × ${b} = ?`, `${np(a)} × ${np(b)} = ?`, a * b, [a, -a, b, 10, -10], `${a} × ${b} = ${a * b}`); },
  mulMissing: (maxA: number): Gen => () => { const a = rnd(2, maxA), b = rnd(2, 10); return num(`${a} × __ = ${a * b}`, `${np(a)} × __ = ${np(a * b)}`, b, `${a * b} ÷ ${a} = ${b}`); },
  mulWord: (): Gen => () => { const a = rnd(2, 9), b = rnd(2, 9); return num(`There are ${a} baskets with ${b} mangoes in each. How many mangoes in all?`, `${np(a)} वटा डालोमा ${np(b)} वटा आँप छन्। जम्मा कति आँप?`, a * b, `${a} × ${b} = ${a * b}`); },
  mulBig: (aMax: number, bMax: number): Gen => () => { const a = rnd(11, aMax), b = rnd(2, bMax); return num(`${a} × ${b} = ?`, `${np(a)} × ${np(b)} = ?`, a * b, `${a} × ${b} = ${a * b}`); },
  divN: (maxQ: number, maxD: number): Gen => () => { const d = rnd(2, maxD), q = rnd(2, maxQ); return num(`${d * q} ÷ ${d} = ?`, `${np(d * q)} ÷ ${np(d)} = ?`, q, `${d} × ${q} = ${d * q}`); },
  divM: (maxQ: number, maxD: number): Gen => () => { const d = rnd(2, maxD), q = rnd(2, maxQ); return nmcq(`${d * q} ÷ ${d} = ?`, `${np(d * q)} ÷ ${np(d)} = ?`, q, [1, -1, 2], `${d} × ${q} = ${d * q}`, 1); },
  divRem: (kind: 'q' | 'r'): Gen => () => { const d = rnd(2, 9), q = rnd(3, 30), r = rnd(1, d - 1); const n = d * q + r; return kind === 'q' ? num(`${n} ÷ ${d}: what is the quotient?`, `${np(n)} ÷ ${np(d)} को भागफल कति?`, q, `${d} × ${q} + ${r} = ${n}`) : num(`${n} ÷ ${d}: what is the remainder?`, `${np(n)} ÷ ${np(d)} को भागशेष कति?`, r, `${d} × ${q} + ${r} = ${n}`); },
  divWord: (): Gen => () => { const d = rnd(2, 6), q = rnd(2, 9); return num(`${d * q} sweets are shared equally among ${d} children. How many does each child get?`, `${np(d * q)} वटा मिठाई ${np(d)} जना बच्चामा बराबर बाँडियो। एकले कति पाउँछ?`, q, `${d * q} ÷ ${d} = ${q}`); },
  fracMcq: (maxD = 8): Gen => () => { const d = rnd(2, maxD), n = rnd(1, d - 1); return mcq(`A cake is cut into ${d} equal parts and ${n} parts are eaten. What fraction is eaten?`, `केकलाई ${np(d)} बराबर भागमा काटियो र ${np(n)} भाग खाइयो। कति भिन्न खाइयो?`, `${n}/${d}`, [`${d - n}/${d}`, `${n}/${d + 1}`, `${n + 1}/${d}`], `${n} out of ${d} equal parts = ${n}/${d}`); },
  fracOfSet: (): Gen => () => { const d = pick([2, 3, 4, 5]), n = rnd(1, d - 1), k = rnd(2, 5); const tot = d * k; return num(`${n}/${d} of ${tot} = ?`, `${np(tot)} को ${np(n)}/${np(d)} = ?`, n * k, `${tot} ÷ ${d} = ${k}, then ${k} × ${n} = ${n * k}`); },
  equivFrac: (): Gen => () => { const d = rnd(2, 6), n = rnd(1, d - 1), k = rnd(2, 4); return num(`${n}/${d} = ?/${d * k}`, `${np(n)}/${np(d)} = ?/${np(d * k)}`, n * k, `Multiply top and bottom by ${k}.`); },
  cmpFrac: (): Gen => () => { const d = rnd(3, 9), a = rnd(1, d - 1); let b = rnd(1, d - 1); if (b === a) b = a === 1 ? 2 : a - 1; return mcq(`Which fraction is greater: ${a}/${d} or ${b}/${d}?`, undefined, `${Math.max(a, b)}/${d}`, [`${Math.min(a, b)}/${d}`], 'With the same bottom number, the bigger top number is bigger.'); },
  addFrac: (): Gen => () => { const d = rnd(4, 10), a = rnd(1, d - 2), b = rnd(1, d - a - 1); return mcq(`${a}/${d} + ${b}/${d} = ?`, undefined, `${a + b}/${d}`, [`${a + b}/${2 * d}`, `${a + b + 1}/${d}`, `${Math.abs(a - b)}/${d}`], 'Add the tops; the bottom stays the same.'); },
  decimal: (): Gen => () => { const n = rnd(1, 99); return mcq(`${n}/100 as a decimal is:`, `${np(n)}/१०० दशमलवमा:`, (n / 100).toFixed(2).replace(/0$/, ''), [(n / 10).toFixed(1), (n / 1000).toFixed(3), S(n)], `${n}/100 = ${n / 100}`); },
  percent: (): Gen => () => { const n = rnd(1, 19) * 5; return num(`${n}/100 = ?%`, `${np(n)}/१०० = ?%`, n, `${n} out of 100 = ${n}%`); },
  percentOf: (): Gen => () => { const p = pick([10, 20, 25, 50]), t = pick([40, 60, 80, 100, 200]); return num(`${p}% of ${t} = ?`, `${np(t)} को ${np(p)}% = ?`, (p * t) / 100, `${p}/100 × ${t} = ${(p * t) / 100}`); },
  decTenth: (): Gen => () => { const n = rnd(1, 9); return num(`0.${n} = ?/10`, `०.${np(n)} = ?/१०`, n, `0.${n} means ${n} tenths.`); },
  timeRead: (halfOnly = false, quarter = false): Gen => () => { const h = rnd(1, 12); const choices = halfOnly ? [0, 30] : quarter ? [0, 15, 30, 45] : [0, 30]; const m = pick(choices); const txt = m === 0 ? `${h} o'clock` : m === 30 ? `half past ${h}` : m === 15 ? `quarter past ${h}` : `quarter to ${(h % 12) + 1}`; const ans = `${h}:${m === 0 ? '00' : m}`; const wr = [`${h % 12 + 1}:${m === 0 ? '00' : m}`, `${h}:${m === 30 ? '00' : '30'}`, `${(h + 10) % 12 + 1}:${m === 0 ? '00' : m}`]; return mcq(`The clock shows ${txt}. Which time is it?`, undefined, ans, wr, `${txt} = ${ans}`); },
  timeUnits: (): Gen => () => { const k = rnd(1, 6); return pick<Gen>([() => num(`${k} hours = ? minutes`, `${np(k)} घण्टा = कति मिनेट?`, k * 60, '1 hour = 60 minutes'), () => num(`${k} minutes = ? seconds`, `${np(k)} मिनेट = कति सेकेन्ड?`, k * 60, '1 minute = 60 seconds'), () => num(`${k * 60} minutes = ? hours`, `${np(k * 60)} मिनेट = कति घण्टा?`, k, '60 minutes = 1 hour')])(); },
  time24: (): Gen => () => { const h = rnd(13, 23), m = pick([0, 15, 30, 45]); const mm = m === 0 ? '00' : S(m); return mcq(`${h}:${mm} in 12-hour time is:`, undefined, `${h - 12}:${mm} PM`, [`${h - 12}:${mm} AM`, `${h - 11}:${mm} PM`, `${h}:${mm} PM`], `After 12 noon subtract 12: ${h} − 12 = ${h - 12}.`); },
  time12to24: (): Gen => () => { const h = rnd(1, 11), m = pick([0, 15, 30, 45]); const mm = m === 0 ? '00' : S(m); return mcq(`${h}:${mm} PM in 24-hour time is:`, undefined, `${h + 12}:${mm}`, [`${h}:${mm}`, `${h + 11}:${mm}`, `${h + 13}:${mm}`], `Add 12 for PM: ${h} + 12 = ${h + 12}.`); },
  duration: (): Gen => () => { const sh = rnd(6, 12), mins = pick([30, 45, 60, 90, 120, 150]); const eh = sh + Math.floor(mins / 60), em = mins % 60; const f = (h: number, m: number) => `${h}:${m === 0 ? '00' : m}`; return num(`School starts at ${f(sh, 0)} and ends at ${f(eh, em)}. How many minutes is that?`, undefined, mins, `${eh}:${em} − ${sh}:00 = ${mins} minutes`); },
  moneyAdd: (max = 100): Gen => () => { const a = rnd(5, max), b = rnd(5, max); return num(`Rs ${a} + Rs ${b} = Rs ?`, `रु ${np(a)} + रु ${np(b)} = रु ?`, a + b, `${a} + ${b} = ${a + b}`); },
  moneyChange: (): Gen => () => { const p = rnd(3, 19) * 5, pay = pick([100, 200, 500].filter((x) => x > p)); return num(`A pen costs Rs ${p}. You pay Rs ${pay}. How much change do you get?`, `कलम रु ${np(p)} पर्छ। तपाईंले रु ${np(pay)} दिनुभयो। फिर्ता कति आउँछ?`, pay - p, `${pay} − ${p} = ${pay - p}`); },
  coinsTotal: (): Gen => () => { const c: number[] = [rnd(0, 3), rnd(0, 3), rnd(0, 3)]; if (!c.some((x) => x > 0)) c[0] = 2; const tot = c[0] * 1 + c[1] * 2 + c[2] * 5; return num(`${c[0]} coins of Rs 1, ${c[1]} coins of Rs 2 and ${c[2]} coins of Rs 5. Total Rs?`, undefined, tot, `${c[0]}×1 + ${c[1]}×2 + ${c[2]}×5 = ${tot}`); },
  notesTotal: (): Gen => () => { const c = [rnd(0, 3), rnd(0, 3), rnd(1, 3)]; const tot = c[0] * 5 + c[1] * 10 + c[2] * 20; return num(`${c[0]} notes of Rs 5, ${c[1]} notes of Rs 10 and ${c[2]} notes of Rs 20. Total Rs?`, undefined, tot, `${c[0]}×5 + ${c[1]}×10 + ${c[2]}×20 = ${tot}`); },
  fewestNotes: (): Gen => () => { const a = pick([120, 170, 250, 275, 320, 470, 635, 880]); const d = [1000, 500, 100, 50, 20, 10, 5, 2, 1]; let r = a, n = 0; d.forEach((x) => { n += Math.floor(r / x); r %= x; }); return num(`What is the fewest number of notes and coins needed for Rs ${a}? (notes and coins of 1000, 500, 100, 50, 20, 10, 5, 2, 1)`, undefined, n, 'Use the biggest note first.'); },
  paisa: (): Gen => () => { const r = rnd(2, 9); return num(`Rs ${r} = ? paisa`, `रु ${np(r)} = कति पैसा?`, r * 100, 'Rs 1 = 100 paisa'); },
  bill: (): Gen => () => { const q1 = rnd(2, 5), p1 = pick([10, 20, 30, 40]), q2 = rnd(1, 4), p2 = pick([15, 25, 50, 60]); return num(`${q1} copies at Rs ${p1} each and ${q2} pens at Rs ${p2} each. What is the total bill?`, `${np(q1)} वटा कापी रु ${np(p1)} का दरले र ${np(q2)} वटा कलम रु ${np(p2)} का दरले। जम्मा बिल कति?`, q1 * p1 + q2 * p2, `${q1}×${p1} + ${q2}×${p2} = ${q1 * p1 + q2 * p2}`); },
  budget: (): Gen => () => { const inc = rnd(2, 6) * 10000, a = rnd(2, 5) * 1000, b = rnd(1, 4) * 1000, c = rnd(1, 3) * 1000; return num(`Income Rs ${inc}. Spending: food Rs ${a}, school Rs ${b}, travel Rs ${c}. How much is saved?`, undefined, inc - a - b - c, `${inc} − (${a} + ${b} + ${c}) = ${inc - a - b - c}`); },
  units: (big: string, small: string, f: number, maxBig = 9, bigNp = big, smallNp = small): Gen => () => { const k = rnd(2, maxBig); return Math.random() < 0.5 ? num(`${k} ${big} = ? ${small}`, `${np(k)} ${bigNp} = कति ${smallNp}?`, k * f, `1 ${big} = ${f} ${small}`) : num(`${k * f} ${small} = ? ${big}`, `${np(k * f)} ${smallNp} = कति ${bigNp}?`, k, `${f} ${small} = 1 ${big}`); },
  unitsMixed: (big: string, small: string, f: number): Gen => () => { const k = rnd(1, 9), e = rnd(1, f / 10 - 1) * 10; return num(`${k} ${big} ${e} ${small} = ? ${small}`, undefined, k * f + e, `${k} × ${f} + ${e} = ${k * f + e}`); },
  area: (): Gen => () => { const l = rnd(3, 12), w = rnd(2, 9); return num(`The length of a rectangle is ${l} cm and the width is ${w} cm. Find its area (cm²).`, `आयतको लम्बाइ ${np(l)} सेमी र चौडाइ ${np(w)} सेमी छ। क्षेत्रफल (सेमी²) कति?`, l * w, `${l} × ${w} = ${l * w}`, 'cm²'); },
  perimeter: (): Gen => () => { const l = rnd(3, 15), w = rnd(2, 9); return num(`A rectangle is ${l} cm long and ${w} cm wide. What is its perimeter (cm)?`, `आयत ${np(l)} सेमी लामो र ${np(w)} सेमी चौडा छ। परिमिति (सेमी) कति?`, 2 * (l + w), `2 × (${l} + ${w}) = ${2 * (l + w)}`, 'cm'); },
  squareP: (): Gen => () => { const s = rnd(2, 15); return num(`The side of a square is ${s} cm. What is its perimeter (cm)?`, `वर्गको भुजा ${np(s)} सेमी छ। परिमिति (सेमी) कति?`, 4 * s, `4 × ${s} = ${4 * s}`, 'cm'); },
  squareA: (): Gen => () => { const s = rnd(2, 12); return num(`The side of a square is ${s} cm. What is its area (cm²)?`, `वर्गको भुजा ${np(s)} सेमी छ। क्षेत्रफल कति?`, s * s, `${s} × ${s} = ${s * s}`, 'cm²'); },
  missingSide: (): Gen => () => { const l = rnd(4, 14), w = rnd(2, 9); return num(`A rectangle has perimeter ${2 * (l + w)} cm and length ${l} cm. What is its width (cm)?`, undefined, w, `${2 * (l + w)} ÷ 2 − ${l} = ${w}`, 'cm'); },
  tileArea: (): Gen => () => { const r = rnd(2, 6), c = rnd(2, 7); return num(`A rectangle is covered by ${r} rows of ${c} square tiles. How many tiles cover it?`, `आयतलाई ${np(r)} पङ्क्तिमा ${np(c)} वटा वर्ग टाइलले छोपियो। जम्मा कति टाइल?`, r * c, `${r} × ${c} = ${r * c}`); },
  angleKind: (): Gen => () => { const a = pick([20, 30, 45, 60, 80, 90, 100, 120, 135, 150, 180]); const k = a === 180 ? 'Straight angle' : a === 90 ? 'Right angle' : a < 90 ? 'Acute angle' : 'Obtuse angle'; return mcq(`An angle measures ${a}°. What kind of angle is it?`, `${np(a)}° को कोण कस्तो हो?`, k, ['Acute angle', 'Right angle', 'Obtuse angle', 'Straight angle'], `${a}° is a ${k.toLowerCase()}.`); },
  straightAngle: (): Gen => () => { const a = rnd(2, 17) * 10; return num(`Two angles lie on a straight line. One is ${a}°. What is the other (°)?`, undefined, 180 - a, `180 − ${a} = ${180 - a}`, '°'); },
  graphTotal: (): Gen => () => { const v = [rnd(2, 9), rnd(2, 9), rnd(2, 9), rnd(2, 9)]; return num(`Votes: Cricket ${v[0]}, Football ${v[1]}, Volleyball ${v[2]}, Kho-kho ${v[3]}. How many votes in all?`, undefined, v.reduce((s, x) => s + x, 0), 'Add all the bars.'); },
  graphMost: (): Gen => () => { const names = ['Cricket', 'Football', 'Volleyball', 'Kho-kho']; const v = shuffle([3, 5, 7, 9, 4, 6]).slice(0, 4); const mx = v.indexOf(Math.max(...v)); return mcq(`Votes: ${names.map((n, i) => `${n} ${v[i]}`).join(', ')}. Which game got the most votes?`, undefined, names[mx], names.filter((_, i) => i !== mx), 'The tallest bar is the most.'); },
  graphDiff: (): Gen => () => { const a = rnd(5, 12), b = rnd(1, a - 1); return num(`In a bar graph Cricket has ${a} votes and Football has ${b}. How many more votes does Cricket have?`, undefined, a - b, `${a} − ${b} = ${a - b}`); },
  graphScale: (): Gen => () => { const s = pick([2, 5, 10]), n = rnd(2, 9); return num(`In a graph one block stands for ${s}. A bar has ${n} blocks. What value does it show?`, `एउटा खण्डले ${np(s)} जनाउँछ। स्तम्भमा ${np(n)} खण्ड छन्। मान कति?`, s * n, `${n} × ${s} = ${n * s}`); },
  pictoRead: (): Gen => () => { const s = pick([2, 5, 10]), n = rnd(2, 8); return num(`In a picture graph 1 picture = ${s}. A row has ${n} pictures. How many does it show?`, `चित्रचार्टमा १ चित्र = ${np(s)}। एक पङ्क्तिमा ${np(n)} चित्र छन्। कति जनाउँछ?`, s * n, `${n} × ${s} = ${n * s}`); },
  pictoHalf: (): Gen => () => { const s = pick([2, 4, 10]), n = rnd(1, 6); return num(`1 picture = ${s}. A row has ${n} full pictures and one half picture. What is the total?`, undefined, s * n + s / 2, `${n} × ${s} + ${s / 2} = ${s * n + s / 2}`); },
  solveAdd: (): Gen => () => { const a = rnd(2, 15), x = rnd(2, 20); return num(`x + ${a} = ${x + a}. Find x.`, `x + ${np(a)} = ${np(x + a)}। x पत्ता लगाऊ।`, x, `x = ${x + a} − ${a} = ${x}`); },
  solveSub: (): Gen => () => { const a = rnd(2, 15), x = rnd(a + 1, 30); return num(`x − ${a} = ${x - a}. Find x.`, undefined, x, `x = ${x - a} + ${a} = ${x}`); },
  solveMul: (): Gen => () => { const a = rnd(2, 9), x = rnd(2, 12); return num(`${a}x = ${a * x}. Find x.`, `${np(a)}x = ${np(a * x)}। x पत्ता लगाऊ।`, x, `x = ${a * x} ÷ ${a} = ${x}`); },
  evalExpr: (): Gen => () => { const a = rnd(2, 6), c = rnd(1, 9), x = rnd(2, 9); return num(`If x = ${x}, find the value of ${a}x + ${c}.`, `x = ${np(x)} हुँदा ${np(a)}x + ${np(c)} को मान कति?`, a * x + c, `${a} × ${x} + ${c} = ${a * x + c}`); },
  round: (u: number): Gen => () => { let n = 0; do n = rnd(u + 1, u * 10 - 1); while (n % u === 0); const r = Math.round(n / u) * u; return num(`Round ${n} to the nearest ${u}.`, `${np(n)} लाई नजिकको ${np(u)} मा मिलाऊ।`, r, `${n} is ${n % u >= u / 2 ? 'at or past' : 'before'} the halfway point.`); },
  indian: (): Gen => () => { const n = rnd(100000, 9999999); const ind = (x: number) => { const s = S(x); return s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3); }; return mcq(`How do we write ${n} with commas in the Nepali (lakh) system?`, undefined, ind(n), [n.toLocaleString('en-US'), ind(n).replace(/,/g, ' '), ind(n + 1000)], 'Three digits from the right, then groups of two.'); },
  lakhDigit: (): Gen => () => { const n = rnd(1000000, 9999999); const s = S(n); return mcq(`Which digit is in the lakhs place of ${n}?`, undefined, s[1], [s[0], s[2], s[3]], 'Places from the right: ones, tens, hundreds, thousands, ten-thousands, lakhs.'); },
  hundredBefore: (kind: 'before' | 'after' | 'between', max = 1000): Gen => () => { const n = rnd(11, max - 2); return kind === 'after' ? num(`What number comes just after ${n}?`, `${np(n)} पछिको सङ्ख्या कुन हो?`, n + 1, `${n} + 1 = ${n + 1}`) : kind === 'before' ? num(`What number comes just before ${n}?`, `${np(n)} भन्दा अघिको सङ्ख्या कुन हो?`, n - 1, `${n} − 1 = ${n - 1}`) : num(`What number comes between ${n - 1} and ${n + 1}?`, `${np(n - 1)} र ${np(n + 1)} बीचको सङ्ख्या कुन हो?`, n, `${n - 1}, ${n}, ${n + 1}`); },
  bank: (items: [string, string | undefined, string, string[], string?][]): Gen => () => { const it = pick(items); return mcq(it[0], it[1], it[2], it[3], it[4] || ''); },
  tfBank: (items: [string, string | undefined, boolean, string?][]): Gen => () => { const it = pick(items); return tf(it[0], it[1], it[2], it[3] || ''); },
  matchBank: (sets: [string, string][][], prompt = 'Match the pairs', pn?: string): Gen => () => { const s = pick(sets); return match(prompt, pn, shuffle(s).slice(0, 4), ''); },
  sortBank: (cats: [string, string][], items: [string, string][], prompt: string, pn?: string, n = 6): Gen => () => sort(prompt, pn, cats, shuffle(items).slice(0, n), ''),
};

/** Build the questions for a lesson: cycles through the generators and avoids repeating a prompt. */
export const build = (gens: Gen[], count = 10): Q[] => {
  const out: Q[] = []; const seen = new Set<string>();
  let fails = 0;
  for (let i = 0; out.length < count && i < count * 14; i++) {
    const q = gens[(out.length + fails) % gens.length]();
    const key = q.type + q.prompt + JSON.stringify(q.data.items ? q.data.items.map((x: any) => x.text).sort() : q.data.pairs ? q.data.pairs.map((x: any) => x.left) : q.data.blanks ? q.data.template : '');
    if (seen.has(key)) { fails++; continue; } seen.add(key); out.push(q);
  }
  return out;
};
