/**
 * Shared words and numbers for the Class 1 Mathematics simulations (English + Nepali).
 */
export const NP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
export const toNp = (n: number | string) => String(n).replace(/\d/g, (d) => NP_DIGITS[Number(d)]);

const EN_SMALL = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export const enName = (n: number): string => {
  if (n < 20) return EN_SMALL[n];
  if (n === 100) return 'one hundred';
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o ? `${EN_TENS[t]}-${EN_SMALL[o]}` : EN_TENS[t];
};

export const NP_SMALL = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ', 'दश', 'एघार', 'बाह्र', 'तेह्र', 'चौध', 'पन्ध्र', 'सोह्र', 'सत्र', 'अठार', 'उन्नाइस', 'बीस'];
export const NP_TENS: Record<number, string> = { 20: 'बीस', 30: 'तीस', 40: 'चालीस', 50: 'पचास', 60: 'साठी', 70: 'सत्तरी', 80: 'असी', 90: 'नब्बे', 100: 'सय' };
/** Nepali name for 0–20 and the round tens; everything else is read out digit by digit in Devanagari. */
export const npName = (n: number): string => (n <= 20 ? NP_SMALL[n] : NP_TENS[n] || toNp(n));

export const ORD_EN = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
export const ORD_NP = ['', 'पहिलो', 'दोस्रो', 'तेस्रो', 'चौथो', 'पाँचौँ', 'छैटौँ', 'सातौँ', 'आठौँ', 'नवौँ', 'दसौँ'];
export const ORD_SHORT = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

export const DAYS = [
  { en: 'Sunday', np: 'आइतबार', color: '#ef4444' },
  { en: 'Monday', np: 'सोमबार', color: '#f97316' },
  { en: 'Tuesday', np: 'मङ्गलबार', color: '#eab308' },
  { en: 'Wednesday', np: 'बुधबार', color: '#22c55e' },
  { en: 'Thursday', np: 'बिहीबार', color: '#0ea5e9' },
  { en: 'Friday', np: 'शुक्रबार', color: '#8b5cf6' },
  { en: 'Saturday', np: 'शनिबार', color: '#ec4899' },
];

export const FONT_NP = '"Noto Sans Devanagari","Nirmala UI","Mangal","Segoe UI",sans-serif';

export const shuffle = <T,>(arr: T[], seed?: number): T[] => {
  const a = arr.slice();
  let s = seed ?? Math.floor(Math.random() * 1e9);
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
