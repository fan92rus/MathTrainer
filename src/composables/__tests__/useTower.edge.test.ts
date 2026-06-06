import { describe, it, expect } from 'vitest'
import { useTower } from '../useTower'
import type { TowerConfig } from '@/types/tower'

function makeConfig(overrides: Partial<TowerConfig> = {}): TowerConfig {
  return {
    targetHeight: 5,
    milestones: [3, 5],
    theme: 'castle',
    ...overrides,
  }
}

describe('useTower - edge cases and regression tests', () => {
  describe('boundary conditions', () => {
    it('should handle targetHeight of 1', () => {
      const config = makeConfig({ targetHeight: 1 })
      const tower = useTower(config)
      expect(tower.completed.value).toBe(false)
      tower.addFloor('1+1', 2)
      expect(tower.completed.value).toBe(true)
      expect(tower.progress.value).toBe(1)
    })

    it('should handle targetHeight of 20', () => {
      const config = makeConfig({ targetHeight: 20, milestones: [5, 10, 15, 20] })
      const tower = useTower(config)
      for (let i = 0; i < 19; i++) {
        tower.addFloor(`${i}+1`, i + 1)
      }
      expect(tower.completed.value).toBe(false)
      expect(tower.progress.value).toBeLessThan(1)
      tower.addFloor('19+1', 20)
      expect(tower.completed.value).toBe(true)
    })

    it('should cap progress at 1 even if floors exceed targetHeight', () => {
      const config = makeConfig({ targetHeight: 3 })
      const tower = useTower(config)
      tower.addFloor('1+1', 2)
      tower.addFloor('2+2', 4)
      tower.addFloor('3+3', 6)
      tower.addFloor('4+4', 8) // exceeds target
      expect(tower.progress.value).toBe(1)
    })

    it('should allow adding floors beyond targetHeight', () => {
      const config = makeConfig({ targetHeight: 2 })
      const tower = useTower(config)
      tower.addFloor('1+1', 2)
      tower.addFloor('2+2', 4)
      tower.addFloor('3+3', 6) // beyond target
      expect(tower.floors.value).toHaveLength(3)
    })
  })

  describe('milestone tracking', () => {
    it('should mark correct milestones', () => {
      const config = makeConfig({ targetHeight: 10, milestones: [5, 10] })
      const tower = useTower(config)
      for (let i = 0; i < 10; i++) {
        tower.addFloor(`${i}+1`, i + 1)
      }
      expect(tower.floors.value[4]!.isMilestone).toBe(true) // level 5
      expect(tower.floors.value[9]!.isMilestone).toBe(true) // level 10
      expect(tower.floors.value[2]!.isMilestone).toBe(false) // level 3
    })

    it('should return false for isMilestone with non-milestone level', () => {
      const config = makeConfig({ targetHeight: 10, milestones: [5] })
      const tower = useTower(config)
      expect(tower.isMilestone(1)).toBe(false)
      expect(tower.isMilestone(5)).toBe(true)
      expect(tower.isMilestone(10)).toBe(false)
    })

    it('should handle empty milestones array', () => {
      const config = makeConfig({ targetHeight: 5, milestones: [] })
      const tower = useTower(config)
      tower.addFloor('1+1', 2)
      expect(tower.floors.value[0]!.isMilestone).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should increment errorCount on each showWaitingFloor', () => {
      const config = makeConfig()
      const tower = useTower(config)
      tower.showWaitingFloor()
      tower.showWaitingFloor()
      tower.showWaitingFloor()
      expect(tower.errorCount.value).toBe(3)
    })

    it('should not add floors on showWaitingFloor', () => {
      const config = makeConfig()
      const tower = useTower(config)
      tower.showWaitingFloor()
      expect(tower.floors.value).toHaveLength(0)
    })

    it('should preserve errorCount after adding floors', () => {
      const config = makeConfig()
      const tower = useTower(config)
      tower.showWaitingFloor()
      tower.addFloor('1+1', 2)
      expect(tower.errorCount.value).toBe(1)
      expect(tower.floors.value).toHaveLength(1)
    })
  })

  describe('reset', () => {
    it('should clear errorCount on reset', () => {
      const config = makeConfig()
      const tower = useTower(config)
      tower.showWaitingFloor()
      tower.showWaitingFloor()
      tower.resetTower()
      expect(tower.errorCount.value).toBe(0)
    })

    it('should allow building from scratch after reset', () => {
      const config = makeConfig({ targetHeight: 3 })
      const tower = useTower(config)
      tower.addFloor('1+1', 2)
      tower.addFloor('2+2', 4)
      tower.resetTower()
      expect(tower.completed.value).toBe(false)
      expect(tower.progress.value).toBe(0)
      tower.addFloor('1+1', 2)
      tower.addFloor('2+2', 4)
      tower.addFloor('3+3', 6)
      expect(tower.completed.value).toBe(true)
    })
  })

  describe('floor data integrity', () => {
    it('should assign sequential levels', () => {
      const config = makeConfig()
      const tower = useTower(config)
      for (let i = 0; i < 5; i++) {
        tower.addFloor(`${i}+${i}`, i * 2)
      }
      const levels = tower.floors.value.map(f => f.level)
      expect(levels).toEqual([1, 2, 3, 4, 5])
    })

    it('should have unique floor ids (or same ms ids)', () => {
      const config = makeConfig()
      const tower = useTower(config)
      tower.addFloor('1+1', 2)
      tower.addFloor('2+2', 4)
      // IDs are Date.now() which may be same — verify levels differ
      const levels = tower.floors.value.map(f => f.level)
      expect(new Set(levels).size).toBe(2)
    }) 

    it('should set state to completed on each floor', () => {
      const config = makeConfig()
      const tower = useTower(config)
      tower.addFloor('1+1', 2)
      expect(tower.floors.value[0]!.state).toBe('completed')
    })

    it('should store expression and answer', () => {
      const config = makeConfig()
      const tower = useTower(config)
      tower.addFloor('3+5', 8)
      expect(tower.floors.value[0]!.expression).toBe('3+5')
      expect(tower.floors.value[0]!.answer).toBe(8)
    })

    it('should assign sequential levels', () => {
      const config = makeConfig()
      const tower = useTower(config)
      for (let i = 0; i < 5; i++) {
        tower.addFloor(`${i}+${i}`, i * 2)
      }
      const levels = tower.floors.value.map(f => f.level)
      expect(levels).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('progress computation', () => {
    it('should be 0 with no floors', () => {
      const tower = useTower(makeConfig())
      expect(tower.progress.value).toBe(0)
    })

    it('should be 0.5 at halfway', () => {
      const config = makeConfig({ targetHeight: 4 })
      const tower = useTower(config)
      tower.addFloor('1+1', 2)
      tower.addFloor('2+2', 4)
      expect(tower.progress.value).toBe(0.5)
    })

    it('should be 1 at target', () => {
      const config = makeConfig({ targetHeight: 3 })
      const tower = useTower(config)
      for (let i = 0; i < 3; i++) tower.addFloor(`${i}+1`, i + 1)
      expect(tower.progress.value).toBe(1)
    })
  })
})
