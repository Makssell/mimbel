/**
 * GameScreen Component
 * Displays the active game UI with score, timer, health, flag/name, and options
 */

import { useEffect, useState, useRef } from "react";
import sharedStyles from "../styles/shared.module.css";
import gameScreenStyles from "../styles/gameScreen.module.css";

export default function GameScreen({
  // Game state
  score,
  scoreAnimation,
  timeAttackMode,
  timeRemaining,
  health,
  infiniteMode,
  regionalInfiniteMode,
  currentFlag,
  flagTransitioning,
  isFlagLoading,
  lastFlagId,
  gameType,
  regionalGameType,
  gameMode,
  typingMode,
  regionalTypingMode,
  flashMode,
  regionalFlashMode,
  options,
  flagOptions,
  optionsTransitioning,
  typedAnswer,
  setTypedAnswer,
  typingInputStyle,
  buttonsDisabled,
  buttonStyles,
  message,
  messageTransitioning,
  // Refs
  typingInputRef,
  imageCache,
  // Handlers
  handleFlagLoad,
  handleFlagError,
  checkAnswer,
  endInfiniteMode,
  playMenuClickSound,
  // View mode
  isMinimized,
  setIsMinimized
}) {
  // Flash mode: hide flag after 0.5 seconds
  const [isFlagHidden, setIsFlagHidden] = useState(false);
  const flashTimeoutRef = useRef(null);
  const currentFlagIdRef = useRef(null);
  
  // Log flash mode props when they change
  useEffect(() => {
    console.log('⚡ Flash Mode Props:', {
      gameMode,
      gameType,
      regionalGameType,
      flashMode,
      regionalFlashMode,
      currentFlagId: currentFlag?.id,
      isFlagLoading,
      isFlagHidden
    });
  }, [flashMode, regionalFlashMode, gameMode, gameType, regionalGameType]);
  
  // Main flash mode effect - triggers when currentFlag.id changes (new question)
  useEffect(() => {
    // Check if flash mode is enabled for current game type
    const isFlashModeEnabled = (gameMode === "standard" && flashMode && gameType === "flag-to-country") ||
                               (gameMode === "regional" && regionalFlashMode && regionalGameType === "flag-to-region");
    
    // Detect when a new flag/question appears by tracking currentFlag.id
    const currentFlagId = currentFlag?.id;
    const isNewFlag = currentFlagId && currentFlagId !== currentFlagIdRef.current;
    
    console.log('⚡ Flash Mode Check:', {
      isFlashModeEnabled,
      currentFlagId,
      previousFlagId: currentFlagIdRef.current,
      isNewFlag,
      isFlagLoading,
      isFlagHidden,
      gameMode,
      gameType,
      regionalGameType,
      flashMode,
      regionalFlashMode
    });
    
    // When a new flag/question appears, reset visibility and start flash timer
    if (isNewFlag && currentFlag) {
      console.log('🔄 NEW QUESTION DETECTED! Resetting flash mode for new flag:', {
        currentFlagId: currentFlag.id,
        previousFlagId: currentFlagIdRef.current,
        isFlashModeEnabled
      });
      
      // Reset flag visibility for new question
      setIsFlagHidden(false);
      currentFlagIdRef.current = currentFlagId;
      
      // Clear any existing timeout
      if (flashTimeoutRef.current) {
        console.log('🧹 Clearing existing flash timeout');
        clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = null;
      }
      
      // Start flash timer if flash mode is enabled
      if (isFlashModeEnabled) {
        const startFlashTimer = () => {
          console.log('⚡ Flash mode ACTIVE - Setting timeout to hide flag in 500ms');
          flashTimeoutRef.current = setTimeout(() => {
            console.log('⚡ Flash timeout FIRED - Hiding flag now!');
            setIsFlagHidden(true);
            flashTimeoutRef.current = null;
          }, 500);
        };
        
        // If flag is already loaded, start timer immediately
        // Otherwise, wait for it to load (handled in next useEffect)
        if (!isFlagLoading) {
          startFlashTimer();
        } else {
          console.log('⏳ Flag still loading, will start timer when load completes');
        }
      } else {
        console.log('❌ Flash mode NOT enabled for this game type');
      }
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = null;
      }
    };
  }, [currentFlag?.id, isFlagLoading, flashMode, regionalFlashMode, gameMode, gameType, regionalGameType]);
  
  // Start flash timer when flag finishes loading (if it was loading when new flag appeared)
  useEffect(() => {
    const isFlashModeEnabled = (gameMode === "standard" && flashMode && gameType === "flag-to-country") ||
                               (gameMode === "regional" && regionalFlashMode && regionalGameType === "flag-to-region");
    
    // Only start timer if: flash mode enabled, flag exists, not loading, not hidden, timer not already started
    if (isFlashModeEnabled && currentFlag && !isFlagLoading && !isFlagHidden && !flashTimeoutRef.current) {
      console.log('⚡ Flag finished loading - Starting flash timer now', {
        flagId: currentFlag.id,
        isFlashModeEnabled,
        isFlagHidden
      });
      flashTimeoutRef.current = setTimeout(() => {
        console.log('⚡ Flash timeout FIRED (from load) - Hiding flag now!');
        setIsFlagHidden(true);
        flashTimeoutRef.current = null;
      }, 500);
    }
  }, [isFlagLoading, currentFlag, isFlagHidden, flashMode, regionalFlashMode, gameMode, gameType, regionalGameType]);

  // Prevent scrolling within game area only (not globally)
  // This allows scrolling on StartScreen and other screens
  useEffect(() => {
    const gameWrapper = document.querySelector(`.${gameScreenStyles.gameWrapper}`);
    
    if (!gameWrapper) return;
    
    // Prevent touch scrolling only within the game wrapper
    const preventTouchMove = (e) => {
      // Allow touch events on interactive elements (buttons, inputs, etc.)
      const target = e.target;
      const isInteractive = target.tagName === 'BUTTON' || 
                           target.tagName === 'INPUT' || 
                           target.tagName === 'TEXTAREA' ||
                           target.isContentEditable ||
                           target.closest('button') ||
                           target.closest('input') ||
                           target.closest('textarea');
      
      // Only prevent default if the touch is within the game wrapper and not on interactive elements
      // This prevents scrolling within the game while still allowing button clicks and input interactions
      if (!isInteractive && gameWrapper.contains(target)) {
        e.preventDefault();
      }
    };
    
    // Add touch event listener to prevent scrolling within game area
    // Using passive: false allows us to call preventDefault()
    gameWrapper.addEventListener('touchmove', preventTouchMove, { passive: false });
    
    // Handle viewport height changes on mobile when keyboard appears/disappears
    const handleResize = () => {
      // On mobile, adjust viewport height when keyboard appears
      if (window.innerWidth <= 750) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }
    };
    
    // Set initial viewport height
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Cleanup: remove event listeners when component unmounts
    return () => {
      gameWrapper.removeEventListener('touchmove', preventTouchMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      // Reset viewport height
      document.documentElement.style.removeProperty('--vh');
    };
  }, []);

  return (
    <div className={`${gameScreenStyles.gameWrapper} ${isMinimized ? gameScreenStyles.minimized : ''}`}>
      <div className={gameScreenStyles.gameInfo}>
        <div className={gameScreenStyles.score}>
          <span className={gameScreenStyles.scoreLabel}>Score:</span>
          <span className={`${gameScreenStyles.scoreValue} ${scoreAnimation ? gameScreenStyles.increase : ''}`}>
            {score}
          </span>
        </div>
        {timeAttackMode && (
          <div className={gameScreenStyles.timer}>
            <span className={gameScreenStyles.timerLabel}>⏱️ Time:</span>
            <span className={`${gameScreenStyles.timerValue} ${timeRemaining <= 10 ? gameScreenStyles.timerWarning : ''} ${timeRemaining <= 5 ? gameScreenStyles.timerCritical : ''}`}>
              {timeRemaining}s
            </span>
            {timeRemaining <= 5 && (
              <span className={gameScreenStyles.timerCountdown}>⚠️</span>
            )}
          </div>
        )}
        {!timeAttackMode && (
          <div className={gameScreenStyles.health}>
            {Array.from({ length: 3 }).map((_, index) => (
              <span 
                key={index} 
                className={`${gameScreenStyles.heart} ${health > index ? gameScreenStyles.activeHeart : gameScreenStyles.inactiveHeart}`}
                title={`${health > index ? 'Active' : 'Lost'} life`}
              >
                ❤️
              </span>
            ))}
          </div>
        )}
        <div className={gameScreenStyles.gameControls}>
          <button
            className={`${sharedStyles.button} ${gameScreenStyles.viewToggleButton}`}
            onClick={() => {
              playMenuClickSound();
              setIsMinimized(!isMinimized);
            }}
            title={isMinimized ? "Fullscreen" : "Minimize"}
            aria-label={isMinimized ? "Switch to fullscreen view" : "Switch to minimized view"}
          >
            {isMinimized ? "⛶" : "⛶"}
          </button>
          {(infiniteMode || regionalInfiniteMode) && !timeAttackMode && (
            <button
              className={`${sharedStyles.button} ${gameScreenStyles.endGameButton}`}
              onClick={() => {
                playMenuClickSound();
                endInfiniteMode();
              }}
              title="End Game"
            >
              🏁 End
            </button>
          )}
        </div>
      </div>

      {currentFlag && (
        <div className={`${gameScreenStyles.flagContainer} ${flagTransitioning ? sharedStyles.transitioning : ''}`}>
          {(gameType === "flag-to-country" || regionalGameType === "flag-to-region") ? (
            // Show flag image for flag-to-country or flag-to-region mode (Site4 style)
            <>
              {isFlagLoading && <div className={sharedStyles.loadingSpinner}></div>}
              <img
                src={currentFlag.image_url}
                alt={currentFlag.name}
                className={`${gameScreenStyles.flagImage} ${flagTransitioning ? sharedStyles.transitioning : ''}`}
                onLoad={() => {
                  console.log('🖼️ Flag image loaded:', {
                    flagId: lastFlagId,
                    isFlagHidden,
                    isFlagLoading
                  });
                  handleFlagLoad(lastFlagId);
                }}
                onError={() => handleFlagError(lastFlagId, currentFlag.name)}
                style={{ 
                  display: (isFlagLoading || isFlagHidden) ? 'none' : 'block',
                  opacity: isFlagHidden ? 0 : 1,
                  transition: 'opacity 0.1s ease-out'
                }}
              />
            </>
          ) : (
            // Show name for country-to-flag or region-to-flag mode
            <div key={currentFlag.name} className={`${gameScreenStyles.countryText} ${flagTransitioning ? sharedStyles.transitioning : ''}`}>
              {currentFlag.name}
            </div>
          )}
        </div>
      )}

      <div className={`${gameScreenStyles.optionsContainer} ${optionsTransitioning ? sharedStyles.transitioning : ''}`}>
        {(gameType === "flag-to-country" || regionalGameType === "flag-to-region") ? (
          // Check if typing mode is active
          (gameMode === "standard" && typingMode) || (gameMode === "regional" && regionalTypingMode) ? (
            // Show text input for typing mode
            <div className={gameScreenStyles.typingInputContainer}>
              <input
                ref={typingInputRef}
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !buttonsDisabled && typedAnswer.trim()) {
                    checkAnswer(typedAnswer.trim());
                  }
                }}
                onFocus={(e) => {
                  // Don't scroll - let CSS handle layout adjustments
                  // The viewport height tracking will handle keyboard appearance
                }}
                placeholder="Type the answer..."
                className={`${gameScreenStyles.typingInput} ${optionsTransitioning ? sharedStyles.transitioning : ''} ${typingInputStyle}`}
                disabled={buttonsDisabled}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="words"
                spellCheck="false"
                inputMode="text"
                enterKeyHint="send"
              />
              <button
                onClick={() => {
                  if (!buttonsDisabled && typedAnswer.trim()) {
                    checkAnswer(typedAnswer.trim());
                  }
                }}
                className={`${sharedStyles.button} ${gameScreenStyles.submitButton}`}
                disabled={buttonsDisabled || !typedAnswer.trim()}
                type="button"
              >
                Submit
              </button>
            </div>
          ) : (
            // Show names as buttons for multiple choice mode
            options.map((name, index) => (
              <button
                key={index}
                onClick={() => checkAnswer(name)}
                className={`${sharedStyles.button} ${gameScreenStyles.guessButton} ${gameScreenStyles.optionsTransition} ${buttonStyles[name] || ''} ${optionsTransitioning ? sharedStyles.transitioning : ''}`}
                disabled={buttonsDisabled}
              >
                {name}
              </button>
            ))
          )
        ) : (
          // Show flag images as buttons for country-to-flag or region-to-flag mode (optimized)
          <>
            {flagOptions.map((flag, index) => (
              <button
                key={`${flag.id}-${index}`}
                onClick={() => checkAnswer(flag.id)}
                className={`${sharedStyles.button} ${gameScreenStyles.flagGuessButton} ${gameScreenStyles.optionsTransition} ${buttonStyles[flag.id] || ''} ${optionsTransitioning ? sharedStyles.transitioning : ''}`}
                disabled={buttonsDisabled}
              >
                {!imageCache.current.has(flag.image_url) && (
                  <div className={gameScreenStyles.flagLoadingPlaceholder} />
                )}
                <img
                  src={flag.image_url}
                  alt={flag.name}
                  onLoad={() => handleFlagLoad(flag.id)}
                  onError={() => handleFlagError(flag.id, flag.name)}
                  style={{
                    opacity: imageCache.current.has(flag.image_url) ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                />
              </button>
            ))}
          </>
        )}
      </div>

      {message && (
        <p className={`${sharedStyles.message} ${messageTransitioning ? sharedStyles.transitioning : ''} ${
          message.includes("Game Over")
            ? sharedStyles.gameOver
            : message.includes("Correct")
            ? sharedStyles.correct
            : sharedStyles.incorrect
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}
