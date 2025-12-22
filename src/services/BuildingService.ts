import type { BuildingTemplate, Building } from '@/types/gamification';

export class BuildingService {
  /**
   * Создает новое здание на основе шаблона и координат
   * @param template Шаблон здания
   * @param x Координата X
   * @param y Координата Y
   * @returns Созданное здание
   */
  static createBuilding(template: BuildingTemplate, x: number, y: number): Building {
    return {
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
    };
  }

  /**
   * Вычисляет население на основе типа и уровня здания
   * @param building Здание
   * @returns Количество жителей
   */
  static calculatePopulation(building: Building): number {
    if (building.type !== 'residential') {
      return 0;
    }

    let basePopulation = 0;
    switch (building.name) {
      case 'Маленький домик':
        basePopulation = 3;
        break;
      case 'Коттедж':
        basePopulation = 8;
        break;
      case 'Многоквартирный дом':
        basePopulation = 20;
        break;
      default:
        basePopulation = 0;
    }

    return basePopulation * building.level;
  }

  /**
   * Проверяет валидность координат для размещения здания
   * @param x Координата X
   * @param y Координата Y
   * @param gridSize Размер сетки
   * @returns true если координаты валидны
   */
  static validateBuildingPosition(x: number, y: number, gridSize: number): boolean {
    // Проверка границ
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
      return false;
    }

    return true;
  }

  /**
   * Рассчитывает производство ресурсов для здания
   * @param building Здание
   * @returns Объект с информацией о производстве
   */
  static calculateProduction(building: Building): { type: string, amount: number, interval: number } | null {
    if (!building.produces) {
      return null;
    }

    return {
      type: building.produces.type,
      amount: building.produces.amount * building.level,
      interval: building.produces.interval
    };
  }
}