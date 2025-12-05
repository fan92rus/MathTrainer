<template>
  <div class="app-container">
    <div class="game-container">
      <div class="main-container">
        <div v-if="isGradeSelected" class="grade-info-container">
          <div class="grade-info">
            <span class="grade-label">Текущий класс:</span>
            <span class="grade-value">{{ gradeName }}, {{ quarterName }}</span>
          </div>
          <button class="change-grade-button" @click="changeGrade">
            Изменить класс
          </button>
        </div>

        <div class="scores-container">
          <div class="score-card-title">счет - ⭐ {{ countingScore }}</div>
          <div class="score-card-title">разложение - ⭐ {{ decompositionScore }}</div>
          <div class="score-card-title">разложение (1 кл) - ⭐ {{ firstGradeDecompositionScore }}</div>
          <div class="score-card-title">умножение - ⭐ {{ multiplicationScore }}</div>
        </div>

        <div class="games-container">
          <div class="game-card" @click="goToFirstGradeDecomposition">
            <div class="game-icon">🔢</div>
            <div class="game-title">Разложение чисел (1 класс)</div>
            <div class="game-description">Изучи состав чисел до 10</div>
          </div>
          <div class="game-card" @click="goToDecomposition">
            <div class="game-icon">➕</div>
            <div class="game-title">Разложение чисел</div>
            <div class="game-description">Выбирай правильный способ разложения чисел</div>
          </div>
          <div class="game-card" @click="goToCounting">
            <div class="game-icon">🔢</div>
            <div class="game-title">Тренажер счета</div>
            <div class="game-description">Решай примеры на сложение и вычитание</div>
          </div>
          <div class="game-card" @click="goToMultiplication">
            <div class="game-icon">✖️</div>
            <div class="game-title">Таблица умножения</div>
            <div class="game-description">Изучай таблицу умножения постепенно</div>
          </div>
        </div>

        <button class="reset-button" @click="resetAllScores">
          Сбросить все очки
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScoresStore } from '../store/scores'
import { useSettingsStore } from '../store/settings'
import { getGradeName, getQuarterName } from '../utils/gradeHelpers'

export default {
  name: 'HomeView',
  setup() {
    const router = useRouter()
    const scoresStore = useScoresStore()
    const settingsStore = useSettingsStore()
    
    // Загружаем очки и настройки при монтировании компонента
    scoresStore.loadScores()
    settingsStore.loadSettings()
    
    // Вычисляемые свойства
    const countingScore = computed(() => scoresStore.countingScore)
    const decompositionScore = computed(() => scoresStore.decompositionScore)
    const firstGradeDecompositionScore = computed(() => scoresStore.firstGradeDecompositionScore)
    const multiplicationScore = computed(() => scoresStore.multiplicationScore)
    const isGradeSelected = computed(() => settingsStore.isGradeSelected)
    const selectedGrade = computed(() => settingsStore.selectedGrade)
    const currentQuarter = computed(() => settingsStore.currentQuarter)
    const gradeName = computed(() => getGradeName(selectedGrade.value))
    const quarterName = computed(() => getQuarterName(currentQuarter.value))
    const difficultySettings = computed(() => settingsStore.difficultySettings)
    
    // Методы
    const goToCounting = () => {
      router.push('/counting')
    }
    
    const goToDecomposition = () => {
      router.push('/decomposition')
    }
    
    const goToFirstGradeDecomposition = () => {
      router.push('/first-grade-decomposition')
    }
    
    const goToMultiplication = () => {
      router.push('/multiplication')
    }
    
    const resetAllScores = () => {
      if (confirm('Вы уверены, что хотите сбросить все накопленные очки во всех играх?')) {
        scoresStore.resetAllScores()
      }
    }
    
    const changeGrade = () => {
      if (confirm('Вы хотите изменить класс? Это изменит настройки сложности для новых заданий, но сохранит все ваши накопленные очки.')) {
        settingsStore.resetSettings()
        // После сброса настроек компонент GradeSelection покажется автоматически
      }
    }
    
    
    return {
      countingScore,
      decompositionScore,
      firstGradeDecompositionScore,
      multiplicationScore,
      isGradeSelected,
      gradeName,
      quarterName,
      goToCounting,
      goToDecomposition,
      goToFirstGradeDecomposition,
      goToMultiplication,
      resetAllScores,
      changeGrade
    }
  }
}
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  flex: 1;
}

.grade-info-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-radius: 15px;
  padding: 15px 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.grade-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.grade-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.grade-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.change-grade-button {
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

.change-grade-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(102, 126, 234, 0.4);
}

.buttons-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 40px;
}

.difficulty-info-button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: clamp(14px, 3vw, 16px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.difficulty-info-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4);
}

.main-title {
  font-size: clamp(32px, 6vw, 48px);
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.scores-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.score-card-title {
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-radius: 20px;
  padding: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 70px;
  transition: transform 0.3s ease;
  font-size: clamp(16px, 3vw, 20px);
  color: #666;
  margin-bottom: 10px;
}

.games-container {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.game-card {
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 200px;
  position: relative;
  overflow: hidden;
}

.game-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #FF9A8B, #FF6A88, #FF99AC);
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.game-icon {
  font-size: clamp(30px, 8vw, 64px);
  margin-bottom: 15px;
}

.game-title {
  font-size: clamp(20px, 4vw, 24px);
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.game-description {
  font-size: clamp(14px, 2.5vw, 16px);
  color: #666;
  margin-bottom: 20px;
}

.reset-button {
  margin-top: 40px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: clamp(14px, 3vw, 16px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
}

.reset-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(255, 107, 107, 0.4);
}

@media (max-width: 768px) {
  .main-container {
    padding: 15px;
  }

  .grade-info-container {
    margin-bottom: 15px;
    padding: 12px 15px;
  }

  .grade-value {
    font-size: 16px;
  }

  .change-grade-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  .scores-container {
    gap: 10px;
    margin-bottom: 15px;
  }

  .score-card-title {
    min-width: 120px;
    padding: 8px 12px;
    font-size: 14px;
  }

  .games-container {
    gap: 15px;
    margin-bottom: 20px;
  }

  .game-card {
    min-width: 140px;
    padding: 15px;
  }

  .game-icon {
    font-size: 40px;
    margin-bottom: 10px;
  }

  .game-title {
    font-size: 18px;
    margin-bottom: 8px;
  }

  .game-description {
    font-size: 13px;
    margin-bottom: 15px;
  }

  .reset-button {
    margin-top: 20px;
    padding: 8px 16px;
    font-size: 13px;
  }
}

/* Для очень маленьких экранов */
@media (max-width: 480px) {
  .main-container {
    padding: 10px;
  }

  .grade-info-container {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }

  .grade-info {
    align-items: center;
  }

  .change-grade-button {
    width: 100%;
    max-width: 200px;
  }

  .scores-container {
    gap: 8px;
    margin-bottom: 12px;
  }

  .score-card-title {
    min-width: 100px;
    padding: 6px 10px;
    font-size: 12px;
  }

  .games-container {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .game-card {
    width: 100%;
    max-width: 300px;
    min-width: auto;
    padding: 12px;
  }

  .game-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .game-title {
    font-size: 16px;
    margin-bottom: 6px;
  }

  .game-description {
    font-size: 12px;
    margin-bottom: 10px;
  }

  .reset-button {
    margin-top: 15px;
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>