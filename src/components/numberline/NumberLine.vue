<template>
  <div class="number-line" ref="containerRef">
    <svg
      :viewBox="`0 0 ${svgViewWidth} ${svgViewHeight}`"
      class="number-line__svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Main axis line -->
      <line
        x1="padding" :y1="axisY"
        :x2="svgViewWidth - padding" :y2="axisY"
        stroke="#d0d5e0"
        stroke-width="2"
      />

      <!-- Tick marks and labels -->
      <g v-for="(num, i) in tickNumbers" :key="'tick-' + i">
        <!-- Tick line -->
        <line
          :x1="tickX(i)" :y1="axisY - tickH"
          :x2="tickX(i)" :y2="axisY + tickH"
          :stroke="isTarget(num) ? '#f59e0b' : isHighlighted(num) ? '#667eea' : '#c0c8d8'"
          :stroke-width="isTarget(num) ? 3 : 1.5"
        />
        <!-- Number label -->
        <text
          :x="tickX(i)"
          :y="axisY + tickH + labelOffset"
          text-anchor="middle"
          :fill="isTarget(num) ? '#f59e0b' : isHighlighted(num) ? '#667eea' : '#999'"
          :font-size="computedFontSize"
          :font-weight="isTarget(num) ? 700 : 400"
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
        <!-- Arrow at the end -->
        <circle
          :cx="positionForNumber(arc.to)"
          :cy="axisY"
          r="3"
          fill="#667eea"
          opacity="0.6"
        />
      </g>

      <!-- Target indicator (pulsing ring) -->
      <circle
        v-if="targetPosition !== null && isWaitingForTap"
        :cx="positionForNumber(targetPosition)"
        :cy="axisY"
        r="14"
        fill="none"
        stroke="#ffd700"
        stroke-width="2"
        opacity="0.6"
        class="number-line__target-pulse"
      />

      <!-- Marker (frog/character) -->
      <g
        :transform="`translate(${positionForNumber(markerPosition)}, ${axisY})`"
        class="number-line__marker"
        :class="{ 'number-line__marker--flying': jumpPhase === 'flying' }"
      >
        <!-- Frog body -->
        <ellipse cx="0" cy="-4" :rx="frogRX" :ry="frogRY" fill="#4caf50" />
        <!-- Eyes -->
        <circle :cx="-frogRX * 0.42" :cy="-frogRY - 2" :r="frogRX * 0.35" fill="#fff" />
        <circle :cx="frogRX * 0.42" :cy="-frogRY - 2" :r="frogRX * 0.35" fill="#fff" />
        <circle :cx="-frogRX * 0.35" :cy="-frogRY - 2.7" :r="frogRX * 0.18" fill="#333" />
        <circle :cx="frogRX * 0.49" :cy="-frogRY - 2.7" :r="frogRX * 0.18" fill="#333" />
        <!-- Mouth -->
        <path :d="`M ${-frogRX * 0.3} -2 Q 0 ${frogRY * 0.4} ${frogRX * 0.3} -2`" fill="none" stroke="#2e7d32" stroke-width="1.5" />
      </g>
    </svg>

    <!-- Expression overlay -->
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

/** Measure container width for responsive sizing */
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

/** SVG viewBox width: fixed internal coordinate space */
const svgViewWidth = 400
const svgViewHeight = 100

/** Adaptive font size based on tick count */
const computedFontSize = computed(() => {
  const count = props.tickNumbers.length
  if (count <= 6) return 14
  if (count <= 11) return 13
  if (count <= 16) return 11
  if (count <= 21) return 10
  return 9
})

/** Label offset below tick */
const labelOffset = computed(() => {
  const count = props.tickNumbers.length
  return count > 16 ? 16 : 18
})

/** Frog size adapts to tick density */
const frogRX = computed(() => {
  const count = props.tickNumbers.length
  if (count <= 6) return 14
  if (count <= 11) return 12
  if (count <= 16) return 10
  return 8
})

const frogRY = computed(() => {
  const count = props.tickNumbers.length
  if (count <= 6) return 12
  if (count <= 11) return 10
  if (count <= 16) return 8
  return 7
})

/** X position for a tick by index (in viewBox coordinates) */
function tickX(index: number): number {
  const count = props.tickNumbers.length
  const usableWidth = svgViewWidth - padding * 2
  return padding + (index / Math.max(count - 1, 1)) * usableWidth
}

/** X position for a number value */
function positionForNumber(num: number): number {
  const index = props.tickNumbers.indexOf(num)
  if (index < 0) return tickX(0)
  return tickX(index)
}

/** SVG arc path between two numbers */
function arcPath(from: number, to: number): string {
  const x1 = positionForNumber(from)
  const x2 = positionForNumber(to)
  const midX = (x1 + x2) / 2
  const height = -28
  return `M ${x1} ${axisY} Q ${midX} ${axisY + height} ${x2} ${axisY}`
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
  /* NO overflow-x — always fits in screen */
  padding: 4px 0;
}

.number-line__svg {
  width: 100%;
  height: auto;
  display: block;
  /* SVG scales to fit container via viewBox */
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

/* Marker animation */
.number-line__marker {
  transition: transform 0.1s linear;
}

.number-line__marker--flying {
  filter: drop-shadow(0 4px 6px rgba(76, 175, 80, 0.4));
}

/* Target pulse */
.number-line__target-pulse {
  animation: target-pulse 1.2s ease-in-out infinite;
}

@keyframes target-pulse {
  0%, 100% { r: 14; opacity: 0.3; }
  50% { r: 18; opacity: 0.7; }
}

/* Expression */
.number-line__expression {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 4px;
}
</style>
