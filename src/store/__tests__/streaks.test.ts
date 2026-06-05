/**
 * Тесты для Streak store
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStreaksStore } from '../streaks'

// Мокаем localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Хелпер для получения даты N дней назад как toDateString
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toDateString()
}

function today(): string {
  return new Date().toDateString()
}

describe('StreaksStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('начальное состояние', () => {
    it('должен иметь нулевой стрик при первом запуске', () => {
      const store = useStreaksStore()
      expect(store.currentStreak).toBe(0)
      expect(store.bestStreak).toBe(0)
      expect(store.lastActiveDate).toBeNull()
    })
  })

  describe('recordActivity — логика стрика', () => {
    it('первая активность: streak = 1', () => {
      const store = useStreaksStore()
      store.recordActivity()
      expect(store.currentStreak).toBe(1)
      expect(store.bestStreak).toBe(1)
      expect(store.lastActiveDate).toBe(today())
    })

    it('повторный вызов в тот же день: streak не растёт', () => {
      const store = useStreaksStore()
      store.recordActivity()
      store.recordActivity()
      store.recordActivity()
      expect(store.currentStreak).toBe(1)
    })

    it('активность на следующий день: streak++', () => {
      const store = useStreaksStore()
      // Эмулируем вчера
      store.lastActiveDate = daysAgo(1)
      store.currentStreak = 1
      store.bestStreak = 1

      store.recordActivity()
      expect(store.currentStreak).toBe(2)
      expect(store.bestStreak).toBe(2)
    })

    it('пропуск 2 дней: streak сбрасывается до 1', () => {
      const store = useStreaksStore()
      store.lastActiveDate = daysAgo(2)
      store.currentStreak = 5
      store.bestStreak = 5

      store.recordActivity()
      expect(store.currentStreak).toBe(1)
      // best streak не должен уменьшаться
      expect(store.bestStreak).toBe(5)
    })

    it('пропуск 7 дней: streak = 1, bestStreak сохраняется', () => {
      const store = useStreaksStore()
      store.lastActiveDate = daysAgo(7)
      store.currentStreak = 30
      store.bestStreak = 30

      store.recordActivity()
      expect(store.currentStreak).toBe(1)
      expect(store.bestStreak).toBe(30)
    })

    it('5 дней подряд: streak = 5, bestStreak = 5', () => {
      const store = useStreaksStore()
      for (let i = 4; i >= 0; i--) {
        store.lastActiveDate = daysAgo(i + 1)
        store.currentStreak = 4 - i
        store.bestStreak = 4 - i
      }
      // Simulate day 5
      store.lastActiveDate = daysAgo(1)
      store.currentStreak = 4
      store.bestStreak = 4

      store.recordActivity()
      expect(store.currentStreak).toBe(5)
      expect(store.bestStreak).toBe(5)
    })

    it('bestStreak обновляется только если currentStreak > bestStreak', () => {
      const store = useStreaksStore()
      store.lastActiveDate = daysAgo(1)
      store.currentStreak = 2
      store.bestStreak = 10 // был ранее лучший стрик

      store.recordActivity()
      expect(store.currentStreak).toBe(3)
      expect(store.bestStreak).toBe(10) // не перезаписывается, 3 < 10
    })
  })

  describe('checkStreakMilestones', () => {
    it('возвращает milestones при достижении 3 дней', () => {
      const store = useStreaksStore()
      store.currentStreak = 3
      const milestones = store.checkStreakMilestones()
      expect(milestones).toContainEqual(
        expect.objectContaining({ days: 3 })
      )
    })

    it('возвращает milestones при достижении 7 дней', () => {
      const store = useStreaksStore()
      store.currentStreak = 7
      const milestones = store.checkStreakMilestones()
      expect(milestones).toContainEqual(
        expect.objectContaining({ days: 7 })
      )
    })

    it('возвращает пустой массив при стрике 2', () => {
      const store = useStreaksStore()
      store.currentStreak = 2
      const milestones = store.checkStreakMilestones()
      expect(milestones).toHaveLength(0)
    })

    it('возвращает milestone 30 при стрике 30', () => {
      const store = useStreaksStore()
      store.currentStreak = 30
      const milestones = store.checkStreakMilestones()
      expect(milestones).toContainEqual(
        expect.objectContaining({ days: 30 })
      )
    })
  })

  describe('persistence', () => {
    it('сохраняет данные в localStorage при recordActivity', () => {
      const store = useStreaksStore()
      store.recordActivity()
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })
})
