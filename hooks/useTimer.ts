// Powered by OnSpace.AI
import { useContext } from 'react';
import { TimerContext } from '@/contexts/TimerContext';

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within TimerProvider');
  return context;
}
