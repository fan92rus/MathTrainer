import { 
  generateDecompositionProblem
} from '../mathHelpers.js'

describe('Math Helpers - Decomposition Isolated Tests', () => {
  test('generateDecompositionProblem', () => {
    const problem = generateDecompositionProblem(50)
    
    expect(problem).toHaveProperty('expression')
    expect(problem).toHaveProperty('options')
    expect(problem).toHaveProperty('correctIndex')
    expect(Array.isArray(problem.options)).toBe(true)
    expect(problem.options.length).toBeGreaterThanOrEqual(3)
    expect(problem.correctIndex).toBeGreaterThanOrEqual(0)
    expect(problem.correctIndex).toBeLessThan(problem.options.length)
  })
})