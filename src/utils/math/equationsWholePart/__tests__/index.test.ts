/**
 * RED тесты для генератора задач equations-whole-part
 *
 * TDD подход: Сначала пишем failing тесты, потом реализацию
 *
 * Требования из PRD:
 * - FR-002: Генерация уравнений трёх типов
 *   Тип 1: x + a = b (найти неизвестное слагаемое) - unknownAddend
 *   Тип 2: a - x = b (найти вычитаемое) - unknownSubtrahend
 *   Тип 3: x - a = b (найти уменьшаемое) - unknownMinuend
 * - Числа от 1 до 100
 * - x всегда неотрицательное целое число
 * - Сумма/разность от 2 до 100
 */

import { describe, it, expect } from 'vitest';
import {
  generateEquationWholePartProblem,
  generateDiagnosticProblems,
  generateWrongOptions
} from '../index';
import type { EquationWholePartType } from '@/types';

// Алиас для краткости в тестах
type EquationType = EquationWholePartType;

describe('generateEquationWholePartProblem - RED тесты', () => {
  describe('Тип 1: unknownAddend (x + a = b)', () => {
    it('должен генерировать задачу типа unknownAddend', () => {
      const problem = generateEquationWholePartProblem(0, 1, {
        equationTypes: ['unknownAddend']
      });

      expect(problem.equationType).toBe('unknownAddend');
      expect(problem.operationSign).toBe('+');
    });

    it('должен удовлетворять инварианту: часть + часть = целое', () => {
      const problem = generateEquationWholePartProblem(0, 1, {
        equationTypes: ['unknownAddend']
      });

      expect(problem.unknownPart + problem.knownPart).toBe(problem.whole);
    });

    it('должен генерировать корректное выражение', () => {
      const problem = generateEquationWholePartProblem(0, 1, {
        equationTypes: ['unknownAddend']
      });

      expect(problem.expression).toMatch(/^x\s*\+\s*\d+\s*=\s*\d+$/);
    });

    it('значение x должно быть неотрицательным', () => {
      // Генерируем много задач для проверки
      for (let i = 0; i < 50; i++) {
        const problem = generateEquationWholePartProblem(i, 1, {
          equationTypes: ['unknownAddend']
        });
        expect(problem.unknownPart).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Тип 2: unknownSubtrahend (a - x = b)', () => {
    it('должен генерировать задачу типа unknownSubtrahend', () => {
      const problem = generateEquationWholePartProblem(0, 1, {
        equationTypes: ['unknownSubtrahend']
      });

      expect(problem.equationType).toBe('unknownSubtrahend');
      expect(problem.operationSign).toBe('-');
    });

    it('должен удовлетворять инварианту: целое - часть = другая часть', () => {
      const problem = generateEquationWholePartProblem(0, 1, {
        equationTypes: ['unknownSubtrahend']
      });

      expect(problem.whole - problem.unknownPart).toBe(problem.knownPart);
    });

    it('должен генерировать корректное выражение', () => {
      const problem = generateEquationWholePartProblem(0, 1, {
        equationTypes: ['unknownSubtrahend']
      });

      expect(problem.expression).toMatch(/^\d+\s*-\s*x\s*=\s*\d+$/);
    });
  });

  describe('Тип 3: unknownMinuend (x - a = b)', () => {
    it('должен генерировать задачу типа unknownMinuend', () => {
      const problem = generateEquationWholePartProblem(0, 1, {
        equationTypes: ['unknownMinuend']
      });

      expect(problem.equationType).toBe('unknownMinuend');
      expect(problem.operationSign).toBe('-');
    });

    it('должен удовлетворять инварианту: x - a = b, где x = a + b', () => {
      const problem = generateEquationWholePartProblem(0, 1, {
        equationTypes: ['unknownMinuend']
      });

      // Для x - a = b: x = a + b
      // Извлекаем a и b из выражения
      const match = problem.expression.match(/^x\s*-\s*(\d+)\s*=\s*(\d+)$/);
      expect(match).not.toBeNull();

      const a = parseInt(match![1]);
      const b = parseInt(match![2]);
      const x = problem.unknownPart;

      expect(x).toBe(a + b);
      expect(x).toBe(problem.whole);
    });

    it('должен генерировать корректное выражение', () => {
      const problem = generateEquationWholePartProblem(0, 1, {
        equationTypes: ['unknownMinuend']
      });

      expect(problem.expression).toMatch(/^x\s*-\s*\d+\s*=\s*\d+$/);
    });

    it('whole должно быть равно unknownPart (уменьшаемое)', () => {
      const problem = generateEquationWholePartProblem(0, 1, {
        equationTypes: ['unknownMinuend']
      });

      expect(problem.whole).toBe(problem.unknownPart);
    });
  });

  describe('Варианты ответов', () => {
    it('должен генерировать 4 варианта ответа', () => {
      const problem = generateEquationWholePartProblem(0, 1);

      expect(problem.options).toHaveLength(4);
    });

    it('правильный ответ должен находиться в вариантах', () => {
      const problem = generateEquationWholePartProblem(0, 1);

      expect(problem.options[problem.correctIndex]).toBe(problem.unknownPart.toString());
    });

    it('все варианты должны быть уникальными', () => {
      const problem = generateEquationWholePartProblem(0, 1);
      const uniqueOptions = new Set(problem.options);

      expect(uniqueOptions.size).toBe(4);
    });

    it('варианты должны быть строками', () => {
      const problem = generateEquationWholePartProblem(0, 1);

      problem.options.forEach(option => {
        expect(typeof option).toBe('string');
      });
    });
  });

  describe('Ограничения на числа', () => {
    it('целое должно быть от 2 до 100', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateEquationWholePartProblem(i, 1, { maxNumber: 100 });
        expect(problem.whole).toBeGreaterThanOrEqual(2);
        expect(problem.whole).toBeLessThanOrEqual(100);
      }
    });

    it('части должны быть неотрицательными', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateEquationWholePartProblem(i, 1, { maxNumber: 100 });
        expect(problem.knownPart).toBeGreaterThanOrEqual(0);
        expect(problem.unknownPart).toBeGreaterThanOrEqual(0);
      }
    });

    it('целое должно быть больше или равно любой части', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateEquationWholePartProblem(i, 1, { maxNumber: 100 });
        expect(problem.whole).toBeGreaterThanOrEqual(problem.knownPart);
        expect(problem.whole).toBeGreaterThanOrEqual(problem.unknownPart);
      }
    });

    it('должен учитывать maxNumber опцию', () => {
      const problem = generateEquationWholePartProblem(0, 1, { maxNumber: 20 });

      expect(problem.whole).toBeLessThanOrEqual(20);
    });
  });

  describe('Уровни сложности', () => {
    it('сложность 1-3: числа до 10', () => {
      const problem = generateEquationWholePartProblem(0, 1, { maxNumber: 10 });

      expect(problem.whole).toBeLessThanOrEqual(10);
      expect(problem.difficulty).toBe(1);
    });

    it('сложность 4-6: числа до 20', () => {
      const problem = generateEquationWholePartProblem(0, 5, { maxNumber: 20 });

      expect(problem.whole).toBeLessThanOrEqual(20);
      expect(problem.difficulty).toBe(5);
    });

    it('сложность 7-10: числа до 100', () => {
      const problem = generateEquationWholePartProblem(0, 8, { maxNumber: 100 });

      expect(problem.whole).toBeLessThanOrEqual(100);
      expect(problem.difficulty).toBe(8);
    });
  });

  describe('Совместимость с MathProblem', () => {
    it('должен иметь все обязательные поля MathProblem', () => {
      const problem = generateEquationWholePartProblem(0, 1);

      expect(problem).toHaveProperty('id');
      expect(problem).toHaveProperty('expression');
      expect(problem).toHaveProperty('operation');
      expect(problem).toHaveProperty('num1');
      expect(problem).toHaveProperty('num2');
      expect(problem).toHaveProperty('correctAnswer');
      expect(problem).toHaveProperty('options');
      expect(problem).toHaveProperty('correctIndex');
      expect(problem).toHaveProperty('difficulty');
    });

    it('correctAnswer должен равняться unknownPart', () => {
      const problem = generateEquationWholePartProblem(0, 1);

      expect(problem.correctAnswer).toBe(problem.unknownPart);
    });

    it('operation должно быть "equation"', () => {
      const problem = generateEquationWholePartProblem(0, 1);

      expect(problem.operation).toBe('equation');
    });
  });
});

describe('generateWrongOptions - RED тесты', () => {
  it('должен генерировать 3 неправильных варианта', () => {
    const wrongOptions = generateWrongOptions(5, 10, 3);

    expect(wrongOptions).toHaveLength(3);
  });

  it('неправильные варианты не должны содержать правильный ответ', () => {
    const correctAnswer = 7;
    const wrongOptions = generateWrongOptions(correctAnswer, 10, 3);

    wrongOptions.forEach(option => {
      expect(option).not.toBe(correctAnswer.toString());
    });
  });

  it('все варианты должны быть уникальными', () => {
    const wrongOptions = generateWrongOptions(5, 10, 3);
    const uniqueOptions = new Set(wrongOptions);

    expect(uniqueOptions.size).toBe(3);
  });

  it('варианты должны быть строками', () => {
    const wrongOptions = generateWrongOptions(5, 10, 3);

    wrongOptions.forEach(option => {
      expect(typeof option).toBe('string');
    });
  });

  it('варианты должны быть в разумном диапазоне (от 0 до maxNumber)', () => {
    const wrongOptions = generateWrongOptions(5, 10, 3);

    wrongOptions.forEach(option => {
      const num = parseInt(option);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(10);
    });
  });
});

describe('generateDiagnosticProblems - RED тесты', () => {
  it('должен генерировать 10 диагностических задач', () => {
    const problems = generateDiagnosticProblems();

    expect(problems).toHaveLength(10);
  });

  it('каждая задача должна иметь корректную структуру', () => {
    const problems = generateDiagnosticProblems();

    problems.forEach(problem => {
      expect(problem).toHaveProperty('expression');
      expect(problem).toHaveProperty('equationType');
      expect(problem).toHaveProperty('whole');
      expect(problem).toHaveProperty('knownPart');
      expect(problem).toHaveProperty('unknownPart');
      expect(problem).toHaveProperty('options');
      expect(problem).toHaveProperty('correctIndex');
    });
  });

  it('должен содержать все три типа уравнений', () => {
    const problems = generateDiagnosticProblems();
    const types = new Set(problems.map(p => p.equationType));

    expect(types.has('unknownAddend')).toBe(true);
    expect(types.has('unknownSubtrahend')).toBe(true);
    expect(types.has('unknownMinuend')).toBe(true);
  });

  it('все задачи должны быть на уровне 2 (текстовые метки)', () => {
    const problems = generateDiagnosticProblems();

    problems.forEach(problem => {
      expect(problem.supportLevel).toBe(2);
    });
  });
});

describe('Инварианты системы (стресс-тесты)', () => {
  it('100 задач: все части неотрицательные', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateEquationWholePartProblem(i, Math.ceil(Math.random() * 10));
      expect(problem.unknownPart).toBeGreaterThanOrEqual(0);
      expect(problem.knownPart).toBeGreaterThanOrEqual(0);
    }
  });

  it('100 задач: целое >= части', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateEquationWholePartProblem(i, Math.ceil(Math.random() * 10));
      expect(problem.whole).toBeGreaterThanOrEqual(problem.knownPart);
      expect(problem.whole).toBeGreaterThanOrEqual(problem.unknownPart);
    }
  });

  it('100 задач: правильный ответ в вариантах', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateEquationWholePartProblem(i, Math.ceil(Math.random() * 10));
      const correctOption = problem.options[problem.correctIndex];
      expect(parseInt(correctOption)).toBe(problem.unknownPart);
    }
  });
});

describe('Edge cases', () => {
  it('должен работать с минимальными числами (whole = 2)', () => {
    const problem = generateEquationWholePartProblem(0, 1, { maxNumber: 2 });

    expect(problem.whole).toBeGreaterThanOrEqual(2);
  });

  it('должен работать с максимальными числами (whole = 100)', () => {
    const problem = generateEquationWholePartProblem(0, 10, { maxNumber: 100 });

    expect(problem.whole).toBeLessThanOrEqual(100);
  });

  it('должен обрабатывать все три типа уравнений', () => {
    const types: EquationType[] = ['unknownAddend', 'unknownSubtrahend', 'unknownMinuend'];

    types.forEach(type => {
      const problem = generateEquationWholePartProblem(0, 1, {
        equationTypes: [type]
      });
      expect(problem.equationType).toBe(type);
    });
  });

  it('должен генерировать уникальные ID для задач', () => {
    const problem1 = generateEquationWholePartProblem(0, 1);
    const problem2 = generateEquationWholePartProblem(1, 1);

    expect(problem1.id).not.toBe(problem2.id);
  });
});
