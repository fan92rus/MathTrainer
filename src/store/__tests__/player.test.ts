import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { usePlayerStore } from '@/store/player';
import { useSettingsStore } from '@/store/settings';
import { useDailyTasksStore } from '@/store/dailyTasks';

describe('Player Store', () => {
  let playerStore: ReturnType<typeof usePlayerStore>;
  let settingsStore: ReturnType<typeof useSettingsStore>;
  let dailyTasksStore: ReturnType<typeof useDailyTasksStore>;

  beforeEach(() => {
    // Полностью очищаем localStorage перед каждым тестом
    localStorage.clear();
    localStorage.removeItem('player');
    localStorage.removeItem('currency');
    localStorage.removeItem('dailyTasksState');
    localStorage.removeItem('dailyTasksDate');
    localStorage.removeItem('lastLoginDate');

    setActivePinia(createPinia());
    playerStore = usePlayerStore();
    settingsStore = useSettingsStore();
    dailyTasksStore = useDailyTasksStore();
  });

  describe('addExperience and level progression', () => {
    it('should add experience correctly', () => {
      const initialExp = playerStore.player.experience;
      playerStore.addExperience(50);

      expect(playerStore.player.experience).toBe(initialExp + 50);
    });

    it('should level up when experience threshold is reached', () => {
      playerStore.player.experience = playerStore.player.experienceToNext - 10;
      const initialLevel = playerStore.player.level;

      playerStore.addExperience(10);

      expect(playerStore.player.level).toBe(initialLevel + 1);
      expect(playerStore.player.experience).toBeLessThan(playerStore.player.experienceToNext);
    });

    it('should unlock buildings on level up', () => {
      playerStore.player.level = 1;
      const initialBuildings = playerStore.player.unlockedBuildings.length;

      // Повышаем уровень до 2
      playerStore.player.experience = playerStore.player.experienceToNext;
      playerStore.addExperience(1);

      expect(playerStore.player.unlockedBuildings.length).toBeGreaterThan(initialBuildings);
    });
  });

  describe('addCoins and spendCoins', () => {
    it('should add coins correctly', () => {
      const initialCoins = playerStore.currency.coins;
      const initialTotalEarned = playerStore.player.totalCoinsEarned;
      playerStore.addCoins(50);

      expect(playerStore.currency.coins).toBe(initialCoins + 50);
      expect(playerStore.player.totalCoinsEarned).toBe(initialTotalEarned + 50);
    });

    it('should spend coins when enough', () => {
      playerStore.currency.coins = 100;
      const success = playerStore.spendCoins(30);

      expect(success).toBe(true);
      expect(playerStore.currency.coins).toBe(70);
    });

    it('should not spend coins when not enough', () => {
      playerStore.currency.coins = 10;
      const success = playerStore.spendCoins(30);

      expect(success).toBe(false);
      expect(playerStore.currency.coins).toBe(10);
    });
  });

  describe('addCrystals', () => {
    it('should add crystals correctly', () => {
      const initialCrystals = playerStore.currency.crystals;
      playerStore.addCrystals(25);

      expect(playerStore.currency.crystals).toBe(initialCrystals + 25);
    });
  });

  describe('checkDailyBonus', () => {
    it('should award bonus on first login of the day', () => {
      const initialCoins = playerStore.currency.coins;
      const bonus = playerStore.checkDailyBonus();

      expect(bonus).toBe(5);
      expect(playerStore.currency.coins).toBe(initialCoins); // Бонус не добавляет монеты напрямую
    });

    it('should not award bonus on same day', () => {
      playerStore.checkDailyBonus();
      const secondBonus = playerStore.checkDailyBonus();

      expect(secondBonus).toBe(0);
    });
  });

  describe('isBuildingUnlocked', () => {
    it('should return true for unlocked building', () => {
      expect(playerStore.isBuildingUnlocked('small_house')).toBe(true);
    });

    it('should return false for locked building', () => {
      expect(playerStore.isBuildingUnlocked('shop')).toBe(false);
    });
  });

  describe('resetProgress', () => {
    it('should reset all progress', () => {
      playerStore.player.level = 5;
      playerStore.currency.coins = 1000;
      playerStore.player.experience = 500;

      playerStore.resetProgress();

      expect(playerStore.player.level).toBe(1);
      expect(playerStore.currency.coins).toBe(0);
      expect(playerStore.player.experience).toBe(0);
    });
  });

  describe('getPlayerStats', () => {
    it('should return correct player statistics', () => {
      settingsStore.selectedGrade = 1;
      settingsStore.currentQuarter = 1;
      dailyTasksStore.generateIfNeeded();
      dailyTasksStore.tasks[0].completed = true;

      const stats = playerStore.getPlayerStats();

      expect(stats.level).toBe(playerStore.player.level);
      expect(stats.coins).toBe(playerStore.currency.coins);
    });
  });
});
