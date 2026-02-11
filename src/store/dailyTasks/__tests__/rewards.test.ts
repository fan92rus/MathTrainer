// Unit-тесты для DailyTasksRewards
// TDD подход: Red-Green-Refactor
// Соответствует FR-TEST-003 из PRD

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DailyTasksRewards } from '../rewards';
import type { DailyTask } from '../types';

// Мок для playerStore
const mockPlayerStore = {
  addCoins: vi.fn(),
  addExperience: vi.fn(),
};

describe('DailyTasksRewards', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    vi.clearAllMocks();
  });

  const createMockTask = (
    id: string,
    completed: boolean,
    rewardClaimed: boolean,
    coins: number = 10,
    exp: number = 20
  ): DailyTask => ({
    id,
    type: 'counting',
    description: `Task ${id}`,
    target: 3,
    current: completed ? 3 : 0,
    reward: { coins, experience: exp },
    completed,
    rewardClaimed,
  });

  describe('grant', () => {
    it('should grant reward for completed and unclaimed task (FR-FUNC-005)', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', true, false, 10, 20),
      ];

      rewards.grant(tasks);

      expect(mockPlayerStore.addCoins).toHaveBeenCalledTimes(1);
      expect(mockPlayerStore.addCoins).toHaveBeenCalledWith(10);
      expect(mockPlayerStore.addExperience).toHaveBeenCalledTimes(1);
      expect(mockPlayerStore.addExperience).toHaveBeenCalledWith(20);
    });

    it('should grant rewards for multiple newly completed tasks', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', true, false, 10, 20),
        createMockTask('task2', true, false, 15, 30),
      ];

      rewards.grant(tasks);

      expect(mockPlayerStore.addCoins).toHaveBeenCalledTimes(2);
      expect(mockPlayerStore.addCoins).toHaveBeenNthCalledWith(1, 10);
      expect(mockPlayerStore.addCoins).toHaveBeenNthCalledWith(2, 15);

      // Проверяем общее количество вызовов
      const totalCoins = mockPlayerStore.addCoins.mock.calls.reduce((sum, call) => sum + call[0], 0);
      expect(totalCoins).toBe(25);
    });

    it('should not grant reward for already claimed task (FR-FUNC-005)', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', true, true, 10, 20),
      ];

      rewards.grant(tasks);

      expect(mockPlayerStore.addCoins).not.toHaveBeenCalled();
      expect(mockPlayerStore.addExperience).not.toHaveBeenCalled();
    });

    it('should not grant reward for incomplete task', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', false, false, 10, 20),
      ];

      rewards.grant(tasks);

      expect(mockPlayerStore.addCoins).not.toHaveBeenCalled();
      expect(mockPlayerStore.addExperience).not.toHaveBeenCalled();
    });

    it('should mark task as claimed after granting (FR-FUNC-005)', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', true, false, 10, 20),
      ];

      rewards.grant(tasks);

      expect(tasks[0].rewardClaimed).toBe(true);
    });

    it('should prevent double reward claim (FR-FUNC-005)', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', true, false, 10, 20),
      ];

      // Первый вызов
      rewards.grant(tasks);
      expect(mockPlayerStore.addCoins).toHaveBeenCalledTimes(1);

      // Второй вызов - не должен начислять награду снова
      rewards.grant(tasks);
      expect(mockPlayerStore.addCoins).toHaveBeenCalledTimes(1); // Всё ещё 1
    });

    it('should handle mixed tasks correctly', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', true, false, 10, 20),  // Получит награду
        createMockTask('task2', true, true, 15, 30),   // Уже получена
        createMockTask('task3', false, false, 20, 40), // Не завершено
      ];

      rewards.grant(tasks);

      // Только task1 должен получить награду
      expect(mockPlayerStore.addCoins).toHaveBeenCalledTimes(1);
      expect(mockPlayerStore.addCoins).toHaveBeenCalledWith(10);
    });

    it('should handle empty task list gracefully', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [];

      rewards.grant(tasks);

      expect(mockPlayerStore.addCoins).not.toHaveBeenCalled();
      expect(mockPlayerStore.addExperience).not.toHaveBeenCalled();
    });

    it('should return the number of granted rewards', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', true, false, 10, 20),
        createMockTask('task2', true, false, 15, 30),
        createMockTask('task3', false, false, 20, 40),
      ];

      const granted = rewards.grant(tasks);

      expect(granted).toBe(2);
    });
  });

  describe('claim', () => {
    it('should grant reward for specific task by id', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', true, false, 10, 20),
        createMockTask('task2', true, false, 15, 30),
      ];

      const claimed = rewards.claim(tasks, 'task1');

      expect(claimed).toBe(true);
      expect(mockPlayerStore.addCoins).toHaveBeenCalledTimes(1);
      expect(mockPlayerStore.addCoins).toHaveBeenCalledWith(10);
      expect(tasks[0].rewardClaimed).toBe(true);
      expect(tasks[1].rewardClaimed).toBe(false);
    });

    it('should return false for non-existent task id', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', true, false, 10, 20),
      ];

      const claimed = rewards.claim(tasks, 'nonexistent');

      expect(claimed).toBe(false);
      expect(mockPlayerStore.addCoins).not.toHaveBeenCalled();
    });

    it('should return false for incomplete task', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', false, false, 10, 20),
      ];

      const claimed = rewards.claim(tasks, 'task1');

      expect(claimed).toBe(false);
      expect(mockPlayerStore.addCoins).not.toHaveBeenCalled();
    });

    it('should return false for already claimed task', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', true, true, 10, 20),
      ];

      const claimed = rewards.claim(tasks, 'task1');

      expect(claimed).toBe(false);
      expect(mockPlayerStore.addCoins).not.toHaveBeenCalled();
    });

    it('should handle claim for specific task only', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [
        createMockTask('task1', true, false, 10, 20),
        createMockTask('task2', true, false, 15, 30),
      ];

      rewards.claim(tasks, 'task1');

      expect(tasks[0].rewardClaimed).toBe(true);
      expect(tasks[1].rewardClaimed).toBe(false);
    });

    it('should handle empty task list gracefully', () => {
      const rewards = new DailyTasksRewards(mockPlayerStore);
      const tasks: DailyTask[] = [];

      const claimed = rewards.claim(tasks, 'task1');

      expect(claimed).toBe(false);
    });
  });
});
