<template>
  <div class="app-container">
    <!-- Анимация монеток -->
    <CoinAnimation
      v-if="showCoinAnimation"
      :amount="coinsEarned"
      @animationEnd="showCoinAnimation = false"
    />

    <div class="game-container">
      <div v-if="!showResults" class="game-container-inner">
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <button class="back-button" @click="goBack">← Назад</button>
            <div style="display: flex; align-items: center; gap: 15px;">
              <span class="progress-text">{{ currentIndex + 1 }} / {{ problems.length }}</span>
              <CurrencyDisplay />
            </div>
          </div>
          <h1 class="title">Диагностика: Вычитание в столбик</h1>
        </div>

        <ProgressBar :progress-percent="progressPercent" />

        <!-- Интерактивный режим -->
        <div v-if="!answered && currentProblem" class="interactive-container">
          <InteractiveSubtraction
            ref="interactiveRef"
            :minuend="currentProblem.minuend"
            :subtrahend="currentProblem.subtrahend"
            :show-skip-button="false"
            :auto-advance="true"
            @complete="handleInteractiveComplete"
          />
        </div>
      </div>

      <!-- Результаты -->
      <div v-else class="results-container">
        <div class="results-card">
          <h2>Результаты диагностики</h2>

          <div class="score-display">
            <div class="score-number">{{ correctCount }}</div>
            <div class="score-total">из {{ problems.length }}</div>
          </div>

          <p class="score-message">{{ scoreMessage }}</p>

          <div class="results-actions">
            <button
              v-if="passed"
              class="btn-primary"
              @click="goToTraining"
            >
              Начать тренировку
            </button>
            <button
              v-else
              class="btn-secondary"
              @click="goToLearning"
            >
              Пройти обучение
            </button>
            <button
              class="btn-text"
              @click="goHome"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScoresStore } from '@/store/scores';
import { useCoins } from '@/composables/useCoins';
import { generateDiagnosticProblems, DIAGNOSTIC_PASS_THRESHOLD, DIAGNOSTIC_MEDIUM_THRESHOLD } from '@/utils/math/columnSubtraction';
import type { ColumnSubtractionProblem } from '@/types';
import InteractiveSubtraction from '@/components/columnSubtraction/InteractiveSubtraction.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import CoinAnimation from '@/components/common/CoinAnimation.vue';
import CurrencyDisplay from '@/components/player/CurrencyDisplay.vue';

export default {
  name: 'ColumnSubtractionDiagnosticView',
  components: {
    InteractiveSubtraction,
    ProgressBar,
    CoinAnimation,
    CurrencyDisplay
  },
  setup() {
    const router = useRouter();
    const scoresStore = useScoresStore();
    const { showCoinAnimation, coinsEarned } = useCoins();

    // Генерируем задачи для диагностики
    const problems = ref<ColumnSubtractionProblem[]>([]);
    const currentIndex = ref(0);
    const correctCount = ref(0);
    const answered = ref(false);
    const showResults = ref(false);
    const interactiveRef = ref<InstanceType<typeof InteractiveSubtraction> | null>(null);

    // Текущая задача
    const currentProblem = computed(() => problems.value[currentIndex.value]);

    // Прогресс
    const progressPercent = computed(() => {
      return ((currentIndex.value) / problems.value.length) * 100;
    });

    // Пройдена ли диагностика
    const passed = computed(() => correctCount.value >= DIAGNOSTIC_PASS_THRESHOLD);

    // Сообщение о результате
    const scoreMessage = computed(() => {
      if (passed.value) {
        return 'Отлично! Ты готов(а) к тренировке! 🎉';
      } else if (correctCount.value >= DIAGNOSTIC_MEDIUM_THRESHOLD) {
        return 'Неплохой результат! Рекомендуем повторить обучение.';
      } else {
        return 'Нужно больше практики. Пройди обучение ещё раз.';
      }
    });

    onMounted(() => {
      scoresStore.loadScores();
      // Генерируем задачи
      problems.value = generateDiagnosticProblems();
    });

    function goBack() {
      if (currentIndex.value > 0 || answered.value) {
        // Если уже начали, предупреждаем
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

    function handleInteractiveComplete(result: number) {
      const problem = currentProblem.value;
      if (!problem) return;

      const isCorrect = result === problem.correctAnswer;

      if (isCorrect) {
        correctCount.value++;
      }

      answered.value = true;

      // Автоматически переходим к следующему примеру через 1.5 секунды
      setTimeout(() => {
        nextProblem();
      }, 1500);
    }

    function nextProblem() {
      if (currentIndex.value < problems.value.length - 1) {
        currentIndex.value++;
        answered.value = false;
      } else {
        // Диагностика завершена
        finishDiagnostic();
      }
    }

    function finishDiagnostic() {
      showResults.value = true;

      if (passed.value) {
        scoresStore.setColumnSubtractionDiagnosticPassed(true);
      }
    }

    function goToTraining() {
      router.push('/column-subtraction');
    }

    function goToLearning() {
      router.push('/column-subtraction/learning');
    }

    return {
      problems,
      currentIndex,
      correctCount,
      answered,
      showResults,
      currentProblem,
      progressPercent,
      passed,
      scoreMessage,
      showCoinAnimation,
      coinsEarned,
      interactiveRef,
      goBack,
      goHome,
      nextProblem,
      goToTraining,
      goToLearning,
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

.progress-text {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(251, 191, 36, 0.3);
  min-width: 60px;
  text-align: center;
}

.title {
  text-align: center;
  margin: 16px 0;
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 600;
  color: #333;
}

/* Результаты */
.results-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.results-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
  max-width: 400px;
  width: 100%;
}

.results-card h2 {
  font-size: clamp(20px, 5vw, 28px);
  font-weight: 600;
  color: #333;
  text-align: center;
}

.score-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.score-number {
  font-size: clamp(48px, 12vw, 72px);
  font-weight: 700;
  color: #667eea;
}

.score-total {
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 500;
  color: #666;
}

.score-message {
  font-size: clamp(14px, 3vw, 18px);
  text-align: center;
  color: #333;
}

.results-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 300px;
}

/* Кнопки */
.btn-primary,
.btn-secondary,
.btn-text {
  min-height: clamp(44px, 10vw, 56px);
  padding: 12px 24px;
  font-size: clamp(14px, 3vw, 18px);
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #ddd;
  color: #333;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

.btn-text {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-text:hover {
  background: #fff;
  color: #333;
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
</style>
