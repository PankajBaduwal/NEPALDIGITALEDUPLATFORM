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
    simulationType: {
      type: String,
      enum: ['HTML5_CANVAS', 'PHASER', 'REACT_CANVAS', 'WEB_GL'],
      default: 'REACT_CANVAS',
    },
    componentKey: String,
    runtimeUrl: String,
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'INTERMEDIATE',
    },
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

const CLASS7_SET_SIMS = [
  {
    code: 'SIM-MATH-G7-L1-01',
    key: 'class7-math-ch1-set-builder',
    title: 'Set Builder and Classification Lab',
    titleNepali: 'समूह निर्माण र वर्गीकरण प्रयोगशाला',
    description: 'Interactive 2D lab to classify elements, form sets based on properties, and master listing method and set-builder notation {x : x ...}.',
    descriptionNepali: 'वस्तुहरूको साझा विशेषता पहिचान गरी समूह बनाउने, सूचीकरण विधि र समूह निर्माण विधि {x : x ...} सिक्ने २D प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand what a set and elements are',
      'Express sets in listing and set-builder notation',
      'Identify membership using ∈ and ∉',
    ],
    learningObjectivesNepali: [
      'समूह र यसका सदस्यहरू बुझ्ने',
      'सूचीकरण विधि र समूह निर्माण विधिमा लेख्ने',
      '∈ र ∉ संकेत प्रयोग गरी सदस्य पहिचान गर्ने',
    ],
  },
  {
    code: 'SIM-MATH-G7-L1-02',
    key: 'class7-math-ch1-types-of-sets',
    title: 'Types of Sets – Discovery World',
    titleNepali: 'समूहका प्रकारहरू खोजी संसार',
    description: 'Explore the 3 fundamental types of sets: Null set (∅), Finite set (countable definite count), and Infinite set (extends endlessly without finite last element).',
    descriptionNepali: 'समूहका ३ प्रकारहरू: रिक्त समूह (∅), सीमित समूह (गनेर सकिने निश्चित सदस्य) र असीमित समूह (अनन्तसम्म जाने) अन्वेषण गर्ने २D संसार।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Distinguish between Null, Finite, and Infinite sets',
      'Recognize that an empty set has 0 elements',
      'Understand that infinite sets do not have a finite last element',
    ],
    learningObjectivesNepali: [
      'रिक्त, सीमित र असीमित समूहको भिन्नता छुट्याउने',
      'रिक्त समूहमा कुनै सदस्य हुँदैन भनी बुझ्ने',
      'असीमित समूहको कुनै अन्तिम सदस्य हुँदैन भनी स्पष्ट हुने',
    ],
  },
  {
    code: 'SIM-MATH-G7-L1-03',
    key: 'class7-math-ch1-equal-equivalent',
    title: 'Equal and Equivalent Sets Explorer',
    titleNepali: 'बराबर र समतुल्य समूह अन्वेषक',
    description: 'Master the difference between Equivalent sets (A ~ B, same element count) and Equal sets (A = B, identical elements regardless of order).',
    descriptionNepali: 'समतुल्य समूह (A ~ B, सदस्य सङ्ख्या बराबर) र बराबर समूह (A = B, ठीक उही सदस्यहरू) बीचको भिन्नता प्रयोगात्मक रूपमा सिक्ने २D अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Differentiate between equal sets and equivalent sets',
      'Establish 1-to-1 correspondence between equivalent sets',
      'Prove: All equal sets are equivalent, but not all equivalent sets are equal',
    ],
    learningObjectivesNepali: [
      'बराबर र समतुल्य समूहको स्पष्ट भेद जान्ने',
      '१-का-लागि-१ जोडा मिलाई समतुल्यता प्रमाणित गर्ने',
      'सबै बराबर समूह समतुल्य हुन्छन् तर सबै समतुल्य बराबर हुँदैनन् भनी सिद्ध गर्ने',
    ],
  },
  {
    code: 'SIM-MATH-G7-L1-04',
    key: 'class7-math-ch1-universal-set',
    title: 'Universal Set Explorer',
    titleNepali: 'सर्वव्यापक समूह अन्वेषक',
    description: 'Visualizing Universal set U = {1, 2, ... 14} and building nested subsets A (Even numbers < 15) and B (Prime numbers < 15) inside U.',
    descriptionNepali: 'सर्वव्यापक समूह U = {१ देखि १४ सम्म} को आयताकार क्षेत्र र त्यसभित्र उपसमूह A (जोर सङ्ख्या) र B (रुढ सङ्ख्या) निर्माण गर्ने २D प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand Universal Set (U) as the enclosing universe',
      'Construct subsets within U based on even, odd, prime, and composite properties',
      'Determine suitable universal sets for given groups',
    ],
    learningObjectivesNepali: [
      'सर्वव्यापक समूह U को अवधारणा बुझ्ने',
      'U भित्र जोर, बिजोर, रुढ र संयुक्त सङ्ख्याका उपसमूह बनाउने',
      'दिइएका समूहका लागि उपयुक्त सर्वव्यापक समूह पहिचान गर्ने',
    ],
  },
  {
    code: 'SIM-MATH-G7-L1-05',
    key: 'class7-math-ch1-subsets',
    title: 'Subset and Subset Builder Lab',
    titleNepali: 'उपसमूह र उपसमूह निर्माण प्रयोगशाला',
    description: 'Construct subsets from geometry instrument box, distinguish proper (⊂) vs improper (⊆) subsets, and generate all 2³ = 8 subsets of {1, 2, 3}.',
    descriptionNepali: 'ज्यामिति बाकसका सामग्रीबाट उपसमूह बनाउने, उचित (⊂) र अनुचित (⊆) उपसमूह छुट्याउने र {१, २, ३} का सबै २³ = ८ उपसमूह निर्माण गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Construct subsets of a given set',
      'Understand proper subsets (⊂) vs improper subsets (⊆)',
      'Apply formula 2ⁿ to calculate and list all possible subsets',
    ],
    learningObjectivesNepali: [
      'कुनै समूहका उपसमूहहरू निर्माण गर्ने',
      'उचित उपसमूह र अनुचित उपसमूहको भिन्नता बुझ्ने',
      'सूत्र २ⁿ प्रयोग गरी जम्मा उपसमूहको सङ्ख्या निकाल्ने',
    ],
  },
  {
    code: 'SIM-MATH-G7-L1-06',
    key: 'class7-math-ch1-classroom-3d',
    title: 'My Classroom – Real-World Set Formation',
    titleNepali: 'मेरो कक्षाकोठा – वास्तविक वस्तुबाट समूह निर्माण',
    description: 'Authentic 3D classroom simulation: collect 10 classroom objects (books, stationery, math instruments, wood items), categorize into sets, and complete textbook Project Work (Page 15).',
    descriptionNepali: 'वास्तविक ३D कक्षाकोठा: १० वटा वस्तुहरू सङ्कलन गरी साझा विशेषताका आधारमा समूह बनाउने र पाठ्यपुस्तकको परियोजना कार्य (पृष्ठ १५) पूरा गर्ने।',
    simulationType: 'WEB_GL',
    learningObjectives: [
      'Connect abstract set theory to tangible classroom objects',
      'Form sets based on real-world properties (wood, stationery, math instruments)',
      'Complete and present CDC textbook Page 15 project work',
    ],
    learningObjectivesNepali: [
      'अमूर्त समूह सिद्धान्तलाई कक्षाकोठाका वास्तविक वस्तुसँग जोड्ने',
      'साझा विशेषताका आधारमा वास्तविक वस्तुका समूह निर्माण गर्ने',
      'पाठ्यपुस्तक पृष्ठ १५ को परियोजना कार्य पूरा गरी प्रतिवेदन प्रस्तुत गर्ने',
    ],
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  let total = 0;
  for (const s of CLASS7_SET_SIMS) {
    const doc = {
      code: s.code,
      title: s.title,
      titleNepali: s.titleNepali,
      description: s.description,
      descriptionNepali: s.descriptionNepali,
      subjectCode: 'MATH',
      subjectName: 'Mathematics',
      gradeLevels: [7],
      chapterNumber: 1,
      chapterName: 'Set',
      chapterNameNepali: 'समूह',
      simulationType: s.simulationType,
      componentKey: s.key,
      runtimeUrl: `/simulations/class7-math/l1/${s.key}`,
      difficulty: 'INTERMEDIATE',
      estimatedDurationMinutes: 15,
      learningObjectives: s.learningObjectives,
      learningObjectivesNepali: s.learningObjectivesNepali,
      isPublished: true,
      currentVersion: '1.0.0',
      tags: ['Class 7', 'Mathematics', 'Lesson 1', 'Set', 'समूह', 'CDC Nepal'],
    };
    await Simulation.findOneAndUpdate(
      { code: s.code },
      { $set: doc },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`[OK] Registered Grade 7 Simulation: ${s.code} - ${s.title}`);
    total++;
  }
  console.log(`Done: ${total} Grade 7 Set simulations registered successfully.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
