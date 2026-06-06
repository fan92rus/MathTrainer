import { describe, it, expect, beforeEach } from 'vitest'
import { useBlocks } from '../useBlocks'
import { DRAGONBOX_COLORS } from '@/types/blocks'

describe('useBlocks - edge cases and bug regression tests', () => {
  function freshBlocks(unitWidth = 36, blockHeight = 48) {
    return useBlocks(unitWidth, blockHeight)
  }

  describe('combineBlocks - same block bug', () => {
    it('should NOT combine a block with itself', () => {
      const { createBlock, combineBlocks, blocks } = freshBlocks()
      const a = createBlock(3, 50, 0)

      // Self-combine should be prevented
      const result = combineBlocks(a.id, a.id)
      expect(result).toBeNull()
      expect(blocks.value).toHaveLength(1)
      expect(blocks.value[0]!.value).toBe(3) // unchanged
    }) 
  })

  describe('combineBlocks - value boundary edge cases', () => {
    it('should combine 1 + 1 = 2 (minimum possible)', () => {
      const { createBlock, combineBlocks, blocks } = freshBlocks()
      const a = createBlock(1, 0, 0)
      const b = createBlock(1, 100, 0)
      const result = combineBlocks(a.id, b.id)
      expect(result).not.toBeNull()
      expect(result!.value).toBe(2)
      expect(blocks.value).toHaveLength(1)
    })

    it('should combine 5 + 5 = 10 (exact max)', () => {
      const { createBlock, combineBlocks } = freshBlocks()
      const a = createBlock(5, 0, 0)
      const b = createBlock(5, 200, 0)
      const result = combineBlocks(a.id, b.id)
      expect(result).not.toBeNull()
      expect(result!.value).toBe(10)
    })

    it('should NOT combine 6 + 5 = 11 (exceeds max)', () => {
      const { createBlock, combineBlocks, blocks } = freshBlocks()
      const a = createBlock(6, 0, 0)
      const b = createBlock(5, 200, 0)
      const result = combineBlocks(a.id, b.id)
      expect(result).toBeNull()
      expect(blocks.value).toHaveLength(2) // Both still exist
    })

    it('should NOT combine 9 + 2 = 11 (exceeds max)', () => {
      const { createBlock, combineBlocks } = freshBlocks()
      const a = createBlock(9, 0, 0)
      const b = createBlock(2, 200, 0)
      expect(combineBlocks(a.id, b.id)).toBeNull()
    })

    it('should combine values that sum to exactly 10', () => {
      const pairs = [[1,9],[2,8],[3,7],[4,6],[5,5]]
      for (const [va, vb] of pairs) {
        const { createBlock, combineBlocks } = freshBlocks()
        const a = createBlock(va, 0, 0)
        const b = createBlock(vb, 200, 0)
        const result = combineBlocks(a.id, b.id)
        expect(result).not.toBeNull()
        expect(result!.value).toBe(10)
      }
    })
  })

  describe('createBlock - value validation', () => {
    it('should create block with value 0 (edge case)', () => {
      const { createBlock, blocks, totalValue } = freshBlocks()
      const b = createBlock(0, 0, 0)
      expect(b.value).toBe(0)
      expect(b.width).toBe(0) // 0 * 36 = 0
      expect(totalValue.value).toBe(0)
      expect(blocks.value).toHaveLength(1)
    })

    it('should create block with value 10 (max)', () => {
      const { createBlock } = freshBlocks()
      const b = createBlock(10, 0, 0)
      expect(b.value).toBe(10)
      expect(b.width).toBe(360)
    })

    it('should create block with value > 10 (no validation)', () => {
      const { createBlock } = freshBlocks()
      const b = createBlock(15, 0, 0)
      expect(b.value).toBe(15)
      // Color should fallback since 15 not in DRAGONBOX_COLORS
      expect(b.color).toBe('#888')
    })
  })

  describe('combineBlocks - sequential operations', () => {
    it('should correctly track blocks after multiple combines', () => {
      const { createBlock, combineBlocks, blocks, totalValue } = freshBlocks()
      const a = createBlock(2, 0, 0)
      const b = createBlock(3, 100, 0)
      const c = createBlock(1, 200, 0)

      expect(blocks.value).toHaveLength(3)
      expect(totalValue.value).toBe(6)

      // Combine a + b = 5
      const ab = combineBlocks(a.id, b.id)!
      expect(ab.value).toBe(5)
      expect(blocks.value).toHaveLength(2) // ab + c
      expect(totalValue.value).toBe(6) // 5 + 1

      // Combine ab + c = 6
      const abc = combineBlocks(ab.id, c.id)!
      expect(abc.value).toBe(6)
      expect(blocks.value).toHaveLength(1)
      expect(totalValue.value).toBe(6)
    })

    it('should NOT allow combining result > 10 in chain', () => {
      const { createBlock, combineBlocks, blocks } = freshBlocks()
      const a = createBlock(4, 0, 0)
      const b = createBlock(5, 100, 0)
      const c = createBlock(3, 200, 0)

      // Combine a + b = 9
      const ab = combineBlocks(a.id, b.id)!
      expect(ab.value).toBe(9)

      // Try combine 9 + 3 = 12 → should fail
      expect(combineBlocks(ab.id, c.id)).toBeNull()
      expect(blocks.value).toHaveLength(2) // ab(9) + c(3) still there
    })

    it('should handle combining after a failed combine attempt', () => {
      const { createBlock, combineBlocks, blocks } = freshBlocks()
      const a = createBlock(6, 0, 0)
      const b = createBlock(5, 100, 0)

      // Failed combine (11 > 10)
      expect(combineBlocks(a.id, b.id)).toBeNull()
      expect(blocks.value).toHaveLength(2)

      // Should still work with same blocks after reset... but no reset
      // Try again - should still fail
      expect(combineBlocks(a.id, b.id)).toBeNull()
    })
  })

  describe('splitBlock - edge cases', () => {
    it('should NOT split block of value 1 (smallest possible)', () => {
      const { createBlock, splitBlock } = freshBlocks()
      const b = createBlock(1, 100, 0)
      // Any split of 1 would require 0 or negative remainder
      expect(splitBlock(b.id, 1)).toBeNull() // 1 - 1 = 0, not > 0
      expect(splitBlock(b.id, 0)).toBeNull()
    })

    it('should split block of value 2 into 1+1', () => {
      const { createBlock, splitBlock, blocks } = freshBlocks()
      const b = createBlock(2, 100, 0)
      const result = splitBlock(b.id, 1)!
      expect(result[0].value).toBe(1)
      expect(result[1].value).toBe(1)
      expect(blocks.value).toHaveLength(2)
    })

    it('should split 10 into 9+1, 5+5, 1+9', () => {
      for (const splitAt of [1, 5, 9]) {
        const { createBlock, splitBlock } = freshBlocks()
        const b = createBlock(10, 200, 0)
        const result = splitBlock(b.id, splitAt)!
        expect(result[0].value).toBe(splitAt)
        expect(result[1].value).toBe(10 - splitAt)
      }
    })

    it('should place split blocks at correct positions', () => {
      const { createBlock, splitBlock } = freshBlocks()
      const unitWidth = 36
      const b = createBlock(5, 200, 100)
      const result = splitBlock(b.id, 2)!
      // First block: x - unitWidth
      expect(result[0].x).toBe(200 - unitWidth)
      // Second block: x + valueA * unitWidth
      expect(result[1].x).toBe(200 + 2 * unitWidth)
    })
  })

  describe('areNearby - edge cases', () => {
    it('should return true for blocks at exact threshold boundary', () => {
      const { createBlock, areNearby } = freshBlocks()
      const a = createBlock(1, 0, 0) // center at 18
      const b = createBlock(1, 0, 0) // center at 18
      // dx = 0, dy = 0 → within any threshold
      expect(areNearby(a.id, b.id, 50)).toBe(true)
    })

    it('should return false for blocks far apart', () => {
      const { createBlock, areNearby } = freshBlocks()
      const a = createBlock(1, 0, 0) // center at 18
      const b = createBlock(1, 500, 500) // center at 518
      expect(areNearby(a.id, b.id, 50)).toBe(false)
    })

    it('should check Y distance too', () => {
      const { createBlock, areNearby } = freshBlocks()
      const a = createBlock(1, 100, 0) // center: (118, 24)
      const b = createBlock(1, 100, 200) // center: (118, 224)
      // dx = 0, dy = 200 → NOT nearby with threshold 50
      expect(areNearby(a.id, b.id, 50)).toBe(false)
      // But nearby with large threshold
      expect(areNearby(a.id, b.id, 250)).toBe(true)
    })
  })

  describe('totalValue - reactivity', () => {
    it('should update totalValue after create', () => {
      const { createBlock, totalValue } = freshBlocks()
      createBlock(3, 0, 0)
      expect(totalValue.value).toBe(3)
      createBlock(7, 100, 0)
      expect(totalValue.value).toBe(10)
    })

    it('should update totalValue after combine', () => {
      const { createBlock, combineBlocks, totalValue } = freshBlocks()
      createBlock(3, 0, 0)
      createBlock(4, 100, 0)
      expect(totalValue.value).toBe(7)
      combineBlocks(1, 2)
      expect(totalValue.value).toBe(7) // sum is preserved
    })

    it('should update totalValue after split', () => {
      const { createBlock, splitBlock, totalValue } = freshBlocks()
      createBlock(5, 100, 0)
      expect(totalValue.value).toBe(5)
      splitBlock(1, 2)
      expect(totalValue.value).toBe(5) // 2 + 3 = 5
    })

    it('should update totalValue after reset', () => {
      const { createBlock, totalValue, reset } = freshBlocks()
      createBlock(5, 0, 0)
      createBlock(3, 100, 0)
      expect(totalValue.value).toBe(8)
      reset()
      expect(totalValue.value).toBe(0)
    })
  })

  describe('id counter after reset', () => {
    it('should reset id counter on reset', () => {
      const { createBlock, reset, blocks } = freshBlocks()
      const first = createBlock(1, 0, 0)
      expect(first.id).toBe(1)
      createBlock(2, 0, 0)
      reset()
      const after = createBlock(1, 0, 0)
      // After reset, counter resets to 0, so next id is 1 again
      expect(after.id).toBe(1)
    })
  })
})
