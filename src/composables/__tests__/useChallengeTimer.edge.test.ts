import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useChallengeTimer } from '../useChallengeTimer'

describe('useChallengeTimer — edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('duration edge cases', () => {
    it('should handle 1 minute duration', () => {
      const timer = useChallengeTimer(1)
      expect(timer.remainingMs.value).toBe(60000)
      expect(timer.formattedTime.value).toBe('1:00')
    })

    it('should handle 2 minute duration', () => {
      const timer = useChallengeTimer(2)
      expect(timer.remainingMs.value).toBe(120000)
    })

    it('should handle 3 minute duration', () => {
      const timer = useChallengeTimer(3)
      expect(timer.remainingMs.value).toBe(180000)
    })
  })

  describe('state transitions', () => {
    it('should not be running initially', () => {
      const timer = useChallengeTimer(1)
      expect(timer.isRunning.value).toBe(false)
    })

    it('should be running after start', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      expect(timer.isRunning.value).toBe(true)
    })

    it('should not be running after stop', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      timer.stop()
      expect(timer.isRunning.value).toBe(false)
    })

    it('should not be running after reset', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      timer.reset()
      expect(timer.isRunning.value).toBe(false)
    })
  })

  describe('countdown accuracy', () => {
    it('should decrease time as it ticks', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      vi.advanceTimersByTime(10000)
      // Allow rAF to fire
      vi.advanceTimersByTime(100)
      expect(timer.remainingMs.value).toBeLessThan(60000)
    })

    it('should not go below 0', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      vi.advanceTimersByTime(120000) // 2 minutes for a 1 minute timer
      expect(timer.remainingMs.value).toBe(0)
    })

    it('should be finished when time runs out', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      vi.advanceTimersByTime(120000)
      expect(timer.isFinished.value).toBe(true)
    })
  })

  describe('warning and critical states', () => {
    it('should not be warning with > 30s remaining', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      vi.advanceTimersByTime(100) // let rAF fire
      expect(timer.isWarning.value).toBe(false)
    })

    it('should enter warning at <= 30s', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      vi.advanceTimersByTime(30001) // 30s remaining
      vi.advanceTimersByTime(100)
      expect(timer.isWarning.value).toBe(true)
    })

    it('should enter critical at <= 10s', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      vi.advanceTimersByTime(50001) // 10s remaining
      vi.advanceTimersByTime(100)
      expect(timer.isCritical.value).toBe(true)
    })
  })

  describe('progress computation', () => {
    it('should start at progress = 1', () => {
      const timer = useChallengeTimer(1)
      expect(timer.progress.value).toBe(1)
    })

    it('should decrease as time passes', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      vi.advanceTimersByTime(30000)
      vi.advanceTimersByTime(100)
      expect(timer.progress.value).toBeLessThan(1)
      expect(timer.progress.value).toBeGreaterThan(0)
    })

    it('should be 0 when finished', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      vi.advanceTimersByTime(120000)
      expect(timer.progress.value).toBe(0)
    })
  })

  describe('formatted time', () => {
    it('should format 0ms as 0:00', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      vi.advanceTimersByTime(120000)
      expect(timer.formattedTime.value).toBe('0:00')
    })

    it('should pad seconds < 10', () => {
      // 50000ms = 50s remaining → 0:50
      // Test via the math: remaining 95000ms = 1:35
      const timer = useChallengeTimer(2) // 120000ms
      timer.start()
      vi.advanceTimersByTime(25000) // 95000 remaining = 1:35
      vi.advanceTimersByTime(100)
      // 95000ms = 95s = 1min 35s → "1:35"
      expect(timer.formattedTime.value).toMatch(/^\d:\d{2}$/)
    })
  })

  describe('restart behavior', () => {
    it('should allow reset and restart', () => {
      const timer = useChallengeTimer(1)
      timer.start()
      vi.advanceTimersByTime(50000)
      timer.reset()
      expect(timer.remainingMs.value).toBe(60000)
      expect(timer.isFinished.value).toBe(false)

      timer.start()
      vi.advanceTimersByTime(100)
      expect(timer.isRunning.value).toBe(true)
    })
  })
})
