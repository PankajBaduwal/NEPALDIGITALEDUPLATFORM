import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

const SimulationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    titleNepali: { type: String },
    description: { type: String, required: true },
    descriptionNepali: { type: String },
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    gradeLevels: [{ type: Number, required: true }],
    chapterNumber: { type: Number },
    chapterName: { type: String },
    chapterNameNepali: { type: String },
    simulationType: {
      type: String,
      enum: ['THREE_JS', 'PHASER', 'REACT_CANVAS', 'HTML5_CANVAS', 'WEB_GL'],
      default: 'REACT_CANVAS',
    },
    componentKey: { type: String },
    runtimeUrl: { type: String },
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'BEGINNER',
    },
    estimatedDurationMinutes: { type: Number, default: 15 },
    learningObjectives: [{ type: String }],
    learningObjectivesNepali: [{ type: String }],
    isPublished: { type: Boolean, default: true },
    currentVersion: { type: String, default: '1.0.0' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', SimulationSchema);

async function seedCh10() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB:', MONGODB_URI);

    // Remap the 2 legacy KPRIET simulations to Chapter 12 so Chapter 10 has strictly the 5 new government curriculum simulations
    await Simulation.updateMany(
      { code: { $in: ['KP-g18-class1-time-chintu-day', 'KP-g18-class1-currency-toy-shop'] } },
      {
        $set: {
          chapterNumber: 12,
          chapterName: 'Money and Time',
          chapterNameNepali: 'मुद्रा र समय',
        },
      }
    );
    console.log('Remapped legacy simulations to Chapter 12.');

    const class1MathCh10Sims = [
      {
        code: 'SIM-MATH-G1-CH10-01',
        title: 'Addition Playground',
        titleNepali: 'जोड खेलमैदान',
        description:
          'Physically combine two groups of 3D objects (fruits, birds, balloons, counting blocks) into one common space and discover the addition equation up to 20.',
        descriptionNepali:
          '३डी बगैँचामा दुई समूहका वस्तुहरू (स्याउ, केरा, बेलुन, चराहरू) एकै ठाउँमा जम्मा गरी २० सम्मको जोडफल र गणितीय समीकरण पत्ता लगाउने खेल।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 10,
        chapterName: 'Addition up to 20',
        chapterNameNepali: 'योगफल २० सम्म आउने जोड',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch10-playground',
        runtimeUrl: '/simulations/class1-math/ch10/playground',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Understand addition as physically combining two groups of objects',
          'Count total objects in a combined collection up to 20',
          'Use plus (+) and equal (=) symbols correctly',
          'Formulate and solve addition equations from real stories',
        ],
        learningObjectivesNepali: [
          'जोड भनेको दुई वा बढी समूहका वस्तुहरूलाई एकै ठाउँमा मिसाउनु हो भनी बुझ्ने',
          'वस्तुहरू मिलाएपछि जम्मा सङ्ख्या २० सम्म शुद्ध रूपमा गन्ने',
          'जोड चिन्ह (+) र बराबर चिन्ह (=) को सही प्रयोग गर्ने',
          'कथामा आधारित जोडका समस्याहरूलाई गणितीय वाक्यमा लेख्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 10', 'Addition up to 20', 'Playground', 'Grouping', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH10-02',
        title: 'Make Ten Adventure',
        titleNepali: 'दश बनाएर जोडौँ',
        description:
          'Master the make-10 addition strategy by splitting an addend to complete ten first, and then adding the remaining ones (e.g. 8 + 5 = 8 + 2 + 3 = 10 + 3 = 13).',
        descriptionNepali:
          'दश बनाउने विधि प्रयोग गरी दोस्रो सङ्ख्यालाई फुटाएर पहिले १० पूरा गर्ने र बाँकी एकाइ जोडेर २० सम्मको जोड सिक्ने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 10,
        chapterName: 'Addition up to 20',
        chapterNameNepali: 'योगफल २० सम्म आउने जोड',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch10-make-ten',
        runtimeUrl: '/simulations/class1-math/ch10/make-ten',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Recognize number combinations that complete 10',
          'Split the second addend into two parts to make ten first',
          'Add the remaining ones to 10 to find the total (10 + N)',
          'Solve addition problems mentally using the make-10 strategy',
        ],
        learningObjectivesNepali: [
          '१० बनाउने सङ्ख्याका जोडीहरू पहिचान गर्ने',
          'पहिलो समूहलाई १० बनाउन दोस्रो सङ्ख्यालाई दुई भागमा टुक्र्याउने',
          '१० मा बाँकी एकाइ जोडेर अन्तिम जोडफल निकाल्ने (१० + क)',
          'दश बनाउने विधिका आधारमा मौखिक रूपमा द्रुत जोड गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 10', 'Make Ten', 'Split Addend', 'Ten Frame', 'Addition Strategy'],
      },
      {
        code: 'SIM-MATH-G1-CH10-03',
        title: 'Addition Equation Studio',
        titleNepali: 'जोड वाक्य निर्माण प्रयोगशाला',
        description:
          'Build horizontal addition equations, solve three-number additions up to 20 (e.g. 6 + 4 + 3 = 13), and solve missing addend problems using interactive number tiles.',
        descriptionNepali:
          'चित्र हेरी जोड समीकरण बनाउने, तीन सङ्ख्याको जोड गर्ने र खाली ठाउँको सङ्ख्या (लुकेको अङ्क) पत्ता लगाउने प्रयोगशाला।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 10,
        chapterName: 'Addition up to 20',
        chapterNameNepali: 'योगफल २० सम्म आउने जोड',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch10-equation-studio',
        runtimeUrl: '/simulations/class1-math/ch10/equation-studio',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Construct formal addition equations from picture prompts',
          'Add three numbers with a total up to 20 by grouping pairs to 10',
          'Find missing addends when sum is provided (e.g. 8 + [ ] = 12)',
          'Switch seamlessly between English and Devanagari equations',
        ],
        learningObjectivesNepali: [
          'चित्र हेरेर पूर्ण गणितीय जोड वाक्य निर्माण गर्ने',
          'तीनवटा सङ्ख्याहरूको योगफल २० सम्म आउने जोड गर्ने',
          'जोड वाक्यमा छुटेका खाली ठाउँका सङ्ख्याहरू पत्ता लगाउने',
          'देवनागरी र अङ्ग्रेजी दुवै अङ्कमा समीकरण समाधान गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 10', 'Equation Studio', 'Three-Number Addition', 'Missing Addend'],
      },
      {
        code: 'SIM-MATH-G1-CH10-04',
        title: 'Addition Block Builder',
        titleNepali: 'जोड ब्लक निर्माण खेल',
        description:
          'Combine red and blue number blocks into dual ten-frame houses, complete the first ten-frame, and discover the visual total for two-number and three-number addition.',
        descriptionNepali:
          'रातो र नीलो ब्लकहरूलाई दुईवटा दश-कोठे घरमा भरेर पहिले १० पूरा गर्ने र २० सम्मको जोडफल रङ्गीन रूपमा हेर्ने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 10,
        chapterName: 'Addition up to 20',
        chapterNameNepali: 'योगफल २० सम्म आउने जोड',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch10-block-builder',
        runtimeUrl: '/simulations/class1-math/ch10/block-builder',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Fill cells in dual ten-frame houses corresponding to given addends',
          'Observe visually how completing one full ten-frame simplifies counting',
          'Add two and three groups of blocks up to 20',
          'Connect colour-coded representations to numeric equations',
        ],
        learningObjectivesNepali: [
          'दुईवटा दश-कोठे घरमा दिइएका सङ्ख्या अनुसार रङ्गीन ब्लकहरू भर्ने',
          'पहिलो घरमा १० वटा पूरा भएपछि बाँकी दोस्रो घरमा राख्ने प्रक्रिया बुझ्ने',
          'दुई र तीन समूहका ब्लकहरू जोडेर २० सम्मको जोडफल निकाल्ने',
          'रङ्ग अनुसार सङ्ख्या र समीकरणको सम्बन्ध प्रष्ट पार्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 10', 'Block Builder', 'Ten Frame Houses', 'Color Addition'],
      },
      {
        code: 'SIM-MATH-G1-CH10-05',
        title: 'Addition Challenge World',
        titleNepali: 'जोड चुनौती संसार',
        description:
          'Explore five village challenge stations solving story additions, vertical column additions, make-10 problems, missing addends, and comprehensive evaluations.',
        descriptionNepali:
          'गाउँका ५ केन्द्रहरूमा कथामा आधारित जोड, ठाडो जोड (Vertical Addition), दश बनाउने र खाली ठाउँ भर्ने विविध चुनौतीहरू।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 10,
        chapterName: 'Addition up to 20',
        chapterNameNepali: 'योगफल २० सम्म आउने जोड',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch10-challenge-world',
        runtimeUrl: '/simulations/class1-math/ch10/challenge-world',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Solve practical story-based addition problems',
          'Perform vertical addition column alignment and calculation',
          'Find combinations that sum to a given target number up to 20',
          'Complete multi-topic assessment and track mastery',
        ],
        learningObjectivesNepali: [
          'दैनिक जीवन र कथामा आधारित जोड समस्याहरू हल गर्ने',
          'ठाडो रूपमा लेखिएका सङ्ख्याहरूको जोड (Vertical Addition) गर्ने',
          'दिइएको सङ्ख्या बन्ने विभिन्न जोडका जोडीहरू पत्ता लगाउने',
          'समग्र मूल्याङ्कन पूरा गरी प्रगति विवरण सुरक्षित गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 10', 'Challenge World', 'Story Addition', 'Vertical Addition', 'Quiz'],
      },
    ];

    for (const sim of class1MathCh10Sims) {
      const res = await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
      console.log(`[SEED OK] ${res.code}: ${res.title} (${res.componentKey})`);
    }

    console.log('Class 1 Mathematics Chapter 10 simulations seeded successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Chapter 10:', err);
    process.exit(1);
  }
}

seedCh10();

