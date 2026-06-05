<template>
  <div class="progress-path" :class="{ 'compact-mode': compact }">
    <!-- Заголовок -->
    <div class="path-header">
      <span class="path-title">🗺️ {{ compact ? 'Мой прогресс' : 'Путь обучения' }}</span>
      <span class="path-progress">{{ progress.earned }}/{{ progress.total }} ★</span>
    </div>

    <!-- Группы по четвертям -->
    <div class="path-groups">
      <div
        v-for="group in displayGroups"
        :key="group.title"
        class="path-group"
      >
        <div v-if="!compact" class="group-title">{{ group.title }}</div>
        <div class="group-nodes" :class="{ 'compact-nodes': compact }">
          <PathNode
            v-for="node in group.nodes"
            :key="node.id"
            :node="node"
            :is-current="currentNodeId === node.id"
            :compact="compact"
            @click="handleNodeClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ProgressPath — визуальный путь обучения
 *
 * Горизонтальный скролл с узлами по четвертям текущего класса
 * compact: показывает только текущую четверть, узлы компактнее
 */
import { computed } from 'vue'
import PathNode from './PathNode.vue'
import { useProgressPathStore } from '@/store/progressPath'
import { useSettingsStore } from '@/store/settings'
import { useRouter } from 'vue-router'
import type { PathNode as PathNodeType } from '@/types/motivation'

const props = withDefaults(defineProps<{
  compact?: boolean
}>(), {
  compact: false
})

const emit = defineEmits<{
  navigate: [exerciseType: string]
}>()

const progressPathStore = useProgressPathStore()
const settingsStore = useSettingsStore()
const router = useRouter()

const groups = computed(() => progressPathStore.currentGradeGroups)
const progress = computed(() => progressPathStore.currentGradeProgress)
const currentNodeId = computed(() => progressPathStore.currentNode?.id ?? null)

/** В компактном режиме показываем только текущую четверть */
const displayGroups = computed(() => {
  if (!props.compact) return groups.value
  const currentQ = settingsStore.currentQuarter
  return groups.value.filter(g => g.quarter === currentQ)
})

/** Маппинг exerciseType → route path */
const EXERCISE_ROUTES: Record<string, string> = {
  counting: '/counting',
  firstGradeDecomposition: '/first-grade-decomposition',
  decomposition: '/decomposition',
  multiplication: '/multiplication',
  equations: '/equations',
  columnSubtraction: '/column-subtraction',
  equationsWholePart: '/equations-whole-part',
}

function handleNodeClick(node: PathNodeType) {
  if (node.locked) return
  const route = EXERCISE_ROUTES[node.exerciseType]
  if (route) {
    emit('navigate', node.exerciseType)
    router.push(route)
  }
}
</script>

<style scoped>
.progress-path {
  width: 100%;
  padding: 12px 0;
}

.path-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 4px;
}

.path-title {
  font-size: clamp(14px, 3vw, 16px);
  font-weight: 600;
  color: var(--color-text, #333);
}

.path-progress {
  font-size: clamp(12px, 2.5vw, 14px);
  font-weight: 600;
  color: var(--color-text-secondary, #666);
}

.path-groups {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.path-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title {
  font-size: clamp(12px, 2.2vw, 13px);
  font-weight: 600;
  color: var(--color-text-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-left: 4px;
}

.group-nodes {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

/* Тонкий скроллбар */
.group-nodes::-webkit-scrollbar {
  height: 4px;
}

.group-nodes::-webkit-scrollbar-track {
  background: transparent;
}

.group-nodes::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

.group-nodes > * {
  scroll-snap-align: start;
}

@media (max-width: 480px) {
  .progress-path {
    padding: 8px 0;
  }

  .path-header {
    margin-bottom: 6px;
  }

  .path-groups {
    gap: 10px;
  }

  .group-nodes {
    gap: 8px;
  }
}

/* Compact mode */
.compact-mode .path-header {
  margin-bottom: 6px;
}

.compact-mode .path-title {
  font-size: 13px;
}

.compact-mode .path-progress {
  font-size: 12px;
}

.compact-mode .group-nodes {
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 2px;
}
</style>
