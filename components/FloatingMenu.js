/**
 * FloatingMenu Component
 * Floating menu button with dropdown for games, feedback, help, and challenges
 */

import sharedStyles from "../styles/shared.module.css";
import modalsStyles from "../styles/modals.module.css";

const FloatingMenu = ({
  showFloatingMenu,
  setShowFloatingMenu,
  setModalType,
  setShowModal,
  setGamesView,
  playMenuClickSound
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
