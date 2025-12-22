import { defineStore } from 'pinia';
import type { Building, City, GridCell, BuildingTemplate } from '@/types/gamification';
import { useLocalStorage } from '@vueuse/core';
import { BuildingService } from '@/services/BuildingService';

// Шаблоны зданий
const buildingTemplates: BuildingTemplate[] = [
  // Жилые дома
  {
    id: 'small_house',
    name: 'Маленький домик',
    type: 'residential',
    baseCost: 10,
    maxLevel: 3,
    icon: '🏠',
    description: 'Маленький уютный дом для 3 жителей',
  },
  {
    id: 'cottage',
    name: 'Коттедж',
    type: 'residential',
    baseCost: 25,
    maxLevel: 3,
    icon: '🏡',
    description: 'Просторный коттедж для 8 жителей',
  },
  {
    id: 'apartment',
    name: 'Многоквартирный дом',
    type: 'residential',
    baseCost: 50,
    maxLevel: 3,
    icon: '🏢',
    description: 'Большой дом для 20 жителей',
  },
  // Общественные здания
  {
    id: 'school',
    name: 'Школа',
    type: 'public',
    baseCost: 30,
    maxLevel: 3,
    icon: '🏫',
    description: 'Увеличивает награды за упражнения',
    miniGame: {
      id: 'school_math',
      name: 'Урок математики',
      description: 'Реши примеры с учителем',
    },
  },
  {
    id: 'hospital',
    name: 'Больница',
    type: 'public',
    baseCost: 35,
    maxLevel: 3,
    icon: '🏥',
    description: 'Дает ежедневный бонус +10 монет',
    miniGame: {
      id: 'pharmacy',
      name: 'Аптека',
      description: 'Считай таблетки и лекарства',
    },
  },
  {
    id: 'shop',
    name: 'Магазин',
    type: 'public',
    baseCost: 20,
    maxLevel: 3,
    icon: '🏪',
    description: 'Позволяет покупать улучшения',
    miniGame: {
      id: 'cashier',
      name: 'Кассир',
      description: 'Считай сдачу и цены',
    },
  },
  // Развлекательные объекты
  {
    id: 'park',
    name: 'Парк',
    type: 'entertainment',
    baseCost: 15,
    maxLevel: 3,
    icon: '🌳',
    description: 'Повышает настроение жителей',
    miniGame: {
      id: 'football',
      name: 'Футбол',
      description: 'Забей гол решив пример',
    },
  },
  {
    id: 'playground',
    name: 'Игровая площадка',
    type: 'entertainment',
    baseCost: 20,
    maxLevel: 3,
    icon: '🎠',
    description: 'Дети дарят дополнительные монетки',
    miniGame: {
      id: 'swings',
      name: 'Качели',
      description: 'Взмахивай качелями правильными ответами',
    },
  },
];

export const useCityStore = defineStore('city', () => {
  // Состояние с локальным сохранением
  const city = useLocalStorage<City>('city', {
    buildings: [],
    population: 0,
    happiness: 100,
    lastDailyBonus: '',
    currentStreak: 0,
  });

  const gridSize = 8; // 8x8 сетка города

  // Получить доступные шаблоны зданий
  const getAvailableBuildings = () => {
    return buildingTemplates;
  };

  // Получить здание по ID
  const getBuildingTemplate = (id: string) => {
    return buildingTemplates.find(b => b.id === id);
  };

  // Построить здание
  const buildBuilding = (templateId: string, x: number, y: number) => {
    const template = getBuildingTemplate(templateId);
    if (!template) return false;

    // Используем BuildingService для валидации координат
    if (!BuildingService.validateBuildingPosition(x, y, gridSize)) {
      return false;
    }

    const existingBuilding = city.value.buildings.find(b => b.x === x && b.y === y);
    if (existingBuilding) return false; // Ячейка занята

    // Используем BuildingService для создания здания
    const newBuilding = BuildingService.createBuilding(template, x, y);

    city.value.buildings.push(newBuilding);
    updateCityStats();
    return true;
  };

  // Улучшить здание
  const upgradeBuilding = (buildingId: string) => {
    const building = city.value.buildings.find(b => b.id === buildingId);
    if (!building || building.level >= building.maxLevel) return false;

    const upgradeCost = Math.floor(building.cost * 0.5);
    building.level++;
    building.cost += upgradeCost;

    // Увеличиваем производство
    if (building.produces) {
      building.produces.amount = Math.floor(building.produces.amount * 1.5);
    }

    updateCityStats();
    return true;
  };

  // Удалить здание
  const removeBuilding = (buildingId: string) => {
    const index = city.value.buildings.findIndex(b => b.id === buildingId);
    if (index !== -1) {
      city.value.buildings.splice(index, 1);
      updateCityStats();
      return true;
    }
    return false;
  };

  // Обновить статистику города
  const updateCityStats = () => {
    // Используем BuildingService для расчета населения
    let population = 0;
    city.value.buildings.forEach(building => {
      population += BuildingService.calculatePopulation(building);
    });

    city.value.population = population;
  };

  // Получить сетку города
  const getCityGrid = (): GridCell[][] => {
    const grid: GridCell[][] = [];

    for (let y = 0; y < gridSize; y++) {
      const row: GridCell[] = [];
      for (let x = 0; x < gridSize; x++) {
        const building = city.value.buildings.find(b => b.x === x && b.y === y);
        row.push({
          x,
          y,
          building,
        });
      }
      grid.push(row);
    }

    return grid;
  };

  // Получить здания по типу
  const getBuildingsByType = (type: Building['type']) => {
    return city.value.buildings.filter(b => b.type === type);
  };

  // Проверить можно ли построить на клетке
  const canBuildOn = (x: number, y: number) => {
    // Используем BuildingService для проверки границ
    if (!BuildingService.validateBuildingPosition(x, y, gridSize)) {
      return false;
    }
    
    return !city.value.buildings.some(b => b.x === x && b.y === y);
  };

  return {
    city,
    gridSize,
    getAvailableBuildings,
    getBuildingTemplate,
    buildBuilding,
    upgradeBuilding,
    removeBuilding,
    updateCityStats,
    getCityGrid,
    getBuildingsByType,
    canBuildOn,
  };
});