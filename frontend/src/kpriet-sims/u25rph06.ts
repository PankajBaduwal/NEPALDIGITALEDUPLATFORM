import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';
import {
  PHYSICS_CIVIL_SIMULATIONS,
  PHYSICS_CIVIL_COURSE_METADATA,
} from './physics-civil/PhysicsCivilSimData';

export const U25RPH06_COURSE_METADATA = PHYSICS_CIVIL_COURSE_METADATA;

/**
 * Authoritative Simulations for:
 * Course Code: U25RPH06 (Aliases: U25PH202, U25RPH202, U25RPHO6)
 * Course Name: Physics for Civil Engineers
 * Programme: B.E. Civil Engineering | Semester: II | Category: BSC | Credits: 2
 * Regulation: R2025 Revised CBCS
 * Official Source: CE - R2025 (Revised).pdf, Printed Pages 34–35
 *
 * Exactly 25 Approved Syllabus-Verified Interactive Simulations mapped across Units 1 to 5 (30 Lecture Periods).
 */
export const U25RPH06_SUBJECT_KEYWORDS = [
  'physics for civil engineers',
  'physics for civil',
  'u25rph06',
  'u25ph202',
  'u25rph202',
  'u25rpho6',
  'rph06',
  'ph202',
  'civil physics',
  'smart materials',
  'thermal insulation',
  'building acoustics',
  'photometry',
  'seismology',
  'civil hazards',
];

export const U25RPH06_ALIAS_MAP: Record<string, string> = {
  // Alias with older code U25PH202
  'u25ph202-sim01-frp-composites': 'u25rph06-sim01-frp-composites',
  'u25ph202-sim02-frm-metal-matrix': 'u25rph06-sim02-frm-metal-matrix',
  'u25ph202-sim03-metallic-glasses': 'u25rph06-sim03-metallic-glasses',
  'u25ph202-sim04-shape-memory-alloys': 'u25rph06-sim04-shape-memory-alloys',
  'u25ph202-sim05-high-alumina-ceramics': 'u25rph06-sim05-high-alumina-ceramics',
  'u25ph202-sim06-thermal-insulation-u-value': 'u25rph06-sim06-thermal-insulation-u-value',
  'u25ph202-sim07-building-heat-gain-loss': 'u25rph06-sim07-building-heat-gain-loss',
  'u25ph202-sim08-building-thermal-performance': 'u25rph06-sim08-building-thermal-performance',
  'u25ph202-sim09-central-heating-hvac': 'u25rph06-sim09-central-heating-hvac',
  'u25ph202-sim10-natural-ventilation-smoke-tube': 'u25rph06-sim10-natural-ventilation-smoke-tube',
  'u25ph202-sim11-photometry-laws': 'u25rph06-sim11-photometry-laws',
  'u25ph202-sim12-vision-luminous-efficiency': 'u25rph06-sim12-vision-luminous-efficiency',
  'u25ph202-sim13-glare-ugr-color': 'u25rph06-sim13-glare-ugr-color',
  'u25ph202-sim14-daylight-factor-windows': 'u25rph06-sim14-daylight-factor-windows',
  'u25ph202-sim15-artificial-lighting-lumen-method': 'u25rph06-sim15-artificial-lighting-lumen-method',
  'u25ph202-sim16-sound-decibel-scale': 'u25rph06-sim16-sound-decibel-scale',
  'u25ph202-sim17-weber-fechner-loudness': 'u25rph06-sim17-weber-fechner-loudness',
  'u25ph202-sim18-sabine-reverberation-time': 'u25rph06-sim18-sabine-reverberation-time',
  'u25ph202-sim19-absorption-coefficient-remedies': 'u25rph06-sim19-absorption-coefficient-remedies',
  'u25ph202-sim20-sound-transmission-loss-stc': 'u25rph06-sim20-sound-transmission-loss-stc',
  'u25ph202-sim21-seismology-wave-propagation': 'u25rph06-sim21-seismology-wave-propagation',
  'u25ph202-sim22-earthquake-response-spectrum': 'u25rph06-sim22-earthquake-response-spectrum',
  'u25ph202-sim23-magnitude-intensity-damage': 'u25rph06-sim23-magnitude-intensity-damage',
  'u25ph202-sim24-cyclone-wind-flood-forces': 'u25rph06-sim24-cyclone-wind-flood-forces',
  'u25ph202-sim25-fire-hazard-thermal-barrier': 'u25rph06-sim25-fire-hazard-thermal-barrier',
  // Letter O instead of Zero 0
  'u25rpho6-sim01-frp-composites': 'u25rph06-sim01-frp-composites',
  // Short names
  'frp-composites': 'u25rph06-sim01-frp-composites',
  'frm-metal-matrix': 'u25rph06-sim02-frm-metal-matrix',
  'metallic-glasses': 'u25rph06-sim03-metallic-glasses',
  'shape-memory-alloys': 'u25rph06-sim04-shape-memory-alloys',
  'high-alumina-ceramics': 'u25rph06-sim05-high-alumina-ceramics',
  'wall-u-value': 'u25rph06-sim06-thermal-insulation-u-value',
  'building-heat-gain': 'u25rph06-sim07-building-heat-gain-loss',
  'thermal-mass': 'u25rph06-sim08-building-thermal-performance',
  'central-heating': 'u25rph06-sim09-central-heating-hvac',
  'natural-ventilation': 'u25rph06-sim10-natural-ventilation-smoke-tube',
  'photometry-laws': 'u25rph06-sim11-photometry-laws',
  'luminous-efficiency': 'u25rph06-sim12-vision-luminous-efficiency',
  'glare-ugr': 'u25rph06-sim13-glare-ugr-color',
  'daylight-factor': 'u25rph06-sim14-daylight-factor-windows',
  'lumen-method': 'u25rph06-sim15-artificial-lighting-lumen-method',
  'decibel-scale': 'u25rph06-sim16-sound-decibel-scale',
  'weber-fechner': 'u25rph06-sim17-weber-fechner-loudness',
  'sabine-formula': 'u25rph06-sim18-sabine-reverberation-time',
  'absorption-coefficient': 'u25rph06-sim19-absorption-coefficient-remedies',
  'transmission-loss-stc': 'u25rph06-sim20-sound-transmission-loss-stc',
  'seismology-waves': 'u25rph06-sim21-seismology-wave-propagation',
  'earthquake-resonance': 'u25rph06-sim22-earthquake-response-spectrum',
  'magnitude-intensity': 'u25rph06-sim23-magnitude-intensity-damage',
  'cyclone-flood-forces': 'u25rph06-sim24-cyclone-wind-flood-forces',
  'fire-hazard-protection': 'u25rph06-sim25-fire-hazard-thermal-barrier',
};

export function resolveU25RPH06SimId(simId: string): string {
  if (!simId) return '';
  const lower = simId.toLowerCase().trim();
  if (U25RPH06_ALIAS_MAP[lower]) {
    return U25RPH06_ALIAS_MAP[lower];
  }
  if (lower.startsWith('u25ph202-')) {
    const normalized = 'u25rph06-' + lower.slice(9);
    return U25RPH06_ALIAS_MAP[normalized] || normalized;
  }
  if (lower.startsWith('u25rpho6-')) {
    const normalized = 'u25rph06-' + lower.slice(9);
    return U25RPH06_ALIAS_MAP[normalized] || normalized;
  }
  if (lower === 'u25rph06' || lower === 'u25ph202' || lower === 'u25rpho6') {
    return 'u25rph06-sim01-frp-composites';
  }
  const simMatch = lower.match(/^sim0*([1-9]|1[0-9]|2[0-5])$/);
  if (simMatch && simMatch[1]) {
    const num = parseInt(simMatch[1], 10);
    const targetSim = PHYSICS_CIVIL_SIMULATIONS.find((s) => s.simNumber === num);
    if (targetSim) return targetSim.id;
  }
  return simId;
}

/**
 * Generate standard ISimulationDefinition entries from syllabus metadata.
 */
export const U25RPH06_BOARD_SIMULATIONS: ISimulationDefinition[] = PHYSICS_CIVIL_SIMULATIONS.map((meta) => {
  const parameters: ISimulationParam[] = Object.entries(meta.defaultParams).slice(0, 4).map(([key, value]) => {
    if (typeof value === 'boolean') {
      return { key, label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()), type: 'boolean', default: value };
    }
    if (typeof value === 'number') {
      return {
        key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
        type: 'number',
        default: value,
        min: 0,
        max: Math.max(100, value * 2),
      };
    }
    return {
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
      type: 'select',
      default: String(value),
      options: [
        { label: String(value), value: String(value) },
      ],
    };
  });

  const metrics: ISimulationMetric[] = meta.observationColumns.slice(0, 3).map((col) => ({
    id: col.key,
    key: col.key,
    label: col.label,
    format: (state: any, p: Record<string, any>) => {
      const val = p[col.key] ?? state?.[col.key];
      if (val !== undefined && val !== null) {
        return typeof val === 'number' ? `${val.toFixed(1)} ${col.unit || ''}` : `${val} ${col.unit || ''}`;
      }
      return `-- ${col.unit || ''}`;
    },
    unit: col.unit,
  }));

  return {
    id: meta.id,
    title: meta.title,
    domain: 'CIVIL',
    category: 'physics for civil engineers',
    icon: meta.icon,
    shortDescription: meta.shortDescription,
    detailedDescription: meta.detailedDescription,
    learningObjectives: meta.learningObjectives,
    subjectKeywords: U25RPH06_SUBJECT_KEYWORDS,
    boardEngine: 'physics-civil',
    level: 'undergraduate',
    difficulty: 'intermediate',
    unit: meta.unitNumber,
    suggestedUnits: [meta.unitNumber],
    unitTitle: meta.unitTitle,
    topic: meta.syllabusReference.officialTopicTitle,
    formulaOverview: meta.governingFormulas.map((f) => f.expression).join(' | '),
    tags: [
      'Physics for Civil Engineers',
      'U25RPH06',
      'Civil Engineering',
      `Unit ${meta.unitNumber}`,
      meta.unitTitle,
      meta.syllabusReference.courseOutcome,
      'R2025 Revised CBCS',
    ],
    parameters,
    metrics,
    engine: {
      createInitialState: (params: Record<string, any>) => ({
        timestamp: Date.now(),
        params: { ...meta.defaultParams, ...params },
      }),
      update: (state: any, params: Record<string, any>) => {
        return { ...state, params: { ...state.params, ...params } };
      },
      render: (ctx: CanvasRenderingContext2D, width: number, height: number, _state: any, _params: Record<string, any>) => {
        // High-fidelity educational 2D canvas fallback
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Header banner
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, 70);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText(`U25RPH06: ${meta.title}`, 20, 32);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText(`Unit ${meta.unitNumber}: ${meta.unitTitle} • ${meta.syllabusReference.courseOutcome} (${meta.syllabusReference.courseOutcomeDescription})`, 20, 54);

        // Main schematic box
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        const boxW = Math.min(width - 40, 720);
        const boxH = Math.min(height - 130, 400);
        ctx.fillRect(20, 90, boxW, boxH);
        ctx.strokeRect(20, 90, boxW, boxH);

        // Content inside box
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 15px system-ui, sans-serif';
        ctx.fillText('Civil Engineering Physics Demonstration', 40, 125);

        ctx.fillStyle = '#f59e0b';
        ctx.font = '13px monospace';
        const formula = meta.governingFormulas[0]?.expression || '';
        ctx.fillText(`Formula: ${formula}`, 40, 160);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '13px system-ui, sans-serif';
        ctx.fillText(`• Learning Objective: ${meta.learningObjectives[0] || ''}`, 40, 200);
        ctx.fillText(`• Civil Practice: ${meta.civilEngineeringUse[0] || ''}`, 40, 235);
        ctx.fillText(`• Civil Scenario: ${meta.civilPracticalScenario.slice(0, 75)}...`, 40, 270);

        ctx.fillStyle = '#34d399';
        ctx.fillText('⚡ Rich interactive simulation controls available in the Physics Civil Studio view.', 40, 325);
      },
    },
  };
});
