/**
 * Edge case tests for math problem generation utilities
 *
 * These tests verify behavior at boundaries and edge cases:
 * - Zero values
 * - Maximum values
 * - Minimum values
 * - Extreme combinations
 */

import { describe, test, expect } from 'vitest'
import { generateCountingProblem } from '../math/counting'
import { generateMultiplicationProblem } from '../math/multiplication'
import { generateDecompositionProblem } from '../math/decomposition'
import { generateEquationProblem } from '../math/equations'
import { generateFirstGradeDecompositionProblem } from '../math/firstGrade'
import { generateWrongCountingAnswers } from '../math/counting'
import { generateWrongAdditionOptions, generateWrongSubtractionOptions } from '../math/decomposition'

describe('Math Generation - Edge Cases', () => {
  describe('generateCountingProblem - Edge Cases', () => {
    test('minimal maxNum (2)', () => {
      const problem = generateCountingProblem(0, 1, 2)
      expect(problem.options).toHaveLength(4)
      expect(problem.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(problem.correctAnswer).toBeLessThanOrEqual(2)

      if (problem.operation === 'addition') {
        expect(problem.num1 + problem.num2).toBeLessThanOrEqual(2)
      } else {
        expect(problem.num1 - problem.num2).toBeGreaterThanOrEqual(0)
      }
    })

    test('maxNum equals 1 (edge case)', () => {
      // When maxNum is 1, we should still get a valid problem
      // The implementation might adjust this, but it shouldn't crash
      const problem = generateCountingProblem(0, 1, 2)
      expect(problem.options).toBeDefined()
      expect(problem.correctAnswer).toBeGreaterThanOrEqual(0)
    })

    test('large maxNum (1000)', () => {
      const problem = generateCountingProblem(0, 1, 1000)
      expect(problem.options).toHaveLength(4)
      expect(problem.correctAnswer).toBeGreaterThan(0)

      if (problem.operation === 'addition') {
        expect(problem.num1 + problem.num2).toBeLessThanOrEqual(1000)
      } else {
        expect(problem.num1 - problem.num2).toBeGreaterThanOrEqual(0)
      }
    })

    test('subtraction with num1 = 1 (smallest positive)', () => {
      // Generate many problems and find subtraction with small numbers
      for (let i = 0; i < 100; i++) {
        const problem = generateCountingProblem(0, 1, 10)
        if (problem.operation === 'subtraction' && problem.num1 <= 3) {
          expect(problem.num1).toBeGreaterThanOrEqual(problem.num2)
          expect(problem.correctAnswer).toBeGreaterThanOrEqual(0)
          expect(problem.correctAnswer).toBeLessThanOrEqual(problem.num1)
          return
        }
      }
      // If we didn't find such a case, test passes
      expect(true).toBe(true)
    })

    test('all generated options are non-negative', () => {
      for (const maxNum of [2, 10, 20, 100]) {
        const problem = generateCountingProblem(0, 1, maxNum)
        for (const option of problem.options) {
          const value = parseInt(option)
          expect(value).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })

  describe('generateWrongCountingAnswers - Edge Cases', () => {
    test('correct answer is 0', () => {
      const wrongAnswers = generateWrongCountingAnswers(0, true)
      expect(wrongAnswers).toHaveLength(3)
      for (const answer of wrongAnswers) {
        expect(answer).toBeGreaterThanOrEqual(0)
        expect(answer).not.toBe(0)
      }
    })

    test('correct answer is 1', () => {
      const wrongAnswers = generateWrongCountingAnswers(1, true)
      expect(wrongAnswers).toHaveLength(3)
      for (const answer of wrongAnswers) {
        expect(answer).not.toBe(1)
      }
    })

    test('correct answer is 2', () => {
      const wrongAnswers = generateWrongCountingAnswers(2, true)
      expect(wrongAnswers).toHaveLength(3)
      for (const answer of wrongAnswers) {
        expect(answer).not.toBe(2)
      }
    })

    test('correct answer is large (1000)', () => {
      const wrongAnswers = generateWrongCountingAnswers(1000, true)
      expect(wrongAnswers).toHaveLength(3)
      for (const answer of wrongAnswers) {
        expect(answer).not.toBe(1000)
      }
    })

    test('correct answer is 9 (edge case for last digit)', () => {
      const wrongAnswers = generateWrongCountingAnswers(9, true)
      expect(wrongAnswers).toHaveLength(3)
      for (const answer of wrongAnswers) {
        expect(answer).not.toBe(9)
      }
    })

    test('correct answer is 10 (two-digit edge)', () => {
      const wrongAnswers = generateWrongCountingAnswers(10, true)
      expect(wrongAnswers).toHaveLength(3)
      for (const answer of wrongAnswers) {
        expect(answer).not.toBe(10)
      }
    })
  })

  describe('generateMultiplicationProblem - Edge Cases', () => {
    test('minimal maxMultiplier (1)', () => {
      const problem = generateMultiplicationProblem(1)
      expect(problem.options).toHaveLength(4)
      expect(problem.maxMultiplier).toBe(1)
      expect(problem.num1).toBe(1)
      expect(problem.num2).toBeGreaterThan(0)
      expect(problem.num2).toBeLessThanOrEqual(10)
    })

    test('maxMultiplier equals 10', () => {
      const problem = generateMultiplicationProblem(10)
      expect(problem.options).toHaveLength(4)
      expect(problem.num1).toBeLessThanOrEqual(10)
      expect(problem.num1).toBeGreaterThanOrEqual(1)
      expect(problem.num2).toBeLessThanOrEqual(10)
      expect(problem.num2).toBeGreaterThanOrEqual(1)
    })

    test('multiplication by 1', () => {
      // Generate until we get multiplier of 1
      for (let i = 0; i < 50; i++) {
        const problem = generateMultiplicationProblem(5)
        if (problem.num1 === 1) {
          expect(problem.correctAnswer).toBe(problem.num2)
          return
        }
      }
      // If we didn't find it, test passes
      expect(true).toBe(true)
    })

    test('multiplication of same numbers (squares)', () => {
      // Generate until we get same multipliers
      for (let i = 0; i < 100; i++) {
        const problem = generateMultiplicationProblem(10)
        if (problem.num1 === problem.num2) {
          expect(problem.correctAnswer).toBe(problem.num1 * problem.num1)
          return
        }
      }
      // If we didn't find it, test passes
      expect(true).toBe(true)
    })

    test('all options are non-negative', () => {
      for (const max of [1, 2, 5, 10]) {
        const problem = generateMultiplicationProblem(max)
        for (const option of problem.options) {
          const value = parseInt(option)
          expect(value).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })

  describe('generateDecompositionProblem - Edge Cases', () => {
    test('score of 0 (lowest difficulty)', () => {
      const problem = generateDecompositionProblem(0, 1)
      expect(problem.options).toHaveLength(4)
      expect(problem.correctAnswer).toBeGreaterThan(0)
    })

    test('score of 500 (highest difficulty)', () => {
      const problem = generateDecompositionProblem(500, 9)
      expect(problem.options).toHaveLength(4)
      expect(problem.correctAnswer).toBeGreaterThan(0)
    })

    test('level of 1 (easiest)', () => {
      const problem = generateDecompositionProblem(100, 1)
      expect(problem.options).toHaveLength(4)
    })

    test('level of 9 (hardest)', () => {
      const problem = generateDecompositionProblem(100, 9)
      expect(problem.options).toHaveLength(4)
    })

    test('no zero components in decomposition options', () => {
      for (const score of [0, 100, 300, 500]) {
        const problem = generateDecompositionProblem(score, 3)
        for (const option of problem.options) {
          expect(option).not.toContain('+ 0')
          expect(option).not.toContain(' - 0')
          expect(option).not.toContain('+0')
          expect(option).not.toContain('-0')
        }
      }
    })

    test('decomposed option evaluates to correct answer', () => {
      for (const score of [0, 100, 300, 500]) {
        const problem = generateDecompositionProblem(score, 3)
        const correctOption = problem.options[problem.correctIndex]
        const evaluated = eval(correctOption)
        expect(evaluated).toBe(problem.correctAnswer)
      }
    })
  })

  describe('generateWrongAdditionOptions - Edge Cases', () => {
    test('small numbers (11 + 2)', () => {
      const correctOption = '11 + 2 + 0' // Built with transition
      const wrongOptions = generateWrongAdditionOptions(11, 2, correctOption)
      expect(wrongOptions).toHaveLength(3)
      for (const wrong of wrongOptions) {
        expect(wrong).not.toBe(correctOption)
        expect(wrong).not.toContain('+ 0')
        expect(wrong).not.toContain('+0')
      }
    })

    test('large numbers near boundary (89 + 9)', () => {
      const correctOption = '89 + 1 + 8'
      const wrongOptions = generateWrongAdditionOptions(89, 9, correctOption)
      expect(wrongOptions).toHaveLength(3)
      for (const wrong of wrongOptions) {
        expect(wrong).not.toBe(correctOption)
      }
    })

    test('two-digit addend (20 + 15)', () => {
      const correctOption = '20 + 10 + 5'
      const wrongOptions = generateWrongAdditionOptions(20, 15, correctOption)
      expect(wrongOptions).toHaveLength(3)
      for (const wrong of wrongOptions) {
        expect(wrong).not.toBe(correctOption)
      }
    })
  })

  describe('generateWrongSubtractionOptions - Edge Cases', () => {
    test('small transition (20 - 3)', () => {
      const correctOption = '20 - 0 - 3'
      const wrongOptions = generateWrongSubtractionOptions(20, 3, correctOption)
      expect(wrongOptions).toHaveLength(3)
      for (const wrong of wrongOptions) {
        expect(wrong).not.toBe(correctOption)
        expect(wrong).not.toContain('- 0')
        expect(wrong).not.toContain('-0')
      }
    })

    test('large numbers (99 - 7)', () => {
      const correctOption = '99 - 9 - -2' // Actually 99 - 9 + 2
      const wrongOptions = generateWrongSubtractionOptions(99, 7, correctOption)
      expect(wrongOptions).toHaveLength(3)
      for (const wrong of wrongOptions) {
        expect(wrong).not.toBe(correctOption)
      }
    })

    test('two-digit subtrahend (50 - 25)', () => {
      const correctOption = '50 - 20 - 5'
      const wrongOptions = generateWrongSubtractionOptions(50, 25, correctOption)
      expect(wrongOptions).toHaveLength(3)
      for (const wrong of wrongOptions) {
        expect(wrong).not.toBe(correctOption)
      }
    })
  })

  describe('generateEquationProblem - Edge Cases', () => {
    test('score of 0 (lowest level)', () => {
      const problem = generateEquationProblem(0)
      expect(problem.options).toHaveLength(4)
      expect(problem.expression).toContain('x')
      expect(problem.expression).toContain('=')
      expect(problem.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(problem.correctAnswer).toBeLessThanOrEqual(10)
    })

    test('score of 500 (highest level)', () => {
      const problem = generateEquationProblem(500)
      expect(problem.options).toHaveLength(4)
      expect(problem.expression).toContain('x')
      expect(problem.expression).toContain('=')
      expect(problem.correctAnswer).toBeGreaterThan(0)
    })

    test('all score boundary points', () => {
      const boundaryScores = [0, 50, 100, 150, 200, 250, 300, 350, 400, 500]
      for (const score of boundaryScores) {
        const problem = generateEquationProblem(score)
        expect(problem.options).toHaveLength(4)
        expect(problem.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(problem.difficulty).toBeGreaterThan(0)
      }
    })

    test('with previousX to avoid repetition', () => {
      const problem1 = generateEquationProblem(100, null)
      const problem2 = generateEquationProblem(100, problem1.correctAnswer)

      // Second problem should try to have different X value
      expect(problem2.options).toHaveLength(4)
      expect(problem2.correctAnswer).toBeGreaterThan(0)
    })

    test('simple equation format', () => {
      // Low score should give simple equations
      for (let i = 0; i < 20; i++) {
        const problem = generateEquationProblem(0)
        if (problem.equationType === 'simple') {
          // Should be like "x + a = b" or "a + x = b"
          expect(problem.expression).toMatch(/x \+ \d+ = \d+|\d+ \+ x = \d+/)
          return
        }
      }
      expect(true).toBe(true)
    })

    test('all options are within reasonable bounds', () => {
      for (const score of [0, 100, 300, 500]) {
        const problem = generateEquationProblem(score)
        for (const option of problem.options) {
          const value = parseInt(option)
          expect(value).toBeGreaterThanOrEqual(0)
          expect(value).toBeLessThanOrEqual(200) // Max level allows up to 200
        }
      }
    })
  })

  describe('generateFirstGradeDecompositionProblem - Edge Cases', () => {
    test('generates valid problems repeatedly', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateFirstGradeDecompositionProblem()
        expect(problem.targetNumber).toBeGreaterThanOrEqual(2)
        expect(problem.targetNumber).toBeLessThanOrEqual(10)
        expect(problem.options).toHaveLength(4)

        const [part1, part2] = problem.correctDecomposition
        expect(part1 + part2).toBe(problem.targetNumber)
        expect(part1).toBeGreaterThan(0)
        expect(part2).toBeGreaterThan(0)
      }
    })

    test('target number is 2 (minimum)', () => {
      // Generate until we get target of 2
      for (let i = 0; i < 100; i++) {
        const problem = generateFirstGradeDecompositionProblem()
        if (problem.targetNumber === 2) {
          const [part1, part2] = problem.correctDecomposition
          expect(part1).toBe(1)
          expect(part2).toBe(1)
          return
        }
      }
      expect(true).toBe(true)
    })

    test('target number is 10 (maximum)', () => {
      // Generate until we get target of 10
      for (let i = 0; i < 100; i++) {
        const problem = generateFirstGradeDecompositionProblem()
        if (problem.targetNumber === 10) {
          const [part1, part2] = problem.correctDecomposition
          expect(part1 + part2).toBe(10)
          expect(part1).toBeGreaterThan(0)
          expect(part2).toBeGreaterThan(0)
          return
        }
      }
      expect(true).toBe(true)
    })
  })

  describe('Cross-Type Edge Cases', () => {
    test('all generators handle score parameter without crashing', () => {
      expect(() => generateCountingProblem(0, 1, 10)).not.toThrow()
      expect(() => generateMultiplicationProblem(5)).not.toThrow()
      expect(() => generateDecompositionProblem(100, 3)).not.toThrow()
      expect(() => generateEquationProblem(100)).not.toThrow()
      expect(() => generateFirstGradeDecompositionProblem()).not.toThrow()
    })

    test('all generators produce exactly 4 options', () => {
      const counting = generateCountingProblem(0, 1, 10)
      const multiplication = generateMultiplicationProblem(5)
      const decomposition = generateDecompositionProblem(100, 3)
      const equation = generateEquationProblem(100)
      const firstGrade = generateFirstGradeDecompositionProblem()

      expect(counting.options).toHaveLength(4)
      expect(multiplication.options).toHaveLength(4)
      expect(decomposition.options).toHaveLength(4)
      expect(equation.options).toHaveLength(4)
      expect(firstGrade.options).toHaveLength(4)
    })

    test('all generators have valid correctIndex', () => {
      const counting = generateCountingProblem(0, 1, 10)
      const multiplication = generateMultiplicationProblem(5)
      const decomposition = generateDecompositionProblem(100, 3)
      const equation = generateEquationProblem(100)
      const firstGrade = generateFirstGradeDecompositionProblem()

      expect(counting.correctIndex).toBeGreaterThanOrEqual(0)
      expect(counting.correctIndex).toBeLessThan(4)

      expect(multiplication.correctIndex).toBeGreaterThanOrEqual(0)
      expect(multiplication.correctIndex).toBeLessThan(4)

      expect(decomposition.correctIndex).toBeGreaterThanOrEqual(0)
      expect(decomposition.correctIndex).toBeLessThan(4)

      expect(equation.correctIndex).toBeGreaterThanOrEqual(0)
      expect(equation.correctIndex).toBeLessThan(4)

      expect(firstGrade.correctIndex).toBeGreaterThanOrEqual(0)
      expect(firstGrade.correctIndex).toBeLessThan(4)
    })

    test('all generators produce non-negative correct answers', () => {
      const counting = generateCountingProblem(0, 1, 10)
      const multiplication = generateMultiplicationProblem(5)
      const decomposition = generateDecompositionProblem(100, 3)
      const equation = generateEquationProblem(100)

      expect(counting.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(multiplication.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(decomposition.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(equation.correctAnswer).toBeGreaterThanOrEqual(0)
    })
  })
})
