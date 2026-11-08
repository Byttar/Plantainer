/** Hand-drawn SVG icons, stored on the plant as `svg:<name>`. */
export const SvgPlantIcons = [
  'svg:monstera',
  'svg:peace-lily',
  'svg:begonia-maculata',
  'svg:philodendron-brasil',
  'svg:anthurium',
  'svg:palm',
] as const;

export type SvgPlantIcon = (typeof SvgPlantIcons)[number];

export const SvgPlantIconLabels: Record<SvgPlantIcon, string> = {
  'svg:monstera': 'Monstera deliciosa',
  'svg:peace-lily': 'Peace lily',
  'svg:begonia-maculata': 'Begonia maculata',
  'svg:philodendron-brasil': 'Philodendron Brasil',
  'svg:anthurium': 'Red anthurium',
  'svg:palm': 'Palm tree',
};

export const EmojiPlantIcons = [
  '🪴',
  '🌿',
  '🌱',
  '🌵',
  '🍀',
  '🌸',
  '🌻',
  '🌹',
  '🌷',
  '🌺',
  '🌳',
  '🌴',
  '🎋',
  '🍃',
  '🌾',
  '🍅',
  '🌶️',
  '🍓',
] as const;

export const DefaultPlantIcon: string = EmojiPlantIcons[0];

export function isSvgPlantIcon(icon: string): icon is SvgPlantIcon {
  return (SvgPlantIcons as readonly string[]).includes(icon);
}
