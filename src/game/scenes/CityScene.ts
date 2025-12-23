/* global Phaser */
import { Scene } from 'phaser'
import { IsometricUtils } from '../utils/IsometricUtils'
import type { TileData, GridPosition } from '../types/CityTypes'

export class CityScene extends Scene {
  private gridWidth: number = 10
  private gridHeight: number = 10
  private tileWidth: number = 210  // Ширина тайла (реальная для изометрии)
  private tileHeight: number = 100 // Высота тайла (реальная для изометрии)
  private tileScale: number = 0.99  // Небольшое уменьшение для предотвращения наложения
  private tiles: TileData[] = []
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null
  private wasdKeys: any = null
  private cameraControls: Phaser.Cameras.Controls.SmoothedKeyControl | null = null

  constructor() {
    super({ key: 'CityScene' })
  }

  preload(): void {
    this.load.spritesheet(
      'tiles',
      '/src/tiles/Isometric Assets 1.png',
      {
        frameWidth: 256,
        frameHeight: 256
      }
    )
  }

  create(): void {
    // Создание сетки и заполнение землей
    this.createGrid()

    // Настраиваем управление камерой
    this.setupCameraControls()

    // Добавляем интерактивность
    this.setupInteractivity()
  }

  private createGrid(): void {
    // Начальная позиция для отрисовки изометрической сетки
    const startX = this.cameras.main.width / 2
    const startY = 150

    // Получаем правильный порядок отрисовки для изометрической проекции
    const drawOrder = IsometricUtils.getDrawOrder(this.gridWidth, this.gridHeight)

    // Заполняем сетку тайлами земли в правильном порядке
    drawOrder.forEach(({ x, y }) => {
      this.placeTile(x, y, startX, startY)
    })
  }

  private setupCameraControls(): void {
    // Создаем управление стрелками
    this.cursors = this.input.keyboard!.createCursorKeys()

    // Создаем управление WASD
    this.wasdKeys = this.input.keyboard!.addKeys('W,S,A,D')

    // Настраиваем плавное управление камерой
    const controlConfig = {
      camera: this.cameras.main,
      left: this.cursors.left,
      right: this.cursors.right,
      up: this.cursors.up,
      down: this.cursors.down,
      acceleration: 0.06,
      drag: 0.001,
      maxSpeed: 1.0
    }

    // Создаем контроллер для плавного движения
    this.cameraControls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig)

    // Добавляем текст с инструкциями
    const helpText = this.add.text(10, 10,
      'Управление камерой:\nСтрелки или WASD\n↑/W - вверх\n↓/S - вниз\n←/A - влево\n→/D - вправо\n\nКолесико мыши - зум',
      {
        fontSize: '14px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: { x: 10, y: 10 }
      }
    )
    helpText.setScrollFactor(0) // Текст остается на месте при движении камеры
    helpText.setDepth(1000)

    // Добавляем управление масштабом колесом мыши
    this.setupZoomControls()
  }

  private setupZoomControls(): void {
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number, _deltaZ: number) => {
      const camera = this.cameras.main
      const currentZoom = camera.zoom
      const zoomSpeed = 0.1

      if (deltaY > 0) {
        // Колесико вниз - уменьшаем масштаб
        camera.setZoom(Phaser.Math.Clamp(currentZoom - zoomSpeed, 0.5, 3))
      } else {
        // Колесико вверх - увеличиваем масштаб
        camera.setZoom(Phaser.Math.Clamp(currentZoom + zoomSpeed, 0.5, 3))
      }
    })
  }

  private placeTile(gridX: number, gridY: number, startX: number, startY: number): void {
    // Выбор тайла земли
    const tileType = 98

    // Для изометрической проекции используем правильные размеры
    const actualTileWidth = this.tileWidth * this.tileScale
    const actualTileHeight = this.tileHeight * this.tileScale

    // Изометрическое преобразование координат с точным прилеганием
    // Используем смещение для идеального прилегания ромбовидных тайлов
    const screenX = (gridX - gridY) * (actualTileWidth / 2)
    const screenY = (gridX + gridY) * (actualTileHeight / 2)

    const finalScreenX = startX + screenX
    const finalScreenY = startY + screenY

    // Создание тайла
    const tile = this.add.image(finalScreenX, finalScreenY, 'tiles', tileType)

    // Для идеального прилегания без наложения и пробелов
    tile.setOrigin(0.5, 0.5) // Центрируем тайл
    tile.setScale(this.tileScale) // Используем точный масштаб

    // Установка глубины для правильного отображения
    const depth = IsometricUtils.getDepth(gridX, gridY)
    tile.setDepth(depth)

    // Сохраняем информацию о тайле для будущих взаимодействий
    this.tiles.push({
      gridX,
      gridY,
      screenX: finalScreenX,
      screenY: finalScreenY,
      tile,
      type: tileType
    })
  }

  private setupInteractivity(): void {
    // Добавляем обработчик клика мыши
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const gridPos = this.screenToGridPosition(pointer.x, pointer.y)

      if (this.isValidGridPosition(gridPos)) {
        console.log(`Клик по ячейке: ${gridPos.x}, ${gridPos.y}`)
        this.highlightTile(gridPos)

        // Здесь можно добавить логику взаимодействия с ячейкой
        // Например, выделение ячейки или постройку здания
      }
    })
  }


    private screenToGridPosition(screenX: number, screenY: number): GridPosition {
      // Обратное преобразование для изометрической проекции
      const actualTileWidth = this.tileWidth * this.tileScale
      const actualTileHeight = this.tileHeight * this.tileScale

      // Корректируем координаты с учетом позиции камеры
      const adjustedX = screenX - this.cameras.main.width / 2
      const adjustedY = screenY - 150

      // Обратное преобразование из изометрических координат в сетку
      const relX = adjustedX
      const relY = adjustedY

      // Формулы обратного преобразования:
      // gridX = (relX / (tileWidth/2) + relY / (tileHeight/2)) / 2
      // gridY = (relY / (tileHeight/2) - relX / (tileWidth/2)) / 2
      const gridX = Math.round((relX / (actualTileWidth / 2) + relY / (actualTileHeight / 2)) / 2)
      const gridY = Math.round((relY / (actualTileHeight / 2) - relX / (actualTileWidth / 2)) / 2)

      return { x: gridX, y: gridY }
    }

  private isValidGridPosition(pos: GridPosition): boolean {
    return pos.x >= 0 && pos.x < this.gridWidth && pos.y >= 0 && pos.y < this.gridHeight
  }

  private getTileAt(gridX: number, gridY: number): TileData | undefined {
    return this.tiles.find(tile => tile.gridX === gridX && tile.gridY === gridY)
  }

  private highlightTile(gridPos: GridPosition): void {
    // Убираем предыдущее выделение
    this.tiles.forEach(tile => {
      tile.tile.setTint(0xffffff) // Белый цвет (без выделения)
    })

    // Выделяем новый тайл
    const tile = this.getTileAt(gridPos.x, gridPos.y)
    if (tile) {
      tile.tile.setTint(0xffff00) // Желтый цвет для выделения
    }
  }

  update(_time: number, delta: number): void {
    if (!this.cameraControls) return

    // Обновляем плавное управление камерой
    this.cameraControls.update(delta)

    // Добавляем поддержку WASD для движения
    if (this.wasdKeys) {
      // Эмулируем нажатия стрелок для WASD
      this.cursors!.left.isDown = this.cursors!.left.isDown || this.wasdKeys.A.isDown
      this.cursors!.right.isDown = this.cursors!.right.isDown || this.wasdKeys.D.isDown
      this.cursors!.up.isDown = this.cursors!.up.isDown || this.wasdKeys.W.isDown
      this.cursors!.down.isDown = this.cursors!.down.isDown || this.wasdKeys.S.isDown
    }

    // Ограничения движения камеры
    this.limitCameraBounds()
  }

private limitCameraBounds(): void {
  const camera = this.cameras.main
  const actualTileWidth = this.tileWidth * this.tileScale
  const actualTileHeight = this.tileHeight * this.tileScale

  // Для изометрической карты границы рассчитываются иначе
  const mapWidth = (this.gridWidth - 1) * actualTileWidth
  const mapHeight = (this.gridHeight - 1) * actualTileHeight

  // Границы для изометрической проекции
  const minScrollX = -mapWidth / 2 - 100
  const maxScrollX = mapWidth / 2 + 100
  const minScrollY = -mapHeight / 2 - 100
  const maxScrollY = mapHeight + 100

  camera.scrollX = Phaser.Math.Clamp(camera.scrollX, minScrollX, maxScrollX)
  camera.scrollY = Phaser.Math.Clamp(camera.scrollY, minScrollY, maxScrollY)
}
}