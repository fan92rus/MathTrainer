import { describe, it, expect, beforeEach } from 'vitest'
import { useBlocks } from '../useBlocks'
import { DRAGONBOX_COLORS } from '@/types/blocks'

describe('useBlocks', () => {
  function freshBlocks(unitWidth = 36, blockHeight = 48) {
    return useBlocks(unitWidth, blockHeight)
  }

  it('should initialize with empty blocks', () => {
    const { blocks, totalValue } = freshBlocks()
    expect(blocks.value).toHaveLength(0)
    expect(totalValue.value).toBe(0)
  })

  it('should create a block with correct properties', () => {
    const { createBlock, blocks } = freshBlocks()
    const block = createBlock(5, 100, 200)

    expect(blocks.value).toHaveLength(1)
    expect(block.value).toBe(5)
    expect(block.x).toBe(100)
    expect(block.y).toBe(200)
    expect(block.width).toBe(5 * 36) // value * unitWidth
    expect(block.height).toBe(48)
    expect(block.state).toBe('idle')
    expect(block.color).toBe(DRAGONBOX_COLORS[5])
    expect(block.id).toBeGreaterThan(0)
  })

  it('should assign unique ids to blocks', () => {
    const { createBlock, blocks } = freshBlocks()
    const a = createBlock(3, 0, 0)
    const b = createBlock(4, 100, 0)
    expect(a.id).not.toBe(b.id)
  })

  it('should use DragonBox color based on value', () => {
    const { createBlock } = freshBlocks()
    const b1 = createBlock(1, 0, 0)
    const b3 = createBlock(3, 0, 0)
    const b10 = createBlock(10, 0, 0)
    expect(b1.color).toBe(DRAGONBOX_COLORS[1])
    expect(b3.color).toBe(DRAGONBOX_COLORS[3])
    expect(b10.color).toBe(DRAGONBOX_COLORS[10])
  })

  it('should use fallback color for unknown values', () => {
    const { createBlock } = freshBlocks()
    // Values 1-10 have colors, value 0 should get fallback
    const b = createBlock(0, 0, 0)
    expect(b.color).toBe('#888')
  })

  it('should find block by id', () => {
    const { createBlock, findBlock } = freshBlocks()
    const block = createBlock(5, 10, 20)
    const found = findBlock(block.id)
    expect(found).toBeDefined()
    expect(found!.value).toBe(5)
  })

  it('should return undefined for non-existent block id', () => {
    const { findBlock } = freshBlocks()
    expect(findBlock(999)).toBeUndefined()
  })

  it('should move block position and set state to dragging', () => {
    const { createBlock, moveBlock, findBlock } = freshBlocks()
    const block = createBlock(3, 0, 0)
    moveBlock(block.id, 150, 250)

    const moved = findBlock(block.id)!
    expect(moved.x).toBe(150)
    expect(moved.y).toBe(250)
    expect(moved.state).toBe('dragging')
  })

  it('should do nothing when moving non-existent block', () => {
    const { moveBlock, blocks } = freshBlocks()
    moveBlock(999, 100, 100)
    expect(blocks.value).toHaveLength(0)
  })

  it('should combine two blocks into one with sum value', () => {
    const { createBlock, combineBlocks, blocks } = freshBlocks()
    const a = createBlock(3, 50, 0)
    const b = createBlock(4, 150, 0)

    const result = combineBlocks(a.id, b.id)

    expect(result).not.toBeNull()
    expect(result!.value).toBe(7) // 3 + 4
    expect(blocks.value).toHaveLength(1) // old blocks removed, new added
    expect(result!.width).toBe(7 * 36)
  })

  it('should place combined block at midpoint', () => {
    const { createBlock, combineBlocks } = freshBlocks()
    const a = createBlock(2, 100, 200)
    const b = createBlock(3, 200, 300)

    const result = combineBlocks(a.id, b.id)!
    expect(result.x).toBe(150) // midpoint of 100 and 200
    expect(result.y).toBe(250) // midpoint of 200 and 300
  })

  it('should return null when combining blocks that exceed 10', () => {
    const { createBlock, combineBlocks, blocks } = freshBlocks()
    const a = createBlock(6, 0, 0)
    const b = createBlock(5, 100, 0)

    const result = combineBlocks(a.id, b.id)
    expect(result).toBeNull()
    // Original blocks should still exist
    expect(blocks.value).toHaveLength(2)
  })

  it('should return null when combining non-existent blocks', () => {
    const { combineBlocks } = freshBlocks()
    expect(combineBlocks(1, 2)).toBeNull()
  })

  it('should combine exactly to 10', () => {
    const { createBlock, combineBlocks, blocks } = freshBlocks()
    const a = createBlock(7, 0, 0)
    const b = createBlock(3, 100, 0)

    const result = combineBlocks(a.id, b.id)
    expect(result).not.toBeNull()
    expect(result!.value).toBe(10)
    expect(blocks.value).toHaveLength(1)
  })

  it('should split block into two', () => {
    const { createBlock, splitBlock, blocks } = freshBlocks()
    const original = createBlock(5, 100, 200)

    const result = splitBlock(original.id, 2)

    expect(result).not.toBeNull()
    expect(blocks.value).toHaveLength(2) // original removed, two new added
    expect(result![0].value).toBe(2)
    expect(result![1].value).toBe(3) // 5 - 2
  })

  it('should return null when splitting non-existent block', () => {
    const { splitBlock } = freshBlocks()
    expect(splitBlock(999, 3)).toBeNull()
  })

  it('should return null when split value is <= 0', () => {
    const { createBlock, splitBlock } = freshBlocks()
    const block = createBlock(5, 0, 0)
    expect(splitBlock(block.id, 0)).toBeNull()
    expect(splitBlock(block.id, -1)).toBeNull()
  })

  it('should return null when split value >= block value', () => {
    const { createBlock, splitBlock } = freshBlocks()
    const block = createBlock(5, 0, 0)
    expect(splitBlock(block.id, 5)).toBeNull() // would leave 0
    expect(splitBlock(block.id, 6)).toBeNull() // would leave negative
  })

  it('should split block into exact parts', () => {
    const { createBlock, splitBlock } = freshBlocks()
    const block = createBlock(10, 200, 100)
    const result = splitBlock(block.id, 7)!
    expect(result[0].value).toBe(7)
    expect(result[1].value).toBe(3)
  })

  it('should detect nearby blocks within threshold', () => {
    const { createBlock, areNearby } = freshBlocks()
    // Blocks at same Y, close X (within 50px threshold)
    const a = createBlock(3, 100, 100) // center: 100 + 3*36/2 = 154
    const b = createBlock(4, 170, 100) // center: 170 + 4*36/2 = 242
    // dx = |154 - 242| = 88 > 50, so NOT nearby with default threshold
    expect(areNearby(a.id, b.id, 100)).toBe(true)
    expect(areNearby(a.id, b.id, 50)).toBe(false)
  })

  it('should return false for nearby check with non-existent blocks', () => {
    const { areNearby } = freshBlocks()
    expect(areNearby(1, 2)).toBe(false)
  })

  it('should find block by value', () => {
    const { createBlock, getBlockByValue } = freshBlocks()
    createBlock(3, 0, 0)
    createBlock(7, 100, 0)
    createBlock(3, 200, 0) // second block with value 3

    const found = getBlockByValue(3)
    expect(found).toBeDefined()
    expect(found!.value).toBe(3)
    // Should return first match
    expect(found!.x).toBe(0)
  })

  it('should return undefined for non-existent value', () => {
    const { getBlockByValue } = freshBlocks()
    expect(getBlockByValue(99)).toBeUndefined()
  })

  it('should compute totalValue as sum of all blocks', () => {
    const { createBlock, totalValue } = freshBlocks()
    expect(totalValue.value).toBe(0)
    createBlock(3, 0, 0)
    expect(totalValue.value).toBe(3)
    createBlock(5, 100, 0)
    expect(totalValue.value).toBe(8)
    createBlock(2, 200, 0)
    expect(totalValue.value).toBe(10)
  })

  it('should reset all blocks', () => {
    const { createBlock, blocks, totalValue, reset } = freshBlocks()
    createBlock(3, 0, 0)
    createBlock(5, 100, 0)
    reset()
    expect(blocks.value).toHaveLength(0)
    expect(totalValue.value).toBe(0)
  })

  it('should allow creating blocks after reset', () => {
    const { createBlock, blocks, reset } = freshBlocks()
    createBlock(3, 0, 0)
    reset()
    createBlock(7, 100, 200)
    expect(blocks.value).toHaveLength(1)
    expect(blocks.value[0].value).toBe(7)
  })

  it('should respect custom unitWidth', () => {
    const { createBlock } = freshBlocks(50, 60)
    const block = createBlock(4, 0, 0)
    expect(block.width).toBe(4 * 50)
    expect(block.height).toBe(60)
  })
})
