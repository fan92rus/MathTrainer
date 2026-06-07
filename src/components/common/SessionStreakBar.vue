<template>
  <div
    v-if="currentStreak > 0"
    class="streak-bar"
    :class="{ 'streak-bar--milestone': showMilestoneGlow }"
  >
    <div class="streak-bar__counter">
      <span class="streak-bar__fire">🔥</span>
      <span
        class="streak-bar__number"
        :key="currentStreak"
      >
        {{ currentStreak }}
      </span>
      <span class="streak-bar__label">в ряд!</span>
    </div>

    <div class="streak-bar__bonus" v-if="showMilestoneGlow">
      <span class="streak-bar__bonus-text">+{{ milestoneBonus }} 🪙</span>
    </div>

    <div class="streak-bar__milestones">
      <span
        v-for="m in milestones"
        :key="m"
        class="streak-bar__dot"
        :class="{
          'streak-bar__dot--passed': currentStreak >= m,
          'streak-bar__dot--current': currentStreak === m,
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  currentStreak: number
  milestones?: number[]
}>(), {
  milestones: () => [3, 5, 7, 10],
})

const emit = defineEmits<{
  milestone: [milestone: number]
}>()

const showMilestoneGlow = ref(false)

const milestoneBonus = computed(() => {
  if (props.currentStreak >= 10) return 10
  if (props.currentStreak >= 7) return 7
  if (props.currentStreak >= 5) return 5
  if (props.currentStreak >= 3) return 3
  return 0
})

// Detect when we hit a milestone (streak changed and is in milestones)
watch(() => props.currentStreak, (val, old) => {
  if (old !== undefined && val > old && props.milestones.includes(val)) {
    showMilestoneGlow.value = true
    emit('milestone', val)
    setTimeout(() => { showMilestoneGlow.value = false }, 1200)
  }
})
</script>

<style scoped>
.streak-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #fff8e1, #fff3cd);
  border: 2px solid #ffd54f;
  transition: all 0.3s ease;
  min-width: 140px;
}

.streak-bar--milestone {
  background: linear-gradient(135deg, #ffe082, #ffb300);
  border-color: #ff8f00;
  box-shadow: 0 0 20px rgba(255, 179, 0, 0.4);
  animation: pulse-glow 0.6s ease-in-out 3;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 15px rgba(255, 179, 0, 0.3); }
  50% { box-shadow: 0 0 30px rgba(255, 179, 0, 0.7); }
}

.streak-bar__counter {
  display: flex;
  align-items: center;
  gap: 4px;
}

.streak-bar__fire {
  font-size: 22px;
}

.streak-bar__number {
  font-size: 24px;
  font-weight: 800;
  color: #e65100;
  min-width: 20px;
  text-align: center;
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in {
  0% { transform: scale(0.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.streak-bar__label {
  font-size: 14px;
  font-weight: 600;
  color: #bf360c;
}

.streak-bar__bonus {
  animation: fade-up 0.4s ease-out;
}

.streak-bar__bonus-text {
  font-size: 14px;
  font-weight: 700;
  color: #f57f17;
}

@keyframes fade-up {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

.streak-bar__milestones {
  display: flex;
  gap: 6px;
  margin-top: 2px;
}

.streak-bar__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffe0b2;
  transition: all 0.3s ease;
}

.streak-bar__dot--passed {
  background: #ff9800;
  box-shadow: 0 0 4px rgba(255, 152, 0, 0.5);
}

.streak-bar__dot--current {
  background: #e65100;
  box-shadow: 0 0 6px rgba(230, 81, 0, 0.6);
  transform: scale(1.3);
}
</style>
