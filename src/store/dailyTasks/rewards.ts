// DailyTasksRewards - класс для выдачи наград за задания
// Соответствует FR-ARCH-004 из PRD v2.0

import type { DailyTask } from './types';

/**
 * Интерфейс для зависимостей (playerStore)
 */
export interface PlayerStoreDependencies {
  addCoins: (amount: number) => void;
  addExperience: (amount: number) => void;
}

/**
 * Класс для выдачи наград за выполненные задания
 * Проверяет rewardClaimed перед выдачей (FR-FUNC-005)
 */
export class DailyTasksRewards {
  constructor(private readonly playerStore: PlayerStoreDependencies) {}

  /**
   * Выдаёт награды за все выполненные и ещё не полученные задания
   * @param tasks - Массив заданий
   * @returns Количество выданных наград
   */
  grant(tasks: DailyTask[]): number {
    let grantedCount = 0;

    for (const task of tasks) {
      // Выдаём награду только если задание выполнено и ещё не получено (FR-FUNC-005)
      if (task.completed && !task.rewardClaimed) {
        this.grantReward(task);
        task.rewardClaimed = true;
        grantedCount++;
      }
    }

    return grantedCount;
  }

  /**
   * Выдаёт награду за конкретное задание по ID
   * @param tasks - Массив заданий
   * @param taskId - ID задания
   * @returns true, если награда была выдана
   */
  claim(tasks: DailyTask[], taskId: string): boolean {
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      return false;
    }

    // Проверяем, что задание выполнено и награда ещё не получена (FR-FUNC-005)
    if (!task.completed || task.rewardClaimed) {
      return false;
    }

    this.grantReward(task);
    task.rewardClaimed = true;
    return true;
  }

  /**
   * Выдаёт награду за задание
   * @param task - Задание
   */
  private grantReward(task: DailyTask): void {
    this.playerStore.addCoins(task.reward.coins);
    this.playerStore.addExperience(task.reward.experience);
  }
}
