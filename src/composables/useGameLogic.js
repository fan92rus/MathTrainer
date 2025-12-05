import { ref, computed } from 'vue'

export function useGameLogic(totalQuestions = 10) {
  // Состояние игры
  const score = ref(0)
  const currentQuestion = ref(0)
  const answered = ref(false)
  const selectedIndex = ref(null)
  const gameOver = ref(false)
  const currentLevel = ref(1)
  const problems = ref([])
  const correctAnswers = ref(0)
  const totalAnswers = ref(0)
  
  // Вычисляемые свойства
  const progressPercent = computed(() => {
    return (currentQuestion.value / totalQuestions) * 100
  })
  
  const currentProblem = computed(() => {
    return problems.value[currentQuestion.value] || null
  })
  
  // Методы
  const initializeGame = () => {
    score.value = 0
    currentQuestion.value = 0
    answered.value = false
    selectedIndex.value = null
    gameOver.value = false
    currentLevel.value = 1
    problems.value = []
    correctAnswers.value = 0
    totalAnswers.value = 0
  }
  
  const selectAnswer = (index, correctIndex, onCorrect) => {
    // Блокируем, если уже выбран правильный ответ
    if (answered.value && selectedIndex.value === correctIndex) return
    
    // Считаем общий ответ только при первом выборе
    if (!answered.value) {
      totalAnswers.value++
    }
    
    selectedIndex.value = index
    
    // Если ответ правильный
    if (index === correctIndex) {
      answered.value = true
      score.value += 10
      correctAnswers.value++
      if (onCorrect) onCorrect()
      
      // Автоматический переход к следующему вопросу через 1.5 секунды
      setTimeout(() => {
        nextQuestion()
      }, 1500)
    }
    // Если ответ неправильный, просто подсвечиваем его, но не переходим дальше
  }
  
  const nextQuestion = () => {
    currentQuestion.value++
    answered.value = false
    selectedIndex.value = null
    
    if (currentQuestion.value >= totalQuestions) {
      gameOver.value = true
    } else {
      // Увеличиваем уровень каждые 3 вопроса
      if (currentQuestion.value % 3 === 0) {
        currentLevel.value++
      }
    }
  }
  
  const addProblem = (problem) => {
    problems.value.push(problem)
  }
  
  const generateAllProblems = (generator) => {
    for (let i = 0; i < totalQuestions; i++) {
      addProblem(generator())
    }
  }
  
  return {
    // Состояние
    score,
    currentQuestion,
    answered,
    selectedIndex,
    gameOver,
    currentLevel,
    problems,
    correctAnswers,
    totalAnswers,
    
    // Вычисляемые свойства
    progressPercent,
    currentProblem,
    
    // Методы
    initializeGame,
    selectAnswer,
    nextQuestion,
    addProblem,
    generateAllProblems
  }
}