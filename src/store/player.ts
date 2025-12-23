import { defineStore } from 'pinia';
import type { Player, Currency, DailyTask } from '@/types/gamification';
import { useLocalStorage } from '@vueuse/core';
import { useSettingsStore } from '@/store/settings';
import { getAvailableExercises } from '@/utils/gradeHelpers';

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

    // Получаем настройки и доступные упражнения
    const settingsStore = useSettingsStore();

    // Если класс не выбран, не генерируем задания
    if (!settingsStore.selectedGrade) {
      return;
    }

    const availableExercises = getAvailableExercises(
      settingsStore.selectedGrade,
      settingsStore.currentQuarter
    );

    // Пул всех возможных заданий
    const allTasks: DailyTask[] = [];

    // Задания на счёт (всегда доступны)
    allTasks.push(
      {
        id: 'counting_3',
        type: 'counting',
        description: 'Посчитать 3 раза',
        target: 3,
        current: 0,
        reward: { coins: 6, experience: 12 },
        completed: false,
      },
      {
        id: 'counting_5',
        type: 'counting',
        description: 'Посчитать 5 раз',
        target: 5,
        current: 0,
        reward: { coins: 10, experience: 20 },
        completed: false,
      }
    );

    // Задания на разложение для 1 класса
    if (availableExercises.firstGradeDecomposition.available) {
      allTasks.push(
        {
          id: 'decomposition_easy_3',
          type: 'decomposition_easy',
          description: 'Разложить 3 числа (просто)',
          target: 3,
          current: 0,
          reward: { coins: 5, experience: 10 },
          completed: false,
        },
        {
          id: 'decomposition_easy_5',
          type: 'decomposition_easy',
          description: 'Разложить 5 чисел (просто)',
          target: 5,
          current: 0,
          reward: { coins: 10, experience: 20 },
          completed: false,
        }
      );
    }

    // Задания на уравнения
    if (availableExercises.equations.available) {
      allTasks.push(
        {
          id: 'equations_5',
          type: 'equations',
          description: 'Решить 5 примеров на сложение/вычитание',
          target: 5,
          current: 0,
          reward: { coins: 5, experience: 10 },
          completed: false,
        },
        {
          id: 'equations_15',
          type: 'equations',
          description: 'Решить 15 примеров на сложение/вычитание',
          target: 15,
          current: 0,
          reward: { coins: 12, experience: 25 },
          completed: false,
        }
      );
    }

    // Задания на разложение чисел (со 2 класса)
    if (availableExercises.decomposition.available) {
      allTasks.push(
        {
          id: 'decomposition_3',
          type: 'decomposition',
          description: 'Разложить 3 числа',
          target: 3,
          current: 0,
          reward: { coins: 8, experience: 15 },
          completed: false,
        },
        {
          id: 'decomposition_5',
          type: 'decomposition',
          description: 'Разложить 5 чисел',
          target: 5,
          current: 0,
          reward: { coins: 14, experience: 28 },
          completed: false,
        }
      );
    }

    // Задания на умножение
    if (availableExercises.multiplication.available) {
      allTasks.push(
        {
          id: 'multiplication_5',
          type: 'multiplication',
          description: 'Решить 5 примеров на умножение',
          target: 5,
          current: 0,
          reward: { coins: 7, experience: 15 },
          completed: false,
        },
        {
          id: 'multiplication_10',
          type: 'multiplication',
          description: 'Решить 10 примеров на умножение',
          target: 10,
          current: 0,
          reward: { coins: 15, experience: 30 },
          completed: false,
        }
      );
    }

    // Случайный выбор до 4 заданий на основе даты
    const seed = new Date(today).getTime();
    const shuffled = shuffleArray([...allTasks], seed);
    const selectedCount = Math.min(4, shuffled.length);
    const newTasks = shuffled.slice(0, selectedCount);

    dailyTasks.value = newTasks;
    localStorage.setItem('dailyTasksDate', today);
  };

  // Перемешивание массива с seed для детерминированной случайности
  const shuffleArray = <T>(array: T[], seed: number): T[] => {
    const result = [...array];
    let random = seed;

    for (let i = result.length - 1; i > 0; i--) {
      // Простой генератор псевдослучайных чисел
      random = (random * 1103515245 + 12345) & 0x7fffffff;
      const j = random % (i + 1);
      [result[i], result[j]] = [result[j]!, result[i]!] as [T, T];
    }

    return result;
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