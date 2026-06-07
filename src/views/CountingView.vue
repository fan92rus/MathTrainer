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
        <div class="game-main" :class="{ 'answer-mode-drag': answerMode === 'drag' }">
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

          <CountingModeSwitcher />

          <ScoreDisplay
            :current-score="score"
            :total-score="totalScore"
            :current-question="currentQuestion"
            :total-questions="totalQuestions"
          />

          <div class="math-expression">{{ currentProblem?.expression }} = ?</div>

          <!-- Mode toggle -->
          <div class="mode-toggle">
            <button
              class="mode-toggle__btn"
              :class="{ 'mode-toggle__btn--active': answerMode === 'tap' }"
              @click="answerMode = 'tap'"
            >👆 Нажми</button>
            <button
              class="mode-toggle__btn"
              :class="{ 'mode-toggle__btn--active': answerMode === 'drag' }"
              @click="answerMode = 'drag'"
            >🧱 Перетащи</button>
          </div>

          <AnswerOptions
            v-if="answerMode === 'tap'"
            :options="currentProblem?.options || []"
            :correct-index="currentProblem?.correctIndex || 0"
            :answered="answered"
            :selected-index="selectedIndex"
            @answer-selected="handleAnswerSelected"
          />
          <DragDropAnswer
            v-else
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
  import { onMounted, computed, watch, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useScoresStore } from '../store/scores';
  import { useSettingsStore } from '../store/settings';
  import { useDailyTasks } from '../composables/useDailyTasks';
  import { useGameLogic } from '../composables/useGameLogic';
  import { useAchievements, useSessionTimeTracker } from '../composables/useAchievements';
  import { useCoins } from '../composables/useCoins';
  import { generateCountingProblem } from '../utils/math';
  import ScoreDisplay from '../components/common/ScoreDisplay.vue';
  import ProgressBar from '../components/common/ProgressBar.vue';
  import StarRating from '../components/common/StarRating.vue';
  import AnswerOptions from '../components/common/AnswerOptions.vue';
  import DragDropAnswer from '../components/dragdrop/DragDropAnswer.vue';
  import GameOver from '../components/common/GameOver.vue';
  import AchievementManager from '../components/AchievementManager.vue';
  import CoinAnimation from '../components/common/CoinAnimation.vue';
  import CurrencyDisplay from '../components/player/CurrencyDisplay.vue';
  import CountingModeSwitcher from '../components/common/CountingModeSwitcher.vue';

  export default {
    name: 'CountingView',
    components: {
      ScoreDisplay,
      ProgressBar,
      StarRating,
      AnswerOptions,
      DragDropAnswer,
      GameOver,
      AchievementManager,
      CoinAnimation,
      CurrencyDisplay,
      CountingModeSwitcher
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

      // Mode toggle: 'tap' (AnswerOptions) or 'drag' (DragDropAnswer)
      // Mode toggle: use reactive object instead of ref to avoid
      // Options API + ref unwrapping issues on initial render
      const modeState = reactive({ current: 'tap' })
      const answerMode = computed({
        get: () => modeState.current,
        set: (v) => { modeState.current = v }
      })

      // Toggle answer mode between tap and drag
      function toggleAnswerMode() {
        modeState.current = modeState.current === 'tap' ? 'drag' : 'tap';
      }

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
          }
        });

        // При неправильном ответе — ничего не делаем
        if (!isCorrect) {
        }
      };

      // Перезапуск игры
      const restartGame = () => {
        initializeGame();
        currentStreak = 0; // Сбрасываем серию
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
        // Mode
        answerMode,
        toggleAnswerMode
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

/* Mode toggle */
.mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.mode-toggle__btn {
  padding: 6px 14px;
  border-radius: 20px;
  border: 2px solid var(--color-border-light);
  background: var(--color-bg-light);
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-toggle__btn:hover {
  background: var(--color-bg-accent);
}

.mode-toggle__btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* Drag mode: compact expression, more room for drag interaction */
@media (max-width: 480px) {
  .answer-mode-drag .math-expression {
    font-size: 22px;
    padding: 8px 0;
    margin: 4px 0;
  }
}
</style>
