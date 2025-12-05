<template>
  <div class="game-over">
    <h1>🎉 Игра окончена! 🎉</h1>
    <div class="score-summary">
      <div class="score-item-final">
        <div class="score-label">За эту игру</div>
        <div class="final-score-number">⭐ {{ currentScore }}</div>
      </div>
      <div class="score-item-final">
        <div class="score-label">Всего накоплено</div>
        <div class="final-score-number total-score-number">⭐ {{ totalScore }}</div>
      </div>
    </div>
    <StarRating :score="currentScore" />
    <div>
      <div v-if="currentScore >= 60" class="achievement">🏆 Математический гений!</div>
      <div v-else-if="currentScore >= 40" class="achievement">🥈 Отличный результат!</div>
      <div v-else-if="currentScore >= 20" class="achievement">🥉 Хорошая работа!</div>
      <div v-else class="achievement">💪 Продолжай учиться!</div>
    </div>
    <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
      <button class="btn" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white;" @click="restartGame">
        Играть снова
      </button>
      <button class="btn" style="background: linear-gradient(135deg, #28a745, #20c997); color: white;" @click="goToMain">
        На главную
      </button>
    </div>
  </div>
</template>

<script>
import StarRating from './StarRating.vue'

export default {
  name: 'GameOver',
  components: {
    StarRating
  },
  props: {
    currentScore: {
      type: Number,
      required: true
    },
    totalScore: {
      type: Number,
      required: true
    }
  },
  emits: ['restart-game', 'go-to-main'],
  methods: {
    restartGame() {
      this.$emit('restart-game')
    },
    goToMain() {
      this.$emit('go-to-main')
    }
  }
}
</script>