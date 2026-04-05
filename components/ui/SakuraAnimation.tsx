// Powered by Sakura Focus - Real Cherry Blossom
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  swayRange: number;
  color: string;
}

const SAKURA_COLORS = ['#FFB7C5', '#FF9AAF', '#FFCDD8', '#F8BBD9', '#FFEBEE', '#FFFFFF', '#FCE4EC'];

function PetalItem({ petal, onFall }: { petal: Petal; onFall: (id: number) => void }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const translateX = useRef(new Animated.Value(petal.x)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const fall = Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT + 100,
      duration: petal.duration,
      useNativeDriver: true,
    });

    const sway1 = Animated.timing(translateX, {
      toValue: petal.x + petal.swayRange,
      duration: petal.duration * 0.3,
      useNativeDriver: true,
    });

    const sway2 = Animated.timing(translateX, {
      toValue: petal.x - petal.swayRange,
      duration: petal.duration * 0.3,
      useNativeDriver: true,
    });

    const spin = Animated.timing(rotation, {
      toValue: petal.rotation * 360,
      duration: petal.duration,
      useNativeDriver: true,
    });

    Animated.parallel([fall, Animated.sequence([sway1, sway2]), spin]).start(() => {
      if (mountedRef.current) {
        setTimeout(() => onFall(petal.id), 0);
      }
    });

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    translateX.setValue(petal.x);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petal.x]);

  const rotate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.petal,
        {
          width: petal.size,
          height: petal.size,
          backgroundColor: petal.color,
          borderRadius: petal.size / 2,
          transform: [{ translateX }, { translateY }, { rotate }],
        },
      ]}
    />
  );
}

interface SakuraProps {
  intensity?: 'light' | 'medium' | 'heavy';
}

export function SakuraAnimation({ intensity = 'medium' }: SakuraProps) {
  const petalCount = intensity === 'light' ? 15 : intensity === 'medium' ? 30 : 50;
  const [petals, setPetals] = useState<{ id: number; x: number; delay: number; duration: number; size: number; rotation: number; swayRange: number; color: string }[]>([]);
  const idCounter = useRef(0);

  const handleFall = useCallback((id: number) => {
    setPetals(prev => prev.filter(p => p.id !== id));
  }, []);

  useEffect(() => {
    const initial = Array.from({ length: petalCount }, () => ({
      id: idCounter.current++,
      x: Math.random() * SCREEN_WIDTH,
      delay: Math.random() * 3000,
      duration: 8000 + Math.random() * 6000,
      size: 8 + Math.random() * 12,
      rotation: 2 + Math.random() * 4,
      swayRange: 20 + Math.random() * 40,
      color: SAKURA_COLORS[Math.floor(Math.random() * SAKURA_COLORS.length)],
    }));
    setPetals(initial);

    const interval = setInterval(() => {
      setPetals(prev => {
        if (prev.length >= petalCount * 2) return prev;
        return [...prev, {
          id: idCounter.current++,
          x: Math.random() * SCREEN_WIDTH,
          delay: 0,
          duration: 8000 + Math.random() * 6000,
          size: 8 + Math.random() * 12,
          rotation: 2 + Math.random() * 4,
          swayRange: 20 + Math.random() * 40,
          color: SAKURA_COLORS[Math.floor(Math.random() * SAKURA_COLORS.length)],
        }];
      });
    }, 400);

    return () => clearInterval(interval);
  }, [petalCount]);

  return (
    <View style={styles.container} pointerEvents="none">
      {petals.map(petal => (
        <PetalItem key={petal.id} petal={petal} onFall={handleFall} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  petal: {
    position: 'absolute',
    top: 0,
  },
});
