<template>
  <div class="balance-beam" :class="`balance-beam--${tiltState}`">
    <svg
      viewBox="0 0 400 280"
      class="balance-beam__svg"
    >
      <!-- Beam group (tilts around fulcrum) -->
      <g
        class="balance-beam__beam-group"
        :style="beamTransform"
      >
        <!-- Horizontal beam bar -->
        <line
          x1="40" y1="60" x2="360" y2="60"
          stroke="rgba(255,255,255,0.6)"
          stroke-width="4"
          stroke-linecap="round"
        />

        <!-- Left chain (beam → pan) -->
        <line
          x1="100" y1="60" x2="100" y2="95"
          stroke="rgba(255,255,255,0.3)"
          stroke-width="1.5"
        />
        <!-- Right chain -->
        <line
          x1="300" y1="60" x2="300" y2="95"
          stroke="rgba(255,255,255,0.3)"
          stroke-width="1.5"
        />

        <!-- Left pan platform -->
        <rect
          x="55" y="95" width="90" height="6" rx="3"
          fill="rgba(255,255,255,0.15)"
        />
        <!-- Right pan platform -->
        <rect
          x="255" y="95" width="90" height="6" rx="3"
          fill="rgba(255,255,255,0.15)"
        />

        <!-- Left pan: value + apples -->
        <g>
          <text
            x="100" y="125"
            text-anchor="middle"
            font-size="28"
            font-weight="700"
            fill="#fff"
            font-family="inherit"
          >{{ leftValue }}</text>
          <!-- Apple row -->
          <text
            v-for="i in Math.min(leftValue, 6)"
            :key="'la' + i"
            :x="60 + ((i - 1) % 3) * 22"
            :y="145 + Math.floor((i - 1) / 3) * 18"
            font-size="14"
          >🍎</text>
          <text
            v-if="leftValue > 6"
            x="100"
            :y="leftValue > 12 ? 180 : 162"
            text-anchor="middle"
            font-size="12"
            fill="rgba(255,255,255,0.5)"
            font-family="inherit"
          >+{{ leftValue - 6 }}</text>
        </g>

        <!-- Right pan: value + apples -->
        <g>
          <text
            x="300" y="125"
            text-anchor="middle"
            font-size="28"
            font-weight="700"
            fill="#fff"
            font-family="inherit"
          >{{ rightValue !== null ? rightValue : '?' }}</text>
          <text
            v-for="i in Math.min(rightValue ?? 0, 6)"
            :key="'ra' + i"
            :x="260 + ((i - 1) % 3) * 22"
            :y="145 + Math.floor((i - 1) / 3) * 18"
            font-size="14"
          >🍎</text>
          <text
            v-if="(rightValue ?? 0) > 6"
            x="300"
            :y="(rightValue ?? 0) > 12 ? 180 : 162"
            text-anchor="middle"
            font-size="12"
            fill="rgba(255,255,255,0.5)"
            font-family="inherit"
          >+{{ (rightValue ?? 0) - 6 }}</text>
        </g>
      </g>

      <!-- Fulcrum (triangle) — stays fixed, doesn't tilt -->
      <polygon
        points="200,60 185,100 215,100"
        fill="rgba(255,255,255,0.5)"
      />
      <rect
        x="175" y="100" width="50" height="8" rx="3"
        fill="rgba(255,255,255,0.3)"
      />

      <!-- Equation text below fulcrum -->
      <text
        x="200" y="220"
        text-anchor="middle"
        font-size="18"
        fill="rgba(255,255,255,0.8)"
        font-family="inherit"
      >{{ leftValue }} = {{ rightValue !== null ? rightValue : '?' }}{{ targetValue !== null ? ` (цель: ${targetValue})` : '' }}</text>

      <!-- Balanced indicator -->
      <g v-if="isBalanced" class="balance-beam__balanced-glow">
        <text x="200" y="252" text-anchor="middle" font-size="20" font-family="inherit">
          ⚖️ Баланс!
        </text>
        <!-- Sparkle particles -->
        <circle cx="160" cy="210" r="2.5" fill="#ffd700" class="balance-beam__spark" />
        <circle cx="240" cy="205" r="2" fill="#ffd700" class="balance-beam__spark" style="animation-delay: 0.15s" />
        <circle cx="200" cy="198" r="2" fill="#ffd700" class="balance-beam__spark" style="animation-delay: 0.3s" />
        <circle cx="180" cy="240" r="1.5" fill="#ffd700" class="balance-beam__spark" style="animation-delay: 0.45s" />
        <circle cx="225" cy="235" r="2" fill="#ffd700" class="balance-beam__spark" style="animation-delay: 0.6s" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Значение на левой чаше (целое) */
  leftValue: number
  /** Значение на правой чаше (null = неизвестное / пустое) */
  rightValue: number | null
  /** Целевое значение (ожидаемый правильный ответ) */
  targetValue?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  targetValue: null,
})

/** Разница между чашами */
const diff = computed(() => {
  const rv = props.rightValue ?? 0
  return rv - props.leftValue
})

/** Угол наклона (градусы): ±15° max, пропорционально разнице */
const tiltAngle = computed(() => {
  if (props.rightValue === null) return 0
  return Math.sign(diff.value) * Math.min(Math.abs(diff.value) * 2, 15)
})

/** Состояние наклона для CSS-класса */
const tiltState = computed<'balanced' | 'left-heavy' | 'right-heavy' | 'preview'>(() => {
  if (props.rightValue === null) return 'preview'
  if (diff.value === 0) return 'balanced'
  return diff.value > 0 ? 'right-heavy' : 'left-heavy'
})

/** Весы сбалансированы */
const isBalanced = computed(() => {
  return props.rightValue !== null && diff.value === 0
})

/** CSS transform для наклона балки */
const beamTransform = computed(() => ({
  transform: `rotate(${tiltAngle.value}deg)`,
  transformOrigin: '200px 60px',
}))
</script>

<style scoped>
.balance-beam {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.balance-beam__svg {
  width: 100%;
  height: auto;
  display: block;
}

.balance-beam__beam-group {
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Balanced: green glow on beam ends */
.balance-beam--balanced .balance-beam__beam-group line:first-child {
  stroke: #4caf50;
}

/* Sparkle animation */
.balance-beam__spark {
  animation: sparkle-fade 1.2s ease-in-out infinite alternate;
}

@keyframes sparkle-fade {
  0% { opacity: 0.2; r: 1.5; }
  100% { opacity: 1; r: 3; }
}

/* Balanced glow appearance */
.balance-beam__balanced-glow {
  animation: glow-appear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes glow-appear {
  0% { opacity: 0; transform: scale(0.5) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

/* Preview state: subtle pulse on beam */
.balance-beam--preview .balance-beam__beam-group line:first-child {
  stroke-dasharray: 8, 4;
  animation: preview-dash 2s linear infinite;
}

@keyframes preview-dash {
  to { stroke-dashoffset: -24; }
}

/* Responsive: small screens */
@media (max-width: 480px) {
  .balance-beam {
    max-width: 320px;
  }
}

@media (max-width: 320px) {
  .balance-beam {
    max-width: 280px;
  }
}
</style>
