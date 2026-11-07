/**
 * Legacy "Preeti" font → Unicode Devanagari.
 * Many CDC PDFs are set in Preeti: their embedded text is Latin letters that only look like Nepali
 * in the original font. This converts that text locally (no API calls), then fixes the two
 * position-dependent rules: the short-i matra (ि) is typed before its consonant, and the
 * repha (र्) is typed after its cluster.
 */
const MAP: Record<string, string> = {
  a: 'ब', b: 'द', c: 'अ', d: 'म', e: 'भ', f: 'ा', g: 'न', h: 'ज', i: 'ष्', j: 'व', k: 'प', l: 'ि', m: 'फ', n: 'ल', o: 'य', p: 'उ', q: 'त्र', r: 'च', s: 'क', t: 'त', u: 'ग', v: 'ख', w: 'ध', x: 'ह', y: 'थ', z: 'श',
  A: 'ब्', B: 'द्य', C: 'ऋ', D: 'म्', E: 'भ्', F: 'ँ', G: 'न्', H: 'ज्', I: 'क्ष्', J: 'व्', K: 'प्', L: 'ी', M: 'ः', N: 'ल्', O: 'इ', P: 'ए', Q: 'त्त', R: 'च्', S: 'क्', T: 'त्', U: 'ग्', V: 'ख्', W: 'ध्', X: 'ह्', Y: 'थ्', Z: 'श्',
  '0': 'ण्', '1': 'ज्ञ', '2': 'द्द', '3': 'घ', '4': 'द्ध', '5': 'छ', '6': 'ट', '7': 'ठ', '8': 'ड', '9': 'ढ',
  '`': 'ञ', '~': 'ञ्', '!': '१', '@': '२', '#': '३', $: '४', '%': '५', '^': '६', '&': '७', '*': '८', '(': '९', ')': '०',
  '-': '(', _: ')', '+': 'ं', '=': '.', '[': 'ृ', '{': 'र्', '\\': '्', '|': '्र', '}': 'ै', ']': 'े', ';': 'स', ':': 'स्', "'": 'ु', '"': 'ू', ',': ',', '<': '?', '>': 'श्र', '.': '।', '/': 'र', '?': 'रु',
  // extended Latin-1 glyphs used by Preeti for conjuncts
  '¿': 'रु', 'ß': 'द्य', 'Ø': 'द्य', '÷': '/', 'Ë': 'ङ', 'Î': 'ङ्ख', 'Ö': 'ङ्ग', 'Ý': 'ट्ट', 'Ù': 'ट्ट', '§': 'ट्ट', 'ª': 'ङ', '£': 'घ्', '¢': 'द्ध', '•': '.', '¶': 'ठ्ठ', 'Û': 'ट्ठ',
  '‘': 'ॅ', '’': 'ॅ', '“': 'ँ', '”': 'ँ', '…': '…', '¥': 'र्', 'Ê': 'ङ्क', 'Ô': 'ङ्ग', '∗': '*', '×': '×',
};

const CONSONANT = 'क-हक्ष';
const CLUSTER = `(?:[${CONSONANT}]्)*[${CONSONANT}]`;
const IMATRA = new RegExp(`ि(${CLUSTER})`, 'g');
const REPHA = new RegExp(`(${CLUSTER})([ािीुूृेैोौंँः]*)र्(?!\\S?्)`, 'g');

/** A rough test for "this text is Preeti rather than normal English". */
export function looksLikePreeti(text: string): boolean {
  const letters = text.replace(/[^A-Za-z]/g, '');
  if (letters.length < 40) return false;
  const odd = (text.match(/[{}|\[\]\\;`~@#$%^&*]/g) || []).length / Math.max(1, text.length);
  const words = text.split(/\s+/).filter((w) => /^[a-z]{3,}$/i.test(w));
  const english = words.filter((w) => /[aeiou]/i.test(w) && /^(the|and|that|with|this|from|have|are|for|was|not|you|they|will|which|their|what|when|where|how)$/i.test(w)).length;
  return odd > 0.02 || english / Math.max(1, words.length) < 0.03;
}

/** Plain-English phrases (e.g. "(Computer as a means of communication)") share the same Latin letters. */
const englishWord = (w: string) => {
  if (!/^[A-Za-z][a-z]*$/.test(w) && !/^[A-Z]+$/.test(w)) return false;
  if (/^(a|A|I)$/.test(w)) return true;
  const v = (w.match(/[aeiouAEIOU]/g) || []).length / w.length;
  return w.length >= 2 && v >= 0.25 && v <= 0.65 && !/[A-Z].*[a-z].*[A-Z]/.test(w);
};
function protectEnglish(text: string): { text: string; saved: string[] } {
  const saved: string[] = [];
  const keep = (m: string) => {
    saved.push(m);
    return `${saved.length - 1}`;
  };
  // parenthesised English phrases
  let t = text.replace(/\(([A-Za-z][A-Za-z ,'-]{2,120})\)/g, (m, inner: string) => {
    // Preeti types real brackets as '-' and '_', so a literal (...) holding only Latin letters is English text
    const words = inner.split(/[ ,]+/).filter(Boolean);
    return words.length >= 1 && words.every((w) => englishWord(w.replace(/'/g, ''))) ? keep(m) : m;
  });
  // runs of 3+ English words
  t = t.replace(/(?:[A-Za-z]{2,}[ ,]+){2,}[A-Za-z]{2,}/g, (m) => (m.split(/[ ,]+/).every(englishWord) ? keep(m) : m));
  return { text: t, saved };
}

export function preetiToUnicode(input: string): string {
  const { text: src, saved } = protectEnglish(input);
  let out = '';
  for (const ch of src) out += MAP[ch] ?? ch;
  out = out
    .replace(/(ष|क्ष|ण)्ा/g, '$1') // glyphs ष/क्ष/ण are a bar-less half form + the ा bar
    .replace(/इर्/g, 'ई')
    .replace(/अाे/g, 'ओ')
    .replace(/अाै/g, 'औ')
    .replace(/अा/g, 'आ')
    .replace(/ाे/g, 'ो')
    .replace(/ाै/g, 'ौ')
    .replace(/ेे/g, 'े')
    .replace(/््/g, '्')
    .replace(IMATRA, '$1ि')
    .replace(REPHA, 'र्$1$2')
    .replace(/ि्/g, '्ि') // misplaced matra on a halant cluster
    .replace(/ं([ािीुूृेैोौ])/g, '$1ं')
    .replace(/ँ([ािीुूृेैोौ])/g, '$1ँ')
    .replace(/ +/g, ' ')
    .replace(/(\d+)/g, (_m, i) => saved[parseInt(i, 10)]);
  return out;
}
