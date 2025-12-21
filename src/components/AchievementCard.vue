<template>
  <div
    class="achievement-card"
    :class="{
      'unlocked': achievement.unlocked,
      'hidden': achievement.category === 'hidden' && !achievement.unlocked
    }"
    @click="handleClick"
  >
    <div class="achievement-header">
      <div class="achievement-icon">{{ achievement.unlocked ? achievement.icon : '🔒' }}</div>
      <div class="achievement-category">
        {{ getCategoryName(achievement.category) }}
      </div>
    </div>

    <div class="achievement-content">
      <h3 class="achievement-title">{{ achievement.name }}</h3>
      <p class="achievement-description">
        {{ achievement.description }}
      </p>

      <div class="achievement-progress" v-if="!achievement.unlocked && achievement.progress !== undefined">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: achievement.progress + '%' }"
          ></div>
        </div>
        <div class="progress-text">
          {{ achievement.progress }}% / {{ getProgressText() }}
        </div>
      </div>

      <div class="achievement-reward" v-if="achievement.unlocked">
        <span class="reward-label">Награда:</span>
        <span class="reward-value">+{{ achievement.reward }} ⭐</span>
      </div>

      <div class="achievement-date" v-if="achievement.unlocked && achievement.unlockedAt">
        Получено: {{ formatDate(achievement.unlockedAt) }}
      </div>
    </div>

    <div class="achievement-glow" v-if="achievement.unlocked"></div>
  </div>
</template>

<script setup lang="ts">
import type { Achievement } from '@/types/achievements'
import { ACHIEVEMENT_CATEGORIES } from '@/data/achievements'

interface Props {
  achievement: Achievement
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true
})

const emit = defineEmits<{
  click: [achievement: Achievement]
}>()

const getCategoryName = (category: string): string => {
  const cat = ACHIEVEMENT_CATEGORIES.find(c => c.id === category)
  return cat ? cat.name : category
}

const getProgressText = (): string => {
  switch (props.achievement.condition.type) {
    case 'total_points':
      return `${props.achievement.condition.target} очков`
    case 'exercise_points':
      return `${props.achievement.condition.target} очков`
    case 'correct_streak':
      return `${props.achievement.condition.target} подряд`
    case 'time_challenge':
      return `${props.achievement.condition.target} примеров`
    case 'diverse_points':
      return `${props.achievement.condition.target} в каждом`
    case 'try_all_exercises':
      return 'Все типы'
    case 'all_exercises_complete':
      return 'Все упражнения'
    default:
      return `${props.achievement.condition.target}`
  }
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const handleClick = (): void => {
  if (props.clickable) {
    emit('click', props.achievement)
  }
}
</script>

<style scoped>
.achievement-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  padding: 20px;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.achievement-card:hover {
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.12),
    0 6px 12px rgba(0, 0, 0, 0.08);
}

.achievement-card.unlocked {
  background: linear-gradient(145deg, #f0fdf4 0%, #dcfce7 50%, #ffffff 100%);
  border: 2px solid #22c55e;
}

.achievement-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #e2e8f0, #cbd5e1);
  border-radius: 20px 20px 0 0;
}

.achievement-card.unlocked::before {
  background: linear-gradient(90deg, #4ade80, #22c55e, #16a34a);
  height: 4px;
}

.achievement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  position: relative;
  z-index: 2;
}

.achievement-icon {
  font-size: 36px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.achievement-category {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border: 1px solid rgba(100, 116, 139, 0.1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  white-space: nowrap;
}

.achievement-card.unlocked .achievement-category {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #166534;
  border-color: rgba(34, 197, 94, 0.2);
}

.achievement-content {
  text-align: left;
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.achievement-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.3;
  letter-spacing: -0.3px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.achievement-card.unlocked .achievement-title {
  color: #166534;
}

.achievement-description {
  font-size: 12px;
  color: #475569;
  margin: 0 0 12px 0;
  line-height: 1.4;
  font-weight: 400;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.achievement-progress {
  margin: 12px 0;
  padding: 10px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #e2e8f0, #cbd5e1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd);
  transition: width 0.6s ease;
  position: relative;
  border-radius: 4px;
}

.progress-text {
  font-size: 10px;
  color: #64748b;
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.achievement-reward {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: auto 0 8px 0;
  padding: 6px 10px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 10px;
  border: 1px solid #f59e0b;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.15);
}

.reward-label {
  font-size: 10px;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.reward-value {
  font-size: 12px;
  font-weight: 800;
  color: #b45309;
}

.achievement-date {
  font-size: 10px;
  color: #64748b;
  text-align: center;
  margin-top: auto;
  font-weight: 500;
  padding: 4px 8px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.achievement-card.unlocked .achievement-date {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #15803d;
  border-color: rgba(34, 197, 94, 0.2);
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .achievement-card {
    padding: 15px;
    border-radius: 16px;
  }

  .achievement-icon {
    font-size: 30px;
  }

  .achievement-title {
    font-size: 14px;
    margin-bottom: 6px;
  }

  .achievement-description {
    font-size: 11px;
    margin-bottom: 10px;
    -webkit-line-clamp: 2;
  }

  .achievement-header {
    margin-bottom: 10px;
  }

  .achievement-category {
    font-size: 9px;
    padding: 3px 8px;
  }

  .achievement-progress {
    padding: 8px;
    margin: 10px 0;
  }

  .progress-bar {
    height: 5px;
  }

  .achievement-reward {
    padding: 5px 8px;
    margin-bottom: 6px;
  }

  .reward-label {
    font-size: 9px;
  }

  .reward-value {
    font-size: 11px;
  }

  .achievement-date {
    font-size: 9px;
    padding: 3px 6px;
  }
}
</style>