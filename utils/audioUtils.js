/**
 * Audio utility functions for game sounds
 * These functions create and play audio tones using Web Audio API
 */

/**
 * Play a tone with specified parameters
 * @param {AudioContext} audioContext - The audio context to use
 * @param {boolean} audioEnabled - Whether audio is enabled
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in milliseconds
 * @param {string} type - Oscillator type ('sine', 'triangle', etc.)
 * @param {number} volume - Volume level (0-1)
 * @param {boolean} reverb - Whether to add reverb effect
 */
export const playTone = (audioContext, audioEnabled, frequency, duration = 200, type = 'sine', volume = 0.15, reverb = false) => {
  if (!audioEnabled || !audioContext) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    // Create a slight detune effect for mystical feel
    const detune = (Math.random() - 0.5) * 10; // ±5 cents
    const detunedFreq = frequency * Math.pow(2, detune / 1200);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(detunedFreq, audioContext.currentTime);
    oscillator.type = type;
    
    // Apply gentle lowpass filter for mystical darkness
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, audioContext.currentTime);
    filter.Q.setValueAtTime(0.5, audioContext.currentTime);
    
    // Fade in and out for smooth sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
    
    // Add reverb effect if requested
    if (reverb) {
      const delay = audioContext.createDelay();
      const feedback = audioContext.createGain();
      
      delay.delayTime.setValueAtTime(0.1, audioContext.currentTime);
      feedback.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      gainNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(audioContext.destination);
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.error('Error playing tone:', error);
  }
};

/**
 * Create audio sound functions that use the audio context
 * @param {AudioContext} audioContextRef - Ref to audio context
 * @param {boolean} audioEnabled - Whether audio is enabled
 * @returns {Object} Object containing all sound functions
 */
export const createAudioFunctions = (audioContextRef, audioEnabled) => {
  const playToneWithContext = (frequency, duration, type, volume, reverb) => {
    return playTone(audioContextRef?.current, audioEnabled, frequency, duration, type, volume, reverb);
  };

  // 1. Menu Interaction (hover/select) - Very short soft chime
  const playMenuClickSound = () => {
    // D#5 (~622 Hz) sine wave, 100ms, with gentle fade out
    playToneWithContext(622, 100, 'sine', 0.08, true);
  };

  // 2. Correct Guess - Soft two-note upward interval A4 → C5
  const playCorrectSound = () => {
    // A4 (440 Hz) → C5 (523 Hz), each 150ms, legato
    playToneWithContext(440, 150, 'triangle', 0.12, true);
    setTimeout(() => {
      playToneWithContext(523, 150, 'triangle', 0.12, true);
    }, 150);
  };

  // 3. Wrong Guess - Quick minor downward interval C5 → G#4
  const playIncorrectSound = () => {
    // C5 (523 Hz) → G#4 (415 Hz), ~150ms each, with soft dark filter
    playToneWithContext(523, 150, 'triangle', 0.1, true);
    setTimeout(() => {
      playToneWithContext(415, 150, 'triangle', 0.1, true);
    }, 150);
  };

  // 4. Losing All Hearts - Low gentle 3-note descending motif
  const playGameOverSound = () => {
    // A4 → F#4 → D4 (440 → 370 → 294 Hz), 250ms per note with reverb
    playToneWithContext(440, 250, 'sine', 0.15, true);
    setTimeout(() => {
      playToneWithContext(370, 250, 'sine', 0.15, true);
    }, 250);
    setTimeout(() => {
      playToneWithContext(294, 250, 'sine', 0.15, true);
    }, 500);
  };

  // 5. Finishing All Flags (Victory) - Soft arpeggiated upward minor 7 chord
  const playVictorySound = () => {
    // A4 → C5 → E5 → G5, each ~200ms with shimmering reverb
    const frequencies = [440, 523, 659, 784];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        playToneWithContext(freq, 200, 'triangle', 0.12, true);
      }, index * 200);
    });
  };

  const playMenuHoverSound = () => {
    // Subtle hover sound - even softer than click
    playToneWithContext(622, 50, 'sine', 0.04, true);
  };

  const playGameStartSound = () => {
    // Gentle ascending sequence for game start
    playToneWithContext(440, 150, 'triangle', 0.12, true);
    setTimeout(() => playToneWithContext(523, 150, 'triangle', 0.12, true), 150);
    setTimeout(() => playToneWithContext(659, 200, 'triangle', 0.12, true), 300);
  };

  const playTimeWarningSound = () => {
    // Gentle warning beep for low time
    playToneWithContext(523, 100, 'triangle', 0.1, true);
  };

  return {
    playMenuClickSound,
    playCorrectSound,
    playIncorrectSound,
    playGameOverSound,
    playVictorySound,
    playMenuHoverSound,
    playGameStartSound,
    playTimeWarningSound
  };
};
