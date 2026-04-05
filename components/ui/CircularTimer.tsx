// Powered by Sakura Focus - Japanese Anime Style
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

interface Props {
  progress: number;
  secondsLeft: number;
  phase: 'focus' | 'break' | 'idle';
  isRunning: boolean;
  size?: number;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function CircularTimer({ progress, secondsLeft, phase, isRunning, size = 260 }: Props) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const innerGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRunning && phase === 'focus') {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, { 
              toValue: 1.04, 
              duration: 1500, 
              easing: Easing.inOut(Easing.ease), 
              useNativeDriver: true 
            }),
            Animated.timing(pulseAnim, { 
              toValue: 1, 
              duration: 1500, 
              easing: Easing.inOut(Easing.ease), 
              useNativeDriver: true 
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 0.6,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.3,
              duration: 1200,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.timing(innerGlowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ),
      ]).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      glowAnim.stopAnimation();
      glowAnim.setValue(0.3);
      innerGlowAnim.stopAnimation();
      innerGlowAnim.setValue(0);
    }
  }, [isRunning, phase, pulseAnim, glowAnim, innerGlowAnim]);

  const ringColor = phase === 'break' ? Colors.success : Colors.primary;
  const ringColorEnd = phase === 'break' ? Colors.neonGreen : Colors.secondary;
  const bgColor = phase === 'break' ? Colors.successMuted : Colors.primaryMuted;

  const phaseLabel = phase === 'idle' ? '準備完了' : phase === 'focus' ? '深度集中' : '休憩時間';
  const phaseLabelSub = phase === 'idle' ? 'READY' : phase === 'focus' ? 'DEEP FOCUS' : 'BREAK';

  const rotate = innerGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size, 
          transform: [{ scale: pulseAnim }] 
        }
      ]}
    >
      <View 
        style={[
          styles.glow, 
          { 
            width: size * 0.9, 
            height: size * 0.9, 
            borderRadius: size, 
            backgroundColor: bgColor,
            opacity: glowAnim,
          }
        ]} 
      />
      
      {isRunning && phase === 'focus' && (
        <Animated.View
          style={[
            styles.innerGlow,
            {
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: size * 0.35,
              transform: [{ rotate }],
            },
          ]}
        />
      )}

      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={ringColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={ringColorEnd} stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={ringColor} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={ringColorEnd} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.surfaceAlt}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 4}
          stroke="url(#glowGrad)"
          strokeWidth={strokeWidth + 8}
          fill="none"
          opacity={isRunning ? 0.3 : 0}
        />
        
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.content}>
        <Text style={styles.phaseLabel}>{phaseLabel}</Text>
        <Text style={styles.phaseLabelSub}>{phaseLabelSub}</Text>
        <Text style={[styles.timeText, { color: ringColor }]}>
          {pad(minutes)}:{pad(seconds)}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  innerGlow: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.primary + '20',
    borderStyle: 'dashed',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  phaseLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.sakura,
    letterSpacing: 2,
    marginBottom: 2,
  },
  phaseLabelSub: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
    letterSpacing: 4,
    marginBottom: 8,
  },
  timeText: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    letterSpacing: -2,
    includeFontPadding: false,
  },
});
