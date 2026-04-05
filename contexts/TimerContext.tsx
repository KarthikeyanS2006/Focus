// Powered by OnSpace.AI
import React, { createContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Session, TimerPhase } from '@/types';
import { saveSession, updateStreak, getStreak } from '@/services/storageService';
import {
  preloadSounds,
  unloadSounds,
  playFocusComplete,
  playBreakComplete,
  playTick,
} from '@/services/audioService';

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const TICK_COUNTDOWN = 10; // play tick in last N seconds

export interface TimerContextType {
  phase: TimerPhase;
  secondsLeft: number;
  isRunning: boolean;
  currentRound: number;
  streak: number;
  penaltyActive: boolean;
  distractionCount: number;
  startTimer: () => void;
  pauseTimer: () => void;
  abandonSession: () => void;
  skipBreak: () => void;
  resetTimer: () => void;
  logDistraction: () => void;
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

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const phaseRef = useRef<TimerPhase>('idle');
  const secondsRef = useRef(FOCUS_SECONDS);
  const isRunningRef = useRef(false);
  const distractionRef = useRef(0);

  phaseRef.current = phase;
  secondsRef.current = secondsLeft;
  isRunningRef.current = isRunning;
  distractionRef.current = distractionCount;

  useEffect(() => {
    getStreak().then(setStreak);
    preloadSounds();
    return () => { unloadSounds(); };
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

    // Play completion sound
    if (currentPhase === 'focus') {
      await playFocusComplete();
    } else {
      await playBreakComplete();
    }

    const session: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      phase: currentPhase === 'focus' ? 'focus' : 'break',
      durationMinutes,
      status: 'completed',
      penalty: false,
      distractionCount: currentPhase === 'focus' ? distractionRef.current : 0,
    };
    await saveSession(session);

    if (currentPhase === 'focus') {
      const newStreak = await updateStreak();
      setStreak(newStreak);
      setPenaltyActive(false);
      setDistractionCount(0);
      // Switch to break
      setPhase('break');
      setSecondsLeft(BREAK_SECONDS);
    } else {
      // Break done, go back to focus
      setCurrentRound((r) => r + 1);
      setDistractionCount(0);
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
      // Play tick in the last TICK_COUNTDOWN seconds of a focus session
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
      };
      await saveSession(session);
      setPenaltyActive(true);
    }

    setDistractionCount(0);
    setPhase('idle');
    setSecondsLeft(FOCUS_SECONDS);
  }, []);

  const skipBreak = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setCurrentRound((r) => r + 1);
    setDistractionCount(0);
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
  }, []);

  const logDistraction = useCallback(() => {
    if (phaseRef.current === 'focus') {
      setDistractionCount((prev) => prev + 1);
    }
  }, []);

  // Handle app going background
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
        startTimer,
        pauseTimer,
        abandonSession,
        skipBreak,
        resetTimer,
        logDistraction,
        totalSeconds,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}
