<template>
  <div
    class="tower-floor"
    :class="[
      `tower-floor--${theme}`,
      floor.state === 'waiting' ? 'tower-floor--waiting' : 'tower-floor--built',
      floor.isMilestone ? 'tower-floor--milestone' : '',
    ]"
    :style="{ '--hue': hue, '--floor-depth': depth }"
  >
    <span class="tower-floor__emoji">{{ floor.isMilestone ? '👑' : floorEmoji }}</span>
    <span class="tower-floor__expression">{{ floor.expression }}={{ floor.answer }}</span>
    <span v-if="floor.isMilestone" class="tower-floor__badge">🌟</span>
    <span v-if="floor.state === 'waiting'" class="tower-floor__scaffold">🚧</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TowerFloor as TowerFloorType, TowerTheme } from '@/types/tower'

const props = defineProps<{
  floor: TowerFloorType
  theme: TowerTheme
  totalHeight: number
}>()

/** 0..1 — depth in the tower (0=bottom, 1=top) */
const depth = computed(() => {
  if (props.totalHeight <= 1) return 1
  return (props.floor.level - 1) / (props.totalHeight - 1)
})

/** Hue rotation per level — each floor gets a distinct color */
const PALETTES: Record<TowerTheme, number[]> = {
  castle: [25, 15, 5, 350, 340, 330],     /* warm: peach→rose */
  rocket: [200, 210, 220, 230, 240, 250],  /* cool: sky→indigo */
  tree:   [90, 100, 110, 120, 130, 140],   /* greens */
  tower:  [0, 50, 180, 230, 290, 340],     /* rainbow */
}
const hues = computed(() => PALETTES[props.theme] || PALETTES.castle)
const hue = computed(() => {
  const idx = (props.floor.level - 1) % hues.value.length
  return hues.value[idx]
})

const FLOOR_FACES = ['😊', '🙂', '😃', '😌', '😏', '😄']
const floorEmoji = computed(() => FLOOR_FACES[props.floor.level % FLOOR_FACES.length])
</script>

<style scoped>
/* =====================================================
   Tower Floor — Colorful Block
   Each floor is a pastel block with outer shadow for depth.
   Bright, child-friendly, no dark tones.
   ===================================================== */

.tower-floor {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
  min-height: 32px;
  position: relative;
  transition: all 0.3s ease;
  font-family: 'Nunito', sans-serif;

  /* 3D depth via outer shadow + light bevel border */
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  border-left: 2px solid rgba(255, 255, 255, 0.55);
  border-top: 1px solid rgba(255, 255, 255, 0.35);
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  border-bottom: 2px solid rgba(0, 0, 0, 0.10);
}

/* ---- Background via HSL — pastel with depth lightening ---- */
.tower-floor--castle,
.tower-floor--rocket,
.tower-floor--tree,
.tower-floor--tower {
  background: hsl(
    var(--hue),
    55%,
    calc(80% + var(--floor-depth) * 12%)
  );
  color: hsl(var(--hue), 40%, 20%);
}

/* ---- Waiting floors ---- */
.tower-floor--waiting {
  opacity: 0.5;
  box-shadow: none;
  border: 2px dashed rgba(0, 0, 0, 0.12);
  background: repeating-linear-gradient(
    -45deg,
    transparent 0px,
    transparent 6px,
    rgba(0, 0, 0, 0.03) 6px,
    rgba(0, 0, 0, 0.03) 8px
  );
}
.tower-floor--waiting .tower-floor__expression {
  visibility: hidden;
}
.tower-floor__scaffold {
  font-size: 18px;
  animation: scaffold-bounce 1.8s ease-in-out infinite;
  margin-left: auto;
}

/* ---- Milestone floors ---- */
.tower-floor--milestone {
  background: linear-gradient(135deg, #ffe44d 0%, #ffbb00 100%) !important;
  color: #6b4a00 !important;
  border-color: #e6a800 !important;
  box-shadow:
    0 3px 8px rgba(255, 200, 0, 0.35),
    0 0 0 1px rgba(230, 168, 0, 0.3);
  border-left: 3px solid rgba(255, 255, 200, 0.7);
  border-bottom: 2px solid rgba(180, 130, 0, 0.3);
}
.tower-floor--milestone .tower-floor__badge {
  font-size: 18px;
  animation: badge-spin 2s ease-in-out infinite;
  margin-left: auto;
}

/* ---- Text elements ---- */
.tower-floor__emoji {
  font-size: 18px;
  line-height: 1;
  min-width: 22px;
  text-align: center;
}

.tower-floor__expression {
  flex: 1;
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- Animations ---- */
@keyframes badge-spin {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50%      { transform: scale(1.3) rotate(15deg); }
}

@keyframes scaffold-bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}

/* ---- Enter animation (from TransitionGroup) ---- */
.tower-floor-enter-active {
  animation: floor-drop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes floor-drop {
  0%   { opacity: 0; transform: translateY(-20px) scaleY(0.8); }
  60%  { opacity: 1; transform: translateY(4px) scaleY(1.03); }
  80%  { transform: translateY(-1px) scaleY(0.99); }
  100% { transform: translateY(0) scaleY(1); }
}

/* ---- Mobile ---- */
@media (max-width: 480px) {
  .tower-floor {
    padding: 4px 8px;
    font-size: 11px;
    min-height: 26px;
    gap: 3px;
  }
  .tower-floor__emoji {
    font-size: 13px;
    min-width: 16px;
  }
  .tower-floor__expression {
    font-size: 11px;
  }
}
</style>
