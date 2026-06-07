<template>
  <div class="app-container">
    <!-- Анимация монеток -->
    <CoinAnimation
      v-if="showCoinAnimation"
      :amount="coinsEarned"
      @animationEnd="showCoinAnimation = false"
    />

    <div class="game-container">
      <div v-if="!gameOver" class="game-container-inner">
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <button class="back-button" @click="goToMain">← Назад</button>
            <div style="display: flex; align-items: center; gap: 15px;">
              <div class="level-info">
                <span class="level-indicator"
                  >Уровень {{ currentLevelConfig.level }}: {{ currentLevelConfig.description }}</span
                >
              </div>
              <CurrencyDisplay />
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
            <div class="progress-fill" :style="{ width: progressToNextLevelPercent + '%' }"></div>
          </div>
        </div>

        <div class="math-expression">{{ currentProblem?.expression }}, чему равен x?</div>

        <SessionStreakBar
          :current-streak="streakTracker.currentStreak.value"
          @milestone="onStreakMilestone"
        />

        <!-- Кнопка перехода к ручному режиму -->
        <div v-if="totalScore >= 50" class="manual-mode-container">
          <button class="manual-mode-button" @click="goToManualMode">
            🎯 Режим с вводом ответа
          </button>
          <p class="manual-mode-hint">
            Набрано достаточно очков для режима с ручным вводом ответов!
          </p>
        </div>

        <AnswerOptions
          :options="currentProblem?.options || []"
          :correct-index="currentProblem?.correctIndex || 0"
          :answered="answered"
          :selected-index="selectedIndex"
          @answer-selected="handleAnswerSelected"
        />

        <div class="game-container-footer">
          <ProgressBar :progress-percent="progressPercent" />
          <StarRating :score="score" />
        </div>
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
  import { onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useScoresStore } from '../store/scores';
  import { useGameLogic } from '../composables/useGameLogic';
  import { useCoins } from '../composables/useCoins';
  import { useChallengeStreak } from '../composables/useChallengeStreak';
  import { usePlayerStore } from '../store/player';
  import { useDailyTasks } from '@/composables/useDailyTasks';
  import {
    generateEquationProblem,
    getEquationsLevelConfig,
    getNextEquationsLevel
  } from '../utils/math/index';
  import ScoreDisplay from '../components/common/ScoreDisplay.vue';
  import ProgressBar from '../components/common/ProgressBar.vue';
  import StarRating from '../components/common/StarRating.vue';
  import AnswerOptions from '../components/common/AnswerOptions.vue';
  import GameOver from '../components/common/GameOver.vue';
  import CoinAnimation from '../components/common/CoinAnimation.vue';
  import CurrencyDisplay from '../components/player/CurrencyDisplay.vue';
  import SessionStreakBar from '../components/common/SessionStreakBar.vue';

  export default {
    name: 'EquationsView',
    components: {
      ScoreDisplay,
      ProgressBar,
      StarRating,
      AnswerOptions,
      GameOver,
      CoinAnimation,
      CurrencyDisplay,
      SessionStreakBar
    },
    setup() {
      const router = useRouter();
      const scoresStore = useScoresStore();
      const { showCoinAnimation, coinsEarned, awardCoins } = useCoins();
      const { ensureTasks } = useDailyTasks();
      const playerStore = usePlayerStore();
      const streakTracker = useChallengeStreak();
      const totalQuestions = 5;

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
        errorsPerQuestion,
        initializeGame,
        selectAnswer,
        generateAllProblems
      } = useGameLogic(totalQuestions);

      // Загружаем общий счет
      const totalScore = computed(() => scoresStore.equationsScore);

      // Получаем конфигурацию текущего уровня на основе общего счета
      const currentLevelConfig = computed(() => getEquationsLevelConfig(totalScore.value));

      // Получаем информацию о следующем уровне
      const nextLevelInfo = computed(() => getNextEquationsLevel(totalScore.value));

      // Вычисляем прогресс до следующего уровня в процентах
      const progressToNextLevelPercent = computed(() => {
        if (!nextLevelInfo.value) return 100; // Уже максимальный уровень

        const currentLevelRequired = currentLevelConfig.value.requiredScore || 0;
        const nextLevelRequired = nextLevelInfo.value.nextLevelConfig?.requiredScore || 0;

        if (nextLevelRequired <= currentLevelRequired) return 100;

        const progress =
          ((totalScore.value - currentLevelRequired) / (nextLevelRequired - currentLevelRequired)) * 100;
        return Math.min(100, Math.max(0, progress));
      });

      // Обработчик выбора ответа
      const handleAnswerSelected = (index) => {
        const isCorrect = index === (currentProblem.value?.correctIndex || 0);

        if (isCorrect) {
          streakTracker.recordCorrect();
        } else {
          streakTracker.recordIncorrect();
        }

        selectAnswer(index, currentProblem.value?.correctIndex || 0, (points) => {
          // При правильном ответе обновляем общий счет
          // Используем базовые очки с учетом сложности уровня
          const levelMultiplier = currentLevelConfig.value.complexity || 1;
          const adjustedPoints = Math.round(points * levelMultiplier);
          scoresStore.updateEquationsScore(adjustedPoints);

          // Выдаем монетки за правильный ответ
          if (isCorrect) {
            const errors = errorsPerQuestion.value[currentQuestion.value] || 0;
            awardCoins('equations', currentLevelConfig.value.level || 1, errors);
          }
        });
      };

      // Перезапуск игры
      function onStreakMilestone(milestone) {
        const bonus = milestone >= 10 ? 10 : milestone >= 7 ? 7 : milestone >= 5 ? 5 : 3;
        playerStore.addCoins(bonus);
      }

      const restartGame = () => {
        initializeGame();
        streakTracker.reset();
        generateAllProblems((previousX) => generateEquationProblem(totalScore.value, previousX));
      };

      // Переход на главную
      const goToMain = () => {
        router.push('/');
      };

      // Переход к ручному режиму
      const goToManualMode = () => {
        router.push('/manual-equations');
      };

      // Инициализация при монтировании
      onMounted(() => {
        scoresStore.loadScores();
        ensureTasks(); // Генерируем ежедневные задания
        restartGame();
      });

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
        goToMain,
        goToManualMode,
        showCoinAnimation,
        coinsEarned,
        streakTracker,
        onStreakMilestone
      };
    }
  };
</script>

<style scoped>

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

  .manual-mode-container {
    margin: 20px 0;
    text-align: center;
  }

  .manual-mode-button {
    background: linear-gradient(135deg, #48bb78, #38a169);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
    margin-bottom: 8px;
  }

  .manual-mode-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(72, 187, 120, 0.4);
  }

  .manual-mode-hint {
    font-size: 14px;
    color: #718096;
    margin: 0;
  }
</style>
