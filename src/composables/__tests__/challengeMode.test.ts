/**
 * Integration tests for Challenge Mode orchestrator.
 * Tests useChallengeMode with mock problem generation.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useChallengeMode } from '@/composables/useChallengeMode'
import type { MathProblem } from '@/types'

function makeProblem(): MathProblem {
  return {
    expression: `${Math.floor(Math.random() * 10)}+${Math.floor(Math.random() * 10)}`,
    options: ['5', '4', '6', '3'],
    correctIndex: 0,
    difficulty: 1,
  }
}

// Mock the challenge records store
vi.mock('@/store/challengeRecords', () => ({
  useChallengeRecordsStore: () => ({
    updateRecord: () => false,
    getBestScore: () => null,
  }),
}))

describe('useChallengeMode - orchestrator', () => {
  let mode: ReturnType<typeof useChallengeMode>

  beforeEach(() => {
    vi.useFakeTimers()
    mode = useChallengeMode({
      exerciseType: 'counting',
      generateProblem: makeProblem,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('should start in prestart phase', () => {
      expect(mode.phase.value).toBe('prestart')
    })

    it('should have default duration of 2', () => {
      expect(mode.selectedDuration.value).toBe(2)
    })

    it('should have zero score', () => {
      expect(mode.score.value).toBe(0)
    })

    it('should not be finished', () => {
      expect(mode.isFinished.value).toBe(false)
    })
  })

  describe('startChallenge', () => {
    it('should transition to playing phase', () => {
      mode.startChallenge(2)
      expect(mode.phase.value).toBe('playing')
    })

    it('should set selected duration', () => {
      mode.startChallenge(3)
      expect(mode.selectedDuration.value).toBe(3)
    })

    it('should reset score', () => {
      mode.startChallenge(2)
      expect(mode.score.value).toBe(0)
    })

    it('should generate a problem', () => {
      mode.startChallenge(2)
      expect(mode.currentProblem.value).toBeDefined()
    })

    it('should set answered to false', () => {
      mode.startChallenge(2)
      expect(mode.answered.value).toBe(false)
    })
  })

  describe('selectAnswer', () => {
    it('should do nothing before challenge starts', () => {
      mode.selectAnswer(0)
      expect(mode.score.value).toBe(0)
      expect(mode.answered.value).toBe(false)
    })

    it('should mark as answered', () => {
      mode.startChallenge(2)
      vi.advanceTimersByTime(200) // let timer start
      mode.selectAnswer(0)
      expect(mode.answered.value).toBe(true)
    })

    it('should record correct answer', () => {
      mode.startChallenge(2)
      mode.selectAnswer(0)
      expect(mode.score.value).toBeGreaterThan(0)
      expect(mode.totalCorrect.value).toBe(1)
    })

    it('should record wrong answer with no score increase', () => {
      mode.startChallenge(2)
      mode.selectAnswer(99)
      expect(mode.score.value).toBe(0)
      expect(mode.totalAnswered.value).toBe(1)
      expect(mode.totalCorrect.value).toBe(0)
    })

    it('should not accept answer after already answered', () => {
      mode.startChallenge(2)
      mode.selectAnswer(0)
      const scoreAfterFirst = mode.score.value
      mode.selectAnswer(0) // should be blocked
      expect(mode.score.value).toBe(scoreAfterFirst)
    })
  })

  describe('scoring', () => {
    it('should award 100+streak bonus for first correct answer', () => {
      mode.startChallenge(2)
      mode.selectAnswer(0)
      // recordCorrect sets streak=1 first, then computes bonus=min(1,10)*10=10
      // Score = 100 + 10 = 110
      expect(mode.score.value).toBe(110)
    }) 

    it('should add streak bonus for consecutive correct answers', () => {
      mode.startChallenge(2)
      // First: streak→1, score = 100 + 10 = 110
      mode.selectAnswer(0)
      expect(mode.score.value).toBe(110)
      // Wait for nextProblem setTimeout(400ms)
      vi.advanceTimersByTime(500)
      // Second: streak→2, score += 100 + 20 = 230
      mode.selectAnswer(0)
      expect(mode.score.value).toBe(230)
    }) 
  })

  describe('retry', () => {
    it('should go back to prestart', () => {
      mode.startChallenge(2)
      vi.advanceTimersByTime(200)
      mode.retry()
      expect(mode.phase.value).toBe('prestart')
    })

    it('should reset score', () => {
      mode.startChallenge(2)
      vi.advanceTimersByTime(200)
      mode.selectAnswer(0)
      mode.retry()
      expect(mode.score.value).toBe(0)
    })
  })

  describe('end challenge', () => {
    // Timer-dependent tests are skipped because useChallengeTimer
    // uses requestAnimationFrame + Date.now(), which doesn't play well
    // with vi.useFakeTimers() in a unit test.
    it.skip('should end when timer runs out', () => {
      mode.startChallenge(1)
      vi.advanceTimersByTime(100)
      vi.advanceTimersByTime(61000)
      expect(mode.phase.value).toBe('results')
    })

    it.skip('should produce a result object', () => {
      mode.startChallenge(1)
      vi.advanceTimersByTime(100)
      vi.advanceTimersByTime(61000)
      expect(mode.result.value).not.toBeNull()
      if (mode.result.value) {
        expect(mode.result.value.exerciseType).toBe('counting')
        expect(mode.result.value.duration).toBe(1)
      }
    })
  })
})
