/**
 * Challenge service for challenge-related API calls
 * Handles challenge loading, submission, and sharing
 */

/**
 * Submit challenge score to API
 * @param {string} challengeCode - Challenge code
 * @param {string} playerName - Player name
 * @param {Object} gameStats - Game statistics
 * @returns {Promise<Object>} Submission result
 */
export const submitChallengeScore = async (challengeCode, playerName, gameStats) => {
  try {
    const response = await fetch('/api/challenges/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challengeCode: challengeCode,
        playerName: playerName.trim(),
        gameStats: gameStats
      })
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Handle specific error cases
      if (response.status === 409) {
        // Duplicate submission - one attempt per session only
        const message = error.existing_score !== undefined
          ? `You already submitted a score of ${error.existing_score}. ${error.error}`
          : error.error || 'You have already submitted a score for this challenge. Only one attempt is allowed per session.';
        return { success: false, error: message, status: 409 };
      }
      
      throw new Error(error.error || 'Failed to submit score');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error submitting challenge score:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load challenge from API
 * @param {string} challengeCode - Challenge code
 * @returns {Promise<Object>} Challenge data with results
 */
export const loadChallenge = async (challengeCode) => {
  try {
    const response = await fetch(`/api/challenges/get?code=${challengeCode}`);
    
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 404) {
        return { success: false, error: 'Challenge not found', status: 404 };
      } else if (response.status === 410) {
        return { success: false, error: 'Challenge has expired', status: 410 };
      } else {
        return { success: false, error: error.error || 'Failed to load challenge', status: response.status };
      }
    }

    const { challenge, results } = await response.json();
    return { success: true, challenge, results: results || [] };
  } catch (error) {
    console.error('Error loading challenge:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a new challenge
 * @param {Object} gameStats - Game statistics
 * @param {Object} gameStateSnapshot - Game state snapshot
 * @param {number} expiresInDays - Number of days until expiration (default 7)
 * @returns {Promise<Object>} Created challenge data
 */
export const createChallenge = async (gameStats, gameStateSnapshot, expiresInDays = 7) => {
  try {
    const response = await fetch('/api/challenges/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameStats,
        gameStateSnapshot,
        expiresInDays
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create challenge');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating challenge:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user has played a challenge
 * @param {string} challengeCode - Challenge code
 * @returns {boolean} Whether user has played this challenge
 */
export const hasPlayedChallenge = (challengeCode) => {
  try {
    const playedChallenges = JSON.parse(localStorage.getItem('playedChallenges') || '[]');
    return playedChallenges.some(c => c.code === challengeCode);
  } catch (error) {
    console.error('Error checking played challenges:', error);
    return false;
  }
};

/**
 * Save challenge to played challenges list
 * @param {string} challengeCode - Challenge code
 * @param {number} score - Score achieved
 */
export const savePlayedChallenge = (challengeCode, score) => {
  try {
    const playedChallenges = JSON.parse(localStorage.getItem('playedChallenges') || '[]');
    if (!playedChallenges.find(c => c.code === challengeCode)) {
      playedChallenges.push({
        code: challengeCode,
        date: new Date().toISOString(),
        score: score
      });
      localStorage.setItem('playedChallenges', JSON.stringify(playedChallenges));
    }
  } catch (error) {
    console.error('Error saving played challenge:', error);
  }
};

/**
 * Get created challenges from localStorage
 * @returns {Array} Array of created challenges
 */
export const getCreatedChallenges = () => {
  try {
    return JSON.parse(localStorage.getItem('createdChallenges') || '[]');
  } catch (error) {
    console.error('Error getting created challenges:', error);
    return [];
  }
};

/**
 * Save created challenge to localStorage
 * @param {Object} challengeData - Challenge data to save
 */
export const saveCreatedChallenge = (challengeData) => {
  try {
    const createdChallenges = JSON.parse(localStorage.getItem('createdChallenges') || '[]');
    createdChallenges.push(challengeData);
    localStorage.setItem('createdChallenges', JSON.stringify(createdChallenges));
  } catch (error) {
    console.error('Error saving created challenge:', error);
  }
};
