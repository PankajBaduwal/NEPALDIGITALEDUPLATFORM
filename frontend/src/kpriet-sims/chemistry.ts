import type { ISimulationDefinition } from './types';

const CHEM_SUBJECT_KEYWORDS = ['engineering chemistry', 'u21cy101', 'chemistry'];

function chemBoardSimulation(
  id: string,
  unit: number,
  unitTitle: string,
  subtype: string,
  topic: string,
  title: string,
  icon: string,
  shortDescription: string,
): ISimulationDefinition {
  return {
    id,
    boardEngine: 'chem',
    simulationSubtype: subtype,
    unit,
    unitTitle,
    topic,
    subjectKeywords: CHEM_SUBJECT_KEYWORDS,
    title,
    domain: 'CHEMISTRY',
    category: 'engineering chemistry',
    icon,
    shortDescription,
    detailedDescription: shortDescription + ' Interactive and step by step, with formulas, measurements and explanations — opens inside the Smart Board and 3D Virtual Lab.',
    learningObjectives: ['Explain ' + topic + ' step by step', 'Relate the model to the measured result and explain how each parameter changes it'],
    suggestedUnits: [unit],
    smartboardPresetKey: id,
    tags: ['Engineering Chemistry', unitTitle, topic, 'Core'],
    parameters: [],
    metrics: [],
    engine: { createInitialState: () => ({}), update: (state) => state, render: (ctx, width, height) => { ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 0, width, height); } },
  };
}

/**
 * Engineering Chemistry (U21CY101) — Comprehensive High-Definition Interactive 3D Virtual Laboratory.
 * Preserves all original simulations and adds the new major syllabus simulations.
 */
export const CHEMISTRY_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ==========================================
  // Unit I: Molecular Structure, Bonding & Reactivity (and Water Technology)
  // ==========================================
  chemBoardSimulation("chem-molecular-orbitals", 1, "Molecular Structure, Bonding and Reactivity", "molecular-structure",
    "Atomic & Molecular Orbitals", "Molecular Orbitals and Hybridization", "⚛️",
    "Explore atomic orbitals (s, px, py, pz, d), hybridization (sp, sp², sp³), sigma/pi overlaps, and molecular bonding in CH₄, C₂H₄, C₂H₂."),
  chemBoardSimulation("chem-stereochemistry", 1, "Molecular Structure, Bonding and Reactivity", "stereochemistry",
    "Conformations & Chirality", "Conformations and Stereochemistry", "🔄",
    "Inspect Newman and Sawhorse projections, staggered vs eclipsed rotational energy barriers, chiral R/S enantiomers, and E/Z isomerism."),
  chemBoardSimulation("chem-edta-titration", 1, "Characteristics of Water and Its Treatment", "water-treatment",
    "Water Hardness", "Water Hardness — EDTA Titration", "🧪",
    "Perform a volumetric EDTA titration to determine total hardness of a water sample as CaCO₃."),
  chemBoardSimulation("chem-lime-soda-process", 1, "Characteristics of Water and Its Treatment", "water-treatment",
    "Water Softening", "Lime-Soda Water Softening", "⚗️",
    "Dose hard water with lime and soda ash. Observe mixing, precipitation, settling, and treated water quality."),
  chemBoardSimulation("chem-water-treatment-plant", 1, "Characteristics of Water and Its Treatment", "water-treatment",
    "Water Treatment", "Municipal Water Treatment Plant", "🏗️",
    "Follow water through intake, coagulation, flocculation, sedimentation, sand filtration, and disinfection."),
  chemBoardSimulation("chem-reverse-osmosis", 1, "Characteristics of Water and Its Treatment", "water-treatment",
    "Desalination / Membrane Technology", "Reverse Osmosis Desalination Plant", "🌊",
    "Inspect an industrial reverse osmosis skid. Observe pretreatment, high-pressure booster pump, spiral-wound membrane crossflow separation, and pure permeate collection."),

  // ==========================================
  // Unit II: Organic Chemistry, Mechanisms & Electrochemistry
  // ==========================================
  chemBoardSimulation("chem-organic-mechanisms", 2, "Organic Chemistry and Reaction Mechanisms", "organic-mechanisms",
    "Reaction Mechanisms", "Organic Reaction Mechanisms (SN1, SN2, E1, E2)", "🧪",
    "Animate SN2 backside attack with Walden inversion, SN1 carbocation ionization, E2 anti-periplanar elimination, and curved electron arrows."),
  chemBoardSimulation("chem-aromatic-reactions", 2, "Organic Chemistry and Reaction Mechanisms", "aromatic-chemistry",
    "Aromaticity & Transformations", "Aromaticity and Functional-Group Transformations", "🎨",
    "Visualize planar 6π delocalization, EAS Arenium Wheland σ-complex, alcohol oxidation cascade, and diazotization azo-dye coupling."),
  chemBoardSimulation("chem-daniell-cell", 2, "Electrochemistry and Energy Storage Systems", "electrochemistry",
    "Electrochemical Cells", "Electrochemical Cell — Daniell Cell", "🔋",
    "Inspect a Zn|ZnSO₄ ‖ CuSO₄|Cu Daniell cell with electron flow, ion migration, and ~1.10 V cell potential."),
  chemBoardSimulation("chem-lithium-ion-battery", 2, "Electrochemistry and Energy Storage Systems", "electrochemistry",
    "Lithium-Ion Battery", "Lithium-Ion Battery — Internal Structure & Cycling", "⚡",
    "Inspect an industrial LiFePO₄ prismatic battery in 3D. Explore casing cutaway, exploded electrode stack, microscopic intercalation, reversible Li⁺ ion transport, and galvanic discharge / electrolytic charging."),
  chemBoardSimulation("chem-lead-acid-battery", 2, "Electrochemistry and Energy Storage Systems", "electrochemistry",
    "Lead-Acid Battery", "Lead-Acid Automotive Battery — 6-Cell Architecture", "🚗",
    "Explore a commercial 12V 6-cell lead-acid battery in 3D. Inspect Pb and PbO₂ plate groups, intercell busbars, envelope separators, dynamic sulfuric acid specific gravity, and double-sulfate reversible reactions."),
  chemBoardSimulation("chem-pem-fuel-cell", 2, "Electrochemistry and Energy Storage Systems", "electrochemistry",
    "PEM Hydrogen Fuel Cell", "PEM Hydrogen Fuel Cell — MEA & Electricity Generation", "💧",
    "Examine an industrial PEM fuel cell stack in 3D. Observe serpentine bipolar plates, Nafion proton transport, hydrogen oxidation, oxygen reduction, water formation, and live polarization power curves under load."),

  // ==========================================
  // Unit III: Polymers & Coordination Chemistry (and Corrosion)
  // ==========================================
  chemBoardSimulation("chem-polymerization", 3, "Polymers and Coordination Chemistry", "polymer-chemistry",
    "Molecular Polymerization", "Polymerization at the Molecular Scale", "🧬",
    "Connect monomer structure, free-radical addition chain growth, Nylon-6,6 step-growth with H₂O elimination, tacticity, and 3D cross-linked networks."),
  chemBoardSimulation("chem-coordination-chemistry", 3, "Polymers and Coordination Chemistry", "coordination-chemistry",
    "Coordination & CFT", "Coordination Chemistry and Crystal Field Theory", "💎",
    "Explore octahedral, tetrahedral, and square-planar geometries, 3D d-orbital splitting, high vs low spin states, d-d transitions & colors, and magnetic moments."),
  chemBoardSimulation("chem-corrosion-protection", 3, "Corrosion and Its Control", "corrosion",
    "Corrosion & Protection", "Corrosion and Cathodic Protection", "🛡️",
    "Compare unprotected steel corrosion with sacrificial anode and impressed current cathodic protection."),
  chemBoardSimulation("chem-polymer-processing", 3, "Polymers and Processing", "polymers",
    "Polymer Processing", "Polymer Processing — Three Machines", "🏭",
    "Select injection, extrusion, or compression moulding. Observe polymer flow through the actual machine."),
  chemBoardSimulation("chem-thermo-comparison", 3, "Polymers and Processing", "polymers",
    "Polymer Behaviour", "Thermoplastic vs Thermosetting Polymers", "♨️",
    "Heat a thermoplastic and thermosetting specimen. Compare softening, reshaping, and degradation behaviour."),

  // ==========================================
  // Unit IV: Thermodynamics, Phase Transitions & Kinetics
  // ==========================================
  chemBoardSimulation("chem-phase-transitions", 4, "Thermodynamics, Electrochemistry and Kinetics", "thermodynamics",
    "Phase Transitions", "Phase Transitions and Water Phase Diagram", "❄️",
    "Inspect Ice Ih hexagonal lattice, dynamic liquid water hydrogen bonds, vapor kinetic motion, Clausius-Clapeyron curves, Triple Point, and Critical Point."),
  chemBoardSimulation("chem-bomb-calorimeter", 4, "Fuels and Combustion", "fuels-combustion",
    "Calorimetry", "Bomb Calorimeter — Calorific Value", "🌡️",
    "Seal a fuel sample in an oxygen bomb, ignite, measure temperature rise, and calculate calorific value."),

  // ==========================================
  // Unit V: Surface Chemistry, Spectroscopy & Chromatography
  // ==========================================
  chemBoardSimulation("chem-adsorption-catalysis", 5, "Surface Chemistry, Spectroscopy and Chromatography", "surface-chemistry",
    "Adsorption & Catalysis", "Surface Adsorption and Heterogeneous Catalysis", "🧲",
    "Observe Pt(111) active sites, Physisorption vs Chemisorption, Langmuir monolayer coverage θ, and Langmuir-Hinshelwood catalytic cycle."),
  chemBoardSimulation("chem-chromatography", 5, "Surface Chemistry, Spectroscopy and Chromatography", "chromatography",
    "Chromatography (HPLC & GC)", "Chromatography: HPLC and Gas Chromatography", "📊",
    "Follow mobile phase through dual-piston pump, Rheodyne valve, C18 silica column partition, progressive band separation, and live chromatogram."),
  chemBoardSimulation("chem-spectroscopy", 5, "Surface Chemistry, Spectroscopy and Chromatography", "spectroscopy",
    "Spectroscopy (UV-Vis, IR, NMR)", "Spectroscopy: UV-Vis, FTIR, and NMR", "🔬",
    "Inspect Beer-Lambert UV-Vis path, FTIR harmonic molecular dipole stretching/bending, and 9.4 Tesla NMR superconducting Zeeman spin resonance."),
];
