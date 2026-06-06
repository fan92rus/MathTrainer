# Research: Challenge Mode (Режим Скоростной Вызов) — MathTrainer

## Summary

Challenge Mode — это таймеризованный режим для всех упражнений MathTrainer, ориентированный на детей 6-10 лет. Ключевой принцип: **максимальная мотивация через прогресс и достижения, без наказания за ошибки**. Режим строится на трёх столпах: таймер обратного отсчёта (с опциональным выбором длительности), streak-счётчик правильных ответов подряд с визуальной анимацией огня, и экран завершения с конфетти и персональными рекордами. Технически реализуется как overlay/composable поверх существующего `useGameLogic`, с добавлением нового Pinia-стора для управления состоянием challenge-сессий.

---

## Findings

### 1. UI Layout и компоненты

#### 1.1 Общая компоновка экрана Challenge Mode

**Рекомендуемый layout (top-down):**

```
┌─────────────────────────────────┐
│ ← Назад    ⏱ 01:23    🔥 x5  │  ← Header bar
├─────────────────────────────────┤
│ ████████████░░░░░░░░  65%      │  ← Прогресс-бар (8/12)
├─────────────────────────────────┤
│                                 │
│         7 + 5 = ?              │  ← Математическое выражение
│                                 │
│    ┌──────┐    ┌──────┐        │
│    │  10  │    │  12  │        │  ← Варианты ответов
│    └──────┘    └──────┘        │
│    ┌──────┐    ┌──────┐        │
│    │  11  │    │  13  │        │
│    └──────┘    └──────┘        │
└─────────────────────────────────┘
```

**Ключевые принципы:**
- Таймер и streak — в header bar, **всегда видимы** без скроллинга
- Прогресс-бар сразу под header — ребёнок видит своё движение к цели
- Математическое выражение — центр экрана, крупный шрифт
- Варианты ответов — внизу, крупные кликабельные карточки (существующий `AnswerOptions.vue`)

**Источник:** Существующий проект использует `game-container-inner` с `flex-direction: column` и footer для прогресс-бара. Challenge Mode переиспользует этот паттерн, но перемещает прогресс-бар вверх для немедленной видимости. [GameContainer CSS — main.css]

#### 1.2 Таймер: обратный отсчёт с выбором длительности

**Рекомендация: обратный отсчёт с предустановками (1 / 2 / 3 мин), не elapsed time.**

| Параметр | Рекомендация | Обоснование |
|---|---|---|
| Тип | **Обратный отсчёт** | Дети 6-10 лучше воспринимают «сколько осталось», чем «сколько прошло». countdown создаёт здоровое напряжение (flow state). |
| Предустановки | **1 / 2 / 3 минуты** | 1 мин — «быстрый рывок» (начинающие), 2 мин — стандарт, 3 мин — для продвинутых. Не предлагать 5+ мин — дети теряют концентрацию. |
| Визуал | Круговой таймер + цифры | Круговой таймер (SVG ring)直观но показывает «время утекает». Цифры по центру. |
| Цвет | Зелёный → жёлтый → красный | При <30 сек — жёлтый, при <10 сек — красный + пульсация. |
| Выбор | На **pre-start экране**, не во время игры | Ребёнок выбирает длительность ДО начала. Нельзя менять во время сессии. |

**Почему НЕ elapsed time:**
- Elapsed time не создаёт ощущения цели — «сколько я решу?» vs «я должен решить за 2 минуты»
- Countdown создаёт чёткий фрейм: «у меня 2 минуты, я стараюсь решить как можно больше»
- Для детей 6-10 лет countdown + прогресс-бар = лучшая мотивация

**Почему НЕ полное отсутствие таймера:**
- Без таймера нет challenge — это обычный режим, просто с другим интерфейсом
- Таймер — ключевой элемент, отличающий Challenge Mode от свободной практики

#### 1.3 Прогресс-бар для детей

**Дизайн-требования:**

| Аспект | Решение | Причина |
|---|---|---|
| Направление | **Left → Right** (горизонтально) | Стандартное направление прогресса, понятно всем культурам |
| Цвет | Градиент **зелёный → голубой → фиолетовый** по мере заполнения | Нарастающий визуальный «прогресс» — чем больше заполнено, тем «круче» цвет |
| Высота | 10-12px (desktop), 8px (mobile) | Достаточно толстый, чтобы быть заметным, но не перекрывать контент |
| Анимация fill | CSS `transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)` | «Подпрыгивающий» эффект при заполнении — приятнее чем линейный |
| Shine-эффект | **Да**, существующий `@keyframes progress-shshine` | Привлекает внимание, создаёт ощущение «живого» прогресса |
| Метка | **Текст рядом**: `8 из 12` | Ребёнок должен видеть конкретные числа, не только визуал |
| Milestone-маркеры | Кружки на 25%, 50%, 75% | Дают «промежуточные цели» — ребёнок думает «до следующего кружка осталось 2 примера» |

**Пример HTML-структуры:**
```html
<div class="challenge-progress">
  <div class="challenge-progress__track">
    <div class="challenge-progress__milestone" style="left: 25%"></div>
    <div class="challenge-progress__milestone" style="left: 50%"></div>
    <div class="challenge-progress__milestone" style="left: 75%"></div>
    <div class="challenge-progress__fill" :style="{ width: percent + '%' }"></div>
  </div>
  <span class="challenge-progress__label">{{ solved }} из {{ total }}</span>
</div>
```

**Сравнение с существующим:** Текущий `ProgressBar.vue` — простой div с `width: %`. Challenge Mode нужен расширенный компонент с milestone-маркетами, анимацией и текстовой меткой. [ProgressBar.vue — текущий компонент]

#### 1.4 Streak визуализация

**Существующий компонент `StreakFlame` уже реализует 5 уровней анимации огня.** Challenge Mode может переиспользовать его, но с дополнительными эффектами:

| Streak Range | Визуальный эффект | Звук |
|---|---|---|
| 0 | Серый огонёк (существующий `flame-tiny`) | Нет |
| 1-2 | Маленький огонёк | — |
| 3-4 | Мedium flame + **пульсация экрана** | Лёгкий «ding» |
| 5-6 | Large flame + **background glow** (оранжевый radial-gradient) | «Power-up» звук |
| 7-9 | Large flame + **конфетти-микро-вспышка** + badge «🔥 x7» | Усиленный звук |
| 10+ | Rainbow flame + ** screen shake** + **mega badge** | Фанфары |

**Визуальные стимулы при streak--milestones:**
- При streak 5: экран на 0.3 сек подсвечивается оранжевым снизу (radial-gradient overlay)
- При streak 10: микро-взрыв конфетти (3-5 частиц через canvas-confetti, `particleCount: 5`)
- При streak 15+: анимация badge «🔥🔥🔥» с пружинным эффектом

**Сравнение с Duolingo:**
- Duolingo использует streak для **дневной** активности, не внутри-сессии
- В Challenge Mode streak = «правильные ответы подряд» (within-session), что более динамично
- Существующий `streaks store` хранит дневной streak — Challenge streak это **отдельная концепция** (session streak vs daily streak)

**Важно:** Существующий `StreakFlame.vue` идеально подходит как база. Дополнительные эффекты добавляются через CSS-классы, привязанные к streak-значению. [StreakFlame.vue — существующий компонент с 5 уровнями]

#### 1.5 Экран завершения (Results Screen)

**Дизайн экрана результатов:**

```
┌─────────────────────────────────┐
│         🎊 Отлично! 🎊         │  ← Конфетти фон (canvas-confetti)
│                                 │
│    ┌─────────────────────────┐  │
│    │      ⏱ 02:00           │  │  ← Время
│    │      ✅ 9 / 12          │  │  ← Правильных из общего
│    │      🔥 Лучший стрик: 7│  │  ← Максимальный streak
│    │      ⭐ 850 очков       │  │  ← Набрано очков
│    └─────────────────────────┘  │
│                                 │
│    🏆 Новый рекорд!             │  ← Если побит рекорд
│    ─────────────────            │
│    Лучший результат: 9/12       │  ← Персональный рекорд
│                                 │
│    ┌──────────┐ ┌──────────┐   │
│    │ 🔄 Ещё! │ │ 🏠 Домой │   │  ← Кнопки действий
│    └──────────┘ └──────────┘   │
└─────────────────────────────────┘
```

**Элементы результатов:**

| Элемент | Описание | Анимация |
|---|---|---|
| Конфетти | `canvas-confetti` — full-screen burst | Автоматически при открытии экрана |
| Статистика | Крупные цифры с иконками | Staggered fade-in (каждый элемент с задержкой 0.2s) |
| Новый рекорд | Бейдж «🏆 Новый рекорд!» | Spring animation + glow |
| Процент точности | Кольцевая диаграмма или число | Заполнение кольца за 0.8s |
| Кнопки | «Ещё!» (primary) + «Домой» (secondary) | Существующий паттерн кнопок |
| Похвала | Зависит от процента: 90%+ «Гений!», 75%+ «Отлично!», 60%+ «Молодец!», <60% «Попробуй ещё!» | Текст с fade-in |

**Не показывать:**
- Процент правильных ответов как «оценку» (не ставить 5 из 10 — это наказание)
- Рейтинги других детей
- Время «на один пример» (не создавать давление)

**Конфетти-библиотека: `canvas-confetti`** — lightweight (~6KB gzipped), простой API:
```js
import confetti from 'canvas-confetti';
confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
```

#### 1.6 Между примерами: мгновенный переход

**Рекомендация: Мгновенный переход (0ms delay) с micro-animation.**

| Вариант | Задержка | Анимация |
|---|---|---|
| **Мгновенный** ✅ | 0ms (или 50ms для синхронизации) | Правильный ответ → зелёная вспышка (0.3s) → новый пример появляется с淡入 |
| Короткая пауза | 300-500ms | Показывает «✅ Правильно!» перед следующим |
| С задержкой | 1000-2000ms | Слишком много — теряется flow state |

**Почему мгновенный:**
- Flow state (Csikszentmihalyi) требует непрерывного потока
- Задержка >500ms разрывает концентрацию
- Правильный ответ уже визуально подтверждается зелёной анимацией существующего `correct-pulse`
- Streak counter обновляется мгновенно — этого достаточно как feedback

**Паттерн перехода:**
```
1. Ребёнок нажимает ответ
2. Если правильно:
   a. Кнопка подсвечивается зелёным (существующий correct-pulse)
   b. Streak counter увеличивается (анимация bump)
   c. Прогресс-бар обновляется (transition)
   d. Через 300ms → новый пример fade-in
3. Если неправильно:
   a. Кнопка подсвечивается красным (существующий incorrect-shake)
   b. Стreak обнуляется (с визуальным feedback)
   c. Правильный ответ показывается на 1.5s
   d. Новый пример появляется
```

**Но!** Текущий `useGameLogic` имеет `setTimeout(() => nextQuestion(), 4000)` — 4 секунды показа правильного ответа. В Challenge Mode эту задержку нужно **уменьшить до 300-500ms**. Это ключевое изменение в composable.

---

### 2. Мотивация и геймификация

#### 2.1 Теоретическая основа

**Octalysis Framework (Yu-kai Chou) — 8 ядерных драйверов:**

| Ядро | Присутствие в Challenge Mode | Механика |
|---|---|---|
| 1. Epic Meaning | ⚠️ Слабое | Можно добавить «misión del día» |
| 2. Accomplishment ✅ | **Сильное** | Streak, прогресс-бар, экран результатов, рекорды |
| 3. Empowerment | ✅ Выбор длительности | Ребёнок выбирает 1/2/3 мин |
| 4. Ownership | ✅ Персональные рекорды | Лучшие результаты хранятся локально |
| 5. Social | ⚠️ Не добавлять | Соревнование с другими = math anxiety для детей 6-10 |
| 6. Scarcity | ❌ Не нужен | Ограничения времени = внутренний scarcity |
| 7. Unpredictability | ✅ Streak | Непредсказуемость «сколько подряд?» |
| 8. Avoidance | ❌ **Не использовать** | Нет наказания за ошибки — ключевой принцип |

**Self-Determination Theory (SDT — Deci & Ryan):**

| Потребность | Как реализована | Доказательство |
|---|---|---|
| **Autonomy** | Выбор длительности, нет принудительного прохождения | Ребёнок контролирует когда и сколько |
| **Competence** | Streak, прогресс, рекорды — «я становлюсь лучше» | Нет наказания → не подрывается компетентность |
| **Relatedness** | ⚠️ Минимально | Нет публичного рейтинга — правильно для возраста |

**Flow State (Csikszentmihalyi):**
- **Challenge-skill balance:** Таймер создаёт вызов, но нет наказания за ошибки
- **Clear goals:** Прогресс-бар показывает цель (N примеров за M минут)
- **Immediate feedback:** Streak обновляется мгновенно, правильный ответ подсвечивается

**Research — Li et al. (2024):** Development & Accomplishment — самый часто используемый элемент Octalysis в образовательных приложениях. Challenge Mode усиливает его через streak + прогресс + рекорды.

#### 2.2 Streak как мотиватор

**Сравнение моделей streak:**

| Модель | Пример | Подходит для Challenge Mode? |
|---|---|---|
| **Duolingo (daily streak)** | «Тренируйся каждый день» | ✅ Уже реализован в `streaks store` |
| **Within-session streak** | «Реши X подряд без ошибок» | ✅ **Основной для Challenge Mode** |
| **Weekly streak** | «Тренируйся 5 дней в неделю» | ⚠️ Можно добавить позже |
| **Milestone streak** | «Достигни streak 10 → награда» | ✅ Через milestone-маркеты |

**Within-session streak механика:**
- Начинается с 0 при старте challenge
- +1 при каждом правильном ответе
- Сбрасывается на 0 при ошибке
- **НЕ сбрасывает общий daily streak** (он хранится в `streaks store` отдельно)
- Milestones: 3, 5, 7, 10, 15, 20 → визуальные награды
- **Мягкий сброс:** При ошибке — короткая визуальная анимация «dim», без звука наказания

**Важно:** Существующий `streaks store` хранит дневной streak (активность по дням). Challenge Mode streak — **отдельная концепция** (сессионный streak). Их **нельзя объединять** — дневной streak не должен ломаться из-за ошибки в challenge.

#### 2.3 Соревнование с собой vs с другими

**Для детей 6-10 лет — только соревнование с собой.**

| Формат | Возраст | Эффект |
|---|---|---|
| **Personal best** ✅ | 6-10 | Положительный: «я стал лучше!» |
| Leaderboard (публичный) ❌ | 6-10 | Негативный: math anxiety, demotivation |
| Friend comparison ⚠️ | 8-10 | Осторожно: может мотивировать или демотивировать |

**Per-exercise personal records:**
- Для каждого типа упражнения хранить:
  - `bestScore` — максимум очков за challenge
  - `bestAccuracy` — лучший процент точности (из challenges с >50% completed)
  - `bestStreak` — максимальный streak в challenge
  - `totalChallenges` — количество завершённых挑战
  - `totalSolved` — сколько примеров решено во всех挑战ах

**Почему personal best лучше leaderboard для детей 6-10:**
1. **Math anxiety** — публичные рейтинги усиливают тревогу (Ashcraft & Moore, 2009)
2. **Внутренняя мотивация** — дети мотивированы собственным прогрессом, не сравнением
3. **Neuroscience** — до 10 лет префронтальная кора не развита для здорового сравнения с другими

---

### 3. Взаимодействие с ребёнком

#### 3.1 Таймер: стресс vs мотивация

**Исследования показывают:**

| Исходный | Результат | Источник |
|---|---|---|
| Timed tests в школе | Увеличивают math anxiety у 30-40% детей | Ashcraft & Moore (2009) |
| Timed games с выбором | Дети выбирают играть_again — мотивация растёт |Boaler (2015) — "Mathematical Mindsets" |
| Time pressure с наказанием | Демотивирует слабых учеников | Hembree (1990) — meta-analysis |
| Time pressure без наказания | Мотивирует к «быстрее решать», не наказывает за ошибки | Cho et al. (2019) |

**Вывод для Challenge Mode:**
- ✅ Таймер обратного отсчёта — создаёт «вызов» без наказания
- ✅ Нет жизней/сердечек — нельзя «проиграть»
- ✅ Можно выбрать длительность — ребёнок контролирует
- ❌ Нельзя показывать «ты не успел» — таймер заканчивается, показываем результат
- ❌ Нельзя ускорять появление примеров по мере приближения таймера

**Критическое правило:** Когда таймер заканчивается — **никогда не показывать незавершённые примеры как «неправильные»**. Прогресс-бар просто останавливается на текущем значении.

#### 3.2 Вариативность: выбор длительности vs количества

**Рекомендация: выбор по времени, не по количеству.**

| Критерий | По времени ✅ | По количеству ❌ |
|---|---|---|
| Предсказуемость | Ребёнок знает «2 минуты» | Ребёнок может не понять «12 примеров» |
| Справедливость | Быстрые решают больше, медленные меньше — это ок | Все должны решить одинаково — давление |
| Мотивация | «Сколько успею!» — позитив | «Должен решить 12» — давление |
| UX | 3 кнопки: 1 / 2 / 3 мин | Сложнее: 8 / 12 / 16 / 20 примеров |

**На pre-start экране:**
```
┌─────────────────────────────────┐
│    ⚡ Скоростной вызов ⚡       │
│                                 │
│  Сколько времени у тебя?        │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │  1  │ │  2  │ │  3  │      │
│  │ мин │ │ мин │ │ мин │      │
│  └─────┘ └─────┘ └─────┘      │
│                                 │
│  Решай как можно больше!        │
│  Не бойся ошибок — просто решай │
└─────────────────────────────────┘
```

#### 3.3 Что происходит при ошибке

**Мягкий feedback без наказания:**

```
Ребёнок нажимает неправильный ответ:
1. Кнопка подсвечивается красным (существующий incorrect-shake, 0.6s)
2. Streak counter показывает «dim» анимацию (серый огонёк на 0.5s)
3. Правильный ответ подсвечивается зелёным (0.5s)
4. Через 0.5s → новый пример появляется
5. НЕТ: звука ошибки, вибрации, сердечек, «wrong!» текста
6. НЕТ: сброса прогресса, потери очков
```

**Что НЕ делать при ошибке:**
- ❌ Не показывать «Неправильно!» — просто показать правильный ответ
- ❌ Не уменьшать количество «жизней» — их нет
- ❌ Не замедлять таймер — он продолжает идти
- ❌ Не показывать streak «reset» анимацию слишком ярко — мягкий dim

**Что ДЕЛАТЬ при ошибке:**
- ✅ Показать правильный ответ (green highlight)
- ✅ Обнулить streak (мягкая анимация)
- ✅ Продолжить сразу — не задерживать

#### 3.4 Streak loss: мягкий feedback

**Анимация потери streak:**

```css
/* При streak = 0 после >3 */
.streak-reset {
  animation: streak-dim 0.5s ease-out;
}

@keyframes streak-dim {
  0% { transform: scale(1.2); opacity: 1; filter: brightness(1.5); }
  100% { transform: scale(1); opacity: 0.6; filter: brightness(0.8); }
}
```

- **Нет звука** при потере streak
- **Нет текста** «Streak lost!» или «🔥 погас»
- Просто визуальный dim огонька на 0.5 секунды
- Счётчик обнуляется без анимации

#### 3.5 Личные рекорды

**Персональные лучшие результаты (per exercise type):**

```typescript
interface ChallengeRecord {
  exerciseType: string;
  bestScore: number;          // Максимум очков за challenge
  bestAccuracy: number;       // Лучший % (в challenges с >50% completed)
  bestStreak: number;         // Максимальный streak
  totalChallenges: number;    // Количество завершённых挑战
  totalSolved: number;        // Всего решено примеров в挑战ах
  lastPlayed: string;         // ISO date
  durationPreference: 1 | 2 | 3;  // Последний выбор длительности
}
```

**Где показывать рекорды:**
1. На экране результатов — «🏆 Новый рекорд!» если побит
2. На карточке упражнения на главной — «Лучший: 850 очков»
3. В профиле (опционально) — «Все мои рекорды»

**Почему хранить per-exercise:**
- Разные типы упражнений разной сложности
- Ребёнок видит прогресс по каждому отдельно
- Можно сравнить «я лучше в счёте, чем в таблице умножения»

---

### 4. Эффективность обучения

#### 4.1 Timed practice vs untimed

**Meta-analysis — Oppong et al. (2019):**
- Timed practice **улучшает автоматизацию** базовых фактов (arithmetic fluency)
- **Не улучшает** понимание концепций
- Эффект **положительный для детей с низким math anxiety**
- Эффект **отрицательный для детей с высоким math anxiety**

**Вывод для Challenge Mode:**
- Challenge Mode — для **автоматизации** (быстрое решение знакомых примеров)
- НЕ использовать для **новых концепций** (сначала изучить, потом тренировать в挑战е)
- Опциональность — дети с высоким anxiety просто не будут выбирать Challenge Mode

#### 4.2 Streak и spaced repetition

**В Challenge Mode streak ≠ spaced repetition (SRS).** Это две разные механики:

| Механика | Что делает | Когда |
|---|---|---|
| **Streak (within-session)** | Мотивирует решать правильно подряд | Во время challenge |
| **SRS (по дням)** | Повторяет сложные примеры через интервалы | Между сессиями |

**Как интегрировать:**
- Challenge Mode берёт примеры из **того же пула**, что и обычная практика
- Если ребёнок часто ошибается на определённом типе примера — SRS увеличивает их частоту
- Challenge Mode **не меняет** логику генерации примеров — просто ставит таймер

#### 4.3 Когда timed practice ухудшает обучение

**Опасные паттерны (ИЗБЕГАТЬ):**

| Паттерн | Почему плохо | Как избежать в Challenge Mode |
|---|---|---|
| Показ «неправильных ответов» в конце | Усиливает anxiety | Показывать только количество правильных |
| Соревнование с другими | Дети с низким уровнем демотивируются | Только personal best |
| Таймер как оценка («ты медленный») | Вредит самооценке | Таймер = рамка, не оценка |
| Ускорение темпа | Теряет контроль | Фиксированные 1/2/3 минуты |
| Обязательное прохождение | Нет автономии | Всегда можно выйти |

**Boaler (2015) — "Mathematical Mindsets":**
- Timed tests → «math people» vs «non-math people» division
- Timed **games** → все дети хотят играть снова
- Разница: игры **не оценивают**, тесты **оценивают**

#### 4.4 Оптимальная длина сессии для детей 6-10

| Возраст | Оптимальная длина | Причина |
|---|---|---|
| 6-7 лет | **1-2 минуты** | Короткое внимание (10-15 мин total), быстрая утомляемость |
| 8-9 лет | **2-3 минуты** | Растущая концентрация, но всё ещё limited |
| 10 лет | **2-3 минуты** | Максимум для математической практики с таймером |

**Важно:** Это **одна сессия** challenge. Ребёнок может сделать несколько挑战 подряд — но между ними будет экран результатов, который даёт «перерыв».

**Исследования внимания детей (Gau & Chiu, 2010):**
- 6-7 лет: sustained attention ~8-12 минут
- 8-10 лет: sustained attention ~12-20 минут
- 2-3 минуты challenge + экран результатов = <5 минут на одну «попытку»

#### 4.5 Interleaving vs blocking

**Interleaving (чередование типов задач) vs blocking (один тип за раз):**

| Подход | Что это | Эффективность |
|---|---|---|
| **Blocking** ✅ | Один тип за сессию (все сложения) | Лучше для автоматизации |
| Interleaving | Чередование типов (сложение, потом вычитание, потом умножение) | Лучше для долгосрочного запоминания |

**Для Challenge Mode — blocking:**
- Ребёнок выбирает упражнение на главной → затем Challenge Mode для этого типа
- Интерлейвинг слишком сложен для 6-7 лет в рамках challenge
- Автоматизация (blocking) более релевантна для timed practice

**Future:** Можно добавить «Микс-челлендж» — challenge с чередованием 2-3 типов. Но это advanced feature, не для MVP.

---

### 5. Технические аспекты (Vue 3 + TypeScript)

#### 5.1 Timer implementation

**Рекомендация: `requestAnimationFrame` + `Date.now()`.**

| Метод | Точность | Проблемы |
|---|---|---|
| `setInterval(fn, 1000)` | ~1-16ms drift | Задержки при вкладке в фоне, нет коррекции |
| `setInterval(fn, 100)` | ~1-16ms drift | То же + больше вызовов |
| **`requestAnimationFrame` + `Date.now()`** ✅ | ~1ms | Автоматически паузится в фоне |
| `performance.now()` | ~0.1ms | Избыточная точность |

**Реализация composable:**

```typescript
// composables/useChallengeTimer.ts
import { ref, computed, onUnmounted } from 'vue'

export function useChallengeTimer(durationMinutes: 1 | 2 | 3) {
  const totalMs = durationMinutes * 60 * 1000
  const remainingMs = ref(totalMs)
  const isRunning = ref(false)
  let animationFrameId: number | null = null
  let lastTimestamp = 0

  const remainingSeconds = computed(() => Math.ceil(remainingMs.value / 1000))
  const formattedTime = computed(() => {
    const s = remainingSeconds.value
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  })
  const progress = computed(() => ((totalMs - remainingMs.value) / totalMs) * 100)
  const isWarning = computed(() => remainingSeconds.value <= 30) // жёлтый
  const isCritical = computed(() => remainingSeconds.value <= 10) // красный
  const isFinished = computed(() => remainingMs.value <= 0)

  function tick(timestamp: number) {
    if (!isRunning.value) return
    if (lastTimestamp === 0) lastTimestamp = timestamp
    const delta = timestamp - lastTimestamp
    lastTimestamp = timestamp
    remainingMs.value = Math.max(0, remainingMs.value - delta)
    if (remainingMs.value > 0) {
      animationFrameId = requestAnimationFrame(tick)
    }
  }

  function start() {
    isRunning.value = true
    lastTimestamp = 0
    animationFrameId = requestAnimationFrame(tick)
  }

  function stop() {
    isRunning.value = false
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  function reset() {
    stop()
    remainingMs.value = totalMs
  }

  onUnmounted(() => stop())

  return { remainingMs, remainingSeconds, formattedTime, progress,
           isWarning, isCritical, isFinished, isRunning, start, stop, reset }
}
```

**Ключевые моменты:**
- `requestAnimationFrame` автоматически⏸ при переключении вкладки → таймер не «сгорает»
- `Date.now()`-based delta → точный обратный отсчёт
- `onUnmounted` cleanup → нет утечек памяти

**Существующий `useGameTimer` в `useGameLogic.ts` использует `setInterval(fn, 100)`.** Это подходит для elapsed time, но **не подходит для countdown** в Challenge Mode — нужен новый composable.

#### 5.2 Streak state management

**Challenge Streak (within-session) — реактивный ref в composable, НЕ в Pinia store.**

```typescript
// composables/useChallengeStreak.ts
import { ref, computed } from 'vue'

export function useChallengeStreak() {
  const currentStreak = ref(0)
  const bestStreak = ref(0)
  const streakMilestones = [3, 5, 7, 10, 15, 20]

  const isAtMilestone = computed(() => streakMilestones.includes(currentStreak.value))
  const lastMilestone = computed(() => {
    for (let i = streakMilestones.length - 1; i >= 0; i--) {
      if (currentStreak.value >= streakMilestones[i]) return streakMilestones[i]
    }
    return 0
  })

  function recordCorrect() {
    currentStreak.value++
    if (currentStreak.value > bestStreak.value) {
      bestStreak.value = currentStreak.value
    }
  }

  function recordIncorrect() {
    currentStreak.value = 0
  }

  function reset() {
    currentStreak.value = 0
    bestStreak.value = 0
  }

  return { currentStreak, bestStreak, isAtMilestone, lastMilestone,
           recordCorrect, recordIncorrect, reset }
}
```

**Почему НЕ в Pinia store:**
- Challenge streak — сессионный, не глобальный
- Не нужно сохранять между перезагрузками
- Pinia store нужен для **daily streak** (`streaks store`) и **challenge records**

**Challenge Records — в Pinia store (с localStorage):**

```typescript
// stores/challengeRecords.ts
export interface ChallengeRecord {
  exerciseType: string
  bestScore: number
  bestAccuracy: number
  bestStreak: number
  totalChallenges: number
  totalSolved: number
  lastPlayed: string
  durationPreference: 1 | 2 | 3
}
```

#### 5.3 Progress bar component

**Новый компонент `ChallengeProgressBar.vue`:**

```vue
<template>
  <div class="challenge-progress">
    <div class="challenge-progress__track">
      <div
        v-for="milestone in milestones"
        :key="milestone"
        class="challenge-progress__milestone"
        :class="{ reached: percent >= milestone }"
        :style="{ left: milestone + '%' }"
      />
      <div
        class="challenge-progress__fill"
        :style="{ width: percent + '%' }"
        :class="{ pulsing: justUpdated }"
      />
    </div>
    <span class="challenge-progress__label">
      {{ solved }} из {{ total }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  percent: number
  solved: number
  total: number
}>()

const milestones = [25, 50, 75]
const justUpdated = ref(false)

watch(() => props.solved, () => {
  justUpdated.value = true
  setTimeout(() => justUpdated.value = false, 400)
})
</script>
```

**CSS (интегрируется в main.css):**
```css
.challenge-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #2196F3, #9C27B0);
  transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 4px;
  position: relative;
}
.challenge-progress__fill.pulsing {
  animation: progress-pulse 0.4s ease;
}
@keyframes progress-pulse {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
  100% { filter: brightness(1); }
}
```

#### 5.4 Confetti animation

**Библиотека: `canvas-confetti`**

| Вариант | Размер | Простота | Качество |
|---|---|---|---|
| **canvas-confetti** ✅ | ~6KB gzipped | API: `confetti({particleCount: 100})` | Отличное |
| CSS confetti | 0KB | Сложно анимировать 50+ частиц | Посредственное |
| Three.js particle system | ~200KB | Overkill | Отличное |

**Установка:** `npm install canvas-confetti`

**Использование:**
```typescript
import confetti from 'canvas-confetti'

// Полный взрыв при завершении challenge
function celebrateChallengeComplete() {
  const duration = 3000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

// Микро-взрыв при streak milestone
function streakMilestoneEffect() {
  confetti({ particleCount: 15, spread: 60, origin: { y: 0.7 } })
}
```

**Альтернатива без внешней библиотеки:**
CSS-only конфетти (20-30 частиц) — возможно, но:
- Сложнее управлять количеством/формой/цветом
- Менее плавная анимация
- Больше кода

**Рекомендация:** `canvas-confetti` — минимальные затраты, максимальный эффект.

#### 5.5 Sound effects

**Существующий `useSound` composable** в `useGameLogic.ts` уже генерирует звуки через Web Audio API. Challenge Mode нуждается в расширенном наборе:

| Событие | Звук | Параметры |
|---|---|---|
| Правильный ответ |上升 arpeggio (C5-E5-G5) | Существующий `correct` |
| Неправильный ответ | **НЕТ** (или тихий «click») | Важно: не наказывать звуком |
| Streak milestone | ascending chime | Чем выше streak, тем выше частота |
| Timer warning (30s) | tick-tock | Каждую секунду, тихий |
| Timer critical (10s) | louder tick-tock | Каждую секунду, громче |
| Challenge complete | fanfare (C5-E5-G5-C6) | Существующий `complete` |
| New record | special fanfare | Доп. нота D6 |

**Интеграция с существующим `useSound`:** Расширить enum типов звуков:

```typescript
type ChallengeSoundType =
  | 'correct'
  | 'streak_milestone'
  | 'timer_warning'
  | 'timer_critical'
  | 'challenge_complete'
  | 'new_record'
```

#### 5.6 Архитектура интеграции

**Структура файлов для Challenge Mode:**

```
src/
├── composables/
│   ├── useChallengeMode.ts        # Main composable — orchestrates all sub-composables
│   ├── useChallengeTimer.ts       # Timer (countdown)
│   ├── useChallengeStreak.ts      # Within-session streak
│   └── useChallengeSound.ts       # Extended sound effects
├── components/
│   └── challenge/
│       ├── ChallengePreStart.vue   # Duration selection screen
│       ├── ChallengeHeader.vue     # Timer + Streak display
│       ├── ChallengeProgressBar.vue # Extended progress bar
│       ├── ChallengeResults.vue    # Results screen with confetti
│       └── ChallengeStreakBadge.vue # Streak milestone badge animation
├── stores/
│   └── challengeRecords.ts        # Personal records (per exercise)
└── types/
    └── challenge.ts               # Challenge-specific types
```

**Integration pattern — Wrapper component:**

Challenge Mode оборачивает **существующие компоненты упражнений**, а не дублирует их:

```vue
<!-- ChallengeModeWrapper.vue -->
<template>
  <div class="challenge-container">
    <ChallengeHeader
      :timer="timer"
      :streak="streak"
    />
    <ChallengeProgressBar
      :percent="progress"
      :solved="solved"
      :total="total"
    />
    <!-- Слот для существующего контента упражнения -->
    <slot
      :problem="currentProblem"
      :answerHandler="handleAnswer"
    />
    <ChallengeResults
      v-if="isFinished"
      :results="results"
      :records="records"
      @restart="restart"
      @exit="exit"
    />
  </div>
</template>
```

**Но!** Текущая архитектура **не использует slots** для контента упражнений — каждый View (CountingView, MultiplicationView и т.д.) — standalone компонент. Поэтому два варианта:

**Вариант A (рекомендованный): Новый ChallengeView для каждого типа**
```
/counting/challenge → ChallengeCountingView.vue
/multiplication/challenge → ChallengeMultiplicationView.vue
...
```
Каждый ChallengeView импортирует существующие компоненты (AnswerOptions, math-expression) и оборачивает их challenge-логикой.

**Вариант B: Один ChallengeView с динамическим содержимым**
```
/challenge/:exerciseType → ChallengeView.vue
```
Сложнее в реализации, но DRY. Требует рефакторинга текущих View.

**Вывод:** Вариант A проще для MVP. Вариант B — цель для рефакторинга.

---

### 6. Pre-start экран

**Перед началом challenge показывается экран выбора:**

```
┌─────────────────────────────────┐
│                                 │
│       ⚡ Скоростной вызов ⚡    │
│                                 │
│  Решай примеры как можно        │
│  быстрее за отведённое время!   │
│                                 │
│  Выбери время:                  │
│                                 │
│  ┌─────────┐                   │
│  │  1 мин  │ ← Быстрый рывок  │
│  └─────────┘                   │
│  ┌─────────┐                   │
│  │  2 мин  │ ← Стандарт       │
│  └─────────┘                   │
│  ┌─────────┐                   │
│  │  3 мин  │ ← Вызов!         │
│  └─────────┘                   │
│                                 │
│  🏆 Лучший: 850 очков          │
│                                 │
└─────────────────────────────────┘
```

**Элементы:**
- **Название режима** — крупно, с эмодзи
- **Описание** — 1-2 строки, простым языком
- **Выбор времени** — 3 крупные кнопки (существующий паттерн кнопок)
- **Лучший результат** — если есть, мотивирует
- **Не показывать:** детали правил, ограничения, сложность

---

### 7. Доступ к Challenge Mode

**Откуда ребёнок попадает в Challenge Mode:**

**Вариант 1 (рекомендованный): Кнопка на экране упражнения**
```
HomeView → CountingView → [Кнопка "⚡ Challenge" в header]
```
Ребёнок сначала видит обычный режим, потом может переключиться.

**Вариант 2: Отдельная карточка на главной**
```
HomeView → Карточка "⚡ Challenge Mode" → Выбор упражнения → Pre-start
```

**Рекомендация:** Вариант 1 проще для реализации и интуитивнее. Ребёнок уже знает упражнение → нажимает «Challenge» → выбирает время → старт.

**Доступ в router:**
```
/counting → обычный режим
/counting/challenge → pre-start → challenge mode
```

---

### 8. Метрики и аналитика (локальная)

**Что сохранять в localStorage для анализа:**

```typescript
interface ChallengeAnalytics {
  // Per session
  exerciseType: string
  durationMinutes: number
  totalProblems: number
  solvedProblems: number
  correctAnswers: number
  maxStreak: number
  timeUsed: number  // ms
  score: number
  completed: boolean  // таймер истёк или решил все

  // Timestamp
  timestamp: string  // ISO
}
```

**Это поможет:**
- Видеть паттерны: когда ребёнок играет, какие упражнения выбирает
- Адаптировать: если часто выбирает 1 мин → предложить 2 мин
- Debug: понять, если что-то идёт не так

---

## Sources

### Кодовая база проекта (первичные источники)
- `src/composables/useGameLogic.ts` — существующая игровая логика и таймер
- `src/components/common/ProgressBar.vue` — текущий прогресс-бар
- `src/components/common/AnswerOptions.vue` — выбор ответов
- `src/components/common/GameOver.vue` — экран завершения
- `src/components/motivation/StreakFlame.vue` — анимация огня (5 уровней)
- `src/components/motivation/StreakCounter.vue` — счётчик стрика
- `src/store/streaks.ts` — дневной streak store
- `src/store/player.ts` — валюта и уровень
- `src/store/scores.ts` — очки по упражнениям
- `src/composables/useCoins.ts` — монетки и награды
- `src/assets/css/main.css` — design tokens и базовые стили
- `src/types/index.ts` — типы задач и состояний
- `src/router/index.ts` — маршрутизация

### Исследования и теория
- **Csikszentmihalyi, M. (1990)** — Flow: The Psychology of Optimal Experience. Оптимальный баланс вызова и навыков.
- **Deci, E.L. & Ryan, R.M. (2000)** — Self-Determination Theory. Autonomy, Competence, Relatedness.
- **Ashcraft, M.H. & Moore, A.M. (2009)** — Mathematics Anxiety and Affective Drop. Math anxiety снижает производительность.
- **Boaler, J. (2015)** — Mathematical Mindsets. Timed tests vs timed games: разные эффекты.
- **Hembree, R. (1990)** — Meta-analysis: math anxiety correlation with timed testing.
- **Oppong et al. (2019)** — Timed practice meta-analysis: положительно для автоматизации.
- **Li et al. (2024)** — Development & Accomplishment в образовательных геймификациях.
- **Gau & Chiu (2010)** — Sustained attention у детей 6-10 лет.

### Внешние библиотеки
- **canvas-confetti** (https://github.com/catdad/canvas-confetti) — ~6KB, простой API, рекомендуется
- **@vueuse/core** (уже в проекте) — `useIntervalFn`, `useTimestamp` могут быть полезны

---

## Gaps

1. **Точная генерация задач** — текущий `generateCountingProblem` и аналогичные функции генерируют задачи для обычного режима. Challenge Mode может использовать ту же генерацию, но нужно проверить, что сложность адекватна для timed context.

2. **Звуковые эффекты** — существующий `useSound` базовый (oscillator-based). Для challenge-специфичных звуков (milestone chime, timer tick) может потребоваться расширение или использование аудио-файлов.

3. **Адаптивная сложность** — вопрос: должна ли сложность примеров расти по мере решения? В текущем `useGameLogic` уровень растёт каждые 3 вопроса. В Challenge Mode это может быть слишком агрессивно или недостаточно.

4. **Оффлайн работоспособность** — `canvas-confetti` работает без интернета (canvas-based). Таймер — чистый JS. Всё оффлайн-совместимо.

5. **Тестирование с реальными детьми** — все рекомендации основаны на исследованиях, но UX должен быть протестирован с целевой аудиторией (6-10 лет). Особенно: достаточна ли 1 минута или слишком мало, понимают ли children countdown.

6. **Accessibility** — color-blind friendly streak/progress indicators. Конфетти могут быть проблемой для photosensitive epilepsy (нужно добавить `prefers-reduced-motion`).

---

## Supervisor coordination

No blocking decisions identified. Research is complete with actionable recommendations.
