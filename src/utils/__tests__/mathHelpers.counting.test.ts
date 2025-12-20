import { generateCountingProblem, generateWrongCountingAnswers } from '../math';
import type { MathProblem } from '../math';

// Мокаем Math.random для предсказуемых результатов
const mockMathRandom = (values: number[]): void => {
  let index = 0;
  Math.random = jest.fn(() => values[index++ % values.length]);
};

describe('Math Helpers - Counting', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateCountingProblem', () => {
    test('генерирует числа в заданных пределах', () => {
      mockMathRandom([0.1, 0.1, 0.5]); // isAddition=true

      const problem: MathProblem = generateCountingProblem(100, 1, 20);
      const match = problem.expression.match(/(\d+)\s*([+-])\s*(\d+)/);

      if (match) {
        const num1 = parseInt(match[1]);
        const num2 = parseInt(match[3]);
        const operation = match[2];

        // Проверяем, что числа в допустимых пределах
        expect(num1).toBeGreaterThanOrEqual(1);
        expect(num1).toBeLessThanOrEqual(20);
        expect(num2).toBeGreaterThanOrEqual(1);
        expect(num2).toBeLessThanOrEqual(20);

        if (operation === '+') {
          // Для сложения сумма не должна превышать максимум
          expect(num1 + num2).toBeLessThanOrEqual(20);
        } else {
          // Для вычитания первое число не должно превышать максимум
          expect(num1).toBeLessThanOrEqual(20);
        }
      }
    });

    test('генерирует правильный ответ', () => {
      mockMathRandom([0.1, 0.1, 0.5]); // isAddition=true

      const problem: MathProblem = generateCountingProblem(100, 1, 20);
      const match = problem.expression.match(/(\d+)\s*([+-])\s*(\d+)/);

      if (match) {
        const num1 = parseInt(match[1]);
        const num2 = parseInt(match[3]);
        const operation = match[2];

        let expectedAnswer: number;
        if (operation === '+') {
          expectedAnswer = num1 + num2;
        } else {
          expectedAnswer = num1 - num2;
        }

        // Проверяем, что правильный ответ присутствует в вариантах
        expect(problem.options).toContain(expectedAnswer.toString());
        expect(problem.correctIndex).toBeGreaterThanOrEqual(0);
        expect(problem.correctIndex).toBeLessThan(problem.options.length);
      }
    });
  });

  describe('generateWrongCountingAnswers', () => {
    test('генерирует уникальные неправильные ответы', () => {
      const correctAnswer = 25;
      const wrongAnswers = generateWrongCountingAnswers(correctAnswer, true);

      // Проверяем, что сгенерировано 3 ответа
      expect(wrongAnswers).toHaveLength(3);

      // Проверяем, что все ответы уникальны
      const uniqueAnswers = [...new Set(wrongAnswers)];
      expect(uniqueAnswers).toHaveLength(3);

      // Проверяем, что правильный ответ отсутствует
      expect(wrongAnswers).not.toContain(correctAnswer);
    });

    test('генерирует положительные ответы', () => {
      const correctAnswer = 50;
      const wrongAnswers = generateWrongCountingAnswers(correctAnswer, false);

      // Все ответы должны быть положительными
      wrongAnswers.forEach((answer) => {
        expect(answer).toBeGreaterThanOrEqual(0);
      });
    });
  });
});