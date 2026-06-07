<template>
  <div class="app-container">
    <AchievementManager />

    <!-- Анимация монеток -->
    <CoinAnimation
      v-if="showCoinAnimation"
      :amount="coinsEarned"
      @animationEnd="showCoinAnimation = false"
    />

    <div class="game-container">
      <div v-if="!gameOver" class="game-container-inner">
        <!-- Main game content -->
        <div class="game-main">
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: center">
              <button class="back-button" @click="goToMain">← Назад</button>
              <div style="display: flex; align-items: center; gap: 15px;">
                <span class="level-indicator">Уровень {{ currentLevel }}</span>
                <CurrencyDisplay />
              </div>
            </div>
            <h1 class="title">Реши пример</h1>
          </div>

          <div class="math-row">
            <div class="math-expression">{{ currentProblem?.expression }} = ?</div>
            <SessionStreakBar
              :current-streak="streakTracker.currentStreak.value"
              @milestone="onStreakMilestone"
            />
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
          </div>
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
  import { onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useScoresStore } from '../store/scores';
  import { usePlayerStore } from '../store/player';
  import { useSettingsStore } from '../store/settings';
  import { useDailyTasks } from '../composables/useDailyTasks';
  import { useGameLogic } from '../composables/useGameLogic';
  import { useAchievements, useSessionTimeTracker } from '../composables/useAchievements';
  import { useCoins } from '../composables/useCoins';
  import { useChallengeStreak } from '../composables/useChallengeStreak';
  import { generateCountingProblem } from '../utils/math';
  import ScoreDisplay from '../components/common/ScoreDisplay.vue';
  import ProgressBar from '../components/common/ProgressBar.vue';
  import AnswerOptions from '../components/common/AnswerOptions.vue';
  import GameOver from '../components/common/GameOver.vue';
  import AchievementManager from '../components/AchievementManager.vue';
  import CoinAnimation from '../components/common/CoinAnimation.vue';
  import CurrencyDisplay from '../components/player/CurrencyDisplay.vue';
  import SessionStreakBar from '../components/common/SessionStreakBar.vue';

  export default {
    name: 'CountingView',
    components: {
      ScoreDisplay,
      ProgressBar,
      AnswerOptions,
      GameOver,
      AchievementManager,
      CoinAnimation,
      CurrencyDisplay,
      SessionStreakBar
    },
    setup() {
      const router = useRouter();
      const scoresStore = useScoresStore();
      const settingsStore = useSettingsStore();
      const { ensureTasks } = useDailyTasks();
      const { checkAchievements } = useAchievements();
      const { startSession, addProblem, getSessionData } = useSessionTimeTracker();
      const { showCoinAnimation, coinsEarned, awardCoins } = useCoins();
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
      const totalScore = scoresStore.countingScore;

      // Получаем максимальное число из настроек класса
      const maxNumber = computed(() => settingsStore.maxCountingNumber);

      // Отслеживание текущей серии правильных ответов
      const playerStore = usePlayerStore();
      const streakTracker = useChallengeStreak();

      // Обработчик выбора ответа
      const handleAnswerSelected = (index) => {
        const isCorrect = index === (currentProblem.value?.correctIndex || 0);

        if (isCorrect) {
          streakTracker.recordCorrect();
        } else {
          streakTracker.recordIncorrect();
        }

        selectAnswer(index, currentProblem.value?.correctIndex || 0, (points) => {
          // При правильном ответе обновляем общий счет с учетом количества ошибок
          scoresStore.updateCountingScore(points);

          // Выдаем монетки за правильный ответ
          if (isCorrect) {
            const errors = errorsPerQuestion.value[currentQuestion.value] || 0;
            awardCoins('counting', currentLevel.value, errors);

            // Проверяем ачивки после правильного ответа
            checkAchievements(scoresStore, {
              type: 'counting',
              correct: true,
              streak: streakTracker.currentStreak.value,
              ...getSessionData()
            });
          }
        });

        // При неправильном ответе — ничего не делаем
        if (!isCorrect) {
        }
      };

      // Награда за мильный камень стрика
      function onStreakMilestone(milestone) {
        const bonus = milestone >= 10 ? 10 : milestone >= 7 ? 7 : milestone >= 5 ? 5 : 3;
        playerStore.addCoins(bonus);
      }

      // Перезапуск игры
      const restartGame = () => {
        initializeGame();
        streakTracker.reset(); // Сбрасываем серию
        startSession(); // Начинаем новую сессию
        generateAllProblems(() => {
          return generateCountingProblem(
            scoresStore.countingScore,
            currentLevel.value,
            maxNumber.value
          );
        });
      };

      // Переход на главную
      const goToMain = () => {
        router.push('/');
      };

      // Инициализация при монтировании
      onMounted(() => {
        scoresStore.loadScores();
        ensureTasks(); // Генерируем ежедневные задания
        restartGame();
      });

      // Следим за сменой вопросов для отслеживания сессии
      watch(currentQuestion, () => {
        addProblem(); // Увеличиваем счетчик решенных примеров
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
        showCoinAnimation,
        coinsEarned,
        onStreakMilestone,
        streakTracker,
      };
    }
  };
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
}

.game-container-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* Main game content column */
.game-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
}

/* Math row: expression + streak chip side by side */
.math-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}
</style>
