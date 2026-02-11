// DailyTasksProgress - класс для обновления прогресса заданий
// Соответствует FR-ARCH-003 из PRD v2.0

import type { DailyTask } from './types';
import type { DailyTaskType } from '@/types/gamification';

/**
 * Результат обновления прогресса
 */
export interface ProgressUpdateResult {
  /** Обновлённые задания */
  tasks: DailyTask[];
  /** Задания, которые только что были завершены */
  newlyCompleted: DailyTask[];
}

/**
 * Класс для обновления прогресса ежедневных заданий
 * Тестируемый изолированно без зависимостей от Vue/Pinia
 */
export class DailyTasksProgress {
  /**
   * Обновляет прогресс заданий указанного типа
   * @param tasks - Массив заданий
   * @param exerciseType - Тип упражнения для обновления
   * @param increment - Значение приращения (по умолчанию 1)
   * @returns Результат обновления с обновлёнными заданиями и списком newlyCompleted
   */
  update(tasks: DailyTask[], exerciseType: DailyTaskType, increment: number = 1): ProgressUpdateResult {
    // Создаём глубокую копию для иммутабельности
    const updatedTasks = tasks.map(task => ({ ...task, reward: { ...task.reward } }));

    const newlyCompleted: DailyTask[] = [];

    for (const task of updatedTasks) {
      // Обновляем только задания matching типа
      if (task.type === exerciseType) {
        // Не обновляем завершённые задания (FR-FUNC-004)
        if (!task.completed) {
          // Увеличиваем прогресс с ограничением по target (FR-FUNC-004)
          task.current = Math.min(task.current + increment, task.target);

          // Проверяем завершение (FR-FUNC-004)
          if (task.current >= task.target && !task.completed) {
            task.completed = true;
            newlyCompleted.push({ ...task });
          }
        }
      }
    }

    return {
      tasks: updatedTasks,
      newlyCompleted,
    };
  }
}
