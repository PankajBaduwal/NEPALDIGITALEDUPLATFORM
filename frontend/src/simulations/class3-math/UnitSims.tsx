/** Class 3 unit lessons built on the shared unit lab: length 1 (8), time 2 (16), capacity (18), length 2 (19), weight (20). */
import { makeUnitSim } from './UnitLab';

export const MetreStick = makeUnitSim({
  code: 'SIM-MATH-G3-L8-01', chapter: 8, titleNp: 'मिटर र सेन्टिमिटर (लम्बाइ 1)', titleEn: 'Metre and Centimetre (Length 1)',
  hintNp: '1 मिटर = 100 सेन्टिमिटर। मिटर बढाउँदा सेन्टिमिटर कति हुन्छ हेरौँ।', hintEn: '1 metre = 100 centimetres. Watch the centimetres grow with each metre.',
  pairs: [{ bigNp: 'मिटर', bigEn: 'm', smallNp: 'सेमी', smallEn: 'cm', factor: 100, max: 5, step: 10, visual: 'ruler', color: '#f97316' }],
});

export const TimeUnits = makeUnitSim({
  code: 'SIM-MATH-G3-L16-01', chapter: 16, titleNp: 'घण्टा, मिनेट र सेकेन्ड (समय 2)', titleEn: 'Hours, Minutes and Seconds (Time 2)',
  hintNp: '1 घण्टा = 60 मिनेट, 1 मिनेट = 60 सेकेन्ड।', hintEn: '1 hour = 60 minutes and 1 minute = 60 seconds.',
  pairs: [
    { bigNp: 'घण्टा', bigEn: 'hour', smallNp: 'मिनेट', smallEn: 'minutes', factor: 60, max: 6, step: 10, visual: 'hours', color: '#0ea5e9' },
    { bigNp: 'मिनेट', bigEn: 'minute', smallNp: 'सेकेन्ड', smallEn: 'seconds', factor: 60, max: 6, step: 10, visual: 'minutes', color: '#ec4899' },
  ],
});

export const LitreJug = makeUnitSim({
  code: 'SIM-MATH-G3-L18-01', chapter: 18, titleNp: 'लिटर र मिलिलिटर (धारिता)', titleEn: 'Litre and Millilitre (Capacity)',
  hintNp: '1 लिटर = 1000 मिलिलिटर। ट्याङ्कीमा पानी बढ्दै जाँदा हेरौँ।', hintEn: '1 litre = 1000 millilitres. Watch the tank fill up.',
  pairs: [{ bigNp: 'लिटर', bigEn: 'L', smallNp: 'मिलि', smallEn: 'mL', factor: 1000, max: 5, step: 100, visual: 'jug', color: '#0ea5e9' }],
});

export const RoadTrip = makeUnitSim({
  code: 'SIM-MATH-G3-L19-01', chapter: 19, titleNp: 'सडक यात्रा (लम्बाइ 2)', titleEn: 'Road Trip (Length 2)',
  hintNp: '1 किलोमिटर = 1000 मिटर, 1 मिटर = 100 सेन्टिमिटर।', hintEn: '1 kilometre = 1000 metres and 1 metre = 100 centimetres.',
  pairs: [
    { bigNp: 'किमी', bigEn: 'km', smallNp: 'मिटर', smallEn: 'm', factor: 1000, max: 5, step: 100, visual: 'road', color: '#ef4444' },
    { bigNp: 'मिटर', bigEn: 'm', smallNp: 'सेमी', smallEn: 'cm', factor: 100, max: 5, step: 10, visual: 'ruler', color: '#f97316' },
  ],
});

export const WeighKgG = makeUnitSim({
  code: 'SIM-MATH-G3-L20-01', chapter: 20, titleNp: 'किलोग्राम र ग्राम (तौल)', titleEn: 'Kilogram and Gram (Weight)',
  hintNp: '1 किलोग्राम = 1000 ग्राम। झोला थप्दा तराजुको सुई सर्छ।', hintEn: '1 kilogram = 1000 grams. The needle moves as bags are added.',
  pairs: [{ bigNp: 'केजी', bigEn: 'kg', smallNp: 'ग्राम', smallEn: 'g', factor: 1000, max: 5, step: 100, visual: 'scale', color: '#a16207' }],
});
