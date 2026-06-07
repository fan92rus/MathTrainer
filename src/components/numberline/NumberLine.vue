<template>
  <div class="number-line" ref="containerRef">
    <svg
      :viewBox="`0 0 ${svgViewWidth} ${svgViewHeight}`"
      class="number-line__svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Main axis line -->
      <line
        x1="24" :y1="axisY"
        :x2="svgViewWidth - 24" :y2="axisY"
        stroke="#d0d5e0"
        stroke-width="2"
      />

      <!-- Tick marks (filtered for large ranges) -->
      <g v-for="(num, i) in visibleTicks" :key="'tick-' + i">
        <!-- Minor tick (shorter, thinner) for unlabeled numbers -->
        <line
          :x1="tickXByNum(num)" :y1="axisY - (shouldShowLabel(num) ? tickH : minorTickH)"
          :x2="tickXByNum(num)" :y2="axisY + (shouldShowLabel(num) ? tickH : minorTickH)"
          :stroke="isTarget(num) ? '#f59e0b' : isHighlighted(num) ? '#667eea' : '#c0c8d8'"
          :stroke-width="isTarget(num) ? 3 : shouldShowLabel(num) ? 1.5 : 1"
        />
        <!-- Label only for selected numbers -->
        <text
          v-if="shouldShowLabel(num)"
          :x="tickXByNum(num)"
          :y="axisY + tickH + labelOffset"
          text-anchor="middle"
          :fill="isTarget(num) ? '#f59e0b' : isHighlighted(num) ? '#667eea' : '#666'"
          :font-size="computedFontSize"
          :font-weight="isTarget(num) || isImportant(num) ? 700 : 400"
          class="number-line__tick-label"
          :class="{ 'number-line__tick-label--tappable': isWaitingForTap }"
          @click="onTickClick(num)"
        >
          {{ num }}
        </text>
      </g>

      <!-- Jump arcs -->
      <g v-for="arc in jumpArcs" :key="'arc-' + arc.id">
        <path
          :d="arcPath(arc.from, arc.to)"
          fill="none"
          stroke="#667eea"
          stroke-width="2"
          stroke-dasharray="6,4"
          opacity="0.6"
        />
        <circle
          :cx="tickXByNum(arc.to)"
          :cy="axisY"
          r="3"
          fill="#667eea"
          opacity="0.6"
        />
      </g>

      <!-- Target indicator (pulsing ring) -->
      <circle
        v-if="targetPosition !== null && isWaitingForTap"
        :cx="tickXByNum(targetPosition)"
        :cy="axisY"
        r="14"
        fill="none"
        stroke="#ffd700"
        stroke-width="2"
        opacity="0.6"
        class="number-line__target-pulse"
      />

      <!-- Marker (frog) -->
      <g
        :transform="`translate(${positionForNumber(markerPosition)}, ${axisY})`"
        class="number-line__marker"
        :class="{ 'number-line__marker--flying': jumpPhase === 'flying' }"
      >
        <ellipse cx="0" cy="-4" :rx="frogRX" :ry="frogRY" fill="#4caf50" />
        <circle :cx="-frogRX * 0.42" :cy="-frogRY - 2" :r="frogRX * 0.35" fill="#fff" />
        <circle :cx="frogRX * 0.42" :cy="-frogRY - 2" :r="frogRX * 0.35" fill="#fff" />
        <circle :cx="-frogRX * 0.35" :cy="-frogRY - 2.7" :r="frogRX * 0.18" fill="#333" />
        <circle :cx="frogRX * 0.49" :cy="-frogRY - 2.7" :r="frogRX * 0.18" fill="#333" />
        <path :d="`M ${-frogRX * 0.3} -2 Q 0 ${frogRY * 0.4} ${frogRX * 0.3} -2`" fill="none" stroke="#2e7d32" stroke-width="1.5" />
      </g>
    </svg>

    <div v-if="expression" class="number-line__expression">
      {{ expression }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { NumberLineRange } from '@/types/numberLine'

const props = withDefaults(defineProps<{
  range: NumberLineRange
  markerPosition: number
  jumpPhase: string
  jumpArcs: { from: number; to: number; id: number }[]
  targetPosition: number | null
  isWaitingForTap: boolean
  tickNumbers: number[]
  expression?: string
  highlightRange?: { from: number; to: number } | null
}>(), {
  expression: '',
  highlightRange: null,
})

const emit = defineEmits<{
  tickClick: [value: number]
}>()

const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(400)

const axisY = 55
const padding = 24
const tickH = 8
const minorTickH = 5
const svgViewWidth = 500
const svgViewHeight = 100

/** Minimum distance between labels in viewBox coords.
 *  usableWidth = 500 - 48 = 452. For span 0-100 with step 10, gap = 45.2.
 *  30px minimum ensures "100" (~22px at font 10) doesn't overlap.
 */
const MIN_LABEL_GAP = 34

/** Visible tick marks — filtered for large ranges to avoid visual clutter.
 *  ≤ 20 numbers: show all
 *  > 20: show multiples of 5 + important numbers
 */
const visibleTicks = computed(() => {
  const nums = props.tickNumbers
  if (nums.length <= 20) return nums

  const span = nums[nums.length - 1]! - nums[0]!
  const tickStep = span > 40 ? 5 : span > 20 ? 2 : 1

  // Important numbers that must always have a tick
  const important = new Set<number>()
  if (props.targetPosition !== null) important.add(props.targetPosition)
  const markerRounded = Math.round(props.markerPosition)
  if (nums.includes(markerRounded)) important.add(markerRounded)
  for (const arc of props.jumpArcs) {
    if (nums.includes(arc.from)) important.add(arc.from)
    if (nums.includes(arc.to)) important.add(arc.to)
  }

  return nums.filter(n => n % tickStep === 0 || important.has(n))
})

function updateWidth() {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth || 400
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateWidth()
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => updateWidth())
    resizeObserver.observe(containerRef.value as unknown as Element)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

/** X position for a number value in viewBox coords */
function tickXByNum(num: number): number {
  const count = props.tickNumbers.length
  const index = props.tickNumbers.indexOf(num)
  if (index < 0) return padding
  const usableWidth = svgViewWidth - padding * 2
  return padding + (index / Math.max(count - 1, 1)) * usableWidth
}

/** Alias for composable compatibility */
function positionForNumber(num: number): number {
  return tickXByNum(num)
}

/**
 * Determine which numbers deserve a visible label.
 *
 * Strategy:
 *   - If ≤ 12 numbers total: show all
 *   - Otherwise: show "round" numbers (step depends on span) + important numbers
 *     (target, marker, arc endpoints), but skip any that would be within
 *     MIN_LABEL_GAP of an already-shown label.
 *   - Important numbers ALWAYS show even if they overlap (they're critical).
 */
const labeledNumbers = computed(() => {
  const nums = props.tickNumbers
  if (nums.length === 0) return new Set<number>()

  // Few numbers — show all
  if (nums.length <= 12) return new Set(nums)

  const span = nums[nums.length - 1]! - nums[0]!
  const roundStep = span > 40 ? 10 : span > 12 ? 5 : 1

  // Important numbers: always visible
  const important = new Set<number>()
  important.add(nums[0]!)
  important.add(nums[nums.length - 1]!)
  if (props.targetPosition !== null) important.add(props.targetPosition)
  // Marker (rounded to nearest tick)
  const markerRounded = Math.round(props.markerPosition)
  if (nums.includes(markerRounded)) important.add(markerRounded)
  // Arc endpoints
  for (const arc of props.jumpArcs) {
    if (nums.includes(arc.from)) important.add(arc.from)
    if (nums.includes(arc.to)) important.add(arc.to)
  }

  // "Round" numbers (multiples of roundStep)
  const round = new Set<number>()
  for (const n of nums) {
    if (n % roundStep === 0) round.add(n)
  }

  // Build final set with collision detection
  const result = new Set<number>()
  const placed: number[] = [] // x positions in viewBox coords

  // First: place round numbers (sorted)
  for (const n of nums) {
    if (!round.has(n)) continue
    const x = tickXByNum(n)
    if (!placed.some(px => Math.abs(px - x) < MIN_LABEL_GAP)) {
      placed.push(x)
      result.add(n)
    }
  }

  // Second: place important numbers
  // If an important number is close to an already-placed round number,
  // remove the round number in favor of the important one
  for (const n of nums) {
    if (!important.has(n)) continue
    result.add(n)
    const x = tickXByNum(n)
    // Check if any placed round number is too close — evict it
    const tooCloseIdx = placed.findIndex(px => Math.abs(px - x) < MIN_LABEL_GAP)
    if (tooCloseIdx >= 0) {
      // Find the round number at this position and remove it
      const closeX = placed[tooCloseIdx]!
      for (const rn of result) {
        if (!important.has(rn) && Math.abs(tickXByNum(rn) - closeX) < 1) {
          result.delete(rn)
          break
        }
      }
      placed.splice(tooCloseIdx, 1)
    }
    if (!placed.some(px => Math.abs(px - x) < 1)) {
      placed.push(x)
    }
  }

  return result
})

function shouldShowLabel(num: number): boolean {
  return labeledNumbers.value.has(num)
}

function isImportant(num: number): boolean {
  if (props.targetPosition === num) return true
  if (Math.round(props.markerPosition) === num) return true
  return props.jumpArcs.some(a => a.from === num || a.to === num)
}

const computedFontSize = computed(() => {
  const count = props.tickNumbers.length
  if (count <= 6) return 14
  if (count <= 12) return 13
  if (count <= 20) return 11
  return 10
})

const labelOffset = computed(() => {
  return props.tickNumbers.length > 20 ? 16 : 18
})

const frogRX = computed(() => {
  const count = props.tickNumbers.length
  if (count <= 6) return 14
  if (count <= 12) return 12
  return 9
})

const frogRY = computed(() => {
  const count = props.tickNumbers.length
  if (count <= 6) return 12
  if (count <= 12) return 10
  return 8
})

function arcPath(from: number, to: number): string {
  const x1 = tickXByNum(from)
  const x2 = tickXByNum(to)
  const midX = (x1 + x2) / 2
  return `M ${x1} ${axisY} Q ${midX} ${axisY - 28} ${x2} ${axisY}`
}

function isTarget(num: number): boolean {
  return props.targetPosition === num
}

function isHighlighted(num: number): boolean {
  if (!props.highlightRange) return false
  return num >= props.highlightRange.from && num <= props.highlightRange.to
}

function onTickClick(num: number) {
  if (props.isWaitingForTap) {
    emit('tickClick', num)
  }
}
</script>

<style scoped>
.number-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.number-line__svg {
  width: 100%;
  height: auto;
  display: block;
}

.number-line__tick-label {
  font-family: 'Nunito', 'Rubik', sans-serif;
  cursor: default;
  user-select: none;
}

.number-line__tick-label--tappable {
  cursor: pointer;
}

.number-line__tick-label--tappable:hover {
  fill: #f59e0b !important;
}

.number-line__marker {
  transition: transform 0.1s linear;
}

.number-line__marker--flying {
  filter: drop-shadow(0 4px 6px rgba(76, 175, 80, 0.4));
}

.number-line__target-pulse {
  animation: target-pulse 1.2s ease-in-out infinite;
}

@keyframes target-pulse {
  0%, 100% { r: 14; opacity: 0.3; }
  50% { r: 18; opacity: 0.7; }
}

.number-line__expression {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 4px;
}
</style>
