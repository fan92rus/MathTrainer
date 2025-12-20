import { generateFirstGradeDecompositionProblem } from '../math';
import type { FirstGradeDecompositionProblem } from '../math';

describe('Math Helpers  - Isolated Tests', () => {
  test('generateFirstGradeDecompositionProblem', () => {
    const problem: FirstGradeDecompositionProblem = generateFirstGradeDecompositionProblem();

    expect(problem).toHaveProperty('targetNumber');
    expect(problem).toHaveProperty('correctDecomposition');
    expect(problem.targetNumber).toBeGreaterThanOrEqual(2);
    expect(problem.targetNumber).toBeLessThanOrEqual(10);

    const [part1, part2] = problem.correctDecomposition;
    expect(part1 + part2).toBe(problem.targetNumber);
  });
});
