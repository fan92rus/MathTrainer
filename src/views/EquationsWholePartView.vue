<template>
  <div class="app-container">
    <div class="game-container">
      <div v-if="!showResults" class="game-container-inner">
        <!-- Header -->
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <button class="back-button" @click="goBack">← Назад</button>
            <div style="display: flex; align-items: center; gap: 15px;">
              <span class="level-indicator">{{ levelIndicator }}</span>
              <CurrencyDisplay />
            </div>
          </div>
          <h1 class="title">Уравнения: целое и части</h1>
        </div>

        <!-- Score Display -->
        <ScoreDisplay
          :current-score="score"
          :total-score="10"
        />

        <!-- Дисплей уравнения -->
        <EquationDisplay
          v-if="currentProblem"
          :problem="currentProblem"
          :show-result="answered"
          @complete="handleComplete"
        />

        <div class="game-container-footer">
          <!-- Progress -->
          <ProgressBar :progress-percent="progressPercent" />

          <!-- StarRating -->
          <StarRating :score="score" />
        </div>
      </div>

      <!-- Game Over -->
      <GameOver
        v-else
        :correct-answers="score"
        :total-answers="10"
        :score="score"
        @restart="restart"
        @exit="goBack"
      >
        <p>Тренировка завершена!</p>
        <p>Правильных ответов: {{ score }} из 10</p>
      </GameOver>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScoresStore } from '@/store/scores';
import { useCoins } from '@/composables/useCoins';
import { generateEquationWholePartProblem } from '@/utils/math/equationsWholePart';
import EquationDisplay from '@/components/equationsWholePart/EquationDisplay.vue';
import ScoreDisplay from '@/components/common/ScoreDisplay.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import StarRating from '@/components/common/StarRating.vue';
import GameOver from '@/components/common/GameOver.vue';
import CurrencyDisplay from '@/components/player/CurrencyDisplay.vue';
import type { EquationWholePartProblem } from '@/types';

const TRAINING_QUESTIONS = 10;

export default {
  name: 'EquationsWholePartView',
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
    const { awardCoins } = useCoins();

    // Управление состоянием тренировки
    const problems = ref<EquationWholePartProblem[]>([]);
    const currentQuestion = ref(0);
    const score = ref(0);
    const answered = ref(false);
    const showResults = ref(false);
    const errorsPerQuestion = ref<number[]>([]);

    // Текущая задача
    const currentProblem = computed(() => problems.value[currentQuestion.value] ?? null);

    // Прогресс
    const progressPercent = computed(() => {
      return (currentQuestion.value / TRAINING_QUESTIONS) * 100;
    });

    // Уровень из store (вычисляется на основе equationsWholePartScore)
    const currentLevel = computed(() => scoresStore.getEquationsWholePartLevel);

    // Максимальное число для текущего уровня
    const maxNumberForLevel = computed(() => scoresStore.getEquationsWholePartMaxNumber);

    // Индикатор уровня (сложность чисел)
    const levelIndicator = computed(() => {
      return `Числа до ${maxNumberForLevel.value}`;
    });

    // Общая сложность для генератора (1-10 на основе score)
    const numberDifficulty = computed(() => {
      return Math.min(10, Math.floor(scoresStore.equationsWholePartScore / 5) + 1);
    });

    onMounted(() => {
      scoresStore.loadScores();
      initializeTraining();
    });

    function initializeTraining() {
      // Генерируем задачи для тренировки с текущей сложностью
      problems.value = [];
      for (let i = 0; i < TRAINING_QUESTIONS; i++) {
        const problem = generateEquationWholePartProblem(i, numberDifficulty.value, {
          maxNumber: maxNumberForLevel.value
        });
        problems.value.push(problem);
      }
    }

    function handleComplete(result: { isCorrect: boolean }): void {
      // Записываем количество ошибок для этого вопроса (0 если правильно, 1 если неправильно)
      errorsPerQuestion.value[currentQuestion.value] = result.isCorrect ? 0 : 1;

      if (result.isCorrect) {
        score.value++;

        // Выдаем монетки за правильный ответ и обновляем daily tasks
        const level = currentLevel.value || 1;
        awardCoins('equationsWholePart', level, 0);
      }

      answered.value = true;

      // Задержка перед следующим вопросом
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    }

    function nextQuestion() {
      if (currentQuestion.value < problems.value.length - 1) {
        currentQuestion.value++;
        answered.value = false;
      } else {
        // Тренировка завершена
        finishTraining();
      }
    }

    function finishTraining() {
      showResults.value = true;

      // Сохраняем результат
      scoresStore.updateEquationsWholePartScore(score.value);
    }

    function restart(): void {
      // Перезапускаем тренировку
      score.value = 0;
      currentQuestion.value = 0;
      answered.value = false;
      showResults.value = false;
      errorsPerQuestion.value = [];
      initializeTraining();
    }

    function goBack(): void {
      router.push('/');
    }

    return {
      problems,
      currentQuestion,
      score,
      currentLevel,
      maxNumberForLevel,
      answered,
      showResults,
      currentProblem,
      progressPercent,
      levelIndicator,
      handleComplete,
      restart,
      goBack
    };
  }
};
</script>

<style scoped>
.title {
  text-align: center;
  margin: 16px 0;
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 600;
  color: #333;
}
</style>
