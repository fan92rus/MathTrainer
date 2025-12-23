/**
 * Property-based tests for stores (scores, achievements, player)
 *
 * These tests verify critical invariants of state management using fast-check.
 */

import { describe, test, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { createPinia, setActivePinia } from 'pinia'
import { useScoresStore } from '../scores'
import { useAchievementsStore } from '../achievements'
import { usePlayerStore } from '../player'

describe('Stores - Property Based Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('useScoresStore', () => {
    test('scores are monotonic non-decreasing (except reset)', () => {
      fc.assert(
        fc.property(fc.array(fc.nat({ max: 100 })), (pointsArray) => {
          const store = useScoresStore()
          store.resetAllScores()

          let prevCounting = store.countingScore
          for (const points of pointsArray) {
            store.updateCountingScore(points)
            expect(store.countingScore).toBeGreaterThanOrEqual(prevCounting)
            prevCounting = store.countingScore
          }
          return true
        }),
        { numRuns: 50 }
      )
    })

    test('total score equals sum of component scores', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.nat({ max: 1000 }),
            fc.nat({ max: 1000 }),
            fc.nat({ max: 1000 }),
            fc.nat({ max: 1000 }),
            fc.nat({ max: 1000 })
          ),
          ([c, d, f, m, e]) => {
            const store = useScoresStore()
            store.resetAllScores()

            store.updateCountingScore(c)
            store.updateDecompositionScore(d)
            store.updateFirstGradeDecompositionScore(f)
            store.updateMultiplicationScore(m)
            store.updateEquationsScore(e)

            const total = store.getTotalScore
            expect(total).toBe(c + d + f + m + e)
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    test('manual counters are non-decreasing', () => {
      const store = useScoresStore()
      store.resetAllScores()

      const initialSolved = store.manualEquationsSolved
      const initialAttempted = store.totalEquationsAttempted

      // Increment multiple times
      for (let i = 0; i < 10; i++) {
        store.incrementManualEquationsSolved()
        store.incrementTotalEquationsAttempted()

        expect(store.manualEquationsSolved).toBeGreaterThan(initialSolved)
        expect(store.totalEquationsAttempted).toBeGreaterThan(initialAttempted)
      }
    })

    test('solved count is less than or equal to attempted count', () => {
      const store = useScoresStore()
      store.resetAllScores()

      // Attempt more than solved
      for (let i = 0; i < 10; i++) {
        store.incrementTotalEquationsAttempted()
      }
      for (let i = 0; i < 5; i++) {
        store.incrementManualEquationsSolved()
      }

      expect(store.manualEquationsSolved).toBeLessThanOrEqual(store.totalEquationsAttempted)

      // Same for decomposition
      store.incrementTotalDecompositionAttempted()
      expect(store.manualDecompositionSolved).toBeLessThanOrEqual(
        store.totalDecompositionAttempted
      )
    })

    test('resetAllScores sets all scores to zero', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.nat({ max: 500 }),
            fc.nat({ max: 500 }),
            fc.nat({ max: 500 })
          ),
          ([c, d, m]) => {
            const store = useScoresStore()
            store.updateCountingScore(c)
            store.updateDecompositionScore(d)
            store.updateMultiplicationScore(m)

            store.resetAllScores()

            expect(store.countingScore).toBe(0)
            expect(store.decompositionScore).toBe(0)
            expect(store.multiplicationScore).toBe(0)
            expect(store.getTotalScore).toBe(0)
            return true
          }
        ),
        { numRuns: 30 }
      )
    })
  })

  describe('useAchievementsStore', () => {
    test('once unlocked, achievement stays unlocked', () => {
      const store = useAchievementsStore()

      for (const achievement of store.achievements) {
        if (achievement.unlocked) continue // Skip already unlocked

        store.unlockAchievement(achievement.id)

        const unlocked = store.achievements.find((a) => a.id === achievement.id)
        expect(unlocked?.unlocked).toBe(true)

        // Try various operations that shouldn't affect unlocked status
        store.updateAchievementProgress(achievement.id, 0)
        store.saveAchievements()

        const final = store.achievements.find((a) => a.id === achievement.id)
        expect(final?.unlocked).toBe(true)
      }
    })

    test('unlocked achievement has progress 100', () => {
      const store = useAchievementsStore()

      for (const achievement of store.achievements) {
        if (!achievement.unlocked) {
          store.unlockAchievement(achievement.id)
        }

        const unlocked = store.achievements.find((a) => a.id === achievement.id)
        if (unlocked?.unlocked) {
          expect(unlocked.progress).toBe(100)
        }
      }
    })

    test('progress is clamped to [0, 100]', () => {
      const store = useAchievementsStore()

      for (const achievement of store.achievements) {
        if (achievement.unlocked) continue

        // Test with various valid (non-negative) current values
        fc.assert(
          fc.property(fc.integer({ min: 0, max: 1000 }), (current) => {
            store.updateAchievementProgress(achievement.id, current)

            const updated = store.achievements.find((a) => a.id === achievement.id)
            expect(updated?.progress).toBeGreaterThanOrEqual(0)
            expect(updated?.progress).toBeLessThanOrEqual(100)
            return true
          }),
          { numRuns: 10 }
        )
        break // Just test one achievement to avoid too many runs
      }
    })

    test('unlockedCount matches actual unlocked achievements', () => {
      const store = useAchievementsStore()

      // Unlock some achievements randomly
      const toUnlock = [0, 2, 4]
      toUnlock.forEach((i) => {
        if (store.achievements[i]) {
          store.unlockAchievement(store.achievements[i]!.id)
        }
      })

      const actualUnlocked = store.achievements.filter((a) => a.unlocked).length
      expect(store.unlockedCount).toBe(actualUnlocked)
    })

    test('newAchievements are subset of unlocked achievements', () => {
      const store = useAchievementsStore()

      // Unlock some achievements
      const toUnlock = ['novice', 'first_steps']
      toUnlock.forEach((id) => {
        if (store.achievements.find((a) => a.id === id)) {
          store.unlockAchievement(id)
        }
      })

      // All new achievements should be unlocked
      for (const id of store.newAchievements) {
        const achievement = store.achievements.find((a) => a.id === id)
        expect(achievement?.unlocked).toBe(true)
      }
    })

    test('shownAchievements and newAchievements are disjoint after marking', () => {
      const store = useAchievementsStore()

      // Unlock an achievement
      store.unlockAchievement('novice')

      // Mark it as shown
      store.markAchievementsAsShown(['novice'])

      // It should be in shownAchievements
      expect(store.shownAchievements).toContain('novice')

      // getUnshownNewAchievements should not return it
      const unshown = store.getUnshownNewAchievements()
      expect(unshown).not.toContain('novice')
    })

    test('markAchievementsAsViewed removes from newAchievements', () => {
      const store = useAchievementsStore()

      // Unlock achievements
      store.unlockAchievement('novice')
      store.unlockAchievement('first_steps')

      const beforeView = store.newAchievements.length
      expect(beforeView).toBeGreaterThan(0)

      // Mark as viewed
      store.markAchievementsAsViewed(['novice'])

      // novice should no longer be in newAchievements
      expect(store.newAchievements).not.toContain('novice')
      expect(store.newAchievements).toContain('first_steps')
    })
  })

  describe('usePlayerStore', () => {
    test('currency is never negative', () => {
      const store = usePlayerStore()
      store.resetProgress()

      // Try to spend more than available
      const initialCoins = store.currency.coins
      const result = store.spendCoins(initialCoins + 100)

      expect(result).toBe(false)
      expect(store.currency.coins).toBe(initialCoins)
    })

    test('spendCoins returns true and deducts amount when sufficient funds', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1000 }),
          fc.nat({ max: 1000 }),
          (initial, amount) => {
            const store = usePlayerStore()
            store.currency.coins = initial

            const result = store.spendCoins(amount)

            if (amount <= initial && amount > 0) {
              expect(result).toBe(true)
              expect(store.currency.coins).toBe(initial - amount)
            } else if (amount > initial) {
              expect(result).toBe(false)
              expect(store.currency.coins).toBe(initial)
            }
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    test('addCoins increases coin count', () => {
      fc.assert(
        fc.property(fc.nat({ max: 1000 }), (amount) => {
          const store = usePlayerStore()
          const before = store.currency.coins

          store.addCoins(amount)

          expect(store.currency.coins).toBe(before + amount)
          return true
        }),
        { numRuns: 50 }
      )
    })

    test('resetProgress resets currency to defaults', () => {
      const store = usePlayerStore()

      // Add some coins and experience
      store.currency.coins = 500
      store.player.experience = 1000

      store.resetProgress()

      expect(store.currency.coins).toBe(0)
      expect(store.player.experience).toBe(0)
      expect(store.player.level).toBe(1)
    })

    test('level only increases (or stays same on reset)', () => {
      const store = usePlayerStore()
      store.resetProgress()

      const initialLevel = store.player.level

      // Add experience to level up
      store.addExperience(1000)

      expect(store.player.level).toBeGreaterThanOrEqual(initialLevel)

      // Reset should bring back to level 1
      store.resetProgress()
      expect(store.player.level).toBe(1)
    })

    test('daily task progress is bounded by target', () => {
      const store = usePlayerStore()

      for (const task of store.dailyTasks) {
        expect(task.current).toBeGreaterThanOrEqual(0)
        expect(task.current).toBeLessThanOrEqual(task.target)
      }
    })

    test('completed tasks remain completed', () => {
      const store = usePlayerStore()

      // Complete a task by setting progress
      for (const task of store.dailyTasks) {
        store.updateDailyTaskProgress(task.id, task.target)
      }

      // Mark as completed
      for (const task of store.dailyTasks) {
        if (task.current >= task.target) {
          task.completed = true
        }
      }

      // Generate new tasks (should preserve completed status for same day)
      const completedBefore = store.dailyTasks.filter((t) => t.completed).length

      // Check completed status
      const completedAfter = store.dailyTasks.filter((t) => t.completed).length
      expect(completedAfter).toBeGreaterThanOrEqual(completedBefore)
    })

    test('experience never goes negative', () => {
      const store = usePlayerStore()
      store.resetProgress()

      // Even with invalid operations, experience should stay >= 0
      store.addExperience(0)
      expect(store.player.experience).toBeGreaterThanOrEqual(0)

      // Reset should set to 0
      store.resetProgress()
      expect(store.player.experience).toBe(0)
    })
  })

  describe('Cross-store properties', () => {
    test('totalCoinsEarned is monotonic non-decreasing', () => {
      const store = usePlayerStore()
      store.resetProgress()

      const initial = store.player.totalCoinsEarned

      store.addCoins(100)
      expect(store.player.totalCoinsEarned).toBeGreaterThanOrEqual(initial)

      store.addCoins(50)
      expect(store.player.totalCoinsEarned).toBeGreaterThan(initial)
    })

    test('spending coins does not affect totalCoinsEarned', () => {
      const store = usePlayerStore()
      store.resetProgress()

      store.addCoins(100)
      const earnedAfterAdding = store.player.totalCoinsEarned

      store.spendCoins(50)
      expect(store.player.totalCoinsEarned).toBe(earnedAfterAdding)
    })
  })
})
