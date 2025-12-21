<template>
  <div class="app-container">
    <AchievementManager />
    <div class="game-container">
      <div v-if="!gameOver" class="game-container-inner">
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <button class="back-button" @click="goToMain">← Назад</button>
            <span class="level-indicator">Уровень {{ currentLevel }}</span>
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
  import { onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useScoresStore } from '../store/scores';
  import { useSettingsStore } from '../store/settings';
  import { useGameLogic } from '../composables/useGameLogic';
  import { useAchievements, useSessionTimeTracker } from '../composables/useAchievements';
  import { generateCountingProblem } from '../utils/math';
  import ScoreDisplay from '../components/common/ScoreDisplay.vue';
  import ProgressBar from '../components/common/ProgressBar.vue';
  import StarRating from '../components/common/StarRating.vue';
  import AnswerOptions from '../components/common/AnswerOptions.vue';
  import GameOver from '../components/common/GameOver.vue';
  import AchievementManager from '../components/AchievementManager.vue';

  export default {
    name: 'CountingView',
    components: {
      ScoreDisplay,
      ProgressBar,
      StarRating,
      AnswerOptions,
      GameOver,
      AchievementManager
    },
    setup() {
      const router = useRouter();
      const scoresStore = useScoresStore();
      const settingsStore = useSettingsStore();
      const { checkAchievements } = useAchievements();
      const { startSession, addProblem, getSessionData } = useSessionTimeTracker();
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

          // Проверяем ачивки после правильного ответа
          if (isCorrect) {
            checkAchievements(scoresStore, {
              type: 'counting',
              correct: true,
              streak: currentStreak,
              ...getSessionData()
            });
          }
        });
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
        goToMain
      };
    }
  };
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
</style>
