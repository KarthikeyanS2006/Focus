// Blocked Apps Context - Focus Mode Reminder System
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { BlockedApp, DISTRACTION_CATEGORIES } from '@/types';
import { getBlockedApps, addBlockedApp as addBlockedAppToStorage, removeBlockedApp as removeBlockedAppFromStorage } from '@/services/storageService';
import * as Speech from 'expo-speech';
import { sendImmediateNotification } from '@/services/notificationService';

interface BlockedAppsContextType {
  blockedApps: BlockedApp[];
  isFocusMode: boolean;
  focusCheckEnabled: boolean;
  addApp: (name: string, category: BlockedApp['category']) => Promise<void>;
  removeApp: (id: string) => Promise<void>;
  startFocusMode: () => void;
  stopFocusMode: () => void;
  setFocusCheckEnabled: (enabled: boolean) => void;
  checkDistraction: (appName?: string) => void;
}

const BlockedAppsContext = createContext<BlockedAppsContextType | undefined>(undefined);

export function BlockedAppsProvider({ children }: { children: ReactNode }) {
  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusCheckEnabled, setFocusCheckEnabled] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(0);

  const loadApps = useCallback(async () => {
    const apps = await getBlockedApps();
    setBlockedApps(apps);
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const addApp = useCallback(async (name: string, category: BlockedApp['category']) => {
    const updated = await addBlockedAppToStorage({ name, category });
    setBlockedApps(updated);
  }, []);

  const removeApp = useCallback(async (id: string) => {
    const updated = await removeBlockedAppFromStorage(id);
    setBlockedApps(updated);
  }, []);

  const startFocusMode = useCallback(() => {
    setIsFocusMode(true);
    setLastCheckTime(Date.now());
  }, []);

  const stopFocusMode = useCallback(() => {
    setIsFocusMode(false);
  }, []);

  const checkDistraction = useCallback((appName?: string) => {
    if (!isFocusMode || !focusCheckEnabled) return;
    
    const now = Date.now();
    if (now - lastCheckTime < 60000) return; // Only check once per minute
    setLastCheckTime(now);

    const blockedNames = blockedApps.map(app => app.name.toLowerCase());
    
    if (appName) {
      const lowerName = appName.toLowerCase();
      const isBlocked = blockedNames.some(name => lowerName.includes(name));
      
      if (isBlocked) {
        console.log(`Distraction detected: ${appName}`);
        
        Speech.speak("Stay focused! You're in focus mode.", {
          language: 'en-US',
          rate: 0.9,
        });
        
        sendImmediateNotification(
          "⚠️ Focus Alert",
          `You opened ${appName}. Stay focused!`
        );
      }
    }
  }, [isFocusMode, focusCheckEnabled, blockedApps, lastCheckTime]);

  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active' && isFocusMode && focusCheckEnabled) {
        console.log('App became active - checking for distractions');
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [isFocusMode, focusCheckEnabled]);

  return (
    <BlockedAppsContext.Provider
      value={{
        blockedApps,
        isFocusMode,
        focusCheckEnabled,
        addApp,
        removeApp,
        startFocusMode,
        stopFocusMode,
        setFocusCheckEnabled,
        checkDistraction,
      }}
    >
      {children}
    </BlockedAppsContext.Provider>
  );
}

export function useBlockedApps() {
  const context = useContext(BlockedAppsContext);
  if (!context) {
    throw new Error('useBlockedApps must be used within BlockedAppsProvider');
  }
  return context;
}