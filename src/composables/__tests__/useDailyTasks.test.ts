// Unit-тесты для useDailyTasks composable
// TDD подход: Red-Green-Refactor
// Соответствует FR-ARCH-006 из PRD

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useDailyTasks } from '../useDailyTasks';
import { useSettingsStore } from '@/store/settings';

describe('useDailyTasks (Composable)', () => {
  let composable: ReturnType<typeof useDailyTasks>;
  let settingsStore: ReturnType<typeof useSettingsStore>;

  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
    localStorage.removeItem('dailyTasksState');

    setActivePinia(createPinia());
    settingsStore = useSettingsStore();

    // Мокаем дату для детерминированности
    vi.spyOn(Date.prototype, 'toDateString').mockReturnValue('2024-02-11');
  });

  describe('API', () => {
    it('should export all required properties (FR-ARCH-006)', () => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;

      composable = useDailyTasks();

      // Getters
      expect(composable.dailyTasks).toBeDefined();
      expect(composable.stats).toBeDefined();
      expect(composable.allCompleted).toBeDefined();

      // Actions
      expect(composable.ensureTasks).toBeDefined();
      expect(typeof composable.ensureTasks).toBe('function');

      expect(composable.updateExerciseProgress).toBeDefined();
      expect(typeof composable.updateExerciseProgress).toBe('function');

      expect(composable.getTasksForExercise).toBeDefined();
      expect(typeof composable.getTasksForExercise).toBe('function');

      expect(composable.getExerciseProgress).toBeDefined();
      expect(typeof composable.getExerciseProgress).toBe('function');
    });

    it('should provide reactive dailyTasks', () => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;

      composable = useDailyTasks();
      composable.ensureTasks();

      expect(composable.dailyTasks.value).toBeDefined();
      expect(Array.isArray(composable.dailyTasks.value)).toBe(true);
    });

    it('should provide reactive stats', () => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;

      composable = useDailyTasks();
      composable.ensureTasks();

      expect(composable.stats.value).toBeDefined();
      expect(composable.stats.value.total).toBeGreaterThan(0);
    });
  });

  describe('ensureTasks', () => {
    it('should generate tasks if not exists', () => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;

      composable = useDailyTasks();
      composable.ensureTasks();

      expect(composable.dailyTasks.value.length).toBeGreaterThan(0);
    });

    it('should not regenerate if tasks already exist for today', () => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;

      composable = useDailyTasks();
      composable.ensureTasks();
      const firstTasks = composable.dailyTasks.value;

      composable.ensureTasks();
      const secondTasks = composable.dailyTasks.value;

      expect(firstTasks).toEqual(secondTasks);
    });
  });

  describe('updateExerciseProgress', () => {
    beforeEach(() => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;
    });

    it('should update progress for exercise type', () => {
      composable = useDailyTasks();
      composable.ensureTasks();

      const initialCurrent = composable.dailyTasks.value[0]?.current ?? 0;

      composable.updateExerciseProgress('counting', 1);

      expect(composable.dailyTasks.value[0]?.current).toBe(initialCurrent + 1);
    });

    it('should handle unknown exercise type gracefully', () => {
      composable = useDailyTasks();
      composable.ensureTasks();

      expect(() => {
        composable.updateExerciseProgress('unknown_type' as never, 1);
      }).not.toThrow();
    });
  });

  describe('getTasksForExercise', () => {
    beforeEach(() => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;
    });

    it('should return tasks for given exercise type', () => {
      composable = useDailyTasks();
      composable.ensureTasks();

      const countingTasks = composable.getTasksForExercise('counting');

      expect(countingTasks).toBeDefined();
      expect(Array.isArray(countingTasks)).toBe(true);
      countingTasks?.forEach(task => {
        expect(task.type).toBe('counting');
      });
    });

    it('should return empty array for unknown exercise type', () => {
      composable = useDailyTasks();
      composable.ensureTasks();

      const unknownTasks = composable.getTasksForExercise('unknown_type' as never);

      expect(unknownTasks).toEqual([]);
    });

    it('should return undefined or empty array when no tasks', () => {
      composable = useDailyTasks();

      const countingTasks = composable.getTasksForExercise('counting');

      expect(countingTasks).toEqual([]);
    });
  });

  describe('getExerciseProgress', () => {
    beforeEach(() => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;
    });

    it('should return progress for exercise type', () => {
      composable = useDailyTasks();
      composable.ensureTasks();

      const progress = composable.getExerciseProgress('counting');

      expect(progress).toBeDefined();
      expect(progress).toHaveProperty('current');
      expect(progress).toHaveProperty('target');
      expect(progress).toHaveProperty('completed');
    });

    it('should return aggregated progress for all tasks of exercise type', () => {
      composable = useDailyTasks();
      composable.ensureTasks();

      const countingTasks = composable.getTasksForExercise('counting');
      const progress = composable.getExerciseProgress('counting');

      // Проверяем, что прогресс агрегирован правильно
      expect(progress?.target).toBeGreaterThan(0);

      // Если есть несколько counting задач, target должен быть суммой
      if (countingTasks && countingTasks.length > 1) {
        const expectedTarget = countingTasks.reduce((sum, t) => sum + t.target, 0);
        expect(progress?.target).toBe(expectedTarget);
      }
    });

    it('should return zero progress for unknown exercise type', () => {
      composable = useDailyTasks();
      composable.ensureTasks();

      const progress = composable.getExerciseProgress('unknown_type' as never);

      expect(progress).toEqual({ current: 0, target: 0, completed: false });
    });

    it('should return zero progress when no tasks', () => {
      composable = useDailyTasks();

      const progress = composable.getExerciseProgress('counting');

      expect(progress).toEqual({ current: 0, target: 0, completed: false });
    });

    it('should calculate completed correctly', () => {
      composable = useDailyTasks();
      composable.ensureTasks();

      // Обновляем прогресс до завершения
      composable.updateExerciseProgress('counting', 100);

      const progress = composable.getExerciseProgress('counting');

      expect(progress?.completed).toBe(true);
    });
  });
});
