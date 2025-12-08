import { 
  generateFirstGradeDecompositionProblem,
  generateCountingProblem,
  generateDecompositionProblem,
  generateMultiplicationProblem,
  generateWrongCountingAnswers,
  generateWrongSubtractionOptions,
  getAvailableMultiplicationLevels,
  shuffleArray 
} from '../mathHelpers.js'

// Мокаем Math.random для предсказуемых результатов
const mockMathRandom = (values) => {
  let index = 0
  Math.random = jest.fn(() => values[index++ % values.length])
}

describe('Math Helpers - Safe Tests', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('generateFirstGradeDecompositionProblem', () => {
    test('генерирует числа от 2 до 10', () => {
      const problem = generateFirstGradeDecompositionProblem()
      expect(problem.targetNumber).toBeGreaterThanOrEqual(2)
      expect(problem.targetNumber).toBeLessThanOrEqual(10)
    })

    test('правильное разложение дает в сумме целевое число', () => {
      const problem = generateFirstGradeDecompositionProblem()
      const [part1, part2] = problem.correctDecomposition
      expect(part1 + part2).toBe(problem.targetNumber)
    })
  })

  describe('generateCountingProblem', () => {
    test('генерирует правильную структуру ответа', () => {
      mockMathRandom([0.1, 0.1, 0.5]) // isAddition=true
      
      const problem = generateCountingProblem(100, 1, 20)
      
      expect(problem).toHaveProperty('expression')
      expect(problem).toHaveProperty('options')
      expect(problem).toHaveProperty('correctIndex')
      expect(Array.isArray(problem.options)).toBe(true)
      expect(problem.options.length).toBe(4)
      expect(problem.correctIndex).toBeGreaterThanOrEqual(0)
      expect(problem.correctIndex).toBeLessThan(4)
    })
  })

  describe('generateDecompositionProblem', () => {
    test('генерирует правильную структуру ответа', () => {
      mockMathRandom([0.5, 0.1, 0.5]) // num1=30, num2=5, isAddition=true
      
      const problem = generateDecompositionProblem(50)
      
      expect(problem).toHaveProperty('expression')
      expect(problem).toHaveProperty('options')
      expect(problem).toHaveProperty('correctIndex')
      expect(Array.isArray(problem.options)).toBe(true)
      // Минимум 2 варианта (правильный + хотя бы один неправильный)
      expect(problem.options.length).toBeGreaterThanOrEqual(2)
      expect(problem.correctIndex).toBeGreaterThanOrEqual(0)
      expect(problem.correctIndex).toBeLessThan(problem.options.length)
    })

    test('первое число должно быть не меньше 10', () => {
      mockMathRandom([0.1, 0.1, 0.5]) // Генерируем минимальные значения
      
      const problem = generateDecompositionProblem(50)
      const expression = problem.expression
      const match = expression.match(/(\d+)\s*[+\-]\s*(\d+)/)
      
      if (match) {
        const num1 = parseInt(match[1])
        const num2 = parseInt(match[2])
        const largerNum = Math.max(num1, num2)
        
        expect(largerNum).toBeGreaterThanOrEqual(10)
      }
    })
  })

  describe('generateMultiplicationProblem', () => {
    test('генерирует правильную структуру ответа', () => {
      mockMathRandom([0.5, 0.5]) // multiplier1=2, multiplier2=6
      
      const problem = generateMultiplicationProblem(5)
      
      expect(problem).toHaveProperty('expression')
      expect(problem).toHaveProperty('options')
      expect(problem).toHaveProperty('correctIndex')
      expect(Array.isArray(problem.options)).toBe(true)
      expect(problem.options.length).toBe(4)
      expect(problem.correctIndex).toBeGreaterThanOrEqual(0)
      expect(problem.correctIndex).toBeLessThan(4)
    })
  })

  describe('generateWrongCountingAnswers', () => {
    test('генерирует уникальные неправильные ответы', () => {
      const correctAnswer = 25
      const wrongAnswers = generateWrongCountingAnswers(correctAnswer, true)
      
      expect(wrongAnswers).toHaveLength(3)
      const uniqueAnswers = [...new Set(wrongAnswers)]
      expect(uniqueAnswers).toHaveLength(3)
      expect(wrongAnswers).not.toContain(correctAnswer)
    })
  })

  describe('generateWrongSubtractionOptions', () => {
    test('генерирует уникальные неправильные варианты', () => {
      const num1 = 69
      const num2 = 49
      const correctOption = `${num1} - 40 - 9`
      const wrongOptions = generateWrongSubtractionOptions(num1, num2, correctOption)
      
      expect(wrongOptions).toHaveLength(3)
      const uniqueOptions = [...new Set(wrongOptions)]
      expect(uniqueOptions).toHaveLength(3)
      expect(wrongOptions).not.toContain(correctOption)
    })
  })

  describe('getAvailableMultiplicationLevels', () => {
    test('возвращает правильную структуру уровней', () => {
      const levels = getAvailableMultiplicationLevels(100)
      
      expect(Array.isArray(levels)).toBe(true)
      expect(levels.length).toBeGreaterThan(0)
      
      levels.forEach(level => {
        expect(level).toHaveProperty('multiplier')
        expect(level).toHaveProperty('requiredScore')
        expect(level).toHaveProperty('available')
        expect(level).toHaveProperty('name')
        expect(level).toHaveProperty('pointsPerCorrect')
      })
    })
  })

  describe('shuffleArray', () => {
    test('перемешивает массив', () => {
      const originalArray = [1, 2, 3, 4, 5]
      const shuffledArray = shuffleArray(originalArray)
      
      expect(shuffledArray).toHaveLength(originalArray.length)
      expect(shuffledArray.sort()).toEqual(originalArray.sort())
    })

    test('не изменяет исходный массив', () => {
      const originalArray = [1, 2, 3, 4, 5]
      const originalCopy = [...originalArray]
      shuffleArray(originalArray)
      
      expect(originalArray).toEqual(originalCopy)
    })
  })
})