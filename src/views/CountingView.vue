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

          <ScoreDisplay
            :current-score="score"
            :total-score="totalScore"
            :current-question="currentQuestion"
            :total-questions="totalQuestions"
          />

          <div class="math-expression">{{ currentProblem?.expression }} = ?</div>

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

        <!-- Tower (Pattern 7 — side on desktop, below on mobile) -->
        <Tower
          class="counting-tower"
          :floors="towerFloors"
          :target-height="towerTargetHeight"
          theme="castle"
          :completed="towerCompleted"
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
  import { onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useScoresStore } from '../store/scores';
  import { useSettingsStore } from '../store/settings';
  import { useDailyTasks } from '../composables/useDailyTasks';
  import { useGameLogic } from '../composables/useGameLogic';
  import { useAchievements, useSessionTimeTracker } from '../composables/useAchievements';
  import { useCoins } from '../composables/useCoins';
  import { useTower } from '../composables/useTower';
  import { generateCountingProblem } from '../utils/math';
  import ScoreDisplay from '../components/common/ScoreDisplay.vue';
  import ProgressBar from '../components/common/ProgressBar.vue';
  import StarRating from '../components/common/StarRating.vue';
  import AnswerOptions from '../components/common/AnswerOptions.vue';
  import GameOver from '../components/common/GameOver.vue';
  import AchievementManager from '../components/AchievementManager.vue';
  import CoinAnimation from '../components/common/CoinAnimation.vue';
  import CurrencyDisplay from '../components/player/CurrencyDisplay.vue';
  import Tower from '../components/tower/Tower.vue';

  export default {
    name: 'CountingView',
    components: {
      ScoreDisplay,
      ProgressBar,
      StarRating,
      AnswerOptions,
      GameOver,
      AchievementManager,
      CoinAnimation,
      CurrencyDisplay,
      Tower
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

      // Tower integration (Pattern 7 — "Строим башню")
      // targetHeight based on grade per PRD §7.2
      const grade = settingsStore.selectedGrade;
      const towerTargetHeight = !grade || grade <= 1 ? 10 : grade === 2 ? 12 : 15;
      const towerMilestones = [Math.floor(towerTargetHeight / 2), towerTargetHeight];

      const {
        floors: towerFloors,
        completed: towerCompleted,
        addFloor,
        showWaitingFloor,
        resetTower
      } = useTower({
        theme: 'castle',
        targetHeight: towerTargetHeight,
        milestones: towerMilestones
      });

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
      let currentStreak = 0;

      // Обработчик выбора ответа
      const handleAnswerSelected = (index) => {
        const isCorrect = index === (currentProblem.value?.correctIndex || 0);

        if (isCorrect) {
          currentStreak++;
        } else {
          currentStreak = 0;
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
              streak: currentStreak,
              ...getSessionData()
            });

            // Добавляем этаж в башню
            const expr = currentProblem.value?.expression || '';
            const answer = currentProblem.value?.options[currentProblem.value.correctIndex];
            addFloor(expr, answer);
          }
        });

        // При неправильном ответе — башня ждёт
        if (!isCorrect) {
          showWaitingFloor();
        }
      };

      // Перезапуск игры
      const restartGame = () => {
        initializeGame();
        currentStreak = 0; // Сбрасываем серию
        resetTower(); // Сбрасываем башню
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
        // Tower
        towerFloors,
        towerCompleted,
        towerTargetHeight
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

/* Desktop: tower sits to the right of the game area */
@media (min-width: 769px) {
  .game-container-inner {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: 24px;
  }

  .game-main {
    flex: 0 1 auto;
  }

  .counting-tower {
    flex-shrink: 0;
    align-self: stretch;
    max-height: 70vh;
  }
}

/* Mobile: tower below the footer */
@media (max-width: 768px) {
  .counting-tower {
    align-self: center;
  }
}
</style>
