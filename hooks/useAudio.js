/**
 * useAudio Hook
 * Manages audio context and provides sound functions
 */

import { useEffect } from "react";
import { createAudioFunctions } from "../utils/audioUtils";

export const useAudio = (audioContextRef, audioEnabled, setAudioEnabled) => {
  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      try {
        // Create audio context only when user interacts
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        setAudioEnabled(false);
      }
    };

    // Initialize audio on first user interaction
    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [audioContextRef, setAudioEnabled]);

  // Create audio functions using the audio context
  const audioFunctions = createAudioFunctions(audioContextRef, audioEnabled);

  return {
    ...audioFunctions,
    audioContextRef,
    audioEnabled
  };
};
