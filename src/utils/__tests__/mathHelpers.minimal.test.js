import { 
  shuffleArray,
  getAvailableMultiplicationLevels
} from '../mathHelpers.js'

describe('Math Helpers - Minimal Tests', () => {
  describe('shuffleArray', () => {
    test('перемешивает массив', () => {
      const originalArray = [1, 2, 3, 4, 5]
      const shuffledArray = shuffleArray(originalArray)
      
      expect(shuffledArray).toHaveLength(originalArray.length)
      expect(shuffledArray.sort()).toEqual(originalArray.sort())
    })

    test('не изменяет исходный массив', () => {
      const originalArray = [1, 2, 3, 4, 5]
      const originalCopy = [...originalArray]
      shuffleArray(originalArray)
      
      expect(originalArray).toEqual(originalCopy)
    })
  })

  describe('getAvailableMultiplicationLevels', () => {
    test('возвращает правильную структуру уровней', () => {
      const levels = getAvailableMultiplicationLevels(100)
      
      expect(Array.isArray(levels)).toBe(true)
      expect(levels.length).toBeGreaterThan(0)
      
      levels.forEach(level => {
        expect(level).toHaveProperty('multiplier')
        expect(level).toHaveProperty('requiredScore')
        expect(level).toHaveProperty('available')
        expect(level).toHaveProperty('name')
        expect(level).toHaveProperty('pointsPerCorrect')
      })
    })

    test('правильно определяет доступность уровней', () => {
      const levels = getAvailableMultiplicationLevels(100)
      
      const level2 = levels.find(l => l.multiplier === 2)
      expect(level2.available).toBe(true)
      
      const level3 = levels.find(l => l.multiplier === 3)
      expect(level3.requiredScore).toBe(50)
    })
  })
})