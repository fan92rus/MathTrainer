import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CountingView from '../views/CountingView.vue'
import DecompositionView from '../views/DecompositionView.vue'
import FirstGradeDecompositionView from '../views/FirstGradeDecompositionView.vue'
import MultiplicationView from '../views/MultiplicationView.vue'
import { useSettingsStore } from '../store/settings'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/counting',
    name: 'counting',
    component: CountingView
  },
  {
    path: '/decomposition',
    name: 'decomposition',
    component: DecompositionView
  },
  {
    path: '/first-grade-decomposition',
    name: 'first-grade-decomposition',
    component: FirstGradeDecompositionView
  },
  {
    path: '/multiplication',
    name: 'multiplication',
    component: MultiplicationView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Навигационные guard'ы для проверки доступа
router.beforeEach((to, from, next) => {
  // Доступ разрешен для всех пользователей
  next()
})

export default router