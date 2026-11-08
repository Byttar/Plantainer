import { AppText } from '@/components/app-text';
import {
  AnthuriumFlower,
  BegoniaMaculataLeaf,
  MonsteraLeaf,
  PalmTree,
  PeaceLilyLeaf,
  PhilodendronBrasilLeaf,
} from '@/components/leaf-icons';
import { isSvgPlantIcon, type SvgPlantIcon } from '@/constants/plant-icons';

const SvgIcons: Record<SvgPlantIcon, typeof MonsteraLeaf> = {
  'svg:monstera': MonsteraLeaf,
  'svg:peace-lily': PeaceLilyLeaf,
  'svg:begonia-maculata': BegoniaMaculataLeaf,
  'svg:philodendron-brasil': PhilodendronBrasilLeaf,
  'svg:anthurium': AnthuriumFlower,
  'svg:palm': PalmTree,
};

type PlantIconProps = {
  icon: string;
  size: number;
};

/** Renders a plant icon, which is either an emoji or one of the bundled SVG illustrations. */
export function PlantIcon({ icon, size }: PlantIconProps) {
  if (isSvgPlantIcon(icon)) {
    const Illustration = SvgIcons[icon];
    return <Illustration size={size * 1.15} />;
  }
  return <AppText style={{ fontSize: size, lineHeight: Math.round(size * 1.25) }}>{icon}</AppText>;
}
