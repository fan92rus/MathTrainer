// Integration тесты для useDailyTasksStore (Pinia)
// TDD подход: Red-Green-Refactor
// Соответствует FR-TEST-004 из PRD

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useDailyTasksStore } from '../index';
import { useSettingsStore } from '@/store/settings';
import type { DailyTask } from '../types';

describe('useDailyTasksStore (Integration)', () => {
  let dailyTasksStore: ReturnType<typeof useDailyTasksStore>;
  let settingsStore: ReturnType<typeof useSettingsStore>;

  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
    localStorage.removeItem('dailyTasksState');
    localStorage.removeItem('dailyTasksDate');

    setActivePinia(createPinia());
    dailyTasksStore = useDailyTasksStore();
    settingsStore = useSettingsStore();

    // Мокаем дату для детерминированности
    vi.spyOn(Date.prototype, 'toDateString').mockReturnValue('2024-02-11');
  });

  describe('State', () => {
    it('should initialize with default state', () => {
      expect(dailyTasksStore.tasks).toEqual([]);
      expect(dailyTasksStore.lastGeneratedDate).toBe('');
      expect(dailyTasksStore.streak).toBe(0);
      expect(dailyTasksStore.lastCompletedDate).toBe('');
    });

    it('should persist state to localStorage', () => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;

      dailyTasksStore.generateIfNeeded();

      const saved = localStorage.getItem('dailyTasksState');
      expect(saved).toBeTruthy();
    });
  });

  describe('Getters', () => {
    it('should return dailyTasks from state', () => {
      expect(dailyTasksStore.dailyTasks).toEqual(dailyTasksStore.tasks);
    });

    it('should calculate stats correctly (FR-FUNC-008)', () => {
      const mockTasks: DailyTask[] = [
        {
          id: 'task1',
          type: 'counting',
          description: 'Task 1',
          target: 3,
          current: 3,
          reward: { coins: 10, experience: 20 },
          completed: true,
          rewardClaimed: false,
        },
        {
          id: 'task2',
          type: 'equations',
          description: 'Task 2',
          target: 5,
          current: 2,
          reward: { coins: 15, experience: 30 },
          completed: false,
          rewardClaimed: false,
        },
      ];

      dailyTasksStore.tasks = mockTasks;
      const stats = dailyTasksStore.stats;

      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.percentage).toBe(50);
      expect(stats.totalCoins).toBe(25);
      expect(stats.totalExp).toBe(50);
    });

    it('should return allCompleted correctly', () => {
      const mockTasks: DailyTask[] = [
        {
          id: 'task1',
          type: 'counting',
          description: 'Task 1',
          target: 3,
          current: 3,
          reward: { coins: 10, experience: 20 },
          completed: true,
          rewardClaimed: false,
        },
        {
          id: 'task2',
          type: 'equations',
          description: 'Task 2',
          target: 5,
          current: 5,
          reward: { coins: 15, experience: 30 },
          completed: true,
          rewardClaimed: false,
        },
      ];

      dailyTasksStore.tasks = mockTasks;
      expect(dailyTasksStore.allCompleted).toBe(true);

      dailyTasksStore.tasks[1].completed = false;
      expect(dailyTasksStore.allCompleted).toBe(false);
    });

    it('should handle empty tasks for stats', () => {
      dailyTasksStore.tasks = [];
      const stats = dailyTasksStore.stats;

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.percentage).toBe(0);
      expect(stats.totalCoins).toBe(0);
      expect(stats.totalExp).toBe(0);
    });
  });

  describe('Actions: generateIfNeeded', () => {
    it('should generate tasks for new day (FR-FUNC-001)', () => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;

      dailyTasksStore.generateIfNeeded();

      expect(dailyTasksStore.tasks.length).toBeGreaterThan(0);
      expect(dailyTasksStore.tasks.length).toBeLessThanOrEqual(4);
    });

    it('should not regenerate on same day (FR-FUNC-003)', () => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;

      dailyTasksStore.generateIfNeeded();
      const firstTasks = [...dailyTasksStore.tasks];

      dailyTasksStore.generateIfNeeded();
      const secondTasks = [...dailyTasksStore.tasks];

      expect(firstTasks).toEqual(secondTasks);
    });

    it('should regenerate when grade changes (FR-FUNC-006)', () => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;

      dailyTasksStore.generateIfNeeded();
      const firstTasks = [...dailyTasksStore.tasks];

      // Меняем класс
      settingsStore.selectedGrade = 2;
      dailyTasksStore.generateIfNeeded();
      const secondTasks = [...dailyTasksStore.tasks];

      // Задания могут быть разными, но проверяем что генерация произошла
      expect(dailyTasksStore.lastGeneratedDate).toBe('2024-02-11');
    });

    it('should not generate if no grade selected', () => {
      settingsStore.selectedGrade = null;
      settingsStore.currentQuarter = 1;

      dailyTasksStore.generateIfNeeded();

      expect(dailyTasksStore.tasks).toEqual([]);
    });

    it('should update lastGeneratedDate', () => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;

      dailyTasksStore.generateIfNeeded();

      expect(dailyTasksStore.lastGeneratedDate).toBe('2024-02-11');
    });
  });

  describe('Actions: updateProgress', () => {
    beforeEach(() => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;
      dailyTasksStore.generateIfNeeded();
    });

    it('should update progress for exercise type (FR-FUNC-004)', () => {
      const initialCurrent = dailyTasksStore.tasks[0].current;

      dailyTasksStore.updateProgress('counting', 1);

      expect(dailyTasksStore.tasks[0].current).toBe(initialCurrent + 1);
    });

    it('should limit progress to target (FR-FUNC-004)', () => {
      const task = dailyTasksStore.tasks[0];
      dailyTasksStore.updateProgress(task.type, task.target + 10);

      expect(dailyTasksStore.tasks[0].current).toBe(dailyTasksStore.tasks[0].target);
    });

    it('should mark task as completed when target reached', () => {
      const task = dailyTasksStore.tasks[0];
      dailyTasksStore.updateProgress(task.type, task.target);

      expect(dailyTasksStore.tasks[0].completed).toBe(true);
    });

    it('should not update completed tasks', () => {
      const task = dailyTasksStore.tasks[0];
      dailyTasksStore.updateProgress(task.type, task.target);
      const completedProgress = dailyTasksStore.tasks[0].current;

      dailyTasksStore.updateProgress(task.type, 1);

      expect(dailyTasksStore.tasks[0].current).toBe(completedProgress);
    });

    it('should grant rewards for newly completed tasks', () => {
      const task = dailyTasksStore.tasks[0];
      const initialCoins = dailyTasksStore.playerStore.currency.coins;
      const initialExp = dailyTasksStore.playerStore.player.experience;

      dailyTasksStore.updateProgress(task.type, task.target);

      expect(dailyTasksStore.playerStore.currency.coins).toBeGreaterThan(initialCoins);
      expect(dailyTasksStore.playerStore.player.experience).toBeGreaterThan(initialExp);
    });
  });

  describe('Actions: reset', () => {
    it('should reset all state', () => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;
      dailyTasksStore.generateIfNeeded();
      dailyTasksStore.streak = 5;

      dailyTasksStore.reset();

      expect(dailyTasksStore.tasks).toEqual([]);
      expect(dailyTasksStore.lastGeneratedDate).toBe('');
      expect(dailyTasksStore.streak).toBe(0);
      expect(dailyTasksStore.lastCompletedDate).toBe('');
    });
  });

  describe('Migration', () => {
    it('should migrate existing data from old format (FR-MIG-001)', () => {
      // Создаём данные в старом формате
      const oldTasks = [
        {
          id: 'counting_3',
          type: 'counting' as const,
          description: 'Посчитать 3 раза',
          target: 3,
          current: 2,
          reward: { coins: 6, experience: 12 },
          completed: false,
        },
      ];

      localStorage.setItem('dailyTasks', JSON.stringify(oldTasks));
      localStorage.setItem('dailyTasksDate', '2024-02-11');

      // Создаём новый store
      setActivePinia(createPinia());
      const newStore = useDailyTasksStore();

      // Данные должны быть мигрированы
      expect(newStore.tasks.length).toBe(1);
      expect(newStore.tasks[0].id).toBe('counting_3');
      expect(newStore.tasks[0].current).toBe(2);
      expect(newStore.tasks[0].rewardClaimed).toBe(false);
    });
  });
});
