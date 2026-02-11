import { ref } from 'vue';
import { usePlayerStore } from '@/store/player';
import { useDailyTasks } from './useDailyTasks';
import type { DailyTaskType } from '@/types/gamification';

export function useCoins() {
  const playerStore = usePlayerStore();
  const dailyTasks = useDailyTasks();
  const showCoinAnimation = ref(false);
  const coinsEarned = ref(0);

  // Функция для расчета количества монеток в зависимости от сложности упражнения
  const calculateCoins = (exerciseType: string, level: number, errors: number): number => {
    // Базовые монетки за упражнение
    let baseCoins = 1;

    // Увеличиваем в зависимости от типа упражнения
    switch (exerciseType) {
      case 'counting':
        baseCoins = 1;
        break;
      case 'decomposition':
        baseCoins = 2;
        break;
      case 'multiplication':
        baseCoins = 3;
        break;
      case 'equations':
        baseCoins = 2;
        break;
      case 'columnSubtraction':
        baseCoins = 2;
        break;
      case 'equationsWholePart':
        baseCoins = 2;
        break;
      default:
        baseCoins = 1;
    }

    // Увеличиваем в зависимости от уровня
    const levelMultiplier = 1 + (level - 1) * 0.2;
    baseCoins = Math.round(baseCoins * levelMultiplier);

    // Уменьшаем в зависимости от количества ошибок
    if (errors === 0) {
      // Без ошибок - полная награда
    } else if (errors === 1) {
      baseCoins = Math.ceil(baseCoins * 0.7); // 70% от награды
    } else if (errors === 2) {
      baseCoins = Math.ceil(baseCoins * 0.3); // 30% от награды
    } else {
      baseCoins = 0; // Слишком много ошибок - нет монеток
    }

    return Math.max(0, baseCoins);
  };

  // Функция для добавления монеток и обновления daily tasks
  const awardCoins = async (
    exerciseType: string,
    level: number,
    errors: number,
    showAnimation: boolean = true
  ) => {
    const coins = calculateCoins(exerciseType, level, errors);

    if (coins > 0) {
      // Добавляем монетки игроку
      playerStore.addCoins(coins);

      // Обновляем daily tasks на основе типа упражнения
      // Используем новый composable вместо прямого вызова playerStore
      dailyTasks.ensureTasks();
      dailyTasks.updateExerciseProgress(exerciseType as DailyTaskType, 1);

      // Показываем анимацию
      if (showAnimation) {
        coinsEarned.value = coins;
        showCoinAnimation.value = true;

        // Автоматически скрываем анимацию через 1.5 секунды
        setTimeout(() => {
          showCoinAnimation.value = false;
        }, 1500);
      }

      return coins;
    }

    return 0;
  };

  return {
    showCoinAnimation,
    coinsEarned,
    calculateCoins,
    awardCoins
  };
}
