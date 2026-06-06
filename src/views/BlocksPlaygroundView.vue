<template>
  <div class="blocks-view">
    <!-- Header -->
    <div class="blocks-view__header">
      <button class="back-button" @click="goHome">← Назад</button>
      <h1 class="blocks-view__title">🧩 Собери из блоков</h1>
      <CurrencyDisplay />
    </div>

    <!-- Target display -->
    <div class="blocks-view__target">
      <div class="blocks-view__target-label">Цель:</div>
      <div class="blocks-view__target-value">{{ targetValue }}</div>
    </div>

    <!-- Expression hint -->
    <div class="blocks-view__hint">
      Перетащи блоки друг на друга, чтобы сложить их!
    </div>

    <!-- Celebration overlay -->
    <Transition name="celebrate">
      <div v-if="showCelebration" class="blocks-view__celebration">
        <div class="blocks-view__celebration-text">🎉 Отлично!</div>
        <div class="blocks-view__celebration-sub">{{ successMessage }}</div>
        <button class="blocks-view__next-btn" @click="nextProblem">Следующий →</button>
      </div>
    </Transition>

    <!-- Block playground -->
    <BlockPlayground
      :blocks="blocks"
      @block-moved="onBlockMoved"
      @blocks-combined="onBlocksCombined"
      @block-released="onBlockReleased"
    />

    <!-- Score / progress -->
    <div class="blocks-view__footer">
      <div class="blocks-view__score">Решено: {{ solvedCount }}</div>
      <button class="blocks-view__skip-btn" @click="skipProblem">Пропустить →</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlocks } from '@/composables/useBlocks'
import BlockPlayground from '@/components/blocks/BlockPlayground.vue'
import CurrencyDisplay from '@/components/player/CurrencyDisplay.vue'

const router = useRouter()

const {
  blocks,
  createBlock,
  moveBlock,
  combineBlocks,
  reset: resetBlocks,
} = useBlocks(36, 52)

const targetValue = ref(8)
const solvedCount = ref(0)
const showCelebration = ref(false)
const successMessage = ref('')

const successMessages = [
  'Блоки склеились!',
  'Отлично получилось!',
  'Верно!',
  'Супер!',
  'Молодец!',
]

/** Predefined problem templates: target + parts that MUST be combined to reach it */
const PROBLEM_TEMPLATES: Array<{ target: number; parts: number[] }> = [
  // 2-block problems
  { target: 3, parts: [1, 2] },
  { target: 4, parts: [1, 3] },
  { target: 5, parts: [2, 3] },
  { target: 6, parts: [2, 4] },
  { target: 7, parts: [3, 4] },
  { target: 8, parts: [3, 5] },
  { target: 9, parts: [4, 5] },
  { target: 10, parts: [3, 7] },
  // 3-block problems — student must combine ALL into one
  { target: 6, parts: [1, 2, 3] },
  { target: 7, parts: [1, 2, 4] },
  { target: 8, parts: [1, 3, 4] },
  { target: 9, parts: [2, 3, 4] },
  { target: 10, parts: [1, 3, 6] },
  { target: 10, parts: [2, 3, 5] },
  { target: 10, parts: [1, 4, 5] },
]

/** Generate a problem: set target, create blocks with values that sum to target */
function generateProblem() {
  resetBlocks()

  const template = PROBLEM_TEMPLATES[Math.floor(Math.random() * PROBLEM_TEMPLATES.length)]!
  targetValue.value = template.target

  // Shuffle parts for variety
  const parts = [...template.parts].sort(() => Math.random() - 0.5)

  // Create blocks with spread-out positions
  const playgroundWidth = 320
  const gap = 16
  const totalBlockWidth = parts.reduce((s, v) => s + v * 36, 0) + (parts.length - 1) * gap
  let offsetX = Math.max(20, (playgroundWidth - totalBlockWidth) / 2)

  for (const part of parts) {
    const block = createBlock(part, offsetX, 60)
    block.state = 'idle'
    offsetX += part * 36 + gap
  }
}

function onBlockMoved(id: number, x: number, y: number) {
  moveBlock(id, x, y)
}

function onBlocksCombined(idA: number, idB: number) {
  const combined = combineBlocks(idA, idB)

  if (!combined) {
    // Can't combine (sum > 10) — just release, don't celebrate
    return
  }

  // Celebrate ONLY when exactly 1 block remains AND its value matches target
  if (blocks.value.length === 1 && blocks.value[0]!.value === targetValue.value) {
    showCelebration.value = true
    solvedCount.value++
    successMessage.value = successMessages[Math.floor(Math.random() * successMessages.length)] ?? 'Блоки склеились!'
  } else if (blocks.value.length === 1 && blocks.value[0]!.value !== targetValue.value) {
    // Single block but wrong value — start over
    generateProblem()
  }
  // If more than 1 block remains, keep playing
}

function onBlockReleased(_id: number) {
  // Block released without combining — just leave it where it is
}

function nextProblem() {
  showCelebration.value = false
  generateProblem()
}

function skipProblem() {
  showCelebration.value = false
  generateProblem()
}

function goHome() {
  router.push('/')
}

onMounted(() => {
  generateProblem()
})
</script>

<style scoped>
.blocks-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
  position: relative;
  background: var(--color-bg-light);
}

.blocks-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}

.blocks-view__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.blocks-view__target {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin: 16px 0 8px;
}

.blocks-view__target-label {
  font-size: 16px;
  color: var(--color-text-secondary);
}

.blocks-view__target-value {
  font-size: 48px;
  font-weight: 800;
  color: #f59e0b;
  min-width: 60px;
  text-align: center;
}

.blocks-view__hint {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

/* Celebration */
.blocks-view__celebration {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(248, 249, 255, 0.9);
  backdrop-filter: blur(8px);
  z-index: 50;
  gap: 16px;
}

.blocks-view__celebration-text {
  font-size: 48px;
  font-weight: 800;
  color: #f59e0b;
}

.blocks-view__celebration-sub {
  font-size: 20px;
  color: var(--color-text);
}

.blocks-view__next-btn {
  margin-top: 16px;
  padding: 12px 32px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: var(--color-bg);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease;
  font-family: 'Rubik', 'Nunito', sans-serif;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.blocks-view__next-btn:hover {
  transform: scale(1.05);
}

/* Transition for celebration */
.celebrate-enter-active {
  transition: all 0.3s ease-out;
}
.celebrate-leave-active {
  transition: all 0.2s ease-in;
}
.celebrate-enter-from {
  opacity: 0;
  transform: scale(0.9);
}
.celebrate-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Footer */
.blocks-view__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding: 16px 0;
}

.blocks-view__score {
  font-size: 16px;
  color: var(--color-text);
  font-weight: 600;
}

.blocks-view__skip-btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: 2px solid var(--color-border-light);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Rubik', 'Nunito', sans-serif;
}

.blocks-view__skip-btn:hover {
  background: var(--color-bg-accent);
  color: var(--color-text);
}

/* Mobile responsive */
@media (max-width: 480px) {
  .blocks-view {
    background: var(--color-bg);
    padding: 12px;
  }
  .blocks-view__title {
    font-size: 16px;
  }

  .blocks-view__target-value {
    font-size: 36px;
  }

  .blocks-view__celebration-text {
    font-size: 36px;
  }

  .blocks-view__next-btn {
    padding: 10px 24px;
    font-size: 16px;
  }
}
</style>
