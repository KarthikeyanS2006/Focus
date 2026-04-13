// Widget service - Android Home Screen Widget support
// Note: Native Android widgets require a separate widget extension module
// This provides the data and bridge for when native module is implemented

import { Platform, Alert, Linking } from 'react-native';

export interface WidgetData {
  type: 'timer' | 'stats' | 'goal';
  title: string;
  subtitle: string;
  progress?: number;
}

let currentWidgetData: WidgetData | null = null;

export function isAndroidWidgetSupported(): boolean {
  return Platform.OS === 'android';
}

export async function requestWidgetPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    Alert.alert(
      'Widgets',
      'Home screen widgets are only available on Android devices.\n\nFor iOS, you can use Shortcuts to create timer widgets.'
    );
    return false;
  }

  try {
    // In a full implementation, this would request ADDITIONAL_WIDGETS permission
    Alert.alert(
      'Add Widget',
      'To add the Sakura Focus widget:\n\n1. Long press on your home screen\n2. Search for "Sakura Focus" or "Focus"\n3. Select the widget and place it',
      [
        { text: 'OK' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return true;
  } catch (error) {
    console.log('Error requesting widget permission:', error);
    return false;
  }
}

export function updateWidgetData(data: WidgetData): void {
  currentWidgetData = data;
  console.log('Widget data updated:', data);
  
  if (Platform.OS === 'android') {
    // In native implementation, this would send data to widget via native module
    // react-native-android-widget or similar library would be used
    console.log('Sending widget data to native Android widget');
  }
}

export function clearWidgetData(): void {
  currentWidgetData = null;
}

export function getCurrentWidgetData(): WidgetData | null {
  return currentWidgetData;
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

// Native widget requires:
// 1. Android widget XML (app/src/main/res/xml/widget_info.xml)
// 2. Widget provider class (Kotlin/Java)
// 3. Widget layout XML
// 4. expo-modules-core native module integration
//
// For full implementation, use: 
// - react-native-android-widget library
// - Or create custom expo-dev-client with native code

export function showWidgetInfo(): void {
  Alert.alert(
    '📱 Home Screen Widgets',
    Platform.OS === 'android'
      ? 'To add Sakura Focus widget:\n\n1. Long press home screen\n2. Tap "Widgets"\n3. Find "Sakura Focus"\n4. Place widget\n\nNote: Native widgets require building with expo prebuild + gradle.'
      : 'iOS widgets are not directly supported.\n\nUse Shortcuts app to create timer shortcuts, or build a native iOS widget extension.',
    [{ text: 'OK' }]
  );
}