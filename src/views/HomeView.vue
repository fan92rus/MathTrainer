<template>
  <div class="app-container">
    <AchievementManager />
    <div class="game-container">
      <div class="main-container">
        <!-- Hero секция: приветствие + мотивация -->
        <div v-if="isGradeSelected" class="hero-section">
          <div class="hero-top">
            <div class="grade-badge" @click="changeGrade">
              <span class="grade-badge-number">{{ gradeNumber }}</span>
              <span class="grade-badge-label">класс</span>
            </div>
            <MotivationBar
              @achievementsClick="goToAchievements"
            />
            <div class="hero-actions">
              <button class="icon-btn achievements-btn" @click="goToAchievements" title="Достижения">
                <span>🏆</span>
                <span v-if="hasNewAchievements" class="badge-dot">{{ newAchievementsCount }}</span>
              </button>
              <button class="icon-btn daily-btn" @click="goToDailyTasks" title="Ежедневные задания">
                <span>📅</span>
                <span v-if="hasUncompletedTasks" class="badge-dot">{{ uncompletedTasksCount }}</span>
              </button>
            </div>
          </div>
          <!-- Компактный прогресс-путь -->
          <ProgressPath compact class="home-progress-path" />
        </div>
        <div class="games-container">
          <div
            v-if="availableExercises.firstGradeDecomposition.available"
            class="game-card game-card--first-grade-decomposition"
          >
            <div class="game-content">
              <div class="game-icon">🔢</div>
              <div class="game-info">
                <div class="game-title">{{ availableExercises.firstGradeDecomposition.title }}</div>
                <div class="game-description">
                  {{ availableExercises.firstGradeDecomposition.description }}
                </div>
                <div class="game-score">⭐ {{ firstGradeDecompositionScore }}</div>
              </div>
            </div>
          </div>
          <div
            v-if="availableExercises.decomposition.available"
            class="game-card game-card--decomposition"
            @click="goToDecomposition"
          >
            <div class="game-content">
              <div class="game-icon">➕</div>
              <div class="game-info">
                <div class="game-title">{{ availableExercises.decomposition.title }}</div>
                <div class="game-description">
                  {{ availableExercises.decomposition.description }}
                </div>
                <div class="game-score">⭐ {{ decompositionScore }}</div>
              </div>
            </div>
          </div>
          <div v-if="availableExercises.counting.available" class="game-card game-card--counting" @click="goToCounting">
            <div class="game-content">
              <div class="game-icon">🔢</div>
              <div class="game-info">
                <div class="game-title">{{ availableExercises.counting.title }}</div>
                <div class="game-description">{{ availableExercises.counting.description }}</div>
                <div class="game-score">⭐ {{ countingScore }}</div>
              </div>
            </div>
          </div>
          <div
            v-if="availableExercises.multiplication.available"
            class="game-card game-card--multiplication"
            @click="goToMultiplication"
          >
            <div class="game-content">
              <div class="game-icon">✖️</div>
              <div class="game-info">
                <div class="game-title">{{ availableExercises.multiplication.title }}</div>
                <div class="game-description">
                  {{ availableExercises.multiplication.description }}
                </div>
                <div class="game-score">⭐ {{ multiplicationScore }}</div>
              </div>
            </div>
          </div>
          <div
            v-if="availableExercises.equations.available"
            class="game-card"
            @click="goToEquations"
          >
            <div class="game-content">
              <div class="game-icon">🧮</div>
              <div class="game-info">
                <div class="game-title">{{ availableExercises.equations.title }}</div>
                <div class="game-description">{{ availableExercises.equations.description }}</div>
                <div class="game-score">⭐ {{ equationsScore }}</div>
              </div>
            </div>
          </div>
          <div
            v-if="availableExercises.columnSubtraction.available"
            class="game-card game-card--column"
            @click="goToColumnSubtraction"
          >
            <div class="game-content">
              <div class="game-icon">📦</div>
              <div class="game-info">
                <div class="game-title">{{ availableExercises.columnSubtraction.title }}</div>
                <div class="game-description">{{ availableExercises.columnSubtraction.description }}</div>
                <div class="game-score">⭐ {{ columnSubtractionScore }}</div>
              </div>
            </div>
          </div>
          <div
            v-if="availableExercises.equationsWholePart.available"
            class="game-card game-card--equations"
            @click="goToEquationsWholePart"
          >
            <div class="game-content">
              <div class="game-icon">🔢</div>
              <div class="game-info">
                <div class="game-title">{{ availableExercises.equationsWholePart.title }}</div>
                <div class="game-description">{{ availableExercises.equationsWholePart.description }}</div>
                <div class="game-score">⭐ {{ equationsWholePartScore }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { computed, onMounted, onActivated, watch, nextTick } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useScoresStore } from '../store/scores';
  import { useSettingsStore } from '../store/settings';
  import { useAchievementsStore } from '../store/achievements';
  import {
    getGradeName,
    getQuarterName,
    getCurrentQuarter,
    getAvailableExercises
  } from '../utils/gradeHelpers';
  import AchievementManager from '../components/AchievementManager.vue';
  import { useAchievements } from '../composables/useAchievements';
  import { usePlayerStore } from '../store/player';
  import { useDailyTasks } from '@/composables/useDailyTasks';
  import MotivationBar from '@/components/motivation/MotivationBar.vue';
  import ProgressPath from '@/components/motivation/ProgressPath.vue';

  export default {
    name: 'HomeView',
    components: {
      AchievementManager,
      MotivationBar,
      ProgressPath
    },
    setup() {
      const router = useRouter();
      const route = useRoute();
      const scoresStore = useScoresStore();
      const settingsStore = useSettingsStore();
      const achievementsStore = useAchievementsStore();
      const playerStore = usePlayerStore();
      const { checkAchievements } = useAchievements();
      const { ensureTasks, dailyTasks } = useDailyTasks();

      // Загружаем очки, настройки и ачивки при монтировании компонента
      scoresStore.loadScores();
      settingsStore.loadSettings();
      achievementsStore.loadAchievements();

      // Генерируем ежедневные задания при необходимости
      ensureTasks();

      // Проверяем только неразблокированные достижения на основе текущих очков
      // Это нужно для случаев, когда очки были получены до добавления системы достижений
      const unlockedAchievements = achievementsStore.achievements.filter(a => a.unlocked)
      if (unlockedAchievements.length === 0 && scoresStore.getTotalScore > 0) {
        // Сначала проверяем общие очки
        achievementsStore.checkTotalPointsAchievements(() => scoresStore.getTotalScore, [])

        // Затем проверяем достижения для каждого типа упражнения
        const exerciseTypes = ['counting', 'decomposition', 'firstGradeDecomposition', 'multiplication', 'equations']
        exerciseTypes.forEach(type => {
          checkAchievements(scoresStore, {
            type,
            correct: true
          })
        })
        
        // Сохраняем достижения после проверки
        achievementsStore.saveAchievements()
      }

      // Функция для обеспечения snap эффекта при скролле
      const setupScrollSnap = () => {
        const container = document.querySelector('.games-container');
        if (!container) return;

        let isScrolling = false;

        container.addEventListener('scroll', () => {
          if (!isScrolling) {
            window.requestAnimationFrame(() => {
              const scrollTop = container.scrollTop;
              const cardElement = container.querySelector('.game-card') as HTMLElement | null;
              const cardHeight = (cardElement?.offsetHeight ?? 0) + 20; // +gap
              const cardElements = container.querySelectorAll('.game-card');

              if (cardHeight > 0 && cardElements.length > 0) {
                // Находим ближайшую карточку
                let closestCard = 0;
                let minDistance = Infinity;

                cardElements.forEach((_card, index) => {
                  const cardTop = index * cardHeight;
                  const distance = Math.abs(scrollTop - cardTop);
                  if (distance < minDistance) {
                    minDistance = distance;
                    closestCard = index;
                  }
                });

                // Применяем snap только если скролл остановился
                if ((window as any).scrollTimeout) {
                  clearTimeout((window as any).scrollTimeout);
                }
                (window as any).scrollTimeout = setTimeout(() => {
                  container.scrollTo({
                    top: closestCard * cardHeight,
                    behavior: 'smooth'
                  });
                }, 100);
              }

              isScrolling = false;
            });
            isScrolling = true;
          }
        });
      };

      // Вычисляемые свойства
      const countingScore = computed(() => scoresStore.countingScore);
      const decompositionScore = computed(() => scoresStore.decompositionScore);
      const firstGradeDecompositionScore = computed(() => scoresStore.firstGradeDecompositionScore);
      const multiplicationScore = computed(() => scoresStore.multiplicationScore);
      const equationsScore = computed(() => scoresStore.equationsScore);
      const columnSubtractionScore = computed(() => scoresStore.columnSubtractionScore);
      const equationsWholePartScore = computed(() => scoresStore.equationsWholePartScore);
      const isGradeSelected = computed(() => settingsStore.isGradeSelected);
      const selectedGrade = computed(() => settingsStore.selectedGrade);
      const gradeName = computed(() => selectedGrade.value ? getGradeName(selectedGrade.value) : '');

      // Получаем текущую четверть напрямую, а не из хранилища
      const currentQuarter = computed(() => getCurrentQuarter());
      const quarterName = computed(() => getQuarterName(currentQuarter.value));

      // Получаем доступные упражнения для текущего класса и четверти
      const availableExercises = computed(() => {
        if (!selectedGrade.value) {
          return {
            counting: {
              available: true,
              title: 'Тренажер счета',
              description: 'Решай примеры на сложение и вычитание'
            },
            firstGradeDecomposition: {
              available: false,
              title: 'Состав числа (1 класс)',
              description: 'Изучи состав чисел до 10'
            },
            decomposition: {
              available: false,
              title: 'Состав числа',
              description: 'Выбирай правильный способ разложения чисел'
            },
            multiplication: {
              available: false,
              title: 'Таблица умножения',
              description: 'Изучай таблицу умножения постепенно'
            },
            equations: {
              available: false,
              title: 'Простые уравнения',
              description: 'Решай простые уравнения с неизвестным'
            },
            columnSubtraction: {
              available: false,
              title: 'Вычитание в столбик',
              description: 'Научись вычитать с заимствованием из десятков'
            },
            equationsWholePart: {
              available: false,
              title: 'Уравнения: целое и части',
              description: 'Решай уравнения методом частей'
            }
          };
        }
        return getAvailableExercises(selectedGrade.value, currentQuarter.value);
      });

      // Методы
      const goToCounting = () => {
        router.push('/counting');
      };

      const goToDecomposition = () => {
        router.push('/decomposition');
      };

      const goToFirstGradeDecomposition = () => {
        router.push('/first-grade-decomposition');
      };

      const goToMultiplication = () => {
        router.push('/multiplication');
      };

      const goToEquations = () => {
        router.push('/equations');
      };

      const goToColumnSubtraction = () => {
        // Определяем, куда перейти: обучение, диагностика или тренировка
        const learningCompleted = scoresStore.columnSubtractionLearningCompleted;
        const diagnosticPassed = scoresStore.columnSubtractionDiagnosticPassed;

        if (!learningCompleted) {
          router.push('/column-subtraction/learning');
        } else if (!diagnosticPassed) {
          router.push('/column-subtraction/diagnostic');
        } else {
          router.push('/column-subtraction');
        }
      };

      const goToEquationsWholePart = () => {
        // Определяем, куда перейти: обучение, диагностика или тренировка
        const learningCompleted = scoresStore.equationsWholePartLearningCompleted;
        const diagnosticPassed = scoresStore.equationsWholePartDiagnosticPassed;

        if (!learningCompleted) {
          router.push('/equations-whole-part/learning');
        } else if (!diagnosticPassed) {
          router.push('/equations-whole-part/diagnostic');
        } else {
          router.push('/equations-whole-part');
        }
      };

      const goToAchievements = () => {
        achievementsStore.markAchievementsAsViewed(); // Отмечаем ачивки как просмотренные
        router.push('/achievements');
      };

      const goToDailyTasks = () => {
        router.push('/daily-tasks');
      };

      const changeGrade = () => {
        settingsStore.resetSettings();
        // После сброса настроек компонент GradeSelection покажется автоматически
      };

      // Вычисляемые свойства для ачивок
      const unlockedCount = computed(() => achievementsStore.unlockedCount);
      const totalCount = computed(() => achievementsStore.totalCount);
      const hasNewAchievements = computed(() => achievementsStore.getNewAchievementsCount > 0);
      const newAchievementsCount = computed(() => achievementsStore.getNewAchievementsCount);

      // Вычисляемые свойства для монеток и ежедневных заданий
      const coins = computed(() => playerStore.currency.coins);

      const hasUncompletedTasks = computed(() => {
        return dailyTasks.value.some(task => !task.completed);
      });

      const uncompletedTasksCount = computed(() => {
        return dailyTasks.value.filter(task => !task.completed).length;
      });

      // Функция форматирования чисел
      const formatNumber = (num: number): string => {
        if (num >= 1000000) {
          return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
          return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
      };

      // Добавляем lifecycle hook для монтирования
      onMounted(() => {
        nextTick(() => {
          setupScrollSnap();
        });
      });

      // Перезагружаем очки при каждом возвращении на главную страницу
      onActivated(() => {
        scoresStore.loadScores();
      });

      // Дополнительно следим за изменением роута (для случаев без KeepAlive)
      watch(
        () => route.path,
        (newPath) => {
          if (newPath === '/') {
            scoresStore.loadScores();
          }
        }
      );

      return {
        countingScore,
        decompositionScore,
        firstGradeDecompositionScore,
        multiplicationScore,
        equationsScore,
        columnSubtractionScore,
        equationsWholePartScore,
        isGradeSelected,
        gradeName,
        gradeNumber: selectedGrade,
        quarterName,
        availableExercises,
        unlockedCount,
        totalCount,
        hasNewAchievements,
        newAchievementsCount,
        coins,
        hasUncompletedTasks,
        uncompletedTasksCount,
        formatNumber,
        goToCounting,
        goToDecomposition,
        goToFirstGradeDecomposition,
        goToMultiplication,
        goToEquations,
        goToColumnSubtraction,
        goToEquationsWholePart,
        goToAchievements,
        goToDailyTasks,
        changeGrade
      };
    }
  };
</script>

<style scoped>
  /* ============================================
     HOMEVIEW — Полный редизайн
  /* ============================================
     HOMEVIEW — Полный редизайн
     ============================================ */

  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    gap: 16px;
    flex: 1;
    width: 100%;
    justify-content: flex-start;
  }

  /* === Hero секция === */
  .hero-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
  }

  .hero-top {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  /* Бейдж класса */
  .grade-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
    flex-shrink: 0;
  }

  .grade-badge:hover {
    transform: scale(1.08);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  .grade-badge:active {
    transform: scale(0.95);
  }

  .grade-badge-number {
    font-size: 22px;
    font-weight: 800;
    line-height: 1;
  }

  .grade-badge-label {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.9;
  }

  /* Hero actions (ачивки, задания) */
  .hero-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .icon-btn {
    position: relative;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    border: none;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .icon-btn:active {
    transform: scale(0.92);
  }

  .achievements-btn {
    background: linear-gradient(135deg, #4CAF50, #66BB6A);
    box-shadow: 0 3px 8px rgba(76, 175, 80, 0.3);
  }

  .achievements-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(76, 175, 80, 0.4);
  }

  .daily-btn {
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
    box-shadow: 0 3px 8px rgba(139, 92, 246, 0.3);
  }

  .daily-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(139, 92, 246, 0.4);
  }

  .badge-dot {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ff4757;
    color: white;
    border-radius: 50%;
    min-width: 18px;
    height: 18px;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  }

  /* === Прогресс-путь (компактный на главной) === */
  .home-progress-path {
    background: rgba(255, 255, 255, 0.45);
    border-radius: 14px;
    padding: 8px 10px;
    max-height: 120px;
    overflow: hidden;
  }

  /* === Сетка упражнений === */
  .games-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
    width: 100%;
    max-width: 560px;
    padding: 4px 0;
  }

  /* === Карточка упражнения === */
  .game-card {
    background: white;
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    border: 2px solid transparent;
  }

  .game-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #ddd, #eee);
    transition: height 0.2s;
  }

  .game-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
  }

  .game-card:hover::before {
    height: 6px;
  }

  .game-card:active {
    transform: translateY(-2px) scale(0.98);
  }

  /* Цветные полоски */
  .game-card--counting::before { background: linear-gradient(90deg, #4fc3f7, #03a9f4); }
  .game-card--decomposition::before { background: linear-gradient(90deg, #ff9a8b, #ff6a88); }
  .game-card--multiplication::before { background: linear-gradient(90deg, #ff7043, #e64a19); }
  .game-card--column::before { background: linear-gradient(90deg, #ffb74d, #ff9800); }
  .game-card--equations::before { background: linear-gradient(90deg, #81c784, #4caf50); }

  /* Цветной border-bottom при hover */
  .game-card--counting:hover { border-color: #4fc3f7; }
  .game-card--decomposition:hover { border-color: #ff9a8b; }
  .game-card--multiplication:hover { border-color: #ff7043; }
  .game-card--column:hover { border-color: #ffb74d; }
  .game-card--equations:hover { border-color: #81c784; }

  .game-content {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .game-icon {
    font-size: clamp(36px, 7vw, 48px);
    flex-shrink: 0;
  }

  .game-info {
    flex: 1;
    min-width: 0;
  }

  .game-title {
    font-size: clamp(15px, 3vw, 18px);
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .game-description {
    font-size: clamp(12px, 2.2vw, 14px);
    color: #718096;
    margin-bottom: 6px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .game-score {
    font-size: clamp(13px, 2.5vw, 15px);
    font-weight: 700;
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
    border-radius: 10px;
    padding: 3px 10px;
    display: inline-block;
  }

  /* === Responsive: планшет === */
  @media (max-width: 768px) {
    .main-container {
      padding: 12px;
      gap: 12px;
    }

    .hero-top {
      gap: 10px;
    }

    .grade-badge {
      width: 46px;
      height: 46px;
      border-radius: 14px;
    }

    .grade-badge-number {
      font-size: 20px;
    }

    .games-container {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .game-card {
      padding: 14px;
    }
  }

  /* === Responsive: телефон === */
  @media (max-width: 480px) {
    .main-container {
      padding: 10px;
      gap: 10px;
    }

    .hero-section {
      gap: 8px;
    }

    .hero-top {
      gap: 8px;
    }

    .grade-badge {
      width: 42px;
      height: 42px;
      border-radius: 12px;
    }

    .grade-badge-number {
      font-size: 18px;
    }

    .grade-badge-label {
      font-size: 8px;
    }

    .icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      font-size: 20px;
    }

    .games-container {
      gap: 10px;
    }

    .game-card {
      padding: 12px;
      border-radius: 14px;
    }

    .game-content {
      gap: 10px;
    }

    .game-icon {
      font-size: 32px;
    }

    .game-title {
      font-size: 14px;
    }

    .game-description {
      font-size: 12px;
    }

    .game-score {
      font-size: 12px;
    }
  }
</style>
