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

async function seedCh7() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB:', MONGODB_URI);

    const class1MathCh7Sims = [
      {
        code: 'SIM-MATH-G1-CH7-01',
        title: 'Addition Playground',
        titleNepali: 'जोड्ने खेलमैदान',
        description:
          'Combine two groups of real-world objects in a 3D village playground, move them together into a combined basket, and discover the total.',
        descriptionNepali:
          '३डी गाउँको खेलमैदानमा दुई समूहका वस्तुहरूलाई एकै ठाउँमा मिसाएर जम्मा सङ्ख्या पत्ता लगाउने र जोडको अवधारणा बुझ्ने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 7,
        chapterName: 'Addition up to 10',
        chapterNameNepali: 'योगफल १० सम्म आउने जोड',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch7-playground',
        runtimeUrl: '/simulations/class1-math/ch7/playground',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Understand addition as combining two groups of objects',
          'Count objects in Group A, Group B, and find the combined total',
          'Connect physical grouping with the addition equation A + B = Total',
          'Discover addition with zero (A + 0 = A)',
        ],
        learningObjectivesNepali: [
          'दुई समूहका वस्तुहरूलाई एकै ठाउँमा मिसाएर जोडको अवधारणा बुझ्ने',
          'समूह क र समूह ख का वस्तुहरू गनेर जम्मा योगफल पत्ता लगाउने',
          'वस्तुहरूको मिश्रणलाई गणितीय वाक्य क + ख = जम्मासँग जोड्ने',
          'शून्यको जोडको नियम बुझ्ने (क + ० = क)',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 7', 'Addition', 'Playground', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH7-02',
        title: 'Make the Total',
        titleNepali: 'जम्मा सङ्ख्या पत्ता लगाऔँ',
        description:
          'Solve picture-based addition activities across village markets and gardens, counting both groups and identifying the combined total.',
        descriptionNepali:
          'बगैँचा र बजारका दृश्यहरू हेरी दुई समूहका वस्तुहरू गनेर जम्मा योगफल पत्ता लगाउने चित्रमा आधारित जोडको अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 7,
        chapterName: 'Addition up to 10',
        chapterNameNepali: 'योगफल १० सम्म आउने जोड',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch7-make-total',
        runtimeUrl: '/simulations/class1-math/ch7/make-total',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Interpret pictorial addition scenes with authentic everyday objects',
          'Count two separate groups in a scene (e.g., perched birds + arriving birds)',
          'Select and verify the total quantity up to 10',
        ],
        learningObjectivesNepali: [
          'चित्रमा आधारित जोडका दृश्यहरू बुझेर वस्तुहरू गन्ने',
          'दुई छुट्टाछुट्टै समूहका वस्तुहरू गनेर जम्मा सङ्ख्या पत्ता लगाउने',
          '१० सम्मको जम्मा योगफल पहिचान गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 7', 'Make Total', 'Pictures', 'Visual Addition'],
      },
      {
        code: 'SIM-MATH-G1-CH7-03',
        title: 'Number Bond Houses',
        titleNepali: 'सङ्ख्याका घरहरू',
        description:
          'Explore colourful number houses to discover pairs and combinations that make 5, 6, 7, 8, 9, and 10 with interactive room distributions.',
        descriptionNepali:
          '५, ६, ७, ८, ९ र १० योगफल आउने विभिन्न सङ्ख्याका जोडीहरू घरका कोठाहरूमा वस्तु राखेर पत्ता लगाउने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 7,
        chapterName: 'Addition up to 10',
        chapterNameNepali: 'योगफल १० सम्म आउने जोड',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch7-number-houses',
        runtimeUrl: '/simulations/class1-math/ch7/number-houses',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Explore number combinations that sum to 5, 6, 7, 8, 9, and 10',
          'Distribute objects across two rooms in a number house',
          'Solve missing-part puzzles (Part A + ? = Total)',
        ],
        learningObjectivesNepali: [
          '५, ६, ७, ८, ९ र १० योगफल आउने सङ्ख्याका जोडीहरू पत्ता लगाउने',
          'घरका दुई कोठामा वस्तुहरू विभाजन गरी जोडी बनाउने',
          'खाली कोठामा कति चाहिन्छ पत्ता लगाउने चुनौती हल गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 7', 'Number Bonds', 'Make 5', 'Make 10', 'Partitions'],
      },
      {
        code: 'SIM-MATH-G1-CH7-04',
        title: 'Count On Adventure',
        titleNepali: 'गनेर जोडौँ',
        description:
          'Learn the counting-on addition strategy on a stepping-stone path, starting at the first number and stepping forward to find the total.',
        descriptionNepali:
          'सङ्ख्या ढुङ्गाहरूमा पहिलो सङ्ख्याबाट अगाडि पाइला चाल्दै सजिलै जोड गर्ने गन्ती विधि (Counting-on) सिक्नुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 7,
        chapterName: 'Addition up to 10',
        chapterNameNepali: 'योगफल १० सम्म आउने जोड',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch7-count-on',
        runtimeUrl: '/simulations/class1-math/ch7/count-on',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Master counting-on as an efficient addition strategy',
          'Start at the first number and count forward by the second number',
          'Reinforce addition concepts without recounting from 1 every time',
        ],
        learningObjectivesNepali: [
          'पहिलो सङ्ख्याबाट अगाडि गन्दै जाने सजिलो जोड विधि सिक्ने',
          'सुरुदेखि सबै नगनी पहिलो सङ्ख्याबाट थप पाइला चाल्ने',
          '१० सम्मका जोडहरू आत्मविश्वासका साथ हल गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 7', 'Counting On', 'Addition Strategy', 'Path'],
      },
      {
        code: 'SIM-MATH-G1-CH7-05',
        title: 'Addition Equation Studio',
        titleNepali: 'जोडका वाक्य बनाऔँ',
        description:
          'Connect real-world object groups with the mathematical symbols plus (+) and equals (=) to build simple addition sentences.',
        descriptionNepali:
          'वस्तुहरूको समूहलाई जोड (+) र बराबर (=) चिन्हसँग जोडेर सही गणितीय वाक्य बनाउने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 7,
        chapterName: 'Addition up to 10',
        chapterNameNepali: 'योगफल १० सम्म आउने जोड',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch7-equation-studio',
        runtimeUrl: '/simulations/class1-math/ch7/equation-studio',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Understand the purpose and meaning of the plus sign (+)',
          'Understand the purpose and meaning of the equals sign (=)',
          'Construct complete addition equations (A + B = C) from visual groups',
          'Complete missing number sentences within sums up to 10',
        ],
        learningObjectivesNepali: [
          'जोड चिन्ह (+) को अर्थ र प्रयोग बुझ्ने',
          'बराबर चिन्ह (=) को अर्थ र प्रयोग बुझ्ने',
          'वस्तुहरूको चित्रबाट गणितीय वाक्य (क + ख = ग) निर्माण गर्ने',
          '१० सम्मका खाली ठाउँ भर्ने गणितीय वाक्य पूरा गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 7', 'Equations', 'Plus Sign', 'Equals Sign', 'Studio'],
      },
    ];

    for (const sim of class1MathCh7Sims) {
      const res = await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
      console.log(`[SEED OK] ${res.code}: ${res.title} (${res.componentKey})`);
    }

    console.log('Class 1 Mathematics Chapter 7 simulations seeded successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Chapter 7:', err);
    process.exit(1);
  }
}

seedCh7();

