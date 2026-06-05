/**
 * Тесты для ProgressPath store
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProgressPathStore } from '../progressPath'
import { useSettingsStore } from '../settings'
import { useScoresStore } from '../scores'

// Мокаем localStorage
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value }),
  removeItem: vi.fn((key: string) => { delete store[key] }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('ProgressPathStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('allNodes', () => {
    it('должен возвращать массив узлов из конфига', () => {
      const store = useProgressPathStore()
      expect(store.allNodes.length).toBeGreaterThan(0)
    })

    it('каждый узел должен иметь обязательные поля', () => {
      const s = useProgressPathStore()
      for (const node of s.allNodes) {
        expect(node).toHaveProperty('id')
        expect(node).toHaveProperty('exerciseType')
        expect(node).toHaveProperty('title')
        expect(node).toHaveProperty('starCount')
        expect(node).toHaveProperty('locked')
        expect(node).toHaveProperty('icon')
        expect(node).toHaveProperty('grade')
        expect(node).toHaveProperty('quarter')
      }
    })

    it('starCount должен быть 0-3', () => {
      const s = useProgressPathStore()
      for (const node of s.allNodes) {
        expect(node.starCount).toBeGreaterThanOrEqual(0)
        expect(node.starCount).toBeLessThanOrEqual(3)
      }
    })
  })

  describe('currentGradeGroups', () => {
    it('должен возвращать группы для текущего класса', () => {
      const settings = useSettingsStore()
      settings.selectedGrade = 3

      const s = useProgressPathStore()
      const groups = s.currentGradeGroups

      expect(groups.length).toBeGreaterThan(0)
      for (const group of groups) {
        expect(group.grade).toBe(3)
      }
    })

    it('группы должны быть отсортированы по четвертям', () => {
      const settings = useSettingsStore()
      settings.selectedGrade = 3

      const s = useProgressPathStore()
      const groups = s.currentGradeGroups

      for (let i = 1; i < groups.length; i++) {
        expect(groups[i].quarter).toBeGreaterThanOrEqual(groups[i - 1].quarter)
      }
    })
  })

  describe('currentGradeProgress', () => {
    it('должен возвращать earned и total', () => {
      const settings = useSettingsStore()
      settings.selectedGrade = 1

      const s = useProgressPathStore()
      const p = s.currentGradeProgress

      expect(p.earned).toBeGreaterThanOrEqual(0)
      expect(p.total).toBeGreaterThan(0)
      expect(p.total % 3).toBe(0) // total = nodes * 3
    })
  })

  describe('currentNode', () => {
    it('должен возвращать узел или null', () => {
      const s = useProgressPathStore()
      const node = s.currentNode
      // Может быть null если класс не выбран
      if (node) {
        expect(node).toHaveProperty('id')
        expect(node).toHaveProperty('exerciseType')
      }
    })
  })
})
