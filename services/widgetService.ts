// Widget service - Android Home Screen Widget support
import { Platform, NativeModules, Alert, Linking, NativeEventEmitter } from 'react-native';

export interface WidgetData {
  phase: 'idle' | 'focus' | 'break';
  secondsLeft: number;
  streak: number;
  goal: string;
  round: number;
  isRunning: boolean;
}

const { FocusWidgetModule } = NativeModules;

export function isAndroidWidgetSupported(): boolean {
  return Platform.OS === 'android';
}

export async function requestWidgetPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    Alert.alert(
      'Widgets',
      'Home screen widgets are only available on Android devices.'
    );
    return false;
  }

  Alert.alert(
    'Add Widget',
    'To add the Sakura Focus widget:\n\n1. Long press on your home screen\n2. Search for "Sakura Focus" or "Timer"\n3. Select the widget and place it',
    [{ text: 'OK' }]
  );
  return true;
}

export function updateWidgetData(data: WidgetData): void {
  console.log('Widget data to update:', data);
  
  if (Platform.OS === 'android') {
    try {
      if (FocusWidgetModule) {
        FocusWidgetModule.updateWidget(
          data.phase,
          data.secondsLeft,
          data.streak,
          data.goal,
          data.round,
          data.isRunning
        );
        console.log('Widget updated via native module');
      }
    } catch (error) {
      console.log('Native widget update failed, using SharedPreferences:', error);
    }
  }
}

export function clearWidgetData(): void {
  updateWidgetData({
    phase: 'idle',
    secondsLeft: 0,
    streak: 0,
    goal: '',
    round: 1,
    isRunning: false,
  });
}

export const WIDGET_SIZES = {
  small: { width: 110, height: 110 },
  medium: { width: 180, height: 110 },
  large: { width: 250, height: 110 },
};

export const WIDGET_TYPES = {
  TIMER: 'timer',
  STATS: 'stats',
  GOAL: 'goal',
} as const;

export function showWidgetInfo(): void {
  Alert.alert(
    '📱 Home Screen Widgets',
    Platform.OS === 'android'
      ? 'To add Sakura Focus widget:\n\n1. Long press home screen\n2. Tap "Widgets"\n3. Find "Sakura Focus Timer"\n4. Place widget\n\nThe widget shows:\n• Timer countdown\n• Focus/Break phase\n• Your streak\n• Current round'
      : 'iOS widgets are not supported.',
    [{ text: 'OK' }]
  );
}

export function createWidgetUpdateHook() {
  return {
    onTimerUpdate: (data: WidgetData) => {
      updateWidgetData(data);
    },
    onFocusStart: (goal: string) => {
      updateWidgetData({
        phase: 'focus',
        secondsLeft: 25 * 60,
        streak: 0,
        goal,
        round: 1,
        isRunning: true,
      });
    },
    onFocusComplete: () => {
      updateWidgetData({
        phase: 'break',
        secondsLeft: 5 * 60,
        streak: 0,
        goal: '',
        round: 1,
        isRunning: true,
      });
    },
    onSessionEnd: () => {
      clearWidgetData();
    },
  };
}