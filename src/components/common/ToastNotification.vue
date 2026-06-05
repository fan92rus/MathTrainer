<template>
  <Transition name="toast">
    <div v-if="visible" class="toast-notification" :class="type">
      <div class="toast-icon">{{ icon }}</div>
      <div class="toast-content">
        <div class="toast-title">{{ title }}</div>
        <div v-if="subtitle" class="toast-subtitle">{{ subtitle }}</div>
      </div>
      <button class="toast-close" @click="dismiss">✕</button>
      <div class="toast-progress">
        <div class="toast-progress-bar" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
/**
 * ToastNotification — уведомление для ачивок и стриков
 *
 * Появляется сверху экрана, автоматически исчезает через 4 сек.
 * Очередь — показывает одно уведомление за раз.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  /** Показать ли тост */
  modelValue: boolean
  /** Тип: achievement, streak, info */
  type?: 'achievement' | 'streak' | 'info'
  /** Заголовок */
  title: string
  /** Подзаголовок */
  subtitle?: string
  /** Иконка (emoji) */
  icon?: string
  /** Длительность в мс */
  duration?: number
}>(), {
  type: 'achievement',
  icon: '🏆',
  duration: 4000,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const progressPercent = ref(100)
let timer: ReturnType<typeof setTimeout> | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null

function startTimer() {
  progressPercent.value = 100
  const step = 50 // ms
  const decrement = (step / props.duration) * 100

  progressTimer = setInterval(() => {
    progressPercent.value = Math.max(0, progressPercent.value - decrement)
  }, step)

  timer = setTimeout(() => {
    dismiss()
  }, props.duration)
}

function clearTimers() {
  if (timer) clearTimeout(timer)
  if (progressTimer) clearInterval(progressTimer)
  timer = null
  progressTimer = null
}

function dismiss() {
  clearTimers()
  visible.value = false
}

onMounted(() => {
  if (visible.value) startTimer()
})

onUnmounted(() => {
  clearTimers()
})

// Перезапуск таймера при новом показе
import { watch } from 'vue'
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    clearTimers()
    startTimer()
  }
})
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-width: 380px;
  width: 90vw;
  overflow: hidden;
  position: relative;
}

.toast-notification.achievement {
  border-left: 4px solid #ffd700;
}

.toast-notification.streak {
  border-left: 4px solid #ff6b35;
}

.toast-notification.info {
  border-left: 4px solid #667eea;
}

.toast-icon {
  font-size: 28px;
  flex-shrink: 0;
  animation: toast-icon-pop 0.4s ease-out;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: clamp(14px, 3vw, 16px);
  font-weight: 700;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-subtitle {
  font-size: clamp(12px, 2.5vw, 14px);
  color: #666;
  margin-top: 2px;
}

.toast-close {
  background: none;
  border: none;
  font-size: 16px;
  color: #aaa;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #666;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
}

.toast-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 50ms linear;
}

/* Transitions */
.toast-enter-active {
  animation: toast-in 0.4s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.9);
  }
}

@keyframes toast-icon-pop {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@media (max-width: 480px) {
  .toast-notification {
    top: 8px;
    padding: 10px 12px;
    gap: 8px;
    border-radius: 12px;
  }

  .toast-icon {
    font-size: 24px;
  }
}
</style>
