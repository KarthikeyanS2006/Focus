// Powered by Sakura Focus - Japanese Anime Style
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStats } from '@/hooks/useStats';
import { StatCard } from '@/components/ui/StatCard';
import { WeekChart } from '@/components/ui/WeekChart';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { SakuraAnimation } from '@/components/ui/SakuraAnimation';
import { PulseGlow } from '@/components/ui/AnimeEffects';
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

  const titleSlide = React.useRef(new Animated.Value(-30)).current;
  const titleOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(titleSlide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [titleSlide, titleOpacity]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.bgAlt, Colors.bg, Colors.ink]}
        style={StyleSheet.absoluteFill}
      />
      
      <SakuraAnimation intensity="light" />
      <PulseGlow color={Colors.neonPurple} size={300} intensity={0.08} />

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
        <Animated.View
          style={[
            styles.header,
            {
              transform: [{ translateY: titleSlide }],
              opacity: titleOpacity,
            },
          ]}
        >
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.titleJapanese}>統計 - Statistics</Text>
              <Text style={styles.title}>戦績 - Battle Record</Text>
            </View>
            <View style={styles.zenBadge}>
              <Text style={styles.zenText}>禅</Text>
            </View>
          </View>
          <Text style={styles.sub}>あなたの集中力の記録</Text>
        </Animated.View>

        <View style={styles.todayCard}>
          <LinearGradient
            colors={[Colors.primaryMuted, Colors.secondaryMuted]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.todayGradient}
          />
          <View style={styles.todayContent}>
            <View style={styles.todayLeft}>
              <Text style={styles.todayLabelJapanese}>今日の得分</Text>
              <Text style={styles.todayLabel}>TODAY'S SCORE</Text>
              <Text style={styles.todayMinutes}>{todayMinutes} 分 focused</Text>
              <Text style={styles.todayGoal}>目標: 240分 - 4時間</Text>
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
            label="連勝"
            value={`${streak}d`}
            icon="local-fire-department"
            accent={Colors.sakura}
            sub="streak days"
          />
          <StatCard
            label="今週"
            value={`${Math.floor(totalWeekMinutes / 60)}h`}
            icon="schedule"
            accent={Colors.neonBlue}
            sub={`${totalWeekMinutes} min`}
          />
          <StatCard
            label="セッション"
            value={`${totalWeekSessions}`}
            icon="check-circle"
            accent={Colors.success}
            sub="completed"
          />
        </View>

        <View style={styles.distractionsCard}>
          <View style={styles.distractionsLeft}>
            <Text style={styles.distractionsLabelJapanese}>週間 分心</Text>
            <Text style={styles.distractionsLabel}>WEEKLY DISTRACTIONS</Text>
            <Text style={styles.distractionsValue}>{totalWeekDistractions}</Text>
            <Text style={styles.distractionsSub}>
              {totalWeekDistractions === 0
                ? '完璧な集中 - Perfect focus achieved'
                : totalWeekDistractions < 5
                ? 'よく管理されています - Well contained'
                : totalWeekDistractions < 15
                ? '中断を減らす功夫を - Consider a focus environment'
                : '電話-Freeセッションを試す - Try phone-free sessions'}
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
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitleJapanese}>週間集中</Text>
            <Text style={styles.sectionTitle}>Weekly Focus (分)</Text>
          </View>
          <WeekChart data={weekStats} />
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>智</Text>
            <Text style={styles.insightTitle}>洞察 - Insight</Text>
          </View>
          <Text style={styles.insightBody}>
            {totalWeekMinutes === 0
              ? '今週はまだセッションがありません。最初のポモドーロを始めて勢いを付けましょう。'
              : totalWeekMinutes < 120
              ? 'ゆっくりとしたスタート。1日2セッション完了を目標にしましょう。'
              : totalWeekMinutes < 300
              ? '良い進捗です！一貫した日課が最も深い習慣を築きます。'
              : '素晴らしい週です！優れた集中力を身につえています。'}
          </Text>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteJapanese}>
            "継続は力なり"
          </Text>
          <Text style={styles.quoteEnglish}>
            "Constancy sharpens skill"
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleJapanese: {
    fontSize: FontSize.xxs,
    color: Colors.sakura,
    letterSpacing: 2,
    marginBottom: 2,
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
  zenBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold + '40',
  },
  zenText: {
    fontSize: FontSize.xl,
    color: Colors.gold,
    fontWeight: FontWeight.bold,
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
  todayLabelJapanese: {
    fontSize: FontSize.xxs,
    color: Colors.sakura,
    marginBottom: 2,
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
  chartHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitleJapanese: {
    fontSize: FontSize.xxs,
    color: Colors.sakura,
    marginBottom: 2,
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
  distractionsLabelJapanese: {
    fontSize: FontSize.xxs,
    color: Colors.sakura,
    marginBottom: 2,
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
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  insightCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neonPurple + '30',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  insightIcon: {
    fontSize: FontSize.lg,
    color: Colors.neonPurple,
  },
  insightTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neonPurple,
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
