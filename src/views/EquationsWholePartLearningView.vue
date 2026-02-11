<template>
  <div class="app-container">
    <div class="game-container">
      <div class="game-container-inner">
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <button class="back-button" @click="goBack">← Назад</button>
            <CurrencyDisplay />
          </div>
          <h1 class="title">Обучение: Уравнения "целое и части"</h1>
        </div>

        <EquationsWholePartLearningStory @complete="handleComplete" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScoresStore } from '@/store/scores';
import EquationsWholePartLearningStory from '@/components/equationsWholePart/EquationsWholePartLearningStory.vue';
import CurrencyDisplay from '@/components/player/CurrencyDisplay.vue';

export default {
  name: 'EquationsWholePartLearningView',
  components: {
    EquationsWholePartLearningStory,
    CurrencyDisplay
  },
  setup() {
    const router = useRouter();
    const scoresStore = useScoresStore();

    onMounted(() => {
      scoresStore.loadScores();
    });

    function goBack() {
      if (window.confirm('Прогресс обучения будет потерян. Выйти?')) {
        router.push('/');
      }
    }

    function handleComplete() {
      // Отмечаем обучение как завершенное
      scoresStore.setEquationsWholePartLearningCompleted(true);

      // Перенаправляем на диагностику
      router.push('/equations-whole-part/diagnostic');
    }

    return {
      goBack,
      handleComplete
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 480px) {
  .title {
    margin: 6px 0;
    font-size: clamp(14px, 3.2vw, 16px);
  }
}
</style>
