/**
 * pdc-catalog.js
 * Principles of Data Communication (U21IT201) — 42 Simulations Catalog
 * Regulation R2021 CBCS · Semester II · B.Tech IT
 * 
 * 5 Units:
 * Unit I: Introduction (Sims 1-9)
 * Unit II: Amplitude Modulation (Sims 10-18)
 * Unit III: Angle Modulation (Sims 19-26)
 * Unit IV: Digital Modulation (Sims 27-34)
 * Unit V: Data Communication (Sims 35-42)
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EduversePDCCatalog = factory();
    root.PDC_CATALOG = root.EduversePDCCatalog;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const UNITS = [
    { number: 1, unit: 1, title: 'Introduction', code: 'UNIT I' },
    { number: 2, unit: 2, title: 'Amplitude Modulation', code: 'UNIT II' },
    { number: 3, unit: 3, title: 'Angle Modulation', code: 'UNIT III' },
    { number: 4, unit: 4, title: 'Digital Modulation', code: 'UNIT IV' },
    { number: 5, unit: 5, title: 'Data Communication', code: 'UNIT V' }
  ];

  const SIMULATIONS = [
    // ══════════════════════════════════════════════════════════
    // UNIT I — INTRODUCTION
    // ══════════════════════════════════════════════════════════
    {
      id: 'comm-elements',
      unit: 1,
      unitTitle: 'Introduction',
      topic: 'Communication System Elements',
      title: 'Communication System Elements Visualizer',
      icon: '📡',
      flagship: false,
      tier: 1,
      description: 'Interactive signal flow through Information Source → Transmitter → Channel (Noise) → Receiver → Destination.',
      formula: 'v_{out}(t) = \mathcal{F}^{-1}\{H(f) \cdot \mathcal{F}[v_{in}(t)]\} + n(t)',
      defaultParams: { activeStage: 0, noiseLevel: 0.15, signalFreq: 2, channelType: 'wireless' },
      challenge: {
        goal: 'Select the stage responsible for modulating the message onto the carrier frequency and identify where thermal noise is added.',
        targetStage: 'Transmitter',
        noiseStage: 'Channel'
      }
    },
    {
      id: 'bandwidth-sim',
      unit: 1,
      unitTitle: 'Introduction',
      topic: 'Bandwidth & Spectrum',
      title: 'Bandwidth Simulator',
      icon: '📊',
      flagship: false,
      tier: 2,
      description: 'Analyze signal spectrum, harmonic frequency range, and bandwidth $B = f_{max} - f_{min}$ dynamically.',
      formula: 'B = f_{high} - f_{low} \\quad | \\quad v(t) = \\sum_{n=1}^N A_n \\sin(2\\pi n f_0 t)',
      defaultParams: { fLow: 300, fHigh: 3400, signalType: 'voice', harmonics: 5 },
      challenge: {
        goal: 'Configure the filter bandwidth to accommodate standard human speech (300 Hz to 3400 Hz) with zero cutoff distortion.',
        targetBandwidth: 3100
      }
    },
    {
      id: 'comm-channel',
      unit: 1,
      unitTitle: 'Introduction',
      topic: 'Communication Channels',
      title: 'Communication Channel Simulator',
      icon: '〰️',
      flagship: false,
      tier: 2,
      description: 'Visualize channel distortion, attenuation, AWGN noise, and bandwidth limitation on transmitted waveforms.',
      formula: 'r(t) = \\alpha \\cdot s(t - \\tau) + w(t), \\quad \\text{SNR} = 10\\log_{10}(P_s / P_n)',
      defaultParams: { attenuation: 0.4, snrDb: 18, delayMs: 12, medium: 'coaxial' },
      challenge: {
        goal: 'Maintain received signal SNR above 20 dB by optimizing transmit power against 15 dB line attenuation.',
        targetSnr: 20
      }
    },
    {
      id: 'comm-class',
      unit: 1,
      unitTitle: 'Introduction',
      topic: 'Classification of Communication',
      title: 'Classification of Communication Systems',
      icon: '🗂️',
      flagship: false,
      tier: 2,
      description: 'Interactive visual hierarchy: Analog vs Digital, Baseband vs Bandpass, Guided (Wired) vs Unguided (Wireless).',
      formula: '\\text{Classification} \\in \\{\\text{Physical Medium}, \\text{Nature of Signal}, \\text{Transmission Mode}\\}',
      defaultParams: { criteria: 'medium', subType: 'guided' },
      challenge: {
        goal: 'Classify Optical Fiber communication correctly under Medium, Signal nature, and Directionality modes.',
        answer: ['guided', 'digital', 'duplex']
      }
    },
    {
      id: 'comm-types',
      unit: 1,
      unitTitle: 'Introduction',
      topic: 'Types of Communication',
      title: 'Types of Communication (Simplex / Duplex)',
      icon: '🔁',
      flagship: false,
      tier: 2,
      description: 'Simulate Simplex (Broadcasting), Half-Duplex (Walkie-Talkie), and Full-Duplex (Telephone) data exchange flows.',
      formula: '\\text{Throughput}_{FD} = 2 \\times \\text{Throughput}_{HD} \\quad \\text{when channel is fully utilized}',
      defaultParams: { mode: 'half-duplex', activeNode: 'A', packetCount: 4 },
      challenge: {
        goal: 'Switch to Full-Duplex mode and ensure bidirectional simultaneous data packet transfer without collision.',
        targetMode: 'full-duplex'
      }
    },
    {
      id: 'mod-process',
      unit: 1,
      unitTitle: 'Introduction',
      topic: 'Modulation Process',
      title: 'Modulation Process Visualizer',
      icon: '🎛️',
      flagship: false,
      tier: 1,
      description: 'Observe real-time synthesis: Baseband Message $m(t)$ + High Frequency Carrier $c(t) \\rightarrow$ Modulated Wave.',
      formula: 's(t) = A(t) \\cos(\\omega_c t + \\phi(t)), \\quad \\lambda = \\frac{c}{f} \\implies \\text{Antenna Size} \\approx \\frac{\\lambda}{4}',
      defaultParams: { msgFreq: 2, carrierFreq: 20, modType: 'AM', modIndex: 0.8 },
      challenge: {
        goal: 'Tune carrier frequency to show why higher frequencies dramatically reduce required antenna height $\\lambda/4$.',
        targetFreq: 30
      }
    },
    {
      id: 'analog-vs-digital',
      unit: 1,
      unitTitle: 'Introduction',
      topic: 'Analog vs Digital',
      title: 'Analog vs Digital Communication Comparison',
      icon: '🔄',
      flagship: false,
      tier: 2,
      description: 'Side-by-side comparison of continuous sinusoidal signals vs discrete pulse trains under noise and repeaters.',
      formula: '\\text{Analog:} \\; s(t) \\in \\mathbb{R}, \\quad \\text{Digital:} \\; s(t) = \\sum b_k p(t - kT)',
      defaultParams: { noiseLevel: 0.35, repeaterType: 'regenerative', viewMode: 'split' },
      challenge: {
        goal: 'Demonstrate how regenerative repeaters clean digital noise completely unlike analog amplifiers.',
        repeater: 'regenerative'
      }
    },
    {
      id: 'comm-limits',
      unit: 1,
      unitTitle: 'Introduction',
      topic: 'Limitations of Communication',
      title: 'Fundamental Limitations (Nyquist & Shannon)',
      icon: '⚖️',
      flagship: false,
      tier: 2,
      description: 'Interactive boundary calculator for Shannon-Hartley Capacity and Nyquist Maximum Data Rate with thermal noise.',
      formula: 'C = B \\log_2(1 + \\text{SNR}), \\quad C_{\\text{Nyquist}} = 2B \\log_2(M), \\quad N_0 = k T B',
      defaultParams: { bandwidthKhz: 4, snrDb: 30, levels: 4 },
      challenge: {
        goal: 'Calculate and match the Shannon capacity for a 3 kHz telephone line with 30 dB SNR (~30 kbps).',
        targetCapacity: 29.9
      }
    },
    {
      id: 'comm-apps',
      unit: 1,
      unitTitle: 'Introduction',
      topic: 'Applications of Communication',
      title: 'Applications of Electronic Communication Map',
      icon: '🗺️',
      flagship: false,
      tier: 2,
      description: 'Interactive electromagnetic spectrum map linking LF, MF, HF, VHF, UHF, Satellite, and Fiber to real-world applications.',
      formula: 'f \\in [30\\text{ kHz}, 300\\text{ GHz}], \\quad \\text{Applications:} \\; \\text{AM/FM, Radar, Cellular 5G, GPS, Wi-Fi}',
      defaultParams: { selectedBand: 'VHF', appCategory: 'Broadcasting' },
      challenge: {
        goal: 'Identify the exact frequency band and modulation method used for standard FM stereo broadcasting (88-108 MHz).',
        band: 'VHF',
        mod: 'FM'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT II — AMPLITUDE MODULATION
    // ══════════════════════════════════════════════════════════
    {
      id: 'am-fdm',
      unit: 2,
      unitTitle: 'Amplitude Modulation',
      topic: 'Frequency Division Multiplexing',
      title: 'Frequency Division Multiplexing (FDM)',
      icon: '📶',
      flagship: false,
      tier: 1,
      description: 'Multiplex multiple baseband signals onto separate RF subcarrier bands with customizable guard bands.',
      formula: 'S_{\\text{FDM}}(f) = \\sum_{i=1}^N S_i(f - f_{c,i}), \\quad B_{\\text{total}} = \\sum B_i + (N-1)B_{\\text{guard}}',
      defaultParams: { numChannels: 3, guardBandKhz: 4, channelBwKhz: 10, centerFreq: 100 },
      challenge: {
        goal: 'Configure 3 FDM channels with 10 kHz bandwidth and 5 kHz guard bands without spectral overlap.',
        requiredTotalBw: 40
      }
    },
    {
      id: 'am-tdm',
      unit: 2,
      unitTitle: 'Amplitude Modulation',
      topic: 'Time Division Multiplexing',
      title: 'Time Division Multiplexing (TDM)',
      icon: '⏱️',
      flagship: false,
      tier: 1,
      description: 'Commutator & De-commutator time slot visualization interleaving samples from multiple digital/analog channels.',
      formula: 'T_{\\text{frame}} = \\frac{1}{f_s} = N \\cdot T_{\\text{slot}}, \\quad \\text{Bit Rate} = N \\cdot n \\cdot f_s',
      defaultParams: { channels: 4, samplingRate: 8000, slotTimeUs: 31.25, frameSync: true },
      challenge: {
        goal: 'Allocate time slots equally for 4 voice channels sampled at 8 kHz (125 us frame time).',
        targetFrameTime: 125
      }
    },
    {
      id: 'am-principle',
      unit: 2,
      unitTitle: 'Amplitude Modulation',
      topic: 'AM Principle & Waveforms',
      title: 'AM Principle Simulator ⭐ (Flagship)',
      icon: '⚡',
      flagship: true,
      tier: 1,
      description: 'Flagship AM laboratory displaying simultaneous Message $m(t)$, Carrier $c(t)$, and Envelope-Modulated $s_{AM}(t)$.',
      formula: 's_{\\text{AM}}(t) = A_c [1 + m \\cdot \\cos(\\omega_m t)] \\cos(\\omega_c t), \\quad m = \\frac{A_m}{A_c}',
      defaultParams: { Am: 2.0, Ac: 3.0, fm: 2, fc: 25, phase: 0 },
      challenge: {
        goal: 'Adjust message amplitude $A_m$ and carrier amplitude $A_c$ to achieve critical modulation ($m = 1.0$).',
        targetModIndex: 1.0
      }
    },
    {
      id: 'am-spectrum',
      unit: 2,
      unitTitle: 'Amplitude Modulation',
      topic: 'AM Frequency Spectrum',
      title: 'Spectrum of AM Wave (Carrier & Sidebands)',
      icon: '📈',
      flagship: false,
      tier: 1,
      description: 'Interactive frequency spectrum showing Carrier frequency $f_c$, Upper Sideband $f_c+f_m$, Lower Sideband $f_c-f_m$.',
      formula: 'B_{\\text{AM}} = 2 f_m, \\quad \\text{LSB} = f_c - f_m, \\quad \\text{USB} = f_c + f_m',
      defaultParams: { fc: 100, fm: 5, modIndex: 0.75 },
      challenge: {
        goal: 'Set carrier to 100 kHz and message to 8 kHz. Verify the AM transmission bandwidth is exactly 16 kHz.',
        targetBw: 16
      }
    },
    {
      id: 'am-mod-index',
      unit: 2,
      unitTitle: 'Amplitude Modulation',
      topic: 'Modulation Index & Percentage',
      title: 'Modulation Index & Percentage Modulation',
      icon: '📐',
      flagship: false,
      tier: 1,
      description: 'Calculate modulation index $m = (V_{max}-V_{min})/(V_{max}+V_{min})$ and visualize under, critical, and over-modulation envelope distortion.',
      formula: 'm = \\frac{V_{max} - V_{min}}{V_{max} + V_{min}} = \\frac{A_m}{A_c}, \\quad \\%M = m \\times 100\\%',
      defaultParams: { Vmax: 5.0, Vmin: 1.0, showEnvelope: true },
      challenge: {
        goal: 'Identify overmodulation ($m > 1.0$) causing envelope phase-reversal distortion and set $m = 0.5$ for safe 50% modulation.',
        targetM: 0.5
      }
    },
    {
      id: 'am-power',
      unit: 2,
      unitTitle: 'Amplitude Modulation',
      topic: 'Power Content in AM',
      title: 'Power Content in AM Wave',
      icon: '⚡',
      flagship: false,
      tier: 2,
      description: 'Step-by-step interactive breakdown of Carrier Power $P_c$, Sideband Power $P_{sb}$, Total Power $P_t$, and Power Efficiency $\\eta$.',
      formula: 'P_t = P_c \\left(1 + \\frac{m^2}{2}\\right), \\quad P_{\\text{USB}} = P_{\\text{LSB}} = \\frac{m^2}{4}P_c, \\quad \\eta = \\frac{m^2}{2 + m^2}',
      defaultParams: { Pc: 100, m: 1.0, R: 50 },
      challenge: {
        goal: 'Find the maximum theoretical efficiency $\\eta$ of standard AM-DSB-FC at 100% modulation ($m=1$).',
        targetEfficiency: 33.33
      }
    },
    {
      id: 'am-tx-low',
      unit: 2,
      unitTitle: 'Amplitude Modulation',
      topic: 'Low-Level AM Transmitter',
      title: 'Low-Level AM Transmitter Block Diagram',
      icon: '📻',
      flagship: false,
      tier: 2,
      description: 'Follow audio message → low-power modulator → Class B/C linear RF power amplifiers → Antenna output.',
      formula: '\\text{Audio Source} \\rightarrow \\text{Modulator (Low Power)} \\rightarrow \\text{Linear RF Power Amp} \\rightarrow \\text{Antenna}',
      defaultParams: { activeStage: 1, drivePowerW: 2, finalPowerW: 250 },
      challenge: {
        goal: 'Identify why Class-C amplifiers cannot be used AFTER low-level modulation (requires linear Class-B/AB).',
        correctStage: 'Linear RF Amp'
      }
    },
    {
      id: 'am-tx-high',
      unit: 2,
      unitTitle: 'Amplitude Modulation',
      topic: 'High-Level AM Transmitter',
      title: 'High-Level AM Transmitter Block Diagram',
      icon: '📡',
      flagship: false,
      tier: 2,
      description: 'Trace high-efficiency Class-C RF power carrier amplification with high-power audio collector modulation at the final stage.',
      formula: '\\text{RF Carrier} \\rightarrow \\text{Class C Power Amp} \\times \\text{High Power Modulator (Audio Amp)} \\rightarrow \\text{Antenna}',
      defaultParams: { activeStage: 2, audioModPowerKw: 50, rfCarrierKw: 100 },
      challenge: {
        goal: 'Demonstrate how high-level modulation achieves 80%+ overall transmitter efficiency at megawatt broadcast levels.',
        targetEfficiency: 80
      }
    },
    {
      id: 'am-superhet',
      unit: 2,
      unitTitle: 'Amplitude Modulation',
      topic: 'Superheterodyne Receiver',
      title: 'Basic Superheterodyne Receiver Architecture',
      icon: '📻',
      flagship: false,
      tier: 1,
      description: 'Interactive stage-by-stage RF tuning, Local Oscillator mixing $f_{LO} = f_{RF} + f_{IF}$, 455 kHz IF filtering, and Envelope Detector.',
      formula: 'f_{\\text{LO}} = f_{\\text{RF}} + f_{\\text{IF}}, \\quad f_{\\text{IF}} = 455\\text{ kHz}, \\quad f_{\\text{image}} = f_{\\text{RF}} + 2 f_{\\text{IF}}',
      defaultParams: { rfFreqKhz: 1000, ifFreqKhz: 455, activeStage: 'Mixer' },
      challenge: {
        goal: 'Calculate the Local Oscillator frequency and Image Frequency for a station transmitting at 1200 kHz.',
        targetLo: 1655,
        targetImage: 2110
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT III — ANGLE MODULATION
    // ══════════════════════════════════════════════════════════
    {
      id: 'angle-mod',
      unit: 3,
      unitTitle: 'Angle Modulation',
      topic: 'Angle Modulation Simulator',
      title: 'Angle Modulation Simulator ⭐',
      icon: '〰️',
      flagship: false,
      tier: 1,
      description: 'Unified visual simulator for constant-amplitude angle modulation: Frequency Modulation (FM) vs Phase Modulation (PM).',
      formula: 's_{\\theta}(t) = A_c \\cos[\\theta(t)] = A_c \\cos[\\omega_c t + \\phi(t)]',
      defaultParams: { mode: 'FM', kf: 10, kp: 2, fm: 2, fc: 20 },
      challenge: {
        goal: 'Observe the instantaneous frequency variations in FM when the message voltage crosses zero vs peak values.',
        targetMode: 'FM'
      }
    },
    {
      id: 'fm-vs-pm',
      unit: 3,
      unitTitle: 'Angle Modulation',
      topic: 'FM vs PM Comparison',
      title: 'FM vs PM Phase-Frequency Relationship',
      icon: '🔀',
      flagship: false,
      tier: 1,
      description: 'Explore the mathematical derivative/integral link: FM frequency deviation is $\\propto m(t)$, while PM is $\\propto \\frac{dm(t)}{dt}$.',
      formula: '\\omega_i(t)_{\\text{FM}} = \\omega_c + k_f m(t), \\quad \\omega_i(t)_{\\text{PM}} = \\omega_c + k_p \\frac{dm(t)}{dt}',
      defaultParams: { waveShape: 'square', freq: 2, kf: 8, kp: 1.5 },
      challenge: {
        goal: 'Apply a square wave message and observe why PM produces sharp phase impulses while FM maintains two steady frequencies.',
        signalShape: 'square'
      }
    },
    {
      id: 'fm-wave',
      unit: 3,
      unitTitle: 'Angle Modulation',
      topic: 'FM Wave Simulator',
      title: 'FM Wave Simulator (Deviation & Mod Index)',
      icon: '🌊',
      flagship: false,
      tier: 1,
      description: 'Interactive control over Frequency Deviation $\\Delta f = k_f A_m$, Modulation Index $\\beta = \\Delta f / f_m$, and Carson Bandwidth.',
      formula: 's_{\\text{FM}}(t) = A_c \\cos[\\omega_c t + \\beta \\sin(\\omega_m t)], \\quad B_{\\text{Carson}} = 2(\\Delta f + f_m) = 2 f_m(1 + \\beta)',
      defaultParams: { deltaFKhz: 75, fmKhz: 15, fcMhz: 100 },
      challenge: {
        goal: 'Configure commercial broadcast FM parameters ($\\Delta f = 75\\text{ kHz}, f_m = 15\\text{ kHz}$) and determine Carson Bandwidth (240 kHz).',
        targetBw: 240
      }
    },
    {
      id: 'pm-wave',
      unit: 3,
      unitTitle: 'Angle Modulation',
      topic: 'PM Wave Simulator',
      title: 'PM Wave Simulator (Phase Deviation)',
      icon: '📐',
      flagship: false,
      tier: 2,
      description: 'Visualize phase deviation $\\Delta \\theta = k_p A_m$ and phase transitions in the time domain under sinusoidal and triangular signals.',
      formula: 's_{\\text{PM}}(t) = A_c \\cos[\\omega_c t + k_p m(t)], \\quad \\Delta \\theta = k_p A_m \\text{ radians}',
      defaultParams: { kp: 2.5, Am: 1.5, fm: 2, fc: 20 },
      challenge: {
        goal: 'Adjust phase sensitivity $k_p$ to produce a maximum phase deviation of $\\pi$ radians ($180^\\circ$).',
        targetDeltaTheta: 3.14
      }
    },
    {
      id: 'fm-types',
      unit: 3,
      unitTitle: 'Angle Modulation',
      topic: 'Types of FM (NBFM vs WBFM)',
      title: 'FM Types Visualizer (Narrowband vs Wideband)',
      icon: '📊',
      flagship: false,
      tier: 2,
      description: 'Compare Narrowband FM ($\\beta \\le 0.3$, BW $\\approx 2f_m$) with Wideband FM ($\\beta > 1$, infinite Bessel sidebands $J_n(\\beta)$).',
      formula: 's_{\\text{NBFM}}(t) \\approx A_c \\cos(\\omega_c t) - A_c \\beta \\sin(\\omega_m t)\\sin(\\omega_c t), \\quad B_{\\text{WBFM}} = 2(\\Delta f + f_m)',
      defaultParams: { beta: 0.2, type: 'NBFM' },
      challenge: {
        goal: 'Switch between NBFM and WBFM to demonstrate why NBFM spectrum resembles AM with a $90^\\circ$ phase shifted LSB.',
        targetType: 'NBFM'
      }
    },
    {
      id: 'fm-vs-am',
      unit: 3,
      unitTitle: 'Angle Modulation',
      topic: 'FM vs AM Comparison',
      title: 'FM vs AM Comprehensive Side-by-Side Comparison',
      icon: '⚖️',
      flagship: false,
      tier: 2,
      description: 'Direct comparison of AM and FM: Noise immunity, transmitter power efficiency, required bandwidth, and capture effect.',
      formula: '\\text{FM SNR Advantage} = 3\\beta^2 \\left(\\frac{B}{2f_m}\\right) \\text{ over AM under AWGN noise}',
      defaultParams: { noiseLevel: 0.4, compareMetric: 'noise-immunity' },
      challenge: {
        goal: 'Introduce high noise spikes and observe how the FM amplitude limiter strips amplitude noise completely.',
        action: 'enable-limiter'
      }
    },
    {
      id: 'fm-direct',
      unit: 3,
      unitTitle: 'Angle Modulation',
      topic: 'Direct FM Generation',
      title: 'Direct FM Generation (Varactor Modulator)',
      icon: '🔬',
      flagship: false,
      tier: 2,
      description: 'Interactive Hartley/Colpitts oscillator with Varactor diode showing tank capacitance $C(v) = C_0 / \\sqrt{1 + v/V_0}$ varying frequency directly.',
      formula: 'f_0 = \\frac{1}{2\\pi \\sqrt{L C(t)}}, \\quad C(t) = C_0 - k_v m(t)',
      defaultParams: { LUh: 10, C0Pf: 100, msgVolts: 2.0 },
      challenge: {
        goal: 'Tune varactor control voltage to achieve a $50\\text{ kHz}$ frequency deviation around a $10\\text{ MHz}$ center frequency.',
        targetDev: 50
      }
    },
    {
      id: 'fm-indirect',
      unit: 3,
      unitTitle: 'Angle Modulation',
      topic: 'Indirect FM (Armstrong Method)',
      title: 'Indirect FM Generation (Armstrong Method)',
      icon: '⚙️',
      flagship: false,
      tier: 2,
      description: 'Trace Crystal Oscillator $\\rightarrow$ Phase Modulator with Integrated Audio $\\rightarrow$ Frequency Multiplier chain to generate stable WBFM.',
      formula: 'f_{c2} = n_1 \\cdot n_2 \\cdot f_{c1}, \\quad \\Delta f_2 = n_1 \\cdot n_2 \\cdot \\Delta f_1',
      defaultParams: { fCrystalKhz: 200, deltaF1Hz: 25, multTotal: 3000 },
      challenge: {
        goal: 'Calculate required frequency multiplication factor $n$ to convert $25\\text{ Hz}$ initial deviation to $75\\text{ kHz}$ broadcast deviation.',
        targetMult: 3000
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT IV — DIGITAL MODULATION
    // ══════════════════════════════════════════════════════════
    {
      id: 'info-capacity',
      unit: 4,
      unitTitle: 'Digital Modulation',
      topic: 'Information Capacity',
      title: 'Information Capacity Simulator (Hartley & Shannon)',
      icon: '💾',
      flagship: false,
      tier: 2,
      description: 'Calculate information measure $I = \\log_2(1/P)$, entropy $H = -\\sum P_i \\log_2 P_i$, and maximum channel capacity $C$.',
      formula: 'I(x_i) = \\log_2 \\frac{1}{P(x_i)}, \\quad H(X) = -\\sum_{i=1}^M P(x_i) \\log_2 P(x_i), \\quad C = B \\log_2(1 + \\text{SNR})',
      defaultParams: { p0: 0.5, p1: 0.5, bandwidthKhz: 10, snrDb: 20 },
      challenge: {
        goal: 'Maximize binary source entropy ($H = 1.0\\text{ bit/symbol}$) by making symbol probabilities equiprobable ($P_0 = P_1 = 0.5$).',
        targetEntropy: 1.0
      }
    },
    {
      id: 'bit-baud',
      unit: 4,
      unitTitle: 'Digital Modulation',
      topic: 'Bit vs Baud Rate',
      title: 'Bit / Bit Rate / Baud Visualizer',
      icon: '⏱️',
      flagship: false,
      tier: 2,
      description: 'Interactive timeline distinguishing Bit Rate $R_b = N \\times \\text{Baud}$ from Symbol Rate $S$ across Binary, QPSK ($N=2$), and 16-QAM ($N=4$).',
      formula: 'R_b = S \\cdot \\log_2(M) = S \\cdot N \\quad (\\text{bits/sec}), \\quad S = \\frac{1}{T_s} \\quad (\\text{baud})',
      defaultParams: { baudRate: 1200, modulationLevel: 4, bitSequence: '10110010' },
      challenge: {
        goal: 'Transmit a 9600 bps bitstream over a 2400 baud channel by selecting the appropriate M-ary modulation level ($M=16$).',
        targetM: 16
      }
    },
    {
      id: 'waveform-coding',
      unit: 4,
      unitTitle: 'Digital Modulation',
      topic: 'Line Coding / Waveform Coding',
      title: 'Waveform Coding Simulator (Line Codes)',
      icon: '📊',
      flagship: false,
      tier: 2,
      description: 'Compare Unipolar NRZ, Polar NRZ-L, NRZ-I, Bipolar AMI, Pseudoternary, and Manchester encoding for DC balance and clock recovery.',
      formula: '\\text{Manchester:} \\; 0 \\rightarrow \\text{High-to-Low}, \\; 1 \\rightarrow \\text{Low-to-High} \\implies \\text{Built-in Clock Sync}',
      defaultParams: { bitSequence: '10110100', codeType: 'manchester', voltage: 5 },
      challenge: {
        goal: 'Select Manchester encoding to eliminate DC baseline wander during a long sequence of consecutive binary zeros.',
        targetCode: 'manchester'
      }
    },
    {
      id: 'ask-mod',
      unit: 4,
      unitTitle: 'Digital Modulation',
      topic: 'Amplitude Shift Keying (ASK)',
      title: 'Amplitude Shift Keying — ASK Simulator ⭐ (Flagship)',
      icon: '📶',
      flagship: true,
      tier: 1,
      description: 'Digital Amplitude Modulation: Carrier ON for Bit 1, Carrier OFF for Bit 0 (OOK). Coherent and envelope demodulation.',
      formula: 's_{\\text{ASK}}(t) = \\begin{cases} A_c \\cos(2\\pi f_c t), & \\text{bit } 1 \\\\ 0, & \\text{bit } 0 \\end{cases} \\quad B = 2 R_b',
      defaultParams: { bitSequence: '10110101', fc: 10, Ac: 3, noise: 0.1 },
      challenge: {
        goal: 'Enter bit sequence 11001010 and observe envelope detection thresholding to recover the transmitted bits.',
        inputSeq: '11001010'
      }
    },
    {
      id: 'fsk-mod',
      unit: 4,
      unitTitle: 'Digital Modulation',
      topic: 'Frequency Shift Keying (FSK)',
      title: 'Frequency Shift Keying — FSK Simulator ⭐ (Flagship)',
      icon: '🌊',
      flagship: true,
      tier: 1,
      description: 'Binary FSK: Bit 1 transmitted at Mark Frequency $f_1$, Bit 0 transmitted at Space Frequency $f_0$. Phase-continuous BFSK.',
      formula: 's_{\\text{FSK}}(t) = \\begin{cases} A_c \\cos(2\\pi f_1 t), & \\text{bit } 1 \\\\ A_c \\cos(2\\pi f_0 t), & \\text{bit } 0 \\end{cases} \\quad \\Delta f = |f_1 - f_0|',
      defaultParams: { bitSequence: '10110101', f0: 6, f1: 14, Ac: 3 },
      challenge: {
        goal: 'Set Mark frequency $f_1 = 12\\text{ kHz}$ and Space frequency $f_0 = 4\\text{ kHz}$ for orthogonal FSK separation.',
        targetF0: 4,
        targetF1: 12
      }
    },
    {
      id: 'psk-mod',
      unit: 4,
      unitTitle: 'Digital Modulation',
      topic: 'Phase Shift Keying (PSK)',
      title: 'Phase Shift Keying — PSK Simulator ⭐ (Flagship)',
      icon: '🔄',
      flagship: true,
      tier: 1,
      description: 'BPSK ($0^\\circ$ for 1, $180^\\circ$ for 0) and QPSK constellation mapping with I/Q vector decomposition and phase shifts.',
      formula: 's_{\\text{BPSK}}(t) = d(t) A_c \\cos(2\\pi f_c t), \\quad d(t) \\in \\{+1, -1\\}',
      defaultParams: { bitSequence: '10110101', fc: 8, modType: 'BPSK', phaseNoise: 0 },
      challenge: {
        goal: 'Observe $180^\\circ$ carrier phase reversal at every bit transition from 0 to 1 or 1 to 0.',
        targetPhase: 180
      }
    },
    {
      id: 'dpsk-mod',
      unit: 4,
      unitTitle: 'Digital Modulation',
      topic: 'Differential PSK (DPSK)',
      title: 'Differential Phase Shift Keying — DPSK Simulator',
      icon: '🔀',
      flagship: false,
      tier: 2,
      description: 'Non-coherent differential encoding: Bit 1 induces a $180^\\circ$ phase change from the previous bit, Bit 0 maintains current phase.',
      formula: 'd_k = d_{k-1} \\oplus b_k, \\quad s_{\\text{DPSK}}(t) = A_c \\cos(2\\pi f_c t + \\theta_k)',
      defaultParams: { bitSequence: '10110101', referenceBit: '1', fc: 8 },
      challenge: {
        goal: 'Perform differential encoding on bitstream 101100 and decode using 1-bit delay multiplier without carrier phase sync.',
        input: '101100'
      }
    },
    {
      id: 'ber-calc',
      unit: 4,
      unitTitle: 'Digital Modulation',
      topic: 'Probability of Error / BER',
      title: 'Probability of Error & Bit Error Rate (BER)',
      icon: '📉',
      flagship: false,
      tier: 2,
      description: 'Monte Carlo bit transmission across AWGN channel with Waterfall BER vs $E_b/N_0$ curves for ASK, FSK, and BPSK.',
      formula: 'P_{e,\\text{BPSK}} = Q\\left(\\sqrt{\\frac{2E_b}{N_0}}\\right), \\quad P_{e,\\text{FSK}} = Q\\left(\\sqrt{\\frac{E_b}{N_0}}\\right), \\quad \\text{BER} = \\frac{N_{\\text{errors}}}{N_{\\text{total}}}',
      defaultParams: { ebN0Db: 6, modulation: 'BPSK', totalBits: 1000 },
      challenge: {
        goal: 'Achieve $BER < 10^{-4}$ by increasing $E_b/N_0$ to at least 8.4 dB under BPSK modulation.',
        targetBer: 0.0001
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT V — DATA COMMUNICATION
    // ══════════════════════════════════════════════════════════
    {
      id: 'ascii-vis',
      unit: 5,
      unitTitle: 'Data Communication',
      topic: 'Character Codes (ASCII)',
      title: 'ASCII Code Interactive Visualizer',
      icon: '🔤',
      flagship: false,
      tier: 2,
      description: 'Convert characters to 7-bit/8-bit ASCII, Binary, Hexadecimal, and transmission waveforms with Start/Stop framing.',
      formula: '\\text{Char} \\xrightarrow{\\text{ASCII}} \\text{Decimal} \\xrightarrow{\\text{Radix 2}} \\text{Binary Byte} + \\text{Parity Bit}',
      defaultParams: { inputChar: 'K', parity: 'even', includeFraming: true },
      challenge: {
        goal: 'Encode letter "A" (ASCII 65 = 01000001) and generate the even parity bit (0).',
        char: 'A',
        expectedBinary: '010000010'
      }
    },
    {
      id: 'barcode-vis',
      unit: 5,
      unitTitle: 'Data Communication',
      topic: 'Barcode Technology',
      title: 'Barcode Visualizer (1D Code 39 & UPC / 2D QR)',
      icon: '|||',
      flagship: false,
      tier: 2,
      description: 'Encode alphanumeric strings into optical barcode bar/space widths and simulate laser/CCD scanning and decoding.',
      formula: '\\text{Width Ratio} = \\frac{\\text{Wide Bar}}{\\text{Narrow Bar}} = 2.2 \\text{ to } 3.0, \\quad \\text{Check Digit} = (10 - (\\sum \\dots \\pmod{10})) \\pmod{10}',
      defaultParams: { codeType: 'code39', textData: 'EDU2026', scanSpeed: 1 },
      challenge: {
        goal: 'Encode "KPRIET" into Code 39 with standard start/stop asterisk (*) delimiters and scan to decode.',
        text: 'KPRIET'
      }
    },
    {
      id: 'error-detect',
      unit: 5,
      unitTitle: 'Data Communication',
      topic: 'Error Detection Techniques',
      title: 'Error Detection Simulator ⭐ (Flagship)',
      icon: '🛡️',
      flagship: true,
      tier: 1,
      description: 'Comprehensive error detection lab: Simple Parity (VRC), Longitudinal (LRC), Checksum, and CRC-8 / CRC-16 Polynomial Division.',
      formula: 'T(x) = D(x) \\cdot x^r + R(x), \\quad \\text{where } R(x) = [D(x) \\cdot x^r] \\pmod{G(x)}',
      defaultParams: { method: 'CRC-8', dataBits: '11010110', generator: '10011', injectErrorBit: 3 },
      challenge: {
        goal: 'Transmit data 10100011 with CRC generator polynomial $G(x) = x^4 + x + 1$ (10011), inject a bit flip, and catch the non-zero syndrome.',
        action: 'detect-error'
      }
    },
    {
      id: 'error-correct',
      unit: 5,
      unitTitle: 'Data Communication',
      topic: 'Error Correction (Hamming Codes)',
      title: 'Error Correction Simulator ⭐ (Flagship)',
      icon: '🔧',
      flagship: true,
      tier: 1,
      description: 'Flagship Hamming (7,4) Code laboratory: Encode 4 data bits + 3 parity bits, inject single-bit channel corruption, calculate syndrome vector, and auto-correct.',
      formula: '2^p \\ge m + p + 1, \\quad \\mathbf{s} = \\mathbf{r} \\cdot \\mathbf{H}^T, \\quad \\text{Bit Position Error} = s_3 s_2 s_1',
      defaultParams: { dataBits: '1011', injectedErrorPos: 5, autoCorrect: true },
      challenge: {
        goal: 'Encode data bits 1100 into 7-bit Hamming code, corrupt bit position 6, and verify syndrome $S=110$ locates and flips bit 6 back to original.',
        data: '1100',
        corruptPos: 6
      }
    },
    {
      id: 'dcom-hardware',
      unit: 5,
      unitTitle: 'Data Communication',
      topic: 'Data Communication Hardware',
      title: 'Data Communication Hardware (DTE / DCE / Hubs)',
      icon: '🖥️',
      flagship: false,
      tier: 2,
      description: 'Explore roles and interconnections of Data Terminal Equipment (DTE), Data Circuit-Terminating Equipment (DCE), repeaters, and multiplexers.',
      formula: '\\text{DTE (PC/Terminal)} \\xleftrightarrow{\\text{EIA-232 / V.24}} \\text{DCE (Modem)} \\xleftrightarrow{\\text{Telco Line}} \\text{DCE} \\xleftrightarrow{} \\text{DTE}',
      defaultParams: { selectedDevice: 'DTE', connectionType: 'null-modem' },
      challenge: {
        goal: 'Connect two DTE computers directly using a Null-Modem cable configuration (cross TX/RX and handshakes).',
        cable: 'null-modem'
      }
    },
    {
      id: 'rs232-serial',
      unit: 5,
      unitTitle: 'Data Communication',
      topic: 'RS-232 Serial Interface',
      title: 'RS-232 Serial Interface Simulator',
      icon: '🔌',
      flagship: false,
      tier: 1,
      description: 'Pinout & timing analyzer for DB-9 / DB-25 connectors: TXD, RXD, RTS, CTS, DTR, DSR, and inverted bipolar voltage levels ($-12\\text{V} = 1, +12\\text{V} = 0$).',
      formula: '\\text{Mark (Logic 1)}: -3\\text{V to } -15\\text{V}, \\quad \\text{Space (Logic 0)}: +3\\text{V to } +15\\text{V}',
      defaultParams: { baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'N', txChar: 'D' },
      challenge: {
        goal: 'Trace the RS-232 hardware RTS/CTS flow control handshake sequence before serial character transmission starts.',
        action: 'handshake'
      }
    },
    {
      id: 'dcom-circuits',
      unit: 5,
      unitTitle: 'Data Communication',
      topic: 'Data Communication Circuits',
      title: 'Data Communication Circuit Visualizer',
      icon: '🔲',
      flagship: false,
      tier: 2,
      description: 'Interactive signal circuit paths: Point-to-point, Multipoint/Multidrop, Two-wire vs Four-wire telephone circuits, and echo cancellation.',
      formula: '\\text{4-Wire Circuit:} \\; \\text{Independent pairs for TX & RX} \\implies \\text{Full Duplex with zero hybrid echo}',
      defaultParams: { topology: 'multipoint', circuitType: '4-wire', dropNodes: 3 },
      challenge: {
        goal: 'Configure a 4-wire multipoint polling network where the Primary Station polls Secondary Stations sequentially.',
        topology: 'multipoint'
      }
    },
    {
      id: 'modem-sim',
      unit: 5,
      unitTitle: 'Data Communication',
      topic: 'Modems (Modulator-Demodulator)',
      title: 'Modem Simulator (Digital ↔ Analog ↔ Digital)',
      icon: '📠',
      flagship: false,
      tier: 1,
      description: 'Complete digital data transmission through a phone line: TX UART $\\rightarrow$ FSK/QAM Modulator $\\rightarrow$ Bandpass Channel $\\rightarrow$ Demodulator $\\rightarrow$ RX UART.',
      formula: '\\text{Data In} \\xrightarrow{\\text{Modulate}} s(t) \\xrightarrow{\\text{PSTN 300-3400 Hz}} r(t) \\xrightarrow{\\text{Demodulate}} \\text{Data Out}',
      defaultParams: { standard: 'V.22bis', modulation: 'QAM', bitRate: 2400, snr: 24 },
      challenge: {
        goal: 'Transmit text "DATA" through the modem and successfully demodulate despite line band-limiting and 20 dB noise.',
        message: 'DATA'
      }
    }
  ];

  // ══════════════════════════════════════════════════════════
  // U25RPHU02 — PHYSICS FOR DATA STORAGE AND COMPUTING CATALOG
  // Regulation R2025 · Semester I · Common to AD, AM, BM, CB, CS, IT
  // ══════════════════════════════════════════════════════════
  const U25RPHU02_UNITS = [
    { number: 1, unit: 1, title: 'Optical Materials and Devices', code: 'UNIT I' },
    { number: 2, unit: 2, title: 'Magnetic Materials and Data Storage', code: 'UNIT II' },
    { number: 3, unit: 3, title: 'Nanodevices', code: 'UNIT III' },
    { number: 4, unit: 4, title: 'Quantum Computing', code: 'UNIT IV' },
    { number: 5, unit: 5, title: 'Quantum Circuits', code: 'UNIT V' }
  ];

  const U25RPHU02_SIMULATIONS = [
    // ─── UNIT I — OPTICAL MATERIALS AND DEVICES ───
    {
      id: 'u25rphu02-optical-materials',
      unit: 1,
      unitTitle: 'Optical Materials and Devices',
      topic: 'Classification of Optical Materials',
      title: 'Optical Materials Classification & Photon Interaction',
      icon: '💎',
      flagship: false,
      tier: 1,
      description: 'Interactive optical medium transmission, reflection, and absorption based on refractive index n and absorption coefficient α.',
      formula: 'T = (1 - R)^2 e^{-\\alpha d}, \\quad R = \\left(\\frac{n - 1}{n + 1}\\right)^2',
      defaultParams: { material: 'semiconductor', thicknessUm: 50, wavelengthNm: 650, refractiveIndex: 3.4 },
      challenge: { goal: 'Tune the optical material parameters so that transmittance exceeds 85% at 650 nm.', targetTransmittance: 0.85 }
    },
    {
      id: 'u25rphu02-carrier-generation',
      unit: 1,
      unitTitle: 'Optical Materials and Devices',
      topic: 'Carrier Generation and Recombination',
      title: 'Carrier Generation & Recombination Dynamics',
      icon: '⚡',
      flagship: false,
      tier: 1,
      description: 'Visualize optical excitation generating electron-hole pairs across energy gap Eg and subsequent radiative/non-radiative recombination.',
      formula: 'G_{opt} = \\eta \\frac{P_{opt}}{h\\nu}, \\quad R = B \\cdot n \\cdot p = \\frac{\\Delta n}{\\tau}',
      defaultParams: { photonEnergyEv: 2.2, bandGapEv: 1.42, lightIntensity: 500, recombinationType: 'direct' },
      challenge: { goal: 'Set photon energy exceeding the bandgap Eg to initiate steady-state excess carrier concentration.', minExcess: 1000 }
    },
    {
      id: 'u25rphu02-absorption-emission',
      unit: 1,
      unitTitle: 'Optical Materials and Devices',
      topic: 'Absorption, Emission and Scattering of Light in Solids',
      title: 'Absorption, Emission & Scattering Lab',
      icon: '🌈',
      flagship: false,
      tier: 1,
      description: 'Analyze fundamental optical processes in solids: Beer-Lambert absorption, spontaneous/stimulated emission, and Rayleigh/Mie scattering.',
      formula: 'I(x) = I_0 e^{-\\alpha x}, \\quad I_{Rayleigh} \\propto \\frac{1}{\\lambda^4}, \\quad A_{21} / B_{21} = \\frac{8\\pi h \\nu^3}{c^3}',
      defaultParams: { process: 'absorption', wavelengthNm: 532, sampleThicknessMm: 2.0, particleSizeNm: 40 },
      challenge: { goal: 'Demonstrate Rayleigh scattering wavelength dependence by varying illumination wavelength.', targetScattering: 'rayleigh' }
    },
    {
      id: 'u25rphu02-photodiode',
      unit: 1,
      unitTitle: 'Optical Materials and Devices',
      topic: 'Photodiode',
      title: 'Photodiode Operation & Photocurrent Lab',
      icon: '🔆',
      flagship: true,
      tier: 1,
      description: 'Reverse-biased p-n junction photodiode showing photon absorption in depletion layer, electric field drift, and linear photocurrent vs optical power.',
      formula: 'I_{total} = I_{ph} + I_0 \\left(e^{\\frac{q V}{k T}} - 1\\right), \\quad I_{ph} = R_\\lambda \\cdot P_{opt} = \\frac{\\eta q}{h\\nu} P_{opt}',
      defaultParams: { reverseBiasV: 5.0, opticalPowerMw: 10.0, responsivity: 0.65, darkCurrentNa: 2.5 },
      challenge: { goal: 'Configure reverse bias and input optical power to produce exactly 6.5 mA of linear photocurrent.', targetCurrentMa: 6.5 }
    },
    {
      id: 'u25rphu02-solar-cell',
      unit: 1,
      unitTitle: 'Optical Materials and Devices',
      topic: 'Solar Cell',
      title: 'Solar Cell I-V & Photovoltaic Conversion',
      icon: '☀️',
      flagship: true,
      tier: 1,
      description: 'Photovoltaic generation: I-V curve, short-circuit current Isc, open-circuit voltage Voc, Maximum Power Point (MPP), and Fill Factor.',
      formula: 'I = I_{sc} - I_0 \\left(e^{\\frac{q V}{n k T}} - 1\\right), \\quad FF = \\frac{V_{mp} I_{mp}}{V_{oc} I_{sc}}, \\quad \\eta = \\frac{P_{max}}{P_{in}}',
      defaultParams: { irradianceWm2: 1000, temperatureC: 25, cellAreaCm2: 4.0, idealityFactor: 1.2 },
      challenge: { goal: 'Maximize the Fill Factor above 75% by minimizing internal series resistance.', minFillFactor: 0.75 }
    },
    {
      id: 'u25rphu02-oled',
      unit: 1,
      unitTitle: 'Optical Materials and Devices',
      topic: 'OLED',
      title: 'OLED Multilayer Architecture & Luminescence',
      icon: '💡',
      flagship: false,
      tier: 1,
      description: 'Charge injection from Cathode/Anode into Electron/Hole Transport Layers, exciton formation in emissive layer, and radiative decay emission.',
      formula: 'J = \\frac{9}{8} \\varepsilon \\mu \\frac{V^2}{d^3} \\quad \\text{(SCLC)}, \\quad \\eta_{ext} = \\gamma \\cdot \\eta_{exciton} \\cdot \\Phi_P \\cdot \\eta_{out}',
      defaultParams: { forwardVoltageV: 4.5, emitterDye: 'al_q3', layerThicknessNm: 120, currentDensity: 15 },
      challenge: { goal: 'Attain optimal green emission (525 nm) at 4.5 V driving bias.', targetWavelength: 525 }
    },
    {
      id: 'u25rphu02-optical-storage',
      unit: 1,
      unitTitle: 'Optical Materials and Devices',
      topic: 'Optical Data Storage Techniques',
      title: 'Optical Data Storage (Pits, Lands & Laser Interference)',
      icon: '💿',
      flagship: false,
      tier: 1,
      description: 'Destructive optical phase interference over pits and lands: pit depth d = λ / (4n), photodiode optical modulation signal, and binary decoding.',
      formula: '\\Delta \\phi = \\frac{2\\pi}{\\lambda} \\cdot (2 n d) = \\pi \\implies d = \\frac{\\lambda}{4 n}',
      defaultParams: { pitDepthNm: 110, laserWavelengthNm: 650, diskRefractiveIndex: 1.55, rotationSpeedRpm: 1200 },
      challenge: { goal: 'Tune the pit depth to exact destructive interference condition d = λ / (4n).', targetPhaseDiff: 'pi' }
    },
    {
      id: 'u25rphu02-bluray',
      unit: 1,
      unitTitle: 'Optical Materials and Devices',
      topic: 'Blu-ray Disc',
      title: 'Blu-ray Disc Optical System (405 nm High-NA Optics)',
      icon: '🔷',
      flagship: false,
      tier: 1,
      description: 'Comparison of CD (780 nm), DVD (650 nm), and Blu-ray (405 nm, NA 0.85). Spot size d ≈ 0.6 λ / NA, track pitch 0.32 µm, 25 GB storage density.',
      formula: 'd_{spot} \\approx 0.6 \\frac{\\lambda}{\\text{NA}}, \\quad \\text{Density} \\propto \\left(\\frac{\\text{NA}}{\\lambda}\\right)^2',
      defaultParams: { discType: 'bluray', laserNm: 405, na: 0.85, trackPitchUm: 0.32 },
      challenge: { goal: 'Configure the 405 nm blue-violet laser with NA 0.85 to resolve a spot size below 300 nm.', maxSpotSizeNm: 300 }
    },

    // ─── UNIT II — MAGNETIC MATERIALS AND DATA STORAGE ───
    {
      id: 'u25rphu02-magnetic-materials',
      unit: 2,
      unitTitle: 'Magnetic Materials and Data Storage',
      topic: 'Origin and Classification of Magnetic Materials',
      title: 'Magnetic Materials Origin & Classification Lab',
      icon: '🧲',
      flagship: false,
      tier: 1,
      description: 'Atomic origin: orbital magnetic moment μ_l, spin magnetic moment μ_s, Bohr magneton μ_B. Interactive classification: Diamagnetic, Paramagnetic, Ferromagnetic.',
      formula: '\\vec{\\mu} = \\vec{\\mu}_l + \\vec{\\mu}_s, \\quad \\mu_B = \\frac{e \\hbar}{2 m_e}, \\quad \\vec{M} = \\chi \\vec{H}, \\quad \\vec{B} = \\mu_0 (\\vec{H} + \\vec{M})',
      defaultParams: { category: 'ferromagnetic', temperatureK: 300, curieTempK: 1043, appliedH: 50 },
      challenge: { goal: 'Identify the temperature above which a ferromagnetic material transitions into a paramagnetic state (Curie Temperature).', targetCurie: 1043 }
    },
    {
      id: 'u25rphu02-ferromagnetism',
      unit: 2,
      unitTitle: 'Magnetic Materials and Data Storage',
      topic: 'Ferromagnetic Theory',
      title: 'Ferromagnetic Domain Theory & Wall Dynamics',
      icon: '🧭',
      flagship: false,
      tier: 1,
      description: 'Weiss molecular field theory, quantum exchange interaction, spontaneous domain magnetization, domain wall motion, and domain rotation.',
      formula: 'H_{Weiss} = \\lambda M, \\quad E_{ex} = -2 J \\sum \\vec{S}_i \\cdot \\vec{S}_j, \\quad \\delta_{wall} = \\pi \\sqrt{\\frac{A}{K}}',
      defaultParams: { appliedFieldOe: 120, domainCount: 6, exchangeEnergyJ: 1.0, anisotropyK: 1.0 },
      challenge: { goal: 'Apply sufficient external magnetic field to align all magnetic domains along the easy magnetization axis.', targetAlignment: 1.0 }
    },
    {
      id: 'u25rphu02-hysteresis',
      unit: 2,
      unitTitle: 'Magnetic Materials and Data Storage',
      topic: 'Hysteresis',
      title: 'Magnetic Hysteresis Loop (B-H Curve)',
      icon: '🔄',
      flagship: true,
      tier: 1,
      description: 'Dynamic B-H hysteresis curve tracing: Saturation induction Bs, Retentivity / Remanence Br, Coercive force Hc, loop area hysteresis loss W_h.',
      formula: 'W_h = \\oint \\vec{H} \\cdot d\\vec{B} = \\eta B_{max}^{1.6} \\quad \\text{(Steinmetz)}, \\quad B = \\mu_0 (H + M)',
      defaultParams: { materialType: 'hard', maxFieldH: 800, remanenceBr: 1.2, coercivityHc: 450 },
      challenge: { goal: 'Differentiate soft magnetic cores (low Hc, narrow loop) from permanent recording media (high Hc, high Br).', targetHc: 450 }
    },
    {
      id: 'u25rphu02-magnetic-memory',
      unit: 2,
      unitTitle: 'Magnetic Materials and Data Storage',
      topic: 'Magnetic Memory Devices',
      title: 'Magnetic Memory Devices (Core Memory & MRAM)',
      icon: '🧠',
      flagship: false,
      tier: 1,
      description: 'Binary storage using magnetic dipole orientation: magnetic core hysteresis switching and modern Magnetic Tunnel Junction (MTJ) Spin-Transfer Torque MRAM.',
      formula: 'TMR = \\frac{R_{AP} - R_P}{R_P} = \\frac{2 P_1 P_2}{1 - P_1 P_2}, \\quad \\text{Bit } 0: \\uparrow\\uparrow (R_P), \\quad \\text{Bit } 1: \\uparrow\\downarrow (R_{AP})',
      defaultParams: { cellType: 'mram', writeCurrentMa: 1.2, tmrRatioPercent: 180, bitState: 0 },
      challenge: { goal: 'Pulse the write current beyond the critical switching current to flip the storage bit from 0 to 1.', targetBit: 1 }
    },
    {
      id: 'u25rphu02-magnetic-tape',
      unit: 2,
      unitTitle: 'Magnetic Materials and Data Storage',
      topic: 'Magnetic Tape',
      title: 'Magnetic Tape Recording & Head Induction',
      icon: '📼',
      flagship: false,
      tier: 1,
      description: 'Fringing field from write head aligns ferromagnetic tape particles; inductive read head detects flux transitions via Faraday induction e = -N dΦ/dt.',
      formula: 'e = -N \\frac{d\\Phi}{dt} = -N v \\frac{d\\Phi}{dx}, \\quad \\lambda_{recorded} = \\frac{v}{f}',
      defaultParams: { tapeSpeedMps: 3.8, headGapUm: 0.8, signalFreqKhz: 20, writeCurrentMa: 25 },
      challenge: { goal: 'Set optimal tape velocity and write frequency to record clean magnetization transitions without fringing overlap.', targetFringing: 'optimal' }
    },
    {
      id: 'u25rphu02-gmr',
      unit: 2,
      unitTitle: 'Magnetic Materials and Data Storage',
      topic: 'GMR Sensor',
      title: 'Giant Magnetoresistance (GMR) Spin Valve',
      icon: '🎚️',
      flagship: true,
      tier: 1,
      description: 'Spin-dependent electron scattering in thin film sandwiches: Pinned layer, non-magnetic spacer, Free layer. Parallel alignment: Low R. Antiparallel: High R.',
      formula: '\\frac{\\Delta R}{R} = \\frac{R_{AP} - R_P}{R_P}, \\quad \\sigma_{\\uparrow\\uparrow} \\gg \\sigma_{\\uparrow\\downarrow}',
      defaultParams: { externalFieldOe: 0, spacerThicknessNm: 2.5, spinPolarization: 0.55, gmrRatioPercent: 45 },
      challenge: { goal: 'Rotate the free layer by 180° with an external magnetic field to observe the maximum GMR resistance change.', targetOrientation: 'antiparallel' }
    },
    {
      id: 'u25rphu02-magnetic-bubble',
      unit: 2,
      unitTitle: 'Magnetic Materials and Data Storage',
      topic: 'Magnetic Bubble Memories',
      title: 'Magnetic Bubble Memory & Domain Propagation',
      icon: '🫧',
      flagship: false,
      tier: 1,
      description: 'Cylindrical magnetic domain bubbles in orthoferrite/garnet films propagated along Permalloy chevron tracks by a rotating in-plane drive field.',
      formula: 'd_{bubble} \\approx 8 \\sqrt{\\frac{A K_u}{\\mu_0 M_s^2}}, \\quad \\vec{H}_{drive} = H_0 (\\cos \\omega t \\, \\hat{i} + \\sin \\omega t \\, \\hat{j})',
      defaultParams: { biasFieldOe: 120, driveFreqKhz: 100, bubbleDiameterUm: 3.0, trackLength: 8 },
      challenge: { goal: 'Maintain the vertical bias field within the stable bubble formation window (100 to 140 Oe).', targetField: 120 }
    },
    {
      id: 'u25rphu02-magstripe',
      unit: 2,
      unitTitle: 'Magnetic Materials and Data Storage',
      topic: 'Magstripe',
      title: 'Magstripe Card Encoding & Reader Induction',
      icon: '💳',
      flagship: false,
      tier: 1,
      description: 'F/2F Aiken biphase magnetic encoding on tracks 1, 2, and 3. Clocked flux reversals produce alternating voltage spikes across the read head.',
      formula: '\\text{Bit } 0: \\text{1 transition/cell}, \\quad \\text{Bit } 1: \\text{2 transitions/cell}, \\quad V_{ind} = -N \\frac{d\\Phi}{dt}',
      defaultParams: { swipeSpeedCms: 30, trackNumber: 2, bitDensityBpi: 75, testString: 'KPRIET2026' },
      challenge: { goal: 'Decode the biphase F/2F flux transitions into the correct alphanumeric ASCII string.', targetAscii: 'KPRIET2026' }
    },

    // ─── UNIT III — NANODEVICES ───
    {
      id: 'u25rphu02-quantum-confinement',
      unit: 3,
      unitTitle: 'Nanodevices',
      topic: 'Quantum Confinement',
      title: 'Quantum Confinement & Density of States (3D, 2D, 1D, 0D)',
      icon: '📦',
      flagship: false,
      tier: 1,
      description: 'De Broglie wavelength dimension scaling: 3D bulk continuum DOS ∝ √E, 2D quantum well staircase DOS, 1D wire DOS ∝ 1/√E, and 0D dot discrete delta peaks.',
      formula: 'D_{3D} \\propto \\sqrt{E}, \\quad D_{2D} = \\frac{m^*}{\\pi \\hbar^2} \\sum \\Theta, \\quad D_{1D} \\propto \\frac{1}{\\sqrt{E}}, \\quad D_{0D} = 2 \\sum \\delta(E - E_n)',
      defaultParams: { dimension: '0d', sizeNm: 5.0, effMassRatio: 0.067, potentialBarrierEv: 3.0 },
      challenge: { goal: 'Reduce nanostructure size below the exciton Bohr radius (a_B ≈ 10 nm) to enter the strong quantum confinement regime.', maxSizeNm: 10 }
    },
    {
      id: 'u25rphu02-quantum-structures',
      unit: 3,
      unitTitle: 'Nanodevices',
      topic: 'Quantum Structures (Wells, Wires, Dots)',
      title: 'Quantum Well, Wire & Dot Energy Quantization',
      icon: '🔬',
      flagship: false,
      tier: 1,
      description: 'Solve particle-in-a-box wavefunctions: 1D confinement (quantum well), 2D confinement (quantum wire), and 3D confinement (quantum dot artificial atom).',
      formula: 'E_{n_x,n_y,n_z} = \\frac{\\pi^2 \\hbar^2}{2 m^*} \\left(\\frac{n_x^2}{L_x^2} + \\frac{n_y^2}{L_y^2} + \\frac{n_z^2}{L_z^2}\\right), \\quad \\psi(x) = \\sqrt{\\frac{2}{L}} \\sin\\left(\\frac{n\\pi x}{L}\\right)',
      defaultParams: { structure: 'dot', lxNm: 4.0, lyNm: 4.0, lzNm: 4.0, stateN: 1 },
      challenge: { goal: 'Configure equal dimensions Lx=Ly=Lz=4 nm to observe discrete 3-fold energy degeneracy in excited states.', targetDegeneracy: 3 }
    },
    {
      id: 'u25rphu02-nano-bandgap',
      unit: 3,
      unitTitle: 'Nanodevices',
      topic: 'Band Gap of Nanomaterials',
      title: 'Nanomaterial Bandgap Tunability (Brus Equation)',
      icon: '🧪',
      flagship: false,
      tier: 1,
      description: 'Size-dependent bandgap blueshift in semiconductor nanocrystals / quantum dots governed by the quantum confinement Brus equation.',
      formula: 'E_g(r) = E_{g,bulk} + \\frac{h^2}{8 r^2} \\left(\\frac{1}{m_e^*} + \\frac{1}{m_h^*}\\right) - \\frac{1.786 e^2}{4\\pi \\varepsilon_0 \\varepsilon_r r}',
      defaultParams: { radiusNm: 3.0, bulkEgEv: 1.42, effMassElectrons: 0.067, effMassHoles: 0.45, dielectricConstant: 12.9 },
      challenge: { goal: 'Tune the quantum dot radius to shift the emission color from infrared to visible blue (470 nm).', targetWavelengthNm: 470 }
    },
    {
      id: 'u25rphu02-tunnelling',
      unit: 3,
      unitTitle: 'Nanodevices',
      topic: 'Tunnelling',
      title: 'Quantum Mechanical Tunnelling Through Potential Barrier',
      icon: '🚪',
      flagship: true,
      tier: 1,
      description: 'Wave packet incident on a finite barrier of height V0 and width a: evanescent wave decay inside barrier, transmission coefficient T, and reflection R.',
      formula: 'T \\approx e^{-2 \\alpha a}, \\quad \\alpha = \\frac{\\sqrt{2 m (V_0 - E)}}{\\hbar}, \\quad T = \\left[1 + \\frac{V_0^2 \\sinh^2(\\alpha a)}{4E(V_0 - E)}\\right]^{-1}',
      defaultParams: { particleEnergyEv: 3.0, barrierHeightEv: 5.0, barrierWidthNm: 0.8, particleMassRatio: 1.0 },
      challenge: { goal: 'Adjust barrier thickness and energy so that transmission probability T exceeds 15% for tunneling electron.', minTransmission: 0.15 }
    },
    {
      id: 'u25rphu02-coulomb-blockade',
      unit: 3,
      unitTitle: 'Nanodevices',
      topic: 'Coulomb Blockade',
      title: 'Coulomb Blockade & Single-Electron Charging',
      icon: '🧱',
      flagship: false,
      tier: 1,
      description: 'Electrostatic energy barrier Ec = e²/(2C) > kBT on ultra-small islands suppressing electron tunneling below threshold bias Vds < e/(2C); Coulomb staircase.',
      formula: 'E_C = \\frac{e^2}{2 C_\\Sigma} \\gg k_B T, \\quad V_{threshold} = \\frac{e}{2 C_\\Sigma}, \\quad I(V_{ds}) \\implies \\text{Staircase}',
      defaultParams: { islandCapacitanceAf: 0.5, temperatureK: 4.2, biasVoltageMv: 120, tunnelResistanceMohm: 10 },
      challenge: { goal: 'Verify that thermal energy kBT is strictly lower than charging energy Ec for stable single-electron blockade.', targetBlockade: 'verified' }
    },
    {
      id: 'u25rphu02-set',
      unit: 3,
      unitTitle: 'Nanodevices',
      topic: 'Single Electron Transistor',
      title: 'Single Electron Transistor (SET) & Coulomb Oscillations',
      icon: '⚡',
      flagship: true,
      tier: 1,
      description: 'Source, Drain, Quantum Dot Island, and capacitive Gate. Gate voltage Vg linearly tunes island potential, triggering periodic conductance oscillations.',
      formula: 'Q_{island} = -e \\left(n - \\frac{C_g V_g}{e}\\right), \\quad \\Delta V_g = \\frac{e}{C_g}, \\quad G(V_g) \\propto \\cosh^{-2}\\left(\\frac{\\Delta E}{2 k_B T}\\right)',
      defaultParams: { gateVoltageV: 0.15, gateCapacitanceAf: 0.8, sourceDrainV: 0.01, temperatureK: 1.5 },
      challenge: { goal: 'Identify the gate voltage period ΔVg = e / Cg corresponding to adding exactly one electron to the island.', targetPeriodV: 0.2 }
    },
    {
      id: 'u25rphu02-rtd',
      unit: 3,
      unitTitle: 'Nanodevices',
      topic: 'Resonant Tunnelling Diode',
      title: 'Resonant Tunnelling Diode (RTD) & NDR Curve',
      icon: '📉',
      flagship: false,
      tier: 1,
      description: 'Double barrier quantum well (GaAs/AlGaAs): electron resonant transmission occurs when emitter Fermi level aligns with quantized well energy E1; NDR region.',
      formula: 'T(E) = \\frac{\\Gamma_L \\Gamma_R}{(E - E_r)^2 + (\\Gamma/2)^2}, \\quad \\text{PVCR} = \\frac{I_{peak}}{I_{valley}}',
      defaultParams: { wellWidthNm: 5.0, barrierWidthNm: 2.0, biasVoltageV: 0.4, peakCurrentMa: 15.0 },
      challenge: { goal: 'Operate the RTD in the Negative Differential Resistance (NDR) zone where dI/dV < 0 for high-frequency microwave oscillation.', targetRegion: 'ndr' }
    },
    {
      id: 'u25rphu02-qca',
      unit: 3,
      unitTitle: 'Nanodevices',
      topic: 'Quantum Cellular Automata',
      title: 'Quantum Cellular Automata (QCA) Logic & Majority Gate',
      icon: '🔲',
      flagship: false,
      tier: 1,
      description: '4 quantum dots with 2 mobile electrons per cell. Coulomb repulsion stabilizes polarization P = -1 (binary 0) and P = +1 (binary 1); 3-input majority voter gate.',
      formula: 'P = \\frac{(q_2 + q_4) - (q_1 + q_3)}{\\sum q_i}, \\quad M(A,B,C) = AB + BC + AC',
      defaultParams: { cellPolarization: 1, inputA: 1, inputB: 1, inputC: 0, cellSpacingNm: 20 },
      challenge: { goal: 'Demonstrate majority gate operation: Inputs A=1, B=1, C=0 must evaluate to output M=1.', targetMajority: 1 }
    },

    // ─── UNIT IV — QUANTUM COMPUTING ───
    {
      id: 'u25rphu02-classical-vs-quantum',
      unit: 4,
      unitTitle: 'Quantum Computing',
      topic: 'Classical vs Quantum Computing',
      title: 'Classical vs Quantum Computing (Moore’s Law Limits)',
      icon: '⚖️',
      flagship: false,
      tier: 1,
      description: 'Physical limits of CMOS scaling (gate oxide tunneling < 2 nm, thermal dissipation). Classical deterministic bit (0 or 1) vs quantum superposition (α|0⟩ + β|1⟩).',
      formula: 'N_{transistors} \\propto 2^{t / 1.5}, \\quad \\text{Classical: } b \\in \\{0, 1\\}, \\quad \\text{Quantum: } |\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle, \\quad |\\alpha|^2 + |\\beta|^2 = 1',
      defaultParams: { numQubits: 3, classicalBits: 3, transistorNodeNm: 3, quantumStateSpace: 8 },
      challenge: { goal: 'Compare 2^n exponential quantum state scaling against classical linear register capacity.', targetBits: 8 }
    },
    {
      id: 'u25rphu02-qubit',
      unit: 4,
      unitTitle: 'Quantum Computing',
      topic: 'Concept of Qubit and its Properties',
      title: 'Qubit State, Superposition & Born Measurement',
      icon: '🔮',
      flagship: false,
      tier: 1,
      description: 'Mathematical formulation of the qubit: complex probability amplitudes α and β, normalization, Born rule measurement collapse, and quantum phase.',
      formula: '|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle, \\quad P(0) = |\\alpha|^2, \\quad P(1) = |\\beta|^2, \\quad \\langle\\psi|\\psi\\rangle = 1',
      defaultParams: { alphaProb: 0.707, betaProb: 0.707, phaseDeg: 0, numShots: 1024 },
      challenge: { goal: 'Configure equal superposition (|α|² = |β|² = 0.50) and perform 1024 measurement shots.', targetProbHalf: 0.5 }
    },
    {
      id: 'u25rphu02-bloch-sphere',
      unit: 4,
      unitTitle: 'Quantum Computing',
      topic: 'Representation of Qubit by Bloch Sphere',
      title: 'Bloch Sphere 3D Interactive Quantum Visualizer ⭐ (Flagship)',
      icon: '🌐',
      flagship: true,
      tier: 1,
      description: 'Interactive 3D Bloch sphere: State vector |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩, spherical coordinates (θ, φ), view rotation, quantum gate trajectories, and projective measurement.',
      formula: '|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle, \\quad \\vec{r} = (\\sin\\theta\\cos\\phi, \\, \\sin\\theta\\sin\\phi, \\, \\cos\\theta)',
      defaultParams: { thetaDeg: 90, phiDeg: 0, viewRotX: 18, viewRotY: -35, showProjections: true, lastGate: 'none' },
      challenge: { goal: 'Rotate the state vector to the equator (+X state) using θ = 90°, φ = 0° (the |+⟩ Hadamard basis).', targetTheta: 90, targetPhi: 0 }
    },
    {
      id: 'u25rphu02-single-two-qubits',
      unit: 4,
      unitTitle: 'Quantum Computing',
      topic: 'Single and Two Qubits',
      title: 'Two-Qubit State Space & Quantum Entanglement',
      icon: '🔗',
      flagship: false,
      tier: 1,
      description: 'Composite quantum systems: Tensor product space ℂ² ⊗ ℂ², 4-basis state expansion, product states vs entangled Bell states (|Φ⁺⟩ = (|00⟩ + |11⟩)/√2).',
      formula: '|\\psi\\rangle = c_{00}|00\\rangle + c_{01}|01\\rangle + c_{10}|10\\rangle + c_{11}|11\\rangle, \\quad |\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
      defaultParams: { stateType: 'bell_phi_plus', entangleStrength: 1.0, measQubitA: null, measQubitB: null },
      challenge: { goal: 'Prepare the maximally entangled Bell state |Φ⁺⟩ and observe perfectly correlated simultaneous measurements.', targetState: 'bell' }
    },

    // ─── UNIT V — QUANTUM CIRCUITS ───
    {
      id: 'u25rphu02-quantum-devices',
      unit: 5,
      unitTitle: 'Quantum Circuits',
      topic: 'Quantum Devices',
      title: 'Physical Quantum Devices (Transmon, Ion Trap, Spin)',
      icon: '🎛️',
      flagship: false,
      tier: 1,
      description: 'Physical hardware implementations of qubits: Superconducting Josephson Transmon, Trapped Ion, Silicon Spin Qubit, and Photonic Circuit comparison.',
      formula: 'E_J = \\frac{\\hbar I_c}{2 e}, \\quad \\omega_{01} \\approx \\frac{\\sqrt{8 E_J E_C} - E_C}{\\hbar}, \\quad T_1 \\text{ (Relaxation)}, \\, T_2 \\text{ (Dephasing)}',
      defaultParams: { deviceType: 'transmon', t1Us: 85, t2Us: 60, gateFidelityPercent: 99.8, tempMilliK: 15 },
      challenge: { goal: 'Maintain dilution refrigeration temperature below 20 mK to keep thermal excitation kBT ≪ ℏω01.', maxTempMilliK: 20 }
    },
    {
      id: 'u25rphu02-quantum-gates',
      unit: 5,
      unitTitle: 'Quantum Circuits',
      topic: 'Single Qubit Gates',
      title: 'Universal Quantum Gate Laboratory (X, Y, Z, H, S, T) ⭐ (Flagship)',
      icon: '🚪',
      flagship: true,
      tier: 1,
      description: 'Universal quantum gate laboratory: Select input state |0⟩, |1⟩, |+⟩; apply Pauli-X, Y, Z, Hadamard H, Phase S, or T gate; inspect unitary matrix multiplication and Bloch vector trajectory.',
      formula: 'X = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}, \\, H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}, \\, Z = \\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}, \\, S = \\begin{pmatrix}1&0\\\\0&i\\end{pmatrix}, \\, T = \\begin{pmatrix}1&0\\\\0&e^{i\\pi/4}\\end{pmatrix}',
      defaultParams: { activeGate: 'H', inputState: '0', appliedStep: 1, showMatrix: true },
      challenge: { goal: 'Apply the Hadamard gate to input state |0⟩ to generate the equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2.', targetState: 'plus' }
    },
    {
      id: 'u25rphu02-multiqubit',
      unit: 5,
      unitTitle: 'Quantum Circuits',
      topic: 'Multiple Qubit Gates',
      title: 'Multi-Qubit Gates (CNOT, SWAP & Bell Circuit)',
      icon: '🔀',
      flagship: false,
      tier: 1,
      description: 'Controlled gates: Controlled-NOT (CNOT) truth table, control vs target behavior, SWAP gate, and building a 2-qubit Bell state circuit (H on q0 followed by CNOT).',
      formula: '\\text{CNOT} = \\begin{pmatrix}1&0&0&0\\\\0&1&0&0\\\\0&0&0&1\\\\0&0&1&0\\end{pmatrix}, \\quad |c, t\\rangle \\xrightarrow{\\text{CNOT}} |c, c \\oplus t\\rangle',
      defaultParams: { controlBit: 1, targetBit: 0, circuitMode: 'cnot', stepProgress: 2 },
      challenge: { goal: 'Set control qubit = 1 and target qubit = 0; verify CNOT flips target to 1 (output state |11⟩).', targetOut: '11' }
    },
    {
      id: 'u25rphu02-quantum-chip',
      unit: 5,
      unitTitle: 'Quantum Circuits',
      topic: 'Quantum Chips',
      title: 'Quantum Processor Chip Architecture & Interconnect',
      icon: '🔲',
      flagship: false,
      tier: 1,
      description: 'Architectural layout of a superconducting quantum chip: Qubit grid (Transmons), coplanar waveguide (CPW) readout resonators, XY drive lines, Z flux bias lines, and readout multiplexer.',
      formula: '\\text{QPU Layout} \\in \\{\\text{Qubits}, \\text{Couplers}, \\text{Readout Resonators}, \\text{Control Lines}, \\text{Purcell Filters}\\}',
      defaultParams: { qubitCount: 8, chipTopology: 'heavy_hex', activeQubitIndex: 2, readoutFreqGhz: 7.2 },
      challenge: { goal: 'Select Qubit 0 and address it with XY microwave control pulse to perform a π pulse inversion.', targetQubit: 0 }
    }
  ];

  return {
    subject: {
      code: 'U21IT201',
      name: 'Principles of Data Communication',
      department: 'Information Technology',
      programme: 'B.Tech IT',
      regulation: 'R2021 CBCS',
      semester: 2,
      category: 'PCC',
      totalContactPeriods: 45
    },
    u25rphSubject: {
      code: 'U25RPHU02',
      name: 'Physics for Data Storage and Computing',
      department: 'Physics / Interdisciplinary',
      programme: 'B.E. / B.Tech (AD, AM, BM, CB, CS, IT)',
      regulation: 'R2025',
      semester: 1,
      category: 'BSC',
      totalContactPeriods: 30
    },
    units: UNITS,
    simulations: SIMULATIONS,
    u25rphUnits: U25RPHU02_UNITS,
    u25rphSimulations: U25RPHU02_SIMULATIONS,
    allSimulations: SIMULATIONS.concat(U25RPHU02_SIMULATIONS),

    isU25Rph: function (subjectCode, simId) {
      if (simId && String(simId).toLowerCase().includes('u25rph')) return true;
      if (simId && (String(simId).includes('bloch') || String(simId).includes('qubit') || String(simId).includes('photodiode') || String(simId).includes('oled') || String(simId).includes('bluray') || String(simId).includes('blu-ray') || String(simId).includes('hysteresis') || String(simId).includes('gmr') || String(simId).includes('tunnelling') || String(simId).includes('coulomb-blockade'))) return true;
      if (!subjectCode) return false;
      const code = String(subjectCode).toUpperCase();
      return code === 'U25RPHU02' || code === 'U25PH102' || code.includes('RPH') || code.includes('PHU');
    },

    getUnitsForSubject: function (subjectCode, simId) {
      return this.isU25Rph(subjectCode, simId) ? U25RPHU02_UNITS : UNITS;
    },

    getSimulationsForSubject: function (subjectCode, simId) {
      return this.isU25Rph(subjectCode, simId) ? U25RPHU02_SIMULATIONS : SIMULATIONS;
    },

    getSimulationById: function (id) {
      if (!id) return null;
      let cleanId = String(id).trim().toLowerCase();
      if (cleanId === 'u25rphu02-blu-ray' || cleanId === 'blu-ray' || cleanId === 'bluray') {
        cleanId = 'u25rphu02-bluray';
      }
      let found = SIMULATIONS.find(function (s) { return s.id === cleanId; });
      if (!found) {
        found = U25RPHU02_SIMULATIONS.find(function (s) { return s.id === cleanId; });
      }
      if (!found) {
        const withPrefix = cleanId.startsWith('u25rphu02-') ? cleanId : 'u25rphu02-' + cleanId;
        const withoutPrefix = cleanId.replace(/^u25rphu02-/, '').replace(/-/g, '');
        found = U25RPHU02_SIMULATIONS.find(function (s) {
          return s.id === withPrefix || s.id.replace(/^u25rphu02-/, '').replace(/-/g, '') === withoutPrefix;
        });
      }
      return found || null;
    },

    getSimulationsByUnit: function (unitNum, subjectCode, simId) {
      const list = this.isU25Rph(subjectCode, simId) ? U25RPHU02_SIMULATIONS : SIMULATIONS;
      return list.filter(function (s) { return s.unit === Number(unitNum); });
    }
  };
}));
