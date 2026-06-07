<template>
  <nav class="mode-switcher">
    <button
      v-for="mode in modes"
      :key="mode.route"
      class="mode-switcher__btn"
      :class="{ 'mode-switcher__btn--active': mode.route === currentRoute }"
      @click="goTo(mode.route)"
    >
      {{ mode.icon }}
      <span class="mode-switcher__label">{{ mode.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const modes = [
  { icon: '🧮', label: 'Счёт', route: '/counting' },
  { icon: '🐸', label: 'Линия', route: '/counting/number-line' },
  { icon: '🌊', label: 'Волна', route: '/counting/wave' },
  { icon: '⚡', label: 'Вызов', route: '/counting/challenge' },
]

const currentRoute = computed(() => route.path)

function goTo(path: string) {
  if (path !== currentRoute.value) {
    router.push(path)
  }
}
</script>

<style scoped>
.mode-switcher {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 6px 8px;
  background: var(--color-bg-light, #f0f2ff);
  border-radius: 14px;
  margin: 4px 0 8px;
}

.mode-switcher__btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-muted, #777);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.mode-switcher__btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: var(--color-text, #333);
}

.mode-switcher__btn--active {
  background: var(--color-primary, #667eea);
  color: #fff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.mode-switcher__btn--active:hover {
  background: var(--color-primary, #667eea);
  color: #fff;
}

.mode-switcher__label {
  font-size: 12px;
}

@media (max-width: 480px) {
  .mode-switcher {
    gap: 3px;
    padding: 4px 6px;
    border-radius: 10px;
  }

  .mode-switcher__btn {
    padding: 4px 8px;
    font-size: 12px;
    gap: 2px;
  }

  .mode-switcher__label {
    font-size: 11px;
  }
}
</style>
