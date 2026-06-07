<template>
  <div class="number-line" ref="containerRef">
    <canvas ref="canvasRef" class="number-line__canvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { NumberLineRange, JumpPhase, JumpAnimation } from '@/types/numberLine'

const props = defineProps<{
  range: NumberLineRange
  markerPosition: number
  jumpAnimation: JumpAnimation | null
  jumpPhase: JumpPhase
  jumpArcs: { from: number; to: number; id: number }[]
  targetPosition: number | null
  isWaitingForTap: boolean
}>()

const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

// ── Constants ──────────────────────────────────────────
const CANVAS_H = 120
const PAD_X = 24
const AXIS_Y_RATIO = 0.68
const MIN_LABEL_GAP = 34
const ARC_H_MAX = 40

// ── Internal state ─────────────────────────────────────
let rafId = 0
let resizeObserver: ResizeObserver | null = null
let dpr = 1
/** Container width in CSS pixels */
let cssW = 0

// ── Lifecycle ──────────────────────────────────────────
onMounted(() => {
  resizeCanvas()
  startLoop()

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => resizeCanvas())
    resizeObserver.observe(containerRef.value as unknown as Element)
  }
})

onUnmounted(() => {
  stopLoop()
  resizeObserver?.disconnect()
})

function resizeCanvas() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  const rect = container.getBoundingClientRect() as DOMRect
  dpr = window.devicePixelRatio || 1
  cssW = rect.width
  canvas.width = cssW * dpr
  canvas.height = CANVAS_H * dpr
  canvas.style.width = cssW + 'px'
  canvas.style.height = CANVAS_H + 'px'
}

// ── Render loop ────────────────────────────────────────
function startLoop() {
  function frame() { draw(); rafId = requestAnimationFrame(frame) }
  rafId = requestAnimationFrame(frame)
}

function stopLoop() {
  if (rafId) cancelAnimationFrame(rafId)
}

// ── Data helpers ───────────────────────────────────────
function buildTicks(): number[] {
  const { min, max, step } = props.range
  const nums: number[] = []
  for (let i = min; i <= max; i += step) nums.push(i)
  return nums
}

function computeVisible(
  ticks: number[],
  xOf: (n: number) => number,
): { visibleTicks: Set<number>; labels: Set<number> } {
  const count = ticks.length
  if (count === 0) return { visibleTicks: new Set(), labels: new Set() }

  // Always show ≤ 12
  if (count <= 12) return { visibleTicks: new Set(ticks), labels: new Set(ticks) }

  const span = ticks[count - 1]! - ticks[0]!
  const all = new Set(ticks)

  // Important numbers
  const important = new Set<number>()
  important.add(ticks[0]!)
  important.add(ticks[count - 1]!)
  const mr = Math.round(props.markerPosition)
  if (all.has(mr)) important.add(mr)
  if (props.targetPosition !== null && all.has(props.targetPosition)) important.add(props.targetPosition)
  for (const a of props.jumpArcs) {
    if (all.has(a.from)) important.add(a.from)
    if (all.has(a.to)) important.add(a.to)
  }

  // Tick filtering
  const tickStep = span > 40 ? 10 : span > 20 ? 5 : 2
  const visibleTicks = new Set(ticks.filter(n => n % tickStep === 0 || important.has(n)))

  // Labels — round numbers with collision + important overlays
  const roundStep = span > 40 ? 10 : span > 12 ? 5 : 1
  const labels = new Set<number>()
  const positions: { x: number; n: number }[] = []

  // First pass: round numbers
  for (const n of ticks) {
    if (important.has(n)) continue
    if (roundStep > 1 && n % roundStep !== 0) continue
    const x = xOf(n)
    if (positions.every(p => Math.abs(p.x - x) >= MIN_LABEL_GAP)) {
      positions.push({ x, n })
      labels.add(n)
    }
  }

  // Second pass: important numbers (evict if too close)
  for (const n of ticks) {
    if (!important.has(n)) continue
    const x = xOf(n)
    const conflict = positions.find(p => Math.abs(p.x - x) < MIN_LABEL_GAP)
    if (conflict) {
      const idx = positions.indexOf(conflict)
      positions.splice(idx, 1)
      labels.delete(conflict.n)
    }
    positions.push({ x, n })
    labels.add(n)
  }

  return { visibleTicks, labels }
}

/** Current frog position & state — interpolates jumpAnimation */
function frogState() {
  const anim = props.jumpAnimation
  if (!anim) {
    return { frogNum: props.markerPosition, frogY: 0, lookDir: 0, phase: 'idle' }
  }

  if (anim.phase === 'preparing') {
    return { frogNum: anim.from, frogY: 3, lookDir: Math.sign(anim.to - anim.from) as 1 | -1 | 0, phase: 'preparing' }
  }

  if (anim.phase === 'flying') {
    const t = Math.min((performance.now() - anim.startTime) / anim.duration, 1)
    const eased = 1 - (1 - t) ** 3
    const arcH = Math.min(ARC_H_MAX, 12 + Math.abs(anim.to - anim.from) * 0.35)
    return {
      frogNum: anim.from + (anim.to - anim.from) * eased,
      frogY: -arcH * 4 * t * (1 - t),
      lookDir: Math.sign(anim.to - anim.from) as 1 | -1 | 0,
      phase: 'flying',
    }
  }

  // landing — dampened bounce
  const p = Math.min((performance.now() - anim.startTime) / 200, 1)
  const bounce = 5 * Math.sin(p * Math.PI * 3) * (1 - p)
  return { frogNum: anim.to, frogY: bounce, lookDir: 0, phase: 'landing' }
}

// ── Main draw ──────────────────────────────────────────
function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const W = canvas.width / dpr
  const H = canvas.height / dpr
  const axisY = H * AXIS_Y_RATIO
  const usableW = Math.max(W - PAD_X * 2, 0)
  if (usableW <= 0) return

  const ticks = buildTicks()
  const count = ticks.length
  if (count < 2) return

  // X position lookup: exact via Map, animated via linear fallback
  const xMap = new Map<number, number>()
  for (let i = 0; i < count; i++) {
    xMap.set(ticks[i]!, PAD_X + (i / (count - 1)) * usableW)
  }
  const rangeSpan = props.range.max - props.range.min || 1
  const numToX = (n: number) => xMap.get(n) ?? PAD_X + ((n - props.range.min) / rangeSpan) * usableW

  // ── Clear ──
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.scale(dpr, dpr)
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'
  ctx.font = '500 11px "Nunito", "Rubik", sans-serif'

  const { visibleTicks, labels } = computeVisible(ticks, numToX)

  // 1. Axis line
  ctx.strokeStyle = '#d0d5e0'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(PAD_X, axisY)
  ctx.lineTo(PAD_X + usableW, axisY)
  ctx.stroke()

  // 2. Tick marks
  for (const n of visibleTicks) {
    const x = numToX(n)
    const hasLabel = labels.has(n)
    ctx.strokeStyle = '#c0c8d8'
    ctx.lineWidth = hasLabel ? 1.5 : 1
    const h = hasLabel ? 8 : 5
    ctx.beginPath()
    ctx.moveTo(x, axisY - h)
    ctx.lineTo(x, axisY + h)
    ctx.stroke()
  }

  // 3. Jump arcs
  if (props.jumpArcs.length > 0) {
    ctx.strokeStyle = '#667eea'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.lineCap = 'round'
    for (const arc of props.jumpArcs) {
      const x1 = numToX(arc.from)
      const x2 = numToX(arc.to)
      const midX = (x1 + x2) / 2
      const arcH = Math.min(30, 10 + Math.abs(arc.to - arc.from) * 0.3)
      ctx.beginPath()
      ctx.moveTo(x1, axisY)
      ctx.quadraticCurveTo(midX, axisY - arcH, x2, axisY)
      ctx.stroke()
      // End dot
      ctx.setLineDash([])
      ctx.fillStyle = '#667eea'
      ctx.beginPath()
      ctx.arc(x2, axisY, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.setLineDash([6, 4])
    }
    ctx.setLineDash([])
  }

  // 4. Labels
  for (const n of labels) {
    const x = numToX(n)
    const isHighlight = n === props.targetPosition
    ctx.fillStyle = isHighlight ? '#f59e0b' : '#555'
    ctx.font = `${isHighlight ? 700 : 500} ${count <= 12 ? 13 : 10}px "Nunito", "Rubik", sans-serif`
    ctx.fillText(String(n), x, axisY + 14)
  }

  // 5. Target pulse
  if (props.isWaitingForTap && props.targetPosition !== null) {
    const pulse = performance.now() / 1000
    const r = 14 + 3 * Math.sin(pulse * Math.PI * 2)
    const alpha = 0.3 + 0.3 * Math.sin(pulse * Math.PI * 2)
    ctx.strokeStyle = '#ffd700'
    ctx.lineWidth = 2
    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.arc(numToX(props.targetPosition), axisY, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  // 6. Frog
  const frog = frogState()
  drawFrog(ctx, numToX(frog.frogNum), axisY + frog.frogY, frog.lookDir, frog.phase)

  ctx.restore()
}

// ── Frog drawing ───────────────────────────────────────
function drawFrog(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  lookDir: number,
  phase: string,
) {
  ctx.save()
  ctx.translate(x, y - 10) // sits on axis

  // Squash & stretch
  let sx = 1, sy = 1
  if (phase === 'preparing') { sx = 1.2; sy = 0.78 }
  else if (phase === 'flying') { sx = 0.85; sy = 1.18 }
  ctx.scale(sx, sy)

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.07)'
  ctx.beginPath()
  ctx.ellipse(0, 10, 11, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Back legs
  ctx.fillStyle = '#43A047'
  ctx.beginPath()
  ctx.ellipse(-10, 5, 5, 3.5, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(10, 5, 5, 3.5, 0.3, 0, Math.PI * 2)
  ctx.fill()

  // Body
  ctx.fillStyle = '#4CAF50'
  ctx.beginPath()
  ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2)
  ctx.fill()

  // Belly
  ctx.fillStyle = '#A5D6A7'
  ctx.beginPath()
  ctx.ellipse(0, 3, 8, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Eyes (white)
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(-5, -6, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(5, -6, 5, 0, Math.PI * 2)
  ctx.fill()

  // Pupils — follow look direction
  const px = lookDir * 1.8
  ctx.fillStyle = '#1B5E20'
  ctx.beginPath()
  ctx.arc(-5 + px, -6, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(5 + px, -6, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // Eye shine
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(-5 + px + 1, -7, 1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(5 + px + 1, -7, 1, 0, Math.PI * 2)
  ctx.fill()

  // Smile
  ctx.strokeStyle = '#2E7D32'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(0, -1, 5, 0.25, Math.PI - 0.25)
  ctx.stroke()

  // Blush
  ctx.fillStyle = 'rgba(244, 143, 177, 0.35)'
  ctx.beginPath()
  ctx.ellipse(-10, -1, 3, 2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(10, -1, 3, 2, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}
</script>

<style scoped>
.number-line {
  width: 100%;
  display: flex;
  justify-content: center;
  min-height: 120px;
}

.number-line__canvas {
  display: block;
  max-width: 100%;
}
</style>
