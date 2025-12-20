<template>
  <div class="app-container">
    <div class="game-container">
      <div v-if="!gameOver" class="game-container-inner">
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <button class="back-button" @click="goToMain">← Назад</button>
            <div class="level-info">
              <span class="level-indicator"
                >Уровень {{ currentLevelConfig.level }}: {{ currentLevelConfig.description }}</span
              >
            </div>
          </div>
          <h1 class="title">Решай уравнение</h1>
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

        <!-- Уравнение -->
        <div class="equation-container">
          <div class="math-expression">{{ currentProblem?.expression }}, чему равен x?</div>

          <!-- Поле для ввода ответа -->
          <div class="answer-input-container">
            <input
              ref="answerInput"
              v-model="userAnswer"
              type="number"
              class="answer-input"
              placeholder="Введите ответ"
              @keyup.enter="checkAnswer"
              :disabled="answered"
              autocomplete="off"
            />
            <button
              class="check-button"
              @click="checkAnswer"
              :disabled="answered || userAnswer === ''"
            >
              Проверить
            </button>
          </div>
        </div>

        <!-- Обратная связь -->
        <div v-if="answered" class="feedback-container">
          <div :class="['feedback', isCorrect ? 'correct' : 'incorrect']">
            <div class="feedback-icon">{{ isCorrect ? '✓' : '✗' }}</div>
            <div class="feedback-text">
              {{
                isCorrect
                  ? 'Правильно!'
                  : `Неправильно. Правильный ответ: ${currentProblem?.correctAnswer}`
              }}
            </div>
          </div>
          <button class="next-button" @click="nextQuestion">Следующий вопрос</button>
        </div>

        <ProgressBar :progress-percent="progressPercent" />

        <StarRating :score="score" />
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
  import { ref, onMounted, computed, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { useScoresStore } from '../store/scores';
  import { useGameLogic } from '../composables/useGameLogic';
  import {
    getEquationsLevelConfig,
    getNextEquationsLevel,
    generateEquationProblemManual
  } from '../utils/math/index';
  import ScoreDisplay from '../components/common/ScoreDisplay.vue';
  import ProgressBar from '../components/common/ProgressBar.vue';
  import StarRating from '../components/common/StarRating.vue';
  import GameOver from '../components/common/GameOver.vue';

  export default {
    name: 'ManualEquationsView',
    components: {
      ScoreDisplay,
      ProgressBar,
      StarRating,
      GameOver
    },
    setup() {
      const router = useRouter();
      const scoresStore = useScoresStore();
      const totalQuestions = 5;
      const answerInput = ref(null);

      // Инициализируем игру с дополнительными параметрами для ручного режима
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
        problems,
        setManualMode
      } = useGameLogic(totalQuestions);

      // Загружаем общий счет
      const totalScore = computed(() => scoresStore.equationsScore);

      // Режим решения
      const userAnswer = ref('');
      const isCorrect = ref(false);

      // Получаем конфигурацию текущего уровня на основе общего счета
      const currentLevelConfig = computed(() => getEquationsLevelConfig(totalScore.value));

      // Получаем информацию о следующем уровне
      const nextLevelInfo = computed(() => getNextEquationsLevel(totalScore.value));

      // Вычисляем прогресс до следующего уровня в процентах
      const progressToNextLevelPercent = computed(() => {
        if (!nextLevelInfo.value) return 100; // Уже максимальный уровень

        const currentLevelMin = currentLevelConfig.value.minScore;
        const nextLevelMin = nextLevelInfo.value.minScore;

        if (nextLevelMin <= currentLevelMin) return 100;

        const progress =
          ((totalScore.value - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
        return Math.min(100, Math.max(0, progress));
      });

      // Обработчик проверки ответа
      const checkAnswer = () => {
        if (answered.value || userAnswer.value === '') return;

        const correctAnswer = currentProblem.value?.correctAnswer;
        const userAnswerNum = parseInt(userAnswer.value);

        isCorrect.value = userAnswerNum === correctAnswer;

        // Вычисляем очки
        const errors = 0; // В ручном режиме одна попытка
        const points = errors === 0 ? 10 : errors === 1 ? 5 : 0;
        const adjustedPoints = Math.round(
          points * (currentLevelConfig.value.pointsPerCorrect / 10)
        );

        selectAnswer(0, 0, () => {
          scoresStore.updateEquationsScore(adjustedPoints);
        });

        // Сохраняем статистику
        if (isCorrect.value) {
          scoresStore.incrementManualEquationsSolved();
        }

        // Обновляем общую статистику
        scoresStore.incrementTotalEquationsAttempted();
      };

      // Обработчик перехода к следующему вопросу
      const nextQuestion = () => {
        userAnswer.value = '';
        isCorrect.value = false;
        answered.value = false;

        // Генерируем новую задачу
        const newProblem = generateEquationProblemManual(totalScore.value);
        currentProblem.value = newProblem;
        currentQuestion.value++;

        // Фокус на поле ввода
        nextTick(() => {
          if (answerInput.value) {
            answerInput.value.focus();
          }
        });
      };

      // Перезапуск игры
      const restartGame = () => {
        userAnswer.value = '';
        isCorrect.value = false;
        answered.value = false;
        initializeGame();
        setManualMode(true);

        // Генерируем все задачи для ручного режима
        const manualProblems = [];
        for (let i = 0; i < totalQuestions; i++) {
          manualProblems.push(generateEquationProblemManual(totalScore.value));
        }

        problems.value = manualProblems;

        if (manualProblems.length > 0) {
          currentProblem.value = manualProblems[0];
        }
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
        userAnswer,
        isCorrect,
        answerInput,
        checkAnswer,
        nextQuestion,
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

  .equation-container {
    margin: 20px 0;
  }

  .answer-input-container {
    display: flex;
    gap: 10px;
    max-width: 400px;
    margin: 0 auto;
  }

  .answer-input {
    flex: 1;
    padding: 12px 16px;
    font-size: 18px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    text-align: center;
    transition: all 0.3s ease;
  }

  .answer-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .answer-input:disabled {
    background-color: #f7fafc;
    color: #a0aec0;
  }

  .check-button {
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
  }

  .check-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(102, 126, 234, 0.4);
  }

  .check-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .feedback-container {
    margin: 20px 0;
    text-align: center;
  }

  .feedback {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
  }

  .feedback.correct {
    background-color: #c6f6d5;
    color: #22543d;
  }

  .feedback.incorrect {
    background-color: #fed7d7;
    color: #742a2a;
  }

  .feedback-icon {
    font-size: 24px;
    font-weight: bold;
  }

  .feedback-text {
    font-size: 16px;
  }

  .next-button {
    margin-top: 10px;
    padding: 10px 20px;
    background: #4a5568;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .next-button:hover {
    background: #2d3748;
  }
</style>
