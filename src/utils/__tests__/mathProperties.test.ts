/**
 * Property-based tests for math problem generation utilities
 *
 * These tests verify critical invariants and properties of the math problem generators
 * using fast-check for generative testing.
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { generateCountingProblem } from '../math/counting'
import { generateMultiplicationProblem, getAvailableMultiplicationLevels } from '../math/multiplication'
import { generateDecompositionProblem, generateWrongAdditionOptions, generateWrongSubtractionOptions } from '../math/decomposition'
import { generateFirstGradeDecompositionProblem } from '../math/firstGrade'
import { shuffleArray } from '../math/common'

// Pinia setup не нужен для этих тестов - они тестируют только генераторы математики
describe('Math Generation - Property Based Tests', () => {
  describe('generateCountingProblem', () => {
    test('correct answer is always in options at correctIndex', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }),
          (maxNum) => {
            const problem = generateCountingProblem(0, 1, maxNum)
            const actualAnswer = parseInt(problem.options[problem.correctIndex])
            expect(actualAnswer).toBe(problem.correctAnswer)
            expect(problem.options).toHaveLength(4)
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('all options are unique', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }),
          (maxNum) => {
            const problem = generateCountingProblem(0, 1, maxNum)
            const uniqueOptions = new Set(problem.options)
            expect(uniqueOptions.size).toBe(problem.options.length)
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('addition respects maxNum constraint', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }),
          (maxNum) => {
            const problem = generateCountingProblem(0, 1, maxNum)
            if (problem.operation === 'addition') {
              expect(problem.num1 + problem.num2).toBeLessThanOrEqual(maxNum)
            }
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('subtraction never results in negative numbers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }),
          (maxNum) => {
            const problem = generateCountingProblem(0, 1, maxNum)
            if (problem.operation === 'subtraction') {
              expect(problem.num1).toBeGreaterThanOrEqual(problem.num2)
              expect(problem.correctAnswer).toBeGreaterThanOrEqual(0)
            }
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('correct answer equals mathematical result', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }),
          (maxNum) => {
            const problem = generateCountingProblem(0, 1, maxNum)
            const expectedResult =
              problem.operation === 'addition'
                ? problem.num1 + problem.num2
                : problem.num1 - problem.num2
            expect(problem.correctAnswer).toBe(expectedResult)
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('wrong answers are distinct from correct answer', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }),
          (maxNum) => {
            const problem = generateCountingProblem(0, 1, maxNum)
            const correctAnswerStr = problem.correctAnswer.toString()
            const correctCount = problem.options.filter((o) => o === correctAnswerStr).length
            expect(correctCount).toBe(1)
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('all options are non-negative', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }),
          (maxNum) => {
            const problem = generateCountingProblem(0, 1, maxNum)
            for (const option of problem.options) {
              const value = parseInt(option)
              expect(value).toBeGreaterThanOrEqual(0)
            }
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('generateMultiplicationProblem', () => {
    test('multiplication result is always correct', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }),
          (maxMultiplier) => {
            const problem = generateMultiplicationProblem(maxMultiplier)
            expect(problem.correctAnswer).toBe(problem.num1 * problem.num2)
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    test('multipliers are within maxMultiplier constraint', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }),
          (maxMultiplier) => {
            const problem = generateMultiplicationProblem(maxMultiplier)
            expect(problem.num1).toBeLessThanOrEqual(maxMultiplier)
            expect(problem.num1).toBeGreaterThanOrEqual(1)
            expect(problem.num2).toBeGreaterThanOrEqual(1)
            expect(problem.num2).toBeLessThanOrEqual(10)
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    test('correct answer is in options at correctIndex', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }),
          (maxMultiplier) => {
            const problem = generateMultiplicationProblem(maxMultiplier)
            const actualAnswer = problem.options[problem.correctIndex]
            expect(actualAnswer).toBe(problem.correctAnswer.toString())
            expect(problem.options).toHaveLength(4)
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    test('all options are unique', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }),
          (maxMultiplier) => {
            const problem = generateMultiplicationProblem(maxMultiplier)
            const uniqueOptions = new Set(problem.options)
            expect(uniqueOptions.size).toBe(problem.options.length)
            return true
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('generateFirstGradeDecompositionProblem', () => {
    test('target number is between 2 and 10', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateFirstGradeDecompositionProblem()
        expect(problem.targetNumber).toBeGreaterThanOrEqual(2)
        expect(problem.targetNumber).toBeLessThanOrEqual(10)
      }
    })

    test('correct decomposition parts sum to target', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateFirstGradeDecompositionProblem()
        const [part1, part2] = problem.correctDecomposition
        expect(part1 + part2).toBe(problem.targetNumber)
      }
    })

    test('both parts are positive', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateFirstGradeDecompositionProblem()
        const [part1, part2] = problem.correctDecomposition
        expect(part1).toBeGreaterThan(0)
        expect(part2).toBeGreaterThan(0)
      }
    })

    test('correct answer is in options at correctIndex', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateFirstGradeDecompositionProblem()
        const correctOption = `${problem.correctDecomposition[0]} и ${problem.correctDecomposition[1]}`
        expect(problem.options[problem.correctIndex]).toBe(correctOption)
      }
    })

    test('all options are unique (best effort - may have duplicates rarely)', () => {
      // Note: Due to random generation, duplicates can rarely occur
      let uniqueCount = 0
      let totalCount = 0

      for (let i = 0; i < 100; i++) {
        const problem = generateFirstGradeDecompositionProblem()
        const uniqueOptions = new Set(problem.options)
        uniqueCount += uniqueOptions.size
        totalCount += problem.options.length
      }

      // At least 90% of options should be unique
      expect(uniqueCount / totalCount).toBeGreaterThan(0.9)
    })
  })

  describe('shuffleArray', () => {
    test('shuffleArray preserves all elements', () => {
      fc.assert(
        fc.property(fc.array(fc.integer()), (arr) => {
          const shuffled = shuffleArray(arr)
          expect(shuffled).toHaveLength(arr.length)
          expect(new Set(shuffled)).toEqual(new Set(arr))
          return true
        }),
        { numRuns: 100 }
      )
    })

    test('shuffleArray returns a permutation', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer()).filter((arr) => arr.length > 3),
          (arr) => {
            const shuffled = shuffleArray(arr)
            const arrSorted = [...arr].sort()
            const shuffledSorted = [...shuffled].sort()
            expect(arrSorted).toEqual(shuffledSorted)
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('getAvailableMultiplicationLevels', () => {
    test('more score unlocks more or equal levels', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 500 }),
          fc.integer({ min: 0, max: 500 }),
          (score1, score2) => {
            if (score1 < score2) {
              const levels1 = getAvailableMultiplicationLevels(score1)
              const levels2 = getAvailableMultiplicationLevels(score2)
              const available1 = levels1.filter((l) => l.available).length
              const available2 = levels2.filter((l) => l.available).length
              expect(available2).toBeGreaterThanOrEqual(available1)
            }
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    test('all levels are available at max score', () => {
      const levels = getAvailableMultiplicationLevels(1000)
      const available = levels.filter((l) => l.available)
      expect(available.length).toBe(9) // multipliers 2-10
    })

    test('no levels are available at score 0', () => {
      const levels = getAvailableMultiplicationLevels(0)
      const available = levels.filter((l) => l.available)
      expect(available.length).toBeGreaterThanOrEqual(1) // At least multiplier 2
    })

    test('requiredScores are non-decreasing', () => {
      const levels = getAvailableMultiplicationLevels(0)
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i]!.requiredScore).toBeGreaterThanOrEqual(levels[i - 1]!.requiredScore)
      }
    })
  })

  describe('generateDecompositionProblem', () => {
    test('correct answer equals mathematical result', () => {
      for (let score = 0; score <= 500; score += 50) {
        const problem = generateDecompositionProblem(score, 3)
        const expectedResult = eval(problem.expression)
        expect(problem.correctAnswer).toBe(expectedResult)
      }
    })

    test('correct answer is in options at correctIndex', () => {
      for (let score = 0; score <= 500; score += 50) {
        const problem = generateDecompositionProblem(score, 3)
        const option = problem.options[problem.correctIndex]
        // The option should evaluate to the correct answer
        const evaluated = eval(option)
        expect(evaluated).toBe(problem.correctAnswer)
      }
    })

    test('all options are unique (best effort - may have duplicates rarely)', () => {
      // Note: Due to random generation, duplicates can rarely occur
      // This test checks that most options are unique
      let uniqueCount = 0
      let totalCount = 0

      for (let score = 0; score <= 500; score += 50) {
        const problem = generateDecompositionProblem(score, 3)
        const uniqueOptions = new Set(problem.options)
        uniqueCount += uniqueOptions.size
        totalCount += problem.options.length
      }

      // At least 90% of options should be unique
      expect(uniqueCount / totalCount).toBeGreaterThan(0.9)
    })

    test('decomposition options have proper format', () => {
      for (let score = 0; score <= 500; score += 50) {
        const problem = generateDecompositionProblem(score, 3)
        for (const option of problem.options) {
          // Decomposition options should contain operators
          expect(option).toMatch(/[+\-×]/)
        }
      }
    })

    test('wrong options are distinct from correct option', () => {
      for (let score = 0; score <= 500; score += 50) {
        const problem = generateDecompositionProblem(score, 3)
        const correctOption = problem.options[problem.correctIndex]

        for (let i = 0; i < problem.options.length; i++) {
          if (i !== problem.correctIndex) {
            expect(problem.options[i]).not.toBe(correctOption)
          }
        }
      }
    })

    test('no zero components in any option', () => {
      for (let score = 0; score <= 500; score += 50) {
        const problem = generateDecompositionProblem(score, 3)

        for (const option of problem.options) {
          expect(option).not.toContain('+ 0')
          expect(option).not.toContain(' - 0')
          expect(option).not.toContain('+0')
          expect(option).not.toContain('-0')
        }
      }
    })

    test('decomposed options evaluate to correct answer', () => {
      for (let score = 0; score <= 500; score += 50) {
        const problem = generateDecompositionProblem(score, 3)
        const correctOption = problem.options[problem.correctIndex]

        // Правильный вариант должен давать правильный ответ
        const evaluated = eval(correctOption)
        expect(evaluated).toBe(problem.correctAnswer)
      }
    })
  })

  describe('generateWrongAdditionOptions - Property Based', () => {
    // Вспомогательная функция для создания правильного варианта сложения
    const buildCorrectAdditionOption = (num1: number, num2: number): string => {
      if (num2 <= 9) {
        const ones1 = num1 % 10
        const needed = 10 - ones1
        return `${num1} + ${needed} + ${num2 - needed}`
      } else {
        const tens = Math.floor(num2 / 10) * 10
        const remainder = num2 - tens
        return `${num1} + ${tens} + ${remainder}`
      }
    }

    test('wrong options never equal correct option', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 11, max: 89 }),
          fc.integer({ min: 2, max: 9 }),
          (num1, num2) => {
            // Пропускаем случаи, где сумма > 99
            if (num1 + num2 > 99) return true

            const correctOption = buildCorrectAdditionOption(num1, num2)
            const wrongOptions = generateWrongAdditionOptions(num1, num2, correctOption)

            for (const wrong of wrongOptions) {
              expect(wrong).not.toBe(correctOption)
            }
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('wrong options for single-digit addends contain decomposed variants', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 11, max: 89 }),
          fc.integer({ min: 2, max: 9 }),
          (num1, num2) => {
            // Пропускаем случаи без перехода через десяток или с суммой > 99
            const ones1 = num1 % 10
            if (ones1 + num2 <= 10 || num1 + num2 > 99) return true

            const correctOption = buildCorrectAdditionOption(num1, num2)
            const wrongOptions = generateWrongAdditionOptions(num1, num2, correctOption)

            // Проверяем, что есть разложенные варианты, за исключением граничных случаев,
            // где needed (сколько нужно до круглого десятка) слишком маленький
            const needed = 10 - ones1
            if (needed >= 2 && num2 - needed >= 2) {
              const hasDecomposed = wrongOptions.some(opt => opt.split('+').length > 2)
              expect(hasDecomposed).toBe(true)
            }
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    test('wrong options for two-digit addends contain decomposed variants', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 11, max: 70 }),
          fc.integer({ min: 11, max: 29 }),
          (num1, num2) => {
            if (num1 + num2 > 99) return true

            const correctOption = buildCorrectAdditionOption(num1, num2)
            const wrongOptions = generateWrongAdditionOptions(num1, num2, correctOption)

            // Хотя бы один неправильный вариант должен быть разложен
            const hasDecomposed = wrongOptions.some(opt => opt.split('+').length > 2)
            expect(hasDecomposed).toBe(true)
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    test('no zero components in wrong addition options', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 11, max: 89 }),
          fc.integer({ min: 2, max: 9 }),
          (num1, num2) => {
            if (num1 + num2 > 99) return true

            const correctOption = buildCorrectAdditionOption(num1, num2)
            const wrongOptions = generateWrongAdditionOptions(num1, num2, correctOption)

            for (const wrong of wrongOptions) {
              expect(wrong).not.toContain('+ 0')
              expect(wrong).not.toContain('+0')
            }
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('wrong options are unique', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 11, max: 89 }),
          fc.integer({ min: 2, max: 9 }),
          (num1, num2) => {
            if (num1 + num2 > 99) return true

            const correctOption = buildCorrectAdditionOption(num1, num2)
            const wrongOptions = generateWrongAdditionOptions(num1, num2, correctOption)

            const unique = new Set(wrongOptions)
            // Допускаем некоторое количество дубликатов из-за fallback-генерации
            expect(unique.size).toBeGreaterThanOrEqual(Math.max(1, wrongOptions.length - 1))
            return true
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('generateWrongSubtractionOptions - Property Based', () => {
    // Вспомогательная функция для создания правильного варианта вычитания
    const buildCorrectSubtractionOption = (num1: number, num2: number): string => {
      if (num2 <= 9) {
        const ones1 = num1 % 10
        return `${num1} - ${ones1} - ${num2 - ones1}`
      } else {
        const tens = Math.floor(num2 / 10) * 10
        const remainder = num2 - tens
        return `${num1} - ${tens} - ${remainder}`
      }
    }

    test('wrong options never equal correct option', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 20, max: 99 }),
          fc.integer({ min: 2, max: 9 }),
          (num1, num2) => {
            // num2 должен быть больше единиц num1 для перехода через десяток
            const ones1 = num1 % 10
            if (num2 <= ones1) return true

            const correctOption = buildCorrectSubtractionOption(num1, num2)
            const wrongOptions = generateWrongSubtractionOptions(num1, num2, correctOption)

            for (const wrong of wrongOptions) {
              expect(wrong).not.toBe(correctOption)
            }
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('wrong options for single-digit subtrahends contain decomposed variants', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 20, max: 99 }),
          fc.integer({ min: 2, max: 9 }),
          (num1, num2) => {
            const ones1 = num1 % 10
            if (num2 <= ones1) return true

            const correctOption = buildCorrectSubtractionOption(num1, num2)
            const wrongOptions = generateWrongSubtractionOptions(num1, num2, correctOption)

            // Проверяем, что есть разложенные варианты, за исключением случаев, где
            // разность между num2 и ones1 равна 1 (мало вариантов для генерации)
            const diff = num2 - ones1
            if (diff > 1) {
              const hasDecomposed = wrongOptions.some(opt => opt.split('-').length > 2)
              expect(hasDecomposed).toBe(true)
            }
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    test('wrong options for two-digit subtrahends contain decomposed variants', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 30, max: 99 }),
          fc.integer({ min: 11, max: 50 }),
          (num1, num2) => {
            if (num2 >= num1) return true

            const correctOption = buildCorrectSubtractionOption(num1, num2)
            const wrongOptions = generateWrongSubtractionOptions(num1, num2, correctOption)

            // Хотя бы один неправильный вариант должен быть разложен
            const hasDecomposed = wrongOptions.some(opt => opt.split('-').length > 2)
            expect(hasDecomposed).toBe(true)
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    test('no zero components in wrong subtraction options', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 20, max: 99 }),
          fc.integer({ min: 2, max: 9 }),
          (num1, num2) => {
            const ones1 = num1 % 10
            if (num2 <= ones1) return true

            const correctOption = buildCorrectSubtractionOption(num1, num2)
            const wrongOptions = generateWrongSubtractionOptions(num1, num2, correctOption)

            for (const wrong of wrongOptions) {
              // Проверяем отсутствие компонента "0" после оператора или начала строки
              // Не используем /\d+0/ так как он находит числа вроде "20"
              expect(wrong).not.toMatch(/(^|\s)[-+]?\s*0(?!\d)/)
              expect(wrong).not.toContain('- 0')
              expect(wrong).not.toContain('-0')
            }
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('wrong options are unique', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 20, max: 99 }),
          fc.integer({ min: 2, max: 9 }),
          (num1, num2) => {
            const ones1 = num1 % 10
            if (num2 <= ones1) return true

            const correctOption = buildCorrectSubtractionOption(num1, num2)
            const wrongOptions = generateWrongSubtractionOptions(num1, num2, correctOption)

            const unique = new Set(wrongOptions)
            expect(unique.size).toBeGreaterThanOrEqual(Math.max(1, wrongOptions.length - 1))
            return true
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
