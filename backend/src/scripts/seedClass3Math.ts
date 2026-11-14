/**
 * Registers the Class 3 Mathematics simulations (3D, one to two per lesson of "My Mathematics, Grade 3").
 * Code: frontend/src/simulations/class3-math/. Safe to run again: it updates by `code`.
 *   npm run seed:class3-math
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
    simulationType: { type: String, enum: ['THREE_JS', 'PHASER', 'REACT_CANVAS', 'HTML5_CANVAS', 'WEB_GL'], default: 'REACT_CANVAS' },
    componentKey: String, runtimeUrl: String, difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
    estimatedDurationMinutes: { type: Number, default: 15 }, learningObjectives: [String], learningObjectivesNepali: [String],
    isPublished: { type: Boolean, default: true }, currentVersion: { type: String, default: '1.0.0' }, tags: [String],
  },
  { timestamps: true }
);
const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', SimulationSchema);

const LESSONS: Record<number, [string, string]> = {
  1: ['Time 1', 'समय १'], 2: ['Five-digit Numbers', 'पाँच अङ्कका सङ्ख्या'], 3: ['Comparison of Numbers', 'सङ्ख्याको तुलना'], 4: ["Number Patterns", 'सङ्ख्याको ढाँचा'], 5: ['Ascending and Descending Order', 'बढ्दो र घट्दो क्रम'],
  6: ['Local Numerals up to 20', 'स्थानीय अङ्क प्रणाली'], 7: ['Fraction', 'भिन्न'], 8: ['Length 1', 'लम्बाइ १'], 9: ['Lines', 'रेखा'], 10: ['Angles', 'कोण'], 11: ['Geometrical Shapes', 'ज्यामितीय आकार'],
  12: ['Addition', 'जोड'], 13: ['Subtraction', 'घटाउ'], 14: ['Multiplication', 'गुणन'], 15: ['Division', 'भाग'], 16: ['Time 2', 'समय २'], 17: ['Money', 'मुद्रा'], 18: ['Capacity', 'धारिता'],
  19: ['Length 2', 'लम्बाइ २'], 20: ['Weight', 'तौल'], 21: ['Pictograph', 'चित्रचार्ट'], 22: ['Area', 'क्षेत्रफल'],
};
// code, key, lesson, title, titleNp, description, descriptionNp, objectives, objectivesNp, tags
type S = [string, string, number, string, string, string, string, string[], string[], string[]];
const SIMS: S[] = [
  ['SIM-MATH-G3-L1-01', 'class3-math-l1-minute-clock', 1, 'Minute Clock', 'मिनेट घडी', 'Read any time on a big 3D clock: o\'clock, half past, quarter past, quarter to and every minute; one full turn of the long hand is 60 minutes.', 'ठूलो ३डी घडीमा कुनै पनि समय पढ्ने: ठीक बज्ने, साढे, सवा, पौने र हरेक मिनेट।', ['Read time to the minute', 'Hour hand and minute hand'], ['मिनेटसम्म समय पढ्ने', 'घण्टा र मिनेटको सुई'], ['Clock', 'Time']],
  ['SIM-MATH-G3-L2-01', 'class3-math-l2-five-digit', 2, 'Five-Digit Towers', 'पाँच अङ्कका टावर', 'Five columns of cubes (ten-thousands to ones): build, read and write numbers up to 99,999 and find place values.', 'पाँच स्तम्भका घनले ९९,९९९ सम्मका सङ्ख्या बनाउने, पढ्ने, लेख्ने र स्थानीय मान पत्ता लगाउने।', ['Read and write five-digit numbers', 'Place value and face value'], ['पाँच अङ्कका सङ्ख्या पढ्ने र लेख्ने', 'स्थानीय मान'], ['Place value']],
  ['SIM-MATH-G3-L3-01', 'class3-math-l3-digit-duel', 3, 'Digit Duel', 'अङ्कको द्वन्द्व', 'Two five-digit numbers stand in rows of cards; compare place by place from the left and choose >, < or =.', 'दुई पाँच अङ्कका सङ्ख्या कार्डमा राखेर बायाँबाट स्थानअनुसार तुलना गर्ने।', ['Compare five-digit numbers', 'Use >, < and ='], ['पाँच अङ्कका सङ्ख्या तुलना गर्ने', '>, < र = प्रयोग गर्ने'], ['Comparison']],
  ['SIM-MATH-G3-L4-01', 'class3-math-l4-pattern-train', 4, 'Pattern Train', 'ढाँचा रेल', 'A train of numbered wagons follows a rule (add or subtract the same number); find the missing wagon.', 'सङ्ख्या लेखिएका डिब्बाको रेल एउटै नियम पछ्याउँछ; हराएको डिब्बा पत्ता लगाउने।', ['Find the rule of a number pattern', 'Complete a pattern'], ['सङ्ख्या ढाँचाको नियम पत्ता लगाउने', 'ढाँचा पूरा गर्ने'], ['Patterns']],
  ['SIM-MATH-G3-L5-01', 'class3-math-l5-order-rockets', 5, 'Order the Rockets', 'रकेट मिलाऔँ', 'Tap rockets from the smallest to the biggest (ascending) or biggest to smallest (descending).', 'रकेटलाई सानोदेखि ठूलो वा ठूलोदेखि सानो क्रममा छुने।', ['Arrange numbers in ascending order', 'Arrange numbers in descending order'], ['बढ्दो क्रममा मिलाउने', 'घट्दो क्रममा मिलाउने'], ['Ordering']],
  ['SIM-MATH-G3-L6-01', 'class3-math-l6-numeral-street', 6, 'Numeral Street', 'अङ्क सडक', 'Signboards for 1 to 20 in Hindu-Arabic, Devanagari and Roman numerals.', '१ देखि २० सम्मका हिन्दु-अरेबिक, देवनागरी र रोमन अङ्कका पाटीहरू।', ['Write 1 to 20 in Roman numerals', 'Match Devanagari and Hindu-Arabic numerals'], ['१ देखि २० सम्म रोमन अङ्क लेख्ने', 'देवनागरी र हिन्दु-अरेबिक अङ्क जोड्ने'], ['Numerals', 'Roman']],
  ['SIM-MATH-G3-L7-01', 'class3-math-l7-chocolate-fractions', 7, 'Chocolate Fractions', 'चकलेट भिन्न', 'A chocolate bar cut into equal pieces; eat some and read the fraction: numerator over denominator.', 'चकलेटलाई बराबर टुक्रा गरेर खाइएको भाग भिन्नमा पढ्ने: अंश र हर।', ['Understand equal parts', 'Numerator and denominator'], ['बराबर भाग बुझ्ने', 'अंश र हर'], ['Fractions']],
  ['SIM-MATH-G3-L8-01', 'class3-math-l8-metre-cm', 8, 'Metre and Centimetre', 'मिटर र सेन्टिमिटर', 'Build lengths from metre sticks and centimetres; 1 m = 100 cm; convert both ways.', 'मिटर र सेन्टिमिटरबाट लम्बाइ बनाउने; १ मिटर = १०० सेमी; दुवै तर्फ रूपान्तरण।', ['Know 1 m = 100 cm', 'Convert metres and centimetres'], ['१ मिटर = १०० सेमी जान्ने', 'मिटर र सेमी रूपान्तरण गर्ने'], ['Length']],
  ['SIM-MATH-G3-L9-01', 'class3-math-l9-line-lab', 9, 'Line Lab', 'रेखा प्रयोगशाला', 'Horizontal, vertical, slanting, curved, parallel and intersecting lines made from ropes, poles, ladders, tracks and roads.', 'डोरी, खम्बा, भर्‍याङ, रेलमार्ग र सडकले बनेका तेर्सो, ठाडो, ढल्केको, बाङ्गो, समानान्तर र काटिने रेखा।', ['Name kinds of lines', 'Tell parallel from intersecting lines'], ['रेखाका प्रकार चिन्ने', 'समानान्तर र काटिने रेखा छुट्याउने'], ['Lines']],
  ['SIM-MATH-G3-L10-01', 'class3-math-l10-angle-lab', 10, 'Angle Lab', 'कोण प्रयोगशाला', 'Open and close two arms around a corner and compare with a set-square right angle: smaller, right or larger.', 'दुई भुजा खोलबन्द गरेर समकोणसँग तुलना: सानो, समकोण वा ठूलो।', ['Understand angles', 'Right angle, smaller and larger angles'], ['कोण बुझ्ने', 'समकोण, सानो र ठूलो कोण'], ['Angles']],
  ['SIM-MATH-G3-L11-01', 'class3-math-l11-face-explorer', 11, 'Face Explorer', 'सतह अन्वेषक', 'Open up a cube, cuboid, cylinder, cone and pyramid to see the flat shapes (faces) it is made of.', 'घन, घनाभ, बेलना, शङ्कु र पिरामिडलाई खोलेर सतहका आकार हेर्ने।', ['Name solid shapes', 'Find the flat faces of solids'], ['ठोस आकारका नाम भन्ने', 'ठोस आकारका सतह चिन्ने'], ['3D shapes']],
  ['SIM-MATH-G3-L12-01', 'class3-math-l12-add-columns', 12, 'Addition Column Towers', 'जोडको स्तम्भ टावर', 'Three sets of towers (first number, second number, answer); add column by column from the ones, carrying when ten or more.', 'तीन सेट टावरमा एकाइबाट स्तम्भ स्तम्भ जोड्दै हातमा राख्ने।', ['Add five-digit numbers', 'Carry over'], ['पाँच अङ्कका सङ्ख्या जोड्ने', 'हातमा राख्ने'], ['Addition']],
  ['SIM-MATH-G3-L13-01', 'class3-math-l13-subtract-columns', 13, 'Subtraction Column Towers', 'घटाउको स्तम्भ टावर', 'Subtract column by column from the ones, borrowing ten from the next column when needed.', 'एकाइबाट स्तम्भ स्तम्भ घटाउँदै नपुगे अर्को स्तम्भबाट १० सापट लिने।', ['Subtract five-digit numbers', 'Borrow'], ['पाँच अङ्कका सङ्ख्या घटाउने', 'सापट लिने'], ['Subtraction']],
  ['SIM-MATH-G3-L14-01', 'class3-math-l14-trays', 14, 'Multiplication Trays', 'गुणन ट्रे', 'Equal trays of tens-rods and ones-cubes: multiply a two-digit number by a one-digit number, ones first then tens.', 'दशक र एकाइका ब्लकका बराबर ट्रे: दुई अङ्कको सङ्ख्यालाई एक अङ्कले गुणा गर्ने।', ['Multiply a 2-digit number by a 1-digit number', 'Place value in multiplication'], ['दुई अङ्कलाई एक अङ्कले गुणा गर्ने', 'गुणनमा स्थानमान'], ['Multiplication']],
  ['SIM-MATH-G3-L14-02', 'class3-math-l14-times-wall', 14, 'Times-Table Wall', 'पहाडा पर्खाल', 'A 10 × 10 wall of cubes; pick rows and columns to see any table fact and count by rows.', '१० × १० घनको पर्खाल; पङ्क्ति र स्तम्भ छानेर पहाडा हेर्ने।', ['Know tables up to 10', 'See multiplication as rows and columns'], ['१० सम्मका पहाडा जान्ने', 'पङ्क्ति र स्तम्भका रूपमा गुणन हेर्ने'], ['Tables']],
  ['SIM-MATH-G3-L15-01', 'class3-math-l15-sharing-plates', 15, 'Sharing Plates', 'थालमा बराबर बाँडौँ', 'Share sweets equally among plates one by one; what is left over is the remainder.', 'मिठाईलाई थालमा बराबर बाँड्ने; बाँकी रहेको भागशेष।', ['Divide equally', 'Quotient and remainder'], ['बराबर भाग लगाउने', 'भागफल र भागशेष'], ['Division']],
  ['SIM-MATH-G3-L16-01', 'class3-math-l16-time-units', 16, 'Hours, Minutes and Seconds', 'घण्टा, मिनेट र सेकेन्ड', 'A clock with an hour hand, minute hand and second hand: 1 hour = 60 minutes and 1 minute = 60 seconds.', 'घण्टा, मिनेट र सेकेन्डको सुई भएको घडी: १ घण्टा = ६० मिनेट, १ मिनेट = ६० सेकेन्ड।', ['Convert hours and minutes', 'Convert minutes and seconds'], ['घण्टा र मिनेट रूपान्तरण', 'मिनेट र सेकेन्ड रूपान्तरण'], ['Time']],
  ['SIM-MATH-G3-L17-01', 'class3-math-l17-bill-change', 17, 'Bill & Change Shop', 'बिल र फिर्ता पसल', 'Add prices to make a bill, pay with a note and subtract to find the change.', 'मूल्य जोडेर बिल बनाउने, नोट तिर्ने र घटाएर फिर्ता निकाल्ने।', ['Add prices', 'Find the change'], ['मूल्य जोड्ने', 'फिर्ता निकाल्ने'], ['Money']],
  ['SIM-MATH-G3-L18-01', 'class3-math-l18-litre-ml', 18, 'Litre and Millilitre', 'लिटर र मिलिलिटर', 'Fill a tank with litre bottles and millilitre cups; 1 L = 1000 mL; convert both ways.', 'लिटरका बोतल र मिलिलिटरका कपले ट्याङ्की भर्ने; १ लिटर = १००० मिलि।', ['Know 1 L = 1000 mL', 'Convert litres and millilitres'], ['१ लिटर = १००० मिलि जान्ने', 'लिटर र मिलि रूपान्तरण गर्ने'], ['Capacity']],
  ['SIM-MATH-G3-L19-01', 'class3-math-l19-road-trip', 19, 'Road Trip', 'सडक यात्रा', 'A car drives along a road marked in kilometres; 1 km = 1000 m; and metres to centimetres.', 'किलोमिटर चिन्ह भएको सडकमा कार गुड्छ; १ किमी = १००० मिटर।', ['Know 1 km = 1000 m', 'Convert km, m and cm'], ['१ किमी = १००० मिटर जान्ने', 'किमी, मिटर र सेमी रूपान्तरण'], ['Length']],
  ['SIM-MATH-G3-L20-01', 'class3-math-l20-kg-g', 20, 'Kilogram and Gram', 'किलोग्राम र ग्राम', 'Add 1 kg bags and 100 g weights on a scale; 1 kg = 1000 g; convert both ways.', 'तराजुमा १ केजीका झोला र १०० ग्रामका तौल थप्ने; १ केजी = १००० ग्राम।', ['Know 1 kg = 1000 g', 'Convert kilograms and grams'], ['१ केजी = १००० ग्राम जान्ने', 'केजी र ग्राम रूपान्तरण गर्ने'], ['Weight']],
  ['SIM-MATH-G3-L21-01', 'class3-math-l21-picture-graph', 21, 'Picture Graph', 'चित्रचार्ट पढौँ', 'One picture stands for 2, 5 or 10; read a pictograph with half pictures and answer questions.', 'एउटा चित्रले २, ५ वा १० जनाउँछ; आधा चित्रसहित चित्रचार्ट पढ्ने।', ['Read a pictograph with a scale', 'Answer most, fewest and total'], ['मापसहित चित्रचार्ट पढ्ने', 'धेरै, कम र जम्मा पत्ता लगाउने'], ['Pictograph']],
  ['SIM-MATH-G3-L22-01', 'class3-math-l22-area-tiles', 22, 'Tile the Rectangle', 'आयत टाइल', 'Cover a rectangle with 1 cm² square tiles row by row; area = length × width.', '१ वर्ग सेमीका टाइलले आयत छोप्ने; क्षेत्रफल = लम्बाइ × चौडाइ।', ['Find area by counting squares', 'Area = length × width'], ['वर्ग गनेर क्षेत्रफल पत्ता लगाउने', 'क्षेत्रफल = लम्बाइ × चौडाइ'], ['Area']],
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  for (const [code, key, ch, title, titleNp, desc, descNp, obj, objNp, tags] of SIMS) {
    const [chEn, chNp] = LESSONS[ch];
    const doc = {
      code, title, titleNepali: titleNp, description: desc, descriptionNepali: descNp, subjectCode: 'MATH', subjectName: 'Mathematics', gradeLevels: [3],
      chapterNumber: ch, chapterName: chEn, chapterNameNepali: chNp, simulationType: 'THREE_JS', componentKey: key, runtimeUrl: `/simulations/class3-math/l${ch}/${key}`,
      difficulty: 'BEGINNER', estimatedDurationMinutes: 15, learningObjectives: obj, learningObjectivesNepali: objNp, isPublished: true, currentVersion: '1.0.0',
      tags: ['Class 3', 'Mathematics', `Lesson ${ch}`, ...tags, '3D WebGL', 'Learn · Play · Challenge'],
    };
    await Simulation.findOneAndUpdate({ code }, { $set: doc }, { upsert: true });
    console.log(`[OK] ${code}  ${title}`);
  }
  console.log(`Done: ${SIMS.length} simulations registered for Class 3 Mathematics.`);
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
