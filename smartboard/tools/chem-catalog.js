'use strict';

/* Engineering Chemistry (U21CY101) — Semester I simulation catalogue.
   REBUILT CATALOGUE — 8 essential high-quality interactive 3D laboratory simulations.
   Legacy archive: git tag v1-chemistry-legacy (branch backup/pre-chemistry-rebuild-v2). */
(function () {
  const subject = { name: 'Engineering Chemistry', code: 'U21CY101', semester: 1, department: 'Information Technology', regulation: 'R2021 CBCS', category: 'BSC', credits: 3 };
  const units = [
    { unit: 1, title: 'Characteristics of Water and Its Treatment', subtype: 'water-treatment' },
    { unit: 2, title: 'Electrochemistry and Energy Storage Systems', subtype: 'electrochemistry' },
    { unit: 3, title: 'Corrosion and Its Control', subtype: 'corrosion' },
    { unit: 4, title: 'Fuels and Combustion', subtype: 'fuels-combustion' },
    { unit: 5, title: 'Polymers and Processing', subtype: 'polymers' },
  ];
  const rows = [
    // ──────────────────────────────────────────────────────────────────────
    // 8 Essential Simulations — New Generation
    // ──────────────────────────────────────────────────────────────────────

    // Sim 1 — Water Hardness: EDTA Titration (Unit I)
    ['chem-edta-titration', 1, 'Water Hardness', 'Water Hardness — EDTA Titration', '🧪',
      'Perform a volumetric EDTA titration to determine total hardness of a water sample as CaCO₃. Control the burette, observe the indicator colour change, and calculate the result.'],

    // Sim 2 — Lime-Soda Water Softening (Unit I)
    ['chem-lime-soda-process', 1, 'Water Softening', 'Lime-Soda Water Softening', '⚗️',
      'Dose hard water with lime and soda ash. Observe mixing, CaCO₃ and Mg(OH)₂ precipitation, settling, and measure treated water quality.'],

    // Sim 3 — Electrochemical Cell: Daniell Cell (Unit II)
    ['chem-daniell-cell', 2, 'Electrochemical Cells', 'Electrochemical Cell — Daniell Cell', '🔋',
      'Inspect a Zn|ZnSO₄ ‖ CuSO₄|Cu Daniell cell. Observe electron flow, ion migration through the salt bridge, and measure the cell potential (~1.10 V).'],

    // Sim 3b — Lithium-Ion Battery (Unit II)
    ['chem-lithium-ion-battery', 2, 'Lithium-Ion Battery', 'Lithium-Ion Battery — Internal Structure & Cycling', '⚡',
      'Inspect an industrial LiFePO₄ prismatic battery in 3D. Explore casing cutaway, exploded electrode stack, microscopic intercalation, reversible Li⁺ ion transport, and galvanic discharge / electrolytic charging.'],

    // Sim 3c — Lead-Acid Battery (Unit II)
    ['chem-lead-acid-battery', 2, 'Lead-Acid Battery', 'Lead-Acid Automotive Battery — 6-Cell Architecture', '🚗',
      'Explore a commercial 12V 6-cell lead-acid battery in 3D. Inspect Pb and PbO₂ plate groups, intercell busbars, envelope separators, dynamic sulfuric acid specific gravity, and double-sulfate reversible reactions.'],

    // Sim 3d — PEM Hydrogen Fuel Cell (Unit II)
    ['chem-pem-fuel-cell', 2, 'PEM Hydrogen Fuel Cell', 'PEM Hydrogen Fuel Cell — MEA & Electricity Generation', '💧',
      'Examine an industrial PEM fuel cell stack in 3D. Observe serpentine bipolar plates, Nafion proton transport, hydrogen oxidation, oxygen reduction, water formation, and live polarization power curves under load.'],

    // Sim 4 — Corrosion and Cathodic Protection (Unit III)
    ['chem-corrosion-protection', 3, 'Corrosion & Protection', 'Corrosion and Cathodic Protection', '🛡️',
      'Compare unprotected steel corrosion with sacrificial anode and impressed current cathodic protection. Observe corrosion product accumulation and protection effectiveness.'],

    // Sim 5 — Bomb Calorimeter: Calorific Value (Unit IV)
    ['chem-bomb-calorimeter', 4, 'Calorimetry', 'Bomb Calorimeter — Calorific Value', '🌡️',
      'Seal a fuel sample in an oxygen bomb, ignite, measure water temperature rise, apply corrections, and calculate higher calorific value.'],

    // Sim 6 — Polymer Processing: Three Machine Modes (Unit V)
    ['chem-polymer-processing', 5, 'Polymer Processing', 'Polymer Processing — Three Machines', '🏭',
      'Select injection moulding, extrusion, or compression moulding. Observe polymer material flow through the actual machine with heating, forming, and output stages.'],

    // Sim 7 — Thermoplastic vs Thermosetting Polymers (Unit V)
    ['chem-thermo-comparison', 5, 'Polymer Behaviour', 'Thermoplastic vs Thermosetting Polymers', '♨️',
      'Heat a thermoplastic and a thermosetting specimen on a laboratory heating plate. Compare softening, reshaping, and cross-link degradation behaviour.'],

    // Sim 8 — Municipal Water Treatment Plant (Unit I)
    ['chem-water-treatment-plant', 1, 'Water Treatment', 'Municipal Water Treatment Plant', '🏗️',
      'Follow water through intake, coagulation, flocculation, sedimentation, sand filtration, and disinfection. Inspect each stage and understand its purpose.'],

    // Sim 9 — Reverse Osmosis Desalination Plant (Unit I)
    ['chem-reverse-osmosis', 1, 'Desalination / Membrane Technology', 'Reverse Osmosis Desalination Plant', '🌊',
      'Follow water through an industrial RO skid: feed tank, cartridge pretreatment, high-pressure booster pump, spiral-wound membrane vessel cutaway, pure permeate collection, and brine discharge.'],

    // ──────────────────────────────────────────────────────────────────────
    // 3D Chemistry Virtual Laboratory Simulations
    // ──────────────────────────────────────────────────────────────────────

    // Sim 10 — Molecular Orbitals and Hybridization (Unit I)
    ['chem-molecular-orbitals', 1, 'Atomic & Molecular Orbitals', 'Molecular Orbitals and Hybridization', '⚛️',
      'Explore atomic orbitals (s, px, py, pz, d), hybridization (sp, sp², sp³), sigma/pi overlaps, and molecular bonding in CH₄, C₂H₄, C₂H₂.'],

    // Sim 11 — Conformations and Stereochemistry (Unit I)
    ['chem-stereochemistry', 1, 'Conformations & Chirality', 'Conformations and Stereochemistry', '🔄',
      'Inspect Newman and Sawhorse projections, staggered vs eclipsed rotational energy barriers, chiral R/S enantiomers, and E/Z isomerism.'],

    // Sim 12 — Organic Reaction Mechanisms (Unit II)
    ['chem-organic-mechanisms', 2, 'Reaction Mechanisms', 'Organic Reaction Mechanisms (SN1, SN2, E1, E2)', '🧪',
      'Animate SN2 backside attack with Walden inversion, SN1 carbocation ionization, E2 anti-periplanar elimination, and curved electron arrows.'],

    // Sim 13 — Aromaticity and Functional-Group Transformations (Unit II)
    ['chem-aromatic-reactions', 2, 'Aromaticity & Transformations', 'Aromaticity and Functional-Group Transformations', '🎨',
      'Visualize planar 6π delocalization, EAS Arenium Wheland σ-complex, alcohol oxidation cascade, and diazotization azo-dye coupling.'],

    // Sim 14 — Polymerization at the Molecular Scale (Unit III)
    ['chem-polymerization', 3, 'Molecular Polymerization', 'Polymerization at the Molecular Scale', '🧬',
      'Connect monomer structure, free-radical addition chain growth, Nylon-6,6 step-growth with H₂O elimination, tacticity, and 3D cross-linked networks.'],

    // Sim 15 — Coordination Chemistry and Crystal Field Theory (Unit III)
    ['chem-coordination-chemistry', 3, 'Coordination & CFT', 'Coordination Chemistry and Crystal Field Theory', '💎',
      'Explore octahedral, tetrahedral, and square-planar geometries, 3D d-orbital splitting, high vs low spin states, d-d transitions & colors, and magnetic moments.'],

    // Sim 16 — Phase Transitions and Water Phase Diagram (Unit IV)
    ['chem-phase-transitions', 4, 'Phase Transitions', 'Phase Transitions and Water Phase Diagram', '❄️',
      'Inspect Ice Ih hexagonal lattice, dynamic liquid water hydrogen bonds, vapor kinetic motion, Clausius-Clapeyron curves, Triple Point, and Critical Point.'],

    // Sim 17 — Surface Adsorption and Heterogeneous Catalysis (Unit V)
    ['chem-adsorption-catalysis', 5, 'Adsorption & Catalysis', 'Surface Adsorption and Heterogeneous Catalysis', '🧲',
      'Observe Pt(111) active sites, Physisorption vs Chemisorption, Langmuir monolayer coverage θ, and Langmuir-Hinshelwood catalytic cycle.'],

    // Sim 18 — Chromatography: HPLC and Gas Chromatography (Unit V)
    ['chem-chromatography', 5, 'Chromatography (HPLC & GC)', 'Chromatography: HPLC and Gas Chromatography', '📊',
      'Follow mobile phase through dual-piston pump, Rheodyne valve, C18 silica column partition, progressive band separation, and live chromatogram.'],

    // Sim 19 — Spectroscopy: UV-Vis, FTIR, and NMR (Unit V)
    ['chem-spectroscopy', 5, 'Spectroscopy (UV-Vis, IR, NMR)', 'Spectroscopy: UV-Vis, FTIR, and NMR', '🔬',
      'Inspect Beer-Lambert UV-Vis path, FTIR harmonic molecular dipole stretching/bending, and 9.4 Tesla NMR superconducting Zeeman spin resonance.'],
  ];

  const unitTitle = (u) => (units.find((x) => x.unit === u) || {}).title || '';
  const unitSubtype = (u) => (units.find((x) => x.unit === u) || {}).subtype || '';
  const allSimulations = rows.map(([id, unit, topic, title, icon, description]) => ({
    id,
    unit,
    topic,
    title,
    icon,
    description,
    unitTitle: unitTitle(unit),
    subtype: unitSubtype(unit),
    catalogStatus: 'CORE',
    consolidatedInto: null,
    legacy: false
  }));
  const byId = new Map(allSimulations.map((s) => [s.id, s]));
  // Active catalogue — all 8 are active CORE simulations
  const simulations = allSimulations;

  const get = (id) => {
    if (!id) return null;
    return byId.get(id) || null;
  };

  window.EduverseChemCatalog = {
    subject,
    units,
    simulations,
    allSimulations,
    simulationType: 'engineering-chemistry',
    get: (id) => get(id) || null,
    getRaw: (id) => byId.get(id) || null
  };
})();
