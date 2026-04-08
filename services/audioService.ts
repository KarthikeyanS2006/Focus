// Powered by OnSpace.AI
import { Audio } from 'expo-av';

// We generate tones programmatically using base64-encoded minimal WAV files.
// Each WAV is a short sine-wave burst at a specific frequency.

// 440Hz (A4) – focus complete bell: warm, clear tone
const FOCUS_BELL_B64 =
  'UklGRiQEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAEAAA' +
  'AAAAAAP//AgD9//z/AgAFAAAA/f/9/wMACAAAAPv/+v8EAAQA' +
  'AP3/+f8FAAcAAAAA//3//f8EAAoA//8A/wIA//8BAAoABAAAAP7/AQD+/wQACAAF' +
  'AP//AAD8/wgACAAFAP3/AQD9/wYACAAEAAAA/v/9/wgABgACAAAA/v/8/wcABAAC' +
  'AAAA/P////8HAAMAAQAAAP3/AAACAAMAAAAAAP//AAACAAMAAAAAAP//AAAAAAMAAQAA';

let soundFocusBell: Audio.Sound | null = null;
let soundBreakBell: Audio.Sound | null = null;
let soundTick: Audio.Sound | null = null;
let soundAmbient: Audio.Sound | null = null;
let ambientLoopInterval: ReturnType<typeof setInterval> | null = null;

async function ensureAudioMode() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch {}
}

// Generate a simple beep WAV at a given frequency (Hz) and duration (ms)
function generateBeepWav(frequencyHz: number, durationMs: number, amplitude = 0.6): string {
  const sampleRate = 22050;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  // Samples — sine wave with envelope
  const attackSamples = Math.floor(sampleRate * 0.01);
  const releaseSamples = Math.floor(sampleRate * 0.08);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let env = amplitude;
    if (i < attackSamples) env *= i / attackSamples;
    else if (i > numSamples - releaseSamples) env *= (numSamples - i) / releaseSamples;
    const sample = Math.round(env * 32767 * Math.sin(2 * Math.PI * frequencyHz * t));
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample)), true);
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  if (typeof btoa !== 'undefined') return btoa(binary);
  return Buffer.from(bytes).toString('base64');
}

async function createSound(
  frequencyHz: number,
  durationMs: number,
  amplitude = 0.5
): Promise<Audio.Sound | null> {
  try {
    await ensureAudioMode();
    const b64 = generateBeepWav(frequencyHz, durationMs, amplitude);
    const uri = `data:audio/wav;base64,${b64}`;
    const { sound } = await Audio.Sound.createAsync({ uri }, { volume: 1.0 });
    return sound;
  } catch {
    return null;
  }
}

// Pre-load all sounds
export async function preloadSounds(): Promise<void> {
  try {
    // Focus complete: two-tone bell (523Hz = C5, warm and satisfying)
    soundFocusBell = await createSound(523, 600, 0.55);
    // Break complete: higher, lighter tone (659Hz = E5)
    soundBreakBell = await createSound(880, 350, 0.4);
    // Tick: very short, quiet click (1200Hz)
    soundTick = await createSound(1200, 60, 0.2);
  } catch {}
}

export async function playFocusComplete(): Promise<void> {
  try {
    if (!soundFocusBell) soundFocusBell = await createSound(523, 600, 0.55);
    await soundFocusBell?.replayAsync();
    // Second bell note after a short gap for a classic "ding dong" feel
    setTimeout(async () => {
      const second = await createSound(392, 500, 0.45); // G4
      await second?.playAsync();
      setTimeout(() => second?.unloadAsync(), 1000);
    }, 350);
  } catch {}
}

export async function playBreakComplete(): Promise<void> {
  try {
    if (!soundBreakBell) soundBreakBell = await createSound(880, 350, 0.4);
    await soundBreakBell?.replayAsync();
  } catch {}
}

export async function playTick(): Promise<void> {
  try {
    if (!soundTick) soundTick = await createSound(1200, 60, 0.2);
    await soundTick?.replayAsync();
  } catch {}
}

export async function unloadSounds(): Promise<void> {
  try {
    await soundFocusBell?.unloadAsync();
    await soundBreakBell?.unloadAsync();
    await soundTick?.unloadAsync();
    await soundAmbient?.unloadAsync();
    soundFocusBell = null;
    soundBreakBell = null;
    soundTick = null;
    soundAmbient = null;
    if (ambientLoopInterval) {
      clearInterval(ambientLoopInterval);
      ambientLoopInterval = null;
    }
  } catch {}
}

// Generate peaceful ambient sound (soft sine wave with slow modulation)
function generateAmbientWav(frequencyHz: number, durationMs: number, amplitude = 0.15): string {
  const sampleRate = 22050;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const modulation = 0.3 + 0.7 * Math.sin(2 * Math.PI * 0.1 * t);
    const envelope = Math.sin(Math.PI * t / (durationMs / 1000)) * modulation;
    const harmonic = 0.3 * Math.sin(4 * Math.PI * frequencyHz * t / 22050);
    const sample = Math.round(amplitude * envelope * 32767 * (Math.sin(2 * Math.PI * frequencyHz * t) + harmonic));
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample)), true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  if (typeof btoa !== 'undefined') return btoa(binary);
  return Buffer.from(bytes).toString('base64');
}

// Ambient sound types
export type AmbientType = 'none' | 'rain' | 'forest' | 'ocean' | 'meditation';

const AMBIENT_FREQUENCIES: Record<AmbientType, number> = {
  none: 0,
  rain: 200,
  forest: 300,
  ocean: 150,
  meditation: 396,
};

export async function playAmbientSound(type: AmbientType): Promise<void> {
  try {
    if (ambientLoopInterval) {
      clearInterval(ambientLoopInterval);
      ambientLoopInterval = null;
    }
    if (type === 'none') {
      await soundAmbient?.stopAsync();
      return;
    }

    await ensureAudioMode();
    const freq = AMBIENT_FREQUENCIES[type];
    const b64 = generateAmbientWav(freq, 8000, 0.08);
    const uri = `data:audio/wav;base64,${b64}`;
    
    if (!soundAmbient) {
      const { sound } = await Audio.Sound.createAsync({ uri }, { 
        volume: 0.3,
        isLooping: true,
      });
      soundAmbient = sound;
    } else {
      await soundAmbient.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({ uri }, { 
        volume: 0.3,
        isLooping: true,
      });
      soundAmbient = sound;
    }
    await soundAmbient.playAsync();
  } catch {}
}

export async function stopAmbientSound(): Promise<void> {
  try {
    if (ambientLoopInterval) {
      clearInterval(ambientLoopInterval);
      ambientLoopInterval = null;
    }
    await soundAmbient?.stopAsync();
    await soundAmbient?.unloadAsync();
    soundAmbient = null;
  } catch {}
}

export async function setAmbientVolume(volume: number): Promise<void> {
  try {
    if (soundAmbient) {
      await soundAmbient.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    }
  } catch {}
}
