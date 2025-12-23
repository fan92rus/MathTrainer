import { describe, test, expect } from 'vitest';
import { generateMultiplicationProblem, getAvailableMultiplicationLevels } from '../math/multiplication';

describe('generateMultiplicationProblem', () => {
  describe('базовая проверка структуры', () => {
    test('должен возвращать валидную структуру problem', () => {
      const problem = generateMultiplicationProblem(5);

      expect(problem).toHaveProperty('expression');
      expect(problem).toHaveProperty('operation', 'multiplication');
      expect(problem).toHaveProperty('num1');
      expect(problem).toHaveProperty('num2');
      expect(problem).toHaveProperty('correctAnswer');
      expect(problem).toHaveProperty('options');
      expect(problem).toHaveProperty('correctIndex');
      expect(problem).toHaveProperty('difficulty', 3);
      expect(problem).toHaveProperty('maxMultiplier', 5);
    });

    test('должен генерировать 4 варианта ответа', () => {
      const problem = generateMultiplicationProblem(5);

      expect(problem.options).toHaveLength(4);
    });

    test('correctIndex должен указывать на правильный ответ', () => {
      const problem = generateMultiplicationProblem(5);

      expect(problem.options[problem.correctIndex]).toBe(String(problem.correctAnswer));
    });

    test('operation должен быть "multiplication"', () => {
      const problem = generateMultiplicationProblem(5);

      expect(problem.operation).toBe('multiplication');
    });

    test('expression должен иметь формат "num1 × num2"', () => {
      const problem = generateMultiplicationProblem(5);

      expect(problem.expression).toMatch(/^\d+\s*×\s*\d+$/);
    });
  });

  describe('проверка диапазонов множителей', () => {
    test('должен генерировать множитель1 в правильном диапазоне', () => {
      const maxMultiplier = 5;
      const problems = Array.from({ length: 50 }, () => generateMultiplicationProblem(maxMultiplier));

      problems.forEach(problem => {
        expect(problem.num1).toBeGreaterThanOrEqual(1);
        expect(problem.num1).toBeLessThanOrEqual(maxMultiplier);
      });
    });

    test('должен генерировать множитель2 в диапазоне 1-10', () => {
      const problems = Array.from({ length: 50 }, () => generateMultiplicationProblem(5));

      problems.forEach(problem => {
        expect(problem.num2).toBeGreaterThanOrEqual(1);
        expect(problem.num2).toBeLessThanOrEqual(10);
      });
    });

    test('должен возвращать правильный ответ равный произведению множителей', () => {
      const problems = Array.from({ length: 20 }, () => generateMultiplicationProblem(5));

      problems.forEach(problem => {
        expect(problem.correctAnswer).toBe(problem.num1 * problem.num2);
      });
    });
  });

  describe('проверка вариантов ответа', () => {
    test('все варианты ответа должны быть уникальными', () => {
      const problem = generateMultiplicationProblem(5);

      const uniqueOptions = new Set(problem.options);
      expect(uniqueOptions.size).toBe(4);
    });

    test('варианты ответа не должны быть отрицательными', () => {
      const problems = Array.from({ length: 20 }, () => generateMultiplicationProblem(5));

      problems.forEach(problem => {
        problem.options.forEach(option => {
          const num = parseInt(option);
          expect(num).toBeGreaterThanOrEqual(0);
        });
      });
    });

    test('варианты ответа должны быть строками', () => {
      const problem = generateMultiplicationProblem(5);

      problem.options.forEach(option => {
        expect(typeof option).toBe('string');
      });
    });

    test('среди вариантов должен быть правильный ответ', () => {
      const problem = generateMultiplicationProblem(5);

      expect(problem.options).toContain(String(problem.correctAnswer));
    });
  });

  describe('проверка maxMultiplier', () => {
    test('должен сохранять maxMultiplier в объекте задачи', () => {
      const problem = generateMultiplicationProblem(7);

      expect(problem.maxMultiplier).toBe(7);
    });

    test('maxMultiplier = 2 должен ограничивать первый множитель', () => {
      const problems = Array.from({ length: 30 }, () => generateMultiplicationProblem(2));

      problems.forEach(problem => {
        expect(problem.num1).toBeLessThanOrEqual(2);
        expect(problem.num1).toBeGreaterThanOrEqual(1);
      });
    });

    test('maxMultiplier = 10 должен ограничивать первый множитель', () => {
      const problems = Array.from({ length: 30 }, () => generateMultiplicationProblem(10));

      problems.forEach(problem => {
        expect(problem.num1).toBeLessThanOrEqual(10);
        expect(problem.num1).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('разнообразие генерации', () => {
    test('должен генерировать разные задачи при повторных вызовах', () => {
      const problems = Array.from({ length: 50 }, () => generateMultiplicationProblem(5));

      const expressions = new Set(problems.map(p => p.expression));
      expect(expressions.size).toBeGreaterThan(1);

      const answers = new Set(problems.map(p => p.correctAnswer));
      expect(answers.size).toBeGreaterThan(1);
    });
  });
});

describe('generateWrongMultiplicationAnswers (косвенное тестирование через generateMultiplicationProblem)', () => {
  describe('проверка неправильных ответов', () => {
    test('неправильные ответы должны отличаться от правильного', () => {
      const problems = Array.from({ length: 20 }, () => generateMultiplicationProblem(5));

      problems.forEach(problem => {
        const correctIndex = problem.correctIndex;
        const wrongOptions = problem.options.filter((_, i) => i !== correctIndex);

        wrongOptions.forEach(option => {
          expect(option).not.toBe(String(problem.correctAnswer));
        });
      });
    });

    test('должно генерировать ровно 3 неправильных ответа', () => {
      const problem = generateMultiplicationProblem(5);

      const correctIndex = problem.correctIndex;
      const wrongOptions = problem.options.filter((_, i) => i !== correctIndex);

      expect(wrongOptions.length).toBe(3);
    });
  });

  describe('проверка стратегий генерации', () => {
    test('стратегия "замена множителя" должна использовать соседнее число', () => {
      // Генерируем много задач и ищем те, где неправильный ответ = (multiplier ± 1) * otherMultiplier
      // Это косвенная проверка - мы просто убеждаемся, что разнообразие есть
      const problems = Array.from({ length: 50 }, () => generateMultiplicationProblem(5));

      // Проверяем, что есть разнообразие в неправильных ответах
      const allWrongAnswers = new Set<number>();
      problems.forEach(problem => {
        problem.options.forEach((opt, i) => {
          if (i !== problem.correctIndex) {
            allWrongAnswers.add(parseInt(opt));
          }
        });
      });

      // Должно быть много разных неправильных ответов
      expect(allWrongAnswers.size).toBeGreaterThan(10);
    });
  });

  describe('проверка fallback механизма', () => {
    test('должен работать fallback при невозможности сгенерировать уникальные ответы', () => {
      // Даже для маленьких чисел всегда должны быть 3 уникальных неправильных ответа
      const problem = generateMultiplicationProblem(2); // maxMultiplier = 2, маленькие числа

      const correctIndex = problem.correctIndex;
      const wrongOptions = problem.options.filter((_, i) => i !== correctIndex);

      expect(wrongOptions.length).toBe(3);

      // Все неправильные ответы должны быть уникальны
      const uniqueWrong = new Set(wrongOptions);
      expect(uniqueWrong.size).toBe(3);
    });
  });
});

describe('getAvailableMultiplicationLevels', () => {
  describe('базовая проверка структуры', () => {
    test('должен возвращать 9 уровней', () => {
      const levels = getAvailableMultiplicationLevels(0);

      expect(levels).toHaveLength(9);
    });

    test('каждый уровень должен иметь все обязательные поля', () => {
      const levels = getAvailableMultiplicationLevels(0);

      levels.forEach(level => {
        expect(level).toHaveProperty('multiplier');
        expect(level).toHaveProperty('maxMultiplier');
        expect(level).toHaveProperty('requiredScore');
        expect(level).toHaveProperty('level');
        expect(level).toHaveProperty('description');
        expect(level).toHaveProperty('examples');
        expect(level).toHaveProperty('name');
        expect(level).toHaveProperty('pointsPerCorrect');
        expect(level).toHaveProperty('available');
      });
    });

    test('multiplier должен соответствовать уровню', () => {
      const levels = getAvailableMultiplicationLevels(0);

      expect(levels[0].multiplier).toBe(2); // уровень 1 → ×2
      expect(levels[1].multiplier).toBe(3); // уровень 2 → ×3
      expect(levels[8].multiplier).toBe(10); // уровень 9 → ×10
    });

    test('description должен быть в формате "Умножение на {multiplier}"', () => {
      const levels = getAvailableMultiplicationLevels(0);

      levels.forEach(level => {
        expect(level.description).toBe(`Умножение на ${level.multiplier}`);
        expect(level.name).toBe(`Умножение на ${level.multiplier}`);
      });
    });

    test('examples должен содержать 3 примера', () => {
      const levels = getAvailableMultiplicationLevels(0);

      levels.forEach(level => {
        expect(level.examples).toHaveLength(3);
        // формат: ["{n} × 1 = {n}", "{n} × 5 = {n*5}", "{n} × 9 = {n*9}"]
        const m = level.multiplier;
        expect(level.examples[0]).toBe(`${m} × 1 = ${m}`);
        expect(level.examples[1]).toBe(`${m} × 5 = ${m * 5}`);
        expect(level.examples[2]).toBe(`${m} × 9 = ${m * 9}`);
      });
    });

    test('pointsPerCorrect должен равняться multiplier', () => {
      const levels = getAvailableMultiplicationLevels(0);

      levels.forEach(level => {
        expect(level.pointsPerCorrect).toBe(level.multiplier);
      });
    });
  });

  describe('проверка requiredScore', () => {
    test('requiredScore должен соответствовать формуле (level - 1) * 30', () => {
      const levels = getAvailableMultiplicationLevels(0);

      levels.forEach(level => {
        // Для умножения: level 1 (×2) → requiredScore 0, level 2 (×3) → 30, и т.д.
        const expectedScore = (level.level - 1) * 30;
        expect(level.requiredScore).toBe(expectedScore);
      });
    });

    test('уровень 1 (×2) должен иметь requiredScore = 0', () => {
      const levels = getAvailableMultiplicationLevels(0);
      expect(levels[0].requiredScore).toBe(0);
    });

    test('уровень 9 (×10) должен иметь requiredScore = 240', () => {
      const levels = getAvailableMultiplicationLevels(0);
      expect(levels[8].requiredScore).toBe(240);
    });
  });

  describe('проверка флага available', () => {
    test('score = 0: только уровень 1 доступен', () => {
      const levels = getAvailableMultiplicationLevels(0);

      expect(levels[0].available).toBe(true);
      expect(levels.filter(l => l.available)).toHaveLength(1);
    });

    test('score = 30: уровни 1-2 доступны', () => {
      const levels = getAvailableMultiplicationLevels(30);

      expect(levels[0].available).toBe(true);
      expect(levels[1].available).toBe(true);
      expect(levels[2].available).toBe(false);
      expect(levels.filter(l => l.available)).toHaveLength(2);
    });

    test('score = 100: уровни 1-4 доступны', () => {
      const levels = getAvailableMultiplicationLevels(100);

      // level 1: 0, level 2: 30, level 3: 60, level 4: 90, level 5: 120
      expect(levels[0].available).toBe(true); // 0 <= 100
      expect(levels[1].available).toBe(true); // 30 <= 100
      expect(levels[2].available).toBe(true); // 60 <= 100
      expect(levels[3].available).toBe(true); // 90 <= 100
      expect(levels[4].available).toBe(false); // 120 > 100
      expect(levels.filter(l => l.available)).toHaveLength(4);
    });

    test('score = 300: все уровни доступны', () => {
      const levels = getAvailableMultiplicationLevels(300);

      levels.forEach(level => {
        expect(level.available).toBe(true);
      });
    });

    test('score = 240: все уровни доступны (граница)', () => {
      const levels = getAvailableMultiplicationLevels(240);

      levels.forEach(level => {
        expect(level.available).toBe(true);
      });
    });

    test('score = 239: уровень 9 недоступен', () => {
      const levels = getAvailableMultiplicationLevels(239);

      expect(levels[8].available).toBe(false); // required 240
      expect(levels[7].available).toBe(true); // required 210
    });
  });

  describe('граничные значения', () => {
    test('score < 0 должен работать корректно', () => {
      const levels = getAvailableMultiplicationLevels(-10);

      expect(levels[0].available).toBe(false); // required 0, but -10 < 0
    });

    test('очень большой score должен открывать все уровни', () => {
      const levels = getAvailableMultiplicationLevels(9999);

      levels.forEach(level => {
        expect(level.available).toBe(true);
      });
    });
  });

  describe('проверка сортировки уровней', () => {
    test('уровни должны быть отсортированы по возрастанию', () => {
      const levels = getAvailableMultiplicationLevels(0);

      for (let i = 0; i < levels.length - 1; i++) {
        expect(levels[i].level).toBeLessThan(levels[i + 1].level);
      }
    });

    test('level должен соответствовать позиции в массиве + 1', () => {
      const levels = getAvailableMultiplicationLevels(0);

      levels.forEach((level, index) => {
        expect(level.level).toBe(index + 1);
      });
    });
  });
});
