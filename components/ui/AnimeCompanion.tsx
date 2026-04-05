// Powered by Sakura Focus - Anime Companion with 3D Human-like Walking
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, TextInput, ScrollView, Dimensions } from 'react-native';
import Svg, { Path, Ellipse, Circle, Rect, G } from 'react-native-svg';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { ChatMessage, CompanionState, getSimpleResponse } from '@/types/companion';
import { TimerPhase } from '@/types';

interface Props {
  state: CompanionState;
  visible?: boolean;
  isRunning?: boolean;
  phase?: TimerPhase;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  text: "H-hello! I'm Sakura! Let me help you focus today, okay?",
  isUser: false,
  timestamp: new Date(),
};

const IDLE_TIMEOUT = 10000;

export function AnimeCompanion({ state, visible = true, isRunning = false, phase = 'idle' }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isBlushing, setIsBlushing] = useState(false);
  const [currentMood, setCurrentMood] = useState<'shy' | 'happy' | 'thinking' | 'worried'>('shy');
  const [isWalking, setIsWalking] = useState(false);
  const [walkPhase, setWalkPhase] = useState(0);
  const [showFocusTip, setShowFocusTip] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  
  const characterX = useRef(new Animated.Value(0)).current;
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkDirectionRef = useRef<'right' | 'left'>('right');
  const isWalkingRef = useRef(false);
  const walkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(1)).current;
  const prevPhaseRef = useRef(phase);

  const FOCUS_TIPS = [
    "Put your phone face-down!",
    "Sit quietly & breathe deep",
    "Remove distractions nearby!",
    "Clear your mind & focus!",
    "Keep phone in another room!",
    "Close eyes, take 3 breaths!",
  ];

  const stopWalking = useCallback(() => {
    if (walkTimeoutRef.current) {
      clearTimeout(walkTimeoutRef.current);
      walkTimeoutRef.current = null;
    }
    if (walkIntervalRef.current) {
      clearInterval(walkIntervalRef.current);
      walkIntervalRef.current = null;
    }
    setIsWalking(false);
    isWalkingRef.current = false;
    setWalkPhase(0);
    Animated.spring(characterX, {
      toValue: 0,
      friction: 8,
      useNativeDriver: false,
    }).start();
    flipAnim.setValue(1);
  }, [flipAnim, characterX]);

  const startWalking = useCallback(() => {
    if (isExpanded) return;
    
    setIsWalking(true);
    isWalkingRef.current = true;
    walkDirectionRef.current = 'right';
    characterX.setValue(0);
    flipAnim.setValue(1);

    walkIntervalRef.current = setInterval(() => {
      setWalkPhase(prev => (prev + 1) % 4);
    }, 300);

    const walkAcross = () => {
      if (!isWalkingRef.current) {
        if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
        return;
      }
      
      const targetX = walkDirectionRef.current === 'right' ? SCREEN_WIDTH - 100 : -50;
      
      Animated.timing(characterX, {
        toValue: targetX,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && isWalkingRef.current) {
          walkDirectionRef.current = walkDirectionRef.current === 'right' ? 'left' : 'right';
          flipAnim.setValue(walkDirectionRef.current === 'right' ? 1 : -1);
          walkTimeoutRef.current = setTimeout(walkAcross, 300);
        }
      });
    };

    walkAcross();
  }, [isExpanded, flipAnim, characterX]);

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    bounce.start();
    
    return () => bounce.stop();
  }, [bounceAnim]);

  useEffect(() => {
    if (prevPhaseRef.current === 'idle' && phase === 'focus' && isRunning) {
      const tip = FOCUS_TIPS[Math.floor(Math.random() * FOCUS_TIPS.length)];
      setCurrentTip(tip);
      setShowFocusTip(true);
      setTimeout(() => setShowFocusTip(false), 6000);
    }
    prevPhaseRef.current = phase;
  }, [phase, isRunning]);

  useEffect(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    if (isWalkingRef.current) {
      stopWalking();
    }
    
    idleTimerRef.current = setTimeout(() => {
      if (!isExpanded) {
        startWalking();
      }
    }, IDLE_TIMEOUT);
    
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    };
  }, [isExpanded, stopWalking, startWalking]);

  useEffect(() => {
    if (state.distractionCount > 0) setCurrentMood('worried');
    else if (state.currentScreen === 'stats') setCurrentMood('happy');
    else setCurrentMood('shy');
  }, [state]);

  const triggerJump = useCallback(() => {
    setIsBlushing(true);
    
    Animated.sequence([
      Animated.timing(jumpAnim, {
        toValue: -50,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(jumpAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
    
    setTimeout(() => setIsBlushing(false), 500);
  }, [jumpAnim]);

  const handleTap = () => {
    if (isWalking) {
      triggerJump();
      stopWalking();
    }
    
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    idleTimerRef.current = setTimeout(() => {
      if (!isExpanded) {
        startWalking();
      }
    }, IDLE_TIMEOUT);
    
    setIsExpanded(true);
  };

  const handleCloseChat = () => {
    setIsExpanded(false);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      if (!isExpanded) {
        startWalking();
      }
    }, IDLE_TIMEOUT);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (isWalking) stopWalking();

    setCurrentMood('thinking');
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
      setCurrentMood('happy');
    }, 1000);
  };

  const getSpeechText = () => {
    if (isWalking) return "Hmph~";
    if (currentMood === 'shy') return "H-hi!";
    if (currentMood === 'worried') return "Stay focused...";
    if (currentMood === 'happy') return "Yay!";
    if (currentMood === 'thinking') return "Hmm...";
    return "Ok!";
  };

  const getLegOffset = (isLeft: boolean) => {
    if (!isWalking) return 0;
    if (isLeft) {
      if (walkPhase === 0) return -15;
      if (walkPhase === 1) return -5;
      if (walkPhase === 2) return 15;
      return 5;
    } else {
      if (walkPhase === 0) return 15;
      if (walkPhase === 1) return 5;
      if (walkPhase === 2) return -15;
      return -5;
    }
  };

  const getArmOffset = (isLeft: boolean) => {
    if (!isWalking) return 0;
    if (isLeft) {
      if (walkPhase === 0 || walkPhase === 2) return 15;
      return -15;
    } else {
      if (walkPhase === 0 || walkPhase === 2) return -15;
      return 15;
    }
  };

  const getBodyBob = () => {
    if (!isWalking) return 0;
    if (walkPhase === 1 || walkPhase === 2) return -5;
    return 0;
  };

  const leftLegOffset = getLegOffset(true);
  const rightLegOffset = getLegOffset(false);
  const leftArmOffset = getArmOffset(true);
  const rightArmOffset = getArmOffset(false);
  const bodyBob = getBodyBob();

  if (!visible) return null;

  return (
    <>
      <Animated.View 
        style={[
          styles.characterWrapper,
          {
            transform: [
              { translateX: characterX },
              { translateY: isWalking ? bodyBob : bounceAnim },
              { scaleX: flipAnim },
              { translateY: jumpAnim },
            ],
          }
        ]}
      >
        <Pressable onPress={handleTap}>
          {showFocusTip ? (
            <View style={styles.focusTipBubble}>
              <Text style={styles.focusTipText}>{currentTip}</Text>
              <View style={styles.focusTipTail} />
            </View>
          ) : !isWalking && (
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>{getSpeechText()}</Text>
              <View style={styles.speechTail} />
            </View>
          )}
          
          <Svg width={120} height={260} viewBox="0 0 400 850">
            <Ellipse cx="200" cy="800" rx="70" ry="12" fill="#000000" opacity={isWalking ? 0.15 : 0.1} />

            <Path d="M170 120 Q150 200 160 320" stroke="#2C2C2C" strokeWidth="45" strokeLinecap="round" />

            {/* LEFT LEG (Back) - darker for depth */}
            <G opacity={0.6}>
              <Path 
                d={`M185 520 L${188 + leftLegOffset * 0.3} 600 L${182 + leftLegOffset * 0.8} 720`} 
                stroke="#C9A89A" strokeWidth="32" strokeLinecap="round" 
              />
              <Path d="M180 600 L183 720" stroke="#C9A89A" strokeWidth="30" strokeLinecap="round" />
              <Path d="M165 750 L190 752 L188 770 L160 768 Z" fill="#3D2A24" />
            </G>

            {/* LEFT ARM (Back) - darker for depth */}
            <G opacity={0.6}>
              <Path 
                d={`M160 240 L${145 + leftArmOffset * 0.3} 350`} 
                stroke="#C8C8C8" strokeWidth="22" strokeLinecap="round" 
              />
              <Rect x="138" y="340" width="18" height="14" rx="6" fill="#C8C8C8" />
            </G>

            {/* Torso */}
            <G>
              <Path d="M165 390 L235 390 L260 520 L140 520 Z" fill="#283593" />
              <Path d="M185 390 V520 M200 390 V520 M215 390 V520" stroke="#1A237E" strokeWidth="2" />
              <G>
                <Path d="M160 210 L240 210 L250 395 L150 395 Z" fill="#FFFFFF" />
                <Path d="M160 210 Q200 280 240 210 L255 230 Q200 310 145 230 Z" fill="#283593" />
                <Path d="M150 225 Q200 300 250 225" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
                <Path d="M200 260 L185 340 L200 320 L215 340 Z" fill="#1E88E5" />
                <Circle cx="200" cy="270" r="8" fill="#1E88E5" />
              </G>
            </G>

            {/* RIGHT LEG (Front) */}
            <G>
              <Path 
                d={`M215 520 L${212 + rightLegOffset * 0.3} 600 L${218 + rightLegOffset * 0.8} 720`} 
                stroke="#FDE2D2" strokeWidth="32" strokeLinecap="round" 
              />
              <Path d="M215 600 L212 720" stroke="#FFFFFF" strokeWidth="30" strokeLinecap="round" />
              <Path d="M195 750 L230 752 L235 768 L200 770 Z" fill="#4E342E" />
            </G>

            {/* RIGHT ARM (Front) */}
            <G>
              <Path 
                d={`M240 240 L${255 + rightArmOffset * 0.3} 350`} 
                stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round" 
              />
              <Rect x="248" y="340" width="18" height="14" rx="6" fill="#F5F5F5" />
            </G>

            {/* Head */}
            <G>
              <Rect x="190" y="180" width="20" height="30" fill="#FDE2D2" />
              <Path d="M165 110 Q165 195 200 200 Q235 195 235 110 Z" fill="#FDE2D2" />
              <Circle cx="180" cy="165" r="7" fill="#FFCDD2" opacity={isBlushing ? 0.9 : 0.5} />
              <Circle cx="220" cy="165" r="7" fill="#FFCDD2" opacity={isBlushing ? 0.9 : 0.5} />
              <Path d="M180 155 Q188 160 195 155" fill="none" stroke="#4E342E" strokeWidth="2" />
              <Path d="M205 155 Q212 160 220 155" fill="none" stroke="#4E342E" strokeWidth="2" />
              <Path d="M230 100 Q280 150 250 350" fill="none" stroke="#2C2C2C" strokeWidth="24" strokeLinecap="round" />
              <Circle cx="235" cy="100" r="9" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1" />
              <Path d="M165 110 Q200 80 235 110 L240 140 Q220 120 200 135 Q180 120 160 140 Z" fill="#2C2C2C" />
              <Path d="M165 120 L160 220 M235 120 L240 220" stroke="#2C2C2C" strokeWidth="11" strokeLinecap="round" />
            </G>
          </Svg>
        </Pressable>
      </Animated.View>

      {isExpanded && (
        <View style={styles.chatPanel}>
          <View style={styles.chatHeader}>
            <View style={styles.headerAvatar}>
              <Text style={styles.avatarEmoji}>🌸</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Sakura-chan</Text>
              <Text style={styles.headerSubtitle}>Your Focus Guide</Text>
            </View>
            <Pressable onPress={handleCloseChat} style={styles.closeBtn}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statValue}>{state.todayMinutes}m</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{state.streak}d</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>💭</Text>
              <Text style={styles.statValue}>{state.distractionCount}</Text>
            </View>
          </View>

          <ScrollView style={styles.messages} showsVerticalScrollIndicator={false}>
            {messages.map((msg) => (
              <View key={msg.id} style={[styles.messageRow, msg.isUser ? styles.userRow : styles.aiRow]}>
                {!msg.isUser && <View style={styles.msgAvatar}><Text style={styles.avatarEmoji}>🌸</Text></View>}
                <View style={[styles.bubble, msg.isUser ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.messageText, msg.isUser && styles.userText]}>{msg.text}</Text>
                </View>
              </View>
            ))}
            {isTyping && (
              <View style={[styles.messageRow, styles.aiRow]}>
                <View style={styles.msgAvatar}><Text style={styles.avatarEmoji}>🌸</Text></View>
                <View style={[styles.bubble, styles.aiBubble]}>
                  <Text style={styles.typingText}>...thinking...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Ask Sakura..."
              placeholderTextColor={Colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <Pressable style={styles.sendBtn} onPress={handleSend}>
              <Text style={styles.sendText}>➤</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  characterWrapper: {
    position: 'absolute',
    bottom: 110,
    right: 10,
    zIndex: 1000,
  },
  speechBubble: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 4,
    marginLeft: 30,
    borderWidth: 2,
    borderColor: '#283593',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  speechTail: {
    position: 'absolute',
    bottom: -12,
    left: 15,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#283593',
  },
  speechText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#283593',
  },
  chatPanel: {
    position: 'absolute',
    bottom: 280,
    right: 10,
    width: 300,
    height: 400,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 3,
    borderColor: '#283593',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: '#283593',
    gap: Spacing.sm,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFCDD2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: '#a0c0e0',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A237E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: Colors.white,
    lineHeight: 20,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.sm,
    backgroundColor: '#f0f4f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: {
    fontSize: 14,
  },
  statValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#283593',
  },
  messages: {
    flex: 1,
    padding: Spacing.sm,
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
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFCDD2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  bubble: {
    maxWidth: '70%',
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  userBubble: {
    backgroundColor: '#283593',
  },
  aiBubble: {
    backgroundColor: '#e8f0f8',
  },
  messageText: {
    fontSize: FontSize.sm,
    color: '#283593',
  },
  userText: {
    color: Colors.white,
  },
  typingText: {
    fontSize: FontSize.sm,
    color: '#888',
    fontStyle: 'italic',
  },
  inputArea: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: '#283593',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#283593',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    fontSize: 16,
    color: Colors.white,
  },
  focusTipBubble: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 4,
    marginLeft: 30,
    borderWidth: 2,
    borderColor: '#388E3C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    maxWidth: 180,
  },
  focusTipText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  focusTipTail: {
    position: 'absolute',
    bottom: -12,
    left: 15,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#388E3C',
  },
});
