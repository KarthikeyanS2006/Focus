// Powered by OnSpace.AI
export type TimerPhase = 'focus' | 'break' | 'idle';

export type SessionStatus = 'completed' | 'abandoned';

export type DistractionCategory = 
  | 'social_media'
  | 'games'
  | 'youtube'
  | 'messaging'
  | 'browsing'
  | 'calls'
  | 'other';

export interface DistractionLog {
  id: string;
  category: DistractionCategory;
  appName?: string;
  timestamp: string;
}

export interface Session {
  id: string;
  date: string;
  phase: 'focus' | 'break';
  durationMinutes: number;
  status: SessionStatus;
  penalty: boolean;
  distractionCount?: number;
  distractions?: DistractionLog[];
  goal?: string;
}

export interface DailyStats {
  date: string;
  focusMinutes: number;
  sessionsCompleted: number;
  sessionsAbandoned: number;
  distractions: number;
}

export interface BlockedApp {
  id: string;
  name: string;
  category: DistractionCategory;
}

export interface UserProfile {
  name: string;
  isNewUser: boolean;
  createdAt: string;
  dailyGoalMinutes: number;
}

export interface GoalTarget {
  id: string;
  title: string;
  targetDate: string;
  startDate: string;
  createdAt: string;
  completed: boolean;
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
}

export const DISTRACTION_CATEGORIES: { id: DistractionCategory; label: string; icon: string }[] = [
  { id: 'social_media', label: 'Social Media', icon: 'people' },
  { id: 'games', label: 'Games', icon: 'sports-esports' },
  { id: 'youtube', label: 'YouTube/Video', icon: 'play-circle-filled' },
  { id: 'messaging', label: 'Messaging', icon: 'chat' },
  { id: 'browsing', label: 'Web Browsing', icon: 'language' },
  { id: 'calls', label: 'Phone Calls', icon: 'phone' },
  { id: 'other', label: 'Other', icon: 'more-horiz' },
];

export const DEFAULT_BLOCKED_APPS: Omit<BlockedApp, 'id'>[] = [
  { name: 'Instagram', category: 'social_media' },
  { name: 'TikTok', category: 'social_media' },
  { name: 'Facebook', category: 'social_media' },
  { name: 'Snapchat', category: 'social_media' },
  { name: 'Twitter/X', category: 'social_media' },
  { name: 'YouTube', category: 'youtube' },
  { name: 'Netflix', category: 'youtube' },
  { name: 'WhatsApp', category: 'messaging' },
  { name: 'Telegram', category: 'messaging' },
  { name: 'PUBG', category: 'games' },
  { name: 'Free Fire', category: 'games' },
  { name: 'Candy Crush', category: 'games' },
];
