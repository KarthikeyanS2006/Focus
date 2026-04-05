// Powered by OnSpace.AI
export type TimerPhase = 'focus' | 'break' | 'idle';

export type SessionStatus = 'completed' | 'abandoned';

export interface Session {
  id: string;
  date: string; // ISO string
  phase: 'focus' | 'break';
  durationMinutes: number;
  status: SessionStatus;
  penalty: boolean;
  distractionCount?: number;
}

export interface DailyStats {
  date: string;
  focusMinutes: number;
  sessionsCompleted: number;
  sessionsAbandoned: number;
  distractions: number;
}
