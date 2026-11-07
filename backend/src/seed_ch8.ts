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

async function seedCh8() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB:', MONGODB_URI);

    const class1MathCh8Sims = [
      {
        code: 'SIM-MATH-G1-CH8-01',
        title: 'Subtraction Playground',
        titleNepali: 'घटाउ खेलमैदान',
        description:
          'Teach the basic meaning of subtraction through physically removing objects from a 3D group into a removal basket and discovering the remainder.',
        descriptionNepali:
          '३डी खेलमैदानमा वस्तुहरूको समूहबाट केही वस्तु हटाएर बाँकी सङ्ख्या पत्ता लगाउने र घटाउको आधारभूत अवधारणा बुझ्ने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 8,
        chapterName: 'Subtraction up to 10',
        chapterNameNepali: '१० सम्मका सङ्ख्याहरूको घटाउ',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch8-playground',
        runtimeUrl: '/simulations/class1-math/ch8/playground',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Understand subtraction as physically taking away objects from a collection',
          'Count the initial set, removed items, and remaining items',
          'Recognize that subtracting zero leaves the group unchanged (A - 0 = A)',
          'Connect physical removal to the equation A - B = Remainder',
        ],
        learningObjectivesNepali: [
          'समूहबाट वस्तु हटाएर घटाउको वास्तविक अवधारणा बुझ्ने',
          'सुरुको सङ्ख्या, हटाइएका वस्तु र बाँकी रहेका वस्तु गन्ने',
          'शून्य घटाउँदा सङ्ख्यामा परिवर्तन हुँदैन भनी बुझ्ने (क - ० = क)',
          'वस्तु हटाउने कार्यलाई गणितीय वाक्य क - ख = बाँकीसँग जोड्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 8', 'Subtraction', 'Playground', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH8-02',
        title: 'Empty the Basket Adventure',
        titleNepali: 'टोकरी खाली गर्ने साहसिक खेल',
        description:
          'Help students understand subtraction through removing objects from containers (baskets, toy boxes, nests) and counting what remains.',
        descriptionNepali:
          'टोकरी, खेलौना बाकस र गुँडबाट वस्तु हटाउँदै बाँकी सङ्ख्या गनेर घटाउ सिक्ने साहसिक खेल।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 8,
        chapterName: 'Subtraction up to 10',
        chapterNameNepali: '१० सम्मका सङ्ख्याहरूको घटाउ',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch8-basket-adventure',
        runtimeUrl: '/simulations/class1-math/ch8/basket-adventure',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Remove items from authentic containers (fruit baskets, toy boxes, bird nests)',
          'Observe dynamic departures (birds flying away, toys given away)',
          'Formulate subtraction equations within 10',
        ],
        learningObjectivesNepali: [
          'विभिन्न भाँडा र टोकरीहरूबाट वस्तु निकालेर बाँकी गन्ने',
          'गतिशील दृश्यहरू (चरा उडेर जाने, खेलौना बाँड्ने) अवलोकन गर्ने',
          '१० सम्मका घटाउका गणितीय वाक्य निर्माण गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 8', 'Containers', 'Basket', 'Removal'],
      },
      {
        code: 'SIM-MATH-G1-CH8-03',
        title: 'Subtraction Equation Studio',
        titleNepali: 'घटाउ वाक्य निर्माण प्रयोगशाला',
        description:
          'Convert visual subtraction into horizontal and vertical equations, place minus (−) and equals (=) signs, and solve missing-number challenges.',
        descriptionNepali:
          'चित्रमा आधारित घटाउलाई तेर्सो र ठाडो गणितीय वाक्यमा रूपान्तरण गर्ने, घटाउ (−) र बराबर (=) चिन्ह राख्ने प्रयोगशाला।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 8,
        chapterName: 'Subtraction up to 10',
        chapterNameNepali: '१० सम्मका सङ्ख्याहरूको घटाउ',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch8-equation-studio',
        runtimeUrl: '/simulations/class1-math/ch8/equation-studio',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Connect the minus symbol (−) with the subtraction process',
          'Understand both horizontal and vertical subtraction layouts',
          'Solve missing number puzzles (A - ? = C and ? - B = C)',
        ],
        learningObjectivesNepali: [
          'घटाउ चिन्ह (−) को सही पहिचान र प्रयोग गर्ने',
          'तेर्सो र ठाडो दुवै ढाँचाका घटाउ वाक्यहरू बुझ्ने',
          'खाली ठाउँ भर्ने घटाउका समस्याहरू समाधान गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 8', 'Equations', 'Vertical Subtraction', 'Missing Numbers'],
      },
      {
        code: 'SIM-MATH-G1-CH8-04',
        title: 'More or Less – Difference Explorer',
        titleNepali: 'बढी र कम पत्ता लगाऔँ',
        description:
          'Compare two groups of objects using one-to-one matching to find how many more or fewer objects one group contains (numerical difference).',
        descriptionNepali:
          'दुई समूहका वस्तुहरूलाई जोडा मिलाएर तुलना गर्दै कुनमा कति बढी वा कम छन् भनी संख्यात्मक फरक पत्ता लगाउने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 8,
        chapterName: 'Subtraction up to 10',
        chapterNameNepali: '१० सम्मका सङ्ख्याहरूको घटाउ',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch8-difference-explorer',
        runtimeUrl: '/simulations/class1-math/ch8/difference-explorer',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Understand subtraction as comparison and numerical difference',
          'Use one-to-one pairing between two groups to isolate the difference',
          'Answer "How many more?" and "How many fewer?" questions',
        ],
        learningObjectivesNepali: [
          'दुई समूहको तुलना गरेर संख्यात्मक फरक (Difference) निकाल्ने',
          'एक-एक जोडा मिलाएर बाँकी रहेका बढी वस्तुहरू पत्ता लगाउने',
          '"कति बढी?" र "कति कम?" का प्रश्नहरू आत्मविश्वासका साथ हल गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 8', 'Difference', 'Comparison', 'More or Less'],
      },
      {
        code: 'SIM-MATH-G1-CH8-05',
        title: 'Subtraction Challenge World',
        titleNepali: 'घटाउ चुनौती संसार',
        description:
          'Explore 5 village challenge stations (Fruit Shop, Bird Garden, Toy House, Flower Garden, Challenge Station) to solve mixed subtraction problems within 10.',
        descriptionNepali:
          'गाउँका ५ चुनौती केन्द्रहरू घुम्दै वस्तु हटाउने, शून्य घटाउने, ठाडो घटाउ र फरक पत्ता लगाउने विविध अभ्यासहरू हल गर्नुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 8,
        chapterName: 'Subtraction up to 10',
        chapterNameNepali: '१० सम्मका सङ्ख्याहरूको घटाउ',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch8-challenge-world',
        runtimeUrl: '/simulations/class1-math/ch8/challenge-world',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Apply diverse subtraction strategies across 5 authentic village stations',
          'Solve mixed removal, zero-subtraction, and difference questions',
          'Achieve chapter mastery with persistent progress tracking',
        ],
        learningObjectivesNepali: [
          'गाउँका ५ विविध केन्द्रहरूमा घटाउका सिपहररू व्यवहारिक रूपमा प्रयोग गर्ने',
          'वस्तु हटाउने, शून्यको घटाउ र फरक निकाल्ने विविध प्रश्नहरू हल गर्ने',
          'मूल्याङ्कनमा सफलता प्राप्त गरी प्रगति विवरण सुरक्षित गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 8', 'Challenge', 'Village Stations', 'Assessment'],
      },
    ];

    for (const sim of class1MathCh8Sims) {
      const res = await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
      console.log(`[SEED OK] ${res.code}: ${res.title} (${res.componentKey})`);
    }

    console.log('Class 1 Mathematics Chapter 8 simulations seeded successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Chapter 8:', err);
    process.exit(1);
  }
}

seedCh8();

