// Powered by Sakura Focus - AI Companion
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Animated, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { ChatMessage, CompanionState, getSimpleResponse } from '@/types/companion';

interface Props {
  state: CompanionState;
  visible?: boolean;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  text: "Hello! I'm your focus companion! Ask me about focus tips or your progress!",
  isUser: false,
  timestamp: new Date(),
};

export function AICompanion({ state, visible = true }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    bounce.start();
    return () => bounce.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getSimpleResponse(inputText, state);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Expanded Chat Panel */}
      {isExpanded && (
        <Animated.View style={[styles.chatPanel, { transform: [{ scale: scaleAnim }] }]}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.chatHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.avatarSmall}>
                  <MaterialIcons name="smart-toy" size={20} color={Colors.sakura} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Focus Guide</Text>
                  <Text style={styles.headerSubtitle}>{getGreeting()}, warrior!</Text>
                </View>
              </View>
              <Pressable onPress={() => setIsExpanded(false)} style={styles.minimizeBtn}>
                <MaterialIcons name="minimize" size={24} color={Colors.textSecondary} />
              </Pressable>
            </View>

            {state.todayMinutes > 0 && (
              <View style={styles.statsBanner}>
                <View style={styles.statItem}>
                  <MaterialIcons name="timer" size={16} color={Colors.primary} />
                  <Text style={styles.statText}>{state.todayMinutes} min today</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialIcons name="local-fire-department" size={16} color={Colors.sakura} />
                  <Text style={styles.statText}>{state.streak} day streak</Text>
                </View>
              </View>
            )}

            <ScrollView 
              ref={scrollRef}
              style={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg) => (
                <View 
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    msg.isUser ? styles.userRow : styles.aiRow,
                  ]}
                >
                  {!msg.isUser && (
                    <View style={styles.avatarSmall}>
                      <MaterialIcons name="smart-toy" size={16} color={Colors.sakura} />
                    </View>
                  )}
                  <View style={[
                    styles.messageBubble,
                    msg.isUser ? styles.userBubble : styles.aiBubble,
                  ]}>
                    <Text style={[
                      styles.messageText,
                      msg.isUser && styles.userMessageText,
                    ]}>
                      {msg.text}
                    </Text>
                  </View>
                </View>
              ))}
              
              {isTyping && (
                <View style={[styles.messageRow, styles.aiRow]}>
                  <View style={styles.avatarSmall}>
                    <MaterialIcons name="smart-toy" size={16} color={Colors.sakura} />
                  </View>
                  <View style={[styles.messageBubble, styles.aiBubble]}>
                    <Text style={styles.typingText}>Thinking...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask me anything..."
                placeholderTextColor={Colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Pressable 
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <MaterialIcons name="send" size={20} color={Colors.white} />
              </Pressable>
            </View>

            <View style={styles.quickActions}>
              <Text style={styles.quickLabel}>Quick help:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Focus tips', 'My stats', 'Block apps', 'Motivate me'].map((action) => (
                  <Pressable
                    key={action}
                    style={styles.quickBtn}
                    onPress={() => setInputText(action)}
                  >
                    <Text style={styles.quickBtnText}>{action}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}

      {/* Floating Mascot Button */}
      {!isExpanded && (
        <Animated.View style={[
          styles.floatingBtn,
          { transform: [{ translateY: bounceAnim }] }
        ]}>
          <Pressable 
            style={styles.mascotBtn}
            onPress={() => setIsExpanded(true)}
          >
            <View style={styles.mascotAvatar}>
              <MaterialIcons name="smart-toy" size={32} color={Colors.sakura} />
            </View>
            <View style={styles.notificationBadge}>
              <MaterialIcons name="chat" size={12} color={Colors.white} />
            </View>
          </Pressable>
          {state.distractionCount > 0 && (
            <View style={styles.distractBadge}>
              <Text style={styles.distractText}>{state.distractionCount}</Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.lg,
    zIndex: 1000,
  },
  floatingBtn: {
    alignItems: 'center',
  },
  mascotBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.sakura,
    shadowColor: Colors.sakura,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mascotAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.sakuraMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distractBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  distractText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  chatPanel: {
    width: 320,
    height: 480,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.sakura,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },
  keyboardView: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.sakuraMuted,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sakuraMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  minimizeBtn: {
    padding: Spacing.xs,
  },
  statsBanner: {
    flexDirection: 'row',
    gap: Spacing.lg,
    padding: Spacing.sm,
    backgroundColor: Colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
    padding: Spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.surfaceAlt,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.white,
  },
  typingText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  quickActions: {
    padding: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quickLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  quickBtn: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  quickBtnText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
  },
});
