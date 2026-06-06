import { describe, it, expect } from 'vitest'
import { useTower } from '../useTower'

describe('useTower', () => {
  const defaultConfig = { theme: 'castle' as const, targetHeight: 10, milestones: [5, 10] }

  it('should initialize with empty floors', () => {
    const { floors, completed, errorCount } = useTower(defaultConfig)
    expect(floors.value).toHaveLength(0)
    expect(completed.value).toBe(false)
    expect(errorCount.value).toBe(0)
  })

  it('should add floor on correct answer', () => {
    const { floors, addFloor } = useTower(defaultConfig)
    addFloor('3 + 4', 7)
    expect(floors.value).toHaveLength(1)
    expect(floors.value[0].expression).toContain('3 + 4')
    expect(floors.value[0].answer).toBe(7)
    expect(floors.value[0].state).toBe('completed')
  })

  it('should auto-assign incrementing level numbers', () => {
    const { floors, addFloor } = useTower(defaultConfig)
    addFloor('1+1', 2)
    addFloor('2+2', 4)
    addFloor('3+3', 6)
    expect(floors.value[0].level).toBe(1)
    expect(floors.value[1].level).toBe(2)
    expect(floors.value[2].level).toBe(3)
  })

  it('should set isMilestone on floor if level matches config milestones', () => {
    const { floors, addFloor } = useTower(defaultConfig)
    // Build 5 floors
    for (let i = 0; i < 5; i++) {
      addFloor(`${i}+${i}`, i * 2)
    }
    expect(floors.value[4].level).toBe(5)
    expect(floors.value[4].isMilestone).toBe(true)
    // Floor 4 should not be a milestone
    expect(floors.value[3].isMilestone).toBe(false)
  })

  it('should mark tower as completed when target reached', () => {
    const { floors, completed, addFloor } = useTower({
      ...defaultConfig,
      targetHeight: 3,
      milestones: [3],
    })
    addFloor('1+1', 2)
    addFloor('2+2', 4)
    expect(completed.value).toBe(false)
    addFloor('3+3', 6)
    expect(completed.value).toBe(true)
  })

  it('should mark tower not completed when below target', () => {
    const { completed, addFloor } = useTower({ ...defaultConfig, targetHeight: 5, milestones: [5] })
    addFloor('1+1', 2)
    expect(completed.value).toBe(false)
  })

  it('should track progress as ratio 0..1', () => {
    const { progress, addFloor } = useTower({ ...defaultConfig, targetHeight: 4, milestones: [4] })
    expect(progress.value).toBe(0)
    addFloor('1+1', 2)
    expect(progress.value).toBe(0.25)
    addFloor('2+2', 4)
    expect(progress.value).toBe(0.5)
    addFloor('2+2', 4)
    addFloor('2+2', 4)
    expect(progress.value).toBe(1)
  })

  it('should track error count via showWaitingFloor', () => {
    const { errorCount, showWaitingFloor } = useTower(defaultConfig)
    showWaitingFloor()
    showWaitingFloor()
    expect(errorCount.value).toBe(2)
  })

  it('should not add floor on showWaitingFloor', () => {
    const { floors, errorCount, showWaitingFloor } = useTower(defaultConfig)
    showWaitingFloor()
    expect(floors.value).toHaveLength(0)
    expect(errorCount.value).toBe(1)
  })

  it('should reset tower completely', () => {
    const { floors, errorCount, addFloor, showWaitingFloor, resetTower } = useTower(defaultConfig)
    addFloor('1+1', 2)
    addFloor('2+2', 4)
    showWaitingFloor()
    resetTower()
    expect(floors.value).toHaveLength(0)
    expect(errorCount.value).toBe(0)
  })

  it('should allow adding floors after reset', () => {
    const { floors, addFloor, resetTower } = useTower(defaultConfig)
    addFloor('1+1', 2)
    resetTower()
    addFloor('3+3', 6)
    expect(floors.value).toHaveLength(1)
    expect(floors.value[0].level).toBe(1) // level restarts from 1
  })

  it('should identify milestone floors via isMilestone function', () => {
    const { isMilestone } = useTower(defaultConfig)
    expect(isMilestone(1)).toBe(false)
    expect(isMilestone(5)).toBe(true)
    expect(isMilestone(10)).toBe(true)
    expect(isMilestone(7)).toBe(false)
  })

  it('should support different themes', () => {
    const rocket = useTower({ theme: 'rocket', targetHeight: 5, milestones: [5] })
    rocket.addFloor('1+1', 2)
    expect(rocket.floors.value).toHaveLength(1)
  })

  it('should set timestamp on each floor', () => {
    const before = Date.now()
    const { floors, addFloor } = useTower(defaultConfig)
    addFloor('1+1', 2)
    const after = Date.now()
    expect(floors.value[0].timestamp).toBeGreaterThanOrEqual(before)
    expect(floors.value[0].timestamp).toBeLessThanOrEqual(after)
  })
})
