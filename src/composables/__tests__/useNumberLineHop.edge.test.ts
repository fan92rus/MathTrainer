import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNumberLineHop } from '../useNumberLineHop'

describe('useNumberLineHop - edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('range edge cases', () => {
    it('should handle range [0, 10] with step 1', () => {
      const hop = useNumberLineHop({ min: 0, max: 10, step: 1 })
      expect(hop.tickNumbers.value).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle range [0, 20] with step 2', () => {
      const hop = useNumberLineHop({ min: 0, max: 20, step: 2 })
      expect(hop.tickNumbers.value).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20])
    })

    it('should handle range [5, 15] with step 5', () => {
      const hop = useNumberLineHop({ min: 5, max: 15, step: 5 })
      expect(hop.tickNumbers.value).toEqual([5, 10, 15])
    })

    it('should handle single-number range [5, 5] step 1', () => {
      const hop = useNumberLineHop({ min: 5, max: 5, step: 1 })
      expect(hop.tickNumbers.value).toEqual([5])
    })

    it('should handle min > max gracefully', () => {
      const hop = useNumberLineHop({ min: 10, max: 5, step: 1 })
      // Loop doesn't execute
      expect(hop.tickNumbers.value).toEqual([])
    })
  })

  describe('positionForNumber', () => {
    it('should return 0 for min value', () => {
      const hop = useNumberLineHop({ min: 0, max: 10, step: 1 })
      expect(hop.positionForNumber(0)).toBe(0)
    })

    it('should increase linearly', () => {
      const hop = useNumberLineHop({ min: 0, max: 10, step: 1 })
      const p0 = hop.positionForNumber(0)
      const p5 = hop.positionForNumber(5)
      const p10 = hop.positionForNumber(10)
      expect(p5).toBeGreaterThan(p0)
      expect(p10).toBeGreaterThan(p5)
    })

    it('should handle non-zero min', () => {
      const hop = useNumberLineHop({ min: 5, max: 15, step: 1 })
      expect(hop.positionForNumber(5)).toBe(0)
      expect(hop.positionForNumber(10)).toBeGreaterThan(0)
    })
  })

  describe('tickWidth computation', () => {
    it('should compute wider ticks for fewer numbers', () => {
      const hop3 = useNumberLineHop({ min: 0, max: 2, step: 1 }) // 3 ticks
      const hop11 = useNumberLineHop({ min: 0, max: 10, step: 1 }) // 11 ticks
      expect(hop3.tickWidth.value).toBeGreaterThan(hop11.tickWidth.value)
    })

    it('should be at least 28px', () => {
      const hop = useNumberLineHop({ min: 0, max: 100, step: 1 }) // 101 ticks
      expect(hop.tickWidth.value).toBeGreaterThanOrEqual(28)
    })

    it('should be at most 60px', () => {
      const hop = useNumberLineHop({ min: 0, max: 2, step: 1 }) // 3 ticks
      expect(hop.tickWidth.value).toBeLessThanOrEqual(60)
    })
  })

  describe('reset', () => {
    it('should reset marker to range min', () => {
      const hop = useNumberLineHop({ min: 3, max: 10, step: 1 })
      hop.reset()
      expect(hop.markerPosition.value).toBe(3)
    })

    it('should clear all state', () => {
      const hop = useNumberLineHop({ min: 0, max: 10, step: 1 })
      hop.waitForTap({ start: 3, type: 'add', step: 4, answer: 7 })
      hop.reset()
      expect(hop.jumpPhase.value).toBe('idle')
      expect(hop.jumpArcs.value).toHaveLength(0)
      expect(hop.targetPosition.value).toBeNull()
      expect(hop.isWaitingForTap.value).toBe(false)
    })
  })

  describe('waitForTap', () => {
    it('should set target position', () => {
      const hop = useNumberLineHop({ min: 0, max: 10, step: 1 })
      hop.waitForTap({ start: 3, type: 'add', step: 4, answer: 7 })
      expect(hop.targetPosition.value).toBe(7)
    })

    it('should set marker to operation start', () => {
      const hop = useNumberLineHop({ min: 0, max: 10, step: 1 })
      hop.waitForTap({ start: 5, type: 'add', step: 3, answer: 8 })
      expect(hop.markerPosition.value).toBe(5)
    })

    it('should enable waiting mode', () => {
      const hop = useNumberLineHop({ min: 0, max: 10, step: 1 })
      hop.waitForTap({ start: 0, type: 'add', step: 5, answer: 5 })
      expect(hop.isWaitingForTap.value).toBe(true)
    })

    it('should clear jump arcs', () => {
      const hop = useNumberLineHop({ min: 0, max: 10, step: 1 })
      hop.waitForTap({ start: 0, type: 'add', step: 5, answer: 5 })
      expect(hop.jumpArcs.value).toHaveLength(0)
    })
  })

  describe('handleTap - edge cases', () => {
    it('should return false when not waiting for tap', async () => {
      const hop = useNumberLineHop({ min: 0, max: 10, step: 1 })
      const result = await hop.handleTap(5)
      expect(result).toBe(false)
    }) 
  })

  describe('initial state', () => {
    it('should start at idle', () => {
      const hop = useNumberLineHop({ min: 0, max: 10, step: 1 })
      expect(hop.jumpPhase.value).toBe('idle')
    })

    it('should start with no arcs', () => {
      const hop = useNumberLineHop({ min: 0, max: 10, step: 1 })
      expect(hop.jumpArcs.value).toHaveLength(0)
    })

    it('should start not waiting', () => {
      const hop = useNumberLineHop({ min: 0, max: 10, step: 1 })
      expect(hop.isWaitingForTap.value).toBe(false)
    })
  })
})
