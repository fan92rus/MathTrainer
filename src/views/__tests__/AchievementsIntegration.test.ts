import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DecompositionView from '../DecompositionView.vue'
import MultiplicationView from '../MultiplicationView.vue'
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

  it('DecompositionView должен вызывать checkAchievements', async () => {
    // Этот тест покажет, что checkAchievements НЕ вызывается в DecompositionView
    const wrapper = mount(DecompositionView, {
      global: {
        plugins: [createPinia()]
      }
    })

    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()

    // Мокаем checkAchievements
    const checkSpy = vi.fn()
    wrapper.vm.checkAchievements = checkSpy

    // Получаем первую задачу
    await wrapper.vm.$nextTick()

    // Эмулируем правильный ответ
    const currentProblem = wrapper.vm.currentProblem
    if (currentProblem && currentProblem.correctIndex !== undefined) {
      await wrapper.vm.handleAnswerSelected(currentProblem.correctIndex)
    }

    // Проверяем, что checkAchievements был вызван
    expect(checkSpy).toHaveBeenCalled()
  })

  it('должен разблокировать достижение при вызове checkAchievements', () => {
    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()

    // Добавляем очки
    scoresStore.updateCountingScore(50)

    // Вызываем checkAchievements напрямую
    const unlocked = achievementsStore.checkAchievements(scoresStore, {
      type: 'counting',
      correct: true
    })

    // Проверяем, что достижения были разблокированы
    const firstSteps = achievementsStore.achievements.find(a => a.id === 'first_steps')
    expect(firstSteps?.unlocked).toBe(true)
    expect(unlocked.length).toBeGreaterThan(0)
  })
})