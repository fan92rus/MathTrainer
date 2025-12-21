<template>
  <div class="achievements-view">
    <BackButton />

    <div class="achievements-header">
      <h1 class="page-title">Достижения</h1>
      <div class="achievements-stats">
        <div class="stat-item">
          <span class="stat-value">{{ unlockedCount }}</span>
          <span class="stat-label">Получено</span>
        </div>
        <div class="stat-divider">/</div>
        <div class="stat-item">
          <span class="stat-value">{{ totalCount }}</span>
          <span class="stat-label">Всего</span>
        </div>
      </div>
    </div>

  
    <div class="achievements-container">
      <div v-if="allAchievements.length === 0" class="no-achievements">
        <p>Пока нет достижений</p>
      </div>

      <div v-else class="achievements-list">
        <AchievementCard
          v-for="achievement in allAchievements"
          :key="achievement.id"
          :achievement="achievement"
          @click="showAchievementDetails(achievement)"
        />
      </div>
    </div>

    <!-- Модальное окно детализации ачивки -->
    <div v-if="selectedAchievement" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedAchievement.name }}</h2>
          <button class="close-button" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <div class="achievement-icon-large">
            {{ selectedAchievement.unlocked ? selectedAchievement.icon : '🔒' }}
          </div>

          <div class="achievement-info">
            <p class="achievement-description-full">
              {{ selectedAchievement.description }}
            </p>

            <div class="achievement-condition">
              <h3>Условие:</h3>
              <p>{{ getConditionDescription(selectedAchievement) }}</p>
            </div>

            <div v-if="selectedAchievement.unlocked" class="achievement-unlocked">
              <p><strong>Получено:</strong> {{ formatDate(selectedAchievement.unlockedAt!) }}</p>
              <p><strong>Награда:</strong> +{{ selectedAchievement.reward }} ⭐</p>
            </div>

            <div v-else-if="selectedAchievement.progress !== undefined" class="achievement-progress-modal">
              <div class="progress-bar-large">
                <div
                  class="progress-fill"
                  :style="{ width: selectedAchievement.progress + '%' }"
                ></div>
              </div>
              <p>Прогресс: {{ selectedAchievement.progress }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAchievementsStore } from '@/store/achievements'
import type { Achievement } from '@/types/achievements'
import BackButton from '@/components/BackButton.vue'
import AchievementCard from '@/components/AchievementCard.vue'

const achievementsStore = useAchievementsStore()
const selectedAchievement = ref<Achievement | null>(null)

onMounted(() => {
  achievementsStore.loadAchievements()
})

const unlockedCount = computed(() => achievementsStore.unlockedCount)
const totalCount = computed(() => achievementsStore.totalCount)

const allAchievements = computed(() => {
  const achievements = achievementsStore.allAchievements
  // Фильтруем скрытые достижения, которые еще не разблокированы
  return achievements.filter(a => a.category !== 'hidden' || a.unlocked)
})

const showAchievementDetails = (achievement: Achievement): void => {
  selectedAchievement.value = achievement
}

const closeModal = (): void => {
  selectedAchievement.value = null
}

const getConditionDescription = (achievement: Achievement): string => {
  switch (achievement.condition.type) {
    case 'total_points':
      return `Набрать ${achievement.condition.target} общих очков`
    case 'exercise_points': {
      const exerciseNames: Record<string, string> = {
        counting: 'счете',
        decomposition: 'разложении чисел',
        firstGradeDecomposition: 'разложении чисел (1 класс)',
        multiplication: 'умножении',
        equations: 'уравнениях'
      }
      const exerciseName = exerciseNames[achievement.condition.exercise || ''] || 'упражнениях'
      return `Набрать ${achievement.condition.target} очков в ${exerciseName}`
    }
    case 'correct_streak':
      return `Решить ${achievement.condition.target} примеров подряд без ошибок`
    case 'time_challenge': {
      const timeMinutes = Math.floor((achievement.condition.timeLimit || 0) / 60)
      return `Решить ${achievement.condition.target} примеров за ${timeMinutes} минут(ы)`
    }
    case 'level_complete':
      return `Завершить уровень ${achievement.condition.class || ''}`
    case 'all_levels_complete':
      return `Освоить все уровни`
    case 'quarter_complete':
      return `Завершить все упражнения четверти`
    case 'diverse_points':
      return `Получить не менее ${achievement.condition.target} очков в каждом типе упражнений`
    case 'try_all_exercises':
      return `Попробовать все типы упражнений`
    case 'all_exercises_complete':
      return `Пройти все упражнения класса`
    case 'night_owl':
      return `Решить ${achievement.condition.target} примеров после 20:00`
    case 'early_bird':
      return `Решить ${achievement.condition.target} примеров до 9:00`
    case 'perfect_session':
      return `Решить ${achievement.condition.target} примеров с 100% правильностью`
    default:
      return 'Секретное условие'
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
</script>

<style scoped>
.achievements-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  padding-bottom: 40px;
}

.achievements-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 36px;
  font-weight: 800;
  color: white;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.achievements-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-divider {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.5);
}


.achievements-container {
  max-width: 1400px;
  margin: 0 auto;
  height: 70vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.achievements-container::-webkit-scrollbar {
  width: 6px;
}

.achievements-container::-webkit-scrollbar-track {
  background: transparent;
}

.achievements-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.achievements-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.no-achievements {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: white;
  font-size: 18px;
  grid-column: 1 / -1;
}

.achievements-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 0;
  align-items: start;
}

/* Мобильная адаптация - 2 карточки в строку */
@media (max-width: 768px) {
  .achievements-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

/* Планшет - 3 карточки в строку */
@media (min-width: 769px) and (max-width: 1024px) {
  .achievements-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Маленький ПК - 4 карточки в строку */
@media (min-width: 1025px) and (max-width: 1400px) {
  .achievements-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Большой ПК - 5 карточек в строку */
@media (min-width: 1401px) {
  .achievements-list {
    grid-template-columns: repeat(5, 1fr);
  }
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  text-align: center;
}

.achievement-icon-large {
  font-size: 80px;
  margin-bottom: 20px;
}

.achievement-info {
  text-align: left;
}

.achievement-description-full {
  font-size: 16px;
  color: #666;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.achievement-condition {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.achievement-condition h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.achievement-condition p {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.achievement-unlocked {
  background: #e8f5e9;
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #4CAF50;
}

.achievement-unlocked p {
  margin: 5px 0;
  font-size: 14px;
  color: #2e7d32;
}

.achievement-progress-modal {
  margin-top: 20px;
}

.progress-bar-large {
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
}

.achievement-progress-modal p {
  margin: 0;
  font-size: 14px;
  color: #666;
  text-align: center;
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .achievements-view {
    padding: 15px;
  }

  .page-title {
    font-size: 28px;
  }

  .achievements-stats {
    padding: 8px 16px;
  }

  .stat-value {
    font-size: 20px;
  }

  .categories-filter {
    gap: 8px;
  }

  .category-button {
    padding: 8px 12px;
    font-size: 13px;
  }

  .modal-content {
    padding: 20px;
  }

  .achievement-icon-large {
    font-size: 60px;
  }
}
</style>