// Powered by Sakura Focus - Japanese Anime Style
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface KatanaSlashProps {
  visible: boolean;
  onComplete?: () => void;
  color?: string;
  direction?: 'left' | 'right' | 'diagonal';
}

export function KatanaSlash({ 
  visible, 
  onComplete,
  color = '#FFFFFF',
  direction = 'diagonal'
}: KatanaSlashProps) {
  const slashAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      flashAnim.setValue(1);
      slashAnim.setValue(0);
      glowAnim.setValue(0);

      Animated.parallel([
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(slashAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete?.();
      });
    }
  }, [visible, flashAnim, slashAnim, glowAnim, onComplete]);

  if (!visible) return null;

  const translateX = slashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: direction === 'left' ? [SCREEN_WIDTH, -SCREEN_WIDTH] : [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const scaleX = slashAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.2, 1],
  });

  const opacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  const rotation = direction === 'diagonal' ? '-45deg' : direction === 'left' ? '0deg' : '0deg';

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.flash,
          {
            opacity: flashAnim,
            backgroundColor: color,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.glow,
          {
            opacity,
            backgroundColor: color,
            transform: [{ translateX }, { rotate: rotation }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.slash,
          {
            opacity: slashAnim,
            transform: [
              { translateX },
              { rotate: rotation },
              { scaleX },
            ],
            borderColor: color,
          },
        ]}
      />
    </View>
  );
}

interface PulseGlowProps {
  color?: string;
  size?: number;
  intensity?: number;
}

export function PulseGlow({ 
  color = '#FF6B8A', 
  size = 200, 
  intensity = 1 
}: PulseGlowProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityValue, {
            toValue: 0.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [scale, opacityValue]);

  const animatedOpacity = opacityValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, intensity],
  });

  return (
    <Animated.View
      style={[
        styles.pulseGlow,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale }],
          opacity: animatedOpacity,
        },
      ]}
    />
  );
}

interface EnergyOrbProps {
  color?: string;
  size?: number;
  isActive?: boolean;
}

export function EnergyOrb({ 
  color = '#FFD700', 
  size = 60, 
  isActive = true 
}: EnergyOrbProps) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const glowOpacityValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.8,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(rotation, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(glowOpacityValue, {
              toValue: 0.6,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacityValue, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
  }, [isActive, scale, rotation, glowOpacityValue]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.energyOrb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale }, { rotate }],
          opacity: glowOpacityValue,
        },
      ]}
    >
      <View style={[styles.energyCore, { 
        width: size * 0.4, 
        height: size * 0.4, 
        borderRadius: size * 0.2,
        backgroundColor: '#FFFFFF',
      }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
  },
  glow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 100,
  },
  slash: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: 4,
    borderWidth: 2,
    borderRadius: 2,
  },
  pulseGlow: {
    position: 'absolute',
  },
  energyOrb: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  energyCore: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
});
