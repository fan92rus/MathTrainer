<template>
  <div class="app-container">
    <AchievementManager />
    <div class="game-container">
      <div class="main-container">
        <div v-if="isGradeSelected" class="grade-info-container">
          <div class="grade-info">
            <span class="grade-label">Текущий класс:</span>
            <span class="grade-value">{{ gradeName }}, {{ quarterName }}</span>
          </div>
          <div class="grade-actions">
            <button class="change-grade-button" @click="changeGrade">Изменить класс</button>
            <button class="achievements-button" @click="goToAchievements">
              <span class="achievements-icon">🏆</span>
              <span v-if="hasNewAchievements" class="new-achievements-count">{{ newAchievementsCount }}</span>
            </button>
            <button class="daily-tasks-button" @click="goToDailyTasks" title="Ежедневные задания">
              <span class="daily-tasks-icon">📅</span>
              <span v-if="hasUncompletedTasks" class="pending-tasks-count">{{ uncompletedTasksCount }}</span>
            </button>
            <button class="crystals-button" v-if="crystals > 0" @click="goToCity" title="Кристаллы">
              <span class="crystals-icon">💎</span>
              <span class="crystals-count">{{ formatNumber(crystals) }}</span>
            </button>
            <button class="city-button" @click="goToCity" title="Мой город">
              <span class="city-icon">🏙️</span>
            </button>
            <div title="Монетки">
              <span class="coins-icon">🪙</span>
            <span class="coins-count">{{ formatNumber(coins) }}</span>
            </div>
          </div>
        </div>
        <div class="games-container">
          <div
            v-if="availableExercises.firstGradeDecomposition.available"
            class="game-card"
            @click="goToFirstGradeDecomposition"
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
            class="game-card"
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
          <div v-if="availableExercises.counting.available" class="game-card" @click="goToCounting">
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
            class="game-card"
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
            class="game-card"
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
            class="game-card"
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

  export default {
    name: 'HomeView',
    components: {
      AchievementManager
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

      const goToCity = () => {
        router.push('/city');
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
      const crystals = computed(() => playerStore.currency.crystals);

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
        quarterName,
        availableExercises,
        unlockedCount,
        totalCount,
        hasNewAchievements,
        newAchievementsCount,
        coins,
        crystals,
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
        goToCity,
        goToDailyTasks,
        changeGrade
      };
    }
  };
</script>

<style scoped>
  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    gap: 20px;
    flex: 1;
  }

  .grade-info-container {
    background: linear-gradient(135deg, #ffffff, #f8f9ff);
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .grade-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .grade-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
  }

  .grade-value {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .grade-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: nowrap;
  }

  .achievements-button {
    background: linear-gradient(135deg, #4CAF50, #8BC34A);
    color: white;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 8px rgba(76, 175, 80, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
  }

  .achievements-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(76, 175, 80, 0.4);
  }

  .achievements-icon {
    font-size: 24px;
  }

  .city-button {
    background: linear-gradient(135deg, #FF9800, #F57C00);
    color: white;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 8px rgba(255, 152, 0, 0.3);
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .city-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(255, 152, 0, 0.4);
  }

  .city-icon {
    font-size: 24px;
  }

  .daily-tasks-button {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 8px rgba(139, 92, 246, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
  }

  .daily-tasks-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(139, 92, 246, 0.4);
  }

  .daily-tasks-icon {
    font-size: 24px;
  }

  .pending-tasks-count {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ff4757;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: bold;
  }

  .coins-button {
    background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
    color: white;
    border: none;
    border-radius: 2rem;
    padding: 0.5rem 1rem;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(251, 191, 36, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    flex-shrink: 0;
  }

  .coins-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(251, 191, 36, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  }

  .coins-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(251, 191, 36, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .coins-icon {
    font-size: 24px;
    line-height: 1;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }

  .coins-count {
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .crystals-button {
    background: linear-gradient(135deg, #818cf8, #6366f1, #4f46e5);
    color: white;
    border: none;
    border-radius: 2rem;
    padding: 0.5rem 1rem;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(129, 140, 248, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    flex-shrink: 0;
  }

  .crystals-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(129, 140, 248, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  }

  .crystals-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(129, 140, 248, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .crystals-icon {
    font-size: 24px;
    line-height: 1;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }

  .crystals-count {
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .new-achievements-count {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ff4757;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .change-grade-button {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 20px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
    width: 100px;
  }

  .change-grade-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(102, 126, 234, 0.4);
  }

  .buttons-container {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 40px;
  }

  .difficulty-info-button {
    padding: 10px 20px;
    background: linear-gradient(135deg, #4caf50, #45a049);
    color: white;
    border: none;
    border-radius: 30px;
    font-size: clamp(14px, 3vw, 16px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
  }

  .difficulty-info-button:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4);
  }

  .main-title {
    font-size: clamp(32px, 6vw, 48px);
    font-weight: 700;
    margin-bottom: 30px;
    text-align: center;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .scores-container {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .score-card-title {
    background: linear-gradient(135deg, #ffffff, #f8f9ff);
    border-radius: 20px;
    padding: 10px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
    min-width: 70px;
    transition: transform 0.3s ease;
    font-size: clamp(16px, 3vw, 20px);
    color: #666;
    margin-bottom: 10px;
  }

  .games-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 70vh;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
    scroll-padding: 10px 0;
    padding: 10px 0;
    margin: 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
  }

  .games-container::-webkit-scrollbar {
    width: 6px;
  }

  .games-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .games-container::-webkit-scrollbar-thumb {
    background-color: rgba(102, 126, 234, 0.3);
    border-radius: 3px;
  }

  .games-container::-webkit-scrollbar-thumb:hover {
    background-color: rgba(102, 126, 234, 0.5);
  }

  .game-card {
    background: linear-gradient(135deg, #ffffff, #f8f9ff);
    border-radius: 20px;
    padding: 10px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    width: 600px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  .game-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #ff9a8b, #ff6a88, #ff99ac);
  }

  .game-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }

  .game-content {
    display: flex;
    align-items: flex-start;
    gap: 15px;
  }

  .game-icon {
    font-size: clamp(40px, 8vw, 60px);
    flex-shrink: 0;
    margin-top: 5px;
  }

  .game-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .game-title {
    font-size: clamp(18px, 4vw, 22px);
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  .game-description {
    font-size: clamp(14px, 2.5vw, 16px);
    color: #666;
    margin-bottom: 8px;
  }

  .game-score {
    font-size: clamp(16px, 3vw, 18px);
    font-weight: 700;
    color: #ff9800;
    background: rgba(255, 152, 0, 0.1);
    border-radius: 15px;
    padding: 6px 12px;
    display: inline-block;
    align-self: flex-start;
  }

  @media (max-width: 768px) {
    .main-container {
      padding: 15px;
    }

    .grade-info-container {
      margin-bottom: 15px;
      padding: 15px;
    }

    .coins-button,
    .crystals-button {
      padding: 0.4rem 0.8rem;
      font-size: 13px;
    }

    .coins-icon,
    .crystals-icon {
      font-size: 20px;
    }

    .coins-count,
    .crystals-count {
      font-size: 12px;
    }

    .grade-info {
      margin-bottom: 10px;
    }

    .grade-value {
      font-size: 16px;
    }

    .grade-actions {
      gap: 10px;
      justify-content: flex-end;
    }

    .achievements-button {
      width: 44px;
      height: 44px;
    }

    .achievements-icon {
      font-size: 22px;
    }

    .new-achievements-count {
      width: 18px;
      height: 18px;
      font-size: 10px;
    }

    .change-grade-button {
      padding: 8px 12px;
      font-size: 12px;
      width: 100px;
    }

    .scores-container {
      gap: 10px;
      margin-bottom: 15px;
    }

    .score-card-title {
      min-width: 120px;
      padding: 8px 12px;
      font-size: 14px;
    }

    .games-container {
      height: 70vh;
      gap: 15px;
      scroll-padding: 10px 0;
      padding: 10px 0;
    }

    .game-card {
      width: 90vw;
      max-width: 400px;
      padding: 15px;
      flex-shrink: 0;
      scroll-snap-align: start;
      scroll-snap-stop: always;
    }

    .game-content {
      gap: 12px;
    }

    .game-icon {
      font-size: 36px;
    }

    .game-title {
      font-size: 16px;
      margin-bottom: 6px;
    }

    .game-description {
      font-size: 13px;
      margin-bottom: 6px;
    }

    .game-score {
      font-size: 14px;
      padding: 5px 10px;
    }
  }

  /* Для очень маленьких экранов */
  @media (max-width: 480px) {
    .main-container {
      padding: 10px;
    }

    .grade-info-container {
      flex-direction: column;
      gap: 10px;
      padding: 10px;
    }

    .grade-actions {
      flex-wrap: wrap;
      justify-content: center;
    }

    .coins-button,
    .crystals-button {
      padding: 0.3rem 0.6rem;
      font-size: 12px;
    }

    .coins-icon,
    .crystals-icon {
      font-size: 18px;
    }

    .coins-count,
    .crystals-count {
      font-size: 11px;
    }

    .grade-info {
      align-items: center;
    }

    .grade-actions {
      align-self: stretch;
      justify-content: space-between;
    }

    .change-grade-button {
      width: 100px;
      max-width: 100px;
    }

    .scores-container {
      gap: 8px;
      margin-bottom: 12px;
    }

    .score-card-title {
      min-width: 100px;
      padding: 6px 10px;
      font-size: 12px;
    }

    .games-container {
      height: 70vh;
      gap: 12px;
      width: 100%;
      scroll-padding: 10px 0;
      padding: 10px 0;
    }

    .game-card {
      width: 100%;
      max-width: none;
      padding: 12px;
      flex-shrink: 0;
      scroll-snap-align: start;
      scroll-snap-stop: always;
    }

    .game-content {
      gap: 10px;
    }

    .game-icon {
      font-size: 32px;
    }

    .game-title {
      font-size: 16px;
      margin-bottom: 6px;
    }

    .game-description {
      font-size: 12px;
      margin-bottom: 6px;
    }

    .game-score {
      font-size: 12px;
      padding: 4px 8px;
    }
  }

  </style>
