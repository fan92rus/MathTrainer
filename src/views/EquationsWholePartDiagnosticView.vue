<template>
  <div class="app-container">
    <div class="game-container diagnostic-view">
      <div v-if="!showResults" class="game-container-inner">
        <!-- Header -->
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <button class="back-button" @click="goBack">← Назад</button>
            <div style="display: flex; align-items: center; gap: 15px;">
              <span class="level-indicator">Диагностика</span>
              <CurrencyDisplay />
            </div>
          </div>
          <h1 class="title">Проверь свои знания!</h1>
          <p class="subtitle">Реши 10 уравнений, чтобы пройти тест</p>
        </div>

        <!-- Score Display -->
        <ScoreDisplay
          :current-score="correctCount"
          :total-score="10"
          :current-question="currentIndex + 1"
          :total-questions="10"
        />

        <!-- Проблема -->
        <EquationDisplay
          v-if="currentProblem"
          :problem="currentProblem"
          :show-result="answered"
          @complete="handleComplete"
        />

        <!-- Progress -->
        <ProgressBar :progress-percent="progressPercent" />

        <!-- StarRating -->
        <StarRating :score="correctCount" />
      </div>

      <!-- Game Over -->
      <GameOver
        v-else
        :correct-answers="correctCount"
        :total-answers="10"
        :score="correctCount"
        @restart="restartDiagnostic"
        @exit="goBack"
      >
        <template v-if="passed">
          <p>Поздравляем! Ты готов к тренировке!</p>
          <button class="btn-primary" @click="goToTraining">Начать тренировку</button>
        </template>
        <template v-else>
          <p>Нужно ещё немного потренироваться.</p>
          <p class="hint-text">Рекомендуется пройти обучение повторно.</p>
          <button class="btn-secondary" @click="goToLearning">Повторить обучение</button>
        </template>
      </GameOver>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScoresStore } from '@/store/scores';
import { generateDiagnosticProblems, DIAGNOSTIC_PROBLEMS_COUNT } from '@/utils/math/equationsWholePart';
import EquationDisplay from '@/components/equationsWholePart/EquationDisplay.vue';
import ScoreDisplay from '@/components/common/ScoreDisplay.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import StarRating from '@/components/common/StarRating.vue';
import GameOver from '@/components/common/GameOver.vue';
import CurrencyDisplay from '@/components/player/CurrencyDisplay.vue';
import type { EquationWholePartProblem } from '@/types';

const DIAGNOSTIC_THRESHOLD = 5;

export default {
  name: 'EquationsWholePartDiagnosticView',
  components: {
    EquationDisplay,
    ScoreDisplay,
    ProgressBar,
    StarRating,
    GameOver,
    CurrencyDisplay
  },
  setup() {
    const router = useRouter();
    const scoresStore = useScoresStore();

    // Управление состоянием диагностики
    const problems = ref<EquationWholePartProblem[]>([]);
    const currentIndex = ref(0);
    const correctCount = ref(0);
    const answered = ref(false);
    const showResults = ref(false);

    // Текущая задача
    const currentProblem = computed(() => problems.value[currentIndex.value] ?? null);

    // Прогресс
    const progressPercent = computed(() => {
      return (currentIndex.value / DIAGNOSTIC_PROBLEMS_COUNT) * 100;
    });

    // Пройдена ли диагностика
    const passed = computed(() => correctCount.value >= DIAGNOSTIC_THRESHOLD);

    onMounted(() => {
      scoresStore.loadScores();
      initializeDiagnostic();
    });

    function initializeDiagnostic() {
      // Генерируем 10 диагностических задач
      problems.value = generateDiagnosticProblems();
    }

    function handleComplete(result: { isCorrect: boolean }): void {
      if (result.isCorrect) {
        correctCount.value++;
      }

      answered.value = true;

      // Задержка перед следующим вопросом
      setTimeout(() => {
        nextProblem();
      }, 1000);
    }

    function handleHint(): void {
      // Показать подсказку
      alert('Подсказка: представь квадрат, где целое разделено на части');
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

      // Сохраняем результат диагностики
      if (passed.value) {
        scoresStore.setEquationsWholePartDiagnosticPassed(true);
      }
    }

    function restartDiagnostic(): void {
      // Перезапуска диагностики
      correctCount.value = 0;
      currentIndex.value = 0;
      answered.value = false;
      showResults.value = false;
      problems.value = generateDiagnosticProblems();
    }

    function goToTraining(): void {
      router.push('/equations-whole-part');
    }

    function goToLearning(): void {
      router.push('/equations-whole-part/learning');
    }

    function goBack(): void {
      if (currentIndex.value > 0 || answered.value) {
        // Если уже начали, предупреждаем
        if (window.confirm('Прогресс будет потерян. Выйти?')) {
          router.push('/');
        }
      } else {
        router.push('/');
      }
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
      handleComplete,
      restartDiagnostic,
      goToTraining,
      goToLearning,
      goBack
    };
  }
};
</script>

<style scoped>
.subtitle {
  text-align: center;
  font-size: clamp(14px, 3vw, 16px);
  color: #666;
  margin: 8px 0 24px 0;
}

.btn-primary {
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  padding: 14px 32px;
  border: 2px solid #667eea;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  color: #667eea;
}

.btn-secondary:hover {
  background: rgba(102, 126, 234, 0.1);
}

.hint-text {
  font-size: clamp(12px, 2.5vw, 14px);
  color: #888;
  margin: 8px 0;
}
</style>
