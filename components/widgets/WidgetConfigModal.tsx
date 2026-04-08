// Widget Config Modal - Configure widget appearance
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Switch, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WidgetConfigModalProps {
  visible: boolean;
  onClose: () => void;
  widgetType: 'countdown' | 'days' | null;
}

const WIDGET_CONFIG_KEY = 'widget_config';

interface WidgetConfig {
  countdownVariant: 'default' | 'transparent' | 'samsung';
  daysVariant: 'default' | 'transparent' | 'samsung';
  countdownSize: 'small' | 'medium' | 'large';
  showSeconds: boolean;
  showDate: boolean;
  showProgress: boolean;
}

export function WidgetConfigModal({ visible, onClose, widgetType }: WidgetConfigModalProps) {
  const [config, setConfig] = useState<WidgetConfig>({
    countdownVariant: 'default',
    daysVariant: 'default',
    countdownSize: 'medium',
    showSeconds: true,
    showDate: true,
    showProgress: true,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const raw = await AsyncStorage.getItem(WIDGET_CONFIG_KEY);
      if (raw) {
        setConfig(JSON.parse(raw));
      }
    } catch (error) {
      console.log('Failed to load widget config');
    }
  };

  const saveConfig = async (newConfig: WidgetConfig) => {
    try {
      await AsyncStorage.setItem(WIDGET_CONFIG_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.log('Failed to save widget config');
    }
  };

  const handleVariantChange = (variant: 'default' | 'transparent' | 'samsung') => {
    if (widgetType === 'countdown') {
      saveConfig({ ...config, countdownVariant: variant });
    } else if (widgetType === 'days') {
      saveConfig({ ...config, daysVariant: variant });
    }
  };

  const getVariantLabel = (variant: string) => {
    switch (variant) {
      case 'samsung': return 'Samsung (Transparent)';
      case 'transparent': return 'Transparent';
      default: return 'Default';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Widget Settings</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.content}>
            {widgetType === 'countdown' && (
              <>
                <Text style={styles.sectionTitle}>Appearance</Text>
                <View style={styles.optionGroup}>
                  {(['default', 'transparent', 'samsung'] as const).map((variant) => (
                    <Pressable
                      key={variant}
                      style={[
                        styles.variantBtn,
                        config.countdownVariant === variant && styles.variantBtnActive,
                      ]}
                      onPress={() => handleVariantChange(variant)}
                    >
                      <MaterialIcons
                        name={variant === 'samsung' ? 'blur-on' : variant === 'transparent' ? 'opacity' : 'format-color-fill'}
                        size={20}
                        color={config.countdownVariant === variant ? Colors.white : Colors.primary}
                      />
                      <Text
                        style={[
                          styles.variantBtnText,
                          config.countdownVariant === variant && styles.variantBtnTextActive,
                        ]}
                      >
                        {getVariantLabel(variant)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Size</Text>
                <View style={styles.optionGroup}>
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <Pressable
                      key={size}
                      style={[
                        styles.sizeBtn,
                        config.countdownSize === size && styles.sizeBtnActive,
                      ]}
                      onPress={() => saveConfig({ ...config, countdownSize: size })}
                    >
                      <Text
                        style={[
                          styles.sizeBtnText,
                          config.countdownSize === size && styles.sizeBtnTextActive,
                        ]}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.switchRow}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Show Seconds</Text>
                    <Text style={styles.switchDesc}>Display real-time seconds</Text>
                  </View>
                  <Switch
                    value={config.showSeconds}
                    onValueChange={(val) => saveConfig({ ...config, showSeconds: val })}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Show Date</Text>
                    <Text style={styles.switchDesc}>Display current date</Text>
                  </View>
                  <Switch
                    value={config.showDate}
                    onValueChange={(val) => saveConfig({ ...config, showDate: val })}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </>
            )}

            {widgetType === 'days' && (
              <>
                <Text style={styles.sectionTitle}>Appearance</Text>
                <View style={styles.optionGroup}>
                  {(['default', 'transparent', 'samsung'] as const).map((variant) => (
                    <Pressable
                      key={variant}
                      style={[
                        styles.variantBtn,
                        config.daysVariant === variant && styles.variantBtnActive,
                      ]}
                      onPress={() => handleVariantChange(variant)}
                    >
                      <MaterialIcons
                        name={variant === 'samsung' ? 'blur-on' : variant === 'transparent' ? 'opacity' : 'format-color-fill'}
                        size={20}
                        color={config.daysVariant === variant ? Colors.white : Colors.primary}
                      />
                      <Text
                        style={[
                          styles.variantBtnText,
                          config.daysVariant === variant && styles.variantBtnTextActive,
                        ]}
                      >
                        {getVariantLabel(variant)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.switchRow}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Show Progress</Text>
                    <Text style={styles.switchDesc}>Display progress bar</Text>
                  </View>
                  <Switch
                    value={config.showProgress}
                    onValueChange={(val) => saveConfig({ ...config, showProgress: val })}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </>
            )}

            {!widgetType && (
              <Text style={styles.hint}>Tap on a widget to configure it</Text>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export async function getWidgetConfig(): Promise<WidgetConfig | null> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
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
  content: {},
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionGroup: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  variantBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryMuted,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  variantBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  variantBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
  variantBtnTextActive: {
    color: Colors.white,
  },
  sizeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sizeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sizeBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  sizeBtnTextActive: {
    color: Colors.white,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  switchDesc: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
});
