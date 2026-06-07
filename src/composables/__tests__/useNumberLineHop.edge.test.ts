import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNumberLineHop } from '../useNumberLineHop'

describe('useNumberLineHop - edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('wrong-answer sequence (two jumps with pause)', () => {
    it('should complete two jumps in sequence', async () => {
      const { markerPosition, jumpPhase, animateJump } = useNumberLineHop({ min: 0, max: 20, step: 1 })

      markerPosition.value = 5

      // First jump: from start (5) to wrong value (14)
      const jump1 = animateJump(5, 14, 400)
      vi.advanceTimersByTime(800) // 150+400+200=750ms + buffer
      await jump1
      expect(markerPosition.value).toBe(14)

      // Second jump: from wrong (14) back to start (5)
      const jump2 = animateJump(14, 5, 400)
      vi.advanceTimersByTime(800) // 150+400+200=750ms + buffer
      await jump2
      expect(markerPosition.value).toBe(5)
    })

    it('should maintain clean state between jumps', async () => {
      const { markerPosition, jumpAnimation, jumpPhase, animateJump } = useNumberLineHop({ min: 0, max: 20, step: 1 })

      markerPosition.value = 5

      // Simulate wrong-answer: first jump to wrong answer
      const jump1 = animateJump(5, 14, 400)
      vi.advanceTimersByTime(800)
      await jump1

      // After first jump, animation should be done
      expect(jumpAnimation.value).toBeNull()
      expect(jumpPhase.value).toBe('done')
      expect(markerPosition.value).toBe(14)

      // Simulate the 600ms pause
      vi.advanceTimersByTime(600)

      // Second jump: back to start
      const jump2 = animateJump(14, 5, 400)
      vi.advanceTimersByTime(800)
      await jump2

      expect(markerPosition.value).toBe(5)
      expect(jumpAnimation.value).toBeNull()
    })

    it('should produce arcs for each jump and auto-clear them', async () => {
      const { jumpArcs, markerPosition, animateJump } = useNumberLineHop({ min: 0, max: 20, step: 1 })

      markerPosition.value = 5

      // First jump: arc pushed at ~550ms (150+400)
      const jump1 = animateJump(5, 14, 400)
      vi.advanceTimersByTime(800)
      await jump1
      expect(jumpArcs.value.length).toBe(1)

      // 600ms pause
      vi.advanceTimersByTime(600)

      // First arc timer: pushed at ~550ms, cleared at ~550+600=1150ms
      // Current time is 1400ms, so first arc may already be cleared

      // Second jump
      const jump2 = animateJump(14, 5, 400)
      vi.advanceTimersByTime(800)
      await jump2

      // Second arc was pushed at ~1400+550=1950ms
      // At time 2200ms (1400+800), second arc exists, first may be gone
      expect(jumpArcs.value.length).toBeGreaterThanOrEqual(1)

      // Advance past 600ms from second arc push
      vi.advanceTimersByTime(700)
      expect(jumpArcs.value.length).toBe(0)
    })
  })

  describe('bounce-in-place (same position)', () => {
    it('should start animation even when from === to', async () => {
      const { jumpAnimation, jumpPhase, animateJump } = useNumberLineHop({ min: 0, max: 10, step: 1 })

      const promise = animateJump(3, 3, 300)

      expect(jumpAnimation.value).not.toBeNull()
      expect(jumpAnimation.value!.from).toBe(3)
      expect(jumpAnimation.value!.to).toBe(3)
      expect(jumpPhase.value).toBe('preparing')

      vi.advanceTimersByTime(700)
      await promise
    })

    it('should produce an arc for same-position jump', async () => {
      const { jumpArcs, animateJump } = useNumberLineHop({ min: 0, max: 10, step: 1 })

      const promise = animateJump(3, 3, 300)
      vi.advanceTimersByTime(700)
      await promise

      expect(jumpArcs.value.length).toBe(1)
      expect(jumpArcs.value[0].from).toBe(3)
      expect(jumpArcs.value[0].to).toBe(3)
    })

    it('should not change marker position when from === to', async () => {
      const { markerPosition, animateJump } = useNumberLineHop({ min: 0, max: 10, step: 1 })

      markerPosition.value = 7
      const promise = animateJump(7, 7, 300)
      vi.advanceTimersByTime(700)
      await promise

      expect(markerPosition.value).toBe(7)
    })
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
