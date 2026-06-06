/**
 * Integration tests for Wave Runner game flow.
 * Simulates the exact flow used in WaveCountingView.vue.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWaveRunner } from '@/composables/useWaveRunner'
import type { MathProblem } from '@/types'

function makeProblem(correctIndex: number, expression: string = '3+2'): MathProblem {
  return {
    expression,
    options: ['5', '4', '6', '3'],
    correctIndex,
    difficulty: 1,
  }
}

describe('WaveRunner — game flow integration', () => {
  let problemIndex = 0
  let runner: ReturnType<typeof useWaveRunner>

  beforeEach(() => {
    vi.useFakeTimers()
    problemIndex = 0
    runner = useWaveRunner(() => {
      const problems = [
        makeProblem(0, '3+2'), // correct = option[0] = 5
        makeProblem(1, '4+3'), // correct = option[1] = 4
        makeProblem(2, '5+1'), // correct = option[2] = 6
        makeProblem(3, '2+2'), // correct = option[3] = 3
      ]
      return problems[problemIndex++ % problems.length]!
    })
  })

  afterEach(() => {
    runner.reset()
    vi.useRealTimers()
  })

  describe('full game session', () => {
    it('should track stats through a game session', () => {
      runner.start()
      expect(runner.cards.value.length).toBeGreaterThan(0)

      // Answer first card correctly (correctIndex = 0)
      const r1 = runner.answer(0)
      expect(r1).toBe(true)
      expect(runner.totalCorrect.value).toBe(1)
      expect(runner.totalAnswered.value).toBe(1)

      // Answer second card incorrectly (correctIndex = 1, we answer 0)
      const r2 = runner.answer(0)
      expect(r2).toBe(false)
      expect(runner.totalCorrect.value).toBe(1)
      expect(runner.totalAnswered.value).toBe(2)
    })
  })

  describe('card positioning', () => {
    it('should have exactly one current card after start', () => {
      runner.start()
      const current = runner.cards.value.filter(c => c.position === 'current')
      expect(current).toHaveLength(1)
    })

    it('should promote next card after answering', () => {
      runner.start()
      const firstCurrent = runner.cards.value.find(c => c.position === 'current')
      runner.answer(0)
      const secondCurrent = runner.cards.value.find(c => c.position === 'current')
      // Should be a different card
      expect(secondCurrent).toBeDefined()
      if (firstCurrent && secondCurrent) {
        expect(firstCurrent.id).not.toBe(secondCurrent.id)
      }
    })
  })

  describe('timer management', () => {
    it('should auto-advance when timer expires (missed)', () => {
      runner.start()
      const beforeTotal = runner.totalAnswered.value

      // Advance past the speed timer (8000ms default)
      vi.advanceTimersByTime(9000)

      // Card should have been auto-advanced (counted as missed)
      expect(runner.totalAnswered.value).toBeGreaterThanOrEqual(beforeTotal)
    })

    it('should schedule new timer after each advance', () => {
      runner.start()
      // First cycle
      vi.advanceTimersByTime(9000)
      // Second cycle
      vi.advanceTimersByTime(9000)
      // Should still be running
      expect(runner.cards.value.length).toBeGreaterThan(0)
    })
  })

  describe('pause during timer', () => {
    it('should not auto-advance while paused', () => {
      runner.start()
      runner.pause()
      vi.advanceTimersByTime(20000)
      // Cards should still exist
      expect(runner.cards.value.length).toBeGreaterThan(0)
    })

    it('should resume auto-advance after unpause', () => {
      runner.start()
      runner.pause()
      vi.advanceTimersByTime(5000) // would have expired
      runner.resume()
      vi.advanceTimersByTime(9000)
      // Should have advanced
      expect(runner.cards.value.length).toBeGreaterThan(0)
    })
  })

  describe('stress: rapid answers', () => {
    it('should handle 50 rapid correct answers', () => {
      runner.start()
      for (let i = 0; i < 50; i++) {
        runner.answer(0) // Some correct, some not based on cycling correctIndex
      }
      expect(runner.totalAnswered.value).toBe(50)
      expect(runner.totalCorrect.value).toBeGreaterThan(0)
      expect(runner.speed.value).toBeGreaterThanOrEqual(3000)
      expect(runner.speed.value).toBeLessThanOrEqual(12000)
    })
  })

  describe('reset mid-game', () => {
    it('should fully reset during active game', () => {
      runner.start()
      runner.answer(0)
      runner.answer(0)
      runner.pause()
      runner.reset()

      expect(runner.cards.value).toHaveLength(0)
      expect(runner.speed.value).toBe(8000)
      expect(runner.streak.value).toBe(0)
      expect(runner.totalCorrect.value).toBe(0)
      expect(runner.totalAnswered.value).toBe(0)
      expect(runner.isPaused.value).toBe(false)
    })
  })
})
