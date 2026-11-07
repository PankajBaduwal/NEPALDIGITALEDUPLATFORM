/**
 * Scene Factory Exporter for Electrical Drives & Control 3D Simulations
 * Course Code: U25EE305 / ME3393 / EE8353
 */

import { BaseDrivesSimulation } from './BaseDrivesSimulation';
import { DCMotorScene } from './01-dc-motor/DCMotorScene';
import { InductionMotorScene } from './02-induction-motor/InductionMotorScene';
import { StartingMethodsScene } from './03-starting-methods/StartingMethodsScene';
import { BrakingScene } from './04-braking-methods/BrakingScene';
import { VFDScene } from './05-vfd-drive/VFDScene';
import { TorqueSpeedScene } from './06-torque-speed/TorqueSpeedScene';
import { ControlCircuitScene } from './07-control-circuits/ControlCircuitScene';
import { VirtualDrivesLabScene } from './08-virtual-lab/VirtualDrivesLabScene';

function createDrivesSceneRaw(simId: string, container: HTMLElement): BaseDrivesSimulation {
  switch (simId) {
    case 'u25ee305-sim-01':
      return new DCMotorScene(container);
    case 'u25ee305-sim-02':
      return new InductionMotorScene(container);
    case 'u25ee305-sim-03':
      return new StartingMethodsScene(container);
    case 'u25ee305-sim-04':
      return new BrakingScene(container);
    case 'u25ee305-sim-05':
      return new VFDScene(container);
    case 'u25ee305-sim-06':
      return new TorqueSpeedScene(container);
    case 'u25ee305-sim-07':
      return new ControlCircuitScene(container);
    case 'u25ee305-sim-08':
    default:
      return new VirtualDrivesLabScene(container);
  }
}

export {
  BaseDrivesSimulation,
  DCMotorScene,
  InductionMotorScene,
  StartingMethodsScene,
  BrakingScene,
  VFDScene,
  TorqueSpeedScene,
  ControlCircuitScene,
  VirtualDrivesLabScene,
};

/** Builds the scene and starts it once fully constructed (see the PORT NOTE in the base class). */
export function createDrivesScene(simId: string, container: HTMLElement): BaseDrivesSimulation {
  const scene = createDrivesSceneRaw(simId, container);
  scene.boot();
  return scene;
}
