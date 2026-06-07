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
              <span class="level-indicator">Уровень {{ currentLevel }}</span>
              <CurrencyDisplay />
            </div>
          </div>
          <h1 class="title">Выбери удобный вариант решения</h1>
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

        <SessionStreakBar
          :current-streak="streakTracker.currentStreak.value"
          @milestone="onStreakMilestone"
        />

        <!-- Кнопка перехода к ручному режиму -->
        <div v-if="totalScore >= 30" class="manual-mode-container">
          <button class="manual-mode-button" @click="goToManualMode">
            🧩 Режим с пошаговым вводом
          </button>
          <p class="manual-mode-hint">
            Набрано достаточно очков для режима с пошаговым разложением чисел!
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

<script lang="ts">
  import { onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useScoresStore } from '../store/scores';
  import { useSettingsStore } from '../store/settings';
  import { useGameLogic } from '../composables/useGameLogic';
  import { useCoins } from '../composables/useCoins';
  import { useChallengeStreak } from '../composables/useChallengeStreak';
  import { usePlayerStore } from '../store/player';
  import { useDailyTasks } from '@/composables/useDailyTasks';
  import { generateDecompositionProblem } from '../utils/math/index';
    import ScoreDisplay from '../components/common/ScoreDisplay.vue';
  import ProgressBar from '../components/common/ProgressBar.vue';
  import StarRating from '../components/common/StarRating.vue';
  import AnswerOptions from '../components/common/AnswerOptions.vue';
  import GameOver from '../components/common/GameOver.vue';
  import CoinAnimation from '../components/common/CoinAnimation.vue';
  import CurrencyDisplay from '../components/player/CurrencyDisplay.vue';
  import SessionStreakBar from '../components/common/SessionStreakBar.vue';

  export default {
    name: 'DecompositionView',
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
      const settingsStore = useSettingsStore();
      const { showCoinAnimation, coinsEarned, awardCoins } = useCoins();
      const { ensureTasks } = useDailyTasks();
      const playerStore = usePlayerStore();
      const streakTracker = useChallengeStreak();
      const totalQuestions = 10;

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
      const totalScore = computed(() => scoresStore.decompositionScore);

      // Получаем максимальное число из настроек класса
      const maxNumber = computed(() => settingsStore.maxDecompositionNumber);

      // Определяем уровень на основе общего количества очков (как в уравнениях)
      const getLevelByScore = (score: number): number => {
        if (score >= 400) return 9;    // 400+ очков: уровень 9
        if (score >= 350) return 8;    // 350-399 очков: уровень 8
        if (score >= 300) return 7;    // 300-349 очков: уровень 7
        if (score >= 250) return 6;    // 250-299 очков: уровень 6
        if (score >= 200) return 5;    // 200-249 очков: уровень 5
        if (score >= 150) return 4;    // 150-199 очков: уровень 4
        if (score >= 100) return 3;    // 100-149 очков: уровень 3
        if (score >= 50) return 2;     // 50-99 очков: уровень 2
        return 1;                      // 0-49 очков: уровень 1
      };

      // Текущий уровень на основе общего счета
      const currentLevelByScore = computed(() => getLevelByScore(totalScore.value));

      // Обработчик выбора ответа
      const handleAnswerSelected = (index: number) => {
        const isCorrect = index === (currentProblem.value?.correctIndex || 0);

        if (isCorrect) {
          streakTracker.recordCorrect();
        } else {
          streakTracker.recordIncorrect();
        }

        selectAnswer(index, currentProblem.value?.correctIndex || 0, (points) => {
          // При правильном ответе обновляем общий счет с учетом количества ошибок
          scoresStore.updateDecompositionScore(points);

          // Выдаем монетки за правильный ответ
          if (isCorrect) {
            const errors = errorsPerQuestion.value[currentQuestion.value] || 0;
            awardCoins('decomposition', currentLevel.value, errors);
          }
        });
      };

      // Перезапуск игры
      function onStreakMilestone(milestone: number) {
        const bonus = milestone >= 10 ? 10 : milestone >= 7 ? 7 : milestone >= 5 ? 5 : 3;
        playerStore.addCoins(bonus);
      }

      const restartGame = () => {
        initializeGame();
        streakTracker.reset();
        // Генерируем задачи с учетом уровня на основе очков
        const level = currentLevelByScore.value;
        generateAllProblems(() =>
          generateDecompositionProblem(maxNumber.value, level)
        );
      };

      // Переход на главную
      const goToMain = () => {
        router.push('/');
      };

      // Переход к ручному режиму
      const goToManualMode = () => {
        router.push('/manual-decomposition');
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
        maxNumber,
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

  .manual-mode-container {
    margin: 20px 0;
    text-align: center;
  }

  .manual-mode-button {
    background: linear-gradient(135deg, #ed8936, #dd6b20);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(237, 137, 54, 0.3);
    margin-bottom: 8px;
  }

  .manual-mode-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(237, 137, 54, 0.4);
  }

  .manual-mode-hint {
    font-size: 14px;
    color: #718096;
    margin: 0;
  }
</style>
