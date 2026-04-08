// Days Counter Widget - Shows days remaining/elapsed for a goal
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { GoalTarget } from '@/types';
import { differenceInDays, parseISO } from 'date-fns';

interface DaysCounterWidgetProps {
  goal: GoalTarget;
  variant?: 'default' | 'transparent' | 'samsung';
  showProgress?: boolean;
  compact?: boolean;
}

export function DaysCounterWidget({ 
  goal, 
  variant = 'default',
  showProgress = true,
  compact = false 
}: DaysCounterWidgetProps) {
  const systemColorScheme = useColorScheme();
  const [daysRemaining, setDaysRemaining] = useState(goal.daysRemaining);
  const [daysElapsed, setDaysElapsed] = useState(goal.daysElapsed);
  const [progress, setProgress] = useState(0);
  const [isTransparent, setIsTransparent] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const targetDate = parseISO(goal.targetDate);
      const startDate = parseISO(goal.startDate);
      const now = new Date();
      
      const total = differenceInDays(targetDate, startDate);
      const elapsed = differenceInDays(now, startDate);
      const remaining = differenceInDays(targetDate, now);
      
      setDaysElapsed(Math.max(0, elapsed));
      setDaysRemaining(Math.max(0, remaining));
      setProgress(total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 100);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [goal]);

  useEffect(() => {
    setIsTransparent(variant === 'transparent' || variant === 'samsung' || systemColorScheme === 'dark');
  }, [variant, systemColorScheme]);

  const isCompleted = daysRemaining <= 0;
  const textColor = isTransparent ? 'rgba(255,255,255,0.95)' : Colors.textPrimary;
  const subtextColor = isTransparent ? 'rgba(255,255,255,0.6)' : Colors.textSecondary;
  const accentColor = isTransparent ? 'rgba(255,107,138,0.9)' : Colors.primary;
  const bgColor = isTransparent ? 'rgba(255,255,255,0.1)' : Colors.surfaceAlt;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactMain}>
          <Text style={[styles.compactNumber, { color: accentColor }]}>
            {isCompleted ? 0 : daysRemaining}
          </Text>
          <Text style={[styles.compactLabel, { color: subtextColor }]}>
            {isCompleted ? 'DAY' : 'DAYS'}
          </Text>
        </View>
        <Text style={[styles.compactTitle, { color: textColor }]} numberOfLines={1}>
          {goal.title}
        </Text>
        <Text style={[styles.compactAppName, { color: accentColor }]}>REGΛIN</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
        {goal.title}
      </Text>

      <View style={styles.counterRow}>
        <View style={styles.daysBlock}>
          <Text style={[styles.daysNumber, { color: accentColor }]}>
            {isCompleted ? 0 : daysRemaining}
          </Text>
          <Text style={[styles.daysLabel, { color: subtextColor }]}>
            {isCompleted ? 'COMPLETED' : 'DAYS LEFT'}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: isTransparent ? 'rgba(255,255,255,0.2)' : Colors.border }]} />

        <View style={styles.daysBlock}>
          <Text style={[styles.daysNumber, styles.elapsedNumber, { color: textColor }]}>
            {daysElapsed}
          </Text>
          <Text style={[styles.daysLabel, { color: subtextColor }]}>
            DAYS WORKED
          </Text>
        </View>
      </View>

      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBg, { backgroundColor: bgColor }]}>
            <LinearGradient
              colors={[accentColor, accentColor + '80']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressText, { color: subtextColor }]}>
              {Math.round(progress)}% complete
            </Text>
            <Text style={[styles.progressText, { color: subtextColor }]}>
              {goal.totalDays} total days
            </Text>
          </View>
        </View>
      )}

      <View style={styles.dateInfo}>
        <View style={styles.dateItem}>
          <MaterialIcons name="play-arrow" size={12} color={subtextColor} />
          <Text style={[styles.dateText, { color: subtextColor }]}>
            Started: {new Date(goal.startDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.dateItem}>
          <MaterialIcons name="flag" size={12} color={subtextColor} />
          <Text style={[styles.dateText, { color: subtextColor }]}>
            Target: {new Date(goal.targetDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.appNameContainer}>
        <Text style={[styles.appName, { color: accentColor }]}>REGΛIN</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  compactContainer: {
    alignItems: 'center',
  },
  compactMain: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  compactNumber: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -2,
  },
  compactLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 2,
  },
  compactTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  compactAppName: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    letterSpacing: 3,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  daysBlock: {
    alignItems: 'center',
    flex: 1,
  },
  daysNumber: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -2,
  },
  elapsedNumber: {
    color: Colors.textSecondary,
  },
  daysLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 50,
    marginHorizontal: Spacing.md,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: FontSize.xxs,
    fontWeight: FontWeight.medium,
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: FontSize.xxs,
    fontWeight: FontWeight.medium,
  },
  appNameContainer: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  appName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 4,
  },
});
