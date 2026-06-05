# Code Context: Motivation System PRD

## Files Retrieved

### Stores (src/store/)
1. `src/store/player.ts` (119 lines) — Pinia composition store. Uses `@vueuse/core` `useLocalStorage`. Holds: `Player` (level, experience, cityLevel, unlockedBuildings), `Currency` (coins, crystals), `lastLoginDate`. Functions: `addExperience`, `addCoins`, `spendCoins`, `addCrystals`, `checkDailyBonus`, `unlockBuildingsForLevel`. **MUST BE REFACTORED**: remove cityLevel, unlockedBuildings, building logic.
2. `src/store/achievements.ts` (287 lines) — Pinia options store. Uses `useStorage()` composable for localStorage. State: `achievements[]` (cloned from ACHIEVEMENTS_DATA), `unlockedCount`, `totalCount`, `lastUnlocked`, `newAchievements[]`, `shownAchievements[]`. Key actions: `loadAchievements()`, `saveAchievements()`, `unlockAchievement()`, `checkAchievements(scoresStore, exerciseData)`. **NEEDS**: add `streak_daily` category, integrate with toast system.
3. `src/store/scores.ts` (385 lines) — Pinia options store. Uses `useStorage()`. Holds per-exercise scores: counting, decomposition, firstGradeDecomposition, multiplication, equations, columnSubtraction, equationsWholePart. Also: learning/diagnostic completion flags, manualEquationsSolved, multiplicationLevel. Getter `getTotalScore` sums all exercise scores. **PRESERVED AS-IS**.
4. `src/store/settings.ts` (73 lines) — Pinia options store. Holds `selectedGrade`, `isFirstTime`, `currentQuarter`. Uses `getCurrentQuarter()` from utils. **PRESERVED AS-IS**.
5. `src/store/dailyTasks/` — Sub-store with: `index.ts` (main store), `generator.ts`, `progress.ts`, `rewards.ts`, `types.ts`. Already has its own streak tracking (`streak` in DailyTasksState). **MAY NEED** integration with new streak store.

### Types (src/types/)
6. `src/types/index.ts` (348 lines) — Core types: `MathOperation`, `GradeLevel` (1|2|3|4), `MathProblem`, `GameState`, `GameSettings`, `GameResult`, `Achievement` (basic), all exercise-specific problem types. **PRESERVED**.
7. `src/types/gamification.ts` (85 lines) — City-specific types: `Currency`, `Building`, `Player`, `City`, `GridCell`, `BuildingTemplate`, `DailyTaskType`, `DailyTask`. **NEEDS CLEANUP**: remove City/Building/GridCell types, keep DailyTaskType/DailyTask.
8. `src/types/achievements.ts` (28 lines) — `AchievementCondition`, `Achievement` (with category union), `AchievementProgress`, `AchievementsState`. Category union: `'points'|'streak'|'level'|'time'|'diversity'|'hidden'`. **NEEDS**: add `'streak_daily'` to category union.

### Data
9. `src/data/achievements.ts` (213 lines) — `ACHIEVEMENTS_DATA` array of 25 achievements. Categories: points (8), streak (4), level (4), time (3), diversity (3), hidden (3). Also `ACHIEVEMENT_CATEGORIES` for filter UI. **NEEDS**: add 4 new streak_daily achievements (streak_3, streak_7, streak_14, streak_30).

### Composables
10. `src/composables/useStorage.ts` (95 lines) — localStorage wrapper. `getItem/setItem/removeItem/getObject/setObject`. Also `useScoreStorage()` helper. Used by stores.
11. `src/composables/useCoins.ts` (95 lines) — `calculateCoins(exerciseType, level, errors)`, `awardCoins()`. Calls `playerStore.addCoins()` + `dailyTasks.updateExerciseProgress()`. Used by 8 exercise views. **NEEDS REFACTOR**: remove coins logic (or keep as XP-only).
12. `src/composables/useDailyTasks.ts` (83 lines) — Wraps `dailyTasksStore`. `ensureTasks()`, `updateExerciseProgress()`, `getExerciseProgress()`.
13. `src/composables/useAchievements.ts` (103 lines) — `checkAchievements(scoresStore, exerciseData)`, `newlyUnlockedAchievements`, `markAllAsViewed()`. Also `useSessionTimeTracker()` and `useTimeOfDayTracker()`.
14. `src/composables/useGameLogic.ts`, `useInteractiveSubtraction.ts`, `useMobileKeyboard.ts`, `useSubtractionAnimation.ts` — Exercise-specific, not relevant.

### Config
15. `src/config/exerciseAvailability.ts` (93 lines) — `EXERCISE_AVAILABILITY` record mapping exercise types to availability rules (grade + quarter). 7 exercises defined. **KEY FOR PROGRESS PATH**: this defines what nodes appear per grade/quarter.
16. `src/config/dailyTasks.ts` — Daily task configs per exercise type.

### Router
17. `src/router/index.ts` (128 lines) — 17 routes. `/city` route exists (imports CityView). `beforeEach` guard checks `to.meta.exerciseType` against `getAvailableExercises()`. **NEEDS**: remove/comment `/city` route.

### Views
18. `src/views/HomeView.vue` (~500 lines) — Main screen. Uses: scoresStore, settingsStore, achievementsStore, playerStore, useAchievements, useDailyTasks. Template: grade-info bar (grade, buttons for achievements/daily-tasks/city/coins) + games-container with exercise cards. `goToCity()` function exists. city-button hidden via `display:none`. **NEEDS**: add MotivationBar + ProgressPath, remove city/coins references.
19. `src/views/CityView.vue` (~30 lines) — Phaser wrapper. **TO BE DELETED**.
20. `src/App.vue` (~45 lines) — Root: `<router-view>` + `<GradeSelection>` overlay. Loads settings on mount. **NEEDS**: add `<ToastNotification>` overlay for achievement toasts.

### Components
21. `src/components/AchievementManager.vue` (~115 lines) — Global achievement notification system. Already has queue-based modal display via `AchievementUnlockModal`. Mounted in HomeView. **NEEDS**: convert from modal to toast (or add parallel toast system).
22. `src/components/AchievementUnlockModal.vue` (~375 lines) — Full modal with confetti. **May be replaced with toast**.
23. `src/components/player/CurrencyDisplay.vue` (~60 lines) — Shows coins + crystals. Used in 12 exercise views + CityView. **NEEDS**: keep or refactor to show XP/stars instead of coins.

### Game (TO DELETE)
24. `src/game/CityGame.ts` (57 lines) — Phaser game config.
25. `src/game/scenes/CityScene.ts` (244 lines) — City scene.
26. `src/game/utils/IsometricUtils.ts` (66 lines) — Iso math helpers.
27. `src/game/types/CityTypes.ts` (56 lines) — City-specific types.
**Total: 423 lines to delete. Phaser dependency in package.json line 41.**

## Key Types & Interfaces

```typescript
// src/types/achievements.ts
interface Achievement {
  id: string; name: string; description: string;
  category: 'points' | 'streak' | 'level' | 'time' | 'diversity' | 'hidden';
  icon: string; condition: AchievementCondition; reward: number;
  unlocked: boolean; unlockedAt?: Date; progress?: number;
}

// src/types/gamification.ts
interface Player {
  level: number; experience: number; experienceToNext: number;
  totalCoinsEarned: number; cityLevel: number; unlockedBuildings: string[];
}
interface Currency { coins: number; crystals: number; }
type DailyTaskType = 'equations'|'multiplication'|'counting'|'decomposition'|'decomposition_easy'|'columnSubtraction'|'equationsWholePart';

// src/types/index.ts
type GradeLevel = 1 | 2 | 3 | 4;

// src/config/exerciseAvailability.ts
interface ExerciseAvailabilityConfig {
  available: (grade: GradeLevel, quarter: number) => boolean;
  title: string; description: string; grades: GradeLevel[]; quarters: number[];
}
// 7 exercises: counting, firstGradeDecomposition, decomposition, multiplication, equations, columnSubtraction, equationsWholePart
```

## Architecture

### Data Flow
```
ExerciseView → awardCoins() → playerStore.addCoins() + dailyTasks.updateExerciseProgress()
ExerciseView → checkAchievements(scoresStore, {type, correct, streak}) → achievementsStore.checkAchievements()
HomeView → AchievementManager → AchievementUnlockModal (queue-based)
```

### Persistence
- All stores use `useStorage()` composable (localStorage wrapper)
- Player store uses `@vueuse/core` `useLocalStorage` (reactive persistence)
- Scores: individual localStorage keys per exercise (e.g. `countingTrainerTotalScore`)
- Achievements: `achievements`, `newAchievements`, `shownAchievements` keys
- Settings: `selectedGrade` key

### Dependencies on Coins/Currency
- `useCoins.ts` used by 8 exercise views: CountingView, DecompositionView, FirstGradeDecompositionView, MultiplicationView, EquationsView, ColumnSubtractionView, ColumnSubtractionDiagnosticView, EquationsWholePartView
- `CurrencyDisplay.vue` used by same 8 views + CityView
- `playerStore.currency` referenced in HomeView (coins display)

### Dependencies on City/Phaser
- Only `CityView.vue` + `src/game/` use Phaser
- HomeView has `goToCity()` + city-button (already hidden)
- Router has `/city` route
- `playerStore` has `cityLevel`, `unlockedBuildings`, `unlockBuildingsForLevel()`

## Implementation Map (PRD → Code)

| PRD Task | Files to Create | Files to Modify | Files to Delete |
|----------|----------------|----------------|-----------------|
| T1.1 types/motivation.ts | `src/types/motivation.ts` | — | — |
| T1.2 store/streaks.ts | `src/store/streaks.ts` | — | — |
| T1.3 composables/useStreaks.ts | `src/composables/useStreaks.ts` | — | — |
| T1.4 streak tests | `src/store/__tests__/streaks.test.ts` | — | — |
| T1.5 Remove city | — | `src/router/index.ts` | `src/game/`, `src/views/CityView.vue` |
| T1.6 Clean Player store | — | `src/store/player.ts`, `src/types/gamification.ts` | — |
| T2.1 StreakFlame.vue | `src/components/motivation/StreakFlame.vue` | — | — |
| T2.2 StreakCounter.vue | `src/components/motivation/StreakCounter.vue` | — | — |
| T2.3 MotivationBar.vue | `src/components/motivation/MotivationBar.vue` | — | — |
| T2.4 Integrate MotivationBar | — | `src/App.vue` | — |
| T2.5 Connect streaks to exercises | — | Exercise views (8 files) | — |
| T2.6 Toast for achievements | `src/components/common/ToastNotification.vue` | `src/App.vue`, `src/components/AchievementManager.vue` | — |
| T3.1 config/progressPath.ts | `src/config/progressPath.ts` | — | — |
| T3.2 store/progressPath.ts | `src/store/progressPath.ts` | — | — |
| T3.3 PathNode.vue | `src/components/motivation/PathNode.vue` | — | — |
| T3.4 ProgressPath.vue | `src/components/motivation/ProgressPath.vue` | — | — |
| T3.5 Integrate ProgressPath | — | `src/views/HomeView.vue` | — |
| T3.6 Progress path tests | `src/store/__tests__/progressPath.test.ts` | — | — |
| T4.1 Streak achievements | — | `src/data/achievements.ts`, `src/types/achievements.ts` | — |

## Risks & Open Questions

1. **Coins dependency widespread**: 8 exercise views call `useCoins().awardCoins()`. Need to decide: keep coins as XP display? Or remove entirely? PRD says "remove currency as main motivation" but daily tasks still award coins as reward. **Decision needed**: keep useCoins but remove from UI, or refactor to pure XP?
2. **AchievementManager uses MODAL not toast**: PRD wants toast. Current modal has confetti animation. Need to either convert AchievementUnlockModal to toast or create a parallel toast component.
3. **DailyTasks store already tracks streak**: `DailyTasksState.streak` field exists. New streak store may conflict. Should consolidate or make streak store authoritative.
4. **CurrencyDisplay used in 12 views**: If removing coins from UI, need to update all 12 views or make CurrencyDisplay show something else.
5. **Phaser in package.json**: After deleting game/, should also `npm uninstall phaser` to save ~50KB gzipped.

## Start Here

**Phase 1, Task T1.2**: Create `src/store/streaks.ts` first — it's the foundation everything else depends on. The streak store needs:
- `currentStreak`, `bestStreak`, `lastActiveDate` (persisted via localStorage)
- `recordActivity()` called when any exercise completes
- Logic: compare `lastActiveDate` with today/yesterday

Then **T1.1**: Create `src/types/motivation.ts` with StreakState, StreakMilestone interfaces.

Then **T1.5**: Remove city (router + game/ + CityView) — this is clean deletion, low risk.
