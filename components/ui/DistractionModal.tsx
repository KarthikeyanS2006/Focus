// Powered by Sakura Focus - Distraction Logger
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { DISTRACTION_CATEGORIES, DistractionCategory, DistractionLog } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onLog: (log: DistractionLog) => void;
}

export function DistractionModal({ visible, onClose, onLog }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<DistractionCategory | null>(null);
  const [customApp, setCustomApp] = useState('');

  const handleLog = () => {
    if (!selectedCategory) return;

    const log: DistractionLog = {
      id: `dist_${Date.now()}`,
      category: selectedCategory,
      appName: customApp.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    onLog(log);
    setSelectedCategory(null);
    setCustomApp('');
    onClose();
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setCustomApp('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Log Distraction</Text>
            <Pressable onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>What distracted you?</Text>

          <View style={styles.categories}>
            {DISTRACTION_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryBtn,
                  selectedCategory === cat.id && styles.categoryBtnSelected,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <MaterialIcons
                  name={cat.icon as any}
                  size={24}
                  color={selectedCategory === cat.id ? Colors.white : Colors.primary}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === cat.id && styles.categoryLabelSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedCategory && (
            <View style={styles.appInput}>
              <Text style={styles.appLabel}>App Name (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Instagram, YouTube..."
                placeholderTextColor={Colors.textMuted}
                value={customApp}
                onChangeText={setCustomApp}
              />
            </View>
          )}

          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.logBtn, !selectedCategory && styles.logBtnDisabled]}
              onPress={handleLog}
              disabled={!selectedCategory}
            >
              <MaterialIcons name="add-circle" size={20} color={Colors.white} />
              <Text style={styles.logText}>Log Distraction</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  categoryBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryLabel: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  categoryLabelSelected: {
    color: Colors.white,
  },
  appInput: {
    marginBottom: Spacing.lg,
  },
  appLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  logBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.danger,
  },
  logBtnDisabled: {
    opacity: 0.5,
  },
  logText: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
});
