import { ref, computed } from 'vue'
import { calculateExercisePoints } from '../utils/gradeHelpers'

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
  const errorsPerQuestion = ref([]) // Массив для хранения количества ошибок по каждому вопросу
  
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
    errorsPerQuestion.value = []
  }
  
  const selectAnswer = (index, correctIndex, onCorrect) => {
    // Блокируем, если уже выбран правильный ответ
    if (answered.value && selectedIndex.value === correctIndex) return
    
    // Считаем общий ответ только при первом выборе
    if (!answered.value) {
      totalAnswers.value++
      // Инициализируем счетчик ошибок для текущего вопроса
      if (errorsPerQuestion.value.length <= currentQuestion.value) {
        errorsPerQuestion.value[currentQuestion.value] = 0
      }
    }
    
    selectedIndex.value = index
    
    // Если ответ правильный
    if (index === correctIndex) {
      answered.value = true
      // Начисляем очки в зависимости от количества ошибок
      // Важно: используем текущее количество ошибок до увеличения счетчика
      const errors = errorsPerQuestion.value[currentQuestion.value] || 0
      const points = calculateExercisePoints(errors)
      console.log(`Правильный ответ! Вопрос ${currentQuestion.value}, ошибок: ${errors}, очков: ${points}`)
      score.value += points
      correctAnswers.value++
      if (onCorrect) onCorrect(points) // Передаем количество очков в колбэк
      
      // Автоматический переход к следующему вопросу через 1.5 секунды
      setTimeout(() => {
        nextQuestion()
      }, 1500)
    }
    // Если ответ неправильный, увеличиваем счетчик ошибок
    else {
      errorsPerQuestion.value[currentQuestion.value]++
      console.log(`Неправильный ответ! Вопрос ${currentQuestion.value}, всего ошибок: ${errorsPerQuestion.value[currentQuestion.value]}`)
    }
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
    let previousX = null
    
    for (let i = 0; i < totalQuestions; i++) {
      // Передаем предыдущее значение X в генератор
      const problem = generator(previousX)
      addProblem(problem)
      
      // Обновляем предыдущее значение X для следующей итерации
      previousX = problem.xValue || null
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
    errorsPerQuestion,
    
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