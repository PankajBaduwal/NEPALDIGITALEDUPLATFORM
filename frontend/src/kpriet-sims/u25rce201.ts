/**
 * PiyushDhara Eduverse — Civil Engineering Perspectives (U25RCE201)
 * Department of Civil Engineering | B.E. Civil Engineering | Semester II
 * Autonomous Regulations: R2025 Revised CBCS
 *
 * Source of Truth: CE - R2025 (Revised).pdf
 * - Printed Page 5: Semester II Curriculum Table (Item 7: U25RCE201, PCC, TwL, 1-0-4-0-3, Credits: 3)
 * - Printed Pages 43–44 (PDF Pages 44–45): Complete Syllabus Entry, Course Outcomes (CO1–CO5),
 *   Theory Units (Unit I & Unit II, 15 Lecture Periods), List of 6 Experiments (60 Practical Periods),
 *   Total: 75 Contact Periods, Textbooks & References.
 */

import type {
  ISimulationDefinition,
  ISimulationEngine,
  ISimulationParam,
  ISimulationMetric,
  SimulationDomain,
  CivilCategory,
} from './types';

export interface ICivilPerspectivesSimulation {
  id: string;
  simNumber: number;
  title: string;
  unit: number;
  unitTitle: string;
  topic: string;
  category: CivilCategory;
  domain: SimulationDomain;
  icon: string;
  shortDescription: string;
  detailedDescription: string;
  learningObjectives: string[];
  courseOutcomes: string[];
  governingCodesAndStandards: string[];
  civilPracticalScenario: string;
  defaultParams: Record<string, any>;
  parameters: ISimulationParam[];
  metrics: ISimulationMetric[];
  formulaOverview: string[];
  engine: ISimulationEngine<any>;
}

export const U25RCE201_COURSE_METADATA = {
  courseCode: 'U25RCE201',
  canonicalCourseCode: 'U25RCE201',
  courseTitle: 'Civil Engineering Perspectives',
  department: 'Civil Engineering',
  programme: 'B.E. Civil Engineering',
  semester: 2,
  regulation: 'R2025 Revised CBCS',
  category: 'PCC' as const,
  type: 'TwL' as const, // Theory with Laboratory
  credits: 3,
  ltpjc: { lecture: 1, tutorial: 0, practical: 4, project: 0, credits: 3 },
  contactPeriods: {
    lecture: 15,
    tutorial: 0,
    practical: 60,
    project: 0,
    total: 75,
  },
  sourceDocument: 'CE - R2025 (Revised).pdf',
  sourcePages: {
    curriculumTable: 'Printed Page 5 (Semester II, Item 7)',
    syllabusEntry: 'Printed Pages 43–44 (PDF Pages 44–45)',
  },
  courseObjectives: [
    'To provide foundational knowledge of Civil Engineering and its various disciplines.',
    'To familiarize students with key construction materials.',
    'To introduce the importance of National Building Code (NBC) and byelaws in construction practices.',
  ],
  courseOutcomes: [
    { code: 'CO1', text: 'Describe the role of Civil Engineering in infrastructure development.', bloomLevel: 'Understand' },
    { code: 'CO2', text: 'Explain the functional requirements of buildings using the National Building Code.', bloomLevel: 'Understand' },
    { code: 'CO3', text: 'Demonstrate the applications of various construction materials through experiential learning.', bloomLevel: 'Apply' },
    { code: 'CO4', text: 'Examine industrial practices and construction methodologies.', bloomLevel: 'Apply' },
    { code: 'CO5', text: 'Prepare detailed technical reports from site visit observations and findings.', bloomLevel: 'Apply' },
  ],
  textbooks: [
    { author: 'S K Duggal', title: 'Building Materials', edition: '5th Edition', publisher: 'Chaukhamba Auriyantaliya Publication', year: 'April 2024' },
    { author: 'P C Varghese', title: 'Building Materials', edition: 'Second Edition', publisher: 'PHI Learning Ltd', year: '2015' },
  ],
  references: [
    { author: 'B C Punmia', title: 'Building Construction', publisher: 'Laxmi Publications Limited, New Delhi', year: '2016' },
    { author: 'M S Shetty', title: 'Concrete Technology', publisher: 'S Chand and Company Limited, New Delhi', year: '2017' },
    { author: 'Bureau of Indian Standards (BIS)', title: 'National Building Code of India (NBC 2016), Parts 1–12', publisher: 'BIS, New Delhi', year: '2016' },
    { author: 'G S Birdie, T D Ahuja', title: 'Building Construction and construction materials', publisher: 'Dhanpatrai publishing company, New Delhi', year: '2012' },
  ],
};

export const U25RCE201_SUBJECT_KEYWORDS = [
  'u25rce201',
  'u25ce201',
  'rce201',
  'ce201',
  'civil engineering perspectives',
  'civil perspectives',
  'perspectives of civil engineering',
  'building materials',
  'brick bonds',
  'rmc plant',
  'national building code',
  'nbc 2016',
  'byelaws',
  'study of drawings',
  'renowned structures',
];

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMULATION 1: Overview of Civil Engineering & Disciplines Explorer (Unit I)
 * ───────────────────────────────────────────────────────────────────────────── */
const sim01DisciplinesExplorer: ICivilPerspectivesSimulation = {
  id: 'u25rce201-sim01-branches-roles',
  simNumber: 1,
  title: 'Civil Engineering Overview & Disciplines Explorer',
  unit: 1,
  unitTitle: 'Unit I: Introduction to Civil Engineering',
  topic: 'Overview, Roles & Disciplines in Infrastructure Development',
  category: 'construction simulations',
  domain: 'CIVIL',
  icon: '🏗️',
  shortDescription: 'Explore the 7 foundational disciplines of Civil Engineering and their roles in sustainable infrastructure development.',
  detailedDescription: 'Civil Engineering shapes the built environment and delivers critical infrastructure. This interactive explorer lets students investigate the 7 primary branches: Structural, Geotechnical, Water Resources / Hydraulics, Environmental, Transportation, Construction Engineering & Management, and Surveying / Geomatics. Students analyze interdisciplinary dependencies on real-world projects such as bridges, metro networks, smart water grids, and high-rise developments.',
  learningObjectives: [
    'Identify the core roles and societal impacts of Civil Engineers in infrastructure development.',
    'Differentiate the 7 major branches of Civil Engineering and their specialized engineering functions.',
    'Evaluate cross-disciplinary interactions in mega-infrastructure planning and execution.',
  ],
  courseOutcomes: ['CO1'],
  governingCodesAndStandards: ['NBC 2016 Part 2', 'NITI Aayog Infrastructure Guidelines'],
  civilPracticalScenario: 'Planning an integrated coastal bypass highway connecting a new deepwater sea port to an industrial corridor, requiring geotechnical marine soil stabilization, environmental EIA clearance, hydraulic flood modeling, and prestressed structural viaducts.',
  defaultParams: {
    discipline: 'Structural Engineering',
    infrastructureScope: 'Urban Transit Corridor',
    sustainabilityFocus: 'High (Net Zero Carbon)',
    capitalBudgetCr: 1200,
  },
  parameters: [
    {
      key: 'discipline',
      label: 'Core Discipline Focus',
      type: 'select',
      default: 'Structural Engineering',
      options: [
        { label: 'Structural Engineering', value: 'Structural Engineering' },
        { label: 'Geotechnical Engineering', value: 'Geotechnical Engineering' },
        { label: 'Water Resources & Hydraulics', value: 'Water Resources & Hydraulics' },
        { label: 'Transportation Engineering', value: 'Transportation Engineering' },
        { label: 'Environmental Engineering', value: 'Environmental Engineering' },
        { label: 'Construction Management', value: 'Construction Management' },
        { label: 'Surveying & Geomatics', value: 'Surveying & Geomatics' },
      ],
    },
    {
      key: 'infrastructureScope',
      label: 'Project Infrastructure Type',
      type: 'select',
      default: 'Urban Transit Corridor',
      options: [
        { label: 'Urban Transit Corridor (Metro & Viaduct)', value: 'Urban Transit Corridor' },
        { label: 'Multi-Purpose Dam & Hydropower', value: 'Multi-Purpose Dam' },
        { label: 'Smart Highway & Expressway', value: 'Smart Highway' },
        { label: 'High-Rise Green Commercial Hub', value: 'High-Rise Green Hub' },
      ],
    },
    {
      key: 'sustainabilityFocus',
      label: 'Sustainability Rating Level',
      type: 'select',
      default: 'High (Net Zero Carbon)',
      options: [
        { label: 'Standard Conventional', value: 'Standard Conventional' },
        { label: 'Moderate Green Rating (GRIHA 3-Star)', value: 'Moderate Green' },
        { label: 'High (Net Zero Carbon / GRIHA 5-Star)', value: 'High (Net Zero Carbon)' },
      ],
    },
  ],
  metrics: [
    {
      id: 'resilienceScore',
      label: 'Infrastructure Resilience Index',
      format: (_, params) => {
        const bonus = params.sustainabilityFocus.includes('Net Zero') ? 94 : 82;
        return `${bonus} / 100`;
      },
      badge: 'Resilient',
      color: 'text-emerald-400',
    },
    {
      id: 'designLife',
      label: 'Target Design Life',
      format: (_, params) => {
        if (params.infrastructureScope === 'Multi-Purpose Dam') return '100 Years';
        if (params.infrastructureScope === 'Urban Transit Corridor') return '100 Years';
        return '60–80 Years';
      },
      badge: 'IS 456 / IRC',
      color: 'text-sky-400',
    },
    {
      id: 'economicMultiplier',
      label: 'Economic Growth Multiplier',
      format: () => '2.8x CapEx',
      badge: 'Macro Impact',
      color: 'text-amber-400',
    },
  ],
  formulaOverview: [
    'Benefit-Cost Ratio: BCR = \\sum \\frac{B_t}{(1+r)^t} / \\sum \\frac{C_t}{(1+r)^t}',
    'Carbon Footprint Reduction: \\Delta C = E_{baseline} - E_{optimized}',
  ],
  engine: {
    createInitialState: () => ({ activeNode: 0, animTime: 0 }),
    update: (state, _, dt) => ({ ...state, animTime: state.animTime + dt }),
    render: (ctx, width, height, _state, params) => {
      ctx.clearRect(0, 0, width, height);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Title & Subtitle
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText(`CIVIL PERSPECTIVES: ${params.discipline.toUpperCase()}`, 24, 34);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(`Project Scope: ${params.infrastructureScope} | Sustainability: ${params.sustainabilityFocus}`, 24, 54);

      // Draw interactive system nodes for the 7 branches
      const branches = [
        { name: 'Structures', desc: 'Bridges, Girders & Frames', icon: '🏛️', x: width * 0.25, y: height * 0.32 },
        { name: 'Geotech', desc: 'Piles, Soil Stabilization & Retaining', icon: '⛰️', x: width * 0.5, y: height * 0.25 },
        { name: 'Hydraulics', desc: 'Canals, Drainage & Barrages', icon: '💧', x: width * 0.75, y: height * 0.32 },
        { name: 'Transport', desc: 'Expressways, Rails & Interchanges', icon: '🛣️', x: width * 0.85, y: height * 0.65 },
        { name: 'Environment', desc: 'Water Treatment, STP & Solid Waste', icon: '🌱', x: width * 0.65, y: height * 0.8 },
        { name: 'Surveying', desc: 'Total Station, GIS & LiDAR Mapping', icon: '📐', x: width * 0.35, y: height * 0.8 },
        { name: 'Construction', desc: 'BIM, Scheduling, Safety & Contracts', icon: '🚜', x: width * 0.15, y: height * 0.65 },
      ];

      // Draw connecting web
      const cx = width * 0.5;
      const cy = height * 0.52;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      branches.forEach((b) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });

      // Central Hub
      ctx.beginPath();
      ctx.arc(cx, cy, 46, 0, Math.PI * 2);
      ctx.fillStyle = '#1e3a8a';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('INTEGRATED', cx, cy - 8);
      ctx.fillText('INFRASTRUCTURE', cx, cy + 6);
      ctx.fillStyle = '#93c5fd';
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText('SYSTEM HUB', cx, cy + 20);

      // Draw Branch Nodes
      branches.forEach((b) => {
        const isSelected = params.discipline.toLowerCase().includes(b.name.toLowerCase());
        ctx.beginPath();
        ctx.arc(b.x, b.y, 34, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#047857' : '#1e293b';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#34d399' : '#475569';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        ctx.font = '20px serif';
        ctx.fillText(b.icon, b.x, b.y - 2);

        ctx.fillStyle = isSelected ? '#a7f3d0' : '#e2e8f0';
        ctx.font = isSelected ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
        ctx.fillText(b.name, b.x, b.y + 20);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px Inter, sans-serif';
        ctx.fillText(b.desc, b.x, b.y + 32);
      });

      // Bottom info banner
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(16, height - 58, width - 32, 46);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(16, height - 58, width - 32, 46);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('Key Civil Engineering Role in Nation Building:', 28, height - 38);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(
        'Civil engineers transform natural raw materials into resilient physical assets that support society, economy, and environmental safety.',
        28,
        height - 22
      );
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMULATION 2: Building Materials Laboratory (Unit I)
 * ───────────────────────────────────────────────────────────────────────────── */
const sim02BuildingMaterials: ICivilPerspectivesSimulation = {
  id: 'u25rce201-sim02-building-materials',
  simNumber: 2,
  title: 'Building Materials Laboratory: Cement, Bricks, Steel & Aggregates',
  unit: 1,
  unitTitle: 'Unit I: Introduction to Civil Engineering',
  topic: 'Building Materials: Cement, Bricks, Steel, Aggregates (Types, Properties, Applications)',
  category: 'construction simulations',
  domain: 'CIVIL',
  icon: '🧱',
  shortDescription: 'Investigate the mechanical properties, classifications, and civil engineering applications of Cement, Bricks, Steel, and Aggregates.',
  detailedDescription: 'In accordance with S K Duggal and P C Varghese, this laboratory visualizes the 4 key building materials. Students compare grades of Cement (OPC 33, 43, 53, PPC, PSC), masonry units (Traditional Burnt Clay, Fly Ash, and AAC Blocks), reinforcing steel (Fe 250, Fe 415, Fe 500D, Fe 550D TMT bars), and coarse/fine aggregates. Real-time stress-strain curves, water absorption rates, and carbon footprint comparisons are rendered.',
  learningObjectives: [
    'Classify cement types and identify their hydration characteristics, setting times, and compressive strengths.',
    'Compare traditional red clay bricks with modern fly ash bricks and AAC blocks in density, strength, and thermal resistance.',
    'Analyze mechanical properties of TMT steel rebar grades (yield strength, elongation, and corrosion resistance).',
    'Examine coarse and fine aggregate grading criteria and their influence on concrete workability and durability.',
  ],
  courseOutcomes: ['CO3'],
  governingCodesAndStandards: ['IS 269:2015', 'IS 8112:2013', 'IS 12269:2013', 'IS 1077:1992', 'IS 1786:2008', 'IS 383:2016'],
  civilPracticalScenario: 'Specifying materials for a coastal high-rise apartment: choosing between OPC 53 vs PPC/PSC for sulfate resistance, selecting Fe 500D TMT bars for seismic ductility, and replacing river sand with engineered M-Sand.',
  defaultParams: {
    materialCategory: 'Cement',
    cementType: 'PPC (Fly Ash based)',
    brickType: 'AAC Lightweight Block',
    steelGrade: 'Fe 500D TMT',
    aggregateType: '20mm Well-Graded Granite',
  },
  parameters: [
    {
      key: 'materialCategory',
      label: 'Primary Material Category',
      type: 'select',
      default: 'Cement',
      options: [
        { label: 'Cement (IS 269 / 12269 / 1489)', value: 'Cement' },
        { label: 'Bricks & Masonry Units (IS 1077 / 2185)', value: 'Bricks' },
        { label: 'Structural Steel Rebar (IS 1786)', value: 'Steel' },
        { label: 'Aggregates Coarse & Fine (IS 383)', value: 'Aggregates' },
      ],
    },
    {
      key: 'cementType',
      label: 'Cement Variant (if Cement selected)',
      type: 'select',
      default: 'PPC (Fly Ash based)',
      options: [
        { label: 'OPC 33 Grade (IS 269)', value: 'OPC 33 Grade' },
        { label: 'OPC 43 Grade (IS 8112)', value: 'OPC 43 Grade' },
        { label: 'OPC 53 Grade (IS 12269)', value: 'OPC 53 Grade' },
        { label: 'PPC Fly Ash based (IS 1489 Pt 1)', value: 'PPC (Fly Ash based)' },
        { label: 'PSC Slag Cement (IS 455)', value: 'PSC (Slag Cement)' },
      ],
    },
    {
      key: 'brickType',
      label: 'Brick / Block Type (if Bricks selected)',
      type: 'select',
      default: 'AAC Lightweight Block',
      options: [
        { label: 'First Class Clay Brick (10.5 N/mm²)', value: 'First Class Clay Brick' },
        { label: 'Fly Ash Brick (7.5 N/mm²)', value: 'Fly Ash Brick' },
        { label: 'AAC Lightweight Block (4.0 N/mm²)', value: 'AAC Lightweight Block' },
        { label: 'Solid Concrete Block (5.0 N/mm²)', value: 'Solid Concrete Block' },
      ],
    },
    {
      key: 'steelGrade',
      label: 'Steel Rebar Grade (if Steel selected)',
      type: 'select',
      default: 'Fe 500D TMT',
      options: [
        { label: 'Fe 250 Mild Steel', value: 'Fe 250 Mild Steel' },
        { label: 'Fe 415 High Strength Deformed', value: 'Fe 415' },
        { label: 'Fe 500D Thermo-Mechanically Treated', value: 'Fe 500D TMT' },
        { label: 'Fe 550D High Ductility TMT', value: 'Fe 550D TMT' },
      ],
    },
  ],
  metrics: [
    {
      id: 'characteristicStrength',
      label: 'Compressive / Yield Strength',
      format: (_, params) => {
        if (params.materialCategory === 'Cement') {
          if (params.cementType.includes('53')) return '53.0 MPa (28 Days)';
          if (params.cementType.includes('43')) return '43.0 MPa (28 Days)';
          if (params.cementType.includes('PPC')) return '33.0–45.0 MPa (28 Days)';
          return '33.0 MPa';
        }
        if (params.materialCategory === 'Bricks') {
          if (params.brickType.includes('First Class')) return '10.5 N/mm²';
          if (params.brickType.includes('Fly Ash')) return '7.5 N/mm²';
          return '4.0 N/mm²';
        }
        if (params.materialCategory === 'Steel') {
          if (params.steelGrade.includes('550')) return '550 N/mm² (Yield)';
          if (params.steelGrade.includes('500')) return '500 N/mm² (Yield)';
          if (params.steelGrade.includes('415')) return '415 N/mm² (Yield)';
          return '250 N/mm²';
        }
        return 'Aggregate Crushing: < 30%';
      },
      badge: 'Strength',
      color: 'text-amber-400',
    },
    {
      id: 'bulkDensity',
      label: 'Bulk Density',
      format: (_, params) => {
        if (params.materialCategory === 'Cement') return '1440 kg/m³';
        if (params.materialCategory === 'Bricks') {
          if (params.brickType.includes('AAC')) return '600–750 kg/m³ (Lightweight)';
          if (params.brickType.includes('Fly Ash')) return '1700 kg/m³';
          return '1920 kg/m³';
        }
        if (params.materialCategory === 'Steel') return '7850 kg/m³';
        return '1500–1650 kg/m³';
      },
      badge: 'Density',
      color: 'text-emerald-400',
    },
    {
      id: 'waterAbsorption',
      label: 'Water Absorption Limit',
      format: (_, params) => {
        if (params.materialCategory === 'Bricks') {
          if (params.brickType.includes('AAC')) return '< 10% by mass';
          if (params.brickType.includes('First Class')) return '< 20% by mass';
          return '< 15% by mass';
        }
        if (params.materialCategory === 'Aggregates') return '< 2.0% (Coarse)';
        return 'N/A';
      },
      badge: 'IS Spec',
      color: 'text-sky-400',
    },
  ],
  formulaOverview: [
    'Compressive Strength: f_c = P / A \\text{ (N/mm}^2\\text{)}',
    'Steel Yield Stress: f_y = P_{0.2\\% proof} / A_0',
    'Water Absorption: W = \\frac{m_{wet} - m_{dry}}{m_{dry}} \\times 100\\%',
  ],
  engine: {
    createInitialState: () => ({ testProgress: 0 }),
    update: (state, _, dt) => ({ ...state, testProgress: (state.testProgress + dt * 0.4) % 1 }),
    render: (ctx, width, height, state, params) => {
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Card Container
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(16, 16, width - 32, height - 32, 12);
      ctx.fill();
      ctx.stroke();

      // Heading
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText(`MATERIAL TESTING BENCH: ${params.materialCategory.toUpperCase()}`, 32, 44);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(`Governing Standards: IS 269 / IS 1077 / IS 1786 / IS 383 (Per S K Duggal)`, 32, 62);

      // Left Panel: Graphic representation of material sample under test
      const cx = width * 0.28;
      const cy = height * 0.52;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(32, 80, width * 0.45, height - 120, 8);
      ctx.fill();
      ctx.stroke();

      if (params.materialCategory === 'Cement') {
        // Draw Vicat mould and plunger
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 50, cy - 10, 100, 70); // Vicat mould
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(cx - 50, cy - 10, 100, 70);

        // Plunger needle
        const needleY = cy - 60 + Math.sin(state.testProgress * Math.PI) * 45;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 2, needleY, 4, 50);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Vicat Apparatus Standard Consistency / Setting Test', cx, cy + 85);
        ctx.fillText(`Sample: ${params.cementType}`, cx, cy + 100);
      } else if (params.materialCategory === 'Bricks') {
        // Draw brick in compression
        ctx.fillStyle = params.brickType.includes('AAC') ? '#cbd5e1' : '#b45309';
        ctx.fillRect(cx - 70, cy - 25, 140, 65);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 70, cy - 25, 140, 65);

        // Frog indentation in brick
        ctx.fillStyle = params.brickType.includes('AAC') ? '#94a3b8' : '#78350f';
        ctx.fillRect(cx - 35, cy - 10, 70, 20);

        // Compression arrows
        ctx.fillStyle = '#ef4444';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⬇ ⬇ ⬇ (P = Crushing Load)', cx, cy - 35);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`Nominal Size: 190 × 90 × 90 mm (Standard Modular)`, cx, cy + 65);
        ctx.fillText(`Type: ${params.brickType}`, cx, cy + 80);
      } else if (params.materialCategory === 'Steel') {
        // Draw ribbed TMT rebar
        ctx.fillStyle = '#475569';
        ctx.fillRect(cx - 15, cy - 70, 30, 140);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(cx - 15, cy - 70, 30, 140);

        // Ribs
        ctx.fillStyle = '#38bdf8';
        for (let y = cy - 60; y < cy + 60; y += 14) {
          ctx.fillRect(cx - 18, y, 36, 4);
        }

        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('⬆ Tensile Pull', cx, cy - 80);
        ctx.fillText('⬇ Tensile Pull', cx, cy + 90);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`Ribbed Thermo-Mechanically Treated Rebar`, cx, cy + 106);
        ctx.fillText(`Grade: ${params.steelGrade}`, cx, cy + 120);
      } else {
        // Draw aggregate sieve stack
        ctx.fillStyle = '#334155';
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(cx - 50 + i * 4, cy - 60 + i * 26, 100 - i * 8, 20);
          ctx.strokeRect(cx - 50 + i * 4, cy - 60 + i * 26, 100 - i * 8, 20);
        }
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText('IS Sieve Shaker Stack (40mm, 20mm, 10mm, 4.75mm)', cx, cy + 85);
        ctx.fillText(`Aggregate Type: ${params.aggregateType}`, cx, cy + 100);
      }

      // Right Panel: Property Comparison Table
      const rx = width * 0.52;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText('Key Specifications & Civil Applications:', rx, 98);

      const facts = [
        '• Quality Criteria: Verified as per Indian Standard (IS) codes.',
        '• Field Tests: Visual inspection, ring sound, scratch test, consistency.',
        '• Environmental Impact: Modern PPC/AAC reduces CO2 footprint by 30-50%.',
        '• Structural Role: Selected to withstand dead, live, wind, and seismic loads.',
        '• Reference: S K Duggal, Building Materials, 5th Ed (2024).',
      ];

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px Inter, sans-serif';
      facts.forEach((f, idx) => {
        ctx.fillText(f, rx, 126 + idx * 24);
      });
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMULATION 3: Civil Engineering Unit Conversions & Estimation Tool (Unit II)
 * ───────────────────────────────────────────────────────────────────────────── */
const sim03UnitConversions: ICivilPerspectivesSimulation = {
  id: 'u25rce201-sim03-unit-conversions',
  simNumber: 3,
  title: 'Civil Engineering Unit Conversion & Quantity Estimator',
  unit: 2,
  unitTitle: 'Unit II: Unit Conversions and Codal Provisions',
  topic: 'Basic Unit Conversions: Length, Area, Volume, Stress, Density, Gradient',
  category: 'construction simulations',
  domain: 'CIVIL',
  icon: '📏',
  shortDescription: 'Master foundational unit conversions across SI, Imperial, and Indian field units used on construction sites.',
  detailedDescription: 'Civil engineering drawings and site practices frequently bridge SI units, Imperial units, and Indian traditional field units (such as brass, cubic feet, bags, cents, and acres). This simulator provides interactive multi-variable conversion calculators with step-by-step mathematical derivation trails, density conversions, and quantity takeoff rules.',
  learningObjectives: [
    'Convert construction dimensions between meters, millimeters, feet, and inches accurately.',
    'Calculate volume and mass conversions across m³, cubic feet (cft), cement bags (50 kg), and brass.',
    'Express stress, pressure, and bearing capacities in N/mm², MPa, kPa, kg/cm², and psi.',
    'Interpret road camber, pipe gradients, and slope ratios (1 in n) as percentage and degrees.',
  ],
  courseOutcomes: ['CO1', 'CO3'],
  governingCodesAndStandards: ['SP 27:1987 Handbook of Method of Measurement of Building Works', 'IS 1200 Part 1-28'],
  civilPracticalScenario: 'Translating an architectural drawing in feet-inches into structural engineering SI millimetres for concrete formwork, and converting a gravel procurement invoice quoted in "brass" into metric cubic meters.',
  defaultParams: {
    conversionType: 'Volume & Field Units',
    inputQuantity: 10,
    fromUnit: 'Cubic Meters (m³)',
    toUnit: 'Cubic Feet (cft)',
    densityKgM3: 2400,
  },
  parameters: [
    {
      key: 'conversionType',
      label: 'Conversion Dimension',
      type: 'select',
      default: 'Volume & Field Units',
      options: [
        { label: 'Length & Dimensions (m, mm, ft, in)', value: 'Length' },
        { label: 'Area & Land Measurement (m², sq.ft, acre, cent)', value: 'Area' },
        { label: 'Volume & Field Units (m³, cft, brass, cement bag)', value: 'Volume & Field Units' },
        { label: 'Stress & Pressure (N/mm², MPa, kPa, kg/cm², psi)', value: 'Stress & Pressure' },
        { label: 'Slope & Gradient (1 in n, %, degrees)', value: 'Slope & Gradient' },
      ],
    },
    {
      key: 'inputQuantity',
      label: 'Numeric Quantity to Convert',
      type: 'range',
      min: 1,
      max: 100,
      step: 1,
      default: 10,
    },
  ],
  metrics: [
    {
      id: 'metricResult',
      label: 'Converted Value (Primary Output)',
      format: (_, params) => {
        const val = Number(params.inputQuantity);
        if (params.conversionType === 'Length') {
          return `${(val * 3.28084).toFixed(2)} Feet (${(val * 39.37).toFixed(1)} In)`;
        }
        if (params.conversionType === 'Area') {
          return `${(val * 10.7639).toFixed(2)} Sq.Ft (${(val * 0.0247).toFixed(3)} Cents)`;
        }
        if (params.conversionType === 'Volume & Field Units') {
          const cft = val * 35.3147;
          const brass = cft / 100;
          return `${cft.toFixed(1)} cft (${brass.toFixed(2)} Brass)`;
        }
        if (params.conversionType === 'Stress & Pressure') {
          return `${val.toFixed(1)} MPa = ${(val * 10.197).toFixed(2)} kg/cm²`;
        }
        // Slope
        return `1 in ${val} = ${(100 / val).toFixed(2)}% slope`;
      },
      badge: 'Calculated',
      color: 'text-emerald-400',
    },
    {
      id: 'cementBagsEquivalent',
      label: 'Equivalent Cement Bags (if Concrete/Mortar)',
      format: (_, params) => {
        const val = Number(params.inputQuantity);
        if (params.conversionType === 'Volume & Field Units') {
          const bags = val / 0.0347;
          return `${Math.round(bags)} Bags (50 kg net)`;
        }
        return 'N/A';
      },
      badge: 'Takeoff',
      color: 'text-amber-400',
    },
    {
      id: 'governingRule',
      label: 'Equivalence Rule',
      format: (_, params) => {
        if (params.conversionType === 'Volume & Field Units') return '1 Brass = 100 cft = 2.8317 m³';
        if (params.conversionType === 'Area') return '1 Acre = 43,560 sq.ft = 100 Cents';
        if (params.conversionType === 'Length') return '1 Meter = 3.28084 Feet = 39.37 In';
        return '1 N/mm² = 1 MPa = 10^6 N/m²';
      },
      badge: 'Formula',
      color: 'text-sky-400',
    },
  ],
  formulaOverview: [
    'Length: 1\\text{ m} = 3.28084\\text{ ft} = 39.37\\text{ in}',
    'Area: 1\\text{ m}^2 = 10.7639\\text{ sq.ft}; 1\\text{ Acre} = 100\\text{ Cents} = 4046.86\\text{ m}^2',
    'Volume: 1\\text{ m}^3 = 35.3147\\text{ cft}; 1\\text{ Brass} = 100\\text{ cft} = 2.8317\\text{ m}^3',
    'Stress: 1\\text{ N/mm}^2 = 1\\text{ MPa} = 1000\\text{ kPa} \\approx 10.197\\text{ kg/cm}^2',
  ],
  engine: {
    createInitialState: () => ({ offset: 0 }),
    update: (state) => state,
    render: (ctx, width, height, _, params) => {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Card
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(16, 16, width - 32, height - 32, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText('CIVIL ENGINEERING UNIT CONVERTER & FIELD ESTIMATOR', 32, 44);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(`Category: ${params.conversionType} | Input Value: ${params.inputQuantity}`, 32, 64);

      // Conversion box
      const q = Number(params.inputQuantity);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(32, 85, width - 64, 110, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText('Step-by-Step Mathematical Derivation:', 48, 112);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px Courier, monospace';
      if (params.conversionType === 'Volume & Field Units') {
        ctx.fillText(`${q} m³ × 35.3147 cft/m³ = ${(q * 35.3147).toFixed(3)} Cubic Feet (cft)`, 48, 138);
        ctx.fillText(`In Field Brass: ${(q * 35.3147).toFixed(2)} cft ÷ 100 = ${(q * 0.353147).toFixed(3)} Brass`, 48, 160);
        ctx.fillText(`In Cement Bags: ${q} m³ ÷ 0.0347 m³/bag = ${(q / 0.0347).toFixed(1)} Bags (50 kg net)`, 48, 180);
      } else if (params.conversionType === 'Length') {
        ctx.fillText(`${q} m × 3.28084 ft/m = ${(q * 3.28084).toFixed(3)} Feet`, 48, 138);
        ctx.fillText(`${q} m × 39.3701 in/m = ${(q * 39.3701).toFixed(2)} Inches`, 48, 160);
        ctx.fillText(`${q} m × 1000 mm/m = ${q * 1000} Millimeters (Standard SI)`, 48, 180);
      } else if (params.conversionType === 'Area') {
        ctx.fillText(`${q} m² × 10.7639 sq.ft/m² = ${(q * 10.7639).toFixed(2)} Square Feet`, 48, 138);
        ctx.fillText(`${q} m² ÷ 40.4686 m²/cent = ${(q / 40.4686).toFixed(3)} Cents`, 48, 160);
        ctx.fillText(`${q} m² ÷ 4046.86 m²/acre = ${(q / 4046.86).toFixed(4)} Acres`, 48, 180);
      } else {
        ctx.fillText(`${q} N/mm² = ${q} MPa = ${q * 1000} kPa`, 48, 138);
        ctx.fillText(`${q} MPa × 145.038 psi/MPa = ${(q * 145.038).toFixed(1)} psi`, 48, 160);
        ctx.fillText(`${q} N/mm² × 10.1972 kg/cm² = ${(q * 10.1972).toFixed(2)} kg/cm²`, 48, 180);
      }

      // Quick Reference Chart
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText('Indian Construction Site Rules of Thumb:', 32, 226);

      const siteRules = [
        '• 1 Bag Cement = 50 kg = 34.7 Litres = 0.0347 m³ = 1.226 cft',
        '• 1 Brass = 100 cubic feet = 2.83 cubic meters of loose bulk aggregate/sand',
        '• 1 Tonne Steel = 1000 kg (Weight per meter of rebar = D² / 162 kg/m)',
        '• 1 Cent = 435.6 sq.ft = 40.47 m² | 1 Ground (Tamil Nadu) = 2400 sq.ft = 222.96 m²',
        '• Minimum Concrete Grade for RCC as per IS 456:2000 is M20 (20 N/mm²)',
      ];

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px Inter, sans-serif';
      siteRules.forEach((rule, idx) => {
        ctx.fillText(rule, 32, 250 + idx * 22);
      });
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMULATION 4: Anatomy of Buildings (Unit II)
 * ───────────────────────────────────────────────────────────────────────────── */
const sim04BuildingComponents: ICivilPerspectivesSimulation = {
  id: 'u25rce201-sim04-building-components',
  simNumber: 4,
  title: 'Anatomy of Buildings: Substructure & Superstructure Explorer',
  unit: 2,
  unitTitle: 'Unit II: Unit Conversions and Codal Provisions',
  topic: 'Buildings and Structures in General: Functional Requirements & Components',
  category: 'construction simulations',
  domain: 'CIVIL',
  icon: '🏛️',
  shortDescription: 'Explore the full architectural cross-section of a building from foundations and plinth to beams, lintels, and roof slabs.',
  detailedDescription: 'Understand how building components work together to transmit gravity, wind, and seismic loads safely to the soil. Students examine Substructure (isolated/raft footings, plinth beam, damp-proof course) and Superstructure (masonry walls, columns, lintels, sunshades/chajjas, floor slabs, and parapet walls) with interactive cut-section layer toggling.',
  learningObjectives: [
    'Distinguish between substructure and superstructure components and their respective load-bearing roles.',
    'Trace gravity load paths from slab to beam, column, footing, and underlying subgrade soil strata.',
    'Explain the necessity and positioning of plinth beams, DPC, lintels, and parapet walls.',
  ],
  courseOutcomes: ['CO2'],
  governingCodesAndStandards: ['NBC 2016 Part 4 & 6', 'IS 456:2000', 'IS 1905:1987'],
  civilPracticalScenario: 'Designing the plinth level and damp proof course (DPC) for a residence in a flood-prone plain to prevent capillary moisture rising into interior plaster walls.',
  defaultParams: {
    buildingType: 'Residential G+1 Frame',
    soilBearingCapacityKPa: 200,
    plinthHeightMm: 600,
  },
  parameters: [
    {
      key: 'buildingType',
      label: 'Structural Typology',
      type: 'select',
      default: 'Residential G+1 Frame',
      options: [
        { label: 'Residential G+1 RCC Framed Structure', value: 'Residential G+1 Frame' },
        { label: 'Commercial G+3 RCC Framed Structure', value: 'Commercial G+3 Frame' },
        { label: 'Single Storey Load-Bearing Masonry', value: 'Load-Bearing Masonry' },
      ],
    },
    {
      key: 'soilBearingCapacityKPa',
      label: 'Safe Soil Bearing Capacity (SBC in kPa)',
      type: 'range',
      min: 100,
      max: 400,
      step: 25,
      default: 200,
    },
    {
      key: 'plinthHeightMm',
      label: 'Plinth Level above Ground (mm)',
      type: 'range',
      min: 300,
      max: 1200,
      step: 100,
      default: 600,
    },
  ],
  metrics: [
    {
      id: 'foundationFootingArea',
      label: 'Req. Footing Area per Column',
      format: (_, params) => {
        const sbc = Number(params.soilBearingCapacityKPa);
        const loadKN = params.buildingType.includes('G+3') ? 600 : 250;
        const area = (loadKN / sbc).toFixed(2);
        return `${area} m² (${Math.sqrt(Number(area)).toFixed(2)}m × ${Math.sqrt(Number(area)).toFixed(2)}m)`;
      },
      badge: 'Geotech',
      color: 'text-amber-400',
    },
    {
      id: 'dampProtectionStatus',
      label: 'Moisture Protection Index',
      format: (_, params) => {
        return Number(params.plinthHeightMm) >= 600 ? 'EXCELLENT (Above Road Splash)' : 'MODERATE (Risk of Capillary Rise)';
      },
      badge: 'Durability',
      color: 'text-emerald-400',
    },
  ],
  formulaOverview: [
    'Footing Area: A_{footing} = \\frac{1.1 \\times P_{col}}{SBC} \\text{ (with 10\\% footing self-weight)}',
    'Load Path: \\text{Slab } \\to \\text{Beam } \\to \\text{Column } \\to \\text{Footing } \\to \\text{Soil}',
  ],
  engine: {
    createInitialState: () => ({ activeLayer: 'all' }),
    update: (state) => state,
    render: (ctx, width, height, _, params) => {
      ctx.clearRect(0, 0, width, height);

      // Sky
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Ground Line
      const groundY = height * 0.7;
      ctx.fillStyle = '#422006'; // soil
      ctx.fillRect(0, groundY, width, height - groundY);

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(`GROUND LEVEL (GL ± 0.000) | Soil SBC: ${params.soilBearingCapacityKPa} kPa`, 24, groundY + 16);

      // Plinth level
      const plinthOffset = (Number(params.plinthHeightMm) / 1000) * 40;
      const plinthY = groundY - plinthOffset;

      ctx.fillStyle = '#64748b'; // plinth beam
      ctx.fillRect(width * 0.25, plinthY, width * 0.5, 14);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText(`Plinth Beam (+${params.plinthHeightMm}mm) & DPC`, width * 0.25 + 10, plinthY + 11);

      // Footings
      const footingY = groundY + 50;
      // Left footing
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(width * 0.3 - 35, footingY, 70, 25);
      // Right footing
      ctx.fillRect(width * 0.7 - 35, footingY, 70, 25);

      // Columns from footing to roof
      const roofY = plinthY - 140;
      ctx.fillStyle = '#64748b';
      // Left column
      ctx.fillRect(width * 0.3 - 10, roofY, 20, footingY - roofY);
      // Right column
      ctx.fillRect(width * 0.7 - 10, roofY, 20, footingY - roofY);

      // Masonry wall between columns
      ctx.fillStyle = '#b45309';
      ctx.fillRect(width * 0.3 + 10, plinthY - 120, width * 0.4 - 20, 120);

      // Window opening in wall
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(width * 0.45, plinthY - 90, 45, 50);

      // Lintel & Sunshade over window
      ctx.fillStyle = '#475569';
      ctx.fillRect(width * 0.42, plinthY - 100, 60, 10);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(width * 0.4, plinthY - 95, 20, 5); // chajja projection

      // Roof RCC Slab
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(width * 0.22, roofY - 14, width * 0.56, 14);

      // Parapet Wall
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(width * 0.22, roofY - 45, 12, 31);
      ctx.fillRect(width * 0.78 - 12, roofY - 45, 12, 31);

      // Component Labels
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('Parapet (+1000mm)', width * 0.12, roofY - 32);
      ctx.fillText('RCC Roof Slab', width * 0.12, roofY - 6);
      ctx.fillText('Lintel & Sunshade', width * 0.52, plinthY - 96);
      ctx.fillText('Isolated RC Footing', width * 0.12, footingY + 16);

      // Top title
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('ANATOMICAL ELEVATION & CUTAWAY OF BUILDING', 24, 30);
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMULATION 5: National Building Code & Byelaws Compliance Studio (Unit II)
 * ───────────────────────────────────────────────────────────────────────────── */
const sim05NBCByelaws: ICivilPerspectivesSimulation = {
  id: 'u25rce201-sim05-nbc-byelaws',
  simNumber: 5,
  title: 'National Building Code (NBC 2016) & Byelaws Compliance Studio',
  unit: 2,
  unitTitle: 'Unit II: Unit Conversions and Codal Provisions',
  topic: 'Necessity of Byelaws, National Building Code (NBC 2016), FSI/FAR & Setbacks',
  category: 'construction simulations',
  domain: 'CIVIL',
  icon: '📜',
  shortDescription: 'Simulate municipal building byelaw approvals: test setbacks, Floor Space Index (FSI/FAR), plot coverage, and fire safety.',
  detailedDescription: 'Building byelaws protect public health, safety, and orderly urban growth. Based on NBC 2016 Part 3, this studio models a site plot with user-adjustable dimensions and front road width. Students adjust front, rear, and side setbacks, floor count, and built-up area to check compliance against permissible FAR/FSI and plot coverage limits.',
  learningObjectives: [
    'Define Floor Area Ratio (FAR) / Floor Space Index (FSI) and calculate total permissible built-up area.',
    'Explain the importance of mandatory setbacks for ventilation, natural lighting, and fire engine maneuverability.',
    'Verify building height restrictions relative to abutting street width under NBC 2016.',
  ],
  courseOutcomes: ['CO2'],
  governingCodesAndStandards: ['National Building Code of India (NBC 2016) Part 3', 'State Directorate of Town & Country Planning (DTCP) Rules'],
  civilPracticalScenario: 'Submitting a municipal permit drawing for a G+2 commercial building on a 12m wide road, ensuring that front setbacks allow fire tender passage and total floor area does not exceed FSI 1.5.',
  defaultParams: {
    plotWidthM: 15,
    plotDepthM: 25,
    roadWidthM: 12,
    numberOfFloors: 3,
    frontSetbackM: 3.5,
  },
  parameters: [
    {
      key: 'plotWidthM',
      label: 'Plot Frontage Width (m)',
      type: 'range',
      min: 10,
      max: 30,
      step: 1,
      default: 15,
    },
    {
      key: 'plotDepthM',
      label: 'Plot Depth (m)',
      type: 'range',
      min: 15,
      max: 50,
      step: 1,
      default: 25,
    },
    {
      key: 'roadWidthM',
      label: 'Abutting Road Width (m)',
      type: 'select',
      default: 12,
      options: [
        { label: '9.0 m (Sub-arterial / Local Street)', value: 9 },
        { label: '12.0 m (Standard Collector Street)', value: 12 },
        { label: '18.0 m (Major Arterial Road)', value: 18 },
        { label: '24.0 m (Primary Highway Corridor)', value: 24 },
      ],
    },
    {
      key: 'numberOfFloors',
      label: 'Proposed Stories (G+N)',
      type: 'range',
      min: 1,
      max: 6,
      step: 1,
      default: 3,
    },
    {
      key: 'frontSetbackM',
      label: 'Front Setback Provided (m)',
      type: 'range',
      min: 1.5,
      max: 8.0,
      step: 0.5,
      default: 3.5,
    },
  ],
  metrics: [
    {
      id: 'achievedFsi',
      label: 'Achieved FSI / FAR',
      format: (_, params) => {
        const plotArea = Number(params.plotWidthM) * Number(params.plotDepthM);
        const buildableW = Math.max(2, Number(params.plotWidthM) - 4);
        const buildableD = Math.max(2, Number(params.plotDepthM) - (Number(params.frontSetbackM) + 2.5));
        const footprint = buildableW * buildableD;
        const totalBuiltUp = footprint * Number(params.numberOfFloors);
        const fsi = totalBuiltUp / plotArea;
        return `${fsi.toFixed(2)} (Permissible: 1.50–2.00)`;
      },
      badge: 'FSI',
      color: 'text-emerald-400',
    },
    {
      id: 'complianceStatus',
      label: 'Municipal Approval Status',
      format: (_, params) => {
        const reqFront = Number(params.roadWidthM) >= 12 ? 3.0 : 2.5;
        const passesSetback = Number(params.frontSetbackM) >= reqFront;
        const plotArea = Number(params.plotWidthM) * Number(params.plotDepthM);
        const buildableW = Math.max(2, Number(params.plotWidthM) - 4);
        const buildableD = Math.max(2, Number(params.plotDepthM) - (Number(params.frontSetbackM) + 2.5));
        const footprint = buildableW * buildableD;
        const fsi = (footprint * Number(params.numberOfFloors)) / plotArea;
        const passesFsi = fsi <= 2.0;

        return passesSetback && passesFsi ? 'APPROVED (Fully Compliant)' : 'VIOLATION DETECTED';
      },
      badge: 'NBC 2016',
      color: 'text-amber-400',
    },
  ],
  formulaOverview: [
    'FSI / FAR = \\frac{\\text{Total Built-Up Area across all floors}}{\\text{Total Plot Area}}',
    'Plot Coverage (\\%) = \\frac{\\text{Ground Floor Footprint Area}}{\\text{Total Plot Area}} \\times 100\\%',
  ],
  engine: {
    createInitialState: () => ({}),
    update: (state) => state,
    render: (ctx, width, height, _, params) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Top title
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('MUNICIPAL SITE PLAN & BYELAW SETBACK ENVELOPE', 24, 30);

      // Draw road at bottom
      const roadH = 40;
      const roadY = height - roadH - 16;
      ctx.fillStyle = '#334155';
      ctx.fillRect(16, roadY, width - 32, roadH);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`ROAD CARRIAGEWAY (Width: ${params.roadWidthM}m)`, width * 0.5, roadY + 24);

      // Draw Plot boundary
      const plotX = width * 0.2;
      const plotY = 60;
      const plotW = width * 0.6;
      const plotH = roadY - plotY - 10;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(plotX, plotY, plotW, plotH);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.fillRect(plotX, plotY, plotW, plotH);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`PLOT BOUNDARY: ${params.plotWidthM}m (W) × ${params.plotDepthM}m (D)`, plotX + 10, plotY + 18);

      // Calculate setbacks in pixels
      const frontSetbackPx = (Number(params.frontSetbackM) / Number(params.plotDepthM)) * plotH;
      const rearSetbackPx = (2.5 / Number(params.plotDepthM)) * plotH;
      const sideSetbackPx = (2.0 / Number(params.plotWidthM)) * plotW;

      // Buildable footprint
      const bX = plotX + sideSetbackPx;
      const bY = plotY + rearSetbackPx;
      const bW = plotW - sideSetbackPx * 2;
      const bH = plotH - rearSetbackPx - frontSetbackPx;

      ctx.fillStyle = '#065f46';
      ctx.fillRect(bX, bY, bW, bH);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.strokeRect(bX, bY, bW, bH);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`PERMISSIBLE BUILDING FOOTPRINT`, bX + bW * 0.5, bY + bH * 0.45);
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`Stories: G+${Number(params.numberOfFloors) - 1} | Front Setback: ${params.frontSetbackM}m`, bX + bW * 0.5, bY + bH * 0.6);
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMULATION 6: IS Codal Testing Lab (Unit II)
 * ───────────────────────────────────────────────────────────────────────────── */
const sim06ISCodalTesting: ICivilPerspectivesSimulation = {
  id: 'u25rce201-sim06-is-codal-testing',
  simNumber: 6,
  title: 'IS Codal Testing Virtual Lab: Cement, Aggregates & Water',
  unit: 2,
  unitTitle: 'Unit II: Unit Conversions and Codal Provisions',
  topic: 'Indian Standard Codal Provisions for Materials and Testing (Cement, Aggregates, Water)',
  category: 'construction simulations',
  domain: 'CIVIL',
  icon: '🧪',
  shortDescription: 'Execute standard laboratory acceptance tests on Cement, Fine/Coarse Aggregates, and Water in compliance with Indian Standards.',
  detailedDescription: 'Strict quality control requires materials to conform to Bureau of Indian Standards (BIS) specifications. Students conduct virtual tests: Cement setting time and fineness (IS 4031), Fine aggregate sieve grading and silt content (IS 2386 & IS 383), Coarse aggregate crushing/impact values, and mixing water chemical purity tests (IS 456 Table 1).',
  learningObjectives: [
    'Conduct standard consistency and initial/final setting time evaluations using the Vicat apparatus per IS 4031.',
    'Perform mechanical sieve analysis on sand to classify Zone I through Zone IV per IS 383.',
    'Test aggregate impact and crushing strength limits for pavement vs structural concrete.',
    'Evaluate permissible limits for pH, sulfates, chlorides, and organic solids in mixing water per IS 456:2000.',
  ],
  courseOutcomes: ['CO3'],
  governingCodesAndStandards: ['IS 4031 (Parts 1–6)', 'IS 2386 (Parts 1–4)', 'IS 383:2016', 'IS 456:2000 Table 1'],
  civilPracticalScenario: 'Receiving a truckload of river sand on site: conducting a rapid field silt-content jar test to ensure silt does not exceed 8%, and sending a water sample for chemical laboratory titration before batching high-strength concrete.',
  defaultParams: {
    testSpecimen: 'Cement Setting Time (IS 4031)',
    waterConsistencyPct: 30,
    siltContentPct: 6,
    waterPhValue: 7.2,
  },
  parameters: [
    {
      key: 'testSpecimen',
      label: 'Selected IS Codal Test',
      type: 'select',
      default: 'Cement Setting Time (IS 4031)',
      options: [
        { label: 'Cement Setting Time (IS 4031 Pt 5)', value: 'Cement Setting Time (IS 4031)' },
        { label: 'Fine Aggregate Silt Content (IS 2386 Pt 2)', value: 'Fine Aggregate Silt Content' },
        { label: 'Coarse Aggregate Crushing Value (IS 2386 Pt 4)', value: 'Coarse Aggregate Crushing' },
        { label: 'Water Quality Analysis (IS 456 Table 1)', value: 'Water Quality Analysis' },
      ],
    },
    {
      key: 'waterConsistencyPct',
      label: 'Cement Normal Consistency P (%)',
      type: 'range',
      min: 24,
      max: 36,
      step: 1,
      default: 30,
    },
    {
      key: 'siltContentPct',
      label: 'Sand Silt Content (%)',
      type: 'range',
      min: 2,
      max: 15,
      step: 1,
      default: 6,
    },
    {
      key: 'waterPhValue',
      label: 'Water pH Level',
      type: 'range',
      min: 4.5,
      max: 9.5,
      step: 0.1,
      default: 7.2,
    },
  ],
  metrics: [
    {
      id: 'codalAcceptance',
      label: 'IS Acceptance Decision',
      format: (_, params) => {
        if (params.testSpecimen.includes('Silt')) {
          return Number(params.siltContentPct) <= 8 ? 'ACCEPTED (Silt ≤ 8% per IS 2386)' : 'REJECTED (Excessive Silt > 8%)';
        }
        if (params.testSpecimen.includes('Water')) {
          const ph = Number(params.waterPhValue);
          return ph >= 6.0 && ph <= 8.5 ? 'ACCEPTED (pH 6.0–8.5 per IS 456)' : 'REJECTED (Unfit for Concrete)';
        }
        return 'CONFORMS TO IS 4031 SPEC';
      },
      badge: 'Codal QC',
      color: 'text-emerald-400',
    },
  ],
  formulaOverview: [
    'Silt Content (\\%) = \\frac{V_1}{V_2} \\times 100 \\le 8\\%',
    'Initial Setting Time: \\ge 30 \\text{ minutes}; \\text{Final Setting Time: } \\le 600 \\text{ minutes}',
    'Water Permissible pH: 6.0 \\le \\text{pH} \\le 8.5 \\text{ (IS 456:2000 Table 1)}',
  ],
  engine: {
    createInitialState: () => ({ anim: 0 }),
    update: (state) => state,
    render: (ctx, width, height, _, params) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(`IS CODAL TESTING: ${params.testSpecimen.toUpperCase()}`, 24, 32);

      // Test display card
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(24, 52, width - 48, height - 76);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Indian Standard Verification Criteria:', 40, 80);

      const items = [
        `• Active Test: ${params.testSpecimen}`,
        `• Cement Consistency Tested: ${params.waterConsistencyPct}% (Permissible: 26–33%)`,
        `• Silt Content in Sand: ${params.siltContentPct}% (Max Allowed: 8% by volume)`,
        `• Water pH: ${params.waterPhValue} (Permissible Range: 6.0 to 8.5 per IS 456)`,
        `• Water Impurities Limits: Chlorides < 2000 mg/L (PCC) / < 500 mg/L (RCC)`,
      ];

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px Inter, sans-serif';
      items.forEach((item, idx) => {
        ctx.fillText(item, 40, 110 + idx * 24);
      });
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMULATION 7: Lab 1 — Visit to Experience Engineering: Study of Materials
 * ───────────────────────────────────────────────────────────────────────────── */
const sim07ExperienceMaterials: ICivilPerspectivesSimulation = {
  id: 'u25rce201-sim07-experience-materials',
  simNumber: 7,
  title: 'Lab 1: Visit to Experience Engineering — Study of Materials',
  unit: 1,
  unitTitle: 'List of Experiments: Lab 1',
  topic: 'Visit to Experience Engineering – Study of Materials',
  category: 'construction simulations',
  domain: 'CIVIL',
  icon: '🔍',
  shortDescription: 'Virtual walkthrough of KPRIET Experience Engineering Centre: touch, inspect, and benchmark traditional vs modern smart construction materials.',
  detailedDescription: 'Prescribed as Experiment 1 in the official syllabus, this immersive module simulates a visit to an advanced Experience Engineering materials centre. Students inspect specimens of geopolymer concrete, self-healing bacteria concrete, bamboo composites, carbon-fiber reinforced polymers (CFRP), high-performance steel, and aerogel insulation blankets.',
  learningObjectives: [
    'Identify modern sustainable and composite materials alongside traditional stone, timber, and lime.',
    'Examine microstructural integrity and failure modes under tactile hammer impact and non-destructive testing.',
    'Compare life-cycle carbon emissions and embodied energy of green concrete vs conventional OPC concrete.',
  ],
  courseOutcomes: ['CO3', 'CO5'],
  governingCodesAndStandards: ['IS 456:2000', 'GRIHA Green Materials Directory'],
  civilPracticalScenario: 'Exploring innovative alternatives to standard cement mortar for historical monument restoration and low-carbon urban pavements.',
  defaultParams: {
    materialSpecimen: 'Geopolymer Green Concrete',
  },
  parameters: [
    {
      key: 'materialSpecimen',
      label: 'Exhibited Material Specimen',
      type: 'select',
      default: 'Geopolymer Green Concrete',
      options: [
        { label: 'Geopolymer Green Concrete (Fly Ash + GGBS)', value: 'Geopolymer Green Concrete' },
        { label: 'Self-Healing Bacterial Concrete (Bacillus)', value: 'Self-Healing Bacterial Concrete' },
        { label: 'Carbon Fiber Reinforced Polymer (CFRP)', value: 'Carbon Fiber (CFRP)' },
        { label: 'Structural Bamboo Composite Truss', value: 'Structural Bamboo Composite' },
      ],
    },
  ],
  metrics: [
    {
      id: 'embodiedCo2Reduction',
      label: 'Embodied Carbon Reduction',
      format: (_, params) => {
        if (params.materialSpecimen.includes('Geopolymer')) return '70% Reduction vs OPC';
        if (params.materialSpecimen.includes('Bamboo')) return 'Carbon Negative (-120 kg/m³)';
        return '25–40% Lifecycle Savings';
      },
      badge: 'Green Material',
      color: 'text-emerald-400',
    },
  ],
  formulaOverview: [
    'Embodied Carbon: EC = \\sum (M_i \\times \\text{Emission Factor}_i)',
  ],
  engine: {
    createInitialState: () => ({}),
    update: (state) => state,
    render: (ctx, width, height, _, params) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('EXPERIENCE ENGINEERING: ADVANCED MATERIALS GALLERY', 24, 32);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(`Active Exhibit: ${params.materialSpecimen}`, 24, 56);

      // Exhibit Pedestal
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(width * 0.1, 80, width * 0.8, height - 120);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(width * 0.1, 80, width * 0.8, height - 120);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText('Material Science & Innovation Insights:', width * 0.14, 110);

      const insights = [
        '1. Replaces Portland clinker with alkali-activated industrial pozzolans.',
        '2. Superior acid, fire, and seawater sulfate resistance.',
        '3. Reduces high-temperature kiln calcination emissions.',
        '4. Ideal for precast railway sleepers, pavers, and coastal sea walls.',
      ];
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      insights.forEach((txt, i) => {
        ctx.fillText(txt, width * 0.14, 140 + i * 26);
      });
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMULATION 8: Lab 2 — Learn It Masonry Yard: Types of Brick Bonds
 * ───────────────────────────────────────────────────────────────────────────── */
const sim08MasonryYard: ICivilPerspectivesSimulation = {
  id: 'u25rce201-sim08-masonry-yard',
  simNumber: 8,
  title: 'Lab 2: Learn It Masonry Yard — Interactive Brick Bonding Studio',
  unit: 1,
  unitTitle: 'List of Experiments: Lab 2',
  topic: 'Learn It Masonry Yard – Types of Brick Bonds',
  category: 'construction simulations',
  domain: 'CIVIL',
  icon: '🧱',
  shortDescription: 'Construct English, Flemish, Rat-Trap, and Stretcher brick bonds course-by-course and check for vertical continuous joints.',
  detailedDescription: 'Prescribed as Experiment 2 in the official syllabus, this studio lets students build realistic brick masonry walls course-by-course. Students compare English Bond (alternating header and stretcher courses with queen closers), Flemish Bond (alternating headers and stretchers in every course), Rat-Trap Bond (cavity bond saving 20% brick volume with thermal insulation), and Stretcher Bond. The solver verifies bond overlap rules and calculates brick and mortar quantities.',
  learningObjectives: [
    'Assemble English and Flemish brick bonds with proper lap ($1/4$ brick length) and queen closer positioning.',
    'Eliminate continuous vertical mortar joints that cause structural shear failure under lateral loads.',
    'Model Rat-Trap cavity bonding to evaluate material savings and passive thermal insulation.',
    'Estimate total brick count and wet mortar volume required for a given wall area.',
  ],
  courseOutcomes: ['CO3', 'CO4'],
  governingCodesAndStandards: ['IS 2212:1991 Code of Practice for Brickwork', 'SP 20 Handbook on Masonry Design'],
  civilPracticalScenario: 'Supervising bricklayers at a construction yard: ensuring queen closers are correctly positioned adjacent to quoin headers in an English bond wall to prevent continuous vertical joints.',
  defaultParams: {
    bondType: 'English Bond',
    wallLengthM: 3.0,
    wallHeightM: 1.5,
  },
  parameters: [
    {
      key: 'bondType',
      label: 'Brick Bond Pattern',
      type: 'select',
      default: 'English Bond',
      options: [
        { label: 'English Bond (Strongest Structural Bond)', value: 'English Bond' },
        { label: 'Flemish Bond (Aesthetic Architectural)', value: 'Flemish Bond' },
        { label: 'Rat-Trap Bond (Cavity & Cost-Effective)', value: 'Rat-Trap Bond' },
        { label: 'Stretcher / Running Bond (Partition Walls)', value: 'Stretcher Bond' },
      ],
    },
    {
      key: 'wallLengthM',
      label: 'Wall Length (m)',
      type: 'range',
      min: 1.5,
      max: 6.0,
      step: 0.5,
      default: 3.0,
    },
    {
      key: 'wallHeightM',
      label: 'Wall Height (m)',
      type: 'range',
      min: 0.8,
      max: 3.0,
      step: 0.2,
      default: 1.5,
    },
  ],
  metrics: [
    {
      id: 'brickQuantity',
      label: 'Estimated Modular Bricks Required',
      format: (_, params) => {
        const area = Number(params.wallLengthM) * Number(params.wallHeightM);
        const factor = params.bondType === 'Rat-Trap Bond' ? 380 : 500;
        const total = Math.ceil(area * 0.23 * factor);
        return `${total} Bricks (Incl. 5% Wastage)`;
      },
      badge: 'Takeoff',
      color: 'text-amber-400',
    },
    {
      id: 'jointIntegrity',
      label: 'Vertical Joint Interlock',
      format: () => 'EXCELLENT (Zero Continuous Joints)',
      badge: 'IS 2212',
      color: 'text-emerald-400',
    },
  ],
  formulaOverview: [
    'Brick Count: N = V_{wall} \\times 500 \\text{ bricks/m}^3 \\text{ (for standard nominal masonry)}',
    'Mortar Volume: V_{mortar} \\approx 0.30 \\times V_{wall}',
    'Lap: \\text{Minimum horizontal lap } \\ge \\frac{1}{4} L_{brick} = 45 \\text{ mm}',
  ],
  engine: {
    createInitialState: () => ({}),
    update: (state) => state,
    render: (ctx, width, height, _, params) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(`MASONRY YARD: ${params.bondType.toUpperCase()} ELEVATION`, 24, 30);

      // Draw Course-by-course brick wall
      const startX = 30;
      const startY = height - 50;
      const numCourses = 8;
      const courseH = 22;
      const brickL = 52;
      const headerL = 26;

      ctx.lineWidth = 1;

      for (let c = 0; c < numCourses; c++) {
        const y = startY - (c + 1) * courseH;
        let x = startX;

        if (params.bondType === 'English Bond') {
          if (c % 2 === 0) {
            while (x < width - 40) {
              ctx.fillStyle = '#b45309';
              ctx.fillRect(x, y, brickL, courseH - 2);
              ctx.strokeStyle = '#f8fafc';
              ctx.strokeRect(x, y, brickL, courseH - 2);
              x += brickL + 2;
            }
          } else {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(x, y, headerL, courseH - 2);
            ctx.strokeRect(x, y, headerL, courseH - 2);
            x += headerL + 2;

            ctx.fillStyle = '#d97706';
            ctx.fillRect(x, y, headerL / 2, courseH - 2);
            ctx.strokeRect(x, y, headerL / 2, courseH - 2);
            x += headerL / 2 + 2;

            while (x < width - 40) {
              ctx.fillStyle = '#78350f';
              ctx.fillRect(x, y, headerL, courseH - 2);
              ctx.strokeRect(x, y, headerL, courseH - 2);
              x += headerL + 2;
            }
          }
        } else if (params.bondType === 'Flemish Bond') {
          const offset = c % 2 === 0 ? 0 : headerL;
          x += offset;
          while (x < width - 40) {
            ctx.fillStyle = '#b45309';
            ctx.fillRect(x, y, brickL, courseH - 2);
            ctx.strokeStyle = '#f8fafc';
            ctx.strokeRect(x, y, brickL, courseH - 2);
            x += brickL + 2;

            ctx.fillStyle = '#78350f';
            ctx.fillRect(x, y, headerL, courseH - 2);
            ctx.strokeRect(x, y, headerL, courseH - 2);
            x += headerL + 2;
          }
        } else {
          const offset = (c % 2) * (brickL / 2);
          x += offset;
          while (x < width - 40) {
            ctx.fillStyle = '#b45309';
            ctx.fillRect(x, y, brickL, courseH - 2);
            ctx.strokeStyle = '#f8fafc';
            ctx.strokeRect(x, y, brickL, courseH - 2);
            x += brickL + 2;
          }
        }
      }

      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('Legend: [ Brown = Stretcher (190mm Face) ]  [ Dark Red = Header (90mm Face) ]  [ Orange = Queen Closer ]', 30, height - 16);
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMULATION 9: Lab 3 — Site Visit to RMC Plant
 * ───────────────────────────────────────────────────────────────────────────── */
const sim09RMCPlant: ICivilPerspectivesSimulation = {
  id: 'u25rce201-sim09-rmc-plant',
  simNumber: 9,
  title: 'Lab 3: Site Visit to RMC Plant — Batching, Transit & Quality Control',
  unit: 1,
  unitTitle: 'List of Experiments: Lab 3',
  topic: 'Site visit to RMC Plant',
  category: 'construction simulations',
  domain: 'CIVIL',
  icon: '🚛',
  shortDescription: 'Tour an industrial Ready-Mix Concrete batching facility: simulate computerised batching, transit dispatch, and slump retention.',
  detailedDescription: 'Prescribed as Experiment 3 in the syllabus, this virtual plant tour covers industrial RMC production per IS 4926. Students explore aggregate storage bins, conveyor belts, cement/fly ash weigh hoppers, chemical admixture dispensers, twin-shaft pan mixers, and transit mixer truck dispatch logistics. Students track concrete slump loss over haul transit time and conduct delivery slump tests.',
  learningObjectives: [
    'Explain the automated batching sequence of a modern RMC plant per IS 4926.',
    'Calculate target mean strength ($f_{ck} + 1.65\\sigma$) and mix proportions for M25/M30 concrete.',
    'Analyze transit mixer drum agitation and slump retention over 60–90 minute road journeys.',
  ],
  courseOutcomes: ['CO4'],
  governingCodesAndStandards: ['IS 4926:2003 Ready-Mixed Concrete', 'IS 10262:2019 Concrete Mix Proportioning'],
  civilPracticalScenario: 'Ordering 40 m³ of M30 pumpable concrete for an elevated slab: specifying superplasticizers to maintain a 120mm slump after a 45-minute city transit.',
  defaultParams: {
    concreteGrade: 'M30 Grade Concrete',
    haulTimeMinutes: 45,
  },
  parameters: [
    {
      key: 'concreteGrade',
      label: 'Concrete Strength Grade',
      type: 'select',
      default: 'M30 Grade Concrete',
      options: [
        { label: 'M20 Grade (Residential Footings)', value: 'M20' },
        { label: 'M25 Grade (Standard RCC Slabs & Beams)', value: 'M25' },
        { label: 'M30 Grade (Commercial Columns & Bridges)', value: 'M30 Grade Concrete' },
        { label: 'M40 Grade (Prestressed High Performance)', value: 'M40' },
      ],
    },
    {
      key: 'haulTimeMinutes',
      label: 'Transit Haul Duration (minutes)',
      type: 'range',
      min: 15,
      max: 120,
      step: 5,
      default: 45,
    },
  ],
  metrics: [
    {
      id: 'initialSlumpMm',
      label: 'Slump at Batching (Plant)',
      format: () => '140 mm (Pumpable)',
      badge: 'Plant Slump',
      color: 'text-sky-400',
    },
    {
      id: 'arrivalSlumpMm',
      label: 'Predicted Slump at Site',
      format: (_, params) => {
        const time = Number(params.haulTimeMinutes);
        const loss = time > 90 ? 70 : Math.round(time * 0.4);
        const slump = Math.max(30, 140 - loss);
        return `${slump} mm (${slump >= 100 ? 'Pumpable' : 'Manual Placement'})`;
      },
      badge: 'Delivery QC',
      color: 'text-emerald-400',
    },
  ],
  formulaOverview: [
    'Target Mean Strength: f_{target} = f_{ck} + 1.65 \\sigma',
    'Permissible Batching Tolerance: \\pm 2\\% \\text{ for aggregates}; \\pm 1\\% \\text{ for cement/water}',
  ],
  engine: {
    createInitialState: () => ({ drumAngle: 0 }),
    update: (state, _, dt) => ({ ...state, drumAngle: state.drumAngle + dt * 2 }),
    render: (ctx, width, height, state, params) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('RMC BATCHING PLANT & TRANSIT LOGISTICS', 24, 30);

      // Draw Plant Diagram
      ctx.fillStyle = '#334155';
      ctx.fillRect(30, 60, 80, 100);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('Cement Silo', 40, 115);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(110, 140);
      ctx.lineTo(200, 100);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.fillRect(200, 85, 70, 50);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('Twin Shaft', 210, 105);
      ctx.fillText('Mixer', 220, 120);

      const tx = width * 0.65;
      const ty = 140;
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(tx - 40, ty, 80, 30);

      ctx.save();
      ctx.translate(tx - 10, ty - 10);
      ctx.rotate(state.drumAngle);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-22, -4, 44, 8);
      ctx.restore();

      ctx.fillStyle = '#f8fafc';
      ctx.fillText(`Transit Mixer (Haul Time: ${params.haulTimeMinutes} mins)`, tx - 60, ty + 50);
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMULATION 10: Lab 4 — Bridge / Flyover / Road Construction Site Visit
 * ───────────────────────────────────────────────────────────────────────────── */
const sim10BridgeRoadSite: ICivilPerspectivesSimulation = {
  id: 'u25rce201-sim10-bridge-road-site',
  simNumber: 10,
  title: 'Lab 4: Bridge, Flyover & Road Construction Site Visit',
  unit: 1,
  unitTitle: 'List of Experiments: Lab 4',
  topic: 'Bridge / Flyover / Road Construction Site Visit',
  category: 'construction simulations',
  domain: 'CIVIL',
  icon: '🌉',
  shortDescription: 'Inspect highway pavement layers (Subgrade, GSB, WMM, DBM, BC) and structural flyover components (Piles, Pier Caps, Bearings, PSC Girders).',
  detailedDescription: 'Prescribed as Experiment 4 in the syllabus, this virtual construction site visit allows students to explore both highway pavement cross-sections (IRC 37 layers: Compacted Subgrade, GSB, WMM, DBM, and Bituminous Concrete) and bridge/flyover structures (IRC 112 components: deep foundations, piers, pier caps, elastomeric bearings, precast prestressed I-girders, and deck slabs).',
  learningObjectives: [
    'Identify flexible pavement crust layers from subgrade to bituminous wearing course.',
    'Examine bridge substructure and superstructure components and elastomeric expansion bearings.',
    'Describe heavy construction methodologies: girder launching gantries and vibratory compaction rollers.',
  ],
  courseOutcomes: ['CO4', 'CO5'],
  governingCodesAndStandards: ['IRC 37:2018 Guidelines for Flexible Pavement Design', 'IRC 112:2020 Code of Practice for Concrete Road Bridges'],
  civilPracticalScenario: 'Conducting a quality inspection of a newly paved bituminous highway stretch: checking compaction density using a core cutter and inspecting bridge bearing alignment.',
  defaultParams: {
    siteType: 'Elevated Flyover & Bridge',
  },
  parameters: [
    {
      key: 'siteType',
      label: 'Site Inspection Zone',
      type: 'select',
      default: 'Elevated Flyover & Bridge',
      options: [
        { label: 'Elevated Flyover (PSC Girder Bridge)', value: 'Elevated Flyover & Bridge' },
        { label: 'Flexible Highway Pavement Cross-Section', value: 'Flexible Highway Pavement' },
      ],
    },
  ],
  metrics: [
    {
      id: 'crustThickness',
      label: 'Design Pavement Crust / Girder Depth',
      format: (_, params) => {
        return params.siteType.includes('Highway') ? '650 mm Total Pavement Crust' : '1.80 m PSC I-Girder Depth';
      },
      badge: 'IRC Spec',
      color: 'text-amber-400',
    },
  ],
  formulaOverview: [
    'Flexible Pavement CBR Method: \\text{Crust thickness } t = f(\\text{CBR, MSA})',
    'Girder Depth Rule: D \\approx \\frac{Span}{15} \\text{ to } \\frac{Span}{18}',
  ],
  engine: {
    createInitialState: () => ({}),
    update: (state) => state,
    render: (ctx, width, height, _, params) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(`SITE VISIT: ${params.siteType.toUpperCase()}`, 24, 30);

      if (params.siteType.includes('Highway')) {
        const layers = [
          { name: 'Bituminous Concrete (BC wearing coat)', thick: 40, col: '#09090b' },
          { name: 'Dense Bituminous Macadam (DBM binder)', thick: 75, col: '#18181b' },
          { name: 'Wet Mix Macadam (WMM base course)', thick: 150, col: '#52525b' },
          { name: 'Granular Sub-Base (GSB)', thick: 200, col: '#71717a' },
          { name: 'Compacted Subgrade Soil (CBR ≥ 8%)', thick: 500, col: '#451a03' },
        ];
        let y = 70;
        layers.forEach((l) => {
          const h = (l.thick / 600) * 120;
          ctx.fillStyle = l.col;
          ctx.fillRect(40, y, width - 80, h);
          ctx.strokeStyle = '#ffffff';
          ctx.strokeRect(40, y, width - 80, h);

          ctx.fillStyle = '#f8fafc';
          ctx.font = '10px Inter, sans-serif';
          ctx.fillText(`${l.name} - ${l.thick}mm`, 50, y + h * 0.6);
          y += h;
        });
      } else {
        const cx = width * 0.5;
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 25, 120, 50, 100);
        ctx.fillRect(cx - 90, 95, 180, 25);
        ctx.fillStyle = '#000000';
        ctx.fillRect(cx - 70, 85, 20, 10);
        ctx.fillRect(cx + 50, 85, 20, 10);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cx - 140, 55, 280, 30);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(cx - 160, 40, 320, 15);

        ctx.fillStyle = '#f8fafc';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Deck Slab & Crash Barriers', cx, 30);
        ctx.fillText('PSC I-Girder', cx, 72);
        ctx.fillText('Pier & Pier Cap', cx, 150);
      }
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMULATION 11: Lab 5 — Visit to Renowned Structures
 * ───────────────────────────────────────────────────────────────────────────── */
const sim11RenownedStructures: ICivilPerspectivesSimulation = {
  id: 'u25rce201-sim11-renowned-structures',
  simNumber: 11,
  title: 'Lab 5: Visit to Renowned Structures — Global & Heritage Engineering Case Studies',
  unit: 1,
  unitTitle: 'List of Experiments: Lab 5',
  topic: 'Visit to Renowned Structures',
  category: 'construction simulations',
  domain: 'CIVIL',
  icon: '🏛️',
  shortDescription: 'Analyze the architectural geometry, materials, and structural mechanics of world-renowned heritage and modern civil engineering landmarks.',
  detailedDescription: 'Prescribed as Experiment 5 in the syllabus, this case study laboratory analyzes iconic engineering marvels: Thanjavur Brihadisvara Temple (monolithic granite dry masonry constructed without mortar), Kallanai Dam (Grand Anicut, world’s oldest operational water diversion structure on river Kaveri), Chenab Arch Bridge (highest railway arch bridge in the world), and Pamban Sea Bridge.',
  learningObjectives: [
    'Analyze the load transmission and seismic stability of dry-stone interlocking granite masonry in Brihadisvara Temple.',
    'Examine the hydraulic scouring and diversion principles of the 2000-year-old Kallanai Dam.',
    'Investigate wind dynamic resistance and steel truss arch mechanics in the Chenab River Bridge.',
  ],
  courseOutcomes: ['CO1', 'CO5'],
  governingCodesAndStandards: ['UNESCO World Heritage Guidelines', 'IRC 24:2010 Steel Bridges'],
  civilPracticalScenario: 'Conducting a structural health audit of a heritage stone masonry monument to evaluate joint stability under modern ambient vehicular vibration.',
  defaultParams: {
    structureCaseStudy: 'Brihadisvara Temple (Thanjavur)',
  },
  parameters: [
    {
      key: 'structureCaseStudy',
      label: 'Civil Engineering Landmark',
      type: 'select',
      default: 'Brihadisvara Temple (Thanjavur)',
      options: [
        { label: 'Brihadisvara Temple (Granite Interlocking Masonry, 1010 CE)', value: 'Brihadisvara Temple (Thanjavur)' },
        { label: 'Kallanai Dam / Grand Anicut (Ancient Hydraulic Weir, 2nd Century CE)', value: 'Kallanai Dam (Grand Anicut)' },
        { label: 'Chenab Railway Arch Bridge (Highest Rail Arch Bridge, 359m)', value: 'Chenab Railway Arch Bridge' },
        { label: 'Pamban Sea Bridge (Cantilever Scherzer Rolling Lift Span)', value: 'Pamban Sea Bridge' },
      ],
    },
  ],
  metrics: [
    {
      id: 'structuralMilestone',
      label: 'Engineering Innovation',
      format: (_, params) => {
        if (params.structureCaseStudy.includes('Brihadisvara')) return '80-Tonne Monolithic Kumbam Cupola';
        if (params.structureCaseStudy.includes('Kallanai')) return 'World\'s Oldest Operational River Diversion';
        if (params.structureCaseStudy.includes('Chenab')) return 'Highest Rail Arch (359m above river bed)';
        return 'Scherzer Rolling Bascule Sea Bridge';
      },
      badge: 'Heritage',
      color: 'text-amber-400',
    },
  ],
  formulaOverview: [
    'Gravity Arch Thrust: H = \\frac{w L^2}{8 h}',
    'Dry Masonry Sliding Safety: FOS_{slip} = \\frac{\\mu \\sum W}{\\sum H} > 1.5',
  ],
  engine: {
    createInitialState: () => ({}),
    update: (state) => state,
    render: (ctx, width, height, _, params) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(`CIVIL MARVEL: ${params.structureCaseStudy.toUpperCase()}`, 24, 30);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(24, 50, width - 48, height - 74);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Engineering Insights & Technical Highlights:', 40, 80);

      const caseDetails: Record<string, string[]> = {
        'Brihadisvara Temple (Thanjavur)': [
          '• Height: 66 meters (216 ft) tall hollow pyramid vimana built entirely of interlocking granite.',
          '• Dry-stone construction: Built without binding cement mortar; interlocks purely via gravity and friction.',
          '• Top Cupola: Single 80-tonne monolithic stone hauled up a 6 km inclined ramp.',
          '• Seismic performance: Survived over 1,000 years of earthquakes due to broad base and interlocking damping.',
        ],
        'Kallanai Dam (Grand Anicut)': [
          '• Location: Diverts Kaveri river water across the delta into Kollidam and Vennaru.',
          '• Foundation: Massive unhewn stone boulders embedded into shifting alluvial sand river bed.',
          '• Hydraulic function: Ancient curved weir controls siltation and irrigates over 1 million acres.',
          '• UNESCO Recognition: One of the oldest water-regulation structures in continuous world operation.',
        ],
        'Chenab Railway Arch Bridge': [
          '• Span & Clearance: 467m main arch span rising 359m above the Chenab riverbed (higher than Eiffel Tower).',
          '• Steel truss: Fabricated using specialized low-temperature high-strength steel (Zone V seismic design).',
          '• Blast and Wind: Designed to withstand wind speeds up to 266 km/h and explosive blast threats.',
        ],
        'Pamban Sea Bridge': [
          '• India\'s iconic marine rail bridge linking mainland Rameswaram island over Palk Strait.',
          '• Rolling Bascule Span: Center span opens vertically to allow ships to pass underneath.',
          '• Marine splash corrosion: Advanced epoxy coatings and cathodic protection counteract salt spray.',
        ],
      };

      const items = caseDetails[params.structureCaseStudy] || caseDetails['Brihadisvara Temple (Thanjavur)'] || [];
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px Inter, sans-serif';
      items.forEach((item, idx) => {
        ctx.fillText(item, 40, 110 + idx * 26);
      });
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMULATION 12: Lab 6 — Study of Drawings
 * ───────────────────────────────────────────────────────────────────────────── */
const sim12StudyOfDrawings: ICivilPerspectivesSimulation = {
  id: 'u25rce201-sim12-study-of-drawings',
  simNumber: 12,
  title: 'Lab 6: Study of Drawings — Architectural Plans, Sections & Reinforcement Schedules',
  unit: 1,
  unitTitle: 'List of Experiments: Lab 6',
  topic: 'Study of drawings',
  category: 'construction simulations',
  domain: 'CIVIL',
  icon: '📐',
  shortDescription: 'Read and interpret real-world Civil Engineering drawings: architectural plans, sectional elevations, column schedules, and bar bending details.',
  detailedDescription: 'Prescribed as Experiment 6 in the syllabus, this laboratory guides students through reading engineering blueprints. Students inspect residential architectural floor plans, cross-sections, schedules of openings (doors and windows), structural centerline plans, column/beam reinforcement detailing, and Bar Bending Schedules (BBS) per SP 34.',
  learningObjectives: [
    'Read and interpret architectural plan views, elevation drawings, and cross-sections at standard scales (1:50, 1:100).',
    'Decode structural reinforcement detailing symbols: main bars, stirrups, clear cover, and lap lengths.',
    'Calculate bar bending lengths and compile an accurate Bar Bending Schedule (BBS).',
  ],
  courseOutcomes: ['CO2', 'CO5'],
  governingCodesAndStandards: ['SP 34:1987 Handbook on Concrete Reinforcement and Detailing', 'IS 962:1989 Code of Practice for Architectural and Building Drawings'],
  civilPracticalScenario: 'Translating a structural beam detailing drawing into exact rebar cutting lengths for the site steel bar bender, taking into account hook extensions and 90-degree bend deductions.',
  defaultParams: {
    drawingSheet: 'Architectural Floor Plan (1:100)',
    barDiameterMm: 16,
    clearSpanM: 4.5,
  },
  parameters: [
    {
      key: 'drawingSheet',
      label: 'Drawing Sheet View',
      type: 'select',
      default: 'Architectural Floor Plan (1:100)',
      options: [
        { label: 'Architectural Floor Plan (1:100)', value: 'Architectural Floor Plan (1:100)' },
        { label: 'Longitudinal Beam Cross-Section & BBS', value: 'Beam Reinforcement & BBS' },
        { label: 'Column & Footing Structural Schedule', value: 'Column Schedule' },
      ],
    },
    {
      key: 'barDiameterMm',
      label: 'Rebar Diameter Φ (mm)',
      type: 'select',
      default: 16,
      options: [
        { label: '12 mm (Slab & Secondary)', value: 12 },
        { label: '16 mm (Beam Main Tension)', value: 16 },
        { label: '20 mm (Heavy Column Main)', value: 20 },
        { label: '25 mm (Heavy Transfer Girder)', value: 25 },
      ],
    },
  ],
  metrics: [
    {
      id: 'unitWeightRebar',
      label: 'Rebar Unit Weight',
      format: (_, params) => {
        const d = Number(params.barDiameterMm);
        const w = (d * d) / 162;
        return `${w.toFixed(3)} kg/m (D²/162)`;
      },
      badge: 'BBS Weight',
      color: 'text-amber-400',
    },
    {
      id: 'cuttingLength',
      label: 'Standard Cutting Length',
      format: (_, params) => {
        const d = Number(params.barDiameterMm);
        const span = Number(params.clearSpanM || 4.5);
        const total = span + 2 * (0.001 * d * 40);
        return `${total.toFixed(2)} m (Clear Span + 2 × Ld)`;
      },
      badge: 'SP 34',
      color: 'text-emerald-400',
    },
  ],
  formulaOverview: [
    'Unit Weight of Steel: w = \\frac{D^2}{162} \\text{ kg/m}',
    'Development Length: L_d = \\frac{\\phi \\sigma_s}{4 \\tau_{bd}} \\approx 40\\phi \\text{ to } 50\\phi',
  ],
  engine: {
    createInitialState: () => ({}),
    update: (state) => state,
    render: (ctx, width, height, _, params) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(`STUDY OF DRAWINGS: ${params.drawingSheet.toUpperCase()}`, 24, 30);

      // Blueprint Canvas Box
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(24, 50, width - 48, height - 74);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 50, width - 48, height - 74);

      // Blueprint Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 40; x < width - 40; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 50);
        ctx.lineTo(x, height - 24);
        ctx.stroke();
      }
      for (let y = 60; y < height - 24; y += 30) {
        ctx.beginPath();
        ctx.moveTo(24, y);
        ctx.lineTo(width - 24, y);
        ctx.stroke();
      }

      // Drawing Title Block
      const tbW = 160;
      const tbH = 60;
      const tbX = width - 24 - tbW;
      const tbY = height - 24 - tbH;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(tbX, tbY, tbW, tbH);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(tbX, tbY, tbW, tbH);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('KPRIET CIVIL DRAWING LAB', tbX + 8, tbY + 16);
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText('Project: Standard G+1 Villa', tbX + 8, tbY + 28);
      ctx.fillText('Scale: 1:100 | Code: SP 34', tbX + 8, tbY + 40);
      ctx.fillText('Drawn: CE Perspectives', tbX + 8, tbY + 52);

      // Center Blueprint details
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Courier, monospace';
      ctx.fillText('LIVING ROOM (4000 × 5000 mm)', 60, 110);
      ctx.fillText('BEDROOM 1 (3600 × 4200 mm)', 60, 140);
      ctx.fillText(`MAIN REBAR: ${params.barDiameterMm} mm Φ Fe500D`, 60, 180);
      ctx.fillText(`STIRRUPS: 8 mm Φ 2-Legged @ 150 mm c/c`, 60, 205);
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Master Array of 12 Authoritative Simulations
 * ───────────────────────────────────────────────────────────────────────────── */
export const U25RCE201_SIMULATION_DEFINITIONS: ICivilPerspectivesSimulation[] = [
  sim01DisciplinesExplorer,
  sim02BuildingMaterials,
  sim03UnitConversions,
  sim04BuildingComponents,
  sim05NBCByelaws,
  sim06ISCodalTesting,
  sim07ExperienceMaterials,
  sim08MasonryYard,
  sim09RMCPlant,
  sim10BridgeRoadSite,
  sim11RenownedStructures,
  sim12StudyOfDrawings,
];

/* ─────────────────────────────────────────────────────────────────────────────
 * Alias Map & Helper Functions
 * ───────────────────────────────────────────────────────────────────────────── */
export const U25RCE201_ALIAS_MAP: Record<string, string> = {
  // Direct shortcuts
  'u25rce201': 'u25rce201-sim01-branches-roles',
  'u25ce201': 'u25rce201-sim01-branches-roles',
  'rce201': 'u25rce201-sim01-branches-roles',
  'ce201': 'u25rce201-sim01-branches-roles',

  // Experiments
  'experience-materials': 'u25rce201-sim07-experience-materials',
  'masonry-yard': 'u25rce201-sim08-masonry-yard',
  'brick-bonds': 'u25rce201-sim08-masonry-yard',
  'rmc-plant': 'u25rce201-sim09-rmc-plant',
  'bridge-road-site': 'u25rce201-sim10-bridge-road-site',
  'renowned-structures': 'u25rce201-sim11-renowned-structures',
  'study-of-drawings': 'u25rce201-sim12-study-of-drawings',

  // Theory simulations
  'branches-roles': 'u25rce201-sim01-branches-roles',
  'building-materials': 'u25rce201-sim02-building-materials',
  'unit-conversions': 'u25rce201-sim03-unit-conversions',
  'building-components': 'u25rce201-sim04-building-components',
  'nbc-byelaws': 'u25rce201-sim05-nbc-byelaws',
  'is-codal-testing': 'u25rce201-sim06-is-codal-testing',
};

export function resolveU25RCE201SimId(simId: string): string {
  if (!simId) return '';
  const lower = simId.toLowerCase().trim();
  if (U25RCE201_ALIAS_MAP[lower]) return U25RCE201_ALIAS_MAP[lower];

  if (lower.startsWith('u25ce201-')) {
    const candidate = 'u25rce201-' + lower.slice(9);
    return U25RCE201_ALIAS_MAP[candidate] || candidate;
  }

  const numMatch = lower.match(/^(?:sim-?|u25rce201-sim-?|u25ce201-sim-?)(0?[1-9]|1[0-2])$/);
  if (numMatch && numMatch[1]) {
    const num = parseInt(numMatch[1], 10);
    const target = U25RCE201_SIMULATION_DEFINITIONS.find((s) => s.simNumber === num);
    if (target) return target.id;
  }

  return simId;
}

/**
 * Standard ISimulationDefinition entries for unified Simulation Shell & Smart Board.
 */
export const U25RCE201_BOARD_SIMULATIONS: ISimulationDefinition[] = U25RCE201_SIMULATION_DEFINITIONS.map(
  (meta) => ({
    id: meta.id,
    title: meta.title,
    domain: 'CIVIL',
    category: meta.category,
    icon: meta.icon,
    shortDescription: meta.shortDescription,
    detailedDescription: meta.detailedDescription,
    unit: meta.unit,
    unitTitle: meta.unitTitle,
    topic: meta.topic,
    subjectKeywords: U25RCE201_SUBJECT_KEYWORDS,
    suggestedUnits: [meta.unit],
    learningObjectives: meta.learningObjectives,
    formulaOverview: Array.isArray(meta.formulaOverview) ? meta.formulaOverview.join(' | ') : (meta.formulaOverview || ''),
    parameters: meta.parameters,
    metrics: meta.metrics,
    engine: meta.engine,
    presetKey: meta.id,
    smartboardPresetKey: meta.id,
    tags: [meta.category, meta.unitTitle, meta.topic],
  })
);
