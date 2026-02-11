// Pinia Store для системы ежедневных заданий
// Соответствует FR-ARCH-001 из PRD v2.0

import { defineStore } from 'pinia';
import { computed, toRef } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import type { DailyTasksState, DailyTasksStats, DailyTask } from './types';
import type { DailyTaskType } from '@/types/gamification';
import { DailyTasksGenerator } from './generator';
import { DailyTasksProgress } from './progress';
import { DailyTasksRewards } from './rewards';
import { DAILY_TASKS_CONFIG } from '@/config/dailyTasks';
import { usePlayerStore } from '@/store/player';
import { useSettingsStore } from '@/store/settings';

export const useDailyTasksStore = defineStore('dailyTasks', () => {
  // Инициализация модулей
  const generator = new DailyTasksGenerator(DAILY_TASKS_CONFIG);
  const progress = new DailyTasksProgress();
  const playerStore = usePlayerStore();
  const rewards = new DailyTasksRewards({
    addCoins: playerStore.addCoins,
    addExperience: playerStore.addExperience,
  });

  // State с localStorage персистентностью
  const state = useLocalStorage<DailyTasksState>('dailyTasksState', {
    tasks: [],
    lastGeneratedDate: '',
    streak: 0,
    lastCompletedDate: '',
  });

  // Getters
  const dailyTasks = computed(() => state.value.tasks);

  const stats = computed((): DailyTasksStats => {
    const tasks = state.value.tasks;
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const totalCoins = tasks.reduce((sum, t) => sum + t.reward.coins, 0);
    const totalExp = tasks.reduce((sum, t) => sum + t.reward.experience, 0);

    return { total, completed, percentage, totalCoins, totalExp };
  });

  const allCompleted = computed(() => {
    return state.value.tasks.length > 0 && state.value.tasks.every(t => t.completed);
  });

  // Actions

  /**
   * Генерирует задания если нужно (новый день или смена класса)
   * Соответствует FR-FUNC-001, FR-FUNC-006
   */
  const generateIfNeeded = () => {
    const settingsStore = useSettingsStore();
    const today = new Date().toDateString();

    // Проверяем нужно ли генерировать новые задания
    const needsGeneration =
      state.value.lastGeneratedDate !== today ||
      state.value.tasks.length === 0;

    if (!needsGeneration) {
      return;
    }

    // Если класс не выбран, не генерируем
    if (!settingsStore.selectedGrade) {
      return;
    }

    // Генерируем задания
    const grade = settingsStore.selectedGrade;
    const quarter = settingsStore.currentQuarter;
    const newTasks = generator.generate(grade, quarter, today);

    state.value.tasks = newTasks;
    state.value.lastGeneratedDate = today;
  };

  /**
   * Обновляет прогресс заданий по типу упражнения
   * Соответствует FR-FUNC-004
   * @param exerciseType - Тип упражнения
   * @param increment - Значение приращения
   */
  const updateProgress = (exerciseType: DailyTaskType, increment: number = 1) => {
    const result = progress.update(state.value.tasks, exerciseType, increment);
    state.value.tasks = result.tasks;

    // Выдаём награды за вновь выполненные задания
    if (result.newlyCompleted.length > 0) {
      rewards.grant(result.newlyCompleted);
      updateStreak();
    }
  };

  /**
   * Обновляет серию выполнений (streak)
   * Соответствует FR-FUNC-007
   */
  const updateStreak = () => {
    if (!allCompleted.value) {
      return;
    }

    const today = new Date().toDateString();
    const lastCompleted = state.value.lastCompletedDate;

    if (lastCompleted === today) {
      return; // Уже обновлено сегодня
    }

    // Проверяем, был ли вчера выполнен день
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastCompleted === yesterdayStr) {
      // Продолжаем серию
      state.value.streak++;
    } else {
      // Начинаем новую серию
      state.value.streak = 1;
    }

    state.value.lastCompletedDate = today;
  };

  /**
   * Сбрасывает состояние (для тестов)
   */
  const reset = () => {
    state.value.tasks = [];
    state.value.lastGeneratedDate = '';
    state.value.streak = 0;
    state.value.lastCompletedDate = '';
  };

  // Migration: проверяем наличие старых данных и мигрируем
  const migrateOldData = () => {
    const oldTasks = localStorage.getItem('dailyTasks');
    const oldDate = localStorage.getItem('dailyTasksDate');

    if (oldTasks && oldDate && state.value.tasks.length === 0) {
      try {
        const parsedTasks = JSON.parse(oldTasks);
        // Мигрируем задачи, добавляя недостающие поля
        const migratedTasks: DailyTask[] = parsedTasks.map((t: any) => ({
          ...t,
          rewardClaimed: t.rewardClaimed ?? false,
        }));

        state.value.tasks = migratedTasks;
        state.value.lastGeneratedDate = oldDate;

        // Очищаем старые данные после успешной миграции
        localStorage.removeItem('dailyTasks');
        localStorage.removeItem('dailyTasksDate');
      } catch (e) {
        console.error('Migration failed:', e);
      }
    }
  };

  // Выполняем миграцию при инициализации
  migrateOldData();

  return {
    // State
    tasks: toRef(state.value, 'tasks'),
    lastGeneratedDate: toRef(state.value, 'lastGeneratedDate'),
    streak: toRef(state.value, 'streak'),
    lastCompletedDate: toRef(state.value, 'lastCompletedDate'),

    // Getters
    dailyTasks,
    stats,
    allCompleted,

    // Actions
    generateIfNeeded,
    updateProgress,
    reset,

    // Dependencies (для тестов)
    playerStore,
  };
});
