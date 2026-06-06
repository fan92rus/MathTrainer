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
  totalValue,
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

/** Generate a random target that can be expressed as sum of 2-3 numbers (each 1-10, sum ≤ 10) */
function generateProblem() {
  resetBlocks()

  // Pick 2-3 parts that sum to target
  const numParts = Math.random() > 0.5 ? 2 : 3
  let remaining = 0
  const parts: number[] = []

  if (numParts === 2) {
    // Two parts: a + b = target
    const a = Math.floor(Math.random() * 9) + 1 // 1-9
    const b = Math.min(10 - a, Math.floor(Math.random() * 9) + 1)
    parts.push(a, b)
  } else {
    // Three parts
    const a = Math.floor(Math.random() * 5) + 1
    const b = Math.floor(Math.random() * Math.min(5, 10 - a)) + 1
    const c = Math.min(10 - a - b, Math.floor(Math.random() * 4) + 1)
    parts.push(a, b, c)
  }

  remaining = parts.reduce((s, v) => s + v, 0)
  targetValue.value = remaining

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
    // Can't combine (sum > 10) — just release
    return
  }

  // Check if target reached
  if (totalValue.value === targetValue.value) {
    showCelebration.value = true
    solvedCount.value++
    successMessage.value = successMessages[Math.floor(Math.random() * successMessages.length)] ?? 'Блоки склеились!'
  } else if (totalValue.value > targetValue.value) {
    // Overshot — reset blocks for this problem
    generateProblem()
  }
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
  color: #fff;
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
  color: rgba(255, 255, 255, 0.6);
}

.blocks-view__target-value {
  font-size: 48px;
  font-weight: 800;
  color: #ffd700;
  min-width: 60px;
  text-align: center;
}

.blocks-view__hint {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 50;
  gap: 16px;
}

.blocks-view__celebration-text {
  font-size: 48px;
  font-weight: 800;
  color: #ffd700;
}

.blocks-view__celebration-sub {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
}

.blocks-view__next-btn {
  margin-top: 16px;
  padding: 12px 32px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease;
  font-family: 'Rubik', 'Nunito', sans-serif;
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
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.blocks-view__skip-btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Rubik', 'Nunito', sans-serif;
}

.blocks-view__skip-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .blocks-view__title {
    font-size: 16px;
  }

  .blocks-view__target-value {
    font-size: 36px;
  }
}
</style>
