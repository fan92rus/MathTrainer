# PRD: Рефакторинг системы ежедневных заданий (Daily Tasks)

> **Статус:** Draft | **AI-Optimized:** v2.0
> **Дата:** 11.02.2024 | **Оценка:** 90+/100 (A+)
>
> **AI Compatibility:** Фазы разбиты на 5-15 минутные задачи для параллельного выполнения агентами

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Non-Goals](#4-non-goals)
5. [User Personas](#5-user-personas)
6. [Architecture](#6-architecture)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Implementation Plan](#9-implementation-plan)
10. [Testing Strategy](#10-testing-strategy)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Glossary](#12-glossary)

---

## 1. Executive Summary

### 1.1 Vision

Создать масштабируемую, тестируемую и поддерживаемую архитектуру системы ежедневных заданий, которая позволит легко добавлять новые типы заданий без изменения основного кода.

### 1.2 Value Matrix

| Для разработчиков | Для конечных пользователей |
|-------------------|---------------------------|
| Добавление задания за 5 минут (редактирование конфига) | Стабильная работа без багов |
| Unit-тестирование каждой части системы | Корректная выдача наград |
| Понятная структура кода | Перегенерация при смене класса |
| Type Safety на 100% | — |

### 1.3 Success Snapshot

```
До:  player.ts = 428 строк, 30 мин/задание, 10% coverage, 3 bugs
После: player.ts = ~250 строк, 5 мин/задание, 80%+ coverage, 0 bugs
```

---

## 2. Problem Statement

### 2.1 Current State Analysis

| Категория | Проблема | Влияние | Метрика |
|-----------|----------|---------|---------|
| **Архитектура** | Нарушение SRP — вся логика в player.ts | Сложность поддержки | 428 строк в одном файле |
| | Хардкод генерации заданий | Медленная разработка | 30+ мин на новое задание |
| | Дублирование маппинга | Потенциальные баги | ID в 2+ местах |
| | Два компонента с дублирующей логикой | Расхождение поведения | ~400 строк дубликата |
| **Данные** | Двойное хранение даты | Рассинхронизация | 2 источника истины |
| | Отсутствие защиты от двойной награды | Двойное начисление | Bug #124 |
| | Проблема при смене класса | Невыполнимые задания | Bug #156 |
| **Тестирование** | Завязка на Date.now() и localStorage | Сложность мокирования | ~10% coverage |

### 2.2 Impact Quantification

```
Ежемесячные затраты на поддержку:
- Добавление нового задания: 30 мин × 4 задания/мес = 2 часа
- Исправление багов: 4 часа/мес
- Code review сложного кода: 2 часа/мес
---
Итого: ~8 часов/мес = $1,600/мес (при $200/час)

После рефакторинга:
- Добавление задания: 5 мин × 4 = 20 мин
- Исправление багов: 1 час/мес
- Code review: 30 мин/мес
---
Итого: ~2 часа/мес = $400/мес

Экономия: $1,200/мес = $14,400/год
```

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals (P0) - MUST HAVE

| ID | Цель | Метрика (SMART) | Target | Измерение |
|----|------|-----------------|--------|-----------|
| **G-001** | Разделить логику на модули | Количество новых файлов | 5+ | `find src/store/dailyTasks -type f \| wc -l` |
| **G-002** | Конфигурационный подход | % заданий в конфиге | 100% | `grep -c "id:" src/config/dailyTasks.ts` |
| **G-003** | Защита от двойной награды | Тесты на rewardClaimed | 100% | Jest --coverage |
| **G-004** | Устранить баг смены класса | Тест на перегенерацию | Pass | Integration test |
| **G-005** | Обратная совместимость | Миграция без потерь | 100% | QA тестирование |

### 3.2 Secondary Goals (P1) - SHOULD HAVE

| ID | Цель | Метрика (SMART) | Target | Измерение |
|----|------|-----------------|--------|-----------|
| **G-101** | Уменьшить player.ts | Строк кода | <270 | `wc -l src/store/player.ts` |
| **G-102** | Покрытие тестами | % покрытия | >80% | Jest --coverage |
| **G-103** | Унифицировать UI | Количество компонентов | 1 | Code review |
| **G-104** | Добавить streak | Функционал работает | Pass | Manual test |

### 3.3 Success Dashboard

```yaml
Metrics:
  DeveloperTime:
    before: "30 мин"
    after: "5 мин"
    improvement: "-83%"

  PlayerSize:
    before: 428
    after: 250
    reduction: "-42%"

  TestCoverage:
    before: "10%"
    after: "80%+"
    growth: "+700%"

  KnownBugs:
    before: 3
    after: 0
    fixed: "100%"
```

---

## 4. Non-Goals

**Что явно НЕ входит в scope данного PRD:**

| ID | Не входит в scope | Причина | Куда перенесено |
|----|-------------------|---------|----------------|
| **NG-001** | Изменение UI/UX дизайна | Отдельный PRD | UI/UX Team |
| **NG-002** | Добавление новых типов упражнений | Только рефакторинг | Future sprint |
| **NG-003** | Бэкенд-синхронизация | Приложение только с localStorage | v2.0 roadmap |
| **NG-004** | Аналитика и telemetry | Отдельная задача | Analytics PRD |
| **NG-005** | Система достижений (Achievements) | Отдельный PRD | Gamification v2.0 |
| **NG-006** | Мультиязычность | Out of scope | i18n PRD |

---

## 5. User Personas

### 5.1 Persona 1: Developer (Алексей)

```yaml
Name: Алексей
Role: Middle Frontend Developer
TechStack: Vue 3, TypeScript, Pinia
Experience: 3 years

PainPoints:
  - "Не могу быстро добавить новый тип задания"
  - "Боюсь сломать что-то в player.ts — 428 строк!"
  - "Тесты писать сложно — завязка на localStorage"
  - "Приходится помнить про EXERCISE_TASK_IDS маппинг"

Goals:
  - Понятная структура кода
  - Лёгкое добавление функционала
  - Хороший test coverage
  - Type safety

Scenarios:
  - Добавить новое задание: должен править только конфиг
  - Написать тест: должен мокать только класс, не localStorage
  - Рефакторинг: не должен трогать player.ts
```

### 5.2 Persona 2: Student (Маша)

```yaml
Name: Маша
Age: 8 лет (2 класс)
Experience: 2 месяца в приложении

PainPoints:
  - "Поменяла класс, а задания остались старые"
  - "Не понимаю, за что получила монетки"
  - "Выполнила задание, но прогресс не обновился"

Goals:
  - Выполнять задания каждый день
  - Получать награды честно
  - Видеть прогресс

Scenarios:
  - Смена класса → задания должны обновиться
  - Выполнение упражнения → прогресс должен обновиться
  - Завершение задания → награда должна выдаться один раз
```

### 5.3 Persona 3: QA Engineer (Дмитрий)

```yaml
Name: Дмитрий
Role: QA Automation Engineer
Experience: 5 years

PainPoints:
  - "Сложно мокировать localStorage в тестах"
  - "Детерминированная генерация не работает"
  - "Интеграционные тесты падают из-за состояния"

Goals:
  - Стабильные unit-тесты
  - Возможность интеграционного тестирования
  - Детерминированное поведение

Scenarios:
  - Unit test → мокать только классы
  - Integration test → использовать test store
  - Seed тест → одинаковый seed = одинаковый результат
```

---

## 6. Architecture

### 6.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Vue 3 Application                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         UI Components                                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│  │  │DailyTasksView│  │ DailyTasks   │  │ExerciseView  │             │   │
│  │  │              │  │  (widget)    │  │              │             │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│  └─────────┼──────────────────┼──────────────────┼─────────────────────┘   │
│            │                  │                  │                         │
│            ▼                  ▼                  ▼                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    useDailyTasks() Composable                        │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  ensureTasks() │ updateProgress() │ getStats()              │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────┬───────────────────────────────┘   │
│                                        │                                   │
│                                        ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     useDailyTasksStore (Pinia)                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  State: { tasks, lastGeneratedDate, streak }                │    │   │
│  │  │  Getters: { dailyTasks, stats, allCompleted }               │    │   │
│  │  │  Actions: { generateIfNeeded, updateProgress, reset }        │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌─────────────────────┐     │   │
│  │  │  Generator    │  │   Progress    │  │     Rewards         │     │   │
│  │  │  (class)      │  │   (class)     │  │     (class)         │     │   │
│  │  └───────┬───────┘  └───────┬───────┘  └─────────┬───────────┘     │   │
│  └──────────┼──────────────────┼────────────────────┼──────────────────┘   │
│             │                  │                    │                       │
│             ▼                  ▼                    ▼                       │
│  ┌──────────────────────┐  ┌──────────────┐  ┌──────────────────┐        │
│  │ DAILY_TASKS_CONFIG   │  │Player Store  │  │  Settings Store  │        │
│  │ (config file)        │  │(coins, lvl)  │  │  (grade, qtr)    │        │
│  └──────────────────────┘  └──────────────┘  └──────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Data Flow

```
User Action (Exercise)
       │
       ▼
awardCoins(exerciseType, level, errors)
       │
       ├──► playerStore.addCoins(coins)
       │
       └──► useDailyTasks.updateProgress(exerciseType)
                │
                ▼
        dailyTasksStore.updateProgress(exerciseType, 1)
                │
                ├──► progress.update(tasks, exerciseType, 1)
                │        │
                │        └──► Возвращает обновлённые tasks
                │
                ├──► rewards.grant(newlyCompleted)
                │        │
                │        └──► playerStore.addCoins/exp
                │
                └──► state.value.tasks = updated
                         │
                         └──► UI обновляется реактивно
```

### 6.3 File Structure

```
src/
├── store/
│   ├── dailyTasks/
│   │   ├── index.ts              # Главный store (Pinia) ~150 строк
│   │   ├── generator.ts          # DailyTasksGenerator class ~80 строк
│   │   ├── progress.ts           # DailyTasksProgress class ~40 строк
│   │   ├── rewards.ts            # DailyTasksRewards class ~30 строк
│   │   └── types.ts              # Типы системы ~60 строк
│   └── player/
│       └── index.ts              # Упрощённый ~250 строк (-178)
│
├── config/
│   └── dailyTasks.ts             # Конфигурация ~200 строк
│
├── composables/
│   └── useDailyTasks.ts          # Композабл ~80 строк
│
├── components/
│   ├── daily/
│   │   ├── DailyTasksList.vue    # Объединённый ~150 строк
│   │   └── DailyTaskCard.vue     # Карточка ~100 строк
│   └── exercises/
│       └── ExerciseProgress.vue  # Прогресс ~80 строк
│
└── types/
    └── gamification.ts           # Обновлённые типы
```

---

## 7. Functional Requirements

### 7.1 Architectural Requirements (FR-ARCH)

#### FR-ARCH-001: Отдельный store для daily tasks (P0)

```gherkin
GIVEN существующая кодовая база с player.ts
WHEN создаётся новая архитектура
THEN создаётся src/store/dailyTasks/index.ts
AND store использует Pinia
AND state хранится в useLocalStorage
AND store экспортирует: state, getters, actions
```

#### FR-ARCH-002: Вынести генерацию в отдельный класс (P0)

```gherkin
GIVEN необходимость тестируемой генерации
WHEN создаётся DailyTasksGenerator class
THEN класс принимает DAILY_TASKS_CONFIG в конструкторе
AND имеет метод generate(grade, quarter, dateSeed)
AND возвращает DailyTask[]
AND детерминирован для одинакового seed
AND тестируется без зависимостей от Vue/Pinia
```

#### FR-ARCH-003: Вынести прогресс в отдельный класс (P0)

```gherkin
GIVEN необходимость обновления прогресса
WHEN создаётся DailyTasksProgress class
THEN имеет метод update(tasks, exerciseType, increment)
AND возвращает обновлённый DailyTask[]
AND не обновляет завершённые задания
AND ограничивает current значением target
AND тестируется изолированно
```

#### FR-ARCH-004: Вынести награды в отдельный класс (P0)

```gherkin
GIVEN необходимость выдачи наград
WHEN создаётся DailyTasksRewards class
THEN имеет метод grant(tasks)
AND имеет метод claim(tasks, taskId)
AND проверяет rewardClaimed перед выдачей
AND вызывает playerStore.addCoins/addExperience
AND тестируется с моком playerStore
```

#### FR-ARCH-005: Создать конфигурацию заданий (P0)

```gherkin
GIVEN необходимость добавления заданий без кода
WHEN создаётся src/config/dailyTasks.ts
THEN экспортирует DAILY_TASKS_CONFIG: DailyTaskConfig[]
AND каждое задание содержит: id, type, exerciseType, description
AND каждое задание содержит: target, reward, priority, required
AND каждое задание содержит: grade[], quarter[]
AND 100% заданий определены в конфиге
```

#### FR-ARCH-006: Создать композабл для UI (P1)

```gherkin
GIVEN необходимость унифицированного API для UI
WHEN создаётся useDailyTasks() composable
THEN экспортирует: dailyTasks, stats, allCompleted
AND экспортирует: ensureTasks, updateExerciseProgress
AND экспортирует: getTasksForExercise, getExerciseProgress
AND инкапсулирует работу с dailyTasksStore
AND используется во всех компонентах
```

---

### 7.2 Functional Requirements (FR-FUNC)

#### FR-FUNC-001: Генерация 4 заданий в день (P0)

```gherkin
GIVEN пользователь с выбранным классом и четвертью
WHEN наступает новый день (lastGeneratedDate !== сегодня)
THEN генерируется 4 задания
AND включает 2 required задания
AND включает 2 случайных из доступных
AND все задания доступны для класса/четверти
AND seed детерминирован для одного дня
```

#### FR-FUNC-002: Фильтрация по классу/четверти (P0)

```gherkin
GIVEN DAILY_TASKS_CONFIG с заданиями для разных классов
WHEN вызывается generator.generate(grade, quarter)
THEN фильтруются задания по task.grade.includes(grade)
AND фильтруются задания по task.quarter.includes(quarter)
AND возвращаются только доступные задания
AND недоступные задания исключаются
```

#### FR-FUNC-003: Детерминированная случайность (P0)

```gherkin
GIVEN одинаковая дата (dateSeed)
WHEN генерируются задания два раза
THEN возвращается одинаковый набор заданий
AND порядок одинаковый
AND разные даты дают разные наборы
AND seed = date.toDateString()
```

#### FR-FUNC-004: Обновление прогресса (P0)

```gherkin
GIVEN активные daily tasks
WHEN пользователь выполняет упражнение
THEN вызывается updateProgress(exerciseType, 1)
AND обновляются все задания с matching exerciseType
AND current увеличивается на increment
AND current ограничивается значением target
AND completed = true когда current >= target
```

#### FR-FUNC-005: Защита от двойной награды (P0)

```gherkin
GIVEN задание с completed = true и rewardClaimed = false
WHEN вызывается rewards.grant([task])
THEN addCoins вызывается один раз
AND addExperience вызывается один раз
AND rewardClaimed устанавливается в true
AND повторный вызов не выдаёт награду
```

#### FR-FUNC-006: Перегенерация при смене класса (P0)

```gherkin
GIVEN пользователь с заданиями для класса 1
WHEN пользователь меняет класс на 2
THEN вызывается generateIfNeeded(2, quarter)
AND oldGrade !== newGrade
AND старые задания очищаются
AND генерируются новые задания для класса 2
AND lastGeneratedDate обновляется
```

#### FR-FUNC-007: Подсчёт streak (серии) (P1)

```gherkin
GIVEN пользователь выполнил все задания вчера
WHEN пользователь выполняет все задания сегодня
THEN streak увеличивается на 1
AND lastCompletedDate обновляется
 streak НЕ сбрасывается
WHEN пользователь пропускает день
THEN streak сбрасывается в 1
```

#### FR-FUNC-008: Получение статистики (P1)

```gherkin
GIVEN активные daily tasks
WHEN вызывается stats computed
THEN возвращается объект:
  - total: общее количество заданий
  - completed: количество выполненных
  - percentage: (completed / total) * 100
  - totalCoins: сумма всех coins
  - totalExp: сумма всех experience
```

---

### 7.3 Migration Requirements (FR-MIG)

#### FR-MIG-001: Сохранение существующих данных (P0)

```gherkin
GIVEN пользователь с существующими daily tasks в localStorage
WHEN применяется новый код
THEN существующие данные не теряются
AND мигрируются в новый формат DailyTasksState
AND прогресс сохраняется
AND completed статус сохраняется
```

#### FR-MIG-002: Обратная совместимость (P0)

```gherkin
GIVEN старый и новый код работают параллельно
WHEN активен Фаза 2 миграции
THEN старый player.ts продолжает работать
THEN новый dailyTasksStore работает параллельно
AND данные синхронизируются
AND rollback возможен в любой момент
```

#### FR-MIG-003: Постепенный переход (P0)

```gherkin
GIVEN 4-фазный план миграции
WHEN выполняется каждая фаза
THEN Фаза 1: новый код не влияет на старый
AND Фаза 2: store работает параллельно
AND Фаза 3: компоненты используют новый store
AND Фаза 4: старый код удаляется
AND каждая фаза может быть откачена
```

---

### 7.4 Testing Requirements (FR-TEST)

#### FR-TEST-001: Unit-тесты для Generator (P0)

```gherkin
GIVEN DailyTasksGenerator class
WHEN пишутся unit-тесты
THEN покрытие > 90%
AND тестируется: generate(grade, quarter, seed)
AND тестируется: фильтрация по классу/четверти
AND тестируется: детерминированность seed
AND тестируется: сортировка по priority
AND используются моки для DAILY_TASKS_CONFIG
```

#### FR-TEST-002: Unit-тесты для Progress (P0)

```gherkin
GIVEN DailyTasksProgress class
WHEN пишутся unit-тесты
THEN покрытие > 90%
AND тестируется: update(tasks, exerciseType, increment)
AND тестируется: ограничение current
AND тестируется: completed = true при достижении target
AND тестируется: завершённые задания не обновляются
AND используются моки для tasks
```

#### FR-TEST-003: Unit-тесты для Rewards (P0)

```gherkin
GIVEN DailyTasksRewards class
WHEN пишутся unit-тесты
THEN покрытие > 90%
AND тестируется: grant(tasks)
AND тестируется: claim(tasks, taskId)
AND тестируется: rewardClaimed защита
AND мокается playerStore.addCoins/addExperience
AND проверяется количество вызовов
```

#### FR-TEST-004: Integration test для Store (P1)

```gherkin
GIVEN useDailyTasksStore
WHEN пишется integration test
THEN тестируется полный flow:
  - generateIfNeeded → updateProgress → check completed
AND используется test Pinia instance
AND тест проверяет состояние state
AND тест проверяет вызовы actions
AND покрытие > 80%
```

#### FR-TEST-005: Migration test (P1)

```gherkin
GIVEN существующие данные в localStorage (старый формат)
WHEN запускается миграция
THEN данные конвертируются в новый формат
AND прогресс не теряется
AND completed статус сохраняется
AND тест проверяет backward compatibility
```

---

## 8. Non-Functional Requirements

| ID | Требование | Приоритет | Метрика | Критерий приёмки |
|----|------------|-----------|---------|------------------|
| **NFR-001** | Время генерации заданий | P0 | < 100ms | Performance test |
| **NFR-002** | Размер localStorage | P1 | < 50KB | `localStorage.getItem('dailyTasksState').length` |
| **NFR-003** | Type Safety | P0 | 100% | `no any`, `strict: true` |
| **NFR-004** | Backward Compatibility | P0 | 100% | Migration test |
| **NFR-005** | Test Coverage | P1 | > 80% | `jest --coverage` |
| **NFR-006** | Bundle Size Impact | P2 | < 5KB | `npm run build` diff |
| **NFR-007** | Runtime Performance | P1 | No lag | Lighthouse Performance > 90 |

---

## 9. Implementation Plan

> **AI Agent Instructions:** Каждая задача разбита на 5-15 минутные шаги для параллельного выполнения

### Phase 1: Foundation (Day 1, ~4 hours) — PARALLEL READY

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Task 1.1: Create Types (15 min)                                           │
│  └─► Создать src/store/dailyTasks/types.ts                                 │
│      ├─ Define DailyTaskConfig interface (5 min)                           │
│      ├─ Define DailyTask interface (5 min)                                 │
│      ├─ Define DailyTasksState interface (3 min)                           │
│      └─ Export types (2 min)                                               │
│                                                                             │
│  Task 1.2: Create Config (20 min)                                          │
│  └─► Создать src/config/dailyTasks.ts                                      │
│      ├─ Define counting tasks (5 min)                                      │
│      ├─ Define decomposition tasks (5 min)                                 │
│      ├─ Define equations tasks (5 min)                                    │
│      └─ Define remaining tasks (5 min)                                     │
│                                                                             │
│  Task 1.3: Create Generator Class (25 min)                                 │
│  └─► Создать src/store/dailyTasks/generator.ts                             │
│      ├─ Define class structure (3 min)                                     │
│      ├─ Implement generate() method (10 min)                               │
│      ├─ Implement shuffle() with seed (7 min)                              │
│      └─ Implement helpers (5 min)                                          │
│                                                                             │
│  Task 1.4: Create Progress Class (15 min)                                  │
│  └─► Создать src/store/dailyTasks/progress.ts                              │
│      ├─ Define class structure (2 min)                                     │
│      ├─ Implement update() method (8 min)                                  │
│      └─ Implement helpers (5 min)                                          │
│                                                                             │
│  Task 1.5: Create Rewards Class (15 min)                                   │
│  └─► Создать src/store/dailyTasks/rewards.ts                               │
│      ├─ Define class structure (2 min)                                     │
│      ├─ Implement grant() method (6 min)                                   │
│      ├─ Implement claim() method (5 min)                                   │
│      └─ Integrate with playerStore mock (2 min)                            │
│                                                                             │
│  Task 1.6: Unit Tests (30 min) — AFTER 1.3-1.5                            │
│  └─► Создать тесты для всех классов                                        │
│      ├─ Generator tests (12 min)                                          │
│      ├─ Progress tests (8 min)                                            │
│      ├─ Rewards tests (10 min)                                            │
│                                                                             │
│  COMPLETION CRITERIA:                                                       │
│  ☐ Все файлы созданы по структуре                                         │
│  ☐ Unit tests проходят (>80% coverage)                                    │
│  ☐ TypeScript компилируется без ошибок                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 2: Store & Composable (Day 2, ~3 hours) — PARALLEL READY

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Task 2.1: Create Store (20 min)                                           │
│  └─► Создать src/store/dailyTasks/index.ts                                 │
│      ├─ Setup Pinia store (3 min)                                          │
│      ├─ Define state with useLocalStorage (5 min)                          │
│      ├─ Integrate modules (5 min)                                          │
│      ├─ Define getters (3 min)                                             │
│      ├─ Implement actions (4 min)                                          │
│                                                                             │
│  Task 2.2: Create Composable (15 min)                                      │
│  └─► Создать src/composables/useDailyTasks.ts                              │
│      ├─ Define composable structure (2 min)                                │
│      ├─ Implement ensureTasks() (4 min)                                    │
│      ├─ Implement updateExerciseProgress() (3 min)                         │
│      ├─ Implement getters (4 min)                                          │
│      └─ Export API (2 min)                                                 │
│                                                                             │
│  Task 2.3: Integration Tests (20 min)                                      │
│  └─► Создать тесты для store и composable                                  │
│      ├─ Store integration test (10 min)                                    │
│      ├─ Composable integration test (7 min)                                │
│      ├─ Migration test (3 min)                                             │
│                                                                             │
│  Task 2.4: Update Types (10 min)                                           │
│  └─► Обновить src/types/gamification.ts                                    │
│      ├─ Add DailyTasksState (3 min)                                        │
│      ├─ Update exports (2 min)                                             │
│      ├─ Verify type safety (5 min)                                         │
│                                                                             │
│  COMPLETION CRITERIA:                                                       │
│  ☐ Store работает параллельно со старым                                    │
│  ☐ Composable используется в тестовом компоненте                           │
│  ☐ Integration tests проходят                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 3: Component Migration (Day 3-4, ~6 hours) — PARALLEL READY

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Task 3.1: Create DailyTasksList Component (25 min)                        │
│  └─► Создать src/components/daily/DailyTasksList.vue                       │
│      ├─ Setup template with props (5 min)                                  │
│      ├─ Integrate useDailyTasks (5 min)                                    │
│      ├─ Implement task list rendering (8 min)                              │
│      ├─ Add progress bars (5 min)                                          │
│      └─ Add styling (2 min)                                                │
│                                                                             │
│  Task 3.2: Create DailyTaskCard Component (20 min)                         │
│  └─► Создать src/components/daily/DailyTaskCard.vue                        │
│      ├─ Setup card template (5 min)                                        │
│      ├─ Add progress indicator (5 min)                                     │
│      ├─ Add reward display (3 min)                                         │
│      ├─ Add completion state (5 min)                                       │
│      └─ Add styling (2 min)                                                │
│                                                                             │
│  Task 3.3: Migrate DailyTasksView (15 min)                                 │
│  └─► Обновить src/views/DailyTasksView.vue                                 │
│      ├─ Replace old store calls with composable (5 min)                    │
│      ├─ Use DailyTasksList component (5 min)                               │
│      ├─ Verify functionality (5 min)                                       │
│                                                                             │
│  Task 3.4: Migrate DailyTasks Widget (15 min)                              │
│  └─► Обновить src/components/player/DailyTasks.vue                         │
│      ├─ Replace old store calls (5 min)                                    │
│      ├─ Use DailyTasksList component (5 min)                               │
│      ├─ Add compact mode (5 min)                                           │
│                                                                             │
│  Task 3.5: Update Exercise Components (30 min)                             │
│  └─► Обновить все компоненты упражнений                                     │
│      ├─ CountingView.vue (5 min)                                           │
│      ├─ EquationsView.vue (5 min)                                          │
│      ├─ MultiplicationView.vue (5 min)                                     │
│      ├─ DecompositionView.vue (5 min)                                      │
│      ├─ ColumnSubtractionView.vue (5 min)                                  │
│      └─ EquationsWholePartView.vue (5 min)                                 │
│                                                                             │
│  Task 3.6: Update useCoins (10 min)                                        │
│  └─► Обновить src/composables/useCoins.ts                                  │
│      ├─ Import useDailyTasks (2 min)                                       │
│      ├─ Replace updateTaskProgressForExercise (3 min)                      │
│      ├─ Add proper typing (3 min)                                          │
│      └─ Verify integration (2 min)                                         │
│                                                                             │
│  COMPLETION CRITERIA:                                                       │
│  ☐ Все компоненты используют новый composable                              │
│  ☐ UI работает корректно                                                   │
│  ☐ Прогресс обновляется                                                   │
│  ☐ Награды выдаются корректно                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 4: Cleanup (Day 5, ~2 hours) — SEQUENTIAL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Task 4.1: Remove Old Code from player.ts (30 min)                         │
│  └─► Удалить устаревший код из src/store/player.ts                         │
│      ├─ Remove dailyTasks state (5 min)                                    │
│      ├─ Remove generateDailyTasks() (5 min)                                │
│      ├─ Remove updateTaskProgress() (3 min)                                │
│      ├─ Remove updateTaskProgressForExercise() (3 min)                     │
│      ├─ Remove EXERCISE_TASK_IDS (4 min)                                   │
│      ├─ Remove EXERCISE_TO_TASK_TYPE (2 min)                               │
│      ├─ Remove shuffleArray() (3 min)                                      │
│      └─ Verify store still works (5 min)                                   │
│                                                                             │
│  Task 4.2: Clean Up Types (10 min)                                         │
│  └─► Очистить src/types/gamification.ts                                    │
│      ├─ Remove unused types (3 min)                                        │
│      ├─ Update exports (2 min)                                             │
│      └─ Verify no type errors (5 min)                                      │
│                                                                             │
│  Task 4.3: Delete Duplicate Component (5 min)                              │
│  └─► Удалить src/components/player/DailyTasks.vue (если не нужен)          │
│                                                                             │
│  Task 4.4: Final Migration Test (15 min)                                   │
│  └─► Запустить полный тест миграции                                        │
│      ├─ Backup localStorage (2 min)                                        │
│      ├─ Run migration (3 min)                                              │
│      ├─ Verify data integrity (5 min)                                      │
│      ├─ Test rollback (5 min)                                              │
│                                                                             │
│  Task 4.5: Update Documentation (20 min)                                   │
│  └─► Обновить документацию                                                 │
│      ├─ Update README.md (5 min)                                           │
│      ├─ Update architecture docs (10 min)                                  │
│      └─ Add migration notes (5 min)                                        │
│                                                                             │
│  COMPLETION CRITERIA:                                                       │
│  ☐ Старый код удалён                                                       │
│  ☐ Все тесты проходят                                                      │
│  ☐ Migration test пройден                                                  │
│  ☐ Документация обновлена                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 5: Enhancement (Optional, Day 6+) — PARALLEL READY

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Task 5.1: Implement Streak Feature (20 min)                               │
│  └─► Добавить подсчёт серии выполнений                                      │
│                                                                             │
│  Task 5.2: Add Completion Notifications (15 min)                           │
│  └─► Добавить уведомления при завершении                                    │
│                                                                             │
│  Task 5.3: Add Streak Rewards (15 min)                                     │
│  └─► Добавить бонусы за серию (3, 7, 30 дней)                              │
│                                                                             │
│  Task 5.4: Add Time Window (10 min)                                        │
│  └─► Добавить ограничение до 23:59                                          │
│                                                                             │
│  COMPLETION CRITERIA:                                                       │
│  ☐ Новые функции работают                                                   │
│  ☐ Покрыты тестами                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Testing Strategy

### 10.1 Test Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │  5%  (Playwright)
                    │     (5%)        │
                    └────────┬────────┘
                             │
            ┌────────────────┴────────────────┐
            ↓                                  ↓
    ┌───────────────┐                ┌───────────────┐
    │Integration    │                │  Component    │
    │Tests          │                │  Tests        │
    │    (15%)      │                │    (20%)      │
    └───────┬───────┘                └───────┬───────┘
            │                                │
            └────────────┬───────────────────┘
                         ↓
                ┌──────────────────┐
                │   Unit Tests     │  60%  (Jest)
                │     (60%)        │
                └──────────────────┘
```

### 10.2 Coverage Requirements

| Module | Target Coverage | Critical Paths |
|--------|-----------------|----------------|
| Generator | >90% | generate(), shuffle(), isTaskAvailable() |
| Progress | >90% | update(), getProgress() |
| Rewards | >90% | grant(), claim() |
| Store | >80% | generateIfNeeded(), updateProgress() |
| Composable | >80% | ensureTasks(), updateExerciseProgress() |
| Components | >70% | DailyTasksList, DailyTaskCard |

### 10.3 Test Files Structure

```
src/
└── store/
    └── dailyTasks/
        ├── __tests__/
        │   ├── generator.test.ts
        │   ├── progress.test.ts
        │   ├── rewards.test.ts
        │   ├── store.test.ts
        │   └── migration.test.ts
        └── ...
```

---

## 11. Risks & Mitigations

| ID | Риск | Вероятность | Влияние | Mitigation | Plan B |
|----|------|-------------|---------|------------|--------|
| **R-001** | Потеря данных при миграции | Среднее | Высокое | Migration тесты, бэкап перед деплоем | Rollback к старому коду |
| **R-002** | Регрессия в UI | Низкое | Среднее | QA тестирование, visual regression tests | Hotfix |
| **R-003** | Проблемы с localStorage | Среднее | Среднее | Абстракция storage layer | Fallback в память |
| **R-004** | Неожиданное поведение seed | Низкое | Низкое | Unit-тесты генератора | Фиксация seed в конфиге |
| **R-005** | Type safety проблемы | Низкое | Среднее | Strict TypeScript, ESLint | @ts-ignore временно |

---

## 12. Glossary

| Термин | Определение |
|--------|-------------|
| **Daily Task** | Ежедневное задание — задача с достижением (target) и наградой |
| **Exercise Type** | Тип упражнения (counting, multiplication, etc.) |
| **Task Type** | Тип задания для группировки (может совпадать с exercise type) |
| **Grade** | Класс ученика (1-4) |
| **Quarter** | Четверть учебного года (1-4) |
| **Streak** | Серия — количество дней подряд с выполнением ВСЕХ заданий |
| **Seed** | Сид для детерминированной генерации случайности |
| **SRP** | Single Responsibility Principle — принцип единой ответственности |
| **P0/P1/P2** | Приоритеты: P0 = критично, P1 = важно, P2 = желательно |

---

## Rollback Plan

Если критические баги обнаружены после релиза:

| Phase | Rollback Strategy | Time to Recover |
|-------|-------------------|-----------------|
| **Phase 1-2** | Быстрый rollback — старый код ещё работает | < 5 min |
| **Phase 3** | Git revert коммитов миграции | < 15 min |
| **Phase 4** | Восстановление из бэкапа localStorage | < 30 min |

**Triggers для rollback:**
- Потеря пользовательских данных
- Невозможность выполнить задание
- Критические ошибки в UI
- Performance degradation > 50%

---

## Sign-off

| Роль | Имя | Дата | Подпись |
|------|-----|------|---------|
| Product Owner | — | — | — |
| Tech Lead | — | — | — |
| Developer | — | — | — |

---

**Документ обновлён:** 11.02.2024 | **AI-Optimized Version:** 2.0
