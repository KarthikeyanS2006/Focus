// Powered by Sakura Focus - Companion Context
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CompanionState } from '@/types/companion';

interface CompanionContextType {
  state: CompanionState;
  updateScreen: (screen: string) => void;
  updateStats: (stats: Partial<CompanionState>) => void;
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
}

const defaultState: CompanionState = {
  currentScreen: 'focus',
  todayMinutes: 0,
  streak: 0,
  distractionCount: 0,
  sessionGoal: undefined,
  isActive: true,
};

export const CompanionContext = createContext<CompanionContextType>({
  state: defaultState,
  updateScreen: () => {},
  updateStats: () => {},
  isVisible: true,
  setVisible: () => {},
});

export function CompanionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CompanionState>(defaultState);
  const [isVisible, setVisible] = useState(true);

  const updateScreen = useCallback((screen: string) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  }, []);

  const updateStats = useCallback((stats: Partial<CompanionState>) => {
    setState(prev => ({ ...prev, ...stats }));
  }, []);

  return (
    <CompanionContext.Provider value={{ state, updateScreen, updateStats, isVisible, setVisible }}>
      {children}
    </CompanionContext.Provider>
  );
}

export function useCompanion() {
  return useContext(CompanionContext);
}
