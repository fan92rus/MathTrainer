import { generateDecompositionProblem, generateFirstGradeDecompositionProblem } from '../math';
import type { FirstGradeDecompositionProblem } from '../math';

describe('Math Helpers  - Zero Values in Decomposition', () => {
  test('генерация разложения не должна содержать нули в выражениях', () => {
    // Генерируем 100 примеров и проверяем, что ни один не содержит нули
    for (let i = 0; i < 100; i++) {
      const problem = generateDecompositionProblem(100);
      const correctOption: string = problem.options[problem.correctIndex];

      // Проверяем, что в правильном ответе нет "+ 0" или " - 0"
      expect(correctOption).not.toContain('+ 0');
      expect(correctOption).not.toContain(' - 0');

      // Проверяем, что в неправильных ответах тоже нет "+ 0" или " - 0"
      for (const option of problem.options) {
        expect(option).not.toContain('+ 0');
        expect(option).not.toContain(' - 0');
      }
    }
  });

  test('генерация разложения для 1 класса не должна содержать нули', () => {
    // Генерируем 50 примеров для 1 класса и проверяем, что ни один не содержит нули
    for (let i = 0; i < 50; i++) {
      const problem: FirstGradeDecompositionProblem = generateFirstGradeDecompositionProblem();

      // Проверяем, что ни в одном из вариантов нет "и 0"
      for (const option of problem.options) {
        expect(option).not.toContain('и 0');
      }
    }
  });

  test('проверка конкретных случаев, которые могли генерировать нули', () => {
    // Мокаем Math.random для генерации конкретных случаев
    const originalRandom: () => number = Math.random;

    // Случай 1: 20  - 2 (не должно быть 20  - 0  - 2  - 0)
    Math.random = () => 0.1; // Генерируем num1=20, num2=2
    const problem1 = generateDecompositionProblem(30);
    const correctOption1: string = problem1.options[problem1.correctIndex];
    expect(correctOption1).not.toContain(' - 0');

    // Восстанавливаем оригинальную функцию
    Math.random = originalRandom;
  });
});
