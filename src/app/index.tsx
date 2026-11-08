import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AddPlantModal } from '@/components/add-plant-modal';
import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { LearningInfoModal } from '@/components/learning-info-modal';
import { PlantCard } from '@/components/plant-card';
import { PlantDetailsModal } from '@/components/plant-details-modal';
import { Colors, MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import { usePlants } from '@/context/plants-context';
import { useNow } from '@/hooks/use-now';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { sortByUrgency } from '@/lib/schedule';
import type { Plant, ViewMode } from '@/types/plant';

const FAB_SIZE = 64;

export default function HomeScreen() {
  const insets = useScreenInsets();
  const now = useNow();
  const { plants, temperatureHistory, viewMode, setViewMode } = usePlants();

  const [addVisible, setAddVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [learningPlant, setLearningPlant] = useState<Plant | null>(null);

  const items = sortByUrgency(plants, now, temperatureHistory);
  const selectedPlant = plants.find((plant) => plant.id === selectedId) ?? null;
  const thirstyCount = items.filter(
    ({ schedule }) => schedule.status === 'needsWater' || schedule.status === 'atRisk',
  ).length;
  const isGrid = viewMode === 'grid';

  return (
    <View style={styles.screen}>
      <FlatList
        key={viewMode}
        data={items}
        keyExtractor={({ plant }) => plant.id}
        numColumns={isGrid ? 2 : 1}
        columnWrapperStyle={isGrid ? styles.gridRow : undefined}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.three, paddingBottom: FAB_SIZE + Spacing.five },
        ]}
        ListHeaderComponent={
          <Header
            plantCount={plants.length}
            thirstyCount={thirstyCount}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
          />
        }
        ListEmptyComponent={<EmptyState onAdd={() => setAddVisible(true)} />}
        renderItem={({ item }) => (
          <View style={isGrid ? styles.gridItem : undefined}>
            <PlantCard
              plant={item.plant}
              schedule={item.schedule}
              now={now}
              variant={viewMode}
              onPress={() => setSelectedId(item.plant.id)}
              onLearningPress={() => setLearningPlant(item.plant)}
            />
          </View>
        )}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add plant"
        onPress={() => setAddVisible(true)}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.floatingBottom + Spacing.four },
          pressed && styles.fabPressed,
        ]}>
        <Icon name="add" size={32} color={Colors.textOnPrimary} />
      </Pressable>

      <AddPlantModal visible={addVisible} onClose={() => setAddVisible(false)} />
      <PlantDetailsModal plant={selectedPlant} now={now} onClose={() => setSelectedId(null)} />
      <LearningInfoModal
        visible={learningPlant !== null}
        recorded={learningPlant?.waterings.length}
        onClose={() => setLearningPlant(null)}
      />
    </View>
  );
}

type HeaderProps = {
  plantCount: number;
  thirstyCount: number;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
};

function Header({ plantCount, thirstyCount, viewMode, onChangeViewMode }: HeaderProps) {
  let subtitle = 'Your garden is waiting for its first plant';
  if (plantCount > 0) {
    subtitle =
      thirstyCount > 0
        ? `${thirstyCount} of ${plantCount} ${plantCount === 1 ? 'plant needs' : 'plants need'} water`
        : `All ${plantCount} ${plantCount === 1 ? 'plant is' : 'plants are'} happy`;
  }

  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <AppText variant="title">Plantainer</AppText>
        <AppText color={Colors.textMuted}>{subtitle}</AppText>
      </View>
      {plantCount > 0 ? (
        <View style={styles.toggle}>
          {(['list', 'grid'] as const).map((mode) => {
            const active = viewMode === mode;
            return (
              <Pressable
                key={mode}
                accessibilityRole="button"
                accessibilityLabel={mode === 'list' ? 'List view' : 'Grid view'}
                accessibilityState={{ selected: active }}
                onPress={() => onChangeViewMode(mode)}
                style={[styles.toggleButton, active && styles.toggleButtonActive]}>
                <Icon
                  name={mode}
                  size={20}
                  color={active ? Colors.textOnPrimary : Colors.primaryDark}
                />
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.empty}>
      <AppText style={styles.emptyIcon}>🌱</AppText>
      <AppText variant="heading">No plants yet</AppText>
      <AppText color={Colors.textMuted} style={styles.centered}>
        Add your first plant and start recording waterings. We’ll learn its rhythm for you.
      </AppText>
      <AppButton label="Add a plant" onPress={onAdd} />
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
    gap: Spacing.three,
    flexGrow: 1,
  },
  gridRow: {
    gap: Spacing.three,
  },
  gridItem: {
    flex: 1 / 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSoft,
    borderRadius: Radius.pill,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
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
  fab: {
    position: 'absolute',
    right: Spacing.four,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow,
  },
  fabPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.95 }],
  },
});
