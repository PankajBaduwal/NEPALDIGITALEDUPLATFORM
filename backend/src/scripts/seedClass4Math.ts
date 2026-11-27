/**
 * Registers the Class 4 Mathematics simulations (2D, one to four per lesson of "Mathematics, Grade 4").
 * Code: frontend/src/simulations/class4-math/. Safe to run again: it updates by `code`.
 *   npm run seed:class4-math
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
  1: ['Lines and Angles', 'रेखाहरू र कोणहरू'], 2: ['Plane Figures', 'समतलीय आकृतिहरू'], 3: ['Solid Objects', 'ठोस वस्तुहरू'], 4: ['Number Sense', 'सङ्ख्याको ज्ञान'],
  5: ['Basic Operations of Mathematics', 'गणितका आधारभूत क्रियाहरू'], 6: ['Fraction, Decimal and Percentage', 'भिन्न, दशमलव र प्रतिशत'], 7: ['Time', 'समय'], 8: ['Currency', 'मुद्रा'],
  9: ['Distance', 'दुरी'], 10: ['Capacity', 'क्षमता'], 11: ['Weight', 'तौल'], 12: ['Perimeter and Area', 'परिमिति र क्षेत्रफल'], 13: ['Bill and Budget', 'बिल र बजेट'], 14: ['Bar Diagram', 'स्तम्भ चित्र'], 15: ['Algebra', 'बीजगणित'],
};
// code, key, lesson, title, titleNp, description, descriptionNp, objectives
type S = [string, string, number, string, string, string, string, string[]];
const SIMS: S[] = [
  ['SIM-MATH-G4-L1-01', 'class4-math-l1-protractor', 1, 'Protractor Lab', 'चाँद प्रयोगशाला', 'A protractor: open an arm from the base line, read the angle in degrees and name acute, right, obtuse and straight angles.', '३डी चाँदमा भुजा खोलेर कोण डिग्रीमा पढ्ने; न्यून, समकोण, अधिक र सरल कोण चिन्ने।', ['Measure and construct angles with a protractor', 'Name kinds of angles']],
  ['SIM-MATH-G4-L2-01', 'class4-math-l2-shape-builder', 2, 'Shape Builder', 'आकृति निर्माता', 'Triangles and quadrilaterals as 3D tiles with labelled vertices and side lengths; learn their properties and name them.', 'शीर्षबिन्दु र भुजाको नापसहित त्रिभुज र चतुर्भुजका आकृति; गुण पढ्ने र नाम भन्ने।', ['Name plane figures', 'Sides, vertices and equal sides']],
  ['SIM-MATH-G4-L3-01', 'class4-math-l3-solid-explorer', 3, 'Solid Explorer', 'ठोस वस्तु अन्वेषक', 'Spin a cube, cuboid, pyramid, prism, cylinder, cone and sphere; count faces, edges and vertices.', 'घन, घनाभ, पिरामिड, प्रिज्म, बेलना, शङ्कु र गोला घुमाएर सतह, किनारा र शीर्ष गन्ने।', ['Faces, edges and vertices of solids', 'Tell flat from curved faces']],
  ['SIM-MATH-G4-L4-01', 'class4-math-l4-lakh-towers', 4, 'Lakh Towers', 'लाख टावर', 'Seven columns of cubes (ten-lakhs to ones): build and read numbers up to 99,99,999 with place values and commas.', 'सात स्तम्भका घनले ९९,९९,९९९ सम्मका सङ्ख्या बनाउने, पढ्ने र स्थानीय मान पत्ता लगाउने।', ['Read and write 7-digit numbers', 'Place value in the lakh system']],
  ['SIM-MATH-G4-L4-02', 'class4-math-l4-round-off', 4, 'Round-Off Line', 'अनुमान रेखा', 'A ball on a number line rolls to the nearest 10, 100 or 1000; halfway means round up.', 'सङ्ख्यारेखामा बललाई नजिकको १०, १०० वा १००० मा गुडाउने।', ['Round to the nearest 10, 100 and 1000']],
  ['SIM-MATH-G4-L5-01', 'class4-math-l5-add-towers', 5, 'Addition Towers (7 digits)', 'जोडको टावर (७ अङ्क)', 'Three sets of towers; add column by column from the ones, carrying when ten or more.', 'एकाइबाट स्तम्भ स्तम्भ जोड्दै हातमा राख्ने।', ['Add numbers up to seven digits']],
  ['SIM-MATH-G4-L5-02', 'class4-math-l5-sub-towers', 5, 'Subtraction Towers (7 digits)', 'घटाउको टावर (७ अङ्क)', 'Subtract column by column, borrowing ten from the next column when needed.', 'एकाइबाट स्तम्भ स्तम्भ घटाउँदै नपुगे सापट लिने।', ['Subtract numbers up to seven digits']],
  ['SIM-MATH-G4-L5-03', 'class4-math-l5-multiply-grid', 5, 'Multiplication Grid', 'गुणन ग्रिड', 'An area model: a two-digit by two-digit multiplication is split into four coloured blocks whose products add up.', 'दुई अङ्क × दुई अङ्कको गुणनलाई चार रङ्गीन ब्लकमा बाँडेर जोड्ने।', ['Multiply 2-digit numbers', 'Partial products']],
  ['SIM-MATH-G4-L5-04', 'class4-math-l5-long-division', 5, 'Long Division Lab', 'भाग प्रयोगशाला', 'Divide a three-digit number by a one-digit number step by step: divide, then carry the remainder to the next digit.', 'तीन अङ्कको सङ्ख्यालाई एक अङ्कले चरणबद्ध भाग गर्ने।', ['Long division', 'Quotient and remainder']],
  ['SIM-MATH-G4-L6-01', 'class4-math-l6-fraction-pies', 6, 'Fraction Pies', 'भिन्नको पाई', 'Shade slices of a pie, see equivalent fractions side by side and compare which fraction is greater.', 'पाईका टुक्रा रङ्ग्याएर बराबर भिन्न हेर्ने र भिन्न तुलना गर्ने।', ['Equivalent fractions', 'Compare fractions']],
  ['SIM-MATH-G4-L6-02', 'class4-math-l6-decimal-grid', 6, 'Decimal Grid', 'दशमलव ग्रिड', 'A 10 × 10 grid: shade parts of 100 and read them as a fraction, a decimal and a percent.', '१०० वटा खानामा रङ्ग्याएर भिन्न, दशमलव र प्रतिशतमा पढ्ने।', ['Fraction, decimal and percent']],
  ['SIM-MATH-G4-L7-01', 'class4-math-l7-clock-24', 7, '24-Hour Clock', '२४ घण्टे घडी', 'A clock with a sun and moon: 12-hour time with AM/PM and 24-hour time, and elapsed time.', 'सूर्य र चन्द्रमासहितको घडी: १२ घण्टे र २४ घण्टे समय तथा बितेको समय।', ['Convert between 12-hour and 24-hour time', 'Find elapsed time']],
  ['SIM-MATH-G4-L8-01', 'class4-math-l8-note-counter', 8, 'Note Counter', 'नोट गणक', 'Stacks of Nepali notes and coins: make an amount, find the fewest notes, and Rs to paisa.', 'नेपाली नोट र सिक्काका थुप्रा: रकम बनाउने, कम नोट खोज्ने, रुपैयाँ र पैसा।', ['Count money', 'Rupees and paisa']],
  ['SIM-MATH-G4-L9-01', 'class4-math-l9-distance', 9, 'Distance: km, m, cm, mm', 'दुरी: किमी, मिटर, सेमी, मिमी', 'Roads and rulers to convert kilometres, metres, centimetres and millimetres.', 'सडक र रुलरबाट किमी, मिटर, सेमी र मिमी रूपान्तरण।', ['Convert units of length']],
  ['SIM-MATH-G4-L10-01', 'class4-math-l10-capacity', 10, 'Capacity: litre and millilitre', 'क्षमता: लिटर र मिलिलिटर', 'Fill a tank with litre bottles and millilitre cups; 1 L = 1000 mL.', 'लिटर र मिलिलिटरले ट्याङ्की भर्ने; १ लिटर = १००० मिलि।', ['Convert litres and millilitres']],
  ['SIM-MATH-G4-L11-01', 'class4-math-l11-weight', 11, 'Weight: kilogram and gram', 'तौल: किलोग्राम र ग्राम', 'Weigh on a scale; 1 kg = 1000 g.', '३डी तराजुमा तौल्ने; १ केजी = १००० ग्राम।', ['Convert kilograms and grams']],
  ['SIM-MATH-G4-L12-01', 'class4-math-l12-garden-lab', 12, 'Garden Lab (Perimeter & Area)', 'बगैँचा प्रयोगशाला', 'An ant walks round a garden (perimeter) and tiles cover it (area); change length and width.', 'कमिला बगैँचा वरिपरि हिँड्छ (परिमिति) र टाइलले छोप्छ (क्षेत्रफल)।', ['Perimeter of rectangle and square', 'Area of rectangle and square']],
  ['SIM-MATH-G4-L13-01', 'class4-math-l13-bill-shop', 13, 'Bill Shop', 'बिल पसल', 'Shop from shelves: quantity × rate = amount; total bill and change.', 'पसलबाट सामान किन्ने: परिमाण × दर = रकम; जम्मा बिल र फिर्ता।', ['Prepare a bill', 'Find the change']],
  ['SIM-MATH-G4-L13-02', 'class4-math-l13-budget-towers', 13, 'Budget Towers', 'बजेट टावर', 'Towers for income and spending; saving = income − spending; spot a deficit.', 'आम्दानी र खर्चका टावर; बचत = आम्दानी − खर्च।', ['Make a simple budget', 'Saving and deficit']],
  ['SIM-MATH-G4-L14-01', 'class4-math-l14-bar-graph', 14, 'Bar Graph Lab', 'स्तम्भ चित्र प्रयोगशाला', 'bars with a scale of 1, 2, 5 or 10 per block: read, build and compare.', '१, २, ५ वा १० प्रति खण्डका ३डी स्तम्भ: पढ्ने, बनाउने र तुलना गर्ने।', ['Read and draw bar graphs']],
  ['SIM-MATH-G4-L15-01', 'class4-math-l15-balance-algebra', 15, 'Balance Algebra', 'तराजु बीजगणित', 'A balance with an unknown x: take the same from both sides, or guess x until it balances.', 'अज्ञात x भएको तराजु: दुवैतिरबाट बराबर हटाउने वा अनुमान गर्ने।', ['Solve simple equations', 'Use a letter for an unknown']],
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  for (const [code, key, ch, title, titleNp, desc, descNp, obj] of SIMS) {
    const [chEn, chNp] = LESSONS[ch];
    const doc = {
      code, title, titleNepali: titleNp, description: desc, descriptionNepali: descNp, subjectCode: 'MATH', subjectName: 'Mathematics', gradeLevels: [4],
      chapterNumber: ch, chapterName: chEn, chapterNameNepali: chNp, simulationType: 'HTML5_CANVAS', componentKey: key, runtimeUrl: `/simulations/class4-math/l${ch}/${key}`,
      difficulty: 'INTERMEDIATE', estimatedDurationMinutes: 15, learningObjectives: obj, learningObjectivesNepali: obj, isPublished: true, currentVersion: '1.0.0',
      tags: ['Class 4', 'Mathematics', `Lesson ${ch}`, chEn, 'Learn · Play · Challenge'],
    };
    await Simulation.findOneAndUpdate({ code }, { $set: doc }, { upsert: true });
    console.log(`[OK] ${code}  ${title}`);
  }
  console.log(`Done: ${SIMS.length} simulations registered for Class 4 Mathematics.`);
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
