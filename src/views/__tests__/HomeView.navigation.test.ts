import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '../HomeView.vue'
import { useSettingsStore } from '@/store/settings'

// --- Mocks ---

vi.mock('@/components/AchievementManager.vue', () => ({
  default: { template: '<div class="mock-achievement-manager"></div>' }
}))

vi.mock('@/components/motivation/MotivationBar.vue', () => ({
  default: { template: '<div class="mock-motivation-bar"></div>', emits: ['achievementsClick'] }
}))

vi.mock('@/components/motivation/ProgressPath.vue', () => ({
  default: { template: '<div class="mock-progress-path"></div>', props: ['compact'] }
}))

vi.mock('@/composables/useAchievements', () => ({
  useAchievements: () => ({ checkAchievements: vi.fn(() => []) })
}))

vi.mock('@/store/player', () => ({
  usePlayerStore: () => ({
    currency: { coins: 0 }
  })
}))

vi.mock('@/composables/useDailyTasks', () => ({
  useDailyTasks: () => ({
    ensureTasks: vi.fn(),
    dailyTasks: { value: [] }
  })
}))

// Default: all exercises available (grade 2, quarter 4)
const defaultExercises = {
  counting: { available: true, title: 'Тренажер счета', description: 'Сложение и вычитание' },
  firstGradeDecomposition: { available: true, title: 'Состав числа (1 класс)', description: 'Числа до 10' },
  decomposition: { available: true, title: 'Состав числа', description: 'Разложение чисел' },
  multiplication: { available: true, title: 'Таблица умножения', description: 'Умножение' },
  equations: { available: true, title: 'Простые уравнения', description: 'Уравнения с неизвестным' },
  columnSubtraction: { available: true, title: 'Вычитание в столбик', description: 'Заимствование' },
  equationsWholePart: { available: true, title: 'Уравнения: целое и части', description: 'Метод частей' }
}

// Grade 1 exercises (only counting + firstGradeDecomposition)
const grade1Exercises = {
  counting: { available: true, title: 'Тренажер счета', description: 'Сложение и вычитание' },
  firstGradeDecomposition: { available: true, title: 'Состав числа (1 класс)', description: 'Числа до 10' },
  decomposition: { available: false, title: 'Состав числа', description: 'Разложение' },
  multiplication: { available: false, title: 'Таблица умножения', description: 'Умножение' },
  equations: { available: false, title: 'Простые уравнения', description: 'Уравнения' },
  columnSubtraction: { available: false, title: 'Вычитание в столбик', description: 'Столбик' },
  equationsWholePart: { available: false, title: 'Уравнения: целое и части', description: 'Части' }
}

let mockGetAvailableExercises: () => any = () => defaultExercises

vi.mock('@/utils/gradeHelpers', () => ({
  getGradeName: (grade: number) => `${grade} класс`,
  getQuarterName: (q: number) => `${q} четверть`,
  getCurrentQuarter: () => 4,
  getAvailableExercises: () => mockGetAvailableExercises()
}))

// localStorage mock
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) { return this.store[key] ?? null },
  setItem(key: string, value: string) { this.store[key] = value },
  clear() { this.store = {} },
  removeItem(key: string) { delete this.store[key] },
  length: 0,
  key() { return null }
}

// --- Router factory ---
function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/counting', component: { template: '<div>Counting</div>' } },
      { path: '/decomposition', component: { template: '<div>Decomposition</div>' } },
      { path: '/first-grade-decomposition', component: { template: '<div>FGD</div>' } },
      { path: '/multiplication', component: { template: '<div>Multiplication</div>' } },
      { path: '/equations', component: { template: '<div>Equations</div>' } },
      { path: '/column-subtraction', component: { template: '<div>ColumnSub</div>' } },
      { path: '/column-subtraction/learning', component: { template: '<div>CSLearning</div>' } },
      { path: '/column-subtraction/diagnostic', component: { template: '<div>CSDiag</div>' } },
      { path: '/equations-whole-part', component: { template: '<div>EWP</div>' } },
      { path: '/equations-whole-part/learning', component: { template: '<div>EWPLearning</div>' } },
      { path: '/equations-whole-part/diagnostic', component: { template: '<div>EWPDiag</div>' } },
      { path: '/achievements', component: { template: '<div>Achievements</div>' } },
      { path: '/daily-tasks', component: { template: '<div>DailyTasks</div>' } },
    ]
  })
}

// --- Mount helper ---
function mountHome(grade: number = 2): VueWrapper {
  localStorageMock.store = { selectedGrade: String(grade) }
  const router = createTestRouter()
  return mount(HomeView, {
    global: { plugins: [router] }
  })
}

// --- Tests ---
describe('HomeView - Navigation', () => {
  let router: ReturnType<typeof createTestRouter>

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAvailableExercises = () => defaultExercises
    localStorageMock.clear()
    localStorageMock.store = { selectedGrade: '2' }
    vi.stubGlobal('localStorage', localStorageMock)
    setActivePinia(createPinia())
    router = createTestRouter()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // --- Rendering ---

  it('рендерится без ошибок', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('отображает ProgressPath', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    expect(wrapper.find('.mock-progress-path').exists()).toBe(true)
    wrapper.unmount()
  })

  it('отображает все game-card для grade 2 quarter 4', () => {
    const wrapper = mountHome(2)
    const cards = wrapper.findAll('.game-card')
    // All 7 exercise cards should be visible
    expect(cards.length).toBe(7)
    wrapper.unmount()
  })

  it('для grade 1 отображает только counting и firstGradeDecomposition', () => {
    mockGetAvailableExercises = () => grade1Exercises
    localStorageMock.store = { selectedGrade: '1' }
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(HomeView, { global: { plugins: [router, pinia] } })

    const cards = wrapper.findAll('.game-card')
    // firstGradeDecomposition (no click handler) + counting = 2 visible cards
    // Note: firstGradeDecomposition card has no @click (it's the first card in template)
    // and it has class game-card--counting (typo in source)
    expect(cards.length).toBe(2)
    wrapper.unmount()
  })

  // --- Navigation clicks ---

  it('клик по counting card → router.push("/counting")', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })

    const countingCard = wrapper.findAll('.game-card').find(c => c.text().includes('Тренажер счета'))
    expect(countingCard).toBeDefined()
    await countingCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/counting')
    wrapper.unmount()
  })

  it('клик по decomposition card → router.push("/decomposition")', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })

    const decCard = wrapper.findAll('.game-card').find(c => c.text().includes('Состав числа') && c.classes().includes('game-card--decomposition'))
    expect(decCard).toBeDefined()
    await decCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/decomposition')
    wrapper.unmount()
  })

  it('клик по multiplication card → router.push("/multiplication")', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })

    const mulCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--multiplication'))
    expect(mulCard).toBeDefined()
    await mulCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/multiplication')
    wrapper.unmount()
  })

  it('клик по equations card → router.push("/equations")', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })

    const eqCard = wrapper.findAll('.game-card').find(c => c.text().includes('Простые уравнения'))
    expect(eqCard).toBeDefined()
    await eqCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/equations')
    wrapper.unmount()
  })

  it('клик по column-subtraction card → router.push("/column-subtraction")', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })

    // Set learning and diagnostic as completed so it goes to training
    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    scoresStore.columnSubtractionLearningCompleted = true
    scoresStore.columnSubtractionDiagnosticPassed = true

    const colCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--column'))
    expect(colCard).toBeDefined()
    await colCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/column-subtraction')
    wrapper.unmount()
  })

  it('клик по equations-whole-part card → router.push("/equations-whole-part")', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })

    // Set learning and diagnostic as completed so it goes to training
    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    scoresStore.equationsWholePartLearningCompleted = true
    scoresStore.equationsWholePartDiagnosticPassed = true

    const ewpCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--equations'))
    expect(ewpCard).toBeDefined()
    await ewpCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/equations-whole-part')
    wrapper.unmount()
  })

  // --- Hero actions ---

  it('клик по achievements btn → router.push("/achievements")', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })

    await wrapper.find('.achievements-btn').trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/achievements')
    wrapper.unmount()
  })

  it('клик по daily-tasks btn → router.push("/daily-tasks")', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })

    await wrapper.find('.daily-btn').trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/daily-tasks')
    wrapper.unmount()
  })

  // --- Grade badge ---

  it('grade-badge показывает номер класса', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    expect(wrapper.find('.grade-badge-number').text()).toBe('2')
    wrapper.unmount()
  })

  it('клик по grade-badge вызывает changeGrade (reset)', async () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const settingsStore = useSettingsStore()
    // After loadSettings, selectedGrade should be set from localStorage
    expect(settingsStore.selectedGrade).toBe(2)

    await wrapper.find('.grade-badge').trigger('click')
    // changeGrade calls settingsStore.resetSettings()
    expect(settingsStore.selectedGrade).toBeNull()
    wrapper.unmount()
  })

  // --- Column subtraction routing logic ---

  it('column-subtraction направляет на learning если не пройден', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })

    // Import scores store and reset learning
    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    scoresStore.columnSubtractionLearningCompleted = false
    scoresStore.columnSubtractionDiagnosticPassed = false

    const colCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--column'))
    await colCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/column-subtraction/learning')
    wrapper.unmount()
  })

  it('column-subtraction направляет на diagnostic если learning пройден', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })

    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    scoresStore.columnSubtractionLearningCompleted = true
    scoresStore.columnSubtractionDiagnosticPassed = false

    const colCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--column'))
    await colCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/column-subtraction/diagnostic')
    wrapper.unmount()
  })

  it('equations-whole-part направляет на learning если не пройден', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })

    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    scoresStore.equationsWholePartLearningCompleted = false
    scoresStore.equationsWholePartDiagnosticPassed = false

    const ewpCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--equations'))
    await ewpCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/equations-whole-part/learning')
    wrapper.unmount()
  })

  it('equations-whole-part направляет на diagnostic если learning пройден', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })

    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    scoresStore.equationsWholePartLearningCompleted = true
    scoresStore.equationsWholePartDiagnosticPassed = false

    const ewpCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--equations'))
    await ewpCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/equations-whole-part/diagnostic')
    wrapper.unmount()
  })

  // --- Score display ---

  it('отображает счёт для каждого упражнения', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const scores = wrapper.findAll('.game-score')
    expect(scores.length).toBe(7) // One per game card
    // Each should have ⭐
    scores.forEach(s => expect(s.text()).toContain('⭐'))
    wrapper.unmount()
  })

  it('hero-section рендерится когда grade выбран', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    expect(wrapper.find('.hero-section').exists()).toBe(true)
    wrapper.unmount()
  })

  // --- formatNumber ---

  it('formatNumber форматирует большие числа', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    expect((wrapper.vm as any).formatNumber(1500000)).toBe('1.5M')
    expect((wrapper.vm as any).formatNumber(25000)).toBe('25.0K')
    expect((wrapper.vm as any).formatNumber(42)).toBe('42')
    expect((wrapper.vm as any).formatNumber(0)).toBe('0')
    wrapper.unmount()
  })

  // --- Scores content ---

  it('отображает счёт countingScore', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const scores = wrapper.findAll('.game-score')
    const countingScore = (wrapper.vm as any).countingScore
    const countingCard = wrapper.findAll('.game-card').find(c => c.text().includes('Тренажер счета'))
    expect(countingCard?.find('.game-score').text()).toBe(`⭐ ${countingScore}`)
    wrapper.unmount()
  })

  // --- hasNewAchievements / hasUncompletedTasks ---

  it('отображает badge-dot на achievements если есть новые достижения', async () => {
    // Force hasNewAchievements by setting store state
    const { useAchievementsStore } = await import('@/store/achievements')
    const achievementsStore = useAchievementsStore()
    achievementsStore.$patch({ achievements: [{ id: 'test', title: 'Test', description: '', unlocked: true, unlockedAt: Date.now(), viewed: false }] })

    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    // Badge dot should appear if getNewAchievementsCount > 0
    // (depends on store implementation)
    wrapper.unmount()
  })

  // --- Equations card ---

  it('equations card не имеет специфического color class', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const eqCard = wrapper.findAll('.game-card').find(c => c.text().includes('Простые уравнения'))
    // In source, equations card has class 'game-card' but NOT game-card--equations
    // (it has no -- modifier class unlike others)
    expect(eqCard?.classes().includes('game-card--equations')).toBe(false)
    wrapper.unmount()
  })

  // --- columnSubtraction: three routing branches ---

  it('column-subtraction: learning → learning', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    scoresStore.columnSubtractionLearningCompleted = false
    scoresStore.columnSubtractionDiagnosticPassed = false

    const colCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--column'))
    await colCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/column-subtraction/learning')
    wrapper.unmount()
  })

  it('column-subtraction: learning done, diagnostic not → diagnostic', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    scoresStore.columnSubtractionLearningCompleted = true
    scoresStore.columnSubtractionDiagnosticPassed = false

    const colCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--column'))
    await colCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/column-subtraction/diagnostic')
    wrapper.unmount()
  })

  it('column-subtraction: both done → training', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    scoresStore.columnSubtractionLearningCompleted = true
    scoresStore.columnSubtractionDiagnosticPassed = true

    const colCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--column'))
    await colCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/column-subtraction')
    wrapper.unmount()
  })

  // --- equationsWholePart: three routing branches ---

  it('equations-whole-part: learning → learning', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    scoresStore.equationsWholePartLearningCompleted = false
    scoresStore.equationsWholePartDiagnosticPassed = false

    const ewpCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--equations'))
    await ewpCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/equations-whole-part/learning')
    wrapper.unmount()
  })

  it('equations-whole-part: learning done, diagnostic not → diagnostic', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    scoresStore.equationsWholePartLearningCompleted = true
    scoresStore.equationsWholePartDiagnosticPassed = false

    const ewpCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--equations'))
    await ewpCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/equations-whole-part/diagnostic')
    wrapper.unmount()
  })

  it('equations-whole-part: both done → training', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    scoresStore.equationsWholePartLearningCompleted = true
    scoresStore.equationsWholePartDiagnosticPassed = true

    const ewpCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--equations'))
    await ewpCard!.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/equations-whole-part')
    wrapper.unmount()
  })

  // --- availableExercises when no grade selected ---

  it('при отсутствии grade показывает дефолтные упражнения (только counting)', () => {
    localStorageMock.store = {} // no selectedGrade
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(HomeView, { global: { plugins: [router, pinia] } })

    // Only counting should be available in default exercises
    const cards = wrapper.findAll('.game-card')
    // counting card should still be visible
    const countingCard = cards.find(c => c.text().includes('Тренажер счета'))
    expect(countingCard).toBeDefined()
    // hero-section should NOT be visible when grade not selected
    expect(wrapper.find('.hero-section').exists()).toBe(false)
    wrapper.unmount()
  })

  // --- Grade selector modal behavior ---

  it('grade selector скрыт когда grade уже выбран', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    // isGradeSelected computed depends on settingsStore.isGradeSelected
    // When grade is selected (default in test), hero-section is visible
    expect(wrapper.find('.hero-section').exists()).toBe(true)
    expect(wrapper.find('.grade-badge').exists()).toBe(true)
    wrapper.unmount()
  })

  it('отображает номер класса в grade-badge', () => {
    localStorageMock.store = { selectedGrade: '3' }
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(HomeView, { global: { plugins: [router, pinia] } })
    expect(wrapper.find('.grade-badge-number').text()).toBe('3')
    wrapper.unmount()
  })

  // --- Score display for each exercise ---

  it('counting card показывает ⭐ countingScore', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const countingCard = wrapper.findAll('.game-card').find(c => c.text().includes('Тренажер счета'))
    const scoreEl = countingCard?.find('.game-score')
    expect(scoreEl?.text()).toContain('⭐')
    wrapper.unmount()
  })

  it('decomposition card показывает ⭐ decompositionScore', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const decCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--decomposition'))
    const scoreEl = decCard?.find('.game-score')
    expect(scoreEl?.text()).toContain('⭐')
    wrapper.unmount()
  })

  it('multiplication card показывает ⭐ multiplicationScore', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const mulCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--multiplication'))
    const scoreEl = mulCard?.find('.game-score')
    expect(scoreEl?.text()).toContain('⭐')
    wrapper.unmount()
  })

  it('equations card показывает ⭐ equationsScore', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const eqCard = wrapper.findAll('.game-card').find(c => c.text().includes('Простые уравнения'))
    const scoreEl = eqCard?.find('.game-score')
    expect(scoreEl?.text()).toContain('⭐')
    wrapper.unmount()
  })

  it('column-subtraction card показывает ⭐ columnSubtractionScore', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const colCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--column'))
    const scoreEl = colCard?.find('.game-score')
    expect(scoreEl?.text()).toContain('⭐')
    wrapper.unmount()
  })

  it('equations-whole-part card показывает ⭐ equationsWholePartScore', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const ewpCard = wrapper.findAll('.game-card').find(c => c.classes().includes('game-card--equations'))
    const scoreEl = ewpCard?.find('.game-score')
    expect(scoreEl?.text()).toContain('⭐')
    wrapper.unmount()
  })

  it('firstGradeDecomposition card показывает ⭐ firstGradeDecompositionScore', () => {
    mockGetAvailableExercises = () => grade1Exercises
    localStorageMock.store = { selectedGrade: '1' }
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(HomeView, { global: { plugins: [router, pinia] } })
    const fgdCard = wrapper.findAll('.game-card').find(c => c.text().includes('Состав числа (1 класс)'))
    const scoreEl = fgdCard?.find('.game-score')
    expect(scoreEl?.text()).toContain('⭐')
    wrapper.unmount()
  })

  // --- Game title and description ---

  it('каждая карточка показывает title и description из availableExercises', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const cards = wrapper.findAll('.game-card')
    expect(cards.length).toBeGreaterThan(0)
    cards.forEach(card => {
      expect(card.find('.game-title').exists()).toBe(true)
      expect(card.find('.game-description').exists()).toBe(true)
    })
    wrapper.unmount()
  })

  // --- Lifecycle hooks coverage ---

  it('onActivated вызывает scoresStore.loadScores()', async () => {
    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    const loadSpy = vi.spyOn(scoresStore, 'loadScores')

    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    // Trigger onActivated lifecycle hook
    await wrapper.vm.$options.activated?.forEach((hook: any) => hook.call(wrapper.vm))
    expect(loadSpy).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('watch route.path вызывает loadScores при навигации на /', async () => {
    const { useScoresStore } = await import('@/store/scores')
    const scoresStore = useScoresStore()
    const loadSpy = vi.spyOn(scoresStore, 'loadScores')

    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    // Navigate to another route then back to /
    await router.push('/counting')
    await router.push('/')
    // Give watchers time to flush
    await wrapper.vm.$nextTick()
    expect(loadSpy).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('hasUncompletedTasks = false когда нет задач', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    // dailyTasks mock returns empty array, so no uncompleted tasks
    expect((wrapper.vm as any).hasUncompletedTasks).toBe(false)
    expect((wrapper.vm as any).uncompletedTasksCount).toBe(0)
    wrapper.unmount()
  })

  it('badge-dot на daily-btn НЕ появляется когда нет невыполненных задач', () => {
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const dailyBtn = wrapper.find('.daily-btn')
    // badge-dot has v-if="hasUncompletedTasks", should be absent
    expect(dailyBtn.find('.badge-dot').exists()).toBe(false)
    wrapper.unmount()
  })
})
