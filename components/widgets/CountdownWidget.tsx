// Countdown Widget - Shows real-time date, time, and seconds
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';

interface CountdownWidgetProps {
  showSeconds?: boolean;
  showDate?: boolean;
  variant?: 'default' | 'transparent' | 'samsung';
  size?: 'small' | 'medium' | 'large';
}

export function CountdownWidget({ 
  showSeconds = true, 
  showDate = true,
  variant = 'default',
  size = 'medium' 
}: CountdownWidgetProps) {
  const systemColorScheme = useColorScheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTransparent, setIsTransparent] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsTransparent(variant === 'transparent' || variant === 'samsung' || systemColorScheme === 'dark');
  }, [variant, systemColorScheme]);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return {
      hours: displayHours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      ampm,
    };
  };

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear(),
    };
  };

  const time = formatTime(currentTime);
  const date = formatDate(currentTime);

  const textColor = isTransparent ? 'rgba(255,255,255,0.95)' : Colors.textPrimary;
  const subtextColor = isTransparent ? 'rgba(255,255,255,0.6)' : Colors.textSecondary;
  const accentColor = isTransparent ? 'rgba(255,107,138,0.9)' : Colors.primary;

  const getTimeFontSize = () => {
    switch (size) {
      case 'small': return FontSize.xxl;
      case 'large': return FontSize.display;
      default: return FontSize.hero;
    }
  };

  const getSecondsFontSize = () => {
    switch (size) {
      case 'small': return FontSize.md;
      case 'large': return FontSize.xxl;
      default: return FontSize.xl;
    }
  };

  return (
    <View style={styles.container}>
      {showDate && (
        <View style={styles.dateRow}>
          <MaterialIcons name="event" size={14} color={subtextColor} />
          <Text style={[styles.dateText, { color: subtextColor }]}>
            {date.day}, {date.month} {date.date}, {date.year}
          </Text>
        </View>
      )}
      
      <View style={styles.timeContainer}>
        <Text style={[styles.timeMain, { color: textColor, fontSize: getTimeFontSize() }]}>
          {time.hours}:{time.minutes}
        </Text>
        <View style={styles.ampmSecondsContainer}>
          <Text style={[styles.ampm, { color: subtextColor }]}>{time.ampm}</Text>
          {showSeconds && (
            <View style={styles.secondsContainer}>
              <Text style={[styles.seconds, { color: accentColor, fontSize: getSecondsFontSize() }]}>
                :{time.seconds}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.appNameContainer}>
        <Text style={[styles.appName, { color: accentColor }]}>REGΛIN</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  dateText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  timeMain: {
    fontWeight: FontWeight.bold,
    letterSpacing: -2,
  },
  ampmSecondsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginLeft: Spacing.xs,
    paddingBottom: 4,
  },
  ampm: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginRight: Spacing.xs,
  },
  secondsContainer: {
    minWidth: 50,
  },
  seconds: {
    fontWeight: FontWeight.bold,
    letterSpacing: -1,
  },
  appNameContainer: {
    marginTop: Spacing.sm,
  },
  appName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 4,
  },
});
