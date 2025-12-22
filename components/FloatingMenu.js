/**
 * FloatingMenu Component
 * Floating menu button with dropdown for games, feedback, help, and challenges
 */

import { useMemo } from "react";
import sharedStyles from "../styles/shared.module.css";
import modalsStyles from "../styles/modals.module.css";

const FloatingMenu = ({
  showFloatingMenu,
  setShowFloatingMenu,
  setModalType,
  setShowModal,
  setGamesView,
  playMenuClickSound,
  gameHistory,
  bestScores,
  hasActiveGame,
  activeGame,
  gamesModalLastOpened
}) => {
  const handleFeedback = () => {
    console.log('Feedback clicked');
    playMenuClickSound();
    setModalType('feedback');
    setShowModal(true);
  };

  const handleHelp = () => {
    console.log('Help clicked');
    playMenuClickSound();
    setModalType('help');
    setShowModal(true);
  };

  // Check if there are active game changes since GamesModal was last opened
  const hasGamesChanges = useMemo(() => {
    // Only show notification if there's currently an active game
    if (!hasActiveGame) {
      return false;
    }

    if (!gamesModalLastOpened) {
      // If modal was never opened and there's an active game, show notification
      return true;
    }

    // Compare current active game state with snapshot
    const snapshot = gamesModalLastOpened;
    
    // Check for active game changes
    const hasActiveGameChange = hasActiveGame !== snapshot.hasActiveGame ||
      (hasActiveGame && activeGame && snapshot.activeGame && 
       (activeGame.id !== snapshot.activeGame.id || 
        activeGame.gameStats.score !== snapshot.activeGame.gameStats.score ||
        activeGame.timestamp !== snapshot.activeGame.timestamp));

    return hasActiveGameChange;
  }, [hasActiveGame, activeGame, gamesModalLastOpened]);

  const handleGames = () => {
    console.log('Games clicked');
    playMenuClickSound();
    setModalType('games');
    setShowModal(true);
    setGamesView('history'); // Default to history view
  };

  // const handleChallenges = () => {
  //   console.log('Challenges clicked');
  //   playMenuClickSound();
  //   setModalType('challenges');
  //   setShowModal(true);
  // };

  return (
    <div className={modalsStyles.floatingMenuContainer}>
      {/* Main floating button */}
      <button
        className={modalsStyles.floatingMenuButton}
        onClick={() => {
          playMenuClickSound();
          setShowFloatingMenu(!showFloatingMenu);
        }}
        aria-label="Open menu"
        title="Menu"
      >
        🌍
        {hasGamesChanges && (
          <span className={modalsStyles.floatingMenuNotification} aria-label="New games updates"></span>
        )}
      </button>
      
      {/* Dropdown menu */}
      {showFloatingMenu && (
        <div className={modalsStyles.floatingMenuDropdown}>
          <button
            className={modalsStyles.floatingMenuItem}
            onClick={handleGames}
            aria-label="View games"
          >
            🎮 Games
          </button>
          <button
            className={modalsStyles.floatingMenuItem}
            onClick={handleFeedback}
            aria-label="Send feedback"
          >
            💬 Feedback
          </button>
          <button
            className={modalsStyles.floatingMenuItem}
            onClick={handleHelp}
            aria-label="Get help"
          >
            ❓ Help
          </button>
          {/* <button
            className={modalsStyles.floatingMenuItem}
            onClick={handleChallenges}
            aria-label="View challenges"
          >
            🎯 Challenges
          </button> */}
        </div>
      )}
    </div>
  );
};

export default FloatingMenu;
