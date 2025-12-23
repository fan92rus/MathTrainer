export class IsometricUtils {
  /**
   * Преобразует координаты сетки в изометрические экранные координаты
   * @param gridX - Координата X в сетке
   * @param gridY - Координата Y в сетке
   * @param tileWidth - Ширина тайла
   * @param tileHeight - Высота тайла
   * @returns Объект с экранными координатами {x, y}
   */
  static gridToScreen(
    gridX: number, 
    gridY: number, 
    tileWidth: number, 
    tileHeight: number
  ): { x: number; y: number } {
    const screenX = (gridX - gridY) * (tileWidth / 2)
    const screenY = (gridX + gridY) * (tileHeight / 2)
    return { x: screenX, y: screenY }
  }

  /**
   * Преобразует экранные координаты в координаты сетки
   * @param screenX - Экранная координата X
   * @param screenY - Экранная координата Y
   * @param tileWidth - Ширина тайла
   * @param tileHeight - Высота тайла
   * @returns Объект с координатами сетки {x, y}
   */
  static screenToGrid(
    screenX: number, 
    screenY: number, 
    tileWidth: number, 
    tileHeight: number
  ): { x: number; y: number } {
    const gridX = (screenX / (tileWidth / 2) + screenY / (tileHeight / 2)) / 2
    const gridY = (screenY / (tileHeight / 2) - screenX / (tileWidth / 2)) / 2
    return { x: Math.round(gridX), y: Math.round(gridY) }
  }

  /**
   * Определяет глубину отображения для тайла в изометрической проекции
   * @param gridX - Координата X в сетке
   * @param gridY - Координата Y в сетке
   * @returns Глубина для правильного отображения
   */
  static getDepth(gridX: number, gridY: number): number {
    return gridX + gridY
  }

  /**
   * Определяет порядок отрисовки тайлов для изометрической проекции
   * @param width - Ширина сетки
   * @param height - Высота сетки
   * @returns Массив координат в правильном порядке отрисовки
   */
  static getDrawOrder(width: number, height: number): Array<{x: number, y: number}> {
    const tiles: Array<{x: number, y: number}> = []
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        tiles.push({ x, y })
      }
    }
    
    return tiles
  }
}