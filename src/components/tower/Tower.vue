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
          :total-height="targetHeight"
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

/** Reverse floors: level 1 at bottom, highest at top */
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
  background: var(--color-bg-light, #f8f9ff);
  border: 2px solid var(--color-border-light, #e0e6ff);
  border-radius: var(--radius-sm, 12px);
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
  color: var(--color-primary, #667eea);
}

.tower__label {
  font-family: 'Nunito', 'Rubik', sans-serif;
}

.tower__progress {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary, #666);
  background: var(--color-bg-accent, #e8ecff);
  padding: 2px 8px;
  border-radius: 10px;
}

.tower-stack {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 60vh;
  /* Hide scrollbar — children don't need it, auto-scroll handles visibility */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.tower-stack::-webkit-scrollbar {
  display: none;
}

.tower-stack__inner {
  display: flex;
  flex-direction: column;
  gap: 2px;
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

/* Floor enter animation — drops from above with bounce */
.tower-floor-enter-active {
  animation: floor-drop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tower-floor-leave-active {
  transition: all 0.3s ease;
}

.tower-floor-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.tower-floor-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes floor-drop {
  0%   { opacity: 0; transform: translateY(-30px); }
  50%  { opacity: 1; transform: translateY(4px); }
  70%  { transform: translateY(-2px); }
  85%  { transform: translateY(1px); }
  100% { transform: translateY(0); }
}

@keyframes complete-glow {
  0%   { box-shadow: 0 0 8px rgba(255, 215, 0, 0.4); }
  100% { box-shadow: 0 0 16px rgba(255, 215, 0, 0.8); }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .tower {
    min-width: 150px;
    max-width: 200px;
  }
  .tower-stack {
    max-height: 40vh;
  }
}

@media (max-width: 480px) {
  .tower {
    min-width: 130px;
    max-width: 170px;
    padding: 6px;
  }
  .tower-stack {
    max-height: 35vh;
  }
  .tower__header {
    font-size: 12px;
    padding: 2px 6px 6px;
  }
}
</style>
