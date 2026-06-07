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
