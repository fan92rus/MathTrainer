<template>
  <div class="number-line">
    <svg
      :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
      class="number-line__svg"
      :style="{ width: svgWidth + 'px', height: svgHeight + 'px' }"
    >
      <!-- Main axis line -->
      <line
        x1="20" :y1="axisY"
        :x2="svgWidth - 20" :y2="axisY"
        stroke="rgba(255,255,255,0.3)"
        stroke-width="2"
      />

      <!-- Tick marks and labels -->
      <g v-for="(num, i) in tickNumbers" :key="'tick-' + i">
        <!-- Tick line -->
        <line
          :x1="tickX(i)" :y1="axisY - 8"
          :x2="tickX(i)" :y2="axisY + 8"
          :stroke="isTarget(num) ? '#ffd700' : isHighlighted(num) ? '#667eea' : 'rgba(255,255,255,0.4)'"
          :stroke-width="isTarget(num) ? 3 : 1.5"
        />
        <!-- Number label -->
        <text
          :x="tickX(i)"
          :y="axisY + 26"
          text-anchor="middle"
          :fill="isTarget(num) ? '#ffd700' : isHighlighted(num) ? '#667eea' : 'rgba(255,255,255,0.6)'"
          :font-size="fontSize"
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
        <ellipse cx="0" cy="-4" rx="14" ry="12" fill="#4caf50" />
        <!-- Eyes -->
        <circle cx="-6" cy="-12" r="5" fill="#fff" />
        <circle cx="6" cy="-12" r="5" fill="#fff" />
        <circle cx="-5" cy="-13" r="2.5" fill="#333" />
        <circle cx="7" cy="-13" r="2.5" fill="#333" />
        <!-- Mouth -->
        <path d="M -4 -2 Q 0 2 4 -2" fill="none" stroke="#2e7d32" stroke-width="1.5" />
      </g>
    </svg>

    <!-- Expression overlay -->
    <div v-if="expression" class="number-line__expression">
      {{ expression }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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


const axisY = 60
const fontSize = 14

/** SVG width based on number of ticks */
const svgWidth = computed(() => {
  const count = props.tickNumbers.length
  return Math.max(300, count * 40 + 40)
})

const svgHeight = 100

/** X position for a tick by index */
function tickX(index: number): number {
  const count = props.tickNumbers.length
  const usableWidth = svgWidth.value - 40 // 20px margins
  return 20 + (index / Math.max(count - 1, 1)) * usableWidth
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
  const height = -30 // arc height above axis
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
  overflow-x: auto;
  padding: 8px 0;
}

.number-line__svg {
  flex-shrink: 0;
}

.number-line__tick-label {
  font-family: 'Nunito', 'Rubik', sans-serif;
  cursor: default;
}

.number-line__tick-label--tappable {
  cursor: pointer;
}

.number-line__tick-label--tappable:hover {
  fill: #ffd700 !important;
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
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-top: 4px;
}

/* Responsive */
@media (max-width: 480px) {
  .number-line {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
