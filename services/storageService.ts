// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, DailyStats } from '@/types';

const KEYS = {
  sessions: 'focus_sessions',
  streak: 'focus_streak',
  lastStreakDate: 'focus_last_streak_date',
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
  const updated = [session, ...existing].slice(0, 200); // keep last 200
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
    return currentStreak; // already counted today
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
  // Max score 100 at 4 hours (240 min) of focus
  return Math.min(100, Math.round((focusMinutes / 240) * 100));
}
