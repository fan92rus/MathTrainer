/**
 * ProgressPath Store — визуальный прогресс обучения
 *
 * Вычисляет звёзды для каждого узла пути на основе очков из scoresStore.
 */
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useScoresStore } from './scores'
import { useSettingsStore } from './settings'
import { PROGRESS_PATH_CONFIG, calculateStars, getQuarterTitle } from '@/config/progressPath'
import { EXERCISE_AVAILABILITY } from '@/config/exerciseAvailability'
import type { PathNode, PathGroup } from '@/types/motivation'

export const useProgressPathStore = defineStore('progressPath', () => {
  const scoresStore = useScoresStore()
  const settingsStore = useSettingsStore()

  /**
   * Маппинг exerciseType → getter для очков в scoresStore
   */
  function getScoreForType(exerciseType: string): number {
    switch (exerciseType) {
      case 'counting':
        return scoresStore.counting ?? 0
      case 'firstGradeDecomposition':
        return scoresStore.firstGradeDecomposition ?? 0
      case 'decomposition':
        return scoresStore.decomposition ?? 0
      case 'multiplication':
        return scoresStore.multiplication ?? 0
      case 'equations':
        return scoresStore.equations ?? 0
      case 'columnSubtraction':
        return scoresStore.columnSubtraction ?? 0
      case 'equationsWholePart':
        return scoresStore.equationsWholePart ?? 0
      default:
        return 0
    }
  }

  /**
   * Все узлы пути с вычисленными звёздами и статусом блокировки
   */
  const allNodes = computed<PathNode[]>(() => {
    const grade = settingsStore.selectedGrade
    const quarter = settingsStore.currentQuarter

    return PROGRESS_PATH_CONFIG.map(config => {
      const score = getScoreForType(config.exerciseType)
      const starCount = calculateStars(score, config.thresholds)
      const availConfig = EXERCISE_AVAILABILITY[config.exerciseType]

      // Узел заблокирован если он для другого класса или будущей четверти
      let locked = true
      if (config.grade < grade) {
        locked = false // Пройденные классы — разблокированы
      } else if (config.grade === grade) {
        if (config.quarter <= quarter) {
          locked = false // Текущая и прошлые четверти — разблокированы
        }
      }

      // Дополнительная проверка через exerciseAvailability
      if (availConfig && !locked) {
        // OK — exercise доступно для этого класса/четверти
      }

      return {
        id: `${config.exerciseType}-${config.grade}-${config.quarter}`,
        exerciseType: config.exerciseType,
        title: config.title,
        description: config.description,
        thresholds: config.thresholds,
        starCount,
        locked,
        icon: config.icon,
        grade: config.grade,
        quarter: config.quarter,
      }
    })
  })

  /**
   * Узлы только для текущего класса, сгруппированные по четвертям
   */
  const currentGradeGroups = computed<PathGroup[]>(() => {
    const grade = settingsStore.selectedGrade
    const nodes = allNodes.value.filter(n => n.grade === grade)

    // Группируем по четвертям
    const quarterMap = new Map<number, PathNode[]>()
    for (const node of nodes) {
      if (!quarterMap.has(node.quarter)) {
        quarterMap.set(node.quarter, [])
      }
      quarterMap.get(node.quarter)!.push(node)
    }

    const groups: PathGroup[] = []
    for (const [quarter, qNodes] of quarterMap) {
      groups.push({
        grade,
        quarter,
        title: getQuarterTitle(grade, quarter),
        nodes: qNodes,
      })
    }

    return groups.sort((a, b) => a.quarter - b.quarter)
  })

  /**
   * Общий прогресс по текущему классу: сколько звёзд набрано / всего возможно
   */
  const currentGradeProgress = computed<{ earned: number; total: number }>(() => {
    const nodes = allNodes.value.filter(n => n.grade === settingsStore.selectedGrade && !n.locked)
    let earned = 0
    let total = 0
    for (const node of nodes) {
      earned += node.starCount
      total += 3
    }
    return { earned, total }
  })

  /**
   * Текущий узел (первый незаблокированный с < 3 звёздами)
   */
  const currentNode = computed<PathNode | null>(() => {
    const grade = settingsStore.selectedGrade
    const nodes = allNodes.value.filter(n => n.grade === grade && !n.locked)
    return nodes.find(n => n.starCount < 3) ?? nodes[nodes.length - 1] ?? null
  })

  return {
    allNodes,
    currentGradeGroups,
    currentGradeProgress,
    currentNode,
  }
})
