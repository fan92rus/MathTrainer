<template>
  <div class="streak-flame" :class="[flameClass, { 'no-streak': streak === 0 }]">
    <div class="flame-container">
      <div class="flame-body">
        <div class="flame-inner"></div>
        <div class="flame-core"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * StreakFlame — анимация огонька стрика
 * Размер и цвет зависят от текущего стрика
 */
import { computed } from 'vue'

const props = defineProps<{
  streak: number
}>()

const flameClass = computed(() => {
  const s = props.streak
  if (s >= 30) return 'flame-rainbow'
  if (s >= 14) return 'flame-large'
  if (s >= 7) return 'flame-medium'
  if (s >= 3) return 'flame-small'
  return 'flame-tiny'
})
</script>

<style scoped>
.streak-flame {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.flame-container {
  position: relative;
  width: 28px;
  height: 36px;
}

/* === Базовое пламя (flame-tiny: 0-2 дня) === */
.flame-body {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 28px;
  background: linear-gradient(to top, #ff6b35, #ffa500, #ffcc00);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  animation: flicker 1.5s ease-in-out infinite alternate;
  filter: grayscale(0.5);
  opacity: 0.6;
}

.flame-inner {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 16px;
  background: linear-gradient(to top, #ffe066, #fff8e1);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  opacity: 0.6;
}

.flame-core {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  opacity: 0;
}

/* === flame-small: 3-6 дней === */
.flame-small .flame-body {
  filter: none;
  opacity: 1;
  width: 22px;
  height: 30px;
}

.flame-small .flame-inner {
  opacity: 0.8;
}

.flame-small .flame-core {
  opacity: 0.4;
}

/* === flame-medium: 7-13 дней === */
.flame-medium .flame-container {
  width: 32px;
  height: 42px;
}

.flame-medium .flame-body {
  width: 26px;
  height: 36px;
  box-shadow: 0 0 12px rgba(255, 165, 0, 0.5);
}

.flame-medium .flame-inner {
  opacity: 0.9;
  width: 14px;
  height: 20px;
}

.flame-medium .flame-core {
  opacity: 0.7;
  width: 8px;
  height: 10px;
}

/* === flame-large: 14-29 дней === */
.flame-large .flame-container {
  width: 36px;
  height: 48px;
}

.flame-large .flame-body {
  width: 30px;
  height: 40px;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.6);
  animation-duration: 0.8s;
}

.flame-large .flame-inner {
  width: 16px;
  height: 24px;
}

.flame-large .flame-core {
  opacity: 1;
  width: 10px;
  height: 12px;
}

/* === flame-rainbow: 30+ дней === */
.flame-rainbow .flame-container {
  width: 40px;
  height: 52px;
}

.flame-rainbow .flame-body {
  width: 34px;
  height: 44px;
  background: linear-gradient(to top, #ff6b35, #ff3366, #9b59b6, #3498db, #2ecc71, #f1c40f);
  background-size: 100% 200%;
  animation: flicker 0.6s ease-in-out infinite alternate, rainbow-shift 3s linear infinite;
  box-shadow: 0 0 25px rgba(255, 107, 53, 0.7), 0 0 50px rgba(155, 89, 182, 0.3);
}

.flame-rainbow .flame-inner {
  width: 18px;
  height: 28px;
  background: linear-gradient(to top, #fff8e1, #fff);
}

.flame-rainbow .flame-core {
  opacity: 1;
  width: 12px;
  height: 14px;
  animation: pulse-core 1s ease-in-out infinite;
}

/* === no-streak === */
.no-streak .flame-body {
  filter: grayscale(1);
  opacity: 0.3;
}

.no-streak .flame-inner,
.no-streak .flame-core {
  opacity: 0;
}

/* === Animations === */
@keyframes flicker {
  0% { transform: translateX(-50%) scaleY(1) scaleX(1); }
  25% { transform: translateX(-50%) scaleY(1.05) scaleX(0.95); }
  50% { transform: translateX(-50%) scaleY(0.95) scaleX(1.05); }
  75% { transform: translateX(-50%) scaleY(1.08) scaleX(0.92); }
  100% { transform: translateX(-50%) scaleY(0.97) scaleX(1.02); }
}

@keyframes rainbow-shift {
  0% { background-position: 0% 0%; }
  50% { background-position: 0% 100%; }
  100% { background-position: 0% 0%; }
}

@keyframes pulse-core {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
  50% { transform: translateX(-50%) scale(1.3); opacity: 0.8; }
}
</style>
