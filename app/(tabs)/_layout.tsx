// Powered by Sakura Focus - Japanese Anime Style
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const tabBarStyle = {
    height: Platform.select({
      ios: insets.bottom + 70,
      android: insets.bottom + 70,
      default: 80,
    }),
    paddingTop: 8,
    paddingBottom: Platform.select({
      ios: insets.bottom + 8,
      android: insets.bottom + 8,
      default: 12,
    }),
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: Colors.sakura,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
          letterSpacing: 0.5,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '集中 - Focus',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.iconGradient}
              />
              <MaterialIcons name="timer" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '統計 - Stats',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[Colors.neonPurple, Colors.neonBlue]}
                style={styles.iconGradient}
              />
              <MaterialIcons name="bar-chart" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '履歴 - History',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[Colors.success, Colors.neonGreen]}
                style={styles.iconGradient}
              />
              <MaterialIcons name="history" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
});
