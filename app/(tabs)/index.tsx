// Powered by Sakura Focus - Japanese Anime Style
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Modal,
  useColorScheme,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTimer } from '@/hooks/useTimer';
import { CircularTimer } from '@/components/ui/CircularTimer';
import { AbandonModal } from '@/components/ui/AbandonModal';
import { DistractionModal } from '@/components/ui/DistractionModal';
import { SakuraAnimation } from '@/components/ui/SakuraAnimation';
import { CountdownWidget, DaysCounterWidget, WidgetCard, GoalTargetModal } from '@/components/widgets';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useStats } from '@/hooks/useStats';
import { DistractionLog, GoalTarget } from '@/types';
import { getUserProfile, getGoalTargets, removeGoalTarget, updateGoalTargetProgress } from '@/services/storageService';

const GOALS = [
  'Studying',
  'Working',
  'Reading',
  'Writing',
  'Coding',
  'Learning',
  'Other',
];

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();
  const {
    phase,
    secondsLeft,
    isRunning,
    currentRound,
    streak,
    penaltyActive,
    distractionCount,
    sessionGoal,
    startTimer,
    pauseTimer,
    abandonSession,
    skipBreak,
    logDistractionWithCategory,
    setSessionGoal,
    totalSeconds,
  } = useTimer();

  const { refresh, todayMinutes } = useStats();
  const [showAbandon, setShowAbandon] = useState(false);
  const [showDistraction, setShowDistraction] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalTargets, setGoalTargets] = useState<GoalTarget[]>([]);
  const [isTransparent, setIsTransparent] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsTransparent(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const loadGoalTargets = useCallback(async () => {
    const targets = await getGoalTargets();
    const updated = await updateGoalTargetProgress(targets[0]?.id || '');
    setGoalTargets(updated);
  }, []);

  useEffect(() => {
    loadGoalTargets();
  }, [loadGoalTargets]);

  const FOCUS_TIPS = [
    "Put your phone face-down. Interruptions reset your focus habit.",
    "Sit quietly, breathe deep, and clear your mind before starting.",
    "Keep your phone in another room to avoid temptation.",
    "Create a calm environment: sit comfortably and focus.",
    "A clean workspace helps a clear mind - prepare your area first!",
    "Close your eyes, take 3 deep breaths before starting.",
    "Remove all distractions from your workspace.",
  ];
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const prevPhaseRef = useRef(phase);

  useEffect(() => {
    if (prevPhaseRef.current === 'idle' && phase !== 'idle') {
      setCurrentTipIndex(Math.floor(Math.random() * FOCUS_TIPS.length));
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const checkAndShowWelcome = async () => {
      const profile = await getUserProfile();
      if (profile.isNewUser) {
        router.replace('/welcome');
      }
    };
    checkAndShowWelcome();
  }, []);

  const progress = phase === 'idle' ? 0 : 1 - secondsLeft / totalSeconds;

  const handleMainAction = useCallback(() => {
    if (phase === 'idle' && !sessionGoal) {
      setShowGoalModal(true);
      return;
    }
    if (phase === 'idle') {
      startTimer();
    } else if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [phase, isRunning, startTimer, pauseTimer, sessionGoal]);

  const handleAbandonConfirm = useCallback(async () => {
    setShowAbandon(false);
    await abandonSession();
    refresh();
  }, [abandonSession, refresh]);

  const handleLogDistraction = useCallback((log: DistractionLog) => {
    logDistractionWithCategory(log);
    setShowDistraction(false);
  }, [logDistractionWithCategory]);

  const handleSelectGoal = useCallback((goal: string) => {
    setSessionGoal(goal);
    setShowGoalModal(false);
  }, [setSessionGoal]);

  const mainBtnLabel =
    phase === 'idle' ? 'Start Focus' : isRunning ? 'Pause' : 'Resume';

  const mainBtnIcon: keyof typeof MaterialIcons.glyphMap =
    phase === 'idle' ? 'play-arrow' : isRunning ? 'pause' : 'play-arrow';

  const phaseText =
    phase === 'idle'
      ? sessionGoal
        ? `Goal: ${sessionGoal}`
        : 'Set your focus goal'
      : phase === 'focus'
      ? isRunning
        ? 'Stay focused. You got this!'
        : 'Paused - resume when ready'
      : 'Take a break and relax';

  const handleDeleteGoal = useCallback(async (id: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeGoalTarget(id);
            loadGoalTargets();
          },
        },
      ]
    );
  }, [loadGoalTargets]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.bgAlt, Colors.bg, Colors.ink]}
        style={StyleSheet.absoluteFill}
      />
      
      <SakuraAnimation intensity="heavy" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>Sakura Focus</Text>
            <Text style={styles.appSub}>Japanese Pomodoro Timer</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.streakBadge}>
              <MaterialIcons name="local-fire-department" size={18} color={Colors.sakura} />
              <Text style={styles.streakText}>{streak}</Text>
              <Text style={styles.streakLabel}>streak</Text>
            </View>
            <TouchableOpacity 
              style={styles.adminBtn}
              onPress={() => router.push('/settings')}
            >
              <MaterialIcons name="settings" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.widgetsSection}>
          <View style={styles.widgetsRow}>
            <View style={styles.widgetHalf}>
              <WidgetCard
                title="TIME"
                icon="schedule"
                variant={isTransparent ? 'transparent' : 'default'}
              >
                <CountdownWidget 
                  showSeconds={true}
                  showDate={true}
                  size="medium"
                  variant={isTransparent ? 'transparent' : 'default'}
                />
              </WidgetCard>
            </View>
          </View>

          {goalTargets.length > 0 ? (
            <View style={styles.widgetsRow}>
              <View style={styles.widgetFull}>
              <WidgetCard
                title="GOAL TRACKER"
                icon="flag"
                variant={isTransparent ? 'transparent' : 'default'}
              >
                  <DaysCounterWidget 
                    goal={goalTargets[0]}
                    variant={isTransparent ? 'transparent' : 'default'}
                    showProgress={true}
                  />
                  <View style={styles.widgetActions}>
                    <TouchableOpacity 
                      style={styles.widgetActionBtn}
                      onPress={() => setShowAddGoalModal(true)}
                    >
                      <MaterialIcons name="add" size={16} color={Colors.primary} />
                      <Text style={styles.widgetActionText}>Add Goal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.widgetActionBtn}
                      onPress={() => handleDeleteGoal(goalTargets[0].id)}
                    >
                      <MaterialIcons name="delete" size={16} color={Colors.danger} />
                      <Text style={[styles.widgetActionText, { color: Colors.danger }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </WidgetCard>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addGoalCard}
              onPress={() => setShowAddGoalModal(true)}
            >
              <LinearGradient
                colors={[Colors.primary + '30', Colors.secondary + '20']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addGoalGradient}
              />
              <View style={styles.addGoalContent}>
                <MaterialIcons name="add-circle-outline" size={32} color={Colors.primary} />
                <Text style={styles.addGoalText}>Set a Goal</Text>
                <Text style={styles.addGoalSubtext}>Track your exam or deadline</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {penaltyActive ? (
          <View style={styles.penaltyBanner}>
            <MaterialIcons name="warning" size={16} color={Colors.danger} />
            <Text style={styles.penaltyText}>
              Distraction logged - stay focused
            </Text>
          </View>
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
            />
          ))}
          <Text style={styles.roundLabel}>
            Round {currentRound} of 4
          </Text>
        </View>

        <View style={styles.timerWrapper}>
          <CircularTimer
            progress={progress}
            secondsLeft={secondsLeft}
            phase={phase === 'idle' ? 'idle' : phase}
            isRunning={isRunning}
            size={280}
          />
        </View>

        <Text style={styles.phaseMessage}>
          {phaseText}
        </Text>

        {phase === 'idle' && sessionGoal ? (
          <TouchableOpacity 
            style={styles.changeGoalBtn}
            onPress={() => setShowGoalModal(true)}
          >
            <MaterialIcons name="edit" size={16} color={Colors.primary} />
            <Text style={styles.changeGoalText}>Change Goal</Text>
          </TouchableOpacity>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.mainBtn,
            pressed && styles.mainBtnPressed,
          ]}
          onPress={handleMainAction}
        >
          <LinearGradient
            colors={
              phase === 'break'
                ? [Colors.success, Colors.success]
                : [Colors.primary, Colors.secondary]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.mainBtnContent}>
            <MaterialIcons name={mainBtnIcon} size={28} color={Colors.white} />
            <Text style={styles.mainBtnText}>{mainBtnLabel}</Text>
          </View>
        </Pressable>

        {phase !== 'idle' ? (
          <View style={styles.secondaryRow}>
            {phase === 'focus' ? (
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryBtnFull,
                  { backgroundColor: Colors.primary },
                  pressed && styles.secondaryBtnPressed,
                ]}
                onPress={() => setShowDistraction(true)}
              >
                <MaterialIcons name="add" size={18} color={Colors.white} />
                <Text style={[styles.secondaryBtnTextWhite]}>
                  Distraction{distractionCount > 0 ? ` (${distractionCount})` : ''}
                </Text>
              </Pressable>
            ) : null}
            {phase === 'break' ? (
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryBtnFull,
                  { backgroundColor: Colors.success },
                  pressed && styles.secondaryBtnPressed,
                ]}
                onPress={skipBreak}
              >
                <MaterialIcons name="skip-next" size={18} color={Colors.white} />
                <Text style={styles.secondaryBtnTextWhite}>Skip Break</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtnFull,
                { backgroundColor: Colors.danger },
                pressed && styles.secondaryBtnPressed,
              ]}
              onPress={() => setShowAbandon(true)}
            >
              <MaterialIcons name="stop" size={18} color={Colors.white} />
              <Text style={styles.secondaryBtnTextWhite}>
                Abandon
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Text style={styles.tipIconText}>TIP</Text>
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Focus Tip</Text>
            <Text style={styles.tipText}>
              {FOCUS_TIPS[currentTipIndex]}
            </Text>
          </View>
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

      <AbandonModal
        visible={showAbandon}
        onConfirm={handleAbandonConfirm}
        onCancel={() => setShowAbandon(false)}
      />

      <DistractionModal
        visible={showDistraction}
        onClose={() => setShowDistraction(false)}
        onLog={handleLogDistraction}
      />

      <Modal
        visible={showGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowGoalModal(false)}>
          <Pressable style={styles.goalModal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>What are you focusing on?</Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.goalsGrid}>
              {GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.goalBtn,
                    sessionGoal === goal && styles.goalBtnSelected,
                  ]}
                  onPress={() => handleSelectGoal(goal)}
                >
                  <MaterialIcons
                    name={
                      goal === 'Studying' ? 'school' :
                      goal === 'Working' ? 'work' :
                      goal === 'Reading' ? 'menu-book' :
                      goal === 'Writing' ? 'edit' :
                      goal === 'Coding' ? 'code' :
                      goal === 'Learning' ? 'psychology' : 'more-horiz'
                    }
                    size={24}
                    color={sessionGoal === goal ? Colors.white : Colors.primary}
                  />
                  <Text
                    style={[
                      styles.goalBtnText,
                      sessionGoal === goal && styles.goalBtnTextSelected,
                    ]}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <GoalTargetModal
        visible={showAddGoalModal}
        onClose={() => {
          setShowAddGoalModal(false);
          loadGoalTargets();
        }}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
    backgroundColor: Colors.sakuraMuted,
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
  adminBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
  },
  roundDotActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  roundDotDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roundLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  timerWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  phaseMessage: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  changeGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  changeGoalText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  mainBtn: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  mainBtnGradient: {
    ...StyleSheet.absoluteFillObject,
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 4,
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
  secondaryBtnFull: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  secondaryBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
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
  secondaryBtnTextWhite: {
    fontSize: FontSize.sm,
    color: Colors.white,
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
    fontSize: 10,
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
  },
  quoteCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    alignItems: 'center',
  },
  quoteJapanese: {
    fontSize: FontSize.md,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  goalModal: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  goalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    minWidth: '45%',
  },
  goalBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalBtnText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  goalBtnTextSelected: {
    color: Colors.white,
  },
  widgetsSection: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  widgetsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  widgetHalf: {
    flex: 1,
  },
  widgetFull: {
    flex: 1,
  },
  widgetActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  widgetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  widgetActionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
  addGoalCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    borderStyle: 'dashed',
  },
  addGoalGradient: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGoalContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGoalText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  addGoalSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
