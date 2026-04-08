// Widget Card - Reusable widget wrapper with theme support
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

interface WidgetCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  onLongPress?: () => void;
  variant?: 'default' | 'countdown' | 'days' | 'transparent';
  style?: object;
}

export function WidgetCard({ 
  children, 
  title, 
  icon,
  onPress, 
  onLongPress,
  variant = 'default',
  style 
}: WidgetCardProps) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const isTransparent = variant === 'transparent' || isDark;

  const getBackgroundColor = () => {
    if (isTransparent) {
      return 'rgba(255,255,255,0.08)';
    }
    return Colors.surface;
  };

  const content = (
    <View style={[
      styles.container, 
      { backgroundColor: getBackgroundColor() },
      isTransparent && styles.transparent,
      style
    ]}>
      {title && (
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconContainer, isTransparent && styles.iconContainerTransparent]}>
              <MaterialIcons 
                name={icon} 
                size={16} 
                color={isTransparent ? 'rgba(255,255,255,0.8)' : Colors.primary} 
              />
            </View>
          )}
          <Text style={[styles.title, isTransparent && styles.titleTransparent]}>
            {title}
          </Text>
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  transparent: {
    borderColor: 'rgba(255,255,255,0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerTransparent: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  title: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  titleTransparent: {
    color: 'rgba(255,255,255,0.7)',
  },
  content: {},
});
