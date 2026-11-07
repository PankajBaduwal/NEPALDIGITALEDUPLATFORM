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

async function seedCh9() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB:', MONGODB_URI);

    const class1MathCh9Sims = [
      {
        code: 'SIM-MATH-G1-CH9-01',
        title: 'Number Garden 11–20',
        titleNepali: '११ देखि २० सम्मको सङ्ख्या बगैँचा',
        description:
          'Count apples, flowers, leaves, and butterflies in a 3D garden to discover and recognize quantities from 11 to 20 with dual numerals.',
        descriptionNepali:
          '३डी बगैँचामा ११ देखि २० सम्मका स्याउ, फूल, पात र पुतलीहरू गन्दै सङ्ख्या र देवनागरी अङ्कहरू पहिचान गर्ने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 9,
        chapterName: 'Numbers 11 to 20',
        chapterNameNepali: '११ देखि २० सम्मका सङ्ख्याहरू',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch9-garden',
        runtimeUrl: '/simulations/class1-math/ch9/garden',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Count collections of objects from 11 to 20 accurately without omission',
          'Recognize numerals 11–20 and Devanagari ११–२०',
          'Match counted quantities with corresponding numeral cards',
          'Read spoken number names from Eleven (एघार) to Twenty (बीस)',
        ],
        learningObjectivesNepali: [
          '११ देखि २० सम्मका वस्तुहरू नछुटाई शुद्ध रूपमा गन्ने',
          'अङ्क ११ देखि २० र देवनागरी ११ देखि २० पहिचान गर्ने',
          'गनेका वस्तुहरूलाई सही सङ्ख्या कार्डसँग जोडा मिलाउने',
          'एघार देखि बीससम्मका सङ्ख्याका नामहरू सुन्ने र बोल्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 9', 'Numbers 11-20', 'Counting', 'Garden', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH9-02',
        title: 'Make a Group of Ten',
        titleNepali: 'दशको समूह बनाऔँ',
        description:
          'Group ten objects together to form a ten-bundle, add individual ones, and understand how numbers from 11 to 20 are constructed (10 + N).',
        descriptionNepali:
          '१० वटा वस्तुको एउटा समूह बनाएर थप एकाइ जोड्दै ११ देखि २० सम्मका सङ्ख्याहरू कसरी बन्छन् भनी बुझ्ने आधारभूत अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 9,
        chapterName: 'Numbers 11 to 20',
        chapterNameNepali: '११ देखि २० सम्मका सङ्ख्याहरू',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch9-group-ten',
        runtimeUrl: '/simulations/class1-math/ch9/group-ten',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Group 10 loose units into a single ten-bundle',
          'Observe that 11–19 consist of 1 group of ten plus additional single units',
          'Understand that 20 consists of 2 complete groups of ten',
        ],
        learningObjectivesNepali: [
          '१० वटा छुट्टाछुट्टै वस्तुलाई एकमुष्ट दशको समूह बनाउने',
          '११ देखि १९ सम्मका सङ्ख्यामा १ दश र थप एकाइ हुन्छन् भनी बुझ्ने',
          '२० मा दशका २ वटा पूर्ण समूह हुन्छन् भनी प्रयोगात्मक रूपमा सिक्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 9', 'Group of Ten', 'Tens and Ones', '10 Plus N'],
      },
      {
        code: 'SIM-MATH-G1-CH9-03',
        title: 'Tens and Ones Explorer',
        titleNepali: 'दहाइ र एकाइ पत्ता लगाऔँ',
        description:
          'Explore place value for numbers 11–20 using ten-unit rods (दहाइ) and unit cubes (एकाइ) on an interactive classroom board.',
        descriptionNepali:
          'दहाइ (१० को छड) र एकाइ (छुट्टाटुट्टै क्युब) को प्रयोग गरी ११ देखि २० सम्मका सङ्ख्याहरूको स्थानमान बुझ्ने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 9,
        chapterName: 'Numbers 11 to 20',
        chapterNameNepali: '११ देखि २० सम्मका सङ्ख्याहरू',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch9-tens-ones',
        runtimeUrl: '/simulations/class1-math/ch9/tens-ones',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Identify the number of tens and ones in numbers from 11 to 20',
          'Place ten-rods in the Tens column and single cubes in the Ones column',
          'Connect 1 Ten + 6 Ones with the numeral 16 (१६)',
        ],
        learningObjectivesNepali: [
          '११ देखि २० सम्मका सङ्ख्यामा कति दहाइ र कति एकाइ छन् छुट्याउने',
          'दहाइको कोठामा १० को छड र एकाइको कोठामा क्युबहरू मिलाउने',
          '१ दहाइ र ६ एकाइ मिलेर १६ बन्छ भनी गणितीय सम्बन्ध बुझ्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 9', 'Place Value', 'Tens', 'Ones', 'Dahai Ekai'],
      },
      {
        code: 'SIM-MATH-G1-CH9-04',
        title: 'Number Line Adventure',
        titleNepali: 'सङ्ख्यारेखाको साहसिक यात्रा',
        description:
          'Navigate a 3D stepping-stone number line from 0 to 20 to master number before, after, between, and missing numbers in sequence.',
        descriptionNepali:
          '० देखि २० सम्मको सङ्ख्यारेखामा अगाडिको, पछाडिको र बीचको सङ्ख्या तथा खाली क्रम पत्ता लगाउने साहसिक यात्रा।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 9,
        chapterName: 'Numbers 11 to 20',
        chapterNameNepali: '११ देखि २० सम्मका सङ्ख्याहरू',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch9-number-line',
        runtimeUrl: '/simulations/class1-math/ch9/number-line',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Locate numerals 11 to 20 on an interactive number line',
          'Identify the number before and after a given number (e.g. before 15 is 14)',
          'Identify the number between two given numbers (e.g. between 12 and 14 is 13)',
          'Complete missing sequence gaps on the number path',
        ],
        learningObjectivesNepali: [
          'सङ्ख्यारेखामा ११ देखि २० सम्मका सङ्ख्याहरूको स्थान पहिचान गर्ने',
          'कुनै सङ्ख्याको ठीक अगाडि र ठीक पछाडिको सङ्ख्या पत्ता लगाउने',
          'दुई सङ्ख्याको ठीक बीचमा पर्ने सङ्ख्या पहिचान गर्ने',
          'क्रममा छुटेका खाली सङ्ख्याहरू भर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 9', 'Number Line', 'Before After', 'Sequence'],
      },
      {
        code: 'SIM-MATH-G1-CH9-05',
        title: 'Number Ordering and Challenge World',
        titleNepali: 'सङ्ख्या मिलाउने चुनौती संसार',
        description:
          'Explore 5 village challenge stations to master Nepali number names (एघार to बीस), smallest/largest comparison, and ascending/descending order.',
        descriptionNepali:
          'गाउँका ५ केन्द्रहरूमा सङ्ख्याका नाम (एघार देखि बीस), सानो/ठूलो तुलना र बढ्दो/घट्दो क्रम मिलाउने विविध चुनौतीहरू।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 9,
        chapterName: 'Numbers 11 to 20',
        chapterNameNepali: '११ देखि २० सम्मका सङ्ख्याहरू',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch9-challenge-world',
        runtimeUrl: '/simulations/class1-math/ch9/challenge-world',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Match numerals with Nepali written number names (एघार to बीस)',
          'Identify smallest and largest numbers in a group of 4 cards',
          'Arrange numbers 11–20 in ascending and descending orders',
          'Complete mixed sequence challenges with progress persistence',
        ],
        learningObjectivesNepali: [
          'सङ्ख्यालाई अक्षरेपी नाम (एघार देखि बीस) सँग जोडा मिलाउने',
          'चारवटा सङ्ख्याको समूहबाट सबैभन्दा सानो र ठूलो सङ्ख्या पत्ता लगाउने',
          'सङ्ख्याहरूलाई बढ्दो (सानोदेखि ठूलो) र घट्दो क्रममा मिलाउने',
          'मूल्याङ्कनमा सफलता प्राप्त गरी प्रगति सुरक्षित गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 9', 'Number Names', 'Ordering', 'Ascending', 'Challenge'],
      },
    ];

    for (const sim of class1MathCh9Sims) {
      const res = await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
      console.log(`[SEED OK] ${res.code}: ${res.title} (${res.componentKey})`);
    }

    console.log('Class 1 Mathematics Chapter 9 simulations seeded successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Chapter 9:', err);
    process.exit(1);
  }
}

seedCh9();

