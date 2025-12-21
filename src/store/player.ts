import { defineStore } from 'pinia';
import type { Player, Currency, DailyTask } from '@/types/gamification';
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
    coins: 0,
    crystals: 0,
  });

  // Ежедневные задания
  const dailyTasks = useLocalStorage<DailyTask[]>('dailyTasks', []);

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

  // Сгенерировать ежедневные задания
  const generateDailyTasks = () => {
    const today = new Date().toDateString();
    const lastGenerated = localStorage.getItem('dailyTasksDate');

    // Если задания уже сгенерированы сегодня, не генерируем новые
    if (lastGenerated === today && dailyTasks.value.length > 0) {
      return;
    }

    const newTasks: DailyTask[] = [
      {
        id: 'solve_5',
        type: 'solve',
        description: 'Решить 5 примеров',
        target: 5,
        current: 0,
        reward: { coins: 5, experience: 10 },
        completed: false,
      },
      {
        id: 'solve_20',
        type: 'solve',
        description: 'Решить 20 примеров',
        target: 20,
        current: 0,
        reward: { coins: 15, experience: 30 },
        completed: false,
      },
      {
        id: 'build_1',
        type: 'build',
        description: 'Построить 1 здание',
        target: 1,
        current: 0,
        reward: { coins: 10, experience: 20 },
        completed: false,
      },
      {
        id: 'play_3',
        type: 'play',
        description: 'Сыграть в 3 мини-игры',
        target: 3,
        current: 0,
        reward: { coins: 15, experience: 25 },
        completed: false,
      },
    ];

    dailyTasks.value = newTasks;
    localStorage.setItem('dailyTasksDate', today);
  };

  // Обновить прогресс задания
  const updateTaskProgress = (taskId: string, increment: number = 1) => {
    const task = dailyTasks.value.find(t => t.id === taskId);
    if (task && !task.completed) {
      task.current = Math.min(task.current + increment, task.target);

      if (task.current >= task.target) {
        task.completed = true;
        // Выдать награду
        addCoins(task.reward.coins);
        addExperience(task.reward.experience);
      }
    }
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
      completedTasksCount: dailyTasks.value.filter(t => t.completed).length,
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

    dailyTasks.value = [];
    lastLoginDate.value = '';
  };

  return {
    player,
    currency,
    dailyTasks,
    lastLoginDate,
    addExperience,
    addCoins,
    spendCoins,
    addCrystals,
    isBuildingUnlocked,
    generateDailyTasks,
    updateTaskProgress,
    checkDailyBonus,
    getPlayerStats,
    resetProgress,
  };
});