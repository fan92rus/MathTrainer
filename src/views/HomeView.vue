<template>
  <div class="app-container">
    <div class="game-container">
      <div class="main-container">
        <div class="scores-container">
          <div class="score-card-title">счет - ⭐ {{ countingScore }}</div>
          <div class="score-card-title">разложение - ⭐ {{ decompositionScore }}</div>
        </div>

        <div class="games-container">
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
        </div>

        <button class="reset-button" @click="resetAllScores">
          Сбросить все очки
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScoresStore } from '../store/scores'

export default {
  name: 'HomeView',
  setup() {
    const router = useRouter()
    const scoresStore = useScoresStore()
    
    // Загружаем очки при монтировании компонента
    scoresStore.loadScores()
    
    // Вычисляемые свойства
    const countingScore = computed(() => scoresStore.countingScore)
    const decompositionScore = computed(() => scoresStore.decompositionScore)
    
    // Методы
    const goToCounting = () => {
      router.push('/counting')
    }
    
    const goToDecomposition = () => {
      router.push('/decomposition')
    }
    
    const resetAllScores = () => {
      if (confirm('Вы уверены, что хотите сбросить все накопленные очки в обеих играх?')) {
        scoresStore.resetAllScores()
      }
    }
    
    return {
      countingScore,
      decompositionScore,
      goToCounting,
      goToDecomposition,
      resetAllScores
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
  .scores-container {
    gap: 15px;
  }

  .games-container {
    gap: 20px;
  }

  .score-card-title {
    min-width: 150px;
    padding: 15px;
  }

  .game-card {
    min-width: 160px;
    padding: 10px;
  }
}
</style>