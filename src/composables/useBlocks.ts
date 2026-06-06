import { ref, computed } from 'vue'
import type { Block } from '@/types/blocks'
import { DRAGONBOX_COLORS } from '@/types/blocks'

/**
 * Composable для DragonBox Blocks (Pattern 3).
 * Управляет блоками: создание, перемещение, склеивание, разрезание.
 */
export function useBlocks(unitWidth: number = 36, blockHeight: number = 48) {
  const blocks = ref<Block[]>([])
  let blockIdCounter = 0

  /** Создать блок с заданным значением и позицией */
  function createBlock(value: number, x: number, y: number): Block {
    const block: Block = {
      id: ++blockIdCounter,
      value,
      x,
      y,
      width: value * unitWidth,
      height: blockHeight,
      state: 'idle',
      color: DRAGONBOX_COLORS[value] ?? '#888',
    }
    blocks.value.push(block)
    return block
  }

  /** Найти блок по id */
  function findBlock(id: number): Block | undefined {
    return blocks.value.find(b => b.id === id)
  }

  /** Обновить позицию блока (при drag) */
  function moveBlock(id: number, x: number, y: number): void {
    const block = findBlock(id)
    if (block) {
      block.x = x
      block.y = y
      block.state = 'dragging'
    }
  }

  /**
   * Склеить два блока (сложение).
   * Удаляет оба, создаёт новый с суммой значений.
   * Возвращает новый блок или null если невозможно (сумма > 10).
   */
  function combineBlocks(idA: number, idB: number): Block | null {
    const a = findBlock(idA)
    const b = findBlock(idB)
    if (!a || !b) return null

    const newValue = a.value + b.value
    if (newValue > 10) return null // нельзя склеить больше 10

    // Удаляем старые
    blocks.value = blocks.value.filter(bl => bl.id !== idA && bl.id !== idB)

    // Создаём новый на месте склейки
    const midX = (a.x + b.x) / 2
    const midY = (a.y + b.y) / 2
    return createBlock(newValue, midX, midY)
  }

  /**
   * Разрезать блок на два (вычитание/разложение).
   * Удаляет исходный, создаёт два новых с указанными значениями.
   */
  function splitBlock(id: number, valueA: number): [Block, Block] | null {
    const block = findBlock(id)
    if (!block) return null

    const valueB = block.value - valueA
    if (valueA <= 0 || valueB <= 0) return null

    blocks.value = blocks.value.filter(bl => bl.id !== id)

    const a = createBlock(valueA, block.x - unitWidth, block.y)
    const b = createBlock(valueB, block.x + valueA * unitWidth, block.y)
    return [a, b]
  }

  /**
   * Проверить, находятся ли два блока рядом (snap zone < 50px).
   */
  function areNearby(idA: number, idB: number, threshold: number = 50): boolean {
    const a = findBlock(idA)
    const b = findBlock(idB)
    if (!a || !b) return false

    const dx = Math.abs(a.x + a.width / 2 - (b.x + b.width / 2))
    const dy = Math.abs(a.y + a.height / 2 - (b.y + b.height / 2))
    return dx < threshold && dy < threshold
  }

  /** Сбросить все блоки */
  function reset(): void {
    blocks.value = []
    blockIdCounter = 0
  }

  /** Блок по значению (для поиска) */
  function getBlockByValue(value: number): Block | undefined {
    return blocks.value.find(b => b.value === value)
  }

  /** Общая сумма всех блоков */
  const totalValue = computed(() => blocks.value.reduce((sum, b) => sum + b.value, 0))

  return {
    blocks,
    totalValue,
    createBlock,
    findBlock,
    moveBlock,
    combineBlocks,
    splitBlock,
    areNearby,
    getBlockByValue,
    reset,
  }
}
