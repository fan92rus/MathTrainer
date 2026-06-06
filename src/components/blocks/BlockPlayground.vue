<template>
  <div
    class="block-playground"
    ref="playgroundRef"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
  >
    <!-- Block items -->
    <TransitionGroup name="block" tag="div" class="block-playground__area">
      <BlockItem
        v-for="block in blocks"
        :key="block.id"
        :block="block"
        :look-direction="dragDirection"
        @drag-start="onDragStart"
      />
    </TransitionGroup>

    <!-- Hint text -->
    <div v-if="blocks.length === 0" class="block-playground__hint">
      Перетащи блоки, чтобы склеить числа!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Block } from '@/types/blocks'
import BlockItem from './BlockItem.vue'

const props = defineProps<{
  blocks: Block[]
}>()

const emit = defineEmits<{
  blockMoved: [id: number, x: number, y: number]
  blocksCombined: [idA: number, idB: number]
  blockReleased: [id: number]
}>()

const playgroundRef = ref<HTMLElement | null>(null)
const draggingId = ref<number | null>(null)
const dragStartPos = ref({ x: 0, y: 0 })
const blockStartPos = ref({ x: 0, y: 0 })
const dragDirection = ref(0)

function onDragStart(id: number) {
  draggingId.value = id
  const block = props.blocks.find(b => b.id === id)
  if (block) {
    blockStartPos.value = { x: block.x, y: block.y }
  }
}

function onPointerMove(e: PointerEvent) {
  if (draggingId.value === null || !playgroundRef.value) return
  e.preventDefault()

  const rect = playgroundRef.value.getBoundingClientRect() as DOMRect
  const x = e.clientX - rect.left - props.blocks.find(b => b.id === draggingId.value)!.width / 2
  const y = e.clientY - rect.top - 24 // half height

  // Track drag direction for eyes
  const dx = e.clientX - dragStartPos.value.x
  dragDirection.value = Math.abs(dx) < 3 ? 0 : dx > 0 ? 1 : -1

  emit('blockMoved', draggingId.value, Math.max(0, x), Math.max(0, y))
}

function onPointerUp() {
  if (draggingId.value === null) return

  const id = draggingId.value
  draggingId.value = null
  dragDirection.value = 0

  // Check if near another block for combining
  const block = props.blocks.find(b => b.id === id)
  if (block) {
    for (const other of props.blocks) {
      if (other.id === id) continue
      const dx = Math.abs(block.x + block.width / 2 - (other.x + other.width / 2))
      const dy = Math.abs(block.y + block.height / 2 - (other.y + other.height / 2))
      if (dx < 50 && dy < 50) {
        emit('blocksCombined', id, other.id)
        return
      }
    }
  }

  emit('blockReleased', id)
}
</script>

<style scoped>
.block-playground {
  position: relative;
  width: 100%;
  min-height: 200px;
  border-radius: 16px;
  background: var(--color-bg-light);
  border: 2px dashed var(--color-border-light);
  overflow: hidden;
  touch-action: none;
}

.block-playground__area {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.block-playground__hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-muted);
  font-size: 16px;
  text-align: center;
}

/* Vue TransitionGroup for blocks */
.block-enter-active {
  animation: block-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.block-leave-active {
  transition: all 0.3s ease;
}

.block-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.block-leave-to {
  opacity: 0;
  transform: scale(0.3);
}

@keyframes block-appear {
  0%   { opacity: 0; transform: scale(0.5); }
  60%  { opacity: 1; transform: scale(1.1); }
  100% { transform: scale(1); }
}

@media (max-width: 480px) {
  .block-playground {
    min-height: 160px;
  }
}
</style>
