// Notification service - local notifications that work in Expo Go
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationConfig {
  title: string;
  body: string;
  data?: Record<string, any>;
}

let notificationPermissionGranted = false;

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    notificationPermissionGranted = status === 'granted';
    return notificationPermissionGranted;
  } catch (error) {
    console.log('Error requesting notification permission:', error);
    return false;
  }
}

export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    notificationPermissionGranted = status === 'granted';
    return notificationPermissionGranted;
  } catch (error) {
    console.log('Error checking notification permission:', error);
    return false;
  }
}

export async function scheduleTimerNotification(
  seconds: number,
  type: 'focus' | 'break',
  message?: string
): Promise<string | null> {
  if (!notificationPermissionGranted) {
    const granted = await requestNotificationPermission();
    if (!granted) return null;
  }

  try {
    const trigger: Notifications.TimeIntervalTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    };
    
    const notificationContent: Notifications.NotificationContentInput = {
      title: type === 'focus' ? '🎯 Focus Session Complete!' : '☕ Break Time Over!',
      body: message || (type === 'focus' 
        ? 'Great job! Time for a well-deserved break.' 
        : 'Ready to get back to work?'),
      data: { type, timestamp: Date.now() },
      sound: 'default',
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger,
    });

    console.log(`Scheduled ${type} notification in ${seconds}s, ID: ${id}`);
    return id;
  } catch (error) {
    console.log('Error scheduling notification:', error);
    return null;
  }
}

export async function scheduleReminderNotification(
  title: string,
  body: string,
  delaySeconds: number = 60,
  data?: Record<string, any>
): Promise<string | null> {
  if (!notificationPermissionGranted) {
    const granted = await requestNotificationPermission();
    if (!granted) return null;
  }

  try {
    const trigger: Notifications.TimeIntervalTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
    };
    
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger,
    });
    return id;
  } catch (error) {
    console.log('Error scheduling reminder:', error);
    return null;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.log('Error cancelling notifications:', error);
  }
}

export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.log('Error cancelling notification:', error);
  }
}

export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Error getting scheduled notifications:', error);
    return [];
  }
}

export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  if (!notificationPermissionGranted) {
    await requestNotificationPermission();
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: null,
    });
  } catch (error) {
    console.log('Error sending immediate notification:', error);
  }
}

export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(handler);
}

export async function initializeNotifications(): Promise<boolean> {
  return await checkNotificationPermission();
}