import { describe, it, expect } from 'vitest'
import { useChallengeStreak } from '../useChallengeStreak'

describe('useChallengeStreak - edge cases', () => {
  describe('accuracy edge cases', () => {
    it('should return 0 accuracy with 0 correct / 0 total', () => {
      const streak = useChallengeStreak()
      expect(streak.accuracy.value).toBe(0)
    })

    it('should handle very high answer counts', () => {
      const streak = useChallengeStreak()
      for (let i = 0; i < 1000; i++) {
        streak.recordCorrect()
      }
      expect(streak.accuracy.value).toBe(1)
      expect(streak.totalCorrect.value).toBe(1000)
    })

    it('should compute accuracy correctly with mixed answers', () => {
      const streak = useChallengeStreak()
      // 7 correct, 3 incorrect = 70%
      for (let i = 0; i < 7; i++) streak.recordCorrect()
      for (let i = 0; i < 3; i++) streak.recordIncorrect()
      expect(streak.accuracy.value).toBeCloseTo(0.7)
    })
  })

  describe('bestStreak tracking', () => {
    it('should track best streak across resets', () => {
      const streak = useChallengeStreak()
      // Build streak of 5
      for (let i = 0; i < 5; i++) streak.recordCorrect()
      expect(streak.bestStreak.value).toBe(5)

      streak.recordIncorrect() // currentStreak = 0, bestStreak stays 5
      expect(streak.currentStreak.value).toBe(0)
      expect(streak.bestStreak.value).toBe(5)

      // Build new streak of 3
      for (let i = 0; i < 3; i++) streak.recordCorrect()
      expect(streak.bestStreak.value).toBe(5) // still 5
    })

    it('should update bestStreak when new streak exceeds old', () => {
      const streak = useChallengeStreak()
      for (let i = 0; i < 5; i++) streak.recordCorrect()
      streak.recordIncorrect()
      for (let i = 0; i < 7; i++) streak.recordCorrect()
      expect(streak.bestStreak.value).toBe(7)
    })
  })

  describe('milestone detection', () => {
    it('should detect milestones at 3, 5, 7, 10, 15, 20', () => {
      const expectedMilestones = [3, 5, 7, 10, 15, 20]
      const streak = useChallengeStreak()
      expect(streak.milestones).toEqual(expectedMilestones)

      for (let i = 1; i <= 20; i++) {
        streak.recordCorrect()
        const isMilestone = expectedMilestones.includes(i)
        expect(streak.isMilestone.value).toBe(isMilestone)
        if (isMilestone) {
          expect(streak.lastMilestone.value).toBe(i)
        }
      }
    })

    it('should clear isMilestone between milestones', () => {
      const streak = useChallengeStreak()
      for (let i = 0; i < 3; i++) streak.recordCorrect()
      expect(streak.isMilestone.value).toBe(true) // 3 is milestone
      streak.recordCorrect() // 4 is not
      expect(streak.isMilestone.value).toBe(false)
    })

    it('should reset lastMilestone on incorrect', () => {
      const streak = useChallengeStreak()
      for (let i = 0; i < 5; i++) streak.recordCorrect()
      expect(streak.lastMilestone.value).toBe(5)
      streak.recordIncorrect()
      // currentStreak = 0, so lastMilestone returns 0 (no milestone reached)
      expect(streak.lastMilestone.value).toBe(0)
    }) 
  })

  describe('reset', () => {
    it('should reset everything', () => {
      const streak = useChallengeStreak()
      for (let i = 0; i < 10; i++) streak.recordCorrect()
      streak.reset()
      expect(streak.currentStreak.value).toBe(0)
      expect(streak.bestStreak.value).toBe(0)
      expect(streak.totalCorrect.value).toBe(0)
      expect(streak.totalAnswered.value).toBe(0)
      expect(streak.accuracy.value).toBe(0)
      // lastMilestone is computed from currentStreak (= 0), returns 0
      expect(streak.lastMilestone.value).toBe(0)
    }) 
  })

  describe('stress test', () => {
    it('should handle alternating correct/incorrect', () => {
      const streak = useChallengeStreak()
      for (let i = 0; i < 100; i++) {
        streak.recordCorrect()
        streak.recordIncorrect()
      }
      expect(streak.totalCorrect.value).toBe(100)
      expect(streak.totalAnswered.value).toBe(200)
      expect(streak.currentStreak.value).toBe(0) // ended on incorrect
      expect(streak.bestStreak.value).toBe(1) // never got more than 1 in a row
    })
  })
})
