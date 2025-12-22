import * as BABYLON from '@babylonjs/core'
import type { HTMLCanvasElement } from '@/types/dom'
import { BuildingManager, BuildState } from './BuildingManager'
import type { BuildingTemplate, Building } from '@/types/gamification'

// Простая реализация EventEmitter для браузера
class EventEmitter {
  private events: Map<string, ((...args: unknown[]) => void)[]> = new Map()

  on(event: string, listener: (...args: unknown[]) => void) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(listener)
    return this
  }

  emit(event: string, ...args: unknown[]) {
    const listeners = this.events.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(...args))
    }
    return listeners ? listeners.length > 0 : false
  }

  off(event: string, listener: (...args: unknown[]) => void) {
    const listeners = this.events.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
    return this
  }
}

export class CityRenderer extends EventEmitter {
  private engine: BABYLON.Engine
  private scene: BABYLON.Scene
  private camera: BABYLON.ArcRotateCamera
  private canvas: HTMLCanvasElement

  // Сетка города
  private gridSize = 8
  private tileSize = 2
  private grid: BABYLON.Mesh[][] = []

  // Управление зданиями
  private buildingManager: BuildingManager

  constructor(canvas: HTMLCanvasElement) {
    super()
    this.canvas = canvas

    // Инициализация Babylon.js
    this.engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    })

    this.scene = new BABYLON.Scene(this.engine)
    this.setupCamera()
    this.setupLighting()
    this.createGrid()

    // Инициализация BuildingManager после создания сетки
    this.buildingManager = new BuildingManager(this.scene, this.gridSize, this.tileSize, this.grid)

    this.setupInteractions()

    // Запуск рендера
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })

    // Обработка изменения размера
    window.addEventListener('resize', () => {
      this.engine.resize()
    })
  }

  private setupCamera() {
    // Изометрическая камера
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 4,  // alpha (горизонтальный угол)
      Math.PI / 3,  // beta (вертикальный угол)
      20,           // radius (дистанция)
      BABYLON.Vector3.Zero(),
      this.scene
    )

    this.camera.setTarget(BABYLON.Vector3.Zero())
    this.camera.attachControl(this.canvas, true) // Включаем обычное управление

    // Ограничения камеры
    this.camera.lowerRadiusLimit = 10
    this.camera.upperRadiusLimit = 30
    this.camera.lowerBetaLimit = Math.PI / 6
    this.camera.upperBetaLimit = Math.PI / 2.5
  }

  private setupLighting() {
    // Основной свет
    const light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    )
    light.intensity = 1.2

    // Направленный свет для теней
    const dirLight = new BABYLON.DirectionalLight(
      'dirLight',
      new BABYLON.Vector3(-1, -2, -1),
      this.scene
    )
    dirLight.position = new BABYLON.Vector3(10, 10, 10)
    dirLight.intensity = 0.8
  }

  private createGrid() {
    // Материал для сетки
    const gridMaterial = new BABYLON.StandardMaterial('gridMaterial', this.scene)
    gridMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9)
    gridMaterial.specularColor = new BABYLON.Color3(0, 0, 0)

    // Создание тайлов сетки
    for (let y = 0; y < this.gridSize; y++) {
      this.grid[y] = []
      for (let x = 0; x < this.gridSize; x++) {
        const tile = BABYLON.MeshBuilder.CreateGround(
          `tile_${x}_${y}`,
          {
            width: this.tileSize,
            height: this.tileSize
          },
          this.scene
        )

        // Позиция тайла
        const worldX = (x - this.gridSize / 2) * this.tileSize + this.tileSize / 2
        const worldZ = (y - this.gridSize / 2) * this.tileSize + this.tileSize / 2
        tile.position = new BABYLON.Vector3(worldX, 0, worldZ)

        // Материал
        tile.material = gridMaterial

        // Метаданные для определения позиции
        tile.metadata = { x, y }

        this.grid[y][x] = tile
      }
    }
  }

  private setupInteractions() {
    this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
        this.handlePointerMove(pointerInfo)
      } else if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
        this.handlePointerClick(pointerInfo)
      }
    })

    // Обработка pinch-to-zoom для мобильных
    this.setupTouchGestures()
  }

  private setupTouchGestures() {
    // Простая обработка жестов для мобильных устройств
    let lastDistance = 0

    this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE &&
          pointerInfo.event!.pointerType === 'touch' &&
          pointerInfo.event!.touches.length === 2) {

        // Расчет расстояния между двумя пальцами
        const touch1 = pointerInfo.event!.touches[0]
        const touch2 = pointerInfo.event!.touches[1]
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )

        if (lastDistance > 0) {
          const delta = distance - lastDistance
          // Изменяем дистанцию камеры
          this.camera.radius = Math.max(
            this.camera.lowerRadiusLimit || 10,
            Math.min(this.camera.upperRadiusLimit || 30, this.camera.radius - delta * 0.05)
          )
        }

        lastDistance = distance
      } else if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
        lastDistance = 0
      }
    })
  }

  private handlePointerMove(_pointerInfo: BABYLON.PointerInfo) {
    const pickResult = this.scene.pick(
      this.scene.pointerX,
      this.scene.pointerY,
      (mesh) => mesh.metadata && mesh.metadata.x !== undefined
    )

    if (pickResult?.hit && pickResult.pickedMesh) {
      const mesh = pickResult.pickedMesh
      const x = mesh.metadata.x
      const y = mesh.metadata.y

      // Проверка наведения на здание
      if (this.buildingManager.getBuildState() === BuildState.IDLE) {
        const building = this.buildingManager.getBuildingAt(x, y)
        this.emit('hover', building)
      }

      // Обновление превью при построении
      if (this.buildingManager.getBuildState() === BuildState.PLACING) {
        this.buildingManager.updatePreview(x, y)
      }
    }
  }

  private handlePointerClick(_pointerInfo: BABYLON.PointerInfo) {
    const pickResult = this.scene.pick(
      this.scene.pointerX,
      this.scene.pointerY,
      (mesh) => mesh.metadata && mesh.metadata.x !== undefined
    )

    if (pickResult?.hit && pickResult.pickedMesh) {
      const mesh = pickResult.pickedMesh
      const x = mesh.metadata.x
      const y = mesh.metadata.y

      // Попытка построить здание
      if (this.buildingManager.getBuildState() === BuildState.PLACING) {
        // Проверяем доступность ДО создания здания
        const template = this.buildingManager.getSelectedTemplate()
        if (template) {
          // Передаем событие для проверки денег и создания
          this.emit('buildRequest', template, x, y)
        }
      } else if (this.buildingManager.getBuildState() === BuildState.IDLE) {
        // Выбор существующего здания
        const building = this.buildingManager.getBuildingAt(x, y)
        if (building) {
          this.emit('select', building)
        }
      }
    }
  }

  // Публичные методы

  public enterBuildMode(template: BuildingTemplate) {
    this.buildingManager.startPlacing(template)
  }

  public exitBuildMode() {
    this.buildingManager.cancelPlacement()
  }

  public async addBuilding(building: Building) {
    if (building.x !== undefined && building.y !== undefined) {
      await this.buildingManager.placeBuilding(building)
    }
  }

  public async createBuilding(template: BuildingTemplate, x: number, y: number) {
    const building = this.buildingManager.createBuilding(template, x, y)
    if (building) {
      await this.buildingManager.placeBuilding(building)
    }
  }

  public removeBuilding(buildingId: string) {
    this.buildingManager.removeBuilding(buildingId)
  }

  public resetCamera() {
    this.camera.alpha = Math.PI / 4
    this.camera.beta = Math.PI / 3
    this.camera.radius = 20
    this.camera.setTarget(BABYLON.Vector3.Zero())
  }

  public zoom(delta: number) {
    this.camera.radius = Math.max(
      this.camera.lowerRadiusLimit || 10,
      Math.min(this.camera.upperRadiusLimit || 30, this.camera.radius - delta)
    )
  }

  public dispose() {
    this.buildingManager.dispose()
    this.engine.dispose()
  }
}