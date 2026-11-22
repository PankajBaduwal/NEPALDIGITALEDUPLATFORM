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

const CLASS8_U5_U6_U7_SIMS = [
  // ── UNIT 5: PROFIT AND LOSS (नाफा र नोक्सान) ──────────────────────────
  {
    code: 'SIM-MATH-G8-U5-01',
    key: 'class8-math-u5-profit-loss-marketplace',
    chapterNumber: 5,
    chapterName: 'Profit and Loss',
    chapterNameNepali: 'नाफा र नोक्सान',
    title: 'Profit and Loss Interactive Marketplace',
    titleNepali: 'नाफा र नोक्सान अन्तरक्रियात्मक बजार',
    description: 'Explore fundamental trade arithmetic: Cost Price (CP), Selling Price (SP), Profit, Loss, and percentage calculations on Cost Price with interactive visual goods and CDC textbook presets.',
    descriptionNepali: 'क्रय मूल्य (CP), बिक्री मूल्य (SP), नाफा, नोक्सान र नाफा/नोक्सान प्रतिशतको आधारभूत व्यापारिक हिसाब अन्तरक्रियात्मक बजार र पाठ्यपुस्तक उदाहरणहरूबाट सिक्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand the relationship between Cost Price (CP) and Selling Price (SP)',
      'Calculate Profit (SP - CP) and Loss (CP - SP)',
      'Calculate Profit % and Loss % based strictly on Cost Price',
      'Solve reverse problems: Finding CP when SP and Profit/Loss % are given',
    ],
    learningObjectivesNepali: [
      'क्रय मूल्य (CP) र बिक्री मूल्य (SP) बीचको सम्बन्ध बुझ्न',
      'नाफा (SP - CP) र नोक्सान (CP - SP) गणना गर्न',
      'क्रय मूल्यमा आधारित नाफा प्रतिशत र नोक्सान प्रतिशत निकाल्न',
      'SP र नाफा/नोक्सान % दिइएको अवस्थामा CP पत्ता लगाउने उल्टो समस्या समाधान गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-5', 'profit-and-loss', 'cp', 'sp', 'profit-percent', 'loss-percent'],
  },
  {
    code: 'SIM-MATH-G8-U5-02',
    key: 'class8-math-u5-discount-smart-shopping',
    chapterNumber: 5,
    chapterName: 'Profit and Loss',
    chapterNameNepali: 'नाफा र नोक्सान',
    title: 'Discount and Smart Shopping Lab',
    titleNepali: 'छुट र किनमेल प्रयोगशाला',
    description: 'Master Marked Price (MP), Discount Amount, Discount Percentage, Selling Price after Discount, and understand why equal markup and discount percentages result in a net loss.',
    descriptionNepali: 'अङ्कित मूल्य (MP), छुट रकम, छुट प्रतिशत, छुटपछिको बिक्री मूल्य र बराबर प्रतिशतले बढाएर त्यति नै छुट दिँदा किन नोक्सान हुन्छ भन्ने अवधारणा सिक्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand Marked Price (MP) and how discount is always calculated on MP',
      'Calculate Discount Amount = (MP × Discount %) ÷ 100 and SP = MP - Discount',
      'Find Marked Price when SP and Discount % are given: MP = SP × 100 ÷ (100 - D%)',
      'Discover the merchant trap: equal markup and discount always leads to net loss',
    ],
    learningObjectivesNepali: [
      'अङ्कित मूल्य (MP) र छुट सधैं अङ्कित मूल्यमा गणना हुन्छ भन्ने नियम बुझ्न',
      'छुट रकम = (MP × D%) ÷ १०० र SP = MP - छुट हिसाब गर्न',
      'SP र छुट % दिँदा सुरुको MP पत्ता लगाउन',
      'समान प्रतिशत बढाएर समान प्रतिशत छुट दिँदा हुने घाटाको रहस्य बुझ्न',
    ],
    tags: ['math', 'grade-8', 'unit-5', 'discount', 'marked-price', 'smart-shopping', 'selling-price'],
  },
  {
    code: 'SIM-MATH-G8-U5-03',
    key: 'class8-math-u5-business-profit-loss',
    chapterNumber: 5,
    chapterName: 'Profit and Loss',
    chapterNameNepali: 'नाफा र नोक्सान',
    title: 'Business Profit and Loss Challenge',
    titleNepali: 'व्यापारिक नाफा-नोक्सान चुनौती',
    description: 'Comprehensive business simulator connecting Cost Price, Markup %, Marked Price, Discount %, Selling Price, and Final Net Profit % on CP with shop strategy duel comparison and reverse pricing.',
    descriptionNepali: 'क्रय मूल्य, बढाएको प्रतिशत, अङ्कित मूल्य, छुट, बिक्री मूल्य र खुद नाफा/नोक्सान चक्रलाई जोड्ने पूर्ण व्यापारिक सिमुलेटर र पसल रणनीति तुलना।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Trace the complete commercial cash flow: CP → Markup → MP → Discount → SP → Net Profit/Loss',
      'Compare competing shop strategies with different markups and discount schemes',
      'Calculate required Marked Price to guarantee a target profit after offering a discount',
      'Solve multi-step CDC Grade 8 textbook word problems',
    ],
    learningObjectivesNepali: [
      'पूर्ण व्यापारिक प्रक्रिया: CP → Markup → MP → Discount → SP → खुद नाफा/नोक्सान बुझ्न',
      'फरक बढाएको दर र छुट दर भएका पसलहरूको रणनीति तुलना गर्न',
      'ग्राहकलाई छुट दिएर पनि चाहेको नाफा कमाउन कति अङ्कित मूल्य तोक्ने हिसाब गर्न',
      'CDC पाठ्यपुस्तकका बहु-चरणीय व्यावहारिक समस्याहरू समाधान गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-5', 'business-cycle', 'markup', 'shop-duel', 'reverse-pricing'],
  },

  // ── UNIT 6: UNITARY METHOD (एकाइ विधि) ────────────────────────────────
  {
    code: 'SIM-MATH-G8-U6-01',
    key: 'class8-math-u6-direct-variation-lab',
    chapterNumber: 6,
    chapterName: 'Unitary Method',
    chapterNameNepali: 'एकाइ विधि',
    title: 'Direct Variation Discovery Lab',
    titleNepali: 'प्रत्यक्ष विचरण अन्वेषण प्रयोगशाला',
    description: 'Explore Direct Variation (y ∝ x) where the ratio y/x = k remains constant. Solve single-step and compound multi-variable direct variation problems (workers, days, total work/wages).',
    descriptionNepali: 'प्रत्यक्ष विचरण (y ∝ x) मा अनुपात y/x = k स्थिर रहने नियम अन्वेषण गर्ने र एक-चर तथा मिश्रित प्रत्यक्ष एकाइ विधि (कामदार, दिन र ज्याला/काम) हल गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify direct variation: as one quantity increases, the other increases proportionally',
      'Understand the constant ratio k = y/x across various real-life scenarios',
      'Solve single unitary problems by finding the value of 1 unit first',
      'Solve compound multi-quantity direct variation problems with workers, days, and total earnings',
    ],
    learningObjectivesNepali: [
      'प्रत्यक्ष विचरण पहिचान गर्न: एउटा बढ्दा अर्को पनि सोही अनुपातमा बढ्छ',
      'अनुपात अचर k = y/x को नियम बुझ्न',
      'पहिले १ एकाइको मान निकालेर सोधिएको परिमाणको मान पत्ता लगाउन',
      'कामदार संख्या, दिन र कुल ज्यालासम्बन्धी मिश्रित प्रत्यक्ष एकाइ विधि हल गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-6', 'unitary-method', 'direct-variation', 'proportionality-constant', 'compound-unitary'],
  },
  {
    code: 'SIM-MATH-G8-U6-02',
    key: 'class8-math-u6-indirect-variation-work-time',
    chapterNumber: 6,
    chapterName: 'Unitary Method',
    chapterNameNepali: 'एकाइ विधि',
    title: 'Indirect Variation and Work-Time Lab',
    titleNepali: 'अप्रत्यक्ष विचरण र कार्य-समय प्रयोगशाला',
    description: 'Master Indirect (Inverse) Variation where the product x · y = k remains constant. Explore workers vs. days, uniform speed vs. travel time, and daily hours required for construction projects.',
    descriptionNepali: 'अप्रत्यक्ष विचरण (x · y = k अचर) मा कामदार र दिन, गति र समय तथा बाँसको टहरो निर्माणमा दैनिक कार्यघण्टाको हिसाब चरणबद्ध एकाइ विधिबाट सिक्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Recognize indirect variation: as one quantity increases, the other decreases proportionally',
      'Understand that 1 worker takes MORE days to finish a task (multiplication step in unitary method)',
      'Explore inverse proportionality in speed and travel time',
      'Solve CDC textbook shelter construction problems with workers, days, and daily work hours',
    ],
    learningObjectivesNepali: [
      'अप्रत्यक्ष विचरण पहिचान गर्न: एउटा परिमाण बढ्दा अर्को परिमाण घट्छ',
      '१ जना कामदारलाई काम गर्न धेरै दिन लाग्ने हुनाले गुणन गर्नुपर्छ भन्ने नियम बुझ्न',
      'सवारी साधनको गति र यात्रा समयबीचको अप्रत्यक्ष सम्बन्ध बुझ्न',
      'कामदार, दिन र दैनिक घण्टासम्बन्धी टहरो निर्माणका पाठ्यपुस्तक समस्याहरू हल गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-6', 'indirect-variation', 'inverse-variation', 'work-and-time', 'speed-time'],
  },
  {
    code: 'SIM-MATH-G8-U6-03',
    key: 'class8-math-u6-unitary-real-life-solver',
    chapterNumber: 6,
    chapterName: 'Unitary Method',
    chapterNameNepali: 'एकाइ विधि',
    title: 'Real-Life Unitary Method Solver & Arrow Method',
    titleNepali: 'व्यावहारिक एकाइ विधि र तीर विधि',
    description: 'Classify variation types, master the Arrow Method (↑ ↑ vs ↑ ↓), and solve complex practical scenarios including army barrack / hostel food provision changes and factory printing press outputs.',
    descriptionNepali: 'प्रत्यक्ष र अप्रत्यक्ष विचरण वर्गीकरण गर्ने, तीर विधि (Arrow Method) सिक्ने र सैनिक छाउनी/छात्रावास खाद्यान्न मौज्दात तथा छापाखाना मेसिनका व्यावहारिक समस्या हल गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Classify real-world situations into Direct or Indirect variation accurately',
      'Master the Arrow Method: matching arrows for direct variation, opposing arrows for indirect variation',
      'Solve army camp / hostel food provision problems when soldiers/students join or leave after some days',
      'Use a universal multi-variable ratio solver for 3-quantity manufacturing problems',
    ],
    learningObjectivesNepali: [
      'व्यावहारिक अवस्थाहरू प्रत्यक्ष वा अप्रत्यक्ष विचरण हुन् भनी वर्गीकरण गर्न',
      'तीर विधिको प्रयोग: प्रत्यक्षमा समान दिशा (↑ ↑) र अप्रत्यक्षमा विपरीत दिशा (↑ ↓) बुझ्न',
      'केही दिनपछि नयाँ व्यक्ति थपिँदा वा घट्दा खाद्यान्न पुग्ने दिनको हिसाब गर्न',
      'तीन ओटा चलराशि भएका कारखाना/उत्पादनका व्यावहारिक हिसाब हल गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-6', 'arrow-method', 'food-provisions', 'variation-classifier', 'compound-solver'],
  },

  // ── UNIT 7: SIMPLE INTEREST (साधारण ब्याज) ────────────────────────────
  {
    code: 'SIM-MATH-G8-U7-01',
    key: 'class8-math-u7-simple-interest-banking',
    chapterNumber: 7,
    chapterName: 'Simple Interest',
    chapterNameNepali: 'साधारण ब्याज',
    title: 'Simple Interest Banking Playground',
    titleNepali: 'साधारण ब्याज र बैंकिङ खेलमैदान',
    description: 'Interactive banking vault for learning Principal (P), Time (T), Rate of Interest (R % p.a.), Simple Interest (I = PTR/100), Amount (A = P + I), and linear annual interest growth over time.',
    descriptionNepali: 'सावाँ (P), समय (T), ब्याजदर (R%), साधारण ब्याज (I = PTR/१००), मिश्रधन (A = P + I) र वर्षेनी ब्याजको समान वृद्धिको बैंकिङ भल्ट खेलमैदान।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Define Principal, Time, Rate of Interest, Simple Interest, and Amount',
      'Understand the true meaning of R% p.a. as interest on Rs. 100 for 1 year',
      'Apply formula I = (P × T × R) ÷ 100 and A = P + I',
      'Observe linear growth of interest over successive years',
    ],
    learningObjectivesNepali: [
      'सावाँ, समय, ब्याजदर, साधारण ब्याज र मिश्रधनको परिभाषा बुझ्न',
      'R% प्रतिवर्ष भन्नाले रु. १०० को १ वर्षको ब्याज हो भनी प्रष्ट हुन',
      'सूत्र I = (P × T × R) ÷ १०० र A = P + I प्रयोग गरी हिसाब गर्न',
      'वर्षेनी ब्याजको रैखिक वृद्धि तालिकाबाट अवलोकन गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-7', 'simple-interest', 'principal', 'rate', 'time', 'amount', 'banking'],
  },
  {
    code: 'SIM-MATH-G8-U7-02',
    key: 'class8-math-u7-simple-interest-formula-unknown',
    chapterNumber: 7,
    chapterName: 'Simple Interest',
    chapterNameNepali: 'साधारण ब्याज',
    title: 'Simple Interest Formula & Unknown Variables Lab',
    titleNepali: 'साधारण ब्याज सूत्र र अज्ञात मान प्रयोगशाला',
    description: 'Master algebraic transformations of I = PTR/100 to solve for Principal (P = 100I/TR), Time (T = 100I/PR), and Rate (R = 100I/PT), with fractional month-to-year time converters and CDC textbook examples.',
    descriptionNepali: 'I = PTR/१०० सूत्रका ३ रूपान्तरणहरू: P = १००I/TR, T = १००I/PR, र R = १००I/PT प्रयोग गरी अज्ञात मान पत्ता लगाउने र महिनालाई वर्षमा बदल्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Derive and apply formulas for P, T, and R from I = PTR/100',
      'Convert months into fractional years (T = years + months/12) for interest calculation',
      'Solve CDC textbook problems including Somaya and Santaman cases',
      'Verify results by cross-calculating interest from derived values',
    ],
    learningObjectivesNepali: [
      'I = PTR/१०० बाट P, T र R निकाल्ने ३ ओटा सूत्रहरू प्रयोग गर्न',
      'महिनालाई वर्षमा रूपान्तरण गर्न (T = वर्ष + महिना/१२)',
      'सोमाया र सान्तेमानका पाठ्यपुस्तक उदाहरणहरू हल गर्न',
      'निकालेको मानबाट पुनः ब्याज गणना गरी उत्तर रुजु गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-7', 'interest-formula', 'unknown-variable', 'time-converter', 'cdc-examples'],
  },
  {
    code: 'SIM-MATH-G8-U7-03',
    key: 'class8-math-u7-amount-tax-banking',
    chapterNumber: 7,
    chapterName: 'Simple Interest',
    chapterNameNepali: 'साधारण ब्याज',
    title: 'Total Amount, Interest Tax & Banking Challenge',
    titleNepali: 'मिश्रधन, ब्याज कर र बैंकिङ चुनौती',
    description: 'Calculate Principal directly from Total Amount (P = 100A / (100 + TR)), model withholding tax on earned interest (5% Government Tax deduction), and compute commercial bank loan repayment schedules.',
    descriptionNepali: 'मिश्रधनबाट सिधै सावाँ पत्ता लगाउने (P = १००A ÷ (१०० + TR)), ५% सरकारी ब्याज कर कट्टीपछि खुद ब्याज निकाल्ने र वाणिज्य बैंक ऋण चुक्ता हिसाब गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate Principal P when Amount A, Rate R, and Time T are given: P = (100 × A) ÷ (100 + TR)',
      'Calculate Government Withholding Tax (5%) on earned bank interest to find Net Interest',
      'Understand commercial bank loan repayment where Total Amount = Principal + Total Interest',
      'Solve CDC Grade 8 textbook word problems on Amount, Tax, and Loans',
    ],
    learningObjectivesNepali: [
      'मिश्रधन (A), दर (R) र समय (T) दिँदा सावाँ निकाल्न: P = (१०० × A) ÷ (१०० + TR)',
      'बैंक ब्याजमा लाग्ने ५% सरकारी कर कट्टी गरी खुद ब्याज रकम पत्ता लगाउन',
      'बैंकबाट लिएको ऋण र ब्याज जोडेर चुक्ता गर्नुपर्ने कुल रकम हिसाब गर्न',
      'CDC पाठ्यपुस्तकका मिश्रधन र करसम्बन्धी व्यावहारिक समस्याहरू हल गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-7', 'total-amount', 'interest-tax', 'loan-repayment', 'banking-challenge'],
  },
];

async function seed() {
  console.log('Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  let inserted = 0;
  let updated = 0;

  for (const s of CLASS8_U5_U6_U7_SIMS) {
    const doc = {
      code: s.code,
      title: s.title,
      titleNepali: s.titleNepali,
      description: s.description,
      descriptionNepali: s.descriptionNepali,
      subjectCode: 'MATH',
      subjectName: 'Mathematics',
      gradeLevels: [8],
      chapterNumber: s.chapterNumber,
      chapterName: s.chapterName,
      chapterNameNepali: s.chapterNameNepali,
      simulationType: s.simulationType,
      componentKey: s.key,
      runtimeUrl: `/simulations/class8-math/${s.key}`,
      difficulty: 'INTERMEDIATE',
      estimatedDurationMinutes: 15,
      learningObjectives: s.learningObjectives,
      learningObjectivesNepali: s.learningObjectivesNepali,
      isPublished: true,
      currentVersion: '1.0.0',
      tags: s.tags,
    };

    const res = await Simulation.findOneAndUpdate(
      { code: s.code },
      { $set: doc },
      { upsert: true, returnDocument: 'after', rawResult: true }
    );

    if (res.lastErrorObject?.updatedExisting) {
      console.log(`✓ Updated: [${s.code}] ${s.title}`);
      updated++;
    } else {
      console.log(`+ Created: [${s.code}] ${s.title}`);
      inserted++;
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Updated: ${updated}. Total: ${CLASS8_U5_U6_U7_SIMS.length}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
