// Типы для системы геймификации

export interface Currency {
  coins: number;
  crystals: number;
}

export interface Building {
  id: string;
  name: string;
  type: 'residential' | 'public' | 'entertainment' | 'infrastructure' | 'special';
  cost: number;
  level: number;
  maxLevel: number;
  x?: number;
  y?: number;
  produces?: {
    type: 'coins' | 'crystals' | 'experience';
    amount: number;
    interval: number; // в минутах
  };
  miniGame?: {
    id: string;
    name: string;
    description: string;
  };
}

export interface Player {
  level: number;
  experience: number;
  experienceToNext: number;
  totalCoinsEarned: number;
  cityLevel: number;
  unlockedBuildings: string[];
}

export type DailyTaskType =
  | 'equations'
  | 'multiplication'
  | 'counting'
  | 'decomposition'
  | 'decomposition_easy'
  | 'columnSubtraction'
  | 'equationsWholePart';

export interface DailyTask {
  id: string;
  type: DailyTaskType;
  description: string;
  target: number;
  current: number;
  reward: {
    coins: number;
    experience: number;
  };
  completed: boolean;
}

export interface City {
  buildings: Building[];
  population: number;
  happiness: number;
  lastDailyBonus: string;
  currentStreak: number;
}

export interface MiniGame {
  id: string;
  name: string;
  description: string;
  type: 'math' | 'counting' | 'logic';
  difficulty: 'easy' | 'medium' | 'hard';
  rewards: {
    coins: number;
    experience: number;
  };
}

// Типы для сетки города
export interface GridCell {
  x: number;
  y: number;
  building?: Building;
  isRoad?: boolean;
}

export interface BuildingTemplate {
  id: string;
  name: string;
  type: Building['type'];
  baseCost: number;
  maxLevel: number;
  icon: string;
  description: string;
  requirements?: {
    playerLevel?: number;
    buildings?: string[];
  };
  miniGame?: {
    id: string;
    name: string;
    description: string;
  };
}