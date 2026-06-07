<template>
  <Teleport to="body">
    <div v-if="visible" class="bonus-overlay" @click="dismiss">
      <div class="bonus-card" @click.stop>
        <div class="bonus-card__fire">🔥</div>
        <div class="bonus-card__title">Ежедневный бонус!</div>
        <div class="bonus-card__amount" :key="amount">
          +{{ amount }} 🪙
        </div>
        <div class="bonus-card__streak" v-if="streakDays > 0">
          Стрик: {{ streakDays }} {{ streakDays === 1 ? 'день' : streakDays < 5 ? 'дня' : 'дней' }} 🔥
        </div>
        <button class="bonus-card__btn" @click="dismiss">
          🎉 Забрать!
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePlayerStore } from '@/store/player'
import { useStreaksStore } from '@/store/streaks'

const playerStore = usePlayerStore()
const streaksStore = useStreaksStore()

const visible = ref(false)
const amount = ref(0)
const streakDays = ref(0)

onMounted(() => {
  const bonus = playerStore.checkDailyBonus()
  if (bonus > 0) {
    amount.value = bonus
    streakDays.value = streaksStore.currentStreak ?? 1
    playerStore.addCoins(bonus)
    visible.value = true
  }
})

function dismiss() {
  visible.value = false
}
</script>

<style scoped>
.bonus-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
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

.bonus-card {
  background: linear-gradient(135deg, #e8f5e9, #f1f8e9, #e8f5e9);
  border-radius: 24px;
  padding: 32px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: pop-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  max-width: 300px;
  width: 90%;
}

@keyframes pop-up {
  0% { transform: scale(0.3) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.bonus-card__fire {
  font-size: 48px;
  margin-bottom: 8px;
  animation: fire-dance 1s ease-in-out infinite alternate;
}

@keyframes fire-dance {
  0% { transform: scale(1) rotate(-5deg); }
  100% { transform: scale(1.1) rotate(5deg); }
}

.bonus-card__title {
  font-size: 20px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 8px;
}

.bonus-card__amount {
  font-size: 42px;
  font-weight: 900;
  color: #f57f17;
  animation: pop-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  margin: 8px 0;
}

@keyframes pop-in {
  0% { transform: scale(0.2) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.15) rotate(3deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.bonus-card__streak {
  font-size: 14px;
  color: #e65100;
  font-weight: 600;
  margin: 8px 0;
}

.bonus-card__btn {
  margin-top: 16px;
  padding: 10px 32px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #43a047, #2e7d32);
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.bonus-card__btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(46, 125, 50, 0.4);
}

.bonus-card__btn:active {
  transform: scale(0.95);
}
</style>
