<template>
  <div>
    <!-- Модальное окно для новых ачивок -->
    <AchievementUnlockModal
      v-if="currentAchievement"
      :show="showModal"
      :achievement="currentAchievement"
      @close="handleModalClose"
    />

    <!-- Индикатор новых ачивок (можно разместить в главном меню) -->
    <div v-if="hasNewAchievements" class="achievements-indicator">
      <button class="achievements-button" @click="handleViewAllAchievements">
        <span class="achievements-icon">🏆</span>
        <span class="achievements-badge">{{ totalNewAchievements }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAchievementsStore } from '@/store/achievements'
import { useAchievements } from '@/composables/useAchievements'
import AchievementUnlockModal from './AchievementUnlockModal.vue'
import type { Achievement } from '@/types/achievements'

const achievementsStore = useAchievementsStore()
const { newlyUnlockedAchievements, hasNewAchievements, markAllAsViewed } = useAchievements()

const router = useRouter()
const showModal = ref(false)
const currentAchievement = ref<Achievement | null>(null)
const queue = ref<Achievement[]>([])

// Вычисляем общее количество новых ачивок
const totalNewAchievements = computed(() => {
  const storeCount = achievementsStore.getNewAchievementsCount
  const queueCount = queue.value.length
  return storeCount + queueCount
})

// Инициализация при монтировании
onMounted(() => {
  achievementsStore.loadAchievements()

  // Если есть непросмотренные ачивки в хранилище, добавляем их в очередь
  const newAchievementIds = achievementsStore.newAchievements
  if (newAchievementIds.length > 0) {
    const newAchievements = newAchievementIds
      .map(id => achievementsStore.achievements.find(a => a.id === id))
      .filter(Boolean) as Achievement[]

    queue.value = [...queue.value, ...newAchievements]
  }

  // Начинаем показ ачивок из очереди
  processQueue()
})

// Следим за новыми ачивками
watch(newlyUnlockedAchievements, (newAchievements) => {
  if (newAchievements.length > 0) {
    queue.value = [...queue.value, ...newAchievements]
    processQueue()
  }
})

// Обработка очереди ачивок
const processQueue = () => {
  if (!showModal.value && queue.value.length > 0 && !currentAchievement.value) {
    showNextAchievement()
  }
}

// Показать следующую ачивку
const showNextAchievement = () => {
  if (queue.value.length > 0) {
    const achievement = queue.value.shift()
    if (achievement) {
      currentAchievement.value = achievement
      showModal.value = true
    }
  }
}

// Закрытие модального окна
const handleModalClose = () => {
  showModal.value = false
  currentAchievement.value = null

  // Показываем следующую ачивку через небольшую задержку
  setTimeout(() => {
    processQueue()
  }, 300)
}

// Перейти ко всем ачивкам
const handleViewAllAchievements = () => {
  markAllAsViewed()
  router.push('/achievements')
}
</script>

<style scoped>
.achievements-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.achievements-button {
  position: relative;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  animation: pulse-icon 2s infinite;
}

.achievements-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.achievements-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.achievements-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
  animation: bounce-in 0.5s ease;
}

@keyframes pulse-icon {
  0% {
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  }
  50% {
    box-shadow: 0 4px 25px rgba(76, 175, 80, 0.6);
  }
  100% {
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .achievements-indicator {
    top: 15px;
    right: 15px;
  }

  .achievements-button {
    width: 50px;
    height: 50px;
  }

  .achievements-icon {
    font-size: 24px;
  }

  .achievements-badge {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
}
</style>