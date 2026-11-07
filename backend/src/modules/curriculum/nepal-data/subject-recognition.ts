/**
 * Subject recognition rules for the CDC PDFs in `Nepal data/`.
 *
 * These rules describe how a subject is *recognised* inside a document (filename
 * words, English cover text, or legacy Preeti-font cover tokens). They do not
 * create subjects on their own: a subject record only exists in the library when
 * at least one source PDF matches it. Order matters — the first matching rule wins,
 * so more specific rules (e.g. Optional Mathematics) come before generic ones.
 */

export type SubjectCategory =
  | 'CORE'
  | 'LANGUAGE'
  | 'MOTHER_TONGUE'
  | 'OPTIONAL'
  | 'STREAM'
  | 'TECHNICAL';

export interface SubjectRule {
  key: string;
  name: string;
  nameNepali: string;
  category: SubjectCategory;
  /** Language subjects use one textbook for both English and Nepali medium sections. */
  sharedAcrossMedia?: boolean;
  /** Matched against the original filename (Unicode and Latin). */
  filename?: RegExp[];
  /** Matched against readable English cover text (first pages). */
  englishCover?: RegExp[];
  /** Matched against legacy Preeti-encoded cover text as extracted from the PDF. */
  legacyCover?: RegExp[];
  /** Matched against Unicode Devanagari cover text. */
  unicodeCover?: RegExp[];
}

export const SUBJECT_RULES: SubjectRule[] = [
  // ── Mother-tongue / local language textbooks ────────────────────────────────
  { key: 'KHALING', name: 'Khaling Language', nameNepali: 'खालिङ भाषा', category: 'MOTHER_TONGUE', sharedAcrossMedia: true, filename: [/खालिङ/] },
  { key: 'CHEPANG', name: 'Chepang Language', nameNepali: 'चेपाङ भाषा', category: 'MOTHER_TONGUE', sharedAcrossMedia: true, filename: [/चेपाङ/] },
  { key: 'BANTAWA', name: 'Bantawa Language', nameNepali: 'बान्तवा भाषा', category: 'MOTHER_TONGUE', sharedAcrossMedia: true, filename: [/bantawa/i] },
  { key: 'MAGAR_DHUT', name: 'Magar Dhut Language', nameNepali: 'मगर ढुट भाषा', category: 'MOTHER_TONGUE', sharedAcrossMedia: true, filename: [/magar\s*dhut/i] },
  { key: 'MAGAR_ATHAR', name: 'Magar Language (Athar Magarat)', nameNepali: 'मगर भाषा (अथार मगरात)', category: 'MOTHER_TONGUE', sharedAcrossMedia: true, filename: [/मगर भाषा/] },
  { key: 'CHAMLING', name: 'Kirat Rai Chamling Language', nameNepali: 'किरात राई चाम्लिङ भाषा', category: 'MOTHER_TONGUE', sharedAcrossMedia: true, filename: [/chamling/i] },
  { key: 'NEPAL_BHASA', name: 'Nepal Bhasa', nameNepali: 'नेपाल भाषा', category: 'MOTHER_TONGUE', sharedAcrossMedia: true, filename: [/nepal\s*bhasa|nepalbhasa/i] },
  { key: 'AWADHI', name: 'Awadhi Language', nameNepali: 'अवधी भाषा', category: 'MOTHER_TONGUE', sharedAcrossMedia: true, filename: [/awadhi|अवधी/i] },
  { key: 'LIMBU_YAKTHUNG', name: 'Limbu (Yakthung) Language', nameNepali: 'याक्थुङ (लिम्बू) भाषा', category: 'MOTHER_TONGUE', sharedAcrossMedia: true, filename: [/yakthung/i] },

  // ── Mathematics ─────────────────────────────────────────────────────────────
  {
    key: 'OPTIONAL_MATHEMATICS', name: 'Optional Mathematics', nameNepali: 'ऐच्छिक गणित', category: 'OPTIONAL',
    filename: [/opt(ional)?\.?\s*math/i, /ऐच्छिक गणित/],
    englishCover: [/optional mathematics/i],
    legacyCover: [/P\]lR5s ul0ft/],
  },
  {
    key: 'MATHEMATICS', name: 'Mathematics', nameNepali: 'गणित', category: 'CORE',
    filename: [/math/i, /गणित/],
    englishCover: [/^\W*mathematics\b/i, /my mathematics/i],
    legacyCover: [/ul0ft/],
  },

  // ── Languages ───────────────────────────────────────────────────────────────
  { key: 'OPTIONAL_ENGLISH', name: 'Optional English', nameNepali: 'ऐच्छिक अङ्ग्रेजी', category: 'OPTIONAL', sharedAcrossMedia: true, englishCover: [/optional english/i], filename: [/optional english/i] },
  { key: 'ENGLISH_COMPOSITION', name: 'English Composition', nameNepali: 'अङ्ग्रेजी रचना', category: 'LANGUAGE', sharedAcrossMedia: true, filename: [/english composition/i] },
  {
    key: 'ENGLISH', name: 'English', nameNepali: 'अङ्ग्रेजी', category: 'LANGUAGE', sharedAcrossMedia: true,
    filename: [/my english/i, /english (grade|final)/i, /reds-eng/i, /^अंग्रेजी कक्षा/, /class \d+ english/i],
    englishCover: [/^\W*(my )?english\b/i],
  },
  {
    key: 'NEPALI', name: 'Nepali', nameNepali: 'नेपाली', category: 'LANGUAGE', sharedAcrossMedia: true,
    filename: [/मेरो नेपाली/, /^नेपाली कक्षा/, /my nepali/i, /class \d+ nepali/i, /reds-\s*nepali/i],
    legacyCover: [/^\W*(d\/?\]?\/?f\]? )?g\]kfnL sIff|^\W*d\/\] f\] gk\] fnL/],
  },

  // ── Science stream (Grades 11–12) ───────────────────────────────────────────
  { key: 'PHYSICS', name: 'Physics', nameNepali: 'भौतिकशास्त्र', category: 'STREAM', englishCover: [/physics grade/i], filename: [/physics/i] },
  { key: 'CHEMISTRY', name: 'Chemistry', nameNepali: 'रसायनशास्त्र', category: 'STREAM', englishCover: [/chemistry grade/i], filename: [/chemistry/i] },
  { key: 'BIOLOGY', name: 'Biology', nameNepali: 'जीवशास्त्र', category: 'STREAM', englishCover: [/biology grade/i], filename: [/biology/i] },

  // ── Science, environment and health ─────────────────────────────────────────
  // Computer Science must be checked before the generic Science rule.
  { key: 'COMPUTER_SCIENCE', name: 'Computer Science', nameNepali: 'कम्प्युटर विज्ञान', category: 'OPTIONAL', filename: [/computer science/i, /^CSGrade/i], englishCover: [/computer science/i] },
  { key: 'ENVIRONMENT_SCIENCE', name: 'Environment Science', nameNepali: 'वातावरण विज्ञान', category: 'OPTIONAL', filename: [/वातावरण विज्ञान/], legacyCover: [/jftfj\/0f lj1fg/] },
  {
    key: 'SCIENCE', name: 'Science and Technology', nameNepali: 'विज्ञान तथा प्रविधि', category: 'CORE',
    filename: [/science/i, /विज्ञान तथा प्रविधि/],
    englishCover: [/science and technology/i],
    legacyCover: [/lj1fg tyf k\|ljlw sIff|lj1fg tyf kl\| jlw sIff/],
  },
  {
    key: 'HEALTH_PHYSICAL_CREATIVE_ARTS', name: 'Health, Physical and Creative Arts', nameNepali: 'स्वास्थ्य, शारीरिक तथा सिर्जनात्मक कला', category: 'CORE',
    filename: [/hpc/i, /health, physical and creative/i, /सिर्जनात्मक कला/],
    englishCover: [/health, physical and creative arts/i],
    legacyCover: [/:jf:Yo, zf\/Ll\/s tyf l;h/],
  },
  {
    key: 'HEALTH_PHYSICAL_EDUCATION', name: 'Health and Physical Education', nameNepali: 'स्वास्थ्य तथा शारीरिक शिक्षा', category: 'OPTIONAL',
    filename: [/optioanal health|optional health/i, /स्वास्थ्य तथा शारिरिक शिक्षा/],
    legacyCover: [/:jf:Yo tyf zf\/Ll\/s lzIff/],
  },
  { key: 'POPULATION_EDUCATION', name: 'Population Education', nameNepali: 'जनसङ्ख्या शिक्षा', category: 'OPTIONAL', filename: [/population/i], unicodeCover: [/जनसङ्ख्या शिक्षा/] },

  // ── Social sciences ─────────────────────────────────────────────────────────
  {
    key: 'SOCIAL_STUDIES', name: 'Social Studies', nameNepali: 'सामाजिक अध्ययन', category: 'CORE',
    filename: [/social/i, /samajik/i, /सामाजिक अध्ययन/],
    legacyCover: [/;fdflhs cWoog/],
  },
  { key: 'GEOGRAPHY', name: 'Geography', nameNepali: 'भूगोल', category: 'OPTIONAL', filename: [/भूगोल/], legacyCover: [/^\W*e"?u"? ?f\]? ?n\]? sIff/] },
  { key: 'HISTORY', name: 'History', nameNepali: 'इतिहास', category: 'OPTIONAL', filename: [/इतिहास/], legacyCover: [/^\W*Oltxf; sIff/] },
  { key: 'CIVICS', name: 'Civics', nameNepali: 'नागरिक शास्त्र', category: 'OPTIONAL', filename: [/नागरिक शास्त्र/], legacyCover: [/gful\/s zf:q/] },
  { key: 'ECONOMICS', name: 'Economics', nameNepali: 'अर्थशास्त्र', category: 'OPTIONAL', filename: [/economics/i, /अर्थशास्त्र/], legacyCover: [/cy\{zf:q|cyz\{ f:q/] },

  // ── Commerce / management ───────────────────────────────────────────────────
  { key: 'AUDITING', name: 'Auditing', nameNepali: 'लेखापरीक्षण', category: 'OPTIONAL', filename: [/लेखापरिक्षण/], legacyCover: [/n\]vfk\/LIf0f|nv\] fk\/LIf0f/] },
  { key: 'ACCOUNTANCY', name: 'Accountancy', nameNepali: 'लेखाविधि', category: 'STREAM', legacyCover: [/n\]vfljlw|nv\] fljlw/] },
  {
    key: 'OFFICE_OPERATION_ACCOUNTING', name: 'Office Operation and Accounting', nameNepali: 'कार्यालय सञ्चालन तथा लेखा', category: 'OPTIONAL',
    legacyCover: [/sfof\{?n\{? ?o ;~rfng tyf n\]? ?v\]? ?f/],
  },
  { key: 'BUSINESS_STUDIES', name: 'Business Studies', nameNepali: 'व्यवसाय अध्ययन', category: 'STREAM', filename: [/व्यवसाय अध्ययन/], legacyCover: [/Joj;fo cWoog/] },

  // ── ICT, education and traditional streams ──────────────────────────────────
  { key: 'EDUCATION', name: 'Education', nameNepali: 'शिक्षा', category: 'OPTIONAL', filename: [/^शिक्षा कक्षा/], legacyCover: [/^\W*lzIff sIff/] },
  { key: 'AYURVEDA', name: 'Ayurveda', nameNepali: 'आयुर्वेद', category: 'OPTIONAL', filename: [/aayurveda|ayurveda/i] },
  { key: 'YOGA', name: 'Yoga Education', nameNepali: 'योग शिक्षा', category: 'OPTIONAL', filename: [/yoga/i], legacyCover: [/of\]u lzIff/] },

  // ── Integrated primary subject ──────────────────────────────────────────────
  // CDC title is "हाम्रो सेरोफेरो"; two files in the source folder misspell it as "सेफोफेरो".
  { key: 'OUR_SURROUNDINGS', name: 'Our Surroundings', nameNepali: 'हाम्रो सेरोफेरो', category: 'CORE', filename: [/सेरोफेरो|सेफोफेरो/], legacyCover: [/xfdf\| ?\] ;\]\/fk\] m\]\/f\]/] },
];

export const RULES_BY_KEY: Record<string, SubjectRule> = Object.fromEntries(SUBJECT_RULES.map((r) => [r.key, r]));
