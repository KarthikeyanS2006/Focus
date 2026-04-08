// Powered by OnSpace.AI - Using expo-audio and haptics for feedback
import * as Haptics from 'expo-haptics';
import { Audio, AVPlaybackSource } from 'expo-av';

// Ambient sound types
export type AmbientType = 'none' | 'rain' | 'forest' | 'ocean' | 'meditation';

let ambientSound: Audio.Sound | null = null;
let ambientType: AmbientType = 'none';

// Get bundled audio source for ambient sounds
function getAmbientSource(type: AmbientType): AVPlaybackSource | null {
  // For Expo Go, we'll use haptics as fallback
  // In production build, these would be actual audio files
  return null;
}

// Play ambient sound with haptic feedback
export async function playAmbientSound(type: AmbientType): Promise<void> {
  try {
    await stopAmbientSound();
    ambientType = type;
    
    if (type === 'none') {
      return;
    }

    // Request audio permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Audio permission not granted');
      return;
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    // Try to play haptic feedback for now
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    console.log(`Ambient sound: ${type} selected`);
    
  } catch (error) {
    console.log('Ambient sound setup:', error);
  }
}

// Play focus complete notification
export async function playFocusComplete(): Promise<void> {
  try {
    // Strong haptic for focus complete
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Second vibration after delay
    setTimeout(async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 400);
    
  } catch (error) {
    console.log('Haptics not available');
  }
}

// Play tick sound - light impact
export async function playTick(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.log('Haptics not available');
  }
}

// Play break complete notification
export async function playBreakComplete(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.log('Haptics not available');
  }
}

// Stop ambient sound
export async function stopAmbientSound(): Promise<void> {
  try {
    if (ambientSound) {
      await ambientSound.stopAsync();
      await ambientSound.unloadAsync();
      ambientSound = null;
    }
    ambientType = 'none';
  } catch (error) {
    console.log('Error stopping ambient:', error);
  }
}

// Set volume for ambient sound
export async function setAmbientVolume(volume: number): Promise<void> {
  try {
    if (ambientSound) {
      await ambientSound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    }
  } catch (error) {
    console.log('Volume not available');
  }
}

// Preload sounds - setup audio mode
export async function preloadSounds(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (error) {
    console.log('Audio setup error:', error);
  }
}

// Unload all sounds
export async function unloadSounds(): Promise<void> {
  await stopAmbientSound();
}

// Get current ambient type
export function getCurrentAmbientType(): AmbientType {
  return ambientType;
}

// Check if ambient is playing
export function isAmbientPlaying(): boolean {
  return ambientType !== 'none';
}
