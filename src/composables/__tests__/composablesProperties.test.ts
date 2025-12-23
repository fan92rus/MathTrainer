/**
 * Property-based tests for composables (useGameLogic, useCoins, etc.)
 *
 * These tests verify critical invariants of Vue composables using fast-check.
 */

import { describe, test, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { createPinia, setActivePinia } from 'pinia'
import { useGameLogic, useSound } from '../useGameLogic'
import { useCoins } from '../useCoins'
import { usePlayerStore } from '@/store/player'

describe('Composables - Property Based Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('useGameLogic', () => {
    test('score is always non-negative', () => {
      fc.assert(
        fc.property(
          fc.array(fc.boolean()),
          fc.array(fc.nat({ max: 5 })),
          (correctAnswers, errorCounts) => {
            const { score, selectAnswer, initializeGame } = useGameLogic(10)
            initializeGame()

            for (let i = 0; i < Math.min(correctAnswers.length, 10); i++) {
              const correctIndex = 0
              const selectedIndex = correctAnswers[i] ? 0 : 1

              // Simulate errors if needed
              for (let e = 0; e < (errorCounts[i] || 0); e++) {
                selectAnswer(1, correctIndex)
              }

              // Select answer
              selectAnswer(selectedIndex, correctIndex)
            }

            expect(score.value).toBeGreaterThanOrEqual(0)
            return true
          }
        ),
        { numRuns: 30 }
      )
    })

    test('currentQuestion is bounded by totalQuestions', () => {
      const { currentQuestion, nextQuestion, initializeGame } = useGameLogic(10)
      initializeGame()

      for (let i = 0; i < 10; i++) {
        nextQuestion()
        expect(currentQuestion.value).toBeGreaterThanOrEqual(0)
        expect(currentQuestion.value).toBeLessThanOrEqual(10)
      }
    })

    test('correctAnswers is less than or equal to totalAnswers', () => {
      const { correctAnswers, totalAnswers, selectAnswer, initializeGame } = useGameLogic(10)
      initializeGame()

      // Simulate 5 answers
      for (let i = 0; i < 5; i++) {
        const correctIndex = 0
        const selectedIndex = i % 2 === 0 ? 0 : 1 // Alternate correct/incorrect
        selectAnswer(selectedIndex, correctIndex)
      }

      expect(correctAnswers.value).toBeLessThanOrEqual(totalAnswers.value)
    })

    test('errorsPerQuestion is non-decreasing during question', () => {
      const { selectAnswer, errorsPerQuestion, initializeGame } = useGameLogic(10)
      initializeGame()

      const correctIndex = 0

      // Make incorrect answers
      const errorsBefore = errorsPerQuestion.value[0] || 0
      selectAnswer(1, correctIndex) // Wrong
      const errorsAfter1 = errorsPerQuestion.value[0] || 0
      selectAnswer(2, correctIndex) // Wrong again
      const errorsAfter2 = errorsPerQuestion.value[0] || 0

      expect(errorsAfter1).toBeGreaterThanOrEqual(errorsBefore)
      expect(errorsAfter2).toBeGreaterThanOrEqual(errorsAfter1)
    })

    test('initializeGame resets all state to initial values', () => {
      const { score, currentQuestion, answered, gameOver, correctAnswers, totalAnswers, selectAnswer, initializeGame } =
        useGameLogic(10)

      // Modify state
      selectAnswer(0, 0)
      initializeGame()

      expect(score.value).toBe(0)
      expect(currentQuestion.value).toBe(0)
      expect(answered.value).toBe(false)
      expect(gameOver.value).toBe(false)
      expect(correctAnswers.value).toBe(0)
      expect(totalAnswers.value).toBe(0)
    })

    test('getGameResult returns consistent values with state', () => {
      const { score, correctAnswers, totalAnswers, selectAnswer, getGameResult, initializeGame } = useGameLogic(10)
      initializeGame()

      // Make some answers
      selectAnswer(0, 0) // Correct
      selectAnswer(1, 0) // Incorrect

      const result = getGameResult()

      expect(result.score).toBe(score.value)
      expect(result.correctAnswers).toBe(correctAnswers.value)
      expect(result.totalAnswers).toBe(totalAnswers.value)
    })

    test('progressPercent is bounded between 0 and 100', () => {
      const { progressPercent, nextQuestion, initializeGame } = useGameLogic(10)
      initializeGame()

      for (let i = 0; i <= 10; i++) {
        expect(progressPercent.value).toBeGreaterThanOrEqual(0)
        expect(progressPercent.value).toBeLessThanOrEqual(100)
        nextQuestion()
      }
    })
  })

  describe('useCoins', () => {
    test('calculated coins are always non-negative', () => {
      const { calculateCoins } = useCoins()

      fc.assert(
        fc.property(
          fc.constantFrom('counting', 'decomposition', 'multiplication', 'equations'),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 0, max: 10 }),
          (exerciseType, level, errors) => {
            const coins = calculateCoins(exerciseType, level, errors)
            expect(coins).toBeGreaterThanOrEqual(0)
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    test('more errors = fewer coins (monotonic)', () => {
      const { calculateCoins } = useCoins()

      fc.assert(
        fc.property(
          fc.constantFrom('counting', 'decomposition', 'multiplication', 'equations'),
          fc.integer({ min: 1, max: 10 }),
          (exerciseType, level) => {
            const coins0 = calculateCoins(exerciseType, level, 0)
            const coins1 = calculateCoins(exerciseType, level, 1)
            const coins2 = calculateCoins(exerciseType, level, 2)
            const coins3 = calculateCoins(exerciseType, level, 3)

            expect(coins0).toBeGreaterThanOrEqual(coins1)
            expect(coins1).toBeGreaterThanOrEqual(coins2)
            expect(coins2).toBeGreaterThanOrEqual(coins3)
            // 3+ errors should give 0 coins
            expect(coins3).toBe(0)
            return true
          }
        ),
        { numRuns: 20 }
      )
    })

    test('higher level gives more or equal coins', () => {
      const { calculateCoins } = useCoins()

      fc.assert(
        fc.property(
          fc.constantFrom('counting', 'decomposition', 'multiplication', 'equations'),
          fc.integer({ min: 1, max: 9 }),
          (exerciseType, level) => {
            const coins1 = calculateCoins(exerciseType, level, 0)
            const coins2 = calculateCoins(exerciseType, level + 1, 0)

            expect(coins2).toBeGreaterThanOrEqual(coins1)
            return true
          }
        ),
        { numRuns: 20 }
      )
    })

    test('exercise types have appropriate relative coin values', () => {
      const { calculateCoins } = useCoins()

      // At same level and errors, multiplication should give most coins
      const level = 3
      const errors = 0

      const countingCoins = calculateCoins('counting', level, errors)
      const multiplicationCoins = calculateCoins('multiplication', level, errors)

      expect(multiplicationCoins).toBeGreaterThan(countingCoins)
    })

    test('awardCoins adds coins to player store', () => {
      const playerStore = usePlayerStore()
      playerStore.resetProgress()

      const { awardCoins } = useCoins()
      const before = playerStore.currency.coins

      // Award coins (without animation for test speed)
      awardCoins('counting', 1, 0, false)

      expect(playerStore.currency.coins).toBeGreaterThan(before)
    })
  })

  describe('useSound', () => {
    test('setVolume clamps to [0, 1]', () => {
      const sound = useSound()

      fc.assert(
        fc.property(fc.integer({ min: -100, max: 100 }), (volume) => {
          sound.setVolume(volume)
          const actual = sound.getVolume()
          expect(actual).toBeGreaterThanOrEqual(0)
          expect(actual).toBeLessThanOrEqual(1)
          return true
        }),
        { numRuns: 30 }
      )
    })

    test('toggleSound flips enabled state', () => {
      const sound = useSound()

      const before = sound.isEnabled()
      sound.toggleSound()
      const after = sound.isEnabled()

      expect(after).toBe(!before)
    })
  })
})
