<template>
  <div
    class="block-item"
    :class="{
      'block-item--dragging': block.state === 'dragging',
      'block-item--combining': block.state === 'combining',
    }"
    :style="blockStyle"
    @pointerdown.prevent="onPointerDown"
  >
    <!-- Eyes (DragonBox style) -->
    <div class="block-item__eyes">
      <div class="block-item__eye">
        <div class="block-item__pupil" :style="{ left: eyeOffset + 'px' }" />
      </div>
      <div class="block-item__eye">
        <div class="block-item__pupil" :style="{ left: eyeOffset + 'px' }" />
      </div>
    </div>
    <!-- Value label -->
    <span class="block-item__value">{{ block.value }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Block } from '@/types/blocks'

const props = defineProps<{
  block: Block
  /** Direction eyes look at: -1 left, 0 center, 1 right */
  lookDirection?: number
}>()

const emit = defineEmits<{
  dragStart: [id: number]
}>()

const eyeOffset = computed(() => (props.lookDirection ?? 0) * 3)

const blockStyle = computed(() => ({
  left: props.block.x + 'px',
  top: props.block.y + 'px',
  width: props.block.width + 'px',
  height: props.block.height + 'px',
  backgroundColor: props.block.color,
  position: 'absolute' as const,
}))

function onPointerDown() {
  emit('dragStart', props.block.id)
}
</script>

<style scoped>
.block-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: grab;
  user-select: none;
  touch-action: none;
  will-change: transform;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  font-family: 'Nunito', 'Rubik', sans-serif;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.block-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.block-item--dragging {
  cursor: grabbing;
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  transition: none;
  z-index: 100;
}

.block-item--combining {
  animation: combine-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Eyes */
.block-item__eyes {
  display: flex;
  gap: 6px;
  margin-bottom: 2px;
}

.block-item__eye {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  position: relative;
  overflow: hidden;
}

.block-item__pupil {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #333;
  position: absolute;
  top: 3px;
  transition: left 0.2s ease;
}

.block-item__value {
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}

@keyframes combine-bounce {
  0%   { transform: scale(1, 1); }
  40%  { transform: scale(1.2, 0.8); }
  70%  { transform: scale(0.95, 1.05); }
  100% { transform: scale(1, 1); }
}

/* Responsive: smaller blocks on mobile */
@media (max-width: 480px) {
  .block-item__eye {
    width: 8px;
    height: 8px;
  }
  .block-item__pupil {
    width: 4px;
    height: 4px;
  }
  .block-item__value {
    font-size: 14px;
  }
}
</style>
