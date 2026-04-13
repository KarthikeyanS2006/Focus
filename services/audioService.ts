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

const NETWORK_SOUNDS: Record<AmbientType, string> = {
  none: '',
  rain: 'https://www.soundjay.com/nature/sounds/rain-01.mp3',
  forest: 'https://www.soundjay.com/nature/sounds/forest-1.mp3',
  ocean: 'https://www.soundjay.com/nature/sounds/ocean-waves-1.mp3',
  meditation: 'https://www.soundjay.com/nature/sounds/wind-1.mp3',
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
      console.log('Audio permission not granted, requesting...');
      const granted = await Audio.requestPermissionsAsync();
      if (granted.status !== 'granted') {
        console.log('Audio permission denied');
        return false;
      }
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    const url = NETWORK_SOUNDS[type];
    if (!url) {
      currentSettings.type = 'none';
      return true;
    }

    console.log(`Playing ambient sound: ${type} from ${url}`);

    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { 
        isLooping: true,
        shouldPlay: true,
        volume: 0.6,
      }
    );

    ambientSound = sound;
    console.log(`Ambient sound ${type} started successfully`);
    return true;
  } catch (error) {
    console.log('Failed to play ambient sound:', error);
    currentSettings.type = 'none';
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
    ambientSound = null;
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

export async function playFocusCompleteSound(): Promise<boolean> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://www.soundjay.com/ui/sounds/ui-button-01.mp3' },
      { shouldPlay: true, volume: 0.8 }
    );
    
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
    
    return true;
  } catch (error) {
    console.log('Error playing focus complete sound:', error);
    return false;
  }
}

export async function playBreakCompleteSound(): Promise<boolean> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://www.soundjay.com/ui/sounds/ui-button-02.mp3' },
      { shouldPlay: true, volume: 0.8 }
    );
    
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
    
    return true;
  } catch (error) {
    console.log('Error playing break complete sound:', error);
    return false;
  }
}

export async function playTickSound(): Promise<boolean> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://www.soundjay.com/buttons/sounds/button-09.mp3' },
      { shouldPlay: true, volume: 0.3 }
    );
    
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
    
    return true;
  } catch {
    return false;
  }
}

// Legacy exports for compatibility
export async function playFocusComplete(): Promise<void> {
  await playFocusCompleteSound();
}

export async function playBreakComplete(): Promise<void> {
  await playBreakCompleteSound();
}

export async function playTick(): Promise<void> {
  await playTickSound();
}

export async function setAmbientVolume(volume: number): Promise<void> {
  if (ambientSound) {
    await ambientSound.setVolumeAsync(volume);
  }
}