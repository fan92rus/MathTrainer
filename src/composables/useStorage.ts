export interface UseStorage {
   
  getItem: (key: string) => string | null;
   
  setItem: (key: string, value: string) => void;
   
  removeItem: (key: string) => void;
   
  getObject: <T = unknown>(key: string) => T | null;
   
  setObject: <T = unknown>(key: string, value: T) => void;
}

export function useStorage(): UseStorage {
  const getItem = (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item from localStorage: ${error}`);
      return null;
    }
  };

  const setItem = (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item to localStorage: ${error}`);
    }
  };

  const removeItem = (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${error}`);
    }
  };

  const getObject = <T = unknown>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting object from localStorage: ${error}`);
      return null;
    }
  };

  const setObject = <T = unknown>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting object to localStorage: ${error}`);
    }
  };

  return {
    getItem,
    setItem,
    removeItem,
    getObject,
    setObject
  };
}

// Композабл для работы с очками в localStorage
export function useScoreStorage(
  gameType: 'counting' | 'decomposition' | 'multiplication' | 'equations'
) {
  const { getItem, setItem, getObject, setObject } = useStorage();

  const scoreKeys = {
    counting: 'countingTrainerTotalScore',
    decomposition: 'mathTrainerTotalScore',
    multiplication: 'multiplicationTrainerTotalScore',
    equations: 'equationsTrainerTotalScore'
  };

  const loadScore = (): number => {
    const saved = getItem(scoreKeys[gameType]);
    return saved ? parseInt(saved, 10) : 0;
  };

  const saveScore = (score: number): void => {
    setItem(scoreKeys[gameType], score.toString());
  };

  const loadScoreObject = (): { score: number; timestamp?: number } => {
    return getObject(scoreKeys[gameType]) || { score: 0 };
  };

  const saveScoreObject = (score: number): void => {
    setObject(scoreKeys[gameType], {
      score,
      timestamp: Date.now()
    });
  };

  const resetScore = (): void => {
    setItem(scoreKeys[gameType], '0');
  };

  return {
    loadScore,
    saveScore,
    loadScoreObject,
    saveScoreObject,
    resetScore
  };
}
