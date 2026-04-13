// Ambient sound service - works in Expo Go
import { Audio } from 'expo-av';

export type AmbientType = 'none' | 'rain' | 'forest' | 'ocean' | 'meditation';

export interface AmbientSettings {
  type: AmbientType;
  loopDuration: number;
}

let ambientSound: Audio.Sound | null = null;
let currentSettings: AmbientSettings = { type: 'none', loopDuration: 10 };

const AMBIENT_INFO: Record<AmbientType, { name: string; icon: string }> = {
  none: { name: 'No Sound', icon: 'volume-off' },
  rain: { name: 'Rain', icon: 'water-drop' },
  forest: { name: 'Forest', icon: 'forest' },
  ocean: { name: 'Ocean', icon: 'waves' },
  meditation: { name: 'Meditation', icon: 'self-improvement' },
};

const NETWORK_FALLBACK_URLS: Record<AmbientType, string | null> = {
  none: null,
  rain: 'https://cdn.pixabay.com/audio/2022/05/16/audio_19c53df090.mp3',
  forest: 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b6dcb.mp3',
  ocean: 'https://cdn.pixabay.com/audio/2022/02/07/audio_ea9ad53c97.mp3',
  meditation: 'https://cdn.pixabay.com/audio/2021/08/04/audio_dc39bde815.mp3',
};

async function tryPlayWithLocalFile(soundFile: any, type: AmbientType): Promise<boolean> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      soundFile,
      { isLooping: true, shouldPlay: true, volume: 0.5 }
    );
    ambientSound = sound;
    console.log(`Playing ${type} (local file)`);
    return true;
  } catch {
    return false;
  }
}

async function tryPlayWithNetwork(type: AmbientType): Promise<boolean> {
  const url = NETWORK_FALLBACK_URLS[type];
  if (!url) return false;
  
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { isLooping: true, shouldPlay: true, volume: 0.5 }
    );
    ambientSound = sound;
    console.log(`Playing ${type} (network fallback)`);
    return true;
  } catch {
    return false;
  }
}

export async function playAmbientSound(type: AmbientType, durationMinutes?: number): Promise<boolean> {
  try {
    await stopAmbientSound();
    
    if (type === 'none') {
      currentSettings.type = 'none';
      return true;
    }

    currentSettings.type = type;
    if (durationMinutes) {
      currentSettings.loopDuration = durationMinutes;
    }

    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Audio permission not granted');
      return false;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    const localSoundFiles: Record<AmbientType, any> = {
      none: null,
      rain: require('../../assets/sounds/rain.mp3'),
      forest: require('../../assets/sounds/forest.mp3'),
      ocean: require('../../assets/sounds/ocean.mp3'),
      meditation: require('../../assets/sounds/meditation.mp3'),
    };

    const localFile = localSoundFiles[type];
    
    let success = false;
    if (localFile) {
      success = await tryPlayWithLocalFile(localFile, type);
    }
    
    if (!success) {
      console.log('Local file not found, trying network...');
      success = await tryPlayWithNetwork(type);
    }

    if (!success) {
      console.log('All playback methods failed for:', type);
    }
    
    return success;
  } catch (error) {
    console.log('Failed to play ambient sound:', error);
    return false;
  }
}

export async function stopAmbientSound(): Promise<void> {
  try {
    if (ambientSound) {
      await ambientSound.stopAsync();
      await ambientSound.unloadAsync();
      ambientSound = null;
    }
  } catch (error) {
    console.log('Error stopping ambient:', error);
  }
}

export async function setLoopDuration(minutes: number): Promise<void> {
  currentSettings.loopDuration = minutes;
  if (currentSettings.type !== 'none' && ambientSound) {
    const currentType = currentSettings.type;
    await stopAmbientSound();
    await playAmbientSound(currentType, minutes);
  }
}

export function getCurrentAmbientType(): AmbientType {
  return currentSettings.type;
}

export function isAmbientPlaying(): boolean {
  return ambientSound !== null;
}

export async function preloadSounds(): Promise<void> {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
  });
}

export async function unloadSounds(): Promise<void> {
  await stopAmbientSound();
}

export function getAmbientInfo(type: AmbientType) {
  return AMBIENT_INFO[type];
}

export function getAllAmbientTypes(): AmbientType[] {
  return ['none', 'rain', 'forest', 'ocean', 'meditation'];
}

export const LOOP_DURATIONS = [10, 20, 30, 60];

// Legacy exports for compatibility
export async function playFocusComplete(): Promise<void> {}
export async function playBreakComplete(): Promise<void> {}
export async function playTick(): Promise<void> {}
export async function setAmbientVolume(volume: number): Promise<void> {}