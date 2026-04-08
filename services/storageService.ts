// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, DailyStats, BlockedApp, UserProfile, GoalTarget, DEFAULT_BLOCKED_APPS } from '@/types';
import { differenceInDays, parseISO } from 'date-fns';

const KEYS = {
  sessions: 'focus_sessions',
  streak: 'focus_streak',
  lastStreakDate: 'focus_last_streak_date',
  blockedApps: 'focus_blocked_apps',
  userProfile: 'focus_user_profile',
  goalTargets: 'focus_goal_targets',
};

export async function getSessions(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.sessions);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveSession(session: Session): Promise<void> {
  const existing = await getSessions();
  const updated = [session, ...existing].slice(0, 200);
  await AsyncStorage.setItem(KEYS.sessions, JSON.stringify(updated));
}

export async function getStreak(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.streak);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export async function updateStreak(): Promise<number> {
  const today = new Date().toDateString();
  const lastDate = await AsyncStorage.getItem(KEYS.lastStreakDate);
  const currentStreak = await getStreak();

  if (lastDate === today) {
    return currentStreak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = lastDate === yesterday.toDateString();

  const newStreak = wasYesterday ? currentStreak + 1 : 1;
  await AsyncStorage.setItem(KEYS.streak, String(newStreak));
  await AsyncStorage.setItem(KEYS.lastStreakDate, today);
  return newStreak;
}

export async function resetStreakIfMissed(): Promise<void> {
  const lastDate = await AsyncStorage.getItem(KEYS.lastStreakDate);
  if (!lastDate) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const today = new Date().toDateString();

  if (lastDate !== today && lastDate !== yesterday.toDateString()) {
    await AsyncStorage.setItem(KEYS.streak, '0');
  }
}

export function buildDailyStats(sessions: Session[]): DailyStats[] {
  const map: Record<string, DailyStats> = {};

  for (const s of sessions) {
    const date = new Date(s.date).toDateString();
    if (!map[date]) {
      map[date] = { date, focusMinutes: 0, sessionsCompleted: 0, sessionsAbandoned: 0, distractions: 0 };
    }
    if (s.phase === 'focus') {
      if (s.status === 'completed') {
        map[date].focusMinutes += s.durationMinutes;
        map[date].sessionsCompleted += 1;
      } else {
        map[date].sessionsAbandoned += 1;
      }
      map[date].distractions += s.distractionCount ?? 0;
    }
  }

  return Object.values(map).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getLast7DaysStats(sessions: Session[]): DailyStats[] {
  const days: DailyStats[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    days.push({ date: dateStr, focusMinutes: 0, sessionsCompleted: 0, sessionsAbandoned: 0, distractions: 0 });
  }

  for (const s of sessions) {
    const date = new Date(s.date).toDateString();
    const day = days.find((d) => d.date === date);
    if (day && s.phase === 'focus') {
      if (s.status === 'completed') {
        day.focusMinutes += s.durationMinutes;
        day.sessionsCompleted += 1;
      }
      day.distractions += s.distractionCount ?? 0;
    }
  }

  return days;
}

export function getTodayFocusMinutes(sessions: Session[]): number {
  const today = new Date().toDateString();
  return sessions
    .filter((s) => s.phase === 'focus' && s.status === 'completed' && new Date(s.date).toDateString() === today)
    .reduce((acc, s) => acc + s.durationMinutes, 0);
}

export function getDailyScore(focusMinutes: number): number {
  return Math.min(100, Math.round((focusMinutes / 240) * 100));
}

export async function getBlockedApps(): Promise<BlockedApp[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.blockedApps);
    if (raw) {
      return JSON.parse(raw);
    }
    const defaultApps = DEFAULT_BLOCKED_APPS.map((app, index) => ({
      ...app,
      id: `blocked_${Date.now()}_${index}`,
    }));
    await AsyncStorage.setItem(KEYS.blockedApps, JSON.stringify(defaultApps));
    return defaultApps;
  } catch {
    return [];
  }
}

export async function saveBlockedApps(apps: BlockedApp[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.blockedApps, JSON.stringify(apps));
}

export async function addBlockedApp(app: Omit<BlockedApp, 'id'>): Promise<BlockedApp[]> {
  const apps = await getBlockedApps();
  const newApp: BlockedApp = {
    ...app,
    id: `blocked_${Date.now()}`,
  };
  const updated = [...apps, newApp];
  await saveBlockedApps(updated);
  return updated;
}

export async function removeBlockedApp(id: string): Promise<BlockedApp[]> {
  const apps = await getBlockedApps();
  const updated = apps.filter((app) => app.id !== id);
  await saveBlockedApps(updated);
  return updated;
}

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.userProfile);
    if (raw) {
      return JSON.parse(raw);
    }
    return {
      name: '',
      isNewUser: true,
      createdAt: new Date().toISOString(),
      dailyGoalMinutes: 120,
    };
  } catch {
    return {
      name: '',
      isNewUser: true,
      createdAt: new Date().toISOString(),
      dailyGoalMinutes: 120,
    };
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.userProfile, JSON.stringify(profile));
}

export async function setUserAsReturning(): Promise<void> {
  const profile = await getUserProfile();
  profile.isNewUser = false;
  await saveUserProfile(profile);
}

export async function getGoalTargets(): Promise<GoalTarget[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.goalTargets);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveGoalTargets(targets: GoalTarget[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.goalTargets, JSON.stringify(targets));
}

export async function addGoalTarget(target: Omit<GoalTarget, 'id' | 'createdAt' | 'totalDays' | 'daysElapsed' | 'daysRemaining' | 'completed'>): Promise<GoalTarget[]> {
  const targets = await getGoalTargets();
  const startDate = parseISO(target.startDate);
  const targetDate = parseISO(target.targetDate);
  const totalDays = differenceInDays(targetDate, startDate);
  const daysElapsed = differenceInDays(new Date(), startDate);
  const daysRemaining = differenceInDays(targetDate, new Date());
  
  const newTarget: GoalTarget = {
    ...target,
    id: `goal_${Date.now()}`,
    createdAt: new Date().toISOString(),
    totalDays,
    daysElapsed: Math.max(0, daysElapsed),
    daysRemaining: Math.max(0, daysRemaining),
    completed: new Date() >= targetDate,
  };
  
  const updated = [newTarget, ...targets];
  await saveGoalTargets(updated);
  return updated;
}

export async function removeGoalTarget(id: string): Promise<GoalTarget[]> {
  const targets = await getGoalTargets();
  const updated = targets.filter((t) => t.id !== id);
  await saveGoalTargets(updated);
  return updated;
}

export async function updateGoalTargetProgress(id: string): Promise<GoalTarget[]> {
  const targets = await getGoalTargets();
  const updated = targets.map((t) => {
    if (t.id === id) {
      const startDate = parseISO(t.startDate);
      const targetDate = parseISO(t.targetDate);
      const daysElapsed = differenceInDays(new Date(), startDate);
      const daysRemaining = differenceInDays(targetDate, new Date());
      return {
        ...t,
        daysElapsed: Math.max(0, daysElapsed),
        daysRemaining: Math.max(0, daysRemaining),
        completed: new Date() >= targetDate,
      };
    }
    return t;
  });
  await saveGoalTargets(updated);
  return updated;
}
