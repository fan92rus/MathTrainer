<template>
  <div
    class="draggable-block"
    :class="[colorClass, { 'draggable-block--dragging': isDragging }]"
    :style="dragStyle"
    @pointerdown.prevent="onDragStart"
  >
    {{ value }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Числовое значение блока */
  value: number
  /** CSS-класс цвета (для цветовой кодировки по диапазону) */
  colorClass?: string
  /** Блок сейчас перетаскивается */
  isDragging?: boolean
  /** Смещение по X при drag (от composable) */
  offsetX?: number
  /** Смещение по Y при drag (от composable) */
  offsetY?: number
}>(), {
  colorClass: '',
  isDragging: false,
  offsetX: 0,
  offsetY: 0,
})

const emit = defineEmits<{
  /** Блок захвачен — передаём значение для привязки в composable */
  dragStart: [value: number]
}>()

const dragStyle = computed(() => {
  if (props.isDragging) {
    return {
      transform: `translate3d(${props.offsetX}px, ${props.offsetY}px, 0) scale(1.08)`,
      zIndex: 100,
      willChange: 'transform',
    }
  }
  return {}
})

function onDragStart(_e: PointerEvent): void {
  emit('dragStart', props.value)
}
</script>

<style scoped>
.draggable-block {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  font-size: 28px;
  font-weight: 700;
  cursor: grab;
  user-select: none;
  touch-action: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.draggable-block:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.draggable-block--dragging {
  cursor: grabbing;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  transition: none;
}

/* Цветовая кодировка по диапазону (Dehaene, 2011) */
.draggable-block--green  { background: linear-gradient(135deg, #43e97b, #38f9d7); color: #1a3a2a; }
.draggable-block--blue   { background: linear-gradient(135deg, #4facfe, #00f2fe); color: #fff; }
.draggable-block--yellow { background: linear-gradient(135deg, #f6d365, #fda085); color: #4a3520; }
.draggable-block--orange { background: linear-gradient(135deg, #ff9a9e, #fecfef); color: #4a2020; }
.draggable-block--red    { background: linear-gradient(135deg, #f5576c, #ff6a88); color: #fff; }

@media (min-width: 769px) {
  .draggable-block {
    width: 80px;
    height: 80px;
    font-size: 24px;
  }
}
</style>
