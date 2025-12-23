<template>
  <div class="game-over">
    <h1>🎉 Игра окончена! 🎉</h1>
    <div class="score-summary">
      <div class="score-item-final">
        <div class="score-label">Правильных ответов</div>
        <div class="final-score-number">{{ correctAnswers }} / {{ totalAnswers }}</div>
      </div>
      <div class="score-item-final">
        <div class="score-label">За эту игру</div>
        <div class="final-score-number">⭐ {{ score }}</div>
      </div>
    </div>
    <StarRating :score="score" />
    <div>
      <div v-if="accuracy >= 90" class="achievement">🏆 Математический гений!</div>
      <div v-else-if="accuracy >= 75" class="achievement">🥈 Отличный результат!</div>
      <div v-else-if="accuracy >= 60" class="achievement">🥉 Хорошая работа!</div>
      <div v-else class="achievement">💪 Продолжай учиться!</div>
    </div>
    <div class="game-over-buttons">
      <button class="btn restart-button" @click="restartGame">Играть снова</button>
      <button class="btn main-button" @click="exit">Выйти</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import StarRating from './StarRating.vue';

  export interface Props {
    correctAnswers: number;
    totalAnswers: number;
    score: number;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    restart: [];
    exit: [];
  }>();

  const accuracy = computed((): number => {
    return props.totalAnswers > 0
      ? Math.round((props.correctAnswers / props.totalAnswers) * 100)
      : 0;
  });

  const restartGame = (): void => {
    emit('restart');
  };

  const exit = (): void => {
    emit('exit');
  };
</script>

<style scoped>
  .game-over-buttons {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .restart-button {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
  }

  .main-button {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
  }

  @media (max-width: 480px) {
    .game-over-buttons {
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .btn {
      width: 100%;
      max-width: 200px;
      padding: 10px 15px;
      font-size: 14px;
    }
  }

  @media (max-width: 360px) {
    .btn {
      padding: 8px 12px;
      font-size: 12px;
    }
  }
</style>
