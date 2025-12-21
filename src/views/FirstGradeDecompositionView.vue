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
          <h1 class="title">Выбери правильный состав числа</h1>
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
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useScoresStore } from '../store/scores';
  import { usePlayerStore } from '../store/player';
  import { useGameLogic } from '../composables/useGameLogic';
  import { useCoins } from '../composables/useCoins';
  import { generateFirstGradeDecompositionProblem } from '../utils/math';
  import ScoreDisplay from '../components/common/ScoreDisplay.vue';
  import ProgressBar from '../components/common/ProgressBar.vue';
  import StarRating from '../components/common/StarRating.vue';
  import AnswerOptions from '../components/common/AnswerOptions.vue';
  import GameOver from '../components/common/GameOver.vue';
  import CoinAnimation from '../components/common/CoinAnimation.vue';
  import CurrencyDisplay from '../components/player/CurrencyDisplay.vue';

  export default {
    name: 'FirstGradeDecompositionView',
    components: {
      ScoreDisplay,
      ProgressBar,
      StarRating,
      AnswerOptions,
      GameOver,
      CoinAnimation,
      CurrencyDisplay
    },
    setup() {
      const router = useRouter();
      const scoresStore = useScoresStore();
      const playerStore = usePlayerStore();
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
      const totalScore = scoresStore.firstGradeDecompositionScore || 0;

      // Обработчик выбора ответа
      const handleAnswerSelected = (index) => {
        const isCorrect = index === (currentProblem.value?.correctIndex || 0);

        selectAnswer(index, currentProblem.value?.correctIndex || 0, (points) => {
          // При правильном ответе обновляем общий счет с учетом количества ошибок
          scoresStore.updateFirstGradeDecompositionScore(points);

          // Выдаем монетки за правильный ответ
          if (isCorrect) {
            const errors = errorsPerQuestion.value[currentQuestion.value] || 0;
            awardCoins('decomposition', currentLevel.value, errors);
          }
        });
      };

      // Перезапуск игры
      const restartGame = () => {
        initializeGame();
        generateAllProblems(() => generateFirstGradeDecompositionProblem());
      };

      // Переход на главную
      const goToMain = () => {
        router.push('/');
      };

      // Инициализация при монтировании
      onMounted(() => {
        scoresStore.loadScores();
        playerStore.generateDailyTasks(); // Генерируем ежедневные задания
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
        handleAnswerSelected,
        restartGame,
        goToMain,
        showCoinAnimation,
        coinsEarned
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

  .plus-sign,
  .equals-sign {
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

    .plus-sign,
    .equals-sign {
      font-size: 24px;
    }
  }
</style>
