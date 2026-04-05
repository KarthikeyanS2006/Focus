// Powered by Sakura Focus - Japanese Anime Style
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useStats } from '@/hooks/useStats';
import { SakuraAnimation } from '@/components/ui/SakuraAnimation';
import { PulseGlow } from '@/components/ui/AnimeEffects';
import { Session } from '@/types';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

function formatTime(isoStr: string) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoStr: string) {
  const d = new Date(isoStr);
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today) return '今日 - Today';
  if (d.toDateString() === yesterday.toDateString()) return '昨日 - Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function SessionItem({ session, index }: { session: Session; index: number }) {
  const isCompleted = session.status === 'completed';
  const isFocus = session.phase === 'focus';
  
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim, index]);

  const iconName: keyof typeof MaterialIcons.glyphMap = isCompleted
    ? isFocus
      ? 'check-circle'
      : 'free-breakfast'
    : 'cancel';

  const iconColor = isCompleted ? (isFocus ? Colors.primary : Colors.success) : Colors.danger;

  return (
    <Animated.View
      style={[
        styles.sessionItem, 
        session.penalty && styles.sessionItemPenalty,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.sessionIcon, { backgroundColor: iconColor + '18' }]}>
        <MaterialIcons name={iconName} size={20} color={iconColor} />
      </View>
      <View style={styles.sessionInfo}>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionType}>
            {isFocus ? '集中セッション' : '休憩セッション'}
          </Text>
          {session.penalty ? (
            <View style={styles.penaltyTag}>
              <Text style={styles.penaltyTagText}>罰</Text>
            </View>
          ) : null}
          {isFocus && (session.distractionCount ?? 0) > 0 ? (
            <View style={styles.distractionTag}>
              <MaterialIcons name="add-circle-outline" size={10} color={Colors.primary} />
              <Text style={styles.distractionTagText}>{session.distractionCount}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.sessionMeta}>
          {formatDate(session.date)} · {formatTime(session.date)} · {session.durationMinutes}分
        </Text>
      </View>
      <View style={styles.sessionStatus}>
        <Text style={[styles.sessionStatusText, { color: isCompleted ? iconColor : Colors.danger }]}>
          {isCompleted ? '完了' : '中止'}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { sessions, loading, refresh } = useStats();

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

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.bgAlt, Colors.bg, Colors.ink]}
        style={StyleSheet.absoluteFill}
      />
      
      <SakuraAnimation intensity="light" />
      <PulseGlow color={Colors.neonGreen} size={250} intensity={0.06} />

      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: titleSlide }],
            opacity: titleOpacity,
          },
        ]}
      >
        <Text style={styles.titleJapanese}>歴史 - History</Text>
        <Text style={styles.title}>セッション履歴</Text>
        <Text style={styles.sub}>
          {sessions.length} 総セッション - Total sessions
        </Text>
      </Animated.View>

      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>無</Text>
          </View>
          <Text style={styles.emptyTitle}>まだセッションがありません</Text>
          <Text style={styles.emptyTitleEnglish}>No sessions yet</Text>
          <Text style={styles.emptyBody}>
            最初の集中セッションを完了して、ここに履歴を表示しましょう。
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <SessionItem session={item} index={index} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={loading} 
              onRefresh={refresh} 
              tintColor={Colors.primary}
              progressBackgroundColor={Colors.surface}
            />
          }
          ListFooterComponent={<View style={{ height: Spacing.xxl }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
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
    marginTop: 2,
  },
  list: {
    paddingHorizontal: Spacing.lg,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  sessionItemPenalty: {
    borderColor: Colors.danger + '30',
    backgroundColor: Colors.dangerMuted,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sessionType: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  penaltyTag: {
    backgroundColor: Colors.dangerMuted,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.danger + '40',
  },
  penaltyTagText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.danger,
    letterSpacing: 0.5,
  },
  distractionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  distractionTagText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  sessionMeta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  sessionStatus: {},
  sessionStatusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIconText: {
    fontSize: FontSize.xxxl,
    color: Colors.textMuted,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyTitleEnglish: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.xs,
  },
});
