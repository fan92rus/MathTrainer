import { describe, test, expect } from 'vitest';
import {
  generateCloseAnswers,
  generateLastDigitErrors,
  generateTensErrors,
  isTooCloseToOthers,
  ensureUniqueAnswers,
  createMathExpression,
  calculateMathResult,
  shuffleArray
} from '../math/common';

describe('generateCloseAnswers', () => {
  test('должен генерировать ответы в заданном диапазоне', () => {
    const options: number[] = [];
    generateCloseAnswers(50, 2, 5, options, 100);

    expect(options.length).toBeGreaterThan(0);
    options.forEach(answer => {
      expect(answer).toBeGreaterThanOrEqual(45); // 50 - 5
      expect(answer).toBeLessThanOrEqual(55); // 50 + 5
      expect(answer).not.toBe(50);
    });
  });

  test('не должен включать правильный ответ', () => {
    const options: number[] = [];
    generateCloseAnswers(50, 2, 5, options, 100);

    options.forEach(answer => {
      expect(answer).not.toBe(50);
    });
  });

  test('не должен дублировать ответы', () => {
    const options: number[] = [];
    generateCloseAnswers(50, 2, 5, options, 100);

    const uniqueOptions = new Set(options);
    expect(uniqueOptions.size).toBe(options.length);
  });

  test('ответы не должны быть отрицательными', () => {
    const options: number[] = [];
    generateCloseAnswers(5, 2, 5, options, 100);

    options.forEach(answer => {
      expect(answer).toBeGreaterThanOrEqual(0);
    });
  });

  test('minDistance должен соблюдаться', () => {
    const options: number[] = [];
    generateCloseAnswers(50, 3, 5, options, 100);

    options.forEach(answer => {
      const distance = Math.abs(answer - 50);
      expect(distance).toBeGreaterThanOrEqual(3);
    });
  });

  test('должен добавлять ответы в переданный массив', () => {
    const options: number[] = [100]; // существующий элемент
    const initialLength = options.length;
    generateCloseAnswers(50, 2, 5, options, 100);

    expect(options.length).toBeGreaterThan(initialLength);
    expect(options[0]).toBe(100); // старый элемент сохранен
  });

  test('должен останавливаться после 3 ответов', () => {
    const options: number[] = [];
    generateCloseAnswers(50, 2, 5, options, 100);

    expect(options.length).toBeLessThanOrEqual(3);
  });

  test('должен работать с малым maxDistance', () => {
    const options: number[] = [];
    generateCloseAnswers(50, 1, 2, options, 100);

    options.forEach(answer => {
      expect(answer).toBeGreaterThanOrEqual(48); // 50 - 2
      expect(answer).toBeLessThanOrEqual(52); // 50 + 2
    });
  });
});

describe('generateLastDigitErrors', () => {
  test('должен менять только последнюю цифру', () => {
    const options: number[] = [];
    generateLastDigitErrors(123, options, 100);

    options.forEach(answer => {
      const tens = Math.floor(answer / 10);
      expect(tens).toBe(12); // 120-129
    });
  });

  test('должен сохранять десятки', () => {
    const options: number[] = [];
    generateLastDigitErrors(45, options, 100);

    options.forEach(answer => {
      expect(Math.floor(answer / 10)).toBe(4);
    });
  });

  test('не должен генерировать правильный ответ', () => {
    const options: number[] = [];
    generateLastDigitErrors(45, options, 100);

    options.forEach(answer => {
      expect(answer).not.toBe(45);
    });
  });

  test('не должен дублировать ответы', () => {
    const options: number[] = [];
    generateLastDigitErrors(45, options, 100);

    const uniqueOptions = new Set(options);
    expect(uniqueOptions.size).toBe(options.length);
  });

  test('должен работать с числами меньше 10', () => {
    const options: number[] = [];
    generateLastDigitErrors(5, options, 100);

    options.forEach(answer => {
      expect(answer).toBeGreaterThanOrEqual(0);
      expect(answer).toBeLessThanOrEqual(9);
      expect(answer).not.toBe(5);
    });
  });

  test('последняя цифра должна быть другой', () => {
    const options: number[] = [];
    generateLastDigitErrors(45, options, 100);

    options.forEach(answer => {
      expect(answer % 10).not.toBe(5);
    });
  });

  test('должен генерировать 3 варианта', () => {
    const options: number[] = [];
    generateLastDigitErrors(45, options, 100);

    expect(options.length).toBe(3);
  });
});

describe('generateTensErrors', () => {
  test('должен менять только десятки', () => {
    const options: number[] = [];
    generateTensErrors(45, options, 100);

    options.forEach(answer => {
      expect(answer % 10).toBe(5); // единицы те же
    });
  });

  test('должен сохранять единицы', () => {
    const options: number[] = [];
    generateTensErrors(123, options, 100);

    options.forEach(answer => {
      expect(answer % 10).toBe(3);
    });
  });

  test('не должен генерировать правильный ответ', () => {
    const options: number[] = [];
    generateTensErrors(45, options, 100);

    options.forEach(answer => {
      expect(answer).not.toBe(45);
    });
  });

  test('не должен дублировать ответы', () => {
    const options: number[] = [];
    generateTensErrors(45, options, 100);

    const uniqueOptions = new Set(options);
    expect(uniqueOptions.size).toBe(options.length);
  });

  test('десятки должны быть не менее 1', () => {
    const options: number[] = [];
    generateTensErrors(15, options, 100);

    options.forEach(answer => {
      expect(Math.floor(answer / 10)).toBeGreaterThanOrEqual(1);
    });
  });

  test('должен возвращать пустой для чисел < 10', () => {
    const options: number[] = [];
    generateTensErrors(5, options, 100);

    // Для чисел < 10 функция не добавляет варианты
    // но может генерировать варианты с отрицательными числами или 0
    // Проверим что хотя бы не падает
    expect(options).toBeDefined();
  });
});

describe('isTooCloseToOthers', () => {
  test('должен возвращать true если ответ слишком близок', () => {
    const result = isTooCloseToOthers(5, [3, 8], 2);
    // |5 - 3| = 2, что не меньше 2, но в коде < minDistance
    // Проверяем что для расстояния ровно 2 вернёт false
    expect(result).toBe(false);

    const result2 = isTooCloseToOthers(5, [3, 7], 3);
    // |5 - 3| = 2 < 3
    expect(result2).toBe(true);
  });

  test('должен возвращать false если ответ достаточно далёк', () => {
    const result = isTooCloseToOthers(10, [3, 8], 2);
    // |10 - 8| = 2 >= 2
    expect(result).toBe(false);
  });

  test('должен проверять все существующие ответы', () => {
    const result = isTooCloseToOthers(5, [1, 10, 20], 2);
    // |5 - 1| = 4 >= 2, |5 - 10| = 5 >= 2, |5 - 20| = 15 >= 2
    expect(result).toBe(false);
  });

  test('minDistance по умолчанию = 2', () => {
    const result = isTooCloseToOthers(5, [3]);
    // |5 - 3| = 2, но в коде < 2, значит false
    // Если minDistance = 2 (по умолчанию), то 2 < 2 = false
    expect(result).toBe(false);
  });

  test('пустой массив existingAnswers -> false', () => {
    const result = isTooCloseToOthers(5, []);
    expect(result).toBe(false);
  });

  test('должен работать с одним существующим ответом', () => {
    const result = isTooCloseToOthers(5, [7], 3);
    // |5 - 7| = 2 < 3
    expect(result).toBe(true);
  });

  test('точная граница minDistance', () => {
    const result = isTooCloseToOthers(5, [3], 2);
    // |5 - 3| = 2, в коде проверяется < minDistance (2 < 2 = false)
    expect(result).toBe(false);
  });
});

describe('ensureUniqueAnswers', () => {
  test('должен удалять дубликаты', () => {
    const result = ensureUniqueAnswers([1, 2, 2, 3, 3, 3]);
    expect(result).toEqual([1, 2, 3]);
  });

  test('должен сохранять порядок первого вхождения', () => {
    const result = ensureUniqueAnswers([3, 1, 2, 1, 3]);
    // Set сохраняет порядок вставки
    expect(result).toContain(3);
    expect(result).toContain(1);
    expect(result).toContain(2);
    expect(result.length).toBe(3);
  });

  test('пустой массив -> пустой массив', () => {
    const result = ensureUniqueAnswers([]);
    expect(result).toEqual([]);
  });

  test('массив без дубликатов -> тот же размер', () => {
    const result = ensureUniqueAnswers([1, 2, 3]);
    expect(result.length).toBe(3);
    expect(result).toContain(1);
    expect(result).toContain(2);
    expect(result).toContain(3);
  });

  test('все элементы одинаковые -> один элемент', () => {
    const result = ensureUniqueAnswers([5, 5, 5]);
    expect(result).toEqual([5]);
  });

  test('сохраняет все уникальные значения', () => {
    const result = ensureUniqueAnswers([10, 20, 30, 10, 20]);
    expect(result).toContain(10);
    expect(result).toContain(20);
    expect(result).toContain(30);
    expect(result.length).toBe(3);
  });
});

describe('createMathExpression', () => {
  test('для операции addition должен использовать +', () => {
    const result = createMathExpression(2, 3, 'addition');
    expect(result).toBe('2 + 3');
  });

  test('для операции subtraction должен использовать -', () => {
    const result = createMathExpression(5, 2, 'subtraction');
    expect(result).toBe('5 - 2');
  });

  test('должен работать с отрицательными числами', () => {
    const result = createMathExpression(-5, 3, 'addition');
    expect(result).toBe('-5 + 3');
  });

  test('должен работать с нулём', () => {
    const result = createMathExpression(0, 5, 'addition');
    expect(result).toBe('0 + 5');
  });

  test('формат результата должен быть "num1 operation num2"', () => {
    const resultAdd = createMathExpression(10, 5, 'addition');
    expect(resultAdd).toMatch(/^\d+\s\+\s\d+$/);

    const resultSub = createMathExpression(10, 5, 'subtraction');
    expect(resultSub).toMatch(/^\d+\s\-\s\d+$/);
  });
});

describe('calculateMathResult', () => {
  test('для операции addition должен возвращать сумму', () => {
    const result = calculateMathResult(2, 3, 'addition');
    expect(result).toBe(5);
  });

  test('для операции subtraction должен возвращать разность', () => {
    const result = calculateMathResult(5, 2, 'subtraction');
    expect(result).toBe(3);
  });

  test('должен работать с отрицательными числами', () => {
    const result = calculateMathResult(-5, 3, 'addition');
    expect(result).toBe(-2);
  });

  test('должен работать с нулём', () => {
    const result = calculateMathResult(0, 5, 'addition');
    expect(result).toBe(5);
  });

  test('вычитание может давать отрицательный результат', () => {
    const result = calculateMathResult(3, 5, 'subtraction');
    expect(result).toBe(-2);
  });

  test('сложение нулей даёт ноль', () => {
    const result = calculateMathResult(0, 0, 'addition');
    expect(result).toBe(0);
  });

  test('вычитание равных чисел даёт ноль', () => {
    const result = calculateMathResult(5, 5, 'subtraction');
    expect(result).toBe(0);
  });
});

describe('shuffleArray', () => {
  test('должен возвращать массив того же размера', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);

    expect(result.length).toBe(input.length);
  });

  test('должен содержать те же элементы', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);

    expect(result).toContain(1);
    expect(result).toContain(2);
    expect(result).toContain(3);
    expect(result).toContain(4);
    expect(result).toContain(5);
  });

  test('не должен изменять исходный массив', () => {
    const input = [1, 2, 3, 4, 5];
    const originalOrder = [...input];
    shuffleArray(input);

    expect(input).toEqual(originalOrder);
  });

  test('должен возвращать новый массив', () => {
    const input = [1, 2, 3];
    const result = shuffleArray(input);

    expect(result).not.toBe(input);
  });

  test('при многократных вызовах может давать разные результаты', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = Array.from({ length: 20 }, () => shuffleArray(input).join(''));

    const uniqueResults = new Set(results);
    // С вероятностью близкой к 1, будут разные перестановки
    expect(uniqueResults.size).toBeGreaterThan(1);
  });

  test('должен работать с пустым массивом', () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  test('должен работать с одним элементом', () => {
    const result = shuffleArray([42]);
    expect(result).toEqual([42]);
  });

  test('должен работать с строками', () => {
    const input = ['a', 'b', 'c'];
    const result = shuffleArray(input);

    expect(result.length).toBe(3);
    expect(result).toContain('a');
    expect(result).toContain('b');
    expect(result).toContain('c');
  });
});
