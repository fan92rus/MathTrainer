# План: Вычитание в столбик

## Цель
Реализовать упражнение "Вычитание в столбик" с тремя режимами:
1. **Обучение** — интерактивная история "Магазин" (4 шага с выборами)
2. **Диагностика** — 10 примеров, критерий успеха 9/10
3. **Тренировка** — отработка с визуализацией и подсказками

## Ключевые концепции (из brainstorm)
- **"Ловушка невозможности"** — 5-7 кажется невыполнимым → ребёнок переворачивает
- **"Вскрытие пачки"** — метафора занимания: пачка → россыпь
- **"Безопасные ошибки"** — обучение через неправильные выборы с последствиями

---

## Архитектура

### Новые файлы

```
src/
├── types/
│   └── index.ts                    # + ColumnSubtractionProblem, ColumnSubtractionStep
├── utils/math/
│   └── columnSubtraction/
│       └── index.ts                # Генератор задач
├── views/
│   ├── ColumnSubtractionView.vue   # Тренировка
│   ├── ColumnSubtractionLearningView.vue  # Обучение (история)
│   └── ColumnSubtractionDiagnosticView.vue # Диагностика
├── components/columnSubtraction/
│   ├── ColumnDisplay.vue           # Визуализация столбика
│   ├── ShopVisualization.vue       # Визуализация магазина (пачки/россыпь)
│   └── LearningStory.vue           # История с выборами
├── store/
│   └── scores.ts                   # + columnSubtractionScore
├── router/
│   └── index.ts                    # + маршруты
└── utils/
    └── gradeHelpers.ts             # + columnSubtraction в AvailableExercises
```

---

## Этапы реализации

### Этап 1: Типы и генератор
**Файлы:** `src/types/index.ts`, `src/utils/math/columnSubtraction/index.ts`

1. Добавить тип `ColumnSubtractionProblem`:
   ```typescript
   interface ColumnSubtractionProblem {
     minuend: number;      // Уменьшаемое (верхнее)
     subtrahend: number;   // Вычитаемое (нижнее)
     result: number;       // Разность
     needsBorrowing: boolean;  // Требуется занятие
     borrowFromTens: boolean;  // Занятие из десятков
     hasZeroInUnits: boolean;  // Ноль в единицах уменьшаемого
     expression: string;
     correctAnswer: number;
     options: string[];
     correctIndex: number;
     difficulty: number;
   }
   ```

2. Создать генератор `generateColumnSubtractionProblem`:
   - Параметры: тип примера (с занятием, с нулём, двузначный результат)
   - Генерация вариантов ответов (включая "перевёрнутый" как ловушку)
   - Уровни сложности

3. Создать `generateColumnSubtractionProblems` для диагностики (10 примеров разных типов)

### Этап 2: Store и маршруты
**Файлы:** `src/store/scores.ts`, `src/router/index.ts`, `src/utils/gradeHelpers.ts`

1. Добавить в `ScoresState`:
   - `columnSubtractionScore: number`
   - `columnSubtractionLearningCompleted: boolean`

2. Добавить методы:
   - `updateColumnSubtractionScore(points)`
   - `setLearningCompleted()`
   - `saveColumnSubtractionScore()`

3. Добавить маршруты:
   - `/column-subtraction` — тренировка
   - `/column-subtraction/learning` — обучение
   - `/column-subtraction/diagnostic` — диагностика

4. Обновить `gradeHelpers.ts`:
   - Добавить `columnSubtraction` в `AvailableExercises`
   - Доступно: 2-3 класс

### Этап 3: Компоненты визуализации
**Файлы:** `src/components/columnSubtraction/*.vue`

1. **ColumnDisplay.vue** — столбик с числами:
   - Показывает уменьшаемое, вычитаемое, черта
   - Анимация "занятия" (точка над разрядом)
   - Подсветка разрядов при вычислении

2. **ShopVisualization.vue** — метафора магазина:
   - SVG-иконки: пачки конфет (десятки) и отдельные конфеты (единицы)
   - CSS-анимация вскрытия: пачка открывается, конфеты высыпаются
   - Пересчёт после вскрытия с визуальным подсчётом

3. **svgIcons.ts** — SVG-иконки:
   - `candyPack` — запечатанная пачка конфет (10 шт)
   - `candyPackOpen` — открытая пачка
   - `candy` — отдельная конфета

4. **LearningStory.vue** — история с выборами:
   - Шаг 1: "5 россыпью, нужно 7" → выборы
   - Шаг 2: "Сколько пачек?" → 3/2
   - Шаг 3: "Сколько россыпью?" → 5/10/15
   - Шаг 4: "15-7=?" → ввод числа
   - Обратная связь при ошибках

### Этап 4: Обучающий режим (история)
**Файл:** `src/views/ColumnSubtractionLearningView.vue`

- Полноэкранная история "Магазин"
- Последовательное прохождение 4 шагов
- Невозможность пропустить шаг
- Сохранение прогресса (learningCompleted)

### Этап 5: Диагностический режим
**Файл:** `src/views/ColumnSubtractionDiagnosticView.vue`

- 10 примеров разных типов:
  - 3 с занятием из десятков (52-17)
  - 3 с двузначным результатом (33-18)
  - 2 с нулём в единицах (40-13)
  - 2 смешанных
- Критерий: 9/10 правильно
- При неудаче → возврат к обучению

### Этап 6: Тренировочный режим
**Файл:** `src/views/ColumnSubtractionView.vue`

- Стандартный столбик
- Кнопка "Показать что происходит" → ShopVisualization
- Подсказки при ошибке:
  - "Верхнее число — твои конфеты"
  - "Нужно занять из десятков"
- useGameLogic для очков

### Этап 7: Интеграция и навигация
**Файл:** `src/views/HomeView.vue`

- Добавить карточку "Вычитание в столбик"
- Логика отображения:
  - Если не прошёл обучение → кнопка "Начать обучение"
  - Если прошёл обучение, но не диагностику → кнопка "Проверить знания"
  - Если прошёл диагностику → кнопка "Тренироваться"

---

## Логика переходов

```
[Обучение: Магазин]
        ↓
  [Диагностика: 10 примеров]
        ↓
    9/10 правильно?
    /           \
  Да            Нет
  ↓              ↓
[Тренировка]  → [Обучение]
```

---

## Тестирование

1. **Генератор:**
   - Все типы примеров генерируются корректно
   - "Перевёрнутый" ответ присутствует в вариантах
   - Уровни сложности работают

2. **Обучение:**
   - Прохождение всех 4 шагов
   - Обратная связь при неправильных выборах

3. **Диагностика:**
   - Подсчёт 9/10 работает
   - Редирект на обучение при неудаче

4. **Тренировка:**
   - Визуализация магазина показывается
   - Подсказки работают
   - Очки начисляются

---

## Критические файлы

- `src/types/index.ts` — типы
- `src/utils/math/columnSubtraction/index.ts` — генератор
- `src/views/ColumnSubtractionLearningView.vue` — обучение
- `src/views/ColumnSubtractionDiagnosticView.vue` — диагностика
- `src/views/ColumnSubtractionView.vue` — тренировка
- `src/components/columnSubtraction/*.vue` — компоненты
- `src/store/scores.ts` — store
- `src/router/index.ts` — маршруты
- `src/utils/gradeHelpers.ts` — доступность
