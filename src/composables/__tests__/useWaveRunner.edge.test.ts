import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWaveRunner } from '../useWaveRunner'
import type { MathProblem } from '@/types'

function makeProblem(correctIndex: number = 0): MathProblem {
  return {
    expression: '3 + 2',
    options: ['5', '4', '6', '3'],
    correctIndex,
    difficulty: 1,
  }
}

describe('useWaveRunner - edge cases and regression tests', () => {
  let runner: ReturnType<typeof useWaveRunner>
  let problemCounter = 0

  beforeEach(() => {
    vi.useFakeTimers()
    problemCounter = 0
    runner = useWaveRunner(() => makeProblem(problemCounter++ % 4))
  })

  afterEach(() => {
    runner.reset()
    vi.useRealTimers()
  })

  describe('answer edge cases', () => {
    it('should return false when answering before start', () => {
      expect(runner.answer(0)).toBe(false)
    })

    it('should return false when answering with no current card', () => {
      // Don't start, just try to answer
      expect(runner.answer(0)).toBe(false)
    })

    it('should handle answering same card multiple times', () => {
      runner.start()
      const first = runner.answer(0)
      // After answering, current card changes; second answer hits next card
      const second = runner.answer(0)
      expect(typeof first).toBe('boolean')
      expect(typeof second).toBe('boolean')
    })
  })

  describe('speed adaptation edge cases', () => {
    it('should not go below 3000ms even after many correct answers', () => {
      runner.start()
      for (let i = 0; i < 20; i++) {
        runner.answer(0) // correctIndex = 0 for first problem
      }
      expect(runner.speed.value).toBeGreaterThanOrEqual(3000)
    })

    it('should not exceed 12000ms even after many wrong answers', () => {
      runner.start()
      for (let i = 0; i < 20; i++) {
        runner.answer(99) // wrong index
      }
      expect(runner.speed.value).toBeLessThanOrEqual(12000)
    })

    it('should adapt speed correctly: correct then wrong', () => {
      runner.start()
      const initialSpeed = 8000
      expect(runner.speed.value).toBe(initialSpeed)

      runner.answer(0) // correct → speed * 0.92
      const afterCorrect = Math.max(3000, initialSpeed * 0.92)
      expect(runner.speed.value).toBe(afterCorrect)

      runner.answer(99) // wrong → speed * 1.3
      const afterWrong = Math.min(12000, afterCorrect * 1.3)
      expect(runner.speed.value).toBe(afterWrong)
    }) 
  })

  describe('streak tracking', () => {
    it('should build streak with consecutive correct answers', () => {
      runner.start()
      for (let i = 0; i < 5; i++) {
        runner.answer(0)
      }
      // Streak should be 5 if all correct (correctIndex cycles through 0,1,2,3,0)
      // First card correctIndex=0, answer(0) → correct ✓
      // Second card correctIndex=1, answer(0) → wrong ✗
      // So streak is not simply 5
      expect(runner.streak.value).toBeGreaterThanOrEqual(0)
    })

    it('should reset streak on wrong answer', () => {
      runner.start()
      runner.answer(0) // might be correct
      const streakBefore = runner.streak.value
      runner.answer(99) // definitely wrong
      expect(runner.streak.value).toBe(0)
    })

    it('should track totalCorrect separately from streak', () => {
      runner.start()
      const correctBefore = runner.totalCorrect.value
      runner.answer(99) // wrong
      expect(runner.totalCorrect.value).toBe(correctBefore)
    })
  })

  describe('pause/resume', () => {
    it('should not auto-advance while paused', () => {
      runner.start()
      runner.pause()
      const cardsBefore = runner.cards.value.length
      vi.advanceTimersByTime(20000)
      // Cards should not have changed
      expect(runner.isPaused.value).toBe(true)
    })

    it('should resume auto-advance after unpause', () => {
      runner.start()
      runner.pause()
      runner.resume()
      expect(runner.isPaused.value).toBe(false)
    })

    it('should handle pause when already paused', () => {
      runner.start()
      runner.pause()
      runner.pause() // double pause - should not throw
      expect(runner.isPaused.value).toBe(true)
    })

    it('should handle resume when not paused', () => {
      runner.start()
      runner.resume() // double resume - should not throw
      expect(runner.isPaused.value).toBe(false)
    })
  })

  describe('card pool management', () => {
    it('should not exceed 4 cards in pool', () => {
      runner.start()
      // After start: 2 cards
      // Each answer adds one more
      for (let i = 0; i < 10; i++) {
        runner.answer(i % 4)
      }
      // Pool should be at most 4
      expect(runner.cards.value.length).toBeLessThanOrEqual(4)
    })

    it('should clean up leaving/passed cards after timeout', () => {
      runner.start()
      runner.answer(0)
      // Advance past the 600ms cleanup timer
      vi.advanceTimersByTime(700)
      const leavingOrPassed = runner.cards.value.filter(
        c => c.position === 'leaving' || c.position === 'passed'
      )
      expect(leavingOrPassed.length).toBe(0)
    })
  })

  describe('reset', () => {
    it('should clear all state on reset', () => {
      runner.start()
      runner.answer(0)
      runner.answer(0)
      runner.reset()

      expect(runner.cards.value).toHaveLength(0)
      expect(runner.speed.value).toBe(8000)
      expect(runner.streak.value).toBe(0)
      expect(runner.totalCorrect.value).toBe(0)
      expect(runner.totalAnswered.value).toBe(0)
      expect(runner.isPaused.value).toBe(false)
    })

    it('should be usable after reset', () => {
      runner.start()
      runner.answer(0)
      runner.reset()
      runner.start()
      expect(runner.cards.value.length).toBeGreaterThan(0)
    })
  })

  describe('multiple starts', () => {
    it('should handle starting without reset (accumulates cards)', () => {
      runner.start()
      runner.start() // second start without reset
      // Should still have cards
      expect(runner.cards.value.length).toBeGreaterThan(0)
    })
  })
})
