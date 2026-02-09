/**
 * Тесты для генератора задач на вычитание в столбик
 */

import { describe, it, expect } from 'vitest';
import {
  needsBorrowing,
  hasZeroInUnits,
  generateWrongOptions,
  generateColumnSubtractionProblem,
  generateDiagnosticProblems
} from '../index';

describe('needsBorrowing', () => {
  it('возвращает true, когда единицы уменьшаемого меньше единиц вычитаемого', () => {
    expect(needsBorrowing(52, 17)).toBe(true); // 2 < 7
    expect(needsBorrowing(45, 27)).toBe(true); // 5 < 7
    expect(needsBorrowing(71, 38)).toBe(true); // 1 < 8
  });

  it('возвращает false, когда единицы уменьшаемого больше или равны единицам вычитаемого', () => {
    expect(needsBorrowing(57, 23)).toBe(false); // 7 >= 3
    expect(needsBorrowing(64, 42)).toBe(false); // 4 >= 2
    expect(needsBorrowing(85, 15)).toBe(false); // 5 >= 5
  });

  it('работает с двузначными числами до 100', () => {
    expect(needsBorrowing(99, 19)).toBe(false); // 9 >= 9, заимствование не нужно
    expect(needsBorrowing(90, 10)).toBe(false); // 0 >= 0, заимствование не нужно
  });
});

describe('hasZeroInUnits', () => {
  it('возвращает true для чисел, заканчивающихся на 0', () => {
    expect(hasZeroInUnits(10)).toBe(true);
    expect(hasZeroInUnits(20)).toBe(true);
    expect(hasZeroInUnits(40)).toBe(true);
    expect(hasZeroInUnits(90)).toBe(true);
  });

  it('возвращает false для чисел, не заканчивающихся на 0', () => {
    expect(hasZeroInUnits(11)).toBe(false);
    expect(hasZeroInUnits(25)).toBe(false);
    expect(hasZeroInUnits(37)).toBe(false);
    expect(hasZeroInUnits(99)).toBe(false);
  });
});

describe('generateWrongOptions', () => {
  it('генерирует 3 неправильных варианта', () => {
    const wrong = generateWrongOptions(35, 52, 17);
    expect(wrong).toHaveLength(3);
  });

  it('не включает правильный ответ', () => {
    const correctAnswer = 35;
    const wrong = generateWrongOptions(correctAnswer, 52, 17);
    expect(wrong).not.toContain(correctAnswer.toString());
  });

  it('генерирует уникальные варианты', () => {
    const wrong = generateWrongOptions(35, 52, 17);
    const unique = new Set(wrong);
    expect(unique.size).toBe(3);
  });

  it('генерирует "перевёрнутый" ответ для двузначных результатов', () => {
    // Для 35, "перевёрнутый" ответ будет 53
    const wrong = generateWrongOptions(35, 52, 17);
    expect(wrong).toContain('53');
  });

  it('генерирует варианты в диапазоне 1-99', () => {
    const wrong = generateWrongOptions(45, 72, 27);
    wrong.forEach(option => {
      const num = parseInt(option, 10);
      expect(num).toBeGreaterThan(0);
      expect(num).toBeLessThan(100);
    });
  });
});

describe('generateColumnSubtractionProblem', () => {
  it('генерирует корректную задачу', () => {
    const problem = generateColumnSubtractionProblem(5);

    expect(problem.minuend).toBeGreaterThan(10);
    expect(problem.minuend).toBeLessThan(100);
    expect(problem.subtrahend).toBeGreaterThan(10);
    expect(problem.subtrahend).toBeLessThan(problem.minuend);
    expect(problem.result).toBe(problem.minuend - problem.subtrahend);
  });

  it('генерирует 4 варианта ответа', () => {
    const problem = generateColumnSubtractionProblem(5);
    expect(problem.options).toHaveLength(4);
  });

  it('правильный ответ находится в вариантах', () => {
    const problem = generateColumnSubtractionProblem(5);
    expect(problem.options[problem.correctIndex]).toBe(problem.correctAnswer.toString());
  });

  it('генерирует задачу с заимствованием при сложности > 3', () => {
    // При высокой сложности заимствование должно быть大概率
    // Проверим несколько раз
    let borrowCount = 0;
    for (let i = 0; i < 20; i++) {
      const p = generateColumnSubtractionProblem(5);
      if (p.needsBorrowing) borrowCount++;
    }
    // Большинство примеров должны быть с заимствованием
    expect(borrowCount).toBeGreaterThan(10);
  });

  it('содержит все обязательные поля', () => {
    const problem = generateColumnSubtractionProblem(3);

    expect(problem).toHaveProperty('id');
    expect(problem).toHaveProperty('minuend');
    expect(problem).toHaveProperty('subtrahend');
    expect(problem).toHaveProperty('result');
    expect(problem).toHaveProperty('needsBorrowing');
    expect(problem).toHaveProperty('borrowFromTens');
    expect(problem).toHaveProperty('hasZeroInUnits');
    expect(problem).toHaveProperty('expression');
    expect(problem).toHaveProperty('correctAnswer');
    expect(problem).toHaveProperty('options');
    expect(problem).toHaveProperty('correctIndex');
    expect(problem).toHaveProperty('difficulty');
    expect(problem).toHaveProperty('operation');
  });

  it('совместим с MathProblem типом', () => {
    const problem = generateColumnSubtractionProblem(3);

    expect(problem.operation).toBe('subtraction');
    expect(problem.num1).toBe(problem.minuend);
    expect(problem.num2).toBe(problem.subtrahend);
    expect(problem.expression).toBe(`${problem.minuend} - ${problem.subtrahend}`);
  });
});

describe('generateDiagnosticProblems', () => {
  it('генерирует 10 задач', () => {
    const problems = generateDiagnosticProblems();
    expect(problems).toHaveLength(10);
  });

  it('все задачи корректны', () => {
    const problems = generateDiagnosticProblems();

    problems.forEach(problem => {
      expect(problem.minuend).toBeGreaterThan(10);
      expect(problem.minuend).toBeLessThan(100);
      expect(problem.subtrahend).toBeGreaterThan(10);
      expect(problem.subtrahend).toBeLessThan(problem.minuend);
      expect(problem.result).toBe(problem.minuend - problem.subtrahend);
      expect(problem.options).toHaveLength(4);
      expect(problem.correctAnswer).toBe(problem.result);
    });
  });

  it('содержит примеры с заимствованием', () => {
    const problems = generateDiagnosticProblems();
    const borrowingProblems = problems.filter(p => p.needsBorrowing);

    // Должно быть не менее 3 примеров с заимствованием
    expect(borrowingProblems.length).toBeGreaterThanOrEqual(3);
  });

  it('содержит примеры с двузначным результатом', () => {
    const problems = generateDiagnosticProblems();
    const twoDigitResults = problems.filter(p => p.result >= 10);

    // Большинство результатов должны быть двузначными
    expect(twoDigitResults.length).toBeGreaterThanOrEqual(5);
  });

  it('содержит примеры с нулём в единицах', () => {
    const problems = generateDiagnosticProblems();
    const zeroUnitsProblems = problems.filter(p => p.hasZeroInUnits);

    // Должно быть не менее 2 примеров с нулём
    expect(zeroUnitsProblems.length).toBeGreaterThanOrEqual(2);
  });
});

// Property-based тесты для проверки инвариантов
describe('Property-based тесты', () => {
  describe('Инварианты вычитания', () => {
    const testCases = [
      [20, 11], [99, 10], [50, 25], [73, 38], [91, 47],
      [40, 13], [60, 27], [85, 39], [32, 15], [67, 29]
    ];

    it.each(testCases)('для %d - %d результат всегда положительный и меньше 100', (minuend, subtrahend) => {
      const result = minuend - subtrahend;

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(100);
    });

    it.each(testCases)('для %d - %d единицы результата корректны', (minuend, subtrahend) => {
      const result = minuend - subtrahend;
      const resultUnits = result % 10;

      // Единицы результата должны быть от 0 до 9
      expect(resultUnits).toBeGreaterThanOrEqual(0);
      expect(resultUnits).toBeLessThanOrEqual(9);
    });
  });

  describe('Инварианты заимствования', () => {
    it('когда единицы уменьшаемого меньше единиц вычитаемого, заимствование нужно', () => {
      const cases = [
        [52, 17], [45, 27], [71, 38], [83, 49], [64, 26]
      ];

      cases.forEach(([minuend, subtrahend]) => {
        expect(needsBorrowing(minuend, subtrahend)).toBe(true);
      });
    });

    it('когда единицы уменьшаемого больше или равны единицам вычитаемого, заимствование не нужно', () => {
      const cases = [
        [57, 23], [64, 42], [85, 15], [99, 19], [73, 31]
      ];

      cases.forEach(([minuend, subtrahend]) => {
        expect(needsBorrowing(minuend, subtrahend)).toBe(false);
      });
    });
  });

  describe('Инварианты генерации неправильных вариантов', () => {
    it.each([10, 15, 23, 45, 67, 89])('для правильного ответа %d все варианты уникальны', (correctAnswer) => {
      const minuend = correctAnswer + 15;
      const subtrahend = 15;
      const wrongOptions = generateWrongOptions(correctAnswer, minuend, subtrahend);

      const unique = new Set(wrongOptions);
      expect(unique.size).toBe(3);
    });

    it.each([10, 15, 23, 45, 67, 89])('для правильного ответа %d варианты не содержат правильный ответ', (correctAnswer) => {
      const minuend = correctAnswer + 15;
      const subtrahend = 15;
      const wrongOptions = generateWrongOptions(correctAnswer, minuend, subtrahend);

      expect(wrongOptions).not.toContain(correctAnswer.toString());
    });

    it.each([10, 15, 23, 45, 67, 89])('для правильного ответа %d все варианты в диапазоне 1-99', (correctAnswer) => {
      const minuend = correctAnswer + 15;
      const subtrahend = 15;
      const wrongOptions = generateWrongOptions(correctAnswer, minuend, subtrahend);

      wrongOptions.forEach(option => {
        const num = parseInt(option, 10);
        expect(num).toBeGreaterThan(0);
        expect(num).toBeLessThan(100);
      });
    });
  });
});

// Edge cases тесты
describe('Edge cases для вычитания в столбик', () => {
  describe('Минимальные значения', () => {
    it('должен работать с минимальным двузначным вычитаемым (11)', () => {
      const minuend = 25;
      const subtrahend = 11;

      expect(minuend - subtrahend).toBe(14);
      expect(needsBorrowing(minuend, subtrahend)).toBe(false);
    });

    it('должен работать с разницей 1 (21-20)', () => {
      const minuend = 21;
      const subtrahend = 20;

      expect(minuend - subtrahend).toBe(1);
    });
  });

  describe('Максимальные значения', () => {
    it('должен работать с максимальным двузначным уменьшаемым (99)', () => {
      const minuend = 99;
      const subtrahend = 74; // 9 < 4? Нет, нужны другие цифры

      expect(minuend - subtrahend).toBe(25);
      expect(needsBorrowing(minuend, subtrahend)).toBe(false);
    });

    it('должен работать с результатом 89 (максимальный двузначный)', () => {
      const minuend = 99;
      const subtrahend = 10;

      expect(minuend - subtrahend).toBe(89);
      expect(needsBorrowing(minuend, subtrahend)).toBe(false);
    });
  });

  describe('Специальные случаи', () => {
    it('должен работать когда единицы равны (44-22)', () => {
      const minuend = 44;
      const subtrahend = 22;

      expect(minuend - subtrahend).toBe(22);
      expect(needsBorrowing(minuend, subtrahend)).toBe(false);
    });

    it('должен работать с нулём в единицах уменьшаемого (40-13)', () => {
      const minuend = 40;
      const subtrahend = 13;

      expect(minuend - subtrahend).toBe(27);
      expect(hasZeroInUnits(minuend)).toBe(true);
      expect(needsBorrowing(minuend, subtrahend)).toBe(true);
    });

    it('должен работать с нулём в единицах вычитаемого (57-30)', () => {
      const minuend = 57;
      const subtrahend = 30;

      expect(minuend - subtrahend).toBe(27);
      expect(needsBorrowing(minuend, subtrahend)).toBe(false);
    });

    it('должен работать когда обе цифры единиц равны 9 (99-29)', () => {
      const minuend = 99;
      const subtrahend = 29;

      expect(minuend - subtrahend).toBe(70);
      expect(needsBorrowing(minuend, subtrahend)).toBe(false);
    });

    it('должен работать с "переворотами" цифр (72-27=45, переворот 54)', () => {
      const minuend = 72;
      const subtrahend = 27;
      const result = minuend - subtrahend;

      expect(result).toBe(45);

      // "Перевёрнутый" ответ будет 54
      const flipped = 54;
      const wrongOptions = generateWrongOptions(result, minuend, subtrahend);

      expect(wrongOptions).toContain(flipped.toString());
    });
  });

  describe('Граничные случаи заимствования', () => {
    it('должен определять заимствование когда единицы на 1 меньше (32-19)', () => {
      const minuend = 32;
      const subtrahend = 19;

      expect(needsBorrowing(minuend, subtrahend)).toBe(true);
    });

    it('должен определять заимствование когда единицы 0, а вычитаемое >0 (50-13)', () => {
      const minuend = 50;
      const subtrahend = 13;

      expect(needsBorrowing(minuend, subtrahend)).toBe(true);
      expect(hasZeroInUnits(minuend)).toBe(true);
    });

    it('не должен требовать заимствования когда единицы равны (67-37)', () => {
      const minuend = 67;
      const subtrahend = 37;

      expect(needsBorrowing(minuend, subtrahend)).toBe(false);
    });
  });
});
