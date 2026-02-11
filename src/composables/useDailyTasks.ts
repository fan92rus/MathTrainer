// Composable для работы с ежедневными заданиями
// Соответствует FR-ARCH-006 из PRD v2.0

import { computed } from 'vue';
import { useDailyTasksStore } from '@/store/dailyTasks';
import type { DailyTask } from '@/store/dailyTasks/types';
import type { DailyTaskType } from '@/types/gamification';

/**
 * Интерфейс для прогресса упражнения
 */
export interface ExerciseProgress {
  current: number;
  target: number;
  completed: boolean;
}

/**
 * Composable для работы с ежедневными заданиями
 * Инкапсулирует работу с dailyTasksStore
 * Используется во всех компонентах (FR-ARCH-006)
 */
export function useDailyTasks() {
  const dailyTasksStore = useDailyTasksStore();

  // ============================================
  // Getters
  // ============================================

  /** Ежедневные задания */
  const dailyTasks = computed(() => dailyTasksStore.dailyTasks);

  /** Статистика по заданиям */
  const stats = computed(() => dailyTasksStore.stats);

  /** Все задания выполнены */
  const allCompleted = computed(() => dailyTasksStore.allCompleted);

  // ============================================
  // Actions
  // ============================================

  /**
   * Гарантирует наличие заданий на текущий день
   * Генерирует новые задания если нужно
   */
  const ensureTasks = () => {
    dailyTasksStore.generateIfNeeded();
  };

  /**
   * Обновляет прогресс для упражнения
   * @param exerciseType - Тип упражнения
   * @param increment - Значение приращения
   */
  const updateExerciseProgress = (exerciseType: DailyTaskType, increment: number = 1) => {
    dailyTasksStore.updateProgress(exerciseType, increment);
  };

  /**
   * Получает задания для указанного типа упражнения
   * @param exerciseType - Тип упражнения
   * @returns Массив заданий или пустой массив
   */
  const getTasksForExercise = (exerciseType: DailyTaskType): DailyTask[] => {
    return dailyTasks.value.filter(task => task.type === exerciseType);
  };

  /**
   * Получает агрегированный прогресс для типа упражнения
   * @param exerciseType - Тип упражнения
   * @returns Объект с прогрессом
   */
  const getExerciseProgress = (exerciseType: DailyTaskType): ExerciseProgress => {
    const tasks = getTasksForExercise(exerciseType);

    if (tasks.length === 0) {
      return { current: 0, target: 0, completed: false };
    }

    const current = tasks.reduce((sum, task) => sum + task.current, 0);
    const target = tasks.reduce((sum, task) => sum + task.target, 0);
    const completed = tasks.every(task => task.completed);

    return { current, target, completed };
  };

  return {
    // Getters
    dailyTasks,
    stats,
    allCompleted,

    // Actions
    ensureTasks,
    updateExerciseProgress,
    getTasksForExercise,
    getExerciseProgress,
  };
}
