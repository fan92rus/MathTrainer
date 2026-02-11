<template>
  <div class="app-container">
    <!-- Анимация монеток -->
    <CoinAnimation
      v-if="showCoinAnimation"
      :amount="coinsEarned"
      @animationEnd="showCoinAnimation = false"
    />

    <div class="game-container">
      <div class="main-container">
        <div class="header-container">
          <button class="back-button" @click="goBack">← Назад</button>
          <div style="display: flex; align-items: center; gap: 20px;">
            <div class="score-container">
              <div class="score-label">Очки:</div>
              <div class="score-value">⭐ {{ multiplicationScore }}</div>
            </div>
            <CurrencyDisplay />
          </div>
        </div>

        <div class="game-area" v-if="!showGameOver">
          <div class="level-info">
            <div class="current-level">Таблица умножения (доступно до {{ maxMultiplier }})</div>
            <div class="progress-info">
              <span>Следующий уровень через: {{ pointsToNextLevel }} очков</span>
            </div>
          </div>

          <div class="problem-container" v-if="currentProblem">
            <div class="problem-expression">{{ currentProblem.expression }} = ?</div>
            <div class="options-container">
              <button
                v-for="(option, index) in currentProblem.options"
                :key="index"
                class="option-button"
                :class="{
                  correct: selectedAnswer === index && index === currentProblem.correctIndex,
                  incorrect: selectedAnswer === index && index !== currentProblem.correctIndex
                }"
                @click="checkAnswer(index)"
                :disabled="isCorrect"
              >
                {{ option }}
              </button>
            </div>
            <div
              v-if="showFeedback"
              class="feedback"
              :class="{ 'correct-feedback': isCorrect, 'incorrect-feedback': !isCorrect }"
            >
              {{ isCorrect ? 'Правильно! 🎉' : 'Неправильно! Попробуйте еще раз.' }}
            </div>
          </div>

          <div class="progress-container">
            <div class="progress-info">
              <span>Правильных ответов: {{ correctAnswers }}</span>
              <span>Всего ответов: {{ totalAnswers }}</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{
                  width: `${totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0}%`
                }"
              ></div>
            </div>
          </div>
        </div>

        <GameOver
          v-else
          :correct-answers="correctAnswers"
          :total-answers="totalAnswers"
          :score="scoreGained"
          @restart="restartGame"
          @exit="goBack"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useScoresStore } from '../store/scores';
  import { useCoins } from '../composables/useCoins';
  import { useDailyTasks } from '@/composables/useDailyTasks';
  import { generateMultiplicationProblem } from '../utils/math';
  import { calculateExercisePoints } from '../utils/gradeHelpers';
  import GameOver from '../components/common/GameOver.vue';
  import CoinAnimation from '../components/common/CoinAnimation.vue';
  import CurrencyDisplay from '../components/player/CurrencyDisplay.vue';

  export default {
    name: 'MultiplicationView',
    components: {
      GameOver,
      CoinAnimation,
      CurrencyDisplay
    },
    setup() {
      const router = useRouter();
      const scoresStore = useScoresStore();
      const { showCoinAnimation, coinsEarned, awardCoins } = useCoins();
      const { ensureTasks } = useDailyTasks();

      // Состояние игры
      const currentProblem = ref(null);
      const selectedAnswer = ref(null);
      const showFeedback = ref(false);
      const isCorrect = ref(false);
      const correctAnswers = ref(0);
      const totalAnswers = ref(0);
      const scoreGained = ref(0);
      const showGameOver = ref(false);
      const problemsPerSession = 10;
      const problemsSolved = ref(0);
      const errorsPerProblem = ref([]); // Массив для хранения количества ошибок по каждому заданию

      // Вычисляемые свойства
      const multiplicationScore = computed(() => scoresStore.multiplicationScore);

      // Определяем максимальный множитель на основе очков
      const maxMultiplier = computed(() => {
        const score = multiplicationScore.value;

        if (score < 50) return 2; // До 50 очков - таблица на 2
        if (score < 150) return 3; // 50-149 очков - таблица на 3
        if (score < 300) return 4; // 150-299 очков - таблица на 4
        if (score < 500) return 5; // 300-499 очков - таблица на 5
        if (score < 750) return 6; // 500-749 очков - таблица на 6
        if (score < 1050) return 7; // 750-1049 очков - таблица на 7
        if (score < 1400) return 8; // 1050-1399 очков - таблица на 8
        if (score < 1800) return 9; // 1400-1799 очков - таблица на 9
        return 10; // 1800+ очков - таблица на 10
      });

      // Определяем очки до следующего уровня
      const pointsToNextLevel = computed(() => {
        const score = multiplicationScore.value;

        if (score < 50) return 50 - score;
        if (score < 150) return 150 - score;
        if (score < 300) return 300 - score;
        if (score < 500) return 500 - score;
        if (score < 750) return 750 - score;
        if (score < 1050) return 1050 - score;
        if (score < 1400) return 1400 - score;
        if (score < 1800) return 1800 - score;
        return 0; // Максимальный уровень достигнут
      });

      // Определяем очки за правильный ответ в зависимости от текущего множителя
      const pointsPerCorrect = computed(() => {
        const multiplier = maxMultiplier.value;
        return 5 + (multiplier - 2) * 5; // от 10 до 50 очков
      });

      // Методы
      const goBack = () => {
        router.push('/');
      };

      const generateNewProblem = () => {
        currentProblem.value = generateMultiplicationProblem(maxMultiplier.value);
        selectedAnswer.value = null;
        showFeedback.value = false;
        isCorrect.value = false;
      };

      const checkAnswer = (index) => {
        // Если уже был выбран правильный ответ, не делаем ничего
        if (selectedAnswer.value !== null && isCorrect.value) return;

        // Инициализируем счетчик ошибок для текущей задачи, если это первый ответ
        if (errorsPerProblem.value.length <= problemsSolved.value) {
          errorsPerProblem.value[problemsSolved.value] = 0;
        }

        selectedAnswer.value = index;
        showFeedback.value = true;
        isCorrect.value = index === currentProblem.value.correctIndex;

        // Считаем общий ответ только при первом выборе
        if (totalAnswers.value === 0 || selectedAnswer.value !== null) {
          totalAnswers.value++;
        }

        if (isCorrect.value) {
          correctAnswers.value++;
          // Рассчитываем очки с учетом количества ошибок
          const errors = errorsPerProblem.value[problemsSolved.value] || 0;
          const points = calculateExercisePoints(errors);

          // Для умножения используем базовые очки, умноженные на коэффициент сложности
          const adjustedPoints = points * ((pointsPerCorrect.value + 5) / 10); // Нормализуем к базовому значению
          const finalPoints = Math.round(adjustedPoints);

          scoreGained.value += finalPoints;
          scoresStore.updateMultiplicationScore(finalPoints);

          // Выдаем монетки за правильный ответ
          const level = Math.ceil(maxMultiplier.value / 2); // Определяем уровень на основе множителя
          awardCoins('multiplication', level, errors);

          problemsSolved.value++;

          // Автоматический переход к следующему примеру при правильном ответе
          setTimeout(() => {
            if (problemsSolved.value >= problemsPerSession) {
              showGameOver.value = true;
            } else {
              generateNewProblem();
            }
          }, 1500); // Задержка 1.5 секунды для отображения обратной связи
        }
        // Если ответ неправильный, увеличиваем счетчик ошибок
        else {
          errorsPerProblem.value[problemsSolved.value]++;
        }
      };

      const nextProblem = () => {
        if (problemsSolved.value >= problemsPerSession) {
          showGameOver.value = true;
          return;
        }
        generateNewProblem();
      };

      const restartGame = () => {
        resetGameStats();
        generateNewProblem();
        showGameOver.value = false;
      };

      const resetGameStats = () => {
        correctAnswers.value = 0;
        totalAnswers.value = 0;
        scoreGained.value = 0;
        problemsSolved.value = 0;
        errorsPerProblem.value = [];
        selectedAnswer.value = null;
        showFeedback.value = false;
      };

      // Загружаем очки при монтировании компонента
      onMounted(() => {
        scoresStore.loadScores();
        ensureTasks(); // Генерируем ежедневные задания
        generateNewProblem();
      });

      return {
        currentProblem,
        selectedAnswer,
        showFeedback,
        isCorrect,
        correctAnswers,
        totalAnswers,
        scoreGained,
        showGameOver,
        multiplicationScore,
        maxMultiplier,
        pointsToNextLevel,
        pointsPerCorrect,
        goBack,
        checkAnswer,
        nextProblem,
        restartGame,
        showCoinAnimation,
        coinsEarned
      };
    }
  };
</script>

<style scoped>
  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    flex: 1;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;
  }

  .score-container {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #ffffff, #f8f9ff);
    border-radius: 20px;
    padding: 8px 16px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }

  .score-label {
    font-size: 14px;
    color: #666;
    margin-right: 8px;
  }

  .score-value {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    font-weight: 600;
  }

  .game-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .level-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;
    background: linear-gradient(135deg, #ffffff, #f8f9ff);
    border-radius: 15px;
    padding: 15px 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .current-level {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .level-info .progress-info {
    font-size: 14px;
    color: #666;
    text-align: center;
  }

  .problem-container {
    background: linear-gradient(135deg, #ffffff, #f8f9ff);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
    margin-bottom: 20px;
    width: 100%;
    max-width: 500px;
  }

  .problem-expression {
    font-size: 32px;
    font-weight: 700;
    color: #333;
    margin-bottom: 30px;
  }

  .options-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }

  .option-button {
    background: linear-gradient(135deg, #f8f9ff, #ffffff);
    border: 2px solid #e0e0e0;
    border-radius: 15px;
    padding: 15px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }

  .option-button:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
  }

  .option-button:disabled {
    cursor: not-allowed;
  }

  .option-button.correct {
    background: linear-gradient(135deg, #4caf50, #45a049);
    color: white;
    border-color: #4caf50;
  }

  .option-button.incorrect {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    color: white;
    border-color: #ff6b6b;
  }

  .feedback {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    padding: 10px;
    border-radius: 10px;
  }

  .correct-feedback {
    color: #4caf50;
    background-color: rgba(76, 175, 80, 0.1);
  }

  .incorrect-feedback {
    color: #ff6b6b;
    background-color: rgba(255, 107, 107, 0.1);
  }

  .next-button {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 20px;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
  }

  .next-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(102, 126, 234, 0.4);
  }

  .progress-container {
    width: 100%;
    max-width: 500px;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 14px;
    color: #666;
  }

  .progress-bar {
    height: 10px;
    background-color: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4caf50, #45a049);
    transition: width 0.3s ease;
  }

  @media (max-width: 768px) {
    .main-container {
      padding: 15px;
    }

    .header-container {
      margin-bottom: 15px;
    }

    .level-info {
      padding: 12px 15px;
    }

    .problem-container {
      padding: 20px;
    }

    .problem-expression {
      font-size: 28px;
      margin-bottom: 20px;
    }

    .options-container {
      gap: 10px;
    }

    .option-button {
      padding: 12px;
      font-size: 18px;
    }

    .feedback {
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .main-container {
      padding: 10px;
    }

    .problem-container {
      padding: 15px;
    }

    .problem-expression {
      font-size: 24px;
    }

    .options-container {
      grid-template-columns: 1fr;
    }
  }
</style>
