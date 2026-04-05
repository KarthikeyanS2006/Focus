// Powered by OnSpace.AI
import { useState, useEffect, useCallback } from 'react';
import { Session, DailyStats } from '@/types';
import {
  getSessions,
  buildDailyStats,
  getLast7DaysStats,
  getTodayFocusMinutes,
  getDailyScore,
} from '@/services/storageService';

export function useStats() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [weekStats, setWeekStats] = useState<DailyStats[]>([]);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [todayScore, setTodayScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getSessions();
    setSessions(data);
    setDailyStats(buildDailyStats(data));
    setWeekStats(getLast7DaysStats(data));
    const mins = getTodayFocusMinutes(data);
    setTodayMinutes(mins);
    setTodayScore(getDailyScore(mins));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, dailyStats, weekStats, todayMinutes, todayScore, loading, refresh };
}
