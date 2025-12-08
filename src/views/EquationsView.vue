<template>
  <div class="app-container">
    <div class="game-container">
      <div v-if="!gameOver" class="game-container-inner">
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button class="back-button" @click="goToMain">
              ← Назад
            </button>
            <div class="level-info">
              <span class="level-indicator">Уровень {{ currentLevelConfig.level }}: {{ currentLevelConfig.description }}</span>
            </div>
          </div>
          <h1 class="title">Реши уравнение</h1>
        </div>
        
        <ScoreDisplay
          :current-score="score"
          :total-score="totalScore"
          :current-question="currentQuestion"
          :total-questions="totalQuestions"
        />
        
        <!-- Информация о прогрессе до следующего уровня -->
        <div v-if="nextLevelInfo" class="level-progress">
          <div class="progress-text">
            До следующего уровня: {{ nextLevelInfo.scoreNeeded }} баллов
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: progressToNextLevelPercent + '%' }"
            ></div>
          </div>
        </div>
        
        <div class="math-expression">
          {{ currentProblem?.expression }}, чему равен x?
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
import { useGameLogic } from '../composables/useGameLogic'
import {
  generateEquationProblem,
  getEquationsLevelConfig,
  getNextEquationsLevel
} from '../utils/mathHelpers'
import ScoreDisplay from '../components/common/ScoreDisplay.vue'
import ProgressBar from '../components/common/ProgressBar.vue'
import StarRating from '../components/common/StarRating.vue'
import AnswerOptions from '../components/common/AnswerOptions.vue'
import GameOver from '../components/common/GameOver.vue'

export default {
  name: 'EquationsView',
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
    const totalQuestions = 5
    
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
    const totalScore = computed(() => scoresStore.equationsScore)
    
    // Получаем конфигурацию текущего уровня на основе общего счета
    const currentLevelConfig = computed(() =>
      getEquationsLevelConfig(totalScore.value)
    )
    
    // Получаем информацию о следующем уровне
    const nextLevelInfo = computed(() =>
      getNextEquationsLevel(totalScore.value)
    )
    
    // Вычисляем прогресс до следующего уровня в процентах
    const progressToNextLevelPercent = computed(() => {
      if (!nextLevelInfo.value) return 100 // Уже максимальный уровень
      
      const currentLevelMin = currentLevelConfig.value.minScore
      const nextLevelMin = nextLevelInfo.value.minScore
      
      if (nextLevelMin <= currentLevelMin) return 100
      
      const progress = ((totalScore.value - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100
      return Math.min(100, Math.max(0, progress))
    })
    
    // Обработчик выбора ответа
    const handleAnswerSelected = (index) => {
      selectAnswer(
        index,
        currentProblem.value?.correctIndex || 0,
        () => {
          // При правильном ответе обновляем общий счет
          // Количество баллов зависит от уровня сложности
          scoresStore.updateEquationsScore(currentLevelConfig.value.pointsPerCorrect)
        }
      )
    }
    
    // Перезапуск игры
    const restartGame = () => {
      initializeGame()
      generateAllProblems((previousX) => generateEquationProblem(totalScore.value, previousX))
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
      currentLevelConfig,
      nextLevelInfo,
      progressToNextLevelPercent,
      handleAnswerSelected,
      restartGame,
      goToMain
    }
  }
}
</script>

<style scoped>
.back-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(102, 126, 234, 0.4);
}

.level-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.level-indicator {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.level-progress {
  margin: 10px 0;
  padding: 10px;
  background-color: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.progress-text {
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 5px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}
</style>