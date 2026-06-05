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
    };
  };

  // Сброс прогресса (для тестов)
  const resetProgress = () => {
    player.value = {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      totalCoinsEarned: 0,
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
    checkDailyBonus,
    getPlayerStats,
    resetProgress,
  };
});
