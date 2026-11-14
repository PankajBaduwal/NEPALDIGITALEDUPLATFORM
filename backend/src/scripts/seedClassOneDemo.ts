/**
 * Class 1 demo data for Dhambojhi Secondary School (EMIS 570010001) — Sections A (English medium) and B (Nepali medium).
 *
 * ADDITIVE and re-runnable: it only creates records that do not exist yet (matched by exact keys) and never deletes anything.
 * The only edit to existing records: duplicate student names inside Class 1 get a unique name.
 * It uses the teachers, students, subjects and allocations that are already in the database.
 *
 *   npm run seed:class1            (uses MONGODB_URI / the default local database)
 *
 * Fills, for every Class 1 teacher and student: attendance (daily + period-wise), unit-test and monthly-test marks (with the
 * draft → submitted → reviewed → published workflow), assignments with graded submissions, shared notes (PDF files) and board
 * notes, quizzes with attempts, interactive activities with progress, teaching plans, diary and syllabus progress, student remarks and
 * interventions, announcements, notifications, calendar events, smart-board lesson logs and absence notices.
 */
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { connectDB, disconnectDB } from '../config/db';
import * as M from '../models';
import { NepalGradingUtil } from '../common/utils/nepal-grading.util';

const m: any = M;
type Lang = 'en' | 'ne';

/* ───────────────────────── helpers ───────────────────────── */
const stats: Record<string, number> = {};
const made = (k: string, n = 1) => { stats[k] = (stats[k] || 0) + n; };

function hash(s: string) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed: string) {
  let a = hash(seed);
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const NPT = 5.75 * 3600 * 1000;
const nptDay = (d: Date) => new Date(d.getTime() + NPT).toISOString().slice(0, 10);
const dayAt = (s: string, hour = 6, min = 0) => new Date(`${s}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00.000Z`);
const addDays = (s: string, n: number) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const isSat = (s: string) => new Date(s + 'T00:00:00Z').getUTCDay() === 6;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const D = (s: string) => s; // readability marker for ISO day strings

/** Creates the record only when no record matches `filter`. */
async function ensure(model: any, filter: any, doc: any, label: string) {
  const ex = await model.findOne(filter);
  if (ex) return { doc: ex, created: false };
  const created = await model.create({ ...filter, ...doc });
  made(label);
  return { doc: created, created: true };
}

/* ───────────────────────── Class 1 content ───────────────────────── */
type T = { en?: string; ne?: string };
const pick = (t: T | undefined, lang: Lang) => (t ? (t[lang] ?? t.ne ?? t.en ?? '') : '');
const pickList = (t: { en?: string[]; ne?: string[] } | undefined, lang: Lang) => (t ? (t[lang] ?? t.ne ?? t.en ?? []) : []);

interface SubjectContent {
  fixedLang?: Lang; // Nepali and English subjects are always taught in their own language
  short: string;
  chapters: T[];
  assignments: Array<{ title: T; desc: T; answers: { en?: string[]; ne?: string[] } }>;
  materials: Array<{ kind: string; slug: string; title: T; lines: { en?: string[]; ne?: string[] } }>;
  quiz: { title: T; qs: Array<{ q: T; opts: { en?: string[]; ne?: string[] }; a: number }> };
  note: { title: T };
}

const CONTENT: Record<string, SubjectContent> = {
  NEP1: {
    fixedLang: 'ne', short: 'Nepali',
    chapters: [{ ne: 'स्वर वर्ण' }, { ne: 'व्यञ्जन वर्ण' }, { ne: 'मात्रा चिनारी' }, { ne: 'सरल शब्द पढौँ' }, { ne: 'मेरो परिवार' }, { ne: 'चित्र हेरौँ, बोलौँ' }, { ne: 'सानो वाक्य लेखौँ' }],
    assignments: [
      { title: { ne: 'स्वर वर्ण लेखन अभ्यास' }, desc: { ne: 'अ देखि अः सम्मका स्वर वर्णहरू कापीमा दुई पटक सफा अक्षरमा लेख्नुहोस्।' }, answers: { ne: ['अ आ इ ई उ ऊ ऋ ए ऐ ओ औ अं अः', 'मैले स्वर वर्ण दुई पटक लेखेँ।', 'अ आ इ ई उ ऊ ए ऐ ओ औ'] } },
      { title: { ne: 'मेरो परिवार (३ वाक्य)' }, desc: { ne: 'आफ्नो परिवारबारे तीन वटा सानो वाक्य लेख्नुहोस्। जस्तै: मेरी आमा हुनुहुन्छ।' }, answers: { ne: ['मेरी आमा हुनुहुन्छ। मेरा बुबा हुनुहुन्छ। मेरो एउटा भाइ छ।', 'मेरो परिवार सानो छ। म आमालाई माया गर्छु।'] } }
    ],
    materials: [
      { kind: 'LECTURE_NOTE', slug: 'swar-notes', title: { ne: 'स्वर वर्ण — पाठ टिपोट' }, lines: { ne: ['स्वर वर्ण १३ वटा हुन्छन्।', 'अ आ इ ई उ ऊ ऋ ए ऐ ओ औ अं अः', 'स्वर वर्णलाई ठूलो स्वरले पढौँ र कापीमा लेखौँ।', 'उदाहरण: अनार, आमा, इनार, ईश्वर, उल्लू, ऊन, एक, ऐना, ओखर, औंला।'] } },
      { kind: 'WORKSHEET', slug: 'swar-worksheet', title: { ne: 'स्वर वर्ण अभ्यास पाना' }, lines: { ne: ['१. खाली ठाउँ भरौँ: अ, आ, ___, ई, उ, ___', '२. ‘आमा’ शब्दको पहिलो वर्ण लेखौँ: ______', '३. तलका वर्णमध्ये स्वर वर्णमा घेरा लगाऔँ: क अ म इ ब ए', '४. स्वर वर्णबाट सुरु हुने दुई शब्द लेखौँ: ______  ______'] } }
    ],
    quiz: {
      title: { ne: 'स्वर वर्ण — छिटो जाँच' },
      qs: [
        { q: { ne: 'तलका मध्ये कुन स्वर वर्ण हो?' }, opts: { ne: ['क', 'अ', 'म', 'ब'] }, a: 1 },
        { q: { ne: '‘इ’ पछि कुन स्वर वर्ण आउँछ?' }, opts: { ne: ['ई', 'उ', 'ए', 'ओ'] }, a: 0 },
        { q: { ne: '‘आमा’ शब्दको पहिलो वर्ण कुन हो?' }, opts: { ne: ['म', 'आ', 'ा', 'अ'] }, a: 1 },
        { q: { ne: '‘ऋ’ कुन प्रकारको वर्ण हो?' }, opts: { ne: ['स्वर', 'व्यञ्जन', 'अंक', 'चिह्न'] }, a: 0 },
        { q: { ne: 'तलको कुन शब्द नेपाली हो?' }, opts: { ne: ['book', 'आमा', 'mother', 'apple'] }, a: 1 }
      ]
    },
    note: { title: { ne: 'स्वर वर्ण — आजको पाठ' } }
  },
  ENG1: {
    fixedLang: 'en', short: 'English',
    chapters: [{ en: 'Alphabet A to Z' }, { en: 'Phonics: Vowel Sounds' }, { en: 'Three-Letter Words' }, { en: 'Colours and Shapes' }, { en: 'My Family' }, { en: 'Simple Sentences' }, { en: 'Rhymes and Songs' }],
    assignments: [
      { title: { en: 'Alphabet Writing: A to J' }, desc: { en: 'Write the capital letters A to J two times in your copy.' }, answers: { en: ['A B C D E F G H I J (written two times)', 'I wrote A to J neatly.', 'A B C D E F G H I J'] } },
      { title: { en: 'My Family: Draw and Name' }, desc: { en: 'Draw your family members and write their names under each picture. Use words like mother, father, brother.' }, answers: { en: ['Mother, Father, Brother, Me', 'I drew my family. Mother, Father, Sister.'] } }
    ],
    materials: [
      { kind: 'LECTURE_NOTE', slug: 'alphabet-notes', title: { en: 'Alphabet A to Z: Class Notes' }, lines: { en: ['There are 26 letters in the English alphabet.', 'Vowels: A E I O U. The other 21 letters are consonants.', 'Say the letter, write the letter, then say a word that starts with it.', 'Examples: A for Apple, B for Ball, C for Cat, D for Dog.'] } },
      { kind: 'WORKSHEET', slug: 'vowels-worksheet', title: { en: 'Vowels and Consonants Worksheet' }, lines: { en: ['1. Write the five vowels: ___ ___ ___ ___ ___', '2. Circle the vowels: B  E  K  O  M  U', '3. Fill in the missing letter: A, B, __, D, E', '4. Write two words that start with the letter C: ______  ______'] } }
    ],
    quiz: {
      title: { en: 'Alphabet Quick Check' },
      qs: [
        { q: { en: 'Which letter comes after B?' }, opts: { en: ['A', 'C', 'D', 'E'] }, a: 1 },
        { q: { en: 'Which one is a vowel?' }, opts: { en: ['B', 'D', 'E', 'F'] }, a: 2 },
        { q: { en: '‘Cat’ starts with which letter?' }, opts: { en: ['C', 'K', 'S', 'T'] }, a: 0 },
        { q: { en: 'How many letters are in the word ‘DOG’?' }, opts: { en: ['2', '3', '4', '5'] }, a: 1 },
        { q: { en: 'What colour is the sky on a sunny day?' }, opts: { en: ['Red', 'Blue', 'Black', 'Pink'] }, a: 1 }
      ]
    },
    note: { title: { en: 'Alphabet — Today’s Lesson' } }
  },
  MTH1: {
    short: 'Mathematics',
    chapters: [{ en: 'Numbers 1 to 10', ne: 'संख्या १ देखि १०' }, { en: 'Numbers 11 to 20', ne: 'संख्या ११ देखि २०' }, { en: 'Big and Small, Long and Short', ne: 'ठूलो–सानो, लामो–छोटो' }, { en: 'Addition within 10', ne: '१० भित्रको जोड' }, { en: 'Subtraction within 10', ne: '१० भित्रको घटाउ' }, { en: 'Shapes Around Us', ne: 'हाम्रो वरिपरिका आकृति' }],
    assignments: [
      { title: { en: 'Count and Write 1 to 10', ne: 'गन्ती गरौँ र लेखौँ (१–१०)' }, desc: { en: 'Count the objects in each box and write the number.', ne: 'हरेक बाकसमा भएका वस्तु गनेर संख्या लेख्नुहोस्।' }, answers: { en: ['1 2 3 4 5 6 7 8 9 10', 'I counted and wrote 1 to 10.'], ne: ['१ २ ३ ४ ५ ६ ७ ८ ९ १०', 'मैले गनेर १ देखि १० सम्म लेखेँ।'] } },
      { title: { en: 'Addition within 10: Practice Sheet', ne: '१० भित्रको जोड: अभ्यास पाना' }, desc: { en: 'Solve the 10 addition sums on the worksheet.', ne: 'अभ्यास पानाका १० वटा जोडका प्रश्न हल गर्नुहोस्।' }, answers: { en: ['2+3=5, 4+4=8, 1+6=7, 5+2=7', 'All 10 sums done.'], ne: ['२+३=५, ४+४=८, १+६=७', 'सबै १० वटा जोड गरेँ।'] } }
    ],
    materials: [
      { kind: 'LECTURE_NOTE', slug: 'numbers-notes', title: { en: 'Numbers 1 to 10: Notes', ne: 'संख्या १–१०: पाठ टिपोट' }, lines: { en: ['Count the objects carefully, one by one.', '1 one, 2 two, 3 three, 4 four, 5 five, 6 six, 7 seven, 8 eight, 9 nine, 10 ten.', 'Write each number two times in your copy.', 'Tip: touch each object once while counting.'], ne: ['वस्तुहरू एक-एक गरेर ध्यानपूर्वक गनौँ।', '१ एक, २ दुई, ३ तीन, ४ चार, ५ पाँच, ६ छ, ७ सात, ८ आठ, ९ नौ, १० दश।', 'हरेक संख्या कापीमा दुई पटक लेखौँ।', 'सुझाव: गन्दा हरेक वस्तु एक पटक मात्र छुनुहोस्।'] } },
      { kind: 'WORKSHEET', slug: 'counting-worksheet', title: { en: 'Counting and Adding Worksheet', ne: 'गन्ती र जोड अभ्यास पाना' }, lines: { en: ['1. How many fingers are on one hand? ____', '2. 2 + 3 = ____', '3. 4 + 1 = ____', '4. Circle the bigger number:  3   8', '5. Write the numbers from 1 to 10: ______________'], ne: ['१. एउटा हातमा कति वटा औंला हुन्छन्? ____', '२. २ + ३ = ____', '३. ४ + १ = ____', '४. ठूलो संख्यामा घेरा लगाऔँ:  ३   ८', '५. १ देखि १० सम्मका संख्या लेखौँ: ______________'] } }
    ],
    quiz: {
      title: { en: 'Numbers Quick Check', ne: 'संख्या — छिटो जाँच' },
      qs: [
        { q: { en: 'Which number comes after 4?', ne: '४ पछि कुन संख्या आउँछ?' }, opts: { en: ['3', '5', '6', '7'], ne: ['३', '५', '६', '७'] }, a: 1 },
        { q: { en: '2 + 3 = ?', ne: '२ + ३ = ?' }, opts: { en: ['4', '5', '6', '7'], ne: ['४', '५', '६', '७'] }, a: 1 },
        { q: { en: 'Which is the biggest number?', ne: 'सबैभन्दा ठूलो संख्या कुन हो?' }, opts: { en: ['3', '8', '1', '2'], ne: ['३', '८', '१', '२'] }, a: 1 },
        { q: { en: '5 − 2 = ?', ne: '५ − २ = ?' }, opts: { en: ['1', '2', '3', '4'], ne: ['१', '२', '३', '४'] }, a: 2 },
        { q: { en: 'How many sides does a triangle have?', ne: 'त्रिभुजका कति वटा भुजा हुन्छन्?' }, opts: { en: ['2', '3', '4', '5'], ne: ['२', '३', '४', '५'] }, a: 1 }
      ]
    },
    note: { title: { en: 'Numbers — Today’s Lesson', ne: 'संख्या — आजको पाठ' } }
  },
  SER1: {
    short: 'Our Surrounding',
    chapters: [{ en: 'My Body', ne: 'मेरो शरीर' }, { en: 'My Family and Home', ne: 'मेरो परिवार र घर' }, { en: 'My School', ne: 'मेरो विद्यालय' }, { en: 'Plants and Animals', ne: 'बिरुवा र जनावर' }, { en: 'Weather and Seasons', ne: 'मौसम र ऋतु' }, { en: 'Cleanliness and Health', ne: 'सरसफाइ र स्वास्थ्य' }],
    assignments: [
      { title: { en: 'My Body Parts: Label the Picture', ne: 'मेरो शरीरका अङ्ग: चित्रमा नाम लेखौँ' }, desc: { en: 'Look at the picture of the body and write the names of the parts: head, eyes, nose, hands, legs.', ne: 'शरीरको चित्र हेरेर अङ्गका नाम लेख्नुहोस्: टाउको, आँखा, नाक, हात, खुट्टा।' }, answers: { en: ['head, eyes, nose, mouth, hands, legs', 'I labelled all the body parts.'], ne: ['टाउको, आँखा, नाक, मुख, हात, खुट्टा', 'मैले सबै अङ्गको नाम लेखेँ।'] } },
      { title: { en: 'Plants Around Me', ne: 'मेरो वरिपरिका बिरुवा' }, desc: { en: 'Name three plants you see near your home and draw one of them.', ne: 'घर वरिपरि देखिने तीन वटा बिरुवाको नाम लेख्नुहोस् र एउटाको चित्र बनाउनुहोस्।' }, answers: { en: ['Mango tree, rose, tulsi', 'I drew a rose plant.'], ne: ['आँपको रूख, गुलाफ, तुलसी', 'मैले गुलाफको चित्र बनाएँ।'] } }
    ],
    materials: [
      { kind: 'LECTURE_NOTE', slug: 'body-notes', title: { en: 'My Body: Class Notes', ne: 'मेरो शरीर: पाठ टिपोट' }, lines: { en: ['We have a head, two eyes, two ears, one nose and one mouth.', 'We see with our eyes, hear with our ears, smell with our nose and taste with our tongue.', 'We touch and feel with our skin.', 'Keep your body clean: bathe daily and wash your hands before eating.'], ne: ['हाम्रो एउटा टाउको, दुई आँखा, दुई कान, एउटा नाक र एउटा मुख हुन्छ।', 'हामी आँखाले हेर्छौँ, कानले सुन्छौँ, नाकले बास्ना थाहा पाउँछौँ र जिब्रोले स्वाद थाहा पाउँछौँ।', 'हामी छालाले छोएर थाहा पाउँछौँ।', 'शरीर सफा राखौँ: दैनिक नुहाऔँ र खानुअघि हात धोऔँ।'] } },
      { kind: 'WORKSHEET', slug: 'senses-worksheet', title: { en: 'Five Senses Worksheet', ne: 'ज्ञानेन्द्रिय अभ्यास पाना' }, lines: { en: ['1. We see with our ______ (eyes / ears)', '2. We hear with our ______ (nose / ears)', '3. Draw a line: Nose → smell,  Tongue → taste', '4. Name two things that are good for health: ______  ______'], ne: ['१. हामी ______ ले हेर्छौँ। (आँखा / कान)', '२. हामी ______ ले सुन्छौँ। (नाक / कान)', '३. रेखा तानौँ: नाक → बास्ना,  जिब्रो → स्वाद', '४. स्वास्थ्यका लागि राम्रा दुई कुरा लेखौँ: ______  ______'] } }
    ],
    quiz: {
      title: { en: 'My Body Quick Check', ne: 'मेरो शरीर — छिटो जाँच' },
      qs: [
        { q: { en: 'How many eyes do we have?', ne: 'हामीसँग कति वटा आँखा हुन्छन्?' }, opts: { en: ['1', '2', '3', '4'], ne: ['१', '२', '३', '४'] }, a: 1 },
        { q: { en: 'We smell with our ____.', ne: 'हामी कुनबाट बास्ना थाहा पाउँछौँ?' }, opts: { en: ['eyes', 'nose', 'ears', 'hands'], ne: ['आँखा', 'नाक', 'कान', 'हात'] }, a: 1 },
        { q: { en: 'Which one is a plant?', ne: 'तलको कुन बिरुवा हो?' }, opts: { en: ['Dog', 'Tree', 'Cow', 'Cat'], ne: ['कुकुर', 'रूख', 'गाई', 'बिरालो'] }, a: 1 },
        { q: { en: 'We should wash our hands before ____.', ne: 'हामीले कुन कामअघि हात धुनुपर्छ?' }, opts: { en: ['playing', 'eating', 'sleeping', 'running'], ne: ['खेल्नु', 'खानु', 'सुत्नु', 'दगुर्नु'] }, a: 1 },
        { q: { en: 'Which season is very hot?', ne: 'कुन ऋतु धेरै गर्मी हुन्छ?' }, opts: { en: ['Summer', 'Winter', 'Spring', 'Autumn'], ne: ['गर्मी', 'जाडो', 'वसन्त', 'शरद'] }, a: 0 }
      ]
    },
    note: { title: { en: 'My Body — Today’s Lesson', ne: 'मेरो शरीर — आजको पाठ' } }
  }
};

const REMARKS = {
  praise: {
    en: ['Participates actively and answers questions with confidence.', 'Neat handwriting and completes homework on time.', 'Showing great improvement this month — keep it up!'],
    ne: ['कक्षामा सक्रिय सहभागी हुन्छ र प्रश्नको आत्मविश्वासका साथ जवाफ दिन्छ।', 'अक्षर सफा छ र गृहकार्य समयमै पूरा गर्छ।', 'यो महिना राम्रो सुधार देखिएको छ — यसै गरी निरन्तरता दिनुहोस्।']
  },
  help: {
    en: ['Needs extra practice with reading and writing letters; please revise a little every day at home.', 'Often distracted in class; moved to the front row to help focus.', 'Misses many classes — please make sure your child attends regularly.'],
    ne: ['अक्षर पढ्न र लेख्नमा थप अभ्यास आवश्यक छ; घरमा दैनिक थोरै दोहोर्‍याउनुहोला।', 'कक्षामा ध्यान भड्किने गरेकाले ध्यान केन्द्रित गर्न अगाडिको पङ्क्तिमा बसाइएको छ।', 'धेरै कक्षा छुट्छ — बच्चा नियमित विद्यालय आओस् भन्ने सुनिश्चित गर्नुहोला।']
  }
};

const ABILITY = [88, 76, 92, 64, 71, 58, 38, 81, 66]; // by roll number: 7 is the student who needs help
const PRESENT_PROB = [0.97, 0.95, 0.98, 0.93, 0.94, 0.88, 0.72, 0.96, 0.90]; // roll 7 is often absent

function weekdaySchoolDays(from: string, to: string) {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) if (!isSat(d)) out.push(d);
  return out;
}

/* ───────────────────────── note files (PDF) ───────────────────────── */
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'materials');
const NIRMALA = 'C:/Windows/Fonts/Nirmala.ttc';

async function writePdf(file: string, school: string, title: string, subtitle: string, lines: string[], lang: Lang) {
  if (fs.existsSync(file)) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 });
    const out = fs.createWriteStream(file);
    out.on('finish', () => resolve());
    out.on('error', reject);
    doc.pipe(out);
    const nepali = lang === 'ne' && fs.existsSync(NIRMALA);
    const body = () => (nepali ? doc.font(NIRMALA, 'NirmalaUI') : doc.font('Helvetica'));
    const head = () => (nepali ? doc.font(NIRMALA, 'NirmalaUI-Bold') : doc.font('Helvetica-Bold'));
    doc.font('Helvetica').fontSize(10).fillColor('#64748b').text(school.toUpperCase() + '  ·  GRADE 1', { align: 'left' });
    doc.moveDown(0.6);
    head().fontSize(22).fillColor('#0f766e').text(title);
    body().fontSize(11).fillColor('#64748b').text(subtitle);
    doc.moveDown(0.5);
    doc.moveTo(56, doc.y).lineTo(539, doc.y).strokeColor('#99f6e4').lineWidth(1.5).stroke();
    doc.moveDown(1);
    body().fontSize(15).fillColor('#0f172a');
    lines.forEach((l) => { doc.text(l, { lineGap: 7 }); doc.moveDown(0.5); });
    doc.end();
  });
}

/* ───────────────────────── main ───────────────────────── */
async function main() {
  await connectDB();
  const dbName = m.Institution.db.name;
  console.log(`\n▶ Seeding Class 1 demo data into database "${dbName}"`);

  const inst: any = await m.Institution.findOne({ emisCode: '570010001' });
  if (!inst) throw new Error('Dhambojhi Secondary School (570010001) not found in this database');
  const year: any = await m.AcademicYear.findOne({ institutionId: inst._id, isCurrent: true });
  const cls: any = await m.Class.findOne({ institutionId: inst._id, gradeNumber: 1 });
  if (!year || !cls) throw new Error('Academic year or Grade 1 class is missing');
  const sections: any[] = (await m.Section.find({ classId: cls._id, academicYearId: year._id }).sort({ name: 1 })) as any[];
  const today = nptDay(new Date());
  console.log(`  school: ${inst.name} · year ${year.name} · today (Nepal) ${today} · sections: ${sections.map((s) => s.name).join(', ')}`);

  const firstExam: any = await m.Examination.findOne({ institutionId: inst._id, code: 'TERM1_2083' });
  const gradingSchemeId = firstExam && firstExam.gradingSchemeId;

  /* ---- collect people & allocations ---- */
  interface Alloc { subject: any; code: string; teacher: any; }
  interface Sec { doc: any; lang: Lang; label: string; classTeacher: any; students: Array<{ user: any; roll: number; enr: any; ability: number; present: number }>; allocs: Alloc[]; idx: number; }
  const secs: Sec[] = [];
  for (const [idx, s] of sections.entries()) {
    const ct = s.classTeacherId ? await m.User.findById(s.classTeacherId) : null;
    const enrs: any[] = await m.StudentEnrollment.find({ sectionId: s._id, academicYearId: year._id, status: { $ne: 'GRADUATED' } }).sort({ rollNumber: 1 });
    const students: Sec['students'] = [];
    for (const e of enrs) {
      const u = await m.User.findById(e.studentId);
      if (!u) continue;
      const k = (e.rollNumber - 1 + idx * 3) % 9;
      students.push({ user: u, roll: e.rollNumber, enr: e, ability: ABILITY[k], present: PRESENT_PROB[k] });
    }
    const al: any[] = await m.SubjectAllocation.find({ sectionId: s._id }).populate('centralSubjectId').populate('teacherId');
    const allocs: Alloc[] = al.filter((a) => a.centralSubjectId && a.teacherId).map((a) => ({ subject: a.centralSubjectId, code: a.centralSubjectId.code, teacher: a.teacherId }));
    const order = ['NEP1', 'ENG1', 'MTH1', 'SER1'];
    allocs.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));
    secs.push({ doc: s, lang: s.medium === 'NEPALI' ? 'ne' : 'en', label: `Section ${s.name}`, classTeacher: ct, students, allocs, idx });
  }
  console.log('  teachers/students per section:', secs.map((s) => `${s.label}: ${s.allocs.length} subject teachers, class teacher ${s.classTeacher && s.classTeacher.username}, ${s.students.length} students`).join(' | '));

  /* ---- 0. unique student names inside Class 1 ---- */
  const spare = [['Riya Gurung', 'रिया गुरुङ'], ['Anisha Rana', 'अनिशा राना'], ['Sagar Bhandari', 'सागर भण्डारी'], ['Nabin Oli', 'नविन ओली'], ['Prashant Kumal', 'प्रशान्त कुमाल'], ['Sneha Pun', 'स्नेहा पुन'], ['Roshan Dahal', 'रोशन दाहाल'], ['Kritika Basnet', 'कृतिका बस्नेत']];
  const seen = new Set<string>();
  let spareIdx = 0;
  for (const s of secs) for (const st of s.students) {
    const name = st.user.fullName;
    if (seen.has(name) && spareIdx < spare.length) {
      st.user.fullName = spare[spareIdx][0]; st.user.fullNameNepali = spare[spareIdx][1]; spareIdx++;
      await st.user.save(); made('student names made unique');
    }
    seen.add(st.user.fullName);
  }

  /* ---- 1. attendance: daily (class teacher) + period-wise (subject teachers) ---- */
  const record = async (sec: Sec, day: string, period: number, subj: any, takenBy: any) => {
    const date = dayAt(day);
    const dayStart = dayAt(addDays(day, -1), 18, 15), dayEnd = dayAt(day, 18, 14); // the Nepal calendar day, in UTC
    const exists = await m.AttendanceSession.findOne({ sectionId: sec.doc._id, periodNumber: period, centralSubjectId: subj._id, date: { $gte: dayStart, $lte: dayEnd } });
    if (exists) return;
    const r = rng(`att|${sec.doc._id}|${day}|${period}`);
    const recs = sec.students.map((st) => {
      const x = r();
      const status = x < st.present ? 'PRESENT' : x < st.present + (1 - st.present) * 0.45 ? 'ABSENT' : x < st.present + (1 - st.present) * 0.75 ? 'LATE' : 'LEAVE';
      return { studentId: st.user._id, status };
    });
    const c = (s: string) => recs.filter((x) => x.status === s).length;
    const session = await m.AttendanceSession.create({
      institutionId: inst._id, academicYearId: year._id, classId: cls._id, sectionId: sec.doc._id, centralSubjectId: subj._id, periodNumber: period,
      date, takenBy: takenBy._id, totalStudents: recs.length, presentCount: c('PRESENT'), absentCount: c('ABSENT'), lateCount: c('LATE'), leaveCount: c('LEAVE'), status: 'SUBMITTED'
    });
    await m.AttendanceRecord.create({
      institutionId: inst._id, academicYearId: year._id, classId: cls._id, sectionId: sec.doc._id, centralSubjectId: subj._id, periodNumber: period,
      date, sessionId: session._id, recordedBy: takenBy._id, records: recs
    });
    made(period === 1 ? 'attendance days (daily)' : 'attendance sessions (period-wise)');
  };
  for (const s of secs) {
    // daily attendance: fill every school day (Sun–Fri) from 3 weeks ago up to today; days that already exist are skipped
    const days = weekdaySchoolDays(addDays(today, -28), today);
    const first = s.allocs[0];
    if (!first) continue;
    for (const day of days) await record(s, day, 1, first.subject, s.classTeacher || first.teacher);
    // period-wise attendance by each subject teacher for the last 6 school days
    const recent = weekdaySchoolDays(addDays(today, -9), today).slice(-6);
    for (const day of recent) for (const [i, a] of s.allocs.entries()) if (i > 0) await record(s, day, i + 1, a.subject, a.teacher);
  }

  /* ---- 2. examinations & marks (full teacher → class teacher → publish workflow) ---- */
  const grade = (pct: number) => NepalGradingUtil.calculateGrade(pct);
  const ut1 = (await ensure(m.Examination, { institutionId: inst._id, code: 'UT1_2083' }, {
    academicYearId: year._id, name: 'Unit Test 1 — 2083', examType: 'UNIT_TEST', startDate: dayAt('2026-10-18'), endDate: dayAt('2026-10-19'),
    applicableGrades: [1, 2, 3], gradingSchemeId, weightagePercentage: 10, status: 'PUBLISHED', isPublished: true, publishedAt: dayAt('2026-10-26'), publishedBy: inst.adminId
  }, 'examinations')).doc;
  const mt = (await ensure(m.Examination, { institutionId: inst._id, code: 'MT_MANGSIR_2083' }, {
    academicYearId: year._id, name: 'Monthly Test — Mangsir 2083', examType: 'MONTHLY_TEST', startDate: dayAt(addDays(today, -5)), endDate: dayAt(addDays(today, -4)),
    applicableGrades: [1, 2, 3], gradingSchemeId, weightagePercentage: 10, status: 'EVALUATION', isPublished: false
  }, 'examinations')).doc;

  const monthlyWorkflow: Record<number, Record<string, string>> = {
    0: { NEP1: 'SUBMITTED', ENG1: 'SUBMITTED', MTH1: 'DRAFT', SER1: 'REVIEWED' },
    1: { NEP1: 'SUBMITTED', ENG1: 'REVIEWED', MTH1: 'DRAFT', SER1: 'SUBMITTED' }
  };
  for (const s of secs) for (const a of s.allocs) {
    const mark = async (exam: any, key: 'UT' | 'MT', workflow: string, full: number, theoryShare: number) => {
      const asmt = (await ensure(m.ExamAssessment, { examinationId: exam._id, sectionId: s.doc._id, centralSubjectId: a.subject._id }, {
        institutionId: inst._id, academicYearId: year._id, classId: cls._id, assignedTeacherId: a.teacher._id,
        name: `${a.subject.name} — ${exam.name}`, examType: exam.examType,
        fullMarksTheory: Math.round(full * theoryShare), passMarksTheory: Math.round(full * theoryShare * 0.4), fullMarksPractical: full - Math.round(full * theoryShare), passMarksPractical: Math.round((full - Math.round(full * theoryShare)) * 0.4),
        totalMarks: full, passMarks: Math.round(full * 0.4), workflowStatus: workflow,
        ...(workflow !== 'DRAFT' ? { submittedAt: dayAt(addDays(today, key === 'UT' ? -15 : -3)), submittedBy: a.teacher._id } : {}),
        ...(workflow === 'REVIEWED' || workflow === 'PUBLISHED' ? { reviewedAt: dayAt(addDays(today, key === 'UT' ? -14 : -2)), reviewedBy: (s.classTeacher || a.teacher)._id } : {}),
        ...(workflow === 'PUBLISHED' ? { approvedAt: dayAt(addDays(today, -13)), approvedBy: inst.adminId, isPublished: true, publishedAt: dayAt(addDays(today, -13)), publishedBy: inst.adminId } : {})
      }, 'exam assessments')).doc;
      for (const [i, st] of s.students.entries()) {
        if (workflow === 'DRAFT' && i >= 5) continue; // the teacher has entered only some marks so far
        const r = rng(`mark|${exam.code}|${s.doc._id}|${a.code}|${st.user.username}`);
        const subjOffset = (hash(a.code) % 9) - 4;
        const pct = clamp(st.ability + subjOffset + (r() - 0.5) * 14, 8, 100);
        const total = Math.round((pct / 100) * full * 2) / 2;
        const theory = Math.min(Math.round(total * theoryShare), Math.round(full * theoryShare));
        const practical = Math.round((total - theory) * 2) / 2;
        const p = (total / full) * 100;
        const g = grade(p);
        await ensure(m.StudentMark, { assessmentId: asmt._id, studentId: st.user._id }, {
          institutionId: inst._id, examinationId: exam._id, classId: cls._id, sectionId: s.doc._id, centralSubjectId: a.subject._id,
          marksTheory: theory, marksPractical: practical, marksObtained: total, theoryMarks: theory, practicalMarks: practical, totalMarks: total,
          percentage: Math.round(p * 10) / 10, grade: g.grade, gpa: g.gpa, isAbsent: false, submittedBy: a.teacher._id, workflowStatus: workflow,
          remarks: p >= 80 ? 'Excellent' : p >= 60 ? 'Good work' : p >= 40 ? 'Satisfactory' : 'Needs extra practice',
          isVerifiedByClassTeacher: workflow === 'PUBLISHED' || workflow === 'REVIEWED'
        }, 'student marks');
      }
    };
    await mark(ut1, 'UT', 'PUBLISHED', 25, 0.8);
    await mark(mt, 'MT', monthlyWorkflow[s.idx]?.[a.code] || 'SUBMITTED', 50, 0.8);
  }

  /* ---- 3. assignments + submissions ---- */
  const feedbackGood: Record<Lang, string[]> = { en: ['Well done! Very neat work.', 'Good effort — keep practising.', 'Excellent, full marks!'], ne: ['धेरै राम्रो! सफा काम।', 'राम्रो प्रयास — अभ्यास जारी राख्नुहोस्।', 'उत्कृष्ट, पूर्णाङ्क!'] };
  const feedbackMid: Record<Lang, string[]> = { en: ['Good try. Please check the spellings.', 'Some answers need correction; revise the lesson.'], ne: ['राम्रो प्रयास। हिज्जे जाँच्नुहोला।', 'केही उत्तर सच्याउनुपर्छ; पाठ दोहोर्‍याउनुहोस्।'] };
  for (const s of secs) for (const a of s.allocs) {
    const c = CONTENT[a.code]; if (!c) continue;
    const lang: Lang = c.fixedLang || s.lang;
    for (const [ai, spec] of c.assignments.entries()) {
      const past = ai === 0;
      const due = dayAt(addDays(today, past ? -12 : 6), 10, 0);
      const asg = (await ensure(m.Assignment, { sectionId: s.doc._id, centralSubjectId: a.subject._id, title: pick(spec.title, lang) }, {
        institutionId: inst._id, classId: cls._id, teacherId: a.teacher._id, description: pick(spec.desc, lang), instructions: pick(spec.desc, lang),
        medium: lang === 'ne' ? 'NEPALI' : 'ENGLISH', chapterNumber: past ? 1 : 2, topic: pick(c.chapters[past ? 0 : 1], lang), submissionType: 'BOTH', dueDate: due,
        allowLateSubmission: true, lateSubmissionPolicy: 'ALLOW_WITHOUT_PENALTY', latePenaltyPercent: 0, maxScore: 10, status: 'ACTIVE', publishedAt: dayAt(addDays(today, past ? -19 : -2), 8, 0)
      }, 'assignments')).doc;
      const answers = pickList(spec.answers, lang);
      for (const st of s.students) {
        const r = rng(`sub|${asg._id}|${st.user.username}`);
        const submits = past ? r() < 0.55 + st.ability / 250 : r() < 0.3;
        if (!submits) continue;
        const late = past && r() < 0.15;
        const submittedAt = dayAt(addDays(today, past ? (late ? -11 : -13 + Math.floor(r() * 2)) : -1), 7 + Math.floor(r() * 8), Math.floor(r() * 60));
        const graded = past;
        const marks = clamp(Math.round((st.ability / 10 + (r() - 0.5) * 2.4) * 2) / 2, 2, 10);
        await ensure(m.AssignmentSubmission, { assignmentId: asg._id, studentId: st.user._id }, {
          institutionId: inst._id, content: answers[Math.floor(r() * answers.length)] || '', textAnswers: answers[Math.floor(r() * answers.length)] || '',
          submittedAt, isLate: late, status: graded ? 'GRADED' : 'SUBMITTED',
          ...(graded ? { marksObtained: marks, feedback: (marks >= 7 ? feedbackGood : feedbackMid)[lang][Math.floor(r() * (marks >= 7 ? 3 : 2)) % (marks >= 7 ? 3 : 2)], gradedBy: a.teacher._id, gradedAt: dayAt(addDays(today, -10), 11, 0) } : {})
        }, 'assignment submissions');
      }
    }
  }

  /* ---- 4. shared notes (PDF files) + smart-board notes ---- */
  for (const s of secs) for (const a of s.allocs) {
    const c = CONTENT[a.code]; if (!c) continue;
    const lang: Lang = c.fixedLang || s.lang;
    for (const mat of c.materials) {
      const fileName = `class1-${a.code.toLowerCase()}-${lang}-${mat.slug}.pdf`;
      const file = path.join(UPLOAD_DIR, fileName);
      await writePdf(file, inst.name, pick(mat.title, lang), `${c.short} · Grade 1 · Section ${s.doc.name}`, pickList(mat.lines, lang), lang);
      const size = fs.existsSync(file) ? fs.statSync(file).size : 0;
      await ensure(m.AcademicMaterial, { sectionId: s.doc._id, centralSubjectId: a.subject._id, title: pick(mat.title, lang) }, {
        institutionId: inst._id, uploadedBy: a.teacher._id, classId: cls._id, medium: lang === 'ne' ? 'NEPALI' : 'ENGLISH', category: mat.kind,
        description: lang === 'ne' ? `${c.short} — कक्षा १ का लागि साझा सामग्री` : `Shared material for Grade 1 ${c.short}`,
        chapterNumber: mat.kind === 'LECTURE_NOTE' ? 1 : 2, topic: pick(c.chapters[mat.kind === 'LECTURE_NOTE' ? 0 : 1], lang),
        fileUrl: `/uploads/materials/${fileName}`, originalFilename: `Class1_${c.short.replace(/\s+/g, '')}_${mat.slug}.pdf`, fileSizeBytes: size, mimeType: 'application/pdf',
        downloadCount: 3 + (hash(fileName + s.doc.name) % 9), isPublicToClass: true
      }, 'shared notes (files)');
    }
    // board notes shared with students (what the teacher wrote on the Smart Board)
    const chapter = pick(c.chapters[0], lang);
    const content = lang === 'ne'
      ? `आजको पाठ: ${chapter}। हामीले कक्षामा पढ्यौँ, लेख्यौँ र छलफल गर्‍यौँ। घरमा दोहोर्‍याउनुहोस् र भोलि कापी ल्याउनुहोस्।`
      : `Today's lesson: ${chapter}. We read, wrote and discussed in class. Please revise at home and bring your copy tomorrow.`;
    await ensure(m.SmartBoardNote, { sectionId: s.doc._id, subjectId: a.subject._id, title: pick(c.note.title, lang) }, {
      institutionId: inst._id, teacherId: a.teacher._id, sessionDate: dayAt(addDays(today, -3)), drawingData: { content, chapter, createdAt: dayAt(addDays(today, -3)).toISOString() }, isSharedWithStudents: true
    }, 'smart-board notes');
  }

  /* ---- 5. quizzes + attempts ---- */
  for (const s of secs) for (const a of s.allocs) {
    const c = CONTENT[a.code]; if (!c) continue;
    const lang: Lang = c.fixedLang || s.lang;
    const quiz = (await ensure(m.Quiz, { sectionId: s.doc._id, centralSubjectId: a.subject._id, title: pick(c.quiz.title, lang) }, {
      institutionId: inst._id, classId: cls._id, teacherId: a.teacher._id, description: lang === 'ne' ? 'पाँच वटा सरल प्रश्न' : 'Five simple questions', medium: lang === 'ne' ? 'NEPALI' : 'ENGLISH',
      chapterNumber: 1, topic: pick(c.chapters[0], lang), difficultyLevel: 'EASY', durationMinutes: 10, totalMarks: 5, passingMarks: 2, passingScorePercent: 40,
      instructions: lang === 'ne' ? 'सही उत्तर छान्नुहोस्।' : 'Choose the correct answer.',
      startTime: dayAt(addDays(today, -9), 4), endTime: dayAt(addDays(today, 2), 12), status: 'PUBLISHED',
      securitySettings: { enforceFullscreen: false, detectTabSwitch: false, autoSubmitOnViolations: false, blockCopyPaste: false, maxWarnings: 3, navigationRule: 'FREE', randomizeQuestions: false, randomizeOptions: false },
      questions: c.quiz.qs.map((q, qi) => ({
        questionText: pick(q.q, lang), questionType: 'MCQ',
        options: pickList(q.opts, lang).map((t, oi) => ({ id: `opt_${'abcd'[oi]}`, text: t })), correctAnswers: `opt_${'abcd'[q.a]}`, marks: 1,
        explanation: lang === 'ne' ? 'पाठ दोहोर्‍याएर हेर्नुहोस्।' : 'Revise the lesson to check this answer.', chapterNumber: 1, topic: pick(c.chapters[0], lang)
      }))
    }, 'quizzes')).doc;
    const qlist: any[] = quiz.questions || [];
    for (const st of s.students) {
      const r = rng(`quiz|${quiz._id}|${st.user.username}`);
      if (r() > 0.82) continue;
      let score = 0;
      const answers = qlist.map((q: any, qi: number) => {
        const correct = r() < 0.3 + st.ability / 130;
        const chosen = correct ? q.correctAnswers : `opt_${'abcd'[(c.quiz.qs[qi].a + 1 + Math.floor(r() * 3)) % 4]}`;
        if (correct) score++;
        return { questionId: String(q._id || qi), selectedOption: chosen, isCorrect: correct, scoreAwarded: correct ? 1 : 0, explanation: '' };
      });
      await ensure(m.QuizAttempt, { quizId: quiz._id, studentId: st.user._id }, {
        institutionId: inst._id, attemptNumber: 1, answers, score, totalMarks: 5, percentage: score * 20, passed: score >= 2, timeSpentSeconds: 90 + Math.floor(r() * 360),
        submittedAt: dayAt(addDays(today, -8 + Math.floor(r() * 5)), 5 + Math.floor(r() * 4), Math.floor(r() * 60)), status: 'SUBMITTED'
      }, 'quiz attempts');
    }
  }

  /* ---- 6. interactive activities (assigned to both sections) + progress ---- */
  const subjByCode = (code: string) => secs[0].allocs.find((x) => x.code === code)?.subject;
  const activitySpecs = [
    { code: 'ACT-C1-MTH-COUNT', sc: 'MTH', mc: 'MTH1', title: 'Counting 1 to 10', ne: 'गन्ती १–१०', desc: 'Count the objects and pick the right number.', qs: [['How many fingers are on one hand?', ['3', '5', '7', '10'], 1], ['What comes after 6?', ['5', '7', '8', '9'], 1], ['Which number is the smallest?', ['9', '4', '1', '6'], 2]] },
    { code: 'ACT-C1-ENG-ALPHA', sc: 'ENG', mc: 'ENG1', title: 'Alphabet Fun', ne: 'वर्णमाला रमाइलो', desc: 'Find the right letter and the right word.', qs: [['Which letter comes after C?', ['B', 'D', 'F', 'A'], 1], ['‘Apple’ starts with which letter?', ['B', 'A', 'P', 'E'], 1], ['Which one is a vowel?', ['M', 'T', 'O', 'S'], 2]] },
    { code: 'ACT-C1-NEP-SWAR', sc: 'NEP', mc: 'NEP1', title: 'स्वर वर्ण पहिचान', ne: 'स्वर वर्ण पहिचान', desc: 'स्वर वर्ण चिन्नुहोस्।', qs: [['तलको कुन स्वर वर्ण हो?', ['क', 'ग', 'आ', 'त'], 2], ['‘अ’ पछि कुन स्वर आउँछ?', ['आ', 'क', 'म', 'ब'], 0], ['‘ए’ कुन प्रकारको वर्ण हो?', ['व्यञ्जन', 'स्वर', 'अंक', 'चिह्न'], 1]] },
    { code: 'ACT-C1-SER-BODY', sc: 'SER', mc: 'SER1', title: 'My Body and Senses', ne: 'मेरो शरीर र ज्ञानेन्द्रिय', desc: 'Learn which part of the body does which job.', qs: [['We see with our…', ['eyes', 'ears', 'hands', 'feet'], 0], ['We hear with our…', ['nose', 'ears', 'eyes', 'mouth'], 1], ['We smell with our…', ['tongue', 'hands', 'nose', 'ears'], 2]] }
  ];
  for (const sp of activitySpecs) {
    const subj = subjByCode(sp.mc);
    const act = (await ensure(m.Activity, { code: sp.code }, {
      title: sp.title, titleNepali: sp.ne, description: sp.desc, type: 'MCQ', gradeLevels: [1], subjectId: subj && subj._id, subjectCode: sp.sc, chapterNumber: 1, topicName: sp.title,
      learningObjectives: [sp.desc], totalMarks: 3, passingScore: 2, timeLimitMinutes: 5, isPublished: true, questionsCount: 3, createdBy: secs[0].allocs.find((x) => x.code === sp.mc)?.teacher._id
    }, 'activities')).doc;
    const qdocs: any[] = [];
    for (const [qi, q] of (sp.qs as any[]).entries()) {
      const { doc } = await ensure(m.ActivityQuestion, { activityId: act._id, questionNumber: qi + 1 }, {
        type: 'MCQ', prompt: q[0], points: 1, explanation: '', data: { options: (q[1] as string[]).map((t, oi) => ({ id: `opt${oi + 1}`, text: t, isCorrect: oi === q[2] })) }
      }, 'activity questions');
      qdocs.push(doc);
    }
    for (const s of secs) {
      const a = s.allocs.find((x) => x.code === sp.mc); if (!a) continue;
      const asg = (await ensure(m.ActivityAssignment, { activityId: act._id, sectionId: s.doc._id }, {
        institutionId: inst._id, teacherId: a.teacher._id, classId: cls._id, subjectId: a.subject._id, dueDate: dayAt(addDays(today, 7), 10), status: 'ACTIVE', allowRetries: true, maxAttempts: 3
      }, 'activity assignments')).doc;
      for (const st of s.students) {
        const r = rng(`act|${act.code}|${st.user.username}`);
        if (r() > 0.7) continue;
        let score = 0;
        const answers = qdocs.map((qd: any, qi: number) => {
          const correct = r() < 0.35 + st.ability / 140;
          const opts = qd.data.options as any[];
          const right = opts.find((o) => o.isCorrect);
          const wrong = opts.filter((o) => !o.isCorrect)[Math.floor(r() * 3)];
          if (correct) score++;
          return { questionId: String(qd._id), studentAnswer: (correct ? right : wrong).id, isCorrect: correct, scoreEarned: correct ? 1 : 0, feedback: correct ? 'Correct!' : 'Try again.' };
        });
        const when = dayAt(addDays(today, -1 - Math.floor(r() * 4)), 6, Math.floor(r() * 60));
        await ensure(m.ActivityAttempt, { activityId: act._id, assignmentId: asg._id, studentId: st.user._id }, {
          institutionId: inst._id, studentName: st.user.fullName, classId: cls._id, sectionId: s.doc._id, answers, totalScore: score, maxScore: 3,
          percentage: Math.round((score / 3) * 100), passed: score >= 2, timeSpentSeconds: 60 + Math.floor(r() * 200), status: 'COMPLETED', completedAt: when
        }, 'activity attempts');
        await ensure(m.ActivityProgress, { studentId: st.user._id, activityId: act._id }, {
          institutionId: inst._id, subjectId: a.subject._id, grade: 1, bestScore: score, highestPercentage: Math.round((score / 3) * 100), attemptsCount: 1, isCompleted: score >= 2, lastAttemptedAt: when
        }, 'activity progress');
      }
    }
  }

  /* ---- 7. teaching plan, diary and syllabus progress ---- */
  for (const s of secs) for (const a of s.allocs) {
    const c = CONTENT[a.code]; if (!c) continue;
    const lang: Lang = c.fixedLang || s.lang;
    const plan: any = await m.TeachingPlan.findOne({ teacherId: a.teacher._id, sectionId: s.doc._id, centralSubjectId: a.subject._id });
    if (!plan) { await m.TeachingPlan.create({ institutionId: inst._id, teacherId: a.teacher._id, sectionId: s.doc._id, centralSubjectId: a.subject._id, chapters: c.chapters.map((t, i) => ({ number: i + 1, title: pick(t, lang) })) }); made('teaching plans'); }
    const progressStates = ['COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'NOT_STARTED', 'NOT_STARTED', 'NOT_STARTED', 'NOT_STARTED'];
    for (const [i, t] of c.chapters.entries()) {
      const status = progressStates[i] || 'NOT_STARTED';
      const total = 4;
      await ensure(m.SyllabusProgress, { sectionId: s.doc._id, centralSubjectId: a.subject._id, chapterNumber: i + 1 }, {
        institutionId: inst._id, academicYearId: year._id, classId: cls._id, teacherId: a.teacher._id, chapterTitle: pick(t, lang), status, totalTopics: total,
        coveredTopics: status === 'COMPLETED' ? ['T1', 'T2', 'T3', 'T4'] : status === 'IN_PROGRESS' ? ['T1', 'T2'] : [],
        completionPercentage: status === 'COMPLETED' ? 100 : status === 'IN_PROGRESS' ? 50 : 0,
        startDate: status === 'NOT_STARTED' ? null : dayAt(addDays(today, -40 + i * 14)), completedDate: status === 'COMPLETED' ? dayAt(addDays(today, -28 + i * 14)) : null,
        teachingHoursSpent: status === 'COMPLETED' ? 6 : status === 'IN_PROGRESS' ? 3 : 0,
        teachingNotes: status === 'COMPLETED' ? (lang === 'ne' ? 'सबै विद्यार्थीले पाठ बुझे।' : 'All students understood the lesson.') : ''
      }, 'syllabus progress');
    }
    const recent = weekdaySchoolDays(addDays(today, -9), today).slice(-6);
    for (const [i, day] of recent.entries()) {
      const ci = Math.min(i < 3 ? 1 : 2, c.chapters.length - 1);
      const title = pick(c.chapters[ci], lang);
      const isPast = day < today;
      await ensure(m.TeachingDiaryEntry, { teacherId: a.teacher._id, sectionId: s.doc._id, centralSubjectId: a.subject._id, date: dayAt(day), topic: lang === 'ne' ? `${title} — अभ्यास ${i + 1}` : `${title} — practice ${i + 1}` }, {
        institutionId: inst._id, periodNumber: s.allocs.indexOf(a) + 1, chapterNumber: ci + 1, chapterTitle: title,
        objective: lang === 'ne' ? `विद्यार्थीले “${title}” बारे सिक्नेछन्।` : `Students will learn about “${title}”.`,
        activities: lang === 'ne' ? 'सस्वर वाचन, चित्र छलफल र कापीमा लेखन अभ्यास।' : 'Reading aloud, picture talk and copy-writing practice.',
        homework: lang === 'ne' ? 'कापीमा लेखन अभ्यास गर्ने।' : 'Practise writing in the copy.', status: isPast ? 'TAUGHT' : 'PLANNED'
      }, 'teaching diary entries');
    }
  }

  /* ---- 8. student remarks and interventions ---- */
  for (const s of secs) {
    for (const st of s.students) {
      const lang = s.lang;
      const r = rng(`rem|${st.user.username}`);
      const a = s.allocs[Math.floor(r() * s.allocs.length)];
      if (st.ability >= 75 && r() < 0.6 && a) await ensure(m.StudentRemark, { studentId: st.user._id, teacherId: a.teacher._id, text: REMARKS.praise[lang][Math.floor(r() * 3)] }, { institutionId: inst._id, sectionId: s.doc._id, centralSubjectId: a.subject._id, kind: 'REMARK', title: lang === 'ne' ? 'सकारात्मक टिप्पणी' : 'Positive remark' }, 'student remarks');
      if (st.ability < 60 && a) {
        await ensure(m.StudentRemark, { studentId: st.user._id, teacherId: a.teacher._id, text: REMARKS.help[lang][0] }, { institutionId: inst._id, sectionId: s.doc._id, centralSubjectId: a.subject._id, kind: 'REMARK', title: lang === 'ne' ? 'थप अभ्यास आवश्यक' : 'Needs extra practice' }, 'student remarks');
        if (st.ability < 45 && s.classTeacher) await ensure(m.StudentRemark, { studentId: st.user._id, teacherId: s.classTeacher._id, text: lang === 'ne' ? 'हप्ताको दुई दिन विशेष कक्षा राखिएको छ र अभिभावकसँग छलफल गरिएको छ।' : 'Two extra support classes per week arranged and discussed with the guardian.' }, { institutionId: inst._id, sectionId: s.doc._id, centralSubjectId: null, kind: 'INTERVENTION', title: lang === 'ne' ? 'सहयोग योजना' : 'Support plan' }, 'student interventions');
      }
      if (st.present < 0.8 && s.classTeacher) await ensure(m.StudentRemark, { studentId: st.user._id, teacherId: s.classTeacher._id, text: REMARKS.help[lang][2] }, { institutionId: inst._id, sectionId: s.doc._id, centralSubjectId: null, kind: 'REMARK', title: lang === 'ne' ? 'उपस्थितिबारे' : 'About attendance' }, 'student remarks');
      if (s.classTeacher && st.roll === 1) await ensure(m.StudentRemark, { studentId: st.user._id, teacherId: s.classTeacher._id, text: lang === 'ne' ? 'कक्षा नेताको रूपमा राम्रो जिम्मेवारी निर्वाह गर्छ।' : 'Takes good responsibility as class monitor.' }, { institutionId: inst._id, sectionId: s.doc._id, centralSubjectId: null, kind: 'REMARK', title: lang === 'ne' ? 'कक्षा नेता' : 'Class monitor' }, 'student remarks');
    }
  }

  /* ---- 9. announcements, notifications, calendar ---- */
  for (const s of secs) {
    const lang = s.lang;
    const className = `Grade 1 - Section ${s.doc.name}`;
    const author = s.classTeacher;
    const classAnns: Array<{ title: string; content: string; priority: string; day: number; aud: string }> = lang === 'ne' ? [
      { title: 'अभिभावक–शिक्षक भेला: कक्षा १', content: 'कक्षा १ का अभिभावकहरूको भेला शनिबार बिहान १० बजे कक्षाकोठामा हुनेछ। कृपया उपस्थित हुनुहोला।', priority: 'HIGH', day: -4, aud: 'ALL' },
      { title: 'पहिलो इकाई परीक्षाको नतिजा प्रकाशित', content: 'पहिलो इकाई परीक्षाको नतिजा विद्यार्थी पोर्टलमा हेर्न सकिन्छ।', priority: 'NORMAL', day: -13, aud: 'STUDENTS' },
      { title: 'शुक्रबार रङ्गीन पेन्सिल ल्याउनुहोस्', content: 'शुक्रबार चित्रकला अभ्यास हुने भएकाले रङ्गीन पेन्सिल र कापी ल्याउनुहोस्।', priority: 'NORMAL', day: -2, aud: 'STUDENTS' }
    ] : [
      { title: 'Parent–Teacher Meeting: Class 1', content: 'A parent–teacher meeting for Class 1 will be held on Saturday at 10:00 AM in the classroom. Please attend.', priority: 'HIGH', day: -4, aud: 'ALL' },
      { title: 'Unit Test 1 results are published', content: 'Unit Test 1 results are now available in the student portal. Please check your child’s marks.', priority: 'NORMAL', day: -13, aud: 'STUDENTS' },
      { title: 'Bring colour pencils on Friday', content: 'We will do a drawing activity on Friday. Please bring colour pencils and your copy.', priority: 'NORMAL', day: -2, aud: 'STUDENTS' }
    ];
    for (const an of classAnns) if (author) await ensure(m.SchoolAnnouncement, { institutionId: inst._id, title: an.title, sectionId: s.doc._id }, {
      content: an.content, targetAudience: an.aud, publishedBy: author._id, publishedAt: dayAt(addDays(today, an.day), 5), announcementType: 'CLASS_OVERALL', className, authorRole: 'CLASS_TEACHER', authorName: author.fullName, priority: an.priority
    }, 'announcements');
    for (const a of s.allocs) {
      const c = CONTENT[a.code]; if (!c) continue; const sl: Lang = c.fixedLang || lang;
      await ensure(m.SchoolAnnouncement, { institutionId: inst._id, title: sl === 'ne' ? `${c.short}: कार्यपत्र साझा गरियो` : `${c.short}: worksheet shared`, sectionId: s.doc._id }, {
        content: sl === 'ne' ? 'आजको अभ्यास पाना ‘नोट्स’ मा साझा गरिएको छ। कृपया गृहकार्य पूरा गर्नुहोस्।' : 'Today’s worksheet has been shared under Notes. Please complete the homework.',
        targetAudience: 'STUDENTS', publishedBy: a.teacher._id, publishedAt: dayAt(addDays(today, -3), 6), announcementType: 'SUBJECT_SPECIFIC', subjectId: a.subject._id, subjectName: a.subject.name, className, authorRole: 'TEACHER', authorName: a.teacher.fullName, priority: 'NORMAL'
      }, 'announcements');
    }

    // student notifications
    for (const st of s.students) {
      const n = (type: string, title: string, message: string, day: number, read: boolean, priority = 'NORMAL', meta: any = {}) =>
        ensure(m.Notification, { recipientId: st.user._id, title, type }, { institutionId: inst._id, message, priority, isRead: read, readAt: read ? dayAt(addDays(today, day + 1), 6) : undefined, metadata: meta, createdAt: dayAt(addDays(today, day), 5) }, 'notifications');
      await n('MARKS_PUBLISHED', lang === 'ne' ? 'पहिलो इकाई परीक्षाको नतिजा' : 'Unit Test 1 results published', lang === 'ne' ? 'तपाईंको पहिलो इकाई परीक्षाको नतिजा हेर्न सकिन्छ।' : 'Your Unit Test 1 marks are now available.', -13, true, 'HIGH');
      const upcoming = s.allocs.map((a) => CONTENT[a.code]).filter(Boolean)[0];
      if (upcoming) await n('ASSIGNMENT_NEW', lang === 'ne' ? 'नयाँ गृहकार्य थपियो' : 'New homework added', lang === 'ne' ? 'चार विषयमा नयाँ गृहकार्य थपिएको छ। म्याद: ६ दिनभित्र।' : 'New homework has been added in all four subjects. Due in 6 days.', -2, st.ability > 70);
      await n('ANNOUNCEMENT', classAnns[0].title, classAnns[0].content, -4, st.ability > 60);
      if (st.present < 0.8) await n('ATTENDANCE_WARNING', lang === 'ne' ? 'उपस्थिति कम छ' : 'Low attendance warning', lang === 'ne' ? 'यो महिना तपाईंको उपस्थिति ८०% भन्दा कम छ। कृपया नियमित आउनुहोस्।' : 'Your attendance this month is below 80%. Please attend regularly.', -1, false, 'HIGH');
    }
  }
  // teacher notifications
  const teacherSet = new Map<string, any>();
  secs.forEach((s) => { s.allocs.forEach((a) => teacherSet.set(String(a.teacher._id), a.teacher)); if (s.classTeacher) teacherSet.set(String(s.classTeacher._id), s.classTeacher); });
  for (const t of teacherSet.values()) {
    await ensure(m.Notification, { recipientId: t._id, title: 'Monthly Test marks entry', type: 'SYSTEM_ALERT' }, { institutionId: inst._id, message: 'Please complete Class 1 Monthly Test (Mangsir) marks entry and submit it to the class teacher.', priority: 'HIGH', isRead: false, createdAt: dayAt(addDays(today, -3), 5) }, 'notifications');
    await ensure(m.Notification, { recipientId: t._id, title: 'Homework submissions waiting', type: 'ASSIGNMENT_DEADLINE' }, { institutionId: inst._id, message: 'New student submissions for Class 1 homework are waiting for your review.', priority: 'NORMAL', isRead: false, createdAt: dayAt(addDays(today, -1), 5) }, 'notifications');
  }
  const events = [
    { title: 'Class 1 Art & Handwriting Competition', date: '2026-11-20', term: 'FIRST', type: 'MILESTONE', description: 'Inter-section handwriting and drawing competition for Class 1.' },
    { title: 'Class 1 Unit Test 2', date: '2026-11-24', term: 'FIRST', type: 'EXAMINATION', description: 'Second unit test for Class 1 (all four subjects).' },
    { title: 'Parent–Teacher Meeting (Class 1–3)', date: addDays(today, 5), term: 'FIRST', type: 'MEETING', description: 'Meet class teachers and discuss progress.' },
    { title: 'Annual Sports Day', date: '2026-12-05', term: 'SECOND', type: 'MILESTONE', description: 'Sports day for all classes.' },
    { title: 'Second Terminal Examination begins', date: '2026-12-15', term: 'SECOND', type: 'EXAMINATION', description: 'Second terminal examination 2083.' },
    { title: 'Winter vacation begins', date: '2026-12-28', term: 'SECOND', type: 'HOLIDAY', description: 'School closed for winter vacation.' },
    { title: 'Saraswati Puja (Basanta Panchami)', date: '2027-02-11', term: 'THIRD', type: 'HOLIDAY', description: 'School holiday.' }
  ];
  const admin: any = await m.User.findOne({ institutionId: inst._id, role: 'SCHOOL_ADMIN' });
  for (const e of events) await ensure(m.CalendarEvent, { institutionId: inst._id, title: e.title, date: e.date }, { term: e.term, type: e.type, description: e.description, createdBy: admin && admin._id }, 'calendar events');

  /* ---- 10. smart-board lesson logs + absence notices ---- */
  for (const s of secs) for (const a of s.allocs) {
    const c = CONTENT[a.code]; if (!c) continue; const lang: Lang = c.fixedLang || s.lang;
    const tb: any = await m.Textbook.findOne({ subjectId: a.subject._id, gradeNumber: 1, language: lang === 'ne' ? 'Nepali' : 'English' }).select('_id');
    for (const [i, off] of [-5, -3, -1].entries()) {
      const startDay = addDays(today, off);
      if (isSat(startDay)) continue;
      const start = dayAt(startDay, 4 + (s.allocs.indexOf(a) % 3), 15);
      await ensure(m.ClassroomSession, { teacherId: a.teacher._id, sectionId: s.doc._id, subjectId: a.subject._id, lessonTitle: pick(c.chapters[Math.min(i, c.chapters.length - 1)], lang) }, {
        institutionId: inst._id, classId: cls._id, textbookId: tb && tb._id, chapterNumber: Math.min(i, c.chapters.length - 1) + 1, chapterTitle: pick(c.chapters[Math.min(i, c.chapters.length - 1)], lang),
        sessionStart: start, sessionEnd: new Date(start.getTime() + 38 * 60000), durationSeconds: 38 * 60, status: 'COMPLETED',
        resourcesUsed: [{ type: 'WHITEBOARD', name: 'Whiteboard', url: '', timeSpentSeconds: 1500 }, { type: 'TEXTBOOK', name: tb ? 'Textbook' : 'Lesson slides', url: '', timeSpentSeconds: 780 }], lessonCoverage: i < 2 ? 'FULL' : 'PARTIAL'
      }, 'smart-board lesson logs');
    }
  }
  for (const s of secs) {
    if (!s.classTeacher) continue;
    const days = weekdaySchoolDays(addDays(today, -4), today).slice(-2);
    for (const day of days) {
      const sess: any = await m.AttendanceSession.findOne({ sectionId: s.doc._id, periodNumber: 1, date: { $gte: dayAt(addDays(day, -1), 18, 15), $lte: dayAt(day, 18, 14) } });
      if (!sess) continue;
      const rec: any = await m.AttendanceRecord.findOne({ sessionId: sess._id });
      for (const r of (rec && rec.records) || []) {
        if (r.status !== 'ABSENT') continue;
        const st = s.students.find((x) => String(x.user._id) === String(r.studentId)); if (!st) continue;
        const guardian = st.enr.guardianName || 'Guardian';
        await ensure(m.AbsenceNotice, { studentId: st.user._id, date: dayAt(day) }, {
          institutionId: inst._id, sectionId: s.doc._id, sentBy: s.classTeacher._id, batchId: `c1-${s.doc.name}-${day}`, guardianName: guardian, phone: st.enr.guardianPhone || '', language: s.lang,
          message: s.lang === 'ne' ? `आदरणीय ${guardian}, ${st.user.fullNameNepali || st.user.fullName} आज विद्यालयमा अनुपस्थित हुनुभयो। कृपया कक्षाशिक्षकलाई जानकारी गराउनुहोला।` : `Dear ${guardian}, ${st.user.fullName} was absent from school on ${day}. Please inform the class teacher.`,
          channels: ['IN_APP'], smsStatus: 'PREPARED', inAppStatus: 'SENT'
        }, 'absence notices');
      }
    }
  }

  /* ---- summary ---- */
  console.log('\n✔ Done. Records created in this run (0 = already present):');
  const keys = Object.keys(stats);
  if (!keys.length) console.log('   (nothing new — Class 1 demo data already complete)');
  keys.sort().forEach((k) => console.log(`   ${String(stats[k]).padStart(5)}  ${k}`));
  await disconnectDB();
}

main().catch(async (e) => { console.error('\n✖ Seed failed:', e); try { await disconnectDB(); } catch (_) { /* ignore */ } process.exit(1); });
