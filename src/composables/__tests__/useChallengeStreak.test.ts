import { describe, it, expect, beforeEach } from 'vitest'
import { useChallengeStreak } from '../useChallengeStreak'

describe('useChallengeStreak', () => {
  beforeEach(() => {
    // Each test gets a fresh instance
  })

  function freshStreak() {
    return useChallengeStreak()
  }

  it('should initialize with zero values', () => {
    const s = freshStreak()
    expect(s.currentStreak.value).toBe(0)
    expect(s.bestStreak.value).toBe(0)
    expect(s.totalCorrect.value).toBe(0)
    expect(s.totalAnswered.value).toBe(0)
    expect(s.accuracy.value).toBe(0)
  })

  it('should increment streak on recordCorrect', () => {
    const s = freshStreak()
    s.recordCorrect()
    expect(s.currentStreak.value).toBe(1)
    s.recordCorrect()
    expect(s.currentStreak.value).toBe(2)
    s.recordCorrect()
    expect(s.currentStreak.value).toBe(3)
  })

  it('should track totalCorrect and totalAnswered on correct', () => {
    const s = freshStreak()
    s.recordCorrect()
    s.recordCorrect()
    expect(s.totalCorrect.value).toBe(2)
    expect(s.totalAnswered.value).toBe(2)
  })

  it('should reset streak but not bestStreak on recordIncorrect', () => {
    const s = freshStreak()
    s.recordCorrect()
    s.recordCorrect()
    s.recordCorrect()
    expect(s.currentStreak.value).toBe(3)
    expect(s.bestStreak.value).toBe(3)

    s.recordIncorrect()
    expect(s.currentStreak.value).toBe(0)
    expect(s.bestStreak.value).toBe(3) // best preserved
  })

  it('should increment totalAnswered on incorrect', () => {
    const s = freshStreak()
    s.recordCorrect()
    s.recordIncorrect()
    expect(s.totalAnswered.value).toBe(2)
    expect(s.totalCorrect.value).toBe(1)
  })

  it('should update bestStreak when surpassing previous', () => {
    const s = freshStreak()
    s.recordCorrect()
    s.recordCorrect()
    expect(s.bestStreak.value).toBe(2)

    s.recordIncorrect() // reset current

    s.recordCorrect()
    s.recordCorrect()
    s.recordCorrect()
    expect(s.bestStreak.value).toBe(3)
    expect(s.currentStreak.value).toBe(3)
  })

  it('should calculate accuracy correctly', () => {
    const s = freshStreak()
    s.recordCorrect()
    s.recordCorrect()
    s.recordIncorrect()
    // 2 correct out of 3 = 0.666...
    expect(s.accuracy.value).toBeCloseTo(2 / 3)
  })

  it('should return 0 accuracy when no answers', () => {
    const s = freshStreak()
    expect(s.accuracy.value).toBe(0)
  })

  it('should return 1 accuracy when all correct', () => {
    const s = freshStreak()
    s.recordCorrect()
    s.recordCorrect()
    s.recordCorrect()
    expect(s.accuracy.value).toBe(1)
  })

  it('should detect milestone streaks', () => {
    const s = freshStreak()
    expect(s.isMilestone.value).toBe(false) // 0 is not a milestone

    // Reach streak 3 (first milestone)
    s.recordCorrect()
    s.recordCorrect()
    s.recordCorrect()
    expect(s.isMilestone.value).toBe(true)

    s.recordCorrect()
    expect(s.isMilestone.value).toBe(false) // 4 is not a milestone

    s.recordCorrect() // 5
    expect(s.isMilestone.value).toBe(true)
  })

  it('should return correct lastMilestone', () => {
    const s = freshStreak()
    expect(s.lastMilestone.value).toBe(0)

    s.recordCorrect()
    s.recordCorrect()
    expect(s.lastMilestone.value).toBe(0) // streak 2, no milestone passed

    s.recordCorrect() // streak 3
    expect(s.lastMilestone.value).toBe(3)

    s.recordCorrect()
    s.recordCorrect() // streak 5
    expect(s.lastMilestone.value).toBe(5)
  })

  it('should reset lastMilestone when streak is lost', () => {
    const s = freshStreak()
    s.recordCorrect()
    s.recordCorrect()
    s.recordCorrect() // streak 3
    expect(s.lastMilestone.value).toBe(3)

    s.recordIncorrect()
    expect(s.lastMilestone.value).toBe(0)
  })

  it('should have predefined milestones array', () => {
    const s = freshStreak()
    expect(s.milestones).toEqual([3, 5, 7, 10, 15, 20])
  })

  it('should reset all state', () => {
    const s = freshStreak()
    s.recordCorrect()
    s.recordCorrect()
    s.recordIncorrect()
    s.reset()
    expect(s.currentStreak.value).toBe(0)
    expect(s.bestStreak.value).toBe(0)
    expect(s.totalCorrect.value).toBe(0)
    expect(s.totalAnswered.value).toBe(0)
    expect(s.accuracy.value).toBe(0)
  })

  it('should handle consecutive correct then incorrect correctly', () => {
    const s = freshStreak()
    for (let i = 0; i < 7; i++) s.recordCorrect()
    expect(s.currentStreak.value).toBe(7)
    expect(s.bestStreak.value).toBe(7)

    s.recordIncorrect()
    expect(s.currentStreak.value).toBe(0)
    expect(s.bestStreak.value).toBe(7)

    s.recordCorrect()
    expect(s.currentStreak.value).toBe(1)
    expect(s.bestStreak.value).toBe(7)
  })
})
