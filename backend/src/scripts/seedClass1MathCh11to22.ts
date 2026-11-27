/**
 * Registers the Class 1 Mathematics simulations for chapters 11–22 (the simulations built on the shared kit in
 * frontend/src/simulations/class1-math-kit). Safe to run again: it updates by `code`.
 *   npm run seed:class1-math-ch11-22
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

const SimulationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    titleNepali: String,
    description: { type: String, required: true },
    descriptionNepali: String,
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    gradeLevels: [{ type: Number, required: true }],
    chapterNumber: Number,
    chapterName: String,
    chapterNameNepali: String,
    simulationType: { type: String, enum: ['HTML5_CANVAS', 'PHASER', 'REACT_CANVAS', 'HTML5_CANVAS', 'WEB_GL'], default: 'REACT_CANVAS' },
    componentKey: String,
    runtimeUrl: String,
    difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
    estimatedDurationMinutes: { type: Number, default: 15 },
    learningObjectives: [String],
    learningObjectivesNepali: [String],
    isPublished: { type: Boolean, default: true },
    currentVersion: { type: String, default: '1.0.0' },
    tags: [String],
  },
  { timestamps: true }
);
const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', SimulationSchema);

interface S { code: string; key: string; ch: number; chEn: string; chNp: string; title: string; titleNp: string; desc: string; descNp: string; obj: string[]; objNp: string[]; tags: string[]; minutes?: number }
const SIMS: S[] = [
  { code: 'SIM-MATH-G1-CH11-01', key: 'class1-math-ch11-birds', ch: 11, chEn: 'Subtraction of numbers up to 20', chNp: '२० सम्मका सङ्ख्याको घटाउ',
    title: 'Fly-Away Birds', titleNp: 'चरा उडे!', desc: 'Birds sit on an interactive garden wall. Tap a bird and it flies away, so children see subtraction as taking away. Learn with guided stories, play freely, then take the challenge.',
    descNp: '३डी पर्खालमा चराहरू बसेका छन्। चरालाई छुँदा उड्छ — यसरी बच्चाले घटाउ भनेको हटाउनु हो भनी देख्छन्।',
    obj: ['Understand subtraction as taking away', 'Subtract within 20 using objects', 'Read and write 15 − 6 = 9'], objNp: ['घटाउ भनेको हटाउनु हो भनी बुझ्ने', 'वस्तुको सहायताले २० भित्रको घटाउ गर्ने', '१५ − ६ = ९ पढ्ने र लेख्ने'], tags: ['Subtraction', 'Take away'] },
  { code: 'SIM-MATH-G1-CH12-01', key: 'class1-math-ch12-pairs', ch: 12, chEn: 'Odd and Even numbers', chNp: 'जोर र बिजोर सङ्ख्या',
    title: 'Pairing Party', titleNp: 'जोडी बनाऔँ', desc: 'Balls line up in two columns. Make pairs with ribbons: if nobody is left alone the number is even, if one is left alone it is odd. Works for 1 to 20.',
    descNp: 'बलहरू दुई लहरमा बस्छन्। रिबनले जोडी बनाउँदा कोही एक्लो भएन भने जोर, एउटा एक्लो भयो भने बिजोर।',
    obj: ['Make pairs to test a number', 'Tell odd and even numbers up to 20', 'Notice odd/even in the number line'], objNp: ['जोडी बनाएर सङ्ख्या जाँच्ने', '२० सम्म जोर र बिजोर छुट्याउने', 'जोर–बिजोरको ढाँचा चिन्ने'], tags: ['Odd', 'Even', 'Pairs'] },
  { code: 'SIM-MATH-G1-CH13-01', key: 'class1-math-ch13-names', ch: 13, chEn: 'Number names up to 20', chNp: '२० सम्मका सङ्ख्याका नाम',
    title: 'Number Name Blocks', titleNp: 'सङ्ख्याको नाम बनाऔँ', desc: 'See the amount and the numeral, then tap letter blocks in the right order to spell the number name (one to twenty).',
    descNp: 'सङ्ख्या र वस्तुको मात्रा हेरेर ३डी अक्षर ब्लक क्रमैसँग छोएर सङ्ख्याको नाम बनाउने (one देखि twenty सम्म)।',
    obj: ['Read number names up to twenty', 'Spell number names', 'Match numerals with number names'], objNp: ['२० सम्मका सङ्ख्याका नाम पढ्ने', 'सङ्ख्याका नाम हिज्जे गर्ने', 'अङ्क र नाम मिलाउने'], tags: ['Number names', 'Spelling'] },
  { code: 'SIM-MATH-G1-CH14-01', key: 'class1-math-ch14-race', ch: 14, chEn: 'Ordinal numbers', chNp: 'क्रमसूचक सङ्ख्या',
    title: 'Race Day', titleNp: 'दौड प्रतियोगिता', desc: 'Ten animal friends race on an interactive track. Their finishing order teaches 1st, 2nd, 3rd up to 10th. Tap an animal to hear its place.',
    descNp: 'दस वटा जनावर ३डी ट्र्याकमा दौडिन्छन्। उनीहरू पुगेको क्रमले पहिलो, दोस्रो, तेस्रो … दसौँ सिकाउँछ।',
    obj: ['Use first to tenth', 'Tell the position of an object', 'Match ordinal words with 1st, 2nd, 3rd'], objNp: ['पहिलोदेखि दसौँसम्म प्रयोग गर्ने', 'वस्तुको स्थान भन्ने', 'क्रमसूचक शब्द र १ औँ, २ औँ मिलाउने'], tags: ['Ordinal', 'Position'] },
  { code: 'SIM-MATH-G1-CH15-01', key: 'class1-math-ch15-hundred', ch: 15, chEn: 'Numbers from 21 to 100', chNp: '२१ देखि १०० सम्मका सङ्ख्या',
    title: 'Hundred Village', titleNp: 'सय गाउँ', desc: 'Build any number from 21 to 100 with tens towers and one cubes. A glowing 100-cube wall shows where the number sits. Ten ones bundle into a ten.',
    descNp: 'दशकका टावर र एकाइका घनले २१ देखि १०० सम्मका सङ्ख्या बनाउने। १०० घनको भित्तामा सङ्ख्याको स्थान बल्छ।',
    obj: ['Count by tens to 100', 'Build 2-digit numbers as tens and ones', 'Read and write numbers to 100'], objNp: ['दश दशले १०० सम्म गन्ने', 'दुई अङ्कका सङ्ख्या दशक र एकाइमा बनाउने', '१०० सम्मका सङ्ख्या पढ्ने र लेख्ने'], tags: ['Place value', 'Tens and ones'] },
  { code: 'SIM-MATH-G1-CH16-01', key: 'class1-math-ch16-add-bundle', ch: 16, chEn: 'Addition up to the sum of 100', chNp: 'योगफल १०० सम्म आउने जोड',
    title: 'Add and Bundle', titleNp: 'जोडौँ र बाँधौँ', desc: 'Join two numbers made of blocks. When there are ten loose cubes they bundle into one new tower — regrouping made visible.',
    descNp: 'ब्लकले बनेका दुई सङ्ख्या जोड्ने। १० वटा छुट्टा घन भएपछि एउटा नयाँ दशकमा बाँधिन्छ।',
    obj: ['Add 2-digit numbers up to 100', 'Understand carrying (regrouping)', 'Add tens and ones separately'], objNp: ['१०० सम्मका दुई अङ्कका सङ्ख्या जोड्ने', 'हातेमा (regrouping) बुझ्ने', 'दशक र एकाइ छुट्टाछुट्टै जोड्ने'], tags: ['Addition', 'Regrouping'], minutes: 18 },
  { code: 'SIM-MATH-G1-CH17-01', key: 'class1-math-ch17-take-away', ch: 17, chEn: 'Subtraction of numbers up to two digits', chNp: 'दुई अङ्कसम्मका सङ्ख्याको घटाउ',
    title: 'Break and Take Away', titleNp: 'फुकाऔँ र घटाऔँ', desc: 'Take blocks away from a number. If there are not enough ones, break one tower into ten ones. Borrowing made visible.',
    descNp: 'सङ्ख्याबाट ब्लक हटाएर घटाउने। एकाइ नपुगे एउटा दशकलाई १० वटा एकाइमा फुकाउने।',
    obj: ['Subtract 2-digit numbers', 'Understand borrowing (regrouping)', 'Subtract ones before tens'], objNp: ['दुई अङ्कका सङ्ख्या घटाउने', 'सापटी (regrouping) बुझ्ने', 'पहिले एकाइ, पछि दशक घटाउने'], tags: ['Subtraction', 'Borrowing'], minutes: 18 },
  { code: 'SIM-MATH-G1-CH18-01', key: 'class1-math-ch18-cards', ch: 18, chEn: 'Devanagari numerals up to 100', chNp: '१०० सम्मका देवनागरी अङ्क',
    title: 'Nepali Number Cards', titleNp: 'नेपाली अङ्क कार्ड', desc: 'Flip an interactive card to see 37 become ३७. Play the memory-match game to pair English digits with Nepali digits.',
    descNp: '३डी कार्ड पल्टाएर 37 लाई ३७ बन्दै गरेको हेर्ने। अङ्ग्रेजी र नेपाली अङ्क जोडा मिलाउने मेमोरी खेल।',
    obj: ['Read and write Devanagari numerals 0–100', 'Match English and Nepali numerals', 'Name the digits in Nepali'], objNp: ['०–१०० सम्मका देवनागरी अङ्क पढ्ने र लेख्ने', 'अङ्ग्रेजी र नेपाली अङ्क मिलाउने', 'अङ्कहरूको नाम भन्ने'], tags: ['Devanagari', 'Numerals', 'Memory game'] },
  { code: 'SIM-MATH-G1-CH19-01', key: 'class1-math-ch19-week', ch: 19, chEn: 'Time', chNp: 'समय',
    title: 'Week Balloons', titleNp: 'हप्ताका बेलुन', desc: 'Seven colourful balloons float in a rainbow, one for each day of the week. Learn the order, sing the week and put the days in order.',
    descNp: 'हप्ताका सात दिनका सात रङ्गीन बेलुन। क्रम सिक्ने, हप्ता गाउने र बारहरू क्रमैसँग मिलाउने।',
    obj: ['Name the seven days', 'Say the first and last day', 'Tell which day comes before and after'], objNp: ['सात वारका नाम भन्ने', 'पहिलो र अन्तिम बार भन्ने', 'अगाडि र पछाडिको बार भन्ने'], tags: ['Days of the week', 'Time'] },
  { code: 'SIM-MATH-G1-CH19-02', key: 'class1-math-ch19-clock', ch: 19, chEn: 'Time', chNp: 'समय',
    title: 'Clock Tower', titleNp: 'घडी टावर', desc: 'A big clock with a moving sun and moon. Read o\'clock and half past, set the clock yourself and see morning, afternoon, evening and night.',
    descNp: 'सूर्य र चन्द्रमा सर्ने ठूलो ३डी घडी। ठीक बज्ने र साढे बज्ने समय पढ्ने, घडी मिलाउने र बिहान, दिउँसो, साँझ, रात चिन्ने।',
    obj: ['Read the hour and half hour', 'Know the short and long hands', 'Connect time with parts of the day'], objNp: ['घण्टा र आधा घण्टा पढ्ने', 'सानो र ठूलो सुई चिन्ने', 'समयलाई दिनका भागसँग जोड्ने'], tags: ['Clock', 'Time'] },
  { code: 'SIM-MATH-G1-CH20-01', key: 'class1-math-ch20-coins-notes', ch: 20, chEn: 'Coins and Notes', chNp: 'सिक्का र नोट',
    title: 'Coins and Notes Explorer', titleNp: 'सिक्का र नोट चिनौँ', desc: 'Nepali coins (Rs 1, 2, 5, 10) and notes (Rs 5, 10, 20, 50, 100) on an interactive table. Flip them, hear their value and make an amount.',
    descNp: 'नेपाली सिक्का (१, २, ५, १०) र नोट (५, १०, २०, ५०, १००) ३डी टेबलमा। पल्टाउने, मूल्य सुन्ने र रकम बनाउने।',
    obj: ['Recognise Nepali coins and notes', 'Know the value of each', 'Make an amount with coins and notes'], objNp: ['नेपाली सिक्का र नोट चिन्ने', 'प्रत्येकको मूल्य जान्ने', 'सिक्का र नोटले रकम बनाउने'], tags: ['Money', 'Rupees'] },
  { code: 'SIM-MATH-G1-CH20-02', key: 'class1-math-ch20-toy-shop', ch: 20, chEn: 'Coins and Notes', chNp: 'सिक्का र नोट',
    title: 'Toy Shop', titleNp: 'खेलौना पसल', desc: 'Choose a toy, read the price and pay the exact amount with Nepali coins and notes. Shopping practice with real values.',
    descNp: 'खेलौना रोज्ने, मूल्य पढ्ने र नेपाली सिक्का र नोटले ठीक रकम तिर्ने। वास्तविक मूल्यसँग किनमेल अभ्यास।',
    obj: ['Read a price', 'Pay an exact amount', 'Add coins and notes to a total'], objNp: ['मूल्य पढ्ने', 'ठीक रकम तिर्ने', 'सिक्का र नोट जोडेर जम्मा निकाल्ने'], tags: ['Money', 'Shopping'] },
  { code: 'SIM-MATH-G1-CH21-01', key: 'class1-math-ch21-measure', ch: 21, chEn: 'Length', chNp: 'लम्बाइ',
    title: 'Measure with Cubes', titleNp: 'घन राखेर नापौँ', desc: 'Line up cubes end to end beside a pencil, ribbon or stick to find its length. Compare two objects to find which is longer.',
    descNp: 'पेन्सिल, रिबन वा लौरोको छेउमा घन एकपछि अर्को राखेर लम्बाइ नाप्ने। दुई वस्तु तुलना गरी कुन लामो भन्ने।',
    obj: ['Measure with equal units', 'Compare lengths', 'Use longer and shorter'], objNp: ['बराबर एकाइले नाप्ने', 'लम्बाइ तुलना गर्ने', 'लामो र छोटो प्रयोग गर्ने'], tags: ['Length', 'Measurement'] },
  { code: 'SIM-MATH-G1-CH22-01', key: 'class1-math-ch22-pictograph', ch: 22, chEn: 'Pictograph', chNp: 'चित्रचार्ट',
    title: 'Fruit Basket Pictograph', titleNp: 'फलफूलको चित्रचार्ट', desc: 'Children vote for a favourite fruit; every vote becomes a fruit picture in an interactive chart. Read the chart: how many, which is most, which is least.',
    descNp: 'बच्चाहरूले मनपर्ने फल रोज्छन्; प्रत्येक मत ३डी चार्टमा फलको चित्र बन्छ। चार्ट पढ्ने: कति, कुन धेरै, कुन कम।',
    obj: ['Make a pictograph from data', 'Read a pictograph', 'Find most, least and total'], objNp: ['तथ्याङ्कबाट चित्रचार्ट बनाउने', 'चित्रचार्ट पढ्ने', 'धेरै, कम र जम्मा पत्ता लगाउने'], tags: ['Pictograph', 'Data'] },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  for (const s of SIMS) {
    const doc = {
      code: s.code, title: s.title, titleNepali: s.titleNp, description: s.desc, descriptionNepali: s.descNp,
      subjectCode: 'MATH', subjectName: 'Mathematics', gradeLevels: [1],
      chapterNumber: s.ch, chapterName: s.chEn, chapterNameNepali: s.chNp,
      simulationType: 'HTML5_CANVAS', componentKey: s.key, runtimeUrl: `/simulations/class1-math/ch${s.ch}/${s.key}`,
      difficulty: 'BEGINNER', estimatedDurationMinutes: s.minutes ?? 15,
      learningObjectives: s.obj, learningObjectivesNepali: s.objNp, isPublished: true, currentVersion: '1.0.0',
      tags: ['Class 1', 'Mathematics', `Chapter ${s.ch}`, ...s.tags, 'Learn · Play · Challenge'],
    };
    await Simulation.findOneAndUpdate({ code: s.code }, { $set: doc }, { upsert: true, new: true });
    console.log(`[OK] ${s.code}  ${s.title}`);
  }
  // the two older KPRIET Class 1 entries belong to Time and Money
  await Simulation.updateOne({ code: 'KP-g18-class1-time-chintu-day' }, { $set: { chapterNumber: 19, chapterName: 'Time', chapterNameNepali: 'समय' } });
  await Simulation.updateOne({ code: 'KP-g18-class1-currency-toy-shop' }, { $set: { chapterNumber: 20, chapterName: 'Coins and Notes', chapterNameNepali: 'सिक्का र नोट' } });
  console.log(`Done: ${SIMS.length} simulations registered for Class 1 Mathematics chapters 11–22.`);
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
