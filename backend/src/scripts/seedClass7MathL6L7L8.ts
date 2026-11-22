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

const CLASS7_L6_L7_L8_SIMS = [
  // ── LESSON 6: RATIO AND PROPORTION (अनुपात र समानुपात) ─────────────
  {
    code: 'SIM-MATH-G7-L6-01',
    key: 'class7-math-l6-ratio-discovery',
    chapterNumber: 6,
    chapterName: 'Ratio and Proportion',
    chapterNameNepali: 'अनुपात र समानुपात',
    title: 'Ratio Discovery and Comparison World',
    titleNepali: 'अनुपात खोजी र तुलना संसार',
    description: 'Explore the concept of ratio through ball colors, simplest form using HCF, same unit conversion, and part-to-part vs part-to-whole fraction relationships.',
    descriptionNepali: 'रङ्गीन बलहरू, म.स. द्वारा सरल रूप, समान एकाइ रूपान्तरण र भिन्नसँगको सम्बन्ध मार्फत अनुपात अन्वेषण गर्ने अन्तरक्रियात्मक प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand comparison of two quantities by division', 'Convert ratios to simplest form using HCF', 'Convert different units into the same unit before comparing', 'Distinguish between fraction and ratio'],
    learningObjectivesNepali: ['भागद्वारा परिमाणहरूको तुलना गरी अनुपात बुझ्ने', 'म.स. प्रयोग गरी अनुपातलाई सरल रूपमा लैजाने', 'अनुपात निकाल्नुअघि एउटै एकाइमा रूपान्तरण गर्ने', 'भिन्न र अनुपात बीचको सम्बन्ध बुझ्ने'],
    tags: ['math', 'grade7', 'ratio', 'simplest-form', 'unit-conversion', 'fraction'],
  },
  {
    code: 'SIM-MATH-G7-L6-02',
    key: 'class7-math-l6-proportion-lab',
    chapterNumber: 6,
    chapterName: 'Ratio and Proportion',
    chapterNameNepali: 'अनुपात र समानुपात',
    title: 'Proportion and Cross-Multiplication Lab',
    titleNepali: 'समानुपात र बज्र गुणन प्रयोगशाला',
    description: 'Master proportion concepts, extremal and mean terms (a:b :: c:d), cross-multiplication (a*d = b*c), 4-quantity proportion verification, and solving for missing term x.',
    descriptionNepali: 'समानुपातको अवधारणा, चरम र मध्यम पदहरूको सम्बन्ध (ad = bc), ४ पदहरूको समानुपात जाँच र अज्ञात पद x पत्ता लगाउने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand equality of two ratios as a proportion', 'Identify extreme and mean terms', 'Verify whether 4 numbers form a proportion using the product rule', 'Solve for unknown term x using cross-multiplication'],
    learningObjectivesNepali: ['बराबर अनुपात नै समानुपात हो भनी बुझ्ने', 'चरम र मध्यम पद पहिचान गर्ने', 'गुणनफल नियमबाट समानुपात परीक्षण गर्ने', 'बज्र गुणनद्वारा अज्ञात पद x को मान निकाल्ने'],
    tags: ['math', 'grade7', 'proportion', 'extremes', 'means', 'cross-multiplication'],
  },
  {
    code: 'SIM-MATH-G7-L6-03',
    key: 'class7-math-l6-real-life',
    chapterNumber: 6,
    chapterName: 'Ratio and Proportion',
    chapterNameNepali: 'अनुपात र समानुपात',
    title: 'Ratio & Proportion in Real Life',
    titleNepali: 'अनुपात र समानुपातको व्यवहारिक प्रयोग',
    description: 'Real-world textbook applications: school population gender ratios, student heights, dividing money in given ratio (5:4), and orange price proportion calculations.',
    descriptionNepali: 'विद्यालयका छात्रछात्रा अनुपात, उचाइ तुलना, दिइएको अनुपातमा रकम बाँडफाँड र सुन्तलाको बजार भाउ हिसाब गर्ने व्यवहारिक प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Solve real-life ratio word problems', 'Divide amounts in a given ratio', 'Apply proportion to calculate proportional market prices'],
    learningObjectivesNepali: ['दैनिक जीवनका अनुपात समस्या हल गर्ने', 'दिइएको अनुपातमा रकम बाँडफाँड गर्ने', 'समानुपातबाट बजार मूल्य हिसाब गर्ने'],
    tags: ['math', 'grade7', 'ratio', 'proportion', 'real-life', 'money-sharing'],
  },

  // ── LESSON 7: PROFIT AND LOSS (नाफा र नोक्सान) ──────────────────────
  {
    code: 'SIM-MATH-G7-L7-01',
    key: 'class7-math-l7-market-pl',
    chapterNumber: 7,
    chapterName: 'Profit and Loss',
    chapterNameNepali: 'नाफा र नोक्सान',
    title: 'Virtual Marketplace Profit and Loss',
    titleNepali: 'भर्चुअल बजार नाफा र नोक्सान',
    description: 'Explore Cost Price (CP) and Selling Price (SP) in a market stall, compare SP > CP for Profit and CP > SP for Loss, and observe tilt on a balance scale.',
    descriptionNepali: 'बजार पसलमा क्रय मूल्य र विक्रय मूल्यको तुलना गरी नाफा, नोक्सान र सन्तुलन अवस्था (Break-even) बुझ्ने तराजु प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Identify Cost Price and Selling Price', 'Calculate Profit when SP > CP', 'Calculate Loss when CP > SP', 'Understand Break-Even condition'],
    learningObjectivesNepali: ['क्रय मूल्य र विक्रय मूल्य पहिचान गर्ने', 'SP > CP हुँदा नाफा निकाल्ने', 'CP > SP हुँदा नोक्सान निकाल्ने', 'नाफा र नोक्सान दुवै नहुने अवस्था बुझ्ने'],
    tags: ['math', 'grade7', 'profit', 'loss', 'cost-price', 'selling-price', 'market'],
  },
  {
    code: 'SIM-MATH-G7-L7-02',
    key: 'class7-math-l7-pl-percentage',
    chapterNumber: 7,
    chapterName: 'Profit and Loss',
    chapterNameNepali: 'नाफा र नोक्सान',
    title: 'Profit and Loss Percentage Studio',
    titleNepali: 'नाफा र नोक्सान प्रतिशत कार्यशाला',
    description: 'Calculate profit and loss percentage based on Cost Price (CP) using interactive formulas, visual 100% baseline bar, and comparative product profitability.',
    descriptionNepali: 'क्रय मूल्यको आधारमा नाफा प्रतिशत र नोक्सान प्रतिशत सूत्र प्रयोग गरी हिसाब गर्ने र विभिन्न सामानहरूको नाफा दर तुलना गर्ने कार्यशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Calculate Profit % = (Profit/CP) * 100%', 'Calculate Loss % = (Loss/CP) * 100%', 'Understand that percentage is always evaluated on Cost Price base'],
    learningObjectivesNepali: ['नाफा% = (नाफा / CP) × १००% हिसाब गर्ने', 'नोक्सान% = (नोक्सान / CP) × १००% हिसाब गर्ने', 'प्रतिशत सधैँ क्रय मूल्यमा आधारित हुन्छ भनी बुझ्ने'],
    tags: ['math', 'grade7', 'profit-percent', 'loss-percent', 'percentage', 'business'],
  },
  {
    code: 'SIM-MATH-G7-L7-03',
    key: 'class7-math-l7-cp-sp-studio',
    chapterNumber: 7,
    chapterName: 'Profit and Loss',
    chapterNameNepali: 'नाफा र नोक्सान',
    title: 'Cost Price & Selling Price Studio',
    titleNepali: 'क्रय मूल्य र विक्रय मूल्य प्रयोगशाला',
    description: 'Find Selling Price from Cost Price and Profit %, compute original Cost Price from Selling Price and profit margin, and establish target pricing strategies.',
    descriptionNepali: 'क्रय मूल्यबाट विक्रय मूल्य निकाल्ने, विक्रय मूल्यबाट साविक क्रय मूल्य पत्ता लगाउने र लक्षित नाफा मूल्य निर्धारण गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Find SP when CP and Profit % are known', 'Find CP when SP and Profit % are known', 'Calculate new selling price for target profit percentage'],
    learningObjectivesNepali: ['CP र नाफा% बाट SP निकाल्ने', 'SP र नाफा% बाट CP पत्ता लगाउने', 'इच्छित नाफाको लागि नयाँ विक्रय मूल्य निर्धारण गर्ने'],
    tags: ['math', 'grade7', 'selling-price', 'cost-price', 'formula-studio'],
  },
  {
    code: 'SIM-MATH-G7-L7-04',
    key: 'class7-math-l7-business-challenge',
    chapterNumber: 7,
    chapterName: 'Profit and Loss',
    chapterNameNepali: 'नाफा र नोक्सान',
    title: 'Real-Life Business & Overhead Expenses',
    titleNepali: 'व्यवहारिक व्यापार र अतिरिक्त खर्च',
    description: 'Explore real-world business scenarios: refrigerator transportation overhead, broken bulb damage losses, and house purchase-renovation-sale profit margins.',
    descriptionNepali: 'ढुवानी खर्च जोडेर कुल क्रय मूल्य निकाल्ने, फुटेको सामानको नोक्सान र घर मर्मत खर्चसहितको खुद नाफा हिसाब गर्ने व्यावहारिक प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Calculate total CP including overhead expenses (transportation, repairs)', 'Compute net gain or loss when some goods are damaged or lost', 'Analyze large-scale property investments'],
    learningObjectivesNepali: ['ढुवानी र मर्मत खर्च जोडेर जम्मा क्रय मूल्य निकाल्ने', 'सामान फुटफुट हुँदाको खुद नाफा/नोक्सान हिसाब गर्ने', 'घरजग्गा खरिद-बिक्रीको नाफा निकाल्ने'],
    tags: ['math', 'grade7', 'overhead', 'transportation', 'repairs', 'damaged-goods', 'business'],
  },

  // ── LESSON 8: UNITARY METHOD (एकाइ विधि) ───────────────────────────
  {
    code: 'SIM-MATH-G7-L8-01',
    key: 'class7-math-l8-unitary-discovery',
    chapterNumber: 8,
    chapterName: 'Unitary Method',
    chapterNameNepali: 'एकाइ विधि',
    title: 'Unitary Method Discovery Lab',
    titleNepali: 'एकाइ विधि खोजी प्रयोगशाला',
    description: 'Discover the 2-step unitary pattern: divide multiple units to find 1 unit cost, then multiply 1 unit to find target quantity (Bananas, Notebooks, and Grocery shopping).',
    descriptionNepali: 'धेरैबाट १ एकाइमा भाग गर्ने र १ बाट मागेको परिमाणमा गुणन गर्ने २-चरण एकाइ विधि (केरा, कापी र किराना सामान) खोजी प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand the unitary method: Multiple -> 1 (Divide) -> Target (Multiply)', 'Solve real-life grocery and shopping prices', 'Calculate dozen and bulk unit prices'],
    learningObjectivesNepali: ['एकाइ विधिको आधारभूत २ चरण बुझ्ने', 'दैनिक किराना किनमेलको हिसाब गर्ने', 'दर्जन र खुद्रा मूल्य हिसाब गर्ने'],
    tags: ['math', 'grade7', 'unitary-method', 'division', 'multiplication', 'shopping'],
  },
  {
    code: 'SIM-MATH-G7-L8-02',
    key: 'class7-math-l8-variation-explorer',
    chapterNumber: 8,
    chapterName: 'Unitary Method',
    chapterNameNepali: 'एकाइ विधि',
    title: 'Direct & Indirect Variation Explorer',
    titleNepali: 'प्रत्यक्ष र अप्रत्यक्ष विचरण अन्वेषक',
    description: 'Compare Direct Variation (y/x = constant straight line) and Indirect Variation (x * y = constant man-days curve) with interactive graph and classifier quiz.',
    descriptionNepali: 'प्रत्यक्ष विचरण (y/x = स्थिर) र अप्रत्यक्ष विचरण (x × y = स्थिर) को रेखाचित्र र अन्तरक्रियात्मक वर्गीकरण अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Distinguish between direct and indirect variation', 'Recognize constant ratio in direct variation and constant product in indirect variation', 'Interpret linear and inverse variation graphs', 'Classify everyday situations into direct or indirect variation'],
    learningObjectivesNepali: ['प्रत्यक्ष र अप्रत्यक्ष विचरण छुट्याउने', 'प्रत्यक्षमा अनुपात र अप्रत्यक्षमा गुणनफल स्थिर रहन्छ भनी बुझ्ने', 'विचरणका ग्राफहरू बुझ्ने', 'दैनिक जीवनका परिमाणहरूलाई वर्गीकरण गर्ने'],
    tags: ['math', 'grade7', 'direct-variation', 'indirect-variation', 'graph', 'man-days'],
  },
  {
    code: 'SIM-MATH-G7-L8-03',
    key: 'class7-math-l8-direct-solver',
    chapterNumber: 8,
    chapterName: 'Unitary Method',
    chapterNameNepali: 'एकाइ विधि',
    title: 'Direct Variation Problem Solver',
    titleNepali: 'प्रत्यक्ष विचरण समस्या समाधान',
    description: 'Solve textbook direct variation problems: sugar quantity and price, motorcycle petrol consumption and distance, and automated juice bottle packing rates.',
    descriptionNepali: 'चिनीको तौल र मूल्य, मोटरसाइकलको इन्धन खपत र कारखानाको मेसिन उत्पादन सम्बन्धी प्रत्यक्ष विचरण समस्या समाधान प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Solve direct variation word problems step-by-step', 'Calculate fuel mileage and travel range', 'Calculate machine production rates over time'],
    learningObjectivesNepali: ['प्रत्यक्ष विचरणका समस्याहरू चरणबद्ध समाधान गर्ने', 'इन्धन र यात्रा दुरी हिसाब गर्ने', 'कारखाना उत्पादन दर हिसाब गर्ने'],
    tags: ['math', 'grade7', 'direct-variation', 'mileage', 'sugar-cost', 'production'],
  },
  {
    code: 'SIM-MATH-G7-L8-04',
    key: 'class7-math-l8-indirect-solver',
    chapterNumber: 8,
    chapterName: 'Unitary Method',
    chapterNameNepali: 'एकाइ विधि',
    title: 'Indirect Variation & Work-Time Lab',
    titleNepali: 'अप्रत्यक्ष विचरण र काम-समय प्रयोगशाला',
    description: 'Master inverse variation: workers and completion days (M1*D1 = M2*D2), hostel ration consumption with new students, and workforce calculation for strict deadlines.',
    descriptionNepali: 'कामदार र लाग्ने दिन (M1D1 = M2D2), छात्रावासको खाद्यान्न रासन र तोकिएको म्यादमा काम सक्न चाहिने थप कामदार हिसाब गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Solve work and time problems using indirect variation formula M1*D1 = M2*D2', 'Calculate food ration duration when group size changes', 'Determine additional workers required to meet accelerated deadlines'],
    learningObjectivesNepali: ['काम र समयको अप्रत्यक्ष विचरण समस्या हल गर्ने', 'विद्यार्थी थपिँदा खाद्यान्न पुग्ने दिन निकाल्ने', 'म्यादभित्र काम सक्न थप कामदार सङ्ख्या पत्ता लगाउने'],
    tags: ['math', 'grade7', 'indirect-variation', 'work-time', 'hostel-food', 'deadline'],
  },
];

async function seedClass7MathL6L7L8() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected successfully!');

    for (const item of CLASS7_L6_L7_L8_SIMS) {
      const doc = {
        code: item.code,
        title: item.title,
        titleNepali: item.titleNepali,
        description: item.description,
        descriptionNepali: item.descriptionNepali,
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [7],
        chapterNumber: item.chapterNumber,
        chapterName: item.chapterName,
        chapterNameNepali: item.chapterNameNepali,
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

      await Simulation.findOneAndUpdate({ code: item.code }, doc, { upsert: true, returnDocument: 'after' });
      console.log(`✓ Seeded Grade 7 Lesson ${item.chapterNumber} simulation: [${item.code}] ${item.title}`);
    }

    console.log('All 11 Grade 7 Lessons 6, 7, 8 simulations successfully registered in MongoDB!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Class 7 Lessons 6, 7, 8 simulations:', err);
    process.exit(1);
  }
}

seedClass7MathL6L7L8();
