import type { IconName } from '@/components/icon';
import { Colors } from '@/constants/theme';
import type { TemperatureLevel } from '@/types/plant';

export type TemperatureStep = {
  level: TemperatureLevel;
  label: string;
  icon: IconName;
  color: string;
};

export const TemperatureSteps: TemperatureStep[] = [
  { level: 1, label: 'Really cold', icon: 'tempIce', color: Colors.tempIce },
  { level: 2, label: 'Cold', icon: 'tempCold', color: Colors.tempCold },
  { level: 3, label: 'Normal', icon: 'tempNormal', color: Colors.tempNormal },
  { level: 4, label: 'Hot', icon: 'tempHot', color: Colors.tempHot },
  { level: 5, label: 'Really hot', icon: 'tempFire', color: Colors.tempFire },
];

export const TemperatureByLevel = Object.fromEntries(
  TemperatureSteps.map((step) => [step.level, step]),
) as Record<TemperatureLevel, TemperatureStep>;
