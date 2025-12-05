import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CountingView from '../views/CountingView.vue'
import DecompositionView from '../views/DecompositionView.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router