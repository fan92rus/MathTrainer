// Типы для системы геймификации

export interface Currency {
  coins: number;
  crystals: number;
}

export interface Player {
  level: number;
  experience: number;
  experienceToNext: number;
  totalCoinsEarned: number;
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
