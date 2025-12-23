import type { GradeLevel } from '@/types';

// Интерфейс для настроек сложности
export interface DifficultySettings {
  maxCountingNumber: number;
  maxDecompositionNumber: number;
  description: string;
}

// Интерфейс для доступных упражнений
export interface ExerciseInfo {
  available: boolean;
  title: string;
  description: string;
}

export interface AvailableExercises {
  counting: ExerciseInfo;
  firstGradeDecomposition: ExerciseInfo;
  decomposition: ExerciseInfo;
  multiplication: ExerciseInfo;
  equations: ExerciseInfo;
}

// Функция для определения текущей четверти учебного года
export function getCurrentQuarter(): number {
  const now = new Date();
  const month = now.getMonth() + 1; // Месяцы от 1 до 12

  // Учебный год в России обычно начинается 1 сентября
  // 1 четверть: сентябрь - октябрь (9-10 месяцы)
  // 2 четверть: ноябрь - декабрь (11-12 месяцы)
  // 3 четверть: январь - март (1-3 месяцы)
  // 4 четверть: апрель - май (4-5 месяцы)
  // Июнь-август (6-8 месяцы) - каникулы

  if (month >= 9 && month <= 10) {
    return 1;
  } else if (month >= 11 && month <= 12) {
    return 2;
  } else if (month >= 1 && month <= 3) {
    return 3;
  } else if (month >= 4 && month <= 5) {
    return 4;
  } else {
    // Летние месяцы, считаем что начинается новая учебный год
    return 1;
  }
}

// Функция для получения настроек сложности в зависимости от класса и четверти
export function getDifficultySettings(grade: GradeLevel, quarter: number): DifficultySettings {
  const settings: Record<GradeLevel, Record<number, DifficultySettings>> = {
    // 1 класс
    1: {
      1: {
        maxCountingNumber: 10, // до 10
        maxDecompositionNumber: 10,
        description: '1 класс, 1 четверть: числа до 10'
      },
      2: {
        maxCountingNumber: 20, // до 20
        maxDecompositionNumber: 20,
        description: '1 класс, 2 четверть: числа до 20'
      },
      3: {
        maxCountingNumber: 20,
        maxDecompositionNumber: 20,
        description: '1 класс, 3 четверть: числа до 20'
      },
      4: {
        maxCountingNumber: 20,
        maxDecompositionNumber: 20,
        description: '1 класс, 4 четверть: числа до 20'
      }
    },
    // 2 класс
    2: {
      1: {
        maxCountingNumber: 100,
        maxDecompositionNumber: 100,
        description: '2 класс, 1 четверть: числа до 100'
      },
      2: {
        maxCountingNumber: 100,
        maxDecompositionNumber: 100,
        description: '2 класс, 2 четверть: числа до 100'
      },
      3: {
        maxCountingNumber: 100,
        maxDecompositionNumber: 100,
        description: '2 класс, 3 четверть: числа до 100'
      },
      4: {
        maxCountingNumber: 100,
        maxDecompositionNumber: 100,
        description: '2 класс, 4 четверть: числа до 100'
      }
    },
    // 3 класс
    3: {
      1: {
        maxCountingNumber: 100,
        maxDecompositionNumber: 100,
        description: '3 класс, 1 четверть: числа до 100'
      },
      2: {
        maxCountingNumber: 100,
        maxDecompositionNumber: 100,
        description: '3 класс, 2 четверть: числа до 100'
      },
      3: {
        maxCountingNumber: 100,
        maxDecompositionNumber: 100,
        description: '3 класс, 3 четверть: числа до 100'
      },
      4: {
        maxCountingNumber: 100,
        maxDecompositionNumber: 100,
        description: '3 класс, 4 четверть: числа до 100'
      }
    },
    // 4 класс
    4: {
      1: {
        maxCountingNumber: 100,
        maxDecompositionNumber: 100,
        description: '4 класс, 1 четверть: числа до 100'
      },
      2: {
        maxCountingNumber: 100,
        maxDecompositionNumber: 100,
        description: '4 класс, 2 четверть: числа до 100'
      },
      3: {
        maxCountingNumber: 100,
        maxDecompositionNumber: 100,
        description: '4 класс, 3 четверть: числа до 100'
      },
      4: {
        maxCountingNumber: 100,
        maxDecompositionNumber: 100,
        description: '4 класс, 4 четверть: числа до 100'
      }
    }
  };

  return settings[grade]?.[quarter] ?? settings[1]![1]!;
}

// Функция для получения названия класса
export function getGradeName(grade: GradeLevel): string {
  const gradeNames: Record<GradeLevel, string> = {
    1: '1 класс',
    2: '2 класс',
    3: '3 класс',
    4: '4 класс'
  };

  return gradeNames[grade] || 'Неизвестный класс';
}

// Функция для получения названия четверти
export function getQuarterName(quarter: number): string {
  const quarterNames: Record<number, string> = {
    1: '1 четверть',
    2: '2 четверть',
    3: '3 четверть',
    4: '4 четверть'
  };

  return quarterNames[quarter] || 'Неизвестная четверть';
}

// Функция для определения доступности упражнений в зависимости от класса и четверти
export function getAvailableExercises(grade: GradeLevel, quarter: number): AvailableExercises {
  const exercises: AvailableExercises = {
    counting: {
      available: true, // Счет доступен с 1 класса с 1 четверти
      title: 'Тренажер счета',
      description: 'Решай примеры на сложение и вычитание'
    },
    firstGradeDecomposition: {
      available: grade === 1 && quarter >= 2, // Разложение чисел (1 класс) только для 1 класса со 2 четверти
      title: 'Состав числа (1 класс)',
      description: 'Изучи состав чисел до 10'
    },
    decomposition: {
      available: grade >= 2, // Разложение чисел доступно со 2 класса
      title: 'Вычисление удобным способом',
      description: 'Выбирай удобный способ вычисления'
    },
    multiplication: {
      available: (grade === 2 && quarter >= 3) || grade > 2, // Умножение доступно постоянно начиная с 3 четверти 2 класса и далее
      title: 'Таблица умножения',
      description: 'Изучай таблицу умножения постепенно'
    },
    equations: {
      available: (grade === 2 && quarter >= 2) || grade > 2, // Уравнения доступны для 2 класса со 2 четверти и далее
      title: 'Простые уравнения',
      description: 'Решай простые уравнения с неизвестным'
    }
  };

  return exercises;
}

// Функция для расчета очков за упражнение в зависимости от количества ошибок
export function calculateExercisePoints(errors: number): number {
  // Базовые очки за упражнение без ошибок
  const basePoints = 10;

  // Если ошибок больше 2, очки не начисляются
  if (errors > 2) {
    return 0;
  }

  // Уменьшаем очки в зависимости от количества ошибок
  // 0 ошибок = 10 очков
  // 1 ошибка = 5 очков
  // 2 ошибки = 0 очков
  // 3+ ошибок = 0 очков
  return errors === 0 ? basePoints : errors === 1 ? 5 : 0;
}
