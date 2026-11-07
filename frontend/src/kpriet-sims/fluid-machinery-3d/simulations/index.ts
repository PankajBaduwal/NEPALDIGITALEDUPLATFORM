import type { FluidMachinerySimId, SimulationController } from '../core/types';
import { BernoulliScene } from './01-bernoulli/BernoulliScene';
import { PipeFrictionScene } from './02-pipe-friction/PipeFrictionScene';
import { FlowMetersScene } from './03-flow-meters/FlowMetersScene';
import { PumpsScene } from './04-pumps/PumpsScene';
import { TurbinesScene } from './05-turbines/TurbinesScene';
import { PerformanceLabScene } from './06-performance/PerformanceLabScene';

export function createFluidMachinerySimulation(
  simId: FluidMachinerySimId,
  container: HTMLElement
): SimulationController {
  switch (simId) {
    case 'u25me-bernoulli-theorem':
      return new BernoulliScene(container);
    case 'u25me-pipe-friction':
      return new PipeFrictionScene(container);
    case 'u25me-flow-meters':
      return new FlowMetersScene(container);
    case 'u25me-centrifugal-reciprocating-pumps':
      return new PumpsScene(container);
    case 'u25me-hydraulic-turbines':
      return new TurbinesScene(container);
    case 'u25me-machinery-performance-lab':
    default:
      return new PerformanceLabScene(container);
  }
}
