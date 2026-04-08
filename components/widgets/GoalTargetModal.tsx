// Goal Target Modal - Add/Edit goal targets with scrollable date picker
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Dimensions } from 'react-native';
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

// Generate date options
const generateYears = () => {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i <= currentYear + 5; i++) {
    years.push(i);
  }
  return years;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const generateDays = (year: number, month: number) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  label: string;
  icon: 'play-arrow' | 'flag';
  iconColor: string;
}

function DatePicker({ value, onChange, label, icon, iconColor }: DatePickerProps) {
  const [selectedDay, setSelectedDay] = useState(value.getDate());
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth());
  const [selectedYear, setSelectedYear] = useState(value.getFullYear());
  const [isOpen, setIsOpen] = useState(false);

  const years = useMemo(() => generateYears(), []);
  const days = useMemo(() => generateDays(selectedYear, selectedMonth), [selectedYear, selectedMonth]);

  const handleConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    onChange(newDate);
    setIsOpen(false);
  };

  const formatDisplayDate = (date: Date) => {
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.dateSelector} onPress={() => setIsOpen(!isOpen)}>
        <MaterialIcons name={icon} size={24} color={iconColor} />
        <Text style={styles.dateSelectorText}>{formatDisplayDate(value)}</Text>
        <MaterialIcons name={isOpen ? 'expand-less' : 'expand-more'} size={24} color={Colors.textSecondary} />
      </Pressable>

      {isOpen && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerWheel}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerColumnTitle}>Day</Text>
              <ScrollView 
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
                decelerationRate="fast"
              >
                {[...Array(31)].map((_, i) => (
                  <Pressable
                    key={i}
                    style={[
                      styles.pickerItem,
                      selectedDay === i + 1 && styles.pickerItemSelected
                    ]}
                    onPress={() => {
                      const newDate = new Date(selectedYear, selectedMonth, i + 1);
                      setSelectedDay(i + 1);
                      setSelectedMonth(newDate.getMonth());
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedDay === i + 1 && styles.pickerItemTextSelected
                    ]}>{i + 1}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerColumnTitle}>Month</Text>
              <ScrollView 
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
                decelerationRate="fast"
              >
                {MONTHS.map((month, i) => (
                  <Pressable
                    key={month}
                    style={[
                      styles.pickerItem,
                      selectedMonth === i && styles.pickerItemSelected
                    ]}
                    onPress={() => {
                      const daysInNewMonth = new Date(selectedYear, i + 1, 0).getDate();
                      const newDay = Math.min(selectedDay, daysInNewMonth);
                      setSelectedMonth(i);
                      setSelectedDay(newDay);
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedMonth === i && styles.pickerItemTextSelected
                    ]}>{month}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerColumnTitle}>Year</Text>
              <ScrollView 
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
                decelerationRate="fast"
              >
                {years.map((year) => (
                  <Pressable
                    key={year}
                    style={[
                      styles.pickerItem,
                      selectedYear === year && styles.pickerItemSelected
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedYear === year && styles.pickerItemTextSelected
                    ]}>{year}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmBtnGradient}
            />
            <View style={styles.confirmBtnContent}>
              <MaterialIcons name="check" size={20} color={Colors.white} />
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export function GoalTargetModal({ visible, onClose, onSave }: GoalTargetModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [targetDate, setTargetDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default to 30 days from now
    return date;
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }
    if (targetDate <= startDate) {
      return;
    }

    setIsLoading(true);
    try {
      const goal = await addGoalTarget({
        title: title.trim(),
        startDate: startDate.toISOString().split('T')[0],
        targetDate: targetDate.toISOString().split('T')[0],
      });
      setTitle('');
      setStartDate(new Date());
      const newTarget = new Date();
      newTarget.setDate(newTarget.getDate() + 30);
      setTargetDate(newTarget);
      onSave?.(goal[0]);
      onClose();
    } catch (error) {
      console.error('Failed to save goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setStartDate(new Date());
    const newTarget = new Date();
    newTarget.setDate(newTarget.getDate() + 30);
    setTargetDate(newTarget);
    onClose();
  };

  const daysRemaining = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

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
            <Text style={styles.headerTitle}>Set Your Goal</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>What is your goal?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Exam preparation"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />

            <DatePicker
              value={startDate}
              onChange={setStartDate}
              label="When did you start?"
              icon="play-arrow"
              iconColor={Colors.success}
            />

            <DatePicker
              value={targetDate}
              onChange={setTargetDate}
              label="When is your target date?"
              icon="flag"
              iconColor={Colors.primary}
            />

            {daysRemaining > 0 && (
              <View style={styles.previewCard}>
                <MaterialIcons name="event-available" size={24} color={Colors.gold} />
                <View style={styles.previewContent}>
                  <Text style={styles.previewNumber}>{daysRemaining}</Text>
                  <Text style={styles.previewLabel}>days to achieve your goal</Text>
                </View>
              </View>
            )}
          </View>

          <Pressable 
            style={[styles.saveBtn, (!title.trim() || isLoading) && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={!title.trim() || isLoading}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateSelectorText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  pickerContainer: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  pickerWheel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 160,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerColumnTitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pickerScroll: {
    flex: 1,
    width: '100%',
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  pickerItemSelected: {
    backgroundColor: Colors.primary,
  },
  pickerItemText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  pickerItemTextSelected: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  confirmBtn: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  confirmBtnGradient: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnContent: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  confirmBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  previewNumber: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.gold,
  },
  previewLabel: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: FontWeight.medium,
  },
  saveBtn: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  saveBtnDisabled: {
    opacity: 0.5,
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
