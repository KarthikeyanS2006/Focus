// Japanese Anime Inspired Theme - Sakura Focus
export const Colors = {
  bg: '#0a0a0a',
  bgAlt: '#0f0f12',
  surface: '#151518',
  surfaceAlt: '#1a1a1f',
  surfaceElevated: '#202025',
  border: '#2a2a30',
  
  primary: '#FF6B8A',
  primaryLight: '#FFB3C1',
  primaryDim: '#CC5569',
  primaryMuted: 'rgba(255,107,138,0.15)',
  
  secondary: '#C44569',
  secondaryLight: '#FF8FA3',
  secondaryMuted: 'rgba(196,69,105,0.15)',
  
  sakura: '#FFB7C5',
  sakuraLight: '#FFD6E0',
  sakuraDark: '#E8939F',
  sakuraMuted: 'rgba(255,183,197,0.15)',
  
  crimson: '#DC143C',
  crimsonMuted: 'rgba(220,20,60,0.15)',
  
  gold: '#FFD700',
  goldLight: '#FFE55C',
  goldDim: '#B8860B',
  goldMuted: 'rgba(255,215,0,0.15)',
  
  ink: '#1a1a2e',
  inkLight: '#2d2d44',
  
  neonBlue: '#00D9FF',
  neonPurple: '#A855F7',
  neonGreen: '#22FF88',
  
  danger: '#FF4757',
  dangerMuted: 'rgba(255,71,87,0.15)',
  dangerLight: '#FF6B7A',
  
  success: '#00E676',
  successMuted: 'rgba(0,230,118,0.15)',
  
  warning: '#FFA726',
  warningMuted: 'rgba(255,167,38,0.15)',
  
  textPrimary: '#FFFFFF',
  textSecondary: '#B8B8C0',
  textMuted: '#6B6B75',
  textAccent: '#FFD700',
  
  white: '#FFFFFF',
  black: '#000000',
  
  gradient1: '#FF6B8A',
  gradient2: '#C44569',
  gradient3: '#1a1a2e',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const FontSize = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 64,
  display: 80,
};

export const FontWeight: Record<string, '400'|'500'|'600'|'700'> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const Shadows = {
  small: {
    shadowColor: '#FF6B8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#FF6B8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#FF6B8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};
