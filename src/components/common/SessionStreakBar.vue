<template>
  <div
    v-if="currentStreak >= 3"
    class="streak-chip"
    :class="{ 'streak-chip--milestone': showMilestoneGlow }"
  >
    <span class="streak-chip__fire">🔥</span>
    <span
      class="streak-chip__number"
      :key="currentStreak"
    >{{ currentStreak }}</span>
    <span class="streak-chip__label">в ряд!</span>

    <span v-if="showMilestoneGlow" class="streak-chip__bonus">+{{ milestoneBonus }} 🪙</span>

    <div class="streak-chip__dots">
      <span
        v-for="m in visibleMilestones"
        :key="m"
        class="streak-chip__dot"
        :class="{ 'streak-chip__dot--active': currentStreak >= m }"
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

const visibleMilestones = computed(() =>
  props.milestones.filter(m => m <= Math.max(props.currentStreak, 3))
)

watch(() => props.currentStreak, (val, old) => {
  if (old !== undefined && val > old && props.milestones.includes(val)) {
    showMilestoneGlow.value = true
    emit('milestone', val)
    setTimeout(() => { showMilestoneGlow.value = false }, 1200)
  }
})
</script>

<style scoped>
.streak-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px 4px 8px;
  border-radius: 20px;
  background: linear-gradient(135deg, #fff8e7, #ffedd5);
  border: 1.5px solid #fed7aa;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.streak-chip--milestone {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-color: #f59e0b;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
  animation: chip-glow 0.6s ease-in-out 3;
}

@keyframes chip-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 179, 0, 0.3); }
  50% { box-shadow: 0 0 24px rgba(255, 179, 0, 0.6); }
}

.streak-chip__fire {
  font-size: 16px;
  line-height: 1;
}

.streak-chip__number {
  font-size: 18px;
  font-weight: 800;
  color: #e65100;
  min-width: 16px;
  text-align: center;
  animation: chip-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes chip-pop {
  0% { transform: scale(0.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.streak-chip__label {
  font-size: 12px;
  font-weight: 600;
  color: #bf360c;
  white-space: nowrap;
}

.streak-chip__bonus {
  font-size: 12px;
  font-weight: 700;
  color: #f57f17;
  animation: chip-fade-up 0.4s ease-out;
}

@keyframes chip-fade-up {
  0% { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
}

.streak-chip__dots {
  display: inline-flex;
  gap: 3px;
  margin-left: 2px;
}

.streak-chip__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ffe0b2;
  transition: all 0.3s ease;
}

.streak-chip__dot--active {
  background: #ff9800;
  box-shadow: 0 0 3px rgba(255, 152, 0, 0.5);
}
</style>
