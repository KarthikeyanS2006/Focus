// Powered by Sakura Focus - Japanese Anime Style
import { Stack, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TimerProvider } from '@/contexts/TimerContext';
import { BlockedAppsProvider, useBlockedApps } from '@/contexts/BlockedAppsContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, BackHandler } from 'react-native';
import { getUserProfile } from '@/services/storageService';
import { Colors } from '@/constants/theme';

function InitialRoute() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const profile = await getUserProfile();
      if (profile.isNewUser) {
        router.replace('/welcome');
      } else {
        router.replace('/(tabs)');
      }
      setChecked(true);
    };
    checkUser();
  }, []);

  if (!checked) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.sakura} />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TimerProvider>
          <BlockedAppsProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="settings" 
                options={{ 
                  animation: 'slide_from_right',
                  presentation: 'modal'
                }} 
              />
            </Stack>
            <InitialRoute />
          </BlockedAppsProvider>
        </TimerProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
});
