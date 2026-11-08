import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

/** Cross-platform symbols: SF Symbols on iOS, Material Symbols on Android and web. */
export const Icons = {
  add: { ios: 'plus', android: 'add', web: 'add' },
  list: { ios: 'list.bullet', android: 'view_list', web: 'view_list' },
  grid: { ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view' },
  water: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  warning: {
    ios: 'exclamationmark.triangle.fill',
    android: 'warning',
    web: 'warning',
  },
  danger: {
    ios: 'exclamationmark.octagon.fill',
    android: 'error',
    web: 'error',
  },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  hourglass: { ios: 'hourglass', android: 'hourglass_top', web: 'hourglass_top' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  undo: {
    ios: 'arrow.uturn.backward',
    android: 'undo',
    web: 'undo',
  },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  stats: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' },
  trophy: { ios: 'trophy.fill', android: 'trophy', web: 'trophy' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  notification: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
  pest: { ios: 'ant.fill', android: 'pest_control', web: 'pest_control' },
  fertilizer: { ios: 'leaf.fill', android: 'eco', web: 'eco' },
  settings: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  export: { ios: 'square.and.arrow.up', android: 'ios_share', web: 'download' },
  import: { ios: 'square.and.arrow.down', android: 'file_open', web: 'upload_file' },
  tempIce: { ios: 'thermometer.snowflake', android: 'severe_cold', web: 'severe_cold' },
  tempCold: { ios: 'snowflake', android: 'ac_unit', web: 'ac_unit' },
  tempNormal: { ios: 'cloud.sun.fill', android: 'partly_cloudy_day', web: 'partly_cloudy_day' },
  tempHot: { ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' },
  tempFire: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' },
} as const satisfies Record<string, SymbolName>;

export type IconName = keyof typeof Icons;

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
};

export function Icon({ name, size = 20, color }: IconProps) {
  return <SymbolView name={Icons[name]} size={size} tintColor={color} />;
}
