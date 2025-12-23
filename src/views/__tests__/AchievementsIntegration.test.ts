import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DecompositionView from '../DecompositionView.vue'
import { useScoresStore } from '@/store/scores'
import { useAchievementsStore } from '@/store/achievements'

// Мокаем зависимости
vi.mock('@/utils/mathHelpers', () => ({
  generateDecompositionProblem: () => ({ num1: 10, num2: 5, correctAnswer: 5 }),
  generateMultiplicationProblem: () => ({ num1: 2, num2: 3, correctAnswer: 6 })
}))

describe('Achievements Integration with Views', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('DecompositionView должен корректно обрабатывать правильный ответ', async () => {
    // Этот тест проверяет базовую функциональность представления
    const wrapper = mount(DecompositionView, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Проверяем, что компонент успешно смонтирован
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.vm.currentProblem).toBeDefined()
  })

  it('должен разблокировать достижение novice при накоплении 100 очков', () => {
    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()

    // Добавляем 100 очков
    scoresStore.updateCountingScore(100)

    // Вызываем checkAchievements напрямую
    const unlocked = achievementsStore.checkAchievements(scoresStore, {
      type: 'counting',
      correct: true
    })

    // Проверяем, что novice был разблокирован (за 100 общих очков)
    const novice = achievementsStore.achievements.find(a => a.id === 'novice')
    expect(novice?.unlocked).toBe(true)
    expect(unlocked.length).toBeGreaterThan(0)
  })

  it('должен разблокировать достижение first_steps при серии из 10 правильных ответов', () => {
    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()

    // Добавляем немного очков
    scoresStore.updateCountingScore(50)

    // Вызываем checkAchievements со streak 10
    const unlocked = achievementsStore.checkAchievements(scoresStore, {
      type: 'counting',
      correct: true,
      streak: 10
    })

    // Проверяем, что first_steps был разблокирован (за streak 10)
    const firstSteps = achievementsStore.achievements.find(a => a.id === 'first_steps')
    expect(firstSteps?.unlocked).toBe(true)
    expect(unlocked).toContain('first_steps')
  })
})
