import { Platform } from 'react-native';

export const Colors = {
  primary: '#38854d',
  primaryDark: '#2a6a3c',
  primarySoft: '#d6e6d3',

  background: '#c3cfb4',
  backgroundSoft: '#dde5d3',
  surface: '#f3f6ee',
  border: '#b3c1a2',

  text: '#1f3a28',
  textMuted: '#5c6f5f',
  textOnPrimary: '#ffffff',

  warning: '#d99a1e',
  warningSoft: '#f8ecc6',
  danger: '#c0473a',
  dangerSoft: '#f4d6d0',
  neutral: '#7d8c7f',
  neutralSoft: '#e4e9de',

  overlay: 'rgba(22, 40, 28, 0.45)',

  tempIce: '#3d7ea6',
  tempCold: '#5a9ec4',
  tempNormal: '#c49a2a',
  tempHot: '#d9782b',
  tempFire: '#c0473a',
} as const;

export const Fonts = {
  heading: 'Fraunces_600SemiBold',
  headingBold: 'Fraunces_700Bold',
  body: 'Nunito_400Regular',
  bodyMedium: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const Shadow = Platform.select({
  web: { boxShadow: '0 4px 14px rgba(31, 58, 40, 0.12)' },
  default: {
    shadowColor: '#1f3a28',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});

export const MaxContentWidth = 800;
