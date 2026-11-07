'use strict';

// ══════════════════════════════════════════════════════════════════════════════
// PIYUSHDHARA EDUVERSE BOARD — ENGINEERING SYMBOLS & SHAPES LIBRARY
// Comprehensive ISO, IEC, ASME, IEEE, ISA Standards-Compliant Technical Vector Library
// Civil, Mechanical, Electrical, Electronics, Chemical/P&ID, Computer, Aero & Bio
// ══════════════════════════════════════════════════════════════════════════════

const EngineeringShapes = (() => {
  const PI = Math.PI;

  // ── Technical Engineering Badge (Standards-Compliant Font & Frame) ──
  function engBadge(ctx, x, y, text, color = '#38bdf8', standard = '') {
    if (!text) return;
    ctx.save();
    ctx.setLineDash([]);
    ctx.font = '700 11.5px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelText = standard ? `${text} [${standard}]` : text;
    const tw = ctx.measureText(labelText).width;
    const pw = tw + 16, ph = 22;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(11, 19, 41, 0.96)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - pw/2, y - ph/2, pw, ph, 5);
    else ctx.rect(x - pw/2, y - ph/2, pw, ph);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    const strokeColor = color && color !== '#000000' && color !== '#0f172a' && color !== '#1e293b' ? color : '#38bdf8';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(labelText, x, y);
    ctx.restore();
  }

  // ── Selection Bounding Box & Handles ──
  function selectionHandles(ctx, bx, by, bw, bh) {
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(bx - 6, by - 6, bw + 12, bh + 12);
    ctx.setLineDash([]);
    const pts = [
      [bx - 6, by - 6], [bx - 6 + bw/2 + 6, by - 6], [bx + bw + 6, by - 6],
      [bx - 6, by - 6 + bh/2 + 6],                   [bx + bw + 6, by - 6 + bh/2 + 6],
      [bx - 6, by + bh + 6], [bx - 6 + bw/2 + 6, by + bh + 6], [bx + bw + 6, by + bh + 6]
    ];
    pts.forEach(([hx, hy]) => {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(hx, hy, 7, 0, PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.restore();
  }

  // ── Helper: Draw Standard Drafting Arrowhead ──
  function drawArrow(ctx, fromX, fromY, toX, toY, size = 11, filled = true) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - size * Math.cos(angle - PI / 7), toY - size * Math.sin(angle - PI / 7));
    if (filled) {
      ctx.lineTo(toX - size * 0.7 * Math.cos(angle), toY - size * 0.7 * Math.sin(angle));
      ctx.lineTo(toX - size * Math.cos(angle + PI / 7), toY - size * Math.sin(angle + PI / 7));
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - size * Math.cos(angle + PI / 7), toY - size * Math.sin(angle + PI / 7));
    }
    ctx.stroke();
  }

  // ── Helper: Draw Feature Control Frame (GD&T) ──
  function drawGDTFrame(ctx, x, y, symbol, tol, datum = 'A') {
    ctx.save();
    ctx.font = '700 13px "JetBrains Mono", monospace';
    const symW = 28, tolW = 54, datW = datum ? 28 : 0;
    const totalW = symW + tolW + datW;
    const h = 26;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(x, y, totalW, h);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(x, y, totalW, h);
    // Dividers
    ctx.beginPath();
    ctx.moveTo(x + symW, y); ctx.lineTo(x + symW, y + h);
    if (datum) {
      ctx.moveTo(x + symW + tolW, y); ctx.lineTo(x + symW + tolW, y + h);
    }
    ctx.stroke();
    // Texts
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x + symW / 2, y + h / 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(tol, x + symW + tolW / 2, y + h / 2);
    if (datum) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(datum, x + symW + tolW + datW / 2, y + h / 2);
    }
    ctx.restore();
  }

  // ── Helper: Draw P&ID Instrument Bubble (ISA-5.1) ──
  function drawPIDBubble(ctx, cx, cy, r, tag, num, isDCS = false, isPanel = false) {
    ctx.save();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    if (isDCS) {
      ctx.strokeRect(cx - r - 2, cy - r - 2, (r + 2) * 2, (r + 2) * 2);
      ctx.fillRect(cx - r - 2, cy - r - 2, (r + 2) * 2, (r + 2) * 2);
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, PI * 2);
    ctx.fill(); ctx.stroke();
    if (isPanel) {
      ctx.beginPath();
      ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
      ctx.stroke();
    }
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(tag, cx, cy - r * 0.38);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(num, cx, cy + r * 0.42);
    ctx.restore();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COMPLETE ENGINEERING SHAPE DEFINITIONS
  // ══════════════════════════════════════════════════════════════════════════
  const ENGINEERING_SHAPE_DEFS = {
    // ── 1. TECHNICAL DRAWING & DRAFTING (ISO 128 / ASME Y14) ──
    'eng-line-visible':       { w: 180, h: 40,  label: 'Visible Object Line',  cat: 'drafting', standard: 'ISO 128', desc: 'Thick continuous line for visible edges' },
    'eng-line-hidden':        { w: 180, h: 40,  label: 'Hidden Line',          cat: 'drafting', standard: 'ISO 128', desc: 'Dashed line [6,4] for concealed contours' },
    'eng-line-center':        { w: 180, h: 40,  label: 'Center Line',          cat: 'drafting', standard: 'ISO 128', desc: 'Long dash - dot - long dash axis' },
    'eng-line-cutting':       { w: 190, h: 60,  label: 'Cutting-Plane Line',   cat: 'drafting', standard: 'ASME Y14.3', desc: 'Section cut plane with viewing arrows' },
    'eng-line-break':         { w: 180, h: 40,  label: 'Break Line',           cat: 'drafting', standard: 'ISO 128', desc: 'Long break line with zigzag/heartbeat' },
    'eng-dim-linear':         { w: 200, h: 54,  label: 'Linear Dimension',     cat: 'drafting', standard: 'ISO 129', desc: 'Dual arrow dimension line with measurement' },
    'eng-dim-diameter':       { w: 160, h: 70,  label: 'Diameter Callout ⌀',   cat: 'drafting', standard: 'ISO 129', desc: 'Diameter dimension with ⌀ glyph and leader' },
    'eng-dim-radius':         { w: 150, h: 70,  label: 'Radius Callout R',     cat: 'drafting', standard: 'ISO 129', desc: 'Radial dimension from arc center' },
    'eng-hole-callout':       { w: 180, h: 64,  label: 'Hole & C-Bore Callout',cat: 'drafting', standard: 'ASME Y14.5', desc: 'Standard hole depth & counterbore symbol' },
    'eng-proj-first-angle':   { w: 140, h: 80,  label: 'First-Angle Proj.',    cat: 'drafting', standard: 'ISO 5456', desc: 'Truncated cone & circles (European standard)' },
    'eng-proj-third-angle':   { w: 140, h: 80,  label: 'Third-Angle Proj.',    cat: 'drafting', standard: 'ASME Y14.3', desc: 'Circles & truncated cone (US standard)' },
    'eng-gdt-flatness':       { w: 160, h: 60,  label: 'GD&T Flatness ⏤',      cat: 'drafting', standard: 'ISO 1101', desc: 'Form tolerance: perfectly planar surface' },
    'eng-gdt-perpendicular':  { w: 160, h: 60,  label: 'GD&T Perpendicular ⟂', cat: 'drafting', standard: 'ISO 1101', desc: 'Orientation tolerance relative to datum A' },
    'eng-gdt-parallelism':    { w: 160, h: 60,  label: 'GD&T Parallelism ⫽',   cat: 'drafting', standard: 'ISO 1101', desc: 'Orientation tolerance relative to datum B' },
    'eng-gdt-position':       { w: 180, h: 60,  label: 'GD&T True Position ⌖', cat: 'drafting', standard: 'ASME Y14.5', desc: 'Location tolerance at MMC (Maximum Material)' },
    'eng-gdt-runout':         { w: 160, h: 60,  label: 'GD&T Runout ↗',        cat: 'drafting', standard: 'ISO 1101', desc: 'Circular runout inspection relative to datum' },
    'eng-datum-feature':      { w: 120, h: 60,  label: 'Datum Feature [A]',    cat: 'drafting', standard: 'ASME Y14.5', desc: 'Filled datum triangle and boxed reference letter' },
    'eng-weld-fillet':        { w: 150, h: 70,  label: 'Fillet Weld Symbol',   cat: 'drafting', standard: 'AWS A2.4 / ISO 2553', desc: 'Right triangle on reference line' },
    'eng-weld-vgroove':       { w: 150, h: 70,  label: 'V-Groove Weld',        cat: 'drafting', standard: 'AWS A2.4 / ISO 2553', desc: 'V butt weld symbol on reference leader' },
    'eng-surface-finish':     { w: 120, h: 70,  label: 'Surface Finish Ra',    cat: 'drafting', standard: 'ISO 1302', desc: 'Machined roughness symbol with Ra value' },

    // ── 2. ELECTRICAL ENGINEERING & POWER (IEC 60617 / IEEE 315) ──
    'eng-resistor-iec':       { w: 130, h: 50,  label: 'Resistor (IEC)',       cat: 'electrical', standard: 'IEC 60617', desc: 'Clean European standard rectangular resistor' },
    'eng-resistor-ieee':      { w: 140, h: 50,  label: 'Resistor (IEEE Zigzag)',cat: 'electrical', standard: 'IEEE 315', desc: 'American standard zigzag wire resistor' },
    'eng-potentiometer':      { w: 140, h: 70,  label: 'Potentiometer',        cat: 'electrical', standard: 'IEC 60617', desc: '3-terminal variable voltage divider resistor' },
    'eng-capacitor-pol':      { w: 130, h: 60,  label: 'Polarized Capacitor',  cat: 'electrical', standard: 'IEC 60617', desc: 'Electrolytic capacitor with polarity marker' },
    'eng-transformer-iron':   { w: 150, h: 90,  label: 'Iron-Core Transformer',cat: 'electrical', standard: 'IEC 60617', desc: 'Dual coupled inductors with laminated core' },
    'eng-generator-3ph':      { w: 120, h: 100, label: '3-Phase Generator',    cat: 'electrical', standard: 'IEC 60617', desc: 'Synchronous alternator (G 3~)' },
    'eng-motor-induction':    { w: 120, h: 100, label: '3-Phase Motor',        cat: 'electrical', standard: 'IEC 60617', desc: 'Squirrel cage induction motor (M 3~)' },
    'eng-transformer-power':  { w: 150, h: 100, label: 'Power Transformer Δ-Y',cat: 'electrical', standard: 'IEC 60617', desc: 'Substation delta-wye power transformer' },
    'eng-busbar':             { w: 180, h: 60,  label: 'Electrical Busbar',    cat: 'electrical', standard: 'IEC 60617', desc: 'High current heavy copper distribution bus' },
    'eng-breaker-hv':         { w: 120, h: 70,  label: 'Circuit Breaker (CB)', cat: 'electrical', standard: 'IEC 60617', desc: 'HV SF6 / vacuum circuit interrupter' },
    'eng-isolator-switch':    { w: 130, h: 60,  label: 'Disconnector / Isolator',cat: 'electrical', standard: 'IEC 60617', desc: 'Off-load visible air-break disconnect switch' },
    'eng-earth-ground':       { w: 100, h: 80,  label: 'Protective Ground PE', cat: 'electrical', standard: 'IEC 60617', desc: 'Protective earth safety ground terminal' },
    'eng-lightning-arrester': { w: 100, h: 90,  label: 'Surge Arrester',       cat: 'electrical', standard: 'IEC 60617', desc: 'Overvoltage MOV surge protection' },
    'eng-trans-tower':        { w: 110, h: 140, label: 'Transmission Tower',   cat: 'electrical', standard: 'IEC 60617', desc: 'HV overhead power grid pylon tower' },
    'eng-contact-no':         { w: 120, h: 60,  label: 'NO Contact',           cat: 'electrical', standard: 'IEC 60617', desc: 'Normally open switching contact' },
    'eng-contact-nc':         { w: 120, h: 60,  label: 'NC Contact',           cat: 'electrical', standard: 'IEC 60617', desc: 'Normally closed switching contact' },
    'eng-relay-coil':         { w: 130, h: 70,  label: 'Contactor / Relay Coil',cat: 'electrical', standard: 'IEC 60617', desc: 'Electromagnetic control actuator coil' },
    'eng-estop-btn':          { w: 110, h: 80,  label: 'Emergency Stop (E-Stop)',cat: 'electrical', standard: 'ISO 13850', desc: 'Mushroom head safety emergency latch button' },

    // ── 3. ELECTRONICS, SEMICONDUCTORS & LOGIC (IEC / IEEE) ──
    'eng-opamp':              { w: 150, h: 90,  label: 'Operational Amplifier',cat: 'electronics', standard: 'IEEE 315', desc: 'Op-Amp with inverting, non-inverting & output' },
    'eng-comparator':         { w: 150, h: 90,  label: 'Voltage Comparator',   cat: 'electronics', standard: 'IEEE 315', desc: 'High-speed analog comparator' },
    'eng-timer-555':          { w: 150, h: 120, label: '555 Timer IC',         cat: 'electronics', standard: 'Industry Std', desc: '8-pin classic analog/digital timing circuit' },
    'eng-crystal-osc':        { w: 120, h: 60,  label: 'Quartz Crystal',       cat: 'electronics', standard: 'IEC 60617', desc: 'Piezoelectric clock oscillator resonator' },
    'eng-transistor-pnp':     { w: 110, h: 90,  label: 'PNP BJT Transistor',   cat: 'electronics', standard: 'IEC 60617', desc: 'Bipolar junction transistor with inward emitter' },
    'eng-mosfet-nchan':       { w: 120, h: 100, label: 'N-Channel MOSFET',     cat: 'electronics', standard: 'IEEE 315', desc: 'Enhancement mode field-effect power transistor' },
    'eng-mosfet-pchan':       { w: 120, h: 100, label: 'P-Channel MOSFET',     cat: 'electronics', standard: 'IEEE 315', desc: 'P-channel enhancement mode MOSFET' },
    'eng-igbt':               { w: 120, h: 100, label: 'IGBT Transistor',      cat: 'electronics', standard: 'IEC 60617', desc: 'Insulated Gate Bipolar Transistor for power drives' },
    'eng-scr-thyristor':      { w: 130, h: 80,  label: 'SCR Thyristor',        cat: 'electronics', standard: 'IEC 60617', desc: 'Silicon Controlled Rectifier with gate trigger' },
    'eng-bridge-rectifier':   { w: 130, h: 110, label: 'Bridge Rectifier',     cat: 'electronics', standard: 'IEC 60617', desc: 'Full-wave AC to DC 4-diode rectifier bridge' },
    'eng-optocoupler':        { w: 140, h: 80,  label: 'Optocoupler IC',       cat: 'electronics', standard: 'IEC 60617', desc: 'Optical isolator with LED & phototransistor' },
    'eng-logic-and':          { w: 130, h: 60,  label: 'AND Logic Gate',       cat: 'electronics', standard: 'IEEE Std 91', desc: 'Standard 2-input boolean AND function' },
    'eng-logic-or':           { w: 130, h: 60,  label: 'OR Logic Gate',        cat: 'electronics', standard: 'IEEE Std 91', desc: 'Standard 2-input boolean OR function' },
    'eng-logic-not':          { w: 120, h: 50,  label: 'NOT Inverter Gate',    cat: 'electronics', standard: 'IEEE Std 91', desc: 'Logic NOT inverter with bubble' },
    'eng-logic-nand':         { w: 135, h: 60,  label: 'NAND Logic Gate',      cat: 'electronics', standard: 'IEEE Std 91', desc: 'Universal NAND logic gate' },
    'eng-logic-nor':          { w: 135, h: 60,  label: 'NOR Logic Gate',       cat: 'electronics', standard: 'IEEE Std 91', desc: 'Universal NOR logic gate' },
    'eng-logic-xor':          { w: 140, h: 60,  label: 'XOR Logic Gate',       cat: 'electronics', standard: 'IEEE Std 91', desc: 'Exclusive-OR modulo-2 adder gate' },
    'eng-logic-xnor':         { w: 145, h: 60,  label: 'XNOR Logic Gate',      cat: 'electronics', standard: 'IEEE Std 91', desc: 'Exclusive-NOR equivalence gate' },
    'eng-flipflop-d':         { w: 120, h: 90,  label: 'D Flip-Flop',          cat: 'electronics', standard: 'IEEE Std 91', desc: 'Data latch with clock, Q, and Q-bar' },

    // ── 4. MECHANICAL, HYDRAULICS & PNEUMATICS (ISO 1219 / ISO 128) ──
    'eng-gear-spur':          { w: 120, h: 120, label: 'Spur Gear Mesh',       cat: 'mechanical', standard: 'ISO 128', desc: 'Involute spur gear with pitch & root diameters' },
    'eng-gear-bevel':         { w: 120, h: 110, label: 'Bevel Gear (90°)',     cat: 'mechanical', standard: 'ISO 128', desc: 'Conical gear for intersecting perpendicular shafts' },
    'eng-rack-pinion':        { w: 160, h: 100, label: 'Rack & Pinion',        cat: 'mechanical', standard: 'ISO 128', desc: 'Rotary-to-linear gear transmission mechanism' },
    'eng-bearing-ball':       { w: 120, h: 120, label: 'Ball Bearing',         cat: 'mechanical', standard: 'ISO 128', desc: 'Deep groove ball bearing cross section' },
    'eng-pulley-belt':        { w: 180, h: 90,  label: 'Pulley & Belt Drive',  cat: 'mechanical', standard: 'ISO 128', desc: 'Dual pulley system with V-belt tension direction' },
    'eng-chain-sprocket':     { w: 180, h: 90,  label: 'Chain & Sprocket',     cat: 'mechanical', standard: 'ISO 128', desc: 'Roller chain transmission with sprocket teeth' },
    'eng-spring-damper':      { w: 140, h: 110, label: 'Spring-Damper (1-DOF)',cat: 'mechanical', standard: 'ISO 128', desc: 'Parallel helical coil spring and fluid dashpot' },
    'eng-shaft-coupling':     { w: 140, h: 80,  label: 'Shaft Coupling',       cat: 'mechanical', standard: 'ISO 128', desc: 'Flanged rigid/flexible torque shaft connection' },
    'eng-disc-brake':         { w: 120, h: 120, label: 'Disc Brake & Caliper', cat: 'mechanical', standard: 'ISO 128', desc: 'Ventilated rotor disc with hydraulic caliper pads' },
    'eng-hyd-pump':           { w: 110, h: 100, label: 'Hydraulic Pump',       cat: 'mechanical', standard: 'ISO 1219', desc: 'Fixed displacement hydraulic power unit pump' },
    'eng-air-compressor':     { w: 110, h: 100, label: 'Air Compressor',       cat: 'mechanical', standard: 'ISO 1219', desc: 'Pneumatic power source compressor' },
    'eng-cyl-single':         { w: 160, h: 70,  label: 'Single-Acting Cyl.',   cat: 'mechanical', standard: 'ISO 1219', desc: 'Single-acting pneumatic cylinder with spring return' },
    'eng-cyl-double':         { w: 170, h: 70,  label: 'Double-Acting Cyl.',   cat: 'mechanical', standard: 'ISO 1219', desc: 'Double-acting hydraulic cylinder with dual ports' },
    'eng-valv-dir-4-2':       { w: 140, h: 80,  label: '4/2 DCV Valve',        cat: 'mechanical', standard: 'ISO 1219', desc: '4-port 2-position directional control valve' },
    'eng-valv-dir-4-3':       { w: 180, h: 80,  label: '4/3 Centered DCV',     cat: 'mechanical', standard: 'ISO 1219', desc: '4-port 3-position valve with closed center' },
    'eng-valv-relief':        { w: 110, h: 90,  label: 'Pressure Relief Valve',cat: 'mechanical', standard: 'ISO 1219', desc: 'Direct-operated hydraulic relief valve' },
    'eng-frl-unit':           { w: 160, h: 90,  label: 'FRL Air Service Unit', cat: 'mechanical', standard: 'ISO 1219', desc: 'Filter, pressure regulator & lubricator unit' },
    'eng-pressure-gauge':     { w: 100, h: 110, label: 'Pressure Gauge',       cat: 'mechanical', standard: 'ISO 1219', desc: 'Bourdon tube circular dial pressure gauge' },
    'eng-joint-revolute':     { w: 100, h: 80,  label: 'Revolute Pin Joint',   cat: 'mechanical', standard: 'Kinematics', desc: '1-DOF rotational pin hinge connection' },
    'eng-four-bar':           { w: 180, h: 110, label: 'Four-Bar Linkage',     cat: 'mechanical', standard: 'Kinematics', desc: 'Planar 4-bar crank, coupler, rocker mechanism' },

    // ── 5. CIVIL, STRUCTURAL & ARCHITECTURAL ──
    'eng-beam-i':             { w: 100, h: 130, label: 'Steel I-Beam (W-Shape)',cat: 'civil', standard: 'AISC / Eurocode', desc: 'Wide flange universal structural steel beam' },
    'eng-column-box':         { w: 100, h: 100, label: 'HSS Box Column',       cat: 'civil', standard: 'AISC', desc: 'Hollow structural section tubular steel column' },
    'eng-truss-pratt':        { w: 220, h: 80,  label: 'Pratt Bridge Truss',   cat: 'civil', standard: 'AISC / Eurocode', desc: 'Standard steel truss with vertical/diagonal members' },
    'eng-truss-warren':       { w: 220, h: 80,  label: 'Warren Truss',         cat: 'civil', standard: 'AISC / Eurocode', desc: 'Equilateral web triangulation roof/bridge truss' },
    'eng-retaining-wall':     { w: 140, h: 140, label: 'Retaining Wall',       cat: 'civil', standard: 'ACI 318', desc: 'Cantilever RC earth retaining wall with stem & toe' },
    'eng-footing-pad':        { w: 150, h: 120, label: 'Isolated Pad Footing',  cat: 'civil', standard: 'ACI 318', desc: 'Reinforced concrete foundation pad with rebar' },
    'eng-arch-door':          { w: 120, h: 100, label: 'Single Swing Door',    cat: 'civil', standard: 'Architectural', desc: 'Standard 90° door leaf and swing path arc' },
    'eng-arch-window':        { w: 130, h: 40,  label: 'Glazed Window Plan',   cat: 'civil', standard: 'Architectural', desc: 'Wall window opening with double glazing lines' },
    'eng-arch-stairs':        { w: 130, h: 110, label: 'Staircase with Arrow', cat: 'civil', standard: 'Architectural', desc: 'Flight of treads with directional UP arrow' },
    'eng-north-arrow':        { w: 80,  h: 110, label: 'Site North Arrow',     cat: 'civil', standard: 'Surveying', desc: 'Architectural & surveying true north orientation' },
    'eng-level-marker':       { w: 120, h: 60,  label: 'Finished Floor (FFL)', cat: 'civil', standard: 'Architectural', desc: 'Elevation benchmark target: +3.500 m FFL' },
    'eng-hatch-concrete':     { w: 110, h: 90,  label: 'Concrete Hatching',    cat: 'civil', standard: 'ISO 128-50', desc: 'Aggregate stones and stippled sand concrete' },
    'eng-hatch-brick':        { w: 110, h: 90,  label: 'Brickwork Hatching',   cat: 'civil', standard: 'ISO 128-50', desc: '45° diagonal paired brick hatching' },

    // ── 6. PROCESS, CHEMICAL & INDUSTRIAL P&ID (ISA-5.1 / ISO 10628) ──
    'eng-cstr-reactor':       { w: 130, h: 140, label: 'CSTR Chemical Reactor',cat: 'process', standard: 'ISA-5.1 / ISO 10628', desc: 'Jacketed stirred tank with top agitator motor' },
    'eng-tank-storage':       { w: 130, h: 130, label: 'Storage Tank',         cat: 'process', standard: 'ISA-5.1', desc: 'Atmospheric fluid storage tank with conical head' },
    'eng-pressure-vessel':    { w: 170, h: 90,  label: 'Pressure Vessel',      cat: 'process', standard: 'ASME VIII / ISA', desc: 'Horizontal bullet vessel with 2:1 semi-elliptical heads' },
    'eng-heat-exchanger':     { w: 160, h: 90,  label: 'Shell & Tube Exchanger',cat: 'process', standard: 'TEMA / ISA-5.1', desc: 'Thermal exchanger with tube bundle & baffles' },
    'eng-distill-col':        { w: 110, h: 170, label: 'Distillation Column',  cat: 'process', standard: 'ISA-5.1', desc: 'Fractionating tray column with condenser & reboiler' },
    'eng-cooling-tower':      { w: 140, h: 140, label: 'Cooling Tower',        cat: 'process', standard: 'ISA-5.1', desc: 'Induced draft evaporative water cooling tower' },
    'eng-pump-centrif':       { w: 110, h: 90,  label: 'Centrifugal Pump',     cat: 'process', standard: 'ISO 10628', desc: 'Volute centrifugal process liquid pump' },
    'eng-valv-gate':          { w: 120, h: 70,  label: 'Gate Valve (P&ID)',    cat: 'process', standard: 'ISA-5.1', desc: 'Opposed triangles manual isolation gate valve' },
    'eng-valv-globe':         { w: 120, h: 70,  label: 'Globe Valve (P&ID)',   cat: 'process', standard: 'ISA-5.1', desc: 'Throttling globe valve with central filled disc' },
    'eng-valv-check':         { w: 120, h: 70,  label: 'Check Valve (P&ID)',   cat: 'process', standard: 'ISA-5.1', desc: 'Non-return directional flow check valve' },
    'eng-valv-control':       { w: 120, h: 110, label: 'Control Valve (Pneum)',cat: 'process', standard: 'ISA-5.1', desc: 'Diaphragm actuator linear control valve' },
    'eng-valv-psv':           { w: 110, h: 100, label: 'Safety Valve (PSV)',   cat: 'process', standard: 'ISA-5.1', desc: 'Spring loaded overpressure safety relief valve' },
    'eng-inst-pi':            { w: 90,  h: 90,  label: 'Pressure Indicator PI',cat: 'process', standard: 'ISA-5.1', desc: 'Field local pressure indicator bubble' },
    'eng-inst-pt':            { w: 90,  h: 90,  label: 'Pressure Transmitter PT',cat: 'process', standard: 'ISA-5.1', desc: '4-20mA electronic pressure transmitter' },
    'eng-inst-ti':            { w: 90,  h: 90,  label: 'Temperature Indic. TI',cat: 'process', standard: 'ISA-5.1', desc: 'Local RTD / thermocouple temperature gauge' },
    'eng-inst-fic':           { w: 100, h: 100, label: 'Flow Controller (FIC)',cat: 'process', standard: 'ISA-5.1', desc: 'DCS shared control display bubble for flow' },
    'eng-inst-lic':           { w: 100, h: 100, label: 'Level Controller (LIC)',cat: 'process', standard: 'ISA-5.1', desc: 'DCS shared level controller loop instrument' },

    // ── 7. COMPUTER, SOFTWARE & NETWORKING (ISO 5807 / IEEE 802) ──
    'eng-flow-terminator':    { w: 150, h: 54,  label: 'Start / End Terminator',cat: 'computing', standard: 'ISO 5807', desc: 'Rounded pill starting/ending flowchart state' },
    'eng-flow-process':       { w: 150, h: 60,  label: 'Process / Action Box', cat: 'computing', standard: 'ISO 5807', desc: 'Standard computational or operational step' },
    'eng-flow-decision':      { w: 150, h: 80,  label: 'Decision Diamond',     cat: 'computing', standard: 'ISO 5807', desc: 'Conditional branch: Yes (True) vs No (False)' },
    'eng-flow-io':            { w: 150, h: 60,  label: 'Input / Output Data',  cat: 'computing', standard: 'ISO 5807', desc: 'Parallelogram data I/O operation' },
    'eng-flow-database':      { w: 130, h: 84,  label: 'Database / Storage',   cat: 'computing', standard: 'ISO 5807', desc: 'Cylindrical persistent relational / NoSQL storage' },
    'eng-flow-document':      { w: 140, h: 70,  label: 'Document Report',      cat: 'computing', standard: 'ISO 5807', desc: 'Printed output report with curved tear line' },
    'eng-arch-cpu':           { w: 140, h: 140, label: 'CPU Processor Core',  cat: 'computing', standard: 'Architecture', desc: 'ALU, Registers & Control Unit processor chip' },
    'eng-arch-alu':           { w: 140, h: 100, label: 'ALU Block (V-Shape)',  cat: 'computing', standard: 'Architecture', desc: 'Arithmetic Logic Unit computation block' },
    'eng-arch-bus':           { w: 180, h: 44,  label: 'System Bus Line',      cat: 'computing', standard: 'Architecture', desc: 'Multi-line address / data bus with arrows' },
    'eng-net-router':         { w: 120, h: 90,  label: 'Network Router (L3)',  cat: 'computing', standard: 'Cisco / IEEE', desc: 'Layer 3 packet routing node with 4 arrows' },
    'eng-net-switch':         { w: 130, h: 70,  label: 'Ethernet Switch (L2)', cat: 'computing', standard: 'IEEE 802.3', desc: 'Layer 2 multi-port network packet switch' },
    'eng-net-firewall':       { w: 120, h: 90,  label: 'Security Firewall',    cat: 'computing', standard: 'Cybersecurity', desc: 'Network security boundary with brick wall & shield' },
    'eng-net-server':         { w: 110, h: 110, label: 'Server Rack Stack',    cat: 'computing', standard: 'IT Infrastructure', desc: 'Data center compute node with status lights' },
    'eng-net-cloud':          { w: 160, h: 95,  label: 'Cloud Infrastructure', cat: 'computing', standard: 'Cloud / Internet', desc: 'WAN / cloud computing service network' },
    'eng-net-client':         { w: 120, h: 95,  label: 'Client PC Terminal',   cat: 'computing', standard: 'Workstation', desc: 'Desktop computer monitor & keyboard station' },

    // ── 8. AUTOMOTIVE, AEROSPACE, BIOMEDICAL & RENEWABLE ──
    'eng-auto-engine':        { w: 150, h: 120, label: 'Engine Block (ICE)',   cat: 'advanced-eng', standard: 'Automotive', desc: 'Internal combustion engine with cylinders & manifold' },
    'eng-auto-piston':        { w: 110, h: 140, label: 'Piston & Connecting Rod',cat: 'advanced-eng', standard: 'Automotive', desc: 'Reciprocating engine piston & crank big end' },
    'eng-auto-battery':       { w: 160, h: 80,  label: 'EV Traction Battery',  cat: 'advanced-eng', standard: 'SAE J1772', desc: 'High voltage 400V/800V EV battery pack' },
    'eng-aero-airfoil':       { w: 220, h: 60,  label: 'NACA Airfoil Profile', cat: 'advanced-eng', standard: 'Aeronautics', desc: 'Streamlined wing chord with leading & trailing edges' },
    'eng-aero-forces':        { w: 160, h: 140, label: '4 Flight Forces',      cat: 'advanced-eng', standard: 'Flight Dynamics', desc: 'Lift L⃗, Drag D⃗, Thrust T⃗, Weight W⃗ vectors' },
    'eng-aero-nozzle':        { w: 150, h: 80,  label: 'De Laval Rocket Nozzle',cat: 'advanced-eng', standard: 'Propulsion', desc: 'Convergent-divergent supersonic gas nozzle' },
    'eng-bio-ecg-wave':       { w: 180, h: 80,  label: 'ECG Cardiac Complex',  cat: 'advanced-eng', standard: 'Biomedical', desc: 'P-wave, QRS complex, T-wave diagnostic trace' },
    'eng-bio-pulseox':        { w: 120, h: 90,  label: 'Pulse Oximeter Probe', cat: 'advanced-eng', standard: 'Biomedical', desc: 'SpO2 optical photoplethysmography sensor' },
    'eng-renew-solar-pv':     { w: 140, h: 110, label: 'Solar PV Panel Module',cat: 'advanced-eng', standard: 'IEC 61215', desc: 'Photovoltaic solar cells with bus ribbons' },
    'eng-renew-wind':         { w: 120, h: 150, label: 'Wind Turbine',         cat: 'advanced-eng', standard: 'IEC 61400', desc: '3-blade horizontal axis wind power generator' },
    'eng-renew-fuelcell':     { w: 140, h: 100, label: 'PEM Hydrogen Fuel Cell',cat: 'advanced-eng', standard: 'Clean Energy', desc: 'Proton exchange membrane fuel cell with gas channels' },

    // ── 9. ENGINEERING GRAPHS & ANALYSIS ──
    'eng-graph-stress-strain':{ w: 180, h: 130, label: 'Stress-Strain Curve',  cat: 'analysis', standard: 'ASTM E8 / ISO 6892', desc: 'Elastic slope, yield point, UTS & fracture' },
    'eng-graph-sfd-bmd':      { w: 200, h: 140, label: 'Beam SFD & BMD',       cat: 'analysis', standard: 'Structural Mechanics', desc: 'Shear force & bending moment diagrams' },
    'eng-graph-bode':         { w: 190, h: 130, label: 'Bode Frequency Plot', cat: 'analysis', standard: 'Control Theory', desc: 'Log-frequency magnitude & phase margin plot' },
    'eng-graph-pv':           { w: 170, h: 130, label: 'P-V Indicator Diagram',cat: 'analysis', standard: 'Thermodynamics', desc: 'Cyclic pressure-volume work loop' },
    'eng-graph-mohr':         { w: 140, h: 140, label: "Mohr's Circle",        cat: 'analysis', standard: 'Mechanics of Materials', desc: '2D plane stress transformation circle & principal stresses' },
    'eng-graph-feedback':     { w: 200, h: 90,  label: 'Feedback Control Loop',cat: 'analysis', standard: 'IEEE Control', desc: 'Closed-loop block diagram with summing junction' }
  };

  function isEngineeringShape(type) {
    return !!ENGINEERING_SHAPE_DEFS[type];
  }

  function getBounds(s) {
    const def = ENGINEERING_SHAPE_DEFS[s.type] || { w: 120, h: 80 };
    const w = s.w !== undefined ? s.w : def.w;
    const h = s.h !== undefined ? s.h : def.h;
    return { x: s.x, y: s.y, w, h: h + 30 };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VECTOR RENDERING ENGINE FOR ALL ENGINEERING SYMBOLS
  // ══════════════════════════════════════════════════════════════════════════
  function draw(ctx, s) {
    if (!s) return;
    const def = ENGINEERING_SHAPE_DEFS[s.type] || { w: 120, h: 80, label: s.type };
    const x = s.x, y = s.y;
    const w = s.w !== undefined ? s.w : def.w;
    const h = s.h !== undefined ? s.h : def.h;
    const color = s.color || '#38bdf8';
    const isDark = (typeof Canvas !== 'undefined' && Canvas.getBoardColor && Canvas.getBoardColor().id === 'black') || false;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (s.type) {
      // ─────────────────────────────────────────────────────────────
      // 1. TECHNICAL DRAWING & DRAFTING
      // ─────────────────────────────────────────────────────────────
      case 'eng-line-visible': {
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + h / 2);
        ctx.lineTo(x + w - 10, y + h / 2);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Visible Line [ISO 128]', color);
        break;
      }
      case 'eng-line-hidden': {
        ctx.lineWidth = 2.2;
        ctx.setLineDash([7, 4]);
        ctx.beginPath();
        ctx.moveTo(x + 10, y + h / 2);
        ctx.lineTo(x + w - 10, y + h / 2);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Hidden Line [6, 4]', color);
        break;
      }
      case 'eng-line-center': {
        ctx.lineWidth = 1.6;
        ctx.setLineDash([14, 4, 3, 4]);
        ctx.beginPath();
        ctx.moveTo(x + 10, y + h / 2);
        ctx.lineTo(x + w - 10, y + h / 2);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Center Line ℄', color);
        break;
      }
      case 'eng-line-cutting': {
        const my = y + h * 0.45;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(x + 10, my); ctx.lineTo(x + 35, my);
        ctx.moveTo(x + w - 35, my); ctx.lineTo(x + w - 10, my);
        ctx.stroke();
        ctx.lineWidth = 1.8;
        ctx.setLineDash([12, 4, 4, 4]);
        ctx.beginPath();
        ctx.moveTo(x + 35, my); ctx.lineTo(x + w - 35, my);
        ctx.stroke();
        ctx.setLineDash([]);
        // Arrow heads
        drawArrow(ctx, x + 15, my + 16, x + 15, my, 10, true);
        drawArrow(ctx, x + w - 15, my + 16, x + w - 15, my, 10, true);
        ctx.font = '700 13px sans-serif';
        ctx.fillText('A', x + 10, my + 26);
        ctx.fillText('A', x + w - 20, my + 26);
        break;
      }
      case 'eng-line-break': {
        const my = y + h / 2;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 10, my);
        ctx.lineTo(x + w * 0.4, my);
        ctx.lineTo(x + w * 0.44, my - 12);
        ctx.lineTo(x + w * 0.52, my + 12);
        ctx.lineTo(x + w * 0.56, my);
        ctx.lineTo(x + w - 10, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Break Line', color);
        break;
      }
      case 'eng-dim-linear': {
        const yTop = y + 8, yLine = y + 26;
        ctx.lineWidth = 1.4;
        // Extension lines
        ctx.beginPath();
        ctx.moveTo(x + 15, yTop); ctx.lineTo(x + 15, yLine + 10);
        ctx.moveTo(x + w - 15, yTop); ctx.lineTo(x + w - 15, yLine + 10);
        ctx.stroke();
        // Dimension line with dual arrows
        ctx.beginPath();
        ctx.moveTo(x + 15, yLine); ctx.lineTo(x + w - 15, yLine);
        ctx.stroke();
        drawArrow(ctx, x + 35, yLine, x + 15, yLine, 9, true);
        drawArrow(ctx, x + w - 35, yLine, x + w - 15, yLine, 9, true);
        // Measurement text
        engBadge(ctx, x + w / 2, yLine, '50.0 ± 0.1 mm', '#facc15');
        break;
      }
      case 'eng-dim-diameter': {
        const cx = x + 40, cy = y + h / 2, r = 24;
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        // Leader
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy + 16); ctx.lineTo(cx + 20, cy - 20);
        ctx.lineTo(x + w - 10, cy - 20);
        ctx.stroke();
        drawArrow(ctx, cx - 8, cy + 8, cx - 18, cy + 18, 9, true);
        engBadge(ctx, cx + 55, cy - 30, '⌀ 48.0 H7', '#facc15');
        break;
      }
      case 'eng-dim-radius': {
        const cx = x + 30, cy = y + h - 20;
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(cx, cy, 32, -PI * 0.45, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(cx + 28, cy - 26);
        ctx.lineTo(x + w - 10, cy - 26);
        ctx.stroke();
        drawArrow(ctx, cx + 18, cy - 16, cx + 28, cy - 26, 9, true);
        engBadge(ctx, cx + 60, cy - 36, 'R 32.0 max', '#facc15');
        break;
      }
      case 'eng-hole-callout': {
        ctx.lineWidth = 1.8;
        ctx.strokeRect(x + 10, y + 10, 40, h - 20);
        // Leader line
        ctx.beginPath();
        ctx.moveTo(x + 30, y + 25); ctx.lineTo(x + 70, y + 15);
        ctx.lineTo(x + w - 10, y + 15);
        ctx.stroke();
        drawArrow(ctx, x + 50, y + 20, x + 30, y + 25, 9, true);
        engBadge(ctx, x + 115, y + 36, '⌀10 ↧15 ⌴⌀18 ↧6', '#facc15');
        break;
      }
      case 'eng-proj-first-angle': {
        // Conical frustum + circles (ISO European standard)
        const fx = x + 15, fy = y + 15;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(fx, fy + 12); ctx.lineTo(fx + 40, fy);
        ctx.lineTo(fx + 40, fy + 48); ctx.lineTo(fx, fy + 36);
        ctx.closePath(); ctx.stroke();
        // Circles to the right
        const ccx = x + 95, ccy = y + h / 2 - 2;
        ctx.beginPath(); ctx.arc(ccx, ccy, 24, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(ccx, ccy, 12, 0, PI * 2); ctx.stroke();
        // Center lines
        ctx.setLineDash([8, 3, 2, 3]);
        ctx.beginPath();
        ctx.moveTo(fx - 6, ccy); ctx.lineTo(ccx + 32, ccy);
        ctx.moveTo(ccx, ccy - 30); ctx.lineTo(ccx, ccy + 30);
        ctx.stroke(); ctx.setLineDash([]);
        engBadge(ctx, x + w / 2, y + h + 16, 'First-Angle Proj [ISO]', color);
        break;
      }
      case 'eng-proj-third-angle': {
        // Circles on left + truncated cone on right (ASME US standard)
        const ccx = x + 38, ccy = y + h / 2 - 2;
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(ccx, ccy, 24, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(ccx, ccy, 12, 0, PI * 2); ctx.stroke();
        // Cone on right
        const fx = x + 85, fy = y + 15;
        ctx.beginPath();
        ctx.moveTo(fx, fy); ctx.lineTo(fx + 40, fy + 12);
        ctx.lineTo(fx + 40, fy + 36); ctx.lineTo(fx, fy + 48);
        ctx.closePath(); ctx.stroke();
        // Center lines
        ctx.setLineDash([8, 3, 2, 3]);
        ctx.beginPath();
        ctx.moveTo(ccx - 30, ccy); ctx.lineTo(fx + 46, ccy);
        ctx.moveTo(ccx, ccy - 30); ctx.lineTo(ccx, ccy + 30);
        ctx.stroke(); ctx.setLineDash([]);
        engBadge(ctx, x + w / 2, y + h + 16, 'Third-Angle Proj [ASME]', color);
        break;
      }
      case 'eng-gdt-flatness': {
        drawGDTFrame(ctx, x + 20, y + 16, '⏤', '0.03', '');
        break;
      }
      case 'eng-gdt-perpendicular': {
        drawGDTFrame(ctx, x + 20, y + 16, '⟂', '0.02', 'A');
        break;
      }
      case 'eng-gdt-parallelism': {
        drawGDTFrame(ctx, x + 20, y + 16, '⫽', '0.05', 'B');
        break;
      }
      case 'eng-gdt-position': {
        drawGDTFrame(ctx, x + 15, y + 16, '⌖', '⌀0.1Ⓜ', 'A|B');
        break;
      }
      case 'eng-gdt-runout': {
        drawGDTFrame(ctx, x + 20, y + 16, '↗', '0.04', 'A-B');
        break;
      }
      case 'eng-datum-feature': {
        const mx = x + w / 2, my = y + 20;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(mx, my + 14); ctx.lineTo(mx - 10, my + 28); ctx.lineTo(mx + 10, my + 28);
        ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(mx, my + 14); ctx.lineTo(mx, my - 2); ctx.stroke();
        // Datum box
        ctx.strokeRect(mx - 14, my - 24, 28, 22);
        ctx.fillStyle = '#f8fafc'; ctx.font = '700 13px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('A', mx, my - 13);
        break;
      }
      case 'eng-weld-fillet': {
        const ly = y + 36;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 15); ctx.lineTo(x + 40, ly);
        ctx.lineTo(x + w - 10, ly);
        ctx.stroke();
        drawArrow(ctx, x + 22, y + 23, x + 10, y + 15, 8, true);
        // Fillet symbol (right triangle under reference line)
        ctx.beginPath();
        ctx.moveTo(x + 70, ly); ctx.lineTo(x + 70, ly + 16); ctx.lineTo(x + 86, ly);
        ctx.closePath(); ctx.stroke();
        ctx.font = '700 11px monospace'; ctx.fillText('6', x + 58, ly + 12);
        engBadge(ctx, x + w / 2, y + h + 16, 'Fillet Weld (6mm)', color);
        break;
      }
      case 'eng-weld-vgroove': {
        const ly = y + 36;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 15); ctx.lineTo(x + 40, ly);
        ctx.lineTo(x + w - 10, ly);
        ctx.stroke();
        drawArrow(ctx, x + 22, y + 23, x + 10, y + 15, 8, true);
        // V-groove symbol
        ctx.beginPath();
        ctx.moveTo(x + 70, ly); ctx.lineTo(x + 78, ly + 14); ctx.lineTo(x + 86, ly);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'V-Groove Weld [ISO 2553]', color);
        break;
      }
      case 'eng-surface-finish': {
        const sx = x + 30, sy = y + 45;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(sx, sy); ctx.lineTo(sx + 14, sy + 20); ctx.lineTo(sx + 34, sy - 15);
        ctx.lineTo(sx + 64, sy - 15);
        ctx.stroke();
        ctx.font = '700 11.5px monospace';
        ctx.fillStyle = '#facc15'; ctx.fillText('Ra 3.2', sx + 34, sy - 22);
        engBadge(ctx, x + w / 2, y + h + 16, 'Roughness [ISO 1302]', color);
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // 2. ELECTRICAL ENGINEERING & POWER (IEC 60617 / IEEE 315)
      // ─────────────────────────────────────────────────────────────
      case 'eng-resistor-iec': {
        const my = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(x + 8, my); ctx.lineTo(x + 36, my);
        ctx.moveTo(x + w - 36, my); ctx.lineTo(x + w - 8, my);
        ctx.stroke();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
        ctx.fillRect(x + 36, my - 12, w - 72, 24);
        ctx.strokeRect(x + 36, my - 12, w - 72, 24);
        engBadge(ctx, x + w / 2, my, 'R [IEC]', '#facc15');
        break;
      }
      case 'eng-resistor-ieee': {
        const my = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(x + 8, my); ctx.lineTo(x + 28, my);
        const zigW = (w - 56) / 6;
        for (let i = 0; i < 6; i++) {
          const zx = x + 28 + i * zigW;
          const zy = (i % 2 === 0) ? my - 13 : my + 13;
          ctx.lineTo(zx + zigW / 2, zy);
        }
        ctx.lineTo(x + w - 28, my);
        ctx.lineTo(x + w - 8, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Resistor [IEEE 315]', color);
        break;
      }
      case 'eng-potentiometer': {
        const my = y + h * 0.4;
        ctx.fillRect(x + 30, my - 10, w - 60, 20);
        ctx.strokeRect(x + 30, my - 10, w - 60, 20);
        ctx.beginPath();
        ctx.moveTo(x + 6, my); ctx.lineTo(x + 30, my);
        ctx.moveTo(x + w - 30, my); ctx.lineTo(x + w - 6, my);
        ctx.stroke();
        // Wiper arrow
        drawArrow(ctx, x + w / 2, y + h - 8, x + w / 2, my + 10, 8, true);
        engBadge(ctx, x + w / 2, my, 'POT', '#facc15');
        break;
      }
      case 'eng-capacitor-pol': {
        const cx = x + w / 2, my = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(x + 10, my); ctx.lineTo(cx - 8, my);
        ctx.moveTo(cx + 8, my); ctx.lineTo(x + w - 10, my);
        // Plates
        ctx.moveTo(cx - 8, my - 18); ctx.lineTo(cx - 8, my + 18);
        ctx.stroke();
        // Curved negative plate
        ctx.beginPath();
        ctx.arc(cx + 20, my, 18, PI * 0.75, PI * 1.25);
        ctx.stroke();
        ctx.font = '700 12px sans-serif'; ctx.fillStyle = '#ef4444';
        ctx.fillText('+', cx - 18, my - 10);
        engBadge(ctx, cx, y + h + 16, 'Polarized C', color);
        break;
      }
      case 'eng-transformer-iron': {
        const my = y + 36;
        ctx.lineWidth = 2.2;
        // Primary coils
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          ctx.arc(x + 38, my - 14 + i * 14, 7, -PI * 0.5, PI * 0.5);
        }
        ctx.stroke();
        // Core bars
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 2, my - 20); ctx.lineTo(x + w / 2 - 2, my + 28);
        ctx.moveTo(x + w / 2 + 2, my - 20); ctx.lineTo(x + w / 2 + 2, my + 28);
        ctx.stroke();
        // Secondary coils
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          ctx.arc(x + w - 38, my - 14 + i * 14, 7, PI * 0.5, -PI * 0.5);
        }
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Transformer [IEC]', color);
        break;
      }
      case 'eng-generator-3ph': {
        const cx = x + w / 2, cy = y + h * 0.42, r = 28;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        ctx.font = '700 16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('G', cx, cy - 6);
        ctx.font = '700 12px sans-serif';
        ctx.fillText('3 ~', cx, cy + 12);
        engBadge(ctx, cx, y + h + 16, '3-Phase Gen', color);
        break;
      }
      case 'eng-motor-induction': {
        const cx = x + w / 2, cy = y + h * 0.42, r = 28;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        ctx.font = '700 16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('M', cx, cy - 6);
        ctx.font = '700 12px sans-serif';
        ctx.fillText('3 ~', cx, cy + 12);
        engBadge(ctx, cx, y + h + 16, 'Induction Motor', color);
        break;
      }
      case 'eng-transformer-power': {
        // Dual interlocking circles
        const cx = x + w / 2, cy = y + h * 0.4;
        ctx.beginPath(); ctx.arc(cx - 16, cy, 22, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 16, cy, 22, 0, PI * 2); ctx.stroke();
        engBadge(ctx, cx - 16, cy, 'Δ', '#facc15');
        engBadge(ctx, cx + 16, cy, 'Y', '#38bdf8');
        engBadge(ctx, cx, y + h + 16, 'Power Xfmr Δ-Y', color);
        break;
      }
      case 'eng-busbar': {
        const my = y + h * 0.45;
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(x + 10, my); ctx.lineTo(x + w - 10, my); ctx.stroke();
        ctx.lineWidth = 2;
        [0.25, 0.5, 0.75].forEach(pct => {
          ctx.beginPath(); ctx.arc(x + w * pct, my, 4.5, 0, PI * 2); ctx.fill();
        });
        engBadge(ctx, x + w / 2, y + h + 16, 'Busbar [415V/11kV]', '#facc15');
        break;
      }
      case 'eng-breaker-hv': {
        const my = y + h * 0.4;
        ctx.strokeRect(x + w / 2 - 16, my - 16, 32, 32);
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 16, my - 16); ctx.lineTo(x + w / 2 + 16, my + 16);
        ctx.moveTo(x + w / 2 + 16, my - 16); ctx.lineTo(x + w / 2 - 16, my + 16);
        ctx.moveTo(x + 8, my); ctx.lineTo(x + w / 2 - 16, my);
        ctx.moveTo(x + w / 2 + 16, my); ctx.lineTo(x + w - 8, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Circuit Breaker', color);
        break;
      }
      case 'eng-isolator-switch': {
        const my = y + h * 0.4;
        ctx.beginPath();
        ctx.moveTo(x + 10, my); ctx.lineTo(x + w * 0.35, my);
        ctx.moveTo(x + w * 0.35, my); ctx.lineTo(x + w * 0.65, my - 18);
        ctx.moveTo(x + w * 0.65, my); ctx.lineTo(x + w - 10, my);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + w * 0.35, my, 3.5, 0, PI * 2);
        ctx.arc(x + w * 0.65, my, 3.5, 0, PI * 2);
        ctx.fill();
        engBadge(ctx, x + w / 2, y + h + 16, 'Isolator Switch', color);
        break;
      }
      case 'eng-earth-ground': {
        const cx = x + w / 2;
        ctx.beginPath();
        ctx.moveTo(cx, y + 8); ctx.lineTo(cx, y + 36);
        ctx.moveTo(cx - 24, y + 36); ctx.lineTo(cx + 24, y + 36);
        ctx.moveTo(cx - 15, y + 43); ctx.lineTo(cx + 15, y + 43);
        ctx.moveTo(cx - 6, y + 50); ctx.lineTo(cx + 6, y + 50);
        ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Protective Earth', color);
        break;
      }
      case 'eng-lightning-arrester': {
        const cx = x + w / 2;
        ctx.strokeRect(cx - 12, y + 16, 24, 40);
        ctx.beginPath();
        ctx.moveTo(cx - 18, y + 48); ctx.lineTo(cx + 18, y + 24);
        ctx.stroke();
        drawArrow(ctx, cx + 8, y + 30, cx + 18, y + 24, 7, true);
        engBadge(ctx, cx, y + h + 16, 'Surge Arrester', color);
        break;
      }
      case 'eng-trans-tower': {
        const cx = x + w / 2;
        ctx.lineWidth = 1.8;
        // Pylon structure
        ctx.beginPath();
        ctx.moveTo(cx - 28, y + h - 25); ctx.lineTo(cx - 10, y + 15);
        ctx.lineTo(cx + 10, y + 15); ctx.lineTo(cx + 28, y + h - 25);
        // Cross arms
        ctx.moveTo(cx - 38, y + 32); ctx.lineTo(cx + 38, y + 32);
        ctx.moveTo(cx - 44, y + 52); ctx.lineTo(cx + 44, y + 52);
        ctx.moveTo(cx - 10, y + 15); ctx.lineTo(cx + 10, y + 32);
        ctx.moveTo(cx + 10, y + 15); ctx.lineTo(cx - 10, y + 32);
        ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'HV Pylon', color);
        break;
      }
      case 'eng-contact-no': {
        const my = y + h * 0.4;
        ctx.beginPath();
        ctx.moveTo(x + 10, my); ctx.lineTo(x + 40, my);
        ctx.moveTo(x + 40, my - 14); ctx.lineTo(x + 75, my + 6);
        ctx.moveTo(x + 75, my); ctx.lineTo(x + w - 10, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'NO Contact', color);
        break;
      }
      case 'eng-contact-nc': {
        const my = y + h * 0.4;
        ctx.beginPath();
        ctx.moveTo(x + 10, my); ctx.lineTo(x + 40, my);
        ctx.moveTo(x + 40, my); ctx.lineTo(x + 75, my);
        ctx.moveTo(x + 46, my - 12); ctx.lineTo(x + 68, my + 12);
        ctx.moveTo(x + 75, my); ctx.lineTo(x + w - 10, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'NC Contact', color);
        break;
      }
      case 'eng-relay-coil': {
        const my = y + h * 0.4;
        ctx.strokeRect(x + 35, my - 14, w - 70, 28);
        ctx.beginPath();
        ctx.moveTo(x + 8, my); ctx.lineTo(x + 35, my);
        ctx.moveTo(x + w - 35, my); ctx.lineTo(x + w - 8, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, my, 'K1 [Coil]', '#facc15');
        break;
      }
      case 'eng-estop-btn': {
        const cx = x + w / 2;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(cx, y + 26, 18, 0, PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.stroke();
        ctx.strokeStyle = color;
        ctx.beginPath(); ctx.moveTo(cx, y + 44); ctx.lineTo(cx, y + 60); ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'E-STOP', '#ef4444');
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // 3. ELECTRONICS, SEMICONDUCTORS & LOGIC
      // ─────────────────────────────────────────────────────────────
      case 'eng-opamp': {
        // Triangle pointing right
        ctx.beginPath();
        ctx.moveTo(x + 30, y + 10);
        ctx.lineTo(x + w - 30, y + h / 2);
        ctx.lineTo(x + 30, y + h - 10);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)'; ctx.fill(); ctx.stroke();
        // Inverting & Non-inverting leads
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 26); ctx.lineTo(x + 30, y + 26);
        ctx.moveTo(x + 8, y + h - 26); ctx.lineTo(x + 30, y + h - 26);
        ctx.moveTo(x + w - 30, y + h / 2); ctx.lineTo(x + w - 8, y + h / 2);
        ctx.stroke();
        ctx.font = '700 13px monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('−', x + 40, y + 28);
        ctx.fillText('+', x + 40, y + h - 24);
        engBadge(ctx, x + w / 2, y + h + 16, 'Op-Amp', color);
        break;
      }
      case 'eng-comparator': {
        ctx.beginPath();
        ctx.moveTo(x + 30, y + 10); ctx.lineTo(x + w - 30, y + h / 2); ctx.lineTo(x + 30, y + h - 10);
        ctx.closePath();
        ctx.fillStyle = 'rgba(245, 158, 11, 0.12)'; ctx.fill(); ctx.stroke();
        ctx.font = '700 11px monospace'; ctx.fillStyle = '#f59e0b';
        ctx.fillText('COMP', x + 55, y + h / 2);
        break;
      }
      case 'eng-timer-555': {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(x + 25, y + 15, w - 50, h - 35);
        ctx.strokeRect(x + 25, y + 15, w - 50, h - 35);
        // Notch
        ctx.beginPath(); ctx.arc(x + w / 2, y + 15, 6, 0, PI); ctx.stroke();
        // Pins
        const pinLabelsL = ['GND', 'TRG', 'OUT', 'RST'];
        const pinLabelsR = ['VCC', 'DIS', 'THR', 'CV'];
        ctx.font = '700 9px monospace';
        for (let i = 0; i < 4; i++) {
          const py = y + 28 + i * 18;
          ctx.beginPath();
          ctx.moveTo(x + 8, py); ctx.lineTo(x + 25, py);
          ctx.moveTo(x + w - 25, py); ctx.lineTo(x + w - 8, py);
          ctx.stroke();
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(pinLabelsL[i], x + 30, py + 3);
          ctx.fillText(pinLabelsR[i], x + w - 48, py + 3);
        }
        engBadge(ctx, x + w / 2, y + h + 16, 'NE555 Timer', '#facc15');
        break;
      }
      case 'eng-crystal-osc': {
        const cx = x + w / 2, my = y + h / 2;
        // Plates
        ctx.beginPath();
        ctx.moveTo(cx - 8, my - 16); ctx.lineTo(cx - 8, my + 16);
        ctx.moveTo(cx + 8, my - 16); ctx.lineTo(cx + 8, my + 16);
        ctx.moveTo(x + 10, my); ctx.lineTo(cx - 8, my);
        ctx.moveTo(cx + 8, my); ctx.lineTo(x + w - 10, my);
        ctx.stroke();
        // Quartz block
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.fillRect(cx - 4, my - 14, 8, 28);
        ctx.strokeRect(cx - 4, my - 14, 8, 28);
        engBadge(ctx, cx, y + h + 16, 'XTAL [16MHz]', color);
        break;
      }
      case 'eng-transistor-pnp': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.beginPath(); ctx.arc(cx, cy, 26, 0, PI * 2); ctx.stroke();
        // Base bar
        ctx.beginPath(); ctx.moveTo(cx - 10, cy - 14); ctx.lineTo(cx - 10, cy + 14); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 10, cy); ctx.lineTo(cx - 10, cy); ctx.stroke();
        // Collector & Emitter
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 7); ctx.lineTo(cx + 14, cy - 20);
        ctx.moveTo(cx - 10, cy + 7); ctx.lineTo(cx + 14, cy + 20);
        ctx.stroke();
        // PNP arrow points inward to base
        drawArrow(ctx, cx + 8, cy - 16, cx - 4, cy - 9, 7, true);
        engBadge(ctx, cx, y + h + 16, 'PNP BJT', color);
        break;
      }
      case 'eng-mosfet-nchan': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.beginPath(); ctx.arc(cx, cy, 28, 0, PI * 2); ctx.stroke();
        // Gate & Channel
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 18); ctx.lineTo(cx - 12, cy + 18);
        ctx.moveTo(x + 10, cy + 10); ctx.lineTo(cx - 12, cy + 10);
        // 3-segment channel
        ctx.moveTo(cx - 4, cy - 16); ctx.lineTo(cx + 14, cy - 16);
        ctx.moveTo(cx - 4, cy); ctx.lineTo(cx + 14, cy);
        ctx.moveTo(cx - 4, cy + 16); ctx.lineTo(cx + 14, cy + 16);
        ctx.stroke();
        // N-channel arrow points inward
        drawArrow(ctx, cx + 12, cy, cx + 2, cy, 7, true);
        engBadge(ctx, cx, y + h + 16, 'N-MOSFET', color);
        break;
      }
      case 'eng-mosfet-pchan': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.beginPath(); ctx.arc(cx, cy, 28, 0, PI * 2); ctx.stroke();
        drawArrow(ctx, cx + 2, cy, cx + 14, cy, 7, true);
        engBadge(ctx, cx, y + h + 16, 'P-MOSFET', color);
        break;
      }
      case 'eng-igbt': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.beginPath(); ctx.arc(cx, cy, 28, 0, PI * 2); ctx.stroke();
        engBadge(ctx, cx, cy - 4, 'IGBT', '#facc15');
        break;
      }
      case 'eng-scr-thyristor': {
        const my = y + h * 0.4;
        ctx.beginPath();
        ctx.moveTo(x + 10, my); ctx.lineTo(x + 40, my);
        ctx.moveTo(x + 75, my); ctx.lineTo(x + w - 10, my);
        ctx.stroke();
        // Diode triangle + bar
        ctx.beginPath();
        ctx.moveTo(x + 40, my - 14); ctx.lineTo(x + 65, my); ctx.lineTo(x + 40, my + 14);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 65, my - 14); ctx.lineTo(x + 65, my + 14); ctx.stroke();
        // Gate lead
        ctx.beginPath();
        ctx.moveTo(x + 65, my + 6); ctx.lineTo(x + 55, my + 22); ctx.lineTo(x + 35, my + 22);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'SCR Thyristor', color);
        break;
      }
      case 'eng-bridge-rectifier': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.strokeRect(cx - 24, cy - 24, 48, 48);
        ctx.font = '700 11px monospace';
        ctx.fillText('~', cx - 20, cy);
        ctx.fillText('~', cx + 14, cy);
        ctx.fillStyle = '#ef4444'; ctx.fillText('+', cx - 4, cy - 14);
        ctx.fillStyle = '#38bdf8'; ctx.fillText('−', cx - 4, cy + 18);
        engBadge(ctx, cx, y + h + 16, 'Bridge Rectifier', color);
        break;
      }
      case 'eng-optocoupler': {
        ctx.strokeRect(x + 25, y + 10, w - 50, h - 30);
        // Opto arrows
        drawArrow(ctx, x + 50, y + 25, x + 68, y + 35, 7, true);
        drawArrow(ctx, x + 50, y + 35, x + 68, y + 45, 7, true);
        engBadge(ctx, x + w / 2, y + h + 16, 'Optocoupler', color);
        break;
      }
      case 'eng-logic-and': {
        const my = y + h * 0.45;
        ctx.beginPath();
        ctx.moveTo(x + 30, my - 18); ctx.lineTo(x + 60, my - 18);
        ctx.arc(x + 60, my, 18, -PI * 0.5, PI * 0.5);
        ctx.lineTo(x + 30, my + 18);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 8, my - 10); ctx.lineTo(x + 30, my - 10);
        ctx.moveTo(x + 8, my + 10); ctx.lineTo(x + 30, my + 10);
        ctx.moveTo(x + 78, my); ctx.lineTo(x + w - 8, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'AND Gate', color);
        break;
      }
      case 'eng-logic-or': {
        const my = y + h * 0.45;
        ctx.beginPath();
        ctx.moveTo(x + 26, my - 18);
        ctx.quadraticCurveTo(x + 55, my - 18, x + 80, my);
        ctx.quadraticCurveTo(x + 55, my + 18, x + 26, my + 18);
        ctx.quadraticCurveTo(x + 42, my, x + 26, my - 18);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 8, my - 9); ctx.lineTo(x + 34, my - 9);
        ctx.moveTo(x + 8, my + 9); ctx.lineTo(x + 34, my + 9);
        ctx.moveTo(x + 80, my); ctx.lineTo(x + w - 8, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'OR Gate', color);
        break;
      }
      case 'eng-logic-not': {
        const my = y + h * 0.45;
        ctx.beginPath();
        ctx.moveTo(x + 30, my - 16); ctx.lineTo(x + 65, my); ctx.lineTo(x + 30, my + 16);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 70, my, 4, 0, PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 8, my); ctx.lineTo(x + 30, my);
        ctx.moveTo(x + 74, my); ctx.lineTo(x + w - 8, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'NOT Gate', color);
        break;
      }
      case 'eng-logic-nand': {
        const my = y + h * 0.45;
        ctx.beginPath();
        ctx.moveTo(x + 26, my - 18); ctx.lineTo(x + 56, my - 18);
        ctx.arc(x + 56, my, 18, -PI * 0.5, PI * 0.5);
        ctx.lineTo(x + 26, my + 18);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 78, my, 4, 0, PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 8, my - 10); ctx.lineTo(x + 26, my - 10);
        ctx.moveTo(x + 8, my + 10); ctx.lineTo(x + 26, my + 10);
        ctx.moveTo(x + 82, my); ctx.lineTo(x + w - 8, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'NAND Gate', color);
        break;
      }
      case 'eng-logic-nor': {
        const my = y + h * 0.45;
        ctx.beginPath();
        ctx.moveTo(x + 24, my - 18);
        ctx.quadraticCurveTo(x + 52, my - 18, x + 76, my);
        ctx.quadraticCurveTo(x + 52, my + 18, x + 24, my + 18);
        ctx.quadraticCurveTo(x + 38, my, x + 24, my - 18);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 82, my, 4, 0, PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 8, my - 9); ctx.lineTo(x + 30, my - 9);
        ctx.moveTo(x + 8, my + 9); ctx.lineTo(x + 30, my + 9);
        ctx.moveTo(x + 86, my); ctx.lineTo(x + w - 8, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'NOR Gate', color);
        break;
      }
      case 'eng-logic-xor': {
        const my = y + h * 0.45;
        ctx.beginPath();
        ctx.moveTo(x + 18, my - 18); ctx.quadraticCurveTo(x + 32, my, x + 18, my + 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 26, my - 18);
        ctx.quadraticCurveTo(x + 55, my - 18, x + 80, my);
        ctx.quadraticCurveTo(x + 55, my + 18, x + 26, my + 18);
        ctx.quadraticCurveTo(x + 40, my, x + 26, my - 18);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 80, my); ctx.lineTo(x + w - 8, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'XOR Gate', color);
        break;
      }
      case 'eng-logic-xnor': {
        const my = y + h * 0.45;
        ctx.beginPath();
        ctx.moveTo(x + 18, my - 18); ctx.quadraticCurveTo(x + 32, my, x + 18, my + 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 26, my - 18);
        ctx.quadraticCurveTo(x + 55, my - 18, x + 80, my);
        ctx.quadraticCurveTo(x + 55, my + 18, x + 26, my + 18);
        ctx.quadraticCurveTo(x + 40, my, x + 26, my - 18);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 86, my, 4, 0, PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 90, my); ctx.lineTo(x + w - 8, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'XNOR Gate', color);
        break;
      }
      case 'eng-flipflop-d': {
        ctx.strokeRect(x + 25, y + 10, w - 50, h - 30);
        ctx.font = '700 11px monospace'; ctx.fillStyle = '#f8fafc';
        ctx.fillText('D', x + 34, y + 28);
        ctx.fillText('Q', x + w - 42, y + 28);
        ctx.fillText('CLK', x + 30, y + h - 32);
        ctx.fillText('Q̄', x + w - 42, y + h - 32);
        engBadge(ctx, x + w / 2, y + h + 16, 'D Flip-Flop', color);
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // 4. MECHANICAL, HYDRAULICS & PNEUMATICS
      // ─────────────────────────────────────────────────────────────
      case 'eng-gear-spur': {
        const cx = x + w / 2, cy = y + h * 0.45, r = 36;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, PI * 2); ctx.fill();
        // Teeth
        for (let i = 0; i < 12; i++) {
          const ang = (i * PI * 2) / 12;
          ctx.beginPath();
          ctx.moveTo(cx + (r - 2) * Math.cos(ang), cy + (r - 2) * Math.sin(ang));
          ctx.lineTo(cx + (r + 7) * Math.cos(ang), cy + (r + 7) * Math.sin(ang));
          ctx.lineWidth = 4; ctx.stroke();
        }
        ctx.lineWidth = 2;
        engBadge(ctx, cx, y + h + 16, 'Spur Gear (z=12)', color);
        break;
      }
      case 'eng-gear-bevel': {
        const cx = x + w / 2, cy = y + h * 0.45;
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy - 25); ctx.lineTo(cx + 30, cy - 25);
        ctx.lineTo(cx + 15, cy + 25); ctx.lineTo(cx - 15, cy + 25);
        ctx.closePath(); ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Bevel Gear', color);
        break;
      }
      case 'eng-rack-pinion': {
        const cx = x + w / 2, cy = y + 35;
        ctx.beginPath(); ctx.arc(cx, cy, 22, 0, PI * 2); ctx.stroke();
        // Rack bar
        ctx.strokeRect(x + 10, y + 65, w - 20, 14);
        engBadge(ctx, cx, y + h + 16, 'Rack & Pinion', color);
        break;
      }
      case 'eng-bearing-ball': {
        const cx = x + w / 2, cy = y + h * 0.45;
        ctx.beginPath(); ctx.arc(cx, cy, 38, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 18, 0, PI * 2); ctx.stroke();
        for (let i = 0; i < 8; i++) {
          const ang = (i * PI * 2) / 8;
          ctx.beginPath();
          ctx.arc(cx + 28 * Math.cos(ang), cy + 28 * Math.sin(ang), 6, 0, PI * 2);
          ctx.fill();
        }
        engBadge(ctx, cx, y + h + 16, 'Ball Bearing', color);
        break;
      }
      case 'eng-pulley-belt': {
        const p1x = x + 35, p2x = x + w - 40, cy = y + h * 0.42;
        ctx.beginPath(); ctx.arc(p1x, cy, 24, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(p2x, cy, 16, 0, PI * 2); ctx.stroke();
        // Belts
        ctx.beginPath();
        ctx.moveTo(p1x, cy - 24); ctx.lineTo(p2x, cy - 16);
        ctx.moveTo(p1x, cy + 24); ctx.lineTo(p2x, cy + 16);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Belt Drive', color);
        break;
      }
      case 'eng-chain-sprocket': {
        const p1x = x + 35, p2x = x + w - 40, cy = y + h * 0.42;
        ctx.beginPath(); ctx.arc(p1x, cy, 22, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(p2x, cy, 14, 0, PI * 2); ctx.stroke();
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(p1x, cy - 22); ctx.lineTo(p2x, cy - 14);
        ctx.moveTo(p1x, cy + 22); ctx.lineTo(p2x, cy + 14);
        ctx.stroke(); ctx.setLineDash([]);
        engBadge(ctx, x + w / 2, y + h + 16, 'Chain & Sprocket', color);
        break;
      }
      case 'eng-spring-damper': {
        const cx = x + w / 2;
        // Top and bottom rigid plates
        ctx.strokeRect(x + 15, y + 10, w - 30, 8);
        ctx.strokeRect(x + 15, y + h - 26, w - 30, 8);
        // Spring on left
        const sx = x + 38;
        ctx.beginPath();
        ctx.moveTo(sx, y + 18);
        ctx.lineTo(sx - 10, y + 32); ctx.lineTo(sx + 10, y + 46);
        ctx.lineTo(sx - 10, y + 60); ctx.lineTo(sx, y + h - 26);
        ctx.stroke();
        // Damper on right
        const dx = x + w - 38;
        ctx.strokeRect(dx - 12, y + 36, 24, 28);
        ctx.beginPath();
        ctx.moveTo(dx, y + 18); ctx.lineTo(dx, y + 48);
        ctx.moveTo(dx - 8, y + 48); ctx.lineTo(dx + 8, y + 48);
        ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Spring-Damper (k, c)', color);
        break;
      }
      case 'eng-shaft-coupling': {
        const cy = y + h * 0.4;
        ctx.strokeRect(x + 10, cy - 10, 35, 20);
        ctx.strokeRect(x + 45, cy - 20, 20, 40);
        ctx.strokeRect(x + 65, cy - 20, 20, 40);
        ctx.strokeRect(x + 85, cy - 10, 35, 20);
        engBadge(ctx, x + w / 2, y + h + 16, 'Shaft Coupling', color);
        break;
      }
      case 'eng-disc-brake': {
        const cx = x + w / 2, cy = y + h * 0.45;
        ctx.beginPath(); ctx.arc(cx, cy, 36, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 18, 0, PI * 2); ctx.stroke();
        // Caliper
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx - 38, cy - 38, 30, 24);
        ctx.strokeRect(cx - 38, cy - 38, 30, 24);
        engBadge(ctx, cx, y + h + 16, 'Disc Brake', color);
        break;
      }
      case 'eng-hyd-pump': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.beginPath(); ctx.arc(cx, cy, 26, 0, PI * 2); ctx.stroke();
        // Filled triangle pointing OUT
        ctx.beginPath();
        ctx.moveTo(cx, cy - 26); ctx.lineTo(cx - 10, cy - 8); ctx.lineTo(cx + 10, cy - 8);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Hydraulic Pump', color);
        break;
      }
      case 'eng-air-compressor': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.beginPath(); ctx.arc(cx, cy, 26, 0, PI * 2); ctx.stroke();
        // Hollow triangle pointing OUT
        ctx.beginPath();
        ctx.moveTo(cx, cy - 26); ctx.lineTo(cx - 10, cy - 8); ctx.lineTo(cx + 10, cy - 8);
        ctx.closePath(); ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Air Compressor', color);
        break;
      }
      case 'eng-cyl-single': {
        const my = y + h * 0.4;
        ctx.strokeRect(x + 10, my - 16, 95, 32);
        // Piston & rod
        ctx.fillRect(x + 65, my - 14, 10, 28);
        ctx.beginPath(); ctx.moveTo(x + 75, my); ctx.lineTo(x + w - 10, my); ctx.stroke();
        // Spring return inside
        ctx.beginPath();
        ctx.moveTo(x + 65, my - 10); ctx.lineTo(x + 50, my + 10); ctx.lineTo(x + 35, my - 10); ctx.lineTo(x + 20, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Single-Acting Cyl', color);
        break;
      }
      case 'eng-cyl-double': {
        const my = y + h * 0.4;
        ctx.strokeRect(x + 10, my - 16, 95, 32);
        // Ports
        ctx.beginPath();
        ctx.moveTo(x + 20, my + 16); ctx.lineTo(x + 20, my + 24);
        ctx.moveTo(x + 90, my + 16); ctx.lineTo(x + 90, my + 24);
        // Piston & rod
        ctx.fillRect(x + 50, my - 14, 12, 28);
        ctx.moveTo(x + 62, my); ctx.lineTo(x + w - 10, my);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Double-Acting Cyl', color);
        break;
      }
      case 'eng-valv-dir-4-2': {
        const cx = x + w / 2, my = y + h * 0.4;
        ctx.strokeRect(cx - 40, my - 20, 40, 40);
        ctx.strokeRect(cx, my - 20, 40, 40);
        // Arrow paths
        drawArrow(ctx, cx - 30, my - 14, cx - 30, my + 14, 6, true);
        drawArrow(ctx, cx - 10, my + 14, cx - 10, my - 14, 6, true);
        engBadge(ctx, cx, y + h + 16, '4/2 DCV Valve', color);
        break;
      }
      case 'eng-valv-dir-4-3': {
        const cx = x + w / 2, my = y + h * 0.4;
        ctx.strokeRect(cx - 60, my - 20, 40, 40);
        ctx.strokeRect(cx - 20, my - 20, 40, 40);
        ctx.strokeRect(cx + 20, my - 20, 40, 40);
        engBadge(ctx, cx, y + h + 16, '4/3 Centered DCV', color);
        break;
      }
      case 'eng-valv-relief': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.strokeRect(cx - 18, cy - 18, 36, 36);
        // Diagonal arrow with spring
        drawArrow(ctx, cx - 12, cy + 12, cx + 12, cy - 12, 6, true);
        engBadge(ctx, cx, y + h + 16, 'Relief Valve', color);
        break;
      }
      case 'eng-frl-unit': {
        const cy = y + h * 0.4;
        ctx.strokeRect(x + 15, cy - 22, 35, 44);
        ctx.strokeRect(x + 60, cy - 22, 35, 44);
        ctx.strokeRect(x + 105, cy - 22, 35, 44);
        engBadge(ctx, x + 32, cy, 'F', '#38bdf8');
        engBadge(ctx, x + 77, cy, 'R', '#facc15');
        engBadge(ctx, x + 122, cy, 'L', '#10b981');
        engBadge(ctx, x + w / 2, y + h + 16, 'FRL Unit [ISO 1219]', color);
        break;
      }
      case 'eng-pressure-gauge': {
        const cx = x + w / 2, cy = y + 36;
        ctx.beginPath(); ctx.arc(cx, cy, 26, 0, PI * 2); ctx.stroke();
        // Needle & dial
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(cx + 14, cy - 14);
        ctx.moveTo(cx, cy + 26); ctx.lineTo(cx, cy + 46);
        ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Gauge [bar]', color);
        break;
      }
      case 'eng-joint-revolute': {
        const cx = x + w / 2, cy = y + h * 0.4;
        ctx.beginPath(); ctx.arc(cx, cy, 8, 0, PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy + 8); ctx.lineTo(cx - 16, cy + 32); ctx.lineTo(cx + 16, cy + 32);
        ctx.closePath(); ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Pin Joint (1-DOF)', color);
        break;
      }
      case 'eng-four-bar': {
        const cy = y + h * 0.45;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x + 25, cy + 18); ctx.lineTo(x + 45, cy - 16);
        ctx.lineTo(x + w - 45, cy - 22); ctx.lineTo(x + w - 25, cy + 18);
        ctx.stroke();
        // Pin joints
        [ [x+25, cy+18], [x+45, cy-16], [x+w-45, cy-22], [x+w-25, cy+18] ].forEach(([px, py]) => {
          ctx.beginPath(); ctx.arc(px, py, 4, 0, PI * 2); ctx.fill();
        });
        engBadge(ctx, x + w / 2, y + h + 16, 'Four-Bar Linkage', color);
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // 5. CIVIL, STRUCTURAL & ARCHITECTURAL
      // ─────────────────────────────────────────────────────────────
      case 'eng-beam-i': {
        const cx = x + w / 2, my = y + h * 0.44;
        ctx.lineWidth = 2.4;
        // Top flange, web, bottom flange
        ctx.beginPath();
        ctx.moveTo(cx - 32, my - 38); ctx.lineTo(cx + 32, my - 38);
        ctx.lineTo(cx + 32, my - 28); ctx.lineTo(cx + 8, my - 28);
        ctx.lineTo(cx + 8, my + 28); ctx.lineTo(cx + 32, my + 28);
        ctx.lineTo(cx + 32, my + 38); ctx.lineTo(cx - 32, my + 38);
        ctx.lineTo(cx - 32, my + 28); ctx.lineTo(cx - 8, my + 28);
        ctx.lineTo(cx - 8, my - 28); ctx.lineTo(cx - 32, my - 28);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)'; ctx.fill(); ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'I-Beam (W-Shape)', color);
        break;
      }
      case 'eng-column-box': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.strokeRect(cx - 32, cy - 32, 64, 64);
        ctx.strokeRect(cx - 22, cy - 22, 44, 44);
        engBadge(ctx, cx, y + h + 16, 'HSS Box Column', color);
        break;
      }
      case 'eng-truss-pratt': {
        const my = y + h * 0.42;
        ctx.lineWidth = 2;
        // Chords
        ctx.strokeRect(x + 10, my - 20, w - 20, 40);
        // Vertical and diagonal web members
        const segs = 4;
        const sw = (w - 20) / segs;
        for (let i = 1; i < segs; i++) {
          ctx.beginPath();
          ctx.moveTo(x + 10 + i * sw, my - 20); ctx.lineTo(x + 10 + i * sw, my + 20);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(x + 10, my + 20); ctx.lineTo(x + 10 + sw, my - 20);
        ctx.lineTo(x + 10 + 2 * sw, my + 20); ctx.lineTo(x + 10 + 3 * sw, my - 20);
        ctx.lineTo(x + w - 10, my + 20);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Pratt Truss', color);
        break;
      }
      case 'eng-truss-warren': {
        const my = y + h * 0.42;
        ctx.strokeRect(x + 10, my - 20, w - 20, 40);
        const segs = 5;
        const sw = (w - 20) / segs;
        ctx.beginPath();
        ctx.moveTo(x + 10, my + 20);
        for (let i = 0; i < segs; i++) {
          const top = (i % 2 === 0);
          ctx.lineTo(x + 10 + (i + 1) * sw, top ? my - 20 : my + 20);
        }
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Warren Truss', color);
        break;
      }
      case 'eng-retaining-wall': {
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Stem and base slab
        ctx.moveTo(x + 35, y + 10); ctx.lineTo(x + 50, y + 10);
        ctx.lineTo(x + 50, y + h - 35); ctx.lineTo(x + w - 20, y + h - 35);
        ctx.lineTo(x + w - 20, y + h - 20); ctx.lineTo(x + 20, y + h - 20);
        ctx.lineTo(x + 20, y + h - 35); ctx.lineTo(x + 35, y + h - 35);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)'; ctx.fill(); ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'RC Retaining Wall', color);
        break;
      }
      case 'eng-footing-pad': {
        const cx = x + w / 2;
        // Column stub
        ctx.strokeRect(cx - 15, y + 10, 30, 40);
        // Base pad footing
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.fillRect(x + 15, y + 50, w - 30, 40);
        ctx.strokeRect(x + 15, y + 50, w - 30, 40);
        engBadge(ctx, cx, y + h + 16, 'Pad Footing', color);
        break;
      }
      case 'eng-arch-door': {
        // Door leaf + 90 deg swing arc
        ctx.strokeRect(x + 10, y + 15, 12, h - 30);
        ctx.beginPath();
        ctx.moveTo(x + 22, y + h - 15); ctx.lineTo(x + w - 15, y + h - 15);
        ctx.stroke();
        // Arc
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(x + 22, y + h - 15, w - 37, -PI * 0.5, 0);
        ctx.stroke(); ctx.setLineDash([]);
        engBadge(ctx, x + w / 2, y + h + 16, 'Door (90° Swing)', color);
        break;
      }
      case 'eng-arch-window': {
        ctx.strokeRect(x + 10, y + 8, w - 20, 24);
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 16); ctx.lineTo(x + w - 10, y + 16);
        ctx.moveTo(x + 10, y + 24); ctx.lineTo(x + w - 10, y + 24);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Double-Glazed Window', color);
        break;
      }
      case 'eng-arch-stairs': {
        const steps = 6;
        const sh = (h - 35) / steps;
        for (let i = 0; i < steps; i++) {
          ctx.beginPath();
          ctx.moveTo(x + 15, y + 15 + i * sh); ctx.lineTo(x + w - 15, y + 15 + i * sh);
          ctx.stroke();
        }
        drawArrow(ctx, x + w / 2, y + h - 25, x + w / 2, y + 15, 9, true);
        engBadge(ctx, x + w / 2, y + h + 16, 'Stair Flight (UP)', color);
        break;
      }
      case 'eng-north-arrow': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.beginPath(); ctx.arc(cx, cy, 28, 0, PI * 2); ctx.stroke();
        // Compass needle
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 26); ctx.lineTo(cx - 8, cy); ctx.lineTo(cx, cy - 4);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx, cy + 26); ctx.lineTo(cx + 8, cy); ctx.lineTo(cx, cy + 4);
        ctx.closePath(); ctx.fill();
        ctx.font = '700 13px sans-serif'; ctx.fillStyle = '#ef4444';
        ctx.fillText('N', cx - 5, cy - 32);
        break;
      }
      case 'eng-level-marker': {
        const cx = x + w / 2;
        // Inverted surveyor triangle
        ctx.beginPath();
        ctx.moveTo(cx - 14, y + 10); ctx.lineTo(cx + 14, y + 10); ctx.lineTo(cx, y + 26);
        ctx.closePath(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, y + 10); ctx.lineTo(cx, y + 26);
        ctx.moveTo(cx - 14, y + 10); ctx.lineTo(cx, y + 26);
        ctx.fillStyle = color; ctx.fill();
        engBadge(ctx, cx, y + 42, 'FFL +3.500 m', '#facc15');
        break;
      }
      case 'eng-hatch-concrete': {
        ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);
        // Small triangles + dots
        [[x+25, y+25], [x+65, y+35], [x+40, y+55], [x+80, y+65]].forEach(([tx, ty]) => {
          ctx.beginPath();
          ctx.moveTo(tx, ty); ctx.lineTo(tx + 6, ty - 6); ctx.lineTo(tx + 12, ty);
          ctx.closePath(); ctx.fill();
        });
        engBadge(ctx, x + w / 2, y + h + 16, 'Concrete [ISO 128]', color);
        break;
      }
      case 'eng-hatch-brick': {
        ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);
        ctx.setLineDash([1000]);
        for (let i = -20; i < w + h; i += 18) {
          ctx.beginPath();
          ctx.moveTo(x + 10 + i, y + 10); ctx.lineTo(x + 10 + i - 30, y + h - 10);
          ctx.stroke();
        }
        engBadge(ctx, x + w / 2, y + h + 16, 'Brick Hatching', color);
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // 6. PROCESS, CHEMICAL & INDUSTRIAL P&ID (ISA-5.1 / ISO 10628)
      // ─────────────────────────────────────────────────────────────
      case 'eng-cstr-reactor': {
        const cx = x + w / 2, cy = y + h * 0.45;
        // Dished vessel body
        ctx.strokeRect(cx - 36, cy - 35, 72, 70);
        // Top motor & agitator shaft
        ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.fillRect(cx - 14, cy - 55, 28, 20);
        ctx.strokeRect(cx - 14, cy - 55, 28, 20);
        ctx.beginPath(); ctx.moveTo(cx, cy - 35); ctx.lineTo(cx, cy + 20); ctx.stroke();
        // Impeller blades
        ctx.fillRect(cx - 24, cy + 18, 48, 8);
        engBadge(ctx, cx, y + h + 16, 'CSTR Reactor', color);
        break;
      }
      case 'eng-tank-storage': {
        const cx = x + w / 2, my = y + h * 0.45;
        ctx.strokeRect(cx - 40, my - 35, 80, 70);
        // Conical roof
        ctx.beginPath();
        ctx.moveTo(cx - 40, my - 35); ctx.lineTo(cx, my - 50); ctx.lineTo(cx + 40, my - 35);
        ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Storage Tank (TK-101)', color);
        break;
      }
      case 'eng-pressure-vessel': {
        const cy = y + h * 0.42;
        // Horizontal cylinder with semi-elliptical heads
        ctx.strokeRect(x + 35, cy - 25, w - 70, 50);
        ctx.beginPath();
        ctx.ellipse(x + 35, cy, 18, 25, 0, PI * 0.5, PI * 1.5);
        ctx.ellipse(x + w - 35, cy, 18, 25, 0, -PI * 0.5, PI * 0.5);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Pressure Vessel (V-102)', color);
        break;
      }
      case 'eng-heat-exchanger': {
        const cx = x + w / 2, cy = y + h * 0.4;
        ctx.beginPath(); ctx.arc(cx, cy, 32, 0, PI * 2); ctx.stroke();
        // Baffle tubes
        ctx.beginPath();
        ctx.moveTo(cx - 22, cy - 14); ctx.lineTo(cx + 22, cy - 14);
        ctx.moveTo(cx - 28, cy); ctx.lineTo(cx + 28, cy);
        ctx.moveTo(cx - 22, cy + 14); ctx.lineTo(cx + 22, cy + 14);
        ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Heat Exchanger (E-201)', color);
        break;
      }
      case 'eng-distill-col': {
        const cx = x + w / 2;
        ctx.strokeRect(cx - 25, y + 15, 50, h - 50);
        // Trays
        for (let i = 1; i <= 6; i++) {
          const ty = y + 15 + i * ((h - 50) / 7);
          ctx.beginPath();
          ctx.moveTo(cx - 25, ty); ctx.lineTo(cx + 25, ty);
          ctx.stroke();
        }
        engBadge(ctx, cx, y + h + 16, 'Distillation (C-101)', color);
        break;
      }
      case 'eng-cooling-tower': {
        const cx = x + w / 2;
        // Hyperbolic profile
        ctx.beginPath();
        ctx.moveTo(cx - 38, y + h - 35);
        ctx.quadraticCurveTo(cx - 18, y + h * 0.4, cx - 26, y + 15);
        ctx.lineTo(cx + 26, y + 15);
        ctx.quadraticCurveTo(cx + 18, y + h * 0.4, cx + 38, y + h - 35);
        ctx.closePath(); ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Cooling Tower', color);
        break;
      }
      case 'eng-pump-centrif': {
        const cx = x + 45, cy = y + h * 0.45;
        ctx.beginPath(); ctx.arc(cx, cy, 24, 0, PI * 2); ctx.stroke();
        // Tangential discharge port
        ctx.beginPath();
        ctx.moveTo(cx, cy - 24); ctx.lineTo(x + w - 15, cy - 24);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Centrif. Pump (P-101)', color);
        break;
      }
      case 'eng-valv-gate': {
        const cx = x + w / 2, my = y + h * 0.42;
        // Opposed triangles
        ctx.beginPath();
        ctx.moveTo(cx - 28, my - 14); ctx.lineTo(cx, my); ctx.lineTo(cx - 28, my + 14);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 28, my - 14); ctx.lineTo(cx, my); ctx.lineTo(cx + 28, my + 14);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Gate Valve', color);
        break;
      }
      case 'eng-valv-globe': {
        const cx = x + w / 2, my = y + h * 0.42;
        ctx.beginPath();
        ctx.moveTo(cx - 28, my - 14); ctx.lineTo(cx, my); ctx.lineTo(cx - 28, my + 14);
        ctx.closePath(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 28, my - 14); ctx.lineTo(cx, my); ctx.lineTo(cx + 28, my + 14);
        ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, my, 6, 0, PI * 2); ctx.fill();
        engBadge(ctx, cx, y + h + 16, 'Globe Valve', color);
        break;
      }
      case 'eng-valv-check': {
        const cx = x + w / 2, my = y + h * 0.42;
        ctx.beginPath();
        ctx.moveTo(cx - 24, my - 14); ctx.lineTo(cx + 16, my); ctx.lineTo(cx - 24, my + 14);
        ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 16, my - 14); ctx.lineTo(cx + 16, my + 14); ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Check Valve', color);
        break;
      }
      case 'eng-valv-control': {
        const cx = x + w / 2, my = y + h * 0.55;
        // Opposed triangles
        ctx.beginPath();
        ctx.moveTo(cx - 24, my - 12); ctx.lineTo(cx, my); ctx.lineTo(cx - 24, my + 12);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 24, my - 12); ctx.lineTo(cx, my); ctx.lineTo(cx + 24, my + 12);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Actuator stem and diaphragm mushroom
        ctx.beginPath(); ctx.moveTo(cx, my); ctx.lineTo(cx, y + 26); ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, y + 26, 22, PI, 0); ctx.closePath();
        ctx.fillStyle = 'rgba(245, 158, 11, 0.3)'; ctx.fill(); ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Control Valve (CV)', color);
        break;
      }
      case 'eng-valv-psv': {
        const cx = x + w / 2, my = y + h * 0.52;
        ctx.beginPath();
        ctx.moveTo(cx - 22, my - 12); ctx.lineTo(cx, my); ctx.lineTo(cx - 22, my + 12);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 22, my - 12); ctx.lineTo(cx, my); ctx.lineTo(cx + 22, my + 12);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Spring relief hood
        ctx.beginPath(); ctx.moveTo(cx, my); ctx.lineTo(cx, y + 18); ctx.stroke();
        ctx.strokeRect(cx - 10, y + 10, 20, 24);
        engBadge(ctx, cx, y + h + 16, 'Safety PSV', '#ef4444');
        break;
      }
      case 'eng-inst-pi': {
        drawPIDBubble(ctx, x + w / 2, y + h / 2, 26, 'PI', '101', false, false);
        break;
      }
      case 'eng-inst-pt': {
        drawPIDBubble(ctx, x + w / 2, y + h / 2, 26, 'PT', '102', false, false);
        break;
      }
      case 'eng-inst-ti': {
        drawPIDBubble(ctx, x + w / 2, y + h / 2, 26, 'TI', '201', false, false);
        break;
      }
      case 'eng-inst-fic': {
        drawPIDBubble(ctx, x + w / 2, y + h / 2, 28, 'FIC', '301', true, true);
        break;
      }
      case 'eng-inst-lic': {
        drawPIDBubble(ctx, x + w / 2, y + h / 2, 28, 'LIC', '401', true, true);
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // 7. COMPUTER, SOFTWARE & NETWORKING
      // ─────────────────────────────────────────────────────────────
      case 'eng-flow-terminator': {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x + 10, y + 8, w - 20, h - 22, 18);
        else ctx.rect(x + 10, y + 8, w - 20, h - 22);
        ctx.fill(); ctx.stroke();
        engBadge(ctx, x + w / 2, y + h / 2 - 3, 'Start / Stop', '#38bdf8');
        break;
      }
      case 'eng-flow-process': {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fillRect(x + 10, y + 8, w - 20, h - 22);
        ctx.strokeRect(x + 10, y + 8, w - 20, h - 22);
        engBadge(ctx, x + w / 2, y + h / 2 - 3, 'Process: x = a + b', '#10b981');
        break;
      }
      case 'eng-flow-decision': {
        const cx = x + w / 2, cy = y + h * 0.44;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 28); ctx.lineTo(cx + 60, cy); ctx.lineTo(cx, cy + 28); ctx.lineTo(cx - 60, cy);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        engBadge(ctx, cx, cy, 'Is valid?', '#facc15');
        break;
      }
      case 'eng-flow-io': {
        const my = y + h * 0.44;
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.beginPath();
        ctx.moveTo(x + 28, my - 20); ctx.lineTo(x + w - 10, my - 20);
        ctx.lineTo(x + w - 28, my + 20); ctx.lineTo(x + 10, my + 20);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        engBadge(ctx, x + w / 2, my, 'Input / Output', '#a855f7');
        break;
      }
      case 'eng-flow-database': {
        const cx = x + w / 2;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
        ctx.fillRect(x + 15, y + 20, w - 30, h - 36);
        ctx.strokeRect(x + 15, y + 20, w - 30, h - 36);
        // Top and bottom ellipses
        ctx.beginPath(); ctx.ellipse(cx, y + 20, (w - 30) / 2, 8, 0, 0, PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, y + h - 16, (w - 30) / 2, 8, 0, 0, PI); ctx.stroke();
        engBadge(ctx, cx, y + h / 2, 'Database / SQL', color);
        break;
      }
      case 'eng-flow-document': {
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 10); ctx.lineTo(x + w - 15, y + 10);
        ctx.lineTo(x + w - 15, y + h - 22);
        ctx.quadraticCurveTo(x + w * 0.6, y + h - 10, x + w * 0.4, y + h - 22);
        ctx.quadraticCurveTo(x + w * 0.2, y + h - 34, x + 15, y + h - 22);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; ctx.fill(); ctx.stroke();
        engBadge(ctx, x + w / 2, y + h / 2 - 6, 'Document Report', color);
        break;
      }
      case 'eng-arch-cpu': {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(x + 20, y + 20, w - 40, h - 40);
        ctx.strokeRect(x + 20, y + 20, w - 40, h - 40);
        // Pins on perimeter
        for (let i = 0; i < 6; i++) {
          const off = 28 + i * 14;
          ctx.beginPath();
          ctx.moveTo(x + off, y + 8); ctx.lineTo(x + off, y + 20);
          ctx.moveTo(x + off, y + h - 20); ctx.lineTo(x + off, y + h - 8);
          ctx.stroke();
        }
        engBadge(ctx, x + w / 2, y + h / 2, 'CPU 64-Bit Core', '#facc15');
        break;
      }
      case 'eng-arch-alu': {
        // V-shaped ALU box
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 15); ctx.lineTo(x + 55, y + 15); ctx.lineTo(x + w / 2, y + 35);
        ctx.lineTo(x + w - 55, y + 15); ctx.lineTo(x + w - 15, y + 15);
        ctx.lineTo(x + w - 35, y + h - 25); ctx.lineTo(x + 35, y + h - 25);
        ctx.closePath();
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'; ctx.fill(); ctx.stroke();
        engBadge(ctx, x + w / 2, y + h / 2 + 5, 'ALU Unit', '#f59e0b');
        break;
      }
      case 'eng-arch-bus': {
        const my = y + h / 2;
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x + 10, my); ctx.lineTo(x + w - 10, my); ctx.stroke();
        ctx.lineWidth = 2;
        drawArrow(ctx, x + 30, my, x + 10, my, 8, true);
        drawArrow(ctx, x + w - 30, my, x + w - 10, my, 8, true);
        engBadge(ctx, x + w / 2, my, '32-Bit System Bus', '#38bdf8');
        break;
      }
      case 'eng-net-router': {
        const cx = x + w / 2, cy = y + h * 0.45;
        ctx.beginPath(); ctx.arc(cx, cy, 26, 0, PI * 2); ctx.stroke();
        // 4 standard router arrows
        drawArrow(ctx, cx - 18, cy, cx - 6, cy, 6, true);
        drawArrow(ctx, cx + 18, cy, cx + 6, cy, 6, true);
        drawArrow(ctx, cx, cy - 18, cx, cy - 6, 6, true);
        drawArrow(ctx, cx, cy + 18, cx, cy + 6, 6, true);
        engBadge(ctx, cx, y + h + 16, 'Router (L3)', color);
        break;
      }
      case 'eng-net-switch': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.strokeRect(cx - 45, cy - 16, 90, 32);
        // Opposing horizontal arrows
        drawArrow(ctx, cx - 30, cy - 6, cx + 30, cy - 6, 7, true);
        drawArrow(ctx, cx + 30, cy + 6, cx - 30, cy + 6, 7, true);
        engBadge(ctx, cx, y + h + 16, 'Switch (L2)', color);
        break;
      }
      case 'eng-net-firewall': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.strokeRect(cx - 36, cy - 24, 72, 48);
        ctx.beginPath();
        ctx.moveTo(cx - 36, cy); ctx.lineTo(cx + 36, cy);
        ctx.moveTo(cx, cy - 24); ctx.lineTo(cx, cy);
        ctx.moveTo(cx - 18, cy); ctx.lineTo(cx - 18, cy + 24);
        ctx.moveTo(cx + 18, cy); ctx.lineTo(cx + 18, cy + 24);
        ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Firewall Security', '#ef4444');
        break;
      }
      case 'eng-net-server': {
        const cx = x + w / 2;
        for (let i = 0; i < 3; i++) {
          const sy = y + 12 + i * 24;
          ctx.strokeRect(cx - 38, sy, 76, 20);
          ctx.beginPath(); ctx.arc(cx + 26, sy + 10, 3, 0, PI * 2); ctx.fill();
        }
        engBadge(ctx, cx, y + h + 16, 'Server Rack Stack', color);
        break;
      }
      case 'eng-net-cloud': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.beginPath();
        ctx.arc(cx - 24, cy + 6, 18, PI * 0.6, PI * 1.8);
        ctx.arc(cx, cy - 12, 22, PI * 0.9, PI * 2.1);
        ctx.arc(cx + 26, cy + 6, 18, PI * 1.2, PI * 0.4);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; ctx.fill(); ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Cloud Network', color);
        break;
      }
      case 'eng-net-client': {
        const cx = x + w / 2;
        // Monitor
        ctx.strokeRect(cx - 30, y + 10, 60, 42);
        ctx.strokeRect(cx - 8, y + 52, 16, 10);
        ctx.strokeRect(cx - 20, y + 62, 40, 4);
        engBadge(ctx, cx, y + h + 16, 'Client Workstation', color);
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // 8. AUTOMOTIVE, AEROSPACE, BIOMEDICAL & RENEWABLE
      // ─────────────────────────────────────────────────────────────
      case 'eng-auto-engine': {
        const cx = x + w / 2, cy = y + h * 0.42;
        ctx.strokeRect(cx - 45, cy - 30, 90, 60);
        // Cylinders
        ctx.strokeRect(cx - 35, cy - 25, 20, 45);
        ctx.strokeRect(cx + 15, cy - 25, 20, 45);
        engBadge(ctx, cx, y + h + 16, 'V6 Engine Block', color);
        break;
      }
      case 'eng-auto-piston': {
        const cx = x + w / 2;
        // Piston crown
        ctx.strokeRect(cx - 25, y + 12, 50, 40);
        // Rings
        ctx.beginPath();
        ctx.moveTo(cx - 25, y + 20); ctx.lineTo(cx + 25, y + 20);
        ctx.moveTo(cx - 25, y + 28); ctx.lineTo(cx + 25, y + 28);
        ctx.stroke();
        // Connecting rod
        ctx.beginPath(); ctx.moveTo(cx, y + 52); ctx.lineTo(cx, y + h - 25); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, y + h - 25, 12, 0, PI * 2); ctx.stroke();
        engBadge(ctx, cx, y + h + 16, 'Piston & Rod', color);
        break;
      }
      case 'eng-auto-battery': {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
        ctx.fillRect(x + 10, y + 12, w - 20, 38);
        ctx.strokeRect(x + 10, y + 12, w - 20, 38);
        engBadge(ctx, x + w / 2, y + 31, 'EV BATTERY 800V', '#22c55e');
        break;
      }
      case 'eng-aero-airfoil': {
        // NACA Cambered Airfoil
        const my = y + h * 0.45;
        ctx.beginPath();
        ctx.moveTo(x + 15, my);
        ctx.bezierCurveTo(x + 20, my - 24, x + w * 0.4, my - 20, x + w - 15, my);
        ctx.bezierCurveTo(x + w * 0.5, my + 8, x + 25, my + 14, x + 15, my);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; ctx.fill(); ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'NACA 2412 Airfoil', color);
        break;
      }
      case 'eng-aero-forces': {
        const cx = x + w / 2, cy = y + h * 0.45;
        // Central aircraft circle
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, PI * 2); ctx.fill();
        // 4 Vectors
        drawArrow(ctx, cx, cy, cx, cy - 45, 9, true); // Lift
        drawArrow(ctx, cx, cy, cx, cy + 45, 9, true); // Weight
        drawArrow(ctx, cx, cy, cx + 55, cy, 9, true); // Thrust
        drawArrow(ctx, cx, cy, cx - 55, cy, 9, true); // Drag
        ctx.font = '700 11px sans-serif';
        ctx.fillText('L⃗ Lift', cx + 6, cy - 38);
        ctx.fillText('W⃗ Weight', cx + 6, cy + 44);
        ctx.fillText('T⃗ Thrust', cx + 25, cy - 8);
        ctx.fillText('D⃗ Drag', cx - 55, cy - 8);
        break;
      }
      case 'eng-aero-nozzle': {
        const my = y + h * 0.45;
        ctx.beginPath();
        ctx.moveTo(x + 15, my - 26); ctx.lineTo(x + 55, my - 8); ctx.lineTo(x + w - 15, my - 32);
        ctx.lineTo(x + w - 15, my + 32); ctx.lineTo(x + 55, my + 8); ctx.lineTo(x + 15, my + 26);
        ctx.closePath();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'; ctx.fill(); ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'De Laval Nozzle', '#ef4444');
        break;
      }
      case 'eng-bio-ecg-wave': {
        const my = y + h * 0.45;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(x + 8, my);
        ctx.lineTo(x + 35, my);
        // P-wave
        ctx.quadraticCurveTo(x + 45, my - 10, x + 55, my);
        ctx.lineTo(x + 70, my);
        // Q-R-S
        ctx.lineTo(x + 76, my + 8);
        ctx.lineTo(x + 88, my - 36);
        ctx.lineTo(x + 100, my + 16);
        ctx.lineTo(x + 106, my);
        // T-wave
        ctx.lineTo(x + 120, my);
        ctx.quadraticCurveTo(x + 135, my - 16, x + 150, my);
        ctx.lineTo(x + w - 8, my);
        ctx.strokeStyle = '#22c55e'; ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'ECG Lead II (P-QRS-T)', '#22c55e');
        break;
      }
      case 'eng-bio-pulseox': {
        const cx = x + w / 2;
        ctx.strokeRect(cx - 30, y + 10, 60, 48);
        engBadge(ctx, cx, y + 34, 'SpO₂ 98%', '#22c55e');
        engBadge(ctx, cx, y + h + 16, 'Pulse Oximeter', color);
        break;
      }
      case 'eng-renew-solar-pv': {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.fillRect(x + 10, y + 10, w - 20, 65);
        ctx.strokeRect(x + 10, y + 10, w - 20, 65);
        // Cell grid lines
        for (let i = 1; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(x + 10 + i * ((w - 20) / 4), y + 10);
          ctx.lineTo(x + 10 + i * ((w - 20) / 4), y + 75);
          ctx.stroke();
        }
        for (let j = 1; j < 3; j++) {
          ctx.beginPath();
          ctx.moveTo(x + 10, y + 10 + j * (65 / 3));
          ctx.lineTo(x + w - 10, y + 10 + j * (65 / 3));
          ctx.stroke();
        }
        engBadge(ctx, x + w / 2, y + h + 16, 'Solar PV Module [400W]', '#facc15');
        break;
      }
      case 'eng-renew-wind': {
        const cx = x + w / 2, cy = y + 42;
        // Tower
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy); ctx.lineTo(cx - 14, y + h - 25);
        ctx.lineTo(cx + 14, y + h - 25); ctx.lineTo(cx + 6, cy);
        ctx.stroke();
        // Hub & 3 blades
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, PI * 2); ctx.fill();
        for (let i = 0; i < 3; i++) {
          const ang = (i * PI * 2) / 3 - PI / 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + 36 * Math.cos(ang), cy + 36 * Math.sin(ang));
          ctx.lineWidth = 3.5; ctx.stroke(); ctx.lineWidth = 2;
        }
        engBadge(ctx, cx, y + h + 16, 'Wind Turbine (3MW)', color);
        break;
      }
      case 'eng-renew-fuelcell': {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
        ctx.fillRect(x + 15, y + 10, w - 30, 55);
        ctx.strokeRect(x + 15, y + 10, w - 30, 55);
        engBadge(ctx, x + w / 2, y + 36, 'H₂ + O₂ → H₂O + e⁻', '#38bdf8');
        engBadge(ctx, x + w / 2, y + h + 16, 'PEM Fuel Cell', '#22c55e');
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // 9. ENGINEERING GRAPHS & ANALYSIS
      // ─────────────────────────────────────────────────────────────
      case 'eng-graph-stress-strain': {
        const axX = x + 24, axY = y + h - 25;
        // Axes
        ctx.beginPath();
        ctx.moveTo(axX, y + 10); ctx.lineTo(axX, axY); ctx.lineTo(x + w - 10, axY);
        ctx.stroke();
        // Stress-strain curve
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(axX, axY);
        ctx.lineTo(axX + 28, axY - 55); // Elastic slope
        ctx.quadraticCurveTo(axX + 45, axY - 60, axX + 65, axY - 54); // Yield plateau
        ctx.quadraticCurveTo(axX + 95, axY - 80, axX + 115, axY - 76); // UTS
        ctx.lineTo(axX + 130, axY - 65); // Fracture
        ctx.strokeStyle = '#ef4444'; ctx.stroke();
        // Fracture X
        ctx.fillText('✕', axX + 130, axY - 65);
        ctx.font = '700 9.5px sans-serif'; ctx.fillStyle = '#f8fafc';
        ctx.fillText('σ (Stress)', axX + 4, y + 14);
        ctx.fillText('ε (Strain)', x + w - 40, axY + 14);
        engBadge(ctx, x + w / 2, y + h + 16, 'Stress-Strain Curve', color);
        break;
      }
      case 'eng-graph-sfd-bmd': {
        const my1 = y + 35, my2 = y + 80;
        ctx.strokeRect(x + 20, my1 - 15, w - 40, 30);
        ctx.strokeRect(x + 20, my2 - 15, w - 40, 30);
        engBadge(ctx, x + 45, my1, 'SFD', '#38bdf8');
        engBadge(ctx, x + 45, my2, 'BMD', '#facc15');
        engBadge(ctx, x + w / 2, y + h + 16, 'Beam SFD & BMD', color);
        break;
      }
      case 'eng-graph-bode': {
        const axX = x + 24, axY = y + h - 25;
        ctx.beginPath();
        ctx.moveTo(axX, y + 10); ctx.lineTo(axX, axY); ctx.lineTo(x + w - 10, axY);
        ctx.stroke();
        // 20dB/dec roll-off curve
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(axX, y + 25); ctx.lineTo(axX + 50, y + 25);
        ctx.lineTo(x + w - 15, axY - 10);
        ctx.strokeStyle = '#38bdf8'; ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'Bode Plot (-20dB/dec)', color);
        break;
      }
      case 'eng-graph-pv': {
        const axX = x + 24, axY = y + h - 25;
        ctx.beginPath();
        ctx.moveTo(axX, y + 10); ctx.lineTo(axX, axY); ctx.lineTo(x + w - 10, axY);
        ctx.stroke();
        // Closed Otto/Carnot loop
        ctx.beginPath();
        ctx.moveTo(axX + 25, axY - 70);
        ctx.quadraticCurveTo(axX + 60, axY - 50, axX + 110, axY - 25);
        ctx.lineTo(axX + 110, axY - 10);
        ctx.quadraticCurveTo(axX + 50, axY - 20, axX + 25, axY - 70);
        ctx.strokeStyle = '#f59e0b'; ctx.stroke();
        engBadge(ctx, x + w / 2, y + h + 16, 'P-V Indicator Loop', color);
        break;
      }
      case 'eng-graph-mohr': {
        const cx = x + w / 2, cy = y + h * 0.44, r = 36;
        ctx.beginPath();
        ctx.moveTo(x + 10, cy); ctx.lineTo(x + w - 10, cy);
        ctx.moveTo(cx, y + 10); ctx.lineTo(cx, y + h - 25);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.strokeStyle = '#ef4444'; ctx.stroke();
        engBadge(ctx, cx, y + h + 16, "Mohr's Circle (2D Stress)", color);
        break;
      }
      case 'eng-graph-feedback': {
        const my = y + h * 0.42;
        // Summing junction
        ctx.beginPath(); ctx.arc(x + 30, my, 10, 0, PI * 2); ctx.stroke();
        // Plant block G(s)
        ctx.strokeRect(x + 70, my - 16, 50, 32);
        // Feedback block H(s)
        ctx.strokeRect(x + 70, my + 24, 50, 24);
        drawArrow(ctx, x + 8, my, x + 20, my, 6, true);
        drawArrow(ctx, x + 40, my, x + 70, my, 6, true);
        drawArrow(ctx, x + 120, my, x + w - 8, my, 6, true);
        engBadge(ctx, x + 95, my, 'G(s)', '#38bdf8');
        engBadge(ctx, x + 95, my + 36, 'H(s)', '#facc15');
        engBadge(ctx, x + w / 2, y + h + 16, 'Closed-Loop System', color);
        break;
      }

      // Default fallback
      default: {
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6); else ctx.rect(x, y, w, h);
        ctx.stroke();
        engBadge(ctx, x + w / 2, y + h / 2, s.label || s.type, color);
        break;
      }
    }

    if (s.selected) {
      selectionHandles(ctx, x, y, w, h);
    }

    ctx.restore();
  }

  return {
    ENGINEERING_SHAPE_DEFS,
    isEngineeringShape,
    getBounds,
    draw
  };
})();
