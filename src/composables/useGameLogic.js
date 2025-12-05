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
  }
  
  const selectAnswer = (index, correctIndex, onCorrect) => {
    if (answered.value) return
    
    answered.value = true
    selectedIndex.value = index
    
    if (index === correctIndex) {
      score.value += 10
      if (onCorrect) onCorrect()
    }
    
    setTimeout(() => {
      nextQuestion()
    }, 1500)
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