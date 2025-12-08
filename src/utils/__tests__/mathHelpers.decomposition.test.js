import { 
  generateDecompositionProblem, 
  generateFirstGradeDecompositionProblem,
  shuffleArray 
} from '../mathHelpers.js'

// Мокаем Math.random для предсказуемых результатов
const mockMathRandom = (values) => {
  let index = 0
  Math.random = jest.fn(() => values[index++ % values.length])
}

describe('Math Helpers - Decomposition', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('generateDecompositionProblem', () => {
    test('первое число должно быть не меньше 10', () => {
      mockMathRandom([0.1, 0.1, 0.5]) // Генерируем минимальные значения
      
      for (let i = 0; i < 10; i++) {
        const problem = generateDecompositionProblem(50)
        const expression = problem.expression
        const match = expression.match(/(\d+)\s*[+\-]\s*(\d+)/)
        
        if (match) {
          const num1 = parseInt(match[1])
          const num2 = parseInt(match[2])
          const largerNum = Math.max(num1, num2)
          
          expect(largerNum).toBeGreaterThanOrEqual(10)
        }
      }
    })

    test('сложение с переходом через десяток должно раскладываться', () => {
      // Пример: 28 + 5 = 33 (переход с 2 десятков к 3)
      mockMathRandom([0.8, 0.8, 0.9]) // num1=28, num2=25, isAddition=true
      
      const problem = generateDecompositionProblem(50)
      const expression = problem.expression
      const correctOption = problem.options[problem.correctIndex]
      
      // Проверяем, что это сложение
      expect(expression).toContain('+')
      
      // Проверяем, что есть переход через десяток
      const match = expression.match(/(\d+)\s*\+\s*(\d+)/)
      if (match) {
        const num1 = parseInt(match[1])
        const num2 = parseInt(match[2])
        const sum = num1 + num2
        const tensBefore = Math.floor(num1 / 10)
        const tensAfter = Math.floor(sum / 10)
        
        if (tensAfter > tensBefore) {
          // Если есть переход через десяток, должен быть разложенный ответ
          expect(correctOption.split('+').length).toBeGreaterThan(2)
        }
      }
    })

    test('сложение без перехода через десяток не должно раскладываться', () => {
      // Пример: 30 + 5 = 35 (нет перехода через десяток)
      mockMathRandom([0.5, 0.1, 0.5]) // num1=30, num2=5, isAddition=true
      
      const problem = generateDecompositionProblem(50)
      const correctOption = problem.options[problem.correctIndex]
      
      // Если нет перехода через десяток, не должно быть разложения
      if (correctOption.includes('+')) {
        expect(correctOption.split('+').length).toBe(2)
      }
    })

    test('вычитание с переходом через десяток должно раскладываться', () => {
      // Пример: 61 - 3 = 58 (переход с 6 десятков к 5)
      mockMathRandom([0.5, 0.2, 0.2]) // num1=61, num2=3, isAddition=false
      
      const problem = generateDecompositionProblem(70)
      const expression = problem.expression
      const correctOption = problem.options[problem.correctIndex]
      
      // Проверяем, что это вычитание
      expect(expression).toContain('-')
      
      // Проверяем, что есть переход через десяток
      const match = expression.match(/(\d+)\s*\-\s*(\d+)/)
      if (match) {
        const num1 = parseInt(match[1])
        const num2 = parseInt(match[2])
        const difference = num1 - num2
        const tensBefore = Math.floor(num1 / 10)
        const tensAfter = Math.floor(difference / 10)
        
        if (tensAfter < tensBefore) {
          // Если есть переход через десяток, должен быть разложенный ответ
          // Но только если разложение не приведет к нулевым компонентам
          const lastDigit1 = num1 % 10
          if (lastDigit1 > 0 && num2 - lastDigit1 > 0) {
            expect(correctOption.split('-').length).toBeGreaterThan(2)
          }
        }
      }
    })

    test('вычитание без перехода через десяток не должно раскладываться', () => {
      // Пример: 69 - 5 = 64 (нет перехода через десяток)
      mockMathRandom([0.8, 0.1, 0.2]) // num1=69, num2=5, isAddition=false
      
      const problem = generateDecompositionProblem(70)
      const expression = problem.expression
      const correctOption = problem.options[problem.correctIndex]
      
      // Проверяем, что это вычитание без перехода через десяток
      const match = expression.match(/(\d+)\s*\-\s*(\d+)/)
      if (match) {
        const num1 = parseInt(match[1])
        const num2 = parseInt(match[2])
        const difference = num1 - num2
        const tensBefore = Math.floor(num1 / 10)
        const tensAfter = Math.floor(difference / 10)
        
        // Если нет перехода через десяток, не должно быть разложения
        if (tensAfter >= tensBefore) {
          if (correctOption.includes('-')) {
            expect(correctOption.split('-').length).toBe(2)
          }
        }
      }
    })

    test('двузначное число в сложении должно раскладываться на десятки и единицы', () => {
      // Пример: 22 + 11 = 33 (должно быть 22 + 10 + 1)
      mockMathRandom([0.2, 0.2, 0.5]) // num1=22, num2=11, isAddition=true
      
      const problem = generateDecompositionProblem(50)
      const correctOption = problem.options[problem.correctIndex]
      
      // Проверяем, что это сложение с двузначным вторым числом
      const match = problem.expression.match(/(\d+)\s*\+\s*(\d+)/)
      if (match && parseInt(match[2]) >= 10) {
        const num2 = parseInt(match[2])
        const tens = Math.floor(num2 / 10) * 10
        const remainder = num2 - tens
        
        // Двузначное число должно раскладываться на десятки и единицы
        if (remainder > 0) {
          expect(correctOption).toContain(`${tens}`)
          expect(correctOption).toContain(`${remainder}`)
        }
      }
    })

    test('двузначное число в вычитании должно раскладываться на десятки и единицы', () => {
      // Пример: 69 - 49 = 20 (должно быть 69 - 40 - 9)
      mockMathRandom([0.5, 0.8, 0.2]) // num1=69, num2=49, isAddition=false
      
      const problem = generateDecompositionProblem(70)
      const correctOption = problem.options[problem.correctIndex]
      
      // Проверяем, что это вычитание с двузначным вторым числом
      const match = problem.expression.match(/(\d+)\s*\-\s*(\d+)/)
      if (match && parseInt(match[2]) >= 10) {
        const num2 = parseInt(match[2])
        const tens = Math.floor(num2 / 10) * 10
        const remainder = num2 - tens
        
        // Двузначное число должно раскладываться на десятки и единицы
        if (remainder > 0) {
          expect(correctOption).toContain(`${tens}`)
          expect(correctOption).toContain(`${remainder}`)
        }
      }
    })
  })

  describe('Проверка отсутствия нулевых компонентов в разложении', () => {
    test('в разложении сложения не должно быть нулевых компонентов', () => {
      // Прогоняем несколько раз, чтобы проверить разные случаи
      for (let i = 0; i < 20; i++) {
        const problem = generateDecompositionProblem(50)
        const correctOption = problem.options[problem.correctIndex]
        
        // Проверяем, что это сложение
        if (problem.expression.includes('+')) {
          // Если есть разложение, проверяем отсутствие нулевых компонентов
          if (correctOption.split('+').length > 2) {
            const parts = correctOption.split('+').map(part => parseInt(part.trim()))
            
            // Все компоненты должны быть положительными числами
            parts.forEach(part => {
              expect(part).toBeGreaterThan(0)
            })
          }
        }
      }
    })

    test('в разложении вычитания не должно быть нулевых компонентов', () => {
      // Прогоняем несколько раз, чтобы проверить разные случаи
      for (let i = 0; i < 20; i++) {
        const problem = generateDecompositionProblem(50)
        const correctOption = problem.options[problem.correctIndex]
        
        // Проверяем, что это вычитание
        if (problem.expression.includes('-')) {
          // Если есть разложение, проверяем отсутствие нулевых компонентов
          if (correctOption.split('-').length > 2) {
            const parts = correctOption.split('-').map(part => parseInt(part.trim()))
            
            // Все компоненты должны быть положительными числами
            parts.forEach(part => {
              expect(part).toBeGreaterThan(0)
            })
          }
        }
      }
    })

    test('в неправильных вариантах разложения сложения не должно быть нулевых компонентов', () => {
      // Прогоняем несколько раз, чтобы проверить разные случаи
      for (let i = 0; i < 20; i++) {
        const problem = generateDecompositionProblem(50)
        
        // Проверяем, что это сложение
        if (problem.expression.includes('+')) {
          // Проверяем все варианты
          problem.options.forEach(option => {
            // Если вариант содержит разложение
            if (option.split('+').length > 2) {
              const parts = option.split('+').map(part => parseInt(part.trim()))
              
              // Все компоненты должны быть положительными числами
              parts.forEach(part => {
                expect(part).toBeGreaterThan(0)
              })
            }
          })
        }
      }
    })

    test('в неправильных вариантах разложения вычитания не должно быть нулевых компонентов', () => {
      // Прогоняем несколько раз, чтобы проверить разные случаи
      for (let i = 0; i < 20; i++) {
        const problem = generateDecompositionProblem(50)
        
        // Проверяем, что это вычитание
        if (problem.expression.includes('-')) {
          // Проверяем все варианты
          problem.options.forEach(option => {
            // Если вариант содержит разложение
            if (option.split('-').length > 2) {
              const parts = option.split('-').map(part => parseInt(part.trim()))
              
              // Все компоненты должны быть положительными числами
              parts.forEach(part => {
                expect(part).toBeGreaterThan(0)
              })
            }
          })
        }
      }
    })
  })

  describe('generateFirstGradeDecompositionProblem', () => {
    test('генерирует числа от 2 до 10', () => {
      for (let i = 0; i < 10; i++) {
        const problem = generateFirstGradeDecompositionProblem()
        expect(problem.targetNumber).toBeGreaterThanOrEqual(2)
        expect(problem.targetNumber).toBeLessThanOrEqual(10)
      }
    })

    test('правильное разложение дает в сумме целевое число', () => {
      for (let i = 0; i < 10; i++) {
        const problem = generateFirstGradeDecompositionProblem()
        const [part1, part2] = problem.correctDecomposition
        expect(part1 + part2).toBe(problem.targetNumber)
      }
    })

    test('варианты ответов содержат правильный ответ', () => {
      for (let i = 0; i < 10; i++) {
        const problem = generateFirstGradeDecompositionProblem()
        const correctAnswer = `${problem.correctDecomposition[0]} и ${problem.correctDecomposition[1]}`
        expect(problem.options).toContain(correctAnswer)
      }
    })
  })

  describe('shuffleArray', () => {
    test('перемешивает массив', () => {
      const originalArray = [1, 2, 3, 4, 5]
      const shuffledArray = shuffleArray(originalArray)
      
      // Массив должен быть того же размера
      expect(shuffledArray).toHaveLength(originalArray.length)
      
      // Массив должен содержать те же элементы
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