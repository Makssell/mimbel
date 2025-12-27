/**
 * GamesModal Component
 * Modal for viewing game history and best scores
 */

import { useState, useEffect } from "react";
import sharedStyles from "../styles/shared.module.css";
import modalsStyles from "../styles/modals.module.css";
import { formatGameDate, formatTimeDisplay, getDivisionTypeNames, areAllDivisionsSelected } from "../utils/gameUtils";

const GamesModal = ({
  setShowModal,
  gamesView,
  setGamesView,
  hasActiveGame,
  activeGame,
  gameHistory,
  bestScores,
  regionalDivisionTypes,
  regionalCountries,
  clearActiveGame,
  continueActiveGame,
  playMenuClickSound,
  setModalType,
  setGamesModalLastOpened
}) => {
  // Update snapshot when modal opens (only on mount since modal is conditionally rendered)
  useEffect(() => {
    // Create a snapshot of current state
    const snapshot = {
      gameHistory: gameHistory.map(g => ({ id: g.id, timestamp: g.timestamp })),
      bestScores: Object.keys(bestScores).reduce((acc, key) => {
        acc[key] = {
          score: bestScores[key].score,
          achievedAt: bestScores[key].achievedAt
        };
        return acc;
      }, {}),
      hasActiveGame,
      activeGame: activeGame ? {
        id: activeGame.id,
        timestamp: activeGame.timestamp,
        gameStats: {
          score: activeGame.gameStats.score
        }
      } : null
    };
    setGamesModalLastOpened(snapshot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount (when modal opens)
  const handleViewChange = (view) => {
    playMenuClickSound();
    setGamesView(view);
  };

  const renderGameHistory = () => {
    // Show active game at the top if it exists
    const activeGameSection = hasActiveGame && activeGame && !activeGame.gameStats.gameSettings.mode.includes('Time Attack') ? (
      <div className={modalsStyles.activeGameSection}>
        <div className={modalsStyles.activeGameHeader}>
          <h3>🎮 Active Game</h3>
          <span className={modalsStyles.activeGameBadge}>LIVE</span>
        </div>
        <div className={modalsStyles.activeGameItem}>
          <div className={modalsStyles.activeGameMain}>
            <div className={modalsStyles.activeGamePrimary}>
              <div className={modalsStyles.activeGameMode}>
                {activeGame.gameStats.gameSettings.mode}
                {activeGame.gameStats.gameSettings.typingMode && (
                  <span>, Typing</span>
                )}
                {activeGame.gameStats.gameSettings.flashMode && (
                  <span>, Flash</span>
                )}
                {activeGame.gameStats.gameSettings.outlineOnly && (
                  <span>, Outline Only</span>
                )}
              </div>
              <div className={modalsStyles.activeGameType}>
                {activeGame.gameStats.gameSettings.gameType}
              </div>
            </div>
            <div className={modalsStyles.activeGameSecondary}>
              <div className={modalsStyles.activeGameRegion}>
                {activeGame.gameStats.gameSettings.region || activeGame.gameStats.gameSettings.country}
                {activeGame.gameStats.gameSettings.territories && (
                  <span className={modalsStyles.activeGameTerritories}>
                    {activeGame.gameStats.gameSettings.territories === "Included" ? " 🏝️" : ""}
                  </span>
                )}
                {activeGame.gameStats.gameSettings.divisionTypes && (
                  areAllDivisionsSelected(
                    activeGame.gameStats.gameSettings.country, 
                    activeGame.gameStats.gameSettings.divisionTypes,
                    regionalCountries,
                    regionalDivisionTypes
                  ) ? (
                    <span className={modalsStyles.activeGameDivisionTypes}>
                      All divisions
                    </span>
                  ) : (
                    <span className={modalsStyles.activeGameDivisionTypes}>
                      {getDivisionTypeNames(activeGame.gameStats.gameSettings.divisionTypes, regionalDivisionTypes)}
                    </span>
                  )
                )}
                {activeGame.gameStats.gameSettings.gameMode === "Regional Flags" && !activeGame.gameStats.gameSettings.divisionTypes && (
                  <span className={modalsStyles.activeGameDivisionTypes}>
                    All divisions
                  </span>
                )}
              </div>
              <div className={modalsStyles.activeGamePaused}>
                Paused {formatGameDate(activeGame.timestamp)}
              </div>
            </div>
          </div>
          <div className={modalsStyles.activeGameStats}>
            <div className={modalsStyles.activeGameStat}>
              <span className={modalsStyles.activeGameStatValue}>{activeGame.gameStats.score}</span>
              <span className={modalsStyles.activeGameStatLabel}>Score</span>
            </div>
            <div className={modalsStyles.activeGameStat}>
              <span className={modalsStyles.activeGameStatValue}>{activeGame.gameStats.accuracy}%</span>
              <span className={modalsStyles.activeGameStatLabel}>Accuracy</span>
            </div>
            <div className={modalsStyles.activeGameStat}>
              <span className={modalsStyles.activeGameStatValue}>
                {formatTimeDisplay(Math.floor(activeGame.gameStats.timeElapsed / 1000))}
              </span>
              <span className={modalsStyles.activeGameStatLabel}>Time</span>
            </div>
          </div>
          <div className={modalsStyles.activeGameActions}>
            <button
              className={`${sharedStyles.button} ${sharedStyles.mainButton}`}
              onClick={() => continueActiveGame(activeGame)}
            >
              ▶️ Continue
            </button>
            <button
              className={`${sharedStyles.button} ${sharedStyles.secondaryButton}`}
              onClick={() => {
                if (window.confirm('Are you sure you want to abandon this game? Your progress will be lost.')) {
                  clearActiveGame();
                  setModalType('games');
                  setShowModal(true);
                }
              }}
            >
              🗑️ Abandon
            </button>
          </div>
        </div>
      </div>
    ) : null;

    if (gameHistory.length === 0 && !hasActiveGame) {
      return (
        <div className={modalsStyles.emptyState}>
          <div className={modalsStyles.emptyStateIcon}>📊</div>
          <div className={modalsStyles.emptyStateTitle}>No games played yet</div>
          <div className={modalsStyles.emptyStateDescription}>Start playing to see your game history here</div>
        </div>
      );
    }

    return (
      <div className={modalsStyles.gameHistoryContainer}>
        {activeGameSection}
        {gameHistory.length > 0 && (
          <div className={modalsStyles.completedGamesSection}>
            <h3>📋 Game History</h3>
            <div className={modalsStyles.gameHistoryList}>
              {gameHistory.map((game) => (
                <div key={game.id} className={modalsStyles.gameHistoryItem}>
                  <div className={modalsStyles.gameHistoryMain}>
                    <div className={modalsStyles.gameHistoryPrimary}>
                      <div className={modalsStyles.gameHistoryMode}>
                        {game.gameStats.gameSettings.mode}
                        {game.gameStats.gameSettings.typingMode && (
                          <span>, Typing</span>
                        )}
                        {game.gameStats.gameSettings.flashMode && (
                          <span>, Flash</span>
                        )}
                        {game.gameStats.gameSettings.outlineOnly && (
                          <span>, Outline Only</span>
                        )}
                      </div>
                      <div className={modalsStyles.gameHistoryType}>
                        {game.gameStats.gameSettings.gameType}
                      </div>
                    </div>
                    <div className={modalsStyles.gameHistorySecondary}>
                      <div className={modalsStyles.gameHistoryRegion}>
                        {game.gameStats.gameSettings.region || game.gameStats.gameSettings.country}
                        {game.gameStats.gameSettings.territories && (
                          <span className={modalsStyles.gameHistoryTerritories}>
                            {game.gameStats.gameSettings.territories === "Included" ? " 🏝️" : ""}
                          </span>
                        )}
                        {game.gameStats.gameSettings.divisionTypes && (
                          areAllDivisionsSelected(
                            game.gameStats.gameSettings.country, 
                            game.gameStats.gameSettings.divisionTypes,
                            regionalCountries,
                            regionalDivisionTypes
                          ) ? (
                            <span className={modalsStyles.gameHistoryDivisionTypes}>
                              All divisions
                            </span>
                          ) : (
                            <span className={modalsStyles.gameHistoryDivisionTypes}>
                              {getDivisionTypeNames(game.gameStats.gameSettings.divisionTypes, regionalDivisionTypes)}
                            </span>
                          )
                        )}
                        {game.gameStats.gameSettings.gameMode === "Regional Flags" && !game.gameStats.gameSettings.divisionTypes && (
                          <span className={modalsStyles.gameHistoryDivisionTypes}>
                            All divisions
                          </span>
                        )}
                      </div>
                      <div className={modalsStyles.gameHistoryDate}>
                        {formatGameDate(game.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className={modalsStyles.gameHistoryStats}>
                    <div className={modalsStyles.gameHistoryStat}>
                      <span className={modalsStyles.gameHistoryStatValue}>{game.gameStats.score}</span>
                      <span className={modalsStyles.gameHistoryStatLabel}>Score</span>
                    </div>
                    <div className={modalsStyles.gameHistoryStat}>
                      <span className={modalsStyles.gameHistoryStatValue}>{game.gameStats.accuracy}%</span>
                      <span className={modalsStyles.gameHistoryStatLabel}>Accuracy</span>
                    </div>
                    <div className={modalsStyles.gameHistoryStat}>
                      <span className={modalsStyles.gameHistoryStatValue}>
                        {formatTimeDisplay(Math.floor(game.gameStats.timeElapsed / 1000))}
                      </span>
                      <span className={modalsStyles.gameHistoryStatLabel}>Time</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBestScores = () => {
    const bestScoresArray = Object.values(bestScores)
      .filter(score => score.score > 0); // Filter out games with 0 score
    
    if (bestScoresArray.length === 0) {
      return (
        <div className={modalsStyles.emptyState}>
          <div className={modalsStyles.emptyStateIcon}>🏆</div>
          <div className={modalsStyles.emptyStateTitle}>No best scores yet</div>
          <div className={modalsStyles.emptyStateDescription}>Complete games with a score greater than 0 to see your best performances here</div>
        </div>
      );
    }

    return (
      <div className={modalsStyles.bestScoresList}>
        {bestScoresArray
          .sort((a, b) => {
            // Sort by date achieved (newest first)
            return new Date(b.achievedAt) - new Date(a.achievedAt);
          })
          .map((bestScore, index) => (
            <div key={index} className={modalsStyles.bestScoreItem}>
              <div className={modalsStyles.bestScoreMain}>
                <div className={modalsStyles.bestScorePrimary}>
                  <div className={modalsStyles.bestScoreMode}>
                    {bestScore.gameSettings.mode}
                    {bestScore.gameSettings.typingMode && (
                      <span>, Typing</span>
                    )}
                    {bestScore.gameSettings.flashMode && (
                      <span>, Flash</span>
                    )}
                    {bestScore.gameSettings.outlineOnly && (
                      <span>, Outline Only</span>
                    )}
                    <span className={modalsStyles.bestScoreBadge}>🏆</span>
                  </div>
                  <div className={modalsStyles.bestScoreType}>
                    {bestScore.gameSettings.gameType}
                  </div>
                </div>
                <div className={modalsStyles.bestScoreSecondary}>
                  <div className={modalsStyles.bestScoreRegion}>
                    {bestScore.gameSettings.region || bestScore.gameSettings.country}
                    {bestScore.gameSettings.territories && (
                      <span className={modalsStyles.bestScoreTerritories}>
                        {bestScore.gameSettings.territories === "Included" ? " 🏝️" : ""}
                      </span>
                    )}
                    {bestScore.gameSettings.divisionTypes && (
                      areAllDivisionsSelected(
                        bestScore.gameSettings.country, 
                        bestScore.gameSettings.divisionTypes,
                        regionalCountries,
                        regionalDivisionTypes
                      ) ? (
                        <span className={modalsStyles.bestScoreDivisionTypes}>
                          All divisions
                        </span>
                      ) : (
                        <span className={modalsStyles.bestScoreDivisionTypes}>
                          {getDivisionTypeNames(bestScore.gameSettings.divisionTypes, regionalDivisionTypes)}
                        </span>
                      )
                    )}
                    {bestScore.gameSettings.gameMode === "Regional Flags" && !bestScore.gameSettings.divisionTypes && (
                      <span className={modalsStyles.bestScoreDivisionTypes}>
                        All divisions
                      </span>
                    )}
                  </div>
                  <div className={modalsStyles.bestScoreDate}>
                    Achieved {formatGameDate(bestScore.achievedAt)}
                  </div>
                </div>
              </div>
              <div className={modalsStyles.bestScoreStats}>
                <div className={modalsStyles.bestScoreStat}>
                  <span className={modalsStyles.bestScoreStatValue}>{bestScore.score}</span>
                  <span className={modalsStyles.bestScoreStatLabel}>Best Score</span>
                </div>
                <div className={modalsStyles.bestScoreStat}>
                  <span className={modalsStyles.bestScoreStatValue}>{bestScore.accuracy}%</span>
                  <span className={modalsStyles.bestScoreStatLabel}>Accuracy</span>
                </div>
                <div className={modalsStyles.bestScoreStat}>
                  <span className={modalsStyles.bestScoreStatValue}>
                    {formatTimeDisplay(Math.floor(bestScore.timeElapsed / 1000))}
                  </span>
                  <span className={modalsStyles.bestScoreStatLabel}>Time</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className={modalsStyles.modalOverlay} onClick={() => setShowModal(false)}>
      <div className={modalsStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={modalsStyles.modalHeader}>
          <h2>🎮 Games</h2>
          <button
            className={modalsStyles.closeButton}
            onClick={() => setShowModal(false)}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className={modalsStyles.gamesModalContent}>
          <div className={modalsStyles.gamesViewTabs}>
            <button
              className={`${modalsStyles.gamesViewTab} ${gamesView === 'history' ? modalsStyles.activeTab : ''}`}
              onClick={() => handleViewChange('history')}
            >
              📊 History
            </button>
            <button
              className={`${modalsStyles.gamesViewTab} ${gamesView === 'best' ? modalsStyles.activeTab : ''}`}
              onClick={() => handleViewChange('best')}
            >
              🏆 Best
            </button>
          </div>
          
          <div className={modalsStyles.gamesViewContent}>
            {gamesView === 'history' ? renderGameHistory() : renderBestScores()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesModal;
