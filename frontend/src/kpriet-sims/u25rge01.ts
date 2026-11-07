import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';
import { MAKERSPACE_SIMULATIONS, COURSE_METADATA } from './makerspace/MakerspaceSimData';

export const U25RGE01_COURSE_METADATA = COURSE_METADATA;

/**
 * Authoritative Simulations for:
 * Course Code: U25RGE01 (Aliases: U25RGEO1, U25GE201)
 * Course Name: Makerspace (Common to all programmes)
 * Programme: B.E. Civil Engineering | Semester: I | Category: ESC | Credits: 2
 * Regulation: R2025 Revised CBCS
 * Official Source: CE - R2025 (Revised).pdf, Printed Pages 17–19
 *
 * Exactly 20 Approved Syllabus-Verified Interactive Simulations mapped across Modules 1 to 7 (60 Hours total).
 */
export const U25RGE01_SUBJECT_KEYWORDS = [
  'makerspace',
  'u25rge01',
  'u25rgeo1',
  'u25ge201',
  'rge01',
  'rgeo1',
  'workshop',
  'fabrication',
  'rapid prototyping',
];

/**
 * Map legacy, abbreviated, or alternate course code simulation IDs.
 */
export const U25RGE01_ALIAS_MAP: Record<string, string> = {
  // Alias with letter O instead of zero 0
  'u25rgeo1-sim01-arc-welding': 'u25rge01-sim01-arc-welding',
  'u25rgeo1-sim02-pipe-connections': 'u25rge01-sim02-pipe-connections',
  'u25rgeo1-sim03-laser-wire-welding': 'u25rge01-sim03-laser-wire-welding',
  'u25rgeo1-sim04-3d-modeller': 'u25rge01-sim04-3d-modeller',
  'u25rgeo1-sim05-3d-printing-prep': 'u25rge01-sim05-3d-printing-prep',
  'u25rgeo1-sim06-assembly-modelling': 'u25rge01-sim06-assembly-modelling',
  'u25rgeo1-sim07-mechatronics-explorer': 'u25rge01-sim07-mechatronics-explorer',
  'u25rgeo1-sim08-industrial-robotics': 'u25rge01-sim08-industrial-robotics',
  'u25rgeo1-sim09-automobile-performance': 'u25rge01-sim09-automobile-performance',
  'u25rgeo1-sim10-plc-logic': 'u25rge01-sim10-plc-logic',
  'u25rgeo1-sim11-electrical-safety': 'u25rge01-sim11-electrical-safety',
  'u25rgeo1-sim12-wiring-layout': 'u25rge01-sim12-wiring-layout',
  'u25rgeo1-sim13-motors-power-supply': 'u25rge01-sim13-motors-power-supply',
  'u25rgeo1-sim14-electronics-measurement': 'u25rge01-sim14-electronics-measurement',
  'u25rgeo1-sim15-arduino-embedded': 'u25rge01-sim15-arduino-embedded',
  'u25rgeo1-sim16-iot-integration': 'u25rge01-sim16-iot-integration',
  'u25rgeo1-sim17-pcb-placement': 'u25rge01-sim17-pcb-placement',
  'u25rgeo1-sim18-ai-demonstrations': 'u25rge01-sim18-ai-demonstrations',
  'u25rgeo1-sim19-ar-vr-demonstration': 'u25rge01-sim19-ar-vr-demonstration',
  'u25rgeo1-sim20-prototype-challenge': 'u25rge01-sim20-prototype-challenge',
  // Short names
  'makerspace-welding': 'u25rge01-sim01-arc-welding',
  'makerspace-pipes': 'u25rge01-sim02-pipe-connections',
  'makerspace-laser': 'u25rge01-sim03-laser-wire-welding',
  'makerspace-3d-cad': 'u25rge01-sim04-3d-modeller',
  'makerspace-3d-print': 'u25rge01-sim05-3d-printing-prep',
  'makerspace-assembly': 'u25rge01-sim06-assembly-modelling',
  'makerspace-mechatronics': 'u25rge01-sim07-mechatronics-explorer',
  'makerspace-robotics': 'u25rge01-sim08-industrial-robotics',
  'makerspace-automobile': 'u25rge01-sim09-automobile-performance',
  'makerspace-plc': 'u25rge01-sim10-plc-logic',
  'makerspace-electrical-safety': 'u25rge01-sim11-electrical-safety',
  'makerspace-wiring': 'u25rge01-sim12-wiring-layout',
  'makerspace-motors-ups': 'u25rge01-sim13-motors-power-supply',
  'makerspace-electronics': 'u25rge01-sim14-electronics-measurement',
  'makerspace-arduino': 'u25rge01-sim15-arduino-embedded',
  'makerspace-iot': 'u25rge01-sim16-iot-integration',
  'makerspace-pcb': 'u25rge01-sim17-pcb-placement',
  'makerspace-ai': 'u25rge01-sim18-ai-demonstrations',
  'makerspace-ar-vr': 'u25rge01-sim19-ar-vr-demonstration',
  'makerspace-prototype': 'u25rge01-sim20-prototype-challenge',
};

export function resolveU25RGE01SimId(simId: string): string {
  if (!simId) return '';
  const lower = simId.toLowerCase().trim();
  if (U25RGE01_ALIAS_MAP[lower]) {
    return U25RGE01_ALIAS_MAP[lower];
  }
  if (lower.startsWith('u25rgeo1-')) {
    const normalized = 'u25rge01-' + lower.slice(9);
    return U25RGE01_ALIAS_MAP[normalized] || normalized;
  }
  const expMatch = lower.match(/^exp([1-9]|1[0-9]|2[0-1])$/);
  if (expMatch && expMatch[1]) {
    const num = parseInt(expMatch[1], 10);
    const targetSim = MAKERSPACE_SIMULATIONS.find((s) => s.experimentNumber === num) ||
      (num === 21 ? MAKERSPACE_SIMULATIONS[MAKERSPACE_SIMULATIONS.length - 1] : undefined);
    if (targetSim) return targetSim.id;
  }
  return simId;
}

/**
 * Generate standard ISimulationDefinition entries from the syllabus metadata.
 */
export const U25RGE01_BOARD_SIMULATIONS: ISimulationDefinition[] = MAKERSPACE_SIMULATIONS.map((meta) => {
  // Extract parameters from defaultParams
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
      default: value,
      options: [{ label: String(value), value }],
    };
  });

  const metrics: ISimulationMetric[] = [
    {
      id: `${meta.id}-status`,
      label: 'Safety Status',
      format: () => meta.safetyLevel,
      badge: meta.safetyLevel === 'CRITICAL' ? 'Critical Safety' : 'Active Safe',
      color: meta.safetyLevel === 'CRITICAL' ? '#ef4444' : '#10b981',
    },
    {
      id: `${meta.id}-module`,
      label: 'Syllabus Module',
      format: () => `Module ${meta.moduleNumber} (${meta.syllabusReference.moduleHours}h)`,
      badge: meta.syllabusReference.courseOutcome,
      color: '#6366f1',
    },
  ];

  return {
    id: meta.id,
    title: meta.title,
    domain: 'CIVIL',
    category: 'makerspace',
    icon: meta.icon,
    boardEngine: 'makerspace',
    unit: meta.moduleNumber,
    unitTitle: `Module ${meta.moduleNumber}: ${meta.moduleTitle}`,
    topic: meta.title,
    makerspaceCategory: meta.moduleTitle.toLowerCase(),
    subjectKeywords: U25RGE01_SUBJECT_KEYWORDS,
    shortDescription: meta.shortDescription,
    detailedDescription: `${meta.detailedDescription} Syllabus Source: Printed Page ${meta.syllabusReference.printedPage}, ${meta.syllabusReference.module}, Exp ${meta.syllabusReference.experimentNumber}. Aligned with Course Outcome ${meta.syllabusReference.courseOutcome}: "${meta.syllabusReference.courseOutcomeDescription}".`,
    learningObjectives: meta.learningObjectives,
    suggestedUnits: [meta.moduleNumber],
    smartboardPresetKey: meta.id,
    tags: [
      'Makerspace',
      'U25RGE01',
      'Civil Engineering',
      'R2025 Revised CBCS',
      meta.moduleTitle,
      meta.syllabusReference.courseOutcome,
      `Exp ${meta.experimentNumber}`,
    ],
    parameters,
    metrics,
    engine: {
      createInitialState: () => ({ ...meta.defaultParams }),
      update: (state) => state,
      render: (ctx, width, height) => {
        // High-contrast clean 2D canvas fallback
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Title and badge
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText(`${meta.icon} ${meta.title}`, 30, 50);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText(`U25RGE01 | ${meta.syllabusReference.module} (Exp ${meta.experimentNumber})`, 30, 80);

        // Safety Banner
        if (meta.safetyLevel === 'CRITICAL' || meta.safetyLevel === 'HIGH') {
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(30, 105, width - 60, 42);
          ctx.fillStyle = '#fecaca';
          ctx.font = 'bold 12px system-ui, sans-serif';
          ctx.fillText(`⚠️ SAFETY NOTICE: ${meta.safetyNotice.slice(0, 110)}...`, 40, 131);
        }

        // Central visual area
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        const boxW = Math.min(width - 60, 680);
        const boxH = Math.min(height - 240, 360);
        const boxY = meta.safetyLevel === 'CRITICAL' || meta.safetyLevel === 'HIGH' ? 165 : 120;
        ctx.fillRect(30, boxY, boxW, boxH);
        ctx.strokeRect(30, boxY, boxW, boxH);

        // Educational details inside box
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillText('Engineering Simulation Concept & Interactive Workspace', 50, boxY + 40);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '13px system-ui, sans-serif';
        ctx.fillText(`• Course Outcome: ${meta.syllabusReference.courseOutcome} (${meta.syllabusReference.courseOutcomeDescription})`, 50, boxY + 75);
        ctx.fillText(`• Learning Objectives: ${meta.learningObjectives[0] || ''}`, 50, boxY + 105);
        ctx.fillText(`• Real-World Civil Use: ${meta.realWorldApplications[0] || ''}`, 50, boxY + 135);
        ctx.fillText(`• Engineering Principle: ${meta.engineeringIdea.slice(0, 80)}...`, 50, boxY + 165);

        ctx.fillStyle = '#a855f7';
        ctx.fillText('⚡ Rich interactive simulation controls available in the Makerspace Workshop view.', 50, boxY + 220);
      },
    },
  };
});
