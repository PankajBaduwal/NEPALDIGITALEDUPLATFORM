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

const CLASS9_U2_U3_U4_SIMS = [
  // ── UNIT 2: TAX (कर) ──────────────────────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U2-01',
    key: 'class9-math-u2-income-tax-slab-explorer',
    chapterNumber: 2,
    chapterName: 'Tax',
    chapterNameNepali: 'कर',
    title: 'Income Tax Calculator and Tax Slab Explorer',
    titleNepali: 'आयकर क्याल्कुलेटर र कर स्ल्याब अन्वेषक',
    description: 'Explore Nepal Government progressive income tax slabs for unmarried individuals and married couples with social security tax, progressive brackets (1%, 10%, 20%, 30%, 36%), insurance exemptions, and interactive visual breakdown.',
    descriptionNepali: 'नेपाल सरकारको आयकर स्ल्याब अनुसार एकल तथा दम्पतीको सामाजिक सुरक्षा कर, प्रगतिशील कर दरहरू (१%, १०%, २०%, ३०%, ३६%), बीमा छुट र अन्तरक्रियात्मक कर गणना विश्लेषण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand taxable income, exemptions, insurance deductions, and taxable baseline',
      'Calculate progressive income tax across all tax slabs for individual and married categories',
      'Analyze the impact of salary increments and tax rebates visually',
    ],
    learningObjectivesNepali: [
      'करयोग्य आय, कर छुट सीमा, बीमा कटौती र कर निर्धारण आधार बुझ्न',
      'एकल र दम्पतीका लागि प्रगतिशील कर स्ल्याब अनुसार आयकर हिसाब गर्न',
      'तलब वृद्धि र कर छुटको प्रभावलाई दृश्य रेखाचित्रमार्फत विश्लेषण गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['tax', 'income tax', 'slabs', 'exemptions', 'social security', 'grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U2-02',
    key: 'class9-math-u2-vat-discount-price-lab',
    chapterNumber: 2,
    chapterName: 'Tax',
    chapterNameNepali: 'कर',
    title: 'VAT, Discount and Selling Price Laboratory',
    titleNepali: 'भ्याट, छुट र मूल्य निर्धारण प्रयोगशाला',
    description: 'Interactive commercial pricing laboratory exploring Marked Price (MP), Discount percentage, Selling Price (SP), 13% Value Added Tax (VAT), and Selling Price with VAT (SP with VAT) with reverse problem solver.',
    descriptionNepali: 'अङ्कित मूल्य (MP), छुट प्रतिशत, छुट पछिको बिक्री मूल्य (SP), १३% मूल्य अभिवृद्धि कर (VAT) र भ्याट सहितको बिक्री मूल्यको अन्तरक्रियात्मक प्रयोगशाला तथा उल्टो हिसाब समाधानकर्ता।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate Selling Price after discount: SP = MP - Discount Amount',
      'Apply 13% VAT to taxable selling price: SP with VAT = SP + 13% of SP',
      'Perform reverse calculations: Find MP from SP with VAT, discount, and VAT rates',
    ],
    learningObjectivesNepali: [
      'छुट पछिको बिक्री मूल्य हिसाब गर्न: SP = MP - छुट रकम',
      'बिक्री मूल्यमा १३% भ्याट जोडेर भ्याट सहितको मूल्य निकाल्न',
      'भ्याट सहितको मूल्य र छुट प्रतिशत दिइएको अवस्थामा अङ्कित मूल्य पत्ता लगाउन',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['tax', 'vat', 'discount', 'marked price', 'selling price', 'reverse solver'],
  },
  {
    code: 'SIM-MATH-G9-U2-03',
    key: 'class9-math-u2-tax-problem-challenge',
    chapterNumber: 2,
    chapterName: 'Tax',
    chapterNameNepali: 'कर',
    title: 'Tax Problem Solving Challenge',
    titleNepali: 'कर तथा भ्याट समस्या समाधान चुनौती',
    description: 'Challenging multi-stage tax problem solver covering multi-tiered supply chains (Producer -> Wholesaler -> Retailer -> Consumer), VAT refund, and word problem challenges with instant grading.',
    descriptionNepali: 'बहु-तह व्यापार चक्र (उत्पादक -> थोक विक्रेता -> खुद्रा बिक्रेता -> उपभोक्ता) मा लाग्ने मूल्य अभिवृद्धि कर र पाठ्यपुस्तकका शाब्दिक समस्या समाधान चुनौती।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Trace value addition and VAT collection across multi-stage business supply chains',
      'Compute net VAT deposited to the government at each level of transaction',
      'Solve authentic CDC Grade 9 word problems with step-by-step verified explanations',
    ],
    learningObjectivesNepali: [
      'बहु-तह व्यापार श्रृंखलामा मूल्य अभिवृद्धि र संकलित भ्याटको हिसाब बुझ्न',
      'प्रत्येक तहका व्यापारीले सरकारलाई दाखिला गर्नुपर्ने खुद भ्याट रकम गणना गर्न',
      'पाठ्यपुस्तकका जटिल शाब्दिक समस्याहरू चरणबद्ध रुपमा हल गर्न',
    ],
    difficulty: 'ADVANCED',
    estimatedDurationMinutes: 20,
    tags: ['tax', 'supply chain', 'vat refund', 'multi-stage', 'challenges'],
  },

  // ── UNIT 3: COMMISSION AND DIVIDEND (कमिशन र लाभांश) ─────────────────────
  {
    code: 'SIM-MATH-G9-U3-01',
    key: 'class9-math-u3-commission-agent-simulator',
    chapterNumber: 3,
    chapterName: 'Commission and Dividend',
    chapterNameNepali: 'कमिशन र लाभांश',
    title: 'Commission and Sales Agent Simulator',
    titleNepali: 'कमिशन र बिक्री प्रतिनिधि सिमुलेटर',
    description: 'Simulate flat and tiered commission rates for real estate, vehicle sales, goods distribution, and agent remuneration with interactive commission sliders and reverse sales targets.',
    descriptionNepali: 'घरजग्गा, गाडी तथा विभिन्न वस्तुको बिक्रीमा एजेन्टले पाउने समदर र तहगत (Tiered) कमिशनको अन्तरक्रियात्मक सिमुलेशन तथा बिक्री लक्ष्य क्याल्कुलेटर।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate agent commission using flat percentage: Commission = Total Sales × Rate',
      'Compute multi-tier graduated commission brackets (e.g. up to Rs 200k, 200k-500k, above 500k)',
      'Determine required sales turnover to achieve a target commission remuneration',
    ],
    learningObjectivesNepali: [
      'समदर कमिशन हिसाब गर्न: कमिशन = कुल बिक्री × दर',
      'तहगत (स्ल्याब) कमिशन संरचनाको चरणबद्ध हिसाब गर्न',
      'निश्चित कमिशन आम्दानी गर्न आवश्यक कुल बिक्री रकम पत्ता लगाउन',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['commission', 'sales agent', 'tiered commission', 'remuneration', 'grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U3-02',
    key: 'class9-math-u3-profit-bonus-distribution',
    chapterNumber: 3,
    chapterName: 'Commission and Dividend',
    chapterNameNepali: 'कमिशन र लाभांश',
    title: 'Company Profit and Bonus Distribution',
    titleNepali: 'कम्पनीको नाफा र बोनस वितरण प्रयोगशाला',
    description: 'Explore enterprise net annual profit, staff bonus allocations, reserve fund transfers, and per-employee equal or salary-weighted bonus distributions under Nepal company regulations.',
    descriptionNepali: 'कम्पनीको खुद वार्षिक नाफाबाट कर्मचारी बोनस कोष, जगेडा कोष कट्टा र कर्मचारीहरूबीच समान वा तलब-आधारित बोनस वितरणको अन्तरक्रियात्मक प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Compute staff bonus fund from net company profits: Bonus Fund = Net Profit × Bonus %',
      'Calculate individual employee bonus share based on head count or salary proportions',
      'Analyze the distribution of company net profit among reserve funds, bonus, and retained earnings',
    ],
    learningObjectivesNepali: [
      'कम्पनीको खुद नाफाबाट कर्मचारी बोनस कोष निकाल्न',
      'कर्मचारी संख्या वा तलब अनुपात अनुसार प्रत्येक कर्मचारीले पाउने बोनस रकम हिसाब गर्न',
      'जगेडा कोष, बोनस र कम्पनीको बचत बीचको सन्तुलन विश्लेषण गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['bonus', 'company profit', 'distribution', 'reserve fund', 'employee bonus'],
  },
  {
    code: 'SIM-MATH-G9-U3-03',
    key: 'class9-math-u3-dividend-shareholder-simulator',
    chapterNumber: 3,
    chapterName: 'Commission and Dividend',
    chapterNameNepali: 'कमिशन र लाभांश',
    title: 'Dividend and Shareholder Simulator',
    titleNepali: 'लाभांश तथा शेयरधनी नाफा सिमुलेटर',
    description: 'Simulate stock market investments, face value (Rs 100), total shares, cash dividend vs bonus shares, 5% dividend tax deduction, and net shareholder return.',
    descriptionNepali: 'अङ्कित मूल्य (रु. १००), कुल शेयर संख्या, नगद लाभांश, बोनस शेयर, ५% लाभांश कर कट्टा र शेयरधनीले प्राप्त गर्ने खुद आम्दानीको अन्तरक्रियात्मक सिमुलेटर।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand face value (रु. १००), market price, paid-up capital, and share units',
      'Compute cash dividend and bonus shares distributed by publicly traded companies',
      'Deduct 5% dividend tax to calculate the net cash deposited to the shareholder bank account',
    ],
    learningObjectivesNepali: [
      'शेयरको अङ्कित मूल्य, चुक्ता पुँजी र शेयर कित्ताको अवधारणा बुझ्न',
      'कम्पनीले घोषणा गर्ने नगद लाभांश र बोनस शेयरको हिसाब गर्न',
      '५% लाभांश कर कट्टा गरी शेयरधनीको खातामा जम्मा हुने खुद रकम गणना गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['dividend', 'shares', 'stock market', 'cash dividend', 'bonus share', 'dividend tax'],
  },

  // ── UNIT 4: HOUSEHOLD ARITHMETIC (घरायसी अङ्कगणित) ────────────────────────
  {
    code: 'SIM-MATH-G9-U4-01',
    key: 'class9-math-u4-electricity-bill-calculator',
    chapterNumber: 4,
    chapterName: 'Household Arithmetic',
    chapterNameNepali: 'घरायसी अङ्कगणित',
    title: 'Electricity Bill Calculator (NEA Tariff)',
    titleNepali: 'विद्युत महसुल क्याल्कुलेटर (NEA महसुल दर)',
    description: 'Calculate Nepal Electricity Authority (NEA) monthly electricity bills across domestic ampere capacities (5A, 15A, 30A, 60A), consumption slabs (0-20, 21-30, 31-50, 51-100, 101-250, 251+), minimum service charge, and payment rebates/penalties.',
    descriptionNepali: 'नेपाल विद्युत प्राधिकरण (NEA) को महसुल तालिका अनुसार एम्पियर क्षमता (५A, १५A, ३०A, ६०A), खपत स्ल्याबहरू, न्यूनतम सेवा शुल्क र भुक्तानी मिति अनुसारको छुट वा जरिवाना सहितको विद्युत महसुल क्याल्कुलेटर।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Read electrical meters and determine monthly energy consumption (Current - Previous Reading)',
      'Calculate slab-wise energy charges and minimum service charges for various meter capacities',
      'Apply NEA rebate (2%-3%) for early payment and penalty (5%-25%) for delayed payment',
    ],
    learningObjectivesNepali: [
      'विद्युत मिटर रिडिङ हेरी मासिक खपत युनिट (हालको - अघिल्लो) निकाल्न',
      'एम्पियर क्षमता र विभिन्न खपत स्ल्याब अनुसार ऊर्जा महसुल र न्यूनतम शुल्क गणना गर्न',
      'समयमै बुझाउँदा पाइने छुट (२%-३%) र ढिलो गर्दा लाग्ने थप दस्तुर (५%-२५%) हिसाब गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['electricity', 'nea tariff', 'meter reading', 'slabs', 'rebate', 'penalty'],
  },
  {
    code: 'SIM-MATH-G9-U4-02',
    key: 'class9-math-u4-water-telephone-bill-calculator',
    chapterNumber: 4,
    chapterName: 'Household Arithmetic',
    chapterNameNepali: 'घरायसी अङ्कगणित',
    title: 'Water and Telephone Bill Calculator',
    titleNepali: 'खानेपानी तथा टेलिफोन महसुल क्याल्कुलेटर',
    description: 'Simulate KUKL drinking water tariffs by pipe diameter (1/2", 3/4", 1"), minimum units, extra volume rates, 50% sewerage charge, and NTC PSTN landline tariffs with 175 minimum calls, 10% TSC, and 13% VAT.',
    descriptionNepali: 'खानेपानी बोर्ड/KUKL को पाइप साइज (१/२", ३/४", १"), न्यूनतम युनिट, ५०% ढल महसुल तथा नेपाल टेलिकमको १७५ कल न्यूनतम दर, १०% दूरसञ्चार सेवा दस्तुर (TSC) र १३% भ्याट सहितको संयुक्त बिलिङ क्याल्कुलेटर।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate drinking water consumption in units (1 unit = 1,000 Liters) and compute base tariff',
      'Apply 50% sewerage charge and payment timeline rebates or fines',
      'Calculate telephone PSTN landline call charges, 10% TSC, and 13% VAT to find the total invoice',
    ],
    learningObjectivesNepali: [
      'खानेपानी मिटरको खपत युनिट (१ युनिट = १००० लि.) र पाइप आकार अनुसार न्यूनतम तथा अतिरिक्त महसुल निकाल्न',
      '५०% ढल निकास महसुल र भुक्तानी मिति अनुसारको छुट वा जरिवाना जोड्न',
      'टेलिफोनको १७५ कल न्यूनतम महसुल, थप कल, १०% TSC र १३% भ्याट गणना गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['water bill', 'telephone bill', 'pstn', 'sewerage', 'tsc', 'vat'],
  },
  {
    code: 'SIM-MATH-G9-U4-03',
    key: 'class9-math-u4-taxi-household-challenge',
    chapterNumber: 4,
    chapterName: 'Household Arithmetic',
    chapterNameNepali: 'घरायसी अङ्कगणित',
    title: 'Taxi Fare and Household Expense Challenge',
    titleNepali: 'ट्याक्सी भाडा तथा घरायसी खर्च हिसाब',
    description: 'Interactive taxi meter simulation with initial flag drop (Rs 14 for first 200m), distance fare (Rs 7.20 per 200m), waiting charge, 50% night surcharge, and integrated household monthly utility budget challenge.',
    descriptionNepali: 'ट्याक्सी मिटरको पहिलो २०० मिटरको न्यूनतम भाडा (रु. १४), दूरी अनुसार भाडा (प्रति २०० मिटर रु. ७.२०), पर्खाइ शुल्क, रात्रिकालीन ५०% थप दस्तुर र मासिक घरायसी उपयोगिता बजेट विश्लेषण चुनौती।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate taxi travel fare based on flag-drop distance, incremental distance, and waiting time',
      'Apply 50% night surcharge between 9:00 PM and 6:00 AM',
      'Aggregate electricity, water, telephone, and transport expenses into a comprehensive household utility budget',
    ],
    learningObjectivesNepali: [
      'ट्याक्सीको न्यूनतम भाडा, थप दूरी र पर्खाइ समयको आधारमा कुल भाडा निकाल्न',
      'राति ९ बजेदेखि बिहान ६ बजेसम्मको यात्रामा ५०% थप भाडा हिसाब गर्न',
      'विद्युत, खानेपानी, टेलिफोन र यातायात खर्चलाई जोडेर घरायसी बजेट विश्लेषण गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['taxi meter', 'flag drop', 'waiting charge', 'night fare', 'household budget'],
  },
];

async function seedClass9MathU2U3U4() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  for (const sim of CLASS9_U2_U3_U4_SIMS) {
    const doc = {
      code: sim.code,
      title: sim.title,
      titleNepali: sim.titleNepali,
      description: sim.description,
      descriptionNepali: sim.descriptionNepali,
      subjectCode: 'MATH-G9',
      subjectName: 'Mathematics',
      gradeLevels: [9],
      chapterNumber: sim.chapterNumber,
      chapterName: sim.chapterName,
      chapterNameNepali: sim.chapterNameNepali,
      simulationType: sim.simulationType,
      componentKey: sim.key,
      runtimeUrl: `/simulations/player/${sim.code}`,
      difficulty: sim.difficulty,
      estimatedDurationMinutes: sim.estimatedDurationMinutes,
      learningObjectives: sim.learningObjectives,
      learningObjectivesNepali: sim.learningObjectivesNepali,
      isPublished: true,
      currentVersion: '1.0.0',
      tags: sim.tags,
    };

    const res = await Simulation.findOneAndUpdate(
      { code: sim.code },
      { $set: doc },
      { upsert: true, new: true }
    );
    console.log(`Upserted simulation: [${res.code}] ${res.title}`);
  }

  const totalCount = await Simulation.countDocuments({ gradeLevels: 9 });
  console.log(`Total Grade 9 simulations in database: ${totalCount}`);

  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
}

seedClass9MathU2U3U4().catch((err) => {
  console.error('Error seeding Grade 9 Units 2, 3, 4 simulations:', err);
  process.exit(1);
});
