import { generateFirstGradeDecompositionProblem } from '../mathHelpers.js';

describe('Math Helpers - Isolated Tests', () => {
  test('generateFirstGradeDecompositionProblem', () => {
    const problem = generateFirstGradeDecompositionProblem();

    expect(problem).toHaveProperty('targetNumber');
    expect(problem).toHaveProperty('correctDecomposition');
    expect(problem.targetNumber).toBeGreaterThanOrEqual(2);
    expect(problem.targetNumber).toBeLessThanOrEqual(10);

    const [part1, part2] = problem.correctDecomposition;
    expect(part1 + part2).toBe(problem.targetNumber);
  });
});
