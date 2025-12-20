import { generateMultiplicationProblem } from '../mathHelpers.js';

describe('Math Helpers - Multiplication Isolated Tests', () => {
  test('generateMultiplicationProblem', () => {
    const problem = generateMultiplicationProblem(5);

    expect(problem).toHaveProperty('expression');
    expect(problem).toHaveProperty('options');
    expect(problem).toHaveProperty('correctIndex');
    expect(Array.isArray(problem.options)).toBe(true);
    expect(problem.options.length).toBe(4);
    expect(problem.correctIndex).toBeGreaterThanOrEqual(0);
    expect(problem.correctIndex).toBeLessThan(4);
  });
});
