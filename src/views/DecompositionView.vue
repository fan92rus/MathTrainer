<template>
  <div class="app-container">
    <div class="game-container">
      <div v-if="!gameOver" class="game-container-inner">
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="level-indicator">Уровень {{ currentLevel }}</span>
          </div>
          <h1 class="title">Выбери вариант разложения</h1>
        </div>
        
        <ScoreDisplay 
          :current-score="score" 
          :total-score="totalScore" 
          :current-question="currentQuestion" 
          :total-questions="totalQuestions" 
        />
        
        <div class="math-expression">
          {{ currentProblem?.expression }}
        </div>
        
        <ProgressBar :progress-percent="progressPercent" />
        
        <StarRating :score="score" />
        
        <AnswerOptions 
          :options="currentProblem?.options || []" 
          :correct-index="currentProblem?.correctIndex || 0" 
          :answered="answered" 
          :selected-index="selectedIndex" 
          @answer-selected="handleAnswerSelected" 
        />
      </div>
      
      <GameOver
        v-else
        :correct-answers="correctAnswers"
        :total-answers="totalAnswers"
        :score="score"
        @restart="restartGame"
        @exit="goToMain"
      />
    </div>
  </div>
</template>

<script>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScoresStore } from '../store/scores'
import { useSettingsStore } from '../store/settings'
import { useGameLogic } from '../composables/useGameLogic'
import { generateDecompositionProblem } from '../utils/mathHelpers'
import ScoreDisplay from '../components/common/ScoreDisplay.vue'
import ProgressBar from '../components/common/ProgressBar.vue'
import StarRating from '../components/common/StarRating.vue'
import AnswerOptions from '../components/common/AnswerOptions.vue'
import GameOver from '../components/common/GameOver.vue'

export default {
  name: 'DecompositionView',
  components: {
    ScoreDisplay,
    ProgressBar,
    StarRating,
    AnswerOptions,
    GameOver
  },
  setup() {
    const router = useRouter()
    const scoresStore = useScoresStore()
    const settingsStore = useSettingsStore()
    const totalQuestions = 10
    
    // Инициализируем игру
    const {
      score,
      currentQuestion,
      answered,
      selectedIndex,
      gameOver,
      currentLevel,
      progressPercent,
      currentProblem,
      correctAnswers,
      totalAnswers,
      initializeGame,
      selectAnswer,
      generateAllProblems
    } = useGameLogic(totalQuestions)
    
    // Загружаем общий счет
    const totalScore = scoresStore.decompositionScore
    
    // Получаем максимальное число из настроек класса
    const maxNumber = computed(() => settingsStore.maxDecompositionNumber)
    
    // Обработчик выбора ответа
    const handleAnswerSelected = (index) => {
      selectAnswer(
        index, 
        currentProblem.value?.correctIndex || 0, 
        () => {
          // При правильном ответе обновляем общий счет
          scoresStore.updateDecompositionScore(10)
        }
      )
    }
    
    // Перезапуск игры
    const restartGame = () => {
      initializeGame()
      generateAllProblems(() => generateDecompositionProblem(maxNumber.value))
    }
    
    // Переход на главную
    const goToMain = () => {
      router.push('/')
    }
    
    // Инициализация при монтировании
    onMounted(() => {
      scoresStore.loadScores()
      restartGame()
    })
    
    return {
      score,
      totalScore,
      currentQuestion,
      answered,
      selectedIndex,
      gameOver,
      currentLevel,
      progressPercent,
      currentProblem,
      correctAnswers,
      totalAnswers,
      totalQuestions,
      maxNumber,
      handleAnswerSelected,
      restartGame,
      goToMain
    }
  }
}
</script>

<style scoped>
</style>