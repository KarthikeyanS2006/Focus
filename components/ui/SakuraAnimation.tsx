// Powered by Sakura Focus - Japanese Anime Style
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  swayRange: number;
}

function Petal({ petal, onFall }: { petal: Petal; onFall: () => void }) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(petal.x)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const sway = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: petal.x + petal.swayRange,
          duration: petal.duration * 0.4,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: petal.x - petal.swayRange,
          duration: petal.duration * 0.4,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const fall = Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT + 50,
      duration: petal.duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const spin = Animated.loop(
      Animated.timing(rotation, {
        toValue: petal.rotation * Math.PI * 2,
        duration: petal.duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const fadeOut = Animated.timing(opacity, {
      toValue: 0,
      duration: 2000,
      delay: petal.duration - 3000,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    Animated.parallel([fall, sway, spin]).start(() => {
      fadeOut.start(() => onFall());
    });
  }, [translateY, translateX, rotation, opacity, petal, onFall]);

  const rotate = rotation.interpolate({
    inputRange: [0, Math.PI * 2],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.petal,
        {
          width: petal.size,
          height: petal.size,
          transform: [{ translateX }, { translateY }, { rotate }],
          opacity,
        },
      ]}
    >
      <View style={[styles.petalInner, { borderRadius: petal.size / 2 }]} />
    </Animated.View>
  );
}

interface SakuraAnimationProps {
  intensity?: 'light' | 'medium' | 'heavy';
  colors?: string[];
}

export function SakuraAnimation({ 
  intensity = 'medium', 
  colors = ['#FFB7C5', '#FFD6E0', '#FF8FA3', '#FFFFFF'] 
}: SakuraAnimationProps) {
  const petalCount = intensity === 'light' ? 8 : intensity === 'medium' ? 15 : 25;
  const [petals, setPetals] = React.useState<Petal[]>([]);
  const idCounter = useRef(0);

  const generatePetal = useMemo(() => (): Petal => ({
    id: idCounter.current++,
    x: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 3000,
    duration: 8000 + Math.random() * 6000,
    size: 8 + Math.random() * 12,
    rotation: 1 + Math.random() * 3,
    swayRange: 20 + Math.random() * 40,
  }), []);

  useEffect(() => {
    const initialPetals = Array.from({ length: petalCount }, generatePetal);
    setPetals(initialPetals);

    const interval = setInterval(() => {
      setPetals(prev => {
        if (prev.length >= petalCount * 2) return prev;
        return [...prev, generatePetal()];
      });
    }, 400);

    return () => clearInterval(interval);
  }, [petalCount, generatePetal]);

  const handlePetalFall = (id: number) => {
    setPetals(prev => prev.filter(p => p.id !== id));
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {petals.map(petal => (
        <Petal key={petal.id} petal={petal} onFall={() => handlePetalFall(petal.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  petal: {
    position: 'absolute',
    top: 0,
  },
  petalInner: {
    flex: 1,
    backgroundColor: '#FFB7C5',
    borderRadius: 50,
  },
});
