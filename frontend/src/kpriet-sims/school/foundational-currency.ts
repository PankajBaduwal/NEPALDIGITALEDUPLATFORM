/**
 * PIYUSHDHARA EDUVERSE — FOUNDATIONAL STAGE (CLASS 1) SIMULATION 8
 *
 * Title: The Village Toy Shop! (Indian Currency ₹1, ₹2, ₹5, ₹10 & Bundling 10s and 1s)
 * Alignment: NCERT Class 1 Joyful Mathematics Chapter 8 (Numbers 10 to 20 & Bundling) & Chapter 12 (Money / मुद्रा)
 * Archetype: CURRENCY_REGISTER & GROUPING_GRID (Tens and Ones Bundler)
 *
 * Concepts Taught:
 * 1. Indian Currency Recognition:
 *    - Real-world Indian coins and notes: ₹1, ₹2, ₹5, ₹10 coins and ₹10, ₹20 notes.
 *    - Combining coins to match the price of charming village toys (Spinning Top ₹5, Kite ₹10, Clay Elephant ₹7, Pinwheel ₹12).
 * 2. Place Value & Bundling (Tens and Ones / दहाई और इकाई):
 *    - Bundling 10 loose sticks with a colorful ribbon to make 1 Ten (1 Bundle = 10 Ones).
 *    - Concrete-to-abstract representation: [ Tens : 1 ] [ Ones : 4 ] = 14.
 * 3. Additive Coin Combinations:
 *    - Making an amount through different coin combinations (e.g. ₹5 + ₹2 = ₹7 or ₹2 + ₹2 + ₹2 + ₹1 = ₹7).
 * 4. Multi-sensory Auditory & Visual Feedback:
 *    - Procedural cash register bells, coin clinks, and bilingual voice scaffolding (en-IN & hi-IN).
 */

import {
  defineSchool,
  metric,
  P,
  type SchoolSimulationDefinition,
} from './kit';
import {
  FoundationalAudio,
  FoundationalNarrator,
  FoundationalTouchHelper,
  createConfettiBurst,
  drawInstructionBanner,
  drawCelebrationOverlay,
  type IParticle,
  type IBoundingBox,
} from './foundational-kit';

/* ── Types & Interfaces ── */

export type CurrencySimMode = 'toy-shop' | 'bundling-tens' | 'coin-match';

export interface VillageToy {
  id: string;
  nameEn: string;
  nameHi: string;
  price: number; // in Rupees
  icon: string;
  descriptionEn: string;
  descriptionHi: string;
}

export const VILLAGE_TOYS: VillageToy[] = [
  { id: 'top', nameEn: 'Spinning Top', nameHi: 'लट्टू', price: 5, icon: '🪀', descriptionEn: 'A fast-spinning wooden top!', descriptionHi: 'तेज घूमने वाला लकड़ी का लट्टू!' },
  { id: 'kite', nameEn: 'Paper Kite', nameHi: 'रंगीन पतंग', price: 10, icon: '🪁', descriptionEn: 'A soaring diamond kite!', descriptionHi: 'आसमान में उड़ने वाली पतंग!' },
  { id: 'elephant', nameEn: 'Clay Elephant', nameHi: 'मिट्टी का हाथी', price: 7, icon: '🐘', descriptionEn: 'Hand-painted clay elephant!', descriptionHi: 'सुंदर मिट्टी का खिलौना हाथी!' },
  { id: 'pinwheel', nameEn: 'Wind Pinwheel', nameHi: 'फिरकी', price: 12, icon: '🌀', descriptionEn: 'Whirls merrily in the wind!', descriptionHi: 'हवा में नाचने वाली फिरकी!' },
  { id: 'train', nameEn: 'Pull Toy Train', nameHi: 'खिलौना गाड़ी', price: 15, icon: '🚂', descriptionEn: 'Wooden train with moving wheels!', descriptionHi: 'पहियों वाली लकड़ी की रेलगाड़ी!' },
];

export interface CoinDef {
  denom: number;
  label: string;
  color: string;
  borderColor: string;
  textColor: string;
  radius: number;
  isNote?: boolean;
}

export const INDIAN_DENOMINATIONS: CoinDef[] = [
  { denom: 1, label: '₹1', color: '#CBD5E1', borderColor: '#64748B', textColor: '#0F172A', radius: 26 },
  { denom: 2, label: '₹2', color: '#E2E8F0', borderColor: '#475569', textColor: '#0F172A', radius: 28 },
  { denom: 5, label: '₹5', color: '#FDE68A', borderColor: '#D97706', textColor: '#78350F', radius: 32 },
  { denom: 10, label: '₹10', color: '#FCD34D', borderColor: '#B45309', textColor: '#78350F', radius: 35 },
];

export interface PlacedCoin {
  id: string;
  denom: number;
  x: number;
  y: number;
}

export interface CurrencyToyState {
  mode: CurrencySimMode;

  // Toy Shop Mode State
  activeToyIdx: number;
  tenderedCoins: PlacedCoin[];
  totalTendered: number;

  // Bundling Mode State (Tens and Ones)
  looseSticksCount: number;
  tiedBundlesCount: number; // Each bundle has 10 sticks
  targetBundlingNumber: number; // 11 to 19

  isCelebrating: boolean;
  celebrationMessage: string;
  starsEarned: number;
  particles: IParticle[];

  promptText: string;
  promptHindiText: string;
  speakerBounds: IBoundingBox | null;
  isSpeakerActive: boolean;

  time: number;
  tickCount: number;
}

/* ── Canvas Drawing Procedures ── */

function drawVillageShopScene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Festive Indian village fair awning / stall background
  const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
  wallGrad.addColorStop(0, '#FEF3C7'); // Warm cream canopy
  wallGrad.addColorStop(0.5, '#FDE68A');
  wallGrad.addColorStop(1, '#FED7AA');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, w, h);

  // Festive Striped Awning at top
  const stripeW = 40;
  for (let sx = 0; sx < w; sx += stripeW * 2) {
    ctx.fillStyle = '#DC2626'; // Indian festive red
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx + stripeW, 0);
    ctx.lineTo(sx + stripeW + 10, 48);
    ctx.lineTo(sx + 10, 48);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FEF08A'; // Festive gold yellow
    ctx.beginPath();
    ctx.moveTo(sx + stripeW, 0);
    ctx.lineTo(sx + stripeW * 2, 0);
    ctx.lineTo(sx + stripeW * 2 + 10, 48);
    ctx.lineTo(sx + stripeW + 10, 48);
    ctx.closePath();
    ctx.fill();
  }

  // Scalloped Awning trim
  ctx.fillStyle = '#B91C1C';
  for (let bx = 0; bx < w; bx += 30) {
    ctx.beginPath();
    ctx.arc(bx + 15, 48, 15, 0, Math.PI, false);
    ctx.fill();
  }

  // Wooden Toy Shelf
  ctx.fillStyle = '#78350F';
  ctx.fillRect(w * 0.06, h * 0.44, w * 0.4, 16);
  ctx.fillStyle = '#92400E';
  ctx.fillRect(w * 0.06, h * 0.44 + 16, w * 0.4, 8);

  // Marigold flower garland (Genda phool) dangling on stall
  const garlandY = 62;
  for (let gx = 25; gx < w - 25; gx += 32) {
    ctx.fillStyle = gx % 64 === 0 ? '#F97316' : '#FBBF24';
    ctx.beginPath();
    ctx.arc(gx, garlandY + Math.sin(gx * 0.05) * 6, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawToyShowcaseCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  toy: VillageToy,
  isHindi: boolean
): void {
  const cardX = w * 0.08;
  const cardY = h * 0.16;
  const cardW = w * 0.36;
  const cardH = h * 0.26;

  // Showcase pedestal
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 20);
  ctx.fill();
  ctx.stroke();

  // Toy Icon
  ctx.font = '54px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(toy.icon, cardX + cardW * 0.3, cardY + cardH * 0.5);

  // Toy Title & Price Tag
  ctx.textAlign = 'left';
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 18px "Quicksand", system-ui, sans-serif';
  ctx.fillText(isHindi ? toy.nameHi : toy.nameEn, cardX + cardW * 0.55, cardY + cardH * 0.35);

  // Bright Price Tag Badge
  const tagX = cardX + cardW * 0.55;
  const tagY = cardY + cardH * 0.55;
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, 86, 34, 10);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px "Quicksand", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`₹${toy.price}`, tagX + 43, tagY + 17);
}

function drawCashPaymentTray(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: CurrencyToyState,
  targetPrice: number,
  isHindi: boolean
): void {
  const trayX = w * 0.48;
  const trayY = h * 0.16;
  const trayW = w * 0.46;
  const trayH = h * 0.54;

  // Shopkeeper's Brass Payment Tray
  ctx.fillStyle = '#FFFBEB';
  ctx.strokeStyle = state.totalTendered === targetPrice ? '#10B981' : '#B45309';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(trayX, trayY, trayW, trayH, 24);
  ctx.fill();
  ctx.stroke();

  // Tray Header
  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 15px "Quicksand", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(
    isHindi ? 'दुकानदार का गल्ला (भुगतान करें)' : "Shopkeeper's Cash Tray (Place Money Here)",
    trayX + trayW / 2,
    trayY + 12
  );

  // Amount summary strip
  const needed = targetPrice - state.totalTendered;
  ctx.font = 'bold 14px "Quicksand", system-ui, sans-serif';
  if (state.totalTendered === targetPrice) {
    ctx.fillStyle = '#15803D';
    ctx.fillText(
      isHindi ? `पूर्ण भुगतान: ₹${state.totalTendered} / ₹${targetPrice} ✅` : `Exact Price Paid: ₹${state.totalTendered} / ₹${targetPrice} ✅`,
      trayX + trayW / 2,
      trayY + 36
    );
  } else if (state.totalTendered < targetPrice) {
    ctx.fillStyle = '#B45309';
    ctx.fillText(
      isHindi ? `दिया: ₹${state.totalTendered} (और चाहिए ₹${needed})` : `Tendered: ₹${state.totalTendered} (Need ₹${needed} more)`,
      trayX + trayW / 2,
      trayY + 36
    );
  } else {
    ctx.fillStyle = '#DC2626';
    ctx.fillText(
      isHindi ? `अधिक दिया: ₹${state.totalTendered} (चाहिए ₹${targetPrice})` : `Too Much: ₹${state.totalTendered} (Target is ₹${targetPrice})`,
      trayX + trayW / 2,
      trayY + 36
    );
  }

  // Clear Payment Tray Button on top-right of tray
  if (state.tenderedCoins.length > 0) {
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.roundRect(trayX + trayW - 90, trayY + 8, 80, 28, 8);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px "Quicksand", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isHindi ? 'साफ़ करें ↩' : 'Clear ↩', trayX + trayW - 50, trayY + 22);
  }

  // Render coins placed in payment tray
  for (const c of state.tenderedCoins) {
    const coinDef = INDIAN_DENOMINATIONS.find((d) => d.denom === c.denom) ?? INDIAN_DENOMINATIONS[0]!;
    drawIndianCoin(ctx, c.x, c.y, coinDef);
  }
}

function drawIndianCoin(ctx: CanvasRenderingContext2D, cx: number, cy: number, def: CoinDef): void {
  ctx.save();
  ctx.translate(cx, cy);

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.arc(2, 3, def.radius, 0, Math.PI * 2);
  ctx.fill();

  // Outer Coin Rim
  ctx.fillStyle = def.color;
  ctx.strokeStyle = def.borderColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, def.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner milled ring
  ctx.strokeStyle = def.borderColor;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.arc(0, 0, def.radius - 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Coin Value
  ctx.fillStyle = def.textColor;
  ctx.font = `bold ${Math.round(def.radius * 0.72)}px "Quicksand", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(def.label, 0, 1);

  ctx.restore();
}

function drawCoinWalletTray(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  isHindi: boolean
): void {
  const trayX = w * 0.08;
  const trayY = h * 0.74;
  const trayW = w * 0.84;
  const trayH = h * 0.22;

  // Leather coin purse / wallet dock
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(trayX, trayY, trayW, trayH, 20);
  ctx.fill();
  ctx.stroke();

  // Wallet label
  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 12px "Quicksand", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(
    isHindi ? '— आपका बटुआ (सिक्के छूकर गल्ले में डालें) —' : '— Your Coin Wallet (Tap a coin to add to payment tray) —',
    trayX + 16,
    trayY + 10
  );

  // Render 4 clickable denomination bank buttons
  const coinSpacing = trayW / 5;
  INDIAN_DENOMINATIONS.forEach((def, idx) => {
    const btnX = trayX + coinSpacing * (idx + 1);
    const btnY = trayY + trayH * 0.58;
    drawIndianCoin(ctx, btnX, btnY, def);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px "Quicksand", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+ Add', btnX, btnY + def.radius + 12);
  });
}

function drawBundlingActivityScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: CurrencyToyState,
  isHindi: boolean
): void {
  ctx.fillStyle = '#FEFCE8';
  ctx.fillRect(0, 0, w, h);

  // Header Title Card
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(w * 0.1, 75, w * 0.8, 64, 16);
  ctx.fill();
  ctx.stroke();

  const totalSticks = state.tiedBundlesCount * 10 + state.looseSticksCount;
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 18px "Quicksand", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    isHindi
      ? `लकड़ियों के बंडल: 10 तीलियाँ = 1 दहाई का बंडल (कुल: ${totalSticks})`
      : `Bundling Sticks: 10 Sticks = 1 Bundle of Ten (Total: ${totalSticks})`,
    w * 0.5,
    107
  );

  // Left Section: Bundles of 10 (दहाई / Tens)
  const leftX = w * 0.15;
  const leftY = 160;
  const boxW = w * 0.32;
  const boxH = 200;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(leftX, leftY, boxW, boxH, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 15px "Quicksand", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isHindi ? 'दहाई (Tens = 10)' : 'Bundles of 10 (Tens)', leftX + boxW / 2, leftY + 22);

  // Draw Bundles (tied with festive red ribbon)
  if (state.tiedBundlesCount > 0) {
    for (let b = 0; b < state.tiedBundlesCount; b++) {
      const bundleX = leftX + boxW * 0.5;
      const bundleY = leftY + 100 + b * 45;

      // Sticks bunch
      ctx.fillStyle = '#B45309';
      for (let s = -18; s <= 18; s += 4) {
        ctx.fillRect(bundleX + s, bundleY - 35, 3, 70);
      }
      // Ribbon tie
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.roundRect(bundleX - 22, bundleY - 8, 44, 16, 6);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('10', bundleX, bundleY);
    }
  } else {
    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px "Quicksand", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isHindi ? '10 तीलियाँ होने पर बंडल बनेगा' : 'Collect 10 sticks to tie a bundle', leftX + boxW / 2, leftY + 110);
  }

  // Right Section: Loose Sticks (इकाई / Ones)
  const rightX = w * 0.53;
  const rightY = 160;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(rightX, rightY, boxW, boxH, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0369A1';
  ctx.font = 'bold 15px "Quicksand", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isHindi ? 'इकाई (Loose Ones)' : 'Loose Sticks (Ones)', rightX + boxW / 2, rightY + 22);

  // Render individual loose sticks
  const startStickX = rightX + 35;
  for (let k = 0; k < state.looseSticksCount; k++) {
    const sx = startStickX + (k % 5) * 36;
    const sy = rightY + 60 + Math.floor(k / 5) * 65;

    ctx.fillStyle = '#B45309';
    ctx.fillRect(sx, sy, 5, 50);

    // Matchstick tip
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(sx + 2.5, sy, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Interactive Buttons: "+ Add Loose Stick", "Tie Bundle of 10"
  // Button 1: Add Stick
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.roundRect(w * 0.22, 385, 170, 52, 14);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px "Quicksand", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isHindi ? '➕ 1 तीली जोड़ें' : '➕ Add 1 Stick', w * 0.22 + 85, 411);

  // Button 2: Bundle into Ten
  const canBundle = state.looseSticksCount >= 10;
  ctx.fillStyle = canBundle ? '#16A34A' : '#94A3B8';
  ctx.beginPath();
  ctx.roundRect(w * 0.55, 385, 190, 52, 14);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px "Quicksand", system-ui, sans-serif';
  ctx.fillText(isHindi ? '🎀 10 का बंडल बांधें!' : '🎀 Tie Bundle of 10!', w * 0.55 + 95, 411);

  // Place-Value Equation Bar at bottom
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#7C3AED';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(w * 0.2, 452, w * 0.6, 40, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#5B21B6';
  ctx.font = 'bold 16px "Quicksand", system-ui, sans-serif';
  ctx.fillText(
    isHindi
      ? `[ दहाई / Tens: ${state.tiedBundlesCount} ]  +  [ इकाई / Ones: ${state.looseSticksCount} ]  =  [ ${totalSticks} ]`
      : `[ Tens: ${state.tiedBundlesCount} ]  +  [ Ones: ${state.looseSticksCount} ]  =  [ ${totalSticks} ]`,
    w * 0.5,
    472
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIMULATION ENGINE DEFINITION
   ═══════════════════════════════════════════════════════════════ */

export const villageToyShopSimulation: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class1-currency-toy-shop',
  title: 'The Village Toy Shop! (Indian Currency ₹1, ₹2, ₹5, ₹10 & Bundling 10s and 1s)',
  band: 'GRADES_1_8',
  level: 'class-1',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🪙',
  topic: 'Money & Place Value: Coins, Notes & Bundling Tens and Ones',
  shortDescription:
    'Visit the vibrant village toy shop! Count and combine Indian coins (₹1, ₹2, ₹5, ₹10) to buy wooden spinning tops, kites, and clay elephants, and tie sticks into bundles of 10!',
  detailedDescription:
    'Aligned with NCERT Class 1 Mathematics Chapter 8 ("Numbers 10 to 20 & Bundling") and Chapter 12 ("Money"). Children experience real-world commercial math by tendering exact currency coins and discover place-value grouping by bundling 10 loose sticks with festive ribbons.',
  learningObjectives: [
    'Recognize and name Indian currency denominations: ₹1, ₹2, ₹5, and ₹10 coins and notes',
    'Combine different coin denominations to pay the exact price for items up to ₹20',
    'Understand place-value grouping: 10 loose units form 1 Bundle of Ten (दहाई और इकाई)',
    'Develop foundational financial literacy and mental addition in everyday contexts',
  ],
  parameters: [
    P.select('mode', 'Activity Mode', [
      ['toy-shop', '1. Village Toy Shop (खिलौनों की दुकान)'],
      ['bundling-tens', '2. Bundling 10s and 1s (दस का बंडल और खुले)'],
    ]),
    P.select('toy', 'Select Toy', [
      ['top', 'Spinning Top (लट्टू) — ₹5'],
      ['kite', 'Paper Kite (पतंग) — ₹10'],
      ['elephant', 'Clay Elephant (मिट्टी का हाथी) — ₹7'],
      ['pinwheel', 'Wind Pinwheel (फिरकी) — ₹12'],
      ['train', 'Pull Toy Train (खिलौना गाड़ी) — ₹15'],
    ]),
    P.select('lang', 'Audio Language', [
      ['en-IN', 'English (Indian accent)'],
      ['hi-IN', 'Hindi (हिंदी)'],
    ]),
    P.toggle('voicePrompt', 'Auto Voiceover', true),
  ],
  metrics: [
    metric('tendered', 'Amount Paid', (s) => `₹${(s as any).totalTendered ?? 0}`),
    metric('price', 'Toy Price', (s) => `₹${(s as any).targetPrice ?? 0}`),
    metric('status', 'Transaction', (s) => ((s as any).isPaid ? 'Toy Purchased! 🎁' : 'Need More Coins 🪙')),
    metric('stars', 'Stars Earned', (s) => '⭐'.repeat(Math.max(1, (s as any).starsEarned ?? 1))),
  ],
  tags: [
    'money',
    'indian currency',
    'rupee',
    'coins',
    'bundling tens and ones',
    'place value',
    'toy shop',
    'class 1',
    'ncert',
  ],

  engine: {
    createInitialState: (params, _width, _height): CurrencyToyState => {
      const mode = (params.mode as CurrencySimMode) || 'toy-shop';
      const toyKey = (params.toy as string) || 'top';
      const toyIdx = VILLAGE_TOYS.findIndex((t) => t.id === toyKey);
      const activeToyIdx = toyIdx >= 0 ? toyIdx : 0;

      const state: CurrencyToyState = {
        mode,
        activeToyIdx,
        tenderedCoins: [],
        totalTendered: 0,

        looseSticksCount: 3,
        tiedBundlesCount: 1, // 13
        targetBundlingNumber: 15,

        isCelebrating: false,
        celebrationMessage: 'Khilona Kharid Liya! Great Shopping! 🎁 ⭐',
        starsEarned: 1,
        particles: [],

        promptText: 'Tap the coins in your wallet to pay the exact price for the toy!',
        promptHindiText: 'खिलौना खरीदने के लिए अपने बटुए से सही सिक्के गल्ले में डालें!',
        speakerBounds: null,
        isSpeakerActive: false,

        time: 0,
        tickCount: 0,
      };

      if (mode === 'bundling-tens') {
        state.promptText = 'Add loose sticks! When you reach 10, tie them into a bundle!';
        state.promptHindiText = 'तीलियाँ जोड़ें! 10 तीलियाँ होने पर उन्हें एक बंडल में बांधें!';
      }

      if (params.voicePrompt) {
        setTimeout(() => {
          const speakText = params.lang === 'hi-IN' ? state.promptHindiText : state.promptText;
          FoundationalNarrator.speak(speakText, { lang: params.lang || 'en-IN' });
        }, 400);
      }

      return state;
    },

    reset: (params, width, height) => {
      FoundationalAudio.playDrop();
      return (villageToyShopSimulation.engine as any).createInitialState(params, width, height);
    },

    update: (state: CurrencyToyState, _params, dt, _width, _height) => {
      state.time += dt;
      state.tickCount++;

      // Update particles
      if (state.particles.length > 0) {
        for (const p of state.particles) {
          p.x += p.vx * dt * 60;
          p.y += p.vy * dt * 60;
          p.vy += 220 * dt;
          p.rotation += 4 * dt;
          p.alpha -= dt * 0.6;
        }
        state.particles = state.particles.filter((p) => p.alpha > 0);
      }

      const activeToy = VILLAGE_TOYS[state.activeToyIdx] ?? VILLAGE_TOYS[0]!;
      (state as any).totalTendered = state.totalTendered;
      (state as any).targetPrice = activeToy.price;
      (state as any).isPaid = state.totalTendered === activeToy.price;

      return state;
    },

    render: (ctx, width, height, state: CurrencyToyState, params) => {
      const w = width;
      const h = height;
      const isHindi = params.lang === 'hi-IN';

      if (state.mode === 'toy-shop') {
        const activeToy = VILLAGE_TOYS[state.activeToyIdx] ?? VILLAGE_TOYS[0]!;

        // 1. Scene Background
        drawVillageShopScene(ctx, w, h);

        // 2. Toy Showcase Pedestal
        drawToyShowcaseCard(ctx, w, h, activeToy, isHindi);

        // 3. Payment Cash Tray
        drawCashPaymentTray(ctx, w, h, state, activeToy.price, isHindi);

        // 4. Coin Wallet Dock at bottom
        drawCoinWalletTray(ctx, w, h, isHindi);
      } else {
        // Bundling Tens and Ones Scene
        drawBundlingActivityScene(ctx, w, h, state, isHindi);
      }

      // Instruction Banner at top
      const promptToDisplay = isHindi ? state.promptHindiText : state.promptText;
      const subPrompt = isHindi ? state.promptText : state.promptHindiText;

      const { speakerBounds } = drawInstructionBanner(ctx, w, promptToDisplay, {
        y: 44,
        speakerActive: state.isSpeakerActive,
        step: state.mode === 'toy-shop' ? 'Shop: ₹' : 'Bundling: 10s & 1s',
        subPrompt,
      });
      state.speakerBounds = speakerBounds;

      // Celebration Overlay
      if (state.particles.length > 0) {
        for (const p of state.particles) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }

      if (state.isCelebrating) {
        drawCelebrationOverlay(
          ctx,
          w,
          h,
          state.celebrationMessage,
          state.starsEarned,
          state.particles
        );
      }
    },

    /* ── Touch & Pointer Handlers ── */

    onPointerDown: (x, y, state: CurrencyToyState, params) => {
      if (!state) return;

      // 1. Speaker tap
      if (
        state.speakerBounds &&
        FoundationalTouchHelper.hitTestRect(x, y, state.speakerBounds, 12)
      ) {
        FoundationalAudio.playPop();
        state.isSpeakerActive = true;
        const textToSpeak = params.lang === 'hi-IN' ? state.promptHindiText : state.promptText;
        FoundationalNarrator.speak(textToSpeak, { lang: params.lang || 'en-IN' });
        setTimeout(() => {
          state.isSpeakerActive = false;
        }, 2500);
        return;
      }

      // 2. Dismiss celebration
      if (state.isCelebrating) {
        state.isCelebrating = false;
        state.particles = [];
        FoundationalAudio.playPop();
        return;
      }

      // 3. Toy Shop Mode Interactions
      if (state.mode === 'toy-shop') {
        const activeToy = VILLAGE_TOYS[state.activeToyIdx] ?? VILLAGE_TOYS[0]!;
        const trayX = 800 * 0.48;
        const trayY = 500 * 0.16;
        const trayW = 800 * 0.46;

        // Check Clear Payment Tray button (x: trayX + trayW - 90..trayX + trayW - 10, y: trayY + 8..trayY + 36)
        if (
          state.tenderedCoins.length > 0 &&
          x >= trayX + trayW - 90 &&
          x <= trayX + trayW - 10 &&
          y >= trayY + 8 &&
          y <= trayY + 36
        ) {
          FoundationalAudio.playPop();
          state.tenderedCoins = [];
          state.totalTendered = 0;
          return;
        }

        // Check wallet coin buttons (y: 500 * 0.74..500 * 0.96)
        const walletTrayX = 800 * 0.08;
        const walletTrayW = 800 * 0.84;
        const coinSpacing = walletTrayW / 5;
        const btnY = 500 * 0.74 + 500 * 0.22 * 0.58;

        for (let idx = 0; idx < INDIAN_DENOMINATIONS.length; idx++) {
          const def = INDIAN_DENOMINATIONS[idx]!;
          const btnX = walletTrayX + coinSpacing * (idx + 1);

          if (FoundationalTouchHelper.hitTestCircle(x, y, btnX, btnY, def.radius, 14)) {
            FoundationalAudio.playCountTick(def.denom);

            // Add coin to payment tray with random scatter within tray
            const scatterX = trayX + 45 + Math.random() * (trayW - 90);
            const scatterY = trayY + 70 + Math.random() * (500 * 0.54 - 110);
            state.tenderedCoins.push({
              id: `c-${Date.now()}-${Math.random()}`,
              denom: def.denom,
              x: scatterX,
              y: scatterY,
            });

            state.totalTendered += def.denom;

            // Check if exact price reached
            if (state.totalTendered === activeToy.price) {
              FoundationalAudio.playSuccessChime();
              FoundationalAudio.playCelebrationFanfare();
              state.particles = createConfettiBurst(800, 500, 55);
              state.isCelebrating = true;
              state.celebrationMessage = `Exact ₹${activeToy.price} Paid! You Bought the ${activeToy.nameEn}! 🎁 ⭐`;
              state.starsEarned = 3;

              const buySay =
                params.lang === 'hi-IN'
                  ? `शाबाश! आपने ₹${activeToy.price} का सही भुगतान किया! खिलौना आपका हुआ!`
                  : `Hooray! You paid the exact ₹${activeToy.price}! The toy is yours!`;
              FoundationalNarrator.speak(buySay, { lang: params.lang || 'en-IN' });
            } else if (state.totalTendered > activeToy.price) {
              FoundationalAudio.playGentleRetry();
              const overSay =
                params.lang === 'hi-IN'
                  ? `अरे! यह ₹${activeToy.price} से ज्यादा हो गया! साफ़ करके दोबारा प्रयास करें!`
                  : `Oops! That's more than ₹${activeToy.price}! Clear and try again!`;
              FoundationalNarrator.speak(overSay, { lang: params.lang || 'en-IN' });
            }
            break;
          }
        }
      } else {
        // Bundling Tens and Ones Mode Interactions
        // Button 1: Add Loose Stick (x: w*0.22..w*0.22+170, y: 385..437)
        if (x >= 800 * 0.22 && x <= 800 * 0.22 + 170 && y >= 385 && y <= 437) {
          FoundationalAudio.playPop();
          state.looseSticksCount++;
          FoundationalAudio.playCountTick(state.looseSticksCount);

          if (state.looseSticksCount === 10) {
            FoundationalAudio.playSuccessChime();
            const bundleAlert =
              params.lang === 'hi-IN'
                ? 'वाह! 10 तीलियाँ हो गईं! अब बंडल बांधने का बटन दबाइए!'
                : '10 sticks collected! Tap the Tie Bundle button to make 1 Ten!';
            FoundationalNarrator.speak(bundleAlert, { lang: params.lang || 'en-IN' });
          }
          return;
        }

        // Button 2: Tie Bundle of 10 (x: w*0.55..w*0.55+190, y: 385..437)
        if (x >= 800 * 0.55 && x <= 800 * 0.55 + 190 && y >= 385 && y <= 437) {
          if (state.looseSticksCount >= 10) {
            FoundationalAudio.playCelebrationFanfare();
            state.looseSticksCount -= 10;
            state.tiedBundlesCount++;
            state.particles = createConfettiBurst(800, 500, 45);

            const tiedSay =
              params.lang === 'hi-IN'
                ? `10 तीलियों का 1 बंडल (दहाई) बन गया! अब ${state.tiedBundlesCount} दहाई और ${state.looseSticksCount} इकाई हैं!`
                : `Tied into 1 Bundle of Ten! Now you have ${state.tiedBundlesCount} Tens and ${state.looseSticksCount} Ones!`;
            FoundationalNarrator.speak(tiedSay, { lang: params.lang || 'en-IN' });
          } else {
            FoundationalAudio.playGentleRetry();
            const needSay =
              params.lang === 'hi-IN'
                ? `बंडल बनाने के लिए 10 तीलियाँ चाहिए! अभी केवल ${state.looseSticksCount} हैं!`
                : `You need 10 sticks to tie a bundle! You have ${state.looseSticksCount}!`;
            FoundationalNarrator.speak(needSay, { lang: params.lang || 'en-IN' });
          }
        }
      }
    },
  },
});
