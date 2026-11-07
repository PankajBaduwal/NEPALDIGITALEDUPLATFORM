/**
 * EssentialsComputingSimData.ts
 * Authoritative Data, Computational Models, Learning Tasks & Assessment Banks
 * for Essentials of Computing (U25CS102 / U25RCSG02)
 * Course Code: U25CS102 / U25RCSG02 | Semester I | ESC | Credits: 3
 * B.Tech Information Technology & Computer Engineering (R2025 CBCS)
 */

export interface GuidedStep {
  title: string;
  description: string;
  highlightControl?: string;
}

export interface ChallengeTask {
  id: string;
  title: string;
  goal: string;
  hint: string;
  successCondition: string;
}

export interface AssessmentQuestion {
  id: string;
  type: 'prediction' | 'concept' | 'interpretation';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ComputingSimulationMetadata {
  id: string;
  unit: number;
  unitTitle: string;
  topic: string;
  title: string;
  icon: string;
  shortDescription: string;
  learningObjectives: string[];
  prerequisites: string[];
  estimatedTimeMinutes: number;
  formulaOverview: string;
  modelAssumptions: string[];
  engineeringContext: {
    what: string;
    where: string;
    when: string;
  };
  guidedSteps: GuidedStep[];
  challenges: ChallengeTask[];
  assessments: AssessmentQuestion[];
  defaultParams: Record<string, any>;
  is3DPreferred?: boolean;
}

export const U25CS102_20_SIMULATIONS: ComputingSimulationMetadata[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — DIGITAL REPRESENTATION AND DATA ENCODING (Simulations 1–4)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'u25cs102-number-converter',
    unit: 1,
    unitTitle: 'Digital Representation and Data Encoding',
    topic: 'Number Systems: Binary, Octal, Decimal, and Hexadecimal Conversions',
    title: 'Number System Converter Studio',
    icon: '🔢',
    shortDescription: 'Interactive base converter decomposing numbers into positional place-values, radix powers, and successive division/multiplication steps.',
    learningObjectives: [
      'Decompose positional numbers as weighted sums: N = Σ (d_i × b^i)',
      'Convert values fluently between decimal, binary, octal, and hexadecimal bases',
      'Analyze bit-grouping shortcuts (3 bits per octal digit, 4 bits per hex nibble)',
    ],
    prerequisites: ['Basic integer arithmetic', 'Powers and exponents'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'N_b = \\sum_{i=0}^{n-1} d_i \\cdot b^i, \\quad \\text{Hex} \\leftrightarrow \\text{Binary}: 16 = 2^4, \\quad \\text{Octal} \\leftrightarrow \\text{Binary}: 8 = 2^3',
    modelAssumptions: [
      'Radix representation supports positive integers up to 65,535 (16-bit word)',
      'Direct mapping between 4-bit nibbles and hexadecimal symbols (0-9, A-F)',
      'Division-by-radix algorithm captures remainders in least-to-most significant order',
    ],
    engineeringContext: {
      what: 'Converts numerical information between human decimal notation and machine binary/hex addresses.',
      where: 'Used in memory dump inspection, compiler debuggers, network IPv4/IPv6 address parsing, and embedded firmware registers.',
      when: 'During low-level systems programming, bitmask manipulation, and hardware debugging.',
    },
    guidedSteps: [
      { title: 'Step 1: Set Input Base and Value', description: 'Select Decimal mode and input value 42. Notice how the place value breakdown displays 40 + 2.' },
      { title: 'Step 2: Observe Binary Bit Patterns', description: 'Switch target base to Binary. Observe the 8-bit pattern 00101010 decomposed into powers of two (32 + 8 + 2).' },
      { title: 'Step 3: Hexadecimal Nibble Grouping', description: 'Switch to Hexadecimal. See how the 8 bits are split into two 4-bit nibbles: 0010 (2) and 1010 (A), forming 0x2A.' },
      { title: 'Step 4: Verify Successive Division Steps', description: 'Review the step-by-step division trace: 42 ÷ 16 = 2 remainder 10 (A); 2 ÷ 16 = 0 remainder 2, yielding 2A.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Represent Byte Limit', goal: 'Find the decimal, binary, and hex representation of the maximum 8-bit unsigned integer.', hint: 'All eight bits are set to 1.', successCondition: 'Input 255 -> Binary 11111111 -> Hex FF' },
      { id: 'ch2', title: 'Convert Hex to Decimal', goal: 'Enter Hex 0x7E and determine its decimal equivalent without looking at the answer first.', hint: '7 × 16 + 14 = ?', successCondition: 'Result matches 126 decimal' },
      { id: 'ch3', title: 'Rapid Nibble Splitting', goal: 'Given binary 11011001, convert it to hexadecimal by splitting into two nibbles.', hint: 'Left nibble 1101 = 13 (D), Right nibble 1001 = 9.', successCondition: 'Hex output shows D9' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'How many bits are represented by a single hexadecimal digit?', options: ['2 bits', '4 bits', '8 bits', '16 bits'], correctIndex: 1, explanation: 'Since 16 = 2⁴, each hexadecimal digit directly encodes exactly 4 binary bits (one nibble).' },
      { id: 'q2', type: 'prediction', question: 'If decimal 75 is converted to octal (base 8), what is the resulting representation?', options: ['113', '125', '75', '4B'], correctIndex: 0, explanation: '75 ÷ 8 = 9 rem 3; 9 ÷ 8 = 1 rem 1; 1 ÷ 8 = 0 rem 1. Reading remainders bottom-up gives 113₈ (1×64 + 1×8 + 3 = 75).' },
      { id: 'q3', type: 'interpretation', question: 'Why is hexadecimal widely favored over binary in computer system monitors and debuggers?', options: ['Hex takes less computer memory to store', 'Hex numbers are processed faster by the ALU', 'Hex is a compact human-readable shorthand for binary that preserves bit boundaries', 'Hex eliminates rounding errors in integers'], correctIndex: 2, explanation: 'Hexadecimal provides a 4:1 compaction ratio over raw binary without requiring mental arithmetic, making 32-bit and 64-bit memory addresses easy to read.' },
      { id: 'q4', type: 'concept', question: 'What is the decimal value of the binary number 00110101?', options: ['49', '51', '53', '55'], correctIndex: 2, explanation: 'Powers: 32 + 16 + 4 + 1 = 53.' },
      { id: 'q5', type: 'prediction', question: 'What character is used to represent decimal value 15 in hexadecimal notation?', options: ['E', 'F', 'X', '15'], correctIndex: 1, explanation: 'In hexadecimal, values 10 through 15 are denoted by letters A, B, C, D, E, and F.' },
    ],
    defaultParams: { inputBase: 'decimal', inputValue: 42, targetBase: 'binary' },
    is3DPreferred: false,
  },

  {
    id: 'u25cs102-binary-arithmetic',
    unit: 1,
    unitTitle: 'Digital Representation and Data Encoding',
    topic: 'Binary Addition, Subtraction, Two\'s Complement, and Arithmetic Overflow',
    title: 'Binary Addition and Subtraction Lab',
    icon: '➕',
    shortDescription: 'Hands-on binary adder simulating full-adder ripple carry propagation, two\'s complement negation, and signed/unsigned overflow detection.',
    learningObjectives: [
      'Trace full-adder logic: Sum = A ⊕ B ⊕ C_in, C_out = (A · B) + (C_in · (A ⊕ B))',
      'Perform signed two\'s complement subtraction using inverted bits plus one: A - B = A + (~B + 1)',
      'Distinguish carry-out (unsigned overflow) from sign-bit overflow (V = C_n ⊕ C_{n-1})',
    ],
    prerequisites: ['Positional binary numbers', 'Basic Boolean XOR and AND gates'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'S = A \\oplus B \\oplus C_{in}, \\quad C_{out} = (A \\cdot B) + (C_{in} \\cdot (A \\oplus B)), \\quad \\text{Two\'s Complement}: -B = \\bar{B} + 1, \\quad V = C_n \\oplus C_{n-1}',
    modelAssumptions: [
      'Simulates an 8-bit ripple carry adder datapath with propagation delay',
      'Unsigned integer range: 0 to 255; Two\'s complement signed range: -128 to +127',
      'Overflow occurs when two numbers of like sign yield a sum of opposite sign',
    ],
    engineeringContext: {
      what: 'Implements integer arithmetic units (ALUs) found in all microprocessor computing cores.',
      where: 'Used inside the CPU Arithmetic Logic Unit, GPU streaming processors, and hardware counters.',
      when: 'Every time software computes math, updates loop counters, or increments array pointers.',
    },
    guidedSteps: [
      { title: 'Step 1: Perform Simple Unsigned Addition', description: 'Load A = 00000101 (5) and B = 00000011 (3). Observe 1 + 1 = 0 with a carry ripple to the next column, yielding 00001000 (8).' },
      { title: 'Step 2: Trigger Carry-Out Propagation', description: 'Set A = 11110000 and B = 00100000. Trace the carry bit moving through the upper bits.' },
      { title: 'Step 3: Two\'s Complement Subtraction', description: 'Switch to Subtraction mode (A - B). Observe B inverted into ones\' complement, incremented by 1, and added to A.' },
      { title: 'Step 4: Detect Signed Overflow', description: 'Add signed positive values A = +100 and B = +50. The mathematical sum +150 exceeds +127, wrapping into negative -106 and lighting the OVERFLOW flag.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Zero Sum Complement', goal: 'Input a number and subtract itself to verify all sum bits become 0 and carry is generated.', hint: 'A - A = A + (~A + 1) = 0.', successCondition: 'Result equals 00000000' },
      { id: 'ch2', title: 'Produce Signed Overflow', goal: 'Add two positive signed 8-bit numbers that trigger the signed overflow indicator V.', hint: 'Try values whose sum exceeds 127, e.g. 70 + 60 = 130.', successCondition: 'Signed Overflow flag V = 1' },
      { id: 'ch3', title: 'Maximum Unsigned Carry', goal: 'Add 255 and 1 to observe the full ripple across all 8 bits resulting in 00000000 with Carry = 1.', hint: '11111111 + 00000001 ripples carries through bit 7.', successCondition: 'Carry Out = 1, Sum = 0' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the sum and carry when binary digits 1 and 1 are added with a carry-in of 1?', options: ['Sum = 0, Carry = 1', 'Sum = 1, Carry = 0', 'Sum = 1, Carry = 1', 'Sum = 0, Carry = 0'], correctIndex: 2, explanation: '1 + 1 + 1 = 3 in decimal, which is binary 11₂ (Sum bit = 1, Carry bit = 1).' },
      { id: 'q2', type: 'concept', question: 'How is the two\'s complement of an 8-bit binary number formed?', options: ['Flip all bits and add 1', 'Shift bits left by one position', 'Invert only the MSB sign bit', 'Multiply by -1 and divide by 2'], correctIndex: 0, explanation: 'Two\'s complement is formed by bitwise inversion (NOT) followed by adding 1 to the least significant bit.' },
      { id: 'q3', type: 'prediction', question: 'In an 8-bit signed two\'s complement system, what does 01111111 (+127) + 00000001 (+1) produce?', options: ['+128 with no overflow', '-128 with signed overflow', '00000000 with carry', '+126 with underflow'], correctIndex: 1, explanation: '01111111 + 1 = 10000000. In signed 8-bit, 10000000 represents -128. Adding two positive numbers produced a negative number, triggering signed overflow (V=1).' },
      { id: 'q4', type: 'interpretation', question: 'Why do modern CPUs use two\'s complement rather than sign-magnitude for signed integers?', options: ['It allows twice as many positive numbers', 'Addition and subtraction hardware can use the exact same adder circuit with no special zero handling', 'It makes floating point math faster', 'It prevents integer overflow entirely'], correctIndex: 1, explanation: 'In two\'s complement, addition and subtraction use identical adder circuitry, and there is a unique representation for zero (no +0 and -0 ambiguity).' },
      { id: 'q5', type: 'concept', question: 'What is the range of integers that can be stored in an 8-bit signed two\'s complement register?', options: ['0 to 255', '-127 to +127', '-128 to +127', '-256 to +255'], correctIndex: 2, explanation: 'An n-bit two\'s complement integer spans -2^(n-1) to 2^(n-1) - 1, which for n=8 is -128 to +127.' },
    ],
    defaultParams: { a: 45, b: 27, mode: 'add', isSigned: true },
    is3DPreferred: false,
  },

  {
    id: 'u25cs102-data-size',
    unit: 1,
    unitTitle: 'Digital Representation and Data Encoding',
    topic: 'Bits, Bytes, Multipliers (SI vs IEC), Storage Hierarchy, and File Size Estimation',
    title: 'Bits, Bytes and Data Size Workshop',
    icon: '💾',
    shortDescription: 'Interactive storage scale explorer contrasting SI decimal multipliers (kB = 10³) with binary IEC units (KiB = 2¹⁰) and estimating file dimensions.',
    learningObjectives: [
      'Contrast decimal SI units (kB, MB, GB: base 1000) with binary IEC units (KiB, MiB, GiB: base 1024)',
      'Calculate theoretical media storage: Image = W × H × (bpp / 8), Audio = Rate × Depth × Channels × Duration',
      'Explain why a nominal 1 TB storage drive formats as ~931 GiB in Windows operating systems',
    ],
    prerequisites: ['Powers of 10 and powers of 2', 'Basic unit conversions'],
    estimatedTimeMinutes: 15,
    formulaOverview: '\\text{Raw Image} = W \\cdot H \\cdot \\frac{\\text{bpp}}{8} \\text{ bytes}, \\quad \\text{Raw Audio} = f_s \\cdot \\frac{d}{8} \\cdot c \\cdot t, \\quad 1\\text{ TB} = 10^{12} \\text{ B} \\approx 931.32\\text{ GiB}',
    modelAssumptions: [
      'Calculations illustrate uncompressed raw bitstreams before lossy or lossless compression',
      'Distinguishes bit (b) from byte (B) with 1 Byte = 8 bits',
      'Applies IEEE 1541 / IEC 60027 standard prefixes consistently',
    ],
    engineeringContext: {
      what: 'Quantifies digital memory, network bandwidth, and disk capacity requirements.',
      where: 'Used in database schema planning, cloud storage cost optimization, and network packet payload sizing.',
      when: 'During application architectural design, server provisioning, and media streaming budget calculations.',
    },
    guidedSteps: [
      { title: 'Step 1: Compare Bit, Nibble, and Byte', description: 'Inspect the fundamental units: 1 bit (0/1), 1 nibble (4 bits), 1 byte (8 bits = 256 states).' },
      { title: 'Step 2: Compare SI (1000) vs Binary IEC (1024)', description: 'Toggle between SI units (1 MB = 1,000,000 B) and IEC units (1 MiB = 1,048,576 B). Notice the 4.86% discrepancy.' },
      { title: 'Step 3: Estimate Uncompressed Image Size', description: 'Select a 1920×1080 Full HD image at 24 bits per pixel (True Color). Compute 1920 × 1080 × 3 bytes ≈ 6.22 MB per frame.' },
      { title: 'Step 4: Unravel the 1 TB Drive Formatting Mystery', description: 'Observe how a manufacturer\'s 1,000,000,000,000 bytes corresponds to 1,000,000,000,000 ÷ 1024³ ≈ 931.32 GiB in OS file managers.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Compute CD Audio Bitrate', goal: 'Calculate the uncompressed data rate for 44.1 kHz, 16-bit, stereo (2-channel) audio in kilobytes per second.', hint: '44,100 samples/s × 2 bytes/sample × 2 channels = 176,400 bytes/s ≈ 172.26 KiB/s.', successCondition: 'Matches 176.4 kB/s (1411.2 kbps)' },
      { id: 'ch2', title: '4K Video Frame Buffer', goal: 'Determine the memory required to buffer a single uncompressed 3840×2160 frame with 32-bit RGBA color.', hint: '3840 × 2160 × 4 bytes = 33,177,600 bytes.', successCondition: 'Buffer size equals 31.64 MiB' },
      { id: 'ch3', title: 'Network Download Time', goal: 'Calculate the theoretical transfer time for a 500 MB file over a 100 Mbps broadband connection.', hint: 'Convert 500 MB to 4000 Mb; 4000 Mb ÷ 100 Mbps = 40 seconds.', successCondition: 'Transfer time calculated as 40.0 seconds' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'How many bytes are in one Gibibyte (1 GiB)?', options: ['1,000,000,000 bytes (10⁹)', '1,048,576 bytes (2²⁰)', '1,073,741,824 bytes (2³⁰)', '1,099,511,627,776 bytes (2⁴⁰)'], correctIndex: 2, explanation: '1 GiB (binary prefix) equals 2³⁰ = 1,073,741,824 bytes, whereas 1 GB (SI prefix) is 10⁹ = 1,000,000,000 bytes.' },
      { id: 'q2', type: 'prediction', question: 'A hard disk manufacturer advertises a 500 GB drive. Approximately how many GiB will Windows report?', options: ['500 GiB', '465 GiB', '536 GiB', '400 GiB'], correctIndex: 1, explanation: '500 × 10⁹ bytes ÷ (1024)³ ≈ 465.66 GiB.' },
      { id: 'q3', type: 'interpretation', question: 'Why is it critical to distinguish between Mb (Megabit) and MB (Megabyte) in computing?', options: ['They have different voltage thresholds', '1 Megabyte = 8 Megabits; network speeds are quoted in bits/s while file sizes use bytes', 'Megabits apply only to RAM, Megabytes to SSDs', 'There is no practical difference in modern computing'], correctIndex: 1, explanation: 'A 100 Mbps (Megabits per second) internet connection downloads data at a peak speed of 100/8 = 12.5 MB/s (Megabytes per second).' },
      { id: 'q4', type: 'concept', question: 'What is the uncompressed size of a 1000×1000 pixel 24-bit RGB digital photograph?', options: ['1,000,000 bytes (1 MB)', '2,000,000 bytes (2 MB)', '3,000,000 bytes (3 MB)', '24,000,000 bytes (24 MB)'], correctIndex: 2, explanation: '1000 × 1000 pixels × (24 bits ÷ 8 bits/byte) = 3,000,000 bytes = 3 MB.' },
      { id: 'q5', type: 'concept', question: 'Which IEC binary prefix corresponds to 2⁴⁰ bytes?', options: ['Mebibyte (MiB)', 'Gibibyte (GiB)', 'Tebibyte (TiB)', 'Pebibyte (PiB)'], correctIndex: 2, explanation: 'KiB = 2¹⁰, MiB = 2²⁰, GiB = 2³⁰, TiB = 2⁴⁰.' },
    ],
    defaultParams: { mediaType: 'image', width: 1920, height: 1080, bpp: 24, useIec: false },
    is3DPreferred: false,
  },

  {
    id: 'u25cs102-multimedia-encoding',
    unit: 1,
    unitTitle: 'Digital Representation and Data Encoding',
    topic: 'Text (ASCII, Unicode, UTF-8), Image (Raster, RGB, Color Depth), and Audio (Sampling, Nyquist)',
    title: 'Text, Image and Sound Encoding Explorer',
    icon: '🎨',
    shortDescription: 'Multi-modal encoding lab exploring ASCII/UTF-8 byte sequences, RGB pixel matrices, color quantization, and Nyquist-Shannon audio sampling.',
    learningObjectives: [
      'Differentiate fixed ASCII (7-bit) from variable-length Unicode UTF-8 multi-byte encodings',
      'Deconstruct raster images into red, green, and blue color channels across 8-bit to 24-bit depths',
      'Explain Nyquist sampling criteria f_s ≥ 2 f_max to avoid audio frequency aliasing',
    ],
    prerequisites: ['Binary and hexadecimal numbers', 'Sound waves and frequencies'],
    estimatedTimeMinutes: 15,
    formulaOverview: '\\text{UTF-8 Byte Patterns}: 0xxxxxxx \\text{ (1B)}, 110xxxxx\\, 10xxxxxx \\text{ (2B)}, \\dots, \\quad f_{\\text{Nyquist}} \\ge 2 f_{\\max}',
    modelAssumptions: [
      'Character encodings demonstrate standard UTF-8 binary bit prefixes',
      'Audio synthesis models periodic sine waves with discrete time sampling and 8/16-bit quantization',
      'Color synthesis demonstrates additive RGB channel blending',
    ],
    engineeringContext: {
      what: 'Converts analog and symbolic real-world information into standardized digital representations.',
      where: 'Used in web browsers, video streaming codecs (H.264/AV1), audio formats (MP3/FLAC), and internationalization (i18n).',
      when: 'Whenever text is rendered on screen, media files are compressed, or voice audio is digitized.',
    },
    guidedSteps: [
      { title: 'Step 1: Inspect Text Encoding (ASCII vs UTF-8)', description: 'Type \'A\' (ASCII 65 = 0x41) versus \'€\' (Euro symbol = 3 bytes 0xE2 0x82 0xAC) to inspect UTF-8 variable width.' },
      { title: 'Step 2: Manipulate RGB Pixel Channels', description: 'Adjust Red, Green, and Blue sliders for a sample pixel. See how (255, 128, 0) combines to produce orange.' },
      { title: 'Step 3: Test Color Depth Reduction', description: 'Reduce color depth from 24-bit True Color (16.7M colors) to 8-bit (256 colors) and 1-bit monochrome to observe color banding.' },
      { title: 'Step 4: Sample an Audio Waveform', description: 'Adjust sampling rate from 44.1 kHz down to 4 kHz. Observe high-frequency distortion when sample rate drops below Nyquist limit.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Encode Unicode Character', goal: 'Find the UTF-8 byte representation of a multi-byte symbol like "π" or "©".', hint: 'Non-ASCII characters require 2 to 4 bytes in UTF-8.', successCondition: 'Displays valid multi-byte binary representation' },
      { id: 'ch2', title: 'Create Pure Yellow in RGB', goal: 'Set the RGB color channel values to synthesize pure digital yellow.', hint: 'Yellow in additive light is maximum Red + maximum Green + zero Blue.', successCondition: 'R=255, G=255, B=0 (#FFFF00)' },
      { id: 'ch3', title: 'Identify Aliasing Threshold', goal: 'Find the minimum sampling rate required to accurately capture a 5 kHz audio tone without aliasing.', hint: 'By Nyquist-Shannon theorem, sample rate must be at least 2 × 5 kHz = 10 kHz.', successCondition: 'Sampling rate set ≥ 10,000 Hz' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'How many bytes does the ASCII character \'M\' (Code 77) consume in UTF-8 encoding?', options: ['1 byte', '2 bytes', '3 bytes', '4 bytes'], correctIndex: 0, explanation: 'Standard ASCII characters (codes 0 to 127) are encoded as exactly 1 byte in UTF-8 with a leading 0 bit, ensuring backward compatibility.' },
      { id: 'q2', type: 'concept', question: 'According to the Nyquist-Shannon sampling theorem, what minimum sampling frequency is needed to faithfully record human audible sound up to 20 kHz?', options: ['10 kHz', '20 kHz', '40 kHz', '80 kHz'], correctIndex: 2, explanation: 'The sampling rate must be at least twice the maximum frequency: 2 × 20 kHz = 40 kHz (which is why CD audio uses 44.1 kHz).' },
      { id: 'q3', type: 'interpretation', question: 'What visual artifact occurs when an image is saved at too low a color bit depth (e.g., 4 bits instead of 24 bits)?', options: ['Geometric distortion', 'Motion blur', 'Color banding / posterization', 'Higher resolution'], correctIndex: 2, explanation: 'With too few discrete color levels, smooth gradients break down into visible abrupt bands (color posterization).' },
      { id: 'q4', type: 'concept', question: 'What color is produced on a digital screen by the RGB hexadecimal value #0000FF?', options: ['Pure Red', 'Pure Green', 'Pure Blue', 'White'], correctIndex: 2, explanation: '#0000FF corresponds to Red=0, Green=0, Blue=255, which is pure Blue.' },
      { id: 'q5', type: 'prediction', question: 'What audio artifact occurs if an analog signal with frequency f is sampled at rate f_s < 2f?', options: ['Echo', 'Aliasing (false lower frequency phantom tone)', 'Higher volume', 'Clipping'], correctIndex: 1, explanation: 'Sampling below the Nyquist rate causes high frequencies to fold back as false lower frequency signals known as aliasing.' },
    ],
    defaultParams: { mode: 'text', textInput: 'Hello 🌟', rgbR: 255, rgbG: 128, rgbB: 0, audioFreq: 1000, sampleRate: 8000 },
    is3DPreferred: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — COMPUTER ARCHITECTURE AND CPU EXECUTION (Simulations 5–8)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'u25cs102-hardware-explorer-3d',
    unit: 2,
    unitTitle: 'Computer Architecture and CPU Execution',
    topic: 'Computer Hardware Components: CPU, Motherboard, RAM, Storage, GPU, PSU, and Expansion Buses',
    title: 'Inside a Computer — 3D Hardware Explorer',
    icon: '🖥️',
    shortDescription: 'Interactive 3D desktop workstation chassis: rotate, inspect, isolate, and trace interconnections between CPU socket, RAM slots, PCIe, and storage.',
    learningObjectives: [
      'Identify internal desktop hardware components: CPU, Motherboard chipset, RAM DIMMs, NVMe/SATA storage, GPU, and PSU',
      'Explain the functional roles of system buses: PCIe lanes, memory bus, and SATA/NVMe channels',
      'Relate component specifications (socket type, clock speed, thermal design power TDP) to system performance',
    ],
    prerequisites: ['Basic concept of computer components'],
    estimatedTimeMinutes: 20,
    formulaOverview: '\\text{Memory Bandwidth} = \\text{Bus Width (bits)} \\times \\text{Clock (Hz)} \\times \\text{Transfers/cycle} \\div 8',
    modelAssumptions: [
      'Interactive 3D model presents standard ATX form-factor architecture',
      'Thermal and airflow arrows depict front-to-back chassis cooling dynamics',
      'Clicking any subsystem isolates it with component specification overlays',
    ],
    engineeringContext: {
      what: 'Physical substrate of modern von Neumann and Harvard architecture computers.',
      where: 'Desktop PCs, rackmount cloud servers, industrial automation controllers, and supercomputing clusters.',
      when: 'During computer system assembly, hardware diagnosis, server capacity planning, and component upgrades.',
    },
    guidedSteps: [
      { title: 'Step 1: Explore Motherboard and CPU Socket', description: 'Rotate the 3D case to view the motherboard. Click the CPU cooler and socket to inspect the processor core.' },
      { title: 'Step 2: Inspect Dual-Channel RAM DIMMs', description: 'Click the RAM slots to inspect high-speed volatile memory placed directly adjacent to the CPU for low latency.' },
      { title: 'Step 3: Examine PCIe Expansion Slots & GPU', description: 'Highlight the PCIe x16 slot hosting the dedicated graphics card with its parallel processing VRAM.' },
      { title: 'Step 4: Trace Power Supply and Storage Busses', description: 'Follow cables from the modular PSU to the motherboard, and trace the high-speed M.2 NVMe SSD mounted on the board.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Locate Volatile vs Non-Volatile Memory', goal: 'Identify and click both the primary volatile memory (RAM) and non-volatile storage (SSD/HDD).', hint: 'RAM loses data when powered off; SSD retains data permanently.', successCondition: 'Both RAM and Storage highlighted' },
      { id: 'ch2', title: 'Identify Processing Units', goal: 'Select both main processors in the system: the general-purpose CPU and the parallel GPU.', hint: 'Look for the socket on the motherboard and the expansion board in the PCIe slot.', successCondition: 'CPU and GPU selected' },
      { id: 'ch3', title: 'Verify Airflow and Cooling Path', goal: 'Enable thermal airflow visualizer and observe heat dissipation path from intake fans to exhaust.', hint: 'Cool air enters from the front and exits through the rear/top.', successCondition: 'Airflow visualization activated' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'Which computer component is directly responsible for coordinating system timing and executing instructions?', options: ['Power Supply Unit (PSU)', 'Central Processing Unit (CPU)', 'Random Access Memory (RAM)', 'Hard Disk Drive (HDD)'], correctIndex: 1, explanation: 'The CPU contains the control unit, arithmetic logic unit, and registers that fetch, decode, and execute program instructions.' },
      { id: 'q2', type: 'concept', question: 'What is the primary operational difference between RAM and secondary SSD storage?', options: ['RAM has higher capacity than SSD', 'RAM is volatile high-speed temporary memory; SSD is non-volatile persistent storage', 'SSD is connected directly to the CPU registers', 'RAM uses magnetic spinning platters while SSD uses lasers'], correctIndex: 1, explanation: 'RAM is volatile (data is erased when power is cut) and operates at nanosecond latencies, whereas SSDs retain data permanently across reboots.' },
      { id: 'q3', type: 'interpretation', question: 'Why are RAM slots positioned as close to the CPU socket as physically possible on a motherboard?', options: ['To share the CPU heat sink', 'To minimize physical trace length and electrical transit latency for high-frequency signals', 'Because RAM draws power directly from the CPU pins', 'To allow easy dust cleaning'], correctIndex: 1, explanation: 'Signals traveling along motherboard traces take approximately 1 ns per 15 cm. Placing RAM close to the CPU minimizes propagation delay and signal degradation at multi-gigahertz speeds.' },
      { id: 'q4', type: 'concept', question: 'Which high-speed bus standard is commonly used to connect graphics cards and fast NVMe solid-state drives?', options: ['USB 2.0', 'PCI Express (PCIe)', 'VGA', 'PS/2'], correctIndex: 1, explanation: 'PCI Express (PCIe) provides high-bandwidth, point-to-point serial communication lanes directly to the CPU and chipset.' },
      { id: 'q5', type: 'concept', question: 'What is the role of the Power Supply Unit (PSU) inside a computer?', options: ['It stores the BIOS firmware', 'It converts AC mains voltage to clean DC voltages (+12V, +5V, +3.3V)', 'It controls memory refresh cycles', 'It performs graphics rendering'], correctIndex: 1, explanation: 'The PSU converts alternating current (AC) from wall power into the direct current (DC) rails required by digital electronics.' },
    ],
    defaultParams: { activeComponent: 'cpu', explodedView: false, showAirflow: true, viewMode: '3d' },
    is3DPreferred: true,
  },

  {
    id: 'u25cs102-ipo-journey',
    unit: 2,
    unitTitle: 'Computer Architecture and CPU Execution',
    topic: 'Input-Process-Output (IPO) Cycle, System Buses, and Peripheral Interfaces',
    title: 'Input–Process–Output Data Journey',
    icon: '🔄',
    shortDescription: 'Animated data packet journey tracing how keyboard clicks, mouse motions, and camera frames traverse USB controllers, RAM, CPU interrupts, and screen display.',
    learningObjectives: [
      'Trace real-world event pipelines through the Input → Processing → Storage → Output cycle',
      'Understand hardware interrupts and Direct Memory Access (DMA) during peripheral I/O',
      'Explain how the operating system and device drivers mediate hardware communication',
    ],
    prerequisites: ['Basic computer hardware understanding'],
    estimatedTimeMinutes: 15,
    formulaOverview: '\\text{IPO Pipeline}: \\text{Input Event} \\xrightarrow{\\text{IRQ}} \\text{Driver / OS} \\xrightarrow{\\text{Bus}} \\text{RAM / CPU} \\xrightarrow{\\text{VRAM}} \\text{Display Output}',
    modelAssumptions: [
      'Visualizes representative scenarios: typing a text document, saving a file, and taking a webcam photo',
      'Illustrates interrupt service routines (ISR) preempting lower-priority background tasks',
      'Highlights the difference between volatile working RAM and persistent storage persistence',
    ],
    engineeringContext: {
      what: 'Fundamental operational model of all digital computers since von Neumann.',
      where: 'Embedded IoT nodes, smartphones, game consoles, and enterprise servers.',
      when: 'Every time user keystrokes appear on a screen or sensors trigger automated industrial actions.',
    },
    guidedSteps: [
      { title: 'Step 1: Choose an I/O Scenario', description: 'Select "Typing a Document". Observe a keypress event generated on the keyboard controller.' },
      { title: 'Step 2: Trace Interrupt Request (IRQ) to CPU', description: 'Follow the electrical IRQ signal traveling through the USB host controller and interrupt controller to the CPU.' },
      { title: 'Step 3: Process in RAM and Execute in CPU', description: 'Watch the operating system interrupt handler translate the keycode into a character in application RAM.' },
      { title: 'Step 4: Output to Display Framebuffer', description: 'Trace the updated text sent to the GPU framebuffer and rasterized onto the monitor screen.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Trace File Save Pipeline', goal: 'Select the "Save to Disk" scenario and verify that data flows from CPU/RAM to permanent storage.', hint: 'Saving writes data from volatile RAM blocks to persistent SSD blocks.', successCondition: 'Save pipeline completed with confirmation' },
      { id: 'ch2', title: 'Direct Memory Access (DMA)', goal: 'Select "Camera Video Capture" and observe DMA transferring image frames directly to RAM without burdening the CPU for every byte.', hint: 'DMA bypasses continuous CPU byte-by-byte polling.', successCondition: 'DMA path illuminated' },
      { id: 'ch3', title: 'Interrupt Priority Challenge', goal: 'Trigger a keyboard event while a slow print job is spooling to see high-priority user input handled immediately.', hint: 'Hardware interrupts allow timely interactive response.', successCondition: 'Interrupt priority verified' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'In the classic IPO computing model, which of the following is strictly an output device?', options: ['Touchscreen', 'Mechanical Keyboard', 'Liquid Crystal Display (LCD) Monitor', 'Optical Mouse'], correctIndex: 2, explanation: 'An LCD monitor only displays information from the computer (output), whereas touchscreens are dual input/output, and keyboards/mice are input devices.' },
      { id: 'q2', type: 'concept', question: 'What mechanism allows external peripherals to alert the CPU immediately when new data is ready?', options: ['Direct Memory Access (DMA)', 'Interrupt Request (IRQ)', 'Virtual Memory Paging', 'Clock Gating'], correctIndex: 1, explanation: 'An Interrupt Request (IRQ) signals the CPU to temporarily halt current execution and handle the peripheral event via an Interrupt Service Routine (ISR).' },
      { id: 'q3', type: 'interpretation', question: 'What would happen if a computer used only polling instead of hardware interrupts for keyboard input?', options: ['The keyboard would consume more electricity', 'The CPU would waste substantial clock cycles repeatedly asking the keyboard if a key was pressed, potentially dropping rapid keystrokes during heavy loads', 'The screen would not update', 'Programs would run twice as fast'], correctIndex: 1, explanation: 'Polling requires continuous active CPU querying, wasting power and clock cycles and causing lag if the CPU is busy with other tasks.' },
      { id: 'q4', type: 'concept', question: 'What is the purpose of Direct Memory Access (DMA)?', options: ['It allows high-speed devices to transfer data directly to/from RAM without routing every byte through the CPU', 'It replaces the CPU ALU', 'It converts digital signals to analog audio', 'It clears CPU cache lines automatically'], correctIndex: 0, explanation: 'DMA offloads bulk data transfers (like disk or network reads) directly to memory, freeing the CPU to perform compute tasks.' },
      { id: 'q5', type: 'prediction', question: 'When you type text in an unsaved text editor and suddenly lose electrical power, why is the text lost?', options: ['The monitor lost power', 'The text was stored in volatile RAM and had not yet been written to non-volatile secondary storage', 'The keyboard buffer erased the keys', 'The CPU registers were corrupted'], correctIndex: 1, explanation: 'Working application state resides in volatile RAM. Until explicitly saved to persistent storage (SSD/HDD), power loss erases the contents.' },
    ],
    defaultParams: { scenario: 'keyboard', speed: 1.0, showIrq: true },
    is3DPreferred: true,
  },

  {
    id: 'u25cs102-cpu-execution',
    unit: 2,
    unitTitle: 'Computer Architecture and CPU Execution',
    topic: 'Von Neumann Architecture, Instruction Cycle (Fetch-Decode-Execute-Writeback), and Tiny Educational CPU',
    title: 'CPU Instruction Execution Simulator',
    icon: '⚙️',
    shortDescription: 'Step-by-step von Neumann machine cycle simulator: trace Program Counter (PC), Instruction Register (IR), Control Unit, ALU, and General Registers.',
    learningObjectives: [
      'Trace the four phases of the machine cycle: Instruction Fetch, Decode, Execute, and Write-Back',
      'Understand register roles: Program Counter (PC), Memory Address Register (MAR), Instruction Register (IR), and Accumulator (ACC)',
      'Step through an educational assembly program executing LOAD, ADD, STORE, and conditional JUMP',
    ],
    prerequisites: ['Binary numbers', 'Basic concept of CPU and memory'],
    estimatedTimeMinutes: 20,
    formulaOverview: '\\text{Cycle}: \\text{PC} \\xrightarrow{\\text{Fetch}} \\text{IR}, \\quad \\text{PC} \\leftarrow \\text{PC} + 1, \\quad \\text{Decode}(\\text{IR.opcode}), \\quad \\text{Execute}(\\text{ALU}), \\quad \\text{Writeback}',
    modelAssumptions: [
      'Simulates a simplified 8-bit accumulator-based von Neumann educational architecture',
      'Single bus model connecting registers, ALU, and a 16-word RAM address space',
      'Instruction format: 4-bit Opcode + 4-bit Operand address',
    ],
    engineeringContext: {
      what: 'Core operational loop executed billions of times per second inside every CPU.',
      where: 'x86-64 processors, ARM microcontrollers, RISC-V academic silicon, and Apple Silicon chips.',
      when: 'Continuously as long as any computer, phone, or embedded device is powered on.',
    },
    guidedSteps: [
      { title: 'Step 1: Fetch Phase', description: 'Observe the Program Counter (PC=0) transfer its address to MAR. Memory reads instruction "LOAD [14]" into IR, and PC increments to 1.' },
      { title: 'Step 2: Decode Phase', description: 'Control Unit decodes the opcode (LOAD) and sets control signals to route memory location 14 onto the system bus.' },
      { title: 'Step 3: Execute & Writeback Phase', description: 'Value 15 from address 14 is loaded into Accumulator (ACC). The instruction completes.' },
      { title: 'Step 4: Execute an ADD Instruction', description: 'Step to next cycle (ADD [15]). ALU fetches memory value 7, adds it to ACC (15), and stores the result (22) back into ACC.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Trace Memory Accumulation', goal: 'Step through the default program until the final STORE [13] instruction writes the sum into memory.', hint: 'Watch address 13 in the RAM grid change from 0 to 22.', successCondition: 'RAM[13] equals 22' },
      { id: 'ch2', title: 'Predict PC Jump', goal: 'Observe a JUMP instruction and predict what address the Program Counter will load next.', hint: 'JUMP updates PC directly, skipping sequential execution.', successCondition: 'Branch taken successfully' },
      { id: 'ch3', title: 'Modify Operand Value', goal: 'Change the value at RAM[14] from 15 to 20, reset, and verify that the final computed sum becomes 27.', hint: '20 + 7 = 27 in memory location 13.', successCondition: 'RAM[13] equals 27' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the primary function of the Program Counter (PC) register in a CPU?', options: ['It stores the result of the latest ALU calculation', 'It counts how many errors occurred in the program', 'It holds the memory address of the next instruction to be fetched', 'It stores the current user password'], correctIndex: 2, explanation: 'The Program Counter (PC) holds the memory address of the next instruction to be executed and automatically increments or updates on jumps.' },
      { id: 'q2', type: 'concept', question: 'During which phase of the CPU instruction cycle does the ALU perform arithmetic or logic operations?', options: ['Fetch', 'Decode', 'Execute', 'Interrupt Check'], correctIndex: 2, explanation: 'The ALU performs mathematical calculations and comparisons during the Execute phase.' },
      { id: 'q3', type: 'prediction', question: 'If the Program Counter contains address 0x0040, what happens to the PC immediately after the instruction at 0x0040 is fetched (assuming no branch)?', options: ['It resets to 0x0000', 'It increments to 0x0041 (or next instruction address)', 'It holds 0x0040 until program termination', 'It copies the accumulator value'], correctIndex: 1, explanation: 'During the fetch phase, the PC is automatically incremented to point to the subsequent sequential instruction in memory.' },
      { id: 'q4', type: 'concept', question: 'What register holds the instruction currently being decoded and executed by the control unit?', options: ['Memory Data Register (MDR)', 'Instruction Register (IR)', 'Stack Pointer (SP)', 'Index Register (IX)'], correctIndex: 1, explanation: 'The Instruction Register (IR) holds the binary opcode and operand of the current instruction fetched from memory.' },
      { id: 'q5', type: 'interpretation', question: 'What is the "von Neumann bottleneck"?', options: ['The CPU clock speed is limited by room temperature', 'The shared bus between the CPU and memory limits data transfer throughput compared to CPU processing speed', 'Monitors cannot display graphics fast enough', 'Keyboards cannot register simultaneous presses'], correctIndex: 1, explanation: 'The von Neumann bottleneck refers to the throughput limit caused by CPU processing speeds far outpacing the throughput of the bus connecting CPU to main memory.' },
    ],
    defaultParams: { clockSpeed: 1, isRunning: false, currentStep: 0 },
    is3DPreferred: true,
  },

  {
    id: 'u25cs102-cpu-pipeline',
    unit: 2,
    unitTitle: 'Computer Architecture and CPU Execution',
    topic: 'Instruction Pipelining, Throughput, Speedup, and Structural/Data/Control Hazards',
    title: 'CPU Pipelining and Hazards Visualizer',
    icon: '⚡',
    shortDescription: 'Interactive instruction pipeline simulator contrasting sequential execution with a 5-stage pipeline (IF, ID, EX, MEM, WB) and visualizing stalls and hazard forwarding.',
    learningObjectives: [
      'Compare sequential execution time T = N × k with ideal pipelined execution time T = k + (N - 1)',
      'Identify the three classic pipeline hazards: Structural, Data (RAW dependencies), and Control (Branches)',
      'Observe pipeline stalls (bubbles) and demonstrate how data forwarding resolves hazards without wasting cycles',
    ],
    prerequisites: ['Instruction execution cycle', 'Basic clock cycles'],
    estimatedTimeMinutes: 20,
    formulaOverview: 'T_{\\text{seq}} = N \\cdot k \\text{ cycles}, \\quad T_{\\text{pipe}} = k + (N - 1) + \\text{Stalls}, \\quad \\text{Speedup} = \\frac{N \\cdot k}{k + N - 1} \\xrightarrow{N \\to \\infty} k',
    modelAssumptions: [
      'Models classic RISC 5-stage pipeline: Instruction Fetch (IF), Decode (ID), Execute (EX), Memory (MEM), Writeback (WB)',
      'Each stage completes in exactly 1 clock cycle',
      'Selectable forwarding paths demonstrate ALU-to-ALU operand bypass',
    ],
    engineeringContext: {
      what: 'Core microarchitectural technique used to maximize instruction throughput (IPC) in all modern processors.',
      where: 'ARM Cortex, Intel Core, AMD Zen, and Apple M-series CPUs.',
      when: 'During instruction scheduling, compiler optimization, and branch predictor design.',
    },
    guidedSteps: [
      { title: 'Step 1: Run Sequential Execution', description: 'Run 4 instructions sequentially. With 5 stages each, total time is 4 × 5 = 20 clock cycles.' },
      { title: 'Step 2: Enable 5-Stage Pipelining', description: 'Enable pipelining with no hazards. Watch instructions overlap like an assembly line, finishing in 5 + 3 = 8 cycles (2.5× speedup).' },
      { title: 'Step 3: Introduce a Data Hazard (RAW)', description: 'Add instruction 2 needing R1 before instruction 1 writes it back. Observe the pipeline insert 2 stall cycles (bubbles).' },
      { title: 'Step 4: Enable Hardware Data Forwarding', description: 'Toggle "Data Forwarding" ON. Watch the ALU bypass the result directly from EX stage to ID/EX, eliminating stalls.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Calculate Ideal Speedup', goal: 'Compute the theoretical speedup for 100 instructions on a 5-stage pipeline with zero hazards.', hint: 'Sequential = 500 cycles. Pipeline = 5 + 99 = 104 cycles. Speedup ≈ 500 / 104 = 4.81×.', successCondition: 'Speedup matches ~4.8×' },
      { id: 'ch2', title: 'Resolve Branch Penalty', goal: 'Inspect a branch instruction and observe branch misprediction flushing instructions from the pipeline.', hint: 'Flushing discards fetched instructions when a conditional branch is taken.', successCondition: 'Branch flush observed' },
      { id: 'ch3', title: 'Zero-Stall Program Reordering', goal: 'Reorder independent instructions to separate a LOAD and its dependent USE, eliminating load-use stalls.', hint: 'Place an independent instruction between LOAD R1 and ADD R2, R1.', successCondition: 'Stalls reduced to 0' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the theoretical maximum speedup of an ideal k-stage pipeline over sequential execution for a very large number of instructions?', options: ['2×', 'k×', 'k²', 'Infinity'], correctIndex: 1, explanation: 'As the number of instructions N approaches infinity, Speedup = (N × k) / (k + N - 1) approaches k (the number of pipeline stages).' },
      { id: 'q2', type: 'concept', question: 'Which type of pipeline hazard occurs when an instruction requires data produced by a previous instruction that has not yet completed writeback?', options: ['Structural Hazard', 'Data Hazard (Read-After-Write)', 'Control Hazard', 'Thermal Hazard'], correctIndex: 1, explanation: 'A data hazard (specifically RAW - Read After Write) occurs when an instruction depends on the result of an earlier instruction still in the pipeline.' },
      { id: 'q3', type: 'prediction', question: 'How many clock cycles are required to execute 6 instructions in an ideal 5-stage pipeline with no stalls or hazards?', options: ['30 cycles', '10 cycles', '11 cycles', '6 cycles'], correctIndex: 1, explanation: 'Formula: k + (N - 1) = 5 + (6 - 1) = 5 + 5 = 10 clock cycles (compared to 6 × 5 = 30 sequential cycles).' },
      { id: 'q4', type: 'interpretation', question: 'What is the purpose of hardware "data forwarding" (operand bypassing) in a pipelined CPU?', options: ['It sends data over the internet faster', 'It routes ALU computation results directly to dependent instructions in earlier stages without waiting for register file writeback', 'It predicts which branch will be taken', 'It increases the clock frequency of the motherboard'], correctIndex: 1, explanation: 'Data forwarding routes intermediate results directly from the EX or MEM stage back to dependent ALU inputs, avoiding stall cycles.' },
      { id: 'q5', type: 'concept', question: 'What causes a "control hazard" in an instruction pipeline?', options: ['Two instructions attempting to use the memory port at the same time', 'Conditional branch and jump instructions changing the execution flow before the outcome is known', 'Voltage drops on the power rail', 'Cache misses in level 3 cache'], correctIndex: 1, explanation: 'Control hazards arise from branch instructions where the next instruction address depends on a condition evaluated later in the pipeline.' },
    ],
    defaultParams: { instructionCount: 5, forwardingEnabled: true, hasDataHazard: false, hasBranch: false },
    is3DPreferred: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — MEMORY HIERARCHY, STORAGE AND DIGITAL LOGIC (Simulations 9–12)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'u25cs102-memory-hierarchy-3d',
    unit: 3,
    unitTitle: 'Memory Hierarchy, Storage and Digital Logic',
    topic: 'Memory Hierarchy Pyramid: Registers, L1/L2/L3 Cache, Main Memory (RAM), and NVMe/SSD Storage',
    title: 'Memory Hierarchy — 3D Data Retrieval Lab',
    icon: '🏛️',
    shortDescription: 'Interactive 3D pyramid lab exploring access speeds, cost per bit, and capacities from sub-nanosecond CPU registers down to multi-terabyte SSD storage.',
    learningObjectives: [
      'Compare memory tiers: Registers (<1 ns), L1/L2/L3 Cache (1-10 ns), RAM (50-100 ns), and SSD (10-100 µs)',
      'Apply Average Memory Access Time (AMAT): AMAT = Hit Time + (Miss Rate × Miss Penalty)',
      'Explain the economic trade-off: higher speed requires expensive, small-capacity silicon near the core',
    ],
    prerequisites: ['Basic memory concepts', 'Nanoseconds vs microseconds'],
    estimatedTimeMinutes: 20,
    formulaOverview: '\\text{AMAT} = T_{\\text{hit}} + (\\text{Miss Rate} \\times T_{\\text{penalty}}), \\quad T_{\\text{Reg}} < T_{\\text{L1}} < T_{\\text{L2}} < T_{\\text{L3}} < T_{\\text{RAM}} \\ll T_{\\text{SSD}}',
    modelAssumptions: [
      'Latency values represent typical high-performance CPU architectural ballparks',
      '3D pyramid highlights data request traversal down the tiers until a match is found',
      'Illustrates capacity vs latency inversion relationship',
    ],
    engineeringContext: {
      what: 'Architectural hierarchy that gives the illusion of memory as large as a disk and nearly as fast as registers.',
      where: 'Every modern microprocessor, smartphone SoC, server CPU, and operating system virtual memory subsystem.',
      when: 'During algorithm design (cache-aware algorithms) and database query optimization.',
    },
    guidedSteps: [
      { title: 'Step 1: Explore the 3D Pyramid Tiers', description: 'Rotate the 3D hierarchy pyramid: top apex (Registers), middle tiers (L1, L2, L3 SRAM Cache), base (DRAM RAM), foundation (Flash SSD).' },
      { title: 'Step 2: Trace a Cache Hit Request', description: 'Send a memory request that hits in L1 Cache. Notice the instantaneous 1 ns response time and green confirmation.' },
      { title: 'Step 3: Trace a DRAM Cache Miss Request', description: 'Send an uncached request. Watch the signal travel past L1, L2, L3 down to main RAM, taking ~60 ns (a 60× latency penalty).' },
      { title: 'Step 4: Trace a Page Fault to Storage', description: 'Simulate a virtual memory page fault fetching data from SSD storage (taking ~20,000 ns), demonstrating why disk I/O freezes interactive threads.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Compute AMAT for 95% Hit Rate', goal: 'Given L1 Hit Time = 1 ns, Miss Penalty = 50 ns, compute AMAT when Hit Rate is 95%.', hint: 'Miss Rate = 5% = 0.05. AMAT = 1 + (0.05 × 50) = 1 + 2.5 = 3.5 ns.', successCondition: 'AMAT calculated as 3.5 ns' },
      { id: 'ch2', title: 'Compare Humanized Latency Scale', goal: 'Toggle "Human Time Scale" (where 1 CPU cycle = 1 second) to see RAM become minutes and SSD become months.', hint: 'If 1 cycle = 1 s, L1 is 1 s, RAM is 1 minute, and SSD is ~7 months!', successCondition: 'Humanized scale inspected' },
      { id: 'ch3', title: 'Multi-Level Cache AMAT', goal: 'Analyze how adding an L2 cache reduces overall memory access latency compared to direct RAM access.', hint: 'L2 catches most L1 misses before reaching slow DRAM.', successCondition: 'Multi-level benefit verified' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'Which tier in the memory hierarchy offers the fastest access time?', options: ['L3 Shared Cache', 'CPU Internal Registers', 'DDR5 Main Memory', 'NVMe PCIe 4.0 SSD'], correctIndex: 1, explanation: 'CPU internal registers reside directly inside the processor datapath and can be read or written within a single clock cycle (< 0.5 ns).' },
      { id: 'q2', type: 'prediction', question: 'If a system has a 90% cache hit rate with a 2 ns cache hit time and a 100 ns main memory miss penalty, what is the Average Memory Access Time (AMAT)?', options: ['12 ns', '92 ns', '51 ns', '102 ns'], correctIndex: 0, explanation: 'AMAT = Hit Time + (Miss Rate × Miss Penalty) = 2 ns + (0.10 × 100 ns) = 2 + 10 = 12 ns.' },
      { id: 'q3', type: 'interpretation', question: 'Why don\'t computer engineers simply manufacture computers with 64 Gigabytes of ultra-fast SRAM cache instead of DRAM?', options: ['SRAM cannot hold numbers larger than 255', 'SRAM requires 6 transistors per bit, making it physically too large, excessively hot, and prohibitively expensive compared to 1-transistor DRAM', 'SRAM is slower than DRAM', 'Operating systems do not support large SRAM arrays'], correctIndex: 1, explanation: 'SRAM uses 6 transistors per cell (6T) without capacitors, making it fast but extremely bulky, power-hungry, and expensive compared to DRAM (1 transistor + 1 capacitor per cell).' },
      { id: 'q4', type: 'concept', question: 'Approximately how much slower is accessing data from DRAM (main memory) compared to an L1 cache hit?', options: ['Roughly 2× slower', 'Roughly 50× to 100× slower', 'DRAM is faster than L1', 'Roughly 10,000× slower'], correctIndex: 1, explanation: 'L1 cache access takes ~1 ns (3-4 clock cycles), while DRAM access takes ~50-100 ns (150-250 clock cycles), making DRAM 50× to 100× slower.' },
      { id: 'q5', type: 'concept', question: 'What type of memory semiconductor technology is universally used for CPU L1 and L2 caches?', options: ['DRAM (Dynamic RAM)', 'SRAM (Static RAM)', 'NAND Flash', 'EEPROM'], correctIndex: 1, explanation: 'Caches use Static RAM (SRAM) because it does not require periodic electrical refresh cycles and provides the lowest possible latency.' },
    ],
    defaultParams: { hitRateL1: 90, hitRateL2: 95, viewTier: 'all', timeScale: 'ns' },
    is3DPreferred: true,
  },

  {
    id: 'u25cs102-cache-locality',
    unit: 3,
    unitTitle: 'Memory Hierarchy, Storage and Digital Logic',
    topic: 'Cache Memory Operations, Temporal Locality, Spatial Locality, Direct-Mapped vs Associative Caches',
    title: 'Cache Hit, Cache Miss and Locality Challenge',
    icon: '🎯',
    shortDescription: 'Interactive cache simulator contrasting spatial vs temporal locality, cache line blocks, address tag/index/offset parsing, and replacement policies.',
    learningObjectives: [
      'Distinguish Temporal Locality (accessing same item again soon) from Spatial Locality (accessing nearby items)',
      'Break down a memory address into Tag, Index, and Block Offset fields',
      'Trace Cold (Compulsory), Capacity, and Conflict misses across direct-mapped and set-associative caches',
    ],
    prerequisites: ['Binary addresses', 'Memory hierarchy basics'],
    estimatedTimeMinutes: 15,
    formulaOverview: '\\text{Address Bits} = \\underbrace{\\text{Tag}}_{t} + \\underbrace{\\text{Index}}_{s} + \\underbrace{\\text{Offset}}_{b}, \\quad \\text{Hit Ratio} = \\frac{\\text{Hits}}{\\text{Hits} + \\text{Misses}} \\times 100\\%',
    modelAssumptions: [
      'Simulates an educational 8-line cache with 4 bytes per block (line)',
      'Supports direct-mapped and 2-way set-associative modes with LRU replacement',
      'Visualizes loop array traversals: row-major (spatial hit) vs column-major (spatial miss)',
    ],
    engineeringContext: {
      what: 'Underlying hardware mechanism determining high performance in software algorithms.',
      where: 'Matrix multiplication libraries (BLAS), game engine entity component systems, and database index scans.',
      when: 'During code performance profiling, choosing array versus linked list data structures.',
    },
    guidedSteps: [
      { title: 'Step 1: Inspect Address Bit Partitioning', description: 'Enter address 0x1A (00011010). See how bits split into Tag (0001), Line Index (10), and Byte Offset (10).' },
      { title: 'Step 2: Experience a Compulsory Miss and Line Fill', description: 'Access a new memory address. Observe a cache miss (Cold miss). The entire 4-byte block is fetched from RAM into the cache line.' },
      { title: 'Step 3: Exploit Spatial Locality', description: 'Access adjacent address 0x1B immediately after. Observe a Cache Hit because 0x1B was already loaded in the same block!' },
      { title: 'Step 4: Contrast Row-Major vs Column-Major Access', description: 'Run a 2D array traversal by rows (high spatial locality, 75%+ hits) versus by columns (thrashing misses on every access).' },
    ],
    challenges: [
      { id: 'ch1', title: 'Achieve 75% Hit Rate on Array', goal: 'Run a linear loop through 16 consecutive bytes and verify a 75% hit rate with 4-byte cache lines.', hint: '1 miss fetches 4 bytes; subsequent 3 bytes hit. 3 hits / 4 accesses = 75%.', successCondition: 'Hit rate achieves exactly 75%' },
      { id: 'ch2', title: 'Trigger Conflict Miss Thrashing', goal: 'In Direct-Mapped mode, alternate between two addresses that map to the exact same cache index line.', hint: 'Two addresses with the same index but different tags continuously evict each other.', successCondition: 'Conflict misses detected' },
      { id: 'ch3', title: 'Resolve with 2-Way Associativity', goal: 'Switch cache architecture to 2-Way Set-Associative and re-run the alternating accesses to eliminate conflict misses.', hint: 'Each set can now hold two lines simultaneously.', successCondition: 'Conflict misses resolved' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What principle of locality states that data items with memory addresses close to recently accessed data are likely to be accessed soon?', options: ['Temporal Locality', 'Spatial Locality', 'Associative Locality', 'Virtual Locality'], correctIndex: 1, explanation: 'Spatial locality states that accessing memory address X makes it highly probable that adjacent addresses (X+1, X+2) will be accessed soon.' },
      { id: 'q2', type: 'concept', question: 'When a cache miss occurs, what does the hardware load from main memory into the cache?', options: ['Only the single requested byte', 'An entire cache line (block) containing the requested byte and adjacent bytes', 'The entire program', 'All variables in RAM'], correctIndex: 1, explanation: 'Caches transfer data in fixed-size blocks (cache lines, typically 64 bytes) to exploit spatial locality.' },
      { id: 'q3', type: 'prediction', question: 'In a C program, traversing a 2D array A[1000][1000] in row-major order A[i][j] is typically much faster than column-major order A[j][i]. Why?', options: ['Compilers do not like variable j', 'Row-major matches memory storage layout, maximizing spatial cache hits', 'Column-major math causes arithmetic overflow', 'Row-major uses fewer CPU registers'], correctIndex: 1, explanation: 'In C, 2D arrays are stored sequentially row-by-row in memory. Row-major access accesses sequential adjacent memory addresses, yielding maximum cache hits.' },
      { id: 'q4', type: 'concept', question: 'What type of cache miss occurs the very first time a memory block is ever referenced?', options: ['Conflict Miss', 'Capacity Miss', 'Compulsory (Cold) Miss', 'Coherence Miss'], correctIndex: 2, explanation: 'Compulsory (or cold) misses are unavoidable misses that occur on the very first access to any block when the cache starts empty.' },
      { id: 'q5', type: 'interpretation', question: 'What is the role of the "Tag" field in a cache memory address?', options: ['It identifies which byte inside the block is requested', 'It identifies which cache line index to check', 'It verifies whether the block stored in that cache slot matches the requested memory address', 'It measures the temperature of the chip'], correctIndex: 2, explanation: 'Multiple memory addresses map to the same cache line index. The Tag bits stored alongside the data verify that the cached line actually belongs to the requested address.' },
    ],
    defaultParams: { cacheType: 'direct', blockSize: 4, lineCount: 8, accessPattern: 'sequential' },
    is3DPreferred: false,
  },

  {
    id: 'u25cs102-storage-filesystem',
    unit: 3,
    unitTitle: 'Memory Hierarchy, Storage and Digital Logic',
    topic: 'Secondary Storage: HDD Platter Mechanics, SSD Flash NAND Blocks, File Systems, and Inodes',
    title: 'Storage Device and File-System Explorer',
    icon: '💽',
    shortDescription: 'Compare mechanical HDD seek times and rotational latency with SSD flash NAND flash block erase/write cycles and hierarchical folder directory structures.',
    learningObjectives: [
      'Analyze HDD latency components: Seek Time + Rotational Latency + Transfer Time',
      'Understand Solid State Drive (SSD) flash principles: Pages (read/write) vs Blocks (erase-before-write) and wear leveling',
      'Explore file system organization: directory tree, metadata (file size, permissions, timestamps), and file allocation tables',
    ],
    prerequisites: ['Data sizes (KB, MB, GB)', 'Memory hierarchy concepts'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'T_{\\text{HDD}} = T_{\\text{seek}} + \\frac{1}{2 \\cdot \\text{RPM}} + T_{\\text{transfer}}, \\quad \\text{SSD Write Amplification} = \\frac{\\text{Flash Bytes Written}}{\\text{Host Bytes Written}}',
    modelAssumptions: [
      'HDD model simulates spinning magnetic platter (5400/7200 RPM) with moving read/write arm',
      'SSD model demonstrates block-level erase requirements and flash cell endurance limits',
      'File system sandbox models hierarchical folder trees with file allocation tables',
    ],
    engineeringContext: {
      what: 'Persistent secondary storage systems safeguarding information across computer power cycles.',
      where: 'Laptops, data center SAN storage arrays, cloud object stores (S3), and mobile flash chips.',
      when: 'Whenever files are created, databases commit transactions, or OS boot loaders load kernel binaries.',
    },
    guidedSteps: [
      { title: 'Step 1: Inspect HDD Mechanical Latency', description: 'Trigger random reads on a spinning HDD. Watch the mechanical arm physically seek tracks and wait for platter rotation (5-10 ms latency).' },
      { title: 'Step 2: Inspect SSD Solid-State Speed', description: 'Trigger reads on the SSD. Notice zero moving parts and purely electronic cell addressing delivering 0.05 ms latency (100× faster).' },
      { title: 'Step 3: SSD Write & Erase Block Dynamics', description: 'Observe the SSD writing to empty pages. See how updating a page requires copying valid data and erasing the entire flash block.' },
      { title: 'Step 4: Explore File System Directory Tree', description: 'Create, rename, and delete files in the sandbox file system. Inspect how metadata tracks file size and cluster block pointers.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Compare Random vs Sequential I/O', goal: 'Benchmark random file access versus sequential file access on the HDD model and observe the massive throughput drop.', hint: 'Sequential access avoids arm seek latency between consecutive sectors.', successCondition: 'Sequential throughput exceeds random by >10×' },
      { id: 'ch2', title: 'Simulate SSD Wear Leveling', goal: 'Perform multiple writes to the SSD and observe the controller distributing writes evenly across all blocks.', hint: 'Wear leveling prevents premature cell failure on frequently modified blocks.', successCondition: 'Even wear distribution verified' },
      { id: 'ch3', title: 'File Fragmentation Challenge', goal: 'Delete interleaved files and allocate a larger new file to observe fragmented cluster distribution.', hint: 'Non-contiguous allocation causes extra head movement on HDDs.', successCondition: 'Fragmented cluster map created' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the average rotational latency for a hard disk drive spinning at 7200 RPM?', options: ['4.17 milliseconds', '8.33 milliseconds', '0.10 milliseconds', '60 seconds'], correctIndex: 0, explanation: 'At 7200 RPM, one full rotation takes 60 ÷ 7200 = 8.33 ms. On average, the target sector is half a rotation away: 8.33 ÷ 2 ≈ 4.17 ms.' },
      { id: 'q2', type: 'concept', question: 'Why can an SSD read data randomly across the drive with virtually zero latency difference compared to sequential reads?', options: ['It uses faster spinning platters', 'It has no physical moving heads or spinning platters; cells are addressed purely electronically', 'It stores all files in CPU registers', 'It operates only in read-only mode'], correctIndex: 1, explanation: 'SSDs use solid-state semiconductor flash memory with no mechanical moving parts, enabling near-uniform electronic address access.' },
      { id: 'q3', type: 'concept', question: 'What is an "erase block" in NAND flash memory technology?', options: ['A defective region of disk', 'The smallest unit of flash memory that can be erased at once, typically containing 64 to 256 individual read/write pages', 'The CPU trash bin', 'A sector reserved for OS boot files'], correctIndex: 1, explanation: 'In NAND flash, reads and writes occur in small "pages" (4-16 KB), but erasure can only be performed in larger "blocks" (128 KB - 8 MB).' },
      { id: 'q4', type: 'interpretation', question: 'What is the role of an Operating System File System (like NTFS, ext4, or APFS)?', options: ['To cool the hard drive', 'To organize raw storage blocks into human-readable files, directory hierarchies, permissions, and metadata', 'To convert digital text to analog audio', 'To run the CPU arithmetic unit'], correctIndex: 1, explanation: 'A file system abstracts raw storage sectors into structured directories, named files, access permissions, and allocation tables.' },
      { id: 'q5', type: 'concept', question: 'What is the purpose of the SSD controller\'s "wear leveling" algorithm?', options: ['To make the SSD run cooler', 'To distribute write/erase cycles evenly across all flash cells so no single block burns out prematurely', 'To defragment mechanical tracks', 'To compress text files automatically'], correctIndex: 1, explanation: 'NAND flash cells degrade after a finite number of write/erase cycles (~1,000-10,000 P/E cycles). Wear leveling ensures all cells age at the same rate.' },
    ],
    defaultParams: { storageType: 'ssd', rpm: 7200, accessMode: 'random', showPlatter3d: true },
    is3DPreferred: true,
  },

  {
    id: 'u25cs102-logic-gates',
    unit: 3,
    unitTitle: 'Memory Hierarchy, Storage and Digital Logic',
    topic: 'Boolean Logic Gates (AND, OR, NOT, NAND, NOR, XOR, XNOR), Truth Tables, and Logic Combinations',
    title: 'Logic Gates and Truth-Table Playground',
    icon: '⚡',
    shortDescription: 'Interactive digital circuit playground: toggle inputs, wire logic gates, observe live electric signal pulses, and generate complete truth tables.',
    learningObjectives: [
      'Master fundamental logic gates: AND, OR, NOT, NAND, NOR, XOR, and XNOR',
      'Construct composite combinational logic circuits and verify their Boolean algebra expressions',
      'Demonstrate functional completeness of universal gates (NAND and NOR)',
    ],
    prerequisites: ['Binary digits 0 and 1'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'Y_{\\text{AND}} = A \\cdot B, \\quad Y_{\\text{OR}} = A + B, \\quad Y_{\\text{XOR}} = A \\oplus B = \\bar{A}B + A\\bar{B}, \\quad Y_{\\text{NAND}} = \\overline{A \\cdot B}',
    modelAssumptions: [
      'Interactive wire propagation models high (1, glowing green) and low (0, dark) logic voltage levels',
      'Gates respond instantaneously to input switches',
      'Truth table dynamically tracks and validates user-tested combinations',
    ],
    engineeringContext: {
      what: 'Fundamental building blocks of all digital processors, arithmetic units, and control logic.',
      where: 'CPUs, microcontrollers, FPGAs, ASICs, memory decoders, and digital sensors.',
      when: 'During digital design, computer architecture, and hardware synthesis.',
    },
    guidedSteps: [
      { title: 'Step 1: Test Basic AND and OR Gates', description: 'Select the AND gate. Toggle inputs A and B. Notice the output lights up ONLY when both inputs are 1. Switch to OR and see it light up if either input is 1.' },
      { title: 'Step 2: Understand the Inverter (NOT)', description: 'Select the NOT gate. When input is 0, output is 1; when input is 1, output is 0.' },
      { title: 'Step 3: Explore Exclusive OR (XOR)', description: 'Test the XOR gate. Notice output is 1 when inputs are DIFFERENT (0,1 or 1,0), and 0 when they are identical.' },
      { title: 'Step 4: Construct a Half Adder Circuit', description: 'Combine an XOR gate (for Sum) and an AND gate (for Carry) to build a fundamental 1-bit binary adder!' },
    ],
    challenges: [
      { id: 'ch1', title: 'Build NAND Universal Inverter', goal: 'Connect both inputs of a NAND gate to a single input line and verify it behaves identically to a NOT gate.', hint: 'NAND(A, A) = ~(A · A) = ~A.', successCondition: 'Inverter truth table verified' },
      { id: 'ch2', title: 'Complete XOR Truth Table', goal: 'Toggle through all four combinations of inputs A and B to verify the complete XOR truth table.', hint: '0-0 -> 0, 0-1 -> 1, 1-0 -> 1, 1-1 -> 0.', successCondition: 'All 4 rows completed correctly' },
      { id: 'ch3', title: 'Construct 2-to-1 Multiplexer', goal: 'Build a circuit using AND, OR, and NOT gates that selects between input D0 and D1 based on select line S.', hint: 'Y = (~S · D0) + (S · D1).', successCondition: 'Multiplexer logic verified' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'Which logic gate outputs a 1 if and only if both inputs are 1?', options: ['OR gate', 'AND gate', 'XOR gate', 'NOR gate'], correctIndex: 1, explanation: 'The AND gate performs logical multiplication; its output is 1 only when all inputs are 1.' },
      { id: 'q2', type: 'concept', question: 'What is the output of an XOR gate when both inputs are 1?', options: ['0', '1', 'High Impedance', 'Undefined'], correctIndex: 0, explanation: 'Exclusive OR (XOR) outputs 1 only when inputs differ. When both inputs are 1 (identical), the output is 0.' },
      { id: 'q3', type: 'concept', question: 'Why are NAND and NOR gates referred to as "universal gates"?', options: ['They use less electrical power than other gates', 'Any Boolean logic circuit can be implemented entirely using only NAND gates or only NOR gates', 'They operate on both analog and digital signals', 'They can store data permanently without power'], correctIndex: 1, explanation: 'NAND and NOR are functionally complete; any arbitrary logic function (AND, OR, NOT, etc.) can be constructed from them alone.' },
      { id: 'q4', type: 'prediction', question: 'If A = 1 and B = 0, what is the output of a NOR gate?', options: ['0', '1', 'Depends on temperature', 'Floating'], correctIndex: 0, explanation: 'OR(1, 0) = 1. NOR inverts the result: NOT(1) = 0.' },
      { id: 'q5', type: 'interpretation', question: 'Which two logic gates are combined to form a fundamental 1-bit Half Adder circuit?', options: ['AND gate for Sum, OR gate for Carry', 'XOR gate for Sum, AND gate for Carry', 'NOT gate for Sum, NAND gate for Carry', 'OR gate for Sum, XOR gate for Carry'], correctIndex: 1, explanation: 'In a half adder: Sum = A ⊕ B (XOR gate) and Carry = A · B (AND gate).' },
    ],
    defaultParams: { activeGate: 'and', inputA: false, inputB: false },
    is3DPreferred: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — COMPUTATIONAL THINKING, FLOWCHARTS AND ALGORITHMS (Simulations 13–16)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'u25cs102-algorithm-builder',
    unit: 4,
    unitTitle: 'Computational Thinking, Flowcharts and Algorithms',
    topic: 'Problem Formulation, Flowcharts (Start/End, Process, Decision, Input/Output), and Pseudocode',
    title: 'From Problem Statement to Algorithm Builder',
    icon: '📐',
    shortDescription: 'Visual flowchart construction studio: snap Start/End, Process, Decision, and I/O symbols into place, step through execution tokens, and track variables.',
    learningObjectives: [
      'Apply standard flowchart symbols: Oval (Terminal), Parallelogram (I/O), Rectangle (Process), and Diamond (Decision)',
      'Design structured algorithmic workflows with proper sequential flow, branching conditions, and loop convergence',
      'Trace variable state evolution step-by-step through flowchart execution paths',
    ],
    prerequisites: ['Basic logical reasoning', 'Problem decomposition'],
    estimatedTimeMinutes: 20,
    formulaOverview: '\\text{Flowchart Syntax}: \\text{Oval (Start/Stop)}, \\; \\text{Rectangle (Process: } x \\leftarrow a + b), \\; \\text{Diamond (Condition: } x > 0?), \\; \\text{Parallelogram (I/O)}',
    modelAssumptions: [
      'Interactive canvas enforces structured flowchart connectivity',
      'Execution token animates step-by-step along connecting arrow paths',
      'Live watch table displays variable states after each executed block',
    ],
    engineeringContext: {
      what: 'Visual design and specification language for software requirements and system workflows.',
      where: 'Software architecture design, business process modeling, automated factory control, and algorithm teaching.',
      when: 'During the system analysis and design phase before any program code is written.',
    },
    guidedSteps: [
      { title: 'Step 1: Explore Flowchart Symbols', description: 'Review the symbols palette: Terminal (Start/End), Input/Output (Read/Print), Process (Calculation), Decision (If-Else branch).' },
      { title: 'Step 2: Load "Largest of Two Numbers" Algorithm', description: 'Load the sample algorithm: Start → Read A, B → Decision (A > B?) → If True print A, If False print B → End.' },
      { title: 'Step 3: Step Through Execution', description: 'Enter A=12, B=25. Click "Step Forward" to watch the golden execution token move through the flowchart and take the False branch.' },
      { title: 'Step 4: Build a Counting Loop', description: 'Construct a loop that increments counter `i` until `i > 5`, observing the loop condition branch returning upward.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Even or Odd Number Algorithm', goal: 'Build a flowchart that takes integer N, checks if N % 2 == 0, and outputs "Even" or "Odd".', hint: 'Use a decision diamond checking remainder condition.', successCondition: 'Algorithm correctly classifies test numbers' },
      { id: 'ch2', title: 'Sum of First N Natural Numbers', goal: 'Assemble a loop calculating Sum = 1 + 2 + ... + N for input N=5 (expected Sum=15).', hint: 'Initialize Sum=0, i=1; loop while i <= N: Sum = Sum + i, i = i + 1.', successCondition: 'Calculates Sum=15 for N=5' },
      { id: 'ch3', title: 'Detect Infinite Loop Bug', goal: 'Inspect an incorrect flowchart where loop variable increment is missing and explain why execution never terminates.', hint: 'A loop without an increment never reaches its exit condition.', successCondition: 'Infinite loop identified' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'Which geometric shape is standardized in flowcharts to represent a decision or conditional branch?', options: ['Rectangle', 'Diamond (Rhombus)', 'Parallelogram', 'Oval'], correctIndex: 1, explanation: 'A diamond shape represents a decision point having two or more alternative exit paths (e.g., True/False, Yes/No).' },
      { id: 'q2', type: 'concept', question: 'In standard flowcharting conventions, what does a parallelogram symbol represent?', options: ['Arithmetic process or variable assignment', 'Start or End of the program', 'Input or Output operation (e.g., Read, Print)', 'Subroutine call'], correctIndex: 2, explanation: 'A parallelogram represents an Input/Output operation (e.g., Read user input or Print output to screen).' },
      { id: 'q3', type: 'prediction', question: 'In an algorithm with variables `a = 5` and `b = 8`, if the process block `a = a + b` is executed, what is the value of `a` immediately afterward?', options: ['5', '8', '13', '0'], correctIndex: 2, explanation: 'The process evaluates 5 + 8 = 13 and assigns the result back into variable `a`.' },
      { id: 'q4', type: 'interpretation', question: 'What is the primary danger of a loop where the loop counter is never updated inside the loop body?', options: ['The computer runs out of disk storage', 'An infinite loop occurs, causing the program to hang and never terminate', 'The compiler deletes the flowchart', 'Variable values become negative'], correctIndex: 1, explanation: 'If the condition variable never changes inside the loop, the loop exit condition can never become true, trapping execution in an infinite loop.' },
      { id: 'q5', type: 'concept', question: 'What is the difference between an algorithm and a flowchart?', options: ['An algorithm is written in binary; a flowchart is in English', 'An algorithm is a step-by-step problem-solving procedure; a flowchart is its diagrammatic graphical representation', 'They are unrelated concepts', 'A flowchart can only represent math problems'], correctIndex: 1, explanation: 'An algorithm is the abstract step-by-step logic, while a flowchart is its visual, graphical diagram.' },
    ],
    defaultParams: { activeTemplate: 'largest_of_two', inputA: 12, inputB: 25, isRunning: false },
    is3DPreferred: false,
  },

  {
    id: 'u25cs102-scratch-blocks-world',
    unit: 4,
    unitTitle: 'Computational Thinking, Flowcharts and Algorithms',
    topic: 'Visual Block-Based Programming: Sequences, Loops, Conditions, Variables, and Robot Navigation',
    title: 'Scratch-Style Drag-and-Drop Programming World',
    icon: '🧩',
    shortDescription: 'Interactive visual block coding environment: snap Motion, Control (repeat, if-else), and Sensing blocks to program an animated 3D robot navigating grid mazes.',
    learningObjectives: [
      'Construct programs using visual block snapping without text syntax errors',
      'Apply computational control structures: sequential execution, counted repeat loops, and conditional branching',
      'Use sensor feedback (e.g., "if wall ahead") to navigate dynamic maze environments',
    ],
    prerequisites: ['Basic problem-solving mindset'],
    estimatedTimeMinutes: 20,
    formulaOverview: '\\text{Block Grammar}: \\text{repeat}(N) \\{ \\dots \\}, \\quad \\text{if}(\\text{sensor}) \\{ \\dots \\} \\text{ else } \\{ \\dots \\}',
    modelAssumptions: [
      'Robot executes in a grid maze environment with walls, coins, and exit goals',
      'Blocks snap together with immediate visual feedback',
      'Program runs in a sandboxed client-side educational interpreter with step-by-step visual highlighting',
    ],
    engineeringContext: {
      what: 'Introductory visual programming paradigm designed by MIT to teach computer science thinking.',
      where: 'MIT Scratch, Google Blockly, Microsoft MakeCode, and industrial robot teach-pendant interfaces.',
      when: 'In foundational CS education and visual low-code automation workflows.',
    },
    guidedSteps: [
      { title: 'Step 1: Build a Sequence of Motion Blocks', description: 'Drag "Move Forward" and "Turn Right" blocks onto the workspace to move the robot toward the first coin.' },
      { title: 'Step 2: Replace Repetitive Blocks with a Loop', description: 'Instead of four consecutive "Move Forward" blocks, snap a "Repeat 4 times" block around one move block.' },
      { title: 'Step 3: Add an "If Wall Ahead" Condition', description: 'Add a sensing condition: "If path ahead, move forward; else turn left". Watch the robot navigate a corner.' },
      { title: 'Step 4: Reach the Goal Flag', description: 'Run your complete program. Watch the robot collect all coins and reach the target flag successfully.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Collect 3 Coins in a Line', goal: 'Use a single "Repeat 3 times" loop containing Move and Collect blocks to gather all coins.', hint: 'Loop reduces block count from 6 to 3.', successCondition: '3 coins collected with loop block' },
      { id: 'ch2', title: 'Navigate Zig-Zag Path', goal: 'Program the robot to follow an S-curve path using alternating left and right turns.', hint: 'Decompose the path into identical repeating sub-paths.', successCondition: 'Zig-zag path completed' },
      { id: 'ch3', title: 'Obstacle Avoidance Robot', goal: 'Write an autonomous loop that moves the robot forward until it detects a wall, turns right, and continues to the exit.', hint: 'Use "Repeat until at Goal" with an embedded "If-Else" block.', successCondition: 'Goal reached autonomously' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the main pedagogical advantage of visual block-based programming environments like Scratch or Blockly?', options: ['They run faster than machine code', 'They eliminate syntax errors (like missing semicolons), allowing learners to focus on computational logic and control structures', 'They only work on supercomputers', 'They cannot create loops'], correctIndex: 1, explanation: 'Block-based programming prevents syntax errors through puzzle-like snapping, letting students focus on algorithmic reasoning.' },
      { id: 'q2', type: 'concept', question: 'If a robot moves forward 1 step inside a "Repeat 4 times" block, how many total steps will it move?', options: ['1 step', '3 steps', '4 steps', '16 steps'], correctIndex: 2, explanation: 'The repeat loop executes its interior body 4 times, moving 1 step each time for a total of 4 steps.' },
      { id: 'q3', type: 'prediction', question: 'What happens if the condition in an "If-Else" block evaluates to FALSE?', options: ['The program terminates with an error', 'The code inside the "Else" branch is executed', 'The code inside the "If" branch is executed twice', 'The robot turns 360 degrees'], correctIndex: 1, explanation: 'When the condition is false, execution skips the "If" block and executes the alternate "Else" branch.' },
      { id: 'q4', type: 'interpretation', question: 'Why is using a loop better than copying and pasting 50 identical movement blocks?', options: ['Loops make the code shorter, easier to read, less prone to errors, and simpler to modify', 'Loops use more electricity', 'Computers cannot execute more than 10 blocks in sequence', 'Loops prevent robot battery drain'], correctIndex: 0, explanation: 'Loops encapsulate repetition, dramatically improving code conciseness, readability, and maintainability.' },
      { id: 'q5', type: 'concept', question: 'In computational thinking, what is the concept of bundling repeated actions into a reusable named block called?', options: ['Decomposition / Function Abstraction', 'Compilation error', 'Binary overflow', 'Syntax failure'], correctIndex: 0, explanation: 'Defining custom blocks or functions abstracts repeated sub-actions into reusable, modular procedures.' },
    ],
    defaultParams: { level: 1, robotX: 0, robotY: 0, robotDir: 'east', isRunning: false },
    is3DPreferred: true,
  },

  {
    id: 'u25cs102-trace-table-simulator',
    unit: 4,
    unitTitle: 'Computational Thinking, Flowcharts and Algorithms',
    topic: 'Algorithm Execution Tracing, Variable State Tables, Loop Invariants, and Off-by-One Debugging',
    title: 'Algorithm Flow and Trace-Table Simulator',
    icon: '📊',
    shortDescription: 'Interactive algorithm execution trace table: step through code line-by-line, observe line highlights, track variable watches in real time, and detect off-by-one errors.',
    learningObjectives: [
      'Construct rigorous trace tables documenting variable states on every iteration',
      'Track loop counters, accumulators, and boolean guard conditions line-by-line',
      'Identify classic off-by-one errors (e.g., `<` vs `<=`) by analyzing boundary conditions',
    ],
    prerequisites: ['Basic variables and loops'],
    estimatedTimeMinutes: 15,
    formulaOverview: '\\text{Trace Row}: [\\text{Step}, \\; \\text{Line No.}, \\; i, \\; \\text{sum}, \\; \\text{Condition } (i \\le N), \\; \\text{Output}]',
    modelAssumptions: [
      'Simulates structured educational pseudocode with deterministic line-by-line execution',
      'Trace table dynamically appends a new state row for each executed statement',
      'Supports stepping backward and forward through time',
    ],
    engineeringContext: {
      what: 'Manual and automated tracing technique used by engineers to dry-run and verify code correctness.',
      where: 'Code review, formal software verification, debugger watch windows, and technical interviews.',
      when: 'During algorithm verification, unit testing, and resolving complex edge-case bugs.',
    },
    guidedSteps: [
      { title: 'Step 1: Load a Loop Summation Algorithm', description: 'Load the algorithm: Sum = 0; For i = 1 to 4: Sum = Sum + i; Output Sum.' },
      { title: 'Step 2: Step Line-by-Line', description: 'Click "Step". Watch the trace table record Step 1: Line 1, Sum=0. Line 2 starts the loop with i=1.' },
      { title: 'Step 3: Track Variables Across Iterations', description: 'Continue stepping: observe (i=1, Sum=1), (i=2, Sum=3), (i=3, Sum=6), (i=4, Sum=10).' },
      { title: 'Step 4: Observe Loop Exit Condition', description: 'Step to i=5: the condition (i <= 4) evaluates to FALSE. Execution exits the loop and prints final Sum=10.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Predict Trace Table Values', goal: 'Predict the value of `sum` at the end of iteration 3 before clicking step.', hint: 'Sum after i=1 is 1; after i=2 is 3; after i=3 is 6.', successCondition: 'Prediction matches 6' },
      { id: 'ch2', title: 'Find Off-By-One Bug', goal: 'Identify why a program intended to sum 1 to 5 only sums up to 4 when written with `while (i < 5)`.', hint: 'The strict inequality `<` exits when i reaches 5 without adding 5.', successCondition: 'Off-by-one error located and fixed' },
      { id: 'ch3', title: 'Trace Factorial Algorithm', goal: 'Trace factorial calculation Fact = 1; for i = 1 to 4: Fact = Fact * i, verifying final Fact = 24.', hint: '1 × 2 × 3 × 4 = 24.', successCondition: 'Factorial trace completed' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the primary purpose of an algorithm trace table (dry run table)?', options: ['To measure execution time in nanoseconds', 'To manually record the values of variables at each step of an algorithm to verify logic and locate bugs', 'To convert source code into assembly language', 'To design user interface buttons'], correctIndex: 1, explanation: 'A trace table tracks the changing values of variables step-by-step to understand, verify, or debug an algorithm without a computer.' },
      { id: 'q2', type: 'prediction', question: 'Consider the pseudocode:\n`count = 0`\n`for i = 1 to 3:`\n`  count = count + 2`\nWhat is the value of `count` after the loop finishes?', options: ['2', '4', '6', '8'], correctIndex: 2, explanation: 'Iteration 1: count = 0 + 2 = 2; Iteration 2: count = 2 + 2 = 4; Iteration 3: count = 4 + 2 = 6.' },
      { id: 'q3', type: 'interpretation', question: 'What is an "off-by-one" error in programming?', options: ['A number that is off by a factor of 10', 'A boundary logic bug where an iterative loop runs one time too many or one time too few (e.g., `<` instead of `<=`)', 'A syntax error from a missing letter', 'A hardware clock glitch'], correctIndex: 1, explanation: 'An off-by-one error occurs when a loop iterates N-1 or N+1 times instead of the desired N times due to an incorrect boundary condition.' },
      { id: 'q4', type: 'concept', question: 'In a trace table for a while loop, what should be recorded in the condition column?', options: ['The memory address of the loop', 'The boolean evaluation (True or False) of the loop condition at that step', 'The programmer\'s name', 'The variable data type'], correctIndex: 1, explanation: 'Recording the True/False outcome of the condition clarifies exactly when and why the loop continues or terminates.' },
      { id: 'q5', type: 'prediction', question: 'Given code:\n`x = 10`\n`while x > 4:`\n`  x = x - 3`\nHow many times does the while loop body execute?', options: ['1 time', '2 times', '3 times', '4 times'], correctIndex: 1, explanation: 'Initial: x=10 (>4: True) -> x=7. Next: x=7 (>4: True) -> x=4. Next: x=4 (>4: False, exit). The body executes exactly 2 times.' },
    ],
    defaultParams: { activeProgram: 'sum_loop', stepIndex: 0, isComplete: false },
    is3DPreferred: false,
  },

  {
    id: 'u25cs102-search-race',
    unit: 4,
    unitTitle: 'Computational Thinking, Flowcharts and Algorithms',
    topic: 'Linear Search vs Binary Search, Sorted Data Requirement, and Comparison Complexity O(N) vs O(log N)',
    title: 'Searching Algorithm Race',
    icon: '🔍',
    shortDescription: 'Interactive head-to-head search competition: pit Linear Search O(N) against Binary Search O(log N) on sorted and unsorted lists, visualizing comparison counts.',
    learningObjectives: [
      'Compare sequential Linear Search O(N) with divide-and-conquer Binary Search O(log N)',
      'Explain why Binary Search strictly requires pre-sorted data',
      'Demonstrate how Binary Search halves the remaining search interval on every comparison: L_new = L / 2',
    ],
    prerequisites: ['Arrays and lists', 'Basic comparisons'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'T_{\\text{Linear}}(N) = \\mathcal{O}(N) \\text{ comparisons}, \\quad T_{\\text{Binary}}(N) = \\mathcal{O}(\\log_2 N) \\text{ comparisons}',
    modelAssumptions: [
      'Array sizes configurable from 8 to 128 elements',
      'Visualizes low, high, and mid pointers in real time during binary search',
      'Comparison counter increments on every element probe',
    ],
    engineeringContext: {
      what: 'Core algorithmic retrieval mechanism powering database queries, lookup tables, and index trees.',
      where: 'B-tree database indexes, dictionary lookups, Git commit bisect debugging, and compiler symbol tables.',
      when: 'Every time software retrieves an item by key or searches a record in a collection.',
    },
    guidedSteps: [
      { title: 'Step 1: Run Linear Search', description: 'Search for target 87 in an array of 32 items using Linear Search. Watch it check elements one-by-one from index 0, requiring 28 comparisons.' },
      { title: 'Step 2: Run Binary Search on Sorted Array', description: 'Search for the same target 87 using Binary Search. Observe mid-point evaluation discarding half the array each step, finding it in only 5 comparisons!' },
      { title: 'Step 3: Try Searching on an Unsorted Array', description: 'Attempt Binary Search on unsorted data. Notice it fails because dividing an unsorted list cannot eliminate the target!' },
      { title: 'Step 4: Scale to 1,000,000 Items (Thought Experiment)', description: 'Notice that while Linear Search requires up to 1,000,000 checks, Binary Search needs at most 20 comparisons (log₂(1,000,000) ≈ 20)!' },
    ],
    challenges: [
      { id: 'ch1', title: 'Search Worst-Case Comparison', goal: 'Search for an element located at the very end of a 32-element array and compare steps.', hint: 'Linear search takes 32 checks; Binary search takes at most 5 (ceil(log₂ 32) = 5).', successCondition: 'Linear=32 vs Binary=5 verified' },
      { id: 'ch2', title: 'Target Not Present', goal: 'Search for a number that does not exist in the array and observe when each algorithm declares "Not Found".', hint: 'Binary search stops when low pointer exceeds high pointer.', successCondition: 'Not found condition verified' },
      { id: 'ch3', title: 'Find Single-Comparison Hit', goal: 'Select a target that Binary Search discovers in exactly 1 single comparison.', hint: 'The element located at the exact initial midpoint index.', successCondition: 'Found in 1 comparison' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What prerequisite must be satisfied before Binary Search can be applied to an array?', options: ['The array must contain only positive integers', 'The elements in the array must be sorted in ascending or descending order', 'The array size must be a power of two', 'The array must be stored on an SSD'], correctIndex: 1, explanation: 'Binary search relies on ordering to discard half the search space; if data is unsorted, the target could lie in either half.' },
      { id: 'q2', type: 'prediction', question: 'What is the maximum number of comparisons needed to find an item in a sorted array of 1,024 elements using Binary Search?', options: ['1,024 comparisons', '512 comparisons', '10 comparisons', '1 comparison'], correctIndex: 2, explanation: 'log₂(1024) = 10. Binary search requires at most 10 (or 11) comparisons to find any element or prove it absent.' },
      { id: 'q3', type: 'interpretation', question: 'If you have an unsorted list of 50 items and need to perform only ONE single search, is it faster to sort the list first then do binary search, or just do linear search?', options: ['Sort first then binary search', 'Just perform linear search directly', 'Both take the exact same time', 'Binary search without sorting'], correctIndex: 1, explanation: 'Sorting takes O(N log N) time (~50 × 6 ≈ 300 ops). Linear search takes at most 50 comparisons. For a single one-off search, linear search is faster.' },
      { id: 'q4', type: 'concept', question: 'What is the worst-case time complexity of Linear Search on a list of N elements?', options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'], correctIndex: 2, explanation: 'In the worst case (item at the very end or absent), Linear Search must inspect every single element, giving O(N) linear time.' },
      { id: 'q5', type: 'concept', question: 'In binary search with pointers `low = 0` and `high = 14`, what is the initial midpoint index `mid`?', options: ['0', '7', '14', '15'], correctIndex: 1, explanation: 'mid = floor((0 + 14) / 2) = 7.' },
    ],
    defaultParams: { arraySize: 32, targetValue: 47, isSorted: true, isRunning: false },
    is3DPreferred: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — ALGORITHM COMPLEXITY, OS SCHEDULING AND SOFTWARE DEBUGGING (Simulations 17–20)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'u25cs102-sorting-visualizer',
    unit: 5,
    unitTitle: 'Algorithm Complexity, OS Scheduling and Software Debugging',
    topic: 'Elementary Sorting Algorithms: Bubble Sort, Insertion Sort, Comparisons, Swaps, and Invariants',
    title: 'Sorting Algorithm Visualizer',
    icon: '📶',
    shortDescription: 'Comparative sorting lab: animate bar swaps, track comparisons vs swaps, inspect sorted boundaries, and compare Bubble Sort and Insertion Sort on varied inputs.',
    learningObjectives: [
      'Trace Bubble Sort: compare adjacent pairs and bubble the largest unsorted element to the end',
      'Trace Insertion Sort: build a sorted prefix by shifting larger elements to insert each item in place',
      'Analyze algorithmic efficiency: best-case vs worst-case comparisons and swaps on sorted, reversed, and random arrays',
    ],
    prerequisites: ['Arrays and index access', 'Basic comparisons'],
    estimatedTimeMinutes: 20,
    formulaOverview: 'T_{\\text{Bubble/Insert, Worst}}(N) = \\frac{N(N-1)}{2} \\approx \\mathcal{O}(N^2), \\quad T_{\\text{Insert, Best}}(N) = \\mathcal{O}(N) \\text{ (pre-sorted)}',
    modelAssumptions: [
      'Visualizes vertical bars with height proportional to value',
      'Color coding: Yellow = comparing, Red = swapping, Green = settled sorted region',
      'Live operation metrics log total comparisons and total swaps',
    ],
    engineeringContext: {
      what: 'Canonical introductory algorithms demonstrating algorithmic complexity and space/time trade-offs.',
      where: 'Embedded firmware, hybrid sort implementations (Insertion sort inside Timsort/Introsort for small arrays < 32 items).',
      when: 'Whenever collections are ordered by timestamp, priority, score, or alphabetical name.',
    },
    guidedSteps: [
      { title: 'Step 1: Run Bubble Sort on a Small Array', description: 'Watch Bubble Sort compare adjacent bars [i] and [i+1]. If out of order, they swap. After pass 1, the largest item settles at the far right.' },
      { title: 'Step 2: Inspect Settled Green Boundary', description: 'Notice that with each pass, the unsorted region shrinks by 1 as the next largest value bubbles to its final position.' },
      { title: 'Step 3: Run Insertion Sort on Same Array', description: 'Select Insertion Sort. Observe it take each element and shift larger elements rightward to insert it into the already-sorted left sub-array.' },
      { title: 'Step 4: Test Pre-Sorted Input', description: 'Load an already-sorted array. Notice Insertion Sort completes in O(N) time with only N-1 comparisons and 0 swaps!' },
    ],
    challenges: [
      { id: 'ch1', title: 'Compare Swaps on Reversed List', goal: 'Sort a reverse-sorted array of 10 items and observe the maximum swap count.', hint: 'For 10 items, worst-case swaps = 10 × 9 / 2 = 45 swaps.', successCondition: '45 swaps verified on reversed array' },
      { id: 'ch2', title: 'Predict Best Algorithm for Nearly-Sorted', goal: 'Run both algorithms on a nearly-sorted list with only 1 element out of place and observe Insertion Sort\'s huge advantage.', hint: 'Insertion sort only shifts the single out-of-order element.', successCondition: 'Insertion sort finishes in far fewer operations' },
      { id: 'ch3', title: 'Bubble Sort Early Exit Optimization', goal: 'Verify that an optimized Bubble Sort stops early if a pass makes zero swaps.', hint: 'Zero swaps in a pass guarantees the array is already sorted.', successCondition: 'Early exit triggered' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the worst-case time complexity of Bubble Sort on an array of N elements?', options: ['O(log N)', 'O(N)', 'O(N²)', 'O(2^N)'], correctIndex: 2, explanation: 'In the worst case (reverse sorted array), Bubble Sort performs N(N-1)/2 comparisons and swaps, which is O(N²) quadratic time.' },
      { id: 'q2', type: 'concept', question: 'How does Insertion Sort behave when given an array that is already completely sorted in ascending order?', options: ['It takes O(N²) time', 'It takes O(N) linear time, performing only N-1 comparisons and zero swaps', 'It produces an infinite loop', 'It crashes the program'], correctIndex: 1, explanation: 'On an already sorted array, each element is immediately greater than its left neighbor, so Insertion Sort stops after 1 comparison per item, achieving optimal O(N) linear time.' },
      { id: 'q3', type: 'prediction', question: 'After 1 complete pass of Bubble Sort on array `[5, 1, 4, 2, 8]`, which element is guaranteed to be in its correct final sorted position?', options: ['1 at index 0', '8 at index 4', '4 at index 2', 'None of them'], correctIndex: 1, explanation: 'Pass 1 bubbles the maximum value of the entire array (8) all the way to the final rightmost position.' },
      { id: 'q4', type: 'interpretation', question: 'Why do production hybrid sorting libraries (such as Python\'s Timsort and Java\'s Dual-Pivot Quicksort) switch to Insertion Sort for small sub-arrays (e.g., N < 32)?', options: ['Insertion sort uses 3D graphics', 'For small N, Insertion Sort\'s simple loop has minimal overhead, excellent cache locality, and runs faster than complex recursive algorithms', 'Insertion sort requires no memory at all', 'Because Quicksort cannot sort small numbers'], correctIndex: 1, explanation: 'For small arrays, the lower constant factors and cache locality of Insertion Sort beat the recursive overhead of Quicksort/Mergesort.' },
      { id: 'q5', type: 'concept', question: 'What is an "in-place" sorting algorithm?', options: ['An algorithm that sorts data in place without requiring additional memory proportional to the input size (O(1) auxiliary space)', 'An algorithm that only runs on cloud servers', 'An algorithm that sorts files without opening them', 'An algorithm that never swaps numbers'], correctIndex: 0, explanation: 'An in-place algorithm sorts the data within the original array using only a constant O(1) amount of extra working memory.' },
    ],
    defaultParams: { algorithm: 'bubble', arraySize: 10, inputType: 'random', isRunning: false },
    is3DPreferred: false,
  },

  {
    id: 'u25cs102-computational-decomposition',
    unit: 5,
    unitTitle: 'Algorithm Complexity, OS Scheduling and Software Debugging',
    topic: 'Four Pillars of Computational Thinking: Decomposition, Pattern Recognition, Abstraction, and Algorithm Design',
    title: 'Decomposition, Pattern Recognition and Abstraction Puzzle',
    icon: '🧩',
    shortDescription: 'Real-world problem solving workshop: decompose complex scenarios (Smart College Attendance, Vending Machine, Delivery Route) into subproblems, find patterns, and abstract models.',
    learningObjectives: [
      'Apply Decomposition: break complex multi-step systems into manageable, independent subproblems',
      'Apply Pattern Recognition: detect repeating behaviors across problems to build reusable sub-routines',
      'Apply Abstraction: filter out irrelevant real-world details to focus strictly on essential data models',
    ],
    prerequisites: ['Basic logical thinking'],
    estimatedTimeMinutes: 15,
    formulaOverview: '\\text{Computational Thinking} = \\text{Decomposition} + \\text{Pattern Recognition} + \\text{Abstraction} + \\text{Algorithm Design}',
    modelAssumptions: [
      'Interactive modular puzzle canvas with real-world scenarios: Smart Attendance, Vending Machine, and Route Optimization',
      'Learners drag subtasks into logical dependency hierarchies',
      'Evaluation accepts multiple valid decompositions that fulfill core dependencies',
    ],
    engineeringContext: {
      what: 'Foundational mental toolkit enabling software engineers to formulate problems that computers can solve.',
      where: 'System architecture, API design, microservice decomposition, and enterprise workflow automation.',
      when: 'During initial software requirements gathering, domain-driven design, and system design reviews.',
    },
    guidedSteps: [
      { title: 'Step 1: Choose Scenario: Smart College Attendance', description: 'Examine the problem: automate classroom attendance tracking using RFID/biometrics, update databases, and notify parents of absentees.' },
      { title: 'Step 2: Decompose into 3 Sub-Systems', description: 'Decompose: 1. Input Sensing (scan card/fingerprint); 2. Data Validation & Database Update; 3. Notification Service.' },
      { title: 'Step 3: Recognize Repeating Patterns', description: 'Notice pattern: "Verifying a student ID" uses the exact same search-and-validate pattern whether for morning entry or library borrowing.' },
      { title: 'Step 4: Abstract Away Irrelevant Details', description: 'Abstract: student name, photo, and roll number are essential; student shoe size, shirt color, and seat position are irrelevant noise.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Decompose Vending Machine Logic', goal: 'Break vending machine operation into 4 chronological stages: Coin Acceptance, Product Selection, Dispense, and Change Return.', hint: 'Order sub-tasks so balance verification occurs before dispensing.', successCondition: 'Valid 4-stage pipeline constructed' },
      { id: 'ch2', title: 'Abstraction Filter Challenge', goal: 'Given a student database specification, drag 5 relevant attributes into the schema and discard 4 irrelevant attributes.', hint: 'Keep StudentID, Name, CGPA, Attendance; discard EyeColor, FavoriteFood.', successCondition: 'All relevant attributes correctly selected' },
      { id: 'ch3', title: 'Pattern Reuse in Routing', goal: 'Identify which algorithm pattern (Shortest Path Graph Traversal) solves both road delivery routing and network packet routing.', hint: 'Both represent nodes connected by weighted edges.', successCondition: 'Pattern reuse mapped successfully' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'Which pillar of computational thinking involves breaking a complex problem down into smaller, more manageable subproblems?', options: ['Decomposition', 'Abstraction', 'Pattern Recognition', 'Compilation'], correctIndex: 0, explanation: 'Decomposition is the process of breaking a complex problem down into smaller, simpler, and more manageable parts.' },
      { id: 'q2', type: 'concept', question: 'In computational thinking, what is "abstraction"?', options: ['Adding more details until the problem is huge', 'Focusing only on essential information while filtering out irrelevant real-world details', 'Converting numbers from decimal to binary', 'Writing code without testing'], correctIndex: 1, explanation: 'Abstraction involves identifying what is important and ignoring irrelevant details to create a simplified general model.' },
      { id: 'q3', type: 'interpretation', question: 'When designing a GPS navigation map application, why is showing the exact location of every tree on the side of the road considered poor abstraction?', options: ['Computers cannot draw trees', 'Tree positions are irrelevant details for route navigation that clutter the interface and waste processing power', 'Trees change color in autumn', 'GPS satellites cannot detect green colors'], correctIndex: 1, explanation: 'Good abstraction retains road networks and traffic signals while eliminating irrelevant details like trees and building paint colors.' },
      { id: 'q4', type: 'concept', question: 'What is "pattern recognition" in computational thinking?', options: ['Scanning barcodes at supermarket checkouts', 'Observing similarities, regularities, and trends across problems to apply shared solutions', 'Designing computer cases', 'Creating passwords with uppercase letters'], correctIndex: 1, explanation: 'Pattern recognition identifies similarities across problems or data, allowing engineers to reuse proven solutions and algorithms.' },
      { id: 'q5', type: 'prediction', question: 'What is the final fourth pillar of computational thinking that follows decomposition, pattern recognition, and abstraction?', options: ['Hardware Assembly', 'Algorithm Design (step-by-step instructions to solve the problem)', 'Buying a faster computer', 'Deleting old files'], correctIndex: 1, explanation: 'The four recognized pillars are Decomposition, Pattern Recognition, Abstraction, and Algorithm Design.' },
    ],
    defaultParams: { scenario: 'attendance', step: 1, isResolved: false },
    is3DPreferred: false,
  },

  {
    id: 'u25cs102-os-scheduler',
    unit: 5,
    unitTitle: 'Algorithm Complexity, OS Scheduling and Software Debugging',
    topic: 'Operating System Multitasking, Process States, Ready Queue, FCFS vs Round Robin CPU Scheduling',
    title: 'Operating System and Process Scheduler Playground',
    icon: '⏱️',
    shortDescription: 'CPU multitasking scheduler simulator: dispatch processes across Ready, Running, and Waiting states, comparing FCFS and Round Robin time slicing.',
    learningObjectives: [
      'Trace process lifecycle states: New, Ready, Running, Waiting (Blocked), and Terminated',
      'Compare First-Come First-Served (FCFS) scheduling with preemptive Round Robin (RR) time slicing',
      'Calculate turnaround time (T_completion - T_arrival) and average waiting time across processes',
    ],
    prerequisites: ['Basic queue data structure (FIFO)', 'Concept of CPU time sharing'],
    estimatedTimeMinutes: 20,
    formulaOverview: '\\text{Turnaround} = T_{\\text{finish}} - T_{\\text{arrival}}, \\quad \\text{Waiting Time} = \\text{Turnaround} - \\text{Burst Time}, \\quad \\text{Avg Wait} = \\frac{1}{N} \\sum W_i',
    modelAssumptions: [
      'Educational discrete-event simulation model tracking CPU cycles',
      'Processes have predefined burst times and arrival times',
      'Round Robin demonstrates quantum expiration triggering context switches to the tail of the Ready Queue',
    ],
    engineeringContext: {
      what: 'Core OS kernel subsystem enabling multiple applications to share a single CPU core smoothly.',
      where: 'Linux Completely Fair Scheduler (CFS), Windows thread scheduler, and real-time operating systems (RTOS).',
      when: 'Every millisecond as your computer runs background music, web browser tabs, and IDEs simultaneously.',
    },
    guidedSteps: [
      { title: 'Step 1: Load 3 Sample Processes', description: 'Inspect Process P1 (Burst=8), P2 (Burst=4), P3 (Burst=2) arriving in the Ready Queue at time 0.' },
      { title: 'Step 2: Run First-Come First-Served (FCFS)', description: 'Run FCFS. P1 runs to completion (8 ms), forcing P2 and P3 to wait. Notice the convoy effect inflating average waiting time.' },
      { title: 'Step 3: Switch to Round Robin (Time Quantum = 2)', description: 'Switch to Round Robin with Quantum = 2. Watch P1 run for 2 ms, get preempted to the back of the queue, allowing P2 and P3 quick turnaround!' },
      { title: 'Step 4: Compare Average Waiting Times', description: 'Review the Gantt chart metrics. Notice Round Robin dramatically reduces response time and gives interactive processes prompt attention.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Calculate FCFS Waiting Time', goal: 'Given P1=8, P2=4, P3=2 arriving at t=0, verify P1 wait = 0, P2 wait = 8, P3 wait = 12. Avg = 6.67 ms.', hint: 'Under FCFS, each process waits for all preceding processes to finish.', successCondition: 'FCFS Average Waiting Time = 6.67 ms verified' },
      { id: 'ch2', title: 'Optimize Quantum Value', goal: 'Experiment with time quantum (1 ms vs 4 ms vs 10 ms) and observe the trade-off between responsiveness and context switch overhead.', hint: 'A very large quantum degenerates into FCFS; a tiny quantum causes high context-switch overhead.', successCondition: 'Quantum trade-off observed' },
      { id: 'ch3', title: 'Trace I/O Blocked State', goal: 'Send a process into the I/O Waiting state and watch the CPU immediately schedule the next Ready process.', hint: 'Multiprogramming keeps the CPU busy while processes wait for slow disk or network I/O.', successCondition: 'I/O overlap verified' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the primary goal of CPU scheduling in a modern multitasking operating system?', options: ['To turn off unused CPU cores', 'To allocate CPU execution time among competing processes to maximize throughput and minimize waiting time', 'To defragment the hard disk', 'To format RAM chips'], correctIndex: 1, explanation: 'CPU scheduling decides which ready process receives CPU time, maximizing CPU utilization and providing fair, responsive interactive performance.' },
      { id: 'q2', type: 'concept', question: 'What is the "Convoy Effect" in First-Come First-Served (FCFS) scheduling?', options: ['Processes traveling over a network', 'Short processes getting stuck waiting behind a single very long CPU-intensive process, causing high average wait times', 'When all processes finish at the exact same time', 'When the CPU overheats'], correctIndex: 1, explanation: 'The convoy effect occurs in FCFS when small I/O-bound processes wait behind a massive CPU-bound process, dragging down system responsiveness.' },
      { id: 'q3', type: 'prediction', question: 'In Round Robin scheduling with time quantum Q = 3 ms, if a process has a burst time of 8 ms, how many separate time slices will it receive before finishing?', options: ['1 slice', '2 slices', '3 slices', '8 slices'], correctIndex: 2, explanation: 'Slice 1: runs 3 ms (5 ms left); Slice 2: runs 3 ms (2 ms left); Slice 3: runs 2 ms (0 ms left, finishes). Total = 3 time slices.' },
      { id: 'q4', type: 'interpretation', question: 'What happens in Round Robin scheduling if the time quantum is chosen to be extremely large (larger than any process burst time)?', options: ['It causes an operating system crash', 'It becomes identical in behavior to First-Come First-Served (FCFS)', 'Processes run twice as fast', 'The CPU executes instructions backward'], correctIndex: 1, explanation: 'If the time quantum exceeds the longest process burst time, no process is ever preempted before completion, making Round Robin behave exactly like FCFS.' },
      { id: 'q5', type: 'concept', question: 'Which process state describes a process that is currently waiting for an I/O operation (like disk read or keyboard keypress) to complete?', options: ['Running state', 'Ready state', 'Waiting (or Blocked) state', 'Terminated state'], correctIndex: 2, explanation: 'A process in the Waiting (or Blocked) state cannot execute on the CPU until an external I/O event or interrupt signals that its data is ready.' },
    ],
    defaultParams: { algorithm: 'rr', quantum: 2, isRunning: false, currentTime: 0 },
    is3DPreferred: false,
  },

  {
    id: 'u25cs102-software-debugging',
    unit: 5,
    unitTitle: 'Algorithm Complexity, OS Scheduling and Software Debugging',
    topic: 'Software Development Lifecycle (SDLC), Syntax vs Runtime vs Logical Errors, and Step-by-Step Debugging',
    title: 'Software Development and Debugging Mission',
    icon: '🐞',
    shortDescription: 'Interactive code diagnosis laboratory: inspect buggy code, differentiate syntax, runtime, and logical errors, set breakpoints, watch variables, and pass unit tests.',
    learningObjectives: [
      'Classify software defects: Syntax errors (compiler reject), Runtime errors (crash/zero-divide), and Logical errors (wrong output)',
      'Use professional debugging techniques: setting breakpoints, single-stepping, and variable inspect windows',
      'Verify bug fixes by executing comprehensive deterministic unit test cases',
    ],
    prerequisites: ['Basic programming logic and loops'],
    estimatedTimeMinutes: 20,
    formulaOverview: '\\text{Debugging}: \\text{Reproduce} \\to \\text{Isolate (Breakpoint)} \\to \\text{Inspect Variables} \\to \\text{Fix Root Cause} \\to \\text{Regression Test}',
    modelAssumptions: [
      'Sandboxed educational environment with curated bug missions (no arbitrary server execution)',
      'Visual code view with interactive breakpoints on line numbers',
      'Integrated test runner reports pass/fail across multiple boundary test vectors',
    ],
    engineeringContext: {
      what: 'Core problem-solving skill consuming over 50% of professional software engineering time.',
      where: 'Every software organization, CI/CD pipeline, and developer environment (VS Code, GDB, Chrome DevTools).',
      when: 'During feature development, code review, automated testing, and production incident triage.',
    },
    guidedSteps: [
      { title: 'Step 1: Inspect Mission 1 — The Average Calculation Bug', description: 'A function calculates average of two numbers: `return a + b / 2;`. Run the test case (a=4, b=6, expected 5). It outputs 7! Why?' },
      { title: 'Step 2: Identify Operator Precedence Bug', description: 'Division `/` has higher precedence than addition `+`. The expression computed `4 + (6/2) = 7`. The fix requires parentheses: `(a + b) / 2`.' },
      { title: 'Step 3: Fix the Bug and Run Tests', description: 'Apply the parenthesis correction. Click "Run Tests". Watch all 4 test vectors turn green (Pass).' },
      { title: 'Step 4: Tackle Mission 2 — Zero-Division Runtime Crash', description: 'Inspect an unhandled divisor where input `y = 0` crashes the program with a runtime zero-division exception. Add guard condition.' },
    ],
    challenges: [
      { id: 'ch1', title: 'Fix Off-By-One Array Bound', goal: 'Inspect an array loop running from `i = 0` to `i <= array.length` that throws an `IndexOutOfBounds` error and correct it.', hint: 'Array of size N has valid indices 0 to N-1. Loop condition should be `i < array.length`.', successCondition: 'Array bound error corrected' },
      { id: 'ch2', title: 'Correct Discount Logic Bug', goal: 'Fix a retail billing function where items over $100 were accidentally charged extra tax instead of receiving a 10% discount.', hint: 'Check the mathematical sign: price * 0.90 instead of price * 1.10.', successCondition: 'Discount tests pass' },
      { id: 'ch3', title: 'Handle Null Pointer Exception', goal: 'Add a defensive null-check before dereferencing user profile data.', hint: '`if (user != null && user.name != null)`.', successCondition: 'Null check passes without crash' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'A program compiles with zero errors, but when given input 0, it suddenly crashes with message "Division by zero". What category of error is this?', options: ['Syntax error', 'Runtime error', 'Logical error', 'Hardware failure'], correctIndex: 1, explanation: 'A runtime error occurs during program execution when an illegal operation (such as dividing by zero or accessing an invalid memory address) causes the program to crash.' },
      { id: 'q2', type: 'concept', question: 'A program runs to completion with no crashes or error messages, but computes a tax amount of $500 instead of the correct $50. What category of error is this?', options: ['Syntax error', 'Logical error', 'Runtime exception', 'Compiler defect'], correctIndex: 1, explanation: 'A logical error occurs when code runs smoothly without crashes but produces incorrect or unintended results due to faulty algorithm logic.' },
      { id: 'q3', type: 'interpretation', question: 'What is the purpose of setting a "breakpoint" in a debugger?', options: ['To permanently delete that line of code', 'To pause program execution at a specific line so the developer can inspect variable values and system state', 'To make the program execute twice as fast', 'To format the screen output'], correctIndex: 1, explanation: 'A breakpoint pauses program execution at a designated line, allowing the engineer to inspect current variable values, memory, and call stack.' },
      { id: 'q4', type: 'prediction', question: 'In the code snippet `average = a + b / 2;`, what is computed if `a = 10` and `b = 20`?', options: ['15', '20', '10 + (20 / 2) = 20', '5'], correctIndex: 2, explanation: 'Because division has higher operator precedence than addition, `b / 2` evaluates first (10), and is then added to `a` (10), producing 20 instead of the intended 15.' },
      { id: 'q5', type: 'concept', question: 'Why is running automated "regression tests" essential after fixing a bug in code?', options: ['To check the weather', 'To ensure that the newly introduced fix did not accidentally break other existing features that were previously working', 'To increase disk usage', 'To generate new passwords'], correctIndex: 1, explanation: 'Regression testing verifies that software modifications and bug fixes do not inadvertently break existing, previously working functionality.' },
    ],
    defaultParams: { activeMission: 'operator_precedence', currentLine: 1, isFixed: false, testsPassed: 0 },
    is3DPreferred: false,
  },
];
