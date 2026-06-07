<template>
  <div
    class="tower-floor"
    :class="[
      `tower-floor--${theme}`,
      `tower-floor--${floor.state}`,
      floor.isMilestone ? 'tower-floor--milestone' : '',
    ]"
    :style="{ '--floor-depth': depth }"
  >
    <!-- 3D bevel top edge -->
    <div class="tower-floor__top-edge"></div>

    <!-- Main face -->
    <div class="tower-floor__face">
      <span class="tower-floor__emoji">{{ floor.isMilestone ? '👑' : floorEmoji }}</span>
      <span class="tower-floor__expression">{{ floor.expression }}={{ floor.answer }}</span>
      <span v-if="floor.isMilestone" class="tower-floor__badge">✨</span>
    </div>

    <!-- 3D bevel bottom edge -->
    <div class="tower-floor__bottom-edge"></div>

    <!-- Scaffolding for waiting floors -->
    <div v-if="floor.state === 'waiting'" class="tower-floor__scaffold">
      <span class="tower-floor__scaffold-icon">🚧</span>
      <div class="tower-floor__scaffold-bars">
        <span></span><span></span><span></span>
      </div>
    </div>
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

/** 0..1 — how far from the bottom this floor sits (0 = bottom, 1 = top) */
const depth = computed(() => {
  if (props.totalHeight <= 1) return 1
  return (props.floor.level - 1) / (props.totalHeight - 1)
})

const FLOOR_FACES = ['😊', '🙂', '😃', '😌', '😏', '😄']
const floorEmoji = computed(() => FLOOR_FACES[props.floor.level % FLOOR_FACES.length])
</script>

<style scoped>
/* =====================================================
   Tower Floor — 3D Block (Variant A)
   Each floor is a stone/masonry block with bevel edges,
   gradient depth, and subtle brick texture.
   ===================================================== */

.tower-floor {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  font-size: 14px;
  min-height: 40px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* ---- 3D Bevel edges ---- */
.tower-floor__top-edge {
  height: 4px;
  border-radius: 6px 6px 0 0;
}

.tower-floor__bottom-edge {
  height: 3px;
  border-radius: 0 0 6px 6px;
}

/* ---- Main face ---- */
.tower-floor__face {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  flex: 1;
  position: relative;
  z-index: 1;
}

.tower-floor__emoji {
  font-size: 16px;
  line-height: 1;
  min-width: 20px;
  text-align: center;
}

.tower-floor__expression {
  flex: 1;
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tower-floor__badge {
  font-size: 14px;
  animation: badge-glow 1.5s ease-in-out infinite;
}

/* =====================================================
   WAITING floors — under construction
   ===================================================== */
.tower-floor--waiting {
  opacity: 0.6;
}

.tower-floor--waiting .tower-floor__face {
  justify-content: center;
  min-height: 36px;
}

.tower-floor--waiting .tower-floor__expression {
  visibility: hidden;
}

.tower-floor__scaffold {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  pointer-events: none;
}

.tower-floor__scaffold-icon {
  font-size: 16px;
  animation: scaffold-bounce 1.8s ease-in-out infinite;
}

.tower-floor__scaffold-bars {
  display: flex;
  gap: 6px;
}

.tower-floor__scaffold-bars span {
  display: block;
  width: 4px;
  height: 12px;
  background: currentColor;
  border-radius: 1px;
  opacity: 0.2;
}

.tower-floor__scaffold-bars span:nth-child(2) { opacity: 0.3; }
.tower-floor__scaffold-bars span:nth-child(3) { opacity: 0.15; }

/* =====================================================
   MILESTONE floors
   ===================================================== */
.tower-floor--milestone .tower-floor__face {
  font-weight: 700;
}

.tower-floor--milestone .tower-floor__top-edge {
  background: linear-gradient(180deg, #ffe44d, #daa520);
}

/* =====================================================
   CASTLE theme — sandstone blocks
   ===================================================== */
.tower-floor--castle {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 240, 0.5),
    inset 1px 0 0 rgba(255, 255, 240, 0.3),
    inset 0 -1px 0 rgba(90, 60, 40, 0.15),
    inset -1px 0 0 rgba(90, 60, 40, 0.1);
}

.tower-floor--castle .tower-floor__top-edge {
  background: linear-gradient(180deg, rgba(255,255,240,0.5), transparent);
}

.tower-floor--castle .tower-floor__bottom-edge {
  background: linear-gradient(0deg, rgba(90,60,40,0.15), transparent);
}

/* Sandstone gradient from darker (bottom) to lighter (top) */
.tower-floor--castle .tower-floor__face {
  background: hsl(
    35,
    35%,
    calc(68% + var(--floor-depth) * 18%)
  );
  /* Subtle brick texture overlay */
  background-image:
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 22px,
      rgba(0,0,0,0.04) 22px,
      rgba(0,0,0,0.04) 23px
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 9px,
      rgba(0,0,0,0.03) 9px,
      rgba(0,0,0,0.03) 10px
    );
  color: #4a3528;
}

/* Castle waiting — muted sandstone */
.tower-floor--castle.tower-floor--waiting {
  opacity: 0.45;
}
.tower-floor--castle.tower-floor--waiting .tower-floor__face {
  background: #e8d9c4;
  background-image:
    repeating-linear-gradient(
      -45deg,
      transparent 0px,
      transparent 4px,
      rgba(0,0,0,0.04) 4px,
      rgba(0,0,0,0.04) 8px
    );
}
.tower-floor--castle.tower-floor--waiting .tower-floor__top-edge,
.tower-floor--castle.tower-floor--waiting .tower-floor__bottom-edge {
  background: #d4c0a8;
}

/* Castle milestone */
.tower-floor--castle.tower-floor--milestone .tower-floor__face {
  background: linear-gradient(135deg, #ffd700 0%, #f0c040 100%);
  color: #5c4000;
  box-shadow:
    inset 0 1px 0 rgba(255,255,200,0.6),
    inset 1px 0 0 rgba(255,255,200,0.4),
    inset 0 -1px 0 rgba(180,160,0,0.2),
    inset -1px 0 0 rgba(180,160,0,0.15),
    0 0 12px rgba(255, 215, 0, 0.3);
}

/* =====================================================
   ROCKET theme — metallic panels
   ===================================================== */
.tower-floor--rocket {
  border-radius: 14px 14px 4px 4px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.5),
    inset 1px 0 0 rgba(255,255,255,0.3),
    inset 0 -1px 0 rgba(0,40,80,0.12),
    inset -1px 0 0 rgba(0,40,80,0.08);
}

.tower-floor--rocket .tower-floor__top-edge {
  background: linear-gradient(180deg, rgba(255,255,255,0.5), transparent);
}
.tower-floor--rocket .tower-floor__bottom-edge {
  background: linear-gradient(0deg, rgba(0,40,80,0.12), transparent);
}

.tower-floor--rocket .tower-floor__face {
  background: hsl(
    210,
    55%,
    calc(75% + var(--floor-depth) * 15%)
  );
  color: #1a3d6b;
}

.tower-floor--rocket.tower-floor--waiting .tower-floor__face {
  background: #b3d9ff;
  opacity: 0.5;
}

.tower-floor--rocket.tower-floor--milestone .tower-floor__face {
  background: linear-gradient(135deg, #ffb3b3 0%, #ff9999 100%);
  color: #6b1a1a;
  box-shadow:
    inset 0 1px 0 rgba(255,200,200,0.5),
    inset 0 -1px 0 rgba(150,0,0,0.15),
    0 0 10px rgba(255, 150, 150, 0.3);
}

/* =====================================================
   TREE theme — leafy/wood layers
   ===================================================== */
.tower-floor--tree {
  border-radius: 4px;
  box-shadow:
    inset 0 1px 0 rgba(200,255,180,0.4),
    inset 1px 0 0 rgba(200,255,180,0.2),
    inset 0 -1px 0 rgba(40,80,20,0.12),
    inset -1px 0 0 rgba(40,80,20,0.08);
}

.tower-floor--tree .tower-floor__top-edge {
  background: linear-gradient(180deg, rgba(200,255,180,0.4), transparent);
}
.tower-floor--tree .tower-floor__bottom-edge {
  background: linear-gradient(0deg, rgba(40,80,20,0.12), transparent);
}

.tower-floor--tree .tower-floor__face {
  background: hsl(
    95,
    45%,
    calc(65% + var(--floor-depth) * 20%)
  );
  color: #2d4a18;
}

.tower-floor--tree.tower-floor--waiting .tower-floor__face {
  background: #c8e6a0;
  opacity: 0.5;
}

.tower-floor--tree.tower-floor--milestone .tower-floor__face {
  background: linear-gradient(135deg, #ffd700 0%, #f0c040 100%);
  color: #5c4000;
  box-shadow:
    inset 0 1px 0 rgba(255,255,200,0.5),
    inset 0 -1px 0 rgba(180,160,0,0.15),
    0 0 10px rgba(255, 215, 0, 0.3);
}

/* =====================================================
   TOWER (default) — indigo/purple
   ===================================================== */
.tower-floor--tower {
  box-shadow:
    inset 0 1px 0 rgba(200,210,255,0.4),
    inset 1px 0 0 rgba(200,210,255,0.2),
    inset 0 -1px 0 rgba(40,40,100,0.12),
    inset -1px 0 0 rgba(40,40,100,0.08);
}

.tower-floor--tower .tower-floor__top-edge {
  background: linear-gradient(180deg, rgba(200,210,255,0.4), transparent);
}
.tower-floor--tower .tower-floor__bottom-edge {
  background: linear-gradient(0deg, rgba(40,40,100,0.12), transparent);
}

.tower-floor--tower .tower-floor__face {
  background: hsl(
    230,
    35%,
    calc(75% + var(--floor-depth) * 15%)
  );
  color: #2d3478;
}

.tower-floor--tower.tower-floor--waiting .tower-floor__face {
  background: #d1d9f7;
  opacity: 0.5;
}

.tower-floor--tower.tower-floor--milestone .tower-floor__face {
  background: linear-gradient(135deg, #ffd700 0%, #f0c040 100%);
  color: #5c4000;
  box-shadow:
    inset 0 1px 0 rgba(255,255,200,0.5),
    inset 0 -1px 0 rgba(180,160,0,0.15),
    0 0 10px rgba(255, 215, 0, 0.3);
}

/* =====================================================
   Animations
   ===================================================== */
@keyframes badge-glow {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50%      { transform: scale(1.2); opacity: 1; }
}

@keyframes scaffold-bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-2px); }
}

/* =====================================================
   Mobile
   ===================================================== */
@media (max-width: 480px) {
  .tower-floor {
    font-size: 12px;
    min-height: 34px;
  }
  .tower-floor__face {
    padding: 3px 8px;
    gap: 4px;
  }
  .tower-floor__emoji {
    font-size: 14px;
    min-width: 16px;
  }
  .tower-floor__expression {
    font-size: 11px;
  }
  .tower-floor__top-edge {
    height: 3px;
  }
  .tower-floor__bottom-edge {
    height: 2px;
  }
}
</style>
