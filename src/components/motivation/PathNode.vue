<template>
  <div
    class="path-node"
    :class="{
      'is-locked': node.locked,
      'is-completed': node.starCount === 3 && !node.locked,
      'is-current': isCurrent && !node.locked,
      'has-progress': node.starCount > 0 && node.starCount < 3 && !node.locked,
    }"
    @click="!node.locked && $emit('click', node)"
  >
    <!-- Иконка -->
    <div class="node-icon-wrap">
      <span v-if="node.locked" class="node-lock">🔒</span>
      <span v-else-if="node.starCount === 3" class="node-check">✅</span>
      <span v-else class="node-icon">{{ node.icon }}</span>
    </div>

    <!-- Информация -->
    <div class="node-info">
      <div class="node-title">{{ node.title }}</div>
      <div v-if="!node.locked" class="node-stars">
        <span
          v-for="i in 3"
          :key="i"
          class="star"
          :class="{ filled: i <= node.starCount }"
        >★</span>
      </div>
    </div>

    <!-- Пульсация для текущего узла -->
    <div v-if="isCurrent && !node.locked" class="node-pulse"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * PathNode — узел на прогресс-пути
 */
import type { PathNode } from '@/types/motivation'

defineProps<{
  node: PathNode
  isCurrent?: boolean
}>()

defineEmits<{
  click: [node: PathNode]
}>()
</script>

<style scoped>
.path-node {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  min-width: 160px;
  flex-shrink: 0;
}

.path-node:hover:not(.is-locked) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.path-node.is-locked {
  opacity: 0.5;
  cursor: default;
  background: #f8f9fa;
}

.path-node.is-completed {
  border-color: #4caf50;
  background: linear-gradient(135deg, #f1f8e9, #e8f5e9);
}

.path-node.is-current {
  border-color: #667eea;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.2);
}

.path-node.has-progress {
  border-color: #ffb74d;
}

/* Icon */
.node-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: rgba(102, 126, 234, 0.08);
  flex-shrink: 0;
}

.is-completed .node-icon-wrap {
  background: rgba(76, 175, 80, 0.1);
}

.node-lock, .node-check {
  font-size: 18px;
}

.node-icon {
  line-height: 1;
}

/* Info */
.node-info {
  min-width: 0;
}

.node-title {
  font-size: clamp(12px, 2.5vw, 14px);
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.is-locked .node-title {
  color: #999;
}

.node-stars {
  display: flex;
  gap: 2px;
  margin-top: 2px;
}

.star {
  font-size: 14px;
  color: #ddd;
  line-height: 1;
}

.star.filled {
  color: #ffc107;
}

/* Pulse for current node */
.node-pulse {
  position: absolute;
  inset: -3px;
  border-radius: 16px;
  border: 2px solid rgba(102, 126, 234, 0.4);
  animation: pulse-border 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse-border {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.02); }
}

@media (max-width: 480px) {
  .path-node {
    padding: 8px 10px;
    gap: 8px;
    min-width: 140px;
    border-radius: 10px;
  }

  .node-icon-wrap {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }

  .node-title {
    font-size: 12px;
  }

  .star {
    font-size: 12px;
  }
}
</style>
