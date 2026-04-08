// Goal Target Modal - Add/Edit goal targets
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { GoalTarget } from '@/types';
import { addGoalTarget } from '@/services/storageService';

interface GoalTargetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (goal: GoalTarget) => void;
}

export function GoalTargetModal({ visible, onClose, onSave }: GoalTargetModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }
    if (!targetDate) {
      Alert.alert('Error', 'Please select a target date');
      return;
    }
    if (new Date(targetDate) <= new Date(startDate)) {
      Alert.alert('Error', 'Target date must be after start date');
      return;
    }

    setIsLoading(true);
    try {
      await addGoalTarget({
        title: title.trim(),
        startDate,
        targetDate,
      });
      setTitle('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setTargetDate('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setTargetDate('');
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const twoYears = new Date();
    twoYears.setFullYear(twoYears.getFullYear() + 2);
    return twoYears.toISOString().split('T')[0];
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Set Your Goal</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>What is your goal?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Exam preparation, Learn coding"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />

            <Text style={styles.label}>When did you start?</Text>
            <View style={styles.dateRow}>
              <MaterialIcons name="play-arrow" size={20} color={Colors.success} />
              <TextInput
                style={[styles.dateInput, { color: Colors.textPrimary }]}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <Text style={styles.label}>When is your target date?</Text>
            <View style={styles.dateRow}>
              <MaterialIcons name="flag" size={20} color={Colors.primary} />
              <TextInput
                style={[styles.dateInput, { color: Colors.textPrimary }]}
                value={targetDate}
                onChangeText={setTargetDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <Text style={styles.hint}>
              We'll track how many days until your target and show your progress
            </Text>
          </View>

          <Pressable 
            style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveBtnGradient}
            />
            <View style={styles.saveBtnContent}>
              <MaterialIcons name="add-circle" size={20} color={Colors.white} />
              <Text style={styles.saveBtnText}>
                {isLoading ? 'Saving...' : 'Add Goal'}
              </Text>
            </View>
          </Pressable>
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
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.border,
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
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateInput: {
    flex: 1,
    fontSize: FontSize.md,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  saveBtn: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnContent: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  saveBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
