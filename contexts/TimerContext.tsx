// Powered by OnSpace.AI
import React, { createContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Speech from 'expo-speech';
import { Session, TimerPhase, DistractionLog } from '@/types';
import { saveSession, updateStreak, getStreak, getAppSettings } from '@/services/storageService';
import {
  preloadSounds,
  unloadSounds,
  playFocusComplete,
  playBreakComplete,
  playTick,
} from '@/services/audioService';
import {
  scheduleTimerNotification,
  cancelAllNotifications,
  initializeNotifications,
} from '@/services/notificationService';

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const TICK_COUNTDOWN = 10;

export interface TimerContextType {
  phase: TimerPhase;
  secondsLeft: number;
  isRunning: boolean;
  currentRound: number;
  streak: number;
  penaltyActive: boolean;
  distractionCount: number;
  distractions: DistractionLog[];
  sessionGoal: string;
  startTimer: () => void;
  pauseTimer: () => void;
  abandonSession: () => void;
  skipBreak: () => void;
  resetTimer: () => void;
  logDistraction: () => void;
  logDistractionWithCategory: (log: DistractionLog) => void;
  setSessionGoal: (goal: string) => void;
  totalSeconds: number;
}

export const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [streak, setStreak] = useState(0);
  const [penaltyActive, setPenaltyActive] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [distractions, setDistractions] = useState<DistractionLog[]>([]);
  const [sessionGoal, setSessionGoal] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const phaseRef = useRef<TimerPhase>('idle');
  const secondsRef = useRef(FOCUS_SECONDS);
  const isRunningRef = useRef(false);
  const distractionRef = useRef(0);
  const distractionsRef = useRef<DistractionLog[]>([]);
  const goalRef = useRef('');

  phaseRef.current = phase;
  secondsRef.current = secondsLeft;
  isRunningRef.current = isRunning;
  distractionRef.current = distractionCount;
  distractionsRef.current = distractions;
  goalRef.current = sessionGoal;

  useEffect(() => {
    getStreak().then(setStreak);
    preloadSounds();
    initializeNotifications();
    return () => { 
      unloadSounds();
      cancelAllNotifications();
    };
  }, []);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const completePhase = useCallback(async () => {
    clearTimer();
    setIsRunning(false);

    const currentPhase = phaseRef.current;
    const durationMinutes = currentPhase === 'focus' ? 25 : 5;

    const settings = await getAppSettings();
    
    if (currentPhase === 'focus') {
      await playFocusComplete();
      if (settings.voiceEnabled) {
        Speech.speak("Focus session complete! Great job! Time for a break.", { language: 'en-US' });
      }
      await scheduleTimerNotification(BREAK_SECONDS, 'break', 'Break time! Relax and recharge.');
    } else {
      await playBreakComplete();
      if (settings.voiceEnabled) {
        Speech.speak("Break is over. Ready to focus again?", { language: 'en-US' });
      }
      await scheduleTimerNotification(FOCUS_SECONDS, 'focus', 'Focus time! You can do it!');
    }

    const session: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      phase: currentPhase === 'focus' ? 'focus' : 'break',
      durationMinutes,
      status: 'completed',
      penalty: false,
      distractionCount: distractionRef.current,
      distractions: distractionsRef.current,
      goal: goalRef.current || undefined,
    };
    await saveSession(session);

    if (currentPhase === 'focus') {
      const newStreak = await updateStreak();
      setStreak(newStreak);
      setPenaltyActive(false);
      setDistractionCount(0);
      setDistractions([]);
      setPhase('break');
      setSecondsLeft(BREAK_SECONDS);
    } else {
      setCurrentRound((r) => r + 1);
      setDistractionCount(0);
      setDistractions([]);
      setPhase('focus');
      setSecondsLeft(FOCUS_SECONDS);
    }
  }, []);

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        completePhase();
        return 0;
      }
      const next = prev - 1;
      if (phaseRef.current === 'focus' && next <= TICK_COUNTDOWN && next > 0) {
        playTick();
      }
      return next;
    });
  }, [completePhase]);

  const startTimer = useCallback(() => {
    if (phaseRef.current === 'idle') {
      setPhase('focus');
      setSecondsLeft(FOCUS_SECONDS);
      setDistractionCount(0);
      setDistractions([]);
    }
    setIsRunning(true);
    sessionStartRef.current = new Date();
    clearTimer();
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, []);

  const abandonSession = useCallback(async () => {
    clearTimer();
    setIsRunning(false);

    if (phaseRef.current === 'focus') {
      const session: Session = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        phase: 'focus',
        durationMinutes: Math.floor((FOCUS_SECONDS - secondsRef.current) / 60),
        status: 'abandoned',
        penalty: true,
        distractionCount: distractionRef.current,
        distractions: distractionsRef.current,
        goal: goalRef.current || undefined,
      };
      await saveSession(session);
      setPenaltyActive(true);
    }

    setDistractionCount(0);
    setDistractions([]);
    setPhase('idle');
    setSecondsLeft(FOCUS_SECONDS);
  }, []);

  const skipBreak = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setCurrentRound((r) => r + 1);
    setDistractionCount(0);
    setDistractions([]);
    setPhase('focus');
    setSecondsLeft(FOCUS_SECONDS);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setPhase('idle');
    setSecondsLeft(FOCUS_SECONDS);
    setCurrentRound(1);
    setPenaltyActive(false);
    setDistractionCount(0);
    setDistractions([]);
    setSessionGoal('');
  }, []);

  const logDistraction = useCallback(() => {
    if (phaseRef.current === 'focus') {
      setDistractionCount((prev) => prev + 1);
    }
  }, []);

  const logDistractionWithCategory = useCallback((log: DistractionLog) => {
    if (phaseRef.current === 'focus') {
      setDistractionCount((prev) => prev + 1);
      setDistractions((prev) => [...prev, log]);
    }
  }, []);

  const handleSetSessionGoal = useCallback((goal: string) => {
    setSessionGoal(goal);
  }, []);

  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'background' && isRunningRef.current && phaseRef.current === 'focus') {
        clearTimer();
      } else if (state === 'active' && isRunningRef.current) {
        clearTimer();
        intervalRef.current = setInterval(tick, 1000);
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [tick]);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const totalSeconds = phase === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;

  return (
    <TimerContext.Provider
      value={{
        phase,
        secondsLeft,
        isRunning,
        currentRound,
        streak,
        penaltyActive,
        distractionCount,
        distractions,
        sessionGoal,
        startTimer,
        pauseTimer,
        abandonSession,
        skipBreak,
        resetTimer,
        logDistraction,
        logDistractionWithCategory,
        setSessionGoal: handleSetSessionGoal,
        totalSeconds,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}
