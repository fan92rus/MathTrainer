# Шаблон для UI тестов вьюх

## Паттерны

### 1. Options API + useGameLogic (CountingView, DecompositionView, MultiplicationView, EquationsView, ManualDecompositionView, ManualEquationsView, FirstGradeDecompositionView)

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

// Мокаем ВСЕ дочерние компоненты
vi.mock('@/components/common/ScoreDisplay.vue', () => ({
  default: { template: '<div class="mock-score">{{ currentScore }}/{{ totalScore }}</div>', props: ['currentScore','totalScore','currentQuestion','totalQuestions'] }
}))
vi.mock('@/components/common/ProgressBar.vue', () => ({
  default: { template: '<div class="mock-progress"></div>', props: ['progressPercent'] }
}))
vi.mock('@/components/common/StarRating.vue', () => ({
  default: { template: '<div class="mock-stars">{{ score }}</div>', props: ['score'] }
}))
vi.mock('@/components/common/AnswerOptions.vue', () => ({
  default: { template: '<div class="mock-answers"><button v-for="(o,i) in options" :key="i" @click="$emit(\'answerSelected\', i)">{{ o }}</button></div>', props: ['options','correctIndex','answered','selectedIndex'], emits: ['answerSelected'] }
}))
vi.mock('@/components/common/GameOver.vue', () => ({
  default: { template: '<div class="mock-gameover"></div>', props: ['correctAnswers','totalAnswers','score'], emits: ['restart','exit'] }
}))
vi.mock('@/components/AchievementManager.vue', () => ({
  default: { template: '<div></div>' }
}))
vi.mock('@/components/common/CoinAnimation.vue', () => ({
  default: { template: '<div></div>', props: ['amount'], emits: ['animationEnd'] }
}))
vi.mock('@/components/player/CurrencyDisplay.vue', () => ({
  default: { template: '<div>🪙</div>' }
}))

// Мок router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

describe('ViewName', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(ViewComponent, {
      global: {
        stubs: {} // Only if you need extra stubs
      }
    })
  })

  it('рендерится без ошибок', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('показывает выражение', () => {
    expect(wrapper.text()).toContain('=')
  })

  it('показывает 4 варианта ответа', () => {
    const btns = wrapper.findAll('.mock-answers button')
    expect(btns.length).toBe(4)
  })

  it('правильный ответ увеличивает счёт', async () => {
    const initial = wrapper.vm.score
    const correct = wrapper.vm.currentProblem?.correctIndex ?? 0
    await wrapper.findAll('.mock-answers button')[correct].trigger('click')
    expect(wrapper.vm.score).toBe(initial + 1)
  })

  it('неправильный ответ не увеличивает счёт', async () => {
    const initial = wrapper.vm.score
    const wrong = wrapper.vm.currentProblem?.correctIndex === 0 ? 1 : 0
    await wrapper.findAll('.mock-answers button')[wrong].trigger('click')
    expect(wrapper.vm.score).toBe(initial)
  })
  
  it('GameOver показывается после 10 вопросов', async () => {
    wrapper.vm.currentQuestion = 10
    wrapper.vm.showResults = true
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'GameOver' }).exists()).toBe(true)
  })
  
  it('кнопка Назад вызывает router.push("/")', async () => {
    const btn = wrapper.find('.back-button')
    await btn.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('рестарт сбрасывает состояние', async () => {
    wrapper.vm.score = 8
    wrapper.vm.currentQuestion = 9
    await wrapper.vm.restart()
    expect(wrapper.vm.score).toBe(0)
    expect(wrapper.vm.currentQuestion).toBe(0)
  })
})
```

### 2. <script setup> + custom composables (NumberLineCountingView, ChallengeCountingView, WaveCountingView, BlocksPlaygroundView)

Use the same mock pattern but also mock the gamification-specific components:
- ChallengePreStart, ChallengeHeader, ChallengeProgressBar, ChallengeResults
- NumberLine (Note: uses Canvas, mock with a div)
- WaveCard
- BlockPlayground, BlockItem

### 3. ColumnSubtraction views

They use useGameLogic but with custom props (TRAINING_QUESTIONS_COUNT, etc.)

## Grade-specific testing

For views that behave differently by grade:
- CountingView: grade 1 (small numbers), grade 2 (numbers up to 100)
- DecompositionView: grade 2+  
- MultiplicationView: grade 2 Q3+, grade 3+

Test at least one grade configuration by setting the settings store before mount:
```ts
const settingsStore = useSettingsStore()
settingsStore.selectedGrade = 2
settingsStore.isGradeSelected = true
```

## Key assertions per view

Each test file MUST cover:
1. Рендер без ошибок
2. Отображение выражения/задачи
3. Правильный ответ → счёт +1
4. Неправильный ответ → счёт не меняется
5. GameOver после всех вопросов
6. Рестарт сбрасывает состояние
7. Кнопка Назад → router.push('/')
8. Прогресс-бар отображается
9. Звёзды отображаются
10. Для grade-зависимых: разные классы дают разные выражения
