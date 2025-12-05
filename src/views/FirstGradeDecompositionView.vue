<template>
  <div class="app-container">
    <div class="game-container">
      <div v-if="!gameOver" class="game-container-inner">
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="level-indicator">Уровень {{ currentLevel }}</span>
          </div>
          <h1 class="title">Выбери правильное разложение</h1>
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
        :current-score="score" 
        :total-score="totalScore" 
        @restart-game="restartGame" 
        @go-to-main="goToMain" 
      />
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScoresStore } from '../store/scores'
import { useGameLogic } from '../composables/useGameLogic'
import { generateFirstGradeDecompositionProblem } from '../utils/mathHelpers'
import ScoreDisplay from '../components/common/ScoreDisplay.vue'
import ProgressBar from '../components/common/ProgressBar.vue'
import StarRating from '../components/common/StarRating.vue'
import AnswerOptions from '../components/common/AnswerOptions.vue'
import GameOver from '../components/common/GameOver.vue'

export default {
  name: 'FirstGradeDecompositionView',
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
      initializeGame,
      selectAnswer,
      generateAllProblems
    } = useGameLogic(totalQuestions)
    
    // Загружаем общий счет
    const totalScore = scoresStore.firstGradeDecompositionScore || 0
    
    // Обработчик выбора ответа
    const handleAnswerSelected = (index) => {
      selectAnswer(
        index, 
        currentProblem.value?.correctIndex || 0, 
        () => {
          // При правильном ответе обновляем общий счет
          scoresStore.updateFirstGradeDecompositionScore(10)
        }
      )
    }
    
    // Перезапуск игры
    const restartGame = () => {
      initializeGame()
      generateAllProblems(() => generateFirstGradeDecompositionProblem())
    }
    
    // Переход на главную
    const goToMain = () => {
      router.push('/')
    }
    
    // Инициализация при монтировании
    onMounted(() => {
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
      totalQuestions,
      handleAnswerSelected,
      restartGame,
      goToMain
    }
  }
}
</script>

<style scoped>
.decomposition-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
}

.target-number {
  font-size: 48px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 20px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(102, 126, 234, 0.1);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
}

.decomposition-parts {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.part {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.part-number {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(102, 126, 234, 0.1);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
}

.part-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.plus-sign, .equals-sign {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin: 0 5px;
}

@media (max-width: 768px) {
  .target-number {
    font-size: 36px;
    width: 60px;
    height: 60px;
  }
  
  .decomposition-parts {
    gap: 5px;
  }
  
  .part-number {
    font-size: 24px;
    width: 45px;
    height: 45px;
  }
  
  .part-label {
    font-size: 12px;
  }
  
  .plus-sign, .equals-sign {
    font-size: 24px;
  }
}
</style>