// Powered by Sakura Focus - Japanese Anime Style
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTimer } from '@/hooks/useTimer';
import { CircularTimer } from '@/components/ui/CircularTimer';
import { AbandonModal } from '@/components/ui/AbandonModal';
import { SakuraAnimation } from '@/components/ui/SakuraAnimation';
import { PulseGlow, EnergyOrb } from '@/components/ui/AnimeEffects';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useStats } from '@/hooks/useStats';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const {
    phase,
    secondsLeft,
    isRunning,
    currentRound,
    streak,
    penaltyActive,
    distractionCount,
    startTimer,
    pauseTimer,
    abandonSession,
    skipBreak,
    logDistraction,
    totalSeconds,
  } = useTimer();

  const { refresh } = useStats();
  const [showAbandon, setShowAbandon] = useState(false);

  const progress = phase === 'idle' ? 0 : 1 - secondsLeft / totalSeconds;

  const headerSlide = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerSlide, headerOpacity]);

  const handleMainAction = useCallback(() => {
    if (phase === 'idle') {
      startTimer();
    } else if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [phase, isRunning, startTimer, pauseTimer]);

  const handleAbandonConfirm = useCallback(async () => {
    setShowAbandon(false);
    await abandonSession();
    refresh();
  }, [abandonSession, refresh]);

  const mainBtnLabel =
    phase === 'idle' ? '開始 - Start' : isRunning ? '一時停止 - Pause' : '再開 - Resume';

  const mainBtnIcon: keyof typeof MaterialIcons.glyphMap =
    phase === 'idle' ? 'play-arrow' : isRunning ? 'pause' : 'play-arrow';

  const phaseText =
    phase === 'idle'
      ? '集中してください - Stay focused'
      : phase === 'focus'
      ? isRunning
        ? '心を込めて - Give your best'
        : '休憩しますか？ - Take a break?'
      : 'リラックス - Relax';

  const phaseJapanese =
    phase === 'idle' ? '準備完了' : phase === 'focus' ? '集中' : '休憩';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.bgAlt, Colors.bg, Colors.ink]}
        style={StyleSheet.absoluteFill}
      />
      
      <SakuraAnimation intensity="medium" />
      
      {isRunning && phase === 'focus' && (
        <PulseGlow
          color={Colors.primary}
          size={320}
          intensity={0.15}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            {
              transform: [{ translateY: headerSlide }],
              opacity: headerOpacity,
            },
          ]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.appTitleJapanese}>桜 花 计时</Text>
            <Text style={styles.appTitle}>Sakura Focus</Text>
            <Text style={styles.appSub}>武士道ポモドーロ - Samurai Pomodoro</Text>
          </View>
          <View style={styles.streakBadge}>
            <MaterialIcons name="local-fire-department" size={18} color={Colors.sakura} />
            <Text style={styles.streakText}>{streak}</Text>
            <Text style={styles.streakLabel}>連勝</Text>
          </View>
        </Animated.View>

        {penaltyActive ? (
          <Animated.View style={styles.penaltyBanner}>
            <MaterialIcons name="warning" size={16} color={Colors.danger} />
            <Text style={styles.penaltyText}>
              気が散りました - Distraction logged
            </Text>
          </Animated.View>
        ) : null}

        <View style={styles.roundRow}>
          {[1, 2, 3, 4].map((r) => (
            <View
              key={r}
              style={[
                styles.roundDot,
                r <= currentRound && phase !== 'idle' && styles.roundDotActive,
                r < currentRound && styles.roundDotDone,
              ]}
            >
              {r <= currentRound && phase !== 'idle' && (
                <View style={styles.roundDotInner} />
              )}
            </View>
          ))}
          <Text style={styles.roundLabel}>
            ラウンド {currentRound}/4 - Round {currentRound} of 4
          </Text>
        </View>

        <View style={styles.timerWrapper}>
          <View style={styles.katanaDecoration}>
            <View style={styles.katanaLine} />
            <Text style={styles.katanaText}>刀</Text>
            <View style={styles.katanaLine} />
          </View>
          
          <CircularTimer
            progress={progress}
            secondsLeft={secondsLeft}
            phase={phase === 'idle' ? 'idle' : phase}
            isRunning={isRunning}
            size={280}
          />
          
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseBadgeText}>{phaseJapanese}</Text>
          </View>
        </View>

        <Text style={styles.phaseMessage}>
          {phaseText}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.mainBtn,
            phase === 'break' && styles.mainBtnBreak,
            pressed && styles.mainBtnPressed,
          ]}
          onPress={handleMainAction}
        >
          <LinearGradient
            colors={
              phase === 'break'
                ? [Colors.success, Colors.successMuted]
                : [Colors.primary, Colors.secondary]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainBtnGradient}
          />
          <View style={styles.mainBtnContent}>
            <MaterialIcons name={mainBtnIcon} size={28} color={Colors.white} />
            <Text style={styles.mainBtnText}>{mainBtnLabel}</Text>
          </View>
          {phase === 'focus' && isRunning && (
            <EnergyOrb color={Colors.gold} size={30} isActive={true} />
          )}
        </Pressable>

        {phase !== 'idle' ? (
          <View style={styles.secondaryRow}>
            {phase === 'focus' ? (
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  styles.secondaryBtnDistraction,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
                ]}
                onPress={logDistraction}
              >
                <MaterialIcons name="add" size={18} color={Colors.primary} />
                <Text style={[styles.secondaryBtnText, { color: Colors.primary }]}>
                  分心 {distractionCount > 0 ? `· ${distractionCount}` : ''}
                </Text>
              </Pressable>
            ) : null}
            {phase === 'break' ? (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={skipBreak}
                activeOpacity={0.75}
              >
                <MaterialIcons name="skip-next" size={18} color={Colors.textSecondary} />
                <Text style={styles.secondaryBtnText}>休憩をスキップ</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.secondaryBtn, styles.secondaryBtnDanger]}
              onPress={() => setShowAbandon(true)}
              activeOpacity={0.75}
            >
              <MaterialIcons name="stop" size={18} color={Colors.danger} />
              <Text style={[styles.secondaryBtnText, { color: Colors.danger }]}>
                中止
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Text style={styles.tipIconText}>禅</Text>
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>心の保ち方</Text>
            <Text style={styles.tipText}>
              電話を伏せて置いてください - Put your phone face-down. Interruptions reset your focus.
            </Text>
          </View>
        </View>

        <View style={styles.motivationCard}>
          <Text style={styles.motivationJapanese}>
            一生懸命働くことは、最高のリハビリである
          </Text>
          <Text style={styles.motivationEnglish}>
            "Hard work is the best rehab"
          </Text>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <AbandonModal
        visible={showAbandon}
        onConfirm={handleAbandonConfirm}
        onCancel={() => setShowAbandon(false)}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    flex: 1,
  },
  appTitleJapanese: {
    fontSize: FontSize.xxs,
    color: Colors.sakura,
    letterSpacing: 8,
    marginBottom: 2,
    fontWeight: FontWeight.regular,
  },
  appTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  appSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.sakuraMuted || Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.sakura + '40',
  },
  streakText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.sakura,
  },
  streakLabel: {
    fontSize: FontSize.xs,
    color: Colors.sakura,
    marginLeft: 2,
  },
  penaltyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.dangerMuted,
    borderWidth: 1,
    borderColor: Colors.danger + '50',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  penaltyText: {
    fontSize: FontSize.sm,
    color: Colors.danger,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  roundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  roundDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundDotActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  roundDotDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roundDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.sakura,
  },
  roundLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
  },
  timerWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  katanaDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    width: '60%',
    justifyContent: 'center',
  },
  katanaLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.primary,
    opacity: 0.5,
  },
  katanaText: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    marginHorizontal: Spacing.md,
    fontWeight: FontWeight.bold,
  },
  phaseBadge: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  phaseBadgeText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
  },
  phaseMessage: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
    fontStyle: 'italic',
  },
  mainBtn: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  mainBtnGradient: {
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  mainBtnBreak: {},
  mainBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  mainBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: 1,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnDistraction: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.primaryMuted,
  },
  secondaryBtnDanger: {
    borderColor: Colors.danger + '40',
    backgroundColor: Colors.dangerMuted,
  },
  secondaryBtnText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  tipCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipIconText: {
    fontSize: FontSize.lg,
    color: Colors.gold,
    fontWeight: FontWeight.bold,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
    marginBottom: 4,
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  motivationCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    alignItems: 'center',
  },
  motivationJapanese: {
    fontSize: FontSize.md,
    color: Colors.sakura,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  motivationEnglish: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
