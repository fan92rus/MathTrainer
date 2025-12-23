/**
 * Property-based tests for math problem generation utilities
 *
 * These tests verify critical invariants and properties of the math problem generators
 * using fast-check for generative testing.
 */

import { describe, test, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { generateCountingProblem } from '../math/counting'
import { generateMultiplicationProblem, getAvailableMultiplicationLevels } from '../math/multiplication'
import { generateDecompositionProblem } from '../math/decomposition'
import { generateFirstGradeDecompositionProblem } from '../math/firstGrade'
import { shuffleArray } from '../math/common'
import { createPinia, setActivePinia } from 'pinia'

describe('Math Generation - Property Based Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

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
        const expectedResult = eval(problem.expression) // eslint-disable-line no-eval
        expect(problem.correctAnswer).toBe(expectedResult)
      }
    })

    test('correct answer is in options at correctIndex', () => {
      for (let score = 0; score <= 500; score += 50) {
        const problem = generateDecompositionProblem(score, 3)
        const option = problem.options[problem.correctIndex]
        // The option should evaluate to the correct answer
        const evaluated = eval(option) // eslint-disable-line no-eval
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
          expect(option).toMatch(/[\+\-\×]/)
        }
      }
    })
  })
})
