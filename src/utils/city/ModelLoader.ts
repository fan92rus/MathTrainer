import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders'

export interface ModelConfig {
  id: string
  modelPath: string
  scale?: BABYLON.Vector3
  rotation?: BABYLON.Vector3
  position?: BABYLON.Vector3
  offset?: { x: number; y: number; z: number }
  animations?: AnimationConfig[]
}

export interface AnimationConfig {
  name: string
  autoPlay?: boolean
  loop?: boolean
  speedRatio?: number
}

export class ModelLoader {
  private scene: BABYLON.Scene
  private loadedModels: Map<string, BABYLON.AbstractMesh[]> = new Map()
  private loadingPromises: Map<string, Promise<BABYLON.AbstractMesh[]>> = new Map()

  constructor(scene: BABYLON.Scene) {
    this.scene = scene
  }

  /**
   * Загружает GLB/GLTF модель
   */
  public async loadModel(config: ModelConfig): Promise<BABYLON.AbstractMesh[]> {
    // Если модель уже загружена, возвращаем кэшированный результат
    if (this.loadedModels.has(config.id)) {
      return this.cloneModel(config.id, config)
    }

    // Если модель в процессе загрузки, возвращаем промис
    if (this.loadingPromises.has(config.id)) {
      await this.loadingPromises.get(config.id)!
      return this.cloneModel(config.id, config)
    }

    // Загружаем модель
    const loadingPromise = this.loadGLB(config.modelPath)
    this.loadingPromises.set(config.id, loadingPromise)

    try {
      const meshes = await loadingPromise
      this.loadedModels.set(config.id, meshes)
      this.loadingPromises.delete(config.id)

      // Настраиваем анимации
      this.setupAnimations(meshes, config.animations)

      return meshes
    } catch (error) {
      this.loadingPromises.delete(config.id)
      throw error
    }
  }

  /**
   * Клонирует загруженную модель
   */
  private async cloneModel(modelId: string, config: ModelConfig): Promise<BABYLON.AbstractMesh[]> {
    const originalMeshes = this.loadedModels.get(modelId)
    if (!originalMeshes) {
      throw new Error(`Model ${modelId} not loaded`)
    }

    const clonedMeshes: BABYLON.AbstractMesh[] = []

    for (const mesh of originalMeshes) {
      // Создаем клон с абсолютно уникальным именем
      const cloned = mesh.clone(`${config.id}_${Date.now()}_${Math.random()}_${mesh.id}`, null)
      if (cloned) {
        clonedMeshes.push(cloned)

        // Создаем уникальный материал для каждого клона
        if (mesh.material) {
          const originalMaterial = mesh.material
          const newMaterial = this.createUniqueMaterial(
            originalMaterial,
            config.id + '_' + Date.now() + '_' + Math.random()
          )
          cloned.material = newMaterial
        }

        // Применяем трансформации
        if (config.scale) {
          cloned.scaling = config.scale
        }
        if (config.rotation) {
          cloned.rotation = config.rotation
        }
        if (config.position) {
          cloned.position = config.position
        }

        // НЕ сбрасываем позицию перед применением offset - это ломает позиционирование!
        // Вместо этого применяем offset к текущей позиции если он указан
        if (config.offset) {
          cloned.position = cloned.position.add(new BABYLON.Vector3(
            config.offset.x || 0,
            config.offset.y || 0,
            config.offset.z || 0
          ))
        }

        // Обновляем bounding info для правильного позиционирования
        if (cloned instanceof BABYLON.Mesh) {
          cloned.computeWorldMatrix(true)
        }
      }
    }

    // НЕ центрируем - это ломает позиционирование!
    // this.centerClonedMeshes(clonedMeshes)

    return clonedMeshes
  }

  /**
   * Центрирует клонированные меши
   */
  private centerClonedMeshes(meshes: BABYLON.AbstractMesh[]): void {
    if (meshes.length === 0) return

    // Сначала вычисляем world matrix для всех мешей
    meshes.forEach(mesh => {
      if (mesh instanceof BABYLON.Mesh) {
        mesh.computeWorldMatrix(true)
      }
    })

    // Вычисляем центр ограничивающей коробки
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    let minZ = Infinity, maxZ = -Infinity

    for (const mesh of meshes) {
      if (mesh.getBoundingInfo) {
        const boundingBox = mesh.getBoundingInfo().boundingBox
        const vectors = [
          boundingBox.minimumWorld,
          boundingBox.maximumWorld
        ]

        vectors.forEach(vector => {
          minX = Math.min(minX, vector.x)
          maxX = Math.max(maxX, vector.x)
          minY = Math.min(minY, vector.y)
          maxY = Math.max(maxY, vector.y)
          minZ = Math.min(minZ, vector.z)
          maxZ = Math.max(maxZ, vector.z)
        })
      }
    }

    const centerX = (minX + maxX) / 2
    const centerY = minY // Помещаем на землю
    const centerZ = (minZ + maxZ) / 2

    console.log(`Centering cloned model to (${centerX}, ${centerY}, ${centerZ})`)

    // Сдвигаем все меши
    for (const mesh of meshes) {
      mesh.position.x -= centerX
      mesh.position.y -= centerY
      mesh.position.z -= centerZ
    }
  }

  /**
   * Загружает GLB/GLTF файл
   */
  private async loadGLB(modelPath: string): Promise<BABYLON.AbstractMesh[]> {
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ImportMesh(
        '',
        modelPath,
        '',
        this.scene,
        (meshes) => {
          console.log('GLB loaded successfully:', meshes.length, 'meshes')

          // Не центрируем здесь - это ломает позиционирование!
          // Центрирование будет происходить в cloneModel

          // Включаем тени для всех мешей
          meshes.forEach(mesh => {
            if (mesh instanceof BABYLON.Mesh) {
              mesh.receiveShadows = true
            }
          })

          resolve(meshes)
        },
        (evt) => {
          if (evt.lengthComputable) {
            console.log('Loading progress:', (evt.loaded * 100 / evt.total).toFixed() + '%')
          }
        },
        (error) => {
          console.error('Error loading GLB model:', error)
          reject(error)
        }
      )
    })
  }

  /**
   * Центрирует модель относительно начала координат
   */
  private centerModel(meshes: BABYLON.AbstractMesh[]): void {
    if (meshes.length === 0) return

    // Сначала вычисляем world matrix для всех мешей
    meshes.forEach(mesh => {
      if (mesh instanceof BABYLON.Mesh) {
        mesh.computeWorldMatrix(true)
      }
    })

    // Вычисляем центр ограничивающей коробки
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    let minZ = Infinity, maxZ = -Infinity

    for (const mesh of meshes) {
      if (mesh.getBoundingInfo) {
        const boundingBox = mesh.getBoundingInfo().boundingBox
        const vectors = [
          boundingBox.minimumWorld,
          boundingBox.maximumWorld
        ]

        vectors.forEach(vector => {
          minX = Math.min(minX, vector.x)
          maxX = Math.max(maxX, vector.x)
          minY = Math.min(minY, vector.y)
          maxY = Math.max(maxY, vector.y)
          minZ = Math.min(minZ, vector.z)
          maxZ = Math.max(maxZ, vector.z)
        })
      }
    }

    const centerX = (minX + maxX) / 2
    const centerY = minY // Помещаем на землю
    const centerZ = (minZ + maxZ) / 2

    console.log(`Centering model to (${centerX}, ${centerY}, ${centerZ})`)

    // Сдвигаем все меши
    for (const mesh of meshes) {
      mesh.position.x -= centerX
      mesh.position.y -= centerY
      mesh.position.z -= centerZ
    }
  }

  /**
   * Настраивает анимации модели
   */
  private setupAnimations(meshes: BABYLON.AbstractMesh[], animations?: AnimationConfig[]): void {
    if (!animations) return

    for (const config of animations) {
      for (const mesh of meshes) {
        const animationGroups = (mesh as any).animationGroups || []

        for (const animationGroup of animationGroups) {
          if (animationGroup.name === config.name) {
            if (config.autoPlay !== false) {
              animationGroup.play(config.loop !== false)
            }
            if (config.speedRatio) {
              animationGroup.speedRatio = config.speedRatio
            }
          }
        }
      }
    }
  }

  /**
   * Создает уникальный материал для клона
   */
  private createUniqueMaterial(baseMaterial: BABYLON.Material, uniqueName: string): BABYLON.Material {
    if (baseMaterial instanceof BABYLON.StandardMaterial) {
      const newMaterial = new BABYLON.StandardMaterial(uniqueName, this.scene)

      // Копируем все свойства из оригинала
      newMaterial.diffuseColor = baseMaterial.diffuseColor
      newMaterial.specularColor = baseMaterial.specularColor
      newMaterial.ambientColor = baseMaterial.ambientColor
      newMaterial.emissiveColor = baseMaterial.emissiveColor
      newMaterial.alpha = baseMaterial.alpha

      // Копируем все текстуры
      if (baseMaterial.diffuseTexture) {
        newMaterial.diffuseTexture = baseMaterial.diffuseTexture
      }
      if (baseMaterial.bumpTexture) {
        newMaterial.bumpTexture = baseMaterial.bumpTexture
      }
      if (baseMaterial.specularTexture) {
        newMaterial.specularTexture = baseMaterial.specularTexture
      }
      if (baseMaterial.emissiveTexture) {
        newMaterial.emissiveTexture = baseMaterial.emissiveTexture
      }

      // UV настройки копируются через текстуру, а не через материал

      // Делаем материал уникальным через небольшое изменение emissive
      const slightChange = Math.random() * 0.02 - 0.01
      newMaterial.emissiveColor = new BABYLON.Color3(
        newMaterial.emissiveColor.r + slightChange,
        newMaterial.emissiveColor.g + slightChange,
        newMaterial.emissiveColor.b + slightChange
      )

      console.log(`Created unique material: ${uniqueName}`)
      return newMaterial
    } else {
      // Для других типов материалов просто клонируем
      const cloned = baseMaterial.clone(uniqueName)
      if (cloned) {
        return cloned
      }
      // Если клонирование не удалось, создаем стандартный материал
      return new BABYLON.StandardMaterial(uniqueName, this.scene)
    }
  }

  /**
   * Создает материал для перекраски модели
   */
  public createColoredMaterial(
    baseMaterial: BABYLON.Material,
    color: BABYLON.Color3,
    name?: string
  ): BABYLON.StandardMaterial {
    const newMaterial = new BABYLON.StandardMaterial(
      name || `colored_${Date.now()}`,
      this.scene
    )

    // Сохраняем текстуры из базового материала
    if (baseMaterial instanceof BABYLON.StandardMaterial) {
      // Копируем текстуру диффузного цвета если она есть
      if (baseMaterial.diffuseTexture) {
        newMaterial.diffuseTexture = baseMaterial.diffuseTexture
      } else {
        // Если текстуры нет, применяем цвет
        newMaterial.diffuseColor = color
      }

      // Добавляем цветовую tint чтобы изменить оттенок
      newMaterial.diffuseColor = color
      newMaterial.emissiveColor = color.scale(0.2) // Немного подсветки

      // Копируем остальные свойства
      newMaterial.specularColor = baseMaterial.specularColor
      newMaterial.ambientColor = baseMaterial.ambientColor
      newMaterial.alpha = baseMaterial.alpha

      // Копируем другие текстуры
      if (baseMaterial.bumpTexture) {
        newMaterial.bumpTexture = baseMaterial.bumpTexture
      }
      if (baseMaterial.specularTexture) {
        newMaterial.specularTexture = baseMaterial.specularTexture
      }
      if (baseMaterial.emissiveTexture) {
        newMaterial.emissiveTexture = baseMaterial.emissiveTexture
      }

      // UV настройки копируются через текстуру, а не через материал
    } else {
      newMaterial.diffuseColor = color
    }

    return newMaterial
  }

  /**
   * Применяет материал к всем меши модели
   */
  public applyMaterialToModel(meshes: BABYLON.AbstractMesh[], material: BABYLON.Material): void {
    for (const mesh of meshes) {
      if (mesh.material) {
        mesh.material = material
      }
      // Также применяем к дочерним меши
      if (mesh.getChildMeshes) {
        const children = mesh.getChildMeshes()
        for (const child of children) {
          child.material = material
        }
      }
    }
  }

  /**
   * Очищает все загруженные модели
   */
  public dispose(): void {
    for (const [_, meshes] of this.loadedModels) {
      for (const mesh of meshes) {
        mesh.dispose()
      }
    }
    this.loadedModels.clear()
    this.loadingPromises.clear()
  }
}