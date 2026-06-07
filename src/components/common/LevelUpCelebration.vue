<template>
  <Teleport to="body">
    <div v-if="visible" class="level-up-overlay" @click="dismiss">
      <div class="level-up-card" @click.stop>
        <div class="level-up-card__sparkle">✨</div>
        <div class="level-up-card__title">Уровень повышен!</div>
        <div class="level-up-card__level">
          <span class="level-up-card__number" :key="level">{{ level }}</span>
        </div>
        <div class="level-up-card__reward">
          +{{ reward }} 🪙
        </div>
        <div class="level-up-card__stars">
          <span v-for="i in 5" :key="i">⭐</span>
        </div>
        <button class="level-up-card__btn" @click="dismiss">
          👏 Отлично!
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePlayerStore } from '@/store/player'

const playerStore = usePlayerStore()

const visible = ref(false)
const level = ref(1)
const reward = ref(10)

watch(() => playerStore.player.level, (newLevel, oldLevel) => {
  if (oldLevel !== undefined && newLevel > oldLevel) {
    level.value = newLevel
    reward.value = newLevel * 5 // Больше уровень — больше награда
    visible.value = true

    // Confetti!
    import('canvas-confetti').then((confetti) => {
      confetti.default({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'],
      })
    })

    // Авто-закрытие
    setTimeout(() => {
      visible.value = false
    }, 4000)
  }
})

function dismiss() {
  visible.value = false
}
</script>

<style scoped>
.level-up-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fade-in 0.2s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.level-up-card {
  background: linear-gradient(135deg, #fff8e1, #fffde7, #fff8e1);
  border-radius: 24px;
  padding: 32px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: pop-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  max-width: 320px;
  width: 90%;
  position: relative;
}

@keyframes pop-up {
  0% { transform: scale(0.3) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.level-up-card__sparkle {
  font-size: 36px;
  margin-bottom: 8px;
  animation: sparkle-rotate 1.5s linear infinite;
}

@keyframes sparkle-rotate {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}

.level-up-card__title {
  font-size: 18px;
  font-weight: 600;
  color: #795548;
  margin-bottom: 8px;
}

.level-up-card__level {
  font-size: 64px;
  font-weight: 900;
  color: #e65100;
  line-height: 1;
  margin: 8px 0;
}

.level-up-card__number {
  display: inline-block;
  animation: pop-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in {
  0% { transform: scale(0.2) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.15) rotate(3deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.level-up-card__reward {
  font-size: 16px;
  font-weight: 700;
  color: #f57f17;
  margin: 8px 0;
  animation: fade-up 0.4s 0.3s both;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.level-up-card__stars {
  font-size: 20px;
  letter-spacing: 4px;
  margin: 12px 0;
  animation: fade-up 0.4s 0.5s both;
}

.level-up-card__btn {
  margin-top: 16px;
  padding: 10px 32px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.level-up-card__btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(255, 152, 0, 0.4);
}

.level-up-card__btn:active {
  transform: scale(0.95);
}
</style>
