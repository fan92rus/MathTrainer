import { defineStore } from 'pinia';
import { useStorage } from '@/composables/useStorage';
import {
  getCurrentQuarter,
  getDifficultySettings,
  type DifficultySettings
} from '@/utils/gradeHelpers';
import type { GradeLevel } from '@/types';

// Интерфейс для состояния настроек
export interface SettingsState {
  selectedGrade: GradeLevel | null;
  isFirstTime: boolean;
  currentQuarter: number;
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    selectedGrade: null, // Выбранный класс (1-4)
    isFirstTime: true, // Флаг первого входа
    currentQuarter: 1 // Текущая четверть (1-4)
  }),

  getters: {
    // Проверяет, выбран ли класс
    isGradeSelected: (state): boolean => state.selectedGrade !== null,

    // Получает настройки сложности для текущего класса и четверти
    difficultySettings: (state): DifficultySettings | null => {
      if (!state.selectedGrade) return null;

      return getDifficultySettings(state.selectedGrade, state.currentQuarter);
    },

    // Получает максимальное число для примеров на счет
    maxCountingNumber: (state): number => {
      if (!state.selectedGrade) return 20;

      const settings = getDifficultySettings(state.selectedGrade, state.currentQuarter);
      return settings ? settings.maxCountingNumber : 20;
    },

    // Получает максимальное число для примеров на разложение
    maxDecompositionNumber: (state): number => {
      if (!state.selectedGrade) return 100;

      const settings = getDifficultySettings(state.selectedGrade, state.currentQuarter);
      return settings ? settings.maxDecompositionNumber : 100;
    }
  },

  actions: {
    // Загружает настройки из хранилища
    loadSettings(): void {
      const { getItem } = useStorage();

      const savedGrade = getItem('selectedGrade');
      if (savedGrade !== null) {
        this.selectedGrade = parseInt(savedGrade, 10) as GradeLevel;
        this.isFirstTime = false;
      }

      // Определяем текущую четверть
      this.currentQuarter = getCurrentQuarter();
    },

    // Устанавливает выбранный класс
    setGrade(grade: GradeLevel): void {
      this.selectedGrade = grade;
      this.isFirstTime = false;
      // Обновляем текущую четверть при смене класса
      this.currentQuarter = getCurrentQuarter();
      this.saveGrade();
    },

    // Сохраняет выбранный класс
    saveGrade(): void {
      const { setItem } = useStorage();
      setItem('selectedGrade', this.selectedGrade?.toString() || '');
    },

    // Сбрасывает настройки (для тестирования)
    resetSettings(): void {
      this.selectedGrade = null;
      this.isFirstTime = true;

      const { removeItem } = useStorage();
      removeItem('selectedGrade');
    }
  }
});

// Типы для TypeScript при использовании store
export type SettingsStore = ReturnType<typeof useSettingsStore>;
