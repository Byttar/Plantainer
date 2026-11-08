import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';

import { withDevPlants, withDevTemperatureHistory } from '@/lib/dev-seed';
import { createCareReminder, reapplyCareReminder } from '@/lib/care-reminders';
import { toLocalDateKey } from '@/lib/local-date';
import { cancelPlantNotifications } from '@/lib/notifications';
import {
  clearAllData,
  DefaultNotificationSettings,
  loadData,
  loadNotificationSettings,
  loadViewMode,
  saveData,
  saveNotificationSettings,
  saveViewMode,
  type NotificationSettings,
} from '@/lib/storage';
import type {
  Plant,
  ReminderIntervalUnit,
  TemperatureLevel,
  TemperatureRecord,
  ViewMode,
} from '@/types/plant';

type ReminderInput = {
  title: string;
  intervalValue: number;
  intervalUnit: ReminderIntervalUnit;
};

type PlantsContextValue = {
  loaded: boolean;
  plants: Plant[];
  temperatureHistory: TemperatureRecord[];
  viewMode: ViewMode;
  notificationSettings: NotificationSettings;
  setNotificationSettings: (settings: NotificationSettings) => void;
  setViewMode: (mode: ViewMode) => void;
  recordTemperature: (level: TemperatureLevel, date?: string) => void;
  addPlant: (input: { name: string; icon: string }) => Plant;
  waterPlant: (id: string) => void;
  undoLastWatering: (id: string) => void;
  setPestReminder: (id: string, input: Omit<ReminderInput, 'intervalUnit'>) => void;
  setFertilizerReminder: (id: string, input: ReminderInput) => void;
  reapplyPestTreatment: (id: string) => void;
  reapplyFertilizer: (id: string) => void;
  removePestReminder: (id: string) => void;
  removeFertilizerReminder: (id: string) => void;
  removePlant: (id: string) => void;
  deleteAllData: () => Promise<void>;
  replaceAllData: (data: { plants: Plant[]; temperatureHistory: TemperatureRecord[] }) => void;
};

const PlantsContext = createContext<PlantsContextValue | null>(null);

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PlantsProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [temperatureHistory, setTemperatureHistory] = useState<TemperatureRecord[]>([]);
  const [viewMode, setViewModeState] = useState<ViewMode>('list');
  const [notificationSettings, setNotificationSettingsState] = useState(
    DefaultNotificationSettings,
  );
  const hydrated = useRef(false);

  useEffect(() => {
    Promise.all([loadData(), loadViewMode(), loadNotificationSettings()]).then(
      ([data, mode, notifications]) => {
      const now = Date.now();
      setPlants(withDevPlants(data.plants, now));
      setTemperatureHistory(withDevTemperatureHistory(data.temperatureHistory, now));
      setViewModeState(mode);
      setNotificationSettingsState(notifications);
      hydrated.current = true;
      setLoaded(true);
      },
    );
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveData({ version: 3, plants, temperatureHistory });
  }, [plants, temperatureHistory]);

  const updatePlant = (id: string, update: (plant: Plant) => Plant) => {
    setPlants((current) => current.map((plant) => (plant.id === id ? update(plant) : plant)));
  };

  const value: PlantsContextValue = {
    loaded,
    plants,
    temperatureHistory,
    viewMode,
    notificationSettings,
    setNotificationSettings: (settings) => {
      setNotificationSettingsState(settings);
      saveNotificationSettings(settings);
    },
    setViewMode: (mode) => {
      setViewModeState(mode);
      saveViewMode(mode);
    },
    recordTemperature: (level, date = toLocalDateKey()) => {
      setTemperatureHistory((current) =>
        [...current.filter((record) => record.date !== date), { date, level }].sort((a, b) =>
          a.date.localeCompare(b.date),
        ),
      );
    },
    addPlant: ({ name, icon }) => {
      const plant: Plant = {
        id: createId(),
        name: name.trim(),
        icon,
        createdAt: Date.now(),
        waterings: [],
      };
      setPlants((current) => [...current, plant]);
      return plant;
    },
    waterPlant: (id) => {
      updatePlant(id, (plant) => ({ ...plant, waterings: [...plant.waterings, Date.now()] }));
    },
    undoLastWatering: (id) => {
      updatePlant(id, (plant) => ({ ...plant, waterings: plant.waterings.slice(0, -1) }));
    },
    setPestReminder: (id, input) => {
      updatePlant(id, (plant) => ({
        ...plant,
        pestReminder: createCareReminder(
          { ...input, intervalUnit: 'days' },
          plant.pestReminder,
        ),
      }));
    },
    setFertilizerReminder: (id, input) => {
      updatePlant(id, (plant) => ({
        ...plant,
        fertilizerReminder: createCareReminder(input, plant.fertilizerReminder),
      }));
    },
    reapplyPestTreatment: (id) => {
      updatePlant(id, (plant) =>
        plant.pestReminder
          ? { ...plant, pestReminder: reapplyCareReminder(plant.pestReminder) }
          : plant,
      );
    },
    reapplyFertilizer: (id) => {
      updatePlant(id, (plant) =>
        plant.fertilizerReminder
          ? { ...plant, fertilizerReminder: reapplyCareReminder(plant.fertilizerReminder) }
          : plant,
      );
    },
    removePestReminder: (id) => {
      updatePlant(id, ({ pestReminder: _removed, ...plant }) => plant);
    },
    removeFertilizerReminder: (id) => {
      updatePlant(id, ({ fertilizerReminder: _removed, ...plant }) => plant);
    },
    removePlant: (id) => {
      setPlants((current) => current.filter((plant) => plant.id !== id));
    },
    deleteAllData: async () => {
      await cancelPlantNotifications();
      await clearAllData();
      setPlants([]);
      setTemperatureHistory([]);
      setViewModeState('list');
      setNotificationSettingsState(DefaultNotificationSettings);
    },
    replaceAllData: (next) => {
      setPlants(next.plants);
      setTemperatureHistory(next.temperatureHistory);
    },
  };

  return <PlantsContext value={value}>{children}</PlantsContext>;
}

export function usePlants() {
  const context = use(PlantsContext);
  if (!context) throw new Error('usePlants must be used inside PlantsProvider');
  return context;
}
