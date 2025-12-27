/**
 * HelpModal Component
 * Displays help information and keyboard shortcuts
 */

import sharedStyles from "../styles/shared.module.css";
import modalsStyles from "../styles/modals.module.css";

const HelpModal = ({ setShowModal }) => {
  return (
    <div className={modalsStyles.modalOverlay} onClick={() => setShowModal(false)}>
      <div className={modalsStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={modalsStyles.modalHeader}>
          <h2>❓ Help & How to Play</h2>
          <button
            className={modalsStyles.closeButton}
            onClick={() => setShowModal(false)}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className={modalsStyles.modalContent}>
          <div className={modalsStyles.helpSection}>
            <h3>🎯 What is This?</h3>
            <div className={modalsStyles.helpItem}>
              This is a flag guessing game where you test your knowledge of world flags, both national and regional. You can play with national flags (Country Flags mode) or regional/administrative flags (Regional Flags mode). Choose your game type, region, and settings, then start guessing!
            </div>
          </div>

          <div className={modalsStyles.helpSection}>
            <h3>⚙️ Game Setup</h3>
            <div className={modalsStyles.helpItem}>
              <strong>Step 1 - Mode:</strong> Choose between "Country Flags" (national flags and territories) or "Regional Flags" (state, province, and regional flags).
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Step 2 - Game Type:</strong> Select how you want to play - "Flag → Country" (guess the country from a flag), "Country → Flag" (guess the flag from a country name), or their regional equivalents.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Step 3 - Region/Country:</strong> Choose a continent (for Country Flags) or a specific country (for Regional Flags) to focus your game on.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Step 4 - Settings:</strong> Configure game options like Standard or Infinite mode, Time Attack, Typing mode, and territory/division inclusions. See "Game Modes Explained" below for details on each mode.
            </div>
          </div>

          <div className={modalsStyles.helpSection}>
            <h3>⌨️ Keyboard Controls</h3>
            <div className={modalsStyles.helpItem}>
              <strong>1, 2, 3, 4:</strong> Press number keys 1-4 to quickly select answer options without clicking.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Enter:</strong> Confirm your selection (works the same as clicking an answer button).
            </div>
          </div>

          <div className={modalsStyles.helpSection}>
            <h3>🎯 Interactive Elements</h3>
            <div className={modalsStyles.helpItem}>
              <strong>Progress Bar:</strong> The step indicator at the top shows your current position in the setup flow. Click on any completed step (or the current step) to jump back to that step and change your settings.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Floating Menu (🌍):</strong> The globe button in the top-right corner gives you access to Games (view your game history and best scores), send Feedback, and view this Help guide.
            </div>
          </div>

          <div className={modalsStyles.helpSection}>
            <h3>💾 Game Saving & History</h3>
            <div className={modalsStyles.helpItem}>
              <strong>Automatic Saving:</strong> Your game progress is automatically saved (except in Time Attack mode). If you leave or refresh the page, you can resume your game later.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Active Game:</strong> If you have a paused game, you'll see it in the Games modal. Click "Continue" to resume where you left off. Starting a new game will automatically overwrite your active game, or you can manually "Abandon" it if you want to clear it without starting a new game.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Game History:</strong> View all your completed games in the Games modal under the "History" tab. See your scores, accuracy, and time for each game.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Best Scores:</strong> Check the "Best" tab in the Games modal to see your top performance for each game configuration you've played.
            </div>
          </div>

          <div className={modalsStyles.helpSection}>
            <h3>🎮 Game Modes Explained</h3>
            <div className={modalsStyles.helpItem}>
              <strong>Standard Mode:</strong> Play with a limited number of lives. Make mistakes and you'll lose a life. The game ends when you run out of lives, or when all available flags have been completed.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Infinite Mode:</strong> The flag pool is infinite - the game never ends even after all available flags have been guessed. Perfect for continuous practice and extended gameplay sessions.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Time Attack:</strong> Race against a 60-second timer. See how many flags you can correctly identify before time runs out. Games in this mode are not saved.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Typing Mode:</strong> Available only in "Flag → Country" or "Flag → Region" game types. Instead of selecting from multiple choice options, type the country or region name directly. Answers are case-insensitive and spaces are ignored (e.g., "United States", "unitedstates", or "UNITED STATES" all work). Great for testing your spelling and recall!
              {/* TODO: Typing mode for map-to-flag (commented out for now) - would be: Available in "Flag → Country", "Map → Flag", or "Flag → Region" game types */}
            </div>
          </div>

          <div className={modalsStyles.helpSection}>
            <h3>🏳️ Flag Classification Rules</h3>
            <div className={modalsStyles.helpItem}>
              <strong>What is a Flag?</strong> A flag is an official symbol representing a political entity - typically a nation, territory, or administrative division. Flags included in this game are recognized symbols used to represent these entities.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Territories:</strong> Territories are regions that have some degree of autonomy (political, economic, or cultural) but are not fully independent nations. They may have their own flags while still being part of or associated with a larger country. Territories are included when they have extra autonomy, political/economic independence, or active independence movements - essentially when they self-claim to be a distinct entity.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Continental Classification:</strong> Flags can be assigned to multiple continents based on geographic, cultural, or historical connections. Countries are included in continents where they have significant ties, not just where the majority of landmass is located. This lenient approach creates larger flag pools and allows for more flexible gameplay.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Regional Flags Mode:</strong> Regional flags represent first-level administrative divisions below the national level. These are the primary subdivisions of countries (like states, provinces, regions, or autonomous communities). When multiple division types exist at the same level in a country, or special cases apply, specific options are available in the regional division selection step during setup.
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>Inclusion Philosophy:</strong> Generally, more flags make for a better flag game! However, to maintain meaningful distinctions, flags are included based on criteria like extra autonomy, political/economic independence, or independence movements. Simply being an administrative division isn't enough - there needs to be some claim to distinct identity or self-governance.
            </div>
          </div>

          <div className={modalsStyles.helpSection}>
            <h3>📝 Feedback?</h3>
            <div className={modalsStyles.helpItem}>
              Have feedback to share? Use the <strong>Feedback</strong> option in the Floating Menu (🌍) to submit:
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>🐛 Bug Report:</strong> Report issues with the game's logic or functions
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>🚩 Flag Data Error:</strong> Report incorrect flag images, names, classifications, territories, or continental assignments
            </div>
            <div className={modalsStyles.helpItem}>
              <strong>💬 General Feedback:</strong> Share your thoughts or suggest features
            </div>
          </div>

          <div className={modalsStyles.formActions}>
            <button
              type="button"
              className={`${sharedStyles.button} ${sharedStyles.mainButton}`}
              onClick={() => setShowModal(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
