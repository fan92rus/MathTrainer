<template>
  <div
    class="tower-floor"
    :class="{
      'tower-floor--completed': floor.state === 'completed',
      'tower-floor--waiting': floor.state === 'waiting',
      'tower-floor--milestone': floor.isMilestone,
      [`tower-floor--${theme}`]: true,
    }"
  >
    <span class="tower-floor__level">{{ floor.level }}</span>
    <span class="tower-floor__expression">{{ floor.expression }}={{ floor.answer }}</span>
    <span v-if="floor.isMilestone" class="tower-floor__badge">🌟</span>
  </div>
</template>

<script setup lang="ts">
import type { TowerFloor as TowerFloorType, TowerTheme } from '@/types/tower'

defineProps<{
  floor: TowerFloorType
  theme: TowerTheme
}>()
</script>

<style scoped>
.tower-floor {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  min-height: 36px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.tower-floor--completed {
  opacity: 1;
}

.tower-floor--waiting {
 border: 2px dashed var(--color-primary, #667eea);
  opacity: 0.5;
  background: var(--color-bg-light, #f8f9ff);
  color: var(--color-text-secondary, #666);
  animation: floor-waiting 1.5s ease-in-out infinite;
}

.tower-floor--milestone {
  background: linear-gradient(135deg, #ffd700 0%, #f0c040 100%);
  border: 2px solid #daa520;
  color: #5c4000;
  font-weight: 600;
}

/* Theme: Castle — warm sandstone, NOT dark */
.tower-floor--castle {
  background: linear-gradient(180deg, #f5e6d0 0%, #e8d5b8 100%);
  color: #5c4033;
  border-color: #d4c0a8;
}

.tower-floor--castle.tower-floor--milestone {
  background: linear-gradient(135deg, #ffd700 0%, #f0c040 100%);
  color: #5c4000;
}

/* Theme: Rocket — light blue, cheerful */
.tower-floor--rocket {
  background: linear-gradient(180deg, #b3d9ff 0%, #90c4f7 100%);
  color: #1a3d6b;
  border-radius: 16px 16px 4px 4px;
  border-color: #7cb8ee;
}

.tower-floor--rocket.tower-floor--milestone {
  background: linear-gradient(135deg, #ffb3b3 0%, #ff9999 100%);
  color: #6b1a1a;
}

/* Theme: Tree — soft green, leafy */
.tower-floor--tree {
  background: linear-gradient(180deg, #c8e6a0 0%, #a8d480 100%);
  color: #2d4a18;
  border-radius: 4px;
  border-color: #8cc060;
}

.tower-floor--tree.tower-floor--milestone {
  background: linear-gradient(135deg, #ffd700 0%, #f0c040 100%);
  color: #5c4000;
}

/* Theme: Tower (default) — soft indigo */
.tower-floor--tower {
  background: linear-gradient(180deg, #d1d9f7 0%, #bcc6ee 100%);
  color: #2d3478;
  border-color: #a5b0e0;
}

.tower-floor--tower.tower-floor--milestone {
  background: linear-gradient(135deg, #ffd700 0%, #f0c040 100%);
  color: #5c4000;
}

.tower-floor__level {
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  opacity: 0.7;
}

.tower-floor__expression {
  flex: 1;
  font-family: 'Nunito', sans-serif;
}

.tower-floor__badge {
  font-size: 16px;
}

@keyframes floor-waiting {
  0%, 100% { border-color: rgba(102, 126, 234, 0.3); transform: scaleY(0.97); }
  50%      { border-color: rgba(102, 126, 234, 0.7); transform: scaleY(1); }
}

/* Mobile responsive */
@media (max-width: 480px) {
  .tower-floor {
    padding: 4px 8px;
    font-size: 12px;
    min-height: 32px;
    gap: 4px;
  }
  .tower-floor__level {
    font-size: 10px;
    min-width: 16px;
  }
}
</style>
