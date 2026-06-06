<template>
  <div class="drag-answer" @pointermove="handlePointerMove" @pointerup="handlePointerUp">
    <!-- Drop target zone in the center -->
    <div class="drag-answer__target-wrapper" ref="targetWrapperRef">
      <DropTarget
        :value="droppedValue"
        :is-correct="feedbackCorrect"
        :is-hovering="isOverTarget"
      />
    </div>

    <!-- Draggable blocks drawer at the bottom -->
    <div class="drag-answer__drawer">
      <DraggableBlock
        v-for="(option, index) in options"
        :key="index"
        :value="Number(option)"
        :color-class="colorForValue(Number(option))"
        :is-dragging="activeDragValue === Number(option) && isDragging"
        :offset-x="activeDragValue === Number(option) ? state.offsetX : 0"
        :offset-y="activeDragValue === Number(option) ? state.offsetY : 0"
        @drag-start="onBlockDragStart"
      />
    </div>

    <!-- Tap fallback for DCD children and accessibility -->
    <p class="drag-answer__tap-hint">или нажми на число</p>
    <div class="drag-answer__tap-grid">
      <button
        v-for="(option, index) in options"
        :key="'tap-' + index"
        class="drag-answer__tap-btn"
        :class="{
          'drag-answer__tap-btn--correct': answered && index === correctIndex,
          'drag-answer__tap-btn--incorrect': answered && index === selectedIndex && index !== correctIndex,
          'drag-answer__tap-btn--disabled': answered,
        }"
        :disabled="answered"
        @click="emit('answerSelected', index)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DraggableBlock from './DraggableBlock.vue'
import DropTarget from './DropTarget.vue'
import { useDragAndDropAnswer } from '@/composables/useDragAndDropAnswer'

interface Props {
  options: (string | number)[]
  correctIndex: number
  answered?: boolean
  selectedIndex?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  answered: false,
  selectedIndex: null,
})

const emit = defineEmits<{
  answerSelected: [index: number]
}>()

const { state, droppedValue, reset: resetDrag } = useDragAndDropAnswer()

const targetWrapperRef = ref<HTMLElement | null>(null)
const activeDragValue = ref<number | null>(null)
const feedbackCorrect = ref<boolean | null>(null)

/** True while a block is being actively dragged */
const isDragging = computed(() => state.value.isDragging)

/** Whether the dragged block is currently hovering over the drop target */
const isOverTarget = computed(() => {
  if (!isDragging.value || !targetWrapperRef.value) return false
  const rect = targetWrapperRef.value.getBoundingClientRect() as DOMRect
  const cx = state.value.startX + state.value.offsetX
  const cy = state.value.startY + state.value.offsetY
  return cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom
})

/**
 * Color coding per PRD §1.4 (Dehaene, 2011).
 * Maps last digit of value to a color range:
 *   1-2 → green, 3-4 → blue, 5-6 → yellow, 7-8 → orange, 9-0 → red
 */
function colorForValue(v: number): string {
  const digit = Math.abs(v) % 10
  if (digit <= 2) return 'draggable-block--green'
  if (digit <= 4) return 'draggable-block--blue'
  if (digit <= 6) return 'draggable-block--yellow'
  if (digit <= 8) return 'draggable-block--orange'
  return 'draggable-block--red'
}

/**
 * Called by DraggableBlock when user starts dragging.
 * Initialises drag tracking — startX/Y set on first pointermove.
 */
function onBlockDragStart(value: number) {
  if (props.answered) return
  activeDragValue.value = value
  state.value.isDragging = true
  state.value.dragValue = value
  state.value.startX = 0
  state.value.startY = 0
  state.value.offsetX = 0
  state.value.offsetY = 0
}

/** Track pointer movement during drag */
function handlePointerMove(e: PointerEvent) {
  if (!state.value.isDragging) return
  if (state.value.startX === 0 && state.value.startY === 0) {
    state.value.startX = e.clientX
    state.value.startY = e.clientY
  }
  state.value.offsetX = e.clientX - state.value.startX
  state.value.offsetY = e.clientY - state.value.startY
}

/** Handle pointer release — check if dropped on target */
function handlePointerUp(e: PointerEvent) {
  if (!state.value.isDragging) return

  const value = state.value.dragValue
  const wasDragging = state.value.isDragging
  state.value.isDragging = false
  activeDragValue.value = null

  if (value !== null && targetWrapperRef.value && !props.answered) {
    const rect = targetWrapperRef.value.getBoundingClientRect() as DOMRect
    const insideX = e.clientX >= rect.left && e.clientX <= rect.right
    const insideY = e.clientY >= rect.top && e.clientY <= rect.bottom

    if (insideX && insideY) {
      droppedValue.value = value
      // Find the option index matching this value
      const idx = props.options.findIndex((o) => Number(o) === value)
      if (idx >= 0) {
        feedbackCorrect.value = idx === props.correctIndex
        emit('answerSelected', idx)
      }
    }
  }

  // Reset drag state after feedback animation
  setTimeout(() => {
    resetDrag()
    feedbackCorrect.value = null
  }, wasDragging ? 600 : 0)
}
</script>

<style scoped>
.drag-answer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 500px;
  touch-action: none;
}

/* Drop target centered above drawer */
.drag-answer__target-wrapper {
  margin-bottom: 4px;
}

/* Drawer: horizontal row of draggable blocks */
.drag-answer__drawer {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-radius: 16px;
  background: var(--color-bg-light, #f8f9ff);
  border: 2px solid var(--color-border-light, #e0e6ff);
  min-width: 280px;
}

/* Tap fallback hint */
.drag-answer__tap-hint {
  font-size: 12px;
  color: var(--color-text-muted, #999);
  margin: 0;
  text-align: center;
}

/* Tap fallback grid */
.drag-answer__tap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(48px, 48px));
  gap: 8px;
  justify-content: center;
}

.drag-answer__tap-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
  font-family: inherit;
  border: 2px solid var(--color-border-light, #e0e6ff);
  background: var(--color-bg, #ffffff);
  color: var(--color-text, #333);
  cursor: pointer;
  transition: all 0.2s ease;
}

.drag-answer__tap-btn:hover:not(:disabled) {
 background: var(--color-bg-accent, #e8ecff);
  border-color: var(--color-primary, #667eea);
  transform: translateY(-2px);
}

.drag-answer__tap-btn:active:not(:disabled) {
  transform: translateY(0);
}

.drag-answer__tap-btn--correct {
  background: rgba(76, 175, 80, 0.15);
  border-color: var(--color-success, #4caf50);
  color: var(--color-success, #4caf50);
}

.drag-answer__tap-btn--incorrect {
  background: rgba(255, 152, 0, 0.12);
  border-color: #ff9800;
  color: #ff9800;
}

.drag-answer__tap-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Responsive */
@media (max-width: 480px) {
  .drag-answer__drawer {
    gap: 8px;
    padding: 8px 12px;
    min-width: auto;
    width: 100%;
  }

  .drag-answer__tap-btn {
    width: 44px;
    height: 44px;
    font-size: 16px;
  }
}

@media (min-width: 769px) {
  .drag-answer__drawer {
    min-width: 360px;
  }
}
</style>
