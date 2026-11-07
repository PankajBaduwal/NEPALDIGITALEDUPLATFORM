import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { RetrievalService } from '../modules/rag/retrieval.service';
import { RagScope } from '../modules/rag/scope.service';

/**
 * Hand-written, differently-phrased questions with expected keywords (no Gemini).
 * A question passes when an expected keyword appears in any of the top 3 retrieved passages.
 */
type Q = { g: number; s?: string; q: string; kw: string[] };
const Qs: Q[] = [
  { g: 5, s: 'ENGLISH', q: 'How do I write a letter to my elder sister?', kw: ['letter', 'dear'] },
  { g: 5, s: 'SCIENCE', q: 'पदार्थका अवस्थाहरू के के हुन्?', kw: ['ठोस', 'तरल', 'ग्यास'] },
  { g: 5, s: 'MATHEMATICS', q: 'How to add fractions with the same denominator', kw: ['fraction', 'denominator', 'numerator'] },
  { g: 5, s: 'SOCIAL_STUDIES', q: 'नेपालको राष्ट्रिय झन्डाको बारेमा बताऊ', kw: ['झन्डा'] },
  { g: 6, s: 'SCIENCE', q: 'फोटोसिन्थेसिस के हो?', kw: ['प्रकाश', 'संश्लेषण', 'हरित'] },
  { g: 6, s: 'MATHEMATICS', q: 'perimeter र क्षेत्रफलको सूत्र', kw: ['परिमिति', 'क्षेत्रफल'] },
  { g: 7, s: 'MATHEMATICS', q: 'How do I solve a simple linear equation?', kw: ['equation', 'समीकरण'] },
  { g: 7, s: 'SCIENCE', q: 'कोषका भागहरू र कार्य', kw: ['कोष'] },
  { g: 8, s: 'SCIENCE', q: 'What is the difference between speed and velocity?', kw: ['speed', 'velocity', 'गति', 'वेग'] },
  { g: 8, s: 'ENGLISH', q: 'Explain the passive voice with examples', kw: ['passive', 'voice'] },
  { g: 8, s: 'SOCIAL_STUDIES', q: 'नेपालको भौगोलिक विविधता', kw: ['हिमाल', 'पहाड', 'तराई'] },
  { g: 9, s: 'SCIENCE', q: 'न्यूटनको गतिसम्बन्धी नियमहरू', kw: ['न्युटन', 'न्यूटन', 'बल'] },
  { g: 9, s: 'COMPUTER_SCIENCE', q: 'What is an operating system and what does it do?', kw: ['operating system'] },
  { g: 9, s: 'ECONOMICS', q: 'माग र आपूर्तिको नियम', kw: ['माग', 'आपूर्ति'] },
  { g: 10, s: 'SCIENCE', q: 'Ohm\'s law and electric resistance', kw: ['ohm', 'ओम', 'प्रतिरोध'] },
  { g: 10, s: 'MATHEMATICS', q: 'Pythagoras theorem right angled triangle', kw: ['पाइथागोरस', 'pythagoras', 'समकोण'] },
  { g: 10, s: 'ENGLISH', q: 'How are conditional sentences formed?', kw: ['conditional', 'if'] },
  { g: 10, s: 'GEOGRAPHY', q: 'नेपालका प्रमुख नदीहरू', kw: ['नदी', 'कोशी', 'कर्णाली'] },
  { g: 10, s: 'HISTORY', q: 'राणा शासनको अन्त्य कसरी भयो?', kw: ['राणा'] },
  { g: 11, s: 'PHYSICS', q: 'State Newton\'s second law of motion and give its formula', kw: ['newton', 'force', 'acceleration'] },
  { g: 11, s: 'CHEMISTRY', q: 'How is the periodic table arranged into groups and periods?', kw: ['periodic', 'group', 'period'] },
  { g: 11, s: 'BIOLOGY', q: 'Describe the structure of a plant cell', kw: ['cell wall', 'chloroplast', 'cell'] },
  { g: 11, s: 'ACCOUNTANCY', q: 'डबल इन्ट्री प्रणाली के हो?', kw: ['डबल', 'दोहोरो', 'डेबिट', 'क्रेडिट'] },
  { g: 12, s: 'PHYSICS', q: 'What is electromagnetic induction?', kw: ['induction', 'faraday', 'emf'] },
  { g: 12, s: 'CHEMISTRY', q: 'Explain chemical equilibrium and Le Chatelier principle', kw: ['equilibrium', 'chatelier'] },
  { g: 12, s: 'BIOLOGY', q: 'What is DNA replication?', kw: ['replication', 'dna'] },
  { g: 4, s: 'SCIENCE', q: 'हाम्रो वरिपरिका जीवजन्तुहरू', kw: ['जीव', 'जन्तु', 'वनस्पति'] },
  { g: 3, s: 'MATHEMATICS', q: 'जोड र घटाउ गर्ने तरिका', kw: ['जोड', 'घटाउ'] },
  { g: 2, s: 'ENGLISH', q: 'Name the colours and animals', kw: ['colour', 'color', 'animal', 'cat', 'dog'] },
  { g: 1, s: 'MATHEMATICS', q: 'एकदेखि दस सम्मको गन्ती', kw: ['१', '२', '३', 'एक', 'दुई'] },
  // wrong-class guard: a Class 5 scope must not return Class 11 physics content
  { g: 5, s: 'SCIENCE', q: 'Schrodinger wave equation and quantum numbers', kw: ['__none__'] },
];

const scopeFor = (g: number, s?: string): RagScope => ({ role: 'TEACHER', grades: [g], subjectKeys: s ? [s] : [], mediums: [], includeStaffResources: false, label: `Class ${g}`, allowedSubjects: [] });

async function main() {
  await connectDB();
  const rows: any[] = [];
  let pass = 0, scored = 0, wrongClass = 0, empty = 0;
  for (const t of Qs) {
    const res = await RetrievalService.retrieve(t.q, scopeFor(t.g, t.s), { topK: 6 });
    wrongClass += res.filter((r) => r.gradeNumber !== t.g).length;
    const top = res.slice(0, 3);
    const hay = top.map((r) => r.text.toLowerCase()).join(' ');
    const guard = t.kw[0] === '__none__';
    const ok = guard ? true : t.kw.some((k) => hay.includes(k.toLowerCase()));
    if (!res.length) empty++;
    if (!guard) { scored++; if (ok) pass++; }
    rows.push({ g: t.g, s: t.s, q: t.q, ok, best: top[0] ? `${top[0].textbookTitle} p.${top[0].pageStart}` : '(none)', returned: res.length });
  }
  const out = { questions: scored, passed: pass, accuracyTop3: +(pass / scored).toFixed(3), wrongClassResults: wrongClass, emptyAnswers: empty, failures: rows.filter((r) => !r.ok) };
  fs.writeFileSync(path.resolve(__dirname, '../../data/rag-qa.json'), JSON.stringify({ ...out, rows }, null, 1));
  console.log(JSON.stringify(out, null, 1));
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
