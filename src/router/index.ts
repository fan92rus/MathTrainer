import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import CountingView from '@/views/CountingView.vue';
import DecompositionView from '@/views/DecompositionView.vue';
import FirstGradeDecompositionView from '@/views/FirstGradeDecompositionView.vue';
import MultiplicationView from '@/views/MultiplicationView.vue';
import EquationsView from '@/views/EquationsView.vue';
import ManualEquationsView from '@/views/ManualEquationsView.vue';
import ManualDecompositionView from '@/views/ManualDecompositionView.vue';
import AchievementsView from '@/views/AchievementsView.vue';
import { useSettingsStore } from '@/store/settings';
import { getAvailableExercises } from '@/utils/gradeHelpers';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/counting',
    name: 'counting',
    component: CountingView,
    meta: { exerciseType: 'counting' }
  },
  {
    path: '/decomposition',
    name: 'decomposition',
    component: DecompositionView,
    meta: { exerciseType: 'decomposition' }
  },
  {
    path: '/first-grade-decomposition',
    name: 'first-grade-decomposition',
    component: FirstGradeDecompositionView,
    meta: { exerciseType: 'firstGradeDecomposition' }
  },
  {
    path: '/multiplication',
    name: 'multiplication',
    component: MultiplicationView,
    meta: { exerciseType: 'multiplication' }
  },
  {
    path: '/equations',
    name: 'equations',
    component: EquationsView,
    meta: { exerciseType: 'equations' }
  },
  {
    path: '/manual-equations',
    name: 'manual-equations',
    component: ManualEquationsView
  },
  {
    path: '/manual-decomposition',
    name: 'manual-decomposition',
    component: ManualDecompositionView
  },
  {
    path: '/achievements',
    name: 'achievements',
    component: AchievementsView
  }
];

const router = createRouter({
  history: createWebHistory('/MathTrainer/'),
  routes
});

// Расширяем метаданные для типов
declare module 'vue-router' {
  interface RouteMeta {
    exerciseType?: keyof ReturnType<typeof getAvailableExercises>;
  }
}

// Навигационные guard'ы для проверки доступа
router.beforeEach((to, from, next) => {
  // Проверяем, есть ли у маршрута мета-информация о типе упражнения
  if (to.meta.exerciseType) {
    const settingsStore = useSettingsStore();

    // Если класс не выбран, разрешаем доступ (будет показан выбор класса)
    if (!settingsStore.isGradeSelected) {
      next();
      return;
    }

    // Получаем доступные упражнения для текущего класса и четверти
    if (!settingsStore.selectedGrade) {
      next();
      return;
    }

    const availableExercises = getAvailableExercises(
      settingsStore.selectedGrade,
      settingsStore.currentQuarter
    );

    // Проверяем, доступно ли упражнение для текущего класса и четверти
    if (
      availableExercises[to.meta.exerciseType] &&
      availableExercises[to.meta.exerciseType].available
    ) {
      next(); // Упражнение доступно, разрешаем переход
    } else {
      // Упражнение недоступно, перенаправляем на главную страницу
      alert('Это упражнение пока недоступно для вашего класса или четверти');
      next('/');
    }
  } else {
    // Для маршрутов без мета-информации (например, главная страница) разрешаем доступ
    next();
  }
});

export default router;
