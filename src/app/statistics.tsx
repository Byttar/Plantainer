import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon, type IconName } from '@/components/icon';
import { PlantIcon } from '@/components/plant-icon';
import { StatusStyles } from '@/components/status-badge';
import { TemperatureByLevel } from '@/constants/temperature';
import { Colors, MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import { usePlants } from '@/context/plants-context';
import { useNow } from '@/hooks/use-now';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { formatInterval } from '@/lib/format';
import type { PlantStatus } from '@/lib/schedule';
import {
  getGardenStats,
  type DayStat,
  type PlantStat,
  type TemperatureDayStat,
} from '@/lib/stats';

const STATUS_ORDER: PlantStatus[] = ['atRisk', 'needsWater', 'ok', 'learning'];
const STATUS_LABELS: Record<PlantStatus, string> = {
  atRisk: 'At risk',
  needsWater: 'Needs water',
  ok: 'Happy',
  learning: 'Learning',
};

export default function StatisticsScreen() {
  const insets = useScreenInsets();
  const now = useNow();
  const { plants, temperatureHistory } = usePlants();
  const stats = getGardenStats(plants, now, temperatureHistory);

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.three }]}>
      <View style={styles.header}>
        <AppText variant="title">Statistics</AppText>
        <AppText color={Colors.textMuted}>How your garden has been doing</AppText>
      </View>

      <Section title="Temperature — last 7 days">
        <TemperatureChart week={stats.temperatureWeek} />
      </Section>

      {stats.totalPlants === 0 ? (
        <View style={styles.empty}>
          <AppText style={styles.emptyIcon}>📊</AppText>
          <AppText variant="heading">Nothing to show yet</AppText>
          <AppText color={Colors.textMuted} style={styles.centered}>
            Add plants and record waterings on the Home tab to see your garden’s statistics.
          </AppText>
        </View>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <SummaryCard icon="home" value={stats.totalPlants} label="Plants" />
            <SummaryCard icon="water" value={stats.wateringsThisWeek} label="Waterings this week" />
            <SummaryCard icon="calendar" value={stats.totalWaterings} label="Waterings in total" />
          </View>

          <Section title="This week">
            <WeekChart week={stats.week} />
          </Section>

          <Section title="Garden health">
            <View style={styles.statusGrid}>
              {STATUS_ORDER.map((status) => (
                <StatusTile key={status} status={status} count={stats.statusCounts[status]} />
              ))}
            </View>
          </Section>

          {stats.thirstiest || stats.mostWatered ? (
            <Section title="Highlights">
              {stats.thirstiest?.schedule.interval ? (
                <Highlight
                  icon="water"
                  title="Thirstiest plant"
                  stat={stats.thirstiest}
                  detail={formatInterval(stats.thirstiest.schedule.interval)}
                />
              ) : null}
              {stats.mostWatered ? (
                <Highlight
                  icon="trophy"
                  title="Most cared for"
                  stat={stats.mostWatered}
                  detail={`${stats.mostWatered.total} waterings`}
                />
              ) : null}
            </Section>
          ) : null}

          <Section title="Per plant">
            {stats.plants.map((stat) => (
              <PlantRow key={stat.plant.id} stat={stat} />
            ))}
          </Section>
        </>
      )}
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading">{title}</AppText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function SummaryCard({ icon, value, label }: { icon: IconName; value: number; label: string }) {
  return (
    <View style={[styles.card, styles.summaryCard]}>
      <Icon name={icon} size={22} color={Colors.primary} />
      <AppText variant="title" style={styles.summaryValue}>
        {value}
      </AppText>
      <AppText variant="caption" numberOfLines={2}>
        {label}
      </AppText>
    </View>
  );
}

const CHART_HEIGHT = 110;

function WeekChart({ week }: { week: DayStat[] }) {
  const max = Math.max(1, ...week.map((day) => day.count));
  return (
    <View style={styles.chart}>
      {week.map((day) => (
        <View key={day.key} style={styles.chartColumn}>
          <AppText variant="label" color={Colors.textMuted}>
            {day.count > 0 ? day.count : ''}
          </AppText>
          <View style={styles.chartTrack}>
            <View
              style={[
                styles.chartBar,
                {
                  height: `${(day.count / max) * 100}%`,
                  backgroundColor: day.isToday ? Colors.primaryDark : Colors.primary,
                },
              ]}
            />
          </View>
          <AppText
            variant="label"
            color={day.isToday ? Colors.primaryDark : Colors.textMuted}
            numberOfLines={1}>
            {day.isToday ? 'Today' : day.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const TEMPERATURE_CHART_HEIGHT = 120;

function TemperatureChart({ week }: { week: TemperatureDayStat[] }) {
  return (
    <View style={styles.temperatureChart}>
      {week.map((day) => {
        const temperature = day.level === null ? null : TemperatureByLevel[day.level];
        return (
          <View
            key={day.date}
            style={styles.temperatureColumn}
            accessible
            accessibilityLabel={`${day.isToday ? 'Today' : day.label}: ${
              temperature?.label ?? 'No temperature recorded'
            }`}>
            <View style={styles.temperatureIcon}>
              {temperature ? (
                <Icon name={temperature.icon} size={20} color={temperature.color} />
              ) : (
                <AppText variant="label" color={Colors.textMuted}>
                  —
                </AppText>
              )}
            </View>
            <View style={styles.temperatureTrack}>
              {temperature ? (
                <View
                  style={[
                    styles.temperatureBar,
                    {
                      height: `${(day.level! / 5) * 100}%`,
                      backgroundColor: temperature.color,
                    },
                  ]}
                />
              ) : null}
            </View>
            <AppText
              variant="label"
              color={day.isToday ? Colors.primaryDark : Colors.textMuted}
              numberOfLines={1}>
              {day.isToday ? 'Today' : day.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

function StatusTile({ status, count }: { status: PlantStatus; count: number }) {
  const { icon, color, background } = StatusStyles[status];
  return (
    <View style={[styles.statusTile, { backgroundColor: background }]}>
      <Icon name={icon} size={18} color={color} />
      <AppText variant="heading" color={color}>
        {count}
      </AppText>
      <AppText variant="label" color={color}>
        {STATUS_LABELS[status]}
      </AppText>
    </View>
  );
}

function Highlight({
  icon,
  title,
  stat,
  detail,
}: {
  icon: IconName;
  title: string;
  stat: PlantStat;
  detail: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Icon name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={styles.rowText}>
        <AppText variant="caption">{title}</AppText>
        <View style={styles.inlineIcon}>
          <PlantIcon icon={stat.plant.icon} size={16} />
          <AppText variant="bodyBold" numberOfLines={1} style={styles.rowText}>
            {stat.plant.name}
          </AppText>
        </View>
      </View>
      <AppText variant="caption">{detail}</AppText>
    </View>
  );
}

function PlantRow({ stat }: { stat: PlantStat }) {
  const { plant, schedule } = stat;
  const rhythm = schedule.interval !== null ? formatInterval(schedule.interval) : 'Still learning';
  return (
    <View style={styles.row}>
      <View style={styles.plantIcon}>
        <PlantIcon icon={plant.icon} size={28} />
      </View>
      <View style={styles.rowText}>
        <AppText variant="bodyBold" numberOfLines={1}>
          {plant.name}
        </AppText>
        <AppText variant="caption">{rhythm}</AppText>
      </View>
      <View style={styles.rowNumbers}>
        <AppText variant="bodyBold">{stat.total}</AppText>
        <AppText variant="caption">{stat.thisWeek} this week</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
    flexGrow: 1,
  },
  header: {
    gap: Spacing.one,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md + 4,
    padding: Spacing.three,
    gap: Spacing.three,
    ...Shadow,
  },
  section: {
    gap: Spacing.two,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  summaryCard: {
    flex: 1,
    gap: Spacing.one,
  },
  summaryValue: {
    fontSize: 30,
    lineHeight: 36,
  },
  chart: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  chartTrack: {
    width: '100%',
    height: CHART_HEIGHT,
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundSoft,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBar: {
    width: '100%',
    borderRadius: Radius.sm,
  },
  temperatureChart: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  temperatureColumn: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  temperatureIcon: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  temperatureTrack: {
    width: '100%',
    height: TEMPERATURE_CHART_HEIGHT,
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundSoft,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  temperatureBar: {
    width: '100%',
    borderRadius: Radius.sm,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statusTile: {
    flexGrow: 1,
    flexBasis: '45%',
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowNumbers: {
    alignItems: 'flex-end',
  },
  plantIcon: {
    width: 36,
    alignItems: 'center',
  },
  inlineIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  emptyIcon: {
    fontSize: 64,
    lineHeight: 76,
  },
  centered: {
    textAlign: 'center',
  },
});
