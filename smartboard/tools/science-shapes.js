'use strict';

// ══════════════════════════════════════════════════════════════════════════════
// PIYUSHDHARA EDUVERSE BOARD — SCIENCE SYMBOLS & SHAPES LIBRARY
// Physics, Chemistry, Biology, Earth Science, Notation & Lab Safety
// Real, editable canvas objects with vector drawing, labels, and scientific badges
// ══════════════════════════════════════════════════════════════════════════════

const ScienceShapes = (() => {
  const PI = Math.PI;

  // ── Scientific label badge ──
  function sciBadge(ctx, x, y, text, color = '#10b981') {
    ctx.save();
    ctx.setLineDash([]);
    ctx.font = '600 11.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(text).width;
    const pw = tw + 12, ph = 20;
    ctx.fillStyle = 'rgba(15,23,42,0.92)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - pw/2, y - ph/2, pw, ph, 4);
    else ctx.rect(x - pw/2, y - ph/2, pw, ph);
    ctx.fill();
    const strokeColor = color && color !== '#000000' && color !== '#0f172a' && color !== '#1e293b' ? color : '#38bdf8';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // ── Selection handles helper ──
  function selectionHandles(ctx, bx, by, bw, bh) {
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(bx - 6, by - 6, bw + 12, bh + 12);
    ctx.setLineDash([]);
    const pts = [
      [bx-6, by-6], [bx-6+bw/2+6, by-6], [bx+bw+6, by-6],
      [bx-6, by-6+bh/2+6],                [bx+bw+6, by-6+bh/2+6],
      [bx-6, by+bh+6], [bx-6+bw/2+6, by+bh+6], [bx+bw+6, by+bh+6]
    ];
    pts.forEach(([hx, hy]) => {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(hx, hy, 7, 0, PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.restore();
  }

  // ── Arrow head helper ──
  function drawArrow(ctx, fromX, fromY, toX, toY, size = 11) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - size * Math.cos(angle - PI / 6), toY - size * Math.sin(angle - PI / 6));
    ctx.lineTo(toX - size * Math.cos(angle + PI / 6), toY - size * Math.sin(angle + PI / 6));
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    ctx.restore();
  }

  // ── SHAPE DEFINITIONS ──
  const SCIENCE_SHAPE_DEFS = {
    // ── 01. PHYSICS: MECHANICS & FORCES ──
    'sc-force-vector':      { label: 'Force Vector F⃗',          w: 150, h: 50,  color: '#38bdf8', labelText: 'F = 50 N' },
    'sc-motion-arrow':      { label: 'Velocity Vector v⃗',       w: 140, h: 45,  color: '#f59e0b', labelText: 'v = 20 m/s' },
    'sc-free-body':         { label: 'Free-Body Diagram',       w: 140, h: 140, color: '#38bdf8' },
    'sc-inclined-plane':    { label: 'Inclined Plane & Slope',  w: 180, h: 120, color: '#38bdf8', angle: 30 },
    'sc-pulley':            { label: 'Pulley System',           w: 80,  h: 140, color: '#38bdf8' },
    'sc-lever':             { label: 'Lever & Fulcrum',         w: 180, h: 90,  color: '#38bdf8' },
    'sc-spring':            { label: 'Spring Oscillator',       w: 80,  h: 150, color: '#38bdf8', coils: 7 },
    'sc-pendulum-diag':     { label: 'Simple Pendulum',         w: 120, h: 150, color: '#38bdf8' },
    'sc-bar-magnet':        { label: 'Bar Magnet (N-S)',        w: 150, h: 55,  color: '#ef4444' },
    'sc-compass':           { label: 'Magnetic Compass',        w: 90,  h: 90,  color: '#ef4444' },

    // ── 02. ELECTRICAL CIRCUIT SYMBOLS ──
    'sc-battery':           { label: 'DC Battery Cell',         w: 120, h: 60,  color: '#10b981', labelText: '12V' },
    'sc-ac-source':         { label: 'AC Voltage Source',       w: 90,  h: 60,  color: '#10b981', labelText: '230V' },
    'sc-resistor':          { label: 'Resistor R',              w: 120, h: 45,  color: '#10b981', labelText: '10 Ω' },
    'sc-variable-resistor': { label: 'Variable Resistor (Rheostat)', w: 120, h: 55, color: '#10b981' },
    'sc-capacitor':         { label: 'Capacitor C',             w: 100, h: 50,  color: '#10b981', labelText: '100 µF' },
    'sc-inductor':          { label: 'Inductor L',              w: 120, h: 50,  color: '#10b981', labelText: '5 mH' },
    'sc-diode':             { label: 'Semiconductor Diode',     w: 100, h: 50,  color: '#10b981' },
    'sc-led':               { label: 'LED Light Emitting Diode',w: 100, h: 55,  color: '#10b981' },
    'sc-zener':             { label: 'Zener Diode',             w: 100, h: 50,  color: '#10b981' },
    'sc-transistor-npn':    { label: 'Transistor NPN',          w: 100, h: 90,  color: '#10b981' },
    'sc-switch-open':       { label: 'Open Switch',             w: 90,  h: 50,  color: '#10b981', state: 'open' },
    'sc-switch-closed':     { label: 'Closed Switch',           w: 90,  h: 40,  color: '#10b981', state: 'closed' },
    'sc-bulb':              { label: 'Electric Bulb / Lamp',    w: 80,  h: 80,  color: '#10b981', labelText: 'Lamp' },
    'sc-ammeter':           { label: 'Ammeter (A)',             w: 80,  h: 80,  color: '#10b981', labelText: 'A' },
    'sc-voltmeter':         { label: 'Voltmeter (V)',           w: 80,  h: 80,  color: '#10b981', labelText: 'V' },
    'sc-galvanometer':      { label: 'Galvanometer (G)',        w: 80,  h: 80,  color: '#10b981', labelText: 'G' },
    'sc-ground':            { label: 'Earth Ground',            w: 70,  h: 60,  color: '#10b981' },
    'sc-fuse':              { label: 'Electrical Fuse',         w: 110, h: 45,  color: '#10b981' },
    'sc-gate-and':          { label: 'AND Logic Gate',          w: 110, h: 70,  color: '#10b981' },
    'sc-gate-or':           { label: 'OR Logic Gate',           w: 110, h: 70,  color: '#10b981' },
    'sc-gate-not':          { label: 'NOT Gate (Inverter)',     w: 100, h: 60,  color: '#10b981' },
    'sc-gate-nand':         { label: 'NAND Logic Gate',         w: 115, h: 70,  color: '#10b981' },
    'sc-gate-nor':          { label: 'NOR Logic Gate',          w: 115, h: 70,  color: '#10b981' },
    'sc-motor':             { label: 'Electric Motor (M)',      w: 85,  h: 85,  color: '#10b981' },
    'sc-transformer':       { label: 'Transformer (Coils)',     w: 130, h: 90,  color: '#10b981' },

    // ── 03. OPTICS & WAVE DIAGRAMS ──
    'sc-convex-lens':       { label: 'Convex Lens (Converging)',w: 46,  h: 150, color: '#38bdf8' },
    'sc-concave-lens':      { label: 'Concave Lens (Diverging)',w: 46,  h: 150, color: '#38bdf8' },
    'sc-convex-mirror':     { label: 'Convex Mirror',           w: 46,  h: 150, color: '#38bdf8' },
    'sc-concave-mirror':    { label: 'Concave Mirror',          w: 46,  h: 150, color: '#38bdf8' },
    'sc-prism':             { label: 'Triangular Glass Prism',  w: 140, h: 120, color: '#e8c96b' },
    'sc-optical-ray':       { label: 'Light Ray & Normal',      w: 150, h: 40,  color: '#facc15' },
    'sc-refraction-diag':   { label: 'Snell Refraction Boundary',w: 160, h: 140, color: '#38bdf8' },
    'sc-transverse-wave':   { label: 'Transverse Wave (λ, A)',  w: 220, h: 110, color: '#38bdf8' },
    'sc-longitudinal-wave': { label: 'Longitudinal Wave',       w: 220, h: 70,  color: '#38bdf8' },
    'sc-standing-wave':     { label: 'Standing Wave (Nodes)',   w: 220, h: 110, color: '#38bdf8' },
    'sc-sound-wave':        { label: 'Sound Speaker & Waves',   w: 160, h: 110, color: '#38bdf8' },

    // ── 04. CHEMISTRY APPARATUS & LAB GLASSWARE ──
    'sc-beaker':            { label: 'Beaker (250 ml)',         w: 95,  h: 115, color: '#38bdf8', liquidLevel: 60 },
    'sc-test-tube':         { label: 'Test Tube with Liquid',   w: 38,  h: 135, color: '#38bdf8', liquidLevel: 65 },
    'sc-boiling-tube':      { label: 'Boiling Tube',            w: 48,  h: 145, color: '#38bdf8', liquidLevel: 60 },
    'sc-erlenmeyer':        { label: 'Conical Flask (Erlenmeyer)', w: 110, h: 130, color: '#38bdf8', liquidLevel: 50 },
    'sc-round-bottom-flask':{ label: 'Round-Bottom Flask',      w: 100, h: 140, color: '#38bdf8' },
    'sc-volumetric-flask':  { label: 'Volumetric Flask',        w: 90,  h: 150, color: '#38bdf8' },
    'sc-measuring-cylinder':{ label: 'Measuring Cylinder',      w: 48,  h: 160, color: '#38bdf8' },
    'sc-burette':           { label: 'Titration Burette',       w: 36,  h: 180, color: '#38bdf8' },
    'sc-pipette':           { label: 'Graduated Pipette',       w: 28,  h: 160, color: '#38bdf8' },
    'sc-funnel':            { label: 'Filter Funnel',           w: 80,  h: 110, color: '#38bdf8' },
    'sc-separating-funnel': { label: 'Separating Funnel',       w: 75,  h: 150, color: '#38bdf8' },
    'sc-evaporating-dish':  { label: 'Evaporating Dish',        w: 90,  h: 45,  color: '#38bdf8' },
    'sc-mortar-pestle':     { label: 'Mortar and Pestle',       w: 95,  h: 70,  color: '#94a3b8' },
    'sc-bunsen':            { label: 'Bunsen Burner & Flame',   w: 65,  h: 130, color: '#ef4444' },
    'sc-tripod-stand':      { label: 'Tripod Stand & Gauze',    w: 110, h: 130, color: '#94a3b8' },
    'sc-retort-stand':      { label: 'Retort Stand with Clamp', w: 100, h: 170, color: '#94a3b8' },
    'sc-condenser':         { label: 'Liebig Condenser',        w: 160, h: 60,  color: '#38bdf8' },
    'sc-thermometer':       { label: 'Lab Thermometer (°C)',    w: 30,  h: 160, color: '#ef4444' },
    'sc-lab-balance':       { label: 'Digital Lab Balance',     w: 120, h: 70,  color: '#64748b' },

    // ── 05. MOLECULAR SHAPES & CHEMICAL NOTATION ──
    'sc-mol-linear':        { label: 'Linear Molecule (180°)',  w: 160, h: 60,  color: '#38bdf8' },
    'sc-mol-bent':          { label: 'Bent Molecule (H₂O 104.5°)', w: 140, h: 90, color: '#38bdf8' },
    'sc-mol-trigonal-planar':{ label: 'Trigonal Planar (120°)', w: 130, h: 120, color: '#38bdf8' },
    'sc-mol-trigonal-pyramidal':{ label: 'Trigonal Pyramidal (NH₃)', w: 130, h: 120, color: '#38bdf8' },
    'sc-mol-tetrahedral':   { label: 'Tetrahedral Molecule (CH₄)', w: 130, h: 130, color: '#38bdf8' },
    'sc-mol-octahedral':    { label: 'Octahedral Molecule (SF₆)', w: 130, h: 130, color: '#38bdf8' },
    'sc-atom-bohr':         { label: 'Bohr Atom Orbitals',      w: 130, h: 130, color: '#38bdf8' },
    'sc-chem-arrow-forward':{ label: 'Reaction Arrow ⟶',       w: 150, h: 40,  color: '#f8fafc' },
    'sc-chem-arrow-equil':  { label: 'Equilibrium Arrow ⇌',    w: 150, h: 45,  color: '#f8fafc' },
    'sc-chem-delta':        { label: 'Heat Applied (Δ)',        w: 60,  h: 60,  color: '#ef4444' },
    'sc-chem-gas-evolved':  { label: 'Gas Evolved (↑)',         w: 50,  h: 70,  color: '#38bdf8' },
    'sc-chem-precipitate':  { label: 'Precipitate Formed (↓)',  w: 50,  h: 70,  color: '#f59e0b' },

    // ── 06. BIOLOGY DIAGRAMS & CELL ORGANELLES ──
    'sc-animal-cell':       { label: 'Animal Cell & Organelles',w: 150, h: 140, color: '#ec4899' },
    'sc-plant-cell':        { label: 'Plant Cell (Chloroplasts)',w: 160, h: 130, color: '#10b981' },
    'sc-bacterial-cell':    { label: 'Bacterial Cell (Flagellum)', w: 160, h: 90, color: '#eab308' },
    'sc-nucleus':           { label: 'Cell Nucleus & Nucleolus',w: 90,  h: 90,  color: '#a855f7' },
    'sc-mitochondrion':     { label: 'Mitochondrion (Powerhouse)', w: 130, h: 80, color: '#f97316' },
    'sc-chloroplast':       { label: 'Chloroplast (Grana Stacks)', w: 130, h: 80, color: '#10b981' },
    'sc-neuron':            { label: 'Neuron Nerve Cell',       w: 190, h: 90,  color: '#06b6d4' },
    'sc-label-pointer':     { label: 'Leader Line Pointer',     w: 140, h: 50,  color: '#f8fafc' },

    // ── 07. HUMAN ANATOMY & GENETICS ──
    'sc-human-heart':       { label: 'Human Heart (4 Chambers)',w: 130, h: 140, color: '#ef4444' },
    'sc-human-lungs':       { label: 'Lungs & Bronchi Tree',    w: 140, h: 140, color: '#f43f5e' },
    'sc-human-brain':       { label: 'Human Brain Diagram',     w: 140, h: 110, color: '#ec4899' },
    'sc-human-eye':         { label: 'Human Eye Optical Section', w: 140, h: 120, color: '#38bdf8' },
    'sc-human-kidney':      { label: 'Kidney Cross-Section',    w: 110, h: 130, color: '#b91c1c' },
    'sc-blood-cells':       { label: 'Red & White Blood Cells', w: 130, h: 90,  color: '#ef4444' },
    'sc-dna-helix':         { label: 'DNA Double Helix',        w: 100, h: 160, color: '#06b6d4' },
    'sc-chromosome':        { label: 'Chromosome Structure',    w: 80,  h: 130, color: '#a855f7' },
    'sc-punnett-square':    { label: 'Punnett Square (2×2)',    w: 130, h: 130, color: '#38bdf8' },

    // ── 08. EARTH SCIENCE, ASTRONOMY & CYCLES ──
    'sc-earth':             { label: 'Earth Globe with Axis',   w: 110, h: 110, color: '#38bdf8' },
    'sc-sun':               { label: 'Sun & Solar Corona',      w: 120, h: 120, color: '#f59e0b' },
    'sc-moon-phases':       { label: 'Moon Phases Diagram',     w: 160, h: 80,  color: '#cbd5e1' },
    'sc-solar-eclipse':     { label: 'Solar Eclipse Alignment', w: 200, h: 100, color: '#eab308' },
    'sc-orbit':             { label: 'Planetary Elliptical Orbit', w: 180, h: 100, color: '#38bdf8' },
    'sc-telescope':         { label: 'Astronomical Telescope',  w: 160, h: 110, color: '#94a3b8' },
    'sc-volcano':           { label: 'Volcano with Magma Conduit', w: 160, h: 120, color: '#ef4444' },
    'sc-water-cycle':       { label: 'Water Cycle Diagram',     w: 180, h: 130, color: '#0284c7' },
    'sc-earth-layers':      { label: 'Earth Internal Layers',   w: 130, h: 130, color: '#d97706' },

    // ── 09. SCIENTIFIC SYMBOLS, GREEK LETTERS & UNITS ──
    'sc-sym-alpha':         { label: 'Alpha (α)',               w: 70,  h: 70,  color: '#38bdf8' },
    'sc-sym-beta':          { label: 'Beta (β)',                w: 70,  h: 70,  color: '#38bdf8' },
    'sc-sym-gamma':         { label: 'Gamma (γ)',               w: 70,  h: 70,  color: '#38bdf8' },
    'sc-sym-theta':         { label: 'Theta (θ)',               w: 70,  h: 70,  color: '#38bdf8' },
    'sc-sym-lambda':        { label: 'Lambda (λ)',              w: 70,  h: 70,  color: '#38bdf8' },
    'sc-sym-omega':         { label: 'Omega (Ω)',               w: 70,  h: 70,  color: '#38bdf8' },
    'sc-sym-si-units':      { label: 'SI Units Badge',          w: 180, h: 90,  color: '#10b981' },

    // ── 10. LABORATORY SAFETY & WARNING SYMBOLS ──
    'sc-safe-flammable':    { label: 'Hazard: Flammable',       w: 90,  h: 90,  color: '#ef4444' },
    'sc-safe-toxic':        { label: 'Hazard: Toxic (Poison)',  w: 90,  h: 90,  color: '#ef4444' },
    'sc-safe-corrosive':    { label: 'Hazard: Corrosive Acid',  w: 90,  h: 90,  color: '#ef4444' },
    'sc-safe-explosive':    { label: 'Hazard: Explosive',       w: 90,  h: 90,  color: '#ef4444' },
    'sc-safe-biohazard':    { label: 'Biohazard Warning',       w: 90,  h: 90,  color: '#f59e0b' },
    'sc-safe-radiation':    { label: 'Ionizing Radiation',      w: 90,  h: 90,  color: '#eab308' },
    'sc-safe-high-voltage': { label: 'High Voltage Warning',    w: 90,  h: 90,  color: '#eab308' },
  };

  function isScienceShape(type) {
    return !!SCIENCE_SHAPE_DEFS[type];
  }

  function getBounds(s) {
    const def = SCIENCE_SHAPE_DEFS[s.type] || { w: 100, h: 100 };
    return {
      x: s.x,
      y: s.y,
      w: s.w || def.w || 100,
      h: (s.h || def.h || 100) + 30
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DRAW DISPATCHER — Vector drawing for Science Library
  // ─────────────────────────────────────────────────────────────────────────────
  function draw(ctx, s) {
    ctx.save();
    const x = s.x, y = s.y;
    const w = s.w || 100, h = s.h || 80;
    const color = s.color || '#10b981';
    const fill = s.fill || color + '1c';
    const lw = s.selected ? 2.5 : (s.lineWidth || 2);

    ctx.strokeStyle = color;
    ctx.fillStyle = fill;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    switch (s.type) {

      // ── 01. PHYSICS: MECHANICS ──
      case 'sc-force-vector': {
        const midY = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 10, midY); ctx.lineTo(x + w - 10, midY); ctx.stroke();
        drawArrow(ctx, x + w - 24, midY, x + w - 8, midY, 12);
        sciBadge(ctx, x + w / 2, y + h + 16, s.labelText || 'F⃗ Force Vector', color);
        break;
      }

      case 'sc-motion-arrow': {
        const midY = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(x + 10, midY);
        ctx.quadraticCurveTo(x + w * 0.4, midY - 14, x + w - 14, midY);
        ctx.stroke();
        drawArrow(ctx, x + w - 26, midY - 6, x + w - 12, midY, 11);
        sciBadge(ctx, x + w / 2, y + h + 16, s.labelText || 'v⃗ Velocity', color);
        break;
      }

      case 'sc-free-body': {
        const cx = x + w / 2, cy = y + h / 2;
        const bs = 44;
        ctx.strokeRect(cx - bs/2, cy - bs/2, bs, bs);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fillRect(cx - bs/2, cy - bs/2, bs, bs);
        // Force arrows
        // Normal force up
        ctx.beginPath(); ctx.moveTo(cx, cy - bs/2); ctx.lineTo(cx, y + 8); ctx.stroke();
        drawArrow(ctx, cx, y + 20, cx, y + 8, 9);
        sciBadge(ctx, cx, y + 4, 'N', '#38bdf8');
        // Weight down
        ctx.beginPath(); ctx.moveTo(cx, cy + bs/2); ctx.lineTo(cx, y + h - 8); ctx.stroke();
        drawArrow(ctx, cx, y + h - 20, cx, y + h - 8, 9);
        sciBadge(ctx, cx, y + h - 4, 'mg', '#38bdf8');
        // Applied force right
        ctx.beginPath(); ctx.moveTo(cx + bs/2, cy); ctx.lineTo(x + w - 8, cy); ctx.stroke();
        drawArrow(ctx, x + w - 20, cy, x + w - 8, cy, 9);
        sciBadge(ctx, x + w - 2, cy, 'F', '#10b981');
        // Friction force left
        ctx.beginPath(); ctx.moveTo(cx - bs/2, cy); ctx.lineTo(x + 8, cy); ctx.stroke();
        drawArrow(ctx, x + 20, cy, x + 8, cy, 9);
        sciBadge(ctx, x + 2, cy, 'f', '#f59e0b');
        break;
      }

      case 'sc-inclined-plane': {
        const rad = 28 * PI / 180;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + h - 10);
        ctx.lineTo(x + w - 10, y + h - 10);
        ctx.lineTo(x + 10, y + 15);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Sliding block on incline
        const bx = x + w * 0.42, by = y + h * 0.46;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(-rad);
        ctx.fillStyle = '#38bdf833';
        ctx.fillRect(-15, -12, 30, 24);
        ctx.strokeRect(-15, -12, 30, 24);
        ctx.restore();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Inclined Plane (30°)', color);
        break;
      }

      case 'sc-pulley': {
        const cx = x + w / 2;
        // Bracket at ceiling
        ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, y + 36); ctx.stroke();
        // Wheel
        ctx.beginPath(); ctx.arc(cx, y + 48, 22, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, y + 48, 5, 0, PI * 2); ctx.fill();
        // Rope
        ctx.beginPath();
        ctx.moveTo(cx - 22, y + 48); ctx.lineTo(cx - 22, y + h - 28);
        ctx.moveTo(cx + 22, y + 48); ctx.lineTo(cx + 22, y + h - 10);
        ctx.stroke();
        // Mass block
        ctx.strokeRect(cx - 32, y + h - 28, 20, 20);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Pulley System', color);
        break;
      }

      case 'sc-lever': {
        const midY = y + 38;
        const cx = x + w * 0.45;
        // Fulcrum triangle
        ctx.beginPath();
        ctx.moveTo(cx, midY);
        ctx.lineTo(cx - 16, y + h - 16);
        ctx.lineTo(cx + 16, y + h - 16);
        ctx.closePath();
        ctx.fillStyle = color + '33'; ctx.fill(); ctx.stroke();
        // Base ground
        ctx.beginPath();
        ctx.moveTo(cx - 26, y + h - 14); ctx.lineTo(cx + 26, y + h - 14);
        ctx.stroke();
        // Lever beam
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + 10, midY); ctx.lineTo(x + w - 10, midY);
        ctx.stroke();
        ctx.lineWidth = lw;
        // Load on left
        ctx.fillStyle = '#f59e0b33';
        ctx.fillRect(x + 18, midY - 24, 28, 24);
        ctx.strokeRect(x + 18, midY - 24, 28, 24);
        sciBadge(ctx, x + 32, midY - 12, 'Load', '#f59e0b');
        // Effort arrow on right
        drawArrow(ctx, x + w - 24, midY - 24, x + w - 24, midY, 10);
        sciBadge(ctx, x + w - 24, midY - 30, 'Effort', '#10b981');
        sciBadge(ctx, x + w / 2, y + h + 16, 'Lever & Fulcrum', color);
        break;
      }

      case 'sc-spring': {
        const cx = x + w / 2;
        // Top support
        ctx.beginPath(); ctx.moveTo(cx - 20, y + 8); ctx.lineTo(cx + 20, y + 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, y + 20); ctx.stroke();
        // Coils
        const coilTop = y + 20, coilBot = y + h - 34;
        const coils = 6;
        const step = (coilBot - coilTop) / coils;
        ctx.beginPath();
        ctx.moveTo(cx, coilTop);
        for (let i = 0; i < coils; i++) {
          const cy = coilTop + (i + 0.5) * step;
          const sign = i % 2 === 0 ? 1 : -1;
          ctx.lineTo(cx + 18 * sign, cy);
        }
        ctx.lineTo(cx, coilBot);
        ctx.lineTo(cx, y + h - 22);
        ctx.stroke();
        // Mass block
        ctx.strokeRect(cx - 16, y + h - 22, 32, 16);
        ctx.fillStyle = color + '22'; ctx.fillRect(cx - 16, y + h - 22, 32, 16);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Spring Oscillator', color);
        break;
      }

      case 'sc-pendulum-diag': {
        const cx = x + w / 2;
        // Ceiling support
        ctx.beginPath(); ctx.moveTo(cx - 24, y + 8); ctx.lineTo(cx + 24, y + 8); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, y + 8, 3, 0, PI * 2); ctx.fill();
        // Dashed equilibrium line
        ctx.save(); ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, y + h - 18); ctx.stroke();
        ctx.restore();
        // String deflected at 22°
        const rad = 22 * PI / 180;
        const len = h - 32;
        const bobX = cx + len * Math.sin(rad);
        const bobY = y + 8 + len * Math.cos(rad);
        ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(bobX, bobY); ctx.stroke();
        // Bob sphere
        ctx.beginPath(); ctx.arc(bobX, bobY, 12, 0, PI * 2);
        ctx.fillStyle = color + '33'; ctx.fill(); ctx.stroke();
        // Angle arc
        ctx.beginPath(); ctx.arc(cx, y + 8, 28, PI/2 - rad, PI/2); ctx.stroke();
        sciBadge(ctx, cx + 14, y + 44, 'θ', color);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Simple Pendulum', color);
        break;
      }

      case 'sc-bar-magnet': {
        const midX = x + w / 2;
        // North side (Red)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 10, y + 10, (w - 20) / 2, h - 20);
        ctx.strokeRect(x + 10, y + 10, (w - 20) / 2, h - 20);
        sciBadge(ctx, midX - (w - 20) * 0.25, y + h / 2, 'N', '#ffffff');
        // South side (Blue)
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(midX, y + 10, (w - 20) / 2, h - 20);
        ctx.strokeRect(midX, y + 10, (w - 20) / 2, h - 20);
        sciBadge(ctx, midX + (w - 20) * 0.25, y + h / 2, 'S', '#38bdf8');
        break;
      }

      case 'sc-compass': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) * 0.42;
        // Casing circle
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r - 5, 0, PI * 2);
        ctx.save(); ctx.setLineDash([2, 3]); ctx.stroke(); ctx.restore();
        // Direction ticks
        ctx.font = '700 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ef4444'; ctx.fillText('N', cx, cy - r + 11);
        ctx.fillStyle = '#38bdf8'; ctx.fillText('S', cx, cy + r - 11);
        ctx.fillStyle = '#94a3b8'; ctx.fillText('E', cx + r - 11, cy);
        ctx.fillText('W', cx - r + 11, cy);
        // Magnetic Needle (North half red, South half cyan)
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(cx - 5, cy); ctx.lineTo(cx, cy - r + 16); ctx.lineTo(cx + 5, cy);
        ctx.closePath();
        ctx.fillStyle = '#ef4444'; ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(cx - 5, cy); ctx.lineTo(cx, cy + r - 16); ctx.lineTo(cx + 5, cy);
        ctx.closePath();
        ctx.fillStyle = '#38bdf8'; ctx.fill(); ctx.stroke();
        // Pivot center dot
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, PI * 2); ctx.fillStyle = '#f8fafc'; ctx.fill(); ctx.stroke();
        break;
      }

      // ── 02. ELECTRICAL CIRCUIT SYMBOLS ──
      case 'sc-battery': {
        const midY = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 5, midY); ctx.lineTo(x + w * 0.38, midY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w * 0.62, midY); ctx.lineTo(x + w - 5, midY); ctx.stroke();
        ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.moveTo(x + w * 0.38, y + 12); ctx.lineTo(x + w * 0.38, y + h - 12); ctx.stroke();
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x + w * 0.62, y + h * 0.28); ctx.lineTo(x + w * 0.62, y + h * 0.72); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, s.labelText || 'DC Battery Cell', color);
        break;
      }

      case 'sc-ac-source': {
        const cx = x + w / 2, cy = y + h / 2, r = 20;
        // Wires
        ctx.beginPath(); ctx.moveTo(x + 5, cy); ctx.lineTo(cx - r, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + r, cy); ctx.lineTo(x + w - 5, cy); ctx.stroke();
        // Generator circle
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2);
        ctx.fillStyle = color + '15'; ctx.fill(); ctx.stroke();
        // Sine wave symbol inside
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy);
        ctx.quadraticCurveTo(cx - 6, cy - 11, cx, cy);
        ctx.quadraticCurveTo(cx + 6, cy + 11, cx + 12, cy);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, s.labelText || 'AC Voltage Source', color);
        break;
      }

      case 'sc-resistor': {
        const midY = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 5, midY); ctx.lineTo(x + 25, midY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - 25, midY); ctx.lineTo(x + w - 5, midY); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 25, midY);
        const steps = 6;
        const stepW = (w - 50) / steps;
        for (let i = 0; i < steps; i++) {
          const sy = (i % 2 === 0) ? (midY - 12) : (midY + 12);
          ctx.lineTo(x + 25 + (i + 0.5) * stepW, sy);
        }
        ctx.lineTo(x + w - 25, midY);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, s.labelText || 'Resistor R', color);
        break;
      }

      case 'sc-variable-resistor': {
        const midY = y + h / 2 + 4;
        ctx.beginPath(); ctx.moveTo(x + 5, midY); ctx.lineTo(x + 22, midY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - 22, midY); ctx.lineTo(x + w - 5, midY); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 22, midY);
        const steps = 6;
        const stepW = (w - 44) / steps;
        for (let i = 0; i < steps; i++) {
          const sy = (i % 2 === 0) ? (midY - 10) : (midY + 10);
          ctx.lineTo(x + 22 + (i + 0.5) * stepW, sy);
        }
        ctx.lineTo(x + w - 22, midY);
        ctx.stroke();
        // Diagonal arrow for rheostat
        const ax1 = x + 26, ay1 = midY + 18;
        const ax2 = x + w - 22, ay2 = midY - 20;
        ctx.beginPath(); ctx.moveTo(ax1, ay1); ctx.lineTo(ax2, ay2); ctx.stroke();
        drawArrow(ctx, ax1, ay1, ax2, ay2, 9);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Variable Resistor (Rheostat)', color);
        break;
      }

      case 'sc-capacitor': {
        const midY = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 5, midY); ctx.lineTo(x + w * 0.44, midY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w * 0.56, midY); ctx.lineTo(x + w - 5, midY); ctx.stroke();
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(x + w * 0.44, y + 10); ctx.lineTo(x + w * 0.44, y + h - 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w * 0.56, y + 10); ctx.lineTo(x + w * 0.56, y + h - 10); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, s.labelText || 'Capacitor C', color);
        break;
      }

      case 'sc-inductor': {
        const midY = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 5, midY); ctx.lineTo(x + 20, midY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - 20, midY); ctx.lineTo(x + w - 5, midY); ctx.stroke();
        const loops = 4;
        const loopR = (w - 40) / (loops * 2);
        for (let i = 0; i < loops; i++) {
          const lcx = x + 20 + loopR + i * (loopR * 2);
          ctx.beginPath();
          ctx.arc(lcx, midY, loopR, PI, 0);
          ctx.stroke();
        }
        sciBadge(ctx, x + w / 2, y + h + 16, s.labelText || 'Inductor L', color);
        break;
      }

      case 'sc-diode': {
        const midY = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 5, midY); ctx.lineTo(x + w * 0.35, midY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w * 0.65, midY); ctx.lineTo(x + w - 5, midY); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.35, midY - 16);
        ctx.lineTo(x + w * 0.65, midY);
        ctx.lineTo(x + w * 0.35, midY + 16);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.65, midY - 16); ctx.lineTo(x + w * 0.65, midY + 16);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Semiconductor Diode', color);
        break;
      }

      case 'sc-led': {
        const midY = y + h / 2 + 4;
        ctx.beginPath(); ctx.moveTo(x + 5, midY); ctx.lineTo(x + w * 0.34, midY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w * 0.64, midY); ctx.lineTo(x + w - 5, midY); ctx.stroke();
        // Diode symbol
        ctx.beginPath();
        ctx.moveTo(x + w * 0.34, midY - 15);
        ctx.lineTo(x + w * 0.64, midY);
        ctx.lineTo(x + w * 0.34, midY + 15);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.64, midY - 15); ctx.lineTo(x + w * 0.64, midY + 15);
        ctx.stroke();
        // Light emission arrows pointing up-right
        const r1x = x + w * 0.52, r1y = midY - 14;
        const r2x = x + w * 0.62, r2y = midY - 19;
        ctx.beginPath(); ctx.moveTo(r1x, r1y); ctx.lineTo(r1x + 10, r1y - 10); ctx.stroke();
        drawArrow(ctx, r1x, r1y, r1x + 10, r1y - 10, 6);
        ctx.beginPath(); ctx.moveTo(r2x, r2y); ctx.lineTo(r2x + 10, r2y - 10); ctx.stroke();
        drawArrow(ctx, r2x, r2y, r2x + 10, r2y - 10, 6);
        sciBadge(ctx, x + w / 2, y + h + 16, 'LED Diode', color);
        break;
      }

      case 'sc-zener': {
        const midY = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 5, midY); ctx.lineTo(x + w * 0.35, midY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w * 0.65, midY); ctx.lineTo(x + w - 5, midY); ctx.stroke();
        // Triangle
        ctx.beginPath();
        ctx.moveTo(x + w * 0.35, midY - 15);
        ctx.lineTo(x + w * 0.65, midY);
        ctx.lineTo(x + w * 0.35, midY + 15);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Zener bent bar (Z shape)
        ctx.beginPath();
        ctx.moveTo(x + w * 0.65 - 6, midY - 15);
        ctx.lineTo(x + w * 0.65, midY - 15);
        ctx.lineTo(x + w * 0.65, midY + 15);
        ctx.lineTo(x + w * 0.65 + 6, midY + 15);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Zener Diode', color);
        break;
      }

      case 'sc-transistor-npn': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = 26;
        // Transistor circle
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        // Base lead & bar
        ctx.beginPath(); ctx.moveTo(x + 6, cy); ctx.lineTo(cx - 10, cy); ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - 10, cy - 14); ctx.lineTo(cx - 10, cy + 14); ctx.stroke();
        ctx.lineWidth = lw;
        // Collector (top branch)
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 7); ctx.lineTo(cx + 14, cy - 20);
        ctx.lineTo(cx + 14, y + 8);
        ctx.stroke();
        // Emitter with outward arrow (NPN)
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy + 7); ctx.lineTo(cx + 14, cy + 20);
        ctx.lineTo(cx + 14, y + h - 8);
        ctx.stroke();
        drawArrow(ctx, cx - 1, cy + 12, cx + 12, cy + 19, 7);
        sciBadge(ctx, x + w / 2, y + h + 16, 'NPN Transistor', color);
        break;
      }

      case 'sc-switch-open': {
        const midY = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 5, midY); ctx.lineTo(x + 25, midY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - 25, midY); ctx.lineTo(x + w - 5, midY); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 28, midY, 3.5, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + w - 28, midY, 3.5, 0, PI * 2); ctx.stroke();
        // Angled blade
        ctx.beginPath(); ctx.moveTo(x + 31, midY); ctx.lineTo(x + w - 30, midY - 20); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Open Switch', color);
        break;
      }

      case 'sc-switch-closed': {
        const midY = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 5, midY); ctx.lineTo(x + 25, midY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - 25, midY); ctx.lineTo(x + w - 5, midY); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 28, midY, 3.5, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + w - 28, midY, 3.5, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 31, midY); ctx.lineTo(x + w - 31, midY); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Closed Switch', color);
        break;
      }

      case 'sc-bulb': {
        const cx = x + w / 2, cy = y + h / 2, r = 24;
        ctx.beginPath(); ctx.moveTo(x + 5, cy); ctx.lineTo(cx - r, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + r, cy); ctx.lineTo(x + w - 5, cy); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        // Filament cross
        const d = r * 0.707;
        ctx.beginPath();
        ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx + d, cy + d);
        ctx.moveTo(cx - d, cy + d); ctx.lineTo(cx + d, cy - d);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Electric Bulb / Lamp', color);
        break;
      }

      case 'sc-ammeter':
      case 'sc-voltmeter':
      case 'sc-galvanometer': {
        const cx = x + w / 2, cy = y + h / 2, r = 24;
        ctx.beginPath(); ctx.moveTo(x + 5, cy); ctx.lineTo(cx - r, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + r, cy); ctx.lineTo(x + w - 5, cy); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2);
        ctx.fillStyle = color + '15'; ctx.fill(); ctx.stroke();
        ctx.font = '700 18px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        const letter = s.type === 'sc-ammeter' ? 'A' : (s.type === 'sc-voltmeter' ? 'V' : 'G');
        ctx.fillText(letter, cx, cy);
        break;
      }

      case 'sc-ground': {
        const cx = x + w / 2;
        ctx.beginPath(); ctx.moveTo(cx, y + 6); ctx.lineTo(cx, y + 26); ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - 20, y + 26); ctx.lineTo(cx + 20, y + 26); ctx.stroke();
        ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(cx - 12, y + 34); ctx.lineTo(cx + 12, y + 34); ctx.stroke();
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(cx - 5, y + 42); ctx.lineTo(cx + 5, y + 42); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Earth Ground', color);
        break;
      }

      case 'sc-fuse': {
        const midY = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 6, midY); ctx.lineTo(x + 22, midY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - 22, midY); ctx.lineTo(x + w - 6, midY); ctx.stroke();
        // Cartridge rectangle
        ctx.strokeRect(x + 22, midY - 12, w - 44, 24);
        ctx.fillStyle = color + '12'; ctx.fillRect(x + 22, midY - 12, w - 44, 24);
        // Fuse wire inside
        ctx.beginPath(); ctx.moveTo(x + 22, midY); ctx.lineTo(x + w - 22, midY); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Electrical Fuse', color);
        break;
      }

      case 'sc-gate-and': {
        const midY = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(x + 25, y + 10);
        ctx.lineTo(x + w * 0.52, y + 10);
        ctx.arc(x + w * 0.52, midY, h / 2 - 10, -PI / 2, PI / 2);
        ctx.lineTo(x + 25, y + h - 10);
        ctx.closePath();
        ctx.fillStyle = color + '18'; ctx.fill(); ctx.stroke();
        // Inputs
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 20); ctx.lineTo(x + 25, y + 20);
        ctx.moveTo(x + 6, y + h - 20); ctx.lineTo(x + 25, y + h - 20);
        // Output
        ctx.moveTo(x + w * 0.52 + h / 2 - 10, midY); ctx.lineTo(x + w - 6, midY);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'AND Logic Gate', color);
        break;
      }

      case 'sc-gate-nand': {
        const midY = y + h / 2;
        const noseX = x + w * 0.50 + h / 2 - 10;
        ctx.beginPath();
        ctx.moveTo(x + 24, y + 10);
        ctx.lineTo(x + w * 0.50, y + 10);
        ctx.arc(x + w * 0.50, midY, h / 2 - 10, -PI / 2, PI / 2);
        ctx.lineTo(x + 24, y + h - 10);
        ctx.closePath();
        ctx.fillStyle = color + '18'; ctx.fill(); ctx.stroke();
        // Inversion bubble
        ctx.beginPath(); ctx.arc(noseX + 5, midY, 4.5, 0, PI * 2);
        ctx.fillStyle = '#0f172a'; ctx.fill(); ctx.stroke();
        // Inputs
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 20); ctx.lineTo(x + 24, y + 20);
        ctx.moveTo(x + 6, y + h - 20); ctx.lineTo(x + 24, y + h - 20);
        // Output
        ctx.moveTo(noseX + 9.5, midY); ctx.lineTo(x + w - 6, midY);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'NAND Logic Gate', color);
        break;
      }

      case 'sc-gate-or': {
        const midY = y + h / 2;
        const noseX = x + w - 24;
        ctx.beginPath();
        ctx.moveTo(x + 22, y + 10);
        ctx.quadraticCurveTo(x + w * 0.52, y + 10, noseX, midY);
        ctx.quadraticCurveTo(x + w * 0.52, y + h - 10, x + 22, y + h - 10);
        ctx.quadraticCurveTo(x + 36, midY, x + 22, y + 10);
        ctx.closePath();
        ctx.fillStyle = color + '18'; ctx.fill(); ctx.stroke();
        // Inputs
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 20); ctx.lineTo(x + 31, y + 20);
        ctx.moveTo(x + 6, y + h - 20); ctx.lineTo(x + 31, y + h - 20);
        // Output
        ctx.moveTo(noseX, midY); ctx.lineTo(x + w - 6, midY);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'OR Logic Gate', color);
        break;
      }

      case 'sc-gate-nor': {
        const midY = y + h / 2;
        const noseX = x + w - 30;
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 10);
        ctx.quadraticCurveTo(x + w * 0.50, y + 10, noseX, midY);
        ctx.quadraticCurveTo(x + w * 0.50, y + h - 10, x + 20, y + h - 10);
        ctx.quadraticCurveTo(x + 34, midY, x + 20, y + 10);
        ctx.closePath();
        ctx.fillStyle = color + '18'; ctx.fill(); ctx.stroke();
        // Inversion bubble
        ctx.beginPath(); ctx.arc(noseX + 5, midY, 4.5, 0, PI * 2);
        ctx.fillStyle = '#0f172a'; ctx.fill(); ctx.stroke();
        // Inputs
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 20); ctx.lineTo(x + 29, y + 20);
        ctx.moveTo(x + 6, y + h - 20); ctx.lineTo(x + 29, y + h - 20);
        // Output
        ctx.moveTo(noseX + 9.5, midY); ctx.lineTo(x + w - 6, midY);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'NOR Logic Gate', color);
        break;
      }

      case 'sc-gate-not': {
        const midY = y + h / 2;
        const noseX = x + w - 32;
        ctx.beginPath();
        ctx.moveTo(x + 22, y + 12);
        ctx.lineTo(noseX, midY);
        ctx.lineTo(x + 22, y + h - 12);
        ctx.closePath();
        ctx.fillStyle = color + '18'; ctx.fill(); ctx.stroke();
        // Inversion bubble
        ctx.beginPath(); ctx.arc(noseX + 5, midY, 4.5, 0, PI * 2);
        ctx.fillStyle = '#0f172a'; ctx.fill(); ctx.stroke();
        // Input & Output
        ctx.beginPath();
        ctx.moveTo(x + 6, midY); ctx.lineTo(x + 22, midY);
        ctx.moveTo(noseX + 9.5, midY); ctx.lineTo(x + w - 6, midY);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'NOT Logic Gate', color);
        break;
      }

      case 'sc-motor': {
        const cx = x + w / 2, cy = y + h / 2, r = 24;
        ctx.beginPath(); ctx.moveTo(x + 5, cy); ctx.lineTo(cx - r - 4, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + r + 4, cy); ctx.lineTo(x + w - 5, cy); ctx.stroke();
        // Brush blocks
        ctx.strokeRect(cx - r - 4, cy - 6, 4, 12);
        ctx.strokeRect(cx + r, cy - 6, 4, 12);
        // Rotor circle
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2);
        ctx.fillStyle = color + '15'; ctx.fill(); ctx.stroke();
        ctx.font = '700 20px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color; ctx.fillText('M', cx, cy);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Electric Motor (M)', color);
        break;
      }

      case 'sc-transformer': {
        const cx = x + w / 2;
        const loops = 4;
        const loopR = 9;
        // Primary winding (left)
        const lx = cx - 18;
        ctx.beginPath(); ctx.moveTo(x + 6, y + 16); ctx.lineTo(lx, y + 16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 6, y + h - 16); ctx.lineTo(lx, y + h - 16); ctx.stroke();
        for (let i = 0; i < loops; i++) {
          const ly = y + 16 + loopR + i * (loopR * 2);
          ctx.beginPath(); ctx.arc(lx, ly, loopR, -PI/2, PI/2, true); ctx.stroke();
        }
        // Secondary winding (right)
        const rx = cx + 18;
        ctx.beginPath(); ctx.moveTo(rx, y + 16); ctx.lineTo(x + w - 6, y + 16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rx, y + h - 16); ctx.lineTo(x + w - 6, y + h - 16); ctx.stroke();
        for (let i = 0; i < loops; i++) {
          const ry = y + 16 + loopR + i * (loopR * 2);
          ctx.beginPath(); ctx.arc(rx, ry, loopR, -PI/2, PI/2, false); ctx.stroke();
        }
        // Magnetic core bars
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(cx - 3, y + 12); ctx.lineTo(cx - 3, y + h - 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 3, y + 12); ctx.lineTo(cx + 3, y + h - 12); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Transformer Coils', color);
        break;
      }

      // ── 03. OPTICS & WAVE DIAGRAMS ──
      case 'sc-convex-lens': {
        const cx = x + w / 2;
        ctx.beginPath();
        ctx.moveTo(cx, y + 10);
        ctx.quadraticCurveTo(cx + w * 0.45, y + h / 2, cx, y + h - 10);
        ctx.quadraticCurveTo(cx - w * 0.45, y + h / 2, cx, y + 10);
        ctx.fillStyle = color + '22'; ctx.fill(); ctx.stroke();
        ctx.save(); ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(cx, y + 12); ctx.lineTo(cx, y + h - 12); ctx.stroke();
        ctx.restore();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Convex Lens', color);
        break;
      }

      case 'sc-concave-lens': {
        const cx = x + w / 2;
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.4, y + 10);
        ctx.lineTo(cx + w * 0.4, y + 10);
        ctx.quadraticCurveTo(cx + 2, y + h / 2, cx + w * 0.4, y + h - 10);
        ctx.lineTo(cx - w * 0.4, y + h - 10);
        ctx.quadraticCurveTo(cx - 2, y + h / 2, cx - w * 0.4, y + 10);
        ctx.closePath();
        ctx.fillStyle = color + '22'; ctx.fill(); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Concave Lens', color);
        break;
      }

      case 'sc-convex-mirror': {
        const cx = x + w * 0.45;
        // Principal axis
        ctx.save(); ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(x + 4, y + h / 2); ctx.lineTo(x + w - 4, y + h / 2); ctx.stroke();
        ctx.restore();
        // Mirror reflective surface arc (bulging left)
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, y + 10);
        ctx.quadraticCurveTo(cx - 16, y + h / 2, cx, y + h - 10);
        ctx.stroke();
        // Hatch lines on right side (silvering)
        ctx.lineWidth = 1;
        for (let i = y + 16; i < y + h - 12; i += 8) {
          const my = i;
          const curveX = cx - 16 * (1 - Math.pow((my - (y + h/2)) / (h/2 - 10), 2));
          ctx.beginPath(); ctx.moveTo(curveX, my); ctx.lineTo(curveX + 8, my - 6); ctx.stroke();
        }
        sciBadge(ctx, x + w / 2, y + h + 16, 'Convex Mirror', color);
        break;
      }

      case 'sc-concave-mirror': {
        const cx = x + w * 0.55;
        ctx.save(); ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(x + 4, y + h / 2); ctx.lineTo(x + w - 4, y + h / 2); ctx.stroke();
        ctx.restore();
        // Mirror curve (hollow left, reflective inner)
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, y + 10);
        ctx.quadraticCurveTo(cx + 16, y + h / 2, cx, y + h - 10);
        ctx.stroke();
        // Hatch marks on right side (back)
        ctx.lineWidth = 1;
        for (let i = y + 16; i < y + h - 12; i += 8) {
          const my = i;
          const curveX = cx + 16 * (1 - Math.pow((my - (y + h/2)) / (h/2 - 10), 2));
          ctx.beginPath(); ctx.moveTo(curveX, my); ctx.lineTo(curveX + 8, my - 6); ctx.stroke();
        }
        sciBadge(ctx, x + w / 2, y + h + 16, 'Concave Mirror', color);
        break;
      }

      case 'sc-prism': {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + 12);
        ctx.lineTo(x + w - 14, y + h - 12);
        ctx.lineTo(x + 14, y + h - 12);
        ctx.closePath();
        ctx.fillStyle = 'rgba(232, 201, 107, 0.2)'; ctx.fill(); ctx.stroke();
        // Light ray splitting
        ctx.beginPath(); ctx.moveTo(x + 4, y + h * 0.65); ctx.lineTo(x + w * 0.32, y + h * 0.54); ctx.stroke();
        ctx.save(); ctx.strokeStyle = '#ef4444'; ctx.beginPath();
        ctx.moveTo(x + w * 0.32, y + h * 0.54); ctx.lineTo(x + w * 0.68, y + h * 0.58); ctx.lineTo(x + w - 4, y + h * 0.60); ctx.stroke();
        ctx.strokeStyle = '#38bdf8'; ctx.beginPath();
        ctx.moveTo(x + w * 0.32, y + h * 0.54); ctx.lineTo(x + w * 0.68, y + h * 0.68); ctx.lineTo(x + w - 4, y + h * 0.78); ctx.stroke();
        ctx.restore();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Triangular Prism', color);
        break;
      }

      case 'sc-optical-ray': {
        const midY = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 6, midY); ctx.lineTo(x + w - 6, midY); ctx.stroke();
        drawArrow(ctx, x + w * 0.45, midY, x + w * 0.60, midY, 11);
        ctx.save(); ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(x + w / 2, y + 4); ctx.lineTo(x + w / 2, y + h - 4); ctx.stroke();
        ctx.restore();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Light Ray & Normal', color);
        break;
      }

      case 'sc-refraction-diag': {
        const midY = y + h / 2;
        const cx = x + w / 2;
        // Interface plane
        ctx.beginPath(); ctx.moveTo(x + 6, midY); ctx.lineTo(x + w - 6, midY); ctx.stroke();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fillRect(x + 6, midY, w - 12, h / 2 - 10);
        // Normal dashed line
        ctx.save(); ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, y + h - 8); ctx.stroke();
        ctx.restore();
        // Incident ray (angle ~45°)
        ctx.beginPath(); ctx.moveTo(x + 24, y + 14); ctx.lineTo(cx, midY); ctx.stroke();
        drawArrow(ctx, x + 24, y + 14, cx - 14, midY - 14, 9);
        // Refracted ray (bends towards normal)
        ctx.beginPath(); ctx.moveTo(cx, midY); ctx.lineTo(cx + 36, y + h - 14); ctx.stroke();
        drawArrow(ctx, cx, midY, cx + 22, midY + 30, 9);
        sciBadge(ctx, x + 38, midY - 16, 'n₁ (Air)', '#f8fafc');
        sciBadge(ctx, x + 44, midY + 16, 'n₂ (Glass)', '#38bdf8');
        break;
      }

      case 'sc-transverse-wave': {
        const midY = y + h / 2;
        ctx.save(); ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(x + 6, midY); ctx.lineTo(x + w - 6, midY); ctx.stroke();
        ctx.restore();
        // Sine wave
        ctx.beginPath();
        const cycles = 2;
        const amp = h * 0.36;
        for (let px = 0; px <= w - 20; px++) {
          const rad = (px / (w - 20)) * (cycles * 2 * PI);
          const wy = midY - Math.sin(rad) * amp;
          if (px === 0) ctx.moveTo(x + 10 + px, wy);
          else ctx.lineTo(x + 10 + px, wy);
        }
        ctx.stroke();
        sciBadge(ctx, x + w * 0.25, y + 4, 'Crest', color);
        sciBadge(ctx, x + w * 0.75, y + h - 4, 'Trough', color);
        break;
      }

      case 'sc-longitudinal-wave': {
        const midY = y + h / 2;
        const lines = 36;
        const spacing = (w - 30) / lines;
        ctx.lineWidth = 1.6;
        for (let i = 0; i <= lines; i++) {
          const phase = Math.sin((i / lines) * 4 * PI);
          const shift = phase * (spacing * 0.6);
          const lx = x + 15 + i * spacing + shift;
          ctx.beginPath();
          ctx.moveTo(lx, midY - 18);
          ctx.lineTo(lx, midY + 18);
          ctx.stroke();
        }
        sciBadge(ctx, x + w * 0.28, y + 4, 'Compression', color);
        sciBadge(ctx, x + w * 0.72, y + 4, 'Rarefaction', '#38bdf8');
        break;
      }

      case 'sc-standing-wave': {
        const midY = y + h / 2;
        const cycles = 3;
        const amp = h * 0.34;
        ctx.beginPath();
        for (let px = 0; px <= w - 24; px++) {
          const rad = (px / (w - 24)) * (cycles * PI);
          const wy = midY - Math.sin(rad) * amp;
          if (px === 0) ctx.moveTo(x + 12 + px, wy);
          else ctx.lineTo(x + 12 + px, wy);
        }
        ctx.stroke();
        ctx.save(); ctx.setLineDash([4, 3]);
        ctx.beginPath();
        for (let px = 0; px <= w - 24; px++) {
          const rad = (px / (w - 24)) * (cycles * PI);
          const wy = midY + Math.sin(rad) * amp;
          if (px === 0) ctx.moveTo(x + 12 + px, wy);
          else ctx.lineTo(x + 12 + px, wy);
        }
        ctx.stroke();
        ctx.restore();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Standing Wave (Nodes)', color);
        break;
      }

      case 'sc-sound-wave': {
        const my = y + h / 2;
        // Speaker box & cone
        ctx.fillRect(x + 10, my - 16, 14, 32);
        ctx.strokeRect(x + 10, my - 16, 14, 32);
        ctx.beginPath();
        ctx.moveTo(x + 24, my - 16);
        ctx.lineTo(x + 42, my - 28);
        ctx.lineTo(x + 42, my + 28);
        ctx.lineTo(x + 24, my + 16);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Expanding circular sound wavefronts
        for (let r = 20; r <= 60; r += 14) {
          ctx.beginPath();
          ctx.arc(x + 36, my, r, -PI * 0.28, PI * 0.28);
          ctx.stroke();
        }
        sciBadge(ctx, x + w / 2, y + h + 16, 'Sound Speaker & Waves', color);
        break;
      }

      // ── 04. CHEMISTRY APPARATUS & LAB GLASSWARE ──
      case 'sc-beaker': {
        const bx = x + 12, by = y + 16, bw = w - 24, bh = h - 26;
        // Glass body
        ctx.beginPath();
        ctx.moveTo(bx - 6, by); ctx.lineTo(bx + bw, by); // Spout & rim
        ctx.lineTo(bx + bw, by + bh);
        ctx.lineTo(bx, by + bh);
        ctx.lineTo(bx, by);
        ctx.stroke();
        // Liquid
        const lqY = by + bh * (1 - 0.55);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fillRect(bx + 1, lqY, bw - 2, by + bh - lqY);
        // Graduation marks
        for (let i = 1; i <= 3; i++) {
          const gy = by + bh * (i / 4);
          ctx.beginPath(); ctx.moveTo(bx, gy); ctx.lineTo(bx + 12, gy); ctx.stroke();
        }
        sciBadge(ctx, x + w / 2, y + h + 16, 'Beaker (250 ml)', color);
        break;
      }

      case 'sc-test-tube': {
        const cx = x + w / 2;
        const tw = 20, th = h - 30;
        ctx.beginPath();
        ctx.moveTo(cx - tw/2, y + 10);
        ctx.lineTo(cx - tw/2, y + 10 + th);
        ctx.arc(cx, y + 10 + th, tw/2, PI, 0);
        ctx.lineTo(cx + tw/2, y + 10);
        ctx.stroke();
        // Flared lip
        ctx.beginPath(); ctx.ellipse(cx, y + 10, tw/2 + 3, 3, 0, 0, PI * 2); ctx.stroke();
        // Liquid
        const lqH = th * 0.6;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.moveTo(cx - tw/2 + 1, y + 10 + th - lqH);
        ctx.lineTo(cx - tw/2 + 1, y + 10 + th);
        ctx.arc(cx, y + 10 + th, tw/2 - 1, PI, 0);
        ctx.lineTo(cx + tw/2 - 1, y + 10 + th - lqH);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'sc-boiling-tube': {
        const cx = x + w / 2;
        const tw = 28, th = h - 28;
        ctx.beginPath();
        ctx.moveTo(cx - tw/2, y + 8);
        ctx.lineTo(cx - tw/2, y + 8 + th);
        ctx.arc(cx, y + 8 + th, tw/2, PI, 0);
        ctx.lineTo(cx + tw/2, y + 8);
        ctx.stroke();
        // Rim
        ctx.beginPath(); ctx.ellipse(cx, y + 8, tw/2 + 4, 3.5, 0, 0, PI * 2); ctx.stroke();
        // Liquid
        const lqH = th * 0.55;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.moveTo(cx - tw/2 + 1, y + 8 + th - lqH);
        ctx.lineTo(cx - tw/2 + 1, y + 8 + th);
        ctx.arc(cx, y + 8 + th, tw/2 - 1, PI, 0);
        ctx.lineTo(cx + tw/2 - 1, y + 8 + th - lqH);
        ctx.closePath();
        ctx.fill();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Boiling Tube', color);
        break;
      }

      case 'sc-erlenmeyer': {
        const cx = x + w / 2;
        ctx.beginPath();
        ctx.moveTo(cx - 12, y + 10);
        ctx.lineTo(cx + 12, y + 10);
        ctx.lineTo(cx + 12, y + 36);
        ctx.lineTo(x + w - 14, y + h - 16);
        ctx.quadraticCurveTo(cx, y + h - 12, x + 14, y + h - 16);
        ctx.lineTo(cx - 12, y + 36);
        ctx.closePath();
        ctx.stroke();
        // Liquid
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.moveTo(x + 28, y + h * 0.65);
        ctx.lineTo(x + w - 28, y + h * 0.65);
        ctx.lineTo(x + w - 16, y + h - 16);
        ctx.quadraticCurveTo(cx, y + h - 12, x + 16, y + h - 16);
        ctx.closePath(); ctx.fill();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Conical Flask (Erlenmeyer)', color);
        break;
      }

      case 'sc-round-bottom-flask': {
        const cx = x + w / 2;
        const r = 36;
        const cy = y + h - 14 - r;
        ctx.beginPath();
        // Neck
        ctx.moveTo(cx - 10, y + 10);
        ctx.lineTo(cx + 10, y + 10);
        ctx.lineTo(cx + 10, cy - r * 0.7);
        // Bulb sphere
        ctx.arc(cx, cy, r, -Math.asin(10/r), PI + Math.asin(10/r));
        ctx.lineTo(cx - 10, y + 10);
        ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, y + 10, 13, 3, 0, 0, PI * 2); ctx.stroke();
        // Liquid
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.beginPath();
        ctx.arc(cx, cy, r - 2, 0, PI);
        ctx.fill();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Round-Bottom Flask', color);
        break;
      }

      case 'sc-volumetric-flask': {
        const cx = x + w / 2;
        // Stopper
        ctx.strokeRect(cx - 7, y + 4, 14, 10);
        // Long neck
        ctx.beginPath();
        ctx.moveTo(cx - 7, y + 14);
        ctx.lineTo(cx - 7, y + h * 0.52);
        ctx.quadraticCurveTo(x + 10, y + h - 14, cx, y + h - 14);
        ctx.quadraticCurveTo(x + w - 10, y + h - 14, cx + 7, y + h * 0.52);
        ctx.lineTo(cx + 7, y + 14);
        ctx.stroke();
        // Calibration ring
        ctx.beginPath(); ctx.moveTo(cx - 7, y + h * 0.35); ctx.lineTo(cx + 7, y + h * 0.35); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Volumetric Flask', color);
        break;
      }

      case 'sc-measuring-cylinder': {
        const cx = x + w / 2;
        const tw = 26;
        // Spout lip
        ctx.beginPath();
        ctx.moveTo(cx - tw/2 - 6, y + 8);
        ctx.lineTo(cx + tw/2, y + 8);
        ctx.lineTo(cx + tw/2, y + h - 18);
        // Base plate
        ctx.lineTo(cx + tw/2 + 14, y + h - 18);
        ctx.lineTo(cx + tw/2 + 14, y + h - 8);
        ctx.lineTo(cx - tw/2 - 14, y + h - 8);
        ctx.lineTo(cx - tw/2 - 14, y + h - 18);
        ctx.lineTo(cx - tw/2, y + h - 18);
        ctx.lineTo(cx - tw/2, y + 8);
        ctx.stroke();
        // Graduations
        for (let i = 1; i <= 6; i++) {
          const gy = y + 16 + i * (h - 40) / 7;
          ctx.beginPath(); ctx.moveTo(cx - tw/2, gy); ctx.lineTo(cx - tw/2 + 8, gy); ctx.stroke();
        }
        sciBadge(ctx, x + w / 2, y + h + 16, 'Measuring Cylinder', color);
        break;
      }

      case 'sc-burette': {
        const cx = x + w / 2;
        const tw = 18;
        // Tube
        ctx.beginPath();
        ctx.moveTo(cx - tw/2, y + 8); ctx.lineTo(cx + tw/2, y + 8);
        ctx.lineTo(cx + tw/2, y + h - 34);
        // Stopcock tap area
        ctx.lineTo(cx + 4, y + h - 34);
        ctx.lineTo(cx + 2, y + h - 10);
        ctx.lineTo(cx - 2, y + h - 10);
        ctx.lineTo(cx - 4, y + h - 34);
        ctx.lineTo(cx - tw/2, y + h - 34);
        ctx.closePath();
        ctx.stroke();
        // Stopcock handle
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx - 12, y + h - 28, 24, 6);
        // Graduations
        for (let i = 1; i <= 8; i++) {
          const gy = y + 14 + i * (h - 58) / 9;
          ctx.beginPath(); ctx.moveTo(cx - tw/2, gy); ctx.lineTo(cx - tw/2 + 6, gy); ctx.stroke();
        }
        sciBadge(ctx, x + w / 2, y + h + 16, 'Titration Burette', color);
        break;
      }

      case 'sc-pipette': {
        const cx = x + w / 2;
        // Long slender tube with central bulb
        ctx.beginPath();
        ctx.moveTo(cx - 4, y + 8); ctx.lineTo(cx + 4, y + 8);
        ctx.lineTo(cx + 4, y + h * 0.38);
        ctx.quadraticCurveTo(cx + 12, y + h * 0.45, cx + 12, y + h * 0.55);
        ctx.quadraticCurveTo(cx + 12, y + h * 0.65, cx + 4, y + h * 0.72);
        ctx.lineTo(cx + 2, y + h - 10);
        ctx.lineTo(cx - 2, y + h - 10);
        ctx.lineTo(cx - 4, y + h * 0.72);
        ctx.quadraticCurveTo(cx - 12, y + h * 0.65, cx - 12, y + h * 0.55);
        ctx.quadraticCurveTo(cx - 12, y + h * 0.45, cx - 4, y + h * 0.38);
        ctx.closePath();
        ctx.stroke();
        // Mark ring
        ctx.beginPath(); ctx.moveTo(cx - 4, y + h * 0.25); ctx.lineTo(cx + 4, y + h * 0.25); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Graduated Pipette', color);
        break;
      }

      case 'sc-funnel': {
        const cx = x + w / 2;
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 14);
        ctx.lineTo(x + w - 12, y + 14);
        ctx.lineTo(cx + 6, y + h * 0.55);
        ctx.lineTo(cx + 6, y + h - 14);
        ctx.lineTo(cx - 6, y + h - 10); // Angled cut
        ctx.lineTo(cx - 6, y + h * 0.55);
        ctx.closePath();
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Filter Funnel', color);
        break;
      }

      case 'sc-separating-funnel': {
        const cx = x + w / 2;
        // Stopper
        ctx.strokeRect(cx - 6, y + 6, 12, 10);
        // Pear bulb
        ctx.beginPath();
        ctx.moveTo(cx - 6, y + 16);
        ctx.quadraticCurveTo(x + 8, y + h * 0.4, cx, y + h * 0.68);
        ctx.lineTo(cx, y + h - 16);
        ctx.moveTo(cx, y + h * 0.68);
        ctx.quadraticCurveTo(x + w - 8, y + h * 0.4, cx + 6, y + 16);
        ctx.stroke();
        // Lower stem
        ctx.beginPath();
        ctx.moveTo(cx - 4, y + h * 0.68); ctx.lineTo(cx - 4, y + h - 8);
        ctx.moveTo(cx + 4, y + h * 0.68); ctx.lineTo(cx + 4, y + h - 8);
        ctx.stroke();
        // Stopcock
        ctx.fillStyle = '#ef4444'; ctx.fillRect(cx - 10, y + h * 0.76, 20, 5);
        // Two phase liquid
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.fillRect(cx - 18, y + h * 0.45, 36, 18);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Separating Funnel', color);
        break;
      }

      case 'sc-evaporating-dish': {
        const cx = x + w / 2;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 14);
        ctx.quadraticCurveTo(cx, y + h - 10, x + w - 10, y + 14);
        ctx.lineTo(x + w - 6, y + 14);
        ctx.quadraticCurveTo(cx, y + h - 6, x + 6, y + 14);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; ctx.fill(); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Evaporating Dish', color);
        break;
      }

      case 'sc-mortar-pestle': {
        const cx = x + w / 2;
        // Mortar bowl
        ctx.beginPath();
        ctx.moveTo(x + 14, y + 26);
        ctx.quadraticCurveTo(x + 10, y + h - 12, cx, y + h - 12);
        ctx.quadraticCurveTo(x + w - 10, y + h - 12, x + w - 14, y + 26);
        ctx.closePath();
        ctx.stroke();
        // Pestle rod angled inside
        ctx.save();
        ctx.translate(cx + 10, y + 24);
        ctx.rotate(-PI / 5);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-7, -24, 14, 48);
        ctx.strokeRect(-7, -24, 14, 48);
        ctx.restore();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Mortar and Pestle', color);
        break;
      }

      case 'sc-bunsen': {
        const cx = x + w / 2;
        // Heavy base
        ctx.strokeRect(cx - 24, y + h - 18, 48, 10);
        ctx.fillRect(cx - 24, y + h - 18, 48, 10);
        // Tube
        ctx.strokeRect(cx - 7, y + 44, 14, h - 62);
        // Air hole collar
        ctx.beginPath(); ctx.arc(cx, y + h - 34, 4, 0, PI * 2); ctx.stroke();
        // Flame
        ctx.beginPath();
        ctx.moveTo(cx - 8, y + 44);
        ctx.quadraticCurveTo(cx - 16, y + 20, cx, y + 8);
        ctx.quadraticCurveTo(cx + 16, y + 20, cx + 8, y + 44);
        ctx.closePath();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)'; ctx.fill();
        // Inner blue cone
        ctx.beginPath();
        ctx.moveTo(cx - 4, y + 44);
        ctx.quadraticCurveTo(cx - 8, y + 30, cx, y + 22);
        ctx.quadraticCurveTo(cx + 8, y + 30, cx + 4, y + 44);
        ctx.closePath();
        ctx.fillStyle = '#38bdf8'; ctx.fill();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Bunsen Burner', color);
        break;
      }

      case 'sc-tripod-stand': {
        const cx = x + w / 2;
        // Top ring & gauze
        ctx.strokeRect(x + 18, y + 18, w - 36, 8);
        ctx.fillStyle = '#94a3b844'; ctx.fillRect(x + 18, y + 18, w - 36, 8);
        // Gauze ceramic center
        ctx.beginPath(); ctx.arc(cx, y + 22, 10, 0, PI * 2); ctx.fill(); ctx.stroke();
        // 3 legs
        ctx.beginPath();
        ctx.moveTo(x + 24, y + 26); ctx.lineTo(x + 10, y + h - 10);
        ctx.moveTo(cx, y + 26); ctx.lineTo(cx, y + h - 10);
        ctx.moveTo(x + w - 24, y + 26); ctx.lineTo(x + w - 10, y + h - 10);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Tripod Stand & Gauze', color);
        break;
      }

      case 'sc-retort-stand': {
        // Base plate
        ctx.strokeRect(x + 10, y + h - 18, 56, 12);
        ctx.fillRect(x + 10, y + h - 18, 56, 12);
        // Vertical steel rod
        const rx = x + 30;
        ctx.beginPath(); ctx.moveTo(rx, y + h - 18); ctx.lineTo(rx, y + 12); ctx.stroke();
        // Bosshead clamp and ring arm
        ctx.fillStyle = '#38bdf8'; ctx.fillRect(rx - 5, y + 44, 10, 12);
        ctx.beginPath(); ctx.moveTo(rx + 5, y + 50); ctx.lineTo(x + w - 18, y + 50); ctx.stroke();
        // Clamp ring
        ctx.beginPath(); ctx.arc(x + w - 22, y + 50, 14, 0, PI * 2); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Retort Stand with Clamp', color);
        break;
      }

      case 'sc-condenser': {
        const my = y + h / 2;
        // Central inner vapor tube
        ctx.beginPath(); ctx.moveTo(x + 6, my); ctx.lineTo(x + w - 6, my); ctx.stroke();
        // Outer cooling water jacket
        ctx.strokeRect(x + 28, my - 14, w - 56, 28);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)'; ctx.fillRect(x + 28, my - 14, w - 56, 28);
        // Water inlet & outlet nozzles
        ctx.beginPath();
        ctx.moveTo(x + 40, my + 14); ctx.lineTo(x + 40, my + 26); // Water in
        ctx.moveTo(x + w - 40, my - 14); ctx.lineTo(x + w - 40, my - 26); // Water out
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Liebig Condenser', color);
        break;
      }

      case 'sc-thermometer': {
        const cx = x + w / 2;
        // Glass capillary stem
        ctx.strokeRect(cx - 5, y + 10, 10, h - 34);
        // Bottom mercury bulb
        ctx.beginPath(); ctx.arc(cx, y + h - 16, 10, 0, PI * 2);
        ctx.fillStyle = '#ef4444'; ctx.fill(); ctx.stroke();
        // Red mercury thread
        ctx.fillRect(cx - 2, y + 36, 4, h - 50);
        // Graduations
        ctx.strokeStyle = '#ef4444';
        for (let i = y + 20; i < y + h - 34; i += 12) {
          ctx.beginPath(); ctx.moveTo(cx + 5, i); ctx.lineTo(cx + 10, i); ctx.stroke();
        }
        sciBadge(ctx, x + w / 2, y + h + 16, 'Lab Thermometer (°C)', '#ef4444');
        break;
      }

      case 'sc-lab-balance': {
        const cx = x + w / 2;
        // Pan on top
        ctx.strokeRect(x + 24, y + 10, w - 48, 5);
        ctx.beginPath(); ctx.moveTo(cx, y + 15); ctx.lineTo(cx, y + 24); ctx.stroke();
        // Scale housing body
        ctx.strokeRect(x + 12, y + 24, w - 24, h - 34);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(x + 12, y + 24, w - 24, h - 34);
        // Digital display
        ctx.strokeRect(cx - 32, y + 32, 64, 20);
        ctx.fillStyle = '#0f172a'; ctx.fillRect(cx - 32, y + 32, 64, 20);
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#10b981'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('124.50 g', cx, y + 42);
        // Tare button
        ctx.beginPath(); ctx.arc(cx + 24, y + h - 16, 4, 0, PI * 2); ctx.fillStyle = '#f59e0b'; ctx.fill();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Digital Lab Balance', color);
        break;
      }

      // ── 05. MOLECULAR SHAPES & CHEMICAL NOTATION ──
      case 'sc-mol-linear': {
        const cy = y + h / 2;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x + 30, cy); ctx.lineTo(x + w - 30, cy); ctx.stroke();
        ctx.lineWidth = lw;
        // 3 atoms
        [x + 30, x + w / 2, x + w - 30].forEach((ax, idx) => {
          ctx.beginPath(); ctx.arc(ax, cy, idx === 1 ? 14 : 11, 0, PI * 2);
          ctx.fillStyle = idx === 1 ? '#ef4444' : '#38bdf8'; ctx.fill(); ctx.stroke();
        });
        sciBadge(ctx, x + w / 2, y + h + 16, 'Linear Molecule (180°)', color);
        break;
      }

      case 'sc-mol-bent': {
        const cx = x + w / 2, cy = y + 26;
        const ax1 = x + 30, ay1 = y + h - 24;
        const ax2 = x + w - 30, ay2 = y + h - 24;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(ax1, ay1);
        ctx.moveTo(cx, cy); ctx.lineTo(ax2, ay2);
        ctx.stroke();
        ctx.lineWidth = lw;
        // Central atom (Oxygen)
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, PI * 2);
        ctx.fillStyle = '#ef4444'; ctx.fill(); ctx.stroke();
        // H atoms
        ctx.beginPath(); ctx.arc(ax1, ay1, 10, 0, PI * 2); ctx.fillStyle = '#38bdf8'; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(ax2, ay2, 10, 0, PI * 2); ctx.fill(); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Bent Molecule (H₂O)', color);
        break;
      }

      case 'sc-mol-trigonal-planar': {
        const cx = x + w / 2, cy = y + h / 2 + 6;
        const r = 38;
        ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
          const ang = -PI / 2 + i * (2 * PI / 3);
          const ax = cx + r * Math.cos(ang), ay = cy + r * Math.sin(ang);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ax, ay); ctx.stroke();
          ctx.beginPath(); ctx.arc(ax, ay, 10, 0, PI * 2);
          ctx.fillStyle = '#10b981'; ctx.fill(); ctx.stroke();
        }
        ctx.lineWidth = lw;
        ctx.beginPath(); ctx.arc(cx, cy, 13, 0, PI * 2);
        ctx.fillStyle = '#f59e0b'; ctx.fill(); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Trigonal Planar (120°)', color);
        break;
      }

      case 'sc-mol-trigonal-pyramidal': {
        const cx = x + w / 2, cy = y + 30;
        const pts = [
          [x + 28, y + h - 22],
          [cx, y + h - 16],
          [x + w - 28, y + h - 22]
        ];
        ctx.lineWidth = 3.5;
        pts.forEach(([px, py]) => {
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
          ctx.beginPath(); ctx.arc(px, py, 10, 0, PI * 2);
          ctx.fillStyle = '#38bdf8'; ctx.fill(); ctx.stroke();
        });
        ctx.lineWidth = lw;
        // Central atom (N)
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, PI * 2);
        ctx.fillStyle = '#3b82f6'; ctx.fill(); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Trigonal Pyramidal (NH₃)', color);
        break;
      }

      case 'sc-mol-tetrahedral': {
        const cx = x + w / 2, cy = y + h / 2;
        // 4 bonds: up, left-down, wedge, dashed
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, y + 16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x + 24, y + h - 20); ctx.stroke();
        // Wedge bond (filled triangle)
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(x + w * 0.45, y + h - 16); ctx.lineTo(x + w * 0.58, y + h - 16);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Dashed bond
        ctx.save(); ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x + w - 24, y + h - 26); ctx.stroke();
        ctx.restore();
        ctx.lineWidth = lw;
        // Center atom C
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, PI * 2);
        ctx.fillStyle = '#334155'; ctx.fill(); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Tetrahedral (CH₄)', color);
        break;
      }

      case 'sc-mol-octahedral': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = 38;
        ctx.lineWidth = 3;
        // Axial
        ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
        // Equatorial square
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.8, cy - r * 0.3); ctx.lineTo(cx + r * 0.8, cy + r * 0.3);
        ctx.moveTo(cx - r * 0.8, cy + r * 0.3); ctx.lineTo(cx + r * 0.8, cy - r * 0.3);
        ctx.stroke();
        ctx.lineWidth = lw;
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, PI * 2);
        ctx.fillStyle = '#f59e0b'; ctx.fill(); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Octahedral (SF₆)', color);
        break;
      }

      case 'sc-atom-bohr': {
        const cx = x + w / 2, cy = y + h / 2;
        // Nucleus
        ctx.beginPath(); ctx.arc(cx, cy, 11, 0, PI * 2);
        ctx.fillStyle = '#ef4444'; ctx.fill(); ctx.stroke();
        // 3 Tilted elliptical orbits
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        [0, PI / 3, -PI / 3].forEach((ang) => {
          ctx.beginPath();
          ctx.ellipse(cx, cy, w * 0.40, h * 0.18, ang, 0, PI * 2);
          ctx.stroke();
          // Electron dot
          const ex = cx + (w * 0.40) * Math.cos(ang + PI/4);
          const ey = cy + (w * 0.40) * Math.sin(ang + PI/4);
          ctx.beginPath(); ctx.arc(ex, ey, 4.5, 0, PI * 2);
          ctx.fillStyle = '#38bdf8'; ctx.fill();
        });
        ctx.restore();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Bohr Atom Orbitals', color);
        break;
      }

      case 'sc-chem-arrow-forward': {
        const midY = y + h / 2;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x + 10, midY); ctx.lineTo(x + w - 14, midY); ctx.stroke();
        drawArrow(ctx, x + w - 28, midY, x + w - 10, midY, 12);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Reaction Arrow ⟶', color);
        break;
      }

      case 'sc-chem-arrow-equil': {
        const y1 = y + h / 2 - 6, y2 = y + h / 2 + 6;
        ctx.lineWidth = 2.4;
        // Top forward harpoon
        ctx.beginPath(); ctx.moveTo(x + 10, y1); ctx.lineTo(x + w - 14, y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - 24, y1 - 6); ctx.lineTo(x + w - 12, y1); ctx.stroke();
        // Bottom reverse harpoon
        ctx.beginPath(); ctx.moveTo(x + w - 10, y2); ctx.lineTo(x + 14, y2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 24, y2 + 6); ctx.lineTo(x + 12, y2); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Equilibrium Arrow ⇌', color);
        break;
      }

      case 'sc-chem-delta': {
        const cx = x + w / 2;
        ctx.beginPath();
        ctx.moveTo(cx, y + 10);
        ctx.lineTo(x + w - 10, y + h - 14);
        ctx.lineTo(x + 10, y + h - 14);
        ctx.closePath();
        ctx.fillStyle = '#ef444433'; ctx.fill(); ctx.stroke();
        ctx.font = '700 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ef4444'; ctx.fillText('Δ', cx, y + h / 2 + 4);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Heat Applied (Δ)', '#ef4444');
        break;
      }

      case 'sc-chem-gas-evolved': {
        const cx = x + w / 2;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, y + h - 14); ctx.lineTo(cx, y + 14); ctx.stroke();
        drawArrow(ctx, cx, y + 26, cx, y + 12, 12);
        // Gas vapor circles
        ctx.beginPath(); ctx.arc(cx - 10, y + 28, 4, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 10, y + 36, 5, 0, PI * 2); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Gas Evolved (↑)', color);
        break;
      }

      case 'sc-chem-precipitate': {
        const cx = x + w / 2;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, y + 14); ctx.lineTo(cx, y + h - 14); ctx.stroke();
        drawArrow(ctx, cx, y + h - 26, cx, y + h - 12, 12);
        // Precipitate flakes
        ctx.strokeRect(cx - 12, y + h - 34, 6, 6);
        ctx.strokeRect(cx + 8, y + h - 28, 6, 6);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Precipitate Formed (↓)', '#f59e0b');
        break;
      }

      // ── 06. BIOLOGY DIAGRAMS & CELL ORGANELLES ──
      case 'sc-animal-cell': {
        const cx = x + w / 2, cy = y + h / 2;
        // Membrane
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * 0.44, h * 0.42, 0, 0, PI * 2);
        ctx.fillStyle = 'rgba(236, 72, 153, 0.15)'; ctx.fill(); ctx.stroke();
        // Nucleus
        ctx.beginPath(); ctx.arc(cx - 8, cy - 4, 18, 0, PI * 2);
        ctx.fillStyle = '#a855f744'; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx - 8, cy - 4, 6, 0, PI * 2); ctx.fillStyle = '#a855f7'; ctx.fill();
        // Mitochondria & vacuoles
        ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.ellipse(cx + 26, cy + 12, 10, 5, PI/4, 0, PI * 2); ctx.fill();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Animal Cell & Organelles', '#ec4899');
        break;
      }

      case 'sc-plant-cell': {
        // Hexagonal rigid cell wall
        ctx.beginPath();
        ctx.moveTo(x + 22, y + 14);
        ctx.lineTo(x + w - 22, y + 14);
        ctx.lineTo(x + w - 10, y + h / 2);
        ctx.lineTo(x + w - 22, y + h - 14);
        ctx.lineTo(x + 22, y + h - 14);
        ctx.lineTo(x + 10, y + h / 2);
        ctx.closePath();
        ctx.lineWidth = 3.5; ctx.stroke();
        ctx.lineWidth = lw;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'; ctx.fill();
        // Large central vacuole
        const cx = x + w / 2, cy = y + h / 2;
        ctx.strokeRect(cx - 24, cy - 16, 48, 32);
        // Chloroplasts (green dots)
        ctx.fillStyle = '#10b981';
        [[-28, -18], [28, -18], [-28, 18], [28, 18]].forEach(([dx, dy]) => {
          ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 5, 0, PI * 2); ctx.fill();
        });
        sciBadge(ctx, x + w / 2, y + h + 16, 'Plant Cell (Chloroplasts)', '#10b981');
        break;
      }

      case 'sc-bacterial-cell': {
        const cx = x + w * 0.44, cy = y + h / 2;
        // Capsule pill body
        const bw = w * 0.52, bh = h * 0.50;
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(cx - bw/2, cy - bh/2, bw, bh, bh/2);
        else ctx.rect(cx - bw/2, cy - bh/2, bw, bh);
        ctx.fillStyle = '#eab30822'; ctx.fill(); ctx.stroke();
        ctx.lineWidth = lw;
        // Tangled nucleoid DNA loop inside
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy); ctx.bezierCurveTo(cx - 10, cy - 12, cx + 10, cy + 12, cx + 16, cy);
        ctx.bezierCurveTo(cx + 8, cy - 10, cx - 8, cy + 10, cx - 16, cy);
        ctx.stroke();
        // Flagellum tail (wavy)
        ctx.beginPath();
        ctx.moveTo(cx + bw/2, cy);
        ctx.bezierCurveTo(cx + bw/2 + 16, cy - 16, cx + bw/2 + 24, cy + 16, x + w - 8, cy);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Bacterial Cell', '#eab308');
        break;
      }

      case 'sc-nucleus': {
        const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.40;
        // Double membrane with pores
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r - 5, 0, PI * 2);
        ctx.save(); ctx.setLineDash([5, 3]); ctx.stroke(); ctx.restore();
        // Nucleolus inside
        ctx.beginPath(); ctx.arc(cx - 4, cy - 4, r * 0.42, 0, PI * 2);
        ctx.fillStyle = '#a855f7'; ctx.fill();
        // Chromatin threads
        ctx.beginPath();
        ctx.arc(cx + 8, cy + 8, r * 0.35, 0, PI); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Cell Nucleus & Nucleolus', '#a855f7');
        break;
      }

      case 'sc-mitochondrion': {
        const cx = x + w / 2, cy = y + h / 2;
        // Oval outer membrane
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * 0.42, h * 0.38, 0, 0, PI * 2);
        ctx.fillStyle = '#f9731622'; ctx.fill(); ctx.stroke();
        // Inner cristae convolutions
        ctx.beginPath();
        const startX = cx - w * 0.32;
        for (let i = 0; i < 5; i++) {
          const ix = startX + i * (w * 0.14);
          ctx.moveTo(ix, cy - 14); ctx.lineTo(ix, cy + 14);
        }
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Mitochondrion (Powerhouse)', '#f97316');
        break;
      }

      case 'sc-chloroplast': {
        const cx = x + w / 2, cy = y + h / 2;
        // Double membrane disc
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * 0.42, h * 0.36, 0, 0, PI * 2);
        ctx.fillStyle = '#10b98122'; ctx.fill(); ctx.stroke();
        // Grana thylakoid stacks
        [-24, 0, 24].forEach((dx) => {
          for (let dy = -10; dy <= 10; dy += 7) {
            ctx.fillStyle = '#10b981';
            ctx.fillRect(cx + dx - 6, cy + dy - 2, 12, 4);
          }
        });
        sciBadge(ctx, x + w / 2, y + h + 16, 'Chloroplast (Grana Stacks)', '#10b981');
        break;
      }

      case 'sc-neuron': {
        const sy = y + h / 2;
        const somaX = x + 34;
        // Soma cell body star
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const ang = i * (PI / 3);
          const r1 = 18, r2 = 9;
          const px = somaX + r1 * Math.cos(ang), py = sy + r1 * Math.sin(ang);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          const px2 = somaX + r2 * Math.cos(ang + PI/6), py2 = sy + r2 * Math.sin(ang + PI/6);
          ctx.lineTo(px2, py2);
        }
        ctx.closePath();
        ctx.fillStyle = '#06b6d433'; ctx.fill(); ctx.stroke();
        // Nucleus
        ctx.beginPath(); ctx.arc(somaX, sy, 5, 0, PI * 2); ctx.fillStyle = '#06b6d4'; ctx.fill();
        // Axon fiber
        ctx.beginPath(); ctx.moveTo(somaX + 16, sy); ctx.lineTo(x + w - 24, sy); ctx.stroke();
        // Myelin sheaths
        for (let mx = somaX + 22; mx < x + w - 38; mx += 26) {
          ctx.fillStyle = '#38bdf844';
          ctx.fillRect(mx, sy - 7, 20, 14);
          ctx.strokeRect(mx, sy - 7, 20, 14);
        }
        // Terminal arbor branches
        ctx.beginPath();
        ctx.moveTo(x + w - 24, sy); ctx.lineTo(x + w - 10, sy - 14);
        ctx.moveTo(x + w - 24, sy); ctx.lineTo(x + w - 8, sy);
        ctx.moveTo(x + w - 24, sy); ctx.lineTo(x + w - 10, sy + 14);
        ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Neuron Nerve Cell', color);
        break;
      }

      case 'sc-label-pointer': {
        const midY = y + h / 2;
        ctx.beginPath();
        ctx.arc(x + 12, midY + 12, 4, 0, PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 12, midY + 12);
        ctx.lineTo(x + 48, midY - 10);
        ctx.lineTo(x + w - 12, midY - 10);
        ctx.stroke();
        sciBadge(ctx, x + w / 2 + 10, midY - 18, 'Pointer Label', color);
        break;
      }

      // ── 07. HUMAN ANATOMY & GENETICS ──
      case 'sc-human-heart': {
        const cx = x + w / 2, cy = y + h / 2 + 6;
        const r = Math.min(w, h) * 0.36;
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.85);
        ctx.bezierCurveTo(cx - r * 1.3, cy - r * 0.2, cx - r * 0.7, cy - r * 0.95, cx, cy - r * 0.4);
        ctx.bezierCurveTo(cx + r * 0.7, cy - r * 0.95, cx + r * 1.3, cy - r * 0.2, cx, cy + r * 0.85);
        ctx.closePath();
        ctx.fillStyle = '#ef444433'; ctx.fill(); ctx.stroke();
        // Aorta & pulmonary artery pipes at top
        ctx.beginPath(); ctx.moveTo(cx - 8, cy - r * 0.4); ctx.lineTo(cx - 8, y + 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 8, cy - r * 0.4); ctx.lineTo(cx + 8, y + 10); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Human Heart (4 Chambers)', '#ef4444');
        break;
      }

      case 'sc-human-lungs': {
        const cx = x + w / 2;
        // Trachea pipe
        ctx.strokeRect(cx - 6, y + 10, 12, 28);
        // Bronchi branches
        ctx.beginPath();
        ctx.moveTo(cx - 6, y + 38); ctx.lineTo(cx - 24, y + 54);
        ctx.moveTo(cx + 6, y + 38); ctx.lineTo(cx + 24, y + 54);
        ctx.stroke();
        // Left & right lung lobes
        ctx.fillStyle = '#f43f5e26';
        // Left lung
        ctx.beginPath();
        ctx.ellipse(cx - 36, y + h * 0.58, 24, h * 0.32, -0.15, 0, PI * 2);
        ctx.fill(); ctx.stroke();
        // Right lung
        ctx.beginPath();
        ctx.ellipse(cx + 36, y + h * 0.58, 24, h * 0.32, 0.15, 0, PI * 2);
        ctx.fill(); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Lungs & Bronchi Tree', '#f43f5e');
        break;
      }

      case 'sc-human-brain': {
        const cx = x + w / 2, cy = y + h * 0.46;
        // Cerebrum outline
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * 0.42, h * 0.34, 0, 0, PI * 2);
        ctx.fillStyle = '#ec489922'; ctx.fill(); ctx.stroke();
        // Convoluted gyri & sulci lines
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy); ctx.quadraticCurveTo(cx - 10, cy - 14, cx + 10, cy - 4);
        ctx.quadraticCurveTo(cx + 30, cy + 8, cx + 42, cy);
        ctx.moveTo(cx - 20, cy + 12); ctx.quadraticCurveTo(cx, cy + 20, cx + 24, cy + 14);
        ctx.stroke();
        // Cerebellum & brainstem
        ctx.beginPath();
        ctx.arc(cx - 22, cy + 26, 12, 0, PI * 2);
        ctx.stroke();
        ctx.strokeRect(cx + 4, cy + 24, 12, 18);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Human Brain Diagram', '#ec4899');
        break;
      }

      case 'sc-human-eye': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) * 0.38;
        // Eyeball globe
        ctx.beginPath(); ctx.arc(cx, cy, r, -PI * 0.75, PI * 0.75); ctx.stroke();
        // Anterior cornea bulge
        ctx.beginPath();
        ctx.arc(cx - 6, cy, r * 0.72, -PI * 0.4, PI * 0.4);
        ctx.stroke();
        // Crystalline lens
        ctx.beginPath();
        ctx.ellipse(cx - 2, cy, 7, 18, 0, 0, PI * 2);
        ctx.fillStyle = '#38bdf844'; ctx.fill(); ctx.stroke();
        // Optic nerve stalk at back
        ctx.strokeRect(cx + r - 4, cy - 6, 18, 12);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Eye Optical Section', '#38bdf8');
        break;
      }

      case 'sc-human-kidney': {
        const cx = x + w / 2, cy = y + h / 2;
        // Renal bean silhouette
        ctx.beginPath();
        ctx.moveTo(cx + 10, cy - 38);
        ctx.quadraticCurveTo(cx - 38, cy, cx + 10, cy + 38);
        ctx.quadraticCurveTo(cx + 28, cy + 18, cx + 4, cy);
        ctx.quadraticCurveTo(cx + 28, cy - 18, cx + 10, cy - 38);
        ctx.fillStyle = '#b91c1c33'; ctx.fill(); ctx.stroke();
        // Ureter
        ctx.beginPath(); ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 28, cy + 34); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Kidney Cross-Section', '#b91c1c');
        break;
      }

      case 'sc-blood-cells': {
        const cx = x + w / 2;
        // Red blood cells (biconcave disc)
        ctx.fillStyle = '#ef444433';
        ctx.beginPath(); ctx.ellipse(cx - 24, y + 36, 20, 12, -0.2, 0, PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx - 24, y + 36, 10, 5, -0.2, 0, PI * 2); ctx.stroke();
        // White blood cell (leukocyte)
        ctx.fillStyle = '#f8fafc22';
        ctx.beginPath(); ctx.arc(cx + 26, y + 42, 18, 0, PI * 2); ctx.fill(); ctx.stroke();
        // Multi-lobed nucleus inside WBC
        ctx.fillStyle = '#a855f7';
        ctx.beginPath(); ctx.arc(cx + 20, y + 38, 5, 0, PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 30, y + 38, 5, 0, PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 26, y + 48, 5, 0, PI * 2); ctx.fill();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Red & White Blood Cells', '#ef4444');
        break;
      }

      case 'sc-dna-helix': {
        const midX = x + w / 2;
        const topY = y + 12, botY = y + h - 12;
        const turns = 3;
        const step = (botY - topY) / (turns * 2);
        const amp = w * 0.32;
        ctx.lineWidth = 2.2;
        for (let i = 0; i < turns * 2; i++) {
          const y1 = topY + i * step;
          const y2 = y1 + step;
          const sign = i % 2 === 0 ? 1 : -1;
          ctx.beginPath();
          ctx.moveTo(midX - amp * sign, y1);
          ctx.bezierCurveTo(midX, y1 + step/2, midX, y1 + step/2, midX + amp * sign, y2);
          ctx.stroke();
          // Base-pair rungs
          ctx.save(); ctx.lineWidth = 1.4; ctx.strokeStyle = (i % 2 === 0) ? '#f59e0b' : '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(midX - amp * 0.5 * sign, y1 + step * 0.5);
          ctx.lineTo(midX + amp * 0.5 * sign, y1 + step * 0.5);
          ctx.stroke();
          ctx.restore();
        }
        sciBadge(ctx, x + w / 2, y + h + 16, 'DNA Double Helix', '#06b6d4');
        break;
      }

      case 'sc-chromosome': {
        const cx = x + w / 2, cy = y + h / 2;
        const armH = h * 0.38, armW = 8;
        // X-shaped duplicated chromosome
        ctx.fillStyle = '#a855f733';
        // Left chromatid
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy - armH); ctx.lineTo(cx, cy); ctx.lineTo(cx - 16, cy + armH);
        ctx.lineTo(cx - 24, cy + armH); ctx.lineTo(cx - armW, cy); ctx.lineTo(cx - 24, cy - armH);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Right chromatid
        ctx.beginPath();
        ctx.moveTo(cx + 16, cy - armH); ctx.lineTo(cx, cy); ctx.lineTo(cx + 16, cy + armH);
        ctx.lineTo(cx + 24, cy + armH); ctx.lineTo(cx + armW, cy); ctx.lineTo(cx + 24, cy - armH);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Centromere
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, PI * 2);
        ctx.fillStyle = '#a855f7'; ctx.fill(); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Chromosome Structure', '#a855f7');
        break;
      }

      case 'sc-punnett-square': {
        const cx = x + w / 2, cy = y + h / 2;
        const sz = Math.min(w, h) * 0.68;
        const bx = cx - sz / 2, by = cy - sz / 2 + 6;
        ctx.strokeRect(bx, by, sz, sz);
        // Cross lines
        ctx.beginPath();
        ctx.moveTo(bx + sz/2, by); ctx.lineTo(bx + sz/2, by + sz);
        ctx.moveTo(bx, by + sz/2); ctx.lineTo(bx + sz, by + sz/2);
        ctx.stroke();
        // Allele text
        ctx.font = '700 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        // Parents
        ctx.fillText('B', bx + sz * 0.25, by - 8); ctx.fillText('b', bx + sz * 0.75, by - 8);
        ctx.fillText('B', bx - 8, by + sz * 0.25); ctx.fillText('b', bx - 8, by + sz * 0.75);
        // Offspring
        ctx.fillText('BB', bx + sz * 0.25, by + sz * 0.25);
        ctx.fillText('Bb', bx + sz * 0.75, by + sz * 0.25);
        ctx.fillText('Bb', bx + sz * 0.25, by + sz * 0.75);
        ctx.fillText('bb', bx + sz * 0.75, by + sz * 0.75);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Punnett Square (2×2)', color);
        break;
      }

      // ── 08. EARTH SCIENCE, ASTRONOMY & CYCLES ──
      case 'sc-earth': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) * 0.42;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'; ctx.fill(); ctx.stroke();
        // Continents
        ctx.fillStyle = '#10b981';
        ctx.beginPath(); ctx.arc(cx - 8, cy - 6, 8, 0, PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 12, cy + 8, 11, 0, PI * 2); ctx.fill();
        // Axis line
        ctx.save(); ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(cx - 15, y + 5); ctx.lineTo(cx + 15, y + h - 5); ctx.stroke();
        ctx.restore();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Earth Globe (23.5°)', '#38bdf8');
        break;
      }

      case 'sc-sun': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) * 0.28;
        // Solar rays
        const rays = 12;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.4;
        for (let i = 0; i < rays; i++) {
          const ang = i * (2 * PI / rays);
          ctx.beginPath();
          ctx.moveTo(cx + (r + 4) * Math.cos(ang), cy + (r + 4) * Math.sin(ang));
          ctx.lineTo(cx + (r + 14) * Math.cos(ang), cy + (r + 14) * Math.sin(ang));
          ctx.stroke();
        }
        // Sun core
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2);
        ctx.fillStyle = '#f59e0b'; ctx.fill(); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Sun & Solar Corona', '#f59e0b');
        break;
      }

      case 'sc-moon-phases': {
        const my = y + h / 2;
        const r = 12;
        const phases = [
          { name: 'New', lit: 0 },
          { name: '1st Q', lit: 0.5 },
          { name: 'Full', lit: 1.0 },
          { name: '3rd Q', lit: 0.5, inv: true }
        ];
        phases.forEach((p, idx) => {
          const mx = x + 24 + idx * (w - 48) / 3;
          ctx.beginPath(); ctx.arc(mx, my, r, 0, PI * 2);
          ctx.fillStyle = '#1e293b'; ctx.fill(); ctx.stroke();
          if (p.lit === 1.0) {
            ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(mx, my, r - 1, 0, PI * 2); ctx.fill();
          } else if (p.lit === 0.5) {
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.arc(mx, my, r - 1, p.inv ? PI/2 : -PI/2, p.inv ? -PI/2 : PI/2);
            ctx.fill();
          }
        });
        sciBadge(ctx, x + w / 2, y + h + 16, 'Moon Phases Diagram', '#cbd5e1');
        break;
      }

      case 'sc-solar-eclipse': {
        const my = y + h / 2;
        // Sun
        ctx.beginPath(); ctx.arc(x + 28, my, 22, 0, PI * 2);
        ctx.fillStyle = '#eab308'; ctx.fill(); ctx.stroke();
        // Moon
        ctx.beginPath(); ctx.arc(x + w * 0.52, my, 8, 0, PI * 2);
        ctx.fillStyle = '#334155'; ctx.fill(); ctx.stroke();
        // Earth
        ctx.beginPath(); ctx.arc(x + w - 24, my, 16, 0, PI * 2);
        ctx.fillStyle = '#38bdf8'; ctx.fill(); ctx.stroke();
        // Shadow cone (umbra)
        ctx.save(); ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x + 28, my - 22); ctx.lineTo(x + w - 24, my);
        ctx.moveTo(x + 28, my + 22); ctx.lineTo(x + w - 24, my);
        ctx.stroke();
        ctx.restore();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Solar Eclipse Alignment', '#eab308');
        break;
      }

      case 'sc-orbit': {
        const cx = x + w / 2, cy = y + h / 2;
        // Elliptical path
        ctx.save(); ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.44, h * 0.36, 0, 0, PI * 2); ctx.stroke();
        ctx.restore();
        // Sun at focal point
        ctx.beginPath(); ctx.arc(cx - 28, cy, 10, 0, PI * 2);
        ctx.fillStyle = '#f59e0b'; ctx.fill(); ctx.stroke();
        // Planet on orbit
        ctx.beginPath(); ctx.arc(cx + 36, cy - h * 0.26, 6, 0, PI * 2);
        ctx.fillStyle = '#38bdf8'; ctx.fill(); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Planetary Orbit', color);
        break;
      }

      case 'sc-telescope': {
        const cx = x + w / 2;
        // Tripod legs
        ctx.beginPath();
        ctx.moveTo(cx, y + 48); ctx.lineTo(cx - 28, y + h - 12);
        ctx.moveTo(cx, y + 48); ctx.lineTo(cx + 28, y + h - 12);
        ctx.moveTo(cx, y + 48); ctx.lineTo(cx, y + h - 12);
        ctx.stroke();
        // Telescope barrel angled at 25°
        ctx.save();
        ctx.translate(cx, y + 46);
        ctx.rotate(-0.4);
        ctx.strokeRect(-46, -8, 88, 16);
        ctx.fillStyle = '#94a3b833'; ctx.fillRect(-46, -8, 88, 16);
        // Objective hood
        ctx.strokeRect(36, -11, 14, 22);
        ctx.restore();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Astronomical Telescope', color);
        break;
      }

      case 'sc-volcano': {
        const cx = x + w / 2;
        // Volcanic mountain cone
        ctx.beginPath();
        ctx.moveTo(x + 10, y + h - 14);
        ctx.lineTo(cx - 16, y + 42);
        ctx.lineTo(cx + 16, y + 42);
        ctx.lineTo(x + w - 10, y + h - 14);
        ctx.closePath();
        ctx.fillStyle = '#78350f33'; ctx.fill(); ctx.stroke();
        // Central magma conduit pipe
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx - 4, y + 42, 8, h - 56);
        // Caldera smoke / lava plume
        ctx.beginPath();
        ctx.arc(cx, y + 26, 16, 0, PI * 2);
        ctx.fillStyle = '#ef444466'; ctx.fill();
        sciBadge(ctx, x + w / 2, y + h + 16, 'Volcano Conduit', '#ef4444');
        break;
      }

      case 'sc-water-cycle': {
        const cx = x + w / 2;
        // Mountain & lake
        ctx.beginPath();
        ctx.moveTo(x + 10, y + h - 14);
        ctx.lineTo(x + 50, y + 48);
        ctx.lineTo(cx + 10, y + h - 14);
        ctx.stroke();
        // Water body
        ctx.fillStyle = '#0284c733';
        ctx.fillRect(cx + 10, y + h - 22, w/2 - 20, 12);
        // Cloud at top
        ctx.beginPath();
        ctx.arc(cx + 10, y + 24, 12, 0, PI * 2);
        ctx.arc(cx + 26, y + 22, 14, 0, PI * 2);
        ctx.arc(cx + 42, y + 24, 12, 0, PI * 2);
        ctx.fillStyle = '#cbd5e1'; ctx.fill();
        // Rain arrows down
        drawArrow(ctx, cx + 26, y + 40, cx + 26, y + 58, 6);
        // Evaporation arrow up
        drawArrow(ctx, x + w - 28, y + h - 24, x + w - 28, y + 48, 6);
        sciBadge(ctx, x + w / 2, y + h + 16, 'Water Cycle Diagram', color);
        break;
      }

      case 'sc-earth-layers': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) * 0.42;
        // Concentric layers
        const layers = [
          { r: r, color: '#78350f', name: 'Crust' },
          { r: r * 0.78, color: '#d97706', name: 'Mantle' },
          { r: r * 0.50, color: '#f59e0b', name: 'Outer Core' },
          { r: r * 0.24, color: '#ef4444', name: 'Inner Core' }
        ];
        layers.forEach(l => {
          ctx.beginPath(); ctx.arc(cx, cy, l.r, 0, PI * 2);
          ctx.fillStyle = l.color; ctx.fill(); ctx.stroke();
        });
        sciBadge(ctx, x + w / 2, y + h + 16, 'Earth Internal Layers', '#d97706');
        break;
      }

      // ── 09. SCIENTIFIC SYMBOLS, GREEK LETTERS & UNITS ──
      case 'sc-sym-alpha':
      case 'sc-sym-beta':
      case 'sc-sym-gamma':
      case 'sc-sym-theta':
      case 'sc-sym-lambda':
      case 'sc-sym-omega': {
        const cx = x + w / 2, cy = y + h / 2;
        const glyphs = {
          'sc-sym-alpha': 'α',
          'sc-sym-beta': 'β',
          'sc-sym-gamma': 'γ',
          'sc-sym-theta': 'θ',
          'sc-sym-lambda': 'λ',
          'sc-sym-omega': 'Ω'
        };
        // Circular badge backing
        ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.42, 0, PI * 2);
        ctx.fillStyle = color + '15'; ctx.fill(); ctx.stroke();
        ctx.font = '700 30px "JetBrains Mono", serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.fillText(glyphs[s.type] || '?', cx, cy);
        break;
      }

      case 'sc-sym-si-units': {
        ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.12)'; ctx.fillRect(x + 10, y + 10, w - 20, h - 20);
        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#10b981';
        ctx.fillText('SI BASE UNITS', x + w / 2, y + 24);
        ctx.font = '500 10.5px monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('m · kg · s · A · K · mol · cd', x + w / 2, y + 46);
        sciBadge(ctx, x + w / 2, y + h - 8, 'ISO / BIPM', color);
        break;
      }

      // ── 10. SAFETY SYMBOLS ──
      case 'sc-safe-flammable':
      case 'sc-safe-toxic':
      case 'sc-safe-corrosive':
      case 'sc-safe-explosive':
      case 'sc-safe-biohazard':
      case 'sc-safe-radiation': {
        const cx = x + w / 2, cy = y + h / 2 - 4;
        const sz = Math.min(w, h) * 0.40;
        // GHS Diamond
        ctx.beginPath();
        ctx.moveTo(cx, cy - sz);
        ctx.lineTo(cx + sz, cy);
        ctx.lineTo(cx, cy + sz);
        ctx.lineTo(cx - sz, cy);
        ctx.closePath();
        ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = '#ef4444'; ctx.stroke();
        // Icon symbol
        ctx.font = '700 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#0f172a';
        const glyphs = {
          'sc-safe-flammable': '🔥',
          'sc-safe-toxic': '☠️',
          'sc-safe-corrosive': '🧪',
          'sc-safe-explosive': '💥',
          'sc-safe-biohazard': '☣️',
          'sc-safe-radiation': '☢️'
        };
        ctx.fillText(glyphs[s.type] || '⚠️', cx, cy);
        sciBadge(ctx, cx, y + h - 4, s.label || 'Safety Hazard', '#ef4444');
        break;
      }

      case 'sc-safe-high-voltage': {
        const cx = x + w / 2, cy = y + h / 2 - 4;
        const sz = Math.min(w, h) * 0.40;
        // Warning triangle (yellow)
        ctx.beginPath();
        ctx.moveTo(cx, cy - sz);
        ctx.lineTo(cx + sz * 1.1, cy + sz * 0.9);
        ctx.lineTo(cx - sz * 1.1, cy + sz * 0.9);
        ctx.closePath();
        ctx.fillStyle = '#eab308'; ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = '#0f172a'; ctx.stroke();
        // Lightning bolt
        ctx.font = '700 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('⚡', cx, cy + 4);
        sciBadge(ctx, cx, y + h - 4, 'High Voltage', '#eab308');
        break;
      }

      // Default fallback
      default: {
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6); else ctx.rect(x, y, w, h);
        ctx.fill(); ctx.stroke();
        sciBadge(ctx, x + w / 2, y + h / 2, s.label || s.type, color);
        break;
      }
    }

    if (s.selected) {
      selectionHandles(ctx, x, y, w, h);
    }

    ctx.restore();
  }

  return {
    SCIENCE_SHAPE_DEFS,
    isScienceShape,
    getBounds,
    draw
  };
})();
