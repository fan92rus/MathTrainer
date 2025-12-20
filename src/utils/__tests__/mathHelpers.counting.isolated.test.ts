import { generateCountingProblem } from '../math';
import type { MathProblem } from '../math';

describe('Math Helpers  - Counting Isolated Tests', () => {
  test('generateCountingProblem', () => {
    const problem: MathProblem = generateCountingProblem(100, 1, 20);

    expect(problem).toHaveProperty('expression');
    expect(problem).toHaveProperty('options');
    expect(problem).toHaveProperty('correctIndex');
    expect(Array.isArray(problem.options)).toBe(true);
    expect(problem.options.length).toBe(4);
    expect(problem.correctIndex).toBeGreaterThanOrEqual(0);
    expect(problem.correctIndex).toBeLessThan(4);
  });
});
