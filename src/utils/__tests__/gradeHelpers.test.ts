import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getCurrentQuarter,
  getDifficultySettings,
  getAvailableExercises,
  getGradeName,
  getQuarterName,
  calculateExercisePoints
} from '../gradeHelpers';

describe('getCurrentQuarter', () => {
  // Оригинальный Date
  let originalDate: DateConstructor;

  beforeEach(() => {
    originalDate = global.Date;
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  const mockDate = (month: number) => {
    // Мокаем Date, чтобы getMonth() возвращал нужный месяц
    // Месяцы в JavaScript: 0-11 (январь-декабрь)
    const jsMonth = month - 1;
    vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(jsMonth);
  };

  test('сентябрь (месяц 9) -> 1 четверть', () => {
    mockDate(9);
    expect(getCurrentQuarter()).toBe(1);
  });

  test('октябрь (месяц 10) -> 1 четверть', () => {
    mockDate(10);
    expect(getCurrentQuarter()).toBe(1);
  });

  test('ноябрь (месяц 11) -> 2 четверть', () => {
    mockDate(11);
    expect(getCurrentQuarter()).toBe(2);
  });

  test('декабрь (месяц 12) -> 2 четверть', () => {
    mockDate(12);
    expect(getCurrentQuarter()).toBe(2);
  });

  test('январь (месяц 1) -> 3 четверть', () => {
    mockDate(1);
    expect(getCurrentQuarter()).toBe(3);
  });

  test('февраль (месяц 2) -> 3 четверть', () => {
    mockDate(2);
    expect(getCurrentQuarter()).toBe(3);
  });

  test('март (месяц 3) -> 3 четверть', () => {
    mockDate(3);
    expect(getCurrentQuarter()).toBe(3);
  });

  test('апрель (месяц 4) -> 4 четверть', () => {
    mockDate(4);
    expect(getCurrentQuarter()).toBe(4);
  });

  test('май (месяц 5) -> 4 четверть', () => {
    mockDate(5);
    expect(getCurrentQuarter()).toBe(4);
  });

  test('июнь (месяц 6) -> 1 четверть', () => {
    mockDate(6);
    expect(getCurrentQuarter()).toBe(1);
  });

  test('июль (месяц 7) -> 1 четверть', () => {
    mockDate(7);
    expect(getCurrentQuarter()).toBe(1);
  });

  test('август (месяц 8) -> 1 четверть', () => {
    mockDate(8);
    expect(getCurrentQuarter()).toBe(1);
  });
});

describe('getDifficultySettings', () => {
  describe('1 класс', () => {
    test('1 четверть -> числа до 10', () => {
      const settings = getDifficultySettings(1, 1);
      expect(settings.maxCountingNumber).toBe(10);
      expect(settings.maxDecompositionNumber).toBe(10);
      expect(settings.description).toBe('1 класс, 1 четверть: числа до 10');
    });

    test('2-4 четверть -> числа до 20', () => {
      const q2 = getDifficultySettings(1, 2);
      expect(q2.maxCountingNumber).toBe(20);
      expect(q2.maxDecompositionNumber).toBe(20);

      const q3 = getDifficultySettings(1, 3);
      expect(q3.maxCountingNumber).toBe(20);
      expect(q3.maxDecompositionNumber).toBe(20);

      const q4 = getDifficultySettings(1, 4);
      expect(q4.maxCountingNumber).toBe(20);
      expect(q4.maxDecompositionNumber).toBe(20);
    });

    test('description должен содержать класс и четверть', () => {
      const settings = getDifficultySettings(1, 1);
      expect(settings.description).toContain('1 класс');
      expect(settings.description).toContain('1 четверть');
    });
  });

  describe('2-4 класс', () => {
    test('2 класс все четверти -> числа до 100', () => {
      const q1 = getDifficultySettings(2, 1);
      expect(q1.maxCountingNumber).toBe(100);
      expect(q1.maxDecompositionNumber).toBe(100);

      const q4 = getDifficultySettings(2, 4);
      expect(q4.maxCountingNumber).toBe(100);
      expect(q4.maxDecompositionNumber).toBe(100);
    });

    test('3 класс все четверти -> числа до 100', () => {
      const settings = getDifficultySettings(3, 2);
      expect(settings.maxCountingNumber).toBe(100);
      expect(settings.maxDecompositionNumber).toBe(100);
    });

    test('4 класс все четверти -> числа до 100', () => {
      const settings = getDifficultySettings(4, 3);
      expect(settings.maxCountingNumber).toBe(100);
      expect(settings.maxDecompositionNumber).toBe(100);
    });
  });

  describe('невалидные значения', () => {
    test('несуществующий класс -> fallback на 1 класс, 1 четверть', () => {
      const settings = getDifficultySettings(99, 1);
      expect(settings.maxCountingNumber).toBe(10);
      expect(settings.maxDecompositionNumber).toBe(10);
    });

    test('несуществующая четверть -> fallback на 1 класс, 1 четверть', () => {
      const settings = getDifficultySettings(1, 99);
      expect(settings.maxCountingNumber).toBe(10);
      expect(settings.maxDecompositionNumber).toBe(10);
    });

    test('оба значения невалидны -> fallback на 1 класс, 1 четверть', () => {
      const settings = getDifficultySettings(99, 99);
      expect(settings.maxCountingNumber).toBe(10);
      expect(settings.maxDecompositionNumber).toBe(10);
    });
  });
});

describe('getAvailableExercises', () => {
  describe('counting (Тренажер счета)', () => {
    test('1 класс все четверти -> доступен', () => {
      const g1q1 = getAvailableExercises(1, 1);
      const g1q4 = getAvailableExercises(1, 4);

      expect(g1q1.counting.available).toBe(true);
      expect(g1q4.counting.available).toBe(true);
    });

    test('2 класс, 1-2 четверть -> доступен', () => {
      const g2q1 = getAvailableExercises(2, 1);
      const g2q2 = getAvailableExercises(2, 2);

      expect(g2q1.counting.available).toBe(true);
      expect(g2q2.counting.available).toBe(true);
    });

    test('2 класс, 3+ четверть -> недоступен', () => {
      const g2q3 = getAvailableExercises(2, 3);
      const g2q4 = getAvailableExercises(2, 4);

      expect(g2q3.counting.available).toBe(false);
      expect(g2q4.counting.available).toBe(false);
    });

    test('3+ класс -> недоступен', () => {
      const g3 = getAvailableExercises(3, 1);
      const g4 = getAvailableExercises(4, 1);

      expect(g3.counting.available).toBe(false);
      expect(g4.counting.available).toBe(false);
    });

    test('title = "Тренажер счета"', () => {
      const exercises = getAvailableExercises(1, 1);
      expect(exercises.counting.title).toBe('Тренажер счета');
    });
  });

  describe('firstGradeDecomposition (Состав числа 1 класс)', () => {
    test('1 класс, 1 четверть -> недоступен', () => {
      const exercises = getAvailableExercises(1, 1);
      expect(exercises.firstGradeDecomposition.available).toBe(false);
    });

    test('1 класс, 2+ четверть -> доступен', () => {
      const q2 = getAvailableExercises(1, 2);
      expect(q2.firstGradeDecomposition.available).toBe(true);

      const q4 = getAvailableExercises(1, 4);
      expect(q4.firstGradeDecomposition.available).toBe(true);
    });

    test('2+ класс -> недоступен', () => {
      const g2 = getAvailableExercises(2, 2);
      expect(g2.firstGradeDecomposition.available).toBe(false);

      const g4 = getAvailableExercises(4, 4);
      expect(g4.firstGradeDecomposition.available).toBe(false);
    });
  });

  describe('decomposition (Вычисление удобным способом)', () => {
    test('1 класс -> недоступен', () => {
      const exercises = getAvailableExercises(1, 2);
      expect(exercises.decomposition.available).toBe(false);
    });

    test('2+ класс -> доступен', () => {
      const g2 = getAvailableExercises(2, 1);
      expect(g2.decomposition.available).toBe(true);

      const g4 = getAvailableExercises(4, 1);
      expect(g4.decomposition.available).toBe(true);
    });
  });

  describe('multiplication (Таблица умножения)', () => {
    test('2 класс, 1-2 четверть -> недоступен', () => {
      const q1 = getAvailableExercises(2, 1);
      expect(q1.multiplication.available).toBe(false);

      const q2 = getAvailableExercises(2, 2);
      expect(q2.multiplication.available).toBe(false);
    });

    test('2 класс, 3+ четверть -> доступен', () => {
      const q3 = getAvailableExercises(2, 3);
      expect(q3.multiplication.available).toBe(true);

      const q4 = getAvailableExercises(2, 4);
      expect(q4.multiplication.available).toBe(true);
    });

    test('3+ класс -> доступен всегда', () => {
      const g3 = getAvailableExercises(3, 1);
      expect(g3.multiplication.available).toBe(true);

      const g4 = getAvailableExercises(4, 1);
      expect(g4.multiplication.available).toBe(true);
    });
  });

  describe('equations (Простые уравнения)', () => {
    test('2 класс, 1-2 четверть -> доступен', () => {
      const g2q1 = getAvailableExercises(2, 1);
      const g2q2 = getAvailableExercises(2, 2);

      expect(g2q1.equations.available).toBe(true);
      expect(g2q2.equations.available).toBe(true);
    });

    test('2 класс, 3+ четверть -> недоступен', () => {
      const g2q3 = getAvailableExercises(2, 3);
      const g2q4 = getAvailableExercises(2, 4);

      expect(g2q3.equations.available).toBe(false);
      expect(g2q4.equations.available).toBe(false);
    });

    test('3+ класс -> недоступен', () => {
      const g3 = getAvailableExercises(3, 1);
      const g4 = getAvailableExercises(4, 4);

      expect(g3.equations.available).toBe(false);
      expect(g4.equations.available).toBe(false);
    });
  });

  describe('columnSubtraction (Вычитание в столбик)', () => {
    test('2 класс, 1 четверть -> недоступен', () => {
      const exercises = getAvailableExercises(2, 1);
      expect(exercises.columnSubtraction.available).toBe(false);
    });

    test('2 класс, 2+ четверть -> доступен', () => {
      const g2q2 = getAvailableExercises(2, 2);
      const g2q4 = getAvailableExercises(2, 4);

      expect(g2q2.columnSubtraction.available).toBe(true);
      expect(g2q4.columnSubtraction.available).toBe(true);
    });

    test('3+ класс -> доступен всегда', () => {
      const g3 = getAvailableExercises(3, 1);
      const g4 = getAvailableExercises(4, 4);

      expect(g3.columnSubtraction.available).toBe(true);
      expect(g4.columnSubtraction.available).toBe(true);
    });
  });

  describe('equationsWholePart (Уравнения: целое и части)', () => {
    test('2 класс, 1 четверть -> недоступен', () => {
      const exercises = getAvailableExercises(2, 1);
      expect(exercises.equationsWholePart.available).toBe(false);
    });

    test('2 класс, 2+ четверть -> доступен', () => {
      const g2q2 = getAvailableExercises(2, 2);
      const g2q4 = getAvailableExercises(2, 4);

      expect(g2q2.equationsWholePart.available).toBe(true);
      expect(g2q4.equationsWholePart.available).toBe(true);
    });

    test('3+ класс -> доступен всегда', () => {
      const g3 = getAvailableExercises(3, 1);
      const g4 = getAvailableExercises(4, 4);

      expect(g3.equationsWholePart.available).toBe(true);
      expect(g4.equationsWholePart.available).toBe(true);
    });
  });

  describe('структура ответа', () => {
    test('все упражнения имеют title, description, available', () => {
      const exercises = getAvailableExercises(1, 1);

      expect(exercises.counting).toHaveProperty('title');
      expect(exercises.counting).toHaveProperty('description');
      expect(exercises.counting).toHaveProperty('available');

      expect(exercises.firstGradeDecomposition).toHaveProperty('title');
      expect(exercises.firstGradeDecomposition).toHaveProperty('description');
      expect(exercises.firstGradeDecomposition).toHaveProperty('available');

      expect(exercises.decomposition).toHaveProperty('title');
      expect(exercises.decomposition).toHaveProperty('description');
      expect(exercises.decomposition).toHaveProperty('available');

      expect(exercises.multiplication).toHaveProperty('title');
      expect(exercises.multiplication).toHaveProperty('description');
      expect(exercises.multiplication).toHaveProperty('available');

      expect(exercises.equations).toHaveProperty('title');
      expect(exercises.equations).toHaveProperty('description');
      expect(exercises.equations).toHaveProperty('available');

      expect(exercises.columnSubtraction).toHaveProperty('title');
      expect(exercises.columnSubtraction).toHaveProperty('description');
      expect(exercises.columnSubtraction).toHaveProperty('available');

      expect(exercises.equationsWholePart).toHaveProperty('title');
      expect(exercises.equationsWholePart).toHaveProperty('description');
      expect(exercises.equationsWholePart).toHaveProperty('available');
    });

    test('description не пустая строка', () => {
      const exercises = getAvailableExercises(1, 1);

      Object.values(exercises).forEach(exercise => {
        expect(exercise.description.length).toBeGreaterThan(0);
      });
    });

    test('title не пустая строка', () => {
      const exercises = getAvailableExercises(1, 1);

      Object.values(exercises).forEach(exercise => {
        expect(exercise.title.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('getGradeName', () => {
  test('должен возвращать правильное название для 1 класса', () => {
    expect(getGradeName(1)).toBe('1 класс');
  });

  test('должен возвращать правильное название для 2 класса', () => {
    expect(getGradeName(2)).toBe('2 класс');
  });

  test('должен возвращать правильное название для 3 класса', () => {
    expect(getGradeName(3)).toBe('3 класс');
  });

  test('должен возвращать правильное название для 4 класса', () => {
    expect(getGradeName(4)).toBe('4 класс');
  });

  test('несуществующий класс -> "Неизвестный класс"', () => {
    expect(getGradeName(99)).toBe('Неизвестный класс');
    expect(getGradeName(0)).toBe('Неизвестный класс');
    expect(getGradeName(-1)).toBe('Неизвестный класс');
  });
});

describe('getQuarterName', () => {
  test('должен возвращать правильное название для 1 четверти', () => {
    expect(getQuarterName(1)).toBe('1 четверть');
  });

  test('должен возвращать правильное название для 2 четверти', () => {
    expect(getQuarterName(2)).toBe('2 четверть');
  });

  test('должен возвращать правильное название для 3 четверти', () => {
    expect(getQuarterName(3)).toBe('3 четверть');
  });

  test('должен возвращать правильное название для 4 четверти', () => {
    expect(getQuarterName(4)).toBe('4 четверть');
  });

  test('несуществующая четверть -> "Неизвестная четверть"', () => {
    expect(getQuarterName(0)).toBe('Неизвестная четверть');
    expect(getQuarterName(5)).toBe('Неизвестная четверть');
    expect(getQuarterName(99)).toBe('Неизвестная четверть');
  });
});

describe('calculateExercisePoints', () => {
  test('0 ошибок -> 10 очков', () => {
    expect(calculateExercisePoints(0)).toBe(10);
  });

  test('1 ошибка -> 5 очков', () => {
    expect(calculateExercisePoints(1)).toBe(5);
  });

  test('2 ошибки -> 0 очков', () => {
    expect(calculateExercisePoints(2)).toBe(0);
  });

  test('3 ошибки -> 0 очков', () => {
    expect(calculateExercisePoints(3)).toBe(0);
  });

  test('5 ошибок -> 0 очков', () => {
    expect(calculateExercisePoints(5)).toBe(0);
  });

  test('отрицательное количество ошибок -> 0 очков (edge case)', () => {
    expect(calculateExercisePoints(-1)).toBe(0);
  });
});
