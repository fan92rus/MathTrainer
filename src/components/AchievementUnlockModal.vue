<template>
  <Transition name="modal-appear" appear>
    <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <div class="modal-content">
          <div class="achievement-celebration">
            <div class="confetti-container">
              <div v-for="i in 20" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
            </div>

            <div class="achievement-icon animated">
              {{ achievement.icon }}
            </div>
          </div>

          <div class="achievement-info">
            <h2 class="achievement-title">Достижение получено!</h2>
            <h3 class="achievement-name">{{ achievement.name }}</h3>
            <p class="achievement-description">{{ achievement.description }}</p>

            <div class="achievement-reward">
              <span class="reward-text">Награда:</span>
              <span class="reward-value">+{{ achievement.reward }} ⭐</span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" @click="handleClose">
              Понял
            </button>
            <button class="btn-primary" @click="handleViewAll">
              Все достижения
            </button>
          </div>

          <div class="progress-indicator">
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Achievement } from '@/types/achievements'

interface Props {
  show: boolean
  achievement: Achievement
  autoClose?: boolean
  autoCloseDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoClose: true,
  autoCloseDelay: 5000
})

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
let autoCloseTimer: NodeJS.Timeout | null = null

onMounted(() => {
  if (props.show && props.autoClose) {
    autoCloseTimer = setTimeout(() => {
      handleClose()
    }, props.autoCloseDelay)
  }
})

onUnmounted(() => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
  }
})

const handleOverlayClick = (): void => {
  handleClose()
}

const handleClose = (): void => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
  }
  emit('close')
}

const handleViewAll = (): void => {
  handleClose()
  router.push('/achievements')
}

const getConfettiStyle = (index: number) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6ab04c', '#130f40']
  const color = colors[index % colors.length]
  const left = (index * 5) % 100
  const animationDelay = `${(index * 0.1) % 2}s`
  const duration = 2 + (index % 3)

  return {
    backgroundColor: color,
    left: `${left}%`,
    animationDelay,
    animationDuration: `${duration}s`
  }
}
</script>

<style scoped>
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
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  position: relative;
  max-width: 500px;
  width: 100%;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.achievement-celebration {
  position: relative;
  margin-bottom: 30px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  top: -10px;
  animation: confetti-fall linear infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(130px) rotate(360deg);
    opacity: 0;
  }
}

.achievement-icon {
  font-size: 80px;
  position: relative;
  z-index: 10;
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.2));
}

.achievement-icon.animated {
  animation: icon-bounce 0.6s ease-out;
}

@keyframes icon-bounce {
  0% {
    transform: scale(0) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
}

.achievement-info {
  margin-bottom: 30px;
}

.achievement-title {
  font-size: 28px;
  font-weight: 800;
  color: #4CAF50;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.achievement-name {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 15px 0;
}

.achievement-description {
  font-size: 16px;
  color: #666;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.achievement-reward {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #fff9c4, #ffeb3b);
  padding: 10px 20px;
  border-radius: 25px;
  border: 2px solid #f9a825;
}

.reward-text {
  font-size: 16px;
  font-weight: 600;
  color: #f57c00;
}

.reward-value {
  font-size: 18px;
  font-weight: 700;
  color: #f57c00;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.progress-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  width: 100%;
  animation: progress-countdown 5s linear forwards;
}

@keyframes progress-countdown {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Анимации появления */
.modal-appear-enter-active {
  transition: all 0.3s ease;
}

.modal-appear-leave-active {
  transition: all 0.2s ease;
}

.modal-appear-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.modal-appear-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Мобильная адаптация */
@media (max-width: 600px) {
  .modal-content {
    padding: 30px 20px;
  }

  .achievement-title {
    font-size: 24px;
  }

  .achievement-name {
    font-size: 20px;
  }

  .achievement-description {
    font-size: 14px;
  }

  .achievement-icon {
    font-size: 60px;
  }

  .modal-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 14px;
  }
}
</style>