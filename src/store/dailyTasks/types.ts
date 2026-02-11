// Типы для системы ежедневных заданий (Daily Tasks)
// Соответствуют требованиям из PRD v2.0

import type { DailyTaskType } from '@/types/gamification';

/**
 * Конфигурация ежедневного задания
 * Определяет параметры для генерации задания
 */
export interface DailyTaskConfig {
  /** Уникальный идентификатор задания */
  id: string;
  /** Тип задания для группировки */
  type: DailyTaskType;
  /** Тип упражнения, к которому привязано задание */
  exerciseType: string;
  /** Описание задания для отображения пользователю */
  description: string;
  /** Целевое количество выполнений */
  target: number;
  /** Награда за выполнение */
  reward: {
    coins: number;
    experience: number;
  };
  /** Приоритет задания (1 = высший, используется для сортировки) */
  priority: number;
  /** Является ли задание обязательным (включается всегда) */
  required: boolean;
  /** Доступные классы для этого задания */
  grade: number[];
  /** Доступные четверти для этого задания */
  quarter: number[];
}

/**
 * Ежедневное задание
 * Создается на основе конфигурации при генерации
 */
export interface DailyTask {
  /** Уникальный идентификатор задания */
  id: string;
  /** Тип задания для группировки */
  type: DailyTaskType;
  /** Описание задания для отображения пользователю */
  description: string;
  /** Целевое количество выполнений */
  target: number;
  /** Текущий прогресс */
  current: number;
  /** Награда за выполнение */
  reward: {
    coins: number;
    experience: number;
  };
  /** Задание выполнено */
  completed: boolean;
  /** Награда получена (защита от двойного начисления) */
  rewardClaimed: boolean;
}

/**
 * Состояние хранилища ежедневных заданий
 */
export interface DailyTasksState {
  /** Список активных заданий */
  tasks: DailyTask[];
  /** Дата последней генерации заданий (ISO string) */
  lastGeneratedDate: string;
  /** Текущая серия выполнений подряд */
  streak: number;
  /** Дата последнего выполнения всех заданий (ISO string) */
  lastCompletedDate: string;
}

/**
 * Статистика по заданиям
 */
export interface DailyTasksStats {
  /** Общее количество заданий */
  total: number;
  /** Количество выполненных заданий */
  completed: number;
  /** Процент выполнения */
  percentage: number;
  /** Общее количество монет за все задания */
  totalCoins: number;
  /** Общее количество опыта за все задания */
  totalExp: number;
}
