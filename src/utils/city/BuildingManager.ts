import * as BABYLON from '@babylonjs/core'
import type { BuildingTemplate, Building } from '@/types/gamification'

export enum BuildState {
  IDLE = 'idle',
  PLACING = 'placing',
  PLACED = 'placed'
}

export class BuildingManager {
  private scene: BABYLON.Scene
  private gridSize: number
  private tileSize: number

  // Управление состояниями
  private buildState: BuildState = BuildState.IDLE
  private selectedTemplate: BuildingTemplate | null = null
  private pendingPosition = { x: -1, y: -1 }

  // Управление объектами
  private buildings: Map<string, { mesh: BABYLON.Mesh, building: Building }> = new Map()
  private previewObject: BABYLON.Mesh | null = null
  private grid: BABYLON.Mesh[][]

  constructor(scene: BABYLON.Scene, gridSize: number, tileSize: number, grid: BABYLON.Mesh[][]) {
    this.scene = scene
    this.gridSize = gridSize
    this.tileSize = tileSize
    this.grid = grid
  }

  // Публичный API
  public getBuildState(): BuildState {
    return this.buildState
  }

  public getSelectedTemplate(): BuildingTemplate | null {
    return this.selectedTemplate
  }

  public startPlacing(template: BuildingTemplate): boolean {
    if (this.buildState !== BuildState.IDLE) {
      this.cancelPlacement()
    }

    this.buildState = BuildState.PLACING
    this.selectedTemplate = template
    this.createPreview()

    return true
  }

  public cancelPlacement(): void {
    this.returnToIdle()
  }

  public updatePreview(x: number, y: number): void {
    if (this.buildState !== BuildState.PLACING) return

    // Проверяем что не находимся в том же состоянии
    if (this.pendingPosition.x === x && this.pendingPosition.y === y) return

    // Обновляем позицию превью
    this.pendingPosition = { x, y }
    this.updatePreviewPosition(x, y)

    // Обновляем подсветку сетки
    this.updateGridHighlight(x, y)
  }

  public attemptPlace(x: number, y: number): { success: boolean, building?: Building } {
    if (this.buildState !== BuildState.PLACING || !this.selectedTemplate) {
      return { success: false }
    }

    // Проверяем можно ли построить
    if (!this.canBuildAt(x, y)) {
      return { success: false }
    }

    // Создаем здание сразу
    const building = this.createBuilding(this.selectedTemplate, x, y)
    if (building) {
      this.buildState = BuildState.PLACED
      this.addBuildingMesh(building, x, y)

      // Сразу сбрасываем состояние
      this.returnToIdle()

      return { success: true, building }
    }

    return { success: false }
  }

  public placeBuilding(building: Building): void {
    this.addBuildingMesh(building, building.x!, building.y!)
  }

  public removeBuilding(buildingId: string): void {
    const buildingData = this.buildings.get(buildingId)
    if (buildingData) {
      buildingData.mesh.dispose()
      this.buildings.delete(buildingId)
    }
  }

  public getBuildingAt(x: number, y: number): Building | null {
    for (const [, buildingData] of this.buildings) {
      if (buildingData.building.x === x && buildingData.building.y === y) {
        return buildingData.building
      }
    }
    return null
  }

  // Приватные методы
  private createPreview(): void {
    if (this.previewObject) {
      this.destroyPreview()
    }

    this.previewObject = BABYLON.MeshBuilder.CreateBox(
      'buildingPreview',
      {
        width: this.tileSize * 0.8,
        height: this.tileSize * 0.6,
        depth: this.tileSize * 0.8
      },
      this.scene
    )

    // Полупрозрачный материал
    const previewMaterial = new BABYLON.StandardMaterial('previewMaterial', this.scene)
    previewMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.8, 1)
    previewMaterial.alpha = 0.7
    this.previewObject.material = previewMaterial

    this.previewObject.position = new BABYLON.Vector3(-100, -100, -100) // Скрываем за пределами сцены
  }

  private destroyPreview(): void {
    if (this.previewObject) {
      this.previewObject.dispose()
      this.previewObject = null
    }
  }

  private updatePreviewPosition(x: number, y: number): void {
    if (!this.previewObject) return

    const worldX = (x - this.gridSize / 2) * this.tileSize + this.tileSize / 2
    const worldZ = (y - this.gridSize / 2) * this.tileSize + this.tileSize / 2

    this.previewObject.position = new BABYLON.Vector3(worldX, 0.3, worldZ)

    // Обновляем цвет в зависимости от доступности
    const material = this.previewObject.material as BABYLON.StandardMaterial
    if (this.canBuildAt(x, y)) {
      material.diffuseColor = new BABYLON.Color3(0.7, 1, 0.7) // Зеленый
      material.alpha = 0.7
    } else {
      material.diffuseColor = new BABYLON.Color3(1, 0.7, 0.7) // Красный
      material.alpha = 0.7
    }
  }

  private updateGridHighlight(x: number, y: number): void {
    // Сброс старой подсветки
    this.resetGridHighlights()

    // Подсветка текущей клетки
    const tile = this.grid[y]?.[x]
    if (tile && tile.material) {
      const material = tile.material as BABYLON.StandardMaterial

      if (this.canBuildAt(x, y)) {
        material.diffuseColor = new BABYLON.Color3(0.8, 1, 0.8) // Светло-зеленый
      } else {
        material.diffuseColor = new BABYLON.Color3(1, 0.8, 0.8) // Светло-красный
      }
    }
  }

  private resetGridHighlights(): void {
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const tile = this.grid[y]?.[x]
        if (tile && tile.material) {
          const material = tile.material as BABYLON.StandardMaterial
          material.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9) // Базовый серый
        }
      }
    }
  }

  private canBuildAt(x: number, y: number): boolean {
    // Проверка границ
    if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
      return false
    }

    // Проверка что клетка занята
    return !this.getBuildingAt(x, y)
  }

  public createBuilding(template: BuildingTemplate, x: number, y: number): Building | null {
    const building: Building = {
      id: `${template.id}_${Date.now()}`,
      name: template.name,
      type: template.type,
      cost: template.baseCost,
      level: 1,
      maxLevel: template.maxLevel,
      x,
      y,
      miniGame: template.miniGame,
      produces: template.type === 'residential' ? {
        type: 'coins',
        amount: template.baseCost / 10,
        interval: 1440,
      } : undefined,
    }

    return building
  }

  private addBuildingMesh(building: Building, x: number, y: number): void {
    const worldX = (x - this.gridSize / 2) * this.tileSize + this.tileSize / 2
    const worldZ = (y - this.gridSize / 2) * this.tileSize + this.tileSize / 2

    // Создание 3D модели здания
    const height = this.tileSize * (1.0 + building.level * 0.4) // Сделаем выше
    const buildingMesh = BABYLON.MeshBuilder.CreateBox(
      `building_${building.id}`,
      {
        width: this.tileSize * 0.8,
        height: height,
        depth: this.tileSize * 0.8
      },
      this.scene
    )

    buildingMesh.position = new BABYLON.Vector3(worldX, height / 2, worldZ)
    buildingMesh.metadata = { x, y, buildingId: building.id }

    // Материал в зависимости от типа
    const material = new BABYLON.StandardMaterial(`buildingMaterial_${building.id}`, this.scene)

    switch (building.type) {
      case 'residential':
        material.diffuseColor = new BABYLON.Color3(1.0, 0.8, 0.4) // Ярко-желтый
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2)
        break
      case 'public':
        material.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0) // Ярко-синий
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2)
        break
      case 'entertainment':
        material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.8) // Ярко-розовый
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2)
        break
      default:
        material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8) // Светло-серый
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2)
    }

    buildingMesh.material = material

    // Сохранение в мапу
    this.buildings.set(building.id, { mesh: buildingMesh, building })

    // Анимация появления
    this.animateBuildingAppear(buildingMesh)
  }

  private animateBuildingAppear(mesh: BABYLON.Mesh): void {
    mesh.scaling = new BABYLON.Vector3(0.1, 0, 0.1)

    const animation = BABYLON.Animation.CreateAndStartAnimation(
      'buildingAppear',
      mesh,
      'scaling',
      30,
      15,
      new BABYLON.Vector3(0.1, 0, 0.1),
      new BABYLON.Vector3(1, 1, 1),
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    )

    if (animation) {
      // Пропускаем easingFunction для совместимости
      // animation.setEasingFunction(new BABYLON.BounceEase())
    }
  }

  private returnToIdle(): void {
    this.buildState = BuildState.IDLE
    this.selectedTemplate = null
    this.pendingPosition = { x: -1, y: -1 }
    this.destroyPreview()
    this.resetGridHighlights()
    console.log('BuildingManager: возвращен в IDLE, подсветка сброшена')
  }

  public dispose(): void {
    this.cancelPlacement()

    for (const [_, buildingData] of this.buildings) {
      buildingData.mesh.dispose()
    }
    this.buildings.clear()
  }
}