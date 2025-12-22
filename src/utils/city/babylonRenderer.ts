import * as BABYLON from '@babylonjs/core'
import { BuildingManager, BuildState } from './BuildingManager'
import type { BuildingTemplate, Building } from '@/types/gamification'
import ErrorHandler from '@/utils/ErrorHandler'

// Простая реализация EventEmitter для браузера
class EventEmitter {
  private events: Map<string, Function[]> = new Map()

  on(event: string, listener: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(listener)
    return this
  }

  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(...args))
    }
    return listeners ? listeners.length > 0 : false
  }

  off(event: string, listener: Function) {
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
  private engine: BABYLON.Engine | null = null
  private scene: BABYLON.Scene | null = null
  private camera: BABYLON.ArcRotateCamera | null = null
  private canvas: HTMLCanvasElement
  private isInitialized = false

  // Сетка города
  private gridSize = 8
  private tileSize = 2
  private grid: BABYLON.Mesh[][] = []

  // Управление зданиями
  private buildingManager: BuildingManager | null = null

  constructor(canvas: HTMLCanvasElement) {
    super()
    this.canvas = canvas

    try {
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
        if (this.scene) {
          this.scene.render()
        }
      })

      // Обработка изменения размера
      window.addEventListener('resize', () => {
        if (this.engine) {
          this.engine.resize()
        }
      })

      this.isInitialized = true
    } catch (error) {
      this.handleError(error as Error, 'CityRenderer.constructor')
      // Очистка ресурсов при ошибке инициализации
      this.dispose()
    }
  }

  /**
   * Централизованный метод для обработки ошибок
   */
  private handleError(error: Error, context: string): void {
    ErrorHandler.handle(error, `CityRenderer.${context}`)
    this.emit('error', { error, context })
  }

  /**
   * Проверяет, инициализирован ли рендерер
   */
  private checkInitialized(context: string): boolean {
    if (!this.isInitialized || !this.engine || !this.scene) {
      this.handleError(new Error('Renderer not initialized'), context)
      return false
    }
    return true
  }

  private setupCamera(): void {
    try {
      if (!this.scene) {
        throw new Error('Scene not initialized')
      }

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
    } catch (error) {
      this.handleError(error as Error, 'setupCamera')
      throw error // Пробрасываем ошибку дальше, чтобы прервать инициализацию
    }
  }

  private setupLighting(): void {
    try {
      if (!this.scene) {
        throw new Error('Scene not initialized')
      }

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
    } catch (error) {
      this.handleError(error as Error, 'setupLighting')
      throw error // Пробрасываем ошибку дальше, чтобы прервать инициализацию
    }
  }

  private createGrid(): void {
    try {
      if (!this.scene) {
        throw new Error('Scene not initialized')
      }

      // Материал для сетки
      const gridMaterial = new BABYLON.StandardMaterial('gridMaterial', this.scene)
      gridMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9)
      gridMaterial.specularColor = new BABYLON.Color3(0, 0, 0)

      // Создание тайлов сетки
      for (let y = 0; y < this.gridSize; y++) {
        this.grid[y] = []
        for (let x = 0; x < this.gridSize; x++) {
          try {
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

            if (this.grid[y]) {
              this.grid[y][x] = tile
            }
          } catch (tileError) {
            this.handleError(tileError as Error, `createGrid.tile_${x}_${y}`)
          }
        }
      }
    } catch (error) {
      this.handleError(error as Error, 'createGrid')
      throw error // Пробрасываем ошибку дальше, чтобы прервать инициализацию
    }
  }

  private setupInteractions(): void {
    try {
      if (!this.scene) {
        throw new Error('Scene not initialized')
      }

      this.scene.onPointerObservable.add((pointerInfo) => {
        try {
          if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
            this.handlePointerMove(pointerInfo)
          } else if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
            this.handlePointerClick(pointerInfo)
          }
        } catch (error) {
          this.handleError(error as Error, 'setupInteractions.pointerHandler')
        }
      })

      // Обработка pinch-to-zoom для мобильных
      this.setupTouchGestures()
    } catch (error) {
      this.handleError(error as Error, 'setupInteractions')
    }
  }

  private setupTouchGestures(): void {
    try {
      if (!this.scene) {
        throw new Error('Scene not initialized')
      }

      // Простая обработка жестов для мобильных устройств
      let lastDistance = 0

      this.scene.onPointerObservable.add((pointerInfo) => {
        try {
          if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE &&
              (pointerInfo.event as any)?.pointerType === 'touch' &&
              (pointerInfo.event as any)?.touches?.length === 2) {

            // Расчет расстояния между двумя пальцами
            const touch1 = (pointerInfo.event as any).touches[0]
            const touch2 = (pointerInfo.event as any).touches[1]
            const distance = Math.sqrt(
              Math.pow(touch2.clientX - touch1.clientX, 2) +
              Math.pow(touch2.clientY - touch1.clientY, 2)
            )

            if (lastDistance > 0 && this.camera) {
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
        } catch (error) {
          this.handleError(error as Error, 'setupTouchGestures.handler')
        }
      })
    } catch (error) {
      this.handleError(error as Error, 'setupTouchGestures')
    }
  }

  private handlePointerMove(pointerInfo: BABYLON.PointerInfo): void {
    try {
      if (!this.scene || !this.buildingManager) {
        return
      }

      const pickResult = this.scene.pick(
        this.scene.pointerX,
        this.scene.pointerY,
        (mesh) => mesh.metadata && mesh.metadata.x !== undefined
      )

      if (pickResult?.hit && pickResult.pickedMesh) {
        const mesh = pickResult.pickedMesh
        
        // Проверка на null/undefined для metadata
        if (!mesh.metadata || mesh.metadata.x === undefined || mesh.metadata.y === undefined) {
          return
        }
        
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
    } catch (error) {
      this.handleError(error as Error, 'handlePointerMove')
    }
  }

  private handlePointerClick(pointerInfo: BABYLON.PointerInfo): void {
    try {
      if (!this.scene || !this.buildingManager) {
        return
      }

      const pickResult = this.scene.pick(
        this.scene.pointerX,
        this.scene.pointerY,
        (mesh) => mesh.metadata && mesh.metadata.x !== undefined
      )

      if (pickResult?.hit && pickResult.pickedMesh) {
        const mesh = pickResult.pickedMesh
        
        // Проверка на null/undefined для metadata
        if (!mesh.metadata || mesh.metadata.x === undefined || mesh.metadata.y === undefined) {
          return
        }
        
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
    } catch (error) {
      this.handleError(error as Error, 'handlePointerClick')
    }
  }

  // Публичные методы

  public enterBuildMode(template: BuildingTemplate): void {
    if (!this.checkInitialized('enterBuildMode') || !this.buildingManager) {
      return
    }

    try {
      this.buildingManager.startPlacing(template)
    } catch (error) {
      this.handleError(error as Error, 'enterBuildMode')
    }
  }

  public exitBuildMode(): void {
    if (!this.checkInitialized('exitBuildMode') || !this.buildingManager) {
      return
    }

    try {
      this.buildingManager.cancelPlacement()
    } catch (error) {
      this.handleError(error as Error, 'exitBuildMode')
    }
  }

  public addBuilding(building: Building): void {
    if (!this.checkInitialized('addBuilding') || !this.buildingManager) {
      return
    }

    try {
      if (building.x !== undefined && building.y !== undefined) {
        this.buildingManager.placeBuilding(building)
      }
    } catch (error) {
      this.handleError(error as Error, 'addBuilding')
    }
  }

  public createBuilding(template: BuildingTemplate, x: number, y: number): void {
    if (!this.checkInitialized('createBuilding') || !this.buildingManager) {
      return
    }

    try {
      const building = this.buildingManager.createBuilding(template, x, y)
      if (building) {
        this.buildingManager.placeBuilding(building)
      }
    } catch (error) {
      this.handleError(error as Error, 'createBuilding')
    }
  }

  public removeBuilding(buildingId: string): void {
    if (!this.checkInitialized('removeBuilding') || !this.buildingManager) {
      return
    }

    try {
      this.buildingManager.removeBuilding(buildingId)
    } catch (error) {
      this.handleError(error as Error, 'removeBuilding')
    }
  }

  public resetCamera(): void {
    if (!this.checkInitialized('resetCamera') || !this.camera) {
      return
    }

    try {
      this.camera.alpha = Math.PI / 4
      this.camera.beta = Math.PI / 3
      this.camera.radius = 20
      this.camera.setTarget(BABYLON.Vector3.Zero())
    } catch (error) {
      this.handleError(error as Error, 'resetCamera')
    }
  }

  public zoom(delta: number): void {
    if (!this.checkInitialized('zoom') || !this.camera) {
      return
    }

    try {
      this.camera.radius = Math.max(
        this.camera.lowerRadiusLimit || 10,
        Math.min(this.camera.upperRadiusLimit || 30, this.camera.radius - delta)
      )
    } catch (error) {
      this.handleError(error as Error, 'zoom')
    }
  }

  public dispose(): void {
    try {
      // Удаляем слушатель событий изменения размера
      window.removeEventListener('resize', () => {
        if (this.engine) {
          this.engine.resize()
        }
      })

      // Очищаем BuildingManager
      if (this.buildingManager) {
        this.buildingManager.dispose()
        this.buildingManager = null
      }

      // Очищаем сцену
      if (this.scene) {
        this.scene.dispose()
        this.scene = null
      }

      // Очищаем движок
      if (this.engine) {
        this.engine.dispose()
        this.engine = null
      }

      // Сбрасываем остальные свойства
      this.camera = null
      this.isInitialized = false
    } catch (error) {
      this.handleError(error as Error, 'dispose')
      // Принудительно сбрасываем состояние даже при ошибке
      this.engine = null
      this.scene = null
      this.camera = null
      this.buildingManager = null
      this.isInitialized = false
    }
  }
}