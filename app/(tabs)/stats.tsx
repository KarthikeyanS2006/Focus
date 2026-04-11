// Powered by Sakura Focus - English Version
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStats } from '@/hooks/useStats';
import { StatCard } from '@/components/ui/StatCard';
import { WeekChart } from '@/components/ui/WeekChart';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { SakuraAnimation } from '@/components/ui/SakuraAnimation';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useTimer } from '@/hooks/useTimer';
import { MaterialIcons } from '@expo/vector-icons';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { weekStats, todayMinutes, todayScore, loading, refresh } = useStats();
  const { streak } = useTimer();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const totalWeekMinutes = weekStats.reduce((a, d) => a + d.focusMinutes, 0);
  const totalWeekSessions = weekStats.reduce((a, d) => a + d.sessionsCompleted, 0);
  const totalWeekDistractions = weekStats.reduce((a, d) => a + d.distractions, 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.bgAlt, Colors.bg, Colors.ink]}
        style={StyleSheet.absoluteFill}
      />
      
      <SakuraAnimation intensity="medium" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={refresh} 
            tintColor={Colors.primary} 
            progressBackgroundColor={Colors.surface}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Statistics</Text>
            <Text style={styles.sub}>Your focus performance</Text>
          </View>
        </View>

        <View style={styles.todayCard}>
          <LinearGradient
            colors={[Colors.primaryMuted, Colors.secondaryMuted]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.todayGradient}
          />
          <View style={styles.todayContent}>
            <View style={styles.todayLeft}>
              <Text style={styles.todayLabel}>{'TODAY\'S SCORE'}</Text>
              <Text style={styles.todayMinutes}>{todayMinutes} min focused</Text>
              <Text style={styles.todayGoal}>Goal: 240 min (4 hours)</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, (todayMinutes / 240) * 100)}%` },
                  ]}
                />
              </View>
            </View>
            <ScoreRing score={todayScore} size={88} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="Streak"
            value={`${streak}d`}
            icon="local-fire-department"
            accent={Colors.sakura}
            sub="days"
          />
          <StatCard
            label="This Week"
            value={`${Math.floor(totalWeekMinutes / 60)}h`}
            icon="schedule"
            accent={Colors.neonBlue}
            sub={`${totalWeekMinutes} min`}
          />
          <StatCard
            label="Sessions"
            value={`${totalWeekSessions}`}
            icon="check-circle"
            accent={Colors.success}
            sub="completed"
          />
        </View>

        <View style={styles.distractionsCard}>
          <View style={styles.distractionsLeft}>
            <Text style={styles.distractionsLabel}>WEEKLY DISTRACTIONS</Text>
            <Text style={styles.distractionsValue}>{totalWeekDistractions}</Text>
            <Text style={styles.distractionsSub}>
              {totalWeekDistractions === 0
                ? 'Perfect focus - zero distractions!'
                : totalWeekDistractions < 5
                ? 'Well contained. Keep limiting interruptions.'
                : totalWeekDistractions < 15
                ? 'Some interruptions - consider a focus environment.'
                : 'High distraction count. Try phone-free sessions.'}
            </Text>
          </View>
          <View style={[styles.distractionsIcon, {
            backgroundColor: totalWeekDistractions === 0 ? Colors.successMuted : Colors.primaryMuted
          }]}>
            <MaterialIcons 
              name="sentiment-satisfied" 
              size={32} 
              color={totalWeekDistractions === 0 ? Colors.success : Colors.primary} 
            />
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Weekly Focus (minutes)</Text>
          <WeekChart data={weekStats} />
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Insight</Text>
          <Text style={styles.insightBody}>
            {totalWeekMinutes === 0
              ? 'No sessions this week yet. Start your first Pomodoro to build momentum.'
              : totalWeekMinutes < 120
              ? 'Off to a slow start. Aim for at least 2 completed sessions per day.'
              : totalWeekMinutes < 300
              ? 'Good progress! Consistent daily sessions build the deepest habits.'
              : 'Strong week! You are building excellent focus discipline.'}
          </Text>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteJapanese}>
            {'"'}継続は力なり{'"'}
          </Text>
          <Text style={styles.quoteEnglish}>
            {'"'}Constancy sharpens skill{'"'}
          </Text>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  sub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  todayCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  todayGradient: {
    padding: Spacing.lg,
  },
  todayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayLeft: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  todayLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  todayMinutes: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  todayGoal: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  distractionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distractionsLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  distractionsLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  distractionsValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  distractionsSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  distractionsIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neonPurple + '30',
  },
  insightTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neonPurple,
    marginBottom: Spacing.sm,
  },
  insightBody: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  quoteCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  quoteJapanese: {
    fontSize: FontSize.lg,
    color: Colors.sakura,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  quoteEnglish: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
