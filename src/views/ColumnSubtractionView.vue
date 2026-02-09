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

        <!-- Пример -->
        <div v-if="currentColumnProblem" class="problem-container">
          <ColumnDisplay
            :minuend="currentColumnProblem.minuend"
            :subtrahend="currentColumnProblem.subtrahend"
            :needs-borrowing="currentColumnProblem.needsBorrowing"
            :show-borrow-dot="showHint"
            :show-hint="showHint"
            :show-result="game.answered.value"
          />
        </div>

        <!-- Сообщение если задачи не загружены -->
        <div v-else-if="!game.gameOver.value" class="no-problems-message">
          <p>Загрузка примеров...</p>
        </div>

        <!-- Кнопка подсказки -->
        <button v-if="!game.answered.value && currentColumnProblem" class="hint-btn" @click="toggleHint">
          <span class="hint-icon">?</span>
          <span>Показать что происходит</span>
        </button>

        <!-- Подсказка -->
        <div v-if="feedback" class="feedback" :class="feedback.type">
          {{ feedback.message }}
        </div>

        <ProgressBar :progress-percent="game.progressPercent.value" />

        <StarRating :score="game.score.value" />

        <AnswerOptions
          v-if="!game.answered.value && currentColumnProblem"
          :options="currentColumnProblem?.options || []"
          :correct-index="currentColumnProblem?.correctIndex || 0"
          :answered="game.answered.value"
          :selected-index="game.selectedIndex.value"
          @answer-selected="selectAnswer"
        />

        <!-- Сообщение о правильном ответе -->
        <div v-else-if="game.answered.value && currentColumnProblem" class="correct-message">
          <h3>Правильно! ✓</h3>
          <p>Переход к следующему примеру...</p>
        </div>
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

    <!-- Модальное окно с визуализацией магазина -->
    <div v-if="showShopModal" class="modal-overlay" @click="closeShopModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeShopModal">✕</button>

        <h3>Визуализация в "Магазине"</h3>

        <ShopVisualization
          :packs="currentPacks"
          :loose-candies="currentLooseCandies"
          :opening-pack-index="currentColumnProblem?.needsBorrowing ? 1 : 0"
          :falling-candies-count="currentColumnProblem?.needsBorrowing ? 10 : 0"
        />

        <p class="modal-description">
          <template v-if="currentColumnProblem?.needsBorrowing">
            Вскрыли одну пачку: было {{ Math.floor(currentColumnProblem.minuend / 10) }} пачек и {{ currentColumnProblem.minuend % 10 }} конфет,
            стало {{ currentPacks }} пачек и {{ currentLooseCandies }} конфет россыпью.
          </template>
          <template v-else>
            У нас {{ currentPacks }} пачек и {{ currentLooseCandies }} конфет россыпью.
          </template>
        </p>

        <button class="btn-primary" @click="closeShopModal">Понятно!</button>
      </div>
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
import ColumnDisplay from '@/components/columnSubtraction/ColumnDisplay.vue';
import ShopVisualization from '@/components/columnSubtraction/ShopVisualization.vue';
import ScoreDisplay from '@/components/common/ScoreDisplay.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import StarRating from '@/components/common/StarRating.vue';
import AnswerOptions from '@/components/common/AnswerOptions.vue';
import GameOver from '@/components/common/GameOver.vue';
import CoinAnimation from '@/components/common/CoinAnimation.vue';
import CurrencyDisplay from '@/components/player/CurrencyDisplay.vue';

// Подсказки при ошибках
export interface Feedback {
  type: 'error' | 'success' | 'hint';
  message: string;
}

export default {
  name: 'ColumnSubtractionView',
  components: {
    ColumnDisplay,
    ShopVisualization,
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
    const { showCoinAnimation, coinsEarned, awardCoins } = useCoins();

    // Game logic
    const game = useGameLogic(TRAINING_QUESTIONS_COUNT);

    // Состояние UI
    const showHint = ref(false);
    const showShopModal = ref(false);
    const errorCount = ref(0);

    const feedback = ref<Feedback | null>(null);

    // Показывать заимствование в модальном окне магазина
    // Если модальное окно открыто и требуется заимствование, сразу показываем состояние после вскрытия пачки
    const showBorrowingInModal = computed(() => {
      return showShopModal.value && currentColumnProblem.value?.needsBorrowing === true;
    });

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

    // Вычисляемые свойства для визуализации магазина
    // В модальном окне сразу показываем состояние после заимствования
    // В основном виде показываем заимствование только после showHint
    const currentPacks = computed(() => {
      if (!currentColumnProblem.value) return 0;
      const packs = Math.floor(currentColumnProblem.value.minuend / 10);
      // В модальном окне или при подсказке уменьшаем пачки на 1 (вскрыли пачку)
      const shouldShowBorrowing = showBorrowingInModal.value ||
        (showHint.value && currentColumnProblem.value.needsBorrowing);
      if (shouldShowBorrowing && packs > 0) {
        return packs - 1;
      }
      return packs;
    });

    const currentLooseCandies = computed(() => {
      if (!currentColumnProblem.value) return 0;
      const loose = currentColumnProblem.value.minuend % 10;
      // В модальном окне или при подсказке добавляем 10 конфет из вскрытой пачки
      const shouldShowBorrowing = showBorrowingInModal.value ||
        (showHint.value && currentColumnProblem.value.needsBorrowing);
      if (shouldShowBorrowing) {
        return loose + 10;
      }
      return loose;
    });

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
      showHint.value = false;
      errorCount.value = 0;
      feedback.value = null;
    }

    function toggleHint() {
      showShopModal.value = true;
    }

    function closeShopModal() {
      showShopModal.value = false;
      showHint.value = true;
    }

    function selectAnswer(index: number) {
      const problem = currentColumnProblem.value;
      if (!problem) return;

      const isCorrect = index === problem.correctIndex;

      game.selectAnswer(index, problem.correctIndex, (points) => {
        // Правильный ответ
        scoresStore.updateColumnSubtractionScore(points);

        // Выдаем монетки за правильный ответ
        const errors = errorCount.value;
        awardCoins('columnSubtraction', game.currentLevel.value, errors);

        feedback.value = {
          type: 'success',
          message: `Правильно! +${points} очков ✓`
        };

        // Сбрасываем состояние подсказки
        showHint.value = false;
        errorCount.value = 0;
      });

      // Проверяем на ошибку
      if (!isCorrect) {
        errorCount.value++;
        feedback.value = {
          type: 'error',
          message: getErrorMessage(problem)
        };
      }
    }

    function getErrorMessage(problem: ColumnSubtractionProblem): string {
      if (errorCount.value === 1) {
        return 'Верхнее число — твои конфеты.';
      }

      if (problem.needsBorrowing) {
        return 'Нужно занять из десятков. Нажми "? Подсказка"';
      }

      if (problem.hasZeroInUnits) {
        return 'Нужно занять десяток.';
      }

      // Проверяем на "переворот" цифр
      let selectedOption = -1;
      if (game.selectedIndex.value !== null) {
        const opt = problem.options[game.selectedIndex.value];
        if (opt) {
          selectedOption = parseInt(opt, 10);
        }
      }

      if (problem.correctAnswer >= 10 && selectedOption !== -1) {
        const tens = Math.floor(problem.correctAnswer / 10);
        const units = problem.correctAnswer % 10;
        const flipped = units * 10 + tens;

        if (selectedOption === flipped) {
          return 'Это "перевёрнутый" ответ. Из верхнего вычитаем нижнее!';
        }
      }

      return 'Попробуй ещё раз.';
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
      currentPacks,
      currentLooseCandies,
      showBorrowingInModal,
      showHint,
      showShopModal,
      feedback,
      showCoinAnimation,
      coinsEarned,
      goBack,
      goHome,
      restartTraining,
      toggleHint,
      closeShopModal,
      selectAnswer
    };
  }
};
</script>

<style scoped>
/* Удалены дублирующие стили - теперь используются глобальные из main.css */

.title {
  text-align: center;
  margin: 16px 0;
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 600;
  color: #333;
}

.problem-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

/* Кнопка подсказки */
.hint-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: clamp(40px, 10vw, 48px);
  padding: 8px 12px;
  font-size: clamp(12px, 3vw, 14px);
  font-weight: 600;
  border: 2px dashed #667eea;
  border-radius: 12px;
  background: transparent;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 8px auto;
  max-width: 300px;
}

.hint-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.hint-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 700;
}

/* Feedback */
.feedback {
  padding: 12px;
  border-radius: 12px;
  font-size: clamp(12px, 3vw, 16px);
  text-align: center;
  max-width: 400px;
  margin: 8px auto;
}

.feedback.error {
  background: linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%);
  color: #8B0000;
}

.feedback.success {
  background: linear-gradient(135deg, #a5d6a7 0%, #66bb6a 100%);
  color: #2E7D32;
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

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  position: relative;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #ddd;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content h3 {
  font-size: clamp(16px, 4vw, 20px);
  font-weight: 600;
  color: #333;
}

.modal-description {
  font-size: clamp(14px, 3vw, 16px);
  color: #666;
  text-align: center;
}

.btn-primary {
  min-height: clamp(44px, 10vw, 56px);
  padding: 12px 24px;
  font-size: clamp(14px, 3vw, 18px);
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 300px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
}
</style>
