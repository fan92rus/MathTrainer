import * as BABYLON from '@babylonjs/core'
import { ModelLoader } from './ModelLoader'
import type { ModelConfig } from './ModelLoader'
import type { Building } from '@/types/gamification'

export interface BuildingPrefab {
  id: string
  templateId: string
  modelConfig?: ModelConfig
  fallbackGeometry?: {
    type: 'box' | 'cylinder' | 'sphere'
    dimensions: { width: number; height: number; depth?: number }
  }
  materialColors?: {
    [level: number]: BABYLON.Color3
  }
  scaleFactor?: number
  offset?: { x: number; y: number; z: number }
}

export class BuildingPrefabs {
  private modelLoader: ModelLoader
  private prefabs: Map<string, BuildingPrefab> = new Map()

  constructor(modelLoader: ModelLoader) {
    this.modelLoader = modelLoader
    this.initializePrefabs()
  }

  private initializePrefabs(): void {
    // Жилые дома
    this.addPrefab({
      id: 'old_small_house',
      templateId: 'small_house',
      modelConfig: {
        id: 'old_small_house',
        modelPath: '/3d/old_small_hause.glb',
        scale: new BABYLON.Vector3(2.4, 2.4, 2.4), // Увеличили в 3 раза (0.8 * 3 = 2.4)
        rotation: new BABYLON.Vector3(-Math.PI / 2, Math.random() * Math.PI * 2, 0), // Поворачиваем на 90 градусов чтобы стоял правильно
        offset: { x: 0, y: 0, z: 0 }
      },
      materialColors: {
        1: new BABYLON.Color3(1.0, 0.8, 0.4), // Желтый
        2: new BABYLON.Color3(0.8, 1.0, 0.4), // Светло-зеленый
        3: new BABYLON.Color3(1.0, 0.6, 0.2)  // Оранжевый
      }
    })

    // Коттедж (модификация домика)
    this.addPrefab({
      id: 'cottage_variant',
      templateId: 'cottage',
      modelConfig: {
        id: 'old_small_house_cottage',
        modelPath: '/3d/old_small_hause.glb',
        scale: new BABYLON.Vector3(3.6, 3.3, 3.6), // Увеличили в 3 раза (1.2*3, 1.1*3, 1.2*3)
        rotation: new BABYLON.Vector3(-Math.PI / 2, Math.random() * Math.PI * 2, 0), // Поворачиваем на 90 градусов чтобы стоял правильно
        offset: { x: 0, y: 0.2, z: 0 }
      },
      materialColors: {
        1: new BABYLON.Color3(0.4, 0.8, 1.0), // Голубой
        2: new BABYLON.Color3(0.8, 0.4, 1.0), // Фиолетовый
        3: new BABYLON.Color3(1.0, 0.8, 0.8)  // Розовый
      }
    })

    // Многоквартирный дом (несколько домиков вместе)
    this.addPrefab({
      id: 'apartment_block',
      templateId: 'apartment',
      fallbackGeometry: {
        type: 'box',
        dimensions: { width: 1.6, height: 2.4, depth: 1.2 }
      },
      materialColors: {
        1: new BABYLON.Color3(0.6, 0.6, 0.8),
        2: new BABYLON.Color3(0.4, 0.6, 0.9),
        3: new BABYLON.Color3(0.2, 0.4, 0.8)
      },
      scaleFactor: 1.0
    })

    // Школа
    this.addPrefab({
      id: 'school_building',
      templateId: 'school',
      fallbackGeometry: {
        type: 'box',
        dimensions: { width: 1.4, height: 1.0, depth: 1.2 }
      },
      materialColors: {
        1: new BABYLON.Color3(0.2, 0.6, 1.0), // Синий
        2: new BABYLON.Color3(0.1, 0.5, 0.9),
        3: new BABYLON.Color3(0.0, 0.4, 0.8)
      }
    })

    // Больница
    this.addPrefab({
      id: 'hospital_building',
      templateId: 'hospital',
      fallbackGeometry: {
        type: 'box',
        dimensions: { width: 1.5, height: 1.1, depth: 1.3 }
      },
      materialColors: {
        1: new BABYLON.Color3(1.0, 0.2, 0.2), // Красный
        2: new BABYLON.Color3(0.9, 0.1, 0.1),
        3: new BABYLON.Color3(0.8, 0.0, 0.0)
      }
    })

    // Магазин
    this.addPrefab({
      id: 'shop_building',
      templateId: 'shop',
      fallbackGeometry: {
        type: 'box',
        dimensions: { width: 1.2, height: 0.9, depth: 1.0 }
      },
      materialColors: {
        1: new BABYLON.Color3(0.2, 0.8, 0.2), // Зеленый
        2: new BABYLON.Color3(0.1, 0.7, 0.1),
        3: new BABYLON.Color3(0.0, 0.6, 0.0)
      }
    })

    // Парк
    this.addPrefab({
      id: 'park_area',
      templateId: 'park',
      fallbackGeometry: {
        type: 'cylinder',
        dimensions: { width: 0.8, height: 0.6, depth: 0.8 }
      },
      materialColors: {
        1: new BABYLON.Color3(0.2, 0.9, 0.2), // Ярко-зеленый
        2: new BABYLON.Color3(0.1, 0.8, 0.1),
        3: new BABYLON.Color3(0.0, 0.7, 0.0)
      }
    })

    // Игровая площадка
    this.addPrefab({
      id: 'playground_structure',
      templateId: 'playground',
      fallbackGeometry: {
        type: 'box',
        dimensions: { width: 1.0, height: 0.7, depth: 1.0 }
      },
      materialColors: {
        1: new BABYLON.Color3(1.0, 0.6, 0.0), // Оранжевый
        2: new BABYLON.Color3(1.0, 0.4, 0.0),
        3: new BABYLON.Color3(1.0, 0.2, 0.0)
      }
    })
  }

  private addPrefab(prefab: BuildingPrefab): void {
    this.prefabs.set(prefab.templateId, prefab)
  }

  /**
   * Создает 3D модель здания
   */
  public async createBuilding(
    building: Building,
    tileSize: number,
    scene: BABYLON.Scene
  ): Promise<BABYLON.AbstractMesh[]> {
    const prefab = this.prefabs.get(building.type === 'residential' && building.name === 'Маленький домик'
      ? 'small_house'
      : building.type === 'residential' && building.name === 'Коттедж'
      ? 'cottage'
      : building.templateId || building.type
    )

    if (!prefab) {
      console.warn(`No prefab found for building: ${building.name}`)
      return this.createFallbackBuilding(building, tileSize, scene)
    }

    try {
      if (prefab.modelConfig) {
        // Загружаем GLB модель (используем оригинальный ID для кэширования)
        const modelConfig = { ...prefab.modelConfig }
        // НЕ меняем ID - это ломает кэширование!
        // modelConfig.id = `${building.id}_${Date.now()}`

        // Применяем трансформации в зависимости от уровня
        const scaleMultiplier = this.getScaleMultiplier(building.level, prefab.scaleFactor || 1.0)
        if (prefab.modelConfig.scale) {
          modelConfig.scale = prefab.modelConfig.scale.scale(scaleMultiplier)
        }

        const meshes = await this.modelLoader.loadModel(modelConfig)

        // Применяем цвет в зависимости от уровня
        if (prefab.materialColors && prefab.materialColors[building.level]) {
          const color = prefab.materialColors[building.level]

          for (const mesh of meshes) {
            if (mesh.material) {
              const newMaterial = this.modelLoader.createColoredMaterial(
                mesh.material,
                color!,
                `${building.id}_material_level_${building.level}`
              )
              mesh.material = newMaterial
            }

            // Применяем к дочерним элементам
            if (mesh.getChildMeshes) {
              const children = mesh.getChildMeshes()
              for (const child of children) {
                if (child.material) {
                  const newMaterial = this.modelLoader.createColoredMaterial(
                    child.material,
                    color!,
                    `${building.id}_child_material_level_${building.level}`
                  )
                  child.material = newMaterial
                }
              }
            }
          }
        }

        return meshes
      } else if (prefab.fallbackGeometry) {
        // Создаемfallback геометрию
        return this.createGeometryBuilding(
          prefab.fallbackGeometry,
          building,
          tileSize,
          prefab.materialColors,
          scene
        )
      }
    } catch (error) {
      console.error('Error loading building model:', error)
      console.warn('Falling back to simple geometry')
    }

    return this.createFallbackBuilding(building, tileSize, scene)
  }

  /**
   * Создает здание из базовой геометрии
   */
  private createGeometryBuilding(
    geometry: BuildingPrefab['fallbackGeometry'],
    building: Building,
    tileSize: number,
    materialColors?: { [level: number]: BABYLON.Color3 },
    scene: BABYLON.Scene
  ): BABYLON.AbstractMesh[] {
    if (!geometry) {
      return []
    }
    const color = materialColors?.[building.level] || new BABYLON.Color3(0.8, 0.8, 0.8)
    const material = new BABYLON.StandardMaterial(`${building.id}_material`, scene)
    material.diffuseColor = color
    material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2)

    let mesh: BABYLON.Mesh
    const baseScale = tileSize * 0.8

    if (geometry.type === 'box') {
      mesh = BABYLON.MeshBuilder.CreateBox(
        `building_${building.id}`,
        {
          width: geometry.dimensions.width * baseScale,
          height: geometry.dimensions.height * baseScale,
          depth: (geometry.dimensions.depth || 1) * baseScale
        },
        scene
      )
    } else if (geometry.type === 'cylinder') {
      mesh = BABYLON.MeshBuilder.CreateCylinder(
        `building_${building.id}`,
        {
          diameter: geometry.dimensions.width * baseScale,
          height: geometry.dimensions.height * baseScale
        },
        scene
      )
    } else {
      mesh = BABYLON.MeshBuilder.CreateSphere(
        `building_${building.id}`,
        {
          diameter: geometry.dimensions.width * baseScale
        },
        scene
      )
    }

    mesh.material = material

    return [mesh]
  }

  /**
   * Создает fallback здание (простой бокс)
   */
  private createFallbackBuilding(
    building: Building,
    tileSize: number,
    scene: BABYLON.Scene
  ): BABYLON.AbstractMesh[] {
    const height = tileSize * (1.0 + building.level * 0.4)
    const buildingMesh = BABYLON.MeshBuilder.CreateBox(
      `building_${building.id}`,
      {
        width: tileSize * 0.8,
        height: height,
        depth: tileSize * 0.8
      },
      scene
    )

    const material = new BABYLON.StandardMaterial(`buildingMaterial_${building.id}`, scene)

    switch (building.type) {
      case 'residential':
        material.diffuseColor = new BABYLON.Color3(1.0, 0.8, 0.4)
        break
      case 'public':
        material.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0)
        break
      case 'entertainment':
        material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.8)
        break
      default:
        material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8)
    }

    material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2)
    buildingMesh.material = material

    return [buildingMesh]
  }

  private getScaleMultiplier(level: number, baseScale: number): number {
    return baseScale * (1 + (level - 1) * 0.1)
  }
}