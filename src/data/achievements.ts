import type { Achievement } from '@/types/achievements'

export const ACHIEVEMENTS_DATA: Achievement[] = [
  // Общие ачивки за количество очков
  {
    id: 'novice',
    name: 'Новичок',
    description: 'Набрать 100 общих очков',
    category: 'points',
    icon: '🌟',
    condition: {
      type: 'total_points',
      target: 100
    },
    reward: 50,
    unlocked: false,
    progress: 0
  },
  {
    id: 'experienced_mathematician',
    name: 'Опытный математик',
    description: 'Набрать 500 общих очков',
    category: 'points',
    icon: '⭐',
    condition: {
      type: 'total_points',
      target: 500
    },
    reward: 100,
    unlocked: false,
    progress: 0
  },
  {
    id: 'math_master',
    name: 'Мастер математики',
    description: 'Набрать 1000 общих очков',
    category: 'points',
    icon: '🏆',
    condition: {
      type: 'total_points',
      target: 1000
    },
    reward: 200,
    unlocked: false,
    progress: 0
  },
  {
    id: 'legend',
    name: 'Легенда',
    description: 'Набрать 5000 общих очков',
    category: 'points',
    icon: '👑',
    condition: {
      type: 'total_points',
      target: 5000
    },
    reward: 500,
    unlocked: false,
    progress: 0
  },

  // Ачивки за очки по типам упражнений
  {
    id: 'counting_lover',
    name: 'Любитель счета',
    description: '100 очков в счете',
    category: 'points',
    icon: '🔢',
    condition: {
      type: 'exercise_points',
      target: 100,
      exercise: 'counting'
    },
    reward: 30,
    unlocked: false,
    progress: 0
  },
  {
    id: 'counting_expert',
    name: 'Эксперт по счету',
    description: '500 очков в счете',
    category: 'points',
    icon: '🧮',
    condition: {
      type: 'exercise_points',
      target: 500,
      exercise: 'counting'
    },
    reward: 100,
    unlocked: false,
    progress: 0
  },
  {
    id: 'multiplication_magician',
    name: 'Маг умножения',
    description: '200 очков в умножении',
    category: 'points',
    icon: '✨',
    condition: {
      type: 'exercise_points',
      target: 200,
      exercise: 'multiplication'
    },
    reward: 80,
    unlocked: false,
    progress: 0
  },
  {
    id: 'equation_solver',
    name: 'Решатель уравнений',
    description: '300 очков в уравнениях',
    category: 'points',
    icon: '📐',
    condition: {
      type: 'exercise_points',
      target: 300,
      exercise: 'equations'
    },
    reward: 120,
    unlocked: false,
    progress: 0
  },

  // Ачивки за правильность и streak
  {
    id: 'first_steps',
    name: 'Первые шаги',
    description: 'Решить 10 примеров подряд без ошибок',
    category: 'streak',
    icon: '👶',
    condition: {
      type: 'correct_streak',
      target: 10
    },
    reward: 20,
    unlocked: false,
    progress: 0
  },
  {
    id: 'on_right_track',
    name: 'На правильном пути',
    description: '20 правильных ответов подряд',
    category: 'streak',
    icon: '🎯',
    condition: {
      type: 'correct_streak',
      target: 20
    },
    reward: 50,
    unlocked: false,
    progress: 0
  },
  {
    id: 'perfect_series',
    name: 'Идеальная серия',
    description: '50 правильных ответов подряд',
    category: 'streak',
    icon: '💯',
    condition: {
      type: 'correct_streak',
      target: 50
    },
    reward: 150,
    unlocked: false,
    progress: 0
  },
  {
    id: 'untiring',
    name: 'Неутомимый',
    description: '100 правильных ответов подряд',
    category: 'streak',
    icon: '🔥',
    condition: {
      type: 'correct_streak',
      target: 100
    },
    reward: 300,
    unlocked: false,
    progress: 0
  },

  // Ачивки за освоение уровней
  {
    id: 'multiplication_2',
    name: 'Таблица умножения 2',
    description: 'Освоить уровень 2 умножения',
    category: 'level',
    icon: '2️⃣',
    condition: {
      type: 'level_complete',
      target: 1,
      exercise: 'multiplication',
      class: 2
    },
    reward: 40,
    unlocked: false,
    progress: 0
  },
  {
    id: 'multiplication_5',
    name: 'Таблица умножения 5',
    description: 'Освоить уровень 5 умножения',
    category: 'level',
    icon: '5️⃣',
    condition: {
      type: 'level_complete',
      target: 1,
      exercise: 'multiplication',
      class: 5
    },
    reward: 100,
    unlocked: false,
    progress: 0
  },
  {
    id: 'table_master',
    name: 'Мастер таблицы',
    description: 'Освоить все уровни умножения',
    category: 'level',
    icon: '📊',
    condition: {
      type: 'all_levels_complete',
      target: 10,
      exercise: 'multiplication'
    },
    reward: 250,
    unlocked: false,
    progress: 0
  },
  {
    id: 'first_quarter',
    name: 'Первая четверть',
    description: 'Завершить все упражнения для 1 четверти выбранного класса',
    category: 'level',
    icon: '📅',
    condition: {
      type: 'quarter_complete',
      target: 1
    },
    reward: 150,
    unlocked: false,
    progress: 0
  },

  // Ачивки за время
  {
    id: 'speed_counting',
    name: 'Скоростной счет',
    description: 'Решить 20 примеров на сложение за 2 минуты',
    category: 'time',
    icon: '⚡',
    condition: {
      type: 'time_challenge',
      target: 20,
      exercise: 'counting',
      timeLimit: 120
    },
    reward: 80,
    unlocked: false,
    progress: 0
  },
  {
    id: 'fast_multiplier',
    name: 'Быстрый умножитель',
    description: 'Решить 10 примеров на умножение за 1 минуту',
    category: 'time',
    icon: '🚀',
    condition: {
      type: 'time_challenge',
      target: 10,
      exercise: 'multiplication',
      timeLimit: 60
    },
    reward: 100,
    unlocked: false,
    progress: 0
  },
  {
    id: 'express_equations',
    name: 'Экспресс-уравнения',
    description: 'Решить 5 уравнений за 3 минуты',
    category: 'time',
    icon: '⏱️',
    condition: {
      type: 'time_challenge',
      target: 5,
      exercise: 'equations',
      timeLimit: 180
    },
    reward: 120,
    unlocked: false,
    progress: 0
  },

  // Ачивки за разнообразие
  {
    id: 'universal_mathematician',
    name: 'Универсальный математик',
    description: 'Получить хотя бы по 50 очков в каждом типе упражнений',
    category: 'diversity',
    icon: '🌈',
    condition: {
      type: 'diverse_points',
      target: 50
    },
    reward: 200,
    unlocked: false,
    progress: 0
  },
  {
    id: 'all_in_order',
    name: 'Все по порядку',
    description: 'Пройти все упражнения в выбранном классе',
    category: 'diversity',
    icon: '✅',
    condition: {
      type: 'all_exercises_complete',
      target: 1
    },
    reward: 300,
    unlocked: false,
    progress: 0
  },
  {
    id: 'explorer',
    name: 'Исследователь',
    description: 'Попробовать все типы упражнений хотя бы раз',
    category: 'diversity',
    icon: '🔍',
    condition: {
      type: 'try_all_exercises',
      target: 1
    },
    reward: 50,
    unlocked: false,
    progress: 0
  },

  // Скрытые ачивки
  {
    id: 'night_mathematician',
    name: 'Ночной математик',
    description: 'Решить 50 примеров после 20:00',
    category: 'hidden',
    icon: '🌙',
    condition: {
      type: 'night_owl',
      target: 50
    },
    reward: 100,
    unlocked: false,
    progress: 0
  },
  {
    id: 'morning_brain',
    name: 'Утренняя зарядка для ума',
    description: 'Начать день с 20 правильных ответов',
    category: 'hidden',
    icon: '☀️',
    condition: {
      type: 'early_bird',
      target: 20
    },
    reward: 60,
    unlocked: false,
    progress: 0
  },
  {
    id: 'perfectionist',
    name: 'Перфекционист',
    description: 'Решить 100 примеров с 100% правильностью',
    category: 'hidden',
    icon: '💎',
    condition: {
      type: 'perfect_session',
      target: 100
    },
    reward: 250,
    unlocked: false,
    progress: 0
  }
]

// Категории для фильтрации
export const ACHIEVEMENT_CATEGORIES = [
  { id: 'all', name: 'Все', icon: '🎯' },
  { id: 'points', name: 'Очки', icon: '⭐' },
  { id: 'streak', name: 'Серии', icon: '🔥' },
  { id: 'level', name: 'Уровни', icon: '📈' },
  { id: 'time', name: 'Время', icon: '⏱️' },
  { id: 'diversity', name: 'Разнообразие', icon: '🌈' },
  { id: 'hidden', name: 'Секретные', icon: '🔒' }
] as const