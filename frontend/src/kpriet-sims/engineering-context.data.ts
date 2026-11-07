import type { ISimulationEngineeringContext } from './types';

/**
 * Authoritative Real-World & Engineering Context Repository
 * Curated for Engineering Mathematics, Physics, and Chemistry.
 * Answering:
 *  1. What is happening?
 *  2. Where is it used?
 *  3. When is it used?
 *  4. Why is it used?
 *  5. Engineering applications
 *  6. Key takeaway
 *  7. Assumptions & Limitations
 */
export const ENGINEERING_CONTEXT_REGISTRY: Record<string, ISimulationEngineeringContext> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINEERING MATHEMATICS (Linear Algebra, Calculus, Differential Equations)
  // ═══════════════════════════════════════════════════════════════════════════

  'u25rma201-linear-systems': {
    summary: 'Models the solution of linear systems of equations [A|b] using Gaussian Elimination, Gauss-Jordan, and LU Decomposition.',
    whatIsHappening: 'The simulation transforms matrix coefficients through elementary row operations to determine unknown state variables x in Ax = b, visualising row-echelon forms and identifying whether a system has a unique, infinite, or no solution.',
    whereUsed: [
      'Structural frame truss analysis in Civil Engineering (nodal equilibrium equations).',
      'Power flow networks in Electrical Engineering (nodal admittance matrices).',
      'Computer graphics transformations and rendering pipelines.',
      'Chemical reaction mass-balancing in process engineering plants.',
    ],
    whenUsed: [
      'During static equilibrium analysis of multi-member bridges and structures.',
      'In state-space system modeling and steady-state electrical circuit simulation.',
      'When inverting large coordinate systems in 3D robotic arm inverse kinematics.',
    ],
    whyUsed: [
      'Physical laws (Kirchhoff’s laws, Newton’s laws, Fick’s laws) in interconnected systems form simultaneous linear equations. Solving them analytically or numerically reveals voltages, forces, and flow rates across every component.',
    ],
    engineeringApplications: [
      {
        field: 'Civil & Structural Engineering',
        example: 'Solving stiffness matrices for high-rise buildings subjected to lateral wind and seismic loads.',
      },
      {
        field: 'Electrical & Power Systems',
        example: 'Solving bus voltage vectors [V] from injected currents [I] using Y-bus admittance matrices.',
      },
      {
        field: 'Aerospace & Robotics',
        example: 'Computing actuator joint velocities from end-effector trajectory targets via inverse Jacobian matrices.',
      },
    ],
    keyTakeaway: 'Every linear system Ax = b represents the intersection of hyperplanes; row-echelon reduction reveals whether a system can be physically solved and what each component requires.',
    assumptionsOrLimitations: [
      'Assumes linear elastic material behavior; does not model non-linear plasticity, buckling, or material yielding.',
      'Condition number issues and floating-point roundoff errors in real ill-conditioned matrices are simplified.',
    ],
  },

  'u25ma402-numerical-methods': {
    summary: 'Comprehensive numerical computation suite for roots of transcendental equations, simultaneous linear systems, interpolation, numerical differentiation & integration, and finite difference ODE/PDE solutions.',
    whatIsHappening: 'Continuous physical equations representing heat conduction, vibrating strings, structural trusses, and fluid flow are discretized into algebraic systems solved step-by-step through iterative algorithms with strict stability and residual bounds.',
    whereUsed: [
      'Finite Element Analysis (FEA) solvers in Mechanical Engineering (ANSYS, Abaqus).',
      'Computational Fluid Dynamics (CFD) simulation codes (OpenFOAM, FLUENT).',
      'Thermal management simulation for EV battery packs, heat exchangers, and turbine blades.',
      'Trajectory, orbital mechanics, and vibration frequency analysis in Aerospace Engineering.',
    ],
    whenUsed: [
      'When engineering differential equations cannot be solved in closed analytical form due to non-linearities, complex geometry, or non-uniform boundary conditions.',
      'During thermal transient dissipation modeling where explicit time-stepping requires CFL stability condition (r ≤ 0.5).',
      'When calibrating empirical sensor data via Lagrange/Newton interpolation curves.',
    ],
    whyUsed: [
      'Real-world mechanical systems rarely possess closed-form analytical solutions. Numerical methods allow deterministic computer approximations with measurable error bounds.',
    ],
    engineeringApplications: [
      {
        field: 'Thermal & Fluid Engineering',
        example: 'Solving transient 1D/2D heat diffusion equations across multi-layer composite thermal insulation.',
      },
      {
        field: 'Structural & Automotive Dynamics',
        example: 'Solving multi-degree-of-freedom spring-mass-damper equations of motion using Runge-Kutta 4th order (RK4).',
      },
      {
        field: 'Process Engineering & Piping',
        example: 'Calculating pipe friction factors using the non-linear Colebrook-White equation via Newton-Raphson iteration.',
      },
    ],
    keyTakeaway: 'Numerical methods bridge continuous physical laws and discrete computer calculations; understanding convergence rates, error orders, and stability criteria ensures simulations do not produce dangerous, non-physical results.',
    assumptionsOrLimitations: [
      'Explicit finite difference diffusion schemes become unconditionally unstable if mesh ratio r = α·Δt/(Δx)² exceeds 0.5.',
      'High-degree polynomial interpolation across equidistant nodes is vulnerable to Runge’s phenomenon near interval boundaries.',
      'Iterative linear solvers require diagonal dominance for guaranteed convergence.',
    ],
  },

  'ma-matrix-ops': {
    summary: 'Demonstrates matrix multiplication, inversion, determinant computation, and linear transformations.',
    whatIsHappening: 'Matrices act as linear operators that stretch, rotate, reflect, or scale vectors in Euclidean space, demonstrating how algebraic operations translate to geometric deformations.',
    whereUsed: [
      'Game development and CAD software for 3D model orientation, scaling, and camera projection.',
      'Finite Element Analysis (FEA) packages for structural displacement calculations.',
      'Machine learning algorithms for linear feature transformations and Principal Component Analysis (PCA).',
    ],
    whenUsed: [
      'When transforming spatial coordinates from world space to camera/screen coordinates.',
      'During coordinate system handoffs between GPS satellites, aircraft frames, and inertial sensors.',
    ],
    whyUsed: [
      'Matrices compact thousands of coupled equations into unified algebraic operators, allowing high-speed parallel computation on modern GPUs.',
    ],
    engineeringApplications: [
      {
        field: 'Computer Science & Game Engines',
        example: 'Multiplying 4×4 affine transformation matrices to position, orient, and project 3D meshes in real time.',
      },
      {
        field: 'Robotics Engineering',
        example: 'Denavit-Hartenberg (D-H) transformation matrices for tracking successive robotic joint linkages in 6-DOF arms.',
      },
    ],
    keyTakeaway: 'A matrix is not just a table of numbers—it is a geometric transformation of space; determinant zero means space has collapsed in at least one dimension.',
    assumptionsOrLimitations: [
      'Idealized exact arithmetic without numerical pivoting or sparsity optimizations used in large-scale solvers.',
    ],
  },

  'ma-eigen': {
    summary: 'Visualises eigenvalues (λ) and eigenvectors (v) where Av = λv represents directions unchanged by transformation.',
    whatIsHappening: 'As a matrix operator A acts on input vectors, special directions (eigenvectors) do not rotate—they are only stretched or shrunk by a scaling factor known as the eigenvalue.',
    whereUsed: [
      'Structural dynamic analysis: determining natural resonant frequencies of bridges and buildings.',
      'Acoustic and vibration engineering in automotive engine mount design.',
      'Quantum mechanics: observable physical quantities (energy, momentum) as eigenvalues of Hermitian operators.',
      'Search engines and data science (Google PageRank algorithm and PCA dimensionality reduction).',
    ],
    whenUsed: [
      'During modal analysis to prevent catastrophic mechanical resonance under periodic external vibrations.',
      'When calculating buckling loads of slender structural columns (Euler buckling eigenvalues).',
    ],
    whyUsed: [
      'Coupled multi-variable differential equations can be decoupled and solved independently along their eigenvector coordinates, reducing complex systems to simple uncoupled modes.',
    ],
    engineeringApplications: [
      {
        field: 'Mechanical & Civil Engineering',
        example: 'Calculating the fundamental resonant frequency of the Tacoma Narrows Bridge to prevent wind-induced flutter.',
      },
      {
        field: 'Electrical & Power Engineering',
        example: 'Determining the small-signal stability of electrical transmission grids by checking whether matrix eigenvalues have negative real parts.',
      },
      {
        field: 'Data & Computer Engineering',
        example: 'Compressing image data and face recognition via Principal Component Analysis (eigenfaces).',
      },
    ],
    keyTakeaway: 'Eigenvalues represent the natural frequencies or principal response axes of physical systems; avoiding external excitation at these frequencies prevents catastrophic resonance.',
    assumptionsOrLimitations: [
      'Assumes linear time-invariant (LTI) systems; real mechanical systems exhibit non-linear damping at high amplitudes.',
    ],
  },

  'ma-partial': {
    summary: 'Visualises partial derivatives ∂f/∂x and ∂f/∂y as slopes of tangent lines along orthogonal coordinate planes.',
    whatIsHappening: 'The simulation slices a 3D multivariable surface z = f(x, y) with planes x = constant or y = constant, showing how the function changes when only one input parameter varies while others are held fixed.',
    whereUsed: [
      'Thermodynamics and HVAC engineering (evaluating pressure variation with volume at constant temperature).',
      'Structural sensitivity analysis (how beam deflection changes with flange thickness vs depth).',
      'Machine learning gradient descent for loss function optimization.',
    ],
    whenUsed: [
      'In sensitivity studies during product design to determine which tolerances impact performance most.',
      'When calculating thermodynamic state equations (e.g. Maxwell relations in heat engines).',
    ],
    whyUsed: [
      'Real engineering systems depend on multiple independent variables; partial derivatives isolate the isolated effect of tuning each parameter.',
    ],
    engineeringApplications: [
      {
        field: 'Thermal & Chemical Engineering',
        example: 'Computing heat transfer rates via Fourier’s law where heat flux is proportional to the spatial temperature gradient ∂T/∂x.',
      },
      {
        field: 'Electronics & Semiconductor Engineering',
        example: 'Calculating carrier diffusion currents driven by carrier concentration gradients ∂n/∂x and ∂p/∂x.',
      },
    ],
    keyTakeaway: 'A partial derivative measures sensitivity to a single design parameter while holding all other operating variables frozen in place.',
    assumptionsOrLimitations: [
      'Requires continuous differentiability; real components with sharp notches or cracks exhibit mathematical singularities.',
    ],
  },

  'ma-lagrange': {
    summary: 'Demonstrates constrained optimization of f(x, y) subject to equality constraint g(x, y) = c using Lagrange multipliers (∇f = λ∇g).',
    whatIsHappening: 'The simulation plots contour curves of an objective function alongside a constraint boundary, demonstrating that optimum points occur exactly where level curves become tangent to the constraint curve.',
    whereUsed: [
      'Economic dispatch in electric power grids (minimizing fuel cost subject to satisfying total load demand).',
      'Aerospace trajectory optimization (minimizing fuel consumption subject to reaching target orbital velocity).',
      'Structural design (maximizing stiffness subject to a total material weight budget).',
    ],
    whenUsed: [
      'Whenever an engineering goal must be maximized or minimized under physical, financial, or regulatory limits.',
      'In structural topology optimization during preliminary aircraft wing design.',
    ],
    whyUsed: [
      'Real engineering problems never have unlimited budgets or materials; Lagrange multipliers turn constrained boundary problems into solvable algebraic equations.',
    ],
    engineeringApplications: [
      {
        field: 'Electrical Power Engineering',
        example: 'Equal incremental cost dispatch: distributing megawatt load across 5 power generators to minimize hourly coal/gas expenditure.',
      },
      {
        field: 'Mechanical & Structural Engineering',
        example: 'Designing pressure vessels to maximize interior holding volume subject to a maximum steel plate surface area.',
      },
    ],
    keyTakeaway: 'At the optimal constrained point, the gradient of what you want to achieve is collinear with the gradient of the limit holding you back: ∇f = λ∇g.',
    assumptionsOrLimitations: [
      'Assumes smooth convex surfaces; real-world problems with non-convex boundaries can have local extrema that trick simple solvers.',
    ],
  },

  'ma-jacobian': {
    summary: 'Visualises the Jacobian matrix and its determinant J = ∂(u,v)/∂(x,y) as local area/volume scaling factors.',
    whatIsHappening: 'Demonstrates how a non-linear mapping transforms an infinitesimal rectangular region into a curvilinear parallelogram, with the Jacobian determinant quantifying local expansion or compression.',
    whereUsed: [
      'Robotics kinematics (relating joint angular velocities to tool-tip linear and angular velocities in Cartesian space).',
      'Multiple integral coordinate transformations (Cartesian to polar, cylindrical, and spherical coordinates).',
      'Nonlinear finite element analysis (mapping master elements to distorted physical mesh elements).',
    ],
    whenUsed: [
      'When detecting kinematic singularities in robotic arms where joints lock up or lose degrees of freedom (det(J) = 0).',
      'When computing integrals over irregular engineering geometries.',
    ],
    whyUsed: [
      'Linearizes complex multi-input multi-output non-linear relationships around an instantaneous operating point.',
    ],
    engineeringApplications: [
      {
        field: 'Industrial Robotics',
        example: 'Preventing robotic wrist singularities in surgical robots and welding arms where det(J) approaches zero.',
      },
      {
        field: 'Finite Element Analysis',
        example: 'Isoparametric element formulation: transforming master parent elements [-1, 1] to complex curved mesh elements.',
      },
    ],
    keyTakeaway: 'The Jacobian determinant represents the local magnification ratio of area or volume under a coordinate transformation; when det(J) = 0, the system has lost a degree of freedom.',
    assumptionsOrLimitations: [
      'Represents first-order linear approximation; higher-order curvature terms are neglected.',
    ],
  },

  'ma-ode2': {
    summary: 'Solves second-order linear differential equations a y" + b y\' + c y = f(t) representing oscillating physical systems.',
    whatIsHappening: 'The simulation plots the displacement response over time, showing transitions between underdamped (oscillatory), critically damped (fastest non-oscillatory return), and overdamped regimes based on the discriminant b² - 4ac.',
    whereUsed: [
      'Automotive suspension design (spring-mass-damper tuning for ride comfort and road holding).',
      'RLC resonant circuits in RF receivers and power factor correction units.',
      'Civil seismic dampers in earthquake-resistant skyscrapers.',
      'Control systems (tuning PID gains for second-order plant responses).',
    ],
    whenUsed: [
      'When sizing shock absorbers and vehicle suspension springs.',
      'When designing audio filters, crossover networks, and anti-aliasing circuits.',
    ],
    whyUsed: [
      'Newton’s second law (F = ma = m y") and Kirchhoff’s voltage law (L d²q/dt² + R dq/dt + q/C = V) are second-order differential equations. Understanding damping ensures physical systems settle safely without destructive oscillation.',
    ],
    engineeringApplications: [
      {
        field: 'Automotive Engineering',
        example: 'Tuning suspension damping ratio ζ ≈ 0.7 for optimal compromise between passenger comfort and tyre contact force.',
      },
      {
        field: 'Structural Engineering',
        example: 'Tuned mass damper (TMD) inside Taipei 101 to counteract typhoon and earthquake oscillations.',
      },
    ],
    keyTakeaway: 'The discriminant b² - 4ac governs physical reality: negative produces ringing oscillation, zero provides fastest settling, and positive produces sluggish overdamped recovery.',
    assumptionsOrLimitations: [
      'Assumes constant coefficients (linear damping and linear spring constant); real springs stiffen at large displacements.',
    ],
  },

  'ma-green': {
    summary: 'Demonstrates Green’s Theorem connecting a line integral around a closed boundary to a double integral over the enclosed plane region.',
    whatIsHappening: 'The simulation compares circulating flow along a boundary contour C with the microscopic curl / vortex spinning summed over the interior surface D, confirming ∮ (P dx + Q dy) = ∬ (∂Q/∂x - ∂P/∂y) dA.',
    whereUsed: [
      'Planar fluid mechanics (calculating circulation and aerodynamic lift generated by airfoil profiles).',
      'Electromagnetic circuit calculations in planar microstrip transmission lines.',
      'Digital planimeter instruments used in surveying and civil engineering to measure parcel areas.',
    ],
    whenUsed: [
      'When computing aerodynamic lift via the Kutta-Joukowski theorem (Lift = ρ V Γ).',
      'When evaluating work done by non-conservative force fields over closed machinery cycles.',
    ],
    whyUsed: [
      'Converting complex 2D surface integrals into simple 1D line integrals around boundaries significantly reduces numerical calculation time in engineering software.',
    ],
    engineeringApplications: [
      {
        field: 'Aerospace Engineering',
        example: 'Calculating total aerodynamic circulation Γ around an aircraft wing to determine total lift force.',
      },
      {
        field: 'Civil & Surveying Engineering',
        example: 'Electronic planimeter algorithms calculating lake or reservoir land surface areas from boundary perimeter traces.',
      },
    ],
    keyTakeaway: 'Green’s Theorem proves that the sum of microscopic rotations inside an area equals the macroscopic net circulation around its outer boundary.',
    assumptionsOrLimitations: [
      'Requires a simply connected domain and smooth boundary curves without self-intersecting holes.',
    ],
  },

  'ma-gauss': {
    summary: 'Visualises Gauss’s Divergence Theorem converting surface flux integrals ∬ F·n dS into volume divergence integrals ∭ (∇·F) dV.',
    whatIsHappening: 'Demonstrates that total outward fluid or electromagnetic flux exiting a closed 3D boundary is identically equal to the sum of all source strengths (divergence) contained inside the volume.',
    whereUsed: [
      'Electromagnetic field simulation in antenna design (Gauss’s law for electric and magnetic fields).',
      'Computational Fluid Dynamics (CFD) for mass and momentum conservation in control volumes.',
      'Heat conduction analysis in nuclear reactor pressure vessels.',
    ],
    whenUsed: [
      'When enforcing continuity equations in finite-volume CFD mesh solvers.',
      'When sizing electrostatic shielding and Faraday enclosures.',
    ],
    whyUsed: [
      'Enables conversion between differential field equations (pointwise laws) and integral conservation laws (finite engineering components).',
    ],
    engineeringApplications: [
      {
        field: 'Mechanical & Fluid Engineering',
        example: 'Deriving the Navier-Stokes mass conservation equation: ∂ρ/∂t + ∇·(ρv) = 0 across fluid control volumes.',
      },
      {
        field: 'Electrical & Telecommunications Engineering',
        example: 'Computing electric field radiation patterns from radar horns using Maxwell’s divergence equations.',
      },
    ],
    keyTakeaway: 'What flows out of a closed boundary must equal what was created inside minus what was stored.',
    assumptionsOrLimitations: [
      'Assumes continuously differentiable vector fields without unmodeled point singularities on boundary surfaces.',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHYSICS (Quantum, Semiconductors, Optics, Electromagnetics)
  // ═══════════════════════════════════════════════════════════════════════════

  'u25rphu02-quantum-well': {
    summary: 'Simulates 1D quantum confinement of charge carriers inside a potential well creating discrete energy subbands.',
    whatIsHappening: 'When the thickness of a semiconductor layer approaches the de Broglie wavelength of an electron (~10 nm), continuous bulk energy bands split into discrete, quantized energy levels E_n ∝ n².',
    whereUsed: [
      'Quantum Well Laser Diodes used in fiber-optic internet backbone transmitters.',
      'High-Efficiency Multijunction Solar Cells for spacecraft and satellites.',
      'High Electron Mobility Transistors (HEMTs) in 5G mobile base stations.',
    ],
    whenUsed: [
      'During bandgap engineering when specifying wavelength targets for telecommunication optical transceivers (1310 nm / 1550 nm).',
      'When designing low-noise RF amplifiers operating in microwave and millimeter-wave frequencies.',
    ],
    whyUsed: [
      'Quantum confinement produces an abrupt step-like density of states, drastically reducing threshold current and thermal noise in semiconductor lasers compared to bulk crystals.',
    ],
    engineeringApplications: [
      {
        field: 'Optoelectronics & Photonics',
        example: 'InGaAsP/InP multiple-quantum-well (MQW) laser diodes delivering high optical output with sub-milliamp threshold currents.',
      },
      {
        field: 'RF & Microwave Engineering',
        example: 'AlGaAs/GaAs HEMT amplifiers providing ultra-low noise figures in satellite receiving dish downconverters.',
      },
    ],
    keyTakeaway: 'Shrinking semiconductor dimensions below the electron de Broglie wavelength transforms continuous energy bands into discrete quantized states, boosting optical and electrical efficiency.',
    assumptionsOrLimitations: [
      'Uses infinite or square finite potential well approximations; real heterojunctions have graded interfaces and strain-induced band offsets.',
    ],
  },

  'u25rphu02-tunnelling': {
    summary: 'Demonstrates quantum mechanical tunnelling of electrons through classically forbidden potential energy barriers.',
    whatIsHappening: 'An electron wavepacket incident upon a barrier higher than its kinetic energy experiences exponential wavefunction decay ψ(x) ∝ e^(-αx), yielding a non-zero probability of appearing on the other side without possessing classical barrier energy.',
    whereUsed: [
      'Flash memory and solid-state drives (Fowler-Nordheim tunnelling writes and erases floating-gate transistors).',
      'Scanning Tunnelling Microscopy (STM) for atomic-scale surface imaging and nanotechnology metrology.',
      'Zener diodes in electronic power supplies for precision voltage regulation.',
      'Tunnel Field-Effect Transistors (TFETs) being developed for sub-thermal subthreshold swing computing.',
    ],
    whenUsed: [
      'When calculating gate dielectric leakage currents in sub-3nm FinFET and GAA silicon transistor nodes.',
      'When designing precision voltage reference circuits.',
    ],
    whyUsed: [
      'Tunnelling is both an enabling engineering mechanism (enables Flash SSD storage) and the primary limiting leakage mechanism in modern nanometer microprocessor scaling.',
    ],
    engineeringApplications: [
      {
        field: 'Semiconductor Memory Engineering',
        example: 'Writing data bits into 3D NAND Flash memory cells by tunnelling electrons through an ultra-thin silicon dioxide dielectric barrier.',
      },
      {
        field: 'Nanotechnology Metrology',
        example: 'Scanning Tunnelling Microscope piezotips detecting atomic height variations by monitoring picoampere tunnelling currents.',
      },
    ],
    keyTakeaway: 'At nanometer scales, particles behave as waves that penetrate through barriers they classically could never cross; barrier thickness exponentially controls transmission probability.',
    assumptionsOrLimitations: [
      'Idealized 1D rectangular barrier; real gate stacks involve multi-layer dielectrics and quantum mechanical image force barrier lowering.',
    ],
  },

  'u25rphu02-bloch-sphere': {
    summary: 'Interactive 3D representation of pure qubit quantum states |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩ on the unit Bloch sphere.',
    whatIsHappening: 'Maps complex two-level quantum states onto a 3D unit sphere where latitude represents relative probability amplitudes (θ) and longitude represents quantum phase angle (φ).',
    whereUsed: [
      'Quantum computing processor architectures (IBM Quantum, Google Sycamore, Rigetti).',
      'Quantum key distribution (QKD) telecommunications networks for tamper-evident encryption.',
      'Nuclear Magnetic Resonance (NMR) and Medical Magnetic Resonance Imaging (MRI) RF pulse programming.',
    ],
    whenUsed: [
      'When designing microwave pulse sequences to execute single-qubit quantum gates (Pauli-X, Hadamard, phase shifts).',
      'When analyzing qubit decoherence and dephasing times ($T_1$ and $T_2$) in cryogenic dilution refrigerators.',
    ],
    whyUsed: [
      'Provides an intuitive geometric visualization of single-qubit rotations that directly map to physical microwave driving pulses.',
    ],
    engineeringApplications: [
      {
        field: 'Quantum Hardware Engineering',
        example: 'Calibrating microwave pulse durations and phase offsets to drive transmon superconducting qubits through π and π/2 rotations.',
      },
      {
        field: 'Medical Imaging (MRI)',
        example: 'Applying 90° and 180° RF pulses to tip proton magnetization vectors into the transverse plane for magnetic resonance tomography.',
      },
    ],
    keyTakeaway: 'Every single-qubit operation is physically a rotation around an axis on the Bloch sphere; maintaining vector orientation against thermal noise is the central challenge of quantum computing.',
    assumptionsOrLimitations: [
      'Applies only to pure single-qubit states; entangled multi-qubit systems require higher-dimensional Hilbert spaces that cannot be represented on a single 3D sphere.',
    ],
  },

  'EXP-P10-01': {
    summary: 'Virtual laboratory verifying Ohm’s Law V = I·R and calculating the electrical resistivity of conductor specimens.',
    whatIsHappening: 'An adjustable DC power supply applies voltage across a resistance wire, measuring current through an ammeter and potential drop via a voltmeter to confirm direct proportionality and plot linear V–I curves.',
    whereUsed: [
      'Electrical power transmission grid line sizing and conductor selection (aluminum conductor steel-reinforced / ACSR).',
      'Printed circuit board (PCB) trace width calculations to avoid overheating.',
      'Electric motor winding design and transformer coil sizing.',
    ],
    whenUsed: [
      'During early electrical load calculations and circuit breaker sizing.',
      'When inspecting electrical resistance and grounding rod installations in industrial plants.',
    ],
    whyUsed: [
      'Provides the fundamental baseline relationship between potential, charge flow, and thermal dissipation (Joule heating P = I²R) across all electrical engineering.',
    ],
    engineeringApplications: [
      {
        field: 'Electrical Installation & Building Services',
        example: 'Sizing copper cable cross-sections to ensure voltage drop remains under the statutory 3% limit at full load current.',
      },
      {
        field: 'Electronic Hardware Engineering',
        example: 'Selecting current-sense shunt resistors for high-efficiency battery management systems (BMS) in electric vehicles.',
      },
    ],
    keyTakeaway: 'Current through an ohmic conductor is directly proportional to applied potential drop at constant temperature; slope of V vs I curve yields exact resistance.',
    assumptionsOrLimitations: [
      'Assumes isothermal conditions; real conductors heat up at high currents, causing resistance to increase via positive temperature coefficient of resistance (TCR).',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHEMISTRY (Electrochemistry, Batteries, Corrosion, Water Treatment)
  // ═══════════════════════════════════════════════════════════════════════════

  'chem-fuel-cell': {
    summary: 'Simulates hydrogen–oxygen fuel cell thermodynamics and polarization curves (activation, ohmic, and concentration losses).',
    whatIsHappening: 'Hydrogen is oxidized at the anode (H₂ → 2H⁺ + 2e⁻) and oxygen is reduced at the cathode (½O₂ + 2H⁺ + 2e⁻ → H₂O) across a proton exchange membrane, converting chemical energy directly into electrical power and water.',
    whereUsed: [
      'Hydrogen fuel cell electric vehicles (FCEVs) such as the Toyota Mirai, heavy-duty trucks, and trains.',
      'Stationary emergency backup power generation for hospitals and telecommunications towers.',
      'Spacecraft power systems (NASA Apollo and Space Shuttle missions).',
    ],
    whenUsed: [
      'When designing zero-emission long-haul transport where battery charging times and battery weight are prohibitive.',
      'During fuel cell stack power sizing and air compressor parasitic load optimization.',
    ],
    whyUsed: [
      'Fuel cells are not heat engines and therefore are not restricted by the Carnot cycle efficiency limit; they achieve electrical efficiencies of 50–60% with zero local tailpipe emissions.',
    ],
    engineeringApplications: [
      {
        field: 'Automotive & Heavy Transport Engineering',
        example: 'Hydrogen fuel cell bus powertrains with 100 kW PEM stacks achieving 500 km range with 15-minute refuelling times.',
      },
      {
        field: 'Clean Energy & Power Engineering',
        example: 'MW-scale stationary fuel cell power plants operating on reformed biogas to power remote data centers.',
      },
    ],
    keyTakeaway: 'Fuel cells bypass the Carnot thermodynamic limit by electrochemically combining hydrogen and oxygen, producing electricity, heat, and pure water with high conversion efficiency.',
    assumptionsOrLimitations: [
      'Assumes pure reactant feeds and ideal hydration; real stacks suffer from catalyst carbon monoxide poisoning and membrane flooding or drying.',
    ],
  },

  'chem-lithium-ion': {
    summary: 'Simulates electrochemical intercalation/de-intercalation of lithium ions between graphite anode and transition-metal oxide cathode.',
    whatIsHappening: 'During charging, lithium ions de-intercalate from the cathode (e.g. LiCoO₂), migrate through the organic electrolyte, and insert between graphite sheets in the anode while external electrons flow through the charger.',
    whereUsed: [
      'Electric vehicles (Tesla, Tata EV, BYD) battery packs.',
      'Consumer electronics: laptops, smartphones, and medical implants.',
      'Grid-scale Battery Energy Storage Systems (BESS) for solar and wind peak-shifting.',
    ],
    whenUsed: [
      'During battery management system (BMS) design: monitoring state-of-charge (SoC), state-of-health (SoH), and cell balancing.',
      'When establishing fast-charging profiles to prevent lithium plating and thermal runaway.',
    ],
    whyUsed: [
      'Lithium is the lightest and most electropositive metal (E° = -3.04 V), offering the highest gravimetric energy density (250–300 Wh/kg) of any commercial rechargeable chemistry.',
    ],
    engineeringApplications: [
      {
        field: 'Electric Vehicle Engineering',
        example: 'Designing 400V/800V EV traction battery packs with liquid cooling plates to maintain cell temperatures within 25–35°C during rapid DC fast-charging.',
      },
      {
        field: 'Power Systems & Renewable Integration',
        example: 'Megapack utility battery storage smoothing intermittent renewable energy on regional transmission grids.',
      },
    ],
    keyTakeaway: 'Lithium-ion batteries operate via "rocking-chair" intercalation without metallic lithium dissolution, delivering high cell voltage (3.7V) and long cycle life.',
    assumptionsOrLimitations: [
      'Simplified 1D diffusion model; does not explicitly simulate Solid Electrolyte Interphase (SEI) degradation, dendrite nucleation, or mechanical electrode cracking over 1000+ cycles.',
    ],
  },

  'chem-galvanic-corrosion': {
    summary: 'Demonstrates galvanic corrosion occurring when two dissimilar metals with different electrode potentials are electrically connected in an electrolyte.',
    whatIsHappening: 'The more active metal with a more negative standard electrode potential acts as an anode and corrodes rapidly (oxidation), while the noble metal acts as a cathode and is electrochemically protected (reduction).',
    whereUsed: [
      'Marine engineering: ship hulls, propeller shafts, and offshore oil platforms.',
      'Civil construction: reinforcing steel in contact with dissimilar metal pipes or copper earthing rods.',
      'Aerospace structures: carbon fiber composite panels fastened with aluminum vs titanium rivets.',
    ],
    whenUsed: [
      'When selecting compatible fasteners and gaskets during mechanical component assembly.',
      'When designing cathodic protection systems for buried municipal gas and water pipelines.',
    ],
    whyUsed: [
      'Corrosion costs industrialized nations 3–4% of their GDP annually; recognizing galvanic couples prevents sudden structural failures and pipeline ruptures.',
    ],
    engineeringApplications: [
      {
        field: 'Marine Engineering',
        example: 'Installing sacrificial zinc or aluminum anodes on steel ship hulls near bronze propellers to force the anodes to corrode instead of the steel hull.',
      },
      {
        field: 'Civil & Pipeline Engineering',
        example: 'Using insulating dielectric flange kits between brass valves and steel pipes to prevent electrical contact in water distribution networks.',
      },
    ],
    keyTakeaway: 'Never couple dissimilar metals in a conductive environment without insulating gaskets; the more active metal on the galvanic series will sacrifice itself at an accelerated rate.',
    assumptionsOrLimitations: [
      'Galvanic series potentials depend on electrolyte composition, aeration, and salinity; standard reduction potentials in pure water differ from seawater behavior.',
    ],
  },

  'chem-reverse-osmosis': {
    summary: 'Simulates reverse osmosis desalination where hydraulic pressure exceeding natural osmotic pressure forces water through semi-permeable membranes.',
    whatIsHappening: 'Applied pressure (> 50–70 bar for seawater) overcomes natural osmotic pressure (Π = MRT), forcing pure water molecules from a high-salinity brine through a dense polyamide membrane while rejecting 99%+ of dissolved salts.',
    whereUsed: [
      'Seawater and brackish water desalination plants (e.g. Minjur and Nemmeli desalination plants in Chennai).',
      'Semiconductor cleanroom ultrapure water (UPW) generation facilities.',
      'Industrial wastewater zero-liquid-discharge (ZLD) treatment plants.',
      'Hemodialysis medical water preparation in hospitals.',
    ],
    whenUsed: [
      'When designing municipal drinking water supplies for coastal and arid population centers.',
      'When treating boiler feedwater to prevent silica and scale buildup in high-pressure thermal power plants.',
    ],
    whyUsed: [
      'RO consumes significantly less energy (3–4 kWh per cubic meter of potable water) than thermal distillation processes like multi-stage flash evaporation.',
    ],
    engineeringApplications: [
      {
        field: 'Environmental & Civil Engineering',
        example: 'Designing 100 MLD seawater reverse osmosis (SWRO) plants using energy recovery devices (pressure exchangers) to recover 95% of reject brine pressure energy.',
      },
      {
        field: 'Chemical & Manufacturing Engineering',
        example: 'Zero Liquid Discharge (ZLD) plants concentrating industrial textile effluent for salt crystallization and water reuse.',
      },
    ],
    keyTakeaway: 'Applying pressure greater than osmotic pressure across a semi-permeable membrane reverses natural flow, separating potable water from concentrated brine.',
    assumptionsOrLimitations: [
      'Assumes clean membrane performance; in practice, membrane fouling, scaling, and bio-film deposition require pre-treatment and periodic chemical cleanings.',
    ],
  },

  'chem-ion-exchange': {
    summary: 'Simulates demineralization of hard water using cation and anion exchange resin beds.',
    whatIsHappening: 'Hard water flows through a cation exchange resin (RH₂) where Ca²⁺ and Mg²⁺ are exchanged for H⁺ ions, followed by an anion exchange resin (R\'OH) where SO₄²⁻ and Cl⁻ are exchanged for OH⁻ ions, neutralizing to form demineralized water H₂O.',
    whereUsed: [
      'Thermal power station high-pressure boiler feed water treatment.',
      'Pharmaceutical manufacturing process water purification.',
      'Electronics manufacturing for semiconductor wafer rinse water.',
    ],
    whenUsed: [
      'When total dissolved solids (TDS) and hardness must be reduced to near-zero levels (< 0.1 µS/cm conductivity).',
      'When regenerating exhausted resin beds using dilute HCl and NaOH solutions.',
    ],
    whyUsed: [
      'Scale formation (CaSO₄, CaCO₃, silicates) in high-pressure boilers causes localized overheating and catastrophic boiler tube explosions.',
    ],
    engineeringApplications: [
      {
        field: 'Thermal Power Engineering',
        example: 'Treating boiler makeup water to prevent scale accumulation, maintaining heat transfer efficiency in 500 MW supercritical steam turbines.',
      },
      {
        field: 'Chemical Process Engineering',
        example: 'Regenerating cation resins with 5% HCl and anion resins with 4% NaOH in automated cycle towers based on effluent conductivity thresholds.',
      },
    ],
    keyTakeaway: 'Two-stage ion exchange completely strips dissolved ionic mineral salts from water by trading them for H⁺ and OH⁻ ions that recombine into pure water.',
    assumptionsOrLimitations: [
      'Does not remove non-ionic dissolved species like colloidal silica, dissolved gases (O₂, CO₂), or organic macromolecules without degasifiers and activated carbon pre-filtration.',
    ],
  },

  'EXP-C11-02': {
    summary: 'Virtual laboratory for acid–base volumetric titration determining unknown concentration of sodium hydroxide using standard oxalic acid.',
    whatIsHappening: 'Standard primary oxalic acid (H₂C₂O₄·2H₂O) titrates against an unknown NaOH solution using phenolphthalein indicator, demonstrating quantitative stoichiometric neutralization at the exact pink equivalence point.',
    whereUsed: [
      'Quality assurance laboratories in pharmaceutical, food, and beverage manufacturing.',
      'Environmental monitoring of industrial effluent wastewater neutralization.',
      'Chemical assay verification and raw material acceptance testing.',
    ],
    whenUsed: [
      'When determining exact chemical purity and molar concentrations of acidic or basic solutions.',
      'During wastewater neutralization control before discharge into municipal sewers.',
    ],
    whyUsed: [
      'Volumetric titration remains the definitive ISO/USP analytical technique for concentration determination with high precision and low instrument cost.',
    ],
    engineeringApplications: [
      {
        field: 'Chemical Process & Quality Engineering',
        example: 'Standardizing alkaline bath concentrations in textile processing and anodizing plants to ensure consistent product finishing.',
      },
      {
        field: 'Environmental Engineering',
        example: 'Determining total acidity and alkalinity of municipal drinking water reservoirs to monitor buffer capacity against acid precipitation.',
      },
    ],
    keyTakeaway: 'At the stoichiometric equivalence point, moles of H⁺ ions neutralized equal moles of OH⁻ ions added; the color change of phenolphthalein signals completion.',
    assumptionsOrLimitations: [
      'Assumes visual endpoint detection coincides precisely with theoretical stoichiometric equivalence; does not account for indicator blank error or ambient CO₂ absorption without boiling.',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LINUX AND SHELL SCRIPTING (U25CS202)
  // ═══════════════════════════════════════════════════════════════════════════
  'u25cs202-terminal-basics': {
    summary: 'Simulated educational command-line environment teaching core POSIX directory traversal and filesystem interaction.',
    whatIsHappening: 'Commands (pwd, ls, cd, mkdir, touch, cat) are evaluated by a safe in-memory parser against a virtual filesystem tree without any OS child process invocation.',
    whereUsed: [
      'Server administration, cloud orchestration (AWS/GCP/Azure CLI), and headless server operations.',
      'Embedded Linux development for automotive telematics and IoT edge gateways.',
      'Automated build, CI/CD pipeline definition, and containerization (Docker, Kubernetes).',
    ],
    whenUsed: [
      'Managing production Linux clusters without graphical desktop interfaces.',
      'Scripting routine diagnostic, backup, and deployment procedures.',
    ],
    whyUsed: [
      'The Linux shell provides unparalleled automation, composability, and speed across millions of distributed engineering workloads.',
    ],
    engineeringApplications: [
      {
        field: 'DevOps & Cloud Engineering',
        example: 'Automating multi-cloud VM provisioning, log log harvesting, and microservice container deployment with zero UI overhead.',
      },
      {
        field: 'Cybersecurity & Forensics',
        example: 'Investigating server compromise via command-line log auditing, file hash verification, and permission validation.',
      },
    ],
    keyTakeaway: 'The command-line interface provides direct, scriptable, and reproducible control over operating system resources and filesystems.',
    assumptionsOrLimitations: [
      'Operates inside an educational in-memory virtual filesystem with an allowlisted command parser; host files and networks are never accessed.',
    ],
  },
  'u25cs202-fhs-tree': {
    summary: 'Visualizes the standard Linux Filesystem Hierarchy Standard (FHS) from root / through essential system directories.',
    whatIsHappening: 'Displays hierarchical directory roles (/bin, /etc, /home, /var, /tmp) and explains separation of user files from system binaries and runtime state.',
    whereUsed: [
      'Operating system design, server administration, package management (dpkg, rpm), and container filesystem layering.',
    ],
    whenUsed: [
      'When configuring daemon services, deploying web servers, or troubleshooting system startup errors.',
    ],
    whyUsed: [
      'The FHS guarantees interoperability across all distributions (Ubuntu, Debian, RHEL, Arch) so software components find configs and libraries in standardized paths.',
    ],
    engineeringApplications: [
      {
        field: 'Systems Engineering',
        example: 'Partitioning enterprise servers with dedicated mount points (/var, /tmp) to prevent disk exhaustion from halting root services.',
      },
    ],
    keyTakeaway: 'Understanding the FHS enables rapid navigation and correct placement of configuration files, logs, and binaries in any POSIX environment.',
    assumptionsOrLimitations: [
      'Educational representation focusing on core standard directories; distribution-specific symlinks (/usr/bin -> /bin) are abstracted for clarity.',
    ],
  },
  'u25cs202-io-redirection': {
    summary: 'Visualizes Unix standard streams (stdin, stdout, stderr) and file redirection mechanisms.',
    whatIsHappening: 'Directs data streams to virtual files via overwrite (>), append (>>), and error redirection (2>) with buffer animations.',
    whereUsed: [
      'Log management, pipeline data processing, cron jobs, and background service daemonization.',
    ],
    whenUsed: [
      'Saving program output to log files, suppressing error messages (2> /dev/null), or piping intermediate results into downstream tools.',
    ],
    whyUsed: [
      'Unix treats everything as a file, allowing program streams to be decoupled from physical terminals and seamlessly rerouted.',
    ],
    engineeringApplications: [
      {
        field: 'Data Engineering',
        example: 'Streaming gigabytes of sensor telemetry through filter pipelines and appending validated clean records into data lakes.',
      },
    ],
    keyTakeaway: 'Every process starts with 0 (stdin), 1 (stdout), and 2 (stderr); redirection operators control their destination without changing program source code.',
    assumptionsOrLimitations: [
      'Redirection targets virtual in-memory files only; host disk is never written.',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PYTHON PROGRAMMING (U25CS201)
  // ═══════════════════════════════════════════════════════════════════════════
  'u25cs201-execution-visualizer': {
    summary: 'Educational visual execution trace for Python program flow, dynamic type binding, and in-memory heap object allocation.',
    whatIsHappening: 'Source statements are evaluated step-by-step; the visualizer shows references binding names to typed objects (int, float, str, bool) and stream flushes to stdout.',
    whereUsed: [
      'Artificial intelligence, deep learning (PyTorch, TensorFlow), and large language model development.',
      'Data science, predictive analytics, and scientific computing.',
      'Backend web development (FastAPI, Django), microservices, and automated testing frameworks.',
    ],
    whenUsed: [
      'Writing rapid prototypes, analyzing exploratory data, and building scalable production machine learning pipelines.',
      'Debugging subtle type mismatches, variable scope leaks, and execution order anomalies.',
    ],
    whyUsed: [
      'Python provides concise, highly readable syntax with massive ecosystem support, allowing engineers to translate mathematical concepts into working software in minutes.',
    ],
    engineeringApplications: [
      {
        field: 'Artificial Intelligence & Machine Learning',
        example: 'Training transformer neural networks, parsing token embeddings, and managing multi-GPU model tensors.',
      },
      {
        field: 'Automated Test Engineering',
        example: 'Writing automated regression suites and hardware-in-the-loop validation scripts for embedded electronic control units.',
      },
    ],
    keyTakeaway: 'Python variables are references pointing to dynamic heap objects; understanding object identity and reference semantics prevents common mutation bugs.',
    assumptionsOrLimitations: [
      'Sandboxed educational visualizer running client-side without host OS command execution or disk access.',
    ],
  },
  'u25cs201-list-visualizer': {
    summary: 'Visualizes Python dynamic array list operations, dual-direction indexing, slicing [start:stop:step], and amortized memory scaling.',
    whatIsHappening: 'Array elements are displayed with positive [0..n-1] and negative [-n..-1] offsets. In-place mutations (append, insert, pop) animate element shifts.',
    whereUsed: [
      'Data processing pipelines, sequence manipulation, sorting algorithms, and graph adjacency lists.',
    ],
    whenUsed: [
      'Filtering time-series telemetry data or slicing sliding windows across streaming sensor inputs.',
    ],
    whyUsed: [
      'Python lists are contiguous pointer arrays with O(1) indexed access and amortized O(1) appending, making them ideal general-purpose sequence containers.',
    ],
    engineeringApplications: [
      {
        field: 'Robotics & Computer Vision',
        example: 'Maintaining rolling buffer windows of lidar distance measurements to compute collision trajectories.',
      },
    ],
    keyTakeaway: 'List slicing creates shallow copies; understanding index boundaries and negative stepping is crucial for bug-free array transformations.',
    assumptionsOrLimitations: [
      'Visualized as an in-memory sequence; maximum element limits are enforced for classroom display clarity.',
    ],
  },
  'u25cs201-numpy-arrays': {
    summary: 'Visualizes multi-dimensional ndarray grids, broadcasting, and element-wise SIMD vectorized computations.',
    whatIsHappening: 'Contiguous C-ordered memory blocks are manipulated without Python-level iteration loops, demonstrating high-performance linear algebra operations.',
    whereUsed: [
      'Scientific computing, finite element analysis, image processing (OpenCV), and neural network backpropagation.',
    ],
    whenUsed: [
      'When processing matrices with thousands or millions of elements where pure Python for-loops would be thousands of times too slow.',
    ],
    whyUsed: [
      'NumPy delegates array computations to optimized BLAS/LAPACK C and Fortran libraries utilizing modern CPU vector registers.',
    ],
    engineeringApplications: [
      {
        field: 'Signal & Image Processing',
        example: 'Convolving 2D spatial image matrices with Gaussian filter kernels for real-time edge detection in autonomous driving.',
      },
    ],
    keyTakeaway: 'Vectorization eliminates Python interpreter loop overhead by delegating arithmetic directly to vectorized CPU instructions.',
    assumptionsOrLimitations: [
      'Educational ndarray model running in browser JavaScript with exact mathematical results.',
    ],
  },
  'u25ma301-queueing-models': {
    summary: 'Models M/M/1 queueing performance, packet arrival dynamics, server utilization, and Little\'s Law (L = λW) in computing systems.',
    whatIsHappening: 'Poisson request arrivals enter a FIFO buffer and are processed by an exponential-time server. When arrival rate approaches service capacity (ρ → 1), queue length and latency spike asymptotically.',
    whereUsed: [
      'Cloud load balancing (AWS ALB, NGINX), database connection pools, microservice request queues, and network router packet buffers.',
    ],
    whenUsed: [
      'During backend capacity planning, auto-scaling policy configuration, and SLA latency provisioning.',
    ],
    whyUsed: [
      'Little\'s Law and queueing equations predict the exact latency multiplier and buffer overflow probability under stochastic traffic bursts.',
    ],
    engineeringApplications: [
      {
        field: 'Distributed Cloud Systems',
        example: 'Sizing Kubernetes worker node replica counts so that request utilization ρ stays strictly below 0.70, preventing tail-latency explosion.',
      },
      {
        field: 'Network Engineering',
        example: 'Dimensioning packet buffer depths on edge switches to avoid TCP packet drops during micro-bursts.',
      },
    ],
    keyTakeaway: 'In stochastic systems, operating at near 100% server utilization causes exponential latency expansion; headroom is a mathematical necessity, not wasted capacity.',
    assumptionsOrLimitations: [
      'Assumes Poisson arrival process and memoryless exponential service distribution; real-world multi-tiered architectures may exhibit Pareto heavy tails.',
    ],
  },
  'u25ma301-normal-distribution': {
    summary: 'Explores continuous Gaussian density curves, z-score standardization, and tail probability calculation for computing SLA metrics.',
    whatIsHappening: 'Continuous probability density f(x) is integrated across intervals using error function approximations, demonstrating why point probabilities are zero while interval areas represent true event probabilities.',
    whereUsed: [
      'Network round-trip latency benchmarking, sensor measurement noise filtering, ML feature normalization, and A/B test hypothesis validation.',
    ],
    whenUsed: [
      'When establishing service-level agreement (SLA) bounds (p95, p99) and evaluating empirical outliers.',
    ],
    whyUsed: [
      'The Central Limit Theorem guarantees that aggregated independent computational delays converge to Gaussian distributions.',
    ],
    engineeringApplications: [
      {
        field: 'Cloud Infrastructure & SRE',
        example: 'Setting alerting thresholds for API latency breaches beyond μ + 3σ (99.73% confidence interval).',
      },
    ],
    keyTakeaway: 'Continuous random variables only possess probability across intervals; the standard normal CDF Φ(z) allows instant evaluation of tail anomalies.',
    assumptionsOrLimitations: [
      'Assumes independent and identically distributed (i.i.d.) random variables with finite variance.',
    ],
  },
  'u25cs305-pipeline-stages': {
    summary: 'Simulates 5-stage classic RISC processor pipelining, data forwarding paths, and pipeline hazard resolution.',
    whatIsHappening: 'Instructions overlap execution across IF, ID, EX, MEM, and WB stages. Data forwarding bypasses intermediate values directly from ALU outputs to dependent instructions, avoiding stall cycles.',
    whereUsed: [
      'Modern microprocessors (ARM Cortex-A, Intel Core, AMD Zen, RISC-V cores), embedded controllers, and DSP processors.',
    ],
    whenUsed: [
      'During CPU micro-architecture design, compiler instruction scheduling, and hardware performance optimization.',
    ],
    whyUsed: [
      'Pipelining increases processor instruction throughput to near 1 instruction per cycle without requiring 5x clock frequencies.',
    ],
    engineeringApplications: [
      {
        field: 'Processor Micro-Architecture',
        example: 'Designing branch predictor units and out-of-order execution reservation stations in high-performance datacenter server CPUs.',
      },
      {
        field: 'Compiler Engineering (LLVM/GCC)',
        example: 'Scheduling machine instructions to fill Load-Use delay slots, minimizing pipeline stalls.',
      },
    ],
    keyTakeaway: 'Pipelining exploits instruction-level parallelism (ILP) by balancing stage propagation delays; data forwarding resolves RAW dependencies with zero pipeline bubbles.',
    assumptionsOrLimitations: [
      'Educational 5-stage in-order RISC pipeline model; real modern x86/ARM processors utilize out-of-order execution with 14-20 stages.',
    ],
  },

  'u25cs401-normalization-workshop': {
    summary: 'Decomposes complex relation schemas systematically from 1NF to BCNF while enforcing Lossless Join and Dependency Preservation.',
    whatIsHappening: 'The system computes functional dependency closures, detects partial and transitive dependencies, and splits wide tables into Boyce-Codd Normal Form relations to eliminate insertion, update, and deletion anomalies.',
    whereUsed: [
      'Enterprise Relational Database Management Systems (PostgreSQL, Oracle, MySQL, SQL Server).',
      'Core transactional banking and financial ledger schema designs.',
      'Electronic Health Records (EHR) schemas ensuring patient-prescription referential consistency.',
      'E-commerce order fulfillment, catalog, and inventory tracking databases.',
    ],
    whenUsed: [
      'During logical database design sprints to eliminate data redundancy and prevent data corruption anomalies.',
      'When refactoring monolithic legacy databases into modular microservice data stores.',
      'Prior to building OLTP transactional backends requiring strict data integrity.',
    ],
    whyUsed: [
      'Unnormalized relations introduce severe update anomalies (inconsistent duplicate updates), insertion anomalies (inability to record facts without artificial keys), and deletion anomalies (loss of unintended data).',
    ],
    engineeringApplications: [
      {
        field: 'Financial & Banking Systems',
        example: 'Separating Account, Customer, and Transaction tables so customer profile updates never corrupt transaction ledgers.',
      },
      {
        field: 'Supply Chain & Logistics',
        example: 'Normalizing Supplier-Part-Warehouse tables to 3NF/BCNF so warehouse relocations do not alter supplier contracts.',
      },
      {
        field: 'Aerospace Flight Management',
        example: 'Decoupling Flight-Crew-Aircraft relations ensuring maintenance log updates remain fully independent of crew rosters.',
      },
    ],
    keyTakeaway: 'Normalization up to BCNF guarantees that every determinant is a candidate key, eliminating data redundancy while maintaining mathematical lossless join equivalence.',
    assumptionsOrLimitations: [
      'BCNF decompositions may occasionally sacrifice functional dependency preservation, requiring 3NF trade-offs in write-heavy transactional systems.',
    ],
  },

  'u25cs311-java-program-structure': {
    summary: 'Visualizes the end-to-end Java object-oriented compilation, bytecode execution, and JVM runtime memory architecture.',
    whatIsHappening: 'Source code is compiled into platform-neutral bytecode verified by the JVM ClassLoader and mapped into Stack Frames, Heap Objects, and Metaspace static storage with dynamic method dispatch.',
    whereUsed: [
      'Enterprise backend web systems (Spring Boot, Jakarta EE, Quarkus).',
      'Android mobile application runtimes (ART / Dalvik Android bytecode).',
      'Distributed big data processing platforms (Apache Spark, Apache Kafka, Apache Flink).',
      'High-throughput financial trading and banking clearing platforms.',
    ],
    whenUsed: [
      'When architecting scalable object-oriented enterprise domain models.',
      'During memory leak profiling and GC optimization of heap and stack usage.',
      'When designing multi-threaded concurrent services requiring thread safety and synchronization.',
    ],
    whyUsed: [
      'Write Once, Run Anywhere (WORA) philosophy allows Java code compiled once on any machine to run deterministically across all operating systems without recompilation.',
    ],
    engineeringApplications: [
      {
        field: 'Enterprise Software & Cloud',
        example: 'Architecting decoupled microservice domains utilizing interfaces and runtime dependency injection.',
      },
      {
        field: 'Distributed Stream Computing',
        example: 'Serializing distributed data objects safely across Kafka cluster broker partitions.',
      },
      {
        field: 'Fintech Core Banking',
        example: 'Implementing strict encapsulation and custom exception rollbacks for multi-party transaction processing.',
      },
    ],
    keyTakeaway: 'Java encapsulates program state inside heap objects accessed via stack reference pointers, executing cross-platform via intermediate bytecode and virtual method dynamic dispatch.',
    assumptionsOrLimitations: [
      'Garbage collector pauses (Stop-the-World) may introduce non-deterministic microsecond latencies in ultra-low-latency high-frequency trading applications.',
    ],
  },

  'u25ma401-boolean-algebra': {
    summary: 'Axiomatic foundation of digital computing, combinational circuit synthesis, database query optimization, and formal verification.',
    whatIsHappening: 'Boolean algebra models binary switching variables {0, 1} governed by Huntington postulates, duality, and logical connectives. It translates mathematical theorems directly into physical logic gates, relational algebraic query planners, and software control flow.',
    whereUsed: [
      'VLSI digital circuit synthesis and logic gate minimization (EDA tools like Synopsys and Cadence).',
      'SQL query engine predicates and indexing optimization (De Morgan transformations).',
      'Formal software verification and theorem proving in safety-critical avionics.',
      'Cryptographic S-box and boolean function resistance against linear and differential cryptanalysis.',
    ],
    whenUsed: [
      'During register-transfer level (RTL) logic minimization to reduce silicon chip area and propagation delay.',
      'When compiling complex conditional clauses into branchless bitwise operations.',
      'In compiler static analysis to eliminate dead code and evaluate constant conditional branches.',
    ],
    whyUsed: [
      'Physical electronic transistors operate as binary saturation switches. Boolean algebra provides the exact formal algebra needed to mathematically design, verify, and minimize billion-transistor microprocessors without gate-level trial and error.',
    ],
    engineeringApplications: [
      {
        field: 'Microprocessor Architecture',
        example: 'Designing Arithmetic Logic Units (ALUs) and fast carry-lookahead adders using optimized boolean minimal forms.',
      },
      {
        field: 'Distributed Consensus & Blockchain',
        example: 'Validating cryptographic multisig spending scripts and boolean predicate verification rules in smart contracts.',
      },
    ],
    keyTakeaway: 'Discrete mathematics forms the mathematical spine of computing: boolean algebra reduces silicon complexity, graph theory routes network packets, and propositional logic verifies formal software correctness.',
    assumptionsOrLimitations: [
      'Assumes two-valued binary logic; does not model ternary quantum superpositions or fuzzy multi-valued logics without domain extension.',
    ],
  },

  'u25cs403-linear-binary-search': {
    summary: 'Foundational algorithmic search and divide-and-conquer paradigm applied across high-throughput distributed database engines, kernel symbol lookups, and branch-prediction hardware.',
    whatIsHappening: 'Binary search establishes an O(log n) logarithmic reduction over sorted monotonic sequences by continually partitioning the search space around the midpoint. It contrasts with linear scan O(n) when indexing overhead is amortized over millions of queries.',
    whereUsed: [
      'Database B-Tree and LSM-tree SSTable block indexing (e.g., PostgreSQL, RocksDB, SQLite).',
      'Operating system memory management (virtual memory range lookups in page tables).',
      'Git bisect debugging automation for locating regression commits across repository history.',
      'Network routing table Longest Prefix Match (LPM) implementations.',
    ],
    whenUsed: [
      'When search queries dramatically outnumber update/insert operations, justifying sorting or indexing overhead.',
      'When determining monotonic predicate boundaries (e.g., binary search over monotonic answer spaces).',
      'In cache-conscious binary searches on contiguous memory arrays.',
    ],
    whyUsed: [
      'For n = 1,000,000,000 items, linear search requires up to 1 billion comparisons, whereas binary search resolves in at most 30 comparisons—a 33-million-fold speedup critical for real-time systems.',
    ],
    engineeringApplications: [
      {
        field: 'Distributed Storage Systems',
        example: 'Locating row keys in Apache Cassandra / RocksDB sorted SSTables via sparse index binary search.',
      },
      {
        field: 'High-Frequency Trading & FinTech',
        example: 'Matching limit order prices in microsecond order book ladders using cache-aligned binary search.',
      },
    ],
    keyTakeaway: 'Algorithm design transforms intractable polynomial-time workloads into logarithmic or near-linear subroutines. Understanding asymptotic complexity, invariant correctness, and divide-and-conquer underpins all scalable computing infrastructure.',
    assumptionsOrLimitations: [
      'Requires random access (O(1) indexing) and strictly sorted or monotonic sequences.',
    ],
  },
  'u25me401-manufacturing-tech-2': {
    summary: 'Advanced manufacturing engineering suite covering CNC tool path generation, non-traditional electro-physical machining, welding metallurgy, casting mould design, bulk metal forming, and multi-criteria process selection.',
    whatIsHappening: 'Interactive simulation suite simulating 3-axis CNC milling G-code tool paths, spark erosion (EDM), Faraday dissolution (ECM), photonic sublimation (Laser), hydrodynamic momentum (Water Jet), weld heat input and bead solidification, Chvorinov riser modulus design, and bulk plastic deformation forces.',
    whereUsed: [
      'Aerospace propulsion component manufacturing (Inconel turbine disk EDM, blisk ECM profiling, laser drill cooling holes).',
      'Automotive body and powertrain plants (robotic GMAW body frames, progressive die metal stamping, crankshaft hot die forging).',
      'Precision tooling and die shops (hardened D2 tool steel cavity sinker EDM, multi-axis CNC surface profiling).',
      'Heavy structural fabrication yards (pressure vessel submerged/shielded arc welding, cold drawing seamless alloy tubes).',
    ],
    whenUsed: [
      'When workpiece material hardness exceeds 45-50 HRC where conventional cutting tools exhibit catastrophic abrasive wear.',
      'When micro-scale features, high aspect ratio cooling orifices, or burr-free thin-walled geometries are specified.',
      'When high-volume near-net-shape manufacturing mandates bulk plastic deformation (forging/extrusion) to optimize grain flow and fatigue resistance.',
      'When casting complex hollow internal passages using riser modulus and sprue choke velocity control.',
    ],
    whyUsed: [
      'Advanced manufacturing processes bypass mechanical shear strength limitations through electrical spark erosion, anodic electrochemical dissolution, photonic sublimation, or hydrodynamic momentum, achieving sub-micron surface finishes and tolerances while forming processes maximize metallurgical grain orientation.',
    ],
    engineeringApplications: [
      {
        field: 'Aerospace & Gas Turbine Engineering',
        example: 'Drilling micro cooling film holes in ceramic-coated single-crystal nickel superalloy turbine blades using picosecond Nd:YAG Laser Beam Machining without micro-cracks or heat-affected zones.',
      },
      {
        field: 'Biomedical & Medical Implants',
        example: 'Machining Ti-6Al-4V orthopedic femoral components using high-speed 3-axis CNC profiling followed by wire EDM for zero-stress surgical surface topography.',
      },
      {
        field: 'Nuclear & Offshore Energy Structures',
        example: 'Multi-pass GTAW root and GMAW fill passes for duplex stainless steel pipeline joints with controlled heat input (H < 1.5 kJ/mm) preventing intermetallic phase precipitation.',
      },
    ],
    keyTakeaway: 'Manufacturing process selection balances thermodynamic feasibility, material hardness, feature resolution, structural grain alignment, production volume, and cycle time economics. Understanding chip formation mechanics, thermal dissipation, fluid dynamics, and plasticity enables robust production of mission-critical hardware.',
    assumptionsOrLimitations: [
      'CNC tool paths assume rigid spindle and workpiece holding without chatter deflection.',
      'Thermal HAZ models assume 1D/2D semi-infinite heat conduction without microstructural phase transition kinetics.',
      'Fluid jet and pouring flows assume Newtonian incompressible behavior under ambient atmospheric pressure.',
    ],
  },
  'u25me402-thermal-engineering': {
    summary: 'Comprehensive Thermal Engineering suite covering Fourier conduction, Newton convection, Stefan-Boltzmann radiation, composite wall thermal resistance, counter/parallel flow heat exchangers (LMTD & ε-NTU), industrial steam boilers (equivalent evaporation & heat balance), vapor compression refrigeration (VCR cycle & COP), and Steady Flow Energy Equation (SFEE).',
    whatIsHappening: 'Interactive thermal physics engine calculating heat transfer rates, temperature distributions along solid walls and heat exchanger flow paths, boiler efficiency and steam enthalpy, refrigeration enthalpies across compressor/condenser/expansion valve/evaporator, and enthalpy balances for open thermodynamic control volumes.',
    whereUsed: [
      'Thermal and nuclear power stations (steam drum boilers, economizers, superheaters, condensers, cooling towers).',
      'HVAC&R industrial and commercial systems (chillers, cold storage warehouses, heat pump climate control).',
      'Aerospace propulsion and heat dissipation (gas turbine blade cooling, spacecraft radiative thermal shields, avionics heat sinks).',
      'Chemical and petrochemical processing plants (multi-pass shell-and-tube exchangers, furnace refractories, reboilers).',
    ],
    whenUsed: [
      'Designing thermal insulation systems to minimize heat loss or prevent surface condensation using critical radius criteria.',
      'Sizing heat exchangers for process fluids using LMTD and ε-NTU methods under variable mass flow rates.',
      'Auditing industrial boiler thermal efficiency and steam generation capacity based on fuel calorific values.',
      'Evaluating refrigerating capacity, power consumption, and COP across diverse operating evaporator/condenser saturation temperatures.',
    ],
    whyUsed: [
      'Thermal engineering principles govern energy transformation, thermal efficiency limits (Carnot & Second Law), and heat transfer kinetics. Accurate modeling of conduction, convection, radiation, and phase change prevents equipment overheating, optimizes fuel economy, and reduces carbon footprint.',
    ],
    engineeringApplications: [
      {
        field: 'Power Generation & Supercritical Boilers',
        example: 'Calculating equivalent evaporation and factor of evaporation for pulverized coal and biomass water-tube boilers operating at 180 bar and 540°C.',
      },
      {
        field: 'HVAC & Commercial Cold Chain',
        example: 'Optimizing coefficient of performance (COP) and compressor work for supermarket sub-zero R134a/R410A refrigeration units with subcooling and superheating.',
      },
      {
        field: 'Automotive & Aerospace Thermal Management',
        example: 'Designing compact aluminium plate-fin counter-flow heat exchangers and composite thermal barrier coatings (TBC) for EV battery packs and turbocharger intercoolers.',
      },
    ],
    keyTakeaway: 'First and Second Laws of Thermodynamics combined with heat transfer rate equations provide the deterministic foundation for sizing energy conversion hardware. Proper thermal design balances heat transfer enhancement (higher h or A) against pumping power penalties and material thermal stress.',
    assumptionsOrLimitations: [
      'Conduction models assume steady 1D heat flow with isotropic constant thermal conductivities.',
      'Heat exchanger calculations assume well-insulated shells with negligible environmental heat loss.',
      'Steam boiler and refrigeration models assume quasi-steady state conditions with constant average specific heat capacities.',
    ],
  },
};

/**
 * Returns the verified Real-World & Engineering Context for any simulation.
 * Looks up direct match by ID, or checks for subject-level match.
 */
export function getEngineeringContext(id?: string): ISimulationEngineeringContext | undefined {
  if (!id) return undefined;
  
  // Direct ID lookup
  if (ENGINEERING_CONTEXT_REGISTRY[id]) {
    return ENGINEERING_CONTEXT_REGISTRY[id];
  }

  const cleanId = id.toLowerCase().trim();
  if (ENGINEERING_CONTEXT_REGISTRY[cleanId]) {
    return ENGINEERING_CONTEXT_REGISTRY[cleanId];
  }

  // Alias lookups for common simulations
  if (cleanId.startsWith('u25cs403') || cleanId.startsWith('u21cs401') || cleanId.startsWith('daa-') || cleanId.includes('algorithm') || cleanId.includes('master-theorem') || cleanId.includes('knapsack') || cleanId.includes('nqueens')) return ENGINEERING_CONTEXT_REGISTRY['u25cs403-linear-binary-search'];
  if (cleanId.startsWith('u25ma401') || cleanId.startsWith('u21mag02') || cleanId.startsWith('dm-') || cleanId.includes('discrete') || cleanId.includes('boolean-algebra') || cleanId.includes('kmap') || cleanId.includes('truth-table')) return ENGINEERING_CONTEXT_REGISTRY['u25ma401-boolean-algebra'];
  if (cleanId.startsWith('u25cs311') || cleanId.startsWith('java-') || cleanId.includes('oop') || cleanId.includes('jvm')) return ENGINEERING_CONTEXT_REGISTRY['u25cs311-java-program-structure'];
  if (cleanId.startsWith('u25cs401') || cleanId.startsWith('dbms-') || cleanId.startsWith('sql-') || cleanId.includes('database') || cleanId.includes('normalization') || cleanId.includes('serializab')) return ENGINEERING_CONTEXT_REGISTRY['u25cs401-normalization-workshop'];
  if (cleanId.startsWith('u25cs305') || cleanId.startsWith('coa-') || cleanId.includes('pipeline') || cleanId.includes('datapath') || cleanId.includes('architecture')) return ENGINEERING_CONTEXT_REGISTRY['u25cs305-pipeline-stages'];
  if (cleanId.startsWith('u25ma301') || cleanId.startsWith('ps-') || cleanId.includes('probability') || cleanId.includes('queueing')) return ENGINEERING_CONTEXT_REGISTRY['u25ma301-queueing-models'];
  if (cleanId.startsWith('u25ma402') || cleanId.includes('numerical-methods') || cleanId.includes('bisection') || cleanId.includes('rk4') || cleanId.includes('regula-falsi')) return ENGINEERING_CONTEXT_REGISTRY['u25ma402-numerical-methods'];
  if (cleanId.startsWith('u25me401') || cleanId.includes('manufacturing-tech-2') || cleanId.startsWith('mfg2-') || cleanId.includes('cnc-tool-path') || cleanId.includes('edm-spark') || cleanId.includes('metal-forming')) return ENGINEERING_CONTEXT_REGISTRY['u25me401-manufacturing-tech-2'];
  if (cleanId.startsWith('u25me402') || cleanId.includes('thermal-engineering') || cleanId.includes('heat-transfer') || cleanId.includes('composite-wall') || cleanId.includes('heat-exchanger') || cleanId.includes('steam-boiler') || cleanId.includes('refrigeration')) return ENGINEERING_CONTEXT_REGISTRY['u25me402-thermal-engineering'];
  if (cleanId.startsWith('u25cs201') || cleanId.startsWith('py-') || cleanId.includes('python')) return ENGINEERING_CONTEXT_REGISTRY['u25cs201-execution-visualizer'];
  if (cleanId.startsWith('u25cs202') || cleanId.startsWith('sh-') || cleanId.includes('terminal')) return ENGINEERING_CONTEXT_REGISTRY['u25cs202-terminal-basics'];
  if (cleanId.includes('eigen')) return ENGINEERING_CONTEXT_REGISTRY['ma-eigen'];
  if (cleanId.includes('linear-system') || cleanId.includes('linear_system')) return ENGINEERING_CONTEXT_REGISTRY['u25rma201-linear-systems'];
  if (cleanId.includes('partial')) return ENGINEERING_CONTEXT_REGISTRY['ma-partial'];
  if (cleanId.includes('lagrange')) return ENGINEERING_CONTEXT_REGISTRY['ma-lagrange'];
  if (cleanId.includes('jacobian')) return ENGINEERING_CONTEXT_REGISTRY['ma-jacobian'];
  if (cleanId.includes('ode') || cleanId.includes('differential')) return ENGINEERING_CONTEXT_REGISTRY['ma-ode2'];
  if (cleanId.includes('green')) return ENGINEERING_CONTEXT_REGISTRY['ma-green'];
  if (cleanId.includes('gauss') || cleanId.includes('divergence')) return ENGINEERING_CONTEXT_REGISTRY['ma-gauss'];
  if (cleanId.includes('quantum-well') || cleanId.includes('quantum_well')) return ENGINEERING_CONTEXT_REGISTRY['u25rphu02-quantum-well'];
  if (cleanId.includes('tunnelling') || cleanId.includes('tunneling')) return ENGINEERING_CONTEXT_REGISTRY['u25rphu02-tunnelling'];
  if (cleanId.includes('bloch')) return ENGINEERING_CONTEXT_REGISTRY['u25rphu02-bloch-sphere'];
  if (cleanId.includes('ohms') || cleanId.includes('ohm')) return ENGINEERING_CONTEXT_REGISTRY['EXP-P10-01'];
  if (cleanId.includes('fuel-cell') || cleanId.includes('fuel_cell')) return ENGINEERING_CONTEXT_REGISTRY['chem-fuel-cell'];
  if (cleanId.includes('lithium') || cleanId.includes('battery')) return ENGINEERING_CONTEXT_REGISTRY['chem-lithium-ion'];
  if (cleanId.includes('galvanic') || cleanId.includes('corrosion')) return ENGINEERING_CONTEXT_REGISTRY['chem-galvanic-corrosion'];
  if (cleanId.includes('osmosis') || cleanId.includes('ro')) return ENGINEERING_CONTEXT_REGISTRY['chem-reverse-osmosis'];
  if (cleanId.includes('ion-exchange') || cleanId.includes('demineral')) return ENGINEERING_CONTEXT_REGISTRY['chem-ion-exchange'];
  if (cleanId.includes('titration') || cleanId.includes('acid-base')) return ENGINEERING_CONTEXT_REGISTRY['EXP-C11-02'];

  return undefined;
}
