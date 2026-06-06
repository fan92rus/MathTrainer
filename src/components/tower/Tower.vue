<template>
  <div class="tower" :class="`tower--${theme}`">
    <!-- Tower target label -->
    <div class="tower__header">
      <span class="tower__label">🏗️ Башня</span>
      <span class="tower__progress">{{ totalFloors }}/{{ targetHeight }}</span>
    </div>

    <!-- Tower stack (grows from bottom to top) -->
    <div class="tower-stack" ref="stackRef">
      <TransitionGroup name="tower-floor" tag="div" class="tower-stack__inner">
        <TowerFloor
          v-for="floor in reversedFloors"
          :key="floor.id"
          :floor="floor"
          :theme="theme"
        />
      </TransitionGroup>
    </div>

    <!-- Completion celebration -->
    <div v-if="completed" class="tower__complete">
      <span class="tower__complete-icon">🏆</span>
      <span>Построено!</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, nextTick } from 'vue'
import type { TowerFloor as TowerFloorType, TowerTheme } from '@/types/tower'
import TowerFloor from './TowerFloor.vue'

const props = defineProps<{
  floors: TowerFloorType[]
  targetHeight: number
  theme: TowerTheme
  completed: boolean
}>()

const stackRef = ref<HTMLElement | null>(null)

/** Reverse floors so newest is on top (visual bottom→top growth) */
const reversedFloors = computed(() => [...props.floors].reverse())
const totalFloors = computed(() => props.floors.length)

/** Auto-scroll to newest floor */
watch(
  () => props.floors.length,
  async () => {
    await nextTick()
    if (stackRef.value) {
      stackRef.value.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }
)
</script>

<style scoped>
.tower {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 8px;
  min-width: 180px;
  max-width: 220px;
}

.tower__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.tower__progress {
  font-size: 12px;
  opacity: 0.7;
}

.tower-stack {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 300px;
  scrollbar-width: thin;
}

.tower-stack__inner {
  display: flex;
  flex-direction: column-reverse;
  gap: 3px;
}

.tower__complete {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  margin-top: 8px;
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  color: #5c4000;
  animation: complete-glow 1s ease-in-out infinite alternate;
}

.tower__complete-icon {
  font-size: 20px;
}

/* Floor enter animation */
.tower-floor-enter-active {
  animation: floor-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tower-floor-leave-active {
  transition: all 0.3s ease;
}

.tower-floor-enter-from {
  opacity: 0;
  transform: translateY(20px) scaleY(0.8);
}

.tower-floor-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes floor-appear {
  0%   { opacity: 0; transform: translateY(20px) scaleY(0.8); }
  60%  { opacity: 1; transform: translateY(-4px) scaleY(1.02); }
  80%  { transform: translateY(2px) scaleY(0.99); }
  100% { transform: translateY(0) scaleY(1); }
}

@keyframes complete-glow {
  0%   { box-shadow: 0 0 8px rgba(255, 215, 0, 0.4); }
  100% { box-shadow: 0 0 16px rgba(255, 215, 0, 0.8); }
}

/* Responsive */
@media (max-width: 480px) {
  .tower {
    min-width: 140px;
    max-width: 180px;
  }
  .tower-stack {
    max-height: 200px;
  }
}
</style>
