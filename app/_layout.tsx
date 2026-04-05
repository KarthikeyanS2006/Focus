// Powered by OnSpace.AI
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TimerProvider } from '@/contexts/TimerContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TimerProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </TimerProvider>
    </SafeAreaProvider>
  );
}
