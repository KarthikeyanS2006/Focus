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

  const strokeWidth = 12;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning && phase === 'focus') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { 
            toValue: 1.03, 
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
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, phase, pulseAnim]);

  const ringColor = phase === 'break' ? Colors.success : Colors.primary;
  const ringColorEnd = phase === 'break' ? Colors.neonGreen : Colors.secondary;

  const phaseLabel = phase === 'idle' ? '準備完了' : phase === 'focus' ? '深度集中' : '休憩時間';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View 
        style={[
          styles.glow, 
          { 
            width: size * 0.85, 
            height: size * 0.85, 
            borderRadius: size / 2,
            backgroundColor: phase === 'break' ? Colors.successMuted : Colors.primaryMuted,
          }
        ]} 
      />

      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={ringColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={ringColorEnd} stopOpacity="1" />
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
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.content}>
        <Text style={styles.phaseLabel}>{phaseLabel}</Text>
        <Text style={[styles.timeText, { color: ringColor }]}>
          {pad(minutes)}:{pad(seconds)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    opacity: 0.2,
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
    marginBottom: 4,
  },
  timeText: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    letterSpacing: -2,
  },
});
