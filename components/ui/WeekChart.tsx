// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DailyStats } from '@/types';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

interface Props {
  data: DailyStats[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekChart({ data }: Props) {
  const maxMinutes = Math.max(...data.map((d) => d.focusMinutes), 60);
  const today = new Date().toDateString();

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {data.map((day, i) => {
          const height = Math.max(4, (day.focusMinutes / maxMinutes) * 100);
          const isToday = day.date === today;
          const dayLabel = DAY_LABELS[new Date(day.date).getDay()];
          return (
            <View key={i} style={styles.barCol}>
              {day.focusMinutes > 0 && (
                <Text style={styles.barValue}>{day.focusMinutes}m</Text>
              )}
              <View style={[styles.barTrack]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${height}%`,
                      backgroundColor: isToday ? Colors.primary : Colors.primaryDim,
                      opacity: day.focusMinutes === 0 ? 0.15 : 1,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>{dayLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: Spacing.xs,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  barValue: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  barTrack: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: Radius.sm,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  dayLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
