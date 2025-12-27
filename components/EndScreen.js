/**
 * EndScreen Component
 * Displays the end game screen with stats, settings, and action buttons
 */

import { useState } from "react";
import sharedStyles from "../styles/shared.module.css";
import endScreenStyles from "../styles/endScreen.module.css";
import { formatTimeDisplay } from "../utils/gameUtils";
import ShareModal from "./ShareModal";
import { generateShareUrl, copyToClipboard } from "../utils/shareUtils";

export default function EndScreen({
  // State
  showEndScreen,
  endState,
  gameStats,
  gameStateSnapshot,
  gameMode,
  regionalInfiniteMode,
  infiniteMode,
  isChallengeMode,
  challengeData,
  // Setters
  setShowEndScreen,
  setShowChallengeScreen,
  setChallengeResults,
  setHasPlayedChallenge,
  setIsChallengeMode,
  setChallengeData,
  setChallengePlayerName,
  setChallengeScoreSubmitted,
  setGameStarted,
  setMenuStep,
  setGameMode,
  setGameType,
  setRegionalGameType,
  setSelectedRegionalCountry,
  setSelectedDivisionTypes,
  setGameStats,
  setEndState,
  setTimeAttackMode,
  setRegionalInfiniteMode,
  setInfiniteMode,
  setRegionalFlags,
  setFilteredRegionalFlags,
  setSelectedContinent,
  setIncludeTerritories,
  setFilteredFlags,
  setMessage,
  // Functions
  handleShareChallenge,
  startGame,
  playMenuClickSound
}) {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShareSettings = async () => {
    if (!gameStateSnapshot || !gameStateSnapshot.gameMode) {
      setMessage('No game settings to share. Please finish a game first.');
      return;
    }

    try {
      const shareUrl = generateShareUrl(gameStateSnapshot);
      const success = await copyToClipboard(shareUrl);
      
      if (success) {
        setMessage('Share link copied to clipboard!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to copy link. Please try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error generating share URL:', error);
      setMessage('Error generating share link. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCreateChallenge = () => {
    handleShareChallenge();
  };

  if (!showEndScreen) return null;

  return (
    <div className={endScreenStyles.endScreen}>
      {(() => {
        console.log('End screen remaining flags calculation:', {
          gameStatsRemainingFlags: gameStats.remainingFlags,
          calculatedRemaining: gameStats.totalFlags - gameStats.remainingFlags,
          finalRemaining: gameStats.remainingFlags !== undefined ? gameStats.remainingFlags : 0
        });
        return null;
      })()}
      <div className={endScreenStyles.endScreenContent}>
        <div className={endScreenStyles.endScreenHeader}>
          
          {endState === "ranOutOfHearts" && (
            <>
              <div className={`${endScreenStyles.endStateIcon} ${endScreenStyles.gameOverIcon}`}>💀</div>
              <h2 className={endScreenStyles.endStateTitle}>Game Over!</h2>
              <p className={endScreenStyles.endStateSubtitle}>
                {isChallengeMode ? "Challenge attempt complete!" : "You ran out of hearts!"}
              </p>
            </>
          )}
          {endState === "allCompleted" && (
            <>
              <div className={`${endScreenStyles.endStateIcon} ${endScreenStyles.completedIcon}`}>🏆</div>
              <h2 className={endScreenStyles.endStateTitle}>All Done!</h2>
              <p className={endScreenStyles.endStateSubtitle}>
                {isChallengeMode ? "Challenge completed! See your score on the leaderboard." : "You've completed all flags!"}
              </p>
            </>
          )}
          {endState === "infiniteMode" && (
            <>
              <div className={`${endScreenStyles.endStateIcon} ${endScreenStyles.infiniteIcon}`}>♾️</div>
              <h2 className={endScreenStyles.endStateTitle}>Run Complete!</h2>
              <p className={endScreenStyles.endStateSubtitle}>
                {isChallengeMode ? "Challenge attempt complete! See your score on the leaderboard." : "Great job on your infinite run!"}
              </p>
            </>
          )}
          {endState === "timeAttack" && (
            <>
              <div className={`${endScreenStyles.endStateIcon} ${endScreenStyles.timeAttackIcon}`}>⏱️</div>
              <h2 className={endScreenStyles.endStateTitle}>Time's Up!</h2>
              <p className={endScreenStyles.endStateSubtitle}>
                {isChallengeMode ? "Challenge attempt complete! See your score on the leaderboard." : "Great job on your time attack run!"}
              </p>
            </>
          )}
        </div>

        <div className={endScreenStyles.quickStatsSection}>
          <div className={endScreenStyles.quickStatCard}>
            <div className={endScreenStyles.quickStatValue}>{gameStats.score}</div>
            <div className={endScreenStyles.quickStatLabel}>Points</div>
          </div>
          <div className={endScreenStyles.quickStatCard}>
            {endState === "ranOutOfHearts" ? (
              <>
                <div className={endScreenStyles.quickStatValue}>{gameStats.accuracy}%</div>
                <div className={endScreenStyles.quickStatLabel}>Accuracy</div>
              </>
            ) : endState === "allCompleted" ? (
              <>
                <div className={endScreenStyles.quickStatValue}>{formatTimeDisplay(Math.floor(gameStats.timeElapsed / 1000))}</div>
                <div className={endScreenStyles.quickStatLabel}>Completion Time</div>
              </>
            ) : endState === "infiniteMode" ? (
              <>
                <div className={endScreenStyles.quickStatValue}>{gameStats.longestStreak || 0}</div>
                <div className={endScreenStyles.quickStatLabel}>Longest Streak ⚡</div>
              </>
            ) : endState === "timeAttack" ? (
              <>
                <div className={endScreenStyles.quickStatValue}>{gameStats.averageTimePerGuess || "0.0s"}</div>
                <div className={endScreenStyles.quickStatLabel}>Avg Time per Guess ⏱️</div>
              </>
            ) : (
              <>
                <div className={endScreenStyles.quickStatValue}>{gameStats.accuracy}%</div>
                <div className={endScreenStyles.quickStatLabel}>Accuracy</div>
              </>
            )}
          </div>
        </div>

        <div className={endScreenStyles.gameSettings}>
          <h3>Game Settings</h3>
          <div className={endScreenStyles.settingsInfo}>
            <div className={endScreenStyles.settingItem}>
              <span className={endScreenStyles.endScreenSettingLabel}>Game Mode:</span>
              <span className={endScreenStyles.endScreenSettingValue}>
                {gameStats.gameSettings?.gameMode || (gameMode === "regional" ? "Regional Flags" : "Country Flags")}
              </span>
            </div>
            <div className={endScreenStyles.settingItem}>
              <span className={endScreenStyles.endScreenSettingLabel}>Game Type:</span>
              <span className={endScreenStyles.endScreenSettingValue}>
                {gameStats.gameSettings?.gameType || 
                 (gameStats.gameType === "flag-to-country" ? "Flag → Country" : 
                  gameStats.gameType === "country-to-flag" ? "Country → Flag" :
                  gameStats.gameType === "map-to-flag" ? "Map → Flag" :
                  gameStats.gameType === "flag-to-map" ? "Flag → Map" :
                  gameStats.gameType === "flag-to-region" ? "Flag → Region" :
                  gameStats.gameType === "region-to-flag" ? "Region → Flag" : "Unknown")}
              </span>
            </div>
            {gameStats.gameSettings?.country && (
              <div className={endScreenStyles.settingItem}>
                <span className={endScreenStyles.endScreenSettingLabel}>Country:</span>
                <span className={endScreenStyles.endScreenSettingValue}>
                  {gameStats.gameSettings.country}
                </span>
              </div>
            )}
            {gameStats.gameSettings?.region && (
              <div className={endScreenStyles.settingItem}>
                <span className={endScreenStyles.endScreenSettingLabel}>Region:</span>
                <span className={endScreenStyles.endScreenSettingValue}>
                  {gameStats.gameSettings.region}
                </span>
              </div>
            )}
            {gameStats.gameSettings?.territories === "Included" && (
              <div className={endScreenStyles.settingItem}>
                <span className={endScreenStyles.endScreenSettingLabel}>Territories:</span>
                <span className={endScreenStyles.endScreenSettingValue}>
                  {gameStats.gameSettings.territories}
                </span>
              </div>
            )}
            <div className={endScreenStyles.settingItem}>
              <span className={endScreenStyles.endScreenSettingLabel}>Mode:</span>
              <span className={endScreenStyles.endScreenSettingValue}>
                {gameStats.gameSettings?.mode || ((gameMode === "regional" ? regionalInfiniteMode : infiniteMode) ? "Infinite" : "Standard")}
              </span>
            </div>
            {gameStats.gameSettings?.typingMode && (
              <div className={endScreenStyles.settingItem}>
                <span className={endScreenStyles.endScreenSettingLabel}>Typing Mode:</span>
                <span className={endScreenStyles.endScreenSettingValue}>
                  Enabled
                </span>
              </div>
            )}
            {gameStats.gameSettings?.flashMode && (
              <div className={endScreenStyles.settingItem}>
                <span className={endScreenStyles.endScreenSettingLabel}>Flash Mode:</span>
                <span className={endScreenStyles.endScreenSettingValue}>
                  Enabled
                </span>
              </div>
            )}
            {(() => {
              // Show outlineOnly for map-to-flag and flag-to-map game types when enabled
              const currentGameType = gameStats.gameSettings?.gameType || 
                (gameStats.gameType === "flag-to-country" ? "Flag → Country" : 
                 gameStats.gameType === "country-to-flag" ? "Country → Flag" :
                 gameStats.gameType === "map-to-flag" ? "Map → Flag" :
                 gameStats.gameType === "flag-to-map" ? "Flag → Map" :
                 gameStats.gameType === "flag-to-region" ? "Flag → Region" :
                 gameStats.gameType === "region-to-flag" ? "Region → Flag" : "Unknown");
              const isMapGameType = currentGameType === "Map → Flag" || currentGameType === "Flag → Map";
              
              // Check outlineOnly value from gameSettings first, then fallback to gameStateSnapshot
              const outlineOnlyFromSettings = gameStats.gameSettings?.outlineOnly;
              const outlineOnlyFromSnapshot = gameStateSnapshot?.outlineOnly;
              const outlineOnlyValue = outlineOnlyFromSettings !== undefined ? outlineOnlyFromSettings : outlineOnlyFromSnapshot;
              
              // flag-to-map always has outlineOnly enabled
              const isFlagToMap = currentGameType === "Flag → Map";
              const outlineOnlyEnabled = isFlagToMap || 
                                        outlineOnlyValue === true || 
                                        outlineOnlyValue === "true" ||
                                        outlineOnlyValue === 1 ||
                                        Boolean(outlineOnlyValue);
              
              return isMapGameType && outlineOnlyEnabled ? (
                <div className={endScreenStyles.settingItem}>
                  <span className={endScreenStyles.endScreenSettingLabel}>Outline Only:</span>
                  <span className={endScreenStyles.endScreenSettingValue}>
                    Enabled
                  </span>
                </div>
              ) : null;
            })()}
          </div>
        </div>

        <div className={endScreenStyles.gameStats}>
          <h3>Statistics</h3>
          <div className={endScreenStyles.statsGrid}>
            <div className={endScreenStyles.statCard}>
              <div className={endScreenStyles.statIcon}>🎯</div>
              <div className={endScreenStyles.statContent}>
                <span className={endScreenStyles.statLabel}>Total Score</span>
                <span className={endScreenStyles.statValue}>{gameStats.score}</span>
              </div>
            </div>
            <div className={endScreenStyles.statCard}>
              <div className={endScreenStyles.statIcon}>📊</div>
              <div className={endScreenStyles.statContent}>
                <span className={endScreenStyles.statLabel}>Accuracy</span>
                <span className={endScreenStyles.statValue}>{gameStats.accuracy}%</span>
              </div>
            </div>
            <div className={endScreenStyles.statCard}>
              <div className={endScreenStyles.statIcon}>🎲</div>
              <div className={endScreenStyles.statContent}>
                <span className={endScreenStyles.statLabel}>Total Attempts</span>
                <span className={endScreenStyles.statValue}>{gameStats.totalAttempts}</span>
              </div>
            </div>
            
            {/* Mode-specific statistics */}
            {endState === "ranOutOfHearts" && (
              <>
                <div className={endScreenStyles.statCard}>
                  <div className={endScreenStyles.statIcon}>⏱️</div>
                  <div className={endScreenStyles.statContent}>
                    <span className={endScreenStyles.statLabel}>Time Elapsed</span>
                    <span className={endScreenStyles.statValue}>
                      {formatTimeDisplay(Math.floor(gameStats.timeElapsed / 1000))}
                    </span>
                  </div>
                </div>
                {!(gameMode === "regional" ? regionalInfiniteMode : infiniteMode) && (
                  <div className={endScreenStyles.statCard}>
                    <div className={endScreenStyles.statIcon}>🚩</div>
                    <div className={endScreenStyles.statContent}>
                      <span className={endScreenStyles.statLabel}>Remaining</span>
                      <span className={endScreenStyles.statValue}>
                        {gameStats.remainingFlags !== undefined ? gameStats.remainingFlags : 0}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {endState === "allCompleted" && (
              <>
                <div className={endScreenStyles.statCard}>
                  <div className={endScreenStyles.statIcon}>🏁</div>
                  <div className={endScreenStyles.statContent}>
                    <span className={endScreenStyles.statLabel}>Completion Time</span>
                    <span className={endScreenStyles.statValue}>
                      {formatTimeDisplay(Math.floor(gameStats.timeElapsed / 1000))}
                    </span>
                  </div>
                </div>
                <div className={endScreenStyles.statCard}>
                  <div className={endScreenStyles.statIcon}>⏱️</div>
                  <div className={endScreenStyles.statContent}>
                    <span className={endScreenStyles.statLabel}>Avg Time per Guess</span>
                    <span className={endScreenStyles.statValue}>
                      {gameStats.averageTimePerGuess || "0.0s"}
                    </span>
                  </div>
                </div>
              </>
            )}
            
            {endState === "infiniteMode" && (
              <>
                <div className={endScreenStyles.statCard}>
                  <div className={endScreenStyles.statIcon}>⏱️</div>
                  <div className={endScreenStyles.statContent}>
                    <span className={endScreenStyles.statLabel}>Time Elapsed</span>
                    <span className={endScreenStyles.statValue}>
                      {formatTimeDisplay(Math.floor(gameStats.timeElapsed / 1000))}
                    </span>
                  </div>
                </div>
                <div className={endScreenStyles.statCard}>
                  <div className={endScreenStyles.statIcon}>⚡</div>
                  <div className={endScreenStyles.statContent}>
                    <span className={endScreenStyles.statLabel}>Longest Streak</span>
                    <span className={endScreenStyles.statValue}>
                      {gameStats.longestStreak || 0}
                    </span>
                  </div>
                </div>
              </>
            )}
            
            {endState === "timeAttack" && (
              <>
                <div className={endScreenStyles.statCard}>
                  <div className={endScreenStyles.statIcon}>⏱️</div>
                  <div className={endScreenStyles.statContent}>
                    <span className={endScreenStyles.statLabel}>Avg Time per Guess</span>
                    <span className={endScreenStyles.statValue}>
                      {gameStats.averageTimePerGuess || "0.0s"}
                    </span>
                  </div>
                </div>
                <div className={endScreenStyles.statCard}>
                  <div className={endScreenStyles.statIcon}>🏃</div>
                  <div className={endScreenStyles.statContent}>
                    <span className={endScreenStyles.statLabel}>Fastest Guess</span>
                    <span className={endScreenStyles.statValue}>
                      {gameStats.fastestGuess || "0.0s"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {isChallengeMode ? (
          <>
            <div className={endScreenStyles.endScreenActions}>
              <button
                className={`${sharedStyles.button} ${sharedStyles.mainButton}`}
                onClick={async () => {
                  playMenuClickSound();
                  setShowEndScreen(false);
                  // Reload challenge to update state
                  if (challengeData) {
                    try {
                      const response = await fetch(`/api/challenges/get?code=${challengeData.challenge_code}`);
                      if (response.ok) {
                        const { challenge, results } = await response.json();
                        setChallengeResults(results || []);
                        // Check if user has played
                        const playedChallenges = JSON.parse(localStorage.getItem('playedChallenges') || '[]');
                        const hasPlayed = playedChallenges.some(c => c.code === challengeData.challenge_code);
                        setHasPlayedChallenge(hasPlayed);
                      }
                    } catch (error) {
                      console.error('Error reloading challenge:', error);
                    }
                  }
                  setShowChallengeScreen(true);
                }}
              >
                View Leaderboard
              </button>
              <button
                className={`${sharedStyles.button} ${sharedStyles.secondaryButton}`}
                onClick={() => {
                  playMenuClickSound();
                  setShowEndScreen(false);
                  setShowChallengeScreen(false);
                  setIsChallengeMode(false);
                  setChallengeData(null);
                  setChallengeResults([]);
                  setChallengePlayerName('');
                  setChallengeScoreSubmitted(false);
                  setHasPlayedChallenge(false);
                  setMenuStep(0);
                  setGameMode("standard");
                  setGameType(null);
                  setGameStarted(false);
                }}
              >
                Go to Main Menu
              </button>
            </div>
          </>
        ) : (
          <div className={endScreenStyles.endScreenActions}>
            <button
              className={`${sharedStyles.button} ${sharedStyles.secondaryButton}`}
              onClick={() => {
                playMenuClickSound();
                setShowEndScreen(false);
                setGameStarted(false);
                setMenuStep(0);
                setGameMode("standard");
                setGameType(null);
                setRegionalGameType(null);
                setSelectedRegionalCountry(null);
                setSelectedDivisionTypes([]);
              }}
            >
              New Game
            </button>
            <button
              className={`${sharedStyles.button} ${sharedStyles.secondaryButton}`}
              onClick={() => {
                playMenuClickSound();
                setShowShareModal(true);
              }}
            >
              🔗
            </button>
            <button
              className={`${sharedStyles.button} ${sharedStyles.mainButton}`}
              onClick={async () => {
                playMenuClickSound();
                
                // Hide the end screen immediately
                setShowEndScreen(false);
                setGameStats({});
                setEndState(null);
                
                // Restore the game state from the snapshot for the new game
                if (gameStateSnapshot.gameMode) {
                  console.log('Play Again: Restoring game state from snapshot:', gameStateSnapshot);
                  
                  // Restore all the game settings
                  setGameMode(gameStateSnapshot.gameMode);
                  setTimeAttackMode(gameStateSnapshot.timeAttackMode);
                  setRegionalInfiniteMode(gameStateSnapshot.regionalInfiniteMode);
                  setInfiniteMode(gameStateSnapshot.infiniteMode);
                  
                  if (gameStateSnapshot.gameMode === "regional") {
                    setRegionalGameType(gameStateSnapshot.gameType);
                    setSelectedRegionalCountry(gameStateSnapshot.selectedRegionalCountry);
                    setRegionalFlags(gameStateSnapshot.regionalFlags);
                    setFilteredRegionalFlags(gameStateSnapshot.regionalFlags);
                  } else {
                    setGameType(gameStateSnapshot.gameType);
                    setSelectedContinent(gameStateSnapshot.selectedContinent);
                    setIncludeTerritories(gameStateSnapshot.includeTerritories);
                    setFilteredFlags(gameStateSnapshot.filteredFlags);
                  }
                }
                
                // Wait a moment to ensure state updates are processed
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Start the new game (this will reset all game state)
                await startGame();
              }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShareSettings={handleShareSettings}
        onCreateChallenge={handleCreateChallenge}
        playMenuClickSound={playMenuClickSound}
      />
    </div>
  );
}
