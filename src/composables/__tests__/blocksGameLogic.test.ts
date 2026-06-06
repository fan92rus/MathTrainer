/**
 * Integration-level tests for the Blocks Playground game logic.
 * Tests the same logic used in BlocksPlaygroundView.vue without DOM.
 */
import { describe, it, expect } from 'vitest'
import { useBlocks } from '@/composables/useBlocks'

/**
 * Simulates the game logic from BlocksPlaygroundView.vue
 * to test the exact flow that had the celebration bug.
 */
function simulateBlocksGame() {
  const {
    blocks,
    totalValue,
    createBlock,
    moveBlock,
    combineBlocks,
    reset,
  } = useBlocks(36, 52)

  let targetValue = 0
  let solvedCount = 0
  let showCelebration = false

  function generateFromParts(parts: number[], target: number) {
    reset()
    targetValue = target
    let offsetX = 20
    for (const part of parts) {
      createBlock(part, offsetX, 60)
      offsetX += part * 36 + 16
    }
  }

  function onBlocksCombined(idA: number, idB: number) {
    const combined = combineBlocks(idA, idB)
    if (!combined) return null

    // BUG WAS: totalValue === targetValue (triggers on ANY combine that preserves sum)
    // FIX: Celebrate ONLY when exactly 1 block remains AND matches target
    if (blocks.value.length === 1 && blocks.value[0]!.value === targetValue) {
      showCelebration = true
      solvedCount++
      return { success: true, value: combined.value }
    } else if (blocks.value.length === 1 && blocks.value[0]!.value !== targetValue) {
      return { success: false, wrongValue: true, value: combined.value }
    }
    return { success: false, value: combined.value }
  }

  return {
    blocks, totalValue, targetValue: () => targetValue,
    solvedCount: () => solvedCount,
    showCelebration: () => showCelebration,
    generateFromParts,
    combineBlocks: onBlocksCombined,
  }
}

describe('BlocksPlaygroundView — game logic regression tests', () => {
  describe('BUG FIX: celebration only on single correct block', () => {
    it('should NOT celebrate when 2 of 3 blocks combine (sum matches but not single block)', () => {
      const game = simulateBlocksGame()
      // Target = 6, parts = [1, 2, 3] → sum = 6
      game.generateFromParts([1, 2, 3], 6)

      // Combine first two blocks: 1 + 2 = 3 → blocks are [3, 3]
      const block1 = game.blocks.value[0]!
      const block2 = game.blocks.value[1]!
      const result = game.combineBlocks(block1.id, block2.id)

      expect(result).not.toBeNull()
      expect(result!.success).toBe(false) // NOT celebrated
      expect(game.showCelebration()).toBe(false) // Critical bug fix verified
      expect(game.blocks.value).toHaveLength(2) // [3, 3]
    })

    it('should celebrate when all blocks combined into one matching target', () => {
      const game = simulateBlocksGame()
      game.generateFromParts([2, 3], 5)

      const block1 = game.blocks.value[0]!
      const block2 = game.blocks.value[1]!
      const result = game.combineBlocks(block1.id, block2.id)

      expect(result!.success).toBe(true)
      expect(game.showCelebration()).toBe(true)
      expect(game.solvedCount()).toBe(1)
      expect(game.blocks.value).toHaveLength(1)
      expect(game.blocks.value[0]!.value).toBe(5)
    })

    it('should NOT celebrate when 3 blocks combined partially to wrong value', () => {
      const game = simulateBlocksGame()
      game.generateFromParts([3, 4, 3], 10)

      // Combine first two: 3 + 4 = 7 → blocks are [7, 3]
      const b0 = game.blocks.value[0]!
      const b1 = game.blocks.value[1]!
      const result1 = game.combineBlocks(b0.id, b1.id)

      expect(result1!.success).toBe(false)
      expect(game.blocks.value).toHaveLength(2) // [7, 3]

      // Now combine remaining: 7 + 3 = 10 → single block matching target
      const b2 = game.blocks.value[0]!
      const b3 = game.blocks.value[1]!
      const result2 = game.combineBlocks(b2.id, b3.id)

      expect(result2!.success).toBe(true)
      expect(game.showCelebration()).toBe(true)
    })

    it('should restart when single block has wrong value', () => {
      const game = simulateBlocksGame()
      // Target = 8, but we only give [3, 3] → combine = 6 ≠ 8
      game.generateFromParts([3, 3], 8)

      const b0 = game.blocks.value[0]!
      const b1 = game.blocks.value[1]!
      const result = game.combineBlocks(b0.id, b1.id)

      expect(result!.success).toBe(false)
      expect(result!.wrongValue).toBe(true)
      expect(game.showCelebration()).toBe(false)
    })
  })

  describe('combine exceeding 10', () => {
    it('should NOT combine blocks whose sum exceeds 10', () => {
      const game = simulateBlocksGame()
      game.generateFromParts([7, 5], 12) // impossible!

      const b0 = game.blocks.value[0]!
      const b1 = game.blocks.value[1]!
      const result = game.combineBlocks(b0.id, b1.id)

      expect(result).toBeNull() // combine refused
      expect(game.showCelebration()).toBe(false)
      expect(game.blocks.value).toHaveLength(2) // both still there
    })
  })

  describe('self-combine prevention', () => {
    it('should NOT allow combining a block with itself', () => {
      const game = simulateBlocksGame()
      game.generateFromParts([5, 3], 8)

      const b0 = game.blocks.value[0]!
      // Try to combine block with itself
      const result = game.combineBlocks(b0.id, b0.id)
      expect(result).toBeNull()
      expect(game.blocks.value).toHaveLength(2)
      expect(game.showCelebration()).toBe(false)
    })
  })

  describe('2-block problems', () => {
    const twoBlockProblems = [
      { parts: [1, 2], target: 3 },
      { parts: [2, 3], target: 5 },
      { parts: [3, 4], target: 7 },
      { parts: [3, 7], target: 10 },
    ]

    for (const { parts, target } of twoBlockProblems) {
      it(`should solve [${parts.join(', ')}] → ${target}`, () => {
        const game = simulateBlocksGame()
        game.generateFromParts(parts, target)

        const b0 = game.blocks.value[0]!
        const b1 = game.blocks.value[1]!
        const result = game.combineBlocks(b0.id, b1.id)

        expect(result!.success).toBe(true)
        expect(game.blocks.value[0]!.value).toBe(target)
      })
    }
  })

  describe('3-block problems', () => {
    it('should require combining ALL 3 blocks', () => {
      const game = simulateBlocksGame()
      game.generateFromParts([1, 3, 4], 8)

      // First combine: 1 + 3 = 4 → [4, 4]
      const b0 = game.blocks.value[0]!
      const b1 = game.blocks.value[1]!
      const r1 = game.combineBlocks(b0.id, b1.id)
      expect(r1!.success).toBe(false) // Still 2 blocks
      expect(game.showCelebration()).toBe(false)

      // Second combine: 4 + 4 = 8 → single block
      const b2 = game.blocks.value[0]!
      const b3 = game.blocks.value[1]!
      const r2 = game.combineBlocks(b2.id, b3.id)
      expect(r2!.success).toBe(true)
      expect(game.showCelebration()).toBe(true)
    })

    it('should handle 3-block problem with different combine order', () => {
      const game = simulateBlocksGame()
      game.generateFromParts([2, 3, 5], 10)

      // Combine last two first: 3 + 5 = 8 → [2, 8]
      const b1 = game.blocks.value[1]!
      const b2 = game.blocks.value[2]!
      const r1 = game.combineBlocks(b1.id, b2.id)
      expect(r1!.success).toBe(false)

      // Combine remaining: 2 + 8 = 10 → single block
      const b0 = game.blocks.value[0]!
      const b3 = game.blocks.value[1]!
      const r2 = game.combineBlocks(b0.id, b3.id)
      expect(r2!.success).toBe(true)
      expect(game.blocks.value[0]!.value).toBe(10)
    })
  })
})
