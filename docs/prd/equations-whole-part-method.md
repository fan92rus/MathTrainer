# PRD: Решение уравнений методом "целое и части"

**Версия:** 1.0
**Дата:** 10 февраля 2026
**Статус:** Черновик
**Автор:** Claude (на основе концепции equations-whole-part-method.md)

---

## 1. Executive Summary (Резюме)

### 1.1 Vision

Добавить в MathTrainer интерактивный режим решения уравнений методом "целое и части" с пошаговым объяснением. Это позволит детям 1-2 классов перейти от интуитивного подбора к осознанному алгоритмическому решению уравнений.

### 1.2 Ключевая ценность

| Характеристика | Текущее состояние (подбор) | Новое состояние (метод "целое и части") |
|----------------|---------------------------|-----------------------------------------|
| Масштабируемость | Только малые числа (до 20) | Любые числа до 100 |
| Навык | Интуитивный подбор | Алгоритмический подход |
| Понимание | "Какое число подходит?" | "Целое = часть₁ + часть₂" |
| Визуализация | Нет | Квадрат-схема на уровне 1 |

### 1.3 Business Value

- **Удержание:** Новое упражнение расширяет контент для 1-2 классов
- **Педагогическая ценность:** Формирует понимание связи между сложением и вычитанием
- **Дифференциация:** Три уровня поддержки (scaffolding) адаптируются под разный уровень подготовки

---

## 2. Problem Statement (Постановка проблемы)

### 2.1 Текущая ситуация

**Существует:** Режим решения уравнений подбором (EquationsView.vue)
- Дети вводят только число
- Работает только для малых чисел (до 20)
- Не формирует алгоритмическое мышление

**Ограничения текущего решения:**
- Не масштабируется на большие числа
- Не объясняет структуру уравнения
- Нет визуализации связи "целое — части"

### 2.2 Целевая аудитория

**Персона 1: Аня, 7 лет, 1 класс**
- Умеет складывать и вычитать в уме (числа до 100)
- Знакома с уравнениями (решала подбором)
- Испытывает трудности с уравнениями вида `x - 5 = 7`
- Нуждается в визуальной поддержке

**Персона 2: Мама Ани**
- Хочет, чтобы дочь понимала математику, а не просто подбирала ответы
- Ищет упражнения с прогрессией сложности
- Ценит наглядные объяснения

### 2.3 Боли и потребности

| Боль | Влияние | Решение |
|------|---------|---------|
| "Не могу решить `x - 5 = 7`" | Фрустрация, отказ от упражнения | Визуальная схема "целое — части" |
| "Подбираю числа, но не понимаю почему" | Поверхностное обучение | Три уровня scaffolding |
| "Большие числа (до 100) сложно подобрать" | Ограничение практики | Алгоритмический метод |

---

## 3. Goals & Metrics (Цели и метрики)

### 3.1 SMART цели

| P | Цель | Метрика | Базовая линия | Целевое значение | Срок |
|---|------|---------|---------------|------------------|------|
| P0 | Запуск упражнения | Функциональная реализация | 0% | 100% | Q1 2026 |
| P0 | Адаптивность уровней | % переходов L1→L2→L3 | N/A | ≥60% L1→L2 | Q2 2026 |
| P1 | Удержание | % завершения обучения | N/A | ≥70% | Q2 2026 |
| P1 | Понимание материала | % правильных на L3 | N/A | ≥80% | Q2 2026 |
| P2 | Монетизация | Премиум-доступ к L3 | 0% | 15% конверсия | Q3 2026 |

### 3.2 Таблица метрик успеха

**Пользовательские метрики:**

| Метрика | Как измеряется | Цель | Частота |
|---------|----------------|------|---------|
| Completion Rate (Learning) | % закончивших обучение | ≥70% | Ежемесячно |
| Diagnostic Pass Rate | % прошедших диагностику (5/10) | ≥65% | Ежемесячно |
| Level Progression | % перешедших L1→L2→L3 | L1→L2: ≥60% | Ежемесячно |
| Avg Session Duration | Среднее время за сеанс | 5-10 мин | Ежемесячно |
| Return Rate | % вернувшихся на следующий день | ≥40% | Ежемесячно |

**Технические метрики:**

| Метрика | Как измеряется | Цель | Частота |
|---------|----------------|------|---------|
| Bug Rate | Количество багов на 1000 сессий | <5 | Ежемесячно |
| Load Time | Время загрузки упражнения | <2 сек | Непрерывно |
| Test Coverage | % покрытия кода тестами | ≥80% | Каждый релиз |

---

## 4. Non-Goals (Не цели)

Четко определяем границы проекта:

| ❌ Не входит в scope | Обоснование |
|---------------------|-------------|
| Умножение и деление | Требует другую визуализацию |
| Уравнения с двумя неизвестными | Слишком сложно для 1-2 класса |
| Составные уравнения (типа `x + 3 = 5 + 2`) | Будущее расширение |
| Озвучивание объяснений | Консистентно с остальными упражнениями |
| Соревновательный режим | Фокус на индивидуальном обучении |
| Интеграция с школьной программой | Независимый образовательный продукт |

---

## 5. User Personas (Персоны пользователей)

### 5.1 Персона 1: Аня, 7 лет

```yaml
Имя: Аня
Возраст: 7 лет
Класс: 1 класс (второе полугодие)

Уровень математики:
  - Считает в пределах 100
  - Знает таблицу сложения
  - Решала простые уравнения подбором

Цели:
  - Понять, как решать уравнения с x
  - Получать звёзды и монеты
  - Пройти все уровни

Фрустрации:
  - "Не понимаю, куда поставить плюс или минус"
  - "Большие числа сложно подобрать"
  - "Надоело решать одно и то же"

Успех для Ани:
  - Решает 10 уравнений подряд без ошибок
  - Переходит на уровень 3
  - Объясняет маме: "Целое равно части плюс часть"
```

### 5.2 Персона 2: Мама Ани

```yaml
Имя: Елена
Возраст: 34 года
Роль: Родитель

Цели:
  - Дочь понимает математику, а не зубрит
  - Прогресс виден в приложении
  - Безопасное времяпрепровождение

Критерии успеха:
  - Аня занимается самостоятельно 15-20 минут
  - Прогресс сохраняется
  - Нет рекламы и токсичного контента
```

### 5.3 Персона 3: Учитель начальных классов

```yaml
Имя: Мария Ивановна
Возраст: 48 лет
Роль: Учитель 1-2 классов

Цели:
  - Рекомендовать приложение для домашней практики
  - Видеть прогресс учеников

Критерии успеха:
  - Метод соответствует школьной программе
  - Ясная прогрессия уровней
```

---

## 6. Functional Requirements (Функциональные требования)

### 6.1 FR-001: Вводный экран с объяснением концепции

**Priority:** P0

**Description:** Первый запуск упражнения показывает вводный экран с метафорой "яблоки в корзинке".

**Acceptance Criteria:**
- [ ] Экран показывается при первом запуске
- [ ] Визуализация корзинки с яблоками (схема целое/части)
- [ ] Правило: "часть + часть = целое" и "целое - часть = другая часть"
- [ ] Кнопка "Понял! Начать" сохраняет флаг в localStorage
- [ ] Повторный запуск пропускает экран

**Technical Specs:**
```typescript
// src/store/scores.ts
equationsWholePartIntroShown: boolean;

// src/components/equationsWholePart/IntroScreen.vue
export interface IntroScreenProps {
  onComplete: () => void;
}
```

### 6.2 FR-002: Генерация уравнений трёх типов

**Priority:** P0

**Description:** Генерирует уравнения трёх типов (сложение/вычитание, числа до 100).

**Acceptance Criteria:**
- [ ] Тип 1: `x + a = b` (найти неизвестное слагаемое)
- [ ] Тип 2: `a - x = b` (найти вычитаемое)
- [ ] Тип 3: `x - a = b` (найти уменьшаемое)
- [ ] Числа от 1 до 100
- [ ] x всегда неотрицательное целое число
- [ ] Сумма/разность от 2 до 100

**Technical Specs:**
```typescript
// src/types/index.ts
export interface EquationWholePartProblem extends MathProblem {
  equationType: 'unknownAddend' | 'unknownSubtrahend' | 'unknownMinuend';
  whole: number;
  knownPart: number;
  unknownPart: number;
  operation: '+' | '-';
}

// src/utils/math/equationsWholePart/index.ts
export function generateEquationWholePartProblem(
  currentScore: number,
  level: number = 1,
  options?: { maxNumber?: number; equationTypes?: EquationType[] }
): EquationWholePartProblem;
```

### 6.3 FR-003: Уровень 1 — Визуальная схема

**Priority:** P0

**Description:** Квадрат с разделением на части, минимум 10 уравнений.

**Acceptance Criteria:**
- [ ] Квадрат разделён вертикальной чертой на две части
- [ ] Целое указано внизу (число)
- [ ] Одна часть содержит ?, другая — число
- [ ] Выбор операции: кнопки "+" и "-"
- [ ] Поле ввода для числового ответа
- [ ] Правильное решение = правильная операция И правильное число
- [ ] Минимум 10 уравнений для перехода

**UI Layout:**
```
┌───┬───┐
│ ? │ 3 │     ? + 3 = 8
└───┴───┘
  = 8

Правило: часть = целое - другая часть

[ + ]  [ - ]        Ответ: ____    [Проверить]
```

**Technical Specs:**
```typescript
// src/components/equationsWholePart/Level1Display.vue
export interface Level1DisplayProps {
  problem: EquationWholePartProblem;
  onComplete: (result: { operation: '+' | '-'; value: number }) => void;
}
```

### 6.4 FR-004: Уровень 2 — Текстовые метки

**Priority:** P0

**Description:** Квадрат скрыт, надписи "целое"/"часть" над числами.

**Acceptance Criteria:**
- [ ] Квадрат НЕ отображается
- [ ] Метки "целое", "часть₁", "часть₂" над числами
- [ ] Минимум 10 уравнений
- [ ] 85% правильных для перехода
- [ ] Не более 2 ошибок подряд

**UI Layout:**
```
x       +       3       =       8
часть            часть      целое

Правило: часть = целое - другая часть

[ + ]  [ - ]        Ответ: ____    [Проверить]    [Подсказка]
```

### 6.5 FR-005: Уровень 3 — Никакой поддержки

**Priority:** P0

**Description:** Чистое уравнение, кнопка "Подсказка".

**Acceptance Criteria:**
- [ ] Только уравнение: `x + 3 = 8`
- [ ] Кнопка "Подсказка" показывает схему уровня 1
- [ ] 3 ошибки подряд → предложение вернуться на уровень 2
- [ ] Прогресс: "7/10 (85%)"

**Technical Specs:**
```typescript
// src/components/equationsWholePart/Level3Display.vue
export interface Level3DisplayProps {
  problem: EquationWholePartProblem;
  onComplete: (result: { operation: '+' | '-'; value: number }) => void;
  onHintRequest: () => void;
  showLevelDownPrompt: boolean;  // После 3 ошибок подряд
}
```

### 6.6 FR-006: Система подсказок

**Priority:** P1

**Description:** На уровнях 2 и 3 доступна бесплатная подсказка.

**Acceptance Criteria:**
- [ ] Кнопка "Подсказка" на уровнях 2 и 3
- [ ] При нажатии показывает схему уровня 1 (квадрат)
- [ ] Подсказка временная (исчезает после ответа)
- [ ] Нет штрафов за использование

### 6.7 FR-007: Обратная связь

**Priority:** P0

**Description:** Визуальная и текстовая обратная связь на действия пользователя.

**Acceptance Criteria:**
- [ ] Правильный ответ: зелёная рамка, анимация галочки, автопереход через 1 сек
- [ ] Неправильная операция: красная подсветка, текст "Подумай: целое больше части"
- [ ] Неправильное число: красная рамка, текст "Попробуй ещё раз"
- [ ] Использовать глобальные анимации из main.css

**Technical Specs:**
```typescript
// Использовать глобальные классы из main.css
// @keyframes correct-pulse
// @keyframes incorrect-shake
```

### 6.8 FR-008: Переход между уровнями

**Priority:** P0

**Description:** Автоматический переход при выполнении условий.

**Acceptance Criteria:**
- [ ] Уровень 1 → 2: ≥75% правильных, ≤3 ошибок подряд, ≥10 уравнений
- [ ] Уровень 2 → 3: ≥85% правильных, ≤2 ошибок подряд, ≥10 уравнений
- [ ] Модальное окно с предложением перейти
- [ ] Опция "Практиковаться ещё"

**Conditions:**
```typescript
interface LevelTransition {
  minProblems: number;
  minCorrectPercent: number;
  maxConsecutiveErrors: number;
}

const LEVEL_1_TO_2: LevelTransition = {
  minProblems: 10,
  minCorrectPercent: 75,
  maxConsecutiveErrors: 3
};

const LEVEL_2_TO_3: LevelTransition = {
  minProblems: 10,
  minCorrectPercent: 85,
  maxConsecutiveErrors: 2
};
```

### 6.9 FR-009: Хранение прогресса

**Priority:** P0

**Description:** Сохранение прогресса пользователя в localStorage.

**Acceptance Criteria:**
- [ ] Текущий уровень (1/2/3)
- [ ] Количество решённых уравнений на уровне
- [ ] Процент правильных решений
- [ ] Счётчик ошибок подряд
- [ ] История типов ошибок (операция vs число)

**Technical Specs:**
```typescript
// src/store/scores.ts
export interface EquationsWholePartProgress {
  currentLevel: 1 | 2 | 3;
  problemsPerLevel: Record<1 | 2 | 3, number>;
  correctPercentPerLevel: Record<1 | 2 | 3, number>;
  consecutiveErrors: number;
  errorHistory: ErrorType[];
}

type ErrorType = 'wrongOperation' | 'wrongValue';
```

### 6.10 FR-010: Интеграция с системой очков и валюты

**Priority:** P0

**Description:** Начисление очков и монет за решение уравнений.

**Acceptance Criteria:**
- [ ] Использовать `useCoins` composable
- [ ] Тип упражнения: 'equations-whole-part'
- [ ] Базовая награда: 2 монеты
- [ ] Штрафы за ошибки (0 ошибок: 100%, 1: 70%, 2: 30%, 3+: 0%)
- [ ] Обновление `equationsWholePartScore` в scores store

### 6.11 FR-011: Обучающий режим (Learning)

**Priority:** P0

**Description:** Пошаговое объяснение с примерами для каждого типа уравнения.

**Acceptance Criteria:**
- [ ] Примеры с яблоками для каждого типа (3 примера)
- [ ] Интерактивное прохождение: пользователь решает пример
- [ ] Объяснение после каждого шага
- [ ] Завершение → переход к диагностике

**Technical Specs:**
```typescript
// src/views/EquationsWholePartLearningView.vue
// Использовать Options API

const learningSteps: LearningStep[] = [
  {
    type: 'intro',
    content: 'Яблоки в корзинке',
    visualization: 'basket'
  },
  {
    type: 'example',
    equationType: 'unknownAddend',
    problem: { x: 7, known: 5, whole: 12 },
    explanation: 'В корзинке 12 яблок. 5 на виду. Сколько спрятано?'
  },
  // ... остальные шаги
];
```

### 6.12 FR-012: Диагностический режим (Diagnostic)

**Priority:** P0

**Description:** Проверка готовности к тренировочному режиму.

**Acceptance Criteria:**
- [ ] 10 уравнений смешанных типов
- [ ] Порог прохождения: 5/10 правильных
- [ ] Уровень 2 (текстовые метки)
- [ ] При успехе → разблокировка тренировки
- [ ] При неудаче → предложение повторить обучение

**Technical Specs:**
```typescript
// src/views/EquationsWholePartDiagnosticView.vue
const DIAGNOSTIC_THRESHOLD = 5;
const DIAGNOSTIC_QUESTIONS = 10;
```

### 6.13 FR-013: Тренировочный режим (Training)

**Priority:** P0

**Description:** Основной режим упражнения с тремя уровнями поддержки.

**Acceptance Criteria:**
- [ ] Доступен после прохождения диагностики
- [ ] Начинается с уровня 1
- [ ] Автоматический переход между уровнями
- [ ] 10 уравнений за сессию
- [ ] Экран завершения с GameOver компонентом

### 6.14 FR-014: Адаптивность UI

**Priority:** P1

**Description:** Адаптивный интерфейс для разных размеров экрана.

**Acceptance Criteria:**
- [ ] Минимальная ширина: 320px
- [ ] Использовать clamp() для размеров
- [ ] Точки перехода: 480px, 360px
- [ ] Квадрат масштабируется пропорционально

**Technical Specs:**
```css
/* Использовать паттерн из main.css */
.whole-part-square {
  width: clamp(120px, 30vw, 200px);
  height: clamp(120px, 30vw, 200px);
  font-size: clamp(16px, 4vw, 24px);
}
```

---

## 7. Implementation Phases (Этапы реализации)

### Phase 1: Foundation (Фундамент)
**Duration:** 1-2 недели
**Dependencies:** None

| Задача | Описание | Deliverables |
|--------|----------|--------------|
| 1.1 | Типы и интерфейсы | `EquationWholePartProblem` в types/index.ts |
| 1.2 | Генератор задач | `generateEquationWholePartProblem()` |
| 1.3 | Unit тесты | Coverage ≥80% для генератора |
| 1.4 | Store интеграция | Поля в scores.ts для прогресса |

### Phase 2: Level 1 (Визуальная схема)
**Duration:** 1-2 недели
**Dependencies:** Phase 1

| Задача | Описание | Deliverables |
|--------|----------|--------------|
| 2.1 | Level1Display компонент | Квадрат с разделением |
| 2.2 | Логика выбора операции | Валидация операции + числа |
| 2.3 | Обратная связь | Зелёная/красная индикация |
| 2.4 | Система прогресса уровня | Счётчик, %, ошибки подряд |

### Phase 3: Learning Mode (Обучение)
**Duration:** 1-2 недели
**Dependencies:** Phase 2

| Задача | Описание | Deliverables |
|--------|----------|--------------|
| 3.1 | IntroScreen компонент | Яблоки в корзинке |
| 3.2 | Learning View | Пошаговое обучение |
| 3.3 | Примеры для каждого типа | 3 интерактивных примера |
| 3.4 | Навигация | Learning → Diagnostic |

### Phase 4: Diagnostic Mode (Диагностика)
**Duration:** 1 неделя
**Dependencies:** Phase 3

| Задача | Описание | Deliverables |
|--------|----------|--------------|
| 4.1 | Diagnostic View | 10 вопросов, порог 5/10 |
| 4.2 | Уровень 2 реализация | Текстовые метки |
| 4.3 | Результаты диагностики | Pass/Fail логика |

### Phase 5: Training Mode (Тренировка)
**Duration:** 1-2 недели
**Dependencies:** Phase 4

| Задача | Описание | Deliverables |
|--------|----------|--------------|
| 5.1 | Training View | Основной режим |
| 5.2 | Уровень 3 реализация | Чистое уравнение |
| 5.3 | Система подсказок | Кнопка "Подсказка" |
| 5.4 | Переходы уровней | L1→L2→L3 логика |
| 5.5 | GameOver интеграция | Экран завершения |

### Phase 6: Polish & Testing (Полировка)
**Duration:** 1 неделя
**Dependencies:** Phase 5

| Задача | Описание | Deliverables |
|--------|----------|--------------|
| 6.1 | Адаптивность | Mobile, tablet, desktop |
| 6.2 | Анимации | Плавные переходы |
| 6.3 | QA тестирование | Bug fixing |
| 6.4 | Документация | README для разработчиков |

---

## 8. Existing Patterns Reference (Ссылка на паттерны)

> 🎯 **КРИТИЧЕСКИ ВАЖНО:** Использовать существующие компоненты и паттерны MathTrainer!

### 8.1 Обязательные общие компоненты

| Компонент | Путь | Обязательные props | События | Использование |
|-----------|------|-------------------|---------|---------------|
| GameOver | `src/components/common/GameOver.vue` | correctAnswers, totalAnswers, score | @restart, @exit | После завершения тренировки |
| CoinAnimation | `src/components/common/CoinAnimation.vue` | amount, showText?, duration? | @animationEnd | При awardCoins |
| ScoreDisplay | `src/components/common/ScoreDisplay.vue` | currentScore, totalScore, currentQuestion, totalQuestions | - | Отображение прогресса |
| ProgressBar | `src/components/common/ProgressBar.vue` | progressPercent | - | Визуальный прогресс |
| StarRating | `src/components/common/StarRating.vue` | score | - | Рейтинг по звёздам |
| CurrencyDisplay | `src/components/player/CurrencyDisplay.vue` | (нет, использует playerStore) | - | Отображение валюты |

### 8.2 Обязательная структура DOM View-компонента

```html
<div class="app-container">
  <!-- CoinAnimation (условный рендеринг) -->
  <CoinAnimation v-if="showCoinAnimation" :amount="coinsEarned" @animationEnd="showCoinAnimation = false" />

  <div class="game-container">
    <div v-if="!game.gameOver.value" class="game-container-inner">
      <!-- Header -->
      <div class="header">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <button class="back-button" @click="goBack">← Назад</button>
          <div style="display: flex; align-items: center; gap: 15px;">
            <span class="level-indicator">Уровень {{ currentSupportLevel }}</span>
            <CurrencyDisplay />
          </div>
        </div>
        <h1 class="title">Решение уравнений</h1>
      </div>

      <!-- Score Display -->
      <ScoreDisplay
        :current-score="game.score.value"
        :total-score="totalScore"
        :current-question="game.currentQuestion.value"
        :total-questions="TOTAL_QUESTIONS"
      />

      <!-- Problem Display (специфичный компонент) -->
      <component :is="currentLevelComponent" :problem="currentProblem" @complete="handleComplete" />

      <!-- Progress -->
      <ProgressBar :progress-percent="game.progressPercent.value" />
      <StarRating :score="game.score.value" />
    </div>

    <!-- Game Over -->
    <GameOver v-else :correct-answers="game.correctAnswers.value" :total-answers="TOTAL_QUESTIONS" :score="game.score.value" @restart="restartTraining" @exit="goHome" />
  </div>
</div>
```

### 8.3 Reference Implementations (Примеры для копирования)

**Паттерн для визуализации:** `src/views/ColumnSubtractionView.vue`
- Использовать как шаблон для пошагового режима
- Структура: строки 12-20 (header), 23-28 (ScoreDisplay), 48-54 (AnswerOptions)

**Паттерн для генератора:** `src/utils/math/columnSubtraction/index.ts`
- Функция generateXXXProblem: строки 50-120
- Функция generateWrongOptions: строки 20-45

### 8.4 Обязательные Composables и Store

| Composable/Store | Путь | Назначение |
|------------------|------|------------|
| useGameLogic | `src/composables/useGameLogic.ts` | Управление состоянием игры |
| useCoins | `src/composables/useCoins.ts` | Анимация и выдача монет |
| useScoresStore | `src/store/scores.ts` | Хранение очков упражнения |
| usePlayerStore | `src/store/player.ts` | Валюта и достижения |

### 8.5 Требования к Options API

**View-компоненты ДОЛЖНЫ использовать Options API:**

```vue
<script lang="ts">
export default {
  name: 'EquationsWholePartTrainingView',
  components: {
    ScoreDisplay,
    ProgressBar,
    StarRating,
    GameOver,
    CoinAnimation,
    CurrencyDisplay,
    // ... специфичные компоненты
  },
  setup() {
    // Логика компонента
    return { /* ... */ };
  }
}
</script>
```

**Display-компоненты МОГУТ использовать `<script setup>`:**

```vue
<script setup lang="ts">
export interface Props {
  problem: EquationWholePartProblem;
}

const props = defineProps<Props>();
</script>
```

### 8.6 Component Specifications (Спецификации компонентов)

| Компонент | Путь | Props | Events | Синтаксис |
|-----------|------|-------|--------|-----------|
| **IntroScreen** | `src/components/equationsWholePart/IntroScreen.vue` | `onComplete: () => void` | - | `<script setup>` |
| **Level1Display** | `src/components/equationsWholePart/Level1Display.vue` | `problem: EquationWholePartProblem`<br/>`showResult?: boolean` | `@complete: (result: CompletionResult) => void` | `<script setup>` |
| **Level2Display** | `src/components/equationsWholePart/Level2Display.vue` | `problem: EquationWholePartProblem`<br/>`showResult?: boolean`<br/>`showHint?: boolean` | `@complete: (result: CompletionResult) => void`<br/>`@hint: () => void` | `<script setup>` |
| **Level3Display** | `src/components/equationsWholePart/Level3Display.vue` | `problem: EquationWholePartProblem`<br/>`showResult?: boolean`<br/>`showLevelDownPrompt: boolean` | `@complete: (result: CompletionResult) => void`<br/>`@hint: () => void`<br/>`@levelDown: () => void` | `<script setup>` |
| **WholePartSquare** | `src/components/equationsWholePart/WholePartSquare.vue` | `whole: number`<br/>`parts: [number \| undefined, number \| undefined]`<br/>`showLabels?: boolean`<br/>`size?: 'small' \| 'medium' \| 'large'` | - | `<script setup>` |

#### Типы данных для спецификаций

```typescript
// Результат завершения уравнения
export interface CompletionResult {
  operation: '+' | '-';
  value: number;
  isCorrect: boolean;
  timestamp: number;
}

// Проблема уравнения (расширение MathProblem)
export interface EquationWholePartProblem extends MathProblem {
  equationType: 'unknownAddend' | 'unknownSubtrahend' | 'unknownMinuend';
  whole: number;           // Целое (сумма или уменьшаемое)
  knownPart: number;       // Известная часть
  unknownPart: number;     // Неизвестная часть (x)
  operation: '+' | '-';
  supportLevel: 1 | 2 | 3;
}
```

#### Детали реализации компонентов

**IntroScreen.vue**
```vue
<script setup lang="ts">
export interface Props {
  step?: 'intro' | 'example1' | 'example2' | 'example3';
  autoAdvance?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  step: 'intro',
  autoAdvance: true
});

const emit = defineEmits<{
  complete: [];
}>();
</script>
```

**Level1Display.vue**
```vue
<script setup lang="ts">
export interface Props {
  problem: EquationWholePartProblem;
  showResult?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showResult: false
});

const emit = defineEmits<{
  complete: [result: CompletionResult];
}>();

// Состояние выбора операции
const selectedOperation = ref<'+' | '-' | null>(null);
const inputValue = ref<number | null>(null);
</script>
```

**Level2Display.vue**
```vue
<script setup lang="ts">
export interface Props {
  problem: EquationWholePartProblem;
  showResult?: boolean;
  showHint?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showResult: false,
  showHint: false
});

const emit = defineEmits<{
  complete: [result: CompletionResult];
  hint: [];
}>();
</script>
```

**Level3Display.vue**
```vue
<script setup lang="ts">
export interface Props {
  problem: EquationWholePartProblem;
  showResult?: boolean;
  showLevelDownPrompt: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showResult: false,
  showLevelDownPrompt: false
});

const emit = defineEmits<{
  complete: [result: CompletionResult];
  hint: [];
  levelDown: [];  // Пользователь согласился вернуться на уровень 2
}>();
</script>
```

**WholePartSquare.vue** (переиспользуемый компонент)
```vue
<script setup lang="ts">
export interface Props {
  whole: number;
  parts: [number | undefined, number | undefined];
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  showLabels: false,
  size: 'medium'
});

// Вычисляемые свойства
const firstPart = computed(() => props.parts[0] ?? '?');
const secondPart = computed(() => props.parts[1] ?? '?');
</script>

<style scoped>
.whole-part-square {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 3px solid #667eea;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
}

.whole-part-square.size-small {
  width: clamp(80px, 20vw, 120px);
  height: clamp(80px, 20vw, 120px);
  font-size: clamp(14px, 3vw, 18px);
}

.whole-part-square.size-medium {
  width: clamp(120px, 30vw, 200px);
  height: clamp(120px, 30vw, 200px);
  font-size: clamp(18px, 4vw, 28px);
}

.whole-part-square.size-large {
  width: clamp(160px, 40vw, 280px);
  height: clamp(160px, 40vw, 280px);
  font-size: clamp(24px, 6vw, 36px);
}
</style>
```

---

## 9. Design System & CSS Requirements

### 9.1 Глобальные классы (НЕ переопределять в scoped styles)

**ИСПОЛЬЗОВАТЬ ИЗ main.css - НЕ копировать в компонент!**

```css
/* Контейнеры */
.app-container { /* строки 18-25 */ }
.game-container { /* строки 27-37 */ }
.game-container-inner { /* padding, gap */ }
.header { /* отступы, выравнивание */ }

/* Текст */
.title { /* строки 55-64, градиентный текст */ }
.level-indicator { /* строка 66-74, градиентный фон */ }

/* Кнопки */
.back-button { /* строки 326-357, gradient purple */ }

/* Прогресс */
.progress-bar { /* контейнер */ }
.progress { /* заполненная часть */ }

/* Звёзды */
.stars-container { /* контейнер */ }
.star { /* серая звезда */ }
.star.filled { /* золотая звезда */ }

/* Анимации */
@keyframes correct-pulse { /* правильный ответ */ }
@keyframes incorrect-shake { /* неправильный ответ */ }
```

### 9.2 Новые CSS классы (специфичные для упражнения)

**✅ ДОБАВИТЬ в scoped styles:**

```css
/* Квадрат "целое и части" */
.whole-part-square {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 3px solid #667eea;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
}

.whole-part-part {
  padding: clamp(12px, 3vw, 20px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(18px, 5vw, 28px);
  font-weight: 600;
}

.whole-part-divider {
  border-right: 2px solid #667eea;
}

.whole-part-label {
  text-align: center;
  margin-top: 8px;
  font-size: clamp(12px, 3vw, 14px);
  color: #667eea;
  font-weight: 500;
}

/* Кнопки операций */
.operation-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin: 16px 0;
}

.operation-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 12px;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.operation-btn.selected {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  transform: scale(1.05);
}

/* Правило */
.rule-text {
  text-align: center;
  font-size: clamp(14px, 3vw, 16px);
  color: #555;
  margin: 12px 0;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}
```

### 9.3 Цвета и градиенты

```markdown
## Градиенты (НЕ использовать CSS переменные)

**Primary:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
**Success:** `linear-gradient(135deg, #a5d6a7 0%, #66bb6a 100%)`
**Error:** `linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%)`
**Level indicator:** `linear-gradient(135deg, #fbbf24, #f59e0b)`
```

---

## 10. TypeScript Requirements

### 10.1 Экспорт интерфейсов

**ВСЕ интерфейсы Props ДОЛЖНЫ быть экспортированы:**

```typescript
// ✅ ПРАВИЛЬНО
export interface EquationWholePartProblem extends MathProblem {
  equationType: 'unknownAddend' | 'unknownSubtrahend' | 'unknownMinuend';
  whole: number;
  knownPart: number;
  unknownPart: number;
}

// ❌ НЕПРАВИЛЬНО
interface EquationWholePartProblem extends MathProblem {  // приватный!
  // ...
}
```

### 10.2 Интерфейсы в Options API

```typescript
// ✅ ПРАВИЛЬНО - публичный интерфейс
export interface LevelProgress {
  level: 1 | 2 | 3;
  solved: number;
  correct: number;
  consecutiveErrors: number;
}

export default {
  setup() {
    const levelProgress = ref<LevelProgress>({ /* ... */ });
    return { levelProgress };
  }
}
```

---

## 11. Project Structure Requirements

### 11.1 Файловая структура

```
src/
├── components/equationsWholePart/
│   ├── IntroScreen.vue                # Вводный экран с яблоками
│   ├── Level1Display.vue              # Квадрат-схема
│   ├── Level2Display.vue              # Текстовые метки
│   ├── Level3Display.vue              # Чистое уравнение
│   └── WholePartSquare.vue            # Переиспользуемый квадрат
│
├── utils/math/equationsWholePart/
│   ├── index.ts                       # Генератор задач
│   ├── __tests__/
│   │   └── index.test.ts              # Unit тесты
│   └── types.ts                       # Специфичные типы
│
├── views/
│   ├── EquationsWholePartLearningView.vue    # Обучение
│   ├── EquationsWholePartDiagnosticView.vue  # Диагностика
│   └── EquationsWholePartView.vue            # Тренировка
│
├── types/
│   └── index.ts                        # Добавить EquationWholePartProblem
│
├── store/
│   └── scores.ts                       # Добавить поля прогресса
│
└── router/
    └── index.ts                        # Добавить 3 роута
```

### 11.2 Добавление типов в src/types/index.ts

```typescript
// Добавить к существующим MathProblem интерфейсам
export interface EquationWholePartProblem extends MathProblem {
  equationType: 'unknownAddend' | 'unknownSubtrahend' | 'unknownMinuend';
  whole: number;           // Целое (сумма или уменьшаемое)
  knownPart: number;       // Известная часть
  unknownPart: number;     // Неизвестная часть (x)
  operation: '+' | '-';

  // Уровень поддержки
  supportLevel: 1 | 2 | 3;
}
```

### 11.3 Добавление роутов в src/router/index.ts

```typescript
// Добавить к существующим роутам
{
  path: '/equations-whole-part/learning',
  name: 'equationsWholePartLearning',
  component: () => import('@/views/EquationsWholePartLearningView.vue'),
  meta: { requiresAuth: false, exerciseType: 'equations-whole-part' }
},
{
  path: '/equations-whole-part/diagnostic',
  name: 'equationsWholePartDiagnostic',
  component: () => import('@/views/EquationsWholePartDiagnosticView.vue'),
  meta: { requiresAuth: false, exerciseType: 'equations-whole-part' }
},
{
  path: '/equations-whole-part',
  name: 'equationsWholePart',
  component: () => import('@/views/EquationsWholePartView.vue'),
  meta: { requiresAuth: false, exerciseType: 'equations-whole-part' }
}
```

### 11.4 Добавление полей в store (src/store/scores.ts)

```typescript
export const useScoresStore = defineStore('scores', {
  state: (): ScoresState => ({
    // ... существующие поля

    // Новые поля для equations-whole-part
    equationsWholePartScore: 0,
    equationsWholePartLearningCompleted: false,
    equationsWholePartDiagnosticPassed: false,
    equationsWholePartIntroShown: false,

    // Прогресс по уровням
    equationsWholePartLevel1Progress: { solved: 0, correct: 0, consecutiveErrors: 0 },
    equationsWholePartLevel2Progress: { solved: 0, correct: 0, consecutiveErrors: 0 },
    equationsWholePartLevel3Progress: { solved: 0, correct: 0, consecutiveErrors: 0 },
    equationsWholePartCurrentLevel: 1,
  }),

  actions: {
    // Существующие actions...

    updateEquationsWholePartScore(points: number): void {
      this.equationsWholePartScore += points;
      this.saveScores();
    },

    setEquationsWholePartLearningCompleted(completed: boolean): void {
      this.equationsWholePartLearningCompleted = completed;
      this.saveScores();
    },

    setEquationsWholePartDiagnosticPassed(passed: boolean): void {
      this.equationsWholePartDiagnosticPassed = passed;
      this.saveScores();
    },

    setEquationsWholePartIntroShown(shown: boolean): void {
      this.equationsWholePartIntroShown = shown;
      this.saveScores();
    },

    updateEquationsWholePartLevelProgress(level: 1 | 2 | 3, progress: LevelProgress): void {
      this[`equationsWholePartLevel${level}Progress`] = progress;
      this.saveScores();
    }
  }
});

// Добавить к интерфейсу ScoresState
export interface LevelProgress {
  solved: number;
  correct: number;
  consecutiveErrors: number;
}

export interface ScoresState {
  // ... существующие поля

  equationsWholePartScore: number;
  equationsWholePartLearningCompleted: boolean;
  equationsWholePartDiagnosticPassed: boolean;
  equationsWholePartIntroShown: boolean;
  equationsWholePartLevel1Progress: LevelProgress;
  equationsWholePartLevel2Progress: LevelProgress;
  equationsWholePartLevel3Progress: LevelProgress;
  equationsWholePartCurrentLevel: 1 | 2 | 3;
}
```

---

## 12. User Flow Requirements

### 12.1 Обязательный поток пользователя

```
                    ┌─────────────────┐
                    │   Главная page  │
                    │   (HomeView)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Intro Screen   │◄─────────────────┐
                    │  (Яблоки)       │                  │
                    └────────┬────────┘                  │
                             │                           │
                             ▼                           │
                    ┌─────────────────┐                  │
                    │   Обучение      │                  │
                    │   (Learning)    │                  │
                    └────────┬────────┘                  │
                             │                           │
                             ▼                           │
                    ┌─────────────────┐                  │
                    │   Диагностика   │                  │
                    │   (Diagnostic)  │                  │
                    └────────┬────────┘                  │
                             │                           │
                    ┌────────▼────────┐                  │
                    │   Пройдена?     │                  │
                    │   (≥5/10)       │                  │
                    └────────┬────────┘                  │
                      │             │                    │
                 Да   │             │   Нет              │
                      ▼             ▼                    │
              ┌──────────────┐  ┌──────────────┐        │
              │ Уровень 1    │  │   Результат  │        │
              │ (Квадрат)    │  │   (fail)     │        │
              └──────┬───────┘  └──────────────┘        │
                     │                                  │
                     ▼                                  │
              ┌──────────────┐                         │
              │  Условия L1   │                         │
              │  выполнены?   │                         │
              └──────┬───────┘                         │
                │           │                           │
            Да  │           │  Нет                      │
                ▼           ▼                           │
        ┌──────────┐  ┌──────────┐                    │
        │Уровень 2 │  │ Практика │                    │
        │(Метки)   │  │ ещё на L1│                    │
        └─────┬────┘  └──────────┘                    │
              │                                       │
              ▼                                       │
       ┌──────────────┐                               │
       │  Условия L2   │                               │
       │  выполнены?   │                               │
       └──────┬───────┘                               │
         │           │                                │
     Да  │           │  Нет                            │
         ▼           ▼                                 │
    ┌──────────┐  ┌──────────┐                       │
    │Уровень 3 │  │ Практика │                       │
    │(Чистое)  │  │ ещё на L2│                       │
    └──────────┘  └──────────┘                       │
                                                      │
         └────────────────────────────────────────────┘
```

**Правила:**
1. Intro показывается только один раз (первый запуск)
2. Обучение обязательно перед диагностикой
3. Диагностика проверяет готовность (порог: 5/10)
4. При неудаче предложить повторить обучение
5. Тренировка начинается с уровня 1
6. Автоматический переход L1→L2→L3 при выполнении условий

---

## 13. Testing Requirements

### 13.1 Unit тесты для генератора

```typescript
// src/utils/math/equationsWholePart/__tests__/index.test.ts

describe('generateEquationWholePartProblem', () => {
  it('генерирует корректную задачу типа unknownAddend', () => {
    const problem = generateEquationWholePartProblem(0, 1, { equationTypes: ['unknownAddend'] });
    expect(problem.equationType).toBe('unknownAddend');
    expect(problem.unknownPart + problem.knownPart).toBe(problem.whole);
  });

  it('генерирует корректную задачу типа unknownSubtrahend', () => {
    const problem = generateEquationWholePartProblem(0, 1, { equationTypes: ['unknownSubtrahend'] });
    expect(problem.equationType).toBe('unknownSubtrahend');
    expect(problem.whole - problem.unknownPart).toBe(problem.knownPart);
  });

  it('генерирует корректную задачу типа unknownMinuend', () => {
    const problem = generateEquationWholePartProblem(0, 1, { equationTypes: ['unknownMinuend'] });
    expect(problem.equationType).toBe('unknownMinuend');
    expect(problem.knownPart + problem.unknownPart).toBe(problem.whole);
  });

  it('генерирует 4 варианта ответа', () => {
    const problem = generateEquationWholePartProblem(0, 1);
    expect(problem.options).toHaveLength(4);
  });

  it('правильный ответ находится в вариантах', () => {
    const problem = generateEquationWholePartProblem(0, 1);
    expect(problem.options[problem.correctIndex]).toBe(problem.unknownPart.toString());
  });
});

describe('Инварианты', () => {
  it.each(Array.from({ length: 100 }, () => null))('результат всегда положительный', () => {
    const problem = generateEquationWholePartProblem(Math.random() * 1000, 1);
    expect(problem.unknownPart).toBeGreaterThanOrEqual(0);
  });

  it.each(Array.from({ length: 100 }, () => null))('результат меньше или равен 100', () => {
    const problem = generateEquationWholePartProblem(Math.random() * 1000, 1, { maxNumber: 100 });
    expect(problem.unknownPart).toBeLessThanOrEqual(100);
  });

  it.each(Array.from({ length: 100 }, () => null))('целое всегда больше или равно частей', () => {
    const problem = generateEquationWholePartProblem(Math.random() * 1000, 1);
    expect(problem.whole).toBeGreaterThanOrEqual(problem.knownPart);
    expect(problem.whole).toBeGreaterThanOrEqual(problem.unknownPart);
  });
});

describe('Edge cases', () => {
  it('работает с минимальными значениями', () => {
    const problem = generateEquationWholePartProblem(0, 1, { maxNumber: 2 });
    expect(problem.whole).toBeGreaterThanOrEqual(2);
  });

  it('работает с максимальными значениями', () => {
    const problem = generateEquationWholePartProblem(0, 1, { maxNumber: 100 });
    expect(problem.whole).toBeLessThanOrEqual(100);
  });

  it('не генерирует ноль в делителе (не применимо для сложения/вычитания)', () => {
    // Для сложения/вычитания этот тест не нужен
  });
});
```

### 13.2 Покрытие (Coverage)

- **Минимум:** 80% lines, 75% branches
- **Рекомендуется:** 90%+ lines, 85%+ branches
- **Функции:** 100%

### 13.3 Команды тестирования

```bash
# Запустить все тесты
npm test -- --run

# Запустить тесты equations-whole-part
npm test -- equationsWholePart --run

# Запустить с coverage
npm test -- --coverage

# Смотреть режим
npm test -- equationsWholePart
```

---

## 14. Risks & Mitigations (Риски и митигация)

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Дети не понимают связь уравнение ↔ схема | Средняя | Высокая | Обязательный intro с анимацией |
| Уровень 2 слишком сложный после уровня 1 | Средняя | Средняя | A/B тестирование условий перехода |
| Слишком много текста на экране | Низкая | Средняя | UX тестирование с детьми |
| Конфликт с существующим режимом подбора | Низкая | Низкая | Чёткое разделение в UI |
| Технические проблемы с производительностью | Низкая | Средняя | Использовать existing patterns |

---

## 15. Open Questions (Открытые вопросы)

| Вопрос | Статус | Владелец |
|--------|--------|------------
| Нужно ли сохранять прогресс каждого уровня отдельно? | Открыт | Product |
| Какой максимальный уровень ошибок для возвращения на L2? | Решено: 3 подряд | Product |
| Нужна ли статистика по типам ошибок? | Открыт | Analytics |
| Интегрировать ли с школьными классами? | Future | Product |

---

## 16. Success Criteria (Критерии успеха)

### 16.1 Technical Success Criteria

- [ ] Все FR P0 реализованы
- [ ] Test coverage ≥80%
- [ ] Нет критических багов (P0, P1)
- [ ] Время загрузки <2 сек
- [ ] Работает на мобильных устройствах

### 16.2 User Success Criteria

- [ ] ≥70% завершают обучение
- [ ] ≥65% проходят диагностику
- [ ] ≥60% переходят с L1 на L2
- [ ] ≥40% возвращаются на следующий день

### 16.3 Business Success Criteria

- [ ] Увеличение времени в приложении на 15%
- [ ] Увеличение количества решённых уравнений на 25%
- [ ] Положительные отзывы от родителей

---

## 17. Appendices (Приложения)

### 17.1 Glossary (Глоссарий)

| Термин | Определение |
|--------|-------------|
| Целое | Сумма частей или уменьшаемое в вычитании |
| Часть | Слагаемое в сложении, вычитаемое или разность в вычитании |
| Scaffolding | Система поддержек (уровней 1-2-3) для постепенного снятия поддержки |
| Уравнение | Равенство с неизвестным (x) |

### 17.2 References (Референсы)

- **Вычитание в столбик:** `src/views/ColumnSubtractionView.vue` — паттерн пошагового режима
- **Теория:** Scaffolding (леса) в обучении математике
- **Возрастная психология:** Переход от наглядно-образного к абстрактному мышлению (Пиаже, 7-11 лет)

---

## История изменений

| Версия | Дата | Изменение | Автор |
|--------|------|-----------|-------|
| 1.0 | 2026-02-10 | Первая версия PRD | Claude |

---

**Следующие шаги:**

1. ✅ Утвердить концепцию
2. ✅ Написать полный PRD
3. ⏳ Создать дизайн-макеты для всех трёх уровней
4. ⏳ Определить метрики успеха для A/B тестирования
5. ⏳ Начать Phase 1 реализации
