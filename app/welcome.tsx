// Powered by Sakura Focus - Welcome Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { setUserAsReturning, saveUserProfile } from '@/services/storageService';

export default function WelcomeScreen() {
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);

  const handleGetStarted = async () => {
    if (name.trim()) {
      await saveUserProfile({
        name: name.trim(),
        isNewUser: false,
        createdAt: new Date().toISOString(),
        dailyGoalMinutes: 120,
      });
    } else {
      await setUserAsReturning();
    }
    router.replace('/(tabs)');
  };

  const renderStep0 = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconCircle}>
        <MaterialIcons name="self-improvement" size={80} color={Colors.sakura} />
      </View>
      <Text style={styles.welcomeTitle}>Welcome to</Text>
      <Text style={styles.appName}>Sakura Focus</Text>
      <Text style={styles.subtitle}>Japanese Pomodoro Timer</Text>
      
      <View style={styles.features}>
        <View style={styles.featureItem}>
          <MaterialIcons name="timer" size={24} color={Colors.primary} />
          <Text style={styles.featureText}>Focus Timer</Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialIcons name="block" size={24} color={Colors.danger} />
          <Text style={styles.featureText}>Block Distractions</Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialIcons name="insights" size={24} color={Colors.success} />
          <Text style={styles.featureText}>Track Progress</Text>
        </View>
      </View>

      <Pressable style={styles.primaryBtn} onPress={() => setStep(1)}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btnGradient}
        />
        <Text style={styles.btnText}>Get Started</Text>
      </Pressable>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <MaterialIcons name="waving-hand" size={60} color={Colors.gold} />
      <Text style={styles.nameTitle}>What should we call you?</Text>
      <Text style={styles.nameSubtitle}>Your name helps personalize your experience</Text>
      
      <TextInput
        style={styles.nameInput}
        placeholder="Enter your name"
        placeholderTextColor={Colors.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Pressable style={styles.primaryBtn} onPress={handleGetStarted}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btnGradient}
        />
        <Text style={styles.btnText}>Continue</Text>
      </Pressable>
      
      <Pressable style={styles.skipBtn} onPress={handleGetStarted}>
        <Text style={styles.skipText}>Skip for now</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.bgAlt, Colors.bg, Colors.ink]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.container}>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
      </View>

      <View style={styles.sakuraLeft}>
        <MaterialIcons name="local-florist" size={120} color={Colors.sakuraMuted} />
      </View>
      <View style={styles.sakuraRight}>
        <MaterialIcons name="local-florist" size={100} color={Colors.sakuraMuted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  stepContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.sakuraMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: FontSize.xl,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  appName: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: Colors.sakura,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    marginBottom: Spacing.xxl,
  },
  features: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  btnGradient: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  btnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  skipBtn: {
    padding: Spacing.md,
  },
  skipText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  nameTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  nameSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  nameInput: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  sakuraLeft: {
    position: 'absolute',
    left: -40,
    bottom: 100,
    opacity: 0.3,
  },
  sakuraRight: {
    position: 'absolute',
    right: -30,
    bottom: 200,
    opacity: 0.2,
  },
});
