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
    <span class="tower-floor__expression">{{ floor.expression }}</span>
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
  background: linear-gradient(180deg, #e8e0d6 0%, #d4c8b8 100%);
  color: #4a3728;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.tower-floor--completed {
  opacity: 1;
}

.tower-floor--waiting {
  border: 2px dashed rgba(102, 126, 234, 0.4);
  opacity: 0.5;
  animation: floor-waiting 1.5s ease-in-out infinite;
}

.tower-floor--milestone {
  background: linear-gradient(180deg, #ffd700 0%, #f0c040 100%);
  border: 2px solid #daa520;
  color: #5c4000;
  font-weight: 600;
}

/* Theme: Castle */
.tower-floor--castle {
  background: linear-gradient(180deg, #8b7355 0%, #6b5b3e 100%);
  color: #f5f0e1;
}

.tower-floor--castle.tower-floor--milestone {
  background: linear-gradient(180deg, #ffd700 0%, #f0c040 100%);
  color: #5c4000;
}

/* Theme: Rocket */
.tower-floor--rocket {
  background: linear-gradient(180deg, #4a90d9 0%, #2c5f9e 100%);
  color: #e0eeff;
  border-radius: 16px 16px 4px 4px;
}

.tower-floor--rocket.tower-floor--milestone {
  background: linear-gradient(180deg, #ff6b6b 0%, #e04040 100%);
  color: #fff;
}

/* Theme: Tree */
.tower-floor--tree {
  background: linear-gradient(180deg, #5b8c3e 0%, #3d6b28 100%);
  color: #e0f0d0;
  border-radius: 4px;
}

.tower-floor--tree.tower-floor--milestone {
  background: linear-gradient(180deg, #ffd700 0%, #f0c040 100%);
  color: #5c4000;
}

/* Theme: Tower (default) */
.tower-floor--tower {
  background: linear-gradient(180deg, #7986cb 0%, #5c6bc0 100%);
  color: #e8eaf6;
}

.tower-floor--tower.tower-floor--milestone {
  background: linear-gradient(180deg, #ffd700 0%, #f0c040 100%);
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
</style>
