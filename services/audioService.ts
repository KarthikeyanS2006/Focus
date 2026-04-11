// Ambient sound service with seamless looping - using expo-av
import { Audio, AVPlaybackStatus } from 'expo-av';

export type AmbientType = 'none' | 'rain' | 'forest' | 'ocean' | 'meditation';

export interface AmbientSettings {
  type: AmbientType;
  loopDuration: number;
}

let ambientSound: Audio.Sound | null = null;
let currentSettings: AmbientSettings = { type: 'none', loopDuration: 10 };

// Free ambient sound URLs (direct MP3 links)
const AMBIENT_URLS: Record<AmbientType, string | null> = {
  none: null,
  rain: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_19c53df090.mp3',
  forest: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_115b9b6dcb.mp3',
  ocean: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_ea9ad53c97.mp3',
  meditation: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_dc39bde815.mp3',
};

const AMBIENT_INFO: Record<AmbientType, { name: string; icon: string }> = {
  none: { name: 'No Sound', icon: 'volume-off' },
  rain: { name: 'Rain', icon: 'water-drop' },
  forest: { name: 'Forest', icon: 'forest' },
  ocean: { name: 'Ocean', icon: 'waves' },
  meditation: { name: 'Meditation', icon: 'self-improvement' },
};

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

    const url = AMBIENT_URLS[type];
    if (!url) return false;

    console.log(`Playing ${type} for ${currentSettings.loopDuration} minutes...`);

    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { 
        isLooping: false,
        shouldPlay: true,
        volume: 0.7,
      }
    );

    ambientSound = sound;

    sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.replayAsync().catch(() => {});
      }
    });

    return true;
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
