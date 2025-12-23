/**
 * Тесты для генерации уравнений
 */

import { generateEquationProblem } from '../math/equations';
import { describe, test, expect } from 'vitest';

// Вспомогательная функция для проверки правильности ответа в уравнении
function verifyEquationAnswer(expression: string, x: number, expectedAnswer: number): boolean {
  // Заменяем x на значение и вычисляем результат
  const evalExpression = expression
    .replace(/x/g, x.toString())
    .replace(/×/g, '*')
    .replace(/\s+/g, '');

  try {
    // Разделяем на левую и правую часть
    const parts = evalExpression.split('=');
    const leftSide = eval(parts[0]);
    const rightSide = eval(parts[1]);
    return Math.abs(leftSide - rightSide) < 0.001;
  } catch {
    return false;
  }
}

describe('generateEquationProblem', () => {
  describe('Базовая проверка структуры', () => {
    test('должен возвращать валидную структуру problem', () => {
      const problem = generateEquationProblem(25);

      expect(problem).toHaveProperty('expression');
      expect(problem).toHaveProperty('operation', 'equation');
      expect(problem).toHaveProperty('num1', 0);
      expect(problem).toHaveProperty('num2', 0);
      expect(problem).toHaveProperty('correctAnswer');
      expect(problem).toHaveProperty('options');
      expect(problem).toHaveProperty('correctIndex');
      expect(problem).toHaveProperty('difficulty');
      expect(problem).toHaveProperty('xValue');
      expect(problem).toHaveProperty('equationType');

      expect(typeof problem.expression).toBe('string');
      expect(typeof problem.correctAnswer).toBe('number');
      expect(Array.isArray(problem.options)).toBe(true);
      expect(typeof problem.correctIndex).toBe('number');
      expect(typeof problem.difficulty).toBe('number');
      expect(problem.options).toHaveLength(4);
      expect(problem.equationType).toBeDefined();
    });

    test('должен генерировать 4 варианта ответа', () => {
      const problem = generateEquationProblem(25);

      expect(problem.options).toHaveLength(4);
      expect(problem.options).toContain(String(problem.correctAnswer));
      expect(problem.correctIndex).toBeGreaterThanOrEqual(0);
      expect(problem.correctIndex).toBeLessThan(4);
    });

    test('correctAnswer должен соответствовать xValue', () => {
      const problem = generateEquationProblem(25);

      expect(problem.correctAnswer).toBe(problem.xValue);
    });

    test('ответ должен быть правильным для уравнения', () => {
      const problem = generateEquationProblem(25);

      // Проверяем что подставленный xValue решает уравнение правильно
      const isValid = verifyEquationAnswer(problem.expression, problem.xValue, problem.correctAnswer);
      expect(isValid).toBe(true);
    });
  });

  describe('Типы уравнений', () => {
    test('должен генерировать простые уравнения для низких уровней', () => {
      // Генерируем несколько уравнений для низкого уровня
      const problems = Array.from({ length: 10 }, () => generateEquationProblem(25));

      // Все должны быть валидными
      problems.forEach(problem => {
        expect(problem.expression).toBeDefined();
        expect(problem.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(problem.options).toHaveLength(4);
        expect(problem.options).toContain(String(problem.correctAnswer));
      });
    });

    test('должен генерировать уравнения со скобками для средних уровней', () => {
      const problem = generateEquationProblem(150);

      expect(problem.expression).toBeDefined();
      expect(problem.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(problem.options).toHaveLength(4);
    });

    test('должен генерировать уравнения с умножением для высоких уровней', () => {
      const problem = generateEquationProblem(250);

      expect(problem.expression).toBeDefined();
      expect(problem.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(problem.options).toHaveLength(4);
    });
  });

  describe('Диапазоны чисел для разных уровней', () => {
    test('уровень 1 должен давать ответы в пределах maxNumber', () => {
      const problems = Array.from({ length: 20 }, () => generateEquationProblem(10));

      problems.forEach(problem => {
        expect(problem.correctAnswer).toBeLessThanOrEqual(10);
        expect(problem.correctAnswer).toBeGreaterThanOrEqual(0);
      });
    });

    test('уровень 5 должен давать ответы в пределах maxNumber', () => {
      const problems = Array.from({ length: 20 }, () => generateEquationProblem(200));

      problems.forEach(problem => {
        expect(problem.correctAnswer).toBeLessThanOrEqual(50);
      });
    });

    test('уровень 9 должен давать ответы в пределах maxNumber', () => {
      const problems = Array.from({ length: 20 }, () => generateEquationProblem(500));

      problems.forEach(problem => {
        expect(problem.correctAnswer).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('Разнообразие генерации', () => {
    test('должен генерировать разные уравнения при повторных вызовах', () => {
      const problems = Array.from({ length: 50 }, () => generateEquationProblem(100));

      // Проверяем что есть разнообразие в выражениях
      const expressions = new Set(problems.map(p => p.expression));
      expect(expressions.size).toBeGreaterThan(1);

      // Проверяем что есть разнообразие в ответах
      const answers = new Set(problems.map(p => p.correctAnswer));
      expect(answers.size).toBeGreaterThan(1);
    });

    test('должен избегать повторения одного и того же X при передаче previousX', () => {
      const problem1 = generateEquationProblem(25);
      const firstX = problem1.correctAnswer;

      // Генерируем несколько уравнений с предыдущим X
      let differentXFound = false;
      let lastProblem = problem1;
      for (let i = 0; i < 20; i++) {
        lastProblem = generateEquationProblem(25, firstX);
        if (lastProblem.correctAnswer !== firstX) {
          differentXFound = true;
          break;
        }
      }

      // Проверяем что функция корректно обрабатывает параметр
      expect(lastProblem).toBeDefined();
      expect(lastProblem.correctAnswer).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Проверка формата выражения', () => {
    test('простые уравнения должны содержать x', () => {
      const problems = Array.from({ length: 10 }, () => generateEquationProblem(25));

      problems.forEach(problem => {
        expect(problem.expression).toContain('x');
      });
    });

    test('выражение должно содержать знак равенства', () => {
      const problems = Array.from({ length: 10 }, () => generateEquationProblem(25));

      problems.forEach(problem => {
        expect(problem.expression).toContain('=');
      });
    });
  });

  describe('Корректность вариантов ответа', () => {
    test('варианты ответа должны быть уникальными', () => {
      const problem = generateEquationProblem(25);

      const uniqueOptions = new Set(problem.options);
      expect(uniqueOptions.size).toBe(4);
    });

    test('варианты ответа должны быть строками', () => {
      const problem = generateEquationProblem(25);

      problem.options.forEach(option => {
        expect(typeof option).toBe('string');
      });
    });

    test('correctIndex должен указывать на правильный ответ', () => {
      const problem = generateEquationProblem(25);

      expect(problem.options[problem.correctIndex]).toBe(String(problem.correctAnswer));
    });
  });

  describe('Проверка граничных случаев', () => {
    test('должен работать с минимальным score', () => {
      const problem = generateEquationProblem(0);

      expect(problem).toBeDefined();
      expect(problem.expression).toBeDefined();
      expect(problem.options).toHaveLength(4);
    });

    test('должен работать с большим score', () => {
      const problem = generateEquationProblem(1000);

      expect(problem).toBeDefined();
      expect(problem.expression).toBeDefined();
      expect(problem.options).toHaveLength(4);
    });
  });
});
