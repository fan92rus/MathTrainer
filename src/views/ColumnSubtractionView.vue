<template>
  <div class="app-container">
    <!-- Анимация монеток -->
    <CoinAnimation
      v-if="showCoinAnimation"
      :amount="coinsEarned"
      @animationEnd="showCoinAnimation = false"
    />

    <div class="game-container">
      <div v-if="!game.gameOver.value" class="game-container-inner">
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <button class="back-button" @click="goBack">← Назад</button>
            <div style="display: flex; align-items: center; gap: 15px;">
              <span class="level-indicator">Уровень {{ currentLevel }}</span>
              <CurrencyDisplay />
            </div>
          </div>
          <h1 class="title">Вычитание в столбик</h1>
        </div>

        <ScoreDisplay
          :current-score="game.score.value"
          :total-score="totalScore"
          :current-question="game.currentQuestion.value"
          :total-questions="TRAINING_QUESTIONS_COUNT"
        />

        <!-- Интерактивный режим -->
        <div v-if="!game.answered.value && currentColumnProblem" class="interactive-container">
          <InteractiveSubtraction
            ref="interactiveRef"
            :key="game.currentQuestion.value"
            :minuend="currentColumnProblem.minuend"
            :subtrahend="currentColumnProblem.subtrahend"
            :show-skip-button="false"
            :auto-advance="true"
            @complete="handleInteractiveComplete"
          />
        </div>

        <!-- Сообщение если задачи не загружены -->
        <div v-else-if="!game.gameOver.value && !currentColumnProblem" class="no-problems-message">
          <p>Загрузка примеров...</p>
        </div>

        <!-- Сообщение о правильном ответе -->
        <div v-if="game.answered.value && currentColumnProblem" class="correct-message">
          <h3>Правильно! ✓</h3>
          <p>Переход к следующему примеру...</p>
        </div>

        <ProgressBar :progress-percent="game.progressPercent.value" />

        <StarRating :score="game.score.value" />
      </div>

      <GameOver
        v-else
        :correct-answers="game.correctAnswers.value"
        :total-answers="game.totalAnswers.value"
        :score="game.score.value"
        @restart="restartTraining"
        @exit="goHome"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useScoresStore } from '@/store/scores';
import { useGameLogic } from '@/composables/useGameLogic';
import { useCoins } from '@/composables/useCoins';
import { generateColumnSubtractionProblem, TRAINING_QUESTIONS_COUNT } from '@/utils/math/columnSubtraction';
import type { ColumnSubtractionProblem } from '@/types';
import InteractiveSubtraction from '@/components/columnSubtraction/InteractiveSubtraction.vue';
import ScoreDisplay from '@/components/common/ScoreDisplay.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import StarRating from '@/components/common/StarRating.vue';
import GameOver from '@/components/common/GameOver.vue';
import CoinAnimation from '@/components/common/CoinAnimation.vue';
import CurrencyDisplay from '@/components/player/CurrencyDisplay.vue';

export default {
  name: 'ColumnSubtractionView',
  components: {
    InteractiveSubtraction,
    ScoreDisplay,
    ProgressBar,
    StarRating,
    GameOver,
    CoinAnimation,
    CurrencyDisplay
  },
  setup() {
    const router = useRouter();
    const scoresStore = useScoresStore();
    const { showCoinAnimation, coinsEarned, awardCoins } = useCoins();

    // Game logic
    const game = useGameLogic(TRAINING_QUESTIONS_COUNT);

    // Состояние UI
    const interactiveRef = ref<InstanceType<typeof InteractiveSubtraction> | null>(null);

    // Текущая задача как ColumnSubtractionProblem
    const currentColumnProblem = computed(() => {
      const problem = game.currentProblem?.value;
      if (!problem || !isColumnSubtractionProblem(problem)) {
        return null;
      }
      return problem as ColumnSubtractionProblem;
    });

    // Функция для проверки типа - проверяем общие поля MathProblem
    function isColumnSubtractionProblem(
      problem: unknown
    ): problem is ColumnSubtractionProblem {
      return (
        typeof problem === 'object' &&
        problem !== null &&
        'expression' in problem &&
        'operation' in problem &&
        'options' in problem &&
        'correctIndex' in problem &&
        'correctAnswer' in problem &&
        'minuend' in problem &&
        'subtrahend' in problem &&
        'result' in problem
      );
    }

    // Загружаем общий счет
    const totalScore = computed(() => scoresStore.columnSubtractionScore);

    onMounted(() => {
      scoresStore.loadScores();
      // Проверяем prerequisites перед инициализацией
      if (!checkPrerequisites()) {
        return;
      }
      initializeGame();
    });

    function checkPrerequisites(): boolean {
      // Проверяем, пройдено ли обучение
      if (!scoresStore.columnSubtractionLearningCompleted) {
        router.push('/column-subtraction/learning');
        return false;
      }

      // Проверяем, пройдена ли диагностика
      if (!scoresStore.columnSubtractionDiagnosticPassed) {
        router.push('/column-subtraction/diagnostic');
        return false;
      }

      return true;
    }

    function initializeGame() {
      game.initializeGame();
      generateProblems();
    }

    function generateProblems() {
      // Генерируем задачи для тренировки
      for (let i = 0; i < TRAINING_QUESTIONS_COUNT; i++) {
        const problem = generateColumnSubtractionProblem(totalScore.value);
        game.addProblem(problem);
      }
    }

    function goBack() {
      if (game.currentQuestion.value > 0 || game.totalAnswers.value > 0) {
        if (window.confirm('Прогресс будет потерян. Выйти?')) {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    }

    function goHome() {
      router.push('/');
    }

    function restartTraining() {
      game.initializeGame();
      generateProblems();
    }

    function handleInteractiveComplete(result: number) {
      const problem = currentColumnProblem.value;
      if (!problem) return;

      // Проверяем правильность ответа
      const isCorrect = result === problem.correctAnswer;

      if (isCorrect) {
        // Правильный ответ - даём очки
        const points = 10;
        scoresStore.updateColumnSubtractionScore(points);

        // Выдаем монетки за правильный ответ
        awardCoins('columnSubtraction', game.currentLevel.value, 0);

        game.answered.value = true;

        // Пауза 2.5 секунды для показа сообщения, затем следующий пример
        // InteractiveSubtraction уже ждёт 2 секунды перед emit complete
        setTimeout(() => {
          if (game.currentQuestion.value < TRAINING_QUESTIONS_COUNT - 1) {
            game.nextQuestion();
          }
        }, 500);
      }
    }

    // Сохраняем результат при завершении игры
    watch(() => game.gameOver.value, (isOver) => {
      if (isOver) {
        const result = game.getGameResult();
        scoresStore.updateColumnSubtractionScore(result.score);
      }
    });

    return {
      game,
      totalScore,
      currentLevel: game.currentLevel,
      TRAINING_QUESTIONS_COUNT,
      currentColumnProblem,
      interactiveRef,
      showCoinAnimation,
      coinsEarned,
      goBack,
      goHome,
      restartTraining,
      handleInteractiveComplete
    };
  }
};
</script>

<style scoped>

.interactive-container {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.title {
  text-align: center;
  margin: 16px 0;
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 600;
  color: #333;
}

/* Правильный ответ */
.correct-message {
  text-align: center;
  animation: slideIn 0.3s ease;
  padding: 16px;
}

/* Сообщение при отсутствии задач */
.no-problems-message {
  text-align: center;
  padding: 32px 16px;
  font-size: clamp(16px, 4vw, 20px);
  color: #666;
}

.no-problems-message p {
  margin: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.correct-message h3 {
  font-size: clamp(18px, 4vw, 24px);
  color: #4caf50;
}
</style>
