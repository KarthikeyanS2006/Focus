// Powered by Sakura Focus - Settings Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { BlockedApp, DISTRACTION_CATEGORIES, DistractionCategory } from '@/types';
import { getBlockedApps, addBlockedApp, removeBlockedApp, getUserProfile, saveUserProfile } from '@/services/storageService';
import { SakuraAnimation } from '@/components/ui/SakuraAnimation';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<DistractionCategory>('other');
  const [userName, setUserName] = useState('');
  const [dailyGoal, setDailyGoal] = useState('120');

  const loadData = useCallback(async () => {
    const apps = await getBlockedApps();
    setBlockedApps(apps);
    const profile = await getUserProfile();
    setUserName(profile.name);
    setDailyGoal(String(profile.dailyGoalMinutes));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemoveApp = async (id: string, name: string) => {
    Alert.alert(
      'Remove App',
      `Remove "${name}" from blocked apps?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = await removeBlockedApp(id);
            setBlockedApps(updated);
          },
        },
      ]
    );
  };

  const handleAddApp = async () => {
    if (!newAppName.trim()) return;
    
    const updated = await addBlockedApp({
      name: newAppName.trim(),
      category: newAppCategory,
    });
    setBlockedApps(updated);
    setNewAppName('');
    setNewAppCategory('other');
    setShowAddModal(false);
  };

  const handleSaveProfile = async () => {
    await saveUserProfile({
      name: userName,
      isNewUser: false,
      createdAt: new Date().toISOString(),
      dailyGoalMinutes: parseInt(dailyGoal) || 120,
    });
    Alert.alert('Saved', 'Your settings have been saved.');
  };

  const getCategoryIcon = (catId: DistractionCategory) => {
    const cat = DISTRACTION_CATEGORIES.find((c) => c.id === catId);
    return cat?.icon || 'apps';
  };

  const getCategoryLabel = (catId: DistractionCategory) => {
    const cat = DISTRACTION_CATEGORIES.find((c) => c.id === catId);
    return cat?.label || 'Other';
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.bgAlt, Colors.bg, Colors.ink]}
        style={StyleSheet.absoluteFill}
      />
      
      <SakuraAnimation intensity="light" />

      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
                value={userName}
                onChangeText={setUserName}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Daily Goal (min)</Text>
              <TextInput
                style={[styles.input, { width: 100, textAlign: 'center' }]}
                placeholder="120"
                placeholderTextColor={Colors.textMuted}
                value={dailyGoal}
                onChangeText={setDailyGoal}
                keyboardType="number-pad"
              />
            </View>
            <Pressable style={styles.saveBtn} onPress={handleSaveProfile}>
              <MaterialIcons name="save" size={20} color={Colors.white} />
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Blocked Apps</Text>
            <Pressable style={styles.addBtn} onPress={() => setShowAddModal(true)}>
              <MaterialIcons name="add" size={20} color={Colors.primary} />
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>
          <Text style={styles.sectionSubtitle}>
            Apps you want to avoid during focus time
          </Text>
          
          {blockedApps.map((app) => (
            <View key={app.id} style={styles.appItem}>
              <View style={[styles.appIcon, { backgroundColor: Colors.dangerMuted }]}>
                <MaterialIcons name={getCategoryIcon(app.category) as any} size={20} color={Colors.danger} />
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{app.name}</Text>
                <Text style={styles.appCategory}>{getCategoryLabel(app.category)}</Text>
              </View>
              <Pressable
                style={styles.removeBtn}
                onPress={() => handleRemoveApp(app.id, app.name)}
              >
                <MaterialIcons name="delete-outline" size={20} color={Colors.danger} />
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Built with</Text>
              <Text style={styles.aboutValue}>Expo + React Native</Text>
            </View>
          </View>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Blocked App</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="App name"
              placeholderTextColor={Colors.textMuted}
              value={newAppName}
              onChangeText={setNewAppName}
            />

            <Text style={styles.modalLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {DISTRACTION_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.catBtn,
                    newAppCategory === cat.id && styles.catBtnSelected,
                  ]}
                  onPress={() => setNewAppCategory(cat.id)}
                >
                  <MaterialIcons
                    name={cat.icon as any}
                    size={18}
                    color={newAppCategory === cat.id ? Colors.white : Colors.primary}
                  />
                  <Text
                    style={[
                      styles.catBtnText,
                      newAppCategory === cat.id && styles.catBtnTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.modalAddBtn} onPress={handleAddApp}>
              <MaterialIcons name="add-circle" size={20} color={Colors.white} />
              <Text style={styles.modalAddText}>Add App</Text>
            </Pressable>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  inputLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  saveBtnText: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  addBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  appName: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  appCategory: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  removeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  aboutLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  aboutValue: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modal: {
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
  modalInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  modalLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  catBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catBtnText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
  },
  catBtnTextSelected: {
    color: Colors.white,
  },
  modalAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  modalAddText: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
});
