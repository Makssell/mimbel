import * as SQLite from "expo-sqlite";

// Open database (same instance as sync service)
const db = SQLite.openDatabaseSync("mimbel.db");

/**
 * Database service for game history and best scores
 * Handles local-only data (not synced to Supabase)
 */
class DatabaseService {
  /**
   * Save game to history
   * @param {Object} gameStats - Game statistics
   * @param {Object} gameSettings - Game settings
   */
  saveGameHistory(gameStats, gameSettings) {
    try {
      const gameData = JSON.stringify({
        gameSettings,
        stats: {
          longestStreak: gameStats.longestStreak || 0,
          averageTimePerGuess: gameStats.averageTimePerGuess || 0,
          fastestGuess: gameStats.fastestGuess || null,
        }
      });

      db.runSync(
        `INSERT INTO game_history (game_mode, game_type, score, total_attempts, accuracy, time_elapsed, game_data) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          gameSettings?.gameMode || 'standard',
          gameSettings?.gameType || 'flag-to-country',
          gameStats.score || 0,
          gameStats.totalAttempts || 0,
          parseFloat(gameStats.accuracy || 0),
          gameStats.timeElapsed || 0,
          gameData
        ]
      );

      // Also update best score if this is a new best
      this.updateBestScore(gameStats, gameSettings);
    } catch (error) {
      console.error("Error saving game history:", error);
    }
  }

  /**
   * Update best score if this is a new record
   */
  updateBestScore(gameStats, gameSettings) {
    try {
      const gameMode = gameSettings?.gameMode || 'standard';
      const gameType = gameSettings?.gameType || 'flag-to-country';

      // Check current best score
      const currentBest = db.getFirstSync(
        `SELECT score FROM best_scores WHERE game_mode = ? AND game_type = ?`,
        [gameMode, gameType]
      );

      const currentScore = gameStats.score || 0;
      const bestScore = currentBest ? currentBest.score : 0;

      if (currentScore > bestScore) {
        // New best score!
        const gameData = JSON.stringify({
          gameSettings,
          stats: {
            longestStreak: gameStats.longestStreak || 0,
            averageTimePerGuess: gameStats.averageTimePerGuess || 0,
            fastestGuess: gameStats.fastestGuess || null,
          }
        });

        db.runSync(
          `INSERT OR REPLACE INTO best_scores (game_mode, game_type, score, game_data) 
           VALUES (?, ?, ?, ?)`,
          [gameMode, gameType, currentScore, gameData]
        );
      }
    } catch (error) {
      console.error("Error updating best score:", error);
    }
  }

  /**
   * Get game history
   * @param {number} limit - Number of games to return
   * @returns {Array} Array of game history records
   */
  getGameHistory(limit = 50) {
    try {
      const history = db.getAllSync(
        `SELECT * FROM game_history ORDER BY created_at DESC LIMIT ?`,
        [limit]
      );
      return history.map(record => ({
        ...record,
        game_data: JSON.parse(record.game_data || '{}'),
      }));
    } catch (error) {
      console.error("Error getting game history:", error);
      return [];
    }
  }

  /**
   * Get best scores
   * @returns {Object} Object with best scores keyed by game_mode and game_type
   */
  getBestScores() {
    try {
      const scores = db.getAllSync(
        `SELECT * FROM best_scores ORDER BY score DESC`
      );
      
      const bestScores = {};
      scores.forEach(record => {
        const key = `${record.game_mode}_${record.game_type}`;
        bestScores[key] = {
          ...record,
          game_data: JSON.parse(record.game_data || '{}'),
        };
      });
      
      return bestScores;
    } catch (error) {
      console.error("Error getting best scores:", error);
      return {};
    }
  }

  /**
   * Clear game history
   */
  clearGameHistory() {
    try {
      db.runSync(`DELETE FROM game_history`);
      return { success: true };
    } catch (error) {
      console.error("Error clearing game history:", error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export default new DatabaseService();
