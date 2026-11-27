/**
 * Registers the Class 2 Mathematics simulations (2D, one or two per lesson of "My Mathematics, Grade 2").
 * Code: frontend/src/simulations/class2-math/. Safe to run again: it updates by `code`.
 *   npm run seed:class2-math
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

const SimulationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, title: { type: String, required: true }, titleNepali: String,
    description: { type: String, required: true }, descriptionNepali: String, subjectCode: { type: String, required: true }, subjectName: { type: String, required: true },
    gradeLevels: [{ type: Number, required: true }], chapterNumber: Number, chapterName: String, chapterNameNepali: String,
    simulationType: { type: String, enum: ['HTML5_CANVAS', 'PHASER', 'REACT_CANVAS', 'HTML5_CANVAS', 'WEB_GL'], default: 'REACT_CANVAS' },
    componentKey: String, runtimeUrl: String, difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
    estimatedDurationMinutes: { type: Number, default: 15 }, learningObjectives: [String], learningObjectivesNepali: [String],
    isPublished: { type: Boolean, default: true }, currentVersion: { type: String, default: '1.0.0' }, tags: [String],
  },
  { timestamps: true }
);
const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', SimulationSchema);

const LESSONS: Record<number, [string, string]> = {
  1: ['Capacity', 'धारिता'], 2: ['Time', 'समय'], 3: ['Numbers up to 1000', '१००० सम्मका सङ्ख्या'], 4: ['Comparison of Numbers', 'सङ्ख्याको तुलना'], 5: ['Odd and Even Numbers', 'जोर र बिजोर सङ्ख्या'],
  6: ['Weight', 'तौल'], 7: ['Addition', 'जोड'], 8: ['Subtraction', 'घटाउ'], 9: ['Length', 'लम्बाइ'], 10: ['Area', 'क्षेत्रफल'], 11: ['Multiplication 1', 'गुणन १'], 12: ['Fraction', 'भिन्न'],
  13: ['Geometric Shapes', 'ज्यामितीय आकार'], 14: ['Pictograph and Table', 'चित्रचार्ट र तालिका'], 15: ['Currency', 'मुद्रा'], 16: ['Multiplication 2', 'गुणन २'], 17: ['Division', 'भाग'],
};
// code, key, lesson, title, titleNp, description, descriptionNp, objectives, objectivesNp, tags
type S = [string, string, number, string, string, string, string, string[], string[], string[]];
const SIMS: S[] = [
  ['SIM-MATH-G2-L1-01', 'class2-math-l1-pour', 1, 'Pour and Count', 'खन्याऔँ र गनौँ', 'Fill a big jar with a small pitcher and count the pours; compare two glasses by pouring into equal cups.', 'सानो ज्यागले ठूलो भाँडो भरेर खन्याएको गन्ने; दुई गिलास बराबर कपमा खन्याएर तुलना गर्ने।', ['Compare capacity', 'Measure capacity with a small unit', 'Use more, less and equal'], ['धारिता तुलना गर्ने', 'सानो एकाइले धारिता नाप्ने', 'बढी, कम र बराबर प्रयोग गर्ने'], ['Capacity']],
  ['SIM-MATH-G2-L2-01', 'class2-math-l2-clock', 2, 'Clock Workshop', 'घडी कार्यशाला', 'A big clock: o\'clock, half past, quarter past and quarter to; set the clock yourself.', 'ठूलो ३डी घडी: ठीक बज्ने, साढे, सवा र पौने; आफैँ घडी मिलाउने।', ['Read the time to the quarter hour', 'Know the hour and minute hands'], ['पाउने घण्टासम्म समय पढ्ने', 'घण्टा र मिनेटका सुई चिन्ने'], ['Clock']],
  ['SIM-MATH-G2-L2-02', 'class2-math-l2-calendar', 2, 'Calendar Town', 'पात्रो सहर', 'Twelve month houses in a ring: days in each month, order of the months, the year.', 'चक्रमा १२ महिनाका घर: प्रत्येक महिनाका दिन, महिनाको क्रम र वर्ष।', ['Name the 12 months', 'Know days in each month', 'Order the months'], ['१२ महिनाका नाम भन्ने', 'प्रत्येक महिनाका दिन जान्ने', 'महिनाको क्रम मिलाउने'], ['Months', 'Calendar']],
  ['SIM-MATH-G2-L3-01', 'class2-math-l3-thousand-town', 3, 'Thousand Town', 'हजार सहर', 'Build any number to 999 with hundred flats, ten towers and one cubes. Ten ones bundle into a ten; ten tens into a hundred.', 'सय फ्ल्याट, दशक टावर र एकाइ घनले ९९९ सम्मका सङ्ख्या बनाउने।', ['Read and write 3-digit numbers', 'Place value: hundreds, tens, ones', 'Count in hundreds'], ['तीन अङ्कका सङ्ख्या पढ्ने र लेख्ने', 'स्थानमान: सय, दशक, एकाइ', 'सय सयले गन्ने'], ['Place value']],
  ['SIM-MATH-G2-L3-02', 'class2-math-l3-hop-1000', 3, 'Hopping Frog', 'उफ्रने भ्यागुता', 'A frog hops on stepping stones by 1, 10 or 100 to count up to 1000.', 'भ्यागुता १, १० वा १०० का दरले उफ्रँदै १००० सम्म गन्छ।', ['Skip count by 10 and 100', 'Find the next number in a pattern'], ['१० र १०० ले गन्ने', 'ढाँचामा अर्को सङ्ख्या पत्ता लगाउने'], ['Skip counting']],
  ['SIM-MATH-G2-L4-01', 'class2-math-l4-seesaw', 4, 'Number Seesaw', 'सङ्ख्याको झुला', 'The bigger number pulls its side of a seesaw down. Choose >, < or =.', 'ठूलो सङ्ख्याको तर्फ झुला तल झर्छ। >, < वा = रोज्ने।', ['Compare 3-digit numbers', 'Use >, < and ='], ['तीन अङ्कका सङ्ख्या तुलना गर्ने', '>, < र = प्रयोग गर्ने'], ['Comparison']],
  ['SIM-MATH-G2-L4-02', 'class2-math-l4-order-balloons', 4, 'Order the Balloons', 'बेलुन मिलाऔँ', 'Tap balloons from the smallest to the biggest (ascending) or biggest to smallest (descending).', 'बेलुनलाई सानोदेखि ठूलो वा ठूलोदेखि सानो क्रममा छुने।', ['Arrange numbers in ascending order', 'Arrange numbers in descending order'], ['बढ्दो क्रममा मिलाउने', 'घट्दो क्रममा मिलाउने'], ['Ordering']],
  ['SIM-MATH-G2-L5-01', 'class2-math-l5-odd-even-machine', 5, 'Odd-Even Machine', 'जोर–बिजोर मेसिन', 'Numbered crates ride a belt; look at the last digit and send each to the Even or Odd bin.', 'सङ्ख्या लेखिएका बाकस बेल्टमा आउँछन्; अन्तिम अङ्क हेरी जोर वा बिजोर डब्बामा पठाउने।', ['Tell odd and even numbers up to 100', 'Use the last digit rule'], ['१०० सम्म जोर र बिजोर छुट्याउने', 'अन्तिम अङ्कको नियम प्रयोग गर्ने'], ['Odd', 'Even']],
  ['SIM-MATH-G2-L6-01', 'class2-math-l6-weigh-it', 6, 'Weigh It', 'तौलौँ', 'A balance: the heavier side goes down; balance an object with 1, 2 and 5 kg weights.', '३डी तराजु: भारी तर्फ तल झर्छ; १, २ र ५ केजीका तौलले वस्तु सन्तुलन गर्ने।', ['Compare heavy and light', 'Measure weight in kg'], ['भारी र हलुका तुलना गर्ने', 'केजीमा तौल नाप्ने'], ['Weight']],
  ['SIM-MATH-G2-L7-01', 'class2-math-l7-add-town', 7, 'Add Town', 'जोड सहर', 'Join two 3-digit numbers made of blocks; bundle ten ones into a ten and ten tens into a hundred.', 'ब्लकले बनेका दुई तीन अङ्कका सङ्ख्या जोड्ने; १० एकाइ र १० दशक बाँध्ने।', ['Add 3-digit numbers', 'Carry over (regroup)'], ['तीन अङ्कका सङ्ख्या जोड्ने', 'हातेमा (regrouping) बुझ्ने'], ['Addition', 'Regrouping']],
  ['SIM-MATH-G2-L8-01', 'class2-math-l8-take-away-town', 8, 'Take Away Town', 'घटाउ सहर', 'Take blocks away from a 3-digit number; break a hundred or a ten when there are not enough.', 'तीन अङ्कको सङ्ख्याबाट ब्लक हटाउने; नपुगे सय वा दशक फुकाउने।', ['Subtract 3-digit numbers', 'Borrow (regroup)'], ['तीन अङ्कका सङ्ख्या घटाउने', 'सापटी (regrouping) बुझ्ने'], ['Subtraction', 'Borrowing']],
  ['SIM-MATH-G2-L9-01', 'class2-math-l9-ruler', 9, 'Ruler Workshop', 'रुलर कार्यशाला', 'Read centimetres on a big ruler, start from 0, slide objects, compare lengths.', 'ठूलो ३डी रुलरमा सेन्टिमिटर पढ्ने, ० बाट सुरु गर्ने, वस्तु सार्ने र लम्बाइ तुलना गर्ने।', ['Measure length in cm', 'Compare two lengths'], ['सेमीमा लम्बाइ नाप्ने', 'दुई लम्बाइ तुलना गर्ने'], ['Length', 'Ruler']],
  ['SIM-MATH-G2-L10-01', 'class2-math-l10-tiles', 10, 'Tile the Floor', 'टाइल बिछ्याऔँ', 'Cover a shape with square tiles and count them; draw your own shape; compare two areas.', 'आकारलाई वर्ग टाइलले छोपेर गन्ने; आफ्नै आकार बनाउने; दुई क्षेत्रफल तुलना गर्ने।', ['Find area by counting squares', 'Compare areas'], ['वर्ग गनेर क्षेत्रफल पत्ता लगाउने', 'क्षेत्रफल तुलना गर्ने'], ['Area']],
  ['SIM-MATH-G2-L11-01', 'class2-math-l11-equal-groups', 11, 'Equal Groups Garden', 'बराबर समूह बगैँचा', 'Baskets with the same number of apples: 3 + 3 + 3 = 3 × 3.', 'बराबर स्याउ भएका टोकरी: ३ + ३ + ३ = ३ × ३।', ['Make equal groups', 'Link repeated addition to multiplication'], ['बराबर समूह बनाउने', 'दोहोरिएको जोडलाई गुणनसँग जोड्ने'], ['Multiplication']],
  ['SIM-MATH-G2-L11-02', 'class2-math-l11-tables-frog', 11, 'Tables Frog', 'पहाडा भ्यागुता', 'A frog hops by 2, 3, 4, 5 or 10: k hops of s is k × s. Learn the tables.', 'भ्यागुता २, ३, ४, ५ वा १० का दरले उफ्रन्छ: k पटक s = k × s। पहाडा सिक्ने।', ['Skip count in 2, 3, 4, 5, 10', 'Learn multiplication tables'], ['२, ३, ४, ५, १० ले गन्ने', 'गुणन पहाडा सिक्ने'], ['Tables']],
  ['SIM-MATH-G2-L12-01', 'class2-math-l12-fraction-pizza', 12, 'Fraction Pizza', 'भिन्न पिज्जा', 'Cut a pizza into equal slices, shade some and read the fraction: ½, ⅓, ¼, ¾.', 'पिज्जालाई बराबर टुक्रामा काटेर केही रङ्ग लगाउने र भिन्न पढ्ने: ½, ⅓, ¼, ¾।', ['Understand equal parts', 'Read and write simple fractions'], ['बराबर भाग बुझ्ने', 'सरल भिन्न पढ्ने र लेख्ने'], ['Fractions']],
  ['SIM-MATH-G2-L13-01', 'class2-math-l13-solids', 13, 'Solid Shapes Workshop', 'ठोस आकार कार्यशाला', 'Spin a cube, cuboid, sphere, cylinder, cone and pyramid; count faces, edges and corners; roll or slide?', 'घन, घनाभ, गोला, बेलना, शङ्कु र पिरामिड घुमाएर फेस, किनारा र कुना गन्ने; गुड्छ कि चिप्लन्छ?', ['Name solid shapes', 'Count faces, edges and corners'], ['ठोस आकारका नाम भन्ने', 'फेस, किनारा र कुना गन्ने'], ['3D shapes']],
  ['SIM-MATH-G2-L13-02', 'class2-math-l13-flat-shapes', 13, 'Flat Shapes Builder', 'सतही आकार बनाऔँ', 'Shapes made of sticks and balls: tap each side and corner to count; triangle, square, rectangle, pentagon, hexagon, circle.', 'सिन्का र बलले बनेका आकार: भुजा र कुना छोएर गन्ने; त्रिभुज, वर्ग, आयत, पञ्चभुज, षड्भुज, गोलो।', ['Name flat shapes', 'Count sides and corners'], ['सतही आकारका नाम भन्ने', 'भुजा र कुना गन्ने'], ['2D shapes']],
  ['SIM-MATH-G2-L14-01', 'class2-math-l14-tally', 14, 'Tally and Pictograph', 'ट्याली र चित्रचार्ट', 'Children vote for a pet; tally marks, a table and a pictograph grow together. Read most, fewest and total.', 'बच्चाहरूले घरपालुवा जनावरमा मत दिन्छन्; ट्याली, तालिका र चित्रचार्ट सँगै बन्छ।', ['Make and read a tally chart', 'Read a pictograph and a table'], ['ट्याली चार्ट बनाउने र पढ्ने', 'चित्रचार्ट र तालिका पढ्ने'], ['Pictograph', 'Tally']],
  ['SIM-MATH-G2-L15-01', 'class2-math-l15-rupee-market', 15, 'Rupee Market', 'रुपैयाँ बजार', 'Buy goods with Nepali notes and coins up to Rs 1000: pay exactly, add prices, find the change.', 'नेपाली नोट र सिक्काले १००० रुपैयाँसम्मका सामान किन्ने: ठीक रकम तिर्ने, मूल्य जोड्ने, फिर्ता पत्ता लगाउने।', ['Use notes and coins up to Rs 1000', 'Add prices and find change'], ['१००० रुपैयाँसम्मका नोट र सिक्का प्रयोग गर्ने', 'मूल्य जोड्ने र फिर्ता निकाल्ने'], ['Money', 'Currency']],
  ['SIM-MATH-G2-L16-01', 'class2-math-l16-arrays', 16, 'Array Builder', 'पङ्क्ति र स्तम्भ', 'Rows and columns of cubes build the multiplication tables; swap rows and columns (a × b = b × a).', 'घनका पङ्क्ति र स्तम्भले गुणन पहाडा बनाउँछन्; पङ्क्ति र स्तम्भ साट्दा उत्तर उही।', ['Multiply using arrays', 'Know a × b = b × a'], ['पङ्क्ति–स्तम्भबाट गुणन गर्ने', 'a × b = b × a जान्ने'], ['Multiplication', 'Arrays']],
  ['SIM-MATH-G2-L17-01', 'class2-math-l17-sharing', 17, 'Sharing Party', 'बराबर बाँडौँ', 'Share sweets equally among animal friends: 12 ÷ 3 = 4.', 'जनावर साथीहरूलाई मिठाई बराबर बाँड्ने: १२ ÷ ३ = ४।', ['Share equally', 'Write a division sentence'], ['बराबर बाँड्ने', 'भागको वाक्य लेख्ने'], ['Division']],
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  for (const [code, key, ch, title, titleNp, desc, descNp, obj, objNp, tags] of SIMS) {
    const [chEn, chNp] = LESSONS[ch];
    const doc = {
      code, title, titleNepali: titleNp, description: desc, descriptionNepali: descNp, subjectCode: 'MATH', subjectName: 'Mathematics', gradeLevels: [2],
      chapterNumber: ch, chapterName: chEn, chapterNameNepali: chNp, simulationType: 'HTML5_CANVAS', componentKey: key, runtimeUrl: `/simulations/class2-math/l${ch}/${key}`,
      difficulty: 'BEGINNER', estimatedDurationMinutes: 15, learningObjectives: obj, learningObjectivesNepali: objNp, isPublished: true, currentVersion: '1.0.0',
      tags: ['Class 2', 'Mathematics', `Lesson ${ch}`, ...tags, 'Learn · Play · Challenge'],
    };
    await Simulation.findOneAndUpdate({ code }, { $set: doc }, { upsert: true });
    console.log(`[OK] ${code}  ${title}`);
  }
  console.log(`Done: ${SIMS.length} simulations registered for Class 2 Mathematics.`);
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
