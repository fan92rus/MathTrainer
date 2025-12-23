/* global Phaser */
export interface TileData {
  gridX: number
  gridY: number
  screenX: number
  screenY: number
  tile: Phaser.GameObjects.Image
  type: number
}

export interface BuildingData {
  id: string
  name: string
  type: BuildingType
  gridX: number
  gridY: number
  level: number
  cost: {
    coins?: number
    crystals?: number
  }
  production?: {
    coins?: number
    crystals?: number
    experience?: number
  }
  lastCollected?: number
}

export enum BuildingType {
  HOUSE = 'house',
  SHOP = 'shop',
  FACTORY = 'factory',
  PARK = 'park',
  ROAD = 'road'
}

export interface CityData {
  name: string
  level: number
  experience: number
  experienceToNextLevel: number
  buildings: BuildingData[]
  unlockedBuildingTypes: BuildingType[]
}

export interface GridPosition {
  x: number
  y: number
}

export interface CameraBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}