/**
 * PhysicsDataStorageSimData.ts
 * Authoritative Data, Scientific Models, Learning Tasks & Assessment Banks
 * for Physics for Data Storage and Computing (U25RPHU02)
 * Course Code: U25RPHU02 | Semester I | BSC | Credits: 2
 * Common to: AD, AM, BM, CB, CS, IT
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

export interface PhysicsSimulationMetadata {
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
  guidedSteps: GuidedStep[];
  challenges: ChallengeTask[];
  assessments: AssessmentQuestion[];
  defaultParams: Record<string, any>;
}

export const U25RPHU02_20_SIMULATIONS: PhysicsSimulationMetadata[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — OPTICAL MATERIALS AND DEVICES (Simulations 1–4)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'u25rphu02-optical-materials',
    unit: 1,
    unitTitle: 'Optical Materials and Devices',
    topic: 'Optical materials; absorption, transmission, reflection, emission and scattering',
    title: '3D Optical Materials and Light Interaction Lab',
    icon: '💎',
    shortDescription: 'Virtual optical bench examining light interaction, Beer-Lambert attenuation, refractive index, and scattering across materials.',
    learningObjectives: [
      'Analyze optical propagation through dielectric, semiconductor, and metal media',
      'Apply the Beer-Lambert attenuation law I(x) = I₀ exp(-αx) to compute absorption depth',
      'Distinguish specular reflection from diffuse scattering and relate bandgap Eg to transmission cut-off',
    ],
    prerequisites: ['Basic wave optics', 'Refractive index concepts', 'Photon energy E = hc/λ'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'I(x) = I_0 e^{-\\alpha x}, \\quad \\tilde{n} = n + i k, \\quad \\alpha = \\frac{4\\pi k}{\\lambda}, \\quad \\lambda_c = \\frac{hc}{E_g}',
    modelAssumptions: [
      'Normal and oblique plane wave incidence with Fresnel reflection coefficients',
      'Linear isotropic optical response for homogeneous slabs without multi-photon absorption',
      'Rayleigh and Mie scattering approximated via effective scattering cross-section',
    ],
    guidedSteps: [
      { title: 'Source & Material Bench', description: 'Observe the 3D laser emitter directed at the optical sample on the rotating bench.', highlightControl: 'wavelength' },
      { title: 'Wavelength Tuning', description: 'Sweep wavelength λ from ultraviolet (380 nm) to infrared (900 nm) and note transmission shifts in GaAs.', highlightControl: 'wavelength' },
      { title: 'Thickness & Attenuation', description: 'Vary sample thickness d from 10 to 200 µm to visualize exponential attenuation inside the block.', highlightControl: 'thickness' },
      { title: 'Detector Measurement', description: 'Check the real-time detector measuring reflected, transmitted, and scattered beam intensities.', highlightControl: 'detector' },
    ],
    challenges: [
      { id: 'c1', title: 'Find GaAs Absorption Cutoff', goal: 'Adjust wavelength to find the transmission onset for GaAs (Eg = 1.42 eV).', hint: 'λ_c = 1240 / 1.42 ≈ 873 nm.', successCondition: 'Observed transmission jumps above 870 nm.' },
      { id: 'c2', title: 'Achieve 90%+ Metal Reflection', goal: 'Select gold/aluminum metal and observe how skin depth restricts transmission to < 1%.', hint: 'Metals possess high extinction coefficient k.', successCondition: 'Reflectance > 90% recorded at detector.' },
      { id: 'c3', title: 'Analyze Scattering at Short λ', goal: 'Tune λ to 400 nm and observe scattered ray cone intensity compared to 800 nm.', hint: 'Rayleigh scattering scales as 1/λ⁴.', successCondition: 'Scattered flux is measurably higher at shorter wavelengths.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What physical property directly causes the attenuation of optical power in a semiconductor when photon energy exceeds bandgap?', options: ['Interband carrier generation (electron-hole pair excitation)', 'Coulomb blockade effect', 'Magnetic domain reorientation', 'Brillouin zone collapse'], correctIndex: 0, explanation: 'When hν > Eg, photons are absorbed by promoting valence electrons across the forbidden gap into the conduction band.' },
      { id: 'q2', type: 'prediction', question: 'If the sample thickness of a lossy medium is doubled while α remains constant, what happens to the transmitted intensity (neglecting surface reflections)?', options: ['It halves (I = I₀ / 2)', 'It decreases exponentially (I ∝ e^{-2αd})', 'It remains unchanged', 'It drops to zero immediately'], correctIndex: 1, explanation: 'Beer-Lambert law states I(2d) = I₀ e^{-α(2d)} = I₀ (e^{-αd})², which is an exponential decrease.' },
      { id: 'q3', type: 'interpretation', question: 'In the complex refractive index ñ = n + ik, what does the imaginary component k represent?', options: ['Phase velocity', 'Dielectric polarization speed', 'Extinction coefficient governing absorption', 'Magnetic permeability'], correctIndex: 2, explanation: 'The extinction coefficient k quantifies optical energy loss per wavelength through α = 4πk/λ.' },
      { id: 'q4', type: 'prediction', question: 'A semiconductor has a bandgap of 2.0 eV. What is its cutoff transmission wavelength λ_c?', options: ['620 nm', '1240 nm', '310 nm', '950 nm'], correctIndex: 0, explanation: 'λ_c = hc/Eg = 1240 eV·nm / 2.0 eV = 620 nm.' },
      { id: 'q5', type: 'concept', question: 'Why do thin metal films appear reflective while pure SiO₂ glass is transparent in the visible range?', options: ['Metals have free conduction electrons that screen light and reflect it', 'SiO₂ has free spins that polarize light', 'Metals have a zero dielectric constant', 'SiO₂ has high extinction coefficient k in visible light'], correctIndex: 0, explanation: 'Dense free electron gas in metals creates plasma oscillation below plasma frequency, strongly reflecting visible radiation.' },
    ],
    defaultParams: { material: 'semiconductor', wavelength: 550, thickness: 50, angle: 0 },
  },
  {
    id: 'u25rphu02-photodiode',
    unit: 1,
    unitTitle: 'Optical Materials and Devices',
    topic: 'Carrier generation and recombination; photodiode',
    title: '3D Semiconductor Carrier and Photodiode Lab',
    icon: '💡',
    shortDescription: 'Cutaway semiconductor p-n junction illustrating electron-hole pair generation, depletion field sweep, and reverse-bias photocurrent.',
    learningObjectives: [
      'Visualize photocarrier generation within the depletion region under incident photon flux',
      'Explain how reverse bias widens the depletion width W and minimizes junction capacitance',
      'Calculate photodiode responsivity R_λ and contrast dark current with optical photocurrent',
    ],
    prerequisites: ['p-n junction band diagrams', 'Built-in potential', 'Drift vs diffusion'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'I_{ph} = q \\eta \\left(\\frac{P_{opt}}{h\\nu}\\right), \\quad R_\\lambda = \\frac{\\eta q \\lambda}{hc}, \\quad W = \\sqrt{\\frac{2\\varepsilon_s (V_{bi} + V_R)}{q}\\left(\\frac{1}{N_A} + \\frac{1}{N_D}\\right)}',
    modelAssumptions: [
      'One electron-hole pair generated per absorbed photon with quantum efficiency η ≤ 1',
      'Depletion region electric field sweeps generated carriers at saturation drift velocity',
      'Simplified Shockley-Read-Hall recombination dynamics outside the space-charge zone',
    ],
    guidedSteps: [
      { title: 'p-n Junction Cutaway', description: 'Inspect the 3D p-type anode, n-type cathode, and central space-charge depletion zone.', highlightControl: 'bias' },
      { title: 'Optical Illumination', description: 'Turn on the optical source and observe incoming photons generating animated electron-hole pairs.', highlightControl: 'intensity' },
      { title: 'Electric Field Carrier Sweep', description: 'Notice electrons swept to the n-side and holes swept to the p-side by the built-in electric field.', highlightControl: 'bias' },
      { title: 'Reverse Bias Tuning', description: 'Apply reverse bias voltage VR to expand depletion width W and increase photodiode collection speed.', highlightControl: 'bias' },
    ],
    challenges: [
      { id: 'c1', title: 'Compare Dark vs Illuminated Current', goal: 'Measure junction current with intensity = 0 mW vs 50 mW at -5V bias.', hint: 'Dark current is governed by thermal minority generation, while photocurrent scales with optical power.', successCondition: 'Photocurrent exceeds 20 mA at 50 mW illumination.' },
      { id: 'c2', title: 'Maximize Responsivity with Wavelength', goal: 'Tune wavelength up to the bandgap cutoff to observe responsivity R_λ peaking before cutting off.', hint: 'R_λ = ηqλ/(hc) increases linearly with λ until hν < Eg.', successCondition: 'Peak responsivity identified near band edge.' },
      { id: 'c3', title: 'Demonstrate Carrier Recombination', goal: 'Observe carrier lifetime recombination when generation occurs far outside the depletion region.', hint: 'Carriers that recombine before reaching depletion layer do not contribute to drift photocurrent.', successCondition: 'Explain the role of diffusion length Ln, Lp in collection.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'Why are photodiodes typically operated under reverse bias rather than forward bias for optical detection?', options: ['Reverse bias widens the depletion zone, lowers junction capacitance, and increases response speed', 'Reverse bias eliminates all noise completely', 'Forward bias prevents carrier generation', 'Reverse bias produces negative resistance'], correctIndex: 0, explanation: 'Reverse bias increases the depletion width W, reducing junction capacitance C_j = εA/W for faster bandwidth and linear photocurrent response.' },
      { id: 'q2', type: 'prediction', question: 'If optical power incident on a photodiode is tripled while wavelength is held constant, what happens to the photocurrent?', options: ['It triples linearly', 'It increases by a factor of 9', 'It remains constant', 'It drops due to saturation'], correctIndex: 0, explanation: 'Photocurrent I_ph = R_λ · P_opt is directly proportional to incident optical power below saturation.' },
      { id: 'q3', type: 'interpretation', question: 'What is the dark current in a reverse-biased photodiode primarily caused by?', options: ['Thermally generated electron-hole pairs in and near the depletion region', 'Photons escaping from the metal contacts', 'Magnetic induction from the circuit wires', 'Spontaneous emission in the substrate'], correctIndex: 0, explanation: 'Thermal agitation generates minority carriers in the depletion region even in complete darkness, constituting the dark current.' },
      { id: 'q4', type: 'concept', question: 'What happens when incident photon energy is strictly less than the semiconductor bandgap (hν < Eg)?', options: ['No electron-hole pairs are generated; the material is transparent to this light', 'Carrier generation doubles', 'The junction breaks down into avalanche mode', 'The built-in potential drops to zero'], correctIndex: 0, explanation: 'Photons with energy below Eg cannot excite electrons across the bandgap, so optical absorption ceases.' },
      { id: 'q5', type: 'prediction', question: 'For a silicon photodiode (Eg = 1.12 eV) with quantum efficiency η = 0.8 at λ = 850 nm, the responsivity R_λ is approximately:', options: ['0.55 A/W', '1.20 A/W', '0.01 A/W', '5.50 A/W'], correctIndex: 0, explanation: 'R_λ = (0.8 · 1.6×10⁻¹⁹ · 850×10⁻⁹) / (6.626×10⁻³⁴ · 3×10⁸) ≈ 0.548 A/W.' },
    ],
    defaultParams: { wavelength: 850, intensity: 40, bias: -3.0, material: 'silicon' },
  },
  {
    id: 'u25rphu02-solar-cell',
    unit: 1,
    unitTitle: 'Optical Materials and Devices',
    topic: 'Solar cell; optical-to-electrical energy conversion',
    title: '3D Solar Cell and Maximum-Power Lab',
    icon: '☀️',
    shortDescription: 'Layered photovoltaic cell cutaway with variable irradiance, load resistance, and real-time I-V and P-V curves locating MPP.',
    learningObjectives: [
      'Understand photovoltaic energy conversion from photon absorption to electrical power delivery',
      'Distinguish short-circuit current I_sc, open-circuit voltage V_oc, and maximum power point (MPP)',
      'Evaluate fill factor (FF) and efficiency η under variable irradiance, shading, and load resistance',
    ],
    prerequisites: ['Photodiode operation', 'Diode I-V equation', 'Electrical power P = VI'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'I = I_{ph} - I_0 \\left(e^{\\frac{q(V + I R_s)}{n k_B T}} - 1\\right) - \\frac{V + I R_s}{R_{sh}}, \\quad P_{max} = V_{mp} I_{mp}, \\quad FF = \\frac{P_{max}}{V_{oc} I_{sc}}',
    modelAssumptions: [
      'Single-diode photovoltaic equivalent circuit with series and shunt resistances',
      'Uniform solar spectrum illumination with standard AM1.5 reference scaling',
      'Linear short-circuit current dependence on irradiance: I_sc ∝ G',
    ],
    guidedSteps: [
      { title: 'Photovoltaic Layer Stack', description: 'Explore the 3D cell: front anti-reflective grid, p-n emitter/base junction, and rear contact.', highlightControl: 'irradiance' },
      { title: 'Incident Irradiance & Shading', description: 'Adjust solar irradiance from 200 to 1000 W/m² or introduce partial shading to see photocurrent drop.', highlightControl: 'irradiance' },
      { title: 'Load Sweep & I-V Curve', description: 'Adjust the load resistance dial from 1 Ω to 100 Ω and watch the operating point travel along the I-V curve.', highlightControl: 'loadResistor' },
      { title: 'Locate Maximum Power Point (MPP)', description: 'Observe the peak of the green P-V curve where dP/dV = 0 to extract V_mp, I_mp, and maximum power.', highlightControl: 'loadResistor' },
    ],
    challenges: [
      { id: 'c1', title: 'Locate MPP at Standard Test Conditions', goal: 'Set 1000 W/m² and tune load resistance until operating power reaches its peak.', hint: 'Tune R_load until it matches V_mp / I_mp.', successCondition: 'Peak power operating point achieved within ±2%.' },
      { id: 'c2', title: 'Evaluate Partial Shading Effect', goal: 'Apply 50% partial shading and explain why output power drops disproportionately.', hint: 'Shaded cells become reverse-biased loads without bypass diodes.', successCondition: 'Shading power degradation analyzed.' },
      { id: 'c3', title: 'Calculate Fill Factor', goal: 'Record V_oc, I_sc, V_mp, I_mp and verify that FF = (V_mp · I_mp) / (V_oc · I_sc) is typically 0.75–0.85.', hint: 'Fill factor measures the squareness of the I-V characteristic.', successCondition: 'Fill factor computed correctly.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'Why are open-circuit voltage (V_oc) and short-circuit current (I_sc) not suitable operating points for extracting electrical energy?', options: ['At V_oc the current is zero and at I_sc the voltage is zero, so power P = V·I is zero in both cases', 'The cell burns out at those points', 'They violate energy conservation', 'They require infinite solar irradiance'], correctIndex: 0, explanation: 'Power P = V · I. At open circuit I = 0 (P=0); at short circuit V = 0 (P=0). Energy is only delivered at intermediate points.' },
      { id: 'q2', type: 'prediction', question: 'How does solar cell open-circuit voltage V_oc change when irradiance G doubles from 500 to 1000 W/m²?', options: ['It increases logarithmically by a small amount (~18 mV at room temp)', 'It doubles linearly', 'It quadruples', 'It drops by half'], correctIndex: 0, explanation: 'V_oc = (nk_B T / q) ln(I_ph/I₀ + 1). Because I_ph is inside the logarithm, V_oc increases only logarithmically with irradiance.' },
      { id: 'q3', type: 'interpretation', question: 'What does a high Fill Factor (FF > 0.8) indicate about a solar cell?', options: ['Low internal series resistance R_s and high shunt resistance R_sh leading to a square I-V curve', 'High thermal recombination losses', 'Low open circuit voltage', 'Thick anti-reflective coating only'], correctIndex: 0, explanation: 'High FF indicates minimal resistive losses, allowing the cell to operate near its ideal rectangular limit.' },
      { id: 'q4', type: 'concept', question: 'What is the primary role of the anti-reflective coating (such as Si₃N₄) on the silicon solar cell surface?', options: ['Minimize destructive Fresnel reflection so more photons penetrate into the semiconductor', 'Increase the bandgap of silicon', 'Act as an electrical battery', 'Block infrared photons'], correctIndex: 0, explanation: 'Bare silicon reflects over 30% of incident light; a quarter-wave dielectric coating cuts reflection down to < 3%.' },
      { id: 'q5', type: 'prediction', question: 'If a solar cell has V_oc = 0.65 V, I_sc = 8.0 A, and maximum power P_max = 4.16 W, what is its fill factor?', options: ['0.80 (80%)', '0.52 (52%)', '0.65 (65%)', '0.95 (95%)'], correctIndex: 0, explanation: 'FF = P_max / (V_oc · I_sc) = 4.16 / (0.65 · 8.0) = 4.16 / 5.20 = 0.80.' },
    ],
    defaultParams: { irradiance: 1000, angle: 0, shading: 0, loadResistance: 8.5 },
  },
  {
    id: 'u25rphu02-bluray',
    unit: 1,
    unitTitle: 'Optical Materials and Devices',
    topic: 'Optical data storage; Blu-ray technology',
    title: '3D Optical Disc and Blu-ray Data Storage Explorer',
    icon: '💿',
    shortDescription: 'Magnified rotatable optical disc platter with 405 nm laser spot, spiral track, micro-pits/lands, and RF read-head decoding.',
    learningObjectives: [
      'Compare CD, DVD, and Blu-ray optical data storage architectures and scaling parameters',
      'Explain diffraction-limited laser spot size d ≈ 1.22 λ / NA and its impact on areal density',
      'Understand phase cancellation (destructuve interference) at pit-land step edges (depth = λ / 4n)',
    ],
    prerequisites: ['Diffraction limit of light', 'Phase interference', 'Binary bit encoding'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'd_{spot} = 1.22 \\frac{\\lambda}{\\text{NA}}, \\quad h_{pit} = \\frac{\\lambda}{4 n}, \\quad \\Delta \\phi = \\frac{4\\pi n h}{\\lambda} = \\pi',
    modelAssumptions: [
      'Scalar diffraction optics for focused Gaussian beam spot profile',
      'Standard polycarbonate protective substrate index n = 1.55',
      'Binary NRZI run-length-limited encoding with photodiode quadrant push-pull tracking',
    ],
    guidedSteps: [
      { title: 'Disc & Track Zoom', description: 'Zoom into the spinning disc to see the spiral micro-track with molded reflective pits and lands.', highlightControl: 'format' },
      { title: 'Compare Optical Formats', description: 'Switch between CD (780 nm, NA 0.45), DVD (650 nm, NA 0.60), and Blu-ray (405 nm, NA 0.85).', highlightControl: 'format' },
      { title: 'Phase Step Cancellation', description: 'Observe how light reflected from pit bottom travels λ/2 further in round-trip, creating destructive interference.', highlightControl: 'wavelength' },
      { title: 'Laser Read-Head & RF Signal', description: 'Follow the 405 nm blue-violet laser spot tracking over pits and generate live RF modulated voltage stream.', highlightControl: 'readHead' },
    ],
    challenges: [
      { id: 'c1', title: 'Compare Spot Sizes for CD vs Blu-ray', goal: 'Measure focused spot diameter for CD (780nm/0.45NA) vs Blu-ray (405nm/0.85NA).', hint: 'Blu-ray spot size is less than 1/3 of CD spot size, enabling > 5x track density.', successCondition: 'Spot size ratio verified mathematically.' },
      { id: 'c2', title: 'Decode a Synthetic Bitstream', goal: 'Enter synthetic ASCII text and watch the read head convert pit-land transitions into binary bits.', hint: 'A transition represents a binary 1; continuous land or pit represents binary 0s.', successCondition: 'Message successfully read with zero parity errors.' },
      { id: 'c3', title: 'Demonstrate NA and Cover Layer Tradeoff', goal: 'Inspect why Blu-ray uses a thin 0.1 mm cover layer to tolerate high 0.85 NA without coma aberration.', hint: 'Coma aberration scales with substrate thickness t · NA³.', successCondition: 'Substrate thickness comparison verified.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'Why does Blu-ray use a 405 nm blue-violet laser instead of the 650 nm red laser used in DVDs?', options: ['Shorter wavelength produces a smaller diffraction-limited spot size, allowing smaller pits and higher storage density', 'Blue lasers run cooler and consume less electrical power', 'Red light does not reflect off aluminum', 'Polycarbonate absorbs blue light completely'], correctIndex: 0, explanation: 'Focused spot size d ∝ λ/NA. Decreasing λ from 650 nm to 405 nm reduces spot diameter by ~38%, dramatically increasing storage capacity.' },
      { id: 'q2', type: 'prediction', question: 'What is the required pit depth h on an optical disc substrate with refractive index n = 1.5 for destructive interference at λ = 405 nm?', options: ['67.5 nm', '135 nm', '270 nm', '405 nm'], correctIndex: 0, explanation: 'Round-trip phase shift Δφ = 2(2πn h / λ) = π ⇒ h = λ / (4n) = 405 / (4 · 1.5) = 67.5 nm.' },
      { id: 'q3', type: 'interpretation', question: 'If Numerical Aperture NA is increased from 0.60 to 0.85 and wavelength is reduced from 650 nm to 405 nm, what is the approximate reduction in spot area (1/density increase)?', options: ['Spot area decreases by ~78% (density increases ~4.5x)', 'Spot area increases by 2x', 'Spot area remains unchanged', 'Spot area drops to zero'], correctIndex: 0, explanation: 'Area ratio = (λ_BD / NA_BD)² / (λ_DVD / NA_DVD)² = (405/0.85)² / (650/0.60)² ≈ 227000 / 1173611 ≈ 0.193. A ~5x density boost!' },
      { id: 'q4', type: 'concept', question: 'Why does Blu-ray require a much thinner protective cover layer (0.1 mm) compared to DVD (0.6 mm) and CD (1.2 mm)?', options: ['High NA (0.85) causes severe optical coma aberration from disc tilt if the cover layer is thick', '0.1 mm is cheaper to manufacture', 'Thicker plastic blocks blue light completely', 'The laser diode touches the disc surface directly'], correctIndex: 0, explanation: 'Coma aberration from disc tilt is proportional to t · NA³ / n³. To utilize a very high NA of 0.85, the cover layer thickness t had to be reduced to 0.1 mm.' },
      { id: 'q5', type: 'prediction', question: 'What physical photodiode signal change indicates the laser spot has crossed from a land onto a pit?', options: ['A sharp drop in reflected optical intensity due to destructive interference at the pit boundary', 'A sharp increase in optical intensity', 'A shift in reflected laser color from blue to red', 'An electrical voltage spike exceeding 100V'], correctIndex: 0, explanation: 'Destructive phase interference between reflections from the pit floor and surrounding land reduces net reflected light to the photodetector.' },
    ],
    defaultParams: { format: 'bluray', zoom: 100, rotationSpeed: 1, syntheticData: '1011001' },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — MAGNETIC MATERIALS AND DATA STORAGE (Simulations 5–8)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'u25rphu02-ferromagnetism',
    unit: 2,
    unitTitle: 'Magnetic Materials and Data Storage',
    topic: 'Classification of magnetic materials; ferromagnetic theory',
    title: '3D Magnetic Domains and Ferromagnetism Lab',
    icon: '🧲',
    shortDescription: 'Interactive 3D crystal sample exhibiting Weiss magnetic domains, exchange interaction, and domain wall displacement under magnetic fields.',
    learningObjectives: [
      'Understand quantum exchange interaction and Weiss molecular field in ferromagnetic ordering',
      'Distinguish diamagnetic, paramagnetic, and ferromagnetic responses to external field H',
      'Observe domain wall motion versus domain rotation and analyze thermal demagnetization at Curie temperature Tc',
    ],
    prerequisites: ['Magnetic dipole moment', 'Magnetic susceptibility χ', 'Thermal agitation k_B T'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'E_{ex} = -2 J \\sum \\vec{S}_i \\cdot \\vec{S}_j, \\quad B_{int} = \\mu_0 (H + \\lambda M), \\quad M_s(T) \\approx M_0 \\tanh\\left(\\frac{M_s T_c}{M_0 T}\\right)',
    modelAssumptions: [
      '2D/3D Heisenberg spin model with nearest-neighbor quantum exchange coupling J > 0',
      'Bloch domain wall energy balancing exchange energy and magnetocrystalline anisotropy',
      'Mean-field Curie-Weiss temperature dependence for thermal disordering above Tc',
    ],
    guidedSteps: [
      { title: 'Unmagnetized Domain Structure', description: 'Look at the multi-domain sample in zero external field; net magnetization is zero because domain dipoles cancel.', highlightControl: 'magneticField' },
      { title: 'External Field Application', description: 'Increase external magnetic field H and observe favorable domains expanding via domain wall motion.', highlightControl: 'magneticField' },
      { title: 'Domain Rotation & Saturation', description: 'At higher field strengths, atomic dipole vectors rotate into alignment with H until saturation Ms is reached.', highlightControl: 'magneticField' },
      { title: 'Thermal Heating & Curie Point', description: 'Raise temperature T above the material Curie temperature Tc (e.g. Iron 1043 K) to observe transition to paramagnetism.', highlightControl: 'temperature' },
    ],
    challenges: [
      { id: 'c1', title: 'Achieve Full Domain Alignment', goal: 'Increase applied field H to reach magnetic saturation where all domain walls disappear.', hint: 'Saturation occurs when all dipoles align parallel to the external field vector.', successCondition: 'Net sample magnetization reaches > 98% of Ms.' },
      { id: 'c2', title: 'Observe Demagnetization via Temperature', goal: 'Heat a saturated iron sample above 1043 K and note spontaneous magnetization dropping to zero.', hint: 'Thermal energy k_B T overcomes exchange energy J above Tc.', successCondition: 'Paramagnetic state confirmed above Curie point.' },
      { id: 'c3', title: 'Compare Materials', goal: 'Switch between Iron (Fe), Nickel (Ni), and Cobalt (Co) and observe differing saturation magnetization values.', hint: 'Co has highest Tc (1388 K) while Ni has lowest Tc (627 K).', successCondition: 'Material-specific properties verified.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What quantum mechanical phenomenon is responsible for parallel dipole alignment in ferromagnetic materials?', options: ['Quantum exchange interaction arising from Pauli exclusion and Coulomb repulsion', 'Gravitational dipole attraction', 'Relativistic Doppler shift', 'Van der Waals bonding'], correctIndex: 0, explanation: 'The exchange interaction (J > 0) minimizes electrostatic Coulomb energy when electron spins are aligned parallel, as required by the Pauli principle.' },
      { id: 'q2', type: 'prediction', question: 'Why does an unmagnetized piece of ferromagnetic iron exhibit zero net external magnetic field at room temperature?', options: ['The material is divided into microscopic domains whose magnetic orientations cancel each other out', 'The iron has lost its magnetic atoms', 'The iron is above its Curie temperature', 'Exchange interaction is zero at room temperature'], correctIndex: 0, explanation: 'To minimize magnetostatic field energy, the sample forms magnetic domains with opposing orientations that cancel globally.' },
      { id: 'q3', type: 'interpretation', question: 'What happens to a ferromagnetic material when heated above its Curie temperature Tc?', options: ['It transitions to a paramagnetic material with susceptibility χ = C / (T - Tc)', 'It becomes a permanent superconductor', 'It permanently vaporizes', 'It becomes a perfect diamagnet with χ = -1'], correctIndex: 0, explanation: 'Above Tc, thermal agitation destroys long-range spin order, turning the material paramagnetic according to the Curie-Weiss law.' },
      { id: 'q4', type: 'concept', question: 'In the magnetization process under moderate magnetic fields, which mechanism occurs first before domain rotation?', options: ['Domain wall displacement (favorable domains grow at the expense of unfavorable ones)', 'Nuclear fission in the core', 'Complete loss of crystalline structure', 'Instant inversion of all spins simultaneously'], correctIndex: 0, explanation: 'Under weak to moderate fields, domain walls move easily past pinning sites; coherent rotation of dipoles against anisotropy requires much stronger fields.' },
      { id: 'q5', type: 'prediction', question: 'Which of the following elemental ferromagnets possesses the highest Curie temperature Tc?', options: ['Cobalt (Tc ≈ 1388 K)', 'Iron (Tc ≈ 1043 K)', 'Nickel (Tc ≈ 627 K)', 'Gadolinium (Tc ≈ 293 K)'], correctIndex: 0, explanation: 'Cobalt has the strongest exchange coupling among the transition metals with a Curie point of ~1388 K (1115 °C).' },
    ],
    defaultParams: { magneticField: 0, temperature: 300, material: 'iron' },
  },
  {
    id: 'u25rphu02-hysteresis',
    unit: 2,
    unitTitle: 'Magnetic Materials and Data Storage',
    topic: 'Hysteresis; remanence; coercivity; saturation',
    title: '3D Magnetic Hysteresis Loop Laboratory',
    icon: '➰',
    shortDescription: 'Electromagnet testbench tracing dynamic B-H and M-H hysteresis curves with labeled saturation, remanence, coercivity, and energy loss.',
    learningObjectives: [
      'Trace complete B-H and M-H magnetic hysteresis loops under cyclic magnetizing field H',
      'Identify and extract key magnetic metrics: Saturation flux density B_s, Remanence B_r, and Coercivity H_c',
      'Evaluate hysteresis loop area as energy loss per cycle W_h = ∮ B dH and contrast soft vs hard magnetic media',
    ],
    prerequisites: ['Magnetic flux density B = μ₀(H + M)', 'Electromagnetic induction', 'Magnetic domains'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'B = \\mu_0 (H + M), \\quad W_h = \\oint B \\, dH, \\quad \\mu_r = \\frac{1}{\\mu_0} \\frac{dB}{dH}',
    modelAssumptions: [
      'Empirical Jiles-Atherton hysteresis model with domain wall pinning and reversible bending',
      'Symmetric cyclic field excitation H(t) = H_max sin(ωt)',
      'Distinction between B-H loop (magnetic induction) and M-H loop (material magnetization)',
    ],
    guidedSteps: [
      { title: 'Electromagnet & Sample', description: 'Inspect the magnetic sample placed inside the pole gaps of the virtual electromagnet.', highlightControl: 'appliedField' },
      { title: 'Sweep Forward to Saturation', description: 'Sweep H in the positive direction to trace initial magnetization curve to saturation point B_s.', highlightControl: 'appliedField' },
      { title: 'Observe Remanence at Zero Field', description: 'Reduce H back to zero; notice the remaining magnetization stored in the core (Remanence B_r).', highlightControl: 'appliedField' },
      { title: 'Reverse Field to Coercivity', description: 'Apply negative field until induction reaches zero; this magnitude is the Coercivity H_c.', highlightControl: 'appliedField' },
    ],
    challenges: [
      { id: 'c1', title: 'Measure Remanence and Coercivity', goal: 'Sweep a hard magnetic sample and read B_r and H_c directly from the virtual oscilloscope.', hint: 'B_r is the y-intercept (at H=0); H_c is the x-intercept (at B=0).', successCondition: 'Accurate values of B_r and H_c logged.' },
      { id: 'c2', title: 'Compare Soft vs Hard Materials', goal: 'Switch between Soft Silicon Steel and Hard Alnico/CoPt; compare loop width and hysteresis area.', hint: 'Soft materials have narrow loops (low H_c) to minimize transformer core loss.', successCondition: 'Loop area contrast explained for storage vs transformers.' },
      { id: 'c3', title: 'Compute Energy Loss per Cycle', goal: 'Calculate loop area W_h and multiply by 50 Hz to determine dissipated power density in W/m³.', hint: 'Power loss = f · ∮ B dH.', successCondition: 'Core loss computed for power frequency.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the physical meaning of magnetic remanence (remanent induction B_r)?', options: ['The residual magnetic flux density remaining in the material when the applied field H is reduced to zero', 'The maximum field the electromagnet can generate', 'The field required to completely demagnetize the material', 'The temperature where magnetization drops to zero'], correctIndex: 0, explanation: 'Remanence B_r represents the retained magnetization after an external field is removed, forming the basis for non-volatile magnetic memory.' },
      { id: 'q2', type: 'concept', question: 'What is magnetic coercivity (coercive field H_c)?', options: ['The reverse magnetic field intensity required to reduce the residual magnetization to zero', 'The maximum flux density at saturation', 'The initial slope of the B-H curve', 'The electrical resistance of the magnet core'], correctIndex: 0, explanation: 'Coercivity H_c measures the material resistance to demagnetization; high H_c is critical for permanent data retention.' },
      { id: 'q3', type: 'interpretation', question: 'Why are hard magnetic materials (such as CoPt or NdFeB) preferred for magnetic data storage media while soft materials (such as MnZn ferrite) are used for read heads?', options: ['Hard materials retain bits reliably against stray fields (high H_c); soft materials switch easily with high sensitivity (low H_c, high μ)', 'Soft materials are too expensive to put on platters', 'Hard materials do not conduct electricity', 'Soft materials have zero remanence'], correctIndex: 0, explanation: 'Recording media requires high coercivity so recorded bits are not erased by stray fields; read/write heads require low coercivity and high permeability for rapid flux switching.' },
      { id: 'q4', type: 'prediction', question: 'What does the enclosed area of a complete B-H hysteresis loop represent physically?', options: ['The magnetic energy dissipated as heat per unit volume during one complete cycle (∮ B dH)', 'The total mechanical mass of the core', 'The electrical capacitance of the windings', 'The optical reflectivity of the sample surface'], correctIndex: 0, explanation: 'By Poynting theorem, the loop area represents hysteresis work converted irreversibly into heat per unit volume per cycle.' },
      { id: 'q5', type: 'concept', question: 'What causes the irreversible step-like jumps (Barkhausen effect) observed during magnetization along the steep portion of the hysteresis loop?', options: ['Domain walls abruptly breaking free from pinning sites (impurities, crystal defects, grain boundaries)', 'Electrons colliding with photons', 'Thermal expansion of the copper windings', 'Radio frequency interference'], correctIndex: 0, explanation: 'The Barkhausen effect is caused by jerky, discontinuous domain wall motion as walls snap free from microscopic crystal pinning defects.' },
    ],
    defaultParams: { appliedField: 0, materialType: 'soft-ferrite', frequency: 1 },
  },
  {
    id: 'u25rphu02-magnetic-memory',
    unit: 2,
    unitTitle: 'Magnetic Materials and Data Storage',
    topic: 'Magnetic memory; magnetic data storage',
    title: '3D Magnetic Memory Write/Read Head',
    icon: '💾',
    shortDescription: 'Magnified platter storage track with write coil, inductive/MR read head, magnetic transition bits, and bit-stream error analysis.',
    learningObjectives: [
      'Compare Longitudinal (LMR) and Perpendicular (PMR) magnetic recording architectures',
      'Explain how the write head fringe field orients magnetic grains above the media coercivity',
      'Understand readback voltage pulse generation at magnetic transition boundaries (dB/dt or ΔR)',
    ],
    prerequisites: ['Faraday law of induction', 'Coercivity and remanence', 'Binary NRZI coding'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'V_{read} \\propto -N \\frac{d\\Phi}{dt} = -N \\frac{d\\Phi}{dx} \\frac{dx}{dt}, \\quad H_{fringe} > H_c, \\quad \\text{Linear Density} = \\frac{1}{\\Delta x}',
    modelAssumptions: [
      'Karlqvist fringe field approximation for inductive write head gap',
      'Perpendicular recording with soft magnetic underlayer (SUL) flux return path',
      'Lorentzian readback pulse waveform modeling with pulse width PW50',
    ],
    guidedSteps: [
      { title: 'Platter & Flying Slider Head', description: 'Observe the nanoscale flying slider head suspended a few nanometers above the spinning platter track.', highlightControl: 'headPosition' },
      { title: 'Write Process & Field Inversion', description: 'Send a byte sequence (e.g. 10110010) and watch the write coil energize, magnetizing grains up or down (PMR).', highlightControl: 'writeData' },
      { title: 'Transition Readback Pulse', description: 'Move the read head over magnetized transitions; notice voltage spikes produced at polarity reversals.', highlightControl: 'readHead' },
      { title: 'Bit Spacing & Noise Errors', description: 'Reduce bit spacing to test high density; observe inter-symbol interference (ISI) and noise-induced bit flip errors.', highlightControl: 'bitSpacing' },
    ],
    challenges: [
      { id: 'c1', title: 'Record a Byte and Read Back', goal: 'Write a synthetic 8-bit pattern (e.g. 11001010) and verify correct digital decoding from readback pulses.', hint: 'Transitions (magnetization reversals) correspond to binary 1s in NRZI.', successCondition: 'Byte decoded with 100% fidelity.' },
      { id: 'c2', title: 'Compare PMR vs LMR Bit Density', goal: 'Switch to Perpendicular Magnetic Recording (PMR) and observe smaller grain clusters without superparamagnetic collapse.', hint: 'PMR aligns bits vertically into the platter with a soft underlayer.', successCondition: 'PMR density improvement observed.' },
      { id: 'c3', title: 'Diagnose Inter-Symbol Interference (ISI)', goal: 'Increase linear bit density until adjacent transition pulses overlap (pulse crowding) and trigger an error.', hint: 'When transition spacing < PW50, adjacent pulses cancel each other out.', successCondition: 'ISI read error identified and resolved by adjusting spacing.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'In magnetic hard disk recording, what physical feature on the medium represents a binary "1" in NRZI encoding?', options: ['A magnetic polarity transition (reversal of magnetization direction)', 'A region with zero magnetization', 'An optical hole burned by a laser', 'A change in physical track height'], correctIndex: 0, explanation: 'In NRZI (Non-Return-to-Zero Inverted) magnetic recording, a reversal in magnetization orientation produces a flux change that reads as binary 1; no reversal reads as binary 0.' },
      { id: 'q2', type: 'concept', question: 'Why did hard drive technology transition from Longitudinal (LMR) to Perpendicular (PMR) Magnetic Recording?', options: ['PMR aligns magnetic dipoles vertically into the platter thickness, delaying the superparamagnetic limit and enabling higher bit density', 'PMR uses cheaper plastic platters', 'LMR heads could not spin faster than 100 RPM', 'PMR requires zero electrical power'], correctIndex: 0, explanation: 'In PMR, demagnetizing fields between adjacent bits are smaller, and a soft magnetic underlayer (SUL) concentrates write flux, overcoming thermal superparamagnetic limits at high density.' },
      { id: 'q3', type: 'prediction', question: 'What happens to the magnetic state of a hard drive platter bit if ambient thermal energy exceeds the grain magnetic anisotropy energy (k_B T > K_u V)?', options: ['Superparamagnetic effect: thermal energy flips the grain magnetization randomly, destroying stored data', 'The platter becomes permanently superconducting', 'The bit spacing automatically expands', 'The write head fuses to the platter'], correctIndex: 0, explanation: 'When thermal agitation k_B T exceeds the anisotropy barrier K_u V, magnetic grains spontaneously flip orientations, losing stored digital bits (the superparamagnetic limit).' },
      { id: 'q4', type: 'interpretation', question: 'How is the readback voltage signal generated in an inductive read head passing over a magnetic transition?', options: ['By Faraday law of induction: the changing magnetic flux dΦ/dt through the coil induces a voltage pulse V = -N dΦ/dt', 'By thermoelectric Seebeck effect', 'By electrostatic capacitance discharge', 'By optical photoemission'], correctIndex: 0, explanation: 'As the head moves across a magnetic boundary at velocity v, flux changes rapidly: dΦ/dt = v · dΦ/dx, inducing an electrical voltage pulse in the coil.' },
      { id: 'q5', type: 'prediction', question: 'What must be true about the write head fringe field H_write compared to the medium coercivity H_c?', options: ['H_write must be strictly greater than H_c (H_write > H_c)', 'H_write must be exactly zero', 'H_write must be less than H_c / 10', 'H_write is independent of H_c'], correctIndex: 0, explanation: 'To switch the magnetic orientation of the storage grains, the magnetic field applied by the write head must exceed the coercivity of the recording medium.' },
    ],
    defaultParams: { recordingMode: 'PMR', bitSpacing: 35, writeData: '10110010', noiseLevel: 0.05 },
  },
  {
    id: 'u25rphu02-gmr',
    unit: 2,
    unitTitle: 'Magnetic Materials and Data Storage',
    topic: 'Giant magnetoresistance (GMR); magnetic stripe',
    title: '3D GMR Sensor and Magnetic Stripe Reader',
    icon: '💳',
    shortDescription: 'Layered GMR spin-valve sensor with spin-dependent electron scattering, alongside synthetic magnetic stripe card swiping.',
    learningObjectives: [
      'Understand the Giant Magnetoresistance (GMR) effect in Ferromagnet/Non-magnetic/Ferromagnet spin-valves',
      'Explain spin-dependent electron scattering in parallel (low R) vs antiparallel (high R) magnetic states',
      'Analyze magnetic stripe reader operation using F2F two-frequency coherent phase encoding',
    ],
    prerequisites: ['Electron spin states', 'Drude electrical conductivity', 'Magnetic dipoles'],
    estimatedTimeMinutes: 15,
    formulaOverview: '\\text{GMR Ratio} = \\frac{R_{AP} - R_P}{R_P} \\times 100\\%, \\quad R(\\theta) = R_P + \\frac{\\Delta R}{2}(1 - \\cos\\theta), \\quad \\text{F2F Phase Modulation}',
    modelAssumptions: [
      'Two-current Mott model for spin-up and spin-down conduction channels',
      'Rigid pinned layer via antiferromagnetic exchange bias (FeMn or IrMn)',
      'Synthetic credit-card format magnetic stripe compliant with ISO/IEC 7811 (no real bank data used)',
    ],
    guidedSteps: [
      { title: 'GMR Spin-Valve Stack', description: 'Inspect the nanoscale layers: Antiferromagnet, Pinned Ferromagnet, Copper Spacer, and Free Ferromagnet.', highlightControl: 'sensorAngle' },
      { title: 'Parallel Magnetization State', description: 'Align Free Layer parallel to Pinned Layer (θ = 0°); observe spin-up electrons traversing with minimal resistance (R_P).', highlightControl: 'sensorAngle' },
      { title: 'Antiparallel High Resistance State', description: 'Rotate Free Layer to antiparallel (θ = 180°); both spin channels now experience strong scattering, maximizing resistance (R_AP).', highlightControl: 'sensorAngle' },
      { title: 'Magnetic Stripe Reader Mode', description: 'Switch to Magstripe mode and swipe a synthetic card across the 3-track head at various swipe speeds.', highlightControl: 'swipeSpeed' },
    ],
    challenges: [
      { id: 'c1', title: 'Maximize GMR Response Ratio', goal: 'Measure R_P and R_AP and calculate the GMR ratio: (R_AP - R_P) / R_P · 100%.', hint: 'Typical metallic spin valves achieve 10%–20% GMR ratios at room temperature.', successCondition: 'GMR percentage calculated accurately.' },
      { id: 'c2', title: 'Swipe Synthetic Card at Valid Speed', goal: 'Swipe the card at optimal speed (15–40 cm/s) to decode Track 2 synthetic digits without timing jitter errors.', hint: 'Swiping too slowly or too fast causes F2F clock recovery synchronization failure.', successCondition: 'Synthetic card successfully decoded.' },
      { id: 'c3', title: 'Test Noise Tolerance in Stripe Decoding', goal: 'Introduce 20% magnetic jitter noise and observe parity check catching corrupt characters.', hint: 'ISO 7811 Track 2 uses 5-bit BCD (4 data bits + 1 odd parity bit) plus an LRC check byte.', successCondition: 'Parity check error flag correctly triggered.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What physical mechanism produces the dramatic change in electrical resistance in a GMR spin-valve?', options: ['Spin-dependent electron scattering at interfaces and within ferromagnetic layers', 'Thermal expansion of the copper spacer', 'Piezoelectric contraction of the substrate', 'Dielectric breakdown of the oxide barrier'], correctIndex: 0, explanation: 'Electrons whose spin aligns with the layer magnetization scatter weakly, while antiparallel spin electrons scatter strongly. When both layers are parallel, one spin channel acts as a low-resistance highway.' },
      { id: 'q2', type: 'concept', question: 'In a GMR spin-valve, how is the magnetization of the "pinned" ferromagnetic layer held fixed?', options: ['Through exchange anisotropy coupling with an adjacent antiferromagnetic layer (e.g. IrMn)', 'By a permanent superglue bond', 'By passing 1000 Amperes through it continuously', 'It is physically screwed into the silicon substrate'], correctIndex: 0, explanation: 'Exchange bias across the interface with an antiferromagnetic pinning layer pins the reference layer, leaving only the free layer to rotate in response to external data bits.' },
      { id: 'q3', type: 'prediction', question: 'If a GMR sensor has low resistance R_P = 20 Ω in the parallel state and R_AP = 23 Ω in the antiparallel state, what is its GMR ratio?', options: ['15%', '3%', '30%', '1.15%'], correctIndex: 0, explanation: 'GMR ratio = (R_AP - R_P) / R_P = (23 - 20) / 20 = 3 / 20 = 0.15 = 15%.' },
      { id: 'q4', type: 'interpretation', question: 'In standard magnetic stripe card encoding (F2F / Aiken Biphase), how does the read head distinguish a binary 0 from a binary 1?', options: ['A binary 0 has one transition per bit interval; a binary 1 has two transitions (an additional transition at mid-bit)', 'Binary 1 is twice as wide as binary 0', 'Binary 0 has zero magnetic field while binary 1 has positive field', 'Binary 1 uses higher radio frequency modulation'], correctIndex: 0, explanation: 'Two-Frequency Coherent Phase (F2F) encodes binary 0 with only clock transitions at bit cell boundaries, while binary 1 contains an extra transition in the center of the bit cell.' },
      { id: 'q5', type: 'concept', question: 'Why was the discovery of Giant Magnetoresistance awarded the Nobel Prize in Physics in 2007 to Albert Fert and Peter Grünberg?', options: ['It revolutionized magnetic hard drive read heads, enabling a massive 1000-fold increase in digital storage density', 'It created the first optical telescope', 'It proved Einstein theory of general relativity', 'It discovered the neutron'], correctIndex: 0, explanation: 'GMR read heads dramatically increased magnetic reading sensitivity, enabling hard drive areal densities to jump from gigabytes to terabytes.' },
    ],
    defaultParams: { mode: 'gmr-sensor', sensorAngle: 0, swipeSpeed: 25, syntheticTrack: '4111222233334444' },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — NANODEVICES (Simulations 9–12)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'u25rphu02-quantum-confinement',
    unit: 3,
    unitTitle: 'Nanodevices',
    topic: 'Quantum confinement; quantum wells, wires and dots; energy levels',
    title: '3D Quantum Confinement: Well, Wire and Dot Builder',
    icon: '🧊',
    shortDescription: 'Interactive 3D nanostructure geometry resizer illustrating dimensional confinement from 3D Bulk to 2D Well, 1D Wire, and 0D Dot.',
    learningObjectives: [
      'Compare quantum confinement along 0, 1, 2, and 3 spatial dimensions against the de Broglie wavelength',
      'Calculate quantized energy eigenvalues E_{nx,ny,nz} in 3D infinite and finite potential boxes',
      'Analyze the Density of States (DOS) profile transition: 3D parabolic (√E) → 2D staircase → 1D spikes (1/√E) → 0D discrete delta functions',
    ],
    prerequisites: ['1D particle in a box', 'de Broglie wavelength λ = h/p', 'Density of states concept'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'E_{n_x, n_y, n_z} = \\frac{\\pi^2 \\hbar^2}{2 m^*} \\left(\\frac{n_x^2}{L_x^2} + \\frac{n_y^2}{L_y^2} + \\frac{n_z^2}{L_z^2}\\right), \\quad DOS_{3D} \\propto \\sqrt{E}, \\quad DOS_{2D} = \\text{step}, \\quad DOS_{0D} = \\sum \\delta(E - E_n)',
    modelAssumptions: [
      'Effective mass approximation with parabolic conduction band dispersion',
      'Infinite rectangular potential well boundaries for analytical energy eigenfunctions',
      'Non-interacting single-particle electron envelope wavefunctions',
    ],
    guidedSteps: [
      { title: 'Bulk 3D Material', description: 'Observe the macroscopic 3D semiconductor where dimensions exceed the electron de Broglie wavelength (continuous bands).', highlightControl: 'structureType' },
      { title: 'Quantum Well (2D)', description: 'Shrink thickness Lz below 10 nm while leaving Lx, Ly macroscopic; observe quantized 2D subbands and staircase DOS.', highlightControl: 'lz' },
      { title: 'Quantum Wire (1D)', description: 'Shrink Ly and Lz below 10 nm; electrons are free only along Lx, producing 1D van Hove singularities in DOS.', highlightControl: 'ly' },
      { title: 'Quantum Dot (0D)', description: 'Shrink all three dimensions Lx, Ly, Lz < 10 nm; confinement in all directions creates discrete, atomic-like energy levels.', highlightControl: 'lx' },
    ],
    challenges: [
      { id: 'c1', title: 'Observe Energy Level Spacing vs Size', goal: 'Shrink quantum well thickness Lz from 15 nm to 3 nm and observe energy level spacing ΔE.', hint: 'Level spacing scales inversely with the square of thickness: E ∝ 1/L².', successCondition: 'Level separation quadruples as thickness halves.' },
      { id: 'c2', title: 'Compare DOS for 2D Well vs 0D Dot', goal: 'Contrast the continuous step-like density of states of a quantum well with the discrete delta peaks of a quantum dot.', hint: '0D quantum dots are known as "artificial atoms" because their DOS has zero continuous dispersion.', successCondition: 'Density of states profile correctly matched.' },
      { id: 'c3', title: 'Construct a 5 nm Cubical Quantum Dot', goal: 'Set Lx = Ly = Lz = 5 nm for GaAs (m* = 0.067 m₀) and calculate ground state energy E₁,₁,₁.', hint: 'E₁,₁,₁ = 3 · π²ℏ² / (2 m* L²).', successCondition: 'Ground state energy verified in meV.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the physical condition for quantum confinement to emerge in a semiconductor nanostructure?', options: ['At least one physical dimension of the structure becomes comparable to or smaller than the de Broglie wavelength of the charge carriers', 'The temperature must reach absolute zero', 'The material must be magnetized', 'The structure must contain zero atoms'], correctIndex: 0, explanation: 'When a dimension L approaches the electron de Broglie wavelength λ_B = h/p (or exciton Bohr radius a_B), wave nature dominates and continuous energy bands split into discrete subbands.' },
      { id: 'q2', type: 'interpretation', question: 'How many spatial dimensions are free (unconfined) for an electron in a Quantum Wire?', options: ['1 dimension (free to move along the wire length)', '2 dimensions', '0 dimensions', '3 dimensions'], correctIndex: 0, explanation: 'A quantum wire confines carriers in 2 directions (y and z), leaving exactly 1 spatial direction (x) unconfined for free carrier transport.' },
      { id: 'q3', type: 'prediction', question: 'How does the ground state energy E₁ of an electron in a 1D quantum well change if the well width L is halved from 10 nm to 5 nm?', options: ['It quadruples (increases by 4x)', 'It doubles (increases by 2x)', 'It halves', 'It drops to zero'], correctIndex: 0, explanation: 'E_n = n² π² ℏ² / (2 m* L²). Because E ∝ 1/L², halving L increases energy by (1 / 0.5)² = 4 times.' },
      { id: 'q4', type: 'concept', question: 'Why are 0D Quantum Dots often referred to as "artificial atoms"?', options: ['Because confinement in all 3 spatial directions produces purely discrete, atom-like energy levels with delta-function DOS', 'Because they are made of synthetic plastic atoms', 'Because they emit visible smoke', 'Because they have zero mass'], correctIndex: 0, explanation: 'Confined in all 3 dimensions, quantum dots lack continuous band dispersion; their electronic states are discrete lines governed by quantum numbers, exactly like atomic orbitals.' },
      { id: 'q5', type: 'concept', question: 'What is the characteristic mathematical shape of the Density of States (DOS) function for a 2D Quantum Well?', options: ['A staircase of discrete constant steps (Heaviside step functions)', 'A smooth parabola proportional to √E', 'A line of isolated delta spikes', 'A hyperbola proportional to 1/E²'], correctIndex: 0, explanation: 'For a 2D electron gas, DOS for each subband is constant: m* / (πℏ²), producing a cumulative staircase shape as energy crosses subband edges.' },
    ],
    defaultParams: { structureType: 'well', lx: 20, ly: 20, lz: 6 },
  },
  {
    id: 'u25rphu02-nano-bandgap',
    unit: 3,
    unitTitle: 'Nanodevices',
    topic: 'Band gap and size-dependent nanoscale behaviour',
    title: '3D Band-Gap and Nanomaterial Explorer',
    icon: '🔬',
    shortDescription: 'Nanoparticle bandgap widening visualizer utilizing the Brus equation with observable size-dependent photoluminescence color shifts.',
    learningObjectives: [
      'Apply the Brus equation to model effective bandgap widening in semiconductor quantum dots',
      'Relate nanocrystal radius R to optical absorption edge and photoluminescence emission color',
      'Explain how Coulomb electron-hole attraction modulates the quantum confinement energy shift',
    ],
    prerequisites: ['Semiconductor bandgap Eg', 'Quantum confinement', 'Photon wavelength λ = hc/E'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'E_g(R) = E_{g,bulk} + \\frac{h^2}{8 R^2} \\left(\\frac{1}{m_e^*} + \\frac{1}{m_h^*}\\right) - \\frac{1.8 q^2}{4\\pi\\varepsilon_0 \\varepsilon_r R}, \\quad \\lambda_{emit} = \\frac{hc}{E_g(R)}',
    modelAssumptions: [
      'Effective mass approximation for spherical semiconductor nanocrystals (Brus formula)',
      'Lowest-order 1S(e)-1S(h) ground state optical transition',
      'Dielectric screening with bulk relative permittivity ε_r',
    ],
    guidedSteps: [
      { title: 'Nanocrystal Size Slider', description: 'Observe the 3D colloidal quantum dot cluster illuminated under ultraviolet excitation.', highlightControl: 'particleRadius' },
      { title: 'Conduction & Valence Band Gaps', description: 'Watch the energy band diagram: as particle diameter shrinks, the effective bandgap Eg(R) widens.', highlightControl: 'particleRadius' },
      { title: 'Color Spectrum Shift (Blue Shift)', description: 'Notice emitted light shifting from Red (large particles ~6 nm) to Green (~3.5 nm) to Blue (~2 nm).', highlightControl: 'particleRadius' },
      { title: 'Material Selection', description: 'Switch between Cadmium Selenide (CdSe), Lead Sulfide (PbS), and Indium Phosphide (InP) to explore bulk offsets.', highlightControl: 'material' },
    ],
    challenges: [
      { id: 'c1', title: 'Tune CdSe Quantum Dot to Emit Green Light', goal: 'Adjust particle diameter until the emission wavelength reaches pure green (~530 nm).', hint: 'Green light corresponds to photon energy E ≈ 2.34 eV; set diameter near 3.2 nm.', successCondition: 'Emission wavelength tuned within 525–535 nm.' },
      { id: 'c2', title: 'Quantify Confinement Energy Shift ΔEg', goal: 'Measure the difference between bulk bandgap Eg,bulk (1.74 eV for CdSe) and effective nanocrystal bandgap at 2.5 nm diameter.', hint: 'ΔEg = Eg(R) - Eg,bulk.', successCondition: 'Confinement shift > 0.5 eV recorded.' },
      { id: 'c3', title: 'Compare PbS (IR) vs CdSe (Visible)', goal: 'Compare Lead Sulfide (PbS, bulk Eg = 0.41 eV) with CdSe and explain why PbS quantum dots operate in the near-infrared telecommunication window.', hint: 'PbS is ideal for infrared photodetectors and telecommunication lasers.', successCondition: 'Infrared vs visible range contrasted.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'When a semiconductor nanocrystal is shrunk in size, why does its effective bandgap Eg increase (blue-shifting its emission)?', options: ['Quantum confinement forces wavefunctions into a tighter space, raising kinetic zero-point energy inversely with R²', 'The material gets colder', 'Atoms are stripped of their protons', 'The crystal structure melts'], correctIndex: 0, explanation: 'The confinement kinetic energy term scales as 1/R²: restricting carrier wavefunctions to a smaller radius pushes the conduction state up and valence state down, widening the gap.' },
      { id: 'q2', type: 'prediction', question: 'A solution of CdSe quantum dots with diameter 6 nm glows bright red under UV light. What color will a solution of 2 nm CdSe quantum dots emit?', options: ['Blue (shorter wavelength / higher photon energy)', 'Infrared (longer wavelength)', 'Dark Red', 'Black (no emission at all)'], correctIndex: 0, explanation: 'Smaller quantum dots have a larger bandgap, emitting higher-energy, shorter-wavelength photons (blue shift: Red → Orange → Yellow → Green → Blue).' },
      { id: 'q3', type: 'interpretation', question: 'In the Brus equation, what does the negative term proportional to -1/R represent physically?', options: ['The attractive Coulomb interaction between the electron and hole within the exciton', 'Thermal phonon scattering', 'Radiation damping', 'Relativistic mass correction'], correctIndex: 0, explanation: 'The term -1.8 e² / (4πε R) accounts for electrostatic Coulomb attraction between the electron and hole, slightly lowering the exciton transition energy.' },
      { id: 'q4', type: 'concept', question: 'Which parameter determines the threshold radius below which strong quantum confinement effects become pronounced in a semiconductor?', options: ['Exciton Bohr radius a_B = ε_r (m₀ / μ) a₀', 'The lattice constant of diamond', 'The speed of sound in the crystal', 'The atomic number of silicon'], correctIndex: 0, explanation: 'When nanocrystal radius R < a_B (where a_B is the bulk exciton Bohr radius), the electron and hole are individually quantized in the strong confinement regime.' },
      { id: 'q5', type: 'prediction', question: 'If a quantum dot emits photons at wavelength λ = 496 nm, what is its effective bandgap energy?', options: ['2.50 eV', '1.12 eV', '0.50 eV', '4.96 eV'], correctIndex: 0, explanation: 'E = hc / λ = 1240 eV·nm / 496 nm = 2.50 eV.' },
    ],
    defaultParams: { material: 'CdSe', particleDiameter: 4.0 },
  },
  {
    id: 'u25rphu02-tunnelling',
    unit: 3,
    unitTitle: 'Nanodevices',
    topic: 'Quantum tunnelling',
    title: '3D Quantum Tunnelling Barrier Lab',
    icon: '🌊',
    shortDescription: 'Wave-packet dynamics simulation approaching a potential barrier, with incident, reflected, and transmitted probability amplitudes.',
    learningObjectives: [
      'Contrast classical particle reflection with quantum mechanical barrier penetration and tunnelling',
      'Calculate transmission probability T using the deterministic barrier attenuation factor T ≈ exp(-2κa)',
      'Analyze the exponential sensitivity of tunnelling current to barrier width a and barrier height V₀',
    ],
    prerequisites: ['Schrödinger wave equation', 'Wave-particle duality', 'Potential energy barriers'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'T = \\frac{1}{1 + \\frac{V_0^2 \\sinh^2(\\kappa a)}{4 E (V_0 - E)}}, \\quad \\kappa = \\frac{\\sqrt{2m^*(V_0 - E)}}{\\hbar}, \\quad T \\approx 16\\frac{E}{V_0}\\left(1 - \\frac{E}{V_0}\\right)e^{-2\\kappa a}',
    modelAssumptions: [
      '1D time-dependent Schrödinger wave-packet evolution using split-operator FFT',
      'Rectangular potential energy barrier profile of height V₀ and thickness a',
      'Non-relativistic electron effective mass m* = m₀',
    ],
    guidedSteps: [
      { title: 'Potential Barrier Landscape', description: 'Observe the 3D potential energy barrier wall of height V₀ and thickness a.', highlightControl: 'barrierHeight' },
      { title: 'Incident Quantum Wavepacket', description: 'Launch a Gaussian wave packet with particle energy E strictly less than barrier height (E < V₀).', highlightControl: 'particleEnergy' },
      { title: 'Evanescent Decay & Transmission', description: 'Watch the wave function penetrate inside the barrier with exponential decay exp(-κx) and emerge as a transmitted wave.', highlightControl: 'barrierWidth' },
      { title: 'Transmission vs Thickness Graph', description: 'Inspect the real-time T vs a curve showing exponential sensitivity to nanometer barrier thickness.', highlightControl: 'barrierWidth' },
    ],
    challenges: [
      { id: 'c1', title: 'Demonstrate Classical vs Quantum Difference', goal: 'Set E = 3 eV and V₀ = 5 eV; confirm that classically T=0, whereas quantum mechanically T > 0.', hint: 'In classical physics, a particle with E < V₀ is 100% reflected with zero transmission.', successCondition: 'Quantum tunnelling probability T > 0 verified.' },
      { id: 'c2', title: 'Observe Exponential Thickness Sensitivity', goal: 'Double barrier width from 0.5 nm to 1.0 nm and note the orders-of-magnitude plunge in transmission T.', hint: 'Tunnelling current drops exponentially by ~10x for every 0.1 nm increase in barrier width.', successCondition: 'Exponential decay verified.' },
      { id: 'c3', title: 'Reach Resonant Transmission (E > V₀)', goal: 'Increase particle energy above barrier height (E > V₀) and find transmission resonance where T = 1.0.', hint: 'Resonances occur when barrier width matches integer multiples of half-wavelengths: a = n λ/2.', successCondition: 'Resonant unity transmission confirmed.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'According to classical mechanics, what is the probability of a particle with kinetic energy E = 2 eV overcoming a potential barrier of height V₀ = 5 eV?', options: ['0% (strictly zero transmission; 100% reflected)', '40%', '100%', '50%'], correctIndex: 0, explanation: 'Classically, a particle cannot enter a region where potential energy exceeds total energy (kinetic energy would be negative), so transmission is strictly impossible.' },
      { id: 'q2', type: 'concept', question: 'What mathematical form describes the electron wavefunction inside a rectangular potential barrier when E < V₀?', options: ['An exponentially decaying evanescent wave ψ(x) ∝ e^{-κ x}', 'A growing sinusoidal oscillation', 'A delta function spike', 'A constant zero function everywhere'], correctIndex: 0, explanation: 'Inside the barrier where V₀ > E, the wave vector κ is real, leading to exponential damping ψ(x) = C e^{-κx} + D e^{+κx}.' },
      { id: 'q3', type: 'prediction', question: 'Why is the tunnelling current in a Scanning Tunnelling Microscope (STM) so exquisitely sensitive to sub-angstrom changes in tip-to-sample distance?', options: ['Because tunnelling probability T decreases exponentially with distance a (T ∝ e^{-2κ a})', 'Because the tip magnetically attracts atoms', 'Because the tip gets hot', 'Because of acoustic resonance'], correctIndex: 0, explanation: 'The exponential dependence T ∝ e^{-2κa} causes current to change by an order of magnitude for every 0.1 nm change in gap distance, enabling sub-atomic height resolution.' },
      { id: 'q4', type: 'prediction', question: 'If barrier attenuation factor κ = 10 nm⁻¹ and barrier width a = 0.5 nm, the exponential decay factor e^{-2κa} is approximately:', options: ['e^{-10} ≈ 4.5 × 10⁻⁵', 'e^{-1} ≈ 0.37', '1.0', '100'], correctIndex: 0, explanation: '2κa = 2 · 10 nm⁻¹ · 0.5 nm = 10. e^{-10} ≈ 4.54 × 10⁻⁵.' },
      { id: 'q5', type: 'concept', question: 'Which modern electronic memory technology directly utilizes quantum mechanical Fowler-Nordheim tunnelling to write and erase data?', options: ['NAND Flash memory (floating-gate and charge-trap transistors)', 'Magnetic core memory', 'Optical DVD-RAM', 'Punch tape'], correctIndex: 0, explanation: 'NAND Flash memory tunnels electrons across a thin oxide barrier (~8 nm SiO₂) into a floating gate or silicon nitride trap layer using high electric field quantum tunnelling.' },
    ],
    defaultParams: { particleEnergy: 3.0, barrierHeight: 5.0, barrierWidth: 0.8 },
  },
  {
    id: 'u25rphu02-set-rtd',
    unit: 3,
    unitTitle: 'Nanodevices',
    topic: 'Coulomb blockade; single-electron transistor (SET); resonant tunnelling diode (RTD)',
    title: '3D SET, Coulomb Blockade and Resonant Tunnelling Explorer',
    icon: '⚡',
    shortDescription: 'Dual-mode nanoscale device bench exploring single-electron Coulomb blockade diamonds and double-barrier RTD resonant energy alignment.',
    learningObjectives: [
      'Explain the charging energy requirement E_C = e² / (2C_Σ) >> k_B T for Coulomb blockade in quantum dots',
      'Observe periodic Coulomb oscillations in Single-Electron Transistor (SET) drain current versus gate voltage V_g',
      'Analyze resonant tunneling, quantum state alignment, and Negative Differential Resistance (NDR) in double-barrier RTDs',
    ],
    prerequisites: ['Capacitance energy E = Q²/2C', 'Quantum tunneling', 'Heterostructures'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'E_C = \\frac{e^2}{2 C_\\Sigma}, \\quad V_{blockade} = \\frac{e}{2 C_\\Sigma}, \\quad I_{SET} \\propto \\sum \\delta(V_g - V_{peak}), \\quad \\text{RTD: } E_F = E_1 \\implies \\text{Peak } I',
    modelAssumptions: [
      'Orthodox theory of single-electron tunneling with discrete charge states',
      'Double-barrier resonant tunneling diode with finite coherent subband lifetime',
      'Temperature thermal smearing modeled via Fermi-Dirac distribution convolution',
    ],
    guidedSteps: [
      { title: 'Device Mode Selection', description: 'Switch between Mode A (Single-Electron Transistor SET) and Mode B (Resonant Tunnelling Diode RTD).', highlightControl: 'deviceMode' },
      { title: 'SET Nanoscale Island & Blockade', description: 'In SET mode, observe the central quantum dot island. At low bias, adding one electron costs charging energy E_C, blocking current.', highlightControl: 'gateVoltage' },
      { title: 'Coulomb Oscillations via Gate Voltage', description: 'Sweep gate voltage V_g; every time the gate induces a half-integer charge, Coulomb blockade lifts, creating a current peak.', highlightControl: 'gateVoltage' },
      { title: 'RTD Negative Differential Resistance', description: 'In RTD mode, sweep bias voltage V_ds; observe peak current when Fermi level aligns with well state E₁, followed by an NDR drop.', highlightControl: 'biasVoltage' },
    ],
    challenges: [
      { id: 'c1', title: 'Identify Coulomb Blockade Diamond Region', goal: 'In SET mode, find the voltage window around zero bias where drain current is strictly blocked at T = 4 K.', hint: 'Blockade condition: |V_ds| < e / (2 C_Σ).', successCondition: 'Zero-current blockade diamond verified.' },
      { id: 'c2', title: 'Locate Resonant Peak in RTD I-V Curve', goal: 'Sweep RTD bias to locate the peak current voltage V_peak, then observe current drop as bias increases (NDR region).', hint: 'In the NDR region, dI/dV < 0 because the incident electrons drop out of resonance with E₁.', successCondition: 'Peak and valley currents logged, peak-to-valley ratio calculated.' },
      { id: 'c3', title: 'Evaluate Temperature Breakdown of Blockade', goal: 'Raise temperature from 4 K to 300 K and explain why room temperature thermal energy (k_B T ≈ 26 meV) washes out the blockade.', hint: 'If k_B T > E_C, thermal fluctuations overcome the charging barrier.', successCondition: 'Thermal smearing effect analyzed.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What condition must be satisfied for Coulomb blockade to occur on a nanoscale island?', options: ['Charging energy exceeds thermal energy (E_C = e²/2C_Σ >> k_B T) and tunnel resistance exceeds quantum resistance (R_T >> h/e²)', 'The island must be made of pure copper at 1000 K', 'The gate voltage must be infinite', 'The capacitance C_Σ must be very large (microfarads)'], correctIndex: 0, explanation: 'To prevent thermal fluctuations from randomly adding electrons and to prevent quantum wavefunctions from delocalizing, E_C >> k_B T and R_T >> h/e² (≈ 25.8 kΩ) are required.' },
      { id: 'q2', type: 'concept', question: 'What causes the periodic current peaks (Coulomb oscillations) as gate voltage V_g is swept in a Single-Electron Transistor?', options: ['The gate electrostatically shifts island energy so states with N and N+1 electrons become degenerate, lifting the blockade', 'The gate melts the tunnel barriers periodically', 'Photons are emitted at regular intervals', 'The mechanical distance between electrodes oscillates'], correctIndex: 0, explanation: 'Whenever C_g V_g = (n + 1/2)e, the energy difference between having n and n+1 electrons on the island is zero, enabling single electrons to tunnel across freely.' },
      { id: 'q3', type: 'interpretation', question: 'In a Resonant Tunnelling Diode (RTD), what causes Negative Differential Resistance (NDR, where current decreases as voltage increases)?', options: ['The conduction band of the emitter drops below the discrete resonant energy level E₁ of the quantum well, destroying resonance', 'The diode burns out', 'The semiconductor bandgap drops to zero', 'Ohm law reverses sign for electrons'], correctIndex: 0, explanation: 'Current peaks when the incident emitter Fermi level aligns with the quantized state E₁ in the well. Increasing voltage further pulls E₁ below the emitter states, cutting off resonant transmission.' },
      { id: 'q4', type: 'prediction', question: 'If a quantum dot has a total capacitance C_Σ = 1 aF (10⁻¹⁸ F), what is its single-electron charging energy E_C?', options: ['80 meV (well above room-temperature thermal energy 26 meV)', '0.001 meV', '10 keV', '1.6 V'], correctIndex: 0, explanation: 'E_C = e² / (2 C_Σ) = (1.6×10⁻¹⁹)² / (2 · 10⁻¹⁸) = 1.28×10⁻²⁰ J ≈ 80 meV. Since 80 meV > 26 meV, room temperature blockade is possible.' },
      { id: 'q5', type: 'concept', question: 'Why are RTDs useful in ultra-high frequency oscillators and digital logic circuits?', options: ['The N-shaped I-V curve with Negative Differential Resistance enables high-speed multi-gigahertz oscillation and bistable memory', 'They generate zero heat', 'They can store terabytes of data like a hard drive', 'They require no power source'], correctIndex: 0, explanation: 'NDR provides dynamic negative resistance that cancels circuit damping, allowing RTDs to oscillate at terahertz frequencies (THz) and serve as ultra-fast bistable logic switches.' },
    ],
    defaultParams: { deviceMode: 'SET', gateVoltage: 0.25, biasVoltage: 0.05, temperature: 4.2 },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — QUANTUM COMPUTING (Simulations 13–16)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'u25rphu02-bloch-sphere',
    unit: 4,
    unitTitle: 'Quantum Computing',
    topic: 'Qubit; classical versus quantum computing; Bloch sphere',
    title: '3D Qubit and Bloch Sphere Explorer',
    icon: '🌐',
    shortDescription: 'Interactive 3D unit Bloch sphere with draggable state vector arrow, spherical coordinates (θ, φ), and real-time measurement probabilities.',
    learningObjectives: [
      'Represent pure single-qubit quantum states on the 3D unit Bloch sphere: |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ}sin(θ/2)|1⟩',
      'Map polar angle θ to computational basis probabilities P(0) = cos²(θ/2) and P(1) = sin²(θ/2)',
      'Analyze the role of quantum phase factor e^{iφ} around the equator and locate key cardinal states (|0⟩, |1⟩, |+⟩, |-⟩, |+i⟩, |-i⟩)',
    ],
    prerequisites: ['Complex numbers & Euler formula', 'Dirac bra-ket notation', 'Spherical coordinates'],
    estimatedTimeMinutes: 15,
    formulaOverview: '|\\psi\\rangle = \\cos(\\theta/2)|0\\rangle + e^{i\\phi}\\sin(\\theta/2)|1\\rangle, \\quad P(0) = \\cos^2(\\theta/2), \\quad P(1) = \\sin^2(\\theta/2), \\quad \\vec{r} = (\\sin\\theta\\cos\\phi, \\sin\\theta\\sin\\phi, \\cos\\theta)',
    modelAssumptions: [
      'Pure single-qubit state space represented on the surface of the S² Bloch sphere (|r| = 1)',
      'Global phase factor e^{iγ} is factored out because it does not affect physical observables',
      'Standard computational basis {|0⟩, |1⟩} aligned along the ±Z axis',
    ],
    guidedSteps: [
      { title: 'The Bloch Sphere Geometry', description: 'Explore the 3D sphere: North Pole is |0⟩, South Pole is |1⟩, and Equator contains equal superpositions.', highlightControl: 'theta' },
      { title: 'Polar Angle θ & Probability', description: 'Adjust θ from 0 to π; notice how polar angle controls the relative probabilities P(0) and P(1).', highlightControl: 'theta' },
      { title: 'Azimuthal Angle φ & Quantum Phase', description: 'Set θ = π/2 (equator) and rotate φ from 0 to 2π to shift phase between |+⟩ (φ=0) and |+i⟩ (φ=π/2).', highlightControl: 'phi' },
      { title: 'Measurement Projection', description: 'Observe the probability dials showing Born rule measurement outcomes in the computational basis.', highlightControl: 'preset' },
    ],
    challenges: [
      { id: 'c1', title: 'Prepare the Equal Superposition |+⟩ State', goal: 'Set coordinates to θ = π/2 (90°) and φ = 0° to place the state vector on the +X axis.', hint: 'In the |+⟩ state, P(0) = 50% and P(1) = 50%.', successCondition: 'State matches |+⟩ within ±1°.' },
      { id: 'c2', title: 'Predict Probabilities at θ = 60°', goal: 'Set θ = 60° (π/3) and verify that P(0) = cos²(30°) = 0.75 (75%) and P(1) = sin²(30°) = 0.25 (25%).', hint: 'Remember the half-angle in the state definition: cos(θ/2).', successCondition: 'Probabilities verified: P(0)=0.75, P(1)=0.25.' },
      { id: 'c3', title: 'Prepare Imaginary State |+i⟩', goal: 'Set θ = 90° and φ = 90° (π/2) on the +Y axis; observe state vector (|0⟩ + i|1⟩)/√2.', hint: 'State |+i⟩ has an imaginary phase factor i on |1⟩.', successCondition: '|+i⟩ state reached successfully.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'On the standard Bloch sphere convention, what quantum state is represented at the South Pole (-Z axis)?', options: ['The computational basis state |1⟩', 'The computational basis state |0⟩', 'The superposition state |+⟩', 'The maximally mixed state'], correctIndex: 0, explanation: 'By definition, θ = π gives cos(π/2) = 0 and sin(π/2) = 1, so |ψ⟩ = |1⟩, located at the South Pole.' },
      { id: 'q2', type: 'prediction', question: 'If a qubit state vector lies on the equator of the Bloch sphere (θ = π/2), what is the probability of measuring |0⟩ in the computational basis?', options: ['0.50 (50%) regardless of the azimuthal angle φ', '1.00 (100%)', '0.00 (0%)', 'It depends directly on φ'], correctIndex: 0, explanation: 'P(0) = cos²(θ/2) = cos²(π/4) = (1/√2)² = 0.50 (50%). The azimuthal angle φ represents relative phase, not Z-basis probability.' },
      { id: 'q3', type: 'interpretation', question: 'Why does the Bloch sphere use half-angles (θ/2) in the state definition |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ}sin(θ/2)|1⟩?', options: ['Because orthogonal quantum states (|0⟩ and |1⟩) are separated by 180° (antipodal points) on the sphere', 'Because quantum computers run at half-speed', 'Due to electron mass doubling', 'It is an arbitrary historical mistake'], correctIndex: 0, explanation: 'In Hilbert space, |0⟩ and |1⟩ are orthogonal (90° apart), but to represent all pure states on a 2-sphere S², orthogonal states must map to antipodal poles (180° apart).' },
      { id: 'q4', type: 'concept', question: 'Can the interior points of the Bloch sphere (|r| < 1) represent quantum states?', options: ['Yes, points inside the Bloch sphere represent mixed states (statistical ensembles of pure states)', 'No, points inside the sphere do not exist physically', 'Only points with negative radius are allowed', 'Interior points represent classical bits only'], correctIndex: 0, explanation: 'Pure states lie strictly on the surface (|r| = 1). Mixed states described by density matrices ρ have Bloch vector length |r| < 1, with the origin r = 0 representing the maximally mixed state.' },
      { id: 'q5', type: 'prediction', question: 'For a qubit in state |ψ⟩ = (√3/2)|0⟩ + (1/2)|1⟩, what are the measurement probabilities P(0) and P(1)?', options: ['P(0) = 75%, P(1) = 25%', 'P(0) = 50%, P(1) = 50%', 'P(0) = 86.6%, P(1) = 50%', 'P(0) = 100%, P(1) = 0%'], correctIndex: 0, explanation: 'P(0) = |√3/2|² = 3/4 = 75%, and P(1) = |1/2|² = 1/4 = 25%.' },
    ],
    defaultParams: { theta: 90, phi: 0, preset: 'plus' },
  },
  {
    id: 'u25rphu02-superposition-measurement',
    unit: 4,
    unitTitle: 'Quantum Computing',
    topic: 'Qubit; measurement; single-qubit systems',
    title: '3D Quantum Superposition and Measurement Lab',
    icon: '🎯',
    shortDescription: 'Measurement apparatus linked to 3D Bloch sphere illustrating wave function collapse, basis rotation (Z, X, Y), and shot statistics.',
    learningObjectives: [
      'Understand the Born rule and irreversible wave function collapse upon quantum measurement',
      'Demonstrate measurement in incompatible bases: computational Z basis, diagonal X basis, and circular Y basis',
      'Verify the law of large numbers by comparing empirical shot frequencies with theoretical probabilities',
    ],
    prerequisites: ['Born rule P(x) = |⟨x|ψ⟩|²', 'Bloch sphere geometry', 'Hermitian observables'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'P(m_i) = |\\langle m_i | \\psi \\rangle|^2, \\quad |\\psi\\rangle \\xrightarrow{\\text{measure}} |m_i\\rangle, \\quad \\sigma_z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}, \\quad \\sigma_x = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}',
    modelAssumptions: [
      'Ideal projective (von Neumann) measurements with instantaneous state projection',
      'Pseudo-random number generator with reproducible seed for deterministic testing',
      'Zero decoherence / environmental noise during state preparation and measurement',
    ],
    guidedSteps: [
      { title: 'State Preparation Station', description: 'Prepare a pure qubit state such as |+⟩ = (|0⟩ + |1⟩)/√2 on the 3D Bloch sphere.', highlightControl: 'statePreset' },
      { title: 'Measurement Basis Selector', description: 'Choose your measurement basis: Z-basis {|0⟩, |1⟩}, X-basis {|+⟩, |-⟩}, or Y-basis {|+i⟩, |-i⟩}.', highlightControl: 'basis' },
      { title: 'Single Shot & Wavefunction Collapse', description: 'Click "Fire Single Shot"; observe the state vector jump irreversibly to one of the measurement eigenstates!', highlightControl: 'singleShot' },
      { title: 'Repeated Shots (10 to 1000)', description: 'Run 1000 repeated shots to watch the histogram bar chart converge to the theoretical 50/50 probability.', highlightControl: 'shotCount' },
    ],
    challenges: [
      { id: 'c1', title: 'Measure |+⟩ in the X-Basis', goal: 'Prepare state |+⟩ and measure in the X-basis; observe that the outcome is 100% deterministic |+⟩ with zero randomness.', hint: 'When a state is an eigenstate of the measurement operator, measurement is deterministic.', successCondition: '100% |+⟩ outcome recorded across all shots.' },
      { id: 'c2', title: 'Demonstrate Basis Incompatibility', goal: 'Prepare |0⟩, measure in X-basis (get |+⟩ or |-⟩), then measure again in Z-basis; show that original |0⟩ state was destroyed.', hint: 'Measuring in X collapses the state, randomizing subsequent Z measurements.', successCondition: 'State collapse perturbation demonstrated.' },
      { id: 'c3', title: 'Verify Convergence of 1000 Shots', goal: 'Prepare state with θ = 60° (P(0) = 0.75) and verify empirical frequency after 1000 shots is within ±3% of 75%.', hint: 'Standard error scales as 1/√N.', successCondition: 'Statistical convergence confirmed.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What happens to a qubit in superposition (|0⟩ + |1⟩)/√2 when an ideal projective measurement is performed in the Z-basis?', options: ['The state randomly collapses to either |0⟩ or |1⟩ with 50% probability, and remains in that collapsed state', 'The state splits into two separate classical particles', 'The state remains in superposition permanently', 'The state is converted to heat'], correctIndex: 0, explanation: 'According to the projection postulate, measuring a quantum superposition collapses the wave function probabilistically to one of the measurement basis eigenstates.' },
      { id: 'q2', type: 'prediction', question: 'If a qubit is prepared in the state |0⟩ and measured in the X-basis {|+⟩, |-⟩}, what are the possible outcomes and their probabilities?', options: ['|+⟩ with 50% probability and |-⟩ with 50% probability', '|0⟩ with 100% probability', '|1⟩ with 100% probability', 'Outcome is impossible to measure'], correctIndex: 0, explanation: '|0⟩ = (|+⟩ + |-⟩)/√2. Measuring in the X-basis yields |+⟩ with probability |1/√2|² = 50% and |-⟩ with probability |1/√2|² = 50%.' },
      { id: 'q3', type: 'concept', question: 'Does an individual single measurement on one qubit reveal the exact continuous amplitudes α and β of its state |ψ⟩ = α|0⟩ + β|1⟩?', options: ['No, a single measurement yields only a single discrete bit (0 or 1); many repeated identical measurements are required to reconstruct probabilities', 'Yes, a modern quantum computer reads α and β directly in one shot', 'Yes, by measuring the voltage of the qubit', 'Only if the qubit is superconducting'], correctIndex: 0, explanation: 'Fundamental quantum limitation: one measurement returns only 1 bit of classical information (eigenvalue 0 or 1). Reconstructing the full state requires quantum state tomography across many identical copies.' },
      { id: 'q4', type: 'prediction', question: 'A qubit is prepared in state |ψ⟩ = 0.8|0⟩ + 0.6|1⟩. After 10,000 measurements in the computational basis, approximately how many times will outcome "0" be observed?', options: ['Approximately 6,400 times (64%)', 'Approximately 8,000 times (80%)', 'Approximately 5,000 times (50%)', 'Exactly 10,000 times'], correctIndex: 0, explanation: 'P(0) = |0.8|² = 0.64. In 10,000 trials, the expected number of 0s is 0.64 × 10,000 = 6,400.' },
      { id: 'q5', type: 'concept', question: 'What does the Heisenberg uncertainty principle imply when measuring a qubit consecutively in the non-commuting Z and X bases?', options: ['Precise knowledge of Z observable creates maximum uncertainty in X observable (and vice versa)', 'Both observables can be measured simultaneously with infinite precision', 'Neither observable can ever be known', 'Measurement results depend on the time of day'], correctIndex: 0, explanation: 'Because Pauli operators do not commute ([σ_z, σ_x] = 2i σ_y ≠ 0), measuring in one basis completely randomizes the outcome of a subsequent measurement in the complementary basis.' },
    ],
    defaultParams: { statePreset: 'plus', basis: 'Z', shotCount: 100, seed: 42 },
  },
  {
    id: 'u25rphu02-entanglement',
    unit: 4,
    unitTitle: 'Quantum Computing',
    topic: 'Two-qubit systems; foundational quantum correlations',
    title: '3D Two-Qubit and Entanglement Explorer',
    icon: '🔗',
    shortDescription: 'Linked two-qubit visualizer illustrating separable product states vs the 4 Bell states, joint probability densities, and non-local correlations.',
    learningObjectives: [
      'Distinguish separable two-qubit product states |ψ⟩ = |a⟩⊗|b⟩ from entangled states that cannot be factored',
      'Construct and analyze the four maximally entangled Bell states: |Φ⁺⟩, |Φ⁻⟩, |Ψ⁺⟩, |Ψ⁻⟩',
      'Demonstrate joint measurement correlations ⟨σ_z^{(1)} σ_z^{(2)}⟩ and understand why entanglement does not permit faster-than-light signaling',
    ],
    prerequisites: ['Tensor products A ⊗ B', 'Single-qubit states', 'Joint probability'],
    estimatedTimeMinutes: 15,
    formulaOverview: '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}, \\quad |\\Psi^+\\rangle = \\frac{|01\\rangle + |10\\rangle}{\\sqrt{2}}, \\quad \\langle \\sigma_z^{(1)} \\sigma_z^{(2)} \\rangle_{\\Phi^+} = +1, \\quad \\text{Concurrence } C \\in [0, 1]',
    modelAssumptions: [
      '4-dimensional composite Hilbert space H₄ = H₂ ⊗ H₂ with computational basis {|00⟩, |01⟩, |10⟩, |11⟩}',
      'Instantaneous projection of bipartite state upon local measurement on either subsystem',
      'No-communication theorem: reduced density matrix of qubit A is invariant under actions on qubit B',
    ],
    guidedSteps: [
      { title: 'Two-Qubit State Space', description: 'Observe the two 3D qubit nodes. Their joint state is described by 4 complex amplitudes: c₀₀, c₀₁, c₁₀, c₁₁.', highlightControl: 'bellState' },
      { title: 'Separable Product State', description: 'Select product state |00⟩ or |++⟩. Notice each qubit has an independent state and the correlation indicator is 0.', highlightControl: 'bellState' },
      { title: 'The Bell State |Φ⁺⟩', description: 'Switch to Bell state (|00⟩ + |11⟩)/√2; observe the glowing entanglement link. Measuring qubit 1 instantly fixes qubit 2!', highlightControl: 'bellState' },
      { title: 'Joint Measurement Statistics', description: 'Run correlated measurement shots; observe perfect correlation: outcomes are always 00 or 11, never 01 or 10.', highlightControl: 'measureJoint' },
    ],
    challenges: [
      { id: 'c1', title: 'Compare |Φ⁺⟩ and |Ψ⁺⟩ Bell States', goal: 'Compare |Φ⁺⟩ = (|00⟩+|11⟩)/√2 with |Ψ⁺⟩ = (|01⟩+|10⟩)/√2; identify correlated vs anti-correlated outcomes.', hint: '|Φ⁺⟩ yields identical outcomes (00, 11); |Ψ⁺⟩ yields opposite outcomes (01, 10).', successCondition: 'Correlation difference verified.' },
      { id: 'c2', title: 'Verify Non-Factorability of Bell State', goal: 'Prove that (|00⟩ + |11⟩)/√2 cannot be written as (a|0⟩ + b|1⟩) ⊗ (c|0⟩ + d|1⟩).', hint: 'If ac = 1/√2 and bd = 1/√2, then ad and bc cannot both be zero.', successCondition: 'Entanglement criteria mathematically verified.' },
      { id: 'c3', title: 'Demonstrate No-Signaling Theorem', goal: 'Measure qubit 1 only; observe that marginal probability on qubit 2 remains strictly 50/50 regardless of basis chosen for qubit 1.', hint: 'Quantum entanglement cannot transmit classical messages faster than light.', successCondition: 'No-signaling principle confirmed.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the defining mathematical property of an entangled two-qubit quantum state?', options: ['The state vector in H₂ ⊗ H₂ cannot be factored as a single tensor product |ψ_A⟩ ⊗ |ψ_B⟩ of individual qubit states', 'Both qubits must be physically touching in the same atom', 'The qubits must have identical electrical charges', 'The state contains zero probability amplitudes'], correctIndex: 0, explanation: 'An entangled state is by definition non-separable: it cannot be expressed as a product of individual states of its constituent subsystems.' },
      { id: 'q2', type: 'prediction', question: 'Two qubits are prepared in the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. If Qubit 1 is measured in the computational basis and found to be |1⟩, what is the state of Qubit 2?', options: ['It collapses with 100% certainty to |1⟩', 'It collapses to |0⟩', 'It remains in 50/50 superposition', 'It is randomly destroyed'], correctIndex: 0, explanation: 'Because |01⟩ has zero amplitude in |Φ⁺⟩, measuring |1⟩ on qubit 1 projects the joint state onto |11⟩, meaning qubit 2 is deterministically found in state |1⟩.' },
      { id: 'q3', type: 'concept', question: 'Can two distant observers use quantum entanglement to transmit an instantaneous classical message faster than the speed of light?', options: ['No, because local measurements yield purely random outcomes; without a classical communication channel to compare results, no message is transmitted (No-Signaling Theorem)', 'Yes, quantum computers communicate at infinite speed across the universe', 'Yes, but only over distances less than 1 kilometer', 'Only if the qubits are polarized photons'], correctIndex: 0, explanation: 'The No-Signaling Theorem guarantees that local operations on one qubit cannot alter the local reduced density matrix of the distant qubit; classical communication is always required to decode correlations.' },
      { id: 'q4', type: 'prediction', question: 'For the Bell state |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2 (the singlet state), what is the expectation value of joint Z measurements ⟨σ_z^{(1)} σ_z^{(2)}⟩?', options: ['-1 (perfect anti-correlation: outcomes are always opposite)', '+1 (perfect correlation)', '0 (completely uncorrelated)', '+0.5'], correctIndex: 0, explanation: 'In |Ψ⁻⟩, the only possible outcomes are 01 (eigenvalue +1 · -1 = -1) and 10 (eigenvalue -1 · +1 = -1), so the expectation value is strictly -1.' },
      { id: 'q5', type: 'interpretation', question: 'What is the dimension of the Hilbert space required to describe a general quantum system of n qubits?', options: ['2^n dimensions (exponential scaling with number of qubits)', '2n dimensions (linear scaling)', 'n² dimensions', 'n! dimensions'], correctIndex: 0, explanation: 'Each qubit doubles the state space: H_n = (C₂)^{⊗n}, requiring 2^n complex amplitudes, which is the foundational origin of quantum computational power.' },
    ],
    defaultParams: { stateType: 'phi-plus', basisQ1: 'Z', basisQ2: 'Z', shots: 200 },
  },
  {
    id: 'u25rphu02-classical-vs-quantum',
    unit: 4,
    unitTitle: 'Quantum Computing',
    topic: 'Introduction to quantum computing; Moore’s law and its limitations; classical versus quantum computing',
    title: '3D Quantum Computing versus Classical Computing Lab',
    icon: '💻',
    shortDescription: 'Architecture benchmark comparison contrasting classical binary registers vs quantum superpositions, Moore law limits, and algorithm scaling.',
    learningObjectives: [
      'Compare classical bit registers (1 state at a time) with quantum registers (2^n states in simultaneous superposition)',
      'Analyze the physical scaling limits of Moore’s Law: sub-3nm gate oxide tunneling, subthreshold leakage, and thermal power dissipation',
      'Evaluate computational complexity classes: P vs BQP, and examine task-specific quantum speedups (e.g. Grover O(√N), Shor polynomial)',
    ],
    prerequisites: ['Binary numbers', 'Big-O notation', 'Semiconductor CMOS scaling'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'N_{\\text{classical states}} = 1, \\quad N_{\\text{quantum amplitudes}} = 2^n, \\quad \\text{Grover: } O(\\sqrt{N}) \\text{ vs } O(N), \\quad P_{\\text{dynamic}} = C V^2 f',
    modelAssumptions: [
      'Idealized noiseless quantum algorithm speedup models (Grover, Shor, phase estimation)',
      'Classical CMOS transistor scaling limits based on ITRS semiconductor roadmap benchmarks',
      'Realistic distinction: quantum computers provide task-specific algorithmic advantages, not faster universal clock speeds',
    ],
    guidedSteps: [
      { title: 'Classical vs Quantum Register', description: 'Observe the classical 4-bit register (holding exactly 1 value, e.g. 1010) vs 4-qubit register holding all 16 states in superposition.', highlightControl: 'numBits' },
      { title: 'Exponential State Space Scaling', description: 'Increase bit/qubit count n from 4 to 64; notice 2⁶⁴ ≈ 1.84×10¹⁹ states—more than the RAM of all supercomputers combined!', highlightControl: 'numBits' },
      { title: 'Moore Law Physical Limits', description: 'Inspect the silicon CMOS transistor cutaway: at gate oxide < 1 nm, quantum tunnelling leakage causes chips to overheat.', highlightControl: 'showMooreLimits' },
      { title: 'Algorithmic Benchmark Comparison', description: 'Run the Unsorted Search benchmark: watch classical algorithm test O(N) entries while Grover algorithm succeeds in O(√N) steps.', highlightControl: 'algorithm' },
    ],
    challenges: [
      { id: 'c1', title: 'Compare State Capacity at n = 10', goal: 'Calculate how many classical integers can be represented simultaneously by 10 classical bits vs 10 qubits in superposition.', hint: 'Classical = 1; Quantum = 2¹⁰ = 1024 simultaneous amplitudes.', successCondition: 'State capacity ratio verified.' },
      { id: 'c2', title: 'Benchmark Unsorted Search Speedup', goal: 'Set database size N = 1,000,000 entries; compare classical search (500,000 average checks) with Grover search (~1,000 iterations).', hint: 'Grover speedup is quadratic: √1,000,000 = 1000.', successCondition: 'Quadratic speedup verified.' },
      { id: 'c3', title: 'Identify Moore Law Thermal Dissipation Limit', goal: 'Analyze why increasing clock frequency f beyond 5 GHz leads to thermal runaway in silicon CMOS.', hint: 'Dynamic power P = C V² f and static leakage from tunneling increase exponentially.', successCondition: 'Transistor physical scaling limits analyzed.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'Why does quantum computing not simply mean "a classical computer with a much faster clock speed"?', options: ['Quantum computers use fundamentally different principles (superposition, interference, entanglement) that change algorithmic complexity classes (BQP vs P)', 'Quantum computers have slower clock speeds than classical CPUs', 'Quantum computers only calculate addition', 'Quantum chips are made of wood'], correctIndex: 0, explanation: 'Quantum computers operate at relatively slow clock rates (megahertz), but their power comes from computational interference across 2^n states simultaneously, solving specific problems in fewer algorithmic steps.' },
      { id: 'q2', type: 'concept', question: 'What physical quantum phenomenon prevents classical silicon transistors from being scaled down indefinitely below ~1–2 nanometers?', options: ['Quantum mechanical tunnelling of electrons through the ultra-thin gate oxide dielectric and channel, causing massive leakage current', 'Spontaneous nuclear decay of silicon', 'Gravity causing the chip to implode', 'The speed of light dropping to zero'], correctIndex: 0, explanation: 'When gate oxides or channels become a few atoms thick (< 2 nm), electrons tunnel directly across the barrier, preventing the transistor from turning "OFF" and causing thermal runaway.' },
      { id: 'q3', type: 'prediction', question: 'For an unsorted database containing N = 100,000,000 items, approximately how many steps does Grover quantum search require compared to classical search?', options: ['~10,000 quantum steps (√N) versus ~50,000,000 classical steps (N/2)', '~1 step vs ~2 steps', 'Both require 100,000,000 steps', 'Grover algorithm requires 10¹⁶ steps'], correctIndex: 0, explanation: 'Grover algorithm provides a provable quadratic speedup: O(√N) = √100,000,000 = 10,000 operations, compared to classical linear search O(N).' },
      { id: 'q4', type: 'interpretation', question: 'How many simultaneous complex probability amplitudes are required to describe a general quantum state of 50 entangled qubits?', options: ['2⁵⁰ ≈ 1.125 × 10¹⁵ amplitudes (over one quadrillion numbers)', '50 amplitudes', '100 amplitudes', '50² = 2,500 amplitudes'], correctIndex: 0, explanation: 'An n-qubit quantum register spans a 2^n dimensional Hilbert space. For n = 50, 2⁵⁰ ≈ 1.125 × 10¹⁵ complex amplitudes are required, exceeding the RAM of typical classical supercomputers.' },
      { id: 'q5', type: 'concept', question: 'Is a quantum computer faster than a classical computer for every computational task (such as word processing or streaming video)?', options: ['No, quantum advantage is task-specific (factoring, quantum simulation, optimization); for everyday sequential tasks, classical computers are vastly more practical and efficient', 'Yes, quantum computers make all video games run 1000x faster', 'Yes, quantum computers replace all classical computers completely', 'No, quantum computers cannot perform arithmetic'], correctIndex: 0, explanation: 'Quantum advantage applies only to specific problem domains where quantum interference can cancel incorrect answers; for standard sequential logic, classical architectures are vastly superior.' },
    ],
    defaultParams: { numBits: 4, algorithm: 'search', showMooreLimits: false },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — QUANTUM CIRCUITS (Simulations 17–20)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'u25rphu02-pauli-gates',
    unit: 5,
    unitTitle: 'Quantum Circuits',
    topic: 'NOT and Pauli X, Y and Z gates',
    title: '3D Quantum Gate Explorer: X, Y and Z',
    icon: '🔄',
    shortDescription: 'Bloch sphere state vector rotation visualizer for single-qubit Pauli X, Y, and Z unitary transformations with matrix algebra.',
    learningObjectives: [
      'Apply single-qubit Pauli gates X, Y, and Z to quantum state vectors and observe Bloch sphere rotations',
      'Explain matrix representations and unitary properties: X² = Y² = Z² = I, {X,Y} = 0, and U†U = I',
      'Distinguish bit-flip (X), bit-and-phase-flip (Y), and phase-flip (Z) actions on computational basis states',
    ],
    prerequisites: ['Pauli matrices', 'Matrix multiplication', 'Bloch sphere geometry'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad Y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}, \\quad Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}, \\quad R_{\\hat{n}}(\\pi) = -i(\\hat{n}\\cdot\\vec{\\sigma})',
    modelAssumptions: [
      'Ideal unitary gate operations with zero gate error fidelity (F = 1.0)',
      'Continuous rotation trajectory on Bloch sphere: U(t) = exp(-i t π/2 σ)',
      'Standard basis conventions: X flips |0⟩ ↔ |1⟩; Z introduces relative phase -1 on |1⟩',
    ],
    guidedSteps: [
      { title: 'The Pauli X (NOT) Gate', description: 'Start at |0⟩ and apply the X gate; watch the state vector rotate 180° around the X-axis down to |1⟩.', highlightControl: 'gateX' },
      { title: 'The Pauli Z (Phase-Flip) Gate', description: 'Prepare |+⟩ = (|0⟩+|1⟩)/√2 and apply Z; watch the vector rotate 180° around the Z-axis to |-⟩ = (|0⟩-|1⟩)/√2.', highlightControl: 'gateZ' },
      { title: 'The Pauli Y Gate', description: 'Apply Y: Y combines a bit flip with a relative phase factor of i (Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩).', highlightControl: 'gateY' },
      { title: 'Gate Involutory Property (X² = I)', description: 'Apply any Pauli gate twice in succession; observe that applying X twice returns the state identically to its origin.', highlightControl: 'gateX' },
    ],
    challenges: [
      { id: 'c1', title: 'Transform |0⟩ to |-⟩ Using X and H', goal: 'Apply gate sequence to transform |0⟩ into |-⟩ = (|0⟩ - |1⟩)/√2.', hint: 'X|0⟩ = |1⟩, then H|1⟩ = |-⟩.', successCondition: 'State vector lands on -X axis.' },
      { id: 'c2', title: 'Verify Anti-Commutation XY = -YX', goal: 'Compare sequence X then Y against Y then X; prove that XY = iZ while YX = -iZ.', hint: 'Pauli gates anti-commute: XY + YX = 0.', successCondition: 'Anti-commutation phase verified.' },
      { id: 'c3', title: 'Demonstrate Involutory Identity Z² = I', goal: 'Apply Z twice to any arbitrary superposition state and verify that the output state is unchanged.', hint: 'Z² = I (the identity matrix).', successCondition: 'Identity preservation confirmed.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the action of the Pauli X gate on the computational basis state |0⟩?', options: ['X|0⟩ = |1⟩ (a complete bit flip, quantum NOT)', 'X|0⟩ = |0⟩', 'X|0⟩ = -|0⟩', 'X|0⟩ = (|0⟩ + |1⟩)/√2'], correctIndex: 0, explanation: 'The Pauli X matrix has rows [0, 1] and [1, 0]. Multiplying by column vector [1, 0]ᵀ yields [0, 1]ᵀ = |1⟩.' },
      { id: 'q2', type: 'prediction', question: 'What is the result of applying the Pauli Z gate to the equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2?', options: ['|-⟩ = (|0⟩ - |1⟩)/√2 (a phase flip on the |1⟩ component)', '|+⟩ (no change)', '|0⟩', '|1⟩'], correctIndex: 0, explanation: 'Z|0⟩ = |0⟩ and Z|1⟩ = -|1⟩. Thus Z(|0⟩ + |1⟩)/√2 = (|0⟩ - |1⟩)/√2 = |-⟩.' },
      { id: 'q3', type: 'concept', question: 'Geometrically on the Bloch sphere, what transformation does the Pauli Y gate perform on a state vector?', options: ['A 180° (π radian) rotation around the Y-axis', 'A 90° rotation around the Z-axis', 'A translation along the X-axis', 'It shrinks the vector to zero length'], correctIndex: 0, explanation: 'Every Pauli operator σ_k generates a π rotation around its corresponding axis on the Bloch sphere: R_k(π) = exp(-i π/2 σ_k) = -i σ_k.' },
      { id: 'q4', type: 'prediction', question: 'What is the matrix product of applying the Pauli X gate twice: X · X (or X²)?', options: ['The 2×2 Identity matrix I = diag(1, 1)', 'Zero matrix 0', '-I', 'Pauli Z matrix'], correctIndex: 0, explanation: 'All Pauli matrices are involutory: X² = Y² = Z² = I. Applying the same Pauli gate twice returns the qubit to its original state.' },
      { id: 'q5', type: 'interpretation', question: 'What is the commutator [X, Z] = XZ - ZX of the Pauli X and Pauli Z gates?', options: ['-2i Y', '0 (they commute)', '+2i Y', 'I'], correctIndex: 0, explanation: 'XZ = -iY and ZX = +iY. Therefore [X, Z] = XZ - ZX = -iY - (+iY) = -2i Y.' },
    ],
    defaultParams: { initialState: 'zero', animationSpeed: 1 },
  },
  {
    id: 'u25rphu02-circuit-builder',
    unit: 5,
    unitTitle: 'Quantum Circuits',
    topic: 'Quantum circuits and gate-based operations',
    title: '3D Quantum Circuit Builder and Step Runner',
    icon: '⚡',
    shortDescription: 'Multi-qubit circuit canvas with draggable gate tiles (X, Y, Z, H, S, T, CNOT), step-by-step runner, and state amplitude readouts.',
    learningObjectives: [
      'Construct gate-based quantum circuits on multi-qubit register wires',
      'Execute circuits step-by-step and inspect unitary matrix multiplication and intermediate quantum states',
      'Evaluate state vector evolutions and verify computational basis output probabilities',
    ],
    prerequisites: ['Single-qubit gates', 'Multi-qubit registers', 'Quantum circuit notation'],
    estimatedTimeMinutes: 15,
    formulaOverview: '|\\psi_k\\rangle = U_k |\\psi_{k-1}\\rangle, \\quad U_{\\text{circuit}} = U_m U_{m-1} \\cdots U_1, \\quad P(x) = |\\langle x | \\psi_{\\text{final}} \\rangle|^2',
    modelAssumptions: [
      'Ideal gate-based quantum circuit execution with unitary state vector evolution',
      'Supported gate library: X, Y, Z, H, S, T, and 2-qubit CNOT',
      'Strict circuit validation preventing ill-formed multi-qubit topologies',
    ],
    guidedSteps: [
      { title: 'Quantum Wires', description: 'Observe the 2 horizontal quantum wires representing Qubit 0 (top) and Qubit 1 (bottom), initialized to |00⟩.', highlightControl: 'circuitCanvas' },
      { title: 'Placing Gate Tiles', description: 'Add a Hadamard (H) gate on Qubit 0 and an X gate on Qubit 1 from the gate palette.', highlightControl: 'gatePalette' },
      { title: 'Adding Two-Qubit CNOT', description: 'Place a CNOT gate with control on Qubit 0 and target on Qubit 1 to generate quantum entanglement.', highlightControl: 'gatePalette' },
      { title: 'Step-by-Step Runner', description: 'Use the playback controls (Step Forward, Play, Reset) to watch the state vector update at each clock slice.', highlightControl: 'stepForward' },
    ],
    challenges: [
      { id: 'c1', title: 'Build a Bell State Circuit', goal: 'Place H on Qubit 0, followed by CNOT(0→1); verify the output state is (|00⟩ + |11⟩)/√2.', hint: 'Standard Bell state preparation sequence: H then CNOT.', successCondition: 'Output matches |Φ⁺⟩ with 50% |00⟩ and 50% |11⟩.' },
      { id: 'c2', title: 'Build a Quantum Swap Circuit', goal: 'Construct a SWAP gate using 3 alternating CNOT gates: CNOT(0→1), CNOT(1→0), CNOT(0→1).', hint: 'Three alternating CNOT gates exchange the states of two qubits.', successCondition: 'States of Qubit 0 and 1 successfully swapped.' },
      { id: 'c3', title: 'Verify Circuit Reversibility', goal: 'Build a circuit, append its Hermitian conjugate in reverse order, and verify the output returns to |00⟩.', hint: 'Unitary operations are completely reversible: U† U = I.', successCondition: 'Final state returns to |00⟩ with 100% fidelity.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'In quantum circuit diagrams, what is the standard convention for reading the flow of time?', options: ['From left to right (gates on the left execute first)', 'From right to left', 'From bottom to top', 'Time flows randomly'], correctIndex: 0, explanation: 'Quantum circuits follow musical score notation: time progresses horizontally from left to right.' },
      { id: 'q2', type: 'concept', question: 'Why are all quantum gate operations (excluding measurement) mathematically required to be reversible?', options: ['Because quantum time evolution is governed by unitary operators (U†U = I) which preserve probability and information', 'Because computers run backwards when cold', 'To prevent heat dissipation from Landauer principle only', 'Because bits cannot be duplicated'], correctIndex: 0, explanation: 'Schrödinger equation evolution is strictly unitary. Unitary matrices have inverses U⁻¹ = U†, guaranteeing complete information conservation and reversibility.' },
      { id: 'q3', type: 'prediction', question: 'If Qubit 0 is in state |1⟩ and Qubit 1 is in state |0⟩, what is the output after passing through a CNOT gate with Qubit 0 as control and Qubit 1 as target?', options: ['|11⟩ (Qubit 1 is flipped because control was 1)', '|10⟩ (no change)', '|00⟩', '|01⟩'], correctIndex: 0, explanation: 'In CNOT, if the control qubit is |1⟩, the target qubit is inverted: |10⟩ → |11⟩.' },
      { id: 'q4', type: 'interpretation', question: 'What does the No-Cloning Theorem state regarding quantum circuit operations?', options: ['It is physically impossible to create an identical copy of an arbitrary unknown quantum state', 'Circuits cannot have more than 2 wires', 'Gates cannot be used twice', 'Circuits cannot be simulated on classical computers'], correctIndex: 0, explanation: 'Proved by Wootters, Zurek, and Dieks (1982), linearity of quantum mechanics forbids any unitary operator from duplicating an arbitrary unknown state |ψ⟩.' },
      { id: 'q5', type: 'concept', question: 'What set of quantum gates constitutes a "universal" gate set capable of approximating any multi-qubit unitary operation?', options: ['Clifford gates (H, S, CNOT) combined with any non-Clifford gate such as T (π/8 gate)', 'Pauli X gates alone', 'Classical AND and OR gates', 'Zero gates are universal'], correctIndex: 0, explanation: 'The Solovay-Kitaev theorem establishes that {H, S, CNOT, T} forms a universal quantum gate set that can efficiently approximate any arbitrary unitary transformation.' },
    ],
    defaultParams: { presetCircuit: 'bell-state', numQubits: 2 },
  },
  {
    id: 'u25rphu02-hadamard-interference',
    unit: 5,
    unitTitle: 'Quantum Circuits',
    topic: 'Foundational quantum circuit behaviour; superposition and interference',
    title: '3D Hadamard, Superposition and Interference Lab',
    icon: '〰️',
    shortDescription: 'Quantum phase interference station demonstrating H² = I constructive interference and phase-induced destructive interference.',
    learningObjectives: [
      'Understand the Hadamard transformation: H|0⟩ = |+⟩ and H|1⟩ = |-⟩',
      'Demonstrate quantum interference: H(H|0⟩) = |0⟩ via constructive cancellation of the |1⟩ probability amplitude',
      'Introduce a tunable phase shift φ between Hadamards to control output probabilities: P(0) = cos²(φ/2)',
    ],
    prerequisites: ['Hadamard gate matrix', 'Wave interference', 'Complex phase factors'],
    estimatedTimeMinutes: 15,
    formulaOverview: 'H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}, \\quad H^2 = I, \\quad |0\\rangle \\xrightarrow{H} |+\\rangle \\xrightarrow{R_z(\\phi)} |\\psi\\rangle \\xrightarrow{H} \\cos(\\phi/2)|0\\rangle - i\\sin(\\phi/2)|1\\rangle',
    modelAssumptions: [
      'Equivalent to a single-photon Mach-Zehnder interferometer with 50:50 beam splitters',
      'Coherent phase preservation without dephasing (T₂ = ∞)',
      'Deterministic amplitude interference calculations prior to measurement',
    ],
    guidedSteps: [
      { title: 'The First Hadamard (Superposition)', description: 'Apply Hadamard H to initial state |0⟩; watch the state vector rotate from North pole (+Z) to equator (+X), creating |+⟩.', highlightControl: 'applyH1' },
      { title: 'The Second Hadamard (Interference)', description: 'Apply a second Hadamard H directly without phase shift; observe constructive interference returning the state to |0⟩ (H² = I)!', highlightControl: 'applyH2' },
      { title: 'Inserting a Phase Shift φ', description: 'Reset, apply H, then insert phase shift φ (e.g. Pauli Z gate where φ = π) before applying the second H.', highlightControl: 'phaseShift' },
      { title: 'Destructive Interference Outcome', description: 'Notice that with φ = π, the state emerges as |1⟩ with 100% certainty! Amplitudes for |0⟩ destructively cancelled.', highlightControl: 'phaseShift' },
    ],
    challenges: [
      { id: 'c1', title: 'Demonstrate H² = I Identity', goal: 'Apply H twice to |0⟩ and verify P(0) = 1.0 (100%) and P(1) = 0.0.', hint: 'H is its own inverse: H = H⁻¹.', successCondition: 'Final state |0⟩ verified.' },
      { id: 'c2', title: 'Produce 100% |1⟩ Output via Phase Shift', goal: 'Set phase shift φ = 180° (π radians) between Hadamards and verify output is 100% |1⟩.', hint: 'Sequence: H → Z → H transforms |0⟩ into |1⟩.', successCondition: 'Final state |1⟩ verified.' },
      { id: 'c3', title: 'Create 50/50 Output at φ = 90°', goal: 'Set phase shift φ = 90° (π/2, using S gate) and verify output probabilities P(0) = 50% and P(1) = 50%.', hint: 'P(0) = cos²(45°) = 0.5.', successCondition: 'Equal 50/50 probability verified.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the action of the Hadamard gate H on the computational basis state |0⟩?', options: ['|+⟩ = (|0⟩ + |1⟩)/√2 (an equal superposition of |0⟩ and |1⟩ with equal real phases)', '|1⟩', '|0⟩', 'An unphysical zero state'], correctIndex: 0, explanation: 'Hadamard maps the Z-basis eigenstate |0⟩ to the X-basis eigenstate |+⟩ = (|0⟩ + |1⟩)/√2.' },
      { id: 'q2', type: 'prediction', question: 'When a second Hadamard gate is applied immediately after the first Hadamard on an initial |0⟩ state (H · H |0⟩), what happens to the |1⟩ amplitude?', options: ['The two paths to |1⟩ have opposite signs (+1/2 and -1/2), interfering destructively to zero', 'The |1⟩ amplitude doubles', 'The state becomes entangled', 'The state collapses into heat'], correctIndex: 0, explanation: 'H(H|0⟩) = H(|0⟩ + |1⟩)/√2 = [ (|0⟩ + |1⟩)/√2 + (|0⟩ - |1⟩)/√2 ] / √2 = (2|0⟩ + 0|1⟩)/2 = |0⟩. The |1⟩ amplitudes cancel destructively!' },
      { id: 'q3', type: 'interpretation', question: 'In the circuit sequence |0⟩ → H → Z → H, what is the final measured state?', options: ['|1⟩ with 100% certainty', '|0⟩ with 100% certainty', '50% |0⟩ and 50% |1⟩', 'Impossible to determine'], correctIndex: 0, explanation: '|0⟩ → H gives |+⟩ = (|0⟩+|1⟩)/√2. Z flips the sign of |1⟩, giving |-⟩ = (|0⟩-|1⟩)/√2. Finally, H applied to |-⟩ gives |1⟩.' },
      { id: 'q4', type: 'concept', question: 'What classical optical device is physically analogous to the H → Phase → H quantum circuit sequence?', options: ['A Mach-Zehnder interferometer with two 50:50 beam splitters and a phase plate', 'A concave magnifying glass', 'A polarizing sunglass lens', 'A pinhole camera'], correctIndex: 0, explanation: 'The first beam splitter acts as Hadamard 1; the relative optical path length introduces phase φ; the second beam splitter acts as Hadamard 2 recombining the paths.' },
      { id: 'q5', type: 'prediction', question: 'If a tunable phase shifter φ is placed between two Hadamard gates, what formula governs the probability of measuring |0⟩ at the output?', options: ['P(0) = cos²(φ/2)', 'P(0) = φ / (2π)', 'P(0) = sin²(φ)', 'P(0) = 1.0 always'], correctIndex: 0, explanation: 'The composite unitary transformation yields amplitude cos(φ/2) for |0⟩, resulting in probability P(0) = cos²(φ/2).' },
    ],
    defaultParams: { phaseShift: 0, sequence: 'H-H' },
  },
  {
    id: 'u25rphu02-cnot-circuit',
    unit: 5,
    unitTitle: 'Quantum Circuits',
    topic: 'Two-qubit systems and quantum circuit operations',
    title: '3D Two-Qubit Circuit and CNOT Lab',
    icon: '⛓️',
    shortDescription: 'Dual-rail quantum processor stage exploring CNOT matrix logic, Bell state entanglement synthesis, and truth table verification.',
    learningObjectives: [
      'Master the Controlled-NOT (CNOT / CX) two-qubit entangling gate truth table and 4×4 unitary matrix',
      'Synthesize maximally entangled Bell states using the foundational H-CNOT circuit: |00⟩ → (|00⟩ + |11⟩)/√2',
      'Analyze reversible quantum logic, phase kickback, and two-qubit computational basis measurement correlations',
    ],
    prerequisites: ['Single-qubit Hadamard gate', 'Two-qubit product states', 'Matrix multiplication'],
    estimatedTimeMinutes: 15,
    formulaOverview: '\\text{CNOT} = \\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{pmatrix}, \\quad \\text{CNOT}|c, t\\rangle = |c, c \\oplus t\\rangle, \\quad |00\\rangle \\xrightarrow{H_0} \\xrightarrow{\\text{CNOT}} |\\Phi^+\\rangle',
    modelAssumptions: [
      'Qubit 0 assigned as Control wire; Qubit 1 assigned as Target wire',
      'Zero cross-talk and zero gate infidelity between adjacent transmon / ion qubits',
      'Computational basis readout with simultaneous projective measurement detectors',
    ],
    guidedSteps: [
      { title: 'The CNOT Gate Architecture', description: 'Observe the 3D dual-wire processor: Control qubit (solid dot •) and Target qubit (circle with plus ⊕).', highlightControl: 'inputState' },
      { title: 'Classical Truth Table Verification', description: 'Test the 4 basis inputs: |00⟩→|00⟩, |01⟩→|01⟩, |10⟩→|11⟩, |11⟩→|10⟩. Notice target flips only when control is 1.', highlightControl: 'inputState' },
      { title: 'Generating Quantum Entanglement', description: 'Turn on Hadamard on Qubit 0 before CNOT; observe the separable state transform into maximally entangled Bell state |Φ⁺⟩!', highlightControl: 'enableHadamard' },
      { title: 'Simultaneous Measurement Readout', description: 'Run correlated measurement shots; observe that outcomes are strictly correlated (50% |00⟩ and 50% |11⟩).', highlightControl: 'measureShots' },
    ],
    challenges: [
      { id: 'c1', title: 'Verify Complete CNOT Truth Table', goal: 'Step through all 4 basis states (|00⟩, |01⟩, |10⟩, |11⟩) and record the output states to verify CNOT|c,t⟩ = |c, c ⊕ t⟩.', hint: '⊕ represents modulo-2 addition (exclusive OR).', successCondition: 'All 4 truth table rows validated.' },
      { id: 'c2', title: 'Synthesize the |Ψ⁺⟩ Bell State', goal: 'Configure the circuit to generate |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2 starting from |01⟩.', hint: 'Apply H on Qubit 0, then CNOT(0→1) with Qubit 1 initialized to |1⟩.', successCondition: 'State matches |Ψ⁺⟩ with 50% |01⟩ and 50% |10⟩.' },
      { id: 'c3', title: 'Observe Phase Kickback', goal: 'Set control to |+⟩ and target to |-⟩; apply CNOT and observe target unchanged while control acquires a phase flip!', hint: 'In the |-⟩ eigenbasis of X, the eigenvalue -1 kicks back into the control qubit.', successCondition: 'Phase kickback phenomenon verified.' },
    ],
    assessments: [
      { id: 'q1', type: 'concept', question: 'What is the mathematical output of a CNOT gate acting on the computational basis state |10⟩ where Qubit 0 is control and Qubit 1 is target?', options: ['|11⟩ (the target qubit is flipped from 0 to 1 because the control is 1)', '|10⟩', '|00⟩', '|01⟩'], correctIndex: 0, explanation: 'CNOT|c, t⟩ = |c, c ⊕ t⟩. Here c = 1 and t = 0, so output is |1, 1 ⊕ 0⟩ = |1, 1⟩ = |11⟩.' },
      { id: 'q2', type: 'prediction', question: 'What state is produced when a CNOT gate acts on the separable state (|0⟩ + |1⟩)/√2 ⊗ |0⟩?', options: ['The maximally entangled Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2', '|00⟩', '|11⟩', '|01⟩ + |10⟩'], correctIndex: 0, explanation: 'By linearity: CNOT[(|0⟩+|1⟩)/√2 ⊗ |0⟩] = (CNOT|00⟩ + CNOT|10⟩)/√2 = (|00⟩ + |11⟩)/√2 = |Φ⁺⟩.' },
      { id: 'q3', type: 'concept', question: 'Why is the CNOT gate called an "entangling gate"?', options: ['Because when applied to a superposition on the control qubit, it transforms a separable product state into an entangled state', 'Because it physically ties two wires together with carbon nanotubes', 'Because it cannot be undone', 'Because it generates magnetic flux'], correctIndex: 0, explanation: 'Single-qubit gates cannot generate entanglement from product states. Multi-qubit conditional gates like CNOT are required to create quantum entanglement.' },
      { id: 'q4', type: 'prediction', question: 'In the CNOT gate 4×4 unitary matrix, what is the determinant?', options: ['-1', '0', '+1', '+2'], correctIndex: 0, explanation: 'The CNOT matrix is a permutation matrix exchanging |10⟩ and |11⟩ (one transposition), which gives determinant -1.' },
      { id: 'q5', type: 'concept', question: 'What is the phenomenon of "phase kickback" in quantum circuits?', options: ['When an operation on a target qubit in an eigenstate of the gate kicks back an eigenvalue phase factor onto the control qubit', 'When an electron recoils from a photon collision', 'When a quantum computer overheats and shuts down', 'When a measurement destroys the control qubit'], correctIndex: 0, explanation: 'Phase kickback occurs when the target is an eigenstate of the conditional operation (e.g. |-⟩ for X): the eigenvalue (-1) is transferred directly onto the control qubit state.' },
    ],
    defaultParams: { inputState: '00', enableHadamard: true, shots: 100 },
  },
];
