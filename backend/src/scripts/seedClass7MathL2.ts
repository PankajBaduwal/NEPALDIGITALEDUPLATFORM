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

const CLASS7_L2_SIMS = [
  {
    code: 'SIM-MATH-G7-L2-01',
    key: 'class7-math-l2-square-root-discovery',
    title: 'Square and Square Root Discovery Lab',
    titleNepali: 'वर्ग र वर्गमूल खोजी प्रयोगशाला',
    description: 'Explore the concept of square numbers through tile arrangements, interactive grids, square roots as equal factors, and 3D square land area models.',
    descriptionNepali: 'टाइल्स मिलाएर वर्ग सङ्ख्या निर्माण गर्ने, ग्रिडमा अन्वेषण गर्ने, वर्गमूल बुझ्ने र ३D वर्गाकार जग्गाको क्षेत्रफल हिसाब गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand the concept of square numbers by multiplying a number by itself',
      'Discover square root as one of two equal factors',
      'Explore the geometrical relationship between side length and area of a square in 3D',
    ],
    learningObjectivesNepali: [
      'कुनै सङ्ख्यालाई सोही सङ्ख्याले गुणन गरी वर्ग सङ्ख्या बुझ्ने',
      'वर्गमूललाई दुई बराबर गुणनखण्डमध्ये एकका रूपमा पहिचान गर्ने',
      '३D मा वर्गाकार जग्गाको लम्बाइ र क्षेत्रफलको सम्बन्ध हिसाब गर्ने',
    ],
    tags: ['math', 'grade7', 'whole-number', 'square', 'square-root', '3d'],
  },
  {
    code: 'SIM-MATH-G7-L2-02',
    key: 'class7-math-l2-square-root-studio',
    title: 'Square Root Calculation Studio',
    titleNepali: 'वर्गमूल गणना प्रयोगशाला',
    description: 'Master the three textbook square root methods: continuous odd subtraction, prime factorisation with factor pairing, and step-by-step long division.',
    descriptionNepali: 'पाठ्यपुस्तकका तीनवटै वर्गमूल विधिहरू सिक्ने: लगातार बिजोर सङ्ख्या घटाउ, अभाज्य गुणनखण्ड जोडी र चरणबद्ध भाग विधि।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate square root using continuous odd subtraction method',
      'Calculate square root using prime factorisation and factor pairing',
      'Perform long division method for finding square roots of large numbers',
      'Determine the least number to multiply or divide to form a perfect square',
    ],
    learningObjectivesNepali: [
      'लगातार बिजोर सङ्ख्या घटाएर वर्गमूल निकाल्न सिक्ने',
      'अभाज्य गुणनखण्ड गरी जोडी बनाएर वर्गमूल निकाल्ने',
      'भाग विधिद्वारा ठूला सङ्ख्याको वर्गमूल निकाल्ने',
      'पूर्ण वर्ग बनाउन न्यूनतम गुणन वा भाग गर्नुपर्ने सङ्ख्या पत्ता लगाउने',
    ],
    tags: ['math', 'grade7', 'whole-number', 'square-root-methods', 'division-method', 'prime-factorisation'],
  },
  {
    code: 'SIM-MATH-G7-L2-03',
    key: 'class7-math-l2-cube-root-explorer',
    title: 'Cube and Cube Root Explorer',
    titleNepali: 'घन र घनमूल खोजी संसार',
    description: 'Construct 3D unit cubes, understand volume formula (side cubed), calculate cube roots using prime factorisation triplet grouping, and solve real-life cubical water tank challenges.',
    descriptionNepali: '३D एकाइ घनहरू मिलाएर ठोस बनाउने, आयतन सूत्र बुझ्ने, अभाज्य गुणनखण्ड त्रिकबाट घनमूल निकाल्ने र ३D पानी ट्यांकीको हिसाब गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand cube numbers through 3D unit cube construction and rotation',
      'Discover cube root as one of three equal factors',
      'Group prime factors into triplets to compute cube roots',
      'Apply cube roots to find the dimensions of cubical water tanks and storage boxes',
    ],
    learningObjectivesNepali: [
      '३D एकाइ घनहरू मिलाएर घन सङ्ख्याको अवधारणा बुझ्ने',
      'घनमूललाई तीन बराबर गुणनखण्डमध्ये एकका रूपमा पहिचान गर्ने',
      'अभाज्य गुणनखण्डको त्रिक बनाएर घनमूल निकाल्ने',
      'घनाकार पानी ट्यांकीको आयतनबाट लम्बाइ निकाल्ने व्यवहारिक समस्या समाधान गर्ने',
    ],
    tags: ['math', 'grade7', 'whole-number', 'cube', 'cube-root', '3d', 'volume'],
  },
  {
    code: 'SIM-MATH-G7-L2-04',
    key: 'class7-math-l2-hcf-discovery',
    title: 'HCF Discovery & Problem-Solving Lab',
    titleNepali: 'महत्तम समापवर्तक (म.स.) खोजी प्रयोगशाला',
    description: 'Explore factors, common factors, and highest common factor (HCF) using factor listing, prime factorisation ladders, continuous division, and Harimaya equal fruit distribution challenge.',
    descriptionNepali: 'साझा गुणनखण्ड, अभाज्य गुणनखण्ड, निरन्तर भाग विधि र हरिमायाको फलफूल बराबर बाँड्ने व्यवहारिक समस्याबाट म.स. सिक्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify factors and common factors of whole numbers',
      'Compute HCF by prime factorisation across multiple numbers',
      'Perform continuous Euclidean division method to find HCF',
      'Apply HCF in equal distribution of items without leftovers',
    ],
    learningObjectivesNepali: [
      'पूर्ण सङ्ख्याका गुणनखण्ड र साझा गुणनखण्ड पहिचान गर्ने',
      'अभाज्य गुणनखण्ड विधिबाट म.स. निकाल्ने',
      'निरन्तर भाग विधिद्वारा म.स. पत्ता लगाउने',
      'फलफूल तथा राहत सामग्री बराबर बाँडफाँड गर्ने व्यवहारिक समस्या समाधान गर्ने',
    ],
    tags: ['math', 'grade7', 'whole-number', 'hcf', 'factors', 'euclidean-division', 'distribution'],
  },
  {
    code: 'SIM-MATH-G7-L2-05',
    key: 'class7-math-l2-lcm-discovery',
    title: 'LCM Discovery and Real-Life Challenge',
    titleNepali: 'लघुत्तम समापवर्त्य (ल.स.) खोजी प्रयोगशाला',
    description: 'Discover multiples, common multiples, and LCM using number lines, rod measuring challenges (10, 20, 30 cm), prime factorisation highest powers, and bell-ringing time cycles.',
    descriptionNepali: 'अपवर्त्य सूची, छड नाप्ने परीक्षण, अभाज्य गुणनखण्डको अधिकतम घाताङ्क र घण्टी बज्ने समय चक्रबाट ल.स. सिक्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify multiples and lowest common multiples of numbers',
      'Compute LCM using prime factorisation highest powers method',
      'Apply LCM to solve rod measuring and distance problems',
      'Solve time-cycle problems such as recurring bell ringing intervals',
      'Calculate least student group sizes and algebraic LCM problems',
    ],
    learningObjectivesNepali: [
      'सङ्ख्याका अपवर्त्य र सबैभन्दा सानो साझा अपवर्त्य पत्ता लगाउने',
      'अभाज्य गुणनखण्डको अधिकतम घाताङ्क प्रयोग गरी ल.स. निकाल्ने',
      'छड नाप्ने र न्यूनतम दुरी पत्ता लगाउने व्यवहारिक हिसाब गर्ने',
      'घण्टी बज्ने समय चक्र र विद्यार्थी समूह विभाजनका समस्या समाधान गर्ने',
    ],
    tags: ['math', 'grade7', 'whole-number', 'lcm', 'multiples', 'bell-cycle', 'grouping'],
  },
];

async function seedClass7MathL2() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected successfully!');

    for (const item of CLASS7_L2_SIMS) {
      const doc = {
        code: item.code,
        title: item.title,
        titleNepali: item.titleNepali,
        description: item.description,
        descriptionNepali: item.descriptionNepali,
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [7],
        chapterNumber: 2,
        chapterName: 'Whole Number',
        chapterNameNepali: 'पूर्ण सङ्ख्या',
        simulationType: item.simulationType,
        componentKey: item.key,
        difficulty: 'INTERMEDIATE',
        estimatedDurationMinutes: 15,
        learningObjectives: item.learningObjectives,
        learningObjectivesNepali: item.learningObjectivesNepali,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: item.tags,
      };

      await Simulation.findOneAndUpdate({ code: item.code }, doc, { upsert: true, new: true });
      console.log(`✓ Seeded Grade 7 Lesson 2 simulation: [${item.code}] ${item.title}`);
    }

    console.log('All 5 Grade 7 Lesson 2 simulations successfully registered in MongoDB!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Class 7 Lesson 2 simulations:', err);
    process.exit(1);
  }
}

seedClass7MathL2();
