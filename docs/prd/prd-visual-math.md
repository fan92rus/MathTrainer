# PRD: Визуальная математика — DragonBox-стиль в упражнениях

> **Статус:** Draft | **AI-Optimized:** v1.0
> **Дата:** 05.06.2026 | **Приоритет:** P1 (после мотивационной системы)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Non-Goals](#4-non-goals)
5. [Design Principles](#5-design-principles)
6. [Architecture](#6-architecture)
7. [Functional Requirements](#7-functional-requirements)
8. [Implementation Plan](#8-implementation-plan)
9. [Testing Strategy](#9-testing-strategy)
10. [Risks & Mitigations](#10-risks--mitigations)

---

## 1. Executive Summary

### 1.1 Vision

Трансформировать упражнения MathTrainer из «реши примеры на экране» в **визуально-интерактивные опыты**, где математика — это сама игра, а не «ключ к награде». Вдохновлено DragonBox и исследованиями Habgood & Ainsworth (2011): внутренняя интеграция даёт **7x вовлечённость** и **лучшее усвоение** (58% vs 41%).

### 1.2 Подход

Не полная переделка (как DragonBox), а **пошаговое обогащение** существующих упражнений визуальными метафорами:

| Этап | Что | Для какого упражнения |
|---|---|---|
| V1 | Анимация переноса разряда | Сложение/вычитание столбиком |
| V2 | Уравнения как весы | Целое и части |
| V3 | Числовые блоки (песочница) | Общий режим исследования |

### 1.3 Научное обоснование

| Принцип | Исследование | Применение |
|---|---|---|
| Внутренняя интеграция | Habgood & Ainsworth (2011) | Математика = геймплей |
| Визуальные манипулятивы | DragonBox Numbers / Cuisenaire rods | Блоки как персонажи чисел |
| Мгновенная обратная связь | DragonBox case study | Анимация каждого действия |
| Нет штрафов за ошибки | Li et al. (2024) — компетентность | «Попробуй иначе» вместо «❌ неправильно» |
| Постепенное раскрытие | DragonBox Algebra | Картинки → картинки+цифры → только цифры |

---

## 2. Problem Statement

### 2.1 Текущее состояние упражнений

| Упражнение | Как выглядит | Проблема |
|---|---|---|
| Сложение столбиком | Цифры в сетке + ввод ответа | Не видно, **почему** переносится единица |
| Вычитание столбиком | Аналогично | Занимание из старшего разряда — «магия» для ребёнка |
| Уравнения (целое/части) | Яблоки + уравнение | Визуализация есть (AppleVisualization), но **оторвана** от ввода |
| Умножение | Таблица + выбор ответа | Механическое запоминание без понимания |

### 2.2 Проблема «шоколадная брокколи»

Сейчас: «реши примеры → получи награду» (город/монеты). По APA (2025) — это **самый рискованный** тип мотивации (ожидаемая, зависимая от выполнения награда подавляет внутреннюю мотивацию).

Цель: «поиграй с числами → пойми, как они работают → даже не заметишь, что учишься».

---

## 3. Goals & Success Metrics

### 3.1 Цели

| # | Цель | Метрика |
|---|---|---|
| G1 | Показать перенос разряда визуально | Анимация переноса при каждом сложении/вычитании |
| G2 | Показать уравнение как баланс | Визуальные весы вместо текстового уравнения |
| G3 | Уменьшить «страх ошибки» | Нет ❌, только подсветка «попробуй иначе» |
| G4 | Повысить вовлечённость | Время сессии +15% (сравнить до/после) |

### 3.2 Критерии приёмки

- [ ] При сложении 7+5 в столбик единица визуально «перепрыгивает» в десятки
- [ ] При вычитании 13–7 «занимание» десятка анимировано
- [ ] Уравнения показывают «весы» — баланс нарушен/восстановлен
- [ ] Нет красных крестиков — только нейтральная подсветка ошибки
- [ ] Существующие тесты продолжают проходить

---

## 4. Non-Goals

- ❌ Полная замена всех упражнений на DragonBox-стиль (слишком дорого для v1)
- ❌ RPG-элементы в упражнениях
- ❌ Генерация процедурного контента
- ❌ Песочница «Свободная игра» (отложена до v2)

---

## 5. Design Principles

### DP-1: Математика = действие

Каждое математическое действие (перенос, занимание, сокращение) — это **визуальное событие**, которое ребёнок видит, а не просто «правило из учебника».

### DP-2: Без штрафов за эксперименты

- Неправильный ответ → подсветка красным + «Попробуй ещё!» (не «❌ неправильно»)
- Нет жизней, нет «game over»
- Можно отменить последний шаг

### DP-3: Постепенное раскрытие

```
Уровень 1 (начало):  Полная визуализация (блоки, анимации, цвета)
Уровень 2 (средний): Визуализация + цифры рядом
Уровень 3 (продвинутый): Минимальная визуализация, больше цифр
```

Переход по прогрессу (score thresholds).

### DP-4: Существующий UI как основа

Не переписывать с нуля. **Обогащать** существующие компоненты (`InteractiveColumnDisplay`, `EquationDisplay` и т.д.) дополнительными визуальными слоями.

---

## 6. Architecture

### 6.1 Новые файлы

```
src/
├── components/
│   ├── visual-math/
│   │   ├── CarryIndicator.vue      # NEW — Анимация переноса единицы
│   │   ├── BorrowIndicator.vue     # NEW — Анимация заимствования десятка
│   │   ├── DigitBlock.vue          # NEW — Цифра как «блок» с анимацией
│   │   ├── BalanceBeam.vue         # NEW — Визуальные весы для уравнений
│   │   ├── BalancePan.vue          # NEW — Чаша весов
│   │   └── FriendlyFeedback.vue    # NEW — Дружелюбная обратная связь
│   └── columnSubtraction/
│       └── InteractiveColumnDisplay.vue  # MODIFY — добавить CarryIndicator/BorrowIndicator
├── composables/
│   ├── useCarryAnimation.ts        # NEW — Логика анимации переноса
│   └── useBalanceBeam.ts           # NEW — Логика весов для уравнений
└── types/
    └── visualMath.ts               # NEW — Типы для визуальной математики
```

### 6.2 Изменяемые файлы

```
src/
├── components/columnSubtraction/
│   ├── InteractiveColumnDisplay.vue  # Добавить CarryIndicator
│   └── ColumnDisplay.vue            # Добавить анимации
├── components/equationsWholePart/
│   ├── EquationDisplay.vue          # Добавить BalanceBeam
│   └── AppleVisualization.vue       # Связать с BalanceBeam
├── components/common/
│   └── AnswerOptions.vue            # Заменить ❌ на FriendlyFeedback
└── assets/css/main.css              # Добавить анимации
```

---

## 7. Functional Requirements

### 7.1 FR-V1: Визуализация переноса разряда (Сложение столбиком)

#### 7.1.1 CarryIndicator

При сложении в столбик, если сумма цифр ≥ 10, показывается анимация:

```
Шаг 1:   7          Шаг 2:   ¹          Шаг 3:   1
        +5                   7                  12
         —          →       +5          →        2
        ??                   —                   —
                             ??                  ??
```

**Визуально:**

1. Цифры 7 и 5 **подсвечиваются** (жёлтый)
2. Из их суммы «вылезает» маленькая единичка
3. Единичка **анимированно перепрыгивает** в следующий разряд (вверх и влево)
4. В текущем разряде остаётся **2** (подсвечивается зелёным)
5. Перенесённая единичка встаёт над следующим разрядом (уменьшается, становится серой)

#### 7.1.2 Компонент CarryIndicator

```vue
<!-- CarryIndicator.vue -->
<template>
  <Transition name="carry">
    <span v-if="carry > 0" class="carry-indicator">
      {{ carry }}
    </span>
  </Transition>
</template>
```

CSS-анимация `carry`:
- `enter`: `translateY(20px) scale(1.3)` → `translateY(0) scale(0.8)` + `opacity: 0 → 1`
- Duration: 400ms, easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` (пружина)

#### 7.1.3 Логика в composable

```typescript
// useCarryAnimation.ts
interface CarryStep {
  column: number        // Индекс разряда (0 = единицы)
  value: number         // Сумма в столбце
  carry: number         // Перенос ( Math.floor(sum / 10) )
  result: number        // Остаток ( sum % 10 )
}

function computeCarrySteps(topDigits: number[], bottomDigits: number[]): CarryStep[] {
  // Вычисляет все переносы для визуализации
}
```

#### 7.1.4 Интеграция

В `InteractiveColumnDisplay.vue` при каждом вводе цифры в разряд:

1. Вычислить `carrySteps` через `useCarryAnimation`
2. Если `carry > 0` → показать `CarryIndicator` над следующим разрядом
3. Анимировать «перепрыгивание»
4. Звук: лёгкий «прыжок» (использовать AudioManager)

### 7.2 FR-V2: Визуализация заимствования (Вычитание столбиком)

#### 7.2.1 BorrowIndicator

При вычитании, если верхняя цифра < нижней:

```
Шаг 1:   3          Шаг 2:  ²          Шаг 3:  2
        -7                  ¹³                 13
         —         →       -7         →        -7
        ??                   —                   —
                             ??                  6
```

**Визуально:**

1. Верхняя цифра **краснеет** (тревога — не хватает!)
2. Из старшего разряда «отрывается» **кусочек** (анимация уменьшения)
3. Кусочек **перелетает** в текущий разряд
4. Текущая цифра превращается: `3 → 13` (перечёркнутая 3, рядом 13)
5. В старшем разряде: цифра уменьшается на 1 (с анимацией)

#### 7.2.2 Визуальные элементы заимствования

```css
/* Зачёркнутая цифра (старое значение) */
.digit-crossed-out {
  position: relative;
  color: #aaa;
}
.digit-crossed-out::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background: #e74c3c;
  top: 50%;
  transform: rotate(-15deg);
}

/* Новое значение (рядом) */
.digit-new-value {
  color: #27ae60;
  font-weight: bold;
  animation: pop-in 0.3s ease;
}
```

### 7.3 FR-V3: Уравнения как весы (Balance Beam)

#### 7.3.1 Визуальная метафора

Уравнение `целое = часть1 + часть2` показывается как **весы**:

```
        ⚖️
    ┌────┴────┐
    │         │
  [ 12 ]   [ ? + 5 ]
```

- Левая чаша = целое (известно)
- Правая чаша = части (одна известна, одна нет)
- Весы **покачиваются** при вводе — визуальная проверка

#### 7.3.2 Компонент BalanceBeam

```vue
<!-- BalanceBeam.vue -->
<template>
  <div class="balance-beam">
    <div class="beam" :class="{ tilted: !isBalanced }">
      <BalancePan side="left" :value="leftValue" :label="leftLabel" />
      <div class="fulcrum">⚖️</div>
      <BalancePan side="right" :value="rightValue" :label="rightLabel" />
    </div>
  </div>
</template>
```

#### 7.3.3 Логика покачивания

```typescript
// useBalanceBeam.ts
const isBalanced = computed(() => leftValue.value === rightValue.value)
const tiltAngle = computed(() => {
  if (isBalanced.value) return 0
  const diff = rightValue.value - leftValue.value
  return Math.sign(diff) * Math.min(Math.abs(diff) * 2, 15) // градусы, макс 15°
})
```

- При каждом вводе → пересчёт → весы **плавно наклоняются** в сторону перевеса
- При правильном ответе → весы **выравниваются** + зелёная подсветка + звук «баланс»
- Нет «❌ неправильно» — весы просто показывают «ещё не сбалансировано»

#### 7.3.4 Связь с AppleVisualization

Сейчас `AppleVisualization.vue` показывает яблоки. Связать:

- Яблоки на **левой чаше** весов = целое
- Яблоки на **правой чаше** = известная часть + вводимая часть
- При вводе числа яблоки на правой чаше **появляются/исчезают** с анимацией

### 7.4 FR-V4: Дружелюбная обратная связь

#### 7.4.1 Замена ❌ на нейтральный фидбек

**Сейчас:**
```
[ 12 ] ← выбрал → ❌ Неверно!
```

**Стало:**
```
[ 12 ] ← выбрал → 💭 Попробуй ещё! (подсветка жёлтым, мягкая пульсация)
```

#### 7.4.2 Компонент FriendlyFeedback

```vue
<template>
  <Transition name="feedback">
    <div v-if="show" class="friendly-feedback" :class="type">
      <span class="icon">{{ type === 'success' ? '✨' : '💭' }}</span>
      <span class="text">{{ message }}</span>
    </div>
  </Transition>
</template>
```

Типы фидбека:
- `success`: «Отлично! ✨» — зелёная подсветка, 1.5 сек
- `try-again`: «Попробуй ещё 💭» — жёлтая пульсация, 2 сек
- `hint`: «Подсказка: посмотри на... 💡» — голубой, 3 сек (после 2 неудачных попыток)

#### 7.4.3 Подсказки после неудачи

После 2 неправильных попыток на одном примере:
1. Подсветить релевантную часть визуализации
2. Показать текстовую подсказку
3. НЕ давать ответ — пусть ребёнок сам дойдёт

---

## 8. Implementation Plan

### Фаза 1: Carry/Borrow анимации (3–4 часа)

| Задача | Файлы | ETA |
|---|---|---|
| T1.1 Создать `types/visualMath.ts` | `src/types/visualMath.ts` | 10 мин |
| T1.2 Создать `composables/useCarryAnimation.ts` | `src/composables/useCarryAnimation.ts` | 40 мин |
| T1.3 Создать `CarryIndicator.vue` | `src/components/visual-math/CarryIndicator.vue` | 45 мин |
| T1.4 Создать `BorrowIndicator.vue` | `src/components/visual-math/BorrowIndicator.vue` | 60 мин |
| T1.5 Создать `DigitBlock.vue` | `src/components/visual-math/DigitBlock.vue` | 30 мин |
| T1.6 Интегрировать в `InteractiveColumnDisplay` | `src/components/columnSubtraction/InteractiveColumnDisplay.vue` | 60 мин |
| T1.7 CSS-анимации переноса | `src/assets/css/main.css` | 30 мин |
| T1.8 Тесты useCarryAnimation | `src/composables/__tests__/useCarryAnimation.test.ts` | 30 мин |

### Фаза 2: Весы для уравнений (3–4 часа)

| Задача | Файлы | ETA |
|---|---|---|
| T2.1 Создать `composables/useBalanceBeam.ts` | `src/composables/useBalanceBeam.ts` | 30 мин |
| T2.2 Создать `BalancePan.vue` | `src/components/visual-math/BalancePan.vue` | 40 мин |
| T2.3 Создать `BalanceBeam.vue` | `src/components/visual-math/BalanceBeam.vue` | 60 мин |
| T2.4 Интегрировать в `EquationDisplay.vue` | `src/components/equationsWholePart/EquationDisplay.vue` | 45 мин |
| T2.5 Связать с `AppleVisualization` | `src/components/equationsWholePart/AppleVisualization.vue` | 45 мин |
| T2.6 CSS-анимации весов | `src/assets/css/main.css` | 30 мин |
| T2.7 Тесты useBalanceBeam | `src/composables/__tests__/useBalanceBeam.test.ts` | 20 мин |

### Фаза 3: Дружелюбный фидбек (1–2 часа)

| Задача | Файлы | ETA |
|---|---|---|
| T3.1 Создать `FriendlyFeedback.vue` | `src/components/visual-math/FriendlyFeedback.vue` | 30 мин |
| T3.2 Заменить ❌ в `AnswerOptions.vue` | `src/components/common/AnswerOptions.vue` | 20 мин |
| T3.3 Логика подсказок (после 2 неудач) | composable или store | 30 мин |
| T3.4 Звуковые эффекты (баланс, перенос) | `src/utils/audioManager.ts` | 20 мин |

### Фаза 4: Полировка (1–2 часа)

| Задача | ETA |
|---|---|
| T4.1 Проверить все разрешения экрана | 30 мин |
| T4.2 Тестирование с реальными детьми (если возможно) | 30 мин |
| T4.3 Настройка timing анимаций (не слишком быстро/медленно) | 20 мин |
| T4.4 prefers-reduced-motion — отключить анимации | 15 мин |

---

## 9. Testing Strategy

### 9.1 Unit-тесты

| Что | Кейс | Ожидание |
|---|---|---|
| `useCarryAnimation` | 7 + 5 | carry=1, result=2 |
| `useCarryAnimation` | 3 + 2 | carry=0, result=5 |
| `useCarryAnimation` | 9 + 9 | carry=1, result=8 |
| `useCarryAnimation` | Многозначный | 47 + 85 → carry cascade |
| `useBalanceBeam` | 12 = ? + 5, ввод 7 | isBalanced=true |
| `useBalanceBeam` | 12 = ? + 5, ввод 5 | isBalanced=false, tilt=-4° |

### 9.2 Component-тесты

| Компонент | Проверка |
|---|---|
| `CarryIndicator` | Появляется при carry > 0, анимация корректна |
| `BorrowIndicator` | «Зачёркивание» и новое значение видны |
| `BalanceBeam` | Покачивание при неравенстве, выравнивание при правильном ответе |
| `FriendlyFeedback` | «Попробуй ещё» вместо ❌ |

### 9.3 Визуальная регрессия

- Скриншоты до/после для `InteractiveColumnDisplay` и `EquationDisplay`
- Проверка на мобильных размерах (320px, 375px, 768px)

---

## 10. Risks & Mitigations

| Риск | Вероятность | Влияние | Митигация |
|---|---|---|---|
| Анимации замедляют процесс решения | Средняя | Среднее | `prefers-reduced-motion` + настройка timing (≤400ms) |
| Сложность каскадных переносов (999+1) | Средняя | Низкое | Ограничить визуализацию до 3 разрядов в v1 |
| Весы плохо работают на узких экранах | Средняя | Высокое | Адаптивная вёрстка: горизонтально на мобильных |
| Дети могут не заметить анимацию | Низкая | Среднее | Звуковые эффекты + цветовая подсветка как дополнение |
| Объём работы больше ожидаемого | Средняя | Среднее | Каждая фаза независима — можно релизить по частям |

---

## Приложение A: CSS-анимации — справочник

### Перенос единицы (carry-bounce)

```css
.carry-enter-active {
  animation: carry-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes carry-bounce {
  0%   { transform: translateY(20px) scale(1.4); opacity: 0; }
  50%  { transform: translateY(-5px) scale(0.9); opacity: 1; }
  100% { transform: translateY(0) scale(0.8); opacity: 0.85; }
}
```

### Покачивание весов (beam-tilt)

```css
.beam {
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: center top;
}
.beam.tilted {
  transform: rotate(var(--tilt-angle));
}
```

### Подсветка цифры (digit-highlight)

```css
.digit-highlight {
  animation: pulse-glow 0.8s ease;
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 rgba(52, 152, 219, 0); }
  50%      { box-shadow: 0 0 12px rgba(52, 152, 219, 0.6); }
}
```

### Уменьшение motion

```css
@media (prefers-reduced-motion: reduce) {
  .carry-enter-active,
  .digit-highlight {
    animation: none;
    transition: opacity 0.2s;
  }
  .beam {
    transition: none;
  }
}
```

---

## Приложение B: Примеры визуальных состояний

### Сложение 47 + 85 в столбик

```
Шаг 1: ввод единиц        Шаг 2: перенос            Шаг 3: итог
                                                            ¹
    4 7                      ¹                          1 ³²
  + 8 5       →            4 7         →             + 8 5
  ------                   + 8 5                       ------
                             ²                         1 3 2
```

- `¹` — маленькая единичка, анимированно перепрыгнула из разряда единиц
- `²` — результат в разряде единиц (подсветка зелёным)
- `³²` — результат в разряде десятков (каскадный перенос 4+8+1=13)

### Уравнение 12 = ? + 5 на весах

```
Ввод 3:                Ввод 7:
  ⚖️ (наклон ←)         ⚖️ (баланс!)
┌───┴───┐            ┌───┴───┐
│       │            │       │
[12]  [3+5]         [12]   [7+5]
              →
   «Попробуй ещё»     «Отлично! ✨»
```
