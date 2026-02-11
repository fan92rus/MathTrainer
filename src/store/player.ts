import { defineStore } from 'pinia';
import type { Player, Currency } from '@/types/gamification';
import { useLocalStorage } from '@vueuse/core';

export const usePlayerStore = defineStore('player', () => {
  // Состояние игрока с локальным сохранением
  const player = useLocalStorage<Player>('player', {
    level: 1,
    experience: 0,
    experienceToNext: 100,
    totalCoinsEarned: 0,
    cityLevel: 1,
    unlockedBuildings: ['small_house'], // Базовый домик разблокирован
  });

  // Валюта
  const currency = useLocalStorage<Currency>('currency', {
    coins: 100, // Даем стартовые монетки для теста
    crystals: 0,
  });

  // Дата последнего входа
  const lastLoginDate = useLocalStorage<string>('lastLoginDate', '');

  // Добавить опыт
  const addExperience = (amount: number) => {
    player.value.experience += amount;

    // Проверка на повышение уровня
    while (player.value.experience >= player.value.experienceToNext) {
      player.value.experience -= player.value.experienceToNext;
      player.value.level++;
      player.value.experienceToNext = Math.floor(player.value.experienceToNext * 1.5);

      // Разблокировка новых зданий при повышении уровня
      unlockBuildingsForLevel(player.value.level);
    }
  };

  // Добавить монеты
  const addCoins = (amount: number) => {
    currency.value.coins += amount;
    player.value.totalCoinsEarned += amount;
  };

  // Потратить монеты
  const spendCoins = (amount: number): boolean => {
    if (currency.value.coins >= amount) {
      currency.value.coins -= amount;
      return true;
    }
    return false;
  };

  // Добавить кристаллы
  const addCrystals = (amount: number) => {
    currency.value.crystals += amount;
  };

  // Разблокировать здания для уровня
  const unlockBuildingsForLevel = (level: number) => {
    const unlockedAtLevel = {
      1: ['small_house'],
      2: ['cottage', 'park'],
      3: ['shop'],
      4: ['hospital', 'playground'],
      5: ['school'],
      6: ['apartment'],
    };

    Object.entries(unlockedAtLevel).forEach(([lvl, buildings]) => {
      if (level >= parseInt(lvl)) {
        buildings.forEach(buildingId => {
          if (!player.value.unlockedBuildings.includes(buildingId)) {
            player.value.unlockedBuildings.push(buildingId);
          }
        });
      }
    });
  };

  // Проверить разблокировано ли здание
  const isBuildingUnlocked = (buildingId: string): boolean => {
    return player.value.unlockedBuildings.includes(buildingId);
  };

  // Проверить ежедневный бонус
  const checkDailyBonus = (): number => {
    const today = new Date().toDateString();
    const lastBonus = lastLoginDate.value;

    if (today !== lastBonus) {
      lastLoginDate.value = today;
      return 5; // Бонус 5 монет за ежедневный вход
    }

    return 0;
  };

  // Получить статистику игрока
  const getPlayerStats = () => {
    return {
      level: player.value.level,
      experience: player.value.experience,
      experienceToNext: player.value.experienceToNext,
      coins: currency.value.coins,
      crystals: currency.value.crystals,
      totalCoinsEarned: player.value.totalCoinsEarned,
      cityLevel: player.value.cityLevel,
      unlockedBuildingsCount: player.value.unlockedBuildings.length,
    };
  };

  // Сброс прогресса (для тестов)
  const resetProgress = () => {
    player.value = {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      totalCoinsEarned: 0,
      cityLevel: 1,
      unlockedBuildings: ['small_house'],
    };

    currency.value = {
      coins: 0,
      crystals: 0,
    };

    lastLoginDate.value = '';
  };

  return {
    player,
    currency,
    lastLoginDate,
    addExperience,
    addCoins,
    spendCoins,
    addCrystals,
    isBuildingUnlocked,
    checkDailyBonus,
    getPlayerStats,
    resetProgress,
  };
});
