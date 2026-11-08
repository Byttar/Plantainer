import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon, type IconName } from '@/components/icon';
import { Colors, MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs style={styles.root}>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <TabBar>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="home">Home</TabButton>
          </TabTrigger>
          <TabTrigger name="statistics" href="/statistics" asChild>
            <TabButton icon="stats">Statistics</TabButton>
          </TabTrigger>
          <TabTrigger name="config" href="/config" asChild>
            <TabButton icon="settings">Config</TabButton>
          </TabTrigger>
        </TabBar>
      </TabList>
    </Tabs>
  );
}

/** Triggers must be direct children here: `TabList asChild` only looks one level deep for them. */
function TabBar({ children, style, ...props }: TabListProps) {
  return (
    <View {...props} style={[styles.tabBar, style]}>
      <View style={styles.tabBarInner}>{children}</View>
    </View>
  );
}

function TabButton({
  children,
  isFocused,
  icon,
  ref,
  ...props
}: TabTriggerSlotProps & { icon: IconName }) {
  const color = isFocused ? Colors.primary : Colors.textMuted;
  return (
    <Pressable
      {...props}
      // expo-router types the slot ref as Ref<View>, which doesn't match Pressable's host ref type.
      ref={ref as ComponentProps<typeof Pressable>['ref']}
      style={[styles.tabButton, isFocused && styles.tabButtonActive]}>
      <Icon name={icon} size={20} color={color} />
      <AppText variant="bodyBold" color={color}>
        {children}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slot: {
    flex: 1,
  },
  tabBar: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  tabBarInner: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: MaxContentWidth,
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    padding: Spacing.one,
    gap: Spacing.one,
    ...Shadow,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radius.pill,
  },
  tabButtonActive: {
    backgroundColor: Colors.primarySoft,
  },
});
