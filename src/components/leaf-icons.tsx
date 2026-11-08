import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

type LeafProps = { size: number };

const OUTLINE = '#173D28';
const VEIN = '#D4E9B7';

export function MonsteraLeaf({ size }: LeafProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M32 49 C32 54 32 58 30 62" stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" />
      <Path
        d="M31 52 C23 56 15 52 16 45 C8 46 4 40 8 34 C1 30 4 22 11 21 C7 14 15 9 21 13 C22 6 29 4 32 11 C36 4 43 7 43 14 C50 9 57 14 53 21 C61 22 62 30 56 34 C61 40 56 47 49 45 C49 52 40 56 33 52 Z"
        fill="#3E9657"
        stroke={OUTLINE}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M32 51 C26 41 24 27 32 12 C40 27 39 41 32 51 Z" fill="#52A967" opacity={0.9} />
      <Path d="M32 51 L32 14" stroke="#255F3A" strokeWidth={2} strokeLinecap="round" />
      <G stroke={VEIN} strokeWidth={2.2} strokeLinecap="round">
        <Path d="M27 24 L18 18" />
        <Path d="M26 32 L13 28" />
        <Path d="M27 40 L15 42" />
        <Path d="M37 24 L46 18" />
        <Path d="M38 32 L51 28" />
        <Path d="M37 40 L49 42" />
      </G>
      <Ellipse cx="25" cy="20" rx="1.8" ry="3.2" fill={OUTLINE} transform="rotate(-35 25 20)" />
      <Ellipse cx="39" cy="20" rx="1.8" ry="3.2" fill={OUTLINE} transform="rotate(35 39 20)" />
    </Svg>
  );
}

export function PeaceLilyLeaf({ size }: LeafProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M29 61 C15 55 7 40 12 20 C25 28 32 44 29 61 Z"
        fill="#2F7D47"
        stroke={OUTLINE}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M28 58 C24 45 19 32 12 20" stroke="#75B879" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <Path
        d="M35 61 C49 55 57 40 52 20 C39 28 32 44 35 61 Z"
        fill="#44965A"
        stroke={OUTLINE}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M36 58 C40 45 45 32 52 20" stroke="#8CC98B" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <Path d="M32 61 L32 30" stroke={OUTLINE} strokeWidth={2.4} strokeLinecap="round" />
      <Path
        d="M32 5 C43 12 45 26 32 37 C20 28 21 14 32 5 Z"
        fill="#FFFDF5"
        stroke={OUTLINE}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M31 34 C28 25 28 15 32 6" stroke="#DDE5D2" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Ellipse cx="33" cy="22" rx="2.8" ry="8" fill="#EACB58" stroke="#89651D" strokeWidth={1} />
    </Svg>
  );
}

const BEGONIA_DOTS = [
  [22, 45, 2.1],
  [27, 36, 2.3],
  [34, 29, 2.1],
  [42, 21, 2],
  [50, 14, 1.8],
  [33, 45, 1.7],
  [40, 36, 1.8],
  [48, 27, 1.6],
] as const;

export function BegoniaMaculataLeaf({ size }: LeafProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M17 51 L9 61" stroke="#873C48" strokeWidth={3} strokeLinecap="round" />
      <Path
        d="M16 52 C9 39 16 22 32 12 C43 5 55 5 59 8 C55 19 51 32 41 43 C33 52 23 57 16 52 Z"
        fill="#3F7250"
        stroke={OUTLINE}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M16 52 C27 53 39 43 47 30 C53 20 57 11 59 8"
        stroke="#A94F5A"
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M17 51 Q36 31 58 9" stroke="#244E35" strokeWidth={2} fill="none" strokeLinecap="round" />
      {BEGONIA_DOTS.map(([cx, cy, r]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#EAF1DA" />
      ))}
    </Svg>
  );
}

export function PhilodendronBrasilLeaf({ size }: LeafProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M32 17 Q33 8 42 3" stroke={OUTLINE} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path
        d="M32 61 C23 54 7 42 8 26 C9 14 22 9 32 19 C42 9 55 14 56 26 C57 42 41 54 32 61 Z"
        fill="#3C9351"
        stroke={OUTLINE}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M32 20 C39 31 39 46 32 59 C25 46 25 31 32 20 Z" fill="#D1DC58" />
      <Path d="M32 20 C28 30 29 45 32 59 C36 45 36 30 32 20 Z" fill="#F0E66B" opacity={0.8} />
      <Path d="M20 27 C24 32 26 38 26 45 C22 40 20 34 20 27 Z" fill="#8FC34D" />
      <Path d="M44 27 C40 32 38 38 38 45 C42 40 44 34 44 27 Z" fill="#8FC34D" />
      <Path d="M32 20 L32 59" stroke="#557B32" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function AnthuriumFlower({ size }: LeafProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M32 54 C33 58 32 61 31 63" stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" />
      <Path
        d="M32 20 C23 9 7 14 8 29 C9 42 23 50 32 58 C41 50 55 42 56 29 C57 14 41 9 32 20 Z"
        fill="#D94A4F"
        stroke="#70242E"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M32 22 C28 34 27 46 32 57" stroke="#A92F39" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M31 22 C21 24 15 30 12 38 M33 22 C43 24 49 30 52 38" stroke="#EB7375" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <Ellipse cx="20" cy="23" rx="6" ry="3" fill="#FFFFFF" opacity={0.3} transform="rotate(-24 20 23)" />
      <Path d="M32 21 C31 30 33 39 38 46" stroke="#8C6927" strokeWidth={6} fill="none" strokeLinecap="round" />
      <Path d="M32 21 C31 30 33 39 38 46" stroke="#F2D66B" strokeWidth={4.2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

const PALM_FRONDS = [
  'M35 21 C26 10 14 10 4 19 C16 17 26 19 35 23 Z',
  'M36 21 C47 11 59 14 63 25 C53 20 44 20 36 23 Z',
  'M36 21 C31 8 21 3 11 6 C21 10 29 15 36 23 Z',
  'M36 21 C40 8 50 3 60 8 C50 10 43 16 36 23 Z',
  'M35 22 C25 22 18 29 16 40 C23 33 29 27 36 24 Z',
  'M36 22 C46 24 52 32 51 42 C47 34 42 28 35 24 Z',
] as const;

export function PalmTree({ size }: LeafProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M28 62 C31 48 31 35 36 21" stroke="#604629" strokeWidth={7} fill="none" strokeLinecap="round" />
      <Path d="M28 62 C31 48 31 35 36 21" stroke="#A77A43" strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <Path d="M29 54 L33 56 M30 46 L34 48 M32 38 L35 40 M33 30 L37 32" stroke="#6B4B2C" strokeWidth={1.3} strokeLinecap="round" />
      {PALM_FRONDS.map((d, index) => (
        <Path
          key={d}
          d={d}
          fill={index % 2 === 0 ? '#48A45F' : '#32824B'}
          stroke={OUTLINE}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      ))}
      <Circle cx="33.5" cy="24" r="2.8" fill="#855A2E" stroke="#54391F" strokeWidth={1} />
      <Circle cx="39" cy="24.5" r="2.8" fill="#704724" stroke="#54391F" strokeWidth={1} />
    </Svg>
  );
}
